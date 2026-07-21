// ═══════════════════════════════════════════════════════════════════════════
// HeaderXP — pastille niveau + XP compacte, posée dans le header à côté du
// logo. Remplace l'ancienne carte pleine largeur (badge image + barre +
// légende) qui prenait trop de place verticale.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from"react";
import { C, FONT } from"../../data/constants.js";
import { ID } from"./Icon.jsx";
import { getXPState, getLevelInfo } from"../../services/xpService.js";

export function HeaderXP({ onTap }) {
  const [state, setState] = useState(() => getXPState());

  useEffect(() => {
    const handler = () => setState(getXPState());
    window.addEventListener("morpho_xp_update", handler);
    return () => window.removeEventListener("morpho_xp_update", handler);
  }, []);

  const info = getLevelInfo(state.xp || 0);

  return (
    <button onClick={onTap} className="tap" style={{
      display:"flex", alignItems:"center", gap:6,
      background:C.s1, border:`1px solid ${C.bd}`,
      borderRadius:999, padding:"5px 10px 5px 6px",
      cursor: onTap ?"pointer" :"default", flexShrink:0,
    }}>
      {/* Niveau */}
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <ID name="trophyDuo" size={16}/>
        <span style={{ fontSize:12, fontWeight:700, color:C.text,
          fontFamily:FONT, ...num }}>{info.cur.level}</span>
      </div>
      {/* Barre XP mini */}
      <div style={{ width:34, height:5, borderRadius:3,
        background:C.s3, overflow:"hidden", flexShrink:0 }}>
        <div style={{ width:`${info.pct}%`, height:"100%", borderRadius:3,
          background:`linear-gradient(90deg,#9DB0FF,${C.accent})`,
          transition:"width .6s ease" }}/>
      </div>
    </button>
  );
}

const num = { fontVariantNumeric:"tabular-nums" };

export default HeaderXP;
