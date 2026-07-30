import { useState } from"react";
import { ID } from"../../components/ui/Icon.jsx";
import { I } from"../../components/ui/Icon.jsx";
import { C, DARK, FONT, NUM, SERIF } from"../../data/constants.js";
import { Card, Eyebrow, Btn } from"../../components/ui/index.jsx";
import SeanceDetail from"./SeanceDetail.jsx";
import { calc1RM, calcKgFor, catColor as cc, toDateKey } from"../../utils/training.js";
import { ManualRMModal, CreateSeanceModal, EditRecordModal, RMCard, OBJ_TARGET, DEFAULT_TARGET } from"./components/TodayViewModals.jsx";
import RecordDetailPage from"./components/RecordDetailPage.jsx";
import ProgressionPage from"./ProgressionPage.jsx";
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
  const [showProgression,  setShowProgression]   = useState(false);
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
    { icon:"hydration", title:"Hydrate-toi bien", desc:"La récupération musculaire dépend de ton hydratation. Vise 2,5L aujourd'hui." },
    { icon:"protein", title:"Protéines++", desc:"Un apport élevé en protéines aujourd'hui accélère la reconstruction musculaire." },
    { icon:"sleep", title:"8h de sommeil", desc:"80% des gains se font la nuit. Dors tôt, ton corps travaille pour toi." },
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

      {/* ── Animations locales ──────────────────────────────────── */}
      <style>{`
        @keyframes tdFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tdFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes tdRingDraw{from{stroke-dashoffset:97}to{stroke-dashoffset:var(--td-dash-offset,20)}}
        @keyframes tdAurora{0%{transform:translate(-6%,-4%) scale(1)}50%{transform:translate(7%,5%) scale(1.18)}100%{transform:translate(-6%,-4%) scale(1)}}
        @keyframes tdShimmer{0%{transform:translateX(-130%)}60%,100%{transform:translateX(260%)}}
        @keyframes tdFloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      `}</style>

      {/* ── Header daté (V4/V5) ─────────────────────────────────── */}
      {(() => {
        const dateLabel = today.toLocaleDateString("fr-FR", {
          weekday:"long", day:"numeric", month:"short",
        }).toUpperCase().replace(".", "");
        return (
          <div style={{
            paddingTop: 8, marginBottom: 18,
            display:"flex", alignItems:"flex-start", justifyContent:"space-between",
            gap: 12,
            animation:"tdFadeUp .55s cubic-bezier(.22,1,.36,1) both",
            animationDelay:".04s",
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:11, fontWeight:700, letterSpacing:"0.12em",
                color: C.accent, fontFamily: DISP, marginBottom: 6,
              }}>
                {dateLabel}
              </div>
              <div style={{
                fontFamily: DISP, fontSize: 31, fontWeight: 700,
                color: C.text, letterSpacing: -1, lineHeight: 1,
              }}>
                {todaySeance
                  ? <>Séance du <span style={{ fontStyle:"italic", color: C.accent }}>jour</span></>
                  : <>Journée <span style={{ fontStyle:"italic", color: C.accent }}>libre</span></>}
              </div>
              <div style={{
                fontSize: 13.5, fontWeight: 500, color:"#6B7486",
                fontFamily: DISP, marginTop: 6,
              }}>
                {todaySeance
                  ? "Programmée par ton coach — continue ta progression"
                  : "Aucune séance ni programme actif — à toi de jouer"}
              </div>
            </div>
            {streak > 0 && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                background:"#FFFFFF", border:"1px solid rgba(245,158,11,0.20)",
                borderRadius:16, padding:"8px 12px", flexShrink:0,
                boxShadow:"0 2px 8px rgba(245,158,11,0.12)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:16 }}><ID name="streak" size={24}/></span>
                  <span style={{ fontSize:20, fontWeight:700, color:"#F59E0B", fontFamily:DISP, lineHeight:1 }}>{streak}</span>
                </div>
                <div style={{ fontSize:10, fontWeight:600, color:"#F59E0B", fontFamily:DISP,
                  letterSpacing:"0.1em", marginTop:2, textAlign:"center", color:"#0F1923" }}>
                  série
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── État de forme (V4/V5) ───────────────────────────────── */}
      {(() => {
        // Score calculé à partir de la récup dispo (sommeil, mobilité, streak)
        let score = 70;
        if (todaySleepLogged !== null) {
          if (todaySleepLogged >= sleepTarget) score += 15;
          else if (todaySleepLogged >= sleepTarget - 1.5) score += 8;
          else score -= 5;
        }
        if (todayMobilite) score += 8;
        if (streak > 0) score += Math.min(7, streak);
        score = Math.max(30, Math.min(100, score));

        const stateLabel = score >= 80 ? "PRÊT" : score >= 60 ? "OK" : "REPOS";
        const stateColor = score >= 80 ? "#12B981" : score >= 60 ? "#F59E0B" : "#E5484D";
        const stateBg    = score >= 80 ? "#E7F7F0" : score >= 60 ? "#FEF3E2" : "#FDECEC";
        const stateRing  = score >= 80 ? "#EAF7F0" : score >= 60 ? "#FEF3E2" : "#FDECEC";
        const stateSub   = score >= 80
          ? (todaySeance
              ? "Bien récupéré · c'est le moment idéal pour pousser"
              : "Bien récupéré · ton corps est prêt à bouger")
          : score >= 60
            ? "Récupération correcte · à toi de choisir l'intensité"
            : "Récupération limitée · pense à te reposer";

        // Le cercle complet vaut 97 (dasharray). On dessine `dashLen` du total.
        const CIRC = 97;
        const dashLen = Math.round(CIRC * (score / 100));

        return (
          <div onClick={() => { setSleepInput(todaySleepLogged ?? sleepTarget); setShowSleepModal(true); }}
            style={{
              background: C.s1, border:`1px solid ${C.bd}`,
              borderRadius: 18, padding:"14px 15px",
              display:"flex", alignItems:"center", gap: 13,
              boxShadow:"0 2px 8px rgba(15,25,35,0.04)",
              marginBottom: 18, cursor:"pointer",
              animation:"tdFadeUp .55s cubic-bezier(.22,1,.36,1) both",
              animationDelay:".10s",
            }}>
            <div style={{ position:"relative", width: 44, height: 44, flex:"none" }}>
              <svg width="44" height="44" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={stateRing} strokeWidth="4"/>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={stateColor} strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${dashLen} ${CIRC}`}
                  transform="rotate(-90 18 18)"
                  style={{ animation:"tdRingDraw 1.1s cubic-bezier(.22,1,.36,1) .35s both" }}/>
              </svg>
              <span style={{
                position:"absolute", inset: 0, display:"grid", placeItems:"center",
                fontSize: 12, fontWeight: 800, color: stateColor, fontFamily: DISP,
                animation:"tdFadeIn .6s ease .9s both",
              }}>{score}</span>
            </div>
            <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:3 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ fontSize:14, fontWeight:800, color: C.text, fontFamily: DISP }}>État de forme</span>
                <span style={{
                  fontSize:10, fontWeight:800, letterSpacing:"0.03em",
                  color: stateColor, background: stateBg,
                  padding:"2px 7px", borderRadius:6, fontFamily: DISP,
                }}>{stateLabel}</span>
              </div>
              <span style={{ fontSize:12, fontWeight:500, color:"#6B7486", fontFamily: DISP }}>
                {stateSub}
              </span>
            </div>
            <span style={{ color:"#C3C9D4", flexShrink:0, display:"grid", placeItems:"center" }}>
              <I name="chevronRight" size={16} color="#C3C9D4"/>
            </span>
          </div>
        );
      })()}

      {/* ── Bloc principal : séance (V5) OU composer (V4) ────── */}
      {todaySeance ? (() => {
        const intData = INT[todaySeance.intensite || "modere"] || INT.modere;
        const total   = todaySeance.exercices?.length || 0;
        const done    = todaySeance.exercices?.filter((_, i) => checkedEx[`${todaySeance.id}-${i}`]).length || 0;
        const focusText = todaySeance.focus || todaySeance.desc || "";

        return (
          <>
            {/* HERO séance V5 */}
            <div style={{
              borderRadius: 24, overflow:"hidden", background:"#0E1220",
              marginBottom: 18,
              animation:"tdFadeUp .6s cubic-bezier(.22,1,.36,1) both",
              animationDelay:".16s",
            }}>
              <div style={{ position:"relative", height: 160 }}>
                {/* Dégradé bas */}
                <div style={{
                  position:"absolute", inset: 0,
                  background:"linear-gradient(to top,rgba(8,9,18,0.95) 0%,rgba(8,9,18,0.5) 46%,rgba(8,9,18,0.08) 80%)",
                  pointerEvents:"none",
                }}/>
                {/* Label haut */}
                <span style={{
                  position:"absolute", top: 16, left: 16,
                  fontSize: 11, fontWeight: 800, letterSpacing:"0.12em",
                  color:"#C4B5FF", fontFamily: DISP,
                }}>SÉANCE PROGRAMMÉE</span>
                {/* Badge haut-droit */}
                <span style={{
                  position:"absolute", top: 14, right: 14,
                  display:"inline-flex", alignItems:"center", gap: 5,
                  fontSize: 11, fontWeight: 800, color:"#fff",
                  background:"rgba(255,255,255,0.14)",
                  border:"1px solid rgba(255,255,255,0.16)",
                  padding:"5px 10px", borderRadius: 99,
                  backdropFilter:"blur(6px)", fontFamily: DISP,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius:"50%",
                    background:"#12B981",
                    boxShadow:"0 0 0 4px rgba(18,185,129,0.25)",
                    animation:"tdFloaty 2.4s ease-in-out infinite",
                  }}/>
                  {done}/{total} fait{total > 1 ? "s" : ""}
                </span>
                {/* Bas */}
                <div style={{
                  position:"absolute", left: 16, right: 16, bottom: 16,
                  display:"flex", flexDirection:"column", gap: 11,
                  pointerEvents:"none",
                }}>
                  <div style={{ display:"flex", flexDirection:"column", gap: 2 }}>
                    <span style={{
                      fontSize: 36, fontWeight: 800, letterSpacing:"-0.03em",
                      color:"#fff", lineHeight: 1, fontFamily: DISP,
                    }}>{todaySeance.nom}</span>
                    {focusText && (
                      <span style={{
                        fontSize: 13, fontWeight: 600, color:"rgba(255,255,255,0.72)",
                        fontFamily: DISP,
                      }}>{focusText}</span>
                    )}
                  </div>
                  <div style={{ display:"flex", gap: 7 }}>
                    <span style={{
                      display:"inline-flex", alignItems:"center", gap: 5,
                      fontSize: 11.5, fontWeight: 700, color:"#fff",
                      background:"rgba(255,255,255,0.16)",
                      border:"1px solid rgba(255,255,255,0.14)",
                      padding:"5px 10px", borderRadius: 99, fontFamily: DISP,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                      </svg>
                      {todaySeance.duree || "45-60 min"}
                    </span>
                    <span style={{
                      display:"inline-flex", alignItems:"center",
                      fontSize: 11.5, fontWeight: 700, color:"#fff",
                      background:"rgba(255,255,255,0.16)",
                      border:"1px solid rgba(255,255,255,0.14)",
                      padding:"5px 10px", borderRadius: 99, fontFamily: DISP,
                    }}>{total} exercice{total !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding:"13px 14px" }}>
                {!todaySeance.complete ? (
                  <button onClick={() => setFocusActive(true)} style={{
                    position:"relative", overflow:"hidden",
                    display:"flex", alignItems:"center", justifyContent:"center", gap: 9,
                    width:"100%", background:"#3B5BFB", color:"#fff",
                    border:"none", borderRadius: 15, padding: 16,
                    fontSize: 16, fontWeight: 800, fontFamily: DISP,
                    boxShadow:"0 10px 24px rgba(59,91,251,0.42)",
                    cursor:"pointer",
                  }}>
                    <span aria-hidden style={{
                      position:"absolute", top: 0, left: 0, height:"100%", width:"40%",
                      background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)",
                      animation:"tdShimmer 3.2s ease-in-out 1.3s infinite",
                      pointerEvents:"none",
                    }}/>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                    Démarrer la séance
                  </button>
                ) : (
                  <div style={{
                    padding: 12, textAlign:"center",
                    fontSize: 14, color:"#12B76A", fontWeight: 800, fontFamily: DISP,
                  }}>
                    ✓ Séance complétée
                  </div>
                )}
              </div>
            </div>

            {/* EXERCICES échelonnés */}
            {!todaySeance.complete && (
              <div style={{ display:"flex", flexDirection:"column", gap: 11, marginBottom: 18 }}>
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"0 2px",
                  animation:"tdFadeUp .5s cubic-bezier(.22,1,.36,1) both",
                  animationDelay:".22s",
                }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: DISP }}>Exercices</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color:"#9AA3B2", fontFamily: DISP }}>
                    {total} au total
                  </span>
                </div>
                {(todaySeance.exercices || []).map((ex, idx) => {
                  const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                  const firstOpenIdx = (todaySeance.exercices || []).findIndex(
                    (_, i) => !checkedEx[`${todaySeance.id}-${i}`]);
                  const isFirstOpen = !isChecked && idx === firstOpenIdx;
                  const lastEntry = ex.historique?.[ex.historique.length - 1];
                  return (
                    <div key={idx} style={{
                      background:"#fff", border:"1px solid rgba(15,25,35,0.06)",
                      borderRadius: 16, padding:"13px 14px",
                      display:"flex", alignItems:"center", gap: 13,
                      boxShadow:"0 1px 3px rgba(15,25,35,0.04)",
                      animation:"tdFadeUp .5s cubic-bezier(.22,1,.36,1) both",
                      animationDelay:`${(0.26 + idx * 0.05).toFixed(2)}s`,
                    }}>
                      <div onClick={() => toggleCheck(todaySeance.id, idx, ex.repos, todaySeance._calKey)}
                        style={{
                          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                          display:"grid", placeItems:"center", cursor:"pointer",
                          fontSize: 15, fontWeight: 800, fontFamily: DISP,
                          background: isChecked
                            ? "#12B76A"
                            : isFirstOpen ? "#EEF1FF" : "#F1F3F8",
                          color: isChecked
                            ? "#fff"
                            : isFirstOpen ? "#3B5BFB" : "#6B7486",
                          transition:"all .15s",
                        }}>
                        {isChecked ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="#fff" strokeWidth="2.8" strokeLinecap="round">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        ) : idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display:"flex", flexDirection:"column", gap: 2 }}>
                        <span style={{
                          fontSize: 14.5, fontWeight: 800, fontFamily: DISP,
                          color: isChecked ? "#98A2B3" : "#0F1923",
                          textDecoration: isChecked ? "line-through" : "none",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        }}>{ex.nom}</span>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color:"#9AA3B2", fontFamily: DISP,
                          ...NUM,
                        }}>
                          {ex.series}×{ex.reps} · {ex.repos}s{ex.methode && ex.methode !== "Classique" ? ` · ${ex.methode}` : " · Standard"}
                          {lastEntry ? ` · ${lastEntry.poids}kg` : ""}
                        </span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C3C9D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      })() : (
        /* COMPOSER V4 — pas de séance ni programme actif */
        <div style={{
          position:"relative", borderRadius: 24, overflow:"hidden",
          background:"#0E1220",
          boxShadow:"0 20px 50px rgba(14,18,32,0.42)",
          marginBottom: 18,
          animation:"tdFadeUp .6s cubic-bezier(.22,1,.36,1) both",
          animationDelay:".16s",
        }}>
          {/* Aurora 1 */}
          <div style={{
            position:"absolute", top:-46, left:-34, width: 190, height: 190,
            borderRadius:"50%",
            background:"radial-gradient(circle,#3B5BFB,transparent 68%)",
            filter:"blur(14px)", opacity: 0.55,
            animation:"tdAurora 9s ease-in-out infinite",
            pointerEvents:"none",
          }}/>
          {/* Aurora 2 */}
          <div style={{
            position:"absolute", bottom:-58, right:-36, width: 210, height: 210,
            borderRadius:"50%",
            background:"radial-gradient(circle,#7C5CFF,transparent 68%)",
            filter:"blur(18px)", opacity: 0.42,
            animation:"tdAurora 12s ease-in-out infinite reverse",
            pointerEvents:"none",
          }}/>
          <div style={{
            position:"relative", padding:"22px 18px 18px",
            display:"flex", flexDirection:"column", gap: 16,
          }}>
            <div style={{ display:"flex", flexDirection:"column", gap: 5 }}>
              <span style={{
                fontSize: 11, fontWeight: 800, letterSpacing:"0.14em",
                color:"#9FB0FF", fontFamily: DISP,
              }}>ENVIE DE BOUGER ?</span>
              <span style={{
                fontSize: 26, fontWeight: 800, letterSpacing:"-0.03em",
                color:"#fff", lineHeight: 1.05, fontFamily: DISP,
              }}>
                Compose ta <span style={{ fontStyle:"italic", color:"#A9B8FF" }}>séance</span>
              </span>
              <span style={{
                fontSize: 13, fontWeight: 500, color:"rgba(255,255,255,0.6)",
                lineHeight: 1.5, fontFamily: DISP,
              }}>Choisis un format et lance-toi — sans pression, à ton rythme.</span>
            </div>

            <div style={{ display:"flex", gap: 10 }}>
              {[
                {
                  label: "Muscu", sub: "à composer",
                  iconBg: "rgba(255,255,255,0.12)",
                  icon: <ID name="gym" size={24} dark/>,
                  onClick: () => setShowCreateSeance(true),
                },
                {
                  label: "Cardio", sub: "20 min",
                  iconBg: "rgba(255,255,255,0.12)",
                  icon: <ID name="cardio" size={24} dark/>,
                  onClick: () => setShowCreateSeance(true),
                },
                {
                  label: "Étirement",
                  sub: todayMobilite ? "Fait ✓" : "10 min",
                  iconBg: "rgba(255,255,255,0.12)",
                  icon: <ID name="recovery" size={24} dark/>,
                  onClick: toggleMobilite,
                  flash: mobiliteFlash,
                },
              ].map((t, i) => (
                <div key={i} onClick={t.onClick} style={{
                  flex: 1,
                  display:"flex", flexDirection:"column", alignItems:"center", gap: 9,
                  background: t.flash ? "rgba(18,183,106,0.22)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${t.flash ? "rgba(18,183,106,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 18, padding:"16px 6px 13px",
                  cursor:"pointer",
                  transition:"transform .16s cubic-bezier(.22,1,.36,1), background .3s, border .3s",
                  boxShadow: t.flash ? "0 0 18px rgba(18,183,106,0.4)" : "none",
                  animation:"tdFadeUp .5s cubic-bezier(.22,1,.36,1) both",
                  animationDelay:`${(0.22 + i * 0.05).toFixed(2)}s`,
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: t.iconBg,
                    display:"grid", placeItems:"center",
                  }}>{t.icon}</div>
                  <div style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap: 1,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color:"#fff", fontFamily: DISP }}>{t.label}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color:"rgba(255,255,255,0.45)", fontFamily: DISP }}>{t.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            <div onClick={() => setProgView && setProgView("analyse")} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap: 7,
              background:"rgba(255,255,255,0.05)",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius: 14, padding: 12,
              fontSize: 13, fontWeight: 700, color:"rgba(255,255,255,0.82)",
              fontFamily: DISP, cursor:"pointer",
              animation:"tdFadeUp .5s cubic-bezier(.22,1,.36,1) both",
              animationDelay:".38s",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/>
              </svg>
              Planifier un programme complet
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Records & Objectifs ─────────────────────────────────── */}
      {(() => {
        const REC_PALETTE = [DARK.accent,"#12B76A","#F59E0B","#E5484D","#9DB0FF",C.accent];
        const trendOf = (hist) => {
          if (!hist || hist.length < 2) return null;
          const rms = hist.map(h => calc1RM(parseFloat(h.poids), parseInt(h.reps)));
          const last = rms[rms.length - 1];
          const prevBest = Math.max(...rms.slice(0, -1));
          const d = Math.round(last - prevBest);
          return d > 0 ? d : null;
        };
        return (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontFamily:DISP, fontSize:17, fontWeight:800, color:C.text, letterSpacing:-0.3 }}>
              Records & Objectifs
            </div>
            <button onClick={() => setShowProgression(true)}
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
            <div style={{ background:C.s1, border:`1px solid ${C.bd}`, borderRadius:20, padding:"24px 20px 20px", textAlign:"center" }}>
              <div style={{ fontFamily:DISP, fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>Pas encore de données</div>
              <div style={{ fontSize:11, color:C.mid, lineHeight:1.6, marginBottom:16, fontFamily:DISP }}>
                Enregistre tes charges pendant les séances pour voir tes records et tes 1RM estimés.
              </div>
              <button onClick={() => setShowProgression(true)} style={{
                width:"100%", padding:"16px", borderRadius:16,
                background:"#3B5BFB", border:"none",
                color:"#FFF", fontFamily:DISP, fontSize:14, fontWeight:700,
                cursor:"pointer", boxShadow:"0 8px 24px rgba(60,91,255,0.35)",
              }}>Saisir un record</button>
            </div>
          ) : (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {rmData.map((ex, i) => {
                  const col  = REC_PALETTE[i % REC_PALETTE.length];
                  const tr   = trendOf(ex.historique);
                  return (
                    <div key={i} onClick={() => setEditRecord(ex)} style={{
                      background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                      padding:"16px 16px 12px", cursor:"pointer", boxShadow:C.shadow,
                    }}>
                      <div style={{ width:36, height:36, borderRadius:12,
                        background:`linear-gradient(135deg, #E8EBFF, ${col}33)`,
                        border:`1px solid ${col}30`,
                        display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                        <I name="gym" size={18} color={col}/>
                      </div>
                      <div style={{ fontFamily:DISP, fontSize:26, fontWeight:700, color:col,
                        letterSpacing:-1, lineHeight:1, ...NUM }}>{ex.rm1}</div>
                      <div style={{ fontSize:10, color:"#98A2B3", fontWeight:600, marginTop:1, fontFamily:DISP }}>kg · 1RM</div>
                      <div style={{ fontSize:13, color:C.text, fontWeight:600, marginTop:8,
                        fontFamily:DISP, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis",
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{ex.nom}</div>
                      {tr && <div style={{ fontSize:10, color:C.green, fontWeight:700, marginTop:4, fontFamily:DISP }}>+{tr} kg</div>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowProgression(true)} style={{
                width:"100%", padding:"16px", borderRadius:16,
                background:"#3B5BFB", border:"none",
                color:"#FFF", fontFamily:DISP, fontSize:15, fontWeight:800,
                letterSpacing:-0.2, cursor:"pointer",
                boxShadow:"0 8px 24px rgba(59,91,251,0.38)",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Ajoute ton PR
              </button>
            </div>
          )}
        </div>
        );
      })()}

      {/* Aucun programme actif — supprimé, géré par Composer V4 */}

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
      {showProgression && <ProgressionPage EX={EX} prog={prog} setProg={setProg} push={push} onClose={() => setShowProgression(false)} onAddRecord={() => { setShowProgression(false); setTimeout(() => setShowManualRM(true), 200); }}/>}

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
