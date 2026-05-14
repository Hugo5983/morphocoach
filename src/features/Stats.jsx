import {{ useState, useRef, useEffect, useCallback, useMemo }} from "react";
import {{ C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS }} from "../data/constants.js";
import {{ FOODS }} from "../data/foods.js";
import {{ EX }} from "../data/exercises.js";
import {{ MOTIVATIONS }} from "../data/motivations.js";
import {{ Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart }} from "../components/ui/index.jsx";

// ─── STATS ──────────────────────────────────────────────────────────────

 export default function Stats(props){
 const { prog, cycles, push, semC, C, INT } = props;
 if(!prog)return(
 <Box style={{textAlign:"center",padding:"40px 20px",margin:"0 15px"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,opacity:.1,fontWeight:300,marginBottom:12}}>STATS</div>
 <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Créez un programme et enregistrez vos séances pour voir votre progression.</div>
 </Box>
 );
 const allH={};
 prog.jours.forEach(j=>j.exercices.forEach(ex=>{if(ex.historique.length>0){if(!allH[ex.nom])allH[ex.nom]=[];allH[ex.nom].push(...ex.historique);}}));
 const seancesFaites=prog.jours.filter(j=>j.complete).length;
 const vol=Object.values(allH).flat().reduce((a,h)=>a+((parseFloat(h.poids)||0)*(parseFloat(String(h.reps).split("-")[0])||0)),0);
 const records=Object.entries(allH).map(([n,h])=>({n,max:Math.max(...h.map(x=>parseFloat(x.poids)||0)),c:h.length})).sort((a,b)=>b.max-a.max);
 const colors=[C.gold,C.green,C.blue,C.orange,C.purple,C.red];
 return(
 <div style={{padding:"0 15px"}} className="anim">
 {/* KPIs */}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:9}}>
 {[
 {l:"Séances",v:seancesFaites,c:C.gold},
 {l:"Volume",v:`${Math.round(vol).toLocaleString("fr-FR")}`,u:"kg",c:C.green},
 {l:"Semaine",v:`${semC+1}/6`,c:C.blue}
 ].map(s=>(
 <Box key={s.l} style={{marginBottom:0,textAlign:"center",padding:"14px 6px"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:s.c,letterSpacing:-0.5,lineHeight:1}}>
 {s.v}{s.u&&<span style={{fontSize:11,color:"#64748b",marginLeft:2,fontWeight:500}}>{s.u}</span>}
 </div>
 <div style={{fontSize:10,color:"#64748b",marginTop:5,letterSpacing:"0.3px"}}>{s.l}</div>
 </Box>
 ))}
 </div>
 {/* Séances complétées */}
 {seancesFaites>0&&(
 <Box>
 <Lbl>Progression des séances</Lbl>
 {prog.jours.map((jour,i)=>{
 const int=INT[jour.intensite||"modere"];
 return(
 <Row key={i} style={{marginBottom:8,paddingBottom:8,borderBottom:i<prog.jours.length-1?`1px solid ${C.s3}`:"none"}}>
 <div style={{width:8,height:8,borderRadius:"50%",background:jour.complete?C.green:int.c,marginRight:10,flexShrink:0}}/>
 <div style={{flex:1}}>
 <div style={{fontSize:12,color:jour.complete?C.text:"#64748b",fontWeight:jour.complete?600:400}}>{jour.nom}</div>
 <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{jour.focus}</div>
 </div>
 {jour.complete&&<div style={{fontSize:10,color:C.green,fontWeight:600}}>✓ {jour.date}</div>}
 </Row>
 );
 })}
 </Box>
 )}
 {/* Courbes */}
 {Object.entries(allH).length>0?(
 <div>
 <Lbl>Progression par exercice</Lbl>
 {Object.entries(allH).slice(0,6).map(([nom,h],i)=>{
 const data=[...h].sort((a,b)=>{
 const[da,ma,ya]=(a.date||"").split("/").map(Number);
 const[db,mb,yb]=(b.date||"").split("/").map(Number);
 return new Date(ya||0,(ma||1)-1,da||0)-new Date(yb||0,(mb||1)-1,db||0);
 });
 return(
 <Box key={i}>
 <div style={{fontSize:13,fontWeight:500,marginBottom:12,fontFamily:"'Syne',sans-serif"}}>{nom}</div>
 <MiniChart data={data} color={colors[i%6]}/>
 <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.s3}`,display:"flex",gap:12,fontSize:10,color:"#64748b"}}>
 <span>{data.length} séances</span>
 <span>·</span>
 <span>Max : <span style={{color:C.gold,fontWeight:700}}>{Math.max(...data.map(d=>parseFloat(d.poids)||0))}kg</span></span>
 </div>
 </Box>
 );
 })}
 {/* Records personnels */}
 <Box>
 <Lbl>Records personnels</Lbl>
 {records.slice(0,10).map((r,i)=>(
 <Row key={i} style={{padding:"10px 0",borderBottom:i<Math.min(records.length,10)-1?`1px solid ${C.s3}`:"none",justifyContent:"space-between"}}>
 <div style={{flex:1}}>
 <div style={{fontSize:12,color:C.text}}>{r.n}</div>
 <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{r.c} séance{r.c>1?"s":""}</div>
 </div>
 <div style={{display:"flex",alignItems:"baseline",gap:3}}>
 <span style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:300,color:i===0?C.gold:C.text,letterSpacing:-0.5}}>{r.max}</span>
 <span style={{fontSize:10,color:"#64748b"}}>kg</span>
 {i===0&&<span style={{marginLeft:4,fontSize:12}}>🏆</span>}
 </div>
 </Row>
 ))}
 </Box>
 {/* Motivation */}
 <Box style={{background:`linear-gradient(135deg,rgba(212,168,83,0.08),rgba(212,168,83,0.02))`,border:`0.5px solid ${C.goldB}`,textAlign:"center"}}>
 <div style={{fontSize:20,marginBottom:8}}>💪</div>
 <div style={{fontSize:13,color:C.text,lineHeight:1.6,fontWeight:500}}>
 {seancesFaites<5?"Vous êtes sur la bonne voie ! Continuez à enregistrer vos séances.":
 seancesFaites<15?"Excellent travail ! Votre consistance paye déjà.":
 "Performance remarquable ! Vous êtes un(e) vrai(e) athlète."}
 </div>
 </Box>
 </div>
 ):(
 <Box>
 <Lbl>Courbes de progression</Lbl>
 <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:"#64748b",lineHeight:1.7}}>
 Enregistrez vos poids et répétitions<br/>
 dans les séances pour voir vos courbes.
 </div>
 </Box>
 )}
 {/* Historique des cycles précédents */}
 {cycles.length>0&&(
 <div style={{marginTop:4}}>
 <Lbl>Historique des cycles</Lbl>
 {cycles.map((c,i)=>{
 const sf=c.jours?c.jours.filter(j=>j.complete).length:0;
 const totalEx=c.jours?c.jours.reduce((a,j)=>a+j.exercices.length,0):0;
 return(
 <Box key={i} style={{borderLeft:`2px solid ${C.goldB}`,opacity:0.85}}>
 <Row style={{justifyContent:"space-between",marginBottom:6}}>
 <div>
 <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>
 Cycle {c.numero||i+1} · Archivé
 </div>
 <div style={{fontSize:13,fontWeight:500}}>{c.titre}</div>
 </div>
 <div style={{textAlign:"right"}}>
 <div style={{fontSize:11,color:C.green,fontWeight:600}}>{sf} séances</div>
 <div style={{fontSize:10,color:"#64748b"}}>{c.archiveDate||c.dateDebut}</div>
 </div>
 </Row>
 {c.morpho?.resume&&(
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.5,marginBottom:6,fontStyle:"italic"}}>
 {c.morpho.resume}
 </div>
 )}
 {c.chargesResume&&(
 <div style={{padding:"7px 9px",background:C.s2,borderRadius:7,fontSize:10,color:"#64748b"}}>
 <span style={{color:C.gold,fontWeight:700}}>Records : </span>{c.chargesResume}
 </div>
 )}
 </Box>
 );
 })}
 </div>
 )}
 </div>
 );
 }
}