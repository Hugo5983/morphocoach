// ─── KNOWLEDGE : RÉFÉRENTIELS PAR MUSCLE ────────────────────────────────────
// Distillé des référentiels détaillés DOS / PEC / JBE / BRA du PDF + correcteurs
// de l'Étape 5. Routé : seuls les référentiels des muscles PRIORITAIRES du
// profil sont injectés dans le prompt.

export const REFERENTIELS = {
  dos: `RÉFÉRENTIEL DOS :
- Prise large = largeur, étirement réduit, coudes hauts derrière (contraction). Prise serrée/supination = plus d'étirement, amplitude de contraction réduite.
- Omoplates peu mobiles : les barres limitent l'amplitude → passer en unilatéral (poulie/haltère). Poulie basse = la plus polyvalente (rotation pronation→supination idéale).
- Largeur en retard (dos "court") → rotations postérieures unilatérales + travail vertical prioritaire.
- Épaisseur en retard → rowing buste à 145°, prise supination, accent sur le resserrement des omoplates.
- Grand rond en retard → post-fatigue : tirage à l'échec puis rotation d'isolation. Volume grand rond : minimum 3 séries dont ≥ 2 en isolation.
- Unilatéral : pivoter le torse du côté qui travaille pour que le coude aille très loin en arrière.
- Lombaires : privilégier l'amplitude de contraction sur la charge. Traction : traumato coude/épaule/chef long du biceps — jamais trop lourd trop tôt.`,

  pectoraux: `RÉFÉRENTIEL PECTORAUX :
- La barre fixe les mains : elles ne peuvent pas se rejoindre en haut → la partie centrale des pecs n'est jamais comblée à la barre seule. Convergents (haltères, câbles, machine) obligatoires pour le centre.
- Bras longs → course très longue : réduire l'amplitude SANS honte (arrêt au-dessus de la poitrine) ; bras courts + cage massive → course courte, charge possible.
- Prise serrée : −30 % de recrutement du grand pectoral, ×2 sur les triceps → réserver au travail triceps.
- Stratégie charge : débuter en pause 1 s sur le torse (abandonne l'élastique, plus dur mais contrôlé), introduire le touch-and-go plus tard. Rebond thoracique = perte de contrôle, INTERDIT.
- Haut des pecs en retard → prioriser l'incliné (barre au menton), RÉDUIRE le volume de triceps direct et de deltoïde antérieur (ils volent la récupération).
- Coudes le long du corps + prise neutre = pec moins étiré, permet de s'entraîner malgré une épaule douloureuse. Coudes écartés + pronation = pec très étiré (réserver aux épaules saines).
- Amplitude = principal facteur de blessure aux dips/développés : partenaire ou sécurité sur le lourd.`,

  jambes: `RÉFÉRENTIEL JAMBES :
- Squat : regard droit légèrement en hauteur (regarder en bas = piquer du nez). Plus bas = plus dur et plus complet, MAIS jambes longues = porte-à-faux → hack squat / presse (cf. contraintes morpho).
- Quadriceps en retard : pré-fatigue (sissy squats → leg extension) ou post-fatigue. Leg extension lourd = cisaillement du genou : jamais trop lourd, surtout genou fragile.
- Ischios : ils grossissent rarement de façon homogène → varier les angles (assis, allongé, debout unilatéral). Pointe de pied tendue = les mollets aident (plus de force) ; pointe vers soi = ischios isolés. Cambrer/gesticuler au leg curl allongé = risque vertébral, INTERDIT.
- Soulevé de terre jambes tendues : buste à ~180° d'angle cuisses-torse pour étirer la partie haute des ischios. Pré-fatigue leg curls avant = moins lourd, mieux ressenti.
- Mollets : amplitude maximale, étirement 2 s en bas, fréquence élevée tolérée.`,

  bras: `RÉFÉRENTIEL BRAS :
- Le biceps ne se recrute vraiment qu'en jouant sur sa LONGUEUR via la position du bras : bras en avant du corps (pupitre) = chef court/galbe de face ; bras en arrière (incliné 45°) = chef long/vu de dos + étirement à l'épaule unique.
- Choisir la barre AVANT tout : valgus du coude ou hyperpronation → EZ, haltères ou poulie unilatérale OBLIGATOIRES (barre droite = poignet/coude/épaule). Hypersupinateur bras droits → barre droite OK.
- Triceps chef latéral (externe) creux → bras le long du corps, coude en arrière, corde à la poulie.
- Triceps chef long en retard → mouvements overhead (extensions nuque, debout). Coude exposé au valgus → corde/haltères/poulie unilatérale plutôt que barre.
- Avant-bras : masse près du coude (insertion haute) = potentiel limité, l'annoncer.`,
};

/** Correcteurs par déséquilibre visuel (Étape 5.2 du moteur). */
export const CORRECTEURS = `CORRECTEURS PAR DÉSÉQUILIBRE VISUEL :
- Biceps chef court déficient (galbe de face) → curls bras en avant du corps (pupitre, machine)
- Biceps chef long déficient (vu de dos) → curls bras en arrière (incliné 45°)
- Triceps chef latéral creux → bras le long du corps, coude en arrière, corde poulie
- Triceps chef long en retard → mouvements overhead
- Pectoraux haut en retard → développé incliné + réduire triceps direct et deltoïde antérieur
- Mollets hauts perchés → amplitude maximale, focus étirement (potentiel limité, l'annoncer)
- Bas des abdominaux en retard → relevés de bassin, fréquence élevée
DISTINGUER "faux" point faible (mauvais recrutement → rattrapable : angle, pré-fatigue) et "vrai"
(insertion génétique → plafond : maximiser le ventre existant, gérer les attentes honnêtement).`;

const MAP_GROUPE_REF = {
  dos: "dos", dos_largeur: "dos", dos_epaisseur: "dos", dorsaux: "dos", trapezes: "dos",
  pectoraux: "pectoraux", pecs: "pectoraux",
  quadriceps: "jambes", ischios: "jambes", mollets: "jambes", jambes: "jambes", fessiers: "jambes",
  biceps: "bras", triceps: "bras", bras: "bras", avant_bras: "bras",
  epaules: "pectoraux", // les règles poussée/épaule vivent dans le référentiel pecs
};

/** Sélectionne les référentiels pertinents pour les groupes prioritaires du profil. */
export function routeReferentiels(groupesPrioritaires = []) {
  const keys = new Set();
  for (const g of groupesPrioritaires) {
    const k = MAP_GROUPE_REF[String(g).toLowerCase().replace(/\s+/g, "_")];
    if (k) keys.add(k);
  }
  return [...keys].map(k => REFERENTIELS[k]).join("\n\n");
}
