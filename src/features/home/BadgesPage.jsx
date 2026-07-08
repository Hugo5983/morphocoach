// @ts-check
// ─── MorphoCoach · Page Badges ───────────────────────────────────────────────
// Liste complète des badges, groupés par catégorie.
// Débloqués : pleine couleur. Verrouillés : grisés + barre de progression
// alimentée automatiquement par badgeService (ex. 8/10 séances).

import { useMemo } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { useSwipeBack } from "../../hooks/useSwipeBack.js";
import { BADGE_CATEGORIES } from "../../data/achievements.js";
import { getBadgeStates } from "../../services/badgeService.js";

export default function BadgesPage({ onBack, calObj, pObj }) {
  const swipe = useSwipeBack(onBack);
  const states = useMemo(() => getBadgeStates({ calObj, pObj }), [calObj, pObj]);
  const unlockedCount = states.filter((s) => s.unlocked).length;

  return (
    <div {...swipe} style={{ minHeight: "100vh", background: C.bg, paddingBottom: 32 }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: `${C.bg}F2`, backdropFilter: "blur(12px)",
        padding: "16px 16px 12px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${C.bd}`,
      }}>
        <button onClick={onBack} className="tap" aria-label="Retour" style={{
          width: 36, height: 36, borderRadius: 12, cursor: "pointer",
          background: C.s1, border: `1px solid ${C.bd}`,
          display: "grid", placeItems: "center", fontSize: 16, color: C.text,
        }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, color: C.text, letterSpacing: -0.3 }}>
            Mes <span style={{ color: C.accent, fontStyle: "italic" }}>badges</span>
          </div>
        </div>
        <div style={{
          padding: "8px 12px", borderRadius: 999,
          background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
          fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: FONT, ...NUM,
        }}>
          {unlockedCount}/{states.length}
        </div>
      </div>

      {/* Catégories */}
      {BADGE_CATEGORIES.map((cat) => {
        const items = states.filter((s) => s.cat === cat.id);
        if (items.length === 0) return null;
        return (
          <div key={cat.id} style={{ padding: "20px 16px 0" }}>
            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: C.mid, fontFamily: FONT, marginBottom: 12,
            }}>
              {cat.label}
              <span style={{ color: C.dim, fontWeight: 700, marginLeft: 8, ...NUM }}>
                {items.filter((i) => i.unlocked).length}/{items.length}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {items.map((b) => (
                <div key={b.id} style={{
                  background: C.s1, borderRadius: 20, padding: "16px 8px 12px",
                  border: `1px solid ${b.unlocked ? "rgba(59,130,246,0.25)" : C.bd}`,
                  boxShadow: b.unlocked ? "0 3px 14px rgba(59,130,246,0.12)" : "0 1px 5px rgba(20,20,50,0.05)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  position: "relative",
                }}>
                  <div style={{ position: "relative", width: 62, height: 66 }}>
                    <img
                      src={b.img} alt={b.nom} loading="lazy"
                      style={{
                        width: "100%", height: "100%", objectFit: "contain",
                        filter: b.unlocked
                          ? "drop-shadow(0 4px 10px rgba(30,80,220,0.25))"
                          : "grayscale(1) brightness(0.72) opacity(0.55)",
                        transition: "filter .3s",
                      }}
                    />
                    {!b.unlocked && (
                      <div style={{
                        position: "absolute", right: -4, bottom: -2,
                        width: 22, height: 22, borderRadius: 8,
                        background: "#1C2033", border: "1px solid rgba(255,255,255,0.18)",
                        display: "grid", placeItems: "center", fontSize: 11,
                      }}>🔒</div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: b.unlocked ? C.text : C.mid,
                    fontFamily: FONT, textAlign: "center", lineHeight: 1.3, minHeight: 27,
                    display: "flex", alignItems: "center",
                  }}>
                    {b.nom}
                  </div>
                  {b.unlocked ? (
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: C.green,
                      letterSpacing: "0.1em", fontFamily: FONT,
                    }}>
                      ✓ DÉBLOQUÉ
                    </div>
                  ) : (
                    <div style={{ width: "100%", padding: "0 4px" }}>
                      <div style={{
                        height: 5, borderRadius: 3, background: "rgba(0,0,0,0.08)",
                        overflow: "hidden", marginBottom: 4,
                      }}>
                        <div style={{
                          width: `${b.pct}%`, height: "100%", borderRadius: 3,
                          background: "linear-gradient(90deg,#60A5FA,#3B82F6)",
                          transition: "width .5s ease",
                        }}/>
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: C.dim,
                        textAlign: "center", fontFamily: FONT, ...NUM,
                      }}>
                        {b.current}/{b.target}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Note descriptive */}
      <div style={{
        margin: "24px 16px 0", padding: "12px 16px", borderRadius: 16,
        background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.12)",
        fontSize: 11, color: C.mid, lineHeight: 1.6, fontFamily: FONT,
      }}>
        Tes badges se débloquent automatiquement au fil de tes séances, de ta régularité,
        de tes records et de ton suivi nutrition. Continue comme ça 💪
      </div>
    </div>
  );
}
