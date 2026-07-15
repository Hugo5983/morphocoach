import { useState, useMemo, useEffect } from"react";
import { C, DARK, FONT, NUM, SERIF } from"../../data/constants.js";
import { Card, Eyebrow, Btn, Inp, G2 } from"../../components/ui/index.jsx";
import BilanNutrition from"./BilanNutrition.jsx";
import BilanArchive from"./BilanArchive.jsx";
import RepasSheet from"./RepasSheet.jsx";
import BarcodeScanner from"./BarcodeScanner.jsx";
import PhotoAnalyse from"./PhotoAnalyse.jsx";
import { addXPNutrition } from"../../services/xpService.js";
import {
  DISPLAY, I, CalorieRing, HeroStat, MacroCard, MEALS, formatDate,
} from"./components/NutritionKit.jsx";

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
        delete log[todayISO]; // si on a tout retiré, le jour n'est plus"renseigné"
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
    const first = new Date(dates[0] +"T00:00:00");
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
          onAdd={item => {
            const wasEmpty = !(repas[m.id]?.length > 0);
            setRepas(rp=>({...rp,[m.id]:[...(rp[m.id]||[]),item]}));
            if (wasEmpty) addXPNutrition(m.id);
          }}
          onUpdate={(idx,item) => setRepas(rp=>({...rp,[m.id]:(rp[m.id]||[]).map((x,j)=>j===idx?item:x)}))}
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
    <div className="anim" style={{position:'relative',paddingBottom:32}}>
      <div style={{position:'absolute',top:130,left:'50%',transform:'translateX(-50%)',width:340,height:280,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(60,91,255,0.12),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>

      <div style={{position:'relative'}}>

        {/* ── Header ── */}
        <div style={{padding:'16px 20px 0'}}>

          {/* ─ Navigateur de date ─ */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            background:C.s1,border:`1px solid ${C.bd}`,borderRadius:16,
            padding:'12px 16px',marginBottom:16}}>
            <button className="tap-icon" onClick={()=>setDayOff(d=>d-1)} style={{
              width:32,height:32,borderRadius:12,background:'rgba(0,0,0,0.05)',
              border:`1px solid ${C.bd}`,display:'grid',placeItems:'center',cursor:'pointer'}}>
              <I name="chevL" size={15} color={C.mid} stroke={2}/>
            </button>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>
                {formatDate(dayOff)}
              </div>
              {dayOff!==0&&(
                <div style={{fontSize:11,color:C.dim,marginTop:2,fontFamily:DISPLAY}}>
                  {new Date(Date.now()+dayOff*86400000).toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}
                </div>
)}
            </div>
            <button className="tap-icon" onClick={()=>setDayOff(d=>Math.min(0,d+1))} style={{
              width:32,height:32,borderRadius:12,
              background: dayOff===0 ?'transparent' :'rgba(0,0,0,0.05)',
              border:`1px solid ${dayOff===0 ?'transparent' : C.bd}`,
              display:'grid',placeItems:'center',
              cursor:dayOff===0?'default':'pointer',
              opacity:dayOff===0?0.25:1}}>
              <I name="chevR" size={15} color={C.mid} stroke={2}/>
            </button>
          </div>

          {/* Onglets Journal / Bilan PRO */}
          <div style={{position:'relative',display:'flex',padding:4,borderRadius:12,
            background:C.s2,border:'1px solid rgba(0,0,0,0.08)',marginBottom:2}}>
            {[{id:"journal",l:"Journal"},{id:"bilan",l:"Bilan PRO"}].map(s=>{
              const on=nView===s.id;
              const isBilan=s.id==="bilan";
              return(
                <button key={s.id} onClick={()=>{
                  if(isBilan){ if(!premium){ if(setPaywall)setPaywall(true); return; } }
                  setNView(s.id);
                }} style={{position:'relative',zIndex:1,flex:1,padding:'8px 0',borderRadius:8,
                  background:on?'#FFFFFF':'transparent',
                  border:on?(isBilan?'1px solid rgba(60,91,255,0.35)':'1px solid rgba(0,0,0,0.12)'):'1px solid transparent',
                  color:on?(isBilan?C.accentDk:C.text):C.dim,
                  fontSize:13,fontWeight:700,letterSpacing:0.2,fontFamily:DISPLAY,
                  cursor:'pointer',transition:'all .25s ease',
                  boxShadow:on?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>
                  {s.l}
                  {isBilan&&!premium&&(
                    <span style={{fontSize:8,marginLeft:4,padding:'1px 4px',borderRadius:3,
                      background:'rgba(60,91,255,0.25)',color:C.blueLt,
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
            <div style={{padding:'16px 20px 0'}}>
              <CalorieRing consumed={tot.cal} goal={calObj}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:24,padding:'0 8px'}}>
                <HeroStat value={calObj}                     label="Objectif"  accent="#9DB0FF"/>
                <HeroStat value={tot.cal}                    label="Consommé"  accent={C.accent}/>
                <HeroStat value={Math.max(0,calObj-tot.cal)} label="Restant"   accent="#F59E0B"/>
              </div>
            </div>

            {/* Macro cards */}
            <div style={{padding:'16px 20px 0'}}>
              <div style={{display:'flex',gap:8}}>
                <MacroCard label="Protéines" value={tot.p} goal={pObj} color={DARK.accent} colorDk="#2438B8"/>
                <MacroCard label="Glucides"  value={tot.g} goal={gObj} color="#3C5BFF" colorDk="#2E48D9"/>
                <MacroCard label="Lipides"   value={tot.l} goal={lObj} color="#3C5BFF" colorDk="#E5484D"/>
              </div>
            </div>

            {/* Repas du jour */}
            <div style={{padding:'16px 20px 0'}}>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:12}}>
                <span style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:C.text,letterSpacing:-0.3}}>
                  Repas {isToday?"du jour":formatDate(dayOff).toLowerCase()}
                </span>
                {isToday&&(
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button className="tap" onClick={()=>setShowCamera(true)} style={{
                      display:'inline-flex',alignItems:'center',gap:8,
                      padding:'8px 16px',
                      background:'linear-gradient(145deg,#3C5BFF,#2E48D9)',
                      border:'1px solid rgba(46,72,217,0.5)',
                      borderRadius:12,color:'#FFF',
                      boxShadow:'0 4px 12px rgba(60,91,255,0.5)',
                      fontSize:13,fontWeight:700,fontFamily:DISPLAY,cursor:'pointer',
                    }}>
                      <I name="scan" size={13} stroke={2.2} color="#FFF"/> Scanner
                    </button>
                    <button className="tap" onClick={()=>setShowPhoto(true)} style={{
                      display:'inline-flex',alignItems:'center',gap:8,
                      padding:'8px 16px',
                      background: premium ?'linear-gradient(145deg,#9DB0FF,#3C5BFF)' :'linear-gradient(145deg,#C9D3FF,#9DB0FF)',
                      border: premium ?'1px solid rgba(60,91,255,0.5)' :'1px solid rgba(157,176,255,0.5)',
                      borderRadius:12,
                      color:'#FFF',
                      boxShadow:'0 4px 12px rgba(60,91,255,0.35)',
                      fontSize:13,fontWeight:700,fontFamily:DISPLAY,cursor:'pointer',
                    }}>
                      {!premium
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="1.9" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      }
                      Photo
                    </button>
                  </div>
)}
              </div>

              {/* Liste verticale — tap ouvre RepasSheet plein écran */}
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
                {MEALS.map(m=>{
                  const items=repas[m.id]||[];
                  const rTot=items.reduce((a,f)=>({cal:a.cal+f.c,p:a.p+f.p,g:a.g+f.g,l:a.l+f.l}),{cal:0,p:0,g:0,l:0});
                  const isEmpty=rTot.cal===0;
                  return(
                    <button key={m.id} className="tap" onClick={()=>setRepasSheet(m.id)}
                      style={{background:`linear-gradient(145deg,${m.accent}22,${m.accentDk}10)`,
                        border:`1px solid ${m.accent}35`,borderRadius:16,
                        padding:'12px 16px',textAlign:'left',cursor:'pointer',
                        display:'flex',alignItems:'center',gap:12,
                        transition:'box-shadow .2s'}}>
                      <div style={{width:44,height:44,borderRadius:12,
                        background:`linear-gradient(145deg,${m.accent},${m.accentDk})`,
                        display:'grid',placeItems:'center',flexShrink:0,
                        boxShadow:`0 4px 10px ${m.accent}50, inset 0 1px 0 rgba(0,0,0,0.12)`,
                        position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',inset:0,background:'radial-gradient(110% 60% at 30% 10%,rgba(0,0,0,0.12),transparent 60%)',pointerEvents:'none'}}/>
                        <I name={m.icon} size={22} stroke={2} color={m.dark}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY,letterSpacing:-0.2}}>
                          {m.l}
                        </div>
                        {isEmpty&&(
                          <div style={{fontSize:11,color:C.dim,fontFamily:DISPLAY,marginTop:2}}>Aucun aliment</div>
)}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        <div style={{textAlign:'right'}}>
                          <div style={{display:'flex',alignItems:'baseline',gap:4,justifyContent:'flex-end'}}>
                            <span style={{fontSize:16,fontWeight:700,color:isEmpty?C.dim:m.accent,fontFamily:DISPLAY,...NUM}}>{rTot.cal}</span>
                            <span style={{fontSize:10,color:C.dim,fontWeight:700}}>KCAL</span>
                          </div>
                        </div>
                        <I name="chevR" size={16} stroke={2} color={C.dim}/>
                      </div>
                    </button>
);
                })}
              </div>
            </div>

            {/* Hydratation */}
            <div style={{padding:'4px 16px 0'}}>
              <div style={{background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(0,0,0,0.05)', padding:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:40,height:40,borderRadius:12,
                      background:'linear-gradient(145deg,#12B76A,#12B76A)',
                      color:'#101318',display:'grid',placeItems:'center',
                      boxShadow:'0 4px 10px rgba(18,183,106,0.35), inset 0 1px 0 rgba(0,0,0,0.12)',
                      position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',inset:0,background:'radial-gradient(110% 60% at 30% 10%,rgba(0,0,0,0.12),transparent 60%)',pointerEvents:'none'}}/>
                      <I name="drop" size={18} stroke={2} color="#101318"/>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Hydratation</div>
                      <div style={{fontSize:11,marginTop:2,fontFamily:DISPLAY}}>
                        <span style={{color:C.text,fontWeight:700,...NUM}}>{(eau*0.25).toFixed(2).replace('.',',')} L</span>
                        <span style={{color:C.dim}}> · {Math.round(eau/8*100)}%</span>
                      </div>
                    </div>
                  </div>
                  <button className="tap" onClick={()=>setEau(e=>Math.min(8,e+1))}
                    style={{padding:'8px 12px',borderRadius:999,background:'transparent',
                      border:'1px solid rgba(18,183,106,0.5)',color:'#12B76A',
                      fontSize:11,fontWeight:700,fontFamily:DISPLAY,
                      display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                    <I name="plus" size={12} stroke={2.4}/> 250ML
                  </button>
                </div>
                <div style={{display:'flex',gap:4}}>
                  {Array.from({length:8}).map((_,i)=>{
                    const on=i<eau;
                    return(
                      <button key={i} onClick={()=>setEau(i+1===eau?i:i+1)} className="tap"
                        style={{flex:1,height:24,borderRadius:8,
                          background:on?'linear-gradient(180deg,#12B76A,#12B76A)':'rgba(0,0,0,0.05)',
                          border:`1px solid ${on?'rgba(18,183,106,0.65)':C.bd}`,
                          boxShadow:on?'0 0 8px rgba(18,183,106,0.5), inset 0 1px 0 rgba(0,0,0,0.12)':'none',
                          padding:0}}/>
);
                  })}
                </div>
              </div>
            </div>

            {/* Fruits & Légumes */}
            <div style={{padding:'8px 16px 0'}}>
              <div style={{background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(0,0,0,0.05)', padding:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:40,height:40,borderRadius:12,
                      background:'linear-gradient(145deg,#12B76A,#12B76A)',
                      display:'grid',placeItems:'center',fontSize:20,
                      boxShadow:'0 4px 10px rgba(18,183,106,0.35), inset 0 1px 0 rgba(0,0,0,0.12)',
                      position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',inset:0,background:'radial-gradient(110% 60% at 30% 10%,rgba(0,0,0,0.12),transparent 60%)',pointerEvents:'none'}}/>
                      
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Fruits & Légumes</div>
                      <div style={{fontSize:11,marginTop:2,fontFamily:DISPLAY}}>
                        <span style={{color:C.text,fontWeight:700,...NUM}}>{fruitsV.fruits+fruitsV.legumes} {fruitsV.fruits+fruitsV.legumes>1?"portions":"portion"}</span>
                        <span style={{color:C.dim}}> · objectif 5/j</span>
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:C.dim,fontFamily:DISPLAY,textAlign:'right',lineHeight:1.5}}>
                     {fruitsV.fruits}<br/> {fruitsV.legumes}
                  </div>
                </div>
                {/* Ligne fruits */}
                <div style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:11,color:C.mid,fontFamily:DISPLAY,fontWeight:600}}> Fruits</span>
                    <div style={{display:'flex',gap:4}}>
                      <button onClick={()=>setFruitsV(f=>({...f,fruits:Math.max(0,f.fruits-1)}))} style={{width:24,height:24,borderRadius:8,background:'rgba(0,0,0,0.05)',border:`1px solid ${C.bd}`,color:C.mid,cursor:'pointer',fontSize:14,display:'grid',placeItems:'center'}}>−</button>
                      <span style={{width:22,textAlign:'center',fontSize:13,fontWeight:700,color:C.text,fontFamily:DISPLAY,...NUM}}>{fruitsV.fruits}</span>
                      <button onClick={()=>setFruitsV(f=>({...f,fruits:Math.min(10,f.fruits+1)}))} style={{width:24,height:24,borderRadius:8,background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.25)',color:'#F59E0B',cursor:'pointer',fontSize:14,display:'grid',placeItems:'center'}}>+</button>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    {Array.from({length:5}).map((_,i)=>{
                      const on=i<fruitsV.fruits;
                      return <button key={i} onClick={()=>setFruitsV(f=>({...f,fruits:i+1===f.fruits?i:i+1}))} className="tap" style={{flex:1,height:22,borderRadius:8,background:on?'linear-gradient(180deg,#F59E0B,#F59E0B)':'rgba(0,0,0,0.05)',border:`1px solid ${on?'rgba(245,158,11,0.65)':C.bd}`,boxShadow:on?'0 0 8px rgba(245,158,11,0.35), inset 0 1px 0 rgba(0,0,0,0.12)':'none',padding:0,display:'grid',placeItems:'center',fontSize:10,color:on?'#101318':'transparent'}}>{on?'':''}</button>;
                    })}
                  </div>
                </div>
                {/* Ligne légumes */}
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:11,color:C.mid,fontFamily:DISPLAY,fontWeight:600}}> Légumes</span>
                    <div style={{display:'flex',gap:4}}>
                      <button onClick={()=>setFruitsV(f=>({...f,legumes:Math.max(0,f.legumes-1)}))} style={{width:24,height:24,borderRadius:8,background:'rgba(0,0,0,0.05)',border:`1px solid ${C.bd}`,color:C.mid,cursor:'pointer',fontSize:14,display:'grid',placeItems:'center'}}>−</button>
                      <span style={{width:22,textAlign:'center',fontSize:13,fontWeight:700,color:C.text,fontFamily:DISPLAY,...NUM}}>{fruitsV.legumes}</span>
                      <button onClick={()=>setFruitsV(f=>({...f,legumes:Math.min(10,f.legumes+1)}))} style={{width:24,height:24,borderRadius:8,background:'rgba(18,183,106,0.12)',border:'1px solid rgba(18,183,106,0.25)',color:'#12B76A',cursor:'pointer',fontSize:14,display:'grid',placeItems:'center'}}>+</button>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    {Array.from({length:5}).map((_,i)=>{
                      const on=i<fruitsV.legumes;
                      return <button key={i} onClick={()=>setFruitsV(f=>({...f,legumes:i+1===f.legumes?i:i+1}))} className="tap" style={{flex:1,height:22,borderRadius:8,background:on?'linear-gradient(180deg,#12B76A,#12B76A)':'rgba(0,0,0,0.05)',border:`1px solid ${on?'rgba(18,183,106,0.65)':C.bd}`,boxShadow:on?'0 0 8px rgba(18,183,106,0.35), inset 0 1px 0 rgba(0,0,0,0.12)':'none',padding:0,display:'grid',placeItems:'center',fontSize:10,color:on?'#101318':'transparent'}}>{on?'':''}</button>;
                    })}
                  </div>
                </div>
                {/* Badge objectif atteint */}
                {(fruitsV.fruits+fruitsV.legumes)>=5&&(
                  <div style={{marginTop:12,padding:'8px 12px',background:'rgba(18,183,106,0.08)',border:'1px solid rgba(18,183,106,0.25)',borderRadius:12,fontSize:13,color:'#12B76A',fontWeight:600,fontFamily:DISPLAY,textAlign:'center'}}>
                     Objectif 5 portions atteint aujourd'hui !
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
              style={{display:'flex',alignItems:'center',gap:4,background:'transparent',
                border:'none',color:C.accent,cursor:'pointer',fontSize:13,
                fontWeight:700,fontFamily:DISPLAY,padding:'4px 0',marginBottom:12}}>
              <I name="chevL" size={15} stroke={2}/> Retour
            </button>
            <div style={{background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(0,0,0,0.05)', padding:20}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <div style={{width:40,height:40,borderRadius:12,
                  background:'linear-gradient(145deg,#3C5BFF,#2E48D9)',
                  color:DARK.surface,display:'grid',placeItems:'center',
                  boxShadow:'0 4px 10px rgba(60,91,255,0.35), inset 0 1px 0 rgba(0,0,0,0.12)'}}>
                  <I name="scan" size={18} stroke={2} color={DARK.surface}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Scanner un produit</div>
                  <div style={{fontSize:11,color:C.mid,marginTop:1}}>Open Food Facts · 3M+ produits</div>
                </div>
                <button className="tap" onClick={()=>setShowCamera(true)} style={{
                  padding:'8px 16px',background:'rgba(60,91,255,0.12)',
                  border:'1px solid rgba(60,91,255,0.25)',borderRadius:12,
                  color:C.blueLt,fontSize:13,fontWeight:600,fontFamily:DISPLAY,
                  display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Caméra
                </button>
              </div>
              <Inp placeholder="Code-barres EAN (ex: 3017620422003)" inputMode="numeric"
                value={scanCode} onChange={e=>{setScan(e.target.value);if(e.target.value.length>=8)handleScan(e.target.value);}}/>
              {scanRes&&!scanRes.error&&(
                <div style={{padding:16,background:'rgba(18,183,106,0.08)',
                  border:'1px solid rgba(18,183,106,0.25)',borderRadius:16,marginTop:8}}>
                  <div style={{fontWeight:700,fontSize:14,color:'#12B76A',marginBottom:12,fontFamily:DISPLAY}}>{scanRes.n}</div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:12}}>
                    {[{l:`${scanRes.c} kcal`,c:"#F59E0B"},{l:`P ${scanRes.p}g`,c:DARK.accent},{l:`G ${scanRes.g}g`,c:"#3C5BFF"},{l:`L ${scanRes.l}g`,c:"#12B76A"}].map(s=>(
                      <div key={s.l} style={{padding:'4px 12px',background:`${s.c}20`,
                        border:`1px solid ${s.c}40`,borderRadius:999,
                        fontSize:11,color:s.c,fontWeight:700,fontFamily:DISPLAY}}>{s.l}</div>
))}
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    {[{id:"matin",l:"Matin"},{id:"midi",l:"Midi"},{id:"soir",l:"Soir"},{id:"snack",l:"Snack"}].map(r=>(
                      <button key={r.id} className="tap" onClick={()=>{
                        setRepas(rp=>({...rp,[r.id]:[...rp[r.id],scanRes]}));
                        setScanRes(null);setScan("");setNView("journal");
                        push("","Ajouté !",`${scanRes.n} ajouté au ${r.l.toLowerCase()}.`);
                      }} style={{flex:1,padding:'8px 4px',background:C.s2,border:`1px solid ${C.bd}`,
                        borderRadius:12,color:C.text,cursor:'pointer',fontSize:11,
                        fontFamily:DISPLAY,fontWeight:700}}>{r.l}</button>
))}
                  </div>
                  <button onClick={()=>{setMyFoods(f=>[...f,{...scanRes,id:Date.now()}]);setScanRes(null);setScan("");}}
                    style={{marginTop:8,width:'100%',padding:'8px',background:'transparent',
                      border:`1px solid ${C.bd}`,borderRadius:12,color:C.mid,cursor:'pointer',
                      fontSize:11,fontFamily:DISPLAY,fontWeight:600}}>
                     Sauvegarder dans ma bibliothèque
                  </button>
                </div>
)}
              {scanRes?.error&&(
                <div style={{padding:'12px 12px',background:'rgba(229,72,77,0.12)',
                  border:'1px solid rgba(229,72,77,0.25)',borderRadius:12,
                  fontSize:11,color:'#E5484D',marginTop:8}}>
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

