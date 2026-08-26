"use client";

import React from "react";
import { CheckCircle2, HelpCircle, AlertCircle, Award } from "lucide-react";
import type { ExamResults } from "@/lib/types";

interface ResultsSummaryProps {
  results: ExamResults;
}

export function ResultsSummary({ results }: ResultsSummaryProps) {
  const {
    totalQuestions,
    answeredCount,
    unansweredCount,
    uncertainCount,
    totalMarks,
    awardedMarks,
    gradingEnabled,
  } = results;

  return (
    <div className="bg-white border border-[#E2E2E2] rounded-2xl p-4 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-4 select-none">
      {/* Title */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="w-10 h-10 rounded-xl bg-[#FFF3EE] border border-[#FFCCAA] flex items-center justify-center text-[#FF5500] font-black text-lg">
          V
        </div>
        <div>
          <h1 className="font-black text-lg text-[#21262C] leading-none tracking-tight">
            Assessment Results
          </h1>
          <span className="text-xs text-[#8C8C8C] font-medium">
            AI Extraction & Hybrid Mapping Complete
          </span>
        </div>
      </div>

      {/* Stats Pills */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Total Questions */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F6F6F6] border border-[#E2E2E2]">
          <span className="text-xs text-[#606266] font-semibold">Total:</span>
          <span className="text-sm font-extrabold text-[#21262C]">
            {totalQuestions}
          </span>
        </div>

        {/* Answered / Mapped */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span className="text-xs text-[#166534] font-semibold">Answered:</span>
          <span className="text-sm font-extrabold text-[#15803D]">
            {answeredCount}
          </span>
        </div>

        {/* Unanswered */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F6F6F6] border border-[#E2E2E2]">
          <HelpCircle className="w-4 h-4 text-[#8C8C8C]" />
          <span className="text-xs text-[#606266] font-semibold">Unanswered:</span>
          <span className="text-sm font-extrabold text-[#21262C]">
            {unansweredCount}
          </span>
        </div>

        {/* Needs Review */}
        {uncertainCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF3EE] border border-[#FFCCAA]">
            <AlertCircle className="w-4 h-4 text-[#FF8844]" />
            <span className="text-xs text-[#9A3412] font-semibold">
              Needs Review:
            </span>
            <span className="text-sm font-extrabold text-[#C2410C]">
              {uncertainCount}
            </span>
          </div>
        )}

        {/* Optional Score */}
        {gradingEnabled && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FF5500] text-white shadow-2xs">
            <Award className="w-4 h-4" />
            <span className="text-xs font-semibold">Score:</span>
            <span className="text-sm font-black">
              {awardedMarks}/{totalMarks}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
