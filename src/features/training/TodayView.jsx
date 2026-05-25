import { useState, useMemo } from "react";
import { INT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Box, Lbl, Btn, Bar, Row } from "../../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";

// ─── FORMULE EPLEY ────────────────────────────────────────────────────────────
const calc1RM   = (kg, reps) => (!kg || !reps || reps < 1) ? 0 : Math.round(kg * (1 + reps / 30));
const calcKgFor = (rm1, reps) => Math.max(0, Math.round(rm1 * (1 - reps / 30) * 2) / 2);

// ─── CIBLE PAR OBJECTIF ───────────────────────────────────────────────────────
const OBJ_TARGET = {
  hypertrophie:    { reps:10, pct:75, l:"Hypertrophie",    color:"#4D8BFF", desc:"10 reps · Volume musculaire"      },
  force:           { reps:5,  pct:87, l:"Force",            color:"#FFAB5D", desc:"5 reps · Force maximale"          },
  poids:           { reps:15, pct:64, l:"Perte de poids",   color:"#5FE0A5", desc:"15 reps · Brûle des calories"     },
  sante:           { reps:12, pct:70, l:"Santé générale",   color:"#5FE0A5", desc:"12 reps · Maintien & tonicité"    },
  prep_physique:   { reps:8,  pct:80, l:"Prépa physique",   color:"#FFC857", desc:"8 reps · Puissance & condition"   },
  reathletisation: { reps:15, pct:64, l:"Réathlétisation",  color:"#06b6d4", desc:"15 reps · Progression douce"      },
};
const DEFAULT_TARGET = { reps:10, pct:75, l:"Hypertrophie", color:"#4D8BFF", desc:"10 reps · Volume musculaire" };

// ─── MODAL SAISIE MANUELLE ────────────────────────────────────────────────────
function ManualRMModal({ prog, setProg, onClose, push, C }) {
  const [search,   setSearch]   = useState("");
  const [groupe,   setGroupe]   = useState(null);
  const [selected, setSelected] = useState(null);
  const [kg,       setKg]       = useState("");
  const [reps,     setReps]     = useState("");

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

  return (
    <div style={{minHeight:"100vh",background:"#0B0F1F"}}>
      <div style={{paddingBottom:80}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 16px 14px"}}>
          <div>
            <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Nouveau record</div>
            <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:20,fontWeight:300,color:"#F5F1E8"}}>
              {selected ? selected.nom : "Saisie manuelle"}
            </div>
          </div>
          <button onClick={onClose} style={{background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,width:36,height:36,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:18}}>×</button>
        </div>

        <div style={{padding:"0 16px"}}>
          {!selected ? (
            <div>
              {/* Recherche */}
              <div style={{position:"relative",marginBottom:12}}>
                <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}}
                  placeholder="Rechercher un exercice…"
                  style={{width:"100%",padding:"10px 14px 10px 36px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,fontSize:13,color:"#F5F1E8",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}
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
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,marginBottom:6,cursor:"pointer"}}
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
              <button onClick={()=>{setSelected(null);setKg("");setReps("");}} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:12,fontWeight:600,padding:"0 0 14px",display:"flex",alignItems:"center",gap:4}}>← Changer d'exercice</button>

              {/* Badge exercice */}
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:`${cc(selected.cat)}0d`,border:`0.5px solid ${cc(selected.cat)}30`,borderRadius:12,marginBottom:16}}>
                <div style={{width:4,height:40,borderRadius:2,background:cc(selected.cat),flexShrink:0}}/>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:"#F5F1E8"}}>{selected.nom}</div>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginTop:2}}>{selected.group}</div>
                </div>
              </div>

              {/* Saisie */}
              <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div>
                    <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:5,letterSpacing:"0.5px"}}>CHARGE (kg)</div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <button onClick={()=>setKg(k=>String(Math.max(0,parseFloat(k)||0)-2.5))} style={{width:26,height:26,borderRadius:7,background:"#1C2440",border:"none",cursor:"pointer",fontSize:14,color:"rgba(245,241,232,0.50)",flexShrink:0}}>−</button>
                      <input type="number" value={kg} onChange={e=>setKg(e.target.value)} placeholder="80" autoFocus
                        style={{flex:1,padding:"6px 4px",background:"#1C2440",border:`1px solid ${kg?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:7,fontSize:14,fontWeight:500,color:"#F5F1E8",fontFamily:"'Inter',sans-serif",textAlign:"center",minWidth:0}}/>
                      <button onClick={()=>setKg(k=>String((parseFloat(k)||0)+2.5))} style={{width:26,height:26,borderRadius:7,background:"#4D8BFF",border:"none",cursor:"pointer",fontSize:14,color:"#141A2E",flexShrink:0}}>+</button>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:5,letterSpacing:"0.5px"}}>REPS</div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <button onClick={()=>setReps(r=>String(Math.max(1,parseInt(r)||0)-1))} style={{width:26,height:26,borderRadius:7,background:"#1C2440",border:"none",cursor:"pointer",fontSize:14,color:"rgba(245,241,232,0.50)",flexShrink:0}}>−</button>
                      <input type="number" value={reps} onChange={e=>setReps(e.target.value)} placeholder="5"
                        style={{flex:1,padding:"6px 4px",background:"#1C2440",border:`1px solid ${reps?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:7,fontSize:14,fontWeight:500,color:"#F5F1E8",fontFamily:"'Inter',sans-serif",textAlign:"center",minWidth:0}}/>
                      <button onClick={()=>setReps(r=>String((parseInt(r)||0)+1))} style={{width:26,height:26,borderRadius:7,background:"#4D8BFF",border:"none",cursor:"pointer",fontSize:14,color:"#141A2E",flexShrink:0}}>+</button>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {[1,3,5,8,10,12].map(r=>(
                    <button key={r} onClick={()=>setReps(String(r))} style={{flex:1,padding:"4px 2px",background:reps===String(r)?"rgba(59,130,246,0.1)":"transparent",border:`0.5px solid ${reps===String(r)?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:6,color:reps===String(r)?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:10,fontWeight:reps===String(r)?600:400}}>{r}</button>
                  ))}
                </div>
              </div>

              {rm1Calc > 0 && (
                <div style={{background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:16}}>
                  <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>1RM estimé (Epley)</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                    <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:36,fontWeight:300,color:"#4D8BFF",lineHeight:1}}>{rm1Calc}</div>
                    <div style={{fontSize:14,color:"rgba(245,241,232,0.50)"}}>kg</div>
                  </div>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginTop:3}}>= {kg}kg × (1 + {reps}/30)</div>
                </div>
              )}

              <button onClick={handleSave} disabled={!kg||!reps}
                style={{width:"100%",padding:"14px",background:(!kg||!reps)?"rgba(190,180,255,0.07)":"#4D8BFF",border:"none",borderRadius:12,color:"#141A2E",fontSize:14,fontWeight:600,cursor:(!kg||!reps)?"default":"pointer",fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",marginBottom:8}}>
                🏆 Enregistrer ce record
              </button>
              <button onClick={onClose} style={{width:"100%",padding:"10px",background:"transparent",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Annuler</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MINI MODAL CRÉATION SÉANCE DU JOUR ─────────────────────────────────────
function CreateSeanceModal({ prog, setProg, setCalSess, push, onClose, C }) {
  const [search,   setSearch]   = useState("");
  const [groupe,   setGroupe]   = useState(null);
  const [seNom,    setSeNom]    = useState("");
  const [intensite,setInt]      = useState("modere");
  const [exos,     setExos]     = useState([]);
  const [newExForm,setNewExForm]= useState(null);

  const cc = (cat) => ({principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[cat||"principal"]||"#4D8BFF");
  const INT_COLORS = {leger:"#5FE0A5",modere:"#4D8BFF",lourd:"#FFAB5D",intense:"#FF7A6B",mobilite:"#B69DFF"};
  const INT_LABELS = {leger:"Léger",modere:"Modéré",lourd:"Lourd",intense:"Intense",mobilite:"Mobilité"};

  const searchList = search
    ? Object.entries(EX).flatMap(([g,arr]) => arr.map(ex => ({nom:ex.n,cat:ex.cat,group:g})))
        .filter(e => e.nom.toLowerCase().includes(search.toLowerCase()))
    : groupe ? (EX[groupe]||[]).map(ex => ({nom:ex.n,cat:ex.cat,group:groupe})) : [];

  const addEx = (ex) => {
    if (exos.find(e=>e.nom===ex.nom)) return;
    setExos(prev => [...prev, {nom:ex.nom,cat:ex.cat,series:"4",reps:"10",repos:"90s"}]);
  };
  const removeEx = (nom) => setExos(prev => prev.filter(e=>e.nom!==nom));
  const updateExField = (i, field, val) => setExos(prev => prev.map((e,idx) => idx===i?{...e,[field]:val}:e));

  const handleSave = () => {
    const today    = new Date();
    const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const dayName  = dayNames[today.getDay()];
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const nomFinal = seNom || `Séance ${dayName}`;
    const intColor = {leger:"#5FE0A5",modere:"#4D8BFF",lourd:"#FFAB5D",intense:"#FF7A6B",mobilite:"#B69DFF"}[intensite]||"#4D8BFF";
    const seanceId = `today_${todayKey}`;

    // ── Uniquement dans le calendrier du jour (pas dans prog.jours = pas visible S1-S6) ──
    if (setCalSess) {
      setCalSess(prev => ({
        ...prev,
        [todayKey]: {
          nom:      nomFinal,
          intensite,
          color:    intColor,
          seanceId,
          exercices: exos.map(ex => ({...ex, historique:[], note:"", checked:false})),
          musculation: exos.length > 0 ? { exercices: exos } : undefined,
        },
      }));
    }

    push("✅", "Séance créée !", `${nomFinal} · ${exos.length} exercice${exos.length!==1?"s":""} · Ajoutée au calendrier`);
    onClose();
  };

  // Vue formulaire config d'un exercice sélectionné
  if (newExForm !== null) {
    const ex = exos[newExForm];
    return (
      <div style={{minHeight:"100vh",background:"#0B0F1F"}}>
        <div style={{padding:"20px 16px",paddingBottom:80}}>
          <button onClick={()=>setNewExForm(null)} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:16}}>← Retour</button>
          <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:16,fontWeight:400,marginBottom:12}}>{ex?.nom}</div>
          <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"14px",marginBottom:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"}].map(pp=>(
                <div key={pp.k}>
                  <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:5}}>{pp.l}</div>
                  <input value={ex?.[pp.k]||""} onChange={e=>updateExField(newExForm,pp.k,e.target.value)}
                    style={{width:"100%",padding:"8px",background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:13,textAlign:"center",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>setNewExForm(null)} style={{width:"100%",padding:"12px",background:"#4D8BFF",border:"none",borderRadius:10,color:"#141A2E",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif"}}>✓ Valider</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#0B0F1F"}}>
      <div style={{padding:"20px 16px",paddingBottom:80}}>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:16}}>← Retour</button>
        <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:20,fontWeight:300,color:"#F5F1E8",marginBottom:16}}>Créer une séance</div>

        {/* Nom */}
        <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
          <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:6,letterSpacing:"0.5px"}}>NOM DE LA SÉANCE</div>
          <input value={seNom} onChange={e=>setSeNom(e.target.value)} placeholder="Ex: Push, Dos & Biceps…"
            style={{width:"100%",padding:"8px 10px",background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:13,color:"#F5F1E8",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
        </div>

        {/* Intensité */}
        <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
          <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:8,letterSpacing:"0.5px"}}>INTENSITÉ</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {Object.entries(INT_LABELS).map(([k,l])=>(
              <button key={k} onClick={()=>setInt(k)} style={{padding:"5px 11px",background:intensite===k?`${INT_COLORS[k]}15`:"transparent",border:`1px solid ${intensite===k?INT_COLORS[k]:"rgba(190,180,255,0.07)"}`,borderRadius:16,color:intensite===k?INT_COLORS[k]:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:11,fontWeight:intensite===k?600:400,fontFamily:"'Inter',sans-serif"}}>{l}</button>
            ))}
          </div>
        </div>

        {/* Exercices ajoutés */}
        {exos.length > 0 && (
          <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
            <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:8,letterSpacing:"0.5px"}}>EXERCICES ({exos.length})</div>
            {exos.map((ex,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<exos.length-1?"0.5px solid #1C2440":"none"}}>
                <div style={{width:3,height:28,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
                <div style={{flex:1}} onClick={()=>setNewExForm(i)}>
                  <div style={{fontSize:12,fontWeight:500,color:"#F5F1E8",cursor:"pointer"}}>{ex.nom}</div>
                  <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>{ex.series}×{ex.reps} · {ex.repos} <span style={{color:"#4D8BFF",fontSize:9}}>✏️ Modifier</span></div>
                </div>
                <button onClick={()=>removeEx(ex.nom)} style={{background:"transparent",border:"none",color:"#FF7A6B",cursor:"pointer",fontSize:16,padding:"0 2px",flexShrink:0}}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Bibliothèque */}
        <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"10px 14px",borderBottom:"0.5px solid rgba(190,180,255,0.07)"}}>
            <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:7,letterSpacing:"0.5px"}}>AJOUTER DES EXERCICES</div>
            <div style={{position:"relative"}}>
              <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}} placeholder="Rechercher…"
                style={{width:"100%",padding:"7px 10px 7px 28px",background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:12,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
              <div style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(245,241,232,0.50)"}}>🔍</div>
            </div>
          </div>
          {!search && (
            <div style={{padding:"8px 10px",display:"flex",flexWrap:"wrap",gap:5,maxHeight:110,overflowY:"auto"}}>
              {Object.keys(EX).map(g=>(
                <button key={g} onClick={()=>setGroupe(g===groupe?null:g)}
                  style={{padding:"4px 10px",background:groupe===g?"rgba(59,130,246,0.1)":"#1C2440",border:`1px solid ${groupe===g?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:14,color:groupe===g?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:10,fontWeight:groupe===g?600:400,fontFamily:"'Inter',sans-serif"}}>
                  {g} <span style={{fontSize:9,color:"rgba(245,241,232,0.50)"}}>({(EX[g]||[]).length})</span>
                </button>
              ))}
            </div>
          )}
          {searchList.length > 0 && (
            <div style={{maxHeight:180,overflowY:"auto",padding:"4px 10px"}}>
              {searchList.map((ex,i)=>{
                const already = !!exos.find(e=>e.nom===ex.nom);
                return (
                  <div key={i} onClick={()=>!already&&addEx(ex)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"7px 6px",borderRadius:8,cursor:already?"default":"pointer",opacity:already?0.45:1,marginBottom:1}}
                    onMouseEnter={ev=>{if(!already)ev.currentTarget.style.background="#1C2440";}}
                    onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                    <div style={{width:3,height:24,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
                    <div style={{flex:1,fontSize:12,color:"#F5F1E8"}}>{ex.nom}{search&&<span style={{fontSize:9,color:"rgba(245,241,232,0.50)",marginLeft:5}}>{ex.group}</span>}</div>
                    <div style={{fontSize:10,fontWeight:600,color:already?"#5FE0A5":"#4D8BFF"}}>{already?"✓":"+ Ajouter"}</div>
                  </div>
                );
              })}
            </div>
          )}
          {!search && !groupe && <div style={{padding:"14px",textAlign:"center",fontSize:11,color:"rgba(245,241,232,0.50)"}}>Sélectionne un groupe ou recherche</div>}
        </div>

        <button onClick={handleSave} style={{width:"100%",padding:"13px",background:"#4D8BFF",border:"none",borderRadius:12,color:"#141A2E",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",marginBottom:8}}>
          ✓ Créer la séance
        </button>
        <button onClick={onClose} style={{width:"100%",padding:"10px",background:"transparent",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Annuler</button>
      </div>
    </div>
  );
}

// ─── MODAL MODIFIER RECORD ───────────────────────────────────────────────────
function EditRecordModal({ exData, prog, setProg, push, onClose }) {
  const [entries, setEntries] = useState(
    (exData.historique || []).map((h,i) => ({...h, idx:i}))
  );
  const [adding, setAdding] = useState(false);
  const [newKg,  setNewKg]  = useState("");
  const [newReps,setNewReps]= useState("");

  const calc1RMLocal = (kg, reps) => (!kg||!reps) ? 0 : Math.round(kg*(1+reps/30));

  const saveAll = (updatedEntries) => {
    const u = JSON.parse(JSON.stringify(prog));
    // Chercher dans prog.jours
    let found = false;
    u.jours.forEach(jour => {
      (jour.exercices||[]).forEach(ex => {
        if (ex.nom === exData.nom) {
          ex.historique = updatedEntries.map(({idx,...h})=>h);
          found = true;
        }
      });
    });
    // Sinon dans prog.records
    if (!found && u.records?.[exData.nom]) {
      u.records[exData.nom] = updatedEntries.map(({idx,...h})=>h);
    }
    setProg(u);
  };

  const deleteEntry = (i) => {
    const next = entries.filter((_,j)=>j!==i);
    setEntries(next);
    saveAll(next);
    push("🗑️","Record supprimé","Entrée retirée de l'historique.");
  };

  const addEntry = () => {
    if (!newKg) return;
    const entry = { poids:parseFloat(newKg), reps:parseInt(newReps)||1, date:new Date().toLocaleDateString("fr-FR") };
    const next = [...entries, {...entry, idx:entries.length}];
    setEntries(next);
    saveAll(next);
    setAdding(false); setNewKg(""); setNewReps("");
    push("✅","Record mis à jour",`${exData.nom} · ${newKg}kg × ${newReps||1} reps`);
  };

  return (
    <div style={{minHeight:"100vh",background:"#0B0F1F"}}>
      <div style={{padding:"20px 16px",paddingBottom:80}}>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:16}}>← Retour</button>
        <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:18,fontWeight:300,color:"#F5F1E8",marginBottom:4}}>{exData.nom}</div>
        <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",marginBottom:16}}>1RM actuel : <span style={{color:"#4D8BFF",fontWeight:700}}>{exData.rm1} kg</span></div>

        {/* Liste historique */}
        {entries.length === 0 && <div style={{textAlign:"center",padding:"20px",color:"rgba(245,241,232,0.50)",fontSize:12}}>Aucune entrée enregistrée.</div>}
        {entries.map((h,i) => {
          const rm = calc1RMLocal(parseFloat(h.poids), parseInt(h.reps));
          return (
            <div key={i} style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,padding:"11px 14px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:"#F5F1E8"}}>{h.poids}kg × {h.reps} reps</div>
                <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginTop:2}}>{h.date} · 1RM≈{rm}kg</div>
              </div>
              <button onClick={()=>deleteEntry(i)} style={{background:"rgba(248,113,113,0.08)",border:"0.5px solid rgba(248,113,113,0.25)",borderRadius:8,padding:"5px 10px",color:"#FF7A6B",cursor:"pointer",fontSize:11,fontFamily:"'Inter',sans-serif"}}>Supprimer</button>
            </div>
          );
        })}

        {/* Ajouter nouvelle entrée */}
        {adding ? (
          <div style={{background:"#141A2E",border:"0.5px solid #4D8BFF",borderRadius:12,padding:"14px",marginTop:8}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div>
                <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:5}}>CHARGE (kg)</div>
                <input type="number" value={newKg} onChange={e=>setNewKg(e.target.value)} placeholder="ex: 100" autoFocus
                  style={{width:"100%",padding:"8px",background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:14,textAlign:"center",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:600,marginBottom:5}}>REPS</div>
                <input type="number" value={newReps} onChange={e=>setNewReps(e.target.value)} placeholder="ex: 3"
                  style={{width:"100%",padding:"8px",background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:14,textAlign:"center",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
              </div>
            </div>
            {newKg && newReps && (
              <div style={{textAlign:"center",fontSize:11,color:"#4D8BFF",marginBottom:8,fontWeight:600}}>1RM estimé : {calc1RMLocal(parseFloat(newKg),parseInt(newReps))} kg</div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setAdding(false);setNewKg("");setNewReps("");}} style={{flex:1,padding:"10px",background:"#1C2440",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,color:"rgba(245,241,232,0.50)",fontFamily:"'Inter',sans-serif"}}>Annuler</button>
              <button onClick={addEntry} disabled={!newKg} style={{flex:2,padding:"10px",background:newKg?"#4D8BFF":"rgba(190,180,255,0.07)",border:"none",borderRadius:9,cursor:newKg?"pointer":"default",color:"#141A2E",fontSize:12,fontWeight:600,fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif"}}>+ Ajouter</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setAdding(true)} style={{width:"100%",marginTop:8,padding:"11px",background:"transparent",border:"1px dashed #4D8BFF",borderRadius:10,color:"#4D8BFF",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            + Ajouter un set
          </button>
        )}
      </div>
    </div>
  );
}

// ─── CARD RM PAR EXERCICE ─────────────────────────────────────────────────────
function RMCard({ exData, objectif, C, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const target = OBJ_TARGET[objectif] || DEFAULT_TARGET;
  const cc = {principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[exData.cat||"principal"]||"#4D8BFF";
  const kgCible = calcKgFor(exData.rm1, target.reps);

  return (
    <div style={{background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
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
          <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:18,fontWeight:300,color:target.color,lineHeight:1}}>{kgCible > 0 ? kgCible : "—"}<span style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontFamily:"'Inter',sans-serif",fontWeight:400}}>{kgCible>0?" kg":""}</span></div>
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
                <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:isCurrentObj?`${obj.color}10`:"#1C2440",border:`0.5px solid ${isCurrentObj?obj.color:"#e2e8f0"}`,borderRadius:8}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:isCurrentObj?700:500,color:isCurrentObj?obj.color:"rgba(245,241,232,0.50)"}}>{obj.l}{isCurrentObj?" ★":""}</div>
                    <div style={{fontSize:8,color:"rgba(245,241,232,0.50)"}}>{obj.reps} reps · {obj.pct}%</div>
                  </div>
                  <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:14,fontWeight:400,color:isCurrentObj?obj.color:"rgba(245,241,232,0.50)"}}>{kg > 0 ? `${kg}kg` : "—"}</div>
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
export default function TodayView(props) {
  const {
    prog, setProg, premium, setPaywall, push,
    checkedEx, setCheckedEx,
    calSess, setCalSess,
    profil,
    C, INT, setProgView, setTab,
    setChrono, setChronoSec,
    exDetails, setExDetails, exEdit, setExEdit,
  } = props;

  const [viewSeance,      setViewSeance]      = useState(null);
  const [showManualRM,    setShowManualRM]    = useState(false);
  const [showCreateSeance,setShowCreateSeance]= useState(false);
  const [editRecord,      setEditRecord]      = useState(null); // exData à éditer
  const rmFilter = "all";

  const objectif = profil?.objectif || "hypertrophie";

  // ── Séance du jour ──
  const getTodaySeance = () => {
    const today    = new Date();
    const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const todayName = dayNames[today.getDay()];

    // 1. Chercher dans calSess (séance créée depuis "Aujourd'hui")
    const calSeance = calSess?.[todayKey];
    if (calSeance?.exercices?.length > 0) {
      return {
        id:        calSeance.seanceId || `today_${todayKey}`,
        nom:       calSeance.nom,
        focus:     todayName,
        duree:     "aujourd'hui",
        intensite: calSeance.intensite || "modere",
        exercices: calSeance.exercices,
        complete:  false,
        _fromCal:  true,
        _calKey:   todayKey,
      };
    }

    // 2. Sinon chercher dans le programme actif
    if (!prog) return null;
    return prog.jours.find(j =>
      j.nom?.toLowerCase().includes(todayName.toLowerCase()) ||
      j.focus?.toLowerCase().includes(todayName.toLowerCase())
    ) || null;
  };

  const toggleCheck = (seanceId, exIdx, repos, calKey) => {
    const key = `${seanceId}-${exIdx}`;
    const wasChecked = checkedEx[key];
    setCheckedEx(prev => ({...prev,[key]:!prev[key]}));
    if (!wasChecked && repos) {
      const sec = parseInt((repos||"90s").replace(/[^0-9]/g,"")) || 90;
      setChronoSec(sec);
      setChrono(true);
    }
    // Persister dans calSess si la séance vient du calendrier
    if (calKey && setCalSess) {
      setCalSess(prev => {
        if (!prev[calKey]) return prev;
        const exos = [...(prev[calKey].exercices || [])];
        if (exos[exIdx]) exos[exIdx] = {...exos[exIdx], checked: !wasChecked};
        return {...prev, [calKey]: {...prev[calKey], exercices: exos}};
      });
    }
  };

  // ── Données RM ──
  const rmData = useMemo(() => {
    if (!prog) return [];
    const todaySeance = getTodaySeance();
    const jours = rmFilter === "today" && todaySeance ? [todaySeance] : prog.jours;
    const map = {};
    jours.forEach(jour => {
      (jour.exercices || []).forEach(ex => {
        if (!ex.historique || ex.historique.length === 0) return;
        const best = ex.historique.reduce((b, h) => {
          const rm  = calc1RM(parseFloat(h.poids)||0, parseInt(h.reps)||1);
          const brm = calc1RM(parseFloat(b.poids)||0, parseInt(b.reps)||1);
          return rm > brm ? h : b;
        }, ex.historique[0]);
        const rm1 = calc1RM(parseFloat(best.poids)||0, parseInt(best.reps)||1);
        if (!map[ex.nom] || rm1 > map[ex.nom].rm1) {
          map[ex.nom] = { nom:ex.nom, cat:ex.cat, rm1, bestKg:parseFloat(best.poids)||0, bestReps:parseInt(best.reps)||0, historique:ex.historique };
        }
      });
    });
    // Lire aussi prog.records (exercices saisis hors programme)
    if (prog.records) {
      Object.entries(prog.records).forEach(([nom, history]) => {
        if (!history || history.length === 0) return;
        const best = history.reduce((b, h) => {
          const rm  = calc1RM(parseFloat(h.poids)||0, parseInt(h.reps)||1);
          const brm = calc1RM(parseFloat(b.poids)||0, parseInt(b.reps)||1);
          return rm > brm ? h : b;
        }, history[0]);
        const rm1 = calc1RM(parseFloat(best.poids)||0, parseInt(best.reps)||1);
        if (!map[nom] || rm1 > map[nom].rm1) {
          map[nom] = { nom, cat: best.cat || "principal", rm1, bestKg: parseFloat(best.poids)||0, bestReps: parseInt(best.reps)||0, historique: history };
        }
      });
    }
    return Object.values(map).sort((a,b) => b.rm1 - a.rm1);
  }, [prog, rmFilter]);

  const todaySeance = getTodaySeance();
  const currentTarget = OBJ_TARGET[objectif] || DEFAULT_TARGET;

  // ── Early returns après les hooks ──
  if (editRecord) {
    return (
      <EditRecordModal
        exData={editRecord}
        prog={prog} setProg={setProg}
        push={push}
        onClose={() => setEditRecord(null)}
      />
    );
  }

  if (showCreateSeance) {
    return (
      <CreateSeanceModal
        prog={prog} setProg={setProg}
        setCalSess={setCalSess}
        push={push} C={C}
        onClose={() => setShowCreateSeance(false)}
      />
    );
  }

  if (showManualRM) {
    return (
      <ManualRMModal
        prog={prog} setProg={setProg}
        push={push} C={C}
        onClose={() => setShowManualRM(false)}
      />
    );
  }

  if (viewSeance) {
    return (
      <SeanceDetail
        seance={viewSeance} onBack={() => setViewSeance(null)}
        prog={prog} setProg={setProg}
        checkedEx={checkedEx}
        toggleCheck={(id, idx, repos) => toggleCheck(id, idx, repos, viewSeance._calKey)}
        exDetails={exDetails} setExDetails={setExDetails}
        exEdit={exEdit} setExEdit={setExEdit}
        setChrono={setChrono} push={push}
      />
    );
  }

  return (
    <div style={{padding:"0 15px"}}>

      {/* ── Séance du jour ── */}
      {todaySeance ? (
        <div>
          <Lbl>Séance du jour</Lbl>
          <Box style={{borderLeft:`3px solid ${INT[todaySeance.intensite||"modere"].c}`,padding:0,overflow:"hidden"}}>
            <div onClick={() => setViewSeance(todaySeance)} style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:9,color:INT[todaySeance.intensite||"modere"].c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{INT[todaySeance.intensite||"modere"].l}</div>
                <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:16,fontWeight:400,color:"#F5F1E8"}}>{todaySeance.nom}</div>
                <div style={{fontSize:11,color:"rgba(245,241,232,0.50)"}}>{todaySeance.focus} · {todaySeance.duree}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {(() => {
                  const total = todaySeance.exercices?.length || 0;
                  const done  = todaySeance.exercices?.filter((_,i) => checkedEx[`${todaySeance.id}-${i}`]).length || 0;
                  const pct   = total > 0 ? Math.round(done/total*100) : 0;
                  return <>
                    <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:20,fontWeight:300,color:pct===100?"#5FE0A5":"#4D8BFF",lineHeight:1}}>{pct}%</div>
                    <div style={{fontSize:9,color:"rgba(245,241,232,0.50)"}}>{done}/{total}</div>
                  </>;
                })()}
              </div>
            </div>
            {!todaySeance.complete && (
              <div style={{borderTop:"0.5px solid rgba(190,180,255,0.07)",padding:"8px 14px 10px"}}>
                {(todaySeance.exercices||[]).map((ex,idx) => {
                  const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                  const cc = {principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[ex.cat||"principal"]||"#4D8BFF";
                  return (
                    <div key={idx} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:idx<todaySeance.exercices.length-1?"0.5px solid #1C2440":"none",opacity:isChecked?0.5:1}}>
                      <div onClick={() => toggleCheck(todaySeance.id,idx,ex.repos,todaySeance._calKey)} style={{width:16,height:16,borderRadius:4,background:isChecked?"#5FE0A5":"transparent",border:`1.5px solid ${isChecked?"#5FE0A5":"rgba(190,180,255,0.07)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,color:"#141A2E"}}>{isChecked?"✓":""}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:500,color:isChecked?"rgba(245,241,232,0.50)":"#F5F1E8",textDecoration:isChecked?"line-through":"none"}}>{ex.nom}</div>
                        <div style={{fontSize:9,color:"rgba(245,241,232,0.50)"}}>{ex.series}×{ex.reps} · {ex.repos}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
                      </div>
                      <div style={{width:3,height:20,borderRadius:2,background:cc,flexShrink:0}}/>
                    </div>
                  );
                })}
                <button onClick={() => setViewSeance(todaySeance)} style={{width:"100%",marginTop:8,padding:"8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.15)",borderRadius:8,color:"#4D8BFF",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>
                  Démarrer la séance →
                </button>
              </div>
            )}
            {todaySeance.complete && <div style={{padding:"8px 14px 10px",fontSize:11,color:"#5FE0A5",fontWeight:600}}>✓ Complétée le {todaySeance.date}</div>}
          </Box>
        </div>
      ) : (
        <Box style={{textAlign:"center",padding:"20px 16px"}}>
          <div style={{fontSize:32,marginBottom:8}}>😴</div>
          <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:15,fontWeight:500,marginBottom:4}}>Jour de repos</div>
          <div style={{fontSize:12,color:"rgba(245,241,232,0.50)",lineHeight:1.5,marginBottom:14}}>Tes records sont disponibles ci-dessous.</div>
          <button onClick={() => setShowCreateSeance(true)}
            style={{width:"100%",padding:"11px 16px",background:"rgba(59,130,246,0.06)",border:"1px dashed rgba(59,130,246,0.3)",borderRadius:10,color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:15}}>+</span> Créer une séance aujourd'hui
          </button>
        </Box>
      )}

      {/* ── Records & Objectifs ── */}
      {prog && (
        <div style={{marginTop:16}}>

          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:16,fontWeight:400,color:"#F5F1E8",letterSpacing:-0.3}}>Records & Objectifs</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:currentTarget.color}}/>
                <div style={{fontSize:10,color:currentTarget.color,fontWeight:600}}>{currentTarget.l} · {currentTarget.reps} reps</div>
                <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>· {currentTarget.pct}% 1RM</div>
              </div>
            </div>
          </div>

          {/* Liste */}
          {rmData.length === 0 ? (
            <Box style={{textAlign:"center",padding:"24px 16px"}}>
              <div style={{fontSize:28,marginBottom:8}}>📊</div>
              <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:14,fontWeight:400,marginBottom:6}}>Pas encore de données</div>
              <div style={{fontSize:11,color:"rgba(245,241,232,0.50)",lineHeight:1.6,marginBottom:16}}>
                Enregistre tes charges pendant les séances pour voir apparaître tes records et les charges cibles pour ton objectif <span style={{color:currentTarget.color,fontWeight:600}}>{currentTarget.l}</span>.
              </div>
              <button onClick={() => setShowManualRM(true)} style={{width:"100%",padding:"12px 16px",background:"rgba(59,130,246,0.06)",border:"1px dashed rgba(59,130,246,0.3)",borderRadius:10,color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontSize:16}}>🏆</span> Saisir un record manuellement
              </button>
            </Box>
          ) : (
            <div>
              {rmData.map((ex,i) => <RMCard key={i} exData={ex} objectif={objectif} C={C} onEdit={setEditRecord}/>)}
              <button onClick={() => setShowManualRM(true)} style={{width:"100%",padding:"11px",marginTop:4,background:"transparent",border:"0.5px dashed rgba(190,180,255,0.07)",borderRadius:10,color:"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span>🏆</span> Ajouter un record
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Pas de programme ── */}
      {!prog && (
        <Box style={{textAlign:"center",padding:"20px 16px",marginTop:8}}>
          <div style={{fontSize:12,color:"rgba(245,241,232,0.50)",marginBottom:12}}>Aucun programme actif</div>
          <Btn onClick={() => { if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Générer mon programme</Btn>
          <Btn v="out" onClick={() => setProgView("creer")}>Créer manuellement</Btn>
        </Box>
      )}


    </div>
  );
}
