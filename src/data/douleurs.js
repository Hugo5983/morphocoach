// ─── DOULEURS — COPIE CLIENT ────────────────────────────────────────────────
// Copie de api/_knowledge/douleurs.js — ne pas éditer à la main.
// Régénérer : node scripts/gen-douleurs.mjs
//
// Une seule source de vérité : les zones, localisations et mouvements proposés
// à l'utilisateur DOIVENT être exactement ceux que le serveur sait interpréter.

// ─── LECTURE DES DOULEURS ───────────────────────────────────────────────────
// PROBLÈME RÉSOLU ICI : le formulaire demandait « Conflit épaule », « Ménisque »,
// « Épicondylite » — des DIAGNOSTICS que personne ne connaît sans être passé
// chez un médecin. Résultat : la case restait vide et l'IA générait un
// programme aveugle pour quelqu'un qui a mal.
//
// Un coach ne demande jamais un diagnostic. Il demande :
//   1. OÙ exactement (la zone seule ne suffit pas : avant, côté, arrière)
//   2. SUR QUEL MOUVEMENT ça se déclenche  ← l'information la plus précieuse
//   3. QUAND (pendant l'effort, après, au repos, au réveil)
//
// À partir de là on déduit un MÉCANISME PROBABLE — jamais un diagnostic — et
// surtout les exercices à écarter. C'est tout ce dont l'IA a besoin.
//
// GARDE-FOU : certaines réponses sont des drapeaux rouges. Dans ce cas on ne
// programme pas « autour » de la douleur, on oriente vers un professionnel.

/** Zones proposées, avec leurs localisations et mouvements déclencheurs. */
export const QUESTIONNAIRE = {
  epaule: {
    label: "Épaule",
    localisations: [
      { cle: "anterieure", label: "Devant l'épaule" },
      { cle: "laterale",   label: "Sur le côté / dessus" },
      { cle: "posterieure",label: "Derrière l'épaule" },
      { cle: "diffuse",    label: "Difficile à localiser" },
    ],
    mouvements: [
      { cle: "pousser_haut",  label: "Pousser au-dessus de la tête" },
      { cle: "pousser_devant",label: "Développé couché / pompes" },
      { cle: "elever_cote",   label: "Lever le bras sur le côté" },
      { cle: "tirer",         label: "Tractions / tirages" },
      { cle: "arriere",       label: "Bras en arrière (dips, écartés profonds)" },
      { cle: "rotation",      label: "Rotations, mains derrière le dos" },
    ],
  },
  genou: {
    label: "Genou",
    localisations: [
      { cle: "anterieure",  label: "Devant / autour de la rotule" },
      { cle: "interne",     label: "Face interne" },
      { cle: "externe",     label: "Face externe" },
      { cle: "posterieure", label: "Derrière le genou" },
    ],
    mouvements: [
      { cle: "squat_profond", label: "Squat profond / s'accroupir" },
      { cle: "descente",      label: "Descendre les escaliers" },
      { cle: "extension",     label: "Leg extension / tendre la jambe" },
      { cle: "rotation",      label: "Pivoter, changer de direction" },
      { cle: "impact",        label: "Courir, sauter" },
      { cle: "assis_long",    label: "Rester assis longtemps" },
    ],
  },
  dos: {
    label: "Bas du dos",
    localisations: [
      { cle: "centre",   label: "Au centre, sur la colonne" },
      { cle: "cote",     label: "D'un côté, dans les muscles" },
      { cle: "fessier",  label: "Vers la fesse" },
      { cle: "descend",  label: "Descend dans la jambe" },
    ],
    mouvements: [
      { cle: "flexion",     label: "Se pencher en avant" },
      { cle: "extension",   label: "Se cambrer / s'étirer en arrière" },
      { cle: "rotation",    label: "Se tourner" },
      { cle: "charge",      label: "Soulever du sol" },
      { cle: "assis_long",  label: "Rester assis longtemps" },
      { cle: "debout_long", label: "Rester debout longtemps" },
    ],
  },
  coude: {
    label: "Coude / poignet",
    localisations: [
      { cle: "externe", label: "Face externe du coude" },
      { cle: "interne", label: "Face interne du coude" },
      { cle: "poignet", label: "Poignet" },
    ],
    mouvements: [
      { cle: "prise",     label: "Serrer, tenir une charge" },
      { cle: "curl",      label: "Curl, flexion du coude" },
      { cle: "extension", label: "Extensions triceps, dips" },
      { cle: "appui",     label: "Appui mains au sol" },
    ],
  },
  hanche: {
    label: "Hanche",
    localisations: [
      { cle: "pli",      label: "Dans le pli de l'aine" },
      { cle: "laterale", label: "Sur le côté" },
      { cle: "fessier",  label: "Dans la fesse" },
    ],
    mouvements: [
      { cle: "flexion_profonde", label: "Remonter le genou haut / squat profond" },
      { cle: "ecart",            label: "Écarter la jambe" },
      { cle: "marche",           label: "Marcher, monter les escaliers" },
      { cle: "assis_long",       label: "Rester assis longtemps" },
    ],
  },
};

/** Quand ça fait mal — sert surtout à repérer les drapeaux rouges. */
export const MOMENTS = [
  { cle: "pendant",  label: "Pendant l'effort seulement" },
  { cle: "apres",    label: "Après l'effort, le lendemain" },
  { cle: "debut",    label: "En début de séance, ça s'échauffe ensuite" },
  { cle: "repos",    label: "Même au repos, sans effort" },
  { cle: "nuit",     label: "La nuit, ça me réveille" },
  { cle: "reveil",   label: "Raideur au réveil, ça se déverrouille" },
];

/**
 * Drapeaux rouges : signes qui sortent du champ de l'entraînement.
 * On ne programme pas « autour » de ça — on oriente.
 */
const DRAPEAUX = [
  { quand: (d) => d.moment === "nuit",
    texte: "Une douleur qui réveille la nuit n'est pas une douleur mécanique d'entraînement." },
  { quand: (d) => d.moment === "repos",
    texte: "Une douleur présente au repos, sans effort, demande un avis médical avant de reprendre." },
  { quand: (d) => d.zone === "dos" && d.localisation === "descend",
    texte: "Une douleur qui descend dans la jambe évoque une atteinte nerveuse : un avis est nécessaire." },
  { quand: (d) => d.perteForce === true,
    texte: "Une perte de force associée à la douleur doit être évaluée par un professionnel." },
  { quand: (d) => d.gonflement === true,
    texte: "Un gonflement articulaire n'est pas de la fatigue : il demande un examen." },
];

/**
 * Mécanismes probables. `when` teste zone + localisation + mouvement.
 * Le champ `mecanisme` est une HYPOTHÈSE de travail pour orienter le
 * programme — jamais un diagnostic, et le texte le dit.
 */
const LECTURES = [
  // ── ÉPAULE ──────────────────────────────────────────────────────────────
  {
    cle: "epaule_conflit_anterieur",
    when: (d) => d.zone === "epaule" && ["anterieure", "laterale"].includes(d.localisation)
      && ["pousser_haut", "elever_cote"].includes(d.mouvement),
    mecanisme: "Douleur à l'élévation, en avant ou sur le côté de l'épaule : le motif est "
      + "compatible avec un conflit dans l'espace sous-acromial, c'est-à-dire un manque de "
      + "place pour les tendons quand le bras monte.",
    eviter: ["Développé nuque", "Élévations latérales au-dessus de 90°", "Tirage nuque",
             "Développé militaire barre debout", "Élévations frontales lourdes"],
    privilegier: ["Développé haltères prise neutre", "Face pull poulie haute corde",
                  "Rotation externe poulie basse", "Y-T-W haltères banc incliné"],
    consigne: "Limiter toute élévation à 90°, prise neutre sur les développés, et rotateurs "
      + "externes à chaque séance du haut du corps.",
  },
  {
    cle: "epaule_biceps_anterieur",
    when: (d) => d.zone === "epaule" && d.localisation === "anterieure"
      && ["pousser_devant", "arriere"].includes(d.mouvement),
    mecanisme: "Douleur en avant de l'épaule sur les mouvements de poussée et en position "
      + "d'étirement : le motif oriente vers la portion antérieure — tendon du long biceps "
      + "ou capsule antérieure — sollicitée en fin d'amplitude.",
    eviter: ["Dips lestés profonds", "Développé couché barre amplitude complète lourd",
             "Écarté haltères amplitude maximale lourd", "Pull-over barre"],
    privilegier: ["Développé haltères incliné 30°", "Pec-deck", "Écarté poulie vis-à-vis",
                  "Machine convergente pectoraux"],
    consigne: "Plafonner l'amplitude basse : barre s'arrêtant 5 à 10 cm au-dessus de la "
      + "poitrine, ou haltères pour auto-réguler. Pas de dips profonds.",
  },
  {
    cle: "epaule_posterieure",
    when: (d) => d.zone === "epaule" && d.localisation === "posterieure",
    mecanisme: "Douleur à l'arrière de l'épaule : souvent une surcharge des rotateurs externes "
      + "ou une raideur de la capsule postérieure, fréquente quand le volume de poussée dépasse "
      + "largement le volume de tirage.",
    eviter: ["Développé nuque", "Tirage nuque"],
    privilegier: ["Sleeper stretch", "Rotation externe poulie basse", "Face pull poulie haute corde",
                  "Rowing barre 45°"],
    consigne: "Rééquilibrer le ratio poussée/tirage — viser au moins autant de tirage que de "
      + "poussée sur le cycle — et étirer la capsule postérieure.",
  },
  {
    cle: "epaule_tirage",
    when: (d) => d.zone === "epaule" && d.mouvement === "tirer",
    mecanisme: "Douleur d'épaule sur les tirages : souvent une prise trop large ou une descente "
      + "en amplitude complète bras tendus, qui met la coiffe en tension défavorable.",
    eviter: ["Tirage nuque", "Traction prise très large"],
    privilegier: ["Tirage poulie haute prise large", "Rowing haltère unilatéral",
                  "Tirage horizontal à la corde"],
    consigne: "Prise neutre ou semi-supination, amplitude sans relâchement complet en bas.",
  },

  // ── GENOU ───────────────────────────────────────────────────────────────
  {
    cle: "genou_femoro_patellaire",
    when: (d) => d.zone === "genou" && d.localisation === "anterieure"
      && ["squat_profond", "descente", "extension", "assis_long"].includes(d.mouvement),
    mecanisme: "Douleur devant le genou, majorée en descente d'escalier, en squat profond ou "
      + "après une position assise prolongée : le motif est celui d'une surcharge de "
      + "l'articulation entre la rotule et le fémur.",
    eviter: ["Leg extension amplitude complète lourd", "Squat profond lourd",
             "Fente sautée", "Sissy squat", "Hack squat profond"],
    privilegier: ["Presse à jambes 45° pieds hauts", "Spanish squat élastique",
                  "Isométrie mur 60° (tendinopathie rotulienne)", "Soulevé de terre roumain",
                  "Abduction hanche poulie basse"],
    consigne: "Amplitude limitée à 60-90° de flexion au départ, isométrie en priorité, et "
      + "renforcement du moyen fessier — un genou qui rentre en dedans surcharge la rotule.",
  },
  {
    cle: "genou_rotation",
    when: (d) => d.zone === "genou" && ["interne", "externe"].includes(d.localisation)
      && ["rotation", "squat_profond"].includes(d.mouvement),
    mecanisme: "Douleur sur le côté du genou déclenchée par la rotation ou l'accroupissement "
      + "profond : ce motif concerne les structures internes de l'articulation et mérite un "
      + "avis avant de charger.",
    eviter: ["Squat profond lourd", "Fente sautée", "Squat sumo poids de corps",
             "Cossack squat", "Box jump"],
    privilegier: ["Presse à jambes 45° pieds hauts", "Leg curl allongé",
                  "Extension terminale du genou élastique", "Quadriceps setting isométrique"],
    consigne: "Aucun mouvement en rotation sous charge. Amplitude contrôlée, axes guidés, "
      + "et faire évaluer le genou.",
    avis: true,
  },
  {
    cle: "genou_impact",
    when: (d) => d.zone === "genou" && d.mouvement === "impact",
    mecanisme: "Douleur à l'impact : la structure tolère la charge statique mais pas encore "
      + "les contraintes rapides. C'est typiquement une tendinopathie en cours de réadaptation.",
    eviter: ["Box jump", "Fente sautée", "Sauts alternés (boxer step)", "Pliométrie"],
    privilegier: ["Isométrie mur 60° (tendinopathie rotulienne)", "Presse à jambes 45° pieds hauts",
                  "Leg curl assis", "Spanish squat élastique"],
    consigne: "Isométrie et excentrique lent avant tout retour à l'impact. Progression sur "
      + "plusieurs semaines, jamais en une séance.",
  },

  // ── BAS DU DOS ──────────────────────────────────────────────────────────
  {
    cle: "dos_flexion",
    when: (d) => d.zone === "dos" && ["flexion", "charge", "assis_long"].includes(d.mouvement)
      && ["centre", "descend"].includes(d.localisation),
    mecanisme: "Douleur au centre du dos majorée en flexion, au ramassage ou en position assise "
      + "prolongée : le motif est celui d'une souffrance discale, où la flexion augmente la "
      + "pression sur le disque.",
    eviter: ["Soulevé de terre conventionnel lourd", "Good morning", "Squat barre basse (low-bar)",
             "Rowing barre 45°", "Crunch", "Relevé de jambes suspendu"],
    privilegier: ["Extension lombaire en procubitus (McKenzie)", "McGill big 3 — bird dog",
                  "Dead bug", "Presse à jambes 45° pieds hauts", "Décompression suspendue barre fixe",
                  "Tirage horizontal à la corde"],
    consigne: "Aucune flexion lombaire sous charge. Gainage anti-mouvement uniquement, "
      + "et décompression quotidienne en fin de journée.",
  },
  {
    cle: "dos_extension",
    when: (d) => d.zone === "dos" && d.mouvement === "extension"
      && ["centre", "cote"].includes(d.localisation),
    mecanisme: "Douleur majorée en extension ou en position debout prolongée : le motif oriente "
      + "vers les structures postérieures de la colonne, sollicitées quand on se cambre.",
    eviter: ["Hyperextension lombaire lestée", "Développé militaire debout lourd",
             "Squat barre nuque (high-bar)", "Good morning"],
    privilegier: ["Dead bug", "Bascule du bassin au sol", "Pallof press", "Pont fessier barre au sol",
                  "Décompression genoux-poitrine"],
    consigne: "Éviter l'hyperextension et le travail debout charge lourde. Gainage "
      + "anti-extension et renforcement des fessiers.",
  },
  {
    cle: "dos_musculaire",
    when: (d) => d.zone === "dos" && d.localisation === "cote"
      && ["rotation", "debout_long"].includes(d.mouvement),
    mecanisme: "Douleur latérale, dans la masse musculaire, sur les rotations ou en station "
      + "debout : le motif est plutôt musculaire, souvent lié à un déséquilibre ou à une "
      + "fatigue des stabilisateurs.",
    eviter: ["Rotation russe medecine ball", "Good morning", "Soulevé de terre conventionnel lourd"],
    privilegier: ["McGill big 3 — side plank", "Pallof press", "Marche du fermier unilatérale légère",
                  "Bird dog"],
    consigne: "Gainage latéral et anti-rotation, travail unilatéral progressif.",
  },

  // ── COUDE / POIGNET ─────────────────────────────────────────────────────
  {
    cle: "coude_externe",
    when: (d) => d.zone === "coude" && d.localisation === "externe",
    mecanisme: "Douleur sur la face externe du coude, déclenchée par la prise ou l'extension du "
      + "poignet : motif classique de surcharge des tendons extenseurs.",
    eviter: ["Curl barre droite", "Traction prise pronation lestée", "Extension nuque corde poulie basse"],
    privilegier: ["Excentrique poignet (épicondylalgie)", "Tyler twist (flexbar)",
                  "Curl marteau", "Curl incliné haltères"],
    consigne: "Barre EZ ou haltères uniquement, jamais de barre droite sur les curls. "
      + "Excentrique lent du poignet en quotidien.",
  },
  {
    cle: "coude_interne",
    when: (d) => d.zone === "coude" && d.localisation === "interne",
    mecanisme: "Douleur sur la face interne du coude : surcharge des fléchisseurs, fréquente "
      + "quand le volume de tirage et de prise est élevé.",
    eviter: ["Curl barre droite", "Traction prise supination lestée"],
    privilegier: ["Excentrique fléchisseurs poignet", "Curl marteau", "Supination excentrique haltère"],
    consigne: "Prise neutre, sangles sur les tirages lourds pour décharger la prise.",
  },

  // ── HANCHE ──────────────────────────────────────────────────────────────
  {
    cle: "hanche_pincement",
    when: (d) => d.zone === "hanche" && d.localisation === "pli"
      && ["flexion_profonde", "assis_long"].includes(d.mouvement),
    mecanisme: "Pincement dans le pli de l'aine en flexion profonde : le motif évoque un conflit "
      + "entre le fémur et le bassin en fin d'amplitude, souvent lié à la forme de l'articulation.",
    eviter: ["Squat profond lourd", "Presse pieds bas amplitude complète", "Cossack squat"],
    privilegier: ["Presse à jambes 45° pieds hauts", "Squat sur box", "Mobilité hanche 90/90",
                  "Hip thrust"],
    consigne: "Réduire l'amplitude avant le pincement, élargir légèrement l'écartement des "
      + "pieds, et travailler la rotation de hanche en mobilité.",
  },
  {
    cle: "hanche_laterale",
    when: (d) => d.zone === "hanche" && d.localisation === "laterale",
    mecanisme: "Douleur sur le côté de la hanche : souvent une surcharge des abducteurs ou des "
      + "tendons qui s'insèrent sur le grand trochanter.",
    eviter: ["Fente sautée", "Abduction hanche machine lourd"],
    privilegier: ["Abduction hanche poulie basse", "Clamshell élastique", "Monster walk élastique",
                  "Pont fessier unilatéral contrôlé"],
    consigne: "Charges légères et volume progressif sur les abducteurs, éviter de dormir sur ce côté.",
  },
];

/**
 * @typedef {Object} Douleur
 * @property {string} zone            epaule | genou | dos | coude | hanche
 * @property {string} localisation
 * @property {string} mouvement
 * @property {string} [moment]
 * @property {number} [intensite]     1-10
 * @property {boolean} [perteForce]
 * @property {boolean} [gonflement]
 */

/**
 * Interprète une douleur déclarée.
 *
 * @param {Douleur} d
 * @returns {{reconnu: boolean, mecanisme: string, eviter: string[],
 *            privilegier: string[], consigne: string,
 *            drapeaux: string[], avisRecommande: boolean}}
 */
export function lireDouleur(d) {
  if (!d?.zone) {
    return { reconnu: false, mecanisme: "", eviter: [], privilegier: [],
      consigne: "", drapeaux: [], avisRecommande: false };
  }

  const drapeaux = DRAPEAUX.filter(f => { try { return f.quand(d); } catch { return false; } })
    .map(f => f.texte);

  const lecture = LECTURES.find(l => { try { return l.when(d); } catch { return false; } });

  if (!lecture) {
    // Zone connue mais motif non reconnu : on reste prudent plutôt que
    // d'inventer une explication. On protège la zone, sans plus.
    const zone = QUESTIONNAIRE[d.zone];
    return {
      reconnu: false,
      mecanisme: `Douleur signalée à ${zone ? zone.label.toLowerCase() : d.zone}, sans motif `
        + "caractéristique identifiable à partir des réponses. On protège la zone par précaution.",
      eviter: [], privilegier: [],
      consigne: `Réduire la charge sur les mouvements sollicitant ${zone ? zone.label.toLowerCase() : "cette zone"}, `
        + "travailler en amplitude indolore, et faire évaluer si la gêne persiste au-delà de deux semaines.",
      drapeaux, avisRecommande: drapeaux.length > 0,
    };
  }

  return {
    reconnu: true,
    mecanisme: lecture.mecanisme,
    eviter: lecture.eviter || [],
    privilegier: lecture.privilegier || [],
    consigne: lecture.consigne,
    drapeaux,
    avisRecommande: drapeaux.length > 0 || lecture.avis === true,
  };
}

/**
 * Bloc à injecter dans le prompt, à partir des douleurs déclarées.
 * @param {Douleur[]} douleurs
 */
export function buildDouleursBlock(douleurs = []) {
  const lues = (douleurs || []).map(d => ({ d, l: lireDouleur(d) })).filter(x => x.l.mecanisme);
  if (!lues.length) return "";

  const eviter = [...new Set(lues.flatMap(x => x.l.eviter))];
  const privilegier = [...new Set(lues.flatMap(x => x.l.privilegier))]
    .filter(p => !eviter.includes(p));
  const drapeaux = [...new Set(lues.flatMap(x => x.l.drapeaux))];

  return `═══ DOULEURS DÉCLARÉES — LECTURE À PARTIR DES SYMPTÔMES ═══
L'athlète n'a PAS fourni de diagnostic : il a décrit où il a mal et sur quel
mouvement. Ce qui suit est une hypothèse de travail pour orienter le programme,
en aucun cas un diagnostic. Ne nomme jamais de pathologie dans ta réponse.

${lues.map(({ d, l }, i) => {
  const z = QUESTIONNAIRE[d.zone];
  const loc = z?.localisations.find(x => x.cle === d.localisation)?.label || d.localisation;
  const mvt = z?.mouvements.find(x => x.cle === d.mouvement)?.label || d.mouvement;
  return `${i + 1}. ${z?.label || d.zone} — ${loc}, déclenchée par : ${mvt}`
    + (d.intensite ? ` (intensité ${d.intensite}/10)` : "")
    + `\n   ${l.mecanisme}\n   → ${l.consigne}`;
}).join("\n\n")}

EXERCICES À ÉCARTER (contre-indications déduites) :
${eviter.length ? eviter.map(e => `- ${e}`).join("\n") : "- aucun spécifiquement"}

EXERCICES À PRIVILÉGIER :
${privilegier.length ? privilegier.map(e => `- ${e}`).join("\n") : "- aucun spécifiquement"}
${drapeaux.length ? `
⚠ SIGNES NÉCESSITANT UN AVIS MÉDICAL :
${drapeaux.map(f => `- ${f}`).join("\n")}
Mentionne-le dans "tips_coach" de la première séance, sobrement, sans alarmer.
Construis quand même un programme prudent : l'athlète s'entraînera de toute façon.` : ""}`;
}
