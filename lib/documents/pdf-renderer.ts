import type { DocumentPage } from "@/lib/types";

/**
 * DocumentRenderingService
 * Converts PDF pages or images to base64 PNG for Vision AI processing.
 *
 * For PDF: Reads raw PDF bytes and converts to base64 (GPT-4o can read PDF natively via base64)
 * For images: Reads and converts to base64
 */

export async function renderDocumentToPages(
  filePath: string,
  mimeType: string
): Promise<DocumentPage[]>;
export async function renderDocumentToPages(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentPage[]>;
export async function renderDocumentToPages(
  filePathOrBuffer: string | Buffer,
  mimeType: string
): Promise<DocumentPage[]> {
  const isPdf = mimeType.includes("pdf");

  if (isPdf) {
    return renderPdfToPages(filePathOrBuffer);
  } else {
    return renderImageToPage(filePathOrBuffer);
  }
}

async function renderPdfToPages(filePathOrBuffer: string | Buffer): Promise<DocumentPage[]> {
  let pdfBytes: Buffer;
  if (Buffer.isBuffer(filePathOrBuffer)) {
    pdfBytes = filePathOrBuffer;
  } else {
    const fs = await import("fs/promises");
    pdfBytes = await fs.readFile(filePathOrBuffer);
  }
  const base64 = pdfBytes.toString("base64");

  // For GPT-4o: send the whole PDF as a single "page" with base64
  // The model can handle multi-page PDFs natively
  // We'll use a single DocumentPage with the PDF base64 for extraction,
  // and separately track page count for the viewer
  return [
    {
      pageNumber: 1,
      imageBase64: base64,
      width: 0, // unknown until rendered
      height: 0,
    },
  ];
}

async function renderImageToPage(filePathOrBuffer: string | Buffer): Promise<DocumentPage[]> {
  let imageBytes: Buffer;
  if (Buffer.isBuffer(filePathOrBuffer)) {
    imageBytes = filePathOrBuffer;
  } else {
    const fs = await import("fs/promises");
    imageBytes = await fs.readFile(filePathOrBuffer);
  }
  const base64 = imageBytes.toString("base64");

  return [
    {
      pageNumber: 1,
      imageBase64: base64,
      width: 0,
      height: 0,
    },
  ];
}

/**
 * Get the MIME type for a base64 image based on file extension.
 */
export function getMimeType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
  };
  return mimeMap[ext || ""] ?? "application/octet-stream";
}

/**
 * Count pages in a document (returns 1 for images, estimates for PDF).
 * Used for the UI page navigator.
 */
export async function getPageCount(filePath: string): Promise<number>;
export async function getPageCount(fileBuffer: Buffer, mimeType: string): Promise<number>;
export async function getPageCount(filePathOrBuffer: string | Buffer, mimeType?: string): Promise<number> {
  let isPdf: boolean;
  let bytes: Buffer;
  
  if (Buffer.isBuffer(filePathOrBuffer)) {
    bytes = filePathOrBuffer;
    isPdf = mimeType?.includes("pdf") ?? false;
  } else {
    const ext = filePathOrBuffer.split('.').pop()?.toLowerCase();
    isPdf = ext === "pdf";
    if (!isPdf) return 1;
    
    try {
      const fs = await import("fs/promises");
      bytes = await fs.readFile(filePathOrBuffer);
    } catch {
      return 1;
    }
  }

  if (!isPdf) return 1;

  try {
    const pdfStr = bytes.toString("binary");

    // Count /Page objects in PDF (rough estimate)
    const matches = pdfStr.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) {
      return matches.length;
    }

    // Fallback: count page markers
    const pageMatches = pdfStr.match(/\/Page\b/g);
    return pageMatches ? Math.ceil(pageMatches.length / 2) : 1;
  } catch {
    return 1;
  }
}

/**
 * Serve a specific page as base64 image data for the document viewer.
 * For the viewer, we return the raw file bytes (for images) or
 * placeholder pages for PDFs (in production, use pdf-lib or canvas).
 */
export async function getPageImageBase64(
  filePath: string,
  _pageNumber: number
): Promise<string | null>;
export async function getPageImageBase64(
  fileBuffer: Buffer,
  _pageNumber: number,
  mimeType: string
): Promise<string | null>;
export async function getPageImageBase64(
  filePathOrBuffer: string | Buffer,
  _pageNumber: number,
  mimeType?: string
): Promise<string | null> {
  try {
    let bytes: Buffer;
    let isPdf: boolean;
    
    if (Buffer.isBuffer(filePathOrBuffer)) {
      bytes = filePathOrBuffer;
      isPdf = mimeType?.includes("pdf") ?? false;
    } else {
      const ext = filePathOrBuffer.split('.').pop()?.toLowerCase();
      isPdf = ext === "pdf";
      
      const fs = await import("fs/promises");
      bytes = await fs.readFile(filePathOrBuffer);
    }

    if (!isPdf) {
      // Single page image
      return bytes.toString("base64");
    }

    // For PDF: return the full PDF as base64
    // The frontend will use pdfjs-dist to render individual pages
    return bytes.toString("base64");
  } catch {
    return null;
  }
}
