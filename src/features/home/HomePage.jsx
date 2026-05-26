import { useState } from "react";
import { C, INT } from "../../data/constants.js";
import { Btn, Inp, Row } from "../../components/ui/index.jsx";

// ─── FONT TOKENS (from mockup) ──────────────────────────────────────────
const SERIF   = '"Instrument Serif","Times New Roman",serif';
const DISPLAY = '"Space Grotesk","Inter",system-ui,sans-serif';
const NUM     = { fontVariantNumeric:'tabular-nums', fontFeatureSettings:'"tnum","cv11"' };
const card    = { background:C.s1, border:`1px solid ${C.bd}`, borderRadius:20, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.03), 0 1px 0 rgba(0,0,0,0.2)' };
const eyebrowS = { fontSize:9, fontWeight:700, color:C.dim, letterSpacing:2, textTransform:'uppercase', fontFamily:DISPLAY };

// ─── MINI ICON ──────────────────────────────────────────────────────────
function I({d,size=18,color='currentColor',sw=1.6}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}
const icons={
  bolt:<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>,
  drop:<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>,
  plus:<path d="M12 5v14M5 12h14"/>,
  chev:<path d="m9 6 6 6-6 6"/>,
  sparkles:<><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M6 6l2 2M18 18l-2-2M6 18l2-2M18 6l-2 2"/><circle cx="12" cy="12" r="2.5"/></>,
  play:<path d="m8 5 12 7-12 7z" fill="currentColor"/>,
  arrowUp:<path d="m6 14 6-6 6 6"/>,
  arrowDn:<path d="m6 10 6 6 6-6"/>,
  flame:<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5M12 21a6 6 0 0 0 6-6c0-3-2-5-3-6 0 3-2 4-3 4s-3-1-3-4c-1 1-3 3-3 6a6 6 0 0 0 6 6Z"/>,
};

// ─── SPARKLINE SVG ──────────────────────────────────────────────────────
function Sparkline({data,width=280,height=56,color}){
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const pts=data.map((v,i)=>[(i/(data.length-1))*width, height-((v-min)/range)*(height-6)-3]);
  const d=pts.map((p,i)=>(i===0?`M${p[0]} ${p[1]}`:`L${p[0]} ${p[1]}`)).join(' ');
  const fillD=`${d} L${width} ${height} L0 ${height} Z`;
  return(
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{width:'100%',height,display:'block',overflow:'visible'}}>
      <defs><linearGradient id="spkF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <path d={fillD} fill="url(#spkF)"/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i)=>i===pts.length-1&&<g key={i}><circle cx={p[0]} cy={p[1]} r="6" fill={color} opacity="0.2"/><circle cx={p[0]} cy={p[1]} r="3" fill={color}/></g>)}
    </svg>
  );
}

// ─── HOME ───────────────────────────────────────────────────────────────
export default function Home(props){
  const { profil, prog, cycleStart, setTab, premium, setPaywall, push, eau, setEau, weightLog, setWeightLog, lastWeighIn, setLastWeighIn, calSess, imc, obj, calObj, pObj, lObj, gObj, totR, jR, cPct, semC, getStreak, C, INT, MOTIVATIONS } = props;
  const goProgram=(view)=>{try{localStorage.setItem("mc_progView",view)}catch{}; setTab("program")};
  const [showWeightInput,setShowWeightInput]=useState(false);
  const [newWeight,setNewWeight]=useState("");
  const tot=totR;
  const today=new Date();
  const todayKey=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const todaySess=calSess[todayKey];
  const dayOfYear=Math.floor((today-new Date(today.getFullYear(),0,0))/(1000*60*60*24));
  const motiv=MOTIVATIONS[dayOfYear%MOTIVATIONS.length];
  const streak=getStreak;

  // Weight helpers
  const todayD=new Date();
  const daysSinceLast=lastWeighIn?Math.floor((todayD-new Date(lastWeighIn))/(1000*60*60*24)):999;
  const canWeighIn=daysSinceLast>=14;
  const lastWeight=weightLog.length>0?weightLog[weightLog.length-1]:null;
  const firstWeight=weightLog.length>1?weightLog[0]:null;
  const diff=lastWeight&&firstWeight?(lastWeight.v-firstWeight.v).toFixed(1):null;

  return(
    <div className="anim" style={{padding:'0 20px 16px',position:'relative'}}>
      {/* ── Ambient glows ── */}
      <div style={{position:'absolute',top:150,left:'50%',transform:'translateX(-50%)',width:360,height:280,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(77,139,255,0.12),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:380,right:-60,width:260,height:260,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(255,171,93,0.10),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:720,left:-40,width:240,height:240,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(182,157,255,0.10),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>

      <div style={{position:'relative'}}>
        {/* ── Greeting ── */}
        <div style={{paddingTop:20,paddingBottom:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{...eyebrowS,color:C.mid,fontSize:9}}>{today.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
            {cycleStart&&jR!==null&&(
              <div style={{padding:'6px 10px',borderRadius:999,background:C.s1,border:`1px solid ${C.bd}`,display:'flex',alignItems:'center',gap:6,fontSize:10,color:C.mid,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.4}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:C.gold,boxShadow:`0 0 6px ${C.gold}`}}/>
                CYCLE {(semC||0)+1} · J{jR}
              </div>
            )}
          </div>
          <div style={{marginTop:6,fontFamily:SERIF,fontSize:36,fontWeight:400,letterSpacing:-1.4,color:C.text,lineHeight:1.05}}>
            {profil.prenom?<>Bonjour, <span style={{fontStyle:'italic',color:C.goldL}}>{profil.prenom}</span></>:<>Bonjour <span style={{color:C.dim}}>👋</span></>}
          </div>
          {prog&&<div style={{fontSize:12,fontWeight:500,color:C.mid,marginTop:6}}>{obj.l} · {prog?.jours?.length||0} séances/semaine</div>}
        </div>

        {/* ── Streak ── */}
        {streak>0&&(
          <div className="pop-in" style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,padding:'8px 12px',background:`${C.gold}1a`,border:`1px solid ${C.gold}30`,borderRadius:12}}>
            <span style={{fontSize:18}}>🔥</span>
            <span style={{fontSize:13,fontWeight:700,color:C.gold,fontFamily:DISPLAY}}>{streak} jour{streak>1?'s':''}</span>
            <span style={{fontSize:10,color:C.mid,marginLeft:4}}>{streak>=7?'Semaine parfaite ! 🏆':streak>=3?'Continue ! 💪':'En route !'}</span>
          </div>
        )}

        {/* ── Motivation ── */}
        <div style={{padding:'14px 16px',borderRadius:16,background:`linear-gradient(115deg,${C.gold}1a 0%,${C.lavender}10 60%,transparent 100%)`,border:`1px solid ${C.gold}22`,display:'flex',alignItems:'center',gap:12,position:'relative',overflow:'hidden',marginBottom:14}}>
          <div style={{width:36,height:36,borderRadius:11,flexShrink:0,background:`linear-gradient(145deg,${C.gold}40,${C.gold}15)`,border:`1px solid ${C.gold}40`,color:C.goldL,display:'grid',placeItems:'center'}}>
            <I d={icons.sparkles} size={16} sw={2}/>
          </div>
          <div style={{flex:1}}>
            <div style={{...eyebrowS,color:C.gold,letterSpacing:1.6,fontSize:9}}>Citation du jour</div>
            <div style={{fontFamily:SERIF,fontStyle:'italic',fontSize:15,color:C.text,marginTop:3,letterSpacing:-0.2,lineHeight:1.35}}>"{motiv}"</div>
          </div>
        </div>

        {/* ── Today Session ── */}
        {todaySess&&(
          <div style={{padding:18,borderRadius:22,background:`linear-gradient(135deg,${C.s1} 0%,${C.s2} 100%)`,border:`1px solid ${C.bdHi}`,position:'relative',overflow:'hidden',marginBottom:14,boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 0 rgba(0,0,0,0.2)'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.gold}80,${C.blue}80,transparent)`}}/>
            <div style={{position:'absolute',bottom:-50,right:-50,width:200,height:200,borderRadius:'50%',background:`radial-gradient(closest-side,${todaySess.color||C.gold}18,transparent 70%)`,pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'flex-start',gap:14,position:'relative'}}>
              <div style={{width:56,height:56,borderRadius:16,flexShrink:0,background:`linear-gradient(145deg,${todaySess.color||C.gold},${todaySess.color||C.gold}99)`,color:'#1A1308',display:'grid',placeItems:'center',boxShadow:`0 8px 20px ${todaySess.color||C.gold}50, inset 0 1px 0 rgba(255,255,255,0.4)`,position:'relative',overflow:'hidden'}}>
                <I d={icons.bolt} size={24} sw={2.2}/>
              </div>
              <div style={{flex:1}}>
                <div style={{...eyebrowS,color:todaySess.color||C.gold}}>SÉANCE DU JOUR</div>
                <div style={{fontFamily:DISPLAY,fontSize:17,fontWeight:700,color:C.text,marginTop:4,letterSpacing:-0.3}}>{todaySess.nom}</div>
                {todaySess.intensite&&<div style={{fontSize:11,color:C.mid,marginTop:4}}>{INT[todaySess.intensite]?.l}</div>}
              </div>
            </div>
            <button className="tap" onClick={()=>goProgram("today")} style={{marginTop:14,width:'100%',padding:'12px 16px',borderRadius:14,background:`linear-gradient(135deg,${todaySess.color||C.gold},${C.amberDk})`,border:'1px solid rgba(255,255,255,0.22)',color:'#1A1308',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:DISPLAY,fontSize:13.5,fontWeight:700,letterSpacing:0.2,boxShadow:`0 6px 16px ${C.amberDk}50, inset 0 1px 0 rgba(255,255,255,0.42)`,position:'relative',overflow:'hidden'}}>
              <I d={icons.play} size={13} color="#1A1308"/>Démarrer la séance
            </button>
          </div>
        )}

        {/* ── Cycle progress ── */}
        {cycleStart&&(
          <div style={{...card,padding:18,marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div>
                <div style={{...eyebrowS,color:C.gold}}>Cycle · Sem {(semC||0)+1}/6</div>
                <div style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:C.text,marginTop:4}}>{prog?.titre}</div>
              </div>
              <div style={{fontFamily:SERIF,fontSize:32,color:jR<=7?C.gold:C.text,letterSpacing:-1,...NUM}}>{jR}<span style={{fontSize:12,color:C.dim}}>J</span></div>
            </div>
            <div style={{height:4,background:'rgba(190,180,255,0.06)',borderRadius:2,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.min(100,cPct||0)}%`,background:`linear-gradient(90deg,${C.blue},${C.gold})`,borderRadius:2,transition:'width .5s'}}/>
            </div>
            <div style={{display:'flex',gap:3,marginTop:8}}>
              {[0,1,2,3,4,5].map(w=><div key={w} style={{flex:1,height:2,borderRadius:1,background:w<=semC?C.gold:'rgba(190,180,255,0.06)'}}/>)}
            </div>
          </div>
        )}

        {/* ── Daily Energy / Macros ── */}
        {profil.poids&&profil.taille&&profil.age&&profil.sexe?(()=>{
          const consumed=tot.cal||0, goal=calObj||1;
          const remaining=Math.max(goal-consumed,0);
          const pct=Math.min(consumed/goal,1);
          const r=76, c=2*Math.PI*r;
          return(
            <div style={{...card,padding:20,position:'relative',overflow:'hidden',marginBottom:14}}>
              <div style={{position:'absolute',top:-60,right:-40,width:220,height:220,borderRadius:'50%',background:`radial-gradient(closest-side,${C.gold}1a,transparent 70%)`,filter:'blur(20px)',pointerEvents:'none'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,position:'relative'}}>
                <div>
                  <div style={{...eyebrowS}}>Aujourd'hui</div>
                  <div style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:C.text,marginTop:4}}>Énergie</div>
                </div>
                <button className="tap" onClick={()=>setTab("nutrition")} style={{padding:'6px 10px',borderRadius:999,background:'rgba(11,15,31,0.6)',border:`1px solid ${C.bd}`,color:C.mid,fontSize:10,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.4,display:'flex',alignItems:'center',gap:4}}>
                  Voir détail <I d={icons.chev} size={11} sw={1.8}/>
                </button>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:16,position:'relative'}}>
                {/* Ring */}
                <div style={{position:'relative',width:148,height:148,flexShrink:0}}>
                  <svg width="148" height="148" viewBox="0 0 148 148">
                    <defs><linearGradient id="ringIn" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={C.blue}/><stop offset="100%" stopColor={C.gold}/></linearGradient></defs>
                    <g transform="rotate(-90 74 74)">
                      <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(190,180,255,0.06)" strokeWidth="7"/>
                      <circle cx="74" cy="74" r={r} fill="none" stroke="url(#ringIn)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-pct)}/>
                    </g>
                  </svg>
                  <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                    <div style={{...eyebrowS,fontSize:8.5}}>Restant</div>
                    <div style={{fontFamily:SERIF,fontSize:36,fontWeight:400,letterSpacing:-1.4,color:C.text,lineHeight:1,marginTop:4,...NUM}}>{remaining}</div>
                    <div style={{fontSize:10,color:C.mid,fontWeight:600,fontFamily:DISPLAY,marginTop:3,letterSpacing:0.3}}>kcal</div>
                  </div>
                </div>
                {/* Legend */}
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:11}}>
                  {[
                    {color:C.gold,label:'Apport',value:consumed,unit:'kcal',sub:`sur ${goal}`},
                    {color:C.coral,label:'Protéines',value:tot.p||0,unit:'g',sub:`obj ${pObj}g`},
                    {color:C.mint,label:'Glucides',value:tot.g||0,unit:'g',sub:`obj ${gObj}g`},
                  ].map(s=>(
                    <div key={s.label} style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{width:8,height:8,borderRadius:2,background:s.color,boxShadow:`0 0 6px ${s.color}80`}}/>
                      <div style={{flex:1}}>
                        <div style={{...eyebrowS,fontSize:8.5}}>{s.label}</div>
                        <div style={{display:'flex',alignItems:'baseline',gap:3,marginTop:1}}>
                          <span style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:C.text,letterSpacing:-0.3,...NUM}}>{s.value}</span>
                          <span style={{fontSize:9,color:C.dim,fontWeight:600,fontFamily:DISPLAY,letterSpacing:0.3}}>{s.unit}</span>
                        </div>
                        <div style={{fontSize:10,color:C.dim,fontWeight:500,marginTop:1}}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })():(
          <div onClick={()=>setTab("profile")} className="tap" style={{...card,padding:18,marginBottom:14,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:13,background:`${C.blue}18`,border:`1px solid ${C.blue}40`,color:C.blue,display:'grid',placeItems:'center'}}>👤</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.blue,fontFamily:DISPLAY}}>Complète ton profil</div>
              <div style={{fontSize:11,color:C.mid,marginTop:3,lineHeight:1.4}}>Renseigne tes infos pour voir tes calories et macros personnalisées</div>
            </div>
            <I d={icons.chev} size={16} color={C.blue}/>
          </div>
        )}

        {/* ── Hydration ── */}
        <div style={{...card,padding:'14px 16px',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:30,height:30,borderRadius:9,background:`linear-gradient(145deg,${C.mint},#2DA67D)`,color:'#0B1F18',display:'grid',placeItems:'center',boxShadow:`0 4px 10px ${C.mint}30, inset 0 1px 0 rgba(255,255,255,0.3)`}}>
                <I d={icons.drop} size={14} sw={2}/>
              </div>
              <div>
                <div style={{...eyebrowS,fontSize:9}}>Hydratation</div>
                <div style={{fontSize:12,color:C.text,fontWeight:600,fontFamily:DISPLAY,marginTop:2,...NUM}}>
                  {(eau*0.25).toFixed(2).replace('.',',')} L <span style={{color:C.dim}}>{eau}/8 verres</span>
                </div>
              </div>
            </div>
            <button className="tap" onClick={()=>setEau(e=>Math.min(8,e+1))} style={{padding:'6px 11px',borderRadius:999,background:'transparent',border:`1px solid ${C.mint}50`,color:C.mint,fontSize:10.5,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.3,display:'flex',alignItems:'center',gap:4}}>
              <I d={icons.plus} size={11} sw={2.4}/> 250ML
            </button>
          </div>
          <div style={{display:'flex',gap:4}}>
            {Array.from({length:8}).map((_,i)=>{
              const on=i<eau;
              return <button key={i} onClick={()=>setEau(i+1===eau?i:i+1)} className="tap" style={{flex:1,height:18,borderRadius:5,background:on?`linear-gradient(180deg,${C.mint},#2DA67D)`:'rgba(190,180,255,0.05)',border:`1px solid ${on?C.mint+'60':C.bd}`,boxShadow:on?`0 0 6px ${C.mint}55, inset 0 1px 0 rgba(255,255,255,0.3)`:'none',padding:0}}/>;
            })}
          </div>
        </div>

        {/* ── Weight ── */}
        <div style={{...card,padding:18,position:'relative',overflow:'hidden',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <div style={{...eyebrowS}}>Suivi du poids</div>
              {lastWeight&&(
                <div style={{marginTop:6,display:'flex',alignItems:'baseline',gap:4}}>
                  <span style={{fontFamily:SERIF,fontSize:36,fontWeight:400,letterSpacing:-1.2,color:C.text,lineHeight:1,...NUM}}>{lastWeight.v}</span>
                  <span style={{fontSize:12,color:C.mid,fontWeight:600,fontFamily:DISPLAY}}>kg</span>
                </div>
              )}
              {diff&&(
                <div style={{marginTop:6,display:'inline-flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:999,background:parseFloat(diff)>0?`${C.coral}1a`:`${C.mint}1a`,border:`1px solid ${parseFloat(diff)>0?C.coral:C.mint}40`,color:parseFloat(diff)>0?C.coral:C.mint,fontSize:10.5,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.2,...NUM}}>
                  <I d={parseFloat(diff)>0?icons.arrowUp:icons.arrowDn} size={11} sw={2.4}/>
                  {parseFloat(diff)>0?'+':''}{diff} kg
                </div>
              )}
            </div>
            {canWeighIn&&!showWeightInput&&(
              <button className="tap" onClick={()=>setShowWeightInput(true)} style={{padding:'7px 11px',borderRadius:999,background:C.s2,border:`1px solid ${C.bd}`,color:C.text,fontSize:10.5,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.3,display:'inline-flex',alignItems:'center',gap:5}}>
                <I d={icons.plus} size={11} sw={2.4}/> Pesée
              </button>
            )}
          </div>
          {weightLog.length>=2&&(
            <div style={{marginTop:12}}>
              <Sparkline data={weightLog.map(w=>w.v)} width={280} height={56} color={C.mint}/>
            </div>
          )}
          {weightLog.length===0&&<div style={{textAlign:'center',padding:'16px 0',fontSize:12,color:C.mid}}>Enregistrez votre première pesée pour voir votre progression.</div>}
          {showWeightInput&&canWeighIn&&(
            <Row style={{gap:8,marginTop:12}}>
              <Inp style={{flex:1,marginBottom:0}} type="number" placeholder="Ex: 79.5" value={newWeight} onChange={e=>setNewWeight(e.target.value)} step="0.1"/>
              <button className="tap" onClick={()=>{if(!newWeight)return;const entry={v:parseFloat(newWeight),date:new Date().toLocaleDateString("fr-FR")};setWeightLog(prev=>[...prev,entry]);setLastWeighIn(new Date().toISOString());setNewWeight("");setShowWeightInput(false);push("⚖️","Poids enregistré !",`${newWeight}kg enregistré.`);}} style={{padding:'11px 14px',background:`${C.blue}14`,border:`1px solid ${C.blue}40`,borderRadius:14,color:C.blue,cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:DISPLAY}}>✓</button>
              <button className="tap" onClick={()=>setShowWeightInput(false)} style={{padding:'11px 10px',background:C.s2,border:`1px solid ${C.bd}`,borderRadius:14,color:C.mid,cursor:'pointer',fontSize:14}}>×</button>
            </Row>
          )}
          {!canWeighIn&&(
            <div style={{padding:'9px 11px',background:`${C.mint}18`,border:`1px solid ${C.mint}30`,borderRadius:12,fontSize:11,color:C.mint,lineHeight:1.5,textAlign:'center',marginTop:10}}>
              🌱 Prochaine pesée dans <span style={{fontWeight:700}}>{14-daysSinceLast} jour{14-daysSinceLast>1?'s':''}</span>
            </div>
          )}
        </div>

        {/* ── Quick Access Bento ── */}
        <div style={{marginBottom:14}}>
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:12}}>
            <span style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:C.text}}>Accès rapide</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {icon:'bolt',l:'Séance du jour',sub:'Voir les exercices',color:C.gold,fn:()=>goProgram("today")},
              {icon:'flame',l:'Planification',sub:'Mon calendrier',color:C.blue,fn:()=>goProgram("calendar")},
              {icon:'sparkles',l:'Coach IA',sub:'Programme sur-mesure',color:C.lavender,prem:true,fn:()=>{if(!premium)setPaywall(true);else goProgram("analyse")}},
              {icon:null,l:'Créer un programme',sub:'Manuel',color:C.mint,fn:()=>goProgram("creer")},
            ].map((a,i)=>(
              <button key={i} className="tap" onClick={a.fn} style={{padding:'14px 14px',borderRadius:18,textAlign:'left',background:a.prem?`linear-gradient(135deg,${a.color}28 0%,${a.color}08 60%,${C.s1} 100%)`:C.s1,border:`1px solid ${a.prem?a.color+'40':C.bd}`,color:C.text,display:'flex',flexDirection:'column',gap:10,minHeight:110,position:'relative',overflow:'hidden',boxShadow:a.prem?`0 8px 20px ${a.color}20, inset 0 1px 0 ${a.color}30`:'inset 0 1px 0 rgba(255,255,255,0.03), 0 1px 0 rgba(0,0,0,0.2)'}}>
                <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(closest-side,${a.color}${a.prem?'40':'18'},transparent 70%)`,pointerEvents:'none'}}/>
                <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(145deg,${a.color},${a.color}99)`,color:'#0B0F1F',display:'grid',placeItems:'center',boxShadow:`0 4px 10px ${a.color}40, inset 0 1px 0 rgba(255,255,255,0.4)`,position:'relative',zIndex:1}}>
                  {a.icon?<I d={icons[a.icon]} size={18} sw={2}/>:<span style={{fontSize:18}}>🏋️</span>}
                </div>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{fontFamily:DISPLAY,fontSize:13,fontWeight:700,color:C.text,letterSpacing:-0.1}}>{a.l}</div>
                    {a.prem&&<div style={{padding:'2px 6px',borderRadius:4,background:`${a.color}30`,border:`1px solid ${a.color}50`,color:a.color,fontSize:8.5,fontWeight:800,fontFamily:DISPLAY,letterSpacing:0.6}}>PRO</div>}
                  </div>
                  <div style={{fontSize:11,color:C.mid,fontWeight:500,marginTop:3}}>{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Body Composition ── */}
        {(profil.bodyfat||imc)&&(
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:C.text,marginBottom:12}}>Composition</div>
            <div style={{display:'flex',gap:10}}>
              {profil.bodyfat&&(()=>{
                const bf=parseFloat(profil.bodyfat);
                const cat=profil.sexe==="femme"?(bf<14?"Athlète":bf<21?"Forme":bf<25?"Acceptable":bf<32?"À améliorer":"Obésité"):(bf<6?"Athlète":bf<14?"Forme":bf<18?"Acceptable":bf<25?"À améliorer":"Obésité");
                const col=cat==="Athlète"||cat==="Forme"?C.mint:cat==="Acceptable"?C.gold:C.coral;
                return(
                  <div style={{flex:1,padding:16,borderRadius:18,background:`linear-gradient(160deg,${col}1a 0%,${col}04 100%)`,border:`1px solid ${col}28`,position:'relative',overflow:'hidden',boxShadow:`inset 0 1px 0 ${col}30`}}>
                    <div style={{position:'absolute',top:-25,right:-25,width:90,height:90,borderRadius:'50%',background:`radial-gradient(closest-side,${col}30,transparent 70%)`,pointerEvents:'none'}}/>
                    <div style={{display:'flex',alignItems:'center',gap:7}}><span style={{width:6,height:6,borderRadius:'50%',background:col,boxShadow:`0 0 6px ${col}`}}/><span style={{...eyebrowS}}>Masse grasse</span></div>
                    <div style={{display:'flex',alignItems:'baseline',gap:3,marginTop:8}}><span style={{fontFamily:SERIF,fontSize:32,fontWeight:400,letterSpacing:-1,color:C.text,lineHeight:1,...NUM}}>{bf}</span><span style={{fontSize:12,color:C.mid,fontWeight:600,fontFamily:DISPLAY}}>%</span></div>
                    <div style={{marginTop:8,display:'inline-flex',padding:'3px 8px',borderRadius:999,background:`${col}18`,border:`1px solid ${col}40`,color:col,fontSize:10,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.3}}>{cat.toUpperCase()}</div>
                  </div>
                );
              })()}
              {imc&&(
                <div style={{flex:1,padding:16,borderRadius:18,background:`linear-gradient(160deg,${C.mint}1a 0%,${C.mint}04 100%)`,border:`1px solid ${C.mint}28`,position:'relative',overflow:'hidden',boxShadow:`inset 0 1px 0 ${C.mint}30`}}>
                  <div style={{position:'absolute',top:-25,right:-25,width:90,height:90,borderRadius:'50%',background:`radial-gradient(closest-side,${C.mint}30,transparent 70%)`,pointerEvents:'none'}}/>
                  <div style={{display:'flex',alignItems:'center',gap:7}}><span style={{width:6,height:6,borderRadius:'50%',background:C.mint,boxShadow:`0 0 6px ${C.mint}`}}/><span style={{...eyebrowS}}>IMC</span></div>
                  <div style={{display:'flex',alignItems:'baseline',gap:3,marginTop:8}}><span style={{fontFamily:SERIF,fontSize:32,fontWeight:400,letterSpacing:-1,color:C.text,lineHeight:1,...NUM}}>{imc}</span><span style={{fontSize:12,color:C.mid,fontWeight:600,fontFamily:DISPLAY}}>kg/m²</span></div>
                  <div style={{marginTop:8,display:'inline-flex',padding:'3px 8px',borderRadius:999,background:`${imc<25?C.mint:C.coral}18`,border:`1px solid ${imc<25?C.mint:C.coral}40`,color:imc<25?C.mint:C.coral,fontSize:10,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.3}}>{imc<18.5?'MAIGREUR':imc<25?'NORMAL':imc<30?'SURPOIDS':'OBÉSITÉ'}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
