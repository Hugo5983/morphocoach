import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "../../data/constants.js";
import { FOODS } from "../../data/foods.js";
import { EX } from "../../data/exercises.js";
import { MOTIVATIONS } from "../../data/motivations.js";
import { Box, Lbl, Inp, Btn, Bar, Row, G2, Tag, MiniChart } from "../../components/ui/index.jsx";
import { Ring, MiniRing } from "./components/MacroRing.jsx";
import { WaterTracker } from "./components/WaterTracker.jsx";
import { computeHealthScore } from "./utils/healthScore.js";

// ─── NUTRITION ──────────────────────────────────────────────────────────────

 export default function Nutrition(props){
 const { profil, prog, push, repas, setRepas, myFoods, setMyFoods, eau, setEau, scanRes, setScanRes, obj, calObj, pObj, lObj, gObj, totR, handleScan, C, FOODS } = props;
 const [nView, setNView] = useState("journal");
 const [repasA, setRepasA] = useState("matin");
 const [search, setSearch] = useState("");
 const [newFood, setNewFood] = useState({nom:"",cal:"",p:"",g:"",l:""});
 const [scanCode, setScan] = useState("");
 const tot=totR;
 const all=[...FOODS,...myFoods];
 const filtered=search?all.filter(f=>f.n.toLowerCase().includes(search.toLowerCase())):[];

 // Score santé via util (extrait dans utils/healthScore.js)
 const { score, lettre: scoreLettre, color: scoreColor, details: scoreDetails } = computeHealthScore(repas, eau, tot, pObj);


 const calLeft=Math.max(0,calObj-tot.cal);
 const calPct=Math.min(100,tot.cal/calObj*100);

 return(
 <div style={{background:C.bg,minHeight:"100vh",paddingBottom:20}} className="anim">
 {/* Header */}
 <div style={{padding:"22px 16px 12px"}}>
 <div style={{fontSize:9,letterSpacing:"1.5px",color:"#64748b",fontWeight:500,marginBottom:6,textTransform:"uppercase"}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:300,color:"#0f1a2e",letterSpacing:-1,lineHeight:1.1,marginBottom:2}}>Bonjour, <span style={{fontWeight:500,color:"#3b82f6"}}>{profil.prenom||"Hugo"}</span></div>
 <div style={{fontSize:11,color:"#64748b"}}>{obj.l} · Cycle {prog?.numero||1}</div>
 </div>

 {/* Nav */}
 <div style={{display:"flex",gap:5,padding:"12px 15px",overflowX:"auto",paddingBottom:4}}>
 {[{id:"journal",l:"Journal"},{id:"scanner",l:"Scanner"},{id:"aliments",l:"Aliments"}].map(s=>(
 <button key={s.id} onClick={()=>setNView(s.id)} style={{padding:"7px 16px",background:nView===s.id?"rgba(59,130,246,0.08)":"transparent",border:`0.5px solid ${nView===s.id?"#3b82f6":"#dce8f4"}`,borderRadius:20,color:nView===s.id?"#3b82f6":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap",fontFamily:"'Syne',sans-serif",letterSpacing:"0.3px"}}>{s.l}</button>
 ))}
 </div>

 {nView==="journal"&&(
 <div style={{padding:"0 15px"}}>
 {/* Anneau principal calories */}
 <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 16px",background:"#ffffff",borderRadius:18,marginBottom:12,border:"0.5px solid #dce8f4"}}>
 <Ring pct={calPct} color={tot.cal>calObj?"#f87171":"#3b82f6"} size={120} stroke={10}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:tot.cal>calObj?C.red:C.text,lineHeight:1,letterSpacing:-1}}>{calLeft}</div>
 <div style={{fontSize:9,color:"#64748b",marginTop:2}}>kcal restantes</div>
 </Ring>
 <div style={{flex:1,marginLeft:20}}>
 <div style={{marginBottom:10}}>
 <Row style={{justifyContent:"space-between",marginBottom:3}}>
 <span style={{fontSize:11,color:"#64748b"}}>Consommé</span>
 <span style={{fontSize:12,fontWeight:500,color:tot.cal>calObj?C.red:C.text}}>{tot.cal} kcal</span>
 </Row>
 <Row style={{justifyContent:"space-between",marginBottom:3}}>
 <span style={{fontSize:11,color:"#64748b"}}>Objectif</span>
 <span style={{fontSize:12,fontWeight:500}}>{calObj} kcal</span>
 </Row>
 <Row style={{justifyContent:"space-between"}}>
 <span style={{fontSize:11,color:"#64748b"}}>Objectif</span>
 <span style={{fontSize:11,color:C.gold}}>{obj.l}</span>
 </Row>
 </div>
 {/* Score */}
 <div onClick={()=>setNView("score")} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:`${scoreColor}15`,border:`1px solid ${scoreColor}30`,borderRadius:9,cursor:"pointer"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:scoreColor,lineHeight:1}}>{scoreLettre}</div>
 <div>
 <div style={{fontSize:10,fontWeight:700,color:scoreColor}}>Score santé</div>
 <div style={{fontSize:9,color:"#64748b"}}>{score}/100 · Voir détail</div>
 </div>
 </div>
 </div>
 </div>

 {/* Mini anneaux macros */}
 <div style={{display:"flex",justifyContent:"space-around",padding:"14px 16px",background:"#ffffff",borderRadius:16,marginBottom:12,border:"0.5px solid #dce8f4"}}>
 <MiniRing pct={tot.p/pObj*100} color={C.red} label="Protéines" v={tot.p} max={pObj}/>
 <div style={{width:1,background:C.s3}}/>
 <MiniRing pct={tot.g/gObj*100} color={C.orange} label="Glucides" v={tot.g} max={gObj}/>
 <div style={{width:1,background:C.s3}}/>
 <MiniRing pct={tot.l/lObj*100} color={C.green} label="Lipides" v={tot.l} max={lObj}/>
 </div>

 {/* Eau */}
 <WaterTracker eau={eau} setEau={setEau}/>

 {/* Repas */}
 {[{id:"matin",l:"Petit-déjeuner",i:"☀️"},{id:"midi",l:"Déjeuner",i:"🍽️"},{id:"soir",l:"Dîner",i:"🌙"},{id:"snack",l:"Collation",i:"🍎"}].map(r=>{
 const rTot=repas[r.id].reduce((a,f)=>({cal:a.cal+f.c,p:a.p+f.p,g:a.g+f.g,l:a.l+f.l}),{cal:0,p:0,g:0,l:0});
 const isActive=repasA===r.id;
 return(
 <div key={r.id} style={{background:"#ffffff",borderRadius:14,marginBottom:8,border:`0.5px solid ${isActive?'#C8963E':'#1e1a10'}`,overflow:"hidden"}}>
 {/* Header repas */}
 <div onClick={()=>setRepasA(isActive?null:r.id)} style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
 <div style={{width:34,height:34,borderRadius:9,background:"#e4eef8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{r.i}</div>
 <div style={{flex:1}}>
 <div style={{fontSize:12,fontWeight:500,color:"#0f1a2e"}}>{r.l}</div>
 <div style={{fontSize:10,color:"#64748b"}}>{repas[r.id].length>0?`${repas[r.id].length} aliment${repas[r.id].length>1?"s":""}`:"Aucun aliment"}</div>
 {rTot.cal>0&&(
 <div style={{display:"flex",gap:3,marginTop:4}}>
 <div style={{height:2,borderRadius:1,background:"#C8963E",flex:rTot.cal,maxWidth:"60%"}}/>
 <div style={{height:2,borderRadius:1,background:"#dce8f4",flex:calObj}}/>
 </div>
 )}
 </div>
 <div style={{display:"flex",alignItems:"center",gap:8}}>
 {rTot.cal>0&&<span style={{fontSize:14,fontWeight:300,color:"#C8963E"}}>{rTot.cal}</span>}
 <span style={{fontSize:14,color:"#c4d4e8",transform:isActive?"rotate(180deg)":"none",transition:"transform.2s"}}>⌄</span>
 </div>
 </div>
 {/* Aliments */}
 {isActive&&(
 <div style={{borderTop:`1px solid ${C.s3}`,padding:"10px 14px"}}>
 {repas[r.id].length===0&&<div style={{fontSize:12,color:C.dim,textAlign:"center",padding:"8px 0"}}>Aucun aliment ajouté</div>}
 {repas[r.id].map((item,i)=>(
 <Row key={i} style={{justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.s3}`}}>
 <div style={{flex:1}}>
 <div style={{fontSize:12,fontWeight:600}}>{item.n}</div>
 <Row style={{gap:8,marginTop:2}}>
 <span style={{fontSize:9,color:C.red}}>P:{item.p}g</span>
 <span style={{fontSize:9,color:C.orange}}>G:{item.g}g</span>
 <span style={{fontSize:9,color:C.green}}>L:{item.l}g</span>
 </Row>
 </div>
 <Row style={{gap:8,alignItems:"center"}}>
 <span style={{fontSize:12,fontWeight:500,color:C.gold}}>{item.c}</span>
 <span style={{fontSize:9,color:"#64748b"}}>kcal</span>
 <button onClick={()=>setRepas(rp=>({...rp,[r.id]:rp[r.id].filter((_,j)=>j!==i)}))} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:15,padding:"0 4px"}}>×</button>
 </Row>
 </Row>
 ))}
 {/* Recherche rapide */}
 <Inp style={{marginTop:10,marginBottom:6}} placeholder="🔍 Ajouter un aliment…" value={search} onChange={e=>setSearch(e.target.value)}/>
 {search&&filtered.length>0&&(
 <div style={{maxHeight:180,overflowY:"auto",borderRadius:9,border:"0.5px solid #dce8f4"}}>
 {filtered.map((item,i)=>(
 <div key={i} onClick={()=>{setRepas(rp=>({...rp,[r.id]:[...rp[r.id],item]}));setSearch("");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:C.s2,borderBottom:`1px solid ${C.s3}`,cursor:"pointer"}}>
 <div><div style={{fontSize:12}}>{item.n}</div><div style={{fontSize:10,color:"#64748b"}}>{item.c}kcal</div></div>
 <span style={{color:C.gold,fontSize:18}}>+</span>
 </div>
 ))}
 </div>
 )}
 {/* Bibliothèque rapide */}
 <div style={{marginTop:8}}>
 <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:4}}>
 {[...new Set(FOODS.map(f=>f.cat))].map(cat=>(
 <button key={cat} style={{padding:"4px 10px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:12,color:"#64748b",cursor:"pointer",fontSize:10,whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif"}} onClick={()=>{}}>{cat}</button>
 ))}
 </div>
 <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
 {FOODS.filter(f=>!search||f.cat===search).slice(0,8).map((f,i)=>(
 <div key={i} onClick={()=>setRepas(rp=>({...rp,[r.id]:[...rp[r.id],f]}))} style={{padding:"5px 10px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:8,cursor:"pointer",fontSize:10,color:C.text}}>
 {f.n.split("(")[0].trim()} <span style={{color:C.gold}}>{f.c}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}

 {nView==="score"&&(
 <div style={{padding:"0 15px"}}>
 <button onClick={()=>setNView("journal")} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px 0",marginBottom:10,display:"flex",alignItems:"center",gap:5}}>← Retour</button>
 <Box>
 <Row style={{justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
 <div>
 <Lbl style={{marginBottom:4}}>Score santé du jour</Lbl>
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>Basé sur la qualité de vos aliments<br/>et vos comportements nutritionnels</div>
 </div>
 <div style={{textAlign:"center"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:48,fontWeight:300,color:scoreColor,lineHeight:1,letterSpacing:-2}}>{scoreLettre}</div>
 <div style={{fontSize:10,color:"#64748b"}}>{score}/100</div>
 </div>
 </Row>
 <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden",marginBottom:16}}>
 <div style={{height:"100%",width:`${score}%`,background:`linear-gradient(90deg,${C.red},${C.orange},${C.green})`,borderRadius:3,transition:"width.8s"}}/>
 </div>
 {scoreDetails.map((d,i)=>(
 <Row key={i} style={{padding:"10px 0",borderBottom:i<scoreDetails.length-1?`1px solid ${C.s3}`:"none",justifyContent:"space-between"}}>
 <Row style={{gap:10}}>
 <span style={{fontSize:18}}>{d.icon}</span>
 <span style={{fontSize:12}}>{d.l}</span>
 </Row>
 <div style={{width:22,height:22,borderRadius:"50%",background:d.ok?"rgba(62,199,122,0.15)":"rgba(224,82,82,0.15)",border:`1px solid ${d.ok?"rgba(62,199,122,0.4)":"rgba(224,82,82,0.4)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:d.ok?C.green:C.red}}>{d.ok?"✓":"✕"}</div>
 </Row>
 ))}
 <div style={{marginTop:14,padding:"10px 12px",background:C.s2,borderRadius:9,fontSize:11,color:"#64748b",lineHeight:1.6}}>
 💡 {score>=85?"Excellente journée nutritionnelle ! Continuez comme ça.":score>=70?"Bonne journée, quelques petits ajustements possibles.":score>=55?"Journée correcte. Pensez à l'hydratation et la diversité.":score>=40?"Des efforts à faire sur la qualité alimentaire.":"Journée difficile nutritionnellement. Revenez aux bases demain."}
 </div>
 </Box>
 </div>
 )}

 {nView==="scanner"&&(
 <div style={{padding:"0 15px"}}>
 <Box>
 <Lbl>Scanner un produit</Lbl>
 <div style={{padding:"9px 11px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,fontSize:11,color:"#64748b",marginBottom:12,lineHeight:1.6}}>Base Open Food Facts · 3 millions de produits</div>
 <Inp placeholder="Code-barres EAN (ex: 3017620422003)" inputMode="numeric" value={scanCode} onChange={e=>{setScan(e.target.value);if(e.target.value.length>=8)handleScan(e.target.value);}}/>
 {scanRes&&!scanRes.error&&(
 <div style={{padding:12,background:"rgba(62,199,122,.08)",border:"1px solid rgba(62,199,122,.2)",borderRadius:10,marginBottom:8}}>
 <div style={{fontWeight:500,fontSize:14,color:C.green,marginBottom:8}}>{scanRes.n}</div>
 <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
 {[{l:`${scanRes.c} kcal`,c:C.gold},{l:`P: ${scanRes.p}g`,c:C.red},{l:`G: ${scanRes.g}g`,c:C.orange},{l:`L: ${scanRes.l}g`,c:C.green}].map(s=>(
 <div key={s.l} style={{padding:"4px 9px",background:`${s.c}14`,border:`1px solid ${s.c}28`,borderRadius:6,fontSize:11,color:s.c,fontWeight:600}}>{s.l}</div>
 ))}
 </div>
 <div style={{display:"flex",gap:7}}>
 {[{id:"matin",l:"Matin"},{id:"midi",l:"Midi"},{id:"soir",l:"Soir"},{id:"snack",l:"Snack"}].map(r=>(
 <button key={r.id} onClick={()=>{setRepas(rp=>({...rp,[r.id]:[...rp[r.id],scanRes]}));setScanRes(null);setScan("");setNView("journal");push("✅","Ajouté !",`${scanRes.n} ajouté au ${r.l.toLowerCase()}.`);}} style={{flex:1,padding:"7px 4px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:7,color:C.text,cursor:"pointer",fontSize:10,fontFamily:"'Syne',sans-serif",fontWeight:600}}>{r.l}</button>
 ))}
 </div>
 <button onClick={()=>{setMyFoods(f=>[...f,{...scanRes,id:Date.now()}]);setScanRes(null);setScan("");}} style={{marginTop:8,width:"100%",padding:"7px",background:"transparent",border:"0.5px solid #dce8f4",borderRadius:7,color:"#64748b",cursor:"pointer",fontSize:11,fontFamily:"'Inter',sans-serif"}}>💾 Sauvegarder dans ma bibliothèque</button>
 </div>
 )}
 {scanRes?.error&&<div style={{padding:"9px 11px",background:"rgba(224,82,82,.08)",border:"1px solid rgba(224,82,82,.2)",borderRadius:8,fontSize:11,color:C.red}}>Produit non trouvé. Ajoutez-le manuellement.</div>}
 </Box>
 </div>
 )}

 {nView==="aliments"&&(
 <div style={{padding:"0 15px"}}>
 <Box>
 <Lbl>Ajouter un aliment</Lbl>
 <Inp placeholder="Nom (ex: Mon pain maison 100g)" value={newFood.nom} onChange={e=>setNewFood({...newFood,nom:e.target.value})}/>
 <G2><Inp type="number" placeholder="Calories" style={{marginBottom:0}} value={newFood.cal} onChange={e=>setNewFood({...newFood,cal:e.target.value})}/><Inp type="number" placeholder="Protéines (g)" style={{marginBottom:0}} value={newFood.p} onChange={e=>setNewFood({...newFood,p:e.target.value})}/></G2>
 <G2 style={{marginTop:6}}><Inp type="number" placeholder="Glucides (g)" style={{marginBottom:0}} value={newFood.g} onChange={e=>setNewFood({...newFood,g:e.target.value})}/><Inp type="number" placeholder="Lipides (g)" style={{marginBottom:0}} value={newFood.l} onChange={e=>setNewFood({...newFood,l:e.target.value})}/></G2>
 <Btn disabled={!newFood.nom||!newFood.cal} onClick={()=>{setMyFoods(f=>[...f,{id:Date.now(),n:newFood.nom,c:parseInt(newFood.cal)||0,p:parseInt(newFood.p)||0,g:parseInt(newFood.g)||0,l:parseInt(newFood.l)||0,cat:"Personnel"}]);setNewFood({nom:"",cal:"",p:"",g:"",l:""});push("✅","Aliment ajouté !","Disponible dans votre bibliothèque.");}} style={{marginTop:8}}>+ Ajouter</Btn>
 </Box>
 {myFoods.length>0&&(
 <Box>
 <Lbl>Mes aliments ({myFoods.length})</Lbl>
 {myFoods.map((f,i)=>(
 <Row key={i} style={{justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.s3}`}}>
 <div style={{flex:1}}>
 <div style={{fontSize:12,fontWeight:600}}>{f.n}</div>
 <Row style={{gap:8,marginTop:2}}>
 <span style={{fontSize:9,color:C.gold}}>{f.c}kcal</span>
 <span style={{fontSize:9,color:C.red}}>P:{f.p}g</span>
 <span style={{fontSize:9,color:C.orange}}>G:{f.g}g</span>
 <span style={{fontSize:9,color:C.green}}>L:{f.l}g</span>
 </Row>
 </div>
 <button onClick={()=>setRepas(rp=>({...rp,[repasA]:[...rp[repasA],f]}))} style={{padding:"5px 11px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:7,color:C.gold,cursor:"pointer",fontSize:11,fontFamily:"'Syne',sans-serif",fontWeight:700}}>+</button>
 </Row>
 ))}
 </Box>
 )}
 </div>
 )}
 </div>
 );
 }

