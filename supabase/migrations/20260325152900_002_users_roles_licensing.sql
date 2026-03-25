-- Migration: Add users, tenants, roles, licensing, notifications, phone verification
-- Depends on: 20260323_001_init.sql

-- ─── Tenants ────────────────────────────────────────────────────────────────

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  license_type text not null default 'free' check (license_type in ('free', 'starter', 'professional', 'enterprise')),
  max_users int not null default 1,
  max_projects int not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tenants_slug on public.tenants (slug);

-- ─── Users ──────────────────────────────────────────────────────────────────

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique, -- links to Supabase auth.users.id
  email text not null unique,
  full_name text not null,
  phone text,
  phone_verified boolean not null default false,
  role text not null default 'user' check (role in ('admin', 'manager', 'user')),
  status text not null default 'invited' check (status in ('active', 'invited', 'suspended')),
  locale text not null default 'de' check (locale in ('de', 'en')),
  avatar_url text,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  accepted_terms_at timestamptz,
  accepted_privacy_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_tenant on public.users (tenant_id);
create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_auth_uid on public.users (auth_uid);

-- ─── Phone Verification ─────────────────────────────────────────────────────

create table if not exists public.phone_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  phone text not null,
  method text not null check (method in ('whatsapp', 'sms')),
  code_hash text not null,
  attempts int not null default 0,
  verified boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_phone_verifications_user on public.phone_verifications (user_id, created_at desc);

-- ─── Licenses ───────────────────────────────────────────────────────────────

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  license_type text not null check (license_type in ('free', 'starter', 'professional', 'enterprise')),
  scope text not null default 'user' check (scope in ('user', 'project')),
  max_units int not null default 1,
  used_units int not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_licenses_tenant on public.licenses (tenant_id);

-- ─── Notifications ──────────────────────────────────────────────────────────

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error')),
  title_key text not null,
  message_key text not null,
  params jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_read on public.notifications (user_id, read, created_at desc);

-- ─── Update existing tables to reference users ──────────────────────────────

-- Add created_by to projects if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'created_by'
  ) then
    alter table public.projects add column created_by uuid references public.users(id);
  end if;
end $$;

-- Add status, description, updated_at and mapping fields to projects if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'status'
  ) then
    alter table public.projects add column status text not null default 'draft' check (status in ('draft', 'active', 'archived'));
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'description'
  ) then
    alter table public.projects add column description text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'updated_at'
  ) then
    alter table public.projects add column updated_at timestamptz not null default now();
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'extension_mode'
  ) then
    alter table public.projects add column extension_mode text not null default 'mock' check (extension_mode in ('mock', 'manual-ai-assisted'));
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'custom_attributes'
  ) then
    alter table public.projects add column custom_attributes jsonb;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'mapped_profile'
  ) then
    alter table public.projects add column mapped_profile jsonb;
  end if;
end $$;

-- Add created_by and mapping fields to candidates if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'candidates' and column_name = 'created_by'
  ) then
    alter table public.candidates add column created_by uuid references public.users(id);
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'candidates' and column_name = 'extension_mode'
  ) then
    alter table public.candidates add column extension_mode text not null default 'mock' check (extension_mode in ('mock', 'manual-ai-assisted'));
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'candidates' and column_name = 'custom_attributes'
  ) then
    alter table public.candidates add column custom_attributes jsonb;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'candidates' and column_name = 'mapped_profile'
  ) then
    alter table public.candidates add column mapped_profile jsonb;
  end if;
end $$;

-- ─── RLS Policies ────────────────────────────────────────────────────────────

alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.phone_verifications enable row level security;
alter table public.licenses enable row level security;
alter table public.notifications enable row level security;

-- Tenants: users can see their own tenant
drop policy if exists "tenants_select_own" on public.tenants;
create policy "tenants_select_own" on public.tenants
for select using (true); -- Placeholder: replace with tenant membership check

-- Users: users in same tenant can see each other
drop policy if exists "users_select_tenant" on public.users;
create policy "users_select_tenant" on public.users
for select using (true); -- Placeholder: replace with tenant check

-- Notifications: users can only see their own
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
for select using (true); -- Placeholder: replace with user_id = auth.uid() mapping

-- Licenses: tenant members can view
drop policy if exists "licenses_select_tenant" on public.licenses;
create policy "licenses_select_tenant" on public.licenses
for select using (true); -- Placeholder
