// ─── recoveryService.js ──────────────────────────────────────────────────────
// Toutes les métriques de récupération de MorphoCoach.
//
// RÈGLE ABSOLUE : aucune donnée n'est inventée. Chaque fonction renvoie un objet
// avec un drapeau `available`. Si la donnée n'existe pas, `available: false` et
// l'interface affiche « Donnée indisponible » — jamais un chiffre par défaut.
//
// Sources de vérité (localStorage) :
//   morpho_workout_log   { "YYYY-MM-DD": { sets:[{exNom,kg,reps}], totalVolume } }
//                        → écrit par FocusMode uniquement sur validate() d'une
//                          série RÉELLEMENT effectuée. Jamais le prévisionnel.
//   morpho_sleep_log     { "YYYY-MM-DD": heures }
//   morpho_mobilite_log  { "YYYY-MM-DD": true }
//   morpho_hr_log        { "YYYY-MM-DD": bpm au réveil }
//   morpho_motivation_log{ "YYYY-MM-DD": 1..5 }

import { EX } from "../data/exercises.js";
import { groupeMusculaire } from "./muscleGroups.js";

// ─── Utilitaires ─────────────────────────────────────────────────────────────
export function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
export function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
export const dayKey = (d = new Date()) => d.toISOString().split("T")[0];
export function daysBack(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return dayKey(d);
  });
}
/** Lundi de la semaine en cours (semaine ISO). */
export function weekDates() {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;          // 0 = lundi
  return Array.from({ length: dow + 1 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return dayKey(d);
  });
}
export const epley = (kg, reps) =>
  reps <= 1 ? kg : Math.round(kg * (1 + reps / 30) * 10) / 10;

// ─── Table exercice → groupe musculaire ──────────────────────────────────────
let _exMap = null;
export function exerciseMuscleMap() {
  if (_exMap) return _exMap;
  _exMap = {};
  Object.entries(EX || {}).forEach(([groupe, list]) =>
    (list || []).forEach(ex => { if (ex?.n) _exMap[ex.n] = groupe; })
  );
  return _exMap;
}

/**
 * Groupe d'un exercice, y compris hors catalogue client. Le volume par muscle
 * était faux sur 654 exercices : tous comptés dans "Autre", donc jamais
 * comparés à leurs seuils MEV/MAV/MRV.
 */
function groupeDeLExercice(nom) {
  return groupeMusculaire(nom);
}

// ─── Seuils de volume hebdomadaire par groupe (séries dures / semaine) ───────
// D'après les repères de périodisation de Renaissance Periodization (Israetel).
// MEV = minimum pour progresser · MAV = zone optimale · MRV = maximum récupérable
export const VOLUME_LANDMARKS = {
  "Pectoraux":       { MEV: 8,  MAV: 16, MRV: 22 },
  "Dos":             { MEV: 10, MAV: 18, MRV: 25 },
  "Épaules":         { MEV: 8,  MAV: 18, MRV: 26 },
  "Biceps":          { MEV: 8,  MAV: 16, MRV: 26 },
  "Triceps":         { MEV: 6,  MAV: 12, MRV: 18 },
  "Quadriceps":      { MEV: 8,  MAV: 15, MRV: 20 },
  "Ischio-jambiers": { MEV: 4,  MAV: 12, MRV: 20 },
  "Fessiers":        { MEV: 4,  MAV: 10, MRV: 16 },
  "Abdominaux":      { MEV: 6,  MAV: 16, MRV: 25 },
  "Lombaires":       { MEV: 2,  MAV: 8,  MRV: 14 },
  "Mollets":         { MEV: 6,  MAV: 13, MRV: 20 },
  "Avant-bras":      { MEV: 2,  MAV: 9,  MRV: 16 },
  "Trapèzes":        { MEV: 4,  MAV: 14, MRV: 26 },
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. VOLUME RÉEL — séries effectivement validées, par groupe musculaire
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Compte les séries RÉELLEMENT effectuées cette semaine (lundi → aujourd'hui).
 * Ne compte jamais le prévisionnel : uniquement morpho_workout_log, alimenté
 * quand l'utilisateur valide une série dans le mode séance.
 */
export function getWeeklyVolume() {
  const log = readJSON("morpho_workout_log", {});
  const map = exerciseMuscleMap();
  const dates = weekDates();

  const byMuscle = {};
  let totalSets = 0, totalTonnage = 0, sessions = 0;

  dates.forEach(d => {
    const day = log[d];
    if (!day?.sets?.length) return;
    sessions += 1;
    day.sets.forEach(s => {
      const groupe = groupeDeLExercice(s.exNom);
      if (!byMuscle[groupe]) byMuscle[groupe] = { sets: 0, tonnage: 0 };
      byMuscle[groupe].sets += 1;
      byMuscle[groupe].tonnage += (Number(s.kg) || 0) * (Number(s.reps) || 0);
      totalSets += 1;
      totalTonnage += (Number(s.kg) || 0) * (Number(s.reps) || 0);
    });
  });

  if (totalSets === 0) {
    return { available: false, reason: "Aucune séance validée cette semaine",
      totalSets: 0, sessions: 0, byMuscle: [] };
  }

  // Statut par groupe vs ses propres seuils
  const groups = Object.entries(byMuscle).map(([groupe, v]) => {
    const lm = VOLUME_LANDMARKS[groupe] || null;
    let statut = "inconnu";
    if (lm) {
      if (v.sets > lm.MRV)      statut = "au-dessus";   // dépasse le récupérable
      else if (v.sets >= lm.MEV) statut = "optimal";    // dans MEV → MRV
      else                       statut = "sous-seuil"; // sous MEV
    }
    return { groupe, sets: v.sets, tonnage: Math.round(v.tonnage), landmarks: lm, statut };
  }).sort((a, b) => b.sets - a.sets);

  const over  = groups.filter(g => g.statut === "au-dessus").length;
  const under = groups.filter(g => g.statut === "sous-seuil").length;

  return {
    available: true, totalSets, sessions, totalTonnage: Math.round(totalTonnage),
    byMuscle: groups, groupsOver: over, groupsUnder: under,
    globalStatus: over > 0 ? "au-dessus" : under > groups.length / 2 ? "sous-seuil" : "optimal",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. PERFORMANCE — progression réelle du 1RM estimé
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Compare les 2 dernières séances de chaque exercice (meilleure série de chaque
 * séance, en 1RM estimé Epley). Exige au moins 2 séances distinctes.
 */
export function getPerformanceTrend() {
  const log = readJSON("morpho_workout_log", {});
  const byEx = {};

  Object.entries(log)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, day]) => {
      (day?.sets || []).forEach(s => {
        const rm = epley(Number(s.kg) || 0, Number(s.reps) || 0);
        if (!rm) return;
        if (!byEx[s.exNom]) byEx[s.exNom] = {};
        // meilleure série de la séance
        if (!byEx[s.exNom][date] || rm > byEx[s.exNom][date].rm) {
          byEx[s.exNom][date] = { rm, kg: Number(s.kg), reps: Number(s.reps), date };
        }
      });
    });

  const exercises = Object.entries(byEx)
    .map(([exNom, sessionsMap]) => {
      const sessions = Object.values(sessionsMap).sort((a, b) => a.date.localeCompare(b.date));
      if (sessions.length < 2) return { exNom, sessions, available: false };
      const prev = sessions[sessions.length - 2];
      const last = sessions[sessions.length - 1];
      const deltaPct = prev.rm > 0
        ? Math.round(((last.rm - prev.rm) / prev.rm) * 1000) / 10
        : 0;
      return {
        exNom, sessions, available: true, prev, last, deltaPct,
        deltaKg: Math.round((last.rm - prev.rm) * 10) / 10,
        nbSessions: sessions.length,
      };
    })
    .sort((a, b) => (b.sessions?.length || 0) - (a.sessions?.length || 0));

  const comparable = exercises.filter(e => e.available);
  if (comparable.length === 0) {
    const partial = exercises.length > 0;
    return {
      available: false,
      reason: partial
        ? "Il faut 2 séances sur un même exercice pour mesurer une progression"
        : "Aucune séance validée",
      exercises, needSecondSession: partial,
    };
  }

  const avgDelta = Math.round(
    (comparable.reduce((s, e) => s + e.deltaPct, 0) / comparable.length) * 10
  ) / 10;

  return {
    available: true, exercises, comparable, avgDelta,
    best: comparable.reduce((m, e) => (e.deltaPct > m.deltaPct ? e : m), comparable[0]),
    worst: comparable.reduce((m, e) => (e.deltaPct < m.deltaPct ? e : m), comparable[0]),
    trend: avgDelta > 1 ? "hausse" : avgDelta < -3 ? "baisse" : "stable",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. SOMMEIL — cible calculée depuis l'âge (recommandations NSF)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * National Sleep Foundation (Hirshkowitz et al., 2015).
 * Renvoie la borne basse recommandée, utilisée comme cible.
 */
export function getSleepTarget(age) {
  const a = Number(age);
  if (!a || a <= 0) return { available: false, reason: "Âge non renseigné" };
  let min, max, tranche;
  if (a < 14)      { min = 9,   max = 11, tranche = "6-13 ans"; }
  else if (a < 18) { min = 8,   max = 10, tranche = "14-17 ans"; }
  else if (a < 26) { min = 7,   max = 9,  tranche = "18-25 ans"; }
  else if (a < 65) { min = 7,   max = 9,  tranche = "26-64 ans"; }
  else             { min = 7,   max = 8,  tranche = "65 ans et +"; }
  return { available: true, target: min, min, max, tranche, source: "National Sleep Foundation" };
}

export function getSleepData(age, days = 7) {
  const log = readJSON("morpho_sleep_log", {});
  const tgt = getSleepTarget(age);
  const range = daysBack(days);
  const vals = range.map(d => Number(log[d]) || 0).filter(v => v > 0);

  if (vals.length === 0) {
    return { available: false, reason: "Aucune nuit renseignée",
      target: tgt.available ? tgt.target : null, targetInfo: tgt, days: 0 };
  }
  const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  const target = tgt.available ? tgt.target : null;
  const pct = target ? Math.min(100, Math.round((avg / target) * 100)) : null;
  // Nuits consécutives sous la cible (signal précoce de dette de sommeil)
  let deficitStreak = 0;
  if (target) {
    for (const d of range) {
      const v = Number(log[d]) || 0;
      if (v > 0 && v < target - 0.5) deficitStreak += 1;
      else if (v > 0) break;
    }
  }
  return { available: true, avg, target, targetInfo: tgt, pct,
    days: vals.length, deficitStreak, coverage: Math.round((vals.length / days) * 100) };
}

export function getSleepSeries(days = 14) {
  const log = readJSON("morpho_sleep_log", {});
  return daysBack(days).reverse().map(d => ({ date: d, value: Number(log[d]) || 0 }));
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. FRÉQUENCE CARDIAQUE DE REPOS
// ═══════════════════════════════════════════════════════════════════════════
export const HR_KEY = "morpho_hr_log";

export function saveRestingHR(bpm, date = dayKey()) {
  const v = Number(bpm);
  if (!v || v < 25 || v > 140) return false;   // garde-fou physiologique
  const log = readJSON(HR_KEY, {});
  log[date] = v;
  return writeJSON(HR_KEY, log);
}

/**
 * Compare la FC des 7 derniers jours à la ligne de base des 30 jours.
 * Une élévation ≥ 5 bpm est un marqueur reconnu de fatigue accumulée.
 */
export function getRestingHR() {
  const log = readJSON(HR_KEY, {});
  const all = Object.entries(log)
    .map(([date, bpm]) => ({ date, bpm: Number(bpm) }))
    .filter(e => e.bpm > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (all.length === 0) {
    return { available: false, reason: "Aucune mesure enregistrée", series: [] };
  }

  const last30 = daysBack(30);
  const last7  = daysBack(7);
  const in30 = all.filter(e => last30.includes(e.date));
  const in7  = all.filter(e => last7.includes(e.date));
  const latest = all[all.length - 1];

  if (in30.length < 5) {
    return { available: true, partial: true, latest: latest.bpm, latestDate: latest.date,
      series: all.slice(-30), count: all.length,
      reason: `${5 - in30.length} mesure${5 - in30.length > 1 ? "s" : ""} de plus pour établir ta ligne de base` };
  }

  const baseline = Math.round((in30.reduce((s, e) => s + e.bpm, 0) / in30.length) * 10) / 10;
  const recent   = in7.length
    ? Math.round((in7.reduce((s, e) => s + e.bpm, 0) / in7.length) * 10) / 10
    : baseline;
  const delta = Math.round((recent - baseline) * 10) / 10;

  return {
    available: true, partial: false, baseline, recent, delta,
    latest: latest.bpm, latestDate: latest.date,
    series: all.slice(-30), count: all.length,
    status: delta >= 7 ? "élevée" : delta >= 4 ? "légèrement élevée" : delta <= -3 ? "abaissée" : "stable",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. MOBILITÉ + MOTIVATION
// ═══════════════════════════════════════════════════════════════════════════
export function getMobilityData(days = 7) {
  const log = readJSON("morpho_mobilite_log", {});
  const range = daysBack(days);
  const count = range.filter(d => log[d]).length;
  return { available: true, count, total: days, pct: Math.round((count / days) * 100) };
}

export const MOTIVATION_KEY = "morpho_motivation_log";

export function saveMotivation(score, date = dayKey()) {
  const v = Number(score);
  if (!v || v < 1 || v > 5) return false;
  const log = readJSON(MOTIVATION_KEY, {});
  log[date] = v;
  return writeJSON(MOTIVATION_KEY, log);
}

export function getMotivation(days = 7) {
  const log = readJSON(MOTIVATION_KEY, {});
  const vals = daysBack(days).map(d => Number(log[d]) || 0).filter(v => v > 0);
  if (vals.length === 0) return { available: false, reason: "Aucun check-in effectué" };
  const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  return { available: true, avg, count: vals.length, pct: Math.round((avg / 5) * 100) };
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. SCORE DE RÉCUPÉRATION — pondéré, normalisé sur les seules données présentes
// ═══════════════════════════════════════════════════════════════════════════
export const RECOVERY_WEIGHTS = {
  sommeil:    35,
  charge:     25,
  fcRepos:    20,
  motivation: 10,
  mobilite:   10,
};

/**
 * Chaque composante n'entre dans le score que si sa donnée existe. Le total est
 * ensuite ramené sur 100 au prorata des poids réellement disponibles, et on
 * expose la couverture pour que l'utilisateur sache sur quoi le score repose.
 */
export function getRecoveryScore({ age } = {}) {
  const sleep = getSleepData(age, 7);
  const vol   = getWeeklyVolume();
  const hr    = getRestingHR();
  const moti  = getMotivation(7);
  const mob   = getMobilityData(7);

  const parts = [];

  // Sommeil — ratio moyenne / cible, plafonné à 100
  if (sleep.available && sleep.target) {
    let s = Math.min(100, Math.round((sleep.avg / sleep.target) * 100));
    if (sleep.deficitStreak >= 3) s = Math.max(0, s - 15);   // dette installée
    parts.push({ key: "sommeil", weight: RECOVERY_WEIGHTS.sommeil, score: s,
      detail: `${sleep.avg} h de moyenne pour une cible de ${sleep.target} h` });
  }

  // Charge — pénalise le dépassement du MRV, et le sous-seuil dans une moindre mesure
  if (vol.available) {
    let s = 100;
    if (vol.groupsOver > 0)  s -= Math.min(60, vol.groupsOver * 25);
    if (vol.groupsUnder > 0) s -= Math.min(20, vol.groupsUnder * 6);
    parts.push({ key: "charge", weight: RECOVERY_WEIGHTS.charge, score: Math.max(0, s),
      detail: `${vol.totalSets} séries validées sur ${vol.sessions} séance${vol.sessions > 1 ? "s" : ""}` });
  }

  // FC de repos — 100 si stable, dégradation progressive selon l'écart
  if (hr.available && !hr.partial) {
    let s = 100;
    if (hr.delta >= 7)      s = 40;
    else if (hr.delta >= 4) s = 65;
    else if (hr.delta >= 2) s = 85;
    parts.push({ key: "fcRepos", weight: RECOVERY_WEIGHTS.fcRepos, score: s,
      detail: `${hr.recent} bpm sur 7 j contre ${hr.baseline} bpm de référence` });
  }

  if (moti.available) {
    parts.push({ key: "motivation", weight: RECOVERY_WEIGHTS.motivation, score: moti.pct,
      detail: `${moti.avg} / 5 sur ${moti.count} check-in${moti.count > 1 ? "s" : ""}` });
  }

  if (mob.count > 0) {
    parts.push({ key: "mobilite", weight: RECOVERY_WEIGHTS.mobilite,
      score: Math.min(100, Math.round((mob.count / 4) * 100)),
      detail: `${mob.count} séance${mob.count > 1 ? "s" : ""} de mobilité sur 7 j` });
  }

  const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
  if (totalWeight === 0) {
    return { available: false, reason: "Aucune donnée de récupération enregistrée",
      parts: [], coverage: 0 };
  }

  const score = Math.round(
    parts.reduce((s, p) => s + p.score * p.weight, 0) / totalWeight
  );
  const coverage = Math.round((totalWeight / 100) * 100);

  return {
    available: true, score, parts, coverage, totalWeight,
    label: score >= 80 ? "Excellente" : score >= 65 ? "Bonne"
         : score >= 50 ? "Correcte"   : score >= 35 ? "Dégradée" : "Faible",
    missing: Object.keys(RECOVERY_WEIGHTS).filter(k => !parts.find(p => p.key === k)),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. DÉTECTION DU SURENTRAÎNEMENT — statut justifié, jamais affirmé sans preuve
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Renvoie un statut à 5 niveaux accompagné de la liste des signaux positifs et
 * des alertes qui l'ont produit. Chaque ligne est traçable à une donnée réelle.
 */
export function getOvertrainingStatus({ age } = {}) {
  const sleep = getSleepData(age, 7);
  const vol   = getWeeklyVolume();
  const hr    = getRestingHR();
  const perf  = getPerformanceTrend();
  const moti  = getMotivation(7);

  const positives = [], warnings = [], unavailable = [];
  let risk = 0;   // score de risque cumulé

  // Sommeil
  if (sleep.available && sleep.target) {
    if (sleep.deficitStreak >= 3) {
      warnings.push(`Sommeil sous la cible depuis ${sleep.deficitStreak} nuits`);
      risk += 3;
    } else if (sleep.avg >= sleep.target) {
      positives.push(`Sommeil à ${sleep.avg} h, au niveau de la cible`);
    } else {
      warnings.push(`Sommeil à ${sleep.avg} h pour une cible de ${sleep.target} h`);
      risk += 1;
    }
  } else unavailable.push("Sommeil");

  // FC de repos
  if (hr.available && !hr.partial) {
    if (hr.delta >= 7)      { warnings.push(`FC de repos +${hr.delta} bpm au-dessus de ta référence`); risk += 3; }
    else if (hr.delta >= 4) { warnings.push(`FC de repos +${hr.delta} bpm`); risk += 2; }
    else                    { positives.push(`FC de repos stable à ${hr.recent} bpm`); }
  } else unavailable.push("FC de repos");

  // Volume
  if (vol.available) {
    if (vol.groupsOver > 0) {
      const noms = vol.byMuscle.filter(g => g.statut === "au-dessus").map(g => g.groupe).join(", ");
      warnings.push(`Volume au-dessus du maximum récupérable : ${noms}`);
      risk += 2;
    } else {
      positives.push(`Volume dans la zone récupérable (${vol.totalSets} séries)`);
    }
  } else unavailable.push("Volume");

  // Performance
  if (perf.available) {
    if (perf.trend === "baisse") {
      warnings.push(`Performances en baisse (${perf.avgDelta} % en moyenne)`);
      risk += 3;
    } else if (perf.trend === "hausse") {
      positives.push(`Performances en hausse (+${perf.avgDelta} %)`);
    } else {
      positives.push("Performances stables");
    }
  } else unavailable.push("Performance");

  // Motivation
  if (moti.available) {
    if (moti.avg <= 2)      { warnings.push(`Motivation basse (${moti.avg} / 5)`); risk += 2; }
    else if (moti.avg >= 4) { positives.push(`Motivation élevée (${moti.avg} / 5)`); }
  } else unavailable.push("Motivation");

  // Aucun signal exploitable → on ne conclut pas
  if (positives.length === 0 && warnings.length === 0) {
    return { available: false, reason: "Pas encore assez de données pour évaluer ta récupération",
      positives, warnings, unavailable, risk: 0 };
  }

  const level =
    risk >= 8 ? { key: "risque",      label: "Risque de surentraînement", color: "#EF4444" } :
    risk >= 5 ? { key: "fatigue",     label: "Fatigue accumulée",         color: "#F5A100" } :
    risk >= 3 ? { key: "surveillance",label: "À surveiller",              color: "#F5A100" } :
    risk >= 1 ? { key: "bonne",       label: "Bonne récupération",        color: "#0B8A5F" } :
                { key: "excellente",  label: "Récupération excellente",   color: "#0B8A5F" };

  return { available: true, ...level, risk, positives, warnings, unavailable,
    confidence: Math.round(((5 - unavailable.length) / 5) * 100) };
}
