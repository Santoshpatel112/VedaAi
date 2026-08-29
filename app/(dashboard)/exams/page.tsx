"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { FileUploadCard } from "@/components/upload/FileUploadCard";
import { UploadedFileCard } from "@/components/upload/UploadedFileCard";
import { createClient } from "@/utils/supabase/client";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "assessment-files";
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
          if (!res.ok) throw new Error(data.error || "Failed to start assessment extraction job.");
          router.push(`/exams/${data.jobId}/processing`);
          return;
        }

        const supabase = createClient();
        const uploadId = crypto.randomUUID();
        const uploadedPaths: Record<string, string> = {};
        try {
          for (const [file, key] of [
            [questionPaper, "questionPaper"],
            [answerSheet, "answerSheet"],
          ] as const) {
            const storagePath = `${uploadId}/${key}-${file.name}`;
            const { error } = await supabase.storage
              .from(STORAGE_BUCKET)
              .upload(storagePath, file, { upsert: false });
            if (error) throw new Error(`Unable to upload ${key}: ${error.message}`);
            uploadedPaths[key] = storagePath;
          }
        } catch (error) {
          // If Supabase Storage is unavailable or the bucket is missing/misconfigured,
          // fall back to sending files directly via the multipart route.
          // This fallback applies in ALL environments (dev and production).
          const isStorageError =
            error instanceof Error &&
            (error.message.includes("Bucket not found") ||
              error.message.toLowerCase().includes("storage") ||
              error.message.toLowerCase().includes("bucket"));

          if (isStorageError) {
            console.warn("Supabase Storage unavailable, falling back to direct upload:", error);
            // Best-effort cleanup of any partial uploads
            if (Object.keys(uploadedPaths).length > 0) {
              await supabase.storage
                .from(STORAGE_BUCKET)
                .remove(Object.values(uploadedPaths))
                .catch(() => {});
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

          // Non-storage error — clean up any partial uploads and rethrow
          if (Object.keys(uploadedPaths).length > 0) {
            await supabase.storage
              .from(STORAGE_BUCKET)
              .remove(Object.values(uploadedPaths))
              .catch(() => {});
          }
          throw error;
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
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-start pt-12 pb-10 px-4 select-none">
      <div className="w-full max-w-[880px]">

        {/* ── Page title — Figma exact match ── */}
        <div className="text-center mb-3">
          <h1 className="text-[32px] leading-tight tracking-tight mb-2">
            <span className="font-normal text-[#1A1A1A]">Upload </span>
            <span className="font-black text-[#FF5500]">Question Paper & Answer Sheets</span>
          </h1>
          <p className="text-sm text-[#666666] font-normal">Upload both files to get started</p>
        </div>

        {/* ── Avatar with orbiting dots — Figma exact ── */}
        <div className="flex justify-center mb-10">
          <div className="relative w-[110px] h-[110px]">
            {/* Pink/coral gradient background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFB8A0] via-[#FFCBB8] to-[#FFD8C8] opacity-30 blur-2xl" />
            {/* Avatar */}
            <div className="relative w-[110px] h-[110px] rounded-full bg-gradient-to-br from-[#FFB8A0] to-[#FFD8C8] border-[3px] border-white shadow-md flex items-center justify-center overflow-hidden">
              <span className="text-[52px] select-none">👩‍🏫</span>
            </div>
            {/* Orbiting orange dots */}
            <span className="absolute top-[-2px] right-[22px] w-3 h-3 rounded-full bg-[#FF5500] border-[2.5px] border-white shadow-sm" />
            <span className="absolute top-[24px] right-[2px] w-2.5 h-2.5 rounded-full bg-[#FF5500] border-[2px] border-white shadow-sm" />
            <span className="absolute bottom-[16px] right-[2px] w-2 h-2 rounded-full bg-[#FF7733] border-[1.5px] border-white" />
            <span className="absolute bottom-[-2px] left-[24px] w-2.5 h-2.5 rounded-full bg-[#FF5500] border-[2px] border-white shadow-sm" />
            <span className="absolute top-[26px] left-[2px] w-2 h-2 rounded-full bg-[#FF7733] border-[1.5px] border-white" />
          </div>
        </div>

        {/* ── Single white container — Figma exact ── */}
        <div className="bg-white rounded-[24px] border-[2.5px] border-dashed border-[#D5D5D5] p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Question Paper */}
            {questionPaper ? (
              <UploadedFileCard
                label="Question Paper"
                file={questionPaper}
                onRemove={() => setQuestionPaper(null)}
              />
            ) : (
              <FileUploadCard
                title="Question Paper"
                subtitle="PDF, PNG, JPG (up to 20MB)"
                onFileSelect={(file) => {
                  setQuestionPaper(file);
                  setQpError(null);
                }}
                error={qpError}
                disabled={isSubmitting}
              />
            )}

            {/* Answer Sheet */}
            {answerSheet ? (
              <UploadedFileCard
                label="Answer Sheet"
                file={answerSheet}
                onRemove={() => setAnswerSheet(null)}
              />
            ) : (
              <FileUploadCard
                title="Answer Sheet"
                subtitle="PDF, PNG, JPG (up to 20MB)"
                onFileSelect={(file) => {
                  setAnswerSheet(file);
                  setAsError(null);
                }}
                error={asError}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
            {submitError}
          </div>
        )}

        {/* ── Start Mapping button + caption — Figma exact ── */}
        <div className="flex flex-col items-center gap-2.5 mt-7">
          <button
            onClick={() => handleStartMapping(false)}
            disabled={!canStartMapping}
            className={`px-9 py-3 rounded-full font-semibold text-[15px] flex items-center gap-2.5 transition-all duration-150 ${
              canStartMapping
                ? "bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white shadow-lg"
                : "bg-[#E5E5E5] text-[#AAAAAA] cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Starting…</span>
              </>
            ) : (
              <>
                <span>Start Mapping</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11.5px] text-[#999999] text-center mt-0.5 font-normal">
            Once both files are uploaded, you&apos;ll able to map answers with questions
          </p>

          {/* Demo button - hidden but functional */}
          <button
            onClick={() => handleStartMapping(true)}
            disabled={isSubmitting}
            className="text-xs text-[#AAAAAA] hover:text-[#FF5500] transition-colors underline underline-offset-2 mt-1 disabled:opacity-50"
          >
            Or try a Demo Assessment
          </button>
        </div>

      </div>
    </div>
  );
}
