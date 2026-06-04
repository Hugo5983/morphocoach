/**
 * FocusModeComponents.jsx
 * ─────────────────────────────────────────────────────────────
 * 8 composants atomiques du Mode Focus.
 * Zéro logique métier — display + animation uniquement.
 * Toute la logique (checkedEx, toggleCheck, prog) reste dans le parent.
 *
 * Exports :
 *   InjectFocusKeyframes  — à monter une seule fois dans FocusMode
 *   WorkoutHeader
 *   WorkoutProgress
 *   WeightSelector
 *   RepsSelector
 *   WorkoutActionButton
 *   RestTimer
 *   CoachInsight
 *   ExerciseCompletionCard
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design tokens ───────────────────────────────────────────────────────────
// Focus Mode palette (distinct du reste de l'app — immersion totale)
const T = {
  bg:       '#060912',
  bgLo:     '#03060D',
  surf:     '#0D1322',
  surfHi:   '#141B30',
  surfFlat: '#0A1020',
  bd:       'rgba(178,190,210,0.07)',
  bdHi:     'rgba(178,190,210,0.14)',
  bdAc:     'rgba(91,141,239,0.32)',
  t1:       '#F2F4F7',
  t2:       'rgba(242,244,247,0.74)',
  t3:       '#8A94A6',
  t4:       'rgba(138,148,166,0.62)',
  t5:       'rgba(138,148,166,0.32)',
  ac:       '#5B8DEF',
  acLt:     '#9CB9F5',
  acDk:     '#2D5DC9',
  acSoft:   'rgba(91,141,239,0.14)',
  acGlow:   'rgba(91,141,239,0.22)',
};

const FONT = '"Space Grotesk","Inter",system-ui,sans-serif';
const SERIF = '"Instrument Serif","Times New Roman",serif';
const MONO  = '"JetBrains Mono",ui-monospace,monospace';
const NUM   = { fontVariantNumeric:'tabular-nums', fontFeatureSettings:'"tnum","cv11"' };

const GLASS = {
  background:           'rgba(13,19,34,0.66)',
  backdropFilter:       'blur(22px) saturate(150%)',
  WebkitBackdropFilter: 'blur(22px) saturate(150%)',
  border:               `1px solid rgba(178,190,210,0.10)`,
  borderRadius:         20,
};

const SHADOW_VALIDATE = 'inset 0 1px 0 rgba(255,255,255,0.32), 0 14px 36px rgba(45,93,201,0.60)';
const SHADOW_SKIP     = '0 8px 24px rgba(45,93,201,0.50), inset 0 1px 0 rgba(255,255,255,0.30)';
const SHADOW_CHECK    = '0 10px 30px rgba(45,93,201,0.60)';
const GRAD_BTN        = `linear-gradient(180deg, ${T.acLt} 0%, ${T.ac} 48%, ${T.acDk} 100%)`;
const GRAD_AVATAR     = `linear-gradient(160deg, ${T.acLt}, ${T.acDk})`;

// ─── Keyframes injection ─────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes fm-pulseDot  { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes fm-breathe   { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.95;transform:scale(1.06)} }
@keyframes fm-ringPulse { 0%{transform:scale(0.85);opacity:.7} 100%{transform:scale(1.7);opacity:0} }
@keyframes fm-popCheck  { 0%{transform:scale(0.3);opacity:0} 55%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
@keyframes fm-numIn     { 0%{transform:translateY(10px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes fm-fadeUp    { 0%{transform:translateY(12px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes fm-flashGlow { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
@keyframes fm-ringIn    { 0%{transform:scale(0.85);opacity:0} 100%{transform:scale(1);opacity:1} }
.fm-tap { transition: transform 140ms cubic-bezier(.4,0,.2,1),opacity .2s,background .2s,box-shadow .2s; cursor:pointer; -webkit-tap-highlight-color:transparent; }
.fm-tap:active { transform: scale(0.95); }
`;

/** Monte une seule fois dans FocusMode — injecte keyframes + classe .fm-tap */
export function InjectFocusKeyframes() {
  useEffect(() => {
    if (document.getElementById('fm-styles')) return;
    const s = document.createElement('style');
    s.id = 'fm-styles';
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
    return () => { /* intentionnellement pas retiré — persiste tant que l'app vit */ };
  }, []);
  return null;
}

// ─── Icon SVG ────────────────────────────────────────────────────────────────

function Icon({ n, size=18, c='currentColor', s=1.7 }) {
  const props = { width:size, height:size, viewBox:'0 0 24 24', fill:'none',
    stroke:c, strokeWidth:s, strokeLinecap:'round', strokeLinejoin:'round' };
  const P = {
    check:  <path d="m4 12 5 5 11-12"/>,
    minus:  <path d="M5 12h14"/>,
    plus:   <path d="M12 5v14M5 12h14"/>,
    chevL:  <path d="m15 18-6-6 6-6"/>,
    chevR:  <path d="m9 6 6 6-6 6"/>,
    chevD:  <path d="m6 9 6 6 6-6"/>,
    chevU:  <path d="m6 15 6-6 6 6"/>,
    x:      <path d="M6 6l12 12M18 6 6 18"/>,
    skip:   <><path d="M5 5v14l9-7z"/><path d="M19 5v14"/></>,
    book:   <><path d="M4 4a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V4Z"/><path d="M4 20a2 2 0 0 1 2-2h13"/></>,
    clock:  <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    share:  <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></>,
    spark:  <><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M6 6l2 2M18 18l-2-2M6 18l2-2M18 6l-2 2"/><circle cx="12" cy="12" r="2.5"/></>,
    award:  <><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></>,
    flame:  <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5M12 21a6 6 0 0 0 6-6c0-3-2-5-3-6 0 3-2 4-3 4s-3-1-3-4c-1 1-3 3-3 6a6 6 0 0 0 6 6z"/>,
    trend:  <><path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/></>,
    arrowU: <><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></>,
  };
  return <svg {...props}>{P[n] || null}</svg>;
}

// ─── 1. WorkoutActionButton ───────────────────────────────────────────────────
/**
 * Props :
 *   label      string
 *   onPress    () => void
 *   variant    'primary' | 'secondary' | 'glass' | 'ghost'
 *   icon       string (Icon name) | null
 *   iconSide   'left' | 'right'
 *   fullWidth  boolean
 *   disabled   boolean
 */
export function WorkoutActionButton({
  label, onPress,
  variant = 'primary',
  icon = null,
  iconSide = 'left',
  fullWidth = false,
  disabled = false,
}) {
  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONT, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
    border: 'none', outline: 'none', letterSpacing: '0.2px',
    opacity: disabled ? 0.48 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const styles = {
    primary: {
      ...base,
      padding: '22px',
      borderRadius: 22,
      background: GRAD_BTN,
      color: T.t1,
      border: `1px solid ${T.acLt}70`,
      fontSize: 19,
      gap: 10,
      boxShadow: disabled ? 'none' : SHADOW_VALIDATE,
    },
    secondary: {
      ...base,
      height: 56,
      padding: '0 28px',
      borderRadius: 16,
      background: GRAD_BTN,
      color: T.t1,
      border: `1px solid ${T.acLt}60`,
      fontSize: 15,
      gap: 8,
      boxShadow: disabled ? 'none' : SHADOW_SKIP,
    },
    glass: {
      ...base,
      height: 56,
      padding: '0 22px',
      borderRadius: 16,
      ...GLASS,
      color: T.t1,
      fontSize: 14,
      gap: 7,
    },
    ghost: {
      ...base,
      background: 'transparent',
      border: 'none',
      color: T.t4,
      fontSize: 11,
      padding: '4px 8px',
    },
  };

  const iconSize = variant === 'primary' ? 22 : 16;

  return (
    <button
      className="fm-tap"
      onClick={disabled ? undefined : onPress}
      style={styles[variant]}
    >
      {icon && iconSide === 'left'  && <Icon n={icon} size={iconSize} s={variant==='primary'?2.4:1.9}/>}
      {label}
      {icon && iconSide === 'right' && <Icon n={icon} size={iconSize} s={1.9}/>}
    </button>
  );
}

// ─── 2. WorkoutProgress ──────────────────────────────────────────────────────
/**
 * Props :
 *   totalSets       number
 *   completedSets   number
 *   currentSetIndex number  (0-based)
 *   phase           'set' | 'rest' | 'done'
 */
export function WorkoutProgress({ totalSets, completedSets, currentSetIndex, phase }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
      {Array.from({ length: totalSets }).map((_, i) => {
        const isDone  = i < completedSets;
        const isCur   = i === currentSetIndex && phase !== 'done';
        return (
          <span key={i} style={{
            display: 'block',
            width:       isCur ? 26 : 10,
            height:      10,
            borderRadius: 6,
            background:  isDone ? T.ac : isCur ? T.acLt : 'rgba(178,190,210,0.16)',
            boxShadow:   isCur ? `0 0 10px ${T.acGlow}` : 'none',
            transition:  'all 300ms ease',
          }}/>
        );
      })}
    </div>
  );
}

// ─── 3. WorkoutHeader ────────────────────────────────────────────────────────
/**
 * Props :
 *   exerciseName     string
 *   exerciseIndex    number  (1-based display)
 *   totalExercises   number
 *   elapsedTime      string  "24:18"
 *   totalSets        number
 *   completedSets    number
 *   currentSetIndex  number
 *   phase            'set' | 'rest' | 'done'
 *   onClose          () => void
 *   onGuide          () => void
 */
export function WorkoutHeader({
  exerciseName, exerciseIndex, totalExercises,
  elapsedTime = '00:00',
  totalSets, completedSets, currentSetIndex, phase,
  onClose, onGuide,
}) {
  const btnStyle = {
    width:38, height:38, borderRadius:12,
    ...GLASS, color:T.t2,
    display:'grid', placeItems:'center',
    padding:0, border:'none', flexShrink:0,
  };
  return (
    <div style={{ padding:'52px 18px 0', flexShrink:0, zIndex:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button className="fm-tap" onClick={onClose} style={btnStyle}>
          <Icon n="x" size={16}/>
        </button>

        <div style={{ textAlign:'center', flex:1, padding:'0 8px' }}>
          <div style={{ fontFamily:FONT, fontSize:13, fontWeight:600, color:T.t1, letterSpacing:-0.2,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {exerciseName}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:3 }}>
            <span style={{ fontFamily:MONO, fontSize:8, fontWeight:500, color:T.t4, letterSpacing:'1.8px', textTransform:'uppercase' }}>
              EXO {exerciseIndex}/{totalExercises}
            </span>
            <span style={{ width:3, height:3, borderRadius:'50%', background:T.t5 }}/>
            <Icon n="clock" size={9} c={T.t4} s={2}/>
            <span style={{ fontFamily:MONO, fontSize:9.5, fontWeight:600, color:T.t3, ...NUM }}>
              {elapsedTime}
            </span>
          </div>
        </div>

        <button className="fm-tap" onClick={onGuide} style={btnStyle}>
          <Icon n="book" size={16} s={1.6}/>
        </button>
      </div>

      {/* Set progress dots */}
      <div style={{ marginTop:18 }}>
        <WorkoutProgress
          totalSets={totalSets}
          completedSets={completedSets}
          currentSetIndex={currentSetIndex}
          phase={phase}
        />
      </div>
    </div>
  );
}

// ─── Internal: NumericStepperButton ──────────────────────────────────────────
function StepBtn({ direction, onClick, sizePx=52 }) {
  const isPlus = direction === 'plus';
  return (
    <button
      className="fm-tap"
      onClick={onClick}
      style={{
        width: sizePx, height: sizePx,
        borderRadius: 18, padding: 0, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        border: isPlus ? `1px solid ${T.bdAc}` : 'none',
        background: isPlus ? T.acSoft : GLASS.background,
        backdropFilter: isPlus ? 'none' : GLASS.backdropFilter,
        WebkitBackdropFilter: isPlus ? 'none' : GLASS.backdropFilter,
        color: isPlus ? T.acLt : T.t2,
        cursor: 'pointer',
      }}
    >
      <Icon n={isPlus ? 'plus' : 'minus'} size={22} s={2.2}/>
    </button>
  );
}

// ─── 4. WeightSelector ───────────────────────────────────────────────────────
/**
 * Props :
 *   value    number
 *   onChange (v: number) => void
 *   step     number  default 2.5
 *   min      number  default 0
 *   unit     string  default 'kg'
 *   size     'hero' | 'compact'
 */
export function WeightSelector({ value, onChange, step=2.5, min=0, unit='kg', size='hero' }) {
  const isHero = size === 'hero';
  const dec = (v, s) => Math.round((v - s) * 10) / 10;
  const inc = (v, s) => Math.round((v + s) * 10) / 10;

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18 }}>
      <StepBtn direction="minus" onClick={() => onChange(Math.max(min, dec(value, step)))} sizePx={isHero?52:36}/>

      <div style={{ textAlign:'center', minWidth: isHero ? 160 : 80 }}>
        {/* key={value} déclenche fm-numIn à chaque changement */}
        <div
          key={value}
          style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:6,
            animation: 'fm-numIn 0.25s ease' }}
        >
          <span style={{
            fontFamily: SERIF,
            fontSize:   isHero ? 86 : 32,
            fontWeight: 400,
            color:      T.t1,
            letterSpacing: isHero ? '-3px' : '-1px',
            lineHeight: 0.9,
            ...NUM,
          }}>
            {value}
          </span>
          <span style={{
            fontFamily: MONO,
            fontSize:   isHero ? 22 : 13,
            fontWeight: 500,
            color:      T.t3,
          }}>
            {unit}
          </span>
        </div>
      </div>

      <StepBtn direction="plus" onClick={() => onChange(inc(value, step))} sizePx={isHero?52:36}/>
    </div>
  );
}

// ─── 5. RepsSelector ─────────────────────────────────────────────────────────
/**
 * Props :
 *   value    number
 *   onChange (v: number) => void
 *   step     number  default 1
 *   min      number  default 1
 *   size     'hero' | 'compact'
 */
export function RepsSelector({ value, onChange, step=1, min=1, size='hero' }) {
  const isHero = size === 'hero';

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18 }}>
      <StepBtn direction="minus" onClick={() => onChange(Math.max(min, value - step))} sizePx={isHero?52:36}/>

      <div style={{ textAlign:'center', minWidth: isHero ? 120 : 60 }}>
        <div
          key={value}
          style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:5,
            animation: 'fm-numIn 0.25s ease' }}
        >
          <span style={{
            fontFamily: SERIF,
            fontSize:   isHero ? 86 : 32,
            fontWeight: 400,
            color:      T.t1,
            letterSpacing: isHero ? '-3px' : '-1px',
            lineHeight: 0.9,
            ...NUM,
          }}>
            {value}
          </span>
          <span style={{
            fontFamily: MONO,
            fontSize:   isHero ? 16 : 11,
            fontWeight: 500,
            color:      T.t3,
          }}>
            reps
          </span>
        </div>
      </div>

      <StepBtn direction="plus" onClick={() => onChange(value + step)} sizePx={isHero?52:36}/>
    </div>
  );
}

// ─── 6. RestTimer ────────────────────────────────────────────────────────────
/**
 * Props :
 *   remaining  number   secondes restantes (contrôlé par le parent)
 *   total      number   durée initiale pour calcul %
 *   nextSet    { kg: number, reps: number, setNumber: number }
 *   onSkip     () => void
 *   onAddTime  (seconds: number) => void
 */
export function RestTimer({ remaining, total, nextSet, onSkip, onAddTime }) {
  const R    = 120;
  const CIRC = 2 * Math.PI * R;
  const pct  = total > 0 ? remaining / total : 0;
  const off  = CIRC * (1 - pct);
  const mm   = Math.floor(remaining / 60);
  const ss   = String(remaining % 60).padStart(2, '0');

  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      justifyContent:'center', alignItems:'center',
      padding:'0 18px',
      animation:'fm-fadeUp 0.35s ease',
    }}>
      {/* Label */}
      <div style={{ fontFamily:MONO, fontSize:9.5, fontWeight:600, color:T.ac,
        letterSpacing:'1.6px', textTransform:'uppercase', marginBottom:14 }}>
        RÉCUPÉRATION
      </div>

      {/* Ring */}
      <div style={{ position:'relative', width:300, height:300 }}>
        {/* Halo respirant */}
        <div style={{
          position:'absolute', inset:0, borderRadius:'50%',
          background:`radial-gradient(closest-side, ${T.acGlow}, transparent 72%)`,
          filter:'blur(24px)',
          animation:'fm-breathe 2.4s ease-in-out infinite',
        }}/>

        <svg width="300" height="300" viewBox="0 0 300 300"
          style={{ position:'relative', transform:'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="150" cy="150" r={R}
            stroke="rgba(178,190,210,0.08)" strokeWidth="11" fill="none"/>
          {/* Gradient def */}
          <defs>
            <linearGradient id="fm-rg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%"   stopColor={T.acLt}/>
              <stop offset="100%" stopColor={T.acDk}/>
            </linearGradient>
          </defs>
          {/* Progress arc */}
          <circle cx="150" cy="150" r={R}
            stroke="url(#fm-rg)" strokeWidth="11" fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={off}
            style={{ transition:'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Center content */}
        <div style={{
          position:'absolute', inset:0,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize:   86,
            fontWeight: 400,
            color:      T.t1,
            letterSpacing: '-3px',
            lineHeight: 0.85,
            ...NUM,
          }}>
            {mm}:{ss}
          </div>
          <div style={{
            fontFamily: MONO, fontSize:9, fontWeight:500, color:T.t4,
            letterSpacing:'1.8px', textTransform:'uppercase', marginTop:8,
          }}>
            PROCHAINE · SÉRIE {nextSet?.setNumber}
          </div>
          <div style={{
            fontFamily: MONO, fontSize:13, fontWeight:600, color:T.acLt,
            marginTop:3, ...NUM,
          }}>
            {nextSet?.kg}kg × {nextSet?.reps}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginTop:34, display:'flex', alignItems:'center', gap:12 }}>
        <WorkoutActionButton
          variant="glass"
          label="+15s"
          icon="plus"
          onPress={() => onAddTime(15)}
        />
        <WorkoutActionButton
          variant="secondary"
          label="Série suivante"
          icon="skip"
          onPress={onSkip}
        />
      </div>

      {/* Vibration hint */}
      <div style={{ marginTop:18, display:'flex', alignItems:'center', gap:7 }}>
        <span style={{
          width:5, height:5, borderRadius:'50%',
          background:T.ac,
          animation:'fm-pulseDot 1.6s ease-in-out infinite',
        }}/>
        <span style={{ fontFamily:FONT, fontSize:11, color:T.t4 }}>
          Vibration à la fin du repos
        </span>
      </div>
    </div>
  );
}

// ─── 7. CoachInsight ─────────────────────────────────────────────────────────
/**
 * Props :
 *   message     string
 *   variant     'card' | 'pill-info' | 'pill-bump'
 *   animDelay   number (ms)  — délai fadeUp, défaut 0
 */
export function CoachInsight({ message, variant='card', animDelay=0 }) {

  if (variant === 'pill-bump') {
    return (
      <span style={{
        display:'inline-flex', alignItems:'center', gap:6,
        padding:'6px 11px', borderRadius:999,
        background:T.acSoft, border:`1px solid ${T.bdAc}`,
      }}>
        <Icon n="spark" size={10} c={T.acLt} s={2}/>
        <span style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color:T.acLt, ...NUM }}>
          {message}
        </span>
      </span>
    );
  }

  if (variant === 'pill-info') {
    return (
      <span style={{
        display:'inline-flex', alignItems:'center', gap:6,
        padding:'6px 11px', borderRadius:999,
        background:T.surf, border:`1px solid ${T.bd}`,
      }}>
        <Icon n="clock" size={10} c={T.t4} s={1.9}/>
        <span style={{ fontFamily:MONO, fontSize:10, color:T.t3, ...NUM }}>
          {message}
        </span>
      </span>
    );
  }

  // 'card' — bilan complet
  return (
    <div style={{
      ...GLASS,
      padding:'14px 15px',
      display:'flex', gap:12, alignItems:'flex-start',
      animation:`fm-fadeUp 0.5s ease both ${animDelay}ms`,
    }}>
      {/* Avatar */}
      <div style={{
        width:32, height:32, borderRadius:10,
        background: GRAD_AVATAR,
        display:'grid', placeItems:'center',
        flexShrink:0,
        boxShadow:`0 4px 12px ${T.acGlow}`,
      }}>
        <Icon n="spark" size={16} c={T.t1} s={1.9}/>
      </div>
      <div>
        <div style={{
          fontFamily:MONO, fontSize:9, fontWeight:600, color:T.acLt,
          letterSpacing:'1.6px', textTransform:'uppercase',
        }}>
          COACH IA
        </div>
        <div style={{
          fontFamily:FONT, fontSize:12.5, color:T.t1, marginTop:5, lineHeight:1.5,
        }}>
          {message}
        </div>
      </div>
    </div>
  );
}

// ─── 8. ExerciseCompletionCard ───────────────────────────────────────────────
/**
 * Props :
 *   exerciseName    string
 *   sets            Array<{ kg: number, reps: number, rpe?: number }>
 *   volumeTotal     number
 *   prRecord        number | null
 *   vsLastPercent   string | null   — ex. "+3%"
 *   onNextExercise  () => void
 *   onShare         () => void | null
 *   coachMessage    string | null
 */
export function ExerciseCompletionCard({
  exerciseName,
  sets = [],
  volumeTotal = 0,
  prRecord = null,
  vsLastPercent = null,
  onNextExercise,
  onShare = null,
  coachMessage = null,
}) {
  const stats = [
    { ic:'flame', l:'VOLUME',     v: volumeTotal.toLocaleString('fr-FR'), u:'kg'  },
    prRecord
      ? { ic:'award', l:'NOUVEAU PR',  v: String(prRecord), u:'kg' }
      : { ic:'award', l:'SÉRIES',      v: String(sets.length), u:'' },
    vsLastPercent
      ? { ic:'trend', l:'VS DERNIÈRE', v: vsLastPercent, u:'' }
      : null,
  ].filter(Boolean);

  return (
    <div
      className="scroll-y"
      style={{ flex:1, padding:'10px 18px 30px', overflowY:'auto',
        WebkitOverflowScrolling:'touch', scrollbarWidth:'none' }}
    >
      {/* Check circle animé */}
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        textAlign:'center', marginTop:18,
      }}>
        <div style={{
          position:'relative', width:104, height:104,
          display:'grid', placeItems:'center',
        }}>
          {/* Ring pulsant */}
          <span style={{
            position:'absolute', inset:0, borderRadius:'50%',
            border:`2px solid ${T.ac}`,
            animation:'fm-ringPulse 1.6s ease-out infinite',
          }}/>
          {/* Circle check */}
          <div style={{
            width:84, height:84, borderRadius:'50%',
            background: GRAD_AVATAR,
            display:'grid', placeItems:'center',
            boxShadow: SHADOW_CHECK,
            animation:'fm-popCheck 0.5s cubic-bezier(.2,.8,.2,1)',
          }}>
            <Icon n="check" size={42} s={2.6} c={T.t1}/>
          </div>
        </div>

        {/* Eyebrow */}
        <div style={{
          fontFamily:MONO, fontSize:9.5, fontWeight:600, color:T.ac,
          letterSpacing:'1.6px', textTransform:'uppercase',
          marginTop:22,
          animation:'fm-fadeUp 0.5s ease both 100ms',
        }}>
          EXERCICE TERMINÉ
        </div>

        {/* Titre */}
        <div style={{
          fontFamily:SERIF, fontSize:34, color:T.t1,
          marginTop:8, letterSpacing:'-1.1px',
          animation:'fm-fadeUp 0.5s ease both 180ms',
        }}>
          {sets.length} séries,{' '}
          <span style={{ fontStyle:'italic', color:T.acLt }}>bouclées.</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display:'flex', gap:8, marginTop:24,
        animation:'fm-fadeUp 0.5s ease both 260ms',
      }}>
        {stats.map(s => (
          <div key={s.l} style={{ flex:1, ...GLASS, padding:'14px 12px' }}>
            <Icon n={s.ic} size={14} c={T.acLt} s={1.8}/>
            <div style={{
              fontFamily:MONO, fontSize:8, fontWeight:500, color:T.t4,
              letterSpacing:'1.8px', textTransform:'uppercase',
              marginTop:8,
            }}>
              {s.l}
            </div>
            <div style={{
              display:'flex', alignItems:'baseline', gap:3, marginTop:4,
            }}>
              <span style={{
                fontFamily:FONT, fontSize:19, fontWeight:700,
                color:T.t1, letterSpacing:-0.5, ...NUM,
              }}>
                {s.v}
              </span>
              {s.u && (
                <span style={{ fontFamily:MONO, fontSize:9, color:T.t4 }}>{s.u}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Coach insight */}
      {coachMessage && (
        <div style={{ marginTop:14, animation:'fm-fadeUp 0.5s ease both 340ms' }}>
          <CoachInsight message={coachMessage} variant="card" animDelay={0}/>
        </div>
      )}

      {/* Récap séries */}
      <div style={{
        marginTop:14, ...GLASS, padding:'4px 14px',
        animation:'fm-fadeUp 0.5s ease both 400ms',
      }}>
        {sets.map((s, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px 0',
            borderBottom: i < sets.length-1 ? `1px solid ${T.bd}` : 'none',
          }}>
            <span style={{ fontFamily:FONT, fontSize:13, fontWeight:700, color:T.t3 }}>
              Série {i+1}
            </span>
            <span style={{ fontFamily:MONO, fontSize:13, fontWeight:600, color:T.t1, ...NUM }}>
              {s.kg} kg × {s.reps}
            </span>
            <span style={{
              width:22, height:22, borderRadius:7,
              background:T.acSoft, border:`1px solid ${T.bdAc}`,
              display:'grid', placeItems:'center', color:T.acLt,
            }}>
              <Icon n="check" size={12} s={2.8}/>
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{
        marginTop:16, display:'flex', gap:8,
        animation:'fm-fadeUp 0.5s ease both 460ms',
      }}>
        {onShare && (
          <button className="fm-tap" onClick={onShare} style={{
            width:52, borderRadius:14, ...GLASS,
            color:T.t2, display:'grid', placeItems:'center',
            border:'none', cursor:'pointer',
          }}>
            <Icon n="share" size={17} s={1.8}/>
          </button>
        )}
        <WorkoutActionButton
          variant="secondary"
          label="Exercice suivant"
          icon="chevR"
          iconSide="right"
          fullWidth
          onPress={onNextExercise}
        />
      </div>
    </div>
  );
}
