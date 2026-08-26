"use client";

import React from "react";
import type { AnswerRegion } from "@/lib/types";

interface HighlightOverlayProps {
  region: AnswerRegion;
  questionNumber?: string;
  isMultiPage?: boolean;
}

export function HighlightOverlay({
  region,
  questionNumber,
  isMultiPage = false,
}: HighlightOverlayProps) {
  const { bbox } = region;

  // Convert normalized 0-1 coordinates to percentage CSS for responsive alignment
  const style: React.CSSProperties = {
    left: `${bbox.x * 100}%`,
    top: `${bbox.y * 100}%`,
    width: `${bbox.width * 100}%`,
    height: `${bbox.height * 100}%`,
  };

  return (
    <div
      style={style}
      className="absolute border-2 border-[#22C55E] bg-[#22C55E]/15 rounded-xl pointer-events-none transition-all duration-300 ease-out animate-highlight-pulse shadow-md z-20"
    >
      {/* Q Label Tag on top-left of bounding box */}
      <div className="absolute -top-3.5 left-2 bg-[#22C55E] text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 select-none z-30">
        <span>Q{questionNumber || "Answer"}</span>
        {isMultiPage && <span className="opacity-80 text-[9px]">(contd)</span>}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white rounded-tl" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white rounded-tr" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white rounded-bl" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white rounded-br" />
    </div>
  );
}
