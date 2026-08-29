"use client";

import React, { useState, useRef, useEffect } from "react";
import { PageControls } from "./PageControls";
import { HighlightOverlay } from "./HighlightOverlay";
import type { Question, StudentAnswer, AnswerMapping } from "@/lib/types";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";

interface AnswerSheetViewerProps {
  jobId: string;
  selectedQuestion: Question | null;
  selectedAnswer: StudentAnswer | null;
  mapping: AnswerMapping | null;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function AnswerSheetViewer({
  jobId,
  selectedQuestion,
  selectedAnswer,
  mapping,
  totalPages,
  currentPage,
  onPageChange,
}: AnswerSheetViewerProps) {
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"pdf" | "image" | "svg">("pdf");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  // Incremented to force a retry of the current page without changing jobId/currentPage
  const [retryCount, setRetryCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-switch to answer's page when question changes
  useEffect(() => {
    if (selectedAnswer && selectedAnswer.regions.length > 0) {
      const firstPage = selectedAnswer.regions[0].page;
      if (firstPage !== currentPage && firstPage <= totalPages) {
        onPageChange(firstPage);
      }
    }
  }, [selectedQuestion?.id, selectedAnswer, currentPage, onPageChange, totalPages]);

  // Smooth auto-scroll to highlighted answer region
  useEffect(() => {
    if (loading || !containerRef.current || !selectedAnswer) return;
    const currentRegion = selectedAnswer.regions.find((r) => r.page === currentPage);
    if (!currentRegion) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollHeight = containerRef.current.scrollHeight;
      const targetTop = currentRegion.bbox.y * scrollHeight - 60;
      containerRef.current.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [selectedQuestion?.id, selectedAnswer, currentPage, zoom, loading]);

  // Load and render page document (PDF canvas or Image)
  useEffect(() => {
    let isMounted = true;
    // Track the URL created in this effect so we can revoke it on cleanup
    let createdUrl: string | null = null;

    async function fetchAndRender() {
      try {
        setLoading(true);
        setError(null);

        const pageEndpoint = `/api/exams/${jobId}/pages/${currentPage}`;
        const res = await fetch(pageEndpoint);

        if (!res.ok) {
          throw new Error(`Failed to load page ${currentPage}. Status: ${res.status}`);
        }

        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("pdf")) {
          if (!isMounted) return;
          const blob = await res.blob();
          createdUrl = URL.createObjectURL(blob);
          setMediaType("pdf");
          setMediaUrl(createdUrl);

          // Render PDF page via pdfjs-dist using local worker
          try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

            const arrayBuffer = await blob.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const targetPage = Math.min(currentPage, pdf.numPages);
            const page = await pdf.getPage(targetPage);

            const canvas = canvasRef.current;
            if (canvas) {
              const context = canvas.getContext("2d");
              const viewport = page.getViewport({ scale: 1.5 });
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              if (context) {
                await page.render({ canvas, canvasContext: context, viewport }).promise;
              }
            }
          } catch (pdfErr) {
            console.warn("pdfjs canvas render fallback:", pdfErr);
          }
        } else if (contentType.includes("svg")) {
          if (!isMounted) return;
          const text = await res.text();
          const svgBlob = new Blob([text], { type: "image/svg+xml" });
          createdUrl = URL.createObjectURL(svgBlob);
          setMediaType("svg");
          setMediaUrl(createdUrl);
        } else {
          if (!isMounted) return;
          const blob = await res.blob();
          createdUrl = URL.createObjectURL(blob);
          setMediaType("image");
          setMediaUrl(createdUrl);
        }

        if (isMounted) setLoading(false);
      } catch (err) {
        console.error("Document render error:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error rendering page document.");
          setLoading(false);
        }
      }
    }

    fetchAndRender();

    return () => {
      isMounted = false;
      // Revoke any Object URL created in this effect to prevent memory leaks
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [jobId, currentPage, retryCount]);

  // Regions on the current page
  const pageRegions =
    selectedAnswer?.regions.filter((r) => r.page === currentPage) ?? [];

  return (
    <div className="flex flex-col h-full bg-[#F6F6F6] rounded-2xl border border-[#E2E2E2] shadow-xs overflow-hidden select-none">
      {/* Top Page Controls Bar */}
      <PageControls
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        onPageChange={onPageChange}
        onZoomChange={setZoom}
        onResetZoom={() => setZoom(1.0)}
      />

      {/* Document View Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6 flex justify-center items-start bg-[#F6F6F6] relative min-h-[400px] scroll-smooth"
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 bg-[#F6F6F6]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30">
            <Loader2 className="w-8 h-8 text-[#FF5500] animate-spin" />
            <span className="text-xs font-bold text-[#606266]">
              Loading Page {currentPage} Document...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white border border-red-200 rounded-2xl p-6 max-w-md text-center space-y-3 shadow-xs my-auto">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-[#21262C]">
              Answer Sheet Page Unavailable
            </h3>
            <p className="text-xs text-[#606266]">{error}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="px-4 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold shadow-xs hover:bg-[#E04A00]"
            >
              Retry Loading Page
            </button>
          </div>
        )}

        {/* Rendered Document Page Card */}
        {!error && (
          <div
            className="relative transition-transform duration-200 ease-out shadow-card rounded-xl overflow-hidden bg-white border border-[#E2E2E2] min-w-[320px] max-w-[800px] w-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
          >
            {/* Canvas for PDF pages */}
            <canvas
              ref={canvasRef}
              className={`w-full h-auto block ${
                mediaType === "pdf" ? "block" : "hidden"
              }`}
            />

            {/* Image / SVG display */}
            {mediaType !== "pdf" && mediaUrl && (
              <img
                src={mediaUrl}
                alt={`Answer Sheet Page ${currentPage}`}
                className="w-full h-auto block"
              />
            )}

            {/* Bounding Box Highlight Overlays */}
            {pageRegions.map((region, idx) => (
              <HighlightOverlay
                key={idx}
                region={region}
                questionNumber={selectedQuestion?.number}
                isMultiPage={selectedAnswer ? selectedAnswer.regions.length > 1 : false}
                isUncertain={mapping?.status === "uncertain"}
              />
            ))}

            {/* Banner for Unanswered Question */}
            {selectedQuestion && mapping?.status === "unanswered" && (
              <div className="absolute top-4 left-4 right-4 bg-amber-500/90 text-white font-bold text-xs p-3 rounded-xl shadow-lg backdrop-blur-xs flex items-center justify-between z-20 animate-fade-in">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  No answer detected for Question {selectedQuestion.number}
                </span>
                <span className="text-[10px] uppercase bg-amber-700/80 px-2 py-0.5 rounded font-black">
                  Unanswered
                </span>
              </div>
            )}

            {/* Banner for Low Confidence / Needs Review */}
            {selectedQuestion && mapping?.status === "uncertain" && (
              <div className="absolute top-4 left-4 right-4 bg-orange-500/90 text-white font-bold text-xs p-3 rounded-xl shadow-lg backdrop-blur-xs flex items-center justify-between z-20 animate-fade-in">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Answer mapping confidence low — Marked for Review
                </span>
                <span className="text-[10px] uppercase bg-orange-700/80 px-2 py-0.5 rounded font-black">
                  Needs Review
                </span>
              </div>
            )}

            {/* Banner for Multi-Page Answer continuation */}
            {selectedQuestion &&
              selectedAnswer &&
              selectedAnswer.regions.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4 bg-[#21262C]/90 text-white font-bold text-xs p-2.5 rounded-xl shadow-lg backdrop-blur-xs flex items-center justify-between z-20">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
                    Multi-page answer: Spans {selectedAnswer.regions.length} pages
                  </span>
                  <div className="flex gap-1">
                    {selectedAnswer.regions.map((r) => (
                      <button
                        key={r.page}
                        onClick={() => onPageChange(r.page)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          r.page === currentPage
                            ? "bg-[#FF5500] text-white"
                            : "bg-white/20 hover:bg-white/40 text-white"
                        }`}
                      >
                        Page {r.page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
