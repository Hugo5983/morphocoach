// ─── THÈME & COULEURS (Dark Premium) ──────────────────────────────────────
export const C = {
  // Surfaces
  bg:"#0B0F1F", s1:"#141A2E", s2:"#1C2440", s3:"rgba(190,180,255,0.07)",
  // Borders
  bd:"rgba(190,180,255,0.07)", bdHi:"rgba(190,180,255,0.14)",
  // Brand duality : blue → amber
  gold:"#FFAB5D", goldL:"#FFD194", goldD:"rgba(255,171,93,0.12)", goldB:"rgba(255,171,93,0.25)",
  // Text — cream tint
  text:"#F5F1E8", mid:"rgba(245,241,232,0.74)", dim:"rgba(245,241,232,0.32)",
  // Semantic
  green:"#5FE0A5", red:"#FF7A6B", blue:"#4D8BFF", orange:"#FFAB5D", purple:"#B69DFF",
  cyan:"#06b6d4", accent:"#4D8BFF",
  // Extended
  amberDk:"#D67A2E", blueDk:"#2A5DD8", blueLt:"#8FB6FF",
  mint:"#5FE0A5", coral:"#FF7A6B", lavender:"#B69DFF", ink:"#3A4DBE", sun:"#FFC857",
  // Surface variants
  surfHi:"#1C2440",
};

// ─── INTENSITÉS DE SÉANCE ─────────────────────────────────────────────────────
export const INT = {
  leger:    { l:"Léger",    c:"#5FE0A5" },
  modere:   { l:"Modéré",   c:"#4D8BFF" },
  lourd:    { l:"Lourd",    c:"#FFAB5D" },
  intense:  { l:"Intense",  c:"#FF7A6B" },
  mobilite: { l:"Mobilité", c:"#B69DFF" },
};

// ─── COULEURS DE SÉANCES CALENDRIER ───────────────────────────────────────────
export const SESS_COLORS = [
  "#4D8BFF","#5FE0A5","#FFAB5D","#FF7A6B",
  "#B69DFF","#06b6d4","#ec4899","#FFC857"
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

// ─── CSS GLOBAL (Dark Premium) ────────────────────────────────────────────────
export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
body{background:#0B0F1F;color:#F5F1E8;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
input,textarea,select{outline:none;font-family:'Inter',sans-serif;color:#F5F1E8}
input::placeholder,textarea::placeholder{color:rgba(245,241,232,0.32)}
select option{background:#141A2E;color:#F5F1E8}
::-webkit-scrollbar{width:2px;height:2px}
::-webkit-scrollbar-thumb{background:rgba(190,180,255,0.15);border-radius:2px}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes popIn{0%{transform:scale(0.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes bounceIn{0%{transform:translateY(4px);opacity:0}60%{transform:translateY(-2px)}100%{transform:translateY(0);opacity:1}}
@keyframes pulseGlow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
@keyframes shine{0%{background-position:-180% 0}100%{background-position:200% 0}}

.anim{animation:fadeUp .3s ease both}
.notif{animation:slideDown .4s ease both}
.fade-in{animation:fadeIn .25s ease both}
.scale-in{animation:scaleIn .2s cubic-bezier(.34,1.56,.64,1) both}
.slide-up{animation:slideUp .3s cubic-bezier(.22,1,.36,1) both}
.pop-in{animation:popIn .25s cubic-bezier(.34,1.56,.64,1) both}
.page-enter{animation:fadeUp .25s cubic-bezier(.22,1,.36,1) both}

.tap{transition:transform .15s cubic-bezier(.4,0,.2,1),opacity .15s ease,background .2s ease;cursor:pointer;-webkit-user-select:none;user-select:none}
.tap:active{transform:scale(0.97);opacity:0.85}
.tap-sm:active{transform:scale(0.94)}
.tap-icon:active{transform:scale(0.88)}

.skeleton{background:linear-gradient(90deg,rgba(190,180,255,0.06) 25%,rgba(190,180,255,0.10) 50%,rgba(190,180,255,0.06) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}

.card-hover{transition:transform .2s ease,box-shadow .2s ease}
.card-hover:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(77,139,255,0.12)}

input:focus,textarea:focus,select:focus{border-color:rgba(77,139,255,0.4)!important;box-shadow:0 0 0 3px rgba(77,139,255,0.12);transition:box-shadow .15s,border-color .15s}

@supports(-webkit-overflow-scrolling:touch){*{-webkit-overflow-scrolling:touch}}
@media print{.np{display:none!important}}
`;
