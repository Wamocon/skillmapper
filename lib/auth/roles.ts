import type { DbUser, UserRole } from "@/lib/db/types";

/**
 * Permission definitions for the role-based access control system.
 * Each permission is a string identifier checked against role grants.
 */
export const PERMISSIONS = {
  // User management
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",
  USERS_CHANGE_ROLE: "users:change_role",

  // Project management
  PROJECTS_VIEW: "projects:view",
  PROJECTS_CREATE: "projects:create",
  PROJECTS_EDIT: "projects:edit",
  PROJECTS_DELETE: "projects:delete",

  // Candidate management
  CANDIDATES_VIEW: "candidates:view",
  CANDIDATES_CREATE: "candidates:create",
  CANDIDATES_EDIT: "candidates:edit",

  // Matching
  MATCHING_RUN: "matching:run",
  MATCHING_VIEW: "matching:view",

  // License & billing
  LICENSES_VIEW: "licenses:view",
  LICENSES_MANAGE: "licenses:manage",

  // Admin
  ADMIN_PANEL: "admin:panel",
  ADMIN_SETTINGS: "admin:settings",

  // Notifications
  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_MANAGE_ALL: "notifications:manage_all",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role → permissions mapping.
 * Admin inherits all. Manager inherits user + extras.
 */
const USER_PERMISSIONS: Permission[] = [
  PERMISSIONS.PROJECTS_VIEW,
  PERMISSIONS.CANDIDATES_VIEW,
  PERMISSIONS.CANDIDATES_CREATE,
  PERMISSIONS.CANDIDATES_EDIT,
  PERMISSIONS.MATCHING_RUN,
  PERMISSIONS.MATCHING_VIEW,
  PERMISSIONS.NOTIFICATIONS_VIEW,
];

const MANAGER_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.PROJECTS_CREATE,
  PERMISSIONS.PROJECTS_EDIT,
  PERMISSIONS.LICENSES_VIEW,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  PERMISSIONS.USERS_CREATE,
  PERMISSIONS.USERS_EDIT,
  PERMISSIONS.USERS_DELETE,
  PERMISSIONS.USERS_CHANGE_ROLE,
  PERMISSIONS.PROJECTS_DELETE,
  PERMISSIONS.LICENSES_MANAGE,
  PERMISSIONS.ADMIN_PANEL,
  PERMISSIONS.ADMIN_SETTINGS,
  PERMISSIONS.NOTIFICATIONS_MANAGE_ALL,
];

const ROLE_PERMISSION_MAP: Record<UserRole, Permission[]> = {
  admin: ADMIN_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  user: USER_PERMISSIONS,
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSION_MAP[role] ?? [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePerms = getPermissionsForRole(role);
  return permissions.some((p) => rolePerms.includes(p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePerms = getPermissionsForRole(role);
  return permissions.every((p) => rolePerms.includes(p));
}

/**
 * Check if a user can manage another user based on role hierarchy.
 * Admins can manage everyone. Managers can manage users. Users can only manage themselves.
 */
export function canManageUser(actor: DbUser, target: DbUser): boolean {
  if (actor.id === target.id) return true;
  if (actor.role === "admin") return true;
  if (actor.role === "manager" && target.role === "user") return true;
  return false;
}

export const ROLE_LABELS: Record<UserRole, { de: string; en: string }> = {
  admin: { de: "Administrator", en: "Administrator" },
  manager: { de: "Manager", en: "Manager" },
  user: { de: "Benutzer", en: "User" },
};

export const ROLE_HIERARCHY: UserRole[] = ["admin", "manager", "user"];
