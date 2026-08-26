"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import type { Question, AnswerMapping } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  mapping: AnswerMapping;
  isSelected: boolean;
  onSelect: () => void;
}

export function QuestionCard({
  question,
  mapping,
  isSelected,
  onSelect,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isMatched = mapping.status === "matched";
  const isUnanswered = mapping.status === "unanswered";
  const isUncertain = mapping.status === "uncertain";

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-150 cursor-pointer select-none ${
        isSelected
          ? "border-[#FF5500] bg-[#FFF8F5] shadow-xs border-l-4 border-l-[#FF5500]"
          : "border-[#E2E2E2] bg-white hover:border-[#FFCCAA] hover:bg-[#FAFAFA]"
      }`}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        {/* Number Badge & Question Text */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Question Number Badge */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
              isMatched
                ? "bg-[#22C55E] text-white"
                : isUncertain
                ? "bg-[#FF8844] text-white"
                : "bg-[#F6F6F6] text-[#8C8C8C] border border-[#E2E2E2]"
            }`}
          >
            {isMatched ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isUncertain ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <HelpCircle className="w-4 h-4" />
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-extrabold text-sm text-[#21262C]">
                Q{question.number}
              </span>
              {question.marks && (
                <span className="text-[11px] font-semibold text-[#606266] bg-[#F6F6F6] px-2 py-0.5 rounded-md border border-[#E2E2E2]">
                  {question.marks} marks
                </span>
              )}
              {mapping.deterministic && (
                <span className="text-[10px] font-bold text-[#FF5500] bg-[#FFF3EE] px-1.5 py-0.5 rounded-md border border-[#FFCCAA]">
                  Exact # Match
                </span>
              )}
              {!mapping.deterministic && mapping.semanticScore !== undefined && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200">
                  Semantic ({Math.round(mapping.semanticScore * 100)}%)
                </span>
              )}
            </div>

            <p className="text-xs text-[#21262C] font-medium leading-relaxed line-clamp-2">
              {question.text}
            </p>
          </div>
        </div>

        {/* Status Indicator / Expand toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {isMatched && (
            <span className="text-xs font-bold text-[#22C55E] bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
              Mapped
            </span>
          )}
          {isUnanswered && (
            <span className="text-xs font-semibold text-[#8C8C8C] bg-[#F6F6F6] px-2.5 py-1 rounded-full border border-[#E2E2E2]">
              Unanswered
            </span>
          )}
          {isUncertain && (
            <span className="text-xs font-bold text-[#FF8844] bg-[#FFF3EE] px-2.5 py-1 rounded-full border border-[#FFCCAA]">
              Review
            </span>
          )}

          {mapping.feedback && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1 text-[#8C8C8C] hover:text-[#21262C] transition-transform"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* AI Feedback Accordion (Optional Grading) */}
      {expanded && mapping.feedback && (
        <div className="px-4 pb-4 pt-1 border-t border-[#F0F0F0] mt-1 bg-[#FAFAFA] rounded-b-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5500] mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Feedback</span>
            {mapping.score !== undefined && mapping.maxScore !== undefined && (
              <span className="ml-auto text-xs font-extrabold text-[#21262C] bg-white px-2 py-0.5 rounded-md border border-[#E2E2E2]">
                Score: {mapping.score}/{mapping.maxScore}
              </span>
            )}
          </div>
          <p className="text-xs text-[#606266] leading-relaxed italic bg-white p-2.5 rounded-xl border border-[#E2E2E2]">
            &quot;{mapping.feedback}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
