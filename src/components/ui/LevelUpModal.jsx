import { C } from"../../data/constants.js";
import { I } from"./Icon.jsx";
// ─── Modal Level-Up ──────────────────────────────────────────────────────────
// S'affiche automatiquement quand l'utilisateur passe un niveau.
// Reçoit les props : show, levelInfo, amount, onClose

const GS    ="'Archivo',system-ui,-apple-system,sans-serif";
const GOLD1 ="#3C5BFF";
const GOLD2 ="#2E48D9";
const NAVY1 ="#2E48D9";
const NAVY2 ="#2E48D9";

export function LevelUpModal({ show, levelInfo, amount, reason, onClose }) {
  if (!show || !levelInfo) return null;

  const reasonLabel = {
    SESSION_COMPLETE :"Séance terminée",
    NUTRITION_MEAL   :"Repas loggé",
    STREAK_WEEK      :"Streak hebdo",
    SESSION_BONUS_PR :"Nouveau record",
  }[reason] ||"Progression +";

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset: 0, zIndex: 400,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"rgba(7,8,15,0.65)",
        backdropFilter:"blur(8px)",
        WebkitBackdropFilter:"blur(8px)",
        padding:"24px",
        animation:"xp-fadein 0.25s ease",
      }}>
      <style>{`
        @keyframes xp-fadein { from { opacity:0; transform:scale(0.92) } to { opacity:1; transform:scale(1) } }
        @keyframes xp-gold   { 0%,100%{opacity:.6} 50%{opacity:1} }
`}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"100%", maxWidth: 340,
          borderRadius: 28,
          background:`linear-gradient(170deg,${NAVY1} 0%,${NAVY2} 55%,#101318 100%)`,
          boxShadow: C.shadow,
          border:"1px solid rgba(255,255,255,0.12)",
          overflow:"hidden",
          display:"flex", flexDirection:"column", alignItems:"center",
          padding:"32px 32px 32px",
          position:"relative",
        }}>
        {/* Glow doré */}
        <div style={{
          position:"absolute", top: -80, left:"50%",
          transform:"translateX(-50%)",
          width: 300, height: 300, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(230,183,88,0.25),transparent 65%)",
          animation:"xp-gold 2s ease-in-out infinite",
          pointerEvents:"none",
        }} />

        {/* Rayons */}
        <svg style={{
          position:"absolute", top: 24, left:"50%",
          transform:"translateX(-50%)", width: 240, height: 240,
          opacity: 0.4, pointerEvents:"none",
        }} viewBox="0 0 240 240" fill="none">
          <g stroke="rgba(255,217,138,0.5)" strokeWidth="1.5">
            <path d="M120 8v32M120 200v32M8 120h32M200 120h32M40 40l22 22M178 178l22 22M200 40l-22 22M62 178l-22 22"/>
          </g>
        </svg>

        {/* Badge"Séance terminée" */}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing:"0.1em",
          textTransform:"uppercase", color:"#E8EBFF",
          fontFamily: GS, marginBottom: 8, position:"relative",
        }}>
          {reasonLabel}
        </div>

        {/* Titre */}
        <div style={{
          fontSize: 20, fontWeight: 700, color:"#FFF",
          textAlign:"center", lineHeight: 1.2, fontFamily: GS,
          letterSpacing: -0.3, position:"relative",
        }}>
          Niveau {levelInfo.cur.level} atteint !<br/>
          <span style={{ color:"#E8EBFF", fontStyle:"italic" }}>
            {levelInfo.cur.name}
          </span>
        </div>

        {/* Médaille */}
        <div style={{
          position:"relative", marginTop: 24,
          width: 108, height: 108, borderRadius:"50%",
          background:`linear-gradient(140deg,${GOLD1},${GOLD2})`,
          display:"grid", placeItems:"center",
          boxShadow:`0 16px 44px rgba(201,145,47,0.5),inset 0 2px 6px rgba(255,255,255,0.35)`,
        }}>
          <div style={{
            position:"absolute", inset: 8, borderRadius:"50%",
            border:"1.5px dashed rgba(255,255,255,0.35)",
          }} />
          <div style={{ position:"relative", textAlign:"center" }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing:"0.1em",
              color:"rgba(255,255,255,0.85)", fontFamily: GS,
              textTransform:"uppercase",
            }}>niveau</div>
            <div style={{
              fontSize: 44, fontWeight: 700, lineHeight: 1,
              color:"#FFF", fontFamily: GS,
            }}>
              {levelInfo.cur.level}
            </div>
          </div>
        </div>

        {/* XP gagné */}
        <div style={{
          fontSize: 34, fontWeight: 700, color:"#E8EBFF",
          fontFamily: GS, marginTop: 16, position:"relative",
          letterSpacing: -1,
        }}>
          +{amount}<span style={{ fontSize: 16 }}> XP</span>
        </div>

        {/* Barre niveau suivant */}
        {levelInfo.next && (
          <div style={{ width:"100%", marginTop: 16, position:"relative" }}>
            <div style={{
              display:"flex", justifyContent:"space-between",
              fontSize: 11, fontWeight: 600, color:"rgba(255,255,255,0.65)",
              marginBottom: 8, fontFamily: GS,
            }}>
              <span>Niveau {levelInfo.cur.level}</span>
              <span>
                <span style={{ color:"#E8EBFF", fontWeight: 700 }}>
                  {levelInfo.toNext} XP
                </span>
                {" ·"}{levelInfo.next.name}
              </span>
            </div>
            <div style={{
              height: 8, borderRadius: 5,
              background:"rgba(255,255,255,0.12)", overflow:"hidden",
            }}>
              <div style={{
                width:`${levelInfo.pct}%`, height:"100%", borderRadius: 5,
                background:`linear-gradient(90deg,${GOLD1},#E8EBFF)`,
              }} />
            </div>
          </div>
)}

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          style={{
            width:"100%", marginTop: 20, padding:"16px",
            borderRadius: 16, border:"none", cursor:"pointer",
            background:"#FFF", color: NAVY2,
            fontSize: 14, fontWeight: 700, fontFamily: GS,
            letterSpacing: -0.2,
            display:"flex", alignItems:"center", justifyContent:"center", gap: 8,
          }}>
           Continuer
        </button>
      </div>
    </div>
);
}
