// @ts-check
// ─── MorphoCoach · HomePage ───────────────────────────────────────────────────
// Maquette v4 convertie en JSX production-ready.
// Connecté aux données réelles via props + xpService.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from"react";
import { FONT } from"../../data/constants.js";
import BadgesPage from"./BadgesPage.jsx";
import { getBadgeStates } from"../../services/badgeService.js";
import {
  HeroCard, NutritionCard, PacksCard,
  BadgesCard, StreakCard, CoachIACard,
} from"./components/HomeCards.jsx";

export default function HomePage({
  profil,
  prog,
  setTab,
  premium,
  setPaywall,
  setPaywallNutrition,
  calObj,
  pObj,
  gObj,
  lObj,
  totR,
  getStreak,
  calSess,
}) {
  const [showBadges, setShowBadges] = useState(false);
  const badgeStates = useMemo(() => getBadgeStates({ calObj, pObj }), [calObj, pObj, showBadges]);

  if (showBadges) {
    return <BadgesPage onBack={() => setShowBadges(false)} calObj={calObj} pObj={pObj} />;
  }
  const streak  = getStreak ?? 0;

  return (
    <div style={{
      paddingBottom: 32,
      fontFamily: FONT,
      WebkitFontSmoothing:"antialiased",
    }}>
      {/* 1. Entraînement du jour */}
      <HeroCard prog={prog} calSess={calSess} setTab={setTab} />

      {/* 2. Série en cours — remontée juste après le hero */}
      <StreakCard streak={streak} />

      {/* 3. Nutrition */}
      <NutritionCard
        calObj={calObj}
        pObj={pObj}
        gObj={gObj}
        lObj={lObj}
        totR={totR}
        setTab={setTab}
        setPaywallNutrition={setPaywallNutrition}
        premium={premium}
      />

      {/* 4. Mes Badges — avant la vente */}
      <BadgesCard badgeStates={badgeStates} onVoirTout={() => setShowBadges(true)} />

      {/* 5. Coach IA — bandeau compact */}
      <CoachIACard />

      {/* 6+7. Packs PRO — Entraînement + Nutrition en bas */}
      <PacksCard
        premium={premium}
        setPaywall={setPaywall}
        setPaywallNutrition={setPaywallNutrition}
      />
    </div>
);
}

