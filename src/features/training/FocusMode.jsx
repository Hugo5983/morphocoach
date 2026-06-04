/**
 * FocusMode.jsx
 * ─────────────────────────────────────────────────────────────
 * State machine visuelle du mode focus entraînement.
 *
 * Props reçues du parent (TodayView) — AUCUNE logique métier ici :
 *   seance        object    — séance du jour (jours[i] ou calSess)
 *   checkedEx     object    — {`${id}-${idx}`: boolean}
 *   toggleCheck   function  — (seanceId, exIdx, repos, calKey) => void
 *   prog          object
 *   setProg       function
 *   push          function  — toast/notification
 *   C             object    — couleurs app existantes (non utilisées ici, préservées)
 *   INT           object    — intensités
 *   EX            object    — base d'exercices
 *   todayKey      string    — clé date "YYYY-MM-DD"
 *   onClose       function  — retour vers TodayView
 *
 * État local (présentation uniquement) :
 *   phase         'set' | 'flash' | 'rest' | 'done'
 *   setIdx        number    — indice de la série courante (0-based)
 *   kg            number    — charge affichée
 *   reps          number    — reps affichées
 *   rest          number    — secondes de récup restantes
 *   loggedSets    array     — {kg, reps} séries validées (présentation bilan)
 *   elapsed       number    — secondes de chrono global (affichage)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  InjectFocusKeyframes,
  WorkoutHeader,
  WorkoutProgress,
  WeightSelector,
  RepsSelector,
  WorkoutActionButton,
  RestTimer,
  CoachInsight,
  ExerciseCompletionCard,
} from "./components/FocusModeComponents.jsx";

const REST_DEFAULT = 90;
const T = {
  bg:      '#060912',
  surf:    '#0D1322',
  surfFlat:'#0A1020',
  bd:      'rgba(178,190,210,0.07)',
  t1:      '#F2F4F7',
  t3:      '#8A94A6',
  t4:      'rgba(138,148,166,0.62)',
  t5:      'rgba(138,148,166,0.32)',
  ac:      '#5B8DEF',
  acLt:    '#9CB9F5',
  acSoft:  'rgba(91,141,239,0.14)',
  acGlow:  'rgba(91,141,239,0.22)',
};
const FONT  = '"Space Grotesk","Inter",system-ui,sans-serif';
const MONO  = '"JetBrains Mono",ui-monospace,monospace';
const GLASS = {
  background: 'rgba(13,19,34,0.66)',
  backdropFilter: 'blur(22px) saturate(150%)',
  WebkitBackdropFilter: 'blur(22px) saturate(150%)',
  border: '1px solid rgba(178,190,210,0.10)',
  borderRadius: 20,
};

export default function FocusMode({
  seance,
  checkedEx,
  toggleCheck,
  prog,
  setProg,
  push,
  C,
  INT,
  EX,
  todayKey,
  onClose,
}) {
  const exercices    = seance?.exercices || [];
  const [exIdx, setExIdx]   = useState(0);   // exercice courant

  // ── Exercice actuel ──────────────────────────────────────────
  const ex = exercices[exIdx] || null;
  const totalSets = ex ? (parseInt(ex.series) || 4) : 4;

  // ── Phase & série ────────────────────────────────────────────
  const [phase,      setPhase]      = useState('set');   // set | flash | rest | done
  const [setIdx,     setSetIdx]     = useState(0);        // 0-based
  const [kg,         setKg]         = useState(() => parseFloat(ex?.charge) || 60);
  const [reps,       setReps]       = useState(() => parseInt(ex?.reps)   || 10);
  const [rest,       setRest]       = useState(REST_DEFAULT);
  const [loggedSets, setLoggedSets] = useState([]);       // [{kg, reps}]
  const [elapsed,    setElapsed]    = useState(0);        // secondes

  // ── Reset si l'exercice change ───────────────────────────────
  useEffect(() => {
    if (!ex) return;
    setPhase('set');
    setSetIdx(0);
    setKg(parseFloat(ex.charge) || 60);
    setReps(parseInt(ex.reps)   || 10);
    setRest(REST_DEFAULT);
    setLoggedSets([]);
  }, [exIdx]);

  // ── Chrono global ────────────────────────────────────────────
  const elapsedRef = useRef(null);
  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(elapsedRef.current);
  }, []);
  const elapsedFmt = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;

  // ── Timer de repos ───────────────────────────────────────────
  const restRef = useRef(null);
  useEffect(() => {
    if (phase !== 'rest') return;
    restRef.current = setInterval(() => {
      setRest(r => {
        if (r <= 1) { clearInterval(restRef.current); advance(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(restRef.current);
  }, [phase]);

  // ── Actions (présentation → délèguent la logique au parent) ─
  const validate = useCallback(() => {
    // 1. Logger la série visuellement
    setLoggedSets(s => [...s, { kg, reps }]);

    // 2. Flash animation
    setPhase('flash');

    // 3. Cocher l'exercice si toutes les séries sont faites (délègue à parent)
    const nextSetIdx = setIdx + 1;
    if (nextSetIdx >= totalSets) {
      toggleCheck(seance.id, exIdx, ex.repos, todayKey);
    }

    setTimeout(() => {
      if (nextSetIdx >= totalSets) {
        setPhase('done');
      } else {
        const restSecs = parseInt(String(ex?.repos || REST_DEFAULT).replace(/\D/g,'')) || REST_DEFAULT;
        setRest(restSecs);
        setPhase('rest');
      }
    }, 1100);

    setSetIdx(nextSetIdx);
  }, [kg, reps, setIdx, totalSets, ex, seance, exIdx, todayKey, toggleCheck]);

  const advance = useCallback(() => {
    if (setIdx >= totalSets) return;
    setPhase('set');
  }, [setIdx, totalSets]);

  const skipRest = useCallback(() => {
    clearInterval(restRef.current);
    advance();
  }, [advance]);

  const addRest = useCallback((secs) => {
    setRest(r => r + secs);
  }, []);

  const nextExercise = useCallback(() => {
    const nextIdx = exIdx + 1;
    if (nextIdx < exercices.length) {
      setExIdx(nextIdx);
    } else {
      push?.("✅", "Séance terminée !", `${exercices.length} exercices complétés.`);
      onClose();
    }
  }, [exIdx, exercices.length, push, onClose]);

  // ── Coach message contextuel ─────────────────────────────────
  const coachMsg = (() => {
    if (phase !== 'done') return null;
    const lastKg = loggedSets[loggedSets.length-1]?.kg;
    const prevEntry = ex?.historique?.[ex.historique.length-1];
    if (lastKg && prevEntry && lastKg > parseFloat(prevEntry.poids)) {
      return `Nouveau record à ${lastKg} kg 💪 Maintiens cette charge 2-3 séances avant d'augmenter.`;
    }
    return `${loggedSets.length} séries bouclées. Récup bien, tu continues sur une bonne lancée.`;
  })();

  const volumeTotal = loggedSets.reduce((a, s) => a + s.kg * s.reps, 0);
  const prRecord    = loggedSets.reduce((a, s) => Math.max(a, s.kg), 0) || null;

  // ── Contexte "prochaine série" pour le RestTimer ─────────────
  const nextSet = {
    kg:        kg,
    reps:      reps,
    setNumber: Math.min(setIdx + 1, totalSets),
  };

  // ── Indicateurs contextuels (CoachInsight pills) ─────────────
  const lastEntry    = ex?.historique?.[ex.historique.length-1];
  const lastSetLabel = lastEntry ? `Dernière ${lastEntry.poids}×${lastEntry.reps}` : null;
  const isIaBump     = ex?.historique?.length > 1
    ? kg > parseFloat(ex.historique[ex.historique.length-1]?.poids || 0)
    : false;

  if (!ex) {
    // Sécurité : aucun exercice dans la séance
    return (
      <div style={{ position:'fixed', inset:0, zIndex:600, background:T.bg,
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', padding:24 }}>
        <InjectFocusKeyframes/>
        <div style={{ fontFamily:FONT, color:T.t3, fontSize:14, textAlign:'center' }}>
          Aucun exercice dans cette séance.
        </div>
        <button onClick={onClose} style={{ marginTop:24, background:T.acSoft,
          border:`1px solid ${T.acLt}60`, borderRadius:14, padding:'12px 24px',
          color:T.acLt, fontFamily:FONT, fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: T.bg,
      display: 'flex', flexDirection: 'column',
    }}>
      <InjectFocusKeyframes/>

      {/* Halo ambiant centré */}
      <div style={{
        position:'absolute', top:100, left:'50%',
        transform:'translateX(-50%)',
        width:360, height:360, borderRadius:'50%',
        background:`radial-gradient(closest-side, ${T.acGlow}, transparent 70%)`,
        filter:'blur(50px)',
        pointerEvents:'none', zIndex:0,
      }}/>

      {/* ── Header ─── */}
      <div style={{ position:'relative', zIndex:10, flexShrink:0 }}>
        <WorkoutHeader
          exerciseName    = {ex.nom}
          exerciseIndex   = {exIdx + 1}
          totalExercises  = {exercices.length}
          elapsedTime     = {elapsedFmt}
          totalSets       = {totalSets}
          completedSets   = {Math.min(setIdx, totalSets)}
          currentSetIndex = {phase === 'done' ? totalSets - 1 : setIdx}
          phase           = {phase}
          onClose         = {onClose}
          onGuide         = {() => {}} /* Guide handler — brancher si besoin */
        />
      </div>

      {/* ── Corps central — switche selon la phase ─── */}
      <div style={{ flex:1, position:'relative', zIndex:5, overflow:'hidden' }}>

        {/* PHASE : DONE ───────────────────────────────────────── */}
        {phase === 'done' && (
          <ExerciseCompletionCard
            exerciseName   = {ex.nom}
            sets           = {loggedSets}
            volumeTotal    = {volumeTotal}
            prRecord       = {prRecord}
            vsLastPercent  = {null}
            coachMessage   = {coachMsg}
            onNextExercise = {nextExercise}
            onShare        = {null}
          />
        )}

        {/* PHASE : REST ───────────────────────────────────────── */}
        {phase === 'rest' && (
          <RestTimer
            remaining = {rest}
            total     = {parseInt(String(ex?.repos || REST_DEFAULT).replace(/\D/g,'')) || REST_DEFAULT}
            nextSet   = {nextSet}
            onSkip    = {skipRest}
            onAddTime = {addRest}
          />
        )}

        {/* PHASE : SET ou FLASH ───────────────────────────────── */}
        {(phase === 'set' || phase === 'flash') && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'0 18px', height:'100%' }}>

            {/* Flash overlay post-validation */}
            {phase === 'flash' && (
              <div style={{
                position:'absolute', inset:0, zIndex:40,
                display:'grid', placeItems:'center', pointerEvents:'none',
              }}>
                <div style={{
                  position:'absolute', inset:0,
                  background:`radial-gradient(circle at 50% 45%, ${T.acGlow}, transparent 60%)`,
                  animation:'fm-flashGlow 1.1s ease-out forwards',
                }}/>
                <div style={{ position:'relative', width:96, height:96, display:'grid', placeItems:'center' }}>
                  <span style={{
                    position:'absolute', inset:0, borderRadius:'50%',
                    border:`2px solid ${T.ac}`,
                    animation:'fm-ringPulse 1s ease-out',
                  }}/>
                  <div style={{
                    width:84, height:84, borderRadius:'50%',
                    background:`linear-gradient(160deg, ${T.acLt}, #2D5DC9)`,
                    display:'grid', placeItems:'center',
                    boxShadow:'0 10px 30px rgba(45,93,201,0.6)',
                    animation:'fm-popCheck 0.5s cubic-bezier(.2,.8,.2,1)',
                  }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none"
                      stroke={T.t1} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 12 5 5 11-12"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Contenu série */}
            <div style={{
              flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
              opacity: phase === 'flash' ? 0.25 : 1, transition:'opacity .3s',
            }}>
              {/* Label série courante */}
              <div style={{ textAlign:'center', marginBottom:26 }}>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:9,
                  padding:'7px 16px', borderRadius:999,
                  ...GLASS,
                }}>
                  <span style={{
                    width:7, height:7, borderRadius:'50%',
                    background:T.ac,
                    animation:'fm-pulseDot 1.6s ease-in-out infinite',
                    boxShadow:`0 0 8px ${T.ac}`,
                  }}/>
                  <span style={{
                    fontFamily:FONT, fontSize:14, fontWeight:700, color:T.t1, letterSpacing:0.2,
                  }}>
                    SÉRIE{' '}
                    <span style={{ color:T.acLt }}>{Math.min(setIdx + 1, totalSets)}</span>
                    {' '}<span style={{ color:T.t4, fontWeight:500 }}>/ {totalSets}</span>
                  </span>
                </div>
              </div>

              {/* Sélecteur charge */}
              <WeightSelector
                value    = {kg}
                onChange = {setKg}
                step     = {2.5}
                min      = {0}
                unit     = "kg"
                size     = "hero"
              />

              {/* Sélecteur reps */}
              <div style={{ marginTop:16 }}>
                <RepsSelector
                  value    = {reps}
                  onChange = {setReps}
                  step     = {1}
                  min      = {1}
                  size     = "hero"
                />
              </div>

              {/* Indicateurs contextuels (pills) */}
              <div style={{
                marginTop:22, display:'flex', alignItems:'center',
                justifyContent:'center', gap:8, flexWrap:'wrap',
              }}>
                {lastSetLabel && (
                  <CoachInsight message={lastSetLabel} variant="pill-info"/>
                )}
                {isIaBump && (
                  <CoachInsight message={`+2.5 kg suggéré`} variant="pill-bump"/>
                )}
              </div>
            </div>

            {/* ── Bouton VALIDER — ancré en bas ── */}
            <div style={{ flexShrink:0, paddingBottom:26 }}>
              <WorkoutActionButton
                variant   = "primary"
                label     = "VALIDER LA SÉRIE"
                icon      = "check"
                iconSide  = "left"
                fullWidth
                onPress   = {validate}
                disabled  = {phase === 'flash'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
