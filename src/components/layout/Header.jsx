import { C, FONT } from"../../data/constants.js";
import { useState, useEffect } from"react";
import { getXPState, getLevelInfo } from"../../services/xpService.js";

export function Header({ premium, cycleStart, jR, tab, setTab }) {
  const [xpState, setXpState] = useState(() => getXPState());
  useEffect(() => {
    const handler = () => setXpState(getXPState());
    window.addEventListener("morpho_xp_update", handler);
    return () => window.removeEventListener("morpho_xp_update", handler);
  }, []);
  const info = getLevelInfo(xpState.xp || 0);

  return (
    <div className="np" style={{
      background:"rgba(246,248,251,0.97)",
      backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
      borderBottom:`1px solid ${C.bd}`,
      paddingTop:"calc(8px + env(safe-area-inset-top, 0px))",
      paddingBottom:"8px",
      paddingLeft:"16px",
      paddingRight:"16px",
      position:"sticky", top: 0, zIndex: 100,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      gap: 12,
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap: 8, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 12,
          background:`linear-gradient(145deg, ${C.accent}, #2E48D9)`,
          display:"grid", placeItems:"center",
          boxShadow:"0 3px 10px rgba(60,91,255,0.35), inset 0 1px 0 rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round">
            <rect x="3" y="3" width="5" height="18" rx="1.2"/>
            <rect x="10" y="6" width="5" height="15" rx="1.2"/>
            <rect x="17" y="1" width="5" height="20" rx="1.2"/>
          </svg>
        </div>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: C.text, letterSpacing: -0.3, lineHeight: 1 }}>
          Morpho<span style={{ color: C.accent }}>Coach</span>
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display:"flex", gap: 8, alignItems:"center" }}>
        {cycleStart && jR !== null && jR <= 7 && (
          <div style={{
            padding:"4px 12px", borderRadius: 8,
            background:"rgba(229,72,77,0.12)",
            border:"1px solid rgba(229,72,77,0.25)",
            fontSize: 11, color: C.red, fontWeight: 700, fontFamily: FONT,
            letterSpacing: 0.2,
          }}>J-{jR}</div>
)}

        {/* Pilule niveau + mini-barre XP */}
        <div
          onClick={() => setTab("profile")}
          className="tap-sm"
          style={{
            display:"flex", alignItems:"center", gap: 6,
            background: C.s1, border:`1px solid ${C.bd}`,
            borderRadius: 9, padding:"6px 10px 6px 9px",
            cursor:"pointer", flexShrink: 0,
          }}
        >
          <span style={{
            fontSize: 11, fontWeight: 700, color: C.text,
            fontFamily: FONT, fontVariantNumeric:"tabular-nums",
          }}>
            {info.cur.level}
          </span>
          <span style={{
            width: 32, height: 4, borderRadius: 99,
            background: C.s3, position:"relative",
            display:"inline-block", overflow:"hidden",
          }}>
            <span style={{
              position:"absolute", inset: 0, width:`${info.pct}%`,
              background: C.accent, borderRadius: 99,
              transition:"width .6s ease",
            }} />
          </span>
        </div>

        {premium && (
          <div style={{
            padding:"4px 12px", borderRadius: 8,
            background:"rgba(60,91,255,0.12)",
            border:"1px solid rgba(60,91,255,0.25)",
            fontSize: 10, color: C.accent, fontWeight: 700,
            letterSpacing:"0.1em", fontFamily: FONT, textTransform:"uppercase",
          }}>Pro</div>
)}
        <button
          onClick={() => setTab(tab ==="profile" ?"home" :"profile")}
          className="tap-icon"
          style={{
            width: 36, height: 36, borderRadius: 12,
            background: tab ==="profile" ?"rgba(60,91,255,0.12)" : C.s1,
            border:`1px solid ${tab ==="profile" ?"rgba(60,91,255,0.35)" : C.bd}`,
            display:"grid", placeItems:"center",
            cursor:"pointer", color: tab ==="profile" ? C.accent : C.mid,
            transition:"all .15s", flexShrink: 0,
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
