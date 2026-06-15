import { useState, useMemo } from "react";
import { C, INT, FONT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Card, Eyebrow, Lbl, Btn, Row } from "../../components/ui/index.jsx";
import Calendar from "./Calendar.jsx";
import TodayView from "./TodayView.jsx";
import Creer from "./Creer.jsx";
import AnalyseIA from "../ai/AnalyseIA.jsx";
import { findExInDB } from "../../utils/training.js";
import { GuideExModal, SeanceDetailModal } from "./components/ProgramTabModals.jsx";

// ─── PROGRESSION DE LA SEMAINE CHART ─────────────────────────────────────────
function MesocycleChart({ prog, semC, checkedEx, cycleStart }) {
  const DISP_F  = "'Outfit','DM Sans',system-ui,sans-serif";
  const SERIF_F = "'DM Serif Display','Georgia',serif";
  const [open, setOpen] = useState(false);
  const currentWeek = Math.min((semC||0), 5);
  const baseVol = (prog?.jours||[]).reduce((a,j) =>
    a + (j.exercices||[]).reduce((b,ex) => b + (parseInt(ex.series)||4), 0), 0);

  // ── Tonnage planifié (kg) basé sur les charges NOTÉES du programme ──────────
  // Tonnage = Σ séries × reps × charge. On ne compte que les exos avec charge.
  let baseTonnage = 0, exWithCharge = 0;
  (prog?.jours||[]).forEach(j => (j.exercices||[]).forEach(ex => {
    const ch = parseFloat(ex.charge);
    if (ch > 0) {
      const series = parseInt(ex.series) || 4;
      const reps   = parseInt(String(ex.reps).split(/[-–]/)[0]) || 10;
      baseTonnage += series * reps * ch;
      exWithCharge++;
    }
  }));
  const hasCharge = exWithCharge > 0 && baseTonnage > 0;

  const WEEKS = [
    {lbl:"S1", type:"Base",   m:1.00},
    {lbl:"S2", type:"Vol+",   m:1.10},
    {lbl:"S3", type:"Vol+",   m:1.20},
    {lbl:"S4", type:"Vol+",   m:1.30},
    {lbl:"S5", type:"Déload", m:0.70},
    {lbl:"S6", type:"Pic",    m:1.40},
  ];
  const MEV    = Math.round(baseVol*0.65);
  const MAV    = baseVol;
  const MRV    = Math.round(baseVol*1.35);
  const curVol = Math.round(baseVol * WEEKS[currentWeek].m);
  const curTon = Math.round(baseTonnage * WEEKS[currentWeek].m);
  const nearMRV = curVol >= MRV*0.9;

  const fmtKg = (n) => n >= 1000 ? `${(n/1000).toFixed(1)} t` : `${Math.round(n)} kg`;

  // ── Line chart geometry ────────────────────────────────────────────────────
  const W = 310, H = 82;
  const PL = 8, PR = 8, PT = 10, PB = 6;
  const cW = W - PL - PR, cH = H - PT - PB;

  const vols  = WEEKS.map(w => Math.round(baseTonnage * w.m));
  const minV  = Math.min(...vols) * 0.80;
  const maxV  = Math.max(...vols) * 1.10;
  const range = maxV - minV || 1;

  const pts = vols.map((v, i) => ({
    x: PL + (i / 5) * cW,
    y: PT + cH - ((v - minV) / range) * cH,
    v, week: WEEKS[i], i,
  }));

  const linePath = pts.reduce((d, p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i-1];
    const t = 0.42;
    const cp1x = (prev.x + (p.x - prev.x) * t).toFixed(1);
    const cp2x = (p.x  - (p.x - prev.x) * t).toFixed(1);
    return `${d} C${cp1x},${prev.y.toFixed(1)} ${cp2x},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, '');

  const fillPath = `${linePath} L${pts[5].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;

  const dotCol = (w) =>
    w.type === 'Déload' ? '#F87171' :
    w.type === 'Pic'    ? '#F59E0B' : '#3B82F6';

  return (
    <>
    {/* ── Carte cliquable ── */}
    <div onClick={()=>setOpen(true)}
      style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:20,padding:"16px 16px 14px",marginBottom:16,cursor:"pointer"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.3px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:4}}>
            Progression de la semaine
          </div>
          <div style={{fontSize:10.5,color:"#374151",fontFamily:DISP_F}}>
            Charge totale (kg)
          </div>
        </div>
        {hasCharge && (
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,color:"#9CA3AF",fontFamily:DISP_F}}>Sem. actuelle</div>
            <div style={{fontSize:22,fontWeight:800,color:C.blue,fontFamily:DISP_F,lineHeight:1,marginTop:2}}>
              {fmtKg(curTon)}
            </div>
            <div style={{fontSize:9,color:"#9CA3AF",fontFamily:DISP_F,marginTop:1}}>
              {WEEKS[currentWeek].lbl} · {WEEKS[currentWeek].type}
            </div>
          </div>
        )}
      </div>

      {hasCharge ? (
      <>
      {/* Line chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
           style={{display:"block",overflow:"visible",marginBottom:4}}>
        <defs>
          <linearGradient id="mc-line-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#3B82F6" stopOpacity="0.16"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01"/>
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.33, 0.66].map((f,i) => (
          <line key={i} x1={PL} x2={W-PR}
            y1={PT + cH*(1-f)} y2={PT + cH*(1-f)}
            stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="3 4"/>
        ))}
        {/* Fill + stroke */}
        <path d={fillPath} fill="url(#mc-line-grad)"/>
        <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
        {/* Dots */}
        {pts.map((p, i) => {
          const isCur  = i === currentWeek;
          const isPast = i < currentWeek;
          const dc = dotCol(p.week);
          return (
            <g key={i}>
              {isCur && <circle cx={p.x} cy={p.y} r={10} fill={dc} opacity={0.13}/>}
              <circle
                cx={p.x} cy={p.y}
                r={isCur ? 6 : 4}
                fill={isPast || isCur ? dc : "rgba(59,130,246,0.22)"}
                stroke="#fff" strokeWidth={isCur ? 2 : 1.5}
                style={{filter: isCur ? `drop-shadow(0 2px 7px ${dc}70)` : 'none'}}
              />
            </g>
          );
        })}
      </svg>

      {/* Week labels */}
      <div style={{display:"flex"}}>
        {WEEKS.map((w,i) => {
          const isCur = i === currentWeek;
          const col = w.type==="Déload" ? "rgba(248,113,113,0.75)"
            : w.type==="Pic" ? "rgba(245,158,11,0.80)"
            : isCur ? "#60A5FA" : "#9CA3AF";
          return (
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:isCur?11.5:10.5,fontWeight:isCur?800:600,color:col,fontFamily:DISP_F}}>{w.lbl}</div>
              <div style={{fontSize:7.5,color:"#9CA3AF",fontFamily:DISP_F,marginTop:1}}>{w.type}</div>
            </div>
          );
        })}
      </div>
      </>
      ) : (
        /* État vide : aucune charge notée → pas de graphique */
        <div style={{padding:"22px 12px 18px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:10}}>
          <div style={{width:42,height:42,borderRadius:13,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.16)",display:"grid",placeItems:"center"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/>
            </svg>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:DISP_F}}>Pas encore de charges</div>
          <div style={{fontSize:11.5,color:"#9CA3AF",fontFamily:DISP_F,lineHeight:1.5,maxWidth:230}}>
            Note les charges de tes exercices pour voir ta progression de tonnage sur le mésocycle.
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:14,paddingTop:12,borderTop:`1px solid ${C.bd}`,color:"#60A5FA",fontSize:12,fontWeight:700,fontFamily:DISP_F}}>
        Voir l'analyse complète
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    </div>

    {/* Overlay (inchangé) */}
    {open && <MesocycleDetail prog={prog} semC={semC} baseVol={baseVol} MEV={MEV} MAV={MAV} MRV={MRV} curVol={curVol} currentWeek={currentWeek} WEEKS={WEEKS} cycleStart={cycleStart} checkedEx={checkedEx} onClose={()=>setOpen(false)}/>}
    </>
  );
}

// ─── MÉSOCYCLE DETAIL (analyse complète, overlay) ────────────────────────────
function MesocycleDetail({ prog, semC, baseVol, MEV, MAV, MRV, curVol, currentWeek, WEEKS, cycleStart, checkedEx, onClose }) {
  const DISP_F = "'Outfit','DM Sans',system-ui,sans-serif";
  const SERIF_F = "'DM Serif Display','Georgia',serif";
  const [exp, setExp] = useState(null);

  // ── Utilitaires data ──────────────────────────────────────────────────────
  const getWLog = () => { try { return JSON.parse(localStorage.getItem('morpho_workout_log')||'{}'); } catch{return{};} };
  const getSLog = () => { try { return JSON.parse(localStorage.getItem('morpho_sleep_log')||'{}'); } catch{return{};} };
  const sTgt = parseFloat(localStorage.getItem('morpho_sleep_target')||'8');
  const daysBack = (n) => Array.from({length:n},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-i); return d.toISOString().split('T')[0]; });

  // Epley 1RM estimé : poids × (1 + reps/30)
  const epley = (kg,reps) => reps===1 ? kg : Math.round(kg*(1+reps/30)*10)/10;

  // ── ACWR depuis workoutLog — fiable seulement avec une vraie base chronique ──
  const acwrData = useMemo(() => {
    const wLog = getWLog();
    const d7  = daysBack(7);
    const d28 = daysBack(28);
    const loggedDates = Object.keys(wLog).filter(d => wLog[d]?.totalVolume > 0).sort();
    const hasAcute = d7.some(d => wLog[d]?.totalVolume > 0);
    // Étendue réelle de l'historique d'entraînement
    const spanDays = loggedDates.length
      ? Math.round((Date.now() - new Date(loggedDates[0]).getTime()) / 864e5) + 1
      : 0;
    // Un ACWR fiable nécessite ≥ 21 jours de base chronique (sinon le ratio est trompeur)
    const MIN_SPAN = 21;
    if (!hasAcute || spanDays < MIN_SPAN) {
      return { ratio: null, source: "insufficient", spanDays, need: MIN_SPAN };
    }
    const acute   = d7.reduce((s,d)  => s + (wLog[d]?.totalVolume||0), 0);
    const chronic = d28.reduce((s,d) => s + (wLog[d]?.totalVolume||0), 0) / 4;
    const ratio   = chronic > 0 ? Math.round((acute/chronic)*100)/100 : null;
    return { ratio, acute: Math.round(acute), chronic: Math.round(chronic), source: "réel", spanDays };
  }, []);

  // ── Sommeil data ──────────────────────────────────────────────────────────
  const sleepData = useMemo(() => {
    const sLog = getSLog();
    const d7   = daysBack(7);
    const vals = d7.map(d=>sLog[d]||0).filter(v=>v>0);
    const avg  = vals.length>0 ? Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10 : null;
    const pct  = avg!==null ? Math.min(100,Math.round((avg/sTgt)*100)) : null;
    return { avg, pct, target:sTgt, days:vals.length };
  }, []);

  // ── Performance + Progression depuis workoutLog (TOUS les exercices) ───────
  const perfAll = useMemo(() => {
    const wLog = getWLog();
    const byEx = {};
    Object.entries(wLog).sort(([a],[b])=>a.localeCompare(b)).forEach(([date,log]) => {
      (log.sets||[]).forEach(s => {
        if (!byEx[s.exNom]) byEx[s.exNom] = [];
        byEx[s.exNom].push({ date, kg:s.kg, reps:s.reps, rm:epley(s.kg,s.reps) });
      });
    });
    // Pour chaque exercice : meilleur 1RM par séance, trié par date
    const exercises = Object.entries(byEx).map(([exNom, sets]) => {
      const bySession = {};
      sets.forEach(s => { if (!bySession[s.date]||s.rm>bySession[s.date].rm) bySession[s.date]=s; });
      const sessions = Object.entries(bySession).sort(([a],[b])=>a.localeCompare(b)).map(([d,s])=>({date:d,...s}));
      const trend = sessions.length >= 2
        ? Math.round(((sessions[sessions.length-1].rm - sessions[0].rm)/sessions[0].rm)*1000)/10
        : null;
      const best = sessions.reduce((m,s)=>Math.max(m,s.rm),0);
      return { exNom, sessions, trend, best, count: sessions.length };
    }).sort((a,b)=>b.count-a.count);
    return exercises;
  }, []);
  const [selEx, setSelEx] = useState(null);
  const perfData = useMemo(() => {
    if (!perfAll.length) return null;
    const chosen = perfAll.find(e => e.exNom === selEx) || perfAll[0];
    return chosen;
  }, [perfAll, selEx]);

  // ── Progression par semaine de mésocycle ─────────────────────────────────
  const progWeeks = useMemo(() => {
    if (!perfData?.sessions?.length || !cycleStart) return null;
    const start = new Date(cycleStart);
    const byWeek = {};
    perfData.sessions.forEach(s => {
      const diff = Math.floor((new Date(s.date)-start)/(7*86400000));
      const wk = Math.max(0, Math.min(5, diff));
      if (!byWeek[wk] || s.rm > byWeek[wk]) byWeek[wk] = s.rm;
    });
    return WEEKS.map((_,i) => byWeek[i]||null);
  }, [perfData, cycleStart]);

  const card = (key, children) => (
    <div onClick={()=>setExp(exp===key?null:key)} style={{background:C.s1,border:`1px solid ${exp===key?"rgba(59,130,246,0.3)":C.bd}`,borderRadius:18,padding:16,marginBottom:12,cursor:"pointer"}}>
      {children}
    </div>
  );
  const expandRow = (key, label) => (
    <div style={{fontSize:10,color:"#60A5FA",marginTop:10,display:"flex",alignItems:"center",gap:4,fontFamily:DISP_F}}>
      {exp===key?"▴":"▾"} {label}
    </div>
  );
  const detailBox = (key, children) => exp===key ? (
    <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bd}`,fontSize:12,color:"${C.mid}",lineHeight:1.6,fontFamily:DISP_F}}>{children}</div>
  ) : null;
  const reco = (icon, txt) => (
    <div style={{marginTop:10,padding:"10px 12px",background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.18)",borderRadius:10,display:"flex",gap:9,alignItems:"flex-start"}}>
      <span style={{fontSize:14,flexShrink:0}}>{icon}</span><div style={{fontSize:11.5,color:"${C.mid}",lineHeight:1.5}}>{txt}</div>
    </div>
  );
  const lbl = {fontSize:9,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",color:"${C.dim}",marginBottom:6,fontFamily:DISP_F};
  const badge = (bg,col,txt) => <span style={{fontSize:9,fontWeight:700,padding:"4px 9px",borderRadius:99,background:bg,color:col,whiteSpace:"nowrap",fontFamily:DISP_F}}>{txt}</span>;
  const demoBadge = badge("rgba(245,158,11,0.12)","#F59E0B","Démo · active le suivi");

  const VMAX = MRV*1.12;
  const nearMRV = curVol >= MRV*0.9;

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:C.bg,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{padding:"0 16px 40px",maxWidth:480,margin:"0 auto"}}>
        {/* Header */}
        <div style={{position:"sticky",top:0,background:C.bg,paddingTop:18,paddingBottom:12,zIndex:2}}>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#60A5FA",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:DISP_F,display:"flex",alignItems:"center",gap:5,marginBottom:14}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour
          </button>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.8px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:5}}>Mésocycle · Semaine {currentWeek+1} / 6</div>
          <div style={{fontFamily:SERIF_F,fontSize:25,letterSpacing:-0.8,lineHeight:1.1}}>Analyse <span style={{fontStyle:"italic",color:"#60A5FA"}}>de charge</span></div>
          <div style={{fontSize:11,color:"${C.dim}",marginTop:4,fontFamily:DISP_F}}>{WEEKS[currentWeek].type==="Déload"?"Phase de récupération":WEEKS[currentWeek].type==="Pic"?"Phase de pic":"Phase d'accumulation"} · Hypertrophie</div>
        </div>

        {/* 1. VOLUME vs MEV/MAV/MRV (RÉEL) */}
        {card("vol", <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={lbl}>Volume vs capacité de récupération</div>
              <div><span style={{fontSize:30,fontWeight:800,color:nearMRV?"#F59E0B":"#34D399",letterSpacing:-1}}>{curVol}</span> <span style={{fontSize:13,fontWeight:600,color:"${C.dim}"}}>séries cette sem.</span></div>
            </div>
            {nearMRV ? badge("rgba(245,158,11,0.15)","#F59E0B","Limite proche") : badge("rgba(52,211,153,0.15)","#34D399","Zone optimale")}
          </div>
          {/* Barres avec lignes MEV/MAV/MRV */}
          <div style={{position:"relative",display:"flex",gap:7,alignItems:"flex-end",height:120,margin:"16px 0 8px"}}>
            {[["MRV",MRV,"#F87171"],["MAV",MAV,"#34D399"],["MEV",MEV,"#60A5FA"]].map(([t,v,col],k)=>{
              const y = 120-(v/VMAX*120);
              return <div key={k} style={{position:"absolute",left:0,right:0,top:y,height:1,borderTop:`1px dashed ${col}40`}}>
                <span style={{position:"absolute",right:0,top:-7,fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:4,background:`${col}20`,color:col,fontFamily:DISP_F}}>{t} {v}</span>
              </div>;
            })}
            {WEEKS.map((w,i)=>{
              const v = Math.round(baseVol*w.m);
              const h = v/VMAX*120;
              const isCur = i===currentWeek;
              const col = w.type==="Déload"?"#F87171":w.type==="Pic"?"#F59E0B":"#3B82F6";
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",gap:4,zIndex:2}}>
                <div style={{width:"100%",height:h,borderRadius:"4px 4px 2px 2px",background:isCur?`linear-gradient(180deg,${col},${col}AA)`:col+"55",boxShadow:isCur?`0 4px 12px ${col}50`:"none"}}/>
                <div style={{fontSize:10,fontWeight:700,color:isCur?col:"#9CA3AF",fontFamily:DISP_F}}>{w.lbl}</div>
              </div>;
            })}
          </div>
          {expandRow("vol","Lire les seuils MEV / MAV / MRV")}
          {detailBox("vol", <>
            Chaque muscle a des seuils de volume hebdo (en séries) :<br/>
            • <b style={{color:"${C.text}"}}>MEV</b> ({MEV}) minimum efficace — sous ce seuil, pas de gain<br/>
            • <b style={{color:"${C.text}"}}>MAV</b> ({MAV}) volume adaptatif optimal — la zone de progression<br/>
            • <b style={{color:"${C.text}"}}>MRV</b> ({MRV}) max récupérable — plafond, au-delà = surentraînement
            {reco("⚠️", <>Tu es à <b style={{color:"${C.text}"}}>{curVol} séries</b>{nearMRV?<>, proche de ton MRV ({MRV}). Le <b style={{color:"${C.text}"}}>déload S5 est essentiel</b> pour dissiper la fatigue.</>:<>, dans ta zone optimale. Continue la progression.</>}</>)}
          </>)}
        </>)}

        {/* 2. SCORE PRÉPARATION — données réelles sommeil + mobilité */}
        {card("ready", (() => {
          // Lecture localStorage
          const sLog = (() => { try { return JSON.parse(localStorage.getItem('morpho_sleep_log')||'{}'); } catch{return{};} })();
          const sTgt = parseFloat(localStorage.getItem('morpho_sleep_target')||'8');
          const mLog = (() => { try { return JSON.parse(localStorage.getItem('morpho_mobilite_log')||'{}'); } catch{return{};} })();
          const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-i); return d.toISOString().split('T')[0]; });

          const sleepVals = last7.map(d=>sLog[d]||0).filter(v=>v>0);
          const avgSleep  = sleepVals.length>0 ? sleepVals.reduce((a,b)=>a+b,0)/sleepVals.length : 0;
          const mobDays   = last7.filter(d=>mLog[d]).length;
          const hasData   = sleepVals.length>0 || mobDays>0;

          const sleepPct  = avgSleep>0 ? Math.min(100, Math.round((avgSleep/sTgt)*100)) : null;
          const mobPct    = Math.round((mobDays/7)*100);
          const score     = sleepPct!==null ? Math.round(sleepPct*0.55 + mobPct*0.45)
                          : mobDays>0 ? mobPct : null;

          const col = score===null?"#888":score>=75?"#34D399":score>=55?"#F59E0B":"#F87171";
          const CIRC=264;
          const offset = score!==null ? Math.round(CIRC*(1-score/100)) : CIRC;

          const liveBadge = hasData
            ? badge("rgba(52,211,153,0.12)","#34D399","Données réelles · 7j")
            : demoBadge;

          return <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={lbl}>Score de récupération</div>{liveBadge}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:18,marginTop:4}}>
              {/* Anneau */}
              <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
                <svg width="90" height="90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
                  <circle cx="48" cy="48" r="42" fill="none" stroke={col} strokeWidth="7"
                    strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
                    transform="rotate(-90 48 48)" style={{transition:"stroke-dashoffset .6s,stroke .4s"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:26,fontWeight:800,color:col,lineHeight:1}}>{score??"-"}</div>
                  <div style={{fontSize:8,color:"#9CA3AF",letterSpacing:1,textTransform:"uppercase",marginTop:2}}>/ 100</div>
                </div>
              </div>
              {/* Barres */}
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
                {/* Sommeil */}
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:11,color:"#374151",width:76,flexShrink:0,fontFamily:DISP_F}}>Sommeil 7j</span>
                  <div style={{flex:1,height:6,borderRadius:3,background:"rgba(0,0,0,0.05)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:3,
                      width:sleepPct?`${sleepPct}%`:"0%",
                      background:sleepPct?sleepPct>=75?"#34D399":sleepPct>=55?"#F59E0B":"#F87171":"#333",
                      transition:"width .6s"}}/>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:sleepPct?col:"#555",width:28,textAlign:"right",flexShrink:0,fontFamily:DISP_F}}>
                    {sleepPct?`${avgSleep.toFixed(1)}h`:"–"}
                  </span>
                </div>
                {/* Mobilité */}
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:11,color:"#374151",width:76,flexShrink:0,fontFamily:DISP_F}}>Mobilité 7j</span>
                  <div style={{flex:1,height:6,borderRadius:3,background:"rgba(0,0,0,0.05)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:3,
                      width:`${mobPct}%`,
                      background:mobPct>=70?"#34D399":mobPct>=40?"#F59E0B":"#F87171",
                      transition:"width .6s"}}/>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:mobPct>=70?"#34D399":mobPct>=40?"#F59E0B":"#F87171",width:28,textAlign:"right",flexShrink:0,fontFamily:DISP_F}}>
                    {mobDays}/7j
                  </span>
                </div>
                {!hasData && (
                  <div style={{fontSize:10,color:"${C.dim}",fontFamily:DISP_F,fontStyle:"italic"}}>
                    Log sommeil + mobilité pour activer
                  </div>
                )}
              </div>
            </div>
            {expandRow("ready","Que faire avec ce score ?")}
            {detailBox("ready", <>
              Le <b style={{color:"${C.text}"}}>score de récupération</b> combine la moyenne de sommeil des 7 derniers jours (55%) et le taux de mobilité complétée (45%).
              {score!==null && score<60 && reco("⚠️","Score bas — réduis le volume cette semaine et priorise le sommeil. Sous 50, avance le déload.")}
              {score!==null && score>=60 && score<75 && reco("🎯","Fatigue modérée. Maintiens la charge mais dors plus. Cible : "+sTgt+"h/nuit.")}
              {score!==null && score>=75 && reco("✅","Bonne récupération. Tu peux progresser en charge cette semaine.")}
              {!hasData && reco("💡","Log ton sommeil et ta mobilité depuis le jour de récup pour voir ton score réel.")}
              <div style={{marginTop:10,fontSize:11,color:"#6B7280",fontStyle:"italic"}}>
                Courbatures et RPE seront ajoutés avec le check-in hebdo.
              </div>
            </>)}
          </>;
        })())}

        {/* 3. ACWR */}
        {card("acwr", (() => {
          const { ratio, acute, chronic, source, spanDays = 0, need = 21 } = acwrData;
          const hasRatio = ratio !== null;
          const insufficient = source === "insufficient";
          const acwrCol  = !hasRatio ? "#888" : ratio >= 1.5 ? "#F87171" : ratio >= 0.8 ? "#34D399" : "#F59E0B";
          const acwrLabel = !hasRatio ? (insufficient ? "historique insuffisant" : "—") : ratio >= 1.5 ? "dangereux" : ratio >= 1.3 ? "élevé" : ratio >= 0.8 ? "optimal" : "faible";
          // Position sur la jauge 0.5→1.5 (100%)
          const jaugePos = hasRatio ? Math.min(100, Math.max(0, ((ratio-0.5)/1.0)*100)) : null;
          const liveBadge = hasRatio
            ? badge(`${acwrCol}20`, acwrCol, "Données réelles")
            : insufficient ? badge("rgba(245,158,11,0.15)", "#F59E0B", `${spanDays}/${need} j`) : demoBadge;

          return <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={lbl}>Ratio charge aiguë / chronique</div>
                <div>
                  <span style={{fontSize:30,fontWeight:800,color:acwrCol,letterSpacing:-1}}>
                    {hasRatio ? ratio.toFixed(2) : "—"}
                  </span>
                  {' '}<span style={{fontSize:13,fontWeight:600,color:"${C.dim}"}}>{acwrLabel}</span>
                </div>
              </div>
              {liveBadge}
            </div>
            {insufficient ? (
              <div style={{margin:"14px 0 4px"}}>
                <div style={{fontSize:12,color:"#374151",lineHeight:1.5,fontFamily:DISP_F,marginBottom:10}}>
                  L'ACWR a besoin d'au moins <b style={{color:"${C.text}"}}>{need} jours</b> d'entraînement loggé pour établir une base chronique fiable. On ne l'invente pas avant.
                </div>
                <div style={{height:8,borderRadius:99,background:"rgba(0,0,0,0.05)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(100,Math.round((spanDays/need)*100))}%`,background:"linear-gradient(90deg,#F59E0B,#FBBF24)",borderRadius:99,transition:"width .6s"}}/>
                </div>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:6,fontFamily:DISP_F}}>{spanDays} jour{spanDays>1?"s":""} sur {need}</div>
              </div>
            ) : (
            <div style={{position:"relative",height:30,margin:"16px 0 16px"}}>
              <div style={{position:"absolute",bottom:8,left:0,right:0,height:8,borderRadius:4,background:"linear-gradient(90deg,#F87171 0%,#F59E0B 16%,#34D399 32%,#34D399 64%,#F59E0B 80%,#F87171 100%)"}}/>
              {jaugePos!==null && <div style={{position:"absolute",bottom:2,left:`${jaugePos}%`,width:3,height:20,background:"#fff",borderRadius:2,boxShadow:"0 0 6px rgba(0,0,0,0.25)",transform:"translateX(-50%)"}}/>}
              <div style={{position:"absolute",bottom:-12,left:0,right:0,display:"flex",justifyContent:"space-between",fontSize:8,color:"#9CA3AF"}}><span>0.5</span><span>0.8</span><span style={{color:"#34D399"}}>1.0</span><span>1.3</span><span>1.5+</span></div>
            </div>
            )}
            {hasRatio && (
              <div style={{display:"flex",gap:12,marginTop:16}}>
                {[{l:"Charge 7j",v:acute+" kg"},{l:"Moyenne/sem 28j",v:chronic+" kg"}].map(({l,v})=>(
                  <div key={l} style={{flex:1,background:"rgba(0,0,0,0.03)",borderRadius:10,padding:"8px 10px"}}>
                    <div style={{fontSize:8,color:"${C.dim}",textTransform:"uppercase",letterSpacing:"1px",fontFamily:DISP_F}}>{l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"${C.text}",marginTop:3,fontFamily:DISP_F}}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            {expandRow("acwr","Pourquoi c'est crucial")}
            {detailBox("acwr", <>
              L'<b style={{color:"${C.text}"}}>ACWR</b> compare ta charge des 7 derniers jours à ta moyenne 28 jours. Indicateur n°1 du <b style={{color:"${C.text}"}}>risque de blessure</b>.<br/><br/>
              • <b style={{color:"${C.text}"}}>0,8–1,3</b> : adaptation optimale · <b style={{color:"${C.text}"}}>&gt;1,5</b> : pic dangereux · <b style={{color:"${C.text}"}}>&lt;0,8</b> : désentraînement
              {insufficient && reco("⏳",`Continue à logger tes séances : encore ${Math.max(0,need-spanDays)} jour(s) avant un ACWR fiable.`)}
              {hasRatio && ratio >= 1.3 && reco("⚠️",`À ${ratio}, tu approches la zone de risque. Évite d'augmenter le volume cette semaine.`)}
              {hasRatio && ratio >= 0.8 && ratio < 1.3 && reco("✅",`À ${ratio} tu progresses sans danger. Continue la progression planifiée.`)}
            </>)}
          </>;
        })())}

        {/* 4. SURENTRAÎNEMENT — sommeil réel, reste honnête */}
        {card("over", (() => {
          const { avg: slpAvg, pct: slpPct, target: slpTgt, days: slpDays } = sleepData;
          const slpStatus = slpAvg === null ? 'unknown' : slpAvg >= slpTgt ? 'ok' : slpAvg >= slpTgt-1.5 ? 'warn' : 'alert';
          const slpLabel  = slpAvg === null ? `Pas de données (${slpDays} nuits loggées)` : `${slpAvg}h moyenne (cible ${slpTgt}h)`;
          const slpBadge  = slpAvg === null ? ["rgba(138,148,166,0.15)","#888","–"] : slpStatus==='ok' ? ["rgba(52,211,153,0.15)","#34D399","OK"] : slpStatus==='warn' ? ["rgba(245,158,11,0.15)","#F59E0B","À surveiller"] : ["rgba(248,113,113,0.15)","#F87171","Alerte"];

          const perfTrend = perfData?.trend;
          const perfStatus = perfTrend === null || perfTrend === undefined ? 'unknown' : perfTrend >= 0 ? 'ok' : perfTrend >= -2 ? 'warn' : 'alert';
          const perfLabel  = !perfData ? "Log des charges pour activer" : perfTrend===null ? `${perfData.exNom} — 1 séance seulement` : `${perfTrend>=0?'+':''}${perfTrend}% · ${perfData.exNom}`;
          const perfBadge  = !perfData||perfTrend===null ? ["rgba(138,148,166,0.15)","#888","–"] : perfStatus==='ok' ? ["rgba(52,211,153,0.15)","#34D399","OK"] : perfStatus==='warn' ? ["rgba(245,158,11,0.15)","#F59E0B","À surveiller"] : ["rgba(248,113,113,0.15)","#F87171","Alerte"];

          const signals = [
            { ic:"📉", t:"Performance", s:perfLabel, st:perfBadge[2], col:perfBadge[1], bg:perfBadge[0] },
            { ic:"😴", t:"Sommeil",     s:slpLabel,  st:slpBadge[2],  col:slpBadge[1],  bg:slpBadge[0]  },
            { ic:"💓", t:"FC repos",    s:"Connecte une app santé",   st:"–", col:"#888", bg:"rgba(138,148,166,0.10)" },
            { ic:"🔥", t:"Motivation",  s:"Check-in hebdo à venir",   st:"–", col:"#888", bg:"rgba(138,148,166,0.10)" },
          ];
          const alertCount = signals.filter(s=>s.col==='#F87171').length;
          const warnCount  = signals.filter(s=>s.col==='#F59E0B').length;
          const statusLabel = alertCount>0 ? `${alertCount+warnCount} / 4 signaux` : warnCount>0 ? `${warnCount} / 4 à surveiller` : "Surveillance";
          const statusColor = alertCount>0 ? "#F87171" : warnCount>0 ? "#F59E0B" : "#34D399";
          const overallLabel = alertCount>=2 ? "Risque élevé" : alertCount===1||warnCount>=2 ? "Surveillance" : warnCount===1 ? "OK" : "Récup bonne";

          return <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={lbl}>Détection surentraînement</div>
                <div style={{fontSize:22,fontWeight:800,color:statusColor}}>{overallLabel}</div>
              </div>
              {badge(`${statusColor}20`,statusColor,statusLabel)}
            </div>
            <div style={{marginTop:14}}>
              {signals.map(({ic,t,s,st,col,bg},k)=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:k<3?"1px solid rgba(0,0,0,0.03)":"none"}}>
                  <div style={{width:34,height:34,borderRadius:10,background:bg,display:"grid",placeItems:"center",flexShrink:0,fontSize:15}}>{ic}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"${C.text}",fontFamily:DISP_F}}>{t}</div>
                    <div style={{fontSize:10.5,color:"${C.dim}",marginTop:1,fontFamily:DISP_F}}>{s}</div>
                  </div>
                  {badge(`${col}15`,col,st)}
                </div>
              ))}
            </div>

            {/* Graphique sommeil — 14 derniers jours (dates + valeurs réelles) */}
            {(() => {
              const sLog = getSLog();
              const series = daysBack(14).reverse().map(d => ({ d, h: sLog[d] || 0 }));
              const any = series.some(s => s.h > 0);
              if (!any) return (
                <div style={{marginTop:8,padding:"12px",background:"rgba(99,102,241,0.05)",border:"1px dashed rgba(99,102,241,0.22)",borderRadius:12,fontSize:11.5,color:"#374151",textAlign:"center",fontFamily:DISP_F}}>
                  😴 Note ton sommeil depuis l'Accueil pour voir ta courbe ici.
                </div>
              );
              const maxH = Math.max(...series.map(s=>s.h), slpTgt, 9);
              return (
                <div style={{marginTop:10,padding:"12px 12px 8px",background:"rgba(0,0,0,0.02)",borderRadius:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"${C.dim}",fontFamily:DISP_F}}>Sommeil · 14 jours</span>
                    <span style={{fontSize:10,color:"#9CA3AF",fontFamily:DISP_F}}>cible {slpTgt}h</span>
                  </div>
                  <div style={{position:"relative",display:"flex",alignItems:"flex-end",gap:3,height:54}}>
                    {/* ligne cible */}
                    <div style={{position:"absolute",left:0,right:0,bottom:`${(slpTgt/maxH)*54}px`,height:1,background:"rgba(99,102,241,0.45)",borderTop:"1px dashed rgba(99,102,241,0.5)"}}/>
                    {series.map((s,k)=>{
                      const h = s.h>0 ? Math.max(3,(s.h/maxH)*54) : 2;
                      const ok = s.h>=slpTgt;
                      const col = s.h===0 ? "rgba(0,0,0,0.06)" : ok ? "#34D399" : s.h>=slpTgt-1.5 ? "#FBBF24" : "#F87171";
                      return <div key={k} title={`${s.h||"—"}h`} style={{flex:1,height:`${h}px`,background:col,borderRadius:3,minWidth:0,transition:"height .4s"}}/>;
                    })}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:8.5,color:"#9CA3AF",fontFamily:DISP_F}}>
                    <span>{(() => { const [,m,j]=series[0].d.split("-"); return `${j}/${m}`; })()}</span>
                    <span>aujourd'hui</span>
                  </div>
                </div>
              );
            })()}

            {expandRow("over","Interprétation coach")}
            {detailBox("over", <>
              <b style={{color:"${C.text}"}}>Sommeil</b> et <b style={{color:"${C.text}"}}>performance</b> sont calculés en temps réel depuis tes logs.
              FC repos et Motivation arriveront avec le check-in hebdo (20 s).
              {alertCount>=2 && reco("🩺","2+ signaux en rouge. Réduis le volume cette semaine et priorise le sommeil.")}
              {alertCount===1 && reco("⚠️","1 signal alerte. Surveille ta récup, un déload préventif peut être bénéfique.")}
              {alertCount===0 && warnCount===0 && reco("✅","Aucun signal préoccupant. Continue la progression planifiée.")}
            </>)}
          </>;
        })())}

        {/* 5. PROGRESSION FORCE — 1RM réel par séance, avec sélecteur d'exercice */}
        {card("rm", (() => {
          const hasAny  = perfAll.length > 0;
          const hasProg = perfData && perfData.sessions.length >= 2;
          const sessions = perfData?.sessions || [];
          const pct = hasProg
            ? Math.round(((sessions[sessions.length-1].rm - sessions[0].rm) / sessions[0].rm)*100*10)/10
            : null;
          const pctCol = pct===null?"#888":pct>=0?"#60A5FA":"#F87171";
          const exLabel = perfData?.exNom || "Exercice";
          const liveBadge = hasProg
            ? badge(pct>=0?"rgba(52,211,153,0.15)":"rgba(248,113,113,0.15)", pct>=0?"#34D399":"#F87171", pct>=0?"↗ En hausse":"↘ En baisse")
            : demoBadge;

          // Courbe 1RM réelle sur les séances datées
          const SVG_W = 326, SVG_H = 90, PT = 12, PB = 22, PL = 6, PR = 6;
          const cH = SVG_H - PT - PB, cW = SVG_W - PL - PR;
          const rms = sessions.map(s=>s.rm);
          const maxRM = Math.max(...rms, 1), minRM = Math.min(...rms, 0);
          const span = (maxRM - minRM) || 1;
          const pts = sessions.map((s,i) => ({
            x: PL + (sessions.length===1 ? cW/2 : (i/(sessions.length-1))*cW),
            y: PT + cH - ((s.rm - minRM)/span)*cH,
            ...s,
          }));
          const polyline = pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
          const fmtD = (d) => { const [,m,j] = d.split("-"); return `${j}/${m}`; };

          return <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={lbl}>Progression force · {exLabel}</div>
                <div>
                  <span style={{fontSize:30,fontWeight:800,color:pctCol,letterSpacing:-1}}>
                    {pct!==null ? `${pct>=0?'+':''}${pct}` : "–"}
                  </span>
                  {' '}<span style={{fontSize:13,fontWeight:600,color:"${C.dim}"}}>
                    {hasProg ? `% sur ${sessions.length} séances` : hasAny ? "1 séance seulement" : "Log des charges pour activer"}
                  </span>
                </div>
              </div>
              {liveBadge}
            </div>

            {/* Sélecteur d'exercice (scroll horizontal) */}
            {perfAll.length > 1 && (
              <div style={{display:"flex",gap:7,overflowX:"auto",marginTop:12,paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
                {perfAll.map(ex => {
                  const on = ex.exNom === exLabel;
                  return (
                    <button key={ex.exNom} onClick={()=>setSelEx(ex.exNom)}
                      style={{flexShrink:0,padding:"7px 13px",borderRadius:10,cursor:"pointer",
                        background: on ? "linear-gradient(145deg,#3B82F6,#2563EB)" : "rgba(0,0,0,0.04)",
                        border: on ? "1px solid rgba(37,99,235,0.5)" : "1px solid rgba(0,0,0,0.06)",
                        color: on ? "#fff" : "#374151", fontSize:12, fontWeight:700, fontFamily:DISP_F,
                        boxShadow: on ? "0 3px 10px rgba(59,130,246,0.35)" : "none",
                        whiteSpace:"nowrap"}}>
                      {ex.exNom}
                    </button>
                  );
                })}
              </div>
            )}

            {hasProg ? (
              <>
                <div style={{marginTop:12}}>
                  <svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none" style={{overflow:"visible"}}>
                    <defs>
                      <linearGradient id="rm-grad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.16"/>
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01"/>
                      </linearGradient>
                    </defs>
                    <polygon points={`${PL},${PT+cH} ${polyline} ${PL+cW},${PT+cH}`} fill="url(#rm-grad)"/>
                    <polyline points={polyline} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((p,k)=>(
                      <g key={k}>
                        <circle cx={p.x} cy={p.y} r={k===pts.length-1?5:3}
                          fill="#3B82F6" stroke={k===pts.length-1?"#fff":"none"} strokeWidth={k===pts.length-1?1.5:0}/>
                        {(k===0||k===pts.length-1) && (
                          <text x={p.x} y={p.y-9} fontSize="10" fontWeight="700" fill="#2563EB" textAnchor="middle" fontFamily="'Outfit',sans-serif">{p.rm}kg</text>
                        )}
                      </g>
                    ))}
                    <text x={pts[0].x} y={SVG_H-6} fontSize="9" fill="#9CA3AF" textAnchor="start" fontFamily="'Outfit',sans-serif">{fmtD(sessions[0].date)}</text>
                    <text x={pts[pts.length-1].x} y={SVG_H-6} fontSize="9" fill="#9CA3AF" textAnchor="end" fontFamily="'Outfit',sans-serif">{fmtD(sessions[sessions.length-1].date)}</text>
                  </svg>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10.5,color:"#9CA3AF",fontFamily:DISP_F}}>
                  <span>Départ : <b style={{color:"#374151"}}>{sessions[0].rm}kg</b></span>
                  <span>Record : <b style={{color:"#374151"}}>{perfData.best}kg</b></span>
                  <span>Actuel : <b style={{color:"#2563EB"}}>{sessions[sessions.length-1].rm}kg</b></span>
                </div>
              </>
            ) : (
              <div style={{marginTop:14,padding:"14px",background:"rgba(59,130,246,0.05)",border:"1px dashed rgba(59,130,246,0.2)",borderRadius:12,fontSize:12,color:"#374151",textAlign:"center",fontFamily:DISP_F}}>
                {hasAny ? "Encore une séance loggée sur cet exercice et ta courbe d'évolution apparaît." : "Démarre une séance Focus Mode et logge tes charges pour activer la progression"}
              </div>
            )}
            {expandRow("rm","Détail de la progression")}
            {detailBox("rm", <>
              Le <b style={{color:"${C.text}"}}>1RM estimé</b> est calculé via la formule d'Epley sur tes meilleures séries : <code>poids × (1 + reps/30)</code>. La courbe suit ton 1RM réel séance après séance.
              {hasProg && pct!==null && pct>=2 && reco("📈",`Progression saine (+${pct}%) sur ${exLabel}. Continue la périodisation.`)}
              {hasProg && pct!==null && pct<0 && reco("⚠️",`Baisse détectée sur ${exLabel}. Vérifie ton sommeil et ton volume total.`)}
              {!hasProg && reco("💡","Logge des charges en séance Focus Mode pour voir ta courbe de progression réelle.")}
            </>)}
          </>;
        })())}

        <div style={{height:20}}/>
      </div>
    </div>
  );
}

function ProgrammeView(props) {
  const { prog, setProg, progs, setProgs, premium, setPaywall, push, calSess, setCalSess, checkedEx, createStep, setCS, newP, setNewP, jourActif, setJourActif, groupe, setGroupe, editExIdx, setEditExIdx, exModal, setExModal, exModalTab, setExModalTab, INT, EX, setProgView, cycleStart, setCycleStart, semC, jR, profil } = props;

  // vue interne : "creer" uniquement (seance detail → overlay fixe via selectedJour)
  const [innerView,    setInnerView]    = useState("list");  // gardé pour compatibilité Creer
  const [selectedJour, setSelectedJour] = useState(null);    // {jIdx} → ouvre SeanceDetailModal en overlay
  const [confirmDel, setConfirmDel] = useState(null); // {type:"prog"|"jour", progIdx, jourIdx}
  const [isCreating, setIsCreating] = useState(false);
  const [openJour,   setOpenJour]   = useState(null);

  const allProgs = progs && progs.length > 0 ? progs : (prog ? [prog] : []);

  // Synchro : quand on modifie un prog de la liste, mettre à jour prog actif si c'est le même
  const updateProgAtIdx = (idx, updatedP) => {
    const next = [...allProgs];
    next[idx] = updatedP;
    setProgs(next);
    // Mettre à jour prog actif si même titre/id
    if (prog && (prog.id === updatedP.id || prog.titre === allProgs[idx].titre)) {
      setProg(updatedP);
    }
  };

  const deleteProgAtIdx = (idx) => {
    const delProg = allProgs[idx];
    const next = allProgs.filter((_,i) => i !== idx);
    setProgs(next);
    if (prog && (prog.titre === delProg.titre || prog.id === delProg.id)) {
      setProg(next[0] || null);
    }
    // Nettoyer calSess : supprimer toutes les entrées liées aux séances de ce programme
    if (delProg.jours && setCalSess) {
      const joursNoms = new Set(delProg.jours.flatMap(j => [j.nom, j.focus].filter(Boolean)));
      setCalSess(prev => {
        const ns = {...prev};
        Object.keys(ns).forEach(k => { if (joursNoms.has(ns[k]?.nom)) delete ns[k]; });
        return ns;
      });
    }
    setConfirmDel(null);
    push("🗑️","Programme supprimé","Le programme et ses séances ont été retirés du calendrier.");
  };

  const deleteJourAtIdx = (pIdx, jIdx) => {
    const jour = allProgs[pIdx].jours[jIdx];
    const u = JSON.parse(JSON.stringify(allProgs[pIdx]));
    u.jours.splice(jIdx, 1);
    updateProgAtIdx(pIdx, u);
    // Nettoyer calSess : supprimer les entrées de ce jour
    if (jour && setCalSess) {
      const jourNoms = new Set([jour.nom, jour.focus].filter(Boolean));
      setCalSess(prev => {
        const ns = {...prev};
        Object.keys(ns).forEach(k => { if (jourNoms.has(ns[k]?.nom)) delete ns[k]; });
        return ns;
      });
    }
    setConfirmDel(null);
    push("🗑️","Séance supprimée","La séance a été retirée du programme et du calendrier.");
  };

  const showCreerForm = isCreating || createStep > 0 || (newP.nom !== "" || newP.jours.length > 0);
  const resetCreating = () => { setIsCreating(false); setCS(0); setNewP({nom:"",jours:[],seances:{}}); };
  const creerProps = {
    ...props,
    onCancel: resetCreating,
    setProgView: (v) => { resetCreating(); if(v === "calendar") setProgView("calendar"); else setInnerView("list"); },
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const SERIF_F  = "'DM Serif Display','Georgia',serif";
  const DISP_F   = "'Outfit','DM Sans',system-ui,sans-serif";
  const semN     = (semC||0)+1;
  const cc = (cat) => ({principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[cat||"principal"]||"#4D8BFF");
  const progIdx = Math.max(0, allProgs.findIndex(p => prog && (p.id===prog.id || p.titre===prog.titre)));
  const durOf = (j) => {
    const exs = j.exercices||[];
    if (!exs.length) return null;
    const secs = exs.reduce((sum,ex) => {
      const s = parseInt(ex.series)||4, r = parseInt(String(ex.repos||"90").replace(/\D/g,""))||90;
      return sum + s*(r+60);
    },0);
    return Math.round(secs/60);
  };

  return (
    <div style={{padding:"0 15px"}}>

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,26,46,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.s1,borderRadius:16,padding:"22px 20px",width:"100%",maxWidth:340}}>
            <div style={{fontFamily:DISP_F,fontSize:16,fontWeight:500,marginBottom:8,color:"${C.text}"}}>
              {confirmDel.type==="prog" ? "Supprimer ce programme ?" : "Supprimer cette séance ?"}
            </div>
            <div style={{fontSize:12,color:"#374151",marginBottom:20,lineHeight:1.5}}>
              {confirmDel.type==="prog"
                ? "Toutes les séances seront perdues. Cette action est irréversible."
                : "La séance et tous ses exercices seront supprimés définitivement."}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDel(null)} style={{flex:1,padding:"10px",background:C.s2,border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,color:"#374151",fontFamily:DISP_F}}>Annuler</button>
              <button onClick={()=>confirmDel.type==="prog" ? deleteProgAtIdx(confirmDel.pIdx) : deleteJourAtIdx(confirmDel.pIdx, confirmDel.jIdx)} style={{flex:1,padding:"10px",background:"#FF7A6B",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:"#141A2E",fontFamily:DISP_F}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{paddingTop:6,marginBottom:18}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:5}}>Programme</div>
        <div style={{fontFamily:SERIF_F,fontSize:28,color:"${C.text}",lineHeight:1.1,letterSpacing:-1}}>
          Ton <span style={{fontStyle:"italic",color:C.blue}}>programme</span>
        </div>
        <div style={{fontSize:11,color:"${C.dim}",marginTop:5,fontFamily:DISP_F}}>
          {prog ? `${prog.titre} · ${prog.jours?.length||0} séances/sem · Sem. ${semN}` : "Crée ton premier programme pour commencer."}
        </div>
        {prog && (
          <button onClick={()=>setConfirmDel({type:"prog",pIdx:progIdx})}
            style={{marginTop:10,background:"transparent",border:"none",color:"rgba(248,113,113,0.55)",cursor:"pointer",fontSize:12,fontFamily:DISP_F,fontWeight:600,padding:0,display:"flex",alignItems:"center",gap:5}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Supprimer ce programme
          </button>
        )}
      </div>

      {/* ── Programme actif ── */}
      {prog && prog.jours?.length > 0 && (<>

        {/* Séances accordion */}
        {prog.jours.map((j, jIdx) => {
          const int  = INT[j.intensite||"modere"];
          const dur  = durOf(j);
          const isOpen = openJour===jIdx;
          const exos = j.exercices||[];
          return (
            <div key={jIdx} style={{background:C.s1,border:`1px solid ${isOpen?int.c+"40":C.bd}`,borderRadius:18,marginBottom:10,overflow:"hidden",transition:"border-color .2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",cursor:"pointer"}} onClick={()=>setOpenJour(isOpen?null:jIdx)}>
                <div style={{width:46,height:46,borderRadius:13,background:int.c,border:"none",color:"#fff",display:"grid",placeItems:"center",flexShrink:0,fontFamily:DISP_F,fontSize:12,fontWeight:800,boxShadow:`0 4px 12px ${int.c}55`}}>
                  {j.focus||j.nom?.slice(0,3)||"—"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:700,color:"${C.text}",letterSpacing:-0.2,fontFamily:DISP_F}}>{j.nom}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3,fontSize:11.5,color:"#374151",fontFamily:DISP_F}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:int.c,boxShadow:`0 0 5px ${int.c}60`,flexShrink:0}}/>
                    {int.l} · {exos.length} exercice{exos.length!==1?"s":""}{dur?` · ~${dur} min`:""}
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();setSelectedJour({jIdx});}}
                  style={{width:34,height:34,borderRadius:10,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.22)",color:"#60A5FA",cursor:"pointer",display:"grid",placeItems:"center",flexShrink:0,fontSize:14}}>✏️</button>
                <div style={{color:"#374151",fontSize:18,transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0)",flexShrink:0}}>⌄</div>
              </div>
              {isOpen && (
                <div style={{borderTop:`1px solid ${C.bd}`,padding:"8px 14px 14px"}}>
                  {exos.length===0
                    ? <div style={{textAlign:"center",padding:"12px 0",fontSize:11,color:"${C.dim}",fontFamily:DISP_F}}>Aucun exercice — tape ✏️ pour en ajouter</div>
                    : exos.map((ex,k) => (
                      <div key={k} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"9px 0",borderBottom:k<exos.length-1?"1px solid rgba(0,0,0,0.03)":"none"}}>
                        <div style={{width:30,height:30,borderRadius:9,background:`${cc(ex.cat)}20`,border:`1px solid ${cc(ex.cat)}35`,color:cc(ex.cat),display:"grid",placeItems:"center",fontFamily:DISP_F,fontSize:11,fontWeight:800,flexShrink:0}}>{k+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13.5,fontWeight:700,color:"${C.text}",fontFamily:DISP_F,letterSpacing:-0.1}}>{ex.nom}</div>
                          <div style={{fontSize:9,fontWeight:800,letterSpacing:"1px",color:"${C.dim}",textTransform:"uppercase",fontFamily:DISP_F,marginTop:2}}>{ex.cat||"Principal"}</div>
                        </div>
                        <div style={{fontSize:12,fontWeight:600,color:"#374151",fontFamily:DISP_F,flexShrink:0,marginTop:2,textAlign:"right",whiteSpace:"nowrap"}}>
                          {ex.series}×{ex.reps} · {ex.repos}s
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          );
        })}

        {/* Mésocycle */}
        <MesocycleChart prog={prog} semC={semC} checkedEx={checkedEx} cycleStart={cycleStart}/>

      </>)}

      {/* ── Autres programmes ── */}
      {allProgs.length > 1 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.3px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:10}}>Autres programmes</div>
          {allProgs.map((p, pIdx) => {
            const isActive = prog && (prog.titre === p.titre || prog.id === p.id);
            if (isActive) return null;
            return (
              <div key={pIdx} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,marginBottom:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"${C.text}",fontFamily:DISP_F}}>{p.titre}</div>
                  <div style={{fontSize:10.5,color:"#374151",marginTop:1}}>{p.jours?.length||0} séances</div>
                </div>
                <button onClick={()=>{setProg(p);push("✅","Programme activé",p.titre);}} style={{padding:"6px 10px",background:"rgba(52,211,153,0.10)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:8,color:"#34D399",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:DISP_F}}>Activer</button>
                <button onClick={()=>setConfirmDel({type:"prog",pIdx})} style={{padding:"6px 8px",background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:8,color:"#FF7A6B",cursor:"pointer",fontSize:11}}>🗑</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {allProgs.length === 0 && !showCreerForm && (
        <div style={{textAlign:"center",padding:"32px 0 16px"}}>
          <div style={{fontFamily:SERIF_F,fontSize:22,fontWeight:400,color:"${C.text}",marginBottom:8}}>Aucun programme</div>
          <div style={{fontSize:12,color:"#374151",lineHeight:1.6,maxWidth:240,margin:"0 auto 24px",fontFamily:DISP_F}}>Génère un programme IA adapté à ta morphologie ou crée-le manuellement.</div>
        </div>
      )}

      {/* ── CTAs ── */}
      {!showCreerForm && (
        <div style={{marginBottom:12}}>
          <Btn onClick={()=>{ if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Nouveau programme IA</Btn>
          <Btn v="out" onClick={()=>{ setIsCreating(true); setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}>+ Créer manuellement</Btn>
        </div>
      )}

      {showCreerForm && (
        <Creer {...creerProps} progs={allProgs} setProgsAll={(next)=>{ setProgs(next); if(next.length>0) setProg(next[next.length-1]); }}/>
      )}

      {/* ── SeanceDetailModal en overlay fixe ── */}
      {selectedJour !== null && prog?.jours?.[selectedJour.jIdx] && (
        <div style={{position:"fixed",inset:0,zIndex:400,background:C.bg,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          <SeanceDetailModal
            jour={prog.jours[selectedJour.jIdx]}
            jourIdx={selectedJour.jIdx}
            prog={prog}
            setProg={(u) => updateProgAtIdx(progIdx, u)}
            onClose={() => setSelectedJour(null)}
            C={C} INT={INT}
          />
        </div>
      )}
    </div>
  );
}

// ─── PROGRAMTAB ──────────────────────────────────────────────────────────────

export default function ProgramTab(props){
  const { prog, setProg, progs, setProgs, cycleStart, setCycleStart, premium, setPaywall, push, calSess, setCalSess, checkedEx, setCheckedEx, seance, setSeance, setChrono, setChronoSec, exDetails, setExDetails, exEdit, setExEdit, profil, cycles, EX, loadIA, setLoadIA, loadMsg, setLoadMsg, photos, setPhotos, readFile, corrigerFaibles, setCorrigerFaibles } = props;

  // ─── State interne ───────────────────────────────────────────────────────
  const getInitialView = () => {
    try {
      const v = localStorage.getItem("mc_progView");
      if (v) { localStorage.removeItem("mc_progView"); return v; }
    } catch {}
    // Si un programme existe, afficher "today" par défaut; sinon "creer"
    try {
      const savedProg = localStorage.getItem("mc_prog");
      if (savedProg && savedProg !== "null") return "today";
    } catch {}
    return "creer";
  };
  const [progView,   setProgView]   = useState(getInitialView);
  const [createStep, setCS]         = useState(0);
  const [newP,       setNewP]       = useState({nom:"",jours:[],seances:{}});
  const [jourActif,  setJourActif]  = useState(null);
  const [groupe,     setGroupe]     = useState(null);
  const [editExIdx,  setEditExIdx]  = useState({});
  const [exModal,    setExModal]    = useState(null);
  const [exModalTab, setExModalTab] = useState("tips");

  const subNav = [
    {id:"today",    l:"Aujourd'hui"},
    {id:"creer",    l:"Programme"},
    {id:"calendar", l:"Planning"},
    {id:"analyse",  l:"Pro", prem:true},
  ];

  // Props partagés pour tous les sous-composants
  const sharedProps = {
    prog, setProg, progs, setProgs, cycleStart, setCycleStart,
    premium, setPaywall, push,
    calSess, setCalSess,
    checkedEx, setCheckedEx,
    seance, setSeance,
    setChrono, setChronoSec,
    exDetails, setExDetails,
    exEdit, setExEdit,
    profil, cycles, EX, C, INT,
    setProgView,
    setTab: props.setTab,
    jR: props.jR,
    semC: props.semC,
  };

  // Props pour Creer (inclut le state de création)
  const creerProps = {
    ...sharedProps,
    createStep, setCS,
    newP, setNewP,
    jourActif, setJourActif,
    groupe, setGroupe,
    editExIdx, setEditExIdx,
    exModal, setExModal,
    exModalTab, setExModalTab,
    setProgView,
  };

  // Props pour AnalyseIA
  const analyseProps = {
    profil,
    photos, setPhotos, readFile,
    loadIA, setLoadIA,
    loadMsg, setLoadMsg,
    corrigerFaibles, setCorrigerFaibles,
    setProg, setCycleStart, setCalSess,
    setProgView, setTab: props.setTab,
    cycles, setCycles: props.setCycles,
    prog,
    push, C, INT, EX,
  };

  return(
    <div style={{paddingBottom:16}}>
      {/* ── Segmented TopTabs (mockup) ── */}
      <div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",gap:6,padding:4,borderRadius:14,background:"#F0F2F7",border:`1px solid rgba(0,0,0,0.07)`}}>
          {subNav.map(s=>{
            const on=progView===s.id;
            return(
              <button key={s.id} onClick={()=>setProgView(s.id)} className="tap" style={{
                flex:1,padding:"8px 6px",borderRadius:11,
                background:on?"#FFFFFF":"transparent",
                border:on?"1px solid rgba(59,130,246,0.30)":"1px solid transparent",
                color:on?"#0F1923":"#6B7280",
                fontSize:11.5,fontWeight:700,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:0.2,
                boxShadow:on?"0 1px 4px rgba(0,0,0,0.08)":"none",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:4,
              }}>
                {s.prem&&<span style={{color:on?"#3B82F6":"#93C5FD",fontSize:11}}>♛</span>}
                {s.l}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{height:14}}/>

      {/* ── Planification ── */}
      {progView==="calendar" && <Calendar {...sharedProps} />}

      {/* ── Aujourd'hui ── */}
      {progView==="today" && <TodayView {...sharedProps} />}

      {/* ── Programme (creer) ── */}
      {progView==="creer" && (
        <ProgrammeView {...creerProps} />
      )}

      {/* ── Pro (AnalyseIA si premium, sinon upsell) ── */}
      {progView==="analyse" && premium && <AnalyseIA {...analyseProps} />}
      {progView==="analyse" && !premium && (
        <div style={{padding:"4px 20px 0"}}>
          <div style={{fontSize:9,fontWeight:700,color:C.dim,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>MorphoCoach</div>
          <div style={{fontFamily:"'Instrument Serif',serif",fontSize:32,fontWeight:400,letterSpacing:-1.2,color:C.text,lineHeight:1.05,marginTop:6}}>Passe en <span style={{fontStyle:"italic",color:C.goldL}}>Pro</span></div>
          <div style={{fontSize:12.5,color:C.mid,marginTop:6,fontWeight:500,lineHeight:1.4}}>L'expérience complète. Programmes générés sur-mesure, suivi avancé, accès illimité.</div>

          <div style={{position:"relative",borderRadius:26,overflow:"hidden",marginTop:20,padding:"26px 22px 24px",background:`radial-gradient(120% 60% at 70% 0%, rgba(255,171,93,0.22), transparent 60%), radial-gradient(80% 60% at 0% 100%, rgba(77,139,255,0.18), transparent 60%), linear-gradient(160deg, ${C.s2} 0%, ${C.s1} 100%)`,border:`1px solid ${C.bdHi}`,boxShadow:"0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,0,0,0.05)"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg, transparent, ${C.gold}, ${C.blue}, transparent)`}}/>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:999,background:`${C.gold}20`,border:`1px solid ${C.gold}40`,color:C.goldL,fontSize:10,fontWeight:800,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:1}}>♛ PRO</div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:36,fontWeight:400,letterSpacing:-1.3,color:C.text,lineHeight:1,marginTop:16}}>L'expérience<br/><span style={{fontStyle:"italic",color:C.goldL}}>complète.</span></div>
            <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
              {[
                {i:"✦",t:"Coach morphologique",s:"Programme adapté à ta morphologie précise"},
                {i:"◎",t:"Exercices correctifs",s:"Compensation des asymétries & déséquilibres"},
                {i:"♛",t:"Cycle 6 semaines",s:"Périodisation pro pour des gains durables"},
                {i:"⊙",t:"Suivi 3D",s:"Mesures corporelles et photo-progression"},
              ].map(f=>(
                <div key={f.t} style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:32,height:32,borderRadius:10,flexShrink:0,background:`${C.gold}18`,border:`1px solid ${C.gold}35`,color:C.goldL,display:"grid",placeItems:"center",fontSize:14}}>{f.i}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:-0.1}}>{f.t}</div>
                    <div style={{fontSize:11.5,color:C.mid,fontWeight:500,marginTop:2,lineHeight:1.4}}>{f.s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:"14px 16px",borderRadius:16,background:"rgba(11,15,31,0.5)",border:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:C.dim,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>Cycle 6 semaines</div>
                <div style={{marginTop:4,display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontFamily:"'Instrument Serif',serif",fontSize:34,fontWeight:400,letterSpacing:-1,color:C.text,lineHeight:1}}>19,99</span>
                  <span style={{fontSize:13,color:C.mid,fontWeight:600}}>€ / cycle</span>
                </div>
              </div>
              <div style={{padding:"5px 10px",borderRadius:999,background:`${C.mint}18`,border:`1px solid ${C.mint}40`,color:C.mint,fontSize:10,fontWeight:800,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:0.5}}>ÉCONOMIE 40%</div>
            </div>
            <button className="tap" onClick={()=>setPaywall(true)} style={{marginTop:16,width:"100%",padding:"16px",borderRadius:16,background:`linear-gradient(135deg, ${C.gold}, ${C.amberDk})`,border:"1px solid rgba(0,0,0,0.11)",color:"#1A1308",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:15,fontWeight:700,letterSpacing:0.2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 10px 24px ${C.amberDk}55, inset 0 1px 0 rgba(0,0,0,0.23)`}}>⚡ Commencer maintenant</button>
            <button onClick={()=>setProgView("today")} style={{marginTop:10,width:"100%",padding:"6px",background:"transparent",border:"none",color:C.mid,fontSize:12,fontWeight:600,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",cursor:"pointer"}}>Continuer en gratuit</button>
          </div>
        </div>
      )}
    </div>
  );
}
