"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";
import { NotificationProvider } from "@/lib/notifications/context";

/**
 * Combined providers wrapper — order matters for dependency resolution:
 * I18n → Auth → Notifications
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
