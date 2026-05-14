// ─── THÈME & COULEURS ─────────────────────────────────────────────────────────
export const C = {
  bg:"#e4eef8", s1:"#ffffff", s2:"#e4eef8", s3:"#dce8f4",
  gold:"#3b82f6", goldL:"#60a5fa", goldD:"rgba(59,130,246,0.08)", goldB:"rgba(59,130,246,0.2)",
  text:"#0f1a2e", mid:"#64748b", dim:"#c4d4e8",
  green:"#22c55e", red:"#f87171", blue:"#3b82f6", orange:"#f97316", purple:"#8b5cf6",
  cyan:"#06b6d4", accent:"#3b82f6",
};

// ─── INTENSITÉS DE SÉANCE ─────────────────────────────────────────────────────
export const INT = {
  leger:    { l:"Léger",    c:"#22c55e" },
  modere:   { l:"Modéré",   c:"#3b82f6" },
  lourd:    { l:"Lourd",    c:"#f97316" },
  intense:  { l:"Intense",  c:"#f87171" },
  mobilite: { l:"Mobilité", c:"#8b5cf6" },
};

// ─── COULEURS DE SÉANCES CALENDRIER ───────────────────────────────────────────
export const SESS_COLORS = [
  "#3b82f6","#22c55e","#f97316","#f87171",
  "#8b5cf6","#06b6d4","#ec4899","#eab308"
];

// ─── OBJECTIFS NUTRITION ──────────────────────────────────────────────────────
export const OBJ = {
  hypertrophie: { l:"Prise de muscle",   icon:"💪", surplus:300,  p:2.2, g:4.0, li:1.0 },
  force:        { l:"Force athlétique",  icon:"🏋️", surplus:200,  p:2.0, g:3.5, li:1.1 },
  poids:        { l:"Perte de poids",    icon:"🔥", deficit:-400, p:2.4, g:2.5, li:0.9 },
  sante:        { l:"Santé générale",    icon:"❤️", surplus:0,   p:1.6, g:3.0, li:1.0 },
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
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@300;400;500;700&family=Inter:wght@300;400;500&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
body{background:#e4eef8;color:#0f1a2e;font-family:'Inter',sans-serif}
input,textarea,select{outline:none;font-family:'Inter',sans-serif}
input::placeholder,textarea::placeholder{color:#c4d4e8}
select option{background:#e4eef8}
::-webkit-scrollbar{width:2px;height:2px}
::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.2);border-radius:2px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.anim{animation:fadeUp .3s ease both}
.notif{animation:slideDown .4s ease both}
@media print{.np{display:none!important}}
`;
