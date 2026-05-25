// ─── TABS ───────────────────────────────────────────────────────────────────
// Onglets "pills" horizontaux. Remplace le bloc de boutons dupliqué à
// l'identique dans Creer.jsx (modal exercice) et Calendar.jsx (GuideExModal).
//
// Le rendu est PIXEL-IDENTIQUE au code existant : mêmes paddings, mêmes
// couleurs, même borderRadius, même police. Aucune régression visuelle.
//
// Usage :
//   const [tab, setTab] = useState("tips");
//   <Tabs
//     items={[{ id: "tips", l: "Tips" }, { id: "morpho", l: "Morpho" }]}
//     value={tab}
//     onChange={setTab}
//   />

import { color, radius, space, font } from "../../styles/tokens.js";

export function Tabs({ items = [], value, onChange, style }) {
  return (
    <div
      style={{
        padding: "0 16px",
        display: "flex",
        gap: 6,
        marginBottom: space.lg,
        ...style,
      }}
    >
      {items.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange?.(t.id)}
            style={{
              padding: "6px 13px",
              background: active ? color.primarySoft : "transparent",
              border: `0.5px solid ${active ? color.primary : color.border}`,
              borderRadius: radius.pill,
              color: active ? color.primary : color.textMuted,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 500,
              fontFamily: font.body,
            }}
          >
            {t.l}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
