"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DbUser } from "@/lib/db/types";
import { hasPermission, type Permission } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { fetchCurrentUserProfile } from "@/lib/db/service";

interface AuthContextValue {
  user: DbUser | null;
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
  const [user, setUser] = useState<DbUser | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Bootstrap: load existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchCurrentUserProfile(session.user.id);
        setUser(profile);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchCurrentUserProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
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

  const logout = useCallback(() => {
    const supabase = createClient();
    supabase.auth.signOut();
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
      isAuthenticated: !!user,
      login,
      register,
      logout,
      can,
      updateUser,
    }),
    [user, login, register, logout, can, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
