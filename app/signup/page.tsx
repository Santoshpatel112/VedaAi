"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [accountPending, setAccountPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setAccountPending(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.accountExists) {
          setAccountPending(true);
        }
        throw new Error(data.error || "Failed to create account.");
      }

      if (data.requiresEmailConfirmation) {
        setAccountPending(true);
        setNotice(`${data.message} Then return here and use Log In.`);
        setLoading(false);
        return;
      }

      router.push("/exams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendLoading || resendDisabled || !email) return;

    setError(null);
    setNotice(null);
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) setResendDisabled(true);
        throw new Error(data.error || "Unable to resend confirmation email.");
      }

      setNotice(data.message);
      setResendDisabled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend confirmation email.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-[#E2E2E2] rounded-3xl p-8 sm:p-10 shadow-card max-w-md w-full space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5500] flex items-center justify-center text-white font-black text-2xl shadow-sm">
            V
          </div>
          <h1 className="text-2xl font-black text-[#21262C] tracking-tight">
            Join Veda<span className="text-[#FF5500]">AI</span>
          </h1>
          <p className="text-xs text-[#606266]">
            Create your teacher account to start automated assessment mapping
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FFF3EE] border border-[#FFCCAA] text-[#C2410C] text-xs font-semibold">
            {error}
          </div>
        )}

        {notice && (
          <div className="p-3.5 rounded-xl bg-[#FFF3EE] border border-[#FFCCAA] text-[#C2410C] text-xs font-semibold">
            {notice}
          </div>
        )}

        {accountPending && (
          <div className="space-y-3 rounded-xl border border-[#FFCCAA] bg-[#FFF3EE] p-3.5">
            <p className="text-xs font-semibold text-[#C2410C]">
              Confirmation is pending for {email}. Check your inbox or spam folder.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || resendDisabled}
                className="text-xs font-black text-[#FF5500] underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendLoading
                  ? "Sending..."
                  : resendDisabled
                  ? "Email request sent"
                  : "Resend confirmation email"}
              </button>
              <Link href="/login" className="text-xs font-black text-[#21262C] underline">
                Go to Log In
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#606266] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
                placeholder="Santosh Patel"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#606266] mb-1.5">
              School Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || accountPending}
            className="w-full py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Teacher Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#F0F0F0] text-xs text-[#8C8C8C]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#FF5500] hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
