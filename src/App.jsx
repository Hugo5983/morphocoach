import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "./data/constants.js";
import { FOODS } from "./data/foods.js";
import { EX } from "./data/exercises.js";
import { MOTIVATIONS } from "./data/motivations.js";
import { Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart } from "./components/ui/index.jsx";
import { Notif } from "./components/ui/Notif.jsx";
import { Chrono } from "./components/ui/Chrono.jsx";
import { useStorage } from "./hooks/useStorage.js";
import Onboarding from "./features/Onboarding.jsx";
import Home from "./features/Home.jsx";
import Stats from "./features/Stats.jsx";
import Calendar from "./features/Calendar.jsx";
import Seances from "./features/Seances.jsx";
import Creer from "./features/Creer.jsx";
import AnalyseIA from "./features/AnalyseIA.jsx";
import Nutrition from "./features/Nutrition.jsx";
import Profile from "./features/Profile.jsx";
import ProgramTab from "./features/ProgramTab.jsx";

export default function App(){
 const [tab,setTab]=useState("home");
 const [premium,setPremium]=useState(false);
 const [showChrono,setChrono]=useState(false);
 const [chronoSec,setChronoSec]=useState(90);
 const [paywall,setPaywall]=useState(false);
 const [notif,setNotif]=useState(null);
 const [profil,setProfil]=useStorage("profil",{prenom:"",age:"",poids:"",taille:"",sexe:"",objectif:"hypertrophie",activite:"modere",bodyfat:""});
 const [onboardingDone,setOnboardingDone]=useStorage("onboardingDone",false);

 // ─── ONBOARDING ───────────────────────────────────────────────────────────
 const profilComplet=profil.poids&&profil.taille&&profil.age&&profil.sexe;
 const showOnboarding=!onboardingDone&&!profilComplet;
 const [oStep,setOStep]=useState(0);
 const [oData,setOData]=useState({prenom:"",sexe:"",age:"",poids:"",taille:"",objectif:"hypertrophie",activite:"modere"});

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

 };
 const Paywall=()=>(
 <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:18}}>
 <div style={{background:C.s1,border:`1px solid rgba(200,150,62,.3)`,borderRadius:14,padding:"24px 20px",width:"100%",maxWidth:400}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,letterSpacing:2,color:C.gold,textAlign:"center",marginBottom:6}}>ACCÈS PREMIUM</div>
 <div style={{fontSize:12,color:"#64748b",textAlign:"center",marginBottom:16}}>Cette fonctionnalité est réservée aux membres Premium.</div>
 {["Programme unique selon votre morphologie","Exercices correctifs pathologies","Guides techniques avancés","Cycle 6 semaines optimisé"].map(f=>(
 <Row key={f} style={{marginBottom:8,gap:9}}>
 <div style={{width:15,height:15,borderRadius:"50%",background:"rgba(56,199,117,.12)",border:"1px solid rgba(56,199,117,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0}}>✓</div>
 <span style={{fontSize:12}}>{f}</span>
 </Row>
 ))}
 <div style={{textAlign:"center",margin:"14px 0"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,color:C.gold,letterSpacing:-0.5,fontWeight:300}}>19.99€<span style={{fontSize:11,color:"#64748b",fontFamily:"'Inter',sans-serif",fontWeight:400}}> /cycle</span></div>
 </div>
 <Btn onClick={()=>{setPremium(true);setPaywall(false);push("🎉","Premium activé !","Bienvenue !");}}>Commencer maintenant</Btn>
 <Btn v="ghost" onClick={()=>setPaywall(false)}>Continuer en gratuit</Btn>
 </div>
 </div>
 );
 const NAV=[
 {id:"home",l:"Accueil",svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>},
 {id:"program",l:"Programme",svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>},
 {id:"nutrition",l:"Nutrition",svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7.5-6 9l-3 2-3-2C5.5 18.5 3 15 3 11a9 9 0 0 1 9-9z"/><path d="M12 6v6l4 2"/></svg>},
 ];
 return(
 <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',sans-serif",color:C.text}}>
 <style>{CSS}</style>
 <Notif n={notif} onClose={()=>setNotif(null)}/>
 {/* Header */}
 <div className="np" style={{background:"rgba(237,243,251,0.96)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"0.5px solid #dce8f4",padding:"12px 16px",position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 0 rgba(59,130,246,0.06)"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,letterSpacing:"3px",fontWeight:500,color:"#0f1a2e"}}>
 MORPHO<span style={{color:"#3b82f6"}}>COACH</span>
 </div>
 <div style={{display:"flex",gap:10,alignItems:"center"}}>
 {cycleStart&&jR!==null&&jR<=7&&<span style={{fontSize:9,color:"#f97316",fontWeight:500}}>⚠️ J-{jR}</span>}
 {premium&&<span style={{fontSize:9,color:"#3b82f6",border:"0.5px solid rgba(59,130,246,0.3)",padding:"2px 8px",borderRadius:8,fontWeight:700,letterSpacing:"1px"}}>PREMIUM</span>}
 {/* Icône Profil */}
 <button onClick={()=>setTab(tab==="profile"?"home":"profile")} className="tap-icon" style={{
 width:34,height:34,borderRadius:"50%",
 background:tab==="profile"?"rgba(59,130,246,0.1)":"transparent",
 border:`0.5px solid ${tab==="profile"?"#3b82f6":"#dce8f4"}`,
 display:"flex",alignItems:"center",justifyContent:"center",
 cursor:"pointer",
 transition:"all.2s cubic-bezier(.34,1.56,.64,1)",
 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tab==="profile"?"#3b82f6":"#64748b"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></button>
 </div>
 </div>
 {showOnboarding&&<Onboarding profil={profil} setProfil={setProfil} setOnboardingDone={setOnboardingDone} push={push} C={C} />}
 <div style={{maxWidth:500,margin:"0 auto",paddingBottom:72}}>
 <div key={tab} className="page-enter">
 {tab==="home"&&<Home profil={profil} prog={prog} cycleStart={cycleStart} setTab={setTab} premium={premium} setPaywall={setPaywall} eau={eau} setEau={setEau} weightLog={weightLog} setWeightLog={setWeightLog} lastWeighIn={lastWeighIn} setLastWeighIn={setLastWeighIn} calSess={calSess} imc={imc} obj={obj} calObj={calObj} pObj={pObj} lObj={lObj} gObj={gObj} totR={totR} jR={jR} cPct={cPct} semC={semC} getStreak={getStreak} MOTIVATIONS={MOTIVATIONS} C={C} INT={INT} push={push} />}
 {tab==="program"&&<ProgramTab prog={prog} premium={premium} setPaywall={setPaywall} checkedEx={checkedEx} seance={seance} setSeance={openSeance} setChrono={setChrono} setChronoSec={setChronoSec} exDetails={exDetails} setExDetails={setExDetails} exEdit={exEdit} setExEdit={setExEdit} setProg={setProg} cycleStart={cycleStart} setCycleStart={setCycleStart} setCalSess={setCalSess} calSess={calSess} profil={profil} cycles={cycles} EX={EX} C={C} INT={INT} push={push} />}
 {tab==="nutrition"&&<Nutrition profil={profil} prog={prog} repas={repas} setRepas={setRepas} myFoods={myFoods} setMyFoods={setMyFoods} eau={eau} setEau={setEau} scanRes={scanRes} setScanRes={setScanRes} obj={obj} calObj={calObj} pObj={pObj} lObj={lObj} gObj={gObj} totR={totR} handleScan={handleScan} FOODS={FOODS} C={C} INT={INT} push={push} />}
 {tab==="profile"&&<Profile profil={profil} setProfil={setProfil} prog={prog} setProg={setProg} cycles={cycles} premium={premium} setPremium={setPremium} weightLog={weightLog} setWeightLog={setWeightLog} lastWeighIn={lastWeighIn} setLastWeighIn={setLastWeighIn} checkedEx={checkedEx} setCheckedEx={setCheckedEx} imc={imc} obj={obj} calObj={calObj} pObj={pObj} lObj={lObj} gObj={gObj} getStreak={getStreak} OBJ={OBJ} ACTIVITE_FACTOR={ACTIVITE_FACTOR} EX={EX} setChrono={setChrono} setChronoSec={setChronoSec} seance={seance} exDetails={exDetails} setExDetails={setExDetails} exEdit={exEdit} setExEdit={setExEdit} C={C} INT={INT} push={push} />}
 </div>
 </div>
 {/* Nav — 3 onglets uniquement */}
 <nav className="np" style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(230,240,252,0.98)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:"0.5px solid #c8daf0",display:"flex",zIndex:100,boxShadow:"0 -1px 0 rgba(59,130,246,0.06)"}}>
 {NAV.map(t=>(
 <button key={t.id} onClick={()=>setTab(t.id)} className="tap" style={{flex:1,padding:"10px 4px 12px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all.15s",fontFamily:"'Inter',sans-serif"}}>
 <div style={{color:tab===t.id?"#3b82f6":"#64748b",transition:"color.15s",lineHeight:1}}>{t.svg}</div>
 <span style={{fontSize:9,letterSpacing:"0.3px",fontWeight:tab===t.id?600:400,color:tab===t.id?"#3b82f6":"#64748b",transition:"color.15s"}}>{t.l}</span>
 {tab===t.id&&<div className="nav-dot" style={{width:20,height:2,borderRadius:1,background:"#3b82f6",animation:"scaleIn .2s cubic-bezier(.34,1.56,.64,1) both"}}/>}
 </button>
 ))}
 </nav>
 {showChrono&&<Chrono onClose={()=>setChrono(false)} initSec={chronoSec}/>}
 {paywall&&Paywall()}
 </div>
 );
}
