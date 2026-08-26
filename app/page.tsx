import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  Target,
  BrainCircuit,
  PhoneCall,
} from "lucide-react";

/**
 * Public landing page — Server Component.
 * If the user is already authenticated, redirect them straight to the dashboard.
 */
export default async function LandingPage() {
  const session = await getSession();

  // Logged-in users go directly to the dashboard
  if (session) {
    redirect("/exams");
  }

  return (
    <div className="min-h-screen bg-[#F0F5FA] text-[#21262C] font-sans antialiased select-none">
      {/* ═══════════════════════════════════════════════════════
          PUBLIC NAVBAR — No auth UI, only Contact Us + Teacher Login
          ═══════════════════════════════════════════════════════ */}
      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#E2E2E2] px-5 sm:px-10 lg:px-14 flex items-center justify-between sticky top-0 z-50 shadow-2xs">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#FF5500] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform duration-150">
            V
          </div>
          <span className="font-black text-xl text-[#21262C] tracking-tight">
            Veda<span className="text-[#FF5500]">AI</span>
          </span>
        </Link>

        {/* Center nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-[#606266]">
          <Link
            href="#features"
            className="text-[#FF5500] font-black hover:opacity-80 transition-opacity"
          >
            Home
          </Link>
          <Link href="#solutions" className="hover:text-[#21262C] transition-colors">
            Solutions
          </Link>
          <Link href="#product" className="hover:text-[#21262C] transition-colors">
            Product
          </Link>
          <Link href="#company" className="hover:text-[#21262C] transition-colors">
            Company
          </Link>
          <Link href="#resources" className="hover:text-[#21262C] transition-colors">
            Resources
          </Link>
        </nav>

        {/* RIGHT: Only Contact Us + Teacher Login →  */}
        <div className="flex items-center gap-2.5">
          <Link
            href="mailto:hello@myvedaai.com"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#21262C] hover:bg-black text-white font-bold text-xs shadow-xs transition-all duration-150 active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5 opacity-70" />
            <span>Contact Us</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF5500] hover:bg-[#E04A00] active:bg-[#CC3D00] text-white font-bold text-xs shadow-md transition-all duration-150 active:scale-95 hover:shadow-[0_4px_16px_rgba(255,85,0,0.35)]"
          >
            <span>Teacher Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section
        id="features"
        className="pt-16 pb-24 px-5 sm:px-10 lg:px-14 max-w-6xl mx-auto text-center space-y-8"
      >
        {/* IIM Bangalore Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E2E2] shadow-xs text-xs font-bold text-[#606266] mx-auto animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
          <span>🏫 Incubated at IIM Bangalore</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-[3.5rem] lg:text-6xl font-black text-[#21262C] tracking-tight leading-[1.12] max-w-4xl mx-auto animate-fade-in">
          AI Academic Assessment &amp;{" "}
          <span className="bg-[#FFE6D5] text-[#FF5500] px-4 py-1 rounded-2xl inline-block mt-2">
            Intelligence Platform
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#606266] font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in">
          VedaAI helps educational institutions elevate student performance, help
          teachers become more effective, and increase academic results with
          automated handwritten answer mapping and spatial intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 animate-fade-in">
          {/* Primary: Free for Teachers → /login */}
          <Link
            href="/login"
            className="group px-8 py-4 rounded-full bg-[#21262C] hover:bg-black active:bg-black text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
          >
            <span>Free for Teachers</span>
            <ArrowRight className="w-4 h-4 text-[#FF5500] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Secondary: Try Assessment Extractor → /login (protected) */}
          <Link
            href="/login"
            className="group px-8 py-4 rounded-full bg-white hover:bg-[#FAFAFA] active:bg-[#F5F5F5] text-[#21262C] border border-[#E2E2E2] hover:border-[#FFCCAA] font-black text-sm shadow-xs hover:shadow-md transition-all duration-150 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF5500] group-hover:animate-spin" />
            <span>Try Assessment Extractor</span>
          </Link>
        </div>

        {/* ── Product Preview Card ── */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E2E2E2] shadow-2xl overflow-hidden">
            <div className="bg-[#F6F6F6] rounded-2xl p-5 sm:p-6 border border-[#E2E2E2] text-left space-y-4">
              {/* Mini dashboard header */}
              <div className="flex items-center justify-between border-b border-[#E2E2E2] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5500] text-white flex items-center justify-center font-bold text-xs">
                    V
                  </div>
                  <span className="font-extrabold text-sm text-[#21262C]">
                    Exams &gt; Assessment Extraction — Physics (042)
                  </span>
                </div>
                <span className="text-xs font-bold text-[#22C55E] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#BBF7D0]">
                  ✓ 32 Questions Mapped
                </span>
              </div>

              {/* Preview Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                {/* Left: Question List */}
                <div className="md:col-span-5 bg-white p-4 rounded-xl border border-[#E2E2E2] space-y-2">
                  <h4 className="font-extrabold text-xs text-[#21262C] mb-2">
                    Extracted Questions (Physics 042)
                  </h4>
                  <div className="p-2.5 rounded-lg bg-[#FFF8F5] border-l-[3px] border-[#FF5500] text-xs">
                    <span className="font-bold text-[#FF5500]">
                      Q1 (1 mark)
                    </span>
                    <p className="text-[11px] text-[#606266] truncate mt-0.5">
                      A metal sheet is inserted between parallel plates of a capacitor...
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E2E2E2] text-xs">
                    <span className="font-bold text-[#21262C]">
                      Q2 (1 mark)
                    </span>
                    <p className="text-[11px] text-[#8C8C8C] truncate mt-0.5">
                      The electric field at a point in a region is given by E = A/r^3...
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E2E2E2] text-xs">
                    <span className="font-bold text-[#21262C]">
                      Q17 (2 marks)
                    </span>
                    <p className="text-[11px] text-[#8C8C8C] truncate mt-0.5">
                      The threshold frequency for a given metal is 3.6 × 10^14 Hz...
                    </p>
                  </div>
                </div>

                {/* Right: Highlighted Answer Sheet */}
                <div className="md:col-span-7 bg-white p-4 rounded-xl border border-[#E2E2E2] relative min-h-[180px] flex items-center justify-center">
                  <div className="w-full h-full border-2 border-dashed border-[#FF5500] bg-[#FFF8F5]/80 rounded-lg p-4 relative">
                    <div className="absolute -top-3 left-3 bg-[#FF5500] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      🎯 Highlighted Answer: Q17
                    </div>
                    <p className="text-xs font-serif text-[#21262C] leading-relaxed italic">
                      &quot;Given f0 = 3.6 × 10^14 Hz, f = 6.8 × 10^14 Hz. Cut-off potential V0 = h(f - f0)/e = 1.326 V.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section
        id="product"
        className="py-20 bg-white border-t border-[#E2E2E2] px-5 sm:px-10 lg:px-14"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black text-[#FF5500] uppercase tracking-wider bg-[#FFF3EE] px-3 py-1 rounded-full border border-[#FFCCAA]">
              Complete End-To-End Workflow
            </span>
            <h2 className="text-3xl font-black text-[#21262C]">
              How VedaAI Extraction Works
            </h2>
            <p className="text-xs sm:text-sm text-[#606266]">
              From raw handwritten PDF to exact bounding-box answer highlighting
              in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Upload Papers",
                desc: "Teacher uploads Question Paper PDF and Student Handwritten Answer Sheet.",
                icon: UploadCloud,
              },
              {
                step: "02",
                title: "Document Parsing",
                desc: "Extracts printed questions and reads handwritten student answers with spatial coordinates.",
                icon: BrainCircuit,
              },
              {
                step: "03",
                title: "Hybrid Semantic Mapping",
                desc: "Combines question number detection with embeddings & cosine similarity.",
                icon: Target,
              },
              {
                step: "04",
                title: "Spatial Highlighting",
                desc: "Clicking any question immediately highlights the exact answer region on the document viewer.",
                icon: CheckCircle2,
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FAFAFA] border border-[#E2E2E2] rounded-3xl p-6 hover:border-[#FFCCAA] hover:bg-white hover:shadow-md transition-all duration-200 space-y-3 relative group cursor-default"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-[#FF5500]/20 absolute top-4 right-6 group-hover:text-[#FF5500]/40 transition-colors">
                    {s.step}
                  </span>
                  <h3 className="font-extrabold text-base text-[#21262C]">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#606266] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BOTTOM CTA BANNER
          ═══════════════════════════════════════════════════════ */}
      <section
        id="solutions"
        className="py-16 px-5 sm:px-10 lg:px-14 bg-[#21262C]"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to transform how you grade?
          </h2>
          <p className="text-sm text-[#8C8C8C] max-w-xl mx-auto">
            Join thousands of teachers using VedaAI to save hours on manual
            assessment. Free for teachers, always.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF5500] hover:bg-[#E04A00] active:bg-[#CC3D00] text-white font-black text-sm shadow-xl hover:shadow-[0_8px_32px_rgba(255,85,0,0.45)] hover:scale-[1.02] transition-all duration-150"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="py-8 bg-[#1A1E23] text-white text-center text-xs border-t border-[#333] space-y-2">
        <p>© 2026 VedaAI Inc. All rights reserved. Incubated at IIM Bangalore.</p>
        <p className="text-[#666]">
          AI Academic Assessment &amp; Intelligence Platform for Teachers &amp; Schools.
        </p>
      </footer>
    </div>
  );
}
