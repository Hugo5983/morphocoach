// @ts-check
// ─── MorphoCoach · BadgeUnlock — célébration de badge débloqué ────────────────
// Overlay plein écran, sobre et premium (aligné sur LevelUpModal) :
//   halo de rayons qui tourne · badge en pop-in avec léger rebond ·
//   reflet qui balaie le badge · anneau qui s'expanse · texte qui monte.
// Pas de confettis permanents (préférence « présente mais élégante »).
//
// Nécessite les keyframes ajoutées au GLOBAL_CSS (voir le guide, section 3).
//
// Usage :
//   const [unlock, setUnlock] = useState(null);   // { nom, img } | null
//   {unlock && <BadgeUnlock badge={unlock} onClose={() => setUnlock(null)} />}
// Déclenche setUnlock(badge) quand badgeService détecte un NOUVEAU badge.

import { useEffect } from "react";
import { C, FONT, NUM } from "../../data/constants.js";

export function BadgeUnlock({ badge, onClose, autoMs = 4200 }) {
  useEffect(() => {
    if (!autoMs) return;
    const t = setTimeout(onClose, autoMs);
    return () => clearTimeout(t);
  }, [autoMs, onClose]);

  if (!badge) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        display: "grid", placeItems: "center",
        background: "rgba(16,19,24,0.62)", backdropFilter: "blur(6px)",
        animation: "bu-fade .28s ease both", cursor: "pointer",
      }}
    >
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        {/* halo de rayons */}
        <div style={{
          position: "absolute", top: -40, width: 260, height: 260,
          background: "conic-gradient(from 0deg, rgba(60,91,255,0)0deg, rgba(157,176,255,.55)26deg, rgba(60,91,255,0)52deg, rgba(60,91,255,0)180deg, rgba(157,176,255,.45)206deg, rgba(60,91,255,0)232deg)",
          borderRadius: "50%", filter: "blur(2px)",
          animation: "bu-spin 9s linear infinite", opacity: .9,
        }} />
        {/* anneau qui s'expanse */}
        <div style={{
          position: "absolute", top: 10, width: 150, height: 150, borderRadius: "50%",
          border: `2px solid ${C.accent}`, animation: "bu-ring 1.4s ease-out .15s both",
        }} />

        {/* badge */}
        <div style={{ position: "relative", width: 150, height: 158, animation: "bu-pop .6s cubic-bezier(.34,1.56,.64,1) both" }}>
          <img src={badge.img} alt={badge.nom} style={{
            width: "100%", height: "100%", objectFit: "contain",
            filter: "drop-shadow(0 10px 26px rgba(30,80,220,.4))",
          }} />
          {/* reflet qui balaie */}
          <div style={{
            position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24,
            WebkitMaskImage: `url(${badge.img})`, maskImage: `url(${badge.img})`,
            WebkitMaskSize: "contain", maskSize: "contain",
            WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
            WebkitMaskPosition: "center", maskPosition: "center",
          }}>
            <div style={{
              position: "absolute", top: "-30%", left: "-60%", width: "55%", height: "160%",
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent)",
              transform: "rotate(18deg)", animation: "bu-sweep 2.2s ease-in-out .5s infinite",
            }} />
          </div>
        </div>

        {/* texte */}
        <div style={{ textAlign: "center", animation: "bu-rise .5s ease .35s both" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase",
            color: C.accentOnDark, fontFamily: FONT, marginBottom: 8, ...NUM,
          }}>Badge débloqué</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#FFF", fontFamily: FONT, letterSpacing: "-.01em" }}>
            {badge.nom}
          </div>
          {badge.desc && (
            <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(246,247,249,.6)", fontFamily: FONT, marginTop: 6, maxWidth: 260 }}>
              {badge.desc}
            </div>
          )}
        </div>

        <button className="tap" onClick={onClose} style={{
          marginTop: 4, padding: "12px 26px", borderRadius: 12, border: "none", cursor: "pointer",
          background: "#FFF", color: C.text, fontSize: 14, fontWeight: 700, fontFamily: FONT,
          animation: "bu-rise .5s ease .5s both",
        }}>Continuer</button>
      </div>
    </div>
  );
}

export default BadgeUnlock;
