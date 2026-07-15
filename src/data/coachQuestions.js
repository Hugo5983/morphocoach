// @ts-check
// ─── BANC DE QUESTIONS DU COACH ─────────────────────────────────────────────
// Questions suggérées pour le chat, couvrant TOUTE la base de connaissances
// MorphoCoach (moteur + C1-C11 + référentiels). Formulées en voix utilisateur.
// Le serveur (/api/coach-chat) route la connaissance correspondante par
// mots-clés : chaque question ci-dessous a son module de réponse.

export const QUESTIONS_COACH = {

  morphologie: {
    titre:"Morphologie & leviers",
    emoji:"",
    questions: [
"Comment savoir si j'ai les fémurs longs et qu'est-ce que ça change pour le squat ?",
"J'ai les bras longs, quels exercices de pectoraux me conviennent le mieux ?",
"C'est quoi exactement un humérus long et pourquoi ça complique le développé couché ?",
"Pourquoi ma cage thoracique plate change le choix de mes exercices ?",
"J'ai des clavicules étroites, comment paraître plus large quand même ?",
"Un bassin large, c'est un avantage ou un inconvénient en musculation ?",
"Pourquoi le même exercice ne donne pas les mêmes résultats chez tout le monde ?",
"Comment un coach lit ma morphologie sans prendre aucune mesure ?",
"Fémur court et tibia long, c'est vrai que c'est la morphologie parfaite pour le squat ?",
"Est-ce que ma morphologie peut m'interdire certains exercices de base ?",
"Pourquoi on ne mesure jamais en centimètres dans MorphoCoach ?",
    ],
  },

  insertions: {
    titre:"Insertions musculaires",
    emoji:"",
    questions: [
"C'est quoi une insertion musculaire haute ou basse et pourquoi c'est si important ?",
"J'ai des biceps courts avec un trou au niveau du coude, je peux le combler ?",
"Mes mollets sont haut perchés, est-ce que je perds mon temps à les entraîner ?",
"Pourquoi j'ai un vide au milieu des pectoraux et comment le remplir ?",
"Est-ce qu'on peut changer une insertion musculaire avec l'entraînement ?",
"Comment savoir si mon point faible est génétique ou juste mal travaillé ?",
"C'est quoi la différence entre un vrai et un faux point faible ?",
"Mes ischios s'arrêtent haut au-dessus du genou, comment les développer ?",
"Pourquoi certains ont des abdos en 6 et d'autres en 8 ?",
    ],
  },

  materiel: {
    titre:"Choix du matériel",
    emoji:"",
    questions: [
"Pourquoi la barre droite me fait mal aux poignets sur les curls ?",
"C'est quoi le valgus du coude et comment savoir si j'en ai un ?",
"Barre EZ, haltères ou poulie : comment choisir pour les biceps ?",
"Pourquoi les machines à biceps ne conviennent pas à tout le monde ?",
"Quand est-ce que je devrais travailler à un bras plutôt qu'à deux ?",
"Haltères ou barre pour le développé couché, qu'est-ce qui est mieux pour moi ?",
"Machines guidées ou poids libres, lesquels choisir selon mon profil ?",
    ],
  },

  pectoraux: {
    titre:"Pectoraux",
    emoji:"",
    questions: [
"Pourquoi mes pectoraux ne se développent pas malgré le développé couché ?",
"Est-ce que je dois toucher la poitrine à chaque répétition au développé ?",
"Comment développer le haut des pectoraux qui est en retard ?",
"Le rebond de la barre sur la poitrine, c'est vraiment dangereux ?",
"Pause sur le torse ou enchaîner les répétitions, qu'est-ce qui est mieux ?",
"Pourquoi les écartés à la poulie comblent le centre des pecs mieux que la barre ?",
"Comment continuer à entraîner mes pecs avec une épaule douloureuse ?",
"Coudes écartés ou serrés au développé, qu'est-ce que ça change ?",
    ],
  },

  dos: {
    titre:"Dos",
    emoji:"",
    questions: [
"Quelle est la différence entre la largeur et l'épaisseur du dos ?",
"Tirage devant ou tirage nuque, lequel est le meilleur pour le dos ?",
"Prise large ou prise serrée aux tractions, qu'est-ce que ça change ?",
"C'est quoi le grand rond et pourquoi on dit qu'il dort chez la plupart des gens ?",
"Pourquoi je ne sens pas mon dos travailler sur les rowings ?",
"Comment avoir un dos en V malgré des épaules étroites ?",
"Les tractions sont-elles dangereuses pour les épaules ?",
"Mon dos manque d'épaisseur, quels exercices prioriser ?",
    ],
  },

  jambes: {
    titre:"Jambes",
    emoji:"",
    questions: [
"Pourquoi mon buste plonge en avant quand je squatte ?",
"Hack squat ou presse à 45°, lequel choisir si le squat barre ne me convient pas ?",
"Front squat ou back squat, lequel est le plus sûr pour mes genoux ?",
"Comment isoler les ischios sans matériel spécifique ?",
"Pointe de pied tendue ou vers soi au leg curl, ça change quoi ?",
"Pourquoi le squat ne suffit pas pour développer tout le quadriceps ?",
"C'est quoi le droit fémoral et pourquoi il faut incliner le buste au leg extension ?",
"Le leg extension lourd est-il mauvais pour les genoux ?",
"Comment travailler mes mollets pour maximiser mes chances de les faire grossir ?",
    ],
  },

  bras_epaules: {
    titre:"Bras & épaules",
    emoji:"",
    questions: [
"Pourquoi mes biceps ne poussent pas malgré tous mes curls ?",
"Curl pupitre ou curl incliné, lequel cible quel chef du biceps ?",
"Comment élargir mes épaules si les clavicules ne s'élargissent pas ?",
"Pourquoi je triche des trapèzes sur mes élévations latérales ?",
"Comment rattraper l'arrière d'épaule qui est toujours en retard ?",
"Quel exercice pour le chef long du triceps ?",
"Le développé nuque est-il vraiment dangereux ?",
"Pourquoi le drop set marche particulièrement bien sur les épaules ?",
    ],
  },

  securite: {
    titre:"Sécurité & douleurs",
    emoji:"",
    questions: [
"J'ai mal à l'épaule quand je pousse au-dessus de la tête, qu'est-ce que je peux faire ?",
"C'est quoi le conflit sous-acromial dont tout le monde parle ?",
"Quels exercices éviter avec une lombalgie ?",
"Comment continuer la musculation avec une hernie discale ?",
"La ceinture de force sert vraiment à quelque chose ?",
"Pourquoi le soulevé de terre est-il si risqué en fin de série ?",
"Quels exercices adapter quand on a un problème de ménisque ?",
"J'ai une tendinite au coude, je dois arrêter les bras complètement ?",
"Une douleur qui dure depuis 3 jours après la séance, c'est normal ?",
"Pourquoi les tendons récupèrent plus lentement que les muscles ?",
"À partir de quel âge faut-il adapter son entraînement et comment ?",
"Le face pull à chaque séance, pourquoi c'est si recommandé ?",
    ],
  },

  progression: {
    titre:"Progression & stagnation",
    emoji:"",
    questions: [
"Je stagne au développé couché depuis 6 séances, qu'est-ce que je fais ?",
"Comment savoir si un exercice ne fonctionne plus pour moi ?",
"Pourquoi changer d'exercice quand on stagne plutôt que forcer plus ?",
"Je régresse sur certains exercices, c'est grave ?",
"C'est quoi la méthode des 5 difficultés pour analyser un muscle en retard ?",
"Comment structurer un cycle de rattrapage pour un point faible ?",
"Pourquoi ne pas ajouter du volume directement sur un muscle en retard ?",
"C'est quoi la théorie du donnant-donnant ?",
"Combien de temps doit durer un programme avant d'en changer ?",
"Reprendre après 6 semaines d'arrêt, comment je m'y prends ?",
    ],
  },

  volume: {
    titre:"Volume, séries & repos",
    emoji:"",
    questions: [
"Combien de séries par muscle et par semaine selon mon niveau ?",
"C'est quoi le MEV et le MRV dont parlent les coachs ?",
"Combien de temps de repos entre les séries selon mon objectif ?",
"C'est quoi le RPE et le RIR et comment les utiliser ?",
"Quel tempo d'exécution choisir et qu'est-ce que ça change ?",
"6-8, 8-12 ou 15-20 répétitions : quelle plage pour quel objectif ?",
"Full body, half body ou split : que choisir selon mes jours disponibles ?",
"Pourquoi un débutant ne devrait pas utiliser de techniques d'intensification ?",
"C'est quoi un deload et pourquoi c'est obligatoire ?",
    ],
  },

  periodisation: {
    titre:"Périodisation & planification",
    emoji:"",
    questions: [
"C'est quoi un mésocycle et comment il se structure ?",
"C'est quoi la périodisation par blocs ?",
"Comment estimer mon 1RM sans faire de max ?",
"Force d'abord ou masse d'abord, dans quel ordre progresser ?",
"Pourquoi la force maximale est la mère de toutes les qualités ?",
"Comment développer l'explosivité sans matériel de compétition ?",
"Concentrique, excentrique, isométrique : quel régime pour quel objectif ?",
"Le travail excentrique est-il vraiment plus efficace pour la force ?",
"Comment intégrer le cardio sans perdre de muscle ?",
    ],
  },

  recuperation: {
    titre:"Récupération & sommeil",
    emoji:"",
    questions: [
"Les courbatures veulent dire que ma séance était efficace ?",
"Pourquoi le sommeil est la variable la plus importante de la récupération ?",
"Comment reconnaître un début de surentraînement ?",
"Combien de temps de récupération entre deux séances du même muscle ?",
"Pourquoi j'ai plus mal aux articulations quand il fait froid ?",
"L'échauffement est-il vraiment indispensable si je suis pressé ?",
"C'est quoi le rôle de la mélatonine dans la récupération ?",
"Pourquoi mes tendons me limitent plus que mes muscles ?",
    ],
  },

  techniques: {
    titre:"Techniques avancées",
    emoji:"",
    questions: [
"C'est quoi l'électrostimulation et à quoi ça sert vraiment ?",
"L'entraînement sous occlusion, ça marche vraiment avec des charges légères ?",
"C'est quoi la potentiation et comment l'utiliser avant un effort explosif ?",
"Drop set, rest-pause, superset : lesquels sont les plus traumatisants ?",
"C'est quoi la congestion et comment la maximiser en fin de séance ?",
"La pré-fatigue, c'est utile ou c'est un mythe ?",
"Pourquoi limiter les techniques d'intensification à une par séance ?",
"C'est quoi un cluster set et pour qui c'est fait ?",
    ],
  },

  combat: {
    titre:"Sports de combat",
    emoji:"",
    questions: [
"La musculation rend-elle vraiment plus lent en boxe ?",
"Pourquoi la vitesse de relâchement musculaire différencie les experts ?",
"Pourquoi un combattant ne devrait jamais aller à l'échec musculaire ?",
"Comment la force maximale augmente la puissance de frappe ?",
"À quoi servent les élastiques dans l'entraînement du combattant ?",
"Comment travailler l'endurance de préhension pour le grappling ?",
"Les circuits d'entraînement, pourquoi c'est l'outil du combattant ?",
"Comment respirer pendant un circuit intense ?",
    ],
  },

  nutrition: {
    titre:"Nutrition",
    emoji:"",
    questions: [
"Combien de protéines par jour selon mon poids et mon objectif ?",
"Dans quel ordre construire mes macros ?",
"Combien de glucides selon mon volume d'entraînement ?",
"C'est quoi la différence entre un refeed et un cheat meal ?",
"Comment faire une sèche sans perdre de muscle ?",
"Pourquoi ne jamais descendre trop bas en lipides même en sèche ?",
"Manger plus de 3 g de protéines par kilo, c'est utile ?",
"Le cardio à jeun brûle-t-il vraiment plus de graisse ?",
"C'est quoi la zone brûle-graisse et pourquoi c'est un mythe ?",
"Quoi manger avant et après l'entraînement ?",
    ],
  },

  complements: {
    titre:"Compléments",
    emoji:"",
    questions: [
"La créatine est-elle dangereuse et comment la prendre ?",
"Whey, caséine ou protéines végétales : que choisir ?",
"Les BCAA servent-ils vraiment à quelque chose ?",
"Quand prendre la caféine pour qu'elle soit efficace ?",
"Que boire pendant un effort de plus d'une heure ?",
"Le ratio glucides-protéines idéal après l'entraînement ?",
"Les boosters de testostérone, ça marche ?",
"C'est quoi le bicarbonate avant l'effort et pour qui ?",
    ],
  },

  mental: {
    titre:"Mental & motivation",
    emoji:"",
    questions: [
"Comment rester motivé quand les résultats sont lents ?",
"Pourquoi se comparer aux autres est le meilleur moyen d'abandonner ?",
"Comment savoir si je mange par faim réelle ou par émotion ?",
"Pourquoi chercher le programme miracle est un piège ?",
"Comment fixer un objectif ni trop haut ni trop bas ?",
"Séances trop longues, je décroche : comment adapter ?",
    ],
  },
};

/** Liste plate de toutes les questions. */
export function toutesLesQuestions() {
  return Object.values(QUESTIONS_COACH).flatMap(c => c.questions);
}

/** Tire n questions au hasard, réparties sur des catégories différentes. */
export function questionsAleatoires(n = 6) {
  const cats = Object.values(QUESTIONS_COACH).sort(() => Math.random() - 0.5);
  const out = [];
  let i = 0;
  while (out.length < n && i < cats.length * 3) {
    const cat = cats[i % cats.length];
    const q = cat.questions[Math.floor(Math.random() * cat.questions.length)];
    if (!out.includes(q)) out.push(q);
    i++;
  }
  return out;
}
