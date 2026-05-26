import { C } from "../../data/constants.js";

const FONT = "'Outfit','DM Sans',system-ui,sans-serif";
const NUM  = { fontVariantNumeric:"tabular-nums", fontFeatureSettings:'"tnum"' };

export const Box = ({ children, style, onClick, className }) => (
  <div onClick={onClick} className={className} style={{
    background: C.s1,
    border: `1px solid ${C.bd}`,
    borderRadius: 16,
    padding: "16px",
    marginBottom: 10,
    cursor: onClick ? "pointer" : "default",
    boxShadow: "0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
    ...style,
  }}>{children}</div>
);

export const Lbl = ({ children, style }) => (
  <div style={{
    fontSize: 10, color: C.dim, letterSpacing: "1.5px",
    textTransform: "uppercase", fontWeight: 600,
    fontFamily: FONT,
    marginBottom: 10, ...style,
  }}>{children}</div>
);

export const Inp = ({ style, ...p }) => (
  <input style={{
    width: "100%", padding: "13px 14px",
    background: C.s2,
    border: `1px solid ${C.bd}`,
    borderRadius: 12,
    color: C.text,
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "'DM Sans',sans-serif",
    ...style,
  }} {...p}/>
);

export const Btn = ({ children, onClick, disabled, v = "fill", sm, style }) => {
  const variants = {
    fill:  { bg: C.accent, color: "#FFFFFF", border: "none", shadow: "0 2px 8px rgba(59,130,246,0.30)" },
    out:   { bg: "transparent", color: C.accent, border: `1px solid rgba(59,130,246,0.40)`, shadow: "none" },
    ghost: { bg: "rgba(255,255,255,0.04)", color: C.mid, border: `1px solid ${C.bd}`, shadow: "none" },
  };
  const s = variants[v] || variants.fill;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "block", width: "100%",
      padding: sm ? "9px 14px" : "13px 16px",
      background: disabled ? "rgba(255,255,255,0.04)" : s.bg,
      color: disabled ? C.dim : s.color,
      border: disabled ? `1px solid ${C.bd}` : s.border,
      borderRadius: 12,
      fontSize: sm ? 12.5 : 14,
      fontWeight: 600,
      fontFamily: FONT,
      cursor: disabled ? "not-allowed" : "pointer",
      marginBottom: 7,
      letterSpacing: 0.1,
      boxShadow: disabled ? "none" : s.shadow,
      transition: "opacity .15s, transform .12s",
      ...style,
    }}>{children}</button>
  );
};

export const Bar = ({ pct, color = C.accent, h = 4 }) => (
  <div style={{ height: h, background: "rgba(255,255,255,0.06)", borderRadius: h / 2, overflow: "hidden", marginTop: 5 }}>
    <div style={{
      height: "100%", width: `${Math.min(100, pct || 0)}%`,
      background: pct > 100 ? C.red : color,
      borderRadius: h / 2, transition: "width .5s ease",
    }}/>
  </div>
);

export const Row = ({ children, style }) => (
  <div style={{ display: "flex", alignItems: "center", ...style }}>{children}</div>
);

export const G2 = ({ children, gap = 8, style }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap, marginBottom: 10, ...style }}>
    {children}
  </div>
);

export const Tag = ({ children, active, color, onClick }) => (
  <span onClick={onClick} style={{
    display: "inline-block", padding: "5px 12px", margin: "3px",
    background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? "rgba(59,130,246,0.35)" : C.bd}`,
    borderRadius: 20,
    fontSize: 11.5,
    color: active ? C.accent : C.mid,
    cursor: onClick ? "pointer" : "default",
    transition: "all .15s",
    fontFamily: FONT,
    fontWeight: active ? 600 : 400,
  }}>{children}</span>
);

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
