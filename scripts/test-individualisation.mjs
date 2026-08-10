// Vérifie les trois chantiers : individualisation, évolution du corps,
// respect du temps de séance. Aucun appel Anthropic — coût 0 €.
//   node scripts/test-individualisation.mjs
import { getVariationDirectives, empreinteAthlete } from "../api/_knowledge/couche0.js";
import { comparerFiches, buildEvolutionBlock, besoinNouvellesPhotos } from "../api/_knowledge/evolution.js";
import { validateTempsSeance } from "../api/_knowledge/conformite.js";

let ok = 0, ko = 0;
const check = (nom, cond, detail = "") => {
  if (cond) { ok++; console.log(`  ✅ ${nom}`); }
  else { ko++; console.log(`  ❌ ${nom}${detail ? ` — ${detail}` : ""}`); }
};

console.log("\n=== 1. INDIVIDUALISATION — deux inconnus, profils identiques ===");
const commun = { cycleNum: 1, nbJours: 3, objectif: "hypertrophie", niveau: "intermediaire" };
const a = getVariationDirectives({ ...commun, empreinte: "user-aaa-111" });
const b = getVariationDirectives({ ...commun, empreinte: "user-bbb-222" });
check("Le split imposé diffère", a.split_impose !== b.split_impose,
  `${a.split_impose} / ${b.split_impose}`);
check("L'accent de méthode ou la vague diffère aussi",
  a.accent_methode !== b.accent_methode || a.vague_de_reps !== b.vague_de_reps);

// Sur 40 athlètes, mesure la dispersion réelle des combinaisons.
const combos = new Set();
for (let i = 0; i < 40; i++) {
  const d = getVariationDirectives({ ...commun, empreinte: `athlete-${i}-${i * 7}` });
  combos.add(`${d.split_impose}|${d.accent_methode}|${d.vague_de_reps}`);
}
check(`40 athlètes → ${combos.size} combinaisons distinctes (attendu ≥ 12)`, combos.size >= 12);

console.log("\n=== 2. INDIVIDUALISATION — le même athlète reste cohérent ===");
const x1 = getVariationDirectives({ ...commun, empreinte: "user-aaa-111" });
check("Même athlète, même cycle → résultat identique (déterministe)",
  JSON.stringify(a) === JSON.stringify(x1));
const x2 = getVariationDirectives({ ...commun, cycleNum: 2, empreinte: "user-aaa-111" });
check("Même athlète, cycle suivant → la variation change",
  x1.split_impose !== x2.split_impose || x1.vague_de_reps !== x2.vague_de_reps);
check("Empreinte stable pour un même identifiant",
  empreinteAthlete("user-aaa-111") === empreinteAthlete("user-aaa-111"));
check("Empreintes différentes pour des identifiants différents",
  empreinteAthlete("user-aaa-111") !== empreinteAthlete("user-bbb-222"));

console.log("\n=== 3. ÉVOLUTION — un point faible qui rattrape ===");
const ficheAvant = {
  date: "2026-05-01T00:00:00.000Z",
  observations: { composition: { masse_grasse_visuelle: "haute", densite_musculaire: "moderee" },
    posture: ["cyphose", "valgus_genoux"] },
  consequences: { points_faibles_visuels: [
    { groupe: "dos_largeur", niveau: "tres_en_retard" },
    { groupe: "mollets", niveau: "en_retard" },
  ] },
};
const ficheApres = {
  date: "2026-06-15T00:00:00.000Z",
  observations: { composition: { masse_grasse_visuelle: "moderee", densite_musculaire: "developpee" },
    posture: ["valgus_genoux"] },
  consequences: { points_faibles_visuels: [
    { groupe: "dos_largeur", niveau: "en_retard" },
    { groupe: "mollets", niveau: "en_retard" },
  ] },
};
const diff = comparerFiches(ficheAvant, ficheApres);
check("Comparaison possible", diff.comparable);
check("45 jours écoulés détectés", diff.joursEcoules === 45, String(diff.joursEcoules));
check("Dos qui rattrape reconnu comme progrès",
  diff.ameliorations.some(t => /dos/i.test(t)), JSON.stringify(diff.ameliorations));
check("Masse grasse en baisse reconnue",
  diff.ameliorations.some(t => /masse grasse/i.test(t)));
check("Densité musculaire en hausse reconnue",
  diff.ameliorations.some(t => /densité/i.test(t)));
check("Cyphose corrigée reconnue",
  diff.ameliorations.some(t => /cyphose/i.test(t)));
check("Mollets stagnants signalés comme inchangés",
  diff.stables.some(t => /mollets/i.test(t)), JSON.stringify(diff.stables));

const bloc = buildEvolutionBlock(ficheAvant, ficheApres);
check("Bloc d'évolution produit", bloc.includes("ÉVOLUTION MORPHOLOGIQUE RÉELLE"));
check("Consigne « ça fonctionne, on maintient »", /FONCTIONNE/.test(bloc));
check("Consigne « ça stagne, on change de levier »", /change de levier|change d'approche/.test(bloc));

console.log("\n=== 4. ÉVOLUTION — cas où il ne faut RIEN conclure ===");
check("Sans fiche précédente : aucun bloc", buildEvolutionBlock(null, ficheApres) === "");
const flou = { date: "2026-06-15T00:00:00.000Z",
  observations: { composition: { masse_grasse_visuelle: "indetermine" } },
  consequences: { points_faibles_visuels: [{ groupe: "dos_largeur", niveau: "tres_en_retard" }] } };
const d2 = comparerFiches(ficheAvant, flou);
check("Photo moins nette n'est PAS lue comme une régression",
  !d2.regressions.some(t => /masse grasse/i.test(t)), JSON.stringify(d2.regressions));

const regression = { ...ficheApres, consequences: { points_faibles_visuels: [
  { groupe: "dos_largeur", niveau: "tres_en_retard" },
  { groupe: "pectoraux", niveau: "en_retard" }] } };
const d3 = comparerFiches(ficheApres, regression);
check("Nouveau point faible détecté",
  d3.regressions.some(t => /pectoraux/i.test(t)), JSON.stringify(d3.regressions));

console.log("\n=== 5. NOUVELLES PHOTOS — la politique du coach ===");
const ilya = (j) => new Date(Date.now() - j * 864e5).toISOString();
check("Fiche de 10 jours, poids stable → on ne demande rien",
  !besoinNouvellesPhotos({ dateFiche: ilya(10), poidsFiche: 78, poidsActuel: 78.4 }).besoin);
check("6 semaines écoulées → on redemande",
  besoinNouvellesPhotos({ dateFiche: ilya(43), poidsFiche: 78, poidsActuel: 78 }).besoin);
check("Cycle terminé → on redemande",
  besoinNouvellesPhotos({ dateFiche: ilya(20), poidsFiche: 78, poidsActuel: 78, cyclesDepuis: 1 }).besoin);
check("2 kg d'écart → on redemande",
  besoinNouvellesPhotos({ dateFiche: ilya(15), poidsFiche: 78, poidsActuel: 80.2 }).besoin);
check("Recomposition (poids stable) : les 6 semaines prennent le relais",
  besoinNouvellesPhotos({ dateFiche: ilya(45), poidsFiche: 78, poidsActuel: 78 }).besoin);
check("Aucune fiche → on propose l'analyse",
  besoinNouvellesPhotos({}).besoin);
check("Le message explique la recomposition",
  /poids n'a pas bougé/.test(besoinNouvellesPhotos({ dateFiche: ilya(43) }).message));

console.log("\n=== 6. TEMPS DE SÉANCE ===");
const ex = (nom, reps = "8", repos = "2 min") => ({ nom, series: "4", reps, repos, tempo: "3-1-2-0" });
const seance = (jour, n, base = "Développé couché barre") =>
  ({ jour, exercices: Array.from({ length: n }, (_, i) => ex(`${base} ${i + 1}`)) });

check("9 exercices en 45 min de force : rejeté",
  validateTempsSeance({ programme: { seances: [seance("Lundi", 9)] } }, "force", 45).length > 0);
check("4 exercices en 45 min de force : accepté",
  validateTempsSeance({ programme: { seances: [seance("Lundi", 4)] } }, "force", 45).length === 0,
  JSON.stringify(validateTempsSeance({ programme: { seances: [seance("Lundi", 4)] } }, "force", 45)));
check("7 exercices en 90 min d'hypertrophie : accepté",
  validateTempsSeance({ programme: { seances: [seance("Lundi", 7)] } }, "hypertrophie", 90).length === 0,
  JSON.stringify(validateTempsSeance({ programme: { seances: [seance("Lundi", 7)] } }, "hypertrophie", 90)));
check("Séance quasi vide en 90 min : signalée",
  validateTempsSeance({ programme: { seances: [seance("Lundi", 2)] } }, "hypertrophie", 90).length > 0);
check("Durée non renseignée : validateur silencieux",
  validateTempsSeance({ programme: { seances: [seance("Lundi", 9)] } }, "force", 0).length === 0);

const avecCorrectifs = { programme: { seances: [{ jour: "Lundi", exercices: [
  ex("Squat barre nuque (high-bar)", "5", "3 min"), ex("Développé couché barre", "5", "3 min"),
  ex("Rowing barre 45°", "6", "3 min"), ex("Planche avant isométrique", "30s", "45s"),
  ex("Face pull poulie haute corde", "15", "45s"), ex("Pallof press câble", "12", "45s"),
] }] } };
check("Gainage et correctifs comptés pour moitié",
  validateTempsSeance(avecCorrectifs, "force", 60).length === 0,
  JSON.stringify(validateTempsSeance(avecCorrectifs, "force", 60)));

console.log(`\n${"─".repeat(50)}\nRÉSULTAT : ${ok} réussis, ${ko} échoués\n`);
process.exit(ko ? 1 : 0);
