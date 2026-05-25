import { useEffect } from "react";
import { color, radius } from "../../styles/tokens.js";

export function Notif({ n, onClose }) {
  useEffect(() => {
    if (!n) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [n]);

  if (!n) return null;

  return (
    <div
      className="notif np"
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: color.surface,
        border: `0.5px solid ${color.border}`,
        borderRadius: radius.modal,
        padding: "11px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(59,130,246,0.13)",
        maxWidth: 320,
        width: "90vw",
      }}
    >
      <span style={{ fontSize: 20 }}>{n.icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: color.text }}>{n.title}</div>
        <div style={{ fontSize: 11, color: color.textMuted, marginTop: 1 }}>{n.body}</div>
      </div>
      <button
        onClick={onClose}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: color.textMuted,
          fontSize: 16,
          padding: "0 4px",
        }}
      >
        ×
      </button>
    </div>
  );
}
