// ─── FRÉQUENCE HEBDOMADAIRE & PARTICULARITÉS INDIVIDUELLES ──────────────────
// Deux connaissances absentes du générateur, réunies ici parce qu'elles
// répondent à la même question : COMMENT répartir le travail dans la semaine.
//
// 1. FRÉQUENCE — les règles de conception donnaient le volume hebdomadaire par
//    muscle (9-10 séries au-delà de 3 mois) mais jamais sa RÉPARTITION. Or
//    10 séries en une fois ou en deux fois cinq ne produisent pas le même
//    résultat, et c'est précisément le premier levier à actionner sur un point
//    faible — avant d'ajouter du volume, qui coûte de la récupération.
//
// 2. SEXE — l'application collecte le sexe et ne s'en sert que pour l'analyse
//    photo. Il n'influençait aucune décision de programmation, alors qu'il
//    existe des différences moyennes robustes sur la récupération et la
//    tolérance au volume.

export const FREQUENCE = `FRÉQUENCE HEBDOMADAIRE PAR MUSCLE (répartition du volume) :
- Répartir le volume hebdomadaire d'un muscle sur 2 séances plutôt qu'une seule donne un meilleur résultat à volume ÉGAL. La règle de base est donc : 2 stimulations par semaine et par groupe dès que le nombre de séances le permet.
- Au-delà de 8 à 10 séries dans une même séance pour un muscle, les dernières séries n'apportent plus grand-chose : la qualité de contraction est déjà tombée. Mieux vaut les déplacer sur une autre séance que les empiler.
- 2 séances/semaine → corps entier, chaque muscle est donc naturellement travaillé 2 fois.
- 3 séances → corps entier ×3, ou haut/bas/corps entier. Un push-pull-legs strict ne donne qu'UNE stimulation par muscle : ne le choisir que si l'athlète y tient ou si le volume par séance reste modéré.
- 4 séances → haut/bas ×2 : deux stimulations par muscle, c'est le format le plus rentable à ce niveau.
- 5-6 séances → la fréquence par muscle peut monter à 2-3, mais le volume PAR séance doit baisser d'autant. Plus de séances ne veut pas dire plus de volume total.
- Respecter 48 h entre deux stimulations du même muscle, sauf travail léger ou correctif.

PRIORITÉ SUR UN POINT FAIBLE — l'ordre des leviers compte :
1. FRÉQUENCE d'abord : passer le groupe en retard de 1 à 2, voire 3 stimulations par semaine, à volume total constant. C'est le levier le moins coûteux en récupération — souvent le seul nécessaire.
2. PLACEMENT ensuite : le groupe en retard passe en DÉBUT de séance, quand la fraîcheur est maximale. Un muscle travaillé en fin de séance ne reçoit jamais le meilleur de l'athlète.
3. VOLUME en dernier : ajouter des séries seulement si fréquence et placement ont été exploités. Le volume est ce qui coûte le plus cher en récupération, donc ce qu'on augmente en dernier.
Ne jamais sauter directement à l'étape 3 : c'est l'erreur la plus courante, et elle produit de la fatigue plutôt que du muscle.`;

/** Différences moyennes documentées, énoncées comme des tendances. */
const FEMME = `PARTICULARITÉS — ATHLÈTE FEMME (tendances moyennes, à ajuster sur le ressenti réel) :
- Meilleure résistance à la fatigue sur les séries longues : à pourcentage de charge égal, davantage de répétitions sont généralement possibles. Les plages 8-15 sont souvent mieux tolérées et tout aussi productives que les plages très courtes.
- Récupération plus rapide ENTRE les séries : des temps de repos légèrement plus courts sont souvent suffisants sur les exercices d'assistance. Sur les mouvements lourds, garder les repos complets de la prescription.
- Récupération inter-séances généralement plus rapide après un travail lourd : une fréquence de 2 à 3 stimulations par muscle est bien tolérée, et souvent plus productive.
- Force relative du bas du corps proportionnellement plus élevée : ne pas sous-programmer le haut du corps par défaut. Le dos et les épaules méritent le même soin que le bas — c'est une erreur fréquente et coûteuse pour la posture.
- Le travail lourd (charges élevées, faibles répétitions) est aussi bénéfique et aussi sûr que pour un homme. Ne pas l'écarter par principe.
- Si l'athlète mentionne des variations d'énergie ou de performance au fil du mois, en tenir compte comme de n'importe quelle donnée de récupération : ajuster l'intensité de la semaine plutôt que d'imposer la progression prévue. N'en parler QUE si elle l'a évoqué elle-même — ne jamais le supposer, ne jamais poser de question intrusive, ne jamais faire de commentaire d'ordre médical.`;

const HOMME = `PARTICULARITÉS — ATHLÈTE HOMME (tendances moyennes) :
- Fatigue plus marquée après un travail lourd en faibles répétitions : respecter scrupuleusement les temps de repos longs sur les mouvements principaux et les 48-72 h entre deux séances lourdes de la même zone.
- Tendance fréquente à sur-solliciter les groupes visibles (pectoraux, biceps) et à négliger le dos, les ischio-jambiers et les fessiers. Rétablir l'équilibre dans le programme, même si l'athlète ne le demande pas — c'est ce qui protège les épaules et le dos sur la durée.
- La progression en charge est en général le levier de motivation le plus efficace : rendre l'incrément visible et chiffré dans la prescription.`;

/**
 * Bloc fréquence + particularités.
 *
 * @param {{sexe?: string, nbJours?: number, aPointsFaibles?: boolean}} p
 */
export function buildFrequenceBlock({ sexe, nbJours = 3, aPointsFaibles = false } = {}) {
  const parts = [FREQUENCE];

  // Rappel chiffré adapté au format réel de la semaine.
  const n = Number(nbJours) || 3;
  const cible = n <= 2 ? "2 (corps entier)" : n === 3 ? "2 en moyenne" : n === 4 ? "2" : "2 à 3";
  parts.push(
    `AVEC ${n} SÉANCE${n > 1 ? "S" : ""} PAR SEMAINE : viser ${cible} stimulation(s) par groupe musculaire. `
    + "Répartis le volume hebdomadaire en conséquence, ne le concentre pas sur une seule séance."
  );

  if (aPointsFaibles) parts.push(
    "Un ou plusieurs points faibles sont identifiés : applique l'ordre des leviers "
    + "(fréquence, puis placement en début de séance, puis volume) et explique dans "
    + "\"reflexion.priorites\" LEQUEL tu as utilisé et pourquoi."
  );

  const s = String(sexe || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (s.startsWith("f")) parts.push(FEMME);
  else if (s.startsWith("h") || s.startsWith("m")) parts.push(HOMME);

  return `═══ FRÉQUENCE HEBDOMADAIRE & PROFIL INDIVIDUEL ═══\n${parts.join("\n\n")}`;
}
