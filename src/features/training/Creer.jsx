import { useState, useMemo } from "react";
import { C, INT, FONT, SERIF } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Tabs } from "../../components/ui/Tabs.jsx";

// ─── Design tokens (fidèles à la maquette) ───────────────────────────────────
const BG    = "#070a12";
const BG2   = "#0a0e1a";
const CARD  = "#101626";
const CARDH = "#151d30";
const BD    = "rgba(255,255,255,.07)";
const BDH   = "rgba(96,135,255,.35)";
const PRI   = "#3f72ff";
const PRIB  = "#5b86ff";
const PRIS  = "rgba(63,114,255,.14)";
const PURP  = "#9a8cff";
const AMBER = "#f6a93b";
const GREEN = "#3ddc97";
const TEXT  = "#f1f4fb";
const MUTED = "#8b96ad";
const MUTED2= "#5b6580";
const F     = "'Plus Jakarta Sans','DM Sans',system-ui,sans-serif";
const SF    = "'Playfair Display','DM Serif Display',Georgia,serif";

const DAYS_ALL   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const SPLITS = [
  { id:"fullbody", name:"Full body",        desc:"Tout le corps à chaque séance", days:3,
    preset:["Lun","Mer","Ven"], names:{Lun:"Full body A",Mer:"Full body B",Ven:"Full body C"} },
  { id:"hautbas",  name:"Haut / Bas",       desc:"Alternance haut et bas du corps", days:4,
    preset:["Lun","Mar","Jeu","Ven"], names:{Lun:"Haut du corps",Mar:"Bas du corps",Jeu:"Haut du corps",Ven:"Bas du corps"} },
  { id:"ppl",      name:"Push · Pull · Legs",desc:"Poussée, tirage, jambes", days:6,
    preset:["Lun","Mar","Mer","Ven","Sam","Dim"], names:{Lun:"Push",Mar:"Pull",Mer:"Legs",Ven:"Push",Sam:"Pull",Dim:"Legs"} },
  { id:"custom",   name:"Personnalisé",      desc:"Tu organises tout toi-même", days:0, preset:null, names:{} },
];
const INTENSITIES = [
  {id:"leger",  label:"Léger",   color:GREEN},
  {id:"modere", label:"Modéré",  color:PRIB},
  {id:"lourd",  label:"Lourd",   color:AMBER},
  {id:"intense",label:"Intense", color:"#f87171"},
  {id:"mobilite",label:"Mobilité",color:PURP},
];
const METHODS = ["Standard","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif","Pré-fatigue","Wave loading"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseScheme = (scheme) => {
  const [left, right] = String(scheme || "3×10 · 60s").split("·").map(x => x.trim());
  const [sets, reps]  = (left || "3×10").split("×").map(x => x.trim());
  const rest = parseInt(String(right || "60").replace(/\D/g,""), 10);
  return { sets: parseInt(sets,10)||3, reps: reps||"10", rest: rest||60 };
};

const CAT_COLORS = { principal:PRIB, correctif:"#FF7A6B", gainage:GREEN, isolation:PURP, mobilite:"#06b6d4" };
const cc = cat => CAT_COLORS[cat] || PRIB;

// ─── CSS global injecté ───────────────────────────────────────────────────────
const CSS = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  .mc-fade { animation: fadeUp .35s ease both; }
  .mc-ex { background:${CARD};border:1px solid ${BD};border-radius:18px;padding:16px;margin-bottom:12px; }
  .mc-ex.principal { border-left:3px solid ${PRI}; }
  .mc-ex.isolation  { border-left:3px solid ${PURP}; }
  .mc-metrics { display:flex;gap:8px;margin-top:13px; }
  .mc-metric { flex:1;background:${BG2};border:1px solid ${BD};border-radius:13px;padding:9px 7px 10px; }
  .mc-m-lbl { display:block;text-align:center;font-size:10px;font-weight:800;letter-spacing:.9px;
    text-transform:uppercase;color:${MUTED2};margin-bottom:8px; }
  .mc-m-ctrl { display:flex;align-items:center;justify-content:space-between;gap:4px; }
  .mc-m-step { width:30px;height:30px;border-radius:9px;border:1px solid ${BD};background:${CARD};
    color:${MUTED};font-size:18px;font-weight:600;display:flex;align-items:center;justify-content:center;
    cursor:pointer;flex:0 0 auto;line-height:1;transition:.14s;padding:0; }
  .mc-m-step:active { transform:scale(.92); }
  .mc-m-val { font-size:15px;font-weight:800;color:${TEXT};text-align:center;flex:1; }
  .mc-m-input { width:100%;background:transparent;border:none;outline:none;text-align:center;
    font-family:inherit;font-size:15px;font-weight:800;color:${TEXT};padding:4px 0;border-radius:6px; }
  .mc-m-input:focus { background:rgba(63,114,255,.1); }
  .mc-opt-toggle { margin-top:11px;width:100%;cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;
    display:flex;align-items:center;gap:8px;color:${MUTED};
    background:transparent;border:none;padding:6px 2px;transition:.16s;letter-spacing:.2px; }
  .mc-opt-toggle:hover { color:${TEXT}; }
  .mc-opt-toggle.open { color:${PRIB}; }
  .mc-opt-caret { margin-left:auto;transition:transform .2s; }
  .mc-opt-toggle.open .mc-opt-caret { transform:rotate(180deg); }
  .mc-adv { margin-top:4px;padding-top:14px;border-top:1px solid ${BD};
    display:flex;flex-direction:column;gap:16px;animation:fadeUp .25s ease both; }
  .mc-adv-input { background:${BG2};border:1px solid ${BD};border-radius:11px;
    padding:12px 14px;font-family:inherit;font-size:15px;font-weight:700;color:${TEXT};
    outline:none;transition:.16s;letter-spacing:1px;width:100%;box-sizing:border-box; }
  .mc-adv-input:focus { border-color:${BDH};background:${CARDH}; }
  .mc-method-pill { cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;
    padding:8px 13px;border-radius:10px;border:1.5px solid ${BD};
    background:${BG2};color:${MUTED};transition:.14s; }
  .mc-method-pill.on { border-color:${PRI};color:${PRIB};background:${PRIS}; }
  .mc-ghost-del { width:42px;flex:0 0 auto;border-radius:12px;border:1px solid ${BD};background:transparent;
    color:${MUTED};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.16s; }
  .mc-ghost-del:hover { color:#ff6b6b;border-color:rgba(255,107,107,.4); }
  .mc-field { width:100%;background:${CARD};border:1px solid ${BD};border-radius:16px;
    padding:18px;font-size:16px;font-family:inherit;color:${TEXT};outline:none;transition:.18s;box-sizing:border-box; }
  .mc-field::placeholder { color:${MUTED2}; }
  .mc-field:focus { border-color:${BDH};background:${CARDH}; }
  .mc-split-card { display:flex;align-items:center;gap:14px;text-align:left;cursor:pointer;
    background:${CARD};border:1.5px solid ${BD};border-radius:17px;padding:16px 17px;
    transition:.18s;color:${TEXT};font-family:inherit;width:100%;margin-bottom:11px; }
  .mc-split-card.sel { border-color:${PRI};background:linear-gradient(120deg,rgba(63,114,255,.12),rgba(63,114,255,.03)); }
  .mc-split-tick { width:24px;height:24px;border-radius:50%;border:2px solid ${MUTED2};flex:0 0 auto;
    display:flex;align-items:center;justify-content:center;transition:.18s; }
  .mc-split-card.sel .mc-split-tick { background:${PRI};border-color:${PRI}; }
  .mc-pill { cursor:pointer;font-family:inherit;font-size:15px;font-weight:600;
    padding:12px 20px;border-radius:14px;border:1.5px solid ${BD};
    background:${CARD};color:${MUTED};transition:.16s; }
  .mc-pill.on { background:${PRIS};border-color:${PRI};color:${PRIB}; }
  .mc-small-pill { cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;
    padding:9px 16px;border-radius:11px;border:1.5px solid ${BD};
    background:${CARD};color:${MUTED};transition:.16s; }
  .mc-small-pill.green { border-color:${GREEN};color:${GREEN};background:rgba(61,220,151,.08); }
  .mc-small-pill.blue  { border-color:${PRI};color:${PRIB};background:${PRIS}; }
  .mc-dtab { flex:0 0 auto;cursor:pointer;font-family:inherit;font-size:15px;font-weight:700;
    padding:11px 19px;border-radius:13px;border:1.5px solid ${BD};
    background:${CARD};color:${MUTED};transition:.16s;position:relative; }
  .mc-dtab.on { border-color:${PRI};color:#fff;background:${PRIS}; }
  .mc-dtab.miss { border-color:rgba(255,90,90,.45); }
  .mc-dtab.miss.on { border-color:#ff5a5a; }
  .mc-add-ex { width:100%;cursor:pointer;font-family:inherit;font-weight:700;font-size:15.5px;
    padding:17px;border-radius:16px;border:1.5px dashed rgba(96,135,255,.4);
    background:rgba(63,114,255,.05);color:${PRIB};
    display:flex;align-items:center;justify-content:center;gap:9px;transition:.16s;margin-top:6px; }
  .mc-btn { cursor:pointer;font-family:inherit;font-weight:700;font-size:16px;border-radius:16px;
    padding:17px;border:none;display:flex;align-items:center;justify-content:center;gap:9px;transition:.16s; }
  .mc-btn-primary { flex:1;background:linear-gradient(120deg,${PRIB},${PRI});color:#fff;
    box-shadow:0 12px 30px -8px rgba(63,114,255,.6); }
  .mc-btn-primary:disabled { opacity:.4;cursor:not-allowed;box-shadow:none; }
  .mc-btn-ghost { flex:0 0 auto;padding:17px 22px;background:${CARD};border:1px solid ${BD};color:${MUTED}; }
  .mc-recap-card { background:${CARD};border:1px solid ${BD};border-radius:20px;padding:18px;margin-bottom:14px; }
  .mc-recap-day { display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid ${BD}; }
  .mc-seg { height:5px;border-radius:3px;flex:1;background:rgba(255,255,255,.08);overflow:hidden; }
  .mc-seg i { display:block;height:100%;width:0;background:linear-gradient(90deg,${PRIB},${PRI});
    border-radius:3px;transition:width .45s cubic-bezier(.4,0,.2,1); }
  .mc-seg.done i, .mc-seg.active i { width:100%; }
  .mc-lib { background:${CARD};border:1px solid ${BD};border-radius:18px;padding:16px;margin-bottom:12px;transition:.18s; }
  .mc-lib.added { border-color:rgba(61,220,151,.4);background:linear-gradient(120deg,rgba(61,220,151,.06),transparent); }
  .mc-lib-add { margin-top:13px;width:100%;cursor:pointer;font-family:inherit;font-weight:700;font-size:14.5px;
    padding:13px;border-radius:13px;border:none;background:linear-gradient(120deg,${PRIB},${PRI});
    color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:.16s; }
  .mc-lib-add.done { background:rgba(61,220,151,.15);color:${GREEN};border:1px solid rgba(61,220,151,.4); }
  .mc-empty { text-align:center;padding:40px 10px;color:${MUTED2};font-size:15px;
    display:flex;flex-direction:column;align-items:center; }
`;

// ─── ExCard ───────────────────────────────────────────────────────────────────
function ExCard({ ex, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false);
  const type = ex.cat === "principal" ? "PRINCIPAL" : "ISOLATION";
  const catClass = ex.cat === "principal" ? "principal" : "isolation";
  const isAdv = open;

  return (
    <div className={`mc-ex ${catClass}`}>
      <div className="mc-ex-row" style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <span style={{
            fontSize:11, fontWeight:800, letterSpacing:"1.3px", padding:"4px 9px", borderRadius:7,
            display:"inline-block", marginBottom:9,
            color: ex.cat==="principal" ? PRIB : PURP,
            background: ex.cat==="principal" ? "rgba(63,114,255,.12)" : "rgba(154,140,255,.12)",
          }}>{type}</span>
          <div style={{ fontSize:17, fontWeight:700, marginBottom:4, color:TEXT, fontFamily:F }}>{ex.nom}</div>
          <div style={{ fontSize:13.5, color:MUTED, fontFamily:F }}>{ex.series}×{ex.reps} · {ex.repos}s</div>
        </div>
        <button className="mc-ghost-del" onClick={onRemove} style={{ height:42 }}>✕</button>
      </div>

      <div className="mc-metrics">
        {/* Séries */}
        <div className="mc-metric">
          <span className="mc-m-lbl">Séries</span>
          <div className="mc-m-ctrl">
            <button className="mc-m-step" onClick={() => onUpdate({...ex, series:String(Math.max(1, parseInt(ex.series)-1))})}>−</button>
            <span className="mc-m-val">{ex.series}</span>
            <button className="mc-m-step" onClick={() => onUpdate({...ex, series:String(parseInt(ex.series)+1)})}>+</button>
          </div>
        </div>
        {/* Reps */}
        <div className="mc-metric">
          <span className="mc-m-lbl">Reps</span>
          <div className="mc-m-ctrl">
            <input className="mc-m-input" value={ex.reps} inputMode="numeric"
              onChange={e => onUpdate({...ex, reps:e.target.value})}/>
          </div>
        </div>
        {/* Repos */}
        <div className="mc-metric">
          <span className="mc-m-lbl">Repos</span>
          <div className="mc-m-ctrl">
            <button className="mc-m-step" onClick={() => onUpdate({...ex, repos:String(Math.max(0, parseInt(ex.repos)-15))})}>−</button>
            <span className="mc-m-val">{ex.repos}s</span>
            <button className="mc-m-step" onClick={() => onUpdate({...ex, repos:String(parseInt(ex.repos)+15)})}>+</button>
          </div>
        </div>
      </div>

      {/* Toggle avancé */}
      <button className={`mc-opt-toggle${open ? " open" : ""}`} onClick={() => setOpen(o=>!o)}>
        <span style={{ fontSize:13 }}>⚙</span>
        {ex.methode && ex.methode !== "Standard"
          ? <span style={{ color:PRIB, fontWeight:700 }}>{ex.methode}{ex.tempo ? ` · ${ex.tempo}` : ""}</span>
          : "Tempo & intensité"}
        <span className="mc-opt-caret" style={{ marginLeft:"auto", fontSize:12 }}>▾</span>
      </button>

      {open && (
        <div className="mc-adv">
          <div>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".9px", textTransform:"uppercase", color:MUTED2, marginBottom:9, fontFamily:F }}>Tempo</div>
            <input className="mc-adv-input" placeholder="ex. 3-0-1-0" value={ex.tempo||""}
              onChange={e => onUpdate({...ex, tempo:e.target.value})}/>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".9px", textTransform:"uppercase", color:MUTED2, marginBottom:9, fontFamily:F }}>Méthode d'intensité</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {METHODS.map(m => (
                <button key={m} className={`mc-method-pill${ex.methode===m?" on":""}`}
                  onClick={() => onUpdate({...ex, methode:m})}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BiblioSheet ─────────────────────────────────────────────────────────────
function BiblioSheet({ onClose, onAdd, addedNoms }) {
  const [muscle,    setMuscle]    = useState(Object.keys(EX)[0]);
  const [search,    setSearch]    = useState("");
  const [guideEx,   setGuideEx]   = useState(null);
  const [guideTab,  setGuideTab]  = useState("tips");

  const list = search
    ? Object.entries(EX).flatMap(([g,arr]) => arr.map(e => ({...e, group:g})))
        .filter(e => e.n.toLowerCase().includes(search.toLowerCase()))
    : (EX[muscle]||[]).map(e => ({...e, group:muscle}));

  if (guideEx) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(7,10,18,.98)", zIndex:500, overflowY:"auto" }}>
      <div style={{ maxWidth:500, margin:"0 auto", padding:"20px 16px 80px" }}>
        <button onClick={() => setGuideEx(null)} style={{ background:"transparent", border:"none", color:PRI, cursor:"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:4, marginBottom:16, fontFamily:F }}>← Retour</button>
        <span style={{ fontSize:11, fontWeight:800, letterSpacing:"1.3px", padding:"4px 9px", borderRadius:7, display:"inline-block", marginBottom:9, color:cc(guideEx.cat), background:`${cc(guideEx.cat)}18` }}>{guideEx.cat?.toUpperCase()}</span>
        <div style={{ fontSize:20, fontWeight:700, color:TEXT, fontFamily:F, marginBottom:14 }}>{guideEx.n}</div>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[{l:"Séries",v:guideEx.s},{l:"Reps",v:guideEx.r},{l:"Repos",v:guideEx.rest},{l:"Charge",v:guideEx.ch}].map(s => (
            <div key={s.l} style={{ flex:1, padding:"10px 6px", background:CARD, border:`1px solid ${BD}`, borderRadius:12, textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, color:PRIB, fontFamily:F }}>{s.v}</div>
              <div style={{ fontSize:9, color:MUTED, marginTop:2, fontFamily:F }}>{s.l}</div>
            </div>
          ))}
        </div>
        <Tabs items={[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}]} value={guideTab} onChange={setGuideTab}/>
        <div style={{ padding:"12px 0" }}>
          {guideTab==="tips" && (guideEx.tips||[]).map((tip,i,arr) => (
            <div key={i} style={{ display:"flex", gap:12, paddingBottom:14, marginBottom:14, borderBottom:i<arr.length-1?`1px solid ${BD}`:"none" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(63,114,255,.1)", border:`1px solid ${BDH}`, display:"grid", placeItems:"center", flexShrink:0, fontSize:10, fontWeight:700, color:PRIB }}>{i+1}</div>
              <div style={{ fontSize:12, color:TEXT, lineHeight:1.7 }}>{tip}</div>
            </div>
          ))}
          {guideTab==="variantes" && (guideEx.variantes||[]).map((v,i) => (
            <div key={i} style={{ background:CARD, border:`1px solid ${BD}`, borderRadius:14, padding:14, marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:4 }}>{v.nom||v}</div>
              {v.note && <div style={{ fontSize:11, color:MUTED, lineHeight:1.5 }}>{v.note}</div>}
            </div>
          ))}
          {guideTab==="erreurs" && (guideEx.erreurs||[]).map((e,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.25)", display:"grid", placeItems:"center", flexShrink:0, fontSize:10, color:"#FF7A6B" }}>✕</div>
              <div style={{ fontSize:12, color:TEXT, lineHeight:1.6 }}>{e}</div>
            </div>
          ))}
          {guideTab==="morpho" && (guideEx.morpho||"").split('\n').filter(Boolean).map((line,i,arr) => (
            <div key={i} style={{ display:"flex", gap:8, paddingBottom:10, marginBottom:10, borderBottom:i<arr.length-1?`1px solid ${BD}`:"none" }}>
              <div style={{ fontSize:14, flexShrink:0 }}>{line.split(':')[0].trim()}</div>
              <div style={{ fontSize:11, color:TEXT, lineHeight:1.6, flex:1 }}>{line.split(':').slice(1).join(':').trim()}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { onAdd(guideEx); setGuideEx(null); }} className={`mc-lib-add${addedNoms.includes(guideEx.n)?" done":""}`}>
          {addedNoms.includes(guideEx.n) ? "✓ Déjà ajouté" : "+ Ajouter cet exercice"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(3,5,10,.66)", backdropFilter:"blur(3px)", zIndex:40 }}/>
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:450,
        background:BG2, borderRadius:"28px 28px 0 0", borderTop:`1px solid ${BDH}`,
        zIndex:41, height:"80%", display:"flex", flexDirection:"column",
        boxShadow:"0 -30px 60px -20px rgba(0,0,0,.7)",
      }}>
        <div style={{ width:42, height:5, borderRadius:3, background:"rgba(255,255,255,.18)", margin:"12px auto 4px" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 20px 14px" }}>
          <div style={{ fontSize:20, fontWeight:700, color:TEXT, fontFamily:F }}>Ajouter un exercice</div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:11, border:`1px solid ${BD}`, background:CARD, display:"grid", placeItems:"center", color:MUTED, cursor:"pointer", fontSize:18 }}>×</button>
        </div>
        {/* Search */}
        <div style={{ padding:"0 20px 10px" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            style={{ width:"100%", padding:"11px 14px", background:CARD, border:`1px solid ${BD}`, borderRadius:12, color:TEXT, fontSize:13, fontFamily:F, outline:"none", boxSizing:"border-box" }}/>
        </div>
        {/* Groupes musculaires */}
        {!search && (
          <div style={{ display:"flex", gap:9, overflowX:"auto", padding:"0 20px 14px", flexShrink:0 }}>
            {Object.keys(EX).map(g => (
              <button key={g} onClick={() => setMuscle(g)} className={`mc-small-pill${muscle===g?" blue":""}`} style={{ whiteSpace:"nowrap", flexShrink:0 }}>{g}</button>
            ))}
          </div>
        )}
        {/* Liste */}
        <div style={{ flex:1, overflowY:"auto", padding:"4px 20px 24px" }}>
          {list.map((ex, i) => {
            const added = addedNoms.includes(ex.n);
            return (
              <div key={i} className={`mc-lib${added?" added":""}`}>
                <span style={{ fontSize:11, fontWeight:800, letterSpacing:"1.3px", padding:"4px 9px", borderRadius:7, display:"inline-block", marginBottom:9, color:cc(ex.cat), background:`${cc(ex.cat)}18` }}>{ex.cat?.toUpperCase()}</span>
                <div style={{ fontSize:16, fontWeight:700, color:TEXT, marginBottom:4, fontFamily:F }}>{ex.n}</div>
                <div style={{ fontSize:13, color:MUTED, marginBottom:4, fontFamily:F }}>{ex.s}×{ex.r} · {ex.rest}</div>
                <div style={{ fontSize:12, color:MUTED, fontStyle:"italic", lineHeight:1.5, marginBottom:8 }}>{(ex.morpho||"").substring(0,80)}…</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => onAdd(ex)} className={`mc-lib-add${added?" done":""}`} style={{ flex:1 }}>
                    {added ? "✓ Ajouté" : "+ Ajouter"}
                  </button>
                  <button onClick={() => setGuideEx(ex)} style={{ padding:"13px 16px", background:PRIS, border:`1px solid ${BDH}`, borderRadius:13, color:PRIB, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:F }}>Guide →</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── MAIN CREER ───────────────────────────────────────────────────────────────
export default function Creer(props) {
  const { setProg, setCycleStart, push, setCalSess, INT, setProgView, progs, setProgsAll, onCancel, setCS, newP, setNewP } = props;

  const [step,      setStep]      = useState(1);
  const [name,      setName]      = useState(newP?.nom || "");
  const [split,     setSplit]     = useState(newP?.split || null);
  const [days,      setDays]      = useState(newP?.jours || []);
  const [activeDay, setActiveDay] = useState(null);
  const [sessions,  setSessions]  = useState(newP?.seances || {});
  const [sheet,     setSheet]     = useState(false);

  const sortedDays = useMemo(() => DAYS_ALL.filter(d => days.includes(d)), [days]);

  const toggleDay = d => setDays(p => p.includes(d) ? p.filter(x=>x!==d) : [...p,d]);

  const applySplit = sp => {
    setSplit(sp.id);
    if (sp.id === "custom") return;
    setDays(sp.preset);
    setSessions(prev => {
      const next = {...prev};
      sp.preset.forEach(d => {
        next[d] = { ...(next[d]||{intensity:"leger",ex:[]}), name:sp.names[d]||"" };
      });
      return next;
    });
  };

  const sess    = d  => sessions[d] || { name:"", intensity:"leger", ex:[] };
  const setSess = (d, patch) => setSessions(p => ({...p, [d]:{...sess(d),...patch}}));

  const addEx = d => ex => {
    const cur = sess(d);
    if (cur.ex.find(e => e.id===ex.id || e.nom===ex.n)) return;
    const { sets, reps, rest } = parseScheme(ex.scheme || `${ex.s}×${ex.r} · ${ex.rest}`);
    setSess(d, { ex:[...cur.ex, { id:ex.id||ex.n, nom:ex.n, cat:ex.cat, series:String(sets), reps:String(reps), repos:String(rest), methode:"Standard", tempo:"", historique:[], note:"" }] });
  };

  const removeEx = (d, id) => setSess(d, { ex:sess(d).ex.filter(e=>e.id!==id && e.nom!==id) });
  const updateEx = (d, id, updated) => setSess(d, { ex:sess(d).ex.map(e => (e.id===id||e.nom===id) ? updated : e) });

  const missingDays = sortedDays.filter(d => sess(d).ex.length===0);
  const allComplete = sortedDays.length > 0 && missingDays.length===0;
  const canNext1    = name.trim() && split && days.length > 0;
  const totalEx     = sortedDays.reduce((a,d) => a+sess(d).ex.length, 0);

  const goStep = s => {
    setStep(s);
    if (s===2 && !activeDay) setActiveDay(sortedDays[0] || days[0]);
    if (setCS) setCS(s-1);
    // Sync newP
    if (setNewP) setNewP({ nom:name, split, jours:days, seances:sessions });
  };

  const handleSave = () => {
    const jours = days.map((j,i) => ({
      id:i+1, nom:sess(j).name||`Séance ${j}`, focus:j, duree:"45-60 min",
      intensite:sess(j).intensity||"modere",
      exercices:(sess(j).ex||[]).map(ex => ({...ex, historique:[], note:""})),
      complete:false, date:null, note:"",
    }));
    const newProg = { titre:name, type:"custom", id:`custom_${Date.now()}`, dateDebut:new Date().toLocaleDateString("fr-FR"), jours };
    if (setProgsAll) setProgsAll([...(progs||[]), newProg]);
    setProg(newProg);
    setCycleStart(Date.now());
    const today = new Date();
    const joursMap = {Lun:1,Mar:2,Mer:3,Jeu:4,Ven:5,Sam:6,Dim:0};
    const newSess = {};
    jours.forEach(jour => {
      const match = Object.entries(joursMap).find(([k]) => jour.focus.startsWith(k));
      if (match) {
        for (let w=0;w<6;w++) {
          const d = new Date(today);
          d.setDate(d.getDate()+((match[1]-d.getDay()+7)%7||7)+w*7);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          newSess[key] = { nom:jour.nom, intensite:jour.intensite||"modere", color:INT[jour.intensite||"modere"]?.c||"#4D8BFF" };
        }
      }
    });
    setCalSess(prev => ({...prev,...newSess}));
    setProgView("calendar");
    if (setCS) setCS(0);
    if (setNewP) setNewP({nom:"",split:null,jours:[],seances:{}});
    push("✅","Programme créé !",`${name} · Calendrier mis à jour !`);
  };

  const ad = activeDay || sortedDays[0];
  const s  = ad ? sess(ad) : null;

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background:BG, minHeight:"100vh", fontFamily:F, color:TEXT }}>

        {/* ── Barre de progression ── */}
        <div style={{ padding:"12px 20px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={() => step>1 ? goStep(step-1) : onCancel?.()} style={{ width:38, height:38, borderRadius:12, border:`1px solid ${BD}`, background:CARD, display:"grid", placeItems:"center", color:TEXT, cursor:"pointer", fontSize:16, flexShrink:0 }}>
              {step > 1 ? "‹" : "✕"}
            </button>
            <div style={{ display:"flex", gap:7, flex:1 }}>
              {[1,2,3].map(n => (
                <div key={n} className={`mc-seg${step>n?" done":""}${step===n?" active":""}`}><i/></div>
              ))}
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:MUTED, letterSpacing:".5px" }}>{step}/3</div>
          </div>
        </div>

        {/* ── Body scrollable ── */}
        <div style={{ padding:"18px 20px 130px", overflowY:"auto" }}>

          {/* ══ STEP 1 ══ */}
          {step===1 && (
            <div className="mc-fade">
              <div style={{ fontSize:12, fontWeight:800, letterSpacing:"2px", color:PRIB, textTransform:"uppercase", marginBottom:7 }}>Nouveau programme</div>
              <h1 style={{ fontFamily:SF, fontSize:34, fontWeight:700, letterSpacing:"-.5px", marginBottom:9, color:TEXT, lineHeight:1.05 }}>
                Pose le <em style={{ fontStyle:"italic", color:PRIB }}>cadre</em>.
              </h1>
              <p style={{ fontSize:15, color:MUTED, lineHeight:1.45, marginBottom:22 }}>
                On définit la structure avant de remplir les séances.
              </p>

              <div style={{ fontSize:12, fontWeight:800, letterSpacing:"1.6px", color:MUTED, textTransform:"uppercase", margin:"22px 2px 12px" }}>Nom du programme</div>
              <input className="mc-field" placeholder="Ex. Sèche — Hypertrophie 6 sem." value={name} onChange={e => setName(e.target.value)}/>

              <div style={{ fontSize:12, fontWeight:800, letterSpacing:"1.6px", color:MUTED, textTransform:"uppercase", margin:"22px 2px 12px" }}>Type de split</div>
              {SPLITS.map(sp => (
                <button key={sp.id} className={`mc-split-card${split===sp.id?" sel":""}`} onClick={() => applySplit(sp)}>
                  <div className="mc-split-tick" style={{ color:"#fff" }}>
                    {split===sp.id && "✓"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16, fontWeight:700 }}>{sp.name}</div>
                    <div style={{ fontSize:13, color:MUTED, marginTop:2 }}>{sp.desc}</div>
                  </div>
                  {sp.days > 0 && <div style={{ fontSize:12, fontWeight:700, color:MUTED2 }}>{sp.days}j</div>}
                </button>
              ))}

              <div style={{ fontSize:12, fontWeight:800, letterSpacing:"1.6px", color:MUTED, textTransform:"uppercase", margin:"22px 2px 12px", display:"flex", alignItems:"center", gap:8 }}>
                Jours d'entraînement
                {split && split!=="custom" && (
                  <span style={{ fontSize:11, fontWeight:700, color:PRIB, background:PRIS, border:`1px solid ${BDH}`, padding:"3px 8px", borderRadius:7, textTransform:"none", letterSpacing:0 }}>Pré-définis</span>
                )}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {DAYS_ALL.map(d => (
                  <button key={d} className={`mc-pill${days.includes(d)?" on":""}`} onClick={() => toggleDay(d)}>{d}</button>
                ))}
              </div>
            </div>
          )}

          {/* ══ STEP 2 ══ */}
          {step===2 && ad && s && (
            <div className="mc-fade" key={"s2-"+ad}>
              <div style={{ fontSize:12, fontWeight:800, letterSpacing:"2px", color:PRIB, textTransform:"uppercase", marginBottom:7 }}>Construis tes séances</div>
              <h1 style={{ fontFamily:SF, fontSize:30, fontWeight:700, letterSpacing:"-.5px", marginBottom:16, color:TEXT, lineHeight:1.05 }}>
                Séance par <em style={{ fontStyle:"italic", color:PRIB }}>séance</em>.
              </h1>

              {/* Tabs jours sticky */}
              <div style={{ position:"sticky", top:0, zIndex:10, background:`${BG}f5`, backdropFilter:"blur(12px)", paddingBottom:12, marginBottom:4 }}>
                <div style={{ display:"flex", gap:9, overflowX:"auto", paddingBottom:4 }}>
                  {sortedDays.map(d => {
                    const empty = sess(d).ex.length===0;
                    return (
                      <button key={d} className={`mc-dtab${ad===d?" on":""}${empty?" miss":""}`} onClick={() => setActiveDay(d)}>
                        {d}
                        {empty
                          ? <span style={{ position:"absolute", top:7, right:8, width:7, height:7, borderRadius:"50%", background:"#ff5a5a", boxShadow:"0 0 0 3px rgba(255,90,90,.18)" }}/>
                          : <span style={{ position:"absolute", top:7, right:8, width:7, height:7, borderRadius:"50%", background:GREEN }}/>
                        }
                      </button>
                    );
                  })}
                </div>
              </div>

              <input className="mc-field" style={{ marginTop:14 }} placeholder={`Nom de la séance — ${ad}`}
                value={s.name} onChange={e => setSess(ad, {name:e.target.value})}/>

              <div style={{ fontSize:12, fontWeight:800, letterSpacing:"1.6px", color:MUTED, textTransform:"uppercase", margin:"22px 2px 12px" }}>Intensité</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {INTENSITIES.map(it => (
                  <button key={it.id}
                    className={`mc-small-pill${s.intensity===it.id ? (it.id==="leger"?" green":" blue") : ""}`}
                    onClick={() => setSess(ad, {intensity:it.id})}>{it.label}</button>
                ))}
              </div>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"24px 2px 14px" }}>
                <span style={{ fontSize:12, fontWeight:800, letterSpacing:"1.4px", color:MUTED, textTransform:"uppercase" }}>Exercices</span>
                <span style={{ fontSize:18, fontWeight:800, color:TEXT }}>{s.ex.length}</span>
              </div>

              {s.ex.length===0 ? (
                <div className="mc-empty">
                  <span style={{ fontSize:26, opacity:.4, marginBottom:10 }}>🏋️</span>
                  <div>Aucun exercice pour l'instant.</div>
                  <div style={{ fontSize:13, marginTop:4 }}>Ajoute-en depuis la bibliothèque.</div>
                </div>
              ) : (
                s.ex.map(ex => (
                  <ExCard key={ex.id||ex.nom} ex={ex}
                    onUpdate={updated => updateEx(ad, ex.id||ex.nom, updated)}
                    onRemove={() => removeEx(ad, ex.id||ex.nom)}/>
                ))
              )}

              <button className="mc-add-ex" onClick={() => setSheet(true)}>+ Ajouter un exercice</button>

              {missingDays.length > 0 && (
                <div style={{ display:"flex", gap:11, alignItems:"flex-start", margin:"18px 0 4px", borderRadius:16, padding:"15px 16px", background:"rgba(255,90,90,.08)", border:"1px solid rgba(255,90,90,.3)" }}>
                  <span style={{ color:"#ff7a7a", fontSize:18, flexShrink:0 }}>⚠</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:3, color:"#ffb4b4" }}>{missingDays.length} séance{missingDays.length>1?"s":""} à compléter</div>
                    <div style={{ fontSize:13, color:MUTED, lineHeight:1.4 }}>Chaque jour doit contenir au moins un exercice.</div>
                    <div style={{ display:"inline-flex", gap:6, flexWrap:"wrap", marginTop:9 }}>
                      {missingDays.map(d => (
                        <span key={d} onClick={() => setActiveDay(d)} style={{ fontSize:12, fontWeight:700, color:"#ff9a9a", background:"rgba(255,90,90,.12)", border:"1px solid rgba(255,90,90,.3)", padding:"4px 10px", borderRadius:8, cursor:"pointer" }}>{d} →</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 3 — RÉCAP ══ */}
          {step===3 && (
            <div className="mc-fade">
              <div style={{ fontSize:12, fontWeight:800, letterSpacing:"2px", color:PRIB, textTransform:"uppercase", marginBottom:7 }}>Récapitulatif</div>
              <h1 style={{ fontFamily:SF, fontSize:34, fontWeight:700, letterSpacing:"-.5px", marginBottom:9, color:TEXT, lineHeight:1.05 }}>
                Tout est <em style={{ fontStyle:"italic", color:PRIB }}>prêt</em>.
              </h1>
              <p style={{ fontSize:15, color:MUTED, lineHeight:1.45, marginBottom:22 }}>Vérifie ton programme avant de le créer.</p>

              {!allComplete && (
                <div style={{ display:"flex", gap:11, alignItems:"flex-start", marginBottom:18, borderRadius:16, padding:"15px 16px", background:"rgba(255,90,90,.08)", border:"1px solid rgba(255,90,90,.3)" }}>
                  <span style={{ color:"#ff7a7a", fontSize:18 }}>⚠</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#ffb4b4", marginBottom:3 }}>Validation impossible</div>
                    <div style={{ fontSize:13, color:MUTED, lineHeight:1.4 }}>Il reste {missingDays.length} séance{missingDays.length>1?"s":""} sans exercice.</div>
                  </div>
                </div>
              )}

              <div className="mc-recap-card">
                <div style={{ fontSize:18, fontWeight:700, marginBottom:3, fontFamily:F }}>{name||"Programme sans nom"}</div>
                <div style={{ fontSize:13, color:MUTED, marginBottom:14 }}>
                  {SPLITS.find(x=>x.id===split)?.name||"Personnalisé"} · {sortedDays.length} séances/sem · {totalEx} exercices
                </div>
                {sortedDays.map(d => {
                  const ds   = sess(d);
                  const empty = ds.ex.length===0;
                  const intColor = INTENSITIES.find(i=>i.id===ds.intensity)?.color || PRIB;
                  return (
                    <div key={d} className={`mc-recap-day`}>
                      <div style={{ width:46, height:46, borderRadius:13, background:empty?"rgba(255,90,90,.12)":PRIS, border:`1px solid ${empty?"rgba(255,90,90,.4)":BDH}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:empty?"#ff8a8a":PRIB, flexShrink:0 }}>{d}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:15, fontWeight:700, fontFamily:F }}>{ds.name||`Séance ${d}`}</div>
                        <div style={{ fontSize:13, color:MUTED, marginTop:1 }}>{INTENSITIES.find(i=>i.id===ds.intensity)?.label} · {ds.ex.length||"—"} exercices</div>
                      </div>
                      {empty
                        ? <span style={{ fontSize:12, fontWeight:700, color:"#ff8a8a", background:"rgba(255,90,90,.1)", border:"1px solid rgba(255,90,90,.3)", padding:"3px 9px", borderRadius:7 }}>À compléter</span>
                        : <div style={{ fontSize:13, fontWeight:700, color:MUTED }}>{ds.ex.length}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:450, padding:"16px 20px 26px", background:`linear-gradient(0deg,${BG} 60%,rgba(7,10,18,0))`, display:"flex", gap:11, zIndex:20 }}>
          {step===1 && (
            <>
              {onCancel && <button className="mc-btn mc-btn-ghost" onClick={onCancel}>Annuler</button>}
              <button className="mc-btn mc-btn-primary" disabled={!canNext1} onClick={() => goStep(2)}>
                Suivant →
              </button>
            </>
          )}
          {step===2 && (
            <button className="mc-btn mc-btn-primary" onClick={() => goStep(3)}>
              Voir le récap · {totalEx} ex. →
            </button>
          )}
          {step===3 && (
            <>
              <button className="mc-btn mc-btn-ghost" onClick={() => goStep(2)}>← Retour</button>
              <button className="mc-btn mc-btn-primary" disabled={!allComplete} onClick={handleSave}>
                ✓ Créer le programme
              </button>
            </>
          )}
        </div>

        {/* Bibliothèque */}
        {sheet && <BiblioSheet onClose={() => setSheet(false)} onAdd={addEx(ad)} addedNoms={(s?.ex||[]).map(e=>e.nom)}/>}
      </div>
    </>
  );
}
