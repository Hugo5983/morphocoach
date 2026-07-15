// @ts-check
// ─── MorphoCoach · Badge Service ─────────────────────────────────────────────
// Calcule les statistiques de l'utilisateur depuis les données réelles
// (workout log, calendrier, nutrition, sommeil, records…) et en déduit
// l'état de chaque badge : débloqué ou progression x/cible.
// Un badge débloqué reste débloqué (persisté dans mc_badgesUnlocked).

import * as storage from"./storageService.js";
import { getXPState, getLevelInfo } from"./xpService.js";
import { ACHIEVEMENTS } from"../data/achievements.js";
import { calc1RM } from"../utils/training.js";

const UNLOCKED_KEY ="badgesUnlocked";

/** Lecture sûre d'un JSON localStorage non préfixé (clés historiques morpho_*). */
function rawJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ||"null") ?? fallback; }
  catch { return fallback; }
}

/** Normalise calSess : chaque date peut contenir une séance ou un tableau. */
function calSessEntries() {
  const cal = storage.get("calSess", {}) || {};
  const out = [];
  for (const [date, val] of Object.entries(cal)) {
    const arr = Array.isArray(val) ? val : [val];
    for (const s of arr) if (s) out.push({ date, ...s });
  }
  return out;
}

/** Meilleure série de jours consécutifs dans un ensemble de dates (YYYY-MM-DD). */
function bestStreakOf(dateSet) {
  const dates = [...dateSet].sort();
  let best = 0, cur = 0, prev = null;
  for (const d of dates) {
    if (prev) {
      const diff = (new Date(d).getTime() - new Date(prev).getTime()) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
    } else cur = 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

/**
 * Calcule toutes les statistiques badge depuis les données stockées.
 * @param {{ calObj?: number, pObj?: number }} goals — cibles nutrition (facultatif)
 */
export function computeBadgeStats(goals = {}) {
  const workoutLog  = rawJSON("morpho_workout_log", {});
  const sleepLog    = rawJSON("morpho_sleep_log", {});
  const sleepTarget = parseFloat(localStorage.getItem("morpho_sleep_target") ||"8");
  const mobiliteLog = rawJSON("morpho_mobilite_log", {});
  const repasLog    = storage.get("repasLog", {}) || {};
  const weightLog   = storage.get("weightLog", []) || [];
  const prog        = /** @type {{jours?: Array<any>}|null} */ (storage.get("prog", null));
  const cycles      = storage.get("cycles", []) || [];
  const cal         = calSessEntries();

  // ── Séances validées : union du log Focus et du calendrier ────────────────
  const doneDates = new Set(Object.keys(workoutLog));
  for (const s of cal) if (s.done) doneDates.add(s.date);
  const totalSeances = doneDates.size;

  // ── Séries ─────────────────────────────────────────────────────────────────
  const bestStreak = bestStreakOf(doneDates);

  // ── Semaines régulières (3+ séances) consécutives ──────────────────────────
  const weekCounts = {};
  for (const d of doneDates) {
    const dt = new Date(d);
    const monday = new Date(dt); monday.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
    const wk = monday.toISOString().slice(0, 10);
    weekCounts[wk] = (weekCounts[wk] || 0) + 1;
  }
  const goodWeeks = Object.keys(weekCounts).filter((w) => weekCounts[w] >= 3).sort();
  let semainesRegulieres = 0, run = 0, prevW = null;
  for (const w of goodWeeks) {
    run = prevW && (new Date(w).getTime() - new Date(prevW).getTime()) / 86400000 === 7 ? run + 1 : 1;
    semainesRegulieres = Math.max(semainesRegulieres, run);
    prevW = w;
  }

  // ── Ponctualité : séances planifiées validées à leur date ──────────────────
  const seancesPonctuelles = cal.filter((s) => s.done).length;

  // ── Mois actifs & meilleur mois ────────────────────────────────────────────
  const monthCounts = {};
  for (const d of doneDates) {
    const m = d.slice(0, 7);
    monthCounts[m] = (monthCounts[m] || 0) + 1;
  }
  const moisActifs = Object.keys(monthCounts).length;
  const meilleurMoisSeances = Math.max(0, ...Object.values(monthCounts));

  // ── Cardio / mobilité ──────────────────────────────────────────────────────
  const cardioCal = cal.filter((s) => s.done && (s.intensite ==="leger" || s.intensite ==="mobilite")).length;
  const mobiliteJours = Object.values(mobiliteLog).filter(Boolean).length;
  const cardioSeances = cardioCal + mobiliteJours;

  // ── Focus (séances tracées set par set) ────────────────────────────────────
  const focusSessions = Object.keys(workoutLog).length;

  // ── Records (historique 1RM par exercice du programme) ─────────────────────
  let exosAvecRecord = 0, recordsBattus = 0, progressionMaxKg = 0;
  if (prog?.jours) {
    for (const j of prog.jours) {
      for (const ex of j.exercices || []) {
        const h = ex.historique || [];
        if (h.length === 0) continue;
        exosAvecRecord++;
        const rms = h.map((e) => calc1RM(e.poids, e.reps)).filter((v) => v > 0);
        if (rms.length === 0) continue;
        let maxSoFar = rms[0];
        for (let i = 1; i < rms.length; i++) {
          if (rms[i] > maxSoFar) { recordsBattus++; maxSoFar = rms[i]; }
        }
        progressionMaxKg = Math.max(progressionMaxKg, maxSoFar - rms[0]);
      }
    }
  }

  // ── Mésocycles terminés ────────────────────────────────────────────────────
  const mesocyclesTermines = Array.isArray(cycles) ? cycles.length : 0;

  // ── Nutrition (repasLog : {date:{kcal,prot,eau,…}}) ────────────────────────
  const days = Object.values(repasLog).filter((d) => d && (d.kcal || 0) > 0);
  const calObj = goals.calObj || 0;
  const pObj   = goals.pObj   || 0;
  const joursNutrition   = days.length;
  const joursProteines   = pObj   ? days.filter((d) => (d.prot || 0) >= pObj * 0.9).length : 0;
  const joursHydratation = days.filter((d) => (d.eau || 0) >= 8).length;
  const joursDeficit     = calObj ? days.filter((d) => d.kcal <= calObj).length : 0;
  const joursNutritionParfaite = (calObj && pObj)
    ? days.filter((d) => d.kcal <= calObj * 1.05 && (d.prot || 0) >= pObj * 0.9).length
    : 0;

  // ── Sommeil & pesées ───────────────────────────────────────────────────────
  const nuitsOptimales = Object.values(sleepLog).filter((h) => h >= sleepTarget).length;
  const pesees = Array.isArray(weightLog) ? weightLog.length : 0;

  // ── Niveau XP ──────────────────────────────────────────────────────────────
  const niveau = getLevelInfo(getXPState().xp || 0).cur.level;

  return {
    totalSeances, bestStreak, semainesRegulieres, seancesPonctuelles,
    moisActifs, meilleurMoisSeances, cardioSeances, focusSessions,
    exosAvecRecord, recordsBattus, progressionMaxKg, mesocyclesTermines,
    joursNutrition, joursNutritionParfaite, joursProteines,
    joursHydratation, joursDeficit, nuitsOptimales, pesees, niveau,
  };
}

/**
 * État de tous les badges : débloqué / progression.
 * @param {{ calObj?: number, pObj?: number }} goals
 * @returns {Array<Object>} liste de badges enrichis {current, target, pct, unlocked}
 */
export function getBadgeStates(goals = {}) {
  const stats = computeBadgeStats(goals);
  const saved = new Set(/** @type {string[]} */ (storage.get(UNLOCKED_KEY, []) || []));

  // 1er passage : tous les badges hors mode_legende
  const base = ACHIEVEMENTS.map((def) => {
    if (def.stat ==="autresBadges") return { ...def, current: 0 };
    const current = Math.round((stats[def.stat] || 0) * 10) / 10;
    return { ...def, current };
  });
  const unlockedOthers = base.filter((b) => b.stat !=="autresBadges" && b.current >= b.target).length;

  const states = base.map((b) => {
    const current = b.stat ==="autresBadges" ? unlockedOthers : b.current;
    const unlocked = current >= b.target || saved.has(b.id);
    const pct = Math.max(0, Math.min(100, Math.round((current / b.target) * 100)));
    return { ...b, current: Math.min(current, b.target), pct: unlocked ? 100 : pct, unlocked };
  });

  // Persistance : un badge gagné reste gagné
  const nowUnlocked = states.filter((s) => s.unlocked).map((s) => s.id);
  if (nowUnlocked.some((id) => !saved.has(id))) {
    storage.set(UNLOCKED_KEY, [...new Set([...saved, ...nowUnlocked])]);
  }
  return states;
}
