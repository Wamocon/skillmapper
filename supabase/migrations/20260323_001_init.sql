create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  title text not null,
  source_type text not null check (source_type in ('tender', 'project-brief')),
  raw_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  full_name text not null,
  email text,
  cv_raw_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.match_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_tenant_created_at on public.projects (tenant_id, created_at desc);
create index if not exists idx_candidates_tenant_created_at on public.candidates (tenant_id, created_at desc);
create index if not exists idx_match_runs_tenant_project_score on public.match_runs (tenant_id, project_id, score desc);

alter table public.projects enable row level security;
alter table public.candidates enable row level security;
alter table public.match_runs enable row level security;

-- Placeholder RLS policies. Replace auth.uid() mapping once tenant-membership model is implemented.
drop policy if exists "projects_read_placeholder" on public.projects;
create policy "projects_read_placeholder" on public.projects
for select using (true);

drop policy if exists "candidates_read_placeholder" on public.candidates;
create policy "candidates_read_placeholder" on public.candidates
for select using (true);

drop policy if exists "match_runs_read_placeholder" on public.match_runs;
create policy "match_runs_read_placeholder" on public.match_runs
for select using (true);
