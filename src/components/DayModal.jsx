import { useState } from "react";
import { C, INT, SESS_COLORS } from "../data/constants.js";
import { Lbl, Inp, Btn, Row } from "./ui/index.jsx";

export default function DayModal({date,session,onSave,onDelete,onClose}){
 const [nom,setNom]=useState(session?.nom||"");
 const [intensite,setInt]=useState(session?.intensite||"modere");
 const [color,setColor]=useState(session?.color||SESS_COLORS[0]);
 return(
 <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:18}}>
 <div style={{background:C.s1,border:"0.5px solid #dce8f4",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:360}}>
 <Lbl>Séance du {date}</Lbl>
 {session&&(
 <Row style={{justifyContent:"space-between",marginBottom:12,padding:"8px 10px",background:C.s2,borderRadius:8}}>
 <span style={{fontSize:12,color:session.color,fontWeight:500}}>{session.nom}</span>
 <button onClick={()=>{onDelete();onClose();}} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:12,fontWeight:500}}>Supprimer</button>
 </Row>
 )}
 <Inp placeholder="Nom de la séance" value={nom} onChange={e=>setNom(e.target.value)}/>
 <Lbl style={{marginTop:4}}>Intensité</Lbl>
 <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
 {Object.entries(INT).map(([k,v])=>(
 <div key={k} onClick={()=>{setInt(k);setColor(v.c);}} style={{padding:"5px 10px",background:intensite===k?`${v.c}20`:C.s2,border:`1px solid ${intensite===k?v.c:C.s3}`,borderRadius:7,cursor:"pointer",fontSize:11,color:intensite===k?v.c:"#64748b",fontWeight:intensite===k?700:400}}>{v.l}</div>
 ))}
 </div>
 <Lbl>Couleur</Lbl>
 <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
 {SESS_COLORS.map(c=>(
 <div key={c} onClick={()=>setColor(c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",outline:color===c?"2px solid white":"none",outlineOffset:2}}/>
 ))}
 </div>
 <Btn disabled={!nom} onClick={()=>{onSave({nom,intensite,color});onClose();}}>✓ Enregistrer</Btn>
 <Btn v="ghost" onClick={onClose}>Annuler</Btn>
 </div>
 </div>
 );
}
