// ─── API : /api/analyze-meal ────────────────────────────────────────────────
// Analyse d'une photo d'assiette → items + macros. Remplace l'ancien appel
// client vers le proxy générique /api/generate (supprimé) :
//   - le prompt vit désormais côté serveur (propriété intellectuelle) ;
//   - le modèle est choisi ici (Haiku 4.5 : identifier des aliments ne
//     nécessite pas Sonnet, coût ÷10) et ne peut plus dériver côté client ;
//   - quotas d'usage par utilisateur applicables côté serveur.
// La photo transite vers l'API puis est oubliée — rien n'est stocké.

import { guard, checkAccess } from "./_lib/security.js";
import { callAnthropic, parseJSON } from "./_lib/anthropic.js";
import { checkAndCountUsage } from "./_lib/usage.js";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const MODEL = "claude-haiku-4-5";

const ANALYSE_PROMPT = `Tu es un nutritionniste expert en estimation visuelle des portions.

MÉTHODE (dans cet ordre) :
1. Identifie CHAQUE aliment visible séparément.
2. Estime le poids de chacun en te servant des repères d'échelle visibles :
   assiette standard = 26 cm, fourchette = 20 cm, cuillère à soupe = 15 g,
   paume de main = ~100 g de viande, poing = ~150 g de féculents cuits.
3. Donne les macros de CHAQUE aliment pour son poids estimé (pas pour 100 g).

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni backticks :
{
"nom": "Nom du plat (2-4 mots)",
"description": "Ce que tu vois, en 1 phrase",
"items": [
    {"nom": "Riz basmati cuit", "grammes": 180, "calories": 234, "proteines": 5, "glucides": 50, "lipides": 1 },
    {"nom": "Blanc de poulet grillé", "grammes": 140, "calories": 231, "proteines": 43, "glucides": 0, "lipides": 5 }
  ],
"fiabilite": "haute|moyenne|basse",
"note": "Ce qui limite la précision (ex : sauce non identifiable, aliments cachés)"
}

Règles :
- N'invente RIEN : uniquement ce qui est visible. Matières grasses de cuisson :
  ajoute un item "Huile de cuisson (estimée)" ~10 g seulement si le plat brille.
- fiabilite "basse" si l'échelle est incertaine ou des aliments sont cachés/mélangés.
- Aucune nourriture visible → "items": [] et fiabilite "basse".
- Nombres entiers uniquement.`;

export default async function handler(req, res) {
  const g = guard(req, res);
  if (!g.ok) return g.error ? res.status(g.status).json({ error: g.error }) : res.status(g.status).end();

  const access = await checkAccess(req, { requiredProduct: "nutrition_pro" });
  if (!access.ok) return res.status(access.status).json({ error: access.error });

  const quota = await checkAndCountUsage(access, "photo");
  if (!quota.ok) return res.status(quota.status).json({ error: quota.error });

  const image = typeof req.body?.image === "string" ? req.body.image : "";
  const b64 = image.replace(/^data:image\/\w+;base64,/, "");
  if (b64.length < 100)       return res.status(400).json({ error: "Photo manquante" });
  if (b64.length > 6_000_000) return res.status(400).json({ error: "Photo trop lourde (compresser côté client)" });

  try {
    const raw = await callAnthropic({
      model: MODEL,
      maxTokens: 1000,
      system: "Tu réponds UNIQUEMENT en JSON valide, sans texte autour, sans markdown.",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
        { type: "text", text: ANALYSE_PROMPT },
      ],
    });
    const parsed = parseJSON(raw);

    // Totaux recalculés ICI depuis les items : le modèle est bien meilleur
    // pour identifier et peser chaque aliment que pour additionner — et
    // l'arithmétique, c'est notre travail, pas le sien.
    const items = Array.isArray(parsed.items)
      ? parsed.items.filter(i => i && Number(i.grammes) > 0)
      : [];
    const somme = (k) => items.reduce((t, i) => t + (Number(i[k]) || 0), 0);

    return res.status(200).json({
      result: {
        nom:         String(parsed.nom || "Plat analysé"),
        description: String(parsed.description || ""),
        items,
        calories:    somme("calories"),
        proteines:   somme("proteines"),
        glucides:    somme("glucides"),
        lipides:     somme("lipides"),
        fiabilite:   ["haute", "moyenne", "basse"].includes(parsed.fiabilite) ? parsed.fiabilite : "moyenne",
        note:        String(parsed.note || ""),
      },
    });
  } catch (e) {
    console.error("[analyze-meal]", e.message);
    return res.status(e.status || 500).json({ error: e.message || "Erreur serveur" });
  }
}
