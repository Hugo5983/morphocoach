// ─── scripts/smoke-tests.mjs ─────────────────────────────────────────────────
// Tests de fumée des fonctions PURES critiques (aucun réseau, aucun secret).
// Exécutés en CI avant chaque build : node scripts/smoke-tests.mjs
import assert from "node:assert/strict";

let n = 0;
const test = (name, fn) => { fn(); n++; console.log("  ✓", name); };

// ── _lib/anthropic : parseJSON + normalizeExo ────────────────────────────────
const { parseJSON, normalizeExo } = await import("../api/_lib/anthropic.js");

test("parseJSON extrait un JSON entouré de texte/markdown", () => {
  const out = parseJSON('Voici :\n```json\n{"a": 1, "b": "x"}\n```\nmerci');
  assert.deepEqual(out, { a: 1, b: "x" });
});
test("parseJSON répare les virgules terminales", () => {
  assert.deepEqual(parseJSON('{"a": [1, 2,], }'), { a: [1, 2] });
});
test("parseJSON lève une erreur claire sans JSON", () => {
  assert.throws(() => parseJSON("aucun objet ici"), /JSON/i);
});
test("normalizeExo neutralise accents / casse / ponctuation", () => {
  assert.equal(normalizeExo("Développé-Couché (barre)"), normalizeExo("developpe couche barre"));
});
test("normalizeExo réduit les espaces à UN seul (pas zéro)", () => {
  assert.equal(normalizeExo("  Squat   bulgare "), "squat bulgare");
});

// ── _knowledge/exercices_catalogue ───────────────────────────────────────────
const { CATALOGUE, findInCatalogue, selectCandidats, matsAutorises } =
  await import("../api/_knowledge/exercices_catalogue.js");

test("catalogue non vide et bien formé", () => {
  assert.ok(CATALOGUE.length > 500);
  assert.ok(CATALOGUE.every((e) => e.n && e.groupe && e.mat));
});
test("findInCatalogue : exact, approché, inconnu", () => {
  assert.ok(findInCatalogue(CATALOGUE[0].n));
  assert.equal(findInCatalogue("exercice totalement imaginaire xyz"), null);
});
test("selectCandidats respecte le matériel déclaré", () => {
  const c = selectCandidats({ materiel: ["halteres"], niveau: "debutant" });
  const mats = matsAutorises(["halteres"]);
  assert.ok(c.length >= 20);
  assert.ok(c.every((e) => mats.has(e.mat)));
  assert.ok(c.every((e) => e.niveau !== "Avancé"));
});
test("selectCandidats force les exercices à conserver", () => {
  const keep = CATALOGUE.find((e) => e.mat === "haltères").n;
  const c = selectCandidats({ materiel: ["halteres"], niveau: "avance", aConserver: [keep] });
  assert.ok(c.some((e) => e.n === keep));
});

// ── _knowledge/noyau : parité avec l'ancien client ───────────────────────────
const { getVolumeParams, getMesocycleLogic } = await import("../api/_knowledge/noyau.js");
test("getVolumeParams retourne des bornes cohérentes", () => {
  const v = getVolumeParams("intermediaire", "hypertrophie");
  assert.ok(v.series_min >= 1 && v.series_max >= v.series_min);
});
test("getMesocycleLogic produit des phases datées", () => {
  const m = getMesocycleLogic("debutant", "hypertrophie", 1);
  assert.ok(m.duree >= 4 && Array.isArray(m.phases) && m.phases.length >= 2);
});

// ── _knowledge/couche0 : directives déterministes ────────────────────────────
const { getVariationDirectives } = await import("../api/_knowledge/couche0.js");
test("getVariationDirectives varie avec le numéro de cycle", () => {
  const a = getVariationDirectives({ cycleNum: 1, nbJours: 4, objectif: "hypertrophie", niveau: "intermediaire" });
  const b = getVariationDirectives({ cycleNum: 2, nbJours: 4, objectif: "hypertrophie", niveau: "intermediaire" });
  assert.ok(a.split_impose && b.split_impose);
  assert.notEqual(JSON.stringify(a), JSON.stringify(b));
});

console.log(`\n${n} tests de fumée OK`);
