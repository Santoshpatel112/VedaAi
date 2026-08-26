"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckSquare,
  GraduationCap,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#FFF3EE] border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] text-xs font-extrabold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, Teacher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#21262C] tracking-tight">
            VedaAI Teacher Toolkit Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#606266] leading-relaxed">
            Automate handwritten answer mapping, track classroom performance, and deliver instant AI-assisted student feedback.
          </p>
        </div>

        <Link
          href="/exams"
          className="px-6 py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all group shrink-0"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span>New Assessment Extraction</span>
        </Link>
      </div>

      {/* Overview Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Assessments",
            value: "24",
            change: "+12% this month",
            icon: CheckSquare,
            color: "text-[#FF5500]",
            bg: "bg-[#FFF3EE]",
            border: "border-[#FFCCAA]",
          },
          {
            title: "Classrooms Active",
            value: "4 Classes",
            change: "128 Students",
            icon: GraduationCap,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-200",
          },
          {
            title: "Answers Processed",
            value: "1,420",
            change: "98.4% AI Accuracy",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
          },
          {
            title: "Time Saved",
            value: "18.5 hrs",
            change: "Estimated this week",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-200",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white border border-[#E2E2E2] rounded-2xl p-5 shadow-xs hover:border-[#FFCCAA] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#8C8C8C]">
                  {stat.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} border ${stat.border} flex items-center justify-center`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#21262C]">{stat.value}</p>
              <p className="text-[11px] font-semibold text-[#606266] mt-1">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Modules: Recent Assessments & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Assessments List */}
        <div className="lg:col-span-8 bg-white border border-[#E2E2E2] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-[#21262C]">
                Recent Assessments
              </h2>
              <p className="text-xs text-[#8C8C8C]">
                Latest question paper & answer sheet extractions
              </p>
            </div>

            <Link
              href="/exams"
              className="text-xs font-bold text-[#FF5500] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#F0F0F0]">
            {[
              {
                title: "Mid-Term Biology Exam 2026",
                class: "Grade 10 — Section A",
                questions: 13,
                date: "Today, 11:30 AM",
                status: "Complete",
                score: "42/50",
              },
              {
                title: "Cellular Structure Practice Test",
                class: "Grade 9 — Section B",
                questions: 10,
                date: "Yesterday",
                status: "Complete",
                score: "38/40",
              },
              {
                title: "Photosynthesis & Respiration Quiz",
                class: "Grade 10 — Section A",
                questions: 8,
                date: "Aug 24, 2026",
                status: "Complete",
                score: "28/30",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#FAFAFA] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] flex items-center justify-center font-bold text-xs shrink-0">
                    Q{item.questions}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#21262C]">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#8C8C8C]">
                      {item.class} • {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-[#22C55E] bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
                    {item.status}
                  </span>
                  <Link
                    href="/exams"
                    className="p-1.5 rounded-lg text-[#606266] hover:bg-[#F6F6F6]"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tools & Toolkit Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E2E2E2] rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="font-extrabold text-base text-[#21262C]">
              Teacher AI Toolkit
            </h2>

            <div className="space-y-3">
              <Link
                href="/exams"
                className="p-3.5 rounded-2xl bg-[#FFF8F5] border border-[#FFCCAA] flex items-center gap-3 hover:bg-[#FFF3EE] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#21262C]">
                    Assessment Extraction
                  </h3>
                  <p className="text-[11px] text-[#606266]">
                    Map handwritten answers to questions
                  </p>
                </div>
              </Link>

              <Link
                href="/classroom"
                className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E2E2E2] flex items-center gap-3 hover:bg-[#F6F6F6] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#21262C]">
                    Classroom Analytics
                  </h3>
                  <p className="text-[11px] text-[#606266]">
                    Track student progress & grades
                  </p>
                </div>
              </Link>

              <Link
                href="/assignments"
                className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E2E2E2] flex items-center gap-3 hover:bg-[#F6F6F6] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#21262C]">
                    Assignment Hub
                  </h3>
                  <p className="text-[11px] text-[#606266]">
                    Manage active homework & tests
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
