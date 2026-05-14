import { ACTIVITE_FACTOR, OBJ } from "../data/constants.js";

// ─── IMC ──────────────────────────────────────────────────────────────────────
export function calcIMC(poids, taille) {
  if (!poids || !taille) return null;
  return (poids / ((taille / 100) ** 2)).toFixed(1);
}

// ─── CATÉGORIE BODYFAT ────────────────────────────────────────────────────────
export function getBFCategory(bf, sexe) {
  if (sexe === "femme") {
    if (bf < 14) return { label: "Athlète ⚡", color: "#22c55e" };
    if (bf < 21) return { label: "Forme ✅",   color: "#22c55e" };
    if (bf < 25) return { label: "Acceptable", color: "#f97316" };
    if (bf < 32) return { label: "À améliorer",color: "#f97316" };
    return { label: "Obésité", color: "#ef4444" };
  }
  if (bf < 6)  return { label: "Athlète ⚡", color: "#22c55e" };
  if (bf < 14) return { label: "Forme ✅",   color: "#22c55e" };
  if (bf < 18) return { label: "Acceptable", color: "#f97316" };
  if (bf < 25) return { label: "À améliorer",color: "#f97316" };
  return { label: "Obésité", color: "#ef4444" };
}

// ─── TDEE + MACROS (Harris-Benedict révisé 1984) ──────────────────────────────
export function calcNutrition(profil, cycles = []) {
  const p   = parseFloat(profil.poids)  || 0;
  const t   = parseFloat(profil.taille) || 0;
  const age = parseFloat(profil.age)    || 0;
  if (!p || !t || !age) return { calories: 2000, proteines: 160, glucides: 250, lipides: 70 };

  const obj = OBJ[profil.objectif] || OBJ.sante;

  // MB Harris-Benedict révisé
  const mb = profil.sexe === "femme"
    ? 447.593 + 9.247 * p + 3.098 * t - 4.330 * age
    : 88.362  + 13.397 * p + 4.799 * t - 5.677 * age;

  // TDEE
  const factAct  = ACTIVITE_FACTOR[profil.activite] || 1.375;
  const tdee     = Math.round(mb * factAct);
  const adj      = obj.surplus || 0;

  // Ajustement progressif par cycle
  const cycleNum = cycles.length + 1;
  let cycleAdj = 0;
  if (profil.objectif === "hypertrophie") {
    cycleAdj = Math.min((cycleNum - 1) * 50, 200);
  } else if (profil.objectif === "poids") {
    cycleAdj = cycleNum % 4 < 2 ? 0 : 50;
  }

  const calories = Math.max(1200, tdee + adj + cycleAdj);

  // Macros
  const proteines = Math.round(p * (obj.p  || 2.0));
  const lipides   = Math.round(p * (obj.li || 1.0));
  const glucides  = Math.max(50, Math.round((calories - proteines * 4 - lipides * 9) / 4));

  return { calories, proteines, glucides, lipides };
}

// ─── TOTAUX REPAS ─────────────────────────────────────────────────────────────
export function calcTotauxRepas(repas) {
  return [...repas.matin, ...repas.midi, ...repas.soir, ...repas.snack]
    .reduce((a, i) => ({ cal: a.cal + i.c, p: a.p + i.p, g: a.g + i.g, l: a.l + i.l }),
      { cal: 0, p: 0, g: 0, l: 0 });
}

// ─── STREAK D'ENTRAÎNEMENT ────────────────────────────────────────────────────
export function calcStreak(prog) {
  if (!prog) return 0;
  const dates = prog.jours
    .filter(j => j.complete && j.date)
    .map(j => j.date)
    .sort((a, b) =>
      new Date(b.split("/").reverse().join("-")) -
      new Date(a.split("/").reverse().join("-"))
    );
  if (!dates.length) return 0;
  let streak = 0;
  const today = new Date();
  dates.forEach((d, i) => {
    const dt   = new Date(d.split("/").reverse().join("-"));
    const diff = Math.floor((today - dt) / (1000 * 60 * 60 * 24));
    if (diff === i) streak++;
  });
  return streak;
}

// ─── JOURS RESTANTS DU CYCLE ──────────────────────────────────────────────────
export function calcJoursRestants(cycleStart) {
  if (!cycleStart) return null;
  return Math.max(0, 42 - Math.floor((Date.now() - cycleStart) / 864e5));
}

// ─── PROGRESSION DU CYCLE (%) ─────────────────────────────────────────────────
export function calcCyclePct(cycleStart) {
  if (!cycleStart) return 0;
  const jr = calcJoursRestants(cycleStart);
  return Math.min(100, ((42 - (jr || 0)) / 42) * 100);
}

// ─── MOTIVATION DU JOUR ───────────────────────────────────────────────────────
export function getMotivationDuJour(motivations) {
  const today      = new Date();
  const dayOfYear  = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return motivations[dayOfYear % motivations.length];
}
