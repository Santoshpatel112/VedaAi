"use client";

import React from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import { ProcessingSteps } from "./ProcessingSteps";
import type { ProcessingStageKey } from "@/lib/types";

interface ProcessingScreenProps {
  stage: ProcessingStageKey;
  progress: number;
  error?: string | null;
  onRetry?: () => void;
}

export function ProcessingScreen({
  stage,
  progress,
  error,
  onRetry,
}: ProcessingScreenProps) {
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-card max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#21262C] mb-2">
            Extraction Failed
          </h2>
          <p className="text-xs text-[#606266] mb-6 leading-relaxed bg-red-50/50 p-3 rounded-xl border border-red-100 font-mono text-left">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3 px-6 rounded-xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-bold text-sm shadow-md transition-all duration-150"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 select-none">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E2E2] shadow-card max-w-lg w-full flex flex-col items-center text-center animate-fade-in">
        {/* Sparkle Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF3EE] border border-[#FFCCAA] flex items-center justify-center text-[#FF5500] shadow-sm">
            <Sparkles className="w-10 h-10 sparkle-spin" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5500] rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-xs">
            ✦
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-1.5 justify-center mb-1">
          <span className="text-[#FF5500] text-lg font-bold">✦ ✦ ✦</span>
          <h2 className="text-xl font-black text-[#21262C] tracking-tight">
            Extracting...
          </h2>
        </div>
        <p className="text-xs text-[#8C8C8C] font-medium mb-6">
          This may take a while. AI is analyzing handwriting & spatial locations.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#F6F6F6] h-3 rounded-full overflow-hidden border border-[#E2E2E2] mb-3 relative">
          <div
            className="bg-gradient-to-r from-[#FF8844] to-[#FF5500] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
        <div className="w-full flex justify-between items-center text-xs font-bold text-[#606266] mb-4">
          <span>Processing Pipeline</span>
          <span className="text-[#FF5500]">{progress}%</span>
        </div>

        {/* Step List */}
        <ProcessingSteps currentStage={stage} progress={progress} />

        <p className="text-[11px] text-[#8C8C8C] italic">
          Deterministic Q-number matching + Semantic vector similarity
        </p>
      </div>
    </div>
  );
}
