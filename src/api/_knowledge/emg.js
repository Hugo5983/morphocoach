// ─── KNOWLEDGE : EMG (C9) ───────────────────────────────────────────────────
// Sélection d'exercices validée par électromyographie. Quand une donnée EMG
// contredit une croyance courante, l'agent suit l'EMG.

export const EMG_SELECTIONS =`SÉLECTIONS VALIDÉES PAR L'EMG (données objectives, priment sur l'intuition) :
- Tirage POITRINE > tirage nuque : grand dorsal, grand rond et chef long du triceps plus actifs, épaule protégée, geste plus fonctionnel. AUCUN argument favorable au tirage nuque (le tubercule majeur écrase le supra-épineux contre le toit de l'articulation — problème MÉCANIQUE : c'est la trajectoire qu'il faut corriger, pas la charge). Prise serrée supination = 2e meilleur recrutement du dorsal.
- FRONT SQUAT : bénéfices musculaires équivalents au back squat pour une contrainte genou nettement réduite (Gullet). Le préférer si le sport charge déjà le genou (foot, ski, combat) ou en cas de sensibilité articulaire.
- Tirage menton : la largeur de prise déplace la répartition deltoïdes/trapèzes — choisir la prise selon la cible, pas un dogme.
- Quand l'EMG départage deux variantes : encoder la plus favorable comme choix PAR DÉFAUT, garder l'autre comme variation.`;

export const VARIATION_MUSCULAIRE =`VARIATION MUSCULAIRE (on n'est pas bâtis à l'identique — 600 à 680 muscles selon les individus) :
- Trapèze : partie haute parfois absente → l'aspect"cou de taureau" est parfois inatteignable. Gérer les attentes.
- Deltoïde : partie acromiale parfois absente (épaule moins large), 3 à 6 subdivisions possibles → la largeur d'épaule a une part génétique, cibler les chefs présents.
- Général : un muscle peut être structurellement plus petit, voire partiellement absent. AVANT de conclure"en retard par manque de travail", envisager la limite structurelle — évite l'acharnement et la frustration.`;

export const REGIMES_CONTRACTION =`RÉGIMES DE CONTRACTION (jamais un seul en exclusif, alterner selon le bloc) :
- Concentrique : compliance, recrutement large → base, apprentissage, échauffement.
- Excentrique : tension élevée, raideur musculo-tendineuse, gain de force → force max, transfert de vitesse. ATTENTION : 3× moins de recrutement contractile, tension transférée aux tissus collagéniques → descente contrôlée.
- Isométrique : sollicite peu les structures passives → réathlétisation, angles précis, gainage, articulations fragiles.
- Pliométrique : restitution élastique → puissance, sports balistiques (jamais débutant).
ROUTAGE : force max → excentrique + concentrique lourd | puissance → pliométrie + stato-dynamique | fragile/réathlé → isométrique d'abord | débutant → concentrique.`;

export function buildEMGBlock({ niveau, objectif }) {
  let out = EMG_SELECTIONS +"\n\n" + VARIATION_MUSCULAIRE;
  if (niveau !=="debutant" || ["force","prep_physique"].includes(objectif))
    out +="\n\n" + REGIMES_CONTRACTION;
  return out;
}
