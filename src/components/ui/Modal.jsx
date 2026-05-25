// ─── MODAL ──────────────────────────────────────────────────────────────────
// Modal centré avec overlay sombre.
//
// Usage:
//   {open && (
//     <Modal onClose={() => setOpen(false)} title="Mon titre">
//       <p>Contenu</p>
//     </Modal>
//   )}

import { color, radius, font } from "../../styles/tokens.js";

export function Modal({ children, onClose, title, maxWidth = 400, zIndex = 200 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(8,9,14,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex, padding: 18,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scale-in"
        style={{
          background: color.surface,
          border: `0.5px solid ${color.border}`,
          borderRadius: radius.modal,
          padding: "22px 18px",
          width: "100%",
          maxWidth,
        }}
      >
        {title && (
          <div style={{
            fontFamily: font.display,
            fontSize: 18,
            fontWeight: 400,
            color: color.text,
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
