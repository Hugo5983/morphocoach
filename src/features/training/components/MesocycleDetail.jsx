import { useState, useMemo, useEffect } from"react";
import useScrollTop from"../../../hooks/useScrollTop.js";
import { C, DARK, FONT } from"../../../data/constants.js";
import { I } from"../../../components/ui/Icon.jsx";

export default function MesocycleDetail({ prog, semC, baseVol, MEV, MAV, MRV, curVol, currentWeek, WEEKS, cycleStart, checkedEx, onClose, mode ="analyse" }) {
  useScrollTop();

  // Lock body scroll
  useEffect(() => {
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const isForce   = mode ==="force";
  const [exMenu, setExMenu] = useState(false);
  const F = FONT;
  const [exp, setExp] = useState(null);

  // ── Utilitaires data ──────────────────────────────────────────────────────
  const getWLog = () => { try { return JSON.parse(localStorage.getItem('morpho_workout_log')||'{}'); } catch{return{};} };
  const getSLog = () => { try { return JSON.parse(localStorage.getItem('morpho_sleep_log')||'{}'); } catch{return{};} };
  const sTgt = parseFloat(localStorage.getItem('morpho_sleep_target')||'8');
  const daysBack = (n) => Array.from({length:n},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-i); return d.toISOString().split('T')[0]; });
  const epley = (kg,reps) => reps===1 ? kg : Math.round(kg*(1+reps/30)*10)/10;

  // ── ACWR ──────────────────────────────────────────────────────────────────
  const acwrData = useMemo(() => {
    const wLog = getWLog();
    const d7  = daysBack(7);
    const d28 = daysBack(28);
    const loggedDates = Object.keys(wLog).filter(d => wLog[d]?.totalVolume > 0).sort();
    const hasAcute = d7.some(d => wLog[d]?.totalVolume > 0);
    const spanDays = loggedDates.length
      ? Math.round((Date.now() - new Date(loggedDates[0]).getTime()) / 864e5) + 1
      : 0;
    const MIN_SPAN = 21;
    if (!hasAcute || spanDays < MIN_SPAN) {
      return { ratio: null, source:"insufficient", spanDays, need: MIN_SPAN };
    }
    const acute   = d7.reduce((s,d)  => s + (wLog[d]?.totalVolume||0), 0);
    const chronic = d28.reduce((s,d) => s + (wLog[d]?.totalVolume||0), 0) / 4;
    const ratio   = chronic > 0 ? Math.round((acute/chronic)*100)/100 : null;
    // Si la base chronique est trop faible (< 4 séances en 28j), le ratio est trompeur
    if (ratio !== null && chronic < 200) {
      return { ratio: null, source:"insufficient", spanDays, need: 21, acute: Math.round(acute), chronic: Math.round(chronic) };
    }
    return { ratio, acute: Math.round(acute), chronic: Math.round(chronic), source:"réel", spanDays };
  }, []);

  // ── Sommeil ───────────────────────────────────────────────────────────────
  const sleepData = useMemo(() => {
    const sLog = getSLog();
    const d7   = daysBack(7);
    const vals = d7.map(d=>sLog[d]||0).filter(v=>v>0);
    const avg  = vals.length>0 ? Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10 : null;
    const pct  = avg!==null ? Math.min(100,Math.round((avg/sTgt)*100)) : null;
    return { avg, pct, target:sTgt, days:vals.length };
  }, []);

  // ── Sommeil 14j (mini chart) ──────────────────────────────────────────────
  const sleep14 = useMemo(() => {
    const sLog = getSLog();
    const d14 = daysBack(14);
    return d14.reverse().map(d => sLog[d] || 0);
  }, []);

  // ── Mobilité 7j ───────────────────────────────────────────────────────────
  const mobData = useMemo(() => {
    try {
      const mLog = JSON.parse(localStorage.getItem('morpho_mobilite_log')||'{}');
      const d7 = daysBack(7);
      const count = d7.filter(d => mLog[d]).length;
      return { count, total: 7 };
    } catch { return { count: 0, total: 7 }; }
  }, []);

  // ── Performance ───────────────────────────────────────────────────────────
  const perfAll = useMemo(() => {
    const wLog = getWLog();
    const byEx = {};
    Object.entries(wLog).sort(([a],[b])=>a.localeCompare(b)).forEach(([date,log]) => {
      (log.sets||[]).forEach(s => {
        if (!byEx[s.exNom]) byEx[s.exNom] = [];
        byEx[s.exNom].push({ date, kg:s.kg, reps:s.reps, rm:epley(s.kg,s.reps) });
      });
    });
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
    return perfAll.find(e => e.exNom === selEx) || perfAll[0];
  }, [perfAll, selEx]);

  // ── Helpers visuels ───────────────────────────────────────────────────────
  const nearMRV = curVol >= MRV*0.9;
  const weekIdx = Math.min(currentWeek, (WEEKS||[]).length-1);
  const phase = WEEKS?.[weekIdx] || { label:"Base", color:"#3B82F6" };
  const phaseLabel = phase.label==="Déload" ? "Récupération"
    : phase.label==="Pic" ? "Pic de performance" : "Accumulation";

  // ACWR visuals
  const acwrRatio = acwrData.ratio;
  const hasACWR = acwrRatio !== null;
  const acwrColor = !hasACWR ? "#9AA3B2"
    : acwrRatio >= 0.8 && acwrRatio <= 1.3 ? "#0B8A5F"
    : acwrRatio > 1.3 || acwrRatio < 0.8 ? "#F5A100"
    : "#EF4444";
  const acwrLabel = !hasACWR ? "En attente"
    : acwrRatio >= 0.8 && acwrRatio <= 1.3 ? "zone idéale"
    : acwrRatio > 1.5 ? "dangereux"
    : acwrRatio > 1.3 ? "vigilance" : "sous-entraînement";
  // Gauge position: 0=left, 1=right. Sweet spot 0.8-1.3 is center.
  const acwrPos = !hasACWR ? 0.5
    : Math.max(0.02, Math.min(0.98, (acwrRatio - 0.5) / 1.2));

  // Récup score (0-100)
  let recupScore = 50;
  if (sleepData.avg !== null) {
    if (sleepData.avg >= sTgt) recupScore += 25;
    else if (sleepData.avg >= sTgt - 1) recupScore += 12;
    else recupScore -= 10;
  }
  if (mobData.count >= 4) recupScore += 15;
  else if (mobData.count >= 2) recupScore += 5;
  else recupScore -= 5;
  if (!nearMRV) recupScore += 10;
  else recupScore -= 10;
  recupScore = Math.max(10, Math.min(100, recupScore));
  const recupColor = recupScore >= 70 ? "#0B8A5F" : recupScore >= 45 ? "#F5A100" : "#EF4444";
  const recupLabel = recupScore >= 70 ? "Bonne récup" : recupScore >= 45 ? "Récup moyenne" : "Récup faible";
  const CIRC = 97;
  const recupDash = Math.round(CIRC * (recupScore / 100));

  // Surentraînement
  const perfTrend = perfData?.trend;
  const perfOK = perfTrend === null || perfTrend >= 0;
  const perfExName = perfData?.exNom || "—";
  const sleepOK = sleepData.avg !== null && sleepData.avg >= sTgt - 0.5;
  const hasAnyData = perfData !== null || sleepData.avg !== null;
  const overLabel = !hasAnyData ? "En attente de données"
    : perfOK && sleepOK ? "Récup bonne"
    : perfOK || sleepOK ? "À surveiller" : "Risque élevé";
  const overColor = !hasAnyData ? "#9AA3B2"
    : perfOK && sleepOK ? "#0B8A5F"
    : perfOK || sleepOK ? "#F5A100" : "#EF4444";
  const overBg = !hasAnyData ? "#F6F7F9"
    : perfOK && sleepOK ? "#E7F7F0"
    : perfOK || sleepOK ? "#FEF3E2" : "#FDECEC";

  // volume bar height
  const VMAX = Math.max(MRV * 1.15, curVol * 1.05, 30);
  const volPct = Math.max(5, Math.round((curVol / VMAX) * 100));
  const volColor = curVol > MRV ? "#EF4444" : curVol > MAV ? "#F5A100" : "#12B981";

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{position:"fixed",inset:0,zIndex:340,background:"#F1F3F8",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",overscrollBehavior:"contain"}}
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      <style>{`
        @keyframes mFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes mRingDraw{from{stroke-dashoffset:var(--m-o0,97)}to{stroke-dashoffset:var(--m-o1,0)}}
        @keyframes mAurora{0%{transform:translate(-6%,-4%) scale(1)}50%{transform:translate(7%,5%) scale(1.18)}100%{transform:translate(-6%,-4%) scale(1)}}
        @keyframes mGrowH{from{height:0}}
        @keyframes mGrowW{from{width:0}}
        @keyframes mSlideMark{from{opacity:0;left:5%}}
        @keyframes mPulseDot{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}50%{box-shadow:0 0 0 7px rgba(239,68,68,0)}}
      `}</style>

      <div style={{padding:"0 18px 160px",maxWidth:480,margin:"0 auto"}}>

        {/* ── Retour ── */}
        <div onClick={onClose} style={{
          display:"flex",alignItems:"center",gap:6,padding:"20px 0 8px",cursor:"pointer",
          animation:"mFadeUp .5s cubic-bezier(.22,1,.36,1) both",animationDelay:".02s",
        }}>
          <I name="chevronLeft" size={18} color="#3B5BFB"/>
          <span style={{fontSize:15,fontWeight:700,color:"#3B5BFB",fontFamily:F}}>Retour</span>
        </div>

        {/* ── HERO mésocycle aurora ── */}
        <div style={{
          position:"relative",borderRadius:26,overflow:"hidden",background:"#0B0E1A",
          marginBottom:16,
          animation:"mFadeUp .6s cubic-bezier(.22,1,.36,1) both",animationDelay:".08s",
        }}>
          <div style={{position:"absolute",top:-60,left:-40,width:230,height:230,borderRadius:"50%",
            background:"radial-gradient(circle,#3B5BFB,transparent 66%)",filter:"blur(20px)",opacity:0.55,
            animation:"mAurora 10s ease-in-out infinite",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-70,right:-50,width:250,height:250,borderRadius:"50%",
            background:"radial-gradient(circle,#7C5CFF,transparent 66%)",filter:"blur(24px)",opacity:0.4,
            animation:"mAurora 13s ease-in-out infinite reverse",pointerEvents:"none"}}/>
          <div style={{position:"relative",padding:20,display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.12em",color:"#9FB0FF",fontFamily:F}}>
                MÉSOCYCLE · SEMAINE {weekIdx+1} / {WEEKS?.length||6}
              </span>
              <span style={{display:"inline-flex",alignItems:"center",gap:6,
                background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.14)",
                borderRadius:99,padding:"5px 11px",fontSize:11,fontWeight:800,color:"#fff",fontFamily:F}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#7C5CFF"}}/>
                {phaseLabel}
              </span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <span style={{fontSize:33,fontWeight:800,letterSpacing:"-0.03em",color:"#fff",lineHeight:1,fontFamily:F}}>
                Analyse <span style={{fontStyle:"italic",color:"#A9B8FF"}}>de charge</span>
              </span>
              <span style={{fontSize:13.5,fontWeight:600,color:"rgba(255,255,255,0.62)",fontFamily:F}}>
                Phase {phaseLabel.toLowerCase()} · {prog?.objectif || "Hypertrophie"}
              </span>
            </div>
            {/* Progress dots */}
            <div style={{display:"flex",gap:6,paddingTop:2}}>
              {(WEEKS||[]).map((_,i) => (
                <span key={i} style={{flex:1,height:6,borderRadius:99,
                  background: i <= weekIdx ? "#5B8DFF" : "rgba(255,255,255,0.16)"}}/>
              ))}
            </div>
          </div>
        </div>

        {/* ── 1. RATIO CHARGE AIGUË / CHRONIQUE ── */}
        <div style={{
          background:"#fff",border:"1px solid rgba(15,25,35,0.06)",borderRadius:22,padding:18,
          marginBottom:14,boxShadow:"0 2px 10px rgba(15,25,35,0.05)",
          animation:"mFadeUp .55s cubic-bezier(.22,1,.36,1) both",animationDelay:".16s",
        }}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.06em",color:"#6B7486",lineHeight:1.3,fontFamily:F}}>
                RATIO CHARGE AIGUË / CHRONIQUE
              </span>
              <span style={{fontSize:12,fontWeight:500,color:"#9AA3B2",fontFamily:F}}>
                Compare ta charge 7 jours vs ta moyenne 28 jours
              </span>
            </div>
            {hasACWR ? (
              <span style={{display:"inline-flex",alignItems:"center",gap:6,
                background: acwrRatio > 1.3 ? "#FDECEC" : "#E7F7F0",
                borderRadius:99,padding:"5px 11px",fontSize:11,fontWeight:800,
                color: acwrRatio > 1.3 ? "#C23B3B" : "#0B8A5F",whiteSpace:"nowrap",fontFamily:F}}>
                <span style={{width:6,height:6,borderRadius:"50%",
                  background: acwrRatio > 1.3 ? "#EF4444" : "#12B981",
                  ...(acwrRatio > 1.3 ? {animation:"mPulseDot 1.8s ease-in-out infinite"} : {})}}/>
                Données réelles
              </span>
            ) : (
              <span style={{background:"#F6F7F9",borderRadius:99,padding:"5px 11px",fontSize:11,fontWeight:800,color:"#98A2B3",fontFamily:F}}>
                En attente
              </span>
            )}
          </div>
          {hasACWR ? (
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:14}}>
              <span style={{fontSize:46,fontWeight:800,letterSpacing:"-0.03em",color:acwrColor,lineHeight:0.9,
                fontVariantNumeric:"tabular-nums",fontFamily:F}}>
                {acwrRatio.toFixed(2)}
              </span>
              <span style={{fontSize:15,fontWeight:800,color:"#6B7486",fontFamily:F}}>{acwrLabel}</span>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14,padding:"12px 16px",
              background:"linear-gradient(135deg,#F7F8FB,#EEF1FF)",borderRadius:16,border:"1px dashed rgba(59,91,251,0.2)"}}>
              <span style={{fontSize:15,fontWeight:800,color:"#3B5BFB",fontFamily:F}}>Bientôt disponible</span>
              <span style={{fontSize:12.5,fontWeight:500,color:"#6B7486",lineHeight:1.5,fontFamily:F}}>
                Complète 3 semaines d'entraînement (encore {Math.max(0, 21 - acwrData.spanDays)} jours) pour activer cette analyse — plus tu t'entraînes, plus elle est précise.
              </span>
            </div>
          )}
          {/* Jauge dégradée */}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
            <div style={{position:"relative",height:12,borderRadius:99,
              background:"linear-gradient(90deg,#EF4444 0%,#F5B301 16%,#12B981 42%,#12B981 58%,#F5B301 82%,#EF4444 100%)",
              overflow:"visible"}}>
              <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
                width:2,height:20,background:"rgba(255,255,255,0.7)",borderRadius:2}}/>
              {hasACWR && (
                <span style={{position:"absolute",top:"50%",left:`${acwrPos*100}%`,transform:"translateY(-50%)",
                  width:20,height:20,borderRadius:"50%",background:"#fff",
                  border:`3px solid ${acwrColor}`,boxShadow:`0 3px 8px ${acwrColor}80`,
                  animation:"mSlideMark 1.1s cubic-bezier(.34,1.4,.5,1) .4s both"}}/>
              )}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,color:"#9AA3B2",
              fontVariantNumeric:"tabular-nums",fontFamily:F}}>
              <span>0.5</span><span>0.8</span><span style={{color:"#0B8A5F"}}>1.0</span><span>1.3</span><span>1.5+</span>
            </div>
          </div>
          {/* Boîtes charge */}
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <div style={{flex:1,background:"#F7F8FB",borderRadius:14,padding:"12px 13px",display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:10,fontWeight:800,letterSpacing:"0.04em",color:"#9AA3B2",fontFamily:F}}>CHARGE 7J</span>
              <span style={{fontSize:19,fontWeight:800,color:"#0F1923",letterSpacing:"-0.02em",fontFamily:F}}>
                {hasACWR ? `${acwrData.acute} kg` : "—"}
              </span>
            </div>
            <div style={{flex:1,background:"#F7F8FB",borderRadius:14,padding:"12px 13px",display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:10,fontWeight:800,letterSpacing:"0.04em",color:"#9AA3B2",fontFamily:F}}>MOY. / SEM 28J</span>
              <span style={{fontSize:19,fontWeight:800,color:"#0F1923",letterSpacing:"-0.02em",fontFamily:F}}>
                {hasACWR ? `${acwrData.chronic} kg` : "—"}
              </span>
            </div>
          </div>
          {/* Expand */}
          <div onClick={e=>{e.stopPropagation();setExp(exp==="acwr"?null:"acwr")}} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",paddingTop:2}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B5BFB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d={exp==="acwr"?"M18 15l-6-6-6 6":"M6 9l6 6 6-6"}/>
            </svg>
            <span style={{fontSize:13,fontWeight:700,color:"#3B5BFB",fontFamily:F}}>À quoi ça sert ?</span>
          </div>
          {exp==="acwr" && (
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(15,25,35,0.06)",fontSize:13,color:"#6B7486",lineHeight:1.6,fontFamily:F}}>
              Ce ratio compare ta <b style={{color:"#0F1923"}}>charge des 7 derniers jours</b> à ta <b style={{color:"#0F1923"}}>moyenne sur 28 jours</b>.
              Entre <b style={{color:"#0B8A5F"}}>0.8 et 1.3</b>, ton corps absorbe bien l'entraînement.
              Au-dessus de 1.5, tu risques la blessure ou le surentraînement.
              En dessous de 0.8, tu perds tes adaptations.
            </div>
          )}
        </div>

        {/* ── 2. VOLUME VS CAPACITÉ DE RÉCUPÉRATION ── */}
        <div style={{
          background:"#fff",border:"1px solid rgba(15,25,35,0.06)",borderRadius:22,padding:18,
          marginBottom:14,boxShadow:"0 2px 10px rgba(15,25,35,0.05)",
          animation:"mFadeUp .55s cubic-bezier(.22,1,.36,1) both",animationDelay:".24s",
        }}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.06em",color:"#6B7486",lineHeight:1.3,fontFamily:F}}>
                VOLUME VS CAPACITÉ DE RÉCUPÉRATION
              </span>
              <span style={{fontSize:12,fontWeight:500,color:"#9AA3B2",fontFamily:F}}>
                Séries totales de la semaine vs tes limites de récupération
              </span>
            </div>
            <span style={{background: nearMRV?"#FEF3E2":"#E7F7F0",borderRadius:99,padding:"5px 11px",fontSize:11,fontWeight:800,
              color: nearMRV?"#B37400":"#0B8A5F",whiteSpace:"nowrap",fontFamily:F}}>
              {nearMRV ? "Limite proche" : "Dans la zone"}
            </span>
          </div>
          {curVol > 0 ? (
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:16}}>
              <span style={{fontSize:40,fontWeight:800,letterSpacing:"-0.03em",color:volColor,lineHeight:0.9,
                fontVariantNumeric:"tabular-nums",fontFamily:F}}>{curVol}</span>
              <span style={{fontSize:15,fontWeight:800,color:"#6B7486",fontFamily:F}}>séries cette sem.</span>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16,padding:"12px 16px",
              background:"linear-gradient(135deg,#F7F8FB,#EEF1FF)",borderRadius:16,border:"1px dashed rgba(59,91,251,0.2)"}}>
              <span style={{fontSize:15,fontWeight:800,color:"#3B5BFB",fontFamily:F}}>Aucune séance cette semaine</span>
              <span style={{fontSize:12.5,fontWeight:500,color:"#6B7486",lineHeight:1.5,fontFamily:F}}>
                Démarre une séance pour voir ton volume apparaître ici avec les seuils MEV / MAV / MRV.
              </span>
            </div>
          )}
          {/* Barres + seuils */}
          <div style={{display:"flex",alignItems:"flex-end",gap:14,height:150,padding:"2px 2px 0",marginBottom:12}}>
            <div style={{flex:1,display:"flex",alignItems:"flex-end",height:"100%"}}>
              <div style={{position:"relative",width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                <div style={{width:"100%",borderRadius:"12px 12px 6px 6px",
                  background:`linear-gradient(180deg,${volColor},${curVol > MRV?"#EF4444":"#0BA36B"})`,
                  height:`${volPct}%`,boxShadow:`0 8px 20px ${volColor}48`,
                  animation:"mGrowH 1.1s cubic-bezier(.22,1,.36,1) .5s both",
                  display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:9}}>
                  <span style={{fontSize:17,fontWeight:800,color:"#fff",fontFamily:F}}>{curVol}</span>
                </div>
              </div>
            </div>
            <div style={{flex:2.4,position:"relative",height:"100%"}}>
              {/* MRV */}
              <div style={{position:"absolute",left:0,right:0,top:`${Math.max(5,100-Math.round((MRV/VMAX)*100))}%`,display:"flex",alignItems:"center",gap:0}}>
                <span style={{flex:1,borderTop:"2px dashed #F3B7B7"}}/>
                <span style={{background:"#FDECEC",color:"#C23B3B",fontSize:11,fontWeight:800,borderRadius:7,padding:"3px 8px",marginLeft:6,fontFamily:F}}>MRV {MRV}</span>
              </div>
              {/* MAV */}
              <div style={{position:"absolute",left:0,right:0,top:`${Math.max(5,100-Math.round((MAV/VMAX)*100))}%`,display:"flex",alignItems:"center",gap:0}}>
                <span style={{flex:1,borderTop:"2px dashed #A9E3CB"}}/>
                <span style={{background:"#E7F7F0",color:"#0B8A5F",fontSize:11,fontWeight:800,borderRadius:7,padding:"3px 8px",marginLeft:6,fontFamily:F}}>MAV {MAV}</span>
              </div>
              {/* MEV */}
              <div style={{position:"absolute",left:0,right:0,top:`${Math.max(5,100-Math.round((MEV/VMAX)*100))}%`,display:"flex",alignItems:"center",gap:0}}>
                <span style={{flex:1,borderTop:"2px dashed #C3CDF7"}}/>
                <span style={{background:"#E9EDFF",color:"#2540E0",fontSize:11,fontWeight:800,borderRadius:7,padding:"3px 8px",marginLeft:6,fontFamily:F}}>MEV {MEV}</span>
              </div>
            </div>
          </div>
          <div onClick={e=>{e.stopPropagation();setExp(exp==="vol"?null:"vol")}} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B5BFB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d={exp==="vol"?"M18 15l-6-6-6 6":"M6 9l6 6 6-6"}/>
            </svg>
            <span style={{fontSize:13,fontWeight:700,color:"#3B5BFB",fontFamily:F}}>Comprendre les seuils MEV / MAV / MRV</span>
          </div>
          {exp==="vol" && (
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(15,25,35,0.06)",fontSize:13,color:"#6B7486",lineHeight:1.6,fontFamily:F}}>
              <b style={{color:"#2540E0"}}>MEV</b> = volume minimum pour maintenir tes gains.{" "}
              <b style={{color:"#0B8A5F"}}>MAV</b> = zone idéale de progression.{" "}
              <b style={{color:"#C23B3B"}}>MRV</b> = maximum récupérable — au-delà, ton corps ne suit plus et tu risques le surentraînement. Reste entre MEV et MAV pour progresser sans te griller.
            </div>
          )}
        </div>

        {/* ── 3. SCORE DE RÉCUPÉRATION ── */}
        <div style={{
          background:"#fff",border:"1px solid rgba(15,25,35,0.06)",borderRadius:22,padding:18,
          marginBottom:14,boxShadow:"0 2px 10px rgba(15,25,35,0.05)",
          animation:"mFadeUp .55s cubic-bezier(.22,1,.36,1) both",animationDelay:".32s",
        }}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14}}>
            <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.06em",color:"#6B7486",fontFamily:F}}>SCORE DE RÉCUPÉRATION</span>
            <span style={{background: sleepData.days > 0 ? "#E7F7F0" : "#F6F7F9",borderRadius:99,padding:"5px 11px",fontSize:11,fontWeight:800,
              color: sleepData.days > 0 ? "#0B8A5F" : "#98A2B3",whiteSpace:"nowrap",fontFamily:F}}>
              {sleepData.days > 0 ? "Données réelles · 7j" : "En attente"}
            </span>
          </div>
          {sleepData.days === 0 && mobData.count === 0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:6,padding:"12px 16px",
              background:"linear-gradient(135deg,#F7F8FB,#EEF1FF)",borderRadius:16,border:"1px dashed rgba(59,91,251,0.2)"}}>
              <span style={{fontSize:15,fontWeight:800,color:"#3B5BFB",fontFamily:F}}>Pas encore de données</span>
              <span style={{fontSize:12.5,fontWeight:500,color:"#6B7486",lineHeight:1.5,fontFamily:F}}>
                Note ton sommeil et fais tes séances de mobilité pour calculer ton score de récupération.
              </span>
            </div>
          ) : null}
          {(sleepData.days > 0 || mobData.count > 0) && <div style={{display:"flex",alignItems:"center",gap:18}}>
            {/* Anneau */}
            <div style={{position:"relative",width:92,height:92,flex:"none"}}>
              <svg width="92" height="92" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F1F3F8" strokeWidth="4"/>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={recupColor} strokeWidth="4"
                  strokeLinecap="round" strokeDasharray={`${recupDash} ${CIRC}`}
                  transform="rotate(-90 18 18)"
                  style={{"--m-o0":`${recupDash}`,"--m-o1":"0",animation:"mRingDraw 1.2s cubic-bezier(.22,1,.36,1) .5s both"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                animation:"mFadeIn .6s ease 1s both"}}>
                <span style={{fontSize:28,fontWeight:800,color:recupColor,lineHeight:1,letterSpacing:"-0.02em",fontFamily:F}}>{recupScore}</span>
                <span style={{fontSize:10,fontWeight:700,color:"#9AA3B2",fontFamily:F}}>/ 100</span>
              </div>
            </div>
            {/* Barres sommeil + mobilité */}
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:13}}>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#0F1923",fontFamily:F}}>Sommeil 7j</span>
                  <span style={{fontSize:13,fontWeight:800,
                    color: sleepData.avg !== null ? (sleepData.avg >= sTgt - 0.5 ? "#0B8A5F" : "#F5A100") : "#9AA3B2",fontFamily:F}}>
                    {sleepData.avg !== null ? `${sleepData.avg}h` : "—"}
                  </span>
                </div>
                <div style={{height:7,borderRadius:99,background:"#EEF0F5",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${sleepData.pct || 4}%`,
                    background: sleepData.pct && sleepData.pct >= 85 ? "linear-gradient(90deg,#12B981,#0BA36B)" : "#F5A100",
                    borderRadius:99,animation:"mGrowW 1s cubic-bezier(.22,1,.36,1) .7s both"}}/>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#0F1923",fontFamily:F}}>Mobilité 7j</span>
                  <span style={{fontSize:13,fontWeight:800,
                    color: mobData.count >= 4 ? "#0B8A5F" : mobData.count > 0 ? "#F5A100" : "#EF4444",fontFamily:F}}>
                    {mobData.count} / {mobData.total}j
                  </span>
                </div>
                <div style={{height:7,borderRadius:99,background:"#EEF0F5",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.max(4,Math.round((mobData.count/mobData.total)*100))}%`,
                    background: mobData.count >= 4 ? "linear-gradient(90deg,#12B981,#0BA36B)" : "#EF4444",borderRadius:99}}/>
                </div>
              </div>
            </div>
          </div>}
          <div onClick={e=>{e.stopPropagation();setExp(exp==="recup"?null:"recup")}} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginTop:14}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B5BFB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d={exp==="recup"?"M18 15l-6-6-6 6":"M6 9l6 6 6-6"}/>
            </svg>
            <span style={{fontSize:13,fontWeight:700,color:"#3B5BFB",fontFamily:F}}>Que faire avec ce score ?</span>
          </div>
          {exp==="recup" && (
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(15,25,35,0.06)",fontSize:13,color:"#6B7486",lineHeight:1.6,fontFamily:F}}>
              {recupScore >= 70
                ? "Ta récupération est bonne. Tu peux maintenir ou augmenter légèrement ton volume d'entraînement cette semaine."
                : recupScore >= 45
                  ? "Ta récupération est correcte mais pas optimale. Pense à améliorer ton sommeil et à faire des étirements réguliers."
                  : "Ta récupération est insuffisante. Réduis ton volume, dors plus, et fais une séance de mobilité avant de reprendre fort."}
            </div>
          )}
        </div>

        {/* ── 4. DÉTECTION SURENTRAÎNEMENT ── */}
        <div style={{
          background:"#fff",border:"1px solid rgba(15,25,35,0.06)",borderRadius:22,padding:18,
          marginBottom:14,boxShadow:"0 2px 10px rgba(15,25,35,0.05)",
          animation:"mFadeUp .55s cubic-bezier(.22,1,.36,1) both",animationDelay:".40s",
        }}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.06em",color:"#6B7486",fontFamily:F}}>DÉTECTION SURENTRAÎNEMENT</span>
              <span style={{fontSize:26,fontWeight:800,letterSpacing:"-0.03em",color:overColor,lineHeight:1,fontFamily:F}}>{overLabel}</span>
            </div>
            <span style={{background:overBg,borderRadius:99,padding:"5px 11px",fontSize:11,fontWeight:800,color:overColor,whiteSpace:"nowrap",fontFamily:F}}>
              Surveillance
            </span>
          </div>

          {/* Lignes cascade */}
          <div style={{display:"flex",flexDirection:"column"}}>
            {[
              {
                label: "Performance",
                sub: perfData ? `${perfTrend !== null ? (perfTrend >= 0 ? `+${perfTrend}%` : `${perfTrend}%`) : "—"} · ${perfExName}` : "Aucune donnée",
                ok: perfOK && perfData,
                icon: <I name="progress" size={19} color={perfOK && perfData?"#12B981":"#B4BCCA"}/>,
                delay: ".46s",
              },
              {
                label: "Sommeil",
                sub: sleepData.avg !== null ? `${sleepData.avg}h moyenne (cible ${sTgt}h)` : "Aucune donnée",
                ok: sleepOK,
                icon: <I name="sleep" size={19} color={sleepOK?"#12B981":"#B4BCCA"}/>,
                delay: ".51s",
              },
              {
                label: "FC repos",
                sub: "Connecte une app santé",
                ok: null,
                icon: <I name="cardio" size={19} color="#B4BCCA"/>,
                delay: ".56s",
              },
              {
                label: "Motivation",
                sub: "Check-in hebdo à venir",
                ok: null,
                icon: <I name="flame" size={19} color="#B4BCCA"/>,
                delay: ".61s",
              },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display:"flex",alignItems:"center",gap:13,padding:"12px 0",
                borderBottom: i < arr.length-1 ? "1px solid rgba(15,25,35,0.06)" : "none",
                animation:"mFadeUp .5s cubic-bezier(.22,1,.36,1) both",animationDelay:row.delay,
              }}>
                <div style={{width:40,height:40,borderRadius:12,
                  background: row.ok ? "#E7F7F0" : "#F1F3F8",display:"grid",placeItems:"center",flex:"none"}}>
                  {row.icon}
                </div>
                <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:1}}>
                  <span style={{fontSize:14.5,fontWeight:800,color:"#0F1923",fontFamily:F}}>{row.label}</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#9AA3B2",fontFamily:F,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.sub}</span>
                </div>
                {row.ok === true && <span style={{background:"#E7F7F0",color:"#0B8A5F",fontSize:12,fontWeight:800,borderRadius:9,padding:"5px 11px",fontFamily:F}}>OK</span>}
                {row.ok === false && <span style={{background:"#FEF3E2",color:"#B37400",fontSize:12,fontWeight:800,borderRadius:9,padding:"5px 11px",fontFamily:F}}>!</span>}
                {row.ok === null && <span style={{fontSize:15,fontWeight:800,color:"#C3C9D4"}}>–</span>}
              </div>
            ))}
          </div>

          {/* Mini graph sommeil 14j */}
          <div style={{background:"#F7F8FB",borderRadius:16,padding:"15px 15px 12px",marginTop:14,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.05em",color:"#6B7486",fontFamily:F}}>SOMMEIL · 14 JOURS</span>
              <span style={{fontSize:11,fontWeight:700,color:"#9AA3B2",fontFamily:F}}>cible {sTgt}h</span>
            </div>
            <div style={{position:"relative",height:74,display:"flex",alignItems:"flex-end",gap:4}}>
              {/* Ligne cible */}
              <div style={{position:"absolute",left:0,right:0,top:"24%",borderTop:"1.5px dashed #A9B8FF",zIndex:2}}/>
              {sleep14.map((h, i) => {
                const maxH = Math.max(...sleep14, sTgt, 1);
                const pct = h > 0 ? Math.max(12, Math.round((h / maxH) * 100)) : 10;
                const isToday = i === sleep14.length - 1;
                const isLogged = h > 0;
                return (
                  <div key={i} style={{flex:1,display:"flex",alignItems:"flex-end",height:"100%"}}>
                    <div style={{
                      width:"100%",height:`${pct}%`,
                      borderRadius: isToday ? 5 : 4,
                      background: isToday && isLogged
                        ? "linear-gradient(180deg,#12B981,#0BA36B)"
                        : isLogged ? (h >= sTgt ? "#A9E3CB" : "#E1E5EE") : "#E1E5EE",
                      boxShadow: isToday && isLogged ? "0 6px 14px rgba(18,185,129,0.32)" : "none",
                      animation: isToday ? "mGrowH 1s cubic-bezier(.22,1,.36,1) .7s both" : "none",
                    }}/>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:11,fontWeight:600,color:"#9AA3B2",fontFamily:F}}>
                {(() => { const d = new Date(); d.setDate(d.getDate()-13); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; })()}
              </span>
              <span style={{fontSize:11,fontWeight:700,color:"#0B8A5F",fontFamily:F}}>aujourd'hui</span>
            </div>
          </div>

          <div onClick={e=>{e.stopPropagation();setExp(exp==="over"?null:"over")}} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginTop:12}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B5BFB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d={exp==="over"?"M18 15l-6-6-6 6":"M6 9l6 6 6-6"}/>
            </svg>
            <span style={{fontSize:13,fontWeight:700,color:"#3B5BFB",fontFamily:F}}>Interprétation coach</span>
          </div>
          {exp==="over" && (
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(15,25,35,0.06)",fontSize:13,color:"#6B7486",lineHeight:1.6,fontFamily:F}}>
              {perfOK && sleepOK
                ? "Tout est au vert. Ta performance est stable ou en hausse, et ton sommeil est suffisant. Continue sur ce rythme."
                : !sleepOK && perfOK
                  ? "Ta performance tient pour l'instant, mais ton sommeil est insuffisant. C'est souvent le premier signal avant une baisse de force. Priorise le repos."
                  : !perfOK && sleepOK
                    ? "Ta force baisse malgré un sommeil correct. Le volume est peut-être trop élevé pour cette phase. Envisage un deload ou réduis 2-3 séries par séance."
                    : "Performance en baisse + sommeil insuffisant = risque élevé de surentraînement. Réduis le volume de 30%, dors 8h+ et fais une séance de mobilité avant de reprendre."}
            </div>
          )}
        </div>

        <div style={{height:40}}/>
      </div>
    </div>
  );
}
