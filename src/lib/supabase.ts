// ============================================================
// Supabase client helpers
// ============================================================
import { createBrowserClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Browser singleton ────────────────────────────────────────
// IMPORTANT: Must be a module-level singleton.
// Calling createBrowserClient() more than once creates multiple
// client instances that all compete for the same Navigator Lock
// on the auth token, causing:
//   "LockAcquireTimeoutError: Acquiring an exclusive lock immediately failed"
// One instance per browser tab is the correct pattern.

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return browserClient;
}

// ── Admin client — server/API routes only ────────────────────
// Never call this in client components — SERVICE_ROLE_KEY bypasses RLS.
// A new instance per API call is fine here (server-side, no lock contention).
export function createSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
