"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DbUser } from "@/lib/db/types";
import { type Session, initSession, storeSession, clearSession } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/auth/roles";

interface AuthContextValue {
  user: DbUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  updateUser: (updates: Partial<DbUser>) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const s = initSession();
    setSession(s);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    void email;
    void password;
    // In production: call Supabase auth.signInWithPassword
    const s = initSession();
    setSession(s);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    // In production: call Supabase auth.signUp, then insert into users table
    const s = initSession();
    s.user.email = data.email;
    s.user.full_name = data.fullName;
    s.user.phone = data.phone;
    s.user.accepted_terms_at = new Date().toISOString();
    s.user.accepted_privacy_at = new Date().toISOString();
    storeSession(s);
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    // In production: call Supabase auth.signOut
  }, []);

  const can = useCallback(
    (permission: Permission) => {
      if (!session) return false;
      return hasPermission(session.user.role, permission);
    },
    [session],
  );

  const updateUser = useCallback(
    (updates: Partial<DbUser>) => {
      if (!session) return;
      const updated = { ...session, user: { ...session.user, ...updates } };
      storeSession(updated);
      setSession(updated);
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session,
      login,
      register,
      logout,
      can,
      updateUser,
    }),
    [session, login, register, logout, can, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
