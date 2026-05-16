// ─── TODAY SESSION BADGE ────────────────────────────────────────────────────
// Affiche la séance prévue aujourd'hui depuis le calendrier.

import { INT } from "../../../data/constants.js";

export function TodaySessionBadge({ session }) {
  if (!session) return null;
  return (
    <div style={{
      padding: "12px 14px",
      background: `${session.color}15`,
      border: `0.5px solid ${session.color}35`,
      borderRadius: 11,
      marginBottom: 9,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: session.color, flexShrink: 0,
      }} />
      <div>
        <div style={{
          fontSize: 9, color: session.color, fontWeight: 700,
          letterSpacing: "1px", textTransform: "uppercase",
        }}>
          Séance du jour
        </div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{session.nom}</div>
      </div>
      <div style={{
        marginLeft: "auto",
        fontSize: 10,
        color: session.color,
        fontWeight: 600,
      }}>
        {INT[session.intensite]?.l}
      </div>
    </div>
  );
}
