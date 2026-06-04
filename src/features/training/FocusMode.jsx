/**
 * FocusMode.jsx — Structure exacte de la maquette MorphoCoach_Mode_Focus.html
 * Keyframes injectés inline dans le <style> — synchrones, toujours présents au premier render.
 * SetStage / RestStage / DoneStage = enfants DIRECTS du flex root (pas de wrapper).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  WorkoutProgress,
  WeightSelector,
  RepsSelector,
  WorkoutActionButton,
  RestTimer,
  CoachInsight,
  ExerciseCompletionCard,
} from "./components/FocusModeComponents.jsx";

// ── Tokens Focus Mode ────────────────────────────────────────────────────────
const T = {
  bg:'#060912', bgLo:'#03060D', surf:'#0D1322', surfFlat:'#0A1020',
  bd:'rgba(178,190,210,0.07)', bdHi:'rgba(178,190,210,0.14)', bdAc:'rgba(91,141,239,0.32)',
  t1:'#F2F4F7', t2:'rgba(242,244,247,0.74)', t3:'#8A94A6',
  t4:'rgba(138,148,166,0.62)', t5:'rgba(138,148,166,0.32)',
  ac:'#5B8DEF', acLt:'#9CB9F5', acDk:'#2D5DC9',
  acSoft:'rgba(91,141,239,0.14)', acGlow:'rgba(91,141,239,0.22)',
};
const FONT  = '"Space Grotesk","Inter",system-ui,sans-serif';
const SERIF = '"Instrument Serif","Times New Roman",serif';
const MONO  = '"JetBrains Mono",ui-monospace,monospace';
const NUM   = { fontVariantNumeric:'tabular-nums', fontFeatureSettings:'"tnum","cv11"' };
const GLASS = {
  background:'rgba(13,19,34,0.66)',
  backdropFilter:'blur(22px) saturate(150%)',
  WebkitBackdropFilter:'blur(22px) saturate(150%)',
  border:'1px solid rgba(178,190,210,0.10)',
  borderRadius:20,
};

// Keyframes injectés en inline dans le JSX — disponibles au premier render
const CSS = `
  @keyframes fm-pulseDot  { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes fm-breathe   { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.95;transform:scale(1.06)} }
  @keyframes fm-ringPulse { 0%{transform:scale(0.85);opacity:.7} 100%{transform:scale(1.7);opacity:0} }
  @keyframes fm-popCheck  { 0%{transform:scale(0.3);opacity:0} 55%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes fm-numIn     { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes fm-fadeUp    { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes fm-flashGlow { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
  .fm-tap{transition:transform 140ms cubic-bezier(.4,0,.2,1),opacity .2s,background .2s,box-shadow .2s;
          cursor:pointer;-webkit-tap-highlight-color:transparent;}
  .fm-tap:active{transform:scale(0.95);}
`;

const REST_DEFAULT = 90;

// ── Icon SVG ─────────────────────────────────────────────────────────────────
function Icon({ n, size=18, c='currentColor', s=1.7 }) {
  const p = { width:size, height:size, viewBox:'0 0 24 24', fill:'none',
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
    chevD: <path d="m6 9 6 6 6-6"/>,
    chevU: <path d="m6 15 6-6 6 6"/>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></>,
    award: <><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></>,
    flame: <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5M12 21a6 6 0 0 0 6-6c0-3-2-5-3-6 0 3-2 4-3 4s-3-1-3-4c-1 1-3 3-3 6a6 6 0 0 0 6 6z"/>,
    trend: <><path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/></>,
    chevR: <path d="m9 6 6 6-6 6"/>,
  };
  return <svg {...p}>{P[n]||null}</svg>;
}

// ── SetStage — enfant direct du flex root (flex:1) ────────────────────────────
function SetStage({ phase, setNum, totalSets, kg, reps, setKg, setReps,
                   isIaBump, lastSetLabel, onValidate }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column',
                  position:'relative', padding:'0 18px' }}>

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
              <Icon n="check" size={42} s={2.6} c={T.t1}/>
            </div>
          </div>
        </div>
      )}

      {/* Contenu centré */}
      <div style={{ flex:1, display:'flex', flexDirection:'column',
                    justifyContent:'center',
                    opacity: phase === 'flash' ? 0.25 : 1,
                    transition:'opacity .3s' }}>

        {/* Label série */}
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:9,
                        padding:'7px 16px', borderRadius:999, ...GLASS }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:T.ac,
              animation:'fm-pulseDot 1.6s ease-in-out infinite',
              boxShadow:`0 0 8px ${T.ac}` }}/>
            <span style={{ fontFamily:FONT, fontSize:14, fontWeight:700,
                           color:T.t1, letterSpacing:0.2 }}>
              SÉRIE{' '}
              <span style={{ color:T.acLt }}>{setNum}</span>
              {' '}<span style={{ color:T.t4, fontWeight:500 }}>/ {totalSets}</span>
            </span>
          </div>
        </div>

        {/* Charge — 108px comme la maquette */}
        <div style={{ marginTop:26, display:'flex', alignItems:'center',
                      justifyContent:'center', gap:18 }}>
          <button className="fm-tap"
            onClick={() => setKg(v => Math.max(0, +(v-2.5).toFixed(1)))}
            style={{ width:56, height:56, borderRadius:18, ...GLASS,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, flexShrink:0, border:'none' }}>
            <Icon n="minus" size={22} s={2.2}/>
          </button>
          <div style={{ textAlign:'center', minWidth:160 }}>
            <div key={kg} style={{ display:'flex', alignItems:'baseline',
                                   justifyContent:'center', gap:6,
                                   animation:'fm-numIn .25s ease both' }}>
              <span style={{ fontFamily:SERIF, fontSize:108, fontWeight:400,
                             color:T.t1, letterSpacing:-4, lineHeight:0.78, ...NUM }}>
                {kg}
              </span>
              <span style={{ fontFamily:MONO, fontSize:22, fontWeight:500, color:T.t3 }}>
                kg
              </span>
            </div>
          </div>
          <button className="fm-tap"
            onClick={() => setKg(v => +(v+2.5).toFixed(1))}
            style={{ width:56, height:56, borderRadius:18,
                     background:T.acSoft, border:`1px solid ${T.bdAc}`,
                     color:T.acLt, display:'grid', placeItems:'center',
                     padding:0, flexShrink:0, cursor:'pointer' }}>
            <Icon n="plus" size={22} s={2.2}/>
          </button>
        </div>

        {/* Reps — 72px comme la maquette */}
        <div style={{ marginTop:18, display:'flex', alignItems:'center',
                      justifyContent:'center', gap:18 }}>
          <button className="fm-tap"
            onClick={() => setReps(v => Math.max(1, v-1))}
            style={{ width:56, height:56, borderRadius:18, ...GLASS,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, flexShrink:0, border:'none' }}>
            <Icon n="minus" size={22} s={2.2}/>
          </button>
          <div style={{ textAlign:'center', minWidth:160 }}>
            <div key={reps} style={{ display:'flex', alignItems:'baseline',
                                     justifyContent:'center', gap:8,
                                     animation:'fm-numIn .25s ease both' }}>
              <span style={{ fontFamily:SERIF, fontSize:72, fontWeight:400,
                             color:T.t1, letterSpacing:-2.5, lineHeight:0.85, ...NUM }}>
                {reps}
              </span>
              <span style={{ fontFamily:MONO, fontSize:16, fontWeight:500, color:T.t3 }}>
                reps
              </span>
            </div>
          </div>
          <button className="fm-tap"
            onClick={() => setReps(v => v+1)}
            style={{ width:56, height:56, borderRadius:18,
                     background:T.acSoft, border:`1px solid ${T.bdAc}`,
                     color:T.acLt, display:'grid', placeItems:'center',
                     padding:0, flexShrink:0, cursor:'pointer' }}>
            <Icon n="plus" size={22} s={2.2}/>
          </button>
        </div>

        {/* Mini cues */}
        <div style={{ marginTop:24, display:'flex', alignItems:'center',
                      justifyContent:'center', gap:8 }}>
          {lastSetLabel && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6,
              padding:'6px 11px', borderRadius:999,
              background:T.surf, border:`1px solid ${T.bd}` }}>
              <Icon n="clock" size={10} c={T.t4} s={1.9}/>
              <span style={{ fontFamily:MONO, fontSize:10, color:T.t3, ...NUM }}>
                {lastSetLabel}
              </span>
            </span>
          )}
          {isIaBump && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6,
              padding:'6px 11px', borderRadius:999,
              background:T.acSoft, border:`1px solid ${T.bdAc}` }}>
              <Icon n="spark" size={10} c={T.acLt} s={2}/>
              <span style={{ fontFamily:MONO, fontSize:10, fontWeight:700,
                             color:T.acLt, ...NUM }}>+2.5 kg suggéré</span>
            </span>
          )}
        </div>
      </div>

      {/* VALIDER — ancré en bas */}
      <div style={{ flexShrink:0, paddingBottom:26 }}>
        <button className="fm-tap" onClick={onValidate}
          style={{ width:'100%', padding:'24px', borderRadius:22,
            background:`linear-gradient(180deg,${T.acLt} 0%,${T.ac} 48%,${T.acDk} 100%)`,
            color:T.t1, border:`1px solid ${T.acLt}70`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:11,
            fontFamily:FONT, fontSize:19, fontWeight:700, letterSpacing:0.2,
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.32), 0 14px 36px rgba(45,93,201,0.6)',
            cursor:'pointer' }}>
          <Icon n="check" size={24} s={2.6}/> VALIDER LA SÉRIE
        </button>
      </div>
    </div>
  );
}

// ── RestStage — enfant direct du flex root (flex:1) ───────────────────────────
function RestStageLocal({ rest, total, nextKg, nextReps, nextNum, onSkip, onAdd }) {
  const R    = 120;
  const CIRC = 2 * Math.PI * R;
  const pct  = total > 0 ? rest / total : 0;
  const off  = CIRC * (1 - pct);
  const mm   = Math.floor(rest / 60);
  const ss   = String(rest % 60).padStart(2, '0');

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column',
                  justifyContent:'center', alignItems:'center',
                  padding:'0 18px', animation:'fm-fadeUp .35s ease' }}>
      <div style={{ fontFamily:MONO, fontSize:9.5, fontWeight:600, color:T.ac,
                    letterSpacing:'1.6px', textTransform:'uppercase' }}>
        RÉCUPÉRATION
      </div>

      <div style={{ position:'relative', width:300, height:300, marginTop:14 }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%',
          background:`radial-gradient(closest-side,${T.acGlow},transparent 72%)`,
          filter:'blur(24px)', animation:'fm-breathe 2.4s ease-in-out infinite' }}/>
        <svg width="300" height="300" viewBox="0 0 300 300"
          style={{ position:'relative', transform:'rotate(-90deg)' }}>
          <circle cx="150" cy="150" r={R} stroke="rgba(178,190,210,0.08)"
            strokeWidth="11" fill="none"/>
          <defs>
            <linearGradient id="fm-rg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={T.acLt}/>
              <stop offset="100%" stopColor={T.acDk}/>
            </linearGradient>
          </defs>
          <circle cx="150" cy="150" r={R} stroke="url(#fm-rg)" strokeWidth="11"
            fill="none" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={off}
            style={{ transition:'stroke-dashoffset 1s linear' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex',
                      flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:SERIF, fontSize:86, fontWeight:400,
                        color:T.t1, letterSpacing:'-3px', lineHeight:0.85, ...NUM }}>
            {mm}:{ss}
          </div>
          <div style={{ fontFamily:MONO, fontSize:9, fontWeight:500, color:T.t4,
                        letterSpacing:'1.8px', textTransform:'uppercase', marginTop:8 }}>
            PROCHAINE · SÉRIE {nextNum}
          </div>
          <div style={{ fontFamily:MONO, fontSize:13, fontWeight:600,
                        color:T.acLt, marginTop:3, ...NUM }}>
            {nextKg}kg × {nextReps}
          </div>
        </div>
      </div>

      <div style={{ marginTop:34, display:'flex', alignItems:'center', gap:12 }}>
        <button className="fm-tap" onClick={() => onAdd(15)}
          style={{ height:56, padding:'0 22px', borderRadius:16, ...GLASS,
                   color:T.t1, display:'flex', alignItems:'center', gap:7,
                   fontFamily:FONT, fontSize:14, fontWeight:600, border:'none', cursor:'pointer' }}>
          <Icon n="plus" size={16} s={2.2}/> 15s
        </button>
        <button className="fm-tap" onClick={onSkip}
          style={{ height:56, padding:'0 28px', borderRadius:16,
            background:`linear-gradient(180deg,${T.acLt},${T.acDk})`,
            border:`1px solid ${T.acLt}60`, color:T.t1,
            display:'flex', alignItems:'center', gap:8,
            fontFamily:FONT, fontSize:15, fontWeight:700, cursor:'pointer',
            boxShadow:'0 8px 24px rgba(45,93,201,0.5),inset 0 1px 0 rgba(255,255,255,0.3)' }}>
          <Icon n="skip" size={16} s={1.9}/> Série suivante
        </button>
      </div>

      <div style={{ marginTop:18, display:'flex', alignItems:'center', gap:7 }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:T.ac,
          animation:'fm-pulseDot 1.6s ease-in-out infinite' }}/>
        <span style={{ fontFamily:FONT, fontSize:11, color:T.t4 }}>
          Vibration à la fin du repos
        </span>
      </div>
    </div>
  );
}

// ── DoneStage — enfant direct du flex root ────────────────────────────────────
function DoneStage({ exerciseName, loggedSets, onNextExercise, coachMsg }) {
  const vol = loggedSets.reduce((a,s) => a + s.kg * s.reps, 0);
  const pr  = loggedSets.reduce((a,s) => Math.max(a, s.kg), 0);

  return (
    <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch',
                  padding:'10px 18px 30px' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                    textAlign:'center', marginTop:18 }}>
        <div style={{ position:'relative', width:104, height:104,
                      display:'grid', placeItems:'center' }}>
          <span style={{ position:'absolute', inset:0, borderRadius:'50%',
            border:`2px solid ${T.ac}`, animation:'fm-ringPulse 1.6s ease-out infinite' }}/>
          <div style={{ width:84, height:84, borderRadius:'50%',
            background:`linear-gradient(160deg,${T.acLt},${T.acDk})`,
            display:'grid', placeItems:'center',
            boxShadow:'0 10px 30px rgba(45,93,201,0.6)',
            animation:'fm-popCheck .5s cubic-bezier(.2,.8,.2,1)' }}>
            <Icon n="check" size={42} s={2.6} c={T.t1}/>
          </div>
        </div>
        <div style={{ fontFamily:MONO, fontSize:9.5, fontWeight:600, color:T.ac,
                      letterSpacing:'1.6px', textTransform:'uppercase',
                      marginTop:22, animation:'fm-fadeUp .5s ease both 100ms' }}>
          EXERCICE TERMINÉ
        </div>
        <div style={{ fontFamily:SERIF, fontSize:34, color:T.t1, marginTop:8,
                      letterSpacing:'-1.1px', animation:'fm-fadeUp .5s ease both 180ms' }}>
          {loggedSets.length} séries,{' '}
          <span style={{ fontStyle:'italic', color:T.acLt }}>bouclées.</span>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, marginTop:24,
                    animation:'fm-fadeUp .5s ease both 260ms' }}>
        {[{ic:'flame',l:'VOLUME',v:vol.toLocaleString('fr-FR'),u:'kg'},
          {ic:'award',l:'MEILLEUR',v:String(pr),u:'kg'},
          {ic:'trend',l:'SÉRIES',v:String(loggedSets.length),u:''},
        ].map(s => (
          <div key={s.l} style={{ flex:1, ...GLASS, padding:'14px 12px' }}>
            <Icon n={s.ic} size={14} c={T.acLt} s={1.8}/>
            <div style={{ fontFamily:MONO, fontSize:8, fontWeight:500, color:T.t4,
                          letterSpacing:'1.8px', textTransform:'uppercase', marginTop:8 }}>
              {s.l}
            </div>
            <div style={{ display:'flex', alignItems:'baseline', gap:3, marginTop:4 }}>
              <span style={{ fontFamily:FONT, fontSize:19, fontWeight:700,
                             color:T.t1, letterSpacing:-0.5, ...NUM }}>{s.v}</span>
              {s.u && <span style={{ fontFamily:MONO, fontSize:9, color:T.t4 }}>{s.u}</span>}
            </div>
          </div>
        ))}
      </div>

      {coachMsg && (
        <div style={{ marginTop:14, ...GLASS, padding:'14px 15px',
                      display:'flex', gap:12, alignItems:'flex-start',
                      animation:'fm-fadeUp .5s ease both 340ms' }}>
          <div style={{ width:32, height:32, borderRadius:10, flexShrink:0,
            background:`linear-gradient(160deg,${T.acLt},${T.acDk})`,
            display:'grid', placeItems:'center',
            boxShadow:`0 4px 12px ${T.acGlow}` }}>
            <Icon n="spark" size={16} c={T.t1} s={1.9}/>
          </div>
          <div>
            <div style={{ fontFamily:MONO, fontSize:9, fontWeight:600, color:T.acLt,
                          letterSpacing:'1.6px', textTransform:'uppercase' }}>COACH IA</div>
            <div style={{ fontFamily:FONT, fontSize:12.5, color:T.t1, marginTop:5,
                          lineHeight:1.5 }}>{coachMsg}</div>
          </div>
        </div>
      )}

      <div style={{ marginTop:14, ...GLASS, padding:'4px 14px',
                    animation:'fm-fadeUp .5s ease both 400ms' }}>
        {loggedSets.map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center',
            justifyContent:'space-between', padding:'12px 0',
            borderBottom: i < loggedSets.length-1 ? `1px solid ${T.bd}` : 'none' }}>
            <span style={{ fontFamily:FONT, fontSize:13, fontWeight:700, color:T.t3 }}>
              Série {i+1}
            </span>
            <span style={{ fontFamily:MONO, fontSize:13, fontWeight:600, color:T.t1, ...NUM }}>
              {s.kg} kg × {s.reps}
            </span>
            <span style={{ width:22, height:22, borderRadius:7, background:T.acSoft,
              border:`1px solid ${T.bdAc}`, display:'grid', placeItems:'center',
              color:T.acLt }}>
              <Icon n="check" size={12} s={2.8}/>
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop:16, animation:'fm-fadeUp .5s ease both 460ms' }}>
        <button className="fm-tap" onClick={onNextExercise}
          style={{ width:'100%', height:56, borderRadius:16,
            background:`linear-gradient(180deg,${T.acLt},${T.acDk})`,
            border:`1px solid ${T.acLt}60`, color:T.t1,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            fontFamily:FONT, fontSize:15, fontWeight:700, cursor:'pointer',
            boxShadow:'0 8px 24px rgba(45,93,201,0.5),inset 0 1px 0 rgba(255,255,255,0.3)' }}>
          Exercice suivant <Icon n="chevR" size={16}/>
        </button>
      </div>
    </div>
  );
}

// ── FocusMode principal ───────────────────────────────────────────────────────
export default function FocusMode({
  seance, checkedEx, toggleCheck,
  prog, setProg, push, C, INT, EX, todayKey, onClose,
}) {
  const exercices  = seance?.exercices || [];
  const [exIdx,  setExIdx]      = useState(0);
  const ex        = exercices[exIdx] || null;
  const totalSets = ex ? (parseInt(ex.series) || 4) : 4;

  const [phase,       setPhase]      = useState('set');
  const [setIdx,      setSetIdx]     = useState(0);
  const [kg,          setKg]         = useState(() => parseFloat(ex?.charge) || 60);
  const [reps,        setReps]       = useState(() => parseInt(ex?.reps)    || 10);
  const [rest,        setRest]       = useState(REST_DEFAULT);
  const [loggedSets,  setLoggedSets] = useState([]);
  const [elapsed,     setElapsed]    = useState(0);

  // Reset au changement d'exercice
  useEffect(() => {
    if (!ex) return;
    setPhase('set'); setSetIdx(0);
    setKg(parseFloat(ex.charge) || 60);
    setReps(parseInt(ex.reps)   || 10);
    setRest(REST_DEFAULT); setLoggedSets([]);
  }, [exIdx]);

  // Chrono global
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e+1), 1000);
    return () => clearInterval(id);
  }, []);

  // Timer repos
  const restRef = useRef(null);
  useEffect(() => {
    if (phase !== 'rest') return;
    restRef.current = setInterval(() => {
      setRest(r => { if (r <= 1) { clearInterval(restRef.current); advance(); return 0; } return r-1; });
    }, 1000);
    return () => clearInterval(restRef.current);
  }, [phase]);

  function advance() {
    setPhase('set');
  }
  function validate() {
    const next = setIdx + 1;
    setLoggedSets(s => [...s, { kg, reps }]);
    setPhase('flash');
    if (next >= totalSets) {
      toggleCheck?.(seance.id, exIdx, ex?.repos, todayKey);
    }
    setTimeout(() => {
      if (next >= totalSets) { setPhase('done'); }
      else {
        const restSecs = parseInt(String(ex?.repos || REST_DEFAULT).replace(/\D/g,'')) || REST_DEFAULT;
        setRest(restSecs); setPhase('rest');
      }
    }, 1100);
    setSetIdx(next);
  }
  function skipRest() { clearInterval(restRef.current); advance(); }
  function addRest(s) { setRest(r => r+s); }
  function nextExercise() {
    const n = exIdx + 1;
    if (n < exercices.length) { setExIdx(n); }
    else { push?.("✅","Séance terminée !",`${exercices.length} exercices complétés.`); onClose(); }
  }

  if (!ex) return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:T.bg,
                  display:'grid', placeItems:'center' }}>
      <style>{CSS}</style>
      <button onClick={onClose} style={{ padding:'12px 24px', borderRadius:14,
        background:T.acSoft, border:`1px solid ${T.acLt}60`,
        color:T.acLt, fontFamily:FONT, fontSize:14, fontWeight:700, cursor:'pointer' }}>
        ← Retour
      </button>
    </div>
  );

  const restSecs    = parseInt(String(ex?.repos || REST_DEFAULT).replace(/\D/g,'')) || REST_DEFAULT;
  const lastEntry   = ex?.historique?.[ex.historique.length - 1];
  const lastSetLabel = lastEntry ? `Dernière ${lastEntry.poids}×${lastEntry.reps}` : null;
  const isIaBump    = false;
  const mm = String(Math.floor(elapsed/60)).padStart(2,'0');
  const ss2 = String(elapsed%60).padStart(2,'0');
  const coachMsg = loggedSets.length > 0
    ? `${loggedSets.length} séries bouclées. Continue sur cette lancée.`
    : null;

  return (
    /* Structure exacte de la maquette :
       position:relative height:100% display:flex flexDirection:column
       Header (flexShrink:0) + Stage (flex:1) comme enfants directs */
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0,
                  zIndex:9999, background:T.bg,
                  display:'flex', flexDirection:'column' }}>
      <style>{CSS}</style>

      {/* Halo ambiant */}
      <div style={{ position:'absolute', top:120, left:'50%',
        transform:'translateX(-50%)',
        width:360, height:360, borderRadius:'50%',
        background:`radial-gradient(closest-side,${T.acGlow},transparent 70%)`,
        filter:'blur(50px)', pointerEvents:'none', zIndex:0 }}/>

      {/* ── Header (flexShrink:0) ── */}
      <div style={{ padding:'52px 18px 0', flexShrink:0, position:'relative', zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button className="fm-tap" onClick={onClose}
            style={{ width:38, height:38, borderRadius:12, ...GLASS,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, border:'none', cursor:'pointer' }}>
            <Icon n="x" size={16}/>
          </button>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:FONT, fontSize:13, fontWeight:600,
                          color:T.t1, letterSpacing:-0.2 }}>
              {ex.nom}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                          gap:6, marginTop:3 }}>
              <span style={{ fontFamily:MONO, fontSize:8, fontWeight:500, color:T.t4,
                             letterSpacing:'1.8px', textTransform:'uppercase' }}>
                EXO {exIdx+1}/{exercices.length}
              </span>
              <span style={{ width:3, height:3, borderRadius:'50%', background:T.t5 }}/>
              <Icon n="clock" size={9} c={T.t4} s={2}/>
              <span style={{ fontFamily:MONO, fontSize:9.5, fontWeight:600, color:T.t3, ...NUM }}>
                {mm}:{ss2}
              </span>
            </div>
          </div>
          <button className="fm-tap"
            style={{ width:38, height:38, borderRadius:12, ...GLASS,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, border:'none', cursor:'pointer' }}>
            <Icon n="book" size={16} s={1.6}/>
          </button>
        </div>
        {/* Dots séries */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                      gap:7, marginTop:18 }}>
          {Array.from({ length:totalSets }).map((_,i) => {
            const isDone = i < loggedSets.length;
            const isCur  = i === Math.min(setIdx, totalSets-1) && phase !== 'done';
            return <span key={i} style={{
              display:'block',
              width:isCur?26:10, height:10, borderRadius:6,
              background:isDone?T.ac:isCur?T.acLt:'rgba(178,190,210,0.16)',
              boxShadow:isCur?`0 0 10px ${T.acGlow}`:'none',
              transition:'all .3s'
            }}/>;
          })}
        </div>
      </div>

      {/* ── CENTER STAGE — enfant direct, flex:1 ── */}
      {phase === 'done' && (
        <DoneStage
          exerciseName={ex.nom} loggedSets={loggedSets}
          onNextExercise={nextExercise} coachMsg={coachMsg}
        />
      )}
      {phase === 'rest' && (
        <RestStageLocal
          rest={rest} total={restSecs}
          nextKg={kg} nextReps={reps}
          nextNum={Math.min(setIdx+1, totalSets)}
          onSkip={skipRest} onAdd={addRest}
        />
      )}
      {(phase === 'set' || phase === 'flash') && (
        <SetStage
          phase={phase}
          setNum={Math.min(setIdx+1, totalSets)}
          totalSets={totalSets}
          kg={kg} reps={reps}
          setKg={setKg} setReps={setReps}
          isIaBump={isIaBump}
          lastSetLabel={lastSetLabel}
          onValidate={validate}
        />
      )}
    </div>
  );
}
