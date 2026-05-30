import { useState } from "react";
import { findExInDB } from "../../../utils/training.js";
import { C, INT, FONT } from "../../../data/constants.js";
import { EX } from "../../../data/exercises.js";
import { Card, Eyebrow, Lbl, Btn, Row } from "../../../components/ui/index.jsx";
import Calendar from "../Calendar.jsx";
import TodayView from "../TodayView.jsx";
import Creer from "../Creer.jsx";
import AnalyseIA from "../../ai/AnalyseIA.jsx";

// ─── HELPER : chercher un exercice dans la BDD ──────────────────────────────

// ─── GUIDE MODAL exercice (Tips / Variantes / Erreurs / Morpho) ──────────────
export function GuideExModal({ exData, exSerie, onClose, C }) {
  const [tab, setTab] = useState("tips");
  const cc = {principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF",mobilite:"#06b6d4"}[exData.cat] || "#4D8BFF";
  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{paddingBottom:80}}>
        <div style={{padding:"20px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"inline-block",padding:"3px 10px",background:`${cc}14`,border:`0.5px solid ${cc}40`,borderRadius:8,fontSize:10,color:cc,letterSpacing:"1px",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>{exData.cat}</div>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:20,fontWeight:400,lineHeight:1.2,color:"#F2F4F7",marginBottom:4}}>{exData.n}</div>
          </div>
          <button onClick={onClose} style={{background:C.s2,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:10,width:36,height:36,color:"rgba(242,244,247,0.50)",cursor:"pointer",fontSize:18,flexShrink:0,marginLeft:12}}>×</button>
        </div>
        <div style={{padding:"12px 16px",display:"flex",gap:7,flexWrap:"wrap"}}>
          {[{l:"Séries",v:exSerie?.series||exData.s},{l:"Reps",v:exSerie?.reps||exData.r},{l:"Repos",v:exSerie?.repos||exData.rest},{l:"Charge",v:exSerie?.charge||exData.ch}].map(s=>(
            <div key={s.l} style={{padding:"8px 10px",background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:10,textAlign:"center",flex:1,minWidth:60}}>
              <div style={{fontSize:14,fontWeight:400,color:"#4D8BFF",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>{s.v||"—"}</div>
              <div style={{fontSize:9,color:"rgba(242,244,247,0.50)",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"0 16px",display:"flex",gap:6,marginBottom:14}}>
          {[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"6px 13px",background:tab===t.id?"rgba(59,130,246,0.08)":"transparent",border:`0.5px solid ${tab===t.id?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:16,color:tab===t.id?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>{t.l}</button>
          ))}
        </div>
        <div style={{padding:"0 16px"}}>
          {tab==="tips"&&(<div style={{background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:9,color:"rgba(242,244,247,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Conseils techniques</div>
            {(exData.tips||[]).map((tip,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(exData.tips||[]).length-1?"0.5px solid rgba(190,180,255,0.07)":"none"}}><div style={{width:22,height:22,borderRadius:"50%",background:"rgba(59,130,246,0.1)",border:"0.5px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#4D8BFF"}}>{i+1}</div><div style={{fontSize:12,color:"#F2F4F7",lineHeight:1.6}}>{tip}</div></div>))}
            {exData.prog&&<div style={{marginTop:4,padding:"10px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:9}}><div style={{fontSize:10,color:"#5FE0A5",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>Progression</div><div style={{fontSize:12,color:"rgba(242,244,247,0.50)",lineHeight:1.5}}>{exData.prog}</div></div>}
          </div>)}
          {tab==="variantes"&&(<div>{(exData.variantes||[]).map((v,i)=>(<div key={i} style={{background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 16px",marginBottom:8}}><div style={{fontSize:13,fontWeight:500,color:"#F2F4F7",marginBottom:5}}>{v.nom||v}</div>{v.note&&<div style={{fontSize:11,color:"rgba(242,244,247,0.50)",lineHeight:1.5}}>{v.note}</div>}</div>))}</div>)}
          {tab==="erreurs"&&(<div style={{background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:9,color:"rgba(242,244,247,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Erreurs à éviter</div>
            {(exData.erreurs||[]).map((e,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}><div style={{width:20,height:20,borderRadius:"50%",background:"rgba(248,113,113,0.1)",border:"0.5px solid rgba(248,113,113,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#FF7A6B"}}>✕</div><div style={{fontSize:12,color:"#F2F4F7",lineHeight:1.5}}>{e}</div></div>))}
          </div>)}
          {tab==="morpho"&&(<div style={{background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:9,color:"rgba(242,244,247,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Adaptation morphologique</div>
            {(exData.morpho||"").split("\n").filter(Boolean).map((line,i,arr)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:10,paddingBottom:10,borderBottom:i<arr.length-1?"0.5px solid rgba(190,180,255,0.07)":"none",alignItems:"flex-start"}}><div style={{fontSize:13,flexShrink:0,marginTop:1}}>{line.split(":")[0].trim()}</div><div style={{fontSize:11.5,color:"#F2F4F7",lineHeight:1.6,flex:1}}>{line.split(":").slice(1).join(":").trim()}</div></div>))}
            {!(exData.morpho||"").includes("\n")&&exData.morpho&&<div style={{fontSize:12,color:"#F2F4F7",lineHeight:1.7}}>{exData.morpho}</div>}
          </div>)}
        </div>
        <div style={{padding:"14px 16px 0"}}>
          <button onClick={onClose} style={{width:"100%",padding:"11px",background:"transparent",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:10,color:"rgba(242,244,247,0.50)",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif"}}>← Retour à la séance</button>
        </div>
      </div>
    </div>
  );
}

// ─── SÉANCE DETAIL (vue exercices d'une séance depuis Programme) ─────────────
export function SeanceDetailModal({ jour, jourIdx, prog, setProg, onClose, C, INT }) {
  const [editEx,    setEditEx]    = useState({});
  const [guideEx,   setGuideEx]   = useState(null);
  const [showBiblio,setShowBiblio]= useState(false);
  const [search,    setSearch]    = useState("");
  const [groupe,    setGroupe]    = useState(null);
  const [newExForm, setNewExForm] = useState(null); // exercice en cours d'ajout

  const METHODS = ["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif","Pré-fatigue","Wave loading"];
  const cc = (cat) => ({principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[cat||"principal"]||"#4D8BFF");

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
      <div style={{minHeight:"100vh",background:C.bg}}>
        <div style={{padding:"20px 16px",paddingBottom:80}}>
          <button onClick={()=>setNewExForm(null)} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:16}}>← Retour à la bibliothèque</button>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:`${cc(newExForm.cat)}0d`,border:`0.5px solid ${cc(newExForm.cat)}30`,borderRadius:12,marginBottom:16}}>
            <div style={{width:4,height:40,borderRadius:2,background:cc(newExForm.cat),flexShrink:0}}/>
            <div>
              <div style={{fontSize:14,fontWeight:500,color:"#F2F4F7"}}>{newExForm.nom}</div>
              <div style={{fontSize:10,color:"rgba(242,244,247,0.50)",marginTop:2}}>{newExForm.group}</div>
            </div>
          </div>
          <div style={{background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"16px",marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {[{l:"Séries",k:"series",def:"4"},{l:"Reps",k:"reps",def:"10"},{l:"Repos",k:"repos",def:"90s"},{l:"Charge",k:"charge",def:""}].map(pp=>(
                <div key={pp.k}>
                  <div style={{fontSize:10,color:"rgba(242,244,247,0.50)",fontWeight:600,marginBottom:6}}>{pp.l}</div>
                  <input value={newExForm[pp.k]||""} onChange={e=>setNewExForm(f=>({...f,[pp.k]:e.target.value}))} placeholder={pp.def}
                    style={{width:"100%",padding:"9px 10px",background:C.s2,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:8,fontSize:13,color:"#F2F4F7",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:10,color:"rgba(242,244,247,0.50)",fontWeight:600,marginBottom:6}}>MÉTHODE</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {METHODS.slice(0,6).map(mm=>(
                  <button key={mm} onClick={()=>setNewExForm(f=>({...f,methode:mm}))} style={{padding:"4px 10px",borderRadius:12,border:`1px solid ${newExForm.methode===mm?"#4D8BFF":"rgba(190,180,255,0.07)"}`,background:newExForm.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:newExForm.methode===mm?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:10,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={addEx} style={{width:"100%",padding:"13px",background:C.accent,border:"none",borderRadius:12,color:"#141A2E",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",marginBottom:8}}>
            + Ajouter à la séance
          </button>
          <button onClick={()=>setNewExForm(null)} style={{width:"100%",padding:"10px",background:"transparent",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:10,color:"rgba(242,244,247,0.50)",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Annuler</button>
        </div>
      </div>
    );
  }

  // ── Vue bibliothèque ──
  if (showBiblio) {
    return (
      <div style={{minHeight:"100vh",background:C.bg}}>
        <div style={{padding:"20px 16px",paddingBottom:80}}>
          <button onClick={()=>{setShowBiblio(false);setSearch("");setGroupe(null);}} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:16}}>← Retour à la séance</button>
          <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:18,fontWeight:300,color:"#F2F4F7",marginBottom:14}}>Ajouter un exercice</div>

          {/* Recherche */}
          <div style={{position:"relative",marginBottom:12}}>
            <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}} placeholder="Rechercher…"
              style={{width:"100%",padding:"10px 14px 10px 36px",background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:10,fontSize:13,color:"#F2F4F7",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
            <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"rgba(242,244,247,0.50)"}}>🔍</div>
          </div>

          {/* Groupes musculaires */}
          {!search && (
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {Object.keys(EX).map(g => (
                <button key={g} onClick={()=>setGroupe(g===groupe?null:g)}
                  style={{padding:"6px 12px",background:groupe===g?"rgba(59,130,246,0.1)":"#141A2E",border:`1px solid ${groupe===g?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:16,color:groupe===g?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:11,fontWeight:groupe===g?600:400,fontFamily:"'Inter',sans-serif"}}>
                  {g} <span style={{fontSize:9,color:"rgba(242,244,247,0.50)"}}>({(EX[g]||[]).length})</span>
                </button>
              ))}
            </div>
          )}

          {/* Liste */}
          {exosList.map((ex, i) => (
            <div key={i} onClick={()=>setNewExForm({nom:ex.nom,cat:ex.cat,group:ex.group,series:"4",reps:"10",repos:"90s",charge:"",methode:"Classique"})}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:10,marginBottom:6,cursor:"pointer"}}
              onMouseEnter={ev=>ev.currentTarget.style.borderColor=cc(ex.cat)}
              onMouseLeave={ev=>ev.currentTarget.style.borderColor="rgba(190,180,255,0.07)"}>
              <div style={{width:4,height:32,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:"#F2F4F7"}}>{ex.nom}</div>
                {search && <div style={{fontSize:9,color:"rgba(242,244,247,0.50)",marginTop:1}}>{ex.group}</div>}
              </div>
              <div style={{fontSize:10,color:"#4D8BFF",fontWeight:600}}>+ Ajouter</div>
            </div>
          ))}
          {!search && !groupe && <div style={{textAlign:"center",padding:"20px 0",fontSize:11,color:"rgba(242,244,247,0.50)"}}>Sélectionne un groupe ou recherche</div>}
          {search && exosList.length===0 && <div style={{textAlign:"center",padding:"20px 0",fontSize:11,color:"rgba(242,244,247,0.50)"}}>Aucun résultat pour "{search}"</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{paddingBottom:80}}>
        {/* Header */}
        <div style={{padding:"20px 15px 0",display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:13,fontWeight:600,padding:0,display:"flex",alignItems:"center",gap:4}}>← Retour</button>
        </div>
        <div style={{padding:"0 15px"}}>
          {/* ── Session hero (mockup style) ── */}
          <div style={{position:"relative",borderRadius:24,overflow:"hidden",marginBottom:16,padding:"20px 20px 18px",background:`linear-gradient(155deg, ${int.c} 0%, ${int.c}cc 55%, ${int.c}66 100%)`,border:"1px solid rgba(255,255,255,0.22)",boxShadow:`0 20px 40px ${int.c}40, inset 0 1px 0 rgba(255,255,255,0.3)`}}>
            <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(160% 60% at 20% 10%, rgba(255,255,255,0.42), transparent 55%)"}}/>
            <div style={{position:"absolute",right:-50,bottom:-50,width:200,height:200,borderRadius:"50%",background:"radial-gradient(closest-side, rgba(255,255,255,0.18), transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:999,background:"rgba(11,15,31,0.28)",border:"1px solid rgba(11,15,31,0.3)",color:"#0B0F1F",fontSize:9.5,fontWeight:800,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:1.4}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:C.bg}}/>
                {int.l.toUpperCase()}
              </div>
              <div style={{fontFamily:"'Instrument Serif',serif",fontSize:40,fontWeight:400,letterSpacing:-1.6,color:"#0B0F1F",lineHeight:0.98,marginTop:18}}>{jour.nom}</div>
              <div style={{fontSize:13,color:"rgba(11,15,31,0.78)",fontWeight:600,marginTop:6,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>{jour.focus}</div>
              <div style={{marginTop:18,display:"flex",gap:24}}>
                {[{v:jour.duree||"45-60",u:"min"},{v:exercices.length,u:"exercices"}].map(s=>(
                  <div key={s.u}>
                    <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:19,fontWeight:800,color:"#0B0F1F",letterSpacing:-0.4}}>{s.v}</div>
                    <div style={{fontSize:9,color:"rgba(11,15,31,0.68)",fontWeight:700,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:0.4,marginTop:2}}>{s.u.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {exercices.length === 0 && (
            <div style={{textAlign:"center",padding:"28px 0 16px"}}>
              <div style={{fontSize:28,marginBottom:8}}>🏋️</div>
              <div style={{fontSize:13,color:"rgba(242,244,247,0.50)",marginBottom:16}}>Aucun exercice dans cette séance.</div>
            </div>
          )}

          {exercices.map((ex, k) => {
            const colour = cc(ex.cat);
            const isEditing = !!editEx[k];
            return (
              <div key={k} style={{background:C.s1,border:`1px solid ${isEditing?colour+"40":"rgba(190,180,255,0.07)"}`,borderRadius:16,marginBottom:8,overflow:"hidden",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.03)"}}>
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:38,height:38,borderRadius:11,flexShrink:0,background:`linear-gradient(145deg, ${colour}30, ${colour}08)`,border:`1px solid ${colour}40`,color:colour,display:"grid",placeItems:"center",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:13,fontWeight:800}}>{k+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#F2F4F7",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:-0.1}}>{ex.nom}</div>
                      <div style={{fontSize:11,color:"rgba(242,244,247,0.35)",fontWeight:500,marginTop:2}}>{ex.series}×{ex.reps} · {ex.repos}{ex.charge?` · `:""}{ex.charge&&<span style={{color:colour,fontWeight:700}}>{ex.charge}</span>}{ex.tempo?` · ${ex.tempo}`:""}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
                    </div>
                    <div style={{display:"flex",gap:5,marginLeft:8}}>
                      {findExInDB(ex.nom) && (
                        <button onClick={()=>{const d=findExInDB(ex.nom);if(d)setGuideEx({dbEx:d,serieEx:ex});}} style={{padding:"4px 8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#4D8BFF",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Guide ›</button>
                      )}
                      <button onClick={()=>setEditEx(m=>({...m,[k]:!m[k]}))} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#4D8BFF",cursor:"pointer",fontSize:10,fontWeight:600}}>✏️</button>
                      <button onClick={()=>deleteEx(k)} style={{padding:"4px 8px",background:"rgba(248,113,113,0.08)",border:"0.5px solid rgba(248,113,113,0.25)",borderRadius:6,color:"#FF7A6B",cursor:"pointer",fontSize:10}}>×</button>
                    </div>
                  </div>
                  {isEditing && (
                    <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid rgba(190,180,255,0.07)"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                        {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
                          <div key={pp.k}>
                            <div style={{fontSize:9,color:"rgba(242,244,247,0.50)",marginBottom:3,fontWeight:600}}>{pp.l}</div>
                            <div style={{display:"flex",gap:3,alignItems:"center"}}>
                              <button onClick={()=>{const cur=parseFloat(ex[pp.k])||0;updateEx(k,pp.k,String(pp.k==="repos"?Math.max(0,cur-15):Math.max(1,cur-1)));}} style={{width:24,height:24,borderRadius:6,background:C.s2,border:"none",cursor:"pointer",fontSize:13}}>−</button>
                              <input value={ex[pp.k]||""} onChange={e=>updateEx(k,pp.k,e.target.value)} style={{flex:1,padding:"5px 4px",background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:6,fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
                              <button onClick={()=>{const cur=parseFloat(ex[pp.k])||0;updateEx(k,pp.k,String(pp.k==="repos"?cur+15:cur+1));}} style={{width:24,height:24,borderRadius:6,background:C.accent,border:"none",color:"#141A2E",cursor:"pointer",fontSize:13}}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{marginBottom:7}}>
                        <div style={{fontSize:9,color:"rgba(242,244,247,0.50)",marginBottom:3,fontWeight:600}}>TEMPO</div>
                        <input value={ex.tempo||""} onChange={e=>updateEx(k,"tempo",e.target.value)} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"7px 10px",background:C.s1,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:8,fontSize:11,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:"rgba(242,244,247,0.50)",marginBottom:4,fontWeight:600}}>MÉTHODE</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {METHODS.map(mm=>(
                            <button key={mm} onClick={()=>updateEx(k,"methode",mm)} style={{padding:"3px 9px",borderRadius:12,border:`1px solid ${ex.methode===mm?"#4D8BFF":"rgba(190,180,255,0.07)"}`,background:ex.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:ex.methode===mm?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:9,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
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
          <button onClick={()=>setShowBiblio(true)} style={{width:"100%",padding:"14px",background:"rgba(77,139,255,0.06)",border:"1px dashed rgba(77,139,255,0.5)",borderRadius:16,color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4,letterSpacing:0.2}}>
            <span style={{fontSize:18,lineHeight:1}}>+</span> Ajouter un exercice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROGRAMMEVIEW : liste multi-programmes + création ──────────────────────