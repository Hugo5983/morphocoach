import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { C } from "../../data/constants.js";
import { Btn, Inp, G2 } from "../../components/ui/index.jsx";
import { computeHealthScore } from "./utils/healthScore.js";
import { scanBarcode } from "../../services/nutritionService.js";

const SERIF   = "'DM Serif Display','Georgia',serif";
const DISPLAY = "'Outfit','DM Sans',system-ui,sans-serif";
const NUM     = { fontVariantNumeric:'tabular-nums', fontFeatureSettings:'"tnum"' };
const card    = { background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.25)' };
const eyebrowS = { fontSize:10, fontWeight:600, color:C.dim, letterSpacing:'1.2px', textTransform:'uppercase', fontFamily:DISPLAY };

// ─── REAL COLORS ────────────────────────────────────────────────────────
const CLR = {
  amber:'#F59E0B', amberDk:'#D97706',
  coral:'#F87171', coralDk:'#EF4444',
  blue:'#3B82F6',  blueDk:'#2563EB',
  indigo:'#818CF8',indigoDk:'#6366F1',
  violet:'#A78BFA',violetDk:'#7C3AED',
  mint:'#34D399',  mintDk:'#059669',
};

const EMPTY_REPAS = { matin:[], midi:[], soir:[], snack:[] };

// ─── DATE HELPERS ────────────────────────────────────────────────────────
function toKey(d){ return d.toISOString().split('T')[0]; }
function todayKey(){ return toKey(new Date()); }
function addDays(key,n){ const d=new Date(key+'T12:00:00'); d.setDate(d.getDate()+n); return toKey(d); }
function fmtDate(key){
  const today=todayKey(), yest=addDays(today,-1);
  if(key===today) return 'Aujourd\'hui';
  if(key===yest)  return 'Hier';
  const d=new Date(key+'T12:00:00');
  return d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
}

// ─── ICONS ───────────────────────────────────────────────────────────────
function I({name,size=18,color='currentColor',stroke=1.6}){
  const p={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:color,strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round'};
  const paths={
    drop:<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    scan:<><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></>,
    chev:<path d="m9 6 6 6-6 6"/>,
    chevL:<path d="m15 18-6-6 6-6"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>,
    moon:<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>,
    apple:<><path d="M16 4c-1.5 0-3 1-3 2.5"/><path d="M19 14c0 4-2 7-4 7-1.5 0-2-1-3-1s-1.5 1-3 1c-2 0-4-3-4-7s2-7 4-7c1.5 0 2 1 3 1s1.5-1 3-1c2 0 4 3 4 7Z"/></>,
    cookie:<><path d="M12 3a9 9 0 1 0 9 9c-2 0-3-1-3-3s-1-3-3-3-3-1-3-3Z"/><circle cx="9" cy="11" r=".9"/><circle cx="14" cy="15" r=".9"/><circle cx="8" cy="15" r=".9"/></>,
    x:<path d="M18 6 6 18M6 6l12 12"/>,
    cam:<><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></>,
    close:<path d="M18 6 6 18M6 6l12 12"/>,
    check:<path d="M20 6 9 17l-5-5"/>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ─── CALORIE RING ────────────────────────────────────────────────────────
function CalorieRing({consumed,goal}){
  const remaining=Math.max(goal-consumed,0);
  const pct=Math.min(consumed/(goal||1),1);
  const over=consumed>goal;
  const r=82,circ=2*Math.PI*r;
  return(
    <div style={{position:'relative',width:200,height:200,margin:'0 auto'}}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="ringG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={over?CLR.coral:CLR.blue}/>
            <stop offset="100%" stopColor={over?CLR.coralDk:CLR.indigo}/>
          </linearGradient>
        </defs>
        <g transform="rotate(-90 100 100)">
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx="100" cy="100" r={r} fill="none" stroke="url(#ringG)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
            style={{transition:'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)'}}/>
        </g>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{...eyebrowS,letterSpacing:'1px'}}>{over?'Dépassé':'Restant'}</div>
        <div style={{fontFamily:SERIF,fontSize:52,fontWeight:400,letterSpacing:-2,color:over?CLR.coral:C.text,lineHeight:.95,marginTop:6,...NUM}}>
          {(over?consumed-goal:remaining).toLocaleString('fr-FR').replace(',',' ')}
        </div>
        <div style={{fontSize:12,color:C.mid,fontWeight:500,marginTop:6,letterSpacing:0.2,fontFamily:DISPLAY}}>kcal</div>
      </div>
    </div>
  );
}

function HeroStat({value,label,accent}){
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flex:1}}>
      <span style={{width:22,height:2,background:accent,borderRadius:2}}/>
      <span style={{fontFamily:DISPLAY,fontSize:18,fontWeight:700,color:C.text,letterSpacing:-0.3,...NUM}}>{(value||0).toLocaleString('fr-FR').replace(',',' ')}</span>
      <span style={{...eyebrowS}}>{label}</span>
    </div>
  );
}

// ─── MACRO CARD ──────────────────────────────────────────────────────────
function MacroCard({label,value,goal,color,colorDk}){
  const pct=Math.round(Math.min(value/(goal||1),1)*100);
  return(
    <div style={{flex:1,padding:'12px 10px',borderRadius:14,background:`${color}12`,border:`1px solid ${color}32`,display:'flex',flexDirection:'column',gap:7}}>
      <div style={{display:'flex',alignItems:'center',gap:5}}>
        <span style={{width:5,height:5,borderRadius:'50%',background:color,boxShadow:`0 0 5px ${color}`}}/>
        <span style={{...eyebrowS,color,fontSize:8}}>{label}</span>
      </div>
      <div style={{display:'flex',alignItems:'baseline',gap:2}}>
        <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:C.text,letterSpacing:-0.5,...NUM}}>{value}</span>
        <span style={{fontSize:10,color:C.dim,fontWeight:500,...NUM}}>/{goal}g</span>
      </div>
      <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:4,overflow:'hidden'}}>
        <div style={{height:'100%',width:pct+'%',background:`linear-gradient(90deg,${color},${colorDk})`,borderRadius:4,transition:'width .8s ease'}}/>
      </div>
      <span style={{fontSize:9.5,color,fontWeight:700,...NUM,letterSpacing:0.3,fontFamily:DISPLAY}}>{pct}%</span>
    </div>
  );
}

// ─── SCORE CARD — filled background matching grade ────────────────────────
function ScoreCard({score,scoreLettre,scoreColor,scoreDetails}){
  const [open,setOpen]=useState(false);
  // Derive bg from score color
  const bg = `${scoreColor}18`;
  const border = `${scoreColor}40`;
  return(
    <div style={{borderRadius:16,background:bg,border:`1.5px solid ${border}`,overflow:'hidden'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}}>
        <div style={{width:46,height:46,borderRadius:14,background:`${scoreColor}25`,border:`1.5px solid ${scoreColor}60`,display:'grid',placeItems:'center',flexShrink:0}}>
          <span style={{fontFamily:SERIF,fontSize:26,fontWeight:400,color:scoreColor,lineHeight:1}}>{scoreLettre}</span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:DISPLAY,fontSize:13,fontWeight:700,color:C.text,letterSpacing:-0.1}}>Score nutritionnel</div>
          <div style={{marginTop:5,height:4,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${score}%`,background:`linear-gradient(90deg,${CLR.coral},${CLR.amber},${CLR.mint})`,borderRadius:4,transition:'width .8s'}}/>
          </div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontFamily:DISPLAY,fontSize:22,fontWeight:700,color:scoreColor,...NUM}}>{score}</div>
          <div style={{fontSize:9,color:C.dim,letterSpacing:0.5,fontFamily:DISPLAY,marginTop:-1}}>/ 100</div>
        </div>
        <div style={{color:C.dim,transform:open?'rotate(90deg)':'none',transition:'transform .2s',flexShrink:0}}><I name="chev" size={14} stroke={2}/></div>
      </div>
      {open&&(
        <div style={{padding:'0 16px 14px',borderTop:`1px solid ${scoreColor}25`}}>
          <div style={{paddingTop:10}}>
            {scoreDetails.map((d,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:i<scoreDetails.length-1?`1px solid rgba(255,255,255,0.06)`:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:16}}>{d.icon}</span>
                  <span style={{fontSize:12,color:C.text}}>{d.l}</span>
                </div>
                <div style={{width:20,height:20,borderRadius:'50%',background:d.ok?`${CLR.mint}22`:`${CLR.coral}22`,border:`1px solid ${d.ok?CLR.mint:CLR.coral}55`,display:'grid',placeItems:'center',fontSize:10,color:d.ok?CLR.mint:CLR.coral}}>{d.ok?'✓':'✕'}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,padding:'10px 12px',background:'rgba(0,0,0,0.15)',borderRadius:12,fontSize:11,color:C.mid,lineHeight:1.6}}>
            💡 {score>=85?"Excellente journée nutritionnelle ! Continuez comme ça.":score>=70?"Bonne journée, quelques petits ajustements possibles.":score>=55?"Journée correcte. Pensez à l'hydratation et la diversité.":score>=40?"Des efforts à faire sur la qualité alimentaire.":"Journée difficile. Revenez aux bases demain."}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CAMERA SCANNER MODAL ────────────────────────────────────────────────
function CameraScanner({ onResult, onClose, MEALS, setDisplayRepas, push }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('starting'); // starting | scanning | found | error
  const [result, setResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Start camera
  useEffect(() => {
    let active = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode:'environment' } })
      .then(stream => {
        if(!active) { stream.getTracks().forEach(t=>t.stop()); return; }
        streamRef.current = stream;
        if(videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        setStatus('scanning');
      })
      .catch(() => setStatus('error'));
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t=>t.stop());
    };
  }, []);

  const doScan = useCallback(async (code) => {
    if(!code || code.length < 8) return;
    setLoading(true);
    const r = await scanBarcode(code);
    setLoading(false);
    if(r && !r.error) { setResult(r); setStatus('found'); }
    else setStatus('error');
  }, []);

  const addToMeal = (mealId) => {
    if(!result) return;
    setDisplayRepas(rp=>({...rp,[mealId]:[...(rp[mealId]||[]),result]}));
    push("✅","Ajouté !",`${result.n} ajouté.`);
    onClose();
  };

  // Overlay style
  const overlay = {
    position:'fixed',inset:0,zIndex:999,background:'rgba(6,10,20,0.97)',
    display:'flex',flexDirection:'column',
  };

  return (
    <div style={overlay}>
      {/* Header */}
      <div style={{padding:'20px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontFamily:DISPLAY,fontSize:17,fontWeight:700,color:C.text}}>Scanner un produit</div>
          <div style={{fontSize:11,color:C.mid,marginTop:2}}>Pointez vers le code-barres</div>
        </div>
        <button onClick={onClose} style={{width:36,height:36,borderRadius:11,background:C.s2,border:`1px solid ${C.bd}`,color:C.mid,display:'grid',placeItems:'center',cursor:'pointer'}}>
          <I name="close" size={16} stroke={2}/>
        </button>
      </div>

      {/* Camera viewfinder */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
        <div style={{position:'relative',width:'100%',maxWidth:320,aspectRatio:'1/1',borderRadius:24,overflow:'hidden',background:'#000'}}>
          <video ref={videoRef} style={{width:'100%',height:'100%',objectFit:'cover'}} playsInline muted/>

          {/* Viewfinder corners */}
          {status==='scanning'&&(
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
              <div style={{position:'relative',width:180,height:120}}>
                {[{t:0,l:0,bt:'none',br:'none'},{t:0,r:0,bt:'none',bl:'none'},{b:0,l:0,bb:'none',br:'none'},{b:0,r:0,bb:'none',bl:'none'}].map((_,i)=>{
                  const c={position:'absolute',width:24,height:24};
                  const base={borderColor:CLR.blue,borderWidth:3,borderStyle:'solid'};
                  const sides=[
                    {borderTop:'3px solid',borderLeft:'3px solid',borderBottom:'none',borderRight:'none',top:0,left:0,borderRadius:'4px 0 0 0'},
                    {borderTop:'3px solid',borderRight:'3px solid',borderBottom:'none',borderLeft:'none',top:0,right:0,borderRadius:'0 4px 0 0'},
                    {borderBottom:'3px solid',borderLeft:'3px solid',borderTop:'none',borderRight:'none',bottom:0,left:0,borderRadius:'0 0 0 4px'},
                    {borderBottom:'3px solid',borderRight:'3px solid',borderTop:'none',borderLeft:'none',bottom:0,right:0,borderRadius:'0 0 4px 0'},
                  ];
                  return <div key={i} style={{...c,...sides[i],borderColor:CLR.blue}}/>;
                })}
                {/* Scan line animation */}
                <div style={{position:'absolute',left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${CLR.blue},transparent)`,animation:'scanLine 2s ease-in-out infinite',top:'50%'}}/>
              </div>
            </div>
          )}

          {status==='starting'&&(
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)'}}>
              <div style={{fontSize:13,color:C.mid,textAlign:'center'}}>Activation caméra…</div>
            </div>
          )}
          {status==='error'&&!result&&(
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)'}}>
              <div style={{fontSize:12,color:CLR.coral,textAlign:'center',padding:'0 20px'}}>Caméra indisponible<br/><span style={{color:C.dim}}>Entrez le code manuellement</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{padding:'0 20px 32px',flexShrink:0}}>
        {status!=='found'&&(
          <>
            <div style={{fontSize:11,color:C.dim,textAlign:'center',marginBottom:10}}>Ou entrez le code-barres manuellement</div>
            <div style={{display:'flex',gap:8}}>
              <input
                inputMode="numeric"
                placeholder="Code EAN (ex: 3017620422003)"
                value={manualCode}
                onChange={e=>setManualCode(e.target.value)}
                style={{flex:1,padding:'11px 14px',background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,color:C.text,fontSize:13,fontFamily:DISPLAY,outline:'none'}}
              />
              <button
                disabled={loading||manualCode.length<8}
                onClick={()=>doScan(manualCode)}
                style={{padding:'11px 16px',borderRadius:12,background:CLR.blue,border:'none',color:'#fff',fontWeight:700,fontFamily:DISPLAY,fontSize:13,cursor:'pointer',opacity:manualCode.length<8?0.4:1}}
              >
                {loading?'…':'OK'}
              </button>
            </div>
          </>
        )}

        {/* Result */}
        {status==='found'&&result&&(
          <div style={{background:`${CLR.mint}14`,border:`1px solid ${CLR.mint}35`,borderRadius:16,padding:16}}>
            <div style={{fontWeight:700,fontSize:15,color:CLR.mint,marginBottom:4,fontFamily:DISPLAY}}>{result.n}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
              {[{l:`${result.c} kcal`,c:CLR.amber},{l:`P ${result.p}g`,c:CLR.blue},{l:`G ${result.g}g`,c:CLR.amber},{l:`L ${result.l}g`,c:CLR.violet}].map(s=>(
                <div key={s.l} style={{padding:'3px 9px',background:`${s.c}18`,border:`1px solid ${s.c}40`,borderRadius:999,fontSize:11,color:s.c,fontWeight:700,fontFamily:DISPLAY}}>{s.l}</div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.mid,marginBottom:8,fontWeight:600}}>Ajouter à :</div>
            <div style={{display:'flex',gap:6}}>
              {MEALS.map(m=>(
                <button key={m.id} onClick={()=>addToMeal(m.id)} style={{flex:1,padding:'9px 4px',background:`${m.accent}18`,border:`1px solid ${m.accent}40`,borderRadius:11,color:m.accent,cursor:'pointer',fontSize:10.5,fontFamily:DISPLAY,fontWeight:700}}>{m.short}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes scanLine{0%,100%{top:20%}50%{top:80%}}`}</style>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────
export default function Nutrition(props){
  const { profil, prog, push, repas:todayRepas, setRepas:setTodayRepas, repasLog, setRepasLog, myFoods, setMyFoods, eau, setEau, obj, calObj, pObj, lObj, gObj, totR, FOODS } = props;

  const [repasA,setRepasA]=useState("matin");
  const [search,setSearch]=useState("");
  const [selectedDate,setSelectedDate]=useState(todayKey);
  const [showScanner,setShowScanner]=useState(false);

  const isToday = selectedDate===todayKey();
  const canFwd  = selectedDate<todayKey();

  const displayRepas = useMemo(()=>{
    if(isToday) return todayRepas;
    return repasLog?.[selectedDate] || EMPTY_REPAS;
  },[isToday,todayRepas,repasLog,selectedDate]);

  const setDisplayRepas = useCallback((updater)=>{
    if(isToday){
      setTodayRepas(updater);
    } else {
      setRepasLog(log=>{
        const cur=log?.[selectedDate]||EMPTY_REPAS;
        const next=typeof updater==='function'?updater(cur):updater;
        return {...log,[selectedDate]:next};
      });
    }
  },[isToday,selectedDate,setTodayRepas,setRepasLog]);

  const tot = useMemo(()=>{
    if(isToday) return totR;
    const r=displayRepas;
    const all=[...(r.matin||[]),...(r.midi||[]),...(r.soir||[]),...(r.snack||[])];
    return all.reduce((a,f)=>({cal:a.cal+(f.c||0),p:a.p+(f.p||0),g:a.g+(f.g||0),l:a.l+(f.l||0)}),{cal:0,p:0,g:0,l:0});
  },[isToday,totR,displayRepas]);

  const displayEau = isToday?eau:0;
  const { score, lettre:scoreLettre, color:scoreColor, details:scoreDetails } = computeHealthScore(displayRepas,displayEau,tot,pObj);

  const MEALS=[
    {id:"matin",l:"Petit-déjeuner",short:"Matin",  icon:"sun",    accent:CLR.amber,  accentDk:CLR.amberDk},
    {id:"snack",l:"Collation",     short:"Snack",  icon:"cookie", accent:CLR.coral,  accentDk:CLR.coralDk},
    {id:"midi", l:"Déjeuner",      short:"Midi",   icon:"apple",  accent:CLR.blue,   accentDk:CLR.blueDk},
    {id:"soir", l:"Dîner",         short:"Soir",   icon:"moon",   accent:CLR.indigo, accentDk:CLR.indigoDk},
  ];

  const goDate=(dir)=>{
    if(dir>0&&!canFwd) return;
    if(isToday&&dir<0) setRepasLog(log=>({...log,[todayKey()]:todayRepas}));
    setSelectedDate(prev=>addDays(prev,dir));
  };

  return(
    <div className="anim" style={{position:'relative',paddingBottom:20}}>
      {/* Glow */}
      <div style={{position:'absolute',top:130,left:'50%',transform:'translateX(-50%)',width:320,height:260,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(59,130,246,0.09),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>

      <div style={{position:'relative'}}>
        {/* Header */}
        <div style={{padding:'22px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontFamily:SERIF,fontSize:28,fontWeight:400,letterSpacing:-1,color:C.text,lineHeight:1.1}}>
                Bonjour, <span style={{fontStyle:'italic',color:CLR.amber}}>{profil.prenom||"Hugo"}</span>
              </div>
              <div style={{fontSize:11,color:C.mid,marginTop:2}}>{obj.l}</div>
            </div>
            <div style={{padding:'5px 10px',borderRadius:999,background:C.s1,border:`1px solid ${C.bd}`,display:'flex',alignItems:'center',gap:6,fontSize:10,color:C.mid,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.2}}>
              <span style={{width:4,height:4,borderRadius:'50%',background:CLR.mint,boxShadow:`0 0 5px ${CLR.mint}`}}/>
              CYCLE {prog?.numero||1}
            </div>
          </div>

          {/* Date Nav */}
          <div style={{marginTop:14,display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:C.s1,border:`1px solid ${C.bd}`,borderRadius:14}}>
            <button onClick={()=>goDate(-1)} className="tap" style={{width:30,height:30,borderRadius:9,background:'transparent',border:`1px solid ${C.bd}`,color:C.mid,display:'grid',placeItems:'center',cursor:'pointer',flexShrink:0}}>
              <I name="chevL" size={14} stroke={2.2}/>
            </button>
            <div style={{flex:1,textAlign:'center'}}>
              <div style={{fontFamily:DISPLAY,fontSize:13,fontWeight:700,color:isToday?CLR.blue:C.text,letterSpacing:-0.2}}>{fmtDate(selectedDate)}</div>
              {!isToday&&<div style={{fontSize:10,color:C.dim,marginTop:1}}>{new Date(selectedDate+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>}
            </div>
            <button onClick={()=>goDate(1)} className="tap" style={{width:30,height:30,borderRadius:9,background:'transparent',border:`1px solid ${C.bd}`,color:C.mid,display:'grid',placeItems:'center',cursor:canFwd?'pointer':'default',flexShrink:0,opacity:canFwd?1:0.25}}>
              <I name="chev" size={14} stroke={2.2}/>
            </button>
          </div>
        </div>

        {/* Calorie Ring */}
        <div style={{padding:'18px 20px 0'}}>
          <CalorieRing consumed={tot.cal} goal={calObj}/>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:22,padding:'0 6px'}}>
            <HeroStat value={calObj}                      label="Objectif" accent={CLR.indigo}/>
            <HeroStat value={tot.cal}                     label="Consommé" accent={CLR.blue}/>
            <HeroStat value={Math.max(0,calObj-tot.cal)}  label="Restant"  accent={CLR.amber}/>
          </div>
        </div>

        {/* Macro Cards */}
        <div style={{padding:'22px 20px 0'}}>
          <div style={{display:'flex',gap:8}}>
            <MacroCard label="Protéines" value={tot.p} goal={pObj} color={CLR.blue}   colorDk={CLR.blueDk}/>
            <MacroCard label="Glucides"  value={tot.g} goal={gObj} color={CLR.amber}  colorDk={CLR.amberDk}/>
            <MacroCard label="Lipides"   value={tot.l} goal={lObj} color={CLR.violet} colorDk={CLR.violetDk}/>
          </div>
        </div>

        {/* Meals */}
        <div style={{padding:'24px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:C.text,letterSpacing:-0.6}}>Repas du jour</span>
            <button className="tap" onClick={()=>setShowScanner(true)} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 12px',background:C.s1,border:`1px solid ${C.bd}`,borderRadius:999,color:C.text,fontSize:11,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.2,cursor:'pointer'}}>
              <I name="cam" size={13} stroke={1.8}/> SCANNER
            </button>
          </div>

          <div style={{...card,padding:'0 16px'}}>
            {MEALS.map((m,mi)=>{
              const items=displayRepas[m.id]||[];
              const rTot=items.reduce((a,f)=>({cal:a.cal+(f.c||0),p:a.p+(f.p||0),g:a.g+(f.g||0),l:a.l+(f.l||0)}),{cal:0,p:0,g:0,l:0});
              const isActive=repasA===m.id;
              const last=mi===MEALS.length-1&&!isActive;
              const itemsLabel=items.length>0?items.map(f=>f.n.split('(')[0].trim()).slice(0,3).join(' · '):null;
              return(
                <div key={m.id} style={{borderBottom:last?'none':`1px solid ${C.bd}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,padding:'13px 0'}}>
                    {/* Icon — always filled */}
                    <button className="tap" onClick={()=>setRepasA(isActive?null:m.id)} style={{
                      width:50,height:50,borderRadius:15,flexShrink:0,
                      background:`linear-gradient(145deg,${m.accent},${m.accentDk})`,
                      border:`1.5px solid ${m.accent}70`,
                      display:'grid',placeItems:'center',padding:0,cursor:'pointer',
                      boxShadow:`0 5px 16px ${m.accent}40`,
                      position:'relative',overflow:'hidden',
                    }}>
                      <div style={{position:'absolute',inset:0,background:'radial-gradient(120% 55% at 30% 10%,rgba(255,255,255,0.28),transparent 60%)',pointerEvents:'none'}}/>
                      <I name={m.icon} size={22} stroke={2} color="rgba(255,255,255,0.95)"/>
                    </button>

                    <button className="tap" onClick={()=>setRepasA(isActive?null:m.id)} style={{flex:1,minWidth:0,background:'transparent',border:'none',textAlign:'left',padding:0,cursor:'pointer'}}>
                      <div style={{fontSize:14,fontWeight:600,color:C.text}}>{m.l}</div>
                      <div style={{fontSize:11.5,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:items.length>0?C.mid:C.dim,fontWeight:500}}>
                        {itemsLabel||(items.length===0?"Aucun aliment":`${items.length} aliment${items.length>1?'s':''}`)}
                      </div>
                    </button>

                    {rTot.cal>0&&(
                      <div style={{textAlign:'right',flexShrink:0,display:'flex',alignItems:'baseline',gap:2}}>
                        <span style={{fontFamily:DISPLAY,fontSize:15,fontWeight:700,color:m.accent,...NUM}}>{rTot.cal}</span>
                        <span style={{fontSize:8.5,color:C.dim,fontWeight:700,fontFamily:DISPLAY}}>KCAL</span>
                      </div>
                    )}

                    <button className="tap" onClick={()=>setRepasA(isActive?null:m.id)} style={{width:30,height:30,borderRadius:9,flexShrink:0,background:`${m.accent}18`,border:`1px solid ${m.accent}50`,color:m.accent,display:'grid',placeItems:'center',padding:0,cursor:'pointer',transform:isActive?'rotate(45deg)':'none',transition:'transform .2s'}}>
                      <I name="plus" size={14} stroke={2.4}/>
                    </button>
                  </div>

                  {/* Expanded */}
                  {isActive&&(
                    <div style={{paddingBottom:14}}>
                      {items.map((item,i)=>(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:C.s2,borderRadius:11,marginBottom:6,borderLeft:`3px solid ${m.accent}80`}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{item.n}</div>
                            <div style={{display:'flex',gap:8,marginTop:2}}>
                              <span style={{fontSize:9,color:CLR.blue}}>P {item.p}g</span>
                              <span style={{fontSize:9,color:CLR.amber}}>G {item.g}g</span>
                              <span style={{fontSize:9,color:CLR.violet}}>L {item.l}g</span>
                            </div>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:DISPLAY,...NUM,marginRight:8}}>{item.c} kcal</span>
                          <button onClick={()=>setDisplayRepas(rp=>({...rp,[m.id]:(rp[m.id]||[]).filter((_,j)=>j!==i)}))} style={{background:'transparent',border:'none',color:CLR.coral,cursor:'pointer',display:'grid',placeItems:'center',padding:0,flexShrink:0}}>
                            <I name="x" size={14} stroke={2.2}/>
                          </button>
                        </div>
                      ))}
                      <Inp style={{marginTop:items.length?4:0,marginBottom:6}} placeholder="🔍 Rechercher un aliment…" value={search} onChange={e=>setSearch(e.target.value)}/>
                      {search&&(()=>{
                        const all=[...FOODS,...(myFoods||[])];
                        const filtered=all.filter(f=>f.n.toLowerCase().includes(search.toLowerCase()));
                        return filtered.length>0&&(
                          <div style={{maxHeight:200,overflowY:'auto',borderRadius:12,border:`1px solid ${C.bd}`}}>
                            {filtered.slice(0,12).map((item,i)=>(
                              <div key={i} onClick={()=>{setDisplayRepas(rp=>({...rp,[m.id]:[...(rp[m.id]||[]),item]}));setSearch("");}} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:C.s2,borderBottom:`1px solid ${C.bd}`,cursor:'pointer'}}>
                                <div><div style={{fontSize:12,color:C.text}}>{item.n}</div><div style={{fontSize:10,color:C.dim}}>{item.c} kcal</div></div>
                                <span style={{color:m.accent,fontSize:18}}>+</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      {!search&&(
                        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:4}}>
                          {FOODS.slice(0,8).map((f,i)=>(
                            <button key={i} onClick={()=>setDisplayRepas(rp=>({...rp,[m.id]:[...(rp[m.id]||[]),f]}))} style={{padding:'6px 10px',background:C.s2,border:`1px solid ${C.bd}`,borderRadius:999,cursor:'pointer',fontSize:10.5,color:C.mid,fontFamily:DISPLAY,fontWeight:600}}>
                              {f.n.split('(')[0].trim()} <span style={{color:m.accent}}>{f.c}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hydration — today only */}
        {isToday&&(
          <div style={{padding:'18px 20px 0'}}>
            <div style={{...card,padding:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:11}}>
                  <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(145deg,${CLR.mint},${CLR.mintDk})`,display:'grid',placeItems:'center',boxShadow:`0 4px 10px ${CLR.mint}40`}}>
                    <I name="drop" size={16} stroke={2} color="rgba(255,255,255,0.9)"/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>Hydratation</div>
                    <div style={{fontSize:11,marginTop:2,fontFamily:DISPLAY}}>
                      <span style={{color:C.text,fontWeight:700,...NUM}}>{(eau*0.25).toFixed(2).replace('.',',')} L</span>
                      <span style={{color:C.dim}}> · {Math.round(eau/8*100)}%</span>
                    </div>
                  </div>
                </div>
                <button className="tap" onClick={()=>setEau(e=>Math.min(8,e+1))} style={{padding:'7px 11px',borderRadius:999,background:'transparent',border:`1px solid ${CLR.mint}50`,color:CLR.mint,fontSize:11,fontWeight:700,...NUM,fontFamily:DISPLAY,display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                  <I name="plus" size={12} stroke={2.4}/> 250ML
                </button>
              </div>
              <div style={{display:'flex',gap:5}}>
                {Array.from({length:8}).map((_,i)=>{
                  const on=i<eau;
                  return <button key={i} onClick={()=>setEau(i+1===eau?i:i+1)} className="tap" style={{flex:1,height:24,borderRadius:6,background:on?`linear-gradient(180deg,${CLR.mint},${CLR.mintDk})`:'rgba(255,255,255,0.04)',border:`1px solid ${on?CLR.mint+'50':C.bd}`,padding:0}}/>;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Score Card — filled */}
        <div style={{padding:'16px 20px 0'}}>
          <ScoreCard score={score} scoreLettre={scoreLettre} scoreColor={scoreColor} scoreDetails={scoreDetails}/>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      {showScanner&&(
        <CameraScanner
          onClose={()=>setShowScanner(false)}
          MEALS={MEALS}
          setDisplayRepas={setDisplayRepas}
          push={push}
        />
      )}
    </div>
  );
}
