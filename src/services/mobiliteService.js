// ─── MOBILITÉ & ÉTIREMENTS QUOTIDIENS ───────────────────────────────────────
// Une routine INDIVIDUELLE, dérivée de ce qu'on sait réellement de l'athlète :
// sa posture lue sur les photos, son métier, ses pathologies déclarées.
//
// La logique de coach appliquée ici :
// - un déséquilibre postural se corrige par de la FRÉQUENCE, pas par du volume.
//   Cinq minutes tous les matins battent trente minutes le dimanche ;
// - on étire ce qui est RACCOURCI et on renforce ce qui est ALLONGÉ. Étirer un
//   muscle déjà trop long aggrave le problème — c'est l'erreur classique sur
//   les épaules enroulées, où l'on étire les pectoraux ET les rhomboïdes ;
// - la durée dépend de l'intention : mobilité active avant la séance (mouvement,
//   pas de tenue longue), étirement long le soir ou à distance de l'effort.
//
// Aucun appel IA : ce sont des règles, elles doivent être disponibles hors ligne.

/**
 * @typedef {Object} Exercice
 * @property {string} nom
 * @property {string} duree
 * @property {string} comment
 */

/**
 * @typedef {Object} Routine
 * @property {string} cle
 * @property {string} titre
 * @property {string} cause        pourquoi CET athlète en a besoin
 * @property {string} frequence
 * @property {"matin"|"soir"|"avant_seance"|"libre"} moment
 * @property {number} minutes
 * @property {Exercice[]} exercices
 * @property {string} [renforcer]  ce qu'il faut muscler en parallèle
 */

const norm = (s) => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

/** Le métier déclaré crée-t-il une contrainte posturale identifiable ? */
function contrainteMetier(metier) {
  const m = norm(metier);
  if (!m) return null;
  if (/bureau|assis|informatique|developpeur|comptab|secretar|administratif|teletravail/.test(m))
    return "assis";
  if (/manutention|charge|demenag|batiment|macon|logistique|caris/.test(m))
    return "charges";
  if (/debout|caiss|vendeu|serveu|coiffeu|infirmi|cuisin|restaur/.test(m))
    return "debout";
  if (/nuit|poste|3x8|garde/.test(m))
    return "nuit";
  return null;
}

/** Catalogue des routines, chacune avec sa condition de déclenchement. */
const ROUTINES = [
  {
    cle: "epaules_enroulees",
    when: (c) => c.posture.includes("antepulsion_scapulaire") || c.posture.includes("cyphose")
      || c.metier === "assis",
    titre: "Ouverture thoracique et épaules",
    cause: (c) => c.metier === "assis"
      ? "Position assise prolongée : pectoraux et fléchisseurs de hanche raccourcis, haut du dos affaibli."
      : "Enroulement des épaules détecté sur tes photos : la position de départ de tous tes développés en pâtit.",
    frequence: "Tous les matins, plus 5 min avant chaque séance du haut du corps",
    moment: "matin",
    minutes: 6,
    renforcer: "Rhomboïdes et trapèzes moyens — ils sont ALLONGÉS, donc à renforcer, surtout pas à étirer.",
    exercices: [
      { nom: "Ouverture de poitrine au coin de mur", duree: "3 × 30 s par bras",
        comment: "Coude à 90°, avant-bras au mur, pivoter le buste. Tirer dans le pectoral, jamais dans l'épaule." },
      { nom: "Extension thoracique sur rouleau", duree: "2 min",
        comment: "Rouleau sous les omoplates, mains derrière la nuque, ouvrir vers l'arrière sans cambrer les lombaires." },
      { nom: "Wall slides (glissements muraux)", duree: "2 × 10 répétitions",
        comment: "Dos et avant-bras au mur, monter les bras en gardant le contact. Mobilité active, pas d'étirement tenu." },
      { nom: "Rétraction scapulaire isométrique", duree: "3 × 20 s",
        comment: "Serrer les omoplates sans hausser les épaules. C'est du renforcement, il doit y avoir de la tension." },
    ],
  },
  {
    cle: "hanches_assis",
    when: (c) => c.metier === "assis" || c.posture.includes("hyperlordose")
      || c.posture.includes("bascule_bassin"),
    titre: "Ouverture des hanches",
    cause: (c) => c.metier === "assis"
      ? "Huit heures assis raccourcissent le psoas : le bassin bascule vers l'avant et les lombaires compensent."
      : "Bascule antérieure du bassin : les fléchisseurs de hanche tirent la colonne en avant.",
    frequence: "Tous les soirs, et systématiquement avant les séances de jambes",
    moment: "soir",
    minutes: 7,
    renforcer: "Fessiers et gainage antérieur — ce sont eux qui remettent le bassin en place.",
    exercices: [
      { nom: "Étirement psoas en fente haute", duree: "3 × 40 s par jambe",
        comment: "Bassin rétroversé (fessier serré) AVANT d'avancer. Sans ça on étire les lombaires, pas le psoas." },
      { nom: "Position 90/90 avec rotations", duree: "2 min",
        comment: "Assis, jambes à 90°, basculer d'un côté à l'autre. Mobilité en rotation interne et externe." },
      { nom: "Étirement piriforme allongé", duree: "2 × 30 s par côté",
        comment: "Cheville sur le genou opposé, ramener vers soi. Soulage aussi les sciatalgies légères." },
      { nom: "Pont fessier au sol", duree: "2 × 15 répétitions",
        comment: "Monter en serrant les fessiers, pas en cambrant. Renforcement, l'autre moitié du travail." },
    ],
  },
  {
    cle: "rachis_charges",
    when: (c) => c.metier === "charges" || c.patho.some(p => /lombalgie|hernie|discale|sciatique|dos/.test(p)),
    titre: "Décompression et gainage du rachis",
    cause: () => "Charge lombaire cumulée : la colonne encaisse déjà avant même la séance.",
    frequence: "Tous les jours, matin et fin de journée",
    moment: "libre",
    minutes: 8,
    renforcer: "Gainage anti-mouvement (planche, dead bug, pallof) plutôt que crunchs.",
    exercices: [
      { nom: "Décompression genoux-poitrine", duree: "3 × 30 s",
        comment: "Allongé, ramener les genoux doucement. Respirer profondément, relâcher le bas du dos." },
      { nom: "Cat-cow (chat-chameau)", duree: "10 cycles lents",
        comment: "Mobiliser segment par segment, sans forcer les amplitudes extrêmes." },
      { nom: "McGill big 3 — bird dog", duree: "2 × 8 par côté",
        comment: "Bras et jambe opposés, bassin stable. La qualité prime totalement sur le nombre." },
      { nom: "Dead bug", duree: "2 × 10 par côté",
        comment: "Lombaires PLAQUÉES au sol pendant tout le mouvement. Dès que ça décolle, on réduit l'amplitude." },
    ],
  },
  {
    cle: "jambes_debout",
    when: (c) => c.metier === "debout",
    titre: "Récupération des jambes",
    cause: () => "Station debout prolongée : mollets et chaîne postérieure sollicités toute la journée.",
    frequence: "Tous les soirs",
    moment: "soir",
    minutes: 6,
    exercices: [
      { nom: "Étirement mollets au mur", duree: "3 × 40 s par jambe",
        comment: "Genou tendu pour le gastrocnémien, puis légèrement fléchi pour le soléaire. Les deux comptent." },
      { nom: "Jambes au mur", duree: "3 à 5 min",
        comment: "Allongé, jambes à la verticale contre le mur. Favorise le retour veineux." },
      { nom: "Étirement ischio-jambiers avec sangle", duree: "2 × 40 s par jambe",
        comment: "Genou légèrement fléchi pour protéger le nerf sciatique." },
      { nom: "Automassage voûte plantaire", duree: "1 min par pied",
        comment: "Balle sous le pied. Soulage aussi les tensions de la chaîne postérieure." },
    ],
  },
  {
    cle: "epaule_patho",
    when: (c) => c.patho.some(p => /epaule|coiffe|conflit/.test(p)),
    titre: "Entretien de l'épaule",
    cause: () => "Épaule sensible déclarée : l'espace sous-acromial doit rester libre et les rotateurs actifs.",
    frequence: "Tous les jours, et avant CHAQUE séance du haut du corps",
    moment: "avant_seance",
    minutes: 6,
    renforcer: "Rotateurs externes et dentelé antérieur, en charge légère et haute fréquence.",
    exercices: [
      { nom: "Pendulaire de Codman", duree: "1 min par bras",
        comment: "Buste penché, bras relâché, petits cercles. Décoapte l'articulation sans effort." },
      { nom: "Rotation externe élastique coude au corps", duree: "2 × 15 par bras",
        comment: "Coude collé au corps, résistance LÉGÈRE. C'est de l'activation, pas de la musculation." },
      { nom: "Sleeper stretch", duree: "2 × 30 s par bras",
        comment: "Sur le côté, bras à 90°, pousser doucement l'avant-bras vers le sol. S'arrêter avant la douleur." },
      { nom: "Serratus wall slide", duree: "2 × 10",
        comment: "Avant-bras au mur, pousser en avant en fin de course pour engager le dentelé." },
    ],
  },
  {
    cle: "cheville",
    when: (c) => c.patho.some(p => /cheville|achille|entorse|plantaire/.test(p))
      || c.posture.includes("valgus_genou"),
    titre: "Mobilité de cheville",
    cause: (c) => c.posture.includes("valgus_genou")
      ? "Valgus dynamique : une cheville raide fait rentrer le genou en flexion."
      : "Cheville sensible déclarée : la mobilité en dorsiflexion conditionne tout le bas du corps.",
    frequence: "Tous les jours, et avant chaque séance de jambes",
    moment: "avant_seance",
    minutes: 5,
    exercices: [
      { nom: "Dorsiflexion genou au mur", duree: "3 × 10 par cheville",
        comment: "Genou vers le mur sans décoller le talon. Reculer le pied jusqu'à la limite." },
      { nom: "Proprioception unipodale", duree: "3 × 30 s par pied",
        comment: "Debout sur un pied, yeux ouverts puis fermés. Le pied doit travailler, pas le bassin." },
      { nom: "Éversion et inversion élastique", duree: "2 × 15 par sens",
        comment: "Renforce les stabilisateurs latéraux, essentiels après une entorse." },
    ],
  },
  {
    cle: "cervicales",
    when: (c) => c.metier === "assis" || c.patho.some(p => /cervical|nuque/.test(p)),
    titre: "Nuque et cervicales",
    cause: () => "Tête projetée en avant devant un écran : les cervicales supportent plusieurs kilos de plus.",
    frequence: "Deux fois par jour, dont une pause en milieu de journée",
    moment: "libre",
    minutes: 4,
    renforcer: "Fléchisseurs profonds du cou (chin tuck) — ils sont inhibés, pas raides.",
    exercices: [
      { nom: "Chin tuck (rétraction cervicale)", duree: "3 × 10",
        comment: "Reculer le menton sans baisser la tête, comme pour faire un double menton. Tenir 3 s." },
      { nom: "Étirement angulaire de l'omoplate", duree: "2 × 30 s par côté",
        comment: "Regarder vers l'aisselle opposée, main opposée qui accompagne légèrement." },
      { nom: "Étirement trapèze supérieur", duree: "2 × 30 s par côté",
        comment: "Oreille vers l'épaule, épaule opposée basse. Ne jamais tirer fort sur la tête." },
    ],
  },
];

/**
 * Routines de mobilité applicables à CET athlète.
 *
 * @param {{observations?: object}} fiche  fiche morphologique
 * @param {{metier?: string, pathologies?: string[]}} profil
 * @returns {{routines: Routine[], minutesJour: number, resume: string}}
 */
export function getRoutinesMobilite(fiche, profil = {}) {
  const o = fiche?.observations || {};
  const ctx = {
    posture: Array.isArray(o.posture) ? o.posture : [],
    metier: contrainteMetier(profil.metier),
    patho: (profil.pathologies || []).filter(p => p && p !== "Aucune").map(norm),
  };

  const routines = ROUTINES
    .filter(r => { try { return r.when(ctx); } catch { return false; } })
    .map(r => ({
      cle: r.cle, titre: r.titre,
      cause: typeof r.cause === "function" ? r.cause(ctx) : r.cause,
      frequence: r.frequence, moment: r.moment, minutes: r.minutes,
      exercices: r.exercices, renforcer: r.renforcer || null,
    }));

  if (!routines.length) {
    return {
      routines: [], minutesJour: 0,
      resume: "Aucune contrainte posturale identifiée. Une mobilité générale de 5 minutes après chaque séance suffit.",
    };
  }

  // Le quotidien ne peut pas absorber trois routines de 8 minutes : on annonce
  // le total honnêtement plutôt que de laisser l'athlète découvrir la charge.
  const minutesJour = routines
    .filter(r => r.moment !== "avant_seance")
    .reduce((s, r) => s + r.minutes, 0);

  return {
    routines, minutesJour,
    resume: `${routines.length} routine${routines.length > 1 ? "s" : ""} ciblée${routines.length > 1 ? "s" : ""} `
      + `sur ce qui te concerne réellement — environ ${minutesJour} min par jour hors séance.`,
  };
}

/** Routines à faire AVANT une séance donnée, selon les groupes travaillés. */
export function getMobiliteAvantSeance(fiche, profil, focus = "") {
  const { routines } = getRoutinesMobilite(fiche, profil);
  const f = norm(focus);
  const hautDuCorps = /pec|dos|epaule|bras|haut|push|pull|upper/.test(f);
  const basDuCorps = /jambe|quadri|ischio|fessier|mollet|legs|lower/.test(f);

  return routines.filter(r => {
    if (r.moment === "avant_seance") {
      if (r.cle === "epaule_patho") return hautDuCorps || !f;
      if (r.cle === "cheville") return basDuCorps || !f;
      return true;
    }
    if (r.cle === "epaules_enroulees") return hautDuCorps;
    if (r.cle === "hanches_assis") return basDuCorps;
    return false;
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// SÉANCE DE MOBILITÉ
// ═══════════════════════════════════════════════════════════════════════════
// Différente des routines quotidiennes : c'est une séance STRUCTURÉE, à poser
// dans la semaine comme n'importe quelle autre.
//
// Deux cas, et un seul principe : on ne fabrique pas un problème pour avoir
// quelque chose à proposer.
//   - posture dégradée détectée → séance CORRECTIVE ciblée sur ce qui est réel ;
//   - rien à corriger → étirements classiques, 10 minutes maximum. Pas plus.

/** Étirements généraux — le repli quand aucune correction n'est nécessaire. */
const ETIREMENTS_CLASSIQUES = [
  { nom: "Étirement pectoraux au mur",        duree: "2 × 30 s par bras" },
  { nom: "Étirement grand dorsal suspendu",   duree: "2 × 30 s" },
  { nom: "Étirement quadriceps debout",       duree: "2 × 30 s par jambe" },
  { nom: "Étirement ischio-jambiers assis",   duree: "2 × 30 s par jambe" },
  { nom: "Étirement fessiers allongé",        duree: "2 × 30 s par côté" },
  { nom: "Étirement mollets au mur",          duree: "2 × 30 s par jambe" },
];

/** Priorité d'une routine dans la séance corrective : le rachis d'abord. */
const PRIORITE = {
  rachis_charges: 0, epaules_enroulees: 1, hanches_assis: 2,
  epaule_patho: 3, cervicales: 4, cheville: 5, jambes_debout: 6,
};

/**
 * Séance de mobilité à intégrer à la semaine.
 *
 * @param {{observations?: object}} fiche
 * @param {{metier?: string, pathologies?: string[]}} profil
 * @param {{joursEntrainement?: number}} [opts]
 * @returns {{type: "corrective"|"classique", titre: string, sousTitre: string,
 *            minutes: number, frequence: string, zones: string[],
 *            exercices: {nom: string, duree: string, comment?: string, zone?: string}[],
 *            note: string}}
 */
export function getSeanceMobilite(fiche, profil = {}, opts = {}) {
  const { routines } = getRoutinesMobilite(fiche, profil);
  const jours = Number(opts.joursEntrainement) || 3;

  // ── Aucun défaut postural : étirements classiques, et on s'arrête là ──
  if (!routines.length) {
    return {
      type: "classique",
      titre: "Étirements généraux",
      sousTitre: "Aucun déséquilibre postural détecté",
      minutes: 10,
      frequence: "1 à 2 fois par semaine, à distance des séances",
      zones: [],
      exercices: ETIREMENTS_CLASSIQUES,
      note: "Ton analyse ne montre pas de posture à corriger. Cette séance sert l'entretien, "
        + "pas la correction : 10 minutes suffisent, inutile d'en faire plus.",
    };
  }

  // ── Séance corrective : on prend les exercices des routines déclenchées ──
  const triees = [...routines].sort(
    (a, b) => (PRIORITE[a.cle] ?? 9) - (PRIORITE[b.cle] ?? 9)
  );

  // Deux exercices par zone au maximum : une séance de mobilité qui dure
  // 40 minutes ne sera jamais faite. On garde les plus structurants.
  const exercices = [];
  for (const r of triees) {
    r.exercices.slice(0, 2).forEach(e =>
      exercices.push({ ...e, zone: r.titre }));
    if (exercices.length >= 8) break;
  }

  const minutes = Math.min(25, Math.max(12, exercices.length * 2));
  const frequence = triees.length >= 3
    ? "2 fois par semaine, en plus des routines quotidiennes"
    : "1 à 2 fois par semaine";

  const renforcer = triees.map(r => r.renforcer).filter(Boolean);

  return {
    type: "corrective",
    titre: "Séance correctrice de posture",
    sousTitre: triees.map(r => r.titre).join(" · "),
    minutes,
    frequence,
    zones: triees.map(r => r.titre),
    exercices,
    note: renforcer.length
      ? renforcer[0]
      : "Travail ciblé sur les déséquilibres relevés lors de ton analyse morphologique.",
  };
}

/**
 * Faut-il intercaler la séance de mobilité dans la semaine ?
 * @param {number} joursEntrainement
 * @param {"corrective"|"classique"} type
 */
export function placementSeanceMobilite(joursEntrainement, type) {
  if (type === "classique") {
    return "À caler sur un jour de repos, ou après une séance légère.";
  }
  return joursEntrainement >= 5
    ? "Ta semaine est déjà chargée : place-la après ta séance la plus courte, pas sur un jour de repos complet."
    : "À caler sur un jour de repos — c'est là qu'elle sera le mieux absorbée.";
}
