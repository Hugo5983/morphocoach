import { C } from "../../data/constants.js";
const DISPLAY = "'General Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

export function Tabs({ items = [], value, onChange, style }) {
  return (
    <div style={{ padding: "0 16px", display: "flex", gap: 6, marginBottom: 14, ...style }}>
      {items.map((t) => {
        const active = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange?.(t.id)} style={{
            padding: "6px 13px",
            background: active ? `${C.blue}14` : "transparent",
            border: `1px solid ${active ? `${C.blue}50` : C.bd}`,
            borderRadius: 999, color: active ? C.blue : C.mid,
            cursor: "pointer", fontSize: 11, fontWeight: 700,
            fontFamily: DISPLAY, letterSpacing: 0.2,
          }}>{t.l}</button>
        );
      })}
    </div>
  );
}
export default Tabs;
