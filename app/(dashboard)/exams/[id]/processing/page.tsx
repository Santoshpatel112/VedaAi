"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProcessingScreen } from "@/components/processing/ProcessingScreen";
import type { ProcessingStageKey, StatusResponse } from "@/lib/types";

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [stage, setStage] = useState<ProcessingStageKey>("uploading");
  const [progress, setProgress] = useState(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/exams/${jobId}/status`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Processing job not found.");
          }
          return;
        }

        const data: StatusResponse = await res.json();
        if (!isMounted) return;

        if (data.status === "failed") {
          setError(data.error || "Processing failed during AI extraction.");
          clearInterval(interval);
          return;
        }

        setStage(data.stage);
        setProgress(data.progress);

        if (data.status === "complete") {
          clearInterval(interval);
          // Navigate to results screen after brief pause
          setTimeout(() => {
            router.push(`/exams/${jobId}/results`);
          }, 600);
        }
      } catch (err) {
        console.error("Polling status error:", err);
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId, router]);

  return (
    <ProcessingScreen
      stage={stage}
      progress={progress}
      error={error}
      onRetry={() => router.push("/exams")}
    />
  );
}
