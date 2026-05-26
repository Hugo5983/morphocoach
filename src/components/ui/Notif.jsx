import { useEffect } from "react";
import { C } from "../../data/constants.js";

export function Notif({ n, onClose }) {
  useEffect(() => { if (!n) return; const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [n]);
  if (!n) return null;
  return (
    <div className="notif np" style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
      background: C.s1, border: `1px solid ${C.bdHi}`, borderRadius: 14,
      padding: "11px 16px", display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 12px 32px rgba(0,0,0,0.45)", maxWidth: 320, width: "90vw",
    }}>
      <span style={{ fontSize: 20 }}>{n.icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{n.title}</div>
        <div style={{ fontSize: 11, color: C.mid, marginTop: 1 }}>{n.body}</div>
      </div>
      <button onClick={onClose} style={{
        marginLeft: "auto", background: "none", border: "none",
        cursor: "pointer", color: C.mid, fontSize: 16, padding: "0 4px",
      }}>×</button>
    </div>
  );
}
