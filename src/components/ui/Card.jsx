import { C } from "../../data/constants.js";

const VARIANTS = {
  default: { background: C.s1, border: `1px solid ${C.bd}`, boxShadow: C.shadow },
  accent:  { background: C.s1, border: `1px solid ${C.accent}`, boxShadow: "0 4px 14px rgba(59,130,246,0.12)" },
  success: { background: "rgba(95,224,165,0.08)", border: "1px solid rgba(95,224,165,0.25)" },
  danger:  { background: "rgba(255,122,107,0.08)", border: "1px solid rgba(255,122,107,0.25)" },
  ghost:   { background: "transparent", border: `1px solid ${C.bd}` },
};
const PADDINGS = { sm: "10px 12px", md: "16px 15px", lg: "22px 18px", none: "0" };

export function Card({ children, variant = "default", padding = "md", onClick, style, className }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <div onClick={onClick} className={className} style={{
      ...v, borderRadius: 20,
      padding: PADDINGS[padding] ?? PADDINGS.md,
      marginBottom: 12, cursor: onClick ? "pointer" : "default",
      ...style,
    }}>
      {children}
    </div>
  );
}
