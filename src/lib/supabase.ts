import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazily retrieves or initializes the Supabase client.
 * Using lazy initialization prevents the app from crashing at startup
 * if the environment variables have not yet been configured by the user.
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Next.js standard environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. " +
      "Database actions will be simulated until configured."
    );
  }

  // Create client
  supabaseInstance = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-anon-key");
  return supabaseInstance;
}
