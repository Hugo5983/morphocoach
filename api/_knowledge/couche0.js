// ─── KNOWLEDGE : COUCHE 0 — RAISONNEMENT COACH ──────────────────────────────
// Le serveur recalcule les directives de variation (le client n'envoie que le
// dossier de données) : la logique de rotation reste côté serveur.

export const QUESTIONS_COACH = `
1. Que m'apprend la fiche morphologique (répartition, symétrie, posture, masse grasse visuelle, densité) ?
2. Que m'apprend son historique réel d'entraînement ?
3. Progresse-t-il, stagne-t-il, régresse-t-il ? Sur quels exercices précisément ?
4. Quels sont ses points forts ? 5. Ses points faibles ?
6. Quels exercices lui conviennent (progression + sensation) ? 7. Lesquels sont inefficaces ou douloureux ?
8. Où est le risque de blessure ? 9. Où est le risque d'abandon (séances évitées, durée, fréquence réelle) ?
10. Quel est le minimum efficace pour LUI ?
11. Quels muscles prioriser ? 12. Lesquels simplement entretenir ?
13. Quel sera son prochain facteur limitant ?
14. Quel est le meilleur compromis sécurité / progression / motivation ?`;

export const REGLE_PONDERATION =
  "PONDÉRATION FONDAMENTALE : la morphologie est une information parmi d'autres, JAMAIS un juge absolu. " +
  "En cas de conflit, l'historique réel PRIME sur la théorie morphologique : un exercice théoriquement " +
  "défavorable (ex. développé couché avec humérus longs) mais sur lequel l'athlète progresse depuis des mois " +
  "est CONSERVÉ. À l'inverse, un exercice théoriquement idéal qui stagne ou fait mal est remplacé. " +
  "Les interdits de SÉCURITÉ (pathologies), eux, ne se négocient jamais.";

const SPLITS_PAR_JOURS = {
  2: ["Corps entier ×2 (patterns différents chaque séance)", "Haut / Bas"],
  3: ["Push / Pull / Legs", "Corps entier ×3 à dominantes différentes", "Haut / Bas / Corps entier", "Tirage-Postérieur / Poussée / Jambes-Gainage"],
  4: ["Haut / Bas ×2 (intensité ≠ volume)", "Push / Pull / Legs / Haut", "Torse / Dos / Jambes / Bras-Épaules", "Poussée / Tirage / Jambes / Points faibles"],
  5: ["Push / Pull / Legs / Haut / Bas", "Split spécialisation point faible (2 séances dédiées)", "Torse / Dos / Jambes / Épaules-Bras / Full pump"],
  6: ["Push / Pull / Legs ×2 (lourd puis volume)", "Arnold split (Torse-Dos / Épaules-Bras / Jambes) ×2", "Spécialisation : 2 séances point faible + PPL entretien"],
};

const ACCENTS_METHODE = [
  "Tempo contrôlé 3-1-3 sur toutes les isolations (connexion neuromusculaire)",
  "Travail unilatéral prioritaire (haltères/câble un bras-une jambe) sur les assistances",
  "Supersets antagonistes sur le milieu de séance (densité)",
  "Pré-fatigue du point faible avant le composé principal",
  "Rest-pause sur le DERNIER set de chaque composé",
  "Clusters 2×(3+3+3) sur les composés principaux",
];

const VAGUES_REPS = {
  hypertrophie: ["6-8 composés / 10-12 assistance", "8-12 partout, tempo strict", "5-8 composés lourds / 12-15 isolations", "10-15 métabolique, repos courts"],
  force: ["3-5 composés / 6-8 assistance", "5×5 linéaire", "vague 5-3-1 / 8-10 assistance"],
  poids: ["12-15 + circuits", "10-12 supersets, repos 60s", "15-20 métabolique + finishers"],
  sante: ["12-15 confortable", "10-12 varié machines/câbles", "12-15 fonctionnel + gainage"],
  prep_physique: ["5-8 force / 8-10 transfert", "puissance 3-5 + conditionnement", "contraste lourd-explosif"],
};

/**
 * Empreinte stable d'un athlète, dérivée de son identifiant.
 *
 * POURQUOI : sans elle, la graine de variation ne contenait que le numéro de
 * cycle et la semaine calendaire. Deux personnes qui ne se connaissent pas,
 * au même cycle, la même semaine, avec le même nombre de jours, le même
 * objectif et le même niveau recevaient EXACTEMENT le même split imposé, le
 * même accent de méthode et la même vague de répétitions. La promesse
 * d'individualisation tombait sur la structure même du programme.
 *
 * L'empreinte est déterministe (le même athlète retrouve sa séquence, ses
 * cycles s'enchaînent logiquement) mais propre à lui (deux athlètes suivent
 * des séquences décorrélées).
 */
/** Mélange d'entiers (variante de Wang/Jenkins) : décorrèle deux graines proches. */
function melange(graine, sel) {
  let h = (graine >>> 0) ^ Math.imul(sel + 1, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export function empreinteAthlete(identifiant) {
  const s = String(identifiant || "");
  if (!s) return 0;
  // Hachage FNV-1a 32 bits : court, stable, sans dépendance.
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % 9973;   // nombre premier : évite les cycles courts dans les modulos
}

/**
 * Rotation déterministe : cycle + semaine calendaire + EMPREINTE DE L'ATHLÈTE.
 *
 * @param {object} p
 * @param {string|number} [p.empreinte] identifiant stable de l'athlète
 */
export function getVariationDirectives({ cycleNum, nbJours, objectif, niveau, empreinte }) {
  const week = Math.floor(Date.now() / (7 * 864e5));
  const emp = typeof empreinte === "number" ? empreinte : empreinteAthlete(empreinte);
  const seed = (cycleNum || 1) + week + emp;
  const pool = SPLITS_PAR_JOURS[Math.min(Math.max(nbJours || 3, 2), 6)] || SPLITS_PAR_JOURS[3];
  const accents = niveau === "debutant" ? ACCENTS_METHODE.slice(0, 2) : ACCENTS_METHODE;
  const vagues = VAGUES_REPS[objectif] || VAGUES_REPS.hypertrophie;
  // Trois tirages INDÉPENDANTS. Une simple multiplication (seed*3 % 6) créait
  // des collisions : le résultat ne prenait que 2 valeurs sur 6 possibles, et
  // 40 athlètes ne produisaient que 4 combinaisons au lieu de plusieurs dizaines.
  // On rehache la graine avec un sel différent pour chaque axe.
  const tirage = (sel, taille) => melange(seed, sel) % taille;
  return {
    split_impose:   pool[tirage(1, pool.length)],
    accent_methode: accents[tirage(2, accents.length)],
    vague_de_reps:  vagues[tirage(3, vagues.length)],
    regle_overlap:  "MAXIMUM 40% des exercices peuvent provenir du cycle précédent. Les exercices repris doivent être EXCLUSIVEMENT ceux listés dans 'exercices_a_conserver' (ils progressent). Tout le reste doit être renouvelé : autre variante du même pattern, autre angle, autre matériel.",
  };
}

/** Schéma du bloc réflexion exigé en tête de sortie. */
export const SCHEMA_REFLEXION = `{
    "lecture_historique": "2-3 phrases: ce que révèlent les données réelles du dossier (progression, coupure, assiduité)",
    "lecture_morpho": "2-3 phrases: ce que dit la fiche morphologique et comment l'historique la pondère",
    "diagnostic": "verdict global: où en est cet athlète, quel est son vrai besoin maintenant",
    "exercices_conserves": [{"nom": "exercice", "raison": "progresse / sensation parfaite"}],
    "exercices_ecartes": [{"nom": "exercice", "raison": "stagnation|douleur|non ressenti|rotation|morpho", "remplace_par": "alternative choisie"}],
    "risque_blessure": "zone(s) à protéger et comment",
    "risque_abandon": "ce qui pourrait faire décrocher cet athlète et la parade intégrée au programme",
    "facteur_limitant_prevu": "le prochain mur probable et comment le programme l'anticipe",
    "strategie": "3 phrases max: le compromis sécurité/progression/motivation choisi pour CE cycle",
    "priorites": {"prioriser": ["muscle"], "entretenir": ["muscle"]},
    "objectifs": {
      "court_terme": {"horizon": "4-6 semaines", "cible": "objectif mesurable de CE cycle", "comment": "le levier concret utilisé"},
      "moyen_terme": {"horizon": "3-6 mois", "cible": "où doit être cet athlète", "comment": "l'enchaînement de cycles prévu"},
      "long_terme": {"horizon": "12 mois et +", "cible": "la transformation visée", "comment": "ce qui doit rester constant pour y arriver"}
    }
  }`;
