// Vérifie les points 2 à 6 de l'audit : échauffement dans le calcul de durée,
// cardio, fréquence par muscle, deload conditionnel, profil femme/homme.
//   node scripts/test-programmation.mjs
import { buildServerPrompt } from "../api/generate-program.js";
import { buildCardioBlock } from "../api/_knowledge/cardio.js";
import { buildFrequenceBlock } from "../api/_knowledge/frequence.js";
import { reserveEchauffementMin, calibrerSeance } from "../api/_knowledge/prescription.js";
import { validatePointsFaibles, validateTempsSeance } from "../api/_knowledge/conformite.js";

let ok = 0, ko = 0;
const check = (nom, cond, detail = "") => {
  if (cond) { ok++; console.log(`  ✅ ${nom}`); }
  else { ko++; console.log(`  ❌ ${nom}${detail ? ` — ${detail}` : ""}`); }
};

const prompt = (form = {}, dossier = {}, fiche = null) => buildServerPrompt({
  form: {
    prenom: "T", age: 30, sexe: "homme", poids: 78, taille: 178,
    niveau: "intermediaire", objectif: "hypertrophie", jours: ["Lun", "Mer", "Ven"],
    materiel: ["salle_complete"], dureeSeance: 60, pathologies: [], douleurs: [], sport: "",
    ...form,
  },
  dossier, fiche,
  directives: { split_impose: "x", accent_methode: "y", vague_de_reps: "z", regle_overlap: "w" },
  cycleNum: 1,
  candidats: [{ n: "Squat barre nuque (high-bar)", groupe: "Quadriceps", mat: "barre" }],
});

console.log("\n=== 2. ÉCHAUFFEMENT COMPTÉ DANS LA DURÉE ===");
check("Force réserve plus de temps qu'hypertrophie",
  reserveEchauffementMin("force") > reserveEchauffementMin("hypertrophie"),
  `${reserveEchauffementMin("force")} vs ${reserveEchauffementMin("hypertrophie")}`);
check("Perte de poids réserve le moins", reserveEchauffementMin("perte_poids") <= 8);
check("Réserve annoncée dans le prompt", prompt({ objectif: "force" }).includes("15 min d'échauffement"));
check("La montée en charge est mentionnée comme déjà comptée",
  prompt().includes("séries d'approche") && prompt().includes("comptés deux fois"));
const cForce = calibrerSeance("force", Math.max(20, 60 - reserveEchauffementMin("force")));
const cAvant = calibrerSeance("force", Math.max(20, 60 - 8));
check("Moins d'exercices prescrits qu'avant sur 60 min de force",
  cForce.max <= cAvant.max, `${cForce.max} vs ${cAvant.max}`);
check("Consigne « n'ajoute pas d'exercices d'échauffement »",
  prompt().includes("n'ajoute pas d'exercices d'échauffement"));

console.log("\n=== 3. CARDIO ===");
for (const [obj, titre] of [["perte_poids", "PERTE DE POIDS"], ["force", "FORCE"],
  ["hypertrophie", "HYPERTROPHIE"], ["prep_physique", "PRÉPARATION PHYSIQUE"], ["sante", "SANTÉ"]]) {
  check(`Bloc cardio présent pour "${obj}"`, prompt({ objectif: obj }).includes(titre));
}
check("Règle d'interférence toujours transmise", prompt().includes("INTERFÉRENCE CARDIO"));
check("Musculation avant cardio dans la même séance",
  buildCardioBlock({ objectif: "perte_poids" }).includes("musculation d'abord"));
check("Perte de poids : le cardio ne remplace pas la musculation",
  buildCardioBlock({ objectif: "perte_poids" }).includes("ne remplace jamais"));
check("Force : pas de HIIT en bloc d'intensification",
  /Aucun HIIT/.test(buildCardioBlock({ objectif: "force" })));
check("Genou fragile → course proscrite",
  buildCardioBlock({ objectif: "perte_poids", pathologies: ["Ménisque"] }).includes("proscrire la course"));
check("Dos sensible → rameur en charge écarté",
  buildCardioBlock({ objectif: "perte_poids", pathologies: ["Lombalgie"] }).includes("rameur en charge"));
check("Débutant → aucun HIIT",
  buildCardioBlock({ objectif: "perte_poids", niveau: "debutant" }).includes("Débutant : aucun HIIT"));
check("5 séances → pas de session cardio en plus",
  buildCardioBlock({ objectif: "perte_poids", nbJours: 5 }).includes("temps disponible est déjà pris"));
check("2 séances → les jours libres sont exploitables",
  buildCardioBlock({ objectif: "perte_poids", nbJours: 2 }).includes("jours libres"));
check("Sport pratiqué compté comme conditionnement",
  buildCardioBlock({ objectif: "prep_physique", sport: "boxe" }).includes("comptent DÉJÀ"));
check("Sans matériel → alternatives proposées",
  buildCardioBlock({ objectif: "perte_poids", materiel: ["poids_corps"] }).includes("Sans matériel"));
check("Le cardio ne va pas dans \"exercices\"",
  buildCardioBlock({ objectif: "perte_poids" }).includes('ne figure PAS dans "exercices"'));

console.log("\n=== 4. FRÉQUENCE PAR MUSCLE ===");
check("Bloc fréquence toujours transmis", prompt().includes("FRÉQUENCE HEBDOMADAIRE PAR MUSCLE"));
check("Règle des 2 stimulations par semaine",
  buildFrequenceBlock({ nbJours: 4 }).includes("2 séances plutôt qu'une seule"));
check("Ordre des leviers : fréquence avant volume",
  /FRÉQUENCE d'abord[\s\S]*PLACEMENT ensuite[\s\S]*VOLUME en dernier/.test(buildFrequenceBlock({})));
check("Avertissement contre le saut direct au volume",
  buildFrequenceBlock({}).includes("erreur la plus courante"));
check("Cible adaptée à 3 séances", buildFrequenceBlock({ nbJours: 3 }).includes("2 en moyenne"));
check("Cible adaptée à 6 séances", buildFrequenceBlock({ nbJours: 6 }).includes("2 à 3"));
check("Point faible → consigne sur le levier utilisé",
  buildFrequenceBlock({ aPointsFaibles: true }).includes("reflexion.priorites"));

console.log("\n=== 4bis. LA FRÉQUENCE EST VÉRIFIÉE APRÈS GÉNÉRATION ===");
const fiche = { consequences: { points_faibles_visuels: [{ groupe: "dos_largeur", niveau: "en_retard" }] } };
const ex = (nom, series = "4") => ({ nom, series, reps: "10", repos: "90s", tempo: "3-1-2-0" });
const unique = { programme: { seances: [
  { jour: "Lun", exercices: [ex("Tirage poulie haute prise large", "5"), ex("Rowing barre 45°", "5"),
    ex("Tirage horizontal câble assis", "4"), ex("Développé couché barre")] },
  { jour: "Mer", exercices: [ex("Développé couché barre"), ex("Écarté poulie vis-à-vis"),
    ex("Développé haltères incliné 30°"), ex("Extension poulie haute corde")] },
  { jour: "Ven", exercices: [ex("Squat barre nuque (high-bar)"), ex("Presse à cuisses 45°"),
    ex("Leg curl assis"), ex("Mollets debout machine")] },
] } };
const pbUnique = validatePointsFaibles(unique, fiche);
check("Dos concentré sur une seule séance : signalé",
  pbUnique.some(p => /une seule fois dans la semaine/.test(p)), JSON.stringify(pbUnique));

const reparti = { programme: { seances: [
  { jour: "Lun", exercices: [ex("Tirage poulie haute prise large", "4"), ex("Rowing barre 45°", "4"),
    ex("Développé couché barre"), ex("Extension poulie haute corde")] },
  { jour: "Mer", exercices: [ex("Tirage horizontal câble assis", "4"), ex("Tirage vertical prise neutre", "3"),
    ex("Écarté poulie vis-à-vis"), ex("Développé haltères incliné 30°")] },
  { jour: "Ven", exercices: [ex("Squat barre nuque (high-bar)"), ex("Presse à cuisses 45°"),
    ex("Leg curl assis"), ex("Mollets debout machine")] },
] } };
check("Dos réparti sur 2 séances : aucune alerte de fréquence",
  !validatePointsFaibles(reparti, fiche).some(p => /une seule fois/.test(p)),
  JSON.stringify(validatePointsFaibles(reparti, fiche)));
check("2 séances/semaine : la fréquence n'est pas exigée",
  !validatePointsFaibles({ programme: { seances: unique.programme.seances.slice(0, 2) } }, fiche)
    .some(p => /une seule fois/.test(p)));

console.log("\n=== 5. DELOAD CONDITIONNEL ===");
const edf = (o) => ({ etat_de_forme: o });
const deuxSignaux = prompt({}, {
  ...edf({ statut_recuperation: { risque: 8 }, tendance_performance: { tendance: "baisse", moyenne_pct: -6 } }),
});
check("2 signaux convergents → deload avancé", deuxSignaux.includes("DELOAD À AVANCER"));
check("Le motif est explicité", /signaux convergents/.test(deuxSignaux));
check("Consigne d'expliquer le choix à l'athlète", deuxSignaux.includes("reflexion.strategie"));

const unSignal = prompt({}, edf({ tendance_performance: { tendance: "baisse", moyenne_pct: -4 } }));
check("1 seul signal → pas de deload avancé mais prudence",
  !unSignal.includes("DELOAD À AVANCER") && unSignal.includes("SIGNAL DE FATIGUE ISOLÉ"));
check("Aucun signal → rien n'est imposé",
  !prompt().includes("DELOAD À AVANCER") && !prompt().includes("SIGNAL DE FATIGUE ISOLÉ"));
check("Le sommeil dégradé compte comme signal",
  prompt({}, { recuperation: { note: "5h par nuit" },
    ...edf({ tendance_performance: { tendance: "baisse", moyenne_pct: -5 } }) })
    .includes("DELOAD À AVANCER"));

console.log("\n=== 6. PROFIL FEMME / HOMME ===");
const pF = prompt({ sexe: "femme" }), pH = prompt({ sexe: "homme" });
check("Bloc femme présent et spécifique", pF.includes("ATHLÈTE FEMME") && !pH.includes("ATHLÈTE FEMME"));
check("Bloc homme présent et spécifique", pH.includes("ATHLÈTE HOMME") && !pF.includes("ATHLÈTE HOMME"));
check("Femme : haut du corps non sous-programmé", pF.includes("ne pas sous-programmer le haut du corps"));
check("Femme : le travail lourd n'est pas écarté par principe", pF.includes("Ne pas l'écarter par principe"));
check("Femme : le sujet du cycle n'est abordé que si elle l'évoque",
  pF.includes("QUE si elle l'a évoqué"));
check("Femme : aucun commentaire médical", pF.includes("commentaire d'ordre médical"));
check("Homme : rééquilibrage dos/ischios/fessiers", pH.includes("négliger le dos"));
check("Sexe non renseigné : aucun bloc imposé",
  !prompt({ sexe: "" }).includes("ATHLÈTE FEMME") && !prompt({ sexe: "" }).includes("ATHLÈTE HOMME"));

console.log("\n=== NON-RÉGRESSION ===");
const base = prompt();
for (const [nom, frag] of [
  ["Catalogue fermé", "liste FERMÉE"], ["Prescription", "PRESCRIPTION OBLIGATOIRE"],
  ["Garde-fous", "GARDE-FOUS SÉCURITÉ"], ["Référentiel DOS", "RÉFÉRENTIEL DOS"],
  ["Règle d'arbitrage", "PONDÉRATION FONDAMENTALE"], ["Contrôles annoncés", "CONTRÔLES AUTOMATIQUES"],
]) check(nom, base.includes(frag));
check("Temps de séance : validateur toujours cohérent",
  validateTempsSeance({ programme: { seances: [{ jour: "L", exercices: [
    ex("Squat barre nuque (high-bar)"), ex("Développé couché barre"),
    ex("Rowing barre 45°"), ex("Leg curl assis")] }] } }, "hypertrophie", 60).length === 0);

console.log(`\n${"─".repeat(50)}\nRÉSULTAT : ${ok} réussis, ${ko} échoués\n`);
process.exit(ko ? 1 : 0);
