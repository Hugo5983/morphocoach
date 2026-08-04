// Régénère src/data/muscleMap.js depuis le catalogue serveur.
// À relancer après tout ajout d'exercices : node scripts/gen-muscle-map.mjs
import fs from "node:fs";
const { CATALOGUE } = await import("../api/_knowledge/exercices_catalogue.js");
const parGroupe = {};
CATALOGUE.forEach(e => { (parGroupe[e.groupe] = parGroupe[e.groupe] || []).push(e.n); });
const contenu = `// ─── TABLE EXERCICE → GROUPE MUSCULAIRE ─────────────────────────────────────
// GÉNÉRÉ depuis api/_knowledge/exercices_catalogue.js — ne pas éditer à la main.
// Régénérer avec : node scripts/gen-muscle-map.mjs

/** @type {Record<string, string[]>} */
export const GROUPE_EXERCICES = ${JSON.stringify(parGroupe, null, 0)};

/** @type {Record<string, string>} nom normalisé → groupe */
export const EXERCICE_GROUPE = (() => {
  const m = {};
  for (const [g, noms] of Object.entries(GROUPE_EXERCICES))
    for (const n of noms) m[n.toLowerCase()] = g;
  return m;
})();
`;
fs.writeFileSync(new URL("../src/data/muscleMap.js", import.meta.url), contenu);
console.log(`muscleMap.js régénéré : ${CATALOGUE.length} exercices`);
