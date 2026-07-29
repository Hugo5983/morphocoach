import { useState, useEffect } from"react";
import { I } from"../../../components/ui/Icon.jsx";
import { catColor, dureeSeance } from"../../../utils/training.js";
import { C, DARK, FONT, INT } from"../../../data/constants.js";
import { Card, Eyebrow, Lbl, Btn, Row } from"../../../components/ui/index.jsx";
import Calendar from"../Calendar.jsx";
import Creer from"../Creer.jsx";
import AnalyseIA from"../../ai/AnalyseIA.jsx";
import { ExCard, BiblioSheet, parseScheme, CSS as CREER_CSS } from"./CreerKit.jsx";

// ─── HELPER : chercher un exercice dans la BDD ──────────────────────────────

// ─── GUIDE MODAL exercice (Tips / Variantes / Erreurs / Morpho) ──────────────
export function GuideExModal({ exData, exSerie, onClose, C }) {
  const [tab, setTab] = useState("tips");
  const cc = catColor(exData.cat);
  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{paddingBottom:32}}>
        <div style={{padding:"20px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"inline-block",padding:"4px 12px",background:`${cc}14`,border:`0.5px solid ${cc}40`,borderRadius:8,fontSize:10,color:cc,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:12}}>{exData.cat}</div>
            <div style={{fontFamily:"'Archivo',system-ui,sans-serif",fontSize:20,fontWeight:400,lineHeight:1.2,color:"${C.text}",marginBottom:4}}>{exData.n}</div>
          </div>
          <button onClick={onClose} style={{background:C.s2,border:"0.5px solid rgba(0,0,0,0.05)",borderRadius:12,width:36,height:36,color:C.mid,cursor:"pointer",fontSize:20,flexShrink:0,marginLeft:12}}>×</button>
        </div>
        <div style={{padding:"12px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
          {[{l:"Séries",v:exSerie?.series||exData.s},{l:"Reps",v:exSerie?.reps||exData.r},{l:"Repos",v:exSerie?.repos||exData.rest},{l:"Charge",v:exSerie?.charge||exData.ch}].map(s=>(
            <div key={s.l} style={{padding:"8px 12px",background:C.s1,border:"0.5px solid rgba(0,0,0,0.05)",borderRadius:12,textAlign:"center",flex:1,minWidth:60}}>
              <div style={{fontSize:14,fontWeight:400,color:"#3C5BFF",fontFamily:"'Archivo',system-ui,sans-serif"}}>{s.v||"—"}</div>
              <div style={{fontSize:10,color:C.mid,marginTop:2}}>{s.l}</div>
            </div>
))}
        </div>
        <div style={{padding:"0 16px",display:"flex",gap:8,marginBottom:16}}>
          {[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 12px",background:tab===t.id?"rgba(60,91,255,0.08)":"transparent",border:`0.5px solid ${tab===t.id?"#3C5BFF":"rgba(190,180,255,0.08)"}`,borderRadius:16,color:tab===t.id?"#3C5BFF":"rgba(245,241,232,0.5)",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Archivo',sans-serif"}}>{t.l}</button>
))}
        </div>
        <div style={{padding:"0 16px"}}>
          {tab==="tips"&&(<div style={{background:C.s1,border:"0.5px solid rgba(0,0,0,0.05)",borderRadius:12,padding:"16px 16px"}}>
            <div style={{fontSize:10,color:C.mid,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Conseils techniques</div>
            {(exData.tips||[]).map((tip,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:16,paddingBottom:16,borderBottom:i<(exData.tips||[]).length-1?"0.5px solid rgba(190,180,255,0.08)":"none"}}><div style={{width:22,height:22,borderRadius:"50%",background:"rgba(60,91,255,0.12)",border:"0.5px solid rgba(60,91,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#3C5BFF"}}>{i+1}</div><div style={{fontSize:13,color:"${C.text}",lineHeight:1.6}}>{tip}</div></div>))}
            {exData.prog&&<div style={{marginTop:4,padding:"12px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.18)",borderRadius:8}}><div style={{fontSize:10,color:"#12B76A",fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Progression</div><div style={{fontSize:13,color:C.mid,lineHeight:1.5}}>{exData.prog}</div></div>}
          </div>)}
          {tab==="variantes"&&(<div>{(exData.variantes||[]).map((v,i)=>(<div key={i} style={{background:C.s1,border:"0.5px solid rgba(0,0,0,0.05)",borderRadius:12,padding:"16px 16px",marginBottom:8}}><div style={{fontSize:13,fontWeight:500,color:"${C.text}",marginBottom:4}}>{v.nom||v}</div>{v.note&&<div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{v.note}</div>}</div>))}</div>)}
          {tab==="erreurs"&&(<div style={{background:C.s1,border:"0.5px solid rgba(0,0,0,0.05)",borderRadius:12,padding:"16px 16px"}}>
            <div style={{fontSize:10,color:C.mid,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Erreurs à éviter</div>
            {(exData.erreurs||[]).map((e,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}><div style={{width:20,height:20,borderRadius:"50%",background:"rgba(229,72,77,0.12)",border:"0.5px solid rgba(229,72,77,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#3C5BFF"}}><I name="close" size={12}/></div><div style={{fontSize:13,color:"${C.text}",lineHeight:1.5}}>{e}</div></div>))}
          </div>)}
          {tab==="morpho"&&(<div style={{background:C.s1,border:"0.5px solid rgba(0,0,0,0.05)",borderRadius:12,padding:"16px 16px"}}>
            <div style={{fontSize:10,color:C.mid,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Adaptation morphologique</div>
            {(exData.morpho||"").split("\n").filter(Boolean).map((line,i,arr)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:12,paddingBottom:12,borderBottom:i<arr.length-1?"0.5px solid rgba(190,180,255,0.08)":"none",alignItems:"flex-start"}}><div style={{fontSize:13,flexShrink:0,marginTop:1}}>{line.split(":")[0].trim()}</div><div style={{fontSize:11,color:"${C.text}",lineHeight:1.6,flex:1}}>{line.split(":").slice(1).join(":").trim()}</div></div>))}
            {!(exData.morpho||"").includes("\n")&&exData.morpho&&<div style={{fontSize:13,color:"${C.text}",lineHeight:1.6}}>{exData.morpho}</div>}
          </div>)}
        </div>
        <div style={{padding:"16px 16px 0"}}>
          <button onClick={onClose} style={{width:"100%",padding:"12px",background:"transparent",border:"0.5px solid rgba(0,0,0,0.05)",borderRadius:12,color:C.mid,cursor:"pointer",fontSize:13,fontFamily:"'Archivo',sans-serif"}}><I name="chevronLeft" size={14}/> Retour à la séance</button>
        </div>
      </div>
    </div>
);
}

// ─── SÉANCE DETAIL (vue exercices d'une séance depuis Programme) ─────────────
// Refonte (juillet 2026) — réutilise à l'identique ExCard et BiblioSheet du
// créateur de programme (CreerKit.jsx) au lieu d'une implémentation dupliquée :
// la séance qu'on crée et la séance qu'on modifie sont maintenant rendues par
// le même code. Le hero reprend la Piste B déjà validée pour ProgrammeView.jsx
// (fond sombre, glows, liseré lumineux) au lieu de l'ancien dégradé bleu plein
// cadre qui tranchait avec le reste de l'app.
export function SeanceDetailModal({ jour, jourIdx, prog, setProg, onClose, C, INT }) {
  const [localName,  setLocalName]  = useState(jour.nom ||"");
  const [showBiblio, setShowBiblio] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    const prevPos = document.body.style.position;
    const prevTop = document.body.style.top;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = prevPos;
      document.body.style.top = prevTop;
      document.body.style.overflow = prev;
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const exercices    = prog.jours[jourIdx]?.exercices || [];
  const int          = INT[jour.intensite ||"modere"];
  const dur           = dureeSeance(jour);
  const totalSeries  = exercices.reduce((t, ex) => t + (parseInt(ex.series) || 0), 0);

  const updateName = (val) => {
    setLocalName(val);
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].nom = val;
    setProg(u);
  };

  // ExCard passe l'objet exercice complet déjà mis à jour (voir CreerKit.jsx)
  const updateExAt = (k, updatedEx) => {
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices[k] = updatedEx;
    setProg(u);
  };

  const removeExAt = (k) => {
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices.splice(k, 1);
    setProg(u);
  };

  // Même conversion exactement que Creer.jsx (addEx) : un exercice choisi dans
  // BiblioSheet arrive au format base ({n, cat, s, r, rest, ...}) et se
  // convertit en ligne de séance ({nom, series, reps, repos, ...}).
  const addExFromBiblio = (ex) => {
    if (exercices.find(e => e.nom === ex.n)) return;
    const { sets, reps, rest } = parseScheme(ex.scheme || `${ex.s}×${ex.r} · ${ex.rest}`);
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices = u.jours[jourIdx].exercices || [];
    u.jours[jourIdx].exercices.push({
      id: ex.id || ex.n, nom: ex.n, cat: ex.cat,
      series: String(sets), reps: String(reps), repos: String(rest),
      methode:"Standard", tempo:"", historique: [], note:"",
    });
    setProg(u);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:320, background:C.bg,
      display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Styles des composants ExCard/BiblioSheet (définis dans CreerKit.jsx) */}
      <style>{CREER_CSS}</style>

      {/* Retour — fixe en haut, hors du scroll */}
      <div style={{ display:"flex", alignItems:"center", gap:12,
        padding:"20px 16px 8px", flexShrink:0 }}>
        <button onClick={onClose} style={{ width:38, height:38, borderRadius:12,
          background:C.s1, border:`1px solid ${C.bd}`, display:"grid", placeItems:"center",
          cursor:"pointer", flexShrink:0 }}>
          <I name="chevronLeft" size={18}/>
        </button>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:C.text, fontFamily:FONT }}>Modifier la séance</div>
          <div style={{ fontSize:12, color:C.dim, marginTop:1, fontFamily:FONT }}>Programme · {prog.titre ||"Mon programme"}</div>
        </div>
      </div>

      {/* Zone scrollable — minHeight:0 pour que le flex ne déborde pas sur iOS */}
      <div style={{ flex:1, minHeight:0, overflowY:"auto",
        WebkitOverflowScrolling:"touch", padding:"6px 16px 120px",
        maxWidth:500, margin:"0 auto", width:"100%", boxSizing:"border-box",
        overscrollBehavior:"contain", touchAction:"pan-y" }}
        className="mc-scroll">

          {/* Hero — même famille visuelle que ProgrammeView (Piste B) */}
          <div style={{ position:"relative", borderRadius:20, overflow:"hidden",
            padding:"16px 18px", marginBottom:16,
            background:"linear-gradient(140deg,#101318 0%,#101318 30%,#101318 65%,#101318 100%)",
            boxShadow:"0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(60,91,255,0.18)" }}>
            <div style={{ position:"absolute", top:-40, left:-20, width:140, height:140, borderRadius:"50%",
              background:"radial-gradient(circle,rgba(109,40,217,0.2),transparent 65%)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-30, right:10, width:120, height:120, borderRadius:"50%",
              background:"radial-gradient(circle,rgba(60,91,255,0.16),transparent 65%)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
              background:"linear-gradient(90deg,transparent,rgba(60,91,255,0.55),transparent)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:99,
                  background:"linear-gradient(135deg,rgba(109,40,217,0.25),rgba(60,91,255,0.18))",
                  border:"1px solid rgba(60,91,255,0.35)",
                  fontSize:10, fontWeight:800, letterSpacing:"0.08em", color:"#C9D3FF", fontFamily:FONT }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:int.c }}/>
                  {(int.l ||"").toUpperCase()}
                </span>
                {jour.focus && (
                  <span style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.55)", fontFamily:FONT }}>{jour.focus}</span>
                )}
              </div>
              <div style={{ fontSize:23, fontWeight:800, letterSpacing:-0.3, color:"#FFF", lineHeight:1.15,
                marginBottom:14, fontFamily:FONT }}>
                {localName ||"Séance"}
              </div>
              <div style={{ display:"flex", gap:20 }}>
                {[
                  { v: dur ? `~${dur}` :"—", u:"MIN" },
                  { v: exercices.length, u:"EXERCICES" },
                  { v: totalSeries, u:"SÉRIES" },
                ].map(s => (
                  <div key={s.u}>
                    <div style={{ fontSize:19, fontWeight:800, color:"#FFF", letterSpacing:-0.2, fontFamily:FONT }}>{s.v}</div>
                    <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:"0.04em", color:"rgba(255,255,255,0.45)",
                      marginTop:2, fontFamily:FONT }}>{s.u}</div>
                  </div>
))}
              </div>
            </div>
          </div>

          {/* Renommer la séance */}
          <div style={{ display:"flex", alignItems:"center", gap:12, background:C.s1,
            border:`1px solid ${C.bd}`, borderRadius:14, padding:"12px 14px", marginBottom:16 }}>
            <span style={{ flexShrink:0 }}><I name="edit" size={14} color={C.dim}/></span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase",
                color:C.dim, marginBottom:4, fontFamily:FONT }}>Nom de la séance</div>
              <input value={localName} onChange={e=>updateName(e.target.value)}
                autoComplete="off" autoCorrect="off" data-form-type="other"
                style={{ width:"100%", background:"none", border:"none", color:C.text,
                  fontFamily:FONT, fontSize:15, fontWeight:700, outline:"none", padding:0 }}/>
            </div>
          </div>

          {/* Exercices */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text, fontFamily:FONT }}>Exercices</div>
            <div style={{ fontSize:11.5, fontWeight:700, color:C.dim, fontFamily:FONT }}>{exercices.length}</div>
          </div>

          {exercices.length === 0 && (
            <div style={{ borderRadius:20, padding:"32px 16px", textAlign:"center",
              background:"rgba(0,0,0,0.03)", border:`1px dashed ${C.bd}`, marginBottom:12 }}>
              <div style={{ fontSize:13, color:C.dim, fontFamily:FONT }}>Aucun exercice — ajoute le premier ci-dessous</div>
            </div>
)}

          {exercices.map((ex, k) => (
            <ExCard key={ex.id || `${ex.nom}-${k}`} ex={ex}
              onUpdate={u => updateExAt(k, u)}
              onRemove={() => removeExAt(k)}/>
))}

          {/* Bouton Ajouter — bleu plein comme les CTA principaux de l'app */}
          <button onClick={() => setShowBiblio(true)} style={{
            width:"100%", cursor:"pointer", fontFamily:FONT, fontWeight:700, fontSize:14,
            padding:"16px", borderRadius:16, border:"none",
            background:`linear-gradient(135deg,${C.accent},${C.accentDk || "#2E48D9"})`,
            color:"#FFF",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            marginTop:4, boxShadow:"0 6px 18px rgba(60,91,255,0.3)",
          }}>
            <span style={{ fontSize:18, lineHeight:1 }}>+</span> Ajouter un exercice
          </button>
      </div>

      {/* Bibliothèque — BiblioSheet réel du créateur, sans aucune modification */}
      {showBiblio && (
        <BiblioSheet
          onClose={() => setShowBiblio(false)}
          onAdd={addExFromBiblio}
          addedNoms={exercices.map(e => e.nom)}
        />
)}
    </div>
);
}

// ─── PROGRAMMEVIEW : liste multi-programmes + création ──────────────────────
