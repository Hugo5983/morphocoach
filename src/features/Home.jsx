import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "../data/constants.js";
import { FOODS } from "../data/foods.js";
import { EX } from "../data/exercises.js";
import { MOTIVATIONS } from "../data/motivations.js";
import { Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart } from "../components/ui/index.jsx";

// ─── HOME ──────────────────────────────────────────────────────────────

 export default function Home(props){
 const { profil, prog, cycleStart, setTab, premium, setPaywall, push, eau, setEau, weightLog, setWeightLog, lastWeighIn, setLastWeighIn, calSess, imc, obj, calObj, pObj, lObj, gObj, totR, jR, cPct, semC, getStreak, C, INT, MOTIVATIONS } = props;
 const tot=totR;
 const today=new Date();
 const todayKey=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
 const todaySess=calSess[todayKey];
 const dayOfYear=Math.floor((today-new Date(today.getFullYear(),0,0))/(1000*60*60*24));const motiv=MOTIVATIONS[dayOfYear%MOTIVATIONS.length];
 return(
 <div style={{padding:"0 15px 16px"}} className="anim">
 <div style={{paddingTop:24,paddingBottom:14}}>
 <div style={{fontSize:9,letterSpacing:"1.5px",color:"#64748b",fontWeight:500,marginBottom:8,textTransform:"uppercase"}}>{today.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:300,color:C.text,letterSpacing:-0.5,lineHeight:1.1,marginBottom:12}}>
 {profil.prenom?<>Bonjour, <span style={{fontWeight:500,color:C.blue}}>{profil.prenom}</span></>:<>Bonjour <span style={{fontWeight:300,color:"#64748b"}}>👋</span></>}
 </div>
 <div className="slide-up" style={{padding:"12px 14px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:12,animationDelay:"0.05s"}}>
 <div style={{fontSize:9,color:C.blue,fontWeight:600,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:5}}>✨ Motivation du jour</div>
 <div style={{fontSize:13,color:C.text,fontWeight:500,lineHeight:1.6,fontStyle:"italic"}}>{motiv}</div>
 </div>
 {/* ─── Streak ─── */}
          {(()=>{const s=getStreak;return s>0?(<div className="pop-in" style={{display:"flex",alignItems:"center",gap:8,marginTop:8,padding:"8px 12px",background:"rgba(249,115,22,0.08)",border:"0.5px solid rgba(249,115,22,0.2)",borderRadius:10}}>
            <span style={{fontSize:18}}>🔥</span>
            <div>
              <span style={{fontSize:13,fontWeight:600,color:"#f97316"}}>{s} jour{s>1?"s":""} consécutif{s>1?"s":""}</span>
              <span style={{fontSize:10,color:"#64748b",marginLeft:6}}>{s>=7?"Semaine parfaite ! 🏆":s>=3?"Continue comme ça ! 💪":"En route !"}</span>
            </div>
          </div>):null;})()}
 </div>
 {todaySess&&(
 <div style={{padding:"12px 14px",background:`${todaySess.color}15`,border:`0.5px solid ${todaySess.color}35`,borderRadius:11,marginBottom:9,display:"flex",alignItems:"center",gap:10}}>
 <div style={{width:8,height:8,borderRadius:"50%",background:todaySess.color,flexShrink:0}}/>
 <div>
 <div style={{fontSize:9,color:todaySess.color,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>Séance du jour</div>
 <div style={{fontSize:14,fontWeight:500}}>{todaySess.nom}</div>
 </div>
 <div style={{marginLeft:"auto",fontSize:10,color:todaySess.color,fontWeight:600}}>{INT[todaySess.intensite]?.l}</div>
 </div>
 )}
 {cycleStart&&(
 <Box className="slide-up" style={{background:"rgba(59,130,246,0.06)",borderColor:C.goldB,animationDelay:"0.1s"}}>
 <Row style={{justifyContent:"space-between",marginBottom:8}}>
 <div>
 <div style={{fontSize:9,color:C.gold,letterSpacing:"1.5px",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Cycle · Sem {semC+1}/6</div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,letterSpacing:-0.5,fontWeight:300}}>{prog?.titre}</div>
 </div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,color:jR<=7?C.orange:C.gold,letterSpacing:-0.5,fontWeight:300}}>{jR}J</div>
 </Row>
 <Bar pct={cPct} h={4}/>
 <div style={{display:"flex",gap:3,marginTop:6}}>
 {[0,1,2,3,4,5].map(w=><div key={w} style={{flex:1,height:2,borderRadius:1,background:w<=semC?C.gold:"rgba(255,255,255,0.07)"}}/>)}
 </div>
 </Box>
 )}
 {/* ─── Macros + Calories ─── */}
 {profil.poids&&profil.taille&&profil.age&&profil.sexe?(
 <Box style={{marginBottom:9}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
 <div style={{fontSize:9,color:"#64748b",letterSpacing:"1px",textTransform:"uppercase",fontWeight:500}}>Calories du jour</div>
 <div style={{fontSize:11,fontWeight:500,color:tot.cal>calObj?C.red:"#3b82f6"}}>{tot.cal} <span style={{color:"#64748b",fontWeight:400}}>/ {calObj} kcal</span></div>
 </div>
 {/* Barre calories principale */}
 <div style={{height:6,background:"#dce8f4",borderRadius:3,marginBottom:12,overflow:"hidden"}}>
 <div style={{height:"100%",width:`${Math.min(100,tot.cal/calObj*100)}%`,background:tot.cal>calObj?C.red:"#3b82f6",borderRadius:3,transition:"width.3s"}}/>
 </div>
 {/* 3 macros */}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
 {[
 {l:"Protéines",v:tot.p,obj:pObj,c:"#ef4444",bg:"rgba(239,68,68,0.07)"},
 {l:"Glucides", v:tot.g,obj:gObj,c:"#f97316",bg:"rgba(249,115,22,0.07)"},
 {l:"Lipides", v:tot.l,obj:lObj,c:"#22c55e",bg:"rgba(34,197,94,0.07)"},
 ].map(m=>(
 <div key={m.l} style={{padding:"8px 6px",background:m.bg,borderRadius:8}}>
 <div style={{fontSize:9,color:m.c,fontWeight:600,letterSpacing:"0.3px",marginBottom:3}}>{m.l}</div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:300,color:C.text,lineHeight:1}}>{m.v}<span style={{fontSize:8,color:"#64748b"}}>g</span></div>
 <div style={{height:2,background:"#dce8f4",borderRadius:1,marginTop:4,overflow:"hidden"}}>
 <div style={{height:"100%",width:`${Math.min(100,m.v/m.obj*100)}%`,background:m.c,borderRadius:1,transition:"width.3s"}}/>
 </div>
 <div style={{fontSize:8,color:"#64748b",marginTop:2}}>{m.v}/{m.obj}g</div>
 </div>
 ))}
 </div>
 </Box>
 ):(
 /* ─── Invite à compléter le profil ─── */
 <div onClick={()=>setTab("profile")} style={{padding:"14px 16px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:12,marginBottom:9,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
 <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(59,130,246,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>👤</div>
 <div style={{flex:1}}>
 <div style={{fontSize:12,fontWeight:600,color:"#3b82f6",marginBottom:2}}>Complète ton profil</div>
 <div style={{fontSize:10,color:"#64748b",lineHeight:1.4}}>Renseigne ton poids, taille, âge et objectif pour voir tes calories et macros personnalisées</div>
 </div>
 <div style={{fontSize:16,color:"#3b82f6"}}>›</div>
 </div>
 )}
 <Box>
 <Lbl>Hydratation</Lbl>
 <div style={{display:"flex",gap:7}}>
 {[...Array(8)].map((_,i)=><div key={i} onClick={()=>setEau(i<eau?i:i+1)} style={{flex:1,height:22,borderRadius:6,background:i<eau?`rgba(59,130,246,${0.25+i*0.09})`:"#dce8f4",cursor:"pointer",transition:"background.2s"}}/>)}
 </div>
 </Box>
 <Lbl>Suivi du poids</Lbl>
 {(()=>{
 const todayD=new Date();
 const daysSinceLast=lastWeighIn?Math.floor((todayD-new Date(lastWeighIn))/(1000*60*60*24)):999;
 const canWeighIn=daysSinceLast>=14;
 const lastWeight=weightLog.length>0?weightLog[weightLog.length-1]:null;
 const firstWeight=weightLog.length>1?weightLog[0]:null;
 const diff=lastWeight&&firstWeight?(lastWeight.v-firstWeight.v).toFixed(1):null;
 return(
 <Box style={{marginBottom:9}}>
 {weightLog.length>=2&&(
 <div style={{marginBottom:12}}>
 <Row style={{justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
 <div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:300,color:"#3b82f6",letterSpacing:-1,lineHeight:1}}>{lastWeight?.v}<span style={{fontSize:12,color:"#64748b",fontFamily:"'Inter',sans-serif",fontWeight:400}}> kg</span></div>
 <div style={{fontSize:10,color:"#64748b",marginTop:2}}>Dernière pesée · {lastWeight?.date}</div>
 </div>
 {diff&&<div style={{textAlign:"right",paddingBottom:4}}>
 <div style={{fontSize:20,fontWeight:300,color:parseFloat(diff)>0?(profil.objectif==="poids"?C.red:C.green):(profil.objectif==="poids"?C.green:C.red),lineHeight:1}}>{parseFloat(diff)>0?"+":""}{diff}<span style={{fontSize:11}}>kg</span></div>
 <div style={{fontSize:9,color:"#64748b",marginTop:1}}>depuis le début</div>
 </div>}
 </Row>
 {(()=>{
 const W=320,H=90,PAD=8;
 const vals=weightLog.map(w=>w.v);
 const mn=Math.min(...vals),mx=Math.max(...vals);
 const spread=mx-mn||0.5;
 const getX=i=>(i/(weightLog.length-1||1))*(W-PAD*2)+PAD;
 const getY=v=>H-PAD-((v-mn)/spread)*(H-PAD*2-14);
 const pts=weightLog.map((w,i)=>`${getX(i)},${getY(w.v)}`).join(" ");
 const areaBot=H-PAD;
 const area=`${PAD},${areaBot} `+weightLog.map((w,i)=>`${getX(i)},${getY(w.v)}`).join(" ")+` ${getX(weightLog.length-1)},${areaBot}`;
 return(
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H,display:"block",overflow:"visible"}}>
 <defs>
 <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18"/>
 <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
 </linearGradient>
 </defs>
 {/* Grille légère */}
 {[0.25,0.5,0.75].map(r=>(
 <line key={r} x1={PAD} y1={PAD+r*(H-PAD*2)} x2={W-PAD} y2={PAD+r*(H-PAD*2)} stroke="#dce8f4" strokeWidth="0.5"/>
 ))}
 {/* Zone remplie */}
 <polygon points={area} fill="url(#wg)"/>
 {/* Ligne */}
 <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 {/* Points + valeur + date */}
 {weightLog.map((w,i)=>{
 const x=getX(i),y=getY(w.v);
 const showDate=i===0||i===weightLog.length-1||weightLog.length<=5;
 return(
 <g key={i}>
 <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2"/>
 <text x={x} y={y-8} textAnchor="middle" fontSize="8" fill="#3b82f6" fontFamily="Inter,sans-serif" fontWeight="600">{w.v}</text>
 {showDate&&<text x={x} y={H-1} textAnchor={i===0?"start":i===weightLog.length-1?"end":"middle"} fontSize="7" fill="#64748b" fontFamily="Inter,sans-serif">{w.date}</text>}
 </g>
 );
 })}
 </svg>
 );
 })()}
 </div>
 )}
 {weightLog.length===0&&<div style={{textAlign:"center",padding:"12px 0",fontSize:12,color:"#64748b",marginBottom:10}}>Enregistrez votre première pesée pour voir votre progression.</div>}
 {weightLog.length===1&&(
 <Row style={{justifyContent:"space-between",marginBottom:10}}>
 <div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:300,color:C.gold,letterSpacing:-1}}>{lastWeight?.v}<span style={{fontSize:12,color:"#64748b",fontFamily:"'Inter',sans-serif"}}> kg</span></div>
 <div style={{fontSize:10,color:"#64748b"}}>Pesée du {lastWeight?.date}</div>
 </div>
 </Row>
 )}
 {canWeighIn?(
 showWeightInput?(
 <Row style={{gap:8}}>
 <Inp style={{flex:1,marginBottom:0}} type="number" placeholder="Ex: 79.5" value={newWeight} onChange={e=>setNewWeight(e.target.value)} step="0.1"/>
 <button onClick={()=>{
 if(!newWeight) return;
 const entry={v:parseFloat(newWeight),date:new Date().toLocaleDateString("fr-FR")};
 setWeightLog(prev=>[...prev,entry]);
 setLastWeighIn(new Date().toISOString());
 setNewWeight("");setShowWeightInput(false);
 push("⚖️","Poids enregistré !",`${newWeight}kg enregistré. Prochain pesée dans 2 semaines.`);
 }} style={{padding:"11px 14px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:9,color:"#3b82f6",cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"}}>✓ OK</button>
 <button onClick={()=>setShowWeightInput(false)} style={{padding:"11px 10px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:"#64748b",cursor:"pointer",fontSize:14}}>×</button>
 </Row>
 ):(
 <Btn onClick={()=>setShowWeightInput(true)} v="out">⚖️ Enregistrer mon poids</Btn>
 )
 ):(
 <div style={{padding:"9px 11px",background:"rgba(62,199,122,0.08)",border:"1px solid rgba(62,199,122,0.2)",borderRadius:8,fontSize:11,color:C.green,lineHeight:1.5,textAlign:"center"}}>
 🌱 Prochaine pesée dans <span style={{fontWeight:700}}>{14-daysSinceLast} jour{14-daysSinceLast>1?"s":""}</span> — laisse ton corps s'adapter !
 </div>
 )}
 </Box>
 );
 })()}
 <Lbl>Accès rapide</Lbl>
 <G2>
 {[
 {icon:"📅",l:"Planification",sub:"Calendrier",fn:()=>{setTab("program");setProgView("calendar");}},
 {icon:"📊",l:"Progression",sub:"Voir mes séances",fn:()=>{setTab("program");setProgView("today");}},
 {icon:"🏋️",l:"Mon programme",sub:"Créer & suivre",fn:()=>{setTab("program");setProgView("creer");}},
 {icon:"◈",l:"Mon programme",sub:"Premium",fn:()=>{if(!premium)setPaywall(true);else{setTab("program");setProgView("analyse");}},prem:true},
 ].map((a,i)=>(
 <Box key={i} onClick={a.fn} style={{marginBottom:0,cursor:"pointer",background:a.prem?"rgba(200,150,62,0.06)":C.s1,borderColor:a.prem?C.goldB:C.s3}}>
 <div style={{fontSize:22,marginBottom:7}}>{a.icon}</div>
 <div style={{fontSize:12,fontWeight:500,color:a.prem?C.gold:C.text}}>{a.l}</div>
 <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{a.sub}</div>
 </Box>
 ))}
 </G2>
 {/* Bodyfat + IMC section */}
 <Box style={{display:"grid",gridTemplateColumns:profil.bodyfat?"1fr 1fr":"1fr",gap:12}}>
  {profil.bodyfat&&(()=>{
   const bf=parseFloat(profil.bodyfat);
   const cat=profil.sexe==="femme"?(bf<14?"Athlète":bf<21?"Forme":bf<25?"Acceptable":bf<32?"À améliorer":"Obésité"):(bf<6?"Athlète":bf<14?"Forme":bf<18?"Acceptable":bf<25?"À améliorer":"Obésité");
   const col=cat==="Athlète"||cat==="Forme"?"#22c55e":cat==="Acceptable"?"#f97316":"#ef4444";
   return(
   <div>
    <div style={{fontSize:9,color:"#64748b",letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>Masse grasse</div>
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,color:col,fontWeight:300,letterSpacing:-0.5,lineHeight:1}}>{bf}<span style={{fontSize:12,color:"#64748b",marginLeft:2}}>%</span></div>
    <div style={{fontSize:11,fontWeight:600,color:col,marginTop:4}}>{cat}</div>
    <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>Fiable — ne dépend pas de la masse musculaire</div>
   </div>
   );
  })()}
  {imc&&(
  <div>
   <div style={{fontSize:9,color:"#64748b",letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>IMC</div>
   <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,color:"#94a3b8",fontWeight:300,letterSpacing:-0.5,lineHeight:1}}>{imc}</div>
   <div style={{fontSize:11,fontWeight:500,color:imc<18.5?C.blue:imc<25?C.green:imc<30?C.orange:C.red,marginTop:4}}>{imc<18.5?"Maigreur":imc<25?"Normal ✓":imc<30?"Surpoids":"Obésité"}</div>
   <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>Ne distingue pas muscle et graisse</div>
  </div>
  )}
 </Box>
 </div>
 );
 }
}