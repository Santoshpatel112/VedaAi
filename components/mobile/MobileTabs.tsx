"use client";

import React from "react";
import { FileQuestion, FileImage } from "lucide-react";

interface MobileTabsProps {
  activeTab: "questions" | "answer-sheet";
  onTabChange: (tab: "questions" | "answer-sheet") => void;
  questionCount: number;
}

export function MobileTabs({
  activeTab,
  onTabChange,
  questionCount,
}: MobileTabsProps) {
  return (
    <div className="md:hidden flex items-center bg-white border border-[#E2E2E2] rounded-2xl p-1 mb-3 shadow-2xs select-none">
      <button
        onClick={() => onTabChange("questions")}
        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-150 ${
          activeTab === "questions"
            ? "bg-[#FF5500] text-white shadow-2xs"
            : "text-[#606266] hover:bg-[#F6F6F6]"
        }`}
      >
        <FileQuestion className="w-4 h-4" />
        <span>Questions ({questionCount})</span>
      </button>

      <button
        onClick={() => onTabChange("answer-sheet")}
        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-150 ${
          activeTab === "answer-sheet"
            ? "bg-[#FF5500] text-white shadow-2xs"
            : "text-[#606266] hover:bg-[#F6F6F6]"
        }`}
      >
        <FileImage className="w-4 h-4" />
        <span>Answer Sheet</span>
      </button>
    </div>
  );
}
