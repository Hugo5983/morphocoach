// ─── KNOWLEDGE : MORPHOLOGIE ────────────────────────────────────────────────
// Distillé de MorphoCoach_Base_Complete.pdf — Moteur Étapes 1, 2, 5 + C2/C6/C10.
// V2 : 24 règles (vs 15), 5 nouveaux points visuels, correction clavicules
// larges, gestion densite_musculaire + 3 postures ignorées.
// Deux niveaux : OBSERVATION (catégories fermées) puis CONSÉQUENCE (déterministe).

// ─── 1. SCHÉMA D'OBSERVATION (valeurs fermées) ──────────────────────────────
export const SCHEMA_OBSERVATIONS = {
  leviers: {
    humerus:         ["court", "moyen", "long", "indetermine"],
    avant_bras:      ["court", "moyen", "long", "indetermine"],
    femur:           ["court", "moyen", "long", "indetermine"],
    tibia:           ["court", "moyen", "long", "indetermine"],
    clavicules:      ["etroites", "moyennes", "larges", "indetermine"],
    cage_thoracique: ["plate", "moyenne", "bombee", "indetermine"],
    bassin:          ["etroit", "moyen", "large", "indetermine"],
  },
  insertions: {
    biceps:     ["haute", "moyenne", "basse", "indetermine"],
    mollets:    ["haute", "moyenne", "basse", "indetermine"],
    pectoraux:  ["haute", "moyenne", "basse", "indetermine"],
    abdominaux: ["haute", "moyenne", "basse", "indetermine"],
    ischios:    ["haute", "moyenne", "basse", "indetermine"],
    avant_bras: ["haute", "moyenne", "basse", "indetermine"],
  },
  physique: {
    masse_grasse_visuelle: ["tres_sec", "sec", "moyen", "gras", "tres_gras", "indetermine"],
    densite_musculaire:    ["debutant", "intermediaire", "developpe", "elite", "indetermine"],
    repartition_graisse:   ["androide", "gynoide", "mixte", "indetermine"],
  },
  proportions: {
    rapport_epaules_taille: ["vtaper_prononce", "vtaper_moyen", "vtaper_faible", "indetermine"],
    rapport_tronc_jambes:   ["tronc_long", "equilibre", "jambes_longues", "indetermine"],
    symetrie_gauche_droite: ["symetrique", "bras_droit_dominant", "bras_gauche_dominant",
                             "jambe_droite_dominante", "jambe_gauche_dominante", "indetermine"],
    position_pieds_naturelle: ["rotation_externe", "paralleles", "rotation_interne", "indetermine"],
  },
  posture: {
    items: ["antepulsion_scapulaire", "cyphose", "hyperlordose", "bascule_bassin",
            "valgus_genou", "epaule_asymetrique", "rotation_bassin"],
  },
  repartition: {
    groupes: ["quadriceps", "ischios", "mollets", "pectoraux", "dos_largeur",
              "dos_epaisseur", "epaules", "biceps", "triceps", "abdos"],
    valeurs: ["tres_en_retard", "en_retard", "equilibre", "dominant", "indetermine"],
  },
  confiance: ["haute", "moyenne", "faible"],
};

// Repères visuels donnés à l'IA vision
export const REPERES_VISUELS = `
COMMENT LIRE (à l'œil de coach, JAMAIS de mesure) :
- Humérus : longueur épaule→coude comparée au torse. Long = leviers défavorables poussées. Court = avantage poussées.
- Avant-bras : long par rapport au bras → risque pec en bas du développé. Court = avantage curls, désavantage rowings.
- Fémur : cuisse longue par rapport au tronc → buste qui plonge au squat. Tibia long + fémur court = bon squatteur.
- Clavicules : largeur des épaules os à os. Larges = avantage esthétique mais risque conflit sous-acromial en abduction >90°.
- Cage : bombée = pectoraux faciles, ROM réduit au développé ; plate = prudence étirement.
- Bassin : large = meilleure stabilité lombaire au squat, quadriceps galbé.
- Insertions (clé du potentiel esthétique) : haute = muscle "court", gap tendineux visible (pic marqué mais creux)
  basse = ventre plein, aspect dense. Biceps : gap au pli du coude bras fléchi. Mollets : hauteur du galbe.
  Pectoraux : vide central près du sternum. Abdos : tablette courte ou longue. Ischios : s'arrêtent avant le genou ou non.
- Répartition graisse : androïde = stockage ventre/flancs ; gynoïde = hanches/cuisses/fessiers.
- V-taper : rapport visuel épaules vs taille — prononcé, moyen, ou quasi inexistant.
- Rapport tronc/jambes : tronc long avec jambes courtes, ou jambes longues avec tronc court. Impact sur le squat et le soulevé.
- Symétrie : comparer droite vs gauche — bras, jambes, épaules. Asymétrie visible = travail unilatéral obligatoire.
- Position pieds : en photo face, les pieds pointent-ils vers l'extérieur, sont-ils parallèles, ou vers l'intérieur ?
RÈGLE ABSOLUE : au moindre doute ou photo insuffisante → "indetermine". Ne JAMAIS inventer.
Une insertion ne se change pas : on maximise le ventre musculaire existant, on gère les attentes.`;

// ─── 2. TABLE OBSERVATION → CONSÉQUENCE (déterministe) ──────────────────────
const REGLES = [
  // ══ LEVIERS ══════════════════════════════════════════════════════════════
  { id: "femur_long",
    when: o => o.leviers?.femur === "long",
    consequence: "Fémurs longs : buste qui plonge au squat barre. Le squat profond strict n'est pas son ami.",
    interdits:    ["squat barre profond"],
    adaptes:      ["squat talons surélevés", "box squat contact doux"],
    privilegies:  ["hack squat", "presse 45°", "belt squat", "squat goblet"] },
  { id: "tibia_court_femur_long",
    when: o => o.leviers?.femur === "long" && o.leviers?.tibia === "court",
    consequence: "Fémurs longs + tibias courts : la pire morphologie pour le squat. Le buste plonge ET le genou avance peu. Squat barre impossible en sécurité.",
    interdits:    ["squat barre", "front squat", "squat barre profond"],
    privilegies:  ["presse 45° pieds hauts", "hack squat", "belt squat", "leg extension + leg curl combinés"] },
  { id: "bon_squatteur",
    when: o => o.leviers?.femur === "court" && o.leviers?.tibia === "long",
    consequence: "Ratio fémur court / tibia long : morphologie de squatteur. Le squat barre peut être un pilier.",
    privilegies: ["squat barre", "front squat"] },
  { id: "humerus_long",
    when: o => o.leviers?.humerus === "long",
    consequence: "Humérus longs : leviers défavorables aux poussées, fatigue triceps élevée. Progression sur machines et angles courts.",
    adaptes:     ["développé couché barre (ne pas surcharger)"],
    privilegies: ["développé haltères", "développé machine convergente", "écartés câble"] },
  { id: "humerus_court",
    when: o => o.leviers?.humerus === "court",
    consequence: "Humérus courts : avantage biomécanique majeur sur les poussées. Exploiter avec du développé lourd et une progression de charge ambitieuse.",
    privilegies: ["développé couché barre lourd", "développé militaire haltères", "dips lestés"] },
  { id: "avant_bras_long_cage_plate",
    when: o => o.leviers?.avant_bras === "long" && o.leviers?.cage_thoracique === "plate",
    consequence: "Avant-bras longs + cage plate : course très longue et étirement excessif en bas du développé (risque pec/épaule). Réduire le ROM ou passer haltères/machines.",
    interdits:   ["dips profonds lestés"],
    adaptes:     ["développé couché ROM réduit"],
    privilegies: ["développé haltères amplitude contrôlée", "machine convergente"] },
  { id: "avant_bras_court",
    when: o => o.leviers?.avant_bras === "court",
    consequence: "Avant-bras courts : avantage curls (bras de levier réduit), mais tirage court en rowing. Compenser par des rowings à amplitude complète.",
    privilegies: ["curl barre", "curl pupitre"],
    adaptes:     ["rowing haltère un bras amplitude complète", "rowing barre prise large"] },
  { id: "cage_plate",
    when: o => o.leviers?.cage_thoracique === "plate",
    consequence: "Cage plate : expansion thoracique à travailler — pullover 1×/semaine, prudence étirement extrême lourd.",
    privilegies: ["pull-over travers banc"] },
  { id: "cage_bombee",
    when: o => o.leviers?.cage_thoracique === "bombee",
    consequence: "Cage bombée : avantage développé couché (ROM réduit, recrutement pec facilité). Le développé barre est un pilier. Pullover inutile.",
    privilegies: ["développé couché barre", "développé couché haltères"],
    interdits:   [] },
  { id: "clavicules_larges",
    when: o => o.leviers?.clavicules === "larges",
    consequence: "Carrure large : avantage esthétique, bonne base d'appui au développé. Mais risque de conflit sous-acromial en abduction au-delà de 90°. Limiter les élévations latérales lourdes et le behind-the-neck press.",
    interdits:   ["behind-the-neck press"],
    adaptes:     ["développé militaire prise ≤ largeur d'épaules", "élévations latérales légères ROM contrôlé"],
    privilegies: ["développé haltères (liberté articulaire)", "développé couché barre"] },
  { id: "clavicules_etroites",
    when: o => o.leviers?.clavicules === "etroites",
    consequence: "Clavicules étroites : le V-taper passera par les deltoïdes latéraux et la largeur du dos.",
    privilegies: ["élévations latérales (volume prioritaire)", "tirage vertical prise large"] },
  { id: "bassin_etroit",
    when: o => o.leviers?.bassin === "etroit",
    consequence: "Bassin étroit : lombaires moins protégés au squat → prudence charges lourdes, renfort gainage systématique.",
    adaptes:     ["squat lourd (prudence)"],
    privilegies: ["gainage anti-extension", "gainage transverse"] },
  { id: "bassin_large_femur_long",
    when: o => o.leviers?.bassin === "large" && o.leviers?.femur === "long",
    consequence: "Bassin large + fémurs longs : double pénalité au squat, valgus dynamique probable. Même traitement que fémurs longs, avec surveillance du genou.",
    interdits:   ["squat barre profond"],
    privilegies: ["presse 45° pieds hauts", "belt squat", "abduction hanche câble", "squat goblet contrôle genoux"] },

  // ══ POSTURE ══════════════════════════════════════════════════════════════
  { id: "valgus_genou",
    when: o => (o.posture || []).includes("valgus_genou"),
    consequence: "Valgus genou visible : travail abducteurs/fessier moyen obligatoire, contrôle alignement genou-pied.",
    privilegies: ["clamshells", "abduction hanche câble", "squat goblet contrôle genoux"] },
  { id: "antepulsion",
    when: o => (o.posture || []).includes("antepulsion_scapulaire"),
    consequence: "Antépulsion scapulaire : face pull à CHAQUE séance (échauffement), volume tirage ≥ volume poussée.",
    privilegies: ["face pull", "rétraction scapulaire", "rowing coudes ouverts"] },
  { id: "hyperlordose",
    when: o => (o.posture || []).includes("hyperlordose"),
    consequence: "Hyperlordose : gainage anti-extension prioritaire, prudence surcharges lombaires debout.",
    interdits:   ["hyperextension lombaire lourde"],
    privilegies: ["dead bug", "planche RKC", "pallof press"] },
  { id: "cyphose",
    when: o => (o.posture || []).includes("cyphose"),
    consequence: "Cyphose thoracique : renfort extenseurs du rachis + ouverture pectorale. Rowing et tirage menton prioritaires.",
    privilegies: ["rowing buste penché", "tirage horizontal coudes bas", "face pull", "étirements pec mineur"] },
  { id: "bascule_bassin",
    when: o => (o.posture || []).includes("bascule_bassin"),
    consequence: "Bascule de bassin : asymétrie de charge au squat et soulevé. Travail unilatéral obligatoire (fentes, bulgares) pour rééquilibrer. Gainage anti-rotation prioritaire.",
    privilegies: ["fentes bulgares", "step-up unilatéral", "pallof press", "gainage anti-rotation"],
    adaptes:     ["squat barre (contrôle symétrie)", "soulevé de terre (contrôle symétrie)"] },
  { id: "epaule_asymetrique",
    when: o => (o.posture || []).includes("epaule_asymetrique"),
    consequence: "Épaule asymétrique : travail unilatéral systématique côté faible sur TOUS les exercices de poussée et tirage haut du corps. Commencer toujours par le côté faible.",
    privilegies: ["développé haltère un bras", "rowing un bras", "élévation latérale unilatérale"] },
  { id: "rotation_bassin",
    when: o => (o.posture || []).includes("rotation_bassin"),
    consequence: "Rotation de bassin : déséquilibre rotationnel qui affecte squat et soulevé. Gainage anti-rotation prioritaire, travail unilatéral systématique.",
    privilegies: ["pallof press", "fentes bulgares", "step-up unilatéral", "bird dog"] },

  // ══ INSERTIONS ══════════════════════════════════════════════════════════
  { id: "biceps_court",
    when: o => o.insertions?.biceps === "haute",
    consequence: "Biceps insertion haute (muscle court) : pic marqué mais gap bas. Maximiser le ventre : curls bras en avant (pupitre, machine) ; chef long bras en arrière (incliné 45°).",
    privilegies: ["curl pupitre", "curl incliné 45°"] },
  { id: "mollets_hauts",
    when: o => o.insertions?.mollets === "haute",
    consequence: "Mollets hauts perchés : potentiel limité (l'annoncer), amplitude maximale et focus étirement, fréquence élevée acceptée.",
    privilegies: ["mollets assis amplitude max", "mollets debout étirement 2s en bas"] },
  { id: "pecs_courts",
    when: o => o.insertions?.pectoraux === "haute",
    consequence: "Pectoraux insertion loin du sternum (vide central) : la barre fixe les mains — convergents où les mains se rejoignent.",
    privilegies: ["écartés câble mains jointes", "machine convergente", "développé haltères rapprochement"] },
  { id: "ischios_courts",
    when: o => o.insertions?.ischios === "haute",
    consequence: "Ischios type sprinter (s'arrêtent avant le genou) : chercher l'étirement — leg curls variés + travail hanche.",
    privilegies: ["leg curl assis", "soulevé de terre roumain léger", "leg curl pointes vers soi"] },
  { id: "abdos_courts",
    when: o => o.insertions?.abdominaux === "haute",
    consequence: "Abdominaux insertion haute (tablette courte, gap large entre les plaques). Le crunch ne remplira pas le vide. Compenser visuellement par le travail des obliques et du dentelé antérieur.",
    privilegies: ["rotation câble debout", "pullover crunch (dentelé)", "vacuum", "élévation latérale tronc"],
    adaptes:     ["crunch classique (effet limité)"] },

  // ══ PHYSIQUE & PROPORTIONS ══════════════════════════════════════════════
  { id: "masse_grasse_haute",
    when: o => ["gras", "tres_gras"].includes(o.physique?.masse_grasse_visuelle),
    consequence: "Masse grasse visuelle élevée : densité de travail et conditionnement métabolique intégrés, protection articulaire (machines/câbles pour les impacts).",
    privilegies: ["circuits métaboliques", "supersets non-antagonistes"] },
  { id: "masse_grasse_tres_sec",
    when: o => o.physique?.masse_grasse_visuelle === "tres_sec",
    consequence: "Très sec : récupération articulaire réduite (moins de coussin), risque tendinopathies si volume trop élevé. Deload plus fréquent, machines sur isolations.",
    adaptes:     ["volume total élevé (réduire)", "séries longues lourdes"],
    privilegies: ["machines guidées pour isolations", "échauffement articulaire renforcé"] },
  { id: "densite_debutant",
    when: o => o.physique?.densite_musculaire === "debutant",
    consequence: "Débutant musculairement : progression linéaire simple, composés de base, peu de variations. Pas de techniques avancées (drop sets, rest-pause) — elles masquent la progression et surchargent inutilement.",
    interdits:   ["drop sets", "rest-pause", "clusters", "séries géantes"],
    privilegies: ["squat/développé/rowing/soulevé en progression linéaire", "3×8-12 classique"] },
  { id: "densite_developpe",
    when: o => ["developpe", "elite"].includes(o.physique?.densite_musculaire),
    consequence: "Musculature développée/élite : techniques avancées nécessaires pour continuer à progresser. Variation des stimuli obligatoire à chaque cycle.",
    privilegies: ["drop sets", "rest-pause", "clusters", "supersets mécaniques", "pré-fatigue"] },
  { id: "vtaper_faible",
    when: o => o.proportions?.rapport_epaules_taille === "vtaper_faible",
    consequence: "V-taper quasi inexistant : prioriser deltoïdes latéraux (volume élevé, 4-5 séries/séance) + dos en largeur (tirages verticaux). Réduction visuelle du tour de taille par le gainage transverse/vacuum.",
    privilegies: ["élévations latérales volume", "tirage vertical prise large", "vacuum abdominal"] },
  { id: "symetrie_bras",
    when: o => ["bras_droit_dominant", "bras_gauche_dominant"].includes(o.proportions?.symetrie_gauche_droite),
    consequence: "Asymétrie bras visible : TOUS les exercices bras en unilatéral, commencer par le côté faible, même nombre de reps des deux côtés (le côté fort s'adapte au faible).",
    privilegies: ["curl haltère un bras", "extension triceps unilatérale", "développé haltère un bras"] },
  { id: "symetrie_jambes",
    when: o => ["jambe_droite_dominante", "jambe_gauche_dominante"].includes(o.proportions?.symetrie_gauche_droite),
    consequence: "Asymétrie jambes visible : priorité unilatéral (fentes, leg press un pied, leg curl un côté), commencer par le côté faible.",
    privilegies: ["fente bulgare", "leg press unilatéral", "leg curl unilatéral", "step-up"] },
  { id: "rotation_externe_pieds",
    when: o => o.proportions?.position_pieds_naturelle === "rotation_externe",
    consequence: "Pieds en rotation externe naturelle : squat en stance légèrement plus large, pieds pointés à 30-45°. Ne PAS forcer les pieds parallèles.",
    adaptes: ["squat pieds parallèles (éviter)"],
    privilegies: ["squat sumo", "presse pieds écartés"] },
  { id: "rotation_interne_pieds",
    when: o => o.proportions?.position_pieds_naturelle === "rotation_interne",
    consequence: "Pieds en rotation interne : attention au valgus dynamique. Stance étroite ou moyenne, travail abducteurs renforcé.",
    privilegies: ["squat stance moyenne pieds droits", "abduction hanche", "clamshells"] },
  { id: "graisse_androide",
    when: o => o.proportions?.repartition_graisse === "androide",
    consequence: "Répartition androïde (ventre/flancs) : HIIT et circuits métaboliques efficaces. Gainage transverse et vacuum pour la compression abdominale.",
    privilegies: ["HIIT intervalles", "circuits métaboliques", "vacuum abdominal", "gainage transverse"] },
  { id: "graisse_gynoide",
    when: o => o.proportions?.repartition_graisse === "gynoide",
    consequence: "Répartition gynoïde (hanches/cuisses) : cardio long modéré plus efficace que le HIIT pour ces zones. Travail fessier/abducteur en volume.",
    privilegies: ["cardio modéré 30-40min", "hip thrust volume", "abduction hanche"] },
  { id: "tronc_long",
    when: o => o.proportions?.rapport_tronc_jambes === "tronc_long",
    consequence: "Tronc long : avantage au squat (buste reste vertical), mais bras de levier lombaire au soulevé de terre. Privilégier le sumo ou le trap bar.",
    privilegies: ["soulevé de terre sumo", "trap bar deadlift"],
    adaptes:     ["soulevé de terre conventionnel (prudence lombaire)"] },
];

// ─── CONSÉQUENCES DÉRIVÉES ──────────────────────────────────────────────────
export function deriverConsequences(obs) {
  const lignes = [], interdits = [], adaptes = [], privilegies = [];
  for (const r of REGLES) {
    try {
      if (r.when(obs)) {
        lignes.push(r.consequence);
        if (r.interdits)   interdits.push(...r.interdits);
        if (r.adaptes)     adaptes.push(...r.adaptes);
        if (r.privilegies) privilegies.push(...r.privilegies);
      }
    } catch { /* observation absente → règle ignorée */ }
  }
  const retards = Object.entries(obs.repartition || {})
    .filter(([, v]) => v === "tres_en_retard" || v === "en_retard")
    .map(([k, v]) => ({ groupe: k, niveau: v }));
  const dominants = Object.entries(obs.repartition || {})
    .filter(([, v]) => v === "dominant").map(([k]) => k);
  return {
    lecture_coach: lignes,
    exercices_interdits: [...new Set(interdits)],
    exercices_adaptes:   [...new Set(adaptes)],
    exercices_privilegies: [...new Set(privilegies)],
    points_faibles_visuels: retards,
    points_forts_visuels: dominants,
    regle_donnant_donnant: retards.length
      ? "Réallouer le volume : + sur les points faibles (jusqu'à 3 stimulations/sem, cycle 4-8 semaines), volume d'entretien sur les dominants, puis RETOUR standard."
      : null,
  };
}

// ─── VALIDATION DES OBSERVATIONS ────────────────────────────────────────────
export function validerObservations(raw) {
  const obs = { leviers: {}, insertions: {}, physique: {}, proportions: {}, posture: [], repartition: {}, confiance: "faible" };
  const S = SCHEMA_OBSERVATIONS;
  for (const [k, allowed] of Object.entries(S.leviers))
    obs.leviers[k] = allowed.includes(raw?.leviers?.[k]) ? raw.leviers[k] : "indetermine";
  for (const [k, allowed] of Object.entries(S.insertions))
    obs.insertions[k] = allowed.includes(raw?.insertions?.[k]) ? raw.insertions[k] : "indetermine";
  for (const [k, allowed] of Object.entries(S.physique))
    obs.physique[k] = allowed.includes(raw?.physique?.[k]) ? raw.physique[k] : "indetermine";
  for (const [k, allowed] of Object.entries(S.proportions))
    obs.proportions[k] = allowed.includes(raw?.proportions?.[k]) ? raw.proportions[k] : "indetermine";
  obs.posture = Array.isArray(raw?.posture)
    ? raw.posture.filter(p => S.posture.items.includes(p)) : [];
  for (const g of S.repartition.groupes)
    obs.repartition[g] = S.repartition.valeurs.includes(raw?.repartition?.[g]) ? raw.repartition[g] : "indetermine";
  obs.confiance = S.confiance.includes(raw?.confiance) ? raw.confiance : "faible";
  return obs;
}
