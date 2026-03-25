/**
 * Database service layer — all CRUD operations for the application.
 * Uses the browser Supabase client (respects RLS + schema selection).
 * Import in client components via useEffect or in server components directly.
 */

import { createClient } from "@/lib/supabase/client";
import type {
  DbProject,
  DbCandidate,
  DbProjectRole,
  DbJobPosting,
  DbMatchRun,
  DbUser,
  DbTenant,
  DbNotification,
  DbLicense,
} from "@/lib/db/types";

// ─── Projects ────────────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<DbProject[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbProject[];
}

export async function fetchProjectById(id: string): Promise<DbProject | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DbProject;
}

export async function createProject(
  project: Omit<DbProject, "id" | "created_at" | "updated_at">,
): Promise<DbProject> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();
  if (error) throw error;
  return data as DbProject;
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<DbProject, "id" | "created_at">>,
): Promise<DbProject> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DbProject;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ─── Candidates ────────────────────────────────────────────────────────────

export async function fetchCandidates(): Promise<DbCandidate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbCandidate[];
}

export async function fetchCandidateById(id: string): Promise<DbCandidate | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DbCandidate;
}

export async function createCandidate(
  candidate: Omit<DbCandidate, "id" | "created_at">,
): Promise<DbCandidate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("candidates")
    .insert(candidate)
    .select()
    .single();
  if (error) throw error;
  return data as DbCandidate;
}

export async function updateCandidate(
  id: string,
  updates: Partial<Omit<DbCandidate, "id" | "created_at">>,
): Promise<DbCandidate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("candidates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DbCandidate;
}

export async function deleteCandidate(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("candidates").delete().eq("id", id);
  if (error) throw error;
}

// ─── Project Roles ─────────────────────────────────────────────────────────

export async function fetchRolesForProject(projectId: string): Promise<DbProjectRole[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_roles")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbProjectRole[];
}

export async function fetchRoleById(id: string): Promise<DbProjectRole | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_roles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DbProjectRole;
}

// ─── Job Postings ──────────────────────────────────────────────────────────

export async function fetchPostings(projectId?: string): Promise<DbJobPosting[]> {
  const supabase = createClient();
  let query = supabase
    .from("job_postings")
    .select("*")
    .order("created_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DbJobPosting[];
}

export async function fetchActivePostings(): Promise<DbJobPosting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbJobPosting[];
}

export async function fetchPostingById(id: string): Promise<DbJobPosting | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DbJobPosting;
}

export async function fetchPostingsForRole(roleId: string): Promise<DbJobPosting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("role_id", roleId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbJobPosting[];
}

export async function createPosting(
  posting: Omit<DbJobPosting, "id" | "created_at" | "updated_at">,
): Promise<DbJobPosting> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .insert(posting)
    .select()
    .single();
  if (error) throw error;
  return data as DbJobPosting;
}

export async function updatePosting(
  id: string,
  updates: Partial<Omit<DbJobPosting, "id" | "created_at">>,
): Promise<DbJobPosting> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DbJobPosting;
}

// ─── Match Runs ────────────────────────────────────────────────────────────

export async function fetchMatchRunsForPosting(postingId: string): Promise<DbMatchRun[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("match_runs")
    .select("*")
    .eq("posting_id", postingId)
    .order("score", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbMatchRun[];
}

export async function saveMatchRun(
  run: Omit<DbMatchRun, "id" | "created_at">,
): Promise<DbMatchRun> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("match_runs")
    .insert(run)
    .select()
    .single();
  if (error) throw error;
  return data as DbMatchRun;
}

export async function fetchRecentMatchRuns(limit = 10): Promise<DbMatchRun[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("match_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DbMatchRun[];
}

// ─── Users ─────────────────────────────────────────────────────────────────

export async function fetchCurrentUserProfile(authUid: string): Promise<DbUser | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_uid", authUid)
    .single();
  if (error) return null;
  return data as DbUser;
}

export async function fetchUsersInTenant(): Promise<DbUser[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbUser[];
}

export async function updateUserRole(
  userId: string,
  role: DbUser["role"],
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function updateUserStatus(
  userId: string,
  status: DbUser["status"],
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("users")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

// ─── Tenant ────────────────────────────────────────────────────────────────

export async function fetchCurrentTenant(tenantId: string): Promise<DbTenant | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();
  if (error) return null;
  return data as DbTenant;
}

// ─── Notifications ─────────────────────────────────────────────────────────

export async function fetchNotifications(userId: string): Promise<DbNotification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbNotification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

// ─── Licenses ──────────────────────────────────────────────────────────────

export async function fetchLicensesForTenant(): Promise<DbLicense[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbLicense[];
}

// ─── Dashboard counts ──────────────────────────────────────────────────────

export async function fetchDashboardCounts(): Promise<{
  projects: number;
  candidates: number;
  activePostings: number;
  recentMatches: number;
}> {
  const supabase = createClient();
  const [projects, candidates, postings, matches] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("candidates").select("id", { count: "exact", head: true }),
    supabase.from("job_postings").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("match_runs").select("id", { count: "exact", head: true }),
  ]);
  return {
    projects: projects.count ?? 0,
    candidates: candidates.count ?? 0,
    activePostings: postings.count ?? 0,
    recentMatches: matches.count ?? 0,
  };
}
