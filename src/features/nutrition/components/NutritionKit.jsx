/**
 * NutritionKit.jsx — Alias, icônes & composants visuels de la page Nutrition.
 * Extrait de NutritionPage.jsx sans aucune modification de code.
 */

import { C, FONT, SERIF, NUM } from"../../../data/constants.js";
import { Ico as UIco } from"../../../components/ui/Icon.jsx";


// Alias locaux → tokens centraux
const DISPLAY = FONT;
const eyebrowS = { fontSize:10, fontWeight:600, color:C.dim, letterSpacing:"0.1em", textTransform:'uppercase', fontFamily:FONT };

// ─── Icônes ──────────────────────────────────────────────────────────────────
function I({name,size=18,color="currentColor",stroke=1.8,...r}){
  return <UIco name={name} size={size} color={color} stroke={stroke} {...r}/>;
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
        <div style={{...eyebrowS,letterSpacing:"0.1em"}}>{over?'Dépassé':'Restant'}</div>
        <div style={{fontFamily:SERIF,fontSize:44,fontWeight:400,letterSpacing:-1,color:over?C.red:C.text,lineHeight:1,marginTop:8,...NUM}}>
          {(over?consumed-goal:remaining).toLocaleString('fr-FR').replace(',','')}
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
      <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:C.text,letterSpacing:-0.3,...NUM}}>{(value||0).toLocaleString('fr-FR').replace(',','')}</span>
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
          color:'rgba(255,255,255,0.85)',letterSpacing:"0.1em",
          textTransform:'uppercase',fontFamily:DISPLAY}}>{label}</span>
      </div>
      <div style={{display:'flex',alignItems:'baseline',gap:4}}>
        <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,
          color:'white',letterSpacing:-0.5,...NUM}}>{value}</span>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.65)',
          fontWeight:500,...NUM}}>/{goal}g</span>
      </div>
      <div style={{height:5,background:'rgba(255,255,255,0.25)',
        borderRadius:3,overflow:'hidden'}}>
        <div style={{height:'100%',width:pct+'%',background:'white',
          borderRadius:3,transition:'width .8s ease',
          boxShadow:'0 0 8px rgba(255,255,255,0.5)'}}/>
      </div>
      <span style={{fontSize:11,color:'rgba(255,255,255,0.85)',
        fontWeight:700,...NUM,letterSpacing:0.2,fontFamily:DISPLAY}}>{pct}%</span>
    </div>
);
}

// ─── Config repas ─────────────────────────────────────────────────────────────
const MEALS=[
  {id:"matin", l:"Petit-déjeuner", icon:"coffee",    accent:"#F59E0B", accentDk:"#F59E0B", dark:"#101318"},
  {id:"snack", l:"Collation",      icon:"apple",  accent:"#E5484D", accentDk:C.red, dark:"#101318"},
  {id:"midi",  l:"Déjeuner",       icon:"bowl",   accent:C.accent, accentDk:C.accentDk, dark:"#101318"},
  {id:"soir",  l:"Dîner",          icon:"cloche",    accent:"#9DB0FF", accentDk:"#3C5BFF", dark:"#101318"},
];

// ─── Formatage date ───────────────────────────────────────────────────────────
function formatDate(offset){
  const d=new Date();
  d.setDate(d.getDate()+offset);
  if(offset===0) return"Aujourd'hui";
  if(offset===-1) return"Hier";
  if(offset===-2) return"Avant-hier";
  return d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
}

// ─── NUTRITION ────────────────────────────────────────────────────────────────

export { DISPLAY, eyebrowS, I, CalorieRing, HeroStat, MacroCard, MEALS, formatDate };
