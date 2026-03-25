-- Project Roles: team positions within a project
create table if not exists public.project_roles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tenant_id uuid not null,
  title text not null,
  description text,
  fill_status text not null default 'open' check (fill_status in ('open', 'placeholder', 'filled')),
  assigned_candidate_id uuid references public.candidates(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_roles_project on public.project_roles (project_id);

-- Job Postings (Ausschreibungen): specific postings per role with own skill requirements
create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role_id uuid not null references public.project_roles(id) on delete cascade,
  tenant_id uuid not null,
  title text not null,
  description text,
  raw_text text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'closed', 'filled')),
  extension_mode text not null default 'mock' check (extension_mode in ('mock', 'manual-ai-assisted')),
  custom_attributes jsonb default '{}'::jsonb,
  mapped_profile jsonb,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_job_postings_project on public.job_postings (project_id);
create index if not exists idx_job_postings_role on public.job_postings (role_id);
create index if not exists idx_job_postings_status on public.job_postings (tenant_id, status);

-- Extend match_runs to reference a posting instead of just a project
alter table public.match_runs add column if not exists posting_id uuid references public.job_postings(id) on delete set null;

create index if not exists idx_match_runs_posting on public.match_runs (posting_id, score desc);

-- RLS
alter table public.project_roles enable row level security;
alter table public.job_postings enable row level security;

drop policy if exists "project_roles_read_placeholder" on public.project_roles;
create policy "project_roles_read_placeholder" on public.project_roles for select using (true);
drop policy if exists "job_postings_read_placeholder" on public.job_postings;
create policy "job_postings_read_placeholder" on public.job_postings for select using (true);
