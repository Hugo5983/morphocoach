import { useState, useMemo } from "react";
import { calc1RM, calcKgFor } from "../../../utils/training.js";
import { C, INT, FONT, SERIF } from "../../../data/constants.js";
import { EX } from "../../../data/exercises.js";
import { GuideExModal } from "./ProgramTabModals.jsx";
import SeanceDetail from "../SeanceDetail.jsx";

const DISP_F  = FONT;
const SERIF_F = SERIF;

// ─── FORMULE EPLEY ────────────────────────────────────────────────────────────

// ─── CIBLE PAR OBJECTIF ───────────────────────────────────────────────────────
export const OBJ_TARGET = {
  hypertrophie:    { reps:10, pct:75, l:"Hypertrophie",    color:"#4D8BFF", desc:"10 reps · Volume musculaire"      },
  force:           { reps:5,  pct:87, l:"Force",            color:"#FFAB5D", desc:"5 reps · Force maximale"          },
  poids:           { reps:15, pct:64, l:"Perte de poids",   color:"#5FE0A5", desc:"15 reps · Brûle des calories"     },
  sante:           { reps:12, pct:70, l:"Santé générale",   color:"#5FE0A5", desc:"12 reps · Maintien & tonicité"    },
  prep_physique:   { reps:8,  pct:80, l:"Prépa physique",   color:"#FFC857", desc:"8 reps · Puissance & condition"   },
  reathletisation: { reps:15, pct:64, l:"Réathlétisation",  color:"#06b6d4", desc:"15 reps · Progression douce"      },
};
export const DEFAULT_TARGET = { reps:10, pct:75, l:"Hypertrophie", color:"#4D8BFF", desc:"10 reps · Volume musculaire" };

// ─── MODAL SAISIE MANUELLE ────────────────────────────────────────────────────
export function ManualRMModal({ prog, setProg, onClose, push, C }) {
  const [search,   setSearch]   = useState("");
  const [groupe,   setGroupe]   = useState(null);
  const [selected, setSelected] = useState(null);
  const [kg,       setKg]       = useState("");
  const [reps,     setReps]     = useState("");
  const [focusField, setFocusField] = useState(null);

  const groupes = Object.keys(EX);
  const cc = (cat) => ({principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[cat||"principal"]||"#4D8BFF");

  // Liste d'exercices à afficher selon recherche ou groupe sélectionné
  const exosList = search
    ? Object.entries(EX).flatMap(([g, arr]) => arr.map(ex => ({ nom:ex.n, cat:ex.cat, group:g, raw:ex })))
        .filter(e => e.nom.toLowerCase().includes(search.toLowerCase()))
    : groupe
      ? (EX[groupe]||[]).map(ex => ({ nom:ex.n, cat:ex.cat, group:groupe, raw:ex }))
      : [];

  const rm1Calc = selected && kg && reps ? calc1RM(parseFloat(kg), parseInt(reps)) : 0;

  const handleSave = () => {
    if (!selected || !kg) return;
    const u = JSON.parse(JSON.stringify(prog));
    const entry = { poids:parseFloat(kg), reps:parseInt(reps)||1, date:new Date().toLocaleDateString("fr-FR"), cat:selected.cat };
    let found = false;
    u.jours.forEach(jour => {
      (jour.exercices||[]).forEach(ex => {
        if (ex.nom === selected.nom) { ex.historique = ex.historique||[]; ex.historique.push(entry); found = true; }
      });
    });
    if (!found) { u.records = u.records||{}; u.records[selected.nom] = u.records[selected.nom]||[]; u.records[selected.nom].push(entry); }
    setProg(u);
    push("🏆","Record enregistré !",`${selected.nom} · ${kg}kg × ${reps||1} reps · 1RM≈${rm1Calc}kg`);
    onClose();
  };

  const overlayStyle = {position:"fixed",inset:0,zIndex:300,background:"rgba(4,7,15,0.72)",backdropFilter:"blur(3px)",WebkitBackdropFilter:"blur(3px)",display:"flex",alignItems:"flex-end",justifyContent:"center"};
  const sheetStyle   = {width:"100%",maxWidth:480,background:"#0d1424",border:`1px solid ${C.bd}`,borderBottom:"none",borderRadius:"24px 24px 0 0",maxHeight:"88vh",overflowY:"auto",WebkitOverflowScrolling:"touch",boxShadow:"0 -20px 60px rgba(0,0,0,0.5)"};

  return (
    <div style={overlayStyle} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={sheetStyle}>
        <div style={{width:38,height:4,borderRadius:2,background:"rgba(255,255,255,0.14)",margin:"10px auto 0"}}/>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 14px"}}>
          <div>
            <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Nouveau record</div>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:300,color:"#F5F1E8"}}>
              {selected ? selected.nom : "Saisie manuelle"}
            </div>
          </div>
          <button onClick={onClose} style={{background:C.s2,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,width:36,height:36,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:18}}>×</button>
        </div>

        <div style={{padding:"0 16px"}}>
          {!selected ? (
            <div>
              {/* Recherche */}
              <div style={{position:"relative",marginBottom:12}}>
                <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}}
                  placeholder="Rechercher un exercice…"
                  style={{width:"100%",padding:"10px 14px 10px 36px",background:C.s1,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,fontSize:13,color:"#F5F1E8",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}
                />
                <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"rgba(245,241,232,0.50)"}}>🔍</div>
              </div>

              {/* Groupes musculaires */}
              {!search && (
                <div>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:8}}>Choisir un groupe musculaire</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                    {groupes.map(g => (
                      <button key={g} onClick={() => setGroupe(g===groupe?null:g)}
                        style={{padding:"6px 12px",background:groupe===g?"rgba(59,130,246,0.1)":C.s2||"#0B0F1F",border:`1px solid ${groupe===g?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:16,color:groupe===g?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:11,fontWeight:groupe===g?600:400,fontFamily:"'Inter',sans-serif"}}>
                        {g} <span style={{fontSize:9,color:"rgba(245,241,232,0.50)"}}>({(EX[g]||[]).length})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste exercices (recherche ou groupe sélectionné) */}
              {exosList.length > 0 && (
                <div>
                  {groupe && !search && <div style={{fontSize:10,color:"#4D8BFF",fontWeight:600,marginBottom:8}}>{groupe} · {exosList.length} exercices</div>}
                  {exosList.map((ex, i) => (
                    <div key={i} onClick={() => setSelected(ex)}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",background:C.s1,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,marginBottom:6,cursor:"pointer"}}
                      onMouseEnter={ev=>ev.currentTarget.style.borderColor=cc(ex.cat)}
                      onMouseLeave={ev=>ev.currentTarget.style.borderColor="rgba(190,180,255,0.07)"}>
                      <div style={{width:4,height:32,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:500,color:"#F5F1E8"}}>{ex.nom}</div>
                        {search && <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",marginTop:1}}>{ex.group}</div>}
                      </div>
                      <div style={{color:"rgba(245,241,232,0.50)",fontSize:14}}>›</div>
                    </div>
                  ))}
                </div>
              )}
              {!search && !groupe && (
                <div style={{textAlign:"center",padding:"20px 0",fontSize:11,color:"rgba(245,241,232,0.50)"}}>Sélectionne un groupe ou recherche un exercice</div>
              )}
              {search && exosList.length === 0 && (
                <div style={{textAlign:"center",padding:"20px 0",fontSize:11,color:"rgba(245,241,232,0.50)"}}>Aucun exercice trouvé pour "{search}"</div>
              )}
            </div>
          ) : (
            <div>
              <button onClick={()=>{setSelected(null);setKg("");setReps("");setFocusField(null);}} style={{background:"transparent",border:"none",color:"#60A5FA",cursor:"pointer",fontSize:12.5,fontWeight:600,padding:"0 0 14px",display:"flex",alignItems:"center",gap:5}}>← Changer d'exercice</button>

              {/* Badge exercice */}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.18)",borderRadius:14,marginBottom:16}}>
                <div style={{width:4,height:38,borderRadius:2,background:cc(selected.cat),flexShrink:0}}/>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:"#F2F4F7",letterSpacing:-0.2,fontFamily:DISP_F}}>{selected.nom}</div>
                  <div style={{fontSize:11,color:"rgba(242,244,247,0.35)",marginTop:2,fontFamily:DISP_F}}>{selected.group}</div>
                </div>
              </div>

              {/* Tuiles Charge / Reps */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}>
                {/* Charge */}
                <div style={{background:C.s1,border:`1px solid ${focusField==="kg"?"rgba(59,130,246,0.5)":C.bd}`,borderRadius:18,padding:"14px 14px 13px",boxShadow:focusField==="kg"?"0 0 0 3px rgba(59,130,246,0.12)":"none"}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:9,fontFamily:DISP_F}}>Charge</div>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:4,height:46}}>
                    <input type="number" inputMode="decimal" value={kg} onChange={e=>setKg(e.target.value)} onFocus={()=>setFocusField("kg")} onBlur={()=>setFocusField(null)} placeholder="80"
                      style={{width:"100%",background:"none",border:"none",color:"#F2F4F7",fontFamily:DISP_F,fontSize:42,fontWeight:800,letterSpacing:-2,textAlign:"center",outline:"none",padding:0,minWidth:0}}/>
                    <span style={{fontSize:14,color:"rgba(242,244,247,0.35)",fontWeight:600}}>kg</span>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:11}}>
                    <button onClick={()=>setKg(k=>String(Math.max(0,(parseFloat(k)||0)-2.5)))} style={{flex:1,height:38,borderRadius:11,border:"none",cursor:"pointer",fontSize:20,fontWeight:600,fontFamily:DISP_F,background:C.s2,color:"rgba(242,244,247,0.60)"}}>−</button>
                    <button onClick={()=>setKg(k=>String((parseFloat(k)||0)+2.5))} style={{flex:1,height:38,borderRadius:11,border:"none",cursor:"pointer",fontSize:20,fontWeight:600,fontFamily:DISP_F,background:"rgba(59,130,246,0.16)",color:"#60A5FA"}}>+</button>
                  </div>
                </div>
                {/* Reps */}
                <div style={{background:C.s1,border:`1px solid ${focusField==="reps"?"rgba(59,130,246,0.5)":C.bd}`,borderRadius:18,padding:"14px 14px 13px",boxShadow:focusField==="reps"?"0 0 0 3px rgba(59,130,246,0.12)":"none"}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:9,fontFamily:DISP_F}}>Répétitions</div>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:4,height:46}}>
                    <input type="number" inputMode="numeric" value={reps} onChange={e=>setReps(e.target.value)} onFocus={()=>setFocusField("reps")} onBlur={()=>setFocusField(null)} placeholder="5"
                      style={{width:"100%",background:"none",border:"none",color:"#F2F4F7",fontFamily:DISP_F,fontSize:42,fontWeight:800,letterSpacing:-2,textAlign:"center",outline:"none",padding:0,minWidth:0}}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:11}}>
                    <button onClick={()=>setReps(r=>String(Math.max(1,(parseInt(r)||0)-1)))} style={{flex:1,height:38,borderRadius:11,border:"none",cursor:"pointer",fontSize:20,fontWeight:600,fontFamily:DISP_F,background:C.s2,color:"rgba(242,244,247,0.60)"}}>−</button>
                    <button onClick={()=>setReps(r=>String((parseInt(r)||0)+1))} style={{flex:1,height:38,borderRadius:11,border:"none",cursor:"pointer",fontSize:20,fontWeight:600,fontFamily:DISP_F,background:"rgba(59,130,246,0.16)",color:"#60A5FA"}}>+</button>
                  </div>
                </div>
              </div>

              {/* Reps rapides */}
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",margin:"2px 0 8px",fontFamily:DISP_F}}>Reps rapides</div>
              <div style={{display:"flex",gap:6,marginBottom:16}}>
                {[1,3,5,8,10,12].map(r=>{
                  const on = reps===String(r);
                  return (
                    <button key={r} onClick={()=>setReps(String(r))} style={{flex:1,padding:"9px 0",borderRadius:10,background:on?"rgba(59,130,246,0.14)":C.s1,border:`1px solid ${on?"#3B82F6":C.bd}`,color:on?"#60A5FA":"rgba(242,244,247,0.60)",fontFamily:DISP_F,fontSize:13,fontWeight:600,cursor:"pointer"}}>{r}</button>
                  );
                })}
              </div>

              {/* Carte 1RM (sans formule visible) */}
              <div style={{position:"relative",overflow:"hidden",borderRadius:18,padding:"16px 18px",marginBottom:18,background:"linear-gradient(135deg,rgba(59,130,246,0.16),rgba(37,99,235,0.06))",border:"1px solid rgba(59,130,246,0.25)",display:"flex",alignItems:"center",justifyContent:"space-between",opacity:rm1Calc>0?1:0.45,filter:rm1Calc>0?"none":"grayscale(0.4)",transition:"opacity .25s"}}>
                <div style={{position:"absolute",top:-40,right:-30,width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.18),transparent 65%)",pointerEvents:"none"}}/>
                <div>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",color:"#60A5FA",marginBottom:5,fontFamily:DISP_F}}>1RM estimé</div>
                  <div style={{fontSize:11,color:"rgba(242,244,247,0.60)",fontFamily:DISP_F}}>{rm1Calc>0 ? (parseInt(reps)===1 ? "Ta charge max sur 1 rep" : "Estimation à partir de ta série") : "Saisis charge et reps"}</div>
                </div>
                <div style={{fontFamily:SERIF_F,fontSize:40,color:"#fff",lineHeight:1}}>
                  {rm1Calc>0 ? rm1Calc : "—"}{rm1Calc>0 && <span style={{fontSize:15,color:"#60A5FA",fontFamily:DISP_F,fontWeight:700,marginLeft:3}}>kg</span>}
                </div>
              </div>

              <button onClick={handleSave} disabled={!kg||!reps}
                style={{width:"100%",padding:"16px",borderRadius:16,border:"none",fontFamily:DISP_F,fontSize:15,fontWeight:700,letterSpacing:-0.2,cursor:(!kg||!reps)?"default":"pointer",background:(!kg||!reps)?C.s2:"linear-gradient(180deg,#3B82F6,#2563EB)",color:(!kg||!reps)?"rgba(242,244,247,0.35)":"#fff",boxShadow:(!kg||!reps)?"none":"0 10px 26px rgba(59,130,246,0.36)"}}>
                Enregistrer le record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MINI MODAL CRÉATION SÉANCE DU JOUR ─────────────────────────────────────
export function CreateSeanceModal({ prog, setProg, setCalSess, push, onClose, C }) {
  const [step,       setStep]     = useState(1);
  const [seNom,      setSeNom]    = useState("");
  const [intensite,  setInt]      = useState("modere");
  const [duree,      setDuree]    = useState("60 min");
  const [exos,       setExos]     = useState([]);
  const [editEx,     setEditEx]   = useState({});      // {idx: true} → accordéon ouvert
  const [newExForm,  setNewExForm]= useState(null);    // exercice en cours de config
  const [guideEx,    setGuideEx]  = useState(null);    // exercice ouvert dans le guide
  const [search,     setSearch]   = useState("");
  const [groupe,     setGroupe]   = useState(null);

  const DURS    = ["30 min","45 min","60 min","75 min","90 min+"];
  const METHODS = ["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Dégressif","Pré-fatigue"];
  const cc      = (cat) => ({principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[cat||"principal"]||"#4D8BFF");

  // searchList inclut les données brutes (morpho, séries, reps, repos)
  const searchList = search
    ? Object.entries(EX).flatMap(([g,arr]) => arr.map(ex => ({nom:ex.n,cat:ex.cat,group:g,morpho:ex.morpho,s:ex.s,r:ex.r,rest:ex.rest,raw:ex})))
        .filter(e => e.nom.toLowerCase().includes(search.toLowerCase()))
    : groupe ? (EX[groupe]||[]).map(ex => ({nom:ex.n,cat:ex.cat,group:groupe,morpho:ex.morpho,s:ex.s,r:ex.r,rest:ex.rest,raw:ex})) : [];

  const removeEx    = (i)       => { setExos(p=>p.filter((_,j)=>j!==i)); setEditEx(m=>{const n={...m};delete n[i];return n;}); };
  const updateField = (i,f,v)   => setExos(p=>p.map((e,j)=>j===i?{...e,[f]:v}:e));
  const openPicker  = (ex)      => setNewExForm({...ex, series:"4",reps:"10",repos:"90s",charge:"",methode:"Classique"});
  const confirmAdd  = ()        => {
    if (!newExForm?.nom) return;
    if (!exos.find(e=>e.nom===newExForm.nom)) setExos(p=>[...p,{...newExForm}]);
    setNewExForm(null); setSearch(""); setGroupe(null);
  };

  const handleSave = () => {
    const today    = new Date();
    const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const nomFinal = seNom.trim() || `Séance ${dayNames[today.getDay()]}`;
    const intColor = INT[intensite]?.c || "#3B82F6";
    if (setCalSess) {
      setCalSess(prev => ({
        ...prev,
        [todayKey]: {
          nom: nomFinal, intensite, color: intColor, duree,
          seanceId: `today_${todayKey}`,
          musculation: exos.length > 0 ? { exercices: exos } : undefined,
        },
      }));
    }
    push("✅","Séance créée !",`${nomFinal} · ${exos.length} exercice${exos.length!==1?"s":""}`);
    onClose();
  };

  // ── Guide exercice ──
  if (guideEx) {
    return <GuideExModal exData={guideEx} exSerie={null} onClose={()=>setGuideEx(null)} C={C}/>;
  }

  /* ── Styles ── */
  const lbl     = { fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:8,fontFamily:DISP_F };
  const nextOk  = step===1 ? !!seNom.trim() : true;
  const nextBtn = { flex:2,padding:"15px",borderRadius:14,border:"none",fontFamily:DISP_F,fontSize:14,fontWeight:700,
    cursor:nextOk?"pointer":"default",background:nextOk?"linear-gradient(180deg,#3B82F6,#2563EB)":C.s2,
    color:nextOk?"#fff":"rgba(242,244,247,0.30)",boxShadow:nextOk?"0 8px 24px rgba(59,130,246,0.30)":"none" };

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(4,7,15,0.72)",backdropFilter:"blur(3px)",WebkitBackdropFilter:"blur(3px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
         onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,background:"#0d1424",border:`1px solid ${C.bd}`,borderBottom:"none",borderRadius:"24px 24px 0 0",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 -22px 60px rgba(0,0,0,0.5)"}}>

        {/* Poignée */}
        <div style={{width:38,height:4,borderRadius:2,background:"rgba(255,255,255,0.14)",margin:"10px auto 0",flexShrink:0}}/>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"12px 18px 0",flexShrink:0}}>
          <div>
            <div style={lbl}>{newExForm ? "Configurer l'exercice" : `Étape ${step} / 2 · ${step===1?"Informations":"Exercices"}`}</div>
            <div style={{fontFamily:SERIF_F,fontSize:22,letterSpacing:-0.5,lineHeight:1}}>
              {newExForm ? newExForm.nom : step===1 ? "Nouvelle séance" : seNom.trim()||"Exercices"}
            </div>
          </div>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:10,background:C.s2,border:`1px solid ${C.bd}`,color:"rgba(242,244,247,0.60)",fontSize:18,cursor:"pointer",flexShrink:0}}>×</button>
        </div>

        {/* Dots */}
        {!newExForm && (
          <div style={{display:"flex",gap:6,padding:"10px 18px 0",flexShrink:0}}>
            {[1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:step>=i?"#3B82F6":"rgba(255,255,255,0.08)",transition:"background .3s"}}/>)}
          </div>
        )}

        {/* ── Corps ── */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 18px 0",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>

          {/* ── ÉTAPE 1 : Infos ── */}
          {!newExForm && step===1 && (<>
            <div style={lbl}>Nom de la séance</div>
            <input
              value={seNom} onChange={e=>setSeNom(e.target.value)}
              placeholder="Ex : Push, Dos & Biceps…"
              autoComplete="off" autoCorrect="off" autoCapitalize="words"
              data-form-type="other" spellCheck={false}
              style={{width:"100%",padding:"14px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:14,color:"#F2F4F7",fontFamily:DISP_F,fontSize:16,fontWeight:600,outline:"none",marginBottom:18}}
            />
            <div style={lbl}>Intensité</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
              {Object.entries(INT).map(([k,v])=>{const on=intensite===k;return(
                <button key={k} onClick={()=>setInt(k)} style={{padding:"9px 14px",borderRadius:12,border:`1px solid ${on?v.c:C.bd}`,background:on?`${v.c}18`:C.s1,color:on?v.c:"rgba(242,244,247,0.55)",fontFamily:DISP_F,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:v.c,flexShrink:0,boxShadow:on?`0 0 6px ${v.c}80`:"none"}}/>
                  {v.l}
                </button>
              );})}
            </div>
            <div style={lbl}>Durée estimée</div>
            <div style={{display:"flex",gap:7,marginBottom:20}}>
              {DURS.map(d=>{const on=duree===d;return(
                <button key={d} onClick={()=>setDuree(d)} style={{flex:1,padding:"11px 0",borderRadius:12,border:`1px solid ${on?"#3B82F6":C.bd}`,background:on?"rgba(59,130,246,0.12)":C.s1,color:on?"#60A5FA":"rgba(242,244,247,0.55)",fontFamily:DISP_F,fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"center"}}>{d}</button>
              );})}
            </div>
          </>)}

          {/* ── CONFIG EXERCICE (formulaire inline) ── */}
          {newExForm && (<>
            {/* Badge exo */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:`${cc(newExForm.cat)}0d`,border:`1px solid ${cc(newExForm.cat)}30`,borderRadius:14,marginBottom:16,marginTop:4}}>
              <div style={{width:4,height:38,borderRadius:2,background:cc(newExForm.cat),flexShrink:0}}/>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F}}>{newExForm.nom}</div>
                <div style={{fontSize:10.5,color:"rgba(242,244,247,0.40)",marginTop:2,fontFamily:DISP_F}}>{newExForm.group}</div>
              </div>
            </div>
            {/* Séries / Reps / Repos / Charge */}
            <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:16,padding:"14px",marginBottom:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                {[{l:"Séries",k:"series",def:"4"},{l:"Reps",k:"reps",def:"10"},{l:"Repos",k:"repos",def:"90s"},{l:"Charge",k:"charge",def:""}].map(pp=>(
                  <div key={pp.k}>
                    <div style={{...lbl,marginBottom:5}}>{pp.l}</div>
                    <input value={newExForm[pp.k]||""} onChange={e=>setNewExForm(f=>({...f,[pp.k]:e.target.value}))}
                      placeholder={pp.def} autoComplete="off"
                      style={{width:"100%",padding:"11px 10px",background:C.s2,border:`1px solid ${C.bd}`,borderRadius:10,fontSize:15,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F,textAlign:"center",outline:"none"}}/>
                  </div>
                ))}
              </div>
              {/* Méthode */}
              <div style={lbl}>Méthode</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {METHODS.map(mm=>{const on=newExForm.methode===mm;return(
                  <button key={mm} onClick={()=>setNewExForm(f=>({...f,methode:mm}))} style={{padding:"5px 11px",borderRadius:99,border:`1px solid ${on?"#3B82F6":C.bd}`,background:on?"rgba(59,130,246,0.12)":C.s1,color:on?"#60A5FA":"rgba(242,244,247,0.45)",cursor:"pointer",fontSize:10.5,fontWeight:on?700:500,fontFamily:DISP_F}}>{mm}</button>
                );})}
              </div>
            </div>
          </>)}

          {/* ── ÉTAPE 2 : Exercices ── */}
          {!newExForm && step===2 && (<>
            {/* Liste exos ajoutés */}
            <div style={{...lbl,marginBottom:exos.length?10:0}}>
              Exercices <span style={{color:"#60A5FA"}}>({exos.length})</span>
            </div>
            {exos.length===0 && (
              <div style={{textAlign:"center",padding:"14px 0 16px",fontSize:12,color:"rgba(242,244,247,0.30)",fontFamily:DISP_F}}>Aucun exercice — ajoute depuis la bibliothèque ci-dessous.</div>
            )}
            {exos.map((ex,i)=>{
              const colour = cc(ex.cat);
              const isOpen = !!editEx[i];
              return (
                <div key={i} style={{background:C.s1,border:`1px solid ${isOpen?colour+"40":C.bd}`,borderRadius:16,marginBottom:8,overflow:"hidden"}}>
                  <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                    {/* Numéro carré coloré */}
                    <div style={{width:38,height:38,borderRadius:11,flexShrink:0,background:`linear-gradient(145deg,${colour}30,${colour}08)`,border:`1px solid ${colour}40`,color:colour,display:"grid",placeItems:"center",fontFamily:DISP_F,fontSize:13,fontWeight:800}}>{i+1}</div>
                    <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setEditEx(m=>({...m,[i]:!m[i]}))}>
                      <div style={{fontSize:14,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F,letterSpacing:-0.1}}>{ex.nom}</div>
                      <div style={{fontSize:11,color:"rgba(242,244,247,0.35)",marginTop:2,fontFamily:DISP_F}}>
                        {ex.series}×{ex.reps} · {ex.repos}{ex.charge?` · `+ex.charge:""}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}
                        <span style={{color:"#60A5FA",marginLeft:6}}>{isOpen?"▲":"✏️"}</span>
                      </div>
                    </div>
                    <button onClick={()=>removeEx(i)} style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.20)",borderRadius:9,padding:"6px 10px",color:"#F87171",cursor:"pointer",fontSize:11,fontFamily:DISP_F,fontWeight:600}}>×</button>
                  </div>
                  {/* Accordéon édition */}
                  {isOpen && (
                    <div style={{borderTop:`1px solid ${C.bd}`,padding:"12px 14px",background:"rgba(59,130,246,0.03)"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                        {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
                          <div key={pp.k}>
                            <div style={{...lbl,marginBottom:5}}>{pp.l}</div>
                            <div style={{display:"flex",gap:4,alignItems:"center"}}>
                              <button onClick={()=>{const cur=parseFloat(ex[pp.k])||0;updateField(i,pp.k,String(Math.max(0,cur-1)));}} style={{width:28,height:28,borderRadius:7,background:C.s2,border:"none",cursor:"pointer",fontSize:14,color:"rgba(242,244,247,0.60)"}}>−</button>
                              <input value={ex[pp.k]||""} onChange={e=>updateField(i,pp.k,e.target.value)} autoComplete="off"
                                style={{flex:1,padding:"6px 4px",background:C.s2,border:`1px solid ${C.bd}`,borderRadius:8,fontSize:12,fontWeight:600,textAlign:"center",fontFamily:DISP_F,color:"#F2F4F7",outline:"none"}}/>
                              <button onClick={()=>{const cur=parseFloat(ex[pp.k])||0;updateField(i,pp.k,String(cur+1));}} style={{width:28,height:28,borderRadius:7,background:"rgba(59,130,246,0.16)",border:"none",cursor:"pointer",fontSize:14,color:"#60A5FA"}}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={lbl}>Méthode</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {METHODS.map(mm=>{const on=ex.methode===mm;return(
                          <button key={mm} onClick={()=>updateField(i,"methode",mm)} style={{padding:"4px 10px",borderRadius:99,border:`1px solid ${on?"#3B82F6":C.bd}`,background:on?"rgba(59,130,246,0.12)":C.s1,color:on?"#60A5FA":"rgba(242,244,247,0.45)",cursor:"pointer",fontSize:10,fontWeight:on?700:500,fontFamily:DISP_F}}>{mm}</button>
                        );})}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bibliothèque — design identique à Creer.jsx */}
            <div style={{...lbl,marginTop:exos.length?6:0}}>Bibliothèque</div>
            <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}} placeholder="🔍  Rechercher un exercice…"
              autoComplete="off" autoCorrect="off" data-form-type="other"
              style={{width:"100%",padding:"12px 14px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,color:"#F2F4F7",fontFamily:DISP_F,fontSize:13,outline:"none",marginBottom:10}}/>

            {/* Chips groupes — scroll horizontal */}
            {!search && (
              <div style={{display:"flex",gap:8,overflowX:"auto",padding:"0 0 12px",flexShrink:0,scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
                {Object.keys(EX).map(g=>{const on=groupe===g;return(
                  <button key={g} onClick={()=>setGroupe(g===groupe?null:g)} style={{flexShrink:0,padding:"9px 16px",borderRadius:12,border:`1.5px solid ${on?"#3B82F6":C.bd}`,background:on?"rgba(59,130,246,0.12)":C.s1,color:on?"#3B82F6":"rgba(242,244,247,0.55)",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:DISP_F,whiteSpace:"nowrap"}}>{g}</button>
                );})}
              </div>
            )}

            {/* Cartes exercices riches */}
            {searchList.length>0 && searchList.map((ex,i)=>{
              const done = !!exos.find(e=>e.nom===ex.nom);
              const col  = cc(ex.cat);
              return (
                <div key={i} style={{background:C.s1,border:`1px solid ${done?"rgba(52,211,153,0.25)":C.bd}`,borderRadius:16,padding:"16px",marginBottom:10,borderLeft:`3px solid ${col}`,boxShadow:`0 8px 24px -16px ${col}`}}>
                  {/* Badge catégorie */}
                  <span style={{fontSize:10.5,fontWeight:800,letterSpacing:"1.2px",padding:"4px 9px",borderRadius:7,display:"inline-block",marginBottom:8,color:col,background:`${col}18`,border:`1px solid ${col}35`}}>
                    {ex.cat?.toUpperCase()}
                  </span>
                  {/* Nom + info */}
                  <div style={{fontSize:16,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F,letterSpacing:-0.2,marginBottom:3}}>{ex.nom}</div>
                  <div style={{fontSize:13,color:"rgba(242,244,247,0.55)",marginBottom:4,fontFamily:DISP_F}}>
                    {ex.s}×{ex.r} · {ex.rest}s{search&&<span style={{color:"rgba(242,244,247,0.35)",marginLeft:8}}>{ex.group}</span>}
                  </div>
                  {/* Conseil morpho tronqué */}
                  {ex.morpho && (
                    <div style={{fontSize:12,color:"rgba(242,244,247,0.35)",fontStyle:"italic",lineHeight:1.5,marginBottom:10,fontFamily:DISP_F}}>
                      {(ex.morpho||"").substring(0,80)}…
                    </div>
                  )}
                  {/* Boutons */}
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>!done&&openPicker(ex)} style={{flex:1,padding:"13px",borderRadius:13,border:"none",fontFamily:DISP_F,fontSize:13,fontWeight:700,cursor:done?"default":"pointer",
                      background:done?"rgba(52,211,153,0.12)":"linear-gradient(180deg,#3B82F6,#2563EB)",
                      color:done?"#34D399":"#fff",boxShadow:done?"none":"0 6px 18px rgba(59,130,246,0.28)"}}>
                      {done ? "✓ Ajouté" : "+ Ajouter"}
                    </button>
                    <button onClick={()=>setGuideEx(ex.raw||ex)} style={{padding:"13px 16px",background:"rgba(59,130,246,0.10)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,color:"#60A5FA",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DISP_F}}>
                      Guide →
                    </button>
                  </div>
                </div>
              );
            })}

            {!search&&!groupe&&<div style={{textAlign:"center",padding:"12px 0",fontSize:11,color:"rgba(242,244,247,0.30)",fontFamily:DISP_F}}>Sélectionne un groupe ou recherche</div>}
            {search&&searchList.length===0&&<div style={{textAlign:"center",padding:"12px 0",fontSize:11,color:"rgba(242,244,247,0.30)",fontFamily:DISP_F}}>Aucun résultat pour « {search} »</div>}
          </>)}

          <div style={{height:16}}/>
        </div>

        {/* ── Footer ── */}
        <div style={{padding:"10px 18px 26px",flexShrink:0,borderTop:`1px solid ${C.bd}`}}>
          <div style={{display:"flex",gap:9}}>
            {(step===2||newExForm) && (
              <button onClick={newExForm?()=>setNewExForm(null):()=>setStep(1)}
                style={{flex:1,padding:"15px",borderRadius:14,border:`1px solid ${C.bd}`,background:"transparent",color:"rgba(242,244,247,0.45)",fontFamily:DISP_F,fontSize:14,fontWeight:600,cursor:"pointer"}}>
                ← Retour
              </button>
            )}
            <button onClick={newExForm?confirmAdd:step===1?()=>setStep(2):handleSave}
              disabled={newExForm?!newExForm.nom:(!nextOk)}
              style={nextBtn}>
              {newExForm ? "Ajouter à la séance"
                : step===1 ? "Continuer →"
                : `Créer la séance${exos.length>0?` · ${exos.length} exo${exos.length>1?"s":""}`:" (sans exercice)"}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── MODAL MODIFIER RECORD ───────────────────────────────────────────────────
export function EditRecordModal({ exData, prog, setProg, push, onClose }) {
  const [entries,  setEntries]  = useState((exData.historique||[]).map((h,i)=>({...h,idx:i})));
  const [editIdx,  setEditIdx]  = useState(null);  // null | "new" | number
  const [editKg,   setEditKg]   = useState("");
  const [editReps, setEditReps] = useState("");
  const [focusField, setFocusField] = useState(null);

  const rm1Edit = editKg && editReps ? calc1RM(parseFloat(editKg), parseInt(editReps)) : 0;

  const persistEntries = (next) => {
    setEntries(next);
    const u = JSON.parse(JSON.stringify(prog));
    let found = false;
    u.jours.forEach(jour => {
      (jour.exercices||[]).forEach(ex => {
        if (ex.nom === exData.nom) { ex.historique = next.map(({idx,...h})=>h); found = true; }
      });
    });
    if (!found && u.records?.[exData.nom]) u.records[exData.nom] = next.map(({idx,...h})=>h);
    setProg(u);
  };

  const openEdit = (i) => {
    const h = entries[i];
    setEditKg(String(h.poids)); setEditReps(String(h.reps)); setEditIdx(i); setFocusField(null);
  };
  const openNew  = () => { setEditKg(""); setEditReps(""); setEditIdx("new"); setFocusField(null); };
  const cancelEdit = () => { setEditIdx(null); setEditKg(""); setEditReps(""); setFocusField(null); };

  const saveEdit = () => {
    if (!editKg || !editReps) return;
    const entry = { poids:parseFloat(editKg), reps:parseInt(editReps), date:new Date().toLocaleDateString("fr-FR") };
    let next;
    if (editIdx === "new") {
      next = [...entries, {...entry, idx:entries.length}];
      push("✅","Record ajouté",`${exData.nom} · ${editKg}kg × ${editReps} reps · 1RM≈${rm1Edit}kg`);
    } else {
      next = entries.map((h,i) => i===editIdx ? {...entry, idx:i} : h);
      push("✏️","Record modifié",`${exData.nom} · ${editKg}kg × ${editReps} reps`);
    }
    persistEntries(next); cancelEdit();
  };

  const deleteEntry = (i) => {
    const next = entries.filter((_,j)=>j!==i).map((h,j)=>({...h,idx:j}));
    persistEntries(next);
    push("🗑️","Entrée supprimée","Retirée de l'historique.");
    if (editIdx===i) cancelEdit();
  };

  const tileStyle = (field) => ({
    background: C.s1,
    border: `1px solid ${focusField===field ? "rgba(59,130,246,0.5)" : C.bd}`,
    borderRadius: 18, padding: "14px 14px 13px",
    boxShadow: focusField===field ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
  });
  const btnStepper = (bg, color) => ({
    flex:1, height:38, borderRadius:11, border:"none", cursor:"pointer",
    fontSize:20, fontWeight:600, fontFamily:DISP_F, background:bg, color,
  });

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(4,7,15,0.72)",backdropFilter:"blur(3px)",WebkitBackdropFilter:"blur(3px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
         onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,background:"#0d1424",border:`1px solid ${C.bd}`,borderBottom:"none",borderRadius:"24px 24px 0 0",maxHeight:"88vh",overflowY:"auto",WebkitOverflowScrolling:"touch",boxShadow:"0 -22px 60px rgba(0,0,0,0.5)"}}>
        <div style={{width:38,height:4,borderRadius:2,background:"rgba(255,255,255,0.14)",margin:"10px auto 0"}}/>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"12px 18px 10px"}}>
          <div>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.4px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:4,fontFamily:DISP_F}}>Modifier le record</div>
            <div style={{fontFamily:SERIF_F,fontSize:22,letterSpacing:-0.5,lineHeight:1}}>{exData.nom}</div>
            <div style={{fontSize:11,color:"rgba(242,244,247,0.45)",marginTop:4,fontFamily:DISP_F}}>1RM actuel : <span style={{color:"#60A5FA",fontWeight:700}}>{exData.rm1} kg</span></div>
          </div>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:10,background:C.s2,border:`1px solid ${C.bd}`,color:"rgba(242,244,247,0.60)",cursor:"pointer",fontSize:18,flexShrink:0}}>×</button>
        </div>

        <div style={{padding:"4px 18px 26px"}}>

          {/* Formulaire édition / ajout */}
          {editIdx !== null ? (
            <div>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",margin:"4px 0 12px",fontFamily:DISP_F}}>
                {editIdx==="new" ? "Nouvelle entrée" : `Modifier l'entrée ${editIdx+1}`}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}>
                <div style={tileStyle("kg")}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:9,fontFamily:DISP_F}}>Charge</div>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:4,height:46}}>
                    <input type="number" inputMode="decimal" value={editKg} onChange={e=>setEditKg(e.target.value)}
                      onFocus={()=>setFocusField("kg")} onBlur={()=>setFocusField(null)} placeholder="80"
                      style={{width:"100%",background:"none",border:"none",color:"#F2F4F7",fontFamily:DISP_F,fontSize:42,fontWeight:800,letterSpacing:-2,textAlign:"center",outline:"none",padding:0,minWidth:0}}/>
                    <span style={{fontSize:14,color:"rgba(242,244,247,0.35)",fontWeight:600}}>kg</span>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:11}}>
                    <button onClick={()=>setEditKg(k=>String(Math.max(0,(parseFloat(k)||0)-2.5)))} style={btnStepper(C.s2,"rgba(242,244,247,0.60)")}>−</button>
                    <button onClick={()=>setEditKg(k=>String((parseFloat(k)||0)+2.5))} style={btnStepper("rgba(59,130,246,0.16)","#60A5FA")}>+</button>
                  </div>
                </div>
                <div style={tileStyle("reps")}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:9,fontFamily:DISP_F}}>Répétitions</div>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:4,height:46}}>
                    <input type="number" inputMode="numeric" value={editReps} onChange={e=>setEditReps(e.target.value)}
                      onFocus={()=>setFocusField("reps")} onBlur={()=>setFocusField(null)} placeholder="5"
                      style={{width:"100%",background:"none",border:"none",color:"#F2F4F7",fontFamily:DISP_F,fontSize:42,fontWeight:800,letterSpacing:-2,textAlign:"center",outline:"none",padding:0,minWidth:0}}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:11}}>
                    <button onClick={()=>setEditReps(r=>String(Math.max(1,(parseInt(r)||0)-1)))} style={btnStepper(C.s2,"rgba(242,244,247,0.60)")}>−</button>
                    <button onClick={()=>setEditReps(r=>String((parseInt(r)||0)+1))} style={btnStepper("rgba(59,130,246,0.16)","#60A5FA")}>+</button>
                  </div>
                </div>
              </div>

              {/* Reps rapides */}
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {[1,3,5,8,10,12].map(r=>{const on=editReps===String(r);return(
                  <button key={r} onClick={()=>setEditReps(String(r))} style={{flex:1,padding:"8px 0",borderRadius:10,background:on?"rgba(59,130,246,0.14)":C.s1,border:`1px solid ${on?"#3B82F6":C.bd}`,color:on?"#60A5FA":"rgba(242,244,247,0.60)",fontFamily:DISP_F,fontSize:13,fontWeight:600,cursor:"pointer"}}>{r}</button>
                );})}
              </div>

              {/* 1RM estimé */}
              <div style={{borderRadius:16,padding:"14px 16px",marginBottom:14,background:"linear-gradient(135deg,rgba(59,130,246,0.14),rgba(37,99,235,0.05))",border:"1px solid rgba(59,130,246,0.22)",display:"flex",alignItems:"center",justifyContent:"space-between",opacity:rm1Edit>0?1:0.45,transition:"opacity .25s"}}>
                <div>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",color:"#60A5FA",marginBottom:4,fontFamily:DISP_F}}>1RM estimé</div>
                  <div style={{fontSize:11,color:"rgba(242,244,247,0.55)",fontFamily:DISP_F}}>{rm1Edit>0?(parseInt(editReps)===1?"Ta charge max sur 1 rep":"Estimation Epley"):"Saisis charge et reps"}</div>
                </div>
                <div style={{fontFamily:SERIF_F,fontSize:36,color:"#fff",lineHeight:1}}>
                  {rm1Edit>0?rm1Edit:"—"}{rm1Edit>0&&<span style={{fontSize:13,color:"#60A5FA",fontFamily:DISP_F,fontWeight:700,marginLeft:3}}>kg</span>}
                </div>
              </div>

              <div style={{display:"flex",gap:9}}>
                <button onClick={cancelEdit} style={{flex:1,padding:"13px",borderRadius:14,border:`1px solid ${C.bd}`,background:"transparent",color:"rgba(242,244,247,0.45)",fontFamily:DISP_F,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuler</button>
                <button onClick={saveEdit} disabled={!editKg||!editReps} style={{flex:2,padding:"13px",borderRadius:14,border:"none",fontFamily:DISP_F,fontSize:14,fontWeight:700,cursor:(!editKg||!editReps)?"default":"pointer",background:(!editKg||!editReps)?C.s2:"linear-gradient(180deg,#3B82F6,#2563EB)",color:(!editKg||!editReps)?"rgba(242,244,247,0.30)":"#fff",boxShadow:(!editKg||!editReps)?"none":"0 8px 20px rgba(59,130,246,0.32)"}}>
                  {editIdx==="new" ? "Ajouter l'entrée" : "Sauvegarder"}
                </button>
              </div>
            </div>

          ) : (
            /* Liste des entrées */
            <div>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",margin:"4px 0 10px",fontFamily:DISP_F}}>Historique ({entries.length})</div>

              {entries.length===0 && (
                <div style={{textAlign:"center",padding:"18px 0",color:"rgba(242,244,247,0.35)",fontSize:12,fontFamily:DISP_F}}>Aucune entrée — ajoute ton premier record.</div>
              )}

              {entries.map((h,i)=>{
                const rm = calc1RM(parseFloat(h.poids), parseInt(h.reps));
                const isRecord = rm===exData.rm1;
                return (
                  <div key={i} style={{background:C.s1,border:`1px solid ${isRecord?"rgba(96,165,250,0.3)":C.bd}`,borderRadius:14,padding:"13px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1,cursor:"pointer",minWidth:0}} onClick={()=>openEdit(i)}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                        {isRecord&&<div style={{fontSize:9,fontWeight:700,color:"#FFAB5D",background:"rgba(255,171,93,0.12)",border:"1px solid rgba(255,171,93,0.3)",borderRadius:6,padding:"2px 6px",fontFamily:DISP_F}}>RECORD</div>}
                        <div style={{fontSize:14,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F}}>{h.poids} kg × {h.reps} rep{h.reps>1?"s":""}</div>
                      </div>
                      <div style={{fontSize:10,color:"rgba(242,244,247,0.40)",fontFamily:DISP_F}}>{h.date} · 1RM : <span style={{color:"#60A5FA",fontWeight:600}}>{rm} kg</span> · <span style={{color:"#60A5FA"}}>Appuie pour modifier</span></div>
                    </div>
                    <button onClick={()=>deleteEntry(i)} style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"7px 11px",color:"#F87171",cursor:"pointer",fontSize:11,fontFamily:DISP_F,fontWeight:600,flexShrink:0}}>Sup.</button>
                  </div>
                );
              })}

              <button onClick={openNew} style={{width:"100%",marginTop:4,padding:"15px",borderRadius:16,border:"none",fontFamily:DISP_F,fontSize:14,fontWeight:700,cursor:"pointer",background:"linear-gradient(180deg,#3B82F6,#2563EB)",color:"#fff",boxShadow:"0 8px 24px rgba(59,130,246,0.30)"}}>
                + Nouvelle entrée
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CARD RM PAR EXERCICE ─────────────────────────────────────────────────────
export function RMCard({ exData, objectif, C, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const target = OBJ_TARGET[objectif] || DEFAULT_TARGET;
  const cc = {principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[exData.cat||"principal"]||"#4D8BFF";
  const kgCible = calcKgFor(exData.rm1, target.reps);

  return (
    <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      {/* Ligne principale */}
      <div onClick={() => setExpanded(e => !e)} style={{padding:"12px 14px",cursor:"pointer",borderLeft:`3px solid ${cc}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:"#F5F1E8",marginBottom:3}}>{exData.nom}</div>
          <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>
            Record : <span style={{fontWeight:600,color:"#F5F1E8"}}>{exData.bestKg}kg × {exData.bestReps} reps</span>
            {"  ·  "}
            <span style={{color:cc,fontWeight:700}}>1RM ≈ {exData.rm1}kg</span>
          </div>
        </div>

        {/* Recommandation objectif */}
        <div style={{textAlign:"center",padding:"6px 10px",background:`${target.color}0d`,border:`0.5px solid ${target.color}30`,borderRadius:9,flexShrink:0,marginLeft:10}}>
          <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:18,fontWeight:300,color:target.color,lineHeight:1}}>{kgCible > 0 ? kgCible : "—"}<span style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontFamily:"'Inter',sans-serif",fontWeight:400}}>{kgCible>0?" kg":""}</span></div>
          <div style={{fontSize:8,color:target.color,fontWeight:600,marginTop:1}}>{target.l}</div>
          <div style={{fontSize:7,color:"rgba(245,241,232,0.50)"}}>{target.reps} reps</div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8,flexShrink:0}}>
          {onEdit && <button onClick={e=>{e.stopPropagation();onEdit(exData);}} style={{padding:"3px 8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#4D8BFF",cursor:"pointer",fontSize:10,fontWeight:600}}>✏️</button>}
          <div style={{color:"rgba(245,241,232,0.50)",fontSize:14,transition:"transform .15s",transform:expanded?"rotate(90deg)":"rotate(0)"}}>›</div>
        </div>
      </div>

      {/* Détail déplié */}
      {expanded && (
        <div style={{borderTop:"0.5px solid rgba(190,180,255,0.07)",padding:"12px 14px",background:"rgba(59,130,246,0.02)"}}>
          <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>Tableau de charges complet</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
            {Object.entries(OBJ_TARGET).map(([id, obj]) => {
              const kg = calcKgFor(exData.rm1, obj.reps);
              const isCurrentObj = id === objectif;
              return (
                <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:isCurrentObj?`${obj.color}10`:"#1C2440",border:`0.5px solid ${isCurrentObj?obj.color:"rgba(190,180,255,0.10)"}`,borderRadius:8}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:isCurrentObj?700:500,color:isCurrentObj?obj.color:"rgba(245,241,232,0.50)"}}>{obj.l}{isCurrentObj?" ★":""}</div>
                    <div style={{fontSize:8,color:"rgba(245,241,232,0.50)"}}>{obj.reps} reps · {obj.pct}%</div>
                  </div>
                  <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:14,fontWeight:400,color:isCurrentObj?obj.color:"rgba(245,241,232,0.50)"}}>{kg > 0 ? `${kg}kg` : "—"}</div>
                </div>
              );
            })}
          </div>

          {/* Historique 3 derniers sets */}
          {exData.historique && exData.historique.length > 0 && (
            <div style={{paddingTop:10,borderTop:"0.5px solid rgba(190,180,255,0.07)"}}>
              <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Historique récent</div>
              {exData.historique.slice(-3).reverse().map((h, i) => {
                const rm = calc1RM(parseFloat(h.poids), parseInt(h.reps));
                const isRecord = rm === exData.rm1;
                return (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>{h.date}</div>
                    <div style={{fontSize:11,fontWeight:500,color:"#F5F1E8"}}>{h.poids}kg × {h.reps} reps</div>
                    <div style={{fontSize:10,color:isRecord?"#FFAB5D":cc,fontWeight:isRecord?700:400}}>{isRecord?"🏆 ":""}{rm}kg 1RM</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TODAYVIEW ────────────────────────────────────────────────────────────────
