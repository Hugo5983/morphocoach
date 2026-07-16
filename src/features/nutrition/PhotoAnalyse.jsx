// @ts-check
// ─── PHOTO ANALYSE — Analyse macros par photo d'assiette ──────────────────────
// Feature Premium : 5 analyses/mois gratuites, 180/mois pour les abonnés PRO.
// Flow : Upload photo → Claude Vision → Résultat macros → Choix repas → Ajout journal

import { useState, useRef, useCallback } from"react";
import useScrollTop from"../../hooks/useScrollTop.js";
import { C, DARK, FONT, SERIF } from"../../data/constants.js";

// ─── Constantes ───────────────────────────────────────────────────────────────
const STORAGE_KEY_PREFIX ="mc_photoAnalyses_";
const FREE_LIMIT = 5;
const PRO_LIMIT   = 180;

const MEALS = [
  { id:"matin", l:"Petit-déj." },
  { id:"midi",  l:"Déjeuner"   },
  { id:"soir",  l:"Dîner"      },
  { id:"snack", l:"Collation"  },
];

// ─── Helpers compteur mensuel ─────────────────────────────────────────────────

function getMonthKey() {
  const d = new Date();
  return`${STORAGE_KEY_PREFIX}${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function getUsedCount() {
  try {
    return parseInt(localStorage.getItem(getMonthKey()) ||"0", 10);
  } catch { return 0; }
}

function incrementUsedCount() {
  try {
    const key = getMonthKey();
    const current = parseInt(localStorage.getItem(key) ||"0", 10);
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

const ANALYSE_PROMPT =`Tu es un nutritionniste expert en estimation visuelle des portions.

MÉTHODE (dans cet ordre) :
1. Identifie CHAQUE aliment visible séparément.
2. Estime le poids de chacun en te servant des repères d'échelle visibles :
   assiette standard = 26 cm, fourchette = 20 cm, cuillère à soupe = 15 g,
   paume de main = ~100 g de viande, poing = ~150 g de féculents cuits.
3. Donne les macros de CHAQUE aliment pour son poids estimé (pas pour 100 g).

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni backticks :
{
"nom":"Nom du plat (2-4 mots)",
"description":"Ce que tu vois, en 1 phrase",
"items": [
    {"nom":"Riz basmati cuit","grammes": 180,"calories": 234,"proteines": 5,"glucides": 50,"lipides": 1 },
    {"nom":"Blanc de poulet grillé","grammes": 140,"calories": 231,"proteines": 43,"glucides": 0,"lipides": 5 }
  ],
"fiabilite":"haute|moyenne|basse",
"note":"Ce qui limite la précision (ex : sauce non identifiable, aliments cachés)"
}

Règles :
- N'invente RIEN : uniquement ce qui est visible. Matières grasses de cuisson :
  ajoute un item"Huile de cuisson (estimée)" ~10 g seulement si le plat brille.
- fiabilite"basse" si l'échelle est incertaine ou des aliments sont cachés/mélangés.
- Aucune nourriture visible →"items": [] et fiabilite"basse".
- Nombres entiers uniquement.`;

// ─── Icône ────────────────────────────────────────────────────────────────────
function CameraIcon({ size = 20, color ="currentColor" }) {
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
    haute:   { label:"Fiabilité haute",   color:"#12B76A", bg:"rgba(18,183,106,0.12)",   bd:"rgba(18,183,106,0.25)"   },
    moyenne: { label:"Fiabilité moyenne", color:"#F59E0B", bg:"rgba(245,158,11,0.12)",   bd:"rgba(245,158,11,0.25)"   },
    basse:   { label:"Estimation approximative", color:"#E5484D", bg:"rgba(229,72,77,0.12)", bd:"rgba(229,72,77,0.25)" },
  };
  const s = map[niveau] || map.moyenne;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap: 4,
      padding:"4px 8px", borderRadius: 20,
      background: s.bg, border:`1px solid ${s.bd}`,
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
  useScrollTop();
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
        method:"POST",
        headers: {"Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens: 1000,
          temperature: 0,
          messages: [{
            role:"user",
            content: [
              {
                type:"image",
                source: {
                  type:"base64",
                  media_type:"image/jpeg",
                  data: base64,
                },
              },
              { type:"text", text: ANALYSE_PROMPT },
            ],
          }],
        }),
      });

      if (!res.ok) throw new Error(`Erreur API ${res.status}`);
      const data = await res.json();
      const text = data.content?.[0]?.text ||"";
      const clean = text.replace(/```json\n?|\n?```/g,"").trim();
      const parsed = JSON.parse(clean);

      // Totaux recalculés en JS depuis les items : le modèle est bien meilleur
      // pour identifier et peser chaque aliment que pour deviner un total —
      // et l'arithmétique, c'est notre travail, pas le sien.
      const items = Array.isArray(parsed.items) ? parsed.items.filter(i => i && i.grammes > 0) : [];
      if (!items.length) {
        setError("Aucun aliment identifiable sur la photo. Reprends-la de plus près, à la verticale.");
        setStep("upload");
        return;
      }
      const somme = k => items.reduce((t, i) => t + (Number(i[k]) || 0), 0);
      parsed.items     = items;
      parsed.calories  = somme("calories");
      parsed.proteines = somme("proteines");
      parsed.glucides  = somme("glucides");
      parsed.lipides   = somme("lipides");

      // Incrémenter le compteur si pas premium
      if (!premium) incrementUsedCount();

      setFacteur(1);
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
      n: facteur === 1 ? r.nom :`${r.nom} (portion ×${facteur.toFixed(2)})`,
      c: Math.round(r.calories  * facteur),
      p: Math.round(r.proteines * facteur),
      g: Math.round(r.glucides  * facteur),
      l: Math.round(r.lipides   * facteur),
    };
    onAdd(aliment, repasChoix);
    const repasLabel = MEALS.find(m => m.id === repasChoix)?.l || repasChoix;
    push("","Ajouté !",`${r.nom} ajouté au ${repasLabel.toLowerCase()}.`);
    onClose();
  };

  // ── Compteur utilisations ────────────────────────────────────────────────
  const newUsed   = getUsedCount();
  const newRemain = Math.max(0, FREE_LIMIT - newUsed);

  return (
    <div style={{
      position:"fixed", inset: 0, zIndex: 360,
      background:"rgba(5,8,18,0.97)",
      display:"flex", flexDirection:"column",
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"20px 20px 0",
      }}>
        <button onClick={onClose} style={{
          background:"transparent", border:"none",
          color: C.accent, fontSize: 13, fontWeight: 700,
          fontFamily: FONT, cursor:"pointer",
          display:"flex", alignItems:"center", gap: 4,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Retour
        </button>

        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
          {/* Badge premium ou compteur */}
          {premium ? (
            <span style={{
              display:"inline-flex", alignItems:"center", gap: 4,
              padding:"4px 12px", borderRadius: 20,
              background:"rgba(60,91,255,0.12)", border:"1px solid rgba(60,91,255,0.25)",
              fontSize: 10, fontWeight: 700, color: C.blueLt, fontFamily: FONT,
            }}>
              <SparkIcon size={10}/> {PRO_LIMIT - proUsed} photos restantes
            </span>
) : (
            <span style={{
              padding:"4px 12px", borderRadius: 20,
              background: newRemain > 0 ?"rgba(245,158,11,0.12)" :"rgba(229,72,77,0.12)",
              border:`1px solid ${newRemain > 0 ?"rgba(245,158,11,0.25)" :"rgba(229,72,77,0.25)"}`,
              fontSize: 10, fontWeight: 700,
              color: newRemain > 0 ?"#F59E0B" :"#E5484D",
              fontFamily: FONT,
            }}>
              {newRemain > 0 ?`${newRemain} photo${newRemain > 1 ?"s" :""} restante${newRemain > 1 ?"s" :""}` :"Limite atteinte"}
            </span>
)}
        </div>
      </div>

      {/* ── TITRE ──────────────────────────────────────────────────────── */}
      <div style={{ padding:"20px 20px 0", textAlign:"center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 20,
          background:"linear-gradient(135deg,#3C5BFF,#2E48D9)",
          display:"grid", placeItems:"center",
          margin:"0 auto 14px",
          boxShadow:"0 8px 24px rgba(60,91,255,0.35)",
        }}>
          <CameraIcon size={26} color="#FFF"/>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 20, color: C.text, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 8 }}>
          Analyse <span style={{ fontStyle:"italic" }}>photo</span>
        </div>
        <div style={{ fontSize: 13, color: C.mid, fontFamily: FONT }}>
          Prends en photo ton repas pour estimer les macros
        </div>
      </div>

      {/* ── CONTENU ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY:"auto", padding:"20px 20px 32px" }}>

        {/* ═══ ÉTAPE UPLOAD ═══ */}
        {(step ==="upload" || step ==="loading") && (
          <>
            {/* Zone upload */}
            <input
              ref={inputRef} type="file" accept="image/*" capture="environment"
              style={{ display:"none" }}
              onChange={onFileChange}
            />

            {preview ? (
              /* Preview photo */
              <div style={{
                position:"relative", borderRadius: 20, overflow:"hidden",
                marginBottom: 16, border:`2px solid rgba(60,91,255,0.35)`,
              }}>
                <img src={preview} alt="Aperçu repas"
                  style={{ width:"100%", maxHeight: 260, objectFit:"cover", display:"block" }}/>
                <button onClick={() => inputRef.current?.click()} style={{
                  position:"absolute", bottom: 12, right: 12,
                  background:"rgba(16,19,24,0.5)", backdropFilter:"blur(8px)",
                  border:"1px solid rgba(0,0,0,0.08)", borderRadius: 12,
                  color:"#FFF", fontSize: 11, fontWeight: 600, fontFamily: FONT,
                  padding:"8px 12px", cursor:"pointer",
                  display:"flex", alignItems:"center", gap: 4,
                }}>
                  <CameraIcon size={12} color="#FFF"/> Changer
                </button>
              </div>
) : (
              /* Zone drag/click */
              <button onClick={() => inputRef.current?.click()} style={{
                width:"100%", borderRadius: 20, border:"2px dashed rgba(60,91,255,0.35)",
                background:"rgba(60,91,255,0.05)", padding:"32px 20px",
                cursor:"pointer", marginBottom: 16,
                display:"flex", flexDirection:"column",
                alignItems:"center", gap: 12,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background:"rgba(60,91,255,0.12)", border:"1px solid rgba(60,91,255,0.25)",
                  display:"grid", placeItems:"center",
                }}>
                  <CameraIcon size={24} color={C.accent}/>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: FONT, marginBottom: 4 }}>
                    Prendre une photo
                  </div>
                  <div style={{ fontSize: 11, color: C.mid, fontFamily: FONT }}>
                    Ou choisir depuis la galerie
                  </div>
                </div>
              </button>
)}

            {/* Erreur */}
            {error && (
              <div style={{
                padding:"12px 16px", borderRadius: 12, marginBottom: 16,
                background:"rgba(229,72,77,0.12)", border:"1px solid rgba(229,72,77,0.25)",
                fontSize: 13, color:"#E5484D", fontFamily: FONT,
              }}>{error}</div>
)}

            {/* Bouton analyser */}
            {!canAnalyse ? (
              /* Paywall */
              <button onClick={() => setPaywall(true)} style={{
                width:"100%", padding:"16px",
                background:"rgba(0,0,0,0.05)",
                border:"1px solid rgba(0,0,0,0.08)",
                borderRadius: 16, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap: 8,
                fontFamily: FONT, fontSize: 14, fontWeight: 700,
                color:"${C.dim}",
              }}>
                <LockIcon size={16}/> Limite atteinte · Passer au PRO
              </button>
) : (
              <button
                onClick={analyser}
                disabled={!preview || step ==="loading"}
                style={{
                  width:"100%", padding:"16px",
                  background: preview && step !=="loading"
                    ?"linear-gradient(135deg,#2438B8,#3C5BFF)"
                    :"rgba(0,0,0,0.05)",
                  border:"none", borderRadius: 16,
                  cursor: preview && step !=="loading" ?"pointer" :"not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center", gap: 8,
                  fontFamily: FONT, fontSize: 14, fontWeight: 700,
                  color: preview && step !=="loading" ?"#FFF" : C.dim,
                  boxShadow: preview && step !=="loading" ?"0 4px 16px rgba(60,91,255,0.35)" :"none",
                  transition:"all 0.2s",
                }}
              >
                {step ==="loading" ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ animation:"spin 1s linear infinite" }}>
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
                marginTop: 12, textAlign:"center",
                fontSize: 11, color:"${C.dim}", fontFamily: FONT,
              }}>
                {newRemain} photo{newRemain > 1 ?"s" :""} restante{newRemain > 1 ?"s" :""} ce mois · {PRO_LIMIT} photos/mois avec Nutrition PRO
              </div>
)}
          </>
)}

        {/* ═══ RÉSULTAT ═══ */}
        {step ==="result" && result && (() => {
          /** @type {{nom:string,description:string,calories:number,proteines:number,glucides:number,lipides:number,fiabilite:string,note:string}} */
          const res = /** @type {any} */ (result);
          return (<>
            {/* Photo miniature */}
            {preview && (
              <div style={{
                borderRadius: 16, overflow:"hidden",
                marginBottom: 16, border:`1px solid rgba(0,0,0,0.05)`,
                height: 140,
              }}>
                <img src={preview} alt="Repas analysé"
                  style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
)}

            {/* Résultat IA */}
            <div style={{
              background: C.s1, border:`1px solid ${C.bd}`,
              borderRadius: 20, padding:"20px 20px 16px",
              marginBottom: 16,
            }}>
              {/* Nom + fiabilité */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: FONT, letterSpacing: -0.3, marginBottom: 4 }}>
                    {res.nom}
                  </div>
                  <FiabiliteBadge niveau={res.fiabilite}/>
                </div>
              </div>

              {/* Description */}
              {res.description && (
                <div style={{
                  fontSize: 13, color: C.mid, fontFamily: FONT,
                  lineHeight: 1.5, marginBottom: 16,
                }}>{res.description}</div>
)}

              {/* Macros */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                {[
                  { l:"Calories", v: res.calories * facteur, u:"kcal", c:"#F59E0B" },
                  { l:"Protéines", v: res.proteines * facteur, u:"g", c: DARK.accent },
                  { l:"Glucides",  v: res.glucides * facteur,  u:"g", c:"#3C5BFF" },
                  { l:"Lipides",   v: res.lipides * facteur,   u:"g", c:"#12B76A" },
                ].map(m => (
                  <div key={m.l} style={{
                    background:`${m.c}12`, border:`1px solid ${m.c}25`,
                    borderRadius: 12, padding:"12px 8px", textAlign:"center",
                  }}>
                    <div style={{
                      fontSize: 16, fontWeight:700, color: m.c,
                      fontFamily: FONT, letterSpacing: -0.5, lineHeight: 1,
                    }}>{Math.round(m.v)}</div>
                    <div style={{ fontSize: 10, color:"${C.dim}", marginTop: 4, fontFamily: FONT }}>{m.u}</div>
                    <div style={{ fontSize: 10, color: C.dim, fontFamily: FONT }}>{m.l}</div>
                  </div>
))}
              </div>

              {/* Détail aliment par aliment : c'est là que se juge la fiabilité */}
              {res.items?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {res.items.map((it, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", padding:"7px 2px",
                      borderBottom: i < res.items.length - 1 ?`1px solid ${C.bd}` :"none" }}>
                      <span style={{ fontSize: 12.5, color: C.mid, fontFamily: FONT }}>
                        {it.nom}
                      </span>
                      <span style={{ fontSize: 12, color: C.dim, fontFamily: FONT,
                        fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap", marginLeft: 10 }}>
                        {Math.round(it.grammes * facteur)} g · {Math.round(it.calories * facteur)} kcal
                      </span>
                    </div>
))}
                </div>
)}

              {/* Ajustement de portion : l'IA propose, TU décides */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.mid, fontFamily: FONT }}>
                    Ajuster la portion
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, fontFamily: FONT }}>
                    ×{facteur.toFixed(2).replace(".",",")}
                  </span>
                </div>
                <input type="range" min="0.5" max="1.5" step="0.05"
                  value={facteur}
                  onChange={e => setFacteur(Number(e.target.value))}
                  style={{ width:"100%", accentColor: C.accent }}/>
                <div style={{ display:"flex", justifyContent:"space-between",
                  fontSize: 10, color: C.dim, fontFamily: FONT }}>
                  <span>Moitié</span><span>Comme estimé</span><span>×1,5</span>
                </div>
              </div>

              {/* Note IA */}
              {res.note && (
                <div style={{
                  fontSize: 11, color:"${C.dim}", fontFamily: FONT,
                  fontStyle:"italic", lineHeight: 1.5,
                  borderTop:"1px solid rgba(0,0,0,0.05)", paddingTop: 12,
                }}> {res.note}</div>
)}
            </div>

            {/* Choix repas */}
            <div style={{
              background: C.s1, border:`1px solid ${C.bd}`,
              borderRadius: 16, padding:"16px 16px",
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color:"${C.dim}",
                letterSpacing:"0.09em", textTransform:"uppercase",
                fontFamily: FONT, marginBottom: 12,
              }}>Ajouter à…</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 8 }}>
                {MEALS.map(m => (
                  <button key={m.id} onClick={() => setRepas(m.id)} style={{
                    padding:"8px 4px",
                    background: repasChoix === m.id
                      ?"rgba(60,91,255,0.12)"
                      :"rgba(0,0,0,0.05)",
                    border:`1px solid ${repasChoix === m.id ?"rgba(60,91,255,0.35)" :"rgba(0,0,0,0.05)"}`,
                    borderRadius: 12, cursor:"pointer",
                    fontSize: 11, fontWeight: 700,
                    color: repasChoix === m.id ? C.blueLt : C.mid,
                    fontFamily: FONT,
                  }}>{m.l}</button>
))}
              </div>
            </div>

            {/* CTA Confirmer */}
            <button onClick={confirmer} style={{
              width:"100%", padding:"16px",
              background:"linear-gradient(135deg,#2438B8,#3C5BFF)",
              border:"none", borderRadius: 16,
              color:"#FFF", fontSize: 14, fontWeight: 700,
              fontFamily: FONT, cursor:"pointer",
              marginBottom: 8,
              boxShadow:"0 4px 16px rgba(60,91,255,0.35)",
            }}>
               Ajouter à mon journal
            </button>

            {/* Nouvelle analyse */}
            <button onClick={() => { setStep("upload"); setResult(null); setPreview(null); setBase64(null); }} style={{
              width:"100%", padding:"12px",
              background:"transparent", border:`1px solid ${C.bd}`,
              borderRadius: 16, color: C.mid,
              fontSize: 13, fontWeight: 500, fontFamily: FONT, cursor:"pointer",
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
