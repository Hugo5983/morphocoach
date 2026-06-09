import { C } from "../../data/constants.js";

export function Sheet({ children, onClose, title, zIndex = 250 }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(5,7,16,0.6)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="slide-up" style={{
        background: C.s1, borderRadius: "20px 20px 0 0",
        padding: "10px 18px 24px", width: "100%", maxWidth: 500,
        maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        border: `1px solid ${C.bdHi}`, borderBottom: "none",
      }}>
        <div style={{ width: 36, height: 4, background: "rgba(190,180,255,0.14)", borderRadius: 2, margin: "0 auto 14px" }}/>
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
