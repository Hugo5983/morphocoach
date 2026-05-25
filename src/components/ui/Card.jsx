// ─── CARD ───────────────────────────────────────────────────────────────────
// Conteneur principal de l'app, plus flexible que Box.
// Variants : default, accent, success, danger, ghost.
//
// Usage:
//   <Card>...</Card>
//   <Card variant="accent" onClick={...}>...</Card>
//   <Card padding="lg">...</Card>

import { color, radius, space, shadow } from "../../styles/tokens.js";

const VARIANTS = {
  default: { bg: color.surface, border: `0.5px solid ${color.border}` },
  accent:  { bg: color.surface, border: `1px solid ${color.primary}`, boxShadow: shadow.accent },
  success: { bg: "rgba(62,199,122,0.08)", border: "0.5px solid rgba(62,199,122,0.3)" },
  danger:  { bg: "rgba(224,72,72,0.08)",  border: "0.5px solid rgba(224,72,72,0.3)" },
  ghost:   { bg: "transparent", border: `0.5px solid ${color.border}` },
};

// Paddings asymétriques propres au design d'origine — gardés littéraux.
const PADDINGS = {
  sm: "10px 12px",
  md: "16px 15px",
  lg: "22px 18px",
  none: "0",
};

export function Card({
  children, variant = "default", padding = "md",
  onClick, style, className,
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        ...v,
        borderRadius: radius.card,
        padding: PADDINGS[padding] ?? PADDINGS.md,
        marginBottom: space.md,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
