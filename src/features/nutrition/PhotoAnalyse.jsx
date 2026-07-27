// @ts-check
// ─── PHOTO ANALYSE — Analyse macros par photo d'assiette ──────────────────────
// Feature Premium : 5 analyses/mois gratuites, 180/mois pour les abonnés PRO.
// Flow : Cadrer → Analyser → Vérifier les portions → Choix du repas → Journal
//
// Refonte visuelle (juillet 2026) — ce qui change et pourquoi :
//   1. Vue plein écran opaque montée en portal sur document.body. L'ancienne
//      version se posait dans le flux de la page : l'en-tête et la barre
//      d'onglets restaient visibles au-dessus du voile sombre.
//   2. Thème clair, comme le reste de l'app. L'ancienne version peignait un
//      fond sombre avec les tokens clairs (C.text sur rgba(5,8,18,.97)) :
//      titres noirs sur fond noir, donc illisibles.
//   3. Un seul déclencheur au lieu de trois éléments concurrents.
//   4. Écran de vérification : les portions s'ajustent aliment par aliment
//      (l'ancien curseur global appliquait le même facteur à tout le plat).
//   5. Le choix du repas est demandé à l'enregistrement, via ChoixRepasSheet.
//
// Contrat inchangé : props identiques, onAdd(aliment, repasId) reçoit toujours
// { n, c, p, g, l } et le compteur mensuel garde exactement la même logique.

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { I, ID } from "../../components/ui/Icon.jsx";
import { C, FONT, NUM, SPACE, TYPE, RADIUS, SHADOW, Z, MOTION } from "../../styles/tokens.js";
import { authHeaders } from "../../services/morphoService.js";
import ChoixRepasSheet from "./ChoixRepasSheet.jsx";

// ─── Constantes ───────────────────────────────────────────────────────────────
const STORAGE_KEY_PREFIX = "mc_photoAnalyses_";
const FREE_LIMIT = 5;
const PRO_LIMIT  = 180;

const PAS_GRAMMES = 10;   // incrément du stepper de portion

// Étapes annoncées pendant l'attente — elles décrivent le travail réellement
// fait côté serveur (identification puis pesée puis macros).
const ETAPES = [
  "Lecture de la photo",
  "Identification des aliments",
  "Estimation des portions",
  "Calcul des macros",
];

// ─── Helpers compteur mensuel ─────────────────────────────────────────────────

function getMonthKey() {
  const d = new Date();
  return `${STORAGE_KEY_PREFIX}${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function getUsedCount() {
  try {
    return parseInt(localStorage.getItem(getMonthKey()) || "0", 10);
  } catch { return 0; }
}

function incrementUsedCount() {
  try {
    const key = getMonthKey();
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    localStorage.setItem(key, String(current + 1));
    return current + 1;
  } catch { return 1; }
}

// ─── Conversion image en base64 ───────────────────────────────────────────────

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(/** @type {string} */ (reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Marge d'erreur affichée selon la fiabilité annoncée par le modèle ────────
const MARGE = { haute: "± 8 %", moyenne: "± 15 %", basse: "± 25 %" };

function FiabiliteBadge({ niveau }) {
  const map = {
    haute:   { label: "Estimation fiable",       color: C.green, bg: "rgba(18,183,106,0.10)" },
    moyenne: { label: "Estimation moyenne",      color: C.amber, bg: "rgba(245,158,11,0.10)" },
    basse:   { label: "Estimation approximative", color: C.red,   bg: "rgba(229,72,77,0.10)" },
  };
  const s = map[niveau] || map.moyenne;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: SPACE.xs,
      padding: "5px 9px", borderRadius: RADIUS.sm,
      background: s.bg, ...TYPE.micro, color: s.color, letterSpacing: 0,
      textTransform: "none", fontSize: 11.5,
    }}>{s.label} · {MARGE[niveau] || MARGE.moyenne}</span>
  );
}

// ─── Cadre de visée (état sans photo) ─────────────────────────────────────────
function Viseur() {
  const coin = /** @type {React.CSSProperties} */ ({
    position: "absolute", width: 26, height: 26,
    border: "2px solid rgba(255,255,255,0.55)",
  });
  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "4 / 3.2",
      borderRadius: RADIUS.xl, overflow: "hidden",
      background: "radial-gradient(120% 100% at 50% 0%, #1C2436 0%, #0B1020 70%)",
      display: "grid", placeItems: "center",
    }}>
      <span style={{ ...coin, top: 14, left: 14,  borderRight: 0, borderBottom: 0, borderRadius: "8px 0 0 0" }}/>
      <span style={{ ...coin, top: 14, right: 14, borderLeft: 0,  borderBottom: 0, borderRadius: "0 8px 0 0" }}/>
      <span style={{ ...coin, bottom: 14, left: 14,  borderRight: 0, borderTop: 0, borderRadius: "0 0 0 8px" }}/>
      <span style={{ ...coin, bottom: 14, right: 14, borderLeft: 0,  borderTop: 0, borderRadius: "0 0 8px 0" }}/>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: RADIUS.full,
          border: "1.5px dashed rgba(255,255,255,0.4)",
          display: "grid", placeItems: "center", margin: `0 auto ${SPACE.md}px`,
        }}>
          <I name="camera" size={26} color="#FFF"/>
        </div>
        <div style={{ ...TYPE.h3, color: "#FFF" }}>Cadre l'assiette entière</div>
        <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.6)", marginTop: SPACE.xs }}>
          Vue du dessus, à 30–40 cm
        </div>
      </div>
    </div>
  );
}

// ─── Barre haute ──────────────────────────────────────────────────────────────
// Définie hors du composant : une fonction recréée à chaque rendu remonterait
// tout le sous-arbre à chaque appui sur un stepper.
function Barre({ titre, sous, retour, icone, badge }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: SPACE.md,
      padding: `${SPACE.md}px ${SPACE.lg}px`,
      background: C.s1, borderBottom: `1px solid ${C.bd}`,
      paddingTop: `calc(${SPACE.md}px + env(safe-area-inset-top, 0px))`,
      flexShrink: 0,
    }}>
      <button className="tap-icon" onClick={retour} aria-label="Fermer" style={{
        width: 38, height: 38, borderRadius: RADIUS.md,
        background: C.s2, border: "none", cursor: "pointer",
        display: "grid", placeItems: "center", flexShrink: 0, color: C.text,
      }}>
        <I name={icone} size={18}/>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE.h3, color: C.text }}>{titre}</div>
        <div style={{ ...TYPE.caption, color: C.dim, marginTop: 2 }}>{sous}</div>
      </div>
      {badge}
    </div>
  );
}

// ─── Carte standard ───────────────────────────────────────────────────────────
function Carte({ children, style }) {
  return (
    <div style={{
      background: C.s1, border: `1px solid ${C.bd}`,
      borderRadius: RADIUS.xl, boxShadow: SHADOW.low,
      padding: SPACE.lg, marginBottom: SPACE.md, ...style,
    }}>{children}</div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

/**
 * @param {{
 *   onClose: () => void,
 *   onAdd: (aliment: object, repasId: string) => void,
 *   premium: boolean,
 *   setPaywall: (v: boolean) => void,
 *   push: (icon: string, titre: string, msg: string) => void,
 *   repasId?: string|null,
 *   contenuRepas?: Record<string, Array<object>>,
 * }} props
 */
export default function PhotoAnalyse({
  onClose, onAdd, premium, setPaywall, push,
  repasId = null, contenuRepas = {},
}) {
  const [step,    setStep]    = useState("cadrer");   // cadrer | analyse | verif
  const [preview, setPreview] = useState(/** @type {string|null} */ (null));
  const [base64,  setBase64]  = useState(/** @type {string|null} */ (null));
  const [result,  setResult]  = useState(/** @type {any} */ (null));
  const [items,   setItems]   = useState(/** @type {Array<any>} */ ([]));
  const [error,   setError]   = useState(/** @type {string|null} */ (null));
  const [etape,   setEtape]   = useState(0);
  const [sheet,   setSheet]   = useState(false);

  const camRef    = useRef(/** @type {HTMLInputElement|null} */ (null));
  const galRef    = useRef(/** @type {HTMLInputElement|null} */ (null));
  const abortRef  = useRef(/** @type {AbortController|null} */ (null));
  const objUrlRef = useRef(/** @type {string|null} */ (null));

  // Compteur mensuel — logique inchangée
  const usedCount  = getUsedCount();
  const remaining  = Math.max(0, FREE_LIMIT - usedCount);
  const canAnalyse = premium ? usedCount < PRO_LIMIT : remaining > 0;

  // Libération de l'URL d'aperçu + annulation d'une requête en vol
  useEffect(() => () => {
    if (objUrlRef.current) { try { URL.revokeObjectURL(objUrlRef.current); } catch {} }
    try { abortRef.current?.abort(); } catch {}
  }, []);

  // Progression des étapes pendant l'attente réseau
  useEffect(() => {
    if (step !== "analyse") return;
    setEtape(0);
    const t1 = setTimeout(() => setEtape(1), 700);
    const t2 = setTimeout(() => setEtape(2), 1800);
    const t3 = setTimeout(() => setEtape(3), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [step]);

  // ── Sélection photo ──────────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (objUrlRef.current) { try { URL.revokeObjectURL(objUrlRef.current); } catch {} }
    const url = URL.createObjectURL(file);
    objUrlRef.current = url;
    setPreview(url);
    setError(null);
    const b64 = await fileToBase64(file);
    setBase64(b64);
    setStep("cadrer");
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // permet de re-sélectionner le même fichier
  };

  // ── Lancer l'analyse ─────────────────────────────────────────────────────
  const analyser = async () => {
    if (!base64) return;
    if (!canAnalyse) { setPaywall(true); return; }

    setStep("analyse");
    setError(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ image: base64 }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur API ${res.status}`);
      }
      const data   = await res.json();
      const parsed = data.result || {};

      // Totaux recalculés en JS depuis les items : le modèle est bien meilleur
      // pour identifier et peser chaque aliment que pour deviner un total —
      // et l'arithmétique, c'est notre travail, pas le sien.
      const list = Array.isArray(parsed.items) ? parsed.items.filter(i => i && Number(i.grammes) > 0) : [];
      if (!list.length) {
        setError("Aucun aliment identifiable sur la photo. Reprends-la de plus près, à la verticale.");
        setStep("cadrer");
        return;
      }

      // On mémorise la quantité d'origine pour pouvoir ajuster chaque portion
      // sans perdre la référence du modèle.
      setItems(list.map(i => ({
        nom:       String(i.nom || "Aliment"),
        base:      Math.max(1, Math.round(Number(i.grammes) || 0)),
        grammes:   Math.max(1, Math.round(Number(i.grammes) || 0)),
        calories:  Number(i.calories)  || 0,
        proteines: Number(i.proteines) || 0,
        glucides:  Number(i.glucides)  || 0,
        lipides:   Number(i.lipides)   || 0,
      })));

      if (!premium) incrementUsedCount();
      setResult(parsed);
      setStep("verif");

    } catch (e) {
      if (e?.name === "AbortError") return;      // annulation volontaire
      setError("L'analyse n'a pas pu être générée. Vérifie ta connexion et réessaie.");
      setStep("cadrer");
    } finally {
      abortRef.current = null;
    }
  };

  const annulerAnalyse = () => {
    try { abortRef.current?.abort(); } catch {}
    setStep("cadrer");
  };

  // ── Totaux courants (recalculés à chaque ajustement de portion) ──────────
  const ratio = it => (it.base > 0 ? it.grammes / it.base : 1);
  const somme = k => items.reduce((t, it) => t + (Number(it[k]) || 0) * ratio(it), 0);
  const totaux = {
    c: somme("calories"),
    p: somme("proteines"),
    g: somme("glucides"),
    l: somme("lipides"),
  };
  const ajuste = items.some(it => it.grammes !== it.base);

  const setGrammes = (idx, delta) => {
    setItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, grammes: Math.max(0, it.grammes + delta) } : it
    ));
  };

  const retirerItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  // ── Ajouter au journal ───────────────────────────────────────────────────
  const confirmer = (repasChoisi) => {
    if (!result) return;
    const nom = String(result.nom || "Plat analysé");
    const aliment = {
      n: ajuste ? `${nom} (portions ajustées)` : nom,
      c: Math.round(totaux.c),
      p: Math.round(totaux.p),
      g: Math.round(totaux.g),
      l: Math.round(totaux.l),
    };
    onAdd(aliment, repasChoisi);
    push("", "Ajouté !", `${nom} ajouté au journal.`);
    setSheet(false);
    onClose();
  };

  const reprendre = () => {
    setStep("cadrer"); setResult(null); setItems([]); setPreview(null); setBase64(null);
    if (objUrlRef.current) { try { URL.revokeObjectURL(objUrlRef.current); } catch {} }
    objUrlRef.current = null;
  };

  // ── Sous-blocs ───────────────────────────────────────────────────────────

  // Pastille de quota — discrète, elle reprend de la couleur quand il reste peu
  const quotaBadge = (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: SPACE.xs,
      padding: "7px 10px", borderRadius: RADIUS.full,
      background: C.s1, border: `1px solid ${C.bd}`,
      ...TYPE.caption, fontWeight: 600,
      color: premium || remaining > 2 ? C.mid : C.amber,
      whiteSpace: "nowrap", ...NUM, flexShrink: 0,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: RADIUS.full,
        background: premium || remaining > 2 ? C.green : C.amber,
      }}/>
      {premium ? `${PRO_LIMIT - usedCount} restantes` : `${remaining} restante${remaining > 1 ? "s" : ""}`}
    </span>
  );

  // ── Rendu ────────────────────────────────────────────────────────────────

  const contenu = (
    <div style={{
      position: "fixed", inset: 0, zIndex: Z.screen,
      background: C.bg, fontFamily: FONT, color: C.text,
      display: "flex", flexDirection: "column",
      animation: `fadeIn ${MOTION.base} both`,
    }}>

      {/* Entrées fichier : appareil photo et galerie séparés */}
      <input ref={camRef} type="file" accept="image/*" capture="environment"
        style={{ display: "none" }} onChange={onFileChange}/>
      <input ref={galRef} type="file" accept="image/*"
        style={{ display: "none" }} onChange={onFileChange}/>

      {step === "cadrer"  && <Barre titre="Analyser un repas" sous="Estimation des macros par photo" retour={onClose} icone="close" badge={quotaBadge}/>}
      {step === "analyse" && <Barre titre="Analyse en cours" sous="Environ 6 secondes" retour={annulerAnalyse} icone="close"/>}
      {step === "verif"   && <Barre titre="Vérifie l'estimation" sous="Ajuste les portions avant d'enregistrer" retour={reprendre} icone="chevronLeft"/>}

      {/* ═══ CONTENU SCROLLABLE ═══ */}
      <div style={{ flex: 1, overflowY: "auto", padding: `${SPACE.lg}px ${SPACE.lg}px ${SPACE.xxl}px` }}>

        {/* ─── ÉTAPE 1 : CADRER ─────────────────────────────────────────── */}
        {step === "cadrer" && (
          <>
            {preview ? (
              <div style={{
                position: "relative", borderRadius: RADIUS.xl, overflow: "hidden",
                border: `1px solid ${C.bd}`,
              }}>
                <img src={preview} alt="Aperçu du repas"
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }}/>
                <button className="tap" onClick={() => camRef.current?.click()} style={{
                  position: "absolute", bottom: SPACE.md, right: SPACE.md,
                  background: "rgba(16,19,24,0.6)", border: "none",
                  borderRadius: RADIUS.md, color: "#FFF",
                  ...TYPE.caption, fontWeight: 600,
                  padding: `${SPACE.sm}px ${SPACE.md}px`, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: SPACE.xs,
                }}>
                  <I name="camera" size={14} color="#FFF"/> Reprendre
                </button>
              </div>
            ) : <Viseur/>}

            {error && (
              <div style={{
                marginTop: SPACE.md, padding: SPACE.md, borderRadius: RADIUS.lg,
                background: "rgba(229,72,77,0.10)", ...TYPE.bodySmall, color: C.red,
              }}>{error}</div>
            )}

            {/* Déclencheur + galerie */}
            <div style={{ display: "flex", gap: SPACE.md, marginTop: SPACE.lg }}>
              <button className="tap" onClick={() => camRef.current?.click()} style={{
                flex: 1, padding: SPACE.lg, border: "none", borderRadius: RADIUS.lg,
                background: `linear-gradient(135deg,${C.accent},${C.accentDk})`,
                color: "#FFF", ...TYPE.h3,
                display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
                cursor: "pointer",
              }}>
                <I name="camera" size={19} color="#FFF"/>
                {preview ? "Reprendre la photo" : "Prendre la photo"}
              </button>
              <button className="tap" onClick={() => galRef.current?.click()} style={{
                flexShrink: 0, borderRadius: RADIUS.lg, padding: `0 ${SPACE.lg}px`,
                background: C.s1, border: `1px solid ${C.bd}`,
                cursor: "pointer", color: C.mid, ...TYPE.body, fontWeight: 600,
              }}>
                Galerie
              </button>
            </div>

            {/* Analyse */}
            {!canAnalyse ? (
              <button className="tap" onClick={() => setPaywall(true)} style={{
                width: "100%", marginTop: SPACE.md, padding: SPACE.lg,
                background: C.s2, border: "none", borderRadius: RADIUS.lg,
                cursor: "pointer", color: C.mid, ...TYPE.h3,
                display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
              }}>
                <I name="lock" size={16}/> Limite atteinte · Passer au PRO
              </button>
            ) : preview ? (
              <button className="tap" onClick={analyser} style={{
                width: "100%", marginTop: SPACE.md, padding: SPACE.lg,
                background: C.ink, border: "none", borderRadius: RADIUS.lg,
                cursor: "pointer", color: "#FFF", ...TYPE.h3,
                display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
              }}>
                <I name="bolt" size={17} color="#FFF" fill/> Analyser ce repas
              </button>
            ) : null}

            {/* Conseil de cadrage — il sert la précision de l'estimation */}
            <div style={{
              marginTop: SPACE.lg, padding: SPACE.md, borderRadius: RADIUS.lg,
              background: C.s1, border: `1px solid ${C.bd}`,
              display: "flex", gap: SPACE.md, alignItems: "flex-start",
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}><I name="target" size={17} color={C.accent}/></span>
              <span style={{ ...TYPE.bodySmall, color: C.mid }}>
                <b style={{ color: C.text, fontWeight: 600 }}>Pose un repère de taille.</b> Une fourchette
                ou ta main dans le cadre, et l'estimation des portions gagne nettement en précision.
              </span>
            </div>

            {!premium && (
              <div style={{ ...TYPE.caption, color: C.dim, textAlign: "center", marginTop: SPACE.lg }}>
                {remaining} analyse{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""} ce mois ·
                {" "}{PRO_LIMIT}/mois avec Nutrition PRO
              </div>
            )}
          </>
        )}

        {/* ─── ÉTAPE 2 : ANALYSE ────────────────────────────────────────── */}
        {step === "analyse" && (
          <>
            <div style={{
              position: "relative", borderRadius: RADIUS.xl, overflow: "hidden",
              border: `1px solid ${C.bd}`, background: C.ink,
            }}>
              {preview && (
                <img src={preview} alt="Repas en cours d'analyse"
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block", opacity: 0.9 }}/>
              )}
              <div style={{
                position: "absolute", left: 0, right: 0, height: 110,
                background: `linear-gradient(180deg, rgba(60,91,255,0) 0%, rgba(60,91,255,0.35) 60%, rgba(255,255,255,0.7) 100%)`,
                animation: "mcScan 2.4s cubic-bezier(.55,0,.45,1) infinite",
                pointerEvents: "none",
              }}/>
            </div>

            <div style={{
              marginTop: SPACE.lg, background: C.s1, border: `1px solid ${C.bd}`,
              borderRadius: RADIUS.xl, padding: SPACE.lg, boxShadow: SHADOW.low,
            }}>
              {ETAPES.map((t, i) => {
                const fait  = i < etape;
                const cours = i === etape;
                return (
                  <div key={t} style={{
                    display: "flex", alignItems: "center", gap: SPACE.md,
                    padding: `${SPACE.sm}px 0`,
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: RADIUS.full, flexShrink: 0,
                      display: "grid", placeItems: "center",
                      background: fait ? "rgba(18,183,106,0.12)" : cours ? C.accentLt : C.s2,
                    }}>
                      {fait && <I name="check" size={12} color={C.green} stroke={3}/>}
                      {cours && (
                        <span style={{
                          width: 12, height: 12, borderRadius: RADIUS.full,
                          border: `2px solid rgba(60,91,255,0.25)`, borderTopColor: C.accent,
                          animation: "spin .8s linear infinite",
                        }}/>
                      )}
                    </span>
                    <span style={{
                      ...TYPE.body,
                      fontWeight: cours ? 600 : 500,
                      color: fait || cours ? C.text : C.dim,
                    }}>{t}</span>
                  </div>
                );
              })}
            </div>

            <button className="tap" onClick={annulerAnalyse} style={{
              width: "100%", marginTop: SPACE.md, padding: SPACE.md,
              background: C.s1, border: `1px solid ${C.bd}`, borderRadius: RADIUS.lg,
              color: C.mid, ...TYPE.body, fontWeight: 600, cursor: "pointer",
            }}>
              Annuler l'analyse
            </button>
          </>
        )}

        {/* ─── ÉTAPE 3 : VÉRIFICATION ───────────────────────────────────── */}
        {step === "verif" && result && (
          <>
            {/* En-tête résultat */}
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.lg }}>
              {preview && (
                <img src={preview} alt="" style={{
                  width: 58, height: 58, borderRadius: RADIUS.lg,
                  objectFit: "cover", flexShrink: 0, border: `1px solid ${C.bd}`,
                }}/>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TYPE.h3, color: C.text }}>{result.nom}</div>
                <div style={{ ...TYPE.caption, color: C.dim, marginTop: 2 }}>
                  {items.length} aliment{items.length > 1 ? "s" : ""} détecté{items.length > 1 ? "s" : ""}
                </div>
              </div>
              <button className="tap" onClick={reprendre} style={{
                border: "none", background: C.accentLt, color: C.accentDk,
                ...TYPE.caption, fontWeight: 700,
                padding: `${SPACE.sm}px ${SPACE.md}px`, borderRadius: RADIUS.full,
                cursor: "pointer", flexShrink: 0,
              }}>Reprendre</button>
            </div>

            {/* Totaux */}
            <Carte>
              <div style={{ display: "flex", alignItems: "baseline", gap: SPACE.sm, flexWrap: "wrap" }}>
                <span style={{ ...TYPE.display, color: C.text, ...NUM }}>{Math.round(totaux.c)}</span>
                <span style={{ ...TYPE.bodySmall, color: C.dim }}>kcal estimées</span>
                <span style={{ marginLeft: "auto" }}><FiabiliteBadge niveau={result.fiabilite}/></span>
              </div>

              {/* Répartition */}
              <div style={{
                display: "flex", gap: 3, height: 10, borderRadius: RADIUS.full,
                overflow: "hidden", background: C.s3, margin: `${SPACE.lg}px 0 ${SPACE.md}px`,
              }}>
                <span style={{ flex: Math.max(totaux.p * 4, 1), background: C.accent }}/>
                <span style={{ flex: Math.max(totaux.g * 4, 1), background: C.amber }}/>
                <span style={{ flex: Math.max(totaux.l * 9, 1), background: C.red }}/>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: SPACE.sm }}>
                {[
                  { l: "Protéines", v: totaux.p, c: C.accent, ic: "protein" },
                  { l: "Glucides",  v: totaux.g, c: C.amber,  ic: "carbs"   },
                  { l: "Lipides",   v: totaux.l, c: C.red,    ic: "fat"     },
                ].map(m => (
                  <div key={m.l} style={{ background: C.s2, borderRadius: RADIUS.lg, padding: SPACE.md }}>
                    <div style={{ display: "flex", alignItems: "center", gap: SPACE.xs }}>
                      <span style={{ width: 7, height: 7, borderRadius: RADIUS.full, background: m.c, flexShrink: 0 }}/>
                      <span style={{ ...TYPE.micro, color: C.dim, letterSpacing: "0.04em" }}>{m.l}</span>
                    </div>
                    <div style={{ ...TYPE.h2, color: C.text, marginTop: SPACE.xs, ...NUM }}>
                      {Math.round(m.v)}<span style={{ ...TYPE.caption, color: C.dim, marginLeft: 2 }}>g</span>
                    </div>
                  </div>
                ))}
              </div>
            </Carte>

            {/* Aliments détectés + ajustement portion par portion */}
            <Carte>
              <div style={{
                ...TYPE.micro, color: C.dim, marginBottom: SPACE.md,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>Aliments détectés</span>
                <span style={{ letterSpacing: 0, textTransform: "none", fontWeight: 500 }}>
                  ajuste les portions
                </span>
              </div>

              {items.map((it, i) => (
                <div key={`${it.nom}-${i}`} style={{
                  display: "flex", alignItems: "center", gap: SPACE.md,
                  padding: `${SPACE.md}px 0`,
                  borderBottom: i < items.length - 1 ? `1px solid ${C.bd}` : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...TYPE.body, fontWeight: 600, color: C.text }}>{it.nom}</div>
                    <div style={{ ...TYPE.caption, color: C.dim, marginTop: 2, ...NUM }}>
                      {Math.round(it.calories * ratio(it))} kcal
                      {it.proteines >= 1 && ` · P ${Math.round(it.proteines * ratio(it))}`}
                      {it.glucides  >= 1 && ` · G ${Math.round(it.glucides  * ratio(it))}`}
                      {it.lipides   >= 1 && ` · L ${Math.round(it.lipides   * ratio(it))}`}
                    </div>
                  </div>

                  {it.grammes === 0 ? (
                    <button className="tap" onClick={() => retirerItem(i)} style={{
                      border: "none", background: C.s2, color: C.red,
                      ...TYPE.caption, fontWeight: 700,
                      padding: `${SPACE.sm}px ${SPACE.md}px`, borderRadius: RADIUS.md,
                      cursor: "pointer", flexShrink: 0,
                    }}>Retirer</button>
                  ) : (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 2, flexShrink: 0,
                      background: C.s2, borderRadius: RADIUS.md, padding: 3,
                    }}>
                      <button className="tap-icon" aria-label="Moins"
                        onClick={() => setGrammes(i, -PAS_GRAMMES)} style={{
                          width: 30, height: 30, borderRadius: RADIUS.sm, border: "none",
                          background: "transparent", cursor: "pointer", color: C.mid,
                          display: "grid", placeItems: "center", lineHeight: 1,
                          fontFamily: FONT, fontSize: 18, fontWeight: 700,
                        }}>−</button>
                      <span style={{
                        minWidth: 46, textAlign: "center",
                        ...TYPE.bodySmall, fontWeight: 700, color: C.text, ...NUM,
                      }}>{it.grammes} g</span>
                      <button className="tap-icon" aria-label="Plus"
                        onClick={() => setGrammes(i, PAS_GRAMMES)} style={{
                          width: 30, height: 30, borderRadius: RADIUS.sm, border: "none",
                          background: "transparent", cursor: "pointer", color: C.mid,
                          display: "grid", placeItems: "center", lineHeight: 1,
                          fontFamily: FONT, fontSize: 18, fontWeight: 700,
                        }}>+</button>
                    </div>
                  )}
                </div>
              ))}
            </Carte>

            {/* Note du coach */}
            {result.note && (
              <Carte style={{ background: C.s2, border: "none" }}>
                <div style={{ display: "flex", gap: SPACE.md, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}><ID name="coachDuo" size={22}/></span>
                  <span style={{ ...TYPE.bodySmall, color: C.mid }}>{result.note}</span>
                </div>
              </Carte>
            )}
          </>
        )}
      </div>

      {/* ═══ BARRE BASSE — étape de vérification ═══ */}
      {step === "verif" && (
        <div style={{
          flexShrink: 0,
          padding: `${SPACE.md}px ${SPACE.lg}px calc(${SPACE.xl}px + env(safe-area-inset-bottom, 0px))`,
          background: C.bg, borderTop: `1px solid ${C.bd}`,
        }}>
          <button className="tap" onClick={() => setSheet(true)} disabled={!items.length} style={{
            width: "100%", padding: SPACE.lg, border: "none", borderRadius: RADIUS.lg,
            background: items.length
              ? `linear-gradient(135deg,${C.accent},${C.accentDk})`
              : C.s3,
            color: items.length ? "#FFF" : C.dim, ...TYPE.h3,
            display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
            cursor: items.length ? "pointer" : "not-allowed",
          }}>
            Ajouter au journal
            <I name="arrowRight" size={18} color={items.length ? "#FFF" : C.dim}/>
          </button>
        </div>
      )}

      {/* ═══ CHOIX DU REPAS ═══ */}
      {sheet && (
        <ChoixRepasSheet
          totals={totaux}
          contenu={contenuRepas}
          defaultId={repasId}
          onPick={confirmer}
          onClose={() => setSheet(false)}
        />
      )}

      <style>{`
        @keyframes mcScan { 0% { top: -110px } 100% { top: 100% } }
        @media (prefers-reduced-motion: reduce) {
          [style*="mcScan"] { animation: none !important; opacity: 0 }
        }
      `}</style>
    </div>
  );

  // Portal sur document.body : indispensable pour passer au-dessus du header
  // sticky et de la barre d'onglets, quel que soit le conteneur d'origine.
  return createPortal(contenu, document.body);
}
