// ═══════════════════════════════════════════════════════════════════════════
// HEADER — design 12A/13A « nav unifiée »
// Logo + wordmark à gauche · pilule niveau/XP + badge PRO + bouton profil à
// droite · sous-onglets soulignés SUR LA MÊME SURFACE BLANCHE. La séparation
// avec le contenu se fait par le changement de fond (blanc → gris), zéro trait.
// ═══════════════════════════════════════════════════════════════════════════
import { C, DARK, FONT } from"../../data/constants.js";
import { useState, useEffect } from"react";
import { getXPState, getLevelInfo } from"../../services/xpService.js";

export function Header({ premium, cycleStart, jR, tab, setTab, subNav, subView, setSubView, setPaywall, theme = "light" }) {
  const [xpState, setXpState] = useState(() => getXPState());
  useEffect(() => {
    const handler = () => setXpState(getXPState());
    window.addEventListener("morpho_xp_update", handler);
    return () => window.removeEventListener("morpho_xp_update", handler);
  }, []);
  const info = getLevelInfo(xpState.xp || 0);

  // ── Pack de couleurs selon le thème ──
  // theme="light" (défaut) → aucun changement vs version historique.
  // theme="dark" → surface sombre premium, utilisée uniquement par la page
  // « Offre du moment » (contexte scopé côté App.jsx). Aucun autre écran
  // ne passe theme="dark" tant qu'App.jsx ne le décide pas.
  const isDark = theme === "dark";
  const T = isDark ? {
    bg:          DARK.bgDeep,
    text:        DARK.text,
    dim:         DARK.dim,
    dimStrong:   DARK.dimStrong,
    surface:     DARK.surfaceHi,
    progressBg:  "rgba(255,255,255,0.10)",
    proBg:       "rgba(60,91,255,0.22)",
    proText:     DARK.accent,       // #9DB0FF, lisible sur sombre
    profileMid:  DARK.dimStrong,
  } : {
    bg:          "#FFFFFF",
    text:        C.text,
    dim:         C.dim,
    dimStrong:   C.mid,
    surface:     C.s2,
    progressBg:  "#E2E6EE",
    proBg:       "rgba(60,91,255,0.12)",
    proText:     C.accentDk,
    profileMid:  C.mid,
  };

  return (
    <div className="np" style={{
      background: T.bg,
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
            width: 32, height: 32, borderRadius: 11, background: C.accent,
            display:"grid", placeItems:"center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="3" width="5" height="18" rx="1.2"/>
              <rect x="10" y="6" width="5" height="15" rx="1.2"/>
              <rect x="17" y="1" width="5" height="20" rx="1.2"/>
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
              background:T.progressBg, position:"relative",
              display:"inline-block", overflow:"hidden" }}>
              <span style={{ position:"absolute", inset:0, width:`${info.pct}%`,
                background: C.accent, borderRadius:99,
                transition:"width .6s ease" }}/>
            </span>
          </div>
          {premium && (
            <div style={{
              padding:"7px 11px", borderRadius:10,
              background:T.proBg,
              fontSize:11, color:T.proText, fontWeight:700,
              letterSpacing:".03em", fontFamily:FONT,
            }}>PRO</div>
          )}
          <button
            onClick={() => setTab(tab ==="profile" ?"home" :"profile")}
            className="tap-icon"
            style={{
              width:34, height:34, borderRadius:10,
              background: tab ==="profile" ?"rgba(60,91,255,0.18)" : T.surface,
              display:"grid", placeItems:"center",
              cursor:"pointer", flexShrink: 0, border:"none",
              color: tab ==="profile" ? (isDark ? DARK.accent : C.accent) : T.profileMid,
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
