import { useState } from "react";
import { findExInDB , catColor } from "../../../utils/training.js";
import { C, DARK, FONT, INT } from "../../../data/constants.js";
import { EX } from "../../../data/exercises.js";
import { Card, Eyebrow, Lbl, Btn, Row } from "../../../components/ui/index.jsx";
import { Tabs } from "../../../components/ui/Tabs.jsx";
import { MonthCal } from "../../../components/ui/MonthCal.jsx";

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
  { id:"rameur",    l:"Rameur",           i:"🚣",  color:"#06B6D4",
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
export function CardioModal({ onClose, onSave, poids, C }) {
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
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{paddingBottom:32}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 16px 16px"}}>
          <div>
            <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Cardio</div>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:400,color:"#F5F1E8"}}>
              {step===0 ? "Choix de l'ergomètre" : ergo?.l}
            </div>
          </div>
          <button onClick={onClose} style={{background:C.s2,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,width:36,height:36,color:"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:20}}>×</button>
        </div>

        <div style={{padding:"0 16px"}}>

          {/* ── STEP 0 : sélection ergomètre ── */}
          {step === 0 && (
            <div>
              <div style={{fontSize:11,color:"rgba(245,241,232,0.5)",marginBottom:12}}>Sélectionne ta machine ou activité</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {ERGOS.map(e => (
                  <div key={e.id} onClick={() => { setErgo(e); const defs={}; e.params.forEach(p=>{ defs[p.k]=p.def||""; }); setParams(defs); setStep(1); }}
                    style={{padding:"16px 12px",background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"border-color .15s"}}
                    onMouseEnter={ev=>ev.currentTarget.style.borderColor=e.color}
                    onMouseLeave={ev=>ev.currentTarget.style.borderColor="rgba(190,180,255,0.08)"}>
                    <div style={{fontSize:20,flexShrink:0}}>{e.i}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:500,color:"#F5F1E8",lineHeight:1.2}}>{e.l}</div>
                      <div style={{fontSize:10,color:e.color,fontWeight:600,marginTop:2}}>{e.params.map(p=>p.unit).filter(Boolean).slice(0,2).join(" · ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1 : configuration ── */}
          {step === 1 && ergo && (
            <div>
              <button onClick={() => setStep(0)} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,padding:"0 0 16px",display:"flex",alignItems:"center",gap:4}}>← Changer d'ergomètre</button>

              {/* Durée */}
              <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Durée</div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <button onClick={() => setDuree(d => Math.max(5,d-5))} style={{width:36,height:36,borderRadius:8,background:C.s2,border:"none",cursor:"pointer",fontSize:20,fontWeight:400,color:"rgba(245,241,232,0.5)"}}>−</button>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:34,fontWeight:400,color:"#F5F1E8",lineHeight:1}}>{duree}</div>
                    <div style={{fontSize:11,color:"rgba(245,241,232,0.5)",marginTop:2}}>minutes</div>
                  </div>
                  <button onClick={() => setDuree(d => Math.min(180,d+5))} style={{width:36,height:36,borderRadius:8,background:C.accent,border:"none",cursor:"pointer",fontSize:20,color:DARK.surface}}>+</button>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  {[15,20,30,45,60,90].map(d => (
                    <button key={d} onClick={() => setDuree(d)} style={{flex:1,padding:"4px 2px",background:duree===d?"rgba(59,130,246,0.12)":"transparent",border:`0.5px solid ${duree===d?"#4D8BFF":"rgba(190,180,255,0.08)"}`,borderRadius:8,color:duree===d?"#4D8BFF":"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:10,fontWeight:duree===d?600:400}}>{d}'</button>
                  ))}
                </div>
              </div>

              {/* Paramètres spécifiques à l'ergomètre */}
              <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Paramètres</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {ergo.params.map(p => (
                    <div key={p.k}>
                      <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginBottom:4,fontWeight:500}}>{p.l}{p.unit&&p.unit!=="ex: 2:10"&&p.unit!=="ex: 2:20"&&p.unit!=="ex: 2:05"&&p.unit!=="ex: 2:15" ? ` (${p.unit})` : ""}</div>
                      {p.opts ? (
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {p.opts.map(o => (
                            <button key={o} onClick={() => setParams(pr=>({...pr,[p.k]:o}))} style={{padding:"4px 12px",borderRadius:8,border:`0.5px solid ${(params[p.k]||p.def)===o?"#4D8BFF":"rgba(190,180,255,0.08)"}`,background:(params[p.k]||p.def)===o?"rgba(59,130,246,0.08)":"transparent",color:(params[p.k]||p.def)===o?"#4D8BFF":"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:11,fontWeight:500}}>{o}</button>
                          ))}
                        </div>
                      ) : (
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <input
                            value={params[p.k] ?? ""}
                            onChange={e => setParams(pr=>({...pr,[p.k]:e.target.value}))}
                            placeholder={p.unit.startsWith("ex:")?p.unit:p.def||"—"}
                            style={{flex:1,padding:"8px 12px",background:C.s2,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:8,fontSize:13,color:"#F5F1E8",fontFamily:"'Inter',sans-serif"}}
                          />
                          {p.unit&&!p.unit.startsWith("ex:")&&<span style={{fontSize:10,color:"rgba(245,241,232,0.5)",flexShrink:0}}>{p.unit}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones cardiaques */}
              <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Zone cardiaque</div>
                <div style={{display:"flex",gap:4,marginBottom:12}}>
                  {ZONES.map(z => (
                    <button key={z.id} onClick={() => setZone(z.id)} style={{flex:1,padding:"8px 2px",textAlign:"center",background:zone===z.id?`${z.color}15`:"transparent",border:`1px solid ${zone===z.id?z.color:"rgba(190,180,255,0.08)"}`,borderRadius:8,cursor:"pointer",transition:"all .12s"}}>
                      <div style={{fontSize:10,fontWeight:700,color:zone===z.id?z.color:"rgba(245,241,232,0.5)"}}>{z.l}</div>
                      <div style={{fontSize:8,color:zone===z.id?z.color:"rgba(245,241,232,0.5)",marginTop:1}}>{z.pct}</div>
                    </button>
                  ))}
                </div>
                <div style={{padding:"8px 12px",background:`${ZONES.find(z=>z.id===zone)?.color}10`,borderRadius:8,fontSize:10,color:ZONES.find(z=>z.id===zone)?.color,fontWeight:500}}>
                  {ZONES.find(z=>z.id===zone)?.desc}
                </div>
                {/* BPM optionnel */}
                <div style={{marginTop:12,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:500,flexShrink:0}}>BPM moyen</div>
                  <input value={bpm} onChange={e=>setBpm(e.target.value)} placeholder="ex: 145 (facultatif)" style={{flex:1,padding:"8px 12px",background:C.s2,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:8,fontSize:13,color:"#F5F1E8",fontFamily:"'Inter',sans-serif"}}/>
                </div>
              </div>

              {/* Calories */}
              <div style={{background:C.s1,border:`1px solid ${kcalFinal>0?"rgba(59,130,246,0.18)":"rgba(190,180,255,0.08)"}`,borderRadius:12,padding:"16px 16px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Calories estimées</div>
                  <button onClick={() => { setEditKcal(e=>!e); setKcalManuel(String(kcalAuto)); }} style={{fontSize:10,color:"#4D8BFF",background:"transparent",border:"none",cursor:"pointer",fontWeight:600}}>{editKcal?"Auto":"Modifier"}</button>
                </div>
                {editKcal ? (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input value={kcalManuel} onChange={e=>setKcalManuel(e.target.value)} style={{flex:1,padding:"12px 12px",background:C.s2,border:"0.5px solid #4D8BFF",borderRadius:8,fontSize:16,fontWeight:500,color:"#F5F1E8",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}/>
                    <span style={{fontSize:13,color:"rgba(245,241,232,0.5)"}}>kcal</span>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:34,fontWeight:400,color:kcalAuto>0?"#4D8BFF":"rgba(245,241,232,0.35)",lineHeight:1}}>{kcalAuto>0?kcalAuto:"—"}</div>
                    {kcalAuto>0&&<div style={{fontSize:13,color:"rgba(245,241,232,0.5)"}}>kcal</div>}
                  </div>
                )}
                {kcalAuto>0&&!editKcal&&(
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginTop:4}}>
                    Estimation basée sur les paramètres · {poids||"70"}kg · {duree}min
                  </div>
                )}
              </div>

              <button onClick={handleSave} style={{width:"100%",padding:"16px",background:C.accent,border:"none",borderRadius:12,color:DARK.surface,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",marginBottom:8}}>
                ✓ Enregistrer la séance
              </button>
              <button onClick={onClose} style={{width:"100%",padding:"12px",background:"transparent",border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,color:"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif"}}>Annuler</button>
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
  {id:"padel",      l:"Padel",             i:"🏸", color:"#84CC16", met:7.0},
  {id:"rugby",      l:"Rugby",             i:"🏉", color:"#A16207", met:8.5},
  {id:"volleyball", l:"Volleyball",        i:"🏐", color:"#4D8BFF", met:5.0},
  {id:"handball",   l:"Handball",          i:"🤾", color:"#FFAB5D", met:8.0},
  {id:"badminton",  l:"Badminton",         i:"🏸", color:"#06B6D4", met:6.5},
  {id:"pingpong",   l:"Tennis de table",   i:"🏓", color:"#4D8BFF", met:4.5},
  {id:"squash",     l:"Squash",            i:"🎾", color:"#FF7A6B", met:12.0},
  {id:"boxe",       l:"Boxe",              i:"🥊", color:"#FF7A6B", met:9.5},
  {id:"mma",        l:"MMA / Kickboxing",  i:"🥋", color:"#DC2626", met:10.5},
  {id:"judo",       l:"Judo / Jiu-jitsu",  i:"🥋", color:"#1D4ED8", met:9.0},
  {id:"karate",     l:"Karaté / Arts mart.",i:"🥷", color:"#7C3AED", met:8.5},
  {id:"escalade",   l:"Escalade",          i:"🧗", color:"#D67A2E", met:8.0},
  {id:"yoga",       l:"Yoga",              i:"🧘", color:"#B69DFF", met:3.0},
  {id:"pilates",    l:"Pilates",           i:"🧘", color:"#A855F7", met:3.5},
  {id:"crossfit",   l:"CrossFit",          i:"🏋️", color:"#FFAB5D", met:10.0},
  {id:"surf",       l:"Surf",              i:"🏄", color:"#0284C7", met:6.0},
  {id:"ski",        l:"Ski / Snowboard",   i:"⛷️", color:"#BFDBFE", met:7.5},
  {id:"golf",       l:"Golf",              i:"⛳", color:"#16A34A", met:4.5},
  {id:"cyclisme",   l:"Cyclisme route",    i:"🚵", color:"#FFAB5D", met:9.0},
  {id:"triathlon",  l:"Triathlon",         i:"🏅", color:"#0EA5E9", met:11.0},
  {id:"athletisme", l:"Athlétisme",        i:"🏃", color:"#4D8BFF", met:10.0},
  {id:"danse",      l:"Danse / Zumba",     i:"💃", color:"#EC4899", met:6.0},
  {id:"hockey",     l:"Hockey",            i:"🏒", color:"rgba(245,241,232,0.5)", met:8.0},
  {id:"equitation", l:"Équitation",        i:"🐎", color:"#D67A2E", met:5.0},
  {id:"roller",     l:"Roller / Skate",    i:"🛹", color:"#FFAB5D", met:8.0},
  {id:"petanque",   l:"Pétanque",          i:"🎯", color:C.dim, met:2.5},
];

// ─── SPORT MODAL ──────────────────────────────────────────────────────────────
export function SportModal({ onClose, onSave, poids, C }) {
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
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{paddingBottom:32}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 16px 16px"}}>
          <div>
            <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Activité sportive</div>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:400,color:"#F5F1E8"}}>
              {sport ? sport.l : "Choix du sport"}
            </div>
          </div>
          <button onClick={onClose} style={{background:C.s2,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,width:36,height:36,color:"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:20}}>×</button>
        </div>

        <div style={{padding:"0 16px"}}>
          {/* Sélection sport */}
          {!sport && (
            <div>
              <div style={{fontSize:11,color:"rgba(245,241,232,0.5)",marginBottom:12}}>Sélectionne ton sport</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {SPORTS.map(s => (
                  <div key={s.id} onClick={() => setSport(s)}
                    style={{padding:"12px 12px",background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"border-color .15s"}}
                    onMouseEnter={ev => ev.currentTarget.style.borderColor = s.color}
                    onMouseLeave={ev => ev.currentTarget.style.borderColor = "rgba(190,180,255,0.08)"}>
                    <div style={{fontSize:20,flexShrink:0}}>{s.i}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:500,color:"#F5F1E8",lineHeight:1.3}}>{s.l}</div>
                      <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginTop:1}}>~{Math.round(s.met*70)} kcal/h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration après sélection */}
          {sport && (
            <div>
              <button onClick={() => setSport(null)} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,padding:"0 0 16px",display:"flex",alignItems:"center",gap:4}}>← Changer de sport</button>

              {/* Sport sélectionné */}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:`${sport.color}10`,border:`0.5px solid ${sport.color}30`,borderRadius:12,marginBottom:12}}>
                <div style={{fontSize:26}}>{sport.i}</div>
                <div>
                  <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:16,fontWeight:400,color:"#F5F1E8"}}>{sport.l}</div>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginTop:2}}>MET {sport.met} · Intensité {sport.met>=10?"élevée":sport.met>=6?"modérée":"faible"}</div>
                </div>
              </div>

              {/* Durée */}
              <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Durée</div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <button onClick={() => setDuree(d => Math.max(5,d-5))} style={{width:36,height:36,borderRadius:8,background:C.s2,border:"none",cursor:"pointer",fontSize:20,fontWeight:400,color:"rgba(245,241,232,0.5)"}}>−</button>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:34,fontWeight:400,color:"#F5F1E8",lineHeight:1}}>{duree}</div>
                    <div style={{fontSize:11,color:"rgba(245,241,232,0.5)",marginTop:2}}>minutes</div>
                  </div>
                  <button onClick={() => setDuree(d => Math.min(240,d+5))} style={{width:36,height:36,borderRadius:8,background:C.accent,border:"none",cursor:"pointer",fontSize:20,color:DARK.surface}}>+</button>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  {[30,45,60,75,90,120].map(d => (
                    <button key={d} onClick={() => setDuree(d)} style={{flex:1,padding:"4px 2px",background:duree===d?"rgba(59,130,246,0.12)":"transparent",border:`0.5px solid ${duree===d?"#4D8BFF":"rgba(190,180,255,0.08)"}`,borderRadius:8,color:duree===d?"#4D8BFF":"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:10,fontWeight:duree===d?600:400}}>{d}'</button>
                  ))}
                </div>
              </div>

              {/* Calories */}
              <div style={{background:C.s1,border:`1px solid ${kcalAuto>0?"rgba(59,130,246,0.18)":"rgba(190,180,255,0.08)"}`,borderRadius:12,padding:"16px 16px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Calories brûlées <span style={{color:"rgba(245,241,232,0.5)",fontWeight:400,fontSize:8}}>(facultatif)</span></div>
                  <button onClick={() => { setEditKcal(e=>!e); setKcalManuel(String(kcalAuto)); }} style={{fontSize:10,color:"#4D8BFF",background:"transparent",border:"none",cursor:"pointer",fontWeight:600}}>{editKcal?"Auto":"Modifier"}</button>
                </div>
                {editKcal ? (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input value={kcalManuel} onChange={e=>setKcalManuel(e.target.value)} style={{flex:1,padding:"12px 12px",background:C.s2,border:"0.5px solid #4D8BFF",borderRadius:8,fontSize:16,fontWeight:500,color:"#F5F1E8",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}/>
                    <span style={{fontSize:13,color:"rgba(245,241,232,0.5)"}}>kcal</span>
                  </div>
                ) : (
                  <div>
                    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                      <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:34,fontWeight:400,color:"#4D8BFF",lineHeight:1}}>{kcalAuto}</div>
                      <div style={{fontSize:13,color:"rgba(245,241,232,0.5)"}}>kcal</div>
                    </div>
                    <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginTop:4}}>Estimation MET {sport.met} · {poids||70}kg · {duree}min</div>
                  </div>
                )}
              </div>

              <button onClick={handleSave} style={{width:"100%",padding:"16px",background:C.accent,border:"none",borderRadius:12,color:DARK.surface,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",marginBottom:8}}>
                ✓ Enregistrer la séance
              </button>
              <button onClick={onClose} style={{width:"100%",padding:"12px",background:"transparent",border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,color:"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif"}}>Annuler</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HELPER : chercher un exercice dans la BDD par nom ───────────────────────

// ─── GUIDE MODAL (Tips / Variantes / Erreurs / Morpho) ──────────────────────
export function GuideExModal({ exData, exSerie, onClose, C, INT }) {
  const [tab, setTab] = useState("tips");
  const cc = catColor(exData.cat);

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{paddingBottom:32}}>
        <div style={{padding:"20px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"inline-block",padding:"4px 12px",background:`${cc}14`,border:`0.5px solid ${cc}40`,borderRadius:8,fontSize:10,color:cc,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:12}}>{exData.cat}</div>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:400,lineHeight:1.2,color:"#F5F1E8",marginBottom:4}}>{exData.n}</div>
          </div>
          <button onClick={onClose} style={{background:C.s2,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,width:36,height:36,color:"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:20,flexShrink:0,marginLeft:12}}>×</button>
        </div>
        <div style={{padding:"12px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
          {[{l:"Séries",v:exSerie?.series||exData.s},{l:"Reps",v:exSerie?.reps||exData.r},{l:"Repos",v:exSerie?.repos||exData.rest},{l:"Charge",v:exSerie?.charge||exData.ch}].map(s => (
            <div key={s.l} style={{padding:"8px 12px",background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,textAlign:"center",flex:1,minWidth:60}}>
              <div style={{fontSize:14,fontWeight:400,color:"#4D8BFF",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>{s.v||"—"}</div>
              <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginTop:2}}>{s.l}</div>
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
            <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px"}}>
              <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Conseils techniques</div>
              {(exData.tips||[]).map((tip,i) => (
                <div key={i} style={{display:"flex",gap:12,marginBottom:16,paddingBottom:16,borderBottom:i<(exData.tips||[]).length-1?"0.5px solid rgba(190,180,255,0.08)":"none"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(59,130,246,0.12)",border:"0.5px solid rgba(59,130,246,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#4D8BFF"}}>{i+1}</div>
                  <div style={{fontSize:13,color:"#F5F1E8",lineHeight:1.6}}>{tip}</div>
                </div>
              ))}
              {exData.prog && <div style={{marginTop:4,padding:"12px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.18)",borderRadius:8}}><div style={{fontSize:10,color:"#5FE0A5",fontWeight:500,textTransform:"uppercase",marginBottom:4}}>Progression</div><div style={{fontSize:13,color:"rgba(245,241,232,0.5)",lineHeight:1.5}}>{exData.prog}</div></div>}
            </div>
          )}
          {tab==="variantes" && (
            <div>
              {(exData.variantes||[]).map((v,i) => (
                <div key={i} style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#F5F1E8",marginBottom:4}}>{v.nom||v}</div>
                  {v.note && <div style={{fontSize:11,color:"rgba(245,241,232,0.5)",lineHeight:1.5}}>{v.note}</div>}
                </div>
              ))}
            </div>
          )}
          {tab==="erreurs" && (
            <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px"}}>
              <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Erreurs à éviter</div>
              {(exData.erreurs||[]).map((e,i) => (
                <div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(248,113,113,0.12)",border:"0.5px solid rgba(248,113,113,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#FF7A6B"}}>✕</div>
                  <div style={{fontSize:13,color:"#F5F1E8",lineHeight:1.5}}>{e}</div>
                </div>
              ))}
            </div>
          )}
          {tab==="morpho" && (
            <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px"}}>
              <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Adaptation morphologique</div>
              {(exData.morpho||"").split("\n").filter(Boolean).map((line,i,arr) => (
                <div key={i} style={{display:"flex",gap:8,marginBottom:12,paddingBottom:12,borderBottom:i<arr.length-1?"0.5px solid rgba(190,180,255,0.08)":"none",alignItems:"flex-start"}}>
                  <div style={{fontSize:13,flexShrink:0,marginTop:1}}>{line.split(":")[0].trim()}</div>
                  <div style={{fontSize:11,color:"#F5F1E8",lineHeight:1.6,flex:1}}>{line.split(":").slice(1).join(":").trim()}</div>
                </div>
              ))}
              {!(exData.morpho||"").includes("\n") && exData.morpho && <div style={{fontSize:13,color:"#F5F1E8",lineHeight:1.6}}>{exData.morpho}</div>}
            </div>
          )}
        </div>
        <div style={{padding:"16px 16px 0"}}>
          <button onClick={onClose} style={{width:"100%",padding:"12px",background:"transparent",border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,color:"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif"}}>← Retour à la séance</button>
        </div>
      </div>
    </div>
  );
}

// ─── INFO MODAL (tips + erreurs rapides, version compacte du Guide) ─────────
export function InfoExModal({ ex, dbEx, onClose, onOpenGuide }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{padding:"20px 16px",paddingBottom:32}}>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,padding:"0 0 16px",display:"flex",alignItems:"center",gap:4}}>← Retour</button>

        <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:400,color:"#F5F1E8",marginBottom:4}}>{ex.nom}</div>
        <div style={{fontSize:11,color:"rgba(245,241,232,0.5)",marginBottom:16}}>{ex.series}×{ex.reps} · Repos {ex.repos}{ex.charge?` · ${ex.charge}`:""}</div>

        {!dbEx && (
          <div style={{padding:"16px 16px",background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,textAlign:"center"}}>
            <div style={{fontSize:26,marginBottom:8}}>📖</div>
            <div style={{fontSize:13,color:"rgba(245,241,232,0.5)",lineHeight:1.5,marginBottom:8}}>Aucune information détaillée n'est disponible pour cet exercice dans la bibliothèque.</div>
            <div style={{fontSize:11,color:"rgba(245,241,232,0.5)"}}>Exercice personnalisé ou nom non reconnu.</div>
          </div>
        )}

        {dbEx && (
          <>
            {/* Tips */}
            {dbEx.tips?.length > 0 && (
              <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:"#5FE0A5",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>💡 Tips techniques</div>
                {dbEx.tips.map((tip,i) => (
                  <div key={i} style={{display:"flex",gap:12,marginBottom:12,paddingBottom:12,borderBottom:i<dbEx.tips.length-1?"0.5px solid #1C2440":"none",alignItems:"flex-start"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(34,197,94,0.12)",border:"0.5px solid rgba(34,197,94,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#5FE0A5",marginTop:1}}>{i+1}</div>
                    <div style={{fontSize:13,color:"#F5F1E8",lineHeight:1.6,flex:1}}>{tip}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Erreurs fréquentes */}
            {dbEx.erreurs?.length > 0 && (
              <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,padding:"16px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:"#FF7A6B",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>⚠️ Erreurs à éviter</div>
                {dbEx.erreurs.map((err,i) => (
                  <div key={i} style={{display:"flex",gap:12,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(248,113,113,0.12)",border:"0.5px solid rgba(248,113,113,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#FF7A6B",marginTop:1}}>✕</div>
                    <div style={{fontSize:13,color:"#F5F1E8",lineHeight:1.5,flex:1}}>{err}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton voir guide complet */}
            {onOpenGuide && (
              <button onClick={()=>onOpenGuide(dbEx,ex)} style={{width:"100%",padding:"12px",background:"rgba(59,130,246,0.05)",border:"0.5px solid rgba(59,130,246,0.25)",borderRadius:12,color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",marginTop:4}}>
                Voir le guide complet ›
              </button>
            )}
          </>
        )}

        <button onClick={onClose} style={{width:"100%",padding:"12px",marginTop:12,background:"transparent",border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,color:"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif"}}>Fermer</button>
      </div>
    </div>
  );
}

// ─── EXERCICE EDITABLE ────────────────────────────────────────────────────────
export function ExerciceEditable({ ex, exIdx, jourIdx, prog, setProg, cc, METHODS, onGuide, onInfo, checkedEx, toggleCheck, seanceId }) {
  const [editing, setEditing] = useState(false);
  const isChecked = !!(checkedEx && checkedEx[`${seanceId}-${exIdx}`]);
  const updateEx = (field, val) => {
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices[exIdx][field] = val;
    setProg(u);
  };
  const dbEx = findExInDB(ex.nom);
  return (
    <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:12,marginBottom:8,overflow:"hidden",opacity:isChecked?0.6:1,transition:"opacity .15s"}}>
     <div style={{padding:"12px 12px",borderLeft:`3px solid ${cc}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
       {toggleCheck && (
        <div onClick={(e)=>{e.stopPropagation();toggleCheck(seanceId,exIdx,ex.repos);}} style={{width:22,height:22,borderRadius:8,background:isChecked?"#5FE0A5":"transparent",border:`2px solid ${isChecked?"#5FE0A5":"rgba(190,180,255,0.08)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,color:DARK.surface,marginTop:1,transition:"all .15s"}}>{isChecked?"✓":""}</div>
       )}
       <div style={{flex:1,cursor:"pointer"}} onClick={() => setEditing(e=>!e)}>
        <div style={{fontSize:13,fontWeight:600,color:isChecked?"rgba(245,241,232,0.5)":"#F5F1E8",marginBottom:4,textDecoration:isChecked?"line-through":"none"}}>{ex.nom}</div>
        <div style={{fontSize:10,color:"rgba(245,241,232,0.5)"}}>{ex.series}×{ex.reps} · {ex.repos}{ex.charge?` · ${ex.charge}`:""}{ex.tempo?` · ${ex.tempo}`:""}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
       </div>
       <div style={{display:"flex",gap:4,flexShrink:0}}>
        {onInfo && <button onClick={(e)=>{e.stopPropagation();onInfo(ex);}} title="Infos" style={{padding:"4px 8px",background:"rgba(6,182,212,0.05)",border:"0.5px solid rgba(6,182,212,0.25)",borderRadius:8,color:"#06B6D4",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'Inter',sans-serif"}}>i</button>}
        {dbEx && onGuide && <button onClick={(e)=>{e.stopPropagation();onGuide(dbEx,ex);}} style={{padding:"4px 8px",background:"rgba(59,130,246,0.05)",border:"0.5px solid rgba(59,130,246,0.18)",borderRadius:8,color:"#4D8BFF",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Guide ›</button>}
        <button onClick={(e)=>{e.stopPropagation();setEditing(ed=>!ed);}} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.18)",borderRadius:8,color:"#4D8BFF",cursor:"pointer",fontSize:10}}>✏️</button>
       </div>
      </div>
      {editing && (
       <div style={{marginTop:12,paddingTop:12,borderTop:"0.5px solid rgba(190,180,255,0.08)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
         {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
          <div key={pp.k}>
           <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginBottom:4,fontWeight:600}}>{pp.l}</div>
           <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button onClick={()=>{const c=parseFloat(ex[pp.k])||0;updateEx(pp.k,String(pp.k==="repos"?Math.max(0,c-15):Math.max(1,c-1)));}} style={{width:22,height:22,borderRadius:5,background:C.s2,border:"none",cursor:"pointer",fontSize:13}}>−</button>
            <input value={ex[pp.k]||""} onChange={e=>updateEx(pp.k,e.target.value)} style={{flex:1,padding:"4px 4px",background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:8,fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
            <button onClick={()=>{const c=parseFloat(ex[pp.k])||0;updateEx(pp.k,String(pp.k==="repos"?c+15:c+1));}} style={{width:22,height:22,borderRadius:5,background:C.accent,border:"none",color:DARK.surface,cursor:"pointer",fontSize:13}}>+</button>
           </div>
          </div>
         ))}
        </div>
        <div style={{marginBottom:8}}>
         <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginBottom:4,fontWeight:600}}>TEMPO</div>
         <input value={ex.tempo||""} onChange={e=>updateEx("tempo",e.target.value)} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"8px 12px",background:C.s1,border:"0.5px solid rgba(190,180,255,0.08)",borderRadius:8,fontSize:11,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
        </div>
        <div>
         <div style={{fontSize:10,color:"rgba(245,241,232,0.5)",marginBottom:4,fontWeight:600}}>MÉTHODE</div>
         <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {METHODS.map(mm=>(
           <button key={mm} onClick={()=>updateEx("methode",mm)} style={{padding:"4px 8px",borderRadius:12,border:`1px solid ${ex.methode===mm?"#4D8BFF":"rgba(190,180,255,0.08)"}`,background:ex.methode===mm?"rgba(59,130,246,0.12)":"transparent",color:ex.methode===mm?"#4D8BFF":"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:10,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
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