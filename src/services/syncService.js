// @ts-check
// ─── SYNC SERVICE — journal Supabase opportuniste ───────────────────────────
// Pousse les données d'entraînement réelles vers Supabase quand une session
// existe. Philosophie "journal, pas source de vérité" :
//   - le localStorage reste la lecture (l'app fonctionne offline à l'identique) ;
//   - chaque écriture est fire-and-forget : un échec réseau est silencieux et
//     ne dégrade JAMAIS l'expérience ;
//   - c'est ce journal qui sort les données du téléphone : sans lui, tout
//     l'historique meurt avec l'appareil, et le dataset IA reste vide.
// Tables et politiques RLS : voir supabase/schema.sql (l'utilisateur ne peut
// écrire que ses propres lignes).

import { supabase } from "./supabase.js";

/** @returns {Promise<string|null>} id utilisateur si connecté */
async function userId() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id || null;
  } catch { return null; }
}

/**
 * Insertion silencieuse. Ne lève jamais.
 * @param {string} table
 * @param {object} row
 */
async function push(table, row) {
  try {
    const uid = await userId();
    if (!uid) return false;
    const { error } = await supabase.from(table).insert({ user_id: uid, ...row });
    if (error) { console.warn(`[sync] ${table}:`, error.message); return false; }
    return true;
  } catch (e) {
    console.warn(`[sync] ${table}:`, /** @type {Error} */ (e).message);
    return false;
  }
}

/**
 * Journal d'une séance terminée (miroir de morpho_workout_log[date]).
 * @param {string} dateKey - YYYY-MM-DD
 * @param {object} entry   - { seanceNom, sets, totalVolume, completedAt }
 */
export function syncWorkoutDay(dateKey, entry) {
  return push("workout_sync", { kind: "workout", day: dateKey, payload: entry });
}

/**
 * Journal d'un feedback post-exercice (miroir de morpho_exo_feedback).
 * @param {string} exNom
 * @param {{rpe?: number|null, pain?: number|null, feel?: number|null}} fb
 */
export function syncExoFeedback(exNom, fb) {
  return push("workout_sync", {
    kind: "feedback",
    day: new Date().toISOString().split("T")[0],
    payload: { exNom, ...fb },
  });
}

/**
 * Bilan d'un cycle au moment de son archivage : adhérence réelle + résumé.
 * C'est la future VARIABLE CIBLE des modèles (programme → résultat).
 * @param {object} prog - programme archivé
 */
export function syncCycleOutcome(prog) {
  if (!prog) return Promise.resolve(false);
  const jours = Array.isArray(prog.jours) ? prog.jours : [];
  const prevu = jours.length;
  const fait  = jours.filter((j) => j.complete).length;
  return push("cycle_outcomes", {
    cycle_numero: prog.numero || null,
    titre: prog.titre || null,
    objectif: prog.objectif || null,
    split: prog.split || null,
    seances_prevues: prevu,
    seances_faites: fait,
    adherence_pct: prevu ? Math.round((fait / prevu) * 100) : null,
    charges_resume: prog.chargesResume || null,
    reflexion: prog.reflexion || null,
  });
}
