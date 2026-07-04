// @ts-check
// ─── MorphoCoach · HomePage ───────────────────────────────────────────────────
// Maquette v4 convertie en JSX production-ready.
// Connecté aux données réelles via props + xpService.
// ─────────────────────────────────────────────────────────────────────────────

import { FONT } from "../../data/constants.js";
import {
  HeroCard, NutritionCard, PacksCard,
  BadgesCard, StreakCard, CoachIACard,
} from "./components/HomeCards.jsx";

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
  const streak  = getStreak ?? 0;

  return (
    <div style={{
      paddingBottom: 90,
      fontFamily: FONT,
      WebkitFontSmoothing: "antialiased",
    }}>
      {/* Entraînement du jour */}
      <HeroCard prog={prog} calSess={calSess} setTab={setTab} />

      {/* Nutrition */}
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

      {/* Packs PRO — masqué si premium */}
      <PacksCard
        premium={premium}
        setPaywall={setPaywall}
        setPaywallNutrition={setPaywallNutrition}
      />

      {/* Mes Badges */}
      <BadgesCard />

      {/* Série en cours */}
      <StreakCard streak={streak} />

      {/* Coach IA */}
      <CoachIACard />
    </div>
  );
}

