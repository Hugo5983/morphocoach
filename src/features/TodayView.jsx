import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "../data/constants.js";
import { FOODS } from "../data/foods.js";
import { EX } from "../data/exercises.js";
import { MOTIVATIONS } from "../data/motivations.js";
import { Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart } from "../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";

// ─── TODAYVIEW ──────────────────────────────────────────────────────────────

 export default function TodayView(props){
 const { prog, setProg, premium, setPaywall, push, setCalSess, checkedEx, setCheckedEx, seance, C, INT, setProgView, setChrono, setChronoSec, exDetails, setExDetails, exEdit, setExEdit } = props;
 const [bonusModal, setBonusModal] = useState(null);
 const [viewSeance,setViewSeance]=useState(null);

 const getTodaySeance = () => {
   if(!prog) return null;
   const today=new Date();
   const dayNames=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
   const todayName=dayNames[today.getDay()];
   return prog.jours.find(j=>
     j.nom.toLowerCase().includes(todayName.toLowerCase())||
     j.focus?.toLowerCase().includes(todayName.toLowerCase())
   )||null;
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

 const todaySeance=getTodaySeance();
 if(viewSeance) return <SeanceDetail seance={viewSeance} onBack={()=>setViewSeance(null)} prog={prog} setProg={setProg} checkedEx={checkedEx} toggleCheck={toggleCheck} exDetails={exDetails} setExDetails={setExDetails} exEdit={exEdit} setExEdit={setExEdit} setChrono={setChrono} push={push} />;
 return(
 <div style={{padding:"0 15px"}}>
 {todaySeance?(
 <div>
 <Lbl>Séance du jour</Lbl>
 <Box style={{borderLeft:`3px solid ${INT[todaySeance.intensite||"modere"].c}`,padding:0,overflow:"hidden"}}>
   {/* Header cliquable → SeanceDetail */}
   <div onClick={()=>setViewSeance(todaySeance)} style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div>
     <div style={{fontSize:9,color:INT[todaySeance.intensite||"modere"].c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{INT[todaySeance.intensite||"modere"].l}</div>
     <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:400,color:"#0f1a2e"}}>{todaySeance.nom}</div>
     <div style={{fontSize:11,color:"#64748b"}}>{todaySeance.focus} · {todaySeance.duree}</div>
    </div>
    <div style={{textAlign:"right"}}>
     {(()=>{
       const total=todaySeance.exercices?.length||0;
       const done=todaySeance.exercices?.filter((_,idx)=>checkedEx[`${todaySeance.id}-${idx}`]).length||0;
       const pct=total>0?Math.round(done/total*100):0;
       return <>
         <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:300,color:pct===100?C.green:"#3b82f6",lineHeight:1}}>{pct}%</div>
         <div style={{fontSize:9,color:"#64748b"}}>{done}/{total}</div>
       </>;
     })()}
    </div>
   </div>
   {/* Liste exercices aperçu */}
   {!todaySeance.complete&&(
    <div style={{borderTop:"0.5px solid #dce8f4",padding:"8px 14px 10px"}}>
     {(todaySeance.exercices||[]).map((ex,idx)=>{
      const isChecked=!!checkedEx[`${todaySeance.id}-${idx}`];
      const cc={principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6"}[ex.cat||"principal"]||"#3b82f6";
      return(
      <div key={idx} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:idx<(todaySeance.exercices.length-1)?"0.5px solid #f1f5f9":"none",opacity:isChecked?0.5:1}}>
       <div onClick={()=>toggleCheck(todaySeance.id,idx,ex.repos)} style={{width:16,height:16,borderRadius:4,background:isChecked?C.green:"transparent",border:`1.5px solid ${isChecked?C.green:"#dce8f4"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,color:"#fff"}}>{isChecked?"✓":""}</div>
       <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:500,color:isChecked?"#94a3b8":"#0f1a2e",textDecoration:isChecked?"line-through":"none"}}>{ex.nom}</div>
        <div style={{fontSize:9,color:"#64748b"}}>{ex.series}×{ex.reps} · {ex.repos}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
       </div>
       <div style={{width:3,height:20,borderRadius:2,background:cc,flexShrink:0}}/>
      </div>
      );
     })}
     <button onClick={()=>setViewSeance(todaySeance)} style={{width:"100%",marginTop:8,padding:"8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:8,color:"#3b82f6",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>
      Démarrer la séance →
     </button>
    </div>
   )}
   {todaySeance.complete&&<div style={{padding:"8px 14px 10px",fontSize:11,color:C.green,fontWeight:600}}>✓ Complétée le {todaySeance.date}</div>}
 </Box>
 </div>
 ):(
 <Box style={{textAlign:"center",padding:"24px 16px"}}>
 <div style={{fontSize:32,marginBottom:8}}>😴</div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:500,marginBottom:4}}>Jour de repos</div>
 <div style={{fontSize:12,color:"#64748b",marginBottom:14,lineHeight:1.6}}>Profites-en pour récupérer ou ajouter une séance bonus.</div>
 </Box>
 )}
 <Lbl style={{marginTop:12}}>Séance bonus</Lbl>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
 {[{id:"etirements",i:"🧘",l:"Étirements",color:C.purple},{id:"cardio",i:"🏃",l:"Cardio",color:C.blue},{id:"mobilite",i:"💆",l:"Mobilité",color:C.green}].map(b=>(
 <div key={b.id} onClick={()=>setBonusModal(b)} style={{padding:"12px 8px",textAlign:"center",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:10,cursor:"pointer"}}>
 <div style={{fontSize:22,marginBottom:4}}>{b.i}</div>
 <div style={{fontSize:11,fontWeight:700,color:b.color}}>{b.l}</div>
 </div>
 ))}
 </div>
 {bonusModal&&(
 <div style={{position:"fixed",inset:0,background:"rgba(237,243,251,0.97)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:18}}>
 <div style={{background:C.s1,border:"0.5px solid #dce8f4",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:360}}>
 <Lbl>{bonusModal.i} {bonusModal.l}</Lbl>
 <div style={{fontSize:12,color:"#64748b",marginBottom:14}}>Durée de la séance ?</div>
 <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
 {["15 min","20 min","30 min","45 min"].map(dur=>(
 <div key={dur} onClick={()=>{
 const today=new Date();
 const key=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
 setCalSess(s=>({...s,[key]:{nom:`${bonusModal.l} ${dur}`,intensite:"mobilite",color:bonusModal.color}}));
 setBonusModal(null);
 push("✅",`${bonusModal.l} ajouté !`,`${dur} de ${bonusModal.l.toLowerCase()} enregistré.`);
 }} style={{padding:"10px 16px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:C.text}}>{dur}</div>
 ))}
 </div>
 <Btn v="ghost" onClick={()=>setBonusModal(null)}>Annuler</Btn>
 </div>
 </div>
 )}
 {!prog&&(
 <Box style={{textAlign:"center",padding:"20px 16px",marginTop:8}}>
 <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Aucun programme actif</div>
 <Btn onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>✨ Générer mon programme</Btn>
 <Btn v="out" onClick={()=>setProgView("creer")}>Créer manuellement</Btn>
 </Box>
 )}
 </div>
 );
 }

