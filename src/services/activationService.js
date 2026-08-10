// ─── ÉCHAUFFEMENT — ACTIVATION SPÉCIFIQUE ───────────────────────────────────
// POURQUOI CE MODULE EXISTE :
//
// La préparation ciblée allait chercher ses exercices dans les ROUTINES DE
// MOBILITÉ. Résultat observé en séance : « ouverture de poitrine 2 × 30 s »,
// « étirement grand dorsal suspendu 2 × 30 s », « extension thoracique sur
// rouleau ». Ce sont des étirements STATIQUES TENUS — exactement ce qu'il ne
// faut pas faire juste avant des charges lourdes : l'étirement statique
// prolongé réduit la production de force sur les minutes qui suivent.
//
// La mobilité et l'échauffement répondent à deux besoins différents :
//   MOBILITÉ     gagner de l'amplitude durablement  → matin, soir, jour off
//   ÉCHAUFFEMENT rendre le muscle disponible MAINTENANT → juste avant la séance
//
// Ce module ne fait que le second. Il ne contient AUCUN étirement tenu :
// uniquement du mouvement, de l'activation, de la mise en tension progressive.
//
// CONTRAINTE MATÉRIEL : l'élastique est le meilleur outil d'activation, mais
// beaucoup de salles n'en ont pas. Chaque groupe propose donc une ÉCHELLE DE
// REPLI — poulie (toujours présente en salle), puis élastique, puis haltères
// légers, puis poids du corps. L'athlète obtient un échauffement complet quel
// que soit son équipement, jamais une liste vide.
//
// Tous les noms d'exercices proviennent du catalogue : ce qui est proposé ici
// existe réellement et respecte le matériel déclaré.

/**
 * Activation par groupe musculaire, du plus au moins prioritaire.
 * `mat` doit correspondre au matériel du catalogue ; `null` = aucun matériel.
 * `dose` reste légère par construction : on prépare, on ne fatigue pas.
 */
const ACTIVATION = {
  Dos: [
    { nom: "Face pull poulie haute corde", mat: "poulie", dose: "2 × 15 léger",
      but: "Réveille rhomboïdes et trapèze moyen avant les tirages." },
    { nom: "Face pull élastique", mat: "élastique", dose: "2 × 15",
      but: "Réveille rhomboïdes et trapèze moyen avant les tirages." },
    { nom: "Straight-arm pulldown élastique", mat: "élastique", dose: "2 × 15",
      but: "Met le dorsal sous tension bras tendus, sans charger l'épaule." },
    { nom: "Scapular pull-up", mat: "poids de corps", dose: "2 × 8",
      but: "Apprend à initier le tirage par l'omoplate, pas par le biceps." },
    { nom: "Tirage vertical poulie prise large", mat: "poulie", dose: "1 × 15 très léger",
      but: "Répète le geste du jour à vide avant de le charger." },
  ],
  Pectoraux: [
    { nom: "Rotation externe poulie basse", mat: "poulie", dose: "2 × 15 léger",
      but: "La coiffe doit être réveillée avant tout développé." },
    { nom: "Rotation externe élastique", mat: "élastique", dose: "2 × 15",
      but: "La coiffe doit être réveillée avant tout développé." },
    { nom: "Pompes contre un support", mat: "poids de corps", dose: "2 × 12",
      but: "Le geste à vide, amplitude complète, avant la charge." },
    { nom: "Écarté élastique debout", mat: "élastique", dose: "2 × 15",
      but: "Amène le pectoral en tension progressive sans à-coup." },
    { nom: "Serratus punch élastique", mat: "élastique", dose: "2 × 12",
      but: "Le dentelé stabilise l'omoplate pendant les développés." },
  ],
  Épaules: [
    { nom: "Rotation externe poulie basse", mat: "poulie", dose: "2 × 15 léger",
      but: "Coude au corps, charge minimale : on active, on ne muscle pas." },
    { nom: "Pull-apart élastique", mat: "élastique", dose: "2 × 20",
      but: "Ouvre et active tout l'arrière d'épaule en un geste." },
    { nom: "Rotation externe élastique", mat: "élastique", dose: "2 × 15",
      but: "Coude au corps, résistance légère." },
    { nom: "Y-T-W au sol", mat: "poids de corps", dose: "2 × 8 par lettre",
      but: "Active les stabilisateurs dans les trois axes." },
    { nom: "Élévations latérales haltères", mat: "haltères", dose: "2 × 15 très léger",
      but: "Deltoïde moyen réveillé avec la charge la plus légère disponible." },
  ],
  Trapèzes: [
    { nom: "Face pull poulie haute corde", mat: "poulie", dose: "2 × 15 léger",
      but: "Trapèze moyen et bas, les grands oubliés." },
    { nom: "Wall slide + élastique", mat: "élastique", dose: "2 × 10",
      but: "Rythme scapulo-huméral avant tout travail au-dessus de la tête." },
    { nom: "Scapular push-up", mat: "poids de corps", dose: "2 × 12",
      but: "Protraction et rétraction actives, sans charge." },
  ],
  Quadriceps: [
    { nom: "Squat au poids de corps", mat: "poids de corps", dose: "2 × 12",
      but: "Amplitude complète et contrôlée avant de charger." },
    { nom: "Extension terminale du genou élastique", mat: "élastique", dose: "2 × 15",
      but: "Active le vaste interne, qui protège la rotule." },
    { nom: "Extension de jambes machine", mat: "machine", dose: "1 × 20 très léger",
      but: "Fait circuler le genou sans contrainte de cisaillement." },
    { nom: "Fente avant au poids de corps", mat: "poids de corps", dose: "2 × 8 par jambe",
      but: "Prépare l'appui unilatéral et l'équilibre." },
  ],
  "Ischio-jambiers": [
    { nom: "Good morning élastique", mat: "élastique", dose: "2 × 15",
      but: "Charnière de hanche sous tension légère, dos neutre." },
    { nom: "Soulevé de terre roumain barre à vide", mat: "barre", dose: "2 × 12",
      but: "Le geste du jour, barre vide, pour caler la charnière." },
    { nom: "Pont fessier au sol", mat: "poids de corps", dose: "2 × 15",
      but: "Réveille la chaîne postérieure sans charge axiale." },
  ],
  Fessiers: [
    { nom: "Marche latérale élastique", mat: "élastique", dose: "2 × 12 pas par côté",
      but: "Moyen fessier activé : c'est lui qui tient le genou en place." },
    { nom: "Pont fessier au sol", mat: "poids de corps", dose: "2 × 15",
      but: "Active le grand fessier avant squat, presse ou hip thrust." },
    { nom: "Abduction hanche machine", mat: "machine", dose: "1 × 20 léger",
      but: "Abducteurs réveillés, en particulier si le genou part en dedans." },
  ],
  Mollets: [
    { nom: "Dorsiflexion genou au mur", mat: "poids de corps", dose: "10 par cheville",
      but: "Sans cheville mobile, pas de profondeur en squat." },
    { nom: "Extension mollets debout", mat: "poids de corps", dose: "2 × 15",
      but: "Fait circuler le tendon d'Achille avant les appuis." },
  ],
  Biceps: [
    { nom: "Curl élastique debout", mat: "élastique", dose: "1 × 15 léger",
      but: "Coude et biceps sollicités doucement avant les tirages lourds." },
    { nom: "Curl haltères alterné", mat: "haltères", dose: "1 × 15 très léger",
      but: "Le coude assiste tous les tirages : il chauffe avant." },
  ],
  Triceps: [
    { nom: "Extension poulie haute corde", mat: "poulie", dose: "1 × 20 très léger",
      but: "Le coude chauffe avant les développés lourds." },
    { nom: "Extension triceps élastique", mat: "élastique", dose: "1 × 20",
      but: "Le coude chauffe avant les développés lourds." },
  ],
  "Avant-bras": [
    { nom: "Curl poignet élastique", mat: "élastique", dose: "1 × 20",
      but: "La prise lâche avant le dos : elle se prépare aussi." },
    { nom: "Extension poignets élastique", mat: "élastique", dose: "1 × 20",
      but: "Équilibre fléchisseurs et extenseurs avant les tirages lourds." },
  ],
  Abdominaux: [
    { nom: "Dead bug", mat: "poids de corps", dose: "2 × 8 par côté",
      but: "Gainage actif : le tronc doit tenir avant de charger." },
    { nom: "Pallof press élastique", mat: "élastique", dose: "2 × 10 par côté",
      but: "Anti-rotation, le vrai rôle du tronc sous charge." },
  ],
  Lombaires: [
    { nom: "Bird dog", mat: "poids de corps", dose: "2 × 8 par côté",
      but: "Coordination tronc-hanche avant tout travail en charnière." },
  ],
};

/** Renfort imposé quand une pathologie touche la zone travaillée. */
const RENFORT_PATHO = [
  { test: /epaule|épaule|coiffe|conflit|acromial/i, groupes: ["Pectoraux", "Épaules", "Dos", "Trapèzes"],
    exos: [
      { nom: "Rotation externe poulie basse", mat: "poulie", dose: "3 × 15 très léger",
        but: "Épaule déclarée sensible : la coiffe passe en priorité absolue." },
      { nom: "Rotation externe élastique", mat: "élastique", dose: "3 × 15",
        but: "Épaule déclarée sensible : la coiffe passe en priorité absolue." },
    ] },
  { test: /genou|menisque|ménisque|lca|rotul/i, groupes: ["Quadriceps", "Ischio-jambiers", "Fessiers"],
    exos: [
      { nom: "Marche latérale élastique", mat: "élastique", dose: "3 × 12 pas par côté",
        but: "Genou déclaré sensible : le moyen fessier tient l'axe du genou." },
      { nom: "Extension terminale du genou élastique", mat: "élastique", dose: "3 × 15",
        but: "Vaste interne activé : c'est lui qui stabilise la rotule." },
      { nom: "Pont fessier au sol", mat: "poids de corps", dose: "2 × 15",
        but: "Chaîne postérieure réveillée avant tout appui chargé." },
    ] },
  { test: /lombalgie|hernie|discale|sciatique|dos|scoliose/i, groupes: ["Ischio-jambiers", "Fessiers", "Quadriceps", "Dos"],
    exos: [
      { nom: "Bird dog", mat: "poids de corps", dose: "3 × 8 par côté",
        but: "Dos déclaré sensible : le tronc doit verrouiller avant la charge." },
      { nom: "Dead bug", mat: "poids de corps", dose: "2 × 8 par côté",
        but: "Gainage actif, colonne neutre, aucune amplitude extrême." },
    ] },
];

/** Mise en route générale — élever la température, rien d'autre. */
const MISE_EN_ROUTE = {
  bas: [
    { nom: "Vélo ou rameur", mat: null, dose: "3 min",
      but: "Rythme facile : on cherche la température, pas l'essoufflement." },
    { nom: "Montées de genoux et talons-fesses", mat: null, dose: "2 × 20 pas",
      but: "Sur place, amplitude croissante." },
  ],
  haut: [
    { nom: "Rameur ou corde à sauter", mat: null, dose: "3 min",
      but: "Le haut du corps chauffe avant les épaules." },
    { nom: "Cercles de bras et rotations d'épaules", mat: null, dose: "2 × 15",
      but: "Amplitude croissante, sans à-coup." },
  ],
  mixte: [
    { nom: "Cardio léger au choix", mat: null, dose: "3 min",
      but: "Vélo, rameur, marche rapide — objectif température." },
    { nom: "Mobilisation articulaire de bas en haut", mat: null, dose: "2 min",
      but: "Chevilles, hanches, colonne, épaules — en mouvement, jamais tenu." },
  ],
};

/**
 * Matériels réellement disponibles, à partir des cases cochées au formulaire.
 * Miroir de la table serveur : le poids du corps et les accessoires sont
 * toujours supposés présents, et une sélection vide vaut salle complète.
 */
const BASE_MAT = ["poids de corps", "accessoire"];
const MAP_MAT = {
  salle_complete: ["haltères", "barre", "poulie", "machine", "élastique", "TRX",
                   "kettlebell", "bosu", "medecine ball", "swiss ball", ...BASE_MAT],
  halteres:       ["haltères", ...BASE_MAT],
  machines:       ["machine", "poulie", ...BASE_MAT],
  elastiques:     ["élastique", ...BASE_MAT],
  poids_corps:    [...BASE_MAT],
  barre_traction: [...BASE_MAT],
  medecine_ball:  ["medecine ball", ...BASE_MAT],
  swiss_ball:     ["swiss ball", ...BASE_MAT],
  bosu:           ["bosu", ...BASE_MAT],
  kettlebell:     ["kettlebell", ...BASE_MAT],
  trx:            ["TRX", ...BASE_MAT],
};

export function matsAutorises(materiel = []) {
  if (!materiel.length) return new Set(MAP_MAT.salle_complete);
  const s = new Set();
  for (const id of materiel) for (const m of (MAP_MAT[id] || BASE_MAT)) s.add(m);
  return s;
}

const BAS = ["Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets"];
const HAUT = ["Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Trapèzes", "Avant-bras"];

/**
 * Famille de mouvement, matériel retiré.
 *
 * L'échelle de repli propose la même chose sous plusieurs formes ("Face pull
 * poulie haute corde", "Face pull élastique"). Sans ce regroupement, un athlète
 * en salle complète recevait les DEUX variantes du même mouvement — l'échauffement
 * paraissait long et redondant alors qu'il ne préparait qu'une seule chose.
 * On garde donc une seule variante par famille : la première réalisable, donc
 * la mieux placée dans l'échelle.
 */
function familleDe(nom) {
  return String(nom).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(poulie|elastique|halteres?|machine|barre|corde|banc|sol|mur|assis|debout|alterne|alternee|unilaterale?|haute?|basse?|penche|couche|au|a|la|le|les|de|du|des|en|sur|avec|prise|large|serree|neutre|tres|leger|legere)\b/g, " ")
    .replace(/\s+/g, " ").trim();
}

/** Un exercice est-il réalisable avec le matériel disponible ? */
const dispo = (mat, mats) => mat === null || mats.has(mat);

/**
 * Construit l'échauffement d'activation d'une séance.
 *
 * @param {object} p
 * @param {string[]} p.groupes      groupes musculaires travaillés ce jour
 * @param {Set<string>} p.mats      matériels autorisés (voir matsAutorises)
 * @param {string[]} [p.pathologies]
 * @param {number} [p.maxMinutes=7] plafond hors montée en charge
 */
export function buildActivation({ groupes = [], mats, pathologies = [], maxMinutes = 7 }) {
  const dispoMats = mats instanceof Set ? mats : new Set(mats || []);
  const nbBas = groupes.filter(g => BAS.includes(g)).length;
  const nbHaut = groupes.filter(g => HAUT.includes(g)).length;
  const orientation = nbBas > nbHaut ? "bas" : nbHaut > nbBas ? "haut" : "mixte";

  // Déduplication à deux niveaux : le nom exact ET la famille de mouvement.
  const vus = new Set(), familles = new Set();
  const prendre = (liste, max) => {
    const out = [];
    for (const e of liste) {
      if (out.length >= max) break;
      const fam = familleDe(e.nom);
      if (vus.has(e.nom) || familles.has(fam) || !dispo(e.mat, dispoMats)) continue;
      vus.add(e.nom); familles.add(fam);
      out.push(e);
    }
    return out;
  };

  // 1. Renforts imposés par une pathologie : ils passent AVANT tout le reste.
  const patho = (pathologies || []).join(" ");
  const renforts = [];
  for (const r of RENFORT_PATHO) {
    if (!r.test.test(patho)) continue;
    if (!groupes.some(g => r.groupes.includes(g))) continue;
    // Une seule variante par renfort : la première réalisable.
    renforts.push(...prendre(r.exos, 1));
  }

  // 2. Activation des groupes du jour, deux exercices par groupe au plus.
  const parGroupe = [];
  for (const g of groupes.slice(0, 3)) {
    const liste = ACTIVATION[g];
    if (!liste) continue;
    parGroupe.push(...prendre(liste, parGroupe.length + renforts.length >= 4 ? 1 : 2));
  }

  // 3. Filet de sécurité : si le matériel est très restreint, on complète avec
  //    ce qui ne demande rien. Un échauffement vide serait pire que générique.
  const specifiques = [...renforts, ...parGroupe];
  if (specifiques.length < 2) {
    const secours = Object.values(ACTIVATION).flat().filter(e => e.mat === "poids de corps");
    specifiques.push(...prendre(secours, 2 - specifiques.length));
  }

  const general = MISE_EN_ROUTE[orientation];
  const minutesSpec = Math.min(4, Math.max(2, Math.ceil(specifiques.length * 0.8)));

  return {
    orientation,
    minutes: Math.min(maxMinutes, 3 + minutesSpec),
    blocs: [
      { cle: "general", titre: "Mise en route", minutes: 3,
        but: "Élever la température corporelle et le rythme cardiaque.",
        exercices: general.map(e => ({ nom: e.nom, duree: e.dose, comment: e.but })) },
      { cle: "activation", titre: "Activation", minutes: minutesSpec,
        but: groupes.length
          ? `Rendre disponibles les muscles du jour : ${groupes.slice(0, 3).join(", ").toLowerCase()}.`
          : "Rendre les muscles disponibles avant la charge.",
        exercices: specifiques.slice(0, 5).map(e => ({ nom: e.nom, duree: e.dose, comment: e.but })) },
    ],
  };
}

/** Exposé pour les tests : aucun exercice d'activation ne doit être un étirement tenu. */
export const TOUS_LES_EXERCICES = () =>
  [...Object.values(ACTIVATION).flat(), ...RENFORT_PATHO.flatMap(r => r.exos)];
