import { C } from "../../data/constants.js";

export function Spinner({ size = 40, color = C.gold, thickness = 3 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `${thickness}px solid ${C.goldD}`,
      borderTop: `${thickness}px solid ${color}`,
      borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto",
    }}/>
  );
}
export function Skeleton({ width = "100%", height = 8, marginBottom = 0, radius = 4 }) {
  return <div className="skeleton" style={{ width, height, marginBottom, borderRadius: radius }}/>;
}
export function LoadingBlock({ title, subtitle, spinnerSize = 56 }) {
  return (
    <div className="scale-in" style={{ textAlign: "center", padding: "32px 20px 24px" }}>
      <Spinner size={spinnerSize}/>
      <div style={{
        fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
        fontSize: 17, color: C.gold, fontWeight: 600,
        marginTop: 20, marginBottom: 6, letterSpacing: "0.3px",
      }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: C.mid, lineHeight: 1.8 }}>{subtitle}</div>}
    </div>
  );
}
