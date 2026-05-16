// ─── SHEET ──────────────────────────────────────────────────────────────────
// Bottom-sheet mobile : slide depuis le bas, idéal pour les actions
// contextuelles (sélection de date, choix multiples, etc.)
//
// Usage:
//   {open && (
//     <Sheet onClose={() => setOpen(false)} title="Mon titre">
//       ...
//     </Sheet>
//   )}

import { C } from "../../data/constants.js";

export function Sheet({ children, onClose, title, zIndex = 250 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(8,9,14,0.5)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up"
        style={{
          background: C.s1,
          borderRadius: "16px 16px 0 0",
          padding: "10px 18px 24px",
          width: "100%",
          maxWidth: 500,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Handle de drag */}
        <div style={{
          width: 36, height: 4,
          background: "#dce8f4",
          borderRadius: 2,
          margin: "0 auto 14px",
        }} />
        {title && (
          <div style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 400,
            color: "#0f1a2e",
            marginBottom: 14,
            letterSpacing: -0.3,
          }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
