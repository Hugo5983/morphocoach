import { C } from "../../data/constants.js";

export function Section({ title, subtitle, action, style }) {
  return (
    <div style={{ padding: "20px 15px 10px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", ...style }}>
      <div>
        <div style={{
          fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
          fontSize: 18, letterSpacing: -0.4, fontWeight: 700, color: C.text,
        }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
