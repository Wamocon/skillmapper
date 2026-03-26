"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DbUser } from "@/lib/db/types";
import { hasPermission, type Permission } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { fetchCurrentUserProfile } from "@/lib/db/service";

interface AuthContextValue {
  user: DbUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
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
const AUTH_BOOTSTRAP_TIMEOUT_MS = 2000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function finishBootstrap() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (isActive) {
        setIsLoading(false);
      }
    }

    async function applySession(session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) {
      try {
        if (!isActive) {
          return;
        }

        if (!session?.user) {
          setUser(null);
          return;
        }

        const profile = await fetchCurrentUserProfile(session.user.id);
        if (isActive) {
          setUser(profile);
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
      } finally {
        finishBootstrap();
      }
    }

    timeoutId = setTimeout(() => {
      if (isActive) {
        setUser(null);
        setIsLoading(false);
      }
    }, AUTH_BOOTSTRAP_TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void applySession(session);
      },
    );

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (authError) throw new Error(authError.message);
    if (authData.user) {
      // User profile is created via DB trigger or seed — update consent timestamps
      await supabase
        .from("users")
        .update({
          full_name: data.fullName,
          phone: data.phone,
          accepted_terms_at: data.acceptedTerms ? new Date().toISOString() : null,
          accepted_privacy_at: data.acceptedPrivacy ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("auth_uid", authData.user.id);
    }
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const can = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user],
  );

  const updateUser = useCallback(
    (updates: Partial<DbUser>) => {
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      can,
      updateUser,
    }),
    [user, isLoading, login, register, logout, can, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
