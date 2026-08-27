import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase authentication is not configured." },
        { status: 503 }
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      const isRateLimit = /rate limit|too many requests/i.test(error.message);
      return NextResponse.json(
        {
          error: isRateLimit
            ? "Supabase is rate-limiting confirmation emails. Check your inbox or spam folder and try again later."
            : error.message || "Unable to resend the confirmation email.",
        },
        { status: isRateLimit ? 429 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A new confirmation email was requested. Check your inbox and spam folder.",
    });
  } catch (error) {
    console.error("Supabase resend error:", error);
    return NextResponse.json(
      { error: "Unable to contact Supabase. Check your connection and try again." },
      { status: 503 }
    );
  }
}