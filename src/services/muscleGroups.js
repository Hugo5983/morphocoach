// ─── RÉSOLUTION DU GROUPE MUSCULAIRE ────────────────────────────────────────
// Le catalogue CLIENT (src/data/exercises.js, 158 entrées) et le catalogue
// SERVEUR (api/_knowledge/exercices_catalogue.js, 812 entrées) ne sont pas
// synchronisés : 654 exercices prescrits par l'IA sont inconnus du client.
// Sans ce module, ils retombaient tous sur "Autre", ce qui faussait à la fois
// le volume par muscle et le palier de progression de charge.
//
// Stratégie : correspondance exacte d'abord, puis inférence par mots-clés.
// On n'embarque pas les 122 ko du catalogue serveur dans le bundle client.

import { EX } from "../data/exercises.js";
import { EXERCICE_GROUPE } from "../data/catalogue.js";

/** Mots-clés → groupe. Ordre important : le plus spécifique en premier. */
const INDICES = [
  [/mollet|soleaire|soléaire|gastrocn|heel raise|calf/i,                  "Mollets"],
  [/ischio|leg curl|jambes tendues|nordic|roumain|good morning/i,         "Ischio-jambiers"],
  [/fessier|hip thrust|glute|abduction|clamshell|monster walk|pont/i,     "Fessiers"],
  [/quadriceps|squat|presse|leg extension|fente|bulgare|step.?up|hack|sissy|pistol/i, "Quadriceps"],
  [/lombaire|hyperextension|extension lombaire|superman|bird.?dog|mckenzie/i, "Lombaires"],
  [/abdo|crunch|gainage|planche|dead bug|pallof|rollout|jackknife|sit.?up|relev[ée] de jambes/i, "Abdominaux"],
  [/trap[eè]ze|shrug|haussement|chin tuck|y-t-w|serratus|r[ée]traction scapulaire/i, "Trapèzes"],
  [/avant.?bras|wrist|poignet|brachio.?radial|grip|farmer/i,              "Avant-bras"],
  [/biceps|curl/i,                                                        "Biceps"],
  [/triceps|extension nuque|barre au front|kickback|d[ée]velopp[ée] serr|dips/i, "Triceps"],
  [/pectoraux|d[ée]velopp[ée] (couch|halt|barre|machine|inclin|d[ée]clin)|[ée]cart[ée]|pec.?deck|pompes|pull.?over|chest/i, "Pectoraux"],
  [/[ée]paule|deltoï|d[ée]velopp[ée] militaire|[ée]l[ée]vation lat|[ée]l[ée]vation front|oiseau|face pull|rotation externe|rotation interne|scaption|arnold/i, "Épaules"],
  [/dos|dorsa|traction|tirage|rowing|pull.?up|chin.?up|grand rond|lat /i, "Dos"],
];

let _exact = null;
function tableExacte() {
  if (_exact) return _exact;
  _exact = {};
  Object.entries(EX || {}).forEach(([g, list]) =>
    (list || []).forEach(e => { if (e?.n) _exact[e.n.toLowerCase()] = g; }));
  return _exact;
}

/**
 * Groupe musculaire d'un exercice, quelle que soit sa provenance.
 * @param {string} nom
 * @returns {string} groupe, ou "Autre" si vraiment indéterminable
 */
export function groupeMusculaire(nom) {
  const n = String(nom || "").trim();
  if (!n) return "Autre";

  const bas = n.toLowerCase();
  // 1. Table générée depuis le catalogue serveur : exacte sur les 812 exercices
  //    que l'IA peut réellement prescrire.
  if (EXERCICE_GROUPE[bas]) return EXERCICE_GROUPE[bas];
  // 2. Catalogue client historique.
  const exact = tableExacte()[bas];
  if (exact) return exact;
  // 3. Inférence par mots-clés : filet pour un exercice proposé hors catalogue.

  for (const [re, groupe] of INDICES) {
    if (re.test(n)) return groupe;
  }
  return "Autre";
}

/** Taux de résolution sur une liste de noms — utile aux tests. */
export function tauxResolution(noms = []) {
  if (!noms.length) return 1;
  const ok = noms.filter(n => groupeMusculaire(n) !== "Autre").length;
  return ok / noms.length;
}
