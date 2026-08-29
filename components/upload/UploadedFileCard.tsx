"use client";

import React from "react";
import { X } from "lucide-react";

interface UploadedFileCardProps {
  label: string;
  file: File;
  onRemove: () => void;
  pageCount?: number;
}

export function UploadedFileCard({
  label,
  file,
  onRemove,
  pageCount,
}: UploadedFileCardProps) {
  const isPdf = file.type.includes("pdf") || file.name.endsWith(".pdf");
  const sizeMb = (file.size / (1024 * 1024)).toFixed(0);

  return (
    <div className="relative bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-4 flex items-center gap-3 min-h-[88px]">
      {/* Remove button — top-right circle × */}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white hover:bg-[#333333] transition-colors shadow-sm z-10"
        title="Remove file"
        aria-label="Remove file"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>

      {/* PDF icon badge */}
      <div className="w-10 h-12 rounded-lg bg-[#FF5500] flex items-center justify-center shrink-0 shadow-sm">
        <span className="text-white text-[10px] font-black tracking-wide uppercase leading-none">
          {isPdf ? "PDF" : "IMG"}
        </span>
      </div>

      {/* File info */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold text-[#1A1A1A] truncate leading-tight">
          {file.name}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-[#888888] mt-0.5 font-normal">
          <span>{sizeMb}MB</span>
          {pageCount && (
            <>
              <span className="text-[#CCCCCC]">•</span>
              <span>{pageCount} Pages</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
