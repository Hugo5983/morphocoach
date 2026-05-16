// ─── MODAL ──────────────────────────────────────────────────────────────────
// Modal centré avec overlay sombre.
//
// Usage:
//   {open && (
//     <Modal onClose={() => setOpen(false)} title="Mon titre">
//       <p>Contenu</p>
//     </Modal>
//   )}

import { C } from "../../data/constants.js";

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
          background: C.s1,
          border: "0.5px solid #dce8f4",
          borderRadius: 14,
          padding: "22px 18px",
          width: "100%",
          maxWidth,
        }}
      >
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
