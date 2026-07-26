// ─── scripts/gen-catalogue.mjs ───────────────────────────────────────────────
// Génère api/_knowledge/exercices_catalogue.js depuis src/data/exercises.js.
// À relancer après toute modification de la bibliothèque d'exercices :
//   node scripts/gen-catalogue.mjs
import { EX } from "../src/data/exercises.js";
import fs from "node:fs";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// Déduit le matériel d'une variante depuis son nom, sinon hérite du parent.
const MAT_HINTS = [
  [/poulie|cable|c\u00e2ble/i, "poulie"], [/machine|convergente|smith/i, "machine"],
  [/barre(?!.*traction)|\bez\b/i, "barre"], [/halt[e\u00e8]re/i, "haltères"],
  [/[\u00e9e]lastique|bande/i, "élastique"], [/trx|suspension/i, "TRX"],
  [/kettlebell/i, "kettlebell"],
];
function inferMat(nom, parentMat) {
  for (const [re, m] of MAT_HINTS) if (re.test(nom)) return m;
  return parentMat || "poids de corps";
}

const out = [];
for (const [groupe, exos] of Object.entries(EX)) {
  for (const e of exos) {
    out.push({ n: e.n, groupe, mat: e.mat || "poids de corps", cat: e.cat || "principal", niveau: null, parent: null });
    for (const v of e.variantes || []) {
      out.push({ n: v.nom, groupe, mat: inferMat(v.nom, e.mat), cat: e.cat || "principal",
                 niveau: v.niveau || null, parent: e.n });
    }
  }
}
const seen = new Map();
for (const e of out) { const k = norm(e.n); if (!seen.has(k)) seen.set(k, e); }
const entries = [...seen.values()];

const HEADER = [
  "// ─── KNOWLEDGE : CATALOGUE D'EXERCICES (généré) ─────────────────────────────",
  "// ⚠ FICHIER GÉNÉRÉ depuis src/data/exercises.js — ne pas éditer à la main.",
  "//    Régénération : node scripts/gen-catalogue.mjs",
  `// Index serveur des ${entries.length} noms reconnus (exercices + variantes) avec`,
  "// groupe musculaire, matériel et niveau. Sert à :",
  "//   1. injecter dans le prompt une liste FERMÉE de candidats compatibles avec",
  "//      le matériel et le niveau de l'athlète (fin des noms inventés) ;",
  "//   2. valider après génération que chaque exercice existe et respecte le",
  "//      matériel déclaré.",
  "",
].join("\n");

const BODY = `export const CATALOGUE = ${JSON.stringify(entries)};

const norm = (s) => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\\s+/g, " ").trim();

export const INDEX = new Map(CATALOGUE.map((e) => [norm(e.n), e]));

/** Retrouve une entrée du catalogue depuis un nom généré (exact puis inclusif). */
export function findInCatalogue(nom) {
  const k = norm(nom);
  if (!k) return null;
  if (INDEX.has(k)) return INDEX.get(k);
  for (const [key, e] of INDEX) {
    if (key.length >= 8 && (k.includes(key) || key.includes(k))) return e;
  }
  return null;
}

// Matériel du formulaire (AnalyseIA) → matériels du catalogue autorisés.
// "poids de corps" et "accessoire" sont toujours réalisables.
const BASE = ["poids de corps", "accessoire"];
export const MAP_EQUIPEMENT = {
  salle_complete: ["haltères", "barre", "poulie", "machine", "élastique", "TRX", "kettlebell", "bosu", ...BASE],
  halteres:       ["haltères", ...BASE],
  machines:       ["machine", "poulie", ...BASE],
  elastiques:     ["élastique", ...BASE],
  poids_corps:    [...BASE],
  barre_traction: [...BASE],
};

/** Matériels autorisés pour une sélection du formulaire (vide → salle complète). */
export function matsAutorises(materiel = []) {
  if (!materiel.length) return new Set(MAP_EQUIPEMENT.salle_complete);
  const s = new Set();
  for (const id of materiel) for (const m of (MAP_EQUIPEMENT[id] || BASE)) s.add(m);
  return s;
}

const ORDRE_NIVEAU = { "Débutant": 0, "Intermédiaire": 1, "Avancé": 2 };

/**
 * Sélectionne les candidats à injecter dans le prompt.
 * Filtre matériel + niveau, garantit la présence des exercices à conserver et
 * des privilégiés morpho (s'ils sont compatibles matériel), couvre tous les
 * groupes, plafonne la taille pour maîtriser le budget tokens.
 */
export function selectCandidats({ materiel = [], niveau = "intermediaire", aConserver = [], privilegies = [], max = 70 } = {}) {
  const mats = matsAutorises(materiel);
  const nivMax = niveau === "debutant" ? 0 : niveau === "intermediaire" ? 1 : 2;
  const forced = new Set([...aConserver, ...privilegies].map(norm).filter(Boolean));

  const pool = CATALOGUE.filter((e) => {
    if (!mats.has(e.mat)) return false;
    if (e.niveau && ORDRE_NIVEAU[e.niveau] > nivMax) return false;
    return true;
  });

  const byGroupe = {};
  for (const e of pool) (byGroupe[e.groupe] = byGroupe[e.groupe] || []).push(e);

  const picked = [];
  const pickedKeys = new Set();
  const push = (e) => { const k = norm(e.n); if (!pickedKeys.has(k)) { pickedKeys.add(k); picked.push(e); } };

  for (const e of pool) if (forced.has(norm(e.n))) push(e);
  const parGroupe = Math.max(3, Math.floor((max - picked.length) / Math.max(1, Object.keys(byGroupe).length)));
  for (const g of Object.keys(byGroupe)) {
    const list = byGroupe[g].slice().sort((a, b) => (a.parent ? 1 : 0) - (b.parent ? 1 : 0));
    let n = 0;
    for (const e of list) {
      if (n >= parGroupe || picked.length >= max) break;
      if (!pickedKeys.has(norm(e.n))) { push(e); n++; }
    }
  }
  return picked.slice(0, max);
}
`;

fs.writeFileSync(new URL("../api/_knowledge/exercices_catalogue.js", import.meta.url), HEADER + BODY, "utf8");
console.log(`OK api/_knowledge/exercices_catalogue.js — ${entries.length} entrées`);
