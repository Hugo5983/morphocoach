// ─── PÉRIODISATION APPLIQUÉE ────────────────────────────────────────────────
// Le mésocycle affichait des étiquettes — « Base », « Vol+ », « Déload », « Pic »
// — mais les séances restaient IDENTIQUES de la semaine 1 à la semaine 6.
// La semaine de déload ne réduisait rien du tout : c'était le seul endroit où
// le programme mentait à l'athlète.
//
// Ce module traduit la phase en modulateurs RÉELS appliqués à l'affichage :
// nombre de séries, charge, et intensité cible. Le programme généré par l'IA
// n'est pas modifié — on module ce qui est présenté, semaine par semaine.
//
// Aucune IA : la périodisation est une règle, pas une opinion.

/**
 * @typedef {Object} Phase
 * @property {string} cle
 * @property {string} label
 * @property {string} intention   ce que la semaine cherche à produire
 * @property {number} series      multiplicateur du nombre de séries
 * @property {number} charge      multiplicateur de la charge
 * @property {string} rir         RIR cible de la semaine
 * @property {string} consigne    ce que l'athlète doit retenir
 */

/** Mésocycle 6 semaines : accumulation → intensification → déload → pic. */
export const PHASES = [
  {
    cle: "base", label: "Base",
    intention: "Reprendre les repères techniques et poser les charges de départ.",
    series: 1.0, charge: 1.0, rir: "3",
    consigne: "Semaine de calage. Reste à 3 répétitions de la limite : on installe la technique, pas des records.",
  },
  {
    cle: "accumulation1", label: "Accumulation",
    intention: "Ajouter du volume à technique constante.",
    series: 1.0, charge: 1.03, rir: "2-3",
    consigne: "Le volume monte. Si la technique se dégrade, garde la charge de la semaine dernière.",
  },
  {
    cle: "accumulation2", label: "Accumulation +",
    intention: "Volume maximal du cycle, c'est la semaine la plus exigeante.",
    series: 1.15, charge: 1.05, rir: "2",
    consigne: "Semaine la plus lourde en volume. Soigne le sommeil et l'alimentation, c'est maintenant que ça compte.",
  },
  {
    cle: "intensification", label: "Intensification",
    intention: "Moins de volume, plus de charge : on transforme le travail accumulé.",
    series: 0.9, charge: 1.08, rir: "1-2",
    consigne: "On allège le volume et on monte les charges. Séries d'approche obligatoires.",
  },
  {
    cle: "deload", label: "Déload",
    intention: "Absorber la fatigue accumulée pour que l'adaptation se produise.",
    series: 0.6, charge: 0.9, rir: "4-5",
    consigne: "Semaine de récupération VOLONTAIRE. Le muscle se construit pendant cette semaine, pas pendant les autres. Ne la saute pas.",
  },
  {
    cle: "pic", label: "Pic",
    intention: "Exprimer les gains du cycle sur les mouvements principaux.",
    series: 0.85, charge: 1.12, rir: "1",
    consigne: "Semaine de test. Charges les plus lourdes du cycle sur les mouvements principaux, volume réduit ailleurs.",
  },
];

export const TOTAL_SEMAINES = PHASES.length;

/**
 * Phase correspondant à une semaine du cycle (1-indexée).
 * @param {number} semaine
 * @returns {Phase}
 */
export function getPhase(semaine) {
  const i = Math.max(1, Math.min(TOTAL_SEMAINES, Math.round(Number(semaine) || 1))) - 1;
  return PHASES[i];
}

/** Arrondit une charge à un palier réalisable en salle. */
function arrondir(kg, groupe) {
  const pas = ["Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets", "Lombaires"].includes(groupe)
    ? 5 : (["Épaules", "Biceps", "Triceps", "Avant-bras"].includes(groupe) ? 1 : 2.5);
  return Math.round(kg / pas) * pas;
}

/**
 * Applique la phase à un exercice pour la semaine en cours.
 * Renvoie ce qu'il faut AFFICHER, sans modifier le programme stocké.
 *
 * @param {{series?: string|number, reps?: string, charge?: string, rir?: string, nom?: string}} ex
 * @param {number} semaine
 * @param {{groupe?: string, chargeReelle?: number|null}} [ctx]
 * @returns {{series: number, seriesBase: number, charge: number|null,
 *            chargeBase: number|null, rir: string, phase: Phase, modifie: boolean}}
 */
export function appliquerPhase(ex, semaine, ctx = {}) {
  const phase = getPhase(semaine);
  const seriesBase = Math.max(1, parseInt(String(ex?.series)) || 4);
  const series = Math.max(1, Math.round(seriesBase * phase.series));

  // La charge de référence est la charge RÉELLE si on la connaît (issue des
  // séries validées), sinon celle prescrite en kilos. Un pourcentage n'est
  // jamais converti : on ne module que ce qui est chiffré.
  let chargeBase = Number(ctx.chargeReelle) || null;
  if (!chargeBase) {
    const brut = String(ex?.charge || "");
    if (!/%/.test(brut)) {
      const n = parseFloat(brut.replace(",", "."));
      if (isFinite(n) && n > 0) chargeBase = n;
    }
  }
  const charge = chargeBase
    ? Math.max(1, arrondir(chargeBase * phase.charge, ctx.groupe || "Autre"))
    : null;

  return {
    series, seriesBase, charge, chargeBase,
    rir: phase.rir, phase,
    modifie: series !== seriesBase || (charge !== null && charge !== chargeBase),
  };
}

/**
 * Résumé de la semaine, pour un bandeau en tête de programme.
 * @param {number} semaine
 */
export function resumeSemaine(semaine) {
  const p = getPhase(semaine);
  const pctSeries = Math.round((p.series - 1) * 100);
  const pctCharge = Math.round((p.charge - 1) * 100);
  const bouts = [];
  if (pctSeries !== 0) bouts.push(`${pctSeries > 0 ? "+" : ""}${pctSeries} % de séries`);
  if (pctCharge !== 0) bouts.push(`${pctCharge > 0 ? "+" : ""}${pctCharge} % de charge`);
  return {
    ...p,
    semaine: Math.max(1, Math.min(TOTAL_SEMAINES, Math.round(Number(semaine) || 1))),
    total: TOTAL_SEMAINES,
    ajustement: bouts.length ? bouts.join(" · ") : "volume et charges de référence",
  };
}
