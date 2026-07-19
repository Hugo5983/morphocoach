import { C } from"../../data/constants.js";


export function Spinner({ size = 36, color = C.accent, thickness = 2.5 }) {
  return (
    <div style={{
      width:size, height:size,
      border:`${thickness}px solid rgba(60,91,255,0.12)`,
      borderTop:`${thickness}px solid ${color}`,
      borderRadius:"50%",
      animation:"spin 0.8s linear infinite",
      margin:"0 auto",
    }}/>
);
}
