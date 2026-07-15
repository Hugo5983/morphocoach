import { useState } from"react";
import { C, DARK, FONT } from"../../../data/constants.js";
import MesocycleDetail from"./MesocycleDetail.jsx";

export default function MesocycleChart({ prog, semC, checkedEx, cycleStart }) {
  const DISP_F  = FONT;
  const SERIF_F = FONT;
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

  const fmtKg = (n) => n >= 1000 ?`${(n/1000).toFixed(1)} t` :`${Math.round(n)} kg`;

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
    if (i === 0) return`M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i-1];
    const t = 0.42;
    const cp1x = (prev.x + (p.x - prev.x) * t).toFixed(1);
    const cp2x = (p.x  - (p.x - prev.x) * t).toFixed(1);
    return`${d} C${cp1x},${prev.y.toFixed(1)} ${cp2x},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  },'');

  const fillPath =`${linePath} L${pts[5].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;

  const dotCol = (w) =>
    w.type ==='Déload' ?'#E5484D' :
    w.type ==='Pic'    ?'#F59E0B' : C.accent;

  return (
    <>
    {/* ── Carte cliquable ── */}
    <div onClick={()=>setOpen(true)}
      style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:20,padding:"16px 16px 16px",marginBottom:16,cursor:"pointer"}}>

      {/* Header charge card */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
        <div>
          {hasCharge ? (
            <>
              <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                <span style={{fontSize:26,fontWeight:700,color:C.text,fontFamily:DISP_F,letterSpacing:-1}}>
                  {`${((curTon/baseTonnage)-1)>=0?"+":""}${Math.round(((curTon/baseTonnage)-1)*100)}%`}
                </span>
                <span style={{fontSize:11,fontWeight:500,color:C.dim,fontFamily:DISP_F}}>cette semaine</span>
              </div>
              <div style={{fontSize:13,color:C.dim,fontFamily:DISP_F,lineHeight:1.5}}>
                {nearMRV ?"Proche de la limite · surveille la récup." :"Progression contrôlée · continue ainsi"}
              </div>
            </>
) : (
            <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISP_F}}>
              Sem. {currentWeek + 1} / 6
            </div>
)}
        </div>
        {hasCharge ? (
          <div style={{padding:"8px 12px",borderRadius:12,
            background:nearMRV?"rgba(245,158,11,0.12)":"rgba(18,183,106,0.12)",
            border:nearMRV?"1px solid rgba(245,158,11,0.25)":"1px solid rgba(18,183,106,0.25)",
            flexShrink:0,marginTop:2}}>
            <span style={{fontSize:13,fontWeight:700,
              color:nearMRV?"#F59E0B":"#12B76A",fontFamily:DISP_F}}>
              {nearMRV?"Limite proche":"Zone verte"}
            </span>
          </div>
) : (
          <div style={{padding:"4px 12px",borderRadius:20,
            background:"#F1F3FF",border:"1px solid #DCE2FF",flexShrink:0}}>
            <span style={{fontSize:10,fontWeight:700,color:C.accent,fontFamily:DISP_F}}> Verrouillé</span>
          </div>
)}
      </div>

      {hasCharge ? (
      <>
      {/* Line chart — données réelles mésocycle */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
           style={{display:"block",overflow:"visible",marginBottom:4}}>
        <defs>
          <linearGradient id="mc-line-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor={C.accent} stopOpacity="0.16"/>
            <stop offset="100%" stopColor={C.accent} stopOpacity="0.01"/>
          </linearGradient>
        </defs>
        {[0.33, 0.66].map((f,i) => (
          <line key={i} x1={PL} x2={W-PR}
            y1={PT + cH*(1-f)} y2={PT + cH*(1-f)}
            stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="3 4"/>
))}
        <path d={fillPath} fill="url(#mc-line-grad)"/>
        <path d={linePath} fill="none" stroke={C.accent} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
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
                fill={isPast || isCur ? dc :"rgba(60,91,255,0.25)"}
                stroke="#FFF" strokeWidth={isCur ? 2 : 1.5}
                style={{filter: isCur ?`drop-shadow(0 2px 7px ${dc}70)` :'none'}}
              />
            </g>
);
        })}
      </svg>
      <div style={{display:"flex"}}>
        {WEEKS.map((w,i) => {
          const isCur = i === currentWeek;
          const col = w.type==="Déload" ?"rgba(229,72,77,0.65)"
            : w.type==="Pic" ?"rgba(245,158,11,0.85)"
            : isCur ? DARK.accent :"#98A2B3";
          return (
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:isCur?11.5:10.5,fontWeight:isCur?700:600,color:col,fontFamily:DISP_F}}>{w.lbl}</div>
              <div style={{fontSize:7.5,color:"#98A2B3",fontFamily:DISP_F,marginTop:1}}>{w.type}</div>
            </div>
);
        })}
      </div>
      </>
) : (
        /* État vide compact — graphe flouté en fond + texte + CTA bleu */
        <div style={{position:"relative"}}>

          {/* Graphe fantôme flouté en fond */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:88,
            filter:"blur(2.5px)",opacity:0.5,pointerEvents:"none",zIndex:0}}>
            <svg width="100%" viewBox="0 0 320 88" preserveAspectRatio="none" style={{overflow:"visible"}}>
              <path
                d="M20,70 C60,62 85,48 115,42 C145,36 165,30 200,24 C228,20 260,18 300,15"
                fill="none" stroke="#DCE2FF" strokeWidth="3"
                strokeLinecap="round" strokeDasharray="6 4"
              />
              {[
                {cx:20,  cy:70, r:5},
                {cx:115, cy:42, r:5},
                {cx:200, cy:24, r:5},
                {cx:300, cy:15, r:6, blue:true},
              ].map((p,i) => (
                <circle key={i} cx={p.cx} cy={p.cy} r={p.r}
                  fill={p.blue ? C.accent :"#F1F3FF"}
                  stroke={p.blue ?"#FFF" :"#DCE2FF"} strokeWidth="2"/>
))}
            </svg>
          </div>

          {/* Contenu par-dessus */}
          <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"32px 0 0"}}>
            <div style={{fontSize:10,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:DISP_F,marginBottom:8}}>
               Aucune donnée
            </div>
            <div style={{fontSize:16,fontWeight:700,color:C.text,fontFamily:DISP_F,letterSpacing:-0.3,marginBottom:8}}>
              Commence à t'entraîner
            </div>
            <div style={{fontSize:13,color:C.dim,fontFamily:DISP_F,lineHeight:1.5,maxWidth:230,margin:"0 auto 16px"}}>
              Lance une séance pour débloquer ta progression de charge.
            </div>
            <button style={{
              width:"100%",padding:"12px",border:"none",borderRadius:12,
              background:"linear-gradient(135deg,#2E48D9,#3C5BFF)",color:"white",
              fontSize:14,fontWeight:700,fontFamily:DISP_F,
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              boxShadow:"0 4px 16px rgba(60,91,255,0.35)",cursor:"pointer",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Commencer une séance
            </button>
          </div>

        </div>
)}

      {/* CTA — uniquement si données présentes */}
      {hasCharge && (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:16,paddingTop:12,borderTop:`1px solid ${C.bd}`,color:DARK.accent,fontSize:13,fontWeight:700,fontFamily:DISP_F}}>
        Voir la progression de force
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </div>
)}
    </div>

    {/* Overlay — mode FORCE (progression de force par exercice) */}
    {open && <MesocycleDetail mode="force" prog={prog} semC={semC} baseVol={baseVol} MEV={MEV} MAV={MAV} MRV={MRV} curVol={curVol} currentWeek={currentWeek} WEEKS={WEEKS} cycleStart={cycleStart} checkedEx={checkedEx} onClose={()=>setOpen(false)}/>}
    </>
);
}

// ─── MÉSOCYCLE DETAIL (analyse complète, overlay) ────────────────────────────
