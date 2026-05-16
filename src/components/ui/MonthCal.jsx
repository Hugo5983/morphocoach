import { useState, memo } from "react";
import { C, INT, SESS_COLORS } from "../../data/constants.js";
import { Box, Lbl, Inp, Btn, Row } from "./index.jsx";

// ─── MODAL UN JOUR ───────────────────────────────────────────────────────────
export function DayModal({ date, session, onSave, onDelete, onClose }) {
  const [nom, setNom] = useState(session?.nom || "");
  const [intensite, setInt] = useState(session?.intensite || "modere");
  const [color, setColor] = useState(session?.color || SESS_COLORS[0]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:18}}>
      <div style={{background:C.s1,border:"0.5px solid #dce8f4",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:360}}>
        <Lbl>Séance du {date}</Lbl>
        {session && (
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

// ─── CALENDRIER MENSUEL ──────────────────────────────────────────────────────
// Mémoïsé pour éviter les re-renders inutiles : ne se redessine que si
// sessions ou onUpdate changent réellement.
export const MonthCal = memo(function MonthCal({ sessions, onUpdate }) {
  const [date, setDate] = useState(new Date());
  const [modal, setModal] = useState(null);
  const DAYS = ["L","M","M","J","V","S","D"];
  const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const y = date.getFullYear(), m = date.getMonth();
  const first = (new Date(y,m,1).getDay()+6)%7;
  const daysInMonth = new Date(y,m+1,0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const ds = d => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const canGoPrev = y > today.getFullYear() || (y === today.getFullYear() && m > today.getMonth());
  const canGoNext = y < 2027 || (y === 2027 && m < 11);
  return (
    <div>
      <Row style={{justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>canGoPrev&&setDate(new Date(y,m-1,1))} disabled={!canGoPrev} style={{background:"transparent",border:"none",color:canGoPrev?"#64748b":C.dim,cursor:canGoPrev?"pointer":"not-allowed",fontSize:18,padding:"2px 8px"}}>‹</button>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,letterSpacing:-0.3,fontWeight:300}}>{MONTHS[m]} {y}</div>
        <button onClick={()=>canGoNext&&setDate(new Date(y,m+1,1))} disabled={!canGoNext} style={{background:"transparent",border:"none",color:canGoNext?"#64748b":C.dim,cursor:canGoNext?"pointer":"not-allowed",fontSize:18,padding:"2px 8px"}}>›</button>
      </Row>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:C.dim,fontWeight:700,padding:"3px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {[...Array(first)].map((_,i)=><div key={`e${i}`}/>)}
        {[...Array(daysInMonth)].map((_,i)=>{
          const d = i+1, key = ds(d), sess = sessions[key], isToday = key === todayStr;
          return (
            <div key={d} onClick={()=>setModal({date:key,session:sess})} style={{
              aspectRatio:"1",borderRadius:7,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",
              background:sess?sess.color:isToday?"rgba(59,130,246,0.1)":"transparent",
              border:`1px solid ${sess?sess.color:isToday?"#3b82f6":C.s3}`,
              outline:isToday&&!sess?`1.5px solid #3b82f6`:undefined,
              transition:"background.15s",
            }}>
              <div style={{fontSize:10,fontWeight:isToday?600:400,color:sess?"#ffffff":isToday?"#3b82f6":"#475569",lineHeight:1}}>{d}</div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:5}}>
        {Object.entries(INT).map(([k,v])=>(
          <Row key={k} style={{gap:4}}><div style={{width:5,height:5,borderRadius:"50%",background:v.c}}/><span style={{fontSize:9,color:"#64748b"}}>{v.l}</span></Row>
        ))}
      </div>
      {modal && (
        <DayModal
          date={modal.date} session={modal.session}
          onSave={sess=>onUpdate(modal.date,sess)}
          onDelete={()=>onUpdate(modal.date,null)}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
});
