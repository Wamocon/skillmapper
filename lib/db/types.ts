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
