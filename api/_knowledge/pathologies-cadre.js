// ─── KNOWLEDGE : CADRE PATHOLOGIES — GRAND PUBLIC ──────────────────────────
// V5 : refonte demandée par Hugo. Le module NE PRESCRIT PAS d'exercices
// obligatoires par pathologie. Il applique la CASCADE EN 4 ÉTAPES :
//
//   1. EXCLUSION       — options retirées du catalogue (règle dure)
//   2. SUBSTITUTION    — familles de mouvements à faible contrainte
//                        (Sonnet choisit dans la famille selon le reste
//                        du profil, ce n'est pas un exercice imposé)
//   3. PROGRESSION     — RPE plafond, volume max, durée de la phase de
//                        prudence
//   4. AVIS_MEDICAL    — mention systématique dans le JSON de sortie
//
// PRINCIPE POSÉ AVEC HUGO :
//   "MorphoCoach doit être un coach intelligent, pas donner l'impression
//    de faire du diagnostic médical ou de traiter une pathologie."
//
// Aucun langage médical ("traiter", "soigner", "guérir") n'apparaît côté
// utilisateur. On dit "adapter", "protéger", "renforcer avec précaution".
// On prend acte d'un diagnostic posé par un médecin (pathologie DÉCLARÉE),
// on n'en pose aucun.

// Normalisation grossière des libellés de pathologie déclarés côté form,
// pour matcher les entrées de la table ci-dessous quelle que soit la
// formulation exacte (utilisateur, connecteur, admin).
const norm = (s) => String(s || "").toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// ═══════════════════════════════════════════════════════════════════════
// TABLE PATHOLOGIES : cascade en 4 étapes
// ═══════════════════════════════════════════════════════════════════════

export const PATHOLOGIES_CADRE = [
  {
    id: "hernie_discale",
    matchs: ["hernie discale", "discopathie", "hernie discale declaree", "hernie disc"],
    libelle: "Hernie discale déclarée",
    contraintes_actives: [
      "Pas de compression axiale lourde",
      "Pas de flexion du rachis chargée",
      "Pas de rest-pause sur mouvement à charge axiale",
      "Ceinture recommandée pour toute charge > 80% 1RM",
    ],
    familles_substitution: [
      "Décompression : suspension à la barre fixe, hanging leg raises",
      "Gainage anti-bascule : dead bug, bird dog, planche latérale",
      "Squat alternatif : trap bar deadlift, belt squat, front squat au lieu de back squat lourd",
      "Tirages assis dos soutenu (poitrine appuyée) au lieu du rowing barre buste penché",
      "Renforcement lombaire progressif : bridge, hip thrust, extensions lombaires légères",
    ],
    progression: {
      rpe_plafond_semaines: 4,
      rpe_max: 7,
      volume_progression_max_pct_sem: 10,
      note: "Réévaluation à 4 semaines. Pas de PR ni de méthode traumatisante pendant cette phase.",
    },
    avis_medical: true,
  },
  {
    id: "epaule",
    matchs: ["conflit sous-acromial", "conflit sous acromial", "coiffe des rotateurs", "tendinite epaule", "douleur epaule", "epaule fragile", "pathologie epaule"],
    libelle: "Douleur ou pathologie épaule déclarée",
    contraintes_actives: [
      "Pas de mouvement avec conflit sous-acromial (behind-the-neck press, dips profonds lourds)",
      "Pas de drop set sur presses lourdes",
      "Amplitude adaptée sur presses verticales",
    ],
    familles_substitution: [
      "Presses ROM adapté (arrêt avant la zone douloureuse)",
      "Machines guidées (convergentes) plutôt que barres libres",
      "Travail préalable des rotateurs (rotations externes élastique, face pull léger)",
      "Tirages horizontaux avant tirages verticaux dans la séance",
      "EMS de sensibilisation coiffe si muscle mal ressenti",
    ],
    progression: {
      rpe_plafond_semaines: 4,
      rpe_max: 7,
      volume_progression_max_pct_sem: 10,
      note: "Réévaluation à 4 semaines sur la zone épaule. Volume tirage ≥ volume poussée.",
    },
    avis_medical: true,
  },
  {
    id: "coude",
    matchs: ["tendinite coude", "epicondylite", "épicondylite", "epitrochleite", "épitrochléite", "tennis elbow", "golfer elbow", "douleur coude"],
    libelle: "Douleur ou pathologie coude déclarée",
    contraintes_actives: [
      "Pas de rest-pause / cluster sur exercices de bras",
      "Pas de charge lourde brutale sur curls et extensions",
      "Pas d'appui du coude direct sur banc pour tricep dips",
    ],
    familles_substitution: [
      "Isolation à charge modérée avec tempo contrôlé (3-1-2-0)",
      "Prise variée (marteau si épicondylite ; supination progressive)",
      "Occlusion (BFR) possible sur charges légères 20-30% 1RM",
      "Travail excentrique lent à l'élastique",
    ],
    progression: {
      rpe_plafond_semaines: 4,
      rpe_max: 7,
      volume_progression_max_pct_sem: 10,
      note: "Réévaluation à 4 semaines. Sortie de la phase si aucune douleur ne réapparaît.",
    },
    avis_medical: true,
  },
  {
    id: "genou",
    matchs: ["tendinopathie rotulienne", "tendinite rotulienne", "syndrome rotulien", "douleur genou", "pathologie genou", "chondropathie", "chondromalacie"],
    libelle: "Douleur ou pathologie genou déclarée",
    contraintes_actives: [
      "Pas de squat profond lourd si douleur en flexion",
      "Pas de pliométrie brute (drop jumps, bounds)",
      "Pas de drop set sur squat/presse lourds",
    ],
    familles_substitution: [
      "Squat partiel (parallèle ou au-dessus)",
      "Presse à cuisses avec angle adapté (dos calé, pieds haut sur la plate-forme)",
      "Isométrique wall sit progression",
      "Tempo excentrique 4s sur leg extension charges modérées",
      "Renforcement muscles péri-articulaires : ischios, fessiers, mollets",
      "Occlusion (BFR) possible sur charges légères",
    ],
    progression: {
      rpe_plafond_semaines: 4,
      rpe_max: 7,
      volume_progression_max_pct_sem: 10,
      note: "Réévaluation à 4 semaines sur la zone genou. Arrêt immédiat si douleur en cours de série.",
    },
    avis_medical: true,
  },
  {
    id: "laxite_hormonale",
    matchs: ["laxite hormonale", "premenstruel", "prémenstruel", "post-partum", "post partum", "postpartum", "menstruel"],
    libelle: "Laxité hormonale déclarée (femme, cycle spécifique)",
    contraintes_actives: [
      "RPE maximum 7 pendant la phase concernée",
      "Pas d'étirement passif lesté à grande amplitude",
      "Pas de PR ni de tentative de charge record",
    ],
    familles_substitution: [
      "Tempo contrôlé (aucune vitesse maximale)",
      "Unilatéral léger pour renforcer la stabilité",
      "Isométrique de gainage",
    ],
    progression: {
      rpe_plafond_semaines: null,   // pendant toute la phase concernée
      rpe_max: 7,
      volume_progression_max_pct_sem: null,
      note: "Adapter à la phase du cycle. Communication bienveillante : 'Période de laxité ligamentaire — j'allège la charge pour protéger tes articulations.'",
    },
    avis_medical: true,
  },
  {
    id: "reprise_age_sedentaire",
    matchs: ["reprise sport", "retour sport", "sedentaire long", "age plus 35 sedentaire", "long arret", "coupure longue"],
    libelle: "Reprise après pause longue / âge + sédentarité",
    contraintes_actives: [
      "Aucune méthode traumatisante (rest-pause, drop, cluster, partiels lourds, PR) pendant 4-8 semaines",
      "Charge plafonnée à 60% du 1RM théorique",
      "Tempo imposé 3-1-1-0",
      "Amplitude complète interdite en charge maximale",
    ],
    familles_substitution: [
      "Mouvements simples et guidés",
      "Isolation avant compound",
      "Excentrique à l'élastique",
      "Isométrique gainage",
      "Cardio léger progressif",
    ],
    progression: {
      rpe_plafond_semaines: 8,
      rpe_max: 7,
      volume_progression_max_pct_sem: 10,
      note: "Phase 1 fascio-tendineuse 4-8 semaines. Sortie progressive selon la tolérance.",
    },
    avis_medical: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Retourne les entrées de PATHOLOGIES_CADRE actives pour ce profil.
 * Une pathologie est active si son libellé (ou une de ses variantes)
 * apparaît dans la liste `pathologies` du form, normalisée.
 */
export function pathologiesActives(pathosDeclarees = []) {
  const normalisees = (pathosDeclarees || [])
    .filter(p => p && p !== "Aucune")
    .map(norm);
  if (normalisees.length === 0) return [];

  const actives = [];
  for (const cadre of PATHOLOGIES_CADRE) {
    for (const m of cadre.matchs) {
      const nm = norm(m);
      if (normalisees.some(p => p === nm || p.includes(nm) || nm.includes(p))) {
        actives.push(cadre);
        break;
      }
    }
  }
  return actives;
}

/**
 * Construit le bloc "CADRE PATHOLOGIES" à injecter dans le prompt de
 * génération. Le bloc présente à Sonnet les contraintes / substitutions /
 * progression pour CHAQUE pathologie déclarée, en insistant sur la
 * logique "options exclues + familles de substitution" plutôt que
 * "exercices imposés".
 */
export function buildPathologiesCadreBlock(pathosDeclarees = []) {
  const actives = pathologiesActives(pathosDeclarees);
  if (actives.length === 0) return "";

  const blocs = actives.map((p) => {
    const contraintes = p.contraintes_actives.map(c => `    - ${c}`).join("\n");
    const substitutions = p.familles_substitution.map(s => `    - ${s}`).join("\n");
    const prog = p.progression;
    const progLignes = [
      prog.rpe_max ? `    - RPE maximum : ${prog.rpe_max}${prog.rpe_plafond_semaines ? ` pendant ${prog.rpe_plafond_semaines} semaines` : ""}` : null,
      prog.volume_progression_max_pct_sem ? `    - Progression volume max : +${prog.volume_progression_max_pct_sem} % par semaine` : null,
      prog.note ? `    - Note : ${prog.note}` : null,
    ].filter(Boolean).join("\n");

    return `► ${p.libelle}

  Contraintes actives (règle dure) :
${contraintes}

  Familles de substitution (tu CHOISIS dans ces familles selon le reste
  du profil — matériel, niveau, objectif — comme un coach adapte à la
  personne en face) :
${substitutions}

  Progression prudente :
${progLignes}`;
  });

  return `
═══ CADRE PATHOLOGIES DÉCLARÉES ═══
Chaque pathologie déclarée par l'athlète déclenche une CASCADE EN 4 ÉTAPES :
  1. EXCLUSION       — options retirées du catalogue (règle dure)
  2. SUBSTITUTION    — familles de mouvements à faible contrainte
  3. PROGRESSION     — RPE plafond, volume plafonné, durée de prudence
  4. AVIS_MEDICAL    — mention obligatoire dans le champ "avis_medical"
                       du JSON de sortie

Tu n'IMPOSES JAMAIS un exercice précis à cause d'une pathologie. Tu
proposes des variantes à faible contrainte dans les familles de
substitution. C'est la différence entre un coach qui adapte et un
diagnostic médical.

Aucun langage médical côté utilisateur : jamais "traiter", "soigner",
"guérir". Toujours "adapter", "protéger", "renforcer avec précaution".

${blocs.join("\n\n")}

CHAMP OBLIGATOIRE dans le JSON de sortie quand une pathologie est
déclarée :
  "avis_medical": "En cas de douleur qui persiste, s'aggrave ou irradie,
  arrête et consulte ton médecin ou kinésithérapeute. Ce programme est
  un cadre d'entraînement, pas un traitement."`;
}
