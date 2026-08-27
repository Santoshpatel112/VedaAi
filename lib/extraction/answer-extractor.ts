import type { StudentAnswer, ExtractedAnswer, BoundingBox } from "@/lib/types";
import { normalizeQuestionNumber } from "./question-number-detector";

/**
 * Validates and normalizes bounding box coordinates.
 * Guarantees all coordinates are strictly within [0, 1] bounds
 * and width/height are strictly positive.
 */
export function validateAndNormalizeBBox(raw: BoundingBox): BoundingBox {
  const x = Math.max(0, Math.min(0.95, Number.isFinite(raw.x) ? raw.x : 0.05));
  const y = Math.max(0, Math.min(0.95, Number.isFinite(raw.y) ? raw.y : 0.05));

  let width = Number.isFinite(raw.width) ? raw.width : 0.88;
  let height = Number.isFinite(raw.height) ? raw.height : 0.20;

  // Ensure box stays within page boundary (x + width <= 1.0 and y + height <= 1.0)
  width = Math.max(0.02, Math.min(1.0 - x, width));
  height = Math.max(0.02, Math.min(1.0 - y, height));

  return {
    x: Math.round(x * 10000) / 10000,
    y: Math.round(y * 10000) / 10000,
    width: Math.round(width * 10000) / 10000,
    height: Math.round(height * 10000) / 10000,
  };
}

/**
 * AnswerExtractionService
 * Converts raw AI extraction output into structured StudentAnswer objects.
 * Normalizes bounding boxes and question numbers.
 */
export function buildStudentAnswers(extracted: ExtractedAnswer[]): StudentAnswer[] {
  return extracted.map((item, idx) => {
    const normalizedNumber = item.questionNumber
      ? (normalizeQuestionNumber(item.questionNumber) ?? undefined)
      : undefined;

    return {
      id: `answer_${idx + 1}`,
      questionNumber: item.questionNumber,
      normalizedNumber,
      text: item.text.trim(),
      regions: item.regions.map((region) => ({
        page: Math.max(1, Math.floor(region.page || 1)),
        bbox: validateAndNormalizeBBox(region.bbox),
      })),
      confidence: Math.max(0, Math.min(1, item.confidence ?? 0.9)),
    };
  });
}

