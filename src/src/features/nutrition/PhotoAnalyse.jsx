// @ts-check
// ─── PHOTO ANALYSE — Analyse macros par photo d'assiette ──────────────────────
// Feature Premium : 5 analyses/mois gratuites, 180/mois pour les abonnés PRO.
// Flow : Upload photo → Claude Vision → Résultat macros → Choix repas → Ajout journal

import { useState, useRef, useCallback } from "react";
import { C, FONT, SERIF } from "../../data/constants.js";

// ─── Constantes ───────────────────────────────────────────────────────────────
const STORAGE_KEY_PREFIX = "mc_photoAnalyses_";
const FREE_LIMIT = 5;
const PRO_LIMIT   = 180;

const MEALS = [
  { id: "matin", l: "Petit-déj." },
  { id: "midi",  l: "Déjeuner"   },
  { id: "soir",  l: "Dîner"      },
  { id: "snack", l: "Collation"  },
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

// ─── Prompt IA ────────────────────────────────────────────────────────────────

const ANALYSE_PROMPT = `Tu es un nutritionniste expert. Analyse cette photo d'assiette/repas et estime les macronutriments.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni backticks :
{
  "nom": "Nom du plat estimé (court, 2-4 mots)",
  "description": "Description courte de ce que tu vois (1 phrase)",
  "calories": 450,
  "proteines": 35,
  "glucides": 40,
  "lipides": 15,
  "fiabilite": "haute|moyenne|basse",
  "note": "Explication courte sur la précision de l'estimation"
}

Règles :
- Estime pour une portion normale visible dans l'image
- Si tu ne vois pas clairement de nourriture, renvoie fiabilite: "basse"
- Arrondis les valeurs à l'entier le plus proche
- Sois conservateur dans tes estimations (mieux vaut sous-estimer que sur-estimer)`;

// ─── Icône ────────────────────────────────────────────────────────────────────
function CameraIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function LockIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function SparkIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>
    </svg>
  );
}

// ─── Pastille fiabilité ───────────────────────────────────────────────────────
function FiabiliteBadge({ niveau }) {
  const map = {
    haute:   { label: "Fiabilité haute",   color: "#34D399", bg: "rgba(52,211,153,0.12)",   bd: "rgba(52,211,153,0.25)"   },
    moyenne: { label: "Fiabilité moyenne", color: "#FBBF24", bg: "rgba(251,191,36,0.12)",   bd: "rgba(251,191,36,0.25)"   },
    basse:   { label: "Estimation approximative", color: "#F87171", bg: "rgba(248,113,113,0.12)", bd: "rgba(248,113,113,0.25)" },
  };
  const s = map[niveau] || map.moyenne;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 20,
      background: s.bg, border: `1px solid ${s.bd}`,
      fontSize: 10, fontWeight: 700, color: s.color, fontFamily: FONT,
    }}>{s.label}</span>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

/**
 * @param {{
 *   onClose: () => void,
 *   onAdd: (aliment: object, repasId: string) => void,
 *   premium: boolean,
 *   setPaywall: (v: boolean) => void,
 *   push: (icon: string, titre: string, msg: string) => void,
 * }} props
 */
export default function PhotoAnalyse({ onClose, onAdd, premium, setPaywall, push }) {
  const [step,       setStep]    = useState("upload"); // upload | loading | result | confirm
  const [preview,    setPreview] = useState(/** @type {string|null} */ (null));
  const [base64,     setBase64]  = useState(/** @type {string|null} */ (null));
  /** @type {[{nom:string,description:string,calories:number,proteines:number,glucides:number,lipides:number,fiabilite:string,note:string}|null, Function]} */
  const [result,     setResult]  = useState(null);
  const [error,      setError]   = useState(/** @type {string|null} */ (null));
  const [repasChoix, setRepas]   = useState("midi");
  const inputRef = useRef(/** @type {HTMLInputElement|null} */ (null));

  // Compteur mensuel
  const usedCount  = getUsedCount();
  const remaining  = Math.max(0, FREE_LIMIT - usedCount);
  const proUsed    = getUsedCount();
  const canAnalyse = premium
    ? proUsed < PRO_LIMIT          // PRO : limité à 180/mois
    : remaining > 0;               // Gratuit : limité à 3/mois

  // ── Sélection photo ──────────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    const b64 = await fileToBase64(file);
    setBase64(b64);
    setStep("upload");
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Lancer l'analyse ─────────────────────────────────────────────────────
  const analyser = async () => {
    if (!base64) return;

    // Vérification paywall
    if (!canAnalyse) {
      setPaywall(true);
      return;
    }

    setStep("loading");
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64,
                },
              },
              { type: "text", text: ANALYSE_PROMPT },
            ],
          }],
        }),
      });

      if (!res.ok) throw new Error(`Erreur API ${res.status}`);
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Incrémenter le compteur si pas premium
      if (!premium) incrementUsedCount();

      setResult(parsed);
      setStep("result");

    } catch (e) {
      setError("L'analyse n'a pas pu être générée. Vérifie ta connexion et réessaie.");
      setStep("upload");
    }
  };

  // ── Ajouter au journal ───────────────────────────────────────────────────
  const confirmer = () => {
    if (!result) return;
    const r = /** @type {{nom:string,calories:number,proteines:number,glucides:number,lipides:number}} */ (result);
    const aliment = {
      n: r.nom,
      c: Math.round(r.calories),
      p: Math.round(r.proteines),
      g: Math.round(r.glucides),
      l: Math.round(r.lipides),
    };
    onAdd(aliment, repasChoix);
    const repasLabel = MEALS.find(m => m.id === repasChoix)?.l || repasChoix;
    push("📸", "Ajouté !", `${r.nom} ajouté au ${repasLabel.toLowerCase()}.`);
    onClose();
  };

  // ── Compteur utilisations ────────────────────────────────────────────────
  const newUsed   = getUsedCount();
  const newRemain = Math.max(0, FREE_LIMIT - newUsed);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 600,
      background: "rgba(5,8,18,0.97)",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 20px 0",
      }}>
        <button onClick={onClose} style={{
          background: "transparent", border: "none",
          color: C.accent, fontSize: 13, fontWeight: 700,
          fontFamily: FONT, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Retour
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Badge premium ou compteur */}
          {premium ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 10px", borderRadius: 20,
              background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
              fontSize: 10, fontWeight: 700, color: "#93C5FD", fontFamily: FONT,
            }}>
              <SparkIcon size={10}/> {PRO_LIMIT - proUsed} photos restantes
            </span>
          ) : (
            <span style={{
              padding: "4px 10px", borderRadius: 20,
              background: newRemain > 0 ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)",
              border: `1px solid ${newRemain > 0 ? "rgba(251,191,36,0.30)" : "rgba(248,113,113,0.30)"}`,
              fontSize: 10, fontWeight: 700,
              color: newRemain > 0 ? "#FBBF24" : "#F87171",
              fontFamily: FONT,
            }}>
              {newRemain > 0 ? `${newRemain} photo${newRemain > 1 ? "s" : ""} restante${newRemain > 1 ? "s" : ""}` : "Limite atteinte"}
            </span>
          )}
        </div>
      </div>

      {/* ── TITRE ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: "linear-gradient(135deg,#3B82F6,#2563EB)",
          display: "grid", placeItems: "center",
          margin: "0 auto 14px",
          boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
        }}>
          <CameraIcon size={26} color="#fff"/>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 22, color: C.text, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 6 }}>
          Analyse <span style={{ fontStyle: "italic" }}>photo</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(15,25,35,0.45)", fontFamily: FONT }}>
          Prends en photo ton repas pour estimer les macros
        </div>
      </div>

      {/* ── CONTENU ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 32px" }}>

        {/* ═══ ÉTAPE UPLOAD ═══ */}
        {(step === "upload" || step === "loading") && (
          <>
            {/* Zone upload */}
            <input
              ref={inputRef} type="file" accept="image/*" capture="environment"
              style={{ display: "none" }}
              onChange={onFileChange}
            />

            {preview ? (
              /* Preview photo */
              <div style={{
                position: "relative", borderRadius: 20, overflow: "hidden",
                marginBottom: 16, border: `2px solid rgba(59,130,246,0.40)`,
              }}>
                <img src={preview} alt="Aperçu repas"
                  style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }}/>
                <button onClick={() => inputRef.current?.click()} style={{
                  position: "absolute", bottom: 12, right: 12,
                  background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(0,0,0,0.09)", borderRadius: 10,
                  color: "#fff", fontSize: 11, fontWeight: 600, fontFamily: FONT,
                  padding: "6px 12px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <CameraIcon size={12} color="#fff"/> Changer
                </button>
              </div>
            ) : (
              /* Zone drag/click */
              <button onClick={() => inputRef.current?.click()} style={{
                width: "100%", borderRadius: 20, border: "2px dashed rgba(59,130,246,0.35)",
                background: "rgba(59,130,246,0.05)", padding: "40px 20px",
                cursor: "pointer", marginBottom: 16,
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.25)",
                  display: "grid", placeItems: "center",
                }}>
                  <CameraIcon size={24} color="#3B82F6"/>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: FONT, marginBottom: 4 }}>
                    Prendre une photo
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(15,25,35,0.40)", fontFamily: FONT }}>
                    Ou choisir depuis la galerie
                  </div>
                </div>
              </button>
            )}

            {/* Erreur */}
            {error && (
              <div style={{
                padding: "12px 14px", borderRadius: 12, marginBottom: 14,
                background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.25)",
                fontSize: 12, color: "#F87171", fontFamily: FONT,
              }}>{error}</div>
            )}

            {/* Bouton analyser */}
            {!canAnalyse ? (
              /* Paywall */
              <button onClick={() => setPaywall(true)} style={{
                width: "100%", padding: "14px",
                background: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: FONT, fontSize: 14, fontWeight: 700,
                color: "${C.dim}",
              }}>
                <LockIcon size={16}/> Limite atteinte · Passer au PRO
              </button>
            ) : (
              <button
                onClick={analyser}
                disabled={!preview || step === "loading"}
                style={{
                  width: "100%", padding: "14px",
                  background: preview && step !== "loading"
                    ? "linear-gradient(135deg,#1D4ED8,#3B82F6)"
                    : "rgba(0,0,0,0.05)",
                  border: "none", borderRadius: 14,
                  cursor: preview && step !== "loading" ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: FONT, fontSize: 14, fontWeight: 700,
                  color: preview && step !== "loading" ? "#fff" : "rgba(15,25,35,0.25)",
                  boxShadow: preview && step !== "loading" ? "0 4px 16px rgba(59,130,246,0.35)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {step === "loading" ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Analyse en cours…
                  </>
                ) : (
                  <>
                    <SparkIcon size={16}/> Analyser ce repas
                  </>
                )}
              </button>
            )}

            {/* Info gratuité */}
            {!premium && newRemain > 0 && (
              <div style={{
                marginTop: 10, textAlign: "center",
                fontSize: 10.5, color: "${C.dim}", fontFamily: FONT,
              }}>
                {newRemain} photo{newRemain > 1 ? "s" : ""} restante{newRemain > 1 ? "s" : ""} ce mois · {PRO_LIMIT} photos/mois avec Nutrition PRO
              </div>
            )}
          </>
        )}

        {/* ═══ RÉSULTAT ═══ */}
        {step === "result" && result && (() => {
          /** @type {{nom:string,description:string,calories:number,proteines:number,glucides:number,lipides:number,fiabilite:string,note:string}} */
          const res = /** @type {any} */ (result);
          return (<>
            {/* Photo miniature */}
            {preview && (
              <div style={{
                borderRadius: 16, overflow: "hidden",
                marginBottom: 16, border: `1px solid rgba(0,0,0,0.06)`,
                height: 140,
              }}>
                <img src={preview} alt="Repas analysé"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              </div>
            )}

            {/* Résultat IA */}
            <div style={{
              background: C.s1, border: `1px solid ${C.bd}`,
              borderRadius: 20, padding: "18px 18px 14px",
              marginBottom: 14,
            }}>
              {/* Nom + fiabilité */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: FONT, letterSpacing: -0.4, marginBottom: 4 }}>
                    {res.nom}
                  </div>
                  <FiabiliteBadge niveau={res.fiabilite}/>
                </div>
              </div>

              {/* Description */}
              {res.description && (
                <div style={{
                  fontSize: 12, color: "rgba(15,25,35,0.45)", fontFamily: FONT,
                  lineHeight: 1.5, marginBottom: 14,
                }}>{res.description}</div>
              )}

              {/* Macros */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                {[
                  { l: "Calories", v: res.calories, u: "kcal", c: "#F59E0B" },
                  { l: "Protéines", v: res.proteines, u: "g", c: "#60A5FA" },
                  { l: "Glucides",  v: res.glucides,  u: "g", c: "#22D3EE" },
                  { l: "Lipides",   v: res.lipides,   u: "g", c: "#34D399" },
                ].map(m => (
                  <div key={m.l} style={{
                    background: `${m.c}12`, border: `1px solid ${m.c}25`,
                    borderRadius: 12, padding: "10px 6px", textAlign: "center",
                  }}>
                    <div style={{
                      fontSize: 17, fontWeight: 800, color: m.c,
                      fontFamily: FONT, letterSpacing: -0.5, lineHeight: 1,
                    }}>{Math.round(m.v)}</div>
                    <div style={{ fontSize: 9, color: "${C.dim}", marginTop: 3, fontFamily: FONT }}>{m.u}</div>
                    <div style={{ fontSize: 9, color: "rgba(15,25,35,0.25)", fontFamily: FONT }}>{m.l}</div>
                  </div>
                ))}
              </div>

              {/* Note IA */}
              {res.note && (
                <div style={{
                  fontSize: 11, color: "${C.dim}", fontFamily: FONT,
                  fontStyle: "italic", lineHeight: 1.5,
                  borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 10,
                }}>💡 {res.note}</div>
              )}
            </div>

            {/* Choix repas */}
            <div style={{
              background: C.s1, border: `1px solid ${C.bd}`,
              borderRadius: 16, padding: "14px 16px",
              marginBottom: 14,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "${C.dim}",
                letterSpacing: "0.09em", textTransform: "uppercase",
                fontFamily: FONT, marginBottom: 10,
              }}>Ajouter à…</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {MEALS.map(m => (
                  <button key={m.id} onClick={() => setRepas(m.id)} style={{
                    padding: "9px 4px",
                    background: repasChoix === m.id
                      ? "rgba(59,130,246,0.15)"
                      : "rgba(0,0,0,0.03)",
                    border: `1px solid ${repasChoix === m.id ? "rgba(59,130,246,0.40)" : "rgba(0,0,0,0.06)"}`,
                    borderRadius: 10, cursor: "pointer",
                    fontSize: 10.5, fontWeight: 700,
                    color: repasChoix === m.id ? "#93C5FD" : "rgba(15,25,35,0.45)",
                    fontFamily: FONT,
                  }}>{m.l}</button>
                ))}
              </div>
            </div>

            {/* CTA Confirmer */}
            <button onClick={confirmer} style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg,#1D4ED8,#3B82F6)",
              border: "none", borderRadius: 14,
              color: "#fff", fontSize: 15, fontWeight: 700,
              fontFamily: FONT, cursor: "pointer",
              marginBottom: 8,
              boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
            }}>
              ✓ Ajouter à mon journal
            </button>

            {/* Nouvelle analyse */}
            <button onClick={() => { setStep("upload"); setResult(null); setPreview(null); setBase64(null); }} style={{
              width: "100%", padding: "12px",
              background: "transparent", border: `1px solid ${C.bd}`,
              borderRadius: 14, color: "rgba(15,25,35,0.40)",
              fontSize: 13, fontWeight: 500, fontFamily: FONT, cursor: "pointer",
            }}>
              Analyser une autre photo
            </button>
          </>);
        })()}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
