import type { StudentAnswer, ExtractedAnswer } from "@/lib/types";
import { normalizeQuestionNumber } from "./question-number-detector";

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
        page: region.page,
        bbox: {
          x: clamp(region.bbox.x),
          y: clamp(region.bbox.y),
          width: clamp(region.bbox.width),
          height: clamp(region.bbox.height),
        },
      })),
      confidence: item.confidence,
    };
  });
}

function clamp(val: number): number {
  return Math.max(0, Math.min(1, val));
}
