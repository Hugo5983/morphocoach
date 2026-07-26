// ─── API LIB : TÉLÉMÉTRIE IA ────────────────────────────────────────────────
// Journal d'événements de génération → table generation_events (Supabase,
// service role). C'est LE geste fondateur du futur dataset : chaque paire
// (dossier + fiche + directives) → (réflexion + programme + warnings) est
// l'exemple d'entraînement idéal pour les modèles à venir.
//
// Règles :
//   - activée uniquement si TELEMETRY_ENABLED="true" ET service role configuré
//     (⚠ conformité : ne l'activer qu'une fois le consentement utilisateur
//     recueilli — voir LIVRAISON.md, section RGPD)
//   - fire-and-forget avec timeout court : ne ralentit ni ne casse JAMAIS la
//     réponse à l'utilisateur
//   - minimisation : le prénom est retiré du formulaire avant enregistrement

function stripPII(form) {
  if (!form || typeof form !== "object") return form;
  const { prenom, ...rest } = form;
  return rest;
}

/**
 * @param {string} table
 * @param {object} row
 */
async function insert(table, row) {
  if (process.env.TELEMETRY_ENABLED !== "true") return;
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 2000);
  try {
    await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: service,
        Authorization: `Bearer ${service}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
      signal: controller.signal,
    });
  } catch (e) {
    console.warn(`[telemetry] ${table}:`, e.message);
  } finally {
    clearTimeout(t);
  }
}

/** Journalise une génération de programme (succès ou échec). */
export function logGenerationEvent({
  userId, form, dossier, fiche, directives, reflexion, programme,
  warnings, model, durationMs, accessMode, status,
}) {
  // Volontairement non await-é par l'appelant (fire-and-forget).
  return insert("generation_events", {
    user_id: userId || null,
    status: status || "ok",
    model: model || null,
    duration_ms: durationMs ?? null,
    access_mode: accessMode || null,
    form: stripPII(form) || null,
    dossier: dossier || null,
    fiche: fiche || null,
    directives: directives || null,
    reflexion: reflexion || null,
    programme: programme || null,
    warnings: warnings || [],
  });
}

/** Journalise une analyse morphologique (fiche produite, jamais les photos). */
export function logMorphoEvent({ userId, fiche, status }) {
  return insert("morpho_events", {
    user_id: userId || null,
    status: status || "ok",
    fiche: fiche || null,
  });
}
