// ─── KNOWLEDGE : MORPHOLOGIE ────────────────────────────────────────────────
// Distillé de MorphoCoach_Base_Complete.pdf — Moteur Étapes 1, 2, 5 + C2/C6/C10.
// Deux niveaux, comme un coach : OBSERVATION (catégories fermées, jamais de cm)
// puis CONSÉQUENCE (table déterministe en code). Le générateur ne lit JAMAIS
// les photos : il lit uniquement les conséquences.

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
  insertions: { // haute = muscle "court" | basse = muscle "long"
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
  },
  posture: { // détectable de face/profil/dos — booléens
    items: ["antepulsion_scapulaire", "cyphose", "hyperlordose", "bascule_bassin",
            "valgus_genou", "epaule_asymetrique", "rotation_bassin"],
  },
  repartition: { // par groupe, à l'œil
    groupes: ["quadriceps", "ischios", "mollets", "pectoraux", "dos_largeur",
              "dos_epaisseur", "epaules", "biceps", "triceps", "abdos"],
    valeurs: ["tres_en_retard", "en_retard", "equilibre", "dominant", "indetermine"],
  },
  confiance: ["haute", "moyenne", "faible"], // qualité des photos, par bloc
};

// Repères visuels donnés à l'IA vision (Étape 1.1-1.2 du PDF, condensé)
export const REPERES_VISUELS = `
COMMENT LIRE (à l'œil de coach, JAMAIS de mesure) :
- Humérus : longueur épaule→coude comparée au torse. Visiblement long = leviers défavorables aux poussées.
- Avant-bras : long par rapport au bras → risque coude/poignet et pec en bas du développé.
- Fémur : cuisse longue par rapport au tronc → buste qui plonge au squat. Tibia long + fémur court = bon squatteur.
- Clavicules : carrure large = avantage esthétique mais poussées lourdes plus instables.
- Cage : bombée = pectoraux plus faciles ; plate = prudence en étirement.
- Bassin : large = quadriceps galbé, meilleure stabilité lombaire au squat.
- Insertions (clé du potentiel esthétique) : haute = grand espace tendineux, muscle "court" difficile à remplir
  (biceps : gap au pli du coude bras fléchi ; mollets "hauts perchés" ; pectoraux : vide central près du sternum ;
  abdos : tablette courte ; ischios : s'arrêtent avant le genou). Basse = ventre qui descend, aspect plein.
- Répartition : comparer chaque groupe au reste du physique, pas à un idéal absolu.
RÈGLE ABSOLUE : au moindre doute ou photo insuffisante → "indetermine". Ne JAMAIS inventer.
Une insertion ne se change pas : on maximise le ventre musculaire existant, on gère les attentes.`;

// ─── 2. TABLE OBSERVATION → CONSÉQUENCE (déterministe, Étape 2 + C6/C10) ────
// Chaque règle : when(obs) → { texte coach, exercices interdits/adaptés/privilégiés }
const REGLES = [
  { id: "femur_long",
    when: o => o.leviers?.femur === "long",
    consequence: "Fémurs longs : buste qui plonge au squat barre. Le squat profond strict n'est pas son ami.",
    interdits:    ["squat barre profond"],
    adaptes:      ["squat talons surélevés", "box squat contact doux"],
    privilegies:  ["hack squat", "presse 45°", "belt squat", "squat goblet"] },
  { id: "bon_squatteur",
    when: o => o.leviers?.femur === "court" && o.leviers?.tibia === "long",
    consequence: "Ratio fémur court / tibia long : morphologie de squatteur. Le squat barre peut être un pilier.",
    privilegies: ["squat barre", "front squat"] },
  { id: "humerus_long",
    when: o => o.leviers?.humerus === "long",
    consequence: "Humérus longs : leviers défavorables aux poussées, fatigue triceps élevée, amplitude importante. Ne pas surcharger le développé ; la progression viendra des machines et angles courts.",
    adaptes:     ["développé couché barre (ne pas surcharger)"],
    privilegies: ["développé haltères", "développé machine convergente", "écartés câble"] },
  { id: "avant_bras_long_cage_plate",
    when: o => o.leviers?.avant_bras === "long" && o.leviers?.cage_thoracique === "plate",
    consequence: "Avant-bras longs + cage plate : course très longue et étirement excessif en bas du développé (risque pec/épaule). Réduire le ROM (barre arrêtée au-dessus de la poitrine) ou passer haltères/machines.",
    interdits:   ["dips profonds lestés"],
    adaptes:     ["développé couché ROM réduit"],
    privilegies: ["développé haltères amplitude contrôlée", "machine convergente"] },
  { id: "cage_plate",
    when: o => o.leviers?.cage_thoracique === "plate",
    consequence: "Cage plate : travail d'amplitude utile — pull-over 1×/semaine, prudence sur l'étirement extrême lourd.",
    privilegies: ["pull-over travers banc"] },
  { id: "clavicules_larges",
    when: o => o.leviers?.clavicules === "larges",
    consequence: "Carrure large : avantage esthétique, mais poussées lourdes plus instables. Verrouillage scapulaire strict, amplitude contrôlée ; accessoire de recentrage pec si recrutement difficile.",
    adaptes: ["développés lourds (verrouillage scapulaire strict)"] },
  { id: "clavicules_etroites",
    when: o => o.leviers?.clavicules === "etroites",
    consequence: "Clavicules étroites : le V-taper passera par les deltoïdes latéraux et la largeur du dos.",
    privilegies: ["élévations latérales (volume prioritaire)", "tirage vertical prise large"] },
  { id: "bassin_etroit",
    when: o => o.leviers?.bassin === "etroit",
    consequence: "Bassin étroit : lombaires moins protégés au squat → prudence charges lourdes, renfort gainage systématique.",
    adaptes:     ["squat lourd (prudence)"],
    privilegies: ["gainage anti-extension", "gainage transverse"] },
  { id: "valgus_genou",
    when: o => (o.posture || []).includes("valgus_genou"),
    consequence: "Valgus genou visible : travail abducteurs/fessier moyen obligatoire, contrôle de l'alignement genou-pied sur toutes les flexions.",
    privilegies: ["clamshells", "abduction hanche câble", "squat goblet contrôle genoux"] },
  { id: "antepulsion",
    when: o => (o.posture || []).includes("antepulsion_scapulaire"),
    consequence: "Antépulsion scapulaire : face pull à CHAQUE séance (échauffement), volume tirage ≥ volume poussée.",
    privilegies: ["face pull", "rétraction scapulaire", "rowing coudes ouverts"] },
  { id: "hyperlordose",
    when: o => (o.posture || []).includes("hyperlordose"),
    consequence: "Hyperlordose : gainage anti-extension prioritaire, prudence sur les surcharges lombaires debout.",
    interdits:   ["hyperextension lombaire lourde"],
    privilegies: ["dead bug", "planche RKC", "pallof press"] },
  { id: "biceps_court",
    when: o => o.insertions?.biceps === "haute",
    consequence: "Biceps à insertion haute (muscle court) : pic marqué mais gap bas — plafond génétique à annoncer honnêtement. Maximiser le ventre : curls bras en avant du corps (pupitre, machine) ; le chef long se travaille bras en arrière (incliné 45°).",
    privilegies: ["curl pupitre", "curl incliné 45°"] },
  { id: "mollets_hauts",
    when: o => o.insertions?.mollets === "haute",
    consequence: "Mollets hauts perchés : potentiel limité (l'annoncer), amplitude maximale et focus étirement, fréquence élevée acceptée car faible masse.",
    privilegies: ["mollets assis amplitude max", "mollets debout étirement 2s en bas"] },
  { id: "pecs_courts",
    when: o => o.insertions?.pectoraux === "haute",
    consequence: "Pectoraux à insertion loin du sternum (vide central) : la barre fixe les mains et ne comblera pas le centre — privilégier les convergents où les mains se rejoignent.",
    privilegies: ["écartés câble mains jointes", "machine convergente", "développé haltères rapprochement"] },
  { id: "ischios_courts",
    when: o => o.insertions?.ischios === "haute",
    consequence: "Ischios type sprinter (s'arrêtent avant le genou) : chercher l'étirement — leg curls variés + travail hanche, pointe de pied vers soi pour isoler.",
    privilegies: ["leg curl assis", "soulevé de terre roumain léger", "leg curl pointes vers soi"] },
  { id: "masse_grasse_haute",
    when: o => ["gras", "tres_gras"].includes(o.physique?.masse_grasse_visuelle),
    consequence: "Masse grasse visuelle élevée : densité de travail et conditionnement métabolique intégrés, protection articulaire (machines/câbles pour les impacts).",
    privilegies: ["circuits métaboliques", "supersets non-antagonistes"] },
];

/**
 * Construit la partie "conséquences" de la fiche morpho à partir des observations validées.
 * Déterministe : c'est LA connaissance MorphoCoach figée en code.
 */
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
  // Points faibles visuels → priorités esthétiques (Étape 5 : donnant-donnant)
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
      ? "Réallouer le volume : + sur les points faibles (jusqu'à 3 stimulations/sem sur la zone, cycle 4-8 semaines), volume d'entretien sur les dominants, puis RETOUR à un programme standard."
      : null,
  };
}

/** Valide/normalise les observations renvoyées par l'IA vision : toute valeur hors énumération → "indetermine". */
export function validerObservations(raw) {
  const obs = { leviers: {}, insertions: {}, physique: {}, posture: [], repartition: {}, confiance: "faible" };
  const S = SCHEMA_OBSERVATIONS;
  for (const [k, allowed] of Object.entries(S.leviers))
    obs.leviers[k] = allowed.includes(raw?.leviers?.[k]) ? raw.leviers[k] : "indetermine";
  for (const [k, allowed] of Object.entries(S.insertions))
    obs.insertions[k] = allowed.includes(raw?.insertions?.[k]) ? raw.insertions[k] : "indetermine";
  for (const [k, allowed] of Object.entries(S.physique))
    obs.physique[k] = allowed.includes(raw?.physique?.[k]) ? raw.physique[k] : "indetermine";
  obs.posture = Array.isArray(raw?.posture)
    ? raw.posture.filter(p => S.posture.items.includes(p)) : [];
  for (const g of S.repartition.groupes)
    obs.repartition[g] = S.repartition.valeurs.includes(raw?.repartition?.[g]) ? raw.repartition[g] : "indetermine";
  obs.confiance = S.confiance.includes(raw?.confiance) ? raw.confiance : "faible";
  return obs;
}
