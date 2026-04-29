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
const EX={
"Pectoraux":[
{n:"Développé haltères incliné 30°",s:"4",r:"8-10",rest:"90s",ch:"60-70%",cat:"principal",
morpho:"🦴 Humérus longs : haltères indispensables — la barre impose une trajectoire fixe incompatible avec les bras longs et crée un conflit sous-acromial. Les haltères permettent une rotation naturelle du poignet tout au long du mouvement.\n🦴 Humérus courts : haltères ou barre possible. La barre est plus stable pour charger lourd.\n🫁 Cage plate/étroite : préférer l'incliné à 30-45° pour cibler les fibres claviculaires et donner de l'épaisseur visuelle au haut du torse.\n🫁 Cage large/bombée : le plat ou le décliné conviendront mieux pour le volume global.\n📐 Clavicules larges : excellent exercice — le levier naturel favorise l'amplitude et le recrutement musculaire.\n📐 Clavicules courtes : réduire légèrement l'écartement pour plus d'activation.",
tips:["Omoplates pressées et rétractées sur le banc du début à la fin — ne jamais les laisser décoller","Rotation des poignets de pronation vers semi-supination pendant la montée pour suivre la trajectoire naturelle","Descendre jusqu'à ressentir l'étirement des pectoraux — coudes à environ 45° du torse","Expirer à la poussée, inspirer en descendant lentement 2-3 secondes","Contraction 1 seconde en haut sans verrouiller les coudes pour maintenir la tension"],
variantes:[{nom:"Développé haltères plat",note:"Cible davantage le chef sternal, plus de volume sur la partie inférieure"},{nom:"Développé haltères décliné",note:"Accentue l'épaisseur du bas des pectoraux, bon pour compléter la masse"},{nom:"Développé machine convergente",note:"Idéal pour débutants ou en récupération — trajectoire guidée, focus sur la contraction"}],
erreurs:["Arquer excessivement le bas du dos pour soulever plus lourd — perd le travail pectoral","Verrouiller les coudes en haut — supprime la tension et fragilise l'articulation","Descente incontrôlée et rapide — risque tendineux important","Coudes perpendiculaires au torse (à 90°) — conflit sous-acromial garanti"]},

{n:"Pull-over haltère couché",s:"4",r:"12-15",rest:"60s",ch:"Léger-modéré",cat:"isolation",
morpho:"🫁 Cage plate ou étroite : exercice PRIORITAIRE selon Delavier — c'est l'un des seuls mouvements capable d'élargir la cage thoracique sur le long terme si pratiqué régulièrement avec une inspiration profonde. Intégrer systématiquement.\n🫁 Cage large/bombée : exercice utile pour le grand dorsal et les pectoraux mais l'effet d'expansion est moindre.\n🦴 Bras longs : amplitude naturellement grande — descendre progressivement pour éviter le stress à l'épaule.\n🦴 Bras courts : moins d'étirement naturel — compenser en descendant encore plus loin derrière la tête.\n📐 Épaules fragiles ou antépulsion : commencer très léger et privilégier la sensation d'étirement plutôt que la charge.",
tips:["Bras légèrement fléchis et angle FIXE tout au long — ne jamais les plier davantage en cours de mouvement","Descendre le plus bas possible derrière la tête pour maximiser l'étirement thoracique","Inspirer profondément en bas et retenir l'air brièvement pour l'expansion costale","Remonter lentement en arc de cercle en soufflant progressivement","La sensation d'ouverture de la cage est le critère de qualité de l'exercice"],
variantes:[{nom:"Pull-over travers de banc",note:"Position perpendiculaire pour plus d'expansion costale — version Gundill"},{nom:"Pull-over poulie basse",note:"Tension constante sur tout l'arc — meilleur pour cibler le grand dorsal"},{nom:"Pull-over machine",note:"Trajectoire guidée — idéal pour débutants ou apprentissage du mouvement"}],
erreurs:["Charger trop lourd — les épaules compensent et les pectoraux ne travaillent plus","Fléchir les coudes en cours de mouvement — l'exercice devient une extension des triceps","Amplitude insuffisante en bas — perte du bénéfice d'expansion thoracique","Vitesse trop rapide — c'est la sensation d'étirement qui produit les résultats"]},

{n:"Écarté poulie basse croisée",s:"3",r:"12-15",rest:"60s",ch:"Léger-40%",cat:"isolation",
morpho:"🦴 Bras longs : tension constante de la poulie est supérieure aux haltères car elle neutralise le désavantage biomécanique du bras long en bas du mouvement.\n🦴 Bras courts : haltères ou poulie indifféremment, les deux fonctionnent bien.\n🫁 Cage plate : angle bas (poulie au sol) pour cibler les fibres inférieures et donner du volume au bas des pecs.\n🫁 Cage large : angle intermédiaire ou écarté haltères suffisent.\n📐 Antépulsion épaules : vérifier que les omoplates restent rétractées tout au long — ne jamais laisser les épaules avancer.",
tips:["Légère flexion des coudes fixe et constante tout au long — angle immuable","Contraction de 1-2 secondes en haut avant de redescendre — c'est là que le muscle travaille le plus","Angle de la poulie détermine la zone ciblée : bas = chef inférieur / horizontal = chef moyen / haut = chef supérieur","Trajectoire en arc de cercle — imaginer enserrer un tonneau avec les bras","La poussée vient de l'épaule et du pectoral, pas du bras"],
variantes:[{nom:"Écarté haltères plat",note:"Classique et efficace — bonne amplitude mais moins de tension en bas"},{nom:"Écarté haltères incliné",note:"Cible le chef supérieur et claviculaire — bon pour le haut du torse"},{nom:"Écarté machine pec-deck",note:"Trajectoire fixe — idéal pour débutants et focus sur la contraction"}],
erreurs:["Trop lourd — les épaules compensent et les pectoraux ne sont plus mobilisés","Coudes qui changent d'angle en cours de mouvement — perd l'isolation","Croiser trop les bras en haut — perte de tension et stress articulaire inutile"]},

{n:"Dips buste incliné",s:"4",r:"8-12",rest:"90s",ch:"Corps + lest",cat:"principal",
morpho:"🦴 Bras longs : amplitude naturellement grande — descendre progressivement et contrôler soigneusement l'excentrique.\n🦴 Bras courts : amplitude réduite — accentuer l'inclinaison du buste pour compenser.\n📐 Épaules fragiles / antépulsion : éviter ou remplacer par le développé haltères incliné — risque de conflit antérieur d'épaule.\n📐 Épaules saines et solides : excellent exercice polyarticulaire pour le bas des pectoraux.\n💡 Inclinaison = résultat : 15-20° en avant = pectoraux / buste vertical = triceps — ajuster selon l'objectif.",
tips:["Incliner le buste vers l'avant de 15 à 20° pour cibler les pectoraux — plus d'inclinaison = moins de triceps","Descendre jusqu'à ce que les bras soient parallèles au sol minimum — amplitude complète","Excentrique 3 secondes, pause 1 seconde en bas, puis poussée explosive","Coudes légèrement écartés dans le plan du mouvement — pas serrés comme pour les triceps","Rentrer légèrement le menton pour garder l'alignement cervical"],
variantes:[{nom:"Dips poids du corps",note:"Version sans lestage — apprentissage de la technique, même inclinaison"},{nom:"Dips machine assistée",note:"Pour débutants — permet la surcharge négative progressive"},{nom:"Dips banc triceps",note:"Buste vertical — cible les triceps, pas les pectoraux"}],
erreurs:["Descente insuffisante — amplitude partielle = développement partiel des pectoraux","Balancement du corps pour tricher avec l'élan","Les épaules qui remontent vers les oreilles en bas — risque articulaire","Poignets trop fléchis sous la prise — stress poignet"]},

{n:"Développé couché barre",s:"4",r:"6-8",rest:"120s",ch:"75-80%",cat:"principal",
morpho:"🦴 Humérus courts + cage large : exercice idéal — amplitude courte, bon levier, charge maximale possible.\n🦴 Humérus longs : exercice difficile et risqué — la trajectoire fixe de la barre force un étirement excessif à l'épaule. Préférer les haltères si la moindre douleur apparaît (Delavier).\n📐 Clavicules larges : peut créer un conflit sous-acromial — réduire légèrement l'écartement de la prise.\n📐 Clavicules courtes : exercice confortable et efficace.\n🫁 Cage plate : amplitude grande en bas — attention au tendon du grand pectoral en position étirée.",
tips:["Prise légèrement plus large que les épaules — ni trop large (épaules) ni trop serrée (triceps)","Rétracter les omoplates AVANT de débarrer la barre — position scapulaire clé","Descente contrôlée 2-3 secondes vers la poitrine basse (au niveau des mamelons)","Pont lombaire naturel maintenu — fesses sur le banc en permanence","Pousser la barre vers le haut ET légèrement vers la tête pour suivre la trajectoire naturelle"],
variantes:[{nom:"Développé prise serrée",note:"Triceps + pectoraux internes — prise à largeur des épaules"},{nom:"Floor press barre",note:"Amplitude réduite — moins de stress sur les épaules (Delavier)"},{nom:"Développé haltères plat",note:"Option morphologique pour bras longs — rotation naturelle des poignets"}],
erreurs:["Rebond de la barre sur la poitrine — risque de déchirure tendon du grand pectoral","Décoller les fesses du banc pour soulever plus lourd — invalidant la technique","Poignets fléchis sous la barre — risque de blessure au poignet","Prise trop large — amplifie le conflit sous-acromial"]},

{n:"Écarté haltères plat",s:"3",r:"12-15",rest:"60s",ch:"Léger-40%",cat:"isolation",
morpho:"🦴 Bras longs : excellente amplitude d'étirement en bas — poids modéré pour protéger les tendons en position étirée.\n🦴 Bras courts : moins d'étirement naturel — descendre encore plus loin pour compenser.\n🫁 Cage plate : combiné au pull-over pour maximiser l'expansion thoracique.\n💡 L'étirement en bas est la clé de l'exercice — la contraction en haut est secondaire.",
tips:["Légère flexion des coudes fixe tout au long — ne jamais les plier davantage","Descendre jusqu'à ressentir un étirement profond dans les pectoraux","Remonter en arc de cercle comme si on enserrait un tonneau","Contraction 1s en haut avant de redescendre","Excentrique très lent 3-4s — c'est là que l'étirement travaille"],
variantes:[{nom:"Écarté haltères incliné",note:"Chef claviculaire — haut des pectoraux"},{nom:"Écarté machine pec-deck",note:"Tension constante — idéal finisseur pour débutants"},{nom:"Écarté poulie basse croisée",note:"Tension constante sur tout l'arc — supérieur aux haltères"}],
erreurs:["Trop lourd — les épaules compensent et les pecs ne travaillent plus","Plier les coudes en cours de mouvement — l'exercice devient un développé","Amplitude insuffisante en bas — perd le bénéfice de l'étirement"]},

{n:"Pompes lestées",s:"4",r:"10-20",rest:"90s",ch:"Corps + lest",cat:"principal",
morpho:"🦴 Tous morphotypes : exercice universel adapté à tous. Lester avec gilet ou sac si trop facile.\n🦴 Bras longs : amplitude naturellement grande — descente lente et contrôlée indispensable.\n📐 Antépulsion épaules : version mains larges plus adaptée que mains serrées.\n💡 Mains larges = pectoraux / mains à largeur épaules = équilibré / mains serrées = triceps + pec interne.",
tips:["Corps aligné de la tête aux talons — gainage actif","Descendre jusqu'à frôler le sol du torse","Coudes à 45° du corps — pas perpendiculaires","Poussée explosive en montant","Respiration : inspirer en descendant, expirer en poussant"],
variantes:[{nom:"Pompes pieds surélevés",note:"Cible le haut des pectoraux — même effet qu'incliné"},{nom:"Pompes mains surélevées",note:"Cible le bas des pectoraux — même effet que décliné"},{nom:"Pompes diamant",note:"Triceps + pectoraux internes — mains formant un triangle"}],
erreurs:["Hanches qui montent ou descendent — perd le gainage","Amplitude insuffisante — ne pas toucher le sol","Coudes perpendiculaires — conflit sous-acromial"]},

{n:"Machine convergente pectoraux",s:"3",r:"12-15",rest:"60s",ch:"60-70%",cat:"isolation",
morpho:"🦴 Tous morphotypes : trajectoire guidée qui s'adapte à la plupart des morphologies.\n🦴 Bras longs : très bonne option car la machine suit une trajectoire en arc naturel.\n🫁 Cage plate : angle de la machine ajusté pour cibler les fibres claviculaires en priorité.\n💡 Idéal pour débuter et apprendre la sensation de contraction pectorale.",
tips:["Régler les bras à hauteur des épaules pour le chef moyen — plus bas pour le chef inférieur","Contraction maximale 2s en position fermée","Excentrique contrôlé 2-3s — résister à la machine","Coudes légèrement fléchis et fixes","Penser à pousser avec les pectoraux, pas avec les bras"],
variantes:[{nom:"Pec-deck (butterfy)",note:"Amplitude plus grande — coudes fléchis à 90°"},{nom:"Câble croisé debout",note:"Plus de liberté de mouvement, tension constante"},{nom:"Écarté poulie haute",note:"Cible le bas des pecs en croisant devant les hanches"}],
erreurs:["Régler trop large — stress articulaire en position ouverte","Ne pas aller en extension complète — perd l'étirement","Trop de charge — les épaules avancent"]},
],

"Dos":[
{n:"Tractions pronation prise large",s:"4",r:"6-10",rest:"120s",ch:"Corps + lest",cat:"principal",
morpho:"📐 Clavicules larges : avantage mécanique majeur sur les tractions — la largeur naturelle des épaules crée un levier favorable pour l'écartement dorsal (Delavier).\n📐 Clavicules étroites : réduire légèrement la prise pour garder une trajectoire confortable.\n🦴 Bras longs : étirement dorsal maximal en bas du mouvement — grande amplitude naturelle.\n🦴 Bras courts : moins d'étirement en bas — compenser par une extension quasi-complète avant chaque répétition.\n💡 Moins de 5 tractions propres : commencer par le tirage poulie haute avec exactement le même pattern, puis progresser vers les tractions.",
tips:["Initier le mouvement par la DÉPRESSION des omoplates vers les hanches AVANT de plier les coudes — règle fondamentale","Tirer les coudes vers les hanches, pas les mains vers soi — le dos travaille, pas les biceps","Excentrique 3-4 secondes pour maximiser le recrutement des dorsaux","Straps si la prise lâche avant les dorsaux — prioriser le muscle cible","Regarder légèrement vers le haut pour une trajectoire optimale"],
variantes:[{nom:"Tirage poulie haute prise large",note:"Pattern identique — pour débutants ou quand les tractions sont épuisées"},{nom:"Tractions en supination",note:"Hybride biceps+dorsaux — plus accessible, bonne alternative"},{nom:"Tractions prise neutre",note:"Meilleure tolérance articulaire à l'épaule — recommandé si inconfort"}],
erreurs:["Tirer avec les bras sans dépression scapulaire initiale — biceps dominent, dorsaux sous-sollicités","Amplitude partielle en bas — ne pas profiter de l'étirement qui active les dorsaux","Balancement du corps pour se propulser — exclut l'adaptation musculaire","Traction derrière la nuque : risque cervical et sous-acromial grave — à proscrire absolument"]},

{n:"Rowing haltère unilatéral",s:"4",r:"10-12",rest:"60s",ch:"60-70%",cat:"principal",
morpho:"🦴 Bras longs : amplitude de tirage naturellement plus grande qu'avec la barre — exploiter pleinement l'étirement en bas.\n🦴 Bras courts : plier davantage le coude en haut pour atteindre la contraction maximale.\n📐 Asymétries : exercice idéal pour corriger les déséquilibres gauche/droite — commencer toujours par le côté faible.\n🔩 Tirage coude vers la hanche = grand dorsal / Tirage coude vers le plafond = trapèzes moyens — ajuster selon la zone à développer.",
tips:["Focus sur le COUDE qui remonte vers la hanche — penser à l'épaule qui descend, pas à la main qui monte","Amplitude complète : étirement maximal en bas, contraction forte en haut avec pause 1 seconde","Ne pas pivoter le buste — seul le bras travaille, le dos reste immobile","Genou et main ipsilatérale appuyés sur le banc pour une stabilité lombaire maximale","Excentrique contrôlé 2-3 secondes avant la prochaine répétition"],
variantes:[{nom:"Rowing barre incliné 45°",note:"Bilatéral — charge plus lourde possible, bonne option pour progresser"},{nom:"Chest supported row",note:"Fémurs longs ou douleurs lombaires — élimine complètement l'élan"},{nom:"Rowing câble bas assis",note:"Tension constante sur tout l'arc — excellent pour la finition dorsale"}],
erreurs:["Rotation excessive du buste — les lombaires travaillent, pas le dos","Amplitude partielle en haut ou en bas — perd les bénéfices de l'exercice","Coudes trop écartés — les trapèzes prennent le dessus sur les dorsaux","Vitesse trop rapide — perte totale du contrôle excentrique"]},

{n:"Tirage poulie haute prise large",s:"4",r:"10-12",rest:"90s",ch:"60%",cat:"principal",
morpho:"🦴 Bras courts : exercice très efficace — moins de fatigue des biceps que les tractions, angle et charge facilement ajustables.\n🦴 Bras longs : préférer les tractions ou réduire légèrement la prise pour une meilleure trajectoire.\n📐 Épaules fragiles : exercice plus sûr que les tractions — charge contrôlable à tout moment.\n🫁 Tous morphotypes : prise pronation large = grand dorsal / prise serrée neutre = grand rond + teres major.",
tips:["Légère inclinaison du buste en arrière (10-15°) pour une trajectoire descendante naturelle","Tirer vers la clavicule — pas vers le sternum ni derrière la nuque","Contraction des dorsaux en position basse avant l'excentrique — ne pas relâcher immédiatement","Contrôle excentrique lent 2-3 secondes","Maintenir les coudes sous les mains tout au long du mouvement"],
variantes:[{nom:"Tirage prise serrée neutre",note:"Grand dorsal + grand rond + teres major — bonne amplitude"},{nom:"Tirage prise supination",note:"Activation biceps supérieure — dorsaux internes plus sollicités"},{nom:"Tirage unilatéral câble",note:"Corrige les asymétries — contrôle et concentration supérieurs"}],
erreurs:["Tirer derrière la nuque — risque cervical et sous-acromial grave, à proscrire","Élan du corps pour compenser la fatigue en fin de série","Coudes qui remontent trop haut — les épaules prennent le relais sur les dorsaux","Ne pas aller en extension quasi-complète en haut — perd l'étirement activateur"]},

{n:"Face pull poulie haute corde",s:"4",r:"15-20",rest:"45s",ch:"Léger",cat:"correctif",
morpho:"📐 Antépulsion d'épaules (épaules qui partent en avant) : exercice CORRECTIF PRIORITAIRE — renforce les rotateurs externes et le deltoïde postérieur systématiquement sous-développés. À intégrer en début de séance de tirage ET en fin de séance de poussée.\n📐 Épaules équilibrées : exercice préventif excellent — maintenir l'équilibre antérieur/postérieur.\n🦴 Tous morphotypes : exercice universel adapté à toutes les configurations. La charge doit rester très légère.",
tips:["Tirer vers le front — coudes hauts à hauteur des oreilles voire légèrement au-dessus","Rotation externe maximale à la fin : doigts qui pointent vers le plafond","Poids TRÈS léger — c'est la rotation externe qui produit le résultat, pas la charge","Séparer les cordes au maximum en fin de mouvement pour l'ouverture scapulaire","2 secondes de contraction en fin de mouvement pour l'effet correctif maximal"],
variantes:[{nom:"Rotation externe élastique bras le long",note:"Version préventive légère — peut se pratiquer n'importe où"},{nom:"Face pull corde basse",note:"Angle différent — cible les fibres postérieures moyennes"},{nom:"Oiseau haltères penché",note:"Même fonction corrective — plus de liberté d'amplitude"}],
erreurs:["Trop lourd — le dos et les trapèzes prennent le relais, les rotateurs ne travaillent pas","Coudes qui descendent sous les épaules — perd la rotation externe","Ne pas terminer la rotation externe — exercice incomplet et inefficace","Buste qui se penche en arrière pour compenser le poids"]},

{n:"Rowing barre 45°",s:"4",r:"8-10",rest:"90s",ch:"65%",cat:"principal",
morpho:"🦴 Fémurs longs : difficile de maintenir la position sans compenser avec le bas du dos — préférer le chest supported row ou le rowing haltère.\n🦴 Fémurs courts : exercice confortable, bonne position naturelle.\n🔩 Tirage vers le nombril = dorsaux prioritaires / Tirage vers la poitrine = trapèzes moyens et rhomboïdes — à adapter selon la zone à développer.\n📐 Antépulsion épaules : veiller à ne jamais laisser les épaules rouler en avant pendant l'excentrique.",
tips:["Lordose naturelle maintenue ABSOLUMENT — le risque lombaire est majeur si le dos s'arrondit","Barbell tracé vers le nombril pour cibler les dorsaux en priorité","Cheating contrôlé acceptable uniquement en toute fin de série, jamais au début","Excentrique 2-3 secondes pour maximiser le recrutement musculaire","Visualiser les coudes qui remontent vers les hanches — pas les mains vers la poitrine"],
variantes:[{nom:"Rowing Pendlay",note:"Explosif depuis le sol — force et puissance, bonne option intermédiaire"},{nom:"Chest supported row",note:"Idéal fémurs longs — supprime l'élan, isolation dorsale pure"},{nom:"Rowing haltères bilatéral",note:"Meilleure amplitude que la barre — bonne alternative"}],
erreurs:["Arrondir le dos sous la charge — blessure lombaire grave et immédiate","Élan excessif dès le début de la série — annule le travail musculaire","Tirage trop haut vers le menton — les trapèzes supérieurs dominent","Amplitude partielle — ne profite pas de l'étirement en bas"]},

{n:"Pull-over poulie basse debout",s:"3",r:"12-15",rest:"60s",ch:"Léger",cat:"isolation",
morpho:"🦴 Tous morphotypes : tension constante sur tout l'arc de mouvement — supérieur au pull-over haltère pour cibler le grand dorsal.\n🦴 Bras longs : amplitude maximale vers le haut — exploiter la longueur naturelle.\n📐 Épaules fragiles : version plus douce que les tirages — charge légère et contrôlée.\n🫁 Grand dorsal court : excellent exercice pour sentir le grand dorsal travailler en étirement complet.",
tips:["Bras tendus ou légèrement fléchis — angle fixe tout au long","Tirer vers les cuisses en expirant progressivement","Amplitude maximale vers le haut pour l'étirement complet du grand dorsal","Légère inclinaison du buste vers l'avant pour une meilleure activation","Contraction 1 seconde en bas avant de remonter lentement"],
variantes:[{nom:"Pull-over haltère couché",note:"Plus d'étirement en bas — meilleur pour l'expansion thoracique"},{nom:"Pull-over machine",note:"Trajectoire guidée — idéal pour débutants et apprentissage de la sensation"}],
erreurs:["Trop fléchir les coudes en cours de mouvement — les triceps prennent le travail","Amplitude insuffisante vers le haut — perd l'étirement activateur","Buste qui compense par flexion excessive du tronc"]},

{n:"Soulevé de terre roumain",s:"4",r:"6-8",rest:"120s",ch:"75-80%",cat:"principal",
morpho:"🦴 Fémurs courts : exercice confortable — position naturellement verticale, bon levier.
🦴 Fémurs longs : difficile de garder le dos plat — Romanian deadlift haltères ou trap bar recommandés.
💪 Chaîne postérieure complète : grand dorsal + trapèzes + érecteurs + ischios + fessiers — l'exercice le plus complet de la musculation.",
tips:["Lordose naturelle OBLIGATOIRE — si le dos s'arrondit, charge trop lourde","Barre au ras des tibias sur tout le trajet — ne pas l'éloigner du corps","Pieds à largeur des hanches, prise en pronation ou mixte","Engagement des dorsaux avant de tirer — penser à rentrer les omoplates","Poussée des jambes dans le sol plutôt que tirage vers le haut"],
variantes:[{nom:"Soulevé sumo",note:"Pieds larges, moins de stress lombaire — bonne option fémurs longs"},{nom:"Soulevé trap bar hexagonale",note:"Meilleure option pour fémurs longs — charge dans l'axe du corps"},{nom:"Romanian deadlift haltères",note:"Plus d'étirement ischios — version accessible"}],
erreurs:["Arrondir le dos — blessure lombaire certaine","Barre qui s'éloigne du corps — levier défavorable","Hyperextension lombaire en haut — verrouiller les hanches suffit"]},

{n:"Tirage horizontal câble assis",s:"4",r:"10-12",rest:"75s",ch:"65%",cat:"principal",
morpho:"🦴 Fémurs longs : meilleure option que le rowing barre car la position assise neutralise les compensations du bas du dos.
🦴 Tous morphotypes : exercice complet pour les dorsaux moyens et inférieurs.
🔩 Prise serrée neutre = grand dorsal + grand rond / prise large = trapèzes moyens + rhomboïdes.",
tips:["Dos droit, légère inclinaison arrière en tirant — pas de bascule excessive","Tirer vers le nombril avec les coudes bien le long du corps","Etirement complet en avant — laisser les omoplates s'écarter","Contraction maximale en fin de mouvement — serrer les omoplates","Excentrique contrôlé 2-3s"],
variantes:[{nom:"Tirage horizontal prise large",note:"Trapèzes moyens et rhomboïdes davantage sollicités"},{nom:"Tirage horizontal unilatéral",note:"Correction asymétrie + concentration supérieure"},{nom:"Chest supported row machine",note:"Élimine tout élan — isolation dorsale pure"}],
erreurs:["Bascule excessive du buste pour prendre de l'élan","Coudes trop écartés — trapèzes supérieurs dominent","Amplitude insuffisante en avant — perd l'étirement activateur"]},

{n:"Tractions supination",s:"4",r:"6-10",rest:"120s",ch:"Corps + lest",cat:"principal",
morpho:"🦴 Bras longs : meilleur recrutement biceps qui aide à compléter le mouvement malgré la longueur.
🦴 Bras courts : biceps moins impliqués — dorsaux plus isolés.
📐 Clavicules larges : prise légèrement plus étroite que les tractions pronation pour optimiser la trajectoire.
💡 Hybride biceps + grand dorsal — plus accessible que les tractions pronation pour progresser.",
tips:["Prise supination à largeur des épaules ou légèrement plus étroite","Initier par la dépression scapulaire avant de plier les coudes","Tirer les coudes vers les hanches — pas vers l'arrière","Chin above bar = amplitude complète — ne pas tricher avec un demi-mouvement","Excentrique 3-4s"],
variantes:[{nom:"Tractions neutres",note:"Meilleure tolérance articulaire — entre pronation et supination"},{nom:"Assisted pull-ups machine",note:"Progression vers les tractions pures"},{nom:"Tirage supination poulie haute",note:"Pattern identique sans le poids du corps"}],
erreurs:["Amplitude partielle — menton doit dépasser la barre","Balancement pour se propulser","Ne pas aller en extension complète en bas"]},
],

"Épaules":[
{n:"Développé haltères assis",s:"4",r:"8-10",rest:"90s",ch:"55-65%",cat:"principal",
morpho:"🦴 Bras longs : haltères indispensables — la barre impose une trajectoire fixe qui crée un conflit sous-acromial incompatible avec des humérus longs (Delavier). Les haltères permettent la rotation naturelle.\n🦴 Bras courts : barre ou haltères fonctionnent — la barre permet des charges plus lourdes.\n📐 Clavicules larges : excellent exercice — le levier naturel est favorable, amplitude et recrutement optimaux.\n📐 Épaules fragiles ou antépulsion : effectuer un demi-développé (arrêt à 90°) ou remplacer par les élévations latérales en priorité.",
tips:["Coudes alignés avec les épaules à la montée — ne pas les laisser partir en avant du plan frontal","Arrêter à 90-95% de l'extension — ne pas verrouiller en haut pour maintenir la tension","Descendre jusqu'à l'horizontale des bras pour une amplitude complète","Contrôle excentrique 2-3 secondes","Coudes légèrement en avant du plan frontal — protège l'articulation acromio-claviculaire"],
variantes:[{nom:"Développé Arnold",note:"Rotation pronation/supination — recrutement complet des faisceaux"},{nom:"Demi-développé épaules",note:"Arrêt à 90° — pour épaules fragiles ou début de programme"},{nom:"Développé épaules machine",note:"Trajectoire guidée — idéal pour débutants"}],
erreurs:["Verrouiller les coudes en haut — perte de tension + risque articulaire","Descente insuffisante — amplitude partielle = développement partiel","Arquer le dos pour compenser — surcharge lombaire et perte d'isolation","Coudes trop en arrière du plan frontal — conflit sous-acromial"]},

{n:"Élévations latérales poulie basse",s:"4",r:"15-20",rest:"45s",ch:"Très léger",cat:"isolation",
morpho:"🦴 Avant-bras longs : lever les COUDES et non les mains — les avant-bras longs créent un levier défavorable si l'on pense à la main. Les machines avec appui coudes résolvent ce problème mécaniquement (Gundill).\n🦴 Avant-bras courts : haltères ou poulie fonctionnent de façon similaire.\n📐 Trapèzes dominants : effectuer l'exercice légèrement penché vers l'avant pour réduire l'activation des trapèzes.\n💡 Arrêt OBLIGATOIRE à 90° — au-delà c'est le trapèze supérieur qui prend le relais, pas le deltoïde moyen.",
tips:["Lever les COUDES — pas les mains : penser à ce que ce sont les coudes qui montent","90° MAXIMUM — au-delà le trapèze prend complètement le relais du deltoïde","Légère inclinaison du pouce vers le bas pour cibler spécifiquement le deltoïde moyen","Légère inclinaison du buste vers l'avant améliore significativement l'activation","Excentrique contrôlé 2 secondes — résister à la gravité"],
variantes:[{nom:"Élévations haltères debout",note:"Classique — bon pour les repères proprioceptifs"},{nom:"Élévations machine avec appui coudes",note:"Idéal bras longs — annule le désavantage du levier"},{nom:"Élévations unilatérales poulie",note:"Tension constante + correction des asymétries"}],
erreurs:["Trop lourd — les trapèzes prennent le dessus dès 60-70° d'élévation","Dépasser 90° — l'exercice cible les trapèzes, plus le deltoïde moyen","Balancement du corps — perd l'isolation du deltoïde","Poignets fléchis — mauvaise répartition de la charge"]},

{n:"Oiseau haltères penché",s:"4",r:"15-20",rest:"45s",ch:"Très léger",cat:"correctif",
morpho:"📐 Antépulsion d'épaules : exercice CORRECTIF ESSENTIEL — renforce le deltoïde postérieur et les rhomboïdes qui tirent les épaules en arrière. À associer systématiquement au face pull.\n📐 Épaules équilibrées : excellent exercice préventif — le deltoïde postérieur est sous-développé chez la quasi-totalité des pratiquants (Delavier).\n🦴 Tous morphotypes : exercice universel. Le poids doit rester très léger — la connexion neuromusculaire prime sur la charge.",
tips:["Buste penché à l'horizontale — dos plat, regard vers le sol","Légère flexion des coudes fixe et constante tout au long du mouvement","Montée contrôlée jusqu'à l'horizontale — ne pas aller au-delà","Penser à écarter les coudes vers l'arrière et le haut — et non vers les côtés","Poids très léger — c'est la connexion neuromusculaire qui produit les résultats"],
variantes:[{nom:"Oiseau machine pec-deck inversé",note:"Trajectoire guidée — bonne option pour les débutants"},{nom:"Face pull corde poulie haute",note:"Version dynamique avec rotation externe — effet correctif supérieur"},{nom:"Oiseau câble bas",note:"Tension constante sur tout l'arc de mouvement"}],
erreurs:["Trop lourd — les trapèzes et les bras prennent le relais","Monter trop haut — les trapèzes dominent au-delà de l'horizontale","Dos arrondi — perd l'alignement et l'isolation du deltoïde postérieur","Coudes qui bougent en cours de mouvement"]},

{n:"Rotation externe poulie basse",s:"3",r:"15-20",rest:"45s",ch:"Élastique léger",cat:"correctif",
morpho:"📐 Antépulsion d'épaules : exercice PRÉVENTIF INDISPENSABLE — renforce le supraépineux et les rotateurs externes. Le déséquilibre rotateurs internes/externes est à l'origine de la majorité des blessures d'épaule en musculation (Delavier).\n📐 Épaules saines : exercice préventif — maintenir l'équilibre rotateur interne/externe.\n🦴 Bras longs : exercice particulièrement important car l'amplitude plus grande des mouvements de poussée sollicite davantage les rotateurs.",
tips:["Coude collé au corps à 90° — position stricte maintenue tout au long","Rotation externe lente et contrôlée — ne pas aller trop vite","Pause 1-2 secondes en fin de rotation externe maximale","Poids MINIMAL — l'amplitude et la rotation comptent, pas la charge","À effectuer en échauffement ou en finition — jamais en milieu de séance"],
variantes:[{nom:"Rotation externe haltère allongé sur côté",note:"Gravity assist — bonne amplitude, version accessible"},{nom:"Rotation externe élastique debout",note:"Peut se pratiquer n'importe où"},{nom:"Rotation externe bras à 90°",note:"Position plus difficile — meilleure activation des rotateurs courts"}],
erreurs:["Coude qui décolle du corps — l'exercice perd complètement son intérêt","Trop lourd — les compensations musculaires prennent le dessus","Amplitude incomplète — travail insuffisant des rotateurs externes"]},

{n:"Élévations frontales haltères",s:"3",r:"12-15",rest:"60s",ch:"Très léger",cat:"isolation",
morpho:"🦴 Tous morphotypes : deltoïde antérieur. Souvent surdéveloppé par les exercices de poussée — à ne pas surcharger si antépulsion.
📐 Antépulsion épaules : à éviter ou remplacer par l'oiseau penché — renforce une dominance déjà présente.
💡 Si les épaules compensent dès le premier reps : charge trop lourde.",
tips:["Mouvement vers l'avant et légèrement vers l'intérieur","Arrêt à hauteur des épaules — pas plus haut","Excentrique contrôlé 2-3s","Alternativement pour plus de concentration","Prise pronation ou en pince selon préférence"],
variantes:[{nom:"Élévations frontales câble bas",note:"Tension constante — meilleure option selon Gundill"},{nom:"Élévations frontales barre",note:"Bilatéral — plus de charge mais moins d'isolation"},{nom:"Raise inversé cable",note:"Deltoïde antérieur en fin d'arc — bon finisseur"}],
erreurs:["Balancement du corps pour se propulser","Dépasser la hauteur des épaules — trapèzes prennent le relais","Trop lourd — compensation lombaire"]},

{n:"Shrug d'isolation haut pectoraux",s:"3",r:"15",rest:"60s",ch:"Léger",cat:"isolation",
morpho:"🫁 Cage plate : exercice de Gundill ciblant le haut des pectoraux via l'angle d'élévation de l'épaule. Excellent pour les morphotypes à cage plate qui peinent à développer le haut du torse.
📐 Épaules saines obligatoires — douleur = arrêt immédiat.",
tips:["Bras tendus devant soi, penché légèrement vers la machine","Élever l'épaule vers la tête en gardant le bras tendu","Contraction 1-2s en position haute","Amplitude de seulement quelques centimètres — mouvement d'épaule pur","Poids très léger — c'est la connexion neuromusculaire qui compte"],
variantes:[{nom:"Shrug pec-deck",note:"Machine guidée — version la plus accessible"},{nom:"Cable shrug incliné",note:"Version câble pour tension constante"}],
erreurs:["Amplitude trop grande — trapèzes prennent le relais","Trop lourd — perd l'isolation du haut pectoral","Ne pas sentir la contraction = mauvaise position"]},
],

"Biceps":[
{n:"Curl haltères supination alternés",s:"4",r:"10-12",rest:"60s",ch:"65%",cat:"principal",
morpho:"🦴 Humérus longs : le pic visuel du biceps sera naturellement moins prononcé (Delavier) — compenser par une contraction maximale et une supination complète à chaque répétition.\n🦴 Humérus courts : développement du pic plus facile — bon levier naturel pour la contraction en haut.\n💡 La supination (rotation externe du poignet) est ce qui différencie un curl efficace d'un curl ordinaire — elle maximise le recrutement du chef long.",
tips:["Supiner progressivement pendant la montée — le pouce sort vers l'extérieur","Coude fixe et collé au corps tout au long — ne jamais le laisser partir en avant","Contraction maximale 2 secondes en haut — serrer fort en supination","Excentrique 2-3 secondes — résister à la gravité","Alterner les bras pour une concentration maximale sur chaque côté"],
variantes:[{nom:"Curl haltères simultané",note:"Plus de charge totale — moins de concentration sur chaque bras"},{nom:"Curl barre droite ou EZ",note:"Bilatéral — force pure, barre EZ si les poignets sont inconfortables"},{nom:"Curl marteau",note:"Chef long + brachioradial — donne de la largeur au bras"}],
erreurs:["Balancer le corps pour compenser en fin de série — les lombaires ne doivent pas participer","Coudes qui avancent — le deltoïde antérieur prend le relais des biceps","Amplitude insuffisante en bas — ne pas aller en extension quasi-complète","Ne pas supiner — le chef long reste sous-sollicité"]},

{n:"Curl incliné haltères 45°",s:"3",r:"10-12",rest:"60s",ch:"50%",cat:"isolation",
morpho:"🦴 Humérus longs : MEILLEUR exercice biceps — le banc incliné + bras tendus vers l'arrière créent un étirement maximal en position basse qui maximise l'activation musculaire (Delavier). Compense le manque de pic naturel.\n🦴 Humérus courts : exercice utile mais l'avantage de l'étirement est moins prononcé.\n💡 L'étirement en bas est le bénéfice clé de cet exercice — si le poids empêche de descendre correctement, il est trop lourd.",
tips:["Banc à 45-50° — avant-bras qui tombent librement vers le bas","Supination progressive PENDANT la montée pour maximiser le recrutement","Pause de 2 secondes en contraction maximale en haut — serrer fort","Poids modéré — c'est l'étirement en bas qui produit les résultats","Ne pas décoller les épaules du banc — elles restent en contact permanent"],
variantes:[{nom:"Curl incliné simultané",note:"Plus de charge — moins de concentration sur chaque bras"},{nom:"Curl incliné neutre",note:"Brachioradial + chef long — variante marteau sur banc incliné"},{nom:"Curl câble bas sur banc incliné",note:"Tension constante sur tout l'arc — meilleure activation continue"}],
erreurs:["Épaules qui décollent du banc — perd l'étirement clé et le bénéfice de l'exercice","Amplitude insuffisante en bas — le bénéfice vient précisément de l'étirement","Trop lourd — le dos et les épaules compensent","Vitesse trop rapide — perd la sensation d'étirement"]},

{n:"Curl marteau",s:"3",r:"12",rest:"60s",ch:"65%",cat:"principal",
morpho:"🦴 Humérus longs : développe le brachial qui épaissit le bras vu de face — compensatoire au manque de pic naturel. Excellent choix de volume.\n🦴 Humérus courts : volume et largeur supplémentaires — bonne complémentarité avec le curl supination.\n💡 Le curl marteau cible le chef long du biceps + le brachioradial + le brachial — il donne de la largeur au bras, pas du pic.",
tips:["Poignets neutres — pas de rotation, c'est ce qui distingue cet exercice du curl classique","Coudes fixes — pas de balancement même en fin de série","Amplitude complète — extension en bas et flexion maximale en haut","Peut s'effectuer alternativement ou simultanément selon la préférence","Concentration sur la contraction du brachioradial"],
variantes:[{nom:"Hammer curl câble",note:"Tension constante sur tout l'arc — plus d'activation continue"},{nom:"Reverse curl",note:"Extenseurs de l'avant-bras + brachioradial — équilibre important"},{nom:"Zottman curl",note:"Combiné supination/pronation — travaille les deux faces de l'avant-bras"}],
erreurs:["Rotation des poignets en cours de mouvement — devient un curl classique","Balancement du corps","Amplitude partielle en haut"]},

{n:"Curl pupitre barre EZ",s:"4",r:"10-12",rest:"60s",ch:"60%",cat:"isolation",
morpho:"🦴 Tous morphotypes : isolation maximale — le pupitre supprime tout élan possible. La barre EZ réduit le stress sur les poignets par rapport à la barre droite.\n🦴 Humérus longs : l'amplitude naturellement grande crée un excellent étirement en bas — exploiter pleinement.\n💡 Exercice de connexion neuromusculaire — l'objectif n'est pas de soulever lourd mais de sentir le biceps travailler de façon isolée.",
tips:["Coudes bien calés sur le pupitre — ne jamais les décoller","Amplitude complète — extension quasi-totale en bas sans relâcher la tension","Excentrique très lent 3-4 secondes (Gundill) — le temps sous tension est la clé","Garder une légère tension en bas — ne pas aller en extension totale","Contraction 1-2 secondes en haut"],
variantes:[{nom:"Curl pupitre haltères",note:"Correction des asymétries + légèrement plus d'amplitude"},{nom:"Curl pupitre câble bas",note:"Tension constante sur tout l'arc — très efficace"},{nom:"Curl concentré haltère",note:"Isolation maximale — excellent exercice finisseur"}],
erreurs:["Décoller les coudes du pupitre — tout le bénéfice de l'isolation disparaît","Amplitude insuffisante en bas","Vitesse trop rapide — perd le bénéfice du temps sous tension"]},

{n:"Curl barre EZ debout",s:"4",r:"8-10",rest:"75s",ch:"70%",cat:"principal",
morpho:"🦴 Humérus longs : la barre EZ réduit le stress sur les poignets et les coudes vs barre droite — fortement recommandée.\n🦴 Humérus courts : barre droite ou EZ — les deux fonctionnent bien.\n💡 Position debout permet de charger plus lourd que le pupitre — bonne option pour la force pure.",
tips:["Coudes fixes le long du corps tout au long","Amplitude complète — extension quasi-totale en bas","Prise en semi-supination sur la barre EZ","Excentrique 2-3s","Éviter tout balancement même en fin de série"],
variantes:[{nom:"Curl câble bas bilatéral",note:"Tension constante sur tout l'arc — très efficace"},{nom:"Drag curl barre",note:"Chef long maximisé — coudes qui partent en arrière"},{nom:"Reverse curl",note:"Extenseurs avant-bras + brachioradial — équilibre fléchisseurs/extenseurs"}],
erreurs:["Balancement du buste pour compenser","Coudes qui avancent en montant","Amplitude partielle en bas"]},

{n:"Curl concentration haltère",s:"3",r:"12-15",rest:"60s",ch:"50%",cat:"isolation",
morpho:"🦴 Tous morphotypes : isolation maximale — aucun élan possible grâce à l'appui sur la cuisse.\n🦴 Humérus longs : étirement en bas encore plus prononcé — excellent recrutement du chef long.\n💡 Exercice de finition — qualité et connexion neuromusculaire avant la charge.",
tips:["Coude appuyé contre la cuisse intérieure — position fixe stricte","Supination en montant — rotation externe du poignet","Contraction maximale 2s en haut — visualiser le muscle","Excentrique très lent 3-4s","Un bras à la fois pour une concentration totale"],
variantes:[{nom:"Curl concentration câble bas",note:"Tension constante — version cable"},{nom:"Spider curl banc incliné inversé",note:"Coudes devant sur banc incliné inversé — isolement maximum"}],
erreurs:["Coude qui décolle de la cuisse","Amplitude insuffisante en bas","Ne pas supiner"]},
],

"Triceps":[
{n:"Extension poulie haute corde",s:"4",r:"12-15",rest:"60s",ch:"Brûlure",cat:"principal",
morpho:"🦴 Tous morphotypes : exercice universel et très efficace — la corde permet une rotation externe en bas qui maximise le pic de contraction. Tension constante sur tout l'arc.\n🦴 Bras longs : amplitude naturellement grande en bas — exploiter l'étirement du chef long.\n💡 La séparation des cordes en bas est ce qui distingue cet exercice — elle est indispensable pour la contraction maximale.",
tips:["Buste légèrement incliné en avant pour maintenir la tension à travers l'arc entier","Séparer les cordes en bas en pronant — rotation externe maximale pour le pic de contraction","Coudes fixes collés aux flancs — ils ne bougent pas","Excentrique 2 secondes","Contraction 1-2 secondes en extension complète"],
variantes:[{nom:"Extension poulie barre droite",note:"Plus de charge possible — moins d'amplitude en bas"},{nom:"Extension poulie prise supination",note:"Chef long + médial — trajectoire différente"},{nom:"Kickback haltère",note:"Chef long en isolation — bon exercice finisseur"}],
erreurs:["Coudes qui avancent — les pectoraux et dorsaux prennent le relais","Ne pas aller en extension complète — perd le pic de contraction","Trop de charge — le contrôle de l'excentrique disparaît"]},

{n:"French press barre EZ couché",s:"4",r:"10-12",rest:"75s",ch:"55%",cat:"principal",
morpho:"🦴 Bras longs : chef long en étirement maximal — excellente activation. L'amplitude naturellement grande demande une progression prudente des charges.\n🦴 Bras courts : exercice confortable — peut charger plus vite.\n💡 La barre EZ est recommandée par Delavier vs barre droite — elle réduit le stress sur les poignets et les coudes tout en maintenant un excellent recrutement.",
tips:["Coudes pointent vers le plafond — ils ne s'écartent pas pendant le mouvement","Descendre vers le front (haut de la tête) — pas vers le nez ni la poitrine","Excentrique très lent 3-4 secondes (Gundill) — maximise l'étirement du chef long","Extension quasi-complète en haut sans verrouillage final","Inspirer en descendant, expirer en montant"],
variantes:[{nom:"French press haltères",note:"Amplitude légèrement différente — moins de stress sur les poignets"},{nom:"French press câble haut couché",note:"Tension constante sur tout l'arc de mouvement"},{nom:"Extension nuque assis haltère",note:"Chef long en position debout/assis — bon complément"}],
erreurs:["Coudes qui s'écartent — perd l'isolation du chef long","Descente trop rapide — risque tendineux au niveau du coude","Ne pas aller en extension quasi-complète — perd le bénéfice","Trop de charge — la technique est compromise"]},

{n:"Extension haltère nuque assis",s:"3",r:"12",rest:"60s",ch:"50%",cat:"isolation",
morpho:"🦴 Bras longs : chef long en étirement complet — amplitude naturellement grande, excellent recrutement.\n🦴 Bras courts : moins d'étirement naturel — descendre encore plus loin derrière la tête.\n💡 Le chef long est le plus grand des 3 chefs du triceps — son développement donne du volume au bras entier vu de côté et de dos.",
tips:["Bras vertical — coude pointant vers le plafond","Descendre l'haltère derrière la tête en amplitude maximale","Coude fixe — il ne bouge pas latéralement","Excentrique 3 secondes puis extension contrôlée","Utiliser l'autre main sur le coude pour maintenir l'alignement"],
variantes:[{nom:"Extension nuque câble assis",note:"Tension constante — très efficace"},{nom:"Extension nuque bilatérale haltère",note:"Les deux mains tiennent l'haltère — plus stable"},{nom:"Extension nuque élastique",note:"Option légère et accessible partout"}],
erreurs:["Coude qui s'écarte vers l'extérieur","Amplitude insuffisante en bas — perd l'étirement du chef long","Vitesse excessive"]},

{n:"Dips prise serrée",s:"4",r:"8-12",rest:"90s",ch:"Corps + lest",cat:"principal",
morpho:"🦴 Bras longs : amplitude naturellement grande — descendre progressivement et contrôler l'excentrique.\n🦴 Bras courts : amplitude plus réduite — accentuer la contraction en haut.\n💡 Buste VERTICAL = triceps / Buste incliné = pectoraux. La verticalité du buste est le paramètre clé de cet exercice.",
tips:["Buste VERTICAL — c'est ce qui cible les triceps et non les pectoraux","Prise à largeur des épaules maximum — pas plus large","Excentrique 3 secondes","Extension complète en haut sans verrouillage total","Genoux croisés en arrière pour maintenir la verticalité du buste"],
variantes:[{nom:"Dips poids du corps buste droit",note:"Version sans lestage"},{nom:"Extension poulie haute",note:"Si dips impossible ou épaules fragiles"},{nom:"Développé couché prise serrée",note:"Même pattern en couché — charge contrôlable"}],
erreurs:["Incliner le buste — les pectoraux prennent le relais","Amplitude insuffisante","Coudes trop écartés"]},

{n:"Kickback haltère",s:"3",r:"12-15",rest:"60s",ch:"Léger",cat:"isolation",
morpho:"🦴 Tous morphotypes : chef long + latéral en contraction maximale.\n🦴 Bras longs : amplitude plus grande — excellent étirement en bas.\n💡 Exercice de finition — qualité absolue. Jamais lourd.",
tips:["Buste horizontal — haltère part vers l'arrière","Coude fixe à hauteur de l'épaule ou au-dessus","Extension complète — pause 1s en contraction maximale","Excentrique 2s contrôlé","Un bras à la fois"],
variantes:[{nom:"Kickback câble bas",note:"Tension constante — supérieur aux haltères selon Gundill"},{nom:"Kickback bilatéral câble haut",note:"Bonne option si banc indisponible"}],
erreurs:["Coude qui descend en cours de mouvement","Amplitude insuffisante","Balancement du corps"]},

{n:"Extension nuque câble haut",s:"3",r:"12-15",rest:"60s",ch:"Léger",cat:"isolation",
morpho:"🦴 Tous morphotypes : chef long en étirement et tension constants.\n🦴 Bras longs : amplitude naturellement grande — excellent recrutement.\n💡 Tension constante du câble supérieure aux haltères selon Gundill.",
tips:["Dos à la poulie — câble au-dessus de la tête","Extension du coude vers l'avant et le bas","Coude fixe et haut","Contraction 1s en extension complète","Excentrique 2-3s"],
variantes:[{nom:"Extension nuque haltère bilatéral",note:"Sans câble — haltère à deux mains"},{nom:"French press couché câble",note:"Version allongée — même principe"}],
erreurs:["Coude qui descend","Amplitude partielle","Corps qui se balance"]},
],

"Quadriceps":[
{n:"Presse à jambes 45° pieds hauts",s:"4",r:"10-15",rest:"90s",ch:"70%",cat:"principal",
morpho:"🦴 Fémurs longs : MEILLEUR exercice jambes selon Delavier — le squat force un buste trop incliné vers l'avant avec des fémurs longs, créant une surcharge lombaire. La presse supprime ce problème anatomique.\n🦴 Fémurs courts : squat ou presse fonctionnent — les deux sont appropriés.\n🔩 Position des pieds détermine les muscles ciblés : hauts = fessiers+ischios+quadriceps / bas = quadriceps isolés / écartés = adducteurs + fessiers.",
tips:["Pieds à hauteur des épaules ou légèrement plus écartés","Amplitude complète — descendre jusqu'à un angle de 90° minimum","Genoux dans l'axe des pieds — ne jamais les laisser rentrer en dedans","Excentrique 3 secondes — pas de rebond en bas","Ne jamais décoller le bas du dos de la plateforme"],
variantes:[{nom:"Presse pieds bas",note:"Quadriceps isolés — moins de fessiers et d'ischios"},{nom:"Presse unilatérale",note:"Correction des asymétries gauche/droite"},{nom:"Hack squat guidé",note:"Plus de quadriceps, moins de sollicitation lombaire"}],
erreurs:["Décoller le bas du dos en bas du mouvement — risque lombaire grave","Genoux qui rentrent en dedans — risque ligamentaire","Verrouiller les genoux en haut — perte de tension et risque articulaire","Rebond en bas — perte du contrôle excentrique"]},

{n:"Leg extension machine",s:"3",r:"15",rest:"60s",ch:"60%",cat:"isolation",
morpho:"🦴 Tous morphotypes : isolation pure des quadriceps — exercice de finition universel après un mouvement de base.\n🦴 Fémurs longs : amplitude de flexion naturellement plus grande — exploiter pleinement l'extension.\n💡 La contraction isométrique 1-2 secondes en extension complète est indispensable pour la connexion neuromusculaire avec les quadriceps.",
tips:["Dos appuyé sur le dossier — lombaires en contact permanent","Contraction de 1-2 secondes en extension complète — c'est là que l'exercice est le plus efficace","Excentrique 3 secondes — maximiser le temps sous tension","Pointe des pieds vers soi pour plus d'activation du droit fémoral","15-20 reps en finisseur léger pour le pump"],
variantes:[{nom:"Leg extension unilatéral",note:"Correction des asymétries — commencer par la jambe faible"},{nom:"Sissy squat",note:"Quadriceps en étirement complet — version avancée"},{nom:"Terminal knee extension élastique",note:"Préventif du genou — activation VMO"}],
erreurs:["Amplitude insuffisante en bas — perd l'activation complète","Pas de contraction en haut — perd le bénéfice de l'isolation","Trop lourd — compensation avec le buste"]},

{n:"Squat goblet haltère",s:"3",r:"12",rest:"90s",ch:"Modéré",cat:"principal",
morpho:"🦴 Fémurs longs : l'haltère tenu devant agit comme contrepoids et permet de rester plus vertical qu'au squat classique — version accessible et sécuritaire.\n🦴 Fémurs courts : exercice confortable — la position naturelle est déjà favorable.\n💡 Version d'apprentissage du squat ou exercice d'échauffement avant la presse.",
tips:["Haltère tenu verticalement contre la poitrine — bras en V vers le bas","Descente contrôlée — cuisses parallèles au sol minimum","Genoux dans l'axe des pieds, légèrement en dehors","Talon bien ancré au sol — poids réparti sur tout le pied","Dos droit, regard frontal"],
variantes:[{nom:"Squat barre guidée Smith",note:"Sécuritaire — moins de proprioception mais bonne technique"},{nom:"Squat avant barre",note:"Plus de quadriceps — dos plus vertical naturellement"},{nom:"Squat sumo",note:"Plus d'adducteurs — fémurs courts avantagés sur cet exercice"}],
erreurs:["Talons qui décollent — manque de mobilité de cheville à travailler","Genoux qui rentrent en dedans — signe de faiblesse des abducteurs","Dos qui s'arrondit — charge trop lourde"]},

{n:"Hack squat machine",s:"4",r:"10-12",rest:"90s",ch:"65-70%",cat:"principal",
morpho:"🦴 Fémurs longs : meilleure option que le squat classique — la machine réduit la compensation du dos.\n🦴 Fémurs courts : exercice confortable et très efficace pour les quadriceps.\n💡 Plus de quadriceps que la presse grâce à l'angle de la machine.",
tips:["Pieds à largeur des hanches ou légèrement plus écartés","Descente jusqu'à 90° minimum","Genoux dans l'axe des pieds","Dos plaqué contre le dossier","Ne pas verrouiller les genoux en haut"],
variantes:[{nom:"Presse à jambes pieds bas",note:"Plus de quadriceps — alternative si hack squat indisponible"},{nom:"Sissy squat",note:"Isolation quadriceps extrême — avancé"}],
erreurs:["Genoux qui rentrent en dedans","Amplitude insuffisante","Fesses qui décollent du siège"]},

{n:"Fentes avant haltères",s:"4",r:"10/jambe",rest:"75s",ch:"Modéré",cat:"principal",
morpho:"🦴 Fémurs longs : pas long pour maximiser l'activation des fessiers.\n🦴 Fémurs courts : quadriceps davantage sollicités avec un pas normal.\n💡 Longueur de foulée = résultat : grand pas = fessiers / petit pas = quadriceps.",
tips:["Pas long — genou avant dans l'axe du pied","Buste droit, regard frontal","Genou avant ne dépasse pas la pointe du pied","Pied arrière bien ancré sur la pointe","Descendre sans toucher le genou arrière au sol"],
variantes:[{nom:"Fentes marchées",note:"Plus dynamique — challenge équilibre et coordination"},{nom:"Fentes bulgares",note:"Version unilateral avancée — fessier très isolé"},{nom:"Fentes arrière",note:"Moins de stress genou — option si genoux fragiles"}],
erreurs:["Genou avant qui dépasse les orteils","Buste qui s'incline","Pas trop court"]},
],
{n:"Presse à jambes 45° pieds hauts",s:"4",r:"10-15",rest:"90s",ch:"70%",cat:"principal",
morpho:"🦴 Fémurs longs : MEILLEUR exercice jambes selon Delavier — le squat force un buste trop incliné vers l'avant avec des fémurs longs, créant une surcharge lombaire. La presse supprime ce problème anatomique.\n🦴 Fémurs courts : squat ou presse fonctionnent — les deux sont appropriés.\n🔩 Position des pieds détermine les muscles ciblés : hauts = fessiers+ischios+quadriceps / bas = quadriceps isolés / écartés = adducteurs + fessiers.",
tips:["Pieds à hauteur des épaules ou légèrement plus écartés","Amplitude complète — descendre jusqu'à un angle de 90° minimum","Genoux dans l'axe des pieds — ne jamais les laisser rentrer en dedans","Excentrique 3 secondes — pas de rebond en bas","Ne jamais décoller le bas du dos de la plateforme"],
variantes:[{nom:"Presse pieds bas",note:"Quadriceps isolés — moins de fessiers et d'ischios"},{nom:"Presse unilatérale",note:"Correction des asymétries gauche/droite"},{nom:"Hack squat guidé",note:"Plus de quadriceps, moins de sollicitation lombaire"}],
erreurs:["Décoller le bas du dos en bas du mouvement — risque lombaire grave","Genoux qui rentrent en dedans — risque ligamentaire","Verrouiller les genoux en haut — perte de tension et risque articulaire","Rebond en bas — perte du contrôle excentrique"]},

{n:"Leg extension machine",s:"3",r:"15",rest:"60s",ch:"60%",cat:"isolation",
morpho:"🦴 Tous morphotypes : isolation pure des quadriceps — exercice de finition universel après un mouvement de base.\n🦴 Fémurs longs : amplitude de flexion naturellement plus grande — exploiter pleinement l'extension.\n💡 La contraction isométrique 1-2 secondes en extension complète est indispensable pour la connexion neuromusculaire avec les quadriceps.",
tips:["Dos appuyé sur le dossier — lombaires en contact permanent","Contraction de 1-2 secondes en extension complète — c'est là que l'exercice est le plus efficace","Excentrique 3 secondes — maximiser le temps sous tension","Pointe des pieds vers soi pour plus d'activation du droit fémoral","15-20 reps en finisseur léger pour le pump"],
variantes:[{nom:"Leg extension unilatéral",note:"Correction des asymétries — commencer par la jambe faible"},{nom:"Sissy squat",note:"Quadriceps en étirement complet — version avancée"},{nom:"Terminal knee extension élastique",note:"Préventif du genou — activation VMO"}],
erreurs:["Amplitude insuffisante en bas — perd l'activation complète","Pas de contraction en haut — perd le bénéfice de l'isolation","Trop lourd — compensation avec le buste"]},

{n:"Squat goblet haltère",s:"3",r:"12",rest:"90s",ch:"Modéré",cat:"principal",
morpho:"🦴 Fémurs longs : l'haltère tenu devant agit comme contrepoids et permet de rester plus vertical qu'au squat classique — version accessible et sécuritaire.\n🦴 Fémurs courts : exercice confortable — la position naturelle est déjà favorable.\n💡 Version d'apprentissage du squat ou exercice d'échauffement avant la presse.",
tips:["Haltère tenu verticalement contre la poitrine — bras en V vers le bas","Descente contrôlée — cuisses parallèles au sol minimum","Genoux dans l'axe des pieds, légèrement en dehors","Talon bien ancré au sol — poids réparti sur tout le pied","Dos droit, regard frontal"],
variantes:[{nom:"Squat barre guidée Smith",note:"Sécuritaire — moins de proprioception mais bonne technique"},{nom:"Squat avant barre",note:"Plus de quadriceps — dos plus vertical naturellement"},{nom:"Squat sumo",note:"Plus d'adducteurs — fémurs courts avantagés sur cet exercice"}],
erreurs:["Talons qui décollent — manque de mobilité de cheville à travailler","Genoux qui rentrent en dedans — signe de faiblesse des abducteurs","Dos qui s'arrondit — charge trop lourde"]},
],

"Ischio-jambiers":[
{n:"Leg curl allongé excentrique",s:"4",r:"10-12",rest:"75s",ch:"Modéré",cat:"principal",
morpho:"🦴 Fémurs longs : renforcement ischios particulièrement important pour l'équilibre quadriceps/ischios — les fémurs longs créent un bras de levier plus important sur le genou.\n🦴 Fémurs courts : exercice utile pour le volume et la force.\n💡 Phase excentrique 3-4 secondes = méthode Gundill — maximise le recrutement musculaire, le gain de masse et la prévention tendinaire proximale.",
tips:["Phase excentrique de 3-4 secondes ABSOLUMENT — c'est le principe fondamental de Gundill","Contraction maximale en haut — serrer les fessiers","Ne pas laisser les hanches se soulever en cours de mouvement","Amplitude complète — extension quasi-totale en bas","Pause 1 seconde en haut avant l'excentrique"],
variantes:[{nom:"Leg curl assis",note:"Étirement différent — fessiers moins impliqués, ischios plus isolés"},{nom:"Leg curl debout unilatéral",note:"Correction des asymétries entre les jambes"},{nom:"Nordic curl",note:"Excentrique pur — très avancé et très efficace, excellent préventif"}],
erreurs:["Excentrique trop rapide — perd le principal bénéfice de l'exercice","Hanches qui se soulèvent — compensation lombaire","Amplitude partielle","Rebond en bas"]},

{n:"Romanian deadlift haltères",s:"3",r:"10-12",rest:"90s",ch:"60%",cat:"principal",
morpho:"🦴 Fémurs longs : amplitude naturellement grande — l'étirement des ischios est ressenti plus tôt dans le mouvement. Progression prudente des charges.\n🦴 Fémurs courts : amplitude plus réduite — descendre légèrement plus bas pour atteindre l'étirement optimal.\n💡 Lordose naturelle OBLIGATOIRE — si le dos s'arrondit, la charge est trop lourde ou la souplesse insuffisante.",
tips:["Dos PLAT — lordose naturelle maintenue tout au long du mouvement","Haltères glissent le long des jambes — rester proche du corps","Descendre jusqu'à sentir l'étirement des ischios — mi-tibia maximum","Genoux légèrement fléchis et FIXES — ils ne bougent pas","Remonter en poussant les hanches vers l'avant — pas en tirant avec le dos"],
variantes:[{nom:"Romanian deadlift barre",note:"Plus de charge possible — même pattern de mouvement"},{nom:"Romanian deadlift unilatéral",note:"Correction des asymétries + proprioception"},{nom:"Good morning barre légère",note:"Même chaîne postérieure — charge sur les trapèzes"}],
erreurs:["Arrondir le dos — blessure lombaire grave et certaine","Descendre trop bas — perd la lordose naturelle","Genoux qui bougent en cours de mouvement","Regarder vers le bas — le cou se fléchit"]},

{n:"Hip thrust barre",s:"4",r:"10-15",rest:"90s",ch:"Charge lourde",cat:"principal",
morpho:"🦴 Fémurs longs : avantage mécanique sur cet exercice — le levier naturel favorise l'extension complète de la hanche.\n🦴 Fémurs courts : exercice confortable et efficace — position naturellement bonne.\n💡 Débutant : commencer sans barre, puis haltère sur le ventre, puis barre. L'extension de hanche et non l'hyperextension lombaire est l'objectif.",
tips:["Omoplates sur le banc — pas les cervicales","Poussée explosive vers le haut — contraction maximale des fessiers en haut","Menton rentré, regard vers le plafond pendant le mouvement","Pieds à largeur des hanches, pointe légèrement vers l'extérieur","Contraction isométrique 1-2 secondes en haut"],
variantes:[{nom:"Hip thrust poids du corps",note:"Débutant — apprentissage du pattern de mouvement"},{nom:"Hip thrust machine",note:"Charge guidée — bonne progression"},{nom:"Glute bridge au sol",note:"Version sol — débutant absolu ou échauffement"}],
erreurs:["Hyperextension lombaire en haut — les lombaires travaillent au lieu des fessiers","Poussée insuffisante — ne pas aller en extension complète de hanche","Pieds trop proches ou trop loin — modifie l'activation musculaire"]},
],

"Fessiers":[
{n:"Fentes marchées haltères",s:"4",r:"12/jambe",rest:"60s",ch:"Modéré",cat:"principal",
morpho:"🦴 Fémurs longs : foulée longue pour maximiser l'activation des fessiers — les fémurs longs créent un avantage naturel sur la longueur de foulée.\n🦴 Fémurs courts : foulée normale — les quadriceps seront davantage sollicités.\n💡 Longueur de foulée = résultat : pas long = fessiers / pas court = quadriceps.",
tips:["Pas long pour maximiser l'activation des fessiers","Genou avant ne dépasse pas la pointe du pied","Buste droit, regard fixe devant","Pied avant bien ancré avant de pousser pour avancer","Alterner les jambes ou faire une jambe complète puis l'autre"],
variantes:[{nom:"Fentes statiques",note:"Moins de coordination requise — apprentissage du mouvement"},{nom:"Fentes bulgares",note:"Unilateral avancé — fessier très isolé"},{nom:"Fentes latérales",note:"Adducteurs + fessier moyen — plan frontal"}],
erreurs:["Genou avant qui dépasse les orteils — stress sur la rotule","Buste qui s'incline vers l'avant","Pas trop court — quadriceps dominent au détriment des fessiers"]},

{n:"Abduction hanche poulie basse",s:"3",r:"15-20",rest:"45s",ch:"Léger",cat:"isolation",
morpho:"🦴 Tous morphotypes : fessier moyen et petit fessier — souvent négligés mais essentiels pour la stabilité du bassin lors de tous les exercices unilatéraux.\n📐 Hanches larges : le fessier moyen est souvent naturellement développé — exercice de maintien plutôt que de construction.\n📐 Hanches étroites : exercice constructif important pour l'équilibre visuel et la stabilité.",
tips:["Mouvement en arc dans le plan frontal strict","Contraction 1 seconde en haut","Excentrique contrôlé — résister à la gravité","Corps légèrement incliné vers l'avant pour cibler davantage le fessier moyen","Amplitude maximale dans l'axe — pas en avant"],
variantes:[{nom:"Abduction machine assis",note:"Charge plus lourde possible — bonne progression"},{nom:"Clamshell élastique",note:"Rotation externe de hanche — fessier moyen profond"},{nom:"Fire hydrant à 4 pattes",note:"Sans équipement — très accessible"}],
erreurs:["Compenser avec le buste","Amplitude en avant du plan frontal — hip flexors au lieu des fessiers","Trop lourd — perd le contrôle"]},
],

"Abdominaux":[
{n:"Planche avant isométrique",s:"4",r:"30-60s",rest:"45s",ch:"Corps",cat:"gainage",
morpho:"🦴 Tous morphotypes : exercice fondamental universel — le transverse profond est indispensable pour la protection lombaire lors de tous les exercices lourds (Delavier). Base absolue avant d'augmenter les volumes.\n💡 Progresser en soulevant successivement un bras ou une jambe une fois les 60 secondes atteintes facilement.",
tips:["Corps aligné — tête, épaules, hanches et chevilles en ligne droite","Contracter l'abdomen comme si on allait recevoir un coup de poing","Ne pas retenir sa respiration — respiration diaphragmatique maintenue","Ne pas laisser les hanches monter ou descendre","Progresser en soulevant un bras ou une jambe"],
variantes:[{nom:"Planche sur les mains",note:"Plus de stabilité — bonne progression"},{nom:"Planche dynamique touches d'épaules",note:"Anti-rotation — difficulté supérieure"},{nom:"Planche latérale",note:"Obliques + stabilisateurs latéraux — complémentaire"}],
erreurs:["Hanches qui montent — n'est plus un gainage mais une pirouette","Corps en angle au niveau des hanches","Retenir sa respiration sous effort"]},

{n:"Crunch contrôlé",s:"4",r:"15-20",rest:"45s",ch:"Corps",cat:"principal",
morpho:"🦴 Tous morphotypes : technique universelle. BAS DU DOS AU SOL est le critère absolu — si le bas du dos décolle, c'est le PSOAS qui travaille et non les abdominaux (Delavier : erreur fondamentale des crunches mal exécutés).\n💡 Mains aux tempes, jamais sur la nuque.",
tips:["Bas du dos COLLÉ au sol — critère absolu de bonne exécution","Souffler fort à la contraction pour vider les poumons","Enrouler vertèbre par vertèbre — pas une bascule de bassin","Regarder vers le plafond, pas vers les genoux","Genoux fléchis à 90°, pieds à plat sur le sol"],
variantes:[{nom:"Crunch poulie haute",note:"Tension constante — bon pour les niveaux avancés"},{nom:"Crunch oblique alterné",note:"Obliques + transverse — rotation contrôlée"},{nom:"Crunch double contraction",note:"Bascule du pelvis + crunch simultané — version avancée"}],
erreurs:["Bas du dos qui décolle — psoas travaille au lieu des abdominaux","Tirer sur la nuque avec les mains — risque cervical","Amplitude excessive avec lombaires décollées","Vitesse trop rapide — perd le contrôle excentrique"]},

{n:"Relevé de jambes suspendu",s:"3",r:"12-15",rest:"60s",ch:"Corps",cat:"principal",
morpho:"🦴 Tous morphotypes : bas abdominaux + iliopsoas. SUSPENDU à une barre ou lombaires collées au sol OBLIGATOIREMENT — jambes en l'air librement sans enroulement du bassin = le psoas travaille, pas les abdominaux (Delavier).\n🦴 Bras longs : prise facile sur barre fixe — bonne option suspension.",
tips:["Enrouler le BASSIN en montant — c'est ce mouvement qui active les bas-abdominaux","Descente contrôlée 3 secondes — ne pas laisser tomber les jambes","Jambes tendues si niveau avancé, genoux fléchis si débutant","Ne pas se balancer pour se propulser","Regard fixe devant pour la stabilité"],
variantes:[{nom:"Knee raise suspendu",note:"Version débutant — genoux fléchis, moins de charge"},{nom:"Relevé jambes au sol lombaires pressées",note:"Plus accessible — lombaires collées au sol"},{nom:"Dragon flag",note:"Version très avancée — chaîne postérieure totale"}],
erreurs:["Pas d'enroulement du bassin — psoas travaille seul","Balancement du corps pour se propulser","Amplitude insuffisante"]},

{n:"Gainage latéral",s:"3",r:"30-45s",rest:"45s",ch:"Corps",cat:"gainage",
morpho:"🦴 Tous morphotypes : obliques + stabilisateurs latéraux. Indispensable pour la stabilité du bassin lors des exercices unilatéraux et la prévention des blessures lombaires (Gundill).\n💡 À combiner avec la planche frontale pour un gainage complet.",
tips:["Corps en ligne droite de la tête aux pieds","La hanche ne doit pas descendre ou monter","Regard fixe devant pour maintenir l'alignement","Progresser en soulevant le bras ou la jambe supérieure","Version débutant : genoux au sol"],
variantes:[{nom:"Gainage latéral avec abduction",note:"Fessiers + obliques — version combinée"},{nom:"Copenhagen plank",note:"Adducteurs + obliques — version très avancée"},{nom:"Side bend câble",note:"Obliques avec charge — version dynamique"}],
erreurs:["Hanche qui descend — compensation courante","Corps en angle au niveau des hanches","Retenir la respiration sous effort"]},
],

"Lombaires":[
{n:"Hyperextension 45°",s:"4",r:"15",rest:"60s",ch:"Corps",cat:"correctif",
morpho:"🦴 Tous morphotypes : érecteurs spinaux + ischios + fessiers. Lien fondamental de la chaîne postérieure. Toujours avec abdos actifs (Delavier). Limite à l'HORIZONTALE ABSOLUMENT — dépasser crée une compression discale.\n🦴 Fémurs longs : très bonne amplitude naturelle sur cet exercice.",
tips:["Lordose naturelle maintenue — ne pas arrondir le dos","Amplitude JUSQU'À L'HORIZONTAL UNIQUEMENT — jamais au-delà","Tempo lent — pas d'élan en bas","Haltère sur la poitrine pour progresser quand le poids du corps devient trop facile","Contracter les abdominaux pour protéger les lombaires"],
variantes:[{nom:"Superman au sol",note:"Débutant — sans appareil, bonne initiation"},{nom:"Good morning barre légère",note:"Même chaîne avec charge sur les trapèzes"},{nom:"Suspension à la barre fixe",note:"Décompression passive en fin de séance"}],
erreurs:["Dépasser l'horizontal — compression discale grave","Élan en bas — perte du contrôle excentrique","Arrondir le dos en bas"]},

{n:"Good morning barre légère",s:"3",r:"12",rest:"90s",ch:"Très léger",cat:"correctif",
morpho:"🦴 Tous morphotypes : ischios + lombaires + érecteurs. Lordose naturelle OBLIGATOIRE. Jamais lourd avant maîtrise complète (Delavier). Excellent renforcement préventif de la chaîne postérieure.\n🦴 Fémurs longs : amplitude naturellement grande — attention à la lordose en position basse.",
tips:["Barre basse sur les trapèzes — pas sur la nuque","Genoux légèrement fléchis et FIXES pendant tout le mouvement","Incliner le buste à 45° maximum — lordose conservée","Dos PLAT — regard vers l'horizon","Remonter en poussant les hanches vers l'avant"],
variantes:[{nom:"Good morning assis",note:"Isolation des lombaires — moins d'ischios impliqués"},{nom:"Romanian deadlift",note:"Même chaîne — haltères plus accessible pour débutants"},{nom:"Hyperextension machine",note:"Version guidée — bonne option apprentissage"}],
erreurs:["Arrondir le dos — blessure lombaire grave certaine","Trop de charge avant maîtrise","Genoux verrouillés — risque tendineux","Descente au-delà de 45° — perd la lordose"]},
],

"Mollets":[
{n:"Extension mollets debout machine",s:"5",r:"15-20",rest:"60s",ch:"Modéré",cat:"principal",
morpho:"🦴 Tous morphotypes : volume ÉLEVÉ obligatoire pour les mollets — fibres lentes à résistance élevée (Gundill). Étirement COMPLET en bas est le facteur clé. 5 séries minimum pour un stimulus suffisant.\n🦴 Mollets courts naturellement : travailler en amplitude maximale et varier la position des pieds systématiquement.",
tips:["Amplitude TOTALE — talon le plus bas possible en bas de chaque répétition","Pause 2 secondes en bas (étirement maximal) + 1-2 secondes en haut (contraction)","Varier la position des pieds — neutres / en dehors / en dedans — pour varier l'activation","15-25 répétitions = zone optimale pour les fibres lentes des mollets","Pas de rebond en bas — travail excentrique pur"],
variantes:[{nom:"Mollets debout au sol haltères",note:"Sans machine — haltères dans les mains"},{nom:"Mollets incliné presse",note:"Étirement supérieur — très efficace"},{nom:"Mollets unilatéral",note:"Correction des asymétries + amplitude supérieure"}],
erreurs:["Amplitude partielle — le bénéfice vient de l'étirement complet","Rebond en bas — perd l'excentrique et les résultats","Vitesse excessive — les fibres lentes nécessitent du tempo"]},

{n:"Extension mollets assis machine",s:"4",r:"15-20",rest:"60s",ch:"Modéré",cat:"isolation",
morpho:"🦴 Tous morphotypes : SOLÉAIRE (mollet profond). Un mollet ne sera jamais complet sans cet exercice (Gundill) — les fibres lentes du soléaire ne répondent qu'au travail genoux fléchis à 90°. L'exercice debout ne le cible pas.",
tips:["Genoux à 90° en position assise — position stricte","Amplitude complète en bas et en haut","Pause en bas et en haut identique à l'exercice debout","Tempo lent — les fibres lentes du soléaire ont besoin de temps sous tension","Progresser doucement — le soléaire est résistant à l'hypertrophie"],
variantes:[{nom:"Donkey calf raise",note:"Étirement augmenté — version avancée"},{nom:"Mollets assis haltères posés sur les genoux",note:"Sans machine — accessible"}],
erreurs:["Amplitude partielle — le soléaire nécessite l'étirement complet","Négliger cet exercice — les mollets resteront visuellement incomplets"]},
],

"Avant-bras":[
{n:"Curl poignet barre",s:"3",r:"15-20",rest:"45s",ch:"Léger",cat:"isolation",
morpho:"🦴 Tous morphotypes : fléchisseurs du poignet — sous-développés si les straps sont utilisés systématiquement sans travail spécifique (Gundill). L'usage permanent des straps retarde le développement de la force de prise et des avant-bras.\n💡 À alterner avec les extensions de poignet pour un équilibre fléchisseurs/extenseurs.",
tips:["Avant-bras posés sur les cuisses ou un banc — position stable","Amplitude complète — extension totale du poignet en bas","Mouvement lent et contrôlé","Alterner avec les extensions de poignet pour l'équilibre"],
variantes:[{nom:"Curl poignet haltère unilatéral",note:"Correction des asymétries"},{nom:"Extension poignet",note:"Extenseurs indispensables — équilibre avant/après-bras"},{nom:"Rotation poignet pronosupination",note:"Avant-bras complet — rotateurs internes et externes"}],
erreurs:["Trop lourd — le coude compense","Amplitude insuffisante"]},

{n:"Farmer walk",s:"3",r:"30-40m",rest:"90s",ch:"Lourd",cat:"principal",
morpho:"🦴 Tous morphotypes : force de préhension + avant-bras + trapèzes. Meilleur exercice fonctionnel pour les avant-bras (Gundill). Améliore la prise pour tous les exercices de tirage. Résultats visibles en 4-6 semaines.\n🦴 Bras longs : prise naturellement longue — amplitude de tenue favorable.",
tips:["Haltères aussi lourds que ta limite de prise le permet","Pas réguliers et équilibrés — sans balancement du corps","Dos droit, épaules hautes et stables","Respiration régulière tout au long","Progresser en distance ou en charge"],
variantes:[{nom:"Dead hang à la barre fixe",note:"Isométrique — force de prise pure"},{nom:"Plate pinch 2 doigts",note:"Force de pincement — complète la prise en crochet"},{nom:"Captains of crush gripper",note:"Outil spécifique force de prise — très efficace"}],
erreurs:["Trop léger — pas de stimulus suffisant sur la prise","Dos qui s'incline latéralement — risque lombaire"]},
],

"Trapèzes":[
{n:"Haussements épaules haltères",s:"4",r:"12-15",rest:"60s",ch:"70%",cat:"principal",
morpho:"🦴 Tous morphotypes : chef supérieur des trapèzes. À équilibrer ABSOLUMENT avec le face pull et l'oiseau pour éviter de renforcer une antépulsion (Gundill). Hypertrophie rapide et visible.\n📐 Épaules avec antépulsion : à modérer — les trapèzes supérieurs participent à l'antépulsion si surentraînés sans correctifs.",
tips:["Mouvement VERTICAL PUR — aucune rotation des épaules (risque articulaire sous-acromial)","Contraction isométrique 1-2 secondes en haut","Descente lente — étirement complet en bas","Haltères préférés pour la liberté de mouvement"],
variantes:[{nom:"Haussements barre",note:"Plus de charge possible — même principe vertical"},{nom:"Haussements poulie",note:"Tension constante sur tout l'arc"},{nom:"Haussements barre derrière le dos",note:"Chef supérieur + trapèzes moyens"}],
erreurs:["Rotation des épaules — risque articulaire sous-acromial","Amplitude partielle en bas — perd l'étirement","Utiliser l'élan des genoux pour compenser"]},
],
};

// Compatibilité modal exercice — D est un miroir de EX
const D={};
Object.entries(EX).forEach(([,exercices])=>{exercices.forEach(ex=>{D[ex.n]={m:ex.morpho||"",t:ex.tips||[],v:(ex.variantes||[]),e:ex.erreurs||[],prog:ex.prog||""};});});
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
      debutant:"Séries classiques 3×8-12, tempo contrôlé (2s montée, 2s contraction, 3s descente selon Gundill), exercice unique par muscle, progression linéaire +2.5kg toutes les 2 semaines",
      intermediaire:"Pyramidal (12-10-8-6 avec charges croissantes), super-sets agoniste/antagoniste, tempo excentrique 4s (méthode Gundill), drop-sets en fin de séance",
      avance:"5×5 force, méthode bulgare (80-85-90-95% RM), pré-fatigue isolation+composé, rest-pause, séries de 100 légères pour le pump, dégressif (3 charges en 1 série), wave loading"
    };

    const pathosAdapt=form.pathologies.filter(p=>p!=="Aucune");
    const pathoRules=pathosAdapt.length>0?`
ADAPTATIONS PATHOLOGIQUES OBLIGATOIRES (basées sur les livres Delavier):
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

    return `Tu es un coach sportif expert BPJEPS spécialisé en musculation et biomécanique. Ton niveau d'expertise est basé sur les méthodes Delavier et Gundill.

${histCtx}

PROFIL COMPLET:
- Nom: ${form.prenom||"Utilisateur"} | Âge: ${form.age} ans | Sexe: ${form.sexe}
- Poids: ${form.poids}kg | Taille: ${form.taille}cm | IMC: ${imc}
- Niveau: ${form.niveau} | Objectif: ${form.objectif} (${form.objectifPrecis||"prise de masse générale"})
- Jours d'entraînement disponibles: ${(form.jours||[]).join(", ")||"à définir"}
- Matériel: ${(form.materiel||[]).join(", ")||"salle complète"}
- Pathologies: ${pathosAdapt.length>0?pathosAdapt.join(", "):"aucune"}
- Cycle n°: ${cycleNum}
- Photos analysées: ${nbPhotos} (${[photos.face?"face":"",photos.dos?"dos":"",photos.profil?"profil de côté":""].filter(Boolean).join(", ")||"aucune"})
- Corriger les points faibles morphologiques: ${corrigerFaibles?"OUI — priorité absolue aux groupes en retard":"NON — programme équilibré"}

MÉTHODES D'INTENSIFICATION À UTILISER (selon le niveau):
${methodesByLevel[form.niveau]||methodesByLevel.debutant}
Pour le cycle ${cycleNum}: ${cycleNum===1?"méthodes de base uniquement":cycleNum===2?"introduire super-sets et pyramidal":cycleNum>=3?"drop-sets, rest-pause et méthodes avancées si niveau le permet":"méthodes progressives"}

RÈGLES MORPHOLOGIQUES DELAVIER OBLIGATOIRES (applique-les selon l'analyse des photos):
1. HUMÉRUS LONGS: haltères OBLIGATOIRES, jamais la barre au développé couché ou épaules
2. HUMÉRUS COURTS: barre ou haltères selon préférence, plus de charge possible
3. FÉMURS LONGS: presse jambes obligatoire, pas de squat classique (buste trop incliné)
4. FÉMURS COURTS: squat classique autorisé
5. CLAVICULES LARGES: avantage sur les tractions, prise large
6. CAGE THORACIQUE PLATE: pull-over PRIORITAIRE en début de séance pectoraux
7. ANTÉPULSION ÉPAULES: face pull OBLIGATOIRE chaque séance, avant tout mouvement de poussée
8. DÉBUTANT: 3 séries max/exercice, 10 séries max/séance, corps entier chaque séance
9. INTERMÉDIAIRE: split haut/bas ou poussée/tirage, 4 séries, 15-20 séries/séance
10. AVANCÉ: split complet, 4-5 séries, 20-25 séries/séance, méthodes intensification

ANALYSE PHYSIQUE DEPUIS LES PHOTOS (si photos fournies):
- Identifier les groupes musculaires en retard visuel (pec, dos, épaules, bras, jambes)
- Identifier les déséquilibres posturaux (antépulsion, hyperlordose, scoliose)
- Identifier les points forts (muscles déjà bien développés)
- Adapter le volume selon les retards: +1 série et +1 exercice sur les groupes faibles
${corrigerFaibles?"- PRIORITÉ CORRECTION: augmenter le volume des groupes en retard de 30%":""}

${pathoRules}

Génère un programme complet sur 6-8 semaines adapté aux ${(form.jours||[]).length||3} jours d'entraînement.

Réponds UNIQUEMENT avec ce JSON valide (aucun texte avant ou après, aucun markdown):
{
  "analyse_physique": {
    "points_forts": ["muscle1", "muscle2"],
    "points_faibles": ["muscle1", "muscle2"],
    "posture": "description courte de la posture",
    "morphotype": "ectomorphe|mésomorphe|endomorphe|combiné",
    "humerus": "courts|moyens|longs",
    "femurs": "courts|moyens|longs",
    "cage_thoracique": "plate|moyenne|large",
    "recommandation_principale": "phrase clé d'adaptation"
  },
  "programme": {
    "titre": "string",
    "methode": "nom de la méthode d'entraînement utilisée",
    "duree_semaines": 8,
    "seances": [
      {
        "jour": "Lundi|Mercredi|Vendredi",
        "focus": "Groupe musculaire principal",
        "duree": "55 min",
        "intensite": "leger|modere|intense|maximal",
        "type_seance": "corps_entier|haut_corps|bas_corps|poussee|tirage|force|hypertrophie",
        "exercices": [
          {
            "nom": "nom exercice",
            "ordre": 1,
            "series": "4",
            "reps": "8-10",
            "repos": "90s",
            "charge": "70%1RM",
            "tempo": "2-1-3",
            "methode_intensification": "classique|pyramidal|superset|drop-set|rest-pause|5x5",
            "superset_avec": null,
            "morpho_tip": "conseil spécifique à la morphologie de cette personne",
            "technique": "1 conseil technique clé",
            "pourquoi": "pourquoi cet exercice pour ce profil"
          }
        ],
        "note_seance": "conseil global pour cette séance"
      }
    ],
    "progression": {
      "semaines_1_2": "description",
      "semaines_3_4": "description",
      "semaines_5_6": "description",
      "semaines_7_8": "description"
    }
  },
  "correction_faibles": {
    "groupes_prioritaires": ["muscle1", "muscle2"],
    "exercices_correctifs": ["exercice1 - raison", "exercice2 - raison"],
    "frequence_supplementaire": "description"
  },
  "nutrition": {
    "cal": 2500,
    "p": 150,
    "g": 300,
    "l": 80,
    "conseil": "conseil nutrition personnalisé selon poids et objectif",
    "repartition": "conseil sur la répartition des repas"
  },
  "morpho": {
    "resume": "résumé de l'analyse morphologique complète"
  }
}`;
  };

  const lancerIA=async()=>{
    setLoadIA(true);
    const msgs=[
      "📸 Analyse morphologique des photos…",
      "🦴 Détection des proportions osseuses…",
      "💪 Identification des points forts et faibles…",
      "📋 Construction du programme personnalisé…",
      "⚡ Application des méthodes Delavier…",
    ];
    let mi=0;
    setLoadMsg(msgs[0]);
    const interval=setInterval(()=>{mi=(mi+1)%msgs.length;setLoadMsg(msgs[mi]);},2200);
    try{
      const content=[];
      // ─── Envoyer les photos avec l'analyse ───
      const photosSent=[];
      if(photos.face){
        const b64=photos.face.split(",")[1];
        const mt=photos.face.split(";")[0].split(":")[1];
        content.push({type:"image",source:{type:"base64",media_type:mt,data:b64}});
        photosSent.push("face");
      }
      if(photos.dos){
        const b64=photos.dos.split(",")[1];
        const mt=photos.dos.split(";")[0].split(":")[1];
        content.push({type:"image",source:{type:"base64",media_type:mt,data:b64}});
        photosSent.push("dos");
      }
      if(photos.profil){
        const b64=photos.profil.split(",")[1];
        const mt=photos.profil.split(";")[0].split(":")[1];
        content.push({type:"image",source:{type:"base64",media_type:mt,data:b64}});
        photosSent.push("profil");
      }
      content.push({type:"text",text:buildP()});
      const res=await fetch("/api/generate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-haiku-4-5",
          max_tokens:4000,
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
      if(jStart===-1||jEnd===-1||jEnd<=jStart) throw new Error("Pas de JSON détecté");
      jsonStr=jsonStr.substring(jStart,jEnd+1);
      let parsed;
      try{parsed=JSON.parse(jsonStr);}
      catch(pe){throw new Error("JSON mal formé: "+pe.message.substring(0,50));}
      if(!parsed.programme) throw new Error("Clé 'programme' absente");
      if(!Array.isArray(parsed.programme.seances)||parsed.programme.seances.length===0) throw new Error("Aucune séance générée");
      const np={
        titre:parsed.programme.titre||"Mon programme",
        type:"ia",
        methode:parsed.programme.methode||"Classique",
        morpho:parsed.morpho||{},
        analyse:parsed.analyse_physique||{},
        correction:parsed.correction_faibles||{},
        numero:cycles.length+1,
        objectif:form.objectif,
        nutrition:parsed.nutrition||{},
        dateDebut:new Date().toLocaleDateString("fr-FR"),
        duree_semaines:parsed.programme.duree_semaines||8,
        progression:parsed.programme.progression||{},
        jours:parsed.programme.seances.map((s,i)=>({
          id:i+1,
          nom:s.jour||`Séance ${i+1}`,
          focus:s.focus||"",
          duree:s.duree||"50 min",
          intensite:s.intensite||"modere",
          type_seance:s.type_seance||"corps_entier",
          note_seance:s.note_seance||"",
          exercices:(s.exercices||[]).map(ex=>({
            ...ex,
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
      setPView("today");
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
            {profil.prenom?<>Bonjour, <span style={{fontWeight:500,color:C.blue}}>{profil.prenom}</span></>:<>Bonjour <span style={{fontWeight:300,color:C.mid}}>👋</span></>}
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
                  <Row style={{justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:300,color:"#3b82f6",letterSpacing:-1,lineHeight:1}}>{lastWeight?.v}<span style={{fontSize:12,color:C.mid,fontFamily:"'Inter',sans-serif",fontWeight:400}}> kg</span></div>
                      <div style={{fontSize:10,color:C.mid,marginTop:2}}>Dernière pesée · {lastWeight?.date}</div>
                    </div>
                    {diff&&<div style={{textAlign:"right",paddingBottom:4}}>
                      <div style={{fontSize:20,fontWeight:300,color:parseFloat(diff)>0?(profil.objectif==="poids"?C.red:C.green):(profil.objectif==="poids"?C.green:C.red),lineHeight:1}}>{parseFloat(diff)>0?"+":""}{diff}<span style={{fontSize:11}}>kg</span></div>
                      <div style={{fontSize:9,color:C.mid,marginTop:1}}>depuis le début</div>
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
                              {showDate&&<text x={x} y={H-1} textAnchor={i===0?"start":i===weightLog.length-1?"end":"middle"} fontSize="7" fill="#a0b4cc" fontFamily="Inter,sans-serif">{w.date}</text>}
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
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
                    }} style={{padding:"11px 14px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:9,color:"#3b82f6",cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"}}>✓ OK</button>
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
            {icon:"📊",l:"Progression",sub:"Voir mes séances",fn:()=>{setTab("program");setPView("today");}},
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
              <Lbl style={{marginBottom:4}}>Cycle {prog.numero||1} · {prog.duree_semaines||6} semaines</Lbl>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:500}}>{prog.titre}</div>
              {prog.methode&&<div style={{fontSize:10,color:"#3b82f6",marginTop:2,fontWeight:500}}>⚡ {prog.methode}</div>}
              {prog.dateDebut&&<div style={{fontSize:10,color:C.mid,marginTop:2}}>Démarré le {prog.dateDebut}</div>}
            </div>
            {jR!==null&&jR<=7&&(
              <div style={{padding:"5px 10px",background:"rgba(224,136,58,0.15)",border:"1px solid rgba(224,136,58,0.3)",borderRadius:8,fontSize:10,color:"#f97316",fontWeight:500,flexShrink:0}}>J-{jR}</div>
            )}
          </Row>
          {/* ─── Analyse physique IA ─── */}
          {prog.analyse&&(prog.analyse.points_forts?.length>0||prog.analyse.points_faibles?.length>0)&&(
            <div style={{marginBottom:12,padding:"10px 12px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10}}>
              <div style={{fontSize:9,color:"#3b82f6",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>🔬 Analyse morphologique IA</div>
              {prog.analyse.morphotype&&<div style={{fontSize:11,color:C.mid,marginBottom:6,fontStyle:"italic"}}>Morphotype : <span style={{color:C.text,fontWeight:500}}>{prog.analyse.morphotype}</span> · Humérus : {prog.analyse.humerus||"?"} · Fémurs : {prog.analyse.femurs||"?"}</div>}
              {prog.analyse.posture&&<div style={{fontSize:10,color:C.mid,marginBottom:8,padding:"6px 8px",background:"rgba(249,115,22,0.06)",borderRadius:6}}>📐 Posture : {prog.analyse.posture}</div>}
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
              {prog.correction.frequence_supplementaire&&<div style={{fontSize:10,color:C.mid,marginTop:3}}>{prog.correction.frequence_supplementaire}</div>}
            </div>
          )}
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
                    {[{l:"Séries",v:ex.series},{l:"Reps",v:ex.reps},{l:"Repos",v:ex.repos},{l:"Charge",v:ex.charge}].filter(s=>s.v).map(s=>(
                      <div key={s.l} style={{padding:"5px 10px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:8,textAlign:"center",minWidth:52}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,color:"#3b82f6",fontWeight:400}}>{s.v}</div>
                        <div style={{fontSize:9,color:C.mid,marginTop:1}}>{s.l}</div>
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
                          <div style={{fontSize:9,color:C.mid,marginBottom:4,fontWeight:500}}>{p.l}</div>
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
                              <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:300,color:"#3b82f6",lineHeight:1}}>{vals[vals.length-1]}<span style={{fontSize:9,color:C.mid,marginLeft:2}}>kg dernier</span></div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontSize:13,fontWeight:400,color:diff>=0?C.green:C.red}}>{diff>=0?"+":""}{diff.toFixed(1)}kg</div>
                                <div style={{fontSize:8,color:C.mid}}>depuis début</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontSize:13,fontWeight:400,color:C.gold}}>🏆 {best}kg</div>
                                <div style={{fontSize:8,color:C.mid}}>record</div>
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
                                  {(i===0||i===hist.length-1)&&<text x={x} y={H-1} textAnchor={i===0?"start":"end"} fontSize="6.5" fill="#a0b4cc" fontFamily="Inter">{h.date}</text>}
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
                          <span style={{color:C.mid}}>{h.date}</span>
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
          <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,fontSize:12,color:C.mid,marginBottom:14,lineHeight:1.6}}>
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
          <div style={{padding:"8px 10px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:7,fontSize:11,color:C.mid,marginBottom:10,lineHeight:1.6}}>Exercices correctifs = renforcement uniquement. Consultez un kiné pour tout diagnostic.</div>
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
            <div key={m.id} onClick={()=>setForm(f=>({...f,materiel:f.materiel.includes(m.id)?f.materiel.filter(x=>x!==m.id):[...f.materiel,m.id]}))} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:form.materiel.includes(m.id)?"rgba(59,130,246,0.08)":C.s2,border:`1px solid ${form.materiel.includes(m.id)?"#3b82f6":C.s3}`,borderRadius:10}}>
              <div style={{fontSize:20,marginBottom:4}}>{m.i}</div><div style={{fontSize:11,fontWeight:400}}>{m.l}</div>
            </div>
          ))}</G2>
          {/* ─── Option corriger les points faibles ─── */}
          <div onClick={()=>setCorrigerFaibles(v=>!v)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:corrigerFaibles?"rgba(59,130,246,0.06)":"#f8fafc",border:`0.5px solid ${corrigerFaibles?"#3b82f6":"#dce8f4"}`,borderRadius:10,cursor:"pointer",marginTop:10,transition:"all .15s"}}>
            <div style={{width:20,height:20,borderRadius:5,background:corrigerFaibles?"#3b82f6":"transparent",border:`1.5px solid ${corrigerFaibles?"#3b82f6":"#a0b4cc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
              {corrigerFaibles&&<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:500,color:C.text}}>Corriger mes points faibles</div>
              <div style={{fontSize:10,color:C.mid,marginTop:1}}>L'IA priorisera les groupes musculaires en retard détectés sur les photos</div>
            </div>
          </div>
          {form.materiel.length===0&&<div style={{fontSize:11,color:C.red,marginBottom:8,marginTop:6}}>* Sélectionne au moins un équipement</div>}
          <Btn disabled={form.materiel.length===0} onClick={lancerIA} style={{marginTop:10}}>🚀 Générer mon programme IA</Btn>
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
              <div style={{padding:"9px 11px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,fontSize:11,color:C.mid,marginBottom:12,lineHeight:1.6}}>Base Open Food Facts · 3 millions de produits</div>
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
        <button onClick={()=>push("🔔","Test réussi !","Les notifications fonctionnent correctement.")} style={{background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:7,padding:"7px 14px",color:C.gold,cursor:"pointer",fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:700}}>Tester les notifications</button>
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
            <Btn onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>✨ Générer mon programme IA</Btn>
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
        
        
        {progView==="creer"&&<div style={{padding:"0 15px"}}>
          <Box>
            <Lbl>Mon programme</Lbl>
            {prog?(
              <div>
                <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:9,marginBottom:12}}>
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
                <Btn onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>✨ Nouveau programme IA</Btn>
                <div style={{textAlign:"center",marginTop:4}}>
                  <span onClick={()=>{setCreateStep(0);setNewP({nom:"",jours:[],seances:{}});}} style={{fontSize:11,color:C.mid,cursor:"pointer",textDecoration:"underline",textDecorationStyle:"dotted"}}>Créer manuellement</span>
                </div>
              </div>
            ):(
              <div>
                <div style={{textAlign:"center",padding:"24px 0 8px"}}>
                  <div style={{fontSize:36,marginBottom:8}}>🤖</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:400,color:"#0f1a2e",marginBottom:4}}>Programme sur-mesure</div>
                  <div style={{fontSize:12,color:C.mid,lineHeight:1.5,marginBottom:20}}>Obtenez un programme 100% adapté à votre morphologie, niveau et objectifs grâce à l'analyse IA</div>
                </div>
                <Btn onClick={()=>{if(!premium)setPaywall(true);else setProgView("analyse");}}>✨ Générer mon programme IA</Btn>

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
            cursor:"pointer",
            transition:"all .15s",
          }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tab==="profile"?"#3b82f6":"#a0b4cc"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></button>
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
