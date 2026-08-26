import { z } from "zod";

// ─── BBox Schema ──────────────────────────────────────────────────────────────

export const BoundingBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

// ─── Question Extraction Schema ───────────────────────────────────────────────

export const ExtractedQuestionSchema = z.object({
  number: z.string().min(1),
  text: z.string().min(1),
  page: z.number().int().min(1),
  marks: z.number().int().optional(),
  section: z.string().optional(),
});

export const ExtractedQuestionsSchema = z.object({
  questions: z.array(ExtractedQuestionSchema),
});

// ─── Answer Extraction Schema ─────────────────────────────────────────────────

export const AnswerRegionSchema = z.object({
  page: z.number().int().min(1),
  bbox: BoundingBoxSchema,
});

export const ExtractedAnswerSchema = z.object({
  questionNumber: z.string().optional(),
  text: z.string(),
  regions: z.array(AnswerRegionSchema).min(1),
  confidence: z.number().min(0).max(1).optional(),
});

export const ExtractedAnswersSchema = z.object({
  answers: z.array(ExtractedAnswerSchema),
});

// ─── Grading Schema ───────────────────────────────────────────────────────────

export const GradeResultSchema = z.object({
  score: z.number().min(0),
  maxScore: z.number().min(0),
  feedback: z.string(),
});

// ─── Upload Validation ────────────────────────────────────────────────────────

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const;

export const SUPPORTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"] as const;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export function validateFileUpload(
  filename: string,
  mimeType: string,
  sizeBytes: number
): { valid: true } | { valid: false; error: string } {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!ext || !SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: `Unsupported file type. Please upload PDF, PNG or JPG.`,
    };
  }

  const validMime = SUPPORTED_MIME_TYPES.some(
    (m) => m === mimeType || mimeType.includes("pdf") || mimeType.includes("image")
  );
  if (!validMime) {
    return {
      valid: false,
      error: `Invalid file type. Received: ${mimeType}`,
    };
  }

  if (sizeBytes === 0) {
    return { valid: false, error: "File is empty." };
  }

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is 20 MB.`,
    };
  }

  return { valid: true };
}
