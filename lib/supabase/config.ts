/**
 * Supabase environment configuration.
 *
 * Schema selection:
 *  - NEXT_PUBLIC_DB_SCHEMA=test     → local development (populated by scripts/seed.ts)
 *  - NEXT_PUBLIC_DB_SCHEMA=public   → Vercel staging + production
 *
 * Override in .env.local for local development.
 */

export type DbSchema = "test" | "public";

export function getDbSchema(): DbSchema {
  const schema = process.env.NEXT_PUBLIC_DB_SCHEMA ?? "public";
  if (schema === "test" || schema === "public") return schema;
  return "public";
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return key;
}
