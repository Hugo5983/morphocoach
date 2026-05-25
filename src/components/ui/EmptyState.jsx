import { C } from "../../data/constants.js";
import { Card } from "./Card.jsx";

export function EmptyState({ icon, title, subtitle, children }) {
  return (
    <Card padding="lg" style={{ textAlign: "center" }}>
      {icon && <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.8 }}>{icon}</div>}
      <div style={{
        fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
        fontSize: 16, fontWeight: 700, color: C.text,
        marginBottom: subtitle ? 6 : 14,
      }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.6, marginBottom: children ? 14 : 0 }}>{subtitle}</div>}
      {children}
    </Card>
  );
}
