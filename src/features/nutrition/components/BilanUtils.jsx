// ─── BilanUtils.jsx — v3 ─────────────────────────────────────────────────────
// Helpers de calcul OBJECTIF (somme des aliments rentrés, pas d'IA interprétative)

import { FONT, SERIF, NUM } from "../../../data/constants.js";

// ─── Helpers généraux ──────────────────────────────────────────────────────
export function avg(arr) { return arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0; }
export function sum(arr) { return arr.reduce((a,b) => a+b, 0); }

// ─── Seuils & constantes ──────────────────────────────────────────────────
export const MIN_DAYS_FULL_BILAN = 7;          // < 7j sur 14 → bandeau partiel
export const PERIOD_DAYS         = 14;         // période bilan bi-hebdo

// ─── Statuts visuels ──────────────────────────────────────────────────────
export function statusBadge(pct) {
  if (pct >= 95) return { label:"✅ Excellent",       color:"#34D399", bg:"rgba(52,211,153,0.10)",  bd:"rgba(52,211,153,0.22)" };
  if (pct >= 80) return { label:"🔶 Peut mieux faire", color:"#FBBF24", bg:"rgba(251,191,36,0.10)",  bd:"rgba(251,191,36,0.22)" };
  return              { label:"⚠️ À améliorer",       color:"#F87171", bg:"rgba(248,113,113,0.10)", bd:"rgba(248,113,113,0.22)" };
}

// ─── Enrichissement aliment depuis la base FOODS ───────────────────────────
import { FOODS } from "../../../data/foods.js";
const FOODS_BY_NAME = {};
for (const f of FOODS) FOODS_BY_NAME[(f.n||"").toLowerCase()] = f;

export function enrichItem(item) {
  if (item.fi !== undefined && item.cat) return item;
  const key = (item.n || item.nom || "").toLowerCase();
  const match = FOODS_BY_NAME[key] ||
    FOODS.find(f => key && key.includes(f.n.toLowerCase().split(" ")[0]));
  if (!match) return item;
  return { ...match, ...item, cat: item.cat || match.cat };
}

// Agrège les vrais aliments rentrés (today) en totaux nutritionnels mesurables
export function aggregateFoods(items) {
  const it = (items || []).map(enrichItem);
  return {
    n:           it.length,
    fibres:      it.reduce((a,f) => a + (f.fi || 0), 0),
    sodium:      it.reduce((a,f) => a + (f.na || 0), 0),   // mg
    sucres:      it.reduce((a,f) => a + (f.su || 0), 0),   // g
    saturees:    it.reduce((a,f) => a + (f.sa || 0), 0),   // g
    omega3:      it.filter(f => f.omega3).length,
    qualProt:    it.filter(f => f.qualProt).length,
    legumes:     it.filter(f => f.cat === "Légumes").length,
    fruits:      it.filter(f => f.cat === "Fruits").length,
    transformes: it.filter(f => f.cat === "Scanné" || f.cat === "Transformé").length,
  };
}

// ─── Score santé alimentaire (lettre A→E + score /100) ─────────────────────
export function computeHealthScore(criteria) {
  const total = criteria.reduce((a, c) => a + c.pts, 0);
  const max   = criteria.reduce((a, c) => a + c.max, 0);
  const score = max > 0 ? Math.round((total / max) * 100) : 0;
  let letter, color, pill;
  if (score >= 85)      { letter = "A"; color = "#34D399"; pill = "Excellente qualité"; }
  else if (score >= 70) { letter = "B"; color = "#34D399"; pill = "Bonne qualité"; }
  else if (score >= 55) { letter = "C"; color = "#F59E0B"; pill = "Qualité moyenne"; }
  else if (score >= 40) { letter = "D"; color = "#F87171"; pill = "Qualité faible"; }
  else                  { letter = "E"; color = "#F87171"; pill = "Qualité très faible"; }
  return { score, letter, color, pill, total, max };
}

// ─── Critères santé — calculés sur les VRAIS aliments rentrés ──────────────
export function computeCriteria(items) {
  const a = aggregateFoods(items);

  const score = (val, { good, ok, max, lower=false }) => {
    if (lower) {
      if (val <= good) return max;
      if (val <= ok)   return Math.round(max * 0.6);
      return Math.round(max * 0.25);
    }
    if (val >= good) return max;
    if (val >= ok)   return Math.round(max * 0.6);
    return Math.round(max * 0.25);
  };

  const selG = a.sodium / 393;   // 1 g sel ≈ 393 mg sodium
  const fv   = a.legumes + a.fruits;

  return [
    { key:"fruits_veg",  icon:"🥬", name:"Fruits & légumes",   pts: score(fv,         { good:5,  ok:3,  max:18 }),            max:18, val:`${fv} portion${fv>1?"s":""}` },
    { key:"fibres",      icon:"🌾", name:"Fibres",             pts: score(a.fibres,   { good:25, ok:15, max:16 }),            max:16, val:`${Math.round(a.fibres)}g · objectif 25g` },
    { key:"omega3",      icon:"🥑", name:"Bonnes graisses",    pts: score(a.omega3,   { good:2,  ok:1,  max:14 }),            max:14, val:`${a.omega3} source${a.omega3>1?"s":""} d'oméga-3` },
    { key:"qual_prot",   icon:"🍗", name:"Protéines de qualité",pts: score(a.qualProt,{ good:2,  ok:1,  max:14 }),            max:14, val:`${a.qualProt} source${a.qualProt>1?"s":""} complète${a.qualProt>1?"s":""}` },
    { key:"sucres",      icon:"🍬", name:"Sucres",             pts: score(a.sucres,   { good:25, ok:40, max:12, lower:true }),max:12, val:`${Math.round(a.sucres)}g · OMS < 25g` },
    { key:"sel",         icon:"🧂", name:"Sel",                pts: score(selG,       { good:5,  ok:7,  max:12, lower:true }),max:12, val:`${selG.toFixed(1)}g · OMS < 5g` },
    { key:"saturees",    icon:"🧈", name:"Graisses saturées",  pts: score(a.saturees, { good:15, ok:22, max:8,  lower:true }), max:8,  val:`${Math.round(a.saturees)}g · viser < 15g` },
    { key:"transformes", icon:"🍞", name:"Aliments transformés",pts: score(a.transformes,{ good:0, ok:1, max:6,  lower:true }), max:6,  val:`${a.transformes} produit${a.transformes>1?"s":""} transformé${a.transformes>1?"s":""}` },
  ];
}

// ─── Indicateurs nutritionnels mesurés (remplace les micros non suivis) ────
// On n'affiche QUE ce qu'on mesure réellement (pas de Fer/Calcium/Vit fictifs).
export function computeIndicators(items) {
  const a = aggregateFoods(items);
  const selG = a.sodium / 393;
  const mk = (val, goal, lower) => {
    const ratioRaw = lower ? (goal>0 ? (2 - val/goal) : 0) : (goal>0 ? val/goal : 0);
    const pct = Math.max(0, Math.min(100, Math.round(ratioRaw * 100)));
    const st = pct >= 80 ? { color:"#34D399", statusLabel:"Bon" }
             : pct >= 50 ? { color:"#F59E0B", statusLabel:"Moyen" }
             :             { color:"#F87171", statusLabel:"Faible" };
    return { val, goal, pct, ...st };
  };
  return [
    { key:"fibres",   label:"Fibres",            unit:"g", ...mk(a.fibres,   25, false) },
    { key:"omega3",   label:"Oméga-3",           unit:"",  display:`${a.omega3}`,  ...mk(a.omega3,   2,  false) },
    { key:"qualProt", label:"Protéines qualité", unit:"",  display:`${a.qualProt}`,...mk(a.qualProt, 2,  false) },
    { key:"sucres",   label:"Sucres",            unit:"g", lower:true, ...mk(a.sucres,   25, true) },
    { key:"sel",      label:"Sel",               unit:"g", lower:true, display:`${selG.toFixed(1)}`, ...mk(selG, 5, true) },
    { key:"saturees", label:"Graisses sat.",     unit:"g", lower:true, ...mk(a.saturees, 15, true) },
  ];
}

// ─── Répartition par catégorie alimentaire ─────────────────────────────────
export function computeCategories(loggedDays) {
  const totals = {
    legumes: 0, proteines_animales: 0, cereales: 0,
    fruits: 0, sucres_snacks: 0, bonnes_graisses: 0
  };
  loggedDays.forEach(d => {
    Object.keys(totals).forEach(k => { totals[k] += d.categories?.[k] || 0; });
  });
  const tot = sum(Object.values(totals)) || 1;
  const cats = [
    { key:"legumes",            label:"Légumes",            icon:"🥬", color:"#34D399" },
    { key:"proteines_animales", label:"Protéines animales", icon:"🥩", color:"#60A5FA" },
    { key:"cereales",           label:"Céréales complètes", icon:"🌾", color:"#F59E0B" },
    { key:"fruits",             label:"Fruits",             icon:"🍎", color:"#A5B4FC" },
    { key:"sucres_snacks",      label:"Sucres / Snacks",    icon:"🍫", color:"#F87171" },
    { key:"bonnes_graisses",    label:"Bonnes graisses",    icon:"🥑", color:"#22D3EE" },
  ];
  return cats.map(c => ({ ...c, pct: Math.round((totals[c.key] / tot) * 100) }));
}

// ─── Bilan principal (refactor : pas d'IA, données partielles supportées) ──
export function computeBilan(repasHistory, calObj, pObj, gObj, lObj) {
  const days = repasHistory || [];
  const loggedDays = days.filter(d => (d.kcal || 0) > 0);
  const totalDays  = days.length || PERIOD_DAYS;
  const nbLogged   = loggedDays.length;

  // Moyennes sur les jours réellement loggés (pas sur toute la période)
  const avgKcal = avg(loggedDays.map(d => d.kcal || 0));
  const avgProt = avg(loggedDays.map(d => d.prot || 0));
  const avgGluc = avg(loggedDays.map(d => d.gluc || 0));
  const avgLip  = avg(loggedDays.map(d => d.lip  || 0));
  const avgEau  = avg(loggedDays.map(d => d.eau  || 0));

  const pctKcal = calObj ? Math.round((avgKcal / calObj) * 100) : 0;
  const pctProt = pObj   ? Math.round((avgProt / pObj)   * 100) : 0;
  const pctGluc = gObj   ? Math.round((avgGluc / gObj)   * 100) : 0;
  const pctLip  = lObj   ? Math.round((avgLip  / lObj)   * 100) : 0;

  // Classification des jours
  const daysOk   = loggedDays.filter(d => d.kcal && Math.abs(d.kcal - calObj) < calObj * 0.15).length;
  const daysWarn = loggedDays.filter(d => d.kcal && Math.abs(d.kcal - calObj) >= calObj * 0.15 && Math.abs(d.kcal - calObj) < calObj * 0.30).length;
  const daysBad  = nbLogged - daysOk - daysWarn;
  const daysEmpty= totalDays - nbLogged;

  // Score de cohérence /10 (calcul objectif, pas d'IA)
  const score = Math.max(0, Math.min(10,
    (pctKcal >= 85 ? 2   : pctKcal >= 70 ? 1   : 0) +
    (pctProt >= 90 ? 2.5 : pctProt >= 75 ? 1.5 : 0.5) +
    (pctGluc >= 90 ? 2   : pctGluc >= 75 ? 1   : 0) +
    (pctLip  >= 85 ? 1.5 : pctLip  >= 70 ? 1   : 0) +
    (avgEau  >= 7  ? 1   : avgEau  >= 5  ? 0.5 : 0) +
    (daysOk > 8 ? 1 : daysOk > 5 ? 0.5 : 0)
  ));

  // Détection données partielles
  const isPartial = nbLogged < MIN_DAYS_FULL_BILAN;

  return {
    avgKcal, avgProt, avgGluc, avgLip, avgEau,
    pctKcal, pctProt, pctGluc, pctLip,
    daysOk, daysWarn, daysBad, daysEmpty,
    nbLogged, totalDays,
    loggedDays,                // pour les calculs détaillés
    score: score.toFixed(1),
    isPartial,
  };
}

// ─── Composants UI partagés ───────────────────────────────────────────────
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

export function SectionHeader({ title, hint }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      margin:"0 4px 10px", padding:"0 4px" }}>
      <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:"1.5px",
        textTransform:"uppercase", color:"${C.dim}", fontFamily:FONT }}>
        {title}
      </div>
      {hint && (
        <div style={{ fontSize:10, color:"#374151", fontWeight:700,
          letterSpacing:"0.3px", fontFamily:FONT }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function MacroRow({ label, color, value, goal, pct, partial }) {
  const st = statusBadge(pct);
  const delta = pct - 100;
  const ICONS = { Protéines: "P", Glucides: "G", Lipides: "L" };
  const COLORS = {
    Protéines: { bg:"rgba(96,165,250,0.12)",  fg:"#60A5FA", bd:"rgba(96,165,250,0.25)",  fillFrom:"#60A5FA", fillTo:"#3B82F6" },
    Glucides:  { bg:"rgba(34,211,238,0.12)",  fg:"#22D3EE", bd:"rgba(34,211,238,0.25)",  fillFrom:"#22D3EE", fillTo:"#0EA5E9" },
    Lipides:   { bg:"rgba(52,211,153,0.12)",  fg:"#34D399", bd:"rgba(52,211,153,0.25)",  fillFrom:"#34D399", fillTo:"#10B981" },
  };
  const c = COLORS[label] || COLORS.Protéines;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0",
      borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
      <div style={{ width:38, height:38, borderRadius:11, display:"grid",
        placeItems:"center", flexShrink:0, fontSize:16, fontWeight:800,
        background:c.bg, color:c.fg, border:`1px solid ${c.bd}` }}>
        {ICONS[label] || "M"}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"${C.text}", fontFamily:FONT }}>{label}</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
            <span style={{ fontSize:14, fontWeight:700, color:"${C.text}", fontFamily:FONT, ...NUM }}>{Math.round(value)}g</span>
            <span style={{ fontSize:11, color:"${C.dim}", fontFamily:FONT }}>/ {goal}g</span>
          </div>
        </div>
        <div style={{ height:5, background:"rgba(0,0,0,0.04)", borderRadius:99, overflow:"hidden", marginBottom:5 }}>
          <div style={{ height:"100%", width:`${Math.min(100,pct)}%`,
            background:`linear-gradient(90deg, ${c.fillFrom}, ${c.fillTo})`, borderRadius:99,
            transition:"width .8s ease" }}/>
        </div>
        <div style={{ fontSize:10.5, color:"${C.mid}", fontFamily:FONT }}>
          <span style={{ display:"inline-block", padding:"2px 7px", borderRadius:4,
            fontSize:9.5, fontWeight:800, letterSpacing:"0.5px", marginRight:5,
            background:st.bg, color:st.color }}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
          {pct}% de la cible
        </div>
      </div>
    </div>
  );
}

// ─── Critère santé visuel ─────────────────────────────────────────────────
export function CritRow({ crit }) {
  const ratio = crit.pts / crit.max;
  let palette;
  if (ratio >= 0.8)      palette = { bg:"rgba(52,211,153,0.10)",  bd:"rgba(52,211,153,0.25)",  color:"#34D399" };
  else if (ratio >= 0.5) palette = { bg:"rgba(245,158,11,0.10)",  bd:"rgba(245,158,11,0.25)",  color:"#F59E0B" };
  else                   palette = { bg:"rgba(248,113,113,0.10)", bd:"rgba(248,113,113,0.25)", color:"#F87171" };

  return (
    <div style={{ padding:"14px 0", borderBottom:"1px solid rgba(0,0,0,0.04)",
      display:"flex", alignItems:"flex-start", gap:12 }}>
      <div style={{ width:38, height:38, borderRadius:11, display:"grid",
        placeItems:"center", flexShrink:0, fontSize:16,
        background:palette.bg, border:`1px solid ${palette.bd}` }}>
        {crit.icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"${C.text}", fontFamily:FONT }}>{crit.name}</div>
          <div style={{ fontSize:11, fontWeight:700, color:palette.color, fontFamily:FONT }}>
            {crit.pts}/{crit.max}
          </div>
        </div>
        <div style={{ fontSize:11, color:"${C.mid}", fontFamily:FONT, marginBottom:6 }}>
          {crit.val}
        </div>
        <div style={{ height:3, background:"rgba(0,0,0,0.05)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${ratio*100}%`,
            background:palette.color, borderRadius:99, transition:"width .8s" }}/>
        </div>
      </div>
    </div>
  );
}
