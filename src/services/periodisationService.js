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

import { getMesocycleLogic } from "../data/mesocycle.js";

// ─── Courbes par objectif ────────────────────────────────────────────────────
// Un cycle de force et un cycle d'hypertrophie ne se périodisent PAS de la
// même façon. En force, le volume chute vite et l'intensité grimpe fort : on
// cherche l'expression nerveuse. En hypertrophie, le volume s'accumule
// longtemps et la charge monte peu : c'est le volume qui fait le muscle.
//
// Ces multiplicateurs s'appliquent PAR-DESSUS la courbe de base, ce qui évite
// de dupliquer six phases par objectif.
//
// ampSeries : amplitude de la variation de volume (1 = courbe de base)
// ampCharge : amplitude de la variation de charge
// rirBase   : décalage du RIR cible (négatif = plus proche de l'échec)
const COURBES = {
  force: {
    ampSeries: 1.3,   ampCharge: 1.6,  rirDecal: -1,
    note: "Le volume chute vite, l'intensité grimpe : on cherche l'expression nerveuse.",
  },
  hypertrophie: {
    ampSeries: 1.0,   ampCharge: 1.0,  rirDecal: 0,
    note: "Le volume s'accumule longtemps, la charge monte progressivement.",
  },
  prep_physique: {
    ampSeries: 1.1,   ampCharge: 1.3,  rirDecal: -1,
    note: "Volume modéré, intensité travaillée : la qualité d'exécution prime.",
  },
  perte_poids: {
    ampSeries: 0.7,   ampCharge: 0.5,  rirDecal: +1,
    note: "Charge maintenue pour protéger le muscle, variation limitée en déficit.",
  },
  sante: {
    ampSeries: 0.5,   ampCharge: 0.4,  rirDecal: +2,
    note: "Progression douce et régulière, sans pic d'intensité.",
  },
  reathletisation: {
    ampSeries: 0.6,   ampCharge: 0.35, rirDecal: +2,
    note: "La charge suit la tolérance des tissus, jamais l'inverse.",
  },
};

/** Normalise l'objectif du formulaire vers une courbe. */
function clefObjectif(objectif) {
  const k = String(objectif || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (k.includes("force")) return "force";
  if (k.includes("poids") || k.includes("seche") || k.includes("perte")) return "perte_poids";
  if (k.includes("prep") || k.includes("physique") || k.includes("puissance")) return "prep_physique";
  if (k.includes("sante")) return "sante";
  if (k.includes("reathle")) return "reathletisation";
  return "hypertrophie";
}

/** Applique l'amplitude d'un objectif à un multiplicateur de la courbe de base. */
function moduler(base, amplitude) {
  return Math.round((1 + (base - 1) * amplitude) * 1000) / 1000;
}

/** Décale un RIR cible ("2-3" → "3-4") sans sortir de 0-5. */
function decalerRir(rir, d) {
  if (!d) return rir;
  const borne = (n) => Math.max(0, Math.min(5, n + d));
  const nums = String(rir).match(/\d+/g);
  if (!nums) return rir;
  return nums.length > 1
    ? `${borne(+nums[0])}-${borne(+nums[1])}`
    : String(borne(+nums[0]));
}

// ─── Phases dérivées de la base de connaissances ────────────────────────────
// Les phases ne sont plus inventées ici : elles viennent de getMesocycleLogic,
// la MÊME fonction qui alimente le prompt de l'IA. Auparavant le service
// affichait un déload en semaine 5 et un « pic » en semaine 6, alors que la
// base plaçait le déload en semaine 6 et ne parlait jamais de pic. L'athlète
// suivait une périodisation différente de celle conçue pour lui.

/** Consignes par type de phase — le texte que l'athlète doit retenir. */
const INTENTIONS = {
  accumulation:    { series: 1.0,  charge: 1.0,  intention: "Poser les repères techniques et les charges de départ." },
  intensification: { series: 1.05, charge: 1.06, intention: "Monter en charge à technique constante." },
  surcharge:       { series: 1.15, charge: 1.08, intention: "Volume maximal du cycle : la semaine la plus exigeante." },
  pic:             { series: 0.85, charge: 1.14, intention: "Exprimer les gains du cycle sur les mouvements principaux." },
  deload:          { series: 0.6,  charge: 0.9,  intention: "Absorber la fatigue pour que l'adaptation se produise." },
  technique:       { series: 0.95, charge: 0.95, intention: "Qualité d'exécution avant tout : la charge attendra." },
  adaptation:      { series: 0.9,  charge: 0.92, intention: "Habituer le corps à l'effort, sans chercher la performance." },
  progression:     { series: 1.0,  charge: 1.04, intention: "Progression régulière, sans à-coup." },
  consolidation:   { series: 0.95, charge: 1.0,  intention: "Consolider les acquis, maintenir la régularité." },
};

const CONSIGNES = {
  deload: "Semaine de récupération VOLONTAIRE. Le muscle se construit maintenant, pas pendant les autres. Ne la saute pas.",
  surcharge: "Semaine la plus lourde du cycle. Soigne le sommeil et l'alimentation, c'est maintenant que ça compte.",
  pic: "Charges les plus lourdes du cycle sur les mouvements principaux, volume réduit ailleurs.",
};

/** Reconnaît le type d'une phase depuis son libellé dans la base. */
function typePhase(label) {
  const l = String(label || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (l.includes("deload")) return "deload";
  if (l.includes("surcharge")) return "surcharge";
  if (l.includes("pic")) return "pic";
  if (l.includes("intensi") || l.includes("force-v")) return "intensification";
  if (l.includes("techni")) return "technique";
  if (l.includes("adapta")) return "adaptation";
  if (l.includes("progres")) return "progression";
  if (l.includes("consolid")) return "consolidation";
  return "accumulation";
}

/** Développe "1-2" ou "5" en liste de semaines. */
function semainesDe(sem) {
  const s = String(sem || "");
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if (m) {
    const out = [];
    for (let i = +m[1]; i <= +m[2]; i++) out.push(i);
    return out;
  }
  const n = parseInt(s);
  return isFinite(n) ? [n] : [];
}

/**
 * Phases du mésocycle pour ce profil, dérivées de la base.
 * @param {string} niveau
 * @param {string} objectif
 * @param {number} [cycleNum]
 */
export function getPhases(niveau = "intermediaire", objectif = "hypertrophie", cycleNum = 1) {
  const logique = getMesocycleLogic(niveau, objectif, cycleNum);
  const parSemaine = [];
  for (const p of logique.phases || []) {
    const type = typePhase(p.phase);
    const cfg = INTENTIONS[type] || INTENTIONS.accumulation;
    for (const s of semainesDe(p.sem)) {
      parSemaine[s - 1] = {
        cle: type, label: p.phase, semaine: s,
        intention: cfg.intention,
        series: cfg.series, charge: cfg.charge,
        rir: rpeVersRir(p.rpe),
        consigne: CONSIGNES[type] || p.consigne || cfg.intention,
      };
    }
  }
  // Toute semaine non couverte reprend la dernière définie.
  for (let i = 0; i < (logique.duree || 6); i++) {
    if (!parSemaine[i]) parSemaine[i] = parSemaine[i - 1] || parSemaine.find(Boolean);
  }
  return parSemaine.slice(0, logique.duree || 6);
}

/** La base raisonne en RPE, l'application affiche du RIR : RIR = 10 − RPE. */
function rpeVersRir(rpe) {
  const nums = String(rpe || "").match(/\d+/g);
  if (!nums) return "2-3";
  const conv = (n) => Math.max(0, Math.min(5, 10 - +n));
  return nums.length > 1 ? `${conv(nums[1])}-${conv(nums[0])}` : String(conv(nums[0]));
}

export function periodisationActive(prog) {
  if (typeof prog?.periodisation === "boolean") return prog.periodisation;
  return prog?.type === "ia";
}

/**
 * Phase correspondant à une semaine du cycle (1-indexée).
 * @param {number} semaine
 * @returns {Phase}
 */
export function getPhase(semaine, objectif, niveau = "intermediaire") {
  const phases = getPhases(niveau, objectif);
  const total = phases.length;
  const idx = Math.max(1, Math.min(total, Math.round(Number(semaine) || 1))) - 1;
  const base = phases[idx];
  const c = COURBES[clefObjectif(objectif)];
  return {
    ...base,
    total,
    series: moduler(base.series, c.ampSeries),
    charge: moduler(base.charge, c.ampCharge),
    rir: decalerRir(base.rir, c.rirDecal),
    objectifNote: c.note,
  };
}

/** Nombre de semaines du mésocycle pour ce profil (4 pour un débutant). */
export function totalSemaines(niveau = "intermediaire", objectif = "hypertrophie") {
  return getPhases(niveau, objectif).length;
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
  const phase = getPhase(semaine, ctx.objectif, ctx.niveau);

  // Périodisation désactivée : on renvoie le programme TEL QUEL. Aucune
  // modification silencieuse de ce que l'utilisateur a écrit.
  if (ctx.prog && !periodisationActive(ctx.prog)) {
    const seriesBrutes = Math.max(1, parseInt(String(ex?.series)) || 4);
    let chargeBrute = null;
    const s = String(ex?.charge || "");
    if (!/%/.test(s)) {
      const n = parseFloat(s.replace(",", "."));
      if (isFinite(n) && n > 0) chargeBrute = n;
    }
    return {
      series: seriesBrutes, seriesBase: seriesBrutes,
      charge: chargeBrute, chargeBase: chargeBrute,
      rir: ex?.rir || phase.rir, phase, modifie: false, inactive: true,
    };
  }
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
export function resumeSemaine(semaine, objectif, niveau) {
  const p = getPhase(semaine, objectif, niveau);
  const pctSeries = Math.round((p.series - 1) * 100);
  const pctCharge = Math.round((p.charge - 1) * 100);
  const bouts = [];
  if (pctSeries !== 0) bouts.push(`${pctSeries > 0 ? "+" : ""}${pctSeries} % de séries`);
  if (pctCharge !== 0) bouts.push(`${pctCharge > 0 ? "+" : ""}${pctCharge} % de charge`);
  return {
    ...p,
    semaine: Math.max(1, Math.min(p.total, Math.round(Number(semaine) || 1))),
    total: p.total,
    ajustement: bouts.length ? bouts.join(" · ") : "volume et charges de référence",
  };
}
