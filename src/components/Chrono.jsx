import { useState, useRef, useEffect } from "react";

export default function Chrono({onClose,initSec=90}){
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
