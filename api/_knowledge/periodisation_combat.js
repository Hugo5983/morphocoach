// ─── KNOWLEDGE : PUISSANCE & PÉRIODISATION (C8) + COMBAT (C3) ───────────────
// C8 : routé si objectif force / prep_physique ou niveau avancé.
// C3 : routé si sport de combat déclaré.

export const PUISSANCE_C8 =`FORCE EXPLOSIVE & PUISSANCE (C8) :
- La force maximale est la"mère" des autres qualités, mais elle reste un travail LENT. La puissance exige EN PLUS un travail qualitatif à vitesse d'intention MAXIMALE, même avec charges moyennes. Sans intention d'accélération maximale : aucun gain de puissance.
- Les antagonistes (travaillés surtout en excentrique) protègent l'articulation lors des gestes explosifs — les inclure systématiquement dans un bloc puissance.
- Estimation 1RM (valable jusqu'à ~10 reps) : 1RM ≈ charge × (36 / (37 − reps)). Au-delà de 10 reps l'erreur croît → tester sur séries courtes.
- Cardio/filières : à dépense égale, l'intensité ne change PAS la perte de graisse — le HIIT sert à dépenser autant en moins de temps (+ léger EPOC). Choisir l'intensité selon le temps disponible et les articulations, pas selon le mythe de la"zone brûle-graisse".
- Périodisation par blocs : accumulation (volume) → transmutation (intensité/spécificité) → réalisation (pic + décharge). Un seul objectif dominant par bloc.`;

export const COMBAT_C3 =`SPORTS DE COMBAT (C3) :
- L'écart décisif expert/débutant = vitesse de RELAXATION musculaire (jusqu'à 8× plus rapide) : garder les antagonistes contractés auto-ralentit le geste. Intégrer travail de relâchement/vitesse gestuelle.
- Chez le débutant, 14 semaines de musculation lourde (3-10 reps) : RFD +23 % (<50 ms), force max +16 % (Aagaard 2002). Doubler sa force max rend un coup 2× plus puissant à RFD constant → la force lourde SERT le combattant.
- PAS D'ÉCHEC MUSCULAIRE : un effort à 100 % demande ~10 jours de récupération, à 95 % seulement 48 h. Le combattant s'arrête à 95 % pour enchaîner les séances. L'épuisement convient à la masse, pas à la force ni à la puissance.
- Élastiques : résistance croissante avec l'allongement → force d'accélération, inhibe les antagonistes freineurs, améliore la force d'impact.
- Circuits : recrutement moteur sans cesse changeant = force-endurance fonctionnelle proche du combat. Progression : débuter avec 15-30 s de repos entre exercices, réduire au fil des séances jusqu'à l'éliminer. Ne jamais bloquer la respiration en circuit (expirer sur la phase dure).
- Endurance isométrique faible → 1 série au max de reps avec repos courts (5-10 s), calée en FIN de séance pour reproduire l'état de fatigue du combat, à l'angle de la discipline.
- Blocage respiratoire bref sur les efforts max : exprime la pleine puissance et rigidifie la colonne (protection lombaire) — à doser, jamais en circuit.`;

const MOTS_COMBAT = /boxe|mma|judo|jjb|jiu|lutte|karat|taekwondo|kick|muay|combat|grappling/i;

export function isCombat(sport) {
  return MOTS_COMBAT.test(String(sport ||""));
}
