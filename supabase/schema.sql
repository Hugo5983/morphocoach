-- ═══════════════════════════════════════════════════════════════════════════
-- MorphoCoach — Fondation données & IA (V3 post-audit)
-- À exécuter UNE FOIS dans Supabase → SQL Editor → New query → Run.
-- Idempotent : chaque objet est créé "if not exists" / "or replace".
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. ENTITLEMENTS (droits d'abonnement, écrits par le serveur seul) ──────
create table if not exists public.entitlements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product     text not null default 'coach_pro',       -- coach_pro | nutrition_pro | all
  active      boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists entitlements_user_idx on public.entitlements(user_id);

alter table public.entitlements enable row level security;
drop policy if exists "entitlements: lecture par le propriétaire" on public.entitlements;
create policy "entitlements: lecture par le propriétaire"
  on public.entitlements for select
  using (auth.uid() = user_id);
-- Aucune policy insert/update/delete → seul le service role écrit.

-- ─── 2. USAGE (compteurs mensuels atomiques, service role seul) ─────────────
create table if not exists public.usage_counters (
  user_id  uuid not null references auth.users(id) on delete cascade,
  feature  text not null,                              -- generation | photo | chat
  period   text not null,                              -- "2026-07"
  count    integer not null default 0,
  primary key (user_id, feature, period)
);
alter table public.usage_counters enable row level security;
drop policy if exists "usage: lecture par le propriétaire" on public.usage_counters;
create policy "usage: lecture par le propriétaire"
  on public.usage_counters for select
  using (auth.uid() = user_id);

-- Incrément atomique — appelée par l'API (service role) via /rest/v1/rpc.
create or replace function public.increment_usage(
  p_user_id uuid, p_feature text, p_period text
) returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.usage_counters (user_id, feature, period, count)
  values (p_user_id, p_feature, p_period, 1)
  on conflict (user_id, feature, period)
  do update set count = usage_counters.count + 1
  returning count;
$$;
revoke execute on function public.increment_usage from public, anon, authenticated;

-- ─── 3. GENERATION_EVENTS (dataset IA : entrée → sortie de chaque génération)
create table if not exists public.generation_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  status      text not null default 'ok',
  model       text,
  duration_ms integer,
  access_mode text,
  form        jsonb,        -- profil SANS prénom (minimisation)
  dossier     jsonb,        -- Couche 0 complète
  fiche       jsonb,        -- fiche morphologique utilisée
  directives  jsonb,        -- split / accent / vague imposés
  reflexion   jsonb,        -- raisonnement du coach IA
  programme   jsonb,        -- programme produit
  warnings    jsonb default '[]'::jsonb
);
create index if not exists genev_user_idx on public.generation_events(user_id, created_at desc);
alter table public.generation_events enable row level security;
-- Aucune policy → invisible aux clients ; service role uniquement.

-- ─── 4. MORPHO_EVENTS (fiches produites — jamais les photos) ────────────────
create table if not exists public.morpho_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  status      text not null default 'ok',
  fiche       jsonb
);
create index if not exists morphev_user_idx on public.morpho_events(user_id, created_at desc);
alter table public.morpho_events enable row level security;

-- ─── 5. WORKOUT_SYNC (journal séances + feedbacks, écrit par le client) ─────
create table if not exists public.workout_sync (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('workout','feedback')),
  day         date,
  payload     jsonb not null
);
create index if not exists wsync_user_idx on public.workout_sync(user_id, created_at desc);
alter table public.workout_sync enable row level security;
drop policy if exists "workout_sync: insertion de ses propres lignes" on public.workout_sync;
create policy "workout_sync: insertion de ses propres lignes"
  on public.workout_sync for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists "workout_sync: lecture par le propriétaire" on public.workout_sync;
create policy "workout_sync: lecture par le propriétaire"
  on public.workout_sync for select
  using (auth.uid() = user_id);

-- ─── 6. CYCLE_OUTCOMES (résultat de chaque cycle : la variable cible IA) ────
create table if not exists public.cycle_outcomes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  cycle_numero     integer,
  titre            text,
  objectif         text,
  split            text,
  seances_prevues  integer,
  seances_faites   integer,
  adherence_pct    integer,
  charges_resume   text,
  reflexion        jsonb
);
create index if not exists cyout_user_idx on public.cycle_outcomes(user_id, created_at desc);
alter table public.cycle_outcomes enable row level security;
drop policy if exists "cycle_outcomes: insertion de ses propres lignes" on public.cycle_outcomes;
create policy "cycle_outcomes: insertion de ses propres lignes"
  on public.cycle_outcomes for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists "cycle_outcomes: lecture par le propriétaire" on public.cycle_outcomes;
create policy "cycle_outcomes: lecture par le propriétaire"
  on public.cycle_outcomes for select
  using (auth.uid() = user_id);


-- ─── 6bis. CYCLE_OUTCOMES — colonne ajoutée après l'audit ──────────────────
-- Charges ATTEINTES en fin de cycle, écrites par syncCycleOutcome(prog, charges).
-- Sans elle, l'insertion perd silencieusement le champ et le cycle suivant ne
-- peut pas repartir du meilleur niveau atteint.
alter table public.cycle_outcomes
  add column if not exists charges_finales jsonb;


-- ─── 7. GENERATION_JOBS (état des générations asynchrones) ─────────────────
-- Indispensable au fonctionnement de /api/generate-program-start.
-- Sans cette table, la route répond 501 et le client bascule sur la génération
-- SYNCHRONE, que Safari coupe à ~60 s : c'est le « Délai dépassé ».
--
-- Aucune policy RLS : seule la service role (serveur) lit et écrit. Le client
-- n'y accède jamais en direct, il passe par /api/generate-program-status avec
-- le couple { jobId, token }.
create table if not exists public.generation_jobs (
  id            uuid primary key default gen_random_uuid(),
  token         text        not null,
  user_id       text,
  status        text        not null default 'processing',  -- processing | done | error
  result        jsonb,
  error         text,
  error_status  int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists genjobs_status_idx on public.generation_jobs(status, created_at desc);
create index if not exists genjobs_user_idx   on public.generation_jobs(user_id, created_at desc);
alter table public.generation_jobs enable row level security;
-- Volontairement AUCUNE policy : accès réservé à la service role.


-- ─── 8. EXERCICES_PROPOSES (file de revue des exercices hors catalogue) ────
-- Quand l'IA nomme un exercice absent du catalogue, il est conservé dans le
-- programme (avec un avertissement) et journalisé ici pour revue.
--
-- Pour consulter la file :
--   Supabase → Table Editor → exercices_proposes → trier par occurrences ↓
-- Les noms qui reviennent le plus sont ceux qui manquent réellement.
--
-- Facultative : si elle n'existe pas, la journalisation est ignorée sans erreur.
create table if not exists public.exercices_proposes (
  id             uuid primary key default gen_random_uuid(),
  nom            text        not null,
  nom_normalise  text        not null unique,   -- dédoublonnage (accents/casse retirés)
  occurrences    int         not null default 1,
  contexte       jsonb,                          -- { niveau, objectif, materiel }
  statut         text        not null default 'a_revoir',  -- a_revoir | accepte | refuse
  premiere_vue   timestamptz not null default now(),
  derniere_vue   timestamptz not null default now()
);
create index if not exists exprop_statut_idx on public.exercices_proposes(statut, occurrences desc);
alter table public.exercices_proposes enable row level security;
-- Volontairement AUCUNE policy : accès réservé à la service role.


-- ─── Vérification finale ───────────────────────────────────────────────────
-- Doit renvoyer 8 lignes.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('entitlements','usage_counters','generation_events','morpho_events',
                     'workout_sync','cycle_outcomes','generation_jobs','exercices_proposes')
order by table_name;
