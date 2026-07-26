// ─── API LIB : QUOTAS D'USAGE PAR UTILISATEUR ───────────────────────────────
// Protection réelle des coûts API : compteur mensuel atomique côté Supabase
// (fonction SQL increment_usage, voir supabase/schema.sql), indexé sur
// l'utilisateur — contrairement au localStorage client, il ne se remet pas à
// zéro avec un simple "Vider les données du site".
//
// Comportement PERMISSIF par conception :
//   - ENFORCE_QUOTAS !== "true"           → aucun blocage (compte quand même
//     si possible, pour disposer des chiffres avant d'activer le flag)
//   - Supabase/service role non configuré → aucun blocage
//   - utilisateur anonyme (pas de userId) → aucun blocage tant que
//     ENFORCE_COACH_PRO n'impose pas l'authentification
//   - erreur réseau/SQL                   → aucun blocage (fail-open : une
//     panne de compteur ne doit jamais couper le produit)

const PERIOD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** Limites mensuelles par fonctionnalité, selon que le compte a un droit PRO. */
const LIMITS = {
  generation: { free: 4,  pro: 40  },
  photo:      { free: 5,  pro: 180 },
  chat:       { free: 30, pro: 1000 },
};

/**
 * Incrémente le compteur (feature, mois) de l'utilisateur et vérifie la limite.
 * @param {{ userId: string|null, entitled: boolean|null }} access — résultat de checkAccess
 * @param {"generation"|"photo"|"chat"} feature
 * @returns {Promise<{ ok: true, remaining: number|null } | { ok: false, status: number, error: string }>}
 */
export async function checkAndCountUsage(access, feature) {
  const enforce = process.env.ENFORCE_QUOTAS === "true";
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const conf = LIMITS[feature];

  if (!url || !service || !conf || !access?.userId) {
    return { ok: true, remaining: null };
  }

  const limit = access.entitled ? conf.pro : conf.free;

  try {
    const r = await fetch(`${url}/rest/v1/rpc/increment_usage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
      body: JSON.stringify({ p_user_id: access.userId, p_feature: feature, p_period: PERIOD() }),
    });
    if (!r.ok) {
      console.warn(`[usage] increment_usage ${feature} → ${r.status}`);
      return { ok: true, remaining: null };
    }
    const count = Number(await r.json());
    if (!Number.isFinite(count)) return { ok: true, remaining: null };

    if (enforce && count > limit) {
      return {
        ok: false,
        status: 429,
        error: access.entitled
          ? `Quota mensuel atteint (${limit} ${feature}/mois).`
          : `Quota gratuit atteint (${limit} ${feature}/mois). Passe en PRO pour continuer.`,
      };
    }
    return { ok: true, remaining: Math.max(0, limit - count) };
  } catch (e) {
    console.error("[usage]", e.message);
    return { ok: true, remaining: null };
  }
}
