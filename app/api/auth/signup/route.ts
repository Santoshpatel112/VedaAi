import { NextRequest, NextResponse } from "next/server";
import { setSession, type UserSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, school, department } =
      await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Attempt real Supabase signup first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              school: school || undefined,
              department: department || undefined,
            },
          },
        });

        if (!error && data?.user && data.session) {
          const user: UserSession = {
            id: data.user.id,
            name,
            email,
            role: "teacher",
            school: school || undefined,
            department: department || undefined,
          };

          await setSession(user);
          return NextResponse.json({ success: true, user });
        }

        if (!error && data?.user && !data.session) {
          return NextResponse.json({
            success: true,
            requiresEmailConfirmation: true,
            message:
              "Account created. Please confirm your email before signing in.",
          });
        }

        if (error) {
          if (/rate limit|too many requests/i.test(error.message)) {
            return NextResponse.json(
              {
                error:
                  "Supabase is temporarily limiting confirmation emails. If this account is already confirmed, use Log In instead. Otherwise, wait a few minutes and check your inbox or spam folder before trying again.",
              },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: error.message || "Signup failed. Please try again." },
            { status: 400 }
          );
        }
      } catch (supabaseErr) {
        console.error("Supabase signup error:", supabaseErr);
      }
    }

    // Fallback: local session for dev/demo
    if (!supabaseUrl || !supabaseKey) {
      const user: UserSession = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: "teacher",
        school: school || undefined,
        department: department || undefined,
      };

      await setSession(user);
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal server error during signup." },
      { status: 500 }
    );
  }
}
