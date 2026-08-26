"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import type { Question, AnswerMapping } from "@/lib/types";

interface QuestionListProps {
  questions: Question[];
  mappings: AnswerMapping[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  onViewQuestion?: (questionId: string) => void;
}

export function QuestionList({
  questions,
  mappings,
  selectedQuestionId,
  onSelectQuestion,
  onViewQuestion,
}: QuestionListProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "mapped" | "unanswered" | "uncertain">("all");

  const mappingMap = new Map(mappings.map((m) => [m.questionId, m]));

  const filteredQuestions = questions.filter((q) => {
    const mapping = mappingMap.get(q.id);
    const matchesSearch =
      q.number.toLowerCase().includes(search.toLowerCase()) ||
      q.text.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "mapped") return mapping?.status === "matched";
    if (filterStatus === "unanswered") return mapping?.status === "unanswered";
    if (filterStatus === "uncertain") return mapping?.status === "uncertain";

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E2E2E2] shadow-xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-[#F0F0F0] space-y-3 bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base text-[#21262C] tracking-tight">
            Extracted Questions
          </h2>
          <span className="text-xs font-bold text-[#606266] bg-white px-2.5 py-1 rounded-lg border border-[#E2E2E2]">
            {filteredQuestions.length} of {questions.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] placeholder-[#8C8C8C] focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {(
            [
              { key: "all", label: "All" },
              { key: "mapped", label: "Mapped" },
              { key: "uncertain", label: "Needs Review" },
              { key: "unanswered", label: "Unanswered" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === tab.key
                  ? "bg-[#FF5500] text-white shadow-2xs"
                  : "bg-white text-[#606266] hover:bg-[#F6F6F6] border border-[#E2E2E2]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Questions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="py-12 text-center text-[#8C8C8C] text-xs font-medium">
            No questions match your filter.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const mapping = mappingMap.get(q.id) ?? {
              questionId: q.id,
              status: "unanswered" as const,
              confidence: 0,
              deterministic: false,
            };

            return (
              <QuestionCard
                key={q.id}
                question={q}
                mapping={mapping}
                isSelected={selectedQuestionId === q.id}
                onSelect={() => onSelectQuestion(q.id)}
                onViewAnswer={onViewQuestion ? () => onViewQuestion(q.id) : undefined}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

