// ─── KNOWLEDGE : TECHNIQUES & RÉCUPÉRATION (C6, partie programmation) ───────
// La partie"curiosités" de C6 (EMS, occlusion, potentiation détaillée) vit
// dans _knowledge/bot/ : elle sert à répondre aux questions, pas à générer.

export const INTENSIFICATION_TRAUMATO =`CHOIX DES TECHNIQUES D'INTENSIFICATION (règle traumato) :
- Les techniques qui ALLONGENT les repos (rest-pause lourd, clusters, max) sont les plus traumatisantes → à réserver et espacer (1 exercice/séance max, jamais 2 cycles de suite sur la même zone).
- Les techniques qui RÉDUISENT les repos (supersets, drop sets, séries longues) sont moins traumatisantes → utilisables souvent, en allégeant la charge pour maximiser le stress métabolique. Privilégier les repos courts sur les articulations fragiles (coudes notamment).`;

export const CONGESTION =`CONGESTION (finishers) : charge + étirement + temps sous tension. Plage idéale 12-25 répétitions. Les mouvements qui contractent EN étirant (dips, écartés) sont les meilleurs finisseurs. À placer en FIN de séance uniquement.`;

export const DONNANT_DONNANT =`THÉORIE DU DONNANT-DONNANT : plus on a de muscle, plus il est difficile d'en gagner — l'infrastructure (cardiovasculaire, hormonale) se dilue. Sur un pratiquant avancé en plateau, RÉALLOUER le volume vers les points faibles (entretien léger des points forts) est plus rentable que pousser partout : le corps"échange" plus volontiers qu'il n'ajoute.`;

export const ECHAUFFEMENT_TEMPERATURE =`TEMPÉRATURE & ÉCHAUFFEMENT : allonger l'échauffement des maillons faibles (tendons, articulations) avant les charges lourdes, surtout par temps froid ou le matin. Ne pas laisser refroidir la zone travaillée entre les séries (tenue). Par temps froid/humide les douleurs articulaires préexistantes s'intensifient → adapter charges et amplitudes ces jours-là.`;

export const SOMMEIL_VARIABLE =`SOMMEIL = VARIABLE DE PROGRAMMATION : principal levier de la récupération NERVEUSE (la plus limitante en musculation). Sommeil dégradé = marqueur précoce de surentraînement → réduire le volume avant que la performance ne chute. Dormir plus améliore directement les performances.`;

export function buildTechniquesBlock({ niveau }) {
  const parts = [ECHAUFFEMENT_TEMPERATURE, SOMMEIL_VARIABLE];
  if (niveau !=="debutant") parts.unshift(INTENSIFICATION_TRAUMATO, CONGESTION);
  if (niveau ==="avance")   parts.push(DONNANT_DONNANT);
  return parts.join("\n\n");
}
