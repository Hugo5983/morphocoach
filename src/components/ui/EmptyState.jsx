// ─── EMPTY STATE ────────────────────────────────────────────────────────────
// Composant pour les listes vides ou les états "pas encore de données".
//
// Usage:
//   <EmptyState icon="🏋️" title="Aucun programme" subtitle="Créez votre premier programme">
//     <Btn onClick={...}>Commencer</Btn>
//   </EmptyState>

import { Card } from "./Card.jsx";

export function EmptyState({ icon, title, subtitle, children }) {
  return (
    <Card padding="lg" style={{ textAlign: "center" }}>
      {icon && (
        <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.8 }}>
          {icon}
        </div>
      )}
      <div style={{
        fontFamily: "'Syne',sans-serif",
        fontSize: 16,
        fontWeight: 400,
        color: "#0f1a2e",
        marginBottom: subtitle ? 6 : 14,
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: 12,
          color: "#64748b",
          lineHeight: 1.6,
          marginBottom: children ? 14 : 0,
        }}>
          {subtitle}
        </div>
      )}
      {children}
    </Card>
  );
}
