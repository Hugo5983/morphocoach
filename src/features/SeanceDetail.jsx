import { C, INT } from "../data/constants.js";
import { EX } from "../data/exercises.js";
import { Box, Lbl, Inp, Btn, Bar, Row } from "../components/ui/index.jsx";

// ─── SEANCE DETAIL ──────────────────────────────────────────────────────────
// Vue détaillée d'une séance avec exercices, cochage, historique, etc.
// Utilisé par TodayView, SemaineView et Seances.

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
      <div style={{padding:"13px 14px",background:`${int.c}14`,border:`1px solid ${int.c}30`,borderRadius:11,marginBottom:10}}>
        <Row style={{justifyContent:"space-between",marginBottom:6}}>
          <div>
            <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:400,letterSpacing:-0.5}}>{seance.nom}</div>
            <div style={{fontSize:11,color:"#64748b"}}>{seance.focus} · {seance.duree}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:pct===100?C.green:C.gold}}>{pct}%</div>
            <div style={{fontSize:9,color:"#64748b"}}>{done}/{total}</div>
          </div>
        </Row>
        <Bar pct={pct} color={pct===100?C.green:int.c} h={4}/>
      </div>
      <button onClick={()=>setChrono(true)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500,marginBottom:10}}>⏱ Chronomètre de repos</button>
      {seance.exercices?.map((ex,j)=>{
        const cc = {principal:C.gold,correctif:C.red,mobilite:C.blue,gainage:C.green,isolation:C.purple}[ex.cat||"principal"]||C.gold;
        const exInfo = Object.values(EX).flat().find(e=>e.n===ex.nom)||null;
        const isChecked = !!checkedEx[`${seance.id}-${j}`];
        const showDet = !!exDetails[`${seance.id}-${j}`];
        const editMd  = !!exEdit[`${seance.id}-${j}`];
        const last = ex.historique?.length>0?ex.historique[ex.historique.length-1]:null;
        return (
          <Box key={j} style={{borderLeft:`2px solid ${cc}`,opacity:isChecked?0.7:1}}>
            <Row style={{justifyContent:"space-between",marginBottom:8}}>
              <div style={{flex:1}}>
                <Row style={{gap:7,marginBottom:4}}>
                  <div onClick={()=>toggleCheck(seance.id,j,ex.repos)} style={{width:20,height:20,borderRadius:5,background:isChecked?C.green:"transparent",border:`2px solid ${isChecked?C.green:C.s3}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"white"}}>{isChecked?"✓":""}</div>
                  <div style={{fontSize:13,fontWeight:500,textDecoration:isChecked?"line-through":"none",color:isChecked?"#64748b":C.text}}>{ex.nom}</div>
                </Row>
                {ex.cat && <div style={{display:"inline-block",padding:"2px 8px",background:`${cc}18`,border:`1px solid ${cc}30`,borderRadius:5,fontSize:9,color:cc,fontWeight:700,textTransform:"uppercase"}}>{ex.cat}</div>}
              </div>
              <Row style={{gap:5}}>
                <button onClick={()=>setExEdit(e=>({...e,[`${seance.id}-${j}`]:!e[`${seance.id}-${j}`]}))} style={{padding:"4px 8px",background:editMd?"rgba(212,168,83,0.15)":C.s2,border:`1px solid ${editMd?C.gold:C.s3}`,borderRadius:6,color:editMd?C.gold:"#64748b",cursor:"pointer",fontSize:11}}>✏️</button>
                <button onClick={()=>setExDetails(e=>({...e,[`${seance.id}-${j}`]:!e[`${seance.id}-${j}`]}))} style={{padding:"4px 8px",background:showDet?"rgba(77,143,224,0.15)":C.s2,border:`1px solid ${showDet?C.blue:C.s3}`,borderRadius:6,color:showDet?C.blue:"#64748b",cursor:"pointer",fontSize:11}}>{showDet?"▲":"ℹ️"}</button>
              </Row>
            </Row>
            {!editMd ? (
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                {[{l:"Sets",v:ex.series},{l:"Reps",v:ex.reps},{l:"Repos",v:ex.repos},{l:"Charge",v:ex.charge}].filter(s=>s.v).map(s=>(
                  <div key={s.l} style={{padding:"4px 9px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:6,textAlign:"center",minWidth:52}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:500,color:C.gold}}>{s.v}</div>
                    <div style={{fontSize:9,color:"#64748b"}}>{s.l}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{background:C.s2,borderRadius:8,padding:10,marginBottom:10}}>
                <div style={{fontSize:10,color:C.gold,fontWeight:700,marginBottom:8}}>✏️ Modifier</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(p=>(
                    <div key={p.k}>
                      <div style={{fontSize:9,color:"#64748b",marginBottom:3}}>{p.l}</div>
                      <input defaultValue={ex[p.k]||""} onBlur={e=>{
                        const u=[...prog.jours];
                        const sIdx=prog.jours.findIndex(s=>s.id===seance.id);
                        if(sIdx>=0){u[sIdx].exercices[j][p.k]=e.target.value;setProg({...prog,jours:u});}
                      }} style={{width:"100%",padding:"7px 9px",background:C.s3,border:"0.5px solid #dce8f4",borderRadius:6,color:C.text,fontSize:12,fontFamily:"'Inter',sans-serif"}}/>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setExEdit(e=>({...e,[`${seance.id}-${j}`]:false}))} style={{marginTop:8,width:"100%",padding:"7px",background:"rgba(62,199,122,0.1)",border:"1px solid rgba(62,199,122,0.3)",borderRadius:7,color:C.green,cursor:"pointer",fontSize:11,fontWeight:600}}>✓ OK</button>
              </div>
            )}
            {ex.morpho_tip && <div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:"#64748b",lineHeight:1.5,marginBottom:6}}><span style={{color:C.gold,fontWeight:700}}>Morpho · </span>{ex.morpho_tip}</div>}
            {showDet && (
              <div style={{borderTop:`1px solid ${C.s3}`,paddingTop:10,marginTop:4}}>
                {exInfo?.morpho && <div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:"#64748b",lineHeight:1.5,marginBottom:8}}><span style={{color:C.gold,fontWeight:700}}>Guide · </span>{exInfo.morpho}</div>}
                {exInfo?.tips?.length>0 && (
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Tips</div>
                    {exInfo.tips.map((tip,ti)=>(
                      <Row key={ti} style={{gap:7,marginBottom:4,alignItems:"flex-start"}}>
                        <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(62,199,122,0.12)",border:"1px solid rgba(62,199,122,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0,marginTop:1}}>{ti+1}</div>
                        <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{tip}</div>
                      </Row>
                    ))}
                  </div>
                )}
                {exInfo?.variantes?.length>0 && (
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:9,color:"#f97316",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Variantes</div>
                    {exInfo.variantes.map((v,vi)=>(
                      <div key={vi} style={{padding:"5px 8px",background:C.s2,borderRadius:6,marginBottom:4,fontSize:11,color:C.text}}>{v}</div>
                    ))}
                  </div>
                )}
                {exInfo?.erreurs?.length>0 && (
                  <div style={{marginBottom:6}}>
                    <div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Erreurs à éviter</div>
                    {exInfo.erreurs.map((err,ei)=>(
                      <Row key={ei} style={{gap:7,marginBottom:4,alignItems:"flex-start"}}>
                        <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.red,flexShrink:0,marginTop:1}}>✕</div>
                        <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{err}</div>
                      </Row>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Row style={{gap:6,marginTop:8}}>
              <Inp style={{flex:1,marginBottom:0}} type="number" placeholder={last?`Dernier: ${last.poids}kg`:"Poids (kg)"} id={`pw-${seance.id}-${j}`}/>
              <Inp style={{width:66,marginBottom:0}} type="number" placeholder="Reps" id={`rp-${seance.id}-${j}`}/>
              <button onClick={()=>{
                const p=document.getElementById(`pw-${seance.id}-${j}`)?.value;
                const r=document.getElementById(`rp-${seance.id}-${j}`)?.value;
                if(!p) return;
                const u=[...prog.jours];
                const sIdx=u.findIndex(s=>s.id===seance.id);
                if(sIdx>=0){
                  u[sIdx].exercices[j].historique=[...(u[sIdx].exercices[j].historique||[]),{poids:parseFloat(p),reps:r||ex.reps,date:new Date().toLocaleDateString("fr-FR")}];
                  setProg({...prog,jours:u});
                }
                document.getElementById(`pw-${seance.id}-${j}`).value="";
                document.getElementById(`rp-${seance.id}-${j}`).value="";
                setChrono(true);
              }} style={{height:40,padding:"0 13px",background:"rgba(62,199,122,.12)",border:"1px solid rgba(62,199,122,.3)",borderRadius:7,color:C.green,cursor:"pointer",fontSize:20}}>+</button>
            </Row>
          </Box>
        );
      })}
      {pct===100 && (
        <Box style={{background:"rgba(62,199,122,0.08)",borderColor:"rgba(62,199,122,0.3)",textAlign:"center",padding:"20px 16px"}}>
          <div style={{fontSize:32,marginBottom:8}}>🏆</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:400,color:C.green,marginBottom:6}}>Séance terminée !</div>
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
