import { useState, useMemo } from "react";
import { C, INT, FONT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Card, Eyebrow, Btn } from "../../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";
import { calc1RM, calcKgFor, catColor as cc, toDateKey } from "../../utils/training.js";
import { ManualRMModal, CreateSeanceModal, EditRecordModal, RMCard } from "./components/TodayViewModals.jsx";

export default function TodayView(props) {
  const { prog, setProg, premium, setPaywall, push, checkedEx, setCheckedEx, calSess, setCalSess, profil, INT, setProgView, setTab, setChrono, setChronoSec, exDetails, setExDetails, exEdit, setExEdit } = props;

  const [viewSeance,      setViewSeance]      = useState(null);
  const [showManualRM,    setShowManualRM]    = useState(false);
  const [showCreateSeance,setShowCreateSeance]= useState(false);
  const [editRecord,      setEditRecord]      = useState(null); // exData à éditer
  const rmFilter = "all";

  const objectif = profil?.objectif || "hypertrophie";

  // ── Séance du jour ──
  const getTodaySeance = () => {
    const today    = new Date();
    const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const todayName = dayNames[today.getDay()];

    // 1. Chercher dans calSess (séance créée depuis "Aujourd'hui")
    const calSeance = calSess?.[todayKey];
    if (calSeance?.exercices?.length > 0) {
      return {
        id:        calSeance.seanceId || `today_${todayKey}`,
        nom:       calSeance.nom,
        focus:     todayName,
        duree:     "aujourd'hui",
        intensite: calSeance.intensite || "modere",
        exercices: calSeance.exercices,
        complete:  false,
        _fromCal:  true,
        _calKey:   todayKey,
      };
    }

    // 2. Sinon chercher dans le programme actif
    if (!prog) return null;
    return prog.jours.find(j =>
      j.nom?.toLowerCase().includes(todayName.toLowerCase()) ||
      j.focus?.toLowerCase().includes(todayName.toLowerCase())
    ) || null;
  };

  const toggleCheck = (seanceId, exIdx, repos, calKey) => {
    const key = `${seanceId}-${exIdx}`;
    const wasChecked = checkedEx[key];
    setCheckedEx(prev => ({...prev,[key]:!prev[key]}));
    if (!wasChecked && repos) {
      const sec = parseInt((repos||"90s").replace(/[^0-9]/g,"")) || 90;
      setChronoSec(sec);
      setChrono(true);
    }
    // Persister dans calSess si la séance vient du calendrier
    if (calKey && setCalSess) {
      setCalSess(prev => {
        if (!prev[calKey]) return prev;
        const exos = [...(prev[calKey].exercices || [])];
        if (exos[exIdx]) exos[exIdx] = {...exos[exIdx], checked: !wasChecked};
        return {...prev, [calKey]: {...prev[calKey], exercices: exos}};
      });
    }
  };

  // ── Données RM ──
  const rmData = useMemo(() => {
    if (!prog) return [];
    const todaySeance = getTodaySeance();
    const jours = rmFilter === "today" && todaySeance ? [todaySeance] : prog.jours;
    const map = {};
    jours.forEach(jour => {
      (jour.exercices || []).forEach(ex => {
        if (!ex.historique || ex.historique.length === 0) return;
        const best = ex.historique.reduce((b, h) => {
          const rm  = calc1RM(parseFloat(h.poids)||0, parseInt(h.reps)||1);
          const brm = calc1RM(parseFloat(b.poids)||0, parseInt(b.reps)||1);
          return rm > brm ? h : b;
        }, ex.historique[0]);
        const rm1 = calc1RM(parseFloat(best.poids)||0, parseInt(best.reps)||1);
        if (!map[ex.nom] || rm1 > map[ex.nom].rm1) {
          map[ex.nom] = { nom:ex.nom, cat:ex.cat, rm1, bestKg:parseFloat(best.poids)||0, bestReps:parseInt(best.reps)||0, historique:ex.historique };
        }
      });
    });
    // Lire aussi prog.records (exercices saisis hors programme)
    if (prog.records) {
      Object.entries(prog.records).forEach(([nom, history]) => {
        if (!history || history.length === 0) return;
        const best = history.reduce((b, h) => {
          const rm  = calc1RM(parseFloat(h.poids)||0, parseInt(h.reps)||1);
          const brm = calc1RM(parseFloat(b.poids)||0, parseInt(b.reps)||1);
          return rm > brm ? h : b;
        }, history[0]);
        const rm1 = calc1RM(parseFloat(best.poids)||0, parseInt(best.reps)||1);
        if (!map[nom] || rm1 > map[nom].rm1) {
          map[nom] = { nom, cat: best.cat || "principal", rm1, bestKg: parseFloat(best.poids)||0, bestReps: parseInt(best.reps)||0, historique: history };
        }
      });
    }
    return Object.values(map).sort((a,b) => b.rm1 - a.rm1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prog, calSess, rmFilter]);

  const todaySeance = getTodaySeance();
  const currentTarget = OBJ_TARGET[objectif] || DEFAULT_TARGET;

  // ── Early returns après les hooks ──
  if (editRecord) {
    return (
      <EditRecordModal
        exData={editRecord}
        prog={prog} setProg={setProg}
        push={push}
        onClose={() => setEditRecord(null)}
      />
    );
  }

  if (showCreateSeance) {
    return (
      <CreateSeanceModal
        prog={prog} setProg={setProg}
        setCalSess={setCalSess}
        push={push} C={C}
        onClose={() => setShowCreateSeance(false)}
      />
    );
  }

  if (showManualRM) {
    return (
      <ManualRMModal
        prog={prog} setProg={setProg}
        push={push} C={C}
        onClose={() => setShowManualRM(false)}
      />
    );
  }

  if (viewSeance) {
    return (
      <SeanceDetail
        seance={viewSeance} onBack={() => setViewSeance(null)}
        prog={prog} setProg={setProg}
        checkedEx={checkedEx}
        toggleCheck={(id, idx, repos) => toggleCheck(id, idx, repos, viewSeance._calKey)}
        exDetails={exDetails} setExDetails={setExDetails}
        exEdit={exEdit} setExEdit={setExEdit}
        setChrono={setChrono} push={push}
      />
    );
  }

  return (
    <div style={{padding:"0 15px"}}>

      {/* ── Séance du jour ── */}
      {todaySeance ? (
        <div style={{paddingTop:6}}>
          {(() => {
            const ic = INT[todaySeance.intensite||"modere"].c;
            const total = todaySeance.exercices?.length || 0;
            const done  = todaySeance.exercices?.filter((_,i) => checkedEx[`${todaySeance.id}-${i}`]).length || 0;
            const pct   = total > 0 ? Math.round(done/total*100) : 0;
            return (
              <>
                {/* Hero card */}
                <div onClick={() => setViewSeance(todaySeance)} style={{position:"relative",borderRadius:24,overflow:"hidden",marginBottom:12,padding:"20px 20px 18px",cursor:"pointer",background:`linear-gradient(155deg, ${ic} 0%, ${ic}cc 55%, ${ic}66 100%)`,border:"1px solid rgba(255,255,255,0.22)",boxShadow:`0 20px 40px ${ic}40, inset 0 1px 0 rgba(255,255,255,0.3)`}}>
                  <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(160% 60% at 20% 10%, rgba(255,255,255,0.42), transparent 55%)"}}/>
                  <div style={{position:"absolute",right:-50,bottom:-50,width:200,height:200,borderRadius:"50%",background:"radial-gradient(closest-side, rgba(255,255,255,0.18), transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>
                  <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:999,background:"rgba(11,15,31,0.28)",border:"1px solid rgba(11,15,31,0.3)",color:"#0B0F1F",fontSize:9.5,fontWeight:800,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:1.4}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:C.bg}}/>
                      SÉANCE DU JOUR
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Instrument Serif',serif",fontSize:30,color:"#0B0F1F",lineHeight:1}}>{pct}%</div>
                      <div style={{fontSize:9,color:"rgba(11,15,31,0.7)",fontWeight:700,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>{done}/{total}</div>
                    </div>
                  </div>
                  <div style={{position:"relative",marginTop:18}}>
                    <div style={{fontFamily:"'Instrument Serif',serif",fontSize:40,fontWeight:400,letterSpacing:-1.6,color:"#0B0F1F",lineHeight:0.98}}>{todaySeance.nom}</div>
                    <div style={{fontSize:13,color:"rgba(11,15,31,0.78)",fontWeight:600,marginTop:6,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>{INT[todaySeance.intensite||"modere"].l} · {todaySeance.duree}</div>
                  </div>
                </div>

                {/* Checkbox list */}
                {!todaySeance.complete && (
                  <div style={{background:C.s1,border:"1px solid rgba(190,180,255,0.07)",borderRadius:18,padding:"6px 16px",marginBottom:12,boxShadow:"inset 0 1px 0 rgba(255,255,255,0.03)"}}>
                    {(todaySeance.exercices||[]).map((ex,idx) => {
                      const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                      const cc = {principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[ex.cat||"principal"]||"#4D8BFF";
                      const last = idx===todaySeance.exercices.length-1;
                      return (
                        <div key={idx} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:last?"none":"1px solid rgba(190,180,255,0.07)"}}>
                          <div onClick={() => toggleCheck(todaySeance.id,idx,ex.repos,todaySeance._calKey)} style={{width:38,height:38,borderRadius:11,flexShrink:0,background:isChecked?"linear-gradient(145deg, #5FE0A5, #2DA67D)":`linear-gradient(145deg, ${cc}30, ${cc}08)`,border:isChecked?"none":`1px solid ${cc}40`,color:isChecked?"#0B1F18":cc,display:"grid",placeItems:"center",cursor:"pointer",fontSize:15,fontWeight:800,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",boxShadow:isChecked?"0 4px 10px rgba(95,224,165,0.4)":"none"}}>{isChecked?"✓":idx+1}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:700,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:-0.1,color:isChecked?"rgba(245,241,232,0.32)":"#F5F1E8",textDecoration:isChecked?"line-through":"none"}}>{ex.nom}</div>
                            <div style={{fontSize:11,color:"rgba(245,241,232,0.32)",fontWeight:500,marginTop:2}}>{ex.series}×{ex.reps} · {ex.repos}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {!todaySeance.complete && (
                  <button onClick={() => setViewSeance(todaySeance)} style={{width:"100%",padding:"16px 20px",borderRadius:18,background:"#F5F1E8",color:"#0B0F1F",border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:15,fontWeight:700,letterSpacing:0.2,cursor:"pointer",boxShadow:"0 10px 24px rgba(245,241,232,0.16), inset 0 1px 0 rgba(255,255,255,0.6)"}}>
                    ▶ Démarrer la séance
                  </button>
                )}
                {todaySeance.complete && <div style={{padding:"12px 16px",fontSize:12,color:"#5FE0A5",fontWeight:700,textAlign:"center"}}>✓ Complétée le {todaySeance.date}</div>}
              </>
            );
          })()}
        </div>
      ) : (
        <Card style={{textAlign:"center",padding:"20px 16px"}}>
          <div style={{fontSize:32,marginBottom:8}}>😴</div>
          <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:15,fontWeight:500,marginBottom:4}}>Jour de repos</div>
          <div style={{fontSize:12,color:"rgba(245,241,232,0.50)",lineHeight:1.5,marginBottom:14}}>Tes records sont disponibles ci-dessous.</div>
          <button onClick={() => setShowCreateSeance(true)}
            style={{width:"100%",padding:"11px 16px",background:"rgba(59,130,246,0.06)",border:"1px dashed rgba(59,130,246,0.3)",borderRadius:10,color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:15}}>+</span> Créer une séance aujourd'hui
          </button>
        </Card>
      )}

      {/* ── Records & Objectifs ── */}
      {prog && (
        <div style={{marginTop:16}}>

          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:16,fontWeight:400,color:"#F5F1E8",letterSpacing:-0.3}}>Records & Objectifs</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:currentTarget.color}}/>
                <div style={{fontSize:10,color:currentTarget.color,fontWeight:600}}>{currentTarget.l} · {currentTarget.reps} reps</div>
                <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>· {currentTarget.pct}% 1RM</div>
              </div>
            </div>
          </div>

          {/* Liste */}
          {rmData.length === 0 ? (
            <Card style={{textAlign:"center",padding:"24px 16px"}}>
              <div style={{fontSize:28,marginBottom:8}}>📊</div>
              <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:14,fontWeight:400,marginBottom:6}}>Pas encore de données</div>
              <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",lineHeight:1.6,marginBottom:16}}>
                Enregistre tes charges pendant les séances pour voir apparaître tes records et les charges cibles pour ton objectif <span style={{color:currentTarget.color,fontWeight:600}}>{currentTarget.l}</span>.
              </div>
              <button onClick={() => setShowManualRM(true)} style={{width:"100%",padding:"12px 16px",background:"rgba(59,130,246,0.06)",border:"1px dashed rgba(59,130,246,0.3)",borderRadius:10,color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontSize:16}}>🏆</span> Saisir un record manuellement
              </button>
            </Card>
          ) : (
            <div>
              {rmData.map((ex,i) => <RMCard key={i} exData={ex} objectif={objectif} C={C} onEdit={setEditRecord}/>)}
              <button onClick={() => setShowManualRM(true)} style={{width:"100%",padding:"11px",marginTop:4,background:"transparent",border:"0.5px dashed rgba(190,180,255,0.07)",borderRadius:10,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span>🏆</span> Ajouter un record
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Pas de programme ── */}
      {!prog && (
        <Card style={{textAlign:"center",padding:"20px 16px",marginTop:8}}>
          <div style={{fontSize:12,color:"rgba(245,241,232,0.50)",marginBottom:12}}>Aucun programme actif</div>
          <Btn onClick={() => { if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Générer mon programme</Btn>
          <Btn v="out" onClick={() => setProgView("creer")}>Créer manuellement</Btn>
        </Card>
      )}


    </div>
  );
}
