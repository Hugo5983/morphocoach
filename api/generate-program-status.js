// ─── API : /api/generate-program-status ─────────────────────────────────────
// Polling de l'état d'un job de génération. POST { jobId, token }.
//
// Réponses :
//   202 { status: "processing" }                    → toujours en cours
//   200 { parsed, warnings, meta }                  → terminé (même forme que
//                                                     la route synchrone)
//   4xx/5xx { error }                               → échec de la génération
//
// Garde LÉGÈRE volontaire : CORS + origine + méthode, mais PAS le rate limit
// IP global (6 req/min) qui bannirait le polling à 3 s. L'authentification de
// cette route est le couple { jobId (UUID), token (24 octets aléatoires) } :
// introuvable sans avoir créé le job, et ne donnant accès qu'à CE job.

import { ALLOWED_ORIGINS, setCorsHeaders } from "./_lib/security.js";
import { getJob } from "./_lib/jobs.js";

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) return res.status(403).json({ error: "Origin non autorisée" });
  } else if (process.env.ALLOW_NO_ORIGIN !== "true") {
    return res.status(403).json({ error: "Origin manquante" });
  }

  const { jobId, token } = req.body || {};
  if (!jobId || !token) return res.status(400).json({ error: "jobId et token requis" });

  let job;
  try {
    job = await getJob(String(jobId));
  } catch (e) {
    return res.status(e.status || 502).json({ error: e.message });
  }
  if (!job || job.token !== String(token)) {
    return res.status(404).json({ error: "Job introuvable" });
  }

  if (job.status === "processing") {
    // Garde-fou : un job jamais terminé (crash plateforme) finit par expirer
    // côté client ; on borne aussi ici à 10 min pour donner une vraie erreur.
    const ageMs = Date.now() - new Date(job.created_at).getTime();
    if (ageMs > 16 * 60_000) {
      return res.status(504).json({ error: "La génération a expiré. Réessaie." });
    }
    return res.status(202).json({ status: "processing" });
  }

  if (job.status === "done" && job.result) {
    return res.status(200).json(job.result);
  }

  return res.status(job.error_status || 500).json({ error: job.error || "Erreur serveur" });
}
