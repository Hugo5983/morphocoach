import {{ useState, useRef, useEffect, useCallback, useMemo }} from "react";
import {{ C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS }} from "../data/constants.js";
import {{ FOODS }} from "../data/foods.js";
import {{ EX }} from "../data/exercises.js";
import {{ MOTIVATIONS }} from "../data/motivations.js";
import {{ Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart }} from "../components/ui/index.jsx";

// ─── SEANCES ──────────────────────────────────────────────────────────────

 export default function Seances(props){
 const { prog, setProg, push, setChrono, setChronoSec, seance, setSeance, exDetails, setExDetails, exEdit, setExEdit, openSeance, C, INT } = props;
 if(!prog)return Calendar();
 if(seance!==null){
 const s=prog.jours[seance];
 const int=INT[s.intensite||"modere"];
 return(
 <div style={{padding:"0 15px"}}>
 <button onClick={()=>setSeance(null)} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px 0",marginBottom:10,display:"flex",alignItems:"center",gap:5}}>← Retour</button>
 <div style={{padding:"13px 14px",background:`${int.c}14`,border:`1px solid ${int.c}30`,borderRadius:11,marginBottom:10}}>
 <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,letterSpacing:-0.5,fontWeight:300}}>{s.nom}</div>
 <div style={{fontSize:11,color:"#64748b"}}>{s.focus} · {s.duree}</div>
 </div>
 <button onClick={()=>setChrono(true)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500,marginBottom:10}}>⏱ Chronomètre de repos</button>
 {s.exercices.map((ex,j)=>{
 const last=ex.historique.length>0?ex.historique[ex.historique.length-1]:null;
 const gain=ex.historique.length>1?(parseFloat(ex.historique[ex.historique.length-1].poids)-parseFloat(ex.historique[0].poids)):0;
 const cc={principal:C.gold,correctif:C.red,mobilite:C.blue,gainage:C.green,isolation:C.purple}[ex.cat||"principal"]||C.gold;
 const exInfo=D[ex.nom]||null;
 const showDetails=!!exDetails[j];
 const editParams=!!exEdit[j];
 return(
 <Box key={j} style={{borderLeft:`2px solid ${cc}`}}>
 {/* Titre + actions */}
 <Row style={{justifyContent:"space-between",marginBottom:8}}>
 <div style={{flex:1}}>
 <div style={{fontSize:13,fontWeight:500}}>{ex.nom}</div>
 <div style={{fontSize:9,padding:"2px 7px",background:`${cc}18`,border:`1px solid ${cc}30`,borderRadius:5,color:cc,textTransform:"uppercase",letterSpacing:"0.5px",display:"inline-block",marginTop:3}}>{ex.cat}</div>
 </div>
 <div style={{display:"flex",gap:5}}>
 {gain>0&&<span style={{fontSize:10,color:C.green,fontWeight:700,alignSelf:"center"}}>+{gain}kg</span>}
 <button onClick={()=>setExEdit(e=>({...e,[j]:!e[j]}))} style={{padding:"4px 8px",background:editParams?"rgba(212,168,83,0.15)":C.s2,border:`1px solid ${editParams?C.gold:C.s3}`,borderRadius:6,color:editParams?C.gold:"#64748b",cursor:"pointer",fontSize:10,fontFamily:"'Inter',sans-serif"}}>✏️</button>
 <button onClick={()=>setExDetails(e=>({...e,[j]:!e[j]}))} style={{padding:"4px 8px",background:showDetails?"rgba(77,143,224,0.15)":C.s2,border:`1px solid ${showDetails?C.blue:C.s3}`,borderRadius:6,color:showDetails?C.blue:"#64748b",cursor:"pointer",fontSize:10,fontFamily:"'Inter',sans-serif"}}>{showDetails?"▲":"▼"}</button>
 </div>
 </Row>
 {/* Params — affichage ou modification */}
 {!editParams?(
 <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
 {[{l:"Séries",v:ex.series},{l:"Reps",v:ex.reps},{l:"Repos",v:ex.repos},{l:"Charge",v:ex.charge}].filter(s=>s.v).map(s=>(
 <div key={s.l} style={{padding:"5px 10px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:8,textAlign:"center",minWidth:52}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,color:"#3b82f6",fontWeight:400}}>{s.v}</div>
 <div style={{fontSize:9,color:"#64748b",marginTop:1}}>{s.l}</div>
 </div>
 ))}
 </div>
 ):(
 <div style={{background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:10,padding:"12px",marginBottom:10}}>
 <div style={{fontSize:10,color:"#3b82f6",fontWeight:600,letterSpacing:"0.5px",marginBottom:10}}>MODIFIER LES PARAMÈTRES</div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
 {[
 {l:"Séries",k:"series",v:ex.series},
 {l:"Reps",k:"reps",v:ex.reps},
 {l:"Repos",k:"repos",v:ex.repos},
 {l:"Charge",k:"charge",v:ex.charge},
 ].map(p=>(
 <div key={p.k}>
 <div style={{fontSize:9,color:"#64748b",marginBottom:4,fontWeight:500}}>{p.l}</div>
 <div style={{display:"flex",alignItems:"center",gap:4}}>
 <button onClick={()=>{
 const u=[...prog.jours];
 const cur=u[seance].exercices[j][p.k]||"";
 const num=parseFloat(cur);
 if(!isNaN(num)&&num>0) u[seance].exercices[j][p.k]=String(Math.max(0,p.k==="repos"?num-15:num-1));
 setProg({...prog,jours:u});
 }} style={{width:26,height:26,borderRadius:6,background:"#ffffff",border:"0.5px solid #dce8f4",color:"#3b82f6",cursor:"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
 <input value={p.v} onChange={e=>{
 const u=[...prog.jours];
 u[seance].exercices[j][p.k]=e.target.value;
 setProg({...prog,jours:u});
 }} style={{flex:1,padding:"5px 6px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:6,color:C.text,fontSize:12,fontFamily:"'Inter',sans-serif",textAlign:"center"}}/>
 <button onClick={()=>{
 const u=[...prog.jours];
 const cur=u[seance].exercices[j][p.k]||"";
 const num=parseFloat(cur);
 if(!isNaN(num)) u[seance].exercices[j][p.k]=String(p.k==="repos"?num+15:num+1);
 setProg({...prog,jours:u});
 }} style={{width:26,height:26,borderRadius:6,background:"#3b82f6",border:"none",color:"#ffffff",cursor:"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
 </div>
 </div>
 ))}
 </div>
 <button onClick={()=>setExEdit(e=>({...e,[j]:false}))} style={{marginTop:10,width:"100%",padding:"8px",background:"rgba(34,197,94,0.1)",border:"0.5px solid rgba(34,197,94,0.3)",borderRadius:7,color:"#22c55e",cursor:"pointer",fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:600}}>✓ Enregistrer</button>
 </div>
 )}
 {/* Morpho tip */}
 {ex.morpho_tip&&<div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:"#64748b",lineHeight:1.5,marginBottom:6}}><span style={{color:C.gold,fontWeight:700}}>Morpho · </span>{ex.morpho_tip}</div>}
 {/* Détails dépliables : tips + erreurs + variantes */}
 {showDetails&&(
 <div style={{borderTop:`1px solid ${C.s3}`,paddingTop:10,marginTop:4,marginBottom:8}}>
 {/* Morpho depuis D */}
 {exInfo?.m&&(
 <div style={{padding:"8px 10px",background:C.goldD,borderRadius:7,fontSize:11,color:"#64748b",lineHeight:1.5,marginBottom:8}}>
 <span style={{color:C.gold,fontWeight:700}}>Morpho · </span>{exInfo.m}
 </div>
 )}
 {/* Technique personnalisée */}
 {ex.technique&&(
 <div style={{marginBottom:8}}>
 <div style={{fontSize:9,color:C.blue,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>Technique</div>
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.6,fontStyle:"italic"}}>⟡ {ex.technique}</div>
 </div>
 )}
 {/* Tips */}
 {exInfo?.t?.length>0&&(
 <div style={{marginBottom:8}}>
 <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Tips</div>
 {exInfo.t.map((tip,ti)=>(
 <div key={ti} style={{display:"flex",gap:7,marginBottom:4}}>
 <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(62,199,122,0.12)",border:"1px solid rgba(62,199,122,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0,marginTop:1}}>{ti+1}</div>
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{tip}</div>
 </div>
 ))}
 </div>
 )}
 {/* Variantes */}
 {exInfo?.v?.length>0&&(
 <div style={{marginBottom:8}}>
 <div style={{fontSize:9,color:"#f97316",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Variantes</div>
 {exInfo.v.map((v,vi)=>(
 <div key={vi} style={{padding:"5px 8px",background:C.s2,borderRadius:6,marginBottom:4,fontSize:11,color:C.text}}>{v}</div>
 ))}
 </div>
 )}
 {/* Erreurs */}
 {exInfo?.e?.length>0&&(
 <div style={{marginBottom:8}}>
 <div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Erreurs à éviter</div>
 {exInfo.e.map((err,ei)=>(
 <div key={ei} style={{display:"flex",gap:7,marginBottom:4}}>
 <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(224,72,72,0.1)",border:"1px solid rgba(224,72,72,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.red,flexShrink:0,marginTop:1}}>✕</div>
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{err}</div>
 </div>
 ))}
 </div>
 )}
 {ex.patho_tip&&(
 <div style={{padding:"7px 9px",background:"rgba(224,72,72,0.08)",border:"1px solid rgba(224,72,72,0.2)",borderRadius:7,fontSize:11,color:C.red,lineHeight:1.5}}>
 ⚠️ {ex.patho_tip}
 </div>
 )}
 </div>
 )}
 {/* Progression intégrée */}
 {ex.historique?.length>0&&(
 <div style={{marginBottom:10,padding:"10px 12px",background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:10}}>
 <div style={{fontSize:9,color:"#3b82f6",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>📈 Progression</div>
 {ex.historique.length>=2&&(
 <div style={{marginBottom:8}}>
 {(()=>{
 const hist=ex.historique.map(h=>({...h,poids:parseFloat(h.poids)||0}));
 const W=260,H=60,PAD=6;
 const vals=hist.map(h=>h.poids);
 const mn=Math.min(...vals),mx=Math.max(...vals);
 const sp=mx-mn||0.5;
 const gx=i=>(i/(hist.length-1||1))*(W-PAD*2)+PAD;
 const gy=v=>H-PAD-((v-mn)/sp)*(H-PAD*2-10);
 const pts=hist.map((h,i)=>`${gx(i)},${gy(h.poids)}`).join(" ");
 const area=`${PAD},${H-PAD} `+hist.map((h,i)=>`${gx(i)},${gy(h.poids)}`).join(" ")+` ${gx(hist.length-1)},${H-PAD}`;
 const best=Math.max(...vals);
 const diff=vals.length>1?vals[vals.length-1]-vals[0]:0;
 return(<>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:300,color:"#3b82f6",lineHeight:1}}>{vals[vals.length-1]}<span style={{fontSize:9,color:"#64748b",marginLeft:2}}>kg dernier</span></div>
 <div style={{textAlign:"right"}}>
 <div style={{fontSize:13,fontWeight:400,color:diff>=0?C.green:C.red}}>{diff>=0?"+":""}{diff.toFixed(1)}kg</div>
 <div style={{fontSize:8,color:"#64748b"}}>depuis début</div>
 </div>
 <div style={{textAlign:"right"}}>
 <div style={{fontSize:13,fontWeight:400,color:C.gold}}>🏆 {best}kg</div>
 <div style={{fontSize:8,color:"#64748b"}}>record</div>
 </div>
 </div>
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H,display:"block",overflow:"visible"}}>
 <defs><linearGradient id={`hg${j}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient></defs>
 {[0.33,0.66].map(r=><line key={r} x1={PAD} y1={PAD+r*(H-PAD*2)} x2={W-PAD} y2={PAD+r*(H-PAD*2)} stroke="#dce8f4" strokeWidth="0.5"/>)}
 <polygon points={area} fill={`url(#hg${j})`}/>
 <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
 {hist.map((h,i)=>{
 const x=gx(i),y=gy(h.poids);
 return(<g key={i}>
 <circle cx={x} cy={y} r="3" fill="#fff" stroke="#3b82f6" strokeWidth="1.5"/>
 {(i===0||i===hist.length-1)&&<text x={x} y={H-1} textAnchor={i===0?"start":"end"} fontSize="6.5" fill="#64748b" fontFamily="Inter">{h.date}</text>}
 </g>);
 })}
 </svg>
 </>);
 })()}
 </div>
 )}
 <div style={{maxHeight:100,overflowY:"auto"}}>
 {[...ex.historique].reverse().map((h,k)=>(
 <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:k<ex.historique.length-1?"0.5px solid #dce8f4":"none",fontSize:10}}>
 <span style={{color:"#64748b"}}>{h.date}</span>
 <span style={{color:"#3b82f6",fontWeight:500}}>{h.poids}kg × {h.reps}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 {/* Saisie */}
 <Row style={{gap:6,marginTop:8}}>
 <Inp style={{flex:1,marginBottom:0}} type="number" placeholder={last?`Dernier: ${last.poids}kg`:"Poids (kg)"} id={`p${j}`}/>
 <Inp style={{width:66,marginBottom:0}} type="number" placeholder="Reps" id={`r${j}`}/>
 <button onClick={()=>{
 const p=document.getElementById(`p${j}`)?.value;const r=document.getElementById(`r${j}`)?.value;
 if(!p)return;
 const u=[...prog.jours];u[seance].exercices[j].historique.push({poids:parseFloat(p),reps:r||ex.reps,date:new Date().toLocaleDateString("fr-FR")});
 setProg({...prog,jours:u});document.getElementById(`p${j}`).value="";document.getElementById(`r${j}`).value="";
 // Auto-start avec durée de repos de l'exercice
 const reposStr=ex.repos||"90s";
 const reposSec=reposStr.includes("min")?parseInt(reposStr)*60:parseInt(reposStr)||90;
 setChronoSec(reposSec);
 setChrono(true);
 }} style={{height:40,padding:"0 13px",background:"rgba(56,199,117,.12)",border:"1px solid rgba(56,199,117,.3)",borderRadius:7,color:C.green,cursor:"pointer",fontSize:20}}>+</button>
 </Row>
 <Inp style={{marginTop:6,marginBottom:0,fontSize:11}} placeholder="Note technique ou ressenti…" value={ex.note||""} onChange={e=>{const u=[...prog.jours];u[seance].exercices[j].note=e.target.value;setProg({...prog,jours:u});}}/>
 </Box>
 );
 })}
 <Lbl style={{marginTop:8}}>Note de séance</Lbl>
 <textarea style={{width:"100%",padding:"11px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.text,fontSize:13,minHeight:65,resize:"vertical",marginBottom:8,fontFamily:"'Inter',sans-serif"}} placeholder="Comment s'est passée la séance ?" value={s.note||""} onChange={e=>{const u=[...prog.jours];u[seance].note=e.target.value;setProg({...prog,jours:u});}}/>
 <Btn onClick={()=>{const u=[...prog.jours];u[seance].complete=true;u[seance].date=new Date().toLocaleDateString("fr-FR");setProg({...prog,jours:u});push("🏆","Séance terminée !","Bravo ! Progression enregistrée.");setSeance(null);}}>✓ Séance terminée</Btn>
 </div>
 );
 }
 return(
 <div style={{padding:"0 15px"}}>
 {prog.jours.map((j,i)=>{
 const int=INT[j.intensite||"modere"];
 return(
 <Box key={i} onClick={()=>openSeance(i)} style={{cursor:"pointer",borderColor:`${int.c}20`}}>
 <Row style={{justifyContent:"space-between"}}>
 <div style={{flex:1}}>
 <Row style={{gap:7,marginBottom:5}}>
 <div style={{width:6,height:6,borderRadius:"50%",background:int.c}}/>
 <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>{int.l}</div>
 {j.complete&&<div style={{fontSize:9,color:C.green,marginLeft:"auto"}}>✓ {j.date}</div>}
 </Row>
 <div style={{fontWeight:500,fontSize:14}}>{j.nom}</div>
 <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{j.focus} · {j.exercices.length} ex.</div>
 </div>
 <div style={{color:C.dim,fontSize:18}}>›</div>
 </Row>
 {j.exercices.some(ex=>ex.historique.length>0)&&(
 <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:4}}>
 {j.exercices.filter(ex=>ex.historique.length>0).slice(0,3).map((ex,k)=>(
 <div key={k} style={{padding:"2px 8px",background:"rgba(56,199,117,.1)",border:"1px solid rgba(56,199,117,.2)",borderRadius:5,fontSize:10,color:C.green,fontWeight:600}}>{ex.nom.split(" ")[0]} {ex.historique[ex.historique.length-1].poids}kg</div>
 ))}
 </div>
 )}
 </Box>
 );
 })}
 <button onClick={()=>setChrono(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:13,background:"transparent",border:"0.5px solid #dce8f4",borderRadius:11,color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",marginBottom:8}}>⏱ Chronomètre de repos</button>
 </div>
 );
 }
}