import { useState } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { Card, Eyebrow, Btn } from "../../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";
import { calc1RM, calcKgFor, catColor as cc, toDateKey } from "../../utils/training.js";
import { ManualRMModal, CreateSeanceModal, EditRecordModal, RMCard, OBJ_TARGET, DEFAULT_TARGET } from "./components/TodayViewModals.jsx";

const DISP = FONT;
const SERIF_F = SERIF;

export default function TodayView(props) {
  const { prog, setProg, calSess, setCalSess, checkedEx, setCheckedEx,
    seance, setSeance, setChrono, setChronoSec,
    exDetails, setExDetails, exEdit, setExEdit,
    profil, EX, C: _C, INT, push, setProgView } = props;

  const [viewSeance,       setViewSeance]       = useState(null);
  const [showManualRM,     setShowManualRM]      = useState(false);
  const [showCreateSeance, setShowCreateSeance]  = useState(false);
  const [tipIdx,             setTipIdx]             = useState(0);
  const [editRecord,       setEditRecord]        = useState(null);

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
                <div style={{ height: 4, background: "rgba(0,0,0,0.10)", borderRadius: 99, overflow: "hidden" }}>
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
              <button onClick={() => setViewSeance(todaySeance)} style={{
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
            { ic:"💧", bg:"rgba(52,211,153,0.12)",  bd:"rgba(52,211,153,0.25)",  t:"Hydratation · 2,5 L", s:"Clé de la récupération musculaire" },
            { ic:"😴", bg:"rgba(129,140,248,0.14)", bd:"rgba(129,140,248,0.28)", t:"Sommeil · cible 8 h",   s:"80% des gains se font la nuit" },
            { ic:"🧘", bg:"rgba(59,130,246,0.14)",  bd:"rgba(59,130,246,0.28)",  t:"Mobilité · 10 min",     s:"Hanches & thoracique" },
          ].map((g,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:13,padding:"11px 0",borderTop:"1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ width:42,height:42,borderRadius:13,background:g.bg,border:`1px solid ${g.bd}`,display:"grid",placeItems:"center",flexShrink:0,fontSize:20 }}>{g.ic}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:14.5,fontWeight:700,color:"${C.text}",fontFamily:DISP,letterSpacing:-0.2 }}>{g.t}</div>
                <div style={{ fontSize:11.5,color:"#374151",fontFamily:DISP,marginTop:1 }}>{g.s}</div>
              </div>
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
    </div>
  );
}
