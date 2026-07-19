// @ts-check
// ─── THÈME « PRÉCISION » — direction 1c ──────────────────────────────────────
export const C = {
  // Surfaces — light, froid
  bg:"#F6F7F9", s1:"#FFFFFF", s2:"#F2F4F7", s3:"#EAECF0",
  // Borders — hairlines
  bd:"rgba(16,19,24,0.08)", bdHi:"rgba(16,19,24,0.12)",
  // Accent — UN seul bleu
  accent:"#3C5BFF", accentDk:"#2E48D9", accentLt:"#E8EBFF",
  accentOnDark:"#9DB0FF",
  // Text
  text:"#101318", mid:"#344054", dim:"#667085",
  // Semantic
  green:"#12B76A", red:"#E5484D", amber:"#F59E0B",
  // Surface sombre inversée (encart Coach, célébrations)
  ink:"#101318",
  // Compatibilité — tous les alias décoratifs pointent vers l'accent
  gold:"#3C5BFF", goldL:"#9DB0FF", goldD:"rgba(60,91,255,0.10)", goldB:"rgba(60,91,255,0.18)",
  blue:"#3C5BFF", blueDk:"#2E48D9", blueLt:"#9DB0FF",
  amberDk:"#2E48D9",
  orange:"#3C5BFF", purple:"#3C5BFF", lavender:"#3C5BFF",
  cyan:"#3C5BFF", sun:"#9DB0FF",
  mint:"#12B76A", coral:"#E5484D",
  // Surface variants
  surfHi:"#EAECF0",
  // Shadows — quasi absentes, la hiérarchie vient des hairlines
  shadow:"0 1px 2px rgba(16,19,24,0.04)",
  shadowLg:"0 12px 32px rgba(16,19,24,0.14)",
  shadowMd:"0 4px 12px rgba(16,19,24,0.06)",
};


// ─── SURFACES SOMBRES — cartes"Coach IA style" (source unique) ──────────────
export const DARK = {
  bg:"#101318",
  accent:"#9DB0FF",   // accent unique sur surfaces sombres
  surface:"#1A1F27",
  border:"rgba(255,255,255,0.08)",
  text:"#F6F7F9",
  dim:"rgba(246,247,249,0.55)",
};

// ─── POLICES CENTRALISÉES ─────────────────────────────────────────────────────
// Archivo (Google Fonts) — police unique sur toute l'application.
// 400 = corps · 500 = secondaire · 600 = interface · 700 = titres · 800 = display
export const FONT  ="'Archivo',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
export const SERIF = FONT; // alias hérité — même police, source unique
export const NUM   = { fontVariantNumeric:"tabular-nums", fontFeatureSettings:'"tnum"' };

// ─── INTENSITÉS DE SÉANCE ─────────────────────────────────────────────────────
export const INT = {
  leger:    { l:"Léger",    c:"#3C5BFF" },
  modere:   { l:"Modéré",   c:"#3C5BFF" },
  lourd:    { l:"Lourd",    c:"#3C5BFF" },
  intense:  { l:"Intense",  c:"#3C5BFF" },
  mobilite: { l:"Mobilité", c:"#3C5BFF" },
};


// ─── COULEURS CATÉGORIELLES — catégories d'exercices (source unique) ─────────
export const CAT = {
  principal:"#4D8BFF",
  correctif:"#FF7A6B",
  gainage:"#5FE0A5",
  isolation:"#B69DFF",
  mobilite:"#06B6D4",
  correctiv:"#FF7A6B", // alias de compat (donnée historique)
};

// ─── COULEURS DE SÉANCES CALENDRIER ───────────────────────────────────────────
export const SESS_COLORS = [
"#3C5BFF","#9DB0FF","#C9D3FF","#34D399",
"#2E48D9","#6EE7B7","#F87171","#DCE2FF"
];

// ─── OBJECTIFS NUTRITION ──────────────────────────────────────────────────────
export const OBJ = {
  hypertrophie: { l:"Prise de muscle",   surplus:300,  p:2.2, g:4.0, li:1.0 },
  force:        { l:"Force athlétique",  surplus:200,  p:2.0, g:3.5, li:1.1 },
  poids:        { l:"Perte de poids",    deficit:-400, p:2.4, g:2.5, li:0.9 },
  sante:        { l:"Santé générale",    surplus:0,   p:1.6, g:3.0, li:1.0 },
  prep_physique:{ l:"Prépa physique",    surplus:100,  p:1.8, g:3.5, li:1.0 },
};

// ─── FACTEURS D'ACTIVITÉ TDEE ─────────────────────────────────────────────────
export const ACTIVITE_FACTOR = {
  sedentaire:  1.2,
  leger:       1.375,
  modere:      1.55,
  actif:       1.725,
  tres_actif:  1.9,
};

// ─── CSS GLOBAL ───────────────────────────────────────────────────────────────
export const GLOBAL_CSS =`
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
html{height:100%;height:-webkit-fill-available}
body{background:#F6F7F9;color:#101318;font-family:'Archivo',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;min-height:-webkit-fill-available}
#root{min-height:100vh;min-height:100dvh;background:#F6F7F9}
input,textarea,select{outline:none;font-family:'Archivo',system-ui,sans-serif;color:${C.text}}
input::placeholder,textarea::placeholder{color:#667085}
select option{background:#FFFFFF;color:#101318}
::-webkit-scrollbar{width:2px;height:2px}
::-webkit-scrollbar-thumb{background:rgba(16,19,24,0.10);border-radius:2px}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes popIn{0%{transform:scale(0.92);opacity:0}70%{transform:scale(1.02)}100%{transform:scale(1);opacity:1}}
@keyframes bounceIn{0%{transform:translateY(4px);opacity:0}60%{transform:translateY(-2px)}100%{transform:translateY(0);opacity:1}}
@keyframes pulseGlow{0%,100%{opacity:.5}50%{opacity:.9}}
@keyframes shine{0%{background-position:-180% 0}100%{background-position:200% 0}}
@keyframes bu-fade{from{opacity:0}to{opacity:1}}
@keyframes bu-spin{to{transform:rotate(360deg)}}
@keyframes bu-ring{0%{transform:scale(.55);opacity:.8}100%{transform:scale(1.7);opacity:0}}
@keyframes bu-pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes bu-sweep{0%{transform:translateX(-160%) rotate(18deg)}55%,100%{transform:translateX(320%) rotate(18deg)}}
@keyframes bu-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes badge-in{0%{opacity:0;transform:scale(.8) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes badge-shine{0%{background-position:-180% 0}60%,100%{background-position:220% 0}}

.anim{animation:fadeUp .25s ease both}
.notif{animation:slideDown .35s cubic-bezier(.22,1,.36,1) both}
.fade-in{animation:fadeIn .2s ease both}
.scale-in{animation:scaleIn .2s ease both}
.slide-up{animation:slideUp .28s cubic-bezier(.22,1,.36,1) both}
.pop-in{animation:popIn .22s cubic-bezier(.22,1,.36,1) both}
.page-enter{animation:fadeUp .22s cubic-bezier(.22,1,.36,1) both}

.tap{transition:transform .12s ease,opacity .12s ease;cursor:pointer;-webkit-user-select:none;user-select:none}
.tap:active{transform:scale(0.98);opacity:0.85}
.tap-sm:active{transform:scale(0.96)}
.tap-icon:active{transform:scale(0.90)}

.badge-earned{position:relative;overflow:hidden}
.badge-earned::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.55) 50%,transparent 60%);background-size:220% 100%;animation:badge-shine 4.5s ease-in-out infinite}

.skeleton{background:linear-gradient(90deg,rgba(16,19,24,0.03) 25%,rgba(16,19,24,0.06) 50%,rgba(16,19,24,0.03) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}

.card-hover{transition:transform .18s ease,box-shadow .18s ease}
.card-hover:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,19,24,0.08)}

input:focus,textarea:focus,select:focus{border-color:rgba(60,91,255,0.50)!important;box-shadow:0 0 0 3px rgba(60,91,255,0.10);transition:box-shadow .15s,border-color .15s}

/* ── Global section spacing ── */
section + section { margin-top: 32px; }

@supports(-webkit-overflow-scrolling:touch){*{-webkit-overflow-scrolling:touch}}
@media print{.np{display:none!important}}
`;
