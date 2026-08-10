// ─── ÉVOLUTION MORPHOLOGIQUE ────────────────────────────────────────────────
// POURQUOI CE MODULE EXISTE :
//
// Jusqu'ici, quand un athlète reposait des photos, la nouvelle fiche ÉCRASAIT
// l'ancienne. Personne ne comparait. Conséquence : un dos qui était "très en
// retard" et qui a rattrapé restait traité comme un point faible ; une posture
// corrigée n'était jamais reconnue ; un athlète qui progressait visiblement
// recevait le même discours qu'au premier jour.
//
// Ce module lit les DEUX fiches et produit ce qu'aucune photo seule ne peut
// dire : ce qui a CHANGÉ. C'est la seule information qui permette à un coach
// de dire "ce qu'on a fait fonctionne, on continue" ou "ça ne bouge pas, on
// change d'approche".
//
// PRINCIPE : on ne compare que ce qui est comparable. Un trait passé à
// "indetermine" (photo moins nette) n'est JAMAIS lu comme une régression —
// c'est une perte d'information, pas un changement du corps.

/** Ordre de gravité des points faibles, du pire au meilleur. */
const ECHELLE_RETARD = ["tres_en_retard", "en_retard", "leger_retard", "equilibre", "dominant"];

/** Traits de composition dont l'évolution est un signal fort. */
const ECHELLE_MASSE_GRASSE = ["tres_sec", "basse", "moderee", "haute", "tres_haute"];
const ECHELLE_DENSITE = ["debutante", "moderee", "developpee", "tres_developpee"];

const rang = (echelle, v) => echelle.indexOf(String(v || ""));

/** Traits lisibles pour un rapport en français. */
const LIB = {
  masse_grasse_visuelle: "masse grasse visuelle",
  densite_musculaire: "densité musculaire",
  repartition_graisse: "répartition des graisses",
  epaules_taille: "rapport épaules/taille",
  tronc_jambes: "rapport tronc/jambes",
  symetrie: "symétrie gauche/droite",
};
const lisible = (k) => LIB[k] || String(k).replace(/_/g, " ");

/** Aplatit les observations en paires clé → valeur, en ignorant les vides. */
function aplatir(observations, prefixe = "") {
  const out = {};
  for (const [k, v] of Object.entries(observations || {})) {
    const cle = prefixe ? `${prefixe}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, aplatir(v, cle));
    else if (Array.isArray(v)) out[cle] = v.slice().sort().join(", ");
    else if (v !== null && v !== undefined && v !== "") out[cle] = String(v);
  }
  return out;
}

/**
 * Compare deux fiches morphologiques.
 *
 * @param {object|null} avant   fiche précédente
 * @param {object|null} apres   fiche actuelle
 * @returns {{
 *   comparable: boolean, joursEcoules: number|null,
 *   ameliorations: string[], regressions: string[], stables: string[],
 *   traitsChanges: string[], resume: string
 * }}
 */
export function comparerFiches(avant, apres) {
  const vide = {
    comparable: false, joursEcoules: null,
    ameliorations: [], regressions: [], stables: [], traitsChanges: [], resume: "",
  };
  if (!avant?.observations || !apres?.observations) return vide;

  const joursEcoules = (() => {
    const a = new Date(avant.date || 0).getTime(), b = new Date(apres.date || Date.now()).getTime();
    return a > 0 && b > a ? Math.round((b - a) / 864e5) : null;
  })();

  const oa = aplatir(avant.observations), ob = aplatir(apres.observations);
  const traitsChanges = [];
  for (const [k, v] of Object.entries(ob)) {
    const ancien = oa[k];
    if (!ancien || ancien === v) continue;
    // Une photo moins lisible n'est pas une évolution du corps.
    if (v === "indetermine" || ancien === "indetermine") continue;
    traitsChanges.push(`${lisible(k.split(".").pop())} : ${ancien} → ${v}`);
  }

  // ── Points faibles : ont-ils rattrapé ? ──
  const pfAvant = new Map((avant.consequences?.points_faibles_visuels || [])
    .map(p => [String(p.groupe || p), String(p.niveau || "en_retard")]));
  const pfApres = new Map((apres.consequences?.points_faibles_visuels || [])
    .map(p => [String(p.groupe || p), String(p.niveau || "en_retard")]));

  const ameliorations = [], regressions = [], stables = [];
  for (const [groupe, niveauAvant] of pfAvant) {
    const niveauApres = pfApres.get(groupe);
    if (!niveauApres) {
      ameliorations.push(`${lisible(groupe)} n'est plus identifié comme point faible`);
      continue;
    }
    const ra = rang(ECHELLE_RETARD, niveauAvant), rb = rang(ECHELLE_RETARD, niveauApres);
    if (ra >= 0 && rb >= 0 && rb > ra) ameliorations.push(`${lisible(groupe)} : ${niveauAvant} → ${niveauApres}`);
    else if (ra >= 0 && rb >= 0 && rb < ra) regressions.push(`${lisible(groupe)} : ${niveauAvant} → ${niveauApres}`);
    else stables.push(`${lisible(groupe)} : toujours ${niveauApres}`);
  }
  for (const [groupe, niveauApres] of pfApres) {
    if (!pfAvant.has(groupe)) regressions.push(`${lisible(groupe)} apparaît comme nouveau point faible (${niveauApres})`);
  }

  // ── Composition : masse grasse et densité musculaire ──
  const compA = avant.observations?.composition || {}, compB = apres.observations?.composition || {};
  const mgA = rang(ECHELLE_MASSE_GRASSE, compA.masse_grasse_visuelle);
  const mgB = rang(ECHELLE_MASSE_GRASSE, compB.masse_grasse_visuelle);
  if (mgA >= 0 && mgB >= 0 && mgA !== mgB) {
    (mgB < mgA ? ameliorations : regressions)
      .push(`masse grasse visuelle : ${compA.masse_grasse_visuelle} → ${compB.masse_grasse_visuelle}`);
  }
  const dA = rang(ECHELLE_DENSITE, compA.densite_musculaire);
  const dB = rang(ECHELLE_DENSITE, compB.densite_musculaire);
  if (dA >= 0 && dB >= 0 && dA !== dB) {
    (dB > dA ? ameliorations : regressions)
      .push(`densité musculaire : ${compA.densite_musculaire} → ${compB.densite_musculaire}`);
  }

  // ── Posture : une correction posturale est un signal rapide et précieux ──
  const posA = new Set(avant.observations?.posture || []);
  const posB = new Set(apres.observations?.posture || []);
  for (const p of posA) if (!posB.has(p)) ameliorations.push(`posture : ${lisible(p)} n'est plus visible`);
  for (const p of posB) if (!posA.has(p)) regressions.push(`posture : ${lisible(p)} est apparu`);

  const comparable = ameliorations.length + regressions.length + stables.length + traitsChanges.length > 0;
  const resume = !comparable
    ? "Aucun changement morphologique lisible entre les deux analyses."
    : [
        ameliorations.length ? `${ameliorations.length} amélioration(s)` : null,
        regressions.length ? `${regressions.length} point(s) en recul` : null,
        stables.length ? `${stables.length} inchangé(s)` : null,
      ].filter(Boolean).join(", ");

  return { comparable, joursEcoules, ameliorations, regressions, stables, traitsChanges, resume };
}

/**
 * Bloc de prompt décrivant l'évolution réelle du physique.
 *
 * C'est le seul endroit du système où Claude apprend si ce qu'on a prescrit
 * précédemment a FONCTIONNÉ. Sans lui, chaque cycle repart de zéro.
 */
export function buildEvolutionBlock(avant, apres) {
  const d = comparerFiches(avant, apres);
  if (!d.comparable) return "";

  const periode = d.joursEcoules
    ? `${d.joursEcoules} jour${d.joursEcoules > 1 ? "s" : ""} séparent les deux analyses`
    : "période inconnue entre les deux analyses";

  const lignes = [
    "═══ ÉVOLUTION MORPHOLOGIQUE RÉELLE (deux analyses photo comparées) ═══",
    `${periode}. ${d.resume}.`,
  ];

  if (d.ameliorations.length) lignes.push(
    "\nCE QUI A PROGRESSÉ :\n- " + d.ameliorations.join("\n- ")
    + "\n→ Ce qui a été prescrit sur ces zones FONCTIONNE. Maintiens l'approche qui a produit "
    + "ce résultat plutôt que de tout changer, et dis-le à l'athlète dans \"reflexion.diagnostic\" : "
    + "voir son progrès reconnu est le premier levier d'adhésion."
  );

  if (d.regressions.length) lignes.push(
    "\nCE QUI A RECULÉ OU EST APPARU :\n- " + d.regressions.join("\n- ")
    + "\n→ Traite ces points en PRIORITÉ ce cycle. Si un point faible ancien n'a pas bougé, "
    + "l'approche précédente n'a pas suffi : change de levier (fréquence, angle, matériel, "
    + "position dans la séance), n'ajoute pas simplement du volume."
  );

  if (d.stables.length) lignes.push(
    "\nCE QUI N'A PAS BOUGÉ :\n- " + d.stables.join("\n- ")
    + "\n→ Stagnation malgré le travail : change d'approche sur ces groupes, ne répète pas "
    + "la même prescription."
  );

  if (d.traitsChanges.length) lignes.push(
    "\nAUTRES TRAITS MODIFIÉS :\n- " + d.traitsChanges.slice(0, 10).join("\n- ")
  );

  lignes.push(
    "\nRÈGLE : cette évolution est une donnée MESURÉE, pas une impression. Elle prime sur "
    + "toute hypothèse théorique. Un groupe qui a rattrapé ne doit plus recevoir un traitement "
    + "de point faible ; un groupe qui stagne doit changer de méthode, pas seulement de volume."
  );

  return lignes.join("\n");
}

/**
 * Faut-il redemander des photos ?
 *
 * Politique décidée avec le coach :
 *  - un cycle complet terminé (≈ 6 semaines) : posture et rattrapage de points
 *    faibles évoluent vite, plus vite que la silhouette globale ;
 *  - un poids qui bouge d'environ 2 kg ;
 *  - et à tout moment si le client le décide.
 *
 * NOTE IMPORTANTE (recomposition corporelle) : un athlète peut perdre de la
 * graisse ET prendre du muscle en gardant le même poids. Le poids seul ne
 * détecterait rien. C'est précisément pourquoi la règle des 6 semaines existe
 * en parallèle, et pourquoi elle ne doit jamais être supprimée au profit du
 * seul critère pondéral.
 *
 * @param {{dateFiche?: string, poidsFiche?: number, poidsActuel?: number, cyclesDepuis?: number}} p
 * @returns {{besoin: boolean, urgence: "aucune"|"suggere"|"recommande", raisons: string[], message: string}}
 */
export function besoinNouvellesPhotos({ dateFiche, poidsFiche, poidsActuel, cyclesDepuis = 0 } = {}) {
  const raisons = [];
  let urgence = "aucune";

  if (!dateFiche) {
    return { besoin: true, urgence: "recommande", raisons: ["aucune analyse morphologique"],
      message: "Ajoute des photos pour que ton programme tienne compte de ta morphologie." };
  }

  const jours = Math.floor((Date.now() - new Date(dateFiche).getTime()) / 864e5);
  if (jours >= 42) { raisons.push(`${jours} jours depuis la dernière analyse`); urgence = "recommande"; }
  else if (cyclesDepuis >= 1) { raisons.push("un cycle complet terminé"); urgence = "recommande"; }

  if (typeof poidsFiche === "number" && typeof poidsActuel === "number") {
    const ecart = Math.abs(poidsActuel - poidsFiche);
    if (ecart >= 2) {
      raisons.push(`${ecart.toFixed(1)} kg d'écart depuis la dernière analyse`);
      urgence = "recommande";
    }
  }

  if (!raisons.length) return { besoin: false, urgence: "aucune", raisons: [], message: "" };

  return {
    besoin: true, urgence, raisons,
    message: "De nouvelles photos affineraient ton programme : " + raisons.join(", ")
      + ". Ton corps peut avoir changé même si ton poids n'a pas bougé — "
      + "posture et rattrapage de points faibles évoluent vite.",
  };
}
