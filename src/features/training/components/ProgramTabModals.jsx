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
  const DISP_F = "'Outfit','DM Sans',system-ui,sans-serif";
  const SERIF_F = "'DM Serif Display','Georgia',serif";
  const [editEx,     setEditEx]    = useState({});
  const [guideEx,    setGuideEx]   = useState(null);
  const [showBiblio, setShowBiblio]= useState(false);
  const [search,     setSearch]    = useState("");
  const [groupe,     setGroupe]    = useState(null);
  const [newExForm,  setNewExForm] = useState(null);
  const [localName,  setLocalName] = useState(jour.nom || "");

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
  const updateName = (val) => {
    setLocalName(val);
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].nom = val;
    setProg(u);
  };
  const addEx = () => {
    if (!newExForm?.nom) return;
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices = u.jours[jourIdx].exercices || [];
    u.jours[jourIdx].exercices.push({
      nom:    newExForm.nom,
      cat:    newExForm.cat  || "principal",
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
    setSearch(""); setGroupe(null);
  };

  const exosList = search
    ? Object.entries(EX).flatMap(([g,arr]) => arr.map(ex => ({nom:ex.n,cat:ex.cat,group:g,raw:ex})))
        .filter(e => e.nom.toLowerCase().includes(search.toLowerCase()))
    : groupe ? (EX[groupe]||[]).map(ex => ({nom:ex.n,cat:ex.cat,group:groupe,raw:ex})) : [];

  if (guideEx) return <GuideExModal exData={guideEx.dbEx} exSerie={guideEx.serieEx} onClose={()=>setGuideEx(null)} C={C}/>;

  const int = INT[jour.intensite || "modere"];
  const exercices = prog.jours[jourIdx]?.exercices || [];
  const lbl = {fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:6,fontFamily:DISP_F};

  // ── Formulaire configuration exercice ─────────────────────────────────────
  if (newExForm) {
    return (
      <div style={{minHeight:"100vh",background:C.bg}}>
        <div style={{padding:"20px 16px 80px"}}>
          <button onClick={()=>setNewExForm(null)} style={{background:"transparent",border:"none",color:"#60A5FA",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:DISP_F,display:"flex",alignItems:"center",gap:5,marginBottom:16}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour à la bibliothèque
          </button>

          {/* Badge exo */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:`${cc(newExForm.cat)}0d`,border:`1px solid ${cc(newExForm.cat)}30`,borderRadius:14,marginBottom:18}}>
            <div style={{width:4,height:38,borderRadius:2,background:cc(newExForm.cat),flexShrink:0}}/>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F}}>{newExForm.nom}</div>
              <div style={{fontSize:10,color:"rgba(242,244,247,0.40)",marginTop:2,fontFamily:DISP_F}}>{newExForm.group}</div>
            </div>
          </div>

          {/* Séries / Reps / Repos / Charge */}
          <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:16,padding:"14px",marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[{l:"Séries",k:"series",def:"4"},{l:"Reps",k:"reps",def:"10"},{l:"Repos",k:"repos",def:"90s"},{l:"Charge",k:"charge",def:""}].map(pp=>(
                <div key={pp.k}>
                  <div style={lbl}>{pp.l}</div>
                  <input value={newExForm[pp.k]||""} onChange={e=>setNewExForm(f=>({...f,[pp.k]:e.target.value}))}
                    placeholder={pp.def} autoComplete="off"
                    style={{width:"100%",padding:"11px 10px",background:C.s2,border:`1px solid ${C.bd}`,borderRadius:10,fontSize:15,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F,textAlign:"center",outline:"none"}}/>
                </div>
              ))}
            </div>
            <div style={lbl}>Méthode</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {METHODS.slice(0,8).map(mm=>{const on=newExForm.methode===mm;return(
                <button key={mm} onClick={()=>setNewExForm(f=>({...f,methode:mm}))} style={{padding:"5px 11px",borderRadius:99,border:`1px solid ${on?"#3B82F6":C.bd}`,background:on?"rgba(59,130,246,0.12)":"transparent",color:on?"#60A5FA":"rgba(242,244,247,0.45)",cursor:"pointer",fontSize:10.5,fontWeight:on?700:500,fontFamily:DISP_F}}>{mm}</button>
              );})}
            </div>
          </div>

          <button onClick={addEx} style={{width:"100%",padding:"15px",background:"linear-gradient(180deg,#3B82F6,#2563EB)",border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:DISP_F,boxShadow:"0 8px 24px rgba(59,130,246,0.32)"}}>
            + Ajouter à la séance
          </button>
        </div>
      </div>
    );
  }

  // ── Vue bibliothèque ───────────────────────────────────────────────────────
  if (showBiblio) {
    return (
      <div style={{minHeight:"100vh",background:C.bg}}>
        <div style={{padding:"20px 16px 80px"}}>
          {/* Back */}
          <button onClick={()=>{setShowBiblio(false);setSearch("");setGroupe(null);}} style={{background:"transparent",border:"none",color:"#60A5FA",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:DISP_F,display:"flex",alignItems:"center",gap:5,marginBottom:16}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour à la séance
          </button>

          <div style={{fontFamily:SERIF_F,fontSize:22,letterSpacing:-0.5,marginBottom:16}}>Ajouter un <span style={{fontStyle:"italic",color:"#60A5FA"}}>exercice</span></div>

          {/* Recherche */}
          <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}} placeholder="🔍  Rechercher un exercice…"
            autoComplete="off" autoCorrect="off"
            style={{width:"100%",padding:"12px 14px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,color:"#F2F4F7",fontFamily:DISP_F,fontSize:13,outline:"none",marginBottom:12}}/>

          {/* Groupes — scroll horizontal */}
          {!search && (
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:14,scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
              {Object.keys(EX).map(g=>{const on=groupe===g;return(
                <button key={g} onClick={()=>setGroupe(g===groupe?null:g)} style={{flexShrink:0,padding:"9px 16px",borderRadius:12,border:`1.5px solid ${on?"#3B82F6":C.bd}`,background:on?"rgba(59,130,246,0.12)":C.s1,color:on?"#3B82F6":"rgba(242,244,247,0.55)",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:DISP_F,whiteSpace:"nowrap"}}>
                  {g} <span style={{fontSize:10,fontWeight:500,opacity:.6}}>({(EX[g]||[]).length})</span>
                </button>
              );})}
            </div>
          )}

          {/* Cartes riches exercices */}
          {exosList.length > 0 && exosList.map((ex, i) => {
            const col = cc(ex.cat);
            const already = !!exercices.find(e=>e.nom===ex.nom);
            const dbEx = ex.raw;
            return (
              <div key={i} style={{background:C.s1,border:`1px solid ${already?"rgba(52,211,153,0.25)":C.bd}`,borderRadius:16,padding:16,marginBottom:10,borderLeft:`3px solid ${col}`,boxShadow:`0 8px 24px -16px ${col}`}}>
                {/* Badge catégorie */}
                <span style={{fontSize:10.5,fontWeight:800,letterSpacing:"1.2px",padding:"4px 9px",borderRadius:7,display:"inline-block",marginBottom:8,color:col,background:`${col}18`,border:`1px solid ${col}35`,fontFamily:DISP_F}}>
                  {ex.cat?.toUpperCase()}
                </span>
                {/* Nom */}
                <div style={{fontSize:16,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F,letterSpacing:-0.2,marginBottom:2}}>{ex.nom}</div>
                {/* Sets info */}
                <div style={{fontSize:13,color:"rgba(242,244,247,0.50)",marginBottom:4,fontFamily:DISP_F}}>
                  {dbEx?.s||"4"}×{dbEx?.r||"10"} · {dbEx?.rest||"90"}s
                  {search && <span style={{color:"rgba(242,244,247,0.30)",marginLeft:8}}>{ex.group}</span>}
                </div>
                {/* Conseil morpho */}
                {dbEx?.morpho && (
                  <div style={{fontSize:12,color:"rgba(242,244,247,0.30)",fontStyle:"italic",lineHeight:1.5,marginBottom:12,fontFamily:DISP_F}}>
                    {(dbEx.morpho||"").substring(0,90)}…
                  </div>
                )}
                {/* Boutons */}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>!already&&setNewExForm({nom:ex.nom,cat:ex.cat,group:ex.group,series:dbEx?.s||"4",reps:dbEx?.r||"10",repos:`${dbEx?.rest||90}s`,charge:"",methode:"Classique"})}
                    style={{flex:1,padding:"13px",borderRadius:13,border:"none",fontFamily:DISP_F,fontSize:13,fontWeight:700,cursor:already?"default":"pointer",
                      background:already?"rgba(52,211,153,0.12)":"linear-gradient(180deg,#3B82F6,#2563EB)",
                      color:already?"#34D399":"#fff",boxShadow:already?"none":"0 6px 18px rgba(59,130,246,0.28)"}}>
                    {already ? "✓ Ajouté" : "+ Ajouter"}
                  </button>
                  {dbEx && (
                    <button onClick={()=>{const d=findExInDB(ex.nom);if(d)setGuideEx({dbEx:d,serieEx:ex});}}
                      style={{padding:"13px 16px",background:"rgba(59,130,246,0.10)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,color:"#60A5FA",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DISP_F}}>
                      Guide →
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!search && !groupe && (
            <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:"rgba(242,244,247,0.30)",fontFamily:DISP_F}}>Sélectionne un groupe ou recherche un exercice</div>
          )}
          {search && exosList.length===0 && (
            <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:"rgba(242,244,247,0.30)",fontFamily:DISP_F}}>Aucun résultat pour « {search} »</div>
          )}
        </div>
      </div>
    );
  }

  // ── Vue principale séance ───────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{paddingBottom:80}}>

        {/* Back button — bien visible */}
        <div style={{padding:"18px 16px 0",display:"flex",alignItems:"center"}}>
          <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(96,165,250,0.10)",border:"1px solid rgba(96,165,250,0.25)",borderRadius:11,padding:"8px 14px",color:"#60A5FA",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DISP_F}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour
          </button>
        </div>

        <div style={{padding:"16px 16px 0"}}>
          {/* Hero séance */}
          <div style={{position:"relative",borderRadius:24,overflow:"hidden",marginBottom:16,padding:"20px 20px 18px",background:`linear-gradient(155deg,${int.c} 0%,${int.c}cc 55%,${int.c}66 100%)`,border:"1px solid rgba(255,255,255,0.22)",boxShadow:`0 20px 40px ${int.c}40`}}>
            <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(160% 60% at 20% 10%,rgba(255,255,255,0.42),transparent 55%)"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:999,background:"rgba(11,15,31,0.28)",color:"#0B0F1F",fontSize:9.5,fontWeight:800,fontFamily:DISP_F,letterSpacing:1.4,marginBottom:14}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#0B0F1F"}}/>
                {int.l.toUpperCase()}
              </div>
              <div style={{fontFamily:SERIF_F,fontSize:38,fontWeight:400,letterSpacing:-1.6,color:"#0B0F1F",lineHeight:0.98,marginBottom:6}}>{localName}</div>
              <div style={{fontSize:13,color:"rgba(11,15,31,0.78)",fontWeight:600,fontFamily:DISP_F,marginBottom:16}}>{jour.focus}</div>
              <div style={{display:"flex",gap:24}}>
                {[{v:jour.duree||"45-60",u:"min"},{v:exercices.length,u:"exercices"}].map(s=>(
                  <div key={s.u}>
                    <div style={{fontFamily:DISP_F,fontSize:19,fontWeight:800,color:"#0B0F1F",letterSpacing:-0.4}}>{s.v}</div>
                    <div style={{fontSize:9,color:"rgba(11,15,31,0.68)",fontWeight:700,fontFamily:DISP_F,letterSpacing:0.4,marginTop:2}}>{s.u.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Renommer la séance */}
          <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:14,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,flexShrink:0}}>✏️</span>
            <div style={{flex:1}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:5,fontFamily:DISP_F}}>Nom de la séance</div>
              <input value={localName} onChange={e=>updateName(e.target.value)}
                autoComplete="off" autoCorrect="off" data-form-type="other"
                style={{width:"100%",background:"none",border:"none",color:"#F2F4F7",fontFamily:DISP_F,fontSize:16,fontWeight:600,outline:"none",padding:0}}/>
            </div>
          </div>

          {/* Exercices */}
          {exercices.length === 0 && (
            <div style={{borderRadius:18,padding:"20px 16px",background:"rgba(255,255,255,0.02)",border:`1px dashed ${C.bd}`,marginBottom:16}}>
              {[{w:"65%",col:"#4D8BFF"},{w:"50%",col:"#5FE0A5"},{w:"72%",col:"#B69DFF"}].map((g,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<2?`1px solid rgba(255,255,255,0.04)`:"none",opacity:1-i*0.2}}>
                  <div style={{width:34,height:34,borderRadius:10,background:`${g.col}15`,border:`1px solid ${g.col}25`,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{height:11,borderRadius:4,background:"rgba(255,255,255,0.06)",width:g.w,marginBottom:6}}/>
                    <div style={{height:9,borderRadius:3,background:"rgba(255,255,255,0.04)",width:"40%"}}/>
                  </div>
                </div>
              ))}
              <div style={{textAlign:"center",paddingTop:14,fontSize:12,color:"rgba(242,244,247,0.30)",fontFamily:DISP_F}}>Ajoute ton premier exercice ci-dessous</div>
            </div>
          )}

          {exercices.map((ex, k) => {
            const colour = cc(ex.cat);
            const isEditing = !!editEx[k];
            return (
              <div key={k} style={{background:C.s1,border:`1px solid ${isEditing?colour+"40":C.bd}`,borderRadius:16,marginBottom:8,overflow:"hidden"}}>
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:38,height:38,borderRadius:11,flexShrink:0,background:`linear-gradient(145deg,${colour}30,${colour}08)`,border:`1px solid ${colour}40`,color:colour,display:"grid",placeItems:"center",fontFamily:DISP_F,fontSize:13,fontWeight:800}}>{k+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F,letterSpacing:-0.1}}>{ex.nom}</div>
                      <div style={{fontSize:11,color:"rgba(242,244,247,0.35)",marginTop:2,fontFamily:DISP_F}}>
                        {ex.series}×{ex.reps} · {ex.repos}
                        {ex.charge?<><span style={{opacity:.5}}> · </span><span style={{color:colour,fontWeight:700}}>{ex.charge}</span></>:""}
                        {ex.methode&&ex.methode!=="Classique"?<span style={{opacity:.5}}> · {ex.methode}</span>:""}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:5,marginLeft:8}}>
                      {findExInDB(ex.nom) && (
                        <button onClick={()=>{const d=findExInDB(ex.nom);if(d)setGuideEx({dbEx:d,serieEx:ex});}} style={{padding:"5px 9px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,color:"#60A5FA",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:DISP_F}}>Guide›</button>
                      )}
                      <button onClick={()=>setEditEx(m=>({...m,[k]:!m[k]}))} style={{width:30,height:30,borderRadius:9,background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",color:"#60A5FA",cursor:"pointer",fontSize:13,display:"grid",placeItems:"center"}}>✏️</button>
                      <button onClick={()=>deleteEx(k)} style={{width:30,height:30,borderRadius:9,background:"rgba(248,113,113,0.08)",border:"0.5px solid rgba(248,113,113,0.25)",color:"#F87171",cursor:"pointer",fontSize:13,display:"grid",placeItems:"center"}}>×</button>
                    </div>
                  </div>
                  {isEditing && (
                    <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.bd}`}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                        {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp=>(
                          <div key={pp.k}>
                            <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:5,fontFamily:DISP_F}}>{pp.l}</div>
                            <div style={{display:"flex",gap:4,alignItems:"center"}}>
                              <button onClick={()=>{const cur=parseFloat(ex[pp.k])||0;updateEx(k,pp.k,String(Math.max(0,cur-(pp.k==="repos"?15:1))));}} style={{width:28,height:28,borderRadius:7,background:C.s2,border:"none",cursor:"pointer",fontSize:14,color:"rgba(242,244,247,0.60)"}}>−</button>
                              <input value={ex[pp.k]||""} onChange={e=>updateEx(k,pp.k,e.target.value)} autoComplete="off"
                                style={{flex:1,padding:"6px 4px",background:C.s2,border:`1px solid ${C.bd}`,borderRadius:8,fontSize:12,fontWeight:600,textAlign:"center",fontFamily:DISP_F,color:"#F2F4F7",outline:"none"}}/>
                              <button onClick={()=>{const cur=parseFloat(ex[pp.k])||0;updateEx(k,pp.k,String(cur+(pp.k==="repos"?15:1)));}} style={{width:28,height:28,borderRadius:7,background:"rgba(59,130,246,0.16)",border:"none",cursor:"pointer",fontSize:14,color:"#60A5FA"}}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(242,244,247,0.35)",marginBottom:6,fontFamily:DISP_F}}>Méthode</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {METHODS.map(mm=>{const on=ex.methode===mm;return(
                          <button key={mm} onClick={()=>updateEx(k,"methode",mm)} style={{padding:"4px 10px",borderRadius:99,border:`1px solid ${on?"#3B82F6":C.bd}`,background:on?"rgba(59,130,246,0.12)":"transparent",color:on?"#60A5FA":"rgba(242,244,247,0.40)",cursor:"pointer",fontSize:10,fontFamily:DISP_F}}>{mm}</button>
                        );})}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button onClick={()=>setShowBiblio(true)} style={{width:"100%",padding:"14px",background:"rgba(59,130,246,0.06)",border:"1px dashed rgba(59,130,246,0.5)",borderRadius:16,color:"#60A5FA",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DISP_F,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
            <span style={{fontSize:18,lineHeight:1}}>+</span> Ajouter un exercice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROGRAMMEVIEW : liste multi-programmes + création ──────────────────────
