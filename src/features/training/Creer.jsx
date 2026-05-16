import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "../../data/constants.js";
import { FOODS } from "../../data/foods.js";
import { EX } from "../../data/exercises.js";
import { MOTIVATIONS } from "../../data/motivations.js";
import { Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart } from "../../components/ui/index.jsx";

// ─── CREER ──────────────────────────────────────────────────────────────

 export default function Creer(props){
 const {
   prog, setProg, setCycleStart, push, setCalSess, C, INT, EX,
   createStep, setCS,
   newP, setNewP,
   jourActif, setJourActif,
   groupe, setGroupe,
   editExIdx, setEditExIdx,
   exModal, setExModal,
   exModalTab, setExModalTab,
   setProgView,
 } = props;
 if(createStep===0)return(
 <div style={{padding:"0 15px"}}>
 <Box>
 <Lbl>Nouveau programme</Lbl>
 <Inp placeholder="Nom du programme" value={newP.nom} onChange={e=>setNewP({...newP,nom:e.target.value})}/>
 <Lbl>Jours d'entraînement</Lbl>
 <div style={{display:"flex",flexWrap:"wrap",marginBottom:12}}>
 {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=>(
 <Tag key={j} active={newP.jours.includes(j)} onClick={()=>setNewP(p=>({...p,jours:p.jours.includes(j)?p.jours.filter(x=>x!==j):[...p.jours,j]}))}>{j}</Tag>
 ))}
 </div>
 <Btn disabled={!newP.nom||newP.jours.length===0} onClick={()=>{const s={};newP.jours.forEach(j=>s[j]={nom:"",intensite:"modere",exercices:[]});setNewP({...newP,seances:s});setJourActif(newP.jours[0]);setCS(1);}}>Construire les séances →</Btn>
 </Box>
 </div>
 );
 const jc=jourActif||newP.jours[0];
 const sean=newP.seances?.[jc]||{nom:"",intensite:"modere",exercices:[]};
 return(
 <div style={{padding:"0 15px"}}>
 <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:12,paddingBottom:2}}>
 {newP.jours.map(j=>(
 <button key={j} onClick={()=>setJourActif(j)} style={{padding:"6px 12px",background:jc===j?C.goldD:C.s2,border:`1px solid ${jc===j?C.gold:C.s3}`,borderRadius:16,color:jc===j?C.gold:"#64748b",cursor:"pointer",fontSize:11,whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif",fontWeight:600}}>
 {j} {newP.seances?.[j]?.exercices.length>0?`(${newP.seances[j].exercices.length})`:""}
 </button>
 ))}
 </div>
 <Box>
 <Inp placeholder={`Nom séance ${jc}`} value={sean.nom||""} onChange={e=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,nom:e.target.value}}}))}/>
 <Lbl>Intensité</Lbl>
 <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
 {Object.entries(INT).map(([k,v])=>(
 <div key={k} onClick={()=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,intensite:k}}}))} style={{padding:"5px 10px",background:sean.intensite===k?`${v.c}18`:C.s2,border:`1px solid ${sean.intensite===k?v.c:C.s3}`,borderRadius:7,cursor:"pointer",fontSize:11,color:sean.intensite===k?v.c:"#64748b",fontWeight:sean.intensite===k?700:400}}>{v.l}</div>
 ))}
 </div>
 {sean.exercices.map((ex,i)=>{
 const showEdit=!!editExIdx[i];
 const METHODS=["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif","Pré-fatigue","Wave loading"];
 return(
 <div key={i} style={{background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10,marginBottom:6,overflow:"hidden"}}>
  <div style={{padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
   <div onClick={()=>setEditExIdx(m=>{const n={...m};n[i]=!n[i];return n;})} style={{flex:1,cursor:"pointer"}}>
    <div style={{fontSize:12,fontWeight:600,color:"#0f1a2e"}}>{ex.nom}</div>
    <div style={{fontSize:10,color:"#64748b",marginTop:1}}>{ex.series}×{ex.reps} · repos {ex.repos}{ex.methode&&ex.methode!=='Classique'?` · ${ex.methode}`:''}</div>
   </div>
   <div style={{display:"flex",gap:5,alignItems:"center"}}>
    <button onClick={()=>setEditExIdx(m=>{const n={...m};n[i]=!n[i];return n;})} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer",fontSize:10,fontWeight:600}}>✏️</button>
    <button onClick={()=>setNewP(p=>{const u={...p};const ses={...u.seances};const s={...ses[jc]};s.exercices=s.exercices.filter((_,j)=>j!==i);ses[jc]=s;return{...u,seances:ses};})} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:15,padding:"2px 4px"}}>×</button>
   </div>
  </div>
  {showEdit&&(
   <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.03)",borderTop:"0.5px solid #dce8f4"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
     {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
      <div key={pp.k}>
       <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600,letterSpacing:"0.5px"}}>{pp.l}</div>
       <div style={{display:"flex",alignItems:"center",gap:3}}>
        <button onClick={()=>{const u=[...sean.exercices];const cur=parseFloat(u[i][pp.k])||0;u[i][pp.k]=String(pp.k==="repos"?Math.max(0,cur-15):Math.max(1,cur-1));setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} style={{width:24,height:24,borderRadius:6,background:"#f1f5f9",border:"none",color:"#64748b",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <input value={ex[pp.k]||""} onChange={e=>{const u=[...sean.exercices];u[i][pp.k]=e.target.value;setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} style={{flex:1,padding:"5px 6px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:6,color:"#0f1a2e",fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
        <button onClick={()=>{const u=[...sean.exercices];const cur=parseFloat(u[i][pp.k])||0;u[i][pp.k]=String(pp.k==="repos"?cur+15:cur+1);setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} style={{width:24,height:24,borderRadius:6,background:"#3b82f6",border:"none",color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
       </div>
      </div>
     ))}
    </div>
    <div style={{marginBottom:7}}>
     <div style={{fontSize:9,color:"#64748b",marginBottom:4,fontWeight:600,letterSpacing:"0.5px"}}>TEMPO (montée-contraction-descente)</div>
     <input value={ex.tempo||""} onChange={e=>{const u=[...sean.exercices];u[i].tempo=e.target.value;setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"8px 10px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:8,color:"#0f1a2e",fontSize:12,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
    </div>
    <div>
     <div style={{fontSize:9,color:"#64748b",marginBottom:5,fontWeight:600,letterSpacing:"0.5px"}}>MÉTHODE D'INTENSIFICATION</div>
     <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
      {METHODS.map(mm=>(
       <button key={mm} onClick={()=>{const u=[...sean.exercices];u[i].methode=mm;setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} style={{padding:"4px 10px",borderRadius:14,border:`1px solid ${ex.methode===mm?"#3b82f6":"#dce8f4"}`,background:ex.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:ex.methode===mm?"#3b82f6":"#64748b",cursor:"pointer",fontSize:10,fontWeight:ex.methode===mm?600:400,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
      ))}
     </div>
    </div>
   </div>
  )}
 </div>
 );
})}
 <Lbl style={{marginTop:10}}>Bibliothèque d'exercices</Lbl>
 <div style={{display:"flex",flexWrap:"wrap",marginBottom:10}}>
 {Object.keys(EX).map(g=>(
 <Tag key={g} active={groupe===g} onClick={()=>setGroupe(g===groupe?null:g)}>{g}</Tag>
 ))}
 </div>
 {groupe&&EX[groupe].map((ex,i)=>{
 const cc={principal:"#3b82f6",correctif:"#f87171",mobilite:"#06b6d4",gainage:"#22c55e",isolation:"#8b5cf6"}[ex.cat]||"#3b82f6";
 return(
 <div key={i} style={{background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
 <div style={{padding:"11px 13px"}}>
 <Row style={{justifyContent:"space-between",marginBottom:6}}>
 <div style={{flex:1}}>
 <div style={{display:"inline-block",padding:"2px 8px",background:`${cc}14`,borderRadius:5,fontSize:9,color:cc,fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:5}}>{ex.cat}</div>
 <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e",marginBottom:2}}>{ex.n}</div>
 <div style={{fontSize:10,color:"#64748b"}}>{ex.s}×{ex.r} · {ex.rest} · {ex.ch}</div>
 </div>
 </Row>
 <div style={{fontSize:11,color:"#64748b",fontStyle:"italic",lineHeight:1.5,marginBottom:8}}>{(ex.morpho||"").substring(0,90)}…</div>
 <Row style={{gap:7}}>
 <button onClick={()=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,exercices:[...sean.exercices,{nom:ex.n,cat:ex.cat,series:ex.s,reps:ex.r,repos:ex.rest,charge:ex.ch,prog:ex.prog||"",morpho_tip:ex.morpho,historique:[],note:""}]}}}))} style={{flex:1,padding:"7px 10px",background:"#3b82f6",border:"none",borderRadius:8,color:"#ffffff",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>+ Ajouter</button>
 <button onClick={e=>{e.stopPropagation();setExModal(ex);}} style={{padding:"7px 12px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,color:"#3b82f6",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>Guide ›</button>
 </Row>
 </div>
 </div>
 );
 })}
 {exModal&&(
 <div style={{position:"fixed",inset:0,background:"rgba(237,243,251,0.98)",zIndex:300,overflowY:"auto"}}>
 <div style={{maxWidth:500,margin:"0 auto",padding:"0 0 80px"}}>
 <div style={{padding:"20px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
 <div style={{flex:1}}>
 <div style={{display:"inline-block",padding:"3px 10px",background:"rgba(59,130,246,0.1)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,fontSize:10,color:"#3b82f6",letterSpacing:"1px",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>{exModal.cat}</div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:400,lineHeight:1.2,color:"#0f1a2e",marginBottom:4}}>{exModal.n}</div>
 <div style={{fontSize:11,color:"#64748b"}}>{exModal.s} séries · {exModal.r} reps · {exModal.rest}</div>
 </div>
 <button onClick={()=>setExModal(null)} style={{background:"#edf3fb",border:"0.5px solid #dce8f4",borderRadius:10,width:36,height:36,color:"#64748b",cursor:"pointer",fontSize:18,flexShrink:0,marginLeft:12}}>×</button>
 </div>
 <div style={{padding:"12px 16px",display:"flex",gap:7,flexWrap:"wrap"}}>
 {[{l:"Séries",v:exModal.s},{l:"Reps",v:exModal.r},{l:"Repos",v:exModal.rest},{l:"Charge",v:exModal.ch}].map(s=>(
 <div key={s.l} style={{padding:"8px 10px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10,textAlign:"center",flex:1,minWidth:60}}>
 <div style={{fontSize:14,fontWeight:400,color:"#3b82f6",fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
 <div style={{fontSize:9,color:"#64748b",marginTop:2}}>{s.l}</div>
 </div>
 ))}
 </div>
 <div style={{padding:"0 16px",display:"flex",gap:6,marginBottom:14}}>
 {[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}].map(t=>(
 <button key={t.id} onClick={()=>setExModalTab(t.id)} style={{padding:"6px 13px",background:exModalTab===t.id?"rgba(59,130,246,0.08)":"transparent",border:`0.5px solid ${exModalTab===t.id?"#3b82f6":"#dce8f4"}`,borderRadius:20,color:exModalTab===t.id?"#3b82f6":"#64748b",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>{t.l}</button>
 ))}
 </div>
 <div style={{padding:"0 16px"}}>
 {exModalTab==="tips"&&(
 <Box>
 <Lbl>Conseils techniques</Lbl>
 {(exModal.tips||[]).map((tip,i)=>(
 <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(exModal.tips.length-1)?"0.5px solid #dce8f4":"none"}}>
 <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(59,130,246,0.1)",border:"0.5px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#3b82f6"}}>{i+1}</div>
 <div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.6}}>{tip}</div>
 </div>
 ))}
 {exModal.prog&&<div style={{marginTop:4,padding:"10px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:9}}><div style={{fontSize:10,color:"#22c55e",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>Progression</div><div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{exModal.prog}</div></div>}
 </Box>
 )}
 {exModalTab==="variantes"&&(
 <div>
 {(exModal.variantes||[]).map((v,i)=>(
 <Box key={i}>
 <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e",marginBottom:5}}>{v.nom||v}</div>
 {v.note&&<div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{v.note}</div>}
 </Box>
 ))}
 </div>
 )}
 {exModalTab==="erreurs"&&(
 <Box>
 <Lbl>Erreurs à éviter</Lbl>
 {(exModal.erreurs||[]).map((e,i)=>(
 <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
 <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(248,113,113,0.1)",border:"0.5px solid rgba(248,113,113,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#f87171"}}>✕</div>
 <div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.5}}>{e}</div>
 </div>
 ))}
 </Box>
 )}
 {exModalTab==="morpho"&&(
 <Box>
 <Lbl>Adaptation morphologique</Lbl>
 {(exModal.morpho||"").split('\n').filter(Boolean).map((line,i)=>(
 <div key={i} style={{display:"flex",gap:8,marginBottom:10,paddingBottom:10,borderBottom:i<(exModal.morpho.split('\n').filter(Boolean).length-1)?"0.5px solid #dce8f4":"none",alignItems:"flex-start"}}>
 <div style={{fontSize:14,flexShrink:0,marginTop:1}}>{line.split(':')[0].trim()}</div>
 <div style={{fontSize:11.5,color:"#0f1a2e",lineHeight:1.6,flex:1}}>{line.split(':').slice(1).join(':').trim()}</div>
 </div>
 ))}
 </Box>
 )}
 </div>
 <div style={{padding:"12px 16px 0"}}>
 <Btn onClick={()=>{setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,exercices:[...sean.exercices,{nom:exModal.n,cat:exModal.cat,series:exModal.s,reps:exModal.r,repos:exModal.rest,charge:exModal.ch,prog:exModal.prog||"",morpho_tip:exModal.morpho,historique:[],note:""}]}}}));setExModal(null);}}>+ Ajouter cet exercice</Btn>
 <Btn v="ghost" onClick={()=>setExModal(null)}>← Retour</Btn>
 </div>
 </div>
 </div>
 )}
 </Box>
 <Btn onClick={()=>{
 const jours=newP.jours.map((j,i)=>({id:i+1,nom:newP.seances[j]?.nom||`Séance ${j}`,focus:j,duree:"45-60 min",intensite:newP.seances[j]?.intensite||"modere",exercices:(newP.seances[j]?.exercices||[]).map(ex=>({...ex,historique:[],note:""})),complete:false,date:null,note:""}));
 const newProg={titre:newP.nom,type:"custom",jours};
 setProg(newProg);setCycleStart(Date.now());
 const today=new Date();
 const joursMap={"Lun":1,"Mar":2,"Mer":3,"Jeu":4,"Ven":5,"Sam":6,"Dim":0};
 const newSess={};
 jours.forEach(jour=>{
 const match=Object.entries(joursMap).find(([k])=>jour.focus.startsWith(k));
 if(match){
 for(let w=0;w<6;w++){
 const dateObj2=new Date(today);
 dateObj2.setDate(dateObj2.getDate()+((match[1]-dateObj2.getDay()+7)%7||7)+w*7);
 const key=`${dateObj2.getFullYear()}-${String(dateObj2.getMonth()+1).padStart(2,"0")}-${String(dateObj2.getDate()).padStart(2,"0")}`;
 newSess[key]={nom:jour.nom,intensite:jour.intensite||"modere",color:INT[jour.intensite||"modere"].c};
 }
 }
 });
 setCalSess(prev=>({...prev,...newSess}));
 setProgView("calendar");setCS(0);
 push("✅","Programme créé !",`${newP.nom} · Calendrier mis à jour !`);
 }}>✓ Enregistrer le programme</Btn>
 <Btn v="ghost" onClick={()=>setCS(0)}>← Retour</Btn>
 </div>
 );
 }

