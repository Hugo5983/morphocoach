// ─── API: /api/photo ─────────────────────────────────────────────────────────
// Résout la vraie photo d'un plat à partir d'une requête (ex: "Bowl thaï poulet
// grillé"). La clé Unsplash reste server-side. Réponse mise en cache 30 jours
// par le CDN Vercel : une recette donnée n'est résolue qu'une seule fois.
//
// Variable d'environnement à définir sur Vercel : UNSPLASH_ACCESS_KEY
// (clé gratuite : https://unsplash.com/developers → "New Application")
//
// Si la clé est absente, l'endpoint répond 200 avec { url:null } : l'app
// retombe alors proprement sur la photo du catalogue. Rien ne casse.

const ALLOWED_ORIGINS = [
  "https://morphocoach.vercel.app",
  "http://localhost:5173",
];

// cache mémoire (chaud tant que l'instance serverless vit)
const mem = new Map();

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const q = (req.query.q || "").toString().slice(0, 120).trim();
  if (!q) return res.status(400).json({ error: "Requête vide" });

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return res.status(200).json({ url: null, reason: "no_key" });

  if (mem.has(q)) {
    res.setHeader("Cache-Control", "public, s-maxage=2592000, stale-while-revalidate=86400");
    return res.status(200).json(mem.get(q));
  }

  try {
    const url =
      "https://api.unsplash.com/search/photos" +
      `?query=${encodeURIComponent(q)}` +
      "&per_page=1&orientation=landscape&content_filter=high";

    const r = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
    });
    if (!r.ok) return res.status(200).json({ url: null, reason: "unsplash_error" });

    const data = await r.json();
    const photo = data?.results?.[0];
    const payload = photo
      ? {
          url: `${photo.urls.raw}&w=800&q=80&fm=jpg&fit=crop`,
          author: photo.user?.name || null,
          link: photo.links?.html || null,
        }
      : { url: null, reason: "no_result" };

    mem.set(q, payload);
    res.setHeader("Cache-Control", "public, s-maxage=2592000, stale-while-revalidate=86400");
    return res.status(200).json(payload);
  } catch {
    return res.status(200).json({ url: null, reason: "fetch_failed" });
  }
}
