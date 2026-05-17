import { useState } from "react";
import { INT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Box, Lbl, Btn, Row } from "../../components/ui/index.jsx";
import Calendar from "./Calendar.jsx";
import TodayView from "./TodayView.jsx";
import Creer from "./Creer.jsx";
import AnalyseIA from "../ai/AnalyseIA.jsx";

// ─── HELPER : chercher un exercice dans la BDD ──────────────────────────────
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

// ─── GUIDE MODAL exercice (Tips / Variantes / Erreurs / Morpho) ──────────────
function GuideExModal({ exData, exSerie, onClose, C }) {
  const [tab, setTab] = useState("tips");
  const cc = {principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6",mobilite:"#06b6d4"}[exData.cat] || "#3b82f6";
  return (
    <div style={{minHeight:"100vh",background:"#e4eef8"}}>
      <div style={{paddingBottom:80}}>
        <div style={{padding:"20px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"inline-block",padding:"3px 10px",background:`${cc}14`,border:`0.5px solid ${cc}40`,borderRadius:8,fontSize:10,color:cc,letterSpacing:"1px",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>{exData.cat}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:400,lineHeight:1.2,color:"#0f1a2e",marginBottom:4}}>{exData.n}</div>
          </div>
          <button onClick={onClose} style={{background:"#edf3fb",border:"0.5px solid #dce8f4",borderRadius:10,width:36,height:36,color:"#64748b",cursor:"pointer",fontSize:18,flexShrink:0,marginLeft:12}}>×</button>
        </div>
        <div style={{padding:"12px 16px",display:"flex",gap:7,flexWrap:"wrap"}}>
          {[{l:"Séries",v:exSerie?.series||exData.s},{l:"Reps",v:exSerie?.reps||exData.r},{l:"Repos",v:exSerie?.repos||exData.rest},{l:"Charge",v:exSerie?.charge||exData.ch}].map(s=>(
            <div key={s.l} style={{padding:"8px 10px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10,textAlign:"center",flex:1,minWidth:60}}>
              <div style={{fontSize:14,fontWeight:400,color:"#3b82f6",fontFamily:"'Syne',sans-serif"}}>{s.v||"—"}</div>
              <div style={{fontSize:9,color:"#64748b",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"0 16px",display:"flex",gap:6,marginBottom:14}}>
          {[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"6px 13px",background:tab===t.id?"rgba(59,130,246,0.08)":"transparent",border:`0.5px solid ${tab===t.id?"#3b82f6":"#dce8f4"}`,borderRadius:20,color:tab===t.id?"#3b82f6":"#64748b",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>{t.l}</button>
          ))}
        </div>
        <div style={{padding:"0 16px"}}>
          {tab==="tips"&&(<div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Conseils techniques</div>
            {(exData.tips||[]).map((tip,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(exData.tips||[]).length-1?"0.5px solid #dce8f4":"none"}}><div style={{width:22,height:22,borderRadius:"50%",background:"rgba(59,130,246,0.1)",border:"0.5px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#3b82f6"}}>{i+1}</div><div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.6}}>{tip}</div></div>))}
            {exData.prog&&<div style={{marginTop:4,padding:"10px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:9}}><div style={{fontSize:10,color:"#22c55e",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>Progression</div><div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{exData.prog}</div></div>}
          </div>)}
          {tab==="variantes"&&(<div>{(exData.variantes||[]).map((v,i)=>(<div key={i} style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"14px 16px",marginBottom:8}}><div style={{fontSize:13,fontWeight:500,color:"#0f1a2e",marginBottom:5}}>{v.nom||v}</div>{v.note&&<div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{v.note}</div>}</div>))}</div>)}
          {tab==="erreurs"&&(<div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Erreurs à éviter</div>
            {(exData.erreurs||[]).map((e,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}><div style={{width:20,height:20,borderRadius:"50%",background:"rgba(248,113,113,0.1)",border:"0.5px solid rgba(248,113,113,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#f87171"}}>✕</div><div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.5}}>{e}</div></div>))}
          </div>)}
          {tab==="morpho"&&(<div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Adaptation morphologique</div>
            {(exData.morpho||"").split("\n").filter(Boolean).map((line,i,arr)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:10,paddingBottom:10,borderBottom:i<arr.length-1?"0.5px solid #dce8f4":"none",alignItems:"flex-start"}}><div style={{fontSize:13,flexShrink:0,marginTop:1}}>{line.split(":")[0].trim()}</div><div style={{fontSize:11.5,color:"#0f1a2e",lineHeight:1.6,flex:1}}>{line.split(":").slice(1).join(":").trim()}</div></div>))}
            {!(exData.morpho||"").includes("\n")&&exData.morpho&&<div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.7}}>{exData.morpho}</div>}
          </div>)}
        </div>
        <div style={{padding:"14px 16px 0"}}>
          <button onClick={onClose} style={{width:"100%",padding:"11px",background:"transparent",border:"0.5px solid #dce8f4",borderRadius:10,color:"#64748b",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif"}}>← Retour à la séance</button>
        </div>
      </div>
    </div>
  );
}

// ─── SÉANCE DETAIL (vue exercices d'une séance depuis Programme) ─────────────
function SeanceDetailModal({ jour, jourIdx, prog, setProg, onClose, C, INT }) {
  const [editEx,    setEditEx]    = useState({});
  const [guideEx,   setGuideEx]   = useState(null);
  const [showBiblio,setShowBiblio]= useState(false);
  const [search,    setSearch]    = useState("");
  const [groupe,    setGroupe]    = useState(null);
  const [newExForm, setNewExForm] = useState(null); // exercice en cours d'ajout

  const METHODS = ["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif","Pré-fatigue","Wave loading"];
  const cc = (cat) => ({principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6"}[cat||"principal"]||"#3b82f6");

  const updateEx = (exIdx, field, val) => {
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices[exIdx][field] = val;
    setProg(u);
  };
  const deleteEx = (exIdx) => {
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices.splice(exIdx, 1);
    setProg(u);
  };
  const addEx = () => {
    if (!newExForm?.nom) return;
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices = u.jours[jourIdx].exercices || [];
    u.jours[jourIdx].exercices.push({
      nom: newExForm.nom,
      cat: newExForm.cat || "principal",
      series: newExForm.series || "4",
      reps:   newExForm.reps   || "10",
      repos:  newExForm.repos  || "90s",
      charge: newExForm.charge || "",
      methode:"Classique",
      historique: [],
    });
    setProg(u);
    setNewExForm(null);
    setShowBiblio(false);
    setSearch("");
    setGroupe(null);
  };

  // Exercices à afficher dans la biblio
  const exosList = search
    ? Object.entries(EX).flatMap(([g,arr]) => arr.map(ex => ({nom:ex.n,cat:ex.cat,group:g,raw:ex})))
        .filter(e => e.nom.toLowerCase().includes(search.toLowerCase()))
    : groupe ? (EX[groupe]||[]).map(ex => ({nom:ex.n,cat:ex.cat,group:groupe,raw:ex})) : [];

  if (guideEx) {
    return <GuideExModal exData={guideEx.dbEx} exSerie={guideEx.serieEx} onClose={() => setGuideEx(null)} C={C} />;
  }

  const int = INT[jour.intensite || "modere"];
  const exercices = prog.jours[jourIdx]?.exercices || [];

  // ── Vue formulaire ajout exercice ──
  if (newExForm) {
    return (
      <div style={{minHeight:"100vh",background:"#e4eef8"}}>
        <div style={{padding:"20px 16px",paddingBottom:80}}>
          <button onClick={()=>setNewExForm(null)} style={{background:"transparent",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:16}}>← Retour à la bibliothèque</button>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:`${cc(newExForm.cat)}0d`,border:`0.5px solid ${cc(newExForm.cat)}30`,borderRadius:12,marginBottom:16}}>
            <div style={{width:4,height:40,borderRadius:2,background:cc(newExForm.cat),flexShrink:0}}/>
            <div>
              <div style={{fontSize:14,fontWeight:500,color:"#0f1a2e"}}>{newExForm.nom}</div>
              <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{newExForm.group}</div>
            </div>
          </div>
          <div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"16px",marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {[{l:"Séries",k:"series",def:"4"},{l:"Reps",k:"reps",def:"10"},{l:"Repos",k:"repos",def:"90s"},{l:"Charge",k:"charge",def:""}].map(pp=>(
                <div key={pp.k}>
                  <div style={{fontSize:10,color:"#64748b",fontWeight:600,marginBottom:6}}>{pp.l}</div>
                  <input value={newExForm[pp.k]||""} onChange={e=>setNewExForm(f=>({...f,[pp.k]:e.target.value}))} placeholder={pp.def}
                    style={{width:"100%",padding:"9px 10px",background:"#f8fafc",border:"0.5px solid #dce8f4",borderRadius:8,fontSize:13,color:"#0f1a2e",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:10,color:"#64748b",fontWeight:600,marginBottom:6}}>MÉTHODE</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {METHODS.slice(0,6).map(mm=>(
                  <button key={mm} onClick={()=>setNewExForm(f=>({...f,methode:mm}))} style={{padding:"4px 10px",borderRadius:12,border:`1px solid ${newExForm.methode===mm?"#3b82f6":"#dce8f4"}`,background:newExForm.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:newExForm.methode===mm?"#3b82f6":"#64748b",cursor:"pointer",fontSize:10,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={addEx} style={{width:"100%",padding:"13px",background:"#3b82f6",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Syne',sans-serif",marginBottom:8}}>
            + Ajouter à la séance
          </button>
          <button onClick={()=>setNewExForm(null)} style={{width:"100%",padding:"10px",background:"transparent",border:"0.5px solid #dce8f4",borderRadius:10,color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Annuler</button>
        </div>
      </div>
    );
  }

  // ── Vue bibliothèque ──
  if (showBiblio) {
    return (
      <div style={{minHeight:"100vh",background:"#e4eef8"}}>
        <div style={{padding:"20px 16px",paddingBottom:80}}>
          <button onClick={()=>{setShowBiblio(false);setSearch("");setGroupe(null);}} style={{background:"transparent",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:16}}>← Retour à la séance</button>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:300,color:"#0f1a2e",marginBottom:14}}>Ajouter un exercice</div>

          {/* Recherche */}
          <div style={{position:"relative",marginBottom:12}}>
            <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}} placeholder="Rechercher…"
              style={{width:"100%",padding:"10px 14px 10px 36px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,fontSize:13,color:"#0f1a2e",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
            <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#94a3b8"}}>🔍</div>
          </div>

          {/* Groupes musculaires */}
          {!search && (
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {Object.keys(EX).map(g => (
                <button key={g} onClick={()=>setGroupe(g===groupe?null:g)}
                  style={{padding:"6px 12px",background:groupe===g?"rgba(59,130,246,0.1)":"#fff",border:`1px solid ${groupe===g?"#3b82f6":"#dce8f4"}`,borderRadius:16,color:groupe===g?"#3b82f6":"#64748b",cursor:"pointer",fontSize:11,fontWeight:groupe===g?600:400,fontFamily:"'Inter',sans-serif"}}>
                  {g} <span style={{fontSize:9,color:"#94a3b8"}}>({(EX[g]||[]).length})</span>
                </button>
              ))}
            </div>
          )}

          {/* Liste */}
          {exosList.map((ex, i) => (
            <div key={i} onClick={()=>setNewExForm({nom:ex.nom,cat:ex.cat,group:ex.group,series:"4",reps:"10",repos:"90s",charge:"",methode:"Classique"})}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,marginBottom:6,cursor:"pointer"}}
              onMouseEnter={ev=>ev.currentTarget.style.borderColor=cc(ex.cat)}
              onMouseLeave={ev=>ev.currentTarget.style.borderColor="#dce8f4"}>
              <div style={{width:4,height:32,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:"#0f1a2e"}}>{ex.nom}</div>
                {search && <div style={{fontSize:9,color:"#64748b",marginTop:1}}>{ex.group}</div>}
              </div>
              <div style={{fontSize:10,color:"#3b82f6",fontWeight:600}}>+ Ajouter</div>
            </div>
          ))}
          {!search && !groupe && <div style={{textAlign:"center",padding:"20px 0",fontSize:11,color:"#94a3b8"}}>Sélectionne un groupe ou recherche</div>}
          {search && exosList.length===0 && <div style={{textAlign:"center",padding:"20px 0",fontSize:11,color:"#94a3b8"}}>Aucun résultat pour "{search}"</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#e4eef8"}}>
      <div style={{paddingBottom:80}}>
        {/* Header */}
        <div style={{padding:"20px 15px 0",display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:13,fontWeight:600,padding:0,display:"flex",alignItems:"center",gap:4}}>← Retour</button>
        </div>
        <div style={{padding:"0 15px"}}>
          <div style={{padding:"14px 16px",background:`${int.c}14`,border:`0.5px solid ${int.c}40`,borderRadius:12,marginBottom:14}}>
            <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:400,marginBottom:4}}>{jour.nom}</div>
            <div style={{fontSize:11,color:"#64748b"}}>{jour.focus} · {jour.duree || "45-60 min"} · {exercices.length} exercice{exercices.length!==1?"s":""}</div>
          </div>

          {exercices.length === 0 && (
            <div style={{textAlign:"center",padding:"28px 0 16px"}}>
              <div style={{fontSize:28,marginBottom:8}}>🏋️</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>Aucun exercice dans cette séance.</div>
            </div>
          )}

          {exercices.map((ex, k) => {
            const colour = cc(ex.cat);
            const isEditing = !!editEx[k];
            return (
              <div key={k} style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:11,marginBottom:8,overflow:"hidden"}}>
                <div style={{padding:"11px 13px",borderLeft:`3px solid ${colour}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#0f1a2e",marginBottom:3}}>{ex.nom}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{ex.series}×{ex.reps} · {ex.repos}{ex.charge?` · ${ex.charge}`:""}{ex.tempo?` · ${ex.tempo}`:""}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
                    </div>
                    <div style={{display:"flex",gap:5,marginLeft:8}}>
                      {findExInDB(ex.nom) && (
                        <button onClick={()=>{const d=findExInDB(ex.nom);if(d)setGuideEx({dbEx:d,serieEx:ex});}} style={{padding:"4px 8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Guide ›</button>
                      )}
                      <button onClick={()=>setEditEx(m=>({...m,[k]:!m[k]}))} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer",fontSize:10,fontWeight:600}}>✏️</button>
                      <button onClick={()=>deleteEx(k)} style={{padding:"4px 8px",background:"rgba(248,113,113,0.08)",border:"0.5px solid rgba(248,113,113,0.25)",borderRadius:6,color:"#f87171",cursor:"pointer",fontSize:10}}>×</button>
                    </div>
                  </div>
                  {isEditing && (
                    <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid #dce8f4"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                        {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
                          <div key={pp.k}>
                            <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>{pp.l}</div>
                            <div style={{display:"flex",gap:3,alignItems:"center"}}>
                              <button onClick={()=>{const cur=parseFloat(ex[pp.k])||0;updateEx(k,pp.k,String(pp.k==="repos"?Math.max(0,cur-15):Math.max(1,cur-1)));}} style={{width:24,height:24,borderRadius:6,background:"#f1f5f9",border:"none",cursor:"pointer",fontSize:13}}>−</button>
                              <input value={ex[pp.k]||""} onChange={e=>updateEx(k,pp.k,e.target.value)} style={{flex:1,padding:"5px 4px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:6,fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
                              <button onClick={()=>{const cur=parseFloat(ex[pp.k])||0;updateEx(k,pp.k,String(pp.k==="repos"?cur+15:cur+1));}} style={{width:24,height:24,borderRadius:6,background:"#3b82f6",border:"none",color:"#fff",cursor:"pointer",fontSize:13}}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{marginBottom:7}}>
                        <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>TEMPO</div>
                        <input value={ex.tempo||""} onChange={e=>updateEx(k,"tempo",e.target.value)} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"7px 10px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:8,fontSize:11,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:"#64748b",marginBottom:4,fontWeight:600}}>MÉTHODE</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {METHODS.map(mm=>(
                            <button key={mm} onClick={()=>updateEx(k,"methode",mm)} style={{padding:"3px 9px",borderRadius:12,border:`1px solid ${ex.methode===mm?"#3b82f6":"#dce8f4"}`,background:ex.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:ex.methode===mm?"#3b82f6":"#64748b",cursor:"pointer",fontSize:9,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bouton ajouter exercice */}
          <button onClick={()=>setShowBiblio(true)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px dashed #3b82f6",borderRadius:10,color:"#3b82f6",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
            <span style={{fontSize:18,lineHeight:1}}>+</span> Ajouter un exercice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROGRAMMEVIEW : liste multi-programmes + création ──────────────────────
function ProgrammeView(props) {
  const {
    prog, setProg, progs, setProgs,
    premium, setPaywall, push,
    calSess, setCalSess,
    checkedEx,
    createStep, setCS, newP, setNewP,
    jourActif, setJourActif, groupe, setGroupe,
    editExIdx, setEditExIdx, exModal, setExModal, exModalTab, setExModalTab,
    C, INT, EX, setProgView, cycleStart, setCycleStart,
  } = props;

  // vue interne : "list" | "seance:{progIdx}:{jourIdx}" | "creer"
  const [innerView, setInnerView] = useState("list");
  const [confirmDel, setConfirmDel] = useState(null); // {type:"prog"|"jour", progIdx, jourIdx}
  const [isCreating, setIsCreating] = useState(false);

  const allProgs = progs && progs.length > 0 ? progs : (prog ? [prog] : []);

  // Synchro : quand on modifie un prog de la liste, mettre à jour prog actif si c'est le même
  const updateProgAtIdx = (idx, updatedP) => {
    const next = [...allProgs];
    next[idx] = updatedP;
    setProgs(next);
    // Mettre à jour prog actif si même titre/id
    if (prog && (prog.id === updatedP.id || prog.titre === allProgs[idx].titre)) {
      setProg(updatedP);
    }
  };

  const deleteProgAtIdx = (idx) => {
    const delProg = allProgs[idx];
    const next = allProgs.filter((_,i) => i !== idx);
    setProgs(next);
    if (prog && (prog.titre === delProg.titre || prog.id === delProg.id)) {
      setProg(next[0] || null);
    }
    // Nettoyer calSess : supprimer toutes les entrées liées aux séances de ce programme
    if (delProg.jours && setCalSess) {
      const joursNoms = new Set(delProg.jours.flatMap(j => [j.nom, j.focus].filter(Boolean)));
      setCalSess(prev => {
        const ns = {...prev};
        Object.keys(ns).forEach(k => { if (joursNoms.has(ns[k]?.nom)) delete ns[k]; });
        return ns;
      });
    }
    setConfirmDel(null);
    push("🗑️","Programme supprimé","Le programme et ses séances ont été retirés du calendrier.");
  };

  const deleteJourAtIdx = (pIdx, jIdx) => {
    const jour = allProgs[pIdx].jours[jIdx];
    const u = JSON.parse(JSON.stringify(allProgs[pIdx]));
    u.jours.splice(jIdx, 1);
    updateProgAtIdx(pIdx, u);
    // Nettoyer calSess : supprimer les entrées de ce jour
    if (jour && setCalSess) {
      const jourNoms = new Set([jour.nom, jour.focus].filter(Boolean));
      setCalSess(prev => {
        const ns = {...prev};
        Object.keys(ns).forEach(k => { if (jourNoms.has(ns[k]?.nom)) delete ns[k]; });
        return ns;
      });
    }
    setConfirmDel(null);
    push("🗑️","Séance supprimée","La séance a été retirée du programme et du calendrier.");
  };

  // Parser innerView pour séance
  let seanceView = null;
  if (innerView.startsWith("seance:")) {
    const [,pi,ji] = innerView.split(":");
    const pIdx = parseInt(pi), jIdx = parseInt(ji);
    if (allProgs[pIdx] && allProgs[pIdx].jours[jIdx]) {
      seanceView = { pIdx, jIdx, prog: allProgs[pIdx] };
    }
  }

  const showCreerForm = isCreating || createStep > 0 || (newP.nom !== "" || newP.jours.length > 0);
  const resetCreating = () => { setIsCreating(false); setCS(0); setNewP({nom:"",jours:[],seances:{}}); };
  const creerProps = {
    ...props,
    onCancel: resetCreating,
    setProgView: (v) => { resetCreating(); if(v === "calendar") setProgView("calendar"); else setInnerView("list"); },
  };

  // ── Vue séance detail ──
  if (seanceView) {
    return (
      <SeanceDetailModal
        jour={seanceView.prog.jours[seanceView.jIdx]}
        jourIdx={seanceView.jIdx}
        prog={seanceView.prog}
        setProg={(u) => updateProgAtIdx(seanceView.pIdx, u)}
        onClose={() => setInnerView("list")}
        C={C} INT={INT}
      />
    );
  }

  return (
    <div style={{padding:"0 15px"}}>

      {/* ── Modal confirmation suppression ── */}
      {confirmDel && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,26,46,0.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:16,padding:"22px 20px",width:"100%",maxWidth:340,boxShadow:"0 8px 32px rgba(0,0,0,0.12)"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:500,marginBottom:8,color:"#0f1a2e"}}>
              {confirmDel.type==="prog" ? "Supprimer ce programme ?" : "Supprimer cette séance ?"}
            </div>
            <div style={{fontSize:12,color:"#64748b",marginBottom:20,lineHeight:1.5}}>
              {confirmDel.type==="prog"
                ? "Toutes les séances de ce programme seront perdues. Cette action est irréversible."
                : "La séance et tous ses exercices seront supprimés définitivement."}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={() => setConfirmDel(null)} style={{flex:1,padding:"10px",background:"#f1f5f9",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,color:"#64748b",fontFamily:"'Inter',sans-serif"}}>Annuler</button>
              <button onClick={() => confirmDel.type==="prog" ? deleteProgAtIdx(confirmDel.pIdx) : deleteJourAtIdx(confirmDel.pIdx, confirmDel.jIdx)} style={{flex:1,padding:"10px",background:"#f87171",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:"#fff",fontFamily:"'Inter',sans-serif"}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Liste des programmes ── */}
      {allProgs.length === 0 && !showCreerForm && (
        <Box>
          <div style={{textAlign:"center",padding:"24px 0 8px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:400,color:"#0f1a2e",marginBottom:4}}>Programme sur-mesure ✦</div>
            <div style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:20}}>Obtenez un programme 100% adapté à votre morphologie, niveau et objectifs grâce à notre algorithme avancé</div>
          </div>
          <Btn onClick={() => { if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Générer mon programme</Btn>
          <Btn v="out" onClick={() => { setIsCreating(true); setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}>Créer manuellement</Btn>
        </Box>
      )}

      {allProgs.map((p, pIdx) => {
        const isActive = prog && (prog.titre === p.titre || prog.id === p.id);
        return (
          <Box key={pIdx} style={{marginBottom:12,border:isActive?"1px solid rgba(59,130,246,0.3)":"0.5px solid #dce8f4"}}>
            {/* Header programme */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1}}>
                {isActive && <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>● ACTIF</div>}
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:500,color:"#0f1a2e"}}>{p.titre}</div>
                <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{p.jours?.length || 0} séances{p.dateDebut ? ` · Créé le ${p.dateDebut}` : ""}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {!isActive && (
                  <button onClick={() => { setProg(p); push("✅","Programme activé",p.titre); }} style={{padding:"5px 10px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.3)",borderRadius:7,color:"#22c55e",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Activer</button>
                )}
                <button onClick={() => setConfirmDel({type:"prog",pIdx})} style={{padding:"5px 8px",background:"rgba(248,113,113,0.08)",border:"0.5px solid rgba(248,113,113,0.25)",borderRadius:7,color:"#f87171",cursor:"pointer",fontSize:11}}>🗑</button>
              </div>
            </div>

            {/* Séances */}
            {(p.jours || []).map((j, jIdx) => {
              const int = INT[j.intensite || "modere"];
              const total = j.exercices?.length || 0;
              const done = j.exercices?.filter((_,idx) => checkedEx[`${j.id}-${idx}`]).length || 0;
              return (
                <div key={jIdx} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  {/* Ligne séance cliquable */}
                  <div onClick={() => setInnerView(`seance:${pIdx}:${jIdx}`)} style={{flex:1,padding:"9px 11px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:int.c,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:1}}>{int.l}</div>
                      <div style={{fontSize:12,fontWeight:500,color:"#0f1a2e"}}>{j.nom}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{j.focus ? `${j.focus} · ` : ""}{total} exercice{total!==1?"s":""}</div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      {done>0 && <div style={{fontSize:9,color:C.green,fontWeight:700}}>{done}/{total}</div>}
                      {j.complete && <div style={{fontSize:10,color:C.green}}>✓</div>}
                      <div style={{color:"#94a3b8",fontSize:15}}>›</div>
                    </div>
                  </div>
                  {/* Bouton supprimer séance */}
                  <button onClick={() => setConfirmDel({type:"jour",pIdx,jIdx})} style={{padding:"8px 9px",background:"rgba(248,113,113,0.06)",border:"0.5px solid rgba(248,113,113,0.2)",borderRadius:8,color:"#f87171",cursor:"pointer",fontSize:12,flexShrink:0,lineHeight:1}}>×</button>
                </div>
              );
            })}

            {(p.jours||[]).length === 0 && (
              <div style={{textAlign:"center",padding:"10px 0 4px",fontSize:11,color:"#94a3b8"}}>Aucune séance dans ce programme.</div>
            )}
          </Box>
        );
      })}

      {/* ── Boutons d'action ── */}
      {allProgs.length > 0 && !showCreerForm && (
        <div style={{marginBottom:12}}>
          <Btn onClick={() => { if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Nouveau programme IA</Btn>
          <Btn v="out" onClick={() => { setIsCreating(true); setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}>+ Créer manuellement</Btn>
        </div>
      )}

      {/* ── Formulaire de création ── */}
      {showCreerForm && (
        <Creer {...creerProps} progs={allProgs} setProgsAll={(next) => { setProgs(next); if(next.length>0) setProg(next[next.length-1]); }} />
      )}
    </div>
  );
}

// ─── PROGRAMTAB ──────────────────────────────────────────────────────────────

export default function ProgramTab(props){
  const {
    prog, setProg, progs, setProgs, cycleStart, setCycleStart,
    premium, setPaywall, push,
    calSess, setCalSess,
    checkedEx,
    seance, setSeance,
    setChrono, setChronoSec,
    exDetails, setExDetails,
    exEdit, setExEdit,
    profil, cycles,
    EX, C,
    loadIA, setLoadIA, loadMsg, setLoadMsg,
    photos, setPhotos, readFile,
    corrigerFaibles, setCorrigerFaibles,
  } = props;

  // ─── State interne ───────────────────────────────────────────────────────
  const getInitialView = () => {
    try {
      const v = localStorage.getItem("mc_progView");
      if (v) { localStorage.removeItem("mc_progView"); return v; }
    } catch {}
    return "creer";
  };
  const [progView,   setProgView]   = useState(getInitialView);
  const [createStep, setCS]         = useState(0);
  const [newP,       setNewP]       = useState({nom:"",jours:[],seances:{}});
  const [jourActif,  setJourActif]  = useState(null);
  const [groupe,     setGroupe]     = useState(null);
  const [editExIdx,  setEditExIdx]  = useState({});
  const [exModal,    setExModal]    = useState(null);
  const [exModalTab, setExModalTab] = useState("tips");

  const subNav = [
    {id:"calendar", l:"Planification"},
    {id:"today",    l:"Aujourd'hui"},
    {id:"creer",    l:"Programme"},
    {id:"analyse",  l:"Programme Pro", prem:true},
  ];

  // Props partagés pour tous les sous-composants
  const sharedProps = {
    prog, setProg, progs, setProgs, cycleStart, setCycleStart,
    premium, setPaywall, push,
    calSess, setCalSess,
    checkedEx,
    seance, setSeance,
    setChrono, setChronoSec,
    exDetails, setExDetails,
    exEdit, setExEdit,
    profil, cycles, EX, C, INT,
    setProgView,
    setTab: props.setTab,
    jR: props.jR,
    semC: props.semC,
  };

  // Props pour Creer (inclut le state de création)
  const creerProps = {
    ...sharedProps,
    createStep, setCS,
    newP, setNewP,
    jourActif, setJourActif,
    groupe, setGroupe,
    editExIdx, setEditExIdx,
    exModal, setExModal,
    exModalTab, setExModalTab,
    setProgView,
  };

  // Props pour AnalyseIA
  const analyseProps = {
    profil,
    photos, setPhotos, readFile,
    loadIA, setLoadIA,
    loadMsg, setLoadMsg,
    corrigerFaibles, setCorrigerFaibles,
    setProg, setCycleStart, setCalSess,
    setProgView, setTab: props.setTab,
    cycles, setCycles: props.setCycles,
    prog,
    push, C, INT, EX,
  };

  return(
    <div style={{paddingBottom:16}}>
      <div style={{padding:"26px 15px 12px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,letterSpacing:-0.3,fontWeight:300}}>PROGRAMMATION</div>
      </div>

      {/* Sous-navigation */}
      <div style={{display:"flex",gap:5,padding:"0 15px",marginBottom:14,overflowX:"auto",paddingBottom:3}}>
        {subNav.map(s=>(
          <button
            key={s.id}
            onClick={()=>{ if(s.prem&&!premium) setPaywall(true); else setProgView(s.id); }}
            style={{
              padding:"7px 13px",
              background:progView===s.id?C.goldD:C.s2,
              border:`1px solid ${progView===s.id?C.gold:C.s3}`,
              borderRadius:18,
              color:progView===s.id?C.gold:"#64748b",
              cursor:"pointer",fontSize:11.5,fontWeight:600,
              whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif",
            }}
          >{s.l}</button>
        ))}
      </div>

      {/* ── Planification ── */}
      {progView==="calendar" && <Calendar {...sharedProps} />}

      {/* ── Aujourd'hui ── */}
      {progView==="today" && <TodayView {...sharedProps} />}

      {/* ── Programme (creer) ── */}
      {progView==="creer" && (
        <ProgrammeView {...creerProps} />
      )}

      {/* ── Programme Pro (AnalyseIA) ── */}
      {progView==="analyse" && premium && <AnalyseIA {...analyseProps} />}
    </div>
  );
}
