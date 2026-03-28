/**
 * Database model types matching the Supabase schema.
 * Used across the application for type safety with real DB or mock fallback.
 */

export type UserRole = "admin" | "manager" | "user";

export type UserStatus = "active" | "invited" | "suspended";

export type LicenseType = "free" | "starter" | "professional" | "enterprise";

export type LicenseScopeType = "user" | "project";

export type NotificationType = "info" | "success" | "warning" | "error";

export type VerificationMethod = "whatsapp" | "sms";

export type Locale = "de" | "en";

export type AttributeExtensionMode = "mock" | "manual-ai-assisted";

// ─── User & Auth ────────────────────────────────────────────────────────────
export type ProjectPhase = "requirements" | "design" | "implementation" | "testing" | "deployment" | "maintenance";

// ─── User & Auth ────────────────────────────────────────────────────────────
export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  phone_verified: boolean;
  role: UserRole;
  status: UserStatus;
  locale: Locale;
  avatar_url: string | null;
  tenant_id: string;
  accepted_terms_at: string | null;
  accepted_privacy_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbTenant {
  id: string;
  name: string;
  slug: string;
  license_type: LicenseType;
  max_users: number;
  max_projects: number;
  created_at: string;
  updated_at: string;
}

// ─── Projects ───────────────────────────────────────────────────────────────

export interface DbProject {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  source_type: "tender" | "project-brief";
  raw_text: string | null;
  status: "draft" | "active" | "archived";
  created_by: string;
  extension_mode: AttributeExtensionMode;
  custom_attributes: Record<string, string> | null;
  mapped_profile: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Domain-specific fields (migration 004)
  duration_months: number;
  industry: string;
  phase: ProjectPhase;
  constraints: string[];
  additional_attributes: string[];
}

// ─── Candidates ─────────────────────────────────────────────────────────────

export interface DbCandidate {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string | null;
  cv_raw_text: string | null;
  created_by: string;
  extension_mode: AttributeExtensionMode;
  custom_attributes: Record<string, string> | null;
  mapped_profile: Record<string, unknown> | null;
  created_at: string;
  // Domain-specific fields (migration 004)
  location: string | null;
  availability_weeks: number;
  experiences: Array<{ project_name: string; duration_months: number; role: string }>;
  total_project_months: number;
  additional_attributes: string[];
}

// ─── Project Roles ──────────────────────────────────────────────────────────

export type RoleFillStatus = "open" | "placeholder" | "filled";

export interface DbProjectRole {
  id: string;
  project_id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  fill_status: RoleFillStatus;
  assigned_candidate_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Job Postings (Ausschreibungen) ─────────────────────────────────────────

export type PostingStatus = "draft" | "active" | "paused" | "closed" | "filled";
export type PostingPriority = "high" | "medium" | "low";

export interface DbJobPosting {
  id: string;
  project_id: string;
  role_id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  raw_text: string | null;
  status: PostingStatus;
  extension_mode: AttributeExtensionMode;
  custom_attributes: Record<string, string> | null;
  mapped_profile: Record<string, unknown> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  priority: PostingPriority;
  // Domain-specific fields (migration 004)
  duration_months: number;
  industry: string;
  phase: ProjectPhase;
  constraints: string[];
  additional_attributes: string[];
}

// ─── Match Runs ─────────────────────────────────────────────────────────────

export interface DbMatchRun {
  id: string;
  tenant_id: string;
  project_id: string;
  posting_id: string;
  candidate_id: string;
  score: number;
  summary: string | null;
  created_at: string;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export interface DbNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title_key: string;
  message_key: string;
  params: Record<string, string> | null;
  read: boolean;
  created_at: string;
}

// ─── Licenses ───────────────────────────────────────────────────────────────

export interface DbLicense {
  id: string;
  tenant_id: string;
  license_type: LicenseType;
  scope: LicenseScopeType;
  max_units: number;
  used_units: number;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

// ─── Phone Verification ─────────────────────────────────────────────────────

export interface DbPhoneVerification {
  id: string;
  user_id: string;
  phone: string;
  method: VerificationMethod;
  code_hash: string;
  attempts: number;
  verified: boolean;
  expires_at: string;
  created_at: string;
}

// ─── Interview Sets (AI-generated) ──────────────────────────────────────────

export interface DbInterviewSet {
  id: string;
  match_run_id: string;
  posting_id: string;
  candidate_id: string;
  tenant_id: string;
  interviewer_user_id: string | null;
  total_questions: number;
  recommended_order: string[];
  order_rationale: string | null;
  generation_notes: string | null;
  created_at: string;
}

// ─── Interview Questions ────────────────────────────────────────────────────

export type InterviewQuestionPriority = "high" | "medium" | "low";
export type InterviewQuestionCategory = "technical" | "behavioral" | "motivational" | "contextual";

export interface DbInterviewQuestion {
  id: string;
  interview_set_id: string;
  sort_order: number;
  question: string;
  goal: string;
  expected_evidence: string;
  based_on: string;
  priority: InterviewQuestionPriority;
  category: InterviewQuestionCategory;
  follow_up_hint: string | null;
  rubric: Record<string, string> | null;
  response_rating: number | null;
  response_notes: string | null;
  created_at: string;
}

// ─── Candidate Comments ─────────────────────────────────────────────────────

export type CommentStatus = "active" | "archived";

export interface DbCandidateComment {
  id: string;
  candidate_id: string;
  tenant_id: string;
  section: string;
  text: string;
  author_name: string;
  author_id: string;
  status: CommentStatus;
  created_at: string;
  edited_at: string | null;
}

// ─── AI Extraction Log ──────────────────────────────────────────────────────

export type AIOperationType =
  | "posting_extraction"
  | "candidate_extraction"
  | "single_match"
  | "multi_match"
  | "interview_generation";

export type AIEntityType = "job_posting" | "candidate" | "match_run" | "interview_set";

export interface DbAIExtractionLog {
  id: string;
  tenant_id: string;
  user_id: string | null;
  operation_type: AIOperationType;
  entity_type: AIEntityType;
  entity_id: string;
  model_used: string;
  input_tokens: number | null;
  output_tokens: number | null;
  duration_ms: number | null;
  status: "success" | "error" | "partial";
  error_message: string | null;
  created_at: string;
}
