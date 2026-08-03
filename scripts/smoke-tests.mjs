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

// ── recoveryService : métriques de récupération (jamais de donnée inventée) ──
const _store = {};
globalThis.localStorage = {
  getItem: k => _store[k] ?? null,
  setItem: (k, v) => { _store[k] = String(v); },
};
const rec = await import("../src/services/recoveryService.js");
const _dk = (o) => { const d = new Date(); d.setDate(d.getDate() - o); return d.toISOString().split("T")[0]; };

test("volume : aucune séance validée → available=false, pas de chiffre", () => {
  const v = rec.getWeeklyVolume();
  assert.equal(v.available, false);
  assert.equal(v.totalSets, 0);
});

test("volume : compte les séries RÉELLES, pas séries × reps du programme", () => {
  // La fenêtre est lundi → aujourd'hui : on construit le log DANS cette
  // fenêtre quel que soit le jour d'exécution (un lundi, une seule séance
  // est possible dans la semaine en cours).
  const dow = (new Date().getDay() + 6) % 7;   // 0 = lundi
  const log = {
    [_dk(0)]: { sets: [
      ...Array(5).fill({ exNom: "Développé haltères incliné 30°", kg: 30, reps: 10 }),
      ...Array(3).fill({ exNom: "Pull-over haltère couché", kg: 20, reps: 12 }),
    ], totalVolume: 2220 },
  };
  let expSets = 8, expSessions = 1;
  if (dow >= 2) {
    log[_dk(2)] = { sets: Array(4).fill({ exNom: "Développé haltères incliné 30°", kg: 32, reps: 10 }), totalVolume: 1280 };
    expSets = 12; expSessions = 2;
  }
  _store["morpho_workout_log"] = JSON.stringify(log);
  const v = rec.getWeeklyVolume();
  assert.equal(v.totalSets, expSets);       // des séries, pas des répétitions
  assert.equal(v.sessions, expSessions);
  const pecs = v.byMuscle.find(g => g.groupe === "Pectoraux");
  assert.equal(pecs.sets, expSets);
  assert.equal(pecs.landmarks.MRV, 22);
  assert.equal(pecs.statut, "optimal");     // 8-12 séries : entre MEV 8 et MRV 22
});

test("volume : dépassement du MRV détecté", () => {
  _store["morpho_workout_log"] = JSON.stringify({
    [_dk(0)]: { sets: Array(25).fill({ exNom: "Développé haltères incliné 30°", kg: 30, reps: 10 }), totalVolume: 7500 },
  });
  assert.equal(rec.getWeeklyVolume().globalStatus, "au-dessus");
});

test("performance : 1 seule séance → pas de « +0 % » inventé", () => {
  _store["morpho_workout_log"] = JSON.stringify({
    [_dk(0)]: { sets: [{ exNom: "Développé haltères incliné 30°", kg: 34, reps: 10 }], totalVolume: 340 },
  });
  const p = rec.getPerformanceTrend();
  assert.equal(p.available, false);
  assert.match(p.reason, /2 séances/);
});

test("performance : 32 kg → 34 kg donne une hausse chiffrée", () => {
  _store["morpho_workout_log"] = JSON.stringify({
    [_dk(7)]: { sets: [{ exNom: "Développé haltères incliné 30°", kg: 32, reps: 10 }], totalVolume: 320 },
    [_dk(0)]: { sets: [{ exNom: "Développé haltères incliné 30°", kg: 34, reps: 10 }], totalVolume: 340 },
  });
  const p = rec.getPerformanceTrend();
  assert.equal(p.available, true);
  assert.equal(p.trend, "hausse");
  assert.ok(p.avgDelta > 5 && p.avgDelta < 7);
});

test("sommeil : cible dérivée de l'âge, indisponible sans âge", () => {
  assert.equal(rec.getSleepTarget(30).target, 7);
  assert.equal(rec.getSleepTarget(16).target, 8);
  assert.equal(rec.getSleepTarget(70).max, 8);
  assert.equal(rec.getSleepTarget(null).available, false);
});

test("FC de repos : valeur aberrante rejetée, ligne de base après 5 mesures", () => {
  assert.equal(rec.saveRestingHR(300), false);
  assert.equal(rec.getRestingHR().available, false);
  rec.saveRestingHR(58);
  assert.equal(rec.getRestingHR().partial, true);
  for (let i = 1; i < 30; i++) rec.saveRestingHR(56, _dk(i));
  for (let i = 0; i < 5; i++)  rec.saveRestingHR(64, _dk(i));
  const hr = rec.getRestingHR();
  assert.equal(hr.partial, false);
  assert.ok(hr.delta >= 4);
});

test("score : aucune donnée → pas de score, sinon couverture annoncée", () => {
  delete _store["morpho_hr_log"]; delete _store["morpho_sleep_log"];
  delete _store["morpho_workout_log"]; delete _store["morpho_mobilite_log"];
  assert.equal(rec.getRecoveryScore({ age: 30 }).available, false);
  _store["morpho_sleep_log"] = JSON.stringify(
    Object.fromEntries(Array.from({ length: 7 }, (_, i) => [_dk(i), 8])));
  const s = rec.getRecoveryScore({ age: 30 });
  assert.equal(s.available, true);
  assert.equal(s.coverage, 35);              // sommeil seul
  assert.ok(s.missing.includes("fcRepos"));
});

test("surentraînement : pas de statut sans signal, alertes justifiées sinon", () => {
  delete _store["morpho_sleep_log"]; delete _store["morpho_hr_log"];
  assert.equal(rec.getOvertrainingStatus({ age: 30 }).available, false);
  _store["morpho_sleep_log"] = JSON.stringify(
    Object.fromEntries(Array.from({ length: 7 }, (_, i) => [_dk(i), 5])));
  for (let i = 1; i < 30; i++) rec.saveRestingHR(56, _dk(i));
  for (let i = 0; i < 5; i++)  rec.saveRestingHR(66, _dk(i));
  const o = rec.getOvertrainingStatus({ age: 30 });
  assert.ok(o.warnings.length >= 2);
  assert.ok(["surveillance", "fatigue", "risque"].includes(o.key));
  assert.ok(o.warnings.every(w => w.length > 10));
});

// ── Architecture asynchrone : le cœur partagé et le stockage de jobs ─────────
const _gp = await import("../api/generate-program.js");
test("generate-program exporte runGeneration (partagé sync/async)", () => {
  assert.equal(typeof _gp.runGeneration, "function");
  assert.equal(typeof _gp.default, "function");
});
const _jobs = await import("../api/_lib/jobs.js");
test("jobs.js expose createJob/getJob/completeJob/failJob", () => {
  ["createJob", "getJob", "completeJob", "failJob"].forEach(k =>
    assert.equal(typeof _jobs[k], "function"));
});

console.log(`\n${n} tests de fumée OK`);
