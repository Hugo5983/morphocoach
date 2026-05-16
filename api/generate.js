// ─── API: /api/generate ─────────────────────────────────────────────────────
// Endpoint serverless qui proxifie les requêtes vers l'API Anthropic.
// La clé API reste server-side (jamais exposée au client).

export const config = {
  api: {
    bodyParser: { sizeLimit: "10mb" },
  },
};

// ─── Configuration de sécurité ──────────────────────────────────────────────

/** Domaines autorisés à appeler cet endpoint. Tout autre Origin est refusé. */
const ALLOWED_ORIGINS = [
  "https://morphocoach-two.vercel.app",
  "https://morphocoach.vercel.app",
  "http://localhost:5173", // dev Vite
  "http://localhost:3000", // dev fallback
];

/** Modèles autorisés. Empêche le client de demander un modèle premium coûteux. */
const ALLOWED_MODELS = new Set([
  "claude-haiku-4-5",
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-sonnet-4-5",
]);

/** Limites sur la requête entrante */
const LIMITS = {
  maxTokens: 8000,
  maxMessages: 5,
  maxContentItems: 10,
  maxTextLength: 50000,
  apiTimeoutMs: 55000,
};

/** Rate limiting en mémoire (par IP). Reset au cold-start. */
const rateLimitStore = new Map();
const RATE_LIMIT = { windowMs: 60_000, maxRequests: 10 };

// ─── Helpers ────────────────────────────────────────────────────────────────

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.firstAt > RATE_LIMIT.windowMs) {
    rateLimitStore.set(ip, { count: 1, firstAt: now });
    return { ok: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  if (entry.count >= RATE_LIMIT.maxRequests) {
    return { ok: false, retryAfter: Math.ceil((entry.firstAt + RATE_LIMIT.windowMs - now) / 1000) };
  }
  entry.count++;
  return { ok: true, remaining: RATE_LIMIT.maxRequests - entry.count };
}

function validateRequest(body) {
  if (!body || typeof body !== "object") return "Corps de requête invalide";
  if (!body.model || typeof body.model !== "string") return "Modèle manquant";
  if (!ALLOWED_MODELS.has(body.model)) return `Modèle non autorisé : ${body.model}`;
  if (typeof body.max_tokens !== "number" || body.max_tokens < 1 || body.max_tokens > LIMITS.maxTokens) {
    return `max_tokens doit être entre 1 et ${LIMITS.maxTokens}`;
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return "messages doit être un tableau non vide";
  }
  if (body.messages.length > LIMITS.maxMessages) {
    return `Trop de messages (max ${LIMITS.maxMessages})`;
  }
  for (const msg of body.messages) {
    if (!msg.role || !["user", "assistant"].includes(msg.role)) return "Rôle de message invalide";
    if (!msg.content) return "Contenu de message manquant";
    if (Array.isArray(msg.content)) {
      if (msg.content.length > LIMITS.maxContentItems) return `Trop d'items par message (max ${LIMITS.maxContentItems})`;
      for (const item of msg.content) {
        if (item.type === "text" && typeof item.text === "string" && item.text.length > LIMITS.maxTextLength) {
          return `Texte trop long (max ${LIMITS.maxTextLength} caractères)`;
        }
      }
    } else if (typeof msg.content === "string" && msg.content.length > LIMITS.maxTextLength) {
      return `Texte trop long (max ${LIMITS.maxTextLength} caractères)`;
    }
  }
  return null;
}

function setCorsHeaders(res, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowed);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

// ─── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`[generate] Origin refusée: ${origin}`);
    return res.status(403).json({ error: "Origin non autorisée" });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({
      error: `Trop de requêtes. Réessayez dans ${rl.retryAfter}s.`,
    });
  }
  res.setHeader("X-RateLimit-Remaining", String(rl.remaining));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[generate] ANTHROPIC_API_KEY manquante");
    return res.status(500).json({ error: "Configuration serveur incomplète" });
  }

  const validationError = validateRequest(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LIMITS.apiTimeoutMs);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      console.warn(`[generate] Anthropic ${response.status}: ${data.error?.message || "unknown"}`);
      return res.status(response.status).json({
        error: data.error?.message || "Erreur API Anthropic",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error("[generate] Timeout après", LIMITS.apiTimeoutMs, "ms");
      return res.status(504).json({ error: "Délai dépassé" });
    }
    console.error("[generate] Erreur:", error.message);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
