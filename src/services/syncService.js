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


// ═══════════════════════════════════════════════════════════════════════════
// RESTAURATION — Supabase → localStorage
// ═══════════════════════════════════════════════════════════════════════════
// Jusqu'ici ce service n'écrivait QUE : sur un nouvel appareil, un cache vidé
// ou un passage iPhone → web, l'historique restait dans Supabase mais l'IA
// repartait de zéro. On lit désormais en retour, une seule fois, pour
// reconstituer le journal local à partir duquel le dossier athlète est bâti.
//
// Principe conservé : le localStorage reste la SOURCE DE LECTURE de l'app.
// Supabase ne fait que le réamorcer quand il est vide ou plus pauvre.

const RESTORE_FLAG = "morpho_restored_at";

/** Fusionne sans jamais écraser une donnée locale plus riche. */
function fusionnerJournal(local, distant) {
  const out = { ...distant, ...local };   // le local gagne en cas de conflit
  for (const [jour, dist] of Object.entries(distant || {})) {
    const loc = local?.[jour];
    if (!loc) { out[jour] = dist; continue; }
    // Même jour des deux côtés : on garde la version avec le plus de séries.
    const nLoc  = (loc?.sets  || []).length;
    const nDist = (dist?.sets || []).length;
    out[jour] = nDist > nLoc ? dist : loc;
  }
  return out;
}

/**
 * Reconstitue morpho_workout_log depuis Supabase.
 * Idempotent, silencieux, non bloquant : en cas d'échec l'app fonctionne
 * exactement comme avant.
 * @param {{force?: boolean}} [opts] force=true pour ignorer le drapeau
 * @returns {Promise<{restaure: boolean, jours: number, raison?: string}>}
 */
export async function restaurerHistorique(opts = {}) {
  try {
    const uid = await userId();
    if (!uid) return { restaure: false, jours: 0, raison: "non connecté" };

    if (!opts.force && localStorage.getItem(RESTORE_FLAG)) {
      return { restaure: false, jours: 0, raison: "déjà restauré" };
    }

    const { data, error } = await supabase
      .from("workout_sync")
      .select("kind, day, payload")
      .eq("kind", "workout")
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) return { restaure: false, jours: 0, raison: error.message };
    if (!Array.isArray(data) || data.length === 0) {
      localStorage.setItem(RESTORE_FLAG, new Date().toISOString());
      return { restaure: false, jours: 0, raison: "aucun historique distant" };
    }

    const distant = {};
    for (const row of data) {
      if (!row?.day || !row?.payload) continue;
      const prec = distant[row.day];
      const nNew = (row.payload?.sets || []).length;
      if (!prec || nNew > (prec?.sets || []).length) distant[row.day] = row.payload;
    }

    let local = {};
    try { local = JSON.parse(localStorage.getItem("morpho_workout_log") || "{}"); } catch {}
    const fusion = fusionnerJournal(local, distant);

    const avant = Object.keys(local).length;
    const apres = Object.keys(fusion).length;
    if (apres > avant) {
      localStorage.setItem("morpho_workout_log", JSON.stringify(fusion));
    }
    localStorage.setItem(RESTORE_FLAG, new Date().toISOString());
    return { restaure: apres > avant, jours: apres - avant };
  } catch (e) {
    console.warn("[sync] restauration:", /** @type {Error} */ (e).message);
    return { restaure: false, jours: 0, raison: "erreur" };
  }
}

/**
 * Restaure les cycles archivés (mémoire d'exercices des cycles précédents).
 * @returns {Promise<object[]>} cycles distants, tableau vide si rien
 */
export async function restaurerCycles() {
  try {
    const uid = await userId();
    if (!uid) return [];
    const { data, error } = await supabase
      .from("cycle_outcomes")
      .select("cycle_numero, titre, objectif, split, seances_prevues, seances_faites, adherence_pct, charges_resume, created_at")
      .order("cycle_numero", { ascending: true })
      .limit(50);
    if (error || !Array.isArray(data)) return [];
    return data.map(c => ({
      numero: c.cycle_numero, titre: c.titre, objectif: c.objectif, split: c.split,
      chargesResume: c.charges_resume,
      archiveDate: c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : null,
      jours: [],                       // le détail des séances n'est pas journalisé
      _restaure: true,                 // marqueur : provient de Supabase
    }));
  } catch {
    return [];
  }
}
