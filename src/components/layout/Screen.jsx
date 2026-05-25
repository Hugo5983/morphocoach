// ─── SCREEN ─────────────────────────────────────────────────────────────────
// Conteneur racine de l'application : hauteur plein écran, fond et typo de base.
// Remplace le <div> racine inline d'App.jsx.
//
// Usage:
//   <Screen>
//     <Header /> ... <BottomNav />
//   </Screen>

import { color, font } from "../../styles/tokens.js";

export function Screen({ children, style }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: color.bg,
        fontFamily: font.body,
        color: color.text,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
