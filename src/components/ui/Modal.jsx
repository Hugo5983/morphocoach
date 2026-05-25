import { C } from "../../data/constants.js";

export function Modal({ children, onClose, title, maxWidth = 400, zIndex = 200 }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(5,7,16,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex, padding: 18,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="scale-in" style={{
        background: C.s1, border: `1px solid ${C.bdHi}`,
        borderRadius: 14, padding: "22px 18px", width: "100%", maxWidth,
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
      }}>
        {title && (
          <div style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 18, fontWeight: 700, color: C.text,
            marginBottom: 14, letterSpacing: -0.3,
          }}>{title}</div>
        )}
        {children}
      </div>
    </div>
  );
}
