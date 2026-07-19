import { C, FONT } from"../../data/constants.js";
const DISPLAY = FONT;

export function Tabs({ items = [], value, onChange, style }) {
  return (
    <div style={{ padding:"0 16px", display:"flex", gap: 8, marginBottom: 16, ...style }}>
      {items.map((t) => {
        const active = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange?.(t.id)} style={{
            padding:"8px 12px",
            background: active ?`${C.blue}14` :"transparent",
            border:`1px solid ${active ?`${C.blue}50` : C.bd}`,
            borderRadius: 999, color: active ? C.blue : C.mid,
            cursor:"pointer", fontSize: 11, fontWeight: 700,
            fontFamily: DISPLAY, letterSpacing: 0.2,
          }}>{t.l}</button>
);
      })}
    </div>
);
}
export default Tabs;
