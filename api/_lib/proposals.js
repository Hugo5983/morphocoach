// ─── API LIB : EXERCICES PROPOSÉS ───────────────────────────────────────────
// Quand l'IA nomme un exercice absent du catalogue, il n'est PAS supprimé du
// programme : il est conservé (avec un avertissement) et journalisé ici pour
// que tu puisses le relire et l'ajouter au catalogue si tu le valides.
//
// Table à créer une fois dans Supabase → SQL Editor :
//   create table if not exists exercices_proposes (
//     id uuid primary key default gen_random_uuid(),
//     nom text not null,
//     nom_normalise text not null unique,
//     occurrences int not null default 1,
//     contexte jsonb,
//     statut text not null default 'a_revoir',  -- a_revoir | accepte | refuse
//     premiere_vue timestamptz not null default now(),
//     derniere_vue timestamptz not null default now()
//   );
//   alter table exercices_proposes enable row level security;
//   -- aucune policy : seule la service role (serveur) lit/écrit.
//
// Pour relire la file : Supabase → Table Editor → exercices_proposes,
// trier par `occurrences` décroissant. Les noms qui reviennent souvent sont
// ceux qui manquent vraiment au catalogue.

const REQ_TIMEOUT_MS = 3_000;

/** Normalisation identique à celle du catalogue (accents, casse, ponctuation). */
export function normaliser(nom) {
  return String(nom || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Journalise les exercices proposés hors catalogue. Fire-and-forget : ne
 * bloque jamais la génération et n'échoue jamais bruyamment — une file de
 * revue ne doit pas pouvoir casser une livraison de programme.
 * @param {string[]} noms
 * @param {{niveau?:string, objectif?:string, materiel?:string[]}} contexte
 */
export async function logExercicesProposes(noms = [], contexte = {}) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service || !noms.length) return;

  // Dédoublonnage intra-programme : un même nom cité 3 fois compte pour 1.
  const uniques = [...new Map(noms.map(n => [normaliser(n), n])).values()]
    .filter(n => normaliser(n).length > 2)
    .slice(0, 40);
  if (!uniques.length) return;

  const now = new Date().toISOString();
  const rows = uniques.map(nom => ({
    nom,
    nom_normalise: normaliser(nom),
    occurrences: 1,
    contexte: {
      niveau: contexte.niveau || null,
      objectif: contexte.objectif || null,
      materiel: contexte.materiel || [],
    },
    statut: "a_revoir",
    derniere_vue: now,
  }));

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  try {
    // merge-duplicates : si le nom existe déjà, la ligne est mise à jour
    // (derniere_vue) plutôt que dupliquée.
    await fetch(`${url}/rest/v1/exercices_proposes?on_conflict=nom_normalise`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: service,
        Authorization: `Bearer ${service}`,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
      signal: controller.signal,
    });
  } catch (e) {
    console.warn("[proposals]", e.message);
  } finally {
    clearTimeout(t);
  }
}
