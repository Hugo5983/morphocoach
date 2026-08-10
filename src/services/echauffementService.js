// ─── ÉCHAUFFEMENT UNIFIÉ ────────────────────────────────────────────────────
// L'échauffement était éclaté en TROIS sources qui ne se parlaient pas :
//   1. le texte libre produit par l'IA (champ `echauffement` de la séance),
//   2. les séries d'approche calculées dans le mode focus,
//   3. les routines de mobilité « avant séance » de la page mobilité.
// L'athlète ne voyait jamais la séquence complète, et rien ne garantissait
// qu'elle tienne dans un temps raisonnable.
//
// Ici on produit UNE séquence, en trois temps, comme le ferait un coach :
//   GÉNÉRAL     élever la température et le rythme cardiaque (3 min)
//   SPÉCIFIQUE  préparer les articulations SOLLICITÉES CE JOUR (3-4 min)
//   MONTÉE      séries d'approche sur le premier mouvement lourd
//
// PLAFOND STRICT : 10 minutes hors montée en charge. Un échauffement qui
// déborde est un échauffement qu'on saute — et sauter l'échauffement est la
// première cause de blessure évitable en salle.

import { getSeriesApproche } from "./progressionService.js";
import { buildActivation, matsAutorises } from "./activationService.js";
import { groupeMusculaire } from "./muscleGroups.js";

const MAX_MIN_HORS_MONTEE = 10;

/** Échauffement général : le même pour tous, il élève la température. */
const GENERAL = {
  bas: [
    { nom: "Vélo ou rameur", duree: "3 min", comment: "Rythme facile, on cherche la température, pas l'essoufflement." },
    { nom: "Montées de genoux + talons-fesses", duree: "2 × 20 pas", comment: "Sur place, progressif." },
  ],
  haut: [
    { nom: "Rameur ou corde à sauter", duree: "3 min", comment: "Le haut du corps doit chauffer avant les épaules." },
    { nom: "Cercles de bras et rotations d'épaules", duree: "2 × 15", comment: "Amplitude croissante, sans à-coup." },
  ],
  mixte: [
    { nom: "Cardio léger au choix", duree: "3 min", comment: "Vélo, rameur, marche rapide. Objectif : température." },
    { nom: "Mobilisation articulaire générale", duree: "2 min", comment: "Chevilles, hanches, colonne, épaules — de bas en haut." },
  ],
};

/** Préparation spécifique par zone, quand aucune routine morpho ne s'applique. */
const SPECIFIQUE = {
  Pectoraux: [
    { nom: "Rotation externe élastique", duree: "2 × 15", comment: "La coiffe doit être réveillée avant tout développé." },
    { nom: "Pompes contre un mur", duree: "15 répétitions", comment: "Le geste à vide avant de le charger." },
  ],
  Dos: [
    { nom: "Face pull élastique", duree: "2 × 15", comment: "Réveille les rhomboïdes et le trapèze moyen." },
    { nom: "Suspension passive à la barre", duree: "2 × 15 s", comment: "Décoapte l'épaule et prépare la prise." },
  ],
  Épaules: [
    { nom: "Y-T-W au sol ou debout", duree: "2 × 8 par lettre", comment: "Active les stabilisateurs avant de charger." },
    { nom: "Rotation externe élastique", duree: "2 × 15", comment: "Coude au corps, résistance légère." },
  ],
  Quadriceps: [
    { nom: "Squat au poids de corps", duree: "2 × 12", comment: "Amplitude complète, contrôlée." },
    { nom: "Dorsiflexion genou au mur", duree: "10 par cheville", comment: "Conditionne la profondeur." },
  ],
  "Ischio-jambiers": [
    { nom: "Soulevé de terre roumain à vide", duree: "2 × 12", comment: "Charnière de hanche sans charge." },
    { nom: "Balancements de jambe", duree: "15 par jambe", comment: "Mobilité dynamique, pas d'étirement tenu." },
  ],
  Fessiers: [
    { nom: "Monster walk élastique", duree: "2 × 12 pas", comment: "Active le moyen fessier avant les mouvements lourds." },
    { nom: "Pont fessier au sol", duree: "15 répétitions", comment: "Réveille le grand fessier." },
  ],
  Biceps: [{ nom: "Curl à vide ou élastique", duree: "2 × 15", comment: "Le coude doit être chaud avant la charge." }],
  Triceps: [{ nom: "Extension élastique", duree: "2 × 15", comment: "Préparation du coude." }],
  Abdominaux: [{ nom: "Dead bug", duree: "10 par côté", comment: "Active le gainage profond." }],
  Mollets: [{ nom: "Extensions mollets au poids de corps", duree: "2 × 15", comment: "Amplitude complète." }],
};

const BAS = ["Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets"];
const HAUT = ["Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Trapèzes", "Avant-bras"];

/** Groupes réellement sollicités par la séance, par ordre d'apparition. */
function groupesDeLaSeance(seance) {
  const vus = [];
  for (const ex of seance?.exercices || []) {
    const g = groupeMusculaire(ex?.nom);
    if (g && g !== "Autre" && !vus.includes(g)) vus.push(g);
  }
  return vus;
}

/**
 * Séquence d'échauffement complète pour une séance.
 *
 * @param {{exercices?: object[], focus?: string, echauffement?: string}} seance
 * @param {{observations?: object}} fiche
 * @param {{metier?: string, pathologies?: string[], objectif?: string, niveau?: string}} profil
 * @param {{chargePremierExo?: number|null}} [opts]
 * @returns {{minutes: number, minutesTotal: number, blocs: object[],
 *            noteIA: string|null, montee: object[]}}
 */
export function getEchauffement(seance, fiche, profil = {}, opts = {}) {
  const groupes = groupesDeLaSeance(seance);

  // ── 1 & 2. MISE EN ROUTE + ACTIVATION ──
  // La préparation ciblée venait des ROUTINES DE MOBILITÉ. Elle produisait des
  // étirements statiques tenus (30-40 s) juste avant des charges lourdes —
  // l'inverse de ce qu'il faut. La mobilité garde ses créneaux matin/soir ;
  // l'échauffement passe désormais par de l'ACTIVATION pure, choisie dans le
  // catalogue selon les groupes du jour et le matériel réellement disponible.
  const act = buildActivation({
    groupes,
    mats: matsAutorises(profil?.materiel || []),
    pathologies: profil?.pathologies || [],
    maxMinutes: MAX_MIN_HORS_MONTEE,
  });
  const blocs = act.blocs;

  // ── 3. MONTÉE EN CHARGE — sur le premier mouvement lourd ──
  const premier = (seance?.exercices || [])[0];
  const charge = Number(opts.chargePremierExo) || null;
  const montee = premier && charge
    ? getSeriesApproche({ nom: premier.nom, cat: premier.cat }, charge, {
        objectif: profil.objectif, repsTravail: parseInt(premier.reps) || 10,
      })
    : [];

  // Plafond : on rabote le spécifique avant le général — la température
  // prime toujours sur la préparation fine.
  let minutes = blocs.reduce((s, b) => s + b.minutes, 0);
  if (minutes > MAX_MIN_HORS_MONTEE) {
    const spec = blocs.find(b => b.cle === "specifique");
    if (spec) {
      spec.minutes = Math.max(2, spec.minutes - (minutes - MAX_MIN_HORS_MONTEE));
      spec.exercices = spec.exercices.slice(0, 3);
    }
    minutes = blocs.reduce((s, b) => s + b.minutes, 0);
  }

  // Temps réel de la montée en charge, avec la formule de l'application.
  // Attention au parsing : "30-45s" donne 3045 s si l'on retire simplement les
  // non-chiffres. On prend la BORNE HAUTE de la fourchette.
  const minutesMontee = montee.reduce((s, m) => {
    const nums = String(m.repos || "").match(/\d+/g);
    const repos = nums ? Number(nums[nums.length - 1]) : 45;
    return s + (repos + 45) / 60;
  }, 0);

  return {
    minutes: Math.min(MAX_MIN_HORS_MONTEE, minutes),
    minutesTotal: Math.round(minutes + minutesMontee),
    blocs, montee,
    minutesMontee: Math.round(minutesMontee),
    // La consigne de l'IA reste affichée : elle contextualise la séance.
    noteIA: seance?.echauffement || null,
  };
}

/**
 * Durée d'échauffement à AJOUTER à la durée annoncée d'une séance.
 * Sans ça, une séance annoncée 60 min en prenait 76 : c'est ainsi qu'on
 * « se perd dans le temps de séance ».
 */
export function minutesEchauffement(seance, fiche, profil, opts) {
  return getEchauffement(seance, fiche, profil, opts).minutesTotal;
}
