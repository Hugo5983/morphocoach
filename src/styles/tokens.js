// ═══════════════════════════════════════════════════════════
// DESIGN TOKENS — Dark premium theme "From night to dawn"
// Signature : Electric blue (data) → Solar amber (energy)
// ═══════════════════════════════════════════════════════════
import { C } from "../data/constants.js";

// Alias sémantiques vers C
export const color = {
  ...C,
  surface:     C.s1,
  bg:          C.bg,
  border:      C.s3,
  text:        C.text,
  textMuted:   C.mid,
  primary:     C.blue,
  primarySoft: C.goldD,
};

export const space = { xs: 4, sm: 8, md: 10, lg: 14, xl: 16, xxl: 22 };
export const radius = { input: 14, chip: 12, modal: 14, card: 20, pill: 999, round: "50%" };
export const shadow = {
  none: "none",
  card: "inset 0 1px 0 rgba(255,255,255,0.03), 0 1px 0 rgba(0,0,0,0.2)",
  sheet: "0 -8px 32px rgba(0,0,0,0.5)",
  accent: `0 8px 20px rgba(214,122,46,0.3)`,
};
export const font = {
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
  serif:   '"Instrument Serif", "Times New Roman", serif',
  body:    '"Inter", system-ui, sans-serif',
};
export const TYPE = {
  hero:    { fontFamily: font.serif, fontSize: 56, fontWeight: 400, letterSpacing: -2, lineHeight: .95, color: C.text },
  h1:      { fontFamily: font.serif, fontSize: 32, fontWeight: 400, letterSpacing: -1.2, color: C.text, lineHeight: 1.05 },
  h2:      { fontFamily: font.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4, color: C.text },
  h3:      { fontSize: 14, fontWeight: 600, letterSpacing: -0.1, color: C.text },
  body:    { fontSize: 13, fontWeight: 500, color: C.mid },
  bodyS:   { fontSize: 12, fontWeight: 500, color: C.dim },
  eyebrow: { fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: 1.8, textTransform: 'uppercase', fontFamily: font.display },
  eyebrowS:{ fontSize: 9,  fontWeight: 700, color: C.dim, letterSpacing: 2.0, textTransform: 'uppercase', fontFamily: font.display },
};
export const NUM = { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum","cv11"' };

export default { color, space, radius, shadow, font, TYPE, NUM };
