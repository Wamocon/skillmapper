"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { PERMISSIONS, ROLE_LABELS } from "@/lib/auth/roles";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import type { DbUser, UserRole } from "@/lib/db/types";

const MOCK_USERS: DbUser[] = [
  {
    id: "mock-user-001",
    email: "admin@kompetenzkompass.de",
    full_name: "Demo Admin",
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
  },
  {
    id: "mock-user-002",
    email: "manager@kompetenzkompass.de",
    full_name: "Petra Manager",
    phone: "+49 170 2345678",
    phone_verified: true,
    role: "manager",
    status: "active",
    locale: "de",
    avatar_url: null,
    tenant_id: "mock-tenant-001",
    accepted_terms_at: "2026-02-01T00:00:00Z",
    accepted_privacy_at: "2026-02-01T00:00:00Z",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "mock-user-003",
    email: "user@kompetenzkompass.de",
    full_name: "Karl Nutzer",
    phone: "+49 170 3456789",
    phone_verified: false,
    role: "user",
    status: "active",
    locale: "en",
    avatar_url: null,
    tenant_id: "mock-tenant-001",
    accepted_terms_at: "2026-03-01T00:00:00Z",
    accepted_privacy_at: "2026-03-01T00:00:00Z",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "mock-user-004",
    email: "invited@kompetenzkompass.de",
    full_name: "Eingeladener Benutzer",
    phone: null,
    phone_verified: false,
    role: "user",
    status: "invited",
    locale: "de",
    avatar_url: null,
    tenant_id: "mock-tenant-001",
    accepted_terms_at: null,
    accepted_privacy_at: null,
    created_at: "2026-03-20T00:00:00Z",
    updated_at: "2026-03-20T00:00:00Z",
  },
];

const STATUS_MAP: Record<string, "success" | "warning" | "error"> = {
  active: "success",
  invited: "warning",
  suspended: "error",
};

export default function AdminUsersPage() {
  const { t, locale } = useI18n();
  const { can } = useAuth();
  const { push } = useNotifications();
  const [users, setUsers] = useState<DbUser[]>(MOCK_USERS);

  function handleRoleChange(userId: string, newRole: UserRole) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
    push("success", t("admin.changeRole"), `Rolle geändert zu ${ROLE_LABELS[newRole][locale]}`);
  }

  function handleToggleStatus(userId: string) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus = u.status === "active" ? "suspended" : "active";
        return { ...u, status: newStatus };
      }),
    );
    push("info", t("admin.users"), "Benutzerstatus geändert");
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("admin.users")}
          subtitle={t("admin.usersSubtitle")}
          action={
            <Button size="sm" disabled={!can(PERMISSIONS.USERS_CREATE)}>
              {t("admin.inviteUser")}
            </Button>
          }
        />
      </Card>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex flex-wrap items-center gap-4">
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moss/10 font-bold text-moss">
                {user.full_name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{user.full_name}</p>
                  <Badge variant={STATUS_MAP[user.status]}>{user.status}</Badge>
                  {!user.phone_verified && user.phone && (
                    <Badge variant="warning">Tel. nicht verifiziert</Badge>
                  )}
                </div>
                <p className="text-sm text-ink/60">{user.email}</p>
              </div>

              {/* Role select */}
              {can(PERMISSIONS.USERS_CHANGE_ROLE) && (
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                  className="w-36"
                >
                  <option value="admin">{ROLE_LABELS.admin[locale]}</option>
                  <option value="manager">{ROLE_LABELS.manager[locale]}</option>
                  <option value="user">{ROLE_LABELS.user[locale]}</option>
                </Select>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {user.status === "active" ? (
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user.id)}>
                    {t("admin.suspendUser")}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user.id)}>
                    {t("admin.activateUser")}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
