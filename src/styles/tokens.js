// @ts-check
// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — MorphoCoach
// Source unique de vérité pour TOUTES les valeurs visuelles.
// Fichier 100% additif : n'altère aucun comportement existant.
//
// Règle absolue : aucune valeur px, couleur, ombre ou radius ne doit être
// écrite en dur dans un composant. Tout passe par ces tokens.
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT, NUM, DARK } from "../data/constants.js";

// Ré-export pour que les nouveaux fichiers n'importent QUE tokens.js
export { C, FONT, NUM, DARK };

// ─── SPACING — échelle stricte base 4px ──────────────────────────────────────
// Mapping migration : 2-3→xs? non→2 reste "hairline" exceptionnel justifié.
// 4-5→xs · 6-9→sm · 10-13→md · 14-18→lg · 20-26→xl · 28-38→xxl · 40+→xxxl
export const SPACE = {
  xs:   4,   // micro-gaps : icône↔texte, dot↔label
  sm:   8,   // gap interne d'un groupe (chips, stats inline)
  md:   12,  // gap entre éléments d'une carte, entre cartes
  lg:   16,  // padding standard des cartes, padding horizontal des pages
  xl:   20,  // padding des cartes hero
  xxl:  24,  // séparation entre blocs
  xxxl: 32,  // séparation entre sections
};

// ─── TYPOGRAPHY — hiérarchie stricte ─────────────────────────────────────────
// Usage : <div style={{ ...TYPE.h2, color: C.text }}>Titre</div>
// Mapping migration :
//   32-44 → display · 24-30 → h1 · 18-22 → h2 · 15-17 → h3
//   13.5-14.5 → body · 12-13 → bodySmall · 10.5-11.5 → caption · ≤10 → micro
export const TYPE = {
  display:   { fontFamily: FONT, fontSize: 34, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1 },    // grands chiffres hero (avec NUM)
  h1:        { fontFamily: FONT, fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.5 },  // titre de page
  h2:        { fontFamily: FONT, fontSize: 20, fontWeight: 700, lineHeight: 1.2,  letterSpacing: -0.3 },  // titre de carte hero
  h3:        { fontFamily: FONT, fontSize: 16, fontWeight: 600, lineHeight: 1.3,  letterSpacing: -0.2 },  // titre de carte / ligne de liste
  body:      { fontFamily: FONT, fontSize: 14, fontWeight: 500, lineHeight: 1.5,  letterSpacing: 0 },     // texte courant
  bodySmall: { fontFamily: FONT, fontSize: 13, fontWeight: 500, lineHeight: 1.45, letterSpacing: 0 },     // texte secondaire
  caption:   { fontFamily: FONT, fontSize: 11, fontWeight: 600, lineHeight: 1.35, letterSpacing: 0.1 },   // méta, unités, dates
  micro:     { fontFamily: FONT, fontSize: 10, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.1em", textTransform: "uppercase" }, // eyebrows, labels
};

// ─── RADIUS ──────────────────────────────────────────────────────────────────
// Mapping : 2-5→xs? non→utiliser sm sauf barres de progression (h/2 justifié)
// 6-9→sm · 10-13→md · 14-17→lg · 18-24→xl · 26+→xxl · 99/999→full
export const RADIUS = {
  sm:   8,    // chips, petits boutons, inputs compacts
  md:   12,   // boutons, inputs
  lg:   16,   // cartes standard
  xl:   20,   // cartes hero, bottom sheets (coins hauts)
  xxl:  28,   // modales plein écran, éléments XL
  full: 999,  // pills, avatars, dots
};

// ─── SHADOWS — 3 niveaux, light premium ──────────────────────────────────────
export const SHADOW = {
  low:    "0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)",   // = C.shadow — cartes au repos
  medium: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)",   // = C.shadowMd — cartes actives, dropdowns
  high:   "0 8px 16px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.14)", // modales, sheets, éléments flottants
  accent: "0 2px 8px rgba(59,130,246,0.30)",                           // CTA primaires uniquement
};

// ─── BORDERS ─────────────────────────────────────────────────────────────────
export const BORDER = {
  base:   `1px solid ${C.bd}`,                    // séparateurs, cartes
  strong: `1px solid ${C.bdHi}`,                  // éléments actifs
  accent: `1px solid rgba(59,130,246,0.25)`,      // cartes accent
  focus:  `1px solid rgba(59,130,246,0.50)`,      // états focus
};

// ─── Z-INDEX — échelle fermée (interdit : 9999, 10020, 2147483647…) ─────────
export const Z = {
  base:     0,
  raised:   1,     // empilement local dans une carte
  sticky:   100,   // header sticky + bottom nav
  fab:      150,   // bouton flottant Coach
  panel:    200,   // panneau plein écran (Coach)
  sheet:    300,   // bottom sheets & modales
  sheetHi:  320,   // modale au-dessus d'une sheet (guides, éditeurs)
  modal:    340,   // paywall, confirmations bloquantes
  screen:   360,   // overlays plein écran (photo, viewer)
  scanner:  380,   // caméra / focus plein écran
  celebrate:400,   // level-up
  notif:    500,   // toasts — rien au-dessus
};

// ─── MOTION — durées & easings (alignés sur GLOBAL_CSS) ─────────────────────
export const MOTION = {
  fast:   "0.12s ease",                          // press states (.tap)
  base:   "0.2s ease",                           // fades, hovers
  smooth: "0.28s cubic-bezier(.22,1,.36,1)",     // slides, sheets
  slow:   "0.5s ease",                           // barres de progression
};

// ─── BREAKPOINTS — PWA mobile-first, maxWidth 500 ────────────────────────────
export const BP = {
  xs: 360,   // petits Android / iPhone SE
  sm: 430,   // iPhone Pro Max
  md: 500,   // largeur max de l'app (PageContainer)
  lg: 768,   // tablette — l'app reste centrée 500px
};

// ─── TAILLES FIXES — touch targets & icônes ──────────────────────────────────
export const SIZE = {
  touch:   44,   // cible tactile minimum (Apple HIG)
  iconSm:  14,
  icon:    18,
  iconLg:  24,
  control: 36,   // boutons icône ronds (header, cards)
};
