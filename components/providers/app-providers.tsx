"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";
import { AuthRouteGuard } from "@/lib/auth/route-guard";
import { NotificationProvider } from "@/lib/notifications/context";

/**
 * Combined providers wrapper — order matters for dependency resolution:
 * I18n → Auth → Notifications
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <AuthRouteGuard>
          <NotificationProvider>{children}</NotificationProvider>
        </AuthRouteGuard>
      </AuthProvider>
    </I18nProvider>
  );
}
