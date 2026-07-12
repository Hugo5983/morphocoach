// ─── API LIB : SÉCURITÉ PARTAGÉE ────────────────────────────────────────────
// Utilisée par /api/generate-program et /api/analyze-morpho.
// Le préfixe "_lib" empêche Vercel d'exposer ce fichier comme endpoint.

export const ALLOWED_ORIGINS = [
  "https://morphocoach-two.vercel.app",
  "https://morphocoach.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const rateLimitStore = new Map();
const RATE_LIMIT = { windowMs: 60_000, maxRequests: 6 }; // génération = coûteux → plus strict que le proxy chat

export function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.firstAt > RATE_LIMIT.windowMs) {
    rateLimitStore.set(ip, { count: 1, firstAt: now });
    return { ok: true };
  }
  if (entry.count >= RATE_LIMIT.maxRequests) {
    return { ok: false, retryAfter: Math.ceil((entry.firstAt + RATE_LIMIT.windowMs - now) / 1000) };
  }
  entry.count++;
  return { ok: true };
}

export function setCorsHeaders(res, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowed);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

/**
 * Garde d'entrée commune. Retourne { ok:false, status, error } si la requête
 * doit être rejetée, sinon { ok:true }.
 */
export function guard(req, res) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin);
  if (req.method === "OPTIONS") return { ok: false, status: 200, error: null };
  if (req.method !== "POST")   return { ok: false, status: 405, error: "Méthode non autorisée" };
  if (origin && !ALLOWED_ORIGINS.includes(origin))
    return { ok: false, status: 403, error: "Origin non autorisée" };
  const rl = checkRateLimit(getClientIp(req));
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return { ok: false, status: 429, error: `Trop de requêtes. Réessayez dans ${rl.retryAfter}s.` };
  }
  return { ok: true };
}

// ─── ENTITLEMENT COACH PRO (mode transition) ────────────────────────────────
// Comportement piloté par variables d'environnement Vercel :
//   SUPABASE_URL + SUPABASE_ANON_KEY  → permet de vérifier le JWT utilisateur
//   ENFORCE_COACH_PRO = "true"        → rejette les requêtes sans utilisateur valide
// Par défaut (variables absentes ou flag ≠ "true") : mode PERMISSIF avec log,
// pour ne pas casser les utilisateurs historiques (logique OR localStorage/Supabase
// côté client). Quand la migration Supabase est terminée : passer le flag à "true".
export async function checkAccess(req) {
  const enforce = process.env.ENFORCE_COACH_PRO === "true";
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

  if (!url || !anon) {
    return { ok: true, mode: "permissif", reason: "Supabase non configuré côté serveur" };
  }
  if (!token) {
    if (enforce) return { ok: false, status: 401, error: "Authentification requise pour Coach PRO" };
    console.warn("[access] Requête sans token (mode permissif)");
    return { ok: true, mode: "permissif", reason: "pas de token" };
  }
  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
      if (enforce) return { ok: false, status: 401, error: "Session invalide ou expirée" };
      console.warn("[access] Token invalide (mode permissif)");
      return { ok: true, mode: "permissif", reason: "token invalide" };
    }
    const user = await r.json();
    // TODO (fin de migration) : vérifier ici l'entitlement "coach_pro" de user.id
    // via la table entitlements (requête REST avec SUPABASE_SERVICE_ROLE_KEY).
    return { ok: true, mode: "verifie", userId: user?.id || null };
  } catch (e) {
    console.error("[access] Erreur vérification:", e.message);
    if (enforce) return { ok: false, status: 503, error: "Vérification d'accès indisponible" };
    return { ok: true, mode: "permissif", reason: "erreur réseau" };
  }
}
