import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, INT, SESS_COLORS, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS } from "./data/constants.js";
import { FOODS } from "./data/foods.js";
import { EX } from "./data/exercises.js";
import { MOTIVATIONS } from "./data/motivations.js";
import { calcIMC, getBFCategory, calcNutrition, calcTotauxRepas, calcStreak, calcJoursRestants, calcCyclePct, getMotivationDuJour } from "./utils/fitness.js";

// ─── PERSISTANCE LOCALSTORAGE ─────────────────────────────────────────────────
// Hook universel : fonctionne exactement comme useState mais sauvegarde dans localStorage
function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem("mc_" + key);
      if (saved === null) return defaultValue;
      return JSON.parse(saved);
    } catch {
      return defaultValue;
    }
  });

  const setAndSave = useCallback((next) => {
    setValue(prev => {
      const resolved = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem("mc_" + key, JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  }, [key]);

  return [value, setAndSave];
}
const Box = ({children,style,onClick})=>(
 <div onClick={onClick} style={{background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:16,padding:"16px 15px",marginBottom:9,cursor:onClick?"pointer":"default",...style}}>{children}</div>
);
const Lbl = ({children,style})=>(
 <div style={{fontSize:9,color:"#64748b",letterSpacing:"2px",textTransform:"uppercase",fontWeight:600,marginBottom:10,...style}}>{children}</div>
);
const Inp = ({style,...p})=>(
 <input style={{width:"100%",padding:"11px 13px",background:"#e4eef8",border:"0.5px solid #dce8f4",borderRadius:9,color:"#0f1a2e",fontSize:13,marginBottom:8,...style}} {...p}/>
);
const Btn = ({children,onClick,disabled,v="fill",sm})=>{
 const vs={
 fill:{bg:`linear-gradient(135deg,#60a5fa,#3b82f6)`,color:"#ffffff",border:"none"},
 out: {bg:"transparent",color:"#3b82f6",border:"0.5px solid rgba(59,130,246,0.3)"},
 ghost:{bg:"rgba(255,255,255,0.04)",color:"#64748b",border:"0.5px solid #dce8f4"},
 };
 const s=vs[v]||vs.fill;
 return(
 <button onClick={onClick} disabled={disabled} style={{
 display:"block",width:"100%",padding:sm?"9px 14px":"13px 16px",
 background:disabled?"rgba(255,255,255,0.04)":s.bg,
 color:disabled?"#64748b":s.color,border:disabled?`1px solid ${C.s3}`:s.border,
 borderRadius:9,fontSize:sm?12:13.5,fontWeight:600,cursor:disabled?"not-allowed":"pointer",
 marginBottom:7,transition:"opacity.15s",
 }}>{children}</button>
 );
};
const Bar = ({pct,color=C.gold,h=4})=>(
 <div style={{height:h,background:"#e4eef8",borderRadius:h/2,overflow:"hidden",marginTop:5}}>
 <div style={{height:"100%",width:`${Math.min(100,pct||0)}%`,background:pct>100?C.red:color,borderRadius:h/2,transition:"width.5s"}}/>
 </div>
);
const Row = ({children,style})=><div style={{display:"flex",alignItems:"center",...style}}>{children}</div>;
const G2 = ({children,gap=8,style})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap,marginBottom:9,...style}}>{children}</div>;
const Tag = ({children,active,color,onClick})=>(
 <span onClick={onClick} style={{
 display:"inline-block",padding:"5px 11px",margin:"3px",
 background:active?`rgba(${color||"59,130,246"},.14)`:"rgba(255,255,255,0.03)",
 border:`1px solid ${active?`rgba(${color||"59,130,246"},.44)`:C.s3}`,
 borderRadius:18,fontSize:11.5,color:active?`rgb(${color||"200,150,62"})`:"#64748b",
 cursor:onClick?"pointer":"default",transition:"all.15s",
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
 <div style={{fontSize:11,color:"#64748b"}}>{n.body}</div>
 </div>
 <button onClick={onClose} style={{background:"transparent",border:"none",color:"#64748b",cursor:"pointer",fontSize:16}}>×</button>
 </div>
 </div>
 );
}
function Chrono({onClose,initSec=90}){
  const [left,setLeft]=useState(initSec);
  const [total,setTotal]=useState(initSec);
  const [run,setRun]=useState(true);
  const [elapsed,setElapsed]=useState(0);
  const [mode,setMode]=useState("countdown"); // countdown | stopwatch
  const [vibrated,setVibrated]=useState(false);
  const ref=useRef();

  // Presets
  const PRESETS=[
    {l:"30s",s:30},{l:"45s",s:45},{l:"60s",s:60},
    {l:"1:30",s:90},{l:"2:00",s:120},{l:"3:00",s:180},
  ];

  useEffect(()=>{
    if(run){
      ref.current=setInterval(()=>{
        if(mode==="countdown"){
          setLeft(l=>{
            if(l<=1){
              clearInterval(ref.current);
              setRun(false);
              if(!vibrated){
                if(navigator.vibrate) navigator.vibrate([200,100,200,100,300]);
                setVibrated(true);
              }
              return 0;
            }
            return l-1;
          });
        } else {
          setElapsed(e=>e+1);
        }
      },1000);
    }
    return()=>clearInterval(ref.current);
  },[run,mode]);

  const fmt=s=>{
    const m=Math.floor(s/60);
    const sec=s%60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const pct=mode==="countdown"?((total-left)/total)*100:0;
  const done=mode==="countdown"&&left===0;
  const R=80;
  const CI=2*Math.PI*R;
  const urgency=mode==="countdown"&&left<=10&&left>0;

  const handlePreset=(s)=>{
    setLeft(s);setTotal(s);setRun(true);setVibrated(false);
  };

  // Color based on state
  const arcColor=done?"#22c55e":urgency?"#ef4444":"#3b82f6";
  const arcBg="rgba(59,130,246,0.08)";
  const timeColor=done?"#22c55e":urgency?"#ef4444":"#0f1a2e";

  return(
    <div style={{position:"fixed",inset:0,background:"#e4eef8",zIndex:400,display:"flex",flexDirection:"column",alignItems:"center",overflowY:"auto"}}>
      {/* Header */}
      <div style={{width:"100%",maxWidth:500,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 0"}}>
        <button onClick={onClose} style={{background:"rgba(59,130,246,0.1)",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#3b82f6",fontSize:18}}>×</button>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:400,color:"#0f1a2e",letterSpacing:1,textTransform:"uppercase"}}>Temps de repos</div>
        {/* Mode switch */}
        <div style={{display:"flex",background:"rgba(59,130,246,0.08)",borderRadius:10,padding:3,gap:3}}>
          {["countdown","stopwatch"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setLeft(total);setElapsed(0);setRun(false);setVibrated(false);}} style={{padding:"5px 8px",borderRadius:7,border:"none",background:mode===m?"#ffffff":"transparent",color:mode===m?"#3b82f6":"#64748b",cursor:"pointer",fontSize:10,fontWeight:600,transition:"all .15s"}}>
              {m==="countdown"?"⏱":"⏲"}
            </button>
          ))}
        </div>
      </div>

      {/* Main circle */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 20px 0",width:"100%",maxWidth:500}}>
        <div style={{position:"relative",width:220,height:220,marginBottom:32}}>
          {/* Outer glow when urgent */}
          {urgency&&<div style={{position:"absolute",inset:-8,borderRadius:"50%",background:"rgba(239,68,68,0.08)",animation:"pulse 1s infinite"}}/>}

          <svg width={220} height={220} viewBox="0 0 220 220" style={{transform:"rotate(-90deg)",filter:done?"drop-shadow(0 0 12px rgba(34,197,94,0.4))":urgency?"drop-shadow(0 0 12px rgba(239,68,68,0.3))":"none",transition:"filter .5s"}}>
            {/* Background track */}
            <circle cx={110} cy={110} r={R} fill="none" stroke="#dce8f4" strokeWidth={10}/>
            {/* Progress arc */}
            {mode==="countdown"?(
              <circle cx={110} cy={110} r={R} fill="none" stroke={arcColor} strokeWidth={10}
                strokeDasharray={CI} strokeDashoffset={CI*(pct/100)}
                strokeLinecap="round" style={{transition:"stroke-dashoffset .9s cubic-bezier(.4,0,.2,1),stroke .3s"}}/>
            ):(
              <circle cx={110} cy={110} r={R} fill="none" stroke="#3b82f6" strokeWidth={10}
                strokeDasharray={`${(elapsed%60)/60*CI} ${CI}`}
                strokeLinecap="round" style={{transition:"stroke-dasharray .9s"}}/>
            )}
            {/* Tick marks */}
            {[0,15,30,45].map(tick=>(
              <line key={tick} x1={110} y1={30} x2={110} y2={24}
                stroke="#c8d8ec" strokeWidth={2}
                transform={`rotate(${tick*6} 110 110)`}/>
            ))}
          </svg>

          {/* Center content */}
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
            {done?(
              <>
                <div style={{fontSize:40,lineHeight:1}}>✅</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:500,color:"#22c55e",letterSpacing:1}}>C'EST PARTI !</div>
              </>
            ):(
              <>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:46,fontWeight:200,color:timeColor,letterSpacing:-2,lineHeight:1,transition:"color .3s"}}>
                  {mode==="countdown"?fmt(left):fmt(elapsed)}
                </div>
                <div style={{fontSize:10,color:"#64748b",fontWeight:500,letterSpacing:"1px",marginTop:2}}>
                  {mode==="countdown"
                    ?left===total?"PRÊT":run?"REPOS...":"PAUSE"
                    :run?"EN COURS...":"PAUSE"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Presets - seulement en mode countdown */}
        {mode==="countdown"&&(
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:24}}>
            {PRESETS.map(p=>(
              <button key={p.s} onClick={()=>handlePreset(p.s)} style={{
                padding:"8px 14px",
                background:total===p.s&&!done?"#3b82f6":"#ffffff",
                border:`1px solid ${total===p.s&&!done?"#3b82f6":"#dce8f4"}`,
                borderRadius:20,
                color:total===p.s&&!done?"#ffffff":"#64748b",
                cursor:"pointer",fontSize:12,fontWeight:600,
                fontFamily:"'Inter',sans-serif",
                transition:"all .15s",
                boxShadow:total===p.s&&!done?"0 2px 8px rgba(59,130,246,0.3)":"none"
              }}>{p.l}</button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:24}}>
          {/* Reset */}
          <button onClick={()=>{setLeft(total);setElapsed(0);setRun(false);setVibrated(false);}} style={{width:52,height:52,borderRadius:"50%",background:"#ffffff",border:"0.5px solid #dce8f4",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.8"/></svg>
          </button>

          {/* Play/Pause - big */}
          <button onClick={()=>{if(done){setLeft(total);setElapsed(0);setVibrated(false);setRun(true);}else setRun(r=>!r);}} style={{
            width:72,height:72,
            borderRadius:"50%",
            background:run&&!done?"#ef4444":"#3b82f6",
            border:"none",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",
            boxShadow:`0 4px 20px ${run&&!done?"rgba(239,68,68,0.4)":"rgba(59,130,246,0.4)"}`,
            transition:"all .2s"
          }}>
            {done?(
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.8"/></svg>
            ):run?(
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ):(
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            )}
          </button>

          {/* +30s */}
          <button onClick={()=>{if(mode==="countdown"){setLeft(l=>l+30);setTotal(t=>t+30);}}} style={{width:52,height:52,borderRadius:"50%",background:"#ffffff",border:"0.5px solid #dce8f4",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",flexDirection:"column",gap:1}}>
            <span style={{fontSize:10,fontWeight:700,color:"#3b82f6",lineHeight:1}}>+30</span>
            <span style={{fontSize:8,color:"#64748b"}}>sec</span>
          </button>
        </div>

        {/* Progress bar linéaire */}
        {mode==="countdown"&&total>0&&(
          <div style={{width:"100%",maxWidth:280,marginBottom:24}}>
            <div style={{height:3,background:"#dce8f4",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${100-pct}%`,background:arcColor,borderRadius:2,transition:"width .9s cubic-bezier(.4,0,.2,1)"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              <span style={{fontSize:9,color:"#64748b"}}>0s</span>
              <span style={{fontSize:9,color:"#64748b"}}>{fmt(total)}</span>
            </div>
          </div>
        )}
      </div>

      {/* CSS animation */}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
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
 const d=i+1,key=ds(d),sess=sessions[key],isToday=key===todayStr;
 return(
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
 if(!data||data.length<2)return<div style={{fontSize:11,color:"#64748b",textAlign:"center",padding:"8px 0"}}>Enregistrez plus de séances pour voir la progression.</div>;
 const vals=data.map(d=>parseFloat(d.poids)||0);
 const min=Math.min(...vals)*.96,max=Math.max(...vals)*1.04;
 const W=260,H=60;
 const pts=data.map((d,i)=>{const x=(i/(data.length-1))*W;const y=H-((parseFloat(d.poids)-min)/(max-min||1))*H;return`${x},${y}`;}).join(" ");
 const last=vals[vals.length-1],first=vals[0];
 const diff=(last-first).toFixed(1);
 return(
 <div>
 <Row style={{justifyContent:"space-between",marginBottom:6}}>
 <span style={{fontFamily:"'Syne',sans-serif",fontSize:22,color,letterSpacing:-0.5,fontWeight:300}}>{last}<span style={{fontSize:12,color:"#64748b"}}> kg</span></span>
 <span style={{fontSize:12,fontWeight:500,color:diff>=0?C.green:C.red}}>{diff>=0?"+":""}{diff}kg</span>
 </Row>
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:55}}>
 <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 {data.map((d,i)=>{const x=(i/(data.length-1))*W;const y=H-((parseFloat(d.poids)-min)/(max-min||1))*H;return<circle key={i} cx={x} cy={y} r={2.5} fill={color}/>;} )}
 </svg>
 </div>
 );
}
// Compatibilité modal exercice — D est un miroir de EX
const D={};
Object.entries(EX).forEach(([,exercices])=>{exercices.forEach(ex=>{D[ex.n]={m:ex.morpho||"",t:ex.tips||[],v:(ex.variantes||[]),e:ex.erreurs||[],prog:ex.prog||""};});});
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

 const Onboarding=()=>{
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
 };
 const Home=()=>{
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
 <div style={{padding:"12px 14px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:12}}>
 <div style={{fontSize:9,color:C.blue,fontWeight:600,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:5}}>Motivation du jour</div>
 <div style={{fontSize:13,color:C.text,fontWeight:500,lineHeight:1.6}}>{motiv}</div>
 </div>
 {/* ─── Streak ─── */}
          {(()=>{const s=getStreak;return s>0?(<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,padding:"8px 12px",background:"rgba(249,115,22,0.08)",border:"0.5px solid rgba(249,115,22,0.2)",borderRadius:10}}>
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
 };
 const Stats=()=>{
 if(!prog)return(
 <Box style={{textAlign:"center",padding:"40px 20px",margin:"0 15px"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,opacity:.1,fontWeight:300,marginBottom:12}}>STATS</div>
 <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Créez un programme et enregistrez vos séances pour voir votre progression.</div>
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
 {s.v}{s.u&&<span style={{fontSize:11,color:"#64748b",marginLeft:2,fontWeight:500}}>{s.u}</span>}
 </div>
 <div style={{fontSize:10,color:"#64748b",marginTop:5,letterSpacing:"0.3px"}}>{s.l}</div>
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
 <div style={{fontSize:12,color:jour.complete?C.text:"#64748b",fontWeight:jour.complete?600:400}}>{jour.nom}</div>
 <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{jour.focus}</div>
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
 <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.s3}`,display:"flex",gap:12,fontSize:10,color:"#64748b"}}>
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
 <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{r.c} séance{r.c>1?"s":""}</div>
 </div>
 <div style={{display:"flex",alignItems:"baseline",gap:3}}>
 <span style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:300,color:i===0?C.gold:C.text,letterSpacing:-0.5}}>{r.max}</span>
 <span style={{fontSize:10,color:"#64748b"}}>kg</span>
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
 <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:"#64748b",lineHeight:1.7}}>
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
 <div style={{fontSize:10,color:"#64748b"}}>{c.archiveDate||c.dateDebut}</div>
 </div>
 </Row>
 {c.morpho?.resume&&(
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.5,marginBottom:6,fontStyle:"italic"}}>
 {c.morpho.resume}
 </div>
 )}
 {c.chargesResume&&(
 <div style={{padding:"7px 9px",background:C.s2,borderRadius:7,fontSize:10,color:"#64748b"}}>
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
 <div style={{fontSize:12,color:"#64748b",marginBottom:14}}>Durée de la séance ?</div>
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
 <Lbl style={{marginBottom:4}}>Cycle {prog.numero||1} · {prog.duree_semaines||6} semaines</Lbl>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:500}}>{prog.titre}</div>
 {prog.methode&&<div style={{fontSize:10,color:"#3b82f6",marginTop:2,fontWeight:500}}>⚡ {prog.methode}</div>}
 {prog.dateDebut&&<div style={{fontSize:10,color:"#64748b",marginTop:2}}>Démarré le {prog.dateDebut}</div>}
 </div>
 {jR!==null&&jR<=7&&(
 <div style={{padding:"5px 10px",background:"rgba(224,136,58,0.15)",border:"1px solid rgba(224,136,58,0.3)",borderRadius:8,fontSize:10,color:"#f97316",fontWeight:500,flexShrink:0}}>J-{jR}</div>
 )}
 </Row>
 {/* ─── Analyse physique IA ─── */}
 {prog.analyse&&(prog.analyse.points_forts?.length>0||prog.analyse.points_faibles?.length>0)&&(
 <div style={{marginBottom:12,padding:"10px 12px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10}}>
 <div style={{fontSize:9,color:"#3b82f6",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>🔬 Analyse morphologique</div>
 {prog.analyse.morphotype&&<div style={{fontSize:11,color:"#64748b",marginBottom:6,fontStyle:"italic"}}>Morphotype : <span style={{color:C.text,fontWeight:500}}>{prog.analyse.morphotype}</span> · Humérus : {prog.analyse.humerus||"?"} · Fémurs : {prog.analyse.femurs||"?"}</div>}
 {prog.analyse.posture&&<div style={{fontSize:10,color:"#64748b",marginBottom:8,padding:"6px 8px",background:"rgba(249,115,22,0.06)",borderRadius:6}}>📐 Posture : {prog.analyse.posture}</div>}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
 {prog.analyse.points_forts?.length>0&&(
 <div>
 <div style={{fontSize:9,color:C.green,fontWeight:600,letterSpacing:"0.5px",marginBottom:4}}>✅ POINTS FORTS</div>
 {prog.analyse.points_forts.map((p,i)=><div key={i} style={{fontSize:10,color:C.text,padding:"2px 0"}}>{p}</div>)}
 </div>
 )}
 {prog.analyse.points_faibles?.length>0&&(
 <div>
 <div style={{fontSize:9,color:C.red,fontWeight:600,letterSpacing:"0.5px",marginBottom:4}}>🎯 À DÉVELOPPER</div>
 {prog.analyse.points_faibles.map((p,i)=><div key={i} style={{fontSize:10,color:C.text,padding:"2px 0"}}>{p}</div>)}
 </div>
 )}
 </div>
 {prog.analyse.recommandation_principale&&(
 <div style={{marginTop:8,padding:"6px 8px",background:"rgba(59,130,246,0.06)",borderRadius:6,fontSize:10,color:"#3b82f6",lineHeight:1.5}}>💡 {prog.analyse.recommandation_principale}</div>
 )}
 </div>
 )}
 {/* ─── Correction points faibles ─── */}
 {prog.correction?.groupes_prioritaires?.length>0&&(
 <div style={{marginBottom:12,padding:"8px 12px",background:"rgba(249,115,22,0.06)",border:"0.5px solid rgba(249,115,22,0.2)",borderRadius:8}}>
 <div style={{fontSize:9,color:"#f97316",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>🔧 Correction prioritaire</div>
 <div style={{fontSize:10,color:C.text}}>{prog.correction.groupes_prioritaires.join(" · ")}</div>
 {prog.correction.frequence_supplementaire&&<div style={{fontSize:10,color:"#64748b",marginTop:3}}>{prog.correction.frequence_supplementaire}</div>}
 </div>
 )}
 {jR===0&&(
 <div style={{padding:"12px 14px",background:"rgba(62,199,122,0.1)",border:"1px solid rgba(62,199,122,0.3)",borderRadius:10,marginBottom:12}}>
 <div style={{fontSize:13,fontWeight:500,color:C.green,marginBottom:4}}>🏆 Cycle terminé !</div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:10,lineHeight:1.5}}>Démarrez un nouveau cycle pour continuer votre progression.</div>
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
 {(()=>{
 const [viewJour,setViewJour]=useState(null);
 if(viewJour!==null){
   const jour=prog.jours[viewJour];
   const int=INT[jour.intensite||"modere"];
   return(
   <div style={{padding:"0 0 10px"}}>
    <button onClick={()=>setViewJour(null)} style={{background:"transparent",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px 15px 12px",display:"flex",alignItems:"center",gap:5}}>← Retour</button>
    <div style={{padding:"0 15px"}}>
     <div style={{padding:"12px 14px",background:`${int.c}14`,border:`0.5px solid ${int.c}40`,borderRadius:12,marginBottom:12}}>
      <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:400,marginBottom:2}}>{jour.nom}</div>
      <div style={{fontSize:11,color:"#64748b"}}>{jour.focus} · {jour.duree} · {jour.exercices?.length||0} exercices</div>
     </div>
     {(jour.exercices||[]).map((ex,k)=>{
      const cc={principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6",correctiv:"#ef4444"}[ex.cat||"principal"]||"#3b82f6";
      const [editing,setEditing]=useState(false);
      const METHODS=["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif"];
      return(
      <div key={k} style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,marginBottom:7,overflow:"hidden"}}>
       <div style={{padding:"10px 13px",borderLeft:`3px solid ${cc}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
         <div>
          <div style={{fontSize:12,fontWeight:600,color:"#0f1a2e",marginBottom:3}}>{ex.nom}</div>
          <div style={{fontSize:10,color:"#64748b"}}>{ex.series}×{ex.reps} · {ex.repos} · {ex.charge}{ex.tempo?` · ${ex.tempo}`:""}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
         </div>
         <button onClick={()=>setEditing(e=>!e)} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer",fontSize:10,flexShrink:0,marginLeft:8}}>✏️ Modifier</button>
        </div>
        {editing&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid #dce8f4"}}>
         <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:7}}>
          {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
           <div key={pp.k}>
            <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>{pp.l}</div>
            <div style={{display:"flex",gap:3,alignItems:"center"}}>
             <button onClick={()=>{const u=JSON.parse(JSON.stringify(prog));const cur=parseFloat(u.jours[viewJour].exercices[k][pp.k])||0;u.jours[viewJour].exercices[k][pp.k]=String(pp.k==="repos"?Math.max(0,cur-15):Math.max(1,cur-1));setProg(u);}} style={{width:22,height:22,borderRadius:5,background:"#f1f5f9",border:"none",cursor:"pointer",fontSize:12}}>−</button>
             <input value={ex[pp.k]||""} onChange={e=>{const u=JSON.parse(JSON.stringify(prog));u.jours[viewJour].exercices[k][pp.k]=e.target.value;setProg(u);}} style={{flex:1,padding:"4px 5px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:6,fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
             <button onClick={()=>{const u=JSON.parse(JSON.stringify(prog));const cur=parseFloat(u.jours[viewJour].exercices[k][pp.k])||0;u.jours[viewJour].exercices[k][pp.k]=String(pp.k==="repos"?cur+15:cur+1);setProg(u);}} style={{width:22,height:22,borderRadius:5,background:"#3b82f6",border:"none",color:"#fff",cursor:"pointer",fontSize:12}}>+</button>
            </div>
           </div>
          ))}
         </div>
         <div style={{marginBottom:6}}>
          <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>TEMPO</div>
          <input value={ex.tempo||""} onChange={e=>{const u=JSON.parse(JSON.stringify(prog));u.jours[viewJour].exercices[k].tempo=e.target.value;setProg(u);}} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"7px 10px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:8,fontSize:11,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
         </div>
         <div>
          <div style={{fontSize:9,color:"#64748b",marginBottom:4,fontWeight:600}}>MÉTHODE</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
           {METHODS.map(mm=>(
            <button key={mm} onClick={()=>{const u=JSON.parse(JSON.stringify(prog));u.jours[viewJour].exercices[k].methode=mm;setProg(u);}} style={{padding:"3px 8px",borderRadius:12,border:`1px solid ${ex.methode===mm?"#3b82f6":"#dce8f4"}`,background:ex.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:ex.methode===mm?"#3b82f6":"#64748b",cursor:"pointer",fontSize:9,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
           ))}
          </div>
         </div>
        </div>
        )}
       </div>
      </div>
      );
     })}
    </div>
   </div>
   );
 }
 return(
 <>{prog.jours.map((j,i)=>{
 const int=INT[j.intensite||"modere"];
 const total=j.exercices?.length||0;
 const done=j.exercices?.filter((_,idx)=>checkedEx[`${j.id}-${idx}`]).length||0;
 return(
 <Row key={i} onClick={()=>setViewJour(i)} style={{padding:"10px 12px",background:C.s2,borderRadius:9,marginBottom:5,cursor:"pointer",border:"0.5px solid #dce8f4"}}>
 <div style={{width:3,height:36,borderRadius:1.5,background:int.c,marginRight:10,flexShrink:0}}/>
 <div style={{flex:1}}>
 <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:2}}>{int.l}</div>
 <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e"}}>{j.nom}</div>
 <div style={{fontSize:10,color:"#64748b"}}>{j.focus} · {total} exercices</div>
 </div>
 <Row style={{gap:8,alignItems:"center"}}>
 {done>0&&<div style={{fontSize:10,color:C.green,fontWeight:700}}>{done}/{total}</div>}
 {j.complete&&<div style={{fontSize:10,color:C.green}}>✓</div>}
 <div style={{color:"#94a3b8",fontSize:16}}>›</div>
 </Row>
 </Row>
 );
 })}</>
 );
 })()}
 </Box>
 )}
 {!prog&&(
 <Box style={{textAlign:"center",padding:"24px 20px"}}>
 <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>Créez un programme pour planifier vos séances.</div>
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
 <button key={j} onClick={()=>setJourActif(j)} style={{padding:"6px 12px",background:jc===j?C.goldD:C.s2,border:`1px solid ${jc===j?C.gold:C.s3}`,borderRadius:16,color:jc===j?C.gold:"#64748b",cursor:"pointer",fontSize:11,whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif",fontWeight:600}}>
 {j} {newP.seances?.[j]?.exercices.length>0?`(${newP.seances[j].exercices.length})`:""}
 </button>
 ))}
 </div>
 <Box>
 <Inp placeholder={`Nom séance ${jc}`} value={sean.nom||""} onChange={e=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,nom:e.target.value}}}))}/>
 <Lbl>Intensité</Lbl>
 <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
 {Object.entries(INT).map(([k,v])=>(
 <div key={k} onClick={()=>setNewP(p=>({...p,seances:{...p.seances,[jc]:{...sean,intensite:k}}}))} style={{padding:"5px 10px",background:sean.intensite===k?`${v.c}18`:C.s2,border:`1px solid ${sean.intensite===k?v.c:C.s3}`,borderRadius:7,cursor:"pointer",fontSize:11,color:sean.intensite===k?v.c:"#64748b",fontWeight:sean.intensite===k?700:400}}>{v.l}</div>
 ))}
 </div>
 {sean.exercices.map((ex,i)=>{
 const showEdit=!!editExIdx[i];
 const METHODS=["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif","Pré-fatigue","Wave loading"];
 return(
 <div key={i} style={{background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10,marginBottom:6,overflow:"hidden"}}>
  <div style={{padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
   <div onClick={()=>setEditExIdx(m=>{const n={...m};n[i]=!n[i];return n;})} style={{flex:1,cursor:"pointer"}}>
    <div style={{fontSize:12,fontWeight:600,color:"#0f1a2e"}}>{ex.nom}</div>
    <div style={{fontSize:10,color:"#64748b",marginTop:1}}>{ex.series}×{ex.reps} · repos {ex.repos}{ex.methode&&ex.methode!=='Classique'?` · ${ex.methode}`:''}</div>
   </div>
   <div style={{display:"flex",gap:5,alignItems:"center"}}>
    <button onClick={()=>setEditExIdx(m=>{const n={...m};n[i]=!n[i];return n;})} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer",fontSize:10,fontWeight:600}}>✏️</button>
    <button onClick={()=>setNewP(p=>{const u={...p};const ses={...u.seances};const s={...ses[jc]};s.exercices=s.exercices.filter((_,j)=>j!==i);ses[jc]=s;return{...u,seances:ses};})} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:15,padding:"2px 4px"}}>×</button>
   </div>
  </div>
  {showEdit&&(
   <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.03)",borderTop:"0.5px solid #dce8f4"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
     {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
      <div key={pp.k}>
       <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600,letterSpacing:"0.5px"}}>{pp.l}</div>
       <div style={{display:"flex",alignItems:"center",gap:3}}>
        <button onClick={()=>{const u=[...sean.exercices];const cur=parseFloat(u[i][pp.k])||0;u[i][pp.k]=String(pp.k==="repos"?Math.max(0,cur-15):Math.max(1,cur-1));setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} style={{width:24,height:24,borderRadius:6,background:"#f1f5f9",border:"none",color:"#64748b",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <input value={ex[pp.k]||""} onChange={e=>{const u=[...sean.exercices];u[i][pp.k]=e.target.value;setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} style={{flex:1,padding:"5px 6px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:6,color:"#0f1a2e",fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
        <button onClick={()=>{const u=[...sean.exercices];const cur=parseFloat(u[i][pp.k])||0;u[i][pp.k]=String(pp.k==="repos"?cur+15:cur+1);setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} style={{width:24,height:24,borderRadius:6,background:"#3b82f6",border:"none",color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
       </div>
      </div>
     ))}
    </div>
    <div style={{marginBottom:7}}>
     <div style={{fontSize:9,color:"#64748b",marginBottom:4,fontWeight:600,letterSpacing:"0.5px"}}>TEMPO (montée-contraction-descente)</div>
     <input value={ex.tempo||""} onChange={e=>{const u=[...sean.exercices];u[i].tempo=e.target.value;setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"8px 10px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:8,color:"#0f1a2e",fontSize:12,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
    </div>
    <div>
     <div style={{fontSize:9,color:"#64748b",marginBottom:5,fontWeight:600,letterSpacing:"0.5px"}}>MÉTHODE D'INTENSIFICATION</div>
     <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
      {METHODS.map(mm=>(
       <button key={mm} onClick={()=>{const u=[...sean.exercices];u[i].methode=mm;setNewP(p=>{return{...p,seances:{...p.seances,[jc]:{...sean,exercices:u}}}});}} style={{padding:"4px 10px",borderRadius:14,border:`1px solid ${ex.methode===mm?"#3b82f6":"#dce8f4"}`,background:ex.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:ex.methode===mm?"#3b82f6":"#64748b",cursor:"pointer",fontSize:10,fontWeight:ex.methode===mm?600:400,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
      ))}
     </div>
    </div>
   </div>
  )}
 </div>
 );
})}
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
 <div style={{fontSize:10,color:"#64748b"}}>{ex.s}×{ex.r} · {ex.rest} · {ex.ch}</div>
 </div>
 </Row>
 <div style={{fontSize:11,color:"#64748b",fontStyle:"italic",lineHeight:1.5,marginBottom:8}}>{(ex.morpho||"").substring(0,90)}…</div>
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
 <div style={{fontSize:11,color:"#64748b"}}>{exModal.s} séries · {exModal.r} reps · {exModal.rest}</div>
 </div>
 <button onClick={()=>setExModal(null)} style={{background:"#edf3fb",border:"0.5px solid #dce8f4",borderRadius:10,width:36,height:36,color:"#64748b",cursor:"pointer",fontSize:18,flexShrink:0,marginLeft:12}}>×</button>
 </div>
 <div style={{padding:"12px 16px",display:"flex",gap:7,flexWrap:"wrap"}}>
 {[{l:"Séries",v:exModal.s},{l:"Reps",v:exModal.r},{l:"Repos",v:exModal.rest},{l:"Charge",v:exModal.ch}].map(s=>(
 <div key={s.l} style={{padding:"8px 10px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10,textAlign:"center",flex:1,minWidth:60}}>
 <div style={{fontSize:14,fontWeight:400,color:"#3b82f6",fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
 <div style={{fontSize:9,color:"#64748b",marginTop:2}}>{s.l}</div>
 </div>
 ))}
 </div>
 <div style={{padding:"0 16px",display:"flex",gap:6,marginBottom:14}}>
 {[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}].map(t=>(
 <button key={t.id} onClick={()=>setExModalTab(t.id)} style={{padding:"6px 13px",background:exModalTab===t.id?"rgba(59,130,246,0.08)":"transparent",border:`0.5px solid ${exModalTab===t.id?"#3b82f6":"#dce8f4"}`,borderRadius:20,color:exModalTab===t.id?"#3b82f6":"#64748b",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>{t.l}</button>
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
 {exModal.prog&&<div style={{marginTop:4,padding:"10px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:9}}><div style={{fontSize:10,color:"#22c55e",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>Progression</div><div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{exModal.prog}</div></div>}
 </Box>
 )}
 {exModalTab==="variantes"&&(
 <div>
 {(exModal.variantes||[]).map((v,i)=>(
 <Box key={i}>
 <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e",marginBottom:5}}>{v.nom||v}</div>
 {v.note&&<div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{v.note}</div>}
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
 {(exModal.morpho||"").split('\n').filter(Boolean).map((line,i)=>(
 <div key={i} style={{display:"flex",gap:8,marginBottom:10,paddingBottom:10,borderBottom:i<(exModal.morpho.split('\n').filter(Boolean).length-1)?"0.5px solid #dce8f4":"none",alignItems:"flex-start"}}>
 <div style={{fontSize:14,flexShrink:0,marginTop:1}}>{line.split(':')[0].trim()}</div>
 <div style={{fontSize:11.5,color:"#0f1a2e",lineHeight:1.6,flex:1}}>{line.split(':').slice(1).join(':').trim()}</div>
 </div>
 ))}
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
 setProgView("calendar");setCS(0);
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
 <div style={{fontSize:12,color:"#64748b",marginBottom:16,lineHeight:1.6}}>{loadMsg}</div>
 <Btn onClick={()=>{setLoadIA(false);setLoadMsg("");}}>← Réessayer</Btn>
 </>:<>
 <div style={{width:48,height:48,border:`3px solid ${C.goldD}`,borderTop:`3px solid ${C.gold}`,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 18px"}}/>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,color:C.gold,fontWeight:300,marginBottom:8}}>{loadMsg}</div>
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.7}}>
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
 <div style={{fontSize:10,color:"#64748b",marginBottom:12,letterSpacing:"0.5px"}}>ÉTAPE {aStep+1}/{steps.length} — {steps[aStep].toUpperCase()}</div>
 {aStep===0&&<Box>
 <Lbl>Photos de posture</Lbl>
 <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,fontSize:12,color:"#64748b",marginBottom:14,lineHeight:1.6}}>
 📸 3 photos permettent une analyse morphologique précise. Position droite, vêtements près du corps. Vous pouvez utiliser votre galerie ou prendre de nouvelles photos.
 </div>
 {/* 3 zones photo */}
 {[
 {key:"face", label:"De face", icon:"🧍", desc:"Face à l'objectif, bras le long du corps"},
 {key:"dos", label:"De dos", icon:"🔄", desc:"Dos à l'objectif, bras le long du corps"},
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
 <div style={{fontSize:10,color:"#64748b",marginTop:2,textAlign:"center",padding:"0 10px"}}>{desc}</div>
 </>
 }
 {photos[key]&&(
 <div style={{position:"absolute",top:6,right:6,background:"rgba(8,9,13,0.7)",borderRadius:6,padding:"3px 8px",fontSize:10,color:C.green,fontWeight:700}}>✓ {label}</div>
 )}
 </div>
 </div>
 ))}
 {/* inputs fichiers — sans capture="environment" pour accès galerie */}
 <input ref={fileRefFace} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("face", e.target.files[0])}/>
 <input ref={fileRefDos} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("dos", e.target.files[0])}/>
 <input ref={fileRefProfil} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("profil",e.target.files[0])}/>
 <div style={{marginTop:6,marginBottom:10,fontSize:11,color:"#64748b",textAlign:"center"}}>
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
 <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Prénom <span style={{color:C.textMid}}>(facultatif)</span></div>
 <Inp placeholder="Prénom" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})}/>
 <G2>
 <div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Âge <span style={{color:C.red}}>*</span></div>
 <Inp type="number" placeholder="Ex: 28" style={{marginBottom:0}} value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/>
 </div>
 <div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Sexe <span style={{color:C.red}}>*</span></div>
 <select style={{width:"100%",padding:"11px 13px",background:C.s2,border:`1px solid ${form.sexe?C.green:C.s3}`,borderRadius:9,color:C.text,fontSize:13}} value={form.sexe} onChange={e=>setForm({...form,sexe:e.target.value})}>
 <option value="">Choisir…</option><option value="homme">Homme</option><option value="femme">Femme</option>
 </select>
 </div>
 </G2>
 <G2 style={{marginTop:6}}>
 <div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Poids (kg) <span style={{color:C.red}}>*</span></div>
 <Inp type="number" placeholder="Ex: 75" style={{marginBottom:0,borderColor:form.poids?C.green:C.s3}} value={form.poids} onChange={e=>setForm({...form,poids:e.target.value})}/>
 </div>
 <div>
 <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Taille (cm) <span style={{color:C.red}}>*</span></div>
 <Inp type="number" placeholder="Ex: 178" style={{marginBottom:0,borderColor:form.taille?C.green:C.s3}} value={form.taille} onChange={e=>setForm({...form,taille:e.target.value})}/>
 </div>
 </G2>
 <div style={{fontSize:11,color:"#64748b",marginBottom:6,marginTop:6}}>Niveau <span style={{color:C.red}}>*</span></div>
 {[{id:"debutant",l:"Débutant",d:"< 1 an"},{id:"intermediaire",l:"Intermédiaire",d:"1-3 ans"},{id:"avance",l:"Avancé",d:"> 3 ans"}].map(n=>(
 <div key={n.id} onClick={()=>setForm({...form,niveau:n.id})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:form.niveau===n.id?C.goldD:C.s2,border:`1px solid ${form.niveau===n.id?C.gold:C.s3}`,borderRadius:9,cursor:"pointer",marginBottom:6}}>
 <span style={{fontSize:13,fontWeight:600}}>{n.l}</span><span style={{fontSize:10,color:"#64748b"}}>{n.d}</span>
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
 <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>Objectif principal <span style={{color:C.red}}>*</span></div>
 <G2>{[{id:"hypertrophie",i:"💪",l:"Prise de muscle"},{id:"force",i:"🏋️",l:"Force"},{id:"poids",i:"🔥",l:"Perte de poids"},{id:"reathletisation",i:"🩺",l:"Réathlé"},{id:"sante",i:"❤️",l:"Santé"},{id:"performance",i:"🏆",l:"Performance"}].map(o=>(
 <div key={o.id} onClick={()=>setForm({...form,objectif:o.id})} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:form.objectif===o.id?C.goldD:C.s2,border:`1px solid ${form.objectif===o.id?C.gold:C.s3}`,borderRadius:10}}>
 <div style={{fontSize:20,marginBottom:4}}>{o.i}</div><div style={{fontSize:11,fontWeight:400}}>{o.l}</div>
 </div>
 ))}</G2>
 <textarea style={{width:"100%",padding:"11px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.text,fontSize:13,minHeight:60,resize:"vertical",marginBottom:10,fontFamily:"'Inter',sans-serif"}} placeholder="Décrivez votre objectif précis (facultatif)" value={form.objectifPrecis} onChange={e=>setForm({...form,objectifPrecis:e.target.value})}/>
 <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>Jours d'entraînement <span style={{color:C.red}}>*</span></div>
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
 <div style={{padding:"8px 10px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:7,fontSize:11,color:"#64748b",marginBottom:10,lineHeight:1.6}}>Exercices correctifs = renforcement uniquement. Consultez un kiné pour tout diagnostic.</div>
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
 <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>Matériel disponible <span style={{color:C.red}}>*</span></div>
 <G2>{[{id:"salle_complete",i:"🏋️",l:"Salle complète"},{id:"halteres",i:"💪",l:"Haltères"},{id:"elastiques",i:"🎯",l:"Élastiques"},{id:"barre_traction",i:"⬆️",l:"Barre traction"},{id:"poids_corps",i:"🤸",l:"Poids du corps"},{id:"machines",i:"⚙️",l:"Machines"}].map(m=>(
 <div key={m.id} onClick={()=>setForm(f=>({...f,materiel:f.materiel.includes(m.id)?f.materiel.filter(x=>x!==m.id):[...f.materiel,m.id]}))} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:form.materiel.includes(m.id)?"rgba(59,130,246,0.08)":C.s2,border:`1px solid ${form.materiel.includes(m.id)?"#3b82f6":C.s3}`,borderRadius:10}}>
 <div style={{fontSize:20,marginBottom:4}}>{m.i}</div><div style={{fontSize:11,fontWeight:400}}>{m.l}</div>
 </div>
 ))}</G2>
 {/* ─── Option corriger les points faibles ─── */}
 <div onClick={()=>setCorrigerFaibles(v=>!v)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:corrigerFaibles?"rgba(59,130,246,0.06)":"#f8fafc",border:`0.5px solid ${corrigerFaibles?"#3b82f6":"#dce8f4"}`,borderRadius:10,cursor:"pointer",marginTop:10,transition:"all.15s"}}>
 <div style={{width:20,height:20,borderRadius:5,background:corrigerFaibles?"#3b82f6":"transparent",border:`1.5px solid ${corrigerFaibles?"#3b82f6":"#64748b"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all.15s"}}>
 {corrigerFaibles&&<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>}
 </div>
 <div>
 <div style={{fontSize:12,fontWeight:500,color:C.text}}>Corriger mes points faibles</div>
 <div style={{fontSize:10,color:"#64748b",marginTop:1}}>L'IA priorisera les groupes musculaires en retard détectés sur les photos</div>
 </div>
 </div>
 {form.materiel.length===0&&<div style={{fontSize:11,color:C.red,marginBottom:8,marginTop:6}}>* Sélectionne au moins un équipement</div>}
 <Btn disabled={form.materiel.length===0} onClick={lancerIA} style={{marginTop:10}}>🚀 Générer mon programme</Btn>
 <Btn v="ghost" onClick={()=>setAStep(3)}>← Retour</Btn>
 </Box>}
 </div>
 );
 };
 const Nutrition=()=>{
 const tot=totR;
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
 style={{transition:"stroke-dashoffset.8s ease"}}/>
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
 strokeLinecap="round" style={{transition:"stroke-dashoffset.8s ease"}}/>
 </svg>
 <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
 <span style={{fontSize:10,fontWeight:700,color}}>{Math.round(pct)}%</span>
 </div>
 </div>
 <div style={{textAlign:"center"}}>
 <div style={{fontSize:11,fontWeight:700,color:C.text}}>{v}g</div>
 <div style={{fontSize:9,color:"#64748b"}}>{label}</div>
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
 <div style={{padding:"14px 16px",background:C.s1,borderRadius:14,marginBottom:12,border:"0.5px solid #dce8f4"}}>
 <Row style={{justifyContent:"space-between",marginBottom:10}}>
 <div>
 <div style={{fontSize:13,fontWeight:500}}>Hydratation</div>
 <div style={{fontSize:10,color:"#64748b"}}>{eau*250}ml / 2000ml</div>
 </div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:eau>=8?C.green:C.blue}}>{eau}/8</div>
 </Row>
 <div style={{display:"flex",gap:5,marginBottom:8}}>
 {[...Array(8)].map((_,i)=>(
 <div key={i} onClick={()=>setEau(i<eau?i:i+1)} style={{flex:1,height:26,borderRadius:7,background:i<eau?`rgba(59,130,246,${0.25+i*0.09})`:"#dce8f4",cursor:"pointer",transition:"background.2s"}}/>
 ))}
 </div>
 <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
 <div style={{height:"100%",width:`${eau/8*100}%`,background:C.blue,borderRadius:2,transition:"width.5s"}}/>
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
 };
 const Profile=()=>(
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
 // ─────────────────────────────────────
 // PROGRAMME TAB
 // ─────────────────────────────────────

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
 const [checkedEx,setCheckedEx]=useStorage("checkedEx",{});
 const [selectedWeekDay,setSelectedWeekDay]=useState(null);
 const [progView,setProgView]=useState("today");
 const [weightLog,setWeightLog]=useStorage("weightLog",[]);
 const [lastWeighIn,setLastWeighIn]=useStorage("lastWeighIn",null);
 const [showWeightInput,setShowWeightInput]=useState(false);
 const [newWeight,setNewWeight]=useState("");

 const toggleCheck=(seanceId,exIdx,repos)=>{
 const key=`${seanceId}-${exIdx}`;
 const wasChecked=checkedEx[key];
 setCheckedEx(prev=>({...prev,[key]:!prev[key]}));
 // ─── Auto-lancement du timer de repos ───
 if(!wasChecked&&repos){
   const sec=parseInt((repos||"90s").replace(/[^0-9]/g,""))||90;
   setChronoSec(sec);
   setChrono(true);
 }
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
 <div style={{fontSize:11,color:"#64748b"}}>{seance.focus} · {seance.duree}</div>
 </div>
 <div style={{textAlign:"center"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:300,color:pct===100?C.green:C.gold}}>{pct}%</div>
 <div style={{fontSize:9,color:"#64748b"}}>{done}/{total}</div>
 </div>
 </Row>
 <Bar pct={pct} color={pct===100?C.green:int.c} h={4}/>
 </div>
 <button onClick={()=>setChrono(true)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500,marginBottom:10}}>⏱ Chronomètre de repos</button>
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
 <div onClick={()=>toggleCheck(seance.id,j,ex.repos)} style={{width:20,height:20,borderRadius:5,background:isChecked?C.green:"transparent",border:`2px solid ${isChecked?C.green:C.s3}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"white"}}>{isChecked?"✓":""}</div>
 <div style={{fontSize:13,fontWeight:500,textDecoration:isChecked?"line-through":"none",color:isChecked?"#64748b":C.text}}>{ex.nom}</div>
 </Row>
 <div style={{display:"inline-block",padding:"2px 8px",background:`${cc}18`,border:`1px solid ${cc}30`,borderRadius:5,fontSize:9,color:cc,fontWeight:700,textTransform:"uppercase"}}>{ex.cat}</div>
 </div>
 <Row style={{gap:5}}>
 <button onClick={()=>setExEdit(e=>({...e,[`${seance.id}-${j}`]:!e[`${seance.id}-${j}`]}))} style={{padding:"4px 8px",background:editMd?"rgba(212,168,83,0.15)":C.s2,border:`1px solid ${editMd?C.gold:C.s3}`,borderRadius:6,color:editMd?C.gold:"#64748b",cursor:"pointer",fontSize:11}}>✏️</button>
 <button onClick={()=>setExDetails(e=>({...e,[`${seance.id}-${j}`]:!e[`${seance.id}-${j}`]}))} style={{padding:"4px 8px",background:showDet?"rgba(77,143,224,0.15)":C.s2,border:`1px solid ${showDet?C.blue:C.s3}`,borderRadius:6,color:showDet?C.blue:"#64748b",cursor:"pointer",fontSize:11}}>{showDet?"▲":"ℹ️"}</button>
 </Row>
 </Row>
 {!editMd?(
 <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
 {[{l:"Sets",v:ex.series},{l:"Reps",v:ex.reps},{l:"Repos",v:ex.repos},{l:"Charge",v:ex.charge}].filter(s=>s.v).map(s=>(
 <div key={s.l} style={{padding:"4px 9px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:6,textAlign:"center",minWidth:52}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:500,color:C.gold}}>{s.v}</div>
 <div style={{fontSize:9,color:"#64748b"}}>{s.l}</div>
 </div>
 ))}
 </div>
 ):(
 <div style={{background:C.s2,borderRadius:8,padding:10,marginBottom:10}}>
 <div style={{fontSize:10,color:C.gold,fontWeight:700,marginBottom:8}}>✏️ Modifier</div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
 {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(p=>(
 <div key={p.k}>
 <div style={{fontSize:9,color:"#64748b",marginBottom:3}}>{p.l}</div>
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
 {ex.morpho_tip&&<div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:"#64748b",lineHeight:1.5,marginBottom:6}}><span style={{color:C.gold,fontWeight:700}}>Morpho · </span>{ex.morpho_tip}</div>}
 {showDet&&(
 <div style={{borderTop:`1px solid ${C.s3}`,paddingTop:10,marginTop:4}}>
 {exInfo?.morpho&&<div style={{padding:"7px 9px",background:C.goldD,borderRadius:7,fontSize:11,color:"#64748b",lineHeight:1.5,marginBottom:8}}><span style={{color:C.gold,fontWeight:700}}>Guide · </span>{exInfo.morpho}</div>}
 {exInfo?.tips?.length>0&&(
 <div style={{marginBottom:8}}>
 <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:5}}>Tips</div>
 {exInfo.tips.map((tip,ti)=>(
 <Row key={ti} style={{gap:7,marginBottom:4,alignItems:"flex-start"}}>
 <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(62,199,122,0.12)",border:"1px solid rgba(62,199,122,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0,marginTop:1}}>{ti+1}</div>
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{tip}</div>
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
 <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{err}</div>
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
 <Box style={{borderLeft:`3px solid ${INT[todaySeance.intensite||"modere"].c}`,padding:0,overflow:"hidden"}}>
   {/* Header cliquable → SeanceDetail */}
   <div onClick={()=>setViewSeance(todaySeance)} style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div>
     <div style={{fontSize:9,color:INT[todaySeance.intensite||"modere"].c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{INT[todaySeance.intensite||"modere"].l}</div>
     <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:400,color:"#0f1a2e"}}>{todaySeance.nom}</div>
     <div style={{fontSize:11,color:"#64748b"}}>{todaySeance.focus} · {todaySeance.duree}</div>
    </div>
    <div style={{textAlign:"right"}}>
     {(()=>{
       const total=todaySeance.exercices?.length||0;
       const done=todaySeance.exercices?.filter((_,idx)=>checkedEx[`${todaySeance.id}-${idx}`]).length||0;
       const pct=total>0?Math.round(done/total*100):0;
       return <>
         <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:300,color:pct===100?C.green:"#3b82f6",lineHeight:1}}>{pct}%</div>
         <div style={{fontSize:9,color:"#64748b"}}>{done}/{total}</div>
       </>;
     })()}
    </div>
   </div>
   {/* Liste exercices aperçu */}
   {!todaySeance.complete&&(
    <div style={{borderTop:"0.5px solid #dce8f4",padding:"8px 14px 10px"}}>
     {(todaySeance.exercices||[]).map((ex,idx)=>{
      const isChecked=!!checkedEx[`${todaySeance.id}-${idx}`];
      const cc={principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6"}[ex.cat||"principal"]||"#3b82f6";
      return(
      <div key={idx} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:idx<(todaySeance.exercices.length-1)?"0.5px solid #f1f5f9":"none",opacity:isChecked?0.5:1}}>
       <div onClick={()=>toggleCheck(todaySeance.id,idx,ex.repos)} style={{width:16,height:16,borderRadius:4,background:isChecked?C.green:"transparent",border:`1.5px solid ${isChecked?C.green:"#dce8f4"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,color:"#fff"}}>{isChecked?"✓":""}</div>
       <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:500,color:isChecked?"#94a3b8":"#0f1a2e",textDecoration:isChecked?"line-through":"none"}}>{ex.nom}</div>
        <div style={{fontSize:9,color:"#64748b"}}>{ex.series}×{ex.reps} · {ex.repos}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
       </div>
       <div style={{width:3,height:20,borderRadius:2,background:cc,flexShrink:0}}/>
      </div>
      );
     })}
     <button onClick={()=>setViewSeance(todaySeance)} style={{width:"100%",marginTop:8,padding:"8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:8,color:"#3b82f6",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>
      Démarrer la séance →
     </button>
    </div>
   )}
   {todaySeance.complete&&<div style={{padding:"8px 14px 10px",fontSize:11,color:C.green,fontWeight:600}}>✓ Complétée le {todaySeance.date}</div>}
 </Box>
 </div>
 ):(
 <Box style={{textAlign:"center",padding:"24px 16px"}}>
 <div style={{fontSize:32,marginBottom:8}}>😴</div>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:500,marginBottom:4}}>Jour de repos</div>
 <div style={{fontSize:12,color:"#64748b",marginBottom:14,lineHeight:1.6}}>Profites-en pour récupérer ou ajouter une séance bonus.</div>
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
 <div style={{fontSize:12,color:"#64748b",marginBottom:14}}>Durée de la séance ?</div>
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
 <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Aucun programme actif</div>
 <Btn onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>✨ Générer mon programme</Btn>
 <Btn v="out" onClick={()=>setProgView("creer")}>Créer manuellement</Btn>
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
 <div style={{width:36,height:36,borderRadius:"50%",background:isToday?C.goldD:C.s3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:isToday?C.gold:"#64748b",flexShrink:0}}>{day}</div>
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
 <div style={{width:36,height:36,borderRadius:"50%",background:isToday?`${int.c}30`:C.s3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:isToday?int.c:"#64748b",flexShrink:0}}>{day}</div>
 <div>
 <div style={{fontSize:12,fontWeight:500}}>{seance.nom}</div>
 <div style={{fontSize:10,color:"#64748b"}}>{seance.focus} · {total} exercices</div>
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
 <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Aucun programme actif</div>
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
 {id:"creer",l:"Programme"},
 {id:"analyse",l:"Programme Pro",prem:true},
 ];
 return(
 <div style={{paddingBottom:16}}>
 <div style={{padding:"26px 15px 12px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:30,letterSpacing:-0.3,fontWeight:300}}>PROGRAMMATION</div></div>
 <div style={{display:"flex",gap:5,padding:"0 15px",marginBottom:14,overflowX:"auto",paddingBottom:3}}>
 {subNav.map(s=>(
 <button key={s.id} onClick={()=>{if(s.prem&&!premium)setPaywall(true);else setProgView(s.id);}} style={{padding:"7px 13px",background:progView===s.id?C.goldD:C.s2,border:`1px solid ${progView===s.id?C.gold:C.s3}`,borderRadius:18,color:progView===s.id?C.gold:"#64748b",cursor:"pointer",fontSize:11.5,fontWeight:600,whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif"}}>{s.l}</button>
 ))}
 </div>
 {progView==="calendar"&&Calendar()}
 {progView==="today"&&<TodayView/>}
 
 
 {progView==="creer"&&<div style={{padding:"0 15px"}}>
 <Box>
 <Lbl>Mon programme</Lbl>
 {prog?(
 <div>
 <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:9,marginBottom:12}}>
 <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Cycle {prog.numero||1} actif</div>
 <div style={{fontSize:14,fontWeight:500}}>{prog.titre}</div>
 <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{prog.jours?.length} séances · Démarré le {prog.dateDebut}</div>
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
 <div style={{fontSize:10,color:"#64748b"}}>{j.focus} · {total} exercices</div>
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
 <Btn onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>✨ Nouveau programme</Btn>
 <div style={{textAlign:"center",marginTop:4}}>
 <span onClick={()=>{setCreateStep(0);setNewP({nom:"",jours:[],seances:{}});}} style={{fontSize:11,color:"#64748b",cursor:"pointer",textDecoration:"underline",textDecorationStyle:"dotted"}}>Créer manuellement</span>
 </div>
 </div>
 ):(
 <div>
 <div style={{textAlign:"center",padding:"24px 0 8px"}}>
 <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:400,color:"#0f1a2e",marginBottom:4}}>Programme sur-mesure ✦</div>
 <div style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:20}}>Obtenez un programme 100% adapté à votre morphologie, niveau et objectifs grâce à notre algorithme avancé</div>
 </div>
 <Btn onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>✨ Générer mon programme</Btn>

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
 cursor:"pointer",
 transition:"all.15s",
 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tab==="profile"?"#3b82f6":"#64748b"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></button>
 </div>
 </div>
 {showOnboarding&&Onboarding()}
 <div style={{maxWidth:500,margin:"0 auto",paddingBottom:72}}>
 {tab==="home"&&Home()}
 {tab==="program"&&ProgramTab()}
 {tab==="nutrition"&&Nutrition()}
 {tab==="profile"&&Profile()}
 </div>
 {/* Nav — 3 onglets uniquement */}
 <nav className="np" style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(230,240,252,0.98)",backdropFilter:"blur(20px)",borderTop:"0.5px solid #c8daf0",display:"flex",zIndex:100}}>
 {NAV.map(t=>(
 <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px 12px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all.15s",fontFamily:"'Inter',sans-serif"}}>
 <div style={{color:tab===t.id?"#3b82f6":"#64748b",transition:"color.15s",lineHeight:1}}>{t.svg}</div>
 <span style={{fontSize:9,letterSpacing:"0.3px",fontWeight:tab===t.id?600:400,color:tab===t.id?"#3b82f6":"#64748b",transition:"color.15s"}}>{t.l}</span>
 {tab===t.id&&<div style={{width:20,height:2,borderRadius:1,background:"#3b82f6"}}/>}
 </button>
 ))}
 </nav>
 {showChrono&&<Chrono onClose={()=>setChrono(false)} initSec={chronoSec}/>}
 {paywall&&Paywall()}
 </div>
 );
}
