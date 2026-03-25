import { createBrowserClient } from "@supabase/ssr";
import { getDbSchema, getSupabaseUrl, getSupabaseAnonKey } from "./config";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    db: { schema: getDbSchema() },
  });
}
