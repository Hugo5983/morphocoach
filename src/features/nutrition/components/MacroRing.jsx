// ─── MACRO RING ─────────────────────────────────────────────────────────────
// Anneaux SVG pour afficher la progression des macros (calories, P/G/L).
//
// <Ring pct={75} color="#4D8BFF" size={120} stroke={10}>
//   {content au centre}
// </Ring>
//
// <MiniRing pct={60} color="#e25555" label="Protéines" v={120} max={200} />

import { C } from "../../../data/constants.js";

export function Ring({ pct, color, size = 110, stroke = 9, children }) {
  const R = size / 2 - stroke;
  const CI = 2 * Math.PI * R;
  const offset = CI * (1 - Math.min(1, pct / 100));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none"
                stroke="rgba(59,130,246,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={CI} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset.8s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>{children}</div>
    </div>
  );
}

export function MiniRing({ pct, color, label, v, max }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <svg width={56} height={56} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={28} cy={28} r={22} fill="none"
                  stroke="rgba(200,150,62,0.06)" strokeWidth={5} />
          <circle cx={28} cy={28} r={22} fill="none"
                  stroke={color} strokeWidth={5}
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - Math.min(1, pct / 100))}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset.8s ease" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{v}g</div>
        <div style={{ fontSize: 9, color: "rgba(245,241,232,0.50)" }}>{label}</div>
        <div style={{ fontSize: 8, color: C.dim }}>/{max}g</div>
      </div>
    </div>
  );
}
