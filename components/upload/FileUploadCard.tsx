"use client";

import React, { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
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
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected after removal
    e.target.value = "";
  };

  const activeError = error || localError;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none min-h-[200px] py-10 px-6 bg-white ${
          disabled
            ? "opacity-50 cursor-not-allowed border-[#DDDDDD]"
            : activeError
            ? "border-red-300 bg-red-50/20"
            : isDragOver
            ? "border-[#FF5500] bg-[#FFF8F5]"
            : "border-[#DDDDDD] hover:border-[#BBBBBB]"
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

        {/* Upload icon — orange cloud from Figma */}
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF5F0] flex items-center justify-center">
            <Upload className="w-6 h-6 text-[#FF5500]" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-[#1A1A1A] mb-1">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-[#888888] font-medium">{subtitle}</p>
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
