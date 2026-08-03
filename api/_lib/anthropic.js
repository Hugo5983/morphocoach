// ─── API LIB : APPEL ANTHROPIC + PARSE ──────────────────────────────────────

// Timeout par appel. Doit TOUJOURS rester sous le maxDuration déclaré pour la
// fonction dans vercel.json, sinon la plateforme coupe avant l'abort et renvoie
// un 504 opaque au lieu d'une erreur exploitable.
const API_TIMEOUT_MS = Number(process.env.ANTHROPIC_TIMEOUT_MS) || 50_000;

/**
 * Appelle l'API Anthropic depuis le serveur (la clé ne quitte jamais Vercel).
 * Accepte soit`content` (message user unique), soit`messages` (historique complet).
 * @param {{timeoutMs?: number}} opts timeoutMs surcharge le défaut pour cet appel
 * @returns {Promise<string>} texte brut concaténé de la réponse
 */
export async function callAnthropic({ model, maxTokens, system, content, messages, timeoutMs }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw Object.assign(new Error("Configuration serveur incomplète"), { status: 500 });

  const budget = Math.max(5_000, timeoutMs || API_TIMEOUT_MS);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), budget);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers: {
"Content-Type":"application/json",
"x-api-key": apiKey,
"anthropic-version":"2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: messages || [{ role:"user", content }],
      }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok) {
      throw Object.assign(
        new Error(data.error?.message ||"Erreur API Anthropic"),
        { status: res.status }
);
    }
    // Réponse coupée par le plafond de tokens : le texte serait un JSON
    // tronqué en plein milieu — irréparable. Mieux vaut une erreur nette
    // qu'un parse corrompu silencieux.
    if (data.stop_reason === "max_tokens") {
      throw Object.assign(
        new Error("Réponse tronquée par la limite de tokens"),
        { status: 502, truncated: true }
      );
    }
    return (data.content || []).map((i) => i.text ||"").join("").trim();
  } catch (e) {
    if (e.name ==="AbortError") throw Object.assign(new Error("Délai dépassé"), { status: 504 });
    throw e;
  } finally {
    clearTimeout(t);
  }
}

/** Parse tolérant d'une réponse censée être du JSON pur (répare les fences/troncatures). */
export function parseJSON(rawText) {
  if (!rawText) throw new Error("Réponse vide de l'API");
  let s = rawText.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a === -1 || b === -1 || b <= a) throw new Error("Pas de JSON dans la réponse");
  s = s.substring(a, b + 1);
  const oB = (s.match(/\{/g) || []).length, cB = (s.match(/\}/g) || []).length;
  if (oB > cB) s +="}".repeat(oB - cB);
  const oA = (s.match(/\[/g) || []).length, cA = (s.match(/\]/g) || []).length;
  if (oA > cA) s +="]".repeat(oA - cA) +"}";
  // Virgules terminales ("...2,]" / "...x,}") : mode d'échec fréquent des LLM.
  s = s.replace(/,\s*([}\]])/g, "$1");
  try {
    return JSON.parse(s);
  } catch (e) {
    // Le détail technique (position, ligne) part en log serveur ; l'utilisateur
    // reçoit un message actionnable plutôt qu'une erreur de parseur brute.
    console.warn("[parseJSON]", e.message);
    throw new Error("La réponse de l'IA était illisible. Réessaie la génération.");
  }
}

/** Normalise un nom d'exercice pour comparaison (accents, casse, pluriels simples). */
export function normalizeExo(nom) {
  return String(nom ||"")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9 ]/g," ")
    .replace(/\s+/g," ")
    .trim();
}
