import { FONT, SERIF, NUM } from "../../../data/constants.js";
import { Card, Eyebrow } from "../../../components/ui/index.jsx";

import { useState, useMemo } from "react";


// ─── Helpers ──────────────────────────────────────────────────────────────────
export function avg(arr) { return arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0; }

export function statusBadge(pct) {
  if (pct >= 95) return { label:"✅ Excellent",    color:"#34D399", bg:"rgba(52,211,153,0.10)",  bd:"rgba(52,211,153,0.22)" };
  if (pct >= 80) return { label:"🔶 Peut mieux faire", color:"#FBBF24", bg:"rgba(251,191,36,0.10)", bd:"rgba(251,191,36,0.22)" };
  return              { label:"⚠️ À améliorer",   color:"#F87171", bg:"rgba(248,113,113,0.10)", bd:"rgba(248,113,113,0.22)" };
}

export function microStatus(s) {
  const map = {
    ok:   { color:"#34D399", bg:"rgba(52,211,153,0.10)", bd:"rgba(52,211,153,0.22)", label:"Dans la cible" },
    warn: { color:"#FBBF24", bg:"rgba(251,191,36,0.10)", bd:"rgba(251,191,36,0.22)", label:"À surveiller" },
    bad:  { color:"#F87171", bg:"rgba(248,113,113,0.10)", bd:"rgba(248,113,113,0.22)", label:"Carence possible" },
  };
  return map[s] || map.warn;
}

// Calcul du bilan depuis les données repas des 14 derniers jours
export function computeBilan(repasHistory, calObj, pObj, gObj, lObj, profil) {
  // Extraire les stats journalières simulées (14 derniers jours)
  // En prod ce sera vrai historique — pour l'instant on agrège les repas actuels
  const days = repasHistory || [];
  const totalDays = Math.max(days.length, 1);

  const avgKcal  = avg(days.map(d => d.kcal || 0)) || 0;
  const avgProt  = avg(days.map(d => d.prot || 0)) || 0;
  const avgGluc  = avg(days.map(d => d.gluc || 0)) || 0;
  const avgLip   = avg(days.map(d => d.lip  || 0)) || 0;
  const avgEau   = avg(days.map(d => d.eau  || 0)) || 0;

  const pctProt = calObj ? Math.round((avgProt  / (pObj || 1)) * 100) : 0;
  const pctGluc = calObj ? Math.round((avgGluc  / (gObj || 1)) * 100) : 0;
  const pctLip  = calObj ? Math.round((avgLip   / (lObj || 1)) * 100) : 0;
  const pctKcal = calObj ? Math.round((avgKcal  / (calObj || 1)) * 100) : 0;

  const daysOk     = days.filter(d => d.kcal && Math.abs(d.kcal - calObj) < calObj * 0.15).length;
  const daysWarn   = days.filter(d => d.kcal && Math.abs(d.kcal - calObj) >= calObj * 0.15 && Math.abs(d.kcal - calObj) < calObj * 0.30).length;
  const daysBad    = Math.max(0, totalDays - daysOk - daysWarn);

  const score = Math.max(0, Math.min(10,
    (pctKcal >= 85 ? 2 : pctKcal >= 70 ? 1 : 0) +
    (pctProt >= 90 ? 2.5 : pctProt >= 75 ? 1.5 : 0.5) +
    (pctGluc >= 90 ? 2 : pctGluc >= 75 ? 1 : 0) +
    (pctLip  >= 85 ? 1.5 : pctLip  >= 70 ? 1 : 0) +
    (avgEau  >= 7  ? 1 : avgEau >= 5 ? 0.5 : 0) +
    (daysOk > 8 ? 1 : daysOk > 5 ? 0.5 : 0)
  )).toFixed(1);

  return { avgKcal, avgProt, avgGluc, avgLip, avgEau,
           pctProt, pctGluc, pctLip, pctKcal,
           daysOk, daysWarn, daysBad, totalDays, score };
}

// Construit le prompt bilan pour l'API
export function buildBilanPrompt(bilan, profil, obj, calObj, pObj, gObj, lObj) {
  const isVege = profil.regime === "vegetarien" || profil.regime === "vegan";
  const isVegan = profil.regime === "vegan";
  const isSG = profil.regime === "sans_gluten";

  return `Tu es un nutritionniste et expert en diététique haut de gamme spécialisé dans l'analyse alimentaire, les habitudes nutritionnelles et l'éducation nutritionnelle.

Ton rôle est uniquement de réaliser des bilans nutritionnels détaillés et des analyses alimentaires personnalisées.
Tu ne dois jamais fournir de programme alimentaire complet, de régime, de plan de repas, de menus imposés, de prescription médicale, ni de protocole thérapeutique.
Tu peux en revanche donner des conseils nutritionnels, suggérer des axes d'amélioration, proposer des objectifs de consommation, recommander des ajustements progressifs et réalistes.

Profil de l'utilisateur :
- Objectif : ${obj?.l || "Non défini"}
- TDEE estimé : ${calObj} kcal/jour
- Préférence alimentaire : ${isVegan ? "Vegan" : isVege ? "Végétarien" : isSG ? "Sans gluten" : "Omnivore"}
- Poids : ${profil.poids || "?"} kg · Taille : ${profil.taille || "?"} cm · Âge : ${profil.age || "?"} ans

Données nutritionnelles des 14 derniers jours (moyennes) :
- Calories : ${Math.round(bilan.avgKcal)} kcal/j (cible ${calObj} kcal — ${bilan.pctKcal}%)
- Protéines : ${Math.round(bilan.avgProt)}g/j (cible ${pObj}g — ${bilan.pctProt}%)
- Glucides : ${Math.round(bilan.avgGluc)}g/j (cible ${gObj}g — ${bilan.pctGluc}%)
- Lipides : ${Math.round(bilan.avgLip)}g/j (cible ${lObj}g — ${bilan.pctLip}%)
- Hydratation : ${bilan.avgEau} verres/j (cible 8 verres)
- Jours dans la cible calorique : ${bilan.daysOk}/${bilan.totalDays}
- Score de cohérence global : ${bilan.score}/10

Réalise maintenant un bilan nutritionnel complet en suivant EXACTEMENT cette structure et ce format JSON.
Réponds UNIQUEMENT avec du JSON valide, sans texte avant ni après, sans backticks markdown.

{
  "resume": "Résumé global en 2-3 phrases, ton professionnel et motivant.",
  "points_positifs": ["Point positif 1", "Point positif 2", "Point positif 3"],
  "points_ameliorer": ["Point à améliorer 1", "Point à améliorer 2", "Point à améliorer 3"],
  "analyse_macros": "Analyse détaillée des macros en 3-4 phrases, avec impact sur l'objectif.",
  "micronutriments": {
    "fer":        {"statut": "ok|warn|bad", "note": "Note courte"},
    "vitamine_b12": {"statut": "ok|warn|bad", "note": "Note courte"},
    "calcium":    {"statut": "ok|warn|bad", "note": "Note courte"},
    "magnesium":  {"statut": "ok|warn|bad", "note": "Note courte"},
    "zinc":       {"statut": "ok|warn|bad", "note": "Note courte"},
    "vitamine_d": {"statut": "ok|warn|bad", "note": "Note courte"},
    "omega3":     {"statut": "ok|warn|bad", "note": "Note courte"},
    "vitamine_c": {"statut": "ok|warn|bad", "note": "Note courte"}
  },
  "analyse_sucres": "Analyse des sucres ajoutés et produits transformés en 2-3 phrases.",
  "hydratation": "Analyse de l'hydratation en 2 phrases avec conseil concret.",
  "habitudes": "Analyse des habitudes et régularité en 2-3 phrases.",
  "risques": ["Risque ou déséquilibre 1", "Risque ou déséquilibre 2"],
  "objectifs": [
    {"titre": "Objectif 1", "detail": "Explication courte et actionnable"},
    {"titre": "Objectif 2", "detail": "Explication courte et actionnable"},
    {"titre": "Objectif 3", "detail": "Explication courte et actionnable"},
    {"titre": "Objectif 4", "detail": "Explication courte et actionnable"},
    {"titre": "Objectif 5", "detail": "Explication courte et actionnable"}
  ],
  "conclusion": "Conclusion motivante, humaine, pédagogique, 3-4 phrases maximum."
}

Adapte tout au profil végétarien/vegan/sans-gluten si pertinent. Ne jamais inventer de données manquantes.`;
}

export function Badge({ label, color, bg, bd }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center",
      padding:"2px 8px", borderRadius:5, fontSize:10, fontWeight:600,
      fontFamily:FONT, letterSpacing:"0.3px",
      color, background:bg, border:`1px solid ${bd}` }}>
      {label}
    </span>
  );
}

export function SectionHeader({ num, title, color = "#3B82F6" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8,
      margin:"18px 0 10px" }}>
      <div style={{ width:24, height:24, borderRadius:7,
        background:color, display:"grid", placeItems:"center",
        fontSize:11, fontWeight:700, color:"#fff", fontFamily:FONT,
        flexShrink:0 }}>{num}</div>
      <div style={{ fontSize:14, fontWeight:700, color:"#F2F4F7",
        fontFamily:FONT }}>{title}</div>
    </div>
  );
}

export function MacroRow({ label, color, value, goal, pct }) {
  const st = statusBadge(pct);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:5 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:7, height:7, borderRadius:2,
            background:color, display:"inline-block" }}/>
          <span style={{ fontSize:13, fontWeight:600, color:"#F2F4F7",
            fontFamily:FONT }}>{label}</span>
        </div>
        <div>
          <span style={{ fontSize:14, fontWeight:700,
            color:st.color, fontFamily:FONT, ...NUM }}>{Math.round(value)}g</span>
          <span style={{ fontSize:11, color:"rgba(242,244,247,0.35)",
            marginLeft:4, fontFamily:FONT }}>/ {goal}g</span>
        </div>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${Math.min(100,pct)}%`,
          background:color, borderRadius:3, transition:"width .8s ease" }}/>
      </div>
      <div style={{ marginTop:4 }}>
        <span style={{ fontSize:11, color:st.color, fontFamily:FONT }}>
          {st.label} · {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── BILAN NUTRITION ─────────────────────────────────────────────────────────