// ─── ProgressionPage.jsx ─────────────────────────────────────────────────────
// Progression de charge : sélection muscle → exercice (rail) → graphe 1RM.
// Données connectées à l'historique Focus Mode + records du programme.
// Swipe-back depuis le bord gauche pour revenir.
import { useState, useMemo } from"react";
import useScrollTop from"../../hooks/useScrollTop.js";
import { useSwipeBack } from"../../hooks/useSwipeBack.js";
import { calc1RM } from"../../utils/training.js";
import { C, FONT, NUM } from"../../data/constants.js";
import { I, ID } from"../../components/ui/Icon.jsx";

const F = FONT;
const BL = C.accent;
const GRN = "#12B76A";
const RED = "#E5484D";

// ── Groupes musculaires ──────────────────────────────────────────────────────
const MUSCLES = [
  { id:"Pectoraux",       label:"Pectoraux",  icon:"gym" },
  { id:"Dos",             label:"Dos",         icon:"gym" },
  { id:"Épaules",         label:"Épaules",     icon:"gym" },
  { id:"Biceps",          label:"Biceps",      icon:"gym" },
  { id:"Triceps",         label:"Triceps",     icon:"gym" },
  { id:"Quadriceps",      label:"Jambes",      icon:"dumbbell" },
  { id:"Ischio-jambiers", label:"Ischios",     icon:"dumbbell" },
  { id:"Fessiers",        label:"Fessiers",    icon:"dumbbell" },
  { id:"Abdominaux",      label:"Abdos",       icon:"target" },
  { id:"Lombaires",       label:"Lombaires",   icon:"target" },
  { id:"Mollets",         label:"Mollets",     icon:"dumbbell" },
  { id:"Avant-bras",      label:"Avant-bras",  icon:"gym" },
  { id:"Trapèzes",        label:"Trapèzes",    icon:"gym" },
];

// ── Mini graphe SVG ──────────────────────────────────────────────────────────
function MiniChart({ data }) {
  if (!data || data.length < 2) return null;
  const W=280, H=100, P=8;
  const rms = data.map(d=>d.rm);
  const mn = Math.min(...rms)*0.95, mx = Math.max(...rms)*1.05, sp = mx-mn||1;
  const pts = data.map((d,i) => ({
    x: P + (i/(data.length-1))*(W-2*P),
    y: P + (H-2*P) - ((d.rm-mn)/sp)*(H-2*P),
  }));
  const line = pts.map((p,i)=>(!i?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ");
  const area = line + ` L${pts[pts.length-1].x.toFixed(1)},${H-P} L${P},${H-P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height: 120 }}>
      <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={BL} stopOpacity=".15"/>
        <stop offset="100%" stopColor={BL} stopOpacity=".01"/>
      </linearGradient></defs>
      <path d={area} fill="url(#pg)"/>
      <path d={line} fill="none" stroke={BL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="5" fill={BL} stroke="#FFF" strokeWidth="2.5"/>
    </svg>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function ProgressionPage({ EX, prog, setProg, push, onClose }) {
  useScrollTop();
  const { swipeStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeBack(onClose);
  const [selMuscle, setSelMuscle] = useState(MUSCLES[0].id);
  const [selExIdx, setSelExIdx] = useState(0);
  const [period, setPeriod] = useState("3M");

  // Exercices du muscle sélectionné + données historiques connectées
  const exos = useMemo(() => (EX?.[selMuscle] || []).map(ex => {
    const nom = ex.n;
    let hist = [];
    // Historique depuis les séances du programme (Focus Mode)
    (prog?.jours || []).forEach(j => (j.exercices || []).forEach(e => {
      if (e.nom === nom) {
        // Séries loggées en Focus Mode
        (e.sets || []).forEach(s => {
          if (s.poids && s.reps) {
            hist.push({ poids: s.poids, reps: s.reps, date: s.date || e.lastDate || "" });
          }
        });
        // Historique déjà agrégé
        (e.historique || []).forEach(h => hist.push(h));
      }
    }));
    // Records manuels
    const recRaw = prog?.records?.[nom];
    const recHist = Array.isArray(recRaw) ? recRaw : (recRaw?.historique || []);
    recHist.forEach(h => hist.push(h));
    // Dédoublonner par date+poids+reps
    const seen = new Set();
    hist = hist.filter(h => {
      const k = `${h.date}-${h.poids}-${h.reps}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).sort((a,b) =>
      String(a.date||"").split("/").reverse().join("")
        .localeCompare(String(b.date||"").split("/").reverse().join(""))
    );
    const chartData = hist.map(h => ({
      rm: calc1RM(parseFloat(h.poids), parseInt(h.reps)),
      date: h.date,
      poids: parseFloat(h.poids),
      reps: parseInt(h.reps),
    })).filter(d => d.rm > 0);
    const currentRM = chartData.length ? chartData[chartData.length-1].rm : 0;
    const bestRM = chartData.length ? Math.max(...chartData.map(d=>d.rm)) : 0;
    const firstRM = chartData.length ? chartData[0].rm : 0;
    const pctProg = firstRM > 0 ? Math.round(((currentRM-firstRM)/firstRM)*100) : 0;
    const lastEntry = chartData.length ? chartData[chartData.length-1] : null;
    return { nom, mat: ex.mat, chartData, currentRM, bestRM, pctProg, lastEntry, nbSeances: chartData.length };
  }), [EX, selMuscle, prog]);

  const selEx = exos[selExIdx] || exos[0] || null;

  const filterByPeriod = (data) => {
    if (!data || !data.length) return data;
    const now = Date.now();
    const ms = { "1M":30, "3M":90, "6M":180, "1A":365, "Tout":9999 };
    const days = ms[period] || 90;
    return data.filter(d => {
      const parts = (d.date||"").split("/");
      if (parts.length < 3) return true;
      const dt = new Date(parts[2]+"-"+parts[1]+"-"+parts[0]);
      return (now - dt.getTime()) / 86400000 <= days;
    });
  };

  const filteredChart = selEx ? filterByPeriod(selEx.chartData) : [];
  const startRM = filteredChart.length ? filteredChart[0].rm : 0;
  const endRM = filteredChart.length ? filteredChart[filteredChart.length-1].rm : 0;
  const recordRM = filteredChart.length ? Math.max(...filteredChart.map(d=>d.rm)) : 0;
  const startDate = filteredChart.length ? filteredChart[0].date : "—";
  const endDate = filteredChart.length ? filteredChart[filteredChart.length-1].date : "—";
  const recordDate = filteredChart.length ? filteredChart.find(d=>d.rm===recordRM)?.date || "—" : "—";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100,
      background: C.bg, fontFamily: F }}
      onTouchStart={e => { e.stopPropagation(); onTouchStart(e); }}
      onTouchMove={e => { e.stopPropagation(); onTouchMove(e); }}
      onTouchEnd={e => { e.stopPropagation(); onTouchEnd(e); }}>
      <div style={{ ...swipeStyle, minHeight:"100%", overflowY:"auto",
        WebkitOverflowScrolling:"touch", background: C.bg }}>

      {/* ── Titre section (pas dans le header) ── */}
      <div style={{ padding:"24px 20px 4px" }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", color: BL,
          marginBottom:6 }}>SUIVI DE FORCE · 1RM ESTIMÉ</div>
        <div style={{ fontSize:26, fontWeight:700, letterSpacing:-0.5, color: C.text }}>
          Progression <span style={{ fontStyle:"italic", color: BL, fontWeight:400 }}>de force</span>
        </div>
        <div style={{ fontSize:13, color: C.dim, fontWeight:500, marginTop:4 }}>
          1RM réel par exercice, séance après séance
        </div>
      </div>

      {/* ── 1. Muscles ── */}
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", color: C.dim,
        padding:"20px 20px 10px" }}>GROUPE MUSCULAIRE</div>
      <div style={{ display:"flex", gap:10, padding:"0 20px", overflowX:"auto",
        scrollbarWidth:"none", WebkitOverflowScrolling:"touch", paddingBottom:6 }}>
        {MUSCLES.map(m => {
          const on = selMuscle === m.id;
          return (
            <button key={m.id} onClick={() => { setSelMuscle(m.id); setSelExIdx(0); }}
              className="tap" style={{
                flex:"none", width:72, display:"flex", flexDirection:"column",
                alignItems:"center", gap:6, padding:"10px 6px 8px",
                borderRadius:14, border:`1.5px solid ${on ? BL :"transparent"}`,
                background: on ?"rgba(60,91,255,.06)" :"transparent",
                cursor:"pointer",
              }}>
              <div style={{ width:44, height:44, borderRadius:12,
                background: on ?"rgba(60,91,255,.12)" :"#F0F2F5",
                display:"grid", placeItems:"center" }}>
                <ID name={m.icon} size={22}/>
              </div>
              <span style={{ fontSize:10, fontWeight:700,
                color: on ? BL : C.dim, textAlign:"center" }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 2. Exercices (rail horizontal) ── */}
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", color: C.dim,
        padding:"16px 20px 10px" }}>EXERCICE</div>
      <div style={{ display:"flex", gap:10, padding:"0 20px", overflowX:"auto",
        scrollbarWidth:"none", WebkitOverflowScrolling:"touch", paddingBottom:6 }}>
        {exos.map((ex, idx) => {
          const on = selExIdx === idx;
          return (
            <button key={ex.nom} onClick={() => setSelExIdx(idx)}
              className="tap" style={{
                flex:"none", width:140, textAlign:"left",
                background:"#FFF", border:`1.5px solid ${on ?"rgba(60,91,255,.35)" :"rgba(0,0,0,.07)"}`,
                borderRadius:14, padding:12, cursor:"pointer",
                boxShadow: on ?"0 2px 8px rgba(60,91,255,.15)" :"none",
                display:"flex", flexDirection:"column", gap:5,
              }}>
              <div style={{ fontSize:12, fontWeight:700, lineHeight:1.3, color: C.text,
                display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                overflow:"hidden" }}>{ex.nom}</div>
              <div style={{ fontSize:9.5, color: C.dim, fontWeight:600 }}>{ex.mat || "—"}</div>
              {ex.currentRM > 0 ? (
                <>
                  <div style={{ display:"flex", alignItems:"baseline", gap:3, marginTop:2 }}>
                    <span style={{ fontSize:8, fontWeight:700, color: BL,
                      background:"rgba(60,91,255,.1)", padding:"2px 5px", borderRadius:4 }}>1RM</span>
                    <span style={{ fontSize:17, fontWeight:700, color: C.text, ...NUM }}>
                      {Math.round(ex.currentRM)}
                    </span>
                    <span style={{ fontSize:10, color: C.dim, fontWeight:600 }}>kg</span>
                  </div>
                  {ex.lastEntry && (
                    <div style={{ fontSize:9, color: C.dim, fontWeight:500 }}>
                      Dernier : {ex.lastEntry.poids}kg × {ex.lastEntry.reps} reps
                    </div>
                  )}
                  {ex.pctProg !== 0 && (
                    <div style={{ fontSize:10, fontWeight:700,
                      color: ex.pctProg > 0 ? GRN : RED }}>
                      {ex.pctProg > 0 ?"↗" :"↘"} {ex.pctProg > 0 ?"+":""}
                      {ex.pctProg}%
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize:10, color: C.dim, fontStyle:"italic", marginTop:2 }}>
                  Pas encore de données
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. Graphe ── */}
      {selEx && (
        <>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", color: C.dim,
            padding:"14px 20px 8px" }}>TA PROGRESSION</div>
          <div style={{ margin:"0 20px", background:"#FFF", border:"1px solid rgba(0,0,0,.06)",
            borderRadius:16, padding:"16px 16px 12px", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              marginBottom:12 }}>
              <span style={{ fontSize:14, fontWeight:700 }}>Évolution du 1RM</span>
              <div style={{ display:"flex", gap:3 }}>
                {["1M","3M","6M","1A","Tout"].map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{
                    padding:"5px 9px", borderRadius:7, fontSize:10, fontWeight:700,
                    color: period===p ?"#FFF" : C.dim,
                    background: period===p ? BL :"transparent",
                    border:"none", cursor:"pointer",
                  }}>{p}</button>
                ))}
              </div>
            </div>
            {filteredChart.length >= 2
              ? <MiniChart data={filteredChart}/>
              : <div style={{ padding:"24px 0", textAlign:"center", fontSize:13,
                  color: C.dim }}>
                  {filteredChart.length === 1
                    ?"Encore une entrée pour voir ta courbe."
                    :"Aucune donnée sur cette période."}
                </div>
            }
          </div>

          {/* ── Stats Départ / Record / Actuel ── */}
          <div style={{ display:"flex", gap:8, margin:"10px 20px" }}>
            {[
              { lab:"Départ", val: startRM, date: startDate, color: C.text },
              { lab:"Record", val: recordRM, date: recordDate, color: BL },
              { lab:"Actuel", val: endRM, date: endDate, color: GRN },
            ].map(s => (
              <div key={s.lab} style={{ flex:1, background:"#FFF", border:"1px solid rgba(0,0,0,.06)",
                borderRadius:13, padding:12, textAlign:"center" }}>
                <div style={{ fontSize:9, color: C.dim, fontWeight:600, marginBottom:5 }}>{s.lab}</div>
                <div style={{ fontSize:18, fontWeight:700, color: s.color, ...NUM }}>
                  {s.val ? Math.round(s.val) :"—"}<small style={{ fontSize:11, color: C.dim, fontWeight:600 }}> kg</small>
                </div>
                <div style={{ fontSize:8, color:"#9AA1AC", marginTop:2 }}>{s.date}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 40 }}/>
      </div>
    </div>
  );
}
