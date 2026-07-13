// ─── KNOWLEDGE : RATTRAPAGE & ADAPTATION FINE (C10) ─────────────────────────
// Il n'existe pas d'exercice universel : s'acharner sur un mouvement que
// l'anatomie ne permet pas crée des douleurs lentes et diffuses. Adapter le
// matériel, pas forcer le corps.

export const VALGUS_MATERIEL = `VALGUS & PRONATION/SUPINATION → CHOIX DU MATÉRIEL (bras et tirages) :
- Hypersupinateur + bras droits → barre droite OK.
- Hyperpronateur ou valgus prononcé → barre droite pathogène (force la rotation : poignet-coude-épaule). Barre EZ ; si insuffisant → haltères ou câble UNILATÉRAL.
- Bras très coudés ou asymétriques → barre à proscrire, haltères/câble un bras (seuls à donner assez de liberté). Ces traits sont souvent ASYMÉTRIQUES → argument fort pour l'unilatéral.
- Les machines à biceps n'accommodent quasiment jamais un valgus prononcé : pour les bras coudés, les poids libres unilatéraux sont SUPÉRIEURS aux machines.
- Ce qui pose problème à la barre droite pour les biceps le pose aussi pour les triceps : encoder le profil UNE fois, l'appliquer à TOUS les exercices de bras et tirages.
- Si le profil valgus/pronation est inconnu : par prudence, EZ ou haltères par défaut sur les curls/extensions.`;

export const GRILLE_5_DIFFICULTES = `MÉTHODE DES 5 DIFFICULTÉS (à passer AVANT d'ajouter du volume sur un muscle en retard) :
1. Considérations anatomiques (origine, insertion, chefs).
2. Particularités morphologiques individuelles (angles, longueurs, insertions).
3. Dilemme biomécanique : l'exercice "de base" convient-il vraiment à CETTE anatomie ?
4. Difficultés spécifiques du muscle (obstacles propres au groupe).
5. Stratégies de rattrapage : isolation, angles, fréquence dédiée, matériel adapté.
Souvent le problème n'est pas "pas assez de travail" mais "mauvais exercice pour cette anatomie" ou "mauvais recrutement" : CORRIGER LA CAUSE avant d'augmenter la dose.
VRAI vs FAUX point faible : faux (recrutement) → rattrapable : angle, matériel, pré-fatigue, segmentation. Vrai (insertion/variation structurelle) → plafond : maximiser le ventre existant, gérer les attentes honnêtement.
SEGMENTER : un muscle se développe rarement en globalité — cibler ses chefs par des angles distincts, préférer la variété d'angles à l'exercice "unique", créer la connexion sur un chef peu ressenti AVANT d'y mettre du volume lourd.`;

export const STRUCTURE_RATTRAPAGE = `STRUCTURE D'UN CYCLE DE RATTRAPAGE (si point faible confirmé) :
- Groupe ciblé sollicité 2 à 3×/semaine (lourd + poids moyens + léger/strict), les autres groupes passent à 1 séance d'entretien (donnant-donnant).
- Durée 4 à 8 semaines MAXIMUM, puis RETOUR OBLIGATOIRE à un programme standard et réévaluation.
- Finisseurs en séries longues (voire série de 100 en fin de séance chez l'avancé) = stress métabolique sans trauma.`;

export const TECHNIQUES_PAR_MUSCLE = `TECHNIQUES DE RATTRAPAGE SPÉCIFIQUES :
- Deltoïde/largeur : les clavicules ne s'élargissent pas — seule voie = hypertrophier la portion LATÉRALE. Élévations latérales : chercher la tension sur le deltoïde latéral, pas soulager avec les trapèzes. Postérieur souvent en retard → rotation de 3 zones + pré-fatigue. Le drop set est particulièrement efficace pour l'épaule.
- Grand rond : en compétition avec le grand dorsal qui domine souvent ("muscle endormi") → isolation en rotation poulie (bras plié 90°), contraction tenue 1-2 s, chercher la brûlure. Minimum 3 séries dont ≥ 2 en isolation.
- Droit fémoral : donne le galbe du quadriceps mais peu sollicité par squat/presse → au leg extension, incliner le buste en ARRIÈRE (angle cuisses-torse vers 180°) pour l'étirer et permettre sa contraction. Superset : élévations de cuisse → leg extensions.
- LOGIQUE COMMUNE : un muscle bi-articulaire ou en compétition avec un voisin doit être isolé et PRÉ-ÉTIRÉ pour être ressenti — c'est un faux point faible typique.`;

export const SECURITE_LOMBAIRE = `SÉCURITÉ LOMBAIRE (le plus exigeant de tous les groupes) :
- Danger principal = perte de placement en FIN de série (on est plus fort dos arqué → en fatiguant on compense en arquant). Arrêt AVANT la dégradation du placement, toujours.
- Écrasement discal mesuré : 8×20 soulevés de terre ≈ 4 mm sans ceinture, ≈ 2 mm avec (Reilly 1995) → ceinture sur les charges lourdes.
- Fémurs longs → alternatives au soulevé classique (rack pull, trap bar, hip thrust). Jamais chercher le record au prix du dos arrondi.`;

/** Assemble le bloc rattrapage selon le contexte du profil. */
export function buildRattrapageBlock({ hasPointsFaibles, corrigerFaibles, groupes = [] }) {
  const parts = [VALGUS_MATERIEL];
  if (hasPointsFaibles || corrigerFaibles) {
    parts.push(GRILLE_5_DIFFICULTES, STRUCTURE_RATTRAPAGE);
    const g = groupes.map(x => String(x).toLowerCase()).join(" ");
    if (/delto|epaule|rond|dos|quadri|cuisse|jambe/.test(g) || groupes.length === 0)
      parts.push(TECHNIQUES_PAR_MUSCLE);
  }
  parts.push(SECURITE_LOMBAIRE);
  return parts.join("\n\n");
}
