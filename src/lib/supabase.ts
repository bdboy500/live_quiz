import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazily retrieves or initializes the Supabase client.
 * Configured directly with the user's project credentials.
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check environment variables first, then fallback to hardcoded credentials
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqwssqcpxrwkivrrmuou.supabase.co/rest/v1/";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_LmhA6lMdI1LwZ4SnCaiPMg_0Fu5Saze";

  // Robustly clean trailing /rest/v1/ or /rest/v1 to prevent SDK fetch URL formatting issues
  if (supabaseUrl.endsWith("/rest/v1/")) {
    supabaseUrl = supabaseUrl.slice(0, -9);
  } else if (supabaseUrl.endsWith("/rest/v1")) {
    supabaseUrl = supabaseUrl.slice(0, -8);
  }

  // Create client
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}
