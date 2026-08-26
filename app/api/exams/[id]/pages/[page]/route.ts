import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs/job-store";
import { getPageImageBase64 } from "@/lib/documents/pdf-renderer";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; page: string }> }
) {
  const { id, page } = await params;
  const pageNumber = parseInt(page, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  const job = getJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!job.answerSheetPath) {
    return NextResponse.json({ error: "Answer sheet not available" }, { status: 404 });
  }

  // Demo mode: return a placeholder page image
  if (job.isDemo) {
    // Return a simple SVG as a placeholder for demo pages
    const svgPage = generateDemoPageSvg(pageNumber);
    return new NextResponse(svgPage, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const base64 = await getPageImageBase64(job.answerSheetPath, pageNumber);

  if (!base64) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const ext = path.extname(job.answerSheetPath).toLowerCase();
  const isPdf = ext === ".pdf";

  // Return the file data for the frontend to render with pdfjs
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": isPdf ? "application/pdf" : "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function generateDemoPageSvg(pageNumber: number): string {
  if (pageNumber === 1) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="794" height="1123" viewBox="0 0 794 1123" xmlns="http://www.w3.org/2000/svg">
  <!-- Paper Background with Ruled Lines -->
  <rect width="794" height="1123" fill="#FAF9F6"/>
  
  <!-- Left Margin Line -->
  <line x1="100" y1="0" x2="100" y2="1123" stroke="#F87171" stroke-width="1.5" opacity="0.6"/>
  
  <!-- Ruled Notebook Lines -->
  ${Array.from({ length: 32 }, (_, i) => `<line x1="0" y1="${80 + i * 31}" x2="794" y2="${80 + i * 31}" stroke="#CBD5E1" stroke-width="1" opacity="0.7"/>`).join("\n  ")}

  <!-- Q1 Handwritten Response -->
  <text x="45" y="100" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="20" font-weight="bold" fill="#1E3A8A">Q1.</text>
  <text x="120" y="100" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">Photosynthesis is the process used by</text>
  <text x="120" y="131" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">green plants and some other organisms</text>
  <text x="120" y="162" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">to convert light energy into chemical</text>
  <text x="120" y="193" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">energy.</text>

  <!-- Formula Box -->
  <rect x="120" y="225" x2="710" width="590" height="50" rx="4" fill="none" stroke="#1E3A8A" stroke-width="2"/>
  <text x="140" y="257" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" font-weight="bold" fill="#1E3A8A">6CO₂ + 6H₂O  ──Light/Chlorophyll──►  C₆H₁₂O₆ + 6O₂</text>

  <!-- Plant Diagram -->
  <g transform="translate(350, 310)">
    <!-- Sun -->
    <circle cx="90" cy="40" r="22" fill="none" stroke="#1E3A8A" stroke-width="2" stroke-dasharray="4 2"/>
    <text x="120" y="45" font-family="'Comic Sans MS', cursive" font-size="16" fill="#1E3A8A">Sunlight</text>
    <line x1="90" y1="65" x2="90" y2="105" stroke="#1E3A8A" stroke-width="2" marker-end="url(#arrow)"/>

    <!-- Plant Stem & Leaves -->
    <path d="M 90 180 Q 90 130 90 105" fill="none" stroke="#1E3A8A" stroke-width="2.5"/>
    <path d="M 90 140 C 50 110 30 140 90 150" fill="none" stroke="#1E3A8A" stroke-width="2"/>
    <path d="M 90 130 C 130 100 150 130 90 140" fill="none" stroke="#1E3A8A" stroke-width="2"/>
    
    <!-- Roots -->
    <path d="M 90 180 Q 70 210 50 225 M 90 180 Q 90 220 95 235 M 90 180 Q 110 210 130 225" fill="none" stroke="#1E3A8A" stroke-width="2"/>
    <text x="145" y="225" font-family="'Comic Sans MS', cursive" font-size="16" fill="#1E3A8A">Water</text>

    <!-- CO2 and O2 arrows -->
    <path d="M -20 160 Q 20 160 50 170" fill="none" stroke="#1E3A8A" stroke-width="2"/>
    <text x="-120" y="165" font-family="'Comic Sans MS', cursive" font-size="15" fill="#1E3A8A">Carbon dioxide</text>
    
    <path d="M 130 170 Q 160 170 190 170" fill="none" stroke="#1E3A8A" stroke-width="2"/>
    <text x="200" y="175" font-family="'Comic Sans MS', cursive" font-size="15" fill="#1E3A8A">Oxygen</text>
  </g>

  <!-- Q2 Handwritten Response -->
  <text x="45" y="780" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="20" font-weight="bold" fill="#1E3A8A">Q2.</text>
  <text x="120" y="780" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">The process mainly occurs in the</text>
  <text x="120" y="811" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">chloroplast of the plant cell. It has</text>
  <text x="120" y="842" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">two main stages:</text>
  <text x="120" y="873" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">1. Light reaction - Captures light energy.</text>
  <text x="120" y="904" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">2. Dark reaction - Uses energy to</text>
  <text x="150" y="935" font-family="'Comic Sans MS', 'Segoe Print', cursive, sans-serif" font-size="18" fill="#1E3A8A">make glucose.</text>
</svg>`;
  }

  // Default Page SVG layout for pages 2..14
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="794" height="1123" viewBox="0 0 794 1123" xmlns="http://www.w3.org/2000/svg">
  <rect width="794" height="1123" fill="#FAF9F6"/>
  <line x1="100" y1="0" x2="100" y2="1123" stroke="#F87171" stroke-width="1.5" opacity="0.6"/>
  ${Array.from({ length: 32 }, (_, i) => `<line x1="0" y1="${80 + i * 31}" x2="794" y2="${80 + i * 31}" stroke="#CBD5E1" stroke-width="1" opacity="0.7"/>`).join("\n  ")}

  <text x="45" y="111" font-family="'Comic Sans MS', cursive" font-size="20" font-weight="bold" fill="#1E3A8A">Q${(pageNumber - 1) * 2 + 1}.</text>
  <text x="120" y="111" font-family="'Comic Sans MS', cursive" font-size="18" fill="#1E3A8A">Handwritten step-by-step response for Question ${(pageNumber - 1) * 2 + 1}...</text>
  <text x="120" y="142" font-family="'Comic Sans MS', cursive" font-size="18" fill="#1E3A8A">Given formulas, substitution of values and final computed result.</text>
  <text x="120" y="173" font-family="'Comic Sans MS', cursive" font-size="18" fill="#1E3A8A">Therefore, the required answer is verified.</text>

  <text x="45" y="607" font-family="'Comic Sans MS', cursive" font-size="20" font-weight="bold" fill="#1E3A8A">Q${(pageNumber - 1) * 2 + 2}.</text>
  <text x="120" y="607" font-family="'Comic Sans MS', cursive" font-size="18" fill="#1E3A8A">Handwritten derivation / solution for Question ${(pageNumber - 1) * 2 + 2}...</text>
  <text x="120" y="638" font-family="'Comic Sans MS', cursive" font-size="18" fill="#1E3A8A">Step 1: State primary principle and initial boundary conditions.</text>
  <text x="120" y="669" font-family="'Comic Sans MS', cursive" font-size="18" fill="#1E3A8A">Step 2: Solve system of equations for target variable.</text>

  <text x="397" y="1100" font-family="Arial, sans-serif" font-size="12" fill="#94A3B8" text-anchor="middle">— Page ${pageNumber} —</text>
</svg>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

