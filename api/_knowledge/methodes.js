// ─── KNOWLEDGE : MÉTHODES D'ENTRAÎNEMENT — MATRICE DIAGNOSTIC → MÉTHODES ────
// V5 : ce module transforme la logique "impératif verbal" (Sonnet DEVRAIT
// utiliser telle méthode) en logique VÉRIFIÉE PAR PROGRAMME. À chaque
// diagnostic présent (morpho + objectifPrecis + posture + niveau + objectif),
// on associe la ou les méthodes ATTENDUES sur les exercices du muscle
// concerné. Le validateur (conformite.js → validateMethodes) contrôle
// ensuite que la matrice est bien appliquée dans le programme final.
//
// PRINCIPE FONDAMENTAL POSÉ AVEC HUGO :
//   "Le nombre de méthodes n'est pas la contrainte — c'est la RÉPONSE
//    causale à chaque diagnostic. Un coach ne se dit pas 'il me faut
//    2 méthodes' ; il regarde la fiche, il voit un diagnostic, il
//    applique la méthode qui y répond."
//
// SOURCES (chaque ligne est traçable) :
//   [BASE]  = extrait de MorphoCoach_Base_Complete.pdf (181 pages)
//   [COACH] = ajout culture générale de coach validé par Hugo dans la
//             session de conception V5

// ═══════════════════════════════════════════════════════════════════════
// PARTIE 1 — CATALOGUE DES 36 MÉTHODES
// ═══════════════════════════════════════════════════════════════════════

export const METHODES = {
  // A. Haut trauma (repos longs)
  rest_pause_lourd:      { fam: "trauma", nom: "Rest-pause lourd",         trauma: "fort",     source: "BASE" },
  cluster:               { fam: "trauma", nom: "Cluster",                  trauma: "fort",     source: "BASE" },
  excentrique_surcharge: { fam: "trauma", nom: "Excentrique surchargé",    trauma: "tres_fort", source: "COACH" },
  partiels_lourds:       { fam: "trauma", nom: "Partiels lourds",          trauma: "fort",     source: "BASE" },
  pyramide_descendante:  { fam: "trauma", nom: "Pyramide descendante",     trauma: "fort",     source: "COACH" },

  // B. Métaboliques (repos courts)
  drop_set:              { fam: "metabolique", nom: "Drop set (dégressif)",       trauma: "moyen", source: "BASE" },
  pre_fatigue:           { fam: "metabolique", nom: "Pré-fatigue",                trauma: "fort",  source: "BASE" },
  post_fatigue:          { fam: "metabolique", nom: "Post-fatigue",               trauma: "tres_fort", source: "BASE" },
  superset_antagoniste:  { fam: "metabolique", nom: "Super-set antagoniste",      trauma: "moyen", source: "BASE" },
  superset_agoniste:     { fam: "metabolique", nom: "Super-set agoniste",         trauma: "moyen", source: "COACH" },
  series_de_100:         { fam: "metabolique", nom: "Séries de 100",              trauma: "fort",  source: "BASE" },
  tension_continue:      { fam: "metabolique", nom: "Tension continue",           trauma: "moyen", source: "BASE" },
  brulure:               { fam: "metabolique", nom: "Brûlure",                    trauma: "moyen", source: "BASE" },
  density_amrap:         { fam: "metabolique", nom: "Density training / AMRAP",   trauma: "moyen", source: "COACH" },

  // C. Positionnement / exécution
  unilateral:            { fam: "execution", nom: "Unilatéral",              trauma: "variable", source: "BASE" },
  demi_amplitude:        { fam: "execution", nom: "Demi-amplitude / ROM réduit", trauma: "variable", source: "BASE+COACH" },
  tempo_lent_excentrique:{ fam: "execution", nom: "Tempo lent excentrique 4-5s", trauma: "modere",   source: "BASE" },
  isometrique:           { fam: "execution", nom: "Isométrique (statique)",   trauma: "faible",   source: "BASE+COACH" },
  reps_1_5:              { fam: "execution", nom: "1.5 reps",                trauma: "modere",   source: "COACH" },
  stretch_mediated:      { fam: "execution", nom: "Stretch-mediated (deep stretch)", trauma: "modere", source: "COACH" },
  dead_stop:             { fam: "execution", nom: "Isométrique dead stop",   trauma: "modere",   source: "COACH" },
  mechanical_drop_set:   { fam: "execution", nom: "Mechanical drop set (changement d'angle)", trauma: "moyen", source: "COACH" },
  contraction_tenue:     { fam: "execution", nom: "Contraction tenue (peak)", trauma: "faible",  source: "BASE" },

  // D. Rééducation / point faible faux
  ems_sensibilisation:   { fam: "reeduc", nom: "EMS de sensibilisation",     trauma: "faible", source: "BASE" },
  pre_etirement:         { fam: "reeduc", nom: "Pré-étirement bi-articulaire", trauma: "faible", source: "BASE" },
  rotation_angles:       { fam: "reeduc", nom: "Rotation d'angles (3 zones)", trauma: "faible", source: "BASE" },
  occlusion_bfr:         { fam: "reeduc", nom: "Occlusion (BFR)",             trauma: "faible", source: "COACH" },

  // E. Prépa physique / conditioning
  demi_pyramide:         { fam: "prepa", nom: "Demi-pyramide",         trauma: "modere", source: "BASE" },
  pyramide_bloc:         { fam: "prepa", nom: "Pyramide en bloc",      trauma: "modere", source: "BASE" },
  contraste:             { fam: "prepa", nom: "Contraste (potentiation)", trauma: "fort",  source: "COACH" },
  pliometrie:            { fam: "prepa", nom: "Pliométrie",            trauma: "fort",  source: "COACH" },
  circuit_training:      { fam: "prepa", nom: "Circuit training",      trauma: "moyen", source: "BASE+COACH" },
  tabata:                { fam: "prepa", nom: "Tabata (20/10)",        trauma: "moyen", source: "COACH" },
  complexes:             { fam: "prepa", nom: "Complexes barre/haltères", trauma: "moyen", source: "COACH" },
  hiit_structure:        { fam: "prepa", nom: "HIIT structuré",         trauma: "moyen", source: "BASE" },
  series_longues:        { fam: "prepa", nom: "Séries longues 15-25",   trauma: "faible", source: "BASE" },
  excentrique_elastique: { fam: "prepa", nom: "Excentrique à l'élastique 3-4s", trauma: "faible", source: "COACH" },
};

// Méthodes DOUCES autorisées pour débutant sur point faible (règle validée
// par Hugo : "on peut tolérer des méthodes douces pour débutant sur point faible").
// Cette liste est stricte : hors d'elle, aucune méthode d'intensification
// n'est autorisée sur débutant, quel que soit le diagnostic.
export const METHODES_DOUCES_DEBUTANT = new Set([
  "tension_continue",
  "tempo_lent_excentrique",
  "isometrique",
  "unilateral",
  "contraction_tenue",
  "reps_1_5",
]);

// Méthodes formellement INTERDITES pour débutant (règle BASE stricte,
// jamais tolérées même sur point faible).
export const METHODES_INTERDITES_DEBUTANT = new Set([
  "drop_set", "rest_pause_lourd", "cluster", "series_de_100",
  "post_fatigue", "excentrique_surcharge", "partiels_lourds",
  "pyramide_descendante",
]);

// ═══════════════════════════════════════════════════════════════════════
// PARTIE 2 — MATRICE DIAGNOSTIC → MÉTHODES ATTENDUES
// ═══════════════════════════════════════════════════════════════════════
// Chaque entrée dit : SI ce diagnostic est présent sur ce profil, ALORS
// au moins UNE des méthodes de `methodes_attendues` doit apparaître sur
// au moins UN exercice ciblant le muscle `groupe_cible`.
//
// Le validateur (validateMethodes) collecte tous les diagnostics présents,
// puis vérifie ligne à ligne. Absence sur un diagnostic déclaré = warning
// nommé (ex : "asymétrie bras déclarée → aucune méthode unilatérale sur
// les biceps"), remonté au correctif de génération.
//
// IMPORTANT : ces règles sont des ATTENDUS, jamais des OBLIGATIONS
// aveugles. Si les garde-fous transverses (G1-G8, cf. GARDE_FOUS ci-dessous)
// interdisent une méthode pour ce profil, elle est retirée de la liste
// attendue AVANT la vérification — un débutant à qui la matrice demande
// un rest-pause ne déclenche PAS de warning (la règle est absorbée par
// G3).

// D1. Asymétries et déséquilibres visuels
export const D1_ASYMETRIES = [
  {
    id: "asym_gd",
    diagnostic: "Asymétrie gauche/droite visible",
    condition: (fiche) => fiche?.observations?.proportions?.symetrie_gauche_droite === "asymetrique",
    groupe_cible: null,  // s'applique à tous les groupes travaillés en bilatéral
    methodes_attendues: ["unilateral"],
    note: "Commencer par le côté faible",
    source: "BASE",
  },
  {
    id: "epaule_asym",
    diagnostic: "Épaule asymétrique",
    condition: (fiche) => (fiche?.observations?.posture || []).includes("epaule_asymetrique"),
    groupe_cible: "epaules",
    methodes_attendues: ["unilateral"],
    source: "BASE+COACH",
  },
  {
    id: "rotation_bassin",
    diagnostic: "Rotation du bassin",
    condition: (fiche) => (fiche?.observations?.posture || []).includes("rotation_bassin"),
    groupe_cible: "jambes",
    methodes_attendues: ["unilateral"],
    note: "Split squat, fentes, + gainage anti-rotation",
    source: "COACH",
  },
];

// D2. Points faibles (retard visuel OU objectif précis nomme un muscle)
// La règle est causale : le muscle est en retard → une méthode adaptée à
// CE muscle doit apparaître sur les exercices qui le ciblent.
export const D2_POINTS_FAIBLES = [
  {
    id: "pf_fessiers_hyp",
    diagnostic: "Fessiers en retard OU objectif précis fessiers",
    muscles: ["fessiers"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["pre_fatigue", "reps_1_5", "isometrique", "stretch_mediated"],
    note: "Pré-fatigue (abduction→hip thrust), 1.5 reps hip thrust, isométrique bridge, stretch-mediated bulgares",
    source: "COACH",
  },
  {
    id: "pf_fessiers_force",
    diagnostic: "Fessiers en retard + objectif force",
    muscles: ["fessiers"],
    objectifs: ["force"],
    methodes_attendues: ["cluster", "pyramide_bloc", "tempo_lent_excentrique"],
    source: "COACH",
  },
  {
    id: "pf_pecs_hyp",
    diagnostic: "Pectoraux en retard OU objectif précis pecs",
    muscles: ["pectoraux"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["pre_fatigue", "post_fatigue", "demi_amplitude"],
    note: "Écartés→DC ou DC→écartés poulie ; demi-amplitude si épaule sensible",
    source: "BASE+COACH",
  },
  {
    id: "pf_dos_largeur",
    diagnostic: "Dos-largeur (grand dorsal) en retard",
    muscles: ["dos", "dos_largeur"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["pre_fatigue", "superset_agoniste"],
    note: "Super-set pré-fatigue pull-over → rowing poulie",
    source: "BASE",
  },
  {
    id: "pf_grand_rond",
    diagnostic: "Grand rond endormi (muscle en compétition avec grand dorsal)",
    muscles: ["dos", "dos_largeur"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["contraction_tenue", "brulure"],
    note: "Isolation rotation poulie + tenue 1-2s + brûlure, min 3 séries dont 2 isolation",
    source: "BASE",
  },
  {
    id: "pf_delto_post",
    diagnostic: "Deltoïde postérieur en retard",
    muscles: ["epaules"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["pre_fatigue", "rotation_angles", "drop_set"],
    note: "Drop set particulièrement efficace sur l'épaule (base)",
    source: "BASE",
  },
  {
    id: "pf_delto_lat",
    diagnostic: "Deltoïde latéral en retard",
    muscles: ["epaules"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["drop_set", "reps_1_5", "tension_continue", "demi_amplitude"],
    note: "Élévations en drop, 1.5 reps, jamais lâcher, ROM 30-90°",
    source: "BASE+COACH",
  },
  {
    id: "pf_biceps_haut",
    diagnostic: "Biceps en retard + insertion haute",
    muscles: ["biceps"],
    objectifs: ["hypertrophie"],
    condition_supp: (fiche) => fiche?.observations?.insertions?.biceps === "haute",
    methodes_attendues: ["pre_fatigue", "mechanical_drop_set"],
    note: "Curl pupitre / curl incliné en priorité (privilégié base)",
    source: "BASE+COACH",
  },
  {
    id: "pf_biceps_bas",
    diagnostic: "Biceps en retard + insertion basse",
    muscles: ["biceps"],
    objectifs: ["hypertrophie"],
    condition_supp: (fiche) => fiche?.observations?.insertions?.biceps === "basse",
    methodes_attendues: ["contraction_tenue", "tension_continue"],
    note: "Prise serrée, chin-up supinée",
    source: "COACH",
  },
  {
    id: "pf_triceps",
    diagnostic: "Triceps en retard",
    muscles: ["triceps"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["post_fatigue", "rotation_angles"],
    note: "Rotation 3 angles pour chef long (dominant du volume triceps)",
    source: "BASE+COACH",
  },
  {
    id: "pf_quadri",
    diagnostic: "Quadriceps en retard (droit fémoral spécifiquement)",
    muscles: ["quadriceps", "jambes"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["superset_agoniste", "pre_etirement"],
    note: "Leg extension buste incliné arrière + super-set élévations cuisse → leg ext",
    source: "BASE",
  },
  {
    id: "pf_ischios",
    diagnostic: "Ischios en retard",
    muscles: ["ischios", "jambes"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["pre_fatigue", "stretch_mediated", "tempo_lent_excentrique"],
    note: "Leg curl → SDT jambes tendues ; RDL amplitude complète ; tempo excentrique 4s",
    source: "BASE+COACH",
  },
  {
    id: "pf_mollets",
    diagnostic: "Mollets en retard",
    muscles: ["mollets"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["tempo_lent_excentrique", "rest_pause_lourd", "tension_continue"],
    note: "Fréquence potentiellement élevée SELON volume/intensité/récupération/tolérance individuelle. Exception : fréquence resserrée 1-2 sem pour rattraper le ressenti d'un muscle mal ressenti — jamais comme régime permanent",
    source: "COACH_HUGO_V5",
  },
  {
    id: "pf_abdos",
    diagnostic: "Abdos en retard",
    muscles: ["abdos", "abdominaux"],
    objectifs: ["hypertrophie"],
    methodes_attendues: ["tension_continue", "isometrique"],
    note: "Charge additionnelle, planche lestée, 8-15 reps lourdes",
    source: "COACH",
  },
  {
    id: "pf_faux",
    diagnostic: "Point faible \"faux\" (mauvais recrutement)",
    muscles: null,  // s'applique au muscle nommé dans le diagnostic
    objectifs: ["hypertrophie"],
    // Ce diagnostic n'est PAS détectable automatiquement de la fiche photo
    // pour l'instant — il faudra un signalement explicite dans le dossier.
    // Le validateur ne l'active donc pas seul aujourd'hui.
    condition: () => false,
    methodes_attendues: ["pre_fatigue", "ems_sensibilisation", "rotation_angles"],
    source: "BASE",
  },
];

// D4. Postures détectées
export const D4_POSTURES = [
  {
    id: "posture_antepulsion",
    diagnostic: "Antépulsion scapulaire",
    condition: (fiche) => (fiche?.observations?.posture || []).includes("antepulsion_scapulaire"),
    // Face pull EN PRÉ-FATIGUE avant tirages, jamais en fin (base)
    groupe_cible: "dos",
    methodes_attendues: ["pre_fatigue"],
    note: "Face pull en pré-fatigue avant tirages, volume tirage ≥ poussée",
    source: "BASE",
  },
  {
    id: "posture_cyphose",
    diagnostic: "Cyphose",
    condition: (fiche) => (fiche?.observations?.posture || []).includes("cyphose"),
    groupe_cible: "dos",
    methodes_attendues: ["pre_fatigue", "isometrique"],
    note: "Extensions thoraciques + rowing haut + pull apart",
    source: "COACH",
  },
  {
    id: "posture_hyperlordose",
    diagnostic: "Hyperlordose",
    condition: (fiche) => (fiche?.observations?.posture || []).includes("hyperlordose"),
    groupe_cible: "abdos",
    methodes_attendues: ["isometrique"],
    note: "Renforcement abdominal profond : dead bug, bird dog, planche",
    source: "BASE+COACH",
  },
  {
    id: "posture_bascule",
    diagnostic: "Bascule bassin",
    condition: (fiche) => (fiche?.observations?.posture || []).includes("bascule_bassin"),
    groupe_cible: "abdos",
    methodes_attendues: ["isometrique"],
    note: "Gainage anti-extension : dead bug lesté, hip thrust isométrique tenu",
    source: "COACH",
  },
  {
    id: "posture_valgus",
    diagnostic: "Valgus genou",
    condition: (fiche) => (fiche?.observations?.posture || []).includes("valgus_genou"),
    groupe_cible: "jambes",
    methodes_attendues: ["unilateral"],
    note: "Clamshells, abduction câble, mini-band warm-up",
    source: "BASE",
  },
];

// D5. Objectif principal × niveau → attendus sur mouvement lourd principal
// Ces règles PRIMENT lorsqu'elles collent au profil : elles définissent le
// "socle" méthodologique attendu, indépendamment des diagnostics D1-D4.
export const D5_OBJECTIF_NIVEAU = [
  {
    id: "obj_force_int",
    diagnostic: "Objectif FORCE + niveau intermédiaire",
    condition: (_fiche, form) => form?.objectif === "force" && form?.niveau === "intermediaire",
    groupe_cible: null,
    methodes_attendues: ["demi_pyramide", "dead_stop", "tempo_lent_excentrique"],
    portee: "≥1 sur mouvement lourd principal du cycle",
    source: "BASE+COACH",
  },
  {
    id: "obj_force_av",
    diagnostic: "Objectif FORCE + niveau avancé",
    condition: (_fiche, form) => form?.objectif === "force" && form?.niveau === "avance",
    groupe_cible: null,
    methodes_attendues: ["cluster", "rest_pause_lourd", "excentrique_surcharge"],
    portee: "≥1 sur mouvement lourd principal (max 1/séance selon G1)",
    source: "BASE+COACH",
  },
  {
    id: "obj_hyp_int",
    diagnostic: "Objectif HYPERTROPHIE + niveau intermédiaire",
    condition: (_fiche, form) => form?.objectif === "hypertrophie" && form?.niveau === "intermediaire",
    groupe_cible: null,
    methodes_attendues: ["pre_fatigue", "drop_set", "superset_agoniste", "tension_continue", "reps_1_5"],
    portee: "≥1 méthode/cycle sur muscle cible",
    source: "BASE+COACH",
  },
  {
    id: "obj_hyp_av",
    diagnostic: "Objectif HYPERTROPHIE + niveau avancé",
    condition: (_fiche, form) => form?.objectif === "hypertrophie" && form?.niveau === "avance",
    groupe_cible: null,
    methodes_attendues: ["pre_fatigue", "drop_set", "post_fatigue", "rest_pause_lourd", "cluster", "stretch_mediated"],
    portee: "≥2 méthodes/cycle dont 1 sur point faible ; rotation entre cycles",
    source: "BASE+COACH",
  },
  {
    id: "obj_perte_androide",
    diagnostic: "Objectif PERTE + répartition androïde",
    condition: (fiche, form) => form?.objectif === "perte" && fiche?.observations?.physique?.repartition_graisse === "androide",
    groupe_cible: null,
    methodes_attendues: ["hiit_structure", "series_longues", "superset_antagoniste"],
    portee: "≥1 par semaine",
    source: "BASE+COACH",
  },
  {
    id: "obj_perte_gynoide",
    diagnostic: "Objectif PERTE + répartition gynoïde",
    condition: (fiche, form) => form?.objectif === "perte" && fiche?.observations?.physique?.repartition_graisse === "gynoide",
    groupe_cible: "jambes",
    methodes_attendues: ["superset_agoniste", "circuit_training", "density_amrap"],
    portee: "≥1 par semaine sur bas du corps",
    source: "BASE+COACH",
  },
  {
    id: "obj_prepa",
    diagnostic: "Objectif PRÉPA physique / combat",
    condition: (_fiche, form) => form?.objectif === "prepa",
    groupe_cible: null,
    methodes_attendues: ["circuit_training", "contraste", "pliometrie", "demi_pyramide"],
    portee: "≥1 par semaine",
    source: "BASE+COACH",
  },
  {
    id: "obj_sante",
    diagnostic: "Objectif SANTÉ",
    // Ta règle Hugo V5 : excentrique à l'élastique en priorité pour la santé
    condition: (_fiche, form) => form?.objectif === "sante",
    groupe_cible: null,
    methodes_attendues: ["excentrique_elastique", "isometrique", "tempo_lent_excentrique"],
    portee: "≥1 sur mouvements principaux (excentrique à l'élastique privilégié — récupération + gain force en allongement + protection tendons)",
    source: "COACH_HUGO_V5",
  },
  {
    id: "obj_reathle",
    diagnostic: "Objectif RÉATHLÉ",
    condition: (_fiche, form) => form?.objectif === "reathle" || form?.objectif === "reathletisation",
    groupe_cible: null,
    methodes_attendues: ["tempo_lent_excentrique", "isometrique", "occlusion_bfr", "excentrique_elastique"],
    portee: "Phase 1 fascio-tendineuse : ≤60% 1RM, tempo 3-1-1-0, AUCUN rest-pause/drop/cluster/partiel lourd (G5)",
    source: "BASE+COACH",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// PARTIE 3 — GARDE-FOUS TRANSVERSES (priment sur les attendus D1-D5)
// ═══════════════════════════════════════════════════════════════════════

export const GARDE_FOUS = {
  G1: "Max 1 exo en rest-pause/cluster par séance",
  G2: "Jamais 2 cycles de suite avec rest-pause/cluster sur même zone",
  G3: "Densité \"débutant\" → aucune méthode d'intensification autorisée (sauf méthodes douces sur point faible : tension_continue, tempo_lent_excentrique, isometrique, unilateral, contraction_tenue, reps_1_5)",
  G4: "Pathologie articulaire → repos courts (60-90s) sur cette zone",
  G5: "Phase 1 fascio-tendineuse (réathlé, âge+sédentaire) → aucune méthode traumatisante pendant 4-8 semaines",
  G6: "Excentrique surchargé → requiert un pareur, jamais en autonomie (mention obligatoire dans tips_coach)",
  G7: "Pyramide DESCENDANTE (redescendre la charge après série lourde) INTERDITE en force pure",
  G8: "Drop set sur compound lourd (squat, SDT, DC lourd) → uniquement avec cage/rack de sécurité (mention obligatoire dans tips_coach)",
};

// ═══════════════════════════════════════════════════════════════════════
// PARTIE 4 — DÉTECTION AUTOMATIQUE : quelle méthode est appliquée à un exo ?
// ═══════════════════════════════════════════════════════════════════════
// Le champ `methode` du JSON de sortie ("classique|superset_avec_suivant|
// drop_set|rest_pause|pyramidal|cluster") ne couvre que 5-6 méthodes.
// Beaucoup de méthodes se lisent aussi dans le tempo, les reps, le repos
// ou le tips_coach. Cette fonction combine ces signaux pour produire la
// liste des méthodes réellement appliquées à un exo donné.

const RE_UNILAT = /\bunilat|bras droit|bras gauche|jambe droite|jambe gauche|un bras|une jambe|alterné/i;
const RE_ISO = /\bisom|planche|hold\s*\d|tenue\s*\d|dead\s*bug|bird\s*dog|wall\s*sit|bridge tenu/i;
const RE_TEMPO_LENT = /\bexcentrique lent|tempo lent|négative lente|3\s*[-–]\s*[01]\s*[-–]\s*[12]/i;
const RE_ROM_REDUIT = /\bdemi[- ]amplitude|rom réduit|amplitude réduite|partiel|rom limité/i;
const RE_STRETCH = /\bstretch[- ]mediated|position d'étirement|amplitude complète.*étirement|déficit/i;
const RE_PEAK = /\bcontraction tenue|peak contraction|serrer\s*\d+\s*s|tenir la contraction/i;
const RE_1_5 = /\b1\.?5\s*reps?|une rep et demie|demi-rep basse/i;
const RE_ELASTIQUE_EXC = /\bélastique.*excentr|excentr.*élastique/i;
const RE_TENSION_CONTINUE = /\btension continue|jamais relâcher|sans blocage/i;
const RE_BURN = /\bbrûlure|burn out|jusqu'?à la brûlure/i;
const RE_FACE_PULL_PREF = /\bface pull.*avant|avant.*face pull|pull apart.*début/i;
const RE_EMS = /\bems|électro[- ]stimul/i;
const RE_BFR = /\bocclusion|bfr|restriction sanguine/i;
const RE_CONTRASTE = /\bcontraste|potentiation|explosif après lourd/i;
const RE_PLIO = /\bpliom|drop jump|bond|box jump|throw/i;
const RE_HIIT = /\bhiit|30\/30|40\/20|tabata/i;
const RE_CIRCUIT = /\bcircuit|amrap|density/i;

/**
 * Détecte l'ensemble des méthodes appliquées à un exercice donné, en
 * combinant : le champ `methode` structuré, le tempo, les reps, le repos
 * et le tips_coach. Retourne un Set de clés METHODES.
 */
export function detectMethodesExo(ex) {
  const found = new Set();
  const meth = String(ex?.methode || "").toLowerCase();
  const tips = String(ex?.tips_coach || "");
  const tempo = String(ex?.tempo || "");
  const reps = String(ex?.reps || "");
  const repos = String(ex?.repos || "");
  const all = `${tips} ${tempo} ${reps} ${repos}`;

  // Champ methode structuré (déjà normalisé côté prompt)
  if (meth.includes("drop")) found.add("drop_set");
  if (meth.includes("rest_pause") || meth.includes("rest-pause")) found.add("rest_pause_lourd");
  if (meth.includes("cluster")) found.add("cluster");
  if (meth.includes("superset")) {
    // Ne peut pas savoir agoniste/antagoniste sans plus d'info : on prend
    // les 2 pour maximiser la reconnaissance côté validateur.
    found.add("superset_agoniste");
    found.add("superset_antagoniste");
  }
  if (meth.includes("pyramid")) found.add("demi_pyramide");

  // Détection via texte libre (tips, tempo, reps, repos)
  if (RE_UNILAT.test(all)) found.add("unilateral");
  if (RE_ISO.test(all)) found.add("isometrique");
  if (RE_TEMPO_LENT.test(all) || /^\s*[3-9]-/.test(tempo)) found.add("tempo_lent_excentrique");
  if (RE_ROM_REDUIT.test(all)) found.add("demi_amplitude");
  if (RE_STRETCH.test(all)) found.add("stretch_mediated");
  if (RE_PEAK.test(all)) found.add("contraction_tenue");
  if (RE_1_5.test(all)) found.add("reps_1_5");
  if (RE_ELASTIQUE_EXC.test(all)) found.add("excentrique_elastique");
  if (RE_TENSION_CONTINUE.test(all)) found.add("tension_continue");
  if (RE_BURN.test(all)) found.add("brulure");
  if (RE_FACE_PULL_PREF.test(String(ex?.nom || "") + " " + tips)) found.add("pre_fatigue");
  if (RE_EMS.test(all)) found.add("ems_sensibilisation");
  if (RE_BFR.test(all)) found.add("occlusion_bfr");
  if (RE_CONTRASTE.test(all)) found.add("contraste");
  if (RE_PLIO.test(all + " " + String(ex?.nom || ""))) found.add("pliometrie");
  if (RE_HIIT.test(all)) found.add("hiit_structure");
  if (RE_CIRCUIT.test(all)) found.add("circuit_training");

  // Séries de 100 : reps ≥ 50 et repos ≤ 60s
  if (/\b(100|80|70|60|50)\b/.test(reps) && /\b[1-6]?\ds?\b/.test(repos)) {
    const repsN = parseInt(reps, 10);
    if (repsN >= 50) found.add("series_de_100");
  }

  // Pré-fatigue / post-fatigue implicites : signalés dans tips_coach
  if (/pré[- ]fatigue|prefatigue/i.test(tips)) found.add("pre_fatigue");
  if (/post[- ]fatigue|postfatigue/i.test(tips)) found.add("post_fatigue");
  if (/pré[- ]étirement|pre-etirement|étirer.*contracter/i.test(tips)) found.add("pre_etirement");
  if (/rotation d'angles|3 angles/i.test(tips)) found.add("rotation_angles");
  if (/mechanical drop|changer d'angle/i.test(tips)) found.add("mechanical_drop_set");
  if (/dead stop|pause en bas|arrêt en position basse/i.test(tips)) found.add("dead_stop");

  return found;
}

// ═══════════════════════════════════════════════════════════════════════
// PARTIE 5 — COLLECTE DES DIAGNOSTICS PRÉSENTS SUR UN PROFIL
// ═══════════════════════════════════════════════════════════════════════

/**
 * Retourne la liste des lignes de matrice actives pour ce couple (fiche,
 * form). Chaque ligne active a passé son test de `condition`. Cette
 * liste est ce que le validateur utilisera comme référence.
 */
export function collectDiagnostics(fiche, form) {
  const actifs = [];
  const contexte = { fiche, form };

  // D1 asymétries
  for (const r of D1_ASYMETRIES) {
    if (r.condition && r.condition(fiche, form)) actifs.push({ ...r, source_matrice: "D1" });
  }

  // D2 points faibles — 2 déclencheurs possibles
  const repartition = fiche?.observations?.repartition || {};
  const objectifPrecis = String(form?.objectifPrecis || "").toLowerCase();
  for (const r of D2_POINTS_FAIBLES) {
    if (!(r.objectifs || []).includes(form?.objectif)) continue;

    // Condition supplémentaire (ex : insertion biceps haute)
    if (r.condition_supp && !r.condition_supp(fiche, form)) continue;

    // Condition explicite (ex : point faible faux non détectable)
    if (r.condition && !r.condition(fiche, form)) continue;

    let declenche = false;

    // Muscle en retard sur photo ?
    for (const m of (r.muscles || [])) {
      const clef = MUSCLE_TO_REPARTITION[m] || m;
      const v = repartition[clef];
      if (v === "en_retard" || v === "tres_en_retard") {
        declenche = true;
        break;
      }
    }

    // Muscle nommé dans objectif précis ?
    if (!declenche && objectifPrecis) {
      for (const m of (r.muscles || [])) {
        for (const kw of (MUSCLE_KEYWORDS[m] || [m])) {
          if (objectifPrecis.includes(kw)) {
            declenche = true;
            break;
          }
        }
        if (declenche) break;
      }
    }

    if (declenche) actifs.push({ ...r, source_matrice: "D2" });
  }

  // D4 postures
  for (const r of D4_POSTURES) {
    if (r.condition && r.condition(fiche, form)) actifs.push({ ...r, source_matrice: "D4" });
  }

  // D5 objectif × niveau
  for (const r of D5_OBJECTIF_NIVEAU) {
    if (r.condition && r.condition(fiche, form)) actifs.push({ ...r, source_matrice: "D5" });
  }

  return actifs;
}

// Table de correspondance muscle → clé de fiche.observations.repartition
const MUSCLE_TO_REPARTITION = {
  fessiers: "fessiers",           // clé si présente
  pectoraux: "pectoraux",
  dos: "dos_largeur",
  dos_largeur: "dos_largeur",
  dos_epaisseur: "dos_epaisseur",
  epaules: "epaules",
  biceps: "biceps",
  triceps: "triceps",
  quadriceps: "quadriceps",
  jambes: "quadriceps",           // approximation
  ischios: "ischios",
  mollets: "mollets",
  abdos: "abdos",
  abdominaux: "abdos",
};

// Table de correspondance muscle → mots-clés potentiels dans objectifPrecis
const MUSCLE_KEYWORDS = {
  fessiers: ["fessier", "glute", "cul", "fesse"],
  pectoraux: ["pec", "poitrine", "torse", "sein"],
  dos: ["dos", "large", "épaisseur", "grand dorsal"],
  dos_largeur: ["large", "grand dorsal", "v-tap", "v tap"],
  dos_epaisseur: ["épaisseur", "milieu du dos", "trapèze", "trapeze"],
  epaules: ["épaule", "epaule", "delto"],
  biceps: ["biceps", "bras"],
  triceps: ["triceps", "bras"],
  quadriceps: ["quadri", "cuisse", "jambe"],
  jambes: ["jambe", "cuisse", "quadri"],
  ischios: ["ischio", "ischios", "fessier arrière"],
  mollets: ["mollet"],
  abdos: ["abdo", "ventre", "gainage", "tablette"],
  abdominaux: ["abdo", "ventre", "tablette"],
};

// ═══════════════════════════════════════════════════════════════════════
// PARTIE 6 — BLOC PROMPT (injecté dans generate-program)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Construit le bloc "MÉTHODES ATTENDUES POUR CE PROFIL" à injecter dans
 * le prompt. Ce bloc REMPLACE la phrase générique "au moins 1 méthode
 * d'intensification par cycle" du V4 par une liste PRÉCISE des méthodes
 * attendues pour CE client, extraites de la matrice diagnostic → méthodes.
 * Sonnet voit la logique CAUSALE, pas une contrainte quantitative floue.
 */
export function buildMethodesBlock({ fiche, form }) {
  const diags = collectDiagnostics(fiche, form);
  if (diags.length === 0) return "";

  const niveau = form?.niveau || "intermediaire";
  const isDebutant = niveau === "debutant" || fiche?.observations?.physique?.densite_musculaire === "debutant";

  const lignes = diags.map(d => {
    // Retirer les méthodes interdites au débutant sauf si elles sont douces
    let methodes = d.methodes_attendues;
    if (isDebutant) {
      methodes = methodes.filter(m => METHODES_DOUCES_DEBUTANT.has(m) && !METHODES_INTERDITES_DEBUTANT.has(m));
      if (methodes.length === 0) {
        return `  • [${d.source_matrice}] ${d.diagnostic} → aucune méthode d'intensification autorisée (niveau débutant, garde-fou G3)`;
      }
    }
    const noms = methodes.map(m => METHODES[m]?.nom || m).join(" | ");
    const cible = d.groupe_cible ? ` — muscle : ${d.groupe_cible}` : "";
    const note = d.note ? `\n    → ${d.note}` : "";
    const portee = d.portee ? `\n    → Portée : ${d.portee}` : "";
    return `  • [${d.source_matrice}] ${d.diagnostic}${cible}\n    → Méthodes attendues : ${noms}${note}${portee}`;
  });

  return `
═══ MÉTHODES D'ENTRAÎNEMENT ATTENDUES POUR CE PROFIL ═══
Ces attendus sont dérivés AUTOMATIQUEMENT du croisement (fiche morpho +
objectif + objectif précis + niveau + posture) selon la matrice MorphoCoach
V5 (matrice diagnostic → méthodes attendues, contenue dans ta base de
connaissance C1/C6/C10). Chaque ligne est un DIAGNOSTIC actif sur CE
client et la ou les méthodes qui y répondent.

RÈGLE D'APPLICATION : pour chaque diagnostic présent, AU MOINS UNE des
méthodes attendues doit apparaître dans le programme sur les exercices
du muscle concerné. Le nombre total de méthodes n'est PAS la contrainte —
c'est la RÉPONSE CAUSALE à chaque diagnostic qui compte.

${lignes.join("\n")}

Garde-fous prioritaires (priment sur les attendus ci-dessus) :
  G1 : ${GARDE_FOUS.G1}
  G3 : ${GARDE_FOUS.G3}
  G5 : ${GARDE_FOUS.G5}
  G7 : ${GARDE_FOUS.G7}
  G8 : ${GARDE_FOUS.G8}

Un contrôle automatique (validateMethodes) vérifiera après ta génération
que chaque diagnostic a bien reçu sa réponse méthodologique. Un
diagnostic actif sans méthode attendue dans le programme déclenchera
une correction.`;
}
