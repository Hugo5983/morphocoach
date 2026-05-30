import { useState } from "react";
import { C, INT } from "../../data/constants.js";
import { Box, Btn, Bar, Row } from "../../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";

// ─── SEMAINEVIEW ──────────────────────────────────────────────────────────────

 export default function SemaineView(props){
 const { prog, setProg, checkedEx, setCheckedEx, seance, INT, setProgView, push, setChrono, setChronoSec, exDetails, setExDetails, exEdit, setExEdit } = props;

 const getWeekSeances = () => {
   if(!prog) return [];
   const today=new Date();
   const dayNames=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
   return ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((dayShort)=>{
     const seance=prog.jours.find(j=>
       j.nom.toLowerCase().includes(dayShort.toLowerCase())||
       j.focus?.toLowerCase().includes(dayShort.toLowerCase())
     );
     return {day:dayShort, seance, isToday:dayNames[today.getDay()]===dayShort};
   });
 };

 const toggleCheck = (seanceId, exIdx, repos) => {
   const key=`${seanceId}-${exIdx}`;
   const wasChecked=checkedEx[key];
   setCheckedEx(prev=>({...prev,[key]:!prev[key]}));
   if(!wasChecked && repos){
     const sec=parseInt((repos||"90s").replace(/[^0-9]/g,""))||90;
     setChronoSec(sec);
     setChrono(true);
   }
 };

 const week=getWeekSeances();
 const [viewSeance,setViewSeance]=useState(null);
 if(viewSeance) return <SeanceDetail seance={viewSeance} onBack={()=>setViewSeance(null)} prog={prog} setProg={setProg} checkedEx={checkedEx} toggleCheck={toggleCheck} exDetails={exDetails} setExDetails={setExDetails} exEdit={exEdit} setExEdit={setExEdit} setChrono={setChrono} push={push} />;
 return(
 <div style={{padding:"0 15px"}}>
 {week.map(({day,seance,isToday},i)=>{
 if(!seance) return(
 <div key={i} style={{padding:"10px 12px",background:isToday?"rgba(212,168,83,0.05)":C.s2,border:`1px solid ${isToday?C.goldB:C.s3}`,borderRadius:9,marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
 <div style={{width:36,height:36,borderRadius:"50%",background:isToday?C.goldD:C.s3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:isToday?C.gold:"rgba(242,244,247,0.50)",flexShrink:0}}>{day}</div>
 <div style={{fontSize:12,color:C.dim,fontStyle:"italic"}}>Repos</div>
 {isToday&&<div style={{marginLeft:"auto",fontSize:9,color:C.gold,fontWeight:700,border:`0.5px solid ${C.goldB}`,padding:"2px 7px",borderRadius:5}}>AUJOURD'HUI</div>}
 </div>
 );
 const int=INT[seance.intensite||"modere"];
 const total=seance.exercices?.length||0;
 const done=seance.exercices?.filter((_,idx)=>checkedEx[`${seance.id}-${idx}`]).length||0;
 return(
 <div key={i} onClick={()=>setViewSeance(seance)} style={{padding:"10px 12px",background:isToday?`${int.c}14`:C.s2,border:`1px solid ${isToday?int.c:C.s3}`,borderRadius:9,marginBottom:6,cursor:"pointer"}}>
 <Row style={{justifyContent:"space-between"}}>
 <Row style={{gap:10}}>
 <div style={{width:36,height:36,borderRadius:"50%",background:isToday?`${int.c}30`:C.s3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:isToday?int.c:"rgba(242,244,247,0.50)",flexShrink:0}}>{day}</div>
 <div>
 <div style={{fontSize:12,fontWeight:500}}>{seance.nom}</div>
 <div style={{fontSize:10,color:"rgba(242,244,247,0.50)"}}>{seance.focus} · {total} exercices</div>
 </div>
 </Row>
 <Row style={{gap:8,alignItems:"center"}}>
 {done>0&&<div style={{fontSize:10,color:C.green,fontWeight:700}}>{done}/{total}</div>}
 {seance.complete&&<div style={{fontSize:12,color:C.green}}>✓</div>}
 <div style={{color:C.dim,fontSize:16}}>›</div>
 </Row>
 </Row>
 {done>0&&<Bar pct={done/total*100} color={int.c} h={3}/>}
 </div>
 );
 })}
 {!prog&&(
 <Box style={{textAlign:"center",padding:"20px 16px"}}>
 <div style={{fontSize:12,color:"rgba(242,244,247,0.50)",marginBottom:12}}>Aucun programme actif</div>
 <Btn onClick={()=>setProgView("creer")}>+ Créer un programme</Btn>
 </Box>
 )}
 </div>
 );
 }

