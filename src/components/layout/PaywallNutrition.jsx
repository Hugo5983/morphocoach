// @ts-check
// ─── MorphoCoach · PaywallNutrition — refonte V2 (parité stricte avec Paywall) ─
// Aucune logique métier modifiée :
//   · props identiques   (onSubscribe, onClose)
//   · FEATURES identiques (mêmes labels, sous-titres, ordre)
//   · prix identique      (6,99 € / mois)
//   · image identique     (Pexels ID 5836775 via useOfferPhoto("nutrition-pro"))
// Seule l'identité de couleur (vert) et l'image changent par rapport à Paywall.
import { C, FONT } from "../../data/constants.js";
import { I, ID } from "../ui/Icon.jsx";
import { useOfferPhoto } from "../../features/home/useOfferPhoto.js";

const FEATURES = [
  { icon: "cloche", label: "+500 recettes premium complètes",    sub: "Ingrédients, étapes détaillées, curseur calories" },
  { icon: "fruit",  label: "Conseils nutritionnels personnalisés", sub: "Selon ton objectif, profil et régime alimentaire" },
  { icon: "camera", label: "Estimation macros par photo de repas", sub: "Analyse instantanée — jusqu'à 120 photos/mois" },
  { icon: "chart",  label: "Bilan nutritionnel bi-mensuel",       sub: "Analyse complète de tes apports toutes les 2 semaines" },
  { icon: "apple",  label: "Suivi fruits & légumes quotidien",    sub: "Tracker avec objectifs personnalisés" },
  { icon: "goal",   label: "Recommandations actionnables",        sub: "Conseils concrets pour progresser chaque semaine" },
];

// Palette Nutrition (vert MorphoCoach)
const ACCENT      = "#12B76A";
const ACCENT_DEEP = "#0E9E5A";
const ACCENT_SOFT = "rgba(18,183,106,0.14)";
const ACCENT_LINE = "rgba(18,183,106,0.32)";

// Tokens partagés (identiques à Paywall.jsx)
const BG        = "#0A0F17";
const TEXT      = "#FFFFFF";
const MUTED     = "#A7AFBF";
const HAIRLINE  = "rgba(255,255,255,0.06)";
const INNER_BG  = "rgba(255,255,255,0.03)";
const INNER_BD  = "rgba(255,255,255,0.08)";

export function PaywallNutrition({ onSubscribe, onClose }) {
  const photo = useOfferPhoto("nutrition-pro", "card");

  return (
    <PaywallShell
      accent={ACCENT} accentDeep={ACCENT_DEEP}
      accentSoft={ACCENT_SOFT} accentLine={ACCENT_LINE}
      badgeIcon="bowl" badgeLabel="Nutrition PRO"
      photoSrc={photo.src} photoAlt={photo.alt || "Nutrition Pro"}
      titleMain="Mange mieux,"
      titleAccent="progresse plus vite"
      subtitle={<>Tout ce qu'il faut pour optimiser<br />ta nutrition au quotidien.</>}
      features={FEATURES}
      price="6,99€" period="/mois"
      ctaLabel="Activer Nutrition PRO"
      onSubscribe={onSubscribe} onClose={onClose}
    />
  );
}

/**
 * Coquille visuelle partagée entre Nutrition et Entraînement.
 * Toute la structure/proportions/typo/espacements/rayons est ici → parité stricte.
 * Seules `accent*` (couleur), `photoSrc` (image via useOfferPhoto) et les
 * textes/features diffèrent selon l'offre.
 */
function PaywallShell({
  accent, accentDeep, accentSoft, accentLine,
  badgeIcon, badgeLabel,
  photoSrc, photoAlt,
  titleMain, titleAccent, subtitle,
  features,
  price, period,
  ctaLabel,
  onSubscribe, onClose,
}) {
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
        border: `1px solid ${accentLine}`,
        borderRadius: 28,
        boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px ${accentSoft} inset`,
        WebkitOverflowScrolling: "touch",
      }}>
        {/* ── ZONE HERO : image en fond couvrant tout le haut ─────────── */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingTop: 74, // laisse la place au header (badge + X)
        }}>
          {/* Image plein cadre */}
          {photoSrc && (
            <img src={photoSrc} alt={photoAlt}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "80% center",
                display: "block",
              }} />
          )}
          {/* Gradient horizontal : sombre à gauche pour lisibilité du texte,
              transparent à droite pour laisser l'image respirer */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(90deg, ${BG} 0%, rgba(10,15,23,0.86) 32%, rgba(10,15,23,0.30) 65%, rgba(10,15,23,0.08) 100%)`,
            pointerEvents: "none",
          }} />
          {/* Gradient vertical : fond du modal remonte en bas pour lier
              avec la carte features juste en dessous */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(180deg, rgba(10,15,23,0.30) 0%, rgba(10,15,23,0.20) 45%, ${BG} 100%)`,
            pointerEvents: "none",
          }} />
          {/* Voile accent en bas-gauche pour cohérence identitaire */}
          <div style={{
            position: "absolute", left: -60, bottom: -40,
            width: 240, height: 240, borderRadius: "50%",
            background: `radial-gradient(closest-side, ${accentSoft}, transparent 70%)`,
            filter: "blur(10px)", pointerEvents: "none",
          }} />

          {/* Header modal : badge centré + X à droite absolute */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            padding: "18px 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(10,15,23,0.65)",
              border: `1px solid ${accentLine}`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              color: accent,
              fontSize: 11.5, fontWeight: 800,
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}>
              <ID name={badgeIcon} size={16} dark tint={accent} />
              {badgeLabel}
            </div>
            <button onClick={onClose} aria-label="Fermer" style={{
              position: "absolute", top: 14, right: 14,
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(10,15,23,0.65)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              color: "#fff",
              display: "grid", placeItems: "center",
              cursor: "pointer", padding: 0,
            }}>
              <I name="close" size={17} color="#fff" stroke={2} />
            </button>
          </div>

          {/* Titre + sous-titre en superposition, à gauche */}
          <div style={{
            position: "relative", zIndex: 1,
            padding: "40px 22px 24px",
          }}>
            <h2 style={{
              margin: 0,
              color: TEXT, fontFamily: FONT,
              fontSize: 32, lineHeight: 1.05,
              fontWeight: 850, letterSpacing: "-0.035em",
              fontStyle: "italic",
              maxWidth: "80%",
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}>
              {titleMain}<br />
              <span style={{ color: accent }}>{titleAccent}</span>
            </h2>
            <p style={{
              margin: "14px 0 0",
              color: "rgba(255,255,255,0.78)", fontFamily: FONT,
              fontSize: 13.5, lineHeight: 1.5, fontWeight: 500,
              maxWidth: "72%",
              textShadow: "0 1px 8px rgba(0,0,0,0.4)",
            }}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* ── CONTENU BAS : features + prix + CTAs ─────────────────────── */}
        <div style={{ padding: "6px 22px 22px" }}>
          {/* Carte intérieure des avantages */}
          <div style={{
            background: INNER_BG,
            border: `1px solid ${INNER_BD}`,
            borderRadius: 20,
            padding: "4px 14px",
            marginBottom: 22,
          }}>
            {features.map((f, i) => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 0",
                borderBottom: i < features.length - 1 ? `1px solid ${HAIRLINE}` : "none",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: accentSoft,
                  border: `1px solid ${accentLine}`,
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <ID name={f.icon} size={22} dark tint={accent} />
                </div>
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
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: accent, flexShrink: 0,
                  display: "grid", placeItems: "center",
                  boxShadow: `0 4px 12px ${accentSoft}`,
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
              }}>{price}</span>
              <span style={{
                color: accent, fontSize: 14, fontWeight: 700,
                letterSpacing: "-0.01em",
              }}>{period}</span>
            </div>
            <div style={{
              color: MUTED, fontSize: 11.5, marginTop: 6, fontWeight: 500,
            }}>
              Sans engagement · Résiliable à tout moment
            </div>
          </div>

          {/* CTA principal */}
          <button onClick={onSubscribe} className="tap" style={{
            width: "100%", height: 54,
            position: "relative",
            background: `linear-gradient(180deg, ${accent}, ${accentDeep})`,
            border: "none", borderRadius: 16,
            color: "#fff",
            fontFamily: FONT, fontSize: 15, fontWeight: 800,
            letterSpacing: "-0.005em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            cursor: "pointer",
            boxShadow: `0 10px 28px ${accentSoft}, 0 0 0 1px rgba(255,255,255,0.06) inset`,
          }}>
            <I name="crown" size={17} color="#fff" fill />
            {ctaLabel}
            <I name="arrowRight" size={16} color="#fff" stroke={2.2}
              style={{ position: "absolute", right: 18 }} />
          </button>

          {/* Continuer en gratuit */}
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

// Exposé pour permettre à Paywall.jsx de partager exactement le même shell.
export { PaywallShell };
