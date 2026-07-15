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
