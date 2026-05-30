// @ts-check
// ─── WORKOUT SERVICE ────────────────────────────────────────────────────────
export function getTodaySession(prog) {
  if (!prog) return null;
  const today = new Date();
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const todayName = dayNames[today.getDay()];
  return (
    prog.jours.find(
      (j) => j.nom.toLowerCase().includes(todayName.toLowerCase()) ||
             j.focus?.toLowerCase().includes(todayName.toLowerCase())
    ) || null
  );
}

export function getWeekSessions(prog) {
  if (!prog) return [];
  const today = new Date();
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((dayShort) => {
    const seance = prog.jours.find(
      (j) => j.nom.toLowerCase().includes(dayShort.toLowerCase()) ||
             j.focus?.toLowerCase().includes(dayShort.toLowerCase())
    );
    return { day: dayShort, seance, isToday: dayNames[today.getDay()] === dayShort };
  });
}

/**
 * @param {import('../types').Programme | null} prog
 * @returns {number}
 */
export function computeStreak(prog) {
  if (!prog) return 0;
  const dates = prog.jours
    .filter((j) => j.complete && j.date != null)
    .map((j) => /** @type {string} */ (j.date))
    .sort((a, b) => new Date(b.split("/").reverse().join("-")).getTime() - new Date(a.split("/").reverse().join("-")).getTime());
  if (!dates.length) return 0;
  let streak = 0;
  const today = new Date();
  dates.forEach((d, i) => {
    const dt = new Date(d.split("/").reverse().join("-"));
    const diff = Math.floor((today.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === i) streak++;
  });
  return streak;
}

export function getCycleProgress(cycleStart) {
  if (!cycleStart) return { jR: null, cPct: 0, semC: 0 };
  const jR = Math.max(0, 42 - Math.floor((Date.now() - cycleStart) / 864e5));
  const cPct = Math.min(100, ((42 - jR) / 42) * 100);
  const semC = Math.min(5, Math.floor((42 - jR) / 7));
  return { jR, cPct, semC };
}

export function parseRestSeconds(repos) {
  if (!repos) return 90;
  const cleaned = String(repos).replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 90;
}
