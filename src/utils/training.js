// @ts-check
// ─── UTILITAIRES TRAINING ────────────────────────────────────────────────────
// Fonctions partagées entre ProgramTab, TodayView, Calendar, SeanceDetail.
// Source unique de vérité — ne pas dupliquer ailleurs.

import { EX } from "../data/exercises.js";

/**
 * Cherche un exercice dans la base par nom (correspondance souple).
 * @param {string | undefined} nom
 * @returns {Record<string, unknown> | null}
 */
export function findExInDB(nom) {
  if (!nom) return null;
  const n = nom.toLowerCase();
  for (const group of Object.values(EX)) {
    const found = group.find(e =>
      e.n.toLowerCase() === n ||
      n.includes(e.n.toLowerCase().split(" ")[0]) ||
      e.n.toLowerCase().includes(n.split(" ")[0])
    );
    if (found) return found;
  }
  return null;
}

/**
 * Formule Epley — calcule le 1RM estimé.
 * @param {number} kg
 * @param {number} reps
 * @returns {number}
 */
export const calc1RM = (kg, reps) =>
  (!kg || !reps || reps < 1) ? 0 : Math.round(kg * (1 + reps / 30));

/**
 * Charge cible pour un nombre de reps donné, basé sur le 1RM.
 * @param {number} rm1
 * @param {number} reps
 * @returns {number}
 */
export const calcKgFor = (rm1, reps) =>
  Math.max(0, Math.round(rm1 * (1 - reps / 30) * 2) / 2);

/**
 * Couleur par catégorie d'exercice.
 * @param {string | undefined} cat
 * @returns {string}
 */
export const catColor = (cat) =>
  ({ principal:"#4D8BFF", correctif:"#FF7A6B", gainage:"#5FE0A5", isolation:"#B69DFF" }[cat || "principal"] || "#4D8BFF");

/**
 * Formate une clé YYYY-MM-DD depuis une Date.
 * @param {Date} date
 * @returns {string}
 */
export const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
