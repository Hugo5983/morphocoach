// ─── SERVICE WORKER MORPHOCOACH ──────────────────────────────────────────────
const CACHE = "morphocoach-v1";
const STATIC = [
  "/",
  "/index.html",
  "/manifest.json",
];

// ── Installation : mise en cache des ressources statiques ────────────────────
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

// ── Activation : nettoyage des anciens caches ─────────────────────────────────
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch : stratégie Network First avec fallback cache ───────────────────────
self.addEventListener("fetch", e => {
  // Ignorer les requêtes API et externes
  if (
    e.request.url.includes("/api/") ||
    e.request.url.includes("anthropic") ||
    e.request.url.includes("openfoodfacts") ||
    e.request.url.includes("fonts.googleapis") ||
    !e.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Navigation : Network First, fallback sur /index.html
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match("/index.html")
      )
    );
    return;
  }

  // Assets JS/CSS : Cache First pour performance max
  if (
    e.request.destination === "script" ||
    e.request.destination === "style" ||
    e.request.destination === "font"
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Reste : Network First
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
