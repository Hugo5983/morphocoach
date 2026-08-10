// ─── PRESCRIPTION PAR OBJECTIF ──────────────────────────────────────────────
// Source : MorphoCoach — Base de connaissances, couche C1 §2.1 à §2.4
// (charge optimale, tempos, temps de repos, volume).
//
// POURQUOI CE MODULE : jusqu'ici getVolumeParams() renvoyait des paramètres
// QUASI IDENTIQUES pour hypertrophie, perte de poids, prépa physique et
// réathlétisation — et aucun objectif n'avait de temps de repos, de tempo ni
// de zone de charge. Un « programme de force » ressemblait donc à un programme
// d'hypertrophie avec moins de répétitions. Ce module rend chaque objectif
// réellement distinct, avec les 4 leviers qui font la différence :
//   charge (% 1RM) · répétitions · TEMPO · REPOS.

/**
 * @typedef {Object} Prescription
 * @property {string} intensite     zone de charge en % du 1RM
 * @property {string} reps          plage de répétitions
 * @property {string} tempo         excentrique/tenue/concentrique
 * @property {string} repos         temps de repos entre séries
 * @property {string} series        séries par exercice
 * @property {string} logique       le mécanisme visé, en une phrase
 * @property {string} methodes      techniques d'intensification appropriées
 * @property {string} exercices     nature des exercices à privilégier
 * @property {string[]} interdits   ce qui trahirait l'objectif
 */

/** @type {Record<string, Prescription>} */
export const PRESCRIPTIONS = {
  force: {
    intensite: "85-95 % du 1RM sur les exercices principaux, 70-80 % sur les accessoires",
    reps: "1-5 sur les principaux, 6-8 sur les accessoires",
    tempo: "1-2s excentrique / 0s tenue / 1-2s concentrique — intention explosive à la montée",
    repos: "3 à 5 minutes sur les exercices lourds (anabolisme +152 %, maintien de la force)",
    series: "4 à 6 séries sur les principaux, 3 à 4 sur les accessoires",
    logique: "Adaptation NERVEUSE : recrutement, coordination intermusculaire, rigidité. On cherche la charge, pas la fatigue.",
    methodes: "séries lourdes classiques, cluster sets, potentiation post-activation (repos 4-8 min), pyramidal descendant",
    exercices: "polyarticulaires lourds prioritaires : squat, développé couché, soulevé de terre, développé militaire, rowing. Les accessoires servent les points faibles du mouvement principal.",
    interdits: [
      "repos courts (< 2 min) sur un exercice principal — ils sabotent l'expression de la force",
      "séries à l'échec systématique — la fatigue nerveuse bloque la progression",
      "superset sur les mouvements principaux",
      "plage 12-15 répétitions sur un exercice principal",
    ],
    // Bornes NUMÉRIQUES de la prescription — c'est cette version que le CODE
    // vérifie après génération. La prose ci-dessus est pour le modèle, ces
    // chiffres sont pour la validation. Volontairement LARGES : on ne veut
    // signaler que les écarts francs, pas les nuances de coaching.
    bornes: {
      reps: [1, 8],              // au-delà, ce n'est plus de la force
      repos_s: [90, 420],        // accessoires courts tolérés, principaux longs
      tempo_excentrique_s: [0, 4],
      // Signature : au moins UN exercice par séance doit être réellement lourd.
      signature: { reps_max: 6, repos_min_s: 150,
        libelle: "aucun exercice lourd (≤ 6 reps avec ≥ 2 min 30 de repos)" },
    },
  },

  hypertrophie: {
    intensite: "70-80 % du 1RM (zone optimale : réponse anabolique +130 % à 75 %, contre +100 % à 60 % et à 90 %)",
    reps: "6-12 sur les principaux, 10-15 sur l'isolation",
    tempo: "2-3s excentrique / 2s tenue / 2s concentrique — soit 6-7s par répétition, tension mécanique maximale",
    repos: "90 s à 3 min sur les polyarticulaires, 45-90 s sur l'isolation (congestion, stimulation hormonale)",
    series: "4 à 5 séries par exercice",
    logique: "Tension mécanique + stress métabolique + dommages musculaires. Le volume est le premier moteur : la charge sert la tension, pas le record.",
    methodes: "supersets agonistes-antagonistes, rest-pause sur 1 exercice par séance, séries dégressives en fin de séance, pyramidal",
    exercices: "polyarticulaires en début de séance pour la charge, isolation ensuite pour le volume ciblé et l'étirement sous tension",
    interdits: [
      "travail systématique sous 6 répétitions (zone de force, réponse anabolique moindre)",
      "repos de 5 min partout : allonge la séance sans gain hypertrophique",
      "tempo explosif sur l'isolation — il supprime la tension mécanique recherchée",
    ],
    bornes: {
      reps: [5, 20],
      repos_s: [40, 240],
      tempo_excentrique_s: [1, 5],
      signature: null,
    },
  },

  perte_poids: {
    intensite: "65-80 % du 1RM — la charge PRÉSERVE le muscle pendant le déficit, elle n'est jamais bradée",
    reps: "8-15",
    tempo: "2s excentrique / 1s tenue / 1s concentrique — contrôle sans lenteur excessive",
    repos: "45 à 90 s (densité élevée, dépense accrue), 2 min sur les gros polyarticulaires",
    series: "3 à 4 séries",
    logique: "Le muscle est le capital à DÉFENDRE : en déficit calorique, la charge maintenue est ce qui protège la masse maigre. La dépense vient de la densité, pas de la légèreté.",
    methodes: "circuits, supersets antagonistes, densité progressive (mêmes charges, repos réduits), finisher cardio en fin de séance",
    exercices: "polyarticulaires majeurs qui recrutent beaucoup de masse musculaire, complétés d'isolation courte",
    interdits: [
      "charges légères et séries interminables : fonte musculaire garantie en déficit",
      "volume très élevé : la récupération est déjà dégradée par le déficit calorique",
      "échec systématique : risque de surentraînement en restriction",
    ],
    bornes: {
      reps: [8, 25],
      repos_s: [30, 180],
      tempo_excentrique_s: [1, 4],
      signature: null,
    },
  },

  prep_physique: {
    intensite: "60-85 % selon la qualité travaillée — alterner dans la semaine",
    reps: "3-6 pour la puissance, 8-12 pour le volume de soutien",
    tempo: "excentrique contrôlé 2s, concentrique EXPLOSIF (intention maximale de vitesse)",
    repos: "2 à 3 min sur le travail de puissance, 4 à 8 min sur la potentiation, 60-90 s sur le soutien",
    series: "4 à 6 séries",
    logique: "Transfert vers la performance : produire de la force VITE (RFD) prime sur produire beaucoup de force. La qualité d'exécution passe avant l'accumulation.",
    methodes: "pliométrie, contrastes lourd-léger, potentiation post-activation, travail unilatéral et anti-rotation",
    exercices: "mouvements globaux, chaînes complètes, unilatéral, gainage anti-mouvement, transfert spécifique au sport pratiqué",
    interdits: [
      "séries à l'échec : elles dégradent la vitesse d'exécution, qui EST l'objectif",
      "volume d'isolation important au détriment du travail global",
      "tempo lent sur le travail de puissance",
    ],
    bornes: {
      reps: [3, 15],
      repos_s: [45, 480],
      tempo_excentrique_s: [0, 4],
      signature: null,
    },
  },

  sante: {
    intensite: "55-70 % du 1RM — confortable, jamais maximal",
    reps: "12-15",
    tempo: "2s / 1s / 2s — contrôlé sur toute l'amplitude",
    repos: "60 à 90 s (réduction du stress articulaire)",
    series: "2 à 3 séries",
    logique: "Régularité et sécurité articulaire avant performance. Le meilleur programme est celui qui sera fait toutes les semaines pendant des années.",
    methodes: "séries classiques, amplitude complète et contrôlée, aucune technique d'intensification",
    exercices: "mouvements guidés ou stables, renforcement global, mobilité et gainage à chaque séance",
    interdits: [
      "échec musculaire",
      "charges maximales",
      "techniques d'intensification (rest-pause, dégressives, forcées)",
    ],
    bornes: {
      reps: [8, 20],
      repos_s: [40, 150],
      tempo_excentrique_s: [1, 4],
      signature: null,
    },
  },

  reathletisation: {
    intensite: "40-65 % du 1RM, progression très graduelle — la charge suit la tolérance, jamais l'inverse",
    reps: "12-20 sur le travail correctif, 8-12 sur le renforcement",
    tempo: "3s excentrique / 1s tenue / 2s concentrique — l'excentrique lent est le levier tendineux",
    repos: "60 à 90 s (articulations fragiles)",
    series: "3 à 4 séries",
    logique: "Reconstruire la tolérance du tissu avant la performance. L'excentrique lent et l'isométrie sont les outils premiers de la remise en charge tendineuse.",
    methodes: "isométrie (30-45 s), excentrique lent, amplitude progressive, travail unilatéral pour corriger les asymétries",
    exercices: "correctifs de la zone concernée en priorité, renforcement global à charge modérée, proprioception",
    interdits: [
      "charges lourdes",
      "amplitude maximale sur une zone douloureuse",
      "échec musculaire",
      "pliométrie et mouvements balistiques",
    ],
    bornes: {
      reps: [8, 25],
      repos_s: [45, 150],
      tempo_excentrique_s: [2, 6],
      signature: null,
    },
  },
};

/** Alias tolérés depuis le formulaire. */
const ALIAS = {
  hypertrophie: "hypertrophie", prise_de_muscle: "hypertrophie", muscle: "hypertrophie",
  force: "force", puissance: "prep_physique",
  poids: "perte_poids", perte_poids: "perte_poids", seche: "perte_poids",
  prep_physique: "prep_physique", preparation: "prep_physique",
  sante: "sante", reathletisation: "reathletisation", reathle: "reathletisation",
};

function clef(objectif) {
  const k = String(objectif || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ALIAS[k] || (PRESCRIPTIONS[k] ? k : "hypertrophie");
}

/**
 * Bloc de prescription à injecter dans le prompt. C'est ce qui transforme un
 * "objectif" en programme réellement différent.
 * @param {string} objectif
 * @returns {string}
 */
export function buildPrescriptionBlock(objectif) {
  const k = clef(objectif);
  const p = PRESCRIPTIONS[k];
  const nom = {
    force: "FORCE MAXIMALE", hypertrophie: "HYPERTROPHIE / PRISE DE MASSE",
    perte_poids: "PERTE DE GRAISSE", prep_physique: "PRÉPARATION PHYSIQUE",
    sante: "SANTÉ / REMISE EN FORME", reathletisation: "RÉATHLÉTISATION",
  }[k];

  return `═══ PRESCRIPTION OBLIGATOIRE — OBJECTIF ${nom} ═══
Ces paramètres DÉFINISSENT l'objectif. Un programme qui ne les respecte pas ne
sert pas l'objectif demandé, quelle que soit la qualité des exercices choisis.

LOGIQUE VISÉE : ${p.logique}

• Intensité   : ${p.intensite}
• Répétitions : ${p.reps}
• Séries      : ${p.series}
• TEMPO       : ${p.tempo}
• REPOS       : ${p.repos}
• Méthodes    : ${p.methodes}
• Exercices   : ${p.exercices}

À NE PAS FAIRE (trahirait l'objectif) :
${p.interdits.map(i => `- ${i}`).join("\n")}

Le champ "repos" de CHAQUE exercice doit refléter la prescription ci-dessus
(en secondes). Le champ "reps" doit rester dans la plage indiquée. Justifie
tout écart dans "reflexion.strategie".`;
}

/**
 * Prescription brute (pour les tests et un usage programmatique).
 * @param {string} objectif
 */
export function getPrescription(objectif) {
  return PRESCRIPTIONS[clef(objectif)];
}

// ─── Compatibilité durée / objectif ─────────────────────────────────────────
// La formule de durée de l'app est : Σ séries × (repos + 60 s).
// Un objectif FORCE impose 3-5 min de repos : une séance de 45 min n'y tient
// que 2 exercices. Sans ce calcul, le prompt exigeait simultanément
// "minimum 4 exercices" et "45 minutes" — deux consignes incompatibles que le
// modèle ne pouvait satisfaire qu'en trahissant l'une des deux.

/** Repos et séries typiques, pour estimer le coût d'un exercice. */
const COUT = {
  force:           { series: 5, repos: 210 },
  hypertrophie:    { series: 4, repos: 105 },
  perte_poids:     { series: 3, repos:  70 },
  prep_physique:   { series: 4, repos: 150 },
  sante:           { series: 3, repos:  75 },
  reathletisation: { series: 3, repos:  75 },
};

/**
 * Minutes à RÉSERVER à l'échauffement, montée en charge comprise.
 *
 * Le code retirait 8 minutes forfaitaires, quel que soit l'objectif. C'est
 * faux, et toujours dans le même sens : l'échauffement général et spécifique
 * fait déjà 6 à 10 min, et la montée en charge s'y ajoute. Or elle dépend
 * entièrement de l'objectif — 3 à 4 séries d'approche avec 2 à 3 min de repos
 * avant un squat lourd, contre une seule série de mise en route avant un
 * exercice de congestion.
 *
 * Une séance annoncée 60 min en prenait donc 70 à 75. L'athlète la tronquait,
 * et ce sont les derniers exercices qui sautaient — souvent ceux du point faible.
 *
 * @param {string} objectif
 * @returns {number} minutes
 */
export function reserveEchauffementMin(objectif) {
  const k = clef(objectif);
  // Force et prépa physique : montée en charge longue, repos d'approche longs.
  if (k === "force" || k === "prep_physique") return 15;
  // Réathlétisation : préparation articulaire plus longue, charges légères.
  if (k === "reathletisation") return 12;
  // Perte de poids : charges modérées, montée courte.
  if (k === "perte_poids") return 8;
  return 10;
}

/**
 * Nombre d'exercices réaliste pour une durée et un objectif donnés, plus un
 * avertissement si la durée demandée est trop courte pour l'objectif.
 * @param {string} objectif
 * @param {number} minutes
 * @returns {{ nb: number, min: number, max: number, coutExo: number, alerte: string|null }}
 */
export function calibrerSeance(objectif, minutes) {
  const k = clef(objectif);
  const c = COUT[k] || COUT.hypertrophie;
  const coutExo = (c.series * (c.repos + 60)) / 60;          // minutes / exercice
  const theorique = minutes / coutExo;
  const nb = Math.max(3, Math.round(theorique));
  const min = Math.max(3, nb - 1), max = nb + 1;
  // L'alerte doit annoncer LA MÊME fourchette que la consigne, sinon le modèle
  // reçoit deux nombres contradictoires dans le même prompt.
  const alerte = theorique < 3.5
    ? `Avec les temps de repos qu'exige cet objectif, ${minutes} min ne permettent que ${min} à ${max} exercices `
      + `(≈ ${Math.round(coutExo)} min chacun). Concentre-toi sur les mouvements les plus rentables et raccourcis `
      + `le repos des ACCESSOIRES uniquement — jamais celui des exercices principaux. Si la durée limite vraiment `
      + `l'objectif, dis-le dans "reflexion.strategie".`
    : null;
  return { nb, min, max, coutExo: Math.round(coutExo), alerte };
}
