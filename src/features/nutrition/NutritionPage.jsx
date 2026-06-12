import { useState, useMemo, useEffect } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { Card, Eyebrow, Btn, Inp, G2 } from "../../components/ui/index.jsx";
import BilanNutrition from "./BilanNutrition.jsx";
import BilanArchive from "./BilanArchive.jsx";
import RepasSheet from "./RepasSheet.jsx";
import BarcodeScanner from "./BarcodeScanner.jsx";
import PhotoAnalyse from "./PhotoAnalyse.jsx";


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
        <div style={{fontFamily:SERIF,fontSize:52,fontWeight:400,letterSpacing:-2,color:over?C.red:C.text,lineHeight:.95,marginTop:6,...NUM}}>
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

// ─── MacroCard ────────────────────────────────────────────────────────────────
function MacroCard({label,value,goal,color,colorDk}){
  const pct=Math.round(Math.min(value/(goal||1),1)*100);
  const letter=label[0];
  return(
    <div style={{flex:1,padding:'13px 12px',borderRadius:16,
      background:`linear-gradient(160deg, ${color}14, ${color}06)`,
      border:`1px solid ${color}33`,
      boxShadow:`0 4px 14px -8px ${color}80`,
      display:'flex',flexDirection:'column',gap:9}}>
      <div style={{display:'flex',alignItems:'center',gap:7}}>
        <span style={{width:22,height:22,borderRadius:7,flexShrink:0,
          background:`linear-gradient(145deg, ${color}, ${colorDk})`,
          color:'#fff',fontSize:11,fontWeight:800,fontFamily:DISPLAY,
          display:'grid',placeItems:'center',
          boxShadow:`0 2px 6px ${color}66`}}>{letter}</span>
        <span style={{...eyebrowS,color:colorDk,fontSize:8.5}}>{label}</span>
      </div>
      <div style={{display:'flex',alignItems:'baseline',gap:3}}>
        <span style={{fontFamily:DISPLAY,fontSize:22,fontWeight:700,color:C.text,letterSpacing:-0.5,...NUM}}>{value}</span>
        <span style={{fontSize:10.5,color:C.dim,fontWeight:500,...NUM}}>/{goal}g</span>
      </div>
      <div style={{height:5,background:`${color}1F`,borderRadius:3,overflow:'hidden'}}>
        <div style={{height:'100%',width:pct+'%',background:`linear-gradient(90deg,${color},${colorDk})`,borderRadius:3,transition:'width .8s ease',boxShadow:`0 0 8px ${color}`}}/>
      </div>
      <span style={{fontSize:10.5,color:colorDk,fontWeight:800,...NUM,letterSpacing:0.3,fontFamily:DISPLAY}}>{pct}%</span>
    </div>
  );
}

// ─── Config repas ─────────────────────────────────────────────────────────────
const MEALS=[
  {id:"matin", l:"Petit-déjeuner", icon:"sun",    accent:"#F59E0B", accentDk:"#D97706", dark:"#1A1308"},
  {id:"snack", l:"Collation",      icon:"coffee",  accent:"#F87171", accentDk:"#EF4444", dark:"#1F0A0A"},
  {id:"midi",  l:"Déjeuner",       icon:"apple",   accent:"#3B82F6", accentDk:"#2563EB", dark:"#0A1628"},
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
export default function Nutrition(props){
  const { profil, prog, push, repas, setRepas, repasLog, setRepasLog, myFoods, setMyFoods, eau, setEau, scanRes, setScanRes, obj, calObj, pObj, lObj, gObj, totR, handleScan, FOODS, premium, setPaywall } = props;

  const [nView,   setNView]   = useState("journal");
  const [repasSheet, setRepasSheet] = useState(null);  // id du repas ouvert
  const [showPhoto, setShowPhoto] = useState(false);
  const [search,  setSearch]  = useState("");
  const [newFood, setNewFood] = useState({nom:"",cal:"",p:"",g:"",l:""});
  const [scanCode,setScan]    = useState("");
  const [dayOff,  setDayOff]  = useState(0); // 0=today, -1=hier…
  const [showCamera, setShowCamera] = useState(false);
  const [fruitsV, setFruitsV] = useState({ fruits:0, legumes:0 }); // portions F&V du jour
  const [showArchive, setShowArchive] = useState(false);

  const tot     = totR;
  const all     = [...FOODS,...myFoods];
  const filtered= search ? all.filter(f=>f.n.toLowerCase().includes(search.toLowerCase())) : [];

  // Callback quand un code-barres est détecté par la caméra
  const handleCameraScan = async (code) => {
    setShowCamera(false);
    setScan(code);
    if (code.length >= 8) handleScan(code);
  };

  // ── Persistance du vrai jour dans repasLog (historique daté réel) ──────────
  const todayISO = new Date().toISOString().split("T")[0];
  useEffect(() => {
    if (!setRepasLog) return;
    const hasFood = (tot.cal || 0) > 0;
    setRepasLog(prev => {
      const log = { ...(prev || {}) };
      if (hasFood) {
        log[todayISO] = {
          date: todayISO,
          kcal: Math.round(tot.cal), prot: Math.round(tot.p),
          gluc: Math.round(tot.g),   lip:  Math.round(tot.l),
          eau:  eau || 0,
        };
      } else if (log[todayISO]) {
        delete log[todayISO]; // si on a tout retiré, le jour n'est plus "renseigné"
      }
      return log;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tot.cal, tot.p, tot.g, tot.l, eau, todayISO]);

  // Historique réel : du PREMIER jour loggé jusqu'à aujourd'hui (jamais inventé)
  const repasHistory = useMemo(() => {
    const log = repasLog || {};
    const dates = Object.keys(log).filter(d => (log[d]?.kcal || 0) > 0).sort();
    if (!dates.length) return [];
    const first = new Date(dates[0] + "T00:00:00");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const out = [];
    for (let d = new Date(first); d <= today && out.length < 60; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().split("T")[0];
      const e = log[iso];
      out.push({
        date: iso,
        kcal: e?.kcal || 0, prot: e?.prot || 0,
        gluc: e?.gluc || 0, lip: e?.lip || 0, eau: e?.eau || 0,
      });
    }
    return out.slice(-14); // fenêtre glissante de 14 jours ancrée sur des dates réelles
  }, [repasLog]);

  const isToday = dayOff===0;

  return(
    <>
    {showCamera && (
      <BarcodeScanner
        onDetected={handleCameraScan}
        onClose={() => setShowCamera(false)}
      />
    )}
    {showPhoto && (
      <PhotoAnalyse
        onClose={()=>setShowPhoto(false)}
        onAdd={(aliment, repasId)=>{
          setRepas(rp=>({...rp,[repasId]:[...(rp[repasId]||[]),aliment]}));
        }}
        premium={premium}
        setPaywall={setPaywall}
        push={push}
      />
    )}
    {repasSheet && (()=>{
      const m = MEALS.find(x=>x.id===repasSheet);
      if (!m) return null;
      const all = [...FOODS,...myFoods];
      return (
        <RepasSheet
          meal={m}
          items={repas[m.id]||[]}
          allFoods={all}
          quickFoods={FOODS.slice(0,8)}
          onAdd={item => setRepas(rp=>({...rp,[m.id]:[...(rp[m.id]||[]),item]}))}
          onRemove={idx => setRepas(rp=>({...rp,[m.id]:rp[m.id].filter((_,j)=>j!==idx)}))}
          onClose={()=>setRepasSheet(null)}
          onScan={()=>setShowCamera(true)}
          onPhoto={()=>setShowPhoto(true)}
          premium={premium}
          scanRes={scanRes}
          setScanRes={setScanRes}
          handleScan={handleScan}
          push={push}
        />
      );
    })()}
    <div className="anim" style={{position:'relative',paddingBottom:20}}>
      <div style={{position:'absolute',top:130,left:'50%',transform:'translateX(-50%)',width:340,height:280,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(59,130,246,0.12),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>

      <div style={{position:'relative'}}>

        {/* ── Header ── */}
        <div style={{padding:'18px 16px 0'}}>

          {/* ─ Navigateur de date ─ */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            background:C.s1,border:`1px solid ${C.bd}`,borderRadius:14,
            padding:'10px 14px',marginBottom:14}}>
            <button className="tap-icon" onClick={()=>setDayOff(d=>d-1)} style={{
              width:32,height:32,borderRadius:10,background:'rgba(0,0,0,0.03)',
              border:`1px solid ${C.bd}`,display:'grid',placeItems:'center',cursor:'pointer'}}>
              <I name="chevL" size={15} color={C.mid} stroke={2}/>
            </button>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>
                {formatDate(dayOff)}
              </div>
              {dayOff!==0&&(
                <div style={{fontSize:10.5,color:C.dim,marginTop:2,fontFamily:DISPLAY}}>
                  {new Date(Date.now()+dayOff*86400000).toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}
                </div>
              )}
            </div>
            <button className="tap-icon" onClick={()=>setDayOff(d=>Math.min(0,d+1))} style={{
              width:32,height:32,borderRadius:10,
              background: dayOff===0 ? 'transparent' : 'rgba(0,0,0,0.03)',
              border:`1px solid ${dayOff===0 ? 'transparent' : C.bd}`,
              display:'grid',placeItems:'center',
              cursor:dayOff===0?'default':'pointer',
              opacity:dayOff===0?0.25:1}}>
              <I name="chevR" size={15} color={C.mid} stroke={2}/>
            </button>
          </div>

          {/* Onglets Journal / Bilan PRO */}
          <div style={{position:'relative',display:'flex',padding:3,borderRadius:12,
            background:'#F0F2F7',border:'1px solid rgba(0,0,0,0.07)',marginBottom:2}}>
            {[{id:"journal",l:"Journal"},{id:"bilan",l:"Bilan PRO"}].map(s=>{
              const on=nView===s.id;
              const isBilan=s.id==="bilan";
              return(
                <button key={s.id} onClick={()=>{
                  if(isBilan){ if(!premium){ if(setPaywall)setPaywall(true); return; } }
                  setNView(s.id);
                }} style={{position:'relative',zIndex:1,flex:1,padding:'8px 0',borderRadius:9,
                  background:on?'#FFFFFF':'transparent',
                  border:on?(isBilan?'1px solid rgba(59,130,246,0.35)':'1px solid rgba(0,0,0,0.10)'):'1px solid transparent',
                  color:on?(isBilan?'#2563EB':'#0F1923'):'#6B7280',
                  fontSize:12,fontWeight:700,letterSpacing:0.2,fontFamily:DISPLAY,
                  cursor:'pointer',transition:'all .25s ease',
                  boxShadow:on?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>
                  {s.l}
                  {isBilan&&!premium&&(
                    <span style={{fontSize:8,marginLeft:4,padding:'1px 4px',borderRadius:3,
                      background:'rgba(59,130,246,0.25)',color:'#93C5FD',
                      fontWeight:700,verticalAlign:'middle'}}>PRO</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ════ BILAN PRO ════ */}
        {nView==="bilan"&&premium&&!showArchive&&(
          <BilanNutrition
            onBack={()=>setNView("journal")}
            repasHistory={repasHistory}
            repas={repas} foods={[...FOODS,...myFoods]}
            calObj={calObj} pObj={pObj} gObj={gObj} lObj={lObj}
            profil={profil} obj={obj} premium={premium}
            onOpenArchive={()=>setShowArchive(true)}
          />
        )}

        {/* ════ ARCHIVE BILANS ════ */}
        {nView==="bilan"&&premium&&showArchive&&(
          <BilanArchive
            onBack={()=>setShowArchive(false)}
            bilans={[]}
            onOpenBilan={(b)=>console.log("bilan archivé:",b)}
          />
        )}

        {/* ════ JOURNAL ════ */}
        {nView==="journal"&&(
          <>
            {/* Anneau calories */}
            <div style={{padding:'18px 16px 0'}}>
              <CalorieRing consumed={tot.cal} goal={calObj}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:22,padding:'0 6px'}}>
                <HeroStat value={calObj}                     label="Objectif"  accent="#818CF8"/>
                <HeroStat value={tot.cal}                    label="Consommé"  accent="#3B82F6"/>
                <HeroStat value={Math.max(0,calObj-tot.cal)} label="Restant"   accent="#F59E0B"/>
              </div>
            </div>

            {/* Macro cards */}
            <div style={{padding:'20px 16px 0'}}>
              <div style={{display:'flex',gap:8}}>
                <MacroCard label="Protéines" value={tot.p} goal={pObj} color="#60A5FA" colorDk="#3B82F6"/>
                <MacroCard label="Glucides"  value={tot.g} goal={gObj} color="#22D3EE" colorDk="#0EA5E9"/>
                <MacroCard label="Lipides"   value={tot.l} goal={lObj} color="#34D399" colorDk="#10B981"/>
              </div>
            </div>

            {/* Repas du jour */}
            <div style={{padding:'20px 16px 0'}}>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:10}}>
                <span style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:C.text,letterSpacing:-0.4}}>
                  Repas {isToday?"du jour":formatDate(dayOff).toLowerCase()}
                </span>
                {isToday&&(
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button className="tap" onClick={()=>setShowCamera(true)} style={{
                      display:'inline-flex',alignItems:'center',gap:6,
                      padding:'8px 14px',
                      background:'linear-gradient(145deg,#3B82F6,#2563EB)',
                      border:'1px solid rgba(37,99,235,0.5)',
                      borderRadius:12,color:'#fff',
                      boxShadow:'0 4px 12px rgba(59,130,246,0.45)',
                      fontSize:12.5,fontWeight:700,fontFamily:DISPLAY,cursor:'pointer',
                    }}>
                      <I name="scan" size={13} stroke={2.2} color="#fff"/> Scanner
                    </button>
                    <button className="tap" onClick={()=>setShowPhoto(true)} style={{
                      display:'inline-flex',alignItems:'center',gap:6,
                      padding:'8px 14px',
                      background: premium ? 'linear-gradient(145deg,#818CF8,#6366F1)' : 'linear-gradient(145deg,#A5B4FC,#818CF8)',
                      border: premium ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(129,140,248,0.5)',
                      borderRadius:12,
                      color:'#fff',
                      boxShadow:'0 4px 12px rgba(99,102,241,0.42)',
                      fontSize:12.5,fontWeight:700,fontFamily:DISPLAY,cursor:'pointer',
                    }}>
                      {!premium
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      }
                      Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Grille 2×2 — tap ouvre RepasSheet plein écran */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                {MEALS.map(m=>{
                  const items=repas[m.id]||[];
                  const rTot=items.reduce((a,f)=>({cal:a.cal+f.c,p:a.p+f.p,g:a.g+f.g,l:a.l+f.l}),{cal:0,p:0,g:0,l:0});
                  return(
                    <button key={m.id} className="tap" onClick={()=>setRepasSheet(m.id)}
                      style={{background:`linear-gradient(145deg,${m.accent}22,${m.accentDk}10)`,
                        border:`1px solid ${m.accent}35`,borderRadius:16,
                        padding:'14px 14px 12px',textAlign:'left',cursor:'pointer',
                        transition:'box-shadow .2s'}}>
                      <div style={{width:40,height:40,borderRadius:12,
                        background:`linear-gradient(145deg,${m.accent},${m.accentDk})`,
                        display:'grid',placeItems:'center',marginBottom:10,
                        boxShadow:`0 4px 10px ${m.accent}50, inset 0 1px 0 rgba(0,0,0,0.14)`,
                        position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',inset:0,background:'radial-gradient(110% 60% at 30% 10%,rgba(0,0,0,0.14),transparent 60%)',pointerEvents:'none'}}/>
                        <I name={m.icon} size={20} stroke={2} color={m.dark}/>
                      </div>
                      <div style={{fontSize:12.5,fontWeight:700,color:C.text,fontFamily:DISPLAY,marginBottom:2}}>
                        {m.l}
                      </div>
                      {rTot.cal>0?(
                        <div style={{display:'flex',alignItems:'baseline',gap:3}}>
                          <span style={{fontSize:15,fontWeight:700,color:m.accent,fontFamily:DISPLAY,...NUM}}>{rTot.cal}</span>
                          <span style={{fontSize:9,color:C.dim,fontWeight:700}}>KCAL</span>
                        </div>
                      ):(
                        <div style={{fontSize:11,color:C.dim,fontFamily:DISPLAY}}>Aucun aliment</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hydratation */}
            <div style={{padding:'4px 16px 0'}}>
              <div style={{background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(0,0,0,0.03)', padding:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:13}}>
                  <div style={{display:'flex',alignItems:'center',gap:11}}>
                    <div style={{width:40,height:40,borderRadius:12,
                      background:'linear-gradient(145deg,#34D399,#2DA67D)',
                      color:'#0B1F18',display:'grid',placeItems:'center',
                      boxShadow:'0 4px 10px rgba(52,211,153,0.40), inset 0 1px 0 rgba(0,0,0,0.15)',
                      position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',inset:0,background:'radial-gradient(110% 60% at 30% 10%,rgba(0,0,0,0.14),transparent 60%)',pointerEvents:'none'}}/>
                      <I name="drop" size={18} stroke={2} color="#0B1F18"/>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Hydratation</div>
                      <div style={{fontSize:11.5,marginTop:2,fontFamily:DISPLAY}}>
                        <span style={{color:C.text,fontWeight:700,...NUM}}>{(eau*0.25).toFixed(2).replace('.',',')} L</span>
                        <span style={{color:C.dim}}> · {Math.round(eau/8*100)}%</span>
                      </div>
                    </div>
                  </div>
                  <button className="tap" onClick={()=>setEau(e=>Math.min(8,e+1))}
                    style={{padding:'7px 11px',borderRadius:999,background:'transparent',
                      border:'1px solid rgba(52,211,153,0.50)',color:'#34D399',
                      fontSize:11.5,fontWeight:700,fontFamily:DISPLAY,
                      display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                    <I name="plus" size={12} stroke={2.4}/> 250ML
                  </button>
                </div>
                <div style={{display:'flex',gap:4}}>
                  {Array.from({length:8}).map((_,i)=>{
                    const on=i<eau;
                    return(
                      <button key={i} onClick={()=>setEau(i+1===eau?i:i+1)} className="tap"
                        style={{flex:1,height:24,borderRadius:6,
                          background:on?'linear-gradient(180deg,#34D399,#2DA67D)':'rgba(0,0,0,0.03)',
                          border:`1px solid ${on?'rgba(52,211,153,0.60)':C.bd}`,
                          boxShadow:on?'0 0 8px rgba(52,211,153,0.50), inset 0 1px 0 rgba(0,0,0,0.15)':'none',
                          padding:0}}/>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fruits & Légumes */}
            <div style={{padding:'8px 16px 0'}}>
              <div style={{background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(0,0,0,0.03)', padding:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:13}}>
                  <div style={{display:'flex',alignItems:'center',gap:11}}>
                    <div style={{width:40,height:40,borderRadius:12,
                      background:'linear-gradient(145deg,#34D399,#10B981)',
                      display:'grid',placeItems:'center',fontSize:20,
                      boxShadow:'0 4px 10px rgba(52,211,153,0.40), inset 0 1px 0 rgba(0,0,0,0.15)',
                      position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',inset:0,background:'radial-gradient(110% 60% at 30% 10%,rgba(0,0,0,0.14),transparent 60%)',pointerEvents:'none'}}/>
                      🥦
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Fruits & Légumes</div>
                      <div style={{fontSize:11.5,marginTop:2,fontFamily:DISPLAY}}>
                        <span style={{color:C.text,fontWeight:700,...NUM}}>{fruitsV.fruits+fruitsV.legumes} {fruitsV.fruits+fruitsV.legumes>1?"portions":"portion"}</span>
                        <span style={{color:C.dim}}> · objectif 5/j</span>
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:C.dim,fontFamily:DISPLAY,textAlign:'right',lineHeight:1.5}}>
                    🍎 {fruitsV.fruits}<br/>🥦 {fruitsV.legumes}
                  </div>
                </div>
                {/* Ligne fruits */}
                <div style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontSize:11.5,color:C.mid,fontFamily:DISPLAY,fontWeight:600}}>🍎 Fruits</span>
                    <div style={{display:'flex',gap:5}}>
                      <button onClick={()=>setFruitsV(f=>({...f,fruits:Math.max(0,f.fruits-1)}))} style={{width:24,height:24,borderRadius:7,background:'rgba(0,0,0,0.05)',border:`1px solid ${C.bd}`,color:C.mid,cursor:'pointer',fontSize:14,display:'grid',placeItems:'center'}}>−</button>
                      <span style={{width:22,textAlign:'center',fontSize:13,fontWeight:700,color:C.text,fontFamily:DISPLAY,...NUM}}>{fruitsV.fruits}</span>
                      <button onClick={()=>setFruitsV(f=>({...f,fruits:Math.min(10,f.fruits+1)}))} style={{width:24,height:24,borderRadius:7,background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.30)',color:'#F59E0B',cursor:'pointer',fontSize:14,display:'grid',placeItems:'center'}}>+</button>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    {Array.from({length:5}).map((_,i)=>{
                      const on=i<fruitsV.fruits;
                      return <button key={i} onClick={()=>setFruitsV(f=>({...f,fruits:i+1===f.fruits?i:i+1}))} className="tap" style={{flex:1,height:22,borderRadius:6,background:on?'linear-gradient(180deg,#F59E0B,#D97706)':'rgba(0,0,0,0.03)',border:`1px solid ${on?'rgba(245,158,11,0.60)':C.bd}`,boxShadow:on?'0 0 8px rgba(245,158,11,0.40), inset 0 1px 0 rgba(0,0,0,0.15)':'none',padding:0,display:'grid',placeItems:'center',fontSize:10,color:on?'#1A1308':'transparent'}}>{on?'🍎':''}</button>;
                    })}
                  </div>
                </div>
                {/* Ligne légumes */}
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontSize:11.5,color:C.mid,fontFamily:DISPLAY,fontWeight:600}}>🥦 Légumes</span>
                    <div style={{display:'flex',gap:5}}>
                      <button onClick={()=>setFruitsV(f=>({...f,legumes:Math.max(0,f.legumes-1)}))} style={{width:24,height:24,borderRadius:7,background:'rgba(0,0,0,0.05)',border:`1px solid ${C.bd}`,color:C.mid,cursor:'pointer',fontSize:14,display:'grid',placeItems:'center'}}>−</button>
                      <span style={{width:22,textAlign:'center',fontSize:13,fontWeight:700,color:C.text,fontFamily:DISPLAY,...NUM}}>{fruitsV.legumes}</span>
                      <button onClick={()=>setFruitsV(f=>({...f,legumes:Math.min(10,f.legumes+1)}))} style={{width:24,height:24,borderRadius:7,background:'rgba(52,211,153,0.12)',border:'1px solid rgba(52,211,153,0.30)',color:'#34D399',cursor:'pointer',fontSize:14,display:'grid',placeItems:'center'}}>+</button>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    {Array.from({length:5}).map((_,i)=>{
                      const on=i<fruitsV.legumes;
                      return <button key={i} onClick={()=>setFruitsV(f=>({...f,legumes:i+1===f.legumes?i:i+1}))} className="tap" style={{flex:1,height:22,borderRadius:6,background:on?'linear-gradient(180deg,#34D399,#2DA67D)':'rgba(0,0,0,0.03)',border:`1px solid ${on?'rgba(52,211,153,0.60)':C.bd}`,boxShadow:on?'0 0 8px rgba(52,211,153,0.40), inset 0 1px 0 rgba(0,0,0,0.15)':'none',padding:0,display:'grid',placeItems:'center',fontSize:10,color:on?'#0B1F18':'transparent'}}>{on?'🥦':''}</button>;
                    })}
                  </div>
                </div>
                {/* Badge objectif atteint */}
                {(fruitsV.fruits+fruitsV.legumes)>=5&&(
                  <div style={{marginTop:12,padding:'8px 12px',background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.25)',borderRadius:10,fontSize:12,color:'#34D399',fontWeight:600,fontFamily:DISPLAY,textAlign:'center'}}>
                    🎉 Objectif 5 portions atteint aujourd'hui !
                  </div>
                )}
              </div>
            </div>

          </>
        )}


        {/* ════ SCANNER ════ */}
        {nView==="scanner"&&(
          <div style={{padding:'16px 16px 0'}}>
            <button onClick={()=>setNView("journal")}
              style={{display:'flex',alignItems:'center',gap:5,background:'transparent',
                border:'none',color:'#3B82F6',cursor:'pointer',fontSize:13,
                fontWeight:700,fontFamily:DISPLAY,padding:'4px 0',marginBottom:12}}>
              <I name="chevL" size={15} stroke={2}/> Retour
            </button>
            <div style={{background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(0,0,0,0.03)', padding:18}}>
              <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:14}}>
                <div style={{width:40,height:40,borderRadius:12,
                  background:'linear-gradient(145deg,#3B82F6,#2563EB)',
                  color:'#141A2E',display:'grid',placeItems:'center',
                  boxShadow:'0 4px 10px rgba(59,130,246,0.40), inset 0 1px 0 rgba(0,0,0,0.15)'}}>
                  <I name="scan" size={18} stroke={2} color="#141A2E"/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Scanner un produit</div>
                  <div style={{fontSize:10.5,color:C.mid,marginTop:1}}>Open Food Facts · 3M+ produits</div>
                </div>
                <button className="tap" onClick={()=>setShowCamera(true)} style={{
                  padding:'8px 14px',background:'rgba(59,130,246,0.10)',
                  border:'1px solid rgba(59,130,246,0.25)',borderRadius:12,
                  color:'#93C5FD',fontSize:12,fontWeight:600,fontFamily:DISPLAY,
                  display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Caméra
                </button>
              </div>
              <Inp placeholder="Code-barres EAN (ex: 3017620422003)" inputMode="numeric"
                value={scanCode} onChange={e=>{setScan(e.target.value);if(e.target.value.length>=8)handleScan(e.target.value);}}/>
              {scanRes&&!scanRes.error&&(
                <div style={{padding:14,background:'rgba(52,211,153,0.08)',
                  border:'1px solid rgba(52,211,153,0.25)',borderRadius:14,marginTop:8}}>
                  <div style={{fontWeight:700,fontSize:14,color:'#34D399',marginBottom:10,fontFamily:DISPLAY}}>{scanRes.n}</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
                    {[{l:`${scanRes.c} kcal`,c:"#F59E0B"},{l:`P ${scanRes.p}g`,c:"#60A5FA"},{l:`G ${scanRes.g}g`,c:"#22D3EE"},{l:`L ${scanRes.l}g`,c:"#34D399"}].map(s=>(
                      <div key={s.l} style={{padding:'4px 10px',background:`${s.c}20`,
                        border:`1px solid ${s.c}40`,borderRadius:999,
                        fontSize:11,color:s.c,fontWeight:700,fontFamily:DISPLAY}}>{s.l}</div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {[{id:"matin",l:"Matin"},{id:"midi",l:"Midi"},{id:"soir",l:"Soir"},{id:"snack",l:"Snack"}].map(r=>(
                      <button key={r.id} className="tap" onClick={()=>{
                        setRepas(rp=>({...rp,[r.id]:[...rp[r.id],scanRes]}));
                        setScanRes(null);setScan("");setNView("journal");
                        push("✅","Ajouté !",`${scanRes.n} ajouté au ${r.l.toLowerCase()}.`);
                      }} style={{flex:1,padding:'9px 4px',background:C.s2,border:`1px solid ${C.bd}`,
                        borderRadius:11,color:C.text,cursor:'pointer',fontSize:11,
                        fontFamily:DISPLAY,fontWeight:700}}>{r.l}</button>
                    ))}
                  </div>
                  <button onClick={()=>{setMyFoods(f=>[...f,{...scanRes,id:Date.now()}]);setScanRes(null);setScan("");}}
                    style={{marginTop:8,width:'100%',padding:'9px',background:'transparent',
                      border:`1px solid ${C.bd}`,borderRadius:11,color:C.mid,cursor:'pointer',
                      fontSize:11,fontFamily:DISPLAY,fontWeight:600}}>
                    💾 Sauvegarder dans ma bibliothèque
                  </button>
                </div>
              )}
              {scanRes?.error&&(
                <div style={{padding:'10px 12px',background:'rgba(248,113,113,0.10)',
                  border:'1px solid rgba(248,113,113,0.25)',borderRadius:12,
                  fontSize:11,color:'#F87171',marginTop:8}}>
                  Produit non trouvé. Ajoutez-le manuellement.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
