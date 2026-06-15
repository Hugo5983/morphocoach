// ─── BilanNutrition.jsx — v3 ─────────────────────────────────────────────────
// Bilan PRO Nutrition : objectif, factuel, sans IA interprétative.
// 2 onglets : Tableau de bord (chiffres bruts) + Analyse détaillée (qualité/micros)
// Bandeau "données insuffisantes" si < 7 jours renseignés sur 14.

import { useState, useMemo, useEffect, useRef } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { useSwipeBack } from "../../hooks/useSwipeBack.js";
import {
  computeBilan, computeCriteria, computeIndicators,
  computeHealthScore,
  Badge, SectionHeader, MacroRow, CritRow,
  MIN_DAYS_FULL_BILAN, PERIOD_DAYS,
} from "./components/BilanUtils.jsx";

const BG    = "#F6F8FB";
const S1    = C.s1 || "#FFFFFF";
const S2    = C.s2 || "#F0F2F7";
const BD    = C.bd || "rgba(0,0,0,0.06)";
const TEXT  = C.text || "${C.text}";
const MID   = C.mid || "${C.mid}";
const DIM   = C.dim || "${C.dim}";
const BL    = C.accent || "#3B82F6";
const BLD   = C.accentDk || "#2563EB";
const GRN   = "#34D399";
const AMB   = "#F59E0B";
const RED   = "#F87171";

// ─── Icônes inline (SVG) ──────────────────────────────────────────────────
function I({ name, size=16, color="currentColor", stroke=2 }) {
  const p = { width:size, height:size, viewBox:"0 0 24 24", fill:"none",
    stroke:color, strokeWidth:stroke, strokeLinecap:"round", strokeLinejoin:"round" };
  const paths = {
    chart:    <><path d="M3 3v18h18"/><path d="M7 14l4-4 4 2 5-7"/></>,
    brain:    <><path d="M9 3a4 4 0 0 0-4 4v2.5A4.5 4.5 0 0 0 5 18a4 4 0 0 0 4 4 4 4 0 0 0 4-4V7a4 4 0 0 0-4-4z"/><path d="M15 3a4 4 0 0 1 4 4v2.5A4.5 4.5 0 0 1 19 18a4 4 0 0 1-4 4 4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"/></>,
    alert:    <><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    chevR:    <path d="m9 18 6-6-6-6"/>,
    chevL:    <path d="m15 18-6-6 6-6"/>,
    drop:     <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>,
    arch:     <><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ─── Score Ring ───────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 42, circum = 2 * Math.PI * r;
  const pct = parseFloat(score) / 10;
  const color = parseFloat(score) >= 7 ? GRN : parseFloat(score) >= 4 ? AMB : RED;
  return (
    <div style={{ position:"relative", width:100, height:100, flexShrink:0 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circum}
          strokeDashoffset={circum * (1 - pct)} transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex",
        flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontFamily:SERIF, fontSize:38, fontWeight:400,
          letterSpacing:-2, lineHeight:1, color, ...NUM }}>{score}</div>
        <div style={{ fontSize:10, color:DIM, marginTop:2, fontFamily:FONT }}>sur 10</div>
      </div>
    </div>
  );
}

// ─── Régularité (grille ancrée sur les dates réelles) ─────────────────────
function StreakGrid({ days, calObj }) {
  // days = historique daté réel (du 1er jour loggé → aujourd'hui), max 14
  const arr = Array.isArray(days) ? days.slice(-14) : [];
  const statusOf = (day) => {
    if (!day || !day.kcal) return "empty";
    const diff = Math.abs(day.kcal - calObj);
    const okThr = calObj * 0.15, warnThr = calObj * 0.30;
    if (diff < okThr)  return "ok";
    if (diff < warnThr) return "warn";
    return "bad";
  };
  const dayNum = (iso) => { try { return String(parseInt(iso.split("-")[2], 10)); } catch { return ""; } };

  const styleFor = (st) => {
    if (st === "ok")   return { bg:"linear-gradient(145deg, rgba(52,211,153,0.20), rgba(52,211,153,0.08))", bd:"1px solid rgba(52,211,153,0.35)",  color:GRN };
    if (st === "warn") return { bg:"rgba(245,158,11,0.12)", bd:"1px solid rgba(245,158,11,0.25)",   color:AMB };
    if (st === "bad")  return { bg:"rgba(248,113,113,0.10)", bd:"1px solid rgba(248,113,113,0.22)", color:"#F87171" };
    return                  { bg:"rgba(0,0,0,0.02)",        bd:"1px dashed rgba(0,0,0,0.10)", color:"#9CA3AF" };
  };

  // On répartit en 2 rangées de 7 (les plus récents en bas à droite)
  const padded = [...Array(Math.max(0, 14 - arr.length)).fill(null), ...arr];
  const rows = [padded.slice(0, 7), padded.slice(7, 14)];

  return (
    <>
      {rows.map((row, w) => (
        <div key={w} style={{ display:"flex", gap:4, marginBottom: w===0?6:12 }}>
          {row.map((day, d) => {
            const st = statusOf(day);
            const s = styleFor(st);
            return (
              <div key={d} style={{
                flex:1, aspectRatio:"1", borderRadius:7,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                fontFamily:FONT,
                background:s.bg, border:s.bd, color:s.color }}>
                <span style={{ fontSize:11, fontWeight:800, ...NUM }}>{day ? dayNum(day.date) : "·"}</span>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

// ─── Bandeau "données insuffisantes" ──────────────────────────────────────
function PartialBanner({ nbLogged, totalDays, customMsg }) {
  return (
    <div style={{ margin:"0 16px 14px", background:"rgba(245,158,11,0.08)",
      border:"1px solid rgba(245,158,11,0.30)", borderRadius:14,
      padding:"12px 14px", display:"flex", gap:11, alignItems:"flex-start" }}>
      <div style={{ width:30, height:30, borderRadius:9,
        background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.35)",
        display:"grid", placeItems:"center", flexShrink:0 }}>
        <I name="alert" size={14} color={AMB}/>
      </div>
      <div>
        <div style={{ fontSize:12.5, fontWeight:700, color:AMB, marginBottom:3, fontFamily:FONT }}>
          Données insuffisantes · {nbLogged} jour{nbLogged>1?"s":""} renseigné{nbLogged>1?"s":""} sur {totalDays}
        </div>
        <div style={{ fontSize:11, color:"rgba(245,158,11,0.85)", lineHeight:1.5, fontFamily:FONT }}>
          {customMsg || `Le bilan affiche ce qu'on a, mais reste partiel. Renseigne au moins ${MIN_DAYS_FULL_BILAN} jours pour des indicateurs fiables.`}
        </div>
      </div>
    </div>
  );
}

// ─── Carte "Prochain bilan archivé" ───────────────────────────────────────
function NextBilanCard({ nextDate, daysUntil, onOpen }) {
  return (
    <div onClick={onOpen} style={{ margin:"0 16px 14px",
      background:"linear-gradient(135deg, rgba(59,130,246,0.10), rgba(59,130,246,0.02))",
      border:"1px solid rgba(59,130,246,0.25)", borderRadius:18,
      padding:"14px 16px", display:"flex", gap:12, alignItems:"center", cursor:"pointer" }}>
      <div style={{ width:44, height:44, borderRadius:13,
        background:`linear-gradient(135deg, ${BL}, ${BLD})`,
        display:"grid", placeItems:"center",
        boxShadow:"0 4px 14px rgba(59,130,246,0.30)", flexShrink:0 }}>
        <I name="calendar" size={20} color="#fff"/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:9, fontWeight:800, letterSpacing:"1.4px",
          textTransform:"uppercase", color:"#93C5FD", marginBottom:4, fontFamily:FONT }}>
          Prochain bilan complet
        </div>
        <div style={{ fontSize:13.5, fontWeight:700, color:TEXT, marginBottom:2, fontFamily:FONT }}>
          {nextDate}{daysUntil != null ? ` · dans ${daysUntil} jour${daysUntil>1?"s":""}` : ""}
        </div>
        <div style={{ fontSize:11, color:MID, fontFamily:FONT }}>
          Rapport bi-hebdomadaire automatique
        </div>
      </div>
      <I name="chevR" size={16} color={MID}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
export default function BilanNutrition({
  onBack, repasHistory, repas, foods, calObj, pObj, gObj, lObj, profil, obj, premium,
  onOpenArchive,
}) {
  const [activeTab, setActiveTab] = useState(0);   // 0 = Tableau de bord, 1 = Analyse détaillée
  const scrollRef = useRef(null);

  // À l'ouverture du bilan → toujours en haut de la page
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  // Calculs objectifs (zéro IA)
  const bilan = useMemo(() =>
    computeBilan(repasHistory, calObj, pObj, gObj, lObj),
    [repasHistory, calObj, pObj, gObj, lObj]
  );

  // Vrais aliments rentrés (journée courante) → score qualité exact
  const realItems = useMemo(() => {
    const r = repas || {};
    return [...(r.matin||[]), ...(r.midi||[]), ...(r.soir||[]), ...(r.snack||[])];
  }, [repas]);

  const criteria   = useMemo(() => computeCriteria(realItems), [realItems]);
  const indicators = useMemo(() => computeIndicators(realItems), [realItems]);
  const health     = useMemo(() => computeHealthScore(criteria), [criteria]);
  const hasFood    = realItems.length > 0;

  // Date du prochain bilan (dimanche prochain)
  const today = new Date();
  const daysToSunday = (7 - today.getDay()) % 7 || 7;
  const nextSunday = new Date(today.getTime() + daysToSunday * 86400000);
  const nextBilanLabel = nextSunday.toLocaleDateString("fr-FR",
    { weekday:"long", day:"numeric", month:"long" });

  // ─── HEADER (commun aux 2 onglets) ─────────────────────────────────────
  const renderHeader = () => (
    <>
      {/* Sous-onglets Tableau de bord / Analyse détaillée */}
      <div style={{ margin:"0 16px 14px", display:"flex", gap:4 }}>
        {[
          { label:"Tableau de bord",   ico:"chart" },
          { label:"Analyse détaillée", ico:"brain" },
        ].map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            style={{ flex:1, padding:"10px 0", borderRadius:11,
              fontSize:12.5, fontWeight:700, fontFamily:FONT,
              border:`1px solid ${activeTab===i ? "rgba(59,130,246,0.35)" : BD}`,
              background: activeTab===i ? "rgba(59,130,246,0.10)" : S1,
              color: activeTab===i ? "#93C5FD" : MID,
              cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              transition:"all .18s" }}>
            <I name={tab.ico} size={14} stroke={activeTab===i ? 2.2 : 1.8}/>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bandeau partiel */}
      {bilan.isPartial && (
        <PartialBanner nbLogged={bilan.nbLogged} totalDays={bilan.totalDays}/>
      )}
    </>
  );

  // ─── ONGLET 1 · Tableau de bord ────────────────────────────────────────
  const renderDashboard = () => (
    bilan.nbLogged === 0 ? (
      <div style={{ margin:"8px 16px 14px" }}>
        <div style={{ background:S1, border:`1px solid ${BD}`, borderRadius:22,
          padding:"34px 24px", textAlign:"center" }}>
          <div style={{ fontSize:34, marginBottom:12 }}>🍽️</div>
          <div style={{ fontSize:17, fontWeight:700, color:TEXT, fontFamily:FONT, marginBottom:8 }}>
            En attente de ton premier jour
          </div>
          <div style={{ fontSize:13, color:MID, lineHeight:1.55, fontFamily:FONT, maxWidth:280, margin:"0 auto" }}>
            Le bilan démarre dès que tu enregistres un repas. On n'invente rien :
            tes macros et la régularité s'analysent à partir de ta première journée renseignée.
          </div>
        </div>
      </div>
    ) : (
    <>
      {/* Hero score */}
      <div style={{ margin:"0 16px 14px" }}>
        <SectionHeader
          title="Cohérence nutrition"
          hint={bilan.isPartial ? "⚠ partiel" : "depuis ton 1er jour"}
        />
        <div style={{
          background:S1, border:`1px solid ${BD}`, borderRadius:22,
          padding:"22px 20px", position:"relative", overflow:"hidden",
          opacity: bilan.isPartial ? 0.65 : 1 }}>
          <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180,
            borderRadius:"50%",
            background: `radial-gradient(circle, ${parseFloat(bilan.score)>=7 ? "rgba(52,211,153,0.18)" : parseFloat(bilan.score)>=4 ? "rgba(245,158,11,0.20)" : "rgba(248,113,113,0.18)"}, transparent 70%)`,
            pointerEvents:"none" }}/>
          <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:"1.6px",
            textTransform:"uppercase", color:DIM, marginBottom:14, fontFamily:FONT }}>
            Objectif · {obj?.l || "Non défini"}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <ScoreRing score={bilan.score}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:17, fontWeight:700, letterSpacing:-0.4,
                lineHeight:1.2, marginBottom:4, color:TEXT, fontFamily:FONT }}>
                {Math.round(bilan.avgKcal)} kcal/j en moyenne
              </div>
              <div style={{ fontSize:12, color:MID, lineHeight:1.5, fontFamily:FONT }}>
                Cible : {calObj} kcal/j · {bilan.pctKcal}% atteint
              </div>
              {bilan.isPartial && (
                <div style={{ display:"inline-block", marginTop:8,
                  padding:"3px 10px", background:"rgba(245,158,11,0.12)",
                  border:"1px solid rgba(245,158,11,0.30)", borderRadius:99,
                  fontSize:10, fontWeight:700, color:AMB, fontFamily:FONT }}>
                  Score basé sur {bilan.nbLogged} jour{bilan.nbLogged>1?"s":""}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Régularité */}
      <div style={{ margin:"0 16px 14px" }}>
        <SectionHeader title="Régularité du suivi" hint="depuis ton 1er jour"/>
        <div style={{ background:S1, border:`1px solid ${BD}`, borderRadius:18, padding:"16px 18px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
              <div style={{ fontFamily:SERIF, fontSize:36, fontWeight:400,
                letterSpacing:-1.5, lineHeight:1, color:TEXT, ...NUM }}>
                {bilan.nbLogged}<span style={{ fontSize:14, color:MID, marginLeft:4 }}>/{(repasHistory||[]).length}</span>
              </div>
              <div style={{ fontSize:12, color:MID, fontWeight:600, fontFamily:FONT }}>
                jours renseignés
              </div>
            </div>
          </div>
          <StreakGrid days={repasHistory} calObj={calObj}/>
          <div style={{ display:"flex", gap:14, paddingTop:11,
            borderTop:"1px solid rgba(0,0,0,0.04)", flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:MID, fontFamily:FONT }}>
              <span style={{ width:8, height:8, borderRadius:2, background:GRN }}/>Cible
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:MID, fontFamily:FONT }}>
              <span style={{ width:8, height:8, borderRadius:2, background:AMB }}/>Proche
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:MID, fontFamily:FONT }}>
              <span style={{ width:8, height:8, borderRadius:2, background:RED }}/>Hors
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:MID, fontFamily:FONT }}>
              <span style={{ width:8, height:8, borderRadius:2, background:"rgba(0,0,0,0.06)", border:"1px dashed rgba(0,0,0,0.12)" }}/>Vide
            </div>
          </div>
        </div>
      </div>

      {/* Macronutriments */}
      <div style={{ margin:"0 16px 14px" }}>
        <SectionHeader
          title="Macronutriments"
          hint={bilan.isPartial ? `Moyenne sur ${bilan.nbLogged}j` : `Moyenne ${bilan.totalDays}j`}
        />
        <div style={{ background:S1, border:`1px solid ${BD}`, borderRadius:18, padding:"6px 18px" }}>
          <MacroRow label="Protéines" value={bilan.avgProt} goal={pObj} pct={bilan.pctProt}/>
          <MacroRow label="Glucides"  value={bilan.avgGluc} goal={gObj} pct={bilan.pctGluc}/>
          <div style={{ borderBottom: "none" }}>
            <MacroRow label="Lipides" value={bilan.avgLip}  goal={lObj} pct={bilan.pctLip}/>
          </div>
        </div>
      </div>

      {/* Hydratation */}
      <div style={{ margin:"0 16px 14px" }}>
        <div style={{ background:S1, border:`1px solid ${BD}`, borderRadius:18,
          padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:13,
            background:"linear-gradient(145deg, #34D399, #2DA67D)",
            display:"grid", placeItems:"center",
            boxShadow:"0 4px 12px rgba(52,211,153,0.30), inset 0 1px 0 rgba(0,0,0,0.15)",
            position:"relative", overflow:"hidden", flexShrink:0 }}>
            <div style={{ position:"absolute", inset:0,
              background:"radial-gradient(110% 60% at 30% 10%, rgba(0,0,0,0.14), transparent 60%)" }}/>
            <I name="drop" size={20} color="#0B1F18" stroke={2}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:4, color:TEXT, fontFamily:FONT }}>
              Hydratation
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:5, marginBottom:4 }}>
              <span style={{ fontFamily:SERIF, fontSize:22, fontWeight:400, letterSpacing:-1,
                lineHeight:1, color:TEXT, ...NUM }}>
                {(bilan.avgEau * 0.25).toFixed(1)}L
              </span>
              <span style={{ fontSize:11, color:DIM, fontFamily:FONT }}>/ 2L</span>
            </div>
            <div style={{ height:4, background:"rgba(0,0,0,0.04)", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%",
                width:`${Math.min(100, (bilan.avgEau * 0.25 / 2) * 100)}%`,
                background:"linear-gradient(90deg, #34D399, #2DA67D)", borderRadius:99 }}/>
            </div>
          </div>
          {bilan.avgEau >= 7 && (
            <div style={{ padding:"5px 10px",
              background:"rgba(52,211,153,0.10)", border:"1px solid rgba(52,211,153,0.28)",
              borderRadius:8, fontSize:11, fontWeight:700, color:GRN,
              flexShrink:0, fontFamily:FONT }}>
              Bon
            </div>
          )}
        </div>
      </div>

      {/* Carte prochain bilan */}
      <NextBilanCard
        nextDate={nextBilanLabel}
        daysUntil={daysToSunday}
        onOpen={onOpenArchive}
      />
    </>
    )
  );

  // ─── ONGLET 2 · Analyse détaillée ──────────────────────────────────────
  const renderDetailed = () => (
    <>
      {!hasFood && (
        <div style={{ margin:"0 16px 14px", background:S1, border:`1px solid ${BD}`,
          borderRadius:18, padding:"26px 20px", textAlign:"center" }}>
          <div style={{ width:46, height:46, borderRadius:14, margin:"0 auto 12px",
            background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.18)",
            display:"grid", placeItems:"center", fontSize:22 }}>🥗</div>
          <div style={{ fontSize:14, fontWeight:700, color:TEXT, fontFamily:FONT, marginBottom:5 }}>
            Aucun aliment saisi
          </div>
          <div style={{ fontSize:12, color:MID, lineHeight:1.5, fontFamily:FONT, maxWidth:260, margin:"0 auto" }}>
            Ajoute tes repas du jour pour calculer ton score qualité et tes indicateurs nutritionnels.
          </div>
        </div>
      )}
      {hasFood && (
      <>
      {/* Score santé alimentaire */}
      <div style={{ margin:"0 16px 14px", background:S1, border:`1px solid ${BD}`,
        borderRadius:22, padding:"22px 20px", position:"relative", overflow:"hidden",
        opacity: bilan.isPartial ? 0.75 : 1 }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180,
          borderRadius:"50%",
          background:`radial-gradient(circle, ${health.color}25, transparent 70%)`,
          pointerEvents:"none" }}/>
        <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:"1.6px",
          textTransform:"uppercase", color:DIM, marginBottom:14, fontFamily:FONT }}>
          Score santé · qualité des aliments rentrés
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ fontFamily:SERIF, fontSize:78, fontWeight:400,
            lineHeight:0.9, color:health.color, letterSpacing:-3 }}>
            {health.letter}
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:32, fontWeight:800, letterSpacing:-1, lineHeight:1,
              color:TEXT, fontFamily:FONT, ...NUM }}>
              {health.score}<span style={{ color:DIM, fontSize:14, fontWeight:500 }}>/100</span>
            </div>
            <div style={{ fontSize:11, color:DIM, marginTop:2, fontFamily:FONT }}>
              basé sur {criteria.length} critères
            </div>
            <div style={{ display:"inline-block", marginTop:8, padding:"4px 12px",
              background:`${health.color}1F`, border:`1px solid ${health.color}4D`,
              borderRadius:99, fontSize:11, fontWeight:700,
              color:health.color, fontFamily:FONT }}>
              {health.pill}
            </div>
          </div>
        </div>
        {/* Échelle */}
        <div style={{ height:8, background:"linear-gradient(90deg, #F87171 0%, #F59E0B 50%, #34D399 100%)",
          borderRadius:99, position:"relative", opacity:0.4 }}>
          <div style={{ position:"absolute", top:-3, width:14, height:14,
            borderRadius:"50%", background:"white",
            border:`2px solid ${health.color}`,
            boxShadow:`0 0 0 4px ${health.color}33`,
            left:`calc(${health.score}% - 7px)` }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
          {["E","D","C","B","A"].map(l => (
            <span key={l} style={{ fontSize:9.5,
              color: l===health.letter ? health.color : DIM,
              fontWeight:700, fontFamily:FONT }}>{l}</span>
          ))}
        </div>
      </div>

      {/* 8 critères */}
      <div style={{ margin:"0 16px 14px" }}>
        <SectionHeader title="Critères évalués"/>
        <div style={{ background:S1, border:`1px solid ${BD}`, borderRadius:18, padding:"4px 16px" }}>
          {criteria.map((c, i) => (
            <div key={c.key} style={{ borderBottom: i === criteria.length-1 ? "none" : undefined }}>
              <CritRow crit={c}/>
            </div>
          ))}
        </div>
      </div>

      {/* Indicateurs nutritionnels mesurés */}
      <div style={{ margin:"0 16px 14px" }}>
        <SectionHeader title="Qualité nutritionnelle · apports mesurés"/>
        <div style={{ background:S1, border:`1px solid ${BD}`, borderRadius:18, padding:18 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {indicators.map(m => (
              <div key={m.key} style={{ padding:"13px 13px",
                background:`linear-gradient(160deg, ${m.color}14, ${m.color}05)`,
                border:`1px solid ${m.color}33`, borderRadius:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:5 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:TEXT, fontFamily:FONT }}>
                    {m.label}
                  </div>
                  <span style={{ width:9, height:9, borderRadius:"50%", background:m.color, boxShadow:`0 0 7px ${m.color}` }}/>
                </div>
                <div style={{ fontSize:11, marginBottom:7, fontFamily:FONT }}>
                  <span style={{ fontSize:14, fontWeight:800, color:TEXT, ...NUM }}>
                    {m.display !== undefined ? m.display : (m.val < 10 ? m.val.toFixed(1) : Math.round(m.val))}{m.unit}
                  </span>
                  <span style={{ color:MID }}> {m.lower ? "· viser <" : "/"} {m.goal}{m.unit}</span>
                </div>
                <div style={{ fontSize:10, color:m.color, fontWeight:700, fontFamily:FONT, marginBottom:5 }}>
                  {m.statusLabel}
                </div>
                <div style={{ height:5, background:`${m.color}1F`,
                  borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(100,m.pct)}%`,
                    background:`linear-gradient(90deg, ${m.color}, ${m.color})`, borderRadius:99, transition:"width .8s",
                    boxShadow:`0 0 6px ${m.color}` }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, fontSize:10.5, color:MID, lineHeight:1.5, fontFamily:FONT }}>
            Indicateurs calculés à partir des aliments réellement saisis. Les vitamines et minéraux non suivis par la base ne pénalisent pas le score.
          </div>
        </div>
      </div>
      </>
      )}

      {/* Lien archive */}
      <div style={{ margin:"0 16px 14px" }}>
        <button onClick={onOpenArchive} style={{ width:"100%",
          padding:"14px 16px", background:S1, border:`1px solid ${BD}`,
          borderRadius:14, cursor:"pointer",
          display:"flex", alignItems:"center", gap:12,
          fontFamily:FONT, textAlign:"left" }}>
          <div style={{ width:34, height:34, borderRadius:10,
            background:"rgba(59,130,246,0.10)", border:"1px solid rgba(59,130,246,0.28)",
            display:"grid", placeItems:"center", flexShrink:0 }}>
            <I name="arch" size={15} color="#93C5FD"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:TEXT }}>Historique des bilans</div>
            <div style={{ fontSize:11, color:MID, marginTop:2 }}>
              Voir tous les rapports bi-hebdomadaires
            </div>
          </div>
          <I name="chevR" size={16} color={MID}/>
        </button>
      </div>
    </>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────
  const { swipeStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeBack(onBack);

  return (
    <div ref={scrollRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ minHeight:"100vh", maxHeight:"100vh", overflowY:"auto", WebkitOverflowScrolling:"touch", background:BG, fontFamily:FONT,
      paddingBottom:30, ...swipeStyle }}>
      {/* Header retour */}
      <div style={{ padding:"16px 16px 8px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none",
          color:BL, cursor:"pointer", fontSize:13, fontWeight:700,
          display:"flex", alignItems:"center", gap:4, fontFamily:FONT }}>
          <I name="chevL" size={15} stroke={2.5}/> Retour
        </button>
      </div>

      {/* Eyebrow titre */}
      <div style={{ padding:"0 20px 14px" }}>
        <div style={{ fontFamily:SERIF, fontSize:22, fontWeight:700,
          color:TEXT, letterSpacing:-0.5, lineHeight:1.1 }}>
          Bilan PRO Nutrition
        </div>
        <div style={{ fontSize:12, color:MID, marginTop:3, fontFamily:FONT }}>
          {bilan.totalDays} derniers jours
        </div>
      </div>

      {renderHeader()}
      {activeTab === 0 ? renderDashboard() : renderDetailed()}
    </div>
  );
}
