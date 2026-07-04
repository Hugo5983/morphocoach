// ─── Modal Level-Up ──────────────────────────────────────────────────────────
// S'affiche automatiquement quand l'utilisateur passe un niveau.
// Reçoit les props : show, levelInfo, amount, onClose

const GS    = "'General Sans',system-ui,-apple-system,sans-serif";
const GOLD1 = "#E6B758";
const GOLD2 = "#C9912F";
const NAVY1 = "#274BD6";
const NAVY2 = "#1E3AAD";

export function LevelUpModal({ show, levelInfo, amount, reason, onClose }) {
  if (!show || !levelInfo) return null;

  const reasonLabel = {
    SESSION_COMPLETE : "Séance terminée 💪",
    NUTRITION_MEAL   : "Repas loggé 🥗",
    STREAK_WEEK      : "Streak hebdo 🔥",
    SESSION_BONUS_PR : "Nouveau record ⭐",
  }[reason] || "Progression +";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(7,8,15,0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: "24px",
        animation: "xp-fadein 0.25s ease",
      }}>
      <style>{`
        @keyframes xp-fadein { from { opacity:0; transform:scale(0.92) } to { opacity:1; transform:scale(1) } }
        @keyframes xp-gold   { 0%,100%{opacity:.6} 50%{opacity:1} }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 340,
          borderRadius: 28,
          background: `linear-gradient(170deg,${NAVY1} 0%,${NAVY2} 55%,#0E1A4A 100%)`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.10)",
          overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "32px 28px 28px",
          position: "relative",
        }}>
        {/* Glow doré */}
        <div style={{
          position: "absolute", top: -80, left: "50%",
          transform: "translateX(-50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(230,183,88,0.30),transparent 65%)",
          animation: "xp-gold 2s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Rayons */}
        <svg style={{
          position: "absolute", top: 24, left: "50%",
          transform: "translateX(-50%)", width: 240, height: 240,
          opacity: 0.4, pointerEvents: "none",
        }} viewBox="0 0 240 240" fill="none">
          <g stroke="rgba(255,217,138,0.5)" strokeWidth="1.5">
            <path d="M120 8v32M120 200v32M8 120h32M200 120h32M40 40l22 22M178 178l22 22M200 40l-22 22M62 178l-22 22"/>
          </g>
        </svg>

        {/* Badge "Séance terminée" */}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "1.8px",
          textTransform: "uppercase", color: "#FFD98A",
          fontFamily: GS, marginBottom: 8, position: "relative",
        }}>
          {reasonLabel}
        </div>

        {/* Titre */}
        <div style={{
          fontSize: 22, fontWeight: 700, color: "#fff",
          textAlign: "center", lineHeight: 1.2, fontFamily: GS,
          letterSpacing: "-0.4px", position: "relative",
        }}>
          Niveau {levelInfo.cur.level} atteint !<br/>
          <span style={{ color: "#FFD98A", fontStyle: "italic" }}>
            {levelInfo.cur.name}
          </span>
        </div>

        {/* Médaille */}
        <div style={{
          position: "relative", marginTop: 24,
          width: 108, height: 108, borderRadius: "50%",
          background: `linear-gradient(140deg,${GOLD1},${GOLD2})`,
          display: "grid", placeItems: "center",
          boxShadow: `0 16px 44px rgba(201,145,47,0.55),inset 0 2px 6px rgba(255,255,255,0.35)`,
        }}>
          <div style={{
            position: "absolute", inset: 8, borderRadius: "50%",
            border: "1.5px dashed rgba(255,255,255,0.38)",
          }} />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "1.2px",
              color: "rgba(255,255,255,0.80)", fontFamily: GS,
              textTransform: "uppercase",
            }}>niveau</div>
            <div style={{
              fontSize: 40, fontWeight: 700, lineHeight: 1,
              color: "#fff", fontFamily: GS,
            }}>
              {levelInfo.cur.level}
            </div>
          </div>
        </div>

        {/* XP gagné */}
        <div style={{
          fontSize: 36, fontWeight: 700, color: "#FFE1A3",
          fontFamily: GS, marginTop: 16, position: "relative",
          letterSpacing: "-1px",
        }}>
          +{amount}<span style={{ fontSize: 16 }}> XP</span>
        </div>

        {/* Barre niveau suivant */}
        {levelInfo.next && (
          <div style={{ width: "100%", marginTop: 16, position: "relative" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.65)",
              marginBottom: 6, fontFamily: GS,
            }}>
              <span>Niveau {levelInfo.cur.level}</span>
              <span>
                <span style={{ color: "#FFD98A", fontWeight: 700 }}>
                  {levelInfo.toNext} XP
                </span>
                {" → "}{levelInfo.next.name}
              </span>
            </div>
            <div style={{
              height: 8, borderRadius: 5,
              background: "rgba(255,255,255,0.15)", overflow: "hidden",
            }}>
              <div style={{
                width: `${levelInfo.pct}%`, height: "100%", borderRadius: 5,
                background: `linear-gradient(90deg,${GOLD1},#FFE1A3)`,
              }} />
            </div>
          </div>
        )}

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 20, padding: "15px",
            borderRadius: 16, border: "none", cursor: "pointer",
            background: "#fff", color: NAVY2,
            fontSize: 15, fontWeight: 700, fontFamily: GS,
            letterSpacing: "-0.1px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          ✓ Continuer
        </button>
      </div>
    </div>
  );
}
