// Vérifie que Claude APPLIQUE ce qu'il reçoit — pas seulement qu'il le reçoit.
// Aucun appel à Anthropic : on soumet des programmes fabriqués aux validateurs.
//   node scripts/test-conformite.mjs
import {
  validatePrescription, validateCharges, validatePointsFaibles,
  parseReps, parseRepos, parseTempoExcentrique,
} from "../api/_knowledge/conformite.js";
import { validateProgramme } from "../api/generate-program.js";

let ok = 0, ko = 0;
const check = (nom, cond, detail = "") => {
  if (cond) { ok++; console.log(`  ✅ ${nom}`); }
  else { ko++; console.log(`  ❌ ${nom}${detail ? ` — ${detail}` : ""}`); }
};

const exo = (nom, reps, repos, extra = {}) =>
  ({ nom, series: "4", reps, repos, tempo: "3-1-2-0", charge: "70 %", ...extra });
const prog = (...seances) => ({ programme: { seances } });
const seance = (jour, ...exercices) => ({ jour, exercices });

console.log("\n=== 0. Lecture des valeurs écrites par Claude ===");
check("« 8-10 » → 8 à 10 reps", JSON.stringify(parseReps("8-10")) === "[8,10]");
check("« 12 » → 12 reps", JSON.stringify(parseReps("12")) === "[12,12]");
check("« AMRAP » ignoré (pas une plage)", parseReps("AMRAP") === null);
check("« 30s » ignoré (tenue isométrique)", parseReps("30s") === null);
check("« 90s » → 90 secondes", JSON.stringify(parseRepos("90s")) === "[90,90]");
check("« 2 min » → 120 secondes", JSON.stringify(parseRepos("2 min")) === "[120,120]");
check("« 3 à 5 minutes » → 180 à 300 s", JSON.stringify(parseRepos("3 à 5 minutes")) === "[180,300]");
check("« 3-1-2-0 » → excentrique 3 s", parseTempoExcentrique("3-1-2-0") === 3);

console.log("\n=== 1. PRESCRIPTION — un « programme de force » qui n'en est pas ===");
const forceBidon = prog(seance("Lundi",
  exo("Squat barre nuque (high-bar)", "12", "60s"),
  exo("Développé couché barre", "12-15", "60s"),
  exo("Rowing barre 45°", "12", "45s"),
  exo("Curl barre EZ debout", "15", "45s"),
));
const pbForce = validatePrescription(forceBidon, "force");
check("Répétitions trop hautes détectées", pbForce.some(p => /Répétitions hors prescription/.test(p)));
check("Repos trop courts détectés", pbForce.some(p => /Temps de repos hors prescription/.test(p)));
check("Absence de série lourde détectée", pbForce.some(p => /aucun exercice lourd/.test(p)));

const forceCorrect = prog(seance("Lundi",
  exo("Squat barre nuque (high-bar)", "3-5", "4 min", { tempo: "2-0-1-0" }),
  exo("Développé couché barre", "4-6", "3 min", { tempo: "2-1-1-0" }),
  exo("Rowing barre 45°", "6-8", "2 min", { tempo: "2-0-1-0" }),
  exo("Curl barre EZ debout", "6-8", "90s", { tempo: "2-0-1-0" }),
));
check("Vrai programme de force : aucune alerte",
  validatePrescription(forceCorrect, "force").length === 0,
  JSON.stringify(validatePrescription(forceCorrect, "force")));

console.log("\n=== 2. PRESCRIPTION — hypertrophie ===");
const hyperBidon = prog(seance("Lundi",
  exo("Développé couché barre", "2-3", "5 min"),
  exo("Rowing barre 45°", "2", "5 min"),
  exo("Squat barre nuque (high-bar)", "3", "5 min"),
  exo("Curl barre EZ debout", "3", "5 min"),
));
check("Hypertrophie faite en force : détectée",
  validatePrescription(hyperBidon, "hypertrophie").length > 0);

const hyperCorrect = prog(seance("Lundi",
  exo("Développé couché barre", "8-10", "2 min"),
  exo("Écarté poulie vis-à-vis", "12-15", "75s"),
  exo("Rowing barre 45°", "8-12", "2 min"),
  exo("Curl barre EZ debout", "10-12", "60s"),
));
check("Vraie hypertrophie : aucune alerte",
  validatePrescription(hyperCorrect, "hypertrophie").length === 0,
  JSON.stringify(validatePrescription(hyperCorrect, "hypertrophie")));

console.log("\n=== 3. PRESCRIPTION — pas de faux positif sur gainage/correctifs ===");
const avecGainage = prog(seance("Lundi",
  exo("Squat barre nuque (high-bar)", "3-5", "4 min", { tempo: "2-0-1-0" }),
  exo("Développé couché barre", "4-6", "3 min", { tempo: "2-1-1-0" }),
  exo("Rowing barre 45°", "5", "3 min", { tempo: "2-0-1-0" }),
  exo("Planche avant isométrique", "30-45s", "45s", { tempo: "—" }),
  exo("Face pull poulie haute corde", "15-20", "45s", { tempo: "2-1-2-0" }),
));
check("Gainage et correctifs exclus du contrôle",
  validatePrescription(avecGainage, "force").length === 0,
  JSON.stringify(validatePrescription(avecGainage, "force")));

console.log("\n=== 4. CHARGES RÉELLES — kilos exigés quand ils sont connus ===");
const dossierCharges = { charges_actuelles: {
  "Développé couché barre": "80 kg", "Squat barre nuque (high-bar)": "110 kg", note: "validé S12",
} };
const enPourcent = prog(seance("Lundi",
  exo("Développé couché barre", "5", "3 min", { charge: "75 % du 1RM" }),
  exo("Curl barre EZ debout", "10", "60s", { charge: "70 %" }),
));
const pbCharges = validateCharges(enPourcent, dossierCharges);
check("Pourcentage sur un exercice à charge connue : détecté", pbCharges.length > 0);
check("Le message nomme l'exercice fautif", /Développé couché barre/.test(pbCharges[0] || ""));
check("L'exercice sans charge connue n'est pas signalé", !/Curl barre EZ/.test(pbCharges[0] || ""));

const enKilos = prog(seance("Lundi",
  exo("Développé couché barre", "5", "3 min", { charge: "82,5 kg (S1-2) → 85 kg (S3-4)" }),
  exo("Squat barre nuque (high-bar)", "5", "4 min", { charge: "115 kg" }),
  exo("Curl barre EZ debout", "10", "60s", { charge: "70 % du 1RM estimé" }),
));
check("Kilos corrects : aucune alerte", validateCharges(enKilos, dossierCharges).length === 0,
  JSON.stringify(validateCharges(enKilos, dossierCharges)));
check("Aucune charge connue : validateur silencieux",
  validateCharges(enPourcent, {}).length === 0);

console.log("\n=== 5. POINTS FAIBLES — le volume suit-il le diagnostic ? ===");
const ficheDosFaible = { consequences: { points_faibles_visuels: [
  { groupe: "dos_largeur", niveau: "en_retard" },
] } };

const dosAbsent = prog(
  seance("Lundi", exo("Développé couché barre", "8", "2 min"),
    exo("Écarté poulie vis-à-vis", "12", "75s"), exo("Curl barre EZ debout", "10", "60s"),
    exo("Extension poulie haute corde", "12", "60s")),
);
check("Point faible totalement absent : détecté",
  validatePointsFaibles(dosAbsent, ficheDosFaible).some(p => /ABSENT/.test(p)));

const dosSousServi = prog(
  seance("Lundi", { ...exo("Développé couché barre", "8", "2 min"), series: "5" },
    { ...exo("Écarté poulie vis-à-vis", "12", "75s"), series: "5" },
    { ...exo("Développé haltères incliné 30°", "10", "90s"), series: "5" },
    { ...exo("Tirage poulie haute prise large", "10", "90s"), series: "2" }),
);
check("Point faible sous-servi en volume : détecté",
  validatePointsFaibles(dosSousServi, ficheDosFaible).some(p => /sous-servi/.test(p)));

const dosPrioritaire = prog(
  seance("Lundi", { ...exo("Tirage poulie haute prise large", "10", "90s"), series: "5" },
    { ...exo("Rowing barre 45°", "8", "2 min"), series: "5" },
    { ...exo("Tirage horizontal câble assis", "12", "75s"), series: "4" },
    { ...exo("Développé couché barre", "8", "2 min"), series: "4" }),
);
check("Point faible correctement priorisé : aucune alerte",
  validatePointsFaibles(dosPrioritaire, ficheDosFaible).length === 0,
  JSON.stringify(validatePointsFaibles(dosPrioritaire, ficheDosFaible)));
check("Aucune fiche morpho : validateur silencieux",
  validatePointsFaibles(dosAbsent, null).length === 0);

console.log("\n=== 6. Intégration dans la validation complète ===");
const complet = validateProgramme(forceBidon, {
  dossier: dossierCharges, fiche: ficheDosFaible,
  materiel: ["salle_complete"], joursDemandes: ["Lundi"], objectif: "force",
});
check("Les 3 contrôles remontent dans validateProgramme", complet.length >= 3);
check("Les anciennes vérifications fonctionnent toujours", Array.isArray(complet.horsCatalogue));

const propre = validateProgramme(
  prog(seance("Lundi",
    { ...exo("Tirage poulie haute prise large", "8-10", "2 min", { charge: "60 kg" }), series: "4" },
    { ...exo("Rowing barre 45°", "8-10", "2 min", { charge: "70 kg" }), series: "4" },
    { ...exo("Développé couché barre", "8-10", "2 min", { charge: "82,5 kg" }), series: "4" },
    { ...exo("Curl barre EZ debout", "10-12", "60s", { charge: "30 kg" }), series: "3" })),
  { dossier: dossierCharges, fiche: ficheDosFaible,
    materiel: ["salle_complete"], joursDemandes: ["Lundi"], objectif: "hypertrophie" },
);
check("Programme conforme : aucune alerte", propre.length === 0, JSON.stringify(propre));

console.log(`\n${"─".repeat(50)}\nRÉSULTAT : ${ok} réussis, ${ko} échoués\n`);
process.exit(ko ? 1 : 0);
