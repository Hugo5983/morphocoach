import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  BL, BLD, BLS, BLBR, BG, S1, S2, BD, TEXT, MID, DIM, GRN, RED, F, SF,
  DAYS_ALL, SPLITS, INTENSITIES, parseScheme, CSS,
  ExCard, BiblioSheet,
} from "./components/CreerKit.jsx";

export default function Creer(props) {
  const { setProg, setCycleStart, push, setCalSess, INT,
          setProgView, progs, setProgsAll, onCancel, setCS, newP, setNewP } = props;

  const [step,      setStep]      = useState(1);
  const [name,      setName]      = useState(newP?.nom||"");
  const [split,     setSplit]     = useState(newP?.split||null);
  const [days,      setDays]      = useState(newP?.jours||[]);
  const [activeDay, setActiveDay] = useState(null);
  const [sessions,  setSessions]  = useState(newP?.seances||{});
  const [sheet,     setSheet]     = useState(false);

  const sortedDays = useMemo(() => DAYS_ALL.filter(d=>days.includes(d)), [days]);

  const toggleDay = d => setDays(p => p.includes(d)?p.filter(x=>x!==d):[...p,d]);

  const applySplit = sp => {
    setSplit(sp.id);
    if (sp.id==="custom") return;
    setDays(sp.preset);
    setSessions(prev => {
      const next = {...prev};
      sp.preset.forEach(d => {
        next[d] = {...(next[d]||{intensity:"leger",ex:[]}), name:sp.names[d]||""};
      });
      return next;
    });
  };

  const sess    = d  => sessions[d]||{name:"",intensity:"leger",ex:[]};
  const setSess = (d,patch) => setSessions(p=>({...p,[d]:{...sess(d),...patch}}));

  const addEx = d => ex => {
    const cur = sess(d);
    if (cur.ex.find(e=>e.id===ex.id||e.nom===ex.n)) return;
    const {sets,reps,rest} = parseScheme(ex.scheme||`${ex.s}×${ex.r} · ${ex.rest}`);
    setSess(d,{ex:[...cur.ex,{id:ex.id||ex.n,nom:ex.n,cat:ex.cat,
      series:String(sets),reps:String(reps),repos:String(rest),
      methode:"Standard",tempo:"",historique:[],note:""}]});
  };

  const removeEx = (d,id) => setSess(d,{ex:sess(d).ex.filter(e=>e.id!==id&&e.nom!==id)});
  const updateEx = (d,id,u) => setSess(d,{ex:sess(d).ex.map(e=>(e.id===id||e.nom===id)?u:e)});

  const missingDays = sortedDays.filter(d=>sess(d).ex.length===0);
  const allComplete = sortedDays.length>0 && missingDays.length===0;
  const canNext1    = name.trim() && split && days.length>0;
  const totalEx     = sortedDays.reduce((a,d)=>a+sess(d).ex.length,0);

  // Durée moyenne réelle : séries × (repos + ~60s actifs) par exercice, moyenne sur toutes les séances
  const avgDur = useMemo(() => {
    if (totalEx === 0 || sortedDays.length === 0) return null;
    const durs = sortedDays.map(d => {
      const exs = sess(d).ex;
      if (!exs.length) return 0;
      const secs = exs.reduce((sum, ex) => {
        const sets  = parseInt(ex.series) || 4;
        const repos = parseInt(String(ex.repos || "90").replace(/\D/g,"")) || 90;
        return sum + sets * (repos + 60);   // repos entre séries + ~60s de travail par série
      }, 0);
      return Math.round(secs / 60);
    }).filter(d => d > 0);
    if (!durs.length) return null;
    return Math.round(durs.reduce((a,b)=>a+b,0) / durs.length);
  }, [sortedDays, sessions, totalEx]);

  const goStep = s => {
    setStep(s);
    if (s===2 && !activeDay) setActiveDay(sortedDays[0]||days[0]);
    if (setCS) setCS(s-1);
    if (setNewP) setNewP({nom:name,split,jours:days,seances:sessions});
  };

  // ── Identique à l'original ──────────────────────────────────────────────
  const handleSave = () => {
    const jours = days.map((j,i)=>({
      id:i+1, nom:sess(j).name||`Séance ${j}`, focus:j, duree:"45-60 min",
      intensite:sess(j).intensity||"modere",
      exercices:(sess(j).ex||[]).map(ex=>({...ex,historique:[],note:""})),
      complete:false, date:null, note:"",
    }));
    const newProg = {titre:name,type:"custom",id:`custom_${Date.now()}`,
      dateDebut:new Date().toLocaleDateString("fr-FR"),jours};
    if (setProgsAll) setProgsAll([...(progs||[]),newProg]);
    setProg(newProg);
    setCycleStart(Date.now());
    const today = new Date();
    const joursMap = {Lun:1,Mar:2,Mer:3,Jeu:4,Ven:5,Sam:6,Dim:0};
    const newSess = {};
    jours.forEach(jour => {
      const match = Object.entries(joursMap).find(([k])=>jour.focus.startsWith(k));
      if (match) {
        for (let w=0;w<6;w++) {
          const d = new Date(today);
          d.setDate(d.getDate()+((match[1]-d.getDay()+7)%7||7)+w*7);
          const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          newSess[key]={nom:jour.nom,intensite:jour.intensite||"modere",color:INT[jour.intensite||"modere"]?.c||"#4D8BFF"};
        }
      }
    });
    setCalSess(prev=>({...prev,...newSess}));
    setProgView("calendar");
    if (setCS) setCS(0);
    if (setNewP) setNewP({nom:"",split:null,jours:[],seances:{}});
    push("✅","Programme créé !",`${name} · Calendrier mis à jour !`);
  };

  const ad = activeDay||sortedDays[0];
  const s  = ad ? sess(ad) : null;
  const activeSplit = SPLITS.find(x=>x.id===split);

  return createPortal(
    <>
      <style>{CSS}</style>

      {/* ── PLEIN ÉCRAN · portal sur document.body · bypasse page-enter transform ── */}
      <div style={{ position:"fixed", inset:0, zIndex:9999,
        background:BG, display:"flex", flexDirection:"column",
        fontFamily:F, color:TEXT }}>

        {/* ── Top bar ── */}
        <div style={{ flexShrink:0,
          background:BG, backdropFilter:"blur(16px)",
          padding:"calc(env(safe-area-inset-top,20px) + 14px) 20px 14px",
          display:"flex", alignItems:"center", gap:14,
          borderBottom:`1px solid ${BD}` }}>
          <button onClick={() => step>1 ? goStep(step-1) : onCancel?.()}
            style={{ width:42, height:42, borderRadius:14, border:`1px solid ${BD}`,
              background:S1, display:"grid", placeItems:"center", color:TEXT,
              cursor:"pointer", fontSize:20, flexShrink:0, transition:".15s" }}>
            {step>1 ? "‹" : "✕"}
          </button>
          <div style={{ display:"flex", gap:7, flex:1 }}>
            {[1,2,3].map(n=>(
              <div key={n} className={`mc-seg${step>n?" done":""}${step===n?" active":""}`}><i/></div>
            ))}
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:DIM, letterSpacing:".4px",
            flexShrink:0 }}>{step}/3</div>
        </div>

        {/* ── Contenu scrollable ── */}
        <div style={{ flex:1, minHeight:0, overflowY:"auto", padding:"16px 20px 20px" }} className="mc-scroll">

          {/* ══ STEP 1 — Pose le cadre ══ */}
          {step===1 && (
            <div className="mc-page">
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"2.5px",
                textTransform:"uppercase", color:BL, marginBottom:8 }}>Nouveau programme</div>
              <h1 style={{ fontFamily:SF, fontSize:38, fontWeight:700, letterSpacing:"-.8px",
                lineHeight:1.05, color:TEXT, margin:"0 0 12px" }}>
                Pose le <em style={{ fontStyle:"italic", color:BL }}>cadre.</em>
              </h1>
              <p style={{ fontSize:15, color:MID, lineHeight:1.5, marginBottom:28 }}>
                On définit la structure avant de remplir les séances.
              </p>

              {/* Nom */}
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"2px", color:DIM,
                textTransform:"uppercase", margin:"0 0 12px" }}>Nom du programme</div>
              <input className="mc-field" placeholder="Ex. Sèche — Hypertrophie 6 sem."
                value={name} onChange={e=>setName(e.target.value)}
                style={{ marginBottom:28 }}/>

              {/* Splits */}
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"2px", color:DIM,
                textTransform:"uppercase", margin:"0 0 14px" }}>Type de split</div>
              {SPLITS.map(sp => {
                const on = split===sp.id;
                return (
                  <button key={sp.id} className="mc-split" onClick={() => applySplit(sp)}
                    style={{ borderColor:on?BL:BD,
                      background:on?`linear-gradient(135deg,rgba(59,130,246,.15),rgba(59,130,246,.04))`:S1,
                      boxShadow:on?`0 0 0 1px ${BL},0 16px 40px -20px rgba(59,130,246,.6)`:"0 2px 8px rgba(0,0,0,.25)",
                      transform:on?"translateY(-2px)":"none",
                      marginBottom:11 }}>
                    {/* Tick */}
                    <span style={{ width:24, height:24, borderRadius:"50%", flexShrink:0,
                      border:`2px solid ${on?BL:"rgba(255,255,255,.22)"}`,
                      background:on?BL:"transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all .2s" }}>
                      {on && <span style={{ color:"#fff", fontSize:13, fontWeight:800 }}>✓</span>}
                    </span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, fontWeight:700, letterSpacing:-.2 }}>{sp.name}</div>
                      <div style={{ fontSize:13, color:MID, marginTop:3 }}>{sp.desc}</div>
                    </div>
                    {sp.days>0 && (
                      <span style={{ fontSize:14, fontWeight:700, flexShrink:0,
                        color:on?BL:DIM, padding:"5px 10px", borderRadius:11,
                        border:`1px solid ${on?BLBR:BD}`,
                        background:on?BLS:"transparent" }}>
                        {sp.days}j
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Jours */}
              <div style={{ display:"flex", alignItems:"center", gap:8,
                fontSize:11, fontWeight:800, letterSpacing:"2px", color:DIM,
                textTransform:"uppercase", margin:"26px 0 14px" }}>
                Jours d'entraînement
                {split && split!=="custom" && (
                  <span style={{ fontSize:11, fontWeight:700, color:BL,
                    background:BLS, border:`1px solid ${BLBR}`, padding:"3px 8px",
                    borderRadius:7, textTransform:"none", letterSpacing:0 }}>Pré-définis</span>
                )}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                {DAYS_ALL.map(d => {
                  const on = days.includes(d);
                  return (
                    <button key={d} className="mc-day" onClick={() => toggleDay(d)}
                      style={{ color:on?"#fff":MID, borderColor:on?BL:BD,
                        background:on?`linear-gradient(135deg,${BL},${BLD})`:S1,
                        boxShadow:on?"0 10px 26px -10px rgba(59,130,246,.8)":"none" }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ STEP 2 — Séance par séance ══ */}
          {step===2 && ad && s && (
            <div className="mc-page" key={"s2-"+ad}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"2.5px",
                textTransform:"uppercase", color:BL, marginBottom:8 }}>Construis tes séances</div>
              <h1 style={{ fontFamily:SF, fontSize:36, fontWeight:700, letterSpacing:"-.8px",
                lineHeight:1.05, color:TEXT, margin:"0 0 20px" }}>
                Séance par <em style={{ fontStyle:"italic", color:BL }}>séance.</em>
              </h1>

              {/* ── Onglets jours sous le titre ── */}
              {sortedDays.length>0 && (
                <div style={{ display:"flex", gap:9, overflowX:"auto", marginBottom:22 }}
                  className="mc-scroll">
                  {sortedDays.map(d => {
                    const ds = sess(d);
                    const itDay = INTENSITIES.find(x=>x.id===(ds.intensity||"leger"))||INTENSITIES[0];
                    const on = d===ad;
                    const empty = ds.ex.length===0;
                    return (
                      <button key={d}
                        onClick={() => setActiveDay(d)}
                        style={{
                          flexShrink:0,
                          display:"inline-flex", alignItems:"center", gap:7,
                          padding:"10px 16px", borderRadius:13,
                          border:`1.5px solid ${on?itDay.color:BD}`,
                          background:on?`${itDay.color}18`:S1,
                          color:on?itDay.color:MID,
                          fontSize:14, fontWeight:700, cursor:"pointer",
                          fontFamily:F, whiteSpace:"nowrap",
                          boxShadow:on?`0 0 0 1px ${itDay.color}50,0 8px 18px -12px ${itDay.color}`:"none",
                          transition:"all .2s cubic-bezier(.22,1,.36,1)"
                        }}>
                        {d}
                        <span style={{
                          width:7, height:7, borderRadius:"50%", flexShrink:0,
                          background:empty?"#f87171":itDay.color,
                          boxShadow:empty?"0 0 6px #f87171":`0 0 7px ${itDay.color}`
                        }}/>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Nom séance */}
              <input className="mc-field" style={{ marginBottom:22 }}
                placeholder={`Nom de la séance — ${ad}`}
                value={s.name} onChange={e => setSess(ad,{name:e.target.value})}/>

              {/* Intensité */}
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"2px", color:DIM,
                textTransform:"uppercase", marginBottom:12 }}>Intensité</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:9, marginBottom:28 }}>
                {INTENSITIES.map(it => {
                  const on = s.intensity===it.id;
                  return (
                    <button key={it.id} className="mc-int" onClick={() => setSess(ad,{intensity:it.id})}
                      style={{ color:on?it.color:MID, borderColor:on?it.color:BD,
                        background:on?`${it.color}18`:S1,
                        boxShadow:on?`0 0 0 1px ${it.color},0 8px 22px -14px ${it.color}`:"none" }}>
                      {it.label}
                    </button>
                  );
                })}
              </div>

              {/* Exercices */}
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"baseline", marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:800, letterSpacing:"2px",
                  color:DIM, textTransform:"uppercase" }}>Exercices</span>
                <span style={{ fontSize:20, fontWeight:800, color:TEXT }}>{s.ex.length}</span>
              </div>

              {s.ex.length===0
                ? <div style={{borderRadius:18,padding:"20px 16px",background:"rgba(0,0,0,0.01)",border:`1px dashed ${BD}`}}>
                    {/* Ghost rows — exercices à venir */}
                    {[{w:"65%",col:"#4D8BFF"},{w:"50%",col:"#5FE0A5"},{w:"72%",col:"#B69DFF"}].map((g,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",
                        borderBottom:i<2?`1px solid rgba(0,0,0,0.03)`:"none",opacity:1-i*0.2}}>
                        {/* Numéro */}
                        <div style={{width:34,height:34,borderRadius:10,background:g.col+"15",
                          border:`1px solid ${g.col}25`,flexShrink:0}}/>
                        {/* Texte fantôme */}
                        <div style={{flex:1}}>
                          <div style={{height:11,borderRadius:4,background:"rgba(0,0,0,0.05)",
                            width:g.w,marginBottom:6}}/>
                          <div style={{height:9,borderRadius:3,background:"rgba(0,0,0,0.03)",width:"40%"}}/>
                        </div>
                      </div>
                    ))}
                    <div style={{textAlign:"center",paddingTop:14,fontSize:12,color:DIM}}>
                      Ajoute ton premier exercice ci-dessous
                    </div>
                  </div>
                : s.ex.map(ex => (
                    <ExCard key={ex.id||ex.nom} ex={ex}
                      onUpdate={u => updateEx(ad,ex.id||ex.nom,u)}
                      onRemove={() => removeEx(ad,ex.id||ex.nom)}/>
                  ))}

              <button className="mc-add-ex" onClick={() => setSheet(true)}>
                + Ajouter un exercice
              </button>

              {missingDays.length>0 && (
                <div className="mc-warn" style={{ marginTop:18 }}>
                  <span style={{ color:RED, fontSize:18, flexShrink:0 }}>⚠</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#ffb4b4", marginBottom:3 }}>
                      {missingDays.length} séance{missingDays.length>1?"s":""} à compléter
                    </div>
                    <div style={{ fontSize:13, color:MID, lineHeight:1.4 }}>
                      Chaque jour doit contenir au moins un exercice.
                    </div>
                    <div style={{ display:"inline-flex", gap:6, flexWrap:"wrap", marginTop:9 }}>
                      {missingDays.map(d => (
                        <span key={d} onClick={() => setActiveDay(d)}
                          style={{ fontSize:12, fontWeight:700, color:"#ff9a9a",
                            background:"rgba(255,90,90,.12)", border:"1px solid rgba(255,90,90,.3)",
                            padding:"4px 10px", borderRadius:8, cursor:"pointer" }}>{d} →</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 3 — Récap ══ */}
          {step===3 && (
            <div className="mc-page">
              {/* Hero */}
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"2.5px",
                textTransform:"uppercase", color:BL, marginBottom:8 }}>Récapitulatif</div>
              <h1 style={{ fontFamily:SF, fontSize:36, fontWeight:700, letterSpacing:"-.6px",
                lineHeight:1.05, color:TEXT, margin:"0 0 8px" }}>
                Tout est <em style={{ fontStyle:"italic", color:BL }}>prêt.</em>
              </h1>
              <p style={{ fontSize:15, color:MID, lineHeight:1.5, marginBottom:22 }}>
                Vérifie ton programme avant de le créer.
              </p>

              {/* Alerte si incomplet */}
              {!allComplete && (
                <div className="mc-warn" style={{ marginBottom:18 }}>
                  <span style={{ color:RED, fontSize:18 }}>⚠</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#ffb4b4", marginBottom:3 }}>
                      Validation impossible
                    </div>
                    <div style={{ fontSize:13, color:MID, lineHeight:1.4 }}>
                      Il reste {missingDays.length} séance{missingDays.length>1?"s":""} sans exercice.
                    </div>
                  </div>
                </div>
              )}

              {/* Carte programme */}
              <div style={{ background:S1, borderRadius:22, border:`1px solid ${BD}`,
                overflow:"hidden", marginBottom:14 }}>

                {/* Header carte */}
                <div style={{ padding:"18px 20px 14px",
                  background:"linear-gradient(135deg,rgba(59,130,246,.1),rgba(59,130,246,.03))",
                  borderBottom:`1px solid ${BD}` }}>
                  <div style={{ fontSize:20, fontWeight:700, fontFamily:SF,
                    color:TEXT, letterSpacing:"-.3px", marginBottom:10 }}>
                    {name||"Programme sans nom"}
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {[
                      { icon:"◐", val:activeSplit?.name||"Personnalisé" },
                      { icon:"📅", val:`${sortedDays.length} séances/sem` },
                      { icon:"🏋", val:`${totalEx} exercices` },
                    ].map((p,i) => (
                      <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5,
                        fontSize:12, fontWeight:600, color:MID,
                        background:"rgba(255,255,255,.05)", padding:"5px 10px",
                        borderRadius:9, border:`1px solid ${BD}` }}>
                        {p.icon} {p.val}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Lignes de séances */}
                <div style={{ padding:"6px 20px 10px" }}>
                  {sortedDays.map((d,i) => {
                    const ds = sess(d);
                    const it = INTENSITIES.find(x=>x.id===ds.intensity)||INTENSITIES[1];
                    const empty = ds.ex.length===0;
                    return (
                      <div key={d} style={{ display:"flex", alignItems:"center", gap:14,
                        padding:"13px 0",
                        borderTop:i>0?`1px solid rgba(255,255,255,.05)`:"none" }}>
                        {/* Badge jour */}
                        <div style={{ width:50, height:50, borderRadius:15, flexShrink:0,
                          background:empty?"rgba(248,113,113,.1)":`${it.color}12`,
                          border:`1.5px solid ${empty?"rgba(248,113,113,.4)":`${it.color}40`}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontWeight:800, fontSize:14,
                          color:empty?"#ff8a8a":it.color }}>
                          {d}
                        </div>
                        {/* Infos */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:15, fontWeight:700, color:TEXT,
                            letterSpacing:"-.2px", marginBottom:4 }}>
                            {ds.name||`Séance ${d}`}
                          </div>
                          <div style={{ fontSize:13, color:MID,
                            display:"flex", alignItems:"center", gap:7 }}>
                            <span style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                              background:it.color, boxShadow:`0 0 6px ${it.color}` }}/>
                            {it.label}
                            <span style={{ color:"rgba(255,255,255,.2)" }}>·</span>
                            {ds.ex.length||"—"} exercices
                          </div>
                        </div>
                        {/* Droite */}
                        {empty ? (
                          <span style={{ fontSize:11, fontWeight:700, color:"#ff8a8a",
                            background:"rgba(255,90,90,.1)", border:"1px solid rgba(255,90,90,.3)",
                            padding:"4px 10px", borderRadius:8, flexShrink:0 }}>
                            À compléter
                          </span>
                        ) : (
                          <div style={{ display:"flex", flexDirection:"column",
                            alignItems:"flex-end", gap:5, flexShrink:0 }}>
                            <span style={{ fontSize:16, fontWeight:800, color:TEXT }}>
                              {ds.ex.length}
                            </span>
                            <div style={{ height:3, width:32, borderRadius:2,
                              background:`${it.color}25` }}>
                              <div style={{ height:"100%", borderRadius:2,
                                width:`${Math.min((ds.ex.length/6)*100,100)}%`,
                                background:it.color }}/>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
                gap:10, marginBottom:14 }}>
                {[
                  { label:"Séances",   val:String(sortedDays.length),          sub:"/ semaine" },
                  { label:"Exercices", val:String(totalEx),                      sub:"au total"  },
                  { label:"Durée moy", val:avgDur ? `~${avgDur}` : "—",         sub:"minutes"   },
                ].map((st,i) => (
                  <div key={i} style={{ background:S1, border:`1px solid ${BD}`,
                    borderRadius:16, padding:"14px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:BL,
                      fontFamily:SF }}>{st.val}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:MID,
                      marginTop:3, lineHeight:1.3 }}>{st.label}</div>
                    <div style={{ fontSize:10, color:DIM }}>{st.sub}</div>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div style={{ display:"flex", gap:12, alignItems:"flex-start",
                padding:"14px 16px", borderRadius:16,
                background:BLS, border:`1px solid ${BLBR}` }}>
                <span style={{ fontSize:18, flexShrink:0 }}>✨</span>
                <span style={{ fontSize:13, color:MID, lineHeight:1.55 }}>
                  Tu pourras ajuster charges, tempo et méthodes à tout moment depuis le planning.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ flexShrink:0, padding:"12px 20px calc(env(safe-area-inset-bottom,16px) + 16px)",
          background:BG, borderTop:`1px solid ${BD}`,
          display:"flex", gap:11 }}>
          {step===1 && (
            <>
              {onCancel && (
                <button onClick={onCancel} style={{ flexShrink:0, padding:"16px 22px",
                  borderRadius:17, background:S1, border:`1px solid ${BD}`,
                  color:MID, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:F }}>
                  Annuler
                </button>
              )}
              <button disabled={!canNext1} onClick={() => goStep(2)}
                className="mc-shine"
                style={{ flex:1, padding:"16px", borderRadius:17, border:"none", cursor:"pointer",
                  background:canNext1?`linear-gradient(135deg,${BL},${BLD})`:`${S2}`,
                  color:canNext1?"#fff":DIM, fontSize:16, fontWeight:700, fontFamily:F,
                  boxShadow:canNext1?"0 12px 30px -10px rgba(59,130,246,.85)":"none",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  transition:"all .25s" }}>
                Suivant →
              </button>
            </>
          )}
          {step===2 && (
            <>
              <button onClick={() => goStep(1)} style={{ flexShrink:0, padding:"16px 22px",
                borderRadius:17, background:S1, border:`1px solid ${BD}`,
                color:MID, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:F }}>
                ← Retour
              </button>
              <button onClick={() => goStep(3)} className="mc-shine"
                style={{ flex:1, padding:"16px", borderRadius:17, border:"none", cursor:"pointer",
                  background:`linear-gradient(135deg,${BL},${BLD})`, color:"#fff",
                  fontSize:16, fontWeight:700, fontFamily:F,
                  boxShadow:"0 12px 30px -10px rgba(59,130,246,.85)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                Voir le récap · {totalEx} ex. →
              </button>
            </>
          )}
          {step===3 && (
            <>
              <button onClick={() => goStep(2)} style={{ flexShrink:0, padding:"16px 22px",
                borderRadius:17, background:S1, border:`1px solid ${BD}`,
                color:MID, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:F }}>
                ← Retour
              </button>
              <button disabled={!allComplete} onClick={handleSave} className="mc-shine"
                style={{ flex:1, padding:"16px", borderRadius:17, border:"none", cursor:"pointer",
                  background:allComplete?`linear-gradient(135deg,${GRN},#059669)`:S2,
                  color:allComplete?"#fff":DIM, fontSize:16, fontWeight:700, fontFamily:F,
                  boxShadow:allComplete?"0 12px 30px -10px rgba(52,211,153,.75)":"none",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  transition:"all .25s" }}>
                ✓ Créer le programme
              </button>
            </>
          )}
        </div>

      </div>

      {/* Bibliothèque — hors du container flex pour que position:fixed fonctionne */}
      {sheet && (
        <BiblioSheet onClose={() => setSheet(false)} onAdd={addEx(ad)}
          addedNoms={(s?.ex||[]).map(e=>e.nom)}/>
      )}
    </>,
    document.body
  );
}

