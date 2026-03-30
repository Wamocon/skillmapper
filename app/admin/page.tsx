"use client";

import Link from "next/link";
import { Users, CreditCard, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { PERMISSIONS } from "@/lib/auth/roles";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const { t, locale } = useI18n();
  const { can } = useAuth();

  if (!can(PERMISSIONS.ADMIN_PANEL)) {
    return (
      <Card className="text-center py-16">
        <Shield className="mx-auto h-12 w-12 text-rust/40" />
        <p className="mt-4 text-lg font-semibold text-rust">{locale === "de" ? "Zugriff verweigert" : "Access denied"}</p>
        <p className="text-sm text-ink/60">{locale === "de" ? "Sie verfügen nicht über die erforderlichen Berechtigungen." : "You do not have the required permissions."}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("admin.title")}

        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/users">
          <Card className="transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-moss/10">
                <Users className="h-6 w-6 text-moss" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-ink">{t("admin.users")}</h3>
                <p className="text-sm text-ink/60">{t("admin.usersSubtitle")}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/licenses">
          <Card className="transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rust/10">
                <CreditCard className="h-6 w-6 text-rust" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-ink">{t("admin.licenses")}</h3>
                <p className="text-sm text-ink/60">{t("admin.licensesSubtitle")}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
