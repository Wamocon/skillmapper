import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getDbSchema, getSupabaseUrl, getSupabaseServiceRoleKey } from "./config";

/**
 * Service-role client — bypasses RLS.
 * Use ONLY in server-side code (API routes, scripts, server actions).
 * Never expose this to the browser.
 */
export function createServiceClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    db: { schema: getDbSchema() },
    auth: { persistSession: false },
  });
}
