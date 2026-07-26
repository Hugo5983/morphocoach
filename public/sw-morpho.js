// ─── Service Worker MorphoCoach — Notifications de rappel ────────────────────
// Ce SW gère uniquement les notifications programmées (pas de cache, pas d'offline).

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Quand le timer d'un rappel se déclenche
self.addEventListener("message", (e) => {
  if (e.data?.type === "SCHEDULE_NOTIFICATION") {
    const { title, body, delayMs, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: tag || "morpho-reminder",
        vibrate: [100, 50, 100],
        data: { url: "/" },
      });
    }, Math.min(delayMs, 2147483647)); // setTimeout max safe
  }
});

// Clic sur la notification → ouvre l'app
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes(self.location.origin) && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(e.notification.data?.url || "/");
    })
  );
});
