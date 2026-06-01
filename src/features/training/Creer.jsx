import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { C, FONT, SERIF } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Tabs } from "../../components/ui/Tabs.jsx";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const BL   = C.accent || "#3B82F6";
const BLD  = C.accentDk || "#2563EB";
const BLS  = "rgba(59,130,246,0.12)";
const BLBR = "rgba(59,130,246,0.35)";
const BG   = "#080E1A";
const S1   = C.s1 || "#111827";
const S2   = C.s2 || "#1A2336";
const BD   = C.bd  || "rgba(255,255,255,0.07)";
const BDHI = C.bdHi || "rgba(255,255,255,0.12)";
const TEXT = C.text || "#F2F4F7";
const MID  = C.mid  || "rgba(242,244,247,0.60)";
const DIM  = C.dim  || "rgba(242,244,247,0.35)";
const GRN  = C.green || "#34D399";
const RED  = "#F87171";
const PRP  = "#9a8cff";
const AMB  = "#F59E0B";
const F    = FONT;
const SF   = SERIF;

const DAYS_ALL   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const SPLITS = [
  { id:"fullbody", name:"Full body",        desc:"Tout le corps à chaque séance",    days:3,
    preset:["Lun","Mer","Ven"], names:{Lun:"Full body A",Mer:"Full body B",Ven:"Full body C"} },
  { id:"hautbas",  name:"Haut / Bas",       desc:"Alternance haut et bas du corps",  days:4,
    preset:["Lun","Mar","Jeu","Ven"], names:{Lun:"Haut du corps",Mar:"Bas du corps",Jeu:"Haut du corps",Ven:"Bas du corps"} },
  { id:"ppl",      name:"Push · Pull · Legs",desc:"Poussée, tirage, jambes",         days:6,
    preset:["Lun","Mar","Mer","Ven","Sam","Dim"], names:{Lun:"Push",Mar:"Pull",Mer:"Legs",Ven:"Push",Sam:"Pull",Dim:"Legs"} },
  { id:"custom",   name:"Personnalisé",      desc:"Tu organises tout toi-même",      days:0, preset:null, names:{} },
];
const INTENSITIES = [
  {id:"leger",   label:"Léger",    color:GRN},
  {id:"modere",  label:"Modéré",   color:BL},
  {id:"lourd",   label:"Lourd",    color:AMB},
  {id:"intense", label:"Intense",  color:RED},
  {id:"mobilite",label:"Mobilité", color:PRP},
];
const METHODS = ["Standard","Pyramidal","Super-set","Drop-set","Rest-pause",
                 "5×5","Séries de 100","Dégressif","Pré-fatigue","Wave loading"];
const CAT_C = {principal:BL,correctif:RED,gainage:GRN,isolation:PRP,mobilite:"#22d3ee"};
const cc = cat => CAT_C[cat]||BL;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseScheme = scheme => {
  const [left,right] = String(scheme||"3×10 · 60s").split("·").map(x=>x.trim());
  const [sets,reps]  = (left||"3×10").split("×").map(x=>x.trim());
  const rest = parseInt(String(right||"60").replace(/\D/g,""),10);
  return { sets:parseInt(sets,10)||3, reps:reps||"10", rest:rest||60 };
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@keyframes mcFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes mcPop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
@keyframes mcShine{0%,60%{background-position:-180% 0}100%{background-position:200% 0}}
.mc-page{animation:mcFadeUp .32s cubic-bezier(.22,1,.36,1) both}
.mc-pop{animation:mcPop .28s cubic-bezier(.34,1.56,.64,1) both}
.mc-shine{position:relative;overflow:hidden}
.mc-shine::after{content:"";position:absolute;inset:0;border-radius:inherit;
  background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.28) 50%,transparent 65%);
  background-size:200% 100%;animation:mcShine 3.2s ease-in-out infinite;pointer-events:none}
.mc-shine:active{transform:scale(.985)}
/* Scrollbar */
.mc-scroll::-webkit-scrollbar{width:0}
.mc-scroll{scrollbar-width:none}
/* Split card */
.mc-split{display:flex;align-items:center;gap:14px;text-align:left;cursor:pointer;
  border-radius:20px;padding:16px 18px;width:100%;border:1.5px solid;
  transition:all .24s cubic-bezier(.22,1,.36,1);font-family:${F};background:${S1};color:${TEXT}}
.mc-split:active{transform:scale(.985)}
/* Day cap */
.mc-day{padding:13px 0;border-radius:15px;border:1.5px solid;font-size:15px;font-weight:700;
  cursor:pointer;transition:all .22s cubic-bezier(.22,1,.36,1);font-family:${F};
  display:flex;align-items:center;justify-content:center}
/* Intensity chip */
.mc-int{padding:11px 18px;border-radius:13px;border:1.5px solid;font-size:14px;font-weight:700;
  cursor:pointer;transition:all .2s;font-family:${F}}
/* Day tab */
.mc-dtab{flex:0 0 auto;cursor:pointer;font-family:${F};font-size:15px;font-weight:700;
  padding:11px 19px;border-radius:13px;border:1.5px solid ${BD};
  background:${S1};color:${MID};transition:.18s;position:relative}
.mc-dtab.on{border-color:${BL};color:#fff;background:${BLS}}
.mc-dtab.miss{border-color:rgba(248,113,113,.45)}
/* Exercise card */
.mc-ex{background:${S1};border:1px solid ${BD};border-radius:18px;padding:16px;margin-bottom:12px}
.mc-metric{flex:1;background:${S2};border:1px solid ${BD};border-radius:13px;padding:9px 7px 10px;text-align:center}
.mc-m-lbl{display:block;text-align:center;font-size:10px;font-weight:800;letter-spacing:.9px;
  text-transform:uppercase;color:${DIM};margin-bottom:8px}
.mc-m-ctrl{display:flex;align-items:center;justify-content:space-between;gap:4px}
.mc-m-step{width:30px;height:30px;border-radius:9px;border:1px solid ${BD};background:${S1};
  color:${MID};font-size:18px;font-weight:600;display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex:0 0 auto;transition:.12s;padding:0}
.mc-m-step:active{transform:scale(.9)}
.mc-m-val{font-size:15px;font-weight:800;color:${TEXT};text-align:center;flex:1}
.mc-m-input{width:100%;background:transparent;border:none;outline:none;text-align:center;
  font-family:inherit;font-size:15px;font-weight:800;color:${TEXT};padding:4px 0;border-radius:6px}
.mc-m-input:focus{background:${BLS}}
/* Tempo toggle */
.mc-tempo{margin-top:12px;width:100%;cursor:pointer;font-family:${F};font-weight:700;font-size:13px;
  display:flex;align-items:center;gap:8px;color:${MID};
  background:transparent;border:none;padding:8px 2px 2px;transition:.16s}
.mc-tempo.open{color:${BL}}
.mc-adv{margin-top:10px;padding-top:14px;border-top:1px solid ${BD};
  display:flex;flex-direction:column;gap:16px;animation:mcFadeUp .2s ease both}
.mc-adv-input{background:${S2};border:1px solid ${BD};border-radius:11px;
  padding:12px 14px;font-family:${F};font-size:15px;font-weight:700;color:${TEXT};
  outline:none;width:100%;box-sizing:border-box;transition:.16s;letter-spacing:.5px}
.mc-adv-input:focus{border-color:${BLBR}}
.mc-method{cursor:pointer;font-family:${F};font-size:13px;font-weight:600;
  padding:8px 13px;border-radius:10px;border:1.5px solid ${BD};
  background:${S2};color:${MID};transition:.14s}
.mc-method.on{border-color:${BL};color:${BL};background:${BLS}}
/* Add button */
.mc-add-ex{width:100%;cursor:pointer;font-family:${F};font-weight:700;font-size:15px;
  padding:16px;border-radius:16px;border:1.5px dashed rgba(59,130,246,.4);
  background:rgba(59,130,246,.05);color:${BL};
  display:flex;align-items:center;justify-content:center;gap:9px;transition:.16s;margin-top:8px}
.mc-add-ex:active{transform:scale(.98)}
/* Recap */
.mc-recap-card{background:${S1};border:1px solid ${BD};border-radius:22px;padding:20px;margin-bottom:14px}
.mc-recap-day{display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid ${BD}}
/* Fields */
.mc-field{width:100%;background:${S1};border:1.5px solid ${BD};border-radius:16px;
  padding:18px;font-size:16px;font-family:${F};color:${TEXT};outline:none;
  transition:.18s;box-sizing:border-box}
.mc-field::placeholder{color:${DIM}}
.mc-field:focus{border-color:${BLBR};background:${S2};box-shadow:0 0 0 3px rgba(59,130,246,.12)}
/* Lib */
.mc-lib{background:${S1};border:1px solid ${BD};border-radius:16px;padding:14px;margin-bottom:10px;transition:.18s}
.mc-lib.added{border-color:rgba(52,211,153,.4);background:linear-gradient(135deg,rgba(52,211,153,.06),transparent)}
.mc-lib-add{margin-top:11px;width:100%;cursor:pointer;font-family:${F};font-weight:700;font-size:14.5px;
  padding:13px;border-radius:13px;border:none;
  background:linear-gradient(135deg,${BL},${BLD});color:#fff;
  display:flex;align-items:center;justify-content:center;gap:8px;transition:.16s}
.mc-lib-add.done{background:rgba(52,211,153,.15);color:${GRN};border:1px solid rgba(52,211,153,.4)}
.mc-lib-add:active{transform:scale(.98)}
/* Seg bar */
.mc-seg{height:5px;border-radius:3px;flex:1;background:rgba(255,255,255,.08);overflow:hidden}
.mc-seg i{display:block;height:100%;width:0;background:linear-gradient(90deg,${BL},${BLD});
  border-radius:3px;transition:width .45s cubic-bezier(.4,0,.2,1)}
.mc-seg.done i,.mc-seg.active i{width:100%}
/* Warning */
.mc-warn{display:flex;gap:11px;align-items:flex-start;border-radius:16px;padding:15px 16px;
  background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.3)}
/* Empty state */
.mc-empty{text-align:center;padding:40px 10px;color:${MID};font-size:15px;
  display:flex;flex-direction:column;align-items:center;
  border:1px dashed ${BD};border-radius:18px;background:rgba(255,255,255,.02)}
`;

// ─── ExCard ───────────────────────────────────────────────────────────────────
function ExCard({ ex, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false);
  const catColor = cc(ex.cat);
  const catLabel = ex.cat === "principal" ? "PRINCIPAL" : ex.cat?.toUpperCase() || "ISOLATION";

  return (
    <div className="mc-ex mc-pop" style={{ borderLeft:`3px solid ${catColor}`,
      boxShadow:`0 8px 24px -16px ${catColor}` }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:"1.2px", padding:"4px 9px",
            borderRadius:7, display:"inline-block", marginBottom:9,
            color:catColor, background:`${catColor}18`, border:`1px solid ${catColor}35` }}>
            {catLabel}
          </span>
          <div style={{ fontSize:17, fontWeight:700, color:TEXT, fontFamily:F, letterSpacing:-.3, lineHeight:1.2, marginBottom:4 }}>{ex.nom}</div>
          <div style={{ fontSize:13, color:MID }}>{ex.series}×{ex.reps} · {ex.repos}s</div>
        </div>
        <button onClick={onRemove} style={{ width:38, height:38, borderRadius:12, flexShrink:0,
          border:"1px solid rgba(248,113,113,.28)", background:"rgba(248,113,113,.07)",
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:RED, fontSize:16 }}>✕</button>
      </div>

      <div style={{ display:"flex", gap:8, marginTop:13 }}>
        {/* Séries */}
        <div className="mc-metric">
          <span className="mc-m-lbl">Séries</span>
          <div className="mc-m-ctrl">
            <button className="mc-m-step" onClick={() => onUpdate({...ex,series:String(Math.max(1,parseInt(ex.series)-1))})}>−</button>
            <span className="mc-m-val">{ex.series}</span>
            <button className="mc-m-step" onClick={() => onUpdate({...ex,series:String(parseInt(ex.series)+1)})}>+</button>
          </div>
        </div>
        {/* Reps */}
        <div className="mc-metric">
          <span className="mc-m-lbl">Reps</span>
          <div className="mc-m-ctrl">
            <input className="mc-m-input" value={ex.reps} inputMode="numeric"
              onChange={e => onUpdate({...ex,reps:e.target.value})}/>
          </div>
        </div>
        {/* Repos */}
        <div className="mc-metric">
          <span className="mc-m-lbl">Repos</span>
          <div className="mc-m-ctrl">
            <button className="mc-m-step" onClick={() => onUpdate({...ex,repos:String(Math.max(0,parseInt(ex.repos)-15))})}>−</button>
            <span className="mc-m-val">{ex.repos}s</span>
            <button className="mc-m-step" onClick={() => onUpdate({...ex,repos:String(parseInt(ex.repos)+15)})}>+</button>
          </div>
        </div>
      </div>

      <button className={`mc-tempo${open?" open":""}`} onClick={() => setOpen(o=>!o)}>
        <span style={{ fontSize:14 }}>⚙</span>
        {ex.methode && ex.methode!=="Standard"
          ? <span style={{ color:BL, fontWeight:700 }}>{ex.methode}{ex.tempo?` · ${ex.tempo}`:""}</span>
          : "Tempo & intensité"}
        <span style={{ marginLeft:"auto", fontSize:11, transition:"transform .2s",
          display:"inline-block", transform:open?"rotate(180deg)":"none" }}>▾</span>
      </button>

      {open && (
        <div className="mc-adv">
          <div>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".9px", textTransform:"uppercase",
              color:DIM, marginBottom:9, fontFamily:F }}>Tempo</div>
            <input className="mc-adv-input" placeholder="ex. 3-0-1-0"
              value={ex.tempo||""} onChange={e => onUpdate({...ex,tempo:e.target.value})}/>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".9px", textTransform:"uppercase",
              color:DIM, marginBottom:9, fontFamily:F }}>Méthode d'intensité</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {METHODS.map(m => (
                <button key={m} className={`mc-method${ex.methode===m?" on":""}`}
                  onClick={() => onUpdate({...ex,methode:m})}>{m}</button>
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
  const [muscle,  setMuscle]  = useState(Object.keys(EX)[0]);
  const [search,  setSearch]  = useState("");
  const [guideEx, setGuideEx] = useState(null);
  const [guideTab,setGuideTab]= useState("tips");

  const list = search
    ? Object.entries(EX).flatMap(([g,arr]) => arr.map(e=>({...e,group:g})))
        .filter(e => e.n.toLowerCase().includes(search.toLowerCase()))
    : (EX[muscle]||[]).map(e=>({...e,group:muscle}));

  if (guideEx) return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:10002, overflowY:"auto" }}>
      <div style={{ maxWidth:500, margin:"0 auto", padding:"20px 20px 100px" }}>
        <button onClick={() => setGuideEx(null)} style={{ background:"transparent", border:"none",
          color:BL, cursor:"pointer", fontSize:13, fontWeight:700, display:"flex",
          alignItems:"center", gap:4, marginBottom:20, fontFamily:F }}>← Retour</button>
        <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:"1.2px", padding:"4px 9px",
          borderRadius:7, display:"inline-block", marginBottom:10,
          color:cc(guideEx.cat), background:`${cc(guideEx.cat)}18` }}>{guideEx.cat?.toUpperCase()}</span>
        <div style={{ fontSize:22, fontWeight:700, color:TEXT, fontFamily:F, marginBottom:16, letterSpacing:-.4 }}>{guideEx.n}</div>
        <div style={{ display:"flex", gap:8, marginBottom:18 }}>
          {[{l:"Séries",v:guideEx.s},{l:"Reps",v:guideEx.r},{l:"Repos",v:guideEx.rest},{l:"Charge",v:guideEx.ch}].map(s=>(
            <div key={s.l} style={{ flex:1, padding:"10px 6px", background:S1, border:`1px solid ${BD}`,
              borderRadius:12, textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, color:BL, fontFamily:F }}>{s.v}</div>
              <div style={{ fontSize:9, color:MID, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <Tabs items={[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}]}
          value={guideTab} onChange={setGuideTab}/>
        <div style={{ padding:"12px 0" }}>
          {guideTab==="tips" && (guideEx.tips||[]).map((tip,i,arr) => (
            <div key={i} style={{ display:"flex", gap:12, paddingBottom:14, marginBottom:14,
              borderBottom:i<arr.length-1?`1px solid ${BD}`:"none" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:BLS,
                border:`1px solid ${BLBR}`, display:"grid", placeItems:"center",
                flexShrink:0, fontSize:10, fontWeight:700, color:BL }}>{i+1}</div>
              <div style={{ fontSize:12.5, color:TEXT, lineHeight:1.7 }}>{tip}</div>
            </div>
          ))}
          {guideTab==="variantes" && (guideEx.variantes||[]).map((v,i) => (
            <div key={i} style={{ paddingBottom:12, marginBottom:12,
              borderBottom:`1px solid ${BD}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:3 }}>{v.nom||v}</div>
              {v.note && <div style={{ fontSize:11.5, color:MID, lineHeight:1.5 }}>{v.note}</div>}
            </div>
          ))}
          {guideTab==="erreurs" && (guideEx.erreurs||[]).map((e,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(248,113,113,.1)",
                border:"1px solid rgba(248,113,113,.25)", display:"grid", placeItems:"center",
                flexShrink:0, fontSize:10, color:RED }}>✕</div>
              <div style={{ fontSize:12.5, color:TEXT, lineHeight:1.6 }}>{e}</div>
            </div>
          ))}
          {guideTab==="morpho" && (guideEx.morpho||"").split('\n').filter(Boolean).map((line,i,arr)=>(
            <div key={i} style={{ display:"flex", gap:8, paddingBottom:10, marginBottom:10,
              borderBottom:i<arr.length-1?`1px solid ${BD}`:"none" }}>
              <div style={{ fontSize:14, flexShrink:0 }}>{line.split(':')[0].trim()}</div>
              <div style={{ fontSize:11.5, color:TEXT, lineHeight:1.6, flex:1 }}>{line.split(':').slice(1).join(':').trim()}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { onAdd(guideEx); setGuideEx(null); }}
          className={`mc-lib-add${addedNoms.includes(guideEx.n)?" done":""}`}>
          {addedNoms.includes(guideEx.n) ? "✓ Déjà ajouté" : "+ Ajouter cet exercice"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10001 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"absolute", inset:0,
        background:"rgba(3,5,10,.82)", backdropFilter:"blur(4px)" }}/>
      {/* Sheet */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0,
        background:"#0A1020",
        borderRadius:"28px 28px 0 0", borderTop:`1px solid ${BLBR}`,
        height:"82%", display:"flex", flexDirection:"column",
        boxShadow:"0 -30px 60px -20px rgba(0,0,0,.8)" }}>
        <div style={{ width:40, height:5, borderRadius:3,
          background:"rgba(255,255,255,.2)", margin:"14px auto 6px" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"6px 20px 14px" }}>
          <div style={{ fontSize:22, fontWeight:700, color:TEXT, fontFamily:SF,
            letterSpacing:-.5 }}>Ajouter un exercice</div>
          <button onClick={onClose} style={{ width:38, height:38, borderRadius:12,
            border:`1px solid ${BD}`, background:S1, display:"grid", placeItems:"center",
            color:MID, cursor:"pointer", fontSize:20 }}>×</button>
        </div>
        {/* Search */}
        <div style={{ padding:"0 20px 10px" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            style={{ width:"100%", padding:"12px 16px", background:S1,
              border:`1px solid ${BD}`, borderRadius:14, color:TEXT,
              fontSize:14, fontFamily:F, outline:"none", boxSizing:"border-box" }}/>
        </div>
        {/* Groupes */}
        {!search && (
          <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"0 20px 14px",
            flexShrink:0 }} className="mc-scroll">
            {Object.keys(EX).map(g => {
              const on = muscle===g;
              return (
                <button key={g} onClick={() => setMuscle(g)} style={{ flexShrink:0,
                  padding:"9px 16px", borderRadius:12, border:`1.5px solid ${on?BL:BD}`,
                  background:on?BLS:S1, color:on?BL:MID, fontSize:13, fontWeight:700,
                  cursor:"pointer", fontFamily:F, whiteSpace:"nowrap",
                  transition:"all .18s" }}>{g}</button>
              );
            })}
          </div>
        )}
        {/* Liste */}
        <div style={{ flex:1, overflowY:"auto", padding:"4px 20px 24px" }} className="mc-scroll">
          {list.map((ex,i) => {
            const added = addedNoms.includes(ex.n);
            const cc_ = cc(ex.cat);
            return (
              <div key={i} className={`mc-lib${added?" added":""}`}>
                <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:"1.2px",
                  padding:"4px 9px", borderRadius:7, display:"inline-block", marginBottom:8,
                  color:cc_, background:`${cc_}18`, border:`1px solid ${cc_}35` }}>
                  {ex.cat?.toUpperCase()}
                </span>
                <div style={{ fontSize:16, fontWeight:700, color:TEXT, marginBottom:3, fontFamily:F, letterSpacing:-.2 }}>{ex.n}</div>
                <div style={{ fontSize:13, color:MID, marginBottom:4 }}>{ex.s}×{ex.r} · {ex.rest}</div>
                <div style={{ fontSize:12, color:DIM, fontStyle:"italic", lineHeight:1.5, marginBottom:10 }}>
                  {(ex.morpho||"").substring(0,80)}…
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => onAdd(ex)} className={`mc-lib-add${added?" done":""}`} style={{ flex:1 }}>
                    {added ? "✓ Ajouté" : "+ Ajouter"}
                  </button>
                  <button onClick={() => setGuideEx(ex)} style={{ padding:"13px 16px",
                    background:BLS, border:`1px solid ${BLBR}`, borderRadius:13,
                    color:BL, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:F }}>
                    Guide →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
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
          {step===2 && sortedDays.length>0 && (
            <div style={{ position:"sticky", top:0, zIndex:9,
              background:BG, padding:"10px 20px",
              borderBottom:`1px solid ${BD}`, marginBottom:4 }}>
              <div style={{ display:"flex", gap:9, overflowX:"auto" }} className="mc-scroll">
                {sortedDays.map(d => {
                  const empty = sess(d).ex.length===0;
                  return (
                    <button key={d}
                      className={`mc-dtab${ad===d?" on":""}${empty?" miss":""}`}
                      onClick={() => setActiveDay(d)}>
                      {d}
                      <span style={{ position:"absolute", top:7, right:8, width:7, height:7,
                        borderRadius:"50%",
                        background:empty?"#f87171":GRN,
                        boxShadow:empty?"0 0 0 3px rgba(248,113,113,.2)":"0 0 0 3px rgba(52,211,153,.2)" }}/>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {step===2 && ad && s && (
            <div className="mc-page" key={"s2-"+ad}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"2.5px",
                textTransform:"uppercase", color:BL, marginBottom:8 }}>Construis tes séances</div>
              <h1 style={{ fontFamily:SF, fontSize:36, fontWeight:700, letterSpacing:"-.8px",
                lineHeight:1.05, color:TEXT, margin:"0 0 22px" }}>
                Séance par <em style={{ fontStyle:"italic", color:BL }}>séance.</em>
              </h1>

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
                ? <div className="mc-empty">
                    <span style={{ fontSize:30, marginBottom:12 }}>🏋️</span>
                    <div style={{ fontWeight:600 }}>Aucun exercice pour l'instant.</div>
                    <div style={{ fontSize:13, marginTop:4, color:DIM }}>Ajoute-en depuis la bibliothèque.</div>
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
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"2.5px",
                textTransform:"uppercase", color:BL, marginBottom:8 }}>Récapitulatif</div>
              <h1 style={{ fontFamily:SF, fontSize:38, fontWeight:700, letterSpacing:"-.8px",
                lineHeight:1.05, color:TEXT, margin:"0 0 12px" }}>
                Tout est <em style={{ fontStyle:"italic", color:BL }}>prêt.</em>
              </h1>
              <p style={{ fontSize:15, color:MID, lineHeight:1.5, marginBottom:24 }}>
                Vérifie ton programme avant de le créer.
              </p>

              {!allComplete && (
                <div className="mc-warn" style={{ marginBottom:18 }}>
                  <span style={{ color:RED, fontSize:18 }}>⚠</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#ffb4b4", marginBottom:3 }}>Validation impossible</div>
                    <div style={{ fontSize:13, color:MID, lineHeight:1.4 }}>
                      Il reste {missingDays.length} séance{missingDays.length>1?"s":""} sans exercice.
                    </div>
                  </div>
                </div>
              )}

              <div className="mc-recap-card">
                <div style={{ fontSize:20, fontWeight:700, fontFamily:SF, color:TEXT,
                  letterSpacing:-.4, marginBottom:4 }}>{name||"Programme sans nom"}</div>
                <div style={{ fontSize:13, color:MID, marginBottom:16 }}>
                  {activeSplit?.name||"Personnalisé"} · {sortedDays.length} séances/sem · {totalEx} exercices
                </div>
                {sortedDays.map(d => {
                  const ds = sess(d);
                  const it = INTENSITIES.find(i=>i.id===ds.intensity)||INTENSITIES[1];
                  const empty = ds.ex.length===0;
                  return (
                    <div key={d} className="mc-recap-day">
                      <div style={{ width:48, height:48, borderRadius:14, flexShrink:0,
                        background:empty?"rgba(248,113,113,.1)":BLS,
                        border:`1px solid ${empty?"rgba(248,113,113,.4)":BLBR}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontWeight:800, fontSize:14,
                        color:empty?"#ff8a8a":BL }}>{d}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:15, fontWeight:700, fontFamily:F, color:TEXT }}>
                          {ds.name||`Séance ${d}`}
                        </div>
                        <div style={{ fontSize:13, color:MID, marginTop:2,
                          display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ width:7, height:7, borderRadius:"50%",
                            background:it.color, display:"inline-block" }}/>
                          {it.label} · {ds.ex.length||"—"} exercices
                        </div>
                      </div>
                      {empty
                        ? <span style={{ fontSize:11, fontWeight:700, color:"#ff8a8a",
                            background:"rgba(255,90,90,.1)", border:"1px solid rgba(255,90,90,.3)",
                            padding:"3px 9px", borderRadius:7 }}>À compléter</span>
                        : <div style={{ fontSize:14, fontWeight:700, color:MID }}>{ds.ex.length}</div>}
                    </div>
                  );
                })}
              </div>

              <div style={{ padding:"14px 16px", borderRadius:16, background:BLS,
                border:`1px solid ${BLBR}`, display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>✨</span>
                <span style={{ fontSize:13, color:MID, lineHeight:1.5 }}>
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
