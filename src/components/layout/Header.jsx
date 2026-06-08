import { C, FONT } from "../../data/constants.js";


export function Header({ premium, cycleStart, jR, tab, setTab }) {
  return (
    <div className="np" style={{
      background: "rgba(8,14,26,0.95)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderBottom: `1px solid ${C.bd}`,
      paddingTop: "calc(10px + env(safe-area-inset-top, 0px))",
      paddingBottom: "10px",
      paddingLeft: "20px",
      paddingRight: "20px",
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `linear-gradient(145deg, ${C.accent}, #2563EB)`,
          display: "grid", placeItems: "center",
          boxShadow: "0 3px 10px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <rect x="3" y="3" width="5" height="18" rx="1.2"/>
            <rect x="10" y="6" width="5" height="15" rx="1.2"/>
            <rect x="17" y="1" width="5" height="20" rx="1.2"/>
          </svg>
        </div>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: C.text, letterSpacing: -0.3, lineHeight: 1 }}>
          Morpho<span style={{ color: C.accent }}>Coach</span>
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        {cycleStart && jR !== null && jR <= 7 && (
          <div style={{
            padding: "4px 10px", borderRadius: 7,
            background: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.22)",
            fontSize: 10.5, color: C.red, fontWeight: 700, fontFamily: FONT,
            letterSpacing: 0.3,
          }}>J-{jR}</div>
        )}
        {premium && (
          <div style={{
            padding: "4px 10px", borderRadius: 7,
            background: "rgba(59,130,246,0.10)",
            border: "1px solid rgba(59,130,246,0.25)",
            fontSize: 9.5, color: C.accent, fontWeight: 700,
            letterSpacing: "1px", fontFamily: FONT, textTransform: "uppercase",
          }}>Pro</div>
        )}
        <button
          onClick={() => setTab(tab === "profile" ? "home" : "profile")}
          className="tap-icon"
          style={{
            width: 36, height: 36, borderRadius: 11,
            background: tab === "profile" ? "rgba(59,130,246,0.12)" : C.s1,
            border: `1px solid ${tab === "profile" ? "rgba(59,130,246,0.35)" : C.bd}`,
            display: "grid", placeItems: "center",
            cursor: "pointer", color: tab === "profile" ? C.accent : C.mid,
            transition: "all .15s", flexShrink: 0,
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
