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

// Ordre de traitement : la douleur nerveuse d'abord, puis le rachis, puis les
// motifs posturaux. La respiration est fondamentale mais jamais urgente — elle
// ne passe pas devant un dos qui fait mal.
const PRIORITE = {
  sciatique: -4, decompression: -3.5,
  rachis_charges: -3,
  croise_inferieur: -2, croise_superieur: -1,
  respiration: 0, epaules_enroulees: 1, hanches_assis: 2,
  epaule_patho: 3, cervicales: 4, cheville: 5, jambes_debout: 6,
  objectif_force: 7, objectif_hypertrophie: 7, objectif_recuperation: 7,
};

/**
 * Normalise l'objectif du formulaire.
 * Renvoie null si AUCUN objectif n'est déclaré : retomber sur « hypertrophie »
 * par défaut ferait apparaître une routine que rien ne justifie. On n'invente
 * pas un besoin à partir d'une valeur manquante.
 */
function clefObjectif(objectif) {
  const k = norm(objectif);
  if (!k) return null;
  if (k.includes("force")) return "force";
  if (k.includes("poids") || k.includes("seche") || k.includes("perte")) return "perte_poids";
  if (k.includes("prep") || k.includes("physique") || k.includes("puissance")) return "prep_physique";
  if (k.includes("sante")) return "sante";
  if (k.includes("reathle")) return "reathletisation";
  return "hypertrophie";
}

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
  // ── MOBILITÉ AU SERVICE DE L'OBJECTIF ─────────────────────────────────
  // La mobilité ne sert pas qu'à corriger : elle CONDITIONNE la performance.
  // Une cheville raide empêche un squat profond, une extension thoracique
  // limitée empêche un front rack correct. Ces routines se placent AVANT la
  // séance et n'entament pas le budget quotidien.
  {
    cle: "objectif_force",
    when: (c) => c.objectif === "force" || c.objectif === "prep_physique",
    titre: "Mobilité de performance",
    cause: (c) => c.objectif === "force"
      ? "Objectif force : la mobilité conditionne directement tes charges. Une cheville "
        + "raide limite la profondeur de squat, une extension thoracique insuffisante rend "
        + "le front rack et l'arche du développé impossibles. Ce n'est pas de l'entretien, "
        + "c'est de la préparation à la performance."
      : "Objectif préparation physique : la mobilité active prépare le geste explosif. "
        + "Attention, PAS d'étirement statique long avant la séance — il réduit la production "
        + "de force pendant l'heure qui suit.",
    frequence: "Avant CHAQUE séance, 6 min. C'est de l'échauffement spécifique, pas un extra",
    moment: "avant_seance",
    minutes: 6,
    renforcer: "Sur un objectif de force, la mobilité gagnée doit être STABILISÉE : une amplitude "
      + "non contrôlée sous charge lourde est un risque, pas un progrès. Termine toujours par "
      + "du travail actif dans la nouvelle amplitude.",
    exercices: [
      { nom: "Dorsiflexion genou au mur", duree: "2 × 10 par cheville",
        comment: "Genou vers le mur sans décoller le talon. Chaque centimètre gagné, c'est de la profondeur de squat." },
      { nom: "Extension thoracique sur rouleau", duree: "2 min",
        comment: "Rouleau sous les omoplates. Indispensable au front rack et à l'arche du développé." },
      { nom: "Position 90/90 avec rotations", duree: "2 min",
        comment: "Rotation interne et externe de hanche : c'est elle qui autorise un squat large sans pincement." },
      { nom: "Squat au poids de corps", duree: "2 × 10 lents",
        comment: "Dans la nouvelle amplitude, à vide. On stabilise ce qu'on vient de gagner." },
    ],
  },
  {
    cle: "objectif_hypertrophie",
    when: (c) => c.objectif === "hypertrophie",
    titre: "Amplitude et étirement sous tension",
    cause: () => "Objectif hypertrophie : l'amplitude complète, et surtout la position d'ÉTIREMENT "
      + "sous charge, est le facteur le plus corrélé à la croissance musculaire. Une épaule ou "
      + "une hanche limitée te prive de la portion du mouvement qui construit le plus.",
    frequence: "Avant les séances, 5 min sur les groupes du jour",
    moment: "avant_seance",
    minutes: 5,
    renforcer: "L'amplitude ne sert que si tu la CHARGES : c'est la tension en position longue "
      + "qui fait le muscle, pas l'étirement passif après la séance.",
    exercices: [
      { nom: "Ouverture de poitrine au coin de mur", duree: "2 × 30 s par bras",
        comment: "Prépare l'amplitude basse des développés et des écartés, là où le pectoral travaille le plus." },
      { nom: "Étirement grand dorsal suspendu", duree: "2 × 30 s",
        comment: "Ouvre l'amplitude haute des tirages : le dorsal se construit en position étirée." },
      { nom: "Position 90/90 avec rotations", duree: "90 s",
        comment: "Amplitude de hanche pour descendre bas en squat, fente et presse." },
      { nom: "Dorsiflexion genou au mur", duree: "2 × 8 par cheville",
        comment: "Sans cheville mobile, le quadriceps ne travaille jamais en position longue." },
    ],
  },
  {
    cle: "objectif_recuperation",
    when: (c) => c.objectif === "perte_poids",
    titre: "Récupération et retour veineux",
    cause: () => "Objectif perte de graisse : le déficit calorique dégrade la récupération et la "
      + "densité des séances augmente la fatigue périphérique. La mobilité sert ici à récupérer "
      + "plus vite entre les séances, pas à gagner de l'amplitude.",
    frequence: "Le soir des jours d'entraînement, 6 min",
    moment: "soir",
    minutes: 6,
    renforcer: "En déficit, la priorité reste le maintien de la masse musculaire : cette routine "
      + "complète l'entraînement en charge, elle ne le remplace jamais.",
    exercices: [
      { nom: "Jambes au mur", duree: "3 à 5 min",
        comment: "Retour veineux, soulage les jambes après une séance dense en circuits." },
      { nom: "Expiration prolongée 4-8", duree: "10 cycles",
        comment: "Inspirer 4 s, expirer 8 s. Fait redescendre la fréquence cardiaque après une séance dense." },
      { nom: "Automassage voûte plantaire", duree: "1 min par pied",
        comment: "Balle sous le pied. Relâche toute la chaîne postérieure." },
    ],
  },

  // ── DÉCOMPRESSION VERTÉBRALE ──────────────────────────────────────────
  // Indiquée sur les discopathies : la suspension crée une traction axiale qui
  // réduit la pression intradiscale et ouvre les foramens. Effet documenté,
  // mais DEUX précautions qui changent tout :
  //   - suspension PASSIVE (on se laisse pendre), pas active ni en traction
  //     musculaire — sinon les dorsaux compriment au lieu de décomprimer ;
  //   - on REDESCEND, on ne saute pas : l'impact à la réception annule le
  //     bénéfice et peut aggraver.
  // Contre-indiquée si l'épaule est douloureuse : la suspension charge
  // l'articulation gléno-humérale en position haute.
  {
    cle: "decompression",
    when: (c) => c.patho.some(p => /hernie|discale|sciatique|sciatalgie|lombalgie|cruralgie|discopathie/.test(p))
      && !c.patho.some(p => /epaule|coiffe|conflit/.test(p)),
    titre: "Décompression vertébrale",
    cause: () => "Discopathie ou irritation radiculaire : la pression intradiscale reste élevée "
      + "toute la journée en position debout et assise. La traction axiale la réduit et libère "
      + "l'espace où passe la racine nerveuse.",
    frequence: "Tous les jours, idéalement en fin de journée quand la compression est maximale",
    moment: "soir",
    minutes: 7,
    renforcer: "La décompression SOULAGE, elle ne corrige pas. Sans gainage anti-mouvement et "
      + "fessiers solides, la compression revient dès le lendemain. C'est un traitement "
      + "symptomatique à coupler impérativement au renforcement.",
    exercices: [
      { nom: "Décompression suspendue barre fixe", duree: "3 × 20 à 30 s",
        comment: "Suspension PASSIVE : on se laisse pendre, épaules relâchées, sans tirer. Et on REDESCEND — un saut à la réception annule tout le bénéfice." },
      { nom: "Décompression genoux-poitrine", duree: "3 × 30 s",
        comment: "Allongé, ramener les genoux sans forcer. Respiration profonde, relâchement du bas du dos." },
      { nom: "Position de l'enfant allongée", duree: "2 min",
        comment: "À genoux, bras tendus devant, fessiers vers les talons. Étire la chaîne postérieure sans mettre le nerf en tension." },
      { nom: "Rotation lombaire allongée contrôlée", duree: "2 × 30 s par côté",
        comment: "Genoux fléchis qui tombent d'un côté, épaules au sol. Amplitude modérée, jamais forcée." },
      { nom: "McGill big 3 — side plank", duree: "3 × 20 s par côté",
        comment: "Le renforcement qui empêche la compression de revenir. Genoux fléchis si trop dur." },
    ],
  },

  // ── SCIATALGIE / SYNDROME DU PIRIFORME ────────────────────────────────
  // Distinction importante : une vraie sciatique discale ne s'étire PAS de la
  // même façon qu'une compression par le piriforme. Dans les deux cas, les
  // étirements agressifs en flexion aggravent. On travaille en glissement
  // nerveux (le nerf doit COULISSER, pas être mis en tension maximale).
  {
    cle: "sciatique",
    when: (c) => c.patho.some(p => /sciatique|sciatalgie|piriforme|hernie|discale|cruralgie/.test(p)),
    titre: "Sciatalgie — libération du trajet nerveux",
    cause: (c) => c.patho.some(p => /hernie|discale/.test(p))
      ? "Irritation radiculaire d'origine discale : le nerf est comprimé à sa racine. "
        + "Priorité à la décompression et à l'extension, jamais à la flexion sous charge."
      : "Compression du nerf sciatique sur son trajet, souvent au niveau du piriforme. "
        + "Le nerf doit retrouver sa capacité à coulisser dans ses interfaces.",
    frequence: "2 fois par jour en phase douloureuse, puis 1 fois en entretien",
    moment: "libre",
    minutes: 8,
    renforcer: "Gainage anti-mouvement et fessiers : un rachis instable entretient la compression. "
      + "ATTENTION : aucun étirement fort en flexion de tronc tant que la douleur descend "
      + "sous le genou. Étirer un nerf irrité l'aggrave — on le fait GLISSER, on ne le tend pas.",
    exercices: [
      { nom: "Glissement nerf sciatique (nerve flossing)", duree: "2 × 10 mouvements lents par jambe",
        comment: "Assis, jambe tendue : fléchir la nuque QUAND on tend le genou, l'étendre quand on plie. Le nerf coulisse, il n'est jamais tendu aux deux bouts." },
      { nom: "Étirement piriforme allongé", duree: "3 × 30 s par côté",
        comment: "Cheville sur le genou opposé, ramener vers la poitrine. S'arrêter AVANT toute irradiation dans la jambe." },
      { nom: "Extension lombaire en procubitus (McKenzie)", duree: "10 répétitions lentes",
        comment: "Sur le ventre, se redresser sur les avant-bras. La douleur doit REMONTER vers le bas du dos : c'est bon signe. Si elle descend, on arrête." },
      { nom: "Décompression genoux-poitrine", duree: "3 × 30 s",
        comment: "Doux, sans forcer. Relâche la tension lombaire sans mettre le nerf en tension." },
      { nom: "McGill big 3 — bird dog", duree: "2 × 8 par côté",
        comment: "Stabilité du rachis sans flexion. C'est le renforcement qui protège durablement." },
    ],
  },

  // ── RESPIRATION DIAPHRAGMATIQUE ───────────────────────────────────────
  // Cause souvent ignorée du syndrome croisé supérieur : respirer avec les
  // muscles accessoires (scalènes, trapèzes supérieurs) les maintient en
  // tension 20 000 fois par jour. Aucun étirement ne compense ça.
  {
    cle: "respiration",
    observe: (c) => c.posture.includes("cyphose") || c.posture.includes("antepulsion_scapulaire"),
    when: (c) => c.metier === "assis" || c.metier === "nuit"
      || c.posture.includes("cyphose") || c.posture.includes("antepulsion_scapulaire"),
    titre: "Respiration diaphragmatique",
    cause: (c) => c.metier === "nuit"
      ? "Horaires décalés : le système nerveux reste en alerte. La respiration lente est le levier le plus direct sur la récupération."
      : "Position assise et enroulement thoracique : la respiration se fait avec les scalènes et "
        + "les trapèzes supérieurs au lieu du diaphragme. Ces muscles restent alors contractés "
        + "toute la journée — aucun étirement ne compense 20 000 respirations mal faites.",
    frequence: "5 min par jour, idéalement le soir ou après une séance",
    moment: "soir",
    minutes: 5,
    renforcer: "Le diaphragme est un muscle : il se rééduque par la répétition, pas par l'étirement.",
    exercices: [
      { nom: "Respiration 90/90 avec ballon", duree: "5 cycles de 5 respirations",
        comment: "Allongé, hanches et genoux à 90°. Inspirer par le nez en gonflant les côtes basses, pas la poitrine." },
      { nom: "Respiration crocodile (sur le ventre)", duree: "3 min",
        comment: "Sur le ventre, front sur les mains. On sent le ventre pousser contre le sol : impossible de tricher avec la poitrine." },
      { nom: "Expiration prolongée 4-8", duree: "10 cycles",
        comment: "Inspirer 4 s, expirer 8 s. L'expiration longue active le parasympathique et fait redescendre la fréquence cardiaque." },
    ],
  },

  // ── SYNDROME CROISÉ INFÉRIEUR (Janda) ─────────────────────────────────
  // Le motif classique de la bureautique : bascule antérieure du bassin,
  // lordose accentuée. Chaîne RACCOURCIE (psoas, droit fémoral, érecteurs
  // lombaires) croisée avec une chaîne INHIBÉE (grand fessier, abdominaux
  // profonds). Étirer sans renforcer ne corrige rien : le bassin rebascule
  // dès qu'on se relève.
  {
    cle: "croise_inferieur",
    observe: (c) => c.posture.includes("hyperlordose") && c.posture.includes("bascule_bassin"),
    when: (c) => (c.posture.includes("hyperlordose") && c.posture.includes("bascule_bassin"))
      || (c.posture.includes("hyperlordose") && c.metier === "assis"),
    titre: "Syndrome croisé inférieur",
    cause: (c) => "Bascule antérieure du bassin avec lordose accentuée"
      + (c.metier === "assis" ? ", motif typique de la position assise prolongée" : "")
      + ". Psoas et érecteurs lombaires raccourcis, fessiers et abdominaux profonds inhibés : "
      + "le bas du dos travaille en permanence à la place des muscles qui devraient tenir le bassin.",
    frequence: "Tous les jours — c'est la fréquence qui corrige un motif postural, pas la durée",
    moment: "soir",
    minutes: 9,
    renforcer: "Grand fessier et abdominaux profonds : ils sont INHIBÉS, pas raides. "
      + "Les étirer aggraverait la bascule. Le travail de renforcement est la moitié du traitement, "
      + "pas un complément optionnel.",
    exercices: [
      { nom: "Étirement psoas en fente haute", duree: "3 × 40 s par jambe",
        comment: "Bassin RÉTROVERSÉ avant d'avancer — fessier serré. Sans ça on étire les lombaires, pas le psoas. C'est l'erreur la plus fréquente." },
      { nom: "Étirement droit fémoral genou fléchi", duree: "2 × 40 s par jambe",
        comment: "Talon vers la fesse, genou vers l'arrière du corps. Le droit fémoral tire aussi sur le bassin." },
      { nom: "Pont fessier au sol", duree: "3 × 15 répétitions",
        comment: "Monter en SERRANT les fessiers, jamais en cambrant. Marquer 2 s en haut." },
      { nom: "Dead bug", duree: "3 × 10 par côté",
        comment: "Lombaires plaquées au sol tout du long. Dès que ça décolle, on réduit l'amplitude." },
      { nom: "Bascule du bassin au sol", duree: "2 × 15",
        comment: "Apprendre à rétroverser volontairement : c'est le geste à retrouver debout." },
    ],
  },

  // ── SYNDROME CROISÉ SUPÉRIEUR (Janda) ─────────────────────────────────
  // Tête projetée en avant, épaules enroulées, cyphose. Chaîne RACCOURCIE
  // (trapèze supérieur, angulaire, pectoraux) croisée avec une chaîne
  // INHIBÉE (fléchisseurs profonds du cou, trapèze inférieur, dentelé).
  {
    cle: "croise_superieur",
    observe: () => true,   // exige cyphose ET antépulsion, donc toujours observé
    when: (c) => c.posture.includes("cyphose") && c.posture.includes("antepulsion_scapulaire"),
    titre: "Syndrome croisé supérieur",
    cause: () => "Cyphose et épaules enroulées combinées : trapèze supérieur, angulaire de l'omoplate "
      + "et pectoraux raccourcis, tandis que les fléchisseurs profonds du cou, le trapèze inférieur "
      + "et le dentelé antérieur sont inhibés. C'est ce motif qui dégrade la position de départ de "
      + "tous tes développés et qui referme l'espace sous-acromial.",
    frequence: "Tous les jours, plus 5 min avant chaque séance du haut du corps",
    moment: "matin",
    minutes: 9,
    renforcer: "Trapèze inférieur, dentelé antérieur et fléchisseurs profonds du cou : INHIBÉS. "
      + "Beaucoup étirent le haut du dos en pensant bien faire — c'est exactement l'inverse "
      + "qu'il faut : il est déjà trop long, il faut le muscler.",
    exercices: [
      { nom: "Ouverture de poitrine au coin de mur", duree: "3 × 30 s par bras",
        comment: "Coude à 90°, pivoter le buste. Tirer dans le pectoral, jamais dans l'épaule." },
      { nom: "Étirement trapèze supérieur", duree: "2 × 30 s par côté",
        comment: "Oreille vers l'épaule, épaule opposée basse. Ne jamais tirer fort sur la tête." },
      { nom: "Y-T-W au sol", duree: "2 × 8 par lettre",
        comment: "Renforcement du trapèze inférieur. Pouces vers le plafond, omoplates vers les poches." },
      { nom: "Serratus wall slide", duree: "3 × 10",
        comment: "Pousser en avant en fin de course pour engager le dentelé antérieur." },
      { nom: "Chin tuck (rétraction cervicale)", duree: "3 × 10, tenir 3 s",
        comment: "Reculer le menton sans baisser la tête. Réveille les fléchisseurs profonds." },
    ],
  },

  {
    cle: "epaules_enroulees",
    // `observe` distingue ce qui a été VU sur les photos de ce qui est déduit
    // du métier. Un travail de bureau rend une antépulsion probable, il ne la
    // prouve pas — et l'athlète doit savoir sur quoi repose sa routine.
    observe: (c) => c.posture.includes("antepulsion_scapulaire") || c.posture.includes("cyphose"),
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
    observe: (c) => c.posture.includes("hyperlordose") || c.posture.includes("bascule_bassin"),
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
    observe: (c) => c.posture.includes("cyphose") || c.posture.includes("antepulsion_scapulaire"),
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

// ─── Progression des exercices de renforcement ──────────────────────────────
// Un étirement se répète à l'identique : sa fonction est de restaurer une
// longueur. Un RENFORCEMENT, lui, doit progresser — sinon le muscle inhibé
// atteint un plateau et le syndrome revient dès qu'on relâche l'attention.
//
// On ne complexifie pas avant 4 semaines : le motif moteur doit être installé
// avant d'ajouter de la difficulté.
const PALIERS = {
  "Pont fessier au sol": [
    { apres: 4, nom: "Pont fessier unilatéral", duree: "3 × 10 par jambe",
      comment: "Une jambe tendue, bassin horizontal. Beaucoup plus exigeant pour le moyen fessier." },
    { apres: 9, nom: "Hip thrust lesté", duree: "3 × 12",
      comment: "Épaules sur un banc, charge sur les hanches. Le fessier travaille désormais contre résistance." },
  ],
  "Dead bug": [
    { apres: 4, nom: "Dead bug bras et jambe opposés", duree: "3 × 10 par côté",
      comment: "Bras et jambe controlatéraux simultanément. Lombaires toujours plaquées." },
    { apres: 9, nom: "Dead bug avec charge légère", duree: "3 × 8 par côté",
      comment: "Haltère léger dans la main tendue. On augmente la demande anti-extension." },
  ],
  "Y-T-W au sol": [
    { apres: 4, nom: "Y-T-W haltères banc incliné", duree: "3 × 10 par lettre",
      comment: "Charge très légère — 1 à 2 kg suffisent. La qualité prime totalement." },
    { apres: 9, nom: "Face pull poulie haute corde", duree: "3 × 15",
      comment: "Rotation externe en fin de course. Le trapèze inférieur travaille en charge." },
  ],
  "Serratus wall slide": [
    { apres: 4, nom: "Push-up plus (protraction)", duree: "3 × 12",
      comment: "En position de pompe, pousser les omoplates vers l'écartement en fin de course." },
  ],
  "Chin tuck (rétraction cervicale)": [
    { apres: 4, nom: "Chin tuck contre résistance élastique", duree: "3 × 12, tenir 3 s",
      comment: "Élastique léger derrière la tête. Les fléchisseurs profonds travaillent en charge." },
  ],
  "McGill big 3 — bird dog": [
    { apres: 4, nom: "Bird dog avec pause 5 s", duree: "3 × 6 par côté",
      comment: "Tenir 5 s en position. L'endurance posturale compte plus que le nombre." },
  ],
};

/**
 * Fait progresser les exercices de renforcement selon l'ancienneté du travail.
 * @param {{nom: string, duree: string, comment?: string}[]} exercices
 * @param {number} semaines nombre de semaines depuis le début du travail
 */
function progresser(exercices, semaines) {
  const s = Math.max(0, Number(semaines) || 0);
  return exercices.map(e => {
    const paliers = PALIERS[e.nom];
    if (!paliers) return e;
    // On prend le palier le plus avancé atteint.
    const p = [...paliers].reverse().find(x => s >= x.apres);
    return p ? { ...p, remplace: e.nom } : e;
  });
}

/**
 * Routines de mobilité applicables à CET athlète.
 *
 * @param {{observations?: object}} fiche  fiche morphologique
 * @param {{metier?: string, pathologies?: string[]}} profil
 * @returns {{routines: Routine[], minutesJour: number, resume: string}}
 */
export function getRoutinesMobilite(fiche, profil = {}, opts = {}) {
  const o = fiche?.observations || {};
  const ctx = {
    posture: Array.isArray(o.posture) ? o.posture : [],
    metier: contrainteMetier(profil.metier),
    patho: (profil.pathologies || []).filter(p => p && p !== "Aucune").map(norm),
    objectif: clefObjectif(profil.objectif),
  };

  let declenchees = ROUTINES.filter(r => {
    try { return r.when(ctx); } catch { return false; }
  });

  // Un syndrome croisé englobe les routines partielles correspondantes.
  // Les cumuler donnerait 25 min/jour avec des exercices en double.
  const cles = new Set(declenchees.map(r => r.cle));
  if (cles.has("sciatique")) declenchees = declenchees.filter(r => r.cle !== "rachis_charges");
  if (cles.has("croise_inferieur")) declenchees = declenchees.filter(r => r.cle !== "hanches_assis");
  if (cles.has("croise_superieur"))
    declenchees = declenchees.filter(r => r.cle !== "epaules_enroulees" && r.cle !== "cervicales");

  let routines = declenchees
    .map(r => ({
      cle: r.cle, titre: r.titre,
      cause: typeof r.cause === "function" ? r.cause(ctx) : r.cause,
      frequence: r.frequence, moment: r.moment, minutes: r.minutes,
      exercices: progresser(r.exercices, opts.semaines), renforcer: r.renforcer || null,
      // true = constaté sur les photos ; false = déduit du métier ou d'une pathologie.
      observe: typeof r.observe === "function" ? !!r.observe(ctx) : true,
    }));

  if (!routines.length) {
    return {
      routines: [], toutes: [], minutesJour: 0,
      resume: "Aucune contrainte posturale identifiée. Une mobilité générale de 5 minutes après chaque séance suffit.",
    };
  }

  // PLAFOND QUOTIDIEN : 20 minutes hors séance. Au-delà, la routine est
  // abandonnée au bout de trois jours — et une routine abandonnée ne vaut rien.
  // On garde les priorités les plus hautes et on écarte le reste plutôt que de
  // proposer un programme que personne ne tiendra.
  const MAX_JOUR = 20;
  // Trier par priorité AVANT de couper : sans ça, la respiration (5 min)
  // passait devant un syndrome croisé (9 min) simplement parce qu'elle
  // tenait dans le budget restant.
  const quotidiennes = routines
    .filter(r => r.moment !== "avant_seance")
    .sort((a, b) => (PRIORITE[a.cle] ?? 9) - (PRIORITE[b.cle] ?? 9));
  let cumul = 0;
  const gardees = new Set();
  for (const r of quotidiennes) {
    if (cumul + r.minutes > MAX_JOUR) continue;
    cumul += r.minutes;
    gardees.add(r.cle);
  }
  // `toutes` conserve TOUT ce qui a été déclenché : la séance de mobilité est
  // hebdomadaire, elle ne doit pas être amputée par le budget QUOTIDIEN.
  const toutes = routines;
  routines = routines.filter(r => r.moment === "avant_seance" || gardees.has(r.cle));
  const minutesJour = cumul;

  return {
    routines, toutes, minutesJour,
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
// Ordre de traitement : la douleur nerveuse d'abord, puis le rachis, puis les
// motifs posturaux. La respiration est fondamentale mais jamais urgente — elle
// ne passe pas devant un dos qui fait mal.


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
  const { toutes } = getRoutinesMobilite(fiche, profil, { semaines: opts.semaines });
  const routines = toutes;
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

  // PLAFOND 15 MINUTES. Au-delà, la séance est skippée — autant ne pas la
  // proposer. On compte ~2 min par exercice, donc 7 exercices maximum, et on
  // prend les plus structurants de chaque zone par ordre de priorité.
  const MAX_MIN = 15;
  const MAX_EXOS = Math.floor(MAX_MIN / 2);
  const exercices = [];
  // Premier passage : 1 exercice par zone, pour que toutes soient couvertes.
  for (const r of triees) {
    if (exercices.length >= MAX_EXOS) break;
    if (r.exercices[0]) exercices.push({ ...r.exercices[0], zone: r.titre });
  }
  // Second passage : on complète avec le 2e exercice des zones prioritaires.
  for (const r of triees) {
    if (exercices.length >= MAX_EXOS) break;
    if (r.exercices[1]) exercices.push({ ...r.exercices[1], zone: r.titre });
  }

  const minutes = Math.min(MAX_MIN, Math.max(8, exercices.length * 2));
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
