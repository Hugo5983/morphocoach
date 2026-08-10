// ─── CARDIO & CONDITIONNEMENT ───────────────────────────────────────────────
// POURQUOI CE MODULE EXISTE :
//
// L'objectif "perte_poids" existait dans l'application, mais aucune connaissance
// cardio n'atteignait jamais le générateur. La seule mention dans toute la base
// était « finisher cardio en fin de séance » dans une prescription. Le modèle
// improvisait donc à partir de ses connaissances générales — ou n'en parlait pas
// du tout, ce qui est pire pour quelqu'un venu perdre du gras.
//
// Ce module couvre ce qu'un coach décide vraiment : quelle modalité, quelle
// dose, OÙ la placer dans la semaine, et comment ne pas saboter la musculation
// avec. Ce dernier point est le plus mal traité dans la littérature grand
// public, et c'est celui qui fait la différence sur le terrain.

/**
 * Règle d'interférence : c'est elle qui évite qu'un athlète perde sa force en
 * croyant bien faire. Elle s'applique à TOUS les objectifs qui combinent
 * musculation et cardio.
 */
export const INTERFERENCE = `INTERFÉRENCE CARDIO / MUSCULATION (règle de placement) :
- L'interférence est proportionnelle à la PROXIMITÉ, à la DURÉE et à l'IMPACT du cardio, pas à son existence. Bien placé, il ne coûte rien.
- Ordre dans une même séance : TOUJOURS la musculation d'abord. Un cardio préalable dégrade la force et la qualité technique sur les séries qui suivent.
- Cardio long (> 30 min) : au moins 6 h après la séance de musculation, ou sur un jour séparé. Jamais juste avant.
- Le cardio à faible impact (vélo, rameur, marche, elliptique) interfère beaucoup moins que la course : sur les jambes, préférer le vélo quand la séance jambes est proche.
- Un finisher court (5-10 min) en fin de séance n'interfère pas : il termine ce qui est déjà fait.
- Les jambes sont la zone sensible. Après une séance jambes lourde, aucun cardio d'impact pendant 24 h.`;

/** Modalités, avec ce qui les distingue réellement pour l'athlète. */
export const MODALITES = `MODALITÉS ET CE QU'ELLES COÛTENT :
- Marche rapide / marche inclinée : quasi aucune fatigue résiduelle, récupération non compromise. C'est le levier le plus sous-estimé pour la dépense énergétique — il s'additionne à tout le reste sans rien lui prendre.
- Vélo / rameur / elliptique : impact articulaire faible, dosable précisément, compatible avec un volume de musculation élevé.
- Course : la plus coûteuse en récupération et en impact. À réserver aux athlètes qui la pratiquent déjà ou dont l'objectif la demande.
- HIIT : très efficace en temps, mais c'est un stress NERVEUX qui se cumule avec la musculation lourde. Maximum 2 séances par semaine, jamais la veille ni le lendemain d'une séance jambes lourde, jamais chez un débutant non conditionné.
- Circuits métaboliques avec charges : à compter comme de la musculation dans le volume hebdomadaire, pas comme du cardio.`;

/** Doses par objectif — volontairement des fourchettes, pas des chiffres fixes. */
const DOSES = {
  perte_poids: {
    titre: "PERTE DE POIDS",
    lignes: [
      "Le cardio ne remplace jamais la musculation : c'est elle qui protège la masse musculaire pendant la perte. Le cardio s'AJOUTE, il ne se substitue pas.",
      "Base : 2 à 4 sessions de 25-40 min à intensité modérée (conversation possible mais gênée), sur les jours SANS musculation en priorité.",
      "Marche quotidienne : le levier le plus rentable et le moins coûteux. Viser une marche régulière en plus des séances, elle ne compromet aucune récupération.",
      "HIIT : 1 à 2 fois par semaine maximum, et seulement si la récupération le permet. Jamais collé à une séance jambes.",
      "Si la fatigue monte ou la force baisse, on retire du cardio AVANT de retirer de la musculation. Perdre du muscle en perdant du poids est un échec, pas un résultat.",
    ],
  },
  prep_physique: {
    titre: "PRÉPARATION PHYSIQUE",
    lignes: [
      "Le conditionnement doit ressembler à la demande du sport : durée des efforts, durée des pauses, filière sollicitée. Un sport intermittent ne se prépare pas avec du footing continu.",
      "Construire une base aérobie (30-45 min à intensité modérée, 1 à 2 fois par semaine) AVANT d'empiler des intervalles : sans elle, la récupération entre efforts intenses ne suit pas.",
      "Travail intermittent : 1 à 2 fois par semaine, en respectant les ratios effort/repos du sport pratiqué.",
      "En période de compétition, réduire le volume de conditionnement et garder l'intensité : c'est la fraîcheur qui gagne, pas le kilométrage.",
    ],
  },
  sante: {
    titre: "SANTÉ",
    lignes: [
      "Cardio d'endurance modéré 2 à 3 fois par semaine, 20-40 min, à une intensité qui reste confortable. La régularité prime largement sur l'intensité.",
      "Privilégier ce qui sera réellement tenu dans la durée : marche, vélo, natation. Le meilleur cardio est celui qui est fait chaque semaine pendant des années.",
      "Aucun impératif d'intensité élevée : le bénéfice cardiovasculaire principal s'obtient bien avant l'inconfort.",
    ],
  },
  hypertrophie: {
    titre: "HYPERTROPHIE",
    lignes: [
      "Cardio optionnel et volontairement limité : 1 à 2 sessions courtes (20-30 min, faible impact) suffisent à entretenir la capacité cardiovasculaire sans coûter de récupération.",
      "Utilité réelle : une meilleure capacité cardio améliore la récupération ENTRE les séries et entre les séances. Ce n'est pas du temps perdu.",
      "Ne jamais placer de cardio significatif le jour d'une séance jambes.",
    ],
  },
  force: {
    titre: "FORCE",
    lignes: [
      "Cardio réduit au strict entretien : 1 à 2 sessions de 20-25 min à faible impact, éloignées des séances lourdes.",
      "Aucun HIIT ni course pendant un bloc d'intensification : le coût nerveux entre directement en concurrence avec les charges maximales.",
      "La marche reste toujours possible et recommandée : elle favorise la récupération sans la compromettre.",
    ],
  },
  reathletisation: {
    titre: "RÉATHLÉTISATION",
    lignes: [
      "Cardio à faible impact uniquement, en respectant strictement l'absence de douleur : vélo, elliptique, natation selon la zone concernée.",
      "Progression par la DURÉE avant l'intensité. Aucun impact tant que la zone n'est pas indolore sur les gestes du quotidien.",
      "Le cardio sert ici la circulation et le moral autant que la condition physique : la régularité compte plus que la performance.",
    ],
  },
};

const clef = (o) => {
  const k = String(o || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (k.includes("force")) return "force";
  if (k.includes("perte") || k === "poids") return "perte_poids";
  if (k.includes("prep")) return "prep_physique";
  if (k.includes("sante")) return "sante";
  if (k.includes("reathl")) return "reathletisation";
  return "hypertrophie";
};

/**
 * Bloc cardio à injecter dans le prompt.
 *
 * @param {{objectif?: string, niveau?: string, nbJours?: number, sport?: string,
 *          materiel?: string[], pathologies?: string[]}} p
 * @returns {string}
 */
export function buildCardioBlock({ objectif, niveau, nbJours = 3, sport = "", materiel = [], pathologies = [] } = {}) {
  const k = clef(objectif);
  const d = DOSES[k];
  const lignes = [...d.lignes];

  // Un planning déjà saturé ne supporte pas d'ajout : le dire explicitement
  // évite un programme impossible à tenir.
  if (nbJours >= 5) lignes.push(
    `Avec ${nbJours} séances de musculation par semaine, le temps disponible est déjà pris : `
    + "place le cardio en finisher court ou en marche quotidienne, pas en sessions supplémentaires. "
    + "Ajouter des séances ici dégraderait la récupération sans rien apporter."
  );
  else if (nbJours <= 2) lignes.push(
    `Avec seulement ${nbJours} séances de musculation, les jours libres sont une vraie ressource : `
    + "le cardio s'y place sans aucune interférence."
  );

  // Débutant : le HIIT est presque toujours une erreur au démarrage.
  if (String(niveau).toLowerCase().startsWith("deb")) lignes.push(
    "Débutant : aucun HIIT. La priorité est la régularité et la technique en musculation ; "
    + "le cardio reste modéré et agréable, sinon il devient la raison d'arrêter."
  );

  // Matériel réellement disponible.
  const mat = (materiel || []).join(" ").toLowerCase();
  if (mat.includes("poids_corps") && !mat.includes("salle")) lignes.push(
    "Sans matériel de cardio : marche, marche inclinée, course modérée, corde à sauter, "
    + "ou circuits au poids du corps à intensité contrôlée."
  );

  // Contre-indications les plus fréquentes sur l'impact.
  const patho = (pathologies || []).join(" ").toLowerCase();
  if (/genou|menisque|ménisque|lca|rotul|arthrose|cheville|achille|hanche|coxarthrose/.test(patho)) lignes.push(
    "Zone portante déclarée sensible : proscrire la course et les sauts. "
    + "Vélo, elliptique, rameur ou natation — l'impact est le facteur limitant, pas l'effort."
  );
  if (/lombalgie|hernie|discale|sciatique|dos/.test(patho)) lignes.push(
    "Dos sensible : éviter le rameur en charge et la course sur sol dur. "
    + "Vélo avec position redressée, marche inclinée, elliptique."
  );

  // Sport pratiqué : son propre entraînement compte déjà comme conditionnement.
  if (sport && String(sport).trim()) lignes.push(
    `L'athlète pratique ${sport} : ses entraînements comptent DÉJÀ comme conditionnement. `
    + "Ne les additionne pas à un cardio supplémentaire — compte-les, puis complète seulement ce qui manque."
  );

  return `═══ CARDIO & CONDITIONNEMENT — ${d.titre} ═══
${lignes.map(l => "- " + l).join("\n")}

${INTERFERENCE}

${MODALITES}

FORMAT : le cardio ne figure PAS dans "exercices" (ce champ est réservé à la
musculation et sert au calcul du volume). Décris-le dans le champ "note" de la
séance concernée, ou dans "reflexion.strategie" pour les sessions autonomes.
Sois précis : modalité, durée, intensité, jour de placement.`;
}
