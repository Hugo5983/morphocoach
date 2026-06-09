// ─── useBiWeeklyBilan.js ─────────────────────────────────────────────────────
// Hook qui gère la génération automatique du bilan bi-hebdomadaire :
//   • Calcul auto chaque dimanche à 9h (sur les 14 jours précédents)
//   • Archive en localStorage
//   • Notification push si autorisée
//   • Retourne la liste des bilans archivés

import { useEffect, useState, useCallback } from "react";
import {
  computeBilan, computeCriteria, computeHealthScore,
  PERIOD_DAYS, MIN_DAYS_FULL_BILAN,
} from "./BilanUtils.jsx";

const STORAGE_KEY      = "morphocoach_bilans_archive";
const LAST_CHECK_KEY   = "morphocoach_bilan_last_check";
const NOTIF_PERM_KEY   = "morphocoach_bilan_notif_perm";

// ─── Helpers date ────────────────────────────────────────────────────────
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function isAfterSunday9am(now = new Date()) {
  return now.getDay() === 0 && now.getHours() >= 9;
}
function getMostRecentSunday9am(from = new Date()) {
  const d = new Date(from);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(9, 0, 0, 0);
  return d;
}

// ─── Charge / sauvegarde archive ─────────────────────────────────────────
function loadArchive() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveArchive(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
}

// ─── Demande permission notif ────────────────────────────────────────────
async function ensureNotifPermission() {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  // Stocke qu'on a déjà demandé pour ne pas re-spammer
  const askedBefore = localStorage.getItem(NOTIF_PERM_KEY);
  if (askedBefore === "asked") return Notification.permission;
  localStorage.setItem(NOTIF_PERM_KEY, "asked");
  try {
    const res = await Notification.requestPermission();
    return res;
  } catch { return "denied"; }
}

// ─── Hook principal ─────────────────────────────────────────────────────
export function useBiWeeklyBilan({ repasHistory, calObj, pObj, gObj, lObj }) {
  const [bilans, setBilans] = useState(loadArchive);

  // Vérifie si un nouveau bilan doit être généré
  const checkAndGenerate = useCallback(() => {
    const now = new Date();
    const recentSunday = getMostRecentSunday9am(now);

    // Pas encore atteint dimanche 9h cette semaine ? On sort.
    if (now < recentSunday) return;

    // Déjà généré pour ce dimanche ? On sort.
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    if (lastCheck && new Date(lastCheck) >= recentSunday) return;

    // Calcule la période : 14 jours se terminant samedi soir
    const endDate   = new Date(recentSunday);
    endDate.setDate(endDate.getDate() - 1);  // samedi
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (PERIOD_DAYS - 1));
    startDate.setHours(0, 0, 0, 0);

    // Filtre l'historique sur cette période
    const periodHistory = (repasHistory || []).filter(d => {
      if (!d.date) return false;
      const dd = new Date(d.date);
      return dd >= startDate && dd <= endDate;
    });

    // Génère le bilan
    const computed  = computeBilan(periodHistory, calObj, pObj, gObj, lObj);
    const criteria  = computeCriteria(computed.loggedDays);
    const health    = computeHealthScore(criteria);

    const newBilan = {
      id: `bilan_${startDate.getTime()}`,
      startDate: startDate.toISOString(),
      endDate:   endDate.toISOString(),
      generatedAt: now.toISOString(),
      score:       parseFloat(computed.score),
      healthScore: health.score,
      letter:      health.letter,
      avgKcal:     Math.round(computed.avgKcal),
      avgProt:     Math.round(computed.avgProt),
      avgGluc:     Math.round(computed.avgGluc),
      avgLip:      Math.round(computed.avgLip),
      avgEau:      computed.avgEau,
      nbLogged:    computed.nbLogged,
      isPartial:   computed.isPartial,
      // Snapshot des critères pour archive consultable
      criteria,
    };

    // Ajoute à l'archive (évite doublons)
    setBilans(prev => {
      const exists = prev.find(b => b.id === newBilan.id);
      if (exists) return prev;
      const next = [newBilan, ...prev].slice(0, 50);  // garde 50 max
      saveArchive(next);
      return next;
    });
    localStorage.setItem(LAST_CHECK_KEY, now.toISOString());

    // Notification push
    ensureNotifPermission().then(perm => {
      if (perm !== "granted") return;
      try {
        const title = newBilan.isPartial
          ? "Ton bilan nutrition est prêt 📊"
          : "Ton bilan nutrition est prêt 📊";
        const body  = newBilan.isPartial
          ? `Du ${formatShort(startDate)} au ${formatShort(endDate)} · ${newBilan.nbLogged} jours loggés`
          : `Du ${formatShort(startDate)} au ${formatShort(endDate)} · Score ${newBilan.letter} · ${newBilan.nbLogged}/${PERIOD_DAYS} jours`;
        new Notification(title, { body, icon: "/icon-192.png", tag: newBilan.id });
      } catch {}
    });
  }, [repasHistory, calObj, pObj, gObj, lObj]);

  // Au montage + toutes les heures pour vérifier
  useEffect(() => {
    checkAndGenerate();
    const id = setInterval(checkAndGenerate, 60 * 60 * 1000); // 1h
    return () => clearInterval(id);
  }, [checkAndGenerate]);

  // Suppression d'un bilan archivé
  const deleteBilan = useCallback((id) => {
    setBilans(prev => {
      const next = prev.filter(b => b.id !== id);
      saveArchive(next);
      return next;
    });
  }, []);

  return { bilans, deleteBilan, regenerateNow: checkAndGenerate };
}

function formatShort(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
}
