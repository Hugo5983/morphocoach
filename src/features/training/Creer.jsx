import { useState } from "react";
import { C, INT, FONT, SERIF } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Tabs } from "../../components/ui/Tabs.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────
const DISP  = FONT;
const SERIF_F = SERIF;
const DAYS  = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

const SPLITS = [
  { id:"fullbody", name:"Full body",       desc:"Tout le corps à chaque séance", days:3,
    preset:["Lun","Mer","Ven"], names:{Lun:"Full body A",Mer:"Full body B",Ven:"Full body C"} },
  { id:"hautbas",  name:"Haut / Bas",      desc:"Alternance haut et bas du corps", days:4,
    preset:["Lun","Mar","Jeu","Ven"], names:{Lun:"Haut du corps",Mar:"Bas du corps",Jeu:"Haut du corps",Ven:"Bas du corps"} },
  { id:"ppl",      name:"Push · Pull · Legs", desc:"Poussée, tirage, jambes", days:6,
    preset:["Lun","Mar","Mer","Ven","Sam","Dim"], names:{Lun:"Push",Mar:"Pull",Mer:"Legs",Ven:"Push",Sam:"Pull",Dim:"Legs"} },
  { id:"custom",   name:"Personnalisé",    desc:"Tu organises tout toi-même", days:0, preset:null, names:{} },
];

const INT_COLORS = { leger:"#5FE0A5", modere:"#4D8BFF", lourd:"#FFAB5D", intense:"#FF7A6B", mobilite:"#B69DFF" };
const CAT_COLORS = { principal:"#4D8BFF", correctif:"#FF7A6B", gainage:"#5FE0A5", isolation:"#B69DFF", mobilite:"#06b6d4" };
const cc = cat => CAT_COLORS[cat] || "#4D8BFF";

// ─── Icônes SVG ────────────────────────────────────────────────────────────────
function I({ d, size=18, color="currentColor", sw=1.8 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}
const ic = {
  chev:  <path d="m9 18 6-6-6-6"/>,
  check: <polyline points="20 6 9 17 4 12"/>,
  plus:  <path d="M12 5v14M5 12h14"/>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></>,
  edit:  <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  back:  <path d="m15 18-6-6 6-6"/>,
  x:     <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  dumbbell: <path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/>,
};

// ─── Stepper +/- ──────────────────────────────────────────────────────────────
function Stepper({ label, value, onChange, min=1, step=1, unit="" }) {
  const n = parseFloat(value) || 0;
  return (
    <div style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"10px 8px" }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:"1.2px", color:"rgba(242,244,247,0.30)", textTransform:"uppercase", textAlign:"center", fontFamily:DISP, marginBottom:8 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <button onClick={() => onChange(String(Math.max(min, n - step)))} style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", color:"rgba(242,244,247,0.60)", cursor:"pointer", fontSize:16, display:"grid", placeItems:"center" }}>−</button>
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ flex:1, background:"transparent", border:"none", outline:"none", textAlign:"center", color:"#F2F4F7", fontSize:15, fontWeight:800, fontFamily:DISP }}/>
        <button onClick={() => onChange(String(n + step))} style={{ width:28, height:28, borderRadius:8, background:C.accent, border:"none", color:"#fff", cursor:"pointer", fontSize:16, display:"grid", placeItems:"center" }}>+</button>
      </div>
      {unit && <div style={{ fontSize:9, color:"rgba(242,244,247,0.25)", textAlign:"center", marginTop:4, fontFamily:DISP }}>{unit}</div>}
    </div>
  );
}

// ─── BARRE DE PROGRESSION ─────────────────────────────────────────────────────
function ProgressBar({ step, total=4 }) {
  return (
    <div style={{ display:"flex", gap:5, padding:"0 20px 14px" }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{ flex:1, height:4, borderRadius:99, background:i < step ? C.accent : "rgba(255,255,255,0.08)", overflow:"hidden" }}>
          {i < step && <div style={{ height:"100%", background:`linear-gradient(90deg,#5b86ff,#3b82f6)`, borderRadius:99 }}/>}
        </div>
      ))}
    </div>
  );
}

// ─── CARD SPLIT ───────────────────────────────────────────────────────────────
function SplitCard({ split, selected, onSelect }) {
  return (
    <button onClick={() => onSelect(split.id)} style={{
      width:"100%", display:"flex", alignItems:"center", gap:14, textAlign:"left",
      padding:"16px 18px", borderRadius:18, cursor:"pointer", fontFamily:DISP,
      background: selected ? "rgba(59,130,246,0.10)" : "rgba(255,255,255,0.03)",
      border: `1.5px solid ${selected ? C.accent : "rgba(255,255,255,0.07)"}`,
      marginBottom:10, transition:"all .15s",
    }}>
      <div style={{ width:24, height:24, borderRadius:"50%", flexShrink:0, border:`2px solid ${selected ? C.accent : "rgba(255,255,255,0.20)"}`, background: selected ? C.accent : "transparent", display:"grid", placeItems:"center" }}>
        {selected && <I d={ic.check} size={12} color="#fff" sw={3}/>}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#F2F4F7", marginBottom:2 }}>{split.name}</div>
        <div style={{ fontSize:12, color:"rgba(242,244,247,0.45)" }}>{split.desc}</div>
      </div>
      {split.days > 0 && <div style={{ fontSize:11, fontWeight:700, color:"rgba(242,244,247,0.30)", fontFamily:DISP }}>{split.days}j/sem</div>}
    </button>
  );
}

// ─── EXERCICE CARD (dans la séance) ──────────────────────────────────────────
function ExCard({ ex, idx, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const intColor = cc(ex.cat);
  const METHODS = ["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif","Pré-fatigue","Wave loading"];

  return (
    <div style={{ background:"#111827", border:`1px solid rgba(255,255,255,0.07)`, borderLeft:`3px solid ${intColor}`, borderRadius:16, marginBottom:10, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"13px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ flex:1, cursor:"pointer" }} onClick={() => setExpanded(e => !e)}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.8px", color:intColor, textTransform:"uppercase", fontFamily:DISP, marginBottom:3 }}>{ex.cat}</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#F2F4F7", fontFamily:DISP, letterSpacing:-0.2 }}>{ex.nom}</div>
          <div style={{ fontSize:11, color:"rgba(242,244,247,0.40)", marginTop:2, fontFamily:DISP }}>{ex.series}×{ex.reps} · {ex.repos}s{ex.methode && ex.methode !== "Classique" ? ` · ${ex.methode}` : ""}</div>
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{ width:30, height:30, borderRadius:9, background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.18)", color:C.accent, cursor:"pointer", display:"grid", placeItems:"center" }}>
          <I d={ic.edit} size={13} color={C.accent} sw={2}/>
        </button>
        <button onClick={onRemove} style={{ width:30, height:30, borderRadius:9, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.18)", color:"#FF7A6B", cursor:"pointer", display:"grid", placeItems:"center" }}>
          <I d={ic.trash} size={13} color="#FF7A6B" sw={2}/>
        </button>
      </div>

      {/* Éditeur étendu */}
      {expanded && (
        <div style={{ padding:"14px 14px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <Stepper label="Séries" value={ex.series} onChange={v => onUpdate({...ex, series:v})} min={1}/>
            <Stepper label="Reps" value={ex.reps} onChange={v => onUpdate({...ex, reps:v})} min={1}/>
            <Stepper label="Repos" value={ex.repos} onChange={v => onUpdate({...ex, repos:v})} min={0} step={15} unit="sec"/>
          </div>
          {/* Tempo */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"1px", color:"rgba(242,244,247,0.30)", textTransform:"uppercase", fontFamily:DISP, marginBottom:6 }}>Tempo (montée·contraction·descente)</div>
            <input value={ex.tempo || ""} onChange={e => onUpdate({...ex, tempo:e.target.value})} placeholder="Ex: 2-1-3"
              style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, color:"#F2F4F7", fontSize:13, fontFamily:DISP, outline:"none", boxSizing:"border-box" }}/>
          </div>
          {/* Méthodes */}
          <div>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"1px", color:"rgba(242,244,247,0.30)", textTransform:"uppercase", fontFamily:DISP, marginBottom:8 }}>Méthode d'intensification</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {METHODS.map(m => (
                <button key={m} onClick={() => onUpdate({...ex, methode:m})} style={{
                  padding:"5px 11px", borderRadius:20, cursor:"pointer", fontFamily:DISP, fontSize:11,
                  background: ex.methode===m ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${ex.methode===m ? "rgba(59,130,246,0.40)" : "rgba(255,255,255,0.08)"}`,
                  color: ex.methode===m ? "#93C5FD" : "rgba(242,244,247,0.40)",
                  fontWeight: ex.methode===m ? 700 : 400,
                }}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BIBLIOTHÈQUE (bottom sheet) ──────────────────────────────────────────────
function BiblioSheet({ onClose, onAdd, addedNoms }) {
  const [search,       setSearch]       = useState("");
  const [groupe,       setGroupe]       = useState(Object.keys(EX)[0]);
  const [guideEx,      setGuideEx]      = useState(null);
  const [guideTab,     setGuideTab]     = useState("tips");

  const list = search
    ? Object.entries(EX).flatMap(([g,arr]) => arr.map(ex => ({...ex, group:g})))
        .filter(e => e.n.toLowerCase().includes(search.toLowerCase()))
    : (EX[groupe] || []).map(ex => ({...ex, group:groupe}));

  if (guideEx) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(7,10,18,0.98)", zIndex:500, overflowY:"auto" }}>
      <div style={{ maxWidth:500, margin:"0 auto", padding:"20px 16px 80px" }}>
        <button onClick={() => setGuideEx(null)} style={{ background:"transparent", border:"none", color:C.accent, cursor:"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:4, marginBottom:16, fontFamily:DISP }}>
          <I d={ic.back} size={15} color={C.accent} sw={2}/> Retour
        </button>
        <div style={{ fontSize:10, fontWeight:700, color:cc(guideEx.cat), letterSpacing:"1px", textTransform:"uppercase", fontFamily:DISP, marginBottom:5 }}>{guideEx.cat}</div>
        <div style={{ fontFamily:SERIF_F, fontSize:22, color:"#F2F4F7", marginBottom:14 }}>{guideEx.n}</div>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[{l:"Séries",v:guideEx.s},{l:"Reps",v:guideEx.r},{l:"Repos",v:guideEx.rest},{l:"Charge",v:guideEx.ch}].map(s => (
            <div key={s.l} style={{ flex:1, padding:"10px 6px", background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.accent, fontFamily:DISP }}>{s.v}</div>
              <div style={{ fontSize:9, color:"rgba(242,244,247,0.40)", marginTop:2, fontFamily:DISP }}>{s.l}</div>
            </div>
          ))}
        </div>
        <Tabs items={[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}]} value={guideTab} onChange={setGuideTab}/>
        <div style={{ padding:"12px 0" }}>
          {guideTab==="tips" && (guideEx.tips||[]).map((tip,i,arr) => (
            <div key={i} style={{ display:"flex", gap:12, paddingBottom:14, marginBottom:14, borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.06)":"none" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(59,130,246,0.10)", border:"1px solid rgba(59,130,246,0.20)", display:"grid", placeItems:"center", flexShrink:0, fontSize:10, fontWeight:700, color:C.accent }}>{i+1}</div>
              <div style={{ fontSize:12, color:"#F2F4F7", lineHeight:1.7 }}>{tip}</div>
            </div>
          ))}
          {guideTab==="variantes" && (guideEx.variantes||[]).map((v,i) => (
            <div key={i} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:14, marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#F2F4F7", marginBottom:4 }}>{v.nom||v}</div>
              {v.note && <div style={{ fontSize:11, color:"rgba(242,244,247,0.50)", lineHeight:1.5 }}>{v.note}</div>}
            </div>
          ))}
          {guideTab==="erreurs" && (guideEx.erreurs||[]).map((e,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(248,113,113,0.10)", border:"1px solid rgba(248,113,113,0.25)", display:"grid", placeItems:"center", flexShrink:0, fontSize:10, color:"#FF7A6B" }}>✕</div>
              <div style={{ fontSize:12, color:"#F2F4F7", lineHeight:1.6 }}>{e}</div>
            </div>
          ))}
          {guideTab==="morpho" && (guideEx.morpho||"").split('\n').filter(Boolean).map((line,i,arr) => (
            <div key={i} style={{ display:"flex", gap:8, paddingBottom:10, marginBottom:10, borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.06)":"none", alignItems:"flex-start" }}>
              <div style={{ fontSize:14, flexShrink:0 }}>{line.split(':')[0].trim()}</div>
              <div style={{ fontSize:11, color:"#F2F4F7", lineHeight:1.6, flex:1 }}>{line.split(':').slice(1).join(':').trim()}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { onAdd(guideEx); setGuideEx(null); }} style={{
          width:"100%", padding:15, borderRadius:16, border:"none", cursor:"pointer",
          background: addedNoms.includes(guideEx.n) ? "rgba(52,211,153,0.12)" : `linear-gradient(135deg,#1D4ED8,#3B82F6)`,
          color: addedNoms.includes(guideEx.n) ? "#34d399" : "#fff",
          fontSize:14, fontWeight:700, fontFamily:DISP,
          border: addedNoms.includes(guideEx.n) ? "1px solid rgba(52,211,153,0.30)" : "none",
        }}>
          {addedNoms.includes(guideEx.n) ? "✓ Déjà ajouté" : "+ Ajouter cet exercice"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(5,8,18,0.80)", backdropFilter:"blur(6px)", zIndex:300 }}/>
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:450,
        background:"#111827", border:"1px solid rgba(255,255,255,0.08)", borderBottom:"none",
        borderRadius:"24px 24px 0 0", zIndex:301,
        height:"80vh", display:"flex", flexDirection:"column",
        boxShadow:"0 -20px 60px rgba(0,0,0,0.6)",
      }}>
        {/* Handle */}
        <div style={{ padding:"12px 0 0", display:"flex", justifyContent:"center" }}>
          <div style={{ width:36, height:4, borderRadius:99, background:"rgba(255,255,255,0.15)" }}/>
        </div>
        {/* Header */}
        <div style={{ padding:"10px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily:SERIF_F, fontSize:20, color:"#F2F4F7" }}>Ajouter un exercice</div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(242,244,247,0.45)", fontSize:18, display:"grid", placeItems:"center", cursor:"pointer" }}>×</button>
        </div>
        {/* Search */}
        <div style={{ padding:"12px 20px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"10px 14px" }}>
            <span style={{ color:"rgba(242,244,247,0.30)", fontSize:14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un exercice…"
              style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#F2F4F7", fontSize:13, fontFamily:DISP }}/>
          </div>
        </div>
        {/* Groupes musculaires */}
        {!search && (
          <div style={{ display:"flex", gap:7, padding:"10px 20px 2px", overflowX:"auto", flexShrink:0 }}>
            {Object.keys(EX).map(g => (
              <button key={g} onClick={() => setGroupe(g)} style={{
                padding:"7px 14px", borderRadius:20, border:`1px solid ${groupe===g ? C.accent : "rgba(255,255,255,0.08)"}`,
                background: groupe===g ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                color: groupe===g ? "#93C5FD" : "rgba(242,244,247,0.45)",
                fontSize:12, fontWeight: groupe===g ? 700 : 400, cursor:"pointer", fontFamily:DISP, whiteSpace:"nowrap",
                flexShrink:0,
              }}>{g}</button>
            ))}
          </div>
        )}
        {/* Liste exercices */}
        <div style={{ flex:1, overflowY:"auto", padding:"12px 20px 24px" }}>
          {list.map((ex, i) => {
            const isAdded = addedNoms.includes(ex.n);
            const color = cc(ex.cat);
            return (
              <div key={i} style={{ background:"#0B1220", border:`1px solid ${isAdded ? "rgba(52,211,153,0.30)" : "rgba(255,255,255,0.07)"}`, borderRadius:16, padding:"14px 14px", marginBottom:10 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.8px", color, textTransform:"uppercase", fontFamily:DISP, marginBottom:4 }}>{ex.cat}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#F2F4F7", fontFamily:DISP, marginBottom:3 }}>{ex.n}</div>
                <div style={{ fontSize:11, color:"rgba(242,244,247,0.40)", fontFamily:DISP, marginBottom:12 }}>{ex.s}×{ex.r} · {ex.rest}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => onAdd(ex)} style={{
                    flex:1, padding:"10px", borderRadius:11, border:"none", cursor:"pointer", fontFamily:DISP, fontSize:13, fontWeight:700,
                    background: isAdded ? "rgba(52,211,153,0.10)" : `linear-gradient(135deg,#1D4ED8,#3B82F6)`,
                    color: isAdded ? "#34d399" : "#fff",
                    border: isAdded ? "1px solid rgba(52,211,153,0.25)" : "none",
                  }}>
                    {isAdded ? "✓ Ajouté" : "+ Ajouter"}
                  </button>
                  <button onClick={() => setGuideEx(ex)} style={{ padding:"10px 14px", borderRadius:11, background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.18)", color:"#93C5FD", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:DISP }}>
                    Guide →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── RÉCAP FINAL ──────────────────────────────────────────────────────────────
function Recap({ newP, onBack, onSave }) {
  const jours = newP.jours || [];
  const totalEx = jours.reduce((a,j) => a + (newP.seances?.[j]?.exercices?.length || 0), 0);

  return (
    <div style={{ padding:"0 16px" }}>
      <button onClick={onBack} style={{ background:"transparent", border:"none", color:C.accent, cursor:"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:4, marginBottom:20, fontFamily:DISP }}>
        <I d={ic.back} size={15} color={C.accent} sw={2}/> Retour
      </button>

      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", color:C.accent, textTransform:"uppercase", fontFamily:DISP, marginBottom:6 }}>RÉCAPITULATIF</div>
        <div style={{ fontFamily:SERIF_F, fontSize:28, color:"#F2F4F7", letterSpacing:-1, lineHeight:1.1 }}>
          Ton <span style={{ fontStyle:"italic", color:C.accent }}>programme</span>
        </div>
      </div>

      {/* Infos globales */}
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        {[
          { l:"Programme", v:newP.nom, c:"#93C5FD" },
          { l:"Séances/sem", v:jours.length, c:"#34D399" },
          { l:"Exercices", v:totalEx, c:"#FBBF24" },
        ].map(s => (
          <div key={s.l} style={{ flex:1, background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"14px 10px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.c, fontFamily:DISP, letterSpacing:-0.5 }}>{s.v}</div>
            <div style={{ fontSize:10, color:"rgba(242,244,247,0.35)", marginTop:4, fontFamily:DISP }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Détail jours */}
      <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, overflow:"hidden", marginBottom:20 }}>
        {jours.map((j, i) => {
          const sean = newP.seances?.[j] || {};
          const nEx  = sean.exercices?.length || 0;
          const intC = INT_COLORS[sean.intensite || "modere"];
          const missing = !sean.nom || nEx === 0;
          return (
            <div key={j} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderBottom:i<jours.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
              <div style={{ width:44, height:44, borderRadius:13, flexShrink:0, display:"grid", placeItems:"center",
                background: missing ? "rgba(248,113,113,0.10)" : "rgba(59,130,246,0.10)",
                border: `1px solid ${missing ? "rgba(248,113,113,0.25)" : "rgba(59,130,246,0.20)"}`,
              }}>
                <div style={{ fontSize:13, fontWeight:800, color: missing ? "#F87171" : "#93C5FD", fontFamily:DISP }}>{j}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#F2F4F7", fontFamily:DISP, marginBottom:2 }}>{sean.nom || `Séance ${j}`}</div>
                <div style={{ fontSize:10, fontWeight:700, color: missing ? "#F87171" : intC, fontFamily:DISP, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  {missing ? "⚠ Aucun exercice" : `${nEx} exercice${nEx>1?"s":""}`}
                </div>
              </div>
              {!missing && (
                <div style={{ fontSize:12, fontWeight:700, color:"rgba(242,244,247,0.40)", fontFamily:DISP }}>
                  {(newP.seances?.[j]?.intensite || "modere").charAt(0).toUpperCase() + (newP.seances?.[j]?.intensite || "modere").slice(1)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <button onClick={onSave} style={{
        width:"100%", padding:16, borderRadius:18, border:"none", cursor:"pointer",
        background:"linear-gradient(135deg,#1D4ED8,#3B82F6)", color:"#fff",
        fontSize:15, fontWeight:700, fontFamily:DISP, marginBottom:10,
        boxShadow:"0 8px 24px rgba(59,130,246,0.35)",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      }}>
        <I d={ic.check} size={18} color="#fff" sw={2.5}/> Enregistrer le programme
      </button>
    </div>
  );
}

// ─── STEP 1 : NOM + SPLIT ─────────────────────────────────────────────────────
function Step1({ newP, setNewP, onNext, onCancel }) {
  return (
    <div style={{ padding:"0 16px" }}>
      {/* Titre */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", color:C.accent, textTransform:"uppercase", fontFamily:DISP, marginBottom:6 }}>ÉTAPE 1/4</div>
        <div style={{ fontFamily:SERIF_F, fontSize:28, color:"#F2F4F7", letterSpacing:-1, lineHeight:1.1 }}>
          Nom & <span style={{ fontStyle:"italic", color:C.accent }}>structure</span>
        </div>
        <div style={{ fontSize:12, color:"rgba(242,244,247,0.40)", marginTop:6, fontFamily:DISP }}>Donne un nom à ton programme et choisis ta structure.</div>
      </div>

      {/* Nom */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"1.5px", color:"rgba(242,244,247,0.35)", textTransform:"uppercase", fontFamily:DISP, marginBottom:8 }}>NOM DU PROGRAMME</div>
        <input value={newP.nom} onChange={e => setNewP({...newP, nom:e.target.value})}
          placeholder="Ex: Hypertrophie Printemps 2025"
          style={{ width:"100%", padding:"16px 18px", background:"rgba(255,255,255,0.04)", border:`1px solid ${newP.nom ? "rgba(59,130,246,0.40)" : "rgba(255,255,255,0.08)"}`, borderRadius:16, color:"#F2F4F7", fontSize:15, fontFamily:DISP, outline:"none", boxSizing:"border-box", transition:"border .15s" }}
        />
      </div>

      {/* Split */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"1.5px", color:"rgba(242,244,247,0.35)", textTransform:"uppercase", fontFamily:DISP, marginBottom:10 }}>STRUCTURE (SPLIT)</div>
        {SPLITS.map(s => (
          <SplitCard key={s.id} split={s} selected={newP.split === s.id} onSelect={id => {
            const sp = SPLITS.find(x => x.id===id);
            setNewP({...newP, split:id, jours:sp.preset || [], seances:{}});
          }}/>
        ))}
      </div>

      {/* Footer */}
      <button disabled={!newP.nom || !newP.split} onClick={onNext} style={{
        width:"100%", padding:16, borderRadius:18, border:"none", cursor: !newP.nom || !newP.split ? "not-allowed" : "pointer",
        background: !newP.nom || !newP.split ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#1D4ED8,#3B82F6)",
        color: !newP.nom || !newP.split ? "rgba(242,244,247,0.25)" : "#fff",
        fontSize:15, fontWeight:700, fontFamily:DISP, marginBottom:10,
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      }}>
        Suivant <I d={ic.chev} size={16} color="currentColor" sw={2.5}/>
      </button>
      {onCancel && (
        <button onClick={onCancel} style={{ width:"100%", padding:13, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, color:"rgba(242,244,247,0.35)", cursor:"pointer", fontSize:13, fontFamily:DISP }}>Annuler</button>
      )}
    </div>
  );
}

// ─── STEP 2 : JOURS ───────────────────────────────────────────────────────────
function Step2({ newP, setNewP, onNext, onBack }) {
  const splitObj = SPLITS.find(s => s.id === newP.split);
  return (
    <div style={{ padding:"0 16px" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", color:C.accent, textTransform:"uppercase", fontFamily:DISP, marginBottom:6 }}>ÉTAPE 2/4</div>
        <div style={{ fontFamily:SERIF_F, fontSize:28, color:"#F2F4F7", letterSpacing:-1, lineHeight:1.1 }}>
          Tes <span style={{ fontStyle:"italic", color:C.accent }}>jours</span>
        </div>
        <div style={{ fontSize:12, color:"rgba(242,244,247,0.40)", marginTop:6, fontFamily:DISP }}>
          {splitObj?.days > 0 ? `${splitObj.name} · ${splitObj.days} jours suggérés` : "Choisis tes jours d'entraînement"}
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:28 }}>
        {DAYS.map(j => {
          const on = newP.jours.includes(j);
          return (
            <button key={j} onClick={() => setNewP(p => ({
              ...p,
              jours: on ? p.jours.filter(x=>x!==j) : [...p.jours,j],
            }))} style={{
              padding:"12px 20px", borderRadius:14, cursor:"pointer", fontFamily:DISP, fontSize:15, fontWeight:700,
              background: on ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${on ? C.accent : "rgba(255,255,255,0.08)"}`,
              color: on ? "#93C5FD" : "rgba(242,244,247,0.50)", transition:"all .15s",
            }}>{j}</button>
          );
        })}
      </div>

      <button disabled={newP.jours.length===0} onClick={onNext} style={{
        width:"100%", padding:16, borderRadius:18, border:"none", cursor: newP.jours.length===0 ? "not-allowed" : "pointer",
        background: newP.jours.length===0 ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#1D4ED8,#3B82F6)",
        color: newP.jours.length===0 ? "rgba(242,244,247,0.25)" : "#fff",
        fontSize:15, fontWeight:700, fontFamily:DISP, marginBottom:10,
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      }}>
        Construire les séances <I d={ic.chev} size={16} color="currentColor" sw={2.5}/>
      </button>
      <button onClick={onBack} style={{ width:"100%", padding:13, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, color:"rgba(242,244,247,0.35)", cursor:"pointer", fontSize:13, fontFamily:DISP }}>← Retour</button>
    </div>
  );
}

// ─── STEP 3 : SÉANCES + EXERCICES ────────────────────────────────────────────
function Step3({ newP, setNewP, onNext, onBack }) {
  const [jourActif, setJourActif] = useState(newP.jours[0] || "Lun");
  const [showBiblio, setShowBiblio] = useState(false);

  const jc   = jourActif;
  const sean = newP.seances?.[jc] || { nom:"", intensite:"modere", exercices:[] };

  const setSean = (fn) => setNewP(p => ({
    ...p, seances:{ ...p.seances, [jc]: fn(p.seances?.[jc] || { nom:"", intensite:"modere", exercices:[] }) }
  }));

  const addEx = (ex) => {
    if (sean.exercices.find(e => e.nom===ex.n)) return;
    const splitObj = SPLITS.find(s => s.id === newP.split);
    const nomSean = splitObj?.names?.[jc] || "";
    setSean(s => ({
      ...s,
      nom: s.nom || nomSean,
      exercices: [...s.exercices, { nom:ex.n, cat:ex.cat, series:ex.s, reps:ex.r, repos:parseInt(ex.rest)||90, charge:ex.ch, methode:"Classique", tempo:"", historique:[], note:"" }]
    }));
  };

  const updateEx = (idx, updated) => setSean(s => ({ ...s, exercices:s.exercices.map((e,i) => i===idx ? updated : e) }));
  const removeEx = (idx)           => setSean(s => ({ ...s, exercices:s.exercices.filter((_,i) => i!==idx) }));

  const addedNoms = sean.exercices.map(e => e.nom);
  const totalEx = newP.jours.reduce((a,j) => a + (newP.seances?.[j]?.exercices?.length||0), 0);

  return (
    <>
      <div style={{ padding:"0 16px" }}>
        {/* Header */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", color:C.accent, textTransform:"uppercase", fontFamily:DISP, marginBottom:6 }}>ÉTAPE 3/4</div>
          <div style={{ fontFamily:SERIF_F, fontSize:26, color:"#F2F4F7", letterSpacing:-1, lineHeight:1.1 }}>
            Tes <span style={{ fontStyle:"italic", color:C.accent }}>séances</span>
          </div>
        </div>

        {/* Tabs jours */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", marginBottom:16, paddingBottom:2 }}>
          {newP.jours.map(j => {
            const nEx = newP.seances?.[j]?.exercices?.length || 0;
            const on  = jc === j;
            return (
              <button key={j} onClick={() => setJourActif(j)} style={{
                padding:"9px 16px", borderRadius:12, cursor:"pointer", fontFamily:DISP, fontSize:13, fontWeight:700,
                background: on ? C.accent : "rgba(255,255,255,0.04)",
                border: `1px solid ${on ? C.accent : "rgba(255,255,255,0.08)"}`,
                color: on ? "#fff" : "rgba(242,244,247,0.50)",
                flexShrink:0, whiteSpace:"nowrap", transition:"all .15s",
                position:"relative",
              }}>
                {j} {nEx > 0 && <span style={{ fontSize:10, opacity:0.75 }}>({nEx})</span>}
                {nEx > 0 && !on && <div style={{ position:"absolute", top:4, right:5, width:5, height:5, borderRadius:"50%", background:"#34D399" }}/>}
              </button>
            );
          })}
        </div>

        {/* Nom séance */}
        <input value={sean.nom || ""} onChange={e => setSean(s => ({...s, nom:e.target.value}))}
          placeholder={`Nom de la séance ${jc}`}
          style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, color:"#F2F4F7", fontSize:14, fontFamily:DISP, outline:"none", boxSizing:"border-box", marginBottom:12 }}
        />

        {/* Intensité */}
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
          {Object.entries(INT).map(([k,v]) => (
            <button key={k} onClick={() => setSean(s => ({...s, intensite:k}))} style={{
              padding:"8px 14px", borderRadius:20, cursor:"pointer", fontFamily:DISP, fontSize:12, fontWeight:700,
              background: sean.intensite===k ? `${v.c}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${sean.intensite===k ? v.c + "60" : "rgba(255,255,255,0.08)"}`,
              color: sean.intensite===k ? v.c : "rgba(242,244,247,0.45)",
            }}>{v.l}</button>
          ))}
        </div>

        {/* Exercices */}
        {sean.exercices.map((ex, idx) => (
          <ExCard key={idx} ex={ex} idx={idx} onUpdate={u => updateEx(idx, u)} onRemove={() => removeEx(idx)}/>
        ))}

        {/* Bouton ajouter exercice */}
        <button onClick={() => setShowBiblio(true)} style={{
          width:"100%", padding:16, background:"rgba(59,130,246,0.06)", border:"1.5px dashed rgba(59,130,246,0.25)",
          borderRadius:18, cursor:"pointer", fontSize:14, fontWeight:700, color:"rgba(96,165,250,0.80)",
          fontFamily:DISP, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:24,
        }}>
          <I d={ic.plus} size={16} color="rgba(96,165,250,0.80)" sw={2.5}/> Ajouter un exercice
        </button>

        {/* Footer */}
        <button onClick={onNext} style={{
          width:"100%", padding:16, borderRadius:18, border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#1D4ED8,#3B82F6)", color:"#fff",
          fontSize:15, fontWeight:700, fontFamily:DISP, marginBottom:10,
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          boxShadow:"0 8px 24px rgba(59,130,246,0.30)",
        }}>
          Voir le récapitulatif · {totalEx} ex. <I d={ic.chev} size={16} color="currentColor" sw={2.5}/>
        </button>
        <button onClick={onBack} style={{ width:"100%", padding:13, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, color:"rgba(242,244,247,0.35)", cursor:"pointer", fontSize:13, fontFamily:DISP }}>← Retour</button>
      </div>

      {/* Bibliothèque */}
      {showBiblio && <BiblioSheet onClose={() => setShowBiblio(false)} onAdd={addEx} addedNoms={addedNoms}/>}
    </>
  );
}

// ─── CREER — ORCHESTRATEUR ────────────────────────────────────────────────────
export default function Creer(props) {
  const { setProg, setCycleStart, push, setCalSess, INT, EX: _EX,
    setProgView, progs, setProgsAll, onCancel, setCS, newP, setNewP } = props;

  // localStep pilote le flow 4 étapes (indépendant de createStep legacy)
  const [localStep, setLocalStep] = useState(1);

  // Initialiser newP si vide
  const p = newP || { nom:"", split:null, jours:[], seances:{} };

  const handleSave = () => {
    const jours = p.jours.map((j, i) => ({
      id: i + 1,
      nom: p.seances[j]?.nom || `Séance ${j}`,
      focus: j, duree:"45-60 min",
      intensite: p.seances[j]?.intensite || "modere",
      exercices: (p.seances[j]?.exercices || []).map(ex => ({...ex, historique:[], note:""})),
      complete:false, date:null, note:"",
    }));
    const newProg = { titre:p.nom, type:"custom", id:`custom_${Date.now()}`, dateDebut:new Date().toLocaleDateString("fr-FR"), jours };
    if (setProgsAll) setProgsAll([...(progs||[]), newProg]);
    setProg(newProg);
    setCycleStart(Date.now());
    const today = new Date();
    const joursMap = { Lun:1, Mar:2, Mer:3, Jeu:4, Ven:5, Sam:6, Dim:0 };
    const newSess = {};
    jours.forEach(jour => {
      const match = Object.entries(joursMap).find(([k]) => jour.focus.startsWith(k));
      if (match) {
        for (let w=0; w<6; w++) {
          const d = new Date(today);
          d.setDate(d.getDate() + ((match[1] - d.getDay() + 7) % 7 || 7) + w*7);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          newSess[key] = { nom:jour.nom, intensite:jour.intensite||"modere", color:INT[jour.intensite||"modere"].c };
        }
      }
    });
    setCalSess(prev => ({...prev,...newSess}));
    setProgView("calendar");
    if (setCS) setCS(0);
    setNewP({ nom:"", split:null, jours:[], seances:{} });
    push("✅","Programme créé !",`${p.nom} · Calendrier mis à jour !`);
  };

  const goNext = (s) => { setLocalStep(s); if (setCS) setCS(s-1); };
  const goBack = (s) => { setLocalStep(s); if (setCS) setCS(s-1); };

  return (
    <div style={{ paddingTop:4 }}>
      <ProgressBar step={localStep} total={4}/>
      {localStep===1 && <Step1 newP={p} setNewP={setNewP} onNext={() => goNext(2)} onCancel={onCancel}/>}
      {localStep===2 && <Step2 newP={p} setNewP={setNewP} onNext={() => goNext(3)} onBack={() => goBack(1)}/>}
      {localStep===3 && <Step3 newP={p} setNewP={setNewP} onNext={() => goNext(4)} onBack={() => goBack(2)}/>}
      {localStep===4 && <Recap newP={p} onBack={() => goBack(3)} onSave={handleSave}/>}
    </div>
  );
}
