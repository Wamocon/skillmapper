-- Migration 006: Create 'test' schema as a mirror of the public schema
-- Used for local development. Set NEXT_PUBLIC_DB_SCHEMA=test in .env.local
-- The test schema must be added to Supabase "Exposed schemas" in API settings.
-- Depends on: 001, 002, 003, 004, 005

-- ─── Create test schema ───────────────────────────────────────────────────────

create schema if not exists test;

-- ─── Mirror all tables in test schema ────────────────────────────────────────

create table if not exists test.tenants (like public.tenants including all);
create table if not exists test.users (like public.users including all);
create table if not exists test.projects (like public.projects including all);
create table if not exists test.candidates (like public.candidates including all);
create table if not exists test.project_roles (like public.project_roles including all);
create table if not exists test.job_postings (like public.job_postings including all);
create table if not exists test.match_runs (like public.match_runs including all);
create table if not exists test.notifications (like public.notifications including all);
create table if not exists test.licenses (like public.licenses including all);
create table if not exists test.phone_verifications (like public.phone_verifications including all);

-- ─── Indexes for test schema ──────────────────────────────────────────────────

create index if not exists idx_test_tenants_slug on test.tenants (slug);
create index if not exists idx_test_users_tenant on test.users (tenant_id);
create index if not exists idx_test_users_email on test.users (email);
create index if not exists idx_test_users_auth_uid on test.users (auth_uid);
create index if not exists idx_test_projects_tenant on test.projects (tenant_id, created_at desc);
create index if not exists idx_test_candidates_tenant on test.candidates (tenant_id, created_at desc);
create index if not exists idx_test_project_roles_project on test.project_roles (project_id);
create index if not exists idx_test_job_postings_project on test.job_postings (project_id);
create index if not exists idx_test_job_postings_status on test.job_postings (tenant_id, status);
create index if not exists idx_test_match_runs_tenant on test.match_runs (tenant_id, project_id, score desc);
create index if not exists idx_test_notifications_user on test.notifications (user_id, read, created_at desc);
create index if not exists idx_test_licenses_tenant on test.licenses (tenant_id);

-- ─── RLS for test schema (relaxed for local dev) ─────────────────────────────

alter table test.tenants enable row level security;
alter table test.users enable row level security;
alter table test.projects enable row level security;
alter table test.candidates enable row level security;
alter table test.project_roles enable row level security;
alter table test.job_postings enable row level security;
alter table test.match_runs enable row level security;
alter table test.notifications enable row level security;
alter table test.licenses enable row level security;
alter table test.phone_verifications enable row level security;

-- Test schema uses open read policies for all tables (local dev usage)
-- Service role bypasses RLS entirely, which is sufficient for seeding
drop policy if exists "test_tenants_open" on test.tenants;
create policy "test_tenants_open" on test.tenants for select using (true);
drop policy if exists "test_tenants_all" on test.tenants;
create policy "test_tenants_all" on test.tenants for all using (true);
drop policy if exists "test_users_open" on test.users;
create policy "test_users_open" on test.users for select using (true);
drop policy if exists "test_users_all" on test.users;
create policy "test_users_all" on test.users for all using (true);
drop policy if exists "test_projects_open" on test.projects;
create policy "test_projects_open" on test.projects for select using (true);
drop policy if exists "test_projects_all" on test.projects;
create policy "test_projects_all" on test.projects for all using (true);
drop policy if exists "test_candidates_open" on test.candidates;
create policy "test_candidates_open" on test.candidates for select using (true);
drop policy if exists "test_candidates_all" on test.candidates;
create policy "test_candidates_all" on test.candidates for all using (true);
drop policy if exists "test_project_roles_open" on test.project_roles;
create policy "test_project_roles_open" on test.project_roles for select using (true);
drop policy if exists "test_project_roles_all" on test.project_roles;
create policy "test_project_roles_all" on test.project_roles for all using (true);
drop policy if exists "test_job_postings_open" on test.job_postings;
create policy "test_job_postings_open" on test.job_postings for select using (true);
drop policy if exists "test_job_postings_all" on test.job_postings;
create policy "test_job_postings_all" on test.job_postings for all using (true);
drop policy if exists "test_match_runs_open" on test.match_runs;
create policy "test_match_runs_open" on test.match_runs for select using (true);
drop policy if exists "test_match_runs_all" on test.match_runs;
create policy "test_match_runs_all" on test.match_runs for all using (true);
drop policy if exists "test_notifications_open" on test.notifications;
create policy "test_notifications_open" on test.notifications for select using (true);
drop policy if exists "test_notifications_all" on test.notifications;
create policy "test_notifications_all" on test.notifications for all using (true);
drop policy if exists "test_licenses_open" on test.licenses;
create policy "test_licenses_open" on test.licenses for select using (true);
drop policy if exists "test_licenses_all" on test.licenses;
create policy "test_licenses_all" on test.licenses for all using (true);
drop policy if exists "test_phone_verifications_open" on test.phone_verifications;
create policy "test_phone_verifications_open" on test.phone_verifications for select using (true);
drop policy if exists "test_phone_verifications_all" on test.phone_verifications;
create policy "test_phone_verifications_all" on test.phone_verifications for all using (true);

-- ─── Grant test schema access to API roles ────────────────────────────────────

grant usage on schema test to anon, authenticated, service_role;
grant all on all tables in schema test to anon, authenticated, service_role;
alter default privileges in schema test grant all on tables to anon, authenticated, service_role;
