import { useState, useEffect } from "react";
import { getXPState, getLevelInfo } from "../../services/xpService.js";
import { getLevelBadge } from "../../data/levelBadges.js";

const GS     = "'General Sans',system-ui,-apple-system,sans-serif";
const GOLD1  = "#E6B758";
const GOLD2  = "#C9912F";
const GOLDTX = "#9A6A13";

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
      margin: "8px 16px 2px",
      borderRadius: 14,
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.07)",
      boxShadow: "0 1px 6px rgba(15,25,35,0.05)",
      padding: "10px 13px",
      display: "flex",
      alignItems: "center",
      gap: 11,
    }}>
      {/* Badge niveau hexagonal */}
      <img
        src={badge}
        alt={`Niveau ${info.cur.level}`}
        style={{
          width: 46,
          height: "auto",
          flexShrink: 0,
          objectFit: "contain",
          filter: "drop-shadow(0 3px 8px rgba(30,80,220,0.35))",
          display: "block",
        }}
      />

      {/* Barre + infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 5,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: "#0F1923",
            fontFamily: GS, letterSpacing: "-0.1px",
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
          background: "rgba(0,0,0,0.07)", overflow: "hidden",
        }}>
          <div style={{
            width: `${info.pct}%`, height: "100%", borderRadius: 4,
            background: `linear-gradient(90deg,${GOLD1},${GOLD2})`,
            transition: "width 0.6s ease",
          }} />
        </div>

        {/* Légende sous la barre */}
        {info.next ? (
          <div style={{
            fontSize: 10.5, color: "#6B7280", fontFamily: GS,
            marginTop: 3, fontWeight: 500,
          }}>
            <span style={{ color: GOLDTX, fontWeight: 700 }}>{info.toNext} XP</span>
            {" → Niv. "}{info.next.level} · {info.next.name}
          </div>
        ) : (
          <div style={{
            fontSize: 10.5, color: GOLDTX, fontFamily: GS,
            marginTop: 3, fontWeight: 700,
          }}>
            🏆 Niveau maximum atteint !
          </div>
        )}
      </div>
    </div>
  );
}
