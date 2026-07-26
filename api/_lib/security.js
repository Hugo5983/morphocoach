// ─── API LIB : SÉCURITÉ PARTAGÉE ────────────────────────────────────────────
// Utilisée par /api/generate-program, /api/analyze-morpho, /api/coach-chat
// et /api/analyze-meal. Le préfixe "_lib" empêche Vercel d'exposer ce fichier
// comme endpoint.
//
// Variables d'environnement (toutes optionnelles — comportement permissif
// par défaut pour ne casser aucun utilisateur existant) :
//   SUPABASE_URL + SUPABASE_ANON_KEY   → vérification du JWT utilisateur
//   SUPABASE_SERVICE_ROLE_KEY          → lecture de la table entitlements
//   ENFORCE_COACH_PRO = "true"         → rejette les requêtes sans entitlement
//   ALLOW_NO_ORIGIN  = "true"          → ré-autorise les requêtes sans Origin
//                                        (échappatoire si un client légitime
//                                        n'envoie pas l'en-tête)

export const ALLOWED_ORIGINS = [
  "https://morphocoach-two.vercel.app",
  "https://morphocoach.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ─── Rate limiting en mémoire ───────────────────────────────────────────────
// Première ligne de défense anti-rafale UNIQUEMENT. Chaque instance serverless
// a sa propre Map (reset au cold start) : la protection réelle des coûts est
// le quota mensuel par utilisateur (_lib/usage.js), pas ce limiteur.
const rateLimitStore = new Map();
const RATE_LIMIT = { windowMs: 60_000, maxRequests: 6 };

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
 *
 * Durcissement vs version précédente : les requêtes SANS en-tête Origin sont
 * désormais refusées (les navigateurs l'envoient toujours sur un fetch POST ;
 * son absence signale un script/curl). ALLOW_NO_ORIGIN="true" restaure
 * l'ancien comportement si besoin.
 */
export function guard(req, res) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin);
  if (req.method === "OPTIONS") return { ok: false, status: 200, error: null };
  if (req.method !== "POST")   return { ok: false, status: 405, error: "Méthode non autorisée" };

  if (!origin) {
    if (process.env.ALLOW_NO_ORIGIN !== "true") {
      return { ok: false, status: 403, error: "Origin manquante" };
    }
  } else if (!ALLOWED_ORIGINS.includes(origin)) {
    return { ok: false, status: 403, error: "Origin non autorisée" };
  }

  const rl = checkRateLimit(getClientIp(req));
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return { ok: false, status: 429, error: `Trop de requêtes. Réessayez dans ${rl.retryAfter}s.` };
  }
  return { ok: true };
}

// ─── ENTITLEMENT COACH PRO ──────────────────────────────────────────────────
// 1. Valide le JWT Supabase (auth/v1/user) → userId.
// 2. Si SERVICE_ROLE disponible : lit la table entitlements et cherche un
//    droit actif. Lecture DÉFENSIVE : tolère plusieurs schémas de colonnes
//    (product/feature/sku, active/is_active, expires_at) pour ne jamais
//    verrouiller des utilisateurs à cause d'un nom de colonne.
// 3. ENFORCE_COACH_PRO !== "true" → mode permissif journalisé (transition),
//    identique au comportement historique. Le flag ne se met à "true" que
//    lorsque la migration des comptes est terminée.
export async function checkAccess(req, { requiredProduct = "coach_pro" } = {}) {
  const enforce = process.env.ENFORCE_COACH_PRO === "true";
  const url  = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

  if (!url || !anon) {
    return { ok: true, mode: "permissif", userId: null, reason: "Supabase non configuré côté serveur" };
  }
  if (!token) {
    if (enforce) return { ok: false, status: 401, error: "Authentification requise pour Coach PRO" };
    console.warn("[access] Requête sans token (mode permissif)");
    return { ok: true, mode: "permissif", userId: null, reason: "pas de token" };
  }

  let userId = null;
  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
      if (enforce) return { ok: false, status: 401, error: "Session invalide ou expirée" };
      console.warn("[access] Token invalide (mode permissif)");
      return { ok: true, mode: "permissif", userId: null, reason: "token invalide" };
    }
    const user = await r.json();
    userId = user?.id || null;
  } catch (e) {
    console.error("[access] Erreur vérification JWT:", e.message);
    if (enforce) return { ok: false, status: 503, error: "Vérification d'accès indisponible" };
    return { ok: true, mode: "permissif", userId: null, reason: "erreur réseau" };
  }

  // ── Entitlement (uniquement si service role dispo) ──
  if (userId && service) {
    try {
      const q = await fetch(
        `${url}/rest/v1/entitlements?user_id=eq.${encodeURIComponent(userId)}&select=*`,
        { headers: { apikey: service, Authorization: `Bearer ${service}` } }
      );
      if (q.ok) {
        const rows = await q.json();
        const now = Date.now();
        const hasIt = (Array.isArray(rows) ? rows : []).some((row) => {
          const prod = String(row.product ?? row.feature ?? row.sku ?? "").toLowerCase();
          const prodOk = !prod || prod === requiredProduct || prod === "all";
          const activeOk = row.active !== false && row.is_active !== false;
          const expOk = !row.expires_at || new Date(row.expires_at).getTime() > now;
          return prodOk && activeOk && expOk;
        });
        if (!hasIt && enforce) {
          return { ok: false, status: 403, error: "Abonnement Coach PRO requis" };
        }
        return { ok: true, mode: hasIt ? "entitle" : "verifie", userId, entitled: hasIt };
      }
      console.warn("[access] Lecture entitlements échouée:", q.status);
    } catch (e) {
      console.error("[access] Erreur entitlements:", e.message);
      if (enforce) return { ok: false, status: 503, error: "Vérification d'accès indisponible" };
    }
  }

  return { ok: true, mode: "verifie", userId, entitled: null };
}
