/**
 * Database service layer — all CRUD operations for the application.
 * Uses the browser Supabase client (respects RLS + schema selection).
 * Import in client components via useEffect or in server components directly.
 */

import { createClient } from "@/lib/supabase/client";

function safeParseSummary(summary: unknown): Record<string, unknown> | null {
  if (!summary) return null;
  if (typeof summary === "object" && summary !== null) return summary as Record<string, unknown>;
  if (typeof summary !== "string") return null;
  try {
    const parsed = JSON.parse(summary);
    return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

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
  DbInterviewSet,
  DbInterviewQuestion,
  DbAIExtractionLog,
  DbCandidateComment,
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

export async function createRole(
  role: Omit<DbProjectRole, "id" | "created_at" | "updated_at">,
): Promise<DbProjectRole> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_roles")
    .insert(role)
    .select()
    .single();
  if (error) throw error;
  return data as DbProjectRole;
}

export async function updateRole(
  id: string,
  updates: Partial<Omit<DbProjectRole, "id" | "created_at">>,
): Promise<DbProjectRole> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_roles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
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

export async function fetchMatchRunById(id: string): Promise<DbMatchRun | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("match_runs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DbMatchRun;
}

export async function fetchMatchRunsForCandidate(candidateId: string, limit = 10): Promise<DbMatchRun[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("match_runs")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DbMatchRun[];
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

export type DashboardActivityItem = {
  id: string;
  type: "match" | "project" | "candidate" | "posting";
  created_at: string;
  title: string;
  detail: string;
  href: string;
  isStale?: boolean;
};

export async function fetchDashboardActivity(limit = 6): Promise<DashboardActivityItem[]> {
  const supabase = createClient();

  const [projectsResult, candidatesResult, postingsResult, matchRunsResult] = await Promise.all([
    supabase.from("projects").select("id, title, created_at").order("created_at", { ascending: false }).limit(limit),
    supabase.from("candidates").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(limit),
    supabase.from("job_postings").select("id, title, created_at, status").order("created_at", { ascending: false }).limit(limit),
    supabase.from("match_runs").select("id, created_at, score, summary, candidate_id, posting_id").order("created_at", { ascending: false }).limit(limit),
  ]);

  if (projectsResult.error) throw projectsResult.error;
  if (candidatesResult.error) throw candidatesResult.error;
  if (postingsResult.error) throw postingsResult.error;
  if (matchRunsResult.error) throw matchRunsResult.error;

  const projects = (projectsResult.data ?? []) as Array<Pick<DbProject, "id" | "title" | "created_at">>;
  const candidates = (candidatesResult.data ?? []) as Array<Pick<DbCandidate, "id" | "full_name" | "created_at">>;
  const postings = (postingsResult.data ?? []) as Array<Pick<DbJobPosting, "id" | "title" | "created_at" | "status">>;
  const matchRuns = (matchRunsResult.data ?? []) as Array<Pick<DbMatchRun, "id" | "created_at" | "score" | "summary" | "candidate_id" | "posting_id">>;

  const candidateIds = [...new Set(matchRuns.map((run) => run.candidate_id).filter(Boolean))];
  const postingIds = [...new Set(matchRuns.map((run) => run.posting_id).filter(Boolean))];

  const [matchCandidatesResult, matchPostingsResult] = await Promise.all([
    candidateIds.length > 0
      ? supabase.from("candidates").select("id, full_name").in("id", candidateIds)
      : Promise.resolve({ data: [], error: null }),
    postingIds.length > 0
      ? supabase.from("job_postings").select("id, title").in("id", postingIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (matchCandidatesResult.error) throw matchCandidatesResult.error;
  if (matchPostingsResult.error) throw matchPostingsResult.error;

  const candidateNameById = new Map(
    ((matchCandidatesResult.data ?? []) as Array<Pick<DbCandidate, "id" | "full_name">>).map((candidate) => [candidate.id, candidate.full_name]),
  );
  const postingTitleById = new Map(
    ((matchPostingsResult.data ?? []) as Array<Pick<DbJobPosting, "id" | "title">>).map((posting) => [posting.id, posting.title]),
  );

  return [
    ...matchRuns.map((run) => {
      const summaryData = run.summary
        ? safeParseSummary(run.summary)
        : null;
      const recommendation = summaryData?.recommendation as string | undefined;
      const recommendationLabel = recommendation === "geeignet"
        ? "Suitable"
        : recommendation === "bedingt geeignet"
          ? "Partially suitable"
          : recommendation === "nicht geeignet"
            ? "Not suitable"
            : "";

      return {
        id: `match-${run.id}`,
        type: "match" as const,
        created_at: run.created_at,
        title: `Match run for ${candidateNameById.get(run.candidate_id) ?? "candidate"}`,
        detail: `${postingTitleById.get(run.posting_id) ?? "Posting"} · ${run.score}% score${recommendationLabel ? ` · ${recommendationLabel}` : ""}`,
        href: `/matching?matchRun=${run.id}`,
        isStale: !(candidateNameById.has(run.candidate_id) && postingTitleById.has(run.posting_id)),
      };
    }),
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      type: "project" as const,
      created_at: project.created_at,
      title: `Project created: ${project.title}`,
      detail: "New project record added",
      href: `/projects/${project.id}`,
    })),
    ...postings.map((posting) => ({
      id: `posting-${posting.id}`,
      type: "posting" as const,
      created_at: posting.created_at,
      title: `Posting updated: ${posting.title}`,
      detail: `Status: ${posting.status}`,
      href: `/postings/${posting.id}`,
    })),
    ...candidates.map((candidate) => ({
      id: `candidate-${candidate.id}`,
      type: "candidate" as const,
      created_at: candidate.created_at,
      title: `Candidate added: ${candidate.full_name}`,
      detail: "Candidate profile is available for review",
      href: `/candidates/${candidate.id}`,
    })),
  ]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, limit);
}

// ─── Interview Sets ────────────────────────────────────────────────────────

export async function fetchInterviewSetsForMatchRun(matchRunId: string): Promise<DbInterviewSet[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("interview_sets")
    .select("*")
    .eq("match_run_id", matchRunId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbInterviewSet[];
}

export async function fetchInterviewSetById(id: string): Promise<DbInterviewSet | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("interview_sets")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DbInterviewSet;
}

// ─── Interview Questions ───────────────────────────────────────────────────

export async function fetchQuestionsForSet(setId: string): Promise<DbInterviewQuestion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("interview_set_id", setId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbInterviewQuestion[];
}

export async function updateQuestionResponse(
  questionId: string,
  rating: number,
  notes: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("interview_questions")
    .update({ response_rating: rating, response_notes: notes })
    .eq("id", questionId);
  if (error) throw error;
}

// ─── AI Extraction Log ─────────────────────────────────────────────────────

export async function fetchAILogs(limit = 50): Promise<DbAIExtractionLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ai_extraction_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DbAIExtractionLog[];
}

// ─── Candidate Comments ────────────────────────────────────────────────────

export async function fetchCommentsForCandidate(candidateId: string): Promise<DbCandidateComment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("candidate_comments")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbCandidateComment[];
}

export async function createCandidateComment(
  comment: Omit<DbCandidateComment, "id" | "created_at" | "edited_at">,
): Promise<DbCandidateComment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("candidate_comments")
    .insert(comment)
    .select()
    .single();
  if (error) throw error;
  return data as DbCandidateComment;
}

export async function updateCandidateComment(
  id: string,
  text: string,
): Promise<DbCandidateComment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("candidate_comments")
    .update({ text, edited_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DbCandidateComment;
}

export async function archiveCandidateComment(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("candidate_comments")
    .update({ status: "archived", edited_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ─── Match Runs (all) ──────────────────────────────────────────────────────

export async function fetchAllMatchRuns(): Promise<DbMatchRun[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("match_runs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbMatchRun[];
}
