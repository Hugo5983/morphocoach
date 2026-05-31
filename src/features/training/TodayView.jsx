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
        setChrono={setChrono} push={push}
      />
    );
  }

  const todaySeance = getTodaySeance();

  return (
    <div style={{ padding: "0 16px" }}>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 6, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: "rgba(242,244,247,0.25)", textTransform: "uppercase", fontFamily: DISP, marginBottom: 5 }}>
          {today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div style={{ fontFamily: SERIF_F, fontSize: 28, color: "#F2F4F7", lineHeight: 1.1, letterSpacing: -1 }}>
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
              background: `linear-gradient(145deg, ${intData.c}, ${intData.c}cc)`,
              borderRadius: 20, padding: "18px 16px", marginBottom: 10,
              position: "relative", overflow: "hidden",
              boxShadow: `0 16px 40px ${intData.c}40`,
            }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.10)", pointerEvents: "none" }}/>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(140% 60% at 20% 10%, rgba(255,255,255,0.30), transparent 55%)", pointerEvents: "none" }}/>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, position: "relative" }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "1.5px", color: "rgba(0,0,0,0.55)", background: "rgba(0,0,0,0.15)", padding: "4px 10px", borderRadius: 99, fontFamily: DISP }}>
                  SÉANCE DU JOUR
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: SERIF_F, fontSize: 26, color: "rgba(0,0,0,0.75)", lineHeight: 1 }}>{pct}%</div>
                  <div style={{ fontSize: 9, color: "rgba(0,0,0,0.50)", fontFamily: DISP }}>{done}/{total}</div>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: SERIF_F, fontSize: 32, color: "rgba(0,0,0,0.80)", lineHeight: 1, marginBottom: 5, letterSpacing: -1 }}>
                  {todaySeance.nom}
                </div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.60)", fontFamily: DISP, marginBottom: 14 }}>
                  {intData.l} · {todaySeance.duree || "60 min"} · {total} exercice{total !== 1 ? "s" : ""}
                </div>
                {/* Barre progression */}
                <div style={{ height: 3, background: "rgba(0,0,0,0.15)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "rgba(0,0,0,0.55)", borderRadius: 99, transition: "width .5s ease" }}/>
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
                        <div style={{ fontSize: 13, fontWeight: 700, color: isChecked ? "rgba(242,244,247,0.30)" : "#F2F4F7", fontFamily: DISP, textDecoration: isChecked ? "line-through" : "none", letterSpacing: -0.2 }}>{ex.nom}</div>
                        <div style={{ fontSize: 10, color: "rgba(242,244,247,0.38)", fontFamily: DISP, marginTop: 2 }}>{ex.series}×{ex.reps} · {ex.repos}{ex.methode && ex.methode !== "Classique" ? ` · ${ex.methode}` : ""}</div>
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
        /* Jour de repos */
        <div style={{ background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 18, padding: "22px 18px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>😴</div>
          <div style={{ fontFamily: DISP, fontSize: 16, fontWeight: 700, color: "#F2F4F7", marginBottom: 4 }}>Jour de repos</div>
          <div style={{ fontSize: 12, color: "rgba(242,244,247,0.45)", lineHeight: 1.6, marginBottom: 16, fontFamily: DISP }}>Tes records sont disponibles ci-dessous.</div>
          <button onClick={() => setShowCreateSeance(true)} style={{
            width: "100%", padding: "12px 16px",
            background: "rgba(59,130,246,0.07)", border: "1px dashed rgba(59,130,246,0.30)",
            borderRadius: 12, color: "#4D8BFF", cursor: "pointer",
            fontSize: 13, fontWeight: 700, fontFamily: DISP,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            + Créer une séance aujourd'hui
          </button>
        </div>
      )}

      {/* ── Records ─────────────────────────────────────────────── */}
      {prog && (
        <div style={{ marginBottom: 20 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: DISP, fontSize: 17, fontWeight: 700, color: "#F2F4F7", letterSpacing: -0.4 }}>Records & Objectifs</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: currentTarget.color }}/>
              <div style={{ fontSize: 10, color: currentTarget.color, fontWeight: 700, fontFamily: DISP }}>{currentTarget.l} · {currentTarget.reps} reps</div>
            </div>
          </div>

          {rmData.length === 0 ? (
            <div style={{ background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 18, padding: "22px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
              <div style={{ fontFamily: DISP, fontSize: 14, fontWeight: 700, color: "#F2F4F7", marginBottom: 6 }}>Pas encore de données</div>
              <div style={{ fontSize: 11, color: "rgba(242,244,247,0.45)", lineHeight: 1.6, marginBottom: 16, fontFamily: DISP }}>
                Enregistre tes charges pendant les séances pour voir tes records et les charges cibles pour ton objectif{" "}
                <span style={{ color: currentTarget.color, fontWeight: 700 }}>{currentTarget.l}</span>.
              </div>
              <button onClick={() => setShowManualRM(true)} style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(59,130,246,0.07)", border: "1px dashed rgba(59,130,246,0.30)",
                borderRadius: 12, color: "#4D8BFF", cursor: "pointer",
                fontSize: 13, fontWeight: 700, fontFamily: DISP,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                🏆 Saisir un record manuellement
              </button>
            </div>
          ) : (
            <div>
              {rmData.map((ex, i) => <RMCard key={i} exData={ex} objectif={objectif} C={C} onEdit={setEditRecord}/>)}
              <button onClick={() => setShowManualRM(true)} style={{
                width: "100%", padding: "11px", marginTop: 6,
                background: "transparent", border: `0.5px dashed ${C.bd}`,
                borderRadius: 12, color: "rgba(242,244,247,0.40)", cursor: "pointer",
                fontSize: 12, fontFamily: DISP,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                🏆 Ajouter un record
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pas de programme */}
      {!prog && (
        <Card style={{ textAlign: "center", padding: "20px 16px", marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "rgba(242,244,247,0.50)", marginBottom: 12 }}>Aucun programme actif</div>
          <Btn onClick={() => setProgView("analyse")}>✨ Générer mon programme</Btn>
          <Btn v="out" onClick={() => setProgView("creer")}>Créer manuellement</Btn>
        </Card>
      )}

      {/* Modals */}
      {showManualRM && <ManualRMModal onClose={() => setShowManualRM(false)} prog={prog} setProg={setProg} push={push} C={C} EX={EX}/>}
      {showCreateSeance && <CreateSeanceModal onClose={() => setShowCreateSeance(false)} prog={prog} setProg={setProg} calSess={calSess} setCalSess={setCalSess} push={push} C={C} INT={INT} EX={EX} todayKey={todayKey}/>}
      {editRecord && <EditRecordModal record={editRecord} onClose={() => setEditRecord(null)} prog={prog} setProg={setProg} push={push} C={C}/>}
    </div>
  );
}
