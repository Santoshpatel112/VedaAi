"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Library, Search, FileText, ArrowRight, Sparkles } from "lucide-react";

export default function LibraryPage() {
  const [search, setSearch] = useState("");

  const items = [
    {
      id: "lib_01",
      title: "Biology Mid-Term Question Paper 2026",
      type: "Question Paper (PDF)",
      date: "Aug 26, 2026",
      questionsCount: 13,
    },
    {
      id: "lib_02",
      title: "Student Answer Sheet Sample — Biology",
      type: "Answer Sheet (PDF)",
      date: "Aug 26, 2026",
      questionsCount: 13,
    },
    {
      id: "lib_03",
      title: "Cellular Metabolism Rubric & Model Answers",
      type: "Answer Key (PDF)",
      date: "Aug 20, 2026",
      questionsCount: 10,
    },
  ];

  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] text-xs font-extrabold uppercase mb-2">
            <Library className="w-3.5 h-3.5" />
            <span>My Library</span>
          </div>
          <h1 className="text-2xl font-black text-[#21262C]">
            Assessment Documents & Templates
          </h1>
          <p className="text-xs text-[#606266] mt-1">
            Access past question papers, answer keys, and extracted assessment results.
          </p>
        </div>

        <Link
          href="/exams"
          className="px-5 py-3 rounded-2xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Extract New Document</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8C8C8C] absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search library documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E2E2] rounded-2xl text-xs font-medium text-[#21262C] placeholder-[#8C8C8C] focus:outline-none focus:border-[#FF5500] shadow-xs"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-[#E2E2E2] rounded-3xl p-6 shadow-xs hover:border-[#FFCCAA] transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[#21262C]">
                  {doc.title}
                </h3>
                <p className="text-xs text-[#8C8C8C]">{doc.type}</p>
              </div>

              <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#606266] font-medium">
                <span>Date: {doc.date}</span>
                <span className="font-bold text-[#FF5500]">
                  {doc.questionsCount} Qs
                </span>
              </div>
            </div>

            <Link
              href="/exams"
              className="mt-5 w-full py-2.5 rounded-xl bg-[#F6F6F6] hover:bg-[#EAEAEA] text-[#21262C] font-bold text-xs border border-[#E2E2E2] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Extraction</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8C8C8C]" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
