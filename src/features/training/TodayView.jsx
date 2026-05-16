import { useState, useMemo } from "react";
import { INT } from "../../data/constants.js";
import { Box, Lbl, Btn, Bar, Row } from "../../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";

// ─── FORMULE 1RM (Epley) ──────────────────────────────────────────────────────
// 1RM = poids × (1 + reps / 30)
// Charge pour X reps = 1RM × (1 - X / 30) — arrondi au 0.5kg le plus proche
const calc1RM   = (kg, reps) => !kg || !reps ? 0 : Math.round(kg * (1 + reps / 30));
const calcKgFor = (rm1, reps) => Math.round(rm1 * (1 - reps / 30) * 2) / 2;

// Tableau objectifs : reps → { label, couleur, description }
const OBJECTIFS_RM = [
  { reps:1,  pct:100, l:"1RM Max",       color:"#8b5cf6", desc:"Force absolue"      },
  { reps:3,  pct:93,  l:"Force lourde",  color:"#ef4444", desc:"3 reps · Force"     },
  { reps:5,  pct:87,  l:"Force",         color:"#f97316", desc:"5 reps · 87% 1RM"   },
  { reps:8,  pct:80,  l:"Force-Hypert.", color:"#eab308", desc:"8 reps · 80% 1RM"   },
  { reps:10, pct:75,  l:"Hypertrophie",  color:"#3b82f6", desc:"10 reps · 75% 1RM"  },
  { reps:12, pct:70,  l:"Hypertrophie+", color:"#06b6d4", desc:"12 reps · 70% 1RM"  },
  { reps:15, pct:64,  l:"Endurance",     color:"#22c55e", desc:"15 reps · 64% 1RM"  },
  { reps:20, pct:57,  l:"Endurance+",    color:"#84cc16", desc:"20 reps · 57% 1RM"  },
];

// ─── CARD STATS RM d'un exercice ────────────────────────────────────────────
function RMCard({ exData, C }) {
  const [expanded, setExpanded] = useState(false);
  const cc = {principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6"}[exData.cat||"principal"]||"#3b82f6";

  const mainTargets = OBJECTIFS_RM.filter(o => [5,10,12].includes(o.reps));
  const allTargets  = OBJECTIFS_RM;

  return (
    <div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      {/* Header */}
      <div onClick={() => setExpanded(e => !e)} style={{padding:"11px 14px",cursor:"pointer",borderLeft:`3px solid ${cc}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:"#0f1a2e",marginBottom:3}}>{exData.nom}</div>
            <div style={{fontSize:10,color:"#64748b"}}>
              Meilleur set : <span style={{fontWeight:600,color:"#0f1a2e"}}>{exData.bestKg}kg × {exData.bestReps} reps</span>
              {" · "}
              <span style={{color:cc,fontWeight:700}}>1RM ≈ {exData.rm1}kg</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:10}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:300,color:cc,lineHeight:1}}>{exData.rm1}<span style={{fontSize:10,color:"#64748b",fontFamily:"'Inter',sans-serif",fontWeight:400}}> kg</span></div>
              <div style={{fontSize:8,color:"#94a3b8",marginTop:1}}>1RM estimé</div>
            </div>
            <div style={{color:"#94a3b8",fontSize:14,transition:"transform .15s",transform:expanded?"rotate(90deg)":"rotate(0)"}}>›</div>
          </div>
        </div>

        {/* 3 cibles principales toujours visibles */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:10}}>
          {mainTargets.map(obj => {
            const kg = calcKgFor(exData.rm1, obj.reps);
            return (
              <div key={obj.reps} style={{padding:"7px 8px",background:`${obj.color}0d`,border:`0.5px solid ${obj.color}30`,borderRadius:8,textAlign:"center"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:300,color:obj.color,lineHeight:1}}>{kg > 0 ? kg : "—"}<span style={{fontSize:9,color:"#64748b",fontFamily:"'Inter',sans-serif"}}>{kg>0?" kg":""}</span></div>
                <div style={{fontSize:9,color:obj.color,fontWeight:600,marginTop:2}}>{obj.l}</div>
                <div style={{fontSize:8,color:"#94a3b8"}}>{obj.reps} reps</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tableau complet déplié */}
      {expanded && (
        <div style={{borderTop:"0.5px solid #dce8f4",padding:"12px 14px",background:"rgba(59,130,246,0.02)"}}>
          <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>Tableau complet — Toutes les intensités</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
            {allTargets.map(obj => {
              const kg = calcKgFor(exData.rm1, obj.reps);
              return (
                <div key={obj.reps} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:`${obj.color}08`,border:`0.5px solid ${obj.color}25`,borderRadius:8}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:600,color:obj.color}}>{obj.l}</div>
                    <div style={{fontSize:9,color:"#94a3b8"}}>{obj.reps} reps · {obj.pct}% 1RM</div>
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:400,color:obj.color}}>{kg > 0 ? `${kg}kg` : "—"}</div>
                </div>
              );
            })}
          </div>
          {/* Historique des 3 derniers sets */}
          {exData.historique && exData.historique.length > 0 && (
            <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid #dce8f4"}}>
              <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Historique récent</div>
              {exData.historique.slice(-3).reverse().map((h,i) => {
                const rm = calc1RM(parseFloat(h.poids), parseInt(h.reps));
                return (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{fontSize:11,color:"#64748b"}}>{h.date}</div>
                    <div style={{fontSize:11,fontWeight:500,color:"#0f1a2e"}}>{h.poids}kg × {h.reps} reps</div>
                    <div style={{fontSize:10,color:cc}}>1RM≈{rm}kg</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TODAYVIEW ────────────────────────────────────────────────────────────────
export default function TodayView(props) {
  const {
    prog, setProg, premium, setPaywall, push,
    checkedEx, setCheckedEx,
    seance, C, INT, setProgView,
    setChrono, setChronoSec,
    exDetails, setExDetails, exEdit, setExEdit,
  } = props;

  const [viewSeance, setViewSeance] = useState(null);
  const [rmFilter,   setRmFilter]   = useState("all"); // "all" | "today"

  // ── Séance du jour ──
  const getTodaySeance = () => {
    if (!prog) return null;
    const today = new Date();
    const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const todayName = dayNames[today.getDay()];
    return prog.jours.find(j =>
      j.nom.toLowerCase().includes(todayName.toLowerCase()) ||
      j.focus?.toLowerCase().includes(todayName.toLowerCase())
    ) || null;
  };

  const toggleCheck = (seanceId, exIdx, repos) => {
    const key = `${seanceId}-${exIdx}`;
    const wasChecked = checkedEx[key];
    setCheckedEx(prev => ({...prev,[key]:!prev[key]}));
    if (!wasChecked && repos) {
      const sec = parseInt((repos||"90s").replace(/[^0-9]/g,"")) || 90;
      setChronoSec(sec);
      setChrono(true);
    }
  };

  // ── Stats RM : collecter tous les exercices avec historique ──
  const rmData = useMemo(() => {
    if (!prog) return [];
    const map = {};
    const todaySeanceForFilter = (() => {
      const today = new Date();
      const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
      const n = dayNames[today.getDay()];
      return prog.jours.find(j =>
        j.nom.toLowerCase().includes(n.toLowerCase()) ||
        j.focus?.toLowerCase().includes(n.toLowerCase())
      );
    })();

    const jours = rmFilter === "today" && todaySeanceForFilter
      ? [todaySeanceForFilter]
      : prog.jours;

    jours.forEach(jour => {
      (jour.exercices || []).forEach(ex => {
        if (!ex.historique || ex.historique.length === 0) return;
        const best = ex.historique.reduce((b, h) => {
          const rm = calc1RM(parseFloat(h.poids)||0, parseInt(h.reps)||1);
          const brm = calc1RM(parseFloat(b.poids)||0, parseInt(b.reps)||1);
          return rm > brm ? h : b;
        }, ex.historique[0]);
        const rm1 = calc1RM(parseFloat(best.poids)||0, parseInt(best.reps)||1);
        if (!map[ex.nom] || rm1 > map[ex.nom].rm1) {
          map[ex.nom] = {
            nom: ex.nom,
            cat: ex.cat,
            rm1,
            bestKg:   parseFloat(best.poids) || 0,
            bestReps: parseInt(best.reps)     || 0,
            historique: ex.historique,
          };
        }
      });
    });
    return Object.values(map).sort((a,b) => b.rm1 - a.rm1);
  }, [prog, rmFilter]);

  const todaySeance = getTodaySeance();

  // Early return après tous les hooks
  if (viewSeance) {
    return (
      <SeanceDetail
        seance={viewSeance} onBack={() => setViewSeance(null)}
        prog={prog} setProg={setProg}
        checkedEx={checkedEx} toggleCheck={toggleCheck}
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
        <div>
          <Lbl>Séance du jour</Lbl>
          <Box style={{borderLeft:`3px solid ${INT[todaySeance.intensite||"modere"].c}`,padding:0,overflow:"hidden"}}>
            <div onClick={() => setViewSeance(todaySeance)} style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:9,color:INT[todaySeance.intensite||"modere"].c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{INT[todaySeance.intensite||"modere"].l}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:400,color:"#0f1a2e"}}>{todaySeance.nom}</div>
                <div style={{fontSize:11,color:"#64748b"}}>{todaySeance.focus} · {todaySeance.duree}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {(() => {
                  const total = todaySeance.exercices?.length || 0;
                  const done = todaySeance.exercices?.filter((_,idx) => checkedEx[`${todaySeance.id}-${idx}`]).length || 0;
                  const pct = total > 0 ? Math.round(done/total*100) : 0;
                  return <>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:300,color:pct===100?"#22c55e":"#3b82f6",lineHeight:1}}>{pct}%</div>
                    <div style={{fontSize:9,color:"#64748b"}}>{done}/{total}</div>
                  </>;
                })()}
              </div>
            </div>
            {!todaySeance.complete && (
              <div style={{borderTop:"0.5px solid #dce8f4",padding:"8px 14px 10px"}}>
                {(todaySeance.exercices||[]).map((ex,idx) => {
                  const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                  const cc = {principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6"}[ex.cat||"principal"]||"#3b82f6";
                  return (
                    <div key={idx} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:idx<(todaySeance.exercices.length-1)?"0.5px solid #f1f5f9":"none",opacity:isChecked?0.5:1}}>
                      <div onClick={() => toggleCheck(todaySeance.id,idx,ex.repos)} style={{width:16,height:16,borderRadius:4,background:isChecked?"#22c55e":"transparent",border:`1.5px solid ${isChecked?"#22c55e":"#dce8f4"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,color:"#fff"}}>{isChecked?"✓":""}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:500,color:isChecked?"#94a3b8":"#0f1a2e",textDecoration:isChecked?"line-through":"none"}}>{ex.nom}</div>
                        <div style={{fontSize:9,color:"#64748b"}}>{ex.series}×{ex.reps} · {ex.repos}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
                      </div>
                      <div style={{width:3,height:20,borderRadius:2,background:cc,flexShrink:0}}/>
                    </div>
                  );
                })}
                <button onClick={() => setViewSeance(todaySeance)} style={{width:"100%",marginTop:8,padding:"8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:8,color:"#3b82f6",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>
                  Démarrer la séance →
                </button>
              </div>
            )}
            {todaySeance.complete && <div style={{padding:"8px 14px 10px",fontSize:11,color:"#22c55e",fontWeight:600}}>✓ Complétée le {todaySeance.date}</div>}
          </Box>
        </div>
      ) : (
        <Box style={{textAlign:"center",padding:"24px 16px"}}>
          <div style={{fontSize:32,marginBottom:8}}>😴</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:500,marginBottom:4}}>Jour de repos</div>
          <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>Profites-en pour récupérer. Tes records sont disponibles ci-dessous.</div>
        </Box>
      )}

      {/* ── Stats RM ── */}
      {prog && (
        <div style={{marginTop:16}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:400,color:"#0f1a2e",letterSpacing:-0.3}}>Records & Objectifs</div>
              <div style={{fontSize:10,color:"#64748b",marginTop:1}}>Charges recommandées par intensité</div>
            </div>
            <div style={{display:"flex",gap:5}}>
              {[{id:"today",l:"Séance"},{id:"all",l:"Tout"}].map(f => (
                <button key={f.id} onClick={() => setRmFilter(f.id)} style={{padding:"5px 11px",borderRadius:16,border:`0.5px solid ${rmFilter===f.id?"#3b82f6":"#dce8f4"}`,background:rmFilter===f.id?"rgba(59,130,246,0.08)":"transparent",color:rmFilter===f.id?"#3b82f6":"#64748b",cursor:"pointer",fontSize:11,fontWeight:rmFilter===f.id?600:400,fontFamily:"'Inter',sans-serif"}}>{f.l}</button>
              ))}
            </div>
          </div>

          {/* Légende */}
          <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.12)",borderRadius:10,marginBottom:12,display:"flex",gap:12,flexWrap:"wrap"}}>
            {[{reps:5,l:"Force",color:"#f97316"},{reps:10,l:"Hypertrophie",color:"#3b82f6"},{reps:12,l:"Hypertrophie+",color:"#06b6d4"}].map(o => (
              <div key={o.reps} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:o.color}}/>
                <span style={{fontSize:10,color:"#64748b"}}>{o.reps} reps = <span style={{color:o.color,fontWeight:600}}>{o.l}</span></span>
              </div>
            ))}
            <div style={{fontSize:10,color:"#94a3b8",width:"100%"}}>Formule Epley · Arrondis au 0.5kg · Cliquez pour le tableau complet</div>
          </div>

          {/* Liste exercices avec records */}
          {rmData.length === 0 ? (
            <Box style={{textAlign:"center",padding:"24px 16px"}}>
              <div style={{fontSize:24,marginBottom:8}}>📊</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:400,marginBottom:6}}>Pas encore de données</div>
              <div style={{fontSize:11,color:"#64748b",lineHeight:1.6}}>Enregistre tes charges pendant les séances pour voir apparaître tes records et les charges cibles par objectif.</div>
            </Box>
          ) : (
            <div>
              {rmData.map((ex, i) => (
                <RMCard key={i} exData={ex} C={C} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pas de programme ── */}
      {!prog && (
        <Box style={{textAlign:"center",padding:"20px 16px",marginTop:8}}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Aucun programme actif</div>
          <Btn onClick={() => { if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Générer mon programme</Btn>
          <Btn v="out" onClick={() => setProgView("creer")}>Créer manuellement</Btn>
        </Box>
      )}
    </div>
  );
}
