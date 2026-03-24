import type { DbUser, UserRole, Locale } from "@/lib/db/types";

/**
 * Mock session management. In production, this will use Supabase auth + server cookies.
 * All functions are prepared with the same interface the real implementation will use.
 */

export interface Session {
  user: DbUser;
  accessToken: string;
  expiresAt: string;
}

const MOCK_USER: DbUser = {
  id: "mock-user-001",
  email: "demo@skillmapper.dev",
  full_name: "Demo Benutzer",
  phone: "+49 170 1234567",
  phone_verified: true,
  role: "admin",
  status: "active",
  locale: "de",
  avatar_url: null,
  tenant_id: "mock-tenant-001",
  accepted_terms_at: "2026-01-01T00:00:00Z",
  accepted_privacy_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const SESSION_STORAGE_KEY = "skillmapper-session-v1";

export function getMockSession(): Session {
  return {
    user: MOCK_USER,
    accessToken: "mock-token",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function storeSession(session: Session): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function updateSessionLocale(locale: Locale): void {
  const session = getStoredSession();
  if (!session) return;
  session.user.locale = locale;
  storeSession(session);
}

export function updateSessionRole(role: UserRole): void {
  const session = getStoredSession();
  if (!session) return;
  session.user.role = role;
  storeSession(session);
}

/**
 * Initialize session — returns stored session or creates a mock one.
 * In production, this will validate the Supabase JWT.
 */
export function initSession(): Session {
  const stored = getStoredSession();
  if (stored) return stored;
  const session = getMockSession();
  storeSession(session);
  return session;
}
