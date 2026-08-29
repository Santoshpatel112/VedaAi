import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Treat placeholder / unset values as missing so the safe fallback is used
const isValidServiceKey =
  supabaseServiceKey &&
  supabaseServiceKey !== "your_supabase_service_role_key_here" &&
  supabaseServiceKey.startsWith("eyJ");

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing user sessions.
        }
      },
    },
  });
};

/**
 * Create a Supabase client with service role key for server-side admin operations
 * Use this for operations that need elevated privileges like file management
 */
export const createServiceClient = () => {
  if (!isValidServiceKey) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY is not configured or is a placeholder — using publishable key. " +
      "Set a real service role key in Vercel environment variables for storage download to work."
    );
    return createSupabaseClient(supabaseUrl, supabaseKey);
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
