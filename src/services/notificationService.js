// ─── NOTIFICATION SERVICE ───────────────────────────────────────────────────
// Rappels programmés via Service Worker (fonctionne app fermée sur Android/iOS PWA).
// Sur iOS : nécessite que l'app soit installée en "Add to Home Screen" + permission.

const SW_PATH = "/sw-morpho.js";

/** Enregistre le Service Worker et demande la permission de notification. */
export async function initNotifications() {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return false;
  try {
    await navigator.serviceWorker.register(SW_PATH);
    const perm = await Notification.requestPermission();
    return perm === "granted";
  } catch (e) {
    console.warn("[notifications] init failed:", e.message);
    return false;
  }
}

/** Planifie une notification dans `delayMs` millisecondes. */
export async function scheduleNotification({ title, body, delayMs, tag }) {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      title, body, delayMs, tag,
    });
    return true;
  } catch { return false; }
}

// ── Rappels prédéfinis ──────────────────────────────────────────────────────

const SIX_WEEKS_MS = 42 * 24 * 60 * 60 * 1000;
const NOTIF_KEY = "morpho_notif_bilan";

/**
 * Programme le rappel de réévaluation morpho (6 semaines après la dernière fiche).
 * Vérifie qu'il n'est pas déjà programmé pour éviter les doublons.
 */
export async function planifierRappelBilan(dateFiche) {
  if (!dateFiche) return;
  const key = NOTIF_KEY;
  try {
    const last = localStorage.getItem(key);
    if (last === dateFiche) return; // déjà programmé pour cette fiche

    const ficheDate = new Date(dateFiche);
    if (isNaN(ficheDate.getTime())) return;
    const targetDate = ficheDate.getTime() + SIX_WEEKS_MS;
    const delayMs = targetDate - Date.now();

    if (delayMs <= 0) {
      // La fiche a déjà plus de 6 semaines — notification immédiate
      await scheduleNotification({
        title: "MorphoCoach — Bilan morpho",
        body: "Ça fait plus de 6 semaines. Reprends tes photos pour un programme encore plus adapté.",
        delayMs: 5000, // dans 5 secondes
        tag: "morpho-bilan-6sem",
      });
    } else {
      await scheduleNotification({
        title: "MorphoCoach — Nouveau bilan",
        body: "6 semaines depuis ton analyse morpho. Reprends tes photos pour voir ta progression et adapter ton programme.",
        delayMs,
        tag: "morpho-bilan-6sem",
      });
    }

    localStorage.setItem(key, dateFiche);
  } catch (e) {
    console.warn("[notifications] planifierRappelBilan failed:", e.message);
  }
}
