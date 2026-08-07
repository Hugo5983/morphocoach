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
test("parseJSON répare une réponse tronquée en pleine chaîne", () => {
  // Cas réel : la génération aboutit mais le JSON s'arrête au milieu d'un
  // tips_coach. On récupère ce qui est complet plutôt que de tout perdre.
  const o = _ant.parseJSON(
    '{"programme":{"seances":[{"jour":"Lundi","tips":"garde le dos dro');
  assert.ok(o.programme?.seances?.length >= 1, "aucune séance récupérée");
  assert.equal(o.programme.seances[0].jour, "Lundi");
});

test("parseJSON ignore la ponctuation À L'INTÉRIEUR des chaînes", () => {
  // L'ancien comptage par regex cassait dès qu'un texte contenait { ou }.
  const o = _ant.parseJSON('{"tips":"place {le coude} bas [vraiment]","b":1}');
  assert.equal(o.tips, "place {le coude} bas [vraiment]");
  assert.equal(o.b, 1);
});

test("parseJSON gère les échappements sans se perdre", () => {
  // Un guillemet échappé à l'intérieur d'une chaîne ne doit pas être lu comme
  // une fin de chaîne, sinon tout le comptage de structures dérive.
  const o = _ant.parseJSON(String.raw`{"a":"guillemet \" et antislash \\","b":2}`);
  assert.equal(o.b, 2);
  assert.ok(o.a.includes("guillemet"));
});

test("parseJSON rejette une réponse sans aucun JSON", () => {
  assert.throws(() => _ant.parseJSON("Je ne peux pas répondre."), /Pas de JSON/i);
  assert.throws(() => _ant.parseJSON(""), /vide/i);
});

test("un programme réparé mais AMPUTÉ est détecté par la validation", () => {
  // La réparation ne doit jamais faire passer un programme incomplet pour bon :
  // c'est la validation qui doit déclencher la passe corrective.
  const tronque = '{"programme":{"seances":['
    + '{"jour":"Lundi","exercices":[{"nom":"Développé haltères incliné 30°"},'
    + '{"nom":"Pull-over haltère couché"},{"nom":"Écarté haltères plat"},'
    + '{"nom":"Pompes standards"}]},'
    + '{"jour":"Mardi","exercices":[{"nom":"Rowing barre 45°"';
  const o = _ant.parseJSON(tronque);
  assert.equal(o.programme.seances.length, 2);
  const pb = _gp.validateProgramme(o, { dossier: {}, fiche: null, materiel: ["halteres"],
    joursDemandes: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"] });
  assert.ok(pb.some(x => /incomplet/i.test(x)),
    "un programme amputé est passé pour complet");
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

// ── Champs autrefois ignorés : métier, masse grasse, durée de séance ────────
const _gpSrc = _fs.readFileSync("api/generate-program.js", "utf8");
const _aiSrc = _fs.readFileSync("src/features/ai/AnalyseIA.jsx", "utf8");

test("le métier atteint le prompt et est saisissable", () => {
  assert.ok(/form\.metier/.test(_gpSrc), "metier absent du prompt serveur");
  assert.ok(/metierBlock/.test(_gpSrc), "bloc métier non injecté");
  // Un champ dans l'état sans input serait toujours vide : vérifier la saisie.
  assert.ok(/setForm\(\{\.\.\.form,metier:/.test(_aiSrc), "aucun champ de saisie métier");
});

test("la masse grasse estimée est calculée et transmise", () => {
  assert.ok(/Deurenberg/.test(_gpSrc), "formule absente");
  assert.ok(/Masse grasse estimée/.test(_gpSrc), "non injectée dans le profil");
  // Doit être présentée comme une ESTIMATION, jamais comme une mesure.
  assert.ok(/PAS une mesure/.test(_gpSrc), "avertissement d'estimation manquant");
});

test("la durée de séance est collectée, bornée et contraignante", () => {
  assert.ok(/dureeSeance: 60/.test(_aiSrc), "valeur par défaut absente");
  assert.ok(/setForm\(\{\.\.\.form,dureeSeance:/.test(_aiSrc), "aucun sélecteur de durée");
  assert.ok(/dureeCible/.test(_gpSrc), "durée absente du prompt");
  assert.ok(/DURÉE CIBLE PAR SÉANCE/.test(_gpSrc), "contrainte non formulée");
});

test("le repère d'exercices correspond à la formule de durée de l'app", () => {
  // formule client : Σ séries × (repos + 60) — cf. src/utils/training.js
  for (const d of [45, 60, 75, 90]) {
    const nbExos = Math.max(4, Math.round(d / 10));
    const reelle = (nbExos * 4 * (90 + 60)) / 60;
    assert.ok(Math.abs(reelle - d) <= d * 0.15,
      `${d} min → ${nbExos} exos = ${reelle} min, hors tolérance`);
  }
});

// ── Prescription : chaque objectif produit un programme RÉELLEMENT différent ─
const _presc = await import("../api/_knowledge/prescription.js");

test("force et hypertrophie ont des prescriptions distinctes", () => {
  const f = _presc.getPrescription("force");
  const h = _presc.getPrescription("hypertrophie");
  ["intensite", "reps", "tempo", "repos", "logique"].forEach(champ =>
    assert.notEqual(f[champ], h[champ], `champ identique : ${champ}`));
});

test("les six objectifs sont tous différenciés (aucun doublon)", () => {
  const objectifs = ["force", "hypertrophie", "perte_poids", "prep_physique", "sante", "reathletisation"];
  const signatures = objectifs.map(o => {
    const p = _presc.getPrescription(o);
    return `${p.intensite}|${p.reps}|${p.tempo}|${p.repos}`;
  });
  assert.equal(new Set(signatures).size, objectifs.length, "au moins deux objectifs identiques");
});

test("chaque prescription porte repos, tempo, intensité et interdits", () => {
  for (const o of ["force", "hypertrophie", "perte_poids", "prep_physique", "sante", "reathletisation"]) {
    const p = _presc.getPrescription(o);
    ["intensite", "reps", "tempo", "repos", "series", "logique", "methodes", "exercices"]
      .forEach(c => assert.ok(p[c] && p[c].length >= 4, `${o}.${c} vide`));
    assert.ok(Array.isArray(p.interdits) && p.interdits.length >= 2, `${o} : interdits manquants`);
  }
});

test("la force impose des repos longs, l'hypertrophie des repos courts", () => {
  assert.match(_presc.getPrescription("force").repos, /3 à 5 min/);
  assert.match(_presc.getPrescription("hypertrophie").repos, /45-90 s|90 s/);
});

test("le nombre d'exercices s'adapte aux repos de l'objectif", () => {
  // À durée égale, la force (repos longs) tient MOINS d'exercices que la perte de poids.
  const f = _presc.calibrerSeance("force", 60);
  const p = _presc.calibrerSeance("perte_poids", 60);
  assert.ok(f.max < p.min, `force ${f.min}-${f.max} vs perte_poids ${p.min}-${p.max}`);
  // Une séance courte en force doit lever une alerte de compatibilité.
  const c = _presc.calibrerSeance("force", 45);
  assert.ok(c.alerte, "aucune alerte sur force 45 min");
  // L'alerte doit annoncer la MÊME fourchette que la consigne.
  assert.ok(c.alerte.includes(`${c.min} à ${c.max}`),
    `alerte incohérente : annonce autre chose que ${c.min}-${c.max}`);
  assert.equal(_presc.calibrerSeance("hypertrophie", 75).alerte, null);
});

test("un objectif inconnu retombe sur l'hypertrophie sans planter", () => {
  const p = _presc.getPrescription("objectif_inexistant");
  assert.ok(p && p.reps);
  assert.equal(p.reps, _presc.getPrescription("hypertrophie").reps);
});

// ── Adaptations morphologiques : individualisation réelle ───────────────────
const _adapt = await import("../api/_knowledge/adaptations.js");

function _fiche(obs) { return { observations: _morpho.validerObservations(obs) }; }

const _grandGabarit = _fiche({
  leviers:{femur:"long",humerus:"long",avant_bras:"long",cage_thoracique:"plate",
           clavicules:"etroites",bassin:"etroit",tibia:"court"},
  insertions:{biceps:"haute",mollets:"haute",ischios:"haute",pectoraux:"moyenne",
              abdominaux:"moyenne",avant_bras:"moyenne"},
  physique:{masse_grasse_visuelle:"sec",densite_musculaire:"intermediaire",repartition_graisse:"androide"},
  proportions:{rapport_tronc_jambes:"jambes_longues",symetrie_gauche_droite:"bras_droit_dominant",
               rapport_epaules_taille:"vtaper_faible",position_pieds_naturelle:"paralleles"},
  posture:["cyphose"],
  repartition:{pectoraux:"en_retard",triceps:"en_retard",mollets:"en_retard",epaules:"equilibre",
               biceps:"equilibre",quadriceps:"equilibre",ischios:"equilibre",dos_largeur:"equilibre",
               dos_epaisseur:"equilibre",abdos:"equilibre"},
  confiance:"haute" });

const _petitGabarit = _fiche({
  leviers:{femur:"court",humerus:"court",avant_bras:"court",cage_thoracique:"bombee",
           clavicules:"larges",bassin:"large",tibia:"long"},
  insertions:{biceps:"basse",mollets:"basse",ischios:"basse",pectoraux:"moyenne",
              abdominaux:"moyenne",avant_bras:"moyenne"},
  physique:{masse_grasse_visuelle:"moyen",densite_musculaire:"developpe",repartition_graisse:"mixte"},
  proportions:{rapport_tronc_jambes:"tronc_long",symetrie_gauche_droite:"symetrique",
               rapport_epaules_taille:"vtaper_prononce",position_pieds_naturelle:"paralleles"},
  posture:[],
  repartition:{pectoraux:"dominant",triceps:"equilibre",mollets:"equilibre",epaules:"equilibre",
               biceps:"equilibre",quadriceps:"dominant",ischios:"equilibre",dos_largeur:"equilibre",
               dos_epaisseur:"equilibre",abdos:"equilibre"},
  confiance:"haute" });

test("deux morphologies opposées produisent des adaptations opposées", () => {
  const a = _adapt.selectAdaptations(_grandGabarit, { age: 27, sexe: "homme" });
  const b = _adapt.selectAdaptations(_petitGabarit, { age: 27, sexe: "homme" });
  assert.ok(a.regles.length >= 8, `grand gabarit : ${a.regles.length} règles`);
  assert.ok(b.regles.length >= 4, `petit gabarit : ${b.regles.length} règles`);
  const ids = (r) => new Set(r.regles.map(x => x.id));
  assert.ok(ids(a).has("femur_long_squat"), "fémur long non détecté");
  assert.ok(ids(b).has("femur_court_squat"), "fémur court non détecté");
  // Aucune règle commune sur le squat : l'individualisation est réelle.
  assert.ok(!ids(b).has("femur_long_squat") && !ids(a).has("femur_court_squat"));
});

test("l'âge et le sexe déclenchent leurs propres règles", () => {
  const jeune = _adapt.selectAdaptations(_petitGabarit, { age: 27, sexe: "homme" });
  const senior = _adapt.selectAdaptations(_petitGabarit, { age: 62, sexe: "femme" });
  const ids = (r) => new Set(r.regles.map(x => x.id));
  assert.ok(!ids(jeune).has("age_45_plus"));
  assert.ok(ids(senior).has("age_45_plus") && ids(senior).has("age_60_plus"));
  assert.ok(ids(senior).has("femme_laxite") && !ids(jeune).has("femme_laxite"));
});

test("TOUT exercice recommandé existe au catalogue", () => {
  const manquants = [];
  for (const r of _adapt.ADAPTATIONS) {
    for (const n of r.privilegier || []) {
      if (!_cat.findInCatalogue(n)) manquants.push(`${r.id} → ${n}`);
    }
  }
  assert.deepEqual(manquants, [], `recommandations introuvables : ${manquants.join(", ")}`);
});

test("une contre-indication prime sur une recommandation", () => {
  const { privilegier, eviter } = _adapt.selectAdaptations(_grandGabarit, { age: 27, sexe: "homme" });
  const bas = eviter.map(e => e.toLowerCase());
  privilegier.forEach(p =>
    assert.ok(!bas.includes(p.toLowerCase()), `${p} à la fois conseillé et interdit`));
});

test("une morphologie non lue ne produit aucune adaptation MORPHO inventée", () => {
  const vide = { observations: _morpho.validerObservations({ confiance: "faible" }) };
  // Les règles de terrain (âge, sexe) restent légitimes : elles ne dépendent
  // pas des photos. Seules les règles morphologiques doivent se taire.
  const morphoOnly = (p) => _adapt.selectAdaptations(vide, p)
    .regles.filter(r => !/^age_|^femme_/.test(r.id));
  assert.deepEqual(morphoOnly({ age: 30, sexe: "homme" }), []);
  assert.deepEqual(morphoOnly({ age: 70, sexe: "femme" }), []);
  assert.equal(_adapt.buildAdaptationsBlock(null, {}), "");
});

test("aucune règle ne confond « indéterminé » avec une observation", () => {
  // Piège réel : symetrie="indetermine" ≠ "symetrique" déclenchait à tort la
  // règle d'asymétrie sur une fiche jamais lue.
  const vide = _morpho.validerObservations({ confiance: "faible" });
  const valeurs = [
    ...Object.values(vide.leviers), ...Object.values(vide.insertions),
    ...Object.values(vide.physique), ...Object.values(vide.proportions),
    ...Object.values(vide.repartition),
  ];
  assert.ok(valeurs.every(v => v === "indetermine"), "fiche de test non vide");
  const r = _adapt.selectAdaptations({ observations: vide }, { age: 30, sexe: "homme" });
  assert.equal(r.regles.filter(x => !/^age_|^femme_/.test(x.id)).length, 0);
});

test("chaque règle est traçable à une section de la base", () => {
  _adapt.ADAPTATIONS.forEach(r => {
    assert.ok(r.src && r.src.length > 2, `${r.id} : source manquante`);
    assert.ok(r.consequence && r.consequence.length > 40, `${r.id} : conséquence trop vague`);
    assert.equal(typeof r.when, "function");
  });
});

// ── Référentiels d'exécution : branches résolues, pas de pseudo-code brut ───
const _constr = await import("../api/_knowledge/construction.js");

test("la base jambes dépend de la longueur du fémur", () => {
  const longs = _constr.buildConstructionBlock(_grandGabarit, { pathologies: [] }, 4);
  const courts = _constr.buildConstructionBlock(_petitGabarit, { pathologies: [] }, 4);
  assert.match(longs, /hack squat ou la presse 45/i);
  assert.match(courts, /squat barre est la base légitime/i);
  // Les deux consignes s'excluent : jamais les deux dans le même programme.
  assert.ok(!/squat barre est la base légitime/i.test(longs));
  assert.ok(!/hack squat ou la presse 45/i.test(courts));
});

test("une épaule pathologique change la base pectoraux", () => {
  const avec = _constr.buildConstructionBlock(_petitGabarit, { pathologies: ["Conflit épaule"] }, 4);
  const sans = _constr.buildConstructionBlock(_petitGabarit, { pathologies: [] }, 4);
  assert.match(avec, /ÉPAULE FRAGILE/);
  assert.match(avec, /machine convergente/i);
  assert.ok(!/ÉPAULE FRAGILE/.test(sans));
});

test("aucun pseudo-code brut ne fuit dans le prompt", () => {
  const b = _constr.buildConstructionBlock(_grandGabarit, { pathologies: ["Lombalgie"] }, 4);
  // Le PDF contient "SI x : ... SINON" — ces branches doivent être RÉSOLUES.
  assert.ok(!/\bSINON\b/.test(b), "pseudo-code SINON présent");
  assert.ok(!/base = |echauffer\(/.test(b), "pseudo-code non traduit");
});

test("les cinq groupes sont couverts avec leurs règles propres", () => {
  const b = _constr.buildConstructionBlock(_grandGabarit, { pathologies: [] }, 4);
  ["▸ DOS", "▸ PECTORAUX", "▸ JAMBES", "▸ BRAS", "▸ ÉPAULES"].forEach(g =>
    assert.ok(b.includes(g), `groupe absent : ${g}`));
  // Deux axes du dos, chefs du triceps, gastro/soléaire : la substance y est.
  assert.match(b, /LARGEUR.*ÉPAISSEUR|ÉPAISSEUR.*LARGEUR/s);
  assert.match(b, /gastrocnémien/i);
  assert.match(b, /chef long/i);
});

test("les règles de conception chiffrées sont transmises", () => {
  assert.match(_constr.REGLES_CONCEPTION, /mois 1 → 4/);
  assert.match(_constr.REGLES_CONCEPTION, /polyarticulaire lourd → polyarticulaire léger → isolation/);
});

// ── État de forme mesuré → décisions imposées dans le prompt ────────────────
const _c0 = await import("../api/_knowledge/couche0.js");
const _formBase = {
  prenom: "Test", age: 30, sexe: "homme", poids: 80, taille: 180, niveau: "intermediaire",
  objectif: "hypertrophie", jours: ["Lun", "Mer", "Ven"], dureeSeance: 60,
  materiel: ["salle_complete"], pathologies: [], sport: "",
};
function _prompt(dossier) {
  return _gp.buildServerPrompt({
    form: _formBase, dossier, fiche: null,
    directives: _c0.getVariationDirectives({ cycleNum: 2, nbJours: 3, objectif: "hypertrophie", niveau: "intermediaire" }),
    cycleNum: 2,
    candidats: _cat.selectCandidats({ materiel: ["salle_complete"], niveau: "intermediaire", max: 9999 }),
  });
}

test("un athlète en fatigue reçoit des décisions imposées", () => {
  const p = _prompt({ numero_cycle: 2, etat_de_forme: {
    statut_recuperation: { niveau: "Fatigue accumulée", risque: 6 },
    volume_reel_semaine: { statut: "au-dessus", groupes_au_dessus_du_MRV: ["Pectoraux"], groupes_sous_le_MEV: [] },
    tendance_performance: { moyenne_pct: -4.2, tendance: "baisse" },
    fc_repos: { ecart: 8 } } });
  assert.match(p, /ÉTAT DE FORME MESURÉ/);
  assert.match(p, /FATIGUE ACCUMULÉE MESURÉE/);
  assert.match(p, /VOLUME AU-DESSUS DU MAXIMUM RÉCUPÉRABLE sur : Pectoraux/);
  assert.match(p, /PERFORMANCES EN BAISSE/);
  assert.match(p, /FC DE REPOS \+8 bpm/);
});

test("un risque élevé impose une semaine allégée, pas une accumulation", () => {
  const p = _prompt({ numero_cycle: 2, etat_de_forme: {
    statut_recuperation: { niveau: "Risque de surentraînement", risque: 9 } } });
  assert.match(p, /RISQUE DE SURENTRAÎNEMENT MESURÉ/);
  assert.match(p, /volume −40 %/);
  assert.ok(!/FATIGUE ACCUMULÉE MESURÉE/.test(p), "deux niveaux déclenchés à la fois");
});

test("un athlète frais ne reçoit AUCUNE restriction inventée", () => {
  const p = _prompt({ numero_cycle: 2, etat_de_forme: {
    statut_recuperation: { niveau: "Récupération excellente", risque: 0 },
    volume_reel_semaine: { statut: "optimal", groupes_au_dessus_du_MRV: [], groupes_sous_le_MEV: [] },
    tendance_performance: { moyenne_pct: 3.1, tendance: "hausse" } } });
  assert.ok(!/ÉTAT DE FORME MESURÉ/.test(p), "bloc affiché sans motif");
});

test("sans donnée d'état de forme, aucun bloc n'apparaît", () => {
  assert.ok(!/ÉTAT DE FORME MESURÉ/.test(_prompt({ numero_cycle: 1 })));
  assert.ok(!/ÉTAT DE FORME MESURÉ/.test(_prompt({})));
});

test("le jour le mieux tenu oriente le placement des séances", () => {
  const p = _prompt({ numero_cycle: 2, rythme_reel: { jour_le_mieux_tenu: "Lundi" } });
  assert.match(p, /RYTHME RÉEL : le Lundi/);
});

// ── Dossier : les clés qui pilotent des décisions ne doivent JAMAIS être ────
//    coupées par la troncature du prompt.
test("les clés décisionnelles passent avant l'historique volumineux", async () => {
  const cb = await import("../src/services/coachBrainService.js");
  // Athlète très chargé : 60 jours, 40 exercices distincts.
  const EXOS = Array.from({ length: 40 }, (_, i) => `Exercice au nom assez long numéro ${i}`);
  const log = {};
  for (let i = 0; i < 60; i++) {
    log[_dk(i)] = { sets: EXOS.slice(i % 20, i % 20 + 6)
      .flatMap(nm => Array(4).fill({ exNom: nm, kg: 60 + i, reps: 10 })), totalVolume: 9000 };
  }
  _store["morpho_workout_log"] = JSON.stringify(log);
  const { dossier } = cb.buildDossierAthlete({ form: { age: 27 }, prog: null, cycles: [], corrigerFaibles: true });
  const cles = Object.keys(dossier);
  const rang = (k) => cles.indexOf(k);
  ["etat_de_forme", "charges_actuelles", "rythme_reel"].forEach(k =>
    assert.ok(rang(k) < rang("historique_progression"),
      `${k} placé après l'historique : serait tronqué`));
  // Et le tout doit tenir dans la fenêtre côté serveur (9000).
  const s = JSON.stringify(dossier, null, 1).replace(/\n\s*/g, "\n");
  assert.ok(s.length <= 9000, `dossier de ${s.length} chars, au-delà de la limite`);
});

test("l'historique priorise stagnation et régression", async () => {
  const cb = await import("../src/services/coachBrainService.js");
  const { dossier } = cb.buildDossierAthlete({ form: { age: 27 }, prog: null, cycles: [], corrigerFaibles: false });
  const h = dossier.historique_progression || {};
  assert.ok(Object.keys(h).length <= 18, `historique non borné (${Object.keys(h).length})`);
});

// ── Prescription en kilos : la différence entre un plan et un coach ─────────
test("les charges connues imposent une prescription en kilos", () => {
  const p = _prompt({ numero_cycle: 2, charges_actuelles: {
    "Développé haltères incliné 30°": "32kg×10", "Rowing barre 45°": "70kg×8" } });
  assert.match(p, /CHARGES RÉELLES DE L'ATHLÈTE/);
  assert.match(p, /Développé haltères incliné 30° : 32kg×10/);
  assert.match(p, /NOMBRE EN KILOS, pas un pourcentage/);
  assert.match(p, /Ne prescris JAMAIS un pourcentage sur un exercice dont tu connais la charge/);
});

test("sans historique de charges, aucune prescription absolue inventée", () => {
  assert.ok(!/CHARGES RÉELLES DE L'ATHLÈTE/.test(_prompt({ numero_cycle: 1 })));
  assert.ok(!/CHARGES RÉELLES DE L'ATHLÈTE/.test(
    _prompt({ numero_cycle: 1, charges_actuelles: { note: "Aucune charge enregistrée." } })));
});

test("le schéma impose un échauffement spécifique par séance", () => {
  const p = _prompt({ numero_cycle: 1 });
  assert.match(p, /"echauffement"/);
  assert.match(p, /Jamais générique/);
});

test("la progression doit être chiffrée, pas descriptive", () => {
  const p = _prompt({ numero_cycle: 1 });
  assert.match(p, /instruction CHIFFRÉE/);
  assert.match(p, /incrément précis/);
});

// ── Progression de charge : déterministe, appliquée dès la 2e séance ────────
const _prog = await import("../src/services/progressionService.js");
const _setLog = (exNom, kg, reps, n = 4) => {
  _store["morpho_workout_log"] = JSON.stringify({
    [_dk(3)]: { sets: Array(n).fill({ exNom, kg, reps }) } });
};

test("haut de fourchette atteint → la charge monte d'un vrai palier", () => {
  _setLog("Développé haltères incliné 30°", 32, 10);
  const r = _prog.getChargeRecommandee("Développé haltères incliné 30°",
    { objectif: "hypertrophie", repsPrescrites: "8-10" });
  assert.equal(r.action, "augmenter");
  assert.ok(r.delta >= 2, `incrément dérisoire : +${r.delta} kg`);
  assert.ok(r.kg > r.precedente);
});

test("dans la fourchette → on maintient et on gagne des répétitions", () => {
  _setLog("Développé haltères incliné 30°", 32, 9);
  const r = _prog.getChargeRecommandee("Développé haltères incliné 30°",
    { objectif: "hypertrophie", repsPrescrites: "8-10" });
  assert.equal(r.action, "maintenir");
  assert.equal(r.delta, 0);
});

test("sous la fourchette → la charge est allégée", () => {
  _setLog("Développé haltères incliné 30°", 32, 6);
  const r = _prog.getChargeRecommandee("Développé haltères incliné 30°",
    { objectif: "hypertrophie", repsPrescrites: "8-10" });
  assert.equal(r.action, "reduire");
  assert.ok(r.kg < r.precedente);
});

test("le palier respecte le matériel réel du groupe musculaire", () => {
  _setLog("Presse à jambes 45° pieds hauts", 120, 12);
  const bas = _prog.getChargeRecommandee("Presse à jambes 45° pieds hauts",
    { objectif: "hypertrophie", repsPrescrites: "10-12" });
  assert.equal(bas.kg % 5, 0, "bas du corps : palier de 5 kg attendu");
  _setLog("Élévation latérale haltère unilatérale", 10, 15);
  const haut = _prog.getChargeRecommandee("Élévation latérale haltère unilatérale",
    { objectif: "hypertrophie", repsPrescrites: "12-15" });
  assert.ok(haut.delta <= 2, "épaules : palier trop large");
});

test("l'objectif module la vitesse de progression quand le palier le permet", () => {
  // Sur un mouvement à palier fin (pectoraux, 2,5 kg), l'écart d'incrément
  // entre force (5 %) et santé (2 %) est exprimable. Sur un squat à palier de
  // 5 kg, les deux tombent sur la même valeur : c'est la contrainte physique
  // des disques, pas un défaut du moteur.
  _setLog("Développé couché barre", 100, 5);
  const force = _prog.getChargeRecommandee("Développé couché barre",
    { objectif: "force", repsPrescrites: "3-5" });
  _setLog("Développé couché barre", 100, 15);
  const sante = _prog.getChargeRecommandee("Développé couché barre",
    { objectif: "sante", repsPrescrites: "12-15" });
  assert.ok(force.delta > sante.delta, `force ${force.delta} vs santé ${sante.delta}`);
});

test("le groupe musculaire est résolu même hors catalogue client", async () => {
  const mg = await import("../src/services/muscleGroups.js");
  // 100 % des exercices que l'IA peut prescrire doivent être résolus.
  let ok = 0;
  _cat.CATALOGUE.forEach(e => { if (mg.groupeMusculaire(e.n) === e.groupe) ok++; });
  assert.equal(ok, _cat.CATALOGUE.length,
    `${_cat.CATALOGUE.length - ok} exercices mal classés`);
  // Filet sur un nom inventé.
  assert.equal(mg.groupeMusculaire("Curl marteau incliné maison"), "Biceps");
  assert.equal(mg.groupeMusculaire(""), "Autre");
});

test("un pourcentage n'est JAMAIS converti en kilos", () => {
  _store["morpho_workout_log"] = JSON.stringify({});
  const d = _prog.chargeDepart({ nom: "Exercice neuf", charge: "70-75% 1RM estimé" }, "hypertrophie");
  assert.equal(d.kg, null, "70-75% interprété comme 70 kg");
  const p2 = _prog.chargeDepart({ nom: "Exercice neuf", charge: "32 kg" }, "hypertrophie");
  assert.equal(p2.kg, 32);
});

test("aucune recommandation sans série validée", () => {
  _store["morpho_workout_log"] = JSON.stringify({});
  assert.equal(_prog.getChargeRecommandee("Jamais fait", {}).available, false);
});

// ── Budgets de génération : cohérence de bout en bout ──────────────────────
test("le cap du premier appel laisse toujours une réserve de reprise", () => {
  const RESERVE = 70_000;
  for (const budget of [280_000, 400_000, 700_000]) {
    const cap1 = Math.min(300_000, budget - RESERVE);
    assert.ok(cap1 > 0, `budget ${budget} : cap négatif`);
    assert.ok(budget - cap1 >= 55_000,
      `budget ${budget} : réserve ${budget - cap1} insuffisante pour une reprise`);
  }
});

test("aucun budget ne dépasse le maxDuration déclaré", async () => {
  const vercel = JSON.parse(_fs.readFileSync("vercel.json", "utf8"));
  const maxStart = vercel.functions["api/generate-program-start.js"].maxDuration;
  const src = _fs.readFileSync("api/generate-program-start.js", "utf8");
  const defaut = Number((src.match(/\|\|\s*(\d+)_000/) || [])[1]) * 1000;
  assert.ok(defaut > 0, "budget par défaut introuvable");
  assert.ok(defaut < maxStart * 1000,
    `budget ${defaut / 1000}s ≥ maxDuration ${maxStart}s`);
});

test("le plafond client couvre le budget serveur et sa reprise", () => {
  const client = _fs.readFileSync("src/services/aiService.js", "utf8");
  const maxMs = Number((client.match(/MAX_MS = (\d+) \* 60_000/) || [])[1]) * 60_000;
  const statusSrc = _fs.readFileSync("api/generate-program-status.js", "utf8");
  const garde = Number((statusSrc.match(/ageMs > (\d+) \* 60_000/) || [])[1]) * 60_000;
  assert.ok(maxMs >= 700_000, `plafond client ${maxMs / 60_000} min trop court`);
  assert.ok(garde > maxMs, "le garde-fou serveur expire avant le client");
});

test("une expiration déclenche une reprise, pas un échec sec", () => {
  const src = _fs.readFileSync("api/generate-program.js", "utf8");
  assert.match(src, /reprise compacte/i, "aucune reprise en cas d'expiration");
  assert.match(src, /MODE COMPACT/, "mode de repli absent");
  // La reprise resserre la RÉDACTION, jamais le contenu du programme.
  assert.match(src, /même nombre de séances/i);
  assert.match(src, /même nombre d'exercices/i);
  assert.match(src, /vaut infiniment mieux qu'aucun programme/i,
    "la priorité au programme complet n'est pas énoncée");
});

test("un budget serré demande la concision D'EMBLÉE", () => {
  const src = _fs.readFileSync("api/generate-program.js", "utf8");
  assert.match(src, /concisDemblee/, "aucune détection de budget serré");
  // Vu en production : appel 1 coupé à 210 s puis reprise à 70 s = échec
  // total après 4 min 40. Mieux vaut viser court dès le départ.
  assert.match(src, /CAP1 < 230_000/, "seuil de bascule absent");
});

test("les budgets laissent la place aux DEUX tentatives", () => {
  for (const budget of [280_000, 700_000]) {
    const reserve = Math.round(budget * 0.33);
    const cap1 = Math.min(300_000, budget - reserve);
    assert.ok(cap1 >= 180_000, `budget ${budget / 1000}s : CAP1 ${cap1 / 1000}s trop court`);
    assert.ok(reserve >= 90_000, `budget ${budget / 1000}s : réserve ${reserve / 1000}s trop courte`);
    assert.ok(cap1 + reserve <= budget, "la somme dépasse le budget");
  }
});

// ── Sortie : pas de champ redondant qui allonge la génération ──────────────
test("les champs redondants ont disparu du schéma", () => {
  const src = _fs.readFileSync("api/generate-program.js", "utf8");
  const schema = src.slice(src.indexOf('"exercices": ['));
  assert.ok(!/"justification":/.test(schema.slice(0, 900)),
    "justification encore demandée par exercice");
  assert.ok(!/"progression_semaine":/.test(schema.slice(0, 900)),
    "progression_semaine encore demandée (calculée par progressionService)");
  // tips_coach reste : c'est le seul des trois réellement utile en séance.
  assert.match(schema.slice(0, 900), /"tips_coach":/);
});

test("le modèle est averti de ne pas réintroduire ces champs", () => {
  const src = _fs.readFileSync("api/generate-program.js", "utf8");
  assert.match(src, /N'ajoute AUCUN champ hors schéma/);
  assert.match(src, /calculée par l'application à partir des séries réellement validées/);
});

test("le client reste compatible avec les anciens programmes", () => {
  const src = _fs.readFileSync("src/services/aiService.js", "utf8");
  assert.match(src, /justification:\s+ex\.justification/,
    "les programmes déjà générés perdraient leur justification");
});

// ── Substitution & douleur : décisions de coach, sans IA ───────────────────
const _sub = await import("../src/services/substitutionService.js");
const _EXEP = "Développé militaire barre debout";
const _hist = (pains) => { _store["mc_exoFeedback"] = JSON.stringify({ [_EXEP]:
  pains.map((p, i) => ({ date: `2026-07-${String(i + 1).padStart(2, "0")}`, pain: p })) }); };

test("les variantes restent dans le même groupe et le matériel disponible", () => {
  const v = _sub.getVariantes(_EXEP, { materiel: ["halteres"], niveau: "intermediaire" });
  assert.ok(v.length > 0, "aucune variante proposée");
  v.forEach(x => {
    assert.equal(x.groupe, "Épaules", `${x.n} hors groupe`);
    assert.ok(["haltères", "poids de corps", "accessoire"].includes(x.mat),
      `${x.n} exige du matériel non déclaré (${x.mat})`);
  });
});

test("un exercice de rééducation ne remplace pas un mouvement principal", () => {
  const v = _sub.getVariantes(_EXEP, { materiel: ["salle_complete"], niveau: "intermediaire" });
  v.forEach(x => assert.notEqual(x.cat, "correctif",
    `${x.n} est un correctif proposé pour un exercice principal`));
});

test("les exercices interdits par la morphologie sont écartés", () => {
  const interdit = "Développé haltères assis";
  const v = _sub.getVariantes(_EXEP, { materiel: ["salle_complete"], interdits: [interdit] });
  assert.ok(!v.some(x => x.n === interdit), "un exercice interdit a été proposé");
});

test("un nom approximatif retrouve quand même l'exercice", () => {
  const e = _sub.resoudreExercice("Développé militaire barre");
  assert.ok(e && e.groupe === "Épaules", "résolution tolérante en échec");
});

test("douleur vive → arrêt immédiat, quelle que soit la semaine", () => {
  _hist([0, 1]);
  const r = _sub.evaluerDouleur(_EXEP, 3, { semaine: 4, chargeActuelle: 40 });
  assert.equal(r.action, "stop");
  assert.equal(r.severite, "critique");
  assert.ok(r.proposerVariante);
});

test("gêne en semaine 1 → on remplace, l'exercice ne convient pas", () => {
  _hist([]);
  const r = _sub.evaluerDouleur(_EXEP, 2, { semaine: 1, chargeActuelle: 40 });
  assert.equal(r.action, "remplacer");
  assert.ok(r.proposerVariante);
});

test("gêne qui MONTE après des semaines saines → on allège, on ne supprime pas", () => {
  _hist([0, 0, 1]);
  const r = _sub.evaluerDouleur(_EXEP, 2, { semaine: 3, chargeActuelle: 40 });
  assert.equal(r.action, "alleger");
  assert.equal(r.tendance, "aggravation");
  assert.equal(r.proposerVariante, false, "ne doit PAS supprimer un exercice qui fonctionnait");
  assert.ok(r.chargeSuggeree && r.chargeSuggeree < 40, "aucune charge allégée proposée");
  assert.match(r.message, /technique/i);
});

test("gêne récurrente malgré l'allègement → on change de mouvement", () => {
  _hist([2, 2]);
  const r = _sub.evaluerDouleur(_EXEP, 2, { semaine: 4, chargeActuelle: 40 });
  assert.equal(r.action, "remplacer");
  assert.ok(r.proposerVariante);
});

test("gêne légère et stable → aucune alarme", () => {
  _hist([1, 1, 1]);
  assert.equal(_sub.evaluerDouleur(_EXEP, 1, { semaine: 3 }).action, "aucune");
  _hist([0, 0]);
  assert.equal(_sub.evaluerDouleur(_EXEP, 1, { semaine: 2 }).action, "surveiller");
});

test("aucune douleur → aucune action", () => {
  _hist([0, 0]);
  const r = _sub.evaluerDouleur(_EXEP, 0, { semaine: 2 });
  assert.equal(r.action, "aucune");
  assert.equal(r.titre, "");
});

test("le programme transporte le matériel et le niveau pour la substitution", () => {
  const src = _fs.readFileSync("src/services/aiService.js", "utf8");
  assert.match(src, /materiel:\s+form\.materiel/, "prog.materiel absent");
  assert.match(src, /niveau:\s+form\.niveau/, "prog.niveau absent");
});

test("la semaine réelle du cycle atteint la logique de douleur", () => {
  const fm = _fs.readFileSync("src/features/training/FocusMode.jsx", "utf8");
  const tv = _fs.readFileSync("src/features/training/TodayView.jsx", "utf8");
  assert.match(tv, /semaineCycle=\s*\{\(props\.semC \|\| 0\) \+ 1\}/, "semaine non transmise");
  assert.match(fm, /semaineCycle/, "prop non déclarée");
  assert.ok(!/Number\(prog\?\.semaine\)/.test(fm), "utilise encore un champ inexistant");
});

// ── Séries d'approche : monter en charge, sans polluer le volume ───────────
test("un mouvement lourd reçoit des séries d'approche croissantes", () => {
  const a = _prog.getSeriesApproche({ nom: "Squat barre nuque (high-bar)", cat: "principal" },
    100, { objectif: "force", repsTravail: 5 });
  assert.ok(a.length >= 3, `${a.length} palier(s) seulement en force`);
  for (let i = 1; i < a.length; i++)
    assert.ok(a[i].kg > a[i - 1].kg, "les paliers ne montent pas");
  assert.ok(a[a.length - 1].kg < 100, "le dernier palier atteint la charge de travail");
  // Les répétitions diminuent à mesure qu'on approche : on prépare, on ne fatigue pas.
  assert.ok(a[a.length - 1].reps <= a[0].reps);
});

test("la force demande plus de paliers que l'hypertrophie", () => {
  const f = _prog.getSeriesApproche({ nom: "Squat barre nuque (high-bar)", cat: "principal" },
    100, { objectif: "force", repsTravail: 5 });
  const h = _prog.getSeriesApproche({ nom: "Squat barre nuque (high-bar)", cat: "principal" },
    100, { objectif: "hypertrophie", repsTravail: 10 });
  assert.ok(f.length > h.length, `force ${f.length} vs hypertrophie ${h.length}`);
});

test("l'isolation légère n'a pas de série d'approche", () => {
  assert.deepEqual(_prog.getSeriesApproche(
    { nom: "Élévation latérale haltère unilatérale", cat: "isolation" }, 10, {}), []);
  assert.deepEqual(_prog.getSeriesApproche({ nom: "X", cat: "principal" }, 0, {}), []);
});

// ── Périodisation : le déload doit RÉELLEMENT alléger ──────────────────────
const _per = await import("../src/services/periodisationService.js");

test("le déload réduit vraiment séries et charge", () => {
  // La semaine de déload vient de la base de connaissances (semaine 6 en
  // hypertrophie), pas d'une constante choisie côté affichage.
  const sDeload = _per.totalSemaines("intermediaire", "hypertrophie");
  const base = _per.appliquerPhase({ series: "4", charge: "60 kg" }, 1, { groupe: "Pectoraux" });
  const dl   = _per.appliquerPhase({ series: "4", charge: "60 kg" }, sDeload, { groupe: "Pectoraux" });
  assert.equal(_per.getPhase(sDeload).cle, "deload");
  assert.ok(dl.series < base.series, "séries non réduites au déload");
  assert.ok(dl.charge < base.charge, "charge non réduite au déload");
  assert.ok(dl.modifie);
});

test("la charge monte de la base au pic", () => {
  const g = { groupe: "Pectoraux" };
  const base = _per.appliquerPhase({ series: "4", charge: "60 kg" }, 1, g);
  const pic  = _per.appliquerPhase({ series: "4", charge: "60 kg" }, 5, g);
  assert.ok(pic.charge > base.charge, "aucune progression jusqu'au pic");
  assert.ok(pic.charge > _per.appliquerPhase({ series: "4", charge: "60 kg" }, 1, g).charge,
    "la charge devrait monter jusqu'à la surcharge");
});

test("un pourcentage n'est jamais modulé en kilos", () => {
  const r = _per.appliquerPhase({ series: "4", charge: "75% 1RM" }, 6, { groupe: "Pectoraux" });
  assert.equal(r.charge, null);
  assert.equal(r.chargeBase, null);
});

// ── Mobilité : routines dérivées du terrain réel ───────────────────────────
const _mob = await import("../src/services/mobiliteService.js");
const _ficheP = (posture) => ({ observations: _morpho.validerObservations({
  leviers: {}, insertions: {}, physique: {}, proportions: {},
  posture, repartition: {}, confiance: "haute" }) });

test("travail de bureau déclenche les routines pertinentes, dans la limite du tenable", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "Bureau, assis 8h", pathologies: [] });
  const cles = r.routines.map(x => x.cle);
  ["epaules_enroulees", "hanches_assis"].forEach(c =>
    assert.ok(cles.includes(c), `routine manquante : ${c}`));
  assert.ok(cles.includes("respiration"),
    "la respiration devrait être proposée à un travailleur assis");
  // Plafond quotidien : au-delà de 20 min la routine est abandonnée.
  assert.ok(r.minutesJour > 0 && r.minutesJour <= 20,
    `${r.minutesJour} min/jour : hors du budget tenable`);
});

test("le plafond quotidien garde les routines PRIORITAIRES", () => {
  const r = _mob.getRoutinesMobilite(
    _ficheP(["hyperlordose", "bascule_bassin", "cyphose", "antepulsion_scapulaire"]),
    { metier: "Bureau assis", pathologies: [] });
  const cles = r.routines.map(x => x.cle);
  // Les deux syndromes doivent survivre au plafond, pas la respiration (5 min)
  // qui tiendrait pourtant plus facilement dans le budget restant.
  assert.ok(cles.includes("croise_inferieur") && cles.includes("croise_superieur"),
    "un syndrome a été écarté au profit d'une routine moins prioritaire");
  assert.ok(r.minutesJour <= 20);
});

test("une épaule pathologique ajoute sa routine avant séance", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: ["Conflit épaule"] });
  const ep = r.routines.find(x => x.cle === "epaule_patho");
  assert.ok(ep, "routine épaule absente");
  assert.equal(ep.moment, "avant_seance");
});

test("les routines disent quoi RENFORCER, pas seulement quoi étirer", () => {
  const r = _mob.getRoutinesMobilite(_ficheP(["cyphose"]), { metier: "Bureau", pathologies: [] });
  const ep = r.routines.find(x => x.cle === "epaules_enroulees");
  assert.match(ep.renforcer, /ALLONG/, "n'avertit pas contre l'étirement d'un muscle déjà long");
});

test("aucune contrainte identifiée → aucune routine inventée", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: [] });
  assert.equal(r.routines.length, 0);
  assert.equal(r.minutesJour, 0);
});

test("la mobilité avant séance dépend des groupes travaillés", () => {
  const f = _ficheP(["cyphose"]);
  const p = { metier: "Bureau", pathologies: ["Conflit épaule"] };
  const haut = _mob.getMobiliteAvantSeance(f, p, "Pectoraux / Épaules").map(x => x.cle);
  const bas  = _mob.getMobiliteAvantSeance(f, p, "Jambes").map(x => x.cle);
  assert.ok(haut.includes("epaule_patho"), "épaule absente d'une séance haut du corps");
  assert.ok(bas.includes("hanches_assis"), "hanches absentes d'une séance jambes");
  assert.ok(!bas.includes("epaules_enroulees"), "routine épaules sur une séance jambes");
});

// ── Intégration visuelle : rien ne doit être dégradé ───────────────────────
test("les séries d'approche ne sont JAMAIS journalisées", () => {
  const fm = _fs.readFileSync("src/features/training/FocusMode.jsx", "utf8");
  // Le seul push dans le journal doit rester dans validate(), jamais dans
  // validerApproche() — sinon le volume hebdomadaire serait faussé.
  const pushes = [...fm.matchAll(/workoutSetsRef\.current\.push/g)];
  assert.equal(pushes.length, 1, `${pushes.length} écritures dans le journal`);
  const approche = fm.slice(fm.indexOf("const validerApproche"),
                            fm.indexOf("Applique la charge allégée"));
  assert.ok(!/workoutSetsRef/.test(approche), "validerApproche journalise des séries");
  assert.ok(!/toggleCheck/.test(approche), "validerApproche coche l'exercice");
});

test("l'approche précède les séries de travail sans les remplacer", () => {
  const fm = _fs.readFileSync("src/features/training/FocusMode.jsx", "utf8");
  assert.match(fm, /enApproche && \(/, "bloc d'approche absent");
  assert.match(fm, /!enApproche && \(\s*<SetStage/, "SetStage non conditionné");
  assert.match(fm, /setApprocheIdx\(0\)/, "l'approche ne repart pas au changement d'exercice");
});

test("le bandeau de semaine et l'ajustement par exercice sont branchés", () => {
  const pv = _fs.readFileSync("src/features/training/ProgrammeView.jsx", "utf8");
  const sd = _fs.readFileSync("src/features/training/SeanceDetail.jsx", "utf8");
  assert.match(pv, /resumeSemaine\(semN, prog\?\.objectif, prog\?\.niveau\)/,
    "bandeau de semaine sans objectif : force et hypertrophie seraient identiques");
  assert.match(sd, /appliquerPhase\(ex, semaineCycle/, "ajustement par exercice absent");
  assert.match(sd, /objectif: prog\?\.objectif, niveau: prog\?\.niveau/,
    "objectif ou niveau non transmis : un débutant aurait un cycle de 6 semaines");
  assert.match(sd, /const semaineCycle = \(props\.semC \|\| 0\) \+ 1/, "semaine non dérivée");
});

test("la page mobilité est atteignable et ses icônes existent", () => {
  const pv = _fs.readFileSync("src/features/training/ProgrammeView.jsx", "utf8");
  assert.match(pv, /showMobilite/, "page non branchée");
  assert.match(pv, /<MobilitePage/, "composant non rendu");
  const icon = _fs.readFileSync("src/components/ui/Icon.jsx", "utf8");
  const mob = _fs.readFileSync("src/features/training/components/MobilitePage.jsx", "utf8");
  const utilisees = [...mob.matchAll(/icone:\s*"([^"]+)"/g)].map(m => m[1])
    .concat([...mob.matchAll(/name="([^"]+)"/g)].map(m => m[1]));
  const manquantes = [...new Set(utilisees)]
    .filter(n => !new RegExp(`(^|\\s)${n}\\s*:`).test(icon));
  assert.deepEqual(manquantes, [], `icônes absentes : ${manquantes.join(", ")}`);
});

// ── Séance de mobilité : corrective si besoin, sinon 10 min et pas plus ────
test("posture dégradée → séance corrective ciblée sur le réel", () => {
  const s = _mob.getSeanceMobilite(_ficheP(["cyphose", "antepulsion_scapulaire"]),
    { metier: "Bureau assis", pathologies: [] }, { joursEntrainement: 5 });
  assert.equal(s.type, "corrective");
  assert.ok(s.exercices.length >= 4, `${s.exercices.length} exercices seulement`);
  assert.ok(s.zones.length > 0, "aucune zone ciblée");
  // Chaque exercice doit être rattaché à une zone : rien de générique.
  s.exercices.forEach(e => assert.ok(e.zone, `${e.nom} sans zone`));
});

test("posture saine → étirements classiques, 10 minutes MAXIMUM", () => {
  const s = _mob.getSeanceMobilite(_ficheP([]), { metier: "", pathologies: [] }, {});
  assert.equal(s.type, "classique");
  assert.ok(s.minutes <= 10, `${s.minutes} min, au-delà du plafond demandé`);
  assert.equal(s.zones.length, 0, "des zones inventées sans motif");
  assert.match(s.note, /pas de posture à corriger/i);
});

test("une séance corrective ne dépasse jamais une durée réaliste", () => {
  // Profil cumulant tout : la séance doit rester faisable, pas exhaustive.
  const s = _mob.getSeanceMobilite(_ficheP(["cyphose", "hyperlordose", "valgus_genou"]),
    { metier: "Bureau assis", pathologies: ["Lombalgie", "Conflit épaule", "Tendinite Achille"] }, {});
  assert.ok(s.exercices.length <= 8, `${s.exercices.length} exercices : séance trop longue`);
  assert.ok(s.minutes <= 25, `${s.minutes} min : jamais faite en pratique`);
});

test("le rachis passe avant le reste dans une séance corrective", () => {
  const s = _mob.getSeanceMobilite(_ficheP(["cyphose"]),
    { metier: "Manutention", pathologies: ["Lombalgie"] }, {});
  assert.match(s.exercices[0].zone, /rachis|Décompression/i);
});

test("le placement dépend de la charge de la semaine", () => {
  assert.match(_mob.placementSeanceMobilite(5, "corrective"), /déjà chargée/i);
  assert.match(_mob.placementSeanceMobilite(3, "corrective"), /jour de repos/i);
  assert.match(_mob.placementSeanceMobilite(3, "classique"), /repos|légère/i);
});

test("la fiche morpho arrive par le service, pas par localStorage en dur", () => {
  const pv = _fs.readFileSync("src/features/training/ProgrammeView.jsx", "utf8");
  assert.match(pv, /getFicheMorpho\(\)/, "fiche non lue via le service");
  assert.ok(!/localStorage\.getItem\("morpho_fiche"\)/.test(pv),
    "lecture directe de localStorage encore présente");
});

// ── Périodisation par objectif : force ≠ hypertrophie ≠ santé ──────────────
test("force et hypertrophie ne se périodisent pas pareil", () => {
  const ctx = (o) => ({ groupe: "Pectoraux", objectif: o });
  const ex = { series: "4", charge: "100 kg" };
  const fPic = _per.appliquerPhase(ex, 5, ctx("force"));
  const hPic = _per.appliquerPhase(ex, 5, ctx("hypertrophie"));
  assert.ok(fPic.charge > hPic.charge,
    `pic force ${fPic.charge} devrait dépasser hypertrophie ${hPic.charge}`);
  assert.notEqual(_per.getPhase(1, "force").label, _per.getPhase(1, "hypertrophie").label,
    "les phases devraient différer dès la semaine 1");
});

test("un objectif santé varie beaucoup moins qu'un objectif force", () => {
  const ex = { series: "4", charge: "100 kg" };
  const amplitude = (o) => {
    const tot = _per.totalSemaines("intermediaire", o);
    const vals = Array.from({ length: tot }, (_, i) =>
      _per.appliquerPhase(ex, i + 1, { groupe: "Pectoraux", objectif: o }).charge);
    return Math.max(...vals) - Math.min(...vals);
  };
  assert.ok(amplitude("force") > amplitude("sante"),
    "la santé ne doit pas osciller autant que la force");
  assert.ok(amplitude("perte_poids") < amplitude("force"),
    "en déficit la charge doit rester stable");
});

test("le RIR cible se décale selon l'objectif", () => {
  const force = _per.getPhase(3, "force").rir;
  const sante = _per.getPhase(3, "sante").rir;
  assert.notEqual(force, sante, `RIR identique : ${force}`);
  // La santé doit rester plus loin de l'échec que la force.
  const premier = (r) => parseInt(String(r).match(/\d+/)[0]);
  assert.ok(premier(sante) > premier(force));
});

test("chaque objectif porte une note explicative", () => {
  ["force", "hypertrophie", "perte_poids", "sante", "reathletisation", "prep_physique"]
    .forEach(o => {
      const p = _per.getPhase(3, o);
      assert.ok(p.objectifNote && p.objectifNote.length > 20, `${o} : note absente`);
    });
});

test("un objectif inconnu retombe sur l'hypertrophie", () => {
  const a = _per.getPhase(4, "objectif_inexistant");
  const b = _per.getPhase(4, "hypertrophie");
  assert.equal(a.charge, b.charge);
  assert.equal(a.series, b.series);
});

test("le déload allège dans TOUS les objectifs", () => {
  ["force", "hypertrophie", "perte_poids", "sante", "reathletisation", "prep_physique"]
    .forEach(o => {
      const ctx = { groupe: "Pectoraux", objectif: o };
      const total = _per.totalSemaines("intermediaire", o);
      const base = _per.appliquerPhase({ series: "4", charge: "100 kg" }, 1, ctx);
      const fin  = _per.appliquerPhase({ series: "4", charge: "100 kg" }, total, ctx);
      // En santé la base ne prévoit pas de déload : consolidation à la place.
      if (_per.getPhase(total, o).cle === "deload") {
        assert.ok(fin.charge < base.charge, `${o} : charge non réduite au déload`);
        assert.ok(fin.series <= base.series, `${o} : volume non réduit au déload`);
      }
    });
});

// ── Autorité de l'utilisateur : on ne modifie pas un programme manuel ──────
test("un programme manuel n'est PAS modulé par défaut", () => {
  const ex = { series: "4", charge: "60 kg" };
  const r = _per.appliquerPhase(ex, 6, {
    groupe: "Pectoraux", objectif: "hypertrophie", prog: { type: "custom" } });
  assert.equal(r.inactive, true, "un programme écrit à la main a été modifié");
  assert.equal(r.series, 4, "séries modifiées sans accord");
  assert.equal(r.charge, 60, "charge modifiée sans accord");
  assert.equal(r.modifie, false);
});

test("un programme IA est modulé par défaut", () => {
  const sDeload = _per.totalSemaines("intermediaire", "hypertrophie");
  const r = _per.appliquerPhase({ series: "4", charge: "60 kg" }, sDeload, {
    groupe: "Pectoraux", objectif: "hypertrophie", prog: { type: "ia" } });
  assert.ok(!r.inactive, "la périodisation du mésocycle IA n'est pas appliquée");
  assert.ok(r.series < 4 && r.charge < 60, "déload sans effet sur un programme IA");
});

test("le choix de l'utilisateur prime sur le défaut, dans les deux sens", () => {
  const ex = { series: "4", charge: "60 kg" };
  const ctx = (prog) => ({ groupe: "Pectoraux", objectif: "hypertrophie", prog });
  // Manuel + activation explicite → modulé
  const a = _per.appliquerPhase(ex, 6, ctx({ type: "custom", periodisation: true }));
  assert.ok(!a.inactive, "activation manuelle ignorée");
  // IA + désactivation explicite → intact
  const b = _per.appliquerPhase(ex, 6, ctx({ type: "ia", periodisation: false }));
  assert.equal(b.inactive, true, "désactivation ignorée sur un programme IA");
  assert.equal(b.series, 4);
});

test("periodisationActive applique les bons défauts", () => {
  assert.equal(_per.periodisationActive({ type: "ia" }), true);
  assert.equal(_per.periodisationActive({ type: "custom" }), false);
  assert.equal(_per.periodisationActive({}), false, "défaut trop permissif");
  assert.equal(_per.periodisationActive(null), false);
});

test("l'écran propose la périodisation au lieu de l'imposer", () => {
  const pv = _fs.readFileSync("src/features/training/ProgrammeView.jsx", "utf8");
  assert.match(pv, /periodisationActive\(prog\)/, "le drapeau n'est pas lu");
  assert.match(pv, /Activer la périodisation/, "aucune proposition sur programme manuel");
  assert.match(pv, /Suivre le programme sans variation/, "impossible de désactiver");
  assert.match(pv, /programme suivi tel quel/, "l'état inactif n'est pas expliqué");
});

test("les trois écrans transmettent le programme à la phase", () => {
  ["src/features/training/SeanceDetail.jsx", "src/features/training/FocusMode.jsx"]
    .forEach(f => {
      const s = _fs.readFileSync(f, "utf8");
      assert.match(s, /objectif: prog\?\.objectif, niveau: prog\?\.niveau, prog/,
        `${f} : programme non transmis, le drapeau serait ignoré`);
    });
});

// ── Une seule vérité : l'affichage doit refléter la base de connaissances ──
test("les phases affichées viennent bien de la base, pas d'une invention", async () => {
  const noyau = await import("../api/_knowledge/noyau.js");
  for (const [niv, obj] of [["intermediaire", "hypertrophie"], ["intermediaire", "force"],
                            ["debutant", "hypertrophie"], ["intermediaire", "sante"]]) {
    const base = noyau.getMesocycleLogic(niv, obj, 1);
    assert.equal(_per.totalSemaines(niv, obj), base.duree,
      `${niv}/${obj} : durée affichée ≠ durée de la base`);
    // Chaque libellé de phase affiché doit exister dans la base.
    const labelsBase = new Set(base.phases.map(p => p.phase));
    for (let s = 1; s <= base.duree; s++) {
      assert.ok(labelsBase.has(_per.getPhase(s, obj, niv).label),
        `${niv}/${obj} S${s} : phase inventée`);
    }
  }
});

test("un débutant reçoit 4 semaines, pas 6", () => {
  assert.equal(_per.totalSemaines("debutant", "hypertrophie"), 4);
  assert.equal(_per.totalSemaines("intermediaire", "hypertrophie"), 6);
  assert.equal(_per.totalSemaines("avance", "hypertrophie"), 6);
});

test("la copie client du mésocycle est identique au serveur", async () => {
  const client = await import("../src/data/mesocycle.js");
  const serveur = await import("../api/_knowledge/noyau.js");
  for (const [niv, obj] of [["debutant", "force"], ["intermediaire", "hypertrophie"],
                            ["avance", "perte_poids"], ["intermediaire", "sante"]]) {
    assert.deepEqual(client.getMesocycleLogic(niv, obj, 1),
                     serveur.getMesocycleLogic(niv, obj, 1),
      `${niv}/${obj} : copie client désynchronisée — relancer gen-mesocycle.mjs`);
  }
});

test("le RPE de la base devient un RIR cohérent à l'écran", () => {
  // La base raisonne en RPE, l'app affiche du RIR : RIR = 10 − RPE.
  // Un RPE 8-9 doit donner un RIR 1-2, jamais l'inverse.
  const p5 = _per.getPhase(5, "hypertrophie", "intermediaire");   // surcharge, RPE 8-9
  const p6 = _per.getPhase(6, "hypertrophie", "intermediaire");   // deload, RPE 5-6
  const bas = (r) => parseInt(String(r).match(/\d+/)[0]);
  assert.ok(bas(p5.rir) < bas(p6.rir),
    `surcharge RIR ${p5.rir} devrait être plus proche de l'échec que déload RIR ${p6.rir}`);
});

test("la force et l'hypertrophie ont des phases NOMMÉES différemment", () => {
  const f = [1, 3, 5].map(s => _per.getPhase(s, "force").label);
  const h = [1, 3, 5].map(s => _per.getPhase(s, "hypertrophie").label);
  assert.notDeepEqual(f, h, `phases identiques : ${f.join(", ")}`);
  assert.ok(f.some(l => /techni/i.test(l)), "la force devrait démarrer sur la technique");
});

// ── Autorégulation : le déload se déclenche, il n'arrive plus au calendrier ─
const _auto = await import("../src/services/autoregulationService.js");

function _seances(n, kgFn = () => 32) {
  const log = {};
  for (let i = 0; i < n; i++) {
    log[_dk(Math.floor(i * 28 / n))] = { sets:
      Array(6).fill(0).map(() => ({ exNom: "Développé haltères incliné 30°", kg: kgFn(i), reps: 10 })) };
  }
  _store["morpho_workout_log"] = JSON.stringify(log);
}
function _resetSignaux() {
  ["morpho_sleep_log", "morpho_hr_log", "morpho_motivation_log", "mc_exoFeedback"]
    .forEach(k => delete _store[k]);
}
const _ctxAuto = { age: 27, joursParSemaine: 5, semaine: 3, semaineDeload: 6 };

test("un manque d'assiduité ne déclenche JAMAIS un déload", () => {
  _resetSignaux(); _seances(6);
  // Même avec tous les signaux de fatigue au rouge : sans volume réel,
  // il n'y a rien à récupérer. Prescrire du repos serait absurde.
  _store["morpho_sleep_log"] = JSON.stringify(
    Object.fromEntries(Array.from({ length: 7 }, (_, i) => [_dk(i), 4.5])));
  const v = _auto.evaluerAutoregulation(_ctxAuto);
  assert.equal(v.action, "simplifier", `action ${v.action} au lieu de simplifier`);
  assert.notEqual(v.action, "deload", "déload prescrit à quelqu'un qui ne s'entraîne pas");
  assert.match(v.message, /pas un problème de fatigue/i);
});

test("des douleurs multiples appellent une revue technique, pas du repos", () => {
  _resetSignaux(); _seances(18);
  _store["mc_exoFeedback"] = JSON.stringify(Object.fromEntries(
    ["Développé militaire barre debout", "Squat barre nuque (high-bar)", "Rowing barre 45°"]
      .map(nm => [nm, [{ date: "2026-07-01", pain: 0 }, { date: "2026-07-20", pain: 2 }]])));
  const v = _auto.evaluerAutoregulation(_ctxAuto);
  assert.equal(v.action, "revue_technique");
  assert.match(v.message, /repos ne répare pas/i);
  assert.ok(v.ajustement?.charge && v.ajustement.charge < 1, "aucun allègement de charge");
  assert.ok(!v.ajustement?.series, "le volume ne doit pas être coupé pour une douleur technique");
});

test("une fatigue accumulée réelle avance le déload", () => {
  _resetSignaux();
  _seances(18, i => (i < 9 ? 34 : 30));            // performances en baisse
  _store["morpho_sleep_log"] = JSON.stringify(
    Object.fromEntries(Array.from({ length: 7 }, (_, i) => [_dk(i), 5.0])));
  const hr = {};
  for (let i = 1; i < 30; i++) hr[_dk(i)] = 55;
  for (let i = 0; i < 5; i++)  hr[_dk(i)] = 66;
  _store["morpho_hr_log"] = JSON.stringify(hr);
  _store["morpho_motivation_log"] = JSON.stringify(
    Object.fromEntries(Array.from({ length: 5 }, (_, i) => [_dk(i), 2])));
  const v = _auto.evaluerAutoregulation(_ctxAuto);
  assert.equal(v.action, "deload");
  assert.ok(v.score >= 6, `score ${v.score} sous le seuil`);
  assert.ok(v.signaux.length >= 2, "un seul signal ne devrait pas suffire");
  assert.match(v.titre, /avancer/i);
});

test("un signal isolé ne fait pas dévier du plan", () => {
  _resetSignaux(); _seances(18);
  _store["morpho_motivation_log"] = JSON.stringify(
    Object.fromEntries(Array.from({ length: 5 }, (_, i) => [_dk(i), 2])));
  const v = _auto.evaluerAutoregulation(_ctxAuto);
  assert.notEqual(v.action, "deload", "déload sur un signal unique");
});

test("aucun déload n'est avancé si on y est déjà", () => {
  _resetSignaux();
  _seances(18, i => (i < 9 ? 34 : 30));
  _store["morpho_sleep_log"] = JSON.stringify(
    Object.fromEntries(Array.from({ length: 7 }, (_, i) => [_dk(i), 5.0])));
  const hr = {};
  for (let i = 1; i < 30; i++) hr[_dk(i)] = 55;
  for (let i = 0; i < 5; i++)  hr[_dk(i)] = 66;
  _store["morpho_hr_log"] = JSON.stringify(hr);
  const v = _auto.evaluerAutoregulation({ ..._ctxAuto, semaine: 6 });
  assert.notEqual(v.action, "deload", "déload avancé alors qu'on est en semaine de déload");
});

test("l'autorégulation corrige la phase sans la remplacer", () => {
  const phase = { series: 4, charge: 60 };
  const sans = _auto.appliquerAutoregulation(phase, { ajustement: null });
  assert.equal(sans.autoregule, false);
  assert.equal(sans.series, 4);
  const avec = _auto.appliquerAutoregulation(phase,
    { ajustement: { series: 0.6, charge: 0.9 }, titre: "Déload avancé" });
  assert.ok(avec.series < 4 && avec.charge < 60);
  assert.equal(avec.autoregule, true);
  assert.equal(avec.raisonAutoregulation, "Déload avancé");
});

test("trop peu de séances → aucune conclusion hâtive", () => {
  _resetSignaux(); _seances(2);
  const v = _auto.evaluerAutoregulation(_ctxAuto);
  assert.equal(v.action, "aucune");
  assert.equal(v.titre, "");
});

test("le verdict d'autorégulation est affiché, pas seulement calculé", () => {
  const pv = _fs.readFileSync("src/features/training/ProgrammeView.jsx", "utf8");
  assert.match(pv, /evaluerAutoregulation\(/, "autorégulation non appelée");
  assert.match(pv, /carteAuto/, "carte non construite");
  // Elle doit s'afficher dans les DEUX cas : périodisation active ou non.
  // Un risque de blessure ne dépend pas d'un réglage d'affichage.
  assert.equal((pv.match(/\{carteAuto\}/g) || []).length, 2,
    "la carte manque dans l'une des deux branches");
});

// ── Syndromes croisés de Janda : étirer les raccourcis, MUSCLER les inhibés ─
test("lordose + bascule du bassin → syndrome croisé inférieur", () => {
  const r = _mob.getRoutinesMobilite(_ficheP(["hyperlordose", "bascule_bassin"]),
    { metier: "Bureau assis", pathologies: [] });
  const s = r.routines.find(x => x.cle === "croise_inferieur");
  assert.ok(s, "syndrome croisé inférieur non détecté");
  assert.match(s.cause, /psoas|érecteurs/i);
  // Le point clé : les fessiers et abdos sont INHIBÉS, pas raides.
  assert.match(s.renforcer, /INHIB/i);
  assert.match(s.renforcer, /aggraverait|moitié du traitement/i);
});

test("cyphose + antépulsion → syndrome croisé supérieur", () => {
  const r = _mob.getRoutinesMobilite(_ficheP(["cyphose", "antepulsion_scapulaire"]),
    { metier: "", pathologies: [] });
  const s = r.routines.find(x => x.cle === "croise_superieur");
  assert.ok(s, "syndrome croisé supérieur non détecté");
  assert.match(s.renforcer, /trapèze inférieur|dentelé/i);
  // L'erreur classique : étirer le haut du dos déjà trop long.
  assert.match(s.renforcer, /inverse|muscler/i);
});

test("un syndrome remplace les routines partielles, sans doublon", () => {
  const r = _mob.getRoutinesMobilite(_ficheP(["cyphose", "antepulsion_scapulaire"]),
    { metier: "Bureau assis", pathologies: [] });
  const cles = r.routines.map(x => x.cle);
  assert.ok(cles.includes("croise_superieur"));
  assert.ok(!cles.includes("epaules_enroulees"), "routine partielle cumulée au syndrome");
  assert.ok(!cles.includes("cervicales"), "cervicales cumulées au syndrome supérieur");
});

test("cumuler les deux syndromes reste faisable au quotidien", () => {
  const r = _mob.getRoutinesMobilite(
    _ficheP(["hyperlordose", "bascule_bassin", "cyphose", "antepulsion_scapulaire"]),
    { metier: "Bureau assis", pathologies: [] });
  assert.ok(r.minutesJour <= 22, `${r.minutesJour} min/jour : personne ne tiendra`);
  const cles = r.routines.map(x => x.cle);
  assert.ok(cles.includes("croise_inferieur") && cles.includes("croise_superieur"));
});

test("les syndromes passent en tête de la séance corrective", () => {
  const s = _mob.getSeanceMobilite(_ficheP(["hyperlordose", "bascule_bassin"]),
    { metier: "Bureau assis", pathologies: [] }, {});
  assert.equal(s.type, "corrective");
  assert.match(s.exercices[0].zone, /croisé inférieur/i);
});

test("une posture saine ne déclenche AUCUN syndrome", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: [] });
  assert.equal(r.routines.filter(x => /croise_/.test(x.cle)).length, 0);
});

// ── Sciatalgie : faire GLISSER le nerf, ne pas le tendre ───────────────────
test("une sciatique déclenche la routine nerveuse dédiée", () => {
  for (const pat of ["Sciatique", "Hernie discale", "Sciatalgie"]) {
    const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: [pat] });
    const s = r.routines.find(x => x.cle === "sciatique");
    assert.ok(s, `${pat} : routine sciatique absente`);
    assert.match(s.exercices[0].nom, /glissement|flossing/i,
      "le glissement nerveux doit venir en premier");
  }
});

test("la sciatique met en garde contre l'étirement d'un nerf irrité", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: ["Sciatique"] });
  const s = r.routines.find(x => x.cle === "sciatique");
  assert.match(s.renforcer, /GLISSER|aggrave/i);
  assert.match(s.renforcer, /sous le genou/i, "absence du critère d'arrêt");
});

test("une hernie discale est distinguée d'une compression du piriforme", () => {
  const hernie = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: ["Hernie discale"] })
    .routines.find(x => x.cle === "sciatique");
  const pir = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: ["Piriforme"] })
    .routines.find(x => x.cle === "sciatique");
  assert.notEqual(hernie.cause, pir.cause, "même explication pour deux causes différentes");
  assert.match(hernie.cause, /discale|radiculaire/i);
});

test("la sciatique remplace la routine rachis générique", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "Manutention", pathologies: ["Sciatique"] });
  const cles = r.routines.map(x => x.cle);
  assert.ok(cles.includes("sciatique"));
  assert.ok(!cles.includes("rachis_charges"), "doublon rachis + sciatique");
});

// ── Respiration : la cause souvent ignorée du croisé supérieur ─────────────
test("la respiration est proposée aux profils assis et aux postures fermées", () => {
  ["Bureau assis", "Travail de nuit"].forEach(m => {
    const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: m, pathologies: [] });
    assert.ok(r.routines.some(x => x.cle === "respiration"), `${m} : respiration absente`);
  });
});

test("la respiration ne passe JAMAIS devant une douleur", () => {
  const s = _mob.getSeanceMobilite(_ficheP([]),
    { metier: "Bureau assis", pathologies: ["Sciatique"] }, {});
  assert.match(s.exercices[0].zone, /sciatalgie/i,
    "la respiration passe avant une sciatique");
});

// ── Progression : les renforcements évoluent, pas les étirements ───────────
test("les exercices de renforcement progressent avec le temps", () => {
  const f = _ficheP(["hyperlordose", "bascule_bassin"]);
  const pr = { metier: "Bureau assis", pathologies: [] };
  const s0  = _mob.getRoutinesMobilite(f, pr, { semaines: 0 }).routines
    .find(x => x.cle === "croise_inferieur");
  const s12 = _mob.getRoutinesMobilite(f, pr, { semaines: 12 }).routines
    .find(x => x.cle === "croise_inferieur");
  const noms0 = s0.exercices.map(e => e.nom);
  const noms12 = s12.exercices.map(e => e.nom);
  assert.notDeepEqual(noms0, noms12, "aucune progression après 12 semaines");
  // Les ÉTIREMENTS ne changent pas : leur rôle est de restaurer une longueur.
  assert.ok(noms12.includes("Étirement psoas en fente haute"),
    "un étirement a été remplacé alors qu'il ne doit pas progresser");
  // Les exercices progressés portent la trace de ce qu'ils remplacent.
  assert.ok(s12.exercices.some(e => e.remplace), "traçabilité de la progression absente");
});

test("aucune progression avant 4 semaines", () => {
  const f = _ficheP(["hyperlordose", "bascule_bassin"]);
  const pr = { metier: "Bureau assis", pathologies: [] };
  const s3 = _mob.getRoutinesMobilite(f, pr, { semaines: 3 }).routines
    .find(x => x.cle === "croise_inferieur");
  assert.ok(!s3.exercices.some(e => e.remplace),
    "progression déclenchée avant que le motif moteur soit installé");
});

// ── Plafonds : une séance trop longue est une séance skippée ───────────────
test("aucune séance de mobilité ne dépasse 15 minutes", () => {
  const cas = [
    [[], "", []],
    [["cyphose"], "Bureau", []],
    [["hyperlordose", "bascule_bassin", "cyphose", "antepulsion_scapulaire", "valgus_genou"],
     "Bureau assis", ["Lombalgie", "Conflit épaule", "Sciatique", "Tendinite Achille"]],
  ];
  cas.forEach(([post, met, pat]) => {
    const s = _mob.getSeanceMobilite(_ficheP(post), { metier: met, pathologies: pat }, {});
    assert.ok(s.minutes <= 15, `${s.minutes} min : sera skippée`);
    assert.ok(s.exercices.length <= 7, `${s.exercices.length} exercices`);
  });
});

test("toutes les zones prioritaires sont couvertes malgré le plafond", () => {
  const s = _mob.getSeanceMobilite(
    _ficheP(["hyperlordose", "bascule_bassin", "cyphose", "antepulsion_scapulaire"]),
    { metier: "Bureau assis", pathologies: ["Sciatique"] }, {});
  const zones = new Set(s.exercices.map(e => e.zone));
  assert.ok(zones.size >= 4, `${zones.size} zones seulement : certaines sont ignorées`);
});

// ── Décompression vertébrale : indiquée, avec ses contre-indications ───────
test("une discopathie déclenche la décompression vertébrale", () => {
  for (const pat of ["Hernie discale", "Sciatique", "Lombalgie", "Discopathie"]) {
    const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: [pat] });
    const d = r.routines.find(x => x.cle === "decompression");
    assert.ok(d, `${pat} : décompression absente`);
    assert.match(d.exercices[0].nom, /suspend/i, "la suspension devrait venir en premier");
  }
});

test("la suspension est contre-indiquée si l'épaule est douloureuse", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]),
    { metier: "", pathologies: ["Hernie discale", "Conflit épaule"] });
  assert.ok(!r.routines.some(x => x.cle === "decompression"),
    "suspension proposée malgré une épaule pathologique");
  assert.ok(r.routines.some(x => x.cle === "epaule_patho"), "routine épaule absente");
});

test("la suspension précise passive ET descente contrôlée", () => {
  const d = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: ["Hernie discale"] })
    .routines.find(x => x.cle === "decompression");
  const susp = d.exercices[0];
  assert.match(susp.comment, /PASSIVE|passive/, "consigne de suspension passive absente");
  assert.match(susp.comment, /REDESCEND|redescend/i, "aucune consigne sur la descente");
  // La décompression soulage mais ne corrige pas : le renforcement est requis.
  assert.match(d.renforcer, /SOULAGE|symptomatique/i);
});

// ── Mobilité pilotée par l'objectif ────────────────────────────────────────
test("chaque objectif reçoit sa propre mobilité", () => {
  const attendu = {
    force: "objectif_force", prep_physique: "objectif_force",
    hypertrophie: "objectif_hypertrophie", perte_poids: "objectif_recuperation",
  };
  for (const [obj, cle] of Object.entries(attendu)) {
    const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: [], objectif: obj });
    assert.ok(r.routines.some(x => x.cle === cle), `${obj} : routine ${cle} absente`);
  }
});

test("la mobilité de performance se place AVANT la séance", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: [], objectif: "force" });
  const o = r.routines.find(x => x.cle === "objectif_force");
  assert.equal(o.moment, "avant_seance",
    "une mobilité de performance après la séance ne sert à rien");
  // Elle ne doit pas entamer le budget quotidien.
  assert.equal(r.minutesJour, 0, "la routine avant-séance compte dans le budget quotidien");
});

test("la prépa physique met en garde contre l'étirement statique avant l'effort", () => {
  const o = _mob.getRoutinesMobilite(_ficheP([]),
    { metier: "", pathologies: [], objectif: "prep_physique" })
    .routines.find(x => x.cle === "objectif_force");
  assert.match(o.cause, /statique/i);
  assert.match(o.cause, /réduit la production de force|PAS d'étirement/i);
});

test("un objectif santé n'ajoute aucune routine de performance", () => {
  const r = _mob.getRoutinesMobilite(_ficheP([]), { metier: "", pathologies: [], objectif: "sante" });
  assert.equal(r.routines.filter(x => /^objectif_/.test(x.cle)).length, 0);
});

test("un profil complet reste dans les budgets malgré tous les cumuls", () => {
  const r = _mob.getRoutinesMobilite(_ficheP(["cyphose", "antepulsion_scapulaire"]),
    { metier: "Bureau assis", pathologies: ["Hernie discale"], objectif: "force" });
  const s = _mob.getSeanceMobilite(_ficheP(["cyphose", "antepulsion_scapulaire"]),
    { metier: "Bureau assis", pathologies: ["Hernie discale"], objectif: "force" }, {});
  assert.ok(r.minutesJour <= 20, `${r.minutesJour} min/jour hors séance`);
  assert.ok(s.minutes <= 15, `${s.minutes} min de séance`);
  // La décompression, prioritaire, doit survivre au plafond.
  assert.ok(r.routines.some(x => x.cle === "decompression"),
    "la décompression a été écartée par le plafond alors qu'elle est prioritaire");
});

test("l'objectif atteint bien le service depuis l'écran", () => {
  const mp = _fs.readFileSync("src/features/training/components/MobilitePage.jsx", "utf8");
  assert.equal((mp.match(/objectif: prog\?\.objectif/g) || []).length, 2,
    "l'objectif manque dans l'un des deux appels");
});

// ── Échauffement : une séquence unique, plafonnée, et RÉELLEMENT comptée ───
const _ech = await import("../src/services/echauffementService.js");
const _train = await import("../src/utils/training.js");

const _seancePec = { focus: "Pectoraux", echauffement: "Coiffe avant tout développé.",
  exercices: [{ nom: "Développé couché barre", reps: "8-10", cat: "principal" },
              { nom: "Écarté poulie vis-à-vis", reps: "12" }] };

test("l'échauffement suit les trois temps du coach", () => {
  const r = _ech.getEchauffement(_seancePec, _ficheP([]), { objectif: "hypertrophie" }, {});
  const cles = r.blocs.map(b => b.cle);
  assert.ok(cles.includes("general"), "aucune mise en route générale");
  assert.ok(cles.includes("specifique"), "aucune préparation ciblée");
  assert.ok(r.blocs[0].cle === "general", "le spécifique passe avant la température");
});

test("l'échauffement ne dépasse JAMAIS 10 minutes hors montée en charge", () => {
  const cas = [
    [_ficheP([]), { objectif: "hypertrophie" }],
    [_ficheP(["cyphose", "antepulsion_scapulaire"]),
     { metier: "Bureau assis", pathologies: ["Conflit épaule"], objectif: "force" }],
  ];
  cas.forEach(([f, pr]) => {
    const r = _ech.getEchauffement(_seancePec, f, pr, {});
    assert.ok(r.minutes <= 10, `${r.minutes} min : sera sauté`);
  });
});

test("la montée en charge est chiffrée correctement", () => {
  // Piège : "30-45s" donne 3045 s si l'on retire simplement les non-chiffres.
  const r = _ech.getEchauffement(_seancePec, _ficheP([]), { objectif: "hypertrophie" },
    { chargePremierExo: 80 });
  assert.ok(r.montee.length > 0, "aucune montée en charge sur un développé à 80 kg");
  assert.ok(r.minutesMontee > 0 && r.minutesMontee <= 10,
    `${r.minutesMontee} min de montée : calcul erroné`);
  assert.ok(r.minutesTotal <= 20, `${r.minutesTotal} min au total`);
});

test("une routine morpho prime sur la préparation générique", () => {
  const r = _ech.getEchauffement(_seancePec,
    _ficheP(["cyphose", "antepulsion_scapulaire"]),
    { metier: "Bureau assis", pathologies: ["Conflit épaule"], objectif: "hypertrophie" }, {});
  const spec = r.blocs.find(b => b.cle === "specifique");
  assert.ok(spec.exercices.some(e => e.origine && /épaule|syndrome|amplitude/i.test(e.origine)),
    "la préparation ne tient pas compte de l'analyse morphologique");
});

test("la durée annoncée inclut désormais l'échauffement", () => {
  const j = { exercices: Array(6).fill({ series: "4", reps: "8-10", repos: "60-90s" }) };
  const travail = _train.dureeSeance(j, { minutesEchauffement: 0 });
  const total = _train.dureeSeance(j);
  assert.ok(total > travail, "l'échauffement n'est pas compté");
  assert.equal(total - travail, 8, "forfait d'échauffement incorrect");
  // Piège du parsing : "60-90s" ne doit pas être lu comme 6090 secondes.
  assert.ok(travail < 120, `${travail} min : le repos est mal parsé`);
});

test("le prompt annonce la durée réelle au modèle", () => {
  const src = _fs.readFileSync("api/generate-program.js", "utf8");
  assert.match(src, /\+ 8 min d'échauffement/,
    "le modèle ignore que l'échauffement s'ajoute");
  assert.match(src, /dureeCible - 8/,
    "le budget d'exercices ne déduit pas l'échauffement");
  assert.match(src, /comptés deux[\s\S]{0,6}fois/,
    "rien n'empêche le modèle d'ajouter des exercices d'échauffement");
});

// ── Douleurs : on décrit des SYMPTÔMES, on ne demande pas un diagnostic ────
const _dlr = await import("../api/_knowledge/douleurs.js");

test("un symptôme décrit produit un mécanisme et des contre-indications", () => {
  const r = _dlr.lireDouleur({ zone: "epaule", localisation: "anterieure", mouvement: "pousser_haut" });
  assert.equal(r.reconnu, true);
  assert.ok(r.mecanisme.length > 40);
  assert.ok(r.eviter.includes("Développé nuque"), "le développé nuque devrait être écarté");
  assert.ok(r.privilegier.length > 0);
  assert.ok(r.consigne.length > 20);
});

test("la même zone donne des lectures DIFFÉRENTES selon le mouvement", () => {
  const haut  = _dlr.lireDouleur({ zone: "epaule", localisation: "anterieure", mouvement: "pousser_haut" });
  const devant = _dlr.lireDouleur({ zone: "epaule", localisation: "anterieure", mouvement: "pousser_devant" });
  assert.notEqual(haut.mecanisme, devant.mecanisme,
    "le mouvement déclencheur ne change rien : l'information la plus utile est perdue");
  assert.notDeepEqual(haut.eviter, devant.eviter);
});

test("un genou antérieur en descente n'est pas un genou en rotation", () => {
  const patello = _dlr.lireDouleur({ zone: "genou", localisation: "anterieure", mouvement: "descente" });
  const rotation = _dlr.lireDouleur({ zone: "genou", localisation: "interne", mouvement: "rotation" });
  assert.notEqual(patello.mecanisme, rotation.mecanisme);
  assert.equal(rotation.avisRecommande, true, "une douleur en rotation devrait orienter vers un avis");
});

test("les drapeaux rouges sont levés", () => {
  const nuit = _dlr.lireDouleur({ zone: "epaule", localisation: "laterale",
    mouvement: "elever_cote", moment: "nuit" });
  assert.ok(nuit.drapeaux.length > 0, "douleur nocturne non signalée");
  assert.equal(nuit.avisRecommande, true);
  const jambe = _dlr.lireDouleur({ zone: "dos", localisation: "descend", mouvement: "flexion" });
  assert.ok(jambe.drapeaux.some(f => /nerveuse|jambe/i.test(f)), "irradiation non signalée");
});

test("un motif non reconnu protège la zone sans inventer d'explication", () => {
  const r = _dlr.lireDouleur({ zone: "hanche", localisation: "fessier", mouvement: "ecart" });
  assert.equal(r.reconnu, false);
  assert.ok(r.consigne.length > 20, "aucune consigne de prudence");
  assert.deepEqual(r.eviter, [], "des exercices écartés sans motif identifié");
});

test("TOUT exercice recommandé existe au catalogue", () => {
  const noms = new Set();
  for (const [zone, cfg] of Object.entries(_dlr.QUESTIONNAIRE)) {
    for (const l of cfg.localisations) for (const m of cfg.mouvements) {
      _dlr.lireDouleur({ zone, localisation: l.cle, mouvement: m.cle })
        .privilegier.forEach(nm => noms.add(nm));
    }
  }
  const absents = [...noms].filter(nm => !_cat.findInCatalogue(nm));
  assert.deepEqual(absents, [], `recommandations introuvables : ${absents.join(", ")}`);
});

test("le bloc prompt interdit de nommer une pathologie", () => {
  const b = _dlr.buildDouleursBlock([
    { zone: "epaule", localisation: "anterieure", mouvement: "pousser_haut" }]);
  assert.match(b, /en aucun cas un diagnostic/i);
  assert.match(b, /Ne nomme jamais de pathologie/i);
  assert.match(b, /EXERCICES À ÉCARTER/);
});

test("aucune douleur déclarée → aucun bloc", () => {
  assert.equal(_dlr.buildDouleursBlock([]), "");
  assert.equal(_dlr.buildDouleursBlock(), "");
});

test("le questionnaire couvre les cinq zones avec leurs mouvements", () => {
  ["epaule", "genou", "dos", "coude", "hanche"].forEach(z => {
    const q = _dlr.QUESTIONNAIRE[z];
    assert.ok(q, `zone ${z} absente`);
    assert.ok(q.localisations.length >= 3, `${z} : localisations trop grossières`);
    assert.ok(q.mouvements.length >= 4, `${z} : pas assez de mouvements déclencheurs`);
  });
});

test("le questionnaire client est identique au serveur", async () => {
  const client = await import("../src/data/douleurs.js");
  assert.deepEqual(client.QUESTIONNAIRE, _dlr.QUESTIONNAIRE,
    "questionnaire désynchronisé — relancer gen-douleurs.mjs");
  assert.deepEqual(client.MOMENTS, _dlr.MOMENTS);
});

test("le formulaire propose les deux voies : diagnostic ET symptômes", () => {
  const src = _fs.readFileSync("src/features/ai/AnalyseIA.jsx", "utf8");
  // Les diagnostics restent pour ceux qui les connaissent.
  assert.match(src, /Conflit épaule/, "les diagnostics ont été retirés");
  // Et le questionnaire par symptômes pour les autres.
  assert.match(src, /sans savoir ce que c'est/i, "questionnaire par symptômes absent");
  assert.match(src, /QUEL MOUVEMENT DÉCLENCHE/, "le mouvement déclencheur n'est pas demandé");
  assert.match(src, /douleurs: \[\]/, "état des douleurs non initialisé");
});

test("les douleurs décrites atteignent le serveur", () => {
  const ai = _fs.readFileSync("src/services/aiService.js", "utf8");
  assert.match(ai, /JSON\.stringify\(\{ form,/,
    "le formulaire complet n'est pas transmis : douleurs perdues");
  const gp = _fs.readFileSync("api/generate-program.js", "utf8");
  assert.match(gp, /form\.douleurs \|\| \[\]\)\.slice\(0, 5\)/,
    "aucun bornage du nombre de douleurs");
});

test("le système impose des règles d'échappement explicites", () => {
  const src = _fs.readFileSync("api/generate-program.js", "utf8");
  assert.match(src, /RÈGLES D'ÉCHAPPEMENT STRICTES/,
    "rien n'empêche le modèle d'émettre un JSON mal échappé");
  assert.match(src, /jamais de retour à la ligne brut dans une chaîne/);
  // Le rappel d'enjeu : un JSON cassé fait tout échouer.
  assert.match(src, /fait échouer toute la génération/);
});

console.log(`\n${n} tests de fumée OK`);
