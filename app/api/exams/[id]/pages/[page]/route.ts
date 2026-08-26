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
  const answers = [
    [
      { y: 80, text: "Q1: The artery carries blood away from the heart. Arteries have thick muscular walls..." },
      { y: 160, text: "Q2: The liver produces bile for fat digestion. It also detoxifies the blood..." },
      { y: 240, text: "Q3: Chlorophyll absorbs light energy and converts it to chemical energy..." },
      { y: 320, text: "Q4: ____________________________________" },
    ],
    [
      { y: 80, text: "Q5: DNA is a double helix made of two strands of nucleotides with base pairs A-T and C-G..." },
      { y: 220, text: "Q6: Mitosis → 2 identical cells. Meiosis → 4 genetically different cells for reproduction..." },
      { y: 380, text: "Q7: Osmosis is the movement of water through a semipermeable membrane from high to low..." },
    ],
    [
      { y: 60, text: "     ...concentration. Example: water enters root hair cells." },
      { y: 140, text: "Q8: Law of conservation: mass cannot be created or destroyed. 2H₂ + O₂ → 2H₂O" },
      { y: 280, text: "Q9: Enzymes have active sites that fit the substrate like a lock and key..." },
      { y: 400, text: "Q10: Aerobic respiration produces CO₂ + H₂O + ATP (energy)" },
    ],
    [
      { y: 80, text: "Q11a: An ecosystem is a community of organisms interacting with their environment..." },
      { y: 180, text: "Q11b: Biotic factors: 1) Predators (lions/zebra) 2) Decomposers (bacteria)" },
      { y: 300, text: "Q12: Vaccination introduces a dead/weakened pathogen → immune response → memory cells..." },
      { y: 440, text: "Natural selection: organisms with beneficial traits survive and reproduce. Trait spreads..." },
    ],
  ];

  const pageAnswers = answers[Math.min(pageNumber - 1, answers.length - 1)] ?? answers[0];

  const lines = pageAnswers
    .map(
      (a) => `
    <text x="40" y="${a.y}" font-family="Georgia, serif" font-size="13" fill="#2a2a2a">${escapeXml(a.text)}</text>
  `
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="794" height="1123" xmlns="http://www.w3.org/2000/svg">
  <rect width="794" height="1123" fill="white"/>
  <rect x="20" y="20" width="754" height="1083" fill="none" stroke="#e0e0e0" stroke-width="1"/>
  
  <!-- Header -->
  <rect x="20" y="20" width="754" height="40" fill="#f8f8f8"/>
  <text x="40" y="45" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#444">
    Student Answer Sheet — Page ${pageNumber}
  </text>
  <line x1="20" y1="60" x2="774" y2="60" stroke="#ddd" stroke-width="1"/>
  
  <!-- Answer lines -->
  <g transform="translate(0, 40)">
    ${lines}
    
    <!-- Ruled lines -->
    ${Array.from({ length: 30 }, (_, i) => `<line x1="40" y1="${80 + i * 32}" x2="754" y2="${80 + i * 32}" stroke="#f0f0f0" stroke-width="1"/>`).join("")}
  </g>

  <!-- Page number -->
  <text x="397" y="1105" font-family="Arial, sans-serif" font-size="11" fill="#888" text-anchor="middle">
    — ${pageNumber} —
  </text>
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
