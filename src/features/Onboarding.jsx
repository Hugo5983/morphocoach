import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "../data/constants.js";
import { FOODS } from "../data/foods.js";
import { EX } from "../data/exercises.js";
import { MOTIVATIONS } from "../data/motivations.js";
import { Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart } from "../components/ui/index.jsx";

// ─── ONBOARDING ──────────────────────────────────────────────────────────────

 export default function Onboarding(props){
 const { profil, setProfil, setOnboardingDone, push, C } = props;
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
 // progView merged into progView
 const [prog,setProg]=useStorage("prog",null);
 const [cycles,setCycles]=useStorage("cycles",[]); // historique des cycles précédents
 // ─── Streak ───
 const getStreak=useMemo(()=>{
 if(!prog) return 0;
 const dates=prog.jours.filter(j=>j.complete&&j.date).map(j=>j.date).sort((a,b)=>new Date(b.split('/').reverse().join('-'))-new Date(a.split('/').reverse().join('-')));
 if(!dates.length) return 0;
 let streak=0;
 const today=new Date();
 dates.forEach((d,i)=>{
 const dt=new Date(d.split('/').reverse().join('-'));
 const diff=Math.floor((today-dt)/(1000*60*60*24));
 if(diff===i) streak++;
 });
 return streak;
 },[prog]);
 const [cycleStart,setCycleStart]=useStorage("cycleStart",null);
 const [seance,setSeance]=useState(null); // index
 const [exDetails,setExDetails]=useState({}); // {j: bool}
 const [exEdit,setExEdit]=useState({}); // {j: bool}
 const openSeance=useCallback((i)=>{setSeance(i);setExDetails({});setExEdit({});},[]);
 const [createStep,setCS]=useState(0);
 const [newP,setNewP]=useState({nom:"",jours:[],seances:{}});
 const [jourActif,setJourActif]=useState(null);
 const [groupe,setGroupe]=useState(null);
  const [editExIdx,setEditExIdx]=useState({});
 const [exModal,setExModal]=useState(null);
 const [exModalTab,setExModalTab]=useState("tips");
 const [photos,setPhotos]=useState({face:null,dos:null,profil:null});
 const fileRefFace=useRef();
 const fileRefDos=useRef();
 const fileRefProfil=useRef();
 const readFile=useCallback((key,file)=>{if(!file)return;const r=new FileReader();r.onload=()=>setPhotos(p=>({...p,[key]:r.result}));r.readAsDataURL(file);},[]);
 const [form,setForm]=useState({prenom:"",age:"",poids:"",taille:"",sexe:"",metier:"",niveau:"",jours:[],objectif:"",objectifPrecis:"",materiel:[],pathologies:[],sport:""});
 const [loadIA,setLoadIA]=useState(false);
 const [loadMsg,setLoadMsg]=useState("");
 const [aStep,setAStep]=useState(0);
 const [calSess,setCalSess]=useStorage("calSess",{});
 const [nView,setNView]=useState("journal");
 const [repas,setRepas]=useStorage("repas",{matin:[],midi:[],soir:[],snack:[]});
 const [repasA,setRepasA]=useState("matin");
 const [search,setSearch]=useState("");
 const [myFoods,setMyFoods]=useStorage("myFoods",[]);
  const [repasPerso,setRepasPerso]=useStorage("repasPerso",[]);
 const [newFood,setNewFood]=useState({nom:"",cal:"",p:"",g:"",l:""});
 const [eau,setEau]=useStorage("eau",0);
 const [scanCode,setScan]=useState("");
 const [scanRes,setScanRes]=useState(null);
 const imc=useMemo(()=>profil.poids&&profil.taille?(profil.poids/((profil.taille/100)**2)).toFixed(1):null,[profil.poids,profil.taille]);
 const obj=useMemo(()=>OBJ[profil.objectif]||OBJ.sante,[profil.objectif]);

 // ─── Calcul TDEE complet (Harris-Benedict révisé 1984) ───
 const calObj=useMemo(()=>{
 const p=parseFloat(profil.poids)||0;
 const t=parseFloat(profil.taille)||0;
 const a=parseFloat(profil.age)||0;
 if(!p||!t||!a)return 2000;
 const mb=profil.sexe==="femme"
 ?447.593+9.247*p+3.098*t-4.330*a
 :88.362+13.397*p+4.799*t-5.677*a;
 const factAct=ACTIVITE_FACTOR[profil.activite]||1.375;
 const tdee=Math.round(mb*factAct);
 const adj=obj.surplus||0;
 const cycleNum=cycles.length+1;
 let cycleAdj=0;
 if(profil.objectif==="hypertrophie") cycleAdj=Math.min((cycleNum-1)*50,200);
 else if(profil.objectif==="poids") cycleAdj=cycleNum%4<2?0:50;
 return Math.max(1200,tdee+adj+cycleAdj);
 },[profil,obj,cycles]);
 // Macros en grammes
 const {pObj,lObj,gObj}=useMemo(()=>{
 const p_kg=parseFloat(profil.poids)||70;
 const pObj=Math.round(p_kg*(obj.p||2.0));
 const lObj=Math.round(p_kg*(obj.li||1.0));
 const gObj=Math.max(50,Math.round((calObj-pObj*4-lObj*9)/4));
 return{pObj,lObj,gObj};
 },[profil.poids,obj,calObj]);
 const totR=useMemo(()=>[...repas.matin,...repas.midi,...repas.soir,...repas.snack].reduce((a,i)=>({cal:a.cal+i.c,p:a.p+i.p,g:a.g+i.g,l:a.l+i.l}),{cal:0,p:0,g:0,l:0}),[repas]);
 const {jR,cPct,semC}=useMemo(()=>{
 if(!cycleStart)return{jR:null,cPct:0,semC:0};
 const jR=Math.max(0,42-Math.floor((Date.now()-cycleStart)/864e5));
 const cPct=Math.min(100,((42-jR)/42)*100);
 const semC=Math.min(5,Math.floor((42-jR)/7));
 return{jR,cPct,semC};
 },[cycleStart]);
 const push=useCallback((icon,title,body)=>{setNotif({icon,title,body});setTimeout(()=>setNotif(null),4500);},[]);
 useEffect(()=>{
 const t1=setTimeout(()=>push("🏋️","Séance du jour","Votre programme vous attend !"),7000);
 const t2=setTimeout(()=>push("💧","Hydratation","Pensez à boire de l'eau !"),22000);
 return()=>{clearTimeout(t1);clearTimeout(t2);};
 },[]);

 // ─── Reset eau chaque nouveau jour ───────────────────────────────────────
 useEffect(()=>{
 const today=new Date().toDateString();
 const lastDay=localStorage.getItem("mc_eauDate");
 if(lastDay!==today){setEau(0);localStorage.setItem("mc_eauDate",today);}
 // eslint-disable-next-line
 },[]);

 const handleScan=useCallback(async code=>{
 if(code.length<8)return;
 try{
 const r=await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
 const scanData=await r.json();
 if(scanData.status===1){const n=scanData.product.nutriments||{};setScanRes({n:scanData.product.product_name_fr||"Produit",c:Math.round(n["energy-kcal_100g"]||0),p:Math.round(n.proteins_100g||0),g:Math.round(n.carbohydrates_100g||0),l:Math.round(n.fat_100g||0),cat:"Scanné"});}
 else setScanRes({error:true});
 }catch{setScanRes({error:true});}
 },[]);
 // ─── État supplémentaire pour corriger les points faibles ───
 const [corrigerFaibles,setCorrigerFaibles]=useState(true);

 const buildP=()=>{
 const prec=cycles.length>0?cycles[cycles.length-1]:null;
 const histCtx=prec
 ?`CYCLE PRÉCÉDENT: ${prec.titre}. Charges maximales: ${prec.chargesResume||"aucune"}. Le nouveau programme doit PROGRESSER en charge, volume ou méthode.`
 :"PREMIER CYCLE de l'utilisateur.";
 const cycleNum=cycles.length+1;
 const imc=form.poids&&form.taille?(parseFloat(form.poids)/Math.pow(parseFloat(form.taille)/100,2)).toFixed(1):"?";
 const nbPhotos=[photos.face,photos.dos,photos.profil].filter(Boolean).length;

 const methodesByLevel={
 debutant:"Séries classiques 3×8-12, tempo contrôlé (2s montée, 2s contraction, 3s descente ), exercice unique par muscle, progression linéaire +2.5kg toutes les 2 semaines",
 intermediaire:"Pyramidal (12-10-8-6 avec charges croissantes), super-sets agoniste/antagoniste, tempo excentrique 4s , drop-sets en fin de séance",
 avance:"5×5 force, méthode bulgare (80-85-90-95% RM), pré-fatigue isolation+composé, rest-pause, séries de 100 légères pour le pump, dégressif (3 charges en 1 série), wave loading"
 };

 const pathosAdapt=form.pathologies.filter(p=>p!=="Aucune");
 const pathoRules=pathosAdapt.length>0?`
ADAPTATIONS PATHOLOGIQUES OBLIGATOIRES (basées sur les bonnes pratiques):
${form.pathologies.includes("Lombalgie")||form.pathologies.includes("Hernie discale")?
"- Lordose/Hernie: INTERDIRE soulevé de terre classique, good morning lourd, hyperextension. AUTORISER: soulevé de terre roumain léger, presse jambes, gainage transverse PRIORITAIRE avant tout travail de dos. Gainage 10 min en début de chaque séance."
:""}
${form.pathologies.includes("Scoliose")?
"- Scoliose: exercices UNILATÉRAUX prioritaires pour corriger asymétries. Rowing unilatéral, curl unilatéral. Éviter barre olympique pour charges lourdes."
:""}
${form.pathologies.includes("Conflit épaule")||form.pathologies.includes("Coiffe rotateurs")?
"- Conflit/Coiffe: INTERDIRE développé barre, élévations frontales, tirage nuque. AUTORISER: face pull OBLIGATOIRE, développé haltères 45° max, rotation externe en priorité absolue."
:""}
${form.pathologies.includes("Cervicalgie")?
"- Cervicalgie: INTERDIRE shrugs lourds, tirage nuque. Tractions avec retraction scapulaire uniquement."
:""}
${form.pathologies.includes("Ménisque")||form.pathologies.includes("LCA")||form.pathologies.includes("Tendinite")?
"- Genou fragile: INTERDIRE squat profond, fentes avec impact. AUTORISER: presse jambes amplitude réduite (60°), leg extension léger, vélo."
:""}
${form.pathologies.includes("Épicondylite")?
"- Épicondylite: INTERDIRE curl barre droite, rowing barre. AUTORISER: curl haltères prise neutre, tirage câble prise neutre."
:""}
`:"\nAucune pathologie particulière.";

 return `Tu es un coach sportif expert en musculation et biomécanique. ${histCtx}

PROFIL: ${form.prenom||"User"}, ${form.age}ans, ${form.sexe}, ${form.poids}kg/${form.taille}cm, IMC:${imc}
Niveau:${form.niveau} | Objectif:${form.objectif} | Jours:${(form.jours||[]).join("/")||"3j"} | Matériel:${(form.materiel||[]).join(",")||"salle"} | Pathologies:${pathosAdapt.join(",")||"aucune"} | Cycle:${cycleNum} | Photos:${nbPhotos} | Corriger faibles:${corrigerFaibles?"OUI":"NON"}

RÈGLES DELAVIER (selon photos):
- Humérus longs→haltères UNIQUEMENT au développé/épaules | Fémurs longs→presse PAS squat | Cage plate→pull-over OBLIGATOIRE | Antépulsion→face pull chaque séance
- Débutant:3s×8-12,10s/séance,corps entier | Intermédiaire:4s,split H/B,pyramidal,supersets | Avancé:5s,split complet,drop-set,5×5,rest-pause
- Cycle${cycleNum}:${cycleNum===1?"méthodes de base":cycleNum===2?"pyramidal+supersets":"drop-sets+rest-pause+avancé"}
${pathosAdapt.length>0?`PATHOLOGIES:${form.pathologies.includes("Lombalgie")||form.pathologies.includes("Hernie discale")?"INTERDIT:soulevé terre,good morning,hyperextension lourde|OBLIGATOIRE:gainage transverse":""}${form.pathologies.includes("Conflit épaule")||form.pathologies.includes("Coiffe rotateurs")?"INTERDIT:développé barre,tirage nuque|OBLIGATOIRE:face pull,rotation externe":""}${form.pathologies.includes("Ménisque")||form.pathologies.includes("LCA")?"INTERDIT:squat profond,fentes impact|OK:presse 60°,leg extension léger":""}${form.pathologies.includes("Scoliose")?"Exercices unilatéraux PRIORITAIRES":""}${form.pathologies.includes("Épicondylite")?"INTERDIT:curl barre droite,rowing barre":""}`:""} 
Analyse les photos, identifie morphologie et déséquilibres musculaires.

RÉPONDS UNIQUEMENT avec ce JSON compact (pas de texte, pas de markdown):
{"analyse":{"points_forts":["m1"],"points_faibles":["m1"],"posture":"courte","morphotype":"ecto|meso|endo","humerus":"courts|longs","femurs":"courts|longs","cage":"plate|large","conseil":"1 phrase"},"programme":{"titre":"string","methode":"string","seances":[{"jour":"Lundi","focus":"string","duree":"50min","intensite":"modere","exercices":[{"nom":"string","series":"3","reps":"10","repos":"90s","charge":"65%","tempo":"2-1-3","methode":"classique","morpho_tip":"string","technique":"string"}],"note":"string"}],"progression":"conseil 8 semaines"},"correction":{"groupes":["m1"],"note":"string"},"nutrition":{"cal":2500,"p":150,"g":300,"l":80,"conseil":"string"},"morpho":{"resume":"string"}}`;
 };

 const lancerIA=async()=>{
 setLoadIA(true);
 const msgs=[
 "📸 Analyse de votre morphologie en cours…",
 "🦴 Détection des proportions et déséquilibres…",
 "💪 Identification de vos points forts et axes de progression…",
 "🧬 Calcul de votre profil biomécanique…",
 "📋 Sélection des exercices adaptés à votre profil…",
 "⚖️ Équilibrage du volume et de l'intensité…",
 "🎯 Adaptation aux pathologies déclarées…",
 "📈 Construction de la progression sur 8 semaines…",
 "🍽️ Calcul de vos besoins nutritionnels personnalisés…",
 "✨ Finalisation de votre programme sur-mesure…",
 ];
 let mi=0;
 setLoadMsg(msgs[0]);
 const interval=setInterval(()=>{mi=(mi+1)%msgs.length;setLoadMsg(msgs[mi]);},2200);

 // ─── Compression image avant envoi ───
 const compressImage=(dataUrl,maxW=800,quality=0.7)=>new Promise(resolve=>{
 const img=new Image();
 img.onload=()=>{
 const canvas=document.createElement("canvas");
 const ratio=Math.min(maxW/img.width,maxW/img.height,1);
 canvas.width=Math.round(img.width*ratio);
 canvas.height=Math.round(img.height*ratio);
 const ctx=canvas.getContext("2d");
 ctx.drawImage(img,0,0,canvas.width,canvas.height);
 resolve(canvas.toDataURL("image/jpeg",quality));
 };
 img.onerror=()=>resolve(dataUrl); // fallback sans compression
 img.src=dataUrl;
 });

 try{
 const content=[];
 // ─── Compresser et envoyer les photos ───
 const photosSent=[];
 const photoEntries=[
 {key:"face",src:photos.face},
 {key:"dos",src:photos.dos},
 {key:"profil",src:photos.profil},
 ].filter(p=>p.src);

 for(const {key,src} of photoEntries){
 const compressed=await compressImage(src,800,0.65);
 const b64=compressed.split(",")[1];
 content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}});
 photosSent.push(key);
 }

 content.push({type:"text",text:buildP()});
 const res=await fetch("/api/generate",{
 method:"POST",
 headers:{"Content-Type":"application/json"},
 body:JSON.stringify({
 model:"claude-haiku-4-5",
 max_tokens:5000,
 messages:[{role:"user",content}]
 })
 });
 if(!res.ok){
 const errTxt=await res.text();
 throw new Error(`API ${res.status}: ${errTxt.substring(0,100)}`);
 }
 const apiData=await res.json();
 if(apiData.error) throw new Error(apiData.error.message||"Erreur API");
 const rawText=apiData.content.map(i=>i.text||"").join("").trim();
 if(!rawText) throw new Error("Réponse vide de l'API");
 // Nettoyage robuste du JSON
 let jsonStr=rawText.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
 // Extraire uniquement le JSON (entre le premier { et le dernier })
 const jStart=jsonStr.indexOf("{");
 const jEnd=jsonStr.lastIndexOf("}");
 if(jStart===-1||jEnd===-1||jEnd<=jStart) throw new Error("Pas de JSON dans la réponse");
 jsonStr=jsonStr.substring(jStart,jEnd+1);
 // Tenter de corriger les JSON tronqués courants
 const openB=(jsonStr.match(/\{/g)||[]).length;
 const closeB=(jsonStr.match(/\}/g)||[]).length;
 if(openB>closeB) jsonStr+="}".repeat(openB-closeB);
 const openBr=(jsonStr.match(/\[/g)||[]).length;
 const closeBr=(jsonStr.match(/\]/g)||[]).length;
 if(openBr>closeBr) jsonStr+="]".repeat(openBr-closeBr)+"}";
 let parsed;
 try{parsed=JSON.parse(jsonStr);}
 catch(pe){throw new Error("JSON mal formé: "+pe.message.substring(0,50));}
 if(!parsed.programme) throw new Error("Clé 'programme' absente");
 if(!Array.isArray(parsed.programme.seances)||parsed.programme.seances.length===0) throw new Error("Aucune séance générée");
 // Support both compact keys (new) and verbose keys (old)
 const analyse=parsed.analyse||parsed.analyse_physique||{};
 const correction=parsed.correction||parsed.correction_faibles||{};
 const np={
 titre:parsed.programme.titre||"Mon programme",
 type:"ia",
 methode:parsed.programme.methode||"Classique",
 morpho:parsed.morpho||{},
 analyse:{
 points_forts:analyse.points_forts||[],
 points_faibles:analyse.points_faibles||[],
 posture:analyse.posture||"",
 morphotype:analyse.morphotype||"",
 humerus:analyse.humerus||"",
 femurs:analyse.femurs||"",
 cage_thoracique:analyse.cage||analyse.cage_thoracique||"",
 recommandation_principale:analyse.conseil||analyse.recommandation_principale||"",
 },
 correction:{
 groupes_prioritaires:correction.groupes||correction.groupes_prioritaires||[],
 note:correction.note||correction.frequence_supplementaire||"",
 },
 numero:cycles.length+1,
 objectif:form.objectif,
 nutrition:parsed.nutrition||{},
 dateDebut:new Date().toLocaleDateString("fr-FR"),
 duree_semaines:parsed.programme.duree_semaines||8,
 progression:typeof parsed.programme.progression==="string"
 ?{semaines_1_2:parsed.programme.progression}
 :parsed.programme.progression||{},
 jours:parsed.programme.seances.map((s,i)=>({
 id:i+1,
 nom:s.jour||`Séance ${i+1}`,
 focus:s.focus||"",
 duree:s.duree||"50 min",
 intensite:s.intensite||"modere",
 type_seance:s.type_seance||"corps_entier",
 note_seance:s.note||s.note_seance||"",
 exercices:(s.exercices||[]).map(ex=>({
...ex,
 // normalise compact keys
 series:ex.series||ex.s||"3",
 reps:ex.reps||ex.r||"10",
 repos:ex.repos||"90s",
 historique:[],note:""
 })),
 complete:false,date:null,note:""
 }))
 };
 if(prog){
 const chargesResume=[];
 prog.jours.forEach(j=>j.exercices.forEach(ex=>{
 if(ex.historique?.length>0){
 const max=Math.max(...ex.historique.map(h=>parseFloat(h.poids)||0));
 if(max>0) chargesResume.push(`${ex.nom.split(" ")[0]}: ${max}kg`);
 }
 }));
 setCycles(prev=>[...prev,{...prog,archiveDate:new Date().toLocaleDateString("fr-FR"),chargesResume:chargesResume.slice(0,5).join(", ")}]);
 }
 setProg(np);
 setCycleStart(Date.now());
 setAStep(0);
 setPhotos({face:null,dos:null,profil:null});
 const today=new Date();
 const joursMap={"lun":1,"mar":2,"mer":3,"jeu":4,"ven":5,"sam":6,"dim":0};
 const newSess={};
 np.jours.forEach(jour=>{
 const match=Object.entries(joursMap).find(([k])=>jour.nom.toLowerCase().startsWith(k));
 if(match){
 const dayNum=match[1];
 for(let w=0;w<8;w++){
 const dateObj=new Date(today);
 dateObj.setDate(dateObj.getDate()+((dayNum-dateObj.getDay()+7)%7||7)+w*7);
 const key=`${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,"0")}-${String(dateObj.getDate()).padStart(2,"0")}`;
 newSess[key]={nom:jour.focus||jour.nom,intensite:jour.intensite||"modere",color:INT[jour.intensite||"modere"]?.c||"#3b82f6"};
 }
 }
 });
 setCalSess(prev=>({...prev,...newSess}));
 setProgView("today");
 setTab("program");
 const pts=np.analyse?.points_faibles?.join(", ")||"";
 push("🎯",`Programme Cycle ${np.numero} créé !`,pts?`Points faibles: ${pts}`:"Votre programme est prêt !");
 }catch(e){
 console.error("lancerIA error:",e);
 setLoadMsg(`Erreur: ${e.message}`);
 setTimeout(()=>{
 setLoadIA(false);
 push("❌","Échec",e.message?.substring(0,80)||"Réessayez.");
 },2000);
 }finally{
 clearInterval(interval);
 setLoadIA(false);
 }
 }
}