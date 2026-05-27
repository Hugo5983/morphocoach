import { useState, useMemo } from "react";
import { C } from "../../data/constants.js";
import { Btn, Inp, G2 } from "../../components/ui/index.jsx";
import { computeHealthScore } from "./utils/healthScore.js";

// ─── FONT TOKENS ────────────────────────────────────────────────────────
const SERIF   = "'DM Serif Display','Georgia',serif";
const DISPLAY = "'Outfit','DM Sans',system-ui,sans-serif";
const NUM     = { fontVariantNumeric:'tabular-nums', fontFeatureSettings:'"tnum"' };
const card    = { background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' };
const eyebrowS = { fontSize:10, fontWeight:600, color:C.dim, letterSpacing:'1.2px', textTransform:'uppercase', fontFamily:DISPLAY };

// ─── REAL DISTINCT COLORS (bypassing constants aliasing) ───────────────
const CLR = {
  amber:   '#F59E0B', amberDk: '#D97706',
  coral:   '#F87171', coralDk: '#EF4444',
  blue:    '#3B82F6', blueDk:  '#2563EB',
  indigo:  '#818CF8', indigoDk:'#6366F1',
  violet:  '#A78BFA', violetDk:'#7C3AED',
  mint:    '#34D399', mintDk:  '#059669',
};

// ─── EMPTY REPAS ─────────────────────────────────────────────────────────
const EMPTY_REPAS = { matin: [], midi: [], soir: [], snack: [] };

// ─── DATE HELPERS ────────────────────────────────────────────────────────
function toKey(d) {
  return d.toISOString().split('T')[0];
}
function todayKey() {
  return toKey(new Date());
}
function formatDateLabel(key) {
  const today = todayKey();
  const yesterday = toKey(new Date(Date.now() - 86400000));
  if (key === today) return 'Aujourd\'hui';
  if (key === yesterday) return 'Hier';
  const d = new Date(key + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' });
}
function addDays(key, n) {
  const d = new Date(key + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return toKey(d);
}

// ─── ICONS ───────────────────────────────────────────────────────────────
function I({name,size=18,color='currentColor',stroke=1.6}){
  const p={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:color,strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round'};
  const paths={
    flame:<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5M12 21a6 6 0 0 0 6-6c0-3-2-5-3-6 0 3-2 4-3 4s-3-1-3-4c-1 1-3 3-3 6a6 6 0 0 0 6 6Z"/>,
    drop:<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    scan:<><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></>,
    chev:<path d="m9 6 6 6-6 6"/>,
    chevL:<path d="m15 18-6-6 6-6"/>,
    chevLsm:<path d="m15 18-6-6 6-6"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>,
    coffee:<><path d="M6 9h11v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V9Z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M9 3v3M13 3v3"/></>,
    moon:<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>,
    apple:<><path d="M16 4c-1.5 0-3 1-3 2.5"/><path d="M19 14c0 4-2 7-4 7-1.5 0-2-1-3-1s-1.5 1-3 1c-2 0-4-3-4-7s2-7 4-7c1.5 0 2 1 3 1s1.5-1 3-1c2 0 4 3 4 7Z"/></>,
    cookie:<><path d="M12 3a9 9 0 1 0 9 9c-2 0-3-1-3-3s-1-3-3-3-3-1-3-3Z"/><circle cx="9" cy="11" r=".9"/><circle cx="14" cy="15" r=".9"/><circle cx="8" cy="15" r=".9"/></>,
    x:<path d="M18 6 6 18M6 6l12 12"/>,
    cal:<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    star:<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>,
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
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={over?CLR.coral:CLR.blue}/>
            <stop offset="100%" stopColor={over?CLR.coralDk:CLR.indigo}/>
          </linearGradient>
        </defs>
        <g transform="rotate(-90 100 100)">
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx="100" cy="100" r={r} fill="none"
            stroke="url(#ringGrad)" strokeWidth="8" strokeLinecap="round"
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

// ─── MACRO CARD — distinct colors per macro ──────────────────────────────
function MacroCard({label,value,goal,color,colorDk,bgColor}){
  const pct=Math.round(Math.min(value/(goal||1),1)*100);
  return(
    <div style={{flex:1,padding:'14px 12px',borderRadius:14,background:`${bgColor}10`,border:`1px solid ${color}30`,boxShadow:'0 1px 3px rgba(0,0,0,0.20)',display:'flex',flexDirection:'column',gap:8,position:'relative',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{width:6,height:6,borderRadius:'50%',background:color,boxShadow:`0 0 6px ${color}`}}/>
        <span style={{...eyebrowS,color:color,fontSize:8.5}}>{label}</span>
      </div>
      <div style={{display:'flex',alignItems:'baseline',gap:3}}>
        <span style={{fontFamily:DISPLAY,fontSize:22,fontWeight:700,color:C.text,letterSpacing:-0.5,...NUM}}>{value}</span>
        <span style={{fontSize:10.5,color:C.dim,fontWeight:500,...NUM}}>/{goal}g</span>
      </div>
      <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:4,overflow:'hidden'}}>
        <div style={{height:'100%',width:pct+'%',background:`linear-gradient(90deg,${color},${colorDk})`,borderRadius:4,boxShadow:`0 0 8px ${color}88`,transition:'width .8s ease'}}/>
      </div>
      <span style={{fontSize:10,color:color,fontWeight:700,...NUM,letterSpacing:0.4,fontFamily:DISPLAY}}>{pct}%</span>
    </div>
  );
}

// ─── SCORE CARD (repositioned) ────────────────────────────────────────────
function ScoreCard({score,scoreLettre,scoreColor,scoreDetails}){
  const [open,setOpen]=useState(false);
  return(
    <div style={{...card,overflow:'hidden'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}}>
        <div style={{width:42,height:42,borderRadius:13,background:`linear-gradient(145deg,${scoreColor}22,${scoreColor}08)`,border:`1px solid ${scoreColor}40`,display:'grid',placeItems:'center',flexShrink:0}}>
          <span style={{fontFamily:SERIF,fontSize:22,fontWeight:400,color:scoreColor,lineHeight:1}}>{scoreLettre}</span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:DISPLAY,fontSize:13,fontWeight:700,color:C.text,letterSpacing:-0.1}}>Score nutritionnel</div>
          <div style={{marginTop:3,height:3,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden',width:120}}>
            <div style={{height:'100%',width:`${score}%`,background:`linear-gradient(90deg,${CLR.coral},${CLR.amber},${CLR.mint})`,borderRadius:3,transition:'width .8s'}}/>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:DISPLAY,fontSize:18,fontWeight:700,color:scoreColor,...NUM}}>{score}</div>
          <div style={{fontSize:9,color:C.dim,letterSpacing:0.5,fontFamily:DISPLAY}}>/ 100</div>
        </div>
        <div style={{color:C.dim,transform:open?'rotate(90deg)':'none',transition:'transform .2s'}}><I name="chev" size={14} stroke={2}/></div>
      </div>
      {open&&(
        <div style={{padding:'0 16px 14px',borderTop:`1px solid ${C.bd}`}}>
          <div style={{paddingTop:12}}>{scoreDetails.map((d,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:i<scoreDetails.length-1?`1px solid ${C.bd}`:'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:16}}>{d.icon}</span>
                <span style={{fontSize:12,color:C.text}}>{d.l}</span>
              </div>
              <div style={{width:20,height:20,borderRadius:'50%',background:d.ok?`${CLR.mint}22`:`${CLR.coral}22`,border:`1px solid ${d.ok?CLR.mint:CLR.coral}55`,display:'grid',placeItems:'center',fontSize:10,color:d.ok?CLR.mint:CLR.coral}}>{d.ok?'✓':'✕'}</div>
            </div>
          ))}</div>
          <div style={{marginTop:10,padding:'10px 12px',background:C.s2,borderRadius:12,fontSize:11,color:C.mid,lineHeight:1.6}}>
            💡 {score>=85?"Excellente journée nutritionnelle ! Continuez comme ça.":score>=70?"Bonne journée, quelques petits ajustements possibles.":score>=55?"Journée correcte. Pensez à l'hydratation et la diversité.":score>=40?"Des efforts à faire sur la qualité alimentaire.":"Journée difficile. Revenez aux bases demain."}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NUTRITION SCREEN ────────────────────────────────────────────────────
export default function Nutrition(props){
  const { profil, prog, push, repas: todayRepas, setRepas: setTodayRepas, repasLog, setRepasLog, myFoods, setMyFoods, eau, setEau, scanRes, setScanRes, obj, calObj, pObj, lObj, gObj, totR, handleScan, C: _C, FOODS } = props;

  const [nView,setNView]=useState("journal");
  const [repasA,setRepasA]=useState("matin");
  const [search,setSearch]=useState("");
  const [newFood,setNewFood]=useState({nom:"",cal:"",p:"",g:"",l:""});
  const [scanCode,setScan]=useState("");
  const [selectedDate,setSelectedDate]=useState(todayKey);

  const isToday = selectedDate === todayKey();
  const canGoForward = selectedDate < todayKey();

  // Repas for selected date
  const displayRepas = useMemo(()=>{
    if(isToday) return todayRepas;
    return repasLog[selectedDate] || EMPTY_REPAS;
  },[isToday,todayRepas,repasLog,selectedDate]);

  const setDisplayRepas = (updater) => {
    if(isToday){
      setTodayRepas(updater);
    } else {
      setRepasLog(log => {
        const cur = log[selectedDate] || EMPTY_REPAS;
        const next = typeof updater === 'function' ? updater(cur) : updater;
        return {...log, [selectedDate]: next};
      });
    }
  };

  // Totals for displayed repas
  const tot = useMemo(()=>{
    if(isToday) return totR;
    const r = displayRepas;
    const all = [...(r.matin||[]),...(r.midi||[]),...(r.soir||[]),...(r.snack||[])];
    return all.reduce((a,f)=>({cal:a.cal+(f.c||0),p:a.p+(f.p||0),g:a.g+(f.g||0),l:a.l+(f.l||0)}),{cal:0,p:0,g:0,l:0});
  },[isToday,totR,displayRepas]);

  const displayEau = isToday ? eau : 0;
  const { score, lettre:scoreLettre, color:scoreColor, details:scoreDetails } = computeHealthScore(displayRepas,displayEau,tot,pObj);

  // Meal config — real vivid colors
  const MEALS=[
    {id:"matin",l:"Petit-déjeuner",icon:"sun",    accent:CLR.amber,   accentDk:CLR.amberDk, bg:'#F59E0B'},
    {id:"snack",l:"Collation",     icon:"cookie", accent:CLR.coral,   accentDk:CLR.coralDk, bg:'#F87171'},
    {id:"midi", l:"Déjeuner",      icon:"apple",  accent:CLR.blue,    accentDk:CLR.blueDk,  bg:'#3B82F6'},
    {id:"soir", l:"Dîner",         icon:"moon",   accent:CLR.indigo,  accentDk:CLR.indigoDk,bg:'#818CF8'},
  ];

  // Navigate date
  const goDate = (dir) => {
    const next = addDays(selectedDate, dir);
    if(next > todayKey()) return;
    // Save today's repas to log before leaving
    if(isToday && dir < 0){
      setRepasLog(log => ({...log, [todayKey()]: todayRepas}));
    }
    setSelectedDate(next);
  };

  return(
    <div className="anim" style={{position:'relative',paddingBottom:20}}>
      {/* Atmospheric glows */}
      <div style={{position:'absolute',top:130,left:'50%',transform:'translateX(-50%)',width:340,height:280,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(77,139,255,0.10),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:240,right:-50,width:240,height:240,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(245,158,11,0.07),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>

      <div style={{position:'relative'}}>
        {/* ── Header ── */}
        <div style={{padding:'22px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontFamily:SERIF,fontSize:28,fontWeight:400,letterSpacing:-1.0,color:C.text,lineHeight:1.05}}>
              Bonjour, <span style={{fontStyle:'italic',color:CLR.amber}}>{profil.prenom||"Hugo"}</span>
            </div>
            <div style={{padding:'6px 10px',borderRadius:999,background:C.s1,border:`1px solid ${C.bd}`,display:'flex',alignItems:'center',gap:6,fontSize:10.5,color:C.mid,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.2}}>
              <span style={{width:5,height:5,borderRadius:'50%',background:CLR.mint,boxShadow:`0 0 6px ${CLR.mint}`}}/>
              CYCLE {prog?.numero||1}
            </div>
          </div>
          <div style={{fontSize:11,color:C.mid,marginTop:2}}>{obj.l}</div>

          {/* ── Date Navigation ── */}
          <div style={{marginTop:14,display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:C.s1,border:`1px solid ${C.bd}`,borderRadius:14}}>
            <button onClick={()=>goDate(-1)} className="tap" style={{width:30,height:30,borderRadius:9,background:'transparent',border:`1px solid ${C.bd}`,color:C.mid,display:'grid',placeItems:'center',cursor:'pointer',flexShrink:0}}>
              <I name="chevL" size={14} stroke={2.2}/>
            </button>
            <div style={{flex:1,textAlign:'center'}}>
              <div style={{fontFamily:DISPLAY,fontSize:13,fontWeight:700,color:isToday?CLR.blue:C.text,letterSpacing:-0.2}}>
                {formatDateLabel(selectedDate)}
              </div>
              {!isToday&&<div style={{fontSize:10,color:C.dim,marginTop:1}}>{new Date(selectedDate+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>}
            </div>
            <button onClick={()=>goDate(1)} className="tap" style={{width:30,height:30,borderRadius:9,background:'transparent',border:`1px solid ${C.bd}`,color:canGoForward?C.mid:'rgba(255,255,255,0.08)',display:'grid',placeItems:'center',cursor:canGoForward?'pointer':'default',flexShrink:0,opacity:canGoForward?1:0.3}}>
              <I name="chev" size={14} stroke={2.2}/>
            </button>
          </div>

          {/* Segmented nav */}
          <div style={{position:'relative',marginTop:14,display:'flex',padding:3,borderRadius:12,background:'rgba(7,10,20,0.7)',border:`1px solid ${C.bd}`}}>
            {[{id:"journal",l:"Journal"},{id:"scanner",l:"Scanner"},{id:"aliments",l:"Aliments"}].map(s=>{
              const on=nView===s.id;
              return(
                <button key={s.id} onClick={()=>setNView(s.id)} style={{position:'relative',zIndex:1,flex:1,padding:'8px 0',borderRadius:9,background:on?C.s2:'transparent',border:on?`1px solid ${C.bdHi}`:'1px solid transparent',color:on?C.text:C.dim,fontSize:12,fontWeight:700,letterSpacing:0.2,fontFamily:DISPLAY,cursor:'pointer',transition:'all .25s ease',boxShadow:on?'0 2px 6px rgba(0,0,0,0.25)':'none'}}>{s.l}</button>
              );
            })}
          </div>
        </div>

        {/* ════ JOURNAL ════ */}
        {nView==="journal"&&(
          <>
            {/* Hero ring */}
            <div style={{padding:'18px 20px 0'}}>
              <CalorieRing consumed={tot.cal} goal={calObj}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:22,padding:'0 6px'}}>
                <HeroStat value={calObj} label="Objectif" accent={CLR.indigo}/>
                <HeroStat value={tot.cal} label="Consommé" accent={CLR.blue}/>
                <HeroStat value={Math.max(0,calObj-tot.cal)} label="Restant" accent={CLR.amber}/>
              </div>
            </div>

            {/* Macro cards — distinct colors */}
            <div style={{padding:'24px 20px 0'}}>
              <div style={{display:'flex',gap:10}}>
                <MacroCard label="Protéines" value={tot.p} goal={pObj}  color={CLR.blue}   colorDk={CLR.blueDk}   bgColor={CLR.blue}/>
                <MacroCard label="Glucides"  value={tot.g} goal={gObj}  color={CLR.amber}  colorDk={CLR.amberDk}  bgColor={CLR.amber}/>
                <MacroCard label="Lipides"   value={tot.l} goal={lObj}  color={CLR.violet} colorDk={CLR.violetDk} bgColor={CLR.violet}/>
              </div>
            </div>

            {/* Meals */}
            <div style={{padding:'26px 20px 0'}}>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:C.text,letterSpacing:-0.6}}>Repas du jour</span>
                <button className="tap" onClick={()=>setNView("scanner")} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 11px',background:C.s1,border:`1px solid ${C.bd}`,borderRadius:999,color:C.text,fontSize:11,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.2,cursor:'pointer'}}>
                  <I name="scan" size={12} stroke={1.8}/> SCANNER
                </button>
              </div>
              <div style={{...card,padding:'0 16px'}}>
                {MEALS.map((m,mi)=>{
                  const items=displayRepas[m.id]||[];
                  const rTot=items.reduce((a,f)=>({cal:a.cal+f.c,p:a.p+f.p,g:a.g+f.g,l:a.l+f.l}),{cal:0,p:0,g:0,l:0});
                  const filled=rTot.cal>0;
                  const isActive=repasA===m.id;
                  const last=mi===MEALS.length-1&&!isActive;
                  const itemsLabel=items.length>0?items.map(f=>f.n.split('(')[0].trim()).slice(0,3).join(' · '):null;
                  return(
                    <div key={m.id} style={{borderBottom:last?'none':`1px solid ${C.bd}`}}>
                      {/* Meal row */}
                      <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 0'}}>
                        <button className="tap" onClick={()=>setRepasA(isActive?null:m.id)} style={{
                          width:52,height:52,borderRadius:16,flexShrink:0,
                          background:filled
                            ?`linear-gradient(145deg,${m.accent} 0%,${m.accentDk} 100%)`
                            :`linear-gradient(145deg,${m.accent}25 0%,${m.accent}08 100%)`,
                          border:filled?`1.5px solid ${m.accent}80`:`1.5px dashed ${m.accent}50`,
                          display:'grid',placeItems:'center',padding:0,position:'relative',overflow:'hidden',
                          color:filled?'#fff':m.accent,
                          boxShadow:filled?`0 6px 18px ${m.accent}45, inset 0 1px 0 rgba(255,255,255,0.25)`:'none',
                          cursor:'pointer',
                        }}>
                          {filled&&<div style={{position:'absolute',inset:0,background:'radial-gradient(120% 60% at 30% 10%,rgba(255,255,255,0.30),transparent 60%)',pointerEvents:'none'}}/>}
                          <I name={m.icon} size={22} stroke={2} color={filled?'#fff':m.accent}/>
                        </button>
                        <button className="tap" onClick={()=>setRepasA(isActive?null:m.id)} style={{flex:1,minWidth:0,background:'transparent',border:'none',textAlign:'left',padding:0,cursor:'pointer'}}>
                          <div style={{fontSize:14,fontWeight:600,color:C.text,letterSpacing:-0.1}}>{m.l}</div>
                          <div style={{fontSize:12,marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:filled?C.mid:C.dim,fontWeight:500}}>
                            {itemsLabel||(items.length===0?"Aucun aliment":`${items.length} aliment${items.length>1?'s':''}`)}
                          </div>
                        </button>
                        {filled&&(
                          <div style={{textAlign:'right',flexShrink:0,display:'flex',alignItems:'baseline',gap:3}}>
                            <span style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:m.accent,...NUM,letterSpacing:-0.3}}>{rTot.cal}</span>
                            <span style={{fontSize:9,color:C.dim,fontWeight:700,fontFamily:DISPLAY}}>KCAL</span>
                          </div>
                        )}
                        <button className="tap" onClick={()=>setRepasA(isActive?null:m.id)} style={{width:30,height:30,borderRadius:9,flexShrink:0,background:filled?'transparent':`${m.accent}18`,border:`1px solid ${filled?C.bd:m.accent+'50'}`,color:filled?C.mid:m.accent,display:'grid',placeItems:'center',padding:0,cursor:'pointer',transform:isActive?'rotate(45deg)':'none',transition:'transform .2s'}}>
                          <I name="plus" size={14} stroke={2.4}/>
                        </button>
                      </div>
                      {/* Expanded editor */}
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
                              <span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:DISPLAY,...NUM}}>{item.c}</span>
                              <button onClick={()=>setDisplayRepas(rp=>({...rp,[m.id]:rp[m.id].filter((_,j)=>j!==i)}))} style={{background:'transparent',border:'none',color:CLR.coral,cursor:'pointer',padding:'0 0 0 8px',display:'grid',placeItems:'center'}}>
                                <I name="x" size={14} stroke={2.2}/>
                              </button>
                            </div>
                          ))}
                          <Inp style={{marginTop:items.length?4:0,marginBottom:6}} placeholder="🔍 Rechercher un aliment…" value={search} onChange={e=>setSearch(e.target.value)}/>
                          {search&&(()=>{
                            const all=[...FOODS,...myFoods];
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
              <div style={{padding:'22px 20px 0'}}>
                <div style={{...card,padding:16}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:13}}>
                    <div style={{display:'flex',alignItems:'center',gap:11}}>
                      <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(145deg,${CLR.mint},${CLR.mintDk})`,color:'#0B1F18',display:'grid',placeItems:'center',boxShadow:`0 4px 10px ${CLR.mint}40, inset 0 1px 0 rgba(255,255,255,0.3)`}}>
                        <I name="drop" size={16} stroke={2}/>
                      </div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:C.text}}>Hydratation</div>
                        <div style={{fontSize:11.5,marginTop:2,fontWeight:500,fontFamily:DISPLAY}}>
                          <span style={{color:C.text,fontWeight:700,...NUM}}>{(eau*0.25).toFixed(2).replace('.',',')} L</span>
                          <span style={{color:C.dim}}> · {Math.round(eau/8*100)}%</span>
                        </div>
                      </div>
                    </div>
                    <button className="tap" onClick={()=>setEau(e=>Math.min(8,e+1))} style={{padding:'7px 11px',borderRadius:999,background:'transparent',border:`1px solid ${CLR.mint}50`,color:CLR.mint,fontSize:11.5,fontWeight:700,...NUM,fontFamily:DISPLAY,display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                      <I name="plus" size={12} stroke={2.4}/> 250ML
                    </button>
                  </div>
                  <div style={{display:'flex',gap:5}}>
                    {Array.from({length:8}).map((_,i)=>{
                      const on=i<eau;
                      return <button key={i} onClick={()=>setEau(i+1===eau?i:i+1)} className="tap" style={{flex:1,height:26,borderRadius:6,background:on?`linear-gradient(180deg,${CLR.mint},${CLR.mintDk})`:'rgba(190,180,255,0.05)',border:`1px solid ${on?CLR.mint+'60':C.bd}`,boxShadow:on?`0 0 8px ${CLR.mint}55, inset 0 1px 0 rgba(255,255,255,0.3)`:'none',padding:0}}/>;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Score card — repositioned at bottom */}
            <div style={{padding:'16px 20px 0'}}>
              <ScoreCard score={score} scoreLettre={scoreLettre} scoreColor={scoreColor} scoreDetails={scoreDetails}/>
            </div>
          </>
        )}

        {/* ════ SCANNER ════ */}
        {nView==="scanner"&&(
          <div style={{padding:'18px 20px 0'}}>
            <div style={{...card,padding:18}}>
              <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:14}}>
                <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(145deg,${CLR.blue},${CLR.blueDk})`,color:'#141A2E',display:'grid',placeItems:'center',boxShadow:`0 4px 10px ${CLR.blue}40, inset 0 1px 0 rgba(255,255,255,0.3)`}}>
                  <I name="scan" size={18} stroke={2}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Scanner un produit</div>
                  <div style={{fontSize:10.5,color:C.mid,marginTop:1}}>Open Food Facts · 3M+ produits</div>
                </div>
              </div>
              <Inp placeholder="Code-barres EAN (ex: 3017620422003)" inputMode="numeric" value={scanCode} onChange={e=>{setScan(e.target.value);if(e.target.value.length>=8)handleScan(e.target.value);}}/>
              {scanRes&&!scanRes.error&&(
                <div style={{padding:14,background:`${CLR.mint}14`,border:`1px solid ${CLR.mint}30`,borderRadius:14,marginTop:8}}>
                  <div style={{fontWeight:700,fontSize:14,color:CLR.mint,marginBottom:10,fontFamily:DISPLAY}}>{scanRes.n}</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
                    {[{l:`${scanRes.c} kcal`,c:CLR.amber},{l:`P ${scanRes.p}g`,c:CLR.blue},{l:`G ${scanRes.g}g`,c:CLR.amber},{l:`L ${scanRes.l}g`,c:CLR.violet}].map(s=>(
                      <div key={s.l} style={{padding:'4px 10px',background:`${s.c}1e`,border:`1px solid ${s.c}40`,borderRadius:999,fontSize:11,color:s.c,fontWeight:700,fontFamily:DISPLAY}}>{s.l}</div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {MEALS.map(m=>(
                      <button key={m.id} className="tap" onClick={()=>{setDisplayRepas(rp=>({...rp,[m.id]:[...(rp[m.id]||[]),scanRes]}));setScanRes(null);setScan("");setNView("journal");push("✅","Ajouté !",`${scanRes.n} ajouté au ${m.l.toLowerCase()}.`);}} style={{flex:1,padding:'9px 4px',background:C.s2,border:`1px solid ${m.accent}40`,borderRadius:11,color:m.accent,cursor:'pointer',fontSize:11,fontFamily:DISPLAY,fontWeight:700}}>{m.l.split('-')[0].trim()}</button>
                    ))}
                  </div>
                  <button onClick={()=>{setMyFoods(f=>[...f,{...scanRes,id:Date.now()}]);setScanRes(null);setScan("");}} style={{marginTop:8,width:'100%',padding:'9px',background:'transparent',border:`1px solid ${C.bd}`,borderRadius:11,color:C.mid,cursor:'pointer',fontSize:11,fontFamily:DISPLAY,fontWeight:600}}>💾 Sauvegarder dans ma bibliothèque</button>
                </div>
              )}
              {scanRes?.error&&<div style={{padding:'10px 12px',background:`${CLR.coral}14`,border:`1px solid ${CLR.coral}30`,borderRadius:12,fontSize:11,color:CLR.coral,marginTop:8}}>Produit non trouvé. Ajoutez-le manuellement.</div>}
            </div>
          </div>
        )}

        {/* ════ ALIMENTS ════ */}
        {nView==="aliments"&&(
          <div style={{padding:'18px 20px 0'}}>
            <div style={{...card,padding:18,marginBottom:12}}>
              <div style={{...eyebrowS,marginBottom:12}}>Ajouter un aliment</div>
              <Inp placeholder="Nom (ex: Mon pain maison 100g)" value={newFood.nom} onChange={e=>setNewFood({...newFood,nom:e.target.value})}/>
              <G2><Inp type="number" placeholder="Calories" style={{marginBottom:0}} value={newFood.cal} onChange={e=>setNewFood({...newFood,cal:e.target.value})}/><Inp type="number" placeholder="Protéines (g)" style={{marginBottom:0}} value={newFood.p} onChange={e=>setNewFood({...newFood,p:e.target.value})}/></G2>
              <G2 style={{marginTop:6}}><Inp type="number" placeholder="Glucides (g)" style={{marginBottom:0}} value={newFood.g} onChange={e=>setNewFood({...newFood,g:e.target.value})}/><Inp type="number" placeholder="Lipides (g)" style={{marginBottom:0}} value={newFood.l} onChange={e=>setNewFood({...newFood,l:e.target.value})}/></G2>
              <Btn disabled={!newFood.nom||!newFood.cal} onClick={()=>{setMyFoods(f=>[...f,{id:Date.now(),n:newFood.nom,c:parseInt(newFood.cal)||0,p:parseInt(newFood.p)||0,g:parseInt(newFood.g)||0,l:parseInt(newFood.l)||0,cat:"Personnel"}]);setNewFood({nom:"",cal:"",p:"",g:"",l:""});push("✅","Aliment ajouté !","Disponible dans votre bibliothèque.");}} style={{marginTop:10}}>+ Ajouter</Btn>
            </div>
            {myFoods.length>0&&(
              <div style={{...card,padding:18}}>
                <div style={{...eyebrowS,marginBottom:10}}>Mes aliments ({myFoods.length})</div>
                {myFoods.map((f,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<myFoods.length-1?`1px solid ${C.bd}`:'none'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{f.n}</div>
                      <div style={{display:'flex',gap:8,marginTop:2}}>
                        <span style={{fontSize:9,color:CLR.amber}}>{f.c}kcal</span>
                        <span style={{fontSize:9,color:CLR.blue}}>P {f.p}g</span>
                        <span style={{fontSize:9,color:CLR.amber}}>G {f.g}g</span>
                        <span style={{fontSize:9,color:CLR.violet}}>L {f.l}g</span>
                      </div>
                    </div>
                    <button onClick={()=>setDisplayRepas(rp=>({...rp,[repasA]:[...(rp[repasA]||[]),f]}))} style={{width:30,height:30,borderRadius:9,background:`${CLR.blue}18`,border:`1px solid ${CLR.blue}50`,color:CLR.blue,cursor:'pointer',display:'grid',placeItems:'center'}}>
                      <I name="plus" size={14} stroke={2.4}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
