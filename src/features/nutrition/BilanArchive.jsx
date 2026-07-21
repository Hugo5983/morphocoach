// ─── BilanArchive.jsx ────────────────────────────────────────────────────────
// Historique des bilans bi-hebdomadaires archivés.
// Liste consultable avec score lettre + graphique d'évolution sur les 6 derniers.

import { useMemo, useEffect } from"react";
import { Ico as UIco } from"../../components/ui/Icon.jsx";
import useScrollTop from"../../hooks/useScrollTop.js";
import { useSwipeBack } from"../../hooks/useSwipeBack.js";
import { C, FONT, SERIF, NUM } from"../../data/constants.js";

const BG   = C.bg;
const S1   = C.s1 ||"#FFFFFF";
const BD   = C.bd ||"rgba(0,0,0,0.05)";
const TEXT = C.text ||"${C.text}";
const MID  = C.mid ||"${C.mid}";
const DIM  = C.dim ||"${C.dim}";
const BL   = C.accent || C.accent;
const GRN  ="#12B76A";
const AMB  ="#F59E0B";
const RED  ="#E5484D";

function I({name,size=18,color="currentColor",stroke=1.8,...r}){
  return <UIco name={name} size={size} color={color} stroke={stroke} {...r}/>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function letterFromScore(score) {
  if (score >= 85) return"A";
  if (score >= 70) return"B";
  if (score >= 55) return"C";
  if (score >= 40) return"D";
  return"E";
}
function colorFromLetter(l) {
  if (l ==="A") return { fg:GRN,  bg:"rgba(18,183,106,0.12)",  bd:"rgba(18,183,106,0.25)" };
  if (l ==="B") return { fg:GRN,  bg:"rgba(18,183,106,0.08)",  bd:"rgba(18,183,106,0.25)" };
  if (l ==="C") return { fg:AMB,  bg:"rgba(245,158,11,0.12)",  bd:"rgba(245,158,11,0.25)" };
  if (l ==="D") return { fg:RED,  bg:"rgba(229,72,77,0.12)", bd:"rgba(229,72,77,0.25)" };
  return            { fg:RED,  bg:"rgba(229,72,77,0.12)", bd:"rgba(229,72,77,0.25)" };
}

function formatPeriod(start, end) {
  const fmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
  return`${fmt(start)} · ${fmt(end)}`;
}

// ─── Composant principal ──────────────────────────────────────────────────
export default function BilanArchive({ onBack, bilans = [], onOpenBilan, currentBilan }) {
  useScrollTop();
  // Remonter en haut à l'ouverture de l'historique
  useEffect(() => {
    window.scrollTo(0, 0);
    try { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch {}
  }, []);
  // Tri : plus récent en premier
  const sorted = useMemo(() =>
    [...bilans].sort((a, b) => new Date(b.endDate) - new Date(a.endDate)),
    [bilans]
);

  // 6 derniers pour le graphique d'évolution
  const last6 = useMemo(() => sorted.slice(0, 6).reverse(), [sorted]);

  const trend = (() => {
    if (last6.length < 2) return null;
    const first = last6[0].healthScore;
    const last  = last6[last6.length-1].healthScore;
    if (last > first + 5)  return { dir:"up",   color:GRN, label:"↗" };
    if (last < first - 5)  return { dir:"down", color:RED, label:"↘" };
    return { dir:"flat", color:AMB, label:"·" };
  })();

  const avgScore = last6.length
    ? Math.round(last6.reduce((a, b) => a + b.healthScore, 0) / last6.length)
    : 0;
  const bestScore = last6.length
    ? Math.max(...last6.map(b => b.healthScore))
    : 0;

  const { swipeStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeBack(onBack);

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:FONT, paddingBottom:32, ...swipeStyle }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {/* Header */}
      <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none",
          color:BL, cursor:"pointer", fontSize:13, fontWeight:700,
          display:"flex", alignItems:"center", gap:4, fontFamily:FONT }}>
          <I name="chevL" size={15} stroke={2.5}/> Retour
        </button>
      </div>

      <div style={{ padding:"0 20px 16px" }}>
        <div style={{ fontFamily:SERIF, fontSize:20, fontWeight:700,
          color:TEXT, letterSpacing:-0.5, lineHeight:1.1 }}>
          Historique des bilans
        </div>
        <div style={{ fontSize:13, color:MID, marginTop:4, fontFamily:FONT }}>
          Rapports bi-hebdomadaires archivés
        </div>
      </div>

      {/* Bilan en cours */}
      {currentBilan && (
        <>
          <div style={{ padding:"8px 20px 8px" }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em",
              textTransform:"uppercase", color:DIM, padding:"0 4px", fontFamily:FONT }}>
              En cours
            </div>
          </div>
          <div style={{ padding:"0 16px" }}>
            <BilanCard bilan={currentBilan} onClick={() => onOpenBilan?.(currentBilan)} current/>
          </div>
        </>
)}

      {/* Historique */}
      {sorted.length > 0 ? (
        <>
          <div style={{ padding:"16px 20px 8px" }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em",
              textTransform:"uppercase", color:DIM, padding:"0 4px", fontFamily:FONT }}>
              {sorted.length} bilan{sorted.length>1?"s":""} précédent{sorted.length>1?"s":""}
            </div>
          </div>
          <div style={{ padding:"0 16px" }}>
            {sorted.map(b => (
              <BilanCard key={b.id} bilan={b} onClick={() => onOpenBilan?.(b)}/>
))}
          </div>
        </>
) : (
        <div style={{ margin:"20px 16px", padding:"24px 20px",
          background:S1, border:`1px solid ${BD}`, borderRadius:16,
          textAlign:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:TEXT, marginBottom:8, fontFamily:FONT }}>
            Pas encore de bilan archivé
          </div>
          <div style={{ fontSize:13, color:MID, lineHeight:1.5, fontFamily:FONT }}>
            Ton premier bilan complet sera généré automatiquement dimanche prochain à 9h.
          </div>
        </div>
)}

      {/* Graphique d'évolution */}
      {last6.length >= 2 && (
        <>
          <div style={{ padding:"20px 16px 8px" }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em",
              textTransform:"uppercase", color:DIM, padding:"0 4px", fontFamily:FONT }}>
              Évolution score · {last6.length} derniers bilans
            </div>
          </div>
          <div style={{ margin:"0 16px", padding:"20px 12px 12px",
            background:S1, border:`1px solid ${BD}`, borderRadius:20 }}>
            <TrendChart bilans={last6}/>
            <div style={{ display:"flex", justifyContent:"space-between",
              paddingTop:16, marginTop:8, borderTop:"1px solid rgba(0,0,0,0.05)" }}>
              <Stat icon={trend?.label ||"·"} color={trend?.color || MID} label="Tendance"/>
              <Stat letter={letterFromScore(avgScore)} label="Moyenne"/>
              <Stat letter={letterFromScore(bestScore)} label="Meilleur" highlight/>
            </div>
          </div>
        </>
)}
    </div>
);
}

// ─── Carte bilan ─────────────────────────────────────────────────────────
function BilanCard({ bilan, onClick, current }) {
  const letter = letterFromScore(bilan.healthScore);
  const colors = colorFromLetter(letter);

  return (
    <button onClick={onClick} style={{
      width:"100%", padding:"16px 16px",
      background: current ?"rgba(60,91,255,0.05)" : S1,
      border:`1px solid ${current ?"rgba(60,91,255,0.25)" : BD}`,
      borderRadius:16, marginBottom:8,
      display:"flex", gap:12, alignItems:"center",
      cursor:"pointer", textAlign:"left",
      transition:"border-color .18s" }}>
      <div style={{ width:44, height:44, borderRadius:12,
        background:colors.bg, border:`1px solid ${colors.bd}`,
        display:"grid", placeItems:"center", flexShrink:0,
        fontFamily:SERIF, fontSize:26, fontWeight:400, lineHeight:1,
        color:colors.fg }}>
        {letter}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:2, fontFamily:FONT }}>
          {formatPeriod(bilan.startDate, bilan.endDate)}
          {current &&" · en cours"}
        </div>
        <div style={{ fontSize:11, color:MID, fontFamily:FONT }}>
          {bilan.nbLogged} jour{bilan.nbLogged>1?"s":""} loggé{bilan.nbLogged>1?"s":""}
          {bilan.avgKcal > 0 &&` · ${Math.round(bilan.avgKcal)} kcal/j moy.`}
        </div>
      </div>
      {current ? (
        <span style={{ padding:"2px 8px", background:"rgba(60,91,255,0.12)",
          border:"1px solid rgba(60,91,255,0.35)", borderRadius:999,
          fontSize:10, fontWeight:700, color:C.blueLt, letterSpacing:"0.1em", fontFamily:FONT }}>
          EN COURS
        </span>
) : (
        <I name="chevR" size={16} color={MID}/>
)}
    </button>
);
}

// ─── Graphique d'évolution ────────────────────────────────────────────────
function TrendChart({ bilans }) {
  const W = 320, H = 90;
  if (bilans.length < 2) return null;
  const xs = bilans.map((_, i) => (W * (i + 0.5)) / bilans.length);
  const ys = bilans.map(b => H * (1 - b.healthScore / 100));
  const path = xs.map((x, i) =>`${i === 0 ?"M" :"L"}${x.toFixed(0)},${ys[i].toFixed(0)}`).join("");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      style={{ width:"100%", height:H, overflow:"visible" }}>
      {[22, 45, 68].map(y => (
        <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="rgba(0,0,0,0.05)"/>
))}
      <path d={path} fill="none" stroke="url(#trendG)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="trendG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={RED}/>
          <stop offset="50%"  stopColor={AMB}/>
          <stop offset="100%" stopColor={GRN}/>
        </linearGradient>
      </defs>
      {bilans.map((b, i) => {
        const l = letterFromScore(b.healthScore);
        const col = colorFromLetter(l).fg;
        return (
          <g key={i}>
            <circle cx={xs[i]} cy={ys[i]} r="5" fill={col} stroke={BG} strokeWidth="2"/>
            <text x={xs[i]} y={H - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={col}>{l}</text>
          </g>
);
      })}
    </svg>
);
}

function Stat({ icon, letter, color, label, highlight }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{
        fontFamily: letter ? SERIF : FONT,
        fontSize:14, fontWeight:700,
        color: color || (highlight ? GRN : TEXT) }}>
        {icon || letter}
      </div>
      <div style={{ fontSize:10, color:DIM, marginTop:2, letterSpacing:0.2,
        textTransform:"uppercase", fontWeight:700, fontFamily:FONT }}>
        {label}
      </div>
    </div>
);
}
