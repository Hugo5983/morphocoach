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
/**
 * Analyse la réponse du modèle, avec réparation.
 *
 * L'ancienne version comptait les accolades avec une regex — y compris celles
 * situées À L'INTÉRIEUR des chaînes. Un `tips_coach` contenant une accolade,
 * un guillemet échappé ou un retour à la ligne faussait tout le comptage et la
 * réparation produisait du JSON encore plus cassé.
 *
 * Ici on parcourt le texte caractère par caractère en suivant l'état
 * (dans une chaîne ? échappement ?), ce qui permet de :
 *   - ignorer la ponctuation à l'intérieur des chaînes ;
 *   - repérer le dernier point de coupe SÛR si la réponse est tronquée ;
 *   - refermer proprement les structures réellement ouvertes.
 *
 * @param {string} rawText
 * @returns {object}
 */
export function parseJSON(rawText) {
  if (!rawText) throw new Error("Réponse vide de l'API");

  // 1. Retirer les clôtures markdown et les caractères de contrôle non
  //    échappés, qui rendent une chaîne JSON invalide.
  let s = String(rawText)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();

  const debut = s.indexOf("{");
  if (debut === -1) throw new Error("Pas de JSON dans la réponse");
  s = s.slice(debut);

  // Couper le texte qui SUIT l'objet ("… merci !"). On cherche la fermeture
  // équilibrée en ignorant les accolades situées dans les chaînes — un simple
  // lastIndexOf("}") se ferait piéger par un tips_coach contenant "}".
  const fin = finObjet(s);
  if (fin !== -1) s = s.slice(0, fin);

  // 2. Tentative directe : le cas le plus fréquent.
  const direct = essayer(s);
  if (direct) return direct;

  // 3. Réparation guidée par un vrai parcours du texte.
  const repare = reparer(s);
  if (repare) {
    const obj = essayer(repare);
    if (obj) {
      console.warn("[parseJSON] réponse réparée (JSON incomplet ou tronqué)");
      return obj;
    }
  }

  console.warn("[parseJSON] irrécupérable, longueur:", s.length,
    "| fin:", JSON.stringify(s.slice(-120)));
  throw new Error("La réponse de l'IA était illisible. Réessaie la génération.");
}

/**
 * Index de fin (exclu) du premier objet JSON complet, ou -1 s'il est tronqué.
 * Parcours avec suivi d'état : les accolades dans les chaînes sont ignorées.
 */
function finObjet(s) {
  let prof = 0, dansChaine = false, echappe = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (echappe) { echappe = false; continue; }
    if (c === "\\" && dansChaine) { echappe = true; continue; }
    if (c === '"') { dansChaine = !dansChaine; continue; }
    if (dansChaine) continue;
    if (c === "{" || c === "[") prof++;
    else if (c === "}" || c === "]") { prof--; if (prof === 0) return i + 1; }
  }
  return -1;   // structure jamais refermée : réponse tronquée
}

/** Tente un parse, avec nettoyage des virgules terminales. */
function essayer(txt) {
  for (const candidat of [txt, txt.replace(/,\s*([}\]])/g, "$1")]) {
    try { return JSON.parse(candidat); } catch { /* on continue */ }
  }
  return null;
}

/**
 * Répare un JSON incomplet : referme les structures ouvertes, en coupant au
 * dernier point sûr si la réponse s'arrête au milieu d'une valeur.
 */
function reparer(s) {
  const pile = [];           // '{' et '[' réellement ouverts
  let dansChaine = false;
  let echappe = false;
  let dernierSur = -1;       // index juste après la dernière valeur complète

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (echappe) { echappe = false; continue; }
    if (c === "\\" && dansChaine) { echappe = true; continue; }
    if (c === '"') { dansChaine = !dansChaine; if (!dansChaine) dernierSur = i + 1; continue; }
    if (dansChaine) continue;

    if (c === "{" || c === "[") pile.push(c);
    else if (c === "}" || c === "]") { pile.pop(); dernierSur = i + 1; }
    else if (c === "," ) dernierSur = i;        // couper AVANT la virgule
    else if (/[\d]/.test(c)) dernierSur = i + 1;
  }

  // Réponse tronquée en pleine chaîne : on revient au dernier point sûr.
  let base = dansChaine && dernierSur > 0 ? s.slice(0, dernierSur) : s;

  // Retirer une clé orpheline en fin ("...,\"nom\":" ou "...,\"nom\"")
  base = base.replace(/,\s*"[^"]*"\s*:?\s*$/, "").replace(/,\s*$/, "");

  // Recalculer la pile sur la base tronquée.
  const pile2 = [];
  let ds = false, esc = false;
  for (const c of base) {
    if (esc) { esc = false; continue; }
    if (c === "\\" && ds) { esc = true; continue; }
    if (c === '"') { ds = !ds; continue; }
    if (ds) continue;
    if (c === "{" || c === "[") pile2.push(c);
    else if (c === "}" || c === "]") pile2.pop();
  }
  if (ds) base += '"';                                    // chaîne restée ouverte
  while (pile2.length) base += pile2.pop() === "{" ? "}" : "]";
  return base;
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
