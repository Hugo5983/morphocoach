import { useState } from"react";
import { C, DARK, FONT, NUM, SERIF } from"../../data/constants.js";
import { Card, Eyebrow, Btn } from"../../components/ui/index.jsx";
import SeanceDetail from"./SeanceDetail.jsx";
import { calc1RM, calcKgFor, catColor as cc, toDateKey } from"../../utils/training.js";
import { ManualRMModal, CreateSeanceModal, EditRecordModal, RMCard, OBJ_TARGET, DEFAULT_TARGET } from"./components/TodayViewModals.jsx";
import RecordDetailPage from"./components/RecordDetailPage.jsx";
import FocusMode from"./FocusMode.jsx";

const DISP = FONT;
const SERIF_F = SERIF;

export default function TodayView(props) {
  const { prog, setProg, calSess, setCalSess, checkedEx, setCheckedEx,
    seance, setSeance, setChrono, setChronoSec,
    exDetails, setExDetails, exEdit, setExEdit,
    profil, EX, C: _C, INT, push, setProgView, setTab, premium } = props;

  const [viewSeance,       setViewSeance]       = useState(null);
  const [showManualRM,     setShowManualRM]      = useState(false);
  const [showCreateSeance, setShowCreateSeance]  = useState(false);
  const [tipIdx,             setTipIdx]             = useState(0);
  const [editRecord,       setEditRecord]        = useState(null);
  const [focusActive,      setFocusActive]       = useState(false);

  // ── Sommeil — target + log quotidien ────────────────────────────────────
  const [sleepTarget, setSleepTarget] = useState(() =>
    parseFloat(localStorage.getItem('morpho_sleep_target') ||'8')
);
  const [sleepLog, setSleepLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('morpho_sleep_log') ||'{}'); }
    catch { return {}; }
  });
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepInput, setSleepInput]   = useState(null); // valeur en cours d'édition dans la modal

  const saveSleepTarget = (v) => {
    const val = Math.round(v * 2) / 2; // arrondi 0.5
    setSleepTarget(val);
    localStorage.setItem('morpho_sleep_target', String(val));
  };
  const logSleepToday = (h) => {
    const key = new Date().toISOString().split('T')[0];
    const updated = { ...sleepLog, [key]: h };
    setSleepLog(updated);
    localStorage.setItem('morpho_sleep_log', JSON.stringify(updated));
  };
  const todaySleepLogged = sleepLog[new Date().toISOString().split('T')[0]] ?? null;

  // ── Mobilité — done/not-done par jour ───────────────────────────────────
  const [mobiliteLog, setMobiliteLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('morpho_mobilite_log') ||'{}'); }
    catch { return {}; }
  });
  const [mobiliteFlash, setMobiliteFlash] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMobilite = mobiliteLog[todayStr] ?? false;

  const toggleMobilite = () => {
    const newVal = !todayMobilite;
    const updated = { ...mobiliteLog, [todayStr]: newVal };
    setMobiliteLog(updated);
    localStorage.setItem('morpho_mobilite_log', JSON.stringify(updated));
    if (newVal) { setMobiliteFlash(true); setTimeout(() => setMobiliteFlash(false), 600); }
  };

  // ── Séance du jour ──────────────────────────────────────────────────────
  const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const today     = new Date();
  const todayKey  = toDateKey(today);
  const todayName = dayNames[today.getDay()];
  const calSeance = calSess?.[todayKey];

  const getTodaySeance = () => {
    if (!prog?.jours) return null;
    if (calSeance?.seanceId) {
      const found = prog.jours.find(j => j.id === calSeance.seanceId);
      if (found) return { ...found, _calKey: todayKey };
    }
    const found = prog.jours.find(j =>
      j.nom?.toLowerCase().includes(todayName.toLowerCase()) ||
      j.focus?.toLowerCase().includes(todayName.toLowerCase())
);
    return found ? { ...found, _calKey: todayKey } : null;
  };

  // ── Records RM ──────────────────────────────────────────────────────────
  const getRM = () => {
    if (!prog?.jours) return [];
    const map = {};
    const objectif = profil?.objectif ||"hypertrophie";
    const target   = OBJ_TARGET[objectif] || DEFAULT_TARGET;

    prog.jours.forEach(j => {
      (j.exercices || []).forEach(ex => {
        if (!ex.historique?.length) return;
        const nom = ex.nom;
        const best = ex.historique.reduce((a, b) =>
          calc1RM(parseFloat(a.poids), parseInt(a.reps)) >=
          calc1RM(parseFloat(b.poids), parseInt(b.reps)) ? a : b
);
        const rm1    = calc1RM(parseFloat(best.poids), parseInt(best.reps));
        const cible  = calcKgFor(rm1, target.reps);
        const dbEx   = EX ? Object.values(EX).flat().find(e => e.n === nom) : null;
        if (!map[nom] || map[nom].rm1 < rm1) {
          map[nom] = { nom, rm1, cible, best, dbEx, target, historique: ex.historique };
        }
      });
    });

    if (prog.records) {
      Object.entries(prog.records).forEach(([nom, history]) => {
        if (!history?.length) return;
        const best = history.reduce((a, b) =>
          calc1RM(parseFloat(a.poids), parseInt(a.reps)) >=
          calc1RM(parseFloat(b.poids), parseInt(b.reps)) ? a : b
);
        const rm1   = calc1RM(parseFloat(best.poids), parseInt(best.reps));
        const objectif = profil?.objectif ||"hypertrophie";
        const target   = OBJ_TARGET[objectif] || DEFAULT_TARGET;
        const cible = calcKgFor(rm1, target.reps);
        if (!map[nom] || map[nom].rm1 < rm1) {
          map[nom] = { nom, rm1, cible, best, target, historique: history };
        }
      });
    }
    return Object.values(map);
  };

  const toggleCheck = (seanceId, exIdx, repos, calKey) => {
    const key =`${seanceId}-${exIdx}`;
    setCheckedEx(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const REST_TIPS = [
    { icon:"", title:"Hydrate-toi bien", desc:"La récupération musculaire dépend de ton hydratation. Vise 2,5L aujourd'hui." },
    { icon:"", title:"Protéines++", desc:"Un apport élevé en protéines aujourd'hui accélère la reconstruction musculaire." },
    { icon:"", title:"8h de sommeil", desc:"80% des gains se font la nuit. Dors tôt, ton corps travaille pour toi." },
  ];

  const rmData       = prog ? getRM() : [];

  // Streak d'entraînements consécutifs depuis le log localStorage
  const streak = (() => {
    try {
      const log = JSON.parse(localStorage.getItem('morpho_workout_log') ||'{}');
      let count = 0;
      const d = new Date();
      while (count < 365) {
        const key = d.toISOString().split('T')[0];
        if (log[key]) { count++; d.setDate(d.getDate() - 1); }
        else if (count === 0) { d.setDate(d.getDate() - 1); if (count < 1) break; }
        else break;
      }
      return count;
    } catch { return 0; }
  })();
  const objectif     = profil?.objectif ||"hypertrophie";
  const currentTarget = OBJ_TARGET[objectif] || DEFAULT_TARGET;

  if (viewSeance) {
    return (
      <SeanceDetail
        seance={viewSeance} onBack={() => setViewSeance(null)}
        prog={prog} setProg={setProg}
        checkedEx={checkedEx} toggleCheck={toggleCheck}
        setChrono={setChrono} setChronoSec={setChronoSec}
        exDetails={exDetails} setExDetails={setExDetails}
        exEdit={exEdit} setExEdit={setExEdit}
        EX={EX} C={C} INT={INT}
        push={push}
      />
);
  }

  const todaySeance = getTodaySeance();

  // ── Focus Mode (overlay inline, remplace viewSeance) ──────────────────────
  if (focusActive && todaySeance) {
    return (
      <FocusMode
        seance      = {todaySeance}
        checkedEx   = {checkedEx}
        toggleCheck = {toggleCheck}
        prog        = {prog}
        setProg     = {setProg}
        push        = {push}
        C           = {C}
        INT         = {INT}
        EX          = {EX}
        todayKey    = {todayKey}
        premium     = {premium}
        onClose     = {() => setFocusActive(false)}
      />
);
  }

  return (
    <div style={{ padding:"0 20px" }}>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 8, marginBottom: 16 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily: SERIF_F, fontSize: 26, color: C.text, lineHeight: 1.1, letterSpacing: -1 }}>
              Séance du <span style={{ fontStyle:"italic", color: C.blue }}>jour</span>
            </div>
            {todaySeance && (
              <div style={{ fontSize:13, color:C.dim, fontFamily:DISP, marginTop:4 }}>
                Continue ta progression 
              </div>
)}
          </div>
          {streak > 0 && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
              background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.25)",
              borderRadius:16, padding:"8px 12px", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:16 }}></span>
                <span style={{ fontSize:20, fontWeight:700, color:"#F59E0B", fontFamily:DISP, lineHeight:1 }}>{streak}</span>
              </div>
              <div style={{ fontSize:10, fontWeight:600, color:"#F59E0B", fontFamily:DISP,
                letterSpacing:"0.1em", marginTop:2, textAlign:"center" }}>
                série actuelle
              </div>
            </div>
)}
        </div>
      </div>

      {/* ── Séance du jour ───────────────────────────────────────── */}
      {todaySeance ? (() => {
        const intData = INT[todaySeance.intensite ||"modere"] || INT.modere;
        const total   = todaySeance.exercices?.length || 0;
        const done    = todaySeance.exercices?.filter((_, i) => checkedEx[`${todaySeance.id}-${i}`]).length || 0;
        const pct     = total > 0 ? Math.round(done / total * 100) : 0;

        return (
          <>
            {/* Hero card — style HomePage, mannequin violet */}
            {(() => {
              const HERO_PURPLE ='data:image/webp;base64,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';
              return (
                <div style={{
                  margin:"0 0 16px", borderRadius: 28, position:"relative",
                  overflow:"hidden", background: DARK.bg,
                  boxShadow: C.shadow, minHeight: 260,
                }}>
                  {/* Mannequin violet */}
                  <img src={HERO_PURPLE} alt="" aria-hidden="true" style={{
                    position:"absolute", inset: 0, width:"100%", height:"100%",
                    objectFit:"cover", objectPosition:"center top",
                  }} />
                  {/* Dégradé overlay */}
                  <div style={{
                    position:"absolute", inset: 0, zIndex: 1, pointerEvents:"none",
                    background:"linear-gradient(95deg,rgba(1,2,10,0.97) 0%,rgba(1,2,10,0.85) 32%,rgba(1,2,10,0.65) 52%,rgba(1,2,10,0.25) 72%,rgba(1,2,10,0.12) 100%)",
                  }} />
                  {/* Contenu */}
                  <div style={{ position:"relative", zIndex: 2, padding:"24px 24px 32px" }}>
                    <div style={{ color: DARK.accent, fontSize: 14, fontWeight: 700, letterSpacing:"0.1em", fontFamily: FONT }}>
                      SÉANCE DU JOUR
                    </div>
                    <div style={{ color:"#FFF", fontSize: 34, fontWeight: 700, letterSpacing: -1, margin:"12px 0 16px", lineHeight: 1, fontFamily: FONT }}>
                      {todaySeance.nom}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap: 16, color: DARK.dim, fontSize: 16, fontWeight: 600, marginBottom: 20, fontFamily: FONT }}>
                      <span style={{ display:"flex", alignItems:"center", gap: 8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK.dim} strokeWidth="2">
                          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/>
                        </svg>
                        {todaySeance.duree ||"45-60 min"}
                      </span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span style={{ display:"flex", alignItems:"center", gap: 8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK.dim} strokeWidth="2" strokeLinecap="round">
                          <path d="M6 8v8M18 8v8M4 10v4M20 10v4M6 12h12"/>
                        </svg>
                        {total} exercice{total !== 1 ?"s" :""}
                      </span>
                    </div>
                    {/* CTA — position absolute bas gauche */}
                    {!todaySeance.complete ? (
                      <button onClick={() => setFocusActive(true)} style={{
                        position:"absolute", bottom: 18, left: 22,
                        width: 200, border:"none", cursor:"pointer",
                        background:"linear-gradient(90deg,#3C5BFF,#3C5BFF)", color:"#FFF",
                        fontFamily: FONT, fontWeight: 700, fontSize: 16, padding:"12px 16px", borderRadius: 16,
                        display:"flex", alignItems:"center", justifyContent:"center", gap: 12,
                        boxShadow:"0 8px 20px rgba(80,70,230,0.5)",
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF"><path d="M6 4l14 8-14 8z"/></svg>
                        Démarrer
                      </button>
) : (
                      <div style={{ position:"absolute", bottom: 18, left: 22, fontSize: 13, color:"#12B76A", fontWeight: 700, fontFamily: FONT }}>
                         Séance complétée
                      </div>
)}
                  </div>
                </div>
);
            })()}

            {/* Exercices */}
            {!todaySeance.complete && (
              <>
                {/* Header section */}
                <div style={{ display:"flex", alignItems:"center", marginBottom:12, marginTop:4 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:DISP,
                    letterSpacing:-0.3 }}>Exercices</div>
                </div>

                {/* Cards */}
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
                  {(todaySeance.exercices || []).map((ex, idx) => {
                    const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                    const exColor   = cc(ex.cat);
                    const lastEntry = ex.historique?.[ex.historique.length - 1];
                    // Palette thumbnails par catégorie
                    const thumbColors = {
                      push:["#E8EBFF",C.accent], pull:["#E8EBFF",C.green],
                      legs:["#E8EBFF","#F59E0B"], core:["#E8EBFF","#3C5BFF"],
                    };
                    const tc = thumbColors[ex.cat] || [C.s2,C.dim];
                    return (
                      <div key={idx} style={{
                        background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                        padding:"12px 16px",
                        boxShadow: C.shadow,
                        display:"flex", alignItems:"center", gap:12,
                      }}>
                        {/* Carré numéroté coloré (clic = valider) */}
                        <div onClick={() => toggleCheck(todaySeance.id, idx, ex.repos, todaySeance._calKey)}
                          style={{
                            width:48, height:48, borderRadius:12, flexShrink:0,
                            display:"grid", placeItems:"center", cursor:"pointer",
                            background: isChecked
                              ?"linear-gradient(145deg,#12B76A,#12B76A)"
                              :`linear-gradient(135deg, ${tc[0]}, ${tc[1]}22)`,
                            border: isChecked ?"none" :`1px solid ${tc[1]}3a`,
                            color: isChecked ?"#101318" : tc[1],
                            fontSize: 20, fontWeight:700, fontFamily:DISP,
                            boxShadow: isChecked ?"0 3px 8px rgba(18,183,106,0.35)" :"none",
                            transition:"all .15s",
                          }}>
                          {isChecked ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
) : idx + 1}
                        </div>

                        {/* Infos */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{
                            fontSize:14, fontWeight:700, color: isChecked ?"#98A2B3" : C.text,
                            fontFamily:DISP, letterSpacing:-0.2,
                            textDecoration: isChecked ?"line-through" :"none",
                          }}>{ex.nom}</div>
                          <div style={{ fontSize:11, color:C.dim, fontFamily:DISP, marginTop:2 }}>
                            {ex.series}×{ex.reps} · {ex.repos}s{ex.methode && ex.methode !=="Classique" ?` · ${ex.methode}` :""}
                          </div>
                        </div>

                        {/* Poids / check */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end",
                          gap:4, flexShrink:0 }}>
                          {isChecked && (
                            <div style={{
                              width:28, height:28, borderRadius:8,
                              background:"linear-gradient(145deg,#12B76A,#12B76A)",
                              display:"grid", placeItems:"center",
                              boxShadow:"0 3px 8px rgba(18,183,106,0.35)",
                            }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="#101318" strokeWidth="2.8" strokeLinecap="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </div>
)}
                          {lastEntry && (
                            <div style={{ fontSize:11, fontWeight:700, color:exColor,
                              fontFamily:DISP, ...NUM }}>
                              {lastEntry.poids}kg
                            </div>
)}
                        </div>
                      </div>
);
                  })}
                </div>
              </>
)}


          </>
);
      })() : (
        /* Jour de repos — design récupération DARK (style Coach IA) */
        <div style={{
          background:`radial-gradient(ellipse 90% 60% at 85% 0%, rgba(99,72,235,0.35), transparent 55%),
            radial-gradient(ellipse 70% 50% at 10% 100%, rgba(47,107,255,0.25), transparent 60%),
            linear-gradient(160deg, #101318 0%, #101318 55%, #101318 100%)`,
          border:"1px solid rgba(170,180,255,0.18)",
          borderRadius: 28, padding:"24px 20px 20px",
          marginBottom: 16, position:"relative", overflow:"hidden",
          boxShadow: C.shadow,
        }}>
          <div style={{ position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle, rgba(124,140,255,0.18), transparent 70%)",pointerEvents:"none" }}/>

          {/* Badge + date */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:999,background:"rgba(18,183,106,0.12)",border:"1px solid rgba(18,183,106,0.25)" }}>
              <span style={{ fontSize:13 }}></span>
              <span style={{ fontSize:10,fontWeight:700,color:"#12B76A",letterSpacing:"0.1em",fontFamily:DISP }}>JOUR DE RÉCUPÉRATION</span>
            </div>
            <div style={{ fontSize:11,color:DARK.dim,fontWeight:600,fontFamily:DISP }}>
              {today.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}
            </div>
          </div>

          {/* Titre */}
          <div style={{ fontFamily:SERIF_F,fontSize:34,color:"#FFFFFF",lineHeight:1.1,letterSpacing:-1,marginBottom:12 }}>
            Aujourd'hui, on<br/><span style={{ color:DARK.accent,fontStyle:"italic" }}>récupère.</span>
          </div>
          <div style={{ fontSize:13,color:DARK.dim,lineHeight:1.6,fontFamily:DISP,marginBottom:20 }}>
            La récup fait partie du programme. Voici 3 gestes qui comptent vraiment.
          </div>

          {/* Gestes récup */}
          {[
            {
              ic:"",
              bg:"linear-gradient(135deg,#12B76A,#12B76A)", bd:"rgba(255,255,255,0.25)",
              glow:"0 4px 14px rgba(18,183,106,0.5)",
              t:"Hydratation · 2,5 L",
              s:"Tap pour tracker ton eau →",
              tap: () => setTab?.("nutrition"),
              arrow: true,
            },
            {
              ic: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ?"" : todaySleepLogged >= sleepTarget - 1.5 ?"" :""
                :"",
              bg: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ?"linear-gradient(135deg,#12B76A,#12B76A)" : todaySleepLogged >= sleepTarget-1.5 ?"linear-gradient(135deg,#F59E0B,#F59E0B)" :"linear-gradient(135deg,#E5484D,#E5484D)"
                :"linear-gradient(135deg,#9DB0FF,#3C5BFF)",
              bd:"rgba(255,255,255,0.25)",
              glow: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ?"0 4px 14px rgba(18,183,106,0.5)" : todaySleepLogged >= sleepTarget-1.5 ?"0 4px 14px rgba(245,158,11,0.5)" :"0 4px 14px rgba(229,72,77,0.5)"
                :"0 4px 14px rgba(60,91,255,0.5)",
              t: todaySleepLogged !== null
                ?`Sommeil · ${todaySleepLogged}h dormies`
                :`Sommeil · cible ${sleepTarget}h`,
              s: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ?" Objectif atteint — super récup" :`${(sleepTarget - todaySleepLogged).toFixed(1)}h sous la cible`
                :"Tap pour checker ta nuit · 80% des gains la nuit",
              tap: () => { setSleepInput(todaySleepLogged ?? sleepTarget); setShowSleepModal(true); },
              arrow: true,
            },
            {
              ic: todayMobilite ?"" :"",
              bg: todayMobilite ?"linear-gradient(135deg,#12B76A,#12B76A)" :"linear-gradient(135deg,#9DB0FF,#2E48D9)",
              bd:"rgba(255,255,255,0.25)",
              glow: todayMobilite ?"0 4px 14px rgba(18,183,106,0.5)" :"0 4px 14px rgba(46,72,217,0.5)",
              t:  todayMobilite ?"Mobilité · Fait" :"Mobilité · 10 min",
              s:  todayMobilite ?"Hanches & thoracique — bien joué !" :"Tap pour marquer comme fait",
              tap: toggleMobilite,
              flash: mobiliteFlash,
              arrow: false,
              badge: true,
            },
          ].map((g,i) => (
            <div key={i} onClick={g.tap||undefined} style={{
              display:"flex", alignItems:"center", gap:12, padding:"12px 0",
              borderTop:"1px solid rgba(170,180,255,0.12)",
              cursor: g.tap ?"pointer" :"default",
              transition:"opacity .15s",
            }}>
              <div style={{
                width:44, height:44, borderRadius:12,
                background: g.flash ?"linear-gradient(135deg,#12B76A,#12B76A)" : g.bg,
                border:`1px solid ${g.flash ?"rgba(255,255,255,0.5)" : g.bd}`,
                display:"grid", placeItems:"center", flexShrink:0, fontSize:20,
                transition:"background .3s, border .3s, box-shadow .3s",
                boxShadow: g.flash ?"0 0 18px rgba(18,183,106,0.65)" : (g.glow ||"none"),
              }}>{g.ic}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#FFFFFF", fontFamily:DISP, letterSpacing:-0.2 }}>{g.t}</div>
                <div style={{ fontSize:11, color:"#98A2B3", fontFamily:DISP, marginTop:1 }}>{g.s}</div>
              </div>
              {/* Indicateur interactif */}
              {g.badge && (
                <div style={{
                  width:28, height:28, borderRadius:8, flexShrink:0,
                  background: todayMobilite ?"rgba(18,183,106,0.18)" :"rgba(255,255,255,0.05)",
                  border:`1.5px solid ${todayMobilite ?"rgba(18,183,106,0.5)" :"rgba(170,180,255,0.35)"}`,
                  display:"grid", placeItems:"center",
                  transition:"all .2s",
                }}>
                  {todayMobilite
                    ? <span style={{ color:"#12B76A", fontSize:13 }}></span>
                    : <span style={{ color:"rgba(255,255,255,0.25)", fontSize:11 }}>○</span>}
                </div>
)}
              {g.arrow && <div style={{ fontSize:14, color:"#98A2B3", flexShrink:0 }}>›</div>}
            </div>
))}

          {/* CTA — créer une séance malgré tout */}
          <button onClick={() => setShowCreateSeance(true)} style={{
            width:"100%",marginTop:16,padding:"12px",borderRadius:16,
            background:"rgba(47,107,255,0.18)",border:"1px solid rgba(110,150,255,0.35)",
            color:"#9DB0FF",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DISP,
          }}>
            + Créer une séance aujourd'hui
          </button>
        </div>
)}

      {/* ── Records ─────────────────────────────────────────────── */}
      {prog && (() => {
        const REC_PALETTE = [DARK.accent,"#12B76A","#F59E0B","#E5484D","#9DB0FF",C.accent];
        const trendOf = (hist) => {
          if (!hist || hist.length < 2) return null;
          const rms = hist.map(h => calc1RM(parseFloat(h.poids), parseInt(h.reps)));
          const last = rms[rms.length - 1];
          const prevBest = Math.max(...rms.slice(0, -1));
          const d = Math.round(last - prevBest);
          return d > 0 ? d : null;
        };
        const recBtn = {
          width:"100%", padding:"16px", borderRadius:16,
          background:"linear-gradient(180deg,#3C5BFF,#2E48D9)", border:"none",
          color:"#FFF", fontFamily:DISP, fontSize:14, fontWeight:700, letterSpacing:-0.2,
          cursor:"pointer", boxShadow:"0 8px 24px rgba(60,91,255,0.35)",
        };
        return (
        <div style={{ marginBottom: 20 }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontFamily:SERIF_F, fontSize:20, fontWeight:400, color:C.text, letterSpacing:-0.3 }}>
              Records & Objectifs
            </div>
            <button onClick={() => setShowManualRM(true)}
              style={{ fontSize:11, fontWeight:600, color:C.mid,
                background:C.s2, border:"none", borderRadius:12,
                padding:"4px 12px", cursor:"pointer", fontFamily:DISP,
                display:"flex", alignItems:"center", gap:4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/>
              </svg>
              Historique
            </button>
          </div>

          {rmData.length === 0 ? (
            <div style={{ background: C.s1, border:`1px solid ${C.bd}`, borderRadius: 20, overflow:"hidden" }}>
              {/* Empty state avec CTA visible */}
              <div style={{ padding:"24px 20px 20px", textAlign:"center" }}>
                <div style={{ fontSize:26,marginBottom:8 }}></div>
                <div style={{ fontFamily:DISP,fontSize:14,fontWeight:700,color:"${C.text}",marginBottom:8 }}>Pas encore de données</div>
                <div style={{ fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:16,fontFamily:DISP }}>
                  Enregistre tes charges pendant les séances pour voir tes records et tes 1RM estimés.
                </div>
                <button onClick={() => setShowManualRM(true)} style={recBtn}>
                  Saisir un record
                </button>
              </div>
            </div>
) : (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {rmData.map((ex, i) => {
                  const col  = REC_PALETTE[i % REC_PALETTE.length];
                  const tr   = trendOf(ex.historique);
                  const iconBg = [
                    ["#E8EBFF",C.accent],["#E8EBFF",C.green],
                    ["#E8EBFF","#F59E0B"],["#E8EBFF","#3C5BFF"],
                    ["#E8EBFF","#E5484D"],["#E8EBFF","#12B76A"],
                  ][i % 6];
                  return (
                    <div key={i} onClick={() => setEditRecord(ex)} style={{
                      background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                      padding:"16px 16px 12px", cursor:"pointer",
                      boxShadow: C.shadow,
                    }}>
                      {/* Icône */}
                      <div style={{ width:36, height:36, borderRadius:12,
                        background:`linear-gradient(135deg, ${iconBg[0]}, ${iconBg[1]}33)`,
                        border:`1px solid ${iconBg[1]}30`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        marginBottom:8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke={iconBg[1]} strokeWidth="1.8" strokeLinecap="round">
                          <path d="M6.5 6.5h11M6.5 6.5A2.5 2.5 0 014 4M17.5 6.5A2.5 2.5 0 0120 4M6.5 17.5h11M6.5 17.5A2.5 2.5 0 014 20M17.5 17.5A2.5 2.5 0 0120 20M12 6.5v11"/>
                        </svg>
                      </div>
                      <div style={{ fontFamily:DISP, fontSize:26, fontWeight:700, color:col,
                        letterSpacing:-1, lineHeight:1, ...NUM }}>{ex.rm1}</div>
                      <div style={{ fontSize:10, color:"#98A2B3", fontWeight:600,
                        marginTop:1, fontFamily:DISP }}>kg · 1RM</div>
                      <div style={{ fontSize:13, color:C.text, fontWeight:600, marginTop:8,
                        fontFamily:DISP, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis",
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {ex.nom}
                      </div>
                      {tr && (
                        <div style={{ fontSize:10, color:C.green, fontWeight:700,
                          marginTop:4, fontFamily:DISP }}>▲ +{tr} kg</div>
)}
                    </div>
);
                })}
              </div>
              {/* Saisie rapide banner */}
              <div onClick={() => setShowManualRM(true)} style={{
                background:"linear-gradient(135deg, #3C5BFF 0%, #2E48D9 100%)",
                borderRadius:16, padding:"16px 16px",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                cursor:"pointer", boxShadow:"0 8px 24px rgba(60,91,255,0.35)",
              }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#FFF", fontFamily:DISP }}>
                    Saisie rapide
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", fontFamily:DISP, marginTop:2 }}>
                    Ajoute un nouveau record
                  </div>
                </div>
                <div style={{ width:40, height:40, borderRadius:"50%",
                  background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)",
                  display:"grid", placeItems:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#FFF" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
              </div>
            </div>
)}
        </div>
);
      })()}

      {/* Pas de programme */}
      {!prog && (
        <Card style={{ textAlign:"center", padding:"20px 16px", marginTop: 8 }}>
          <div style={{ fontSize: 13, color: C.mid, marginBottom: 12 }}>Aucun programme actif</div>
          <Btn onClick={() => setProgView("analyse")}> Générer mon programme</Btn>
          <Btn v="out" onClick={() => setProgView("creer")}>Créer manuellement</Btn>
        </Card>
)}

      {/* Modals */}
      {showManualRM && (
        <ManualRMModal
          onClose={() => setShowManualRM(false)}
          prog={prog} setProg={setProg} push={push} C={C} EX={EX}
          onSelectExercise={(ex) => {
            setShowManualRM(false);
            // Construire exData pour RecordDetailPage
            const nom = ex.nom;
            let historique = [];
            (prog?.jours || []).forEach(j =>
              (j.exercices || []).forEach(e => {
                if (e.nom === nom) historique = [...historique, ...(e.historique || [])];
              })
);
            const recRaw = prog?.records?.[nom];
            const recHist = Array.isArray(recRaw) ? recRaw : (recRaw?.historique || []);
            historique = [...historique, ...recHist];
            const rm1 = historique.reduce((best, h) => {
              const rm = Math.round(parseFloat(h.poids) * (1 + parseInt(h.reps)/30) * 10) / 10;
              return rm > best ? rm : best;
            }, 0);
            setEditRecord({ nom, rm1, historique });
          }}
        />
)}
      {showCreateSeance && <CreateSeanceModal onClose={() => setShowCreateSeance(false)} prog={prog} setProg={setProg} calSess={calSess} setCalSess={setCalSess} push={push} C={C} INT={INT} EX={EX} todayKey={todayKey}/>}
      {editRecord && <RecordDetailPage exData={editRecord} onClose={() => setEditRecord(null)} prog={prog} setProg={setProg} push={push}/>}

      {/* ── Modal Sommeil ─────────────────────────────────────────── */}
      {showSleepModal && (() => {
        const F = DISP;
        const inputVal = sleepInput ?? sleepTarget;
        const step  = v => Math.min(12, Math.round((v + 0.5) * 2) / 2);
        const stepD = v => Math.max(4, Math.round((v - 0.5) * 2) / 2);
        const qualColor = (h) => h >= sleepTarget ?"#12B76A" : h >= sleepTarget-1.5 ?"#3C5BFF" :"#E5484D";
        const qualLabel = (h) => h >= sleepTarget ?"Optimal" : h >= sleepTarget-1.5 ?"Acceptable" :"Insuffisant";
        return (
          <div onClick={()=>setShowSleepModal(false)} style={{
            position:"fixed",inset:0,zIndex:360,
            background:"rgba(4,7,15,0.65)",backdropFilter:"blur(4px)",
            display:"flex",alignItems:"flex-end",justifyContent:"center",
          }}>
            <div onClick={e=>e.stopPropagation()} style={{
              width:"100%",maxWidth:480,
              background:"#FFFFFF",border:"1px solid rgba(0,0,0,0.05)",
              borderRadius:"20px 20px 0 0",padding:"0 0 32px",
              boxShadow: C.shadow,
            }}>
              {/* Handle */}
              <div style={{ width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.08)",margin:"14px auto 0" }}/>

              {/* Header */}
              <div style={{ padding:"20px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:F,fontSize:20,fontWeight:700,color:"${C.text}",letterSpacing:-0.3 }}> Sommeil</div>
                  <div style={{ fontSize:11,color:"${C.dim}",marginTop:4,fontFamily:F }}>Cible & log quotidien</div>
                </div>
                <button onClick={()=>setShowSleepModal(false)} style={{
                  width:36,height:36,borderRadius:12,background:"rgba(0,0,0,0.05)",
                  border:"1px solid rgba(0,0,0,0.05)",color:C.mid,
                  fontSize:16,cursor:"pointer",display:"grid",placeItems:"center",
                }}>×</button>
              </div>

              {/* Séparateur */}
              <div style={{ height:1,background:"rgba(0,0,0,0.05)",margin:"16px 0" }}/>

              <div style={{ padding:"0 24px" }}>

                {/* ── Section 1 : Cible ─────────────────────────── */}
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                              color:"${C.dim}",marginBottom:16,fontFamily:F }}>
                  OBJECTIF NUIT
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                              background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.05)",
                              borderRadius:16,padding:"16px 16px",marginBottom:20 }}>
                  <button onClick={()=>saveSleepTarget(stepD(sleepTarget))} style={{
                    width:44,height:44,borderRadius:12,background:"rgba(0,0,0,0.05)",
                    border:"none",color:C.mid,fontSize:20,cursor:"pointer",
                    display:"grid",placeItems:"center",
                  }}>−</button>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:34,fontWeight:700,color:"${C.text}",letterSpacing:-1,fontFamily:F }}>
                      {sleepTarget}<span style={{ fontSize:16,color:C.mid,marginLeft:4 }}>h</span>
                    </div>
                    <div style={{ fontSize:10,color:"${C.dim}",fontFamily:F,marginTop:2 }}>cible par nuit</div>
                  </div>
                  <button onClick={()=>saveSleepTarget(step(sleepTarget))} style={{
                    width:44,height:44,borderRadius:12,
                    background:"rgba(91,141,239,0.12)",border:"1px solid rgba(91,141,239,0.35)",
                    color:"#9DB0FF",fontSize:20,cursor:"pointer",display:"grid",placeItems:"center",
                  }}>+</button>
                </div>

                {/* ── Section 2 : Log aujourd'hui ───────────────── */}
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                              color:"${C.dim}",marginBottom:16,fontFamily:F }}>
                  CETTE NUIT
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                              background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.05)",
                              borderRadius:16,padding:"16px 16px",marginBottom:16 }}>
                  <button onClick={()=>setSleepInput(stepD(inputVal))} style={{
                    width:44,height:44,borderRadius:12,background:"rgba(0,0,0,0.05)",
                    border:"none",color:C.mid,fontSize:20,cursor:"pointer",
                    display:"grid",placeItems:"center",
                  }}>−</button>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:34,fontWeight:700,color:"${C.text}",letterSpacing:-1,fontFamily:F }}>
                      {inputVal}<span style={{ fontSize:16,color:C.mid,marginLeft:4 }}>h</span>
                    </div>
                    <div style={{ fontSize:11,fontWeight:600,color:qualColor(inputVal),fontFamily:F,marginTop:2 }}>
                      {qualLabel(inputVal)}
                    </div>
                  </div>
                  <button onClick={()=>setSleepInput(step(inputVal))} style={{
                    width:44,height:44,borderRadius:12,
                    background:"rgba(91,141,239,0.12)",border:"1px solid rgba(91,141,239,0.35)",
                    color:"#9DB0FF",fontSize:20,cursor:"pointer",display:"grid",placeItems:"center",
                  }}>+</button>
                </div>

                {/* Barre de comparaison */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                    <span style={{ fontSize:11,color:"${C.dim}",fontFamily:F }}>0h</span>
                    <span style={{ fontSize:11,color:"rgba(91,141,239,0.65)",fontFamily:F }}>cible {sleepTarget}h</span>
                    <span style={{ fontSize:11,color:"${C.dim}",fontFamily:F }}>12h</span>
                  </div>
                  <div style={{ height:6,borderRadius:3,background:"rgba(0,0,0,0.05)",position:"relative" }}>
                    {/* Cible */}
                    <div style={{ position:"absolute",top:-2,bottom:-2,width:2,borderRadius:1,
                      background:"rgba(91,141,239,0.5)",left:`${(sleepTarget/12)*100}%` }}/>
                    {/* Valeur saisie */}
                    <div style={{ height:"100%",borderRadius:3,
                      background:`linear-gradient(90deg,${qualColor(inputVal)}99,${qualColor(inputVal)})`,
                      width:`${Math.min(100,(inputVal/12)*100)}%`,transition:"width .2s" }}/>
                  </div>
                </div>

                {/* Bouton valider */}
                <button onClick={()=>{ logSleepToday(inputVal); setShowSleepModal(false); }} style={{
                  width:"100%",padding:"16px",borderRadius:16,
                  background:"linear-gradient(180deg,#9DB0FF 0%,#3C5BFF 50%,#2E48D9 100%)",
                  color:"#FFF",border:"1px solid rgba(156,185,245,0.35)",
                  fontFamily:F,fontSize:14,fontWeight:700,cursor:"pointer",
                  boxShadow:"inset 0 1px 0 rgba(0,0,0,0.12), 0 8px 22px rgba(45,93,201,0.35)",
                }}>
                   Enregistrer {inputVal}h de sommeil
                </button>
              </div>
            </div>
          </div>
);
      })()}
    </div>
);
}
