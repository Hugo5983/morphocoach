// ─── SECTION ────────────────────────────────────────────────────────────────
// En-tête de section avec titre (Syne) et sous-titre optionnel.
//
// Usage:
//   <Section title="MON PROGRAMME" />
//   <Section title="Nutrition" subtitle="Vos macros du jour" />

import { color, font } from "../../styles/tokens.js";

export function Section({ title, subtitle, action, style }) {
  return (
    <div
      style={{
        padding: "20px 15px 10px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        ...style,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 24,
            letterSpacing: -0.3,
            fontWeight: 300,
            color: color.text,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: color.textMuted, marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}
