// @ts-check
// ─── MorphoCoach · PaywallNutrition — refonte visuelle premium dark ──────────
// Aucune logique métier modifiée :
//   · props identiques   (onSubscribe, onClose)
//   · FEATURES identiques (mêmes labels, mêmes sous-titres, même ordre)
//   · prix identique      (6,99 € / mois)
//   · image identique     (Pexels ID 5836775 via useOfferPhoto("nutrition-pro"))
// Seule l'UI est refaite : fond sombre, grande image, hiérarchie premium.
import { C, FONT } from "../../data/constants.js";
import { I, ID } from "../ui/Icon.jsx";
import { useOfferPhoto } from "../../features/home/useOfferPhoto.js";

// Features conservées à l'identique (labels + sub) — on ajoute juste `icon`.
const FEATURES = [
  { icon: "cloche", label: "+500 recettes premium complètes",    sub: "Ingrédients, étapes détaillées, curseur calories" },
  { icon: "fruit",  label: "Conseils nutritionnels personnalisés", sub: "Selon ton objectif, profil et régime alimentaire" },
  { icon: "camera", label: "Estimation macros par photo de repas", sub: "Analyse instantanée — jusqu'à 120 photos/mois" },
  { icon: "chart",  label: "Bilan nutritionnel bi-mensuel",       sub: "Analyse complète de tes apports toutes les 2 semaines" },
  { icon: "apple",  label: "Suivi fruits & légumes quotidien",    sub: "Tracker avec objectifs personnalisés" },
  { icon: "goal",   label: "Recommandations actionnables",        sub: "Conseils concrets pour progresser chaque semaine" },
];

const GREEN     = "#12B76A";
const GREEN_SOFT = "rgba(18,183,106,0.14)";
const GREEN_LINE = "rgba(18,183,106,0.32)";
const BG        = "#0A0F17";
const TEXT      = "#FFFFFF";
const MUTED     = "#A7AFBF";
const HAIRLINE  = "rgba(255,255,255,0.06)";
const INNER_BG  = "rgba(255,255,255,0.03)";
const INNER_BD  = "rgba(255,255,255,0.08)";

export function PaywallNutrition({ onSubscribe, onClose }) {
  const photo = useOfferPhoto("nutrition-pro", "card");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 340,
      background: "rgba(3,5,10,0.86)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "12px 12px 16px",
      fontFamily: FONT,
    }}>
      <div style={{
        position: "relative",
        width: "100%", maxWidth: 420,
        maxHeight: "94vh", overflowY: "auto", overflowX: "hidden",
        background: BG,
        border: `1px solid ${GREEN_LINE}`,
        borderRadius: 28,
        boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(18,183,106,0.05) inset`,
        WebkitOverflowScrolling: "touch",
      }}>
        {/* ── ZONE IMAGE (bandeau haut) ────────────────────────────────── */}
        <div style={{
          position: "relative",
          width: "100%", height: 200,
          overflow: "hidden",
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
        }}>
          {photo.src && (
            <img src={photo.src} alt={photo.alt || "Nutrition Pro"}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center 42%",
                display: "block",
              }} />
          )}
          {/* Gradient bas : fond de la modal remonte pour lier le titre */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(180deg, rgba(10,15,23,0.10) 0%, rgba(10,15,23,0.55) 55%, ${BG} 100%)`,
            pointerEvents: "none",
          }} />
          {/* Petit voile vert en bas gauche pour cohérence identitaire */}
          <div style={{
            position: "absolute", left: -40, bottom: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(18,183,106,0.22), transparent 70%)",
            filter: "blur(8px)", pointerEvents: "none",
          }} />

          {/* Badge NUTRITION PRO posé sur l'image */}
          <div style={{
            position: "absolute", top: 16, left: 16,
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 14px",
            borderRadius: 999,
            background: "rgba(10,15,23,0.60)",
            border: `1px solid ${GREEN_LINE}`,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: GREEN,
            fontSize: 11, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>
            <ID name="bowl" size={16} dark tint={GREEN} />
            Nutrition PRO
          </div>

          {/* Bouton X circulaire */}
          <button onClick={onClose} aria-label="Fermer" style={{
            position: "absolute", top: 14, right: 14,
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(10,15,23,0.60)",
            border: "1px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: "#fff",
            display: "grid", placeItems: "center",
            cursor: "pointer", padding: 0,
          }}>
            <I name="close" size={16} color="#fff" stroke={2} />
          </button>
        </div>

        {/* ── CONTENU ─────────────────────────────────────────────────── */}
        <div style={{ padding: "8px 22px 22px" }}>
          {/* Titre avec accent vert italique */}
          <h2 style={{
            margin: 0,
            color: TEXT, fontFamily: FONT,
            fontSize: 30, lineHeight: 1.08,
            fontWeight: 850, letterSpacing: "-0.035em",
          }}>
            Mange mieux,<br />
            <span style={{ color: GREEN, fontStyle: "italic", fontWeight: 800 }}>
              progresse plus vite
            </span>
          </h2>

          {/* Sous-titre */}
          <p style={{
            margin: "12px 0 22px",
            color: MUTED, fontFamily: FONT,
            fontSize: 13.5, lineHeight: 1.5, fontWeight: 500,
          }}>
            Tout ce qu'il faut pour optimiser<br />
            ta nutrition au quotidien.
          </p>

          {/* Carte intérieure des avantages */}
          <div style={{
            background: INNER_BG,
            border: `1px solid ${INNER_BD}`,
            borderRadius: 20,
            padding: "4px 14px",
            marginBottom: 22,
          }}>
            {FEATURES.map((f, i) => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 0",
                borderBottom: i < FEATURES.length - 1 ? `1px solid ${HAIRLINE}` : "none",
              }}>
                {/* Tuile icône */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: GREEN_SOFT,
                  border: `1px solid ${GREEN_LINE}`,
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <ID name={f.icon} size={22} dark tint={GREEN} />
                </div>
                {/* Texte */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: TEXT, fontSize: 13.5, fontWeight: 700,
                    lineHeight: 1.25, letterSpacing: "-0.005em",
                  }}>{f.label}</div>
                  <div style={{
                    color: MUTED, fontSize: 11.5, fontWeight: 500,
                    marginTop: 2, lineHeight: 1.35,
                  }}>{f.sub}</div>
                </div>
                {/* Check plein vert */}
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: GREEN, flexShrink: 0,
                  display: "grid", placeItems: "center",
                  boxShadow: `0 4px 12px rgba(18,183,106,0.30)`,
                }}>
                  <I name="check" size={13} color="#fff" stroke={2.6} />
                </div>
              </div>
            ))}
          </div>

          {/* Prix */}
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{
              display: "inline-flex", alignItems: "baseline", gap: 6,
            }}>
              <span style={{
                color: TEXT, fontFamily: FONT,
                fontSize: 44, fontWeight: 850,
                letterSpacing: "-0.045em", lineHeight: 1,
              }}>6,99€</span>
              <span style={{
                color: GREEN, fontSize: 14, fontWeight: 700,
                letterSpacing: "-0.01em",
              }}>/mois</span>
            </div>
            <div style={{
              color: MUTED, fontSize: 11.5, marginTop: 6, fontWeight: 500,
            }}>
              Sans engagement · Résiliable à tout moment
            </div>
          </div>

          {/* CTA principal — Activer Nutrition PRO */}
          <button onClick={onSubscribe} className="tap" style={{
            width: "100%", height: 54,
            position: "relative",
            background: `linear-gradient(180deg, ${GREEN}, #0E9E5A)`,
            border: "none", borderRadius: 16,
            color: "#fff",
            fontFamily: FONT, fontSize: 15, fontWeight: 800,
            letterSpacing: "-0.005em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            cursor: "pointer",
            boxShadow: `0 10px 28px rgba(18,183,106,0.42), 0 0 0 1px rgba(255,255,255,0.06) inset`,
          }}>
            <I name="crown" size={17} color="#fff" fill />
            Activer Nutrition PRO
            <I name="arrowRight" size={16} color="#fff" stroke={2.2}
              style={{ position: "absolute", right: 18 }} />
          </button>

          {/* Continuer en gratuit — outline discret */}
          <button onClick={onClose} className="tap" style={{
            width: "100%", height: 46,
            marginTop: 10,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 14,
            color: MUTED,
            fontFamily: FONT, fontSize: 13, fontWeight: 600,
            cursor: "pointer",
          }}>
            Continuer en gratuit
          </button>
        </div>
      </div>
    </div>
  );
}
