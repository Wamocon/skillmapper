"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { NotificationType } from "@/lib/db/types";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  push: (type: NotificationType, title: string, message: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

let idCounter = 0;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const push = useCallback((type: NotificationType, title: string, message: string) => {
    const notification: AppNotification = {
      id: `notif-${++idCounter}-${Date.now()}`,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, push, markRead, markAllRead, remove, clearAll }),
    [notifications, unreadCount, push, markRead, markAllRead, remove, clearAll],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
