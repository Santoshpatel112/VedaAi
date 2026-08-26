"use client";

import React from "react";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

interface PageControlsProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onResetZoom?: () => void;
}

export function PageControls({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
  onResetZoom,
}: PageControlsProps) {
  const handleZoomIn = () => onZoomChange(Math.min(zoom + 0.25, 2.5));
  const handleZoomOut = () => onZoomChange(Math.max(zoom - 0.25, 0.5));

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-white border-b border-[#E2E2E2] select-none text-xs font-semibold text-[#21262C]">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1.5 bg-[#F6F6F6] p-1 rounded-xl border border-[#E2E2E2]">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="w-7 h-7 rounded-lg bg-white hover:bg-[#EAEAEA] disabled:opacity-40 flex items-center justify-center text-[#606266] transition-colors shadow-2xs"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetZoom}
          className="px-2 py-1 rounded-lg text-xs font-extrabold text-[#21262C] hover:bg-white transition-colors"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={handleZoomIn}
          disabled={zoom >= 2.5}
          className="w-7 h-7 rounded-lg bg-white hover:bg-[#EAEAEA] disabled:opacity-40 flex items-center justify-center text-[#606266] transition-colors shadow-2xs"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-2 bg-[#F6F6F6] px-3 py-1.5 rounded-xl border border-[#E2E2E2]">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="w-6 h-6 rounded-md hover:bg-white disabled:opacity-30 flex items-center justify-center text-[#606266] transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold text-[#21262C] whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="w-6 h-6 rounded-md hover:bg-white disabled:opacity-30 flex items-center justify-center text-[#606266] transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
