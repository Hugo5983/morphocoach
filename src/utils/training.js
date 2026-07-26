import { CAT } from"../data/constants.js";
// @ts-check
// ─── UTILITAIRES TRAINING ────────────────────────────────────────────────────
// Fonctions partagées entre ProgramTab, TodayView, Calendar, SeanceDetail.
// Source unique de vérité — ne pas dupliquer ailleurs.

import { EX } from"../data/exercises.js";

/**
 * Cherche un exercice dans la base par nom (correspondance souple).
 * @param {string | undefined} nom
 * @returns {Record<string, unknown> | null}
 */
const normEx = (s) => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export function findExInDB(nom) {
  if (!nom) return null;
  const n = normEx(nom);
  if (!n) return null;
  let fallback = null;
  for (const group of Object.values(EX)) {
    for (const e of group) {
      const en = normEx(e.n);
      if (en === n) return e;                       // 1. exact (accents ignorés)
      if (!fallback && en.length >= 8 && (n.includes(en) || en.includes(n))) {
        fallback = e;                               // 2. inclusion du nom complet
      }
    }
  }
  return fallback;                                  // 3. sinon : null (pas de faux match)
}

/**
 * Formule Epley — calcule le 1RM estimé.
 * @param {number} kg
 * @param {number} reps
 * @returns {number}
 */
export const calc1RM = (kg, reps) => {
  const w = parseFloat(kg), r = parseInt(reps);
  if (!w || w <= 0 || !r || r < 1) return 0;
  if (r === 1) return Math.round(w);          // 1 rep = c'est déjà le max, pas d'estimation
  return Math.round(w * (1 + r / 30));        // Epley (fiable pour 2+ reps)
};

/**
 * Charge cible pour un nombre de reps donné, basé sur le 1RM.
 * @param {number} rm1
 * @param {number} reps
 * @returns {number}
 */
export const calcKgFor = (rm1, reps) => {
  const r = parseInt(reps);
  if (!rm1 || rm1 <= 0 || !r || r < 1) return 0;
  if (r === 1) return Math.round(rm1 * 2) / 2;                       // 1 rep = le 1RM lui-même
  return Math.max(0, Math.round((rm1 / (1 + r / 30)) * 2) / 2);      // inverse d'Epley
};

/**
 * Couleur par catégorie d'exercice.
 * @param {string | undefined} cat
 * @returns {string}
 */
export const catColor = (cat) => CAT[cat ||"principal"] || CAT.principal;

/**
 * Formate une clé YYYY-MM-DD depuis une Date.
 * @param {Date} date
 * @returns {string}
 */
export const toDateKey = (date) =>
`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
