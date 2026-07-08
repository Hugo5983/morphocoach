import { useState, useMemo } from "react";
import { C, DARK, FONT } from "../../../data/constants.js";

export default function MesocycleDetail({ prog, semC, baseVol, MEV, MAV, MRV, curVol, currentWeek, WEEKS, cycleStart, checkedEx, onClose, mode = "analyse" }) {
  const isForce   = mode === "force";
  const [exMenu, setExMenu] = useState(false);   // dropdown sélecteur d'exercice (mode force)
  const DISP_F = FONT;
  const SERIF_F = FONT;
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

  // ── Liste de TOUS les exercices du programme (pour le menu déroulant force) ──
  const allExNames = useMemo(() => {
    const names = new Set();
    (prog?.jours||[]).forEach(j => (j.exercices||[]).forEach(ex => {
      if (ex.nom) names.add(ex.nom);
    }));
    // ajoute aussi ceux loggés mais absents du prog actuel
    perfAll.forEach(e => names.add(e.exNom));
    return Array.from(names);
  }, [prog, perfAll]);

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
    <div onClick={()=>setExp(exp===key?null:key)} style={{background:C.s1,border:`1px solid ${exp===key?"rgba(59,130,246,0.25)":C.bd}`,borderRadius:20,padding:16,marginBottom:12,cursor:"pointer"}}>
      {children}
    </div>
  );
  const expandRow = (key, label) => (
    <div style={{fontSize:10,color:DARK.accent,marginTop:12,display:"flex",alignItems:"center",gap:4,fontFamily:DISP_F}}>
      {exp===key?"▴":"▾"} {label}
    </div>
  );
  const detailBox = (key, children) => exp===key ? (
    <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bd}`,fontSize:13,color:C.mid,lineHeight:1.6,fontFamily:DISP_F}}>{children}</div>
  ) : null;
  const reco = (icon, txt) => (
    <div style={{marginTop:12,padding:"12px 12px",background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.18)",borderRadius:12,display:"flex",gap:8,alignItems:"flex-start"}}>
      <span style={{fontSize:14,flexShrink:0}}>{icon}</span><div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{txt}</div>
    </div>
  );
  const lbl = {fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.dim,marginBottom:8,fontFamily:DISP_F};
  const badge = (bg,col,txt) => <span style={{fontSize:10,fontWeight:700,padding:"4px 8px",borderRadius:999,background:bg,color:col,whiteSpace:"nowrap",fontFamily:DISP_F}}>{txt}</span>;
  const demoBadge = badge("rgba(245,158,11,0.12)","#F59E0B","Démo · active le suivi");

  const VMAX = MRV*1.12;
  const nearMRV = curVol >= MRV*0.9;

  return (
    <div style={{position:"fixed",inset:0,zIndex:340,background:C.bg,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{padding:"0 16px 32px",maxWidth:480,margin:"0 auto"}}>
        {/* Header */}
        <div style={{position:"sticky",top:0,background:C.bg,paddingTop:20,paddingBottom:12,zIndex:2}}>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:DARK.accent,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:DISP_F,display:"flex",alignItems:"center",gap:4,marginBottom:16}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour
          </button>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:4}}>{isForce ? "Suivi de force · 1RM estimé" : `Mésocycle · Semaine ${currentWeek+1} / 6`}</div>
          <div style={{fontFamily:SERIF_F,fontSize:26,letterSpacing:-1,lineHeight:1.1}}>{isForce ? <>Progression <span style={{fontStyle:"italic",color:DARK.accent}}>de force</span></> : <>Analyse <span style={{fontStyle:"italic",color:DARK.accent}}>de charge</span></>}</div>
          <div style={{fontSize:11,color:C.dim,marginTop:4,fontFamily:DISP_F}}>{isForce ? "1RM réel par exercice · séance après séance" : `${WEEKS[currentWeek].type==="Déload"?"Phase de récupération":WEEKS[currentWeek].type==="Pic"?"Phase de pic":"Phase d'accumulation"} · Hypertrophie`}</div>
        </div>

        {/* ── SECTIONS ANALYSE (mode analyse uniquement) ── */}
        {!isForce && <>
        {/* 1. VOLUME vs MEV/MAV/MRV (RÉEL) */}
        {card("vol", <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={lbl}>Volume vs capacité de récupération</div>
              <div><span style={{fontSize:34,fontWeight:700,color:nearMRV?"#F59E0B":"#34D399",letterSpacing:-1}}>{curVol}</span> <span style={{fontSize:13,fontWeight:600,color:C.dim}}>séries cette sem.</span></div>
            </div>
            {nearMRV ? badge("rgba(245,158,11,0.12)","#F59E0B","Limite proche") : badge("rgba(52,211,153,0.12)","#34D399","Zone optimale")}
          </div>
          {/* Barres avec lignes MEV/MAV/MRV */}
          <div style={{position:"relative",display:"flex",gap:8,alignItems:"flex-end",height:120,margin:"16px 0 8px"}}>
            {[["MRV",MRV,"#F87171"],["MAV",MAV,"#34D399"],["MEV",MEV,DARK.accent]].map(([t,v,col],k)=>{
              const y = 120-(v/VMAX*120);
              return <div key={k} style={{position:"absolute",left:0,right:0,top:y,height:1,borderTop:`1px dashed ${col}40`}}>
                <span style={{position:"absolute",right:0,top:-7,fontSize:8,fontWeight:700,padding:"1px 4px",borderRadius:4,background:`${col}20`,color:col,fontFamily:DISP_F}}>{t} {v}</span>
              </div>;
            })}
            {WEEKS.map((w,i)=>{
              const v = Math.round(baseVol*w.m);
              const h = v/VMAX*120;
              const isCur = i===currentWeek;
              const col = w.type==="Déload"?"#F87171":w.type==="Pic"?"#F59E0B":C.accent;
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",gap:4,zIndex:2}}>
                <div style={{width:"100%",height:h,borderRadius:"4px 4px 2px 2px",background:isCur?`linear-gradient(180deg,${col},${col}AA)`:col+"55",boxShadow:isCur?`0 4px 12px ${col}50`:"none"}}/>
                <div style={{fontSize:10,fontWeight:700,color:isCur?col:"#9CA3AF",fontFamily:DISP_F}}>{w.lbl}</div>
              </div>;
            })}
          </div>
          {expandRow("vol","Lire les seuils MEV / MAV / MRV")}
          {detailBox("vol", <>
            Chaque muscle a des seuils de volume hebdo (en séries) :<br/>
            • <b style={{color:C.text}}>MEV</b> ({MEV}) minimum efficace — sous ce seuil, pas de gain<br/>
            • <b style={{color:C.text}}>MAV</b> ({MAV}) volume adaptatif optimal — la zone de progression<br/>
            • <b style={{color:C.text}}>MRV</b> ({MRV}) max récupérable — plafond, au-delà = surentraînement
            {reco("⚠️", <>Tu es à <b style={{color:C.text}}>{curVol} séries</b>{nearMRV?<>, proche de ton MRV ({MRV}). Le <b style={{color:C.text}}>déload S5 est essentiel</b> pour dissiper la fatigue.</>:<>, dans ta zone optimale. Continue la progression.</>}</>)}
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
            <div style={{display:"flex",alignItems:"center",gap:20,marginTop:4}}>
              {/* Anneau */}
              <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
                <svg width="90" height="90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
                  <circle cx="48" cy="48" r="42" fill="none" stroke={col} strokeWidth="7"
                    strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
                    transform="rotate(-90 48 48)" style={{transition:"stroke-dashoffset .6s,stroke .4s"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:26,fontWeight:700,color:col,lineHeight:1}}>{score??"-"}</div>
                  <div style={{fontSize:8,color:"#9CA3AF",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>/ 100</div>
                </div>
              </div>
              {/* Barres */}
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:12}}>
                {/* Sommeil */}
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:C.mid,width:76,flexShrink:0,fontFamily:DISP_F}}>Sommeil 7j</span>
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
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:C.mid,width:76,flexShrink:0,fontFamily:DISP_F}}>Mobilité 7j</span>
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
                  <div style={{fontSize:10,color:C.dim,fontFamily:DISP_F,fontStyle:"italic"}}>
                    Log sommeil + mobilité pour activer
                  </div>
                )}
              </div>
            </div>
            {expandRow("ready","Que faire avec ce score ?")}
            {detailBox("ready", <>
              Le <b style={{color:C.text}}>score de récupération</b> combine la moyenne de sommeil des 7 derniers jours (55%) et le taux de mobilité complétée (45%).
              {score!==null && score<60 && reco("⚠️","Score bas — réduis le volume cette semaine et priorise le sommeil. Sous 50, avance le déload.")}
              {score!==null && score>=60 && score<75 && reco("🎯","Fatigue modérée. Maintiens la charge mais dors plus. Cible : "+sTgt+"h/nuit.")}
              {score!==null && score>=75 && reco("✅","Bonne récupération. Tu peux progresser en charge cette semaine.")}
              {!hasData && reco("💡","Log ton sommeil et ta mobilité depuis le jour de récup pour voir ton score réel.")}
              <div style={{marginTop:12,fontSize:11,color:C.dim,fontStyle:"italic"}}>
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
            : insufficient ? badge("rgba(245,158,11,0.12)", "#F59E0B", `${spanDays}/${need} j`) : demoBadge;

          return <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={lbl}>Ratio charge aiguë / chronique</div>
                <div>
                  <span style={{fontSize:34,fontWeight:700,color:acwrCol,letterSpacing:-1}}>
                    {hasRatio ? ratio.toFixed(2) : "—"}
                  </span>
                  {' '}<span style={{fontSize:13,fontWeight:600,color:C.dim}}>{acwrLabel}</span>
                </div>
              </div>
              {liveBadge}
            </div>
            {insufficient ? (
              <div style={{margin:"16px 0 4px"}}>
                <div style={{fontSize:13,color:C.mid,lineHeight:1.5,fontFamily:DISP_F,marginBottom:12}}>
                  L'ACWR a besoin d'au moins <b style={{color:C.text}}>{need} jours</b> d'entraînement loggé pour établir une base chronique fiable. On ne l'invente pas avant.
                </div>
                <div style={{height:8,borderRadius:999,background:"rgba(0,0,0,0.05)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(100,Math.round((spanDays/need)*100))}%`,background:"linear-gradient(90deg,#F59E0B,#FBBF24)",borderRadius:999,transition:"width .6s"}}/>
                </div>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:8,fontFamily:DISP_F}}>{spanDays} jour{spanDays>1?"s":""} sur {need}</div>
              </div>
            ) : (
            <div style={{position:"relative",height:30,margin:"16px 0 16px"}}>
              <div style={{position:"absolute",bottom:8,left:0,right:0,height:8,borderRadius:4,background:"linear-gradient(90deg,#F87171 0%,#F59E0B 16%,#34D399 32%,#34D399 64%,#F59E0B 80%,#F87171 100%)"}}/>
              {jaugePos!==null && <div style={{position:"absolute",bottom:2,left:`${jaugePos}%`,width:3,height:20,background:"#FFF",borderRadius:2,boxShadow: C.shadow,transform:"translateX(-50%)"}}/>}
              <div style={{position:"absolute",bottom:-12,left:0,right:0,display:"flex",justifyContent:"space-between",fontSize:8,color:"#9CA3AF"}}><span>0.5</span><span>0.8</span><span style={{color:"#34D399"}}>1.0</span><span>1.3</span><span>1.5+</span></div>
            </div>
            )}
            {hasRatio && (
              <div style={{display:"flex",gap:12,marginTop:16}}>
                {[{l:"Charge 7j",v:acute+" kg"},{l:"Moyenne/sem 28j",v:chronic+" kg"}].map(({l,v})=>(
                  <div key={l} style={{flex:1,background:"rgba(0,0,0,0.05)",borderRadius:12,padding:"8px 12px"}}>
                    <div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:DISP_F}}>{l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.text,marginTop:4,fontFamily:DISP_F}}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            {expandRow("acwr","Pourquoi c'est crucial")}
            {detailBox("acwr", <>
              L'<b style={{color:C.text}}>ACWR</b> compare ta charge des 7 derniers jours à ta moyenne 28 jours. Indicateur n°1 du <b style={{color:C.text}}>risque de blessure</b>.<br/><br/>
              • <b style={{color:C.text}}>0,8–1,3</b> : adaptation optimale · <b style={{color:C.text}}>&gt;1,5</b> : pic dangereux · <b style={{color:C.text}}>&lt;0,8</b> : désentraînement
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
          const slpBadge  = slpAvg === null ? ["rgba(138,148,166,0.12)","#888","–"] : slpStatus==='ok' ? ["rgba(52,211,153,0.12)","#34D399","OK"] : slpStatus==='warn' ? ["rgba(245,158,11,0.12)","#F59E0B","À surveiller"] : ["rgba(248,113,113,0.12)","#F87171","Alerte"];

          const perfTrend = perfData?.trend;
          const perfStatus = perfTrend === null || perfTrend === undefined ? 'unknown' : perfTrend >= 0 ? 'ok' : perfTrend >= -2 ? 'warn' : 'alert';
          const perfLabel  = !perfData ? "Log des charges pour activer" : perfTrend===null ? `${perfData.exNom} — 1 séance seulement` : `${perfTrend>=0?'+':''}${perfTrend}% · ${perfData.exNom}`;
          const perfBadge  = !perfData||perfTrend===null ? ["rgba(138,148,166,0.12)","#888","–"] : perfStatus==='ok' ? ["rgba(52,211,153,0.12)","#34D399","OK"] : perfStatus==='warn' ? ["rgba(245,158,11,0.12)","#F59E0B","À surveiller"] : ["rgba(248,113,113,0.12)","#F87171","Alerte"];

          const signals = [
            { ic:"📉", t:"Performance", s:perfLabel, st:perfBadge[2], col:perfBadge[1], bg:perfBadge[0] },
            { ic:"😴", t:"Sommeil",     s:slpLabel,  st:slpBadge[2],  col:slpBadge[1],  bg:slpBadge[0]  },
            { ic:"💓", t:"FC repos",    s:"Connecte une app santé",   st:"–", col:"#888", bg:"rgba(138,148,166,0.12)" },
            { ic:"🔥", t:"Motivation",  s:"Check-in hebdo à venir",   st:"–", col:"#888", bg:"rgba(138,148,166,0.12)" },
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
                <div style={{fontSize:20,fontWeight:700,color:statusColor}}>{overallLabel}</div>
              </div>
              {badge(`${statusColor}20`,statusColor,statusLabel)}
            </div>
            <div style={{marginTop:16}}>
              {signals.map(({ic,t,s,st,col,bg},k)=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:k<3?"1px solid rgba(0,0,0,0.05)":"none"}}>
                  <div style={{width:34,height:34,borderRadius:12,background:bg,display:"grid",placeItems:"center",flexShrink:0,fontSize:14}}>{ic}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:DISP_F}}>{t}</div>
                    <div style={{fontSize:11,color:C.dim,marginTop:1,fontFamily:DISP_F}}>{s}</div>
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
                <div style={{marginTop:8,padding:"12px",background:"rgba(99,102,241,0.05)",border:"1px dashed rgba(99,102,241,0.25)",borderRadius:12,fontSize:11,color:C.mid,textAlign:"center",fontFamily:DISP_F}}>
                  😴 Note ton sommeil depuis l'Accueil pour voir ta courbe ici.
                </div>
              );
              const maxH = Math.max(...series.map(s=>s.h), slpTgt, 9);
              return (
                <div style={{marginTop:12,padding:"12px 12px 8px",background:"rgba(0,0,0,0.05)",borderRadius:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.dim,fontFamily:DISP_F}}>Sommeil · 14 jours</span>
                    <span style={{fontSize:10,color:"#9CA3AF",fontFamily:DISP_F}}>cible {slpTgt}h</span>
                  </div>
                  <div style={{position:"relative",display:"flex",alignItems:"flex-end",gap:4,height:56}}>
                    {/* ligne cible */}
                    <div style={{position:"absolute",left:0,right:0,bottom:`${(slpTgt/maxH)*54}px`,height:1,background:"rgba(99,102,241,0.5)",borderTop:"1px dashed rgba(99,102,241,0.5)"}}/>
                    {series.map((s,k)=>{
                      const h = s.h>0 ? Math.max(3,(s.h/maxH)*54) : 2;
                      const ok = s.h>=slpTgt;
                      const col = s.h===0 ? "rgba(0,0,0,0.05)" : ok ? "#34D399" : s.h>=slpTgt-1.5 ? "#FBBF24" : "#F87171";
                      return <div key={k} title={`${s.h||"—"}h`} style={{flex:1,height:`${h}px`,background:col,borderRadius:3,minWidth:0,transition:"height .4s"}}/>;
                    })}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:8.5,color:"#9CA3AF",fontFamily:DISP_F}}>
                    <span>{(() => { const [,m,j]=series[0].d.split("-"); return `${j}/${m}`; })()}</span>
                    <span>aujourd'hui</span>
                  </div>
                </div>
              );
            })()}

            {expandRow("over","Interprétation coach")}
            {detailBox("over", <>
              <b style={{color:C.text}}>Sommeil</b> et <b style={{color:C.text}}>performance</b> sont calculés en temps réel depuis tes logs.
              FC repos et Motivation arriveront avec le check-in hebdo (20 s).
              {alertCount>=2 && reco("🩺","2+ signaux en rouge. Réduis le volume cette semaine et priorise le sommeil.")}
              {alertCount===1 && reco("⚠️","1 signal alerte. Surveille ta récup, un déload préventif peut être bénéfique.")}
              {alertCount===0 && warnCount===0 && reco("✅","Aucun signal préoccupant. Continue la progression planifiée.")}
            </>)}
          </>;
        })())}

        </>}
        {/* ── FIN SECTIONS ANALYSE ── */}

        {/* 5. PROGRESSION FORCE — 1RM réel par séance, avec sélecteur d'exercice */}
        {isForce && card("rm", (() => {
          const hasAny  = perfAll.length > 0;
          const hasProg = perfData && perfData.sessions.length >= 2;
          const sessions = perfData?.sessions || [];
          const pct = hasProg
            ? Math.round(((sessions[sessions.length-1].rm - sessions[0].rm) / sessions[0].rm)*100*10)/10
            : null;
          const pctCol = pct===null?"#888":pct>=0?DARK.accent:"#F87171";
          const exLabel = perfData?.exNom || "Exercice";
          const liveBadge = hasProg
            ? badge(pct>=0?"rgba(52,211,153,0.12)":"rgba(248,113,113,0.12)", pct>=0?"#34D399":"#F87171", pct>=0?"↗ En hausse":"↘ En baisse")
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
                  <span style={{fontSize:34,fontWeight:700,color:pctCol,letterSpacing:-1}}>
                    {pct!==null ? `${pct>=0?'+':''}${pct}` : "–"}
                  </span>
                  {' '}<span style={{fontSize:13,fontWeight:600,color:C.dim}}>
                    {hasProg ? `% sur ${sessions.length} séances` : hasAny ? "1 séance seulement" : "Log des charges pour activer"}
                  </span>
                </div>
              </div>
              {liveBadge}
            </div>

            {/* Sélecteur d'exercice — menu déroulant */}
            {allExNames.length > 0 && (
              <div style={{position:"relative",marginTop:16,zIndex:5}}>
                <button onClick={()=>setExMenu(m=>!m)}
                  style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                    padding:"12px 16px",borderRadius:12,cursor:"pointer",
                    background:"#FFF",border:`1px solid ${exMenu?"rgba(59,130,246,0.5)":C.bd}`,
                    boxShadow:exMenu?"0 4px 14px rgba(59,130,246,0.12)":"0 1px 4px rgba(15,25,35,0.05)",
                    fontFamily:DISP_F}}>
                  <span style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                    <span style={{width:30,height:30,borderRadius:8,flexShrink:0,
                      background:"rgba(59,130,246,0.12)",display:"grid",placeItems:"center"}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 17.5 11-11M4 15l-1.5 1.5M20 9l1.5-1.5M8.5 19.5l-3-3M18.5 7.5l-3-3"/></svg>
                    </span>
                    <span style={{fontSize:14,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {selEx || perfData?.exNom || allExNames[0]}
                    </span>
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:exMenu?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {exMenu && (
                  <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,
                    background:"#FFF",border:`1px solid ${C.bd}`,borderRadius:16,
                    boxShadow: C.shadow,overflow:"hidden",
                    maxHeight:260,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
                    {allExNames.map((nm,k) => {
                      const on = nm === (selEx || perfData?.exNom || allExNames[0]);
                      const logged = perfAll.some(e=>e.exNom===nm);
                      return (
                        <button key={nm} onClick={()=>{setSelEx(nm);setExMenu(false);}}
                          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                            padding:"12px 16px",cursor:"pointer",textAlign:"left",
                            background:on?"rgba(59,130,246,0.08)":"transparent",
                            border:"none",borderTop:k>0?`1px solid rgba(0,0,0,0.05)`:"none",fontFamily:DISP_F}}>
                          <span style={{fontSize:14,fontWeight:on?700:500,color:on?C.accentDk:C.text,
                            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nm}</span>
                          {!logged && <span style={{fontSize:10,fontWeight:700,color:C.dim,
                            background:"rgba(0,0,0,0.05)",padding:"4px 8px",borderRadius:8,flexShrink:0,
                            marginLeft:8,whiteSpace:"nowrap"}}>à logger</span>}
                          {on && logged && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accentDk} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M5 12.5 10 17l9-10"/></svg>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {hasProg ? (
              <>
                <div style={{marginTop:12}}>
                  <svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none" style={{overflow:"visible"}}>
                    <defs>
                      <linearGradient id="rm-grad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={C.accent} stopOpacity="0.16"/>
                        <stop offset="100%" stopColor={C.accent} stopOpacity="0.01"/>
                      </linearGradient>
                    </defs>
                    <polygon points={`${PL},${PT+cH} ${polyline} ${PL+cW},${PT+cH}`} fill="url(#rm-grad)"/>
                    <polyline points={polyline} fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((p,k)=>(
                      <g key={k}>
                        <circle cx={p.x} cy={p.y} r={k===pts.length-1?5:3}
                          fill={C.accent} stroke={k===pts.length-1?"#FFF":"none"} strokeWidth={k===pts.length-1?1.5:0}/>
                        {(k===0||k===pts.length-1) && (
                          <text x={p.x} y={p.y-9} fontSize="10" fontWeight="700" fill={C.accentDk} textAnchor="middle" fontFamily="'General Sans',system-ui,-apple-system,sans-serif">{p.rm}kg</text>
                        )}
                      </g>
                    ))}
                    <text x={pts[0].x} y={SVG_H-6} fontSize="9" fill="#9CA3AF" textAnchor="start" fontFamily="'General Sans',system-ui,-apple-system,sans-serif">{fmtD(sessions[0].date)}</text>
                    <text x={pts[pts.length-1].x} y={SVG_H-6} fontSize="9" fill="#9CA3AF" textAnchor="end" fontFamily="'General Sans',system-ui,-apple-system,sans-serif">{fmtD(sessions[sessions.length-1].date)}</text>
                  </svg>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:"#9CA3AF",fontFamily:DISP_F}}>
                  <span>Départ : <b style={{color:C.mid}}>{sessions[0].rm}kg</b></span>
                  <span>Record : <b style={{color:C.mid}}>{perfData.best}kg</b></span>
                  <span>Actuel : <b style={{color:C.accentDk}}>{sessions[sessions.length-1].rm}kg</b></span>
                </div>
              </>
            ) : (
              <div style={{marginTop:16,padding:"16px",background:"rgba(59,130,246,0.05)",border:"1px dashed rgba(59,130,246,0.18)",borderRadius:12,fontSize:13,color:C.mid,textAlign:"center",fontFamily:DISP_F}}>
                {hasAny ? "Encore une séance loggée sur cet exercice et ta courbe d'évolution apparaît." : "Démarre une séance Focus Mode et logge tes charges pour activer la progression"}
              </div>
            )}
            {expandRow("rm","Détail de la progression")}
            {detailBox("rm", <>
              Le <b style={{color:C.text}}>1RM estimé</b> est calculé via la formule d'Epley sur tes meilleures séries : <code>poids × (1 + reps/30)</code>. La courbe suit ton 1RM réel séance après séance.
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

