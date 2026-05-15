import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "../data/constants.js";
import { FOODS } from "../data/foods.js";
import { EX } from "../data/exercises.js";
import { MOTIVATIONS } from "../data/motivations.js";
import { Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart } from "../components/ui/index.jsx";

// ─── ONBOARDING ──────────────────────────────────────────────────────────────

 export default function Onboarding(props){
 const { profil, setProfil, setOnboardingDone, push, C, INT, EX, setProg, setCycleStart, setCycles, photos, setPhotos, readFile, loadIA, setLoadIA, loadMsg, setLoadMsg, corrigerFaibles, setCorrigerFaibles, cycles } = props;
 const [oStep, setOStep] = useState(0);
 const [oData, setOData] = useState({prenom:"",sexe:"",age:"",poids:"",taille:"",objectif:"hypertrophie",activite:"modere"});
 const steps=[
 {id:"identity", title:"Bienvenue 👋", sub:"Commençons par te connaître"},
 {id:"body", title:"Ton corps 📏", sub:"Pour calculer tes besoins exacts"},
 {id:"goal", title:"Ton objectif 🎯",sub:"Pour personnaliser ton programme"},
 {id:"activity", title:"Ton activité ⚡",sub:"Pour calculer ton TDEE précis"},
 ];
 const step=steps[oStep];
 return(
 <div style={{position:"fixed",inset:0,background:C.bg,zIndex:500,overflowY:"auto",display:"flex",flexDirection:"column"}}>
 <div style={{maxWidth:500,margin:"0 auto",padding:"40px 20px 100px",width:"100%",flex:1}}>
 {/* Progress */}
 <div style={{display:"flex",gap:6,marginBottom:32}}>
 {steps.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=oStep?"#3b82f6":"#dce8f4",transition:"background.3s"}}/>)}
 </div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:300,color:C.text,marginBottom:4}}>{step.title}</div>
 <div style={{fontSize:12,color:"#64748b",marginBottom:28}}>{step.sub}</div>

 {oStep===0&&<>
 <div style={{marginBottom:16}}>
 <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:500}}>Prénom (facultatif)</div>
 <input value={oData.prenom} onChange={e=>setOData({...oData,prenom:e.target.value})} placeholder="Ton prénom" style={{width:"100%",padding:"12px 14px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,fontSize:14,color:C.text,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
 </div>
 <div style={{marginBottom:16}}>
 <div style={{fontSize:11,color:"#64748b",marginBottom:8,fontWeight:500}}>Sexe <span style={{color:C.red}}>*</span></div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
 {[{id:"homme",l:"Homme",i:"♂️"},{id:"femme",l:"Femme",i:"♀️"}].map(s=>(
 <div key={s.id} onClick={()=>setOData({...oData,sexe:s.id})} style={{padding:"14px",textAlign:"center",borderRadius:12,border:`1.5px solid ${oData.sexe===s.id?"#3b82f6":"#dce8f4"}`,background:oData.sexe===s.id?"rgba(59,130,246,0.08)":"#fff",cursor:"pointer"}}>
 <div style={{fontSize:24,marginBottom:4}}>{s.i}</div>
 <div style={{fontSize:13,fontWeight:500,color:oData.sexe===s.id?"#3b82f6":C.text}}>{s.l}</div>
 </div>
 ))}
 </div>
 </div>
 <div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:500}}>Âge <span style={{color:C.red}}>*</span></div>
 <input type="number" value={oData.age} onChange={e=>setOData({...oData,age:e.target.value})} placeholder="Ex: 25" style={{width:"100%",padding:"12px 14px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,fontSize:14,color:C.text,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
 </div>
 </>}

 {oStep===1&&<>
 <div style={{marginBottom:16}}>
 <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:500}}>Poids (kg) <span style={{color:C.red}}>*</span></div>
 <input type="number" value={oData.poids} onChange={e=>setOData({...oData,poids:e.target.value})} placeholder="Ex: 80" style={{width:"100%",padding:"12px 14px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,fontSize:14,color:C.text,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
 </div>
 <div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:500}}>Taille (cm) <span style={{color:C.red}}>*</span></div>
 <input type="number" value={oData.taille} onChange={e=>setOData({...oData,taille:e.target.value})} placeholder="Ex: 178" style={{width:"100%",padding:"12px 14px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,fontSize:14,color:C.text,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
 </div>
 {oData.poids&&oData.taille&&(()=>{
 const imc=(parseFloat(oData.poids)/Math.pow(parseFloat(oData.taille)/100,2)).toFixed(1);
 return(
  <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
   <div style={{padding:"8px 12px",background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.12)",borderRadius:10,fontSize:11}}>
    <span style={{color:"#64748b"}}>IMC : </span><span style={{fontWeight:600,color:"#3b82f6"}}>{imc}</span>
    <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>ℹ️ L'IMC ne distingue pas muscle et graisse</div>
   </div>
   <div>
    <div style={{fontSize:11,color:"#64748b",marginBottom:5,fontWeight:500}}>% Masse grasse <span style={{color:"#94a3b8",fontWeight:400}}>(optionnel)</span></div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
     <input type="number" value={oData.bodyfat||""} onChange={e=>setOData({...oData,bodyfat:e.target.value})} placeholder="Ex: 18" style={{flex:1,padding:"10px 12px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,fontSize:14,color:"#0f1a2e",fontFamily:"'Inter',sans-serif"}}/>
     <span style={{fontSize:13,color:"#64748b",fontWeight:500}}>%</span>
    </div>
    {oData.bodyfat&&(()=>{
     const bf=parseFloat(oData.bodyfat);
     const cat=oData.sexe==="femme"?(bf<14?"Athlète ⚡":bf<21?"Forme ✅":bf<25?"Acceptable":bf<32?"À améliorer":"Obésité"):(bf<6?"Athlète ⚡":bf<14?"Forme ✅":bf<18?"Acceptable":bf<25?"À améliorer":"Obésité");
     const col=cat.includes("Athlète")||cat.includes("Forme")?"#22c55e":cat==="Acceptable"?"#f97316":"#ef4444";
     return <div style={{fontSize:11,color:col,fontWeight:600,marginTop:4}}>📊 {cat}</div>;
    })()}
   </div>
  </div>
 );
 })()}
 </>}

 {oStep===2&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
 {[
 {id:"hypertrophie",l:"Prise de muscle",i:"💪",d:"Prendre du volume"},
 {id:"force", l:"Force", i:"🏋️",d:"Performances"},
 {id:"poids", l:"Perte de poids", i:"🔥",d:"Sèche & tonicité"},
 {id:"sante", l:"Santé générale", i:"❤️",d:"Bien-être"},
 ].map(g=>(
 <div key={g.id} onClick={()=>setOData({...oData,objectif:g.id})} style={{padding:"14px 10px",textAlign:"center",borderRadius:12,border:`1.5px solid ${oData.objectif===g.id?"#3b82f6":"#dce8f4"}`,background:oData.objectif===g.id?"rgba(59,130,246,0.08)":"#fff",cursor:"pointer"}}>
 <div style={{fontSize:26,marginBottom:6}}>{g.i}</div>
 <div style={{fontSize:12,fontWeight:600,color:oData.objectif===g.id?"#3b82f6":C.text,marginBottom:2}}>{g.l}</div>
 <div style={{fontSize:10,color:"#64748b"}}>{g.d}</div>
 </div>
 ))}
 </div>}

 {oStep===3&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
 {[
 {id:"sedentaire",l:"Sédentaire", d:"Bureau / peu de sport", f:"×1.2"},
 {id:"leger", l:"Légèrement actif", d:"Sport 1-3×/semaine", f:"×1.375"},
 {id:"modere", l:"Modérément actif", d:"Sport 3-5×/semaine", f:"×1.55"},
 {id:"actif", l:"Très actif", d:"Sport 6-7×/semaine", f:"×1.725"},
 {id:"tres_actif",l:"Extrêmement actif",d:"Sport 2× par jour / travail physique",f:"×1.9"},
 ].map(a=>(
 <div key={a.id} onClick={()=>setOData({...oData,activite:a.id})} style={{padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:10,border:`1.5px solid ${oData.activite===a.id?"#3b82f6":"#dce8f4"}`,background:oData.activite===a.id?"rgba(59,130,246,0.08)":"#fff",cursor:"pointer"}}>
 <div>
 <div style={{fontSize:13,fontWeight:500,color:oData.activite===a.id?"#3b82f6":C.text}}>{a.l}</div>
 <div style={{fontSize:10,color:"#64748b",marginTop:1}}>{a.d}</div>
 </div>
 <div style={{fontSize:11,fontWeight:600,color:oData.activite===a.id?"#3b82f6":"#64748b",flexShrink:0,marginLeft:8}}>{a.f}</div>
 </div>
 ))}
 </div>}

 {/* Boutons navigation */}
 <div style={{marginTop:28}}>
 {oStep===steps.length-1?(
 <button onClick={()=>{
 setProfil({...profil,...oData,bodyfat:oData.bodyfat||""});
 setOnboardingDone(true);
 }} disabled={!oData.sexe||!oData.age||!oData.poids||!oData.taille}
 style={{width:"100%",padding:"14px",background:(!oData.sexe||!oData.age||!oData.poids||!oData.taille)?"#dce8f4":"#3b82f6",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:600,cursor:(!oData.sexe||!oData.age||!oData.poids||!oData.taille)?"default":"pointer",fontFamily:"'Inter',sans-serif",transition:"background.2s"}}>
 🚀 Lancer MorphoCoach
 </button>
 ):(
 <button onClick={()=>{
 const canNext=
 (oStep===0&&oData.sexe&&oData.age)||
 (oStep===1&&oData.poids&&oData.taille)||
 oStep>=2;
 if(canNext) setOStep(s=>s+1);
 }} style={{width:"100%",padding:"14px",background:"#3b82f6",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
 Continuer →
 </button>
 )}
 {oStep>0&&<button onClick={()=>setOStep(s=>s-1)} style={{width:"100%",padding:"10px",background:"transparent",border:"none",color:"#64748b",fontSize:12,cursor:"pointer",marginTop:8,fontFamily:"'Inter',sans-serif"}}>← Retour</button>}
 {oStep===0&&<button onClick={()=>setOnboardingDone(true)} style={{width:"100%",padding:"10px",background:"transparent",border:"none",color:"#64748b",fontSize:11,cursor:"pointer",marginTop:8,fontFamily:"'Inter',sans-serif",textDecoration:"underline",textDecorationStyle:"dotted"}}>Passer pour l'instant</button>}
 </div>
 </div>
 </div>
 );
 };
