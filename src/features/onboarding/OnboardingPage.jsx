import { useState } from"react";
import { ID } from"../../components/ui/Icon.jsx";
import useScrollTop from"../../hooks/useScrollTop.js";
import { C, FONT, SERIF, NUM as NUM_TOKEN } from"../../data/constants.js";

// ─── FONT TOKENS (from mockup) ──────────────────────────────────────────

// Alias locaux → tokens centraux
const DISPLAY = FONT;
const NUM = NUM_TOKEN;

// ─── ICON ───────────────────────────────────────────────────────────────
function Icon({name,size=18,color='currentColor',stroke=1.6}){
  const p={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:color,strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round'};
  const paths={
    arrowR:<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    arrowL:<path d="m15 18-6-6 6-6"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    minus:<path d="M5 12h14"/>,
    weight:<><circle cx="12" cy="6" r="3"/><path d="M9 9 6 21h12L15 9"/></>,
    ruler:<><path d="M3 8h18v8H3z"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/></>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    rocket:<><path d="M5 13c-1 2-2 6-2 6s4-1 6-2M9 11a8 8 0 0 1 8-8c2 0 3 1 3 3a8 8 0 0 1-8 8M9 11l4 4M9 11l-3 1M13 15l-1 3"/></>,
    spark:<><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M6 6l2 2M18 18l-2-2M6 18l2-2M18 6l-2 2"/><circle cx="12" cy="12" r="2.5"/></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ─── AMBIENT GLOWS ──────────────────────────────────────────────────────
function Ambient({palette}){
  const pal={
    cool:[{c:'rgba(60,91,255,0.18)',x:'20%',y:'15%',w:320,h:260,b:50},{c:'rgba(60,91,255,0.12)',x:'85%',y:'70%',w:280,h:240,b:50}],
    warm:[{c:'rgba(60,91,255,0.18)',x:'50%',y:'0%',w:360,h:280,b:60},{c:'rgba(60,91,255,0.08)',x:'10%',y:'90%',w:300,h:260,b:50}],
    deep:[{c:'rgba(157,176,255,0.18)',x:'50%',y:'15%',w:360,h:300,b:60},{c:'rgba(60,91,255,0.12)',x:'20%',y:'85%',w:280,h:240,b:50}],
    data:[{c:'rgba(60,91,255,0.25)',x:'0%',y:'40%',w:320,h:280,b:60},{c:'rgba(60,91,255,0.05)',x:'100%',y:'60%',w:280,h:240,b:50}],
  }[palette]||[];
  return <>{pal.map((g,i)=>(
    <div key={i} style={{position:'absolute',left:g.x,top:g.y,transform:'translate(-50%,-50%)',width:g.w,height:g.h,borderRadius:'50%',background:`radial-gradient(closest-side, ${g.c}, transparent 70%)`,filter:`blur(${g.b}px)`,pointerEvents:'none'}}/>
))}</>;
}

// ─── PROGRESS BAR ───────────────────────────────────────────────────────
function Progress({step,total}){
  return(
    <div style={{display:'flex',gap:8,padding:'0 4px'}}>
      {Array.from({length:total}).map((_,i)=>{
        const done=i<step, active=i===step-1;
        return(
          <div key={i} style={{flex:1,height:3,borderRadius:3,overflow:'hidden',background:'rgba(0,0,0,0.08)'}}>
            <div style={{height:'100%',width:done?'100%':'0%',background:active?`linear-gradient(90deg, ${C.blue}, ${C.accent})`:`linear-gradient(90deg, ${C.blue}, #3C5BFF)`,boxShadow:active?`0 0 8px ${C.accent}80`:'none',transition:'width .6s cubic-bezier(.4,0,.2,1)'}}/>
          </div>
);
      })}
    </div>
);
}

// ─── PRIMARY CTA (shimmer) ──────────────────────────────────────────────
function PrimaryCTA({label,icon='arrowR',onClick,disabled,variant='amber'}){
  const grad=variant==='amber'?`linear-gradient(135deg, ${C.accent} 0%, ${C.accentDk} 100%)`:`linear-gradient(135deg, ${C.blue} 0%, ${C.blueDk} 100%)`;
  return(
    <button className="tap" onClick={onClick} disabled={disabled} style={{
      width:'100%',padding:'16px 20px',borderRadius:20,
      background:disabled?C.s2:grad,
      color:disabled?C.dim:'#FFF',
      border:disabled?`1px solid ${C.bd}`:'1px solid rgba(60,91,255,0.25)',
      boxShadow:disabled?'none':`0 10px 24px ${C.accentDk}55, inset 0 1px 0 rgba(0,0,0,0.25)`,
      display:'flex',alignItems:'center',justifyContent:'center',gap:8,
      fontFamily:DISPLAY,fontSize:14,fontWeight:700,letterSpacing:0.2,
      position:'relative',overflow:'hidden',cursor:disabled?'default':'pointer',
    }}>
      {!disabled&&<span style={{position:'absolute',inset:0,background:'linear-gradient(110deg, transparent 30%, rgba(0,0,0,0.12) 50%, transparent 70%)',backgroundSize:'200% 100%',animation:'shine 3.5s ease-in-out infinite',pointerEvents:'none'}}/>}
      <span style={{position:'relative',zIndex:1}}>{label}</span>
      {icon&&<Icon name={icon} size={16} stroke={2.4} color={disabled?C.dim:'#FFF'}/>}
    </button>
);
}

// ─── STEP HEADER ────────────────────────────────────────────────────────
function StepHeader({step,total,eyebrow,title,sub,onBack,onSkip}){
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'32px 20px 0'}}>
        <button onClick={onBack} className="tap" style={{width:36,height:36,borderRadius:12,background:C.s1,border:`1px solid ${C.bd}`,color:C.text,display:'grid',placeItems:'center',padding:0,opacity:step>1?1:0.35,cursor:step>1?'pointer':'default'}}>
          <Icon name="arrowL" size={15} stroke={1.7}/>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <svg width={16} height={16} viewBox="0 0 32 32">
            <defs><linearGradient id="onbLogo" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={C.blue}/><stop offset="55%" stopColor="#3C5BFF"/><stop offset="100%" stopColor={C.accent}/></linearGradient></defs>
            <rect x="3" y="20" width="5" height="9" rx="1.5" fill="url(#onbLogo)" opacity=".75"/>
            <rect x="10" y="14" width="5" height="15" rx="1.5" fill="url(#onbLogo)" opacity=".88"/>
            <rect x="17" y="6" width="5" height="23" rx="1.5" fill="url(#onbLogo)"/>
            <circle cx="26" cy="6" r="2.2" fill={C.accent}/>
          </svg>
          <span style={{fontFamily:DISPLAY,fontWeight:700,fontSize:11,letterSpacing:"0.1em",color:C.text,textTransform:'uppercase'}}>Morpho<span style={{color:C.accent}}>·</span>Coach</span>
        </div>
        {onSkip?(
          <button onClick={onSkip} className="tap" style={{padding:'8px 12px',borderRadius:999,background:C.s1,border:`1px solid ${C.bd}`,color:C.mid,fontSize:10,fontWeight:700,letterSpacing:0.2,fontFamily:DISPLAY,cursor:'pointer'}}>PASSER</button>
):<div style={{width:36}}/>}
      </div>
      <div style={{marginTop:16,padding:'0 20px'}}><Progress step={step} total={total}/></div>
      <div style={{padding:'24px 24px 0'}}>
        <div style={{fontSize:10,fontWeight:700,color:C.accent,letterSpacing:"0.1em",textTransform:'uppercase',fontFamily:DISPLAY}}>{eyebrow||`Étape ${step} sur ${total}`}</div>
        <div style={{fontFamily:SERIF,fontSize:34,fontWeight:400,letterSpacing:-1,color:C.text,lineHeight:1.1,marginTop:8}}>{title}</div>
        {sub&&<div style={{fontSize:13,fontWeight:500,color:C.mid,marginTop:8,lineHeight:1.4}}>{sub}</div>}
      </div>
    </div>
);
}

// ─── FIELD LABEL ────────────────────────────────────────────────────────
function FieldLabel({label,required,hint}){
  return(
    <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:8}}>
      <span style={{fontSize:11,fontWeight:700,color:C.mid,fontFamily:DISPLAY,letterSpacing:0.2}}>{label}</span>
      {required&&<span style={{color:C.coral,fontSize:11}}>*</span>}
      {hint&&<span style={{fontSize:10,color:C.dim,fontWeight:500}}>{hint}</span>}
    </div>
);
}
const inputStyle={width:'100%',padding:'16px 16px',background:C.s2,border:`1px solid ${C.bdHi}`,borderRadius:16,fontSize:14,color:C.text,fontFamily:"'Archivo',sans-serif",boxSizing:'border-box',boxShadow:'inset 0 1px 2px rgba(0,0,0,0.05)'};

// ─── BIG STEPPER ────────────────────────────────────────────────────────
function BigStepper({value,setValue,unit,min,max,accent,icon,label,sub}){
  const v=parseFloat(value)||min;
  return(
    <div style={{background:`linear-gradient(160deg, ${accent}18 0%, ${accent}04 100%)`,border:`1px solid ${accent}30`,borderRadius:20,padding:20,position:'relative',overflow:'hidden',boxShadow:`0 2px 8px ${accent}20`}}>
      <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:`radial-gradient(closest-side, ${accent}25, transparent 70%)`,pointerEvents:'none'}}/>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,position:'relative'}}>
        <div style={{width:34,height:34,borderRadius:12,background:`linear-gradient(145deg, ${accent}, ${accent}99)`,color:'#101318',display:'grid',placeItems:'center',boxShadow:`0 4px 10px ${accent}40, inset 0 1px 0 rgba(0,0,0,0.18)`}}>
          <Icon name={icon} size={16} stroke={2}/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:C.text}}>{label}</div>
          <div style={{fontSize:11,color:C.mid,fontWeight:500,marginTop:1,fontFamily:DISPLAY}}>{sub}</div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative'}}>
        <button className="tap" onClick={()=>setValue(String(Math.max(min,v-1)))} style={{width:44,height:44,borderRadius:12,background:C.s2,border:`1px solid ${C.bdHi}`,color:C.text,display:'grid',placeItems:'center',padding:0,cursor:'pointer'}}>
          <Icon name="minus" size={16} stroke={2.4}/>
        </button>
        <div style={{display:'flex',alignItems:'baseline',gap:8}}>
          <span style={{fontFamily:SERIF,fontSize:64,fontWeight:400,letterSpacing:-1,color:C.text,lineHeight:1,...NUM,textShadow:`0 0 30px ${accent}50`}}>{v}</span>
          <span style={{fontSize:13,color:C.mid,fontWeight:700,fontFamily:DISPLAY,letterSpacing:"0.1em"}}>{unit}</span>
        </div>
        <button className="tap" onClick={()=>setValue(String(Math.min(max,v+1)))} style={{width:44,height:44,borderRadius:12,background:C.s2,border:`1px solid ${C.bdHi}`,color:C.text,display:'grid',placeItems:'center',padding:0,cursor:'pointer'}}>
          <Icon name="plus" size={16} stroke={2.4}/>
        </button>
      </div>
      <div style={{marginTop:20,position:'relative'}}>
        <div style={{height:4,borderRadius:4,background:'rgba(0,0,0,0.05)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',left:0,top:0,bottom:0,width:((v-min)/(max-min)*100)+'%',background:`linear-gradient(90deg, ${accent}, ${accent}80)`,boxShadow:`0 0 8px ${accent}aa`,transition:'width .4s ease'}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
          <span style={{fontSize:10,color:C.dim,fontWeight:600,fontFamily:DISPLAY,...NUM}}>{min}</span>
          <span style={{fontSize:10,color:C.dim,fontWeight:600,fontFamily:DISPLAY,...NUM}}>{max}</span>
        </div>
      </div>
    </div>
);
}

// ─── ONBOARDING ─────────────────────────────────────────────────────────
export default function Onboarding(props){
  useScrollTop();
  const { profil, setProfil, setOnboardingDone } = props;
  const [oStep,setOStep]=useState(0);
  const [oData,setOData]=useState({prenom:"",sexe:"",age:"",poids:"",taille:"",bodyfat:"",objectif:"hypertrophie",activite:"modere",sport:""});

  const PALETTES=['cool','warm','deep','data'];
  const total=4;
  const finish=()=>{ setProfil({...profil,...oData,bodyfat:oData.bodyfat||"",sport:oData.sport||""}); setOnboardingDone(true); };
  const canNext=
    (oStep===0&&oData.sexe&&oData.age)||
    (oStep===1&&oData.poids&&oData.taille)||
    oStep>=2;
  const allValid=oData.sexe&&oData.age&&oData.poids&&oData.taille;

  // ── card helper ──
  const selectCard=(active,accent)=>({
    border:`1.5px solid ${active?accent:C.bd}`,
    background:active?`linear-gradient(160deg, ${accent}1e 0%, ${accent}06 100%)`:C.s1,
    boxShadow:active?`inset 0 1px 0 ${accent}30`:'inset 0 1px 0 rgba(0,0,0,0.05)',
    cursor:'pointer',transition:'all .15s',
  });

  return(
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:340,overflowY:"auto"}}>
      <div style={{position:'relative',minHeight:'100%',maxWidth:500,margin:'0 auto'}}>
        <Ambient palette={PALETTES[oStep]}/>
        <div style={{position:'relative'}}>
          <StepHeader
            step={oStep+1} total={total}
            eyebrow={["Faisons connaissance","Mensurations","Ton objectif","Niveau d'activité"][oStep]}
            title={[
              <>Bienvenue<br/><span style={{fontStyle:'italic',color:C.blueLt}}>chez MorphoCoach.</span></>,
              <>Parle-moi de <span style={{fontStyle:'italic',color:C.blueLt}}>ton corps.</span></>,
              <>Quel est <span style={{fontStyle:'italic',color:C.blueLt}}>ton but ?</span></>,
              <>Ton <span style={{fontStyle:'italic',color:C.blueLt}}>rythme.</span></>,
            ][oStep]}
            sub={[
"Quelques infos pour personnaliser ton coaching.",
"Pour calculer tes besoins caloriques exacts.",
"Ton programme s'adaptera à cet objectif.",
"Pour estimer ta dépense énergétique précise.",
            ][oStep]}
            onBack={()=>oStep>0&&setOStep(s=>s-1)}
            onSkip={oStep===0?()=>setOnboardingDone(true):null}
          />

          <div style={{padding:'24px 20px 24px'}}>

            {/* ════ STEP 0 — IDENTITY ════ */}
            {oStep===0&&(
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <FieldLabel label="Prénom" hint="(facultatif)"/>
                  <input value={oData.prenom} onChange={e=>setOData({...oData,prenom:e.target.value})} placeholder="Ton prénom" style={inputStyle}/>
                </div>
                <div>
                  <FieldLabel label="Sexe" required/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {[{id:"homme",l:"Homme",i:"userDuo"},{id:"femme",l:"Femme",i:"userDuo"}].map(s=>{
                      const on=oData.sexe===s.id;
                      return(
                        <div key={s.id} onClick={()=>setOData({...oData,sexe:s.id})} className="tap" style={{...selectCard(on,C.blue),padding:'20px 16px',textAlign:'center',borderRadius:16}}>
                          <div style={{marginBottom:8,display:"flex",justifyContent:"center"}}><ID name={s.i} size={30}/></div>
                          <div style={{fontSize:13,fontWeight:700,fontFamily:DISPLAY,color:on?C.blue:C.text}}>{s.l}</div>
                        </div>
);
                    })}
                  </div>
                </div>
                <div>
                  <FieldLabel label="Âge" required/>
                  <input type="number" value={oData.age} onChange={e=>setOData({...oData,age:e.target.value})} placeholder="Ex : 25" style={inputStyle}/>
                </div>
              </div>
)}

            {/* ════ STEP 1 — BODY ════ */}
            {oStep===1&&(
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <BigStepper value={oData.poids} setValue={v=>setOData({...oData,poids:v})} unit="kg" min={35} max={200} accent={C.accent} icon="weight" label="Poids" sub="Ton poids actuel"/>
                <BigStepper value={oData.taille} setValue={v=>setOData({...oData,taille:v})} unit="cm" min={130} max={230} accent={C.blue} icon="ruler" label="Taille" sub="Ta taille debout"/>
                {oData.poids&&oData.taille&&(()=>{
                  const imc=(parseFloat(oData.poids)/Math.pow(parseFloat(oData.taille)/100,2)).toFixed(1);
                  return(
                    <div style={{padding:'12px 16px',background:`${C.blue}10`,border:`1px solid ${C.blue}24`,borderRadius:16}}>
                      <div style={{display:'flex',alignItems:'baseline',gap:8}}>
                        <span style={{fontSize:11,color:C.mid,fontWeight:600,fontFamily:DISPLAY}}>IMC estimé</span>
                        <span style={{fontFamily:SERIF,fontSize:20,color:C.blue,...NUM}}>{imc}</span>
                      </div>
                      <div style={{fontSize:10,color:C.dim,marginTop:4,display:"flex",alignItems:"center",gap:5}}><ID name="infoDuo" size={13}/> L'IMC ne distingue pas muscle et graisse</div>
                    </div>
);
                })()}
                <div>
                  <FieldLabel label="% Masse grasse" hint="(optionnel — prioritaire sur l'IMC)"/>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <input type="number" value={oData.bodyfat||""} onChange={e=>setOData({...oData,bodyfat:e.target.value})} placeholder="Ex : 18" style={{...inputStyle,flex:1}}/>
                    <span style={{fontSize:14,color:C.mid,fontWeight:600,fontFamily:DISPLAY}}>%</span>
                  </div>
                  {oData.bodyfat&&(()=>{
                    const bf=parseFloat(oData.bodyfat);
                    const cat=oData.sexe==="femme"?(bf<14?"Athlète":bf<21?"Forme":bf<25?"Acceptable":bf<32?"À améliorer":"Obésité"):(bf<6?"Athlète":bf<14?"Forme":bf<18?"Acceptable":bf<25?"À améliorer":"Obésité");
                    const col=cat==="Athlète"||cat==="Forme"?C.mint:cat==="Acceptable"?C.accent:C.coral;
                    return <div style={{marginTop:8,display:'inline-flex',padding:'4px 12px',borderRadius:999,background:`${col}18`,border:`1px solid ${col}40`,color:col,fontSize:11,fontWeight:700,fontFamily:DISPLAY}}> {cat}</div>;
                  })()}
                </div>
              </div>
)}

            {/* ════ STEP 2 — GOAL ════ */}
            {oStep===2&&(
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  {[
                    {id:"hypertrophie",l:"Prise de muscle",i:"gym",d:"Volume musculaire",c:C.blue},
                    {id:"force",l:"Force",i:"energy",d:"Performances",c:C.accent},
                    {id:"poids",l:"Perte de poids",i:"calories",d:"Sèche & tonicité",c:C.coral},
                    {id:"sante",l:"Santé générale",i:"cardio",d:"Bien-être",c:C.mint},
                    {id:"prep_physique",l:"Prépa physique",i:"hiit",d:"Sport & condition",c:C.accent},
                  ].map(g=>{
                    const on=oData.objectif===g.id;
                    return(
                      <div key={g.id} onClick={()=>setOData({...oData,objectif:g.id})} className="tap" style={{...selectCard(on,g.c),padding:'16px 12px',textAlign:'center',borderRadius:16,position:'relative',overflow:'hidden'}}>
                        {on&&<div style={{position:'absolute',top:-20,right:-20,width:70,height:70,borderRadius:'50%',background:`radial-gradient(closest-side, ${g.c}30, transparent 70%)`,pointerEvents:'none'}}/>}
                        <div style={{marginBottom:8,display:"flex",justifyContent:"center"}}><ID name={g.i} size={30}/></div>
                        <div style={{fontSize:13,fontWeight:700,fontFamily:DISPLAY,color:on?g.c:C.text,marginBottom:2}}>{g.l}</div>
                        <div style={{fontSize:10,color:C.mid}}>{g.d}</div>
                      </div>
);
                  })}
                </div>
                <div>
                  <FieldLabel label="Tu pratiques un sport ?" hint="(facultatif)"/>
                  <input value={oData.sport||""} onChange={e=>setOData({...oData,sport:e.target.value})} placeholder="Ex : Football, Tennis, Crossfit…" style={inputStyle}/>
                </div>
              </div>
)}

            {/* ════ STEP 3 — ACTIVITY ════ */}
            {oStep===3&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {[
                  {id:"sedentaire",l:"Sédentaire",d:"Bureau / peu de sport",f:"×1.2"},
                  {id:"leger",l:"Légèrement actif",d:"Sport 1-3×/semaine",f:"×1.375"},
                  {id:"modere",l:"Modérément actif",d:"Sport 3-5×/semaine",f:"×1.55"},
                  {id:"actif",l:"Très actif",d:"Sport 6-7×/semaine",f:"×1.725"},
                  {id:"tres_actif",l:"Extrêmement actif",d:"2×/jour ou travail physique",f:"×1.9"},
                ].map(a=>{
                  const on=oData.activite===a.id;
                  return(
                    <div key={a.id} onClick={()=>setOData({...oData,activite:a.id})} className="tap" style={{...selectCard(on,C.accent),padding:'16px 16px',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,fontFamily:DISPLAY,color:on?C.accent:C.text}}>{a.l}</div>
                        <div style={{fontSize:11,color:C.mid,marginTop:2}}>{a.d}</div>
                      </div>
                      <div style={{fontFamily:SERIF,fontSize:20,color:on?C.accent:C.dim,...NUM}}>{a.f}</div>
                    </div>
);
                })}
              </div>
)}

            {/* ── Navigation ── */}
            <div style={{marginTop:24}}>
              {oStep===total-1?(
                <PrimaryCTA label="Lancer MorphoCoach" icon="rocket" disabled={!allValid} onClick={finish}/>
):(
                <PrimaryCTA label="Continuer" icon="arrowR" disabled={!canNext} onClick={()=>canNext&&setOStep(s=>s+1)}/>
)}
            </div>
          </div>
        </div>
      </div>
    </div>
);
}
