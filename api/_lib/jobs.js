// ─── API LIB : JOBS DE GÉNÉRATION ───────────────────────────────────────────
// Persistance de l'état d'une génération asynchrone dans Supabase (table
// generation_jobs), via la SERVICE ROLE — le client n'y accède jamais en
// direct : il passe par /api/generate-program-status avec le couple
// { jobId, token }.
//
// Prérequis (déjà en place pour security.js / telemetry.js) :
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Table (SQL à exécuter une fois dans Supabase → SQL Editor) :
//   create table if not exists generation_jobs (
//     id uuid primary key default gen_random_uuid(),
//     token text not null,
//     user_id text,
//     status text not null default 'processing',   -- processing | done | error
//     result jsonb,
//     error text,
//     error_status int,
//     created_at timestamptz not null default now(),
//     updated_at timestamptz not null default now()
//   );
//   alter table generation_jobs enable row level security;
//   -- aucune policy : seule la service role (serveur) lit/écrit.

import { randomUUID, randomBytes } from "node:crypto";

const REQ_TIMEOUT_MS = 5_000;

function env() {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    throw Object.assign(
      new Error("Stockage des jobs non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"),
      { status: 501 }
    );
  }
  return { url, service };
}

async function sb(path, { method = "GET", body, headers = {} } = {}) {
  const { url, service } = env();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: service,
        Authorization: `Bearer ${service}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const txt = await res.text();
    const data = txt ? JSON.parse(txt) : null;
    if (!res.ok) {
      throw Object.assign(
        new Error(data?.message || `Supabase ${res.status}`),
        { status: 502 }
      );
    }
    return data;
  } finally {
    clearTimeout(t);
  }
}

/** Crée un job en statut processing. Renvoie { jobId, token }. */
export async function createJob({ userId = null } = {}) {
  const id = randomUUID();
  const token = randomBytes(24).toString("base64url");
  await sb("generation_jobs", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: { id, token, user_id: userId, status: "processing" },
  });
  return { jobId: id, token };
}

/** Lit un job par id. Renvoie la ligne ou null. */
export async function getJob(jobId) {
  const rows = await sb(
    `generation_jobs?id=eq.${encodeURIComponent(jobId)}&select=id,token,status,result,error,error_status,created_at`
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

/** Marque un job terminé avec son résultat complet. */
export function completeJob(jobId, result) {
  return sb(`generation_jobs?id=eq.${encodeURIComponent(jobId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: { status: "done", result, updated_at: new Date().toISOString() },
  });
}

/** Marque un job en erreur (message + code HTTP d'origine). */
export function failJob(jobId, error, errorStatus) {
  return sb(`generation_jobs?id=eq.${encodeURIComponent(jobId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: {
      status: "error",
      error: String(error || "Erreur serveur").slice(0, 500),
      error_status: Number(errorStatus) || 500,
      updated_at: new Date().toISOString(),
    },
  });
}
