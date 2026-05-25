// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
// Source unique de vérité pour les valeurs visuelles répétées de l'app.
//
// Choix d'architecture : UN seul fichier (pas 5 fichiers tokens/spacing/colors/
// shadows/radius). À l'échelle de MorphoCoach, éclater en 5 fichiers ajoute des
// imports sans bénéfice — c'est de l'abstraction prématurée. Si l'app grossit
// fortement, ce fichier pourra être scindé sans rien casser (les imports
// resteront `from "../styles/tokens.js"`).
//
// Les couleurs NE sont PAS redéfinies ici : on ré-exporte `C` depuis
// constants.js pour éviter d'avoir deux palettes qui divergent.
//
// Usage :
//   import { color, space, radius, shadow, font } from "../../styles/tokens.js";
//   <div style={{ padding: space.md, borderRadius: radius.card }}>

import { C } from "../data/constants.js";

// ─── COULEURS ────────────────────────────────────────────────────────────────
// Alias sémantiques pointant vers la palette existante `C`.
// Utiliser ces noms rend le code lisible : `color.textMuted` > `"#64748b"`.
export const color = {
  ...C,
  // alias sémantiques (les composants devraient préférer ceux-ci)
  surface:     C.s1,   // #ffffff  — fond des cards
  bg:          C.bg,   // #e4eef8  — fond de page
  border:      C.s3,   // #dce8f4  — bordures fines
  text:        C.text, // #0f1a2e  — texte principal
  textMuted:   C.mid,  // #64748b  — texte secondaire / labels
  primary:     C.blue, // #3b82f6  — bleu d'action
  primarySoft: C.goldD,// rgba(59,130,246,0.08) — fond bleu très léger
};

// ─── ESPACEMENTS ─────────────────────────────────────────────────────────────
// Échelle calquée sur les valeurs déjà présentes dans le code (7,8,9,14,16…).
export const space = {
  xs:  4,
  sm:  8,
  md:  9,   // marginBottom de référence des cards
  lg:  14,
  xl:  16,  // padding horizontal de référence
  xxl: 22,
};

// ─── RAYONS DE BORDURE ───────────────────────────────────────────────────────
// Nommés par usage pour rester cohérent (pas de chiffres magiques en JSX).
export const radius = {
  input:  9,    // inputs / boutons
  chip:   12,   // petits blocs / chips
  modal:  14,   // modals
  card:   16,   // cards
  pill:   20,   // onglets / tags arrondis
  round:  "50%",
};

// ─── OMBRES ──────────────────────────────────────────────────────────────────
export const shadow = {
  none:  "none",
  card:  "0 4px 16px rgba(59,130,246,0.08)",
  sheet: "0 -4px 24px rgba(0,0,0,0.15)",
  accent:`0 2px 8px ${C.goldD}`,
};

// ─── TYPOGRAPHIE ─────────────────────────────────────────────────────────────
export const font = {
  display: "'Syne',sans-serif",  // titres
  body:    "'Inter',sans-serif", // corps de texte
};

export default { color, space, radius, shadow, font };
