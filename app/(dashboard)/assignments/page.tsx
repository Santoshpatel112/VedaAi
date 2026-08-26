"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, PlusCircle, Search, ArrowRight } from "lucide-react";

export default function AssignmentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const assignments = [
    {
      id: "asg_101",
      title: "Mid-Term Biology Assessment",
      class: "Grade 10 — Section A",
      dueDate: "Aug 28, 2026",
      status: "active",
      submissions: "28/32",
    },
    {
      id: "asg_102",
      title: "Cell Structure & Function Worksheet",
      class: "Grade 9 — Section B",
      dueDate: "Aug 25, 2026",
      status: "completed",
      submissions: "28/28",
    },
    {
      id: "asg_103",
      title: "Photosynthesis Lab Report",
      class: "Grade 10 — Section A",
      dueDate: "Sep 02, 2026",
      status: "active",
      submissions: "12/32",
    },
  ];

  const filtered = assignments.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.class.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (filter === "active") return a.status === "active";
    if (filter === "completed") return a.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] text-xs font-extrabold uppercase mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Assignments Overview</span>
          </div>
          <h1 className="text-2xl font-black text-[#21262C]">Assignments & Homework</h1>
          <p className="text-xs text-[#606266] mt-1">
            Create, track, and extract student answers for homework and class assignments.
          </p>
        </div>

        <Link
          href="/exams"
          className="px-5 py-3 rounded-2xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Assessment</span>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E2E2] rounded-2xl text-xs font-medium text-[#21262C] placeholder-[#8C8C8C] focus:outline-none focus:border-[#FF5500] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E2E2E2] shadow-xs">
          {(["all", "active", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-colors ${
                filter === tab
                  ? "bg-[#FF5500] text-white shadow-2xs"
                  : "text-[#606266] hover:bg-[#F6F6F6]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Table Card */}
      <div className="bg-white border border-[#E2E2E2] rounded-3xl overflow-hidden shadow-xs">
        <div className="divide-y divide-[#F0F0F0]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAFA] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#21262C]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#8C8C8C]">
                    {item.class} • Due: {item.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                <span className="text-xs font-bold text-[#606266] bg-[#F6F6F6] px-3 py-1 rounded-xl border border-[#E2E2E2]">
                  {item.submissions} Submissions
                </span>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${
                    item.status === "completed"
                      ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]"
                      : "bg-[#FFF3EE] text-[#C2410C] border-[#FFCCAA]"
                  }`}
                >
                  {item.status}
                </span>

                <Link
                  href="/exams"
                  className="px-3.5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Map Answers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
