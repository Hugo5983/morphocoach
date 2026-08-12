// @ts-check
// ─── MorphoCoach · Paywall (Entraînement) — V2, parité stricte avec Nutrition ─
// Aucune logique métier modifiée :
//   · props identiques   (onSubscribe, onClose)
//   · FEATURES identiques (mêmes labels, sous-titres, ordre)
//   · prix identique      (19,99 € / cycle)
//   · image identique     (Pexels ID 19254705 via useOfferPhoto("training-pro"))
// Réutilise PaywallShell exporté par PaywallNutrition.jsx pour garantir la
// parité stricte de structure, proportions, typographie, espacements, rayons,
// composants et animations — seules la couleur (bleu) et l'image changent.
import { C } from "../../data/constants.js";
import { useOfferPhoto } from "../../features/home/useOfferPhoto.js";
import { PaywallShell } from "./PaywallNutrition.jsx";

const FEATURES = [
  { icon: "gym",      label: "Programme morphologique personnalisé", sub: "Adapté à ta morphologie, tes objectifs et ton niveau" },
  { icon: "calendar", label: "Planification 6 semaines clé en main",  sub: "Cycles progressifs avec surcharge programmée" },
  { icon: "person",   label: "Analyse morphologique complète",        sub: "Évaluation posture, points faibles, déséquilibres" },
  { icon: "chart",    label: "Bilan de progression bi-mensuel",       sub: "Suivi détaillé de tes progrès toutes les 2 semaines" },
  { icon: "flame",    label: "Méthodes d'intensification avancées",   sub: "Drop sets, pyramidal, surcharge progressive" },
  { icon: "goal",     label: "Exercices correctifs sur mesure",       sub: "Adaptés à tes limitations ou pathologies" },
];

// Palette Entraînement (bleu électrique MorphoCoach)
const ACCENT      = C.accent || "#3C5BFF";
const ACCENT_DEEP = "#2438B8";
const ACCENT_SOFT = "rgba(60,91,255,0.14)";
const ACCENT_LINE = "rgba(60,91,255,0.32)";

export function Paywall({ onSubscribe, onClose }) {
  const photo = useOfferPhoto("training-pro", "card");

  return (
    <PaywallShell
      accent={ACCENT} accentDeep={ACCENT_DEEP}
      accentSoft={ACCENT_SOFT} accentLine={ACCENT_LINE}
      badgeIcon="gym" badgeLabel="Entraînement PRO"
      photoSrc={photo.src} photoAlt={photo.alt || "Entraînement Pro"}
      titleMain="Entraîne-toi plus intelligemment,"
      titleAccent="progresse plus vite"
      subtitle={<>Un programme conçu pour ton corps,<br />pas pour tout le monde.</>}
      features={FEATURES}
      price="19,99€" period="/cycle"
      ctaLabel="Activer Entraînement PRO"
      onSubscribe={onSubscribe} onClose={onClose}
    />
  );
}
