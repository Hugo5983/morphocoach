import { C } from "../../data/constants.js";

const FONT = "'Outfit','DM Sans',system-ui,sans-serif";

export function Header({ premium, cycleStart, jR, tab, setTab }) {
  return (
    <div className="np" style={{
      background:"rgba(11,18,32,0.92)",
      backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      borderBottom:`1px solid ${C.bd}`,
      padding:"13px 18px",
      position:"sticky", top:0, zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{
          width:30, height:30, borderRadius:9,
          background:C.accent,
          display:"grid", placeItems:"center",
          boxShadow:"0 2px 8px rgba(59,130,246,0.30)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/>
          </svg>
        </div>
        <span style={{ fontFamily:FONT, fontWeight:700, fontSize:15, color:C.text, letterSpacing:-0.3 }}>
          Morpho<span style={{ color:C.accent }}>Coach</span>
        </span>
      </div>

      {/* Right */}
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        {cycleStart && jR !== null && jR <= 7 && (
          <div style={{
            padding:"3px 9px", borderRadius:6,
            background:"rgba(248,113,113,0.10)",
            border:"1px solid rgba(248,113,113,0.25)",
            fontSize:10.5, color:C.red, fontWeight:600, fontFamily:FONT,
          }}>J-{jR}</div>
        )}
        {premium && (
          <div style={{
            padding:"3px 9px", borderRadius:6,
            background:"rgba(59,130,246,0.10)",
            border:"1px solid rgba(59,130,246,0.25)",
            fontSize:10, color:C.accent, fontWeight:700, letterSpacing:"0.8px", fontFamily:FONT,
          }}>PRO</div>
        )}
        <button
          onClick={() => setTab(tab === "profile" ? "home" : "profile")}
          className="tap-icon"
          style={{
            width:34, height:34, borderRadius:10,
            background: tab === "profile" ? "rgba(59,130,246,0.12)" : C.s1,
            border:`1px solid ${tab === "profile" ? "rgba(59,130,246,0.35)" : C.bd}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", color: tab === "profile" ? C.accent : C.mid,
            transition:"all .15s",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
