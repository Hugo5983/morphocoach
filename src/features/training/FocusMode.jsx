/**
 * FocusMode.jsx
 * Portal vers document.body → couvre TOUT l'écran (header app + bottom nav compris).
 * Espacement généreux, safe-area iPhone, structure exacte de la maquette.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal }                 from "react-dom";

// ── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  bg:'#F6F8FB', bgLo:'#EEF1F7', surf:'#FFFFFF', surfFlat:'#F0F2F7',
  bd:'rgba(0,0,0,0.07)', bdHi:'rgba(0,0,0,0.12)', bdAc:'rgba(59,130,246,0.30)',
  t1:'#0F1923', t2:'#374151', t3:'#6B7280',
  t4:'rgba(107,114,128,0.70)', t5:'rgba(107,114,128,0.40)',
  ac:'#3B82F6', acLt:'#93C5FD', acDk:'#2563EB',
  acSoft:'rgba(59,130,246,0.10)', acGlow:'rgba(59,130,246,0.16)',
};
const F   = '"Space Grotesk","Inter",system-ui,sans-serif';
const SER = '"Instrument Serif","Times New Roman",serif';
const MON = '"JetBrains Mono",ui-monospace,monospace';
const NUM = { fontVariantNumeric:'tabular-nums', fontFeatureSettings:'"tnum","cv11"' };
const GL  = {
  background:'rgba(246,248,251,0.85)',
  backdropFilter:'blur(22px) saturate(150%)',
  WebkitBackdropFilter:'blur(22px) saturate(150%)',
  border:'1px solid rgba(0,0,0,0.07)',
  borderRadius:20,
};

// Keyframes injectés en inline → synchrones, jamais en retard
const CSS = `
  @keyframes fm-pulseDot  { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes fm-breathe   { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.95;transform:scale(1.06)} }
  @keyframes fm-ringPulse { 0%{transform:scale(0.85);opacity:.7} 100%{transform:scale(1.7);opacity:0} }
  @keyframes fm-popCheck  { 0%{transform:scale(0.3);opacity:0} 55%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes fm-numIn     { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes fm-fadeUp    { from{transform:translateY(14px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes fm-flashGlow { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
  .fm-tap { transition:transform 140ms cubic-bezier(.4,0,.2,1),opacity .2s,background .2s,box-shadow .2s;
            cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .fm-tap:active { transform:scale(0.95); }
`;

// ── Icônes ───────────────────────────────────────────────────────────────────
function I({ n, sz=18, c='currentColor', s=1.7 }) {
  const p = { width:sz, height:sz, viewBox:'0 0 24 24', fill:'none',
    stroke:c, strokeWidth:s, strokeLinecap:'round', strokeLinejoin:'round' };
  const P = {
    check: <path d="m4 12 5 5 11-12"/>,
    x:     <path d="M6 6l12 12M18 6 6 18"/>,
    book:  <><path d="M4 4a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V4Z"/><path d="M4 20a2 2 0 0 1 2-2h13"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    spark: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M6 6l2 2M18 18l-2-2M6 18l2-2M18 6l-2 2"/><circle cx="12" cy="12" r="2.5"/></>,
    minus: <path d="M5 12h14"/>,
    plus:  <path d="M12 5v14M5 12h14"/>,
    skip:  <><path d="M5 5v14l9-7z"/><path d="M19 5v14"/></>,
    play:  <path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>,
    bulb:  <><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6V17c0-.7.4-1.5 1-2A7 7 0 0 0 12 2z"/></>,
    pulse: <path d="M3 12h4l3-9 4 18 3-9h4"/>,
    chevR: <path d="m9 6 6 6-6 6"/>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></>,
    award: <><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></>,
    flame: <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5M12 21a6 6 0 0 0 6-6c0-3-2-5-3-6 0 3-2 4-3 4s-3-1-3-4c-1 1-3 3-3 6a6 6 0 0 0 6 6z"/>,
    trend: <><path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/></>,
  };
  return <svg {...p}>{P[n]||null}</svg>;
}

// ── SetStage ─────────────────────────────────────────────────────────────────
function SetStage({ phase, setNum, totalSets, kg, reps, setKg, setReps,
                    isIaBump, lastSetLabel, onValidate }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column',
                  position:'relative', padding:'0 24px' }}>

      {/* Flash overlay */}
      {phase === 'flash' && (
        <div style={{ position:'absolute', inset:0, zIndex:40,
                      display:'grid', placeItems:'center', pointerEvents:'none' }}>
          <div style={{ position:'absolute', inset:0,
            background:`radial-gradient(circle at 50% 45%, ${T.acGlow}, transparent 60%)`,
            animation:'fm-flashGlow 1.1s ease-out forwards' }}/>
          <div style={{ position:'relative', width:96, height:96,
                        display:'grid', placeItems:'center' }}>
            <span style={{ position:'absolute', inset:0, borderRadius:'50%',
              border:`2px solid ${T.ac}`, animation:'fm-ringPulse 1s ease-out' }}/>
            <div style={{ width:84, height:84, borderRadius:'50%',
              background:`linear-gradient(160deg,${T.acLt},${T.acDk})`,
              display:'grid', placeItems:'center',
              boxShadow:'0 10px 30px rgba(45,93,201,0.6)',
              animation:'fm-popCheck .5s cubic-bezier(.2,.8,.2,1)' }}>
              <I n="check" sz={42} s={2.6} c={T.t1}/>
            </div>
          </div>
        </div>
      )}

      {/* Centré verticalement */}
      <div style={{ flex:1, display:'flex', flexDirection:'column',
                    justifyContent:'center',
                    opacity: phase === 'flash' ? 0.22 : 1,
                    transition:'opacity .3s', gap:0 }}>

        {/* Badge série */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:9,
                        padding:'8px 18px', borderRadius:999, ...GL }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:T.ac,
              animation:'fm-pulseDot 1.6s ease-in-out infinite',
              boxShadow:`0 0 8px ${T.ac}` }}/>
            <span style={{ fontFamily:F, fontSize:14, fontWeight:700,
                           color:T.t1, letterSpacing:0.2 }}>
              SÉRIE{' '}
              <span style={{ color:T.acLt }}>{setNum}</span>
              {' '}<span style={{ color:T.t4, fontWeight:500 }}>/ {totalSets}</span>
            </span>
          </div>
        </div>

        {/* Charge */}
        <div style={{ display:'flex', alignItems:'center',
                      justifyContent:'space-between', marginBottom:20 }}>
          <button className="fm-tap"
            onClick={() => setKg(v => Math.max(0, +(v-2.5).toFixed(1)))}
            style={{ width:58, height:58, borderRadius:18, ...GL,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, border:'none', flexShrink:0 }}>
            <I n="minus" sz={22} s={2.2}/>
          </button>

          <div key={kg} style={{ textAlign:'center', flex:1,
            animation:'fm-numIn .22s ease both' }}>
            <div style={{ display:'flex', alignItems:'baseline',
                          justifyContent:'center', gap:7 }}>
              <span style={{ fontFamily:SER, fontSize:110, fontWeight:400,
                             color:T.t1, letterSpacing:'-4px', lineHeight:0.8, ...NUM }}>
                {kg}
              </span>
              <span style={{ fontFamily:MON, fontSize:22, fontWeight:500,
                             color:T.t3, marginBottom:6 }}>kg</span>
            </div>
          </div>

          <button className="fm-tap"
            onClick={() => setKg(v => +(v+2.5).toFixed(1))}
            style={{ width:58, height:58, borderRadius:18,
                     background:T.acSoft, border:`1px solid ${T.bdAc}`,
                     color:T.acLt, display:'grid', placeItems:'center',
                     padding:0, flexShrink:0 }}>
            <I n="plus" sz={22} s={2.2}/>
          </button>
        </div>

        {/* Séparateur */}
        <div style={{ height:1, background:T.bd, marginBottom:20, marginLeft:80, marginRight:80 }}/>

        {/* Reps */}
        <div style={{ display:'flex', alignItems:'center',
                      justifyContent:'space-between', marginBottom:28 }}>
          <button className="fm-tap"
            onClick={() => setReps(v => Math.max(1, v-1))}
            style={{ width:58, height:58, borderRadius:18, ...GL,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, border:'none', flexShrink:0 }}>
            <I n="minus" sz={22} s={2.2}/>
          </button>

          <div key={reps} style={{ textAlign:'center', flex:1,
            animation:'fm-numIn .22s ease both' }}>
            <div style={{ display:'flex', alignItems:'baseline',
                          justifyContent:'center', gap:8 }}>
              <span style={{ fontFamily:SER, fontSize:80, fontWeight:400,
                             color:T.t1, letterSpacing:'-2.5px', lineHeight:0.88, ...NUM }}>
                {reps}
              </span>
              <span style={{ fontFamily:MON, fontSize:18, fontWeight:500,
                             color:T.t3, marginBottom:4 }}>reps</span>
            </div>
          </div>

          <button className="fm-tap"
            onClick={() => setReps(v => v+1)}
            style={{ width:58, height:58, borderRadius:18,
                     background:T.acSoft, border:`1px solid ${T.bdAc}`,
                     color:T.acLt, display:'grid', placeItems:'center',
                     padding:0, flexShrink:0 }}>
            <I n="plus" sz={22} s={2.2}/>
          </button>
        </div>

        {/* Mini cues */}
        <div style={{ display:'flex', alignItems:'center',
                      justifyContent:'center', gap:8, flexWrap:'wrap' }}>
          {lastSetLabel && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6,
              padding:'6px 13px', borderRadius:999,
              background:T.surf, border:`1px solid ${T.bd}` }}>
              <I n="clock" sz={10} c={T.t4} s={1.9}/>
              <span style={{ fontFamily:MON, fontSize:10, color:T.t3, ...NUM }}>
                {lastSetLabel}
              </span>
            </span>
          )}
          {isIaBump && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6,
              padding:'6px 13px', borderRadius:999,
              background:T.acSoft, border:`1px solid ${T.bdAc}` }}>
              <I n="spark" sz={10} c={T.acLt} s={2}/>
              <span style={{ fontFamily:MON, fontSize:10, fontWeight:700, color:T.acLt, ...NUM }}>
                +2.5 kg suggéré
              </span>
            </span>
          )}
        </div>
      </div>

      {/* VALIDER — ancré en bas avec safe area */}
      <div style={{ flexShrink:0, paddingBottom:'max(28px, env(safe-area-inset-bottom, 28px))',
                    paddingTop:16 }}>
        <button className="fm-tap" onClick={onValidate}
          disabled={phase === 'flash'}
          style={{ width:'100%', padding:'22px', borderRadius:22,
            background:`linear-gradient(180deg,${T.acLt} 0%,${T.ac} 48%,${T.acDk} 100%)`,
            color:T.t1, border:`1px solid ${T.acLt}70`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:11,
            fontFamily:F, fontSize:19, fontWeight:700, letterSpacing:0.2,
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.32), 0 14px 36px rgba(45,93,201,0.6)',
            cursor: phase === 'flash' ? 'default' : 'pointer',
            opacity: phase === 'flash' ? 0.5 : 1 }}>
          <I n="check" sz={24} s={2.6}/> VALIDER LA SÉRIE
        </button>
      </div>
    </div>
  );
}

// ── RestStage — Chrono de repos entre les séries (original) ─────────────────
function RestStage({ rest, total, nextKg, nextReps, nextNum, onSkip, onAdd }) {
  const R    = 118;
  const CIRC = 2 * Math.PI * R;
  const pct  = total > 0 ? rest / total : 0;
  const off  = CIRC * (1 - pct);
  const mm   = Math.floor(rest / 60);
  const ss   = String(rest % 60).padStart(2, '0');

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column',
                  justifyContent:'center', alignItems:'center',
                  padding:'0 24px', animation:'fm-fadeUp .35s ease' }}>

      <div style={{ fontFamily:MON, fontSize:10, fontWeight:600, color:T.ac,
                    letterSpacing:'2px', textTransform:'uppercase', marginBottom:20 }}>
        RÉCUPÉRATION
      </div>

      {/* Anneau */}
      <div style={{ position:'relative', width:296, height:296 }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%',
          background:`radial-gradient(closest-side,${T.acGlow},transparent 72%)`,
          filter:'blur(28px)', animation:'fm-breathe 2.4s ease-in-out infinite' }}/>
        <svg width="296" height="296" viewBox="0 0 296 296"
          style={{ position:'relative', transform:'rotate(-90deg)' }}>
          <circle cx="148" cy="148" r={R} stroke="rgba(178,190,210,0.09)"
            strokeWidth="10" fill="none"/>
          <defs>
            <linearGradient id="fm-rg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={T.acLt}/>
              <stop offset="100%" stopColor={T.acDk}/>
            </linearGradient>
          </defs>
          <circle cx="148" cy="148" r={R} stroke="url(#fm-rg)" strokeWidth="10"
            fill="none" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={off}
            style={{ transition:'stroke-dashoffset 1s linear' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex',
                      flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:SER, fontSize:82, fontWeight:400,
                        color:T.t1, letterSpacing:'-3px', lineHeight:0.85, ...NUM }}>
            {mm}:{ss}
          </div>
          <div style={{ fontFamily:MON, fontSize:9, fontWeight:500, color:T.t4,
                        letterSpacing:'2px', textTransform:'uppercase', marginTop:10 }}>
            PROCHAINE · SÉRIE {nextNum}
          </div>
          <div style={{ fontFamily:MON, fontSize:14, fontWeight:600,
                        color:T.acLt, marginTop:5, ...NUM }}>
            {nextKg}kg × {nextReps}
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div style={{ marginTop:40, display:'flex', alignItems:'center', gap:12,
                    width:'100%', maxWidth:320 }}>
        <button className="fm-tap" onClick={() => onAdd(15)}
          style={{ height:56, padding:'0 22px', borderRadius:16, ...GL, flexShrink:0,
                   color:T.t1, display:'flex', alignItems:'center', gap:7,
                   fontFamily:F, fontSize:14, fontWeight:600, border:'none' }}>
          <I n="plus" sz={16} s={2.2}/> 15s
        </button>
        <button className="fm-tap" onClick={onSkip}
          style={{ flex:1, height:56, borderRadius:16,
            background:`linear-gradient(180deg,${T.acLt},${T.acDk})`,
            border:`1px solid ${T.acLt}60`, color:T.t1,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            fontFamily:F, fontSize:15, fontWeight:700,
            boxShadow:'0 8px 24px rgba(45,93,201,0.5),inset 0 1px 0 rgba(255,255,255,0.3)' }}>
          <I n="skip" sz={16} s={1.9}/> Série suivante
        </button>
      </div>

      <div style={{ marginTop:20, display:'flex', alignItems:'center', gap:7 }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:T.ac,
          animation:'fm-pulseDot 1.6s ease-in-out infinite' }}/>
        <span style={{ fontFamily:F, fontSize:11, color:T.t4 }}>
          Vibration à la fin du repos
        </span>
      </div>
    </div>
  );
}

// ── DoneStage avec bottom sheet feedback (facultatif, free + PRO) ────────────
function DoneStage({ loggedSets, onNextExercise, coachMsg, premium }) {
  const vol = loggedSets.reduce((a,s) => a + s.kg * s.reps, 0);
  const pr  = loggedSets.reduce((a,s) => Math.max(a, s.kg), 0);

  // État de la sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rpe,  setRpe]  = useState(null);
  const [pain, setPain] = useState(null);
  const [feel, setFeel] = useState(null);

  const rpeColors  = { 6:'#34D399', 7:'#86EFAC', 8:'#FBBF24', 9:'#FB923C', 10:'#F87171' };
  const painOpts   = [{ e:'😌', l:'Aucune' }, { e:'😐', l:'Légère' }, { e:'😬', l:'Gêne' }, { e:'😣', l:'Stop' }];
  const feelOpts   = [{ e:'💪', l:'Parfait' }, { e:'🤔', l:'Moyen' }, { e:'❌', l:'Non ressenti' }];
  const painCols   = ['#34D399','#FBBF24','#FB923C','#F87171'];
  const feelCols   = ['#34D399','#FBBF24','#F87171'];
  const anyNote    = rpe !== null || pain !== null || feel !== null;

  // Message Coach IA dynamique (PRO seulement)
  const aiMsg = (() => {
    if (pain === 3) return "⚠️ Douleur articulaire signalée. Je retire cet exercice de ta prochaine séance et te propose une alternative. Consulte un kiné si ça persiste.";
    if (pain === 2) return "Gêne articulaire notée. Je réduis le poids de 10 % la semaine prochaine. Pense à l'échauffement articulaire.";
    if (feel === 2 && rpe >= 9) return "Effort élevé sans ressentir le muscle — réduis de 5 kg et ralentis l'excentrique pour améliorer la connexion neuromusculaire.";
    if (feel === 2) return "Muscle cible peu ressenti. Ralentis la phase excentrique et concentre-toi sur la contraction au pic du mouvement.";
    if (rpe === 10) return "RPE 10 — tu as touché l'échec. Semaine de déload recommandée avant d'augmenter les charges.";
    if (rpe === 9)  return `RPE 9${feel === 0 ? ', sensation parfaite ✓' : ''} — charge idéale. Continue la semaine prochaine, +2,5 kg en S3 si la douleur reste nulle.`;
    if (rpe === 8)  return "RPE 8 — intensité optimale pour l'hypertrophie. Maintiens 2 semaines, puis +2,5 kg.";
    if (rpe === 7)  return "RPE 7 — bonne zone de travail. Volume efficace, maintiens ce niveau.";
    if (rpe === 6)  return "RPE 6 — trop confortable. Tu peux ajouter +2,5 kg ou +2 reps la semaine prochaine.";
    return coachMsg || `${loggedSets.length} séries bouclées. Beau travail, continue.`;
  })();

  const validate = () => { setSheetOpen(false); onNextExercise(); };

  return (
    <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch',
                  padding:'16px 20px 40px', position:'relative' }}>

      {/* ── Hero check ── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                    textAlign:'center', paddingTop:8 }}>
        <div style={{ position:'relative', width:104, height:104, display:'grid', placeItems:'center' }}>
          <span style={{ position:'absolute', inset:0, borderRadius:'50%',
            border:`2px solid ${T.ac}`, animation:'fm-ringPulse 1.6s ease-out infinite' }}/>
          <div style={{ width:84, height:84, borderRadius:'50%',
            background:`linear-gradient(160deg,${T.acLt},${T.acDk})`,
            display:'grid', placeItems:'center',
            boxShadow:'0 10px 30px rgba(45,93,201,0.6)',
            animation:'fm-popCheck .5s cubic-bezier(.2,.8,.2,1)' }}>
            <I n="check" sz={42} s={2.6} c={T.t1}/>
          </div>
        </div>
        <div style={{ fontFamily:MON, fontSize:9.5, fontWeight:600, color:T.ac,
                      letterSpacing:'1.6px', textTransform:'uppercase',
                      marginTop:24, animation:'fm-fadeUp .5s ease both 100ms' }}>
          EXERCICE TERMINÉ
        </div>
        <div style={{ fontFamily:SER, fontSize:34, color:T.t1, marginTop:10,
                      letterSpacing:'-1px', animation:'fm-fadeUp .5s ease both 180ms' }}>
          {loggedSets.length} séries,{' '}
          <span style={{ fontStyle:'italic', color:T.acLt }}>bouclées.</span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:'flex', gap:9, marginTop:24, animation:'fm-fadeUp .5s ease both 240ms' }}>
        {[
          { ic:'flame', l:'VOLUME',   v:vol.toLocaleString('fr-FR'), u:'kg' },
          { ic:'award', l:'MEILLEUR', v:String(pr),                  u:'kg' },
          { ic:'trend', l:'SÉRIES',   v:String(loggedSets.length),   u:''   },
        ].map(s => (
          <div key={s.l} style={{ flex:1, ...GL, padding:'12px 10px' }}>
            <I n={s.ic} sz={14} c={T.acLt} s={1.8}/>
            <div style={{ fontFamily:MON, fontSize:8, fontWeight:500, color:T.t4,
                          letterSpacing:'1.5px', textTransform:'uppercase', marginTop:7 }}>{s.l}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:3, marginTop:4 }}>
              <span style={{ fontFamily:F, fontSize:20, fontWeight:700,
                             color:T.t1, letterSpacing:-0.5, ...NUM }}>{s.v}</span>
              {s.u && <span style={{ fontFamily:MON, fontSize:9, color:T.t4 }}>{s.u}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Récap séries ── */}
      <div style={{ marginTop:14, ...GL, padding:'4px 14px',
                    animation:'fm-fadeUp .5s ease both 300ms' }}>
        {loggedSets.map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center',
            justifyContent:'space-between', padding:'12px 0',
            borderBottom: i < loggedSets.length-1 ? `1px solid ${T.bd}` : 'none' }}>
            <span style={{ fontFamily:F, fontSize:13, fontWeight:700, color:T.t3 }}>Série {i+1}</span>
            <span style={{ fontFamily:MON, fontSize:13, fontWeight:600, color:T.t1, ...NUM }}>
              {s.kg} kg × {s.reps}
            </span>
            <span style={{ width:22, height:22, borderRadius:7, background:T.acSoft,
              border:`1px solid ${T.bdAc}`, display:'grid', placeItems:'center' }}>
              <I n="check" sz={12} s={2.8} c={T.acLt}/>
            </span>
          </div>
        ))}
      </div>

      {/* ── Bouton suivant ── */}
      <div style={{ marginTop:18, animation:'fm-fadeUp .5s ease both 380ms',
                    paddingBottom:'max(16px, env(safe-area-inset-bottom, 16px))' }}>
        <button className="fm-tap" onClick={() => setSheetOpen(true)}
          style={{ width:'100%', height:56, borderRadius:16,
            background:`linear-gradient(180deg,${T.acLt},${T.acDk})`,
            border:`1px solid ${T.acLt}60`, color:T.t1,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            fontFamily:F, fontSize:15, fontWeight:700,
            boxShadow:'0 8px 24px rgba(45,93,201,0.5),inset 0 1px 0 rgba(255,255,255,0.3)' }}>
          Exercice suivant
          <I n="chev" sz={18} s={2.4} c={T.t1}/>
        </button>
      </div>

      {/* ══ BOTTOM SHEET FEEDBACK (facultatif) ══ */}
      {sheetOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) validate(); }}
          style={{ position:'fixed', inset:0, zIndex:10020,
            background:'rgba(15,25,35,0.42)', backdropFilter:'blur(2px)',
            display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:430,
            background:'#fff', borderRadius:'20px 20px 0 0',
            padding:`12px 18px calc(22px + env(safe-area-inset-bottom, 0px))`,
            boxShadow:'0 -8px 40px rgba(15,25,35,0.18)',
            animation:'fm-fadeUp .28s cubic-bezier(.32,.72,0,1)' }}>

            {/* Handle */}
            <div style={{ width:36, height:4, borderRadius:2,
              background:'rgba(0,0,0,0.1)', margin:'0 auto 14px' }}/>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:30, height:30, borderRadius:9, flexShrink:0,
                background: premium
                  ? `linear-gradient(145deg,#818CF8,#6366F1)`
                  : `linear-gradient(145deg,${T.acLt},${T.acDk})`,
                display:'grid', placeItems:'center',
                boxShadow: premium ? '0 3px 10px rgba(99,102,241,0.4)' : '0 3px 10px rgba(59,130,246,0.35)' }}>
                <I n="spark" sz={14} c="#fff" s={1.8}/>
              </div>
              <div>
                <div style={{ fontFamily:F, fontSize:12.5, fontWeight:800, color:T.t1 }}>
                  {premium ? 'Note Coach IA' : 'Note rapide'}
                </div>
                <div style={{ fontFamily:F, fontSize:10, color:T.t4, marginTop:1 }}>
                  Facultatif · {premium ? 'analyse en direct' : 'alimente ton historique'}
                </div>
              </div>
            </div>

            {/* RPE */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontFamily:F, fontSize:11.5, fontWeight:700, color:T.t1, marginBottom:2 }}>
                Effort perçu (RPE)
              </div>
              <div style={{ fontFamily:F, fontSize:10, color:T.t4, marginBottom:8 }}>
                6 = facile · 10 = échec musculaire
              </div>
              <div style={{ display:'flex', gap:5 }}>
                {[6,7,8,9,10].map(v => {
                  const on = rpe === v;
                  const col = rpeColors[v];
                  return (
                    <button key={v} className="fm-tap" onClick={() => setRpe(v)} style={{
                      flex:1, height:38, borderRadius:9,
                      border:`1.5px solid ${on ? col : T.bd}`,
                      background: on ? `${col}20` : T.surfFlat,
                      color: on ? col : T.t2,
                      fontFamily:F, fontSize:13, fontWeight:700, cursor:'pointer',
                      transition:'all .13s',
                      boxShadow: on ? `0 2px 8px ${col}40` : 'none',
                    }}>{v}</button>
                  );
                })}
              </div>
            </div>

            {/* Douleur */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontFamily:F, fontSize:11.5, fontWeight:700, color:T.t1, marginBottom:8 }}>
                Douleur articulaire
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {painOpts.map((o,i) => {
                  const on = pain === i;
                  return (
                    <button key={i} className="fm-tap" onClick={() => setPain(i)} style={{
                      flex:1, padding:'8px 4px', borderRadius:10,
                      border:`1.5px solid ${on ? painCols[i] : T.bd}`,
                      background: on ? `${painCols[i]}18` : T.surfFlat,
                      cursor:'pointer', textAlign:'center', transition:'all .13s' }}>
                      <div style={{ fontSize:16, marginBottom:2 }}>{o.e}</div>
                      <div style={{ fontFamily:F, fontSize:9, fontWeight:700,
                                    color: on ? painCols[i] : T.t4 }}>{o.l}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sensation */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:F, fontSize:11.5, fontWeight:700, color:T.t1, marginBottom:8 }}>
                Sensation musculaire
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {feelOpts.map((o,i) => {
                  const on = feel === i;
                  return (
                    <button key={i} className="fm-tap" onClick={() => setFeel(i)} style={{
                      flex:1, padding:'9px 4px', borderRadius:10,
                      border:`1.5px solid ${on ? feelCols[i] : T.bd}`,
                      background: on ? `${feelCols[i]}18` : T.surfFlat,
                      cursor:'pointer', textAlign:'center', transition:'all .13s' }}>
                      <div style={{ fontSize:16, marginBottom:3 }}>{o.e}</div>
                      <div style={{ fontFamily:F, fontSize:9, fontWeight:700,
                                    color: on ? feelCols[i] : T.t4 }}>{o.l}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Réponse (dès qu'une note est saisie) */}
            {anyNote && (
              premium ? (
                /* PRO → analyse Coach IA */
                <div style={{ marginBottom:12, padding:'10px 12px',
                  background:'rgba(59,130,246,0.07)',
                  borderLeft:`2.5px solid ${T.ac}`,
                  borderRadius:'0 10px 10px 0',
                  fontFamily:F, fontSize:11.5, color:T.t1, lineHeight:1.5 }}>
                  {aiMsg}
                </div>
              ) : (
                /* GRATUIT → confirmation simple + hint PRO */
                <div style={{ marginBottom:12, padding:'10px 12px',
                  background:'rgba(52,211,153,0.09)',
                  borderLeft:'2.5px solid #34D399',
                  borderRadius:'0 10px 10px 0' }}>
                  <div style={{ fontFamily:F, fontSize:11.5, color:'#065F46', lineHeight:1.5 }}>
                    ✓ Enregistré dans ton historique.
                  </div>
                  <div style={{ fontFamily:F, fontSize:10, color:T.t4, marginTop:4 }}>
                    🔒 Passe à PRO pour que le Coach IA analyse tes notes et adapte ton programme.
                  </div>
                </div>
              )
            )}

            {/* Actions */}
            <button className="fm-tap" onClick={validate} style={{
              width:'100%', height:50, borderRadius:14, border:'none',
              background:`linear-gradient(180deg,${T.acLt},${T.acDk})`,
              color:T.t1, fontFamily:F, fontSize:14, fontWeight:700, cursor:'pointer',
              boxShadow:'0 6px 20px rgba(45,93,201,0.45),inset 0 1px 0 rgba(255,255,255,0.25)',
              marginBottom:8 }}>
              Valider & continuer ›
            </button>
            <button className="fm-tap" onClick={validate} style={{
              width:'100%', background:'none', border:'none',
              fontFamily:F, fontSize:12, fontWeight:600, color:T.t4, cursor:'pointer',
              padding:'6px' }}>
              Passer →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
const REST_DEFAULT = 90;

// ── FocusMode — Portal vers document.body ────────────────────────────────────
export default function FocusMode({
  seance, checkedEx, toggleCheck,
  prog, setProg, push, C, INT, EX, todayKey, premium, onClose,
}) {
  const exercices  = seance?.exercices || [];
  const [exIdx,  setExIdx] = useState(0);
  const ex        = exercices[exIdx] || null;
  const totalSets = ex ? (parseInt(ex.series) || 4) : 4;

  const [phase,      setPhase]     = useState('set');
  const [setIdx,     setSetIdx]    = useState(0);
  const [kg,         setKg]        = useState(() => parseFloat(ex?.charge) || 60);
  const [reps,       setReps]      = useState(() => parseInt(ex?.reps)    || 10);
  const [loggedSets, setLoggedSets]= useState([]);
  const [elapsed,  setElapsed]  = useState(0);  // chrono séance globale
  const [rest,     setRest]     = useState(REST_DEFAULT);  // countdown repos

  // Toggles UI (Guide / Tip / Historique)
  const [showGuide, setShowGuide] = useState(false);
  const [showTip,   setShowTip]   = useState(false);
  const [showHisto, setShowHisto] = useState(false);

  useEffect(() => {
    if (!ex) return;
    setPhase('set'); setSetIdx(0);
    setKg(parseFloat(ex.charge) || 60);
    setReps(parseInt(ex.reps)   || 10);
    setRest(REST_DEFAULT); setLoggedSets([]);
    setShowTip(false); setShowGuide(false); setShowHisto(false);
  }, [exIdx]);

  // Chrono global séance
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Countdown repos
  const restRef = useRef(null);
  useEffect(() => {
    if (phase !== 'rest') return;
    restRef.current = setInterval(() => {
      setRest(r => {
        if (r <= 1) { clearInterval(restRef.current); setPhase('set'); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(restRef.current);
  }, [phase]);

  function validate() {
    const next = setIdx + 1;
    workoutSetsRef.current.push({ exNom: ex.nom, kg, reps });
    setLoggedSets(s => [...s, { kg, reps }]);
    setPhase('flash');
    if (next >= totalSets) {
      toggleCheck?.(seance.id, exIdx, ex?.repos, todayKey);
    }
    setTimeout(() => {
      if (next >= totalSets) { setPhase('done'); }
      else {
        const rs = parseInt(String(ex?.repos || REST_DEFAULT).replace(/\D/g,'')) || REST_DEFAULT;
        setRest(rs); setPhase('rest');
      }
    }, 1100);
    setSetIdx(next);
  }

  function nextExercise() {
    const n = exIdx + 1;
    if (n < exercices.length) { setExIdx(n); }
    else {
      saveWorkoutLog();  // ← persiste tout avant de fermer
      push?.("✅","Séance terminée !",`${exercices.length} exercice${exercices.length!==1?'s':''} complétés.`);
      onClose();
    }
  }

  // ── Workout log — sauvegarde charges réelles ────────────────────────────
  const workoutSetsRef = useRef([]);   // accumule tous les sets de la session
  const workoutDateRef = useRef(new Date().toISOString().split('T')[0]);

  const saveWorkoutLog = useCallback(() => {
    if (workoutSetsRef.current.length === 0) return;
    const dateKey = workoutDateRef.current;
    const existing = (() => { try { return JSON.parse(localStorage.getItem('morpho_workout_log')||'{}'); } catch{return{};} })();
    const totalVolume = workoutSetsRef.current.reduce((s,set) => s + set.kg * set.reps, 0);
    existing[dateKey] = {
      seanceNom:   seance?.nom || 'Séance',
      seanceId:    seance?.id  || '',
      sets:        workoutSetsRef.current,
      totalVolume,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem('morpho_workout_log', JSON.stringify(existing));
  }, [seance]);

  const mm2 = String(Math.floor(elapsed/60)).padStart(2,'0');
  const ss2 = String(elapsed%60).padStart(2,'0');

  // Sauvegarde aussi si l'utilisateur ferme manuellement en cours de séance
  const handleClose = useCallback(() => {
    saveWorkoutLog();
    onClose();
  }, [saveWorkoutLog, onClose]);

  const lastEntry    = ex?.historique?.[ex.historique.length - 1];
  const lastSetLabel = lastEntry ? `Dernière ${lastEntry.poids}×${lastEntry.reps}` : null;
  const kgDelta      = lastEntry
    ? +(kg - parseFloat(lastEntry.poids || 0)).toFixed(1)
    : null;
  const restSecs     = parseInt(String(ex?.repos || REST_DEFAULT).replace(/\D/g,'')) || REST_DEFAULT;
  const coachMsg     = loggedSets.length > 0
    ? `${loggedSets.length} séries bouclées. Beau travail, continue.`
    : null;

  const content = (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0,
                  zIndex:9999, background:T.bg,
                  display:'flex', flexDirection:'column' }}>
      <style>{CSS}</style>

      {/* Halo */}
      <div style={{ position:'absolute', top:'20%', left:'50%',
        transform:'translateX(-50%)',
        width:400, height:400, borderRadius:'50%',
        background:`radial-gradient(closest-side,${T.acGlow},transparent 70%)`,
        filter:'blur(60px)', pointerEvents:'none', zIndex:0 }}/>

      {/* ── Header ── */}
      <div style={{ padding:'env(safe-area-inset-top, 52px) 18px 0',
                    paddingTop:'max(52px, env(safe-area-inset-top, 52px))',
                    flexShrink:0, position:'relative', zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button className="fm-tap" onClick={handleClose}
            style={{ width:40, height:40, borderRadius:13, ...GL,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, border:'none' }}>
            <I n="x" sz={17}/>
          </button>
          <div style={{ textAlign:'center', flex:1, padding:'0 10px' }}>
            <div style={{ fontFamily:F, fontSize:22, fontWeight:700,
                          color:T.t1, letterSpacing:-0.5, lineHeight:1.15 }}>
              {ex ? ex.nom : '—'}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                          gap:6, marginTop:8 }}>
              <span style={{ fontFamily:MON, fontSize:9, fontWeight:500, color:T.t4,
                             letterSpacing:'1.8px', textTransform:'uppercase' }}>
                EXO {exIdx+1}/{exercices.length}
              </span>
              <span style={{ width:3, height:3, borderRadius:'50%', background:T.t5 }}/>
              <I n="clock" sz={9} c={T.t4} s={2}/>
              <span style={{ fontFamily:MON, fontSize:10, fontWeight:600, color:T.t3, ...NUM }}>
                {mm2}:{ss2}
              </span>
            </div>
          </div>
          <button className="fm-tap"
            style={{ width:40, height:40, borderRadius:13, ...GL,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, border:'none' }}>
            <I n="book" sz={17} s={1.6}/>
          </button>
        </div>

        {/* Dots séries */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                      gap:7, marginTop:20, paddingBottom:4 }}>
          {Array.from({ length:totalSets }).map((_,i) => {
            const isDone = i < loggedSets.length;
            const isCur  = i === Math.min(setIdx, totalSets-1) && phase !== 'done';
            return (
              <span key={i} style={{
                display:'block',
                width:isCur?26:10, height:10, borderRadius:6,
                background:isDone?T.ac:isCur?T.acLt:'rgba(178,190,210,0.16)',
                boxShadow:isCur?`0 0 10px ${T.acGlow}`:'none',
                transition:'all .3s',
              }}/>
            );
          })}
        </div>

        {/* ── Barre d'actions rapides : Guide · Tip coach · Historique ── */}
        {phase === 'set' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
                        gap:8, marginTop:16 }}>
            <button className="fm-tap" onClick={() => setShowGuide(true)}
              style={{ background:T.surf, border:`1px solid ${T.bd}`,
                       boxShadow:'0 1px 2px rgba(15,23,42,0.03), 0 2px 6px rgba(15,23,42,0.04)',
                       padding:'12px 6px', borderRadius:14,
                       display:'flex', flexDirection:'column', alignItems:'center',
                       gap:6, cursor:'pointer' }}>
              <span style={{ width:32, height:32, borderRadius:10,
                             background:T.acSoft, color:T.ac,
                             display:'grid', placeItems:'center' }}>
                <I n="play" sz={16}/>
              </span>
              <span style={{ fontFamily:F, fontSize:12, fontWeight:600, color:T.t1 }}>
                Guide
              </span>
            </button>

            <button className="fm-tap" onClick={() => setShowTip(v => !v)}
              style={{ background:T.surf, border:`1px solid ${T.bd}`,
                       boxShadow:'0 1px 2px rgba(15,23,42,0.03), 0 2px 6px rgba(15,23,42,0.04)',
                       padding:'12px 6px', borderRadius:14,
                       display:'flex', flexDirection:'column', alignItems:'center',
                       gap:6, cursor:'pointer' }}>
              <span style={{ width:32, height:32, borderRadius:10,
                             background:'rgba(245,158,11,0.14)', color:'#D97706',
                             display:'grid', placeItems:'center' }}>
                <I n="bulb" sz={16} s={2}/>
              </span>
              <span style={{ fontFamily:F, fontSize:12, fontWeight:600, color:T.t1 }}>
                Tip coach
              </span>
            </button>

            <button className="fm-tap" onClick={() => setShowHisto(true)}
              style={{ background:T.surf, border:`1px solid ${T.bd}`,
                       boxShadow:'0 1px 2px rgba(15,23,42,0.03), 0 2px 6px rgba(15,23,42,0.04)',
                       padding:'12px 6px', borderRadius:14,
                       display:'flex', flexDirection:'column', alignItems:'center',
                       gap:6, cursor:'pointer' }}>
              <span style={{ width:32, height:32, borderRadius:10,
                             background:'rgba(99,102,241,0.14)', color:'#6366F1',
                             display:'grid', placeItems:'center' }}>
                <I n="pulse" sz={16} s={2}/>
              </span>
              <span style={{ fontFamily:F, fontSize:12, fontWeight:600, color:T.t1 }}>
                Historique
              </span>
            </button>
          </div>
        )}

        {/* ── Card Dernière séance ── */}
        {phase === 'set' && (
          <div style={{ marginTop:10, padding:'12px 14px',
                        background:T.surf, border:`1px solid ${T.bd}`,
                        boxShadow:'0 1px 2px rgba(15,23,42,0.03), 0 2px 6px rgba(15,23,42,0.04)',
                        borderRadius:14,
                        display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:36, height:36, borderRadius:10,
                          background:'linear-gradient(135deg,#6366F1,#818CF8)',
                          color:'#fff', display:'grid', placeItems:'center',
                          flexShrink:0 }}>
              <I n="pulse" sz={16} s={2}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:MON, fontSize:9, color:T.t3,
                            textTransform:'uppercase', letterSpacing:'0.1em',
                            fontWeight:600, marginBottom:2 }}>
                {lastEntry
                  ? `Dernière séance${lastEntry.date ? ' · '+lastEntry.date : ''}`
                  : 'Dernière séance'}
              </div>
              {lastEntry ? (
                <div style={{ fontFamily:F, fontSize:14, color:T.t1, fontWeight:700 }}>
                  {lastEntry.poids} kg × {lastEntry.reps} reps
                </div>
              ) : (
                <div style={{ fontFamily:F, fontSize:13, color:T.t3, fontWeight:500 }}>
                  Pas encore enregistrée
                </div>
              )}
            </div>
            {lastEntry && kgDelta !== null && (
              <div style={{ fontFamily:MON, fontSize:11, fontWeight:700,
                            color: kgDelta >= 0 ? '#10B981' : '#EF4444',
                            background: kgDelta >= 0
                              ? 'rgba(16,185,129,0.12)'
                              : 'rgba(239,68,68,0.12)',
                            padding:'4px 8px', borderRadius:7,
                            flexShrink:0, ...NUM }}>
                {kgDelta > 0 ? '+' : ''}{kgDelta} {kgDelta >= 0 ? '↗' : '↘'}
              </div>
            )}
          </div>
        )}

        {/* ── Bandeau Tip coach (toggle) ── */}
        {phase === 'set' && showTip && (
          <div style={{ marginTop:10, padding:'11px 13px',
                        background:'linear-gradient(135deg,rgba(254,243,199,0.6) 0%,rgba(254,249,232,0.6) 100%)',
                        border:'1px solid rgba(245,158,11,0.25)',
                        borderRadius:14,
                        display:'flex', alignItems:'flex-start', gap:10 }}>
            <div style={{ width:26, height:26, borderRadius:8,
                          background:'linear-gradient(135deg,#F59E0B,#FBBF24)',
                          color:'#fff', display:'grid', placeItems:'center',
                          flexShrink:0 }}>
              <I n="spark" sz={13} s={2}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:MON, fontSize:9, color:'#B45309',
                            textTransform:'uppercase', letterSpacing:'0.1em',
                            fontWeight:600, marginBottom:2 }}>
                Tip du coach
              </div>
              <div style={{ fontFamily:F, fontSize:12, color:'#6B4D14',
                            lineHeight:1.4 }}>
                {ex?.tip || 'Garde la position de référence : omoplates serrées, gainage actif, amplitude contrôlée.'}
              </div>
            </div>
            <button onClick={() => setShowTip(false)}
              style={{ background:'none', border:'none', color:'#B45309',
                       padding:2, cursor:'pointer', display:'grid', placeItems:'center' }}>
              <I n="x" sz={14} s={2}/>
            </button>
          </div>
        )}
      </div>

      {/* ── Stage — enfant direct du flex root ── */}
      {(phase === 'set' || phase === 'flash') && (
        <SetStage
          phase={phase}
          setNum={Math.min(setIdx+1, totalSets)}
          totalSets={totalSets}
          kg={kg} reps={reps}
          setKg={setKg} setReps={setReps}
          isIaBump={false}
          lastSetLabel={lastSetLabel}
          onValidate={validate}
        />
      )}
      {phase === 'rest' && (
        <RestStage
          rest={rest} total={restSecs}
          nextKg={kg} nextReps={reps}
          nextNum={Math.min(setIdx+1, totalSets)}
          onSkip={() => { clearInterval(restRef.current); setPhase('set'); }}
          onAdd={s => setRest(r => r+s)}
        />
      )}
      {phase === 'done' && (
        <DoneStage
          loggedSets={loggedSets}
          onNextExercise={nextExercise}
          coachMsg={coachMsg}
          premium={premium}
        />
      )}

      {/* ── Modale Guide vidéo / instructions ── */}
      {showGuide && (
        <div onClick={() => setShowGuide(false)}
          style={{ position:'absolute', inset:0, zIndex:60,
                   background:'rgba(15,25,35,0.55)',
                   backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
                   display:'flex', alignItems:'flex-end', justifyContent:'center',
                   animation:'fm-fadeUp .25s ease both' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:520, background:T.surf,
                     borderTopLeftRadius:28, borderTopRightRadius:28,
                     padding:'24px 22px max(28px,env(safe-area-inset-bottom,28px))',
                     boxShadow:'0 -20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width:36, height:4, borderRadius:2, background:T.bdHi,
                          margin:'0 auto 20px' }}/>
            <div style={{ fontFamily:F, fontSize:11, fontWeight:600, color:T.ac,
                          letterSpacing:'1.2px', textTransform:'uppercase',
                          marginBottom:6 }}>
              Guide
            </div>
            <h3 style={{ fontFamily:F, fontSize:22, fontWeight:700, color:T.t1,
                         margin:'0 0 14px', letterSpacing:-0.3 }}>
              {ex?.nom}
            </h3>
            <div style={{ aspectRatio:'16/9', borderRadius:14, background:T.surfFlat,
                          display:'grid', placeItems:'center',
                          border:`1px solid ${T.bd}`, marginBottom:16 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                            gap:8, color:T.t3 }}>
                <I n="skip" sz={32} c={T.t3} s={1.6}/>
                <span style={{ fontFamily:F, fontSize:12 }}>Vidéo à venir</span>
              </div>
            </div>
            <div style={{ fontFamily:F, fontSize:13, color:T.t2, lineHeight:1.6 }}>
              {ex?.instructions || ex?.tip || "Position de départ, contrôle excentrique, amplitude complète. Garde le gainage et respire."}
            </div>
          </div>
        </div>
      )}

      {/* ── Modale Historique ── */}
      {showHisto && (
        <div onClick={() => setShowHisto(false)}
          style={{ position:'absolute', inset:0, zIndex:60,
                   background:'rgba(15,25,35,0.55)',
                   backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
                   display:'flex', alignItems:'flex-end', justifyContent:'center',
                   animation:'fm-fadeUp .25s ease both' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:520, maxHeight:'75vh',
                     background:T.surf,
                     borderTopLeftRadius:28, borderTopRightRadius:28,
                     padding:'24px 22px max(28px,env(safe-area-inset-bottom,28px))',
                     boxShadow:'0 -20px 60px rgba(0,0,0,0.25)',
                     display:'flex', flexDirection:'column' }}>
            <div style={{ width:36, height:4, borderRadius:2, background:T.bdHi,
                          margin:'0 auto 20px' }}/>
            <div style={{ fontFamily:F, fontSize:11, fontWeight:600, color:'#6366F1',
                          letterSpacing:'1.2px', textTransform:'uppercase',
                          marginBottom:6 }}>
              Historique
            </div>
            <h3 style={{ fontFamily:F, fontSize:22, fontWeight:700, color:T.t1,
                         margin:'0 0 16px', letterSpacing:-0.3 }}>
              {ex?.nom}
            </h3>
            <div style={{ flex:1, overflowY:'auto', display:'flex',
                          flexDirection:'column', gap:8 }}>
              {(ex?.historique || []).length === 0 && (
                <div style={{ fontFamily:F, fontSize:13, color:T.t3,
                              textAlign:'center', padding:'30px 0' }}>
                  Pas encore d'historique sur cet exercice.
                </div>
              )}
              {(ex?.historique || []).slice().reverse().map((h, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center',
                                      justifyContent:'space-between',
                                      padding:'12px 14px', borderRadius:12,
                                      background:T.surfFlat,
                                      border:`1px solid ${T.bd}` }}>
                  <div>
                    <div style={{ fontFamily:F, fontSize:14, fontWeight:700, color:T.t1 }}>
                      {h.poids} kg × {h.reps} reps
                    </div>
                    {h.date && (
                      <div style={{ fontFamily:MON, fontSize:10, color:T.t3,
                                    marginTop:2, letterSpacing:'0.04em' }}>
                        {h.date}
                      </div>
                    )}
                  </div>
                  {h.rpe && (
                    <div style={{ fontFamily:MON, fontSize:11, fontWeight:600,
                                  color:T.ac, background:T.acSoft,
                                  padding:'3px 8px', borderRadius:6 }}>
                      RPE {h.rpe}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Portal → rendu directement dans document.body
  // Bypasse tout overflow:hidden ou transform des parents
  return createPortal(content, document.body);
}
