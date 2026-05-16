import { C } from "../../data/constants.js";

// ─── BOX ──────────────────────────────────────────────────────────────────────
export const Box = ({ children, style, onClick, className }) => (
  <div
    onClick={onClick}
    className={className}
    style={{
      background: "#ffffff",
      border: "0.5px solid #dce8f4",
      borderRadius: 16,
      padding: "16px 15px",
      marginBottom: 9,
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
      color: "#64748b",
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
      background: "#e4eef8",
      border: "0.5px solid #dce8f4",
      borderRadius: 9,
      color: "#0f1a2e",
      fontSize: 13,
      marginBottom: 8,
      ...style,
    }}
    {...p}
  />
);

// ─── BOUTON ───────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, disabled, v = "fill", sm, style }) => {
  const variants = {
    fill:  { bg: `linear-gradient(135deg,#60a5fa,#3b82f6)`, color: "#ffffff", border: "none" },
    out:   { bg: "transparent", color: "#3b82f6", border: "0.5px solid rgba(59,130,246,0.3)" },
    ghost: { bg: "rgba(255,255,255,0.04)", color: "#64748b", border: "0.5px solid #dce8f4" },
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
        color: disabled ? "#64748b" : s.color,
        border: disabled ? `1px solid ${C.s3}` : s.border,
        borderRadius: 9,
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
  <div style={{ height: h, background: "#e4eef8", borderRadius: h / 2, overflow: "hidden", marginTop: 5 }}>
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
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap, marginBottom: 9, ...style }}>
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
      color: active ? `rgb(${color || "200,150,62"})` : "#64748b",
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
