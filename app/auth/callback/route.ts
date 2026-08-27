import { NextRequest, NextResponse } from "next/server";
import { setSession, type UserSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const tokenType = request.nextUrl.searchParams.get("type") || "signup";
  const redirectUrl = new URL("/login", request.url);

  if (!code && !tokenHash) {
    redirectUrl.searchParams.set(
      "error",
      "The confirmation link is missing or has expired."
    );
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      redirectUrl.searchParams.set(
        "error",
        "Supabase authentication is not configured."
      );
      return NextResponse.redirect(redirectUrl);
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: tokenType as "signup" | "email" | "recovery" | "invite",
        });

    if (error || !data.user) {
      redirectUrl.searchParams.set(
        "error",
        "This confirmation link is invalid or has expired."
      );
      return NextResponse.redirect(redirectUrl);
    }

    const user = data.user;
    const session: UserSession = {
      id: user.id,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Teacher",
      email: user.email || "",
      role: "teacher",
      school: user.user_metadata?.school || undefined,
      department: user.user_metadata?.department || undefined,
    };

    await setSession(session);
    return NextResponse.redirect(new URL("/exams", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    redirectUrl.searchParams.set(
      "error",
      "We could not complete email confirmation. Please try signing in."
    );
    return NextResponse.redirect(redirectUrl);
  }
}
