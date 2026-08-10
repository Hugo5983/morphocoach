// Vérifie que l'échauffement est de l'ACTIVATION, jamais de l'étirement tenu,
// et qu'il s'adapte au matériel réellement disponible.
//   node scripts/test-echauffement.mjs
import { buildActivation, matsAutorises, TOUS_LES_EXERCICES } from "../src/services/activationService.js";

let ok = 0, ko = 0;
const check = (nom, cond, detail = "") => {
  if (cond) { ok++; console.log(`  ✅ ${nom}`); }
  else { ko++; console.log(`  ❌ ${nom}${detail ? ` — ${detail}` : ""}`); }
};
const noms = (r) => r.blocs.flatMap(b => b.exercices.map(e => e.nom));
const activation = (r) => r.blocs.find(b => b.cle === "activation").exercices;

console.log("\n=== 1. Plus aucun étirement statique tenu ===");
const INTERDITS = /étirement|etirement|ouverture de poitrine|sleeper|rouleau|90\/90|psoas|stretch/i;
const suspects = TOUS_LES_EXERCICES().filter(e => INTERDITS.test(e.nom));
check("Aucun exercice d'étirement dans la base d'activation", suspects.length === 0,
  suspects.map(e => e.nom).join(", "));
const doses = TOUS_LES_EXERCICES().filter(e => /^\d+\s*×\s*\d+\s*s\b/i.test(e.dose) && !/pas|par côté/i.test(e.dose));
check("Aucune dose en tenue de 30 s et plus", doses.length === 0, doses.map(e => e.dose).join(", "));

console.log("\n=== 2. Salle complète — séance dos et biceps ===");
const salle = matsAutorises(["salle_complete"]);
const dosBiceps = buildActivation({ groupes: ["Dos", "Biceps"], mats: salle });
const aDos = activation(dosBiceps);
check("Bloc mise en route présent", dosBiceps.blocs[0].cle === "general");
check("Bloc activation non vide", aDos.length >= 2, JSON.stringify(aDos.map(e => e.nom)));
check("Exercices cohérents avec le dos",
  aDos.some(e => /face pull|scapular|pulldown|tirage/i.test(e.nom)), aDos.map(e => e.nom).join(", "));
check("Durée plafonnée à 7 min", dosBiceps.minutes <= 7, String(dosBiceps.minutes));
check("Orientation haut du corps", dosBiceps.orientation === "haut");

console.log("\n=== 3. Aucune répétition d'exercice (bug constaté en séance) ===");
const tousNoms = noms(dosBiceps);
check("Aucun doublon", new Set(tousNoms).size === tousNoms.length, tousNoms.join(" | "));
const jambes = buildActivation({ groupes: ["Quadriceps", "Ischio-jambiers", "Fessiers"], mats: salle });
const nj = noms(jambes);
check("Aucun doublon non plus sur une séance jambes", new Set(nj).size === nj.length, nj.join(" | "));

console.log("\n=== 4. Le matériel est respecté ===");
const sansElastique = matsAutorises(["machines"]);
const rMachines = buildActivation({ groupes: ["Pectoraux", "Épaules"], mats: sansElastique });
check("Sans élastique : aucun exercice élastique proposé",
  !noms(rMachines).some(n => /élastique/i.test(n)), noms(rMachines).join(", "));
check("Sans élastique : la poulie prend le relais",
  activation(rMachines).length >= 2, JSON.stringify(activation(rMachines).map(e => e.nom)));

const pdc = matsAutorises(["poids_corps"]);
const rPdc = buildActivation({ groupes: ["Pectoraux", "Dos"], mats: pdc });
check("Poids du corps seul : échauffement quand même complet", activation(rPdc).length >= 2,
  JSON.stringify(activation(rPdc).map(e => e.nom)));
check("Poids du corps seul : ni poulie ni machine",
  !noms(rPdc).some(n => /poulie|machine/i.test(n)), noms(rPdc).join(", "));

const elast = matsAutorises(["elastiques"]);
const rElast = buildActivation({ groupes: ["Épaules"], mats: elast });
check("Élastique seul : les variantes élastiques sont choisies",
  activation(rElast).some(e => /élastique/i.test(e.nom)), JSON.stringify(activation(rElast).map(e => e.nom)));

console.log("\n=== 5. Les pathologies passent en priorité ===");
const epaule = buildActivation({ groupes: ["Pectoraux"], mats: salle, pathologies: ["Coiffe rotateurs"] });
check("Épaule sensible : rotation externe en tête",
  /rotation externe/i.test(activation(epaule)[0].nom), activation(epaule)[0].nom);
check("Le motif est expliqué à l'athlète",
  /sensible/i.test(activation(epaule)[0].comment), activation(epaule)[0].comment);

const genou = buildActivation({ groupes: ["Quadriceps"], mats: salle, pathologies: ["Ménisque"] });
check("Genou sensible : moyen fessier ou vaste interne activé",
  activation(genou).some(e => /marche latérale|extension terminale/i.test(e.nom)),
  JSON.stringify(activation(genou).map(e => e.nom)));

const dos = buildActivation({ groupes: ["Ischio-jambiers"], mats: salle, pathologies: ["Hernie discale"] });
check("Dos sensible : gainage actif imposé",
  activation(dos).some(e => /bird dog|dead bug/i.test(e.nom)),
  JSON.stringify(activation(dos).map(e => e.nom)));

console.log("\n=== 6. Cas limites ===");
check("Aucun groupe connu : échauffement générique quand même",
  activation(buildActivation({ groupes: [], mats: salle })).length >= 2);
check("Groupe inconnu : pas de plantage",
  activation(buildActivation({ groupes: ["Zone inconnue"], mats: salle })).length >= 2);
const bas = buildActivation({ groupes: ["Quadriceps", "Fessiers"], mats: salle });
check("Séance jambes : mise en route orientée bas du corps", bas.orientation === "bas");
check("Jamais plus de 5 exercices d'activation",
  activation(buildActivation({ groupes: ["Dos", "Pectoraux", "Épaules"], mats: salle })).length <= 5);

console.log(`\n${"─".repeat(50)}\nRÉSULTAT : ${ok} réussis, ${ko} échoués\n`);
process.exit(ko ? 1 : 0);
