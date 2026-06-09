import { useState } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { Card, Eyebrow, Btn } from "../../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";
import { calc1RM, calcKgFor, catColor as cc, toDateKey } from "../../utils/training.js";
import { ManualRMModal, CreateSeanceModal, EditRecordModal, RMCard, OBJ_TARGET, DEFAULT_TARGET } from "./components/TodayViewModals.jsx";
import FocusMode from "./FocusMode.jsx";

const DISP = FONT;
const SERIF_F = SERIF;

export default function TodayView(props) {
  const { prog, setProg, calSess, setCalSess, checkedEx, setCheckedEx,
    seance, setSeance, setChrono, setChronoSec,
    exDetails, setExDetails, exEdit, setExEdit,
    profil, EX, C: _C, INT, push, setProgView, setTab } = props;

  const [viewSeance,       setViewSeance]       = useState(null);
  const [showManualRM,     setShowManualRM]      = useState(false);
  const [showCreateSeance, setShowCreateSeance]  = useState(false);
  const [tipIdx,             setTipIdx]             = useState(0);
  const [editRecord,       setEditRecord]        = useState(null);
  const [focusActive,      setFocusActive]       = useState(false);

  // ── Sommeil — target + log quotidien ────────────────────────────────────
  const [sleepTarget, setSleepTarget] = useState(() =>
    parseFloat(localStorage.getItem('morpho_sleep_target') || '8')
  );
  const [sleepLog, setSleepLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('morpho_sleep_log') || '{}'); }
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
    try { return JSON.parse(localStorage.getItem('morpho_mobilite_log') || '{}'); }
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
    const objectif = profil?.objectif || "hypertrophie";
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
        const objectif = profil?.objectif || "hypertrophie";
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
    const key = `${seanceId}-${exIdx}`;
    setCheckedEx(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (repos && !prev[key]) {
        const secs = parseInt(repos) || 90;
        setChrono(true);
        setChronoSec(secs);
      }
      return next;
    });
  };

  const REST_TIPS = [
    { icon: "💧", title: "Hydrate-toi bien", desc: "La récupération musculaire dépend de ton hydratation. Vise 2,5L aujourd'hui." },
    { icon: "🥩", title: "Protéines++", desc: "Un apport élevé en protéines aujourd'hui accélère la reconstruction musculaire." },
    { icon: "😴", title: "8h de sommeil", desc: "80% des gains se font la nuit. Dors tôt, ton corps travaille pour toi." },
  ];

  const rmData       = prog ? getRM() : [];
  const objectif     = profil?.objectif || "hypertrophie";
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
        onClose     = {() => setFocusActive(false)}
      />
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 6, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: "#6B7280", textTransform: "uppercase", fontFamily: DISP, marginBottom: 5 }}>
          {today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div style={{ fontFamily: SERIF_F, fontSize: 28, color: "${C.text}", lineHeight: 1.1, letterSpacing: -1 }}>
          Séance du <span style={{ fontStyle: "italic", color: C.blue }}>jour</span>
        </div>
      </div>

      {/* ── Séance du jour ───────────────────────────────────────── */}
      {todaySeance ? (() => {
        const intData = INT[todaySeance.intensite || "modere"] || INT.modere;
        const total   = todaySeance.exercices?.length || 0;
        const done    = todaySeance.exercices?.filter((_, i) => checkedEx[`${todaySeance.id}-${i}`]).length || 0;
        const pct     = total > 0 ? Math.round(done / total * 100) : 0;

        return (
          <>
            {/* Hero card */}
            <div style={{
              background: `linear-gradient(150deg, ${intData.c} 0%, ${intData.c}CC 60%, ${intData.c}88 100%)`,
              borderRadius: 22, padding: "20px 18px", marginBottom: 12,
              position: "relative", overflow: "hidden",
              boxShadow: `0 18px 40px ${intData.c}40`,
            }}>
              <div style={{ position: "absolute", top: -50, right: -40, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.11), transparent 65%)", pointerEvents: "none" }}/>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 34, position: "relative" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.4px", color: "rgba(0,0,0,0.46)", background: "rgba(0,0,0,0.18)", padding: "6px 12px", borderRadius: 99, fontFamily: DISP }}>
                  SÉANCE DU JOUR
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: SERIF_F, fontSize: 30, color: "#fff", lineHeight: 1 }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", fontFamily: DISP, marginTop: 2 }}>{done}/{total}</div>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: SERIF_F, fontSize: 31, color: "#fff", lineHeight: 1, marginBottom: 6, letterSpacing: -1 }}>
                  {todaySeance.nom}
                </div>
                <div style={{ fontSize: 12.5, color: "rgba(0,0,0,0.42)", fontFamily: DISP, marginBottom: 15, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(0,0,0,0.38)", flexShrink: 0 }}/>
                  {intData.l} · {todaySeance.duree || "60 min"} · {total} exercice{total !== 1 ? "s" : ""}
                </div>
                {/* Barre progression */}
                <div style={{ height: 4, background: "rgba(0,0,0,0.12)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#fff", borderRadius: 99, transition: "width .5s ease" }}/>
                </div>
              </div>
            </div>

            {/* Checklist exercices */}
            {!todaySeance.complete && (
              <div style={{ background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 18, padding: "4px 14px", marginBottom: 10 }}>
                {(todaySeance.exercices || []).map((ex, idx) => {
                  const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                  const exColor   = cc(ex.cat);
                  const last      = idx === todaySeance.exercices.length - 1;
                  const lastEntry = ex.historique?.[ex.historique.length - 1];
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: last ? "none" : `1px solid ${C.bd}` }}>
                      <div onClick={() => toggleCheck(todaySeance.id, idx, ex.repos, todaySeance._calKey)} style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        display: "grid", placeItems: "center",
                        cursor: "pointer",
                        background: isChecked ? "linear-gradient(145deg,#5FE0A5,#2DA67D)" : `${exColor}18`,
                        border: isChecked ? "none" : `1px solid ${exColor}35`,
                        color: isChecked ? "#0B1F18" : exColor,
                        fontSize: isChecked ? 14 : 12, fontWeight: 800, fontFamily: DISP,
                        boxShadow: isChecked ? "0 4px 10px rgba(95,224,165,0.35)" : "none",
                        transition: "all .15s",
                      }}>{isChecked ? "✓" : idx + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isChecked ? "${C.dim}" : "${C.text}", fontFamily: DISP, textDecoration: isChecked ? "line-through" : "none", letterSpacing: -0.2 }}>{ex.nom}</div>
                        <div style={{ fontSize: 10, color: "${C.dim}", fontFamily: DISP, marginTop: 2 }}>{ex.series}×{ex.reps} · {ex.repos}{ex.methode && ex.methode !== "Classique" ? ` · ${ex.methode}` : ""}</div>
                      </div>
                      {lastEntry && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: exColor, fontFamily: DISP, flexShrink: 0, ...NUM }}>
                          {lastEntry.poids}kg
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA démarrer */}
            {!todaySeance.complete && (
              <button onClick={() => setFocusActive(true)} style={{
                width: "100%", padding: "15px", borderRadius: 16,
                background: "#F5F1E8", border: "none",
                color: "#0B0F1F", fontSize: 14, fontWeight: 700,
                fontFamily: DISP, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 8px 24px rgba(245,241,232,0.14)",
                marginBottom: 20,
              }}>
                ▶ Démarrer la séance
              </button>
            )}
            {todaySeance.complete && (
              <div style={{ padding: "12px 0", fontSize: 12, color: "#5FE0A5", fontWeight: 700, textAlign: "center", fontFamily: DISP }}>
                ✓ Séance complétée
              </div>
            )}
          </>
        );
      })() : (
        /* Jour de repos — design récupération */
        <div style={{
          background: "linear-gradient(155deg,#0f1e38,#0d1424)",
          border: "1px solid rgba(59,130,246,0.18)",
          borderRadius: 22, padding: "22px 20px 18px",
          marginBottom: 14, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position:"absolute",top:-50,right:-50,width:170,height:170,borderRadius:"50%",background:"radial-gradient(circle,rgba(52,211,153,0.14),transparent 68%)",pointerEvents:"none" }}/>

          {/* Badge + date */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"6px 13px",borderRadius:99,background:"rgba(52,211,153,0.10)",border:"1px solid rgba(52,211,153,0.30)" }}>
              <span style={{ fontSize:13 }}>🌿</span>
              <span style={{ fontSize:10,fontWeight:700,color:"#34D399",letterSpacing:"0.8px",fontFamily:DISP }}>JOUR DE RÉCUPÉRATION</span>
            </div>
            <div style={{ fontSize:11,color:"${C.dim}",fontWeight:600,fontFamily:DISP }}>
              {today.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}
            </div>
          </div>

          {/* Titre */}
          <div style={{ fontFamily:SERIF_F,fontSize:30,color:"${C.text}",lineHeight:1.08,letterSpacing:-1,marginBottom:10 }}>
            Aujourd'hui, on<br/><span style={{ color:"#60A5FA",fontStyle:"italic" }}>récupère.</span>
          </div>
          <div style={{ fontSize:12.5,color:"#374151",lineHeight:1.6,fontFamily:DISP,marginBottom:18 }}>
            La récup fait partie du programme. Voici 3 gestes qui comptent vraiment.
          </div>

          {/* Gestes récup */}
          {[
            {
              ic: "💧",
              bg: "rgba(52,211,153,0.12)", bd: "rgba(52,211,153,0.25)",
              t:  "Hydratation · 2,5 L",
              s:  "Tap pour tracker ton eau →",
              tap: () => setTab?.("nutrition"),
              arrow: true,
            },
            {
              ic: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ? "✅" : todaySleepLogged >= sleepTarget - 1.5 ? "🟡" : "🔴"
                : "😴",
              bg: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ? "rgba(52,211,153,0.12)" : todaySleepLogged >= sleepTarget-1.5 ? "rgba(251,146,60,0.14)" : "rgba(248,113,113,0.12)"
                : "rgba(129,140,248,0.14)",
              bd: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ? "rgba(52,211,153,0.30)" : todaySleepLogged >= sleepTarget-1.5 ? "rgba(251,146,60,0.30)" : "rgba(248,113,113,0.30)"
                : "rgba(129,140,248,0.28)",
              t: todaySleepLogged !== null
                ? `Sommeil · ${todaySleepLogged}h dormies`
                : `Sommeil · cible ${sleepTarget}h`,
              s: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ? "✓ Objectif atteint — super récup" : `${(sleepTarget - todaySleepLogged).toFixed(1)}h sous la cible`
                : "Tap pour logger · 80% des gains la nuit",
              tap: () => { setSleepInput(todaySleepLogged ?? sleepTarget); setShowSleepModal(true); },
              arrow: true,
            },
            {
              ic: todayMobilite ? "✅" : "🧘",
              bg: todayMobilite ? "rgba(52,211,153,0.14)" : "rgba(59,130,246,0.14)",
              bd: todayMobilite ? "rgba(52,211,153,0.32)" : "rgba(59,130,246,0.28)",
              t:  todayMobilite ? "Mobilité · Fait ✓" : "Mobilité · 10 min",
              s:  todayMobilite ? "Hanches & thoracique — bien joué !" : "Tap pour marquer comme fait",
              tap: toggleMobilite,
              flash: mobiliteFlash,
              arrow: false,
              badge: true,
            },
          ].map((g,i) => (
            <div key={i} onClick={g.tap||undefined} style={{
              display:"flex", alignItems:"center", gap:13, padding:"11px 0",
              borderTop:"1px solid rgba(0,0,0,0.05)",
              cursor: g.tap ? "pointer" : "default",
              transition: "opacity .15s",
            }}>
              <div style={{
                width:42, height:42, borderRadius:13,
                background: g.flash ? "rgba(52,211,153,0.30)" : g.bg,
                border:`1px solid ${g.flash ? "rgba(52,211,153,0.60)" : g.bd}`,
                display:"grid", placeItems:"center", flexShrink:0, fontSize:20,
                transition:"background .3s, border .3s",
                boxShadow: g.flash ? "0 0 16px rgba(52,211,153,0.40)" : "none",
              }}>{g.ic}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14.5, fontWeight:700, color:"${C.text}", fontFamily:DISP, letterSpacing:-0.2 }}>{g.t}</div>
                <div style={{ fontSize:11.5, color:"#374151", fontFamily:DISP, marginTop:1 }}>{g.s}</div>
              </div>
              {/* Indicateur interactif */}
              {g.badge && (
                <div style={{
                  width:28, height:28, borderRadius:9, flexShrink:0,
                  background: todayMobilite ? "rgba(52,211,153,0.18)" : "rgba(0,0,0,0.04)",
                  border: `1.5px solid ${todayMobilite ? "rgba(52,211,153,0.50)" : "rgba(0,0,0,0.08)"}`,
                  display:"grid", placeItems:"center",
                  transition:"all .2s",
                }}>
                  {todayMobilite
                    ? <span style={{ color:"#34D399", fontSize:13 }}>✓</span>
                    : <span style={{ color:"rgba(0,0,0,0.10)", fontSize:11 }}>○</span>}
                </div>
              )}
              {g.arrow && <div style={{ fontSize:14, color:"#6B7280", flexShrink:0 }}>›</div>}
            </div>
          ))}

          {/* CTA — créer une séance malgré tout */}
          <button onClick={() => setShowCreateSeance(true)} style={{
            width:"100%",marginTop:16,padding:"13px",borderRadius:14,
            background:"rgba(59,130,246,0.10)",border:"1px solid rgba(59,130,246,0.25)",
            color:"#60A5FA",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DISP,
          }}>
            + Créer une séance aujourd'hui
          </button>
        </div>
      )}

      {/* ── Records ─────────────────────────────────────────────── */}
      {prog && (() => {
        const REC_PALETTE = ["#60A5FA","#34D399","#FBBF24","#F87171","#B69DFF","#3B82F6"];
        const trendOf = (hist) => {
          if (!hist || hist.length < 2) return null;
          const rms = hist.map(h => calc1RM(parseFloat(h.poids), parseInt(h.reps)));
          const last = rms[rms.length - 1];
          const prevBest = Math.max(...rms.slice(0, -1));
          const d = Math.round(last - prevBest);
          return d > 0 ? d : null;
        };
        const recBtn = {
          width:"100%", padding:"15px", borderRadius:16,
          background:"linear-gradient(180deg,#3B82F6,#2563EB)", border:"none",
          color:"#fff", fontFamily:DISP, fontSize:14, fontWeight:700, letterSpacing:-0.2,
          cursor:"pointer", boxShadow:"0 8px 24px rgba(59,130,246,0.32)",
        };
        return (
        <div style={{ marginBottom: 20 }}>
          {/* Header */}
          <div style={{ marginBottom: 13 }}>
            <div style={{ fontFamily: SERIF_F, fontSize: 21, fontWeight: 400, color: "${C.text}", letterSpacing: -0.4 }}>Records & Objectifs</div>
          </div>

          {rmData.length === 0 ? (
            <div style={{ background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 18, overflow:"hidden" }}>
              {/* Empty state avec CTA visible */}
              <div style={{ padding:"22px 18px 18px", textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:9 }}>📊</div>
                <div style={{ fontFamily:DISP,fontSize:15,fontWeight:700,color:"${C.text}",marginBottom:6 }}>Pas encore de données</div>
                <div style={{ fontSize:11.5,color:"#374151",lineHeight:1.6,marginBottom:16,fontFamily:DISP }}>
                  Enregistre tes charges pendant les séances pour voir tes records et tes 1RM estimés.
                </div>
                <button onClick={() => setShowManualRM(true)} style={recBtn}>
                  Saisir un record
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:10 }}>
                {rmData.map((ex, i) => {
                  const col = REC_PALETTE[i % REC_PALETTE.length];
                  const tr  = trendOf(ex.historique);
                  return (
                    <div key={i} onClick={() => setEditRecord(ex)} style={{
                      background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                      padding:"16px 8px 13px", textAlign:"center", cursor:"pointer", overflow:"hidden",
                    }}>
                      <div style={{ fontFamily:DISP, fontSize:26, fontWeight:800, color:col, letterSpacing:-1, lineHeight:1, ...NUM }}>{ex.rm1}</div>
                      <div style={{ fontSize:9.5, color:"${C.dim}", fontWeight:600, marginTop:2, fontFamily:DISP }}>kg · 1RM</div>
                      <div style={{ fontSize:11, color:"${C.mid}", fontWeight:600, marginTop:9, fontFamily:DISP, lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{ex.nom}</div>
                      {tr && <div style={{ fontSize:9.5, color:"#34D399", fontWeight:700, marginTop:3, fontFamily:DISP }}>▲ +{tr}</div>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowManualRM(true)} style={recBtn}>
                Saisir un record
              </button>
            </div>
          )}
        </div>
        );
      })()}

      {/* Pas de programme */}
      {!prog && (
        <Card style={{ textAlign: "center", padding: "20px 16px", marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#374151", marginBottom: 12 }}>Aucun programme actif</div>
          <Btn onClick={() => setProgView("analyse")}>✨ Générer mon programme</Btn>
          <Btn v="out" onClick={() => setProgView("creer")}>Créer manuellement</Btn>
        </Card>
      )}

      {/* Modals */}
      {showManualRM && <ManualRMModal onClose={() => setShowManualRM(false)} prog={prog} setProg={setProg} push={push} C={C} EX={EX}/>}
      {showCreateSeance && <CreateSeanceModal onClose={() => setShowCreateSeance(false)} prog={prog} setProg={setProg} calSess={calSess} setCalSess={setCalSess} push={push} C={C} INT={INT} EX={EX} todayKey={todayKey}/>}
      {editRecord && <EditRecordModal exData={editRecord} onClose={() => setEditRecord(null)} prog={prog} setProg={setProg} push={push} C={C}/>}

      {/* ── Modal Sommeil ─────────────────────────────────────────── */}
      {showSleepModal && (() => {
        const F = DISP;
        const inputVal = sleepInput ?? sleepTarget;
        const step  = v => Math.min(12, Math.round((v + 0.5) * 2) / 2);
        const stepD = v => Math.max(4, Math.round((v - 0.5) * 2) / 2);
        const qualColor = (h) => h >= sleepTarget ? "#34D399" : h >= sleepTarget-1.5 ? "#FB923C" : "#F87171";
        const qualLabel = (h) => h >= sleepTarget ? "Optimal 🌟" : h >= sleepTarget-1.5 ? "Acceptable" : "Insuffisant";
        return (
          <div onClick={()=>setShowSleepModal(false)} style={{
            position:"fixed",inset:0,zIndex:700,
            background:"rgba(4,7,15,0.75)",backdropFilter:"blur(4px)",
            display:"flex",alignItems:"flex-end",justifyContent:"center",
          }}>
            <div onClick={e=>e.stopPropagation()} style={{
              width:"100%",maxWidth:480,
              background:"#FFFFFF",border:"1px solid rgba(0,0,0,0.06)",
              borderRadius:"22px 22px 0 0",padding:"0 0 40px",
              boxShadow:"0 -20px 60px rgba(0,0,0,0.55)",
            }}>
              {/* Handle */}
              <div style={{ width:38,height:4,borderRadius:2,background:"rgba(0,0,0,0.08)",margin:"14px auto 0" }}/>

              {/* Header */}
              <div style={{ padding:"18px 22px 0",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:F,fontSize:18,fontWeight:700,color:"${C.text}",letterSpacing:-0.4 }}>😴 Sommeil</div>
                  <div style={{ fontSize:11,color:"${C.dim}",marginTop:3,fontFamily:F }}>Cible & log quotidien</div>
                </div>
                <button onClick={()=>setShowSleepModal(false)} style={{
                  width:36,height:36,borderRadius:10,background:"rgba(0,0,0,0.05)",
                  border:"1px solid rgba(0,0,0,0.06)",color:"#374151",
                  fontSize:16,cursor:"pointer",display:"grid",placeItems:"center",
                }}>×</button>
              </div>

              {/* Séparateur */}
              <div style={{ height:1,background:"rgba(0,0,0,0.05)",margin:"16px 0" }}/>

              <div style={{ padding:"0 22px" }}>

                {/* ── Section 1 : Cible ─────────────────────────── */}
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"1.6px",textTransform:"uppercase",
                              color:"${C.dim}",marginBottom:14,fontFamily:F }}>
                  OBJECTIF NUIT
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                              background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.06)",
                              borderRadius:16,padding:"14px 16px",marginBottom:20 }}>
                  <button onClick={()=>saveSleepTarget(stepD(sleepTarget))} style={{
                    width:44,height:44,borderRadius:13,background:"rgba(0,0,0,0.05)",
                    border:"none",color:"#374151",fontSize:18,cursor:"pointer",
                    display:"grid",placeItems:"center",
                  }}>−</button>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:36,fontWeight:700,color:"${C.text}",letterSpacing:-1,fontFamily:F }}>
                      {sleepTarget}<span style={{ fontSize:16,color:"#374151",marginLeft:3 }}>h</span>
                    </div>
                    <div style={{ fontSize:10,color:"${C.dim}",fontFamily:F,marginTop:2 }}>cible par nuit</div>
                  </div>
                  <button onClick={()=>saveSleepTarget(step(sleepTarget))} style={{
                    width:44,height:44,borderRadius:13,
                    background:"rgba(91,141,239,0.14)",border:"1px solid rgba(91,141,239,0.32)",
                    color:"#9CB9F5",fontSize:18,cursor:"pointer",display:"grid",placeItems:"center",
                  }}>+</button>
                </div>

                {/* ── Section 2 : Log aujourd'hui ───────────────── */}
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"1.6px",textTransform:"uppercase",
                              color:"${C.dim}",marginBottom:14,fontFamily:F }}>
                  CETTE NUIT
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                              background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.06)",
                              borderRadius:16,padding:"14px 16px",marginBottom:16 }}>
                  <button onClick={()=>setSleepInput(stepD(inputVal))} style={{
                    width:44,height:44,borderRadius:13,background:"rgba(0,0,0,0.05)",
                    border:"none",color:"#374151",fontSize:18,cursor:"pointer",
                    display:"grid",placeItems:"center",
                  }}>−</button>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:36,fontWeight:700,color:"${C.text}",letterSpacing:-1,fontFamily:F }}>
                      {inputVal}<span style={{ fontSize:16,color:"#374151",marginLeft:3 }}>h</span>
                    </div>
                    <div style={{ fontSize:11,fontWeight:600,color:qualColor(inputVal),fontFamily:F,marginTop:2 }}>
                      {qualLabel(inputVal)}
                    </div>
                  </div>
                  <button onClick={()=>setSleepInput(step(inputVal))} style={{
                    width:44,height:44,borderRadius:13,
                    background:"rgba(91,141,239,0.14)",border:"1px solid rgba(91,141,239,0.32)",
                    color:"#9CB9F5",fontSize:18,cursor:"pointer",display:"grid",placeItems:"center",
                  }}>+</button>
                </div>

                {/* Barre de comparaison */}
                <div style={{ marginBottom:22 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                    <span style={{ fontSize:11,color:"${C.dim}",fontFamily:F }}>0h</span>
                    <span style={{ fontSize:11,color:"rgba(91,141,239,0.7)",fontFamily:F }}>cible {sleepTarget}h</span>
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
                  width:"100%",padding:"15px",borderRadius:14,
                  background:"linear-gradient(180deg,#9CB9F5 0%,#5B8DEF 50%,#2D5DC9 100%)",
                  color:"#fff",border:"1px solid rgba(156,185,245,0.4)",
                  fontFamily:F,fontSize:14,fontWeight:700,cursor:"pointer",
                  boxShadow:"inset 0 1px 0 rgba(0,0,0,0.14), 0 8px 22px rgba(45,93,201,0.42)",
                }}>
                  ✓ Enregistrer {inputVal}h de sommeil
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
