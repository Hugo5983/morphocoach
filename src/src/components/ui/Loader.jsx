import { C, FONT } from "../../data/constants.js";


export function Spinner({ size = 36, color = C.accent, thickness = 2.5 }) {
  return (
    <div style={{
      width:size, height:size,
      border:`${thickness}px solid rgba(59,130,246,0.12)`,
      borderTop:`${thickness}px solid ${color}`,
      borderRadius:"50%",
      animation:"spin 0.8s linear infinite",
      margin:"0 auto",
    }}/>
  );
}

export function Skeleton({ width = "100%", height = 8, marginBottom = 0, radius = 6 }) {
  return <div className="skeleton" style={{ width, height, marginBottom, borderRadius:radius }}/>;
}

export function LoadingBlock({ title, subtitle, spinnerSize = 44 }) {
  return (
    <div className="scale-in" style={{ textAlign:"center", padding:"40px 20px 28px" }}>
      <Spinner size={spinnerSize}/>
      <div style={{
        fontFamily:FONT,
        fontSize:16, color:C.text, fontWeight:600,
        marginTop:20, marginBottom:6, letterSpacing:"-0.2px",
      }}>{title}</div>
      {subtitle && <div style={{ fontSize:12, color:C.mid, lineHeight:1.7 }}>{subtitle}</div>}
    </div>
  );
}
