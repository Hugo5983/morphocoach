import { C } from "../../data/constants.js";

const VARIANTS = {
  default: { background: C.s1, border: `1px solid ${C.bd}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 1px 0 rgba(0,0,0,0.2)" },
  accent:  { background: C.s1, border: `1px solid ${C.gold}`, boxShadow: `0 8px 20px ${C.goldD}` },
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
      marginBottom: 10, cursor: onClick ? "pointer" : "default",
      ...style,
    }}>
      {children}
    </div>
  );
}
