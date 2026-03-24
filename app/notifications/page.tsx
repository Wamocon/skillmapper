"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useNotifications, type AppNotification } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPE_VARIANTS: Record<AppNotification["type"], "info" | "success" | "warning" | "error"> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

export default function NotificationsPage() {
  const { t } = useI18n();
  const { notifications, markRead, markAllRead, remove, clearAll, unreadCount } = useNotifications();

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("notifications.title")}
          subtitle={unreadCount > 0 ? `${unreadCount} ungelesen` : undefined}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-4 w-4" />
                {t("notifications.markAllRead")}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
                <Trash2 className="h-4 w-4" />
                {t("notifications.clearAll")}
              </Button>
            </div>
          }
        />
      </Card>

      {notifications.length === 0 ? (
        <Card className="text-center py-16">
          <Bell className="mx-auto h-12 w-12 text-ink/20" />
          <p className="mt-4 text-lg font-semibold text-ink/60">{t("notifications.empty")}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.read ? "opacity-60" : ""}>
              <div className="flex items-start gap-3">
                <Badge variant={TYPE_VARIANTS[n.type]}>{n.type}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{n.title}</p>
                  <p className="text-sm text-ink/70">{n.message}</p>
                  <p className="mt-1 text-xs text-ink/40">
                    {n.createdAt.toLocaleTimeString("de-DE")}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => remove(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
