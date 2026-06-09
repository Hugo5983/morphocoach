// ═══════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Composants UI réutilisables de MorphoCoach
// Source unique de vérité pour l'UI. Importer ces composants au lieu de
// réécrire des styles inline. Pour changer l'apparence de l'app : modifier ICI.
// ═══════════════════════════════════════════════════════════════════════════
import { C, FONT, NUM } from "../../data/constants.js";

export { FONT, NUM };

// ─── BOX — carte de base (conservé pour compatibilité) ──────────────────────
export const Box = ({ children, style, onClick, className }) => (
  <div onClick={onClick} className={className} style={{
    background: C.s1,
    border: `1px solid ${C.bd}`,
    borderRadius: 16,
    padding: "16px",
    marginBottom: 10,
    cursor: onClick ? "pointer" : "default",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)",
    ...style,
  }}>{children}</div>
);

// ─── CARD — carte avec variantes (default / accent / success / danger / ghost) ─
const CARD_VARIANTS = {
  default: { background: C.s1, border: `1px solid ${C.bd}`, boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)" },
  accent:  { background: C.s1, border: `1px solid rgba(59,130,246,0.25)`, boxShadow: "0 4px 20px rgba(59,130,246,0.12)" },
  success: { background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.20)" },
  danger:  { background: "rgba(239,68,68,0.06)",  border: "1px solid rgba(239,68,68,0.18)" },
  ghost:   { background: "transparent", border: `1px solid ${C.bd}` },
};
const CARD_PADDINGS = { sm: "12px 14px", md: "16px", lg: "20px 18px", xl: "22px 20px", none: "0" };

export const Card = ({ children, variant = "default", padding = "md", onClick, style, className }) => {
  const v = CARD_VARIANTS[variant] || CARD_VARIANTS.default;
  return (
    <div onClick={onClick} className={className} style={{
      ...v,
      borderRadius: 20,
      padding: CARD_PADDINGS[padding] ?? CARD_PADDINGS.md,
      marginBottom: 12,
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>{children}</div>
  );
};

// ─── EYEBROW — petit label majuscule au-dessus d'un titre ───────────────────
export const Eyebrow = ({ children, color = C.dim, style }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, color,
    letterSpacing: "0.1em", textTransform: "uppercase",
    fontFamily: FONT, marginBottom: 4, ...style,
  }}>{children}</div>
);

// ─── LBL — label de formulaire (conservé pour compatibilité) ────────────────
export const Lbl = ({ children, style }) => (
  <div style={{
    fontSize: 10, color: C.dim, letterSpacing: "1.5px",
    textTransform: "uppercase", fontWeight: 600,
    fontFamily: FONT, marginBottom: 10, ...style,
  }}>{children}</div>
);

// ─── SECTION TITLE — titre de section avec eyebrow + action optionnelle ─────
export const SectionTitle = ({ eyebrow, title, action, style }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12, ...style }}>
    <div>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: FONT, letterSpacing: -0.6 }}>{title}</div>
    </div>
    {action}
  </div>
);

// ─── INPUT (conservé pour compatibilité) ────────────────────────────────────
export const Inp = ({ style, ...p }) => (
  <input style={{
    width: "100%", padding: "13px 14px",
    background: C.s2, border: `1px solid ${C.bd}`,
    borderRadius: 12, color: C.text, fontSize: 14,
    marginBottom: 8, fontFamily: "'DM Sans',sans-serif",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
    ...style,
  }} {...p}/>
);

// ─── BUTTON (conservé pour compatibilité) ───────────────────────────────────
export const Btn = ({ children, onClick, disabled, v = "fill", sm, style }) => {
  const variants = {
    fill:  { bg: C.accent, color: "#FFFFFF", border: "none", shadow: "0 2px 8px rgba(59,130,246,0.30)" },
    out:   { bg: "transparent", color: C.accent, border: `1px solid rgba(59,130,246,0.40)`, shadow: "none" },
    ghost: { bg: C.s2, color: C.mid, border: `1px solid ${C.bd}`, shadow: "none" },
  };
  const s = variants[v] || variants.fill;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "block", width: "100%",
      padding: sm ? "9px 14px" : "13px 16px",
      background: disabled ? "rgba(0,0,0,0.03)" : s.bg,
      color: disabled ? C.dim : s.color,
      border: disabled ? `1px solid ${C.bd}` : s.border,
      borderRadius: 12, fontSize: sm ? 12.5 : 14, fontWeight: 600,
      fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer",
      marginBottom: 7, letterSpacing: 0.1,
      boxShadow: disabled ? "none" : s.shadow,
      transition: "opacity .15s, transform .12s", ...style,
    }}>{children}</button>
  );
};

// ─── BAR — barre de progression ─────────────────────────────────────────────
export const Bar = ({ pct, color = C.accent, h = 4 }) => (
  <div style={{ height: h, background: "#E8EBF2", borderRadius: h / 2, overflow: "hidden", marginTop: 5 }}>
    <div style={{
      height: "100%", width: `${Math.min(100, pct || 0)}%`,
      background: pct > 100 ? C.red : color,
      borderRadius: h / 2, transition: "width .5s ease",
    }}/>
  </div>
);

// ─── ROW — ligne flex centrée ───────────────────────────────────────────────
export const Row = ({ children, style }) => (
  <div style={{ display: "flex", alignItems: "center", ...style }}>{children}</div>
);

// ─── G2 — grille 2 colonnes ─────────────────────────────────────────────────
export const G2 = ({ children, gap = 8, style }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap, marginBottom: 10, ...style }}>
    {children}
  </div>
);

// ─── TAG — étiquette/chip (conservé pour compatibilité) ─────────────────────
export const Tag = ({ children, active, color, onClick }) => (
  <span onClick={onClick} style={{
    display: "inline-block", padding: "5px 12px", margin: "3px",
    background: active ? "rgba(59,130,246,0.10)" : C.s2,
    border: `1px solid ${active ? "rgba(59,130,246,0.30)" : C.bd}`,
    borderRadius: 20, fontSize: 11.5,
    color: active ? C.accent : C.mid,
    cursor: onClick ? "pointer" : "default",
    transition: "all .15s", fontFamily: FONT,
    fontWeight: active ? 600 : 400,
  }}>{children}</span>
);

// ─── PILL — badge arrondi (statut, info) ────────────────────────────────────
export const Pill = ({ children, color = C.accent, dot = false, style }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 11px", borderRadius: 99,
    background: `${color}1A`, border: `1px solid ${color}33`,
    fontSize: 11.5, fontWeight: 600, color,
    fontFamily: FONT, ...style,
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }}/>}
    {children}
  </span>
);

// ─── STAT — grand chiffre avec unité + label ────────────────────────────────
export const Stat = ({ value, unit, label, color = C.text, style }) => (
  <div style={style}>
    {label && <Eyebrow>{label}</Eyebrow>}
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontSize: 32, fontWeight: 700, color, fontFamily: FONT, letterSpacing: -1, lineHeight: 1, ...NUM }}>{value}</span>
      {unit && <span style={{ fontSize: 13, color: C.dim, fontWeight: 500 }}>{unit}</span>}
    </div>
  </div>
);

// ─── MINI CHART — sparkline de poids ────────────────────────────────────────
export const MiniChart = ({ data, color = C.accent }) => {
  if (!data || data.length < 2) return null;
  const W = 120, H = 36;
  const vals = data.map(d => parseFloat(d.poids));
  const min = Math.min(...vals), max = Math.max(...vals);
  return (
    <div style={{ width: W, height: H }}>
      <svg width={W} height={H}>
        <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          points={data.map((d, i) => {
            const x = (i / (data.length - 1)) * W;
            const y = H - ((parseFloat(d.poids) - min) / (max - min || 1)) * H;
            return `${x},${y}`;
          }).join(" ")}/>
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * W;
          const y = H - ((parseFloat(d.poids) - min) / (max - min || 1)) * H;
          return <circle key={i} cx={x} cy={y} r={2.5} fill={color}/>;
        })}
      </svg>
    </div>
  );
};
