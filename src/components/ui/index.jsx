// ─── PRIMITIVES UI ──────────────────────────────────────────────────────────
// Petits composants de base réutilisés partout : Box, Lbl, Inp, Btn, Bar,
// Row, G2, Tag, MiniChart.
//
// Note : on importe `C` (couleurs) + les tokens non-couleur (radius/space/font).
// On évite volontairement le token `color` ici car Bar/Tag/MiniChart ont déjà
// un paramètre nommé `color` — l'importer créerait une collision de nom.

import { C } from "../../data/constants.js";
import { radius, space } from "../../styles/tokens.js";

// ─── BOX ──────────────────────────────────────────────────────────────────────
export const Box = ({ children, style, onClick, className }) => (
  <div
    onClick={onClick}
    className={className}
    style={{
      background: C.s1,
      border: `0.5px solid ${C.s3}`,
      borderRadius: radius.card,
      padding: "16px 15px",
      marginBottom: space.md,
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── LABEL ────────────────────────────────────────────────────────────────────
export const Lbl = ({ children, style }) => (
  <div
    style={{
      fontSize: 9,
      color: C.mid,
      letterSpacing: "2px",
      textTransform: "uppercase",
      fontWeight: 600,
      marginBottom: 10,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Inp = ({ style, ...p }) => (
  <input
    style={{
      width: "100%",
      padding: "11px 13px",
      background: C.s2,
      border: `0.5px solid ${C.s3}`,
      borderRadius: radius.input,
      color: C.text,
      fontSize: 13,
      marginBottom: space.sm,
      ...style,
    }}
    {...p}
  />
);

// ─── BOUTON ───────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, disabled, v = "fill", sm, style }) => {
  const variants = {
    fill:  { bg: `linear-gradient(135deg,${C.goldL},${C.gold})`, color: C.s1, border: "none" },
    out:   { bg: "transparent", color: C.blue, border: "0.5px solid rgba(59,130,246,0.3)" },
    ghost: { bg: "rgba(255,255,255,0.04)", color: C.mid, border: `0.5px solid ${C.s3}` },
  };
  const s = variants[v] || variants.fill;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "block",
        width: "100%",
        padding: sm ? "9px 14px" : "13px 16px",
        background: disabled ? "rgba(255,255,255,0.04)" : s.bg,
        color: disabled ? C.mid : s.color,
        border: disabled ? `1px solid ${C.s3}` : s.border,
        borderRadius: radius.input,
        fontSize: sm ? 12 : 13.5,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        marginBottom: 7,
        transition: "opacity .15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ─── BARRE DE PROGRESSION ─────────────────────────────────────────────────────
export const Bar = ({ pct, color = C.gold, h = 4 }) => (
  <div style={{ height: h, background: C.s2, borderRadius: h / 2, overflow: "hidden", marginTop: 5 }}>
    <div
      style={{
        height: "100%",
        width: `${Math.min(100, pct || 0)}%`,
        background: pct > 100 ? C.red : color,
        borderRadius: h / 2,
        transition: "width .5s",
      }}
    />
  </div>
);

// ─── ROW (flex horizontal) ────────────────────────────────────────────────────
export const Row = ({ children, style }) => (
  <div style={{ display: "flex", alignItems: "center", ...style }}>{children}</div>
);

// ─── GRILLE 2 COLONNES ────────────────────────────────────────────────────────
export const G2 = ({ children, gap = 8, style }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap, marginBottom: space.md, ...style }}>
    {children}
  </div>
);

// ─── TAG / BADGE ──────────────────────────────────────────────────────────────
export const Tag = ({ children, active, color, onClick }) => (
  <span
    onClick={onClick}
    style={{
      display: "inline-block",
      padding: "5px 11px",
      margin: "3px",
      background: active ? `rgba(${color || "59,130,246"},.14)` : "rgba(255,255,255,0.03)",
      border: `1px solid ${active ? `rgba(${color || "59,130,246"},.44)` : C.s3}`,
      borderRadius: 18,
      fontSize: 11.5,
      color: active ? `rgb(${color || "200,150,62"})` : C.mid,
      cursor: onClick ? "pointer" : "default",
      transition: "all .15s",
    }}
  >
    {children}
  </span>
);

// ─── MINI CHART (historique poids) ────────────────────────────────────────────
export const MiniChart = ({ data, color = C.gold }) => {
  if (!data || data.length < 2) return null;
  const W = 120, H = 36;
  const vals = data.map(d => parseFloat(d.poids));
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  return (
    <div style={{ width: W, height: H }}>
      <svg width={W} height={H}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={data.map((d, i) => {
            const x = (i / (data.length - 1)) * W;
            const y = H - ((parseFloat(d.poids) - min) / (max - min || 1)) * H;
            return `${x},${y}`;
          }).join(" ")}
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * W;
          const y = H - ((parseFloat(d.poids) - min) / (max - min || 1)) * H;
          return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
        })}
      </svg>
    </div>
  );
};
