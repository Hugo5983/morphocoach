// ─── ADAPTATIONS MORPHOLOGIQUES ─────────────────────────────────────────────
// Source : MorphoCoach — Base de connaissances complète
//   C1 §5.1-5.11  (leviers fins, ratios, chefs musculaires)
//   C2 §5.1-5.6   (squat, hanches, disques, pectoraux, épaules)
//   C2 §3.2-3.3   (hyperlaxité, âge)
//   C6 §2.1-2.4   (clavicules, cage/abdomen, bassin, avant-bras)
//
// PRINCIPE : ces règles ne sont PAS toutes envoyées. Chacune porte une
// condition testée sur les traits RÉELLEMENT observés (fiche morpho), l'âge,
// le sexe et les pathologies. Seules celles qui s'appliquent à CET athlète
// entrent dans le prompt — c'est ce qui rend l'individualisation possible
// sans faire exploser le contexte.
//
// Chaque règle est traçable à une section du PDF (champ `src`).

/**
 * @typedef {Object} Regle
 * @property {string} id
 * @property {string} src            section d'origine dans la base
 * @property {(c: Contexte) => boolean} when
 * @property {string} consequence    ce que l'IA doit faire, en clair
 * @property {string[]} [privilegier]
 * @property {string[]} [eviter]
 */

/**
 * @typedef {Object} Contexte
 * @property {Record<string,string>} lev   leviers  (humerus, femur, tibia…)
 * @property {Record<string,string>} ins   insertions
 * @property {Record<string,string>} phy   physique
 * @property {Record<string,string>} pro   proportions
 * @property {string[]} pos                posture
 * @property {Record<string,string>} rep   répartition par groupe
 * @property {number} age
 * @property {string} sexe
 * @property {string[]} patho
 */

/** @type {Regle[]} */
export const ADAPTATIONS = [
  // ── SQUAT & MEMBRES INFÉRIEURS (C2 §5.1, C1 §5.3) ────────────────────────
  {
    id: "femur_long_squat",
    src: "C1 §5.3 / C2 §5.1",
    when: (c) => c.lev.femur === "long",
    consequence:
      "Fémur long : le buste plonge vers l'avant au squat, ce qui reporte la charge sur les fessiers et les lombaires. "
      + "Ne pas prescrire de squat barre haute profond strict en début de cycle. Le risque de hernie discale est réel si "
      + "l'on insiste sur le squat lourd classique.",
    privilegier: ["Squat barre basse (low-bar)", "Hack squat", "Presse à jambes 45° pieds hauts", "Presse pieds hauts", "Front squat barre"],
    eviter: ["Squat barre haute profond lourd"],
  },
  {
    id: "femur_court_squat",
    src: "C1 §5.3",
    when: (c) => c.lev.femur === "court",
    consequence:
      "Fémur court : bon squatteur naturel, dos facilement droit. Le squat à la barre est adapté et doit être "
      + "le mouvement central du bas du corps — c'est un atout à exploiter, pas à contourner.",
    privilegier: ["Squat barre nuque (high-bar)", "Squat barre nuque (high-bar)"],
  },
  {
    id: "torse_court_femur_long",
    src: "C1 §5.3 (config la moins favorable)",
    when: (c) => c.lev.femur === "long" && c.pro.rapport_tronc_jambes === "jambes_longues",
    consequence:
      "Buste court + fémur long : c'est la configuration LA MOINS favorable au squat. Inclinaison du buste inévitable, "
      + "risque lombaire élevé. Interdire le squat lourd en charge libre. Réduire l'amplitude (box squat au-dessus du "
      + "parallèle) et privilégier les axes de charge centrés.",
    privilegier: ["Presse pieds hauts", "Soulevé de terre trap bar", "Squat sur box", "Presse à jambes 45° pieds hauts"],
    eviter: ["Squat barre lourd", "Soulevé de terre conventionnel lourd"],
  },
  {
    id: "tibia_long_femur_court",
    src: "C2 §5.1",
    when: (c) => c.lev.tibia === "long" && c.lev.femur === "court",
    consequence:
      "Tibia long + fémur court : squat profond naturel, dos vertical. Bonne tolérance de l'haltérophilie et du squat "
      + "barre haute — la profondeur complète est accessible sans compensation.",
    privilegier: ["Squat barre nuque (high-bar)", "Front squat", "Front squat barre"],
  },
  {
    id: "bassin_etroit",
    src: "C1 §5.6",
    when: (c) => c.lev.bassin === "etroit",
    consequence:
      "Bassin étroit (acétabulum frontal) : quadriceps d'aspect plus rectiligne et lombaires MOINS protégés. "
      + "Les charges lourdes en flexion de hanche sont plus risquées — plafonner l'intensité sur les mouvements "
      + "qui chargent le rachis et renforcer systématiquement le gainage.",
    eviter: ["Good morning lourd", "Soulevé de terre maximal"],
  },
  {
    id: "bassin_large",
    src: "C1 §5.6",
    when: (c) => c.lev.bassin === "large",
    consequence:
      "Bassin large (acétabulum latéral) : quadriceps naturellement galbé, bonne stabilité lombaire. "
      + "Le squat est bien toléré et peut porter le volume du bas du corps.",
    privilegier: ["Squat barre nuque (high-bar)", "Fentes"],
  },

  // ── PECTORAUX & HAUT DU CORPS (C2 §5.5, C1 §5.4, §5.8) ──────────────────
  {
    id: "bras_longs_cage_etroite",
    src: "C2 §5.5",
    when: (c) => (c.lev.humerus === "long" || c.lev.avant_bras === "long")
      && c.lev.cage_thoracique === "plate",
    consequence:
      "Bras longs + cage thoracique étroite : risque de déchirure du pectoral en position basse du développé couché "
      + "(étirement extrême). Plafonner l'amplitude — barre s'arrêtant 5 à 10 cm au-dessus de la poitrine, ou haltères "
      + "pour auto-réguler. Le développé légèrement incliné (15-30°) réduit la traction sur le bas du pectoral.",
    privilegier: ["Développé haltères incliné 30°", "Développé haltères plat"],
    eviter: ["Dips lestés profonds", "Développé couché barre amplitude complète lourd"],
  },
  {
    id: "avant_bras_longs_ecartes",
    src: "C1 §5.8",
    when: (c) => c.lev.avant_bras === "long",
    consequence:
      "Avant-bras longs : aux écartés avec haltères, la position basse met le tendon du biceps en tension extrême. "
      + "Réduire l'amplitude sur les écartés ou préférer les machines à coudes (pec-deck) qui verrouillent l'angle.",
    privilegier: ["Écarté poulie vis-à-vis", "Pec-deck"],
    eviter: ["Écarté haltères amplitude maximale lourd"],
  },
  {
    id: "clavicules_larges",
    src: "C6 §2.1",
    when: (c) => c.lev.clavicules === "larges",
    consequence:
      "Clavicules larges : atout esthétique majeur (V-taper naturel). Le volume d'épaules peut être modéré — "
      + "capitaliser plutôt sur la largeur du dos qui amplifie l'effet.",
  },
  {
    id: "clavicules_etroites",
    src: "C6 §2.1",
    when: (c) => c.lev.clavicules === "etroites",
    consequence:
      "Clavicules étroites : la largeur d'épaules doit être CONSTRUITE. Prioriser le deltoïde latéral avec un volume "
      + "élevé et une fréquence de 2 à 3 fois par semaine — c'est le levier esthétique le plus rentable sur ce gabarit.",
    privilegier: ["Élévations latérales haltères", "Élévation latérale unilatérale câble", "Développé haltères assis"],
  },
  {
    id: "epaules_larges_recrutement_pec",
    src: "C1 §5.8",
    when: (c) => c.lev.clavicules === "larges" && c.rep.pectoraux === "en_retard",
    consequence:
      "Épaules larges avec pectoraux en retard : les deltoïdes antérieurs prennent le relais sur les développés, "
      + "le pectoral travaille peu. Utiliser des machines à coudes ou des mouvements de recentrage pour forcer "
      + "le recrutement pectoral, et réduire la part de développé incliné haut.",
    privilegier: ["Pec-deck", "Écarté poulie vis-à-vis", "Développé haltères plat"],
  },

  // ── CHEFS MUSCULAIRES (C1 §5.9, §5.10, §5.11) ───────────────────────────
  {
    id: "biceps_insertion_haute",
    src: "C1 §5.9",
    when: (c) => c.ins.biceps === "haute",
    consequence:
      "Insertion de biceps haute : le pic est difficile à obtenir, c'est génétique et non corrigeable. "
      + "Travailler le chef long (bras EN ARRIÈRE du corps : curl incliné sur banc à 45°) donne l'illusion de longueur, "
      + "et le brachial épaissit le bras vu de profil. Ne pas promettre un pic qui ne viendra pas.",
    privilegier: ["Curl incliné haltères", "Curl marteau", "Curl incliné haltères"],
  },
  {
    id: "biceps_chef_court_deficient",
    src: "C1 §5.9",
    when: (c) => c.rep.biceps === "en_retard" || c.rep.biceps === "tres_en_retard",
    consequence:
      "Biceps en retard : distinguer les deux chefs. Manque de galbe vu de FACE = chef court déficient → curls bras "
      + "placés EN AVANT du corps (pupitre, machine). Manque de galbe vu de DOS = chef long déficient → curls bras "
      + "placés EN ARRIÈRE (incliné 45°). Alterner les deux placements dans le cycle.",
    privilegier: ["Curl pupitre haltère unilatéral", "Curl incliné haltères", "Curl pupitre prise serrée"],
  },
  {
    id: "triceps_retard",
    src: "C1 §5.11",
    when: (c) => c.rep.triceps === "en_retard" || c.rep.triceps === "tres_en_retard",
    consequence:
      "Triceps en retard : approche ROTATIVE sur le cycle. Une séance orientée chef long (bras au-dessus de la tête : "
      + "extensions nuque, extensions debout) et une séance orientée chef latéral (bras le long du corps, coudes en "
      + "arrière, corde à la poulie). Le chef long représente les deux tiers du volume du triceps.",
    privilegier: ["Extension haltère nuque assis", "Extension nuque corde poulie basse", "Barre au front"],
  },
  {
    id: "mollets_hauts",
    src: "C1 §5.7",
    when: (c) => c.ins.mollets === "haute",
    consequence:
      "Mollets hauts perchés (tendons longs) : peu de fibres accessibles, développement difficile — c'est structurel. "
      + "Miser sur l'AMPLITUDE MAXIMALE et l'étirement sous charge plutôt que sur la charge. Séries longues, "
      + "temps sous tension élevé, fréquence 3 fois par semaine.",
    privilegier: ["Extension mollets debout machine", "Extension mollets assis", "Extension mollets assis machine"],
  },
  {
    id: "mollets_bas",
    src: "C1 §5.7",
    when: (c) => c.ins.mollets === "basse",
    consequence:
      "Mollets longs (ventre musculaire descendant bas) : beaucoup de fibres accessibles, développement facile. "
      + "Volume standard et progression en charge suffisent — ne pas sur-investir.",
  },
  {
    id: "ischios_courts",
    src: "C1 §5.10",
    when: (c) => c.ins.ischios === "haute",
    consequence:
      "Ischio-jambiers courts (type sprinter) : la masse est difficile à obtenir, le galbe reste possible. "
      + "La portion interne participe à l'adduction — un super-set leg curl + machine à adducteurs développe cette "
      + "portion. Surveiller la compensation par les fessiers.",
    privilegier: ["Leg curl allongé", "Leg curl assis", "Soulevé de terre roumain"],
  },

  // ── POSTURE (C2 §5.6, C1 §3.1) ──────────────────────────────────────────
  {
    id: "cyphose",
    src: "C2 §5.6 + C7",
    when: (c) => c.pos.includes("cyphose") || c.pos.includes("antepulsion_scapulaire"),
    consequence:
      "Cyphose dorsale ou antépulsion scapulaire : la position de départ des développés est déjà défavorable et "
      + "l'espace sous-acromial réduit. Proscrire le développé nuque et les élévations latérales au-dessus de 90°. "
      + "Renforcer les rotateurs externes et les stabilisateurs scapulaires À CHAQUE séance du haut du corps, "
      + "et travailler l'extension thoracique en échauffement.",
    privilegier: ["Face pull poulie haute corde", "Rotation externe poulie basse", "Rowing barre 45°", "Y-T-W haltères banc incliné"],
    eviter: ["Développé nuque", "Élévations latérales au-dessus de 90°", "Tirage nuque"],
  },
  {
    id: "hyperlordose",
    src: "C2 §6.3",
    when: (c) => c.pos.includes("hyperlordose") || c.pos.includes("bascule_bassin"),
    consequence:
      "Hyperlordose ou bascule antérieure du bassin : les lombaires sont en tension permanente et le gainage "
      + "antérieur est insuffisant. Prioriser le gainage anti-extension (planche, dead bug, pallof press) et le "
      + "renforcement des fessiers. Éviter les mouvements qui accentuent la cambrure sous charge.",
    privilegier: ["Dead bug", "Planche avant-bras", "Pallof press", "Hip thrust"],
    eviter: ["Développé militaire debout lourd", "Good morning", "Hyperextension lombaire lestée"],
  },
  {
    id: "valgus_genou",
    src: "C10 + C2",
    when: (c) => c.pos.includes("valgus_genou"),
    consequence:
      "Valgus dynamique du genou : les abducteurs et rotateurs externes de hanche ne stabilisent pas le fémur. "
      + "Intégrer 2 à 4 séries hebdomadaires de moyen et petit fessier (clamshells, monster walks, abduction). "
      + "Contrôler la trajectoire du genou sur tous les mouvements unipodaux avant d'augmenter la charge.",
    privilegier: ["Abduction hanche poulie basse", "Monster walk élastique", "Hip thrust", "Clamshell élastique"],
    eviter: ["Fente sautée", "Squat lourd sans contrôle du valgus"],
  },
  {
    id: "asymetrie",
    src: "C1 §5.1 / C10",
    // "indetermine" n'est PAS une asymétrie : sans ce filtre, une fiche non lue
    // déclencherait la règle et affirmerait un déséquilibre jamais observé.
    when: (c) => !!c.pro.symetrie_gauche_droite
      && c.pro.symetrie_gauche_droite !== "symetrique"
      && c.pro.symetrie_gauche_droite !== "indetermine",
    consequence:
      "Asymétrie gauche/droite détectée : le côté dominant prend le relais sur les mouvements bilatéraux et l'écart "
      + "se creuse. Intégrer du travail UNILATÉRAL sur les groupes concernés, en commençant systématiquement par le "
      + "côté faible et en alignant le côté fort sur le nombre de répétitions du côté faible.",
    privilegier: ["Développé haltère unilatéral", "Rowing haltère unilatéral", "Presse unilatérale", "Fentes bulgares haltères"],
  },

  // ── ÂGE & TERRAIN (C2 §3.2, §3.3) ───────────────────────────────────────
  {
    id: "age_45_plus",
    src: "C2 §3.3",
    when: (c) => c.age >= 45,
    consequence:
      "Au-delà de 45 ans, le risque de blessure est multiplié par environ 2,5 : échauffement allongé (10-15 min), "
      + "charges plus progressives, temps de repos plus longs. Les tendons se réchauffent plus lentement que les "
      + "muscles — prévoir des séries d'approche systématiques avant toute série lourde.",
    eviter: ["Charge maximale sans montée progressive", "Pliométrie intense"],
  },
  {
    id: "age_60_plus",
    src: "C2 §3.3",
    when: (c) => c.age >= 60,
    consequence:
      "Au-delà de 60 ans : prioriser le maintien de la masse musculaire et de la puissance fonctionnelle. "
      + "Amplitudes contrôlées, machines guidées pour les mouvements lourds, travail d'équilibre et de "
      + "proprioception à chaque séance. Éviter l'échec musculaire.",
    privilegier: ["Presse à jambes 45° pieds hauts", "Tirage poulie haute prise large", "Développé machine verticale assis"],
    eviter: ["Échec musculaire", "Charges maximales en charge libre"],
  },
  {
    id: "femme_laxite",
    src: "C2 §3.2",
    when: (c) => c.sexe === "femme",
    consequence:
      "Chez la femme, la laxité articulaire varie avec le statut hormonal (phase prémenstruelle, post-partum) : "
      + "sur les périodes de laxité accrue, plafonner l'intensité autour de RPE 7 et éviter les amplitudes extrêmes "
      + "sous charge. Le programme doit rester adaptable d'une semaine à l'autre.",
  },

  // ── COMPOSITION (C1 §5.5) ────────────────────────────────────────────────
  {
    id: "torse_long",
    src: "C1 §5.5",
    when: (c) => c.pro.rapport_tronc_jambes === "tronc_long",
    consequence:
      "Torse long : les dorsaux paraissent hauts et le bas du dos est plus difficile à développer. "
      + "Intégrer du pull-over pour étirer les dorsaux vers le bas et travailler l'épaisseur en position basse.",
    privilegier: ["Pull-over haltère couché", "Rowing barre 45°", "Tirage horizontal à la corde"],
  },
  {
    id: "cage_bombee",
    src: "C1 §5.5",
    when: (c) => c.lev.cage_thoracique === "bombee",
    consequence:
      "Cage thoracique bombée : bon potentiel pectoral, mais peu de tablettes abdominales visibles. "
      + "Prioriser les lombaires et le gainage plutôt que le volume abdominal esthétique, qui rendra peu.",
  },
];

// ─── Moteur de routage ──────────────────────────────────────────────────────

/**
 * Sélectionne les adaptations applicables à CET athlète.
 * @param {{observations?: object}} fiche
 * @param {{age?: number|string, sexe?: string, pathologies?: string[]}} profil
 * @returns {{regles: Regle[], privilegier: string[], eviter: string[]}}
 */
export function selectAdaptations(fiche, profil = {}) {
  const o = fiche?.observations || {};
  /** @type {Contexte} */
  const ctx = {
    lev: o.leviers || {}, ins: o.insertions || {}, phy: o.physique || {},
    pro: o.proportions || {}, pos: Array.isArray(o.posture) ? o.posture : [],
    rep: o.repartition || {},
    age: parseInt(String(profil.age)) || 0,
    sexe: String(profil.sexe || "").toLowerCase(),
    patho: (profil.pathologies || []).filter(p => p && p !== "Aucune"),
  };

  const regles = ADAPTATIONS.filter(r => {
    try { return r.when(ctx); } catch { return false; }
  });

  const privilegier = [...new Set(regles.flatMap(r => r.privilegier || []))];
  const evitees = new Set(regles.flatMap(r => r.eviter || []).map(e => e.toLowerCase()));
  // Un exercice à la fois privilégié et évité par deux règles → on écarte :
  // la contre-indication prime toujours sur l'optimisation esthétique.
  const privFiltre = privilegier.filter(p => !evitees.has(p.toLowerCase()));

  return { regles, privilegier: privFiltre, eviter: [...new Set(regles.flatMap(r => r.eviter || []))] };
}

/**
 * Bloc prompt des adaptations individuelles. Vide si aucune règle ne s'applique
 * (fiche absente ou morphologie neutre) — on n'invente jamais de contrainte.
 * @param {{observations?: object}} fiche
 * @param {{age?: number|string, sexe?: string, pathologies?: string[]}} profil
 */
export function buildAdaptationsBlock(fiche, profil = {}) {
  const { regles, privilegier, eviter } = selectAdaptations(fiche, profil);
  if (!regles.length) return "";

  return `═══ ADAPTATIONS INDIVIDUELLES (déduites de SA morphologie et de son terrain) ═══
${regles.length} règle(s) déclenchée(s) par les traits réellement observés. Ce ne sont
pas des recommandations générales : elles s'appliquent à CET athlète et priment sur
les choix esthétiques par défaut.

${regles.map((r, i) => `${i + 1}. [${r.src}] ${r.consequence}`).join("\n\n")}

EXERCICES À PRIVILÉGIER (issus de ces règles) : ${privilegier.join(", ") || "—"}
EXERCICES À ÉVITER (issus de ces règles) : ${eviter.join(", ") || "—"}

Chaque adaptation appliquée doit apparaître dans "reflexion.lecture_morpho" ou
"reflexion.exercices_ecartes" avec sa raison. Une règle ignorée sans justification
est une erreur de conception.`;
}
