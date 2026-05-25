// ─── WATER TRACKER ──────────────────────────────────────────────────────────
// Suivi d'hydratation : 8 verres cliquables.

import { C } from "../../../data/constants.js";
import { Row } from "../../../components/ui/index.jsx";

export function WaterTracker({ eau, setEau }) {
  return (
    <div style={{
      padding: "14px 16px",
      background: C.s1,
      borderRadius: 14,
      marginBottom: 12,
      border: "0.5px solid rgba(190,180,255,0.07)",
    }}>
      <Row style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Hydratation</div>
          <div style={{ fontSize: 10, color: "rgba(245,241,232,0.50)" }}>
            {eau * 250}ml / 2000ml
          </div>
        </div>
        <div style={{
          fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
          fontSize: 22,
          fontWeight: 300,
          color: eau >= 8 ? C.green : C.blue,
        }}>
          {eau}/8
        </div>
      </Row>
      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            onClick={() => setEau(i < eau ? i : i + 1)}
            style={{
              flex: 1,
              height: 26,
              borderRadius: 7,
              background: i < eau
                ? `rgba(59,130,246,${0.25 + i * 0.09})`
                : "rgba(190,180,255,0.07)",
              cursor: "pointer",
              transition: "background.2s",
            }}
          />
        ))}
      </div>
      <div style={{
        height: 4,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${(eau / 8) * 100}%`,
          background: C.blue,
          borderRadius: 2,
          transition: "width.5s",
        }} />
      </div>
    </div>
  );
}
