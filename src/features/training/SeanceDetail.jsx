import { useState } from "react";
import { C, INT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Box, Inp, Btn, Row } from "../../components/ui/index.jsx";

// ─── SEANCE DETAIL ──────────────────────────────────────────────────────────
// Vue détaillée d'une séance avec exercices, cochage, historique, etc.
// Utilisé par TodayView, SemaineView et Seances.

// ─── Ligne saisie d'historique (state local pour éviter document.getElementById) ──
function EntryRow({ ex, seanceId, exIdx, prog, setProg, setChrono, C }) {
  const [poids, setPoids] = useState("");
  const [reps,  setReps]  = useState("");
  const last = ex.historique?.length > 0 ? ex.historique[ex.historique.length - 1] : null;

  const handleAdd = () => {
    if (!poids) return;
    const u = JSON.parse(JSON.stringify(prog));
    const sIdx = u.jours.findIndex(s => s.id === seanceId);
    if (sIdx >= 0) {
      u.jours[sIdx].exercices[exIdx].historique = [
        ...(u.jours[sIdx].exercices[exIdx].historique || []),
        { poids: parseFloat(poids), reps: reps || ex.reps, date: new Date().toLocaleDateString("fr-FR") },
      ];
      setProg(u);
    }
    setPoids(""); setReps("");
    if (setChrono) setChrono(true);
  };

  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
      <input
        type="number" value={poids} onChange={e => setPoids(e.target.value)}
        placeholder={last ? `Dernier: ${last.poids}kg` : "Poids (kg)"}
        style={{ flex: 1, padding: "8px 10px", background: C.s2,
          border: "0.5px solid rgba(190,180,255,0.07)", borderRadius: 7,
          fontSize: 13, color: C.text, fontFamily: "'Inter',sans-serif" }}
      />
      <input
        type="number" value={reps} onChange={e => setReps(e.target.value)}
        placeholder="Reps"
        style={{ width: 66, padding: "8px 6px", background: C.s2,
          border: "0.5px solid rgba(190,180,255,0.07)", borderRadius: 7,
          fontSize: 13, color: C.text, fontFamily: "'Inter',sans-serif", textAlign: "center" }}
      />
      <button
        onClick={handleAdd}
        style={{ height: 40, padding: "0 13px", background: "rgba(62,199,122,.12)",
          border: "1px solid rgba(62,199,122,.3)", borderRadius: 7,
          color: C.green, cursor: "pointer", fontSize: 20 }}
      >+</button>
    </div>
  );
}

export default function SeanceDetail({
  seance, onBack,
  prog, setProg,
  checkedEx, toggleCheck,
  exDetails, setExDetails,
  exEdit, setExEdit,
  setChrono,
  push,
}) {
  if (!seance) return null;
  const int = INT[seance.intensite || "modere"];
  const total = seance.exercices?.length || 0;
  const done = seance.exercices?.filter((_, i) => checkedEx[`${seance.id}-${i}`]).length || 0;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;

  return (
    <div style={{padding:"0 15px"}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px 0",marginBottom:10,display:"flex",alignItems:"center",gap:5}}>← Retour</button>
      <div style={{position:"relative",borderRadius:22,overflow:"hidden",marginBottom:12,padding:"18px 18px 16px",background:`linear-gradient(155deg, ${int.c} 0%, ${int.c}cc 55%, ${int.c}66 100%)`,border:"1px solid rgba(255,255,255,0.22)",boxShadow:`0 16px 32px ${int.c}40, inset 0 1px 0 rgba(255,255,255,0.3)`}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(160% 60% at 20% 10%, rgba(255,255,255,0.4), transparent 55%)"}}/>
        <Row style={{justifyContent:"space-between",position:"relative"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:999,background:"rgba(11,15,31,0.28)",color:"#0B0F1F",fontSize:9,fontWeight:800,fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",letterSpacing:1.2,marginBottom:10}}>{int.l.toUpperCase()}</div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:32,fontWeight:400,letterSpacing:-1.2,color:"#0B0F1F",lineHeight:1}}>{seance.nom}</div>
            <div style={{fontSize:12,color:"rgba(11,15,31,0.78)",fontWeight:600,marginTop:5,fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif"}}>{seance.focus} · {seance.duree}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:32,color:"#0B0F1F",lineHeight:1}}>{pct}%</div>
            <div style={{fontSize:9,color:"rgba(11,15,31,0.7)",fontWeight:700,fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif"}}>{done}/{total}</div>
          </div>
        </Row>
        <div style={{position:"relative",height:5,background:"rgba(11,15,31,0.22)",borderRadius:3,overflow:"hidden",marginTop:12}}>
          <div style={{height:"100%",width:`${pct}%`,background:"#0B0F1F",borderRadius:3,transition:"width .5s"}}/>
        </div>
      </div>
      <button onClick={()=>setChrono(true)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 13px",background:C.s2,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:9,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500,marginBottom:10}}>⏱ Chronomètre de repos</button>
      {seance.exercices?.map((ex,j)=>{
        const METHODS = ["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Dégressif","Pré-fatigue","Wave loading"];
        const cc = {principal:C.gold,correctif:C.red,mobilite:C.blue,gainage:C.green,isolation:C.purple}[ex.cat||"principal"]||C.gold;
        const exInfo = Object.values(EX).flat().find(e=>e.n===ex.nom)||null;
        const isChecked = !!checkedEx[`${seance.id}-${j}`];
        const showDet = !!exDetails[`${seance.id}-${j}`];
        const editMd  = !!exEdit[`${seance.id}-${j}`];
        const toggleEdit = () => setExEdit(e=>({...e,[`${seance.id}-${j}`]:!e[`${seance.id}-${j}`]}));
        const updateField = (k, val) => {
          const u=JSON.parse(JSON.stringify(prog.jours));
          const sIdx=u.findIndex(s=>s.id===seance.id);
          if(sIdx>=0){u[sIdx].exercices[j][k]=val;setProg({...prog,jours:u});}
        };
        return (
          <Box key={j} style={{borderLeft:`2px solid ${cc}`,opacity:isChecked?0.7:1}}>
            <Row style={{justifyContent:"space-between",marginBottom:8}}>
              <div style={{flex:1}}>
                <Row style={{gap:8,marginBottom:4}}>
                  {/* Checkbox visible et cliquable */}
                  <div onClick={()=>toggleCheck(seance.id,j,ex.repos)}
                    style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",
                      background:isChecked?"#34D399":"transparent",
                      border:`2px solid ${isChecked?"#34D399":"rgba(255,255,255,0.25)"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      boxShadow:isChecked?"0 0 8px #34D39960":"none",
                      transition:"all .15s"}}>
                    {isChecked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="#0B0F1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{fontSize:13,fontWeight:500,textDecoration:isChecked?"line-through":"none",color:isChecked?"rgba(245,241,232,0.50)":C.text}}>{ex.nom}</div>
                </Row>
                {ex.cat && <div style={{display:"inline-block",padding:"2px 8px",background:`${cc}18`,border:`1px solid ${cc}30`,borderRadius:5,fontSize:9,color:cc,fontWeight:700,textTransform:"uppercase"}}>{ex.cat}</div>}
              </div>
              <Row style={{gap:5}}>
                <button onClick={toggleEdit} style={{padding:"4px 8px",background:editMd?"rgba(212,168,83,0.15)":C.s2,border:`1px solid ${editMd?C.gold:C.s3}`,borderRadius:6,color:editMd?C.gold:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:11}}>✏️</button>
                <button onClick={()=>setExDetails(e=>({...e,[`${seance.id}-${j}`]:!e[`${seance.id}-${j}`]}))} style={{padding:"4px 8px",background:showDet?"rgba(77,143,224,0.15)":C.s2,border:`1px solid ${showDet?C.blue:C.s3}`,borderRadius:6,color:showDet?C.blue:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:11}}>{showDet?"▲":"ℹ️"}</button>
              </Row>
            </Row>

            {/* Chips cliquables → ouvrent le formulaire */}
            {!editMd ? (
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8,cursor:"pointer"}} onClick={toggleEdit}>
                {[{l:"Sets",v:ex.series},{l:"Reps",v:ex.reps},{l:"Repos",v:ex.repos},{l:"Charge",v:ex.charge}].filter(s=>s.v).map(s=>(
                  <div key={s.l} style={{padding:"4px 9px",background:C.s2,border:`1px solid ${C.s3}`,borderRadius:6,textAlign:"center",minWidth:52}}>
                    <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:14,fontWeight:600,color:C.gold}}>{s.v}</div>
                    <div style={{fontSize:9,color:"rgba(245,241,232,0.50)"}}>{s.l}</div>
                  </div>
                ))}
                {ex.methode && ex.methode !== "Classique" && (
                  <div style={{padding:"4px 9px",background:`${cc}12`,border:`1px solid ${cc}30`,borderRadius:6,display:"flex",alignItems:"center"}}>
                    <div style={{fontSize:9,color:cc,fontWeight:700}}>{ex.methode}</div>
                  </div>
                )}
                <div style={{padding:"4px 8px",display:"flex",alignItems:"center",opacity:.4}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
              </div>
            ) : (
              /* Formulaire MODIFIER */
              <div style={{background:C.s2,borderRadius:12,padding:12,marginBottom:10}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:10,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>Modifier l'exercice</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  {[{l:"SÉRIES",k:"series"},{l:"REPS",k:"reps"},{l:"REPOS",k:"repos"},{l:"CHARGE",k:"charge"}].map(p=>{
                    const step = p.k==="repos" ? 15 : 1;
                    return (
                      <div key={p.k} style={{minWidth:0}}>
                        <div style={{fontSize:8,fontWeight:700,letterSpacing:"1px",color:"rgba(242,244,247,0.30)",marginBottom:5,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>{p.l}</div>
                        <div style={{display:"flex",gap:3,alignItems:"center"}}>
                          <button onClick={()=>updateField(p.k,String(Math.max(0,(parseFloat(ex[p.k])||0)-step)))} style={{width:26,height:26,borderRadius:7,background:"rgba(255,255,255,0.06)",border:"none",cursor:"pointer",fontSize:14,color:"rgba(242,244,247,0.55)",flexShrink:0,display:"grid",placeItems:"center"}}>−</button>
                          <input value={ex[p.k]||""} onChange={e=>updateField(p.k,e.target.value)} autoComplete="off"
                            style={{flex:1,minWidth:0,padding:"5px 4px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,fontSize:12,fontWeight:600,textAlign:"center",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",color:"#F2F4F7",outline:"none"}}/>
                          <button onClick={()=>updateField(p.k,String((parseFloat(ex[p.k])||0)+step))} style={{width:26,height:26,borderRadius:7,background:"rgba(59,130,246,0.15)",border:"none",cursor:"pointer",fontSize:14,color:"#60A5FA",flexShrink:0,display:"grid",placeItems:"center"}}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Méthode d'entraînement */}
                <div style={{fontSize:8,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.30)",marginBottom:7,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>Méthode</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                  {METHODS.map(mm=>{const on=(ex.methode||"Classique")===mm;return(
                    <button key={mm} onClick={()=>updateField("methode",mm)} style={{padding:"5px 10px",borderRadius:99,border:`1px solid ${on?"rgba(96,165,250,0.6)":"rgba(255,255,255,0.10)"}`,background:on?"rgba(59,130,246,0.15)":"transparent",color:on?"#60A5FA":"rgba(242,244,247,0.40)",cursor:"pointer",fontSize:10,fontWeight:on?700:500,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>{mm}</button>
                  );})}
                </div>
                <button onClick={()=>setExEdit(e=>({...e,[`${seance.id}-${j}`]:false}))} style={{width:"100%",padding:"8px",background:"rgba(52,211,153,0.10)",border:"1px solid rgba(52,211,153,0.30)",borderRadius:9,color:"#34D399",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>✓ OK</button>
              </div>
            )}

            {ex.morpho_tip && <div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:"rgba(245,241,232,0.50)",lineHeight:1.5,marginBottom:6}}><span style={{color:C.gold,fontWeight:700}}>Morpho · </span>{ex.morpho_tip}</div>}
            {showDet && (
              <div style={{borderTop:`1px solid ${C.s3}`,paddingTop:10,marginTop:4}}>
                {exInfo?.morpho && <div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:"rgba(245,241,232,0.50)",lineHeight:1.5,marginBottom:8}}><span style={{color:C.gold,fontWeight:700}}>Guide · </span>{exInfo.morpho}</div>}
                {exInfo?.tips?.length>0 && (<div style={{marginBottom:8}}><div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Tips</div>{exInfo.tips.map((tip,ti)=>(<Row key={ti} style={{gap:7,marginBottom:4,alignItems:"flex-start"}}><div style={{width:16,height:16,borderRadius:"50%",background:"rgba(62,199,122,0.12)",border:"1px solid rgba(62,199,122,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0,marginTop:1}}>{ti+1}</div><div style={{fontSize:11,color:"rgba(245,241,232,0.50)",lineHeight:1.5}}>{tip}</div></Row>))}</div>)}
                {exInfo?.variantes?.length>0 && (<div style={{marginBottom:8}}><div style={{fontSize:9,color:"#FFAB5D",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Variantes</div>{exInfo.variantes.map((v,vi)=>(<div key={vi} style={{padding:"5px 8px",background:C.s2,borderRadius:6,marginBottom:4,fontSize:11,color:C.text}}>{v}</div>))}</div>)}
                {exInfo?.erreurs?.length>0 && (<div style={{marginBottom:6}}><div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Erreurs à éviter</div>{exInfo.erreurs.map((err,ei)=>(<Row key={ei} style={{gap:7,marginBottom:4,alignItems:"flex-start"}}><div style={{width:16,height:16,borderRadius:"50%",background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.red,flexShrink:0,marginTop:1}}>✕</div><div style={{fontSize:11,color:"rgba(245,241,232,0.50)",lineHeight:1.5}}>{err}</div></Row>))}</div>)}
              </div>
            )}

            {/* Logger une série — séparé du bloc paramètres */}
            <div style={{borderTop:`1px solid ${C.s3}`,marginTop:8,paddingTop:8}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(245,241,232,0.30)",marginBottom:6,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>↓ Logger une série</div>
              <EntryRow ex={ex} seanceId={seance.id} exIdx={j} prog={prog} setProg={setProg} setChrono={setChrono} C={C} />
            </div>
          </Box>
        );
      })}
      {pct===100 && (
        <Box style={{background:"rgba(62,199,122,0.08)",borderColor:"rgba(62,199,122,0.3)",textAlign:"center",padding:"20px 16px"}}>
          <div style={{fontSize:32,marginBottom:8}}>🏆</div>
          <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:16,fontWeight:400,color:C.green,marginBottom:6}}>Séance terminée !</div>
          <Btn onClick={()=>{
            const u=[...prog.jours];
            const sIdx=u.findIndex(s=>s.id===seance.id);
            if(sIdx>=0){u[sIdx].complete=true;u[sIdx].date=new Date().toLocaleDateString("fr-FR");setProg({...prog,jours:u});}
            push("🏆","Séance terminée !","Bravo ! Progression enregistrée.");
            onBack();
          }}>✓ Valider la séance</Btn>
        </Box>
      )}
    </div>
  );
}
