// @ts-check
// ─── MorphoCoach · HomePage ───────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { C, FONT, DARK } from "../../data/constants.js";
import { I, ID } from "../../components/ui/Icon.jsx";
import BadgesPage from "./BadgesPage.jsx";
import { getBadgeStates } from "../../services/badgeService.js";
import { useOfferPhoto } from "./useOfferPhoto.js";
import {
  HeroCard, NutritionCard, PacksCard,
  BadgesCard, StreakCard, CoachCard,
} from "./components/HomeCards.jsx";

// ─── OFFRE PRO (vue « Offre du moment ») ──────────────────────────────────────
// Refonte visuelle premium sombre. Toute la logique métier (premium /
// setPaywall / setPaywallNutrition) est préservée à l'identique — seul le
// rendu change. Photos immersives résolues via useOfferPhoto (manifest
// figé par le workflow Pexels, comme les recettes).

/**
 * @typedef {Object} OfferFeature
 * @property {string} icon   nom d'icône dans le jeu ID (Icon.jsx)
 * @property {string} title
 * @property {string} sub
 */

/**
 * Carte d'offre immersive (bleue pour Training, verte pour Nutrition).
 * Une seule source visuelle — le variant `accent` pilote toute la teinte.
 */
function OfferCard({
  slug,          // "training-pro" | "nutrition-pro"
  accent,        // couleur MorphoCoach (bleu ou vert)
  title,         // "Entraînement" | "Nutrition"
  subtitle,
  iconMain,      // nom d'icône ID
  features,      // OfferFeature[]
  premium,
  onUnlock,
}) {
  const photo = useOfferPhoto(slug, "card");

  // Teintes dérivées de l'accent, sans hardcoder de nouvelles couleurs
  const tileBg     = accent + "1F";  // 12 % opacity → carré icône
  const tileBorder = accent + "3D";  // 24 %
  const cardBorder = accent + "40";  // 25 %
  const cardGlow   = accent + "1A";  // 10 %

  return (
    <div style={{
      position: "relative",
      background: DARK.surface,
      border: `1px solid ${cardBorder}`,
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: `0 0 0 1px ${accent}14, 0 12px 40px ${cardGlow}`,
      isolation: "isolate",
    }}>
      {/* ── Photo immersive à droite ── */}
      <div style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0,
        width: "48%",
        backgroundImage: photo.src ? `url(${photo.src})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: DARK.bgDeep,   // placeholder tant que le workflow n'a pas tourné
        zIndex: 0,
      }} aria-label={photo.alt || undefined} />

      {/* ── Masque dégradé gauche→droite pour lisibilité du texte ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, bottom: 0,
        right: 0,
        background: `linear-gradient(to right, ${DARK.surface} 0%, ${DARK.surface} 42%, ${DARK.surface}CC 55%, transparent 82%)`,
        zIndex: 1,
        pointerEvents: "none",
      }} />

      {/* ── Contenu ── */}
      <div style={{
        position: "relative",
        zIndex: 2,
        padding: "22px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        {/* Header : icône + titre + sous-titre */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingRight: "44%" }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: tileBg,
            border: `1px solid ${tileBorder}`,
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <ID name={iconMain} size={24} dark tint={accent} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 22, fontWeight: 800, lineHeight: 1.1,
              fontFamily: FONT, color: DARK.text,
              letterSpacing: "-0.01em",
            }}>
              {title}{" "}
              <span style={{ color: accent }}>Pro</span>
            </div>
            <div style={{
              marginTop: 6,
              fontSize: 13, fontWeight: 500, lineHeight: 1.35,
              color: DARK.dimStrong, fontFamily: FONT,
            }}>
              {subtitle}
            </div>
          </div>
        </div>

        {/* Features (colonne) */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 14,
          paddingRight: "44%",
        }}>
          {features.map((f) => (
            <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: tileBg,
                border: `1px solid ${tileBorder}`,
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                <ID name={f.icon} size={19} dark tint={accent} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 700, color: DARK.text,
                  fontFamily: FONT, lineHeight: 1.2,
                }}>
                  {f.title}
                </div>
                <div style={{
                  fontSize: 11.5, color: DARK.dim, fontWeight: 500,
                  marginTop: 3, lineHeight: 1.4, fontFamily: FONT,
                }}>
                  {f.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA plein */}
        <button onClick={onUnlock} className="tap" style={{
          width: "100%",
          padding: "15px 16px",
          borderRadius: 16,
          background: accent,
          color: "#FFFFFF",
          border: "none",
          fontSize: 15, fontWeight: 700, fontFamily: FONT,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          letterSpacing: "-0.005em",
          boxShadow: `0 8px 24px ${accent}40`,
        }}>
          <span>{premium ? "Gérer mon abonnement" : "Débloquer"}</span>
          <I name="arrowRight" size={18} color="#FFFFFF" stroke={2} />
        </button>
      </div>
    </div>
  );
}

function RapportView({ premium, setPaywall, setPaywallNutrition }) {
  const cards = [
    {
      slug: "training-pro",
      accent: C.accent,        // bleu MorphoCoach
      title: "Entraînement",
      subtitle: "Programme sur-mesure selon ta morphologie",
      iconMain: "coachDuo",
      features: [
        { icon: "coachDuo",    title: "Coach morphologique", sub: "Programme adapté à ta morphologie précise" },
        { icon: "dumbbell",    title: "Exercices correctifs", sub: "Compensation des asymétries & déséquilibres" },
        { icon: "calendarDuo", title: "Cycle 6 semaines",     sub: "Périodisation pro pour des gains durables" },
        { icon: "scanDuo",     title: "Suivi 3D",             sub: "Mesures corporelles et photo-progression" },
      ],
      onUnlock: () => setPaywall(true),
    },
    {
      slug: "nutrition-pro",
      accent: C.green,         // vert MorphoCoach
      title: "Nutrition",
      subtitle: "Atteins tes objectifs avec précision",
      iconMain: "apple",
      features: [
        { icon: "apple",     title: "Recettes premium",      sub: "500+ recettes adaptées à ton profil" },
        { icon: "progress",  title: "Analyse macro avancée", sub: "Répartition P/G/L personnalisée à tes objectifs" },
        { icon: "cameraDuo", title: "Scan photo",            sub: "Identifie les aliments en photo pour les logger" },
        { icon: "bookDuo",   title: "Bilan bi-mensuel",      sub: "Rapport détaillé de ta progression nutritionnelle" },
      ],
      onUnlock: () => setPaywallNutrition(true),
    },
  ];

  return (
    <div style={{
      background: DARK.bgDeep,
      minHeight: "100%",
      padding: "20px 16px 40px",
      display: "flex", flexDirection: "column", gap: 22,
      fontFamily: FONT,
    }}>
      {cards.map((card) => (
        <OfferCard
          key={card.slug}
          slug={card.slug}
          accent={card.accent}
          title={card.title}
          subtitle={card.subtitle}
          iconMain={card.iconMain}
          features={card.features}
          premium={premium}
          onUnlock={card.onUnlock}
        />
      ))}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function HomePage({
  profil, prog, setTab, premium, setPaywall, setPaywallNutrition,
  calObj, pObj, gObj, lObj, totR, getStreak, calSess, subView,
}) {
  const [showBadges, setShowBadges] = useState(false);
  const badgeStates = useMemo(() => getBadgeStates({ calObj, pObj }), [calObj, pObj, showBadges]);

  if (showBadges) {
    return <BadgesPage onBack={() => setShowBadges(false)} calObj={calObj} pObj={pObj} />;
  }

  // ── Vue Pro (« Offre du moment ») ──
  if (subView === "pro") {
    return (
      <RapportView
        premium={premium}
        setPaywall={setPaywall}
        setPaywallNutrition={setPaywallNutrition}
      />
    );
  }

  // ── Vue Accueil (today / default) ──
  const streak = getStreak ?? 0;
  return (
    <div style={{
      minHeight: "100%",
      paddingBottom: 34,
      background: DARK.bgDeep,
      color: DARK.text,
      fontFamily: FONT,
      WebkitFontSmoothing: "antialiased",
    }}>
      <HeroCard profil={profil} prog={prog} calObj={calObj} calSess={calSess} setTab={setTab} />
      <NutritionCard
        calObj={calObj} pObj={pObj} gObj={gObj} lObj={lObj}
        totR={totR} setTab={setTab}
        setPaywallNutrition={setPaywallNutrition} premium={premium}
      />
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
        gap: 10,
        padding: "14px 16px 0",
      }}>
        <StreakCard streak={streak} inline />
        <BadgesCard badgeStates={badgeStates} onVoirTout={() => setShowBadges(true)} inline />
      </div>
      <CoachCard setTab={setTab} />
    </div>
  );
}
