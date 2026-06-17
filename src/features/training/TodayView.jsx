import { useState } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { Card, Eyebrow, Btn } from "../../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";
import { calc1RM, calcKgFor, catColor as cc, toDateKey } from "../../utils/training.js";
import { ManualRMModal, CreateSeanceModal, EditRecordModal, RMCard, OBJ_TARGET, DEFAULT_TARGET } from "./components/TodayViewModals.jsx";
import RecordDetailPage from "./components/RecordDetailPage.jsx";
import FocusMode from "./FocusMode.jsx";

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
    setCheckedEx(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const REST_TIPS = [
    { icon: "💧", title: "Hydrate-toi bien", desc: "La récupération musculaire dépend de ton hydratation. Vise 2,5L aujourd'hui." },
    { icon: "🥩", title: "Protéines++", desc: "Un apport élevé en protéines aujourd'hui accélère la reconstruction musculaire." },
    { icon: "😴", title: "8h de sommeil", desc: "80% des gains se font la nuit. Dors tôt, ton corps travaille pour toi." },
  ];

  const rmData       = prog ? getRM() : [];

  // Streak d'entraînements consécutifs depuis le log localStorage
  const streak = (() => {
    try {
      const log = JSON.parse(localStorage.getItem('morpho_workout_log') || '{}');
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
        premium     = {premium}
        onClose     = {() => setFocusActive(false)}
      />
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 6, marginBottom: 14 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily: SERIF_F, fontSize: 28, color: C.text, lineHeight: 1.1, letterSpacing: -1 }}>
              Séance du <span style={{ fontStyle: "italic", color: C.blue }}>jour</span>
            </div>
            {todaySeance && (
              <div style={{ fontSize:12, color:"#6B7280", fontFamily:DISP, marginTop:4 }}>
                Continue ta progression 💪
              </div>
            )}
          </div>
          {streak > 0 && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
              background:"rgba(245,158,11,0.10)", border:"1px solid rgba(245,158,11,0.22)",
              borderRadius:14, padding:"8px 12px", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:16 }}>🔥</span>
                <span style={{ fontSize:20, fontWeight:800, color:"#D97706", fontFamily:DISP, lineHeight:1 }}>{streak}</span>
              </div>
              <div style={{ fontSize:9, fontWeight:600, color:"#92400E", fontFamily:DISP,
                letterSpacing:"0.5px", marginTop:2, textAlign:"center" }}>
                série actuelle
              </div>
            </div>
          )}
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
            {(() => {
              const R = 34, CIRC = 2 * Math.PI * R;
              const ringOffset = CIRC * (1 - pct / 100);
              const dureeMin = todaySeance.duree?.replace(/[^0-9-]/g, '') || "45-60";
              const restMin = total > 0 && done > 0
                ? (() => {
                    const parts = dureeMin.split('-').map(Number);
                    const avg = parts.reduce((a,b) => a+b, 0) / parts.length;
                    const rem = Math.round(avg * (1 - pct / 100));
                    return rem > 0 ? `~${rem} min` : "Presque fini !";
                  })()
                : null;
              return (
                <div style={{
                  background: "linear-gradient(150deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%)",
                  borderRadius: 22, padding: "18px 18px 0", marginBottom: 12,
                  position: "relative", overflow: "hidden",
                  boxShadow: "0 18px 40px rgba(30,58,138,0.45)",
                }}>
                  {/* Halo décoratif */}
                  <div style={{ position:"absolute", top:-60, right:-40, width:200, height:200,
                    borderRadius:"50%", background:"radial-gradient(circle, rgba(96,165,250,0.18), transparent 65%)",
                    pointerEvents:"none" }}/>
                  {/* Silhouette athlete (placeholder gradient) */}
                  <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"45%",
                    background:"linear-gradient(90deg, transparent 0%, rgba(30,58,138,0.0) 20%, rgba(255,255,255,0.04) 100%)",
                    pointerEvents:"none" }}/>

                  {/* Row : badge + ring */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, position:"relative" }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"1.4px",
                      color:"rgba(255,255,255,0.7)", background:"rgba(0,0,0,0.30)",
                      padding:"6px 12px", borderRadius:99, fontFamily:DISP, backdropFilter:"blur(8px)" }}>
                      SÉANCE DU JOUR
                    </div>
                    {/* Ring SVG */}
                    <svg width={88} height={88} viewBox="0 0 88 88" style={{ flexShrink:0 }}>
                      <circle cx={44} cy={44} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={5}/>
                      <circle cx={44} cy={44} r={R} fill="none" stroke="#34D399" strokeWidth={5}
                        strokeDasharray={CIRC} strokeDashoffset={ringOffset}
                        strokeLinecap="round" transform="rotate(-90 44 44)"
                        style={{ transition:"stroke-dashoffset .6s ease" }}/>
                      <text x={44} y={40} textAnchor="middle" fill="#fff"
                        fontSize="17" fontWeight="800" fontFamily={DISP}>{pct}%</text>
                      <text x={44} y={56} textAnchor="middle" fill="rgba(255,255,255,0.55)"
                        fontSize="10" fontFamily={DISP}>{done}/{total}</text>
                    </svg>
                  </div>

                  {/* Titre */}
                  <div style={{ fontFamily:SERIF_F, fontSize:34, color:"#fff", lineHeight:1,
                    marginBottom:10, letterSpacing:-1, position:"relative" }}>
                    {todaySeance.nom}
                  </div>

                  {/* Méta */}
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14,
                    position:"relative" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5,
                      fontSize:12, color:"rgba(255,255,255,0.65)", fontFamily:DISP }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                      </svg>
                      {intData.l} · {todaySeance.duree || "45-60 min"}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5,
                      fontSize:12, color:"rgba(255,255,255,0.65)", fontFamily:DISP }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round">
                        <path d="M6.5 6.5h11M6.5 6.5A2.5 2.5 0 014 4M17.5 6.5A2.5 2.5 0 0020 4M6.5 17.5h11M6.5 17.5A2.5 2.5 0 014 20M17.5 17.5A2.5 2.5 0 0020 20M12 6.5v11"/>
                      </svg>
                      {total} exercice{total !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height:3, background:"rgba(255,255,255,0.12)", borderRadius:99,
                    overflow:"hidden", marginBottom:0, position:"relative" }}>
                    <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, transition:"width .5s ease",
                      background:"linear-gradient(90deg, #34D399, #10B981)" }}/>
                  </div>

                  {/* Footer barre */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"10px 0 14px", position:"relative" }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.50)", fontFamily:DISP }}>
                      {restMin ? `Temps estimé restant : ${restMin}` : `Prêt à commencer`}
                    </div>
                    <button onClick={() => setViewSeance(todaySeance)}
                      style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.65)",
                        background:"none", border:"none", cursor:"pointer", fontFamily:DISP,
                        display:"flex", alignItems:"center", gap:3 }}>
                      Détails
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M9 6l6 6-6 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Exercices */}
            {!todaySeance.complete && (
              <>
                {/* Header section */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginBottom:10, marginTop:4 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:DISP,
                    letterSpacing:-0.3 }}>Exercices</div>
                  <button onClick={() => setViewSeance(todaySeance)}
                    style={{ fontSize:12, fontWeight:600, color:"#374151", background:"#F0F2F7",
                      border:"none", borderRadius:10, padding:"5px 11px", cursor:"pointer",
                      fontFamily:DISP }}>
                    Voir tout
                  </button>
                </div>

                {/* Cards */}
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10 }}>
                  {(todaySeance.exercices || []).map((ex, idx) => {
                    const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                    const exColor   = cc(ex.cat);
                    const lastEntry = ex.historique?.[ex.historique.length - 1];
                    // Palette thumbnails par catégorie
                    const thumbColors = {
                      push:["#EAF1FF","#3B82F6"], pull:["#E8FAF1","#10B981"],
                      legs:["#FEF6E7","#F59E0B"], core:["#F3F0FF","#6366F1"],
                    };
                    const tc = thumbColors[ex.cat] || ["#F0F2F7","#6B7280"];
                    return (
                      <div key={idx} style={{
                        background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                        padding:"12px 14px",
                        boxShadow:"0 1px 2px rgba(15,23,42,0.03),0 2px 6px rgba(15,23,42,0.04)",
                        display:"flex", alignItems:"center", gap:12,
                      }}>
                        {/* Thumbnail coloré */}
                        <div style={{
                          width:52, height:52, borderRadius:13, flexShrink:0,
                          background:`linear-gradient(135deg, ${tc[0]}, ${tc[1]}22)`,
                          border:`1px solid ${tc[1]}30`,
                          display:"grid", placeItems:"center",
                        }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke={tc[1]} strokeWidth="1.8" strokeLinecap="round">
                            <path d="M6.5 6.5h11M6.5 6.5A2.5 2.5 0 014 4M17.5 6.5A2.5 2.5 0 0120 4M6.5 17.5h11M6.5 17.5A2.5 2.5 0 014 20M17.5 17.5A2.5 2.5 0 0120 20M12 6.5v11"/>
                          </svg>
                        </div>

                        {/* Numéro badge */}
                        <div onClick={() => toggleCheck(todaySeance.id, idx, ex.repos, todaySeance._calKey)}
                          style={{
                            width:28, height:28, borderRadius:9, flexShrink:0,
                            display:"grid", placeItems:"center", cursor:"pointer",
                            background: isChecked ? "linear-gradient(145deg,#5FE0A5,#2DA67D)" : "rgba(59,130,246,0.10)",
                            border: isChecked ? "none" : "1px solid rgba(59,130,246,0.20)",
                            color: isChecked ? "#0B1F18" : "#3B82F6",
                            fontSize: 12, fontWeight:800, fontFamily:DISP,
                            boxShadow: isChecked ? "0 3px 8px rgba(95,224,165,0.35)" : "none",
                            transition:"all .15s",
                          }}>
                          {isChecked ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          ) : idx + 1}
                        </div>

                        {/* Infos */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{
                            fontSize:13.5, fontWeight:700, color: isChecked ? "#9CA3AF" : C.text,
                            fontFamily:DISP, letterSpacing:-0.2,
                            textDecoration: isChecked ? "line-through" : "none",
                          }}>{ex.nom}</div>
                          <div style={{ fontSize:10.5, color:"#6B7280", fontFamily:DISP, marginTop:2 }}>
                            {ex.series}×{ex.reps} · {ex.repos}s{ex.methode && ex.methode !== "Classique" ? ` · ${ex.methode}` : ""}
                          </div>
                        </div>

                        {/* Poids / check */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end",
                          gap:3, flexShrink:0 }}>
                          {isChecked && (
                            <div style={{
                              width:28, height:28, borderRadius:9,
                              background:"linear-gradient(145deg,#5FE0A5,#2DA67D)",
                              display:"grid", placeItems:"center",
                              boxShadow:"0 3px 8px rgba(95,224,165,0.35)",
                            }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="#0B1F18" strokeWidth="2.8" strokeLinecap="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </div>
                          )}
                          {lastEntry && (
                            <div style={{ fontSize:10.5, fontWeight:700, color:exColor,
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

            {/* CTA démarrer */}
            {!todaySeance.complete && (
              <button onClick={() => setFocusActive(true)} style={{
                width:"100%", padding:"16px", borderRadius:18,
                background:"linear-gradient(160deg, #34D399 0%, #10B981 50%, #059669 100%)",
                border:"none", color:"#fff", fontSize:15, fontWeight:700,
                fontFamily:DISP, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                boxShadow:"0 10px 28px rgba(16,185,129,0.38), inset 0 1px 0 rgba(255,255,255,0.25)",
                marginBottom:20, letterSpacing:0.1,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Démarrer la séance
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
        /* Jour de repos — design récupération LIGHT */
        <div style={{
          background: "#FFFFFF",
          border: "1px solid rgba(59,130,246,0.18)",
          borderRadius: 22, padding: "22px 20px 18px",
          marginBottom: 14, position: "relative", overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ position:"absolute",top:-30,right:-30,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(52,211,153,0.08),transparent 68%)",pointerEvents:"none" }}/>

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
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13 }}>
            <div style={{ fontFamily:SERIF_F, fontSize:21, fontWeight:400, color:C.text, letterSpacing:-0.4 }}>
              Records & Objectifs
            </div>
            <button onClick={() => setShowManualRM(true)}
              style={{ fontSize:11.5, fontWeight:600, color:"#374151",
                background:"#F0F2F7", border:"none", borderRadius:10,
                padding:"5px 11px", cursor:"pointer", fontFamily:DISP,
                display:"flex", alignItems:"center", gap:4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/>
              </svg>
              Historique
            </button>
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
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                {rmData.map((ex, i) => {
                  const col  = REC_PALETTE[i % REC_PALETTE.length];
                  const tr   = trendOf(ex.historique);
                  const iconBg = [
                    ["#EAF1FF","#3B82F6"],["#E8FAF1","#10B981"],
                    ["#FEF6E7","#F59E0B"],["#F3F0FF","#6366F1"],
                    ["#FEE8E8","#F87171"],["#E8FAF1","#34D399"],
                  ][i % 6];
                  return (
                    <div key={i} onClick={() => setEditRecord(ex)} style={{
                      background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                      padding:"14px 14px 12px", cursor:"pointer",
                      boxShadow:"0 1px 2px rgba(15,23,42,0.03),0 2px 6px rgba(15,23,42,0.04)",
                    }}>
                      {/* Icône */}
                      <div style={{ width:36, height:36, borderRadius:11,
                        background:`linear-gradient(135deg, ${iconBg[0]}, ${iconBg[1]}33)`,
                        border:`1px solid ${iconBg[1]}30`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        marginBottom:8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke={iconBg[1]} strokeWidth="1.8" strokeLinecap="round">
                          <path d="M6.5 6.5h11M6.5 6.5A2.5 2.5 0 014 4M17.5 6.5A2.5 2.5 0 0120 4M6.5 17.5h11M6.5 17.5A2.5 2.5 0 014 20M17.5 17.5A2.5 2.5 0 0120 20M12 6.5v11"/>
                        </svg>
                      </div>
                      <div style={{ fontFamily:DISP, fontSize:26, fontWeight:800, color:col,
                        letterSpacing:-1, lineHeight:1, ...NUM }}>{ex.rm1}</div>
                      <div style={{ fontSize:10, color:"#9CA3AF", fontWeight:600,
                        marginTop:1, fontFamily:DISP }}>kg · 1RM</div>
                      <div style={{ fontSize:12, color:C.text, fontWeight:600, marginTop:8,
                        fontFamily:DISP, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis",
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {ex.nom}
                      </div>
                      {tr && (
                        <div style={{ fontSize:10, color:"#10B981", fontWeight:700,
                          marginTop:4, fontFamily:DISP }}>▲ +{tr} kg</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Saisie rapide banner */}
              <div onClick={() => setShowManualRM(true)} style={{
                background:"linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                borderRadius:16, padding:"14px 16px",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                cursor:"pointer", boxShadow:"0 8px 24px rgba(59,130,246,0.32)",
              }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:DISP }}>
                    Saisie rapide
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", fontFamily:DISP, marginTop:2 }}>
                    Ajoute un nouveau record
                  </div>
                </div>
                <div style={{ width:40, height:40, borderRadius:"50%",
                  background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
                  display:"grid", placeItems:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
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
        <Card style={{ textAlign: "center", padding: "20px 16px", marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#374151", marginBottom: 12 }}>Aucun programme actif</div>
          <Btn onClick={() => setProgView("analyse")}>✨ Générer mon programme</Btn>
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
