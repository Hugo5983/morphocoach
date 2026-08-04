// ─── API : /api/generate-program-start ──────────────────────────────────────
// Démarrage ASYNCHRONE de la génération. Répond immédiatement { jobId, token }
// (HTTP 202) puis exécute runGeneration — la logique métier COMPLÈTE, sans
// aucune simplification — en arrière-plan via waitUntil (Fluid Compute).
//
// Pourquoi : Safari/WebKit coupe toute requête HTTP à ~60 s, quelle que soit
// la limite serveur. En découplant la requête (courte) de l'exécution (longue,
// jusqu'à ~280 s ici), la génération n'est plus jamais interrompue ni par le
// navigateur, ni par la plateforme.
//
// Gardes identiques à /api/generate-program : guard (origin + rate limit),
// checkAccess (JWT), checkAndCountUsage (quota). Le quota est compté au
// démarrage, comme sur la route synchrone.
//
// Si le stockage des jobs n'est pas configuré (table/env manquantes), la route
// répond 501 et le client bascule automatiquement sur la route synchrone
// historique : zéro régression.

import { waitUntil } from "@vercel/functions";
import { guard, checkAccess } from "./_lib/security.js";
import { checkAndCountUsage } from "./_lib/usage.js";
import { createJob, completeJob, failJob } from "./_lib/jobs.js";
import { runGeneration } from "./generate-program.js";

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

// Budget de génération en arrière-plan. Doit rester sous le maxDuration de
// CETTE fonction dans vercel.json (300 s) : réponse + travail waitUntil
// partagent la même invocation.
// Doit rester SOUS le maxDuration de cette fonction dans vercel.json.
//   Hobby + Fluid Compute : maxDuration 300 → budget 280 (défaut)
//   Pro   + Fluid Compute : maxDuration 800 → budget 700 (GEN_BUDGET_MS=700000)
// Réglable sans redéploiement de code via la variable d'environnement.
const ASYNC_BUDGET_MS = Math.max(60_000, Number(process.env.GEN_BUDGET_MS) || 280_000);

export default async function handler(req, res) {
  const g = guard(req, res);
  if (!g.ok) return g.error ? res.status(g.status).json({ error: g.error }) : res.status(g.status).end();

  const access = await checkAccess(req);
  if (!access.ok) return res.status(access.status).json({ error: access.error });

  const quota = await checkAndCountUsage(access, "generation");
  if (!quota.ok) return res.status(quota.status).json({ error: quota.error });

  const { form, dossier, ficheMorpho } = req.body || {};
  if (!form || typeof form !== "object") return res.status(400).json({ error: "Profil (form) manquant" });
  if (JSON.stringify(req.body).length > 200_000) return res.status(400).json({ error: "Requête trop volumineuse" });

  let job;
  try {
    job = await createJob({ userId: access.userId || null });
  } catch (e) {
    // Table ou env absentes → le client repassera par la route synchrone.
    console.warn("[generate-program-start] jobs indisponibles:", e.message);
    return res.status(e.status || 501).json({ error: "async_unavailable" });
  }

  // Réponse immédiate : la requête HTTP est terminée en < 1 s pour le client.
  res.status(202).json({ jobId: job.jobId, token: job.token });

  // Génération complète en arrière-plan, dans la même invocation.
  waitUntil(
    runGeneration({ form, dossier, ficheMorpho, access, budgetMs: ASYNC_BUDGET_MS })
      .then((out) => completeJob(job.jobId, out))
      .catch(async (e) => {
        console.error("[generate-program-start]", e.message);
        try { await failJob(job.jobId, e.message, e.status || 500); }
        catch (e2) { console.error("[generate-program-start] failJob:", e2.message); }
      })
  );
}
