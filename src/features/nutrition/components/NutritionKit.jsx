/**
 * NutritionKit.jsx — Alias, icônes & composants visuels de la page Nutrition.
 * Extrait de NutritionPage.jsx sans aucune modification de code.
 */

import { C, FONT, SERIF, NUM } from "../../../data/constants.js";


// Alias locaux → tokens centraux
const DISPLAY = FONT;
const eyebrowS = { fontSize:10, fontWeight:600, color:C.dim, letterSpacing:'1.2px', textTransform:'uppercase', fontFamily:FONT };

// ─── Icônes ──────────────────────────────────────────────────────────────────
function I({name,size=18,color='currentColor',stroke=1.6}){
  const p={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:color,strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round'};
  const paths={
    flame:<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5M12 21a6 6 0 0 0 6-6c0-3-2-5-3-6 0 3-2 4-3 4s-3-1-3-4c-1 1-3 3-3 6a6 6 0 0 0 6 6Z"/>,
    drop:<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    scan:<><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></>,
    chev:<path d="m9 6 6 6-6 6"/>,
    chevL:<path d="m15 18-6-6 6-6"/>,
    chevR:<path d="m9 6 6 6-6 6"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>,
    coffee:<><path d="M6 9h11v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V9Z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M9 3v3M13 3v3"/></>,
    moon:<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>,
    apple:<><path d="M16 4c-1.5 0-3 1-3 2.5"/><path d="M19 14c0 4-2 7-4 7-1.5 0-2-1-3-1s-1.5 1-3 1c-2 0-4-3-4-7s2-7 4-7c1.5 0 2 1 3 1s1.5-1 3-1c2 0 4 3 4 7Z"/></>,
    cookie:<><path d="M12 3a9 9 0 1 0 9 9c-2 0-3-1-3-3s-1-3-3-3-3-1-3-3Z"/><circle cx="9" cy="11" r=".9"/><circle cx="14" cy="15" r=".9"/><circle cx="8" cy="15" r=".9"/></>,
    x:<path d="M18 6 6 18M6 6l12 12"/>,
    book:<><path d="M4 4a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V4Z"/><path d="M4 20a2 2 0 0 1 2-2h13"/></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ─── Anneau calories ─────────────────────────────────────────────────────────
function CalorieRing({consumed,goal}){
  const remaining=Math.max(goal-consumed,0);
  const pct=Math.min(consumed/(goal||1),1);
  const over=consumed>goal;
  const r=82,circ=2*Math.PI*r;
  return(
    <div style={{position:'relative',width:200,height:200,margin:'0 auto'}}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <g transform="rotate(-90 100 100)">
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8"/>
          <circle cx="100" cy="100" r={r} fill="none"
            stroke={over?C.red:C.accent} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
            style={{transition:'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)'}}/>
        </g>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{...eyebrowS,letterSpacing:'1px'}}>{over?'Dépassé':'Restant'}</div>
        <div style={{fontFamily:SERIF,fontSize:44,fontWeight:400,letterSpacing:-2,color:over?C.red:C.text,lineHeight:.95,marginTop:8,...NUM}}>
          {(over?consumed-goal:remaining).toLocaleString('fr-FR').replace(',',' ')}
        </div>
        <div style={{fontSize:13,color:C.mid,fontWeight:500,marginTop:8,letterSpacing:0.2,fontFamily:DISPLAY}}>kcal</div>
      </div>
    </div>
  );
}

function HeroStat({value,label,accent}){
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flex:1}}>
      <span style={{width:22,height:2,background:accent,borderRadius:2}}/>
      <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:C.text,letterSpacing:-0.3,...NUM}}>{(value||0).toLocaleString('fr-FR').replace(',',' ')}</span>
      <span style={{...eyebrowS}}>{label}</span>
    </div>
  );
}

// ─── MacroCard ────────────────────────────────────────────────────────────────
function MacroCard({label,value,goal,color,colorDk}){
  const pct=Math.round(Math.min(value/(goal||1),1)*100);
  const letter=label[0];
  return(
    <div style={{flex:1,padding:'16px 12px',borderRadius:16,
      background:`linear-gradient(145deg, ${color}, ${colorDk})`,
      boxShadow:`0 6px 18px ${colorDk}55`,
      display:'flex',flexDirection:'column',gap:8}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{width:24,height:24,borderRadius:8,flexShrink:0,
          background:'rgba(0,0,0,0.18)',
          color:'#FFF',fontSize:13,fontWeight:700,fontFamily:DISPLAY,
          display:'grid',placeItems:'center'}}>{letter}</span>
        <span style={{fontSize:8.5,fontWeight:700,
          color:'rgba(255,255,255,0.88)',letterSpacing:'1.2px',
          textTransform:'uppercase',fontFamily:DISPLAY}}>{label}</span>
      </div>
      <div style={{display:'flex',alignItems:'baseline',gap:4}}>
        <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,
          color:'white',letterSpacing:-0.5,...NUM}}>{value}</span>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.72)',
          fontWeight:500,...NUM}}>/{goal}g</span>
      </div>
      <div style={{height:5,background:'rgba(255,255,255,0.25)',
        borderRadius:3,overflow:'hidden'}}>
        <div style={{height:'100%',width:pct+'%',background:'white',
          borderRadius:3,transition:'width .8s ease',
          boxShadow:'0 0 8px rgba(255,255,255,0.5)'}}/>
      </div>
      <span style={{fontSize:11,color:'rgba(255,255,255,0.92)',
        fontWeight:700,...NUM,letterSpacing:0.3,fontFamily:DISPLAY}}>{pct}%</span>
    </div>
  );
}

// ─── Config repas ─────────────────────────────────────────────────────────────
const MEALS=[
  {id:"matin", l:"Petit-déjeuner", icon:"sun",    accent:"#F59E0B", accentDk:"#D97706", dark:"#1A1308"},
  {id:"snack", l:"Collation",      icon:"coffee",  accent:"#F87171", accentDk:C.red, dark:"#1F0A0A"},
  {id:"midi",  l:"Déjeuner",       icon:"apple",   accent:C.accent, accentDk:C.accentDk, dark:"#0A1628"},
  {id:"soir",  l:"Dîner",          icon:"moon",    accent:"#818CF8", accentDk:"#6366F1", dark:"#0D0A28"},
];

// ─── Formatage date ───────────────────────────────────────────────────────────
function formatDate(offset){
  const d=new Date();
  d.setDate(d.getDate()+offset);
  if(offset===0) return "Aujourd'hui";
  if(offset===-1) return "Hier";
  if(offset===-2) return "Avant-hier";
  return d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
}

// ─── NUTRITION ────────────────────────────────────────────────────────────────

export { DISPLAY, eyebrowS, I, CalorieRing, HeroStat, MacroCard, MEALS, formatDate };
