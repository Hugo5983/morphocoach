// ─── KNOWLEDGE BOT : EXPERTISE COMPLÈTE ─────────────────────────────────────
// Digests de RÉPONSE AUX QUESTIONS couvrant toute la base (moteur + C1-C11 +
// référentiels). Réutilise les modules de génération quand c'est possible —
// une seule source de vérité par sujet.

import { REPERES_VISUELS } from "../morphologie.js";
import { REGLES_PATHO } from "../securite.js";
import { EMG_SELECTIONS, VARIATION_MUSCULAIRE, REGIMES_CONTRACTION } from "../emg.js";
import { VALGUS_MATERIEL, GRILLE_5_DIFFICULTES, STRUCTURE_RATTRAPAGE,
         TECHNIQUES_PAR_MUSCLE, SECURITE_LOMBAIRE } from "../rattrapage.js";
import { INTENSIFICATION_TRAUMATO, CONGESTION, DONNANT_DONNANT,
         SOMMEIL_VARIABLE, ECHAUFFEMENT_TEMPERATURE } from "../techniques.js";
import { PUISSANCE_C8, COMBAT_C3 } from "../periodisation_combat.js";
import { REFERENTIELS, CORRECTEURS } from "../referentiels.js";

// ── Morphologie & insertions (lecture coach) ────────────────────────────────
export const BOT_MORPHO = `LECTURE MORPHOLOGIQUE (à l'œil de coach, jamais de mesure) :
${REPERES_VISUELS}
CONSÉQUENCES CLASSIQUES : fémurs longs → buste qui plonge au squat → hack squat/presse/belt squat. Humérus longs → leviers défavorables aux poussées, fatigue triceps élevée → haltères, machines convergentes, ne pas surcharger la barre. Cage plate → pull-over hebdomadaire, prudence en étirement extrême. Clavicules étroites → le V-taper passe par les deltoïdes latéraux et la largeur du dos. Bassin étroit → lombaires moins protégés au squat → gainage systématique.
PONDÉRATION : la morphologie n'est JAMAIS un juge absolu — un exercice théoriquement défavorable sur lequel la personne progresse depuis des mois se garde. L'historique réel prime sur la théorie.`;

export const BOT_INSERTIONS = `INSERTIONS MUSCULAIRES (la clé du potentiel esthétique) :
Une insertion HAUTE = grand espace tendineux, muscle "court" difficile à remplir (biceps avec gap au pli du coude, mollets hauts perchés, pectoraux avec vide central près du sternum, ischios qui s'arrêtent avant le genou). Une insertion BASSE = ventre qui descend, aspect plein.
UNE INSERTION NE SE CHANGE PAS : on maximise le ventre musculaire existant et on gère les attentes honnêtement. Biceps court → curls bras en avant (pupitre) pour le galbe, incliné 45° pour le chef long. Pecs à vide central → convergents où les mains se rejoignent (câbles, haltères), car la barre fixe les mains. Mollets hauts → amplitude maximale, étirement 2 s en bas, fréquence élevée — potentiel limité à annoncer.
VRAI point faible (insertion, variation structurelle) = plafond génétique. FAUX point faible (mauvais recrutement, mauvais exercice pour l'anatomie) = rattrapable par angle, matériel, pré-fatigue, segmentation.
${VARIATION_MUSCULAIRE}`;

// ── Pathologies & sécurité ──────────────────────────────────────────────────
export const BOT_PATHO = `ADAPTATIONS PAR PATHOLOGIE (l'IA adapte l'entraînement, elle ne diagnostique NI ne soigne — douleur persistante → professionnel de santé) :
${Object.entries(REGLES_PATHO).map(([k, v]) => `• ${k} : ${v}`).join("\n")}
RÈGLES TRANSVERSES : douleur articulaire/tendineuse > 48-72 h = signal pathologique, jamais "no pain no gain". Tendons et fascias récupèrent 2-4× plus lentement que le muscle. ≥ 45 ans : échauffement long, progression +2,5 kg max, amplitudes confortables.
${SECURITE_LOMBAIRE}`;

export const BOT_EPAULE_DOS_C7 = `ÉPAULE & DOS — LES DEUX ZONES LES PLUS EXPOSÉES (C7) :
- ~75 % des pathologies d'épaule en musculation viennent du CONFLIT SOUS-ACROMIAL : trop de mouvements bras au-dessus de la tête — le tendon du supra-épineux s'écrase contre le toit de l'articulation. Ce n'est pas le hasard : ce sont des positions que l'épaule ne tolère pas en répétition. Préservation : limiter le volume au-dessus de la tête, travailler dans le plan scapulaire, renforcer la coiffe (rotations externes, face pull), équilibrer tirage ≥ poussée.
- Le dos est le groupe le plus COMPLEXE : programmer LARGEUR (tractions, tirages verticaux) ET ÉPAISSEUR (rowings, tirages horizontaux buste soutenu) SÉPARÉMENT — ne pas tout miser sur les tractions, qui sont parmi les exercices les plus traumatisants pour l'épaule et le coude quand on charge trop tôt.`;

// ── Exercices par muscle (référentiels) ─────────────────────────────────────
export const BOT_REF_PECS    = REFERENTIELS.pectoraux;
export const BOT_REF_DOS     = REFERENTIELS.dos + "\n" + BOT_EPAULE_DOS_C7;
export const BOT_REF_JAMBES  = REFERENTIELS.jambes;
export const BOT_REF_BRAS    = REFERENTIELS.bras + "\n\n" + VALGUS_MATERIEL;
export const BOT_CORRECTEURS = CORRECTEURS + "\n\n" + TECHNIQUES_PAR_MUSCLE;

// ── Progression & stagnation ────────────────────────────────────────────────
export const BOT_STAGNATION = `PROGRESSION & STAGNATION (méthode MorphoCoach) :
- Verdict sur une fenêtre des 4 dernières séances, seuil ±2 % sur la meilleure charge. Exemple : 60 → 62,5 → 65 → 65 → 65 → 65 = STAGNATION.
- Une stagnation n'est pas un échec : c'est l'information que le stimulus est ÉPUISÉ. La réponse est TOUJOURS un changement de stimulus (variante du même pattern : angle/prise/matériel différent, OU changement radical de plage de reps, OU rest-pause) — jamais "essaie plus fort".
- Régression → réduire le volume 2 semaines OU variante moins exigeante ; vérifier sommeil, fréquence, nutrition avant d'accuser l'exercice.
- Reprise après coupure : 3-6 semaines d'arrêt → charges −25/−35 %, volume minimal, aucun échec avant la 3e semaine, et c'est l'occasion PARFAITE de renouveler les exercices. Plus de 6 semaines → repartir sur une base quasi débutant 2 semaines.
${GRILLE_5_DIFFICULTES}
${STRUCTURE_RATTRAPAGE}
${DONNANT_DONNANT}`;

// ── Volume & structure ──────────────────────────────────────────────────────
export const BOT_VOLUME = `VOLUME, SÉRIES, REPOS (repères MorphoCoach) :
- Débutant : 3-4 séries de travail/exercice, RPE 5-7 (RIR 3-4), corps entier 3×/sem, AUCUNE technique d'intensification — la technique d'exécution est la priorité.
- Intermédiaire : 4-5 séries, RPE 7-8 (RIR 2-3), split PPL ou haut/bas, 1 technique d'intensification max par séance.
- Avancé : 5-6 séries, RPE 8-9 (RIR 1-2), split 4-6 jours, spécialisation possible.
- MEV = volume minimum pour progresser, MRV = volume maximum récupérable : on progresse entre les deux, on ne vit pas au MRV.
- Plages de reps : force 1-6 · hypertrophie 6-12 · métabolique/perte de poids 12-20 · santé 12-15 confortable.
- Repos : composés lourds 2-3 min, isolations 60-90 s, circuits 30-60 s.
- RPE = difficulté perçue /10 ; RIR = répétitions en réserve. RPE 8 = RIR 2.
- Deload OBLIGATOIRE toutes les 4-8 semaines : volume −40/50 %, intensité −10/20 %.
- Tempo : le 3-1-3 sur les isolations construit la connexion ; l'excentrique contrôlé protège les tissus.`;

// ── Périodisation & régimes ─────────────────────────────────────────────────
export const BOT_PERIODISATION = PUISSANCE_C8 + "\n\n" + REGIMES_CONTRACTION + `
MÉSOCYCLE TYPE (hypertrophie, 6 semaines) : S1-2 accumulation (technique, RPE 6-7) → S3-4 intensification (+5 % ou +1 rep, RPE 7-8) → S5 surcharge (RPE 8-9) → S6 deload (volume −40 %). Un seul objectif dominant par bloc.`;

// ── Récupération ────────────────────────────────────────────────────────────
export const BOT_RECUP_COMPLET = `${SOMMEIL_VARIABLE}
${ECHAUFFEMENT_TEMPERATURE}
COURBATURES : d'origine fasciale, elles NE mesurent PAS l'efficacité d'une séance — ne pas les chercher, ne pas s'inquiéter de leur absence. Hiérarchie de récupération : nerf (12-48 h) < muscle (24-72 h) < fascia (48-168 h) < tendon (jours-semaines) — c'est le tendon qui limite les confirmés, pas le muscle. Sommeil dégradé = premier signe de surentraînement → réduire le volume AVANT que la performance chute.`;

// ── Techniques d'intensification ────────────────────────────────────────────
export const BOT_INTENSIFICATION = `${INTENSIFICATION_TRAUMATO}
${CONGESTION}
PRÉ-FATIGUE : utile pour créer la connexion sur un muscle mal ressenti (isolation avant le composé) — outil de recrutement, pas de performance. CLUSTERS : séries fractionnées 2×(3+3+3) avec mini-repos, réservées aux composés des pratiquants avancés — forte contrainte nerveuse.
${EMG_SELECTIONS}`;

// ── Mental & adhérence (C7) ─────────────────────────────────────────────────
export const BOT_MENTAL = `MENTAL & ADHÉRENCE (C7) :
- Se comparer À SOI-MÊME, jamais aux autres. Un objectif trop haut décourage (trop long à atteindre), trop bas démotive (rien de spécial) : calibrer sur la personne, pas sur un standard.
- Anti-patterns à désamorcer : chercher le "truc miracle des stars" au lieu des fondamentaux · rester stressé et dormir trop peu en pensant "gérer plus tard" · ne jamais se demander POURQUOI on mange (faim réelle vs émotionnelle). Les nommer avec bienveillance, JAMAIS culpabiliser — rendre la démarche la moins contraignante possible.
- Adhérence : le meilleur programme est celui qu'on FAIT. Séances trop longues → réduire à l'essentiel (≤ 60 min denses). Séances détestées → les intégrer en début de séance mixte plutôt qu'en séance dédiée qu'on sautera.`;

export const BOT_COMBAT_EXPERT = COMBAT_C3;
