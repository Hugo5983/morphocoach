// ─── KNOWLEDGE : SÉCURITÉ (C2) ──────────────────────────────────────────────
// Distillé de la Couche sécurité & personnalisation morpho-anatomique du PDF.
// La sécurité prime TOUJOURS sur l'objectif — filtre permanent.

export const REGLES_PATHO = {
  "Lombalgie":        "LOMBAIRES : INTERDITS soulevé de terre lourd, good morning, hyperextension lourde, squat haute barre. OBLIGATOIRES gainage transverse, bird-dog, pont fessier, soulevé de terre roumain léger. Éviter flexion lombaire sous charge.",
  "Hernie discale":   "LOMBAIRES : INTERDITS soulevé de terre lourd, good morning, hyperextension lourde, squat haute barre. OBLIGATOIRES gainage transverse, bird-dog, pont fessier. Éviter toute flexion lombaire sous charge.",
  "Scoliose":         "SCOLIOSE : exercices UNILATÉRAUX prioritaires pour corriger les asymétries. Éviter charges axiales lourdes. Prioriser câbles et haltères.",
  "Cervicalgie":      "CERVICALES : INTERDITS tirage nuque, développé nuque. Limiter les positions tête en avant. Face pull et rétraction scapulaire à chaque séance.",
  "Conflit épaule":   "ÉPAULE : INTERDITS développé barre strict, tirage nuque, élévations frontales, mouvements > 90° au-dessus de la tête (collision supra-épineux/acromion). OBLIGATOIRES face pull, rotation externe. Mouvements dans le plan scapulaire uniquement.",
  "Coiffe rotateurs": "ÉPAULE : INTERDITS développé barre strict, tirage nuque, élévations frontales. OBLIGATOIRES face pull, rotation externe progressive. Plan scapulaire uniquement, dips seulement si tolérés.",
  "Ménisque":         "GENOU : INTERDITS squat profond, fentes avec impact, leg press pieds hauts. OK presse 60° amplitude limitée, leg extension léger pour VMO, step-up contrôlé. Renforcement ischios prioritaire.",
  "LCA":              "GENOU : INTERDITS squat profond, pivots, impacts. Presse amplitude contrôlée, renforcement ischios PRIORITAIRE (ratio ischios/quadris), proprioception intégrée.",
  "Tendinite":        "TENDINOPATHIE : charges modérées, tempo lent, travail excentrique contrôlé progressif. Éviter les amplitudes d'étirement extrêmes (seuil micro-lésion tendon ≈ 4 % d'allongement). +24 h de délai entre séances sollicitant la zone.",
  "Arthrose":         "ARTHROSE : charges modérées, amplitudes réduites, éviter les chocs articulaires. Privilégier machines guidées et câbles. Le cartilage se régénère mais TRÈS lentement.",
  "Épicondylite":     "ÉPICONDYLITE : INTERDITS curl barre droite, rowing barre pronation stricte. OK curl haltères/EZ/câble. Excentrique contrôlé sur fléchisseurs.",
  "Canal carpien":    "CANAL CARPIEN : éviter flexion/extension forcée du poignet sous charge. Sangles autorisées. Éviter push-ups sur poignets (préférer poignées).",
  "Tendinite Achille":"ACHILLE : INTERDITS mollets debout lourds, sauts, accélérations brutales. OK mollets assis, excentrique en déclive (protocole progressif).",
  "Coxarthrose":      "HANCHE : amplitudes réduites, pas de squat profond. Mouvements dans l'axe fonctionnel de la hanche uniquement.",
};

export function buildPathoRules(pathologies = []) {
  return pathologies
    .filter(p => p !== "Aucune" && REGLES_PATHO[p])
    .map(p => REGLES_PATHO[p])
    .join("\n");
}

/** Garde-fous transverses issus des principes fondateurs C2 (tissu sous contrainte). */
export function buildGardeFous({ age, niveau, sedentaire = false, sportJeune = false }) {
  const g = [
    "Fascias et tendons récupèrent 2-4× plus lentement que le muscle : ≥ 48-72 h entre séances sollicitant les mêmes tendons/fascias, indépendamment de la récupération musculaire perçue (pratiquants > 6 mois).",
    "Deload OBLIGATOIRE toutes les 4-8 semaines : volume −40/−50 %, intensité −10/−20 %.",
    "Les courbatures ne sont PAS une métrique d'efficacité : ne pas les viser, ne pas pénaliser leur absence.",
    "Douleur articulaire/tendineuse persistante > 48-72 h = signal pathologique, jamais 'no pain no gain'. L'IA ne pose JAMAIS de diagnostic : elle adapte et oriente vers un professionnel.",
    "Excentrique = 3× moins de recrutement contractile, tension transférée aux tissus collagéniques : vitesse de descente contrôlée, surtout sous charge lourde.",
  ];
  const a = parseInt(age) || 0;
  if (a >= 45) g.push("≥ 45 ans : échauffement articulaire long obligatoire, progression de charge plus lente (+2,5 kg max), amplitudes confortables, récupération +24 h sur les zones tendineuses.");
  if (a >= 35) g.push("≥ 35 ans ou antécédent de tendinopathie : +24 h au délai inter-séances de la zone concernée.");
  if (sedentaire || niveau === "debutant")
    g.push("Débutant adulte avec fond sédentaire : terrain fascial fragile → première phase = conditionnement fascial et tendineux (charges légères, tempo lent, tension prolongée) avant toute intensification.");
  if (sportJeune)
    g.push("Sport de force/pivot pratiqué avant 15 ans : risque morphologique de hanche présumé (déformation cam) → prudence squat profond, privilégier presse/hack, surveiller tout signal de hanche.");
  g.push("Travail favorable au fascia (tension prolongée, tempo lent, faible impact) au moins 1×/cycle hebdomadaire pour intermédiaires et avancés.");
  return g.join("\n- ");
}
