// ═══════════════════════════════════════════════════════════════════════════
// HEADER — design 12A/13A « nav unifiée »
// Logo + wordmark à gauche · pilule niveau/XP + badge PRO + bouton profil à
// droite · sous-onglets soulignés SUR LA MÊME SURFACE BLANCHE. La séparation
// avec le contenu se fait par le changement de fond (blanc → gris), zéro trait.
// ═══════════════════════════════════════════════════════════════════════════
import { C, FONT } from"../../data/constants.js";
import { useState, useEffect } from"react";
import { getXPState, getLevelInfo } from"../../services/xpService.js";

export function Header({ premium, cycleStart, jR, tab, setTab, subNav, subView, setSubView, setPaywall, theme = "light" }) {
  const dark = theme === "dark";
  const T = dark ? { bg:"#0B0E12", surface:"#141922", text:"#F6F7F9", dim:"rgba(246,247,249,.58)" } : { bg:"#FFFFFF", surface:C.s2, text:C.text, dim:C.dim };
  const [xpState, setXpState] = useState(() => getXPState());
  useEffect(() => {
    const handler = () => setXpState(getXPState());
    window.addEventListener("morpho_xp_update", handler);
    return () => window.removeEventListener("morpho_xp_update", handler);
  }, []);
  const info = getLevelInfo(xpState.xp || 0);

  return (
    <div className="np" style={{
      background:T.bg,
      paddingTop:"calc(8px + env(safe-area-inset-top, 0px))",
      position:"sticky", top: 0, zIndex: 100,
    }}>
      {/* Ligne principale : logo + niveau + PRO + profil */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        gap: 10, padding:"14px 20px 16px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 11,
            background: dark ? T.surface : C.accentLt,
            display:"grid", placeItems:"center", flexShrink: 0,
          }}>
            {/* Symbole MorphoCoach officiel. Le tracé est bleu : la tuile
                passe donc sur une surface neutre pour garder le contraste.
                Taille, rayon et position de la tuile : inchangés. */}
            <svg width="18" height="18" viewBox="461 90.2 112.5 147.9" fill="none"
                 preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <linearGradient id="mcHeaderMark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#5A78FF"/>
                  <stop offset=".52" stopColor={C.accent}/>
                  <stop offset="1" stopColor="#2438B8"/>
                </linearGradient>
              </defs>
              <path fillRule="evenodd" fill="url(#mcHeaderMark)" d="m552.35 93.34c1.89 0.31 5.57 1.74 8.18 3.18 2.61 1.44 5.92 3.86 9.97 8.14v57.66c0 49.8-0.2 57.9-1.47 59.45-0.81 0.99-5.45 4.39-10.3 7.55-6.55 4.27-9.72 5.75-12.26 5.74-2.14-0.01-5.11-1.12-7.85-2.92-2.43-1.59-6.29-4.47-12.75-9.89l0.03-63.27-14.35-17.66c-7.89-9.71-16.61-19.98-19.39-22.82-2.77-2.84-5.7-5.14-6.51-5.12-0.81 0.02-2.91 1.13-7.85 4.89l-0.02 95.64 4.18 2.69c3.66 2.36 4.42 2.53 6.14 1.38 1.08-0.73 2.96-1.94 6.38-4.07v-33.11c0-18.21 0.22-33.1 0.49-33.1 0.27 0 3.37 2.53 13.29 11.28l-0.05 62.29-6.13 5.42c-3.37 2.99-7.57 6.08-9.32 6.87-1.76 0.79-5.62 1.44-8.59 1.44-5.12 0-5.76-0.3-20.1-11.77v-112.81l4.65-3.77c2.57-2.08 6.65-5.18 9.08-6.9 3.58-2.53 5.34-3.11 9.32-3.07 4.77 0.05 5.09 0.24 11.81 7.14 3.8 3.9 9.54 10.09 18.6 20.43l8.51-10.6c4.68-5.82 9.97-11.97 11.77-13.67 1.79-1.69 5.03-4.01 7.18-5.14 2.79-1.46 4.93-1.9 7.36-1.5zm-22.86 41.27c0 0 6.95 11.26 7.9 11.5 1.59 0.4 1.23 3.04 1.23 34.45v33.84c6.99 4.95 8.97 5.7 10.3 5.28 1.08-0.35 3.17-1.46 4.66-2.46l2.7-1.84v-101.04c-4.95-3.03-7.1-3.92-7.98-3.92-0.89 0-4.01 2.76-6.94 6.13-2.93 3.37-9.62 15.23-11.87 18.06z"/>
            </svg>
          </div>
          <span style={{ fontSize:16, fontWeight:700, letterSpacing:"-.02em",
            fontFamily:FONT, color:T.text, whiteSpace:"nowrap" }}>
            Morpho<span style={{ color: C.accent }}>Coach</span>
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap: 7 }}>
          {cycleStart && jR !== null && jR <= 7 && (
            <div style={{
              padding:"7px 11px", borderRadius:10,
              background:"rgba(229,72,77,0.12)",
              fontSize:11, color:C.red, fontWeight:700, fontFamily:FONT,
            }}>J-{jR}</div>
          )}
          <div onClick={() => setTab?.("profile")} className="tap-sm" style={{
            display:"flex", alignItems:"center", gap:6, cursor:"pointer",
            background: T.surface, borderRadius:10, padding:"7px 11px 7px 10px",
          }}>
            <span style={{ fontSize:12, fontWeight:700, color:T.text,
              fontFamily:FONT, fontVariantNumeric:"tabular-nums" }}>
              {info.cur.level}
            </span>
            <span style={{ width:50, height:6, borderRadius:99,
              background:dark ? "#1B2230" : "#E2E6EE", position:"relative",
              display:"inline-block", overflow:"hidden" }}>
              <span style={{ position:"absolute", inset:0, width:`${info.pct}%`,
                background: C.accent, borderRadius:99,
                transition:"width .6s ease" }}/>
            </span>
          </div>
          {premium && (
            <div style={{
              padding:"7px 11px", borderRadius:10,
              background:"rgba(60,91,255,0.12)",
              fontSize:11, color:C.accentDk, fontWeight:700,
              letterSpacing:".03em", fontFamily:FONT,
            }}>PRO</div>
          )}
          <button
            onClick={() => setTab(tab ==="profile" ?"home" :"profile")}
            className="tap-icon"
            style={{
              width:34, height:34, borderRadius:10,
              background: tab ==="profile" ?"rgba(60,91,255,0.12)" : T.surface,
              display:"grid", placeItems:"center",
              cursor:"pointer", flexShrink: 0, border:"none",
              color: tab ==="profile" ? C.accent : T.dim,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Sous-onglets soulignés — même surface blanche, pas de trait de séparation */}
      {subNav && subNav.length > 0 && (
        <div style={{
          display:"flex", alignItems:"stretch",
          gap: subNav.length > 3 ? 10 : 26,
          padding:"0 20px",
        }}>
          {subNav.map(item => {
            const on = subView === item.id;
            const isPro = item.pro && !premium;
            const compact = subNav.length > 3;
            return (
              <button key={item.id}
                onClick={() => {
                  if (isPro) { setPaywall?.(true); return; }
                  setSubView?.(item.id);
                }}
                style={{
                  display:"flex", flexDirection:"column", alignItems:"center",
                  gap:9, paddingBottom:12, background:"none", border:"none",
                  cursor:"pointer",
                  flex: compact ?"1 1 0" :"none", minWidth:0,
                }}>
                <span style={{
                  fontSize: compact ? 12.5 : 14, fontFamily:FONT,
                  fontWeight: on ? 700 : 600,
                  color: on ? T.text : T.dim,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                  textAlign:"center", lineHeight:1.2,
                  whiteSpace: compact ?"normal" :"nowrap",
                }}>
                  {item.label}
                  {item.pro && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke={on ? C.accent : T.dim} strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink:0, pointerEvents:"none" }}>
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  )}
                </span>
                <span style={{
                  width:"100%", height:2, borderRadius:2,
                  background: on ? C.accent :"transparent",
                }}/>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
