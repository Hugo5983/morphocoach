// ─── BIBLIOTHÈQUE D'EXERCICES (158 exercices / 13 groupes) ─── champ mat : haltères, barre, poulie, machine, poids de corps, élastique, bosu, TRX, kettlebell, accessoire
// variantes enrichies : {nom, note, muscles, niveau (Débutant/Intermédiaire/Avancé), tips?, erreurs?} — 617 variantes reconnues, aucune variante de tempo/pause/charge

export const EX={
"Pectoraux":[
{n:"Développé haltères incliné 30°",s:"4",r:"8-10",rest:"90s",ch:"60-70%",cat:"principal",mat:"haltères",
morpho:" Humérus longs : haltères indispensables — la barre impose une trajectoire fixe incompatible avec les bras longs et crée un conflit sous-acromial. Les haltères permettent une rotation naturelle du poignet tout au long du mouvement.\nHumérus courts : haltères ou barre possible. La barre est plus stable pour charger lourd.\nCage plate/étroite : préférer l'incliné à 30-45° pour cibler les fibres claviculaires et donner de l'épaisseur visuelle au haut du torse.\nCage large/bombée : le plat ou le décliné conviendront mieux pour le volume global.\nClavicules larges : excellent exercice — le levier naturel favorise l'amplitude et le recrutement musculaire.\nClavicules courtes : réduire légèrement l'écartement pour plus d'activation.",
tips:["Omoplates pressées et rétractées sur le banc du début à la fin — ne jamais les laisser décoller","Rotation des poignets de pronation vers semi-supination pendant la montée pour suivre la trajectoire naturelle","Descendre jusqu'à ressentir l'étirement des pectoraux — coudes à environ 45° du torse","Expirer à la poussée, inspirer en descendant lentement 2-3 secondes","Contraction 1 seconde en haut sans verrouiller les coudes pour maintenir la tension"],
variantes:[
{nom:"Développé haltères plat",note:"Banc horizontal — la trajectoire perpendiculaire au buste déplace le travail vers le chef sternal",muscles:"Pectoraux portion moyenne",niveau:"Débutant"},
{nom:"Développé haltères décliné",note:"Banc décliné 15-30° — la trajectoire descendante cible les fibres abdominales du pectoral",muscles:"Bas des pectoraux",niveau:"Intermédiaire"},
{nom:"Développé incliné barre",note:"Trajectoire fixe qui permet de charger plus lourd, au prix de la liberté d'épaule",muscles:"Haut des pectoraux, triceps",niveau:"Intermédiaire",erreurs:["Barre qui descend vers le cou au lieu du haut de la poitrine"]},
{nom:"Développé incliné prise neutre",note:"Paumes face à face, coudes le long du corps — stress articulaire minimal sur l'épaule",muscles:"Haut des pectoraux, triceps, deltoïde antérieur",niveau:"Débutant"},
{nom:"Développé incliné unilatéral",note:"Un haltère à la fois — le tronc lutte contre la rotation pendant toute la poussée",muscles:"Haut des pectoraux, obliques (anti-rotation)",niveau:"Avancé"},
{nom:"Développé incliné machine convergente",note:"Trajectoire guidée en arc — apprentissage de la contraction sans gestion de l'équilibre",muscles:"Haut des pectoraux",niveau:"Débutant"}],
erreurs:["Arquer excessivement le bas du dos pour soulever plus lourd — perd le travail pectoral","Verrouiller les coudes en haut — supprime la tension et fragilise l'articulation","Descente incontrôlée et rapide — risque tendineux important","Coudes perpendiculaires au torse (à 90°) — conflit sous-acromial garanti"]},

{n:"Pull-over haltère couché",s:"4",r:"12-15",rest:"60s",ch:"Léger-modéré",cat:"isolation",mat:"haltères",
morpho:" Cage plate ou étroite : exercice PRIORITAIRE — c'est l'un des seuls mouvements capable d'élargir la cage thoracique sur le long terme si pratiqué régulièrement avec une inspiration profonde. Intégrer systématiquement.\nCage large/bombée : exercice utile pour le grand dorsal et les pectoraux mais l'effet d'expansion est moindre.\nBras longs : amplitude naturellement grande — descendre progressivement pour éviter le stress à l'épaule.\nBras courts : moins d'étirement naturel — compenser en descendant encore plus loin derrière la tête.\nÉpaules fragiles ou antépulsion : commencer très léger et privilégier la sensation d'étirement plutôt que la charge.",
tips:["Bras légèrement fléchis et angle FIXE tout au long — ne jamais les plier davantage en cours de mouvement","Descendre le plus bas possible derrière la tête pour maximiser l'étirement thoracique","Inspirer profondément en bas et retenir l'air brièvement pour l'expansion costale","Remonter lentement en arc de cercle en soufflant progressivement","La sensation d'ouverture de la cage est le critère de qualité de l'exercice"],
variantes:[
{nom:"Pull-over en travers du banc",note:"Épaules seules posées, bassin bas — amplitude thoracique et étirement accrus",muscles:"Grand pectoral, grand dorsal, dentelé",niveau:"Intermédiaire"},
{nom:"Pull-over barre EZ",note:"Prise bilatérale sur barre coudée — répartition symétrique et poignets plus neutres",muscles:"Pectoraux, grand dorsal",niveau:"Intermédiaire"},
{nom:"Pull-over poulie haute debout",note:"Bras tendus, tension continue de la poulie — isolation du grand dorsal sans relâche en haut",muscles:"Grand dorsal dominant",niveau:"Débutant"},
{nom:"Pull-over coudes fléchis",note:"Flexion de coudes maintenue — amplitude d'épaule réduite, accent transféré vers les pectoraux",muscles:"Pectoraux, triceps longue portion",niveau:"Débutant"}],
erreurs:["Charger trop lourd — les épaules compensent et les pectoraux ne travaillent plus","Fléchir les coudes en cours de mouvement — l'exercice devient une extension des triceps","Amplitude insuffisante en bas — perte du bénéfice d'expansion thoracique","Vitesse trop rapide — c'est la sensation d'étirement qui produit les résultats"]},

{n:"Écarté poulie basse croisée",s:"3",r:"12-15",rest:"60s",ch:"Léger-40%",cat:"isolation",mat:"poulie",
morpho:" Bras longs : tension constante de la poulie est supérieure aux haltères car elle neutralise le désavantage biomécanique du bras long en bas du mouvement.\nBras courts : haltères ou poulie indifféremment, les deux fonctionnent bien.\nCage plate : angle bas (poulie au sol) pour cibler les fibres inférieures et donner du volume au bas des pecs.\nCage large : angle intermédiaire ou écarté haltères suffisent.\nAntépulsion épaules : vérifier que les omoplates restent rétractées tout au long — ne jamais laisser les épaules avancer.",
tips:["Légère flexion des coudes fixe et constante tout au long — angle immuable","Contraction de 1-2 secondes en haut avant de redescendre — c'est là que le muscle travaille le plus","Angle de la poulie détermine la zone ciblée : bas = chef inférieur / horizontal = chef moyen / haut = chef supérieur","Trajectoire en arc de cercle — imaginer enserrer un tonneau avec les bras","La poussée vient de l'épaule et du pectoral, pas du bras"],
variantes:[
{nom:"Écarté poulie mi-hauteur",note:"Câbles à hauteur d'épaules — trajectoire horizontale ciblant la portion moyenne",muscles:"Pectoraux portion moyenne",niveau:"Débutant"},
{nom:"Écarté poulie haute descendante",note:"Câbles au-dessus des épaules, mains qui convergent vers le bas — fibres abdominales",muscles:"Bas des pectoraux",niveau:"Débutant"},
{nom:"Écarté poulie unilatéral",note:"Un câble à la fois — amplitude au-delà de l'axe du corps et gainage anti-rotation",muscles:"Pectoral ciblé, obliques",niveau:"Intermédiaire"},
{nom:"Écarté poulie allongé sur banc",note:"Couché entre les colonnes — supprime tout élan du corps, tension pure sur le pectoral",muscles:"Pectoraux isolés",niveau:"Débutant"}],
erreurs:["Trop lourd — les épaules compensent et les pectoraux ne sont plus mobilisés","Coudes qui changent d'angle en cours de mouvement — perd l'isolation","Croiser trop les bras en haut — perte de tension et stress articulaire inutile"]},

{n:"Dips buste incliné",s:"4",r:"8-12",rest:"90s",ch:"Corps + lest",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : amplitude naturellement grande — descendre progressivement et contrôler soigneusement l'excentrique.\nBras courts : amplitude réduite — accentuer l'inclinaison du buste pour compenser.\nÉpaules fragiles / antépulsion : éviter ou remplacer par le développé haltères incliné — risque de conflit antérieur d'épaule.\nÉpaules saines et solides : excellent exercice polyarticulaire pour le bas des pectoraux.\nInclinaison = résultat : 15-20° en avant = pectoraux / buste vertical = triceps — ajuster selon l'objectif.",
tips:["Incliner le buste vers l'avant de 15 à 20° pour cibler les pectoraux — plus d'inclinaison = moins de triceps","Descendre jusqu'à ce que les bras soient parallèles au sol minimum — amplitude complète","Excentrique 3 secondes, pause 1 seconde en bas, puis poussée explosive","Coudes légèrement écartés dans le plan du mouvement — pas serrés comme pour les triceps","Rentrer légèrement le menton pour garder l'alignement cervical"],
variantes:[
{nom:"Dips buste vertical prise serrée",note:"Buste droit, coudes qui restent près du corps — la charge bascule des pectoraux vers les triceps",muscles:"Triceps dominants",niveau:"Intermédiaire"},
{nom:"Dips aux anneaux",note:"Prise instable en rotation libre — recrutement massif des stabilisateurs d'épaule",muscles:"Pectoraux, coiffe des rotateurs",niveau:"Avancé",erreurs:["Anneaux qui s'écartent en position basse par manque de contrôle"]},
{nom:"Dips barre droite",note:"Les deux mains sur une même barre, corps qui bascule devant — style street workout",muscles:"Pectoraux, deltoïde antérieur",niveau:"Avancé"},
{nom:"Dips entre bancs",note:"Mains derrière le dos, pieds au sol — régression accessible qui décharge une partie du poids",muscles:"Triceps, pectoraux",niveau:"Débutant"}],
erreurs:["Descente insuffisante — amplitude partielle = développement partiel des pectoraux","Balancement du corps pour tricher avec l'élan","Les épaules qui remontent vers les oreilles en bas — risque articulaire","Poignets trop fléchis sous la prise — stress poignet"]},

{n:"Développé couché barre",s:"4",r:"6-8",rest:"120s",ch:"75-80%",cat:"principal",mat:"barre",
morpho:" Humérus courts + cage large : exercice idéal — amplitude courte, bon levier, charge maximale possible.\nHumérus longs : exercice difficile et risqué — la trajectoire fixe de la barre force un étirement excessif à l'épaule. Préférer les haltères si la moindre douleur apparaît.\nClavicules larges : peut créer un conflit sous-acromial — réduire légèrement l'écartement de la prise.\nClavicules courtes : exercice confortable et efficace.\nCage plate : amplitude grande en bas — attention au tendon du grand pectoral en position étirée.",
tips:["Prise légèrement plus large que les épaules — ni trop large (épaules) ni trop serrée (triceps)","Rétracter les omoplates AVANT de débarrer la barre — position scapulaire clé","Descente contrôlée 2-3 secondes vers la poitrine basse (au niveau des mamelons)","Pont lombaire naturel maintenu — fesses sur le banc en permanence","Pousser la barre vers le haut ET légèrement vers la tête pour suivre la trajectoire naturelle"],
variantes:[
{nom:"Développé couché haltères",note:"Trajectoire libre et rotation des poignets possible — amplitude accrue et épaules préservées",muscles:"Pectoraux avec étirement accru",niveau:"Débutant"},
{nom:"Développé couché prise serrée",note:"Mains largeur d'épaules — les coudes longent le corps, la poussée devient triceps dominante",muscles:"Triceps, pectoraux internes",niveau:"Intermédiaire"},
{nom:"Développé incliné barre",note:"Banc à 30-45° — la poussée oblique recrute les fibres claviculaires",muscles:"Haut des pectoraux, deltoïde antérieur",niveau:"Intermédiaire"},
{nom:"Développé décliné barre",note:"Banc décliné — trajectoire descendante, amplitude courte et charge lourde possible",muscles:"Bas des pectoraux",niveau:"Intermédiaire"},
{nom:"Floor press",note:"Allongé au sol — les coudes butent contre le sol, moitié haute du mouvement isolée",muscles:"Triceps, pectoraux (portion de verrouillage)",niveau:"Intermédiaire",tips:["Marquer un léger arrêt coudes au sol sans relâcher la tension"]},
{nom:"Développé haltères prise neutre",note:"Paumes face à face — coudes serrés, trajectoire la plus tolérante pour l'épaule",muscles:"Pectoraux internes, triceps",niveau:"Débutant"}],
erreurs:["Rebond de la barre sur la poitrine — risque de déchirure tendon du grand pectoral","Décoller les fesses du banc pour soulever plus lourd — invalidant la technique","Poignets fléchis sous la barre — risque de blessure au poignet","Prise trop large — amplifie le conflit sous-acromial"]},

{n:"Écarté haltères plat",s:"3",r:"12-15",rest:"60s",ch:"Léger-40%",cat:"isolation",mat:"haltères",
morpho:" Bras longs : excellente amplitude d'étirement en bas — poids modéré pour protéger les tendons en position étirée.\nBras courts : moins d'étirement naturel — descendre encore plus loin pour compenser.\nCage plate : combiné au pull-over pour maximiser l'expansion thoracique.\nL'étirement en bas est la clé de l'exercice — la contraction en haut est secondaire.",
tips:["Légère flexion des coudes fixe tout au long — ne jamais les plier davantage","Descendre jusqu'à ressentir un étirement profond dans les pectoraux","Remonter en arc de cercle comme si on enserrait un tonneau","Contraction 1s en haut avant de redescendre","Excentrique très lent 3-4s — c'est là que l'étirement travaille"],
variantes:[
{nom:"Écarté haltères incliné",note:"Banc à 30° — l'arc de cercle se déplace vers les fibres claviculaires",muscles:"Haut des pectoraux",niveau:"Débutant"},
{nom:"Écarté haltères décliné",note:"Banc décliné — étirement et contraction orientés vers le bas du pectoral",muscles:"Bas des pectoraux",niveau:"Intermédiaire"},
{nom:"Floor fly",note:"Écarté au sol — l'amplitude est bornée par le sol, position d'étirement sécurisée",muscles:"Pectoraux, épaules protégées",niveau:"Débutant"},
{nom:"Écarté poulie vis-à-vis",note:"Câbles à la place des haltères — la tension ne disparaît plus en haut du mouvement",muscles:"Pectoraux en tension continue",niveau:"Débutant"}],
erreurs:["Trop lourd — les épaules compensent et les pecs ne travaillent plus","Plier les coudes en cours de mouvement — l'exercice devient un développé","Amplitude insuffisante en bas — perd le bénéfice de l'étirement"]},

{n:"Pompes lestées",s:"4",r:"10-20",rest:"90s",ch:"Corps + lest",cat:"principal",mat:"poids de corps",
morpho:" Tous morphotypes : exercice universel adapté à tous. Lester avec gilet ou sac si trop facile.\nBras longs : amplitude naturellement grande — descente lente et contrôlée indispensable.\nAntépulsion épaules : version mains larges plus adaptée que mains serrées.\nMains larges = pectoraux / mains à largeur épaules = équilibré / mains serrées = triceps + pec interne.",
tips:["Corps aligné de la tête aux talons — gainage actif","Descendre jusqu'à frôler le sol du torse","Coudes à 45° du corps — pas perpendiculaires","Poussée explosive en montant","Respiration : inspirer en descendant, expirer en poussant"],
variantes:[
{nom:"Pompes déficit sur poignées",note:"Mains surélevées sur poignées — la poitrine descend sous le niveau des mains, étirement maximal",muscles:"Pectoraux en amplitude complète",niveau:"Intermédiaire"},
{nom:"Pompes archer",note:"Un bras travaille, l'autre tendu sert de balancier — charge unilatérale sans lest",muscles:"Pectoral du bras fléchi",niveau:"Avancé"},
{nom:"Pompes pseudo-planche",note:"Mains reculées vers les hanches, épaules devant les mains — précurseur de la planche calisthenics",muscles:"Deltoïde antérieur, pectoraux, biceps (tendon)",niveau:"Avancé",erreurs:["Épaules pas assez avancées — l'exercice perd sa spécificité"]},
{nom:"Pompes aux anneaux",note:"Mains sur anneaux instables — les pectoraux stabilisent en plus de pousser",muscles:"Pectoraux, stabilisateurs d'épaule",niveau:"Avancé"}],
erreurs:["Hanches qui montent ou descendent — perd le gainage","Amplitude insuffisante — ne pas toucher le sol","Coudes perpendiculaires — conflit sous-acromial"]},

{n:"Machine convergente pectoraux",s:"3",r:"12-15",rest:"60s",ch:"60-70%",cat:"isolation",mat:"machine",
morpho:" Tous morphotypes : trajectoire guidée qui s'adapte à la plupart des morphologies.\nBras longs : très bonne option car la machine suit une trajectoire en arc naturel.\nCage plate : angle de la machine ajusté pour cibler les fibres claviculaires en priorité.\nIdéal pour débuter et apprendre la sensation de contraction pectorale.",
tips:["Régler les bras à hauteur des épaules pour le chef moyen — plus bas pour le chef inférieur","Contraction maximale 2s en position fermée","Excentrique contrôlé 2-3s — résister à la machine","Coudes légèrement fléchis et fixes","Penser à pousser avec les pectoraux, pas avec les bras"],
variantes:[
{nom:"Développé machine verticale assis",note:"Poussée horizontale à trajectoire strictement guidée — isolation maximale sans équilibre",muscles:"Pectoraux portion moyenne",niveau:"Débutant"},
{nom:"Pec deck (butterfly)",note:"Coudes ou avant-bras sur les pads, mouvement d'adduction pure — aucune participation du triceps",muscles:"Pectoraux isolés",niveau:"Débutant"},
{nom:"Machine convergente inclinée",note:"Dossier incliné — la convergence remonte vers les fibres claviculaires",muscles:"Haut des pectoraux",niveau:"Débutant"},
{nom:"Machine convergente unilatérale",note:"Un bras à la fois — correction des asymétries avec trajectoire sécurisée",muscles:"Pectoral ciblé",niveau:"Débutant"}],
erreurs:["Régler trop large — stress articulaire en position ouverte","Ne pas aller en extension complète — perd l'étirement","Trop de charge — les épaules avancent"]},

{n:"Développé haltères décliné",s:"4",r:"10-12",rest:"75s",ch:"60-70%",cat:"principal",mat:"haltères",
morpho:" Bras longs : haltères indispensables — même logique qu'en plat, rotation naturelle du poignet.\nCage plate : moins prioritaire que l'incliné — à ajouter une fois le pull-over intégré.\nCage large/épaisse : excellent pour finir le bas des pectoraux.\nLe décliné cible le chef sternal inférieur — donne l'aspect de la séparation pectorale.",
tips:["Banc à 15-30° de déclin maximum — trop incliné = épaules","Omoplates rétractées et pressées sur le banc","Coudes à 45° du torse, jamais perpendiculaires","Contrôle excentrique 2-3s","Contraction maximale en haut sans verrouillage"],
variantes:[
{nom:"Développé décliné barre",note:"Version barre — charge supérieure sur une amplitude naturellement courte",muscles:"Bas des pectoraux, triceps",niveau:"Intermédiaire"},
{nom:"Développé haltères plat",note:"Retour à l'horizontale — répartition équilibrée sur l'ensemble du pectoral",muscles:"Pectoraux portion moyenne",niveau:"Débutant"},
{nom:"Dips buste incliné",note:"L'équivalent poids de corps du décliné — poussée descendante buste penché",muscles:"Bas des pectoraux",niveau:"Intermédiaire"},
{nom:"Développé décliné prise neutre",note:"Paumes face à face — coudes serrés et épaules épargnées sur la trajectoire déclinée",muscles:"Bas des pectoraux, triceps",niveau:"Débutant"}],
erreurs:["Trop de déclin : épaules et triceps dominent","Amplitude insuffisante en bas","Rebond"]},

{n:"Câble croisé debout",s:"3",r:"15",rest:"60s",ch:"Léger",cat:"isolation",mat:"poulie",
morpho:" Tous morphotypes : tension constante sur TOUT l'arc — supérieur aux haltères pour la contraction finale.\nCroiser les bras devant le sternum = contraction maximale des fibres internes. Ne pas dépasser la ligne médiane.",
tips:["Légère inclinaison du buste vers l'avant","Poignets légèrement fléchis vers l'intérieur en fin de mouvement","Contraction 2s au croisement","Excentrique lent 3s — résister à la tension","Garder la même légère flexion des coudes tout au long"],
variantes:[
{nom:"Croisé poulie mi-hauteur",note:"Câbles réglés à hauteur d'épaules — adduction horizontale pure",muscles:"Pectoraux portion moyenne",niveau:"Débutant"},
{nom:"Croisé poulie basse montante",note:"Câbles en bas, mains qui montent en diagonale — fibres claviculaires",muscles:"Haut des pectoraux",niveau:"Débutant"},
{nom:"Croisé câble unilatéral",note:"Un côté à la fois avec rotation du buste contrôlée — amplitude au-delà de la ligne médiane",muscles:"Pectoral ciblé, obliques",niveau:"Intermédiaire"},
{nom:"Croisé câble en fente",note:"Position de fente avant — base stable qui autorise des charges plus lourdes sans balancier",muscles:"Pectoraux",niveau:"Débutant"}],
erreurs:["Trop lourd — les épaules compensent","Pas de croisement en haut — perd la contraction maximale","Coudes qui bougent"]},

{n:"Pompes bulgares (pieds surélevés)",s:"4",r:"15-20",rest:"60s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Tous morphotypes : pieds surélevés = angle développé incliné — cible le chef supérieur des pectoraux.\nPlus fonctionnel et accessible que la machine — force le gainage simultanément.",
tips:["Pieds sur banc (30-40cm), mains à largeur des épaules","Corps en ligne droite — gainage actif tout au long","Descendre au maximum, menton vers le sol","Explosion à la montée","Variante avancée : lester avec gilet"],
variantes:[
{nom:"Pompes pieds surélevés prise large",note:"Mains bien au-delà des épaules — l'adduction domine, coudes plus sollicités en ouverture",muscles:"Pectoraux externes, haut des pectoraux",niveau:"Intermédiaire"},
{nom:"Pompes piquées (pike)",note:"Bassin haut en V inversé — la poussée devient verticale, transfert vers les épaules",muscles:"Deltoïdes, trapèzes",niveau:"Intermédiaire"},
{nom:"Pompes déficit pieds surélevés",note:"Mains sur poignées + pieds surélevés — étirement maximal du haut du pectoral",muscles:"Haut des pectoraux en amplitude complète",niveau:"Avancé"},
{nom:"Pompes archer pieds surélevés",note:"Travail unilatéral combiné à l'angle décliné — l'une des pompes les plus dures",muscles:"Haut du pectoral du bras fléchi",niveau:"Avancé"}],
erreurs:["Hanches qui montent — perd le gainage","Amplitude insuffisante — ne touche pas le sol","Coudes perpendiculaires au torse"]},

{n:"Pompes standards",s:"3-4",r:"10-20",rest:"60-90s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Tous morphotypes : exercice fondamental universel, échelle de progression complète du débutant à l'avancé.\nBras longs : amplitude naturellement grande — descente contrôlée 2-3s pour protéger l'épaule.\nCage plate/étroite : surélever les pieds pour recruter davantage les fibres claviculaires.\nProgression : pompes murales → genoux → standards → pieds surélevés → lestées.",
tips:["Corps aligné de la tête aux talons — bassin ni cambré ni relevé","Mains légèrement plus larges que les épaules, doigts vers l'avant","Coudes à 45° du torse pendant la descente — jamais perpendiculaires","Poitrine qui frôle le sol à chaque répétition","Gainage abdominal et fessier actif du début à la fin"],
variantes:[
{nom:"Pompes prise large",note:"Mains bien au-delà des épaules — course des coudes raccourcie, adduction d'épaule dominante",muscles:"Pectoraux externes",niveau:"Débutant"},
{nom:"Pompes prise serrée",note:"Mains largeur d'épaules ou moins, coudes au corps — la poussée bascule sur les triceps",muscles:"Triceps, pectoraux internes",niveau:"Débutant"},
{nom:"Pompes diamant",note:"Pouces et index en triangle sous le sternum — flexion de coude maximale",muscles:"Triceps dominants",niveau:"Intermédiaire"},
{nom:"Pompes archer",note:"Un bras fléchit, l'autre reste tendu sur le côté — charge quasi unilatérale",muscles:"Pectoral et triceps du bras actif",niveau:"Avancé"},
{nom:"Pompes piquées (pike)",note:"Bassin haut, buste vertical — la poussée cible les épaules et non plus la poitrine",muscles:"Deltoïdes, trapèzes",niveau:"Intermédiaire"},
{nom:"Pompes Spiderman",note:"Un genou monte vers le coude pendant la descente — rotation et gainage dynamique ajoutés",muscles:"Pectoraux, obliques, fléchisseurs de hanche",niveau:"Intermédiaire"},
{nom:"Pompes hindu (dive bomber)",note:"Vague du pike vers le cobra en frôlant le sol — enchaînement de plans de poussée",muscles:"Épaules, pectoraux, triceps, mobilité thoracique",niveau:"Intermédiaire"},
{nom:"Pompes pseudo-planche",note:"Mains au niveau des hanches, épaules très avancées — base de la planche en calisthenics",muscles:"Deltoïde antérieur, pectoraux",niveau:"Avancé"},
{nom:"Pompes aux anneaux ou TRX",note:"Appuis instables en rotation libre — stabilisation permanente pendant la poussée",muscles:"Pectoraux, coiffe des rotateurs, dentelé",niveau:"Avancé"},
{nom:"Pompes pieds surélevés",note:"Pieds sur banc — la poussée s'oriente vers le haut du corps",muscles:"Haut des pectoraux, épaules",niveau:"Intermédiaire"},
{nom:"Pompes mains surélevées",note:"Mains sur support — charge réduite et accent porté vers le bas des pectoraux",muscles:"Bas des pectoraux",niveau:"Débutant"}],
erreurs:["Bassin qui s'affaisse — lombaires en danger","Amplitude partielle — la poitrine ne descend pas assez","Tête qui plonge vers le sol au lieu de rester alignée"]},

{n:"Pompes archer",s:"3",r:"6-10/côté",rest:"90s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : excellent transfert — le grand bras de levier renforce le travail unilatéral.\nBras courts : réduire l'écartement des mains pour garder une trajectoire confortable.\nDéséquilibre gauche/droite : exercice correctif de référence en poids de corps — chaque côté travaille quasi seul.\nÉtape clé vers la pompe à un bras.",
tips:["Mains très écartées, pointées légèrement vers l'extérieur","Descendre vers une main, l'autre bras reste tendu comme un arc","Garder les hanches parallèles au sol — ne pas pivoter","Pousser fort sur le bras plié pour remonter au centre","Alterner les côtés ou faire toutes les reps d'un côté puis l'autre"],
variantes:[
{nom:"Pompe à un bras",note:"Le bras libre quitte le sol — l'aboutissement du travail unilatéral en poussée",muscles:"Pectoral, triceps, gainage anti-rotation",niveau:"Avancé",tips:["Écarter largement les jambes pour compenser la base réduite"]},
{nom:"Pompes archer pieds surélevés",note:"Angle décliné ajouté au travail unilatéral — charge accrue sur le haut du pectoral",muscles:"Haut du pectoral du bras actif",niveau:"Avancé"},
{nom:"Pompes archer sur anneaux",note:"Le bras tendu glisse sur un anneau mobile — contrôle et stabilité extrêmes",muscles:"Pectoraux, stabilisateurs",niveau:"Avancé"},
{nom:"Pompes typewriter",note:"Translation horizontale d'un bras à l'autre en position basse — passage continu entre les deux côtés",muscles:"Pectoraux en tension continue",niveau:"Avancé"}],
erreurs:["Rotation du bassin vers le bras tendu","Bras tendu qui plie et vole du travail","Amplitude réduite par peur de l'instabilité"]},

{n:"Développé élastique debout",s:"4",r:"12-15",rest:"60s",ch:"Élastique moyen/fort",cat:"principal",mat:"élastique",
morpho:" Humérus longs : trajectoire totalement libre — aucun conflit sous-acromial contrairement à la barre.\nÉpaules fragiles : la résistance progressive de l'élastique décharge le point bas, zone la plus risquée.\nTous types de cage : l'angle de poussée s'ajuste librement selon la morphologie.\nRésistance croissante = contraction maximale en fin de mouvement, idéal pour la connexion neuromusculaire.",
tips:["Élastique ancré derrière le dos ou dans un ancrage à hauteur d'épaules","Pousser vers l'avant en rapprochant légèrement les mains en fin de course","Buste gainé, léger pas d'écart pour la stabilité","Résister au retour 2-3s — l'excentrique est la clé avec l'élastique","Choisir une tension qui rend les 3 dernières reps difficiles"],
variantes:[
{nom:"Développé élastique unilatéral",note:"Un bras à la fois — le buste lutte contre la rotation à chaque poussée",muscles:"Pectoral ciblé, obliques",niveau:"Intermédiaire"},
{nom:"Développé élastique au sol",note:"Allongé, élastique sous le dos — version floor press à résistance progressive",muscles:"Pectoraux, triceps",niveau:"Débutant"},
{nom:"Développé élastique montant",note:"Ancrage bas, poussée en diagonale vers le haut — équivalent de l'incliné",muscles:"Haut des pectoraux",niveau:"Débutant"},
{nom:"Développé élastique descendant",note:"Ancrage haut, poussée vers le bas — équivalent du décliné",muscles:"Bas des pectoraux",niveau:"Débutant"},
{nom:"Pompes avec élastique dorsal",note:"Bande passée dans le dos pendant des pompes — surcharge progressive du mouvement poids de corps",muscles:"Pectoraux, triceps",niveau:"Intermédiaire"}],
erreurs:["Élastique trop faible — aucune tension en début de mouvement","Épaules qui remontent vers les oreilles","Buste qui pivote pendant la poussée"]},

{n:"Écarté élastique debout",s:"3",r:"15-20",rest:"45-60s",ch:"Élastique léger/moyen",cat:"isolation",mat:"élastique",
morpho:" Bras longs : bras de levier important — rester sur élastique léger et amplitude contrôlée.\nCage plate : ancrage bas et écarté montant pour cibler les fibres claviculaires.\nÉpaules enroulées : ouvrir grand en phase excentrique étire les pectoraux raides.\nTension constante impossible à obtenir avec des haltères en fin de course.",
tips:["Coudes légèrement fléchis et verrouillés dans cet angle","Rapprocher les mains devant le sternum en serrant les pectoraux","Contraction volontaire 1-2s bras rapprochés","Contrôler le retour — ne jamais laisser l'élastique claquer","Varier la hauteur d'ancrage pour cibler haut, milieu ou bas des pectoraux"],
variantes:[
{nom:"Écarté élastique ancrage haut",note:"Trajectoire descendante des mains — fibres abdominales du pectoral",muscles:"Bas des pectoraux",niveau:"Débutant"},
{nom:"Écarté élastique ancrage bas",note:"Trajectoire montante — fibres claviculaires",muscles:"Haut des pectoraux",niveau:"Débutant"},
{nom:"Écarté élastique unilatéral",note:"Un côté à la fois — amplitude qui traverse la ligne médiane du corps",muscles:"Pectoral ciblé",niveau:"Débutant"},
{nom:"Écarté élastique allongé",note:"Au sol, élastique passé sous le dos — isolation sans aucune participation des jambes",muscles:"Pectoraux isolés",niveau:"Débutant"}],
erreurs:["Plier les coudes pendant le mouvement — devient un développé","Trop de tension — amplitude sacrifiée","Épaules qui partent en avant en fin de contraction"]},

{n:"Pompes sur bosu",s:"3",r:"8-15",rest:"60-90s",ch:"Corps",cat:"gainage",mat:"bosu",
morpho:" Tous morphotypes : le recrutement des stabilisateurs (coiffe des rotateurs, dentelé) profite à toutes les structures.\nPoignets sensibles : mains sur les bords du dôme retourné = position neutre du poignet, souvent plus confortable.\nÉpaules instables : renforcement proprioceptif ciblé — usage correctif avant retour aux charges lourdes.\nL'instabilité réduit la charge maximale : c'est un outil de stabilité et de rééducation, pas de force max.",
tips:["Bosu côté plat vers le haut, mains sur les bords de la plateforme","Descendre plus lentement qu'une pompe classique — 3s","Gainage total : le bosu révèle immédiatement toute perte d'alignement","Stabiliser 1s en haut avant la répétition suivante","Maîtriser les pompes standards avant de passer à l'instable"],
variantes:[
{nom:"Pompes bosu dôme vers le haut",note:"Mains sur le dôme souple — instabilité modérée, bon point d'entrée",muscles:"Pectoraux, stabilisateurs",niveau:"Intermédiaire"},
{nom:"Pompes bosu plat vers le haut",note:"Mains sur la plateforme rigide qui oscille — le niveau d'instabilité maximal du bosu",muscles:"Pectoraux, coiffe, dentelé",niveau:"Avancé"},
{nom:"Pompes une main sur bosu",note:"Asymétrie d'appui — un côté stable, un côté instable, gainage anti-rotation",muscles:"Pectoraux, obliques",niveau:"Avancé"},
{nom:"Pompes sur médecine-ball",note:"Les deux mains serrées sur un ballon — combine prise serrée et instabilité",muscles:"Triceps, pectoraux internes, stabilisateurs",niveau:"Avancé"}],
erreurs:["Vitesse trop élevée — l'instabilité devient dangereuse","Bassin qui compense les oscillations","Passer au bosu sans maîtriser les pompes au sol"]},

{n:"Écarté TRX (chest fly)",s:"3",r:"8-12",rest:"90s",ch:"Corps (angle réglable)",cat:"principal",mat:"TRX",
morpho:" Bras longs : étirement profond en position ouverte — descendre progressivement, le levier est très défavorable.\nÉpaules saines requises : forte contrainte en position étirée, réserver aux pratiquants sans antécédent.\nCharge auto-ajustable : plus les pieds avancent sous l'ancrage, plus c'est dur — précision impossible avec des haltères.\nUn des rares exercices poids de corps qui reproduit l'écarté avec étirement complet.",
tips:["Corps rigide en planche inclinée, sangles tendues en permanence","Ouvrir les bras en arc jusqu'à l'étirement des pectoraux","Coudes légèrement fléchis, angle constant tout le mouvement","Refermer en serrant les pectoraux comme pour écraser un ballon","Régler la difficulté en avançant ou reculant les pieds"],
variantes:[
{nom:"Développé TRX (push-up sangles)",note:"Poussée bras qui fléchissent — la version pressée, plus accessible que l'écarté",muscles:"Pectoraux, triceps",niveau:"Intermédiaire"},
{nom:"Pompes pieds dans les sangles",note:"Pieds suspendus, mains au sol — l'instabilité passe au bas du corps, gainage intense",muscles:"Pectoraux, abdominaux profonds",niveau:"Avancé"},
{nom:"Écarté TRX unilatéral",note:"Un bras en écarté, l'autre en appui — anti-rotation extrême",muscles:"Pectoral actif, obliques",niveau:"Avancé"},
{nom:"Atomic push-up TRX",note:"Pompe pieds dans les sangles suivie d'un genoux-poitrine — poussée et flexion de tronc enchaînées",muscles:"Pectoraux, grand droit",niveau:"Avancé"}],
erreurs:["Descendre trop bas dès les premières séances — épaule en danger","Casser l'alignement du corps pour faciliter le retour","Sangles qui se détendent en cours de mouvement"]},
],

"Dos":[
{n:"Tractions pronation prise large",s:"4",r:"6-10",rest:"120s",ch:"Corps + lest",cat:"principal",mat:"poids de corps",
morpho:" Clavicules larges : avantage mécanique majeur sur les tractions — la largeur naturelle des épaules crée un levier favorable pour l'écartement dorsal.\nClavicules étroites : réduire légèrement la prise pour garder une trajectoire confortable.\nBras longs : étirement dorsal maximal en bas du mouvement — grande amplitude naturelle.\nBras courts : moins d'étirement en bas — compenser par une extension quasi-complète avant chaque répétition.\nMoins de 5 tractions propres : commencer par le tirage poulie haute avec exactement le même pattern, puis progresser vers les tractions.",
tips:["Initier le mouvement par la DÉPRESSION des omoplates vers les hanches AVANT de plier les coudes — règle fondamentale","Tirer les coudes vers les hanches, pas les mains vers soi — le dos travaille, pas les biceps","Excentrique 3-4 secondes pour maximiser le recrutement des dorsaux","Straps si la prise lâche avant les dorsaux — prioriser le muscle cible","Regarder légèrement vers le haut pour une trajectoire optimale"],
variantes:[
{nom:"Tractions supination (chin-up)",note:"Paumes vers soi — les biceps participent pleinement, le coude fléchit dans un plan plus favorable",muscles:"Grand dorsal, biceps",niveau:"Débutant"},
{nom:"Tractions prise neutre",note:"Paumes face à face — le compromis articulaire le plus confortable pour coudes et épaules",muscles:"Grand dorsal, brachial",niveau:"Débutant"},
{nom:"Tractions prise serrée pronation",note:"Mains largeur d'épaules — amplitude allongée et coude qui voyage davantage",muscles:"Grand dorsal (fibres basses), brachial",niveau:"Intermédiaire"},
{nom:"Tractions archer",note:"Un bras tire, l'autre reste quasi tendu sur le côté — étape vers la traction à un bras",muscles:"Dorsal du bras actif",niveau:"Avancé"},
{nom:"Tractions commando",note:"Prise mixte sur une barre dans l'axe du corps, la tête passe alternativement de chaque côté",muscles:"Dorsaux, biceps, gainage anti-rotation",niveau:"Avancé"},
{nom:"Sternum pull-up (Gironda)",note:"Buste qui bascule en arrière, le sternum touche la barre — la traction rejoint le rowing",muscles:"Dorsaux, trapèzes moyens, deltoïde postérieur",niveau:"Avancé"},
{nom:"Tractions L-sit",note:"Jambes tendues à l'horizontale pendant la traction — gainage de compression permanent",muscles:"Dorsaux, grand droit, fléchisseurs de hanche",niveau:"Avancé"},
{nom:"Tractions aux anneaux",note:"Prise en rotation libre qui passe de pronation à neutre — trajectoire naturelle du poignet",muscles:"Dorsaux, stabilisateurs d'épaule",niveau:"Intermédiaire"},
{nom:"Tractions à la serviette",note:"Mains sur serviettes suspendues — la préhension devient le facteur limitant",muscles:"Dorsaux, avant-bras, poigne",niveau:"Avancé"}],
erreurs:["Tirer avec les bras sans dépression scapulaire initiale — biceps dominent, dorsaux sous-sollicités","Amplitude partielle en bas — ne pas profiter de l'étirement qui active les dorsaux","Balancement du corps pour se propulser — exclut l'adaptation musculaire","Traction derrière la nuque : risque cervical et sous-acromial grave — à proscrire absolument"]},

{n:"Rowing haltère unilatéral",s:"4",r:"10-12",rest:"60s",ch:"60-70%",cat:"principal",mat:"haltères",
morpho:" Bras longs : amplitude de tirage naturellement plus grande qu'avec la barre — exploiter pleinement l'étirement en bas.\nBras courts : plier davantage le coude en haut pour atteindre la contraction maximale.\nAsymétries : exercice idéal pour corriger les déséquilibres gauche/droite — commencer toujours par le côté faible.\nTirage coude vers la hanche = grand dorsal / Tirage coude vers le plafond = trapèzes moyens — ajuster selon la zone à développer.",
tips:["Focus sur le COUDE qui remonte vers la hanche — penser à l'épaule qui descend, pas à la main qui monte","Amplitude complète : étirement maximal en bas, contraction forte en haut avec pause 1 seconde","Ne pas pivoter le buste — seul le bras travaille, le dos reste immobile","Genou et main ipsilatérale appuyés sur le banc pour une stabilité lombaire maximale","Excentrique contrôlé 2-3 secondes avant la prochaine répétition"],
variantes:[
{nom:"Rowing haltère coude ouvert",note:"Coude écarté à 60-80° du buste — le tirage remonte vers le haut du dos",muscles:"Trapèzes moyens, deltoïde postérieur",niveau:"Débutant"},
{nom:"Meadows row",note:"Extrémité de barre chargée (landmine), prise pronation par-dessus — étirement et rotation spécifiques",muscles:"Grand dorsal, trapèzes",niveau:"Avancé"},
{nom:"Rowing haltères appui poitrine",note:"Allongé ventre sur banc incliné — la triche lombaire devient impossible",muscles:"Dos isolé sans érecteurs",niveau:"Débutant"},
{nom:"Gorilla row",note:"Penché, deux kettlebells au sol, tirage alterné — conditionnement et gainage de hanche",muscles:"Dorsaux, érecteurs, grip",niveau:"Intermédiaire"}],
erreurs:["Rotation excessive du buste — les lombaires travaillent, pas le dos","Amplitude partielle en haut ou en bas — perd les bénéfices de l'exercice","Coudes trop écartés — les trapèzes prennent le dessus sur les dorsaux","Vitesse trop rapide — perte totale du contrôle excentrique"]},

{n:"Tirage poulie haute prise large",s:"4",r:"10-12",rest:"90s",ch:"60%",cat:"principal",mat:"poulie",
morpho:" Bras courts : exercice très efficace — moins de fatigue des biceps que les tractions, angle et charge facilement ajustables.\nBras longs : préférer les tractions ou réduire légèrement la prise pour une meilleure trajectoire.\nÉpaules fragiles : exercice plus sûr que les tractions — charge contrôlable à tout moment.\nTous morphotypes : prise pronation large = grand dorsal / prise serrée neutre = grand rond + teres major.",
tips:["Légère inclinaison du buste en arrière (10-15°) pour une trajectoire descendante naturelle","Tirer vers la clavicule — pas vers le sternum ni derrière la nuque","Contraction des dorsaux en position basse avant l'excentrique — ne pas relâcher immédiatement","Contrôle excentrique lent 2-3 secondes","Maintenir les coudes sous les mains tout au long du mouvement"],
variantes:[
{nom:"Tirage prise neutre serrée (V-bar)",note:"Coudes devant le corps, amplitude allongée — les fibres basses du dorsal dominent",muscles:"Grand dorsal (portion basse)",niveau:"Débutant"},
{nom:"Tirage supination",note:"Paumes vers soi — biceps engagés et coudes qui plongent vers les hanches",muscles:"Grand dorsal, biceps",niveau:"Débutant"},
{nom:"Tirage unilatéral poulie haute",note:"Une poignée à la fois avec légère inclinaison latérale — amplitude et étirement maximaux",muscles:"Dorsal ciblé, obliques",niveau:"Intermédiaire"},
{nom:"Tirage nuque",note:"La barre descend derrière la tête — réservé aux épaules très mobiles, amplitude contrôlée",muscles:"Trapèzes, dorsaux (fibres hautes)",niveau:"Avancé",erreurs:["À proscrire en cas de raideur d'épaule — la tête avance et les cervicales compensent"]},
{nom:"Tirage bras tendus (straight-arm)",note:"Coudes verrouillés, la barre descend vers les cuisses — isolation pure du dorsal sans biceps",muscles:"Grand dorsal isolé, dentelé",niveau:"Débutant"}],
erreurs:["Tirer derrière la nuque — risque cervical et sous-acromial grave, à proscrire","Élan du corps pour compenser la fatigue en fin de série","Coudes qui remontent trop haut — les épaules prennent le relais sur les dorsaux","Ne pas aller en extension quasi-complète en haut — perd l'étirement activateur"]},

{n:"Face pull poulie haute corde",s:"4",r:"15-20",rest:"45s",ch:"Léger",cat:"correctif",mat:"poulie",
morpho:" Antépulsion d'épaules (épaules qui partent en avant) : exercice CORRECTIF PRIORITAIRE — renforce les rotateurs externes et le deltoïde postérieur systématiquement sous-développés. À intégrer en début de séance de tirage ET en fin de séance de poussée.\nÉpaules équilibrées : exercice préventif excellent — maintenir l'équilibre antérieur/postérieur.\nTous morphotypes : exercice universel adapté à toutes les configurations. La charge doit rester très légère.",
tips:["Tirer vers le front — coudes hauts à hauteur des oreilles voire légèrement au-dessus","Rotation externe maximale à la fin : doigts qui pointent vers le plafond","Poids TRÈS léger — c'est la rotation externe qui produit le résultat, pas la charge","Séparer les cordes au maximum en fin de mouvement pour l'ouverture scapulaire","2 secondes de contraction en fin de mouvement pour l'effet correctif maximal"],
variantes:[
{nom:"Face pull poulie basse montant",note:"Tirage en diagonale du bas vers le visage — les trapèzes inférieurs entrent dans l'équation",muscles:"Trapèzes inférieurs, deltoïde postérieur",niveau:"Débutant"},
{nom:"Face pull unilatéral",note:"Une main à la fois — détecte et corrige les asymétries de rotation externe",muscles:"Coiffe des rotateurs du côté travaillé",niveau:"Intermédiaire"},
{nom:"Face pull élastique",note:"Version bande — réalisable quotidiennement en dehors de la salle",muscles:"Deltoïde postérieur, coiffe",niveau:"Débutant"}],
erreurs:["Trop lourd — le dos et les trapèzes prennent le relais, les rotateurs ne travaillent pas","Coudes qui descendent sous les épaules — perd la rotation externe","Ne pas terminer la rotation externe — exercice incomplet et inefficace","Buste qui se penche en arrière pour compenser le poids"]},

{n:"Rowing barre 45°",s:"4",r:"8-10",rest:"90s",ch:"65%",cat:"principal",mat:"barre",
morpho:" Fémurs longs : difficile de maintenir la position sans compenser avec le bas du dos — préférer le chest supported row ou le rowing haltère.\nFémurs courts : exercice confortable, bonne position naturelle.\nTirage vers le nombril = dorsaux prioritaires / Tirage vers la poitrine = trapèzes moyens et rhomboïdes — à adapter selon la zone à développer.\nAntépulsion épaules : veiller à ne jamais laisser les épaules rouler en avant pendant l'excentrique.",
tips:["Lordose naturelle maintenue ABSOLUMENT — le risque lombaire est majeur si le dos s'arrondit","Barbell tracé vers le nombril pour cibler les dorsaux en priorité","Cheating contrôlé acceptable uniquement en toute fin de série, jamais au début","Excentrique 2-3 secondes pour maximiser le recrutement musculaire","Visualiser les coudes qui remontent vers les hanches — pas les mains vers la poitrine"],
variantes:[
{nom:"Rowing Pendlay",note:"La barre repose au sol entre chaque répétition, buste horizontal — explosivité et remise à zéro du dos",muscles:"Dos complet, érecteurs",niveau:"Avancé"},
{nom:"Rowing barre supination",note:"Paumes vers l'avant, buste vers 45-70° — les biceps aident et le bas du dorsal domine",muscles:"Grand dorsal bas, biceps",niveau:"Intermédiaire"},
{nom:"Rowing T-bar",note:"Barre calée au sol, prise neutre serrée — trajectoire semi-guidée qui autorise du lourd",muscles:"Épaisseur du milieu du dos",niveau:"Intermédiaire"},
{nom:"Seal row",note:"Allongé à plat ventre sur banc surélevé — zéro participation lombaire, dos strictement isolé",muscles:"Dorsaux, trapèzes sans érecteurs",niveau:"Intermédiaire"},
{nom:"Rowing barre coudes ouverts prise large",note:"Tirage vers le bas de la poitrine coudes écartés — le haut du dos prend le dessus",muscles:"Trapèzes moyens, deltoïde postérieur",niveau:"Intermédiaire"}],
erreurs:["Arrondir le dos sous la charge — blessure lombaire grave et immédiate","Élan excessif dès le début de la série — annule le travail musculaire","Tirage trop haut vers le menton — les trapèzes supérieurs dominent","Amplitude partielle — ne profite pas de l'étirement en bas"]},

{n:"Pull-over poulie basse debout",s:"3",r:"12-15",rest:"60s",ch:"Léger",cat:"isolation",mat:"poulie",
morpho:" Tous morphotypes : tension constante sur tout l'arc de mouvement — supérieur au pull-over haltère pour cibler le grand dorsal.\nBras longs : amplitude maximale vers le haut — exploiter la longueur naturelle.\nÉpaules fragiles : version plus douce que les tirages — charge légère et contrôlée.\nGrand dorsal court : excellent exercice pour sentir le grand dorsal travailler en étirement complet.",
tips:["Bras tendus ou légèrement fléchis — angle fixe tout au long","Tirer vers les cuisses en expirant progressivement","Amplitude maximale vers le haut pour l'étirement complet du grand dorsal","Légère inclinaison du buste vers l'avant pour une meilleure activation","Contraction 1 seconde en bas avant de remonter lentement"],
variantes:[
{nom:"Pull-over poulie à la corde",note:"Prise neutre sur corde — rotation libre des poignets et contraction finale plus marquée",muscles:"Grand dorsal",niveau:"Débutant"},
{nom:"Pull-over poulie unilatéral",note:"Un bras — l'amplitude s'allonge et le dorsal s'étire davantage en haut",muscles:"Dorsal ciblé",niveau:"Intermédiaire"},
{nom:"Pull-over haltère couché",note:"Version haltère sur banc — l'étirement au-dessus de la tête devient le point fort",muscles:"Dorsal, pectoraux, dentelé",niveau:"Débutant"}],
erreurs:["Trop fléchir les coudes en cours de mouvement — les triceps prennent le travail","Amplitude insuffisante vers le haut — perd l'étirement activateur","Buste qui compense par flexion excessive du tronc"]},

{n:"Soulevé de terre roumain",s:"4",r:"6-8",rest:"120s",ch:"75-80%",cat:"principal",mat:"barre",
morpho:" Fémurs courts : exercice confortable — position naturellement verticale, bon levier.\nFémurs longs : difficile de garder le dos plat — Romanian deadlift haltères ou trap bar recommandés.\nChaîne postérieure complète : grand dorsal + trapèzes + érecteurs + ischios + fessiers — l'exercice le plus complet de la musculation.",
tips:["Lordose naturelle OBLIGATOIRE — si le dos s'arrondit, charge trop lourde","Barre au ras des tibias sur tout le trajet — ne pas l'éloigner du corps","Pieds à largeur des hanches, prise en pronation ou mixte","Engagement des dorsaux avant de tirer — penser à rentrer les omoplates","Poussée des jambes dans le sol plutôt que tirage vers le haut"],
variantes:[
{nom:"Soulevé de terre classique",note:"Départ barre au sol, genoux plus fléchis — les quadriceps participent au décollage",muscles:"Chaîne postérieure complète, quadriceps",niveau:"Intermédiaire"},
{nom:"Soulevé de terre jambes tendues",note:"Genoux quasi verrouillés — étirement maximal des ischios, réservé aux bonnes mobilités",muscles:"Ischio-jambiers en étirement",niveau:"Avancé"},
{nom:"Soulevé de terre sumo",note:"Pieds très écartés, prise entre les jambes — buste plus vertical, adducteurs recrutés",muscles:"Fessiers, adducteurs, quadriceps",niveau:"Intermédiaire"},
{nom:"Soulevé de terre trap bar",note:"Barre hexagonale, prise neutre sur les côtés — charge centrée, dos moins incliné",muscles:"Chaîne postérieure, quadriceps",niveau:"Débutant"},
{nom:"Soulevé de terre roumain unilatéral",note:"Une jambe d'appui — équilibre et stabilisateurs de hanche ajoutés",muscles:"Ischios, moyen fessier",niveau:"Intermédiaire"},
{nom:"Rack pull",note:"Départ barre posée sur supports à hauteur de genoux — verrouillage lourd de la moitié haute",muscles:"Trapèzes, érecteurs, grip",niveau:"Intermédiaire"}],
erreurs:["Arrondir le dos — blessure lombaire certaine","Barre qui s'éloigne du corps — levier défavorable","Hyperextension lombaire en haut — verrouiller les hanches suffit"]},

{n:"Tirage horizontal câble assis",s:"4",r:"10-12",rest:"75s",ch:"65%",cat:"principal",mat:"poulie",
morpho:" Fémurs longs : meilleure option que le rowing barre car la position assise neutralise les compensations du bas du dos.\nTous morphotypes : exercice complet pour les dorsaux moyens et inférieurs.\nPrise serrée neutre = grand dorsal + grand rond / prise large = trapèzes moyens + rhomboïdes.",
tips:["Dos droit, légère inclinaison arrière en tirant — pas de bascule excessive","Tirer vers le nombril avec les coudes bien le long du corps","Etirement complet en avant — laisser les omoplates s'écarter","Contraction maximale en fin de mouvement — serrer les omoplates","Excentrique contrôlé 2-3s"],
variantes:[
{nom:"Tirage horizontal prise large pronation",note:"Barre large, coudes ouverts vers la poitrine — épaisseur du haut du dos",muscles:"Trapèzes moyens, deltoïde postérieur",niveau:"Débutant"},
{nom:"Tirage horizontal à la corde",note:"Prise neutre avec écartement final des mains — rétraction scapulaire accentuée",muscles:"Rhomboïdes, trapèzes",niveau:"Débutant"},
{nom:"Tirage horizontal unilatéral",note:"Une poignée avec légère rotation du buste — amplitude et étirement du dorsal accrus",muscles:"Dorsal ciblé, obliques",niveau:"Intermédiaire"},
{nom:"Tirage horizontal supination",note:"Paumes vers le haut, coudes au corps — biceps et fibres basses du dorsal",muscles:"Dorsal bas, biceps",niveau:"Débutant"}],
erreurs:["Bascule excessive du buste pour prendre de l'élan","Coudes trop écartés — trapèzes supérieurs dominent","Amplitude insuffisante en avant — perd l'étirement activateur"]},

{n:"Tractions supination",s:"4",r:"6-10",rest:"120s",ch:"Corps + lest",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : meilleur recrutement biceps qui aide à compléter le mouvement malgré la longueur.\nBras courts : biceps moins impliqués — dorsaux plus isolés.\nClavicules larges : prise légèrement plus étroite que les tractions pronation pour optimiser la trajectoire.\nHybride biceps + grand dorsal — plus accessible que les tractions pronation pour progresser.",
tips:["Prise supination à largeur des épaules ou légèrement plus étroite","Initier par la dépression scapulaire avant de plier les coudes","Tirer les coudes vers les hanches — pas vers l'arrière","Chin above bar = amplitude complète — ne pas tricher avec un demi-mouvement","Excentrique 3-4s"],
variantes:[
{nom:"Tractions prise neutre",note:"Paumes face à face — coudes et poignets dans leur plan le plus naturel",muscles:"Dorsaux, brachial",niveau:"Débutant"},
{nom:"Tractions supination serrée",note:"Mains qui se touchent presque — flexion de coude maximale, biceps à saturation",muscles:"Biceps, dorsal bas",niveau:"Intermédiaire"},
{nom:"Tractions pronation",note:"Paumes vers l'avant — moins de biceps, dorsaux et grand rond en première ligne",muscles:"Grand dorsal, grand rond",niveau:"Intermédiaire"},
{nom:"Tractions supination aux anneaux",note:"La rotation libre part de pronation et finit en supination — le trajet articulaire idéal",muscles:"Dorsaux, biceps, stabilisateurs",niveau:"Intermédiaire"}],
erreurs:["Amplitude partielle — menton doit dépasser la barre","Balancement pour se propulser","Ne pas aller en extension complète en bas"]},

{n:"Deadlift roumain barre",s:"4",r:"6-8",rest:"120s",ch:"70-80%",cat:"principal",mat:"barre",
morpho:" Fémurs courts : exercice confortable — levier naturellement bon.\nFémurs longs : amplitude plus grande — descendre prudement et surveiller la lordose.\nLe grand dorsal est fortement activé comme stabilisateur. L'exercice le plus complet pour la chaîne postérieure.",
tips:["Lordose naturelle OBLIGATOIRE — si dos arrondi : trop lourd","Barre rase les tibias sur tout le trajet","Descendre jusqu'à mi-tibia maximum","Genoux légèrement fléchis et FIXES","Monter en poussant les hanches vers l'avant"],
variantes:[
{nom:"Romanian deadlift haltères",note:"Deux haltères le long des cuisses — trajectoire libre qui longe les jambes",muscles:"Ischios, fessiers",niveau:"Débutant"},
{nom:"RDL unilatéral",note:"Une jambe d'appui, la libre part en arrière — stabilité de hanche et équilibre",muscles:"Ischios, moyen fessier",niveau:"Intermédiaire"},
{nom:"RDL prise arrachée (snatch grip)",note:"Prise très large — le buste descend plus bas, amplitude et haut du dos sollicités",muscles:"Ischios, trapèzes, érecteurs",niveau:"Avancé"},
{nom:"Good morning",note:"Barre sur les trapèzes — même charnière de hanche avec bras de levier maximal",muscles:"Ischios, érecteurs du rachis",niveau:"Avancé"}],
erreurs:["Arrondir le dos — blessure certaine","Barre qui s'éloigne du corps","Hyperextension lombaire en haut"]},

{n:"Tirage coude au corps poulie basse",s:"4",r:"12-15",rest:"60s",ch:"Modéré",cat:"isolation",mat:"poulie",
morpho:" Tous morphotypes : cible le grand dorsal inférieur et les lombaires basses.\nTirage vers le ventre coudes serrés = grand dorsal pur. Un des meilleurs exercices de finition dorsale.",
tips:["Assis droit, dos légèrement incliné arrière en fin de mouvement","Coudes serrés le long du corps — pas écartés","Contraction maximale et scapulaire en fin de mouvement","Etirement complet — laisser les omoplates s'écarter","Excentrique 2-3s"],
variantes:[
{nom:"Tirage coude au corps unilatéral",note:"Une poignée — rotation du buste contrôlée et étirement complet du dorsal",muscles:"Dorsal ciblé",niveau:"Débutant"},
{nom:"Tirage coude au corps à la corde",note:"Prise neutre sur corde — fin de tirage avec écartement, contraction accentuée",muscles:"Dorsal, rhomboïdes",niveau:"Débutant"},
{nom:"Tirage coude au corps en fente",note:"Position de fente face à la poulie — transfert postural pour les sportifs",muscles:"Dorsal, gainage",niveau:"Intermédiaire"}],
erreurs:["Balancement du buste","Coudes trop écartés — trapèzes dominent","Amplitude insuffisante"]},

{n:"Traction lestée prise neutre",s:"4",r:"6-8",rest:"120s",ch:"Corps + lest",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : prise neutre = meilleure tolérance articulaire à l'épaule — à privilégier si inconfort en pronation.\nÉpaules fragiles : la prise neutre réduit significativement le conflit sous-acromial par rapport à la prise large.",
tips:["Même initiation que les tractions : dépression scapulaire avant de plier les coudes","Tirer les coudes vers les hanches","Menton au-dessus des mains minimum","Excentrique 3-4s","Barre d'haltères ou poignées parallèles si disponible"],
variantes:[
{nom:"Traction lestée pronation",note:"Paumes vers l'avant sous charge — le schéma de force pur sur les dorsaux",muscles:"Grand dorsal, grand rond",niveau:"Avancé"},
{nom:"Traction lestée supination",note:"Paumes vers soi sous charge — la surcharge maximale pour les biceps",muscles:"Biceps, dorsal bas",niveau:"Avancé"},
{nom:"Tractions aux anneaux lestées",note:"Rotation libre sous charge — le compromis articulaire idéal pour le travail lourd",muscles:"Dorsaux, stabilisateurs",niveau:"Avancé"}],
erreurs:["Amplitude partielle","Balancement pour se propulser","Ne pas aller en extension en bas"]},

{n:"Shrug barre derrière le dos",s:"4",r:"15",rest:"60s",ch:"Lourd",cat:"isolation",mat:"barre",
morpho:" Tous morphotypes : trapèzes supérieurs + moyens.\nLa position derrière le dos modifie légèrement l'angle d'activation — cible davantage les fibres moyennes des trapèzes que le shrug classique.",
tips:["Barre derrière les cuisses, prise pronation","Mouvement VERTICAL UNIQUEMENT — pas de rotation","Contraction 1-2s en haut","Descente lente — étirement complet","Utiliser des straps si la prise est limitante"],
variantes:[
{nom:"Shrug barre devant",note:"Barre devant les cuisses — position classique, trajectoire verticale simple",muscles:"Trapèzes supérieurs",niveau:"Débutant"},
{nom:"Shrug haltères",note:"Charges le long du corps — bras dans l'axe, aucun frottement",muscles:"Trapèzes supérieurs",niveau:"Débutant"},
{nom:"Shrug à la Smith machine derrière le dos",note:"Trajectoire guidée derrière le dos — position Lee Haney sécurisée",muscles:"Trapèzes supérieurs et moyens",niveau:"Intermédiaire"}],
erreurs:["Rotation des épaules","Amplitude insuffisante en bas","Utiliser l'élan des jambes"]},

{n:"Rowing inversé (body row)",s:"3-4",r:"8-15",rest:"90s",ch:"Corps (angle réglable)",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : le meilleur point d'entrée vers les tractions — amplitude complète sans la charge du corps entier.\nLombaires fragiles : alternative au rowing barre sans aucune compression vertébrale.\nProgression naturelle : plus le corps est horizontal, plus c'est dur — réglage au centimètre.\nRatio tirage/poussée déséquilibré chez la plupart des pratiquants : cet exercice corrige la balance posturale.",
tips:["Barre fixe à hauteur de hanches ou anneaux/table solide","Corps rigide comme une planche des talons à la tête","Tirer la poitrine vers la barre en serrant les omoplates","Pause 1s en haut, coudes le long du corps","Descendre en 2-3s sans casser le gainage"],
variantes:[
{nom:"Rowing inversé supination",note:"Paumes vers soi — biceps engagés, coudes qui longent le corps",muscles:"Dorsaux, biceps",niveau:"Débutant"},
{nom:"Rowing inversé prise large",note:"Mains bien au-delà des épaules, tirage coudes ouverts — haut du dos dominant",muscles:"Trapèzes moyens, deltoïde postérieur",niveau:"Débutant"},
{nom:"Rowing inversé aux anneaux",note:"Prise en rotation libre — trajectoire naturelle et instabilité modérée",muscles:"Dos, stabilisateurs",niveau:"Intermédiaire"},
{nom:"Rowing inversé unilatéral",note:"Un bras — le corps lutte contre la rotation pendant tout le tirage",muscles:"Dorsal actif, obliques",niveau:"Avancé"},
{nom:"Rowing inversé à la serviette",note:"Serviettes suspendues à la barre — la poigne devient un facteur limitant",muscles:"Dos, avant-bras",niveau:"Intermédiaire"}],
erreurs:["Bassin qui s'affaisse pendant la série","Tirer avec les bras sans rétracter les omoplates","Amplitude partielle — la poitrine ne touche pas la barre"]},

{n:"Rowing élastique assis",s:"4",r:"12-15",rest:"60s",ch:"Élastique moyen/fort",cat:"principal",mat:"élastique",
morpho:" Bras longs : trajectoire libre — les coudes trouvent naturellement leur couloir contrairement aux machines guidées.\nLombaires sensibles : position assise jambes tendues = zéro cisaillement lombaire si le buste reste vertical.\nDos rond chronique : la résistance croissante force la rétraction scapulaire complète en fin de tirage.\nRéplique fidèle du tirage horizontal câble, transportable partout.",
tips:["Assis jambes semi-tendues, élastique autour des pieds","Buste vertical et fixe — seuls les bras et omoplates bougent","Tirer les coudes vers l'arrière en serrant les omoplates","Contraction 1-2s en position finale","Retour contrôlé 2-3s en résistant à l'élastique"],
variantes:[
{nom:"Rowing élastique unilatéral",note:"Un bras à la fois — anti-rotation du tronc et correction d'asymétrie",muscles:"Dorsal ciblé, obliques",niveau:"Débutant"},
{nom:"Rowing élastique prise large coudes hauts",note:"Tirage vers la poitrine coudes ouverts — haut du dos prioritaire",muscles:"Trapèzes moyens, deltoïde postérieur",niveau:"Débutant"},
{nom:"Rowing élastique debout ancrage bas",note:"Penché en charnière de hanche — le gainage lombaire s'ajoute au tirage",muscles:"Dos, érecteurs",niveau:"Intermédiaire"},
{nom:"Rowing élastique supination",note:"Paumes vers le haut — biceps et fibres basses du dorsal",muscles:"Dorsal bas, biceps",niveau:"Débutant"}],
erreurs:["Buste qui balance d'avant en arrière pour tricher","Épaules qui remontent vers les oreilles","Élastique détendu en début de mouvement — tension nulle"]},

{n:"Tirage vertical élastique",s:"4",r:"12-15",rest:"60s",ch:"Élastique fort",cat:"principal",mat:"élastique",
morpho:" Bras longs : simulateur de traction avec charge réduite — construit le schéma moteur exact.\nÉpaules raides : l'élastique pardonne les trajectoires imparfaites, contrairement à la barre de tirage guidée.\nGrand dorsal dominant recherché : ancrage haut + tirage coudes vers les hanches = activation maximale.\nComplément idéal aux tractions les jours de fatigue ou en fin de séance.",
tips:["Élastique ancré en hauteur (porte, barre fixe)","À genoux ou assis, tirer les coudes vers les hanches","Penser à tirer avec les coudes, pas avec les mains","Serrer les omoplates vers le bas et l'arrière en fin de tirage","Excentrique lent 3s — laisser l'étirement complet en haut"],
variantes:[
{nom:"Traction assistée élastique",note:"Bande accrochée à la barre sous les pieds — la vraie progression vers la traction stricte",muscles:"Dorsaux, biceps",niveau:"Débutant"},
{nom:"Tirage vertical élastique unilatéral",note:"Un bras — isolation du dorsal avec amplitude complète",muscles:"Dorsal ciblé",niveau:"Débutant"},
{nom:"Straight-arm pulldown élastique",note:"Bras tendus qui descendent vers les hanches — dorsal isolé sans biceps",muscles:"Grand dorsal isolé",niveau:"Débutant"},
{nom:"Tirage vertical élastique prise serrée",note:"Mains rapprochées, coudes devant — amplitude allongée vers les fibres basses",muscles:"Dorsal (portion basse)",niveau:"Débutant"}],
erreurs:["Buste qui recule pour compenser une tension trop forte","Épaules haussées pendant le tirage","Amplitude haute incomplète — perdre l'étirement du dorsal"]},

{n:"Rowing TRX",s:"3-4",r:"10-15",rest:"60-90s",ch:"Corps (angle réglable)",cat:"principal",mat:"TRX",
morpho:" Tous morphotypes : la rotation libre des poignées suit la pronation/supination naturelle de chaque bras.\nPoignets ou coudes sensibles : prise neutre rotative = contrainte articulaire minimale.\nInstabilité modérée : recrute les stabilisateurs scapulaires sans limiter la charge autant qu'un bosu.\nLe réglage de difficulté au pas près en fait l'outil de rowing le plus progressif qui existe.",
tips:["Sangles courtes, corps incliné en planche rigide","Commencer bras tendus, poignées en prise neutre","Tirer la poitrine entre les poignées en rotation externe","Finir en supination légère pour maximiser la rétraction","Reculer les pieds pour durcir, avancer pour faciliter"],
variantes:[
{nom:"Rowing TRX pronation",note:"Paumes vers le sol tout le tirage — coudes ouverts, haut du dos dominant",muscles:"Trapèzes moyens, deltoïde postérieur",niveau:"Débutant"},
{nom:"Rowing TRX supination",note:"Paumes vers le ciel — biceps pleinement recrutés, coudes au corps",muscles:"Dorsaux, biceps",niveau:"Débutant"},
{nom:"Face pull TRX (tirage haut)",note:"Tirage vers le visage coudes hauts avec rotation externe — santé d'épaule et posture",muscles:"Deltoïde postérieur, coiffe, trapèzes",niveau:"Intermédiaire"},
{nom:"Rowing TRX coudes ouverts",note:"Coudes à 90° du buste, tirage vers la poitrine — l'épaisseur du haut du dos",muscles:"Trapèzes, rhomboïdes",niveau:"Débutant"},
{nom:"Rowing TRX coudes serrés",note:"Coudes qui frôlent les côtes, tirage vers les hanches — le grand dorsal en priorité",muscles:"Grand dorsal",niveau:"Débutant"},
{nom:"Rowing TRX unilatéral",note:"Une sangle — le corps entier lutte contre la rotation",muscles:"Dorsal actif, obliques",niveau:"Avancé"}],
erreurs:["Hanches qui cassent l'alignement en fin de série","Départ omoplates déjà serrées — perdre la protraction initiale","Sangles qui frottent les bras — mauvais réglage de longueur"]},

{n:"Rowing kettlebell unilatéral",s:"4",r:"8-12/côté",rest:"75s",ch:"12-24 kg",cat:"principal",mat:"kettlebell",
morpho:" Bras longs : le centre de gravité déporté de la kettlebell accentue le travail en fin de tirage — amplitude complète facilitée.\nLombaires fragiles : appui main libre sur banc ou genou = colonne déchargée.\nAsymétrie dos : l'unilatéral révèle et corrige les différences gauche/droite invisibles à la barre.\nLa poignée épaisse de la kettlebell ajoute un travail de grip gratuit.",
tips:["Appui main et genou opposés sur un banc, dos plat","Laisser la kettlebell étirer le dorsal en bas — épaule qui descend","Tirer le coude vers la hanche, pas vers le plafond","Contraction 1s coude au corps sans rotation du buste","Regard vers le sol — nuque neutre alignée avec la colonne"],
variantes:[
{nom:"Gorilla row kettlebells",note:"Penché au-dessus de deux KB posées, tirage alterné — rythme et gainage de hanche",muscles:"Dos, érecteurs, grip",niveau:"Intermédiaire"},
{nom:"Renegade row",note:"En planche sur les poignées, tirage alterné — gainage anti-rotation extrême",muscles:"Dos, abdominaux profonds",niveau:"Avancé",erreurs:["Bassin qui pivote à chaque tirage — écarter davantage les pieds"]},
{nom:"Rowing 2 kettlebells penché",note:"Version bilatérale en charnière tenue — érecteurs en isométrie sous le tirage",muscles:"Dos complet, lombaires",niveau:"Intermédiaire"},
{nom:"Rowing kettlebell appui banc",note:"Main et genou sur banc — la position la plus stable pour charger lourd",muscles:"Dorsal isolé",niveau:"Débutant"}],
erreurs:["Buste qui pivote pour monter plus haut","Coude qui s'écarte — devient un travail d'épaule","Dos rond en position penchée"]},

{n:"Scapular pull-up",s:"3",r:"8-12",rest:"60s",ch:"Corps",cat:"correctif",mat:"poids de corps",
morpho:" Bras longs : prérequis absolu avant les tractions — apprend à engager les omoplates avant les bras.\nÉpaules instables : renforce le trapèze inférieur et le dentelé, les deux maillons faibles classiques.\nÉpaules enroulées vers l'avant : rééducation posturale directe de la ceinture scapulaire.\nLe mouvement le plus sous-coté pour débloquer une stagnation aux tractions.",
tips:["Suspendu bras tendus, prise pronation largeur épaules","Sans plier les coudes : abaisser les omoplates pour monter de quelques centimètres","Imaginer glisser les omoplates dans les poches arrière","Tenir 2s en haut, redescendre lentement en suspension complète","Bras strictement tendus du début à la fin"],
variantes:[
{nom:"Scapular push-up",note:"En planche, protraction/rétraction des omoplates bras tendus — le miroir en poussée",muscles:"Dentelé antérieur",niveau:"Débutant"},
{nom:"Scapular pull-up aux anneaux",note:"Suspension sur anneaux — la rotation libre affine le contrôle scapulaire",muscles:"Trapèzes inférieurs, dorsaux",niveau:"Intermédiaire"},
{nom:"Scapular dip",note:"En appui sur barres parallèles, élévation/abaissement des épaules bras tendus — dépression scapulaire",muscles:"Trapèzes inférieurs, dentelé",niveau:"Intermédiaire"}],
erreurs:["Plier les coudes — devient une mini-traction","Hausser les épaules au lieu de les abaisser","Balancement du corps pendant le mouvement"]},
],

"Épaules":[
{n:"Développé haltères assis",s:"4",r:"8-10",rest:"90s",ch:"55-65%",cat:"principal",mat:"haltères",
morpho:" Bras longs : haltères indispensables — la barre impose une trajectoire fixe qui crée un conflit sous-acromial incompatible avec des humérus longs. Les haltères permettent la rotation naturelle.\nBras courts : barre ou haltères fonctionnent — la barre permet des charges plus lourdes.\nClavicules larges : excellent exercice — le levier naturel est favorable, amplitude et recrutement optimaux.\nÉpaules fragiles ou antépulsion : effectuer un demi-développé (arrêt à 90°) ou remplacer par les élévations latérales en priorité.",
tips:["Coudes alignés avec les épaules à la montée — ne pas les laisser partir en avant du plan frontal","Arrêter à 90-95% de l'extension — ne pas verrouiller en haut pour maintenir la tension","Descendre jusqu'à l'horizontale des bras pour une amplitude complète","Contrôle excentrique 2-3 secondes","Coudes légèrement en avant du plan frontal — protège l'articulation acromio-claviculaire"],
variantes:[
{nom:"Développé militaire barre debout",note:"Barre et position debout — le corps entier stabilise, gainage anti-extension permanent",muscles:"Deltoïdes, trapèzes, gainage",niveau:"Intermédiaire"},
{nom:"Développé haltères debout",note:"Sans dossier — les stabilisateurs du tronc rejoignent la poussée",muscles:"Deltoïdes, gainage",niveau:"Intermédiaire"},
{nom:"Développé Arnold",note:"Rotation des paumes pendant la montée — le faisceau antérieur travaille sur toute sa course",muscles:"Deltoïde antérieur et moyen",niveau:"Intermédiaire"},
{nom:"Développé haltères prise neutre",note:"Paumes face à face, coudes devant — trajectoire la plus douce pour l'articulation",muscles:"Deltoïde antérieur, triceps",niveau:"Débutant"},
{nom:"Z-press",note:"Assis au sol jambes tendues, sans dossier — toute compensation lombaire devient impossible",muscles:"Deltoïdes, gainage strict",niveau:"Avancé"},
{nom:"Landmine press",note:"Extrémité de barre au sol, poussée en diagonale — l'angle intermédiaire idéal pour épaules raides",muscles:"Deltoïde antérieur, dentelé, haut des pectoraux",niveau:"Débutant"}],
erreurs:["Verrouiller les coudes en haut — perte de tension + risque articulaire","Descente insuffisante — amplitude partielle = développement partiel","Arquer le dos pour compenser — surcharge lombaire et perte d'isolation","Coudes trop en arrière du plan frontal — conflit sous-acromial"]},

{n:"Élévations latérales poulie basse",s:"4",r:"15-20",rest:"45s",ch:"Très léger",cat:"isolation",mat:"poulie",
morpho:" Avant-bras longs : lever les COUDES et non les mains — les avant-bras longs créent un levier défavorable si l'on pense à la main. Les machines avec appui coudes résolvent ce problème mécaniquement.\nAvant-bras courts : haltères ou poulie fonctionnent de façon similaire.\nTrapèzes dominants : effectuer l'exercice légèrement penché vers l'avant pour réduire l'activation des trapèzes.\nArrêt OBLIGATOIRE à 90° — au-delà c'est le trapèze supérieur qui prend le relais, pas le deltoïde moyen.",
tips:["Lever les COUDES — pas les mains : penser à ce que ce sont les coudes qui montent","90° MAXIMUM — au-delà le trapèze prend complètement le relais du deltoïde","Légère inclinaison du pouce vers le bas pour cibler spécifiquement le deltoïde moyen","Légère inclinaison du buste vers l'avant améliore significativement l'activation","Excentrique contrôlé 2 secondes — résister à la gravité"],
variantes:[
{nom:"Élévations latérales haltères",note:"Résistance libre — le pic de difficulté se déplace en haut du mouvement",muscles:"Deltoïde moyen",niveau:"Débutant"},
{nom:"Élévation câble derrière le dos",note:"Câble qui passe derrière le corps — trajectoire d'abduction plus pure, épaule dégagée",muscles:"Deltoïde moyen isolé",niveau:"Intermédiaire"},
{nom:"Élévation latérale penchée sur montant (lean-away)",note:"Corps incliné tenu au montant — tension dès le départ et amplitude accrue",muscles:"Deltoïde moyen en amplitude complète",niveau:"Intermédiaire"},
{nom:"Élévations latérales machine",note:"Coudes sur pads guidés — isolation sans triche possible",muscles:"Deltoïde moyen",niveau:"Débutant"}],
erreurs:["Trop lourd — les trapèzes prennent le dessus dès 60-70° d'élévation","Dépasser 90° — l'exercice cible les trapèzes, plus le deltoïde moyen","Balancement du corps — perd l'isolation du deltoïde","Poignets fléchis — mauvaise répartition de la charge"]},

{n:"Oiseau haltères penché",s:"4",r:"15-20",rest:"45s",ch:"Très léger",cat:"correctif",mat:"haltères",
morpho:" Antépulsion d'épaules : exercice CORRECTIF ESSENTIEL — renforce le deltoïde postérieur et les rhomboïdes qui tirent les épaules en arrière. À associer systématiquement au face pull.\nÉpaules équilibrées : excellent exercice préventif — le deltoïde postérieur est sous-développé chez la quasi-totalité des pratiquants.\nTous morphotypes : exercice universel. Le poids doit rester très léger — la connexion neuromusculaire prime sur la charge.",
tips:["Buste penché à l'horizontale — dos plat, regard vers le sol","Légère flexion des coudes fixe et constante tout au long du mouvement","Montée contrôlée jusqu'à l'horizontale — ne pas aller au-delà","Penser à écarter les coudes vers l'arrière et le haut — et non vers les côtés","Poids très léger — c'est la connexion neuromusculaire qui produit les résultats"],
variantes:[
{nom:"Oiseau assis penché",note:"Assis buste sur les cuisses — l'élan des jambes et du dos disparaît",muscles:"Deltoïde postérieur isolé",niveau:"Débutant"},
{nom:"Oiseau appui poitrine sur banc incliné",note:"Ventre sur le dossier — les lombaires sont hors-jeu, isolation stricte",muscles:"Deltoïde postérieur, trapèzes moyens",niveau:"Débutant"},
{nom:"Reverse pec deck",note:"Machine à écarté inversé — trajectoire guidée en abduction horizontale pure",muscles:"Deltoïde postérieur",niveau:"Débutant"},
{nom:"Oiseau au câble croisé",note:"Deux poulies hautes croisées — tension continue jusque dans l'ouverture maximale",muscles:"Deltoïde postérieur en tension constante",niveau:"Intermédiaire"}],
erreurs:["Trop lourd — les trapèzes et les bras prennent le relais","Monter trop haut — les trapèzes dominent au-delà de l'horizontale","Dos arrondi — perd l'alignement et l'isolation du deltoïde postérieur","Coudes qui bougent en cours de mouvement"]},

{n:"Rotation externe poulie basse",s:"3",r:"15-20",rest:"45s",ch:"Élastique léger",cat:"correctif",mat:"poulie",
morpho:" Antépulsion d'épaules : exercice PRÉVENTIF INDISPENSABLE — renforce le supraépineux et les rotateurs externes. Le déséquilibre rotateurs internes/externes est à l'origine de la majorité des blessures d'épaule en musculation.\nÉpaules saines : exercice préventif — maintenir l'équilibre rotateur interne/externe.\nBras longs : exercice particulièrement important car l'amplitude plus grande des mouvements de poussée sollicite davantage les rotateurs.",
tips:["Coude collé au corps à 90° — position stricte maintenue tout au long","Rotation externe lente et contrôlée — ne pas aller trop vite","Pause 1-2 secondes en fin de rotation externe maximale","Poids MINIMAL — l'amplitude et la rotation comptent, pas la charge","À effectuer en échauffement ou en finition — jamais en milieu de séance"],
variantes:[
{nom:"Rotation externe élastique",note:"Version bande — réalisable à chaque échauffement, n'importe où",muscles:"Infra-épineux, petit rond",niveau:"Débutant"},
{nom:"Rotation externe haltère allongé sur le côté",note:"Couché latéral, coude calé sur la hanche — la gravité remplace la poulie",muscles:"Coiffe des rotateurs",niveau:"Débutant"},
{nom:"Rotation externe à 90° d'abduction",note:"Coude à hauteur d'épaule plié à 90° — la coiffe travaille dans la position du lancer",muscles:"Coiffe en position fonctionnelle sportive",niveau:"Intermédiaire",tips:["Position à réserver aux épaules saines — c'est l'amplitude la plus exigeante"]},
{nom:"Cuban press",note:"Tirage menton, rotation externe puis développé enchaînés — la coiffe sur toute sa course",muscles:"Coiffe, deltoïdes, trapèzes",niveau:"Avancé"}],
erreurs:["Coude qui décolle du corps — l'exercice perd complètement son intérêt","Trop lourd — les compensations musculaires prennent le dessus","Amplitude incomplète — travail insuffisant des rotateurs externes"]},

{n:"Élévations frontales haltères",s:"3",r:"12-15",rest:"60s",ch:"Très léger",cat:"isolation",mat:"haltères",
morpho:" Tous morphotypes : deltoïde antérieur. Souvent surdéveloppé par les exercices de poussée — à ne pas surcharger si antépulsion.\nAntépulsion épaules : à éviter ou remplacer par l'oiseau penché — renforce une dominance déjà présente.\nSi les épaules compensent dès le premier reps : charge trop lourde.",
tips:["Mouvement vers l'avant et légèrement vers l'intérieur","Arrêt à hauteur des épaules — pas plus haut","Excentrique contrôlé 2-3s","Alternativement pour plus de concentration","Prise pronation ou en pince selon préférence"],
variantes:[
{nom:"Élévation frontale disque",note:"Un disque tenu à deux mains — trajectoire centrale symétrique",muscles:"Deltoïde antérieur",niveau:"Débutant"},
{nom:"Élévation frontale câble",note:"Poulie basse dos à la machine — tension continue dès le bas du mouvement",muscles:"Deltoïde antérieur",niveau:"Débutant"},
{nom:"Élévation frontale prise neutre",note:"Pouces vers le haut — trajectoire plus douce dans l'espace sous-acromial",muscles:"Deltoïde antérieur, faisceau claviculaire du pectoral",niveau:"Débutant"},
{nom:"Élévation frontale barre",note:"Prise pronation bilatérale — charge symétrique et progression simple",muscles:"Deltoïde antérieur",niveau:"Débutant"}],
erreurs:["Balancement du corps pour se propulser","Dépasser la hauteur des épaules — trapèzes prennent le relais","Trop lourd — compensation lombaire"]},

{n:"Shrug d'isolation haut pectoraux",s:"3",r:"15",rest:"60s",ch:"Léger",cat:"isolation",mat:"haltères",
morpho:" Cage plate : exercice de ciblant le haut des pectoraux via l'angle d'élévation de l'épaule. Excellent pour les morphotypes à cage plate qui peinent à développer le haut du torse.\nÉpaules saines obligatoires — douleur = arrêt immédiat.",
tips:["Bras tendus devant soi, penché légèrement vers la machine","Élever l'épaule vers la tête en gardant le bras tendu","Contraction 1-2s en position haute","Amplitude de seulement quelques centimètres — mouvement d'épaule pur","Poids très léger — c'est la connexion neuromusculaire qui compte"],
variantes:[
{nom:"Shrug incliné haltères",note:"Ventre sur banc incliné, haussement vers l'arrière — les trapèzes moyens rejoignent le mouvement",muscles:"Trapèzes moyens et supérieurs",niveau:"Débutant"},
{nom:"Overhead shrug",note:"Bras tendus au-dessus de la tête, haussement des épaules — le trapèze inférieur en première ligne",muscles:"Trapèzes inférieurs, dentelé",niveau:"Intermédiaire"},
{nom:"Shrug poulie basse",note:"Câble devant le corps — tension constante sur toute l'élévation",muscles:"Trapèzes supérieurs",niveau:"Débutant"}],
erreurs:["Amplitude trop grande — trapèzes prennent le relais","Trop lourd — perd l'isolation du haut pectoral","Ne pas sentir la contraction = mauvaise position"]},

{n:"Arnold press haltères assis",s:"4",r:"10-12",rest:"90s",ch:"55%",cat:"principal",mat:"haltères",
morpho:" Bras longs : haltères permettent la rotation naturelle des poignets.\nClavicules larges : excellente option — le mouvement de rotation recrute tous les faisceaux du deltoïde.\nL'Arnold press recrute les 3 faisceaux du deltoïde grâce à la rotation en supination/pronation.",
tips:["Démarrer paumes vers le visage (supination), tourner vers l'extérieur en montant","Arriver en pronation en extension","Descendre en inversant la rotation","Amplitude complète — revenir à la supination totale en bas","Pas de verrouillage en haut"],
variantes:[
{nom:"Arnold press debout",note:"Sans dossier — la rotation se fait en pleine stabilisation du tronc",muscles:"Deltoïdes, gainage",niveau:"Intermédiaire"},
{nom:"Développé haltères classique",note:"Sans rotation des paumes — trajectoire directe, charge supérieure possible",muscles:"Deltoïde moyen et antérieur",niveau:"Débutant"},
{nom:"Arnold press unilatéral",note:"Un bras à la fois — rotation, poussée et anti-flexion latérale combinées",muscles:"Deltoïde, obliques",niveau:"Avancé"},
{nom:"Scott press",note:"Coudes qui restent devant et s'ouvrent en diagonale — l'ancêtre de l'Arnold, épaule très dégagée",muscles:"Deltoïde moyen et antérieur",niveau:"Intermédiaire"}],
erreurs:["Rotation incomplète — perd le bénéfice de l'exercice","Trop lourd — la rotation devient impossible","Coudes trop en arrière du plan frontal"]},

{n:"W-raise haltères penché",s:"3",r:"15",rest:"45s",ch:"Très léger",cat:"correctif",mat:"haltères",
morpho:" Antépulsion épaules : exercice CORRECTIF avancé — combine l'oiseau + rotation externe. Renforce simultanément le deltoïde postérieur et les rotateurs externes.\nTous morphotypes : très léger, qualité de contraction prioritaire.",
tips:["Buste penché horizontal, bras en W (coudes fléchis à 90°)","Lever les coudes en gardant l'angle","Rotation externe maximale en haut — doigts vers le plafond","Poids TRÈS léger — 2-4kg maximum","Mouvement lent et contrôlé"],
variantes:[
{nom:"Y-raise penché",note:"Bras montés en diagonale haute pouces vers le ciel — le trapèze inférieur prioritaire",muscles:"Trapèzes inférieurs, deltoïde postérieur",niveau:"Débutant"},
{nom:"T-raise penché",note:"Bras ouverts à l'horizontale — abduction pure vers les trapèzes moyens",muscles:"Trapèzes moyens, deltoïde postérieur",niveau:"Débutant"},
{nom:"W-raise appui banc incliné",note:"Ventre sur le dossier — le bas du dos sort de l'équation",muscles:"Coiffe, deltoïde postérieur",niveau:"Débutant"}],
erreurs:["Trop lourd — trapèzes dominent","Pas de rotation externe en haut","Coudes qui descendent"]},

{n:"Élévation latérale unilatérale câble",s:"3",r:"20",rest:"45s",ch:"Très léger",cat:"isolation",mat:"poulie",
morpho:" Tous morphotypes : tension constante du câble sur TOUT l'arc — supérieur aux haltères pour l'activation du deltoïde moyen.\nUnilatéral = correction des asymétries gauche/droite fréquentes sur les épaules.",
tips:["Poulie au niveau des hanches côté opposé — bras croisé devant le corps","Lever latéralement — 90° maximum","Excentrique contrôlé 2-3s","Incliner légèrement le buste vers l'avant","Pied opposé légèrement en avant pour la stabilité"],
variantes:[
{nom:"Élévation câble derrière le dos",note:"Le câble longe l'arrière du corps — abduction dégagée et trajectoire pure",muscles:"Deltoïde moyen",niveau:"Intermédiaire"},
{nom:"Élévation unilatérale penchée (lean-away)",note:"Corps incliné tenu au montant — le deltoïde reste sous tension dès le premier degré",muscles:"Deltoïde moyen en amplitude complète",niveau:"Intermédiaire"},
{nom:"Élévation latérale haltère unilatérale",note:"Version poids libre — la difficulté culmine à l'horizontale",muscles:"Deltoïde moyen",niveau:"Débutant"}],
erreurs:["Dépasser 90° — trapèzes prennent le relais","Balancement du corps","Trop lourd"]},

{n:"Pompes piquées (pike push-up)",s:"3-4",r:"6-12",rest:"90s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : trajectoire verticale libre — les coudes choisissent leur couloir, contrairement au développé barre.\nBras courts : excellent ratio force/difficulté, progression rapide vers le handstand push-up.\nIschio-jambiers raides : plier légèrement les genoux pour garder le bassin haut sans arrondir le dos.\nLe seul développé épaules complet réalisable sans aucun matériel.",
tips:["Position en V inversé, bassin le plus haut possible","Regard entre les mains, tête qui descend vers le sol","Coudes à 45° — trajectoire légèrement vers l'avant, jamais droite","Front qui frôle le sol avant de repousser","Surélever les pieds pour verticaliser et durcir progressivement"],
variantes:[
{nom:"Handstand push-up contre mur",note:"Corps vertical en équilibre facial — la poussée d'épaule complète au poids de corps",muscles:"Deltoïdes, trapèzes, triceps",niveau:"Avancé"},
{nom:"Pike push-up pieds surélevés",note:"Pieds sur banc, bassin au zénith — verticalisation intermédiaire de la poussée",muscles:"Deltoïdes",niveau:"Intermédiaire"},
{nom:"Pike push-up déficit sur parallettes",note:"Mains surélevées — la tête descend sous le niveau des mains, amplitude complète",muscles:"Deltoïdes en amplitude maximale",niveau:"Avancé"},
{nom:"Wall walk",note:"Marche des pieds au mur des pompes vers l'équilibre — transition dynamique complète",muscles:"Épaules, gainage",niveau:"Avancé"}],
erreurs:["Bassin trop bas — devient une pompe déclinée pour pectoraux","Coudes qui s'écartent perpendiculairement","Descente incomplète — le front ne s'approche pas du sol"]},

{n:"Élévations latérales élastique",s:"3-4",r:"15-20",rest:"45s",ch:"Élastique léger",cat:"isolation",mat:"élastique",
morpho:" Clavicules courtes : la résistance progressive épargne le point bas et concentre l'effort dans la zone efficace 30-90°.\nConflit sous-acromial : monter pouce légèrement vers le haut avec l'élastique = trajectoire plus tolérante qu'avec haltères.\nÉpaules étroites : le deltoïde moyen répond très bien au volume élevé que permet l'élastique.\nLa tension maximale arrive exactement où le deltoïde moyen est le plus actif — biomécanique idéale.",
tips:["Élastique sous les pieds, poignées en mains le long du corps","Monter les coudes jusqu'à l'horizontale, pas plus haut","Coudes légèrement fléchis, poignets neutres","Redescendre en 2-3s en résistant à la traction","Buste immobile — aucun élan des jambes ou du dos"],
variantes:[
{nom:"Élévation latérale élastique unilatérale",note:"Un bras — tension calibrée précisément sur chaque côté",muscles:"Deltoïde moyen ciblé",niveau:"Débutant"},
{nom:"Élévation en W élastique",note:"Coudes fléchis à 90° — bras de levier raccourci, épaule sensible soulagée",muscles:"Deltoïde moyen",niveau:"Débutant"},
{nom:"Élévation élastique penché",note:"Buste incliné vers l'avant — l'accent glisse vers le faisceau postérieur",muscles:"Deltoïde postérieur",niveau:"Débutant"}],
erreurs:["Hausser les trapèzes en fin de montée","Monter au-dessus de l'horizontale — le trapèze prend le relais","Élastique trop fort — amplitude sacrifiée et triche généralisée"]},

{n:"Développé militaire élastique",s:"4",r:"10-15",rest:"60-75s",ch:"Élastique moyen/fort",cat:"principal",mat:"élastique",
morpho:" Bras longs : trajectoire libre autour du visage — aucun compromis cervical contrairement à la barre.\nLombaires sensibles : la résistance croissante limite la charge en bas, là où la cambrure de compensation apparaît.\nÉpaules raides en élévation : possibilité de finir légèrement devant sans surcharge, angle auto-ajusté.\nLe gainage anti-extension est sollicité en continu — un développé qui muscle aussi la sangle abdominale.",
tips:["Debout sur l'élastique, poignées à hauteur d'épaules","Pousser vers le haut en rentrant légèrement la tête entre les bras en fin de course","Gainage abdominal et fessier verrouillé — aucune cambrure","Verrouiller les coudes 1s en haut sous tension maximale","Descendre lentement jusqu'aux épaules à chaque rep"],
variantes:[
{nom:"Développé élastique unilatéral",note:"Un bras — anti-flexion latérale du tronc pendant la poussée",muscles:"Deltoïde, obliques",niveau:"Intermédiaire"},
{nom:"Développé élastique en fente",note:"Base fendue avant-arrière — la compensation lombaire disparaît",muscles:"Deltoïdes",niveau:"Débutant"},
{nom:"Push press élastique",note:"Impulsion des jambes puis poussée — la puissance s'invite dans le geste",muscles:"Deltoïdes, triceps, jambes",niveau:"Intermédiaire"}],
erreurs:["Cambrure lombaire qui augmente à chaque répétition","Poussée devant le corps au lieu de verticale","Tension de départ nulle — élastique mal dimensionné"]},

{n:"Pull-apart élastique",s:"3",r:"15-25",rest:"30-45s",ch:"Élastique léger",cat:"correctif",mat:"élastique",
morpho:" Épaules enroulées : LE correctif postural de référence — renforce rhomboïdes, trapèzes moyens et deltoïde postérieur.\nAntécédents de conflit sous-acromial : rééquilibre le ratio rotateurs externes/internes, quasi toujours déficitaire.\nPosture bureau/téléphone : à prescrire quotidiennement, même hors séance.\n2 minutes par jour changent la posture en quelques semaines — le meilleur retour sur investissement en prévention.",
tips:["Bras tendus devant, élastique tenu largeur d'épaules","Écarter les mains jusqu'à ce que l'élastique touche la poitrine","Serrer les omoplates comme pour pincer un crayon entre elles","Épaules basses en permanence — ne jamais hausser","Retour lent et contrôlé sans relâcher la tension"],
variantes:[
{nom:"Pull-apart supination",note:"Paumes vers le ciel — la rotation externe s'ajoute à la rétraction",muscles:"Coiffe des rotateurs, rhomboïdes",niveau:"Débutant"},
{nom:"Pull-apart diagonal",note:"Une main haute, une main basse — les faisceaux se partagent le travail sur la diagonale",muscles:"Trapèzes, deltoïde postérieur",niveau:"Débutant"},
{nom:"Dislocations d'épaule élastique",note:"Bande passée tendue de devant à derrière bras tendus — mobilité active de toute la ceinture",muscles:"Coiffe, pectoraux (étirement), trapèzes",niveau:"Débutant"},
{nom:"Face pull élastique",note:"Tirage vers le visage coudes hauts — rétraction et rotation externe combinées",muscles:"Deltoïde postérieur, coiffe",niveau:"Débutant"}],
erreurs:["Plier les coudes — les bras volent le travail","Hausser les épaules vers les oreilles","Aller trop vite — c'est un exercice de qualité, pas de quantité"]},

{n:"Y-T-W TRX",s:"3",r:"6-8 par lettre",rest:"60s",ch:"Corps (angle réglable)",cat:"correctif",mat:"TRX",
morpho:" Épaules instables ou opérées : renforcement complet de la coiffe et des fixateurs d'omoplates en un seul enchaînement.\nTrapèze supérieur dominant : le Y et le T réactivent trapèzes inférieur et moyen, chroniquement endormis.\nPosture cyphotique : traction arrière du corps entier = extension thoracique active.\nTrois exercices correctifs en un — l'échauffement d'épaules le plus complet qui soit.",
tips:["Corps incliné en arrière, sangles tendues, bras devant","Y : monter les bras en diagonale haute, pouces vers le ciel","T : ouvrir les bras à l'horizontale en serrant les omoplates","W : tirer coudes fléchis vers le bas en rotation externe","Corps rigide — seuls les bras bougent, le gainage fait le reste"],
variantes:[
{nom:"Y-T-W au sol",note:"Allongé sur le ventre — la gravité seule résiste, version accessible partout",muscles:"Trapèzes inférieurs et moyens, coiffe",niveau:"Débutant"},
{nom:"Y-T-W haltères banc incliné",note:"Ventre sur dossier incliné avec charges légères — la progression chargée du schéma",muscles:"Trapèzes, deltoïde postérieur",niveau:"Intermédiaire"},
{nom:"I-Y-T TRX",note:"Le I ajoute une traction verticale bras dans l'axe — la ceinture scapulaire sur tous les angles",muscles:"Trapèzes complets, dorsaux",niveau:"Intermédiaire"}],
erreurs:["Angle trop incliné dès le départ — la forme s'effondre","Hausser les épaules pendant le Y","Casser les poignets au lieu de garder l'alignement bras-main"]},

{n:"Développé kettlebell unilatéral",s:"4",r:"6-10/côté",rest:"75-90s",ch:"8-20 kg",cat:"principal",mat:"kettlebell",
morpho:" Bras longs : la kettlebell posée sur l'avant-bras suit la rotation naturelle de l'humérus — trajectoire spiralée introuvable ailleurs.\nÉpaules capricieuses : le centre de gravité derrière la main force une position empilée très saine.\nAsymétries de force : l'unilatéral strict révèle immédiatement le côté faible.\nLe gainage anti-flexion latérale travaille autant que l'épaule — un développé qui construit le tronc.",
tips:["Kettlebell en position rack : coude collé, poignet neutre, boule sur l'avant-bras","Pousser en laissant le bras tourner naturellement vers l'extérieur","Gainer le côté opposé pour rester parfaitement vertical","Verrouiller le coude en haut, biceps près de l'oreille","Redescendre en rack contrôlé — l'excentrique construit l'épaule"],
variantes:[
{nom:"Développé bottoms-up",note:"Boule à l'envers au-dessus du poing — la coiffe stabilise en réflexe permanent",muscles:"Coiffe des rotateurs, avant-bras",niveau:"Avancé"},
{nom:"Push press kettlebell",note:"Impulsion des jambes avant la poussée — dépasser le plateau de force stricte",muscles:"Deltoïdes, jambes",niveau:"Intermédiaire"},
{nom:"Développé 2 kettlebells",note:"Double rack — mobilité thoracique et gainage exigés des deux côtés",muscles:"Deltoïdes, gainage",niveau:"Intermédiaire"},
{nom:"Seesaw press",note:"Poussée alternée en balancier, un bras monte quand l'autre descend — coordination et rythme",muscles:"Deltoïdes, obliques",niveau:"Intermédiaire"},
{nom:"Z-press kettlebell",note:"Assis au sol jambes tendues — la poussée la plus stricte qui existe",muscles:"Deltoïdes, gainage",niveau:"Avancé"}],
erreurs:["Flexion latérale du buste pendant la poussée","Poignet cassé en arrière sous la boule","Coude qui s'ouvre en position rack avant la poussée"]},

{n:"Kettlebell halo",s:"3",r:"8-10/sens",rest:"45s",ch:"8-12 kg",cat:"correctif",mat:"kettlebell",
morpho:" Épaules raides : mobilisation active de la coiffe dans toutes les amplitudes sous charge légère.\nThoracique verrouillé : la rotation de la charge autour du crâne déverrouille les épaules ET le haut du dos.\nÉchauffement pré-développé : prépare exactement les amplitudes qui seront chargées ensuite.\nMobilité sous charge = gains durables, contrairement aux étirements passifs.",
tips:["Kettlebell tenue à deux mains par la poignée, boule vers le haut","Dessiner un cercle serré autour de la tête, au ras du crâne","Coudes qui frôlent les oreilles au passage arrière","Gainage abdominal — le buste ne bouge pas d'un millimètre","Alterner les sens de rotation à chaque série"],
variantes:[
{nom:"Halo à genoux",note:"Position agenouillée — les jambes ne compensent plus, le tronc seul stabilise",muscles:"Épaules, gainage",niveau:"Débutant"},
{nom:"Around the world",note:"Cercle autour des hanches bras tendus — coordination et passage de main",muscles:"Épaules, avant-bras, obliques",niveau:"Débutant"},
{nom:"Arm bar kettlebell",note:"Allongé, bras vertical chargé pendant que le corps pivote — stabilité d'épaule de référence",muscles:"Coiffe des rotateurs, gainage",niveau:"Intermédiaire"},
{nom:"Turkish get-up",note:"Relevé complet du sol à debout charge au-dessus de la tête — l'aboutissement de la stabilité d'épaule",muscles:"Épaule, gainage, corps entier",niveau:"Avancé"}],
erreurs:["Cercle trop large loin de la tête — levier dangereux","Cambrure lombaire au passage arrière","Charge trop lourde — c'est un mouvement de mobilité, pas de force"]},
],

"Biceps":[
{n:"Curl haltères supination alternés",s:"4",r:"10-12",rest:"60s",ch:"65%",cat:"principal",mat:"haltères",
morpho:" Humérus longs : le pic visuel du biceps sera naturellement moins prononcé — compenser par une contraction maximale et une supination complète à chaque répétition.\nHumérus courts : développement du pic plus facile — bon levier naturel pour la contraction en haut.\nLa supination (rotation externe du poignet) est ce qui différencie un curl efficace d'un curl ordinaire — elle maximise le recrutement du chef long.",
tips:["Supiner progressivement pendant la montée — le pouce sort vers l'extérieur","Coude fixe et collé au corps tout au long — ne jamais le laisser partir en avant","Contraction maximale 2 secondes en haut — serrer fort en supination","Excentrique 2-3 secondes — résister à la gravité","Alterner les bras pour une concentration maximale sur chaque côté"],
variantes:[
{nom:"Curl haltères simultané",note:"Les deux bras montent ensemble — plus de charge totale mais gainage lombaire accru",muscles:"Biceps, gainage",niveau:"Débutant"},
{nom:"Curl Zottman",note:"Montée en supination, descente en pronation — biceps à la montée, extenseurs à la descente",muscles:"Biceps, avant-bras complets",niveau:"Intermédiaire"},
{nom:"Curl marteau",note:"Prise neutre pouces vers le haut — le brachial et le long supinateur prennent le relais",muscles:"Brachial, long supinateur",niveau:"Débutant"},
{nom:"Drag curl",note:"La charge glisse le long du buste, coudes qui reculent — le deltoïde antérieur sort du mouvement",muscles:"Biceps (pic de contraction)",niveau:"Intermédiaire"},
{nom:"Curl incliné haltères",note:"Dos sur banc incliné, bras en arrière du corps — la longue portion en étirement complet",muscles:"Biceps longue portion",niveau:"Intermédiaire"}],
erreurs:["Balancer le corps pour compenser en fin de série — les lombaires ne doivent pas participer","Coudes qui avancent — le deltoïde antérieur prend le relais des biceps","Amplitude insuffisante en bas — ne pas aller en extension quasi-complète","Ne pas supiner — le chef long reste sous-sollicité"]},

{n:"Curl incliné haltères 45°",s:"3",r:"10-12",rest:"60s",ch:"50%",cat:"isolation",mat:"haltères",
morpho:" Humérus longs : MEILLEUR exercice biceps — le banc incliné + bras tendus vers l'arrière créent un étirement maximal en position basse qui maximise l'activation musculaire. Compense le manque de pic naturel.\nHumérus courts : exercice utile mais l'avantage de l'étirement est moins prononcé.\nL'étirement en bas est le bénéfice clé de cet exercice — si le poids empêche de descendre correctement, il est trop lourd.",
tips:["Banc à 45-50° — avant-bras qui tombent librement vers le bas","Supination progressive PENDANT la montée pour maximiser le recrutement","Pause de 2 secondes en contraction maximale en haut — serrer fort","Poids modéré — c'est l'étirement en bas qui produit les résultats","Ne pas décoller les épaules du banc — elles restent en contact permanent"],
variantes:[
{nom:"Curl incliné prise marteau",note:"Prise neutre sur banc incliné — l'étirement se transfère au brachial",muscles:"Brachial, longue portion du biceps",niveau:"Intermédiaire"},
{nom:"Spider curl",note:"Ventre sur le dossier incliné, bras verticaux devant — la position inverse, pic de contraction",muscles:"Biceps chef court, contraction maximale",niveau:"Intermédiaire"},
{nom:"Curl haltères assis dossier vertical",note:"Bras dans l'axe du buste — la position intermédiaire de référence",muscles:"Biceps",niveau:"Débutant"}],
erreurs:["Épaules qui décollent du banc — perd l'étirement clé et le bénéfice de l'exercice","Amplitude insuffisante en bas — le bénéfice vient précisément de l'étirement","Trop lourd — le dos et les épaules compensent","Vitesse trop rapide — perd la sensation d'étirement"]},

{n:"Curl marteau",s:"3",r:"12",rest:"60s",ch:"65%",cat:"principal",mat:"haltères",
morpho:" Humérus longs : développe le brachial qui épaissit le bras vu de face — compensatoire au manque de pic naturel. Excellent choix de volume.\nHumérus courts : volume et largeur supplémentaires — bonne complémentarité avec le curl supination.\nLe curl marteau cible le chef long du biceps + le brachioradial + le brachial — il donne de la largeur au bras, pas du pic.",
tips:["Poignets neutres — pas de rotation, c'est ce qui distingue cet exercice du curl classique","Coudes fixes — pas de balancement même en fin de série","Amplitude complète — extension en bas et flexion maximale en haut","Peut s'effectuer alternativement ou simultanément selon la préférence","Concentration sur la contraction du brachioradial"],
variantes:[
{nom:"Cross-body curl (pinwheel)",note:"L'haltère monte en travers vers l'épaule opposée — le brachial en recrutement maximal",muscles:"Brachial dominant",niveau:"Débutant"},
{nom:"Curl Zottman",note:"Supination à la montée, pronation à la descente — flexion et extension du poignet combinées",muscles:"Biceps, extenseurs d'avant-bras",niveau:"Intermédiaire"},
{nom:"Curl marteau à la corde",note:"Poulie basse avec corde — tension continue sur toute la course en prise neutre",muscles:"Brachial, long supinateur",niveau:"Débutant"},
{nom:"Curl marteau incliné",note:"Sur banc incliné bras en arrière — le brachial travaille depuis l'étirement",muscles:"Brachial, longue portion",niveau:"Intermédiaire"}],
erreurs:["Rotation des poignets en cours de mouvement — devient un curl classique","Balancement du corps","Amplitude partielle en haut"]},

{n:"Curl pupitre barre EZ",s:"4",r:"10-12",rest:"60s",ch:"60%",cat:"isolation",mat:"barre",
morpho:" Tous morphotypes : isolation maximale — le pupitre supprime tout élan possible. La barre EZ réduit le stress sur les poignets par rapport à la barre droite.\nHumérus longs : l'amplitude naturellement grande crée un excellent étirement en bas — exploiter pleinement.\nExercice de connexion neuromusculaire — l'objectif n'est pas de soulever lourd mais de sentir le biceps travailler de façon isolée.",
tips:["Coudes bien calés sur le pupitre — ne jamais les décoller","Amplitude complète — extension quasi-totale en bas sans relâcher la tension","Excentrique très lent 3-4 secondes — le temps sous tension est la clé","Garder une légère tension en bas — ne pas aller en extension totale","Contraction 1-2 secondes en haut"],
variantes:[
{nom:"Curl pupitre haltère unilatéral",note:"Un bras sur le pupitre — concentration et correction d'asymétrie",muscles:"Biceps ciblé",niveau:"Débutant"},
{nom:"Curl pupitre prise large",note:"Mains sur la partie externe de la barre — le chef court davantage sollicité",muscles:"Biceps chef court",niveau:"Intermédiaire"},
{nom:"Curl pupitre prise serrée",note:"Mains rapprochées au centre — l'accent bascule vers la longue portion",muscles:"Biceps longue portion",niveau:"Intermédiaire"},
{nom:"Curl pupitre machine",note:"Trajectoire guidée — tension calibrée jusqu'à l'échec en sécurité",muscles:"Biceps",niveau:"Débutant"}],
erreurs:["Décoller les coudes du pupitre — tout le bénéfice de l'isolation disparaît","Amplitude insuffisante en bas","Vitesse trop rapide — perd le bénéfice du temps sous tension"]},

{n:"Curl barre EZ debout",s:"4",r:"8-10",rest:"75s",ch:"70%",cat:"principal",mat:"barre",
morpho:" Humérus longs : la barre EZ réduit le stress sur les poignets et les coudes vs barre droite — fortement recommandée.\nHumérus courts : barre droite ou EZ — les deux fonctionnent bien.\nPosition debout permet de charger plus lourd que le pupitre — bonne option pour la force pure.",
tips:["Coudes fixes le long du corps tout au long","Amplitude complète — extension quasi-totale en bas","Prise en semi-supination sur la barre EZ","Excentrique 2-3s","Éviter tout balancement même en fin de série"],
variantes:[
{nom:"Curl barre droite",note:"Supination complète imposée — recrutement biceps maximal, poignets plus exigés",muscles:"Biceps en supination totale",niveau:"Intermédiaire"},
{nom:"Curl barre prise large",note:"Mains au-delà des épaules — rotation externe qui privilégie le chef court",muscles:"Biceps chef court",niveau:"Débutant"},
{nom:"Curl barre prise serrée",note:"Mains rapprochées — rotation interne qui déplace l'effort sur la longue portion",muscles:"Biceps longue portion",niveau:"Débutant"},
{nom:"Drag curl barre",note:"Barre qui frôle le buste en remontant, coudes vers l'arrière — isolation sans élan d'épaule",muscles:"Biceps, pic de contraction",niveau:"Intermédiaire"}],
erreurs:["Balancement du buste pour compenser","Coudes qui avancent en montant","Amplitude partielle en bas"]},

{n:"Curl concentration haltère",s:"3",r:"12-15",rest:"60s",ch:"50%",cat:"isolation",mat:"haltères",
morpho:" Tous morphotypes : isolation maximale — aucun élan possible grâce à l'appui sur la cuisse.\nHumérus longs : étirement en bas encore plus prononcé — excellent recrutement du chef long.\nExercice de finition — qualité et connexion neuromusculaire avant la charge.",
tips:["Coude appuyé contre la cuisse intérieure — position fixe stricte","Supination en montant — rotation externe du poignet","Contraction maximale 2s en haut — visualiser le muscle","Excentrique très lent 3-4s","Un bras à la fois pour une concentration totale"],
variantes:[
{nom:"Curl concentration debout penché",note:"Bras suspendu dans le vide buste penché — version Arnold, étirement sous tension",muscles:"Biceps isolé",niveau:"Intermédiaire"},
{nom:"Spider curl",note:"Ventre sur banc incliné — même verticalité du bras, les deux côtés en simultané",muscles:"Biceps chef court",niveau:"Intermédiaire"},
{nom:"Curl concentration câble",note:"Poulie basse à la place de l'haltère — la tension ne disparaît plus en bas",muscles:"Biceps en tension continue",niveau:"Débutant"}],
erreurs:["Coude qui décolle de la cuisse","Amplitude insuffisante en bas","Ne pas supiner"]},

{n:"Curl câble bilatéral debout",s:"4",r:"12",rest:"60s",ch:"65%",cat:"principal",mat:"poulie",
morpho:" Humérus longs : tension constante en bas = compense le manque d'étirement naturel du biceps.\nTous morphotypes : tension sur tout l'arc de mouvement — aucun point mort comme avec les haltères.",
tips:["Barre droite ou EZ attachée à la poulie basse","Coudes fixes le long du corps","Amplitude complète — extension quasi-totale en bas","Excentrique 3s","Contraction 2s en haut"],
variantes:[
{nom:"Curl câble barre EZ",note:"Prise semi-pronée sur barre coudée — poignets soulagés sous charge lourde",muscles:"Biceps",niveau:"Débutant"},
{nom:"Curl câble corde prise marteau",note:"Corde en prise neutre — brachial et avant-bras rejoignent la flexion",muscles:"Brachial, long supinateur",niveau:"Débutant"},
{nom:"Curl câble unilatéral",note:"Une poignée — supination libre et amplitude individualisée",muscles:"Biceps ciblé",niveau:"Débutant"},
{nom:"Curl câble haut (poulie vis-à-vis)",note:"Bras à l'horizontale tirés depuis les poulies hautes — la pose du double biceps sous tension",muscles:"Biceps chef court, pic de contraction",niveau:"Intermédiaire"}],
erreurs:["Coudes qui avancent","Amplitude insuffisante en bas — perd la tension","Balancement"]},

{n:"Spider curl banc incliné inversé",s:"3",r:"12",rest:"60s",ch:"50%",cat:"isolation",mat:"haltères",
morpho:" Humérus longs : coudes DEVANT le corps = étirement maximal du chef long en bas + contraction maximale en haut. Un des meilleurs exercices pour compenser le manque de pic naturel.\nLe banc incliné inversé fixe les coudes — aucun élan possible.",
tips:["Banc incliné à 45°, allongé sur le ventre, coudes dépassant le banc","Amplitude complète — extension totale en bas","Supination progressive pendant la montée","Contraction 2s en haut","Poids modéré — la position amplifie l'effort"],
variantes:[
{nom:"Spider curl barre EZ",note:"Barre coudée à la place des haltères — charge bilatérale symétrique",muscles:"Biceps chef court",niveau:"Intermédiaire"},
{nom:"Curl pupitre",note:"L'angle inverse : bras devant sur le pupitre — l'étirement remplace le pic de contraction",muscles:"Biceps (portion basse de la course)",niveau:"Débutant"},
{nom:"Spider curl prise marteau",note:"Prise neutre sur le banc incliné — le brachial à la verticale",muscles:"Brachial",niveau:"Intermédiaire"}],
erreurs:["Coudes qui remontent sur le banc — perd l'isolation","Amplitude insuffisante","Trop lourd"]},

{n:"Curl barre EZ inversé (reverse)",s:"3",r:"12",rest:"60s",ch:"50%",cat:"isolation",mat:"barre",
morpho:" Tous morphotypes : extenseurs des avant-bras + brachioradial.\nÉquilibre fléchisseurs/extenseurs des avant-bras. Prévient les épicondylites et améliore la force de prise. Souvent négligé.",
tips:["Prise pronation sur barre EZ","Amplitude complète","Poignets en position neutre ou légèrement fléchis vers le haut","Coudes fixes","Mouvement lent et contrôlé"],
variantes:[
{nom:"Reverse curl barre droite",note:"Pronation complète — les extenseurs et le long supinateur au maximum",muscles:"Long supinateur, extenseurs",niveau:"Intermédiaire"},
{nom:"Reverse curl poulie basse",note:"Câble en pronation — tension constante sur les avant-bras",muscles:"Long supinateur, brachial",niveau:"Débutant"},
{nom:"Reverse curl haltères",note:"Pronation avec charges libres — chaque poignet règle finement son angle",muscles:"Avant-bras, brachial",niveau:"Débutant"},
{nom:"Curl marteau",note:"Prise neutre intermédiaire — le pont entre supination et pronation",muscles:"Brachial, long supinateur",niveau:"Débutant"}],
erreurs:["Poignets qui fléchissent vers le bas — risque épicondylite","Amplitude insuffisante","Trop lourd"]},

{n:"Curl élastique debout",s:"3-4",r:"12-20",rest:"45-60s",ch:"Élastique léger/moyen",cat:"isolation",mat:"élastique",
morpho:" Avant-bras longs : la résistance croissante compense le bras de levier défavorable en fin de flexion.\nCoudes sensibles : tension quasi nulle bras tendu = zéro stress sur le tendon distal, contrairement à la barre.\nPic de contraction recherché : la tension maximale arrive pile en flexion complète — idéal pour la portion haute du biceps.\nParfait en finisher haute répétition ou en séance à domicile.",
tips:["Debout sur l'élastique, pieds largeur de hanches pour régler la tension","Coudes collés aux flancs et immobiles — seuls les avant-bras bougent","Supination complète en montant, petit doigt qui tourne vers l'extérieur","Serrer fort le biceps 1s en haut","Descente 3s en résistant — l'excentrique élastique est très efficace"],
variantes:[
{nom:"Curl élastique prise marteau",note:"Prise neutre — brachial et long supinateur sous résistance progressive",muscles:"Brachial, avant-bras",niveau:"Débutant"},
{nom:"Curl élastique unilatéral",note:"Un bras — tension calibrée et concentration maximale",muscles:"Biceps ciblé",niveau:"Débutant"},
{nom:"Reverse curl élastique",note:"Prise pronation — extenseurs d'avant-bras et brachial",muscles:"Avant-bras, brachial",niveau:"Débutant"}],
erreurs:["Coudes qui avancent — l'épaule vole le travail","Buste qui se penche en arrière pour tricher","Élastique trop court sous les pieds — tension excessive dès le départ"]},

{n:"Curl marteau élastique",s:"3",r:"12-15",rest:"45s",ch:"Élastique léger/moyen",cat:"isolation",mat:"élastique",
morpho:" Avant-bras fins : le brachial et le long supinateur épaississent visuellement le bras entier, de face comme de profil.\nPoignets fragiles : la prise neutre est la position la plus tolérante pour l'articulation.\nVallée biceps/avant-bras creuse : le brachial pousse le biceps vers le haut — épaisseur du bras garantie.\nLe complément systématique du curl supination pour un développement complet.",
tips:["Prise neutre pouces vers le haut du début à la fin","Coudes verrouillés contre les flancs","Monter jusqu'à la contraction complète sans rotation du poignet","Contrôler la descente en 2-3s","Possibilité d'alterner les bras pour se concentrer sur chaque côté"],
variantes:[
{nom:"Cross-body curl élastique",note:"Flexion en travers du corps — le brachial en première ligne",muscles:"Brachial",niveau:"Débutant"},
{nom:"Reverse curl élastique",note:"Pronation complète — les extenseurs entrent dans la flexion",muscles:"Extenseurs, long supinateur",niveau:"Débutant"},
{nom:"Curl marteau kettlebell",note:"Version chargée en prise neutre — la poignée épaisse ajoute le grip",muscles:"Brachial, poigne",niveau:"Intermédiaire"}],
erreurs:["Rotation du poignet en cours de mouvement","Balancier des épaules","Descente relâchée sans résistance"]},

{n:"Curl TRX",s:"3",r:"8-15",rest:"60s",ch:"Corps (angle réglable)",cat:"isolation",mat:"TRX",
morpho:" Coudes sensibles : la charge s'auto-régule avec l'angle du corps — impossible de dépasser sa capacité du jour.\nUn des seuls curls stricts au poids de corps : le biceps travaille contre le corps entier.\nGainage simultané : le tronc reste rigide pendant toute la flexion — double travail.\nIdéal en superset après des tractions supination pour finir les biceps sans matériel.",
tips:["Face à l'ancrage, corps incliné en arrière, bras tendus devant","Paumes vers le ciel, tirer les mains vers le front en pliant uniquement les coudes","Coudes qui restent hauts et fixes pendant toute la flexion","Corps rigide en planche inversée — hanches verrouillées","Reculer les pieds pour durcir l'exercice"],
variantes:[
{nom:"Curl TRX prise marteau",note:"Poignées neutres pendant la flexion — brachial et confort articulaire",muscles:"Brachial",niveau:"Intermédiaire"},
{nom:"Curl TRX unilatéral",note:"Une sangle — flexion contre le corps entier avec anti-rotation",muscles:"Biceps, obliques",niveau:"Avancé"},
{nom:"Curl aux anneaux",note:"Anneaux en rotation libre — supination naturelle pendant la montée",muscles:"Biceps, stabilisateurs",niveau:"Intermédiaire"}],
erreurs:["Coudes qui tombent vers le bas — devient un rowing","Hanches qui cassent pour faciliter la remontée","Amplitude partielle en fin de série au lieu de changer d'angle"]},

{n:"Curl kettlebell",s:"3",r:"10-12",rest:"60s",ch:"8-16 kg",cat:"isolation",mat:"kettlebell",
morpho:" Avant-bras courts : le centre de gravité déporté sous la main déplace la difficulté vers la fin de flexion — courbe de résistance unique.\nPoignets solides requis : la boule tire le poignet en extension, ce qui renforce les fléchisseurs en isométrie.\nGrip faible : la poignée épaisse recrute davantage les fléchisseurs des doigts qu'un haltère classique.\nLe déport de charge rend chaque kilo de kettlebell plus difficile qu'un kilo d'haltère.",
tips:["Tenir la poignée en supination, boule sous l'avant-bras","Poignet verrouillé neutre malgré la traction de la boule","Coudes collés au buste, flexion stricte","Contraction 1s en haut, la boule touche presque l'épaule","Descente contrôlée sans laisser la boule tirer le poignet"],
variantes:[
{nom:"Goblet curl (par les cornes)",note:"Boule tenue à deux mains contre soi — flexion bilatérale et congestion rapide",muscles:"Biceps, brachial",niveau:"Débutant"},
{nom:"Curl marteau kettlebell",note:"Poignée en prise neutre — le déport de la boule accentue la fin de course",muscles:"Brachial, avant-bras",niveau:"Débutant"},
{nom:"Crush curl",note:"Boule écrasée entre les deux paumes — la co-contraction pectoraux-biceps s'ajoute",muscles:"Biceps, pectoraux, avant-bras",niveau:"Débutant"},
{nom:"Curl bottoms-up",note:"Boule à l'envers en équilibre — la poigne limite avant le biceps",muscles:"Avant-bras, biceps",niveau:"Avancé"}],
erreurs:["Poignet qui casse en extension sous le poids de la boule","Élan du buste sur les dernières répétitions","Charge trop lourde — la kettlebell pardonne moins que l'haltère"]},
],

"Triceps":[
{n:"Extension poulie haute corde",s:"4",r:"12-15",rest:"60s",ch:"Brûlure",cat:"principal",mat:"poulie",
morpho:" Tous morphotypes : exercice universel et très efficace — la corde permet une rotation externe en bas qui maximise le pic de contraction. Tension constante sur tout l'arc.\nBras longs : amplitude naturellement grande en bas — exploiter l'étirement du chef long.\nLa séparation des cordes en bas est ce qui distingue cet exercice — elle est indispensable pour la contraction maximale.",
tips:["Buste légèrement incliné en avant pour maintenir la tension à travers l'arc entier","Séparer les cordes en bas en pronant — rotation externe maximale pour le pic de contraction","Coudes fixes collés aux flancs — ils ne bougent pas","Excentrique 2 secondes","Contraction 1-2 secondes en extension complète"],
variantes:[
{nom:"Extension poulie barre droite",note:"Prise pronation rigide — charge supérieure, sans l'écartement final de la corde",muscles:"Triceps chef latéral",niveau:"Débutant"},
{nom:"Extension poulie barre EZ",note:"Prise semi-pronée — compromis poignets/charge",muscles:"Triceps",niveau:"Débutant"},
{nom:"Extension poulie supination (reverse)",note:"Paumes vers le ciel — le chef médial en première ligne",muscles:"Triceps chef médial",niveau:"Intermédiaire"},
{nom:"Extension poulie unilatérale",note:"Une poignée — amplitude individualisée et correction d'asymétrie",muscles:"Triceps ciblé",niveau:"Débutant"},
{nom:"Extension corde au-dessus de la tête",note:"Dos à la poulie bras montés — la longue portion s'étire enfin complètement",muscles:"Triceps longue portion",niveau:"Intermédiaire"}],
erreurs:["Coudes qui avancent — les pectoraux et dorsaux prennent le relais","Ne pas aller en extension complète — perd le pic de contraction","Trop de charge — le contrôle de l'excentrique disparaît"]},

{n:"French press barre EZ couché",s:"4",r:"10-12",rest:"75s",ch:"55%",cat:"principal",mat:"barre",
morpho:" Bras longs : chef long en étirement maximal — excellente activation. L'amplitude naturellement grande demande une progression prudente des charges.\nBras courts : exercice confortable — peut charger plus vite.\nLa barre EZ est recommandée par vs barre droite — elle réduit le stress sur les poignets et les coudes tout en maintenant un excellent recrutement.",
tips:["Coudes pointent vers le plafond — ils ne s'écartent pas pendant le mouvement","Descendre vers le front (haut de la tête) — pas vers le nez ni la poitrine","Excentrique très lent 3-4 secondes — maximise l'étirement du chef long","Extension quasi-complète en haut sans verrouillage final","Inspirer en descendant, expirer en montant"],
variantes:[
{nom:"Skull crusher haltères prise neutre",note:"Deux haltères paumes face à face — coudes libres, trajectoire individualisée",muscles:"Triceps, coudes préservés",niveau:"Débutant"},
{nom:"French press décliné",note:"Banc décliné — l'étirement de la longue portion s'accentue en bas",muscles:"Triceps longue portion",niveau:"Intermédiaire"},
{nom:"JM press",note:"Hybride entre développé serré et skull crusher, la barre descend vers le menton — spécial force",muscles:"Triceps (transfert développé couché)",niveau:"Avancé"},
{nom:"French press au sol",note:"Allongé au sol — les coudes trouvent une butée naturelle, version tolérante",muscles:"Triceps",niveau:"Débutant"}],
erreurs:["Coudes qui s'écartent — perd l'isolation du chef long","Descente trop rapide — risque tendineux au niveau du coude","Ne pas aller en extension quasi-complète — perd le bénéfice","Trop de charge — la technique est compromise"]},

{n:"Extension haltère nuque assis",s:"3",r:"12",rest:"60s",ch:"50%",cat:"isolation",mat:"haltères",
morpho:" Bras longs : chef long en étirement complet — amplitude naturellement grande, excellent recrutement.\nBras courts : moins d'étirement naturel — descendre encore plus loin derrière la tête.\nLe chef long est le plus grand des 3 chefs du triceps — son développement donne du volume au bras entier vu de côté et de dos.",
tips:["Bras vertical — coude pointant vers le plafond","Descendre l'haltère derrière la tête en amplitude maximale","Coude fixe — il ne bouge pas latéralement","Excentrique 3 secondes puis extension contrôlée","Utiliser l'autre main sur le coude pour maintenir l'alignement"],
variantes:[
{nom:"Extension un haltère à deux mains",note:"Les deux paumes sous le plateau d'un seul haltère — stabilité et charge accrues",muscles:"Triceps longue portion",niveau:"Débutant"},
{nom:"Extension nuque unilatérale",note:"Un bras — amplitude complète et correction gauche/droite",muscles:"Triceps ciblé",niveau:"Intermédiaire"},
{nom:"Extension nuque corde poulie basse",note:"Dos à la poulie — la tension persiste dans la position étirée",muscles:"Triceps longue portion",niveau:"Intermédiaire"}],
erreurs:["Coude qui s'écarte vers l'extérieur","Amplitude insuffisante en bas — perd l'étirement du chef long","Vitesse excessive"]},

{n:"Dips prise serrée",s:"4",r:"8-12",rest:"90s",ch:"Corps + lest",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : amplitude naturellement grande — descendre progressivement et contrôler l'excentrique.\nBras courts : amplitude plus réduite — accentuer la contraction en haut.\nBuste VERTICAL = triceps / Buste incliné = pectoraux. La verticalité du buste est le paramètre clé de cet exercice.",
tips:["Buste VERTICAL — c'est ce qui cible les triceps et non les pectoraux","Prise à largeur des épaules maximum — pas plus large","Excentrique 3 secondes","Extension complète en haut sans verrouillage total","Genoux croisés en arrière pour maintenir la verticalité du buste"],
variantes:[
{nom:"Dips aux anneaux",note:"Appuis instables en rotation libre — stabilisation permanente pendant la poussée",muscles:"Triceps, pectoraux, coiffe",niveau:"Avancé"},
{nom:"Dips barre droite",note:"Deux mains sur une même barre devant soi — style street workout, poignets en pronation",muscles:"Triceps, pectoraux, deltoïde antérieur",niveau:"Avancé"},
{nom:"Dips coréens",note:"Barre derrière le dos, mains en arrière — extension d'épaule marquée",muscles:"Triceps, deltoïde antérieur",niveau:"Avancé"},
{nom:"Dips entre bancs",note:"Mains derrière sur un banc, pieds au sol — la régression accessible",muscles:"Triceps",niveau:"Débutant"}],
erreurs:["Incliner le buste — les pectoraux prennent le relais","Amplitude insuffisante","Coudes trop écartés"]},

{n:"Kickback haltère",s:"3",r:"12-15",rest:"60s",ch:"Léger",cat:"isolation",mat:"haltères",
morpho:" Tous morphotypes : chef long + latéral en contraction maximale.\nBras longs : amplitude plus grande — excellent étirement en bas.\nExercice de finition — qualité absolue. Jamais lourd.",
tips:["Buste horizontal — haltère part vers l'arrière","Coude fixe à hauteur de l'épaule ou au-dessus","Extension complète — pause 1s en contraction maximale","Excentrique 2s contrôlé","Un bras à la fois"],
variantes:[
{nom:"Kickback poulie basse",note:"Câble à la place de l'haltère — la tension existe enfin sur toute la course",muscles:"Triceps en tension continue",niveau:"Débutant"},
{nom:"Kickback élastique",note:"Bande sous le pied — résistance croissante vers l'extension finale",muscles:"Triceps (pic de contraction)",niveau:"Débutant"},
{nom:"Kickback bilatéral penché",note:"Les deux bras en même temps buste penché — le gainage lombaire s'invite",muscles:"Triceps, érecteurs",niveau:"Intermédiaire"},
{nom:"Kickback appui banc",note:"Main et genou sur banc — position verrouillée, isolation stricte",muscles:"Triceps isolé",niveau:"Débutant"}],
erreurs:["Coude qui descend en cours de mouvement","Amplitude insuffisante","Balancement du corps"]},

{n:"Extension nuque câble haut",s:"3",r:"12-15",rest:"60s",ch:"Léger",cat:"isolation",mat:"poulie",
morpho:" Tous morphotypes : chef long en étirement et tension constants.\nBras longs : amplitude naturellement grande — excellent recrutement.\nTension constante du câble supérieure aux haltères.",
tips:["Dos à la poulie — câble au-dessus de la tête","Extension du coude vers l'avant et le bas","Coude fixe et haut","Contraction 1s en extension complète","Excentrique 2-3s"],
variantes:[
{nom:"Extension overhead barre EZ câble",note:"Barre coudée à la place de la corde — prise fixe et charge supérieure",muscles:"Triceps longue portion",niveau:"Intermédiaire"},
{nom:"Extension overhead unilatérale câble",note:"Une poignée bras levé — amplitude et étirement individualisés",muscles:"Triceps ciblé",niveau:"Intermédiaire"},
{nom:"Extension penché face à la poulie",note:"Buste incliné, corde tirée depuis derrière la tête — gainage ajouté à l'extension",muscles:"Triceps, gainage",niveau:"Intermédiaire"}],
erreurs:["Coude qui descend","Amplitude partielle","Corps qui se balance"]},

{n:"Barre au front incliné (incline skull crusher)",s:"4",r:"10-12",rest:"75s",ch:"55%",cat:"isolation",mat:"barre",
morpho:" Bras longs : banc légèrement incliné (+15°) créé un étirement supérieur du chef long par rapport au plat.\nL'inclinaison réduit aussi le stress sur les coudes par rapport au French press couché plat.",
tips:["Banc incliné 15-20° — pas plus","Descendre la barre vers le front en contrôlant","Coudes pointent strictement vers le plafond — ne s'écartent pas","Excentrique 3-4s","Extension sans verrouillage final"],
variantes:[
{nom:"Skull crusher banc plat",note:"Version horizontale classique — équilibre entre étirement et charge",muscles:"Triceps",niveau:"Débutant"},
{nom:"Skull crusher décliné",note:"Tête plus basse que les coudes — l'étirement de la longue portion au maximum",muscles:"Triceps longue portion",niveau:"Intermédiaire"},
{nom:"Skull crusher haltères neutres incliné",note:"Prises indépendantes face à face — coudes libres sur l'angle incliné",muscles:"Triceps",niveau:"Débutant"},
{nom:"JM press",note:"Descente vers le menton coudes devant — l'hybride force du powerlifting",muscles:"Triceps",niveau:"Avancé"}],
erreurs:["Coudes qui s'écartent","Descente vers le nez (risque)","Trop de charge — technique compromise"]},

{n:"Close grip bench press",s:"4",r:"8-10",rest:"90s",ch:"70%",cat:"principal",mat:"barre",
morpho:" Bras courts : exercice confortable — bon levier.\nBras longs : amplitude grande — progression prudente.\nDéveloppé prise serrée = triceps (60%) + pectoraux internes (40%). Permet de charger lourd en sécurité.",
tips:["Prise à largeur des épaules (pas plus serrée)","Descente contrôlée vers le bas de la poitrine","Coudes légèrement serrés contre le corps","Poussée explosive","Pont lombaire naturel — fesses sur le banc"],
variantes:[
{nom:"Floor press prise serrée",note:"Au sol — course raccourcie par la butée des coudes, moitié haute surchargée",muscles:"Triceps (verrouillage)",niveau:"Intermédiaire"},
{nom:"Close grip incliné",note:"Banc à 30° — la poussée serrée remonte vers le haut des pectoraux",muscles:"Triceps, haut des pectoraux",niveau:"Intermédiaire"},
{nom:"JM press",note:"La barre plonge vers le menton coudes fixes — entre développé et extension",muscles:"Triceps",niveau:"Avancé"},
{nom:"Close grip à la Smith machine",note:"Trajectoire guidée — l'échec en sécurité sans pareur",muscles:"Triceps",niveau:"Débutant"}],
erreurs:["Prise trop serrée — stress poignet","Laisser les coudes s'écarter","Rebond sur la poitrine"]},

{n:"Overhead triceps extension câble",s:"3",r:"15",rest:"60s",ch:"Léger",cat:"isolation",mat:"poulie",
morpho:" Bras longs : amplitude naturellement grande — excellent étirement du chef long.\nExtension au-dessus de la tête = chef long en étirement constant TOUT au long du mouvement. Supérieur aux haltères pour ce chef.",
tips:["Dos à la poulie, câble au-dessus de la tête","Coudes pointent vers le plafond — ne bougent pas","Extension complète vers l'avant et le bas","Excentrique 2-3s","Gainage actif — ne pas cambrer"],
variantes:[
{nom:"Extension overhead à la barre EZ",note:"Prise rigide semi-pronée — plus lourd que la corde",muscles:"Triceps longue portion",niveau:"Intermédiaire"},
{nom:"Extension overhead assis dos calé",note:"Dossier vertical — la cambrure compensatoire disparaît",muscles:"Triceps longue portion isolée",niveau:"Débutant"},
{nom:"Extension overhead élastique",note:"Bande ancrée bas dans le dos — la même course, transportable partout",muscles:"Triceps longue portion",niveau:"Débutant"}],
erreurs:["Coudes qui descendent","Corps qui se balance","Amplitude partielle"]},

{n:"Pompes diamant",s:"3-4",r:"8-15",rest:"60-90s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : amplitude de flexion importante — descendre contrôlé pour protéger coudes et poignets.\nPoignets sensibles : écarter légèrement les mains (triangle ouvert) ou utiliser des poignées de pompes.\nTriceps dominants recherchés : la prise serrée transfère la majorité de la charge des pectoraux vers les triceps.\nLe meilleur exercice triceps au poids de corps pur, validé par les études EMG.",
tips:["Mains sous la poitrine, pouces et index formant un triangle","Coudes qui restent près du corps pendant la descente","Poitrine qui descend vers les mains, pas le menton","Extension complète des coudes en haut à chaque rep","Corps gainé rigide de la tête aux talons"],
variantes:[
{nom:"Pompes prise serrée",note:"Mains largeur d'épaules sans triangle — presque autant de triceps, poignets soulagés",muscles:"Triceps, pectoraux internes",niveau:"Débutant"},
{nom:"Sphinx push-up",note:"Des avant-bras au sol vers l'extension complète des coudes — l'extension triceps pure au poids de corps",muscles:"Triceps isolés",niveau:"Avancé"},
{nom:"Pompes diamant genoux",note:"Appui genoux — la régression pour construire la force spécifique",muscles:"Triceps",niveau:"Débutant"},
{nom:"Pompes diamant pieds surélevés",note:"Angle décliné — la charge grimpe sur les triceps et le haut des pectoraux",muscles:"Triceps, haut des pectoraux",niveau:"Avancé"}],
erreurs:["Coudes qui s'évasent vers l'extérieur","Bassin qui monte pour raccourcir l'amplitude","Mains trop jointes créant une douleur de poignet"]},

{n:"Dips entre bancs",s:"3",r:"10-20",rest:"60s",ch:"Corps (+ lest sur cuisses)",cat:"principal",mat:"poids de corps",
morpho:" Épaules saines requises : l'extension d'épaule derrière le corps est contraignante — amplitude à limiter si antécédents.\nBras courts : très bon rendement, la trajectoire courte permet du volume lourd.\nAlternative aux dips complets : charge réduite car les pieds portent une partie du poids.\nProgression simple : pieds au sol → pieds surélevés → lest sur les cuisses.",
tips:["Mains sur le bord du banc, doigts vers l'avant, jambes tendues devant","Descendre jusqu'à 90° de flexion de coude, pas plus bas","Coudes qui pointent vers l'arrière, jamais vers l'extérieur","Dos qui frôle le banc pendant la descente","Épaules basses et poitrine ouverte tout le mouvement"],
variantes:[
{nom:"Dips barres parallèles",note:"Corps entier suspendu entre les barres — la version complète du mouvement",muscles:"Triceps, pectoraux",niveau:"Intermédiaire"},
{nom:"Dips coréens",note:"Barre unique derrière le dos — extension d'épaule accentuée",muscles:"Triceps, deltoïde antérieur",niveau:"Avancé"},
{nom:"Dips machine assis",note:"Poussée guidée vers le bas — la charge se règle au plot près",muscles:"Triceps",niveau:"Débutant"}],
erreurs:["Descendre trop bas — capsule antérieure de l'épaule en danger","Fesses qui s'éloignent du banc","Épaules qui remontent vers les oreilles en bas"]},

{n:"Extension triceps élastique",s:"3-4",r:"12-20",rest:"45s",ch:"Élastique léger/moyen",cat:"isolation",mat:"élastique",
morpho:" Coudes sensibles : la tension progressive épargne la position étirée, là où le tendon souffre à la poulie.\nAvant-bras longs : la résistance croissante correspond exactement à la courbe de force du triceps en extension.\nRéplique fidèle du pushdown poulie : ancrage haut, mêmes consignes, transportable partout.\nVolume de qualité illimité pour les triceps sans surcharge articulaire.",
tips:["Élastique ancré en hauteur, dos droit légèrement penché","Coudes collés aux flancs et strictement immobiles","Étendre les bras jusqu'au verrouillage complet","Contraction 1s bras tendus, triceps serrés","Remonter lentement sans laisser les coudes avancer"],
variantes:[
{nom:"Extension nuque élastique",note:"Ancrage bas, bras au-dessus de la tête — la longue portion en étirement",muscles:"Triceps longue portion",niveau:"Débutant"},
{nom:"Kickback élastique",note:"Buste penché, extension vers l'arrière — le pic de contraction final",muscles:"Triceps (contraction maximale)",niveau:"Débutant"},
{nom:"Extension élastique unilatérale",note:"Un bras — amplitude et tension sur mesure",muscles:"Triceps ciblé",niveau:"Débutant"},
{nom:"Extension élastique supination",note:"Paume vers le ciel pendant l'extension — le chef médial davantage recruté",muscles:"Triceps chef médial",niveau:"Intermédiaire"}],
erreurs:["Coudes qui s'écartent des flancs","Épaules qui participent au mouvement","Retour trop rapide sans contrôle excentrique"]},

{n:"Extension triceps TRX",s:"3",r:"8-12",rest:"60s",ch:"Corps (angle réglable)",cat:"isolation",mat:"TRX",
morpho:" Coudes fragiles : commencer très vertical — la charge augmente au degré près en reculant les pieds.\nLongue portion ciblée : les bras au-dessus de la tête en position basse étirent complètement le chef long.\nGainage intégré : le corps reste planche pendant toute l'extension.\nL'équivalent du skull crusher au poids de corps — sans barre ni banc.",
tips:["Dos à l'ancrage, poignées en mains, corps incliné vers l'avant","Plier les coudes pour amener les mains derrière la tête","Coudes qui pointent devant, serrés largeur d'épaules","Étendre les bras pour repousser le corps en position de départ","Plus les pieds reculent, plus l'exercice est difficile"],
variantes:[
{nom:"Extension TRX à genoux",note:"Appui genoux — bras de levier raccourci pour apprendre le schéma",muscles:"Triceps",niveau:"Débutant"},
{nom:"Sphinx push-up",note:"La même extension sans sangles, avant-bras au sol — le grand frère calisthenics",muscles:"Triceps",niveau:"Avancé"},
{nom:"Extension TRX unilatérale",note:"Une sangle — extension contre le corps entier en anti-rotation",muscles:"Triceps, obliques",niveau:"Avancé"}],
erreurs:["Coudes qui s'évasent pendant la flexion","Hanches qui cassent pour faciliter le retour","Angle trop incliné avant de maîtriser la technique"]},

{n:"Extension nuque kettlebell",s:"3",r:"10-15",rest:"60s",ch:"8-16 kg",cat:"isolation",mat:"kettlebell",
morpho:" Bras longs : la longue portion du triceps répond fortement au travail étiré au-dessus de la tête — priorité morphologique.\nÉpaules raides : tenir la boule à deux mains stabilise la trajectoire par rapport à l'haltère.\nPrise naturelle : la poignée verticale place les poignets en position neutre confortable.\nLa forme de la kettlebell rend cette version plus stable et plus sûre que l'haltère derrière la nuque.",
tips:["Kettlebell tenue à deux mains par les cornes de la poignée, boule vers le bas","Coudes serrés qui pointent vers le plafond","Descendre la boule derrière la nuque en flexion complète","Étendre sans bouger les bras — seuls les avant-bras travaillent","Gainage abdominal pour éviter la cambrure compensatoire"],
variantes:[
{nom:"Extension nuque kettlebell assis",note:"Dossier vertical — la compensation lombaire disparaît",muscles:"Triceps longue portion",niveau:"Débutant"},
{nom:"Extension nuque unilatérale",note:"Une main par la poignée — amplitude complète côté par côté",muscles:"Triceps ciblé",niveau:"Intermédiaire"},
{nom:"French press kettlebell au sol",note:"Allongé, flexion vers le front — les coudes butent en sécurité",muscles:"Triceps",niveau:"Débutant"}],
erreurs:["Coudes qui s'écartent en descente","Cambrure lombaire quand la charge passe derrière","Amplitude réduite par peur de la position étirée"]},
],

"Quadriceps":[
{n:"Presse à jambes 45° pieds hauts",s:"4",r:"10-15",rest:"90s",ch:"70%",cat:"principal",mat:"machine",
morpho:" Fémurs longs : MEILLEUR exercice jambes — le squat force un buste trop incliné vers l'avant avec des fémurs longs, créant une surcharge lombaire. La presse supprime ce problème anatomique.\nFémurs courts : squat ou presse fonctionnent — les deux sont appropriés.\nPosition des pieds : hauts = fessiers+ischios+quadriceps / bas = quadriceps isolés / écartés = adducteurs + fessiers.",
tips:["Pieds à hauteur des épaules ou légèrement plus écartés","Amplitude complète — descendre jusqu'à 90° minimum","Genoux dans l'axe des pieds — ne jamais les laisser rentrer","Excentrique 3 secondes — pas de rebond en bas","Ne jamais décoller le bas du dos de la plateforme"],
variantes:[
{nom:"Presse pieds bas sur le plateau",note:"Appuis descendus — la flexion de genou domine, quadriceps en première ligne",muscles:"Quadriceps",niveau:"Débutant"},
{nom:"Presse pieds serrés",note:"Pieds joints au centre — le vaste externe et le balayage extérieur de la cuisse",muscles:"Quadriceps (vaste externe)",niveau:"Intermédiaire"},
{nom:"Presse pieds écartés pointes ouvertes",note:"Position sumo sur le plateau — adducteurs et fessiers rejoignent la poussée",muscles:"Adducteurs, fessiers, quadriceps",niveau:"Débutant"},
{nom:"Presse unilatérale",note:"Une jambe — asymétries corrigées et amplitude individualisée",muscles:"Quadriceps et fessier ciblés",niveau:"Intermédiaire"},
{nom:"Presse horizontale",note:"Poussée dans l'axe assis — hanches moins fléchies, lombaires épargnés",muscles:"Quadriceps",niveau:"Débutant"}],
erreurs:["Décoller le bas du dos — risque lombaire grave","Genoux qui rentrent","Verrouiller les genoux en haut","Rebond en bas"]},

{n:"Leg extension machine",s:"3",r:"15",rest:"60s",ch:"60%",cat:"isolation",mat:"machine",
morpho:" Tous morphotypes : isolation pure des quadriceps.\nFémurs longs : amplitude de flexion naturellement plus grande — exploiter pleinement.\nContraction isométrique 1-2s en extension complète indispensable pour la connexion neuromusculaire.",
tips:["Dos appuyé sur le dossier — lombaires en contact","Contraction 1-2s en extension complète","Excentrique 3s","Pointe des pieds vers soi pour plus d'activation du droit fémoral","15-20 reps léger en finisseur"],
variantes:[
{nom:"Leg extension unilatérale",note:"Une jambe — le côté fort ne masque plus le côté faible",muscles:"Quadriceps ciblé",niveau:"Débutant"},
{nom:"Leg extension pointes en dehors",note:"Rotation externe de hanche — le vaste interne davantage recruté",muscles:"Vaste interne",niveau:"Intermédiaire"},
{nom:"Leg extension pointes en dedans",note:"Rotation interne — l'accent glisse vers le vaste externe",muscles:"Vaste externe",niveau:"Intermédiaire"},
{nom:"Sissy squat",note:"L'équivalent poids de corps — extension de genou avec hanches ouvertes",muscles:"Quadriceps (droit fémoral)",niveau:"Avancé"}],
erreurs:["Amplitude insuffisante en bas","Pas de contraction en haut","Trop lourd — compensation avec le buste"]},

{n:"Squat goblet haltère",s:"3",r:"12",rest:"90s",ch:"Modéré",cat:"principal",mat:"haltères",
morpho:" Fémurs longs : l'haltère tenu devant contrebalance et permet de rester plus vertical — version accessible.\nFémurs courts : exercice confortable — position naturellement favorable.\nVersion d'apprentissage ou échauffement avant la presse.",
tips:["Haltère tenu verticalement contre la poitrine","Descente contrôlée — cuisses parallèles au sol minimum","Genoux dans l'axe des pieds, légèrement en dehors","Talon bien ancré au sol","Dos droit, regard frontal"],
variantes:[
{nom:"Goblet squat kettlebell",note:"KB tenue par les cornes — prise plus naturelle et boule calée contre le buste",muscles:"Quadriceps, fessiers",niveau:"Débutant"},
{nom:"Front squat barre",note:"Barre sur les clavicules — la progression chargée du squat buste vertical",muscles:"Quadriceps, gainage",niveau:"Avancé"},
{nom:"Squat Zercher",note:"Barre dans les plis des coudes — charge devant très basse, gainage et haut du dos en feu",muscles:"Quadriceps, érecteurs, biceps",niveau:"Avancé"},
{nom:"Goblet squat sumo",note:"Pieds très écartés — adducteurs et fessiers prioritaires, buste droit",muscles:"Adducteurs, fessiers",niveau:"Débutant"},
{nom:"Cyclist squat (talons surélevés)",note:"Talons sur cale, pieds serrés — flexion de genou maximale, quadriceps isolés",muscles:"Quadriceps (vaste interne)",niveau:"Intermédiaire"}],
erreurs:["Talons qui décollent — manque de mobilité cheville","Genoux qui rentrent","Dos qui s'arrondit — charge trop lourde"]},

{n:"Hack squat machine",s:"4",r:"10-12",rest:"90s",ch:"65-70%",cat:"principal",mat:"machine",
morpho:" Fémurs longs : meilleure option que le squat classique — machine réduit la compensation du dos.\nFémurs courts : exercice confortable et très efficace.\nPlus de quadriceps que la presse grâce à l'angle de la machine.",
tips:["Pieds à largeur des hanches","Descente jusqu'à 90° minimum","Genoux dans l'axe des pieds","Dos plaqué contre le dossier","Ne pas verrouiller les genoux en haut"],
variantes:[
{nom:"Hack squat inversé (face à la machine)",note:"Poitrine contre le dossier — la poussée bascule vers les fessiers et ischios",muscles:"Fessiers, ischio-jambiers",niveau:"Intermédiaire"},
{nom:"Pendulum squat",note:"Trajectoire en arc de cercle — profondeur maximale avec genoux préservés",muscles:"Quadriceps en amplitude complète",niveau:"Intermédiaire"},
{nom:"Hack squat barre (à l'ancienne)",note:"Barre tenue derrière les jambes — la version poids libre historique",muscles:"Quadriceps",niveau:"Avancé"},
{nom:"Presse à jambes 45°",note:"Poussée du plateau — la charge lourde sans barre sur le dos",muscles:"Quadriceps, fessiers",niveau:"Débutant"}],
erreurs:["Genoux qui rentrent","Amplitude insuffisante","Fesses qui décollent du siège"]},

{n:"Fentes avant haltères",s:"4",r:"10/jambe",rest:"75s",ch:"Modéré",cat:"principal",mat:"haltères",
morpho:" Fémurs longs : pas long pour maximiser l'activation des fessiers.\nFémurs courts : quadriceps davantage sollicités avec un pas normal.\nGrand pas = fessiers / Petit pas = quadriceps.",
tips:["Pas long — genou avant dans l'axe du pied","Buste droit, regard frontal","Genou avant ne dépasse pas la pointe du pied","Pied arrière bien ancré sur la pointe","Descendre sans toucher le genou arrière au sol"],
variantes:[
{nom:"Fentes arrière",note:"Le pas part vers l'arrière — genou avant stable, version la plus douce articulairement",muscles:"Fessiers, quadriceps",niveau:"Débutant"},
{nom:"Fentes marchées",note:"Enchaînement en avançant — équilibre dynamique et transfert athlétique",muscles:"Quadriceps, fessiers",niveau:"Intermédiaire"},
{nom:"Fentes latérales",note:"Le pas part sur le côté — adducteurs étirés et hanche travaillée dans le plan frontal",muscles:"Adducteurs, fessiers",niveau:"Intermédiaire"},
{nom:"Fente curtsy",note:"Jambe croisée derrière en diagonale — le moyen fessier dans le plan croisé",muscles:"Moyen fessier, quadriceps",niveau:"Intermédiaire"},
{nom:"Fentes avant barre",note:"Barre sur les trapèzes — charge supérieure et gainage vertical exigé",muscles:"Quadriceps, fessiers, gainage",niveau:"Avancé"}],
erreurs:["Genou avant qui dépasse les orteils","Buste qui s'incline","Pas trop court"]},

{n:"Bulgarian split squat barre",s:"4",r:"8/jambe",rest:"90s",ch:"Modéré-lourd",cat:"principal",mat:"barre",
morpho:" Fémurs longs : excellent — la position unilatérale permet au fémur de rester plus vertical.\nFémurs courts : quadriceps très sollicités.\nConsidéré par beaucoup comme supérieur au squat bilatéral pour l'hypertrophie des jambes.",
tips:["Barre basse sur les trapèzes","Pied arrière sur banc","Pied avant assez loin — genou ne dépasse pas les orteils","Descente quasi-verticale — buste droit","Pause 1s en bas"],
variantes:[
{nom:"Bulgares haltères",note:"Charges le long du corps — équilibre facilité et prise limitante en moins",muscles:"Quadriceps, fessiers",niveau:"Intermédiaire"},
{nom:"Bulgares goblet",note:"Charge unique contre la poitrine — contrepoids qui redresse naturellement le buste",muscles:"Quadriceps",niveau:"Débutant"},
{nom:"Bulgares déficit",note:"Pied avant sur une surélévation — amplitude de flexion augmentée",muscles:"Fessiers, quadriceps en étirement",niveau:"Avancé"},
{nom:"Split squat pied arrière au sol",note:"Fente statique classique — la régression stable des bulgares",muscles:"Quadriceps, fessiers",niveau:"Débutant"}],
erreurs:["Pied avant trop près","Buste trop incliné","Trop lourd avant maîtrise technique"]},

{n:"Sissy squat",s:"3",r:"12-15",rest:"60s",ch:"Corps",cat:"isolation",mat:"poids de corps",
morpho:" Tous morphotypes : quadriceps en étirement MAXIMAL — les genoux dépassent largement la ligne des orteils intentionnellement.\nExercice d'isolation pure des quadriceps souvent mal compris. Pas dangereux si progression graduelle.",
tips:["Tenir un appui, monter sur la pointe des pieds","Genoux vers l'avant en descendant — le corps forme une ligne droite genoux-hanches-épaules","Descendre jusqu'à l'inconfort musculaire (pas articulaire)","Remonter lentement","Progresser avec haltère sur la poitrine"],
variantes:[
{nom:"Sissy squat assisté",note:"Une main sur un montant — l'équilibre sort de l'équation, le quadriceps reste",muscles:"Quadriceps",niveau:"Intermédiaire"},
{nom:"Sissy squat sur machine dédiée",note:"Chevilles calées sous les boudins — la trajectoire sécurisée jusqu'à l'échec",muscles:"Quadriceps (droit fémoral)",niveau:"Intermédiaire"},
{nom:"Reverse nordic curl",note:"À genoux, le buste bascule en arrière d'un bloc — l'excentrique quadriceps de référence",muscles:"Quadriceps (droit fémoral) en étirement",niveau:"Avancé"},
{nom:"Cyclist squat goblet",note:"Talons surélevés avec charge devant — le même ciblage genou dans une version chargée",muscles:"Quadriceps (vaste interne)",niveau:"Intermédiaire"}],
erreurs:["Aller trop vite avant d'avoir la mobilité","Douleur articulaire (arrêter immédiatement)","Amplitude insuffisante"]},

{n:"Squat au poids de corps",s:"3-4",r:"15-25",rest:"60s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Fémurs longs : buste qui penche naturellement — écarter les pieds et ouvrir les pointes pour rester plus vertical.\nFémurs courts : squat profond très accessible, amplitude complète recommandée dès le début.\nChevilles raides : talons légèrement surélevés (petite cale) pour descendre sans compensation lombaire.\nLe mouvement de référence pour évaluer et enseigner le schéma moteur avant toute charge.",
tips:["Pieds largeur d'épaules, pointes légèrement ouvertes","Descendre en poussant les genoux vers l'extérieur, dans l'axe des pieds","Cuisses au moins parallèles au sol, plus bas si la mobilité le permet","Poids réparti sur tout le pied — talons ancrés au sol","Buste fier, regard horizontal, bras devant en contrepoids"],
variantes:[
{nom:"Squat sumo poids de corps",note:"Pieds très écartés pointes ouvertes — adducteurs recrutés et buste plus vertical",muscles:"Adducteurs, fessiers",niveau:"Débutant"},
{nom:"Squat prisonnier",note:"Mains derrière la tête coudes ouverts — extension thoracique imposée pendant le squat",muscles:"Quadriceps, posture haute du dos",niveau:"Débutant"},
{nom:"Cossack squat",note:"Poids transféré sur une jambe fléchie, l'autre tendue sur le côté — mobilité et force dans le plan frontal",muscles:"Adducteurs, fessiers, quadriceps",niveau:"Intermédiaire"},
{nom:"Squat bulgare poids de corps",note:"Pied arrière surélevé — la charge bascule sur la jambe avant",muscles:"Quadriceps, fessier de la jambe avant",niveau:"Intermédiaire"},
{nom:"Squat sauté",note:"Extension explosive avec décollage — la puissance s'ajoute au schéma",muscles:"Quadriceps, mollets, fessiers",niveau:"Intermédiaire"},
{nom:"Pistol squat",note:"Squat complet sur une jambe, l'autre tendue devant — force, mobilité et équilibre réunis",muscles:"Quadriceps, fessier, gainage",niveau:"Avancé"},
{nom:"Sissy squat",note:"Genoux qui avancent, corps en planche arrière — l'extension de genou isolée",muscles:"Quadriceps (droit fémoral)",niveau:"Avancé"}],
erreurs:["Genoux qui rentrent vers l'intérieur en remontant","Talons qui décollent du sol","Dos qui s'arrondit en bas de squat"]},

{n:"Chaise au mur (wall sit)",s:"3",r:"30-90s",rest:"60s",ch:"Corps",cat:"gainage",mat:"poids de corps",
morpho:" Genoux sensibles : isométrie sans impact ni cisaillement dynamique — souvent le premier exercice toléré en reprise.\nFémurs longs : vérifier que les genoux restent à la verticale des chevilles en reculant assez les pieds.\nTous niveaux : la durée remplace la charge — progression infinie sans matériel.\nRenforcement tendineux et endurance de force — la base avant les mouvements dynamiques chargés.",
tips:["Dos entièrement plaqué contre le mur, des épaules au bassin","Cuisses parallèles au sol, genoux à 90°","Genoux à la verticale des chevilles, jamais au-delà des pointes","Poids dans les talons, mains libres ou croisées sur la poitrine","Respiration continue — ne jamais bloquer en isométrie"],
variantes:[
{nom:"Chaise unilatérale",note:"Une jambe tendue devant — toute la charge sur une seule cuisse",muscles:"Quadriceps unilatéral",niveau:"Avancé"},
{nom:"Chaise + élévations mollets",note:"Montées sur pointes en tenant la position — les mollets rejoignent l'isométrie",muscles:"Quadriceps, mollets",niveau:"Intermédiaire"},
{nom:"Squat ballon contre le mur",note:"Swiss ball entre le dos et le mur, squats dynamiques — la version mobile de la chaise",muscles:"Quadriceps, fessiers",niveau:"Débutant"}],
erreurs:["Position trop haute — cuisses au-dessus de la parallèle","Bas du dos qui décolle du mur","Mains posées sur les cuisses pour s'aider"]},

{n:"Fentes sautées",s:"3",r:"8-12/jambe",rest:"90s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Genoux sains requis : impact pliométrique — maîtriser la fente classique avant toute version sautée.\nFémurs longs : grand pas d'écart pour absorber la réception avec le tibia vertical.\nSports avec changements d'appuis : transfert direct vers la course, les sports collectifs et de combat.\nPuissance unilatérale + coordination + cardio — un exercice trois-en-un pour athlètes.",
tips:["Partir en fente stable, genou arrière proche du sol","Sauter en poussant fort sur les deux jambes","Changer de jambe en l'air, réception amortie en fente opposée","Buste vertical pendant tout l'enchaînement","Réception silencieuse — absorber avec les jambes, pas les articulations"],
variantes:[
{nom:"Fentes alternées dynamiques",note:"Changement de jambe au sol sans phase aérienne — le pont entre fente et pliométrie",muscles:"Quadriceps, fessiers",niveau:"Débutant"},
{nom:"Squat sauté",note:"Le saut bilatéral — puissance verticale sans l'asymétrie de la fente",muscles:"Quadriceps, mollets",niveau:"Intermédiaire"},
{nom:"Box jump",note:"Saut sur caisse avec réception amortie en hauteur — puissance maximale, impact minimal",muscles:"Chaîne d'extension complète",niveau:"Intermédiaire"}],
erreurs:["Réception genou rentré vers l'intérieur","Pas d'écart trop court — genou avant qui file au-delà de la pointe","Buste qui s'effondre vers l'avant à la réception"]},

{n:"Pistol squat assisté TRX",s:"3",r:"5-8/jambe",rest:"90s",ch:"Corps (assistance réglable)",cat:"principal",mat:"TRX",
morpho:" Fémurs longs : le contrepoids des sangles permet de rester vertical là où le pistol libre est quasi impossible.\nChevilles raides : l'assistance compense le manque de dorsiflexion, principal facteur limitant du pistol.\nDéséquilibre jambes : révélateur et correctif absolu des asymétries membres inférieurs.\nLa progression la plus intelligente vers le pistol squat libre — l'aide diminue au fil des semaines.",
tips:["Face à l'ancrage, sangles tendues bras semi-fléchis","Une jambe tendue devant, descendre en squat complet sur l'autre","Tirer sur les sangles uniquement quand nécessaire","Talon de la jambe d'appui ancré au sol tout le mouvement","Réduire l'aide des bras semaine après semaine"],
variantes:[
{nom:"Pistol box (sur banc)",note:"Descente contrôlée jusqu'au banc — l'amplitude se règle à la hauteur du support",muscles:"Quadriceps, fessier",niveau:"Intermédiaire"},
{nom:"Shrimp squat",note:"Jambe libre fléchie tenue derrière — le centre de gravité reste vertical, alternative au pistol",muscles:"Quadriceps, fessiers, équilibre",niveau:"Avancé"},
{nom:"Skater squat",note:"Jambe libre en arrière sans contact, buste penché — la version athlétique du squat unilatéral",muscles:"Fessier, quadriceps",niveau:"Avancé"},
{nom:"Cossack squat",note:"Transfert latéral d'une jambe à l'autre — la mobilité frontale qui prépare le pistol",muscles:"Adducteurs, quadriceps",niveau:"Intermédiaire"},
{nom:"Pistol squat libre",note:"Sans assistance — l'aboutissement du travail unilatéral au poids de corps",muscles:"Quadriceps, fessier, gainage",niveau:"Avancé"}],
erreurs:["Se hisser aux sangles au lieu de pousser sur la jambe","Genou qui s'effondre vers l'intérieur","Descente précipitée sans contrôle excentrique"]},

{n:"Squat élastique",s:"4",r:"12-20",rest:"60s",ch:"Élastique fort",cat:"principal",mat:"élastique",
morpho:" Lombaires sensibles : la résistance croissante charge le haut du mouvement en épargnant la position basse, l'inverse exact de la barre.\nFémurs longs : aucune barre sur le dos = liberté totale d'inclinaison du buste selon la morphologie.\nVerrouillage faible en haut de squat : l'élastique surcharge précisément cette zone.\nComplément parfait du squat barre : il renforce là où la barre ne résiste plus.",
tips:["Élastique sous les deux pieds, passé sur les épaules ou tenu aux épaules","Descendre en squat complet, l'élastique se détend en bas","Remonter en accélérant contre la résistance croissante","Genoux poussés vers l'extérieur pendant toute la montée","Verrouillage complet des hanches en haut contre tension maximale"],
variantes:[
{nom:"Squat sumo élastique",note:"Pieds écartés sur la bande — adducteurs et fessiers face à la résistance croissante",muscles:"Adducteurs, fessiers",niveau:"Débutant"},
{nom:"Squat + bande autour des genoux",note:"Mini-bande au-dessus des genoux — l'abduction active anti-valgus pendant tout le squat",muscles:"Moyen fessier, quadriceps",niveau:"Débutant"},
{nom:"Front squat élastique",note:"Bande tenue aux épaules coudes hauts — la posture front squat sous résistance progressive",muscles:"Quadriceps, gainage",niveau:"Intermédiaire"}],
erreurs:["Élastique mal centré sous les pieds — traction asymétrique","Remontée ralentie au lieu d'accélérer contre la résistance","Buste qui s'effondre quand la tension augmente"]},

{n:"Squat sur bosu",s:"3",r:"10-15",rest:"60-90s",ch:"Corps",cat:"gainage",mat:"bosu",
morpho:" Chevilles fragiles ou post-entorse : renforcement proprioceptif de référence — les stabilisateurs travaillent en continu.\nGenoux instables : recrutement accru des muscles péri-articulaires en conditions contrôlées.\nSports de terrain : réactivité des appuis directement transférable aux surfaces instables du jeu.\nOutil de prévention et de rééducation — la charge reste volontairement légère, la qualité prime.",
tips:["Bosu dôme vers le haut, monter un pied après l'autre au centre","Pieds largeur de hanches, orteils qui agrippent la surface","Descendre lentement en squat partiel puis complet avec la maîtrise","Fixer un point devant soi pour l'équilibre","Regagner la stabilité 1s en haut entre chaque répétition"],
variantes:[
{nom:"Squat bosu côté plat vers le haut",note:"Debout sur la plateforme rigide qui oscille — le niveau d'instabilité maximal",muscles:"Quadriceps, stabilisateurs de cheville",niveau:"Avancé"},
{nom:"Tenue unipodale sur bosu",note:"Un pied au centre du dôme en statique — la brique proprioceptive de base",muscles:"Stabilisateurs de cheville et hanche",niveau:"Débutant"},
{nom:"Squat sur coussin d'instabilité",note:"Surface souple plus basse — la régression douce avant le bosu",muscles:"Quadriceps, proprioception",niveau:"Débutant"}],
erreurs:["Monter sur le bosu d'un saut sans contrôle","Regard au sol qui dégrade l'équilibre","Chercher la profondeur avant la stabilité"]},

{n:"Fente arrière sur bosu",s:"3",r:"8-12/jambe",rest:"75s",ch:"Corps",cat:"principal",mat:"bosu",
morpho:" Genoux sensibles : la fente arrière est déjà la version la plus douce pour le genou — le bosu sous le pied avant ajoute la proprioception sans impact.\nChevilles instables : renforcement dynamique dans un mouvement fonctionnel complet.\nDéficit d'équilibre unilatéral : chaque répétition est un test d'appui — parfait pour sportifs en prévention.\nCombine force unilatérale et proprioception, deux qualités clés du sportif de terrain.",
tips:["Pied avant au centre du dôme, bien ancré avant de bouger","Grand pas en arrière, genou arrière qui descend vers le sol","Tibia avant vertical, poids dans le talon du pied avant","Remonter en poussant sur la jambe avant uniquement","Stabiliser complètement avant la répétition suivante"],
variantes:[
{nom:"Fente avant sur bosu",note:"Réception du pas sur le dôme — la coordination à l'impact, plus exigeante",muscles:"Quadriceps, stabilisateurs",niveau:"Avancé"},
{nom:"Fente arrière au sol",note:"La version stable — maîtrise du schéma avant l'instabilité",muscles:"Fessiers, quadriceps",niveau:"Débutant"},
{nom:"Fente arrière pied arrière sur le dôme",note:"L'instabilité passe derrière — la jambe avant charge, l'arrière stabilise",muscles:"Quadriceps jambe avant, proprioception",niveau:"Avancé"}],
erreurs:["Genou avant qui oscille latéralement","Pas arrière trop court — équilibre précaire","Pousser sur la jambe arrière pour remonter"]},

{n:"Front squat kettlebell",s:"4",r:"8-12",rest:"90s",ch:"2×12-24 kg",cat:"principal",mat:"kettlebell",
morpho:" Fémurs longs : la charge devant le corps contrebalance et permet un buste bien plus vertical qu'au back squat.\nPoignets raides : la position rack kettlebell est plus tolérante que le front squat barre à coudes hauts.\nGainage prioritaire : la sangle abdominale lutte contre la flexion pendant tout le mouvement.\nLe squat le plus rentable à la maison : charge devant, dos protégé, gainage intégré.",
tips:["Deux kettlebells en position rack : coudes bas, boules sur les avant-bras","Descendre en squat complet en gardant les coudes devant","Buste le plus vertical possible — la charge devant l'exige","Genoux dans l'axe des pointes de pieds","Expirer en remontant sans laisser les coudes tomber"],
variantes:[
{nom:"Goblet squat",note:"Une seule KB contre la poitrine — la porte d'entrée du squat charge devant",muscles:"Quadriceps, fessiers",niveau:"Débutant"},
{nom:"Front squat barre",note:"Barre sur les clavicules — la version haltérophile, mobilité de poignets exigée",muscles:"Quadriceps, gainage, haut du dos",niveau:"Avancé"},
{nom:"Thruster kettlebell",note:"Squat enchaîné d'un développé — la puissance jambe-épaule en un geste",muscles:"Quadriceps, deltoïdes",niveau:"Intermédiaire"},
{nom:"Squat Zercher",note:"Charge dans les plis des coudes — le gainage antérieur à son maximum",muscles:"Quadriceps, érecteurs",niveau:"Avancé"}],
erreurs:["Coudes qui tombent — les kettlebells tirent le buste en avant","Talons qui décollent en bas de squat","Amplitude réduite à cause d'une charge trop lourde"]},
],

"Ischio-jambiers":[
{n:"Leg curl allongé excentrique",s:"4",r:"10-12",rest:"75s",ch:"Modéré",cat:"principal",mat:"machine",
morpho:" Fémurs longs : renforcement ischios particulièrement important pour l'équilibre quadriceps/ischios — les fémurs longs créent un bras de levier plus important sur le genou.\nFémurs courts : exercice utile pour le volume et la force.\nPhase excentrique 3-4 secondes = méthode excentrique — maximise le recrutement musculaire, le gain de masse et la prévention tendinaire proximale.",
tips:["Phase excentrique de 3-4 secondes ABSOLUMENT — c'est le principe fondamental de","Contraction maximale en haut — serrer les fessiers","Ne pas laisser les hanches se soulever en cours de mouvement","Amplitude complète — extension quasi-totale en bas","Pause 1 seconde en haut avant l'excentrique"],
variantes:[
{nom:"Leg curl assis",note:"Hanche fléchie sur la machine assise — les ischios travaillent plus étirés, recrutement supérieur",muscles:"Ischio-jambiers en position allongée",niveau:"Débutant"},
{nom:"Leg curl debout unilatéral",note:"Une jambe à la machine verticale — flexion isolée côté par côté",muscles:"Ischio ciblé",niveau:"Débutant"},
{nom:"Leg curl glissé (sliders)",note:"Talons sur patins au sol en pont — la version maison à double fonction",muscles:"Ischios, fessiers",niveau:"Intermédiaire"},
{nom:"Nordic curl",note:"Chevilles bloquées, chute avant freinée — l'excentrique le plus puissant pour les ischios",muscles:"Ischio-jambiers (excentrique)",niveau:"Avancé"}],
erreurs:["Excentrique trop rapide — perd le principal bénéfice de l'exercice","Hanches qui se soulèvent — compensation lombaire","Amplitude partielle","Rebond en bas"]},

{n:"Romanian deadlift haltères",s:"3",r:"10-12",rest:"90s",ch:"60%",cat:"principal",mat:"haltères",
morpho:" Fémurs longs : amplitude naturellement grande — l'étirement des ischios est ressenti plus tôt dans le mouvement. Progression prudente des charges.\nFémurs courts : amplitude plus réduite — descendre légèrement plus bas pour atteindre l'étirement optimal.\nLordose naturelle OBLIGATOIRE — si le dos s'arrondit, la charge est trop lourde ou la souplesse insuffisante.",
tips:["Dos PLAT — lordose naturelle maintenue tout au long du mouvement","Haltères glissent le long des jambes — rester proche du corps","Descendre jusqu'à sentir l'étirement des ischios — mi-tibia maximum","Genoux légèrement fléchis et FIXES — ils ne bougent pas","Remonter en poussant les hanches vers l'avant — pas en tirant avec le dos"],
variantes:[
{nom:"RDL barre",note:"Barre unique qui longe les cuisses — la charge lourde de référence sur la charnière",muscles:"Ischios, fessiers, érecteurs",niveau:"Intermédiaire"},
{nom:"RDL unilatéral",note:"Une jambe d'appui — équilibre et stabilisateurs de hanche s'ajoutent",muscles:"Ischios, moyen fessier",niveau:"Intermédiaire"},
{nom:"Soulevé jambes tendues",note:"Genoux quasi verrouillés — l'étirement maximal des ischios, mobilité exigée",muscles:"Ischio-jambiers en étirement",niveau:"Avancé"},
{nom:"Good morning",note:"Charge sur les trapèzes — la même charnière avec bras de levier maximal",muscles:"Ischios, érecteurs",niveau:"Avancé"}],
erreurs:["Arrondir le dos — blessure lombaire grave et certaine","Descendre trop bas — perd la lordose naturelle","Genoux qui bougent en cours de mouvement","Regarder vers le bas — le cou se fléchit"]},

{n:"Hip thrust barre",s:"4",r:"10-15",rest:"90s",ch:"Charge lourde",cat:"principal",mat:"barre",
morpho:" Fémurs longs : avantage mécanique sur cet exercice — le levier naturel favorise l'extension complète de la hanche.\nFémurs courts : exercice confortable et efficace — position naturellement bonne.\nDébutant : commencer sans barre, puis haltère sur le ventre, puis barre. L'extension de hanche et non l'hyperextension lombaire est l'objectif.",
tips:["Omoplates sur le banc — pas les cervicales","Poussée explosive vers le haut — contraction maximale des fessiers en haut","Menton rentré, regard vers le plafond pendant le mouvement","Pieds à largeur des hanches, pointe légèrement vers l'extérieur","Contraction isométrique 1-2 secondes en haut"],
variantes:[
{nom:"Hip thrust unilatéral",note:"Une jambe — le côté paresseux ne peut plus se cacher",muscles:"Fessier ciblé",niveau:"Intermédiaire"},
{nom:"Pont fessier barre au sol",note:"Épaules au sol — amplitude courte, verrouillage lourd de fin d'extension",muscles:"Grand fessier (fin de course)",niveau:"Débutant"},
{nom:"Hip thrust machine",note:"Trajectoire et calage guidés — mise en place instantanée, dos protégé",muscles:"Grand fessier",niveau:"Débutant"},
{nom:"Hip thrust B-stance",note:"Un talon avancé en simple appui décalé — quasi unilatéral sans problème d'équilibre",muscles:"Fessier de la jambe principale",niveau:"Intermédiaire"}],
erreurs:["Hyperextension lombaire en haut — les lombaires travaillent au lieu des fessiers","Poussée insuffisante — ne pas aller en extension complète de hanche","Pieds trop proches ou trop loin — modifie l'activation musculaire"]},

{n:"Nordic curl au sol",s:"3",r:"5-8",rest:"120s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Tous morphotypes : excentrique pur des ischio-jambiers. Le plus efficace pour prévenir les déchirures musculaires des ischios. Exercice avancé.\nFémurs longs : amplitude maximale — progression très progressive obligatoire.",
tips:["Partenaire ou barre fixe pour les pieds","Descendre le plus lentement possible vers le sol","Utiliser les mains pour absorber l'impact en bas","Remonter en s'aidant des bras au début","Progression : bande élastique d'aide"],
variantes:[
{nom:"Nordic curl assisté élastique",note:"Bande accrochée devant qui retient la chute — la progression calibrée du mouvement complet",muscles:"Ischio-jambiers",niveau:"Intermédiaire"},
{nom:"Razor curl",note:"Hanches fléchies pendant la remontée — le bras de levier se raccourcit, étape intermédiaire",muscles:"Ischios (flexion de genou)",niveau:"Intermédiaire"},
{nom:"Leg curl glissé",note:"La même flexion active au sol sur patins — le petit frère accessible",muscles:"Ischios, fessiers",niveau:"Débutant"},
{nom:"Glute ham raise",note:"Sur banc GHD — le nordic avec extension de hanche intégrée",muscles:"Ischios, fessiers, érecteurs",niveau:"Avancé"}],
erreurs:["Progresser trop vite — risque de déchirure","Hanche qui fléchit","Amplitude insuffisante"]},

{n:"Glute ham raise machine",s:"3",r:"10",rest:"90s",ch:"Corps",cat:"principal",mat:"machine",
morpho:" Fémurs longs : excellent exercice — l'amplitude naturelle est exploitée pleinement.\nCombine extension de hanche + flexion du genou = travaille les ischios sur les 2 fonctions simultanément. Un des meilleurs exercices pour les ischios.",
tips:["Hanches au niveau du pad — pas plus haut ni plus bas","Extension complète en bas","Flexion complète en haut — fléchir les genoux jusqu'à 90°","Contrôle total tout au long","Progresser avec les bras si trop difficile"],
variantes:[
{nom:"Nordic curl",note:"Au sol chevilles bloquées — la version sans machine du même excentrique",muscles:"Ischio-jambiers",niveau:"Avancé"},
{nom:"Razor curl sur GHD",note:"Hanches fléchies maintenues — l'isolement de la flexion de genou sur le banc",muscles:"Ischios",niveau:"Intermédiaire"},
{nom:"Extension de hanche sur GHD",note:"Buste qui remonte genoux tendus — la charnière pure, ischios et fessiers en extenseurs",muscles:"Fessiers, ischios, érecteurs",niveau:"Intermédiaire"}],
erreurs:["Amplitude insuffisante","Hanches qui fléchissent en bas","Trop rapide"]},

{n:"Pont fessier sumo (sumo hip thrust)",s:"3",r:"15",rest:"75s",ch:"Modéré",cat:"isolation",mat:"barre",
morpho:" Fémurs longs : les pieds écartés en sumo permettent une meilleure activation des fessiers et ischios avec des fémurs longs.\nPieds écartés + pointes tournées vers l'extérieur = plus d'ischios et adducteurs.",
tips:["Pieds plus larges que les hanches, pointes à 45°","Même pattern que le hip thrust classique","Contraction maximale en haut — garder 2s","Descente contrôlée","Menton rentré — regard plafond"],
variantes:[
{nom:"Hip thrust classique",note:"Pieds largeur de hanches — le grand fessier sans l'accent adducteurs",muscles:"Grand fessier",niveau:"Débutant"},
{nom:"Frog pump",note:"Plantes de pieds jointes genoux ouverts — rotation externe maximale, fessiers isolés",muscles:"Grand fessier en rotation externe",niveau:"Débutant"},
{nom:"Pont fessier unilatéral",note:"Une jambe — asymétries révélées et corrigées",muscles:"Fessier ciblé",niveau:"Intermédiaire"}],
erreurs:["Hyperextension lombaire","Pieds trop écartés — instabilité","Amplitude insuffisante"]},

{n:"Leg curl glissé (sliders)",s:"3",r:"8-15",rest:"75s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Ischios courts ou raides : double fonction travaillée (extension de hanche + flexion de genou) — le schéma complet du muscle.\nGenoux sensibles : aucune charge externe, résistance auto-générée par le poids du bassin.\nPrévention claquage : l'excentrique glissé est l'un des meilleurs protecteurs des ischios chez le sportif.\nServiette sur parquet ou sliders : l'exercice ischios maison le plus efficace, proche du curl machine.",
tips:["Allongé sur le dos, talons sur les sliders ou une serviette","Monter le bassin en pont fessier — position de départ","Étendre lentement les jambes en gardant les hanches hautes","Ramener les talons vers les fesses en contractant les ischios","Le bassin ne touche jamais le sol pendant la série"],
variantes:[
{nom:"Leg curl glissé unilatéral",note:"Un talon sur le patin — la progression majeure du mouvement",muscles:"Ischio ciblé",niveau:"Avancé"},
{nom:"Leg curl ballon de gym",note:"Talons sur swiss ball — l'instabilité latérale s'ajoute à la flexion",muscles:"Ischios, stabilisateurs",niveau:"Intermédiaire"},
{nom:"Nordic curl",note:"L'étape suivante — l'excentrique complet chevilles bloquées",muscles:"Ischio-jambiers",niveau:"Avancé"}],
erreurs:["Bassin qui s'effondre pendant l'extension des jambes","Mouvement précipité sans contrôle excentrique","Cambrure lombaire pour compenser des ischios faibles"]},

{n:"Good morning élastique",s:"3-4",r:"12-15",rest:"60s",ch:"Élastique fort",cat:"principal",mat:"élastique",
morpho:" Lombaires fragiles : la résistance progressive épargne la position penchée, exactement là où la barre est la plus dangereuse.\nFémurs longs : la charnière de hanche est le schéma roi — l'élastique permet de la répéter en volume sans risque.\nIschios raides : étirement actif sous tension légère à chaque répétition — mobilité et force ensemble.\nL'outil parfait pour enseigner le hip hinge avant tout soulevé de terre.",
tips:["Debout sur l'élastique, bande passée derrière la nuque ou sur les trapèzes","Pousser les hanches vers l'arrière, genoux à peine fléchis","Descendre le buste jusqu'à sentir l'étirement des ischios","Dos plat verrouillé du bassin à la nuque","Remonter en contractant fessiers et ischios, hanches en avant"],
variantes:[
{nom:"Good morning barre légère",note:"Barre sur trapèzes — la version chargée classique du même schéma",muscles:"Ischios, érecteurs",niveau:"Avancé"},
{nom:"Good morning élastique assis",note:"Assis sur banc — la flexion de hanche isolée sans les genoux",muscles:"Érecteurs, ischios hauts",niveau:"Débutant"},
{nom:"Pull-through élastique",note:"Bande tirée entre les jambes dos à l'ancrage — la charnière apprise par la traction arrière",muscles:"Fessiers, ischios",niveau:"Débutant"},
{nom:"RDL élastique",note:"Debout sur la bande tenue en mains — la charnière bras devant, plus proche du soulevé",muscles:"Ischios, fessiers",niveau:"Débutant"}],
erreurs:["Dos qui s'arrondit en position basse","Genoux qui plient trop — devient un squat","Remontée en tirant avec les lombaires au lieu des hanches"]},

{n:"Leg curl TRX",s:"3",r:"8-15",rest:"75s",ch:"Corps",cat:"principal",mat:"TRX",
morpho:" Ischios faibles en flexion : cible spécifiquement la fonction fléchisseur de genou, souvent négligée au profit du hip hinge.\nGenoux post-blessure : renforcement sans compression ni charge externe, apprécié en réathlétisation.\nInstabilité des sangles : les ischios stabilisent en plus de fléchir — recrutement supérieur au curl machine.\nLe curl allongé version suspension : intensité surprenante dès les premières répétitions.",
tips:["Allongé sur le dos, talons dans les cradles des sangles","Monter le bassin en position de pont — corps aligné","Ramener les talons vers les fesses en fléchissant les genoux","Hanches qui restent hautes pendant toute la flexion","Étendre lentement en 2-3s sans poser le bassin"],
variantes:[
{nom:"Leg curl TRX unilatéral",note:"Un talon dans la sangle — la charge double sur une jambe",muscles:"Ischio ciblé",niveau:"Avancé"},
{nom:"Leg curl glissé",note:"La même flexion au sol sur patins — sans suspension ni oscillation",muscles:"Ischios, fessiers",niveau:"Intermédiaire"},
{nom:"Leg curl ballon de gym",note:"Talons sur swiss ball — instabilité comparable, matériel différent",muscles:"Ischios, stabilisateurs",niveau:"Intermédiaire"}],
erreurs:["Bassin qui touche le sol entre les répétitions","Balancement des sangles par manque de contrôle","Pousser sur la nuque au lieu de gainer"]},

{n:"Soulevé de terre unilatéral kettlebell",s:"3",r:"8-10/jambe",rest:"75s",ch:"12-24 kg",cat:"principal",mat:"kettlebell",
morpho:" Fémurs longs : l'amplitude unilatérale s'auto-régule — chacun descend selon sa mobilité réelle sans compensation.\nLombaires sensibles : charge divisée par deux ou trois par rapport au deadlift barre, pour un stimulus ischios équivalent.\nDéséquilibres bassin : le travail unipodal renforce les stabilisateurs de hanche (moyen fessier) en même temps que les ischios.\nL'exercice préféré des préparateurs physiques : force, équilibre et prévention en un seul geste.",
tips:["Kettlebell dans la main opposée à la jambe d'appui","Charnière de hanche : la jambe libre part en arrière, le buste descend","Hanches qui restent parallèles au sol — ne pas ouvrir le bassin","Dos plat, kettlebell qui descend le long du tibia","Remonter en serrant le fessier de la jambe d'appui"],
variantes:[
{nom:"SDT unilatéral en béquille (B-stance)",note:"Le pied libre reste posé en appui léger derrière — l'équilibre facilité, la charge reste unilatérale",muscles:"Ischios, fessier",niveau:"Débutant"},
{nom:"SDT unilatéral 2 kettlebells",note:"Une charge dans chaque main — la version lourde symétrique",muscles:"Ischios, grip",niveau:"Avancé"},
{nom:"SDT unilatéral contralatéral",note:"Charge dans la main opposée à la jambe d'appui — le moyen fessier lutte contre la rotation",muscles:"Ischios, moyen fessier",niveau:"Intermédiaire"},
{nom:"RDL barre",note:"La version bilatérale chargée — le socle de force de la charnière",muscles:"Ischios, fessiers, érecteurs",niveau:"Intermédiaire"}],
erreurs:["Bassin qui s'ouvre vers l'extérieur pendant la descente","Dos rond quand la charge devient lourde","Genou d'appui verrouillé en hyperextension"]},

{n:"Kettlebell swing",s:"4-5",r:"12-20",rest:"60-90s",ch:"12-32 kg",cat:"principal",mat:"kettlebell",
morpho:" Ischios/fessiers dominants recherchés : le swing est une extension de hanche explosive pure — zéro quadriceps si bien exécuté.\nLombaires solides requises : le dos travaille en isométrie stricte — technique de hinge parfaite obligatoire avant de charger.\nSports explosifs : le transfert puissance de hanche (sprint, sauts, combat) est le meilleur de tous les exercices kettlebell.\nCardio + puissance + chaîne postérieure : l'exercice signature de la kettlebell, inimitable avec un autre outil.",
tips:["Charnière de hanche : la kettlebell recule entre les cuisses, haut près de l'aine","Extension explosive des hanches — ce sont elles qui projettent la charge","La kettlebell flotte à hauteur de poitrine, bras relâchés","Fessiers serrés et corps vertical en haut du swing","Laisser la charge redescendre et recharger les hanches en ressort"],
variantes:[
{nom:"Swing américain",note:"La KB finit au-dessus de la tête — amplitude d'épaule complète, style CrossFit",muscles:"Chaîne postérieure, épaules",niveau:"Avancé",erreurs:["Finir en cambrure lombaire pour monter la charge — l'extension doit venir des hanches"]},
{nom:"Swing unilatéral",note:"Une seule main — le grip et l'anti-rotation s'invitent dans l'explosivité",muscles:"Chaîne postérieure, obliques, poigne",niveau:"Intermédiaire"},
{nom:"Swing alterné",note:"Changement de main au sommet du vol — coordination et conditionnement",muscles:"Chaîne postérieure, coordination",niveau:"Intermédiaire"},
{nom:"Double kettlebell swing",note:"Deux KB entre les jambes — la charge totale grimpe, la trajectoire se rétrécit",muscles:"Chaîne postérieure, grip",niveau:"Avancé"},
{nom:"Kettlebell snatch",note:"Le swing se prolonge jusqu'au bras tendu au zénith en un temps — le geste roi de la KB",muscles:"Chaîne postérieure, épaule, corps entier",niveau:"Avancé"}],
erreurs:["Squatter au lieu de faire une charnière de hanche","Tirer avec les bras et les épaules","Dos qui s'arrondit quand la charge passe entre les jambes"]},
],

"Fessiers":[
{n:"Fentes marchées haltères",s:"4",r:"12/jambe",rest:"60s",ch:"Modéré",cat:"principal",mat:"haltères",
morpho:" Fémurs longs : foulée longue pour maximiser l'activation des fessiers — les fémurs longs créent un avantage naturel sur la longueur de foulée.\nFémurs courts : foulée normale — les quadriceps seront davantage sollicités.\nLongueur de foulée = résultat : pas long = fessiers / pas court = quadriceps.",
tips:["Pas long pour maximiser l'activation des fessiers","Genou avant ne dépasse pas la pointe du pied","Buste droit, regard fixe devant","Pied avant bien ancré avant de pousser pour avancer","Alterner les jambes ou faire une jambe complète puis l'autre"],
variantes:[
{nom:"Fentes arrière",note:"Le pas recule — le genou avant reste stable, la version articulairement douce",muscles:"Fessiers, quadriceps",niveau:"Débutant"},
{nom:"Fente curtsy",note:"Jambe croisée derrière en diagonale — le moyen fessier dans un plan inhabituel",muscles:"Moyen fessier, quadriceps",niveau:"Intermédiaire"},
{nom:"Fentes latérales",note:"Le pas part sur le côté — adducteurs et hanche dans le plan frontal",muscles:"Adducteurs, fessiers",niveau:"Intermédiaire"},
{nom:"Fentes marchées barre",note:"Barre sur les trapèzes — le gainage vertical s'ajoute à la marche",muscles:"Quadriceps, fessiers, gainage",niveau:"Avancé"}],
erreurs:["Genou avant qui dépasse les orteils — stress sur la rotule","Buste qui s'incline vers l'avant","Pas trop court — quadriceps dominent au détriment des fessiers"]},

{n:"Abduction hanche poulie basse",s:"3",r:"15-20",rest:"45s",ch:"Léger",cat:"isolation",mat:"poulie",
morpho:" Tous morphotypes : fessier moyen et petit fessier — souvent négligés mais essentiels pour la stabilité du bassin lors de tous les exercices unilatéraux.\nHanches larges : le fessier moyen est souvent naturellement développé — exercice de maintien plutôt que de construction.\nHanches étroites : exercice constructif important pour l'équilibre visuel et la stabilité.",
tips:["Mouvement en arc dans le plan frontal strict","Contraction 1 seconde en haut","Excentrique contrôlé — résister à la gravité","Corps légèrement incliné vers l'avant pour cibler davantage le fessier moyen","Amplitude maximale dans l'axe — pas en avant"],
variantes:[
{nom:"Abduction élastique debout",note:"Bande aux chevilles — la même abduction réalisable partout",muscles:"Moyen fessier",niveau:"Débutant"},
{nom:"Abduction machine assise",note:"Genoux contre les pads — les deux côtés en simultané sous charge réglable",muscles:"Moyen fessier, petit fessier",niveau:"Débutant"},
{nom:"Clamshell",note:"Allongé sur le côté genoux fléchis, ouverture du genou supérieur — l'isolation en rotation externe",muscles:"Moyen fessier, rotateurs externes",niveau:"Débutant"},
{nom:"Fire hydrant",note:"En quadrupédie, la cuisse s'ouvre sur le côté — abduction genou fléchi",muscles:"Moyen fessier",niveau:"Débutant"}],
erreurs:["Compenser avec le buste","Amplitude en avant du plan frontal — hip flexors au lieu des fessiers","Trop lourd — perd le contrôle"]},

{n:"Fentes bulgares haltères",s:"4",r:"10/jambe",rest:"90s",ch:"Modéré",cat:"principal",mat:"haltères",
morpho:" Fémurs longs : foulée longue = plus d'activation fessiers. Un des meilleurs exercices unilatéraux.\nFémurs courts : exercice confortable — quadriceps très sollicités.\nMeilleur exercice unilatéral pour l'hypertrophie fessière selon de nombreux experts.",
tips:["Pied arrière sur banc (30-40cm), pied avant assez loin","Descendre quasi verticalement — buste droit","Genou arrière vers le sol sans le toucher","Pousse avec le talon avant pour remonter","Haltères aux côtés ou goblet devant"],
variantes:[
{nom:"Bulgares goblet",note:"Charge unique contre la poitrine — le contrepoids redresse le buste",muscles:"Quadriceps",niveau:"Débutant"},
{nom:"Bulgares barre",note:"Barre sur les trapèzes — la charge maximale sur l'unilatéral",muscles:"Quadriceps, fessiers, gainage",niveau:"Avancé"},
{nom:"Bulgares déficit",note:"Pied avant surélevé — la flexion gagne plusieurs degrés d'amplitude",muscles:"Fessier en étirement",niveau:"Avancé"},
{nom:"Split squat pied au sol",note:"Fente statique sans surélévation — la brique de base du schéma",muscles:"Quadriceps, fessiers",niveau:"Débutant"}],
erreurs:["Pied avant trop près — genou dépasse les orteils","Buste qui s'incline en avant","Pas assez de profondeur"]},

{n:"Cable kickback fessier",s:"4",r:"15-20",rest:"45s",ch:"Léger",cat:"isolation",mat:"poulie",
morpho:" Tous morphotypes : isolation fessière pure. Tension constante du câble supérieure aux exercices au sol.\nExtension de hanche avec genou fléchi = Grand fessier isolé. Extension genou tendu = ischio aussi.",
tips:["Poulie basse attachée à la cheville","Légère inclinaison vers l'avant, appui sur un support","Extension de hanche vers l'arrière — mouvement pur de la hanche","Contraction maximale en haut 1-2s","Genou légèrement fléchi pour isoler le fessier"],
variantes:[
{nom:"Kickback élastique",note:"Bande à la cheville — la version nomade du même geste",muscles:"Grand fessier",niveau:"Débutant"},
{nom:"Donkey kick",note:"En quadrupédie jambe fléchie qui pousse vers le plafond — l'extension au poids de corps",muscles:"Grand fessier",niveau:"Débutant"},
{nom:"Kickback jambe fléchie 90°",note:"Genou verrouillé en flexion — les ischios raccourcis laissent le fessier seul",muscles:"Grand fessier isolé",niveau:"Intermédiaire"},
{nom:"Extension de hanche machine",note:"Cuisse contre le boudin guidé — la charge lourde sur l'extension pure",muscles:"Grand fessier",niveau:"Débutant"}],
erreurs:["Extension lombaire au lieu de hanche","Amplitude insuffisante","Trop de charge — compensation"]},

{n:"Step-up haltères",s:"4",r:"12/jambe",rest:"60s",ch:"Modéré",cat:"principal",mat:"haltères",
morpho:" Fémurs longs : marche plus haute = plus d'activation fessière — exploiter la longueur naturelle.\nFonctionnel, unilatéral, préventif du genou. Hauteur de marche = paramètre clé.",
tips:["Marche à hauteur du genou ou légèrement en dessous","Appuyer fort avec tout le pied sur la marche","Monter en poussant avec la jambe avant (pas en sautant)","Contrôle en descendant — excentrique","Alterner les jambes ou finir une jambe puis l'autre"],
variantes:[
{nom:"Step-up latéral",note:"Montée par le côté de la caisse — le plan frontal et le moyen fessier",muscles:"Moyen fessier, quadriceps",niveau:"Intermédiaire"},
{nom:"Step-up box haute",note:"Caisse au niveau du genou ou plus — la flexion profonde déplace l'effort vers le fessier",muscles:"Grand fessier",niveau:"Intermédiaire"},
{nom:"Step-up + montée de genou",note:"Le genou libre monte à la hanche en haut — l'équilibre et le transfert sportif",muscles:"Fessiers, fléchisseurs de hanche",niveau:"Intermédiaire"},
{nom:"Step-up barre",note:"Barre sur les trapèzes — la version la plus chargée, gainage exigé",muscles:"Quadriceps, fessiers",niveau:"Avancé"}],
erreurs:["Pousser avec la jambe arrière — perd l'isolation","Marche trop basse","Pas de contrôle en descendant"]},

{n:"Hip thrust unilatéral au sol",s:"3",r:"10-15/jambe",rest:"60s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Lombaires sensibles : version au sol = amplitude réduite mais activation fessière quasi identique au hip thrust chargé.\nFémurs longs : ajuster la distance talon-fesse jusqu'à sentir le fessier plutôt que l'ischio.\nAsymétrie fessière : l'unilatéral révèle immédiatement le côté paresseux — fréquent après blessure.\nAucun matériel, activation maximale : l'exercice fessier de base à maîtriser avant toute charge.",
tips:["Allongé, un pied au sol proche de la fesse, l'autre jambe tendue ou genou vers la poitrine","Pousser dans le talon pour décoller le bassin","Monter jusqu'à l'alignement épaules-hanche-genou","Serrer le fessier 2s en haut — c'est là que tout se joue","Redescendre lentement sans poser complètement le bassin"],
variantes:[
{nom:"Pont fessier bilatéral",note:"Les deux pieds au sol — la brique d'apprentissage de la contraction",muscles:"Grand fessier",niveau:"Débutant"},
{nom:"Hip thrust unilatéral épaules surélevées",note:"Dos sur banc — l'amplitude s'allonge vers le bas",muscles:"Grand fessier en amplitude complète",niveau:"Intermédiaire"},
{nom:"Hip thrust B-stance",note:"Talon libre posé en appui léger — le quasi-unilatéral stable",muscles:"Fessier principal",niveau:"Débutant"},
{nom:"Frog pump",note:"Plantes de pieds jointes — la rotation externe qui court-circuite les ischios",muscles:"Grand fessier",niveau:"Débutant"}],
erreurs:["Pousser avec les lombaires — cambrure au lieu d'extension de hanche","Pied trop loin — les ischios prennent le relais","Bassin qui penche du côté de la jambe libre"]},

{n:"Marche latérale élastique",s:"3",r:"12-20 pas/sens",rest:"45s",ch:"Élastique léger/moyen",cat:"correctif",mat:"élastique",
morpho:" Genoux valgus (qui rentrent) : LE correctif de référence — le moyen fessier faible est la cause n°1 du valgus dynamique.\nCoureurs et sportifs de terrain : prévention directe du syndrome de l'essuie-glace et des douleurs rotuliennes.\nHanche qui tombe en appui unipodal : signe d'un moyen fessier déficient, corrigé par ce travail en abduction.\nEn activation pré-séance jambes : 2 séries suffisent à réveiller les fessiers avant de charger.",
tips:["Élastique autour des genoux ou des chevilles (plus dur)","Position quart de squat, buste légèrement penché","Pas latéraux contrôlés sans jamais rapprocher complètement les pieds","Tension constante dans l'élastique du premier au dernier pas","Pointes de pieds qui restent parallèles, jamais ouvertes"],
variantes:[
{nom:"Monster walk",note:"Pas en diagonale avant — les fléchisseurs de hanche rejoignent l'abduction",muscles:"Moyen fessier, fléchisseurs de hanche",niveau:"Débutant"},
{nom:"Clamshell élastique",note:"Allongé, ouverture du genou contre la bande — l'isolation en rotation externe",muscles:"Moyen fessier",niveau:"Débutant"},
{nom:"Squat + abduction élastique",note:"Mini-bande aux genoux pendant le squat — l'anti-valgus intégré au mouvement",muscles:"Moyen fessier, quadriceps",niveau:"Débutant"},
{nom:"Fire hydrant élastique",note:"Quadrupédie contre la bande — l'abduction genou fléchi sous résistance",muscles:"Moyen fessier",niveau:"Débutant"}],
erreurs:["Se redresser complètement — la tension fessière disparaît","Pieds qui se touchent entre les pas","Buste qui se balance latéralement à chaque pas"]},

{n:"Kickback élastique",s:"3",r:"15-20/jambe",rest:"45s",ch:"Élastique léger/moyen",cat:"isolation",mat:"élastique",
morpho:" Grand fessier peu réactif : l'isolation en extension pure reconnecte le muscle sans que les ischios ou lombaires compensent.\nFessier plat morphologiquement : le volume à haute répétition avec pic de contraction est la stratégie la plus payante.\nAmnésie fessière (position assise prolongée) : la contraction volontaire répétée restaure le schéma d'activation.\nRéplique fidèle du kickback poulie, réalisable partout.",
tips:["Élastique ancré bas ou autour des chevilles, en quadrupédie ou debout","Étendre la jambe vers l'arrière sans cambrer le dos","Contraction volontaire du fessier 1-2s en fin d'extension","Bassin fixe et carré — seule la hanche bouge","Revenir sous contrôle sans relâcher totalement la tension"],
variantes:[
{nom:"Kickback jambe fléchie 90°",note:"Genou verrouillé en flexion — les ischios hors-jeu, fessier isolé",muscles:"Grand fessier isolé",niveau:"Intermédiaire"},
{nom:"Fire hydrant élastique",note:"Ouverture latérale en quadrupédie — l'abduction complète le travail d'extension",muscles:"Moyen fessier",niveau:"Débutant"},
{nom:"Donkey kick",note:"La même extension sans bande — poussée du talon vers le plafond",muscles:"Grand fessier",niveau:"Débutant"},
{nom:"Kickback poulie basse",note:"Câble à la cheville — la tension constante de la salle",muscles:"Grand fessier",niveau:"Débutant"}],
erreurs:["Cambrure lombaire pour monter la jambe plus haut","Élan et balancement au lieu de contraction contrôlée","Rotation du bassin qui ouvre la hanche"]},

{n:"Hip thrust élastique",s:"4",r:"15-20",rest:"60s",ch:"Élastique fort",cat:"principal",mat:"élastique",
morpho:" Grand fessier : la résistance croissante colle parfaitement à la courbe de force — maximale en extension complète, là où le fessier est roi.\nLombaires sensibles : charge nulle en position basse, contrairement à la barre qui écrase dès le départ.\nDifficulté d'activation fessière : le pic de tension en haut force une contraction volontaire impossible à esquiver.\nLa version élastique surpasse la barre pour le pic de contraction — les deux sont complémentaires.",
tips:["Dos sur un banc ou au sol, élastique ancré de chaque côté et passé sur les hanches","Pieds ancrés proches des fesses, largeur de hanches","Pousser dans les talons jusqu'à l'extension complète des hanches","Menton rentré, côtes basses — pas de cambrure","Tenir 2s en haut contre la tension maximale"],
variantes:[
{nom:"Hip thrust élastique unilatéral",note:"Une jambe contre la bande — l'asymétrie révélée sous tension progressive",muscles:"Fessier ciblé",niveau:"Intermédiaire"},
{nom:"Pont fessier élastique au sol",note:"Sans banc — l'amplitude courte accessible partout",muscles:"Grand fessier",niveau:"Débutant"},
{nom:"Hip thrust élastique + abduction",note:"Deuxième bande autour des genoux — grand et moyen fessiers en simultané",muscles:"Grand et moyen fessiers",niveau:"Intermédiaire"},
{nom:"Hip thrust barre",note:"La version chargée de référence — la surcharge progressive lourde",muscles:"Grand fessier",niveau:"Intermédiaire"}],
erreurs:["Amplitude haute incomplète — l'extension finale est tout l'intérêt","Cambrure lombaire en fin de montée","Pieds trop loin — transfert vers les ischios"]},

{n:"Pont fessier sur bosu",s:"3",r:"12-15",rest:"60s",ch:"Corps",cat:"gainage",mat:"bosu",
morpho:" Chevilles ou genoux post-blessure : le pont instable renforce la chaîne d'appui complète sans charge verticale.\nFessiers et stabilisateurs de hanche ensemble : l'instabilité recrute le moyen fessier en continu pendant l'extension.\nSportifs de pivot : le contrôle du bassin sur surface instable transfère aux appuis du jeu.\nLa version bosu transforme un exercice simple en défi de coordination bassin-hanche.",
tips:["Allongé au sol, les deux pieds sur le dôme du bosu","Pousser dans les talons pour monter le bassin","Bassin strictement horizontal — l'instabilité veut le faire pencher","Serrer les fessiers 1-2s en haut","Descente lente en gardant le contrôle latéral"],
variantes:[
{nom:"Pont bosu unilatéral",note:"Une jambe sur le dôme — force et contrôle latéral au maximum",muscles:"Fessier, stabilisateurs de hanche",niveau:"Avancé"},
{nom:"Pont pieds sur ballon de gym",note:"Swiss ball sous les talons — l'instabilité roulante, encore plus exigeante",muscles:"Fessiers, ischios, gainage",niveau:"Avancé"},
{nom:"Hip thrust épaules sur banc",note:"Le retour au stable — l'amplitude complète pour charger",muscles:"Grand fessier",niveau:"Débutant"}],
erreurs:["Bassin qui penche d'un côté pendant la montée","Pousser sur les pointes au lieu des talons","Vitesse excessive qui masque le déficit de contrôle"]},

{n:"Squat sumo kettlebell",s:"4",r:"10-15",rest:"75s",ch:"16-32 kg",cat:"principal",mat:"kettlebell",
morpho:" Fémurs longs : la position sumo écartée + charge basse entre les jambes = le squat le plus vertical qui existe pour cette morphologie.\nHanches ouvertes naturellement : la position écartée exploite cette facilité — profondeur immédiate.\nAdducteurs et fessiers prioritaires : l'écartement déplace le travail des quadriceps vers l'intérieur et l'arrière de la cuisse.\nLe squat le plus accessible pour apprendre la profondeur avec un dos parfaitement neutre.",
tips:["Pieds bien plus larges que les épaules, pointes ouvertes à 30-45°","Kettlebell tenue à deux mains entre les jambes, bras relâchés","Descendre entre les jambes, genoux qui suivent les pointes","Buste vertical — la charge basse le permet naturellement","Serrer les fessiers en remontant, hanches complètement tendues en haut"],
variantes:[
{nom:"Sumo deadlift kettlebell",note:"Départ charge posée au sol — la charnière s'ajoute à l'écartement",muscles:"Fessiers, adducteurs, ischios",niveau:"Débutant"},
{nom:"Sumo squat + row",note:"Tirage de la KB en position basse — le dos rejoint les jambes",muscles:"Fessiers, dorsaux",niveau:"Intermédiaire"},
{nom:"Goblet squat",note:"Pieds resserrés, KB contre la poitrine — le retour au squat axial classique",muscles:"Quadriceps, fessiers",niveau:"Débutant"}],
erreurs:["Genoux qui rentrent à la remontée","Buste qui plonge en avant — la KB doit rester sous le buste","Amplitude réduite alors que la position sumo permet la profondeur"]},
],

"Abdominaux":[
{n:"Planche avant isométrique",s:"4",r:"30-60s",rest:"45s",ch:"Corps",cat:"gainage",mat:"poids de corps",
morpho:" Tous morphotypes : exercice fondamental universel — le transverse profond est indispensable pour la protection lombaire lors de tous les exercices lourds. Base absolue avant d'augmenter les volumes.\nProgresser en soulevant successivement un bras ou une jambe une fois les 60 secondes atteintes facilement.",
tips:["Corps aligné — tête, épaules, hanches et chevilles en ligne droite","Contracter l'abdomen comme si on allait recevoir un coup de poing","Ne pas retenir sa respiration — respiration diaphragmatique maintenue","Ne pas laisser les hanches monter ou descendre","Progresser en soulevant un bras ou une jambe"],
variantes:[
{nom:"Planche haute bras tendus",note:"Appui sur les mains — les épaules et le dentelé rejoignent le gainage",muscles:"Grand droit, dentelé, épaules",niveau:"Débutant"},
{nom:"Planche 3 appuis",note:"Un bras ou une jambe décollé — l'anti-rotation s'ajoute à l'anti-extension",muscles:"Transverse, obliques",niveau:"Intermédiaire"},
{nom:"Stir the pot",note:"Avant-bras sur swiss ball, petits cercles contrôlés — la planche dynamique de McGill",muscles:"Transverse, obliques, épaules",niveau:"Avancé"},
{nom:"Body saw",note:"Va-et-vient du corps sur les avant-bras — le levier s'allonge à chaque passage",muscles:"Grand droit, transverse",niveau:"Avancé"},
{nom:"Gainage latéral",note:"Appui sur un avant-bras de profil — l'anti-flexion latérale et les obliques",muscles:"Obliques, carré des lombes",niveau:"Débutant"}],
erreurs:["Hanches qui montent — n'est plus un gainage mais une pirouette","Corps en angle au niveau des hanches","Retenir sa respiration sous effort"]},

{n:"Crunch contrôlé",s:"4",r:"15-20",rest:"45s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Tous morphotypes : technique universelle. BAS DU DOS AU SOL est le critère absolu — si le bas du dos décolle, c'est le PSOAS qui travaille et non les abdominaux (erreur fondamentale des crunches mal exécutés).\nMains aux tempes, jamais sur la nuque.",
tips:["Bas du dos COLLÉ au sol — critère absolu de bonne exécution","Souffler fort à la contraction pour vider les poumons","Enrouler vertèbre par vertèbre — pas une bascule de bassin","Regarder vers le plafond, pas vers les genoux","Genoux fléchis à 90°, pieds à plat sur le sol"],
variantes:[
{nom:"Crunch câble agenouillé",note:"Corde tenue derrière la tête face à la poulie — la flexion de tronc enfin chargeable",muscles:"Grand droit sous charge",niveau:"Intermédiaire"},
{nom:"Crunch sur ballon",note:"Dos épousant le swiss ball — l'amplitude gagne toute la phase d'extension",muscles:"Grand droit en amplitude complète",niveau:"Débutant"},
{nom:"Crunch décliné",note:"Banc incliné tête en bas — la gravité augmente la résistance en bas de course",muscles:"Grand droit",niveau:"Intermédiaire"},
{nom:"Reverse crunch",note:"Le bassin s'enroule vers la poitrine, épaules au sol — la flexion par le bas",muscles:"Grand droit (portion basse)",niveau:"Débutant"}],
erreurs:["Bas du dos qui décolle — psoas travaille au lieu des abdominaux","Tirer sur la nuque avec les mains — risque cervical","Amplitude excessive avec lombaires décollées","Vitesse trop rapide — perd le contrôle excentrique"]},

{n:"Relevé de jambes suspendu",s:"3",r:"12-15",rest:"60s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Tous morphotypes : bas abdominaux + iliopsoas. SUSPENDU à une barre ou lombaires collées au sol OBLIGATOIREMENT — jambes en l'air librement sans enroulement du bassin = le psoas travaille, pas les abdominaux.\nBras longs : prise facile sur barre fixe — bonne option suspension.",
tips:["Enrouler le BASSIN en montant — c'est ce mouvement qui active les bas-abdominaux","Descente contrôlée 3 secondes — ne pas laisser tomber les jambes","Jambes tendues si niveau avancé, genoux fléchis si débutant","Ne pas se balancer pour se propulser","Regard fixe devant pour la stabilité"],
variantes:[
{nom:"Relevé de genoux suspendu",note:"Genoux fléchis vers la poitrine — le levier raccourci, la régression directe",muscles:"Grand droit, fléchisseurs de hanche",niveau:"Débutant"},
{nom:"Toes-to-bar",note:"Les pieds montent toucher la barre — l'enroulement complet du bassin, style CrossFit",muscles:"Grand droit complet, dorsaux",niveau:"Avancé"},
{nom:"Essuie-glaces (windshield wipers)",note:"Jambes tendues qui balaient de gauche à droite — la rotation suspendue",muscles:"Obliques, grand droit",niveau:"Avancé"},
{nom:"Relevé de jambes chaise romaine",note:"Dos calé, avant-bras en appui — le balancement neutralisé",muscles:"Grand droit, fléchisseurs de hanche",niveau:"Débutant"},
{nom:"Dragon flag",note:"Corps tendu en levier depuis les épaules — l'anti-extension extrême popularisée par Bruce Lee",muscles:"Gainage complet",niveau:"Avancé"}],
erreurs:["Pas d'enroulement du bassin — psoas travaille seul","Balancement du corps pour se propulser","Amplitude insuffisante"]},

{n:"Gainage latéral",s:"3",r:"30-45s",rest:"45s",ch:"Corps",cat:"gainage",mat:"poids de corps",
morpho:" Tous morphotypes : obliques + stabilisateurs latéraux. Indispensable pour la stabilité du bassin lors des exercices unilatéraux et la prévention des blessures lombaires.\nÀ combiner avec la planche frontale pour un gainage complet.",
tips:["Corps en ligne droite de la tête aux pieds","La hanche ne doit pas descendre ou monter","Regard fixe devant pour maintenir l'alignement","Progresser en soulevant le bras ou la jambe supérieure","Version débutant : genoux au sol"],
variantes:[
{nom:"Gainage latéral genou posé",note:"Appui sur le genou inférieur — le levier raccourci pour construire la base",muscles:"Obliques",niveau:"Débutant"},
{nom:"Side plank + rotation (thread the needle)",note:"Le bras libre passe sous le buste puis s'ouvre — la rotation contrôlée s'ajoute",muscles:"Obliques, rotation thoracique",niveau:"Intermédiaire"},
{nom:"Side plank + abduction",note:"La jambe supérieure se lève en position — le moyen fessier rejoint les obliques",muscles:"Obliques, moyen fessier",niveau:"Intermédiaire"},
{nom:"Planche Copenhague",note:"Jambe supérieure posée sur un banc, l'autre suspendue — les adducteurs en première ligne",muscles:"Adducteurs, obliques",niveau:"Avancé"}],
erreurs:["Hanche qui descend — compensation courante","Corps en angle au niveau des hanches","Retenir la respiration sous effort"]},

{n:"Hollow body hold",s:"3",r:"30-45s",rest:"60s",ch:"Corps",cat:"gainage",mat:"poids de corps",
morpho:" Tous morphotypes : position fondamentale de la gymnastique. Active le transverse + obliques + psoas + quadriceps simultanément. Gainage anti-extension le plus complet.\nBase de nombreux exercices avancés (L-sit, handstand).",
tips:["Allongé sur le dos — creuser le nombril vers le sol","Bras tendus derrière la tête, jambes tendues à 20-30° du sol","Corps en forme de « banane inversée »","Ne jamais laisser le bas du dos décoller","Progression : genoux fléchis → jambes tendues hautes → jambes tendues basses"],
variantes:[
{nom:"Tuck hold",note:"Genoux ramenés vers la poitrine — le levier minimal pour apprendre le plaquage lombaire",muscles:"Grand droit, transverse",niveau:"Débutant"},
{nom:"Hollow rock",note:"Bascules d'avant en arrière en position tenue — la version dynamique des gymnastes",muscles:"Grand droit en gainage dynamique",niveau:"Avancé"},
{nom:"Arch hold (superman)",note:"La position miroir sur le ventre — la chaîne postérieure équilibre le travail",muscles:"Érecteurs, fessiers, trapèzes",niveau:"Débutant"}],
erreurs:["Bas du dos qui décolle — perd le gainage","Jambes trop hautes — trop facile","Retenir la respiration"]},

{n:"Pallof press câble",s:"3",r:"12/côté",rest:"60s",ch:"Léger-modéré",cat:"gainage",mat:"poulie",
morpho:" Tous morphotypes : gainage ANTI-ROTATION — souvent négligé mais fondamental pour la stabilité du tronc.\nSimule les contraintes rotationnelles de la vie quotidienne et du sport. Protège les lombaires.",
tips:["Poulie à hauteur du sternum — côté au câble","Tenir les mains devant la poitrine, pousser vers l'avant sans rotation","Corps immobile — tout le travail est dans le gainage","Revenir lentement","Pieds à largeur des épaules, genoux légèrement fléchis"],
variantes:[
{nom:"Pallof press à genoux",note:"Base agenouillée — les jambes ne compensent plus la rotation",muscles:"Obliques, transverse",niveau:"Intermédiaire"},
{nom:"Pallof press overhead",note:"Les bras finissent au-dessus de la tête — anti-rotation et anti-extension combinées",muscles:"Obliques, grand droit",niveau:"Avancé"},
{nom:"Rotation câble contrôlée (woodchop)",note:"La rotation devient le mouvement — de résister à produire",muscles:"Obliques en rotation chargée",niveau:"Intermédiaire"},
{nom:"Pallof press élastique",note:"Bande à la place du câble — le même anti-mouvement partout",muscles:"Obliques, transverse",niveau:"Débutant"}],
erreurs:["Rotation du corps","Trop lourd — rotation inévitable","Amplitude insuffisante"]},

{n:"Bicycle crunch",s:"4",r:"20/côté",rest:"45s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Tous morphotypes : obliques + grand droit.\nSi bien exécuté (lentement, rotation réelle du buste), c'est un des meilleurs exercices pour les obliques. Si trop rapide = momentum, pas de gainage.",
tips:["Lentement ! Le tempo est la clé — 2s par répétition","Rotation réelle du buste — pas juste le coude qui avance","Jambe opposée s'étend en même temps","Bas du dos collé au sol en permanence","Mains aux tempes — ne pas tirer sur la nuque"],
variantes:[
{nom:"Crunch oblique",note:"Coude vers le genou opposé sans pédalage — la rotation isolée un côté à la fois",muscles:"Obliques",niveau:"Débutant"},
{nom:"Dead bug",note:"Le cousin contrôlé dos plaqué — la dissociation sans traction cervicale",muscles:"Transverse, grand droit",niveau:"Débutant"},
{nom:"Mountain climbers croisés",note:"Genou vers le coude opposé en planche — la même diagonale en gainage dynamique",muscles:"Obliques, fléchisseurs de hanche",niveau:"Intermédiaire"}],
erreurs:["Trop rapide — momentum remplace le gainage","Pas de rotation réelle du buste","Nuque tirée avec les mains"]},

{n:"Mountain climbers",s:"3-4",r:"20-40s",rest:"45s",ch:"Corps",cat:"gainage",mat:"poids de corps",
morpho:" Tous morphotypes : gainage dynamique universel — la planche reste stable pendant que les jambes pédalent.\nPoignets sensibles : réaliser sur les poings ou sur un support surélevé.\nSportifs : conditionnement métabolique + gainage anti-extension simultanés — parfait en circuit.\nLa vitesse est un piège : lent et gainé vaut mieux que rapide et désarticulé.",
tips:["Position de planche haute, mains sous les épaules","Ramener un genou vers la poitrine sans lever les fesses","Alterner les jambes en gardant le bassin parfaitement stable","Épaules qui restent au-dessus des mains tout le long","Abdominaux verrouillés — le bas du dos ne bouge jamais"],
variantes:[
{nom:"Mountain climbers croisés",note:"Genou vers le coude opposé — la diagonale recrute les obliques",muscles:"Obliques, fléchisseurs de hanche",niveau:"Intermédiaire"},
{nom:"Spiderman climbers",note:"Genou vers le coude extérieur — l'ouverture de hanche s'ajoute au gainage",muscles:"Obliques, mobilité de hanche",niveau:"Intermédiaire"},
{nom:"Mountain climbers mains surélevées",note:"Mains sur banc — le buste redressé allège la charge sur les épaules",muscles:"Grand droit, fléchisseurs",niveau:"Débutant"},
{nom:"Slider climbers",note:"Pieds sur patins qui glissent — la friction remplace l'impact du saut",muscles:"Grand droit, fléchisseurs de hanche",niveau:"Intermédiaire"}],
erreurs:["Fesses qui montent en pique","Rebond du bassin à chaque changement de jambe","Épaules qui reculent derrière les mains"]},

{n:"Dead bug",s:"3",r:"8-12/côté",rest:"45s",ch:"Corps",cat:"correctif",mat:"poids de corps",
morpho:" Lombaires fragiles : LE gainage le plus sûr qui existe — le dos est plaqué au sol pendant tout l'exercice.\nCambrure lombaire excessive : apprend la dissociation bassin/jambes, compétence clé avant squat et soulevé de terre.\nDébutants et reprise post-blessure : la première brique du gainage avant la planche.\nSimple en apparence, exigeant en exécution : la qualité du plaquage lombaire fait tout.",
tips:["Allongé sur le dos, bras vers le plafond, hanches et genoux à 90°","Plaquer le bas du dos au sol AVANT de bouger — et le garder plaqué","Étendre lentement une jambe et le bras opposé","Revenir sans jamais laisser le lombaire décoller","Expirer pendant l'extension pour renforcer le verrouillage"],
variantes:[
{nom:"Dead bug jambes seules",note:"Bras immobiles vers le plafond — la moitié du schéma pour débuter",muscles:"Transverse",niveau:"Débutant"},
{nom:"Dead bug élastique",note:"Bande ancrée derrière tenue en tension — l'anti-extension chargée",muscles:"Grand droit, transverse",niveau:"Intermédiaire"},
{nom:"Bird dog",note:"Le miroir en quadrupédie — la même dissociation face au sol",muscles:"Érecteurs, transverse, fessiers",niveau:"Débutant"}],
erreurs:["Bas du dos qui se cambre pendant l'extension","Mouvement rapide qui masque la perte de contrôle","Respiration bloquée pendant tout l'exercice"]},

{n:"V-ups",s:"3",r:"10-15",rest:"60s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Buste long : bras de levier important — commencer par la version tuck (genoux fléchis).\nFléchisseurs de hanche dominants : penser à enrouler la colonne, pas à lever les jambes tendues.\nGrand droit complet : sollicite simultanément les portions hautes et basses — rare en un seul exercice.\nVersion avancée du crunch : réservée à ceux qui contrôlent déjà le hollow body.",
tips:["Allongé bras tendus derrière la tête, jambes tendues","Monter simultanément buste et jambes pour former un V","Toucher les pieds ou les tibias en haut du mouvement","Redescendre lentement sans reposer complètement bras et talons","Garder le bas du dos en contact avec le sol au retour"],
variantes:[
{nom:"Tuck-up",note:"Genoux fléchis ramenés — le levier court du même schéma",muscles:"Grand droit",niveau:"Débutant"},
{nom:"V-up unilatéral alterné",note:"Une jambe à la fois — la marche intermédiaire vers le V complet",muscles:"Grand droit, obliques",niveau:"Intermédiaire"},
{nom:"Jackknife sur ballon",note:"Pieds sur swiss ball en planche, genoux ramenés — l'enroulement roulant instable",muscles:"Grand droit, stabilisateurs",niveau:"Intermédiaire"},
{nom:"Hollow rock",note:"Le gainage bascule des gymnastes — la tension continue sans flexion complète",muscles:"Grand droit, transverse",niveau:"Avancé"}],
erreurs:["À-coups de nuque pour lancer le mouvement","Bas du dos qui décolle en position basse","Jambes qui plient de plus en plus au fil de la série"]},

{n:"Planche sur bosu",s:"3",r:"30-60s",rest:"45-60s",ch:"Corps",cat:"gainage",mat:"bosu",
morpho:" Épaules à renforcer : l'instabilité recrute la coiffe et le dentelé en plus du tronc.\nPlanche classique trop facile : le bosu prolonge la progression sans ajouter de lest.\nSportifs : les micro-corrections permanentes reproduisent les perturbations du jeu réel.\nUne planche 30s sur bosu vaut une planche 60s au sol en recrutement des stabilisateurs.",
tips:["Avant-bras sur le dôme (ou mains sur le plat retourné)","Corps aligné tête-épaules-bassin-talons","Résister aux oscillations sans bloquer la respiration","Nombril aspiré vers la colonne, fessiers serrés","Arrêter la série dès que le bassin commence à s'affaisser"],
variantes:[
{nom:"Planche bosu + levée de jambe",note:"Trois appuis sur surface instable — l'anti-rotation au carré",muscles:"Transverse, obliques, fessiers",niveau:"Avancé"},
{nom:"Stir the pot sur ballon",note:"Cercles des avant-bras sur swiss ball — l'instabilité roulante, le niveau au-dessus",muscles:"Transverse, épaules",niveau:"Avancé"},
{nom:"Gainage latéral sur bosu",note:"Avant-bras sur le dôme de profil — les obliques en instabilité",muscles:"Obliques, carré des lombes",niveau:"Avancé"},
{nom:"Planche au sol",note:"Le retour au stable — la base à maîtriser 60s avant l'instable",muscles:"Grand droit, transverse",niveau:"Débutant"}],
erreurs:["Bassin qui s'affaisse quand la fatigue arrive","Épaules crispées remontées vers les oreilles","Retenir sa respiration pendant la tenue"]},

{n:"Pallof press élastique",s:"3",r:"10-12/côté",rest:"45s",ch:"Élastique moyen",cat:"gainage",mat:"élastique",
morpho:" Lombaires fragiles : gainage anti-rotation sans aucune flexion de colonne — le plus sûr des exercices d'obliques.\nSports de rotation (combat, raquette, golf) : apprend à résister puis transférer la rotation — la base de la puissance rotationnelle.\nTronc instable sous charge unilatérale : correctif direct pour porter, pousser et tirer asymétrique.\nLa version élastique de l'exercice câble : identique en efficacité, réalisable partout.",
tips:["Élastique ancré à hauteur de poitrine, se placer de profil","Tenir la poignée à deux mains contre le sternum","Tendre les bras devant soi sans laisser le buste tourner","Tenir 2s bras tendus — le moment le plus dur","Ramener au sternum sous contrôle, buste toujours face devant"],
variantes:[
{nom:"Pallof press à genoux",note:"Base agenouillée — la compensation des jambes disparaît",muscles:"Obliques, transverse",niveau:"Intermédiaire"},
{nom:"Pallof press + marche latérale",note:"S'éloigner de l'ancrage bras tendus — la tension grandit à chaque pas",muscles:"Obliques en tension croissante",niveau:"Intermédiaire"},
{nom:"Pallof press overhead",note:"Bras vers le plafond — anti-rotation et anti-extension réunis",muscles:"Obliques, grand droit",niveau:"Avancé"},
{nom:"Pallof press câble",note:"La version poulie — tension parfaitement constante en salle",muscles:"Obliques",niveau:"Débutant"}],
erreurs:["Buste qui pivote vers l'ancrage","Bras qui dévient au lieu de rester dans l'axe du sternum","Distance à l'ancrage trop faible — tension insuffisante"]},

{n:"Body saw TRX",s:"3",r:"8-12",rest:"60s",ch:"Corps",cat:"gainage",mat:"TRX",
morpho:" Lombaires solides requises : l'anti-extension dynamique est intense — maîtriser la planche 60s avant.\nGrand droit et transverse profonds : le recul du corps allonge le bras de levier à chaque répétition.\nProgression au-delà de la planche : l'un des rares gainages qui reste difficile pour les athlètes confirmés.\nQuelques centimètres de va-et-vient suffisent — l'amplitude se gagne sur des semaines.",
tips:["Pieds dans les sangles, avant-bras au sol en planche","Pousser le corps vers l'arrière avec les avant-bras","Reculer seulement tant que le bassin reste aligné","Revenir en position de planche en tirant des épaules","Mouvement lent et continu, sans à-coups"],
variantes:[
{nom:"Planche pieds TRX",note:"La version statique suspendue — déjà plus dure que la planche au sol",muscles:"Grand droit, transverse",niveau:"Intermédiaire"},
{nom:"Pike TRX",note:"Les fesses montent en V inversé — la flexion de hanche remplace le va-et-vient",muscles:"Grand droit, fléchisseurs, épaules",niveau:"Avancé"},
{nom:"Tuck TRX",note:"Genoux ramenés vers la poitrine — l'enroulement dynamique suspendu",muscles:"Grand droit, fléchisseurs de hanche",niveau:"Intermédiaire"},
{nom:"Body saw sur sliders",note:"Pieds sur patins au sol — le même levier coulissant sans suspension",muscles:"Grand droit, transverse",niveau:"Intermédiaire"}],
erreurs:["Reculer trop loin dès les premières séances — lombaires en danger","Bassin qui se cambre au point le plus éloigné","Épaules qui s'effondrent entre les omoplates"]},

{n:"Pike TRX",s:"3",r:"8-12",rest:"60-75s",ch:"Corps",cat:"principal",mat:"TRX",
morpho:" Ischios raides : plier légèrement les genoux au sommet — la mobilité arrière ne doit pas limiter le travail abdominal.\nFlexion de hanche + enroulement du tronc : le pike combine les deux fonctions du caisson abdominal.\nÉpaules engagées : la position de planche renversée renforce aussi le haut du corps.\nL'un des exercices d'abdominaux suspendus les plus complets, transition vers les mouvements de gymnastique.",
tips:["Pieds dans les sangles, position de planche haute mains au sol","Monter les fesses vers le plafond en gardant les jambes tendues","Le regard passe vers les pieds au sommet du V inversé","Redescendre en planche parfaitement alignée, sans creux lombaire","Épaules actives qui repoussent le sol en permanence"],
variantes:[
{nom:"Tuck TRX",note:"Genoux fléchis ramenés — le levier court du pike",muscles:"Grand droit",niveau:"Intermédiaire"},
{nom:"Pike TRX unilatéral",note:"Une jambe dans la sangle, l'autre libre — l'anti-rotation extrême",muscles:"Grand droit, obliques",niveau:"Avancé"},
{nom:"Atomic push-up",note:"Pompe puis genoux-poitrine enchaînés — la poussée rejoint la flexion",muscles:"Pectoraux, grand droit",niveau:"Avancé"},
{nom:"Jackknife sur ballon",note:"Pieds sur swiss ball — la même mécanique en version roulante",muscles:"Grand droit, stabilisateurs",niveau:"Intermédiaire"}],
erreurs:["Creux lombaire au retour en planche","Genoux qui plient complètement — devient un tuck","Élan et balancier au lieu d'une montée contrôlée"]},

{n:"Russian twist kettlebell",s:"3",r:"10-16 rotations",rest:"60s",ch:"8-16 kg",cat:"principal",mat:"kettlebell",
morpho:" Lombaires sensibles : rester sur une amplitude courte et un dos long — la rotation lombaire pure est à proscrire.\nObliques marqués recherchés : la rotation chargée est le stimulus direct des obliques externes.\nSports de frappe : renforce la capacité à créer et transférer la rotation buste/hanches.\nLa qualité de rotation thoracique prime sur la vitesse et la charge — c'est un exercice technique.",
tips:["Assis, buste incliné à 45°, dos long, kettlebell tenue à deux mains","Pieds au sol au début — les décoller est une progression","Tourner les épaules d'un côté à l'autre, la KB suit le buste","La rotation vient du thorax, pas des bras qui balancent","Chaque rotation contrôlée — la charge ne touche pas le sol"],
variantes:[
{nom:"Russian twist sans charge",note:"Mains jointes — l'apprentissage de la rotation thoracique propre",muscles:"Obliques",niveau:"Débutant"},
{nom:"Rotation debout bras tendus",note:"KB tenue devant, rotation contrôlée du buste — la version fonctionnelle transférable",muscles:"Obliques, hanches",niveau:"Intermédiaire"},
{nom:"Woodchop (bûcheron)",note:"Diagonale du haut vers la hanche opposée — la rotation chargée sur toute l'amplitude",muscles:"Obliques, épaules",niveau:"Intermédiaire"},
{nom:"Pallof press",note:"L'anti-rotation — le complément qui apprend à résister avant de produire",muscles:"Obliques, transverse",niveau:"Débutant"}],
erreurs:["Bras qui balancent la charge sans rotation du buste","Dos qui s'arrondit en flexion lombaire","Vitesse excessive au détriment de l'amplitude de rotation"]},
],

"Lombaires":[
{n:"Hyperextension 45°",s:"4",r:"15",rest:"60s",ch:"Corps",cat:"correctif",mat:"poids de corps",
morpho:" Tous morphotypes : érecteurs spinaux + ischios + fessiers. Lien fondamental de la chaîne postérieure. Toujours avec abdos actifs. Limite à l'HORIZONTALE ABSOLUMENT — dépasser crée une compression discale.\nFémurs longs : très bonne amplitude naturelle sur cet exercice.",
tips:["Lordose naturelle maintenue — ne pas arrondir le dos","Amplitude JUSQU'À L'HORIZONTAL UNIQUEMENT — jamais au-delà","Tempo lent — pas d'élan en bas","Haltère sur la poitrine pour progresser quand le poids du corps devient trop facile","Contracter les abdominaux pour protéger les lombaires"],
variantes:[
{nom:"Extension horizontale sur GHD",note:"Banc à l'horizontale — le bras de levier maximal en bas de course",muscles:"Érecteurs, fessiers, ischios",niveau:"Intermédiaire"},
{nom:"Hyperextension accent fessiers",note:"Dos volontairement arrondi haut, pivot depuis la hanche — l'extension devient fessière",muscles:"Grand fessier dominant",niveau:"Intermédiaire"},
{nom:"Extension sur ballon",note:"Ventre sur swiss ball pieds calés — la version maison au levier réglable",muscles:"Érecteurs",niveau:"Débutant"}],
erreurs:["Dépasser l'horizontal — compression discale grave","Élan en bas — perte du contrôle excentrique","Arrondir le dos en bas"]},

{n:"Good morning barre légère",s:"3",r:"12",rest:"90s",ch:"Très léger",cat:"correctif",mat:"barre",
morpho:" Tous morphotypes : ischios + lombaires + érecteurs. Lordose naturelle OBLIGATOIRE. Jamais lourd avant maîtrise complète. Excellent renforcement préventif de la chaîne postérieure.\nFémurs longs : amplitude naturellement grande — attention à la lordose en position basse.",
tips:["Barre basse sur les trapèzes — pas sur la nuque","Genoux légèrement fléchis et FIXES pendant tout le mouvement","Incliner le buste à 45° maximum — lordose conservée","Dos PLAT — regard vers l'horizon","Remonter en poussant les hanches vers l'avant"],
variantes:[
{nom:"Good morning assis",note:"Assis à cheval sur un banc — les ischios sortent, les érecteurs restent seuls",muscles:"Érecteurs isolés",niveau:"Intermédiaire"},
{nom:"Good morning élastique",note:"Bande sous les pieds sur la nuque — la résistance progressive qui épargne la position basse",muscles:"Ischios, érecteurs",niveau:"Débutant"},
{nom:"Good morning jambes fléchies",note:"Genoux davantage pliés — les ischios se relâchent, les érecteurs prennent la charge",muscles:"Érecteurs du rachis",niveau:"Intermédiaire"},
{nom:"Romanian deadlift",note:"La charge dans les mains plutôt que sur la nuque — le bras de levier raccourci",muscles:"Ischios, fessiers",niveau:"Débutant"}],
erreurs:["Arrondir le dos — blessure lombaire grave certaine","Trop de charge avant maîtrise","Genoux verrouillés — risque tendineux","Descente au-delà de 45° — perd la lordose"]},

{n:"Superman",s:"3",r:"10-15",rest:"45s",ch:"Corps",cat:"correctif",mat:"poids de corps",
morpho:" Lombaires faibles : renforcement des érecteurs sans aucune charge externe — la porte d'entrée du travail lombaire.\nPosture effondrée : renforce toute la chaîne postérieure d'extension, des fessiers aux trapèzes inférieurs.\nDébutants : à maîtriser avant toute hyperextension chargée ou good morning.\nL'amplitude est volontairement petite : quelques centimètres suffisent, l'hyperextension excessive est contre-productive.",
tips:["Allongé sur le ventre, bras tendus devant, jambes tendues","Décoller simultanément bras, poitrine et cuisses de quelques centimètres","Regard vers le sol — nuque alignée avec la colonne","Tenir 2s en haut en serrant fessiers et lombaires","Redescendre lentement sans relâcher brutalement"],
variantes:[
{nom:"Superman alterné",note:"Bras et jambe opposés seulement — la diagonale contralatérale plus accessible",muscles:"Érecteurs, fessiers",niveau:"Débutant"},
{nom:"Superman avec tirage",note:"En haut de l'extension, les coudes tirent vers les hanches — les fixateurs d'omoplates s'ajoutent",muscles:"Érecteurs, trapèzes, rhomboïdes",niveau:"Intermédiaire"},
{nom:"Bird dog",note:"La même diagonale en quadrupédie — le contrôle avant l'amplitude",muscles:"Érecteurs, transverse",niveau:"Débutant"}],
erreurs:["Hyperextension cervicale — regarder devant au lieu du sol","Chercher la hauteur maximale au lieu de la contraction","À-coups au lieu d'un mouvement contrôlé"]},

{n:"Bird dog",s:"3",r:"8-10/côté",rest:"45s",ch:"Corps",cat:"correctif",mat:"poids de corps",
morpho:" Lombaires douloureuses ou en reprise : l'exercice de stabilisation validé par la recherche en rééducation du dos.\nInstabilité du tronc en gainage croisé : apprend à verrouiller la colonne pendant que les membres bougent.\nTous les sportifs : la dissociation membre/colonne est la compétence de base de tous les mouvements chargés.\nEn apparence facile, révélateur impitoyable : le bassin qui bascule trahit immédiatement le déficit de contrôle.",
tips:["En quadrupédie, mains sous les épaules, genoux sous les hanches","Étendre simultanément bras et jambe opposés à l'horizontale","Le bassin reste parfaitement horizontal — poser un objet dessus pour vérifier","Tenir 2-3s en extension, revenir sans toucher le sol","Nuque neutre, regard vers le sol"],
variantes:[
{nom:"Bird dog coude-genou",note:"Coude et genou se rejoignent sous le ventre entre les extensions — flexion et extension enchaînées",muscles:"Transverse, érecteurs",niveau:"Intermédiaire"},
{nom:"Bird dog élastique",note:"Bande entre main et pied opposés — la diagonale sous résistance",muscles:"Érecteurs, fessiers",niveau:"Intermédiaire"},
{nom:"Bird dog sur bosu",note:"Genoux sur le dôme — l'instabilité révèle la moindre bascule de bassin",muscles:"Transverse, stabilisateurs",niveau:"Avancé"},
{nom:"Dead bug",note:"Le miroir sur le dos — la même dissociation, lombaires plaqués",muscles:"Transverse, grand droit",niveau:"Débutant"}],
erreurs:["Bassin qui bascule quand la jambe se lève","Cambrure lombaire en fin d'extension","Vitesse qui masque le manque de stabilité"]},

{n:"Soulevé de terre kettlebell",s:"4",r:"8-12",rest:"90s",ch:"16-32 kg",cat:"principal",mat:"kettlebell",
morpho:" Fémurs longs : la charge entre les pieds raccourcit le bras de levier — le soulevé le plus vertical et le plus sûr pour apprendre.\nLombaires à renforcer progressivement : charge intermédiaire idéale entre le poids de corps et la barre.\nDébutants au hip hinge : la kettlebell posée au sol entre les pieds guide naturellement le placement.\nL'outil pédagogique parfait pour enseigner le soulevé de terre avant de passer à la barre.",
tips:["Kettlebell entre les pieds, à l'aplomb du milieu du pied","Charnière de hanche : fesses en arrière, dos plat, bras tendus","Poitrine fière, omoplates verrouillées avant de décoller la charge","Pousser le sol avec les jambes puis tendre les hanches","Redescendre par la charnière — la KB reprend sa place entre les pieds"],
variantes:[
{nom:"Soulevé de terre sumo kettlebell",note:"Pieds très écartés — le buste se verticalise encore davantage",muscles:"Fessiers, adducteurs",niveau:"Débutant"},
{nom:"Soulevé de terre 2 kettlebells",note:"Une charge de chaque côté des pieds — la version lourde symétrique",muscles:"Chaîne postérieure, grip",niveau:"Intermédiaire"},
{nom:"Suitcase deadlift",note:"Une seule KB sur le côté comme une valise — l'anti-flexion latérale s'invite",muscles:"Chaîne postérieure, obliques, carré des lombes",niveau:"Intermédiaire"},
{nom:"Soulevé de terre déficit",note:"Debout sur un step — l'amplitude gagne quelques centimètres en bas",muscles:"Chaîne postérieure en amplitude accrue",niveau:"Avancé"}],
erreurs:["Dos qui s'arrondit au décollage","Squatter la charge au lieu de faire la charnière","Hyperextension lombaire exagérée en fin de montée"]},

{n:"Extension lombaire sur ballon",s:"3",r:"12-15",rest:"60s",ch:"Corps",cat:"principal",mat:"bosu",
morpho:" Lombaires en renforcement : le ballon (ou bosu) épouse le ventre et répartit l'appui — plus confortable que le banc 45°.\nAmplitude ajustable : le placement du ballon sous les hanches ou le ventre module la difficulté.\nÉrecteurs + fessiers + ischios : toute la chaîne postérieure d'extension travaille en synergie.\nVersion accessible de l'hyperextension quand aucun banc n'est disponible.",
tips:["Ventre sur le ballon ou le bosu, pieds calés contre un mur ou au sol","Mains derrière la tête ou croisées sur la poitrine","Dérouler le buste vers le bas puis remonter jusqu'à l'alignement","S'arrêter à l'horizontale — pas d'hyperextension au-delà","Mouvement lent : 2s de montée, 3s de descente"],
variantes:[
{nom:"Hyperextension 45°",note:"Le banc dédié — hanches calées et trajectoire reproductible",muscles:"Érecteurs, fessiers",niveau:"Débutant"},
{nom:"Superman au sol",note:"Sans matériel à plat ventre — l'amplitude minimale qui suffit",muscles:"Érecteurs",niveau:"Débutant"},
{nom:"Extension + rotation alternée",note:"Une rotation du buste en haut de chaque extension — les érecteurs profonds rejoignent",muscles:"Érecteurs, obliques",niveau:"Intermédiaire"}],
erreurs:["Hyperextension au-delà de l'alignement naturel","Élan des bras pour remonter","Ballon mal placé qui bloque la respiration"]},
],

"Mollets":[
{n:"Extension mollets debout machine",s:"5",r:"15-20",rest:"60s",ch:"Modéré",cat:"principal",mat:"machine",
morpho:" Tous morphotypes : volume ÉLEVÉ obligatoire pour les mollets — fibres lentes à résistance élevée. Étirement COMPLET en bas est le facteur clé. 5 séries minimum pour un stimulus suffisant.\nMollets courts naturellement : travailler en amplitude maximale et varier la position des pieds systématiquement.",
tips:["Amplitude TOTALE — talon le plus bas possible en bas de chaque répétition","Pause 2 secondes en bas (étirement maximal) + 1-2 secondes en haut (contraction)","Varier la position des pieds — neutres / en dehors / en dedans — pour varier l'activation","15-25 répétitions = zone optimale pour les fibres lentes des mollets","Pas de rebond en bas — travail excentrique pur"],
variantes:[
{nom:"Extension unilatérale sur marche",note:"Une jambe au poids de corps — l'asymétrie corrigée avec amplitude complète",muscles:"Gastrocnémien ciblé",niveau:"Débutant"},
{nom:"Extension à la presse",note:"Pointes de pieds en bas du plateau — la charge lourde sans compression d'épaules",muscles:"Gastrocnémiens",niveau:"Débutant"},
{nom:"Donkey calf raise",note:"Buste penché à l'horizontale — les gastrocnémiens étirés par la flexion de hanche",muscles:"Gastrocnémiens en étirement",niveau:"Intermédiaire"},
{nom:"Extension mollets assis",note:"Genoux fléchis à 90° — le soléaire prend le relais du jumeau",muscles:"Soléaire",niveau:"Débutant"}],
erreurs:["Amplitude partielle — le bénéfice vient de l'étirement complet","Rebond en bas — perd l'excentrique et les résultats","Vitesse excessive — les fibres lentes nécessitent du tempo"]},

{n:"Extension mollets assis machine",s:"4",r:"15-20",rest:"60s",ch:"Modéré",cat:"isolation",mat:"machine",
morpho:" Tous morphotypes : SOLÉAIRE (mollet profond). Un mollet ne sera jamais complet sans cet exercice — les fibres lentes du soléaire ne répondent qu'au travail genoux fléchis à 90°. L'exercice debout ne le cible pas.",
tips:["Genoux à 90° en position assise — position stricte","Amplitude complète en bas et en haut","Pause en bas et en haut identique à l'exercice debout","Tempo lent — les fibres lentes du soléaire ont besoin de temps sous tension","Progresser doucement — le soléaire est résistant à l'hypertrophie"],
variantes:[
{nom:"Extension assis élastique",note:"Bande sous l'avant-pied — la même flexion plantaire genou plié, partout",muscles:"Soléaire",niveau:"Débutant"},
{nom:"Extension assis kettlebell sur genoux",note:"Charge posée sur les cuisses — la version maison chargée",muscles:"Soléaire",niveau:"Débutant"},
{nom:"Extension mollets debout",note:"Genoux tendus — le gastrocnémien réintègre le mouvement",muscles:"Gastrocnémiens",niveau:"Débutant"}],
erreurs:["Amplitude partielle — le soléaire nécessite l'étirement complet","Négliger cet exercice — les mollets resteront visuellement incomplets"]},

{n:"Tibia raises debout",s:"3",r:"20-25",rest:"45s",ch:"Corps",cat:"correctif",mat:"poids de corps",
morpho:" Tous morphotypes : tibial antérieur — souvent complètement négligé.\nÉquilibre mollets/tibial. Prévient les periostites et les douleurs de shin splints. Important pour la santé du genou et de la cheville.",
tips:["Dos contre un mur, talons à 30cm du mur","Lever les pointes des pieds le plus haut possible","Contraction maximale en haut","Descente contrôlée","Progresser avec haltère sur les pieds"],
variantes:[
{nom:"Dorsiflexion élastique assis",note:"Bande ancrée devant tirée vers soi avec le pied — le tibial antérieur sous résistance réglable",muscles:"Tibial antérieur",niveau:"Débutant"},
{nom:"Marche sur les talons",note:"Avancer pointes relevées — le renforcement fonctionnel en mouvement",muscles:"Tibial antérieur, releveurs",niveau:"Débutant"},
{nom:"Tibia raises unilatéral",note:"Un pied à la fois — le déficit gauche/droite mis à nu",muscles:"Tibial antérieur ciblé",niveau:"Intermédiaire"}],
erreurs:["Amplitude insuffisante","Vitesse trop rapide","Négliger cet exercice"]},

{n:"Sauts de mollets explosifs",s:"4",r:"20",rest:"60s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Tous morphotypes : fibres rapides des mollets — rarement entraînées.\nLe travail explosif des mollets est différent du travail lent. Les deux sont nécessaires pour un développement complet.",
tips:["Sauts légers sur la pointe des pieds — élan minimal","Amplitude complète : talons qui touchent le sol entre chaque saut","Rythme régulier et contrôlé","Genoux légèrement fléchis pour amortir","Peut se faire sur une marche pour plus d'amplitude"],
variantes:[
{nom:"Corde à sauter",note:"Le volume pliométrique continu — des centaines de contacts légers",muscles:"Mollets, coordination",niveau:"Débutant"},
{nom:"Sauts unipodaux",note:"Une jambe — la puissance réactive isolée sur chaque mollet",muscles:"Mollet unilatéral",niveau:"Avancé"},
{nom:"Drop jump",note:"Chute d'une caisse et rebond immédiat — la réactivité pure du cycle étirement-détente",muscles:"Mollets, raideur tendineuse",niveau:"Avancé"}],
erreurs:["Genoux verrouillés","Amplitude nulle — sauts sur place sans extension","Trop d'élan"]},

{n:"Extension mollets unilatérale sur marche",s:"4",r:"10-15/jambe",rest:"60s",ch:"Corps (+ haltère main)",cat:"principal",mat:"poids de corps",
morpho:" Mollets récalcitrants : l'unilatéral double l'intensité sans matériel et corrige les asymétries invisibles en bilatéral.\nTendon d'Achille : l'amplitude complète sur marche (étirement bas + contraction haute) est le meilleur stimulus tendineux.\nMollets courts (insertion haute) : privilégier l'amplitude maximale et le tempo lent — la génétique limite le volume, pas la qualité.\nL'exercice mollets le plus rentable à domicile : une marche d'escalier suffit.",
tips:["Avant-pied sur le bord de la marche, talon dans le vide","Descendre le talon le plus bas possible — étirement complet 1s","Monter sur la pointe le plus haut possible","Pause 2s en contraction maximale en haut","Genou tendu pour le gastrocnémien, tenir un appui léger pour l'équilibre"],
variantes:[
{nom:"Extension unilatérale genou fléchi",note:"Le genou plié désactive le jumeau — le soléaire travaille seul",muscles:"Soléaire",niveau:"Débutant"},
{nom:"Donkey calf raise",note:"Buste basculé à l'horizontale en appui — le gastrocnémien pré-étiré par la hanche",muscles:"Gastrocnémiens en étirement",niveau:"Intermédiaire"},
{nom:"Extension debout machine",note:"Épaules sous les boudins — la surcharge bilatérale lourde",muscles:"Gastrocnémiens",niveau:"Débutant"}],
erreurs:["Rebond en bas au lieu d'un étirement contrôlé","Amplitude partielle en haut comme en bas","S'aider de la main d'appui pour monter"]},

{n:"Corde à sauter",s:"4-6",r:"45-90s",rest:"45-60s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Chevilles et mollets réactifs recherchés : le cycle étirement-détente à haute fréquence développe la raideur élastique du tendon.\nGenoux ou impact sensibles : commencer sur surface souple avec des blocs courts.\nSportifs : coordination, jeu de jambes et conditionnement — l'outil cardio le plus complet au poids du corps.\nDes milliers de contacts par séance : le volume pliométrique mollets le plus élevé de tous les exercices.",
tips:["Sauts minimalistes : 2-3 cm du sol suffisent","Réception sur l'avant-pied, talons qui ne claquent jamais au sol","Coudes près du corps — la rotation vient des poignets","Buste droit, regard devant","Progresser en durée avant de progresser en vitesse"],
variantes:[
{nom:"Sauts alternés (boxer step)",note:"Le poids passe d'un pied à l'autre — l'impact divisé, l'endurance allongée",muscles:"Mollets, coordination",niveau:"Débutant"},
{nom:"Double-unders",note:"Deux tours de corde par saut — l'explosivité et le timing des mollets",muscles:"Mollets, réactivité",niveau:"Avancé"},
{nom:"Sauts unipodaux à la corde",note:"Une jambe — chaque mollet encaisse tout le cycle",muscles:"Mollet unilatéral",niveau:"Intermédiaire"},
{nom:"Pas croisés (criss-cross)",note:"Les bras se croisent à chaque tour — la coordination haut-bas du boxeur",muscles:"Mollets, coordination",niveau:"Intermédiaire"}],
erreurs:["Sauter trop haut — gaspillage et impact inutile","Réception talons — tout l'intérêt pliométrique disparaît","Bras qui tournent depuis les épaules"]},

{n:"Extension mollets élastique assis",s:"3",r:"15-25",rest:"45s",ch:"Élastique fort",cat:"isolation",mat:"élastique",
morpho:" Soléaire ciblé : genou fléchi = le gastrocnémien est désactivé, le soléaire travaille seul — indispensable pour le galbe complet.\nImpact interdit (reprise, tendinopathie) : résistance progressive sans aucune charge de compression.\nMollets endurants : le soléaire est majoritairement composé de fibres lentes — les hautes répétitions lui correspondent.\nRéplique fidèle de la machine mollets assis, transportable partout.",
tips:["Assis, élastique passé sous l'avant-pied, tenu en tension dans les mains","Genoux fléchis à 90° pendant tout l'exercice","Pousser la pointe de pied contre l'élastique en extension complète","Pause 1-2s en contraction maximale","Revenir lentement en flexion dorsale complète"],
variantes:[
{nom:"Extension élastique jambe tendue",note:"Genou verrouillé — le gastrocnémien réintègre la flexion plantaire",muscles:"Gastrocnémiens",niveau:"Débutant"},
{nom:"Extension élastique unilatérale",note:"Un pied — la tension calibrée côté par côté",muscles:"Soléaire ciblé",niveau:"Débutant"},
{nom:"Extension mollets assis machine",note:"La version chargée en salle — les plots remplacent la bande",muscles:"Soléaire",niveau:"Débutant"}],
erreurs:["Élastique trop faible — aucune difficulté en fin de série","Amplitude raccourcie sans étirement en flexion","Genoux qui se tendent en cours de série"]},

{n:"Équilibre unipodal sur bosu",s:"3",r:"30-45s/jambe",rest:"30s",ch:"Corps",cat:"correctif",mat:"bosu",
morpho:" Chevilles post-entorse : LE protocole de référence en rééducation — les péroniers et le tibial postérieur se renforcent en continu.\nAppuis fragiles chez le sportif : la prévention des entorses passe par la proprioception, pas seulement la force.\nMollets stabilisateurs : le travail permanent de micro-corrections renforce les muscles profonds de la jambe.\n3 minutes par jambe en fin de séance suffisent — la régularité prime sur la durée.",
tips:["Un pied au centre du dôme, l'autre décollé","Genou d'appui légèrement fléchi, jamais verrouillé","Orteils qui agrippent activement la surface","Regard fixe devant soi — fermer les yeux est la progression ultime","Bras libres pour équilibrer, puis croisés quand le niveau monte"],
variantes:[
{nom:"Équilibre unipodal + extension mollet",note:"Monter sur la pointe en tenant l'équilibre — cheville et mollet dans le même défi",muscles:"Mollet, stabilisateurs de cheville",niveau:"Avancé"},
{nom:"Équilibre unipodal yeux fermés au sol",note:"La vision retirée sur sol stable — l'autre voie de progression proprioceptive",muscles:"Stabilisateurs, proprioception",niveau:"Intermédiaire"},
{nom:"Équilibre + passes de balle",note:"Échanges de balle en tenant l'appui — la double tâche du sportif de terrain",muscles:"Stabilisateurs, coordination",niveau:"Intermédiaire"},
{nom:"Équilibre sur coussin d'instabilité",note:"Surface souple plus basse que le bosu — la marche d'entrée proprioceptive",muscles:"Stabilisateurs de cheville",niveau:"Débutant"}],
erreurs:["Genou verrouillé en hyperextension","Fixer ses pieds au lieu de regarder devant","Passer aux progressions avant de tenir 45s stable"]},
],

"Avant-bras":[
{n:"Curl poignet barre",s:"3",r:"15-20",rest:"45s",ch:"Léger",cat:"isolation",mat:"barre",
morpho:" Tous morphotypes : fléchisseurs du poignet — sous-développés si les straps sont utilisés systématiquement sans travail spécifique. L'usage permanent des straps retarde le développement de la force de prise et des avant-bras.\nÀ alterner avec les extensions de poignet pour un équilibre fléchisseurs/extenseurs.",
tips:["Avant-bras posés sur les cuisses ou un banc — position stable","Amplitude complète — extension totale du poignet en bas","Mouvement lent et contrôlé","Alterner avec les extensions de poignet pour l'équilibre"],
variantes:[
{nom:"Extension poignet barre (reverse wrist curl)",note:"Paumes vers le bas — les extenseurs, l'autre moitié de l'avant-bras",muscles:"Extenseurs des poignets",niveau:"Débutant"},
{nom:"Curl poignet haltère unilatéral",note:"Un avant-bras à la fois — l'amplitude et l'asymétrie sous contrôle",muscles:"Fléchisseurs ciblés",niveau:"Débutant"},
{nom:"Curl poignet derrière le dos",note:"Barre tenue derrière debout — l'angle de poignet différent, cher aux bras old-school",muscles:"Fléchisseurs des poignets",niveau:"Intermédiaire"},
{nom:"Finger roll",note:"La barre déroule jusqu'au bout des doigts avant de refermer — les fléchisseurs des doigts s'ajoutent",muscles:"Fléchisseurs des doigts, poigne",niveau:"Intermédiaire"}],
erreurs:["Trop lourd — le coude compense","Amplitude insuffisante"]},

{n:"Farmer walk",s:"3",r:"30-40m",rest:"90s",ch:"Lourd",cat:"principal",mat:"haltères",
morpho:" Tous morphotypes : force de préhension + avant-bras + trapèzes. Meilleur exercice fonctionnel pour les avant-bras. Améliore la prise pour tous les exercices de tirage. Résultats visibles en 4-6 semaines.\nBras longs : prise naturellement longue — amplitude de tenue favorable.",
tips:["Haltères aussi lourds que ta limite de prise le permet","Pas réguliers et équilibrés — sans balancement du corps","Dos droit, épaules hautes et stables","Respiration régulière tout au long","Progresser en distance ou en charge"],
variantes:[
{nom:"Suitcase carry",note:"Une seule charge d'un côté — le tronc lutte contre la flexion latérale à chaque pas",muscles:"Carré des lombes, obliques, poigne",niveau:"Intermédiaire"},
{nom:"Rack carry",note:"Kettlebells en position rack contre le buste — le gainage antérieur remplace la poigne",muscles:"Gainage, épaules",niveau:"Intermédiaire"},
{nom:"Overhead carry",note:"Charge bras tendu au-dessus de la tête — la stabilité d'épaule en marchant",muscles:"Épaule, coiffe, gainage",niveau:"Avancé"},
{nom:"Farmer walk trap bar",note:"Dans la barre hexagonale — la charge maximale sans limite d'haltères",muscles:"Poigne, trapèzes, corps entier",niveau:"Avancé"}],
erreurs:["Trop léger — pas de stimulus suffisant sur la prise","Dos qui s'incline latéralement — risque lombaire"]},

{n:"Dead hang barre fixe",s:"4",r:"30-60s",rest:"60s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Bras longs : tenue naturellement plus facile grâce à l'amplitude de prise.\nForce de prise isométrique + décompression de la colonne vertébrale + étirement des épaules. Exercice multi-bénéfices souvent sous-estimé.",
tips:["Prise pronation ou supination selon préférence","Corps détendu — laisser la gravité décompresser","Épaules légèrement rétractées — ne pas laisser totalement relâcher","Respiration profonde et régulière","Progresser en durée"],
variantes:[
{nom:"Suspension une main",note:"Tout le poids sur une seule prise — l'objectif grip du calisthenics",muscles:"Poigne, avant-bras",niveau:"Avancé"},
{nom:"Suspension serviette",note:"Textile agrippé à pleine main — la pince épaisse limite avant le reste",muscles:"Fléchisseurs des doigts",niveau:"Intermédiaire"},
{nom:"Suspension active",note:"Omoplates abaissées et engagées — la santé d'épaule s'ajoute à la poigne",muscles:"Trapèzes inférieurs, poigne",niveau:"Débutant"}],
erreurs:["Laisser les épaules totalement relâchées en hypermobilité","Gripper trop fort — muscles des avant-bras non en endurance","Durée trop courte pour développer la prise"]},

{n:"Wrist roller",s:"3",r:"3 montées/descentes",rest:"60s",ch:"Léger",cat:"principal",mat:"accessoire",
morpho:" Tous morphotypes : enroulage et déroulage = fléchisseurs + extenseurs complets.\nUn des seuls exercices qui travaille les avant-bras en amplitude COMPLÈTE dans les deux directions.",
tips:["Bras tendus devant soi à hauteur des épaules","Enrouler la corde vers le haut en alternant les poignets","Contrôler la descente — ne pas laisser tomber","Charge légère — la fatigue vient vite","Peut se faire bras le long du corps pour moins d'effort des épaules"],
variantes:[
{nom:"Wrist roller déroulé inversé",note:"Enrouler dans l'autre sens paumes vers le bas — les extenseurs à la manœuvre",muscles:"Extenseurs des poignets",niveau:"Intermédiaire"},
{nom:"Wrist roller coudes au corps",note:"Bras fléchis le long du buste — les deltoïdes sortent, les avant-bras restent seuls",muscles:"Avant-bras isolés",niveau:"Débutant"},
{nom:"Wrist roller sur poulie",note:"Corde passée par la poulie basse — bras posés, la fatigue d'épaule disparaît",muscles:"Avant-bras",niveau:"Débutant"}],
erreurs:["Trop lourd — les épaules fatiguent avant les avant-bras","Vitesse trop rapide — perd le travail excentrique","Bras non tendus"]},

{n:"Extension poignets élastique",s:"3",r:"15-20",rest:"45s",ch:"Élastique léger",cat:"correctif",mat:"élastique",
morpho:" Épicondylite (tennis elbow) : le renforcement des extenseurs est le traitement actif de référence — toujours négligés face aux fléchisseurs.\nRatio fléchisseurs/extenseurs déséquilibré : tout pratiquant qui tire et porte développe ce déséquilibre — le correctif est obligatoire.\nPoignets douloureux aux pompes et au front squat : des extenseurs forts stabilisent l'articulation.\n2 séries en fin de séance protègent des mois de tendinite.",
tips:["Avant-bras posé sur la cuisse ou une table, paume vers le bas","Élastique sous le pied, tenu dans la main","Relever le dos de la main vers le haut, amplitude complète","Descendre lentement en 2-3s","Seul le poignet bouge — l'avant-bras reste collé au support"],
variantes:[
{nom:"Curl poignet élastique",note:"Paume vers le haut — les fléchisseurs, l'autre face du travail",muscles:"Fléchisseurs des poignets",niveau:"Débutant"},
{nom:"Déviations radiale et ulnaire élastique",note:"Le poignet bascule latéralement contre la bande — la stabilité dans le plan oublié",muscles:"Stabilisateurs du poignet",niveau:"Intermédiaire"},
{nom:"Extension poignets haltère",note:"La charge libre posée sur la cuisse — la version lestée du même correctif",muscles:"Extenseurs",niveau:"Débutant"}],
erreurs:["Charge trop forte — les extenseurs sont des petits muscles","Avant-bras qui décolle du support","Amplitude réduite par précipitation"]},

{n:"Bottoms-up carry kettlebell",s:"3",r:"20-30m/bras",rest:"60s",ch:"8-12 kg",cat:"gainage",mat:"kettlebell",
morpho:" Grip faible : la boule à l'envers exige une pression d'écrasement maximale et continue sur la poignée — le crush grip pur.\nÉpaules instables : la coiffe des rotateurs travaille en stabilisation réflexe permanente — outil de rééducation reconnu.\nAvant-bras fins : la tenue isométrique sous instabilité est un stimulus unique que ni la barre ni l'haltère ne reproduisent.\nSi la kettlebell bascule, tout recommence : le feedback est immédiat et impitoyable.",
tips:["Kettlebell tenue boule vers le haut, poignée écrasée dans le poing","Coude à 90°, avant-bras vertical comme un serveur portant un plateau","Marcher lentement en lignes droites contrôlées","Épaule basse, omoplate verrouillée","Regard devant — sentir l'équilibre plutôt que le regarder"],
variantes:[
{nom:"Bottoms-up press",note:"Développé boule à l'envers — l'écrasement de poignée pendant la poussée verticale",muscles:"Coiffe, avant-bras, deltoïde",niveau:"Avancé"},
{nom:"Double bottoms-up carry",note:"Une KB inversée dans chaque main — plus aucun côté pour se reposer",muscles:"Poigne, coiffe des deux côtés",niveau:"Avancé"},
{nom:"Suitcase carry",note:"Portage classique unilatéral — l'anti-flexion latérale sans l'instabilité de la boule",muscles:"Carré des lombes, poigne",niveau:"Intermédiaire"}],
erreurs:["Charge trop lourde — la boule bascule dès les premiers pas","Coude qui s'écarte du corps","Marcher vite au détriment du contrôle"]},

{n:"Suspension serviette (towel hang)",s:"3",r:"15-40s",rest:"90s",ch:"Corps",cat:"principal",mat:"poids de corps",
morpho:" Grip limitant aux tractions et soulevés : la prise sur serviette est l'outil de grip le plus dur au poids de corps.\nSports de préhension (escalade, combat, rugby) : la prise sur textile reproduit la saisie d'un adversaire ou d'un vêtement.\nAvant-bras massifs recherchés : la tenue en pince épaisse recrute les fléchisseurs à intensité maximale.\nDeux serviettes sur une barre fixe : le matériel de grip le plus économique qui existe.",
tips:["Une ou deux serviettes passées sur la barre fixe","Saisir à pleines mains le plus haut possible","Épaules actives, omoplates engagées — pas de suspension passive","Tenir le plus longtemps possible en gardant la qualité de prise","Progresser vers une seule main quand 40s deviennent faciles"],
variantes:[
{nom:"Tractions sur serviettes",note:"La version dynamique — le dos tire pendant que la pince tient",muscles:"Dorsaux, poigne",niveau:"Avancé"},
{nom:"Suspension serviette unilatérale",note:"Une main sur le textile — le sommet du grip au poids de corps",muscles:"Fléchisseurs des doigts",niveau:"Avancé"},
{nom:"Pincée de disques (plate pinch)",note:"Deux disques lisses serrés entre pouce et doigts — la pince pure, débarrassée de la flexion",muscles:"Pince pouce-doigts",niveau:"Intermédiaire"}],
erreurs:["Suspension passive épaules aux oreilles","Serviette trop épaisse pliée — prise impossible à fermer","Lâcher brutalement au lieu de descendre contrôlé"]},
],

"Trapèzes":[
{n:"Haussements épaules haltères",s:"4",r:"12-15",rest:"60s",ch:"70%",cat:"principal",mat:"haltères",
morpho:" Tous morphotypes : chef supérieur des trapèzes. À équilibrer ABSOLUMENT avec le face pull et l'oiseau pour éviter de renforcer une antépulsion. Hypertrophie rapide et visible.\nÉpaules avec antépulsion : à modérer — les trapèzes supérieurs participent à l'antépulsion si surentraînés sans correctifs.",
tips:["Mouvement VERTICAL PUR — aucune rotation des épaules (risque articulaire sous-acromial)","Contraction isométrique 1-2 secondes en haut","Descente lente — étirement complet en bas","Haltères préférés pour la liberté de mouvement"],
variantes:[
{nom:"Shrug barre",note:"Prise bilatérale devant — la charge totale maximale",muscles:"Trapèzes supérieurs",niveau:"Débutant"},
{nom:"Shrug incliné haltères",note:"Ventre sur banc incliné — l'élévation part vers l'arrière, trapèzes moyens inclus",muscles:"Trapèzes moyens et supérieurs",niveau:"Intermédiaire"},
{nom:"Shrug kettlebells",note:"Poignées épaisses le long du corps — la poigne s'ajoute à l'élévation",muscles:"Trapèzes, avant-bras",niveau:"Débutant"},
{nom:"Overhead shrug",note:"Haussement bras tendus au-dessus de la tête — le trapèze inférieur en vedette",muscles:"Trapèzes inférieurs, dentelé",niveau:"Intermédiaire"}],
erreurs:["Rotation des épaules — risque articulaire sous-acromial","Amplitude partielle en bas — perd l'étirement","Utiliser l'élan des genoux pour compenser"]},

{n:"Rowing barre debout (upright row)",s:"4",r:"12",rest:"60s",ch:"55%",cat:"principal",mat:"barre",
morpho:" Épaules saines obligatoires — à éviter en cas de conflit sous-acromial.\nClavicules larges : peut créer un conflit — utiliser une prise légèrement plus large.\nTrapèzes supérieurs + deltoïde moyen. Tirer vers le menton — coudes TOUJOURS au-dessus des mains.",
tips:["Prise légèrement plus large que les épaules sur barre EZ","Tirer vers le menton — coudes remontent au-dessus des mains","Maintenir 1s en haut","Descente contrôlée 2-3s","Arrêt si douleur à l'épaule — exercice individuel"],
variantes:[
{nom:"Upright row haltères",note:"Deux charges indépendantes — chaque poignet trouve sa trajectoire",muscles:"Trapèzes, deltoïde moyen",niveau:"Débutant"},
{nom:"Upright row corde poulie basse",note:"Corde qui laisse les mains s'écarter en montant — le trajet le plus tolérant pour l'épaule",muscles:"Trapèzes, deltoïdes",niveau:"Débutant"},
{nom:"Upright row prise large",note:"Mains au-delà des épaules — les coudes montent moins haut, le conflit sous-acromial s'éloigne",muscles:"Deltoïde moyen, trapèzes",niveau:"Débutant"},
{nom:"High pull",note:"Tirage haut explosif depuis les hanches — la puissance de l'haltérophilie",muscles:"Trapèzes, chaîne d'extension",niveau:"Avancé"}],
erreurs:["Prise trop serrée — conflit sous-acromial certain","Coudes sous les mains — perd l'exercice","Trop lourd"]},

{n:"Face pull corde + shrug combiné",s:"3",r:"15",rest:"60s",ch:"Léger",cat:"correctif",mat:"poulie",
morpho:" Antépulsion épaules : version combinée — face pull correctif + activation des trapèzes moyens.\nL'ajout du shrug léger à la fin du face pull permet de recruter les trapèzes moyens en plus des rotateurs externes.",
tips:["Face pull classique jusqu'à la rotation externe maximale","Ajouter un léger haussement d'épaules en fin de mouvement","Pause 2s en contraction maximale","Descente contrôlée","Poids très léger — qualité de mouvement prioritaire"],
variantes:[
{nom:"Face pull simple",note:"Sans le haussement final — la rétraction et la rotation externe seules",muscles:"Deltoïde postérieur, coiffe",niveau:"Débutant"},
{nom:"Y-raise poulie basse",note:"Bras montés en diagonale haute — le trapèze inférieur à l'honneur",muscles:"Trapèzes inférieurs",niveau:"Intermédiaire"},
{nom:"Face pull élastique",note:"La bande à la place du câble — le même combiné partout",muscles:"Deltoïde postérieur, trapèzes",niveau:"Débutant"}],
erreurs:["Trop lourd — perd la rotation externe","Shrug trop prononcé — devient un shrug pur","Vitesse trop rapide"]},

{n:"Shrug kettlebell",s:"4",r:"12-15",rest:"60s",ch:"2×16-32 kg",cat:"isolation",mat:"kettlebell",
morpho:" Cou long et épaules tombantes : les trapèzes supérieurs répondent vite au shrug chargé — impact visuel rapide sur la carrure.\nPrise épaisse de la kettlebell : le grip travaille autant que les trapèzes — deux muscles pour un exercice.\nCharge le long du corps : la kettlebell pend naturellement dans l'axe, sans frotter les cuisses comme la barre.\nLe shrug le plus confortable mécaniquement : bras relâchés, trajectoire verticale pure.",
tips:["Une kettlebell dans chaque main, bras relâchés le long du corps","Hausser les épaules verticalement vers les oreilles","Pause 2s en contraction haute","Descendre lentement jusqu'à l'étirement complet des trapèzes","Bras tendus passifs — ils ne participent jamais"],
variantes:[
{nom:"Shrug kettlebell unilatéral",note:"Une charge d'un seul côté — le tronc résiste à la flexion latérale",muscles:"Trapèze ciblé, obliques",niveau:"Intermédiaire"},
{nom:"Carry + shrug",note:"Haussements en marchant charges en mains — l'endurance des trapèzes en mouvement",muscles:"Trapèzes, poigne",niveau:"Intermédiaire"},
{nom:"Shrug haltères",note:"Prises fines classiques — la référence pour isoler l'élévation",muscles:"Trapèzes supérieurs",niveau:"Débutant"},
{nom:"Shrug penché 45°",note:"Buste incliné vers l'avant — l'élévation glisse vers les trapèzes moyens",muscles:"Trapèzes moyens",niveau:"Intermédiaire"}],
erreurs:["Rouler les épaules d'avant en arrière — inutile et risqué","Plier les coudes pour monter plus haut","Rebond en bas sans étirement contrôlé"]},

{n:"Face pull élastique",s:"3-4",r:"15-20",rest:"45s",ch:"Élastique léger/moyen",cat:"correctif",mat:"élastique",
morpho:" Épaules enroulées et cyphose : le tirage vers le visage combine rétraction, rotation externe et trapèzes moyens/inférieurs — le correctif postural complet.\nAntécédents de conflit sous-acromial : renforce la coiffe dans sa fonction exacte de recentrage de la tête humérale.\nDominance des trapèzes supérieurs : réapprend à tirer avec le milieu du dos plutôt qu'en haussant.\nLa version élastique permet de le faire chaque jour, même hors salle — la fréquence fait le résultat postural.",
tips:["Élastique ancré à hauteur du visage, une extrémité dans chaque main","Tirer vers le front en écartant les mains de part et d'autre de la tête","Coudes hauts qui finissent en arrière des épaules","Rotation externe finale : les poings pointent vers le plafond","Épaules basses malgré la hauteur des coudes"],
variantes:[
{nom:"Face pull ancrage bas",note:"Tirage montant vers le visage — les trapèzes inférieurs rejoignent la rotation externe",muscles:"Trapèzes inférieurs, coiffe",niveau:"Débutant"},
{nom:"Face pull unilatéral",note:"Un bras — la rotation externe asymétrique révélée",muscles:"Coiffe du côté travaillé",niveau:"Intermédiaire"},
{nom:"Pull-apart élastique",note:"Écartement bras tendus — la rétraction pure sans flexion de coude",muscles:"Rhomboïdes, deltoïde postérieur",niveau:"Débutant"}],
erreurs:["Hausser les épaules pendant le tirage","Tirer vers le cou ou la poitrine au lieu du visage","Coudes qui tombent — la rotation externe disparaît"]},

{n:"Wall slide",s:"3",r:"10-12",rest:"45s",ch:"Corps",cat:"correctif",mat:"poids de corps",
morpho:" Trapèze inférieur endormi : le glissement des bras contre le mur force sa participation — le muscle postural le plus déficitaire.\nÉpaules raides en élévation : gagne de l'amplitude au-dessus de la tête sans charge, prérequis au développé militaire.\nPosture d'écran (tête avancée, épaules enroulées) : l'exercice de bureau par excellence, réalisable partout.\nLe test et le correctif en un : si les bras décollent du mur, le déficit est identifié.",
tips:["Dos au mur : tête, haut du dos et sacrum en contact","Bras en position de W contre le mur, coudes et poignets plaqués","Glisser les bras vers le haut en gardant le contact maximal","Monter aussi haut que possible sans cambrer ni décoller","Redescendre en tirant les coudes vers le bas et l'arrière"],
variantes:[
{nom:"Floor slide (au sol)",note:"Allongé sur le dos — la gravité aide à maintenir les contacts",muscles:"Trapèzes inférieurs, coiffe",niveau:"Débutant"},
{nom:"Wall slide + élastique",note:"Mini-bande tendue entre les mains — la coiffe active pendant le glissement",muscles:"Coiffe, trapèzes inférieurs",niveau:"Intermédiaire"},
{nom:"Wall slide décollé",note:"Les bras quittent le mur en fin de montée — le renforcement actif en fin d'amplitude",muscles:"Trapèzes inférieurs, dentelé",niveau:"Intermédiaire"}],
erreurs:["Cambrure lombaire pour compenser le manque de mobilité","Coudes et poignets qui décollent du mur","Épaules qui haussent pendant la montée"]},
],
};
