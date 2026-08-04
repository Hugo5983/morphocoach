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

// ── parseJSON : troncature et JSON illisible ────────────────────────────────
const _ant = await import("../api/_lib/anthropic.js");
test("parseJSON répare les fences et les virgules terminales", () => {
  const o = _ant.parseJSON('```json\n{"a":[1,2,],"b":"x"}\n```');
  assert.deepEqual(o, { a: [1, 2], b: "x" });
});
test("parseJSON refuse un JSON irréparable avec un message lisible", () => {
  // Accolade fermante présente mais structure cassée au milieu : le cas que la
  // réparation ne peut pas rattraper honnêtement.
  assert.throws(
    () => _ant.parseJSON('{"a":[1 2 3],"b":}'),
    /illisible/i
  );
});
test("parseJSON rejette une réponse sans JSON du tout", () => {
  assert.throws(() => _ant.parseJSON('{"seances":[{"n":"Dev'), /Pas de JSON/i);
});

// ── Complétude du programme : le bug « 5 jours demandés, 2 générés » ────────
const _mkSeance = (jour) => ({ jour, exercices: Array.from({ length: 5 }, (_, i) =>
  ({ nom: "Développé haltères incliné 30°", series: "4", reps: "8-10" })) });

test("validate détecte un programme amputé (2 séances pour 5 jours)", () => {
  const parsed = { programme: { seances: [_mkSeance("Lundi"), _mkSeance("Mardi")] } };
  const pb = _gp.validateProgramme(parsed, {
    dossier: {}, fiche: null, materiel: ["halteres"],
    joursDemandes: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
  });
  assert.ok(pb.some(x => /incomplet/i.test(x)), "aucune alerte de complétude");
  assert.ok(pb.some(x => /2 séance/.test(x) && /5 jour/.test(x)));
});

test("validate accepte un programme complet", () => {
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const parsed = { programme: { seances: jours.map(_mkSeance) } };
  const pb = _gp.validateProgramme(parsed, {
    dossier: {}, fiche: null, materiel: ["halteres"], joursDemandes: jours,
  });
  assert.equal(pb.filter(x => /incomplet/i.test(x)).length, 0);
});

test("validate signale une séance trop pauvre", () => {
  const parsed = { programme: { seances: [{ jour: "Lundi", exercices: [{ nom: "Pompes standards" }] }] } };
  const pb = _gp.validateProgramme(parsed, {
    dossier: {}, fiche: null, materiel: ["poids de corps"], joursDemandes: ["Lundi"],
  });
  assert.ok(pb.some(x => /minimum 4/.test(x)));
});

test("le bassin de candidats grandit avec le nombre de jours", async () => {
  const cat = await import("../api/_knowledge/exercices_catalogue.js");
  const mat = ["halteres", "barre", "banc", "poulie", "machine"];
  const p3 = cat.selectCandidats({ materiel: mat, niveau: "intermediaire", max: 180 });
  const p5 = cat.selectCandidats({ materiel: mat, niveau: "intermediaire", max: 240 });
  assert.ok(p5.length > p3.length, "5 jours doit offrir plus de choix que 3");
  assert.ok(p3.length > 100, "bassin trop étroit pour 3 jours");
});

// ── Jours : abréviations du sélecteur → noms complets attendus par le modèle ─
test("les abréviations du sélecteur deviennent des noms complets", () => {
  assert.deepEqual(_gp.normalizeJours(["Lun", "Mar", "Jeu"]), ["Lundi", "Mardi", "Jeudi"]);
  assert.deepEqual(_gp.normalizeJours(["Lundi", "Vendredi"]), ["Lundi", "Vendredi"]);
  assert.deepEqual(_gp.normalizeJours([]), []);
});

// ── Catalogue : nouveau matériel et priorisation des correctifs ──────────────
const _cat = await import("../api/_knowledge/exercices_catalogue.js");

test("le catalogue inclut medecine ball et swiss ball", () => {
  const mats = new Set(_cat.CATALOGUE.map(e => e.mat));
  assert.ok(mats.has("medecine ball"));
  assert.ok(mats.has("swiss ball"));
  assert.ok(_cat.CATALOGUE.length > 700, `catalogue trop petit (${_cat.CATALOGUE.length})`);
});

test("une pathologie déclarée fait remonter les exercices correctifs", () => {
  const base = _cat.selectCandidats({ materiel: [], niveau: "intermediaire", max: 240 });
  const avec = _cat.selectCandidats({
    materiel: [], niveau: "intermediaire", max: 240, pathologies: ["Lombalgie"],
  });
  const nb = (l) => l.filter(e => e.cat === "correctif").length;
  assert.ok(nb(avec) > nb(base), `correctifs non priorisés (${nb(avec)} vs ${nb(base)})`);
});

test("les exercices de rééducation sont bien au catalogue", () => {
  ["McGill big 3 — bird dog", "Protocole Alfredson — excentrique mollet", "Spanish squat élastique"]
    .forEach(n => assert.ok(_cat.findInCatalogue(n), `absent : ${n}`));
});

// ── Icônes : tout nom référencé doit exister, sinon trou visuel ─────────────
const _fs = await import("node:fs");
const _iconSrc = _fs.readFileSync("src/components/ui/Icon.jsx", "utf8");
const _kitSrc  = _fs.readFileSync("src/features/ai/components/AnalyseIAKit.jsx", "utf8");

function _availableIcons(src) {
  const set = new Set();
  const pm = src.match(/const P\s*=\s*\{([\s\S]*?)\n\};/);
  if (pm) for (const m of pm[1].matchAll(/^\s*([A-Za-z0-9_]+)\s*:/gm)) set.add(m[1]);
  for (const am of src.matchAll(/ALIAS\s*=\s*\{([\s\S]*?)\}/g))
    for (const m of am[1].matchAll(/([A-Za-z0-9_]+)\s*:/g)) set.add(m[1]);
  return set;
}
function _usedIcons(src) {
  const set = new Set();
  for (const m of src.matchAll(/OI n="([^"]+)"/g)) set.add(m[1]);
  for (const bm of src.matchAll(/(GOAL_ICONS|EQUIP_ICONS|ZONE_ICONS)\s*=\s*\{([\s\S]*?)\}/g)) {
    for (const m of bm[2].matchAll(/:\s*'([^']+)'/g)) set.add(m[1]);
    for (const m of bm[2].matchAll(/:\s*"([^"]+)"/g)) set.add(m[1]);
  }
  return set;
}

test("aucune icône référencée n'est absente de la bibliothèque", () => {
  const avail = _availableIcons(_iconSrc);
  const missing = [..._usedIcons(_kitSrc)].filter(n => !avail.has(n));
  assert.deepEqual(missing, [], `icônes manquantes : ${missing.join(", ")}`);
});

test("muscle et barbell ne sont plus la même icône que dumbbell", () => {
  const duo = _iconSrc.match(/DUO_ALIAS\s*=\s*\{([\s\S]*?)\}/)[1];
  assert.ok(!/\bmuscle\s*:\s*"gym"/.test(duo), "muscle collisionne encore");
  assert.ok(!/\bbarbell\s*:\s*"gym"/.test(duo), "barbell collisionne encore");
});

// ── Catalogue complet + rééducation ciblée ──────────────────────────────────
test("le catalogue entier est injecté (aucun plafond)", () => {
  const tous = _cat.selectCandidats({ materiel: [], niveau: "avance", max: 9999 });
  assert.ok(tous.length >= 800, `seulement ${tous.length} exercices`);
});

test("chaque pathologie renvoie des correctifs ciblés", () => {
  for (const p of ["Hernie discale", "Coiffe rotateurs", "Ménisque",
                   "Épicondylite", "Tendinite Achille", "Coxarthrose", "Scoliose"]) {
    const r = _cat.correctifsPourPathologies([p], []);
    assert.ok(r.exercices.length >= 10, `${p} : ${r.exercices.length} correctifs`);
    assert.ok(r.groupes.length > 0, `${p} : aucune zone`);
  }
});

test("sans pathologie, aucun bloc rééducation", () => {
  assert.equal(_cat.correctifsPourPathologies([], []).exercices.length, 0);
  assert.equal(_cat.correctifsPourPathologies(["Aucune"], []).exercices.length, 0);
});

test("les correctifs ciblés respectent le matériel déclaré", () => {
  const r = _cat.correctifsPourPathologies(["Lombalgie"], ["poids_corps"]);
  assert.ok(r.exercices.length > 0);
  assert.ok(r.exercices.every(e => ["poids de corps", "accessoire"].includes(e.mat)),
    "matériel non disponible proposé");
});

// ── File de revue : les exercices inconnus sont capturés, pas perdus ────────
const _prop = await import("../api/_lib/proposals.js");

test("les exercices hors catalogue sont capturés pour revue", () => {
  const parsed = { programme: { seances: [{ jour: "Lundi", exercices: [
    { nom: "Développé haltères incliné 30°" },
    { nom: "Tirage Kelso" },
    { nom: "Curl araignée poulie" },
    { nom: "Pull-over haltère couché" },
  ] }] } };
  const pb = _gp.validateProgramme(parsed, {
    dossier: {}, fiche: null, materiel: ["halteres"], joursDemandes: ["Lundi"],
  });
  assert.deepEqual(pb.horsCatalogue, ["Tirage Kelso", "Curl araignée poulie"]);
});

test("un programme 100% catalogue ne remplit pas la file", () => {
  const parsed = { programme: { seances: [{ jour: "Lundi", exercices: [
    { nom: "Développé haltères incliné 30°" }, { nom: "Pull-over haltère couché" },
    { nom: "Écarté haltères plat" }, { nom: "Pompes standards" },
  ] }] } };
  const pb = _gp.validateProgramme(parsed, {
    dossier: {}, fiche: null, materiel: ["halteres"], joursDemandes: ["Lundi"],
  });
  assert.deepEqual(pb.horsCatalogue, []);
});

test("la normalisation de la file dédoublonne accents et casse", () => {
  assert.equal(_prop.normaliser("Développé Incliné 30°"), _prop.normaliser("developpe incline 30"));
});

// ── Analyse morphologique : une fiche vide doit être DÉTECTÉE ───────────────
const _morpho = await import("../api/_knowledge/morphologie.js");

function _obsVides() {
  const S = _morpho.SCHEMA_OBSERVATIONS;
  const raw = { leviers:{}, insertions:{}, physique:{}, proportions:{}, posture:[], repartition:{}, confiance:"moyenne" };
  return _morpho.validerObservations(raw);
}
function _obsRiches() {
  return _morpho.validerObservations({
    leviers:{ humerus:"long", femur:"long", avant_bras:"long", tibia:"moyen", clavicules:"larges", torse:"long" },
    insertions:{ biceps:"haute", mollets:"hautes", pectoraux:"normales", ischios:"normales" },
    physique:{ morphotype:"ectomorphe", adiposite:"faible", masse_musculaire:"moyenne" },
    proportions:{ taille_hanches:"v", epaules_hanches:"larges" },
    posture:["cyphose"],
    // Une analyse SÉRIEUSE se prononce sur les 10 groupes ("equilibre" compte
    // comme une observation, pas comme une abstention).
    repartition:{ quadriceps:"equilibre", ischios:"equilibre", mollets:"en_retard",
      pectoraux:"en_retard", dos_largeur:"dominant", dos_epaisseur:"equilibre",
      epaules:"en_retard", biceps:"equilibre", triceps:"equilibre", abdos:"equilibre" },
    confiance:"haute",
  });
}

test("une analyse riche produit des conséquences exploitables", () => {
  const c = _morpho.deriverConsequences(_obsRiches());
  assert.ok(c.lecture_coach.length > 0, "aucune lecture coach");
  assert.ok(c.exercices_privilegies.length > 0, "aucun exercice privilégié");
  assert.ok(c.points_faibles_visuels.length > 0, "aucun point faible détecté");
});

test("une analyse tout-indetermine donne une fiche vide (à signaler)", () => {
  const obs = _obsVides();
  const c = _morpho.deriverConsequences(obs);
  assert.equal(c.lecture_coach.length, 0);
  assert.equal(c.points_faibles_visuels.length, 0);
  // C'est ce cas qui doit lever le drapeau `vide` côté API.
  const traits = [
    ...Object.values(obs.leviers), ...Object.values(obs.insertions),
    ...Object.values(obs.physique), ...Object.values(obs.proportions),
    ...Object.values(obs.repartition),
  ];
  assert.equal(traits.filter(v => v && v !== "indetermine").length, 0);
});

test("le taux d'exploitabilité distingue une bonne d'une mauvaise analyse", () => {
  const calc = (obs) => {
    const traits = [
      ...Object.values(obs.leviers), ...Object.values(obs.insertions),
      ...Object.values(obs.physique), ...Object.values(obs.proportions),
      ...Object.values(obs.repartition),
    ];
    return Math.round(traits.filter(v => v && v !== "indetermine").length / traits.length * 100);
  };
  assert.equal(calc(_obsVides()), 0);
  assert.ok(calc(_obsRiches()) > 50, "analyse riche mal notée");
});

// ── GARANTIE : tout trait observé atteint le prompt ─────────────────────────
// Construit un profil où CHAQUE trait a une valeur valide tirée du schéma,
// puis vérifie qu'aucune valeur ne se perd dans le bloc envoyé au modèle.
function _obsCompletes() {
  const S = _morpho.SCHEMA_OBSERVATIONS;
  const first = (arr) => arr.find(v => v !== "indetermine");
  const raw = { leviers: {}, insertions: {}, physique: {}, proportions: {},
                posture: S.posture.items.slice(0, 2), repartition: {}, confiance: "haute" };
  for (const [k, allowed] of Object.entries(S.leviers))     raw.leviers[k]     = first(allowed);
  for (const [k, allowed] of Object.entries(S.insertions))  raw.insertions[k]  = first(allowed);
  for (const [k, allowed] of Object.entries(S.physique))    raw.physique[k]    = first(allowed);
  for (const [k, allowed] of Object.entries(S.proportions)) raw.proportions[k] = first(allowed);
  for (const g of S.repartition.groupes)                    raw.repartition[g] = first(S.repartition.valeurs);
  return _morpho.validerObservations(raw);
}

test("AUCUN trait morphologique observé ne se perd avant le prompt", () => {
  const obs = _obsCompletes();
  const bloc = _gp.formatObservations(obs);
  const manquants = [];
  for (const cat of ["leviers", "insertions", "physique", "proportions", "repartition"]) {
    for (const [k, v] of Object.entries(obs[cat] || {})) {
      if (!v || v === "indetermine") continue;
      // la valeur doit apparaître dans le bloc (underscores rendus en espaces)
      if (!bloc.includes(String(v).replace(/_/g, " "))) manquants.push(`${cat}.${k}=${v}`);
    }
  }
  assert.deepEqual(manquants, [], `traits perdus : ${manquants.join(", ")}`);
  for (const p of obs.posture) {
    assert.ok(bloc.includes(p.replace(/_/g, " ")), `posture perdue : ${p}`);
  }
});

test("les six familles de traits sont toutes présentes dans le bloc", () => {
  const bloc = _gp.formatObservations(_obsCompletes());
  ["LEVIERS OSSEUX", "INSERTIONS", "PHYSIQUE", "PROPORTIONS", "POSTURE",
   "DÉVELOPPEMENT PAR GROUPE"].forEach(s =>
    assert.ok(bloc.includes(s), `section absente : ${s}`));
});

test("les traits indéterminés n'encombrent pas le prompt", () => {
  const vide = _morpho.validerObservations({ confiance: "faible" });
  assert.equal(_gp.formatObservations(vide), "");
  assert.equal(_gp.formatObservations(null), "");
});

// ── Fusion Supabase → local : ne JAMAIS écraser une donnée locale plus riche ─
// (réplique la logique de fusionnerJournal de syncService, testée isolément)
function _fusion(local, distant) {
  const out = { ...distant, ...local };
  for (const [jour, dist] of Object.entries(distant || {})) {
    const loc = local?.[jour];
    if (!loc) { out[jour] = dist; continue; }
    out[jour] = (dist?.sets || []).length > (loc?.sets || []).length ? dist : loc;
  }
  return out;
}

test("la restauration comble les jours absents en local", () => {
  const local   = { "2026-08-01": { sets: [1, 2, 3] } };
  const distant = { "2026-07-28": { sets: [1, 2] }, "2026-07-30": { sets: [1] } };
  const f = _fusion(local, distant);
  assert.equal(Object.keys(f).length, 3);
  assert.ok(f["2026-07-28"] && f["2026-08-01"]);
});

test("une séance locale plus riche n'est jamais écrasée", () => {
  const local   = { "2026-08-01": { sets: [1, 2, 3, 4, 5] } };
  const distant = { "2026-08-01": { sets: [1, 2] } };
  assert.equal(_fusion(local, distant)["2026-08-01"].sets.length, 5);
});

test("une séance distante plus complète remplace une locale partielle", () => {
  const local   = { "2026-08-01": { sets: [1] } };
  const distant = { "2026-08-01": { sets: [1, 2, 3, 4] } };
  assert.equal(_fusion(local, distant)["2026-08-01"].sets.length, 4);
});

test("un local vide est intégralement réamorcé", () => {
  const distant = { "2026-07-28": { sets: [1, 2] }, "2026-07-30": { sets: [1] } };
  assert.equal(Object.keys(_fusion({}, distant)).length, 2);
});

console.log(`\n${n} tests de fumée OK`);
