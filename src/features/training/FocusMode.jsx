import { C } from"../../data/constants.js";
import useScrollTop from"../../hooks/useScrollTop.js";
/**
 * FocusMode.jsx
 * Portal vers document.body → couvre TOUT l'écran (header app + bottom nav compris).
 * Espacement généreux, safe-area iPhone, structure exacte de la maquette.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from"react";
import { createPortal }                 from"react-dom";
import { addXP, XP }                   from"../../services/xpService.js";
import { saveExoFeedback }             from"../../services/coachBrainService.js";
import { chargeDepart, getChargeRecommandee } from"../../services/progressionService.js";
import { getVariantes, evaluerDouleur } from"../../services/substitutionService.js";
import { syncWorkoutDay, syncExoFeedback } from"../../services/syncService.js";
import {
  T, F, MON, NUM, GL, CSS, I,
  SetStage, RestStage, DoneStage,
} from"./components/FocusModeStages.jsx";

const REST_DEFAULT = 90;

// ── FocusMode — Portal vers document.body ────────────────────────────────────
export default function FocusMode({
  seance, checkedEx, toggleCheck, semaineCycle,
  prog, setProg, push, C, INT, EX, todayKey, premium, onClose,
}) {
  useScrollTop();
  const semaine    = Number(semaineCycle) || 1;   // semaine du mésocycle en cours
  const exercices  = seance?.exercices || [];
  const [exIdx,  setExIdx] = useState(0);
  // Substitution valable pour CETTE séance seulement : { [index]: {nom,groupe,mat} }
  const [substitue, setSubstitue] = useState({});
  const [sheetVar,  setSheetVar]  = useState(false);
  const [verdict,   setVerdict]   = useState(null);
  const exBase    = exercices[exIdx] || null;
  // L'exercice courant est le substitut s'il y en a un : tout le reste de la
  // séance (charge, historique, feedback) doit porter sur le VRAI mouvement fait.
  const ex        = substitue[exIdx]
    ? { ...exBase, nom: substitue[exIdx].nom, _substitue: true }
    : exBase;
  const totalSets = ex ? (parseInt(ex.series) || 4) : 4;

  const [phase,      setPhase]     = useState('set');
  const [setIdx,     setSetIdx]    = useState(0);
  // Charge de départ : recommandation calculée sur les séries validées si elle
  // existe, sinon la prescription du programme. parseFloat("70-75% 1RM")
  // renvoyait 70 → l'app proposait 70 kg pour une consigne en pourcentage.
  const [kg, setKg] = useState(() => chargeDepart(ex, prog?.objectif).kg ?? 20);
  const [reps,       setReps]      = useState(() => parseInt(ex?.reps)    || 10);
  const [loggedSets, setLoggedSets]= useState([]);
  const [elapsed,  setElapsed]  = useState(0);  // chrono séance globale
  const [rest,     setRest]     = useState(REST_DEFAULT);  // countdown repos

  // Recommandation de charge pour l'exercice courant (déterministe, pas d'IA).
  const reco = useMemo(
    () => getChargeRecommandee(ex?.nom, { objectif: prog?.objectif, repsPrescrites: ex?.reps }),
    [ex?.nom, ex?.reps, prog?.objectif]
  );

  // À chaque changement d'exercice, repartir de la charge recommandée.
  useEffect(() => {
    const d = chargeDepart(ex, prog?.objectif);
    if (d.kg != null) setKg(d.kg);
    setReps(parseInt(ex?.reps) || 10);
  }, [exIdx]);

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
    if (phase !=='rest') return;
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

  const handleFeedback = useCallback((fb) => {
    if (!ex?.nom) return;
    // Évaluation AVANT enregistrement : sinon le feedback du jour entrerait
    // dans l'historique auquel on le compare, et « aggravation » ne serait
    // jamais détectée.
    if (typeof fb?.pain === "number" && fb.pain > 0) {
      setVerdict(evaluerDouleur(ex.nom, fb.pain, {
        semaine,
        chargeActuelle: kg,
      }));
    }
    saveExoFeedback(ex.nom, fb);
    syncExoFeedback(ex.nom, fb);                  // journal Supabase — silencieux
  }, [ex?.nom, kg, semaine]);

  // Variantes du mouvement courant : même groupe, matériel disponible,
  // contre-indications morpho exclues, exercices déjà au programme écartés.
  const variantes = useMemo(() => getVariantes(ex?.nom, {
    materiel:  prog?.materiel || [],
    niveau:    prog?.niveau || "intermediaire",
    exclure:   exercices.map(e => e?.nom).filter(Boolean),
    interdits: prog?.analyse?.exercices_interdits || [],
    correctifsOK: verdict?.action === "stop",
    max: 4,
  }), [ex?.nom, prog?.materiel, prog?.niveau, verdict?.action]);

  /** Remplace l'exercice courant pour cette séance et repart à la série 1. */
  const remplacerPar = useCallback((v) => {
    setSubstitue(s => ({ ...s, [exIdx]: { nom: v.n, groupe: v.groupe, mat: v.mat } }));
    setSheetVar(false);
    setVerdict(null);
    setLoggedSets([]);
    setSetIdx(0);
    setPhase('set');
  }, [exIdx]);

  /** Applique la charge allégée proposée par l'évaluation de la douleur. */
  const appliquerAllegement = useCallback(() => {
    if (verdict?.chargeSuggeree) setKg(verdict.chargeSuggeree);
    setVerdict(null);
  }, [verdict]);

  function nextExercise() {
    const n = exIdx + 1;
    if (n < exercices.length) { setExIdx(n); }
    else {
      saveWorkoutLog();
      // ── +250 XP pour séance terminée ──
      addXP(XP.SESSION_COMPLETE,'SESSION_COMPLETE');
      push?.("","Séance terminée !",`${exercices.length} exercice${exercices.length!==1?'s':''} complétés.`);
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
      seanceNom:   seance?.nom ||'Séance',
      seanceId:    seance?.id  ||'',
      sets:        workoutSetsRef.current,
      totalVolume,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem('morpho_workout_log', JSON.stringify(existing));
    syncWorkoutDay(dateKey, existing[dateKey]);   // journal Supabase — silencieux
  }, [seance]);

  const mm2 = String(Math.floor(elapsed/60)).padStart(2,'0');
  const ss2 = String(elapsed%60).padStart(2,'0');

  // Sauvegarde aussi si l'utilisateur ferme manuellement en cours de séance
  const handleClose = useCallback(() => {
    saveWorkoutLog();
    onClose();
  }, [saveWorkoutLog, onClose]);

  const lastEntry    = ex?.historique?.[ex.historique.length - 1];
  const lastSetLabel = lastEntry ?`Dernière ${lastEntry.poids}×${lastEntry.reps}` : null;
  const kgDelta      = lastEntry
    ? +(kg - parseFloat(lastEntry.poids || 0)).toFixed(1)
    : null;
  const restSecs     = parseInt(String(ex?.repos || REST_DEFAULT).replace(/\D/g,'')) || REST_DEFAULT;
  const coachMsg     = loggedSets.length > 0
    ?`${loggedSets.length} séries bouclées. Beau travail, continue.`
    : null;

  const content = (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0,
                  zIndex:360, background:T.bg,
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
            style={{ width:40, height:40, borderRadius:12, ...GL,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, border:'none' }}>
            <I n="x" sz={17}/>
          </button>
          <div style={{ textAlign:'center', flex:1, padding:'0 12px' }}>
            <div style={{ fontFamily:F, fontSize:20, fontWeight:700,
                          color:T.t1, letterSpacing:-0.5, lineHeight:1.2 }}>
              {ex ? ex.nom :'—'}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                          gap:8, marginTop:8 }}>
              <span style={{ fontFamily:MON, fontSize:10, fontWeight:500, color:T.t4,
                             letterSpacing:"0.1em", textTransform:'uppercase' }}>
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
            style={{ width:40, height:40, borderRadius:12, ...GL,
                     color:T.t2, display:'grid', placeItems:'center',
                     padding:0, border:'none' }}>
            <I n="book" sz={17} s={1.6}/>
          </button>
        </div>

        {/* Dots séries */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                      gap:8, marginTop:20, paddingBottom:4 }}>
          {Array.from({ length:totalSets }).map((_,i) => {
            const isDone = i < loggedSets.length;
            const isCur  = i === Math.min(setIdx, totalSets-1) && phase !=='done';
            return (
              <span key={i} style={{
                display:'block',
                width:isCur?26:10, height:10, borderRadius:8,
                background:isDone?T.ac:isCur?T.acLt:'rgba(178,190,210,0.18)',
                boxShadow:isCur?`0 0 10px ${T.acGlow}`:'none',
                transition:'all .3s',
              }}/>
);
          })}
        </div>

        {/* ── Barre d'actions rapides : Guide · Tip coach · Historique ── */}
        {phase ==='set' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr',
                        gap:8, marginTop:16 }}>
            {/* Variante — machine occupée, matériel absent, ou simple envie de
                changer. Aucun appel IA : tout vient du catalogue local. */}
            <button className="fm-tap" onClick={() => setSheetVar(true)}
              disabled={!variantes.length}
              style={{ background:T.surf, border:`1px solid ${T.bd}`,
                       boxShadow: C.shadow, opacity: variantes.length ? 1 : .4,
                       padding:'12px 8px', borderRadius:16,
                       display:'flex', flexDirection:'column', alignItems:'center',
                       gap:8, cursor: variantes.length ? 'pointer' : 'default' }}>
              <span style={{ width:32, height:32, borderRadius:12,
                             background:T.acSoft, color:T.ac,
                             display:'grid', placeItems:'center' }}>
                <I n="swap" sz={16}/>
              </span>
              <span style={{ fontFamily:F, fontSize:13, fontWeight:600, color:T.t1 }}>
                Variante
              </span>
            </button>

            <button className="fm-tap" onClick={() => setShowGuide(true)}
              style={{ background:T.surf, border:`1px solid ${T.bd}`,
                       boxShadow: C.shadow,
                       padding:'12px 8px', borderRadius:16,
                       display:'flex', flexDirection:'column', alignItems:'center',
                       gap:8, cursor:'pointer' }}>
              <span style={{ width:32, height:32, borderRadius:12,
                             background:T.acSoft, color:T.ac,
                             display:'grid', placeItems:'center' }}>
                <I n="play" sz={16}/>
              </span>
              <span style={{ fontFamily:F, fontSize:13, fontWeight:600, color:T.t1 }}>
                Guide
              </span>
            </button>

            <button className="fm-tap" onClick={() => setShowTip(v => !v)}
              style={{ background:T.surf, border:`1px solid ${T.bd}`,
                       boxShadow: C.shadow,
                       padding:'12px 8px', borderRadius:16,
                       display:'flex', flexDirection:'column', alignItems:'center',
                       gap:8, cursor:'pointer' }}>
              <span style={{ width:32, height:32, borderRadius:12,
                             background:'rgba(245,158,11,0.12)', color:'#F59E0B',
                             display:'grid', placeItems:'center' }}>
                <I n="bulb" sz={16} s={2}/>
              </span>
              <span style={{ fontFamily:F, fontSize:13, fontWeight:600, color:T.t1 }}>
                Tip coach
              </span>
            </button>

            <button className="fm-tap" onClick={() => setShowHisto(true)}
              style={{ background:T.surf, border:`1px solid ${T.bd}`,
                       boxShadow: C.shadow,
                       padding:'12px 8px', borderRadius:16,
                       display:'flex', flexDirection:'column', alignItems:'center',
                       gap:8, cursor:'pointer' }}>
              <span style={{ width:32, height:32, borderRadius:12,
                             background:'rgba(60,91,255,0.12)', color:'#3C5BFF',
                             display:'grid', placeItems:'center' }}>
                <I n="pulse" sz={16} s={2}/>
              </span>
              <span style={{ fontFamily:F, fontSize:13, fontWeight:600, color:T.t1 }}>
                Historique
              </span>
            </button>
          </div>
)}

        {/* ── Card Dernière séance ── */}
        {phase ==='set' && (
          <div style={{ marginTop:12, padding:'12px 16px',
                        background:T.surf, border:`1px solid ${T.bd}`,
                        boxShadow: C.shadow,
                        borderRadius:16,
                        display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:12,
                          background:'linear-gradient(135deg,#3C5BFF,#9DB0FF)',
                          color:'#FFF', display:'grid', placeItems:'center',
                          flexShrink:0 }}>
              <I n="pulse" sz={16} s={2}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:MON, fontSize:10, color:T.t3,
                            textTransform:'uppercase', letterSpacing:'0.1em',
                            fontWeight:600, marginBottom:2 }}>
                {lastEntry
                  ?`Dernière séance${lastEntry.date ?' ·'+lastEntry.date :''}`
                  :'Dernière séance'}
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
              {/* Substitution active pour cette séance */}
              {ex?._substitue && (
                <div style={{ marginTop:8, fontFamily:F, fontSize:11.5, fontWeight:600,
                              color:C.amber || '#F5A100' }}>
                  Remplace « {exBase?.nom} » pour cette séance
                </div>
              )}

              {/* Recommandation de charge — calculée sur les séries validées,
                  pas par l'IA : elle s'applique dès la 2e séance. */}
              {reco.available && (
                <div style={{ marginTop:8, paddingTop:8,
                              borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                    <span style={{ fontFamily:MON, fontSize:10, letterSpacing:'0.1em',
                                   textTransform:'uppercase', fontWeight:700,
                                   color: reco.action==='augmenter' ? C.green
                                        : reco.action==='reduire'   ? C.amber || '#F5A100' : T.t3 }}>
                      {reco.action==='augmenter' ? 'Objectif du jour'
                       : reco.action==='reduire' ? 'Charge à alléger' : 'On consolide'}
                    </span>
                    <span style={{ fontFamily:MON, fontSize:13, fontWeight:800, color:T.t1 }}>
                      {reco.kg} kg
                    </span>
                    {reco.delta !== 0 && (
                      <span style={{ fontFamily:MON, fontSize:11, fontWeight:700,
                                     color: reco.delta>0 ? C.green : (C.amber||'#F5A100') }}>
                        {reco.delta>0?'+':''}{reco.delta}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily:F, fontSize:11.5, color:T.t3, lineHeight:1.45 }}>
                    {reco.raison}
                  </div>
                </div>
)}
            </div>
            {lastEntry && kgDelta !== null && (
              <div style={{ fontFamily:MON, fontSize:11, fontWeight:700,
                            color: kgDelta >= 0 ? C.green : C.red,
                            background: kgDelta >= 0
                              ?'rgba(18,183,106,0.12)'
                              :'rgba(229,72,77,0.12)',
                            padding:'4px 8px', borderRadius:8,
                            flexShrink:0, ...NUM }}>
                {kgDelta > 0 ?'+' :''}{kgDelta} {kgDelta >= 0 ?'↗' :'↘'}
              </div>
)}
          </div>
)}

        {/* ── Bandeau Tip coach (toggle) ── */}
        {phase ==='set' && showTip && (
          <div style={{ marginTop:12, padding:'12px 12px',
                        background:'linear-gradient(135deg,rgba(254,243,199,0.65) 0%,rgba(254,249,232,0.65) 100%)',
                        border:'1px solid rgba(245,158,11,0.25)',
                        borderRadius:16,
                        display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ width:26, height:26, borderRadius:8,
                          background:'linear-gradient(135deg,#F59E0B,#F59E0B)',
                          color:'#FFF', display:'grid', placeItems:'center',
                          flexShrink:0 }}>
              <I n="spark" sz={13} s={2}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:MON, fontSize:10, color:'#F59E0B',
                            textTransform:'uppercase', letterSpacing:'0.1em',
                            fontWeight:600, marginBottom:2 }}>
                Tip du coach
              </div>
              <div style={{ fontFamily:F, fontSize:13, color:'#F59E0B',
                            lineHeight:1.4 }}>
                {ex?.tip ||'Garde la position de référence : omoplates serrées, gainage actif, amplitude contrôlée.'}
              </div>
            </div>
            <button onClick={() => setShowTip(false)}
              style={{ background:'none', border:'none', color:'#F59E0B',
                       padding:2, cursor:'pointer', display:'grid', placeItems:'center' }}>
              <I n="x" sz={14} s={2}/>
            </button>
          </div>
)}
      </div>

      {/* ── Stage — enfant direct du flex root ── */}
      {(phase ==='set' || phase ==='flash') && (
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
      {phase ==='rest' && (
        <RestStage
          rest={rest} total={restSecs}
          nextKg={kg} nextReps={reps}
          nextNum={Math.min(setIdx+1, totalSets)}
          onSkip={() => { clearInterval(restRef.current); setPhase('set'); }}
          onAdd={s => setRest(r => r+s)}
        />
)}
      {phase ==='done' && (
        <DoneStage
          loggedSets={loggedSets}
          onNextExercise={nextExercise}
          onFeedback={handleFeedback}
          coachMsg={coachMsg}
          premium={premium}
        />
)}

      {/* ── Verdict douleur — réponse graduée, jamais binaire ── */}
      {verdict && verdict.titre && (
        <div style={{ position:'absolute', inset:0, zIndex:70,
                      background:'rgba(16,19,24,0.55)',
                      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
                      display:'flex', alignItems:'flex-end', justifyContent:'center',
                      animation:'fm-fadeUp .25s ease both' }}>
          <div style={{ width:'100%', maxWidth:460, background:T.surf,
                        borderRadius:'24px 24px 0 0', padding:'22px 20px 26px',
                        borderTop:`3px solid ${verdict.severite==='critique' ? C.red
                                   : verdict.severite==='attention' ? (C.amber||'#F5A100') : T.ac}` }}>
            <div style={{ fontFamily:MON, fontSize:10.5, letterSpacing:'0.1em',
                          textTransform:'uppercase', fontWeight:700, marginBottom:6,
                          color: verdict.severite==='critique' ? C.red
                               : verdict.severite==='attention' ? (C.amber||'#F5A100') : T.t3 }}>
              {verdict.severite==='critique' ? 'Douleur vive'
               : verdict.tendance==='aggravation' ? 'La gêne augmente' : 'Ressenti signalé'}
            </div>
            <div style={{ fontFamily:F, fontSize:19, fontWeight:800, color:T.t1,
                          lineHeight:1.25, marginBottom:10 }}>
              {verdict.titre}
            </div>
            <div style={{ fontFamily:F, fontSize:13.5, fontWeight:500, color:T.t2,
                          lineHeight:1.6, marginBottom:18 }}>
              {verdict.message}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {verdict.chargeSuggeree && (
                <button onClick={appliquerAllegement}
                  style={{ width:'100%', padding:14, borderRadius:14, border:'none',
                           background:T.ac, color:'#FFF', cursor:'pointer',
                           fontFamily:F, fontSize:15, fontWeight:800 }}>
                  Passer à {verdict.chargeSuggeree} kg
                </button>
              )}
              {verdict.proposerVariante && variantes.length > 0 && (
                <button onClick={() => { setVerdict(null); setSheetVar(true); }}
                  style={{ width:'100%', padding:14, borderRadius:14,
                           border:`1px solid ${T.bd}`, background:T.surfFlat||T.surf,
                           color:T.t1, cursor:'pointer',
                           fontFamily:F, fontSize:15, fontWeight:700 }}>
                  Choisir un exercice de remplacement
                </button>
              )}
              <button onClick={() => setVerdict(null)}
                style={{ width:'100%', padding:12, borderRadius:14, border:'none',
                         background:'transparent', color:T.t3, cursor:'pointer',
                         fontFamily:F, fontSize:13.5, fontWeight:600 }}>
                {verdict.action === 'stop' ? 'Fermer' : 'Continuer sans changer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feuille variantes ── */}
      {sheetVar && (
        <div onClick={() => setSheetVar(false)}
          style={{ position:'absolute', inset:0, zIndex:65,
                   background:'rgba(16,19,24,0.5)',
                   backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
                   display:'flex', alignItems:'flex-end', justifyContent:'center',
                   animation:'fm-fadeUp .25s ease both' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:460, background:T.surf,
                     borderRadius:'24px 24px 0 0', padding:'20px 20px 26px' }}>
            <div style={{ width:38, height:5, borderRadius:99, background:T.bd,
                          margin:'0 auto 16px' }}/>
            <div style={{ fontFamily:F, fontSize:18, fontWeight:800, color:T.t1,
                          marginBottom:4 }}>
              Remplacer cet exercice
            </div>
            <div style={{ fontFamily:F, fontSize:12.5, color:T.t3, lineHeight:1.5,
                          marginBottom:16 }}>
              Même groupe musculaire, matériel dont tu disposes, contre-indications
              écartées. Le remplacement ne vaut que pour cette séance.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {variantes.map(v => (
                <button key={v.n} onClick={() => remplacerPar(v)}
                  style={{ width:'100%', textAlign:'left', padding:'13px 15px',
                           borderRadius:14, border:`1px solid ${T.bd}`,
                           background:T.surfFlat||'transparent', cursor:'pointer' }}>
                  <div style={{ fontFamily:F, fontSize:14.5, fontWeight:700, color:T.t1 }}>
                    {v.n}
                  </div>
                  <div style={{ fontFamily:F, fontSize:12, fontWeight:500, color:T.t3,
                                marginTop:2 }}>
                    {v.raison}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modale Guide vidéo / instructions ── */}
      {showGuide && (
        <div onClick={() => setShowGuide(false)}
          style={{ position:'absolute', inset:0, zIndex:60,
                   background:'rgba(16,19,24,0.5)',
                   backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
                   display:'flex', alignItems:'flex-end', justifyContent:'center',
                   animation:'fm-fadeUp .25s ease both' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:520, background:T.surf,
                     borderTopLeftRadius:28, borderTopRightRadius:28,
                     padding:'24px 22px max(28px,env(safe-area-inset-bottom,28px))',
                     boxShadow: C.shadow }}>
            <div style={{ width:36, height:4, borderRadius:2, background:T.bdHi,
                          margin:'0 auto 20px' }}/>
            <div style={{ fontFamily:F, fontSize:11, fontWeight:600, color:T.ac,
                          letterSpacing:"0.1em", textTransform:'uppercase',
                          marginBottom:8 }}>
              Guide
            </div>
            <h3 style={{ fontFamily:F, fontSize:20, fontWeight:700, color:T.t1,
                         margin:'0 0 16px', letterSpacing:-0.3 }}>
              {ex?.nom}
            </h3>
            <div style={{ aspectRatio:'16/9', borderRadius:16, background:T.surfFlat,
                          display:'grid', placeItems:'center',
                          border:`1px solid ${T.bd}`, marginBottom:16 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                            gap:8, color:T.t3 }}>
                <I n="skip" sz={32} c={T.t3} s={1.6}/>
                <span style={{ fontFamily:F, fontSize:13 }}>Vidéo à venir</span>
              </div>
            </div>
            <div style={{ fontFamily:F, fontSize:13, color:T.t2, lineHeight:1.6 }}>
              {ex?.instructions || ex?.tip ||"Position de départ, contrôle excentrique, amplitude complète. Garde le gainage et respire."}
            </div>
          </div>
        </div>
)}

      {/* ── Modale Historique ── */}
      {showHisto && (
        <div onClick={() => setShowHisto(false)}
          style={{ position:'absolute', inset:0, zIndex:60,
                   background:'rgba(16,19,24,0.5)',
                   backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
                   display:'flex', alignItems:'flex-end', justifyContent:'center',
                   animation:'fm-fadeUp .25s ease both' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:520, maxHeight:'75vh',
                     background:T.surf,
                     borderTopLeftRadius:28, borderTopRightRadius:28,
                     padding:'24px 22px max(28px,env(safe-area-inset-bottom,28px))',
                     boxShadow: C.shadow,
                     display:'flex', flexDirection:'column' }}>
            <div style={{ width:36, height:4, borderRadius:2, background:T.bdHi,
                          margin:'0 auto 20px' }}/>
            <div style={{ fontFamily:F, fontSize:11, fontWeight:600, color:'#3C5BFF',
                          letterSpacing:"0.1em", textTransform:'uppercase',
                          marginBottom:8 }}>
              Historique
            </div>
            <h3 style={{ fontFamily:F, fontSize:20, fontWeight:700, color:T.t1,
                         margin:'0 0 16px', letterSpacing:-0.3 }}>
              {ex?.nom}
            </h3>
            <div style={{ flex:1, overflowY:'auto', display:'flex',
                          flexDirection:'column', gap:8 }}>
              {(ex?.historique || []).length === 0 && (
                <div style={{ fontFamily:F, fontSize:13, color:T.t3,
                              textAlign:'center', padding:'32px 0' }}>
                  Pas encore d'historique sur cet exercice.
                </div>
)}
              {(ex?.historique || []).slice().reverse().map((h, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center',
                                      justifyContent:'space-between',
                                      padding:'12px 16px', borderRadius:12,
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
                                  padding:'4px 8px', borderRadius:8 }}>
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

