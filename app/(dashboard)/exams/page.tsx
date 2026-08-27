"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { FileUploadCard } from "@/components/upload/FileUploadCard";
import { UploadedFileCard } from "@/components/upload/UploadedFileCard";
import { createClient } from "@/utils/supabase/client";

const STORAGE_BUCKET = "assessment-files";
const hasStorageConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ExamsUploadPage() {
  const router = useRouter();
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [qpError, setQpError] = useState<string | null>(null);
  const [asError, setAsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canStartMapping = Boolean(questionPaper && answerSheet && !isSubmitting);

  const handleStartMapping = async (isDemo = false) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isDemo) {
        const res = await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demo: true }),
        });
        const data = await readApiResponse(res);
        if (!res.ok) {
          throw new Error(data.error || "Failed to start assessment extraction job.");
        }
        router.push(`/exams/${data.jobId}/processing`);
        return;
      } else {
        if (!questionPaper || !answerSheet) return;
        if (!hasStorageConfig && process.env.NODE_ENV !== "development") {
          throw new Error("Production file storage is not configured.");
        }

        if (!hasStorageConfig) {
          const formData = new FormData();
          formData.append("questionPaper", questionPaper);
          formData.append("answerSheet", answerSheet);
          const res = await fetch("/api/exams", { method: "POST", body: formData });
          const data = await readApiResponse(res);
          if (!res.ok) {
            throw new Error(data.error || "Failed to start assessment extraction job.");
          }
          router.push(`/exams/${data.jobId}/processing`);
          return;
        }

        const supabase = createClient();
        const uploadId = crypto.randomUUID();
        const files = [
          { file: questionPaper, key: "questionPaper" },
          { file: answerSheet, key: "answerSheet" },
        ];
        const uploadedPaths: Record<string, string> = {};

        try {
          for (const { file, key } of files) {
            const storagePath = `${uploadId}/${key}-${file.name}`;
            const { error } = await supabase.storage
              .from(STORAGE_BUCKET)
              .upload(storagePath, file, { upsert: false });
            if (error) throw new Error(`Unable to upload ${key}: ${error.message}`);
            uploadedPaths[key] = storagePath;
          }
        } catch (storageError) {
          if (
            process.env.NODE_ENV !== "development" ||
            !(storageError instanceof Error) ||
            !storageError.message.includes("Bucket not found")
          ) {
            if (uploadedPaths.questionPaper) {
              await supabase.storage.from(STORAGE_BUCKET).remove(Object.values(uploadedPaths));
            }
            throw storageError;
          }

          const formData = new FormData();
          formData.append("questionPaper", questionPaper);
          formData.append("answerSheet", answerSheet);
          const res = await fetch("/api/exams", { method: "POST", body: formData });
          const data = await readApiResponse(res);
          if (!res.ok) {
            throw new Error(data.error || "Failed to start assessment extraction job.");
          }
          router.push(`/exams/${data.jobId}/processing`);
          return;
        }

        const res = await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionPaperPath: uploadedPaths.questionPaper,
            answerSheetPath: uploadedPaths.answerSheet,
          }),
        });
        const data = await readApiResponse(res);
        if (!res.ok) {
          throw new Error(data.error || "Failed to start assessment extraction job.");
        }
        router.push(`/exams/${data.jobId}/processing`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  async function readApiResponse(
    res: Response
  ): Promise<{ error?: string; jobId?: string }> {
    const contentType = res.headers.get("content-type") ?? "";
    const responseText = (await res.text()).trim();
    console.info("POST /api/exams response", {
      status: res.status,
      contentType,
      body: responseText.slice(0, 500),
    });

    if (!contentType.toLowerCase().includes("application/json") || !responseText) {
      throw new Error(
        responseText || `Upload failed: server returned HTTP ${res.status}.`
      );
    }

    try {
      const data = JSON.parse(responseText) as { error?: string; jobId?: string };
      if (!res.ok) {
        throw new Error(data.error || `Upload failed: server returned HTTP ${res.status}.`);
      }
      if (!data.jobId) {
        throw new Error("Upload started but the server did not return a job ID.");
      }
      return data;
    } catch (error) {
      if (error instanceof Error && !error.message.includes("Unexpected token")) {
        throw error;
      }
      throw new Error(`Upload failed: server returned invalid JSON (HTTP ${res.status}).`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none">
      {/* Page Header */}
      <div className="bg-white border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] text-xs font-extrabold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assessment Extraction</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#21262C] tracking-tight">
            Upload Question Paper & Answer Sheet
          </h1>
          <p className="text-xs sm:text-sm text-[#606266] leading-relaxed">
            Upload printed question paper and handwritten student answer sheet. AI will automatically extract questions, detect student answers, and generate exact spatial highlighting.
          </p>
        </div>

        {/* Demo Assessment Showcase Button */}
        <div className="shrink-0">
          <button
            onClick={() => handleStartMapping(true)}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FFF3EE] hover:bg-[#FFE6D5] text-[#FF5500] border border-[#FFCCAA] font-bold text-xs shadow-2xs transition-all duration-150 group"
          >
            <PlayCircle className="w-4 h-4 text-[#FF5500] group-hover:scale-110 transition-transform" />
            <span>Try Demo Assessment</span>
          </button>
        </div>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Question Paper Zone */}
        {questionPaper ? (
          <UploadedFileCard
            label="Question Paper"
            file={questionPaper}
            onRemove={() => setQuestionPaper(null)}
          />
        ) : (
          <FileUploadCard
            title="Question Paper"
            subtitle="Upload printed test / exam question paper (PDF or Image)"
            onFileSelect={(file) => {
              setQuestionPaper(file);
              setQpError(null);
            }}
            error={qpError}
            disabled={isSubmitting}
          />
        )}

        {/* Answer Sheet Zone */}
        {answerSheet ? (
          <UploadedFileCard
            label="Student Answer Sheet"
            file={answerSheet}
            onRemove={() => setAnswerSheet(null)}
          />
        ) : (
          <FileUploadCard
            title="Answer Sheet"
            subtitle="Upload handwritten student answer sheet (PDF or Image)"
            onFileSelect={(file) => {
              setAnswerSheet(file);
              setAsError(null);
            }}
            error={asError}
            disabled={isSubmitting}
          />
        )}
      </div>

      {/* General Submit Error */}
      {submitError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
          {submitError}
        </div>
      )}

      {/* Start Mapping Action Button */}
      <div className="bg-white border border-[#E2E2E2] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#8C8C8C] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Files are encrypted and processed securely.</span>
        </div>

        <button
          onClick={() => handleStartMapping(false)}
          disabled={!canStartMapping}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
            canStartMapping
              ? "bg-[#FF5500] hover:bg-[#E04A00] text-white hover:shadow-lg active:scale-98"
              : "bg-[#E2E2E2] text-[#8C8C8C] cursor-not-allowed shadow-none"
          }`}
        >
          {isSubmitting ? (
            <span>Starting Mapping...</span>
          ) : (
            <>
              <span>Start Mapping</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
