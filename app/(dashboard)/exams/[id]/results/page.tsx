"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResultsSummary } from "@/components/results/ResultsSummary";
import { QuestionList } from "@/components/questions/QuestionList";
import { AnswerSheetViewer } from "@/components/answer-sheet/AnswerSheetViewer";
import { MobileTabs } from "@/components/mobile/MobileTabs";
import type { ExamResults, Question, StudentAnswer, AnswerMapping } from "@/lib/types";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [results, setResults] = useState<ExamResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileTab, setMobileTab] = useState<"questions" | "answer-sheet">("questions");

  useEffect(() => {
    if (!jobId) return;

    fetch(`/api/exams/${jobId}/results`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load exam results.");
        }
        return res.json();
      })
      .then((data: ExamResults) => {
        setResults(data);
        if (data.questions.length > 0) {
          setSelectedQuestionId(data.questions[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Results fetch error:", err);
        setError(err instanceof Error ? err.message : "Error loading results");
        setLoading(false);
      });
  }, [jobId]);

  if (loading) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF3EE] border border-[#FFCCAA] flex items-center justify-center text-[#FF5500] animate-spin">
          ✦
        </div>
        <p className="text-xs font-bold text-[#606266]">Loading results...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="p-6 bg-white border border-red-200 rounded-3xl max-w-md text-center">
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/exams")}
            className="px-6 py-2.5 rounded-xl bg-[#FF5500] text-white font-bold text-xs"
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  const { questions, answers, mappings, answerSheetPageCount } = results;

  const selectedQuestion: Question | null =
    questions.find((q) => q.id === selectedQuestionId) ?? questions[0] ?? null;

  const mapping: AnswerMapping | null = selectedQuestion
    ? mappings.find((m) => m.questionId === selectedQuestion.id) ?? null
    : null;

  const selectedAnswer: StudentAnswer | null = mapping?.answerId
    ? answers.find((a) => a.id === mapping.answerId) ?? null
    : null;

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);

    // On mobile: auto-switch to Answer Sheet tab after selecting question so teacher sees highlight immediately
    if (window.innerWidth < 768) {
      setMobileTab("answer-sheet");
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Results Summary Bar */}
      <ResultsSummary results={results} />

      {/* Mobile Tab Switcher */}
      <MobileTabs
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        questionCount={questions.length}
      />

      {/* Main Content Area (Two-column Desktop / Tabbed Mobile) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
        {/* Left Column: Question List */}
        <div
          className={`md:col-span-5 lg:col-span-4 h-full min-h-0 ${
            mobileTab === "questions" ? "block" : "hidden md:block"
          }`}
        >
          <QuestionList
            questions={questions}
            mappings={mappings}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={handleSelectQuestion}
          />
        </div>

        {/* Right Column: Answer Sheet Viewer */}
        <div
          className={`md:col-span-7 lg:col-span-8 h-full min-h-0 ${
            mobileTab === "answer-sheet" ? "block" : "hidden md:block"
          }`}
        >
          <AnswerSheetViewer
            jobId={jobId}
            selectedQuestion={selectedQuestion}
            selectedAnswer={selectedAnswer}
            mapping={mapping}
            totalPages={answerSheetPageCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
