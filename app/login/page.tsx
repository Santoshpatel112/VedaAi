"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/exams";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(0);

  useEffect(() => {
    if (retrySeconds <= 0) return;

    const timer = window.setInterval(() => {
      setRetrySeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retrySeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retrySeconds > 0) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRetrySeconds(60);
        }
        throw new Error(data.error || "Failed to log in. Check your credentials.");
      }

      // Redirect to the originally intended page (or dashboard)
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F0F5FA] flex items-center justify-center p-4 select-none">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FF5500]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#FF5500]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white border border-[#E2E2E2] rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full space-y-7 animate-fade-in">
        {/* Logo + Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5500] flex items-center justify-center text-white font-black text-2xl shadow-sm group-hover:scale-105 transition-transform duration-150">
              V
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#21262C] tracking-tight">
              Veda<span className="text-[#FF5500]">AI</span> Teacher Portal
            </h1>
            <p className="text-xs text-[#606266]">
              Sign in to access your AI assessment toolkit
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EE] border border-[#FFCCAA] text-[10px] font-bold text-[#FF5500]">
            <Sparkles className="w-3 h-3" />
            Free for Teachers
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold animate-fade-in">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#606266] mb-1.5">
              Teacher Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-3" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/10 transition-all"
                placeholder="teacher@school.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#606266] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-3" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/10 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading || retrySeconds > 0}
            className="w-full py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#E04A00] active:bg-[#CC3D00] text-white font-black text-sm shadow-md hover:shadow-lg hover:shadow-[#FF5500]/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : retrySeconds > 0 ? (
              <span>Try again in {retrySeconds}s</span>
            ) : (
              <>
                <span>Sign In to Teacher Toolkit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center pt-1 border-t border-[#F0F0F0] text-xs text-[#8C8C8C] space-y-2">
          <p>
            Don&apos;t have a teacher account?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#FF5500] hover:underline"
            >
              Create Account
            </Link>
          </p>
          <p>
            <Link
              href="/"
              className="text-[#8C8C8C] hover:text-[#606266] transition-colors"
            >
              ← Back to VedaAI Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F5FA] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

