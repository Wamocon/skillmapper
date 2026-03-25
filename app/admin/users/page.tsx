"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { PERMISSIONS, ROLE_LABELS } from "@/lib/auth/roles";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import type { DbUser, UserRole } from "@/lib/db/types";
import { fetchUsersInTenant, updateUserRole, updateUserStatus } from "@/lib/db/service";

const STATUS_MAP: Record<string, "success" | "warning" | "error"> = {
  active: "success",
  invited: "warning",
  suspended: "error",
};

export default function AdminUsersPage() {
  const { t, locale } = useI18n();
  const { can } = useAuth();
  const { push } = useNotifications();
  const [users, setUsers] = useState<DbUser[]>([]);

  useEffect(() => {
    fetchUsersInTenant().then(setUsers).catch(() => {});
  }, []);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    await updateUserRole(userId, newRole);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    push("success", t("admin.changeRole"), `Rolle geändert zu ${ROLE_LABELS[newRole][locale]}`);
  }

  async function handleToggleStatus(userId: string) {
    const current = users.find((u) => u.id === userId);
    if (!current) return;
    const newStatus = current.status === "active" ? "suspended" : "active";
    await updateUserStatus(userId, newStatus);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
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
