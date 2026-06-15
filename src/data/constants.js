// @ts-check
// ─── THÈME PREMIUM MINIMAL ─────────────────────────────────────────────────
export const C = {
  // Surfaces — light premium
  bg:"#F6F8FB", s1:"#FFFFFF", s2:"#F0F2F7", s3:"#E8EBF2",
  // Borders
  bd:"rgba(0,0,0,0.06)", bdHi:"rgba(0,0,0,0.10)",
  // Accent unique — bleu moderne (inchangé)
  accent:"#3B82F6", accentDk:"#2563EB", accentLt:"#DBEAFE",
  // Text — dark on light — hiérarchie Apple/Airbnb
  text:"#0F1923", mid:"#374151", dim:"#6B7280",
  // Semantic
  green:"#10B981", red:"#EF4444",
  // Compatibilité
  gold:"#3B82F6", goldL:"#93C5FD", goldD:"rgba(59,130,246,0.10)", goldB:"rgba(59,130,246,0.18)",
  blue:"#3B82F6", blueDk:"#2563EB", blueLt:"#93C5FD",
  amberDk:"#2563EB",
  orange:"#3B82F6", purple:"#3B82F6", lavender:"#3B82F6",
  cyan:"#3B82F6", ink:"#2563EB", sun:"#93C5FD",
  mint:"#10B981", coral:"#EF4444",
  // Surface variants
  surfHi:"#E8EBF2",
  // Shadows iOS
  shadow:"0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)",
  shadowMd:"0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)",
};

// ─── POLICES CENTRALISÉES ─────────────────────────────────────────────────────
// Source unique de vérité pour la typographie. Importer depuis ici partout.
export const FONT  = "'Outfit','DM Sans',system-ui,sans-serif";
export const SERIF = "'DM Serif Display','Georgia',serif";
export const NUM   = { fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum"' };

// ─── INTENSITÉS DE SÉANCE ─────────────────────────────────────────────────────
export const INT = {
  leger:    { l:"Léger",    c:"#34D399" },
  modere:   { l:"Modéré",   c:"#FB923C" },
  lourd:    { l:"Lourd",    c:"#F87171" },
  intense:  { l:"Intense",  c:"#EF4444" },
  mobilite: { l:"Mobilité", c:"#34D399" },
};

// ─── COULEURS DE SÉANCES CALENDRIER ───────────────────────────────────────────
export const SESS_COLORS = [
  "#3B82F6","#60A5FA","#93C5FD","#34D399",
  "#2563EB","#6EE7B7","#F87171","#BFDBFE"
];

// ─── OBJECTIFS NUTRITION ──────────────────────────────────────────────────────
export const OBJ = {
  hypertrophie: { l:"Prise de muscle",   icon:"💪", surplus:300,  p:2.2, g:4.0, li:1.0 },
  force:        { l:"Force athlétique",  icon:"🏋️", surplus:200,  p:2.0, g:3.5, li:1.1 },
  poids:        { l:"Perte de poids",    icon:"🔥", deficit:-400, p:2.4, g:2.5, li:0.9 },
  sante:        { l:"Santé générale",    icon:"❤️", surplus:0,   p:1.6, g:3.0, li:1.0 },
  prep_physique:{ l:"Prépa physique",    icon:"⚡", surplus:100,  p:1.8, g:3.5, li:1.0 },
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
export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display:ital@0;1&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
html{height:100%;height:-webkit-fill-available}
body{background:#F6F8FB;color:#0F1923;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;min-height:-webkit-fill-available}
#root{min-height:100vh;min-height:100dvh;background:#F6F8FB}
input,textarea,select{outline:none;font-family:'DM Sans',sans-serif;color:${C.text}}
input::placeholder,textarea::placeholder{color:#6B7280}
select option{background:#111827;color:${C.text}}
::-webkit-scrollbar{width:2px;height:2px}
::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.10);border-radius:2px}

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

.anim{animation:fadeUp .25s ease both}
.notif{animation:slideDown .35s cubic-bezier(.22,1,.36,1) both}
.fade-in{animation:fadeIn .2s ease both}
.scale-in{animation:scaleIn .2s ease both}
.slide-up{animation:slideUp .28s cubic-bezier(.22,1,.36,1) both}
.pop-in{animation:popIn .22s cubic-bezier(.22,1,.36,1) both}
.page-enter{animation:fadeUp .22s cubic-bezier(.22,1,.36,1) both}

.tap{transition:transform .12s ease,opacity .12s ease;cursor:pointer;-webkit-user-select:none;user-select:none}
.tap:active{transform:scale(0.97);opacity:0.82}
.tap-sm:active{transform:scale(0.95)}
.tap-icon:active{transform:scale(0.90)}

.skeleton{background:linear-gradient(90deg,rgba(0,0,0,0.03) 25%,rgba(0,0,0,0.06) 50%,rgba(0,0,0,0.03) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}

.card-hover{transition:transform .18s ease,box-shadow .18s ease}
.card-hover:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,0.25)}

input:focus,textarea:focus,select:focus{border-color:rgba(59,130,246,0.50)!important;box-shadow:0 0 0 3px rgba(59,130,246,0.10);transition:box-shadow .15s,border-color .15s}

/* ── Global section spacing ── */
section + section { margin-top: 28px; }

@supports(-webkit-overflow-scrolling:touch){*{-webkit-overflow-scrolling:touch}}
@media print{.np{display:none!important}}
`;
