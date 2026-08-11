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
  BadgesCard, StreakCard, CoachIACard,
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

  // ── Composition immersive ───────────────────────────────────────────────
  // La photo occupe TOUTE la largeur de la carte en fond ; le contenu texte
  // se superpose au-dessus, avec un dégradé sombre → transparent qui gère
  // la lisibilité. Trois tiers :
  //   • 0-30 %   : totalement opaque (texte parfaitement lisible)
  //   • 30-70 %  : fondu progressif (photo apparaît doucement derrière)
  //   • 70-100 % : photo visible et nette
  // Le texte s'arrête vers 60 % de la carte (paddingRight ~40 %), donc son
  // extrémité droite est déjà dans la zone de fondu léger → effet immersif
  // sans perte de contraste. Pas de séparation verticale visible.
  //
  //   ┌────────────────────────────────────────────┐
  //   │  [icône] Titre                             │
  //   │  Sous-titre    ┅┅┅  ← fondu ┅┅┅  📷 photo  │
  //   │  [icône] Feature 1  ┅┅┅┅         nette     │
  //   │  [icône] Feature 2  ┅┅┅┅                   │
  //   │  [icône] Feature 3  ┅┅┅┅                   │
  //   │  [icône] Feature 4  ┅┅┅┅                   │
  //   │                                            │
  //   │  [ Gérer mon abonnement → ]  ← full width  │
  //   └────────────────────────────────────────────┘

  // Gradient horizontal en 6 stops pour éviter toute ligne verticale
  // perceptible et créer un vrai fondu progressif entre les 3 tiers.
  const gradientOverlay = `linear-gradient(to right, `
    + `${DARK.surface} 0%, `
    + `${DARK.surface} 30%, `
    + `${DARK.surface}E6 42%, `   // ~90 % opacity
    + `${DARK.surface}99 55%, `   // ~60 %
    + `${DARK.surface}4D 68%, `   // ~30 %
    + `transparent 82%)`;

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
      {/* ── Photo en fond, largeur pleine, ancrée à droite ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: photo.src ? `url(${photo.src})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "right center",
        backgroundColor: DARK.bgDeep,   // placeholder si le workflow n'a pas tourné
        zIndex: 0,
      }} aria-label={photo.alt || undefined} />

      {/* ── Overlay dégradé — sombre à gauche, transparent à droite ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: gradientOverlay,
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* ── Voile sombre supplémentaire tout en bas, pour asseoir le CTA
             sans faire une ligne dure entre la photo et le bouton ── */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        height: 96,
        background: `linear-gradient(to bottom, transparent 0%, ${DARK.surface}CC 60%, ${DARK.surface} 100%)`,
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* ── Contenu texte + CTA, superposé au fond ── */}
      <div style={{
        position: "relative",
        zIndex: 2,
        padding: "22px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        {/* Header : icône + titre + sous-titre
             paddingRight 32 % → zone titre = 155 px min (iPhone 375), ce qui
             permet à « Entraînement » (≈145 px en Archivo 800 22px) de tenir
             sur une seule ligne avec +10 px de marge. Le texte s'étend jusqu'à
             ~68 % de la carte, juste dans la zone de fondu progressif → effet
             photo légèrement plus présent derrière le contenu qu'à 38 %. */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingRight: "32%" }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: tileBg,
            border: `1px solid ${tileBorder}`,
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <ID name={iconMain} size={24} dark tint={accent} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 22, fontWeight: 800, lineHeight: 1.1,
              fontFamily: FONT, color: DARK.text,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",  // empêche « Entraînement » de se couper
            }}>
              {title}{" "}
              <span style={{ color: accent }}>Pro</span>
            </div>
            <div style={{
              marginTop: 6,
              fontSize: 13, fontWeight: 500, lineHeight: 1.35,
              color: DARK.dimStrong, fontFamily: FONT,
              overflowWrap: "break-word",
            }}>
              {subtitle}
            </div>
          </div>
        </div>

        {/* Features (colonne) — paddingRight aligné sur le header */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 14,
          paddingRight: "32%",
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
                  overflowWrap: "break-word",
                }}>
                  {f.title}
                </div>
                <div style={{
                  fontSize: 11.5, color: DARK.dim, fontWeight: 500,
                  marginTop: 3, lineHeight: 1.4, fontFamily: FONT,
                  overflowWrap: "break-word",
                }}>
                  {f.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA plein — traverse toute la largeur de la carte */}
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
          marginTop: 4,
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
      paddingBottom: 32,
      fontFamily: FONT,
      WebkitFontSmoothing: "antialiased",
    }}>
      <HeroCard prog={prog} calSess={calSess} setTab={setTab} />
      <NutritionCard
        calObj={calObj} pObj={pObj} gObj={gObj} lObj={lObj}
        totR={totR} setTab={setTab}
        setPaywallNutrition={setPaywallNutrition} premium={premium}
      />
      <StreakCard streak={streak} />
      <BadgesCard badgeStates={badgeStates} onVoirTout={() => setShowBadges(true)} />
      <CoachIACard />
    </div>
  );
}
