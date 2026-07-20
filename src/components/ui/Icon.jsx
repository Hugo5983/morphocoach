// @ts-check
// ─── MorphoCoach · Icon — jeu d'icônes unique (style « Précision ») ───────────
// Une seule source pour toutes les icônes de l'app. Remplace les emoji et les
// glyphes texte (→ ← ▲ ▼ ‹ ↺ …).
//
// Usage :
//   import { I } from "../../components/ui/Icon.jsx";
//   <I name="check" />                         // 24px, stroke = couleur courante
//   <I name="flame" size={18} color={C.accent} />
//   <I name="home" size={22} fill />           // variante pleine (onglet actif)
//
// Convention : viewBox 24, stroke 1.8, bouts ronds — cohérent avec la nav.

const P = {
  // Navigation
  home:      { s:"M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4V15h-5v5.5H5.5A1.5 1.5 0 0 1 4 19v-8.5Z" },
  dumbbell:  { s:"M6.5 9v6M4 10v4M17.5 9v6M20 10v4M6.5 12h11", raw:
               '<rect x="2.6" y="9.2" width="3.4" height="5.6" rx="1.1"/><rect x="6" y="7" width="3.4" height="10" rx="1.2"/><rect x="14.6" y="7" width="3.4" height="10" rx="1.2"/><rect x="18" y="9.2" width="3.4" height="5.6" rx="1.1"/><path d="M9.4 12h5.2"/>' },
  nutrition: { s:"M12 7c-1.2-1.6-3-2.2-4.8-1.6C4.6 6.3 3.2 9 3.8 12c.7 3.6 3 7.4 5.5 8.6.9.4 1.6.4 2.7-.1 1.1.5 1.8.5 2.7.1 2.5-1.2 4.8-5 5.5-8.6.6-3-.8-5.7-3.4-6.6C15 4.8 13.2 5.4 12 7ZM12 6.5c0-2 1.3-3.5 3.2-3.9" },
  coach:     { s:"M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H13l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z" },
  user:      { raw:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>' },

  // Actions / états
  check:     { s:"M20 6 9 17l-5-5" },
  plus:      { s:"M12 5v14M5 12h14" },
  close:     { s:"M6 6l12 12M18 6 6 18" },
  lock:      { raw:'<rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>' },
  play:      { s:"M8 5.5v13l11-6.5-11-6.5Z", fillOnly:true },
  refresh:   { s:"M4.5 12a7.5 7.5 0 1 1 2.2 5.3M4.5 20v-4.2h4.2" },
  edit:      { raw:'<path d="M4 20h4L18.4 9.6a2 2 0 0 0-2.8-2.8L5 17.4V20Z"/><path d="M13.5 6.5l4 4"/>' },
  trash:     { s:"M4 7h16M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7M6.5 7l.9 12.1A2 2 0 0 0 9.4 21h5.2a2 2 0 0 0 2-1.9L17.5 7" },
  settings:  { raw:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 7l2.6 1.5M17.2 15.5l2.6 1.5M4.2 17l2.6-1.5M17.2 8.5l2.6-1.5"/>' },

  // Chevrons & flèches (remplacent ‹ › → ← ▲ ▼)
  chevronLeft:  { s:"M15 5l-7 7 7 7" },
  chevronRight: { s:"M9 5l7 7-7 7" },
  chevronDown:  { s:"M5 9l7 7 7-7" },
  arrowLeft:    { s:"M19 12H5M11 6l-6 6 6 6" },
  arrowRight:   { s:"M5 12h14M13 6l6 6-6 6" },
  arrowUp:      { s:"M12 19V5M6 11l6-6 6 6" },
  arrowDown:    { s:"M12 5v14M6 13l6 6 6-6" },
  triUp:        { s:"M12 7l6 9H6l6-9Z", fillOnly:true },
  triDown:      { s:"M12 17 6 8h12l-6 9Z", fillOnly:true },

  // Fitness / suivi
  flame:     { s:"M12 2c1 3-1 4.5-2 6-1.2 1.8-1.5 3.6-.5 5.5-2-.5-3.2-2-3.4-3.9C4.6 11.4 4 13.2 4 15a8 8 0 0 0 16 0c0-5.5-4.5-7.5-8-13Z", fillOnly:true },
  trophy:    { raw:'<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6.5H4.6a2.4 2.4 0 0 0 3.1 2.3"/><path d="M17 6.5h2.4a2.4 2.4 0 0 1-3.1 2.3"/><path d="M12 13v3.5"/><path d="M9 20h6l-.6-3.5h-4.8L9 20Z"/>' },
  medal:     { raw:'<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-2.8L17 21l-1.5-8"/>' },
  target:    { raw:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>' },
  bolt:      { s:"M13 2 4 14h6l-1 8 9-12h-6l1-6Z", fillOnly:true },
  chart:     { s:"M5 20V10M12 20V4M19 20v-7" },
  clock:     { raw:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4.2l2.6 1.6"/>' },
  calendar:  { raw:'<rect x="4" y="5.5" width="16" height="15" rx="2.2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>' },
  star:      { s:"M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z", fillOnly:true },

  // Nutrition / outils
  droplet:   { s:"M12 3.5c3 3.9 5.5 6.5 5.5 9.6a5.5 5.5 0 0 1-11 0c0-3.1 2.5-5.7 5.5-9.6Z" },
  camera:    { raw:'<path d="M4 8.5a2 2 0 0 1 2-2h1.6l1-1.6h4.8l1 1.6H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z"/><circle cx="12" cy="12.5" r="3.2"/>' },
  scan:      { raw:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 8v8M11 8v8M14 8v8M16.5 8v8"/>' },
  bell:      { raw:'<path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 1.8 5.5 1.8 5.5H4.2S6 14 6 9.5Z"/><path d="M10 19a2 2 0 0 0 4 0"/>' },
  search:    { raw:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>' },
};

export function I({ name, size = 24, color, fill = false, stroke = 1.8, style, ...rest }) {
  const d = P[name];
  if (!d) return null;
  const useFill = fill || d.fillOnly;
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: useFill ? "currentColor" : "none",
    stroke: useFill ? "none" : "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    style: { color: color || "currentColor", flexShrink: 0, display: "block", ...style },
    "aria-hidden": true, ...rest,
  };
  if (d.raw) return <svg {...common} dangerouslySetInnerHTML={{ __html: d.raw }} />;
  return <svg {...common}><path d={d.s} /></svg>;
}

export default I;

// ═══════════════════════════════════════════════════════════════════════════
// DUO — jeu « Noir & Bleu plein » (3 couches)
//   fl : intérieur #3C5BFF plein · s : structure noire 1.5
//   sx : détails extérieurs noirs 1.15 · sw : détails intérieurs blancs 1.15
//   dw/dwf : points/formes blancs pleins
// Usage : <ID name="bowl" size={22}/> · <ID name="coffee" dark/> (surfaces ink)
// ═══════════════════════════════════════════════════════════════════════════

const DUO = {
  /* ── REPAS ── */
  coffee:{ fl:'<path d="M5.8 9.3h9.4v4.9a4.1 4.1 0 0 1-4.1 4.1h-1.2a4.1 4.1 0 0 1-4.1-4.1V9.3Z"/>',
    s:'<path d="M5.8 9.3h9.4v4.9a4.1 4.1 0 0 1-4.1 4.1h-1.2a4.1 4.1 0 0 1-4.1-4.1V9.3Z"/><path d="M15.2 10.6h1.2a2.35 2.35 0 0 1 0 4.7h-1.4"/><path d="M4.9 20.6h11.6"/>',
    sx:'<path d="M8.1 3.2c-.65.75-.65 1.55 0 2.3M11.1 3.9c-.5.6-.5 1.25 0 1.85"/>',
    sw:'<path d="M7.2 11.5c1.6.75 5 .75 6.6 0"/>' },
  bowl:{ fl:'<path d="M4.5 12.5h15a7.5 7.5 0 0 1-15 0Z"/>',
    s:'<path d="M4.5 12.5h15a7.5 7.5 0 0 1-15 0Z"/><path d="M9.6 20.6h4.8"/>',
    sx:'<path d="M6.9 12.5c.5-1.9 2.6-3.2 5.1-3.2s4.6 1.3 5.1 3.2"/><path d="M20.4 3.6l-7.6 7M21.2 6.2l-6.4 5.3"/>' },
  cloche:{ fl:'<path d="M4.5 15a7.5 7.5 0 0 1 15 0Z"/>',
    s:'<path d="M4.5 15a7.5 7.5 0 0 1 15 0"/><path d="M3.4 15.2h17.2"/><path d="M12 6.4v1.1"/>',
    sx:'<path d="M5.7 17.9h12.6"/><circle cx="12" cy="5.3" r="1.05"/>',
    sw:'<path d="M7.1 13.1a5.6 5.6 0 0 1 3-4.5"/>' },
  apple:{ fl:'<path d="M12 7.4c-1.1-1.4-2.8-1.9-4.4-1.3-2.3.9-3.4 3.3-2.8 5.9.6 2.9 2.6 6 4.8 7 .8.4 1.5.3 2.4-.1.9.4 1.6.5 2.4.1 2.2-1 4.2-4.1 4.8-7 .6-2.6-.5-5-2.8-5.9-1.6-.6-3.3-.1-4.4 1.3Z"/><path d="M13.1 5.6c.4-1.7 1.6-2.7 3.4-2.9-.1 1.8-1.3 2.9-3.4 2.9Z"/>',
    s:'<path d="M12 7.4c-1.1-1.4-2.8-1.9-4.4-1.3-2.3.9-3.4 3.3-2.8 5.9.6 2.9 2.6 6 4.8 7 .8.4 1.5.3 2.4-.1.9.4 1.6.5 2.4.1 2.2-1 4.2-4.1 4.8-7 .6-2.6-.5-5-2.8-5.9-1.6-.6-3.3-.1-4.4 1.3Z"/>',
    sx:'<path d="M13.1 5.6c.4-1.7 1.6-2.7 3.4-2.9-.1 1.8-1.3 2.9-3.4 2.9Z"/><path d="M12 7.1c-.1-1 .2-1.9.8-2.6"/>',
    sw:'<path d="M6.9 10.3c.2-1.5 1.1-2.6 2.4-3.1"/>' },
  mealprep:{ fl:'<rect x="4.5" y="8.6" width="15" height="10.9" rx="2.2"/>',
    s:'<rect x="4.5" y="8.6" width="15" height="10.9" rx="2.2"/><path d="M9.6 8.6V6.7a1.3 1.3 0 0 1 1.3-1.3h2.2a1.3 1.3 0 0 1 1.3 1.3v1.9"/>',
    sx:'<path d="M3.4 10.5h1.1M19.5 10.5h1.1"/>',
    sw:'<path d="M4.9 12.4h14.2"/><path d="M12 12.9v6.1"/>' },
  /* ── NUTRITION ── */
  protein:{ fl:'<circle cx="15" cy="8.8" r="5"/>',
    s:'<circle cx="15" cy="8.8" r="5"/><path d="M11.5 12.3 6.2 17.6"/>',
    sx:'<circle cx="5.1" cy="17.2" r="1.35"/><circle cx="6.9" cy="19" r="1.35"/>',
    sw:'<path d="M12.4 6.3a4 4 0 0 1 4.4-.9"/>' },
  carbs:{ fl:'<path d="M12 17.3c-2-.2-3.4-1-4-2.8 2-.2 3.4.6 4 2.8Zm0 0c2-.2 3.4-1 4-2.8-2-.2-3.4.6-4 2.8Zm0-3.7c-2-.2-3.4-1-4-2.8 2-.2 3.4.6 4 2.8Zm0 0c2-.2 3.4-1 4-2.8-2-.2-3.4.6-4 2.8Zm0-3.7c-2-.2-3.4-1-4-2.8 2-.2 3.4.6 4 2.8Zm0 0c2-.2 3.4-1 4-2.8-2-.2-3.4.6-4 2.8Z"/><path d="M12 6.5c-.8-.9-1.1-2-1-3.3 1.3.3 2.1 1.3 2.1 2.6 0 .3-.3.5-1.1.7Z"/>',
    s:'<path d="M12 21V6.9"/>' },
  fat:{ fl:'<path d="M12 4c3.2 0 5.5 3.5 5.5 8 0 4-2.4 7.5-5.5 7.5S6.5 16 6.5 12c0-4.5 2.3-8 5.5-8Z"/>',
    s:'<path d="M12 4c3.2 0 5.5 3.5 5.5 8 0 4-2.4 7.5-5.5 7.5S6.5 16 6.5 12c0-4.5 2.3-8 5.5-8Z"/>',
    sw:'<circle cx="12" cy="13.9" r="2.7"/><path d="M8.3 12c0-2.8 1.4-5.4 3.6-6.7"/>' },
  fiber:{ fl:'<path d="M5 19c0-8 5-13.5 14-14 .4 8.6-4.6 14-11.5 14H5Z"/>',
    s:'<path d="M5 19c0-8 5-13.5 14-14 .4 8.6-4.6 14-11.5 14H5Z"/>',
    sw:'<path d="M5 19c2.4-5.4 6.3-9.3 10.8-11.3"/><path d="M8.2 14.5c1.9.3 3.5.1 4.9-.7M11 11.2c1.5.2 2.8 0 4-.6"/>' },
  water:{ fl:'<path d="M7 9.4l.8 9.4a2.1 2.1 0 0 0 2.1 1.9h4.4a2.1 2.1 0 0 0 2.1-1.9l.8-9.4c-1.7.8-8.5.8-10.2 0Z"/>',
    s:'<path d="M6.4 3.8h11.2l-1.3 15a2.1 2.1 0 0 1-2.1 1.9h-4.4a2.1 2.1 0 0 1-2.1-1.9l-1.3-15Z"/>',
    sx:'<path d="M7 9.3c1.7.8 8.3.8 10 0"/>',
    dw:'<circle cx="10.2" cy="13.6" r=".62"/><circle cx="13.5" cy="16.2" r=".62"/>' },
  fruit:{ fl:'<circle cx="12" cy="13.2" r="6.8"/><path d="M12.2 6.4c.1-1.9 1.3-3 3.2-3.2-.1 1.9-1.3 3-3.2 3.2Z"/>',
    s:'<circle cx="12" cy="13.2" r="6.8"/>',
    sx:'<path d="M12.2 6.4c.1-1.9 1.3-3 3.2-3.2-.1 1.9-1.3 3-3.2 3.2Z"/>',
    sw:'<path d="M7.6 11.3a4.9 4.9 0 0 1 2.6-3.2"/>',
    dw:'<circle cx="15.1" cy="15.7" r=".52"/><circle cx="16.3" cy="13.8" r=".52"/>' },
  fish:{ fl:'<path d="M6.2 12c1.9-2.9 4.7-4.6 7.6-4.6 2.6 0 4.9 1.3 6.4 3.5.4.6.4 1.6 0 2.2-1.5 2.2-3.8 3.5-6.4 3.5-2.9 0-5.7-1.7-7.6-4.6Z"/><path d="M6.2 12 3.4 9.3v5.4L6.2 12Z"/>',
    s:'<path d="M6.2 12c1.9-2.9 4.7-4.6 7.6-4.6 2.6 0 4.9 1.3 6.4 3.5.4.6.4 1.6 0 2.2-1.5 2.2-3.8 3.5-6.4 3.5-2.9 0-5.7-1.7-7.6-4.6Z"/><path d="M6.2 12 3.4 9.3v5.4L6.2 12Z"/>',
    sw:'<path d="M9.4 9.5a4.7 4.7 0 0 1 0 5"/><path d="M12.6 10.2a2.7 2.7 0 0 1 0 3.6M15 10.6a2.2 2.2 0 0 1 0 2.8"/>',
    dw:'<circle cx="16.7" cy="11" r=".85"/>' },
  egg:{ fl:'<path d="M12 3.6c3.1 0 5.8 4.3 5.8 8.6a5.8 5.8 0 0 1-11.6 0c0-4.3 2.7-8.6 5.8-8.6Z"/>',
    s:'<path d="M12 3.6c3.1 0 5.8 4.3 5.8 8.6a5.8 5.8 0 0 1-11.6 0c0-4.3 2.7-8.6 5.8-8.6Z"/>',
    sw:'<path d="M8.7 9.3c.3-2 1.3-3.7 2.6-4.6"/>' },
  calories:{ fl:'<path d="M6.6 16a5.4 5.4 0 1 1 10.8 0Z"/>',
    s:'<path d="M4.5 16a7.5 7.5 0 1 1 15 0"/><path d="M12 16l3.7-5.3"/>',
    sx:'<path d="M5.6 12.2l1 .5M12 8.5v1.15M18.4 12.2l-1 .5"/><circle cx="12" cy="16" r="1.15"/>' },
  /* ── ACTIVITÉ ── */
  run:{ fl:'<circle cx="15" cy="5" r="2.05"/>',
    s:'<path d="M14 8.2c-1.2 1.1-2.1 2.2-3.1 3.4l3.4 2.1-1.5 5.1"/><path d="M13.9 9.2l3.5 1.3 2.4-1"/><path d="M12.4 10.1 9.4 9 7.4 11"/><path d="M10.9 11.6l-2.6 3.9-3.1 1.3"/><circle cx="15" cy="5" r="2.05"/>',
    sx:'<path d="M4.1 7.6h2.4M3.2 10.4h2"/>' },
  gym:{ fl:'<rect x="6" y="7" width="3.4" height="10" rx="1.2"/><rect x="14.6" y="7" width="3.4" height="10" rx="1.2"/><rect x="2.6" y="9.2" width="3.4" height="5.6" rx="1.1"/><rect x="18" y="9.2" width="3.4" height="5.6" rx="1.1"/>',
    s:'<rect x="2.6" y="9.2" width="3.4" height="5.6" rx="1.1"/><rect x="6" y="7" width="3.4" height="10" rx="1.2"/><rect x="14.6" y="7" width="3.4" height="10" rx="1.2"/><rect x="18" y="9.2" width="3.4" height="5.6" rx="1.1"/><path d="M9.4 12h5.2"/>',
    sx:'<path d="M11.4 11.1v1.8M12.6 11.1v1.8"/>' },
  cardio:{ fl:'<path d="M12 19.5c-4.5-3.2-8-6-8-9.6C4 7 6 5.2 8.4 5.2c1.5 0 2.8.7 3.6 2 .8-1.3 2.1-2 3.6-2C18 5.2 20 7 20 9.9c0 3.6-3.5 6.4-8 9.6Z"/>',
    s:'<path d="M12 19.5c-4.5-3.2-8-6-8-9.6C4 7 6 5.2 8.4 5.2c1.5 0 2.8.7 3.6 2 .8-1.3 2.1-2 3.6-2C18 5.2 20 7 20 9.9c0 3.6-3.5 6.4-8 9.6Z"/>',
    sw:'<path d="M7.2 11.6h2.2l1.3-2.4 1.7 4.2 1.4-2.6h2.8"/>' },
  steps:{ fl:'<ellipse cx="8" cy="8.6" rx="2.2" ry="3.1"/><ellipse cx="16" cy="12.6" rx="2.2" ry="3.1"/><ellipse cx="8" cy="14.7" rx="1.5" ry="1.9"/><ellipse cx="16" cy="18.7" rx="1.5" ry="1.9"/><circle cx="6.5" cy="4.6" r=".5"/><circle cx="8" cy="4.1" r=".55"/><circle cx="9.5" cy="4.6" r=".5"/><circle cx="14.5" cy="8.6" r=".5"/><circle cx="16" cy="8.1" r=".55"/><circle cx="17.5" cy="8.6" r=".5"/>',
    s:'<ellipse cx="8" cy="8.6" rx="2.2" ry="3.1"/><ellipse cx="16" cy="12.6" rx="2.2" ry="3.1"/>',
    sx:'<ellipse cx="8" cy="14.7" rx="1.5" ry="1.9"/><ellipse cx="16" cy="18.7" rx="1.5" ry="1.9"/>' },
  timer:{ fl:'<path d="M12 13.2V5.9a7.3 7.3 0 0 1 6.7 4.4L12 13.2Z"/>',
    s:'<circle cx="12" cy="13.2" r="7.3"/><path d="M12 9.6v3.6l2.6 1.6"/><path d="M10 3h4M12 3v2.3"/>',
    sx:'<path d="M12 19.4v-1.1M5.8 13.2h1.1"/>',
    sw:'<path d="M15.9 8l-.75.75"/>' },
  hiit:{ fl:'<path d="M13 9.5l-3.1 4.2h2.1l-.9 3.6 3.1-4.2h-2.1l.9-3.6Z"/>',
    s:'<circle cx="12" cy="13.2" r="7.3"/><path d="M10 3h4M12 3v2.3"/>',
    sx:'<path d="M13 9.5l-3.1 4.2h2.1l-.9 3.6 3.1-4.2h-2.1l.9-3.6Z"/>' },
  bike:{ fl:'<circle cx="6.4" cy="15.6" r="3.4"/><circle cx="17.6" cy="15.6" r="3.4"/>',
    s:'<circle cx="6.4" cy="15.6" r="3.4"/><circle cx="17.6" cy="15.6" r="3.4"/><path d="M6.4 15.6 9.4 9.2h5l3.2 6.4M9.4 9.2l2.4 6.4h5.8"/>',
    sx:'<path d="M8.2 9.2h2.4M13.6 7.4l1.6 1.8"/>',
    sw:'<path d="M6.4 13.7v3.8M4.5 15.6h3.8M17.6 13.7v3.8M15.7 15.6h3.8"/>' },
  rower:{ fl:'<circle cx="6.2" cy="13.4" r="3.2"/><rect x="13" y="12" width="3.2" height="2.5" rx=".7"/>',
    s:'<circle cx="6.2" cy="13.4" r="3.2"/><path d="M8.9 15.2 20 18.4M20 18.4h-2.4"/><path d="M9.3 12.2l5.2-.9 3.5-2.8"/>',
    sx:'<path d="M18 8.5l1.7-.4"/>',
    sw:'<path d="M6.2 11.7v3.4M4.5 13.4h3.4"/>' },
  swim:{ fl:'<path d="M3.4 16.2c1.4-1 2.9-1 4.3 0s2.9 1 4.3 0 2.9-1 4.3 0 2.9 1 4.3 0v4.2H3.4v-4.2Z"/>',
    s:'<path d="M5.2 12.8l4.6-3.4 3.4 2.5"/><circle cx="16.2" cy="9.4" r="1.7"/>',
    sw:'<path d="M4.6 18.1c1.2-.8 2.4-.8 3.6 0M10.8 18.1c1.2-.8 2.4-.8 3.6 0M17 18.1c1.2-.8 2.4-.8 3.6 0"/>' },
  jumprope:{ fl:'<rect x="3.4" y="12.6" width="2.8" height="7" rx="1.2"/><rect x="17.8" y="12.6" width="2.8" height="7" rx="1.2"/>',
    s:'<path d="M4.8 12.6V9.2a7.2 7.2 0 0 1 14.4 0v3.4"/>',
    sw:'<path d="M4.1 15h1.4M18.5 15h1.4"/>' },
  ball:{ fl:'<circle cx="12" cy="12" r="7.6"/>',
    s:'<circle cx="12" cy="12" r="7.6"/>',
    sw:'<path d="M12 4.4v15.2"/><path d="M4.6 10.2c4.6 2 10.2 2 14.8 0M4.9 14.6c4.4-1.8 9.8-1.8 14.2 0"/>' },
  racket:{ fl:'<ellipse cx="10.2" cy="8.6" rx="5.2" ry="6" transform="rotate(-38 10.2 8.6)"/>',
    s:'<ellipse cx="10.2" cy="8.6" rx="5.2" ry="6" transform="rotate(-38 10.2 8.6)"/><path d="M13.8 13.2l6 6"/>',
    sw:'<path d="M6.9 6.1l6.3 5.3M9.6 4.5l4.4 8.3M6.1 9.3l8.3 2.9"/>' },
  fight:{ fl:'<path d="M6.2 9.2a4.6 4.6 0 0 1 4.6-4.6h3a4.6 4.6 0 0 1 4.6 4.6v3.2a4.8 4.8 0 0 1-4.8 4.8h-2.6a4.8 4.8 0 0 1-4.8-4.8V9.2Z"/>',
    s:'<path d="M6.2 9.2a4.6 4.6 0 0 1 4.6-4.6h3a4.6 4.6 0 0 1 4.6 4.6v3.2a4.8 4.8 0 0 1-4.8 4.8h-2.6a4.8 4.8 0 0 1-4.8-4.8V9.2Z"/><path d="M6.2 10.4c-1.5.2-2.4 1-2.4 2.3s.9 2.1 2.4 2.3"/><path d="M9 17.2v2.4h6.4v-2.4"/>',
    sw:'<path d="M9.4 9h5.4"/>' },
  yoga:{ fl:'<path d="M12 10.4c2.3 0 4.4 1.5 5.1 3.8l1.6 4.4c-2.1 1-4.4 1.5-6.7 1.5s-4.6-.5-6.7-1.5l1.6-4.4c.7-2.3 2.8-3.8 5.1-3.8Z"/>',
    s:'<circle cx="12" cy="6" r="2.1"/><path d="M6.9 14.2 4 12.6M17.1 14.2 20 12.6"/>',
    sw:'<path d="M9.4 17.6c1.7.5 3.5.5 5.2 0"/>' },
  ski:{ fl:'<circle cx="14.6" cy="5.2" r="2.05"/>',
    s:'<path d="M13.6 8.4l-3.2 3.6 3.4 2 .6 3.4"/><path d="M15.6 10.2l2.6 2.2 2.2-.6M10.4 12 8.2 9.6"/><path d="M3.6 17.4l16.8 3"/><circle cx="14.6" cy="5.2" r="2.05"/>',
    sx:'<path d="M6.6 8.2l1.2 8.2"/>' },
  /* ── BIEN-ÊTRE ── */
  sleep:{ fl:'<path d="M20 13.7A8.1 8.1 0 0 1 10.3 4 8.1 8.1 0 1 0 20 13.7Z"/>',
    s:'<path d="M20 13.7A8.1 8.1 0 0 1 10.3 4 8.1 8.1 0 1 0 20 13.7Z"/>',
    sx:'<path d="M17.5 4.6v2.4M16.3 5.8h2.4"/><path d="M20.4 9.2v1.6M19.6 10h1.6"/>' },
  energy:{ fl:'<path d="M13 2.5 4 14.5h6l-1 8 9-12h-6l1-8Z"/>',
    s:'<path d="M13 2.5 4 14.5h6l-1 8 9-12h-6l1-8Z"/>',
    sw:'<path d="M10.7 14.5l3.1-4.2"/>' },
  breath:{ fl:'<path d="M10.6 8.6c0-1.4-1.1-2.5-2.5-2.5C6 6.1 4.2 8.9 4.2 13c0 3.5.8 5.2 2.6 5.2 2.1 0 3.8-2 3.8-4.5V8.6Z"/><path d="M13.4 8.6c0-1.4 1.1-2.5 2.5-2.5 2.1 0 3.9 2.8 3.9 6.9 0 3.5-.8 5.2-2.6 5.2-2.1 0-3.8-2-3.8-4.5V8.6Z"/>',
    s:'<path d="M10.6 8.6c0-1.4-1.1-2.5-2.5-2.5C6 6.1 4.2 8.9 4.2 13c0 3.5.8 5.2 2.6 5.2 2.1 0 3.8-2 3.8-4.5V8.6Z"/><path d="M13.4 8.6c0-1.4 1.1-2.5 2.5-2.5 2.1 0 3.9 2.8 3.9 6.9 0 3.5-.8 5.2-2.6 5.2-2.1 0-3.8-2-3.8-4.5V8.6Z"/><path d="M12 3.4v4.2"/>',
    sw:'<path d="M8.6 10.3c-.9 1.2-1.4 2.7-1.5 4.4M15.4 10.3c.9 1.2 1.4 2.7 1.5 4.4"/>' },
  recovery:{ fl:'<path d="M11 4.6l1.6 4.3 4.3 1.6-4.3 1.6L11 16.4l-1.6-4.3-4.3-1.6 4.3-1.6L11 4.6Z"/><path d="M17.9 14.9l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z"/><circle cx="6.2" cy="18" r=".65"/>',
    s:'<path d="M11 4.6l1.6 4.3 4.3 1.6-4.3 1.6L11 16.4l-1.6-4.3-4.3-1.6 4.3-1.6L11 4.6Z"/>',
    sx:'<path d="M17.9 14.9l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z"/>' },
  hydration:{ fl:'<path d="M12 3.5c3 3.9 5.5 6.5 5.5 9.6a5.5 5.5 0 0 1-11 0c0-3.1 2.5-5.7 5.5-9.6Z"/>',
    s:'<path d="M12 3.5c3 3.9 5.5 6.5 5.5 9.6a5.5 5.5 0 0 1-11 0c0-3.1 2.5-5.7 5.5-9.6Z"/>',
    sw:'<path d="M8.8 12.6c1.1.9 2.2 1.3 3.2 1.3s2.1-.4 3.2-1.3"/>' },
  /* ── COACH & SUIVI ── */
  coachDuo:{ fl:'<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H13l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z"/>',
    s:'<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H13l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z"/>',
    sw:'<path d="M15.7 6.9l.45 1.2 1.2.45-1.2.45-.45 1.2-.45-1.2-1.2-.45 1.2-.45.45-1.2Z"/>',
    dwf:'<path d="M10.4 6.9l.85 2.35 2.35.85-2.35.85-.85 2.35-.85-2.35-2.35-.85 2.35-.85.85-2.35Z"/>' },
  goal:{ fl:'<circle cx="10.8" cy="13.2" r="4"/>',
    s:'<circle cx="10.8" cy="13.2" r="7.2"/><circle cx="10.8" cy="13.2" r="4"/><path d="M20.6 3.4l-8.9 8.9"/>',
    sx:'<path d="M20.6 3.4h-2.6M20.6 3.4v2.6"/>',
    dw:'<circle cx="10.8" cy="13.2" r="1.1"/>' },
  progress:{ fl:'<path d="M5.5 20v-5.2l4.3-3.8 3.4 2.9 6.3-5.9V20Z"/>',
    s:'<path d="M4 4.5V20h16"/><path d="M5.5 14.8l4.3-3.8 3.4 2.9 6.3-5.9"/><path d="M16.6 7.6h2.9v2.9"/>',
    dw:'<circle cx="7.6" cy="17.4" r=".42"/><circle cx="11.2" cy="17.4" r=".42"/><circle cx="14.8" cy="17.4" r=".42"/><circle cx="7.6" cy="13.9" r=".42"/><circle cx="14.8" cy="10.4" r=".42"/>' },
  streak:{ fl:'<path d="M12 2.6c1 3-1 4.5-2 6-1.2 1.8-1.5 3.6-.5 5.5-2-.5-3.2-2-3.4-3.9C4.6 11.7 4 13.4 4 15.1a8 8 0 0 0 16 0c0-5.4-4.5-7.4-8-12.5Z"/>',
    s:'<path d="M12 2.6c1 3-1 4.5-2 6-1.2 1.8-1.5 3.6-.5 5.5-2-.5-3.2-2-3.4-3.9C4.6 11.7 4 13.4 4 15.1a8 8 0 0 0 16 0c0-5.4-4.5-7.4-8-12.5Z"/>',
    sw:'<path d="M12 12.4c1.7 2 2.6 3.4 2.6 4.9a2.6 2.6 0 0 1-5.2 0c0-.9.3-1.7 1-2.7.6-.7 1.1-1.4 1.6-2.2Z"/>' },
  trophyDuo:{ fl:'<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M9 20h6l-.6-3.5h-4.8L9 20Z"/>',
    s:'<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6.5H4.6a2.4 2.4 0 0 0 3.1 2.3M17 6.5h2.4a2.4 2.4 0 0 1-3.1 2.3"/><path d="M12 13v3.5M9 20h6l-.6-3.5h-4.8L9 20Z"/>',
    sw:'<path d="M9.6 5.9c-.2 1.1-.2 2.1 0 3.1"/>' },
  badgeDuo:{ fl:'<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-2.8L17 21l-1.5-8c-1.1.65-2.3 1-3.5 1s-2.4-.35-3.5-1Z"/>',
    s:'<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-2.8L17 21l-1.5-8"/>',
    sw:'<path d="M12 6.8l.7 1.9 1.9.3-1.4 1.3.3 2-1.5-1-1.5 1 .3-2-1.4-1.3 1.9-.3.7-1.9Z"/>' },
  plan:{ fl:'<rect x="9" y="3" width="6" height="3.6" rx="1.1"/><rect x="8.3" y="10.4" width="2.3" height="2.3" rx=".6"/>',
    s:'<rect x="5.5" y="4.6" width="13" height="15.8" rx="2.1"/><rect x="9" y="3" width="6" height="3.6" rx="1.1"/>',
    sx:'<rect x="8.3" y="14.6" width="2.3" height="2.3" rx=".6"/><path d="M12.6 11.6h3.1M12.6 15.8h3.1"/>',
    sw:'<path d="M8.9 11.6l.5.5 1-1.1"/>' },
  calendarDuo:{ fl:'<path d="M4 7.7A2.2 2.2 0 0 1 6.2 5.5h11.6A2.2 2.2 0 0 1 20 7.7V10H4V7.7Z"/><rect x="14.2" y="15.7" width="2.8" height="2.8" rx=".75"/><circle cx="8.5" cy="13.6" r=".58"/><circle cx="12" cy="13.6" r=".58"/><circle cx="15.6" cy="13.6" r=".58"/><circle cx="8.5" cy="17.1" r=".58"/><circle cx="12" cy="17.1" r=".58"/>',
    s:'<rect x="4" y="5.5" width="16" height="15" rx="2.2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>' },
  userDuo:{ fl:'<circle cx="12" cy="8" r="3.6"/>',
    s:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>',
    sw:'<path d="M10.3 6.9a2.1 2.1 0 0 1 2.4-.7"/>' },
};

export function ID({ name, size = 24, dark = false, style, ...rest }) {
  const d = DUO[name];
  if (!d) return null;
  const st = dark ? "#F6F7F9" : "#101318";
  const html =
    `<g fill="#3C5BFF" stroke="none">${d.fl || ""}</g>` +
    `<g fill="none" stroke="${st}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d.s || ""}</g>` +
    `<g fill="none" stroke="${st}" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">${d.sx || ""}</g>` +
    `<g fill="none" stroke="#FFFFFF" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">${d.sw || ""}</g>` +
    `<g fill="#FFFFFF" stroke="none">${d.dw || ""}${d.dwf || ""}</g>`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}
      style={{ flexShrink: 0, display: "block", ...style }}
      aria-hidden="true" {...rest}
      dangerouslySetInnerHTML={{ __html: html }} />
  );
}
