// ─── CONSTRUCTION DE SÉANCE PAR GROUPE ──────────────────────────────────────
// Source : MorphoCoach — Référentiels détaillés DOS / PECTORAUX / JAMBES / BRAS
//          (annexes d'exécution de la couche C10) + C1 §4.1 (20 étapes).
//
// CE QUE FAIT CE MODULE, ET POURQUOI :
// Les référentiels du PDF contiennent des pseudo-codes conditionnels du type
//   SI femurs_longs → base = hack | presse 45°
//   SINON          → base = squat
// Envoyer ce pseudo-code brut au modèle reviendrait à lui demander d'évaluer
// lui-même des conditions qu'on connaît déjà. On les RÉSOUT ici avec la fiche
// morphologique réelle, et on ne lui transmet que la branche qui s'applique.
// C'est la différence entre un template et un coach.

/** Groupes couverts par un référentiel détaillé. */
const GROUPES = ["dos", "pectoraux", "jambes", "bras", "epaules"];

/** Un point faible est-il déclaré sur ce groupe ? */
function enRetard(rep, ...cles) {
  return cles.some(k => rep?.[k] === "en_retard" || rep?.[k] === "tres_en_retard");
}

/**
 * Construit la consigne de séance pour un groupe, branches déjà résolues.
 * @param {string} groupe
 * @param {object} o observations validées de la fiche
 * @param {{pathologies?: string[]}} profil
 * @returns {string|null}
 */
function referentiel(groupe, o, profil) {
  const lev = o?.leviers || {}, ins = o?.insertions || {}, rep = o?.repartition || {};
  const pos = Array.isArray(o?.posture) ? o.posture : [];
  const patho = (profil?.pathologies || []).map(p => String(p).toLowerCase()).join(" ");
  const epauleFragile = /epaule|épaule|coiffe|conflit/.test(patho) || pos.includes("antepulsion_scapulaire");
  const dosSensible = /lombalgie|hernie|discale|sciatique|scoliose|dos/.test(patho) || pos.includes("hyperlordose");
  const brasLongs = lev.humerus === "long" || lev.avant_bras === "long";
  const valgus = pos.includes("valgus_genou");

  switch (groupe) {
    // ── DOS ────────────────────────────────────────────────────────────────
    case "dos": {
      const l = [];
      l.push("Le dos a DEUX axes non interchangeables : la LARGEUR (grand dorsal fibres hautes, grand rond → tractions et tirages verticaux, bras éloignés du torse) et l'ÉPAISSEUR (trapèzes moyens, rhomboïdes, bas du dorsal → rowings et tirages horizontaux). Programmer 1 à 2 exercices de CHAQUE axe : ils sont complémentaires, jamais substituables.");
      l.push("Échauffement OBLIGATOIRE avant le dos : coudes, biceps, avant-bras et infra-épineux assistent les dorsaux. Un coude pris à froid sur un tirage lourd est une blessure classique.");
      if (lev.avant_bras === "long")
        l.push("Avant-bras longs : la prise lâche avant le dos. Prévoir des sangles sur les séries lourdes, ou du travail de grip en fin de séance — sinon le dorsal ne sera jamais amené à l'échec.");
      if (pos.includes("antepulsion_scapulaire") || pos.includes("cyphose"))
        l.push("Omoplates peu mobiles : privilégier l'UNILATÉRAL (rowing haltère, tirage unilatéral) — l'athlète sentira mieux le mouvement qu'en bilatéral.");
      if (enRetard(rep, "dos_largeur"))
        l.push("LARGEUR en retard : ajouter de la rotation postérieure unilatérale et du travail sur les fibres externes inférieures. Prise large, coudes écartés, focus sur l'étirement en haut.");
      if (enRetard(rep, "dos_epaisseur"))
        l.push("ÉPAISSEUR en retard : rowing buste à environ 145°, prise en supination, accent sur le resserrement des omoplates en fin de course.");
      return l.join("\n• ");
    }

    // ── PECTORAUX ──────────────────────────────────────────────────────────
    case "pectoraux": {
      const l = [];
      l.push("Le pectoral est un muscle À ANGLES : faisceau claviculaire (haut), sternal (milieu), abdominal (bas). Le développer complètement suppose de VARIER les angles — 1 développé + 1 angle complémentaire + 1 isolation, jamais trois fois le même mouvement.");
      l.push("Échauffement : épaules, coiffe des rotateurs et triceps avant tout développé.");
      if (epauleFragile)
        l.push("ÉPAULE FRAGILE : la base doit être une machine convergente ou un développé haltères coudes serrés en prise NEUTRE. Pas de barre droite lourde, pas de dips profonds.");
      else
        l.push("Base : développé haltères de préférence (meilleure course interne et auto-régulation de l'amplitude).");
      if (brasLongs)
        l.push("Bras longs : RÉDUIRE l'amplitude en position basse (barre au menton à l'incliné, prise un peu plus étroite, ou haltères). L'étirement extrême est le mécanisme de la déchirure pectorale.");
      if (enRetard(rep, "pectoraux"))
        l.push("PECTORAUX en retard : prioriser l'INCLINÉ (le haut est le plus souvent le maillon faible), et RÉDUIRE le volume de triceps direct et de deltoïde antérieur dans la semaine — ils volent le stimulus.");
      l.push("Prise large = pectoral · prise étroite = -30 % de pectoral et deux fois plus de triceps. Choisir en conséquence.");
      return l.join("\n• ");
    }

    // ── JAMBES ─────────────────────────────────────────────────────────────
    case "jambes": {
      const l = [];
      l.push("Trois ensembles à logiques distinctes : quadriceps (extension du genou), ischio-jambiers (bi-articulaires : flexion du genou + extension de hanche) et mollets (gastrocnémien bi-articulaire + soléaire mono-articulaire).");
      l.push("Échauffement : genoux et gainage lombaire (abdominaux, obliques, spinaux) avant toute charge.");
      if (lev.femur === "long" || dosSensible)
        l.push("Fémurs longs ou dos sensible : la BASE quadriceps est le hack squat ou la presse 45° — ils épargnent la colonne. Le squat barre reste possible en second, léger et à amplitude contrôlée.");
      else
        l.push("Morphologie favorable au squat : le squat barre est la base légitime. Profondeur selon l'anatomie.");
      l.push("Isolation quadriceps : leg extension, buste incliné vers l'arrière si le droit fémoral est faible.");
      l.push("ISCHIOS — jamais en appoint : au moins 1 leg curl (assis = position d'étirement, allongé = raccourci) ET 1 mouvement en étirement (soulevé de terre jambes tendues). Vérifier l'équilibre quadriceps/ischios.");
      if (ins.mollets === "haute")
        l.push("Mollets hauts perchés : amplitude maximale et séries longues (20-25 répétitions) — la charge ne compensera pas le manque de fibres.");
      l.push("Mollets : combiner DEBOUT (genou tendu = gastrocnémien) et ASSIS (genou fléchi = soléaire). Séries longues, amplitude complète.");
      if (valgus)
        l.push("Valgus dynamique : contrôler la trajectoire du genou AVANT d'augmenter la charge. Renforcement des abducteurs de hanche à chaque séance de jambes.");
      l.push("Si les ischios et les mollets sont systématiquement bâclés en fin de séance, leur réserver un jour dédié hors du travail quadriceps.");
      return l.join("\n• ");
    }

    // ── BRAS ───────────────────────────────────────────────────────────────
    case "bras": {
      const l = [];
      l.push("Choisir la BARRE avant tout : c'est le premier facteur de tolérance articulaire au coude.");
      if (pos.includes("valgus_genou") || /epicondyl|coude/.test(patho))
        l.push("Terrain de coude sensible : barre EZ, haltères ou poulie unilatérale — JAMAIS de barre droite sur les curls.");
      else
        l.push("Pas de contre-indication au coude : la barre droite est utilisable.");
      l.push("Le triceps représente environ les deux tiers du volume du bras : lui donner au moins autant de travail qu'au biceps.");
      l.push("Triceps — couvrir les chefs : corde à la poulie (chef latéral, coudes au corps, rotation en fin de course) + extensions overhead ou allongé (chef long, bras au-dessus de la tête) + 1 base (développé serré ou dips).");
      if (ins.biceps === "haute")
        l.push("Insertion de biceps haute : le pic ne viendra pas, c'est structurel. Travailler le chef long (curl incliné, bras en arrière) pour l'illusion de longueur, et le brachial (curl marteau) pour épaissir le bras vu de profil.");
      l.push("Biceps — varier la position du BRAS pour cibler les chefs : incliné (chef long, galbe vu de dos), pupitre ou concentré (chef court, galbe vu de face), marteau (brachial et avant-bras).");
      if (enRetard(rep, "biceps") || enRetard(rep, "triceps"))
        l.push("Bras en retard : attention au cumul du chef long du triceps avec les tirages du dos dans la semaine — échauffer le coude et espacer les séances.");
      l.push("Avant-bras : travail direct SEULEMENT s'il y a un retard (wrist curls + reverse curls). Sinon ils sont suffisamment sollicités par les prises.");
      return l.join("\n• ");
    }

    // ── ÉPAULES ────────────────────────────────────────────────────────────
    case "epaules": {
      const l = [];
      l.push("Trois faisceaux à traiter séparément : antérieur (déjà très sollicité par tous les développés — rarement besoin de direct), latéral (le levier esthétique de la largeur), postérieur (le plus souvent négligé, et clé pour l'équilibre de l'épaule).");
      if (epauleFragile)
        l.push("ÉPAULE FRAGILE : proscrire le développé nuque, les élévations latérales au-dessus de 90° et les tractions prise serrée derrière la nuque. Préférer la prise neutre et les amplitudes limitées à 90°.");
      if (lev.clavicules === "etroites")
        l.push("Clavicules étroites : le deltoïde latéral est LE levier de largeur. Volume élevé, fréquence 2 à 3 fois par semaine, séries longues.");
      l.push("Le deltoïde postérieur et les rotateurs externes se travaillent à CHAQUE séance du haut du corps, pas une fois par semaine : c'est ce qui garde l'épaule saine sur la durée.");
      return l.join("\n• ");
    }

    default: return null;
  }
}

/** Étapes universelles de conception (C1 §4.1), condensées et actionnables. */
export const REGLES_CONCEPTION = `RÈGLES DE CONCEPTION (C1 §4.1) :
- Séries par muscle et par semaine selon l'ancienneté : mois 1 → 4 · mois 2 → 5-6 · mois 3 → 7-8 · au-delà → 9-10.
- Exercices par muscle et par séance : débutant 1 · intermédiaire 2 · avancé 2-3.
- Full body par défaut ; le split se justifie à partir de 4 séances et d'un niveau intermédiaire confirmé.
- 1 jour de repos minimum entre deux séances sollicitant le même muscle.
- Augmenter la charge quand le nombre de répétitions cible est atteint SANS dégradation du style.
- Ordre dans la séance : polyarticulaire lourd → polyarticulaire léger → isolation. Le point faible passe en premier de séance, jamais en dernier.
- Renouveler un exercice en cas de stagnation d'une semaine ou plus, de lassitude, ou de gêne articulaire naissante.`;

/**
 * Bloc de construction de séance : uniquement les groupes réellement
 * programmés, avec les branches morphologiques déjà résolues.
 * @param {{observations?: object}} fiche
 * @param {{pathologies?: string[], niveau?: string}} profil
 * @param {number} nbJours
 */
export function buildConstructionBlock(fiche, profil = {}, nbJours = 3) {
  const o = fiche?.observations || {};
  // Sur peu de séances, le programme est full-body : tous les groupes sont
  // concernés. Au-delà, on garde aussi tout — un cycle complet les couvre tous.
  const groupes = GROUPES;

  // Libellés d'affichage : toUpperCase() perd les accents des clés internes.
  const TITRES = {
    dos: "DOS", pectoraux: "PECTORAUX", jambes: "JAMBES",
    bras: "BRAS", epaules: "ÉPAULES",
  };
  const sections = groupes
    .map(g => {
      const txt = referentiel(g, o, profil);
      return txt ? `▸ ${TITRES[g] || g.toUpperCase()}\n• ${txt}` : null;
    })
    .filter(Boolean);

  if (!sections.length) return "";

  return `═══ CONSTRUCTION DE SÉANCE PAR GROUPE (référentiels détaillés) ═══
Ces consignes viennent des référentiels d'exécution MorphoCoach. Les branches
conditionnelles ont DÉJÀ été résolues avec la morphologie et le terrain de cet
athlète : ce qui suit s'applique directement, sans arbitrage supplémentaire.

${sections.join("\n\n")}

${REGLES_CONCEPTION}`;
}
