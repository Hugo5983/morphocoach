// ─── STREAK BADGE ───────────────────────────────────────────────────────────
// Petit badge affichant le nombre de jours consécutifs d'entraînement.

export function StreakBadge({ streak }) {
  if (!streak || streak <= 0) return null;
  const sub =
    streak >= 7 ? "Semaine parfaite ! 🏆" :
    streak >= 3 ? "Continue comme ça ! 💪" :
    "En route !";
  return (
    <div className="pop-in" style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
      padding: "8px 12px",
      background: "rgba(249,115,22,0.08)",
      border: "0.5px solid rgba(249,115,22,0.2)",
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 18 }}>🔥</span>
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#FFAB5D" }}>
          {streak} jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""}
        </span>
        <span style={{ fontSize: 10, color: "rgba(245,241,232,0.50)", marginLeft: 6 }}>{sub}</span>
      </div>
    </div>
  );
}
