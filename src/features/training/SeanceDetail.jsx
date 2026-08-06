import { appliquerPhase } from"../../services/periodisationService.js";
import { getEchauffement } from"../../services/echauffementService.js";
import { getFicheMorpho } from"../../services/morphoService.js";
import { groupeMusculaire } from"../../services/muscleGroups.js";
import { useState } from"react";
import { I, ID } from"../../components/ui/Icon.jsx";
import useScrollTop from"../../hooks/useScrollTop.js";
import { C, DARK, FONT, NUM, SERIF } from"../../data/constants.js";
import { Card, Eyebrow, Btn } from"../../components/ui/index.jsx";
import SeanceDetail from"./SeanceDetail.jsx";
import { calc1RM, calcKgFor, catColor as cc, toDateKey } from"../../utils/training.js";
import { ManualRMModal, CreateSeanceModal, EditRecordModal, RMCard, OBJ_TARGET, DEFAULT_TARGET } from"./components/TodayViewModals.jsx";

const DISP = FONT;
const SERIF_F = SERIF;

export default function TodayView(props) {
  useScrollTop();
  const { prog, setProg, calSess, setCalSess, checkedEx, setCheckedEx,
    seance, setSeance, setChrono, setChronoSec,
    exDetails, setExDetails, exEdit, setExEdit,
    profil, EX, C: _C, INT, push, setProgView } = props;

  // Semaine du mésocycle en cours : même source que le reste de l'app.
  const semaineCycle = (props.semC || 0) + 1;

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

  return (
    <div style={{ padding:"0 20px" }}>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing:"0.1em", color: C.dim, textTransform:"uppercase", fontFamily: DISP, marginBottom: 4 }}>
          {today.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
        </div>
        <div style={{ fontFamily: SERIF_F, fontSize: 26, color:"${C.text}", lineHeight: 1.1, letterSpacing: -1 }}>
          Séance du <span style={{ fontStyle:"italic", color: C.blue }}>jour</span>
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
            {/* Hero card */}
            <div style={{
              background:`linear-gradient(150deg, ${intData.c} 0%, ${intData.c}CC 60%, ${intData.c}88 100%)`,
              borderRadius: 20, padding:"20px 20px", marginBottom: 12,
              position:"relative", overflow:"hidden",
              boxShadow:`0 18px 40px ${intData.c}40`,
            }}>
              <div style={{ position:"absolute", top: -50, right: -40, width: 170, height: 170, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,0,0,0.12), transparent 65%)", pointerEvents:"none" }}/>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 32, position:"relative" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing:"0.1em", color:"rgba(0,0,0,0.5)", background:"rgba(0,0,0,0.18)", padding:"8px 12px", borderRadius: 999, fontFamily: DISP }}>
                  SÉANCE DU JOUR
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily: SERIF_F, fontSize: 34, color:"#FFF", lineHeight: 1 }}>{pct}%</div>
                  <div style={{ fontSize: 11, color:"rgba(0,0,0,0.35)", fontFamily: DISP, marginTop: 2 }}>{done}/{total}</div>
                </div>
              </div>

              <div style={{ position:"relative" }}>
                <div style={{ fontFamily: SERIF_F, fontSize: 34, color:"#FFF", lineHeight: 1, marginBottom: 8, letterSpacing: -1 }}>
                  {todaySeance.nom}
                </div>
                <div style={{ fontSize: 13, color:"rgba(0,0,0,0.35)", fontFamily: DISP, marginBottom: 16, display:"flex", alignItems:"center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius:"50%", background:"rgba(16,19,24,0.5)", flexShrink: 0 }}/>
                  {intData.l} · {todaySeance.duree ||"60 min"} · {total} exercice{total !== 1 ?"s" :""}
                </div>
                {/* Barre progression */}
                <div style={{ height: 4, background:"rgba(0,0,0,0.12)", borderRadius: 999, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:"#FFF", borderRadius: 999, transition:"width .5s ease" }}/>
                </div>
              </div>
            </div>

            {/* Échauffement structuré — trois temps, plafonné à 10 min hors
                montée en charge. Il ouvre la séance : c'est la première chose
                à lire, et la première qu'on saute quand elle est floue. */}
            {!todaySeance.complete && (() => {
              const ech = getEchauffement(todaySeance, getFicheMorpho(), {
                metier: profil?.metier, pathologies: prog?.pathologies,
                objectif: prog?.objectif, niveau: prog?.niveau,
              }, { chargePremierExo: null });
              return (
                <div style={{ background:"rgba(245,161,0,0.07)", border:"1px solid rgba(245,161,0,0.22)",
                              borderRadius:16, padding:"14px 16px", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                                gap:10, marginBottom:9 }}>
                    <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:"0.1em",
                                   color:"#B37400" }}>ÉCHAUFFEMENT</span>
                    <span style={{ fontSize:11, fontWeight:800, color:"#B37400",
                                   background:"rgba(245,161,0,0.16)", borderRadius:99,
                                   padding:"3px 10px" }}>{ech.minutes} min</span>
                  </div>
                  {ech.blocs.map((b, bi) => (
                    <div key={b.cle} style={{ marginTop: bi === 0 ? 0 : 11 }}>
                      <div style={{ fontSize:12.5, fontWeight:800, color:C.t1 }}>
                        {bi + 1}. {b.titre}
                        <span style={{ fontWeight:600, color:"#9AA3B2" }}> · {b.minutes} min</span>
                      </div>
                      <div style={{ fontSize:11.5, fontWeight:500, color:"#9AA3B2",
                                    lineHeight:1.45, marginTop:2 }}>{b.but}</div>
                      {b.exercices.map((x, xi) => (
                        <div key={xi} style={{ display:"flex", gap:8, marginTop:5 }}>
                          <span style={{ color:"#B37400", fontSize:12 }}>·</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <span style={{ fontSize:12.5, fontWeight:700, color:C.t1 }}>{x.nom}</span>
                            <span style={{ fontSize:11.5, fontWeight:600, color:"#B37400" }}> — {x.duree}</span>
                            {x.comment && (
                              <div style={{ fontSize:11.5, fontWeight:500, color:"#6B7486",
                                            lineHeight:1.45 }}>{x.comment}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ fontSize:11.5, fontWeight:600, color:"#8A5A00",
                                lineHeight:1.5, marginTop:11, paddingTop:9,
                                borderTop:"1px solid rgba(245,161,0,0.2)" }}>
                    Les séries d'approche sur le premier exercice sont guidées en séance.
                  </div>
                </div>
              );
            })()}

            {/* Consigne d'échauffement propre à cette séance (produite par l'IA) */}
            {!todaySeance.complete && todaySeance.echauffement && (
              <div style={{ background:"rgba(245,161,0,0.08)", border:"1px solid rgba(245,161,0,0.25)",
                            borderRadius:16, padding:"14px 16px", marginBottom:12 }}>
                <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:"0.1em",
                              color:"#B37400", marginBottom:5 }}>
                  ÉCHAUFFEMENT AVANT DE CHARGER
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:C.t1, lineHeight:1.5 }}>
                  {todaySeance.echauffement}
                </div>
              </div>
            )}

            {/* Checklist exercices */}
            {!todaySeance.complete && (
              <div style={{ background: C.s1, border:`1px solid ${C.bd}`, borderRadius: 20, padding:"4px 16px", marginBottom: 12 }}>
                {(todaySeance.exercices || []).map((ex, idx) => {
                  const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                  const exColor   = cc(ex.cat);
                  const last      = idx === todaySeance.exercices.length - 1;
                  const lastEntry = ex.historique?.[ex.historique.length - 1];
                  return (
                    <div key={idx} style={{ display:"flex", alignItems:"center", gap: 12, padding:"12px 0", borderBottom: last ?"none" :`1px solid ${C.bd}` }}>
                      <div onClick={() => toggleCheck(todaySeance.id, idx, ex.repos, todaySeance._calKey)} style={{
                        width: 32, height: 32, borderRadius: 12, flexShrink: 0,
                        display:"grid", placeItems:"center",
                        cursor:"pointer",
                        background: isChecked ?"linear-gradient(145deg,#12B76A,#12B76A)" :`${exColor}18`,
                        border: isChecked ?"none" :`1px solid ${exColor}35`,
                        color: isChecked ?"#101318" : exColor,
                        fontSize: isChecked ? 14 : 12, fontWeight: 700, fontFamily: DISP,
                        boxShadow: isChecked ?"0 4px 10px rgba(18,183,106,0.35)" :"none",
                        transition:"all .15s",
                      }}>{isChecked ?"" : idx + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isChecked ?"${C.dim}" :"${C.text}", fontFamily: DISP, textDecoration: isChecked ?"line-through" :"none", letterSpacing: -0.2 }}>{ex.nom}</div>
                        <div style={{ fontSize: 10, color:"${C.dim}", fontFamily: DISP, marginTop: 2 }}>{ex.series}×{ex.reps} · {ex.repos}{ex.methode && ex.methode !=="Classique" ?` · ${ex.methode}` :""}</div>
                        {(() => {
                          // Concept E : montrer l'ajustement de la semaine plutôt
                          // que de laisser croire à une erreur. Le barré indique
                          // qu'on allège volontairement, on n'a pas oublié.
                          const ph = appliquerPhase(ex, semaineCycle, { groupe: groupeMusculaire(ex.nom), objectif: prog?.objectif, niveau: prog?.niveau, prog });
                          if (!ph.modifie) return null;
                          const baisse = ph.series < ph.seriesBase
                            || (ph.charge != null && ph.charge < ph.chargeBase);
                          const col = baisse ?"#B37400" :"#0B8A5F";
                          return (
                            <div style={{ fontSize: 10, fontFamily: DISP, marginTop: 3,
                                          color:"#9AA3B2", display:"flex", alignItems:"center", gap: 5 }}>
                              <span style={{ textDecoration:"line-through" }}>
                                {ph.seriesBase}×{ph.chargeBase != null ? `${ph.chargeBase} kg` : ex.reps}
                              </span>
                              <span>→</span>
                              <span style={{ color: col, fontWeight: 800 }}>
                                {ph.series}×{ph.charge != null ? `${ph.charge} kg` : ex.reps}
                              </span>
                              <span style={{ color: col }}>· {ph.phase.label.toLowerCase()}</span>
                            </div>
                          );
                        })()}
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
                width:"100%", padding:"16px", borderRadius: 16,
                background:"#F6F7F9", border:"none",
                color: DARK.bg, fontSize: 14, fontWeight: 700,
                fontFamily: DISP, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap: 8,
                boxShadow:"0 8px 24px rgba(245,241,232,0.12)",
                marginBottom: 20,
              }}>
                 Démarrer la séance
              </button>
)}
            {todaySeance.complete && (
              <div style={{ padding:"12px 0", fontSize: 13, color:"#12B76A", fontWeight: 700, textAlign:"center", fontFamily: DISP }}>
                 Séance complétée
              </div>
)}
          </>
);
      })() : (
        /* Jour de repos — design récupération */
        <div style={{
          background:"linear-gradient(155deg,#101318,#101318)",
          border:"1px solid rgba(60,91,255,0.18)",
          borderRadius: 20, padding:"24px 20px 20px",
          marginBottom: 16, position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute",top:-50,right:-50,width:170,height:170,borderRadius:"50%",background:"radial-gradient(circle,rgba(18,183,106,0.12),transparent 68%)",pointerEvents:"none" }}/>

          {/* Badge + date */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:999,background:"rgba(18,183,106,0.12)",border:"1px solid rgba(18,183,106,0.25)" }}>
              <span style={{ fontSize:13 }}><I name="check" size={12}/></span>
              <span style={{ fontSize:10,fontWeight:700,color:"#12B76A",letterSpacing:"0.1em",fontFamily:DISP }}>JOUR DE RÉCUPÉRATION</span>
            </div>
            <div style={{ fontSize:11,color:"${C.dim}",fontWeight:600,fontFamily:DISP }}>
              {today.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}
            </div>
          </div>

          {/* Titre */}
          <div style={{ fontFamily:SERIF_F,fontSize:34,color:"${C.text}",lineHeight:1.1,letterSpacing:-1,marginBottom:12 }}>
            Aujourd'hui, on<br/><span style={{ color:DARK.accent,fontStyle:"italic" }}>récupère.</span>
          </div>
          <div style={{ fontSize:13,color:C.mid,lineHeight:1.6,fontFamily:DISP,marginBottom:20 }}>
            La récup fait partie du programme. Voici 3 gestes qui comptent vraiment.
          </div>

          {/* Gestes récup */}
          {[
            { ic:"hydration", bg:"rgba(18,183,106,0.12)",  bd:"rgba(18,183,106,0.25)",  t:"Hydratation · 2,5 L", s:"Clé de la récupération musculaire" },
            { ic:"sleep", bg:"rgba(157,176,255,0.12)", bd:"rgba(157,176,255,0.25)", t:"Sommeil · cible 8 h",   s:"80% des gains se font la nuit" },
            { ic:"yoga", bg:"rgba(60,91,255,0.12)",  bd:"rgba(60,91,255,0.25)",  t:"Mobilité · 10 min",     s:"Hanches & thoracique" },
          ].map((g,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderTop:"1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ width:44,height:44,borderRadius:12,background:g.bg,border:`1px solid ${g.bd}`,display:"grid",placeItems:"center",flexShrink:0 }}><ID name={g.ic} size={24}/></div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:700,color:"${C.text}",fontFamily:DISP,letterSpacing:-0.2 }}>{g.t}</div>
                <div style={{ fontSize:11,color:C.mid,fontFamily:DISP,marginTop:1 }}>{g.s}</div>
              </div>
            </div>
))}

          {/* CTA — créer une séance malgré tout */}
          <button onClick={() => setShowCreateSeance(true)} style={{
            width:"100%",marginTop:16,padding:"12px",borderRadius:16,
            background:"rgba(60,91,255,0.12)",border:"1px solid rgba(60,91,255,0.25)",
            color:DARK.accent,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DISP,
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
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: SERIF_F, fontSize: 20, fontWeight: 400, color:"${C.text}", letterSpacing: -0.3 }}>Records & Objectifs</div>
          </div>

          {rmData.length === 0 ? (
            <div style={{ background: C.s1, border:`1px solid ${C.bd}`, borderRadius: 20, overflow:"hidden" }}>
              {/* Empty state avec CTA visible */}
              <div style={{ padding:"24px 20px 20px", textAlign:"center" }}>
                <div style={{ fontSize:26,marginBottom:8 }}><I name="check" size={12}/></div>
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
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
                {rmData.map((ex, i) => {
                  const col = REC_PALETTE[i % REC_PALETTE.length];
                  const tr  = trendOf(ex.historique);
                  return (
                    <div key={i} onClick={() => setEditRecord(ex)} style={{
                      background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                      padding:"16px 8px 12px", textAlign:"center", cursor:"pointer", overflow:"hidden",
                    }}>
                      <div style={{ fontFamily:DISP, fontSize:26, fontWeight:700, color:col, letterSpacing:-1, lineHeight:1, ...NUM }}>{ex.rm1}</div>
                      <div style={{ fontSize:10, color:"${C.dim}", fontWeight:600, marginTop:2, fontFamily:DISP }}>kg · 1RM</div>
                      <div style={{ fontSize:11, color:"${C.mid}", fontWeight:600, marginTop:8, fontFamily:DISP, lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{ex.nom}</div>
                      {tr && <div style={{ fontSize:10, color:"#12B76A", fontWeight:700, marginTop:4, fontFamily:DISP }}>+{tr}</div>}
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
        <Card style={{ textAlign:"center", padding:"20px 16px", marginTop: 8 }}>
          <div style={{ fontSize: 13, color: C.mid, marginBottom: 12 }}>Aucun programme actif</div>
          <Btn onClick={() => setProgView("analyse")}> Générer mon programme</Btn>
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
