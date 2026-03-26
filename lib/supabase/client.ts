import { createBrowserClient } from "@supabase/ssr";
import { processLock } from "@supabase/auth-js";
import { getDbSchema, getSupabaseUrl, getSupabaseAnonKey } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    db: { schema: getDbSchema() },
    auth: { lock: processLock },
  });

  return browserClient;
}
