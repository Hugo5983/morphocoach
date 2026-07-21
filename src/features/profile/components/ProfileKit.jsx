/**
 * ProfileKit.jsx — Icônes & composants visuels de la page Profil.
 * Extrait de ProfilePage.jsx sans aucune modification de code.
 */

import { useState } from"react";
import { Ico as UIco } from"../../../components/ui/Icon.jsx";
import { C, DARK, FONT, NUM } from"../../../data/constants.js";

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
function I({ d, size = 18, color = "currentColor", sw = 1.8 }) {
  return <UIco name={d} size={size} color={color} stroke={sw}/>;
}

const ic = {
  flame:"streak", dumbbell:"gym", bone:"bone", drop:"hydration",
  heart:"cardio", ruler:"ruler", target:"goal", zap:"energy",
  activity:"progress", crown:"crown", upload:"progress", chev:"chevronRight",
};

// ─── Carte Glass ──────────────────────────────────────────────────────────────
function Glass({ children, style = {}, glow, pad = 18, onClick }) {
  return (
    <div onClick={onClick} style={{
      position:"relative",
      borderRadius: 20,
      padding: pad,
      background:"linear-gradient(160deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05))",
      border:"1px solid rgba(0,0,0,0.05)",
      boxShadow: glow
        ?`0 18px 40px -22px ${glow}, inset 0 1px 0 rgba(0,0,0,0.05)`
        :"0 18px 40px -28px rgba(0,0,0,0.85), inset 0 1px 0 rgba(0,0,0,0.05)",
      cursor: onClick ?"pointer" :"default",
      ...style,
    }}>
      {children}
    </div>
);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, unit, label, color }) {
  return (
    <Glass pad={0} style={{ flex: 1 }}>
      <div style={{ padding:"20px 8px 16px", textAlign:"center", position:"relative", overflow:"hidden", borderRadius: 20,
        background:`linear-gradient(160deg, ${color}24, ${color}08)`,
        border:`1px solid ${color}40`,
        boxShadow:`0 6px 18px -10px ${color}` }}>
        <div style={{
          position:"absolute", top: -30, left:"50%", transform:"translateX(-50%)",
          width: 120, height: 120, borderRadius:"50%",
          background:`radial-gradient(circle, ${color}40, transparent 70%)`,
          pointerEvents:"none",
        }}/>
        <div style={{ position:"relative" }}>
          <span style={{ fontSize: 26, fontWeight:700, color, letterSpacing: -1, fontFamily: FONT, ...NUM }}>{value ??"—"}</span>
          {unit && <span style={{ fontSize: 13, fontWeight: 700, color, marginLeft: 2, fontFamily: FONT }}>{unit}</span>}
        </div>
        <div style={{ position:"relative", fontSize: 11, color: C.mid, marginTop: 4, fontWeight: 600, fontFamily: FONT }}>{label}</div>
      </div>
    </Glass>
);
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function Tabs({ active, setActive }) {
  const items = ["Profil","Compo.","Mesures"];
  const idx = items.indexOf(active);
  return (
    <div style={{
      position:"relative", display:"flex", padding: 4, borderRadius: 20,
      background:"rgba(0,0,0,0.05)", border:"1px solid rgba(0,0,0,0.05)",
      boxShadow:"inset 0 1px 2px rgba(0,0,0,0.35)",
    }}>
      <div style={{
        position:"absolute", top: 5, bottom: 5, left: 5,
        width:"calc((100% - 10px) / 3)",
        transform:`translateX(${idx * 100}%)`,
        borderRadius: 16,
        background:"linear-gradient(145deg, #3C5BFF, #2E48D9)",
        border:"1px solid rgba(46,72,217,0.65)",
        boxShadow:"0 6px 18px -6px rgba(60,91,255,0.95)",
        transition:"transform .35s cubic-bezier(.65,0,.35,1)",
      }}/>
      {items.map(it => (
        <button key={it} onClick={() => setActive(it)} style={{
          flex: 1, position:"relative", zIndex: 1, background:"transparent",
          border:"none", padding:"12px 0", borderRadius: 16, cursor:"pointer",
          fontFamily: FONT, fontSize: 14, fontWeight: active === it ? 700 : 500,
          color: active === it ?"#FFF" : C.mid, transition:"color .25s",
        }}>{it}</button>
))}
    </div>
);
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children, icon }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: 8, margin:"24px 4px 12px" }}>
      {icon && <I d={icon} size={13} color={DARK.accent}/>}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing:"0.1em", color:"${C.dim}", fontFamily: FONT, textTransform:"uppercase" }}>{children}</span>
    </div>
);
}

// ─── Row (affichage) ──────────────────────────────────────────────────────────
function Row({ label, value, accent, last }) {
  return (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"16px 20px",
      borderBottom: last ?"none" :"1px solid rgba(0,0,0,0.05)",
    }}>
      <span style={{ color: C.mid, fontSize: 14, fontFamily: FONT }}>{label}</span>
      <span style={{ color: accent || C.text, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>{value ||"—"}</span>
    </div>
);
}

// ─── Ligne éditable ───────────────────────────────────────────────────────────
function EditRow({ label, value, displayValue, type ="text", onChange, options, unit, last }) {
  const [editing, setEditing] = useState(false);
  return (
    <div onClick={() => !editing && setEditing(true)} style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"16px 20px",
      borderBottom: last ?"none" :"1px solid rgba(0,0,0,0.05)",
      cursor: editing ?"default" :"pointer",
    }}>
      <span style={{ color: C.mid, fontSize: 14, fontFamily: FONT }}>{label}</span>
      {editing ? (
        options
          ? <select autoFocus value={value ||""} onChange={e => { onChange(e.target.value); setEditing(false); }}
              onBlur={() => setEditing(false)}
              style={{ background: C.s2, border:"1px solid rgba(60,91,255,0.5)", borderRadius: 8, color: C.text, fontSize: 13, padding:"8px 12px", outline:"none" }}>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          : <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
              <input autoFocus type={type} value={value ||""}
                onChange={e => onChange(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={e => e.key ==="Enter" && setEditing(false)}
                style={{ background: C.s2, border:"1px solid rgba(60,91,255,0.5)", borderRadius: 8, color: C.text, fontSize: 13, padding:"8px 12px", outline:"none", maxWidth: 90, textAlign:"right" }}
              />
              {unit && <span style={{ fontSize: 11, color:"${C.dim}", fontFamily: FONT }}>{unit}</span>}
            </div>
) : (
        <span style={{ fontSize: 14, fontWeight: 700, color: value ? C.text : C.dim, fontFamily: FONT }}>
          {displayValue || value || <span style={{ fontSize: 13, fontWeight: 400, color: C.dim }}>Ajouter</span>}
          {unit && value && <span style={{ fontSize: 11, color:"${C.dim}", fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
        </span>
)}
    </div>
);
}

// ─── Add Row (mensuration) ────────────────────────────────────────────────────
function AddRow({ icon, color, label, value, unit, onChange, last }) {
  const [editing, setEditing] = useState(false);
  return (
    <div onClick={() => !editing && setEditing(true)} style={{
      display:"flex", alignItems:"center", gap: 16,
      padding:"16px 20px",
      borderBottom: last ?"none" :"1px solid rgba(0,0,0,0.05)",
      cursor: editing ?"default" :"pointer",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, display:"grid", placeItems:"center", flexShrink: 0,
        background:`linear-gradient(145deg, ${color}, ${color}cc)`,
        border:`1px solid ${color}`,
        boxShadow:`0 4px 12px -2px ${color}88`,
      }}>
        <I d={icon} size={17} color="#FFF" sw={2}/>
      </div>
      <span style={{ flex: 1, color: C.text, fontSize: 14, fontWeight: 500, fontFamily: FONT }}>{label}</span>
      {editing
        ? <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
            <input autoFocus type="number" value={value ||""}
              onChange={e => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={e => e.key ==="Enter" && setEditing(false)}
              style={{ background: C.s2, border:"1px solid rgba(60,91,255,0.5)", borderRadius: 8, color: C.text, fontSize: 13, padding:"8px 12px", outline:"none", width: 70, textAlign:"right" }}
            />
            <span style={{ fontSize: 11, color:"${C.dim}" }}>cm</span>
          </div>
        : value
          ? <span style={{ fontSize: 14, fontWeight: 700, color: color, fontFamily: FONT }}>{value} cm</span>
          : <span style={{ fontSize: 13, fontWeight: 600, color: DARK.accent, display:"flex", alignItems:"center", gap: 2, fontFamily: FONT }}>
              Ajouter <I d={ic.chev} size={14} color={DARK.accent} sw={2}/>
            </span>
      }
    </div>
);
}

// ─── Macro Ring ───────────────────────────────────────────────────────────────
function MacroRing({ value, max, label, color }) {
  const r = 30, circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <Glass pad={14} style={{ flex: 1, textAlign:"center" }} glow={`${color}55`}>
      <div style={{ position:"relative", width: 76, height: 76, margin:"0 auto" }}>
        <svg width="76" height="76" style={{ transform:"rotate(-90deg)" }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
          <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            style={{ transition:"stroke-dashoffset 1s cubic-bezier(.65,0,.35,1)" }}
          />
        </svg>
        <div style={{ position:"absolute", inset: 0, display:"grid", placeItems:"center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight:700, color, fontFamily: FONT, ...NUM }}>{value || 0}</div>
            <div style={{ fontSize: 10, color:"${C.dim}", marginTop: -2 }}>g</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: C.mid, marginTop: 8, fontFamily: FONT }}>{label}</div>
    </Glass>
);
}

// ─── Compo Bar ────────────────────────────────────────────────────────────────
function CompoBar({ icon, color, label, value, unit, onChange, pct, last }) {
  const [editing, setEditing] = useState(false);
  const pctVal = pct || 0;
  return (
    <div style={{ padding:"16px 20px", borderBottom: last ?"none" :"1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ display:"flex", alignItems:"center", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 12, display:"grid", placeItems:"center", flexShrink: 0,
          background:`linear-gradient(145deg, ${color}, ${color}cc)`,
          border:`1px solid ${color}`,
          boxShadow:`0 4px 12px -2px ${color}88`,
        }}>
          <I d={icon} size={16} color="#FFF" sw={2}/>
        </div>
        <span style={{ flex: 1, color: C.text, fontSize: 14, fontWeight: 500, fontFamily: FONT }}>{label}</span>
        {editing
          ? <div style={{ display:"flex", alignItems:"center", gap: 4 }}>
              <input autoFocus type="number"
                value={value ||""}
                onChange={e => onChange(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={e => e.key ==="Enter" && setEditing(false)}
                style={{ background: C.s2, border:"1px solid rgba(60,91,255,0.5)", borderRadius: 8, color: C.text, fontSize: 13, padding:"4px 8px", outline:"none", width: 70, textAlign:"right" }}
              />
              <span style={{ fontSize: 11, color:"${C.dim}" }}>{unit}</span>
            </div>
          : <span onClick={() => setEditing(true)}
              style={{ fontSize: 14, fontWeight: 700, color: value ? color : DARK.accent, cursor:"pointer", fontFamily: FONT }}>
              {value ?`${value}${unit}` : <span style={{ fontSize: 13, color: DARK.accent }}>Ajouter</span>}
            </span>
        }
      </div>
      {/* Barre de progression */}
      <div style={{ height: 7, borderRadius: 999, background:"rgba(0,0,0,0.05)", overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pctVal}%`, borderRadius: 999,
          background:`linear-gradient(90deg, ${color}, ${color}99)`,
          transition:"width 1s cubic-bezier(.65,0,.35,1)",
        }}/>
      </div>
    </div>
);
}

// ─── ACTIVITE LABELS ──────────────────────────────────────────────────────────
const ACTIVITE_LABELS = {
  sedentaire:"Sédentaire · bureau",
  leger:"Léger · 1–3×/sem",
  modere:"Modéré · 3–5×/sem",
  actif:"Actif · 6–7×/sem",
  tres_actif:"Très actif · 2×/jour",
};

// ─── Graphique de suivi du poids ──────────────────────────────────────────────
function WeightChart({ log }) {
  // Normalise + trie par date (format fr"JJ/MM/AAAA")
  const parseFr = (d) => {
    const [j, m, y] = String(d).split("/").map(Number);
    return new Date(y, (m || 1) - 1, j || 1).getTime();
  };
  const data = (Array.isArray(log) ? log : [])
    .filter(e => e && e.poids && e.date)
    .map(e => ({ ...e, t: parseFr(e.date), poids: parseFloat(e.poids) }))
    .sort((a, b) => a.t - b.t)
    .slice(-30); // 30 dernières pesées

  if (data.length < 2) {
    return (
      <Glass pad={0} style={{ animation:"rise .4s .05s both" }}>
        <div style={{ padding:"24px 20px", textAlign:"center" }}>
          <div style={{ marginBottom: 8, display:"flex", justifyContent:"center" }}><UIco name="scale" size={32}/></div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: FONT, marginBottom: 4 }}>
            Suivi du poids
          </div>
          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.5, fontFamily: FONT, maxWidth: 250, margin:"0 auto" }}>
            Mets à jour ton poids régulièrement dans l'onglet Profil pour voir ta courbe d'évolution.
          </div>
        </div>
      </Glass>
);
  }

  const W = 320, H = 150, PL = 8, PR = 8, PT = 16, PB = 26;
  const cW = W - PL - PR, cH = H - PT - PB;
  const vals = data.map(d => d.poids);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = (max - min) * 0.25 || 1;
  const lo = min - pad, hi = max + pad, range = hi - lo || 1;
  const pts = data.map((d, i) => ({
    x: PL + (data.length === 1 ? cW / 2 : (i / (data.length - 1)) * cW),
    y: PT + cH - ((d.poids - lo) / range) * cH,
    ...d,
  }));
  const line = pts.reduce((acc, p, i) => {
    if (i === 0) return`M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i - 1], t = 0.4;
    const c1 = (prev.x + (p.x - prev.x) * t).toFixed(1);
    const c2 = (p.x - (p.x - prev.x) * t).toFixed(1);
    return`${acc} C${c1},${prev.y.toFixed(1)} ${c2},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  },"");
  const fill =`${line} L${pts[pts.length - 1].x.toFixed(1)},${PT + cH} L${pts[0].x.toFixed(1)},${PT + cH} Z`;

  const first = data[0], last = data[data.length - 1];
  const delta = (last.poids - first.poids);
  const deltaColor = delta < 0 ?"#12B76A" : delta > 0 ?"#3C5BFF" : C.dim;
  const fmtShort = (d) => { const [j, m] = String(d).split("/"); return`${j}/${m}`; };

  return (
    <Glass pad={0} style={{ animation:"rise .4s .05s both" }}>
      <div style={{ padding:"16px 16px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing:"0.1em", color: C.dim, fontFamily: FONT, marginBottom: 4 }}>SUIVI DU POIDS</div>
            <div style={{ display:"flex", alignItems:"baseline", gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight:700, color: DARK.accent, fontFamily: FONT, letterSpacing: -1, ...NUM }}>{last.poids}</span>
              <span style={{ fontSize: 13, color: C.mid, fontWeight: 600 }}>kg</span>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize: 10, color:"#98A2B3", fontFamily: FONT }}>Depuis le {fmtShort(first.date)}</div>
            <div style={{ fontSize: 14, fontWeight:700, color: deltaColor, fontFamily: FONT, ...NUM }}>
              {delta > 0 ?"+" :""}{delta.toFixed(1)} kg
            </div>
          </div>
        </div>

        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display:"block", overflow:"visible" }}>
          <defs>
            <linearGradient id="wgt-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={DARK.accent} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={DARK.accent} stopOpacity="0.01"/>
            </linearGradient>
          </defs>
          {[0.5].map((f, i) => (
            <line key={i} x1={PL} x2={W - PR} y1={PT + cH * f} y2={PT + cH * f}
              stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="3 4"/>
))}
          <path d={fill} fill="url(#wgt-grad)"/>
          <path d={line} fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {pts.map((p, i) => (
            <g key={i}>
              {(i === 0 || i === pts.length - 1) && (
                <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 4}
                  fill={i === pts.length - 1 ? C.accent :"#FFF"} stroke={C.accent} strokeWidth="2"/>
)}
            </g>
))}
          {/* Labels dates extrêmes */}
          <text x={pts[0].x} y={H - 6} fontSize="9" fill="#98A2B3" textAnchor="start" fontFamily="'Archivo',system-ui,-apple-system,sans-serif">{fmtShort(first.date)}</text>
          <text x={pts[pts.length - 1].x} y={H - 6} fontSize="9" fill="#98A2B3" textAnchor="end" fontFamily="'Archivo',system-ui,-apple-system,sans-serif">{fmtShort(last.date)}</text>
        </svg>

        <div style={{ marginTop: 8, fontSize: 11, color:"#98A2B3", fontFamily: FONT, textAlign:"center" }}>
          {data.length} pesée{data.length > 1 ?"s" :""} enregistrée{data.length > 1 ?"s" :""}
        </div>
      </div>
    </Glass>
);
}

// ─── MAIN PROFILE PAGE ────────────────────────────────────────────────────────

export { I, ic, Glass, StatCard, Tabs, SectionLabel, Row, EditRow, AddRow, MacroRing, CompoBar, ACTIVITE_LABELS, WeightChart };
