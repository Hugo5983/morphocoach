// Vérifie que la connaissance MorphoCoach atteint RÉELLEMENT le prompt.
// Aucun appel à Anthropic : on construit le prompt et on inspecte son contenu.
//   node scripts/test-couverture.mjs
import { buildServerPrompt, validateProgramme } from "../api/generate-program.js";
import { getVariationDirectives } from "../api/_knowledge/couche0.js";
import { selectCandidats } from "../api/_knowledge/exercices_catalogue.js";
import { canonPathologies, buildPathoRules } from "../api/_knowledge/securite.js";

let ok = 0, ko = 0;
const check = (nom, condition, detail = "") => {
  if (condition) { ok++; console.log(`  ✅ ${nom}`); }
  else { ko++; console.log(`  ❌ ${nom}${detail ? ` — ${detail}` : ""}`); }
};

function prompt(form, dossier = {}, fiche = null) {
  const cycleNum = 1;
  const directives = getVariationDirectives({
    cycleNum, nbJours: (form.jours || []).length, objectif: form.objectif, niveau: form.niveau,
  });
  const candidats = selectCandidats({
    materiel: form.materiel || [], niveau: form.niveau || "intermediaire",
    aConserver: [], privilegies: fiche?.consequences?.exercices_privilegies || [],
    pathologies: form.pathologies || [], max: 9999,
  });
  return buildServerPrompt({ form, dossier, fiche, directives, cycleNum, candidats });
}

const BASE = {
  prenom: "Test", age: 30, sexe: "homme", poids: 75, taille: 178,
  niveau: "intermediaire", objectif: "hypertrophie",
  jours: ["Lun", "Mer", "Ven"], dureeSeance: 60, materiel: ["salle_complete"],
  pathologies: [], douleurs: [],
};

console.log("\n=== 1. Récupération : formulations variées ===");
for (const note of ["sommeil insuffisant", "5h par nuit", "je dors mal en ce moment",
                    "sommeil dégradé", "nuits courtes", "6h30 de sommeil", "sommeil peu réparateur"]) {
  const p = prompt(BASE, { recuperation: { note } });
  check(`"${note}" déclenche la règle`, p.includes("RÉCUPÉRATION DÉGRADÉE"));
}
for (const note of ["sommeil correct, 8h par nuit", "bonne récupération", "aucune fatigue"]) {
  const p = prompt(BASE, { recuperation: { note } });
  check(`"${note}" ne déclenche PAS (faux positif évité)`, !p.includes("RÉCUPÉRATION DÉGRADÉE"));
}

console.log("\n=== 2. Pathologies : libellés non standards ===");
const CAS = {
  "Hernie discale": "Hernie discale", "discopathie L4-L5": "Hernie discale",
  "sciatique": "Lombalgie", "mal de dos chronique": "Lombalgie",
  "tennis elbow": "Épicondylite", "conflit sous-acromial": "Conflit épaule",
  "tendinopathie de la coiffe": "Coiffe rotateurs", "gonarthrose": "Arthrose",
  "rupture LCA": "LCA", "syndrome du canal carpien": "Canal carpien",
};
for (const [saisi, attendu] of Object.entries(CAS)) {
  const c = canonPathologies([saisi]);
  check(`"${saisi}" → ${attendu}`, c.includes(attendu), `obtenu: ${JSON.stringify(c)}`);
}
check("Libellé inconnu transmis quand même avec consigne de prudence",
  buildPathoRules(["fibromyalgie"]).includes("SANS RÈGLE CODIFIÉE"));
check("« Aucune » ne déclenche rien", buildPathoRules(["Aucune"]) === "");

const pPatho = prompt({ ...BASE, pathologies: ["discopathie L4-L5"] });
check("Règles lombaires présentes dans le prompt", pPatho.includes("LOMBAIRES : INTERDITS"));
check("Bloc rééducation ciblée présent", pPatho.includes("RÉÉDUCATION CIBLÉE"));

console.log("\n=== 3. Référentiels muscles : plus de chemin mort ===");
const pSansPF = prompt(BASE);
check("Référentiel DOS présent sans point faible", pSansPF.includes("RÉFÉRENTIEL DOS"));
check("Référentiel PECTORAUX présent", pSansPF.includes("RÉFÉRENTIEL PECTORAUX"));
check("Référentiel JAMBES présent", pSansPF.includes("RÉFÉRENTIEL JAMBES"));
check("Bloc CORRECTEURS présent", pSansPF.includes("CORRECTEURS PAR DÉSÉQUILIBRE"));

console.log("\n=== 4. Règle d'arbitrage toujours transmise ===");
check("Sans fiche morpho", pSansPF.includes("PONDÉRATION FONDAMENTALE"));
const ficheMin = { confiance: "haute", observations: { leviers: { femur: "long" } },
  consequences: { lecture_coach: [], exercices_interdits: [], exercices_adaptes: [],
    exercices_privilegies: [], points_faibles_visuels: [], points_forts_visuels: [] } };
check("Avec fiche morpho", prompt(BASE, {}, ficheMin).includes("PONDÉRATION FONDAMENTALE"));

console.log("\n=== 5. Dossier volumineux : troncature annoncée ===");
const gros = { notes: "x".repeat(12000) };
check("Avertissement inséré dans le prompt", prompt(BASE, gros).includes("DOSSIER TRONQUÉ"));
check("Dossier normal : aucun avertissement", !prompt(BASE, { a: 1 }).includes("DOSSIER TRONQUÉ"));

console.log("\n=== 6. Douleurs : contre-indications désormais vérifiées ===");
const douleurs = [{ zone: "genou", localisation: "anterieure", mouvement: "squat_profond" }];
const pDouleur = prompt({ ...BASE, douleurs });
check("Bloc douleurs injecté", pDouleur.includes("DOULEURS DÉCLARÉES"));
const faux = { programme: { seances: [
  { jour: "Lundi", exercices: [{ nom: "Squat profond lourd" }, { nom: "Développé couché barre" },
    { nom: "Curl barre EZ debout" }, { nom: "Leg curl assis" }] },
] } };
const pbs = validateProgramme(faux, { dossier: {}, fiche: null,
  materiel: ["salle_complete"], joursDemandes: ["Lundi"], douleurs });
check("Exercice douloureux rejeté par la validation",
  pbs.some(p => /interdit/i.test(p) && /squat/i.test(p)), JSON.stringify(pbs.slice(0, 3)));

console.log("\n=== 7. Non-régression : garanties existantes intactes ===");
const pBase = prompt(BASE);
for (const [nom, frag] of [
  ["Catalogue fermé", "liste FERMÉE"], ["Prescription objectif", "PRESCRIPTION OBLIGATOIRE"],
  ["Garde-fous sécurité", "GARDE-FOUS SÉCURITÉ"], ["Volume MEV→MRV", "PARAMÈTRES DE VOLUME"],
  ["Périodisation", "PÉRIODISATION MÉSOCYCLE"], ["Construction par groupe", "CONSTRUCTION DE SÉANCE"],
  ["Raisonnement coach", "RAISONNEMENT COACH OBLIGATOIRE"], ["Données EMG", "SÉLECTIONS VALIDÉES PAR L'EMG"],
  ["Choix matériel valgus", "VALGUS & PRONATION"], ["Sécurité lombaire", "SÉCURITÉ LOMBAIRE"],
]) check(nom, pBase.includes(frag));

// Le bloc rattrapage détaillé est conditionnel PAR DESIGN : il ne concerne que
// les muscles en retard. On vérifie qu'il apparaît bien quand c'est le cas.
const ficheFaible = { confiance: "haute", observations: {},
  consequences: { lecture_coach: [], exercices_interdits: [], exercices_adaptes: [],
    exercices_privilegies: [], points_forts_visuels: [],
    points_faibles_visuels: [{ groupe: "dos_largeur", niveau: "en_retard" }] } };
check("Rattrapage injecté quand un point faible existe",
  prompt(BASE, {}, ficheFaible).includes("MÉTHODE DES 5 DIFFICULTÉS"));
check("Rattrapage non injecté sans point faible (voulu)",
  !pBase.includes("MÉTHODE DES 5 DIFFICULTÉS"));

const pBadMat = prompt({ ...BASE, materiel: ["poids_corps"] });
check("Matériel restreint : pas d'exercice machine proposé", !pBadMat.includes("Hack squat machine"));

console.log(`\n${"─".repeat(50)}\nRÉSULTAT : ${ok} réussis, ${ko} échoués\n`);
process.exit(ko ? 1 : 0);
