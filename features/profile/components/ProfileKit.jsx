/**
 * ProfileKit.jsx — Icônes & composants visuels de la page Profil.
 * Extrait de ProfilePage.jsx sans aucune modification de code.
 */

import { useState } from"react";
import { C, DARK, FONT, NUM } from"../../../data/constants.js";

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
function I({ d, size = 18, color ="currentColor", sw = 1.8, fill ="none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
);
}

const ic = {
  flame:    <path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z"/>,
  dumbbell: <path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/>,
  bone:     <><path d="M17 10c.7-.7 1.69-.9 2.5-.5.8.4 1.4 1.3 1.4 2.2s-.6 1.8-1.4 2.2c-.8.4-1.8.2-2.5-.5l-7-7c-.7-.7-.9-1.69-.5-2.5.4-.8 1.3-1.4 2.2-1.4s1.8.6 2.2 1.4c.4.81.2 1.81-.5 2.5M7 14c-.7.7-1.69.9-2.5.5-.8-.4-1.4-1.3-1.4-2.2s.6-1.8 1.4-2.2c.8-.4 1.8-.2 2.5.5l7 7c.7.7.9 1.69.5 2.5-.4.8-1.3 1.4-2.2 1.4s-1.8-.6-2.2-1.4c-.4-.81-.2-1.81.5-2.5"/></>,
  drop:     <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>,
  heart:    <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
  ruler:    <><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2"/></>,
  target:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  zap:      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  crown:    <path d="M2 20h20M5 20 3 7l7 5 4-8 4 8 7-5-2 13"/>,
  upload:   <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  chev:     <path d="m9 18 6-6-6-6"/>,
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
          <div style={{ fontSize: 26, marginBottom: 8 }}></div>
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
