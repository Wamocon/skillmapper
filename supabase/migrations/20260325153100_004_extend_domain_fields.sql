-- Migration 004: Extend projects, candidates, job_postings with domain-specific fields
-- These fields are used by the matching engine and stored alongside the raw text.
-- Uses safe ALTER ... ADD COLUMN IF NOT EXISTS pattern.

-- ─── Projects: domain fields ─────────────────────────────────────────────────

alter table public.projects
  add column if not exists duration_months int not null default 6,
  add column if not exists industry text not null default 'Allgemein',
  add column if not exists maturity text not null default 'idea'
    check (maturity in ('idea', 'pilot', 'rollout', 'scale')),
  add column if not exists phase text not null default 'discovery'
    check (phase in ('discovery', 'delivery', 'stabilization')),
  add column if not exists constraints jsonb not null default '[]'::jsonb,
  add column if not exists additional_attributes jsonb not null default '[]'::jsonb;

create index if not exists idx_projects_industry on public.projects (industry);
create index if not exists idx_projects_status_tenant on public.projects (tenant_id, status);

-- ─── Candidates: domain fields ───────────────────────────────────────────────

alter table public.candidates
  add column if not exists location text,
  add column if not exists availability_weeks int not null default 4,
  add column if not exists experiences jsonb not null default '[]'::jsonb,
  add column if not exists total_project_months int not null default 0,
  add column if not exists additional_attributes jsonb not null default '[]'::jsonb;

-- ─── Job Postings: domain fields ─────────────────────────────────────────────

alter table public.job_postings
  add column if not exists duration_months int not null default 6,
  add column if not exists industry text not null default 'Allgemein',
  add column if not exists maturity text not null default 'idea'
    check (maturity in ('idea', 'pilot', 'rollout', 'scale')),
  add column if not exists phase text not null default 'discovery'
    check (phase in ('discovery', 'delivery', 'stabilization')),
  add column if not exists constraints jsonb not null default '[]'::jsonb,
  add column if not exists additional_attributes jsonb not null default '[]'::jsonb;
