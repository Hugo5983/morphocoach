import { C } from "../../data/constants.js";

export const Box = ({ children, style, onClick, className }) => (
  <div onClick={onClick} className={className} style={{
    background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 20,
    padding: "16px 15px", marginBottom: 10, cursor: onClick ? "pointer" : "default",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 1px 0 rgba(0,0,0,0.2)",
    ...style,
  }}>{children}</div>
);

export const Lbl = ({ children, style }) => (
  <div style={{
    fontSize: 9, color: C.dim, letterSpacing: "2px",
    textTransform: "uppercase", fontWeight: 700,
    fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
    marginBottom: 10, ...style,
  }}>{children}</div>
);

export const Inp = ({ style, ...p }) => (
  <input style={{
    width: "100%", padding: "14px 16px",
    background: C.s2, border: `1px solid ${C.bdHi}`,
    borderRadius: 14, color: C.text, fontSize: 13,
    marginBottom: 8,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
    ...style,
  }} {...p}/>
);

export const Btn = ({ children, onClick, disabled, v = "fill", sm, style }) => {
  const variants = {
    fill:  { bg: `linear-gradient(135deg,${C.gold},${C.amberDk})`, color: "#1A1308", border: "1px solid rgba(255,255,255,0.22)" },
    out:   { bg: "transparent", color: C.blue, border: `1px solid ${C.blue}40` },
    ghost: { bg: "rgba(190,180,255,0.05)", color: C.mid, border: `1px solid ${C.bd}` },
  };
  const s = variants[v] || variants.fill;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "block", width: "100%",
      padding: sm ? "9px 14px" : "14px 16px",
      background: disabled ? "rgba(190,180,255,0.05)" : s.bg,
      color: disabled ? C.dim : s.color,
      border: disabled ? `1px solid ${C.bd}` : s.border,
      borderRadius: 14, fontSize: sm ? 12 : 13.5,
      fontWeight: 700, fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
      cursor: disabled ? "not-allowed" : "pointer",
      marginBottom: 7, letterSpacing: 0.2,
      boxShadow: disabled ? "none" : v === "fill" ? `0 8px 20px ${C.amberDk}40, inset 0 1px 0 rgba(255,255,255,0.35)` : "none",
      position: "relative", overflow: "hidden",
      transition: "opacity .15s",
      ...style,
    }}>{children}</button>
  );
};

export const Bar = ({ pct, color = C.gold, h = 4 }) => (
  <div style={{ height: h, background: "rgba(190,180,255,0.06)", borderRadius: h / 2, overflow: "hidden", marginTop: 5 }}>
    <div style={{
      height: "100%", width: `${Math.min(100, pct || 0)}%`,
      background: pct > 100 ? C.red : color,
      borderRadius: h / 2, transition: "width .5s",
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
    display: "inline-block", padding: "5px 11px", margin: "3px",
    background: active ? `rgba(${color || "77,139,255"},.14)` : "rgba(190,180,255,0.04)",
    border: `1px solid ${active ? `rgba(${color || "77,139,255"},.35)` : C.bd}`,
    borderRadius: 18, fontSize: 11.5,
    color: active ? `rgb(${color || "255,171,93"})` : C.mid,
    cursor: onClick ? "pointer" : "default", transition: "all .15s",
  }}>{children}</span>
);

export const MiniChart = ({ data, color = C.gold }) => {
  if (!data || data.length < 2) return null;
  const W = 120, H = 36;
  const vals = data.map(d => parseFloat(d.poids));
  const min = Math.min(...vals), max = Math.max(...vals);
  return (
    <div style={{ width: W, height: H }}>
      <svg width={W} height={H}>
        <polyline fill="none" stroke={color} strokeWidth="1.5"
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
