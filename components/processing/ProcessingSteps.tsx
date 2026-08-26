"use client";

import React from "react";
import { Check, Loader2, Circle } from "lucide-react";
import { PROCESSING_STAGES, type ProcessingStageKey } from "@/lib/types";

interface ProcessingStepsProps {
  currentStage: ProcessingStageKey;
  progress: number;
}

export function ProcessingSteps({ currentStage, progress }: ProcessingStepsProps) {
  const currentIndex = PROCESSING_STAGES.findIndex(
    (s) => s.key === currentStage
  );

  return (
    <div className="w-full max-w-md space-y-2.5 my-6 text-left">
      {PROCESSING_STAGES.map((stage, idx) => {
        const isDone = idx < currentIndex || progress === 100;
        const isCurrent = idx === currentIndex && progress < 100;

        return (
          <div
            key={stage.key}
            className={`flex items-center gap-3 text-sm py-1 transition-all duration-200 ${
              isDone
                ? "text-[#21262C] font-semibold"
                : isCurrent
                ? "text-[#FF5500] font-bold"
                : "text-[#8C8C8C] font-normal opacity-60"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                isDone
                  ? "bg-[#22C55E] text-white checkmark-pop"
                  : isCurrent
                  ? "bg-[#FFF3EE] text-[#FF5500] border-2 border-[#FF5500]"
                  : "bg-[#F6F6F6] text-[#C4C4C4] border border-[#E2E2E2]"
              }`}
            >
              {isDone ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : isCurrent ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Circle className="w-2 h-2 fill-current opacity-40" />
              )}
            </div>

            <span className="flex-1 truncate">{stage.label}</span>

            {isDone && (
              <span className="text-xs font-bold text-[#22C55E]">✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
