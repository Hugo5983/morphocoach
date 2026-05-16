// ─── CARD ───────────────────────────────────────────────────────────────────
// Conteneur principal de l'app, plus flexible que Box.
// Variants : default, accent (gold border), success, danger.
//
// Usage:
//   <Card>...</Card>
//   <Card variant="accent" onClick={...}>...</Card>
//   <Card padding="lg">...</Card>

import { C } from "../../data/constants.js";

const VARIANTS = {
  default: { bg: "#ffffff", border: "0.5px solid #dce8f4" },
  accent:  { bg: "#ffffff", border: `1px solid ${C.gold}`,    boxShadow: `0 2px 8px ${C.goldD}` },
  success: { bg: "rgba(62,199,122,0.08)", border: "0.5px solid rgba(62,199,122,0.3)" },
  danger:  { bg: "rgba(224,72,72,0.08)",  border: "0.5px solid rgba(224,72,72,0.3)" },
  ghost:   { bg: "transparent", border: "0.5px solid #dce8f4" },
};

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
        borderRadius: 16,
        padding: PADDINGS[padding] ?? PADDINGS.md,
        marginBottom: 9,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
