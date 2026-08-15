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

// ─── Palette dark premium (locale à TodayView) ─────────────────────────────
// Fond & surfaces alignés sur les tokens DARK.* partagés avec la page Accueil
// et les autres surfaces dark de l'app → cohérence visuelle stricte, même
// teinte partout. Le bleu MorphoCoach et le muted restent locaux (accents
// spécifiques à cette page).
const TV = {
  bg:         DARK.bgDeep,             // "#0B0E12" — même fond que Accueil
  surface:    DARK.surface,            // "#1A1F27" — cartes qui ressortent
  surfaceHi:  DARK.surfaceHi,          // "#141922" — surfaces surélevées
  surfaceMid: "#0E1220",               // conservé pour cas spécifiques (legacy composer)
  border:     DARK.border,             // "rgba(255,255,255,0.08)"
  borderHi:   DARK.borderHi,           // "rgba(255,255,255,0.12)"
  text:       DARK.text,               // "#F6F7F9"
  textDim:    DARK.dimStrong,          // "rgba(246,247,249,0.75)"
  muted:      "#9AA3B5",               // gris froid (accent local)
  faint:      "#5A6072",
  blue:       "#3158FF",               // bleu MorphoCoach (accent, conservé)
  blueBright: "#3158FF",
  blueSoft:   "rgba(49,88,255,0.14)",
  blueLine:   "rgba(49,88,255,0.32)",
};

// Images du carousel « Compose ta séance » — Pexels (IDs choisis par Hugo)
const CAROUSEL_IMG = {
  muscu:   "https://images.pexels.com/photos/16996376/pexels-photo-16996376.jpeg",
  cardio:  "https://images.pexels.com/photos/6389882/pexels-photo-6389882.jpeg",
  stretch: "https://images.pexels.com/photos/8436691/pexels-photo-8436691.jpeg",
};

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
        semaineCycle= {(props.semC || 0) + 1}
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

  // ── Records & Objectifs (page pleine, remplace le contenu, garde header) ──
  if (showProgression) {
    return (
      <ProgressionPage EX={EX} prog={prog} setProg={setProg} push={push}
        onClose={() => setShowProgression(false)}/>
);
  }

  return (
    <div style={{
      background: TV.bg,
      color: TV.text,
      fontFamily: DISP,
      minHeight: "100dvh",
      padding: "0 20px 32px",
      boxSizing: "border-box",
    }}>

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

        // Score État de forme — même calcul qu'avant, hissé ici pour le cercle
        let score = 70;
        if (todaySleepLogged !== null) {
          if (todaySleepLogged >= sleepTarget) score += 15;
          else if (todaySleepLogged >= sleepTarget - 1.5) score += 8;
          else score -= 5;
        }
        if (todayMobilite) score += 8;
        if (streak > 0) score += Math.min(7, streak);
        score = Math.max(30, Math.min(100, score));
        const stateLabel = score >= 80 ? "Prêt" : score >= 60 ? "Bon" : "Repos";
        const stateColor = score >= 80 ? "#12B981" : score >= 60 ? "#12B981" : "#F59E0B";
        const CIRC = 2 * Math.PI * 38; // r=38
        const dashLen = CIRC * (score / 100);

        return (
          <div style={{
            paddingTop: 10, marginBottom: 18,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            gap: 16,
            animation:"tdFadeUp .55s cubic-bezier(.22,1,.36,1) both",
            animationDelay:".04s",
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:11, fontWeight:800, letterSpacing:"0.14em",
                color: TV.blueBright, fontFamily: DISP, marginBottom: 10,
              }}>
                {dateLabel}
              </div>
              <div style={{
                fontFamily: DISP, fontSize: 30, fontWeight: 800,
                color: TV.text, letterSpacing: "-0.03em", lineHeight: 1,
              }}>
                {todaySeance
                  ? <>Séance du <span style={{ fontStyle:"italic", color: TV.blueBright }}>jour</span></>
                  : <>Journée <span style={{ fontStyle:"italic", color: TV.blueBright }}>libre</span></>}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 500, color: TV.muted,
                fontFamily: DISP, marginTop: 10, lineHeight: 1.5,
              }}>
                {todaySeance
                  ? "Programmée par ton coach — continue ta progression"
                  : <>Aucune séance ni programme actif<br />— à toi de jouer.</>}
              </div>
            </div>

            {/* État de forme — cercle premium 90×90 à droite */}
            <div
              onClick={() => { setSleepInput(todaySleepLogged ?? sleepTarget); setShowSleepModal(true); }}
              style={{
                flexShrink: 0,
                display:"flex", flexDirection:"column", alignItems:"center", gap: 8,
                cursor:"pointer",
              }}
              aria-label={`État de forme ${score}%`}
            >
              <div style={{
                position:"relative", width: 90, height: 90,
                filter: `drop-shadow(0 6px 18px ${TV.blueSoft})`,
              }}>
                <svg width="90" height="90" viewBox="0 0 90 90"
                  style={{ transform:"rotate(-90deg)" }}>
                  <circle cx="45" cy="45" r="38" fill="none"
                    stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
                  <circle cx="45" cy="45" r="38" fill="none"
                    stroke={TV.blueBright} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${dashLen} ${CIRC - dashLen}`}
                    style={{ filter: `drop-shadow(0 0 6px ${TV.blueBright}55)` }}/>
                </svg>
                <div style={{
                  position:"absolute", inset: 0,
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", gap: 1,
                }}>
                  <span style={{
                    fontSize: 22, fontWeight: 850, color: TV.text,
                    letterSpacing: "-0.03em", lineHeight: 1, fontFamily: DISP,
                  }}>{score}%</span>
                </div>
              </div>
              <div style={{
                display:"flex", alignItems:"center", gap: 6,
                fontSize: 10.5, fontWeight: 700, color: TV.textDim,
                letterSpacing: "0.02em", fontFamily: DISP,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: stateColor,
                  boxShadow: `0 0 6px ${stateColor}88`,
                }}/>
                {stateLabel}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── (État de forme désormais fusionné dans le header sous forme de cercle premium) ── */}

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
        /* COMPOSER V6 — carousel horizontal premium avec grandes cartes 228×266 */
        <div style={{
          marginBottom: 22,
          animation:"tdFadeUp .6s cubic-bezier(.22,1,.36,1) both",
          animationDelay:".16s",
        }}>
          {/* En-tête : label + titre à gauche, bouton "Planifier" à droite */}
          <div style={{
            display:"flex", alignItems:"flex-end", justifyContent:"space-between",
            gap: 12, marginBottom: 16,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 26, fontWeight: 800, letterSpacing:"-0.03em",
                color: TV.text, lineHeight: 1.05, fontFamily: DISP,
              }}>
                Compose ta <span style={{ fontStyle:"italic", color: TV.blueBright }}>séance</span>
              </div>
            </div>
            <button
              onClick={() => setProgView && setProgView("analyse")}
              className="tap"
              style={{
                flexShrink: 0,
                display:"inline-flex", alignItems:"center", gap: 7,
                background: "transparent",
                border: `1px solid ${TV.borderHi}`,
                borderRadius: 12,
                padding: "9px 12px",
                color: TV.text, fontFamily: DISP,
                fontSize: 11.5, fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/>
              </svg>
              Planifier
            </button>
          </div>

          {/* Carousel horizontal — snap, cartes 228×266, gap 12, débord latéral */}
          <div style={{
            display: "flex", gap: 12,
            overflowX: "auto", overflowY: "hidden",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 4,
            marginInline: -20, paddingInline: 20,
            scrollbarWidth: "none",
          }}>
            <style>{`.tv-cs::-webkit-scrollbar{display:none}`}</style>
            {[
              { key:"muscu",   label:"Musculation", sub:"À composer", img: CAROUSEL_IMG.muscu,   icon:"gym",      onClick: () => setShowCreateSeance(true) },
              { key:"cardio",  label:"Cardio",      sub:"20 min",     img: CAROUSEL_IMG.cardio,  icon:"cardio",   onClick: () => setShowCreateSeance(true) },
              { key:"stretch", label:"Étirement",   sub: todayMobilite ? "Fait ✓" : "10 min", img: CAROUSEL_IMG.stretch, icon:"recovery", onClick: toggleMobilite, flash: mobiliteFlash },
            ].map((card, i) => (
              <div key={card.key} onClick={card.onClick}
                className="tap"
                style={{
                  flex: "0 0 228px",
                  height: 266,
                  borderRadius: 22,
                  overflow: "hidden",
                  position: "relative",
                  scrollSnapAlign: "start",
                  cursor: "pointer",
                  border: `1px solid ${card.flash ? "rgba(18,183,106,0.5)" : TV.border}`,
                  background: TV.surface,
                  boxShadow: card.flash
                    ? "0 0 24px rgba(18,183,106,0.35)"
                    : "0 12px 30px rgba(0,0,0,0.35)",
                  animation:"tdFadeUp .55s cubic-bezier(.22,1,.36,1) both",
                  animationDelay:`${(0.22 + i * 0.06).toFixed(2)}s`,
                }}>
                {/* Image de fond */}
                <img src={card.img} alt={card.label}
                  style={{
                    position:"absolute", inset: 0,
                    width:"100%", height:"100%",
                    objectFit:"cover", objectPosition:"center 30%",
                    display:"block",
                  }}/>
                {/* Overlay dégradé bas */}
                <div style={{
                  position:"absolute", inset: 0,
                  background:"linear-gradient(180deg, rgba(5,6,9,0.10) 0%, rgba(5,6,9,0.20) 40%, rgba(5,6,9,0.88) 100%)",
                  pointerEvents:"none",
                }}/>
                {/* (Petit badge d'icône bleu supprimé — la photo devient l'élément visuel principal) */}
                {/* Titre + sous-titre + bouton flèche en bas */}
                <div style={{
                  position:"absolute", left: 16, right: 16, bottom: 16,
                  display:"flex", alignItems:"flex-end", justifyContent:"space-between",
                  gap: 8,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 18, fontWeight: 800, color: "#fff",
                      lineHeight: 1.15, letterSpacing:"-0.02em", fontFamily: DISP,
                    }}>{card.label}</div>
                    <div style={{
                      fontSize: 12, fontWeight: 500,
                      color: "rgba(255,255,255,0.72)",
                      marginTop: 2, fontFamily: DISP,
                    }}>{card.sub}</div>
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(5,6,9,0.55)",
                    border: `1px solid ${TV.blueLine}`,
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    display:"grid", placeItems:"center", flexShrink: 0,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={TV.blueBright} strokeWidth="2.4"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h13M13 6l6 6-6 6"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicateur dots — visuel */}
          <div style={{
            display:"flex", justifyContent:"center", gap: 6,
            marginTop: 14,
          }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: i === 0 ? 18 : 6, height: 6, borderRadius: 999,
                background: i === 0 ? TV.blueBright : "rgba(255,255,255,0.12)",
                transition: "width .3s ease",
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Composer V4 legacy (désactivé — remplacé par carousel V6) ── */}
      {false && (
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
        <div style={{ marginBottom: 0 }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16, gap:12 }}>
            <div style={{
              flex: 1, minWidth: 0,
              fontSize: 26, fontWeight: 800, letterSpacing:"-0.03em",
              color: TV.text, lineHeight: 1.05, fontFamily: DISP,
            }}>
              Records & <span style={{ fontStyle:"italic", color: TV.blueBright }}>Objectifs</span>
            </div>
            <button onClick={() => setShowProgression(true)}
              style={{ flexShrink:0, fontSize:11.5, fontWeight:700, color:TV.text,
                background:"transparent", border:`1px solid ${TV.borderHi}`, borderRadius:12,
                padding:"7px 12px", cursor:"pointer", fontFamily:DISP,
                display:"flex", alignItems:"center", gap:6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/>
              </svg>
              Historique
            </button>
          </div>

          {(() => {
            // ── Valeurs dérivées des données existantes (0 si rien) ──────
            // Aucune donnée inventée : tout vient de rmData / getRM().
            const totalRecords   = rmData.length;
            const objectifsActifs = rmData.filter(ex => ex.rm1 < ex.cible).length;

            // Progression moyenne en % sur les exercices ayant ≥2 entrées
            const gainsPct = rmData.map(ex => {
              const h = ex.historique;
              if (!h || h.length < 2) return null;
              const rms = h.map(x => calc1RM(parseFloat(x.poids), parseInt(x.reps)));
              const first = rms[0], last = rms[rms.length - 1];
              if (!first) return null;
              return ((last - first) / first) * 100;
            }).filter(v => v !== null && isFinite(v));
            const progPct = gainsPct.length
              ? Math.round(gainsPct.reduce((a, b) => a + b, 0) / gainsPct.length)
              : 0;

            // Courbe : historique 1RM du record le plus lourd
            const topEx = rmData.length
              ? rmData.reduce((a, b) => (a.rm1 >= b.rm1 ? a : b))
              : null;
            const sparkValues = topEx?.historique?.length
              ? topEx.historique.map(h => calc1RM(parseFloat(h.poids), parseInt(h.reps)))
              : [];

            // Construction du tracé lissé (ligne + aire)
            const W = 170, H = 82;
            const buildSpark = (values) => {
              if (!values || values.length < 2) {
                const y = H * 0.78; // ligne plate basse quand il n'y a rien
                return {
                  line: `M0,${y} L${W},${y}`,
                  area: `M0,${y} L${W},${y} L${W},${H} L0,${H} Z`,
                  lx: W, ly: y, flat: true,
                };
              }
              const min = Math.min(...values), max = Math.max(...values);
              const span = (max - min) || 1;
              const pts = values.map((v, i) => ({
                x: (i / (values.length - 1)) * W,
                y: H - ((v - min) / span) * (H * 0.80) - H * 0.10,
              }));
              let line = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
              for (let i = 1; i < pts.length; i++) {
                const p0 = pts[i - 1], p1 = pts[i];
                const dx = (p1.x - p0.x) / 2.6;
                line += ` C${(p0.x + dx).toFixed(1)},${p0.y.toFixed(1)} ${(p1.x - dx).toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
              }
              return {
                line,
                area: `${line} L${W},${H} L0,${H} Z`,
                lx: pts[pts.length - 1].x,
                ly: pts[pts.length - 1].y,
                flat: false,
              };
            };
            const spark = buildSpark(sparkValues);
            const hasProg = progPct > 0;

            return (
              <div style={{
                position: "relative", overflow: "hidden",
                borderRadius: 22,
                border: `1px solid ${TV.border}`,
              }}>
                {/* Photo en fond, grand-angle */}
                <img src="https://images.pexels.com/photos/15373907/pexels-photo-15373907.jpeg"
                  alt=""
                  style={{
                    position:"absolute", inset: 0,
                    width:"100%", height:"100%",
                    objectFit:"cover", objectPosition:"center 35%",
                    display:"block",
                  }}/>
                {/* Voile sombre — lisibilité des chiffres par-dessus la photo */}
                <div style={{
                  position:"absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(11,14,18,0.78) 0%, rgba(11,14,18,0.88) 45%, rgba(11,14,18,0.96) 100%)",
                  pointerEvents:"none",
                }}/>

                <div style={{ position:"relative", zIndex: 1 }}>
                  {/* En-tête : titre + badge progression */}
                  <div style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"18px 18px 0", gap: 10,
                  }}>
                    <span style={{
                      fontSize: 15, fontWeight: 800, color:"#fff",
                      letterSpacing:"-0.01em", fontFamily: DISP,
                      textShadow:"0 2px 10px rgba(0,0,0,0.45)",
                    }}>Tes performances</span>
                    <span style={{
                      flexShrink: 0,
                      display:"inline-flex", alignItems:"center", gap: 5,
                      background: hasProg ? "rgba(18,183,106,0.14)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${hasProg ? "rgba(18,183,106,0.30)" : TV.border}`,
                      borderRadius: 99, padding:"4px 9px",
                    }}>
                      <span style={{
                        color: hasProg ? "#12B76A" : TV.muted,
                        fontSize: 11, fontWeight: 800, fontFamily: DISP, ...NUM,
                      }}>{hasProg ? `+${progPct}%` : "0%"}</span>
                      <span style={{ fontSize: 9.5, color: TV.muted, fontFamily: DISP }}>
                        progression
                      </span>
                    </span>
                  </div>

                  {/* Corps : chiffres à gauche, courbe à droite */}
                  <div style={{
                    display:"flex", gap: 16, alignItems:"flex-end",
                    padding:"16px 18px 16px",
                  }}>
                    <div style={{ flexShrink: 0, display:"flex", gap: 18 }}>
                      <div>
                        <div style={{
                          fontSize: 34, fontWeight: 800, lineHeight: 1,
                          letterSpacing:"-0.045em", color: TV.blueBright,
                          fontFamily: DISP, ...NUM,
                        }}>{totalRecords}</div>
                        <div style={{
                          fontSize: 11, color: TV.muted, lineHeight: 1.35,
                          marginTop: 6, fontFamily: DISP,
                        }}>Records<br />personnels</div>
                      </div>
                      <div style={{ width: 1, background: TV.border, alignSelf:"stretch" }}/>
                      <div>
                        <div style={{
                          fontSize: 34, fontWeight: 800, lineHeight: 1,
                          letterSpacing:"-0.045em", color: TV.blueBright,
                          fontFamily: DISP, ...NUM,
                        }}>{objectifsActifs}</div>
                        <div style={{
                          fontSize: 11, color: TV.muted, lineHeight: 1.35,
                          marginTop: 6, fontFamily: DISP,
                        }}>Objectifs<br />actifs</div>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
                        preserveAspectRatio="none" style={{ display:"block" }}>
                        <defs>
                          <linearGradient id="tdSparkFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={TV.blueBright} stopOpacity={spark.flat ? "0.10" : "0.32"}/>
                            <stop offset="100%" stopColor={TV.blueBright} stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path d={spark.area} fill="url(#tdSparkFill)"/>
                        <path d={spark.line} fill="none"
                          stroke={spark.flat ? "rgba(255,255,255,0.16)" : TV.blueBright}
                          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"/>
                        {!spark.flat && (
                          <circle cx={spark.lx} cy={spark.ly} r="3.4"
                            fill={TV.blueBright} stroke={TV.bg} strokeWidth="2"
                            vectorEffect="non-scaling-stroke"/>
                        )}
                      </svg>
                      <div style={{
                        fontSize: 9.5, color: TV.muted, marginTop: 7,
                        fontFamily: DISP, textAlign:"right",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      }}>
                        {topEx ? topEx.nom : "En attente de ta première charge"}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ padding:"0 18px 18px" }}>
                    <button onClick={() => setShowProgression(true)}
                      className="tap"
                      style={{
                        width:"100%",
                        display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 8,
                        padding:"13px 20px", borderRadius: 14,
                        background: TV.blue, border:"none",
                        color:"#fff", fontFamily: DISP,
                        fontSize: 13.5, fontWeight: 750,
                        letterSpacing:"-0.005em", cursor:"pointer",
                        boxShadow:"0 10px 26px rgba(49,88,255,0.42)",
                      }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Ajouter un objectif
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Grille des records — inchangée dans sa logique, adaptée au dark */}
          {rmData.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {rmData.map((ex, i) => {
                  const col  = REC_PALETTE[i % REC_PALETTE.length];
                  const tr   = trendOf(ex.historique);
                  return (
                    <div key={i} onClick={() => setEditRecord(ex)} style={{
                      background:TV.surface, border:`1px solid ${TV.border}`, borderRadius:16,
                      padding:"16px 16px 12px", cursor:"pointer",
                    }}>
                      <div style={{ width:36, height:36, borderRadius:12,
                        background:`${col}1F`,
                        border:`1px solid ${col}3D`,
                        display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                        <I name="gym" size={18} color={col}/>
                      </div>
                      <div style={{ fontFamily:DISP, fontSize:26, fontWeight:700, color:col,
                        letterSpacing:-1, lineHeight:1, ...NUM }}>{ex.rm1}</div>
                      <div style={{ fontSize:10, color:TV.muted, fontWeight:600, marginTop:1, fontFamily:DISP }}>kg · 1RM</div>
                      <div style={{ fontSize:13, color:TV.text, fontWeight:600, marginTop:8,
                        fontFamily:DISP, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis",
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{ex.nom}</div>
                      {tr && <div style={{ fontSize:10, color:"#12B76A", fontWeight:700, marginTop:4, fontFamily:DISP }}>+{tr} kg</div>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowProgression(true)} style={{
                width:"100%", padding:"16px", borderRadius:16,
                background:TV.blue, border:"none",
                color:"#FFF", fontFamily:DISP, fontSize:15, fontWeight:800,
                letterSpacing:-0.2, cursor:"pointer",
                boxShadow:"0 8px 24px rgba(49,88,255,0.38)",
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
