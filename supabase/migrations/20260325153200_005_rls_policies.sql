-- Migration 005: Replace placeholder RLS policies with auth.uid()-based tenant isolation
-- Depends on: 001, 002, 003, 004

-- ─── Helper: get current user's tenant_id ─────────────────────────────────────

create or replace function public.get_current_tenant_id()
  returns uuid
  language sql
  security definer
  stable
  set search_path = public
as $$
  select tenant_id from public.users where auth_uid = auth.uid();
$$;

-- ─── Helper: check if user is admin ───────────────────────────────────────────

create or replace function public.is_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public
as $$
  select exists (
    select 1 from public.users
    where auth_uid = auth.uid() and role = 'admin'
  );
$$;

-- ─── Projects ─────────────────────────────────────────────────────────────────

drop policy if exists "projects_read_placeholder" on public.projects;

create policy "projects_select_tenant" on public.projects
  for select using (tenant_id = public.get_current_tenant_id());

create policy "projects_insert_tenant" on public.projects
  for insert with check (tenant_id = public.get_current_tenant_id());

create policy "projects_update_tenant" on public.projects
  for update using (tenant_id = public.get_current_tenant_id());

create policy "projects_delete_tenant" on public.projects
  for delete using (tenant_id = public.get_current_tenant_id());

-- ─── Candidates ───────────────────────────────────────────────────────────────

drop policy if exists "candidates_read_placeholder" on public.candidates;

create policy "candidates_select_tenant" on public.candidates
  for select using (tenant_id = public.get_current_tenant_id());

create policy "candidates_insert_tenant" on public.candidates
  for insert with check (tenant_id = public.get_current_tenant_id());

create policy "candidates_update_tenant" on public.candidates
  for update using (tenant_id = public.get_current_tenant_id());

create policy "candidates_delete_tenant" on public.candidates
  for delete using (tenant_id = public.get_current_tenant_id());

-- ─── Match Runs ───────────────────────────────────────────────────────────────

drop policy if exists "match_runs_read_placeholder" on public.match_runs;

create policy "match_runs_select_tenant" on public.match_runs
  for select using (tenant_id = public.get_current_tenant_id());

create policy "match_runs_insert_tenant" on public.match_runs
  for insert with check (tenant_id = public.get_current_tenant_id());

-- ─── Tenants ──────────────────────────────────────────────────────────────────

drop policy if exists "tenants_select_own" on public.tenants;

create policy "tenants_select_own" on public.tenants
  for select using (id = public.get_current_tenant_id());

-- ─── Users ────────────────────────────────────────────────────────────────────

drop policy if exists "users_select_tenant" on public.users;

-- Users can see all users in their own tenant
create policy "users_select_tenant" on public.users
  for select using (tenant_id = public.get_current_tenant_id());

-- Users can only insert themselves (registration flow via service role recommended)
create policy "users_insert_self" on public.users
  for insert with check (auth_uid = auth.uid());

-- Users can update their own profile
create policy "users_update_self" on public.users
  for update using (auth_uid = auth.uid());

-- Admins can update any user in their tenant
create policy "users_update_admin" on public.users
  for update using (
    public.is_admin()
    and tenant_id = public.get_current_tenant_id()
  );

-- ─── Notifications ────────────────────────────────────────────────────────────

drop policy if exists "notifications_select_own" on public.notifications;

create policy "notifications_select_own" on public.notifications
  for select using (
    user_id = (select id from public.users where auth_uid = auth.uid())
  );

create policy "notifications_update_own" on public.notifications
  for update using (
    user_id = (select id from public.users where auth_uid = auth.uid())
  );

create policy "notifications_delete_own" on public.notifications
  for delete using (
    user_id = (select id from public.users where auth_uid = auth.uid())
  );

-- ─── Licenses ─────────────────────────────────────────────────────────────────

drop policy if exists "licenses_select_tenant" on public.licenses;

create policy "licenses_select_tenant" on public.licenses
  for select using (tenant_id = public.get_current_tenant_id());

-- Only admins can manage licenses
create policy "licenses_manage_admin" on public.licenses
  for all using (
    public.is_admin()
    and tenant_id = public.get_current_tenant_id()
  );

-- ─── Project Roles ────────────────────────────────────────────────────────────

drop policy if exists "project_roles_read_placeholder" on public.project_roles;

create policy "project_roles_select_tenant" on public.project_roles
  for select using (tenant_id = public.get_current_tenant_id());

create policy "project_roles_insert_tenant" on public.project_roles
  for insert with check (tenant_id = public.get_current_tenant_id());

create policy "project_roles_update_tenant" on public.project_roles
  for update using (tenant_id = public.get_current_tenant_id());

create policy "project_roles_delete_tenant" on public.project_roles
  for delete using (tenant_id = public.get_current_tenant_id());

-- ─── Job Postings ─────────────────────────────────────────────────────────────

drop policy if exists "job_postings_read_placeholder" on public.job_postings;

create policy "job_postings_select_tenant" on public.job_postings
  for select using (tenant_id = public.get_current_tenant_id());

create policy "job_postings_insert_tenant" on public.job_postings
  for insert with check (tenant_id = public.get_current_tenant_id());

create policy "job_postings_update_tenant" on public.job_postings
  for update using (tenant_id = public.get_current_tenant_id());

create policy "job_postings_delete_tenant" on public.job_postings
  for delete using (tenant_id = public.get_current_tenant_id());

-- ─── Phone Verifications ──────────────────────────────────────────────────────

create policy "phone_verifications_own" on public.phone_verifications
  for all using (
    user_id = (select id from public.users where auth_uid = auth.uid())
  );
