import { useState, useRef, useEffect, useCallback } from "react";
const C = {
  bg:"#e4eef8",   s1:"#ffffff",  s2:"#e4eef8",  s3:"#dce8f4",
  gold:"#3b82f6", goldL:"#60a5fa", goldD:"rgba(59,130,246,0.08)", goldB:"rgba(59,130,246,0.2)",
  text:"#0f1a2e", mid:"#a0b4cc",  dim:"#c4d4e8",
  green:"#22c55e", red:"#f87171", blue:"#3b82f6", orange:"#f97316", purple:"#8b5cf6",
  cyan:"#06b6d4", accent:"#3b82f6",
};
const INT = {
  leger:   {l:"Léger",   c:"#22c55e"},
  modere:  {l:"Modéré",  c:"#3b82f6"},
  lourd:   {l:"Lourd",   c:"#f97316"},
  intense: {l:"Intense", c:"#f87171"},
  mobilite:{l:"Mobilité",c:"#8b5cf6"},
};
const SESS_COLORS = ["#3b82f6","#22c55e","#f97316","#f87171","#8b5cf6","#06b6d4","#ec4899","#eab308"];
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@300;400;500;700&family=Inter:wght@300;400;500&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
body{background:#e4eef8;color:#0f1a2e;font-family:'Inter',sans-serif}
input,textarea,select{outline:none;font-family:'Inter',sans-serif}
input::placeholder,textarea::placeholder{color:${C.dim}}
select option{background:${C.s2}}
::-webkit-scrollbar{width:2px;height:2px}
::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.2);border-radius:2px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.anim{animation:fadeUp .3s ease both}
.notif{animation:slideDown .4s ease both}
@media print{.np{display:none!important}}
`;
const Box = ({children,style,onClick})=>(
  <div onClick={onClick} style={{background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:16,padding:"16px 15px",marginBottom:9,cursor:onClick?"pointer":"default",...style}}>{children}</div>
);
const Lbl = ({children,style})=>(
  <div style={{fontSize:9,color:"#a0b4cc",letterSpacing:"2px",textTransform:"uppercase",fontWeight:600,marginBottom:10,...style}}>{children}</div>
);
const Inp = ({style,...p})=>(
  <input style={{width:"100%",padding:"11px 13px",background:"#e4eef8",border:"0.5px solid #dce8f4",borderRadius:9,color:"#0f1a2e",fontSize:13,marginBottom:8,...style}} {...p}/>
);
const Btn = ({children,onClick,disabled,v="fill",sm})=>{
  const vs={
    fill:{bg:`linear-gradient(135deg,#60a5fa,#3b82f6)`,color:"#ffffff",border:"none"},
    out: {bg:"transparent",color:"#3b82f6",border:"0.5px solid rgba(59,130,246,0.3)"},
    ghost:{bg:"rgba(255,255,255,0.04)",color:C.mid,border:"0.5px solid #dce8f4"},
  };
  const s=vs[v]||vs.fill;
  return(
    <button onClick={onClick} disabled={disabled} style={{
      display:"block",width:"100%",padding:sm?"9px 14px":"13px 16px",
      background:disabled?"rgba(255,255,255,0.04)":s.bg,
      color:disabled?C.mid:s.color,border:disabled?`1px solid ${C.s3}`:s.border,
      borderRadius:9,fontSize:sm?12:13.5,fontWeight:600,cursor:disabled?"not-allowed":"pointer",
      marginBottom:7,transition:"opacity .15s",
    }}>{children}</button>
  );
};
const Bar = ({pct,color=C.gold,h=4})=>(
  <div style={{height:h,background:"#e4eef8",borderRadius:h/2,overflow:"hidden",marginTop:5}}>
    <div style={{height:"100%",width:`${Math.min(100,pct||0)}%`,background:pct>100?C.red:color,borderRadius:h/2,transition:"width .5s"}}/>
  </div>
);
const Row = ({children,style})=><div style={{display:"flex",alignItems:"center",...style}}>{children}</div>;
const G2 = ({children,gap=8,style})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap,marginBottom:9,...style}}>{children}</div>;
const Tag = ({children,active,color,onClick})=>(
  <span onClick={onClick} style={{
    display:"inline-block",padding:"5px 11px",margin:"3px",
    background:active?`rgba(${color||"59,130,246"},.14)`:"rgba(255,255,255,0.03)",
    border:`1px solid ${active?`rgba(${color||"59,130,246"},.44)`:C.s3}`,
    borderRadius:18,fontSize:11.5,color:active?`rgb(${color||"200,150,62"})`:C.mid,
    cursor:onClick?"pointer":"default",transition:"all .15s",
  }}>{children}</span>
);
function Notif({n,onClose}){
  if(!n)return null;
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[]);
  return(
    <div className="notif" style={{position:"fixed",top:0,left:0,right:0,zIndex:500,padding:"10px 14px",display:"flex",justifyContent:"center",pointerEvents:"none"}}>
      <div style={{background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"11px 14px",maxWidth:460,width:"100%",display:"flex",alignItems:"center",gap:10,pointerEvents:"all",boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
        <span style={{fontSize:20,flexShrink:0}}>{n.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:500}}>{n.title}</div>
          <div style={{fontSize:11,color:C.mid}}>{n.body}</div>
        </div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:C.mid,cursor:"pointer",fontSize:16}}>×</button>
      </div>
    </div>
  );
}
function Chrono({onClose}){
  const [t,setT]=useState(0),[run,setRun]=useState(true),[preset,setPreset]=useState(null),[left,setLeft]=useState(null);
  const ref=useRef();
  useEffect(()=>{
    if(run) ref.current=setInterval(()=>{setT(x=>x+1);if(left!==null)setLeft(l=>Math.max(0,l-1));},1000);
    return()=>clearInterval(ref.current);
  },[run,left]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const done=left===0&&preset!==null;
  const pct=preset?((preset-(left||0))/preset)*100:0;
  const R=44,CI=2*Math.PI*R;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(237,243,251,0.99)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:400,padding:24}}>
      <Lbl style={{marginBottom:20}}>Temps de repos</Lbl>
      <div style={{position:"relative",width:120,height:120,marginBottom:24}}>
        <svg width={120} height={120} style={{transform:"rotate(-90deg)"}}>
          <circle cx={60} cy={60} r={R} fill="none" stroke={C.s3} strokeWidth={4}/>
          <circle cx={60} cy={60} r={R} fill="none" stroke={done?C.green:C.gold} strokeWidth={4}
            strokeDasharray={CI} strokeDashoffset={CI*(1-pct/100)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset .8s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,color:done?C.green:C.text,letterSpacing:-0.5,fontWeight:300}}>{preset?fmt(left||0):fmt(t)}</div>
          {done&&<div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"2px"}}>GO!</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:16}}>
        {[30,45,60,90,120].map(s=>(
          <button key={s} onClick={()=>{setPreset(s);setLeft(s);setT(0);setRun(true);}} style={{padding:"7px 13px",background:preset===s?C.goldD:C.s2,border:`1px solid ${preset===s?C.gold:C.s3}`,borderRadius:8,color:preset===s?C.gold:C.mid,cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500}}>{s}s</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <button onClick={()=>setRun(r=>!r)} style={{padding:"10px 18px",background:run?"rgba(224,72,72,.1)":"rgba(56,199,117,.1)",border:`1px solid ${run?"rgba(224,72,72,.3)":"rgba(56,199,117,.3)"}`,borderRadius:8,color:run?C.red:C.green,cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600}}>{run?"Pause":"Go"}</button>
        <button onClick={()=>{setT(0);setLeft(preset);setRun(true);}} style={{padding:"10px 14px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:8,color:C.mid,cursor:"pointer",fontSize:14}}>↺</button>
      </div>
      <button onClick={onClose} style={{padding:"9px 20px",background:"transparent",border:`0.5px solid ${C.goldB}`,borderRadius:8,color:C.gold,cursor:"pointer",fontSize:11,fontWeight:600,letterSpacing:"1px"}}>FERMER</button>
    </div>
  );
}
function DayModal({date,session,onSave,onDelete,onClose}){
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
            <div key={k} onClick={()=>{setInt(k);setColor(v.c);}} style={{padding:"5px 10px",background:intensite===k?`${v.c}20`:C.s2,border:`1px solid ${intensite===k?v.c:C.s3}`,borderRadius:7,cursor:"pointer",fontSize:11,color:intensite===k?v.c:C.mid,fontWeight:intensite===k?700:400}}>{v.l}</div>
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
function MonthCal({sessions,onUpdate}){
  const [date,setDate]=useState(new Date());
  const [modal,setModal]=useState(null);
  const DAYS=["L","M","M","J","V","S","D"];
  const MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const y=date.getFullYear(),m=date.getMonth();
  const first=(new Date(y,m,1).getDay()+6)%7;
  const daysInMonth=new Date(y,m+1,0).getDate();
  const today=new Date();
  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const ds=d=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const canGoPrev = y > today.getFullYear() || (y === today.getFullYear() && m > today.getMonth());
  const canGoNext = y < 2027 || (y === 2027 && m < 11); // December = month 11
  return(
    <div>
      <Row style={{justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>canGoPrev&&setDate(new Date(y,m-1,1))} disabled={!canGoPrev} style={{background:"transparent",border:"none",color:canGoPrev?C.mid:C.dim,cursor:canGoPrev?"pointer":"not-allowed",fontSize:18,padding:"2px 8px"}}>‹</button>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,letterSpacing:-0.3,fontWeight:300}}>{MONTHS[m]} {y}</div>
        <button onClick={()=>canGoNext&&setDate(new Date(y,m+1,1))} disabled={!canGoNext} style={{background:"transparent",border:"none",color:canGoNext?C.mid:C.dim,cursor:canGoNext?"pointer":"not-allowed",fontSize:18,padding:"2px 8px"}}>›</button>
      </Row>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:C.dim,fontWeight:700,padding:"3px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {[...Array(first)].map((_,i)=><div key={`e${i}`}/>)}
        {[...Array(daysInMonth)].map((_,i)=>{
          const d=i+1,key=ds(d),sess=sessions[key],isToday=key===todayStr;
          return(
            <div key={d} onClick={()=>setModal({date:key,session:sess})} style={{
              aspectRatio:"1",borderRadius:7,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",
              background:sess?sess.color:isToday?"rgba(59,130,246,0.1)":"transparent",
              border:`1px solid ${sess?sess.color:isToday?"#3b82f6":C.s3}`,
              outline:isToday&&!sess?`1.5px solid #3b82f6`:undefined,
              transition:"background .15s",
            }}>
              <div style={{fontSize:10,fontWeight:isToday?600:400,color:sess?"#ffffff":isToday?"#3b82f6":C.mid,lineHeight:1}}>{d}</div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:5}}>
        {Object.entries(INT).map(([k,v])=>(
          <Row key={k} style={{gap:4}}><div style={{width:5,height:5,borderRadius:"50%",background:v.c}}/><span style={{fontSize:9,color:C.mid}}>{v.l}</span></Row>
        ))}
      </div>
      {modal&&(
        <DayModal
          date={modal.date} session={modal.session}
          onSave={sess=>onUpdate(modal.date,sess)}
          onDelete={()=>onUpdate(modal.date,null)}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}
function MiniChart({data,color=C.gold}){
  if(!data||data.length<2)return<div style={{fontSize:11,color:C.mid,textAlign:"center",padding:"8px 0"}}>Enregistrez plus de séances pour voir la progression.</div>;
  const vals=data.map(d=>parseFloat(d.poids)||0);
  const min=Math.min(...vals)*.96,max=Math.max(...vals)*1.04;
  const W=260,H=60;
  const pts=data.map((d,i)=>{const x=(i/(data.length-1))*W;const y=H-((parseFloat(d.poids)-min)/(max-min||1))*H;return`${x},${y}`;}).join(" ");
  const last=vals[vals.length-1],first=vals[0];
  const diff=(last-first).toFixed(1);
  return(
    <div>
      <Row style={{justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontFamily:"'Syne',sans-serif",fontSize:22,color,letterSpacing:-0.5,fontWeight:300}}>{last}<span style={{fontSize:12,color:C.mid}}> kg</span></span>
        <span style={{fontSize:12,fontWeight:500,color:diff>=0?C.green:C.red}}>{diff>=0?"+":""}{diff}kg</span>
      </Row>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:55}}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {data.map((d,i)=>{const x=(i/(data.length-1))*W;const y=H-((parseFloat(d.poids)-min)/(max-min||1))*H;return<circle key={i} cx={x} cy={y} r={2.5} fill={color}/>;} )}
      </svg>
    </div>
  );
}
const FOODS=[
  {id:1,n:"Poulet blanc (100g)",c:165,p:31,g:0,l:4,cat:"Protéines"},
  {id:2,n:"Œuf entier",c:78,p:6,g:0,l:5,cat:"Protéines"},
  {id:3,n:"Thon boîte (100g)",c:116,p:26,g:0,l:1,cat:"Protéines"},
  {id:4,n:"Steak 5% (100g)",c:135,p:21,g:0,l:5,cat:"Protéines"},
  {id:5,n:"Saumon (100g)",c:208,p:20,g:0,l:13,cat:"Protéines"},
  {id:6,n:"Fromage blanc 0%",c:57,p:8,g:4,l:0,cat:"Protéines"},
  {id:7,n:"Whey (30g)",c:120,p:24,g:3,l:2,cat:"Protéines"},
  {id:8,n:"Riz cuit (100g)",c:130,p:3,g:28,l:0,cat:"Glucides"},
  {id:9,n:"Flocons avoine (50g)",c:189,p:7,g:32,l:4,cat:"Glucides"},
  {id:10,n:"Patate douce (100g)",c:86,p:2,g:20,l:0,cat:"Glucides"},
  {id:11,n:"Banane",c:89,p:1,g:23,l:0,cat:"Glucides"},
  {id:12,n:"Pain complet (1 tr.)",c:69,p:4,g:12,l:1,cat:"Glucides"},
  {id:13,n:"Avocat (1/2)",c:120,p:1,g:6,l:11,cat:"Lipides"},
  {id:14,n:"Amandes (30g)",c:174,p:6,g:6,l:15,cat:"Lipides"},
  {id:15,n:"Huile olive (1 c.s.)",c:119,p:0,g:0,l:14,cat:"Lipides"},
  {id:16,n:"Brocoli (100g)",c:34,p:3,g:7,l:0,cat:"Légumes"},
  {id:17,n:"Épinards (100g)",c:23,p:3,g:4,l:0,cat:"Légumes"},
  {id:18,n:"Yaourt grec 0%",c:86,p:15,g:6,l:0,cat:"Laitiers"},
  {id:19,n:"Banane",c:89,p:1,g:23,l:0,cat:"Fruits"},
  {id:20,n:"Pomme",c:52,p:0,g:14,l:0,cat:"Fruits"},
];
const OBJ={
  hypertrophie:{l:"Prise de muscle",c:1.15,p:.30,g:.50,li:.20},
  force:       {l:"Force",         c:1.10,p:.30,g:.45,li:.25},
  poids:       {l:"Perte de poids",c:0.80,p:.35,g:.40,li:.25},
  sante:       {l:"Santé",         c:1.0, p:.25,g:.50,li:.25},
};
const EX={"Pectoraux":[
{n:"Développé haltères incliné 30°",s:"4",r:"8-10",rest:"90s",ch:"60-70%",cat:"principal"},
{n:"Écarté poulie basse croisée",s:"3",r:"12-15",rest:"60s",ch:"40%",cat:"isolation"},
{n:"Développé couché barre",s:"4",r:"6-8",rest:"120s",ch:"75-80%",cat:"principal"},
{n:"Dips lestés",s:"4",r:"8-12",rest:"90s",ch:"Corps+lest",cat:"principal"},
{n:"Pull-over haltère",s:"3",r:"12-15",rest:"60s",ch:"Léger",cat:"isolation"},
],"Dos":[
{n:"Tractions pronation large",s:"4",r:"6-10",rest:"120s",ch:"Corps",cat:"principal"},
{n:"Rowing haltère unilatéral",s:"4",r:"10-12",rest:"60s",ch:"60%",cat:"principal"},
{n:"Tirage poulie haute prise large",s:"4",r:"10-12",rest:"90s",ch:"60%",cat:"principal"},
{n:"Rowing barre 45°",s:"4",r:"8-10",rest:"90s",ch:"65%",cat:"principal"},
{n:"Pull-over poulie basse",s:"3",r:"12-15",rest:"60s",ch:"Léger",cat:"isolation"},
],"Épaules":[
{n:"Élévations latérales poulie basse",s:"4",r:"15-20",rest:"45s",ch:"Très léger",cat:"isolation"},
{n:"Face pull corde haute poulie",s:"4",r:"15-20",rest:"45s",ch:"Léger",cat:"correctif"},
{n:"Rotation externe poulie basse",s:"3",r:"15-20",rest:"45s",ch:"Très léger",cat:"correctif"},
{n:"Développé militaire haltères",s:"4",r:"8-10",rest:"90s",ch:"55-65%",cat:"principal"},
{n:"Oiseau haltères penché",s:"4",r:"15",rest:"45s",ch:"Très léger",cat:"correctif"},
],"Biceps":[
{n:"Curl haltères supination alternés",s:"4",r:"10-12",rest:"60s",ch:"65%",cat:"principal"},
{n:"Curl incliné haltères 45°",s:"3",r:"10-12",rest:"60s",ch:"50%",cat:"isolation"},
{n:"Curl marteau",s:"3",r:"12",rest:"60s",ch:"65%",cat:"principal"},
{n:"Curl pupitre barre EZ",s:"4",r:"10-12",rest:"60s",ch:"60%",cat:"isolation"},
],"Triceps":[
{n:"Extension poulie haute corde",s:"4",r:"12-15",rest:"60s",ch:"Brûlure",cat:"principal"},
{n:"French press barre EZ couché",s:"4",r:"10-12",rest:"75s",ch:"55%",cat:"principal"},
{n:"Extension haltère unilatérale",s:"3",r:"12",rest:"60s",ch:"50%",cat:"isolation"},
{n:"Dips prise serrée",s:"4",r:"8-12",rest:"90s",ch:"Corps+lest",cat:"principal"},
],"Quadriceps":[
{n:"Presse à cuisses 45° pieds bas",s:"4",r:"10-15",rest:"90s",ch:"70%",cat:"principal"},
{n:"Hack squat guidé",s:"4",r:"10-12",rest:"90s",ch:"65%",cat:"principal"},
{n:"Leg extension",s:"3",r:"15",rest:"60s",ch:"60%",cat:"isolation"},
{n:"Squat goblet haltère",s:"3",r:"12",rest:"90s",ch:"Modéré",cat:"principal"},
],"Ischio-jambiers":[
{n:"Leg curl allongé excentrique",s:"4",r:"10-12",rest:"75s",ch:"Modéré",cat:"principal"},
{n:"Soulevé jambes tendues",s:"3",r:"10-12",rest:"90s",ch:"60%",cat:"principal"},
{n:"Hip thrust barre",s:"4",r:"10-15",rest:"90s",ch:"Rapide",cat:"principal"},
],"Fessiers":[
{n:"Hip thrust barre",s:"4",r:"10-15",rest:"90s",ch:"Rapide",cat:"principal"},
{n:"Fentes marchées haltères",s:"4",r:"12/jambe",rest:"60s",ch:"Modéré",cat:"principal"},
{n:"Abduction hanche poulie basse",s:"3",r:"15-20",rest:"45s",ch:"Léger",cat:"isolation"},
],"Abdominaux":[
{n:"Planche avant isométrique",s:"4",r:"30-60s",rest:"45s",ch:"Poids corps",cat:"gainage"},
{n:"Crunch contrôlé",s:"4",r:"15-20",rest:"45s",ch:"Poids corps",cat:"principal"},
{n:"Relevé de jambes suspendu",s:"3",r:"12-15",rest:"60s",ch:"Poids corps",cat:"principal"},
{n:"Gainage latéral",s:"3",r:"30-45s",rest:"45s",ch:"Poids corps",cat:"gainage"},
],"Lombaires":[
{n:"Hyperextension 45°",s:"4",r:"15",rest:"60s",ch:"Poids corps",cat:"correctif"},
{n:"Good morning barre légère",s:"3",r:"12",rest:"90s",ch:"Très léger",cat:"correctif"},
],"Mollets":[
{n:"Extension mollets debout machine",s:"5",r:"15-20",rest:"60s",ch:"Tension constante",cat:"principal"},
{n:"Extension mollets assis machine",s:"4",r:"15-20",rest:"60s",ch:"Modéré",cat:"isolation"},
],"Avant-bras":[
{n:"Curl poignet barre",s:"3",r:"15-20",rest:"45s",ch:"Léger",cat:"isolation"},
{n:"Farmer walk",s:"3",r:"30-40m",rest:"90s",ch:"Lourd",cat:"principal"},
],"Trapèzes":[
{n:"Haussements épaules haltères",s:"4",r:"12-15",rest:"60s",ch:"70%",cat:"principal"},
]};
// Détails exercices — tips, variantes, erreurs, morpho
const D={
"Développé haltères incliné 30°":{m:"Humérus longs→haltères OBLIGATOIRES. Cage plate→45° étirement max.",t:["Rotation pronation→semi-sup en montant","Omoplates pressées sur le banc tout au long","Descendre jusqu au niveau des pecs","Expirer poussée / inspirer descente"],v:["Développé barre incliné (cage large+bras courts)","Développé machine convergente (morpho défavorisée)","Développé haltères plat (chef sternal)"],e:["Arquer le dos pour compenser","Verrouiller les coudes en haut","Descente trop rapide","Coudes trop à 90°"]},
"Écarté poulie basse croisée":{m:"Tension constante supérieur aux haltères cage plate. Ne pas croiser au-delà ligne médiane.",t:["Légère flexion des coudes fixe tout au long","Contraction 1s en position haute","Angle bas=chef inf / horizontal=chef moyen"],v:["Écarté haltères plat","Écarté poulie haute","Écarté machine débutants"],e:["Trop lourd épaules compensent","Coudes changeant d angle","Croiser trop les bras"]},
"Développé couché barre":{m:"Favorisé cage large+bras courts. Défavorisé bras longs. Clavicules larges→difficultés.",t:["Prise légèrement plus large que épaules","Retrait omoplates avant de débarrer","Descente contrôlée 2-3s sur poitrine basse","Pont léger naturel"],v:["Développé prise serrée (triceps+pec interne)","Développé haltères plat","Développé machine"],e:["Rebond barre sur poitrine","Décoller fesses du banc","Poignets fléchis sous barre"]},
"Dips lestés":{m:"Buste incliné 20°=pectoraux. Buste droit=triceps. Excellent cage plate+pull-over (Gundill).",t:["Incliner buste vers avant pour pecs","Descendre bras parallèles au sol minimum","Excentrique 3s","Éviter si conflit épaule antérieur"],v:["Dips poids corps","Dips machine assistée","Dips banc triceps"],e:["Descente insuffisante","Balancement corps","Épaules remontent vers oreilles"]},
"Pull-over haltère":{m:"Cage plate→PRIORITAIRE expansion thoracique (Delavier). Pratiquer après squats.",t:["Bras légèrement fléchis fixes","Descendre le plus bas possible","Inspirer profondément en bas","Tempo lent sensation prioritaire"],v:["Pull-over poulie (tension constante)","Pull-over travers banc (expansion costale)"],e:["Trop lourd épaules compensent","Trop fléchir coudes→triceps"]},
"Tractions pronation large":{m:"Bras longs→étirement dorsal max. Bras courts→biceps dominent préférer poulie.",t:["Initier par DÉPRESSION omoplates pas par bras","Coudes vers les hanches","Excentrique 3-4s","Straps si prise lâche avant dorsaux"],v:["Tirage poulie haute (bras courts)","Tractions supination (hybride)","Tractions neutres (tolérance épaule)"],e:["Tirer avec les bras","Manque dépression scapulaire","Amplitude partielle"]},
"Rowing haltère unilatéral":{m:"Corrige asymétries. Tirage coude vers hanche=dorsal / vers plafond=trapèzes.",t:["Focus COUDE vers hanche pas la main","Amplitude complète","Dessaisir 1s en haut","Ne pas pivoter le buste"],v:["Rowing barre 45°","Chest supported row (fémurs longs)","Rowing machine guidé"],e:["Rotation buste excessive","Amplitude partielle","Coudes trop écartés"]},
"Tirage poulie haute prise large":{m:"Idéal bras courts. Angle et trajectoire ajustables. Moins fatigue biceps.",t:["Légère inclinaison buste arrière 10-15°","Tirer vers la clavicule","Contraction dorsaux en bas","Contrôle excentrique lent"],v:["Tirage prise serrée neutre","Tirage prise supination"],e:["Tirer derrière la nuque risque cervical","Élan du corps"]},
"Rowing barre 45°":{m:"Angle buste personnalisé selon torse. Fémurs longs→chest supported row.",t:["Lordose naturelle maintenue","Tirage nombril=dorsal / poitrine=trapèzes","Cheating contrôlé fin série seulement"],v:["Rowing Pendlay (explosif)","Chest supported row"],e:["Arrondir le dos danger lombaire","Élan excessif dès début"]},
"Pull-over poulie basse":{m:"Tension constante. Grand dorsal en étirement complet.",t:["Bras tendus ou légèrement fléchis","Tirer vers les cuisses","Amplitude maximale vers le haut"],v:["Pull-over haltère"],e:["Trop fléchir coudes→triceps"]},
"Élévations latérales poulie basse":{m:"Avant-bras longs→COUDES pas mains. Arrêt 90° max. Machines coudes annulent levier (Gundill).",t:["Lever les coudes pas les mains","90° MAXIMUM au-delà trapèze prend","Tilt pouce vers bas=deltoïde moyen","Légère inclinaison buste avant"],v:["Élévations haltères","Élévations machine coudes","Élévations unilatérales"],e:["Trop lourd trapèzes dominent","Dépasser 90°","Balancement corps"]},
"Face pull corde haute poulie":{m:"Correctif ESSENTIEL toutes morphologies. Prévient syndrome accrochage (Gundill).",t:["Tirer vers les OREILLES pas vers le nez","Rotation externe épaule en fin","Coudes à hauteur épaules","3-4 sets de 15-20 toujours"],v:["Oiseau haltères penché","Rotation externe élastique"],e:["Coudes trop bas","Trop lourd","Mauvaise trajectoire vers menton"]},
"Rotation externe poulie basse":{m:"Isole infra-épineux+petit rond. Prioritaire si cyphose ou bureau intensif (Gundill).",t:["Coude fixé 90° contre le corps","Rotation vers extérieur seulement","Amplitude 0-60° max","Très léger mouvement lent"],v:["Rotation externe élastique couché côté","Rotation externe haltère couché","Rotation externe poulie haute"],e:["Trop lourd deltoïde compense","Coude qui décolle","Amplitude excessive"]},
"Développé militaire haltères":{m:"Avant-bras longs→moins de force. Préférer machines à coudes. Clavicules larges→difficultés.",t:["Partir à hauteur épaules pas derrière tête","Légère rotation haltères pendant montée","Ne pas verrouiller coudes en haut"],v:["Développé militaire barre","Développé Arnold","Développé machine"],e:["Derrière la nuque risque cervical","Arquer le dos lombaires","Descente trop rapide"]},
"Oiseau haltères penché":{m:"Deltoïde postérieur. Correctif cyphose. Déséquilibre ant/post=douleurs épaule (Gundill).",t:["Buste quasi parallèle au sol","Bras semi-fléchis angle fixe","Lever les coudes vers le haut","Contraction 1s en haut"],v:["Face pull corde","Oiseau poulie basse"],e:["Trop lourd trapèzes et dos compensent","Buste pas assez incliné"]},
"Curl haltères supination alternés":{m:"Insertion haute→pic. Insertion basse→masse. Avant-bras longs→coudes légèrement derrière (Gundill).",t:["Supination PROGRESSIVE pendant montée","Contraction 1s en haut","Excentrique lent 3s","Pas de blocage rigide des coudes"],v:["Curl barre EZ","Curl marteau","Curl poulie basse"],e:["Élan du corps","Coudes qui avancent","Descente trop rapide"]},
"Curl incliné haltères 45°":{m:"Étirement maximal chef long. Meilleure tension étirement intérêt hypertrophique majeur (Gundill).",t:["Bras pendent COMPLÈTEMENT en bas","Mouvement lent pas d élan","2-3 sets max intense pour tendons"],v:["Curl pupitre EZ","Stretch curl poulie"],e:["Trop lourd risque tendineux","Amplitude réduite","Lever les épaules"]},
"Curl marteau":{m:"Brachioradial+brachial. Avant-bras longs→compense le levier défavorable du curl.",t:["Prise neutre maintenue","Montée devant le buste","Amplitude complète"],v:["Curl marteau câble","Curl marteau corde poulie"],e:["Transformer en curl classique","Élan excessif"]},
"Curl pupitre barre EZ":{m:"Isolation totale. Pic du biceps. EZ=protection poignets vs barre droite.",t:["Ne pas décoller bras du pupitre en haut","Descente complète","Angle pupitre 45-60°"],v:["Curl pupitre haltère unilatéral","Curl poulie basse au pupitre"],e:["Décoller les bras","Trop lourd épaules recrutées","Pas de descente complète"]},
"Extension poulie haute corde":{m:"Tension constante. Triceps court→priorité partie inférieure. Varier angles (Gundill).",t:["Écarter la corde en fin=chef latéral max","Coudes fixes contre corps","Contraction 1s en bas","Légère inclinaison buste avant"],v:["Extension barre V poulie","Kickback haltère","Extension unilatérale"],e:["Coudes s écartent","Élan du buste","Amplitude partielle"]},
"French press barre EZ couché":{m:"Clavicules étroites→EZ OBLIGATOIRE. Chef long en étirement complet. Gundill→incliner vers tête.",t:["Coudes vers le plafond","Douleur coudes chronique→haltères","Légère inclinaison barre vers tête"],v:["Extension haltère couché","French press câble","Dips banc lesté"],e:["Coudes qui s écartent","Descente trop rapide","Trop de charge"]},
"Extension haltère unilatérale":{m:"Liberté rotation poignet. Chef long prioritaire. Toutes morphologies.",t:["Coude pointé plafond","Amplitude complète derrière la tête","Stabiliser bras avec l autre main"],v:["Extension double haltères","Extension câble unilatérale"],e:["Coude qui s ouvre","Amplitude insuffisante"]},
"Dips prise serrée":{m:"Buste VERTICAL=triceps dominant. Chef latéral et médial fortement recrutés.",t:["Buste parfaitement vertical","Coudes proches du corps","Descente parallèles","Contraction sans verrouillage"],v:["Dips banc plus facile","Dips machine assistée"],e:["Incliner buste pectoraux prennent","Coudes trop écartés"]},
"Presse à cuisses 45° pieds bas":{m:"Fémurs longs→PRIORITAIRE sur squat. Stress lombaire quasi nul (Delavier).",t:["Pieds bas orteils légèrement écartés","Ne pas verrouiller genoux en haut","Contrôle descente 2s minimum","Gundill: 1.5rep pour récalcitrants"],v:["Presse pieds hauts fessiers","Presse unilatérale","Presse pieds larges adducteurs"],e:["Fesses décollent du siège","Genoux en valgus","Amplitude partielle"]},
"Hack squat guidé":{m:"Fémurs longs toléré trajectoire guidée. Meilleur isolement quad que squat libre.",t:["Pieds bas pour maximiser quad","Cuisses parallèles minimum","Tempo 2-1-2","Genoux dans l axe pieds"],v:["Squat goblet talons surélevés","Split squat bulgare"],e:["Genoux en valgus","Descente trop rapide","Pieds trop hauts"]},
"Leg extension":{m:"Isolation pure quad. Contrôlé si antécédent LCA (Delavier).",t:["Extension maximale en haut","Contraction 1s","Descente contrôlée 3s"],v:["Leg extension unilatéral"],e:["Trop lourd risque LCA","Amplitude partielle","Vitesse excessive"]},
"Squat goblet haltère":{m:"Fémurs longs→talons surélevés+stance large. Haltère=contrepoids naturel.",t:["Talons sur plaque 2-3cm fémurs longs","Stance légèrement plus large épaules","Poitrine haute","Genoux vers extérieur"],v:["Squat sumo haltère","Squat barre haute fémurs courts"],e:["Talons décollent manque mobilité","Buste effondré","Genoux en valgus"]},
"Leg curl allongé excentrique":{m:"Déséquilibre quad/ischios=blessure LCA PRIORITÉ ABSOLUE. Excentrique 3x plus efficace (Gundill).",t:["Monter 2 jambes descendre 1 excentrique forcé","Orteil vers soi en bas étirement max","Ne pas décoller hanches","Délai 2s en bas"],v:["Leg curl assis","Nordic curl excentrique pur avancé"],e:["Excentrique trop rapide","Hanches qui se soulèvent","Amplitude partielle"]},
"Soulevé jambes tendues":{m:"Étirement maximal chaîne postérieure. Lordose naturelle maintenue (Delavier).",t:["Barre glisse le long des tibias","Lordose naturelle JAMAIS arrondir","Genoux légèrement fléchis","S arrêter si dos commence à arrondir"],v:["Soulevé roumain","Good morning barre"],e:["Arrondir le dos danger lombaire","Barre trop loin du corps","Genoux verrouillés"]},
"Hip thrust barre":{m:"Fémurs longs→AVANTAGE mécanique. Activation glutes supérieure au squat en EMG.",t:["Pousser par les TALONS pas les orteils","Contraction isométrique 2s en haut","Chin tucked évite hyperextension lombaire","Coussin protection barre obligatoire"],v:["Hip thrust unilatéral","Glute bridge sol débutants","Hip thrust haltère"],e:["Hyperextension lombaire en haut","Pieds mal placés","Pousser par orteils"]},
"Fentes marchées haltères":{m:"Pas long→fessiers. Pas court→quadriceps. Fémurs longs→grand pas.",t:["Grand pas vers avant pour fessiers","Genou arrière effleure le sol","Buste droit","Alterner les jambes"],v:["Fentes statiques débutants","Fentes arrière genoux sensibles","Bulgarian split squat avancé"],e:["Pas trop court quadriceps seulement","Buste effondré","Genou avant dépasse orteils"]},
"Abduction hanche poulie basse":{m:"Moyen fessier stabilisateur bassin. Prévention blessures genou (Gundill).",t:["Amplitude 30-45° max","Mouvement lent et contrôlé","Pas de bascule du bassin"],v:["Machine abduction assise","Abduction élastique debout","Clamshell sol débutants"],e:["Amplitude trop grande compensations","Trop lourd bassin bascule"]},
"Planche avant isométrique":{m:"Transverse=muscle protecteur colonne (Delavier+Gundill). PRIORITÉ ABSOLUE sédentaires+lordotiques.",t:["Corps ligne droite talons-nuque","Contracter activement les fessiers","Respiration nasale régulière","Progression coudes→mains→dynamique"],v:["Planche latérale","Dead bug","Hollow body hold"],e:["Bassin qui monte ou descend","Nuque tendue","Souffle bloqué"]},
"Crunch contrôlé":{m:"BAS DU DOS AU SOL OBLIGATOIRE sinon PSOAS travaille. Mains tempes JAMAIS nuque (Delavier).",t:["Bas du dos collé au sol critère absolu","Souffler à la contraction","Enrouler vertèbre par vertèbre","Regarder le plafond"],v:["Crunch poulie haute","Crunch oblique","Crunch double contraction"],e:["Bas du dos qui décolle=psoas","Tirer sur la nuque","Amplitude excessive lombaires"]},
"Relevé de jambes suspendu":{m:"Bas abdominaux. SUSPENDU ou lombaires au sol JAMAIS jambes en l air librement (Delavier).",t:["Enrouler le bassin en montant","Descente contrôlée 3s","Jambes tendues si fort genoux fléchis si débutant","Ne pas se balancer"],v:["Relevé jambes sol lombaires pressées","Knee raise suspendu"],e:["Pas d enroulement bassin=psoas seulement","Balancement corps","Amplitude insuffisante"]},
"Gainage latéral":{m:"Obliques+stabilisateurs latéraux. Complète le gainage frontal. Prévention lombaires (Gundill).",t:["Corps ligne droite tête-pieds","Hanche ne descend pas","Regard devant","Progresser en soulevant bras ou jambe"],v:["Gainage latéral avec abduction","Copenhagen plank adducteurs+obliques"],e:["Hanche qui descend","Corps en angle tricherie"]},
"Hyperextension 45°":{m:"Toujours avec abdos (Delavier). Érecteurs+ischios+fessiers. Lien essentiel haut/bas.",t:["Lordose naturelle maintenue","Amplitude jusqu à horizontal UNIQUEMENT","Tempo lent pas d élan","Haltère sur poitrine pour progresser"],v:["Superman sol débutants","Good morning barre","Décompression barre fixe post-séance"],e:["Dépasser l horizontal","Élan en bas","Arrondir le dos"]},
"Good morning barre légère":{m:"Ischios+lombaires. Lordose naturelle obligatoire. Jamais lourd sans maîtrise (Delavier).",t:["Barre basse sur les trapèzes","Genoux légèrement fléchis","Incliner buste 45° maximum","Dos plat regard horizon"],v:["Good morning assis isolation lombaires","Romanian deadlift"],e:["Arrondir le dos danger grave","Trop de charge","Genoux verrouillés"]},
"Extension mollets debout machine":{m:"Volume ÉLEVÉ obligatoire. Étirement COMPLET en bas essentiel. Varier position pieds (Gundill).",t:["Amplitude TOTALE talon le plus bas","Pause 2s bas+1s haut","Varier pieds neutres/dehors/dedans","15-25 reps optimum"],v:["Mollets assis machine soléaire","Mollets debout unilatéral","Mollets incliné presse"],e:["Amplitude partielle","Rebond en bas","Vitesse excessive"]},
"Extension mollets assis machine":{m:"Soléaire. Mollet jamais complet sans cet exercice (Gundill). Fibre lente.",t:["Genoux 90° position assise","Amplitude complète en bas","Pause en bas et en haut","Progression lente"],v:["Donkey calf raise étirement augmenté"],e:["Amplitude partielle","Négliger au profit du debout seulement"]},
"Curl poignet barre":{m:"Fléchisseurs poignet. Sous-développés si straps toujours utilisés (Gundill).",t:["Avant-bras posés sur cuisses","Amplitude complète","Mouvement lent et contrôlé"],v:["Curl poignet haltère","Extension poignet extenseurs","Rotation poignet"],e:["Trop lourd coude compense","Amplitude insuffisante"]},
"Farmer walk":{m:"Force préhension+avant-bras+trapèzes. Meilleur exercice avant-bras (Gundill). Fonctionnel.",t:["Haltères lourds limite de poignée","Pas réguliers sans balancement","Dos droit","Respiration régulière"],v:["Deadlift isométrique","Plate pinch 2 doigts"],e:["Trop léger pas de stimulus","Dos qui s incline latéralement"]},
"Haussements épaules haltères":{m:"Chef supérieur trapèzes. Équilibrer avec face pull et oiseau (Gundill).",t:["Mouvement vertical pur pas de rotation","Contraction 1-2s en haut","Descente lente étirement complet"],v:["Haussements barre","Haussements poulie"],e:["Rotation des épaules risque articulaire","Amplitude partielle"]},
};
export default function App(){
  const [tab,setTab]=useState("home");
  const [premium,setPremium]=useState(false);
  const [showChrono,setChrono]=useState(false);
  const [paywall,setPaywall]=useState(false);
  const [notif,setNotif]=useState(null);
  const [profil,setProfil]=useState({prenom:"",age:"",poids:"",taille:"",sexe:"",objectif:"hypertrophie",activite:"modere"});
  const [pView,setPView]=useState("calendar");
  const [prog,setProg]=useState(null);
  const [cycles,setCycles]=useState([]); // historique des cycles précédents
  const [cycleStart,setCycleStart]=useState(null);
  const [seance,setSeance]=useState(null); // index
  const [exDetails,setExDetails]=useState({}); // {j: bool}
  const [exEdit,setExEdit]=useState({});   // {j: bool}
  const openSeance=(i)=>{setSeance(i);setExDetails({});setExEdit({});};
  const [createStep,setCS]=useState(0);
  const [newP,setNewP]=useState({nom:"",jours:[],seances:{}});
  const [jourActif,setJourActif]=useState(null);
  const [groupe,setGroupe]=useState(null);
  const [exModal,setExModal]=useState(null);
  const [exModalTab,setExModalTab]=useState("tips");
  const [photos,setPhotos]=useState({face:null,dos:null,profil:null});
  const fileRefFace=useRef();
  const fileRefDos=useRef();
  const fileRefProfil=useRef();
  const readFile=(key,file)=>{if(!file)return;const r=new FileReader();r.onload=()=>setPhotos(p=>({...p,[key]:r.result}));r.readAsDataURL(file);};
  const [form,setForm]=useState({prenom:"",age:"",poids:"",taille:"",sexe:"",metier:"",niveau:"",jours:[],objectif:"",objectifPrecis:"",materiel:[],pathologies:[],sport:""});
  const [loadIA,setLoadIA]=useState(false);
  const [loadMsg,setLoadMsg]=useState("");
  const [aStep,setAStep]=useState(0);
  const [calSess,setCalSess]=useState({});
  const [nView,setNView]=useState("journal");
  const [repas,setRepas]=useState({matin:[],midi:[],soir:[],snack:[]});
  const [repasA,setRepasA]=useState("matin");
  const [search,setSearch]=useState("");
  const [myFoods,setMyFoods]=useState([]);
  const [newFood,setNewFood]=useState({nom:"",cal:"",p:"",g:"",l:""});
  const [eau,setEau]=useState(0);
  const [scanCode,setScan]=useState("");
  const [scanRes,setScanRes]=useState(null);
  const imc=profil.poids&&profil.taille?(profil.poids/((profil.taille/100)**2)).toFixed(1):null;
  const obj=OBJ[profil.objectif]||OBJ.sante;
  const calBase=useCallback(()=>{
    if(!profil.poids||!profil.taille||!profil.age||!profil.sexe)return 2000;
    const b=profil.sexe==="homme"?10*profil.poids+6.25*profil.taille-5*profil.age+5:10*profil.poids+6.25*profil.taille-5*profil.age-161;
    return Math.round(b*({sedentaire:1.2,leger:1.375,modere:1.55,actif:1.725}[profil.activite]||1.375)*obj.c);
  },[profil,obj]);
  const calObj=calBase();
  const pObj=Math.round(calObj*obj.p/4),gObj=Math.round(calObj*obj.g/4),lObj=Math.round(calObj*obj.li/9);
  const totR=()=>[...repas.matin,...repas.midi,...repas.soir,...repas.snack].reduce((a,i)=>({cal:a.cal+i.c,p:a.p+i.p,g:a.g+i.g,l:a.l+i.l}),{cal:0,p:0,g:0,l:0});
  const jR=cycleStart?Math.max(0,42-Math.floor((Date.now()-cycleStart)/864e5)):null;
  const cPct=cycleStart?Math.min(100,((42-(jR||0))/42)*100):0;
  const semC=cycleStart?Math.min(5,Math.floor((42-(jR||42))/7)):0;
  const push=useCallback((icon,title,body)=>{setNotif({icon,title,body});setTimeout(()=>setNotif(null),4500);},[]);
  useEffect(()=>{
    const t1=setTimeout(()=>push("🏋️","Séance du jour","Votre programme vous attend !"),7000);
    const t2=setTimeout(()=>push("💧","Hydratation","Pensez à boire de l'eau !"),22000);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  const handleScan=async code=>{
    if(code.length<8)return;
    try{
      const r=await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const scanData=await r.json();
      if(scanData.status===1){const n=scanData.product.nutriments||{};setScanRes({n:scanData.product.product_name_fr||"Produit",c:Math.round(n["energy-kcal_100g"]||0),p:Math.round(n.proteins_100g||0),g:Math.round(n.carbohydrates_100g||0),l:Math.round(n.fat_100g||0),cat:"Scanné"});}
      else setScanRes({error:true});
    }catch{setScanRes({error:true});}
  };
  const buildP=()=>{
    const prec=cycles.length>0?cycles[cycles.length-1]:null;
    const histCtx=prec
      ?"CYCLE PRECEDENT: "+prec.titre+". Charges: "+(prec.chargesResume||"aucune")+". Fais progresser ce programme."
      :"PREMIER CYCLE pour ce client.";
    const cycleNum=cycles.length+1;
    const profilStr=JSON.stringify({
      prenom:form.prenom,age:form.age,poids:form.poids,taille:form.taille,
      sexe:form.sexe,niveau:form.niveau,objectif:form.objectif,
      objectifPrecis:form.objectifPrecis,jours:form.jours,
      materiel:form.materiel,pathologies:form.pathologies,cycle:cycleNum
    });
    const prompt="Tu es un coach sportif expert. "+histCtx+"\n\n"
      +"PROFIL: "+profilStr+"\n\n"
      +"REGLES: bras longs=halteres, femurs longs=presse pas squat, cage plate=pull-over prioritaire, cyphose=face pull, lordose=gainage transverse avant abdos.\n\n"
      +"Reponds UNIQUEMENT avec ce JSON valide (rien d autre, pas de texte, pas de markdown):\n"
      +'{"programme":{"titre":"string","seances":[{"jour":"string","focus":"string","duree":"string","intensite":"modere","exercices":[{"nom":"string","series":"4","reps":"10","repos":"60s","charge":"60%","morpho_tip":"string"}]}]},"nutrition":{"cal":2500,"p":150,"g":300,"l":80,"conseil":"string"},"morpho":{"resume":"string"}}';
    return prompt;
  };
  const lancerIA=async()=>{
    setLoadIA(true);setLoadMsg("Génération du programme personnalisé…");
    try{
      const content=[];
      const toImg=src=>{
        const b64=src.split(",")[1];
        const mt=src.split(";")[0].split(":")[1];
        return{type:"image",source:{type:"base64",media_type:mt,data:b64}};
      };
      // On envoie sans photos pour éviter les problèmes de taille
      // L'analyse se base sur le profil complet + règles morphologiques
      content.push({type:"text",text:buildP()});
      const res=await fetch("/api/generate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-haiku-4-5",
          max_tokens:3000,
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
      let jsonStr=rawText.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
      const jStart=jsonStr.indexOf("{");
      const jEnd=jsonStr.lastIndexOf("}");
      if(jStart===-1||jEnd===-1||jEnd<=jStart){
        throw new Error("Pas de JSON détecté: "+rawText.substring(0,80));
      }
      jsonStr=jsonStr.substring(jStart,jEnd+1);
      let parsed;
      try{
        parsed=JSON.parse(jsonStr);
      }catch(pe){
        throw new Error("JSON mal formé: "+pe.message.substring(0,50));
      }
      if(!parsed.programme) throw new Error("Clé 'programme' absente");
      if(!Array.isArray(parsed.programme.seances)||parsed.programme.seances.length===0){
        throw new Error("Aucune séance générée dans le programme");
      }
      const np={
        titre:parsed.programme.titre||"Mon programme",
        type:"ia",
        morpho:parsed.morpho||{},
        numero:cycles.length+1,
        objectif:form.objectif,
        nutrition:parsed.nutrition||{},
        dateDebut:new Date().toLocaleDateString("fr-FR"),
        jours:parsed.programme.seances.map((s,i)=>({
          id:i+1,
          nom:s.jour||`Séance ${i+1}`,
          focus:s.focus||"",
          duree:s.duree||"45 min",
          intensite:s.intensite||"modere",
          exercices:(s.exercices||[]).map(ex=>({...ex,historique:[],note:""})),
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
        setCycles(prev=>[...prev,{
          ...prog,
          archiveDate:new Date().toLocaleDateString("fr-FR"),
          chargesResume:chargesResume.slice(0,5).join(", ")
        }]);
      }
      setProg(np);
      setCycleStart(Date.now());
      setAStep(0);
      setPhotos({face:null,dos:null,profil:null});
      const today=new Date();
      const joursMap={"Lun":1,"Mar":2,"Mer":3,"Jeu":4,"Ven":5,"Sam":6,"Dim":0};
      const newSess={};
      np.jours.forEach(jour=>{
        const match=Object.entries(joursMap).find(([k])=>
          jour.nom.toLowerCase().startsWith(k.toLowerCase())
        );
        if(match){
          const dayNum=match[1];
          for(let w=0;w<6;w++){
            const dateObj=new Date(today);
            dateObj.setDate(dateObj.getDate()+((dayNum-dateObj.getDay()+7)%7||7)+w*7);
            const key=`${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,"0")}-${String(dateObj.getDate()).padStart(2,"0")}`;
            const int=INT[jour.intensite||"modere"];
            newSess[key]={nom:jour.focus||jour.nom,intensite:jour.intensite||"modere",color:int.c};
          }
        }
      });
      setCalSess(prev=>({...prev,...newSess}));
      setPView("calendar");
      setTab("program");
      push("🎯",`Programme Cycle ${np.numero} créé !`,"Consultez votre planification !");
    }catch(e){
      console.error("lancerIA error:",e);
      setLoadMsg(`Erreur: ${e.message}`);
      setTimeout(()=>{
        setLoadIA(false);
        push("❌","Échec de génération",e.message?.substring(0,80)||"Réessayez dans quelques secondes.");
      },2000);
      return;
    }
    setLoadIA(false);
  };
  const Home=()=>{
    const tot=totR();
    const today=new Date();
    const todayKey=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const todaySess=calSess[todayKey];
    const dayOfYear=Math.floor((today-new Date(today.getFullYear(),0,0))/(1000*60*60*24));const motiv=MOTIVATIONS[dayOfYear%MOTIVATIONS.length];
    return(
      <div style={{padding:"0 15px 16px"}} className="anim">
        <div style={{paddingTop:24,paddingBottom:14}}>
          <div style={{fontSize:9,letterSpacing:"1.5px",color:C.mid,fontWeight:500,marginBottom:8,textTransform:"uppercase"}}>{today.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:300,color:C.text,letterSpacing:-0.5,lineHeight:1.1,marginBottom:12}}>
            {profil.prenom?<>Bonjour, <span style={{fontWeight:500,color:C.blue}}>{profil.prenom}</span></>:<><span style={{fontWeight:500,color:C.blue}}>Morpho</span>Coach</>}
          </div>
          <div style={{padding:"12px 14px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:12}}>
            <div style={{fontSize:9,color:C.blue,fontWeight:600,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:5}}>Motivation du jour</div>
            <div style={{fontSize:13,color:C.text,fontWeight:500,lineHeight:1.6}}>{motiv}</div>
          </div>
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
          <Box style={{background:"rgba(59,130,246,0.06)",borderColor:C.goldB}}>
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
        <G2>
          <Box style={{marginBottom:0}}>
            <div style={{fontSize:9,color:C.mid,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Calories</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,color:tot.cal>calObj?C.red:C.gold,letterSpacing:-0.5,fontWeight:300}}>{tot.cal}</div>
            <div style={{fontSize:10,color:C.mid}}>/{calObj} kcal</div>
            <Bar pct={tot.cal/calObj*100}/>
          </Box>
          <Box style={{marginBottom:0}}>
            <div style={{fontSize:9,color:C.mid,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Eau</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,color:C.blue,letterSpacing:-0.5,fontWeight:300}}>{eau*250}<span style={{fontSize:12,color:C.mid}}>ml</span></div>
            <Bar pct={eau/8*100} color={C.blue}/>
          </Box>
        </G2>
        <Box>
          <Lbl>Hydratation</Lbl>
          <div style={{display:"flex",gap:7}}>
            {[...Array(8)].map((_,i)=><div key={i} onClick={()=>setEau(i<eau?i:i+1)} style={{flex:1,height:22,borderRadius:6,background:i<eau?`rgba(59,130,246,${0.25+i*0.09})`:"#dce8f4",cursor:"pointer",transition:"background .2s"}}/>)}
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
                  <Row style={{justifyContent:"space-between",marginBottom:8}}>
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:300,color:C.gold,letterSpacing:-1,lineHeight:1}}>{lastWeight?.v}<span style={{fontSize:12,color:C.mid,fontFamily:"'Inter',sans-serif"}}> kg</span></div>
                      <div style={{fontSize:10,color:C.mid,marginTop:2}}>Dernière pesée · {lastWeight?.date}</div>
                    </div>
                    {diff&&<div style={{textAlign:"right"}}>
                      <div style={{fontSize:16,fontWeight:300,color:parseFloat(diff)>0?(profil.objectif==="poids"?C.red:C.green):(profil.objectif==="poids"?C.green:C.red)}}>{parseFloat(diff)>0?"+":""}{diff}kg</div>
                      <div style={{fontSize:9,color:C.mid}}>depuis le début</div>
                    </div>}
                  </Row>
                  <svg viewBox="0 0 280 55" style={{width:"100%",height:55,display:"block"}}>
                    {(()=>{
                      const vals=weightLog.map(w=>w.v);
                      const mn=Math.min(...vals)*0.995,mx=Math.max(...vals)*1.005;
                      const pts=weightLog.map((w,i)=>{const x=(i/(weightLog.length-1))*280;const y=55-((w.v-mn)/(mx-mn||1))*50;return`${x},${y}`;}).join(" ");
                      return(<>
                        <polyline points={pts} fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        {weightLog.map((w,i)=>{const x=(i/(weightLog.length-1))*280;const y=55-((w.v-mn)/(mx-mn||1))*50;return<circle key={i} cx={x} cy={y} r={3} fill={C.gold}/>;} )}
                      </>);
                    })()}
                  </svg>
                  <Row style={{justifyContent:"space-between",marginTop:2}}>
                    <span style={{fontSize:9,color:C.dim}}>{weightLog[0]?.date}</span>
                    <span style={{fontSize:9,color:C.dim}}>{weightLog[weightLog.length-1]?.date}</span>
                  </Row>
                </div>
              )}
              {weightLog.length===0&&<div style={{textAlign:"center",padding:"12px 0",fontSize:12,color:C.mid,marginBottom:10}}>Enregistrez votre première pesée pour voir votre progression.</div>}
              {weightLog.length===1&&(
                <Row style={{justifyContent:"space-between",marginBottom:10}}>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:300,color:C.gold,letterSpacing:-1}}>{lastWeight?.v}<span style={{fontSize:12,color:C.mid,fontFamily:"'Inter',sans-serif"}}> kg</span></div>
                    <div style={{fontSize:10,color:C.mid}}>Pesée du {lastWeight?.date}</div>
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
                    }} style={{padding:"11px 14px",background:C.goldD,border:`0.5px solid ${C.goldB}`,borderRadius:9,color:C.gold,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"}}>✓ OK</button>
                    <button onClick={()=>setShowWeightInput(false)} style={{padding:"11px 10px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.mid,cursor:"pointer",fontSize:14}}>×</button>
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
            {icon:"📅",l:"Planification",sub:"Calendrier",fn:()=>{setTab("program");setPView("calendar");}},
            {icon:"📊",l:"Progression",sub:"Statistiques",fn:()=>{setTab("program");setPView("stats");}},
            {icon:"🏋️",l:"Mon programme",sub:"Créer & suivre",fn:()=>{setTab("program");setPView("creer");}},
            {icon:"◈",l:"Analyse morpho",sub:"Premium",fn:()=>{if(!premium)setPaywall(true);else{setTab("program");setPView("analyse");}},prem:true},
          ].map((a,i)=>(
            <Box key={i} onClick={a.fn} style={{marginBottom:0,cursor:"pointer",background:a.prem?"rgba(200,150,62,0.06)":C.s1,borderColor:a.prem?C.goldB:C.s3}}>
              <div style={{fontSize:22,marginBottom:7}}>{a.icon}</div>
              <div style={{fontSize:12,fontWeight:500,color:a.prem?C.gold:C.text}}>{a.l}</div>
              <div style={{fontSize:10,color:C.mid,marginTop:2}}>{a.sub}</div>
            </Box>
          ))}
        </G2>
        {imc&&(
          <Box style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,color:C.mid,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>IMC</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,color:C.gold,letterSpacing:-0.5,fontWeight:300}}>{imc}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:500,color:imc<18.5?C.blue:imc<25?C.green:imc<30?C.orange:C.red}}>{imc<18.5?"Maigreur":imc<25?"Normal ✓":imc<30?"Surpoids":"Obésité"}</div>
              <div style={{fontSize:10,color:C.mid,marginTop:2}}>{profil.poids}kg · {profil.taille}cm</div>
            </div>
          </Box>
        )}
      </div>
    );
  };
  const Stats=()=>{
    if(!prog)return(
      <Box style={{textAlign:"center",padding:"40px 20px",margin:"0 15px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,opacity:.1,fontWeight:300,marginBottom:12}}>STATS</div>
        <div style={{fontSize:13,color:C.mid,lineHeight:1.6}}>Créez un programme et enregistrez vos séances pour voir votre progression.</div>
      </Box>
    );
    const allH={};
    prog.jours.forEach(j=>j.exercices.forEach(ex=>{if(ex.historique.length>0){if(!allH[ex.nom])allH[ex.nom]=[];allH[ex.nom].push(...ex.historique);}}));
    const seancesFaites=prog.jours.filter(j=>j.complete).length;
    const vol=Object.values(allH).flat().reduce((a,h)=>a+((parseFloat(h.poids)||0)*(parseFloat(String(h.reps).split("-")[0])||0)),0);
    const records=Object.entries(allH).map(([n,h])=>({n,max:Math.max(...h.map(x=>parseFloat(x.poids)||0)),c:h.length})).sort((a,b)=>b.max-a.max);
    const colors=[C.gold,C.green,C.blue,C.orange,C.purple,C.red];
    return(
      <div style={{padding:"0 15px"}} className="anim">
        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:9}}>
          {[
            {l:"Séances",v:seancesFaites,c:C.gold},
            {l:"Volume",v:`${Math.round(vol).toLocaleString("fr-FR")}`,u:"kg",c:C.green},
            {l:"Semaine",v:`${semC+1}/6`,c:C.blue}
          ].map(s=>(
            <Box key={s.l} style={{marginBottom:0,textAlign:"center",padding:"14px 6px"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:s.c,letterSpacing:-0.5,lineHeight:1}}>
                {s.v}{s.u&&<span style={{fontSize:11,color:C.mid,marginLeft:2,fontWeight:500}}>{s.u}</span>}
              </div>
              <div style={{fontSize:10,color:C.mid,marginTop:5,letterSpacing:"0.3px"}}>{s.l}</div>
            </Box>
          ))}
        </div>
        {/* Séances complétées */}
        {seancesFaites>0&&(
          <Box>
            <Lbl>Progression des séances</Lbl>
            {prog.jours.map((jour,i)=>{
              const int=INT[jour.intensite||"modere"];
              return(
                <Row key={i} style={{marginBottom:8,paddingBottom:8,borderBottom:i<prog.jours.length-1?`1px solid ${C.s3}`:"none"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:jour.complete?C.green:int.c,marginRight:10,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:jour.complete?C.text:C.mid,fontWeight:jour.complete?600:400}}>{jour.nom}</div>
                    <div style={{fontSize:10,color:C.mid,marginTop:2}}>{jour.focus}</div>
                  </div>
                  {jour.complete&&<div style={{fontSize:10,color:C.green,fontWeight:600}}>✓ {jour.date}</div>}
                </Row>
              );
            })}
          </Box>
        )}
        {/* Courbes */}
        {Object.entries(allH).length>0?(
          <div>
            <Lbl>Progression par exercice</Lbl>
            {Object.entries(allH).slice(0,6).map(([nom,h],i)=>{
              const data=[...h].sort((a,b)=>{
                const[da,ma,ya]=(a.date||"").split("/").map(Number);
                const[db,mb,yb]=(b.date||"").split("/").map(Number);
                return new Date(ya||0,(ma||1)-1,da||0)-new Date(yb||0,(mb||1)-1,db||0);
              });
              return(
                <Box key={i}>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:12,fontFamily:"'Syne',sans-serif"}}>{nom}</div>
                  <MiniChart data={data} color={colors[i%6]}/>
                  <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.s3}`,display:"flex",gap:12,fontSize:10,color:C.mid}}>
                    <span>{data.length} séances</span>
                    <span>·</span>
                    <span>Max : <span style={{color:C.gold,fontWeight:700}}>{Math.max(...data.map(d=>parseFloat(d.poids)||0))}kg</span></span>
                  </div>
                </Box>
              );
            })}
            {/* Records personnels */}
            <Box>
              <Lbl>Records personnels</Lbl>
              {records.slice(0,10).map((r,i)=>(
                <Row key={i} style={{padding:"10px 0",borderBottom:i<Math.min(records.length,10)-1?`1px solid ${C.s3}`:"none",justifyContent:"space-between"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:C.text}}>{r.n}</div>
                    <div style={{fontSize:10,color:C.mid,marginTop:2}}>{r.c} séance{r.c>1?"s":""}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:300,color:i===0?C.gold:C.text,letterSpacing:-0.5}}>{r.max}</span>
                    <span style={{fontSize:10,color:C.mid}}>kg</span>
                    {i===0&&<span style={{marginLeft:4,fontSize:12}}>🏆</span>}
                  </div>
                </Row>
              ))}
            </Box>
            {/* Motivation */}
            <Box style={{background:`linear-gradient(135deg,rgba(212,168,83,0.08),rgba(212,168,83,0.02))`,border:`0.5px solid ${C.goldB}`,textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:8}}>💪</div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.6,fontWeight:500}}>
                {seancesFaites<5?"Vous êtes sur la bonne voie ! Continuez à enregistrer vos séances.":
                 seancesFaites<15?"Excellent travail ! Votre consistance paye déjà.":
                 "Performance remarquable ! Vous êtes un(e) vrai(e) athlète."}
              </div>
            </Box>
          </div>
        ):(
          <Box>
            <Lbl>Courbes de progression</Lbl>
            <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:C.mid,lineHeight:1.7}}>
              Enregistrez vos poids et répétitions<br/>
              dans les séances pour voir vos courbes.
            </div>
          </Box>
        )}
        {/* Historique des cycles précédents */}
        {cycles.length>0&&(
          <div style={{marginTop:4}}>
            <Lbl>Historique des cycles</Lbl>
            {cycles.map((c,i)=>{
              const sf=c.jours?c.jours.filter(j=>j.complete).length:0;
              const totalEx=c.jours?c.jours.reduce((a,j)=>a+j.exercices.length,0):0;
              return(
                <Box key={i} style={{borderLeft:`2px solid ${C.goldB}`,opacity:0.85}}>
                  <Row style={{justifyContent:"space-between",marginBottom:6}}>
                    <div>
                      <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>
                        Cycle {c.numero||i+1} · Archivé
                      </div>
                      <div style={{fontSize:13,fontWeight:500}}>{c.titre}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,color:C.green,fontWeight:600}}>{sf} séances</div>
                      <div style={{fontSize:10,color:C.mid}}>{c.archiveDate||c.dateDebut}</div>
                    </div>
                  </Row>
                  {c.morpho?.resume&&(
                    <div style={{fontSize:11,color:C.mid,lineHeight:1.5,marginBottom:6,fontStyle:"italic"}}>
                      {c.morpho.resume}
                    </div>
                  )}
                  {c.chargesResume&&(
                    <div style={{padding:"7px 9px",background:C.s2,borderRadius:7,fontSize:10,color:C.mid}}>
                      <span style={{color:C.gold,fontWeight:700}}>Records : </span>{c.chargesResume}
                    </div>
                  )}
                </Box>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  const Calendar=()=>{
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
            <div style={{fontSize:12,color:C.mid,marginBottom:14}}>Durée de la séance ?</div>
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
              <Lbl style={{marginBottom:4}}>Cycle {prog.numero||1} · 6 semaines</Lbl>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:500}}>{prog.titre}</div>
              {prog.dateDebut&&<div style={{fontSize:10,color:C.mid,marginTop:2}}>Démarré le {prog.dateDebut}</div>}
            </div>
            {jR!==null&&jR<=7&&(
              <div style={{padding:"5px 10px",background:"rgba(224,136,58,0.15)",border:"1px solid rgba(224,136,58,0.3)",borderRadius:8,fontSize:10,color:"#f97316",fontWeight:500,flexShrink:0}}>J-{jR}</div>
            )}
          </Row>
          {jR===0&&(
            <div style={{padding:"12px 14px",background:"rgba(62,199,122,0.1)",border:"1px solid rgba(62,199,122,0.3)",borderRadius:10,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:500,color:C.green,marginBottom:4}}>🏆 Cycle terminé !</div>
              <div style={{fontSize:11,color:C.mid,marginBottom:10,lineHeight:1.5}}>Démarrez un nouveau cycle pour continuer votre progression.</div>
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
          {prog.jours.map((j,i)=>{
            const int=INT[j.intensite||"modere"];
            const total=j.exercices?.length||0;
            const done=j.exercices?.filter((_,idx)=>checkedEx[`${j.id}-${idx}`]).length||0;
            return(
              <Row key={i} onClick={()=>{setTab("program");setProgView("today");}} style={{padding:"10px 12px",background:C.s2,borderRadius:9,marginBottom:5,cursor:"pointer",border:"0.5px solid #dce8f4"}}>
                <div style={{width:3,height:36,borderRadius:1.5,background:int.c,marginRight:10,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:2}}>{int.l}</div>
                  <div style={{fontSize:13,fontWeight:500}}>{j.nom}</div>
                  <div style={{fontSize:10,color:C.mid}}>{j.focus} · {total} exercices</div>
                </div>
                <Row style={{gap:8,alignItems:"center"}}>
                  {done>0&&<div style={{fontSize:10,color:C.green,fontWeight:700}}>{done}/{total}</div>}
                  {j.complete&&<div style={{fontSize:10,color:C.green}}>✓</div>}
                  <div style={{color:C.dim,fontSize:16}}>›</div>
                </Row>
              </Row>
            );
          })}
        </Box>
      )}
      {!prog&&(
        <Box style={{textAlign:"center",padding:"24px 20px"}}>
          <div style={{fontSize:13,color:C.mid,marginBottom:16}}>Créez un programme pour planifier vos séances.</div>
          <Btn onClick={()=>{setTab("program");setProgView("creer");}}>Créer un programme</Btn>
          <Btn v="out" onClick={()=>{if(!premium)setPaywall(true);else{setTab("program");setProgView("analyse");}}}>Programme personnalisé ◈</Btn>
        </Box>
      )}
    </div>
    );
  };
  const Seances=()=>{
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
            <div style={{fontSize:11,color:C.mid}}>{s.focus} · {s.duree}</div>
          </div>
          <button onClick={()=>setChrono(true)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.mid,cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500,marginBottom:10}}>⏱ Chronomètre de repos</button>
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
                    <button onClick={()=>setExEdit(e=>({...e,[j]:!e[j]}))} style={{padding:"4px 8px",background:editParams?"rgba(212,168,83,0.15)":C.s2,border:`1px solid ${editParams?C.gold:C.s3}`,borderRadius:6,color:editParams?C.gold:C.mid,cursor:"pointer",fontSize:10,fontFamily:"'Inter',sans-serif"}}>✏️</button>
                    <button onClick={()=>setExDetails(e=>({...e,[j]:!e[j]}))} style={{padding:"4px 8px",background:showDetails?"rgba(77,143,224,0.15)":C.s2,border:`1px solid ${showDetails?C.blue:C.s3}`,borderRadius:6,color:showDetails?C.blue:C.mid,cursor:"pointer",fontSize:10,fontFamily:"'Inter',sans-serif"}}>{showDetails?"▲":"▼"}</button>
                  </div>
                </Row>
                {/* Params — affichage ou modification */}
                {!editParams?(
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                    {[{l:"Sets",v:ex.series},{l:"Reps",v:ex.reps},{l:"Repos",v:ex.repos},{l:"Charge",v:ex.charge}].filter(s=>s.v).map(s=>(
                      <div key={s.l} style={{padding:"4px 9px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:6,textAlign:"center"}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,color:C.gold,fontWeight:500}}>{s.v}</div>
                        <div style={{fontSize:9,color:C.mid}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{background:C.s2,borderRadius:8,padding:"10px 10px",marginBottom:10}}>
                    <div style={{fontSize:10,color:C.gold,fontWeight:700,marginBottom:8}}>Modifier les paramètres</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {[
                        {l:"Séries",k:"series",v:ex.series},
                        {l:"Reps",k:"reps",v:ex.reps},
                        {l:"Repos",k:"repos",v:ex.repos},
                        {l:"Charge",k:"charge",v:ex.charge},
                      ].map(p=>(
                        <div key={p.k}>
                          <div style={{fontSize:9,color:C.mid,marginBottom:3}}>{p.l}</div>
                          <input defaultValue={p.v} onBlur={e=>{
                            const u=[...prog.jours];
                            u[seance].exercices[j][p.k]=e.target.value;
                            setProg({...prog,jours:u});
                          }} style={{width:"100%",padding:"7px 9px",background:C.s3,border:"0.5px solid #dce8f4",borderRadius:6,color:C.text,fontSize:12,fontFamily:"'Inter',sans-serif"}}/>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>setExEdit(e=>({...e,[j]:false}))} style={{marginTop:8,padding:"6px 12px",background:"rgba(62,199,122,0.1)",border:"1px solid rgba(62,199,122,0.3)",borderRadius:6,color:C.green,cursor:"pointer",fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:600}}>✓ Enregistrer</button>
                  </div>
                )}
                {/* Morpho tip */}
                {ex.morpho_tip&&<div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:C.mid,lineHeight:1.5,marginBottom:6}}><span style={{color:C.gold,fontWeight:700}}>Morpho · </span>{ex.morpho_tip}</div>}
                {/* Détails dépliables : tips + erreurs + variantes */}
                {showDetails&&(
                  <div style={{borderTop:`1px solid ${C.s3}`,paddingTop:10,marginTop:4,marginBottom:8}}>
                    {/* Morpho depuis D */}
                    {exInfo?.m&&(
                      <div style={{padding:"8px 10px",background:C.goldD,borderRadius:7,fontSize:11,color:C.mid,lineHeight:1.5,marginBottom:8}}>
                        <span style={{color:C.gold,fontWeight:700}}>Morpho · </span>{exInfo.m}
                      </div>
                    )}
                    {/* Technique Delavier depuis le programme IA */}
                    {ex.technique&&(
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:9,color:C.blue,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>Technique</div>
                        <div style={{fontSize:11,color:C.mid,lineHeight:1.6,fontStyle:"italic"}}>⟡ {ex.technique}</div>
                      </div>
                    )}
                    {/* Tips */}
                    {exInfo?.t?.length>0&&(
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Tips</div>
                        {exInfo.t.map((tip,ti)=>(
                          <div key={ti} style={{display:"flex",gap:7,marginBottom:4}}>
                            <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(62,199,122,0.12)",border:"1px solid rgba(62,199,122,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0,marginTop:1}}>{ti+1}</div>
                            <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{tip}</div>
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
                            <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{err}</div>
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
                {/* Progression */}
                {ex.historique.length>=2&&(
                  <div style={{marginBottom:9,padding:"8px 10px",background:C.s2,borderRadius:8}}>
                    <MiniChart data={ex.historique.slice(-6).map(h=>({...h,poids:parseFloat(h.poids)||0}))} color={cc} height={50}/>
                  </div>
                )}
                {ex.historique.slice(-2).map((h,k)=>(
                  <div key={k} style={{fontSize:10,color:C.mid,marginBottom:2}}>· <span style={{color:C.green}}>{h.poids}kg</span> × {h.reps} — {h.date}</div>
                ))}
                {/* Saisie */}
                <Row style={{gap:6,marginTop:8}}>
                  <Inp style={{flex:1,marginBottom:0}} type="number" placeholder={last?`Dernier: ${last.poids}kg`:"Poids (kg)"} id={`p${j}`}/>
                  <Inp style={{width:66,marginBottom:0}} type="number" placeholder="Reps" id={`r${j}`}/>
                  <button onClick={()=>{
                    const p=document.getElementById(`p${j}`)?.value;const r=document.getElementById(`r${j}`)?.value;
                    if(!p)return;
                    const u=[...prog.jours];u[seance].exercices[j].historique.push({poids:parseFloat(p),reps:r||ex.reps,date:new Date().toLocaleDateString("fr-FR")});
                    setProg({...prog,jours:u});document.getElementById(`p${j}`).value="";document.getElementById(`r${j}`).value="";
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
                  <div style={{fontSize:11,color:C.mid,marginTop:2}}>{j.focus} · {j.exercices.length} ex.</div>
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
        <button onClick={()=>setChrono(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:13,background:"transparent",border:"0.5px solid #dce8f4",borderRadius:11,color:C.mid,cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",marginBottom:8}}>⏱ Chronomètre de repos</button>
      </div>
    );
  };
  const Creer=()=>{
    if(createStep===0)return(
      <div style={{padding:"0 15px"}}>
        <Box>
          <Lbl>Nouveau programme</Lbl>
          <Inp placeholder="Nom du programme" value={newP.nom} onChange={e=>setNewP({...newP,nom:e.target.value})}/>
          <Lbl>Jours d'entraînement</Lbl>
          <div style={{display:"flex",flexWrap:"wrap",marginBottom:12}}>
            {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=>(
              <Tag key={j} active={newP.jours.includes(j)} onClick={()=>setNewP(p=>({...p,jours:p.jours.includes(j)?p.jours.filter(x=>x!==j):[...p.jours,j]}))}>{j}</Tag>
            ))}
          </div>
          <Btn disabled={!newP.nom||newP.jours.length===0} onClick={()=>{const s={};newP.jours.forEach(j=>s[j]={nom:"",intensite:"modere",exercices:[]});setNewP({...newP,seances:s});setJourActif(newP.jours[0]);setCS(1);}}>Construire les séances →</Btn>
        </Box>
      </div>
    );
    const jc=jourActif||newP.jours[0];
    const sean=newP.seances?.[jc]||{nom:"",intensite:"modere",exercices:[]};
    return(
      <div style={{padding:"0 15px"}}>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:12,paddingBottom:2}}>
          {newP.jours.map(j=>(
            <button key={j} onClick={()=>setJourActif(j)} style={{padding:"6px 12px",background:jc===j?C.goldD:C.s2,border:`1px solid ${jc===j?C.gold:C.s3}`,borderRadius:16,color:jc===j?C.gold:C.mid,cursor:"pointer",fontSize:11,whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif",fontWeight:600}}>
              {j} {newP.seances?.[j]?.exercices.length>0?`(${newP.seances[j].exercices.length})`:""}
            </button>
          ))}
        </div>
        <Box>
          <Inp placeholder={`Nom séance ${jc}`} value={sean.nom||""} onChange={e=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,nom:e.target.value}}}))}/>
          <Lbl>Intensité</Lbl>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {Object.entries(INT).map(([k,v])=>(
              <div key={k} onClick={()=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,intensite:k}}}))} style={{padding:"5px 10px",background:sean.intensite===k?`${v.c}18`:C.s2,border:`1px solid ${sean.intensite===k?v.c:C.s3}`,borderRadius:7,cursor:"pointer",fontSize:11,color:sean.intensite===k?v.c:C.mid,fontWeight:sean.intensite===k?700:400}}>{v.l}</div>
            ))}
          </div>
          {sean.exercices.map((ex,i)=>(
            <Row key={i} style={{justifyContent:"space-between",padding:"8px 10px",background:C.s2,borderRadius:7,marginBottom:5}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{ex.nom}</div><div style={{fontSize:10,color:C.mid}}>{ex.series}×{ex.reps} · {ex.repos}</div></div>
              <button onClick={()=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,exercices:sean.exercices.filter((_,j)=>j!==i)}}}))} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:15}}>×</button>
            </Row>
          ))}
          <Lbl style={{marginTop:10}}>Bibliothèque d'exercices</Lbl>
          <div style={{display:"flex",flexWrap:"wrap",marginBottom:10}}>
            {Object.keys(EX).map(g=>(
              <Tag key={g} active={groupe===g} onClick={()=>setGroupe(g===groupe?null:g)}>{g}</Tag>
            ))}
          </div>
          {groupe&&EX[groupe].map((ex,i)=>{
            const cc={principal:"#3b82f6",correctif:"#f87171",mobilite:"#06b6d4",gainage:"#22c55e",isolation:"#8b5cf6"}[ex.cat]||"#3b82f6";
            return(
              <div key={i} style={{background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
                <div style={{padding:"11px 13px"}}>
                  <Row style={{justifyContent:"space-between",marginBottom:6}}>
                    <div style={{flex:1}}>
                      <div style={{display:"inline-block",padding:"2px 8px",background:`${cc}14`,borderRadius:5,fontSize:9,color:cc,fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:5}}>{ex.cat}</div>
                      <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e",marginBottom:2}}>{ex.n}</div>
                      <div style={{fontSize:10,color:"#a0b4cc"}}>{ex.s}×{ex.r} · {ex.rest} · {ex.ch}</div>
                    </div>
                  </Row>
                  <div style={{fontSize:11,color:"#a0b4cc",fontStyle:"italic",lineHeight:1.5,marginBottom:8}}>{(ex.morpho||"").substring(0,90)}…</div>
                  <Row style={{gap:7}}>
                    <button onClick={()=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,exercices:[...sean.exercices,{nom:ex.n,cat:ex.cat,series:ex.s,reps:ex.r,repos:ex.rest,charge:ex.ch,prog:ex.prog||"",morpho_tip:ex.morpho,historique:[],note:""}]}}}))} style={{flex:1,padding:"7px 10px",background:"#3b82f6",border:"none",borderRadius:8,color:"#ffffff",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>+ Ajouter</button>
                    <button onClick={e=>{e.stopPropagation();setExModal(ex);}} style={{padding:"7px 12px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,color:"#3b82f6",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>Guide ›</button>
                  </Row>
                </div>
              </div>
            );
          })}
          {exModal&&(
            <div style={{position:"fixed",inset:0,background:"rgba(237,243,251,0.98)",zIndex:300,overflowY:"auto"}}>
              <div style={{maxWidth:500,margin:"0 auto",padding:"0 0 80px"}}>
                <div style={{padding:"20px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"inline-block",padding:"3px 10px",background:"rgba(59,130,246,0.1)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,fontSize:10,color:"#3b82f6",letterSpacing:"1px",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>{exModal.cat}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:400,lineHeight:1.2,color:"#0f1a2e",marginBottom:4}}>{exModal.n}</div>
                    <div style={{fontSize:11,color:"#a0b4cc"}}>{exModal.s} séries · {exModal.r} reps · {exModal.rest}</div>
                  </div>
                  <button onClick={()=>setExModal(null)} style={{background:"#edf3fb",border:"0.5px solid #dce8f4",borderRadius:10,width:36,height:36,color:"#a0b4cc",cursor:"pointer",fontSize:18,flexShrink:0,marginLeft:12}}>×</button>
                </div>
                <div style={{padding:"12px 16px",display:"flex",gap:7,flexWrap:"wrap"}}>
                  {[{l:"Séries",v:exModal.s},{l:"Reps",v:exModal.r},{l:"Repos",v:exModal.rest},{l:"Charge",v:exModal.ch}].map(s=>(
                    <div key={s.l} style={{padding:"8px 10px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10,textAlign:"center",flex:1,minWidth:60}}>
                      <div style={{fontSize:14,fontWeight:400,color:"#3b82f6",fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
                      <div style={{fontSize:9,color:"#a0b4cc",marginTop:2}}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"0 16px",display:"flex",gap:6,marginBottom:14}}>
                  {[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}].map(t=>(
                    <button key={t.id} onClick={()=>setExModalTab(t.id)} style={{padding:"6px 13px",background:exModalTab===t.id?"rgba(59,130,246,0.08)":"transparent",border:`0.5px solid ${exModalTab===t.id?"#3b82f6":"#dce8f4"}`,borderRadius:20,color:exModalTab===t.id?"#3b82f6":"#a0b4cc",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>{t.l}</button>
                  ))}
                </div>
                <div style={{padding:"0 16px"}}>
                  {exModalTab==="tips"&&(
                    <Box>
                      <Lbl>Conseils techniques</Lbl>
                      {(exModal.tips||[]).map((tip,i)=>(
                        <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(exModal.tips.length-1)?"0.5px solid #dce8f4":"none"}}>
                          <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(59,130,246,0.1)",border:"0.5px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#3b82f6"}}>{i+1}</div>
                          <div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.6}}>{tip}</div>
                        </div>
                      ))}
                      {exModal.prog&&<div style={{marginTop:4,padding:"10px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:9}}><div style={{fontSize:10,color:"#22c55e",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>Progression</div><div style={{fontSize:12,color:"#a0b4cc",lineHeight:1.5}}>{exModal.prog}</div></div>}
                    </Box>
                  )}
                  {exModalTab==="variantes"&&(
                    <div>
                      {(exModal.variantes||[]).map((v,i)=>(
                        <Box key={i}>
                          <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e",marginBottom:5}}>{v.nom||v}</div>
                          {v.note&&<div style={{fontSize:11,color:"#a0b4cc",lineHeight:1.5}}>{v.note}</div>}
                        </Box>
                      ))}
                    </div>
                  )}
                  {exModalTab==="erreurs"&&(
                    <Box>
                      <Lbl>Erreurs à éviter</Lbl>
                      {(exModal.erreurs||[]).map((e,i)=>(
                        <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                          <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(248,113,113,0.1)",border:"0.5px solid rgba(248,113,113,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#f87171"}}>✕</div>
                          <div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.5}}>{e}</div>
                        </div>
                      ))}
                    </Box>
                  )}
                  {exModalTab==="morpho"&&(
                    <Box>
                      <Lbl>Adaptation morphologique</Lbl>
                      <div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.8}}>{exModal.morpho}</div>
                    </Box>
                  )}
                </div>
                <div style={{padding:"12px 16px 0"}}>
                  <Btn onClick={()=>{setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,exercices:[...sean.exercices,{nom:exModal.n,cat:exModal.cat,series:exModal.s,reps:exModal.r,repos:exModal.rest,charge:exModal.ch,prog:exModal.prog||"",morpho_tip:exModal.morpho,historique:[],note:""}]}}}));setExModal(null);}}>+ Ajouter cet exercice</Btn>
                  <Btn v="ghost" onClick={()=>setExModal(null)}>← Retour</Btn>
                </div>
              </div>
            </div>
          )}
        </Box>
        <Btn onClick={()=>{
          const jours=newP.jours.map((j,i)=>({id:i+1,nom:newP.seances[j]?.nom||`Séance ${j}`,focus:j,duree:"45-60 min",intensite:newP.seances[j]?.intensite||"modere",exercices:(newP.seances[j]?.exercices||[]).map(ex=>({...ex,historique:[],note:""})),complete:false,date:null,note:""}));
          const newProg={titre:newP.nom,type:"custom",jours};
          setProg(newProg);setCycleStart(Date.now());
          const today=new Date();
          const joursMap={"Lun":1,"Mar":2,"Mer":3,"Jeu":4,"Ven":5,"Sam":6,"Dim":0};
          const newSess={};
          jours.forEach(jour=>{
            const match=Object.entries(joursMap).find(([k])=>jour.focus.startsWith(k));
            if(match){
              for(let w=0;w<6;w++){
                const dateObj2=new Date(today);
                dateObj2.setDate(dateObj2.getDate()+((match[1]-dateObj2.getDay()+7)%7||7)+w*7);
                const key=`${dateObj2.getFullYear()}-${String(dateObj2.getMonth()+1).padStart(2,"0")}-${String(dateObj2.getDate()).padStart(2,"0")}`;
                newSess[key]={nom:jour.nom,intensite:jour.intensite||"modere",color:INT[jour.intensite||"modere"].c};
              }
            }
          });
          setCalSess(prev=>({...prev,...newSess}));
          setPView("calendar");setCS(0);
          push("✅","Programme créé !",`${newP.nom} · Calendrier mis à jour !`);
        }}>✓ Enregistrer le programme</Btn>
        <Btn v="ghost" onClick={()=>setCS(0)}>← Retour</Btn>
      </div>
    );
  };
  const AnalyseIA=()=>{
    if(loadIA)return(
      <div style={{padding:"0 15px"}}>
        <Box style={{textAlign:"center",padding:"46px 20px"}}>
          {loadMsg.startsWith("Erreur")?<>
            <div style={{fontSize:36,marginBottom:14}}>❌</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,color:C.red,fontWeight:500,marginBottom:10}}>Génération échouée</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:16,lineHeight:1.6}}>{loadMsg}</div>
            <Btn onClick={()=>{setLoadIA(false);setLoadMsg("");}}>← Réessayer</Btn>
          </>:<>
            <div style={{width:48,height:48,border:`3px solid ${C.goldD}`,borderTop:`3px solid ${C.gold}`,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 18px"}}/>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,color:C.gold,fontWeight:300,marginBottom:8}}>{loadMsg}</div>
            <div style={{fontSize:11,color:C.mid,lineHeight:1.7}}>
              Analyse morphologique + génération<br/>du programme personnalisé en cours…
            </div>
          </>}
        </Box>
      </div>
    );
    const steps=["Photo","Profil","Objectif","Pathologies","Matériel"];
    return(
      <div style={{padding:"0 15px"}}>
        <div style={{display:"flex",gap:3,marginBottom:14}}>
          {steps.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=aStep?C.gold:"rgba(255,255,255,0.07)"}}/>)}
        </div>
        <div style={{fontSize:10,color:C.mid,marginBottom:12,letterSpacing:"0.5px"}}>ÉTAPE {aStep+1}/{steps.length} — {steps[aStep].toUpperCase()}</div>
        {aStep===0&&<Box>
          <Lbl>Photos de posture</Lbl>
          <div style={{padding:"10px 12px",background:C.goldD,border:`0.5px solid ${C.goldB}`,borderRadius:8,fontSize:12,color:C.mid,marginBottom:14,lineHeight:1.6}}>
            📸 3 photos permettent une analyse morphologique précise. Position droite, vêtements près du corps. Vous pouvez utiliser votre galerie ou prendre de nouvelles photos.
          </div>
          {/* 3 zones photo */}
          {[
            {key:"face",  label:"De face",   icon:"🧍", desc:"Face à l'objectif, bras le long du corps"},
            {key:"dos",   label:"De dos",    icon:"🔄", desc:"Dos à l'objectif, bras le long du corps"},
            {key:"profil",label:"De profil", icon:"↔️", desc:"Côté droit ou gauche, position droite"},
          ].map(({key,label,icon,desc})=>(
            <div key={key} style={{marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:500,color:photos[key]?C.green:C.text,marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
                {photos[key]
                  ? <span style={{color:C.green}}>✓</span>
                  : <span style={{opacity:0.4}}>○</span>
                }
                {label}
              </div>
              <div onClick={()=>{
                const ref={face:fileRefFace,dos:fileRefDos,profil:fileRefProfil}[key];
                ref.current.click();
              }} style={{border:`1.5px dashed ${photos[key]?"rgba(62,199,122,0.4)":C.goldB}`,borderRadius:10,height:120,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",background:C.s2,position:"relative"}}>
                {photos[key]
                  ? <img src={photos[key]} alt={label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <>
                      <div style={{fontSize:28,marginBottom:4}}>{icon}</div>
                      <div style={{fontSize:11,color:C.gold,fontWeight:600}}>Galerie ou appareil photo</div>
                      <div style={{fontSize:10,color:C.mid,marginTop:2,textAlign:"center",padding:"0 10px"}}>{desc}</div>
                    </>
                }
                {photos[key]&&(
                  <div style={{position:"absolute",top:6,right:6,background:"rgba(8,9,13,0.7)",borderRadius:6,padding:"3px 8px",fontSize:10,color:C.green,fontWeight:700}}>✓ {label}</div>
                )}
              </div>
            </div>
          ))}
          {/* inputs fichiers — sans capture="environment" pour accès galerie */}
          <input ref={fileRefFace}   type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("face",  e.target.files[0])}/>
          <input ref={fileRefDos}    type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("dos",   e.target.files[0])}/>
          <input ref={fileRefProfil} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("profil",e.target.files[0])}/>
          <div style={{marginTop:6,marginBottom:10,fontSize:11,color:C.mid,textAlign:"center"}}>
            {[photos.face,photos.dos,photos.profil].filter(Boolean).length}/3 photos ajoutées
            {photos.face&&photos.dos&&photos.profil&&<span style={{color:C.green,marginLeft:6,fontWeight:700}}>✓ Prêt !</span>}
          </div>
          <Btn disabled={!photos.face&&!photos.dos&&!photos.profil} onClick={()=>setAStep(1)}>
            {photos.face||photos.dos||photos.profil ? "Continuer →" : "Ajoutez au moins 1 photo"}
          </Btn>
        </Box>}
        {aStep===1&&<Box>
          <Lbl>Profil</Lbl>
          <div style={{fontSize:10,color:C.red,marginBottom:10}}>* Champs obligatoires</div>
          <div style={{fontSize:11,color:C.mid,marginBottom:4}}>Prénom <span style={{color:C.textMid}}>(facultatif)</span></div>
          <Inp placeholder="Prénom" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})}/>
          <G2>
            <div>
              <div style={{fontSize:11,color:C.mid,marginBottom:4}}>Âge <span style={{color:C.red}}>*</span></div>
              <Inp type="number" placeholder="Ex: 28" style={{marginBottom:0}} value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/>
            </div>
            <div>
              <div style={{fontSize:11,color:C.mid,marginBottom:4}}>Sexe <span style={{color:C.red}}>*</span></div>
              <select style={{width:"100%",padding:"11px 13px",background:C.s2,border:`1px solid ${form.sexe?C.green:C.s3}`,borderRadius:9,color:C.text,fontSize:13}} value={form.sexe} onChange={e=>setForm({...form,sexe:e.target.value})}>
                <option value="">Choisir…</option><option value="homme">Homme</option><option value="femme">Femme</option>
              </select>
            </div>
          </G2>
          <G2 style={{marginTop:6}}>
            <div>
              <div style={{fontSize:11,color:C.mid,marginBottom:4}}>Poids (kg) <span style={{color:C.red}}>*</span></div>
              <Inp type="number" placeholder="Ex: 75" style={{marginBottom:0,borderColor:form.poids?C.green:C.s3}} value={form.poids} onChange={e=>setForm({...form,poids:e.target.value})}/>
            </div>
            <div>
              <div style={{fontSize:11,color:C.mid,marginBottom:4}}>Taille (cm) <span style={{color:C.red}}>*</span></div>
              <Inp type="number" placeholder="Ex: 178" style={{marginBottom:0,borderColor:form.taille?C.green:C.s3}} value={form.taille} onChange={e=>setForm({...form,taille:e.target.value})}/>
            </div>
          </G2>
          <div style={{fontSize:11,color:C.mid,marginBottom:6,marginTop:6}}>Niveau <span style={{color:C.red}}>*</span></div>
          {[{id:"debutant",l:"Débutant",d:"< 1 an"},{id:"intermediaire",l:"Intermédiaire",d:"1-3 ans"},{id:"avance",l:"Avancé",d:"> 3 ans"}].map(n=>(
            <div key={n.id} onClick={()=>setForm({...form,niveau:n.id})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:form.niveau===n.id?C.goldD:C.s2,border:`1px solid ${form.niveau===n.id?C.gold:C.s3}`,borderRadius:9,cursor:"pointer",marginBottom:6}}>
              <span style={{fontSize:13,fontWeight:600}}>{n.l}</span><span style={{fontSize:10,color:C.mid}}>{n.d}</span>
            </div>
          ))}
          {(!form.age||!form.poids||!form.taille||!form.sexe||!form.niveau)&&(
            <div style={{padding:"8px 12px",background:"rgba(224,72,72,0.08)",border:"1px solid rgba(224,72,72,0.2)",borderRadius:8,fontSize:11,color:C.red,marginBottom:8}}>
              Remplis tous les champs marqués * pour continuer
            </div>
          )}
          <Btn disabled={!form.age||!form.poids||!form.taille||!form.sexe||!form.niveau} onClick={()=>setAStep(2)}>Continuer →</Btn>
          <Btn v="ghost" onClick={()=>setAStep(0)}>← Retour</Btn>
        </Box>}
        {aStep===2&&<Box>
          <div style={{fontSize:11,color:C.mid,marginBottom:8}}>Objectif principal <span style={{color:C.red}}>*</span></div>
          <G2>{[{id:"hypertrophie",i:"💪",l:"Prise de muscle"},{id:"force",i:"🏋️",l:"Force"},{id:"poids",i:"🔥",l:"Perte de poids"},{id:"reathletisation",i:"🩺",l:"Réathlé"},{id:"sante",i:"❤️",l:"Santé"},{id:"performance",i:"🏆",l:"Performance"}].map(o=>(
            <div key={o.id} onClick={()=>setForm({...form,objectif:o.id})} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:form.objectif===o.id?C.goldD:C.s2,border:`1px solid ${form.objectif===o.id?C.gold:C.s3}`,borderRadius:10}}>
              <div style={{fontSize:20,marginBottom:4}}>{o.i}</div><div style={{fontSize:11,fontWeight:400}}>{o.l}</div>
            </div>
          ))}</G2>
          <textarea style={{width:"100%",padding:"11px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.text,fontSize:13,minHeight:60,resize:"vertical",marginBottom:10,fontFamily:"'Inter',sans-serif"}} placeholder="Décrivez votre objectif précis (facultatif)" value={form.objectifPrecis} onChange={e=>setForm({...form,objectifPrecis:e.target.value})}/>
          <div style={{fontSize:11,color:C.mid,marginBottom:6}}>Jours d'entraînement <span style={{color:C.red}}>*</span></div>
          <div style={{display:"flex",flexWrap:"wrap",marginBottom:6}}>
            {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=>(
              <Tag key={j} active={form.jours.includes(j)} onClick={()=>setForm(f=>({...f,jours:f.jours.includes(j)?f.jours.filter(x=>x!==j):[...f.jours,j]}))}>{j}</Tag>
            ))}
          </div>
          {form.jours.length===0&&<div style={{fontSize:11,color:C.red,marginBottom:8}}>* Sélectionne au moins 1 jour</div>}
          {!form.objectif&&<div style={{fontSize:11,color:C.red,marginBottom:8}}>* Sélectionne un objectif</div>}
          <Btn disabled={!form.objectif||form.jours.length===0} onClick={()=>setAStep(3)}>Continuer →</Btn>
          <Btn v="ghost" onClick={()=>setAStep(1)}>← Retour</Btn>
        </Box>}
        {aStep===3&&<Box>
          <Lbl>Douleurs & Pathologies</Lbl>
          <div style={{padding:"8px 10px",background:C.goldD,border:`0.5px solid ${C.goldB}`,borderRadius:7,fontSize:11,color:C.mid,marginBottom:10,lineHeight:1.6}}>Exercices correctifs = renforcement uniquement. Consultez un kiné pour tout diagnostic.</div>
          {[{z:"Dos",p:["Lombalgie","Hernie discale","Scoliose","Cervicalgie"]},{z:"Épaule",p:["Conflit épaule","Coiffe rotateurs"]},{z:"Genou",p:["Ménisque","LCA","Tendinite","Arthrose"]},{z:"Autres",p:["Épicondylite","Canal carpien","Tendinite Achille","Coxarthrose"]}].map(zone=>(
            <div key={zone.z} style={{marginBottom:10}}>
              <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{zone.z}</div>
              <div style={{display:"flex",flexWrap:"wrap"}}>{zone.p.map(p=><Tag key={p} active={form.pathologies.includes(p)} onClick={()=>setForm(f=>({...f,pathologies:f.pathologies.includes(p)?f.pathologies.filter(x=>x!==p):[...f.pathologies.filter(x=>x!=="Aucune"),p]}))}>{p}</Tag>)}</div>
            </div>
          ))}
          <Tag active={form.pathologies.includes("Aucune")} onClick={()=>setForm(f=>({...f,pathologies:["Aucune"]}))}>Aucune pathologie</Tag>
          <div style={{marginTop:10}}><Btn disabled={form.pathologies.length===0} onClick={()=>setAStep(4)}>Continuer →</Btn><Btn v="ghost" onClick={()=>setAStep(2)}>← Retour</Btn></div>
        </Box>}
        {aStep===4&&<Box>
          <div style={{fontSize:11,color:C.mid,marginBottom:8}}>Matériel disponible <span style={{color:C.red}}>*</span></div>
          <G2>{[{id:"salle_complete",i:"🏋️",l:"Salle complète"},{id:"halteres",i:"💪",l:"Haltères"},{id:"elastiques",i:"🎯",l:"Élastiques"},{id:"barre_traction",i:"⬆️",l:"Barre traction"},{id:"poids_corps",i:"🤸",l:"Poids du corps"},{id:"machines",i:"⚙️",l:"Machines"}].map(m=>(
            <div key={m.id} onClick={()=>setForm(f=>({...f,materiel:f.materiel.includes(m.id)?f.materiel.filter(x=>x!==m.id):[...f.materiel,m.id]}))} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:form.materiel.includes(m.id)?C.goldD:C.s2,border:`1px solid ${form.materiel.includes(m.id)?C.gold:C.s3}`,borderRadius:10}}>
              <div style={{fontSize:20,marginBottom:4}}>{m.i}</div><div style={{fontSize:11,fontWeight:400}}>{m.l}</div>
            </div>
          ))}</G2>
          {form.materiel.length===0&&<div style={{fontSize:11,color:C.red,marginBottom:8}}>* Sélectionne au moins un équipement</div>}
          <Btn disabled={form.materiel.length===0} onClick={lancerIA}>🚀 Générer mon programme</Btn>
          <Btn v="ghost" onClick={()=>setAStep(3)}>← Retour</Btn>
        </Box>}
      </div>
    );
  };
  const Nutrition=()=>{
    const tot=totR();
    const all=[...FOODS,...myFoods];
    const filtered=search?all.filter(f=>f.n.toLowerCase().includes(search.toLowerCase())):[];

    // Score santé calculé
    const calcScore=()=>{
      let score=100;
      const totalItems=[...repas.matin,...repas.midi,...repas.soir,...repas.snack];
      const sucres=totalItems.reduce((a,f)=>a+(f.sucres||0),0);
      const fibres=totalItems.reduce((a,f)=>a+(f.fibres||0),0);
      const transformes=totalItems.filter(f=>f.cat==="Transformé"||f.cat==="Scanné").length;
      if(sucres>25) score-=20;
      else if(sucres>15) score-=10;
      if(transformes>2) score-=15;
      else if(transformes>1) score-=8;
      if(fibres<15) score-=10;
      if(eau<6) score-=15;
      else if(eau<4) score-=25;
      if(tot.p<pObj*0.7) score-=10;
      const repasNonVides=[repas.matin,repas.midi,repas.soir].filter(r=>r.length>0).length;
      if(repasNonVides<2) score-=10;
      return Math.max(0,Math.min(100,score));
    };
    const score=calcScore();
    const scoreLettre=score>=85?"A":score>=70?"B":score>=55?"C":score>=40?"D":"E";
    const scoreColor=score>=85?C.green:score>=70?"#8BC34A":score>=55?C.orange:score>=40?"#FF7043":C.red;

    const allItems=[...repas.matin,...repas.midi,...repas.soir,...repas.snack];
    const scoreDetails=[
      {l:"Sucres ajoutés",ok:allItems.reduce((a,f)=>a+(f.sucres||0),0)<=15,icon:"🍬"},
      {l:"Aliments transformés",ok:allItems.filter(f=>f.cat==="Transformé"||f.cat==="Scanné").length<=1,icon:"🏭"},
      {l:"Hydratation",ok:eau>=6,icon:"💧"},
      {l:"Apport protéines",ok:tot.p>=pObj*0.8,icon:"💪"},
      {l:"Diversité repas",ok:[repas.matin,repas.midi,repas.soir].filter(r=>r.length>0).length>=2,icon:"🥗"},
    ];

    // Anneau SVG
    const Ring=({pct,color,size=110,stroke=9,children})=>{
      const R=size/2-stroke;
      const CI=2*Math.PI*R;
      const offset=CI*(1-Math.min(1,pct/100));
      return(
        <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
          <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
            <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth={stroke}/>
            <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={stroke}
              strokeDasharray={CI} strokeDashoffset={offset} strokeLinecap="round"
              style={{transition:"stroke-dashoffset .8s ease"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>{children}</div>
        </div>
      );
    };

    const MiniRing=({pct,color,label,v,max})=>(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <div style={{position:"relative",width:56,height:56}}>
          <svg width={56} height={56} style={{transform:"rotate(-90deg)"}}>
            <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(200,150,62,0.06)" strokeWidth={5}/>
            <circle cx={28} cy={28} r={22} fill="none" stroke={color} strokeWidth={5}
              strokeDasharray={2*Math.PI*22} strokeDashoffset={2*Math.PI*22*(1-Math.min(1,pct/100))}
              strokeLinecap="round" style={{transition:"stroke-dashoffset .8s ease"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:10,fontWeight:700,color}}>{Math.round(pct)}%</span>
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.text}}>{v}g</div>
          <div style={{fontSize:9,color:C.mid}}>{label}</div>
          <div style={{fontSize:8,color:C.dim}}>/{max}g</div>
        </div>
      </div>
    );

    const calLeft=Math.max(0,calObj-tot.cal);
    const calPct=Math.min(100,tot.cal/calObj*100);

    return(
      <div style={{background:C.bg,minHeight:"100vh",paddingBottom:20}} className="anim">
        {/* Header */}
        <div style={{padding:"22px 16px 12px"}}>
          <div style={{fontSize:9,letterSpacing:"1.5px",color:"#a0b4cc",fontWeight:500,marginBottom:6,textTransform:"uppercase"}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:300,color:"#0f1a2e",letterSpacing:-1,lineHeight:1.1,marginBottom:2}}>Bonjour, <span style={{fontWeight:500,color:"#3b82f6"}}>{profil.prenom||"Hugo"}</span></div>
          <div style={{fontSize:11,color:"#a0b4cc"}}>{obj.l} · Cycle {prog?.numero||1}</div>
        </div>

        {/* Nav */}
        <div style={{display:"flex",gap:5,padding:"12px 15px",overflowX:"auto",paddingBottom:4}}>
          {[{id:"journal",l:"Journal"},{id:"scanner",l:"Scanner"},{id:"aliments",l:"Aliments"}].map(s=>(
            <button key={s.id} onClick={()=>setNView(s.id)} style={{padding:"7px 16px",background:nView===s.id?"rgba(59,130,246,0.08)":"transparent",border:`0.5px solid ${nView===s.id?"#3b82f6":"#dce8f4"}`,borderRadius:20,color:nView===s.id?"#3b82f6":"#a0b4cc",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap",fontFamily:"'Syne',sans-serif",letterSpacing:"0.3px"}}>{s.l}</button>
          ))}
        </div>

        {nView==="journal"&&(
          <div style={{padding:"0 15px"}}>
            {/* Anneau principal calories */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 16px",background:"#ffffff",borderRadius:18,marginBottom:12,border:"0.5px solid #dce8f4"}}>
              <Ring pct={calPct} color={tot.cal>calObj?"#f87171":"#3b82f6"} size={120} stroke={10}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:tot.cal>calObj?C.red:C.text,lineHeight:1,letterSpacing:-1}}>{calLeft}</div>
                <div style={{fontSize:9,color:C.mid,marginTop:2}}>kcal restantes</div>
              </Ring>
              <div style={{flex:1,marginLeft:20}}>
                <div style={{marginBottom:10}}>
                  <Row style={{justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:C.mid}}>Consommé</span>
                    <span style={{fontSize:12,fontWeight:500,color:tot.cal>calObj?C.red:C.text}}>{tot.cal} kcal</span>
                  </Row>
                  <Row style={{justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:C.mid}}>Objectif</span>
                    <span style={{fontSize:12,fontWeight:500}}>{calObj} kcal</span>
                  </Row>
                  <Row style={{justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:C.mid}}>Objectif</span>
                    <span style={{fontSize:11,color:C.gold}}>{obj.l}</span>
                  </Row>
                </div>
                {/* Score */}
                <div onClick={()=>setNView("score")} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:`${scoreColor}15`,border:`1px solid ${scoreColor}30`,borderRadius:9,cursor:"pointer"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:scoreColor,lineHeight:1}}>{scoreLettre}</div>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:scoreColor}}>Score santé</div>
                    <div style={{fontSize:9,color:C.mid}}>{score}/100 · Voir détail</div>
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
            <div style={{padding:"14px 16px",background:C.s1,borderRadius:14,marginBottom:12,border:"0.5px solid #dce8f4"}}>
              <Row style={{justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>Hydratation</div>
                  <div style={{fontSize:10,color:C.mid}}>{eau*250}ml / 2000ml</div>
                </div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:eau>=8?C.green:C.blue}}>{eau}/8</div>
              </Row>
              <div style={{display:"flex",gap:5,marginBottom:8}}>
                {[...Array(8)].map((_,i)=>(
                  <div key={i} onClick={()=>setEau(i<eau?i:i+1)} style={{flex:1,height:26,borderRadius:7,background:i<eau?`rgba(59,130,246,${0.25+i*0.09})`:"#dce8f4",cursor:"pointer",transition:"background .2s"}}/>
                ))}
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${eau/8*100}%`,background:C.blue,borderRadius:2,transition:"width .5s"}}/>
              </div>
            </div>

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
                      <div style={{fontSize:10,color:"#a0b4cc"}}>{repas[r.id].length>0?`${repas[r.id].length} aliment${repas[r.id].length>1?"s":""}`:"Aucun aliment"}</div>
                      {rTot.cal>0&&(
                        <div style={{display:"flex",gap:3,marginTop:4}}>
                          <div style={{height:2,borderRadius:1,background:"#C8963E",flex:rTot.cal,maxWidth:"60%"}}/>
                          <div style={{height:2,borderRadius:1,background:"#dce8f4",flex:calObj}}/>
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {rTot.cal>0&&<span style={{fontSize:14,fontWeight:300,color:"#C8963E"}}>{rTot.cal}</span>}
                      <span style={{fontSize:14,color:"#c4d4e8",transform:isActive?"rotate(180deg)":"none",transition:"transform .2s"}}>⌄</span>
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
                            <span style={{fontSize:9,color:C.mid}}>kcal</span>
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
                              <div><div style={{fontSize:12}}>{item.n}</div><div style={{fontSize:10,color:C.mid}}>{item.c}kcal</div></div>
                              <span style={{color:C.gold,fontSize:18}}>+</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Bibliothèque rapide */}
                      <div style={{marginTop:8}}>
                        <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:4}}>
                          {[...new Set(FOODS.map(f=>f.cat))].map(cat=>(
                            <button key={cat} style={{padding:"4px 10px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:12,color:C.mid,cursor:"pointer",fontSize:10,whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif"}} onClick={()=>{}}>{cat}</button>
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
                  <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>Basé sur la qualité de vos aliments<br/>et vos comportements nutritionnels</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:48,fontWeight:300,color:scoreColor,lineHeight:1,letterSpacing:-2}}>{scoreLettre}</div>
                  <div style={{fontSize:10,color:C.mid}}>{score}/100</div>
                </div>
              </Row>
              <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden",marginBottom:16}}>
                <div style={{height:"100%",width:`${score}%`,background:`linear-gradient(90deg,${C.red},${C.orange},${C.green})`,borderRadius:3,transition:"width .8s"}}/>
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
              <div style={{marginTop:14,padding:"10px 12px",background:C.s2,borderRadius:9,fontSize:11,color:C.mid,lineHeight:1.6}}>
                💡 {score>=85?"Excellente journée nutritionnelle ! Continuez comme ça.":score>=70?"Bonne journée, quelques petits ajustements possibles.":score>=55?"Journée correcte. Pensez à l'hydratation et la diversité.":score>=40?"Des efforts à faire sur la qualité alimentaire.":"Journée difficile nutritionnellement. Revenez aux bases demain."}
              </div>
            </Box>
          </div>
        )}

        {nView==="scanner"&&(
          <div style={{padding:"0 15px"}}>
            <Box>
              <Lbl>Scanner un produit</Lbl>
              <div style={{padding:"9px 11px",background:C.goldD,border:`0.5px solid ${C.goldB}`,borderRadius:8,fontSize:11,color:C.mid,marginBottom:12,lineHeight:1.6}}>Base Open Food Facts · 3 millions de produits</div>
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
                  <button onClick={()=>{setMyFoods(f=>[...f,{...scanRes,id:Date.now()}]);setScanRes(null);setScan("");}} style={{marginTop:8,width:"100%",padding:"7px",background:"transparent",border:"0.5px solid #dce8f4",borderRadius:7,color:C.mid,cursor:"pointer",fontSize:11,fontFamily:"'Inter',sans-serif"}}>💾 Sauvegarder dans ma bibliothèque</button>
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
                    <button onClick={()=>setRepas(rp=>({...rp,[repasA]:[...rp[repasA],f]}))} style={{padding:"5px 11px",background:C.goldD,border:`0.5px solid ${C.goldB}`,borderRadius:7,color:C.gold,cursor:"pointer",fontSize:11,fontFamily:"'Syne',sans-serif",fontWeight:700}}>+</button>
                  </Row>
                ))}
              </Box>
            )}
          </div>
        )}
      </div>
    );
  };
  const Profile=()=>(
    <div style={{padding:"0 15px 16px"}} className="anim">
      <div style={{padding:"26px 0 14px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:68,height:68,borderRadius:"50%",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        </div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:300,color:"#0f1a2e",marginBottom:3}}>{profil.prenom||"Mon profil"}</div>
        <div style={{fontSize:11,color:"#a0b4cc",marginBottom:4}}>{premium?"Membre Premium ✦":"Compte gratuit"}</div>
      </div>
      {!premium?<div style={{background:"rgba(59,130,246,0.06)",border:`0.5px solid ${C.goldB}`,borderRadius:13,padding:"20px 16px",marginBottom:9}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,letterSpacing:2,color:C.gold,textAlign:"center",marginBottom:4}}>PASSER À PREMIUM</div>
        <div style={{fontSize:12,color:C.mid,textAlign:"center",marginBottom:14}}>Programmes personnalisés selon votre morphologie</div>
        {["Programme unique adapté à votre corps","Biomécanique et exercices correctifs","Programme nutrition sur mesure","Calendrier cycle 6 semaines"].map(f=>(
          <Row key={f} style={{marginBottom:8,gap:9}}>
            <div style={{width:15,height:15,borderRadius:"50%",background:"rgba(56,199,117,.12)",border:"1px solid rgba(56,199,117,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0}}>✓</div>
            <span style={{fontSize:12}}>{f}</span>
          </Row>
        ))}
        <div style={{textAlign:"center",margin:"12px 0"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,color:C.gold,letterSpacing:-0.5,fontWeight:300}}>19.99€<span style={{fontSize:12,color:C.mid,fontFamily:"'Inter',sans-serif",fontWeight:400}}> /cycle</span></div>
        </div>
        <Btn onClick={()=>{setPremium(true);push("🎉","Premium activé !","Accès complet activé !");}}>Commencer maintenant</Btn>
      </div>:<Box style={{background:C.goldD,borderColor:C.goldB,display:"flex",alignItems:"center",gap:11}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(200,150,62,.15)",border:`0.5px solid ${C.goldB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>◈</div>
        <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:16,color:C.gold,letterSpacing:-0.5,fontWeight:300}}>MEMBRE PREMIUM</div><div style={{fontSize:10,color:C.mid}}>Accès complet activé</div></div>
      </Box>}
      <Box>
        <Lbl>Informations</Lbl>
        <Inp placeholder="Prénom" value={profil.prenom} onChange={e=>setProfil({...profil,prenom:e.target.value})}/>
        <G2><Inp type="number" placeholder="Âge" style={{marginBottom:0}} value={profil.age} onChange={e=>setProfil({...profil,age:e.target.value})}/><select style={{width:"100%",padding:"11px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.text,fontSize:13}} value={profil.sexe} onChange={e=>setProfil({...profil,sexe:e.target.value})}><option value="">Sexe</option><option value="homme">Homme</option><option value="femme">Femme</option></select></G2>
        <G2 style={{marginTop:6}}><Inp type="number" placeholder="Poids (kg)" style={{marginBottom:0}} value={profil.poids} onChange={e=>setProfil({...profil,poids:e.target.value})}/><Inp type="number" placeholder="Taille (cm)" style={{marginBottom:0}} value={profil.taille} onChange={e=>setProfil({...profil,taille:e.target.value})}/></G2>
        {imc&&<div style={{marginTop:7,padding:"8px 11px",background:C.s2,borderRadius:7,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:11,color:C.mid}}>IMC</span>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:15,color:C.gold,letterSpacing:0.5}}>{imc} — {imc<18.5?"Maigreur":imc<25?"Normal ✓":imc<30?"Surpoids":"Obésité"}</span>
        </div>}
      </Box>
      <Box>
        <Lbl>Objectif</Lbl>
        <G2>{[{id:"hypertrophie",i:"💪",l:"Prise de muscle"},{id:"force",i:"🏋️",l:"Force"},{id:"poids",i:"🔥",l:"Perte de poids"},{id:"sante",i:"❤️",l:"Santé"}].map(o=>(
          <div key={o.id} onClick={()=>setProfil({...profil,objectif:o.id})} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:profil.objectif===o.id?C.goldD:C.s2,border:`1px solid ${profil.objectif===o.id?C.gold:C.s3}`,borderRadius:10}}>
            <div style={{fontSize:20,marginBottom:5}}>{o.i}</div><div style={{fontSize:11,fontWeight:400}}>{o.l}</div>
          </div>
        ))}</G2>
      </Box>
      <Box>
        <Lbl>Niveau d'activité</Lbl>
        {[{id:"sedentaire",l:"Sédentaire",d:"Bureau"},{id:"leger",l:"Léger",d:"1-3x/sem"},{id:"modere",l:"Modéré",d:"3-5x/sem"},{id:"actif",l:"Très actif",d:"6-7x/sem"}].map(n=>(
          <div key={n.id} onClick={()=>setProfil({...profil,activite:n.id})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:profil.activite===n.id?C.goldD:C.s2,border:`1px solid ${profil.activite===n.id?C.gold:C.s3}`,borderRadius:9,cursor:"pointer",marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:600}}>{n.l}</span><span style={{fontSize:10,color:C.mid}}>{n.d}</span>
          </div>
        ))}
      </Box>
      {profil.poids&&profil.taille&&profil.age&&profil.sexe&&<Box>
        <Lbl>Besoins estimés</Lbl>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,color:C.gold,letterSpacing:1,marginBottom:3}}>{calObj}<span style={{fontSize:13,color:C.mid,fontFamily:"'Inter',sans-serif",fontWeight:400}}> kcal/jour</span></div>
        <div style={{fontSize:10,color:C.mid,marginBottom:10}}>{obj.l}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
          {[{l:"Protéines",v:pObj,c:C.red},{l:"Glucides",v:gObj,c:C.orange},{l:"Lipides",v:lObj,c:C.green}].map(m=>(
            <div key={m.l} style={{textAlign:"center",padding:"10px 6px",background:C.s2,borderRadius:9}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,color:m.c,letterSpacing:0.5}}>{m.v}g</div>
              <div style={{fontSize:9,color:C.mid,marginTop:2}}>{m.l}</div>
            </div>
          ))}
        </div>
        {profil.objectif==="poids"&&<div style={{marginTop:9,padding:"8px 10px",background:"rgba(220,125,52,.08)",border:"1px solid rgba(220,125,52,.2)",borderRadius:7,fontSize:11,color:C.orange,lineHeight:1.5}}>Perte saine : max 2 kg/mois. Déficit modéré + musculation = préservation musculaire.</div>}
      </Box>}
      <Box>
        <Lbl>Notifications</Lbl>
        {[{i:"🏋️",l:"Rappel de séance"},{i:"🥗",l:"Journal alimentaire"},{i:"💧",l:"Hydratation"},{i:"🔔",l:"Fin de cycle"}].map((n,i)=>(
          <Row key={i} style={{marginBottom:10,justifyContent:"space-between"}}>
            <Row style={{gap:10}}><span style={{fontSize:17}}>{n.i}</span><span style={{fontSize:12,fontWeight:500}}>{n.l}</span></Row>
            <div style={{width:34,height:19,borderRadius:10,background:C.green,display:"flex",alignItems:"center",paddingRight:3}}>
              <div style={{width:13,height:13,borderRadius:"50%",background:"white",marginLeft:"auto"}}/>
            </div>
          </Row>
        ))}
        <button onClick={()=>push("🔔","Test réussi !","Les notifications fonctionnent correctement.")} style={{background:C.goldD,border:`0.5px solid ${C.goldB}`,borderRadius:7,padding:"7px 14px",color:C.gold,cursor:"pointer",fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:700}}>Tester les notifications</button>
      </Box>
    </div>
  );
  // ─────────────────────────────────────
  // PROGRAMME TAB — Aujourd'hui / Semaine / Progression / Analyse IA
  // ─────────────────────────────────────
  const MOTIVATIONS=[
    "La régularité construit les champions. 💪","Chaque rep compte, même les plus dures. 🔥","Ton corps s'améliore entre les séances, pas pendant. ⚡","La douleur d'aujourd'hui est la force de demain. 🏆","Un entraînement imparfait vaut mieux que rien. 🎯","La progression n'est pas linéaire — tiens bon. 📈","Ce que tu fais aujourd'hui, tu en récolteras les fruits. 💎","La discipline est la liberté la plus haute. 🧠","Fais confiance au processus, les résultats arrivent. ⏳","Chaque kilo ajouté est une victoire sur toi-même. 🏋️","Le succès est la somme de petits efforts répétés. ✨","Sois constant, même quand personne ne regarde. 👁️","Les champions ne naissent pas, ils se construisent. 🔨","Aujourd'hui tu peux. Alors fais-le. ⚡","La force mentale précède la force physique. 🧘","Un pas en avant, même petit, est toujours un progrès. 👣","Ton seul concurrent, c'est toi d'hier. 🪞","Le corps accomplit ce que l'esprit croit possible. 💡","Repose-toi si tu dois, mais n'abandonne jamais. 🛡️","La forme physique est une récompense, pas une punition. 🎁","Sois patient, les grandes choses prennent du temps. 🌱","La motivation commence l'action, l'habitude la termine. ⚙️","Chaque séance t'éloigne de là où tu étais. 🚀","Investis en toi aujourd'hui pour récolter demain. 💰","La progression est lente — c'est pour ça qu'elle dure. 🐢","Ne cherche pas la perfection, cherche la constance. 🎖️","Ta santé est ton actif le plus précieux. 💎","Même les pros ont des mauvaises journées. Ils y vont quand même. 🔑","Le plus dur, c'est de commencer. Le reste suit. 🏁","Tu n'es qu'à une séance d'une meilleure humeur. 😤","Construis le corps dont tu as besoin. 🏗️","Chaque goutte de sueur est un investissement. 💧","La force ne vient pas de ce que tu peux faire, mais de ce que tu surmontais. 🌊","Sois l'athlète que tu admirais enfant. 🌟","Ton futur te remercie pour l'effort d'aujourd'hui. 🙏","Les habitudes façonnent le destin. 🧩","Ne te compare à personne — ton chemin est unique. 🛤️","L'entraînement est un dialogue entre toi et ton corps. 🤝","La cohérence bat le talent quand le talent est inconstant. ⚖️","Transforme tes objectifs en habitudes. 📆","Tu mérites de te sentir fort(e) et en forme. ✊","Le mental d'abord, le physique suit. 🧠","Chaque effort nourrit ta confiance en toi. 🌿","Reste humble, travaille dur, reste patient. 🏔️","Ce n'est pas une course. C'est un voyage. 🧳","Fais aujourd'hui ce que d'autres ne veulent pas faire. 🔐","La persévérance est le secret de tous les triomphes. 🗝️","Pas d'excuses, juste des résultats. 💥","Tu es plus fort(e) que tu ne le crois. 🦁","Avance, même lentement. Ne t'arrête jamais. 🚶","Le progrès exige de la patience et du dévouement. 🌄","Chaque séance est une promesse tenue envers toi-même. 📝","Ne laisse pas tes émotions décider de ta discipline. 🧊","La sueur d'aujourd'hui est la médaille de demain. 🥇","Un corps fort se construit une répétition à la fois. 🧱","Recommencer chaque jour, c'est déjà extraordinaire. 🔄","La volonté est un muscle — entraîne-la. 💪","Ton effort d'aujourd'hui redéfinit tes limites de demain. 📏","Il n'y a pas de raccourcis — seulement du travail. 🛠️","Fais le travail. Vois les résultats. Crois au processus. 🔬","Les petites victoires mènent aux grands triomphes. 🏆","La forme physique est le carburant de la vie. ⛽","Investis du temps dans ta santé — c'est rentable. 💹","Chaque jour est une nouvelle chance de progresser. 🌅","Ne sous-estime jamais le pouvoir de la régularité. ⏰","Tu construis quelque chose de grand. Continue. 🏛️","La discipline crée la liberté. 🔓","Ton corps est capable de plus que tu ne le penses. 🌪️","Entraîne-toi dur. Récupère bien. Recommence. 🔁","La santé est la première richesse. 💰","Sois fier(e) de chaque effort, grand ou petit. 🌈","L'excellence est une habitude, pas un acte. 📚","Chaque séance t'appartient. Profites-en. 🙌","Avancer lentement est toujours mieux qu'être immobile. 🐾","Les limites existent dans l'esprit — repousse-les. 🧠","Tu te bâtis, séance après séance. 🏗️","La vraie transformation prend du temps. Sois patient(e). 🌿","Ce que tu fais régulièrement te définit. 🪨","Ton engagement d'aujourd'hui est ta fierté de demain. 🎗️","La persévérance transforme l'ordinaire en exceptionnel. ✨","Travaille dur en silence. Laisse tes résultats parler. 🤫","Le corps suit l'esprit — programme ta réussite. 🧬","Chaque rep de moins facile te rend plus fort(e). 🔩","Sois meilleur(e) qu'hier, moins bon(ne) que demain. 📊","L'effort d'aujourd'hui remodèle le toi de demain. 🖼️","Bouger est un privilège — honore-le. 🙏","La ténacité fait la différence entre l'essai et le succès. 🎯","La douleur est temporaire, la fierté est permanente. 🏅","Chaque matin est une page blanche pour écrire ta victoire. 📖","Ta santé est l'investissement le plus rentable. 📈","Ne t'arrête pas quand tu es fatigué(e). Arrête quand c'est fait. ✅","La progression constante bat la perfection ponctuelle. 🔄","Un objectif sans plan n'est qu'un souhait. 🗺️","Les grandes transformations commencent par de petites décisions. 🌱","Fais de chaque séance un acte de respect envers toi-même. 🤲","L'effort d'aujourd'hui, c'est la santé de demain. 🩺","Tu es l'auteur(e) de ta propre transformation. ✍️","Tiens la barre, même quand c'est difficile. 🎢","Le meilleur moment pour commencer était hier. Le deuxième meilleur, c'est maintenant. ⏱️","Construis des habitudes, pas des excuses. 🚫","Sois l'énergie que tu veux attirer. ⚡","Chaque progrès mérite d'être célébré, même minime. 🎉","La cohérence est la clé de la transformation durable. 🔑","Donne tout dans chaque séance — tu te remerciera plus tard. 🙌","Le vrai courage, c'est de recommencer quand on est épuisé. 🦅","Ta discipline impressionne — continue. 💫","Chaque centimètre gagné est une victoire réelle. 📐","Le voyage de mille lieues commence par un seul pas. 🌍","Tu n'as pas besoin de motivation — tu as besoin de discipline. ⚙️","La transformation physique est une transformation intérieure. 🧘","Sois cohérent(e) plutôt que parfait(e). ✔️","Chaque séance est une déclaration d'intention. 📣","Construis la version de toi qui dépasse tes rêves. 🌠","Les résultats récompensent ceux qui persistent. 🏆","Tes efforts d'aujourd'hui sont les fondations de demain. 🏛️","Ne te laisse pas arrêter par ce que tu ne peux pas encore faire. 🌊","L'entraînement n'est pas une option — c'est un mode de vie. 🌿","Avance un jour à la fois. C'est suffisant. 📅","Ton potentiel dépasse ce que tu imagines. 🚀","La force est construite dans la répétition. 🔁","Chaque journée d'entraînement est une journée de gagnée. ✊","La santé est silencieuse. La maladie est bruyante. Prends soin de la première. 🤫","Reste concentré(e) sur ton chemin, pas sur celui des autres. 👁️","Tu progresses même quand tu ne le vois pas encore. 🌱","Le calme intérieur vient d'une discipline extérieure. 🧘","Chaque effort a une valeur, même si personne ne le voit. 💡","Le succès est le résultat de choix quotidiens. 📆","La fatigue est temporaire, l'abandon est définitif. 🛑","Ton corps te dit merci après chaque séance. 💚","Fais de ta santé ta priorité numéro un. 🥇","Chaque limite franchie te rend plus libre. 🕊️","La grandeur n'est pas dans les éclairs, mais dans la constance. ⏳","Tu ne seras jamais prêt(e) à 100% — commence quand même. 🎬","Le succès se construit brique après brique. 🧱","Ce n'est pas une question de talent, mais de travail. 🔧","La régularité crée des miracles à long terme. ✨","Ne cherche pas la facilité — cherche la croissance. 🌳","Chaque obstacle est une leçon déguisée. 🎓","Tu as plus de force que tu ne le crois. 💥","L'effort quotidien construit l'excellence durable. 🏆","Prends soin de ton corps — c'est le seul endroit où tu dois vivre. 🏠","La progression est inévitable quand l'effort est constant. 📊","Chaque jour d'entraînement est un vote pour ta santé future. 🗳️","Ne laisse jamais une mauvaise journée devenir une mauvaise semaine. 🔄","Le mental solide précède le physique solide. 🧱","Tu es en train de devenir la meilleure version de toi. 🌟","La cohérence sur le long terme, c'est là que la magie opère. ✨","Chaque séance accomplie est une dette envers toi remboursée. 💳","Il n'y a pas de génétique parfaite — il y a du travail parfait. 🔬","Sois fier(e) d'avoir commencé. 🌅","Le corps fort soutient l'esprit fort. 🤝","Ton investissement en toi est le meilleur placement. 💎","Chaque fois que tu soulèves, tu te soulèves toi-même. ⬆️","La santé est une victoire quotidienne. 🏆","Ne compte pas les jours — fais que les jours comptent. ⏰","La sueur efface les doutes. 💦","Ton futur toi est en train de te remercier. 🙌","Petit à petit, l'oiseau fait son nid. 🐦","Sois l'exemple que tu aurais voulu avoir. 💪","La constance crée la confiance. 🛡️","Chaque limit défoncée ouvre une nouvelle porte. 🚪","Le chemin vers le sommet commence par un premier pas. 🏔️","La discipline aujourd'hui = la liberté demain. 🕊️","Ton corps est ton temple — traite-le comme tel. ⛩️","Chaque jour est une opportunité de te surpasser. ⚡","Le talent sans travail ne mène nulle part. 🛤️","Avance. Progresse. Recommence. C'est ça le secret. 🔑","Tu construis quelque chose de remarquable. 🌟","Fais confiance à ton parcours, même les jours sans résultat visible. 🌫️","La persévérance est la vertu des forts. 💎","Chaque session terminée est une victoire sur le doute. 🥊","L'excellence quotidienne produit l'extraordinaire. ✨","Sois discipliné(e) même quand tu n'en as pas envie. 🔐","Ta santé, c'est ta richesse la plus précieuse. 💰","Un corps en mouvement reste en mouvement. 🌀","Chaque effort compte, surtout quand personne ne regarde. 🌙","La transformation se passe dans l'obscurité, entre les séances. 🌑","Sois plus fort(e) que tes excuses. 🚫","Ta vie s'améliore quand tu t'améliores. 📈","La récupération fait partie du progrès. 😴","Ton corps mérite le meilleur soin. 🌿","Chaque objectif atteint en appelle un autre. 🎯","Le mouvement, c'est la vie. Bouge chaque jour. 🏃","Reste concentré(e) sur tes raisons profondes. 💡","Le succès se cache dans la régularité des petits actes. 🔍","Même le plus long voyage a une fin. Continue. 🛤️","Tu es capable de plus que ce que tu réalises. 💥","La force naît de la répétition. 🔄","Chaque jour de santé est une victoire. 🏅","Ne permets pas à la paresse de décider de ta journée. ⏰","Le progrès récompense la patience. 🌱","Ta vie change quand tes habitudes changent. 🔀","Chaque effort est un investissement dans ton futur. 📈","La volonté se renforce avec chaque effort. 💪","Avance même sans applaudissements — fais-le pour toi. 🎖️","La rigueur mène à la réussite. 🏆","Chaque séance accomplie est une victoire sur la médiocrité. ✅","Tu es en bonne voie — garde le cap. ⛵","La force intérieure se bâtit une répétition à la fois. 🧱","Prends soin de toi aujourd'hui pour les victoires de demain. 🌄","Tu as fait le choix difficile — félicitations. 🎊","Chaque goutte de sueur t'approche de ton objectif. 💧","La santé est un mode de vie, pas une destination. 🗺️","Sois meilleur(e) chaque jour, pas parfait(e) un seul. 📅","L'effort constant produit des résultats constants. ⚖️","Ta persévérance force le respect. 🙏","Reste dans l'action — c'est là que tout se passe. 🔥","La volonté est illimitée — utilise-la. ∞","Chaque séance te rapproche de ton meilleur toi. 🎯","Le secret du succès : ne jamais abandonner. 🏆","Ton engagement fait la différence. ✊","Sois plus tenace que tes obstacles. 🪨","La forme physique amplifie tout ce que tu es. 📢","Chaque jour, tu deviens une meilleure version. 🌟","La régularité bât toujours l'intensité. 📊","Un esprit fort dans un corps fort — c'est l'objectif. 🧬","Fais de ta santé une habitude, pas un effort. ⚙️","Le courage n'est pas l'absence de peur — c'est agir malgré elle. 🦁","Chaque limite franchie élargit ta vision du possible. 🌅","La transformation est un processus, pas un événement. 🌿","Tu mérites chaque résultat que tu obtiens. 🏅","Ne recompte pas les efforts passés — concentre-toi sur maintenant. ⏱️","La constance dans l'effort est une forme de génie. 🧠","Chaque session d'entraînement est un chapitre de ta success story. 📖","Ton corps est ton outil le plus puissant. 🔧","Sois reconnaissant(e) de ce que ton corps peut faire. 🙌","La santé physique nourrit la santé mentale. 🌊","Avance sans te comparer — ton chemin est unique. 🛤️","Le vrai luxe, c'est la santé. 💎","Chaque effort d'aujourd'hui est un cadeau pour demain. 🎁","Ta transformation inspire ceux qui t'entourent. 🌟","La discipline silencieuse construit les destins bruyants. 📣","Ne cherche pas l'inspiration — cherche la transpiration. 💦","Chaque répétition est une victoire microscopique. 🔬","Le corps change quand les habitudes changent. 🔀","Sois l'architecte de ta propre santé. 🏗️","Chaque jour compte dans le grand puzzle de ta transformation. 🧩","La rigueur quotidienne produit des résultats extraordinaires. ✨","Tu es en train de faire quelque chose que beaucoup n'osent pas. 🦅","Le progrès est invisible jusqu'au jour où il devient évident. 🌄","Avance, même les jours sans énergie. Surtout ces jours-là. 💡","Tu es plus résistant(e) que tu ne le penses. 🛡️","Chaque entraînement te construit de l'intérieur. 🌱","La santé n'est pas tout — mais sans elle, tout n'est rien. ⚡","Reste sur la voie même quand la destination semble lointaine. 🗺️","Ton engagement aujourd'hui = ta fierté demain. 🎖️","La force se forge dans la difficulté, pas dans le confort. 🔩","Chaque jour d'effort est un jour de plus vers tes objectifs. 📅","Sois fier(e) de chaque séance réalisée. 🌟","La transformation physique commence dans la tête. 🧠","Chaque limite que tu repousses t'appartient. 🏆","Reste motivé(e), même quand les résultats tardent. 🌱","La santé est la base de tout succès durable. 🏛️","Chaque progrès, aussi petit soit-il, mérite d'être célébré. 🎉","Tu progresses. Continue. Ne t'arrête pas. 🚀",
  ];

  const getTodaySeance=()=>{
    if(!prog) return null;
    const today=new Date();
    const dayNames=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const todayName=dayNames[today.getDay()];
    return prog.jours.find(j=>
      j.nom.toLowerCase().includes(todayName.toLowerCase())||
      j.focus?.toLowerCase().includes(todayName.toLowerCase())
    )||null;
  };

  const getWeekSeances=()=>{
    if(!prog) return [];
    const today=new Date();
    const dayNames=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    return ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((dayShort,i)=>{
      const seance=prog.jours.find(j=>
        j.nom.toLowerCase().includes(dayShort.toLowerCase())||
        j.focus?.toLowerCase().includes(dayShort.toLowerCase())
      );
      return {day:dayShort, seance, isToday:dayNames[today.getDay()]===dayShort};
    });
  };

  const [bonusModal,setBonusModal]=useState(false);
  const [bonusType,setBonusType]=useState(null);
  const [checkedEx,setCheckedEx]=useState({});
  const [selectedWeekDay,setSelectedWeekDay]=useState(null);
  const [progView,setProgView]=useState("today");
  const [weightLog,setWeightLog]=useState([]);
  const [lastWeighIn,setLastWeighIn]=useState(null);
  const [showWeightInput,setShowWeightInput]=useState(false);
  const [newWeight,setNewWeight]=useState("");

  const toggleCheck=(seanceId,exIdx)=>{
    const key=`${seanceId}-${exIdx}`;
    setCheckedEx(prev=>({...prev,[key]:!prev[key]}));
  };

  const SeanceDetail=({seance,onBack})=>{
    if(!seance) return null;
    const int=INT[seance.intensite||"modere"];
    const total=seance.exercices?.length||0;
    const done=seance.exercices?.filter((_,i)=>checkedEx[`${seance.id}-${i}`]).length||0;
    const pct=total>0?Math.round(done/total*100):0;
    return(
      <div style={{padding:"0 15px"}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px 0",marginBottom:10,display:"flex",alignItems:"center",gap:5}}>← Retour</button>
        <div style={{padding:"13px 14px",background:`${int.c}14`,border:`1px solid ${int.c}30`,borderRadius:11,marginBottom:10}}>
          <Row style={{justifyContent:"space-between",marginBottom:6}}>
            <div>
              <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:400,letterSpacing:-0.5}}>{seance.nom}</div>
              <div style={{fontSize:11,color:C.mid}}>{seance.focus} · {seance.duree}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:pct===100?C.green:C.gold}}>{pct}%</div>
              <div style={{fontSize:9,color:C.mid}}>{done}/{total}</div>
            </div>
          </Row>
          <Bar pct={pct} color={pct===100?C.green:int.c} h={4}/>
        </div>
        <button onClick={()=>setChrono(true)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.mid,cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500,marginBottom:10}}>⏱ Chronomètre de repos</button>
        {seance.exercices?.map((ex,j)=>{
          const cc={principal:C.gold,correctif:C.red,mobilite:C.blue,gainage:C.green,isolation:C.purple}[ex.cat||"principal"]||C.gold;
          const exInfo=Object.values(EX).flat().find(e=>e.n===ex.nom)||null;
          const isChecked=!!checkedEx[`${seance.id}-${j}`];
          const showDet=!!exDetails[`${seance.id}-${j}`];
          const editMd=!!exEdit[`${seance.id}-${j}`];
          const last=ex.historique?.length>0?ex.historique[ex.historique.length-1]:null;
          return(
            <Box key={j} style={{borderLeft:`2px solid ${cc}`,opacity:isChecked?0.7:1}}>
              <Row style={{justifyContent:"space-between",marginBottom:8}}>
                <div style={{flex:1}}>
                  <Row style={{gap:7,marginBottom:4}}>
                    <div onClick={()=>toggleCheck(seance.id,j)} style={{width:20,height:20,borderRadius:5,background:isChecked?C.green:"transparent",border:`2px solid ${isChecked?C.green:C.s3}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"white"}}>{isChecked?"✓":""}</div>
                    <div style={{fontSize:13,fontWeight:500,textDecoration:isChecked?"line-through":"none",color:isChecked?C.mid:C.text}}>{ex.nom}</div>
                  </Row>
                  <div style={{display:"inline-block",padding:"2px 8px",background:`${cc}18`,border:`1px solid ${cc}30`,borderRadius:5,fontSize:9,color:cc,fontWeight:700,textTransform:"uppercase"}}>{ex.cat}</div>
                </div>
                <Row style={{gap:5}}>
                  <button onClick={()=>setExEdit(e=>({...e,[`${seance.id}-${j}`]:!e[`${seance.id}-${j}`]}))} style={{padding:"4px 8px",background:editMd?"rgba(212,168,83,0.15)":C.s2,border:`1px solid ${editMd?C.gold:C.s3}`,borderRadius:6,color:editMd?C.gold:C.mid,cursor:"pointer",fontSize:11}}>✏️</button>
                  <button onClick={()=>setExDetails(e=>({...e,[`${seance.id}-${j}`]:!e[`${seance.id}-${j}`]}))} style={{padding:"4px 8px",background:showDet?"rgba(77,143,224,0.15)":C.s2,border:`1px solid ${showDet?C.blue:C.s3}`,borderRadius:6,color:showDet?C.blue:C.mid,cursor:"pointer",fontSize:11}}>{showDet?"▲":"ℹ️"}</button>
                </Row>
              </Row>
              {!editMd?(
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                  {[{l:"Sets",v:ex.series},{l:"Reps",v:ex.reps},{l:"Repos",v:ex.repos},{l:"Charge",v:ex.charge}].filter(s=>s.v).map(s=>(
                    <div key={s.l} style={{padding:"4px 9px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:6,textAlign:"center",minWidth:52}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:500,color:C.gold}}>{s.v}</div>
                      <div style={{fontSize:9,color:C.mid}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              ):(
                <div style={{background:C.s2,borderRadius:8,padding:10,marginBottom:10}}>
                  <div style={{fontSize:10,color:C.gold,fontWeight:700,marginBottom:8}}>✏️ Modifier</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(p=>(
                      <div key={p.k}>
                        <div style={{fontSize:9,color:C.mid,marginBottom:3}}>{p.l}</div>
                        <input defaultValue={ex[p.k]||""} onBlur={e=>{
                          const u=[...prog.jours];
                          const sIdx=prog.jours.findIndex(s=>s.id===seance.id);
                          if(sIdx>=0){u[sIdx].exercices[j][p.k]=e.target.value;setProg({...prog,jours:u});}
                        }} style={{width:"100%",padding:"7px 9px",background:C.s3,border:"0.5px solid #dce8f4",borderRadius:6,color:C.text,fontSize:12,fontFamily:"'Inter',sans-serif"}}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setExEdit(e=>({...e,[`${seance.id}-${j}`]:false}))} style={{marginTop:8,width:"100%",padding:"7px",background:"rgba(62,199,122,0.1)",border:"1px solid rgba(62,199,122,0.3)",borderRadius:7,color:C.green,cursor:"pointer",fontSize:11,fontWeight:600}}>✓ OK</button>
                </div>
              )}
              {ex.morpho_tip&&<div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:C.mid,lineHeight:1.5,marginBottom:6}}><span style={{color:C.gold,fontWeight:700}}>Morpho · </span>{ex.morpho_tip}</div>}
              {showDet&&(
                <div style={{borderTop:`1px solid ${C.s3}`,paddingTop:10,marginTop:4}}>
                  {exInfo?.morpho&&<div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:C.mid,lineHeight:1.5,marginBottom:8}}><span style={{color:C.gold,fontWeight:700}}>Guide · </span>{exInfo.morpho}</div>}
                  {exInfo?.tips?.length>0&&(
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Tips</div>
                      {exInfo.tips.map((tip,ti)=>(
                        <Row key={ti} style={{gap:7,marginBottom:4,alignItems:"flex-start"}}>
                          <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(62,199,122,0.12)",border:"1px solid rgba(62,199,122,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0,marginTop:1}}>{ti+1}</div>
                          <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{tip}</div>
                        </Row>
                      ))}
                    </div>
                  )}
                  {exInfo?.variantes?.length>0&&(
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:9,color:"#f97316",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Variantes</div>
                      {exInfo.variantes.map((v,vi)=>(
                        <div key={vi} style={{padding:"5px 8px",background:C.s2,borderRadius:6,marginBottom:4,fontSize:11,color:C.text}}>{v}</div>
                      ))}
                    </div>
                  )}
                  {exInfo?.erreurs?.length>0&&(
                    <div style={{marginBottom:6}}>
                      <div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Erreurs à éviter</div>
                      {exInfo.erreurs.map((err,ei)=>(
                        <Row key={ei} style={{gap:7,marginBottom:4,alignItems:"flex-start"}}>
                          <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.red,flexShrink:0,marginTop:1}}>✕</div>
                          <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{err}</div>
                        </Row>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Row style={{gap:6,marginTop:8}}>
                <Inp style={{flex:1,marginBottom:0}} type="number" placeholder={last?`Dernier: ${last.poids}kg`:"Poids (kg)"} id={`pw-${seance.id}-${j}`}/>
                <Inp style={{width:66,marginBottom:0}} type="number" placeholder="Reps" id={`rp-${seance.id}-${j}`}/>
                <button onClick={()=>{
                  const p=document.getElementById(`pw-${seance.id}-${j}`)?.value;
                  const r=document.getElementById(`rp-${seance.id}-${j}`)?.value;
                  if(!p) return;
                  const u=[...prog.jours];
                  const sIdx=u.findIndex(s=>s.id===seance.id);
                  if(sIdx>=0){
                    u[sIdx].exercices[j].historique=[...(u[sIdx].exercices[j].historique||[]),{poids:parseFloat(p),reps:r||ex.reps,date:new Date().toLocaleDateString("fr-FR")}];
                    setProg({...prog,jours:u});
                  }
                  document.getElementById(`pw-${seance.id}-${j}`).value="";
                  document.getElementById(`rp-${seance.id}-${j}`).value="";
                  setChrono(true);
                }} style={{height:40,padding:"0 13px",background:"rgba(62,199,122,.12)",border:"1px solid rgba(62,199,122,.3)",borderRadius:7,color:C.green,cursor:"pointer",fontSize:20}}>+</button>
              </Row>
            </Box>
          );
        })}
        {pct===100&&(
          <Box style={{background:"rgba(62,199,122,0.08)",borderColor:"rgba(62,199,122,0.3)",textAlign:"center",padding:"20px 16px"}}>
            <div style={{fontSize:32,marginBottom:8}}>🏆</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:400,color:C.green,marginBottom:6}}>Séance terminée !</div>
            <Btn onClick={()=>{
              const u=[...prog.jours];
              const sIdx=u.findIndex(s=>s.id===seance.id);
              if(sIdx>=0){u[sIdx].complete=true;u[sIdx].date=new Date().toLocaleDateString("fr-FR");setProg({...prog,jours:u});}
              push("🏆","Séance terminée !","Bravo ! Progression enregistrée.");
              onBack();
            }}>✓ Valider la séance</Btn>
          </Box>
        )}
      </div>
    );
  };

  const TodayView=()=>{
    const todaySeance=getTodaySeance();
    const [viewSeance,setViewSeance]=useState(null);
    if(viewSeance) return <SeanceDetail seance={viewSeance} onBack={()=>setViewSeance(null)}/>;
    return(
      <div style={{padding:"0 15px"}}>
        {todaySeance?(
          <div>
            <Lbl>Séance du jour</Lbl>
            <Box style={{borderLeft:`3px solid ${INT[todaySeance.intensite||"modere"].c}`,cursor:"pointer"}} onClick={()=>setViewSeance(todaySeance)}>
              <Row style={{justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{fontSize:9,color:INT[todaySeance.intensite||"modere"].c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{INT[todaySeance.intensite||"modere"].l}</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:400}}>{todaySeance.nom}</div>
                  <div style={{fontSize:11,color:C.mid}}>{todaySeance.focus} · {todaySeance.duree} · {todaySeance.exercices?.length||0} exercices</div>
                </div>
                <div style={{color:C.gold,fontSize:22}}>›</div>
              </Row>
              {todaySeance.complete&&<div style={{fontSize:11,color:C.green,fontWeight:700}}>✓ Complétée le {todaySeance.date}</div>}
              {!todaySeance.complete&&(
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {todaySeance.exercices?.slice(0,4).map((ex,i)=>(
                    <div key={i} style={{padding:"3px 8px",background:C.s2,borderRadius:5,fontSize:10,color:C.mid}}>{ex.nom.split(" ")[0]}</div>
                  ))}
                  {(todaySeance.exercices?.length||0)>4&&<div style={{padding:"3px 8px",background:C.s2,borderRadius:5,fontSize:10,color:C.mid}}>+{(todaySeance.exercices?.length||0)-4}</div>}
                </div>
              )}
            </Box>
          </div>
        ):(
          <Box style={{textAlign:"center",padding:"24px 16px"}}>
            <div style={{fontSize:32,marginBottom:8}}>😴</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:500,marginBottom:4}}>Jour de repos</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:14,lineHeight:1.6}}>Profites-en pour récupérer ou ajouter une séance bonus.</div>
          </Box>
        )}
        <Lbl style={{marginTop:12}}>Séance bonus</Lbl>
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
              <div style={{fontSize:12,color:C.mid,marginBottom:14}}>Durée de la séance ?</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                {["15 min","20 min","30 min","45 min"].map(dur=>(
                  <div key={dur} onClick={()=>{
                    const today=new Date();
                    const key=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
                    setCalSess(s=>({...s,[key]:{nom:`${bonusModal.l} ${dur}`,intensite:"mobilite",color:bonusModal.color}}));
                    setBonusModal(null);
                    push("✅",`${bonusModal.l} ajouté !`,`${dur} de ${bonusModal.l.toLowerCase()} enregistré.`);
                  }} style={{padding:"10px 16px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:C.text}}>{dur}</div>
                ))}
              </div>
              <Btn v="ghost" onClick={()=>setBonusModal(null)}>Annuler</Btn>
            </div>
          </div>
        )}
        {!prog&&(
          <Box style={{textAlign:"center",padding:"20px 16px",marginTop:8}}>
            <div style={{fontSize:12,color:C.mid,marginBottom:12}}>Aucun programme actif</div>
            <Btn onClick={()=>setProgView("creer")}>+ Créer un programme</Btn>
            <Btn v="out" onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>Programme IA personnalisé ◈</Btn>
          </Box>
        )}
      </div>
    );
  };

  const SemaineView=()=>{
    const week=getWeekSeances();
    const [viewSeance,setViewSeance]=useState(null);
    if(viewSeance) return <SeanceDetail seance={viewSeance} onBack={()=>setViewSeance(null)}/>;
    return(
      <div style={{padding:"0 15px"}}>
        {week.map(({day,seance,isToday},i)=>{
          if(!seance) return(
            <div key={i} style={{padding:"10px 12px",background:isToday?"rgba(212,168,83,0.05)":C.s2,border:`1px solid ${isToday?C.goldB:C.s3}`,borderRadius:9,marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:isToday?C.goldD:C.s3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:isToday?C.gold:C.mid,flexShrink:0}}>{day}</div>
              <div style={{fontSize:12,color:C.dim,fontStyle:"italic"}}>Repos</div>
              {isToday&&<div style={{marginLeft:"auto",fontSize:9,color:C.gold,fontWeight:700,border:`0.5px solid ${C.goldB}`,padding:"2px 7px",borderRadius:5}}>AUJOURD'HUI</div>}
            </div>
          );
          const int=INT[seance.intensite||"modere"];
          const total=seance.exercices?.length||0;
          const done=seance.exercices?.filter((_,idx)=>checkedEx[`${seance.id}-${idx}`]).length||0;
          return(
            <div key={i} onClick={()=>setViewSeance(seance)} style={{padding:"10px 12px",background:isToday?`${int.c}14`:C.s2,border:`1px solid ${isToday?int.c:C.s3}`,borderRadius:9,marginBottom:6,cursor:"pointer"}}>
              <Row style={{justifyContent:"space-between"}}>
                <Row style={{gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:isToday?`${int.c}30`:C.s3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:isToday?int.c:C.mid,flexShrink:0}}>{day}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:500}}>{seance.nom}</div>
                    <div style={{fontSize:10,color:C.mid}}>{seance.focus} · {total} exercices</div>
                  </div>
                </Row>
                <Row style={{gap:8,alignItems:"center"}}>
                  {done>0&&<div style={{fontSize:10,color:C.green,fontWeight:700}}>{done}/{total}</div>}
                  {seance.complete&&<div style={{fontSize:12,color:C.green}}>✓</div>}
                  <div style={{color:C.dim,fontSize:16}}>›</div>
                </Row>
              </Row>
              {done>0&&<Bar pct={done/total*100} color={int.c} h={3}/>}
            </div>
          );
        })}
        {!prog&&(
          <Box style={{textAlign:"center",padding:"20px 16px"}}>
            <div style={{fontSize:12,color:C.mid,marginBottom:12}}>Aucun programme actif</div>
            <Btn onClick={()=>setProgView("creer")}>+ Créer un programme</Btn>
          </Box>
        )}
      </div>
    );
  };

  const ProgramTab=()=>{
    const subNav=[
      {id:"calendar",l:"Planification"},
      {id:"today",l:"Aujourd'hui"},
      {id:"stats",l:"Progression"},
      {id:"creer",l:"Programme"},
      {id:"analyse",l:"Analyse IA",prem:true},
    ];
    return(
      <div style={{paddingBottom:16}}>
        <div style={{padding:"26px 15px 12px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:30,letterSpacing:-0.3,fontWeight:300}}>PROGRAMMATION</div></div>
        <div style={{display:"flex",gap:5,padding:"0 15px",marginBottom:14,overflowX:"auto",paddingBottom:3}}>
          {subNav.map(s=>(
            <button key={s.id} onClick={()=>{if(s.prem&&!premium)setPaywall(true);else setProgView(s.id);}} style={{padding:"7px 13px",background:progView===s.id?C.goldD:C.s2,border:`1px solid ${progView===s.id?C.gold:C.s3}`,borderRadius:18,color:progView===s.id?C.gold:C.mid,cursor:"pointer",fontSize:11.5,fontWeight:600,whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif"}}>{s.l}</button>
          ))}
        </div>
        {progView==="calendar"&&Calendar()}
        {progView==="today"&&<TodayView/>}
        
        {progView==="stats"&&Stats()}
        {progView==="creer"&&<div style={{padding:"0 15px"}}>
          <Box>
            <Lbl>Mon programme</Lbl>
            {prog?(
              <div>
                <div style={{padding:"10px 12px",background:C.goldD,border:`0.5px solid ${C.goldB}`,borderRadius:9,marginBottom:12}}>
                  <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Cycle {prog.numero||1} actif</div>
                  <div style={{fontSize:14,fontWeight:500}}>{prog.titre}</div>
                  <div style={{fontSize:10,color:C.mid,marginTop:2}}>{prog.jours?.length} séances · Démarré le {prog.dateDebut}</div>
                </div>
                {prog.jours?.map((j,i)=>{
                  const int=INT[j.intensite||"modere"];
                  const total=j.exercices?.length||0;
                  const done=j.exercices?.filter((_,idx)=>checkedEx[`${j.id}-${idx}`]).length||0;
                  return(
                    <div key={i} onClick={()=>{setProgView("today");}} style={{padding:"10px 12px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,marginBottom:6,cursor:"pointer"}}>
                      <Row style={{justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:9,color:int.c,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>{int.l}</div>
                          <div style={{fontSize:13,fontWeight:500}}>{j.nom}</div>
                          <div style={{fontSize:10,color:C.mid}}>{j.focus} · {total} exercices</div>
                        </div>
                        <Row style={{gap:8}}>
                          {done>0&&<div style={{fontSize:10,color:C.green,fontWeight:700}}>{done}/{total}</div>}
                          {j.complete&&<div style={{fontSize:12,color:C.green}}>✓</div>}
                          <div style={{color:C.dim,fontSize:16}}>›</div>
                        </Row>
                      </Row>
                    </div>
                  );
                })}
                <div style={{height:1,background:C.s3,margin:"12px 0"}}/>
                <Btn v="out" onClick={()=>{setCreateStep(0);setNewP({nom:"",jours:[],seances:{}});}}>+ Nouveau programme</Btn>
                <Btn v="out" onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>Programme IA personnalisé ◈</Btn>
              </div>
            ):(
              <div>
                <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:C.mid,marginBottom:14}}>Aucun programme actif</div>
                <Btn onClick={()=>{setCreateStep(0);setNewP({nom:"",jours:[],seances:{}});}}>+ Créer un programme manuel</Btn>
                <Btn v="out" onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>Programme IA personnalisé ◈</Btn>
              </div>
            )}
          </Box>
          {(createStep>0||(!prog&&createStep===0&&newP.nom!==undefined))&&Creer()}
        </div>}
        {progView==="analyse"&&premium&&AnalyseIA()}
      </div>
    );
  };
  const Paywall=()=>(
    <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:18}}>
      <div style={{background:C.s1,border:`1px solid rgba(200,150,62,.3)`,borderRadius:14,padding:"24px 20px",width:"100%",maxWidth:400}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,letterSpacing:2,color:C.gold,textAlign:"center",marginBottom:6}}>ACCÈS PREMIUM</div>
        <div style={{fontSize:12,color:C.mid,textAlign:"center",marginBottom:16}}>Cette fonctionnalité est réservée aux membres Premium.</div>
        {["Programme unique selon votre morphologie","Exercices correctifs pathologies","Guides techniques avancés","Cycle 6 semaines optimisé"].map(f=>(
          <Row key={f} style={{marginBottom:8,gap:9}}>
            <div style={{width:15,height:15,borderRadius:"50%",background:"rgba(56,199,117,.12)",border:"1px solid rgba(56,199,117,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0}}>✓</div>
            <span style={{fontSize:12}}>{f}</span>
          </Row>
        ))}
        <div style={{textAlign:"center",margin:"14px 0"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,color:C.gold,letterSpacing:-0.5,fontWeight:300}}>19.99€<span style={{fontSize:11,color:C.mid,fontFamily:"'Inter',sans-serif",fontWeight:400}}> /cycle</span></div>
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
      <div className="np" style={{background:"rgba(237,243,251,0.95)",backdropFilter:"blur(16px)",borderBottom:"0.5px solid #dce8f4",padding:"12px 16px",position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,letterSpacing:"3px",fontWeight:500,color:"#0f1a2e"}}>
          MORPHO<span style={{color:"#3b82f6"}}>COACH</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {cycleStart&&jR!==null&&jR<=7&&<span style={{fontSize:9,color:"#f97316",fontWeight:500}}>⚠️ J-{jR}</span>}
          {premium&&<span style={{fontSize:9,color:"#3b82f6",border:"0.5px solid rgba(59,130,246,0.3)",padding:"2px 8px",borderRadius:8,fontWeight:700,letterSpacing:"1px"}}>PREMIUM</span>}
          {/* Icône Profil */}
          <button onClick={()=>setTab(tab==="profile"?"home":"profile")} style={{
            width:34,height:34,borderRadius:"50%",
            background:tab==="profile"?"rgba(59,130,246,0.1)":"transparent",
            border:`0.5px solid ${tab==="profile"?"#3b82f6":"#dce8f4"}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",fontSize:16,color:tab==="profile"?"#3b82f6":"#a0b4cc",
            transition:"all .15s",
          }}>◉</button>
        </div>
      </div>
      <div style={{maxWidth:500,margin:"0 auto",paddingBottom:72}}>
        {tab==="home"&&Home()}
        {tab==="program"&&ProgramTab()}
        {tab==="nutrition"&&Nutrition()}
        {tab==="profile"&&Profile()}
      </div>
      {/* Nav — 3 onglets uniquement */}
      <nav className="np" style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(230,240,252,0.98)",backdropFilter:"blur(20px)",borderTop:"0.5px solid #c8daf0",display:"flex",zIndex:100}}>
        {NAV.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px 12px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all .15s",fontFamily:"'Inter',sans-serif"}}>
            <div style={{color:tab===t.id?"#3b82f6":"#a0b4cc",transition:"color .15s",lineHeight:1}}>{t.svg}</div>
            <span style={{fontSize:9,letterSpacing:"0.3px",fontWeight:tab===t.id?600:400,color:tab===t.id?"#3b82f6":"#a0b4cc",transition:"color .15s"}}>{t.l}</span>
            {tab===t.id&&<div style={{width:20,height:2,borderRadius:1,background:"#3b82f6"}}/>}
          </button>
        ))}
      </nav>
      {showChrono&&<Chrono onClose={()=>setChrono(false)}/>}
      {paywall&&Paywall()}
    </div>
  );
}
