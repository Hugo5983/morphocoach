import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "../../data/constants.js";
import { FOODS } from "../../data/foods.js";
import { EX } from "../../data/exercises.js";
import { MOTIVATIONS } from "../../data/motivations.js";
import { Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart } from "../../components/ui/index.jsx";

// ─── PROFILE ──────────────────────────────────────────────────────────────

 export default function Profile(props){
 const { profil, setProfil, prog, setProg, cycles, premium, setPremium, push, setChrono, setChronoSec, weightLog, setWeightLog, lastWeighIn, setLastWeighIn, checkedEx, setCheckedEx, seance, exDetails, setExDetails, exEdit, setExEdit, imc, obj, calObj, pObj, lObj, gObj, getStreak, C, INT, OBJ, ACTIVITE_FACTOR, EX } = props;
 return (
 <div style={{padding:"0 15px 16px"}} className="anim">
 <div style={{padding:"26px 0 14px",display:"flex",flexDirection:"column",alignItems:"center"}}>
 <div style={{width:68,height:68,borderRadius:"50%",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
 </div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:300,color:"#0f1a2e",marginBottom:3}}>{profil.prenom||"Mon profil"}</div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{premium?"Membre Premium ✦":"Compte gratuit"}</div>
 </div>
 {!premium?<div style={{background:"rgba(59,130,246,0.06)",border:`0.5px solid ${C.goldB}`,borderRadius:13,padding:"20px 16px",marginBottom:9}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,letterSpacing:2,color:C.gold,textAlign:"center",marginBottom:4}}>PASSER À PREMIUM</div>
 <div style={{fontSize:12,color:"#64748b",textAlign:"center",marginBottom:14}}>Programmes personnalisés selon votre morphologie</div>
 {["Programme unique adapté à votre corps","Biomécanique et exercices correctifs","Programme nutrition sur mesure","Calendrier cycle 6 semaines"].map(f=>(
 <Row key={f} style={{marginBottom:8,gap:9}}>
 <div style={{width:15,height:15,borderRadius:"50%",background:"rgba(56,199,117,.12)",border:"1px solid rgba(56,199,117,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0}}>✓</div>
 <span style={{fontSize:12}}>{f}</span>
 </Row>
 ))}
 <div style={{textAlign:"center",margin:"12px 0"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,color:C.gold,letterSpacing:-0.5,fontWeight:300}}>19.99€<span style={{fontSize:12,color:"#64748b",fontFamily:"'Inter',sans-serif",fontWeight:400}}> /cycle</span></div>
 </div>
 <Btn onClick={()=>{setPremium(true);push("🎉","Premium activé !","Accès complet activé !");}}>Commencer maintenant</Btn>
 </div>:<Box style={{background:C.goldD,borderColor:C.goldB,display:"flex",alignItems:"center",gap:11}}>
 <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(200,150,62,.15)",border:`0.5px solid ${C.goldB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>◈</div>
 <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:16,color:C.gold,letterSpacing:-0.5,fontWeight:300}}>MEMBRE PREMIUM</div><div style={{fontSize:10,color:"#64748b"}}>Accès complet activé</div></div>
 </Box>}
 <Box>
 <Lbl>Informations</Lbl>
 <Inp placeholder="Prénom" value={profil.prenom} onChange={e=>setProfil({...profil,prenom:e.target.value})}/>
 <G2><Inp type="number" placeholder="Âge" style={{marginBottom:0}} value={profil.age} onChange={e=>setProfil({...profil,age:e.target.value})}/><select style={{width:"100%",padding:"11px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.text,fontSize:13}} value={profil.sexe} onChange={e=>setProfil({...profil,sexe:e.target.value})}><option value="">Sexe</option><option value="homme">Homme</option><option value="femme">Femme</option></select></G2>
 <G2 style={{marginTop:6}}><Inp type="number" placeholder="Poids (kg)" style={{marginBottom:0}} value={profil.poids} onChange={e=>setProfil({...profil,poids:e.target.value})}/><Inp type="number" placeholder="Taille (cm)" style={{marginBottom:0}} value={profil.taille} onChange={e=>setProfil({...profil,taille:e.target.value})}/></G2>
 <div style={{marginTop:6}}>
  <Inp type="number" placeholder="% Masse grasse (optionnel — plus fiable que l'IMC)" value={profil.bodyfat||""} onChange={e=>setProfil({...profil,bodyfat:e.target.value})}/>
  {profil.bodyfat&&(()=>{
   const bf=parseFloat(profil.bodyfat);
   const cat=profil.sexe==="femme"?(bf<14?"Athlète ⚡":bf<21?"Forme ✅":bf<25?"Acceptable":bf<32?"À améliorer":"Obésité"):(bf<6?"Athlète ⚡":bf<14?"Forme ✅":bf<18?"Acceptable":bf<25?"À améliorer":"Obésité");
   const col=cat.includes("Athlète")||cat.includes("Forme")?"#22c55e":cat==="Acceptable"?"#f97316":"#ef4444";
   return <div style={{fontSize:11,color:col,fontWeight:600,marginTop:2,paddingLeft:4}}>📊 {cat}</div>;
  })()}
  {imc&&!profil.bodyfat&&<div style={{marginTop:4,padding:"6px 10px",background:"#f8fafc",border:"0.5px solid #dce8f4",borderRadius:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
   <span style={{fontSize:10,color:"#94a3b8"}}>IMC : {imc} — indicatif seulement</span>
   <span style={{fontSize:10,color:imc<18.5?C.blue:imc<25?C.green:imc<30?C.orange:C.red,fontWeight:600}}>{imc<18.5?"Maigreur":imc<25?"Normal ✓":imc<30?"Surpoids":"Obésité"}</span>
  </div>}
 </div>
 </Box>
 <Box>
 <Lbl>Objectif</Lbl>
 <G2>{[{id:"hypertrophie",i:"💪",l:"Prise de muscle"},{id:"force",i:"🏋️",l:"Force"},{id:"poids",i:"🔥",l:"Perte de poids"},{id:"sante",i:"❤️",l:"Santé"},{id:"prep_physique",i:"⚡",l:"Prépa physique"},{id:"reathletisation",i:"🩺",l:"Réathlétisation"}].map(o=>(
 <div key={o.id} onClick={()=>setProfil({...profil,objectif:o.id})} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:profil.objectif===o.id?C.goldD:C.s2,border:`1px solid ${profil.objectif===o.id?C.gold:C.s3}`,borderRadius:10}}>
 <div style={{fontSize:20,marginBottom:5}}>{o.i}</div><div style={{fontSize:11,fontWeight:400}}>{o.l}</div>
 </div>
 ))}</G2>
 </Box>
 <Box>
 <Lbl>Niveau d'activité</Lbl>
 {[{id:"sedentaire",l:"Sédentaire",d:"Bureau"},{id:"leger",l:"Léger",d:"1-3x/sem"},{id:"modere",l:"Modéré",d:"3-5x/sem"},{id:"actif",l:"Très actif",d:"6-7x/sem"}].map(n=>(
 <div key={n.id} onClick={()=>setProfil({...profil,activite:n.id})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:profil.activite===n.id?C.goldD:C.s2,border:`1px solid ${profil.activite===n.id?C.gold:C.s3}`,borderRadius:9,cursor:"pointer",marginBottom:6}}>
 <span style={{fontSize:12,fontWeight:600}}>{n.l}</span><span style={{fontSize:10,color:"#64748b"}}>{n.d}</span>
 </div>
 ))}
 </Box>
 {profil.poids&&profil.taille&&profil.age&&profil.sexe&&<Box>
 <Lbl>Besoins calculés</Lbl>
 {/* ─── Calorie principale ─── */}
 <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:34,color:"#3b82f6",fontWeight:300,letterSpacing:-1,lineHeight:1}}>{calObj}</div>
 <div style={{fontSize:12,color:"#64748b"}}>kcal/jour</div>
 {cycles.length>0&&<div style={{marginLeft:"auto",padding:"3px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,fontSize:10,color:"#3b82f6"}}>Cycle {cycles.length+1}</div>}
 </div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:10}}>{obj.icon} {obj.l} · {obj.surplus>0?`+${obj.surplus} kcal surplus`:obj.surplus<0?`${obj.surplus} kcal déficit`:"Maintien"}</div>
 {/* ─── Détail calcul ─── */}
 {(()=>{
 const p=parseFloat(profil.poids)||0;
 const t=parseFloat(profil.taille)||0;
 const a=parseFloat(profil.age)||0;
 const mb=profil.sexe==="femme"?Math.round(447.593+9.247*p+3.098*t-4.330*a):Math.round(88.362+13.397*p+4.799*t-5.677*a);
 const factAct=ACTIVITE_FACTOR[profil.activite]||1.375;
 const tdee=Math.round(mb*factAct);
 return(
 <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.12)",borderRadius:10,marginBottom:12}}>
 <div style={{fontSize:9,color:"#3b82f6",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>📊 Détail Harris-Benedict</div>
 <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
 <span style={{fontSize:10,color:"#64748b"}}>Métabolisme de base (MB)</span>
 <span style={{fontSize:10,fontWeight:600,color:C.text}}>{mb} kcal</span>
 </div>
 <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
 <span style={{fontSize:10,color:"#64748b"}}>TDEE (MB × {factAct})</span>
 <span style={{fontSize:10,fontWeight:600,color:C.text}}>{tdee} kcal</span>
 </div>
 <div style={{display:"flex",justifyContent:"space-between",borderTop:"0.5px solid #dce8f4",paddingTop:4,marginTop:2}}>
 <span style={{fontSize:10,color:"#64748b"}}>Objectif ({obj.l})</span>
 <span style={{fontSize:11,fontWeight:600,color:"#3b82f6"}}>{calObj} kcal</span>
 </div>
 </div>
 );
 })()}
 {/* ─── Macros en g/kg ─── */}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
 {[
 {l:"Protéines",v:pObj,sub:`${obj.p}g/kg`,c:"#ef4444",bg:"rgba(239,68,68,0.08)"},
 {l:"Glucides", v:gObj,sub:"reste cal", c:"#f97316",bg:"rgba(249,115,22,0.08)"},
 {l:"Lipides", v:lObj,sub:`${obj.li}g/kg`,c:"#22c55e",bg:"rgba(34,197,94,0.08)"},
 ].map(m=>(
 <div key={m.l} style={{textAlign:"center",padding:"10px 6px",background:m.bg,borderRadius:10,border:`0.5px solid ${m.c}30`}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,color:m.c,fontWeight:300}}>{m.v}<span style={{fontSize:9}}>g</span></div>
 <div style={{fontSize:9,color:C.text,fontWeight:500,marginTop:1}}>{m.l}</div>
 <div style={{fontSize:8,color:"#64748b",marginTop:1}}>{m.sub}</div>
 </div>
 ))}
 </div>
 {/* ─── Conseil selon objectif ─── */}
 {profil.objectif==="hypertrophie"&&<div style={{padding:"8px 10px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:8,fontSize:10,color:"#3b82f6",lineHeight:1.5}}>💪 Prise de masse : surplus de +{(OBJ.hypertrophie.surplus+(Math.min(cycles.length,4)*50))}kcal. Protéines à {obj.p}g/kg. Progression du surplus par cycle (+50kcal chaque cycle).</div>}
 {profil.objectif==="poids"&&<div style={{padding:"8px 10px",background:"rgba(249,115,22,0.06)",border:"0.5px solid rgba(249,115,22,0.15)",borderRadius:8,fontSize:10,color:"#f97316",lineHeight:1.5}}>🔥 Perte de graisse : déficit de 400kcal. Perte saine : 400-500g/semaine. Protéines élevées ({obj.p}g/kg) pour préserver le muscle. Méthode MATADOR recommandée : alterner 2 semaines déficit / 2 semaines maintien.</div>}
 {profil.objectif==="force"&&<div style={{padding:"8px 10px",background:"rgba(139,92,246,0.06)",border:"0.5px solid rgba(139,92,246,0.15)",borderRadius:8,fontSize:10,color:"#8b5cf6",lineHeight:1.5}}>🏋️ Force : léger surplus +{OBJ.force.surplus}kcal. Protéines à {obj.p}g/kg. Glucides élevés ({obj.g}g/kg) pour les performances.</div>}
 {profil.objectif==="prep_physique"&&<div style={{padding:"8px 10px",background:"rgba(234,179,8,0.06)",border:"0.5px solid rgba(234,179,8,0.2)",borderRadius:8,fontSize:10,color:"#ca8a04",lineHeight:1.5}}>⚡ Prépa physique : léger surplus +{OBJ.prep_physique?.surplus||100}kcal. Protéines à {OBJ.prep_physique?.p||1.8}g/kg. Priorité aux exercices fonctionnels et polyarticulaires pour la condition physique générale.</div>}
 {profil.objectif==="reathletisation"&&<div style={{padding:"8px 10px",background:"rgba(6,182,212,0.06)",border:"0.5px solid rgba(6,182,212,0.2)",borderRadius:8,fontSize:10,color:"#0891b2",lineHeight:1.5}}>🩺 Réathlétisation : maintenance calorique. Priorité à la récupération fonctionnelle et au renforcement progressif. Consultez un professionnel de santé pour un suivi adapté.</div>}
 </Box>}
       {/* ─── Export & Partage ─── */}
      <Box>
        <Lbl>Export & Partage</Lbl>
        <div style={{fontSize:11,color:"#64748b",marginBottom:10,lineHeight:1.5}}>Exportez vos données ou partagez votre programme.</div>
        <button onClick={()=>{
          if(!prog){push("⚠️","Aucun programme","Générez d'abord un programme.");return;}
          const txt="PROGRAMME: "+prog.titre+"\nDébut: "+prog.dateDebut+"\n\n"+prog.jours.map(j=>j.nom+" - "+j.focus+"\n"+j.exercices.map(e=>"  - "+e.nom+": "+(e.series||e.s||"3")+"×"+(e.reps||e.r||"10")+" | repos: "+(e.repos||"90s")).join("\n")).join("\n\n");
          if(navigator.share){navigator.share({title:"Mon programme MorphoCoach",text:txt});}
          else{navigator.clipboard?.writeText(txt).then(()=>push("✅","Copié !","Programme copié dans le presse-papier."));}
        }} style={{width:"100%",padding:"11px 14px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:10,color:"#3b82f6",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          📤 Partager mon programme
        </button>
        <div style={{padding:"8px 10px",background:"rgba(139,92,246,0.06)",border:"0.5px solid rgba(139,92,246,0.15)",borderRadius:8,fontSize:10,color:"#8b5cf6",lineHeight:1.5}}>
          💜 Synchro Apple Health & Google Fit — disponible dans la version app native (bientôt)
        </div>
      </Box>
      {/* ─── Export données santé ─── */}
      <Box>
        <Lbl>Exporter mes données</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <button onClick={()=>{
            const data={
              profil,
              poids_historique:weightLog,
              programme:prog?{titre:prog.titre,seances_completees:prog.jours.filter(j=>j.complete).length}:null,
              calories_cible:calObj,
              macros:{proteines:pObj+"g",glucides:gObj+"g",lipides:lObj+"g"},
              streak:getStreak,
              export_date:new Date().toLocaleDateString("fr-FR"),
            };
            const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
            const url=URL.createObjectURL(blob);
            const a=document.createElement("a");
            a.href=url;a.download=`morphocoach_${new Date().toLocaleDateString("fr-FR").replace(/\//g,"-")}.json`;
            a.click();URL.revokeObjectURL(url);
          }} style={{padding:"10px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:10,color:"#3b82f6",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>
            📥 Exporter JSON
          </button>
          <button onClick={()=>{
            const txt=`MorphoCoach — Bilan du ${new Date().toLocaleDateString("fr-FR")}
Profil: ${profil.prenom||"Anonyme"}, ${profil.poids}kg, ${profil.taille}cm
Objectif: ${OBJ[profil.objectif]?.l||""}
Calories: ${calObj} kcal/j | P: ${pObj}g | G: ${gObj}g | L: ${lObj}g
Streak: ${getStreak} jours
Programme: ${prog?.titre||"Aucun"}
Poids actuel: ${weightLog.length>0?weightLog[weightLog.length-1].v+"kg":"Non renseigné"}`;
            if(navigator.share){navigator.share({title:"Mon bilan MorphoCoach",text:txt}).catch(()=>{});}
            else{navigator.clipboard.writeText(txt).then(()=>push("✅","Copié !","Bilan copié dans le presse-papier"));}
          }} style={{padding:"10px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:10,color:"#22c55e",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>
            📤 Partager
          </button>
        </div>
        <div style={{fontSize:10,color:"#64748b",lineHeight:1.4}}>Exporte ton profil, ton historique de poids et tes statistiques. Compatible Apple Santé et Google Fit via l'import JSON.</div>
      </Box>
      <Box>
        <Lbl>Notifications</Lbl> <Lbl>Notifications</Lbl>
 {[{i:"🏋️",l:"Rappel de séance"},{i:"🥗",l:"Journal alimentaire"},{i:"💧",l:"Hydratation"},{i:"🔔",l:"Fin de cycle"}].map((n,i)=>(
 <Row key={i} style={{marginBottom:10,justifyContent:"space-between"}}>
 <Row style={{gap:10}}><span style={{fontSize:17}}>{n.i}</span><span style={{fontSize:12,fontWeight:500}}>{n.l}</span></Row>
 <div style={{width:34,height:19,borderRadius:10,background:C.green,display:"flex",alignItems:"center",paddingRight:3}}>
 <div style={{width:13,height:13,borderRadius:"50%",background:"white",marginLeft:"auto"}}/>
 </div>
 </Row>
 ))}
 <button onClick={()=>push("🔔","Test réussi !","Les notifications fonctionnent correctement.")} style={{background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:7,padding:"7px 14px",color:C.gold,cursor:"pointer",fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:700}}>Tester les notifications</button>
 </Box>
 </div>
 );
}
