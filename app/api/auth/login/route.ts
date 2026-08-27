import { NextRequest, NextResponse } from "next/server";
import { setSession, type UserSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Attempt real Supabase auth first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data?.user) {
          const sbUser = data.user;
          const user: UserSession = {
            id: sbUser.id,
            name:
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              email.split("@")[0].replace(/\./g, " "),
            email: sbUser.email ?? email,
            role: "teacher",
            school: sbUser.user_metadata?.school || undefined,
            department: sbUser.user_metadata?.department || undefined,
          };

          await setSession(user);
          return NextResponse.json({ success: true, user });
        }

        // Supabase returned an error — pass it to client
        if (error) {
          const isRateLimit = /rate limit|too many requests/i.test(error.message);
          const message = /email not confirmed/i.test(error.message)
            ? "Please confirm your email address before signing in. Check your inbox for the Supabase confirmation email."
            : isRateLimit
            ? "Supabase is temporarily rate-limiting login attempts. Wait and try again later."
            : error.message || "Invalid email or password.";

          return NextResponse.json(
            { error: message },
            { status: isRateLimit ? 429 : 401 }
          );
        }
      } catch (supabaseErr) {
        console.error("Supabase auth error:", supabaseErr);
        // Fall through to demo mode if Supabase is unavailable
      }
    }

    // Fallback: accept any credentials for demo/dev mode (only if no SUPABASE configured)
    if (!supabaseUrl || !supabaseKey) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters." },
          { status: 401 }
        );
      }

      const nameParts = email.split("@")[0].split(/[._-]/);
      const displayName = nameParts
        .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");

      const user: UserSession = {
        id: `usr_${Date.now()}`,
        name: displayName,
        email,
        role: "teacher",
      };

      await setSession(user);
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error during login." },
      { status: 500 }
    );
  }
}
