"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useNotifications, type AppNotification } from "@/lib/notifications/context";
import { clsx } from "clsx";

const typeConfig: Record<AppNotification["type"], { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "border-blue-300 bg-blue-50 text-blue-800" },
  success: { icon: CheckCircle, className: "border-moss/40 bg-moss/10 text-moss" },
  warning: { icon: AlertTriangle, className: "border-amber-400 bg-amber-50 text-amber-800" },
  error: { icon: AlertCircle, className: "border-rust/40 bg-rust/10 text-rust" },
};

function Toast({ notification, onDismiss }: { notification: AppNotification; onDismiss: () => void }) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={clsx(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg animate-rise backdrop-blur-sm",
        config.className,
      )}
      role="alert"
    >
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{notification.title}</p>
        <p className="text-sm leading-5 opacity-80 whitespace-pre-wrap break-words">{notification.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 rounded-lg p-1 opacity-60 transition hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function NotificationToasts() {
  const { notifications, remove } = useNotifications();
  const visible = notifications.filter((n) => !n.read).slice(0, 3);

  if (visible.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex justify-center px-4 md:top-24">
      <div className="flex w-full max-w-2xl flex-col gap-3">
      {visible.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={() => remove(n.id)} />
      ))}
      </div>
    </div>
  );
}
