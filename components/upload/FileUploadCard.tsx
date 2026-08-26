"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";
import { validateFileUpload } from "@/lib/validation/schemas";

interface FileUploadCardProps {
  title: string;
  subtitle: string;
  acceptTypes?: string;
  onFileSelect: (file: File) => void;
  error?: string | null;
  disabled?: boolean;
}

export function FileUploadCard({
  title,
  subtitle,
  acceptTypes = ".pdf,.png,.jpg,.jpeg",
  onFileSelect,
  error,
  disabled = false,
}: FileUploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setLocalError(null);
    const validation = validateFileUpload(file.name, file.type, file.size);
    if (!validation.valid) {
      setLocalError(validation.error);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const activeError = error || localError;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none min-h-[220px] bg-white ${
          disabled
            ? "opacity-50 cursor-not-allowed border-[#E2E2E2]"
            : activeError
            ? "border-red-400 bg-red-50/30"
            : isDragOver
            ? "border-[#FF5500] bg-[#FFF8F5] shadow-md scale-[1.01]"
            : "border-[#E2E2E2] hover:border-[#FF5500] hover:bg-[#FFF8F5]/60 hover:shadow-xs"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="w-14 h-14 rounded-2xl bg-[#FFF3EE] border border-[#FFCCAA] flex items-center justify-center text-[#FF5500] mb-4 shadow-2xs group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="font-bold text-base text-[#21262C] mb-1">{title}</h3>
        <p className="text-xs text-[#606266] mb-3 max-w-[240px] leading-relaxed">
          {subtitle}
        </p>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F6F6F6] text-[11px] font-semibold text-[#8C8C8C] border border-[#E2E2E2]">
          <FileText className="w-3 h-3 text-[#FF5500]" />
          PDF, PNG, JPG (up to 20MB)
        </span>
      </div>

      {activeError && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
