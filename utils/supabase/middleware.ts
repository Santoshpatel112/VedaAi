import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/home",
  "/classroom",
  "/assignments",
  "/exams",
  "/library",
  "/settings",
];

// Routes that authenticated users should NOT see (redirect to dashboard)
const AUTH_ONLY_ROUTES = ["/login", "/signup"];

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const pathname = request.nextUrl.pathname;

  // Check custom veda_session cookie (our own auth system)
  const vedaSessionCookie = request.cookies.get("veda_session")?.value;
  let hasVedaSession = false;

  if (vedaSessionCookie) {
    try {
      const parsed = JSON.parse(
        Buffer.from(vedaSessionCookie, "base64").toString("utf-8")
      );
      hasVedaSession = !!(parsed?.id && parsed?.email);
    } catch {
      hasVedaSession = false;
    }
  }

  // Attempt Supabase session refresh (if configured)
  let hasSupabaseSession = false;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      hasSupabaseSession = !!user;
    } catch {
      // Supabase not configured or network error — fall through to veda_session
    }
  }

  const isAuthenticated = hasSupabaseSession || hasVedaSession;

  // 1. Protect private routes — redirect unauthenticated to /login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve the original destination for post-login redirect
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Redirect already-authenticated users away from login/signup → dashboard
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isAuthOnlyRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/exams";
    url.searchParams.delete("from");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};
