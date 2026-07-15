/**
import { I } from"../../../components/ui/Icon.jsx";
 * CreerKit.jsx — Tokens, constantes & composants du créateur de programme.
 * Extrait de Creer.jsx sans aucune modification de code.
 */

import { useState } from"react";
import { C, FONT, SERIF, CAT } from"../../../data/constants.js";
import { EX } from"../../../data/exercises.js";
import { Tabs } from"../../../components/ui/Tabs.jsx";


// ─── Tokens ──────────────────────────────────────────────────────────────────
const BL   = C.accent || C.accent;
const BLD  = C.accentDk || C.accentDk;
const BLS  ="rgba(60,91,255,0.12)";
const BLBR ="rgba(60,91,255,0.35)";
const BG   = C.bg;
const S1   = C.s1 ||"#FFFFFF";
const S2   = C.s2 || C.s2;
const BD   = C.bd  ||"rgba(0,0,0,0.05)";
const BDHI = C.bdHi ||"rgba(0,0,0,0.08)";
const TEXT = C.text ||"${C.text}";
const MID  = C.mid  ||"${C.mid}";
const DIM  = C.dim  ||"${C.dim}";
const GRN  = C.green ||"#12B76A";
const RED  ="#E5484D";
const PRP  ="#9DB0FF";
const AMB  ="#F59E0B";
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
const CAT_C = { ...CAT }; // palette catégorielle canonique (constants.js)
const cc = cat => CAT_C[cat] || CAT.principal;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseScheme = scheme => {
  const [left,right] = String(scheme||"3×10 · 60s").split("·").map(x=>x.trim());
  const [sets,reps]  = (left||"3×10").split("×").map(x=>x.trim());
  const rest = parseInt(String(right||"60").replace(/\D/g,""),10);
  return { sets:parseInt(sets,10)||3, reps:reps||"10", rest:rest||60 };
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS =`
@keyframes mcFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes mcPop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
@keyframes mcShine{0%,60%{background-position:-180% 0}100%{background-position:200% 0}}
.mc-page{animation:mcFadeUp .32s cubic-bezier(.22,1,.36,1) both}
.mc-pop{animation:mcPop .28s cubic-bezier(.34,1.56,.64,1) both}
.mc-shine{position:relative;overflow:hidden}
.mc-shine::after{content:"";position:absolute;inset:0;border-radius:inherit;
  background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.25) 50%,transparent 65%);
  background-size:200% 100%;animation:mcShine 3.2s ease-in-out infinite;pointer-events:none}
.mc-shine:active{transform:scale(.985)}
/* Scrollbar */
.mc-scroll::-webkit-scrollbar{width:0}
.mc-scroll{scrollbar-width:none}
/* Split card */
.mc-split{display:flex;align-items:center;gap:16px;text-align:left;cursor:pointer;
  border-radius:20px;padding:16px 20px;width:100%;border:1.5px solid;
  transition:all .24s cubic-bezier(.22,1,.36,1);font-family:${F};background:${S1};color:${TEXT}}
.mc-split:active{transform:scale(.985)}
/* Day cap */
.mc-day{padding:12px 0;border-radius:16px;border:1.5px solid;font-size:14px;font-weight:700;
  cursor:pointer;transition:all .22s cubic-bezier(.22,1,.36,1);font-family:${F};
  display:flex;align-items:center;justify-content:center}
/* Intensity chip */
.mc-int{padding:12px 20px;border-radius:12px;border:1.5px solid;font-size:14px;font-weight:700;
  cursor:pointer;transition:all .2s;font-family:${F}}
/* Day tab */
.mc-dtab{flex:0 0 auto;cursor:pointer;font-family:${F};font-size:14px;font-weight:700;
  padding:12px 20px;border-radius:12px;border:1.5px solid ${BD};
  background:${S1};color:${MID};transition:.18s;position:relative}
.mc-dtab.on{border-color:${BL};color:#FFF;background:${BLS}}
.mc-dtab.miss{border-color:rgba(229,72,77,0.5)}
/* Exercise card */
.mc-ex{background:${S1};border:1px solid ${BD};border-radius:20px;padding:16px;margin-bottom:12px}
.mc-metric{flex:1;background:${S2};border:1px solid ${BD};border-radius:12px;padding:8px 8px 12px;text-align:center}
.mc-m-lbl{display:block;text-align:center;font-size:10px;font-weight:700;letter-spacing:.9px;
  text-transform:uppercase;color:${DIM};margin-bottom:8px}
.mc-m-ctrl{display:flex;align-items:center;justify-content:space-between;gap:4px}
.mc-m-step{width:30px;height:30px;border-radius:8px;border:1px solid ${BD};background:${S1};
  color:${MID};font-size:20px;font-weight:600;display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex:0 0 auto;transition:.12s;padding:0}
.mc-m-step:active{transform:scale(.9)}
.mc-m-val{font-size:14px;font-weight:700;color:${TEXT};text-align:center;flex:1}
.mc-m-input{width:100%;background:transparent;border:none;outline:none;text-align:center;
  font-family:inherit;font-size:14px;font-weight:700;color:${TEXT};padding:4px 0;border-radius:8px}
.mc-m-input:focus{background:${BLS}}
/* Tempo toggle */
.mc-tempo{margin-top:12px;width:100%;cursor:pointer;font-family:${F};font-weight:700;font-size:13px;
  display:flex;align-items:center;gap:8px;color:${MID};
  background:transparent;border:none;padding:8px 2px 2px;transition:.16s}
.mc-tempo.open{color:${BL}}
.mc-adv{margin-top:12px;padding-top:16px;border-top:1px solid ${BD};
  display:flex;flex-direction:column;gap:16px;animation:mcFadeUp .2s ease both}
.mc-adv-input{background:${S2};border:1px solid ${BD};border-radius:12px;
  padding:12px 16px;font-family:${F};font-size:14px;font-weight:700;color:${TEXT};
  outline:none;width:100%;box-sizing:border-box;transition:.16s;letter-spacing:.5px}
.mc-adv-input:focus{border-color:${BLBR}}
.mc-method{cursor:pointer;font-family:${F};font-size:13px;font-weight:600;
  padding:8px 12px;border-radius:12px;border:1.5px solid ${BD};
  background:${S2};color:${MID};transition:.14s}
.mc-method.on{border-color:${BL};color:${BL};background:${BLS}}
/* Add button */
.mc-add-ex{width:100%;cursor:pointer;font-family:${F};font-weight:700;font-size:14px;
  padding:16px;border-radius:16px;border:1.5px dashed rgba(60,91,255,0.35);
  background:rgba(60,91,255,0.05);color:${BL};
  display:flex;align-items:center;justify-content:center;gap:8px;transition:.16s;margin-top:8px}
.mc-add-ex:active{transform:scale(.98)}
/* Recap */
.mc-recap-card{background:${S1};border:1px solid ${BD};border-radius:20px;padding:20px;margin-bottom:16px}
.mc-recap-day{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid ${BD}}
/* Fields */
.mc-field{width:100%;background:${S1};border:1.5px solid ${BD};border-radius:16px;
  padding:20px;font-size:16px;font-family:${F};color:${TEXT};outline:none;
  transition:.18s;box-sizing:border-box}
.mc-field::placeholder{color:${DIM}}
.mc-field:focus{border-color:${BLBR};background:${S2};box-shadow:0 0 0 3px rgba(60,91,255,0.12)}
/* Lib */
.mc-lib{background:${S1};border:1px solid ${BD};border-radius:16px;padding:16px;margin-bottom:12px;transition:.18s}
.mc-lib.added{border-color:rgba(18,183,106,0.35);background:linear-gradient(135deg,rgba(18,183,106,0.05),transparent)}
.mc-lib-add{margin-top:12px;width:100%;cursor:pointer;font-family:${F};font-weight:700;font-size:14px;
  padding:12px;border-radius:12px;border:none;
  background:linear-gradient(135deg,${BL},${BLD});color:#FFF;
  display:flex;align-items:center;justify-content:center;gap:8px;transition:.16s}
.mc-lib-add.done{background:rgba(18,183,106,0.12);color:${GRN};border:1px solid rgba(18,183,106,0.35)}
.mc-lib-add:active{transform:scale(.98)}
/* Seg bar */
.mc-seg{height:5px;border-radius:3px;flex:1;background:rgba(255,255,255,0.08);overflow:hidden}
.mc-seg i{display:block;height:100%;width:0;background:linear-gradient(90deg,${BL},${BLD});
  border-radius:3px;transition:width .45s cubic-bezier(.4,0,.2,1)}
.mc-seg.done i,.mc-seg.active i{width:100%}
/* Warning */
.mc-warn{display:flex;gap:12px;align-items:flex-start;border-radius:16px;padding:16px 16px;
  background:rgba(229,72,77,0.08);border:1px solid rgba(229,72,77,0.25)}
/* Empty state */
.mc-empty{text-align:center;padding:32px 12px;color:${MID};font-size:14px;
  display:flex;flex-direction:column;align-items:center;
  border:1px dashed ${BD};border-radius:20px;background:rgba(255,255,255,0.05)}
`;

// ─── ExCard ───────────────────────────────────────────────────────────────────
function ExCard({ ex, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false);
  const catColor = cc(ex.cat);
  const catLabel = ex.cat ==="principal" ?"PRINCIPAL" : ex.cat?.toUpperCase() ||"ISOLATION";

  return (
    <div className="mc-ex mc-pop" style={{ borderLeft:`3px solid ${catColor}`,
      boxShadow:`0 8px 24px -16px ${catColor}` }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", padding:"4px 8px",
            borderRadius:8, display:"inline-block", marginBottom:8,
            color:catColor, background:`${catColor}18`, border:`1px solid ${catColor}35` }}>
            {catLabel}
          </span>
          <div style={{ fontSize:16, fontWeight:700, color:TEXT, fontFamily:F, letterSpacing:-0.3, lineHeight:1.2, marginBottom:4 }}>{ex.nom}</div>
          <div style={{ fontSize:13, color:MID }}>{ex.series}×{ex.reps} · {ex.repos}s</div>
        </div>
        <button onClick={onRemove} style={{ width:40, height:40, borderRadius:12, flexShrink:0,
          border:"1px solid rgba(229,72,77,0.25)", background:"rgba(229,72,77,0.08)",
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:RED, fontSize:16 }}></button>
      </div>

      <div style={{ display:"flex", gap:8, marginTop:12 }}>
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
        <span style={{ fontSize:14 }}></span>
        {ex.methode && ex.methode!=="Standard"
          ? <span style={{ color:BL, fontWeight:700 }}>{ex.methode}{ex.tempo?` · ${ex.tempo}`:""}</span>
          :"Tempo & intensité"}
        <span style={{ marginLeft:"auto", fontSize:11, transition:"transform .2s",
          display:"inline-block", transform:open?"rotate(180deg)":"none" }}>▾</span>
      </button>

      {open && (
        <div className="mc-adv">
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
              color:DIM, marginBottom:8, fontFamily:F }}>Tempo</div>
            <input className="mc-adv-input" placeholder="ex. 3-0-1-0"
              value={ex.tempo||""} onChange={e => onUpdate({...ex,tempo:e.target.value})}/>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
              color:DIM, marginBottom:8, fontFamily:F }}>Méthode d'intensité</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
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
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:340, overflowY:"auto" }}>
      <div style={{ maxWidth:500, margin:"0 auto", padding:"20px 20px 32px" }}>
        <button onClick={() => setGuideEx(null)} style={{ background:"transparent", border:"none",
          color:BL, cursor:"pointer", fontSize:13, fontWeight:700, display:"flex",
          alignItems:"center", gap:4, marginBottom:20, fontFamily:F }}><I name="chevronLeft" size={14}/> Retour</button>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", padding:"4px 8px",
          borderRadius:8, display:"inline-block", marginBottom:12,
          color:cc(guideEx.cat), background:`${cc(guideEx.cat)}18` }}>{guideEx.cat?.toUpperCase()}</span>
        <div style={{ fontSize:20, fontWeight:700, color:TEXT, fontFamily:F, marginBottom:16, letterSpacing:-0.3 }}>{guideEx.n}</div>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {[{l:"Séries",v:guideEx.s},{l:"Reps",v:guideEx.r},{l:"Repos",v:guideEx.rest},{l:"Charge",v:guideEx.ch}].map(s=>(
            <div key={s.l} style={{ flex:1, padding:"12px 8px", background:S1, border:`1px solid ${BD}`,
              borderRadius:12, textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, color:BL, fontFamily:F }}>{s.v}</div>
              <div style={{ fontSize:10, color:MID, marginTop:2 }}>{s.l}</div>
            </div>
))}
        </div>
        <Tabs items={[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}]}
          value={guideTab} onChange={setGuideTab}/>
        <div style={{ padding:"12px 0" }}>
          {guideTab==="tips" && (guideEx.tips||[]).map((tip,i,arr) => (
            <div key={i} style={{ display:"flex", gap:12, paddingBottom:16, marginBottom:16,
              borderBottom:i<arr.length-1?`1px solid ${BD}`:"none" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:BLS,
                border:`1px solid ${BLBR}`, display:"grid", placeItems:"center",
                flexShrink:0, fontSize:10, fontWeight:700, color:BL }}>{i+1}</div>
              <div style={{ fontSize:13, color:TEXT, lineHeight:1.6 }}>{tip}</div>
            </div>
))}
          {guideTab==="variantes" && (guideEx.variantes||[]).map((v,i) => (
            <div key={i} style={{ paddingBottom:12, marginBottom:12,
              borderBottom:`1px solid ${BD}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:4 }}>{v.nom||v}</div>
              {v.note && <div style={{ fontSize:11, color:MID, lineHeight:1.5 }}>{v.note}</div>}
            </div>
))}
          {guideTab==="erreurs" && (guideEx.erreurs||[]).map((e,i) => (
            <div key={i} style={{ display:"flex", gap:12, marginBottom:12, alignItems:"flex-start" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(229,72,77,0.12)",
                border:"1px solid rgba(229,72,77,0.25)", display:"grid", placeItems:"center",
                flexShrink:0, fontSize:10, color:RED }}></div>
              <div style={{ fontSize:13, color:TEXT, lineHeight:1.6 }}>{e}</div>
            </div>
))}
          {guideTab==="morpho" && (guideEx.morpho||"").split('\n').filter(Boolean).map((line,i,arr)=>(
            <div key={i} style={{ display:"flex", gap:8, paddingBottom:12, marginBottom:12,
              borderBottom:i<arr.length-1?`1px solid ${BD}`:"none" }}>
              <div style={{ fontSize:14, flexShrink:0 }}>{line.split(':')[0].trim()}</div>
              <div style={{ fontSize:11, color:TEXT, lineHeight:1.6, flex:1 }}>{line.split(':').slice(1).join(':').trim()}</div>
            </div>
))}
        </div>
        <button onClick={() => { onAdd(guideEx); setGuideEx(null); }}
          className={`mc-lib-add${addedNoms.includes(guideEx.n)?" done":""}`}>
          {addedNoms.includes(guideEx.n) ?" Déjà ajouté" :"+ Ajouter cet exercice"}
        </button>
      </div>
    </div>
);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:320 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"absolute", inset:0,
        background:"rgba(3,5,10,0.85)", backdropFilter:"blur(4px)" }}/>
      {/* Sheet */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0,
        background:C.s1,
        borderRadius:"28px 28px 0 0", borderTop:`1px solid ${BLBR}`,
        height:"82%", display:"flex", flexDirection:"column",
        boxShadow: C.shadow }}>
        <div style={{ width:40, height:5, borderRadius:3,
          background:"rgba(255,255,255,0.18)", margin:"14px auto 6px" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"8px 20px 16px" }}>
          <div style={{ fontSize:20, fontWeight:700, color:TEXT, fontFamily:SF,
            letterSpacing:-0.5 }}>Ajouter un exercice</div>
          <button onClick={onClose} style={{ width:40, height:40, borderRadius:12,
            border:`1px solid ${BD}`, background:S1, display:"grid", placeItems:"center",
            color:MID, cursor:"pointer", fontSize:20 }}>×</button>
        </div>
        {/* Search */}
        <div style={{ padding:"0 20px 12px" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            style={{ width:"100%", padding:"12px 16px", background:S1,
              border:`1px solid ${BD}`, borderRadius:16, color:TEXT,
              fontSize:14, fontFamily:F, outline:"none", boxSizing:"border-box" }}/>
        </div>
        {/* Groupes */}
        {!search && (
          <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"0 20px 16px",
            flexShrink:0 }} className="mc-scroll">
            {Object.keys(EX).map(g => {
              const on = muscle===g;
              return (
                <button key={g} onClick={() => setMuscle(g)} style={{ flexShrink:0,
                  padding:"8px 16px", borderRadius:12, border:`1.5px solid ${on?BL:BD}`,
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
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
                  padding:"4px 8px", borderRadius:8, display:"inline-block", marginBottom:8,
                  color:cc_, background:`${cc_}18`, border:`1px solid ${cc_}35` }}>
                  {ex.cat?.toUpperCase()}
                </span>
                <div style={{ fontSize:16, fontWeight:700, color:TEXT, marginBottom:4, fontFamily:F, letterSpacing:-0.2 }}>{ex.n}</div>
                <div style={{ fontSize:13, color:MID, marginBottom:4 }}>{ex.s}×{ex.r} · {ex.rest}</div>
                <div style={{ fontSize:13, color:DIM, fontStyle:"italic", lineHeight:1.5, marginBottom:12 }}>
                  {(ex.morpho||"").substring(0,80)}…
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => onAdd(ex)} className={`mc-lib-add${added?" done":""}`} style={{ flex:1 }}>
                    {added ?" Ajouté" :"+ Ajouter"}
                  </button>
                  <button onClick={() => setGuideEx(ex)} style={{ padding:"12px 16px",
                    background:BLS, border:`1px solid ${BLBR}`, borderRadius:12,
                    color:BL, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:F }}>
                    <>Guide <I name="chevronRight" size={12}/></>
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

export { BL, BLD, BLS, BLBR, BG, S1, S2, BD, BDHI, TEXT, MID, DIM, GRN, RED, PRP, AMB, F, SF, DAYS_ALL, SPLITS, INTENSITIES, METHODS, CAT_C, cc, parseScheme, CSS, ExCard, BiblioSheet };
