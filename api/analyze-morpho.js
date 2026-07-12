// ─── API : /api/analyze-morpho ──────────────────────────────────────────────
// Appel VISION (rare) : 3 photos → observations en catégories fermées (validées
// serveur : toute valeur hors énumération devient "indetermine") → conséquences
// dérivées par la table de code MorphoCoach. Les photos ne sont NI stockées NI
// loggées : elles transitent vers l'API Anthropic puis sont oubliées.
// Le client stocke la fiche retournée et ne renverra plus de photos tant que
// le physique n'a pas changé.

import { guard, checkAccess } from "./_lib/security.js";
import { callAnthropic, parseJSON } from "./_lib/anthropic.js";
import { SCHEMA_OBSERVATIONS, REPERES_VISUELS, validerObservations, deriverConsequences }
  from "./_knowledge/morphologie.js";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const FICHE_VERSION = 1;

function schemaToPrompt() {
  const S = SCHEMA_OBSERVATIONS;
  const lev = Object.entries(S.leviers).map(([k, v]) => `"${k}": "${v.join(" | ")}"`).join(",\n    ");
  const ins = Object.entries(S.insertions).map(([k, v]) => `"${k}": "${v.join(" | ")}"`).join(",\n    ");
  const phy = Object.entries(S.physique).map(([k, v]) => `"${k}": "${v.join(" | ")}"`).join(",\n    ");
  const rep = S.repartition.groupes.map(g => `"${g}": "${S.repartition.valeurs.join(" | ")}"`).join(",\n    ");
  return `{
  "leviers": {
    ${lev}
  },
  "insertions": {
    ${ins}
  },
  "physique": {
    ${phy}
  },
  "posture": ["parmi: ${S.posture.items.join(", ")} — uniquement si clairement visible"],
  "repartition": {
    ${rep}
  },
  "confiance": "${S.confiance.join(" | ")}"
}`;
}

export default async function handler(req, res) {
  const g = guard(req, res);
  if (!g.ok) return g.error ? res.status(g.status).json({ error: g.error }) : res.status(g.status).end();

  const access = await checkAccess(req);
  if (!access.ok) return res.status(access.status).json({ error: access.error });

  const { photos, profil } = req.body || {};
  const imgs = (Array.isArray(photos) ? photos : []).filter(p => typeof p === "string" && p.length > 100).slice(0, 3);
  if (imgs.length === 0) return res.status(400).json({ error: "Au moins une photo requise" });
  for (const p of imgs) {
    if (p.length > 3_000_000) return res.status(400).json({ error: "Photo trop lourde (compresser côté client)" });
  }

  const content = imgs.map(p => ({
    type: "image",
    source: { type: "base64", media_type: "image/jpeg", data: p.replace(/^data:image\/\w+;base64,/, "") },
  }));

  content.push({
    type: "text",
    text: `Tu es l'œil d'un coach sportif expert en morpho-anatomie. Analyse ces photos de posture (face/dos/profil, dans le désordre) d'une personne (${profil?.sexe || "?"}, ${profil?.age || "?"} ans).

Tu classes chaque trait dans des CATÉGORIES FERMÉES, comme un coach au visuel. JAMAIS de mesure, JAMAIS de chiffre, JAMAIS de centimètre, JAMAIS de pourcentage.
${REPERES_VISUELS}

Réponds UNIQUEMENT avec ce JSON (aucun texte avant/après, aucun markdown). Chaque valeur DOIT être exactement l'une des valeurs listées :
${schemaToPrompt()}`,
  });

  try {
    const raw = await callAnthropic({
      model: "claude-sonnet-4-6",
      maxTokens: 1200,
      system: "Tu es un expert en lecture morphologique visuelle pour le coaching sportif. Tu réponds UNIQUEMENT en JSON valide avec les valeurs d'énumération exactes demandées. Au moindre doute tu réponds \"indetermine\" — tu n'inventes jamais.",
      content,
    });

    const observations = validerObservations(parseJSON(raw));
    const consequences = deriverConsequences(observations);

    return res.status(200).json({
      fiche: {
        version: FICHE_VERSION,
        date: new Date().toISOString().split("T")[0],
        observations,
        consequences,
        confiance: observations.confiance,
      },
    });
  } catch (e) {
    console.error("[analyze-morpho]", e.message);
    return res.status(e.status || 500).json({ error: e.message || "Erreur serveur" });
  }
}
