// ─── BASE DE RECETTES MORPHOCOACH ─────────────────────────────────────────────
// Chaque recette : macros, temps, portions, catégorie repas, tags, ingrédients, étapes.
// tags possibles : "vegan", "anti_inflammatoire", "sante", "proteine", "rapide"

// ─── Photos Unsplash — licence gratuite, usage commercial autorisé ───────────
const IMG = {
  // Petit-déjeuner
  oats:      "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=80", // overnight oats myrtilles
  yaourt:    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80", // bowl yaourt granola fruits
  pancakes:  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80", // pancakes dorés
  smoothieB: "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=600&q=80", // smoothie bowl mangue orange
  oeufs:     "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80", // œufs brouillés épinards
  // Déjeuner
  bowl:      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",   // bowl quinoa avocat
  poulet:    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80", // poulet grillé riz légumes
  poke:      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80", // poke bowl saumon edamame
  wrap:      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80", // wrap poulet avocat
  buddha:    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80", // buddha bowl coloré légumes
  // Dîner
  saumon:    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80", // saumon rôti brocoli
  miso:      "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80",    // soupe miso tofu
  curry:     "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80", // curry jaune pois chiches
  thon:      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80", // steak thon grillé
  // Collations
  smoothie:  "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80",    // smoothie mangue orange
  energy:    "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80", // energy balls chocolat
  porridge:  "https://images.unsplash.com/photo-1517093602195-b40af9e53e35?w=600&q=80", // porridge cannelle pomme
  toast:     "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80", // toast avocat œuf
};

export const RECIPES = [
  // ── PETIT-DÉJEUNER ──────────────────────────────────────────────────────────
  {
    id:1, nom:"Overnight oats myrtilles & chia", repas:"pdej",
    tags:["sante","anti_inflammatoire","rapide"],
    kcal:368, prot:18, gluc:52, lip:11, temps:8, portions:1, difficulte:"Facile",
    img:IMG.oats,
    desc:"Un petit-déjeuner préparé la veille, riche en fibres et en antioxydants grâce aux myrtilles. Idéal pour bien démarrer la journée sans effort le matin.",
    ingredients:[
      { nom:"Flocons d'avoine", qte:"50 g" },
      { nom:"Lait d'amande", qte:"120 ml" },
      { nom:"Graines de chia", qte:"1 c. à s." },
      { nom:"Myrtilles fraîches", qte:"80 g" },
      { nom:"Miel", qte:"1 c. à c." },
    ],
    etapes:[
      "Mélangez les flocons d'avoine, le lait d'amande et les graines de chia dans un bocal.",
      "Ajoutez le miel et remuez bien.",
      "Couvrez et placez au réfrigérateur toute la nuit.",
      "Au matin, garnissez de myrtilles fraîches et dégustez.",
    ],
  },
  {
    id:2, nom:"Bowl yaourt grec & granola maison", repas:"pdej",
    tags:["proteine","sante","rapide"],
    kcal:290, prot:24, gluc:32, lip:8, temps:5, portions:1, difficulte:"Facile",
    img:IMG.yaourt,
    desc:"Riche en protéines, ce bowl crémeux rassasie durablement. Le granola maison apporte du croquant sans sucres ajoutés excessifs.",
    ingredients:[
      { nom:"Yaourt grec 0%", qte:"200 g" },
      { nom:"Granola maison", qte:"40 g" },
      { nom:"Fruits rouges", qte:"60 g" },
      { nom:"Miel", qte:"1 c. à c." },
    ],
    etapes:[
      "Versez le yaourt grec dans un bol.",
      "Parsemez de granola et de fruits rouges.",
      "Ajoutez un filet de miel et servez aussitôt.",
    ],
  },
  {
    id:3, nom:"Pancakes protéinés à la vanille", repas:"pdej",
    tags:["proteine"],
    kcal:312, prot:28, gluc:30, lip:9, temps:15, portions:2, difficulte:"Facile",
    img:IMG.pancakes,
    desc:"Des pancakes moelleux et gonflés en protéines, parfaits pour un petit-déjeuner gourmand qui soutient la prise de muscle.",
    ingredients:[
      { nom:"Flocons d'avoine", qte:"60 g" },
      { nom:"Whey vanille", qte:"30 g" },
      { nom:"Œuf", qte:"2 pièces" },
      { nom:"Banane mûre", qte:"1 pièce" },
      { nom:"Lait", qte:"50 ml" },
    ],
    etapes:[
      "Mixez tous les ingrédients jusqu'à obtenir une pâte lisse.",
      "Chauffez une poêle antiadhésive à feu moyen.",
      "Versez une louche de pâte et cuisez 2 min de chaque côté.",
      "Répétez et servez chaud avec des fruits.",
    ],
  },
  {
    id:4, nom:"Smoothie bowl mangue & graines", repas:"pdej",
    tags:["vegan","anti_inflammatoire","sante"],
    kcal:340, prot:12, gluc:58, lip:9, temps:10, portions:1, difficulte:"Facile",
    img:IMG.smoothieB,
    desc:"Un smoothie bowl onctueux et coloré, gorgé de vitamines. La mangue et le curcuma offrent une touche anti-inflammatoire naturelle.",
    ingredients:[
      { nom:"Mangue congelée", qte:"150 g" },
      { nom:"Banane", qte:"1 pièce" },
      { nom:"Lait de coco", qte:"100 ml" },
      { nom:"Graines de lin", qte:"1 c. à s." },
      { nom:"Curcuma", qte:"1 pincée" },
    ],
    etapes:[
      "Mixez la mangue, la banane, le lait de coco et le curcuma.",
      "Versez dans un bol.",
      "Parsemez de graines de lin et de fruits frais.",
    ],
  },
  {
    id:5, nom:"Œufs brouillés épinards & feta", repas:"pdej",
    tags:["proteine","sante","rapide"],
    kcal:295, prot:22, gluc:6, lip:21, temps:10, portions:1, difficulte:"Facile",
    img:IMG.oeufs,
    desc:"Des œufs brouillés crémeux aux épinards, riches en protéines et faibles en glucides. Un classique parfait pour bien commencer.",
    ingredients:[
      { nom:"Œuf", qte:"3 pièces" },
      { nom:"Épinards frais", qte:"50 g" },
      { nom:"Feta", qte:"30 g" },
      { nom:"Huile d'olive", qte:"1 c. à c." },
    ],
    etapes:[
      "Battez les œufs dans un bol et assaisonnez.",
      "Faites revenir les épinards dans l'huile d'olive 1 min.",
      "Versez les œufs et remuez doucement à feu doux.",
      "Ajoutez la feta émiettée juste avant de servir.",
    ],
  },

  // ── DÉJEUNER ────────────────────────────────────────────────────────────────
  {
    id:6, nom:"Bowl protéiné quinoa & avocat", repas:"dej",
    tags:["proteine","sante","vegan"],
    kcal:487, prot:38, gluc:42, lip:21, temps:25, portions:2, difficulte:"Facile",
    img:IMG.bowl,
    desc:"Un bowl complet et rassasiant, riche en protéines végétales et en bons lipides. Parfait après l'entraînement ou pour un déjeuner consistant.",
    ingredients:[
      { nom:"Quinoa cuit", qte:"150 g" },
      { nom:"Avocat mûr", qte:"1 pièce" },
      { nom:"Pois chiches égouttés", qte:"120 g" },
      { nom:"Œuf poché", qte:"2 pièces" },
      { nom:"Graines de courge", qte:"1 c. à s." },
    ],
    etapes:[
      "Faites cuire le quinoa selon les instructions, puis laissez tiédir.",
      "Pochez les œufs 3 minutes dans une eau frémissante vinaigrée.",
      "Dressez le quinoa, l'avocat tranché et les pois chiches dans un bol.",
      "Ajoutez les œufs, parsemez de graines et assaisonnez.",
    ],
  },
  {
    id:7, nom:"Poulet grillé riz & légumes rôtis", repas:"dej",
    tags:["proteine","sante"],
    kcal:520, prot:45, gluc:48, lip:14, temps:35, portions:2, difficulte:"Moyen",
    img:IMG.poulet,
    desc:"Le repas équilibré par excellence : protéines maigres, glucides complexes et légumes. Idéal pour la récupération musculaire.",
    ingredients:[
      { nom:"Filet de poulet", qte:"250 g" },
      { nom:"Riz basmati cuit", qte:"180 g" },
      { nom:"Courgette", qte:"1 pièce" },
      { nom:"Poivron rouge", qte:"1 pièce" },
      { nom:"Huile d'olive", qte:"1 c. à s." },
    ],
    etapes:[
      "Préchauffez le four à 200°C.",
      "Coupez les légumes, arrosez d'huile et enfournez 25 min.",
      "Grillez le poulet assaisonné 6 min de chaque côté.",
      "Servez le poulet tranché avec le riz et les légumes.",
    ],
  },
  {
    id:8, nom:"Poke bowl saumon & edamame", repas:"dej",
    tags:["proteine","sante","anti_inflammatoire"],
    kcal:460, prot:34, gluc:44, lip:16, temps:20, portions:1, difficulte:"Facile",
    img:IMG.poke,
    desc:"Un poke bowl frais et coloré. Le saumon riche en oméga-3 et les edamame en font un plat aussi sain que savoureux.",
    ingredients:[
      { nom:"Saumon cru qualité sushi", qte:"120 g" },
      { nom:"Riz à sushi cuit", qte:"150 g" },
      { nom:"Edamame", qte:"60 g" },
      { nom:"Concombre", qte:"1/2 pièce" },
      { nom:"Sauce soja", qte:"1 c. à s." },
    ],
    etapes:[
      "Coupez le saumon en cubes réguliers.",
      "Disposez le riz tiède au fond du bol.",
      "Ajoutez le saumon, les edamame et le concombre.",
      "Arrosez de sauce soja et servez frais.",
    ],
  },
  {
    id:9, nom:"Wrap complet poulet & avocat", repas:"dej",
    tags:["proteine","rapide"],
    kcal:480, prot:36, gluc:40, lip:18, temps:15, portions:1, difficulte:"Facile",
    img:IMG.wrap,
    desc:"Un wrap nourrissant à emporter, équilibré en protéines et bons lipides. Parfait pour un déjeuner rapide sur le pouce.",
    ingredients:[
      { nom:"Tortilla complète", qte:"1 pièce" },
      { nom:"Poulet grillé", qte:"120 g" },
      { nom:"Avocat", qte:"1/2 pièce" },
      { nom:"Salade verte", qte:"30 g" },
      { nom:"Yaourt grec", qte:"1 c. à s." },
    ],
    etapes:[
      "Étalez le yaourt grec sur la tortilla.",
      "Disposez la salade, le poulet et l'avocat tranché.",
      "Roulez fermement le wrap et coupez en deux.",
    ],
  },
  {
    id:10, nom:"Buddha bowl légumes & houmous", repas:"dej",
    tags:["vegan","sante","anti_inflammatoire"],
    kcal:430, prot:18, gluc:54, lip:16, temps:25, portions:1, difficulte:"Facile",
    img:IMG.buddha,
    desc:"Un bowl végétal vibrant et anti-inflammatoire. Les légumes rôtis et le houmous offrent une explosion de saveurs et de nutriments.",
    ingredients:[
      { nom:"Patate douce", qte:"150 g" },
      { nom:"Pois chiches", qte:"100 g" },
      { nom:"Chou kale", qte:"40 g" },
      { nom:"Houmous", qte:"50 g" },
      { nom:"Graines de tournesol", qte:"1 c. à s." },
    ],
    etapes:[
      "Rôtissez la patate douce en cubes 25 min à 200°C.",
      "Massez le kale avec un peu d'huile d'olive.",
      "Disposez tous les éléments dans un bol.",
      "Ajoutez une cuillère de houmous au centre.",
    ],
  },

  // ── DÎNER ───────────────────────────────────────────────────────────────────
  {
    id:11, nom:"Saumon rôti & brocoli vapeur", repas:"din",
    tags:["proteine","sante","anti_inflammatoire"],
    kcal:410, prot:35, gluc:14, lip:24, temps:25, portions:2, difficulte:"Facile",
    img:IMG.saumon,
    desc:"Un dîner léger riche en oméga-3. Le saumon et le brocoli forment un duo anti-inflammatoire idéal en fin de journée.",
    ingredients:[
      { nom:"Pavé de saumon", qte:"2 pièces" },
      { nom:"Brocoli", qte:"300 g" },
      { nom:"Citron", qte:"1/2 pièce" },
      { nom:"Huile d'olive", qte:"1 c. à s." },
      { nom:"Aneth frais", qte:"qq brins" },
    ],
    etapes:[
      "Préchauffez le four à 190°C.",
      "Disposez le saumon, arrosez d'huile et de citron.",
      "Enfournez 15 min et faites cuire le brocoli à la vapeur 8 min.",
      "Parsemez d'aneth et servez.",
    ],
  },
  {
    id:12, nom:"Soupe miso tofu & champignons", repas:"din",
    tags:["vegan","sante","anti_inflammatoire","rapide"],
    kcal:185, prot:14, gluc:18, lip:7, temps:15, portions:2, difficulte:"Facile",
    img:IMG.miso,
    desc:"Une soupe réconfortante et légère. Le miso fermenté favorise la digestion et le tofu apporte des protéines complètes.",
    ingredients:[
      { nom:"Bouillon dashi", qte:"600 ml" },
      { nom:"Pâte de miso", qte:"2 c. à s." },
      { nom:"Tofu ferme", qte:"150 g" },
      { nom:"Champignons shiitake", qte:"80 g" },
      { nom:"Oignon vert", qte:"1 pièce" },
    ],
    etapes:[
      "Chauffez le bouillon dashi sans le faire bouillir.",
      "Délayez le miso dans un peu de bouillon puis incorporez.",
      "Ajoutez le tofu en cubes et les champignons.",
      "Laissez frémir 5 min, parsemez d'oignon vert.",
    ],
  },
  {
    id:13, nom:"Curry de pois chiches & épinards", repas:"din",
    tags:["vegan","anti_inflammatoire","sante"],
    kcal:390, prot:16, gluc:48, lip:15, temps:30, portions:3, difficulte:"Moyen",
    img:IMG.curry,
    desc:"Un curry parfumé et réconfortant. Le curcuma et le gingembre en font un plat anti-inflammatoire puissant et savoureux.",
    ingredients:[
      { nom:"Pois chiches", qte:"400 g" },
      { nom:"Lait de coco", qte:"200 ml" },
      { nom:"Épinards frais", qte:"100 g" },
      { nom:"Tomates concassées", qte:"200 g" },
      { nom:"Curcuma & gingembre", qte:"1 c. à s." },
    ],
    etapes:[
      "Faites revenir les épices dans une casserole 1 min.",
      "Ajoutez les tomates et le lait de coco, mélangez.",
      "Incorporez les pois chiches, laissez mijoter 15 min.",
      "Ajoutez les épinards en fin de cuisson jusqu'à ce qu'ils tombent.",
    ],
  },
  {
    id:14, nom:"Steak de thon & légumes grillés", repas:"din",
    tags:["proteine","sante"],
    kcal:350, prot:40, gluc:16, lip:14, temps:20, portions:2, difficulte:"Moyen",
    img:IMG.thon,
    desc:"Un dîner protéiné et léger. Le thon saisi conserve tout son moelleux, accompagné de légumes croquants.",
    ingredients:[
      { nom:"Steak de thon", qte:"2 pièces" },
      { nom:"Asperges vertes", qte:"150 g" },
      { nom:"Tomates cerises", qte:"100 g" },
      { nom:"Huile de sésame", qte:"1 c. à s." },
      { nom:"Graines de sésame", qte:"1 c. à c." },
    ],
    etapes:[
      "Saisissez le thon 1 min de chaque côté à feu vif.",
      "Grillez les asperges et les tomates à la poêle 5 min.",
      "Dressez et arrosez d'huile de sésame.",
      "Parsemez de graines de sésame.",
    ],
  },

  // ── COLLATIONS ──────────────────────────────────────────────────────────────
  {
    id:15, nom:"Smoothie protéiné mangue & gingembre", repas:"col",
    tags:["proteine","anti_inflammatoire","rapide"],
    kcal:220, prot:22, gluc:28, lip:4, temps:5, portions:1, difficulte:"Facile",
    img:IMG.smoothie,
    desc:"Un smoothie rafraîchissant et protéiné. Le gingembre apporte une touche anti-inflammatoire et booste la récupération.",
    ingredients:[
      { nom:"Mangue congelée", qte:"100 g" },
      { nom:"Whey vanille", qte:"25 g" },
      { nom:"Lait d'amande", qte:"200 ml" },
      { nom:"Gingembre frais", qte:"1 cm" },
    ],
    etapes:[
      "Placez tous les ingrédients dans un blender.",
      "Mixez jusqu'à obtenir une texture lisse.",
      "Servez immédiatement bien frais.",
    ],
  },
  {
    id:16, nom:"Energy balls cacao & noisette", repas:"col",
    tags:["vegan","rapide"],
    kcal:145, prot:5, gluc:16, lip:8, temps:15, portions:8, difficulte:"Facile",
    img:IMG.energy,
    desc:"De petites bouchées énergétiques parfaites avant l'entraînement. Sans cuisson, à conserver au réfrigérateur.",
    ingredients:[
      { nom:"Dattes dénoyautées", qte:"150 g" },
      { nom:"Noisettes", qte:"80 g" },
      { nom:"Cacao en poudre", qte:"2 c. à s." },
      { nom:"Flocons d'avoine", qte:"40 g" },
    ],
    etapes:[
      "Mixez les dattes et les noisettes en une pâte épaisse.",
      "Ajoutez le cacao et les flocons d'avoine, mixez à nouveau.",
      "Formez des boules de la taille d'une noix.",
      "Réfrigérez 1 h avant de déguster.",
    ],
  },
  {
    id:17, nom:"Porridge protéiné cannelle & pomme", repas:"col",
    tags:["sante","anti_inflammatoire"],
    kcal:280, prot:20, gluc:38, lip:6, temps:10, portions:1, difficulte:"Facile",
    img:IMG.porridge,
    desc:"Un porridge chaud et réconfortant. La cannelle aide à réguler la glycémie et apporte une saveur douce et épicée.",
    ingredients:[
      { nom:"Flocons d'avoine", qte:"45 g" },
      { nom:"Lait", qte:"200 ml" },
      { nom:"Whey nature", qte:"20 g" },
      { nom:"Pomme", qte:"1/2 pièce" },
      { nom:"Cannelle", qte:"1 pincée" },
    ],
    etapes:[
      "Faites chauffer le lait avec les flocons d'avoine 5 min.",
      "Hors du feu, incorporez la whey en remuant.",
      "Ajoutez la pomme coupée en dés et la cannelle.",
    ],
  },
  {
    id:18, nom:"Toast avocat & œuf poché", repas:"col",
    tags:["sante","proteine","rapide"],
    kcal:310, prot:16, gluc:24, lip:18, temps:10, portions:1, difficulte:"Facile",
    img:IMG.toast,
    desc:"Une collation équilibrée et rassasiante. L'avocat fournit de bons lipides et l'œuf des protéines de qualité.",
    ingredients:[
      { nom:"Pain complet", qte:"1 tranche" },
      { nom:"Avocat", qte:"1/2 pièce" },
      { nom:"Œuf", qte:"1 pièce" },
      { nom:"Citron", qte:"qq gouttes" },
    ],
    etapes:[
      "Toastez le pain complet.",
      "Écrasez l'avocat avec le citron et étalez sur le pain.",
      "Pochez l'œuf 3 min et déposez-le sur le toast.",
    ],
  },
];

// ─── SECTIONS PAR REPAS ───────────────────────────────────────────────────────
export const REPAS = [
  { id:"pdej", label:"Petit-déjeuner" },
  { id:"dej",  label:"Déjeuner" },
  { id:"din",  label:"Dîner" },
  { id:"col",  label:"Collations" },
];

// ─── FILTRES (repas + tags thématiques) ───────────────────────────────────────
export const FILTRES = [
  { id:"all",               l:"Tous",          type:"all" },
  { id:"vegan",             l:"Vegan",         type:"tag" },
  { id:"anti_inflammatoire",l:"Anti-inflam.",  type:"tag" },
  { id:"sante",             l:"Santé",         type:"tag" },
  { id:"proteine",          l:"Protéiné",      type:"tag" },
  { id:"rapide",            l:"Rapide",        type:"tag" },
];

// ─── BADGE AUTO selon la recette ──────────────────────────────────────────────
export function recipeBadge(r) {
  if (r.temps <= 10) return { l:`${r.temps} MIN`,        c:"#60A5FA" };
  if (r.prot  >= 35) return { l:`${r.prot}G PROT.`,      c:"#60A5FA" };
  if (r.tags.includes("vegan"))             return { l:"VEGAN",  c:"#34D399" };
  if (r.tags.includes("anti_inflammatoire"))return { l:"ANTI-INFLAM.", c:"#34D399" };
  if (r.difficulte === "Facile")            return { l:"FACILE", c:"#34D399" };
  return { l:r.difficulte.toUpperCase(), c:"#60A5FA" };
}
