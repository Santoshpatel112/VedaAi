"use client";

import React from "react";
import { FileText, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";

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
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-xs font-bold text-[#606266] tracking-wide uppercase">
        {label}
      </span>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E2E2E2] shadow-xs hover:border-[#FFCCAA] transition-colors group">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#FFF3EE] border border-[#FFCCAA] flex items-center justify-center text-[#FF5500] shrink-0">
            {isPdf ? (
              <FileText className="w-5.5 h-5.5" />
            ) : (
              <ImageIcon className="w-5.5 h-5.5" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-[#21262C] truncate">
              {file.name}
            </span>
            <div className="flex items-center gap-2 text-xs text-[#8C8C8C] font-medium mt-0.5">
              <span>{sizeMb} MB</span>
              <span>•</span>
              <span className="uppercase">{isPdf ? "PDF" : "Image"}</span>
              {pageCount && (
                <>
                  <span>•</span>
                  <span>{pageCount} page(s)</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#22C55E] text-xs font-bold border border-[#BBF7D0]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ready
          </span>

          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-lg text-[#8C8C8C] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
