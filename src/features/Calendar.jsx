import {{ useState, useRef, useEffect, useCallback, useMemo }} from "react";
import {{ C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS }} from "../data/constants.js";
import {{ FOODS }} from "../data/foods.js";
import {{ EX }} from "../data/exercises.js";
import {{ MOTIVATIONS }} from "../data/motivations.js";
import {{ Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart }} from "../components/ui/index.jsx";

// ─── CALENDAR ──────────────────────────────────────────────────────────────

 export default function Calendar(props){
 const { prog, setProg, cycleStart, setTab, premium, setPaywall, push, calSess, setCalSess, checkedEx, jR, semC, C, INT } = props;
 return(
 <div style={{padding:"0 15px"}}>
 <Box>
 <Lbl>Calendrier mensuel</Lbl>
 <MonthCal sessions={calSess} onUpdate={(date,sess)=>{
 if(sess)setCalSess(s=>({...s,[date]:sess}));
 else setCalSess(s=>{const ns={...s};delete ns[date];return ns;});
 }}/>
 </Box>
 {/* Séance bonus */}
 <Lbl>Séance bonus</Lbl>
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
 push("✅",`${bonusModal.l} ajouté !`,`${dur} enregistré dans le calendrier.`);
 }} style={{padding:"10px 16px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:C.text}}>{dur}</div>
 ))}
 </div>
 <Btn v="ghost" onClick={()=>setBonusModal(null)}>Annuler</Btn>
 </div>
 </div>
 )}
 {cycleStart&&prog&&(
 <Box style={{background:"rgba(59,130,246,0.06)",borderColor:C.goldB}}>
 <Row style={{justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
 <div>
 <Lbl style={{marginBottom:4}}>Cycle {prog.numero||1} · {prog.duree_semaines||6} semaines</Lbl>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:500}}>{prog.titre}</div>
 {prog.methode&&<div style={{fontSize:10,color:"#3b82f6",marginTop:2,fontWeight:500}}>⚡ {prog.methode}</div>}
 {prog.dateDebut&&<div style={{fontSize:10,color:"#64748b",marginTop:2}}>Démarré le {prog.dateDebut}</div>}
 </div>
 {jR!==null&&jR<=7&&(
 <div style={{padding:"5px 10px",background:"rgba(224,136,58,0.15)",border:"1px solid rgba(224,136,58,0.3)",borderRadius:8,fontSize:10,color:"#f97316",fontWeight:500,flexShrink:0}}>J-{jR}</div>
 )}
 </Row>
 {/* ─── Analyse physique IA ─── */}
 {prog.analyse&&(prog.analyse.points_forts?.length>0||prog.analyse.points_faibles?.length>0)&&(
 <div style={{marginBottom:12,padding:"10px 12px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10}}>
 <div style={{fontSize:9,color:"#3b82f6",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>🔬 Analyse morphologique</div>
 {prog.analyse.morphotype&&<div style={{fontSize:11,color:"#64748b",marginBottom:6,fontStyle:"italic"}}>Morphotype : <span style={{color:C.text,fontWeight:500}}>{prog.analyse.morphotype}</span> · Humérus : {prog.analyse.humerus||"?"} · Fémurs : {prog.analyse.femurs||"?"}</div>}
 {prog.analyse.posture&&<div style={{fontSize:10,color:"#64748b",marginBottom:8,padding:"6px 8px",background:"rgba(249,115,22,0.06)",borderRadius:6}}>📐 Posture : {prog.analyse.posture}</div>}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
 {prog.analyse.points_forts?.length>0&&(
 <div>
 <div style={{fontSize:9,color:C.green,fontWeight:600,letterSpacing:"0.5px",marginBottom:4}}>✅ POINTS FORTS</div>
 {prog.analyse.points_forts.map((p,i)=><div key={i} style={{fontSize:10,color:C.text,padding:"2px 0"}}>{p}</div>)}
 </div>
 )}
 {prog.analyse.points_faibles?.length>0&&(
 <div>
 <div style={{fontSize:9,color:C.red,fontWeight:600,letterSpacing:"0.5px",marginBottom:4}}>🎯 À DÉVELOPPER</div>
 {prog.analyse.points_faibles.map((p,i)=><div key={i} style={{fontSize:10,color:C.text,padding:"2px 0"}}>{p}</div>)}
 </div>
 )}
 </div>
 {prog.analyse.recommandation_principale&&(
 <div style={{marginTop:8,padding:"6px 8px",background:"rgba(59,130,246,0.06)",borderRadius:6,fontSize:10,color:"#3b82f6",lineHeight:1.5}}>💡 {prog.analyse.recommandation_principale}</div>
 )}
 </div>
 )}
 {/* ─── Correction points faibles ─── */}
 {prog.correction?.groupes_prioritaires?.length>0&&(
 <div style={{marginBottom:12,padding:"8px 12px",background:"rgba(249,115,22,0.06)",border:"0.5px solid rgba(249,115,22,0.2)",borderRadius:8}}>
 <div style={{fontSize:9,color:"#f97316",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>🔧 Correction prioritaire</div>
 <div style={{fontSize:10,color:C.text}}>{prog.correction.groupes_prioritaires.join(" · ")}</div>
 {prog.correction.frequence_supplementaire&&<div style={{fontSize:10,color:"#64748b",marginTop:3}}>{prog.correction.frequence_supplementaire}</div>}
 </div>
 )}
 {jR===0&&(
 <div style={{padding:"12px 14px",background:"rgba(62,199,122,0.1)",border:"1px solid rgba(62,199,122,0.3)",borderRadius:10,marginBottom:12}}>
 <div style={{fontSize:13,fontWeight:500,color:C.green,marginBottom:4}}>🏆 Cycle terminé !</div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:10,lineHeight:1.5}}>Démarrez un nouveau cycle pour continuer votre progression.</div>
 <Btn sm onClick={()=>{if(!premium)setPaywall(true);else{setProgView("analyse");setTab("program");}}} >Nouveau cycle personnalisé →</Btn>
 </div>
 )}
 <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,marginBottom:12}}>
 {["modere","modere","lourd","lourd","intense","leger"].map((k,w)=>{
 const int=INT[k];
 return(
 <div key={w} style={{padding:"7px 4px",background:w===semC?`${int.c}20`:w<semC?"rgba(34,197,94,0.1)":C.s2,border:`1px solid ${w===semC?int.c:w<semC?"rgba(56,199,117,.2)":C.s3}`,borderRadius:7,textAlign:"center"}}>
 <div style={{fontSize:9,color:w===semC?int.c:w<semC?C.green:C.dim,fontWeight:700}}>S{w+1}</div>
 <div style={{width:4,height:4,borderRadius:"50%",background:int.c,margin:"4px auto 0"}}/>
 </div>
 );
 })}
 </div>
 {(()=>{
 const [viewJour,setViewJour]=useState(null);
 if(viewJour!==null){
   const jour=prog.jours[viewJour];
   const int=INT[jour.intensite||"modere"];
   return(
   <div style={{padding:"0 0 10px"}}>
    <button onClick={()=>setViewJour(null)} style={{background:"transparent",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px 15px 12px",display:"flex",alignItems:"center",gap:5}}>← Retour</button>
    <div style={{padding:"0 15px"}}>
     <div style={{padding:"12px 14px",background:`${int.c}14`,border:`0.5px solid ${int.c}40`,borderRadius:12,marginBottom:12}}>
      <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:400,marginBottom:2}}>{jour.nom}</div>
      <div style={{fontSize:11,color:"#64748b"}}>{jour.focus} · {jour.duree} · {jour.exercices?.length||0} exercices</div>
     </div>
     {(jour.exercices||[]).map((ex,k)=>{
      const cc={principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6",correctiv:"#ef4444"}[ex.cat||"principal"]||"#3b82f6";
      const [editing,setEditing]=useState(false);
      const METHODS=["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif"];
      return(
      <div key={k} style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,marginBottom:7,overflow:"hidden"}}>
       <div style={{padding:"10px 13px",borderLeft:`3px solid ${cc}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
         <div>
          <div style={{fontSize:12,fontWeight:600,color:"#0f1a2e",marginBottom:3}}>{ex.nom}</div>
          <div style={{fontSize:10,color:"#64748b"}}>{ex.series}×{ex.reps} · {ex.repos} · {ex.charge}{ex.tempo?` · ${ex.tempo}`:""}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
         </div>
         <button onClick={()=>setEditing(e=>!e)} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer",fontSize:10,flexShrink:0,marginLeft:8}}>✏️ Modifier</button>
        </div>
        {editing&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid #dce8f4"}}>
         <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:7}}>
          {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
           <div key={pp.k}>
            <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>{pp.l}</div>
            <div style={{display:"flex",gap:3,alignItems:"center"}}>
             <button onClick={()=>{const u=JSON.parse(JSON.stringify(prog));const cur=parseFloat(u.jours[viewJour].exercices[k][pp.k])||0;u.jours[viewJour].exercices[k][pp.k]=String(pp.k==="repos"?Math.max(0,cur-15):Math.max(1,cur-1));setProg(u);}} style={{width:22,height:22,borderRadius:5,background:"#f1f5f9",border:"none",cursor:"pointer",fontSize:12}}>−</button>
             <input value={ex[pp.k]||""} onChange={e=>{const u=JSON.parse(JSON.stringify(prog));u.jours[viewJour].exercices[k][pp.k]=e.target.value;setProg(u);}} style={{flex:1,padding:"4px 5px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:6,fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
             <button onClick={()=>{const u=JSON.parse(JSON.stringify(prog));const cur=parseFloat(u.jours[viewJour].exercices[k][pp.k])||0;u.jours[viewJour].exercices[k][pp.k]=String(pp.k==="repos"?cur+15:cur+1);setProg(u);}} style={{width:22,height:22,borderRadius:5,background:"#3b82f6",border:"none",color:"#fff",cursor:"pointer",fontSize:12}}>+</button>
            </div>
           </div>
          ))}
         </div>
         <div style={{marginBottom:6}}>
          <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>TEMPO</div>
          <input value={ex.tempo||""} onChange={e=>{const u=JSON.parse(JSON.stringify(prog));u.jours[viewJour].exercices[k].tempo=e.target.value;setProg(u);}} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"7px 10px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:8,fontSize:11,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
         </div>
         <div>
          <div style={{fontSize:9,color:"#64748b",marginBottom:4,fontWeight:600}}>MÉTHODE</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
           {METHODS.map(mm=>(
            <button key={mm} onClick={()=>{const u=JSON.parse(JSON.stringify(prog));u.jours[viewJour].exercices[k].methode=mm;setProg(u);}} style={{padding:"3px 8px",borderRadius:12,border:`1px solid ${ex.methode===mm?"#3b82f6":"#dce8f4"}`,background:ex.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:ex.methode===mm?"#3b82f6":"#64748b",cursor:"pointer",fontSize:9,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
           ))}
          </div>
         </div>
        </div>
        )}
       </div>
      </div>
      );
     })}
    </div>
   </div>
   );
 }
 return(
 <>{prog.jours.map((j,i)=>{
 const int=INT[j.intensite||"modere"];
 const total=j.exercices?.length||0;
 const done=j.exercices?.filter((_,idx)=>checkedEx[`${j.id}-${idx}`]).length||0;
 return(
 <Row key={i} onClick={()=>setViewJour(i)} style={{padding:"10px 12px",background:C.s2,borderRadius:9,marginBottom:5,cursor:"pointer",border:"0.5px solid #dce8f4"}}>
 <div style={{width:3,height:36,borderRadius:1.5,background:int.c,marginRight:10,flexShrink:0}}/>
 <div style={{flex:1}}>
 <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:2}}>{int.l}</div>
 <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e"}}>{j.nom}</div>
 <div style={{fontSize:10,color:"#64748b"}}>{j.focus} · {total} exercices</div>
 </div>
 <Row style={{gap:8,alignItems:"center"}}>
 {done>0&&<div style={{fontSize:10,color:C.green,fontWeight:700}}>{done}/{total}</div>}
 {j.complete&&<div style={{fontSize:10,color:C.green}}>✓</div>}
 <div style={{color:"#94a3b8",fontSize:16}}>›</div>
 </Row>
 </Row>
 );
 })}</>
 );
 })()}
 </Box>
 )}
 {!prog&&(
 <Box style={{textAlign:"center",padding:"24px 20px"}}>
 <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>Créez un programme pour planifier vos séances.</div>
 <Btn onClick={()=>{setTab("program");setProgView("creer");}}>Créer un programme</Btn>
 <Btn v="out" onClick={()=>{if(!premium)setPaywall(true);else{setTab("program");setProgView("analyse");}}}>Programme personnalisé ◈</Btn>
 </Box>
 )}
 </div>
 );
 }
}