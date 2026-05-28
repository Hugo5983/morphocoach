import { useState } from "react";
import { INT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Box, Lbl, Btn, Row } from "../../components/ui/index.jsx";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { MonthCal } from "../../components/ui/MonthCal.jsx";

// ─── ERGOMÈTRES — définitions + calculs calories ─────────────────────────────
const ERGOS = [
  { id:"tapis",     l:"Tapis roulant",    i:"🏃",  color:"#4D8BFF",
    params:[{k:"vitesse",l:"Vitesse",unit:"km/h",def:"10"},{k:"pente",l:"Pente",unit:"%",def:"1"}],
    kcal:(p,kg,min)=>{ const v=parseFloat(p.vitesse)||8,pnt=parseFloat(p.pente)||0; return Math.round((v*0.82+pnt*0.5)*kg*min/60); } },
  { id:"marche",    l:"Marche rapide",    i:"🚶",  color:"#5FE0A5",
    params:[{k:"vitesse",l:"Vitesse",unit:"km/h",def:"5"},{k:"pente",l:"Pente",unit:"%",def:"3"}],
    kcal:(p,kg,min)=>{ const v=parseFloat(p.vitesse)||5,pnt=parseFloat(p.pente)||0; return Math.round((2.5+v*0.4+pnt*0.4)*kg*min/60); } },
  { id:"velo",      l:"Vélo stationnaire",i:"🚴",  color:"#FFAB5D",
    params:[{k:"resistance",l:"Résistance",unit:"/20",def:"12"},{k:"cadence",l:"Cadence",unit:"RPM",def:"80"},{k:"watts",l:"Puissance",unit:"W",def:""}],
    kcal:(p,kg,min)=>{ const w=parseFloat(p.watts),res=parseFloat(p.resistance)||10; return Math.round((w?w*0.014+2:3+res*0.5)*kg*min/60); } },
  { id:"elliptique",l:"Elliptique",       i:"🔄",  color:"#B69DFF",
    params:[{k:"resistance",l:"Résistance",unit:"/20",def:"10"},{k:"cadence",l:"Cadence",unit:"SPM",def:"70"}],
    kcal:(p,kg,min)=>{ const res=parseFloat(p.resistance)||8; return Math.round((4+res*0.4)*kg*min/60); } },
  { id:"rameur",    l:"Rameur",           i:"🚣",  color:"#06b6d4",
    params:[{k:"split",l:"Split 500m",unit:"ex: 2:10",def:""},{k:"watts",l:"Puissance",unit:"W",def:""}],
    kcal:(p,kg,min)=>{ const w=parseFloat(p.watts); if(w) return Math.round(w*min/60*0.86*0.24); const sp=p.split||"2:15"; const parts=sp.split(":"); const sec=(parseInt(parts[0])||2)*60+(parseInt(parts[1])||15); const pw=Math.pow(2.8/(sec/500),3); return Math.round(pw*min/60*0.86*0.24); } },
  { id:"stairmaster",l:"StairMaster",     i:"🪜",  color:"#FF7A6B",
    params:[{k:"vitesse",l:"Vitesse",unit:"étages/min",def:"60"}],
    kcal:(p,kg,min)=>{ const v=parseFloat(p.vitesse)||60; return Math.round((6+v/40)*kg*min/60); } },
  { id:"skierg",    l:"Ski Erg",          i:"⛷️",  color:"#4D8BFF",
    params:[{k:"split",l:"Split 500m",unit:"ex: 2:20",def:""},{k:"watts",l:"Puissance",unit:"W",def:""}],
    kcal:(p,kg,min)=>{ const w=parseFloat(p.watts)||100; return Math.round(w*min/60*0.7*0.24); } },
  { id:"assault",   l:"Assault Bike",     i:"💨",  color:"#FF7A6B",
    params:[{k:"rpm",l:"RPM",unit:"tr/min",def:"70"},{k:"watts",l:"Puissance",unit:"W",def:""}],
    kcal:(p,kg,min)=>{ const w=parseFloat(p.watts),rpm=parseFloat(p.rpm)||70; return Math.round((w?w*0.75*0.24:rpm*0.3+5)*kg*min/60); } },
  { id:"airrunner", l:"Air Runner",       i:"🌀",  color:"#FFAB5D",
    params:[{k:"vitesse",l:"Vitesse",unit:"km/h",def:"12"}],
    kcal:(p,kg,min)=>{ const v=parseFloat(p.vitesse)||10; return Math.round(v*1.1*kg*min/60); } },
  { id:"corde",     l:"Corde à sauter",   i:"🪢",  color:"#5FE0A5",
    params:[{k:"rpm",l:"Sauts/min",unit:"s/min",def:"120"}],
    kcal:(p,kg,min)=>{ const rpm=parseFloat(p.rpm)||100; return Math.round((8+rpm/100)*kg*min/60); } },
  { id:"velo_ext",  l:"Vélo extérieur",   i:"🚵",  color:"#FFAB5D",
    params:[{k:"vitesse",l:"Vitesse moy.",unit:"km/h",def:"25"},{k:"denivele",l:"Dénivelé+",unit:"m",def:"0"}],
    kcal:(p,kg,min)=>{ const v=parseFloat(p.vitesse)||20,d=parseFloat(p.denivele)||0; return Math.round((2+v*0.3+d/100)*kg*min/60); } },
  { id:"course",    l:"Course à pied",    i:"🏅",  color:"#4D8BFF",
    params:[{k:"vitesse",l:"Vitesse",unit:"km/h",def:"10"},{k:"denivele",l:"Dénivelé+",unit:"m",def:"0"}],
    kcal:(p,kg,min)=>{ const v=parseFloat(p.vitesse)||10,d=parseFloat(p.denivele)||0; return Math.round((v*0.82+d/100+2)*kg*min/60); } },
];

const ZONES = [
  {id:"z1",l:"Z1",pct:"50-60%",desc:"Récupération active",color:"#5FE0A5",facteur:0.85},
  {id:"z2",l:"Z2",pct:"60-70%",desc:"Endurance aérobie",color:"#4D8BFF",facteur:1.0},
  {id:"z3",l:"Z3",pct:"70-80%",desc:"Tempo / Cardio",color:"#FFAB5D",facteur:1.15},
  {id:"z4",l:"Z4",pct:"80-90%",desc:"Seuil anaérobie",color:"#FF7A6B",facteur:1.3},
  {id:"z5",l:"Z5",pct:"90-100%",desc:"VO2max / Sprint",color:"#B69DFF",facteur:1.5},
];

// ─── CARDIO MODAL ─────────────────────────────────────────────────────────────
function CardioModal({ onClose, onSave, poids, C }) {
  const [step, setStep]       = useState(0);      // 0=choix ergo, 1=config
  const [ergo, setErgo]       = useState(null);
  const [duree, setDuree]     = useState(30);
  const [params, setParams]   = useState({});
  const [zone, setZone]       = useState("z2");
  const [bpm, setBpm]         = useState("");
  const [kcalManuel, setKcalManuel] = useState("");
  const [editKcal, setEditKcal]     = useState(false);

  const kg = parseFloat(poids) || 70;

  const kcalAuto = ergo
    ? Math.round(ergo.kcal(params, kg, duree) * (ZONES.find(z=>z.id===zone)?.facteur||1))
    : 0;

  const kcalFinal = editKcal && kcalManuel !== "" ? parseInt(kcalManuel) : kcalAuto;

  const handleSave = () => {
    const z = ZONES.find(z => z.id === zone);
    const intensiteMap = { z1:"leger", z2:"modere", z3:"modere", z4:"lourd", z5:"intense" };
    const summary = Object.entries(params)
      .filter(([,v]) => v)
      .map(([k,v]) => { const param = ergo.params.find(p=>p.k===k); return param ? `${v}${param.unit}` : v; })
      .join(" · ");
    onSave({
      nom: `${ergo.l}${summary ? " · " + summary : ""} · ${duree}min`,
      intensite: intensiteMap[zone] || "modere",
      color: ergo.color,
      cardio: { ergoId: ergo.id, ergoNom: ergo.l, duree, params, zone, bpm, kcal: kcalFinal },
    });
  };

  return (
    <div style={{minHeight:"100vh",background:"#0B0F1F"}}>
      <div style={{paddingBottom:80}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 16px 14px"}}>
          <div>
            <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Cardio</div>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:300,color:"#F5F1E8"}}>
              {step===0 ? "Choix de l'ergomètre" : ergo?.l}
            </div>
          </div>
          <button onClick={onClose} style={{background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,width:36,height:36,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:18}}>×</button>
        </div>

        <div style={{padding:"0 16px"}}>

          {/* ── STEP 0 : sélection ergomètre ── */}
          {step === 0 && (
            <div>
              <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",marginBottom:12}}>Sélectionne ta machine ou activité</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {ERGOS.map(e => (
                  <div key={e.id} onClick={() => { setErgo(e); const defs={}; e.params.forEach(p=>{ defs[p.k]=p.def||""; }); setParams(defs); setStep(1); }}
                    style={{padding:"14px 12px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"border-color .15s"}}
                    onMouseEnter={ev=>ev.currentTarget.style.borderColor=e.color}
                    onMouseLeave={ev=>ev.currentTarget.style.borderColor="rgba(190,180,255,0.07)"}>
                    <div style={{fontSize:22,flexShrink:0}}>{e.i}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:500,color:"#F5F1E8",lineHeight:1.2}}>{e.l}</div>
                      <div style={{fontSize:9,color:e.color,fontWeight:600,marginTop:2}}>{e.params.map(p=>p.unit).filter(Boolean).slice(0,2).join(" · ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1 : configuration ── */}
          {step === 1 && ergo && (
            <div>
              <button onClick={() => setStep(0)} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:12,fontWeight:600,padding:"0 0 14px",display:"flex",alignItems:"center",gap:4}}>← Changer d'ergomètre</button>

              {/* Durée */}
              <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>Durée</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={() => setDuree(d => Math.max(5,d-5))} style={{width:36,height:36,borderRadius:9,background:"#1C2440",border:"none",cursor:"pointer",fontSize:18,fontWeight:300,color:"rgba(245,241,232,0.50)"}}>−</button>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:32,fontWeight:300,color:"#F5F1E8",lineHeight:1}}>{duree}</div>
                    <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",marginTop:2}}>minutes</div>
                  </div>
                  <button onClick={() => setDuree(d => Math.min(180,d+5))} style={{width:36,height:36,borderRadius:9,background:"#4D8BFF",border:"none",cursor:"pointer",fontSize:18,color:"#141A2E"}}>+</button>
                </div>
                <div style={{display:"flex",gap:6,marginTop:12}}>
                  {[15,20,30,45,60,90].map(d => (
                    <button key={d} onClick={() => setDuree(d)} style={{flex:1,padding:"5px 2px",background:duree===d?"rgba(59,130,246,0.1)":"transparent",border:`0.5px solid ${duree===d?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:7,color:duree===d?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:10,fontWeight:duree===d?600:400}}>{d}'</button>
                  ))}
                </div>
              </div>

              {/* Paramètres spécifiques à l'ergomètre */}
              <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>Paramètres</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {ergo.params.map(p => (
                    <div key={p.k}>
                      <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginBottom:5,fontWeight:500}}>{p.l}{p.unit&&p.unit!=="ex: 2:10"&&p.unit!=="ex: 2:20"&&p.unit!=="ex: 2:05"&&p.unit!=="ex: 2:15" ? ` (${p.unit})` : ""}</div>
                      {p.opts ? (
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {p.opts.map(o => (
                            <button key={o} onClick={() => setParams(pr=>({...pr,[p.k]:o}))} style={{padding:"5px 10px",borderRadius:8,border:`0.5px solid ${(params[p.k]||p.def)===o?"#4D8BFF":"rgba(190,180,255,0.07)"}`,background:(params[p.k]||p.def)===o?"rgba(59,130,246,0.08)":"transparent",color:(params[p.k]||p.def)===o?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:11,fontWeight:500}}>{o}</button>
                          ))}
                        </div>
                      ) : (
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <input
                            value={params[p.k] ?? ""}
                            onChange={e => setParams(pr=>({...pr,[p.k]:e.target.value}))}
                            placeholder={p.unit.startsWith("ex:")?p.unit:p.def||"—"}
                            style={{flex:1,padding:"8px 10px",background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:12,color:"#F5F1E8",fontFamily:"'Inter',sans-serif"}}
                          />
                          {p.unit&&!p.unit.startsWith("ex:")&&<span style={{fontSize:10,color:"rgba(245,241,232,0.50)",flexShrink:0}}>{p.unit}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones cardiaques */}
              <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>Zone cardiaque</div>
                <div style={{display:"flex",gap:5,marginBottom:10}}>
                  {ZONES.map(z => (
                    <button key={z.id} onClick={() => setZone(z.id)} style={{flex:1,padding:"8px 2px",textAlign:"center",background:zone===z.id?`${z.color}15`:"transparent",border:`1px solid ${zone===z.id?z.color:"rgba(190,180,255,0.07)"}`,borderRadius:9,cursor:"pointer",transition:"all .12s"}}>
                      <div style={{fontSize:10,fontWeight:700,color:zone===z.id?z.color:"rgba(245,241,232,0.50)"}}>{z.l}</div>
                      <div style={{fontSize:8,color:zone===z.id?z.color:"rgba(245,241,232,0.50)",marginTop:1}}>{z.pct}</div>
                    </button>
                  ))}
                </div>
                <div style={{padding:"7px 10px",background:`${ZONES.find(z=>z.id===zone)?.color}10`,borderRadius:8,fontSize:10,color:ZONES.find(z=>z.id===zone)?.color,fontWeight:500}}>
                  {ZONES.find(z=>z.id===zone)?.desc}
                </div>
                {/* BPM optionnel */}
                <div style={{marginTop:10,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",fontWeight:500,flexShrink:0}}>BPM moyen</div>
                  <input value={bpm} onChange={e=>setBpm(e.target.value)} placeholder="ex: 145 (facultatif)" style={{flex:1,padding:"7px 10px",background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:12,color:"#F5F1E8",fontFamily:"'Inter',sans-serif"}}/>
                </div>
              </div>

              {/* Calories */}
              <div style={{background:"#141A2E",border:`1px solid ${kcalFinal>0?"rgba(59,130,246,0.2)":"rgba(190,180,255,0.07)"}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>Calories estimées</div>
                  <button onClick={() => { setEditKcal(e=>!e); setKcalManuel(String(kcalAuto)); }} style={{fontSize:10,color:"#4D8BFF",background:"transparent",border:"none",cursor:"pointer",fontWeight:600}}>{editKcal?"Auto":"Modifier"}</button>
                </div>
                {editKcal ? (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input value={kcalManuel} onChange={e=>setKcalManuel(e.target.value)} style={{flex:1,padding:"10px 12px",background:"#1C2440",border:"0.5px solid #4D8BFF",borderRadius:9,fontSize:16,fontWeight:500,color:"#F5F1E8",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}/>
                    <span style={{fontSize:12,color:"rgba(245,241,232,0.50)"}}>kcal</span>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                    <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:36,fontWeight:300,color:kcalAuto>0?"#4D8BFF":"rgba(245,241,232,0.32)",lineHeight:1}}>{kcalAuto>0?kcalAuto:"—"}</div>
                    {kcalAuto>0&&<div style={{fontSize:12,color:"rgba(245,241,232,0.50)"}}>kcal</div>}
                  </div>
                )}
                {kcalAuto>0&&!editKcal&&(
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginTop:4}}>
                    Estimation basée sur les paramètres · {poids||"70"}kg · {duree}min
                  </div>
                )}
              </div>

              <button onClick={handleSave} style={{width:"100%",padding:"14px",background:"#4D8BFF",border:"none",borderRadius:12,color:"#141A2E",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",marginBottom:8}}>
                ✓ Enregistrer la séance
              </button>
              <button onClick={onClose} style={{width:"100%",padding:"10px",background:"transparent",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Annuler</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── SPORTS — 30 activités sportives + MET ───────────────────────────────────
const SPORTS = [
  {id:"football",   l:"Football",          i:"⚽", color:"#5FE0A5", met:8.5},
  {id:"basketball", l:"Basketball",        i:"🏀", color:"#FFAB5D", met:7.0},
  {id:"tennis",     l:"Tennis",            i:"🎾", color:"#FFC857", met:7.5},
  {id:"padel",      l:"Padel",             i:"🏸", color:"#84cc16", met:7.0},
  {id:"rugby",      l:"Rugby",             i:"🏉", color:"#a16207", met:8.5},
  {id:"volleyball", l:"Volleyball",        i:"🏐", color:"#4D8BFF", met:5.0},
  {id:"handball",   l:"Handball",          i:"🤾", color:"#FFAB5D", met:8.0},
  {id:"badminton",  l:"Badminton",         i:"🏸", color:"#06b6d4", met:6.5},
  {id:"pingpong",   l:"Tennis de table",   i:"🏓", color:"#4D8BFF", met:4.5},
  {id:"squash",     l:"Squash",            i:"🎾", color:"#FF7A6B", met:12.0},
  {id:"boxe",       l:"Boxe",              i:"🥊", color:"#FF7A6B", met:9.5},
  {id:"mma",        l:"MMA / Kickboxing",  i:"🥋", color:"#dc2626", met:10.5},
  {id:"judo",       l:"Judo / Jiu-jitsu",  i:"🥋", color:"#1d4ed8", met:9.0},
  {id:"karate",     l:"Karaté / Arts mart.",i:"🥷", color:"#7c3aed", met:8.5},
  {id:"escalade",   l:"Escalade",          i:"🧗", color:"#D67A2E", met:8.0},
  {id:"yoga",       l:"Yoga",              i:"🧘", color:"#B69DFF", met:3.0},
  {id:"pilates",    l:"Pilates",           i:"🧘", color:"#a855f7", met:3.5},
  {id:"crossfit",   l:"CrossFit",          i:"🏋️", color:"#FFAB5D", met:10.0},
  {id:"surf",       l:"Surf",              i:"🏄", color:"#0284c7", met:6.0},
  {id:"ski",        l:"Ski / Snowboard",   i:"⛷️", color:"#bfdbfe", met:7.5},
  {id:"golf",       l:"Golf",              i:"⛳", color:"#16a34a", met:4.5},
  {id:"cyclisme",   l:"Cyclisme route",    i:"🚵", color:"#FFAB5D", met:9.0},
  {id:"triathlon",  l:"Triathlon",         i:"🏅", color:"#0ea5e9", met:11.0},
  {id:"athletisme", l:"Athlétisme",        i:"🏃", color:"#4D8BFF", met:10.0},
  {id:"danse",      l:"Danse / Zumba",     i:"💃", color:"#ec4899", met:6.0},
  {id:"hockey",     l:"Hockey",            i:"🏒", color:"rgba(245,241,232,0.50)", met:8.0},
  {id:"equitation", l:"Équitation",        i:"🐎", color:"#D67A2E", met:5.0},
  {id:"roller",     l:"Roller / Skate",    i:"🛹", color:"#FFAB5D", met:8.0},
  {id:"petanque",   l:"Pétanque",          i:"🎯", color:"#6b7280", met:2.5},
];

// ─── SPORT MODAL ──────────────────────────────────────────────────────────────
function SportModal({ onClose, onSave, poids, C }) {
  const [sport,     setSport]     = useState(null);
  const [duree,     setDuree]     = useState(60);
  const [kcalManuel,setKcalManuel]= useState("");
  const [editKcal,  setEditKcal]  = useState(false);

  const kg       = parseFloat(poids) || 70;
  const kcalAuto = sport ? Math.round(sport.met * kg * duree / 60) : 0;
  const kcalFinal = editKcal && kcalManuel !== "" ? parseInt(kcalManuel) : kcalAuto;

  const handleSave = () => {
    onSave({
      nom: `${sport.l} · ${duree}min`,
      intensite: kcalAuto > 500 ? "intense" : kcalAuto > 350 ? "lourd" : kcalAuto > 200 ? "modere" : "leger",
      color: sport.color,
      sport: { sportId: sport.id, sportNom: sport.l, duree, kcal: kcalFinal },
    });
  };

  return (
    <div style={{minHeight:"100vh",background:"#0B0F1F"}}>
      <div style={{paddingBottom:80}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 16px 14px"}}>
          <div>
            <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Activité sportive</div>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:300,color:"#F5F1E8"}}>
              {sport ? sport.l : "Choix du sport"}
            </div>
          </div>
          <button onClick={onClose} style={{background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,width:36,height:36,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:18}}>×</button>
        </div>

        <div style={{padding:"0 16px"}}>
          {/* Sélection sport */}
          {!sport && (
            <div>
              <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",marginBottom:12}}>Sélectionne ton sport</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {SPORTS.map(s => (
                  <div key={s.id} onClick={() => setSport(s)}
                    style={{padding:"11px 12px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:11,cursor:"pointer",display:"flex",alignItems:"center",gap:9,transition:"border-color .15s"}}
                    onMouseEnter={ev => ev.currentTarget.style.borderColor = s.color}
                    onMouseLeave={ev => ev.currentTarget.style.borderColor = "rgba(190,180,255,0.07)"}>
                    <div style={{fontSize:20,flexShrink:0}}>{s.i}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:500,color:"#F5F1E8",lineHeight:1.3}}>{s.l}</div>
                      <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",marginTop:1}}>~{Math.round(s.met*70)} kcal/h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration après sélection */}
          {sport && (
            <div>
              <button onClick={() => setSport(null)} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:12,fontWeight:600,padding:"0 0 14px",display:"flex",alignItems:"center",gap:4}}>← Changer de sport</button>

              {/* Sport sélectionné */}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:`${sport.color}10`,border:`0.5px solid ${sport.color}30`,borderRadius:12,marginBottom:12}}>
                <div style={{fontSize:28}}>{sport.i}</div>
                <div>
                  <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:16,fontWeight:400,color:"#F5F1E8"}}>{sport.l}</div>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginTop:2}}>MET {sport.met} · Intensité {sport.met>=10?"élevée":sport.met>=6?"modérée":"faible"}</div>
                </div>
              </div>

              {/* Durée */}
              <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>Durée</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={() => setDuree(d => Math.max(5,d-5))} style={{width:36,height:36,borderRadius:9,background:"#1C2440",border:"none",cursor:"pointer",fontSize:18,fontWeight:300,color:"rgba(245,241,232,0.50)"}}>−</button>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:32,fontWeight:300,color:"#F5F1E8",lineHeight:1}}>{duree}</div>
                    <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",marginTop:2}}>minutes</div>
                  </div>
                  <button onClick={() => setDuree(d => Math.min(240,d+5))} style={{width:36,height:36,borderRadius:9,background:"#4D8BFF",border:"none",cursor:"pointer",fontSize:18,color:"#141A2E"}}>+</button>
                </div>
                <div style={{display:"flex",gap:6,marginTop:12}}>
                  {[30,45,60,75,90,120].map(d => (
                    <button key={d} onClick={() => setDuree(d)} style={{flex:1,padding:"5px 2px",background:duree===d?"rgba(59,130,246,0.1)":"transparent",border:`0.5px solid ${duree===d?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:7,color:duree===d?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:10,fontWeight:duree===d?600:400}}>{d}'</button>
                  ))}
                </div>
              </div>

              {/* Calories */}
              <div style={{background:"#141A2E",border:`1px solid ${kcalAuto>0?"rgba(59,130,246,0.2)":"rgba(190,180,255,0.07)"}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>Calories brûlées <span style={{color:"rgba(245,241,232,0.50)",fontWeight:400,fontSize:8}}>(facultatif)</span></div>
                  <button onClick={() => { setEditKcal(e=>!e); setKcalManuel(String(kcalAuto)); }} style={{fontSize:10,color:"#4D8BFF",background:"transparent",border:"none",cursor:"pointer",fontWeight:600}}>{editKcal?"Auto":"Modifier"}</button>
                </div>
                {editKcal ? (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input value={kcalManuel} onChange={e=>setKcalManuel(e.target.value)} style={{flex:1,padding:"10px 12px",background:"#1C2440",border:"0.5px solid #4D8BFF",borderRadius:9,fontSize:16,fontWeight:500,color:"#F5F1E8",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}/>
                    <span style={{fontSize:12,color:"rgba(245,241,232,0.50)"}}>kcal</span>
                  </div>
                ) : (
                  <div>
                    <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                      <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:36,fontWeight:300,color:"#4D8BFF",lineHeight:1}}>{kcalAuto}</div>
                      <div style={{fontSize:12,color:"rgba(245,241,232,0.50)"}}>kcal</div>
                    </div>
                    <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginTop:4}}>Estimation MET {sport.met} · {poids||70}kg · {duree}min</div>
                  </div>
                )}
              </div>

              <button onClick={handleSave} style={{width:"100%",padding:"14px",background:"#4D8BFF",border:"none",borderRadius:12,color:"#141A2E",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",marginBottom:8}}>
                ✓ Enregistrer la séance
              </button>
              <button onClick={onClose} style={{width:"100%",padding:"10px",background:"transparent",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Annuler</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HELPER : chercher un exercice dans la BDD par nom ───────────────────────
function findExInDB(nom) {
  if (!nom) return null;
  const n = nom.toLowerCase();
  for (const group of Object.values(EX)) {
    const found = group.find(e =>
      e.n.toLowerCase() === n ||
      n.includes(e.n.toLowerCase().split(" ")[0]) ||
      e.n.toLowerCase().includes(n.split(" ")[0])
    );
    if (found) return found;
  }
  return null;
}

// ─── GUIDE MODAL (Tips / Variantes / Erreurs / Morpho) ──────────────────────
function GuideExModal({ exData, exSerie, onClose, C, INT }) {
  const [tab, setTab] = useState("tips");
  const cc = {principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF",mobilite:"#06b6d4"}[exData.cat] || "#4D8BFF";

  return (
    <div style={{minHeight:"100vh",background:"#0B0F1F"}}>
      <div style={{paddingBottom:80}}>
        <div style={{padding:"20px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"inline-block",padding:"3px 10px",background:`${cc}14`,border:`0.5px solid ${cc}40`,borderRadius:8,fontSize:10,color:cc,letterSpacing:"1px",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>{exData.cat}</div>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:400,lineHeight:1.2,color:"#F5F1E8",marginBottom:4}}>{exData.n}</div>
          </div>
          <button onClick={onClose} style={{background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,width:36,height:36,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:18,flexShrink:0,marginLeft:12}}>×</button>
        </div>
        <div style={{padding:"12px 16px",display:"flex",gap:7,flexWrap:"wrap"}}>
          {[{l:"Séries",v:exSerie?.series||exData.s},{l:"Reps",v:exSerie?.reps||exData.r},{l:"Repos",v:exSerie?.repos||exData.rest},{l:"Charge",v:exSerie?.charge||exData.ch}].map(s => (
            <div key={s.l} style={{padding:"8px 10px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,textAlign:"center",flex:1,minWidth:60}}>
              <div style={{fontSize:14,fontWeight:400,color:"#4D8BFF",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>{s.v||"—"}</div>
              <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        <Tabs
          items={[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}]}
          value={tab}
          onChange={setTab}
        />
        <div style={{padding:"0 16px"}}>
          {tab==="tips" && (
            <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Conseils techniques</div>
              {(exData.tips||[]).map((tip,i) => (
                <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(exData.tips||[]).length-1?"0.5px solid rgba(190,180,255,0.07)":"none"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(59,130,246,0.1)",border:"0.5px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#4D8BFF"}}>{i+1}</div>
                  <div style={{fontSize:12,color:"#F5F1E8",lineHeight:1.6}}>{tip}</div>
                </div>
              ))}
              {exData.prog && <div style={{marginTop:4,padding:"10px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:9}}><div style={{fontSize:10,color:"#5FE0A5",fontWeight:500,textTransform:"uppercase",marginBottom:3}}>Progression</div><div style={{fontSize:12,color:"rgba(245,241,232,0.50)",lineHeight:1.5}}>{exData.prog}</div></div>}
            </div>
          )}
          {tab==="variantes" && (
            <div>
              {(exData.variantes||[]).map((v,i) => (
                <div key={i} style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#F5F1E8",marginBottom:5}}>{v.nom||v}</div>
                  {v.note && <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",lineHeight:1.5}}>{v.note}</div>}
                </div>
              ))}
            </div>
          )}
          {tab==="erreurs" && (
            <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Erreurs à éviter</div>
              {(exData.erreurs||[]).map((e,i) => (
                <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(248,113,113,0.1)",border:"0.5px solid rgba(248,113,113,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#FF7A6B"}}>✕</div>
                  <div style={{fontSize:12,color:"#F5F1E8",lineHeight:1.5}}>{e}</div>
                </div>
              ))}
            </div>
          )}
          {tab==="morpho" && (
            <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Adaptation morphologique</div>
              {(exData.morpho||"").split("\n").filter(Boolean).map((line,i,arr) => (
                <div key={i} style={{display:"flex",gap:8,marginBottom:10,paddingBottom:10,borderBottom:i<arr.length-1?"0.5px solid rgba(190,180,255,0.07)":"none",alignItems:"flex-start"}}>
                  <div style={{fontSize:13,flexShrink:0,marginTop:1}}>{line.split(":")[0].trim()}</div>
                  <div style={{fontSize:11.5,color:"#F5F1E8",lineHeight:1.6,flex:1}}>{line.split(":").slice(1).join(":").trim()}</div>
                </div>
              ))}
              {!(exData.morpho||"").includes("\n") && exData.morpho && <div style={{fontSize:12,color:"#F5F1E8",lineHeight:1.7}}>{exData.morpho}</div>}
            </div>
          )}
        </div>
        <div style={{padding:"14px 16px 0"}}>
          <button onClick={onClose} style={{width:"100%",padding:"11px",background:"transparent",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif"}}>← Retour à la séance</button>
        </div>
      </div>
    </div>
  );
}

// ─── INFO MODAL (tips + erreurs rapides, version compacte du Guide) ─────────
function InfoExModal({ ex, dbEx, onClose, onOpenGuide }) {
  return (
    <div style={{minHeight:"100vh",background:"#0B0F1F"}}>
      <div style={{padding:"20px 16px",paddingBottom:80}}>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,padding:"0 0 14px",display:"flex",alignItems:"center",gap:4}}>← Retour</button>

        <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:300,color:"#F5F1E8",marginBottom:4}}>{ex.nom}</div>
        <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",marginBottom:14}}>{ex.series}×{ex.reps} · Repos {ex.repos}{ex.charge?` · ${ex.charge}`:""}</div>

        {!dbEx && (
          <div style={{padding:"16px 14px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:8}}>📖</div>
            <div style={{fontSize:13,color:"rgba(245,241,232,0.50)",lineHeight:1.5,marginBottom:6}}>Aucune information détaillée n'est disponible pour cet exercice dans la bibliothèque.</div>
            <div style={{fontSize:11,color:"rgba(245,241,232,0.50)"}}>Exercice personnalisé ou nom non reconnu.</div>
          </div>
        )}

        {dbEx && (
          <>
            {/* Tips */}
            {dbEx.tips?.length > 0 && (
              <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{fontSize:9,color:"#5FE0A5",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>💡 Tips techniques</div>
                {dbEx.tips.map((tip,i) => (
                  <div key={i} style={{display:"flex",gap:10,marginBottom:10,paddingBottom:10,borderBottom:i<dbEx.tips.length-1?"0.5px solid #1C2440":"none",alignItems:"flex-start"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(34,197,94,0.1)",border:"0.5px solid rgba(34,197,94,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#5FE0A5",marginTop:1}}>{i+1}</div>
                    <div style={{fontSize:12,color:"#F5F1E8",lineHeight:1.6,flex:1}}>{tip}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Erreurs fréquentes */}
            {dbEx.erreurs?.length > 0 && (
              <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{fontSize:9,color:"#FF7A6B",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>⚠️ Erreurs à éviter</div>
                {dbEx.erreurs.map((err,i) => (
                  <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(248,113,113,0.1)",border:"0.5px solid rgba(248,113,113,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#FF7A6B",marginTop:1}}>✕</div>
                    <div style={{fontSize:12,color:"#F5F1E8",lineHeight:1.5,flex:1}}>{err}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton voir guide complet */}
            {onOpenGuide && (
              <button onClick={()=>onOpenGuide(dbEx,ex)} style={{width:"100%",padding:"12px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.25)",borderRadius:11,color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",marginTop:4}}>
                Voir le guide complet ›
              </button>
            )}
          </>
        )}

        <button onClick={onClose} style={{width:"100%",padding:"10px",marginTop:10,background:"transparent",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Fermer</button>
      </div>
    </div>
  );
}

// ─── EXERCICE EDITABLE ────────────────────────────────────────────────────────
function ExerciceEditable({ ex, exIdx, jourIdx, prog, setProg, cc, METHODS, onGuide, onInfo, checkedEx, toggleCheck, seanceId }) {
  const [editing, setEditing] = useState(false);
  const isChecked = !!(checkedEx && checkedEx[`${seanceId}-${exIdx}`]);
  const updateEx = (field, val) => {
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices[exIdx][field] = val;
    setProg(u);
  };
  const dbEx = findExInDB(ex.nom);
  return (
    <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,marginBottom:7,overflow:"hidden",opacity:isChecked?0.6:1,transition:"opacity .15s"}}>
     <div style={{padding:"10px 13px",borderLeft:`3px solid ${cc}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
       {toggleCheck && (
        <div onClick={(e)=>{e.stopPropagation();toggleCheck(seanceId,exIdx,ex.repos);}} style={{width:22,height:22,borderRadius:6,background:isChecked?"#5FE0A5":"transparent",border:`2px solid ${isChecked?"#5FE0A5":"rgba(190,180,255,0.07)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,color:"#141A2E",marginTop:1,transition:"all .15s"}}>{isChecked?"✓":""}</div>
       )}
       <div style={{flex:1,cursor:"pointer"}} onClick={() => setEditing(e=>!e)}>
        <div style={{fontSize:12,fontWeight:600,color:isChecked?"rgba(245,241,232,0.50)":"#F5F1E8",marginBottom:3,textDecoration:isChecked?"line-through":"none"}}>{ex.nom}</div>
        <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>{ex.series}×{ex.reps} · {ex.repos}{ex.charge?` · ${ex.charge}`:""}{ex.tempo?` · ${ex.tempo}`:""}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
       </div>
       <div style={{display:"flex",gap:4,flexShrink:0}}>
        {onInfo && <button onClick={(e)=>{e.stopPropagation();onInfo(ex);}} title="Infos" style={{padding:"4px 7px",background:"rgba(6,182,212,0.06)",border:"0.5px solid rgba(6,182,212,0.25)",borderRadius:6,color:"#06b6d4",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'Inter',sans-serif"}}>i</button>}
        {dbEx && onGuide && <button onClick={(e)=>{e.stopPropagation();onGuide(dbEx,ex);}} style={{padding:"4px 8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#4D8BFF",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Guide ›</button>}
        <button onClick={(e)=>{e.stopPropagation();setEditing(ed=>!ed);}} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#4D8BFF",cursor:"pointer",fontSize:10}}>✏️</button>
       </div>
      </div>
      {editing && (
       <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid rgba(190,180,255,0.07)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:7}}>
         {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
          <div key={pp.k}>
           <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",marginBottom:3,fontWeight:600}}>{pp.l}</div>
           <div style={{display:"flex",gap:3,alignItems:"center"}}>
            <button onClick={()=>{const c=parseFloat(ex[pp.k])||0;updateEx(pp.k,String(pp.k==="repos"?Math.max(0,c-15):Math.max(1,c-1)));}} style={{width:22,height:22,borderRadius:5,background:"#1C2440",border:"none",cursor:"pointer",fontSize:12}}>−</button>
            <input value={ex[pp.k]||""} onChange={e=>updateEx(pp.k,e.target.value)} style={{flex:1,padding:"4px 5px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:6,fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
            <button onClick={()=>{const c=parseFloat(ex[pp.k])||0;updateEx(pp.k,String(pp.k==="repos"?c+15:c+1));}} style={{width:22,height:22,borderRadius:5,background:"#4D8BFF",border:"none",color:"#141A2E",cursor:"pointer",fontSize:12}}>+</button>
           </div>
          </div>
         ))}
        </div>
        <div style={{marginBottom:6}}>
         <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",marginBottom:3,fontWeight:600}}>TEMPO</div>
         <input value={ex.tempo||""} onChange={e=>updateEx("tempo",e.target.value)} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"7px 10px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:11,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
        </div>
        <div>
         <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",marginBottom:4,fontWeight:600}}>MÉTHODE</div>
         <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {METHODS.map(mm=>(
           <button key={mm} onClick={()=>updateEx("methode",mm)} style={{padding:"3px 8px",borderRadius:12,border:`1px solid ${ex.methode===mm?"#4D8BFF":"rgba(190,180,255,0.07)"}`,background:ex.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:ex.methode===mm?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:9,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
          ))}
         </div>
        </div>
       </div>
      )}
     </div>
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
export default function Calendar(props) {
  const { prog, setProg, progs, setProgs, cycleStart, setTab, premium, setPaywall, push, calSess, setCalSess, checkedEx, setCheckedEx, setChrono, setChronoSec, jR, semC, C, INT, setProgView, profil } = props;

  const [bonusModal,   setBonusModal]   = useState(null);
  const [cardioOpen,   setCardioOpen]   = useState(false);
  const [sportOpen,    setSportOpen]    = useState(false);
  const [viewJour,     setViewJour]     = useState(null);
  const [currentWeek,  setCurrentWeek]  = useState(semC || 0);
  const [guideEx,      setGuideEx]      = useState(null);
  const [infoEx,       setInfoEx]       = useState(null);

  // Toggle de validation d'un exercice (avec déclenchement chrono)
  const toggleCheck = (seanceId, exIdx, repos) => {
    if (!setCheckedEx) return;
    const key = `${seanceId}-${exIdx}`;
    const wasChecked = checkedEx?.[key];
    setCheckedEx(prev => ({...prev, [key]: !prev[key]}));
    if (!wasChecked && repos && setChrono && setChronoSec) {
      const sec = parseInt((repos+"").replace(/[^0-9]/g,"")) || 90;
      setChronoSec(sec);
      setChrono(true);
    }
  };

  const WEEK_INTENSITY = ["modere","modere","lourd","lourd","intense","leger"];
  const METHODS = ["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif"];

  // ── Cardio modal ──
  if (cardioOpen) {
    return (
      <CardioModal
        poids={profil?.poids}
        C={C}
        onClose={() => setCardioOpen(false)}
        onSave={(sess) => {
          const today = new Date();
          const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
          setCalSess(s => ({...s,[key]:sess}));
          setCardioOpen(false);
          push("🏃","Cardio enregistré !",`${sess.nom}${sess.cardio?.kcal?` · ${sess.cardio.kcal} kcal`:""}`);
        }}
      />
    );
  }

  // ── Sport modal ──
  if (sportOpen) {
    return (
      <SportModal
        poids={profil?.poids}
        C={C}
        onClose={() => setSportOpen(false)}
        onSave={(sess) => {
          const today = new Date();
          const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
          setCalSess(s => ({...s,[key]:sess}));
          setSportOpen(false);
          push("🏆","Sport enregistré !",`${sess.nom}${sess.sport?.kcal?` · ${sess.sport.kcal} kcal`:""}`);
        }}
      />
    );
  }

  // ── Info modal ──
  if (infoEx) {
    return (
      <InfoExModal
        ex={infoEx.ex}
        dbEx={infoEx.dbEx}
        onClose={() => setInfoEx(null)}
        onOpenGuide={infoEx.dbEx ? (dbEx, serieEx) => { setInfoEx(null); setGuideEx({dbEx, serieEx}); } : null}
      />
    );
  }

  // ── Guide modal ──
  if (guideEx) {
    return <GuideExModal exData={guideEx.dbEx} exSerie={guideEx.serieEx} onClose={() => setGuideEx(null)} C={C} INT={INT} />;
  }

  // ── Vue détail séance ──
  if (viewJour !== null && prog) {
    const jour = prog.jours[viewJour];
    const weekInt = INT[WEEK_INTENSITY[currentWeek]];
    const int = INT[jour.intensite || "modere"];
    return (
      <div style={{padding:"0 15px"}}>
        <button onClick={() => setViewJour(null)} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,padding:"16px 0 12px",display:"flex",alignItems:"center",gap:5}}>← Retour aux séances</button>
        <div style={{padding:"12px 14px",background:`${int.c}14`,border:`0.5px solid ${int.c}40`,borderRadius:12,marginBottom:4}}>
          <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
          <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:18,fontWeight:400,marginBottom:2}}>{jour.nom}</div>
          <div style={{fontSize:11,color:"rgba(245,241,232,0.50)"}}>{jour.focus} · {jour.duree} · {jour.exercices?.length||0} exercices</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:`${weekInt.c}10`,border:`0.5px solid ${weekInt.c}30`,borderRadius:8,marginBottom:12}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:weekInt.c,flexShrink:0}}/>
          <div style={{fontSize:10,color:weekInt.c,fontWeight:600}}>Semaine {currentWeek+1} — {weekInt.l}</div>
        </div>
        {(jour.exercices||[]).length === 0 && <div style={{textAlign:"center",padding:"24px 0",color:"rgba(245,241,232,0.50)",fontSize:13}}>Aucun exercice dans cette séance.</div>}
        {(jour.exercices||[]).map((ex,k) => {
          const cc = {principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF",correctiv:"#FF7A6B"}[ex.cat||"principal"]||"#4D8BFF";
          return <ExerciceEditable key={k} ex={ex} exIdx={k} jourIdx={viewJour} prog={prog} setProg={setProg} cc={cc} METHODS={METHODS} onGuide={(dbEx,serieEx)=>setGuideEx({dbEx,serieEx})} onInfo={(exo)=>setInfoEx({ex:exo,dbEx:findExInDB(exo.nom)})} checkedEx={checkedEx} toggleCheck={toggleCheck} seanceId={prog.jours[viewJour].id} />;
        })}
      </div>
    );
  }

  return (
    <div style={{padding:"0 15px"}}>

      <MonthCal sessions={calSess} onUpdate={(date,sess) => {
        if (sess) setCalSess(s => ({...s,[date]:sess}));
        else setCalSess(s => { const ns={...s}; delete ns[date]; return ns; });
      }}/>



      {/* Programme + semaines S1-S6 */}
      {cycleStart && prog && (
        <Box style={{background:"rgba(59,130,246,0.06)",borderColor:C.goldB}}>
          <Row style={{justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <Lbl style={{marginBottom:4}}>Cycle {prog.numero||1} · {prog.duree_semaines||6} semaines</Lbl>
              <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:14,fontWeight:500}}>{prog.titre}</div>
              {prog.methode && <div style={{fontSize:10,color:"#4D8BFF",marginTop:2,fontWeight:500}}>⚡ {prog.methode}</div>}
              {prog.dateDebut && <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginTop:2}}>Démarré le {prog.dateDebut}</div>}
            </div>
            {jR !== null && jR <= 7 && (
              <div style={{padding:"5px 10px",background:"rgba(224,136,58,0.15)",border:"1px solid rgba(224,136,58,0.3)",borderRadius:8,fontSize:10,color:"#FFAB5D",fontWeight:500,flexShrink:0}}>J-{jR}</div>
            )}
          </Row>

          {prog.analyse && (prog.analyse.points_forts?.length>0 || prog.analyse.points_faibles?.length>0) && (
            <div style={{marginBottom:12,padding:"10px 12px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10}}>
              <div style={{fontSize:9,color:"#4D8BFF",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>🔬 Analyse morphologique</div>
              {prog.analyse.morphotype && <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",marginBottom:6,fontStyle:"italic"}}>Morphotype : <span style={{color:C.text,fontWeight:500}}>{prog.analyse.morphotype}</span></div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {prog.analyse.points_forts?.length>0 && <div><div style={{fontSize:9,color:C.green,fontWeight:600,marginBottom:4}}>✅ POINTS FORTS</div>{prog.analyse.points_forts.map((p,i)=><div key={i} style={{fontSize:10,color:C.text,padding:"2px 0"}}>{p}</div>)}</div>}
                {prog.analyse.points_faibles?.length>0 && <div><div style={{fontSize:9,color:C.red,fontWeight:600,marginBottom:4}}>🎯 À DÉVELOPPER</div>{prog.analyse.points_faibles.map((p,i)=><div key={i} style={{fontSize:10,color:C.text,padding:"2px 0"}}>{p}</div>)}</div>}
              </div>
            </div>
          )}

          {prog.correction?.groupes_prioritaires?.length>0 && (
            <div style={{marginBottom:12,padding:"8px 12px",background:"rgba(249,115,22,0.06)",border:"0.5px solid rgba(249,115,22,0.2)",borderRadius:8}}>
              <div style={{fontSize:9,color:"#FFAB5D",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>🔧 Correction prioritaire</div>
              <div style={{fontSize:10,color:C.text}}>{prog.correction.groupes_prioritaires.join(" · ")}</div>
            </div>
          )}

          {jR === 0 && (
            <div style={{padding:"12px 14px",background:"rgba(62,199,122,0.1)",border:"1px solid rgba(62,199,122,0.3)",borderRadius:10,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:500,color:C.green,marginBottom:4}}>🏆 Cycle terminé !</div>
              <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",marginBottom:10,lineHeight:1.5}}>Démarrez un nouveau cycle pour continuer votre progression.</div>
              <Btn sm onClick={() => { if(!premium) setPaywall(true); else { setProgView("analyse"); setTab("program"); }}}>Nouveau cycle personnalisé →</Btn>
            </div>
          )}

          {/* Sélecteur semaines S1-S6 */}
          <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Planification 6 semaines</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,marginBottom:8}}>
            {WEEK_INTENSITY.map((k,w) => {
              const int = INT[k];
              const isSelected = w === currentWeek;
              const isDone = w < semC;
              return (
                <div key={w} onClick={() => setCurrentWeek(w)} style={{padding:"9px 4px",background:isSelected?`${int.c}20`:isDone?"rgba(34,197,94,0.1)":C.s2,border:`1px solid ${isSelected?int.c:isDone?"rgba(56,199,117,.25)":C.s3}`,borderRadius:9,textAlign:"center",cursor:"pointer",transition:"all .12s"}}>
                  <div style={{fontSize:9,color:isSelected?int.c:isDone?C.green:C.dim,fontWeight:700,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>S{w+1}</div>
                  <div style={{width:4,height:4,borderRadius:"50%",background:isSelected?int.c:isDone?"#5FE0A5":C.dim,margin:"4px auto 0"}}/>
                  {isSelected && <div style={{fontSize:7,color:int.c,marginTop:2,fontWeight:600}}>●</div>}
                </div>
              );
            })}
          </div>

          {/* Badge intensité semaine */}
          {(() => {
            const wi = WEEK_INTENSITY[currentWeek];
            const int = INT[wi];
            return (
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:`${int.c}10`,border:`0.5px solid ${int.c}30`,borderRadius:9,marginBottom:12}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:int.c,flexShrink:0}}/>
                <div>
                  <span style={{fontSize:11,fontWeight:600,color:int.c}}>Semaine {currentWeek+1} — {int.l}</span>
                  <span style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>{currentWeek<2?" · Charges modérées, technique":currentWeek<4?" · Charges lourdes, progression":currentWeek===4?" · Intensité maximale":""}</span>
                </div>
                {currentWeek === semC && <div style={{marginLeft:"auto",fontSize:9,color:int.c,fontWeight:700,background:`${int.c}15`,padding:"2px 6px",borderRadius:5}}>EN COURS</div>}
              </div>
            );
          })()}

          {/* Séances de la semaine */}
          <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>Séances — Semaine {currentWeek+1}</div>
          {prog.jours.map((j, i) => {
            const int = INT[WEEK_INTENSITY[currentWeek]];
            const total = j.exercices?.length || 0;
            const done = j.exercices?.filter((_,idx) => checkedEx[`${j.id}-${idx}`]).length || 0;
            return (
              <Row key={i} onClick={() => setViewJour(i)} style={{padding:"11px 13px",background:"#141A2E",borderRadius:10,marginBottom:6,cursor:"pointer",border:`0.5px solid ${int.c}25`,borderLeft:`3px solid ${int.c}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:int.c,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>{int.l}</div>
                  <div style={{fontSize:13,fontWeight:500,color:"#F5F1E8"}}>{j.nom}</div>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>{j.focus} · {total} exercice{total!==1?"s":""}</div>
                </div>
                <Row style={{gap:7,alignItems:"center"}}>
                  {done>0 && <div style={{fontSize:9,color:C.green,fontWeight:700}}>{done}/{total}</div>}
                  {j.complete && <div style={{fontSize:10,color:C.green}}>✓</div>}
                  <div style={{color:"rgba(245,241,232,0.50)",fontSize:16}}>›</div>
                </Row>
              </Row>
            );
          })}
        </Box>
      )}


    </div>
  );
}
