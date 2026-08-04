// Régénère src/data/catalogue.js depuis le catalogue serveur.
// À relancer après tout ajout d'exercices : node scripts/gen-muscle-map.mjs
//
// Pourquoi un catalogue CLIENT : la substitution d'exercice et le calcul du
// volume par muscle doivent fonctionner hors ligne, sans appel serveur et sans
// IA. Format tabulaire compact (~75 ko) plutôt qu'un tableau d'objets, pour
// éviter de répéter les noms de champs 812 fois.
import fs from "node:fs";
const { CATALOGUE } = await import("../api/_knowledge/exercices_catalogue.js");

const rows = CATALOGUE.map(e => [e.n, e.groupe, e.mat, e.cat, e.niveau || "", e.parent || ""]);

const contenu = `// ─── CATALOGUE CLIENT ───────────────────────────────────────────────────────
// GÉNÉRÉ depuis api/_knowledge/exercices_catalogue.js — ne pas éditer à la main.
// Régénérer : node scripts/gen-muscle-map.mjs
//
// Format tabulaire : [nom, groupe, materiel, categorie, niveau, parent]
// Le champ "parent" relie les variantes d'un même mouvement : c'est lui qui
// permet de proposer la substitution la plus proche.

/** @type {[string,string,string,string,string,string][]} */
export const ROWS = ${JSON.stringify(rows)};

/** @typedef {{n:string,groupe:string,mat:string,cat:string,niveau:string,parent:string}} Exo */

/** @type {Exo[]} */
export const CATALOGUE = ROWS.map(([n, groupe, mat, cat, niveau, parent]) =>
  ({ n, groupe, mat, cat, niveau, parent }));

/** @type {Record<string,string>} nom minuscule → groupe */
export const EXERCICE_GROUPE = (() => {
  const m = {};
  for (const [n, g] of ROWS) m[n.toLowerCase()] = g;
  return m;
})();

/** @type {Record<string,Exo>} nom minuscule → exercice complet */
export const PAR_NOM = (() => {
  const m = {};
  for (const e of CATALOGUE) m[e.n.toLowerCase()] = e;
  return m;
})();
`;
fs.writeFileSync(new URL("../src/data/catalogue.js", import.meta.url), contenu);
console.log(`catalogue.js régénéré : ${CATALOGUE.length} exercices, ${Math.round(contenu.length/1024)} ko`);
