import { C } from"../../data/constants.js";
import { useState, useEffect } from"react";
import { getXPState, getLevelInfo } from"../../services/xpService.js";
import { getLevelBadge } from"../../data/levelBadges.js";

const GS     ="'Archivo',system-ui,-apple-system,sans-serif";
const GOLD1  ="#3C5BFF";
const GOLD2  ="#2E48D9";
const GOLDTX ="#2E48D9";

export function XPBar() {
  const [state, setState] = useState(() => getXPState());

  // Se met à jour automatiquement quand des XP sont ajoutés
  useEffect(() => {
    const handler = () => setState(getXPState());
    window.addEventListener('morpho_xp_update', handler);
    return () => window.removeEventListener('morpho_xp_update', handler);
  }, []);

  const info  = getLevelInfo(state.xp || 0);
  const badge = getLevelBadge(info.cur.level);

  return (
    <div style={{
      margin:"8px 20px 12px",
      borderRadius: 16,
      background:"#FFF",
      border:"1px solid rgba(0,0,0,0.08)",
      boxShadow: C.shadow,
      padding:"12px 12px",
      display:"flex",
      alignItems:"center",
      gap: 12,
    }}>
      {/* Badge niveau hexagonal */}
      <img
        src={badge}
        alt={`Niveau ${info.cur.level}`}
        style={{
          width: 46,
          height:"auto",
          flexShrink: 0,
          objectFit:"contain",
          filter:"drop-shadow(0 3px 8px rgba(30,80,220,0.35))",
          display:"block",
        }}
      />

      {/* Barre + infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom: 4,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: C.text,
            fontFamily: GS, letterSpacing: -0.2,
          }}>
            {info.cur.name}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: GOLDTX, fontFamily: GS,
          }}>
            {state.xp || 0} XP
          </span>
        </div>

        {/* Barre de progression */}
        <div style={{
          height: 6, borderRadius: 4,
          background:"rgba(0,0,0,0.08)", overflow:"hidden",
        }}>
          <div style={{
            width:`${info.pct}%`, height:"100%", borderRadius: 4,
            background:`linear-gradient(90deg,${GOLD1},${GOLD2})`,
            transition:"width 0.6s ease",
          }} />
        </div>

        {/* Légende sous la barre */}
        {info.next ? (
          <div style={{
            fontSize: 11, color: C.dim, fontFamily: GS,
            marginTop: 4, fontWeight: 500,
          }}>
            <span style={{ color: GOLDTX, fontWeight: 700 }}>{info.toNext} XP</span>
            {" → Niv."}{info.next.level} · {info.next.name}
          </div>
) : (
          <div style={{
            fontSize: 11, color: GOLDTX, fontFamily: GS,
            marginTop: 4, fontWeight: 700,
          }}>
             Niveau maximum atteint !
          </div>
)}
      </div>
    </div>
);
}
