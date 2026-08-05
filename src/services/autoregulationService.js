// ─── AUTORÉGULATION ─────────────────────────────────────────────────────────
// Un déload calendaire arrive toujours au mauvais moment : trop tard pour
// l'athlète cuit en semaine 3, inutile pour celui qui s'entraîne une fois par
// semaine. On le déclenche donc sur des SIGNAUX RÉELS.
//
// La nuance qui compte, et que la plupart des systèmes ratent :
// TOUS LES SIGNAUX NÉGATIFS NE SE TRAITENT PAS PAR UN DÉLOAD.
//
//   fatigue accumulée      → déload : il y a quelque chose à absorber
//   manque d'assiduité     → PAS de déload. Quelqu'un qui fait une séance sur
//                            cinq n'accumule aucune fatigue. Alléger son
//                            programme serait absurde : il faut le rendre
//                            FAISABLE, pas plus léger.
//   douleurs multiples     → revue technique et correctifs, pas un déload.
//                            Le repos ne corrige pas un mouvement mal exécuté.
//   sommeil court + charge → plafonner l'INTENSITÉ (risque de blessure), sans
//                            forcément couper le volume.
//
// Un signal isolé ne déclenche rien. Il faut une convergence.

import {
  getWeeklyVolume, getPerformanceTrend, getSleepData,
  getRestingHR, getMotivation,
} from "./recoveryService.js";
import { alertesDouleurEnCours } from "./substitutionService.js";

const LOG_KEY = "morpho_workout_log";

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

/**
 * Assiduité réelle sur 28 jours : séances faites / séances prévues.
 * @param {number} joursParSemaine
 */
export function getAssiduite(joursParSemaine = 3) {
  const log = readJSON(LOG_KEY, {});
  const limite = new Date();
  limite.setDate(limite.getDate() - 28);
  const faites = Object.entries(log).filter(([d, j]) =>
    new Date(d) >= limite && (j?.sets || []).length > 0).length;
  const prevues = Math.max(1, Math.round(joursParSemaine * 4));
  const ratio = faites / prevues;
  return {
    faites, prevues, ratio: Math.round(ratio * 100) / 100,
    pct: Math.round(ratio * 100),
    suffisante: faites >= 4,          // en dessous, on ne peut rien conclure
  };
}

/**
 * @typedef {Object} Verdict
 * @property {"aucune"|"deload"|"plafonner"|"revue_technique"|"simplifier"} action
 * @property {"info"|"attention"|"critique"} severite
 * @property {string} titre
 * @property {string} message
 * @property {string[]} signaux     ce qui a déclenché la décision
 * @property {number} score         intensité du signal de fatigue (0-10)
 * @property {{series?: number, charge?: number}|null} ajustement
 */

/**
 * Décide s'il faut dévier de la périodisation planifiée, et comment.
 *
 * @param {{age?: number|string, joursParSemaine?: number, semaine?: number,
 *          semaineDeload?: number}} ctx
 * @returns {Verdict}
 */
export function evaluerAutoregulation(ctx = {}) {
  const age = parseInt(String(ctx.age)) || null;
  const jours = Number(ctx.joursParSemaine) || 3;
  const semaine = Number(ctx.semaine) || 1;
  const semaineDeload = Number(ctx.semaineDeload) || 6;

  const assiduite = getAssiduite(jours);
  const vol   = getWeeklyVolume();
  const perf  = getPerformanceTrend();
  const sleep = getSleepData(age, 7);
  const hr    = getRestingHR();
  const moti  = getMotivation(7);
  const douleurs = alertesDouleurEnCours();

  const signaux = [];
  let score = 0;

  // ── 1. ASSIDUITÉ — se traite AVANT tout le reste ──
  // Sans volume réel, il n'y a pas de fatigue à absorber. Continuer l'analyse
  // reviendrait à prescrire du repos à quelqu'un qui ne s'entraîne pas.
  if (assiduite.suffisante && assiduite.ratio < 0.5) {
    return {
      action: "simplifier", severite: "attention",
      titre: "Le programme n'est pas suivi",
      message: `${assiduite.faites} séances faites sur ${assiduite.prevues} prévues en 4 semaines. `
        + "Ce n'est pas un problème de fatigue — il n'y a rien à récupérer. C'est le programme "
        + "qui ne rentre pas dans ta vie. Mieux vaut 2 séances tenues que 5 planifiées : "
        + "réduis la fréquence et rends chaque séance autosuffisante.",
      signaux: [`Assiduité ${assiduite.pct} % sur 28 jours`],
      score: 0,
      ajustement: null,
    };
  }
  if (!assiduite.suffisante) {
    return {
      action: "aucune", severite: "info",
      titre: "", message: "",
      signaux: ["Pas encore assez de séances pour évaluer"],
      score: 0, ajustement: null,
    };
  }

  // ── 2. DOULEURS MULTIPLES — ni fatigue, ni repos : technique ──
  if (douleurs.length >= 3) {
    return {
      action: "revue_technique", severite: "critique",
      titre: "Des douleurs apparaissent sur plusieurs exercices",
      message: `${douleurs.length} exercices te gênent davantage qu'avant : `
        + douleurs.slice(0, 3).map(d => d.exNom).join(", ") + ". "
        + "Un déload ne corrigera pas ça : le repos ne répare pas un mouvement mal exécuté "
        + "ni un déséquilibre postural. Allège les charges, filme-toi sur ces mouvements, "
        + "et intègre les correctifs de ta séance de mobilité avant de remonter.",
      signaux: douleurs.slice(0, 3).map(d => `${d.exNom} : ${d.precedent}/3 → ${d.actuel}/3`),
      score: 4,
      ajustement: { charge: 0.85 },
    };
  }

  // ── 3. SIGNAUX DE FATIGUE ACCUMULÉE ──
  if (hr.available && !hr.partial && hr.delta >= 7) {
    signaux.push(`FC de repos +${hr.delta} bpm au-dessus de ta référence`); score += 3;
  } else if (hr.available && !hr.partial && hr.delta >= 4) {
    signaux.push(`FC de repos +${hr.delta} bpm`); score += 2;
  }
  if (perf.available && perf.trend === "baisse") {
    signaux.push(`Performances en baisse (${perf.avgDelta} %)`); score += 3;
  }
  if (vol.available && vol.groupsOver > 0) {
    signaux.push(`Volume au-dessus du maximum récupérable : ${vol.byMuscle
      .filter(g => g.statut === "au-dessus").map(g => g.groupe).join(", ")}`);
    score += 2;
  }
  if (sleep.available && sleep.deficitStreak >= 3) {
    signaux.push(`Sommeil sous la cible depuis ${sleep.deficitStreak} nuits`); score += 3;
  }
  if (moti.available && moti.avg <= 2) {
    signaux.push(`Motivation basse (${moti.avg}/5)`); score += 2;
  }
  if (douleurs.length > 0) {
    signaux.push(`Gêne croissante sur ${douleurs.length} exercice${douleurs.length > 1 ? "s" : ""}`);
    score += 1;
  }

  // ── 4. RISQUE DE BLESSURE : sommeil court ET charge élevée ──
  // Cette combinaison précise multiplie le risque : le tissu ne récupère pas
  // alors qu'on continue de le charger. On plafonne l'intensité, pas le volume.
  const sommeilCourt = sleep.available && sleep.deficitStreak >= 2;
  const chargeElevee = vol.available && (vol.groupsOver > 0 || vol.globalStatus === "au-dessus");
  if (sommeilCourt && chargeElevee && score < 6) {
    return {
      action: "plafonner", severite: "attention",
      titre: "Risque de blessure élevé cette semaine",
      message: "Sommeil insuffisant ET volume au-dessus de ce que tu récupères : c'est la "
        + "combinaison qui blesse. Garde le volume si tu veux, mais plafonne l'intensité — "
        + "RIR 3 minimum, aucune série à l'échec, séries d'approche non négociables.",
      signaux, score,
      ajustement: { charge: 0.9 },
    };
  }

  // ── 5. DÉLOAD ANTICIPÉ ──
  // Deux signaux forts convergents suffisent. Un seul ne déclenche rien : un
  // mauvais sommeil isolé n'est pas une fatigue de mésocycle.
  const dejaEnDeload = semaine >= semaineDeload;
  if (score >= 6 && !dejaEnDeload) {
    const avance = semaineDeload - semaine;
    return {
      action: "deload", severite: "critique",
      titre: avance > 1 ? `Déload à avancer de ${avance} semaines` : "Déload à avancer d'une semaine",
      message: "Plusieurs signaux convergent vers une fatigue accumulée réelle. "
        + `Ton déload est prévu en semaine ${semaineDeload}, mais attendre coûterait plus que ça ne rapporte : `
        + "le volume ne produit plus d'adaptation quand la récupération est dépassée. "
        + "Passe une semaine allégée maintenant, tu reprendras plus fort.",
      signaux, score,
      ajustement: { series: 0.6, charge: 0.9 },
    };
  }

  // ── 6. SURVEILLANCE ──
  if (score >= 3) {
    return {
      action: "plafonner", severite: "attention",
      titre: "Fatigue qui monte",
      message: "Ce n'est pas encore un déload, mais les signaux s'accumulent. "
        + "Reste à RIR 2 minimum cette semaine, évite l'échec, et surveille ton sommeil. "
        + "Si ça persiste la semaine prochaine, on avancera le déload.",
      signaux, score,
      ajustement: { charge: 0.95 },
    };
  }

  return {
    action: "aucune", severite: "info",
    titre: signaux.length ? "Rien d'inquiétant" : "",
    message: signaux.length
      ? "Un signal isolé ne justifie pas de dévier du plan. Continue comme prévu."
      : "",
    signaux, score, ajustement: null,
  };
}

/**
 * Combine la phase planifiée et l'autorégulation.
 * L'autorégulation ne remplace jamais la phase : elle la corrige.
 *
 * @param {{series: number, charge: number|null}} phase
 * @param {Verdict} verdict
 */
export function appliquerAutoregulation(phase, verdict) {
  if (!verdict?.ajustement) return { ...phase, autoregule: false };
  const a = verdict.ajustement;
  return {
    ...phase,
    series: a.series ? Math.max(1, Math.round(phase.series * a.series)) : phase.series,
    charge: a.charge && phase.charge != null
      ? Math.round(phase.charge * a.charge * 2) / 2 : phase.charge,
    autoregule: true,
    raisonAutoregulation: verdict.titre,
  };
}
