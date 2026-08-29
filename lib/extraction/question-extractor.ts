import type { Question, ExtractedQuestion } from "@/lib/types";
import { normalizeDisplayNumber } from "./question-number-detector";

/**
 * QuestionExtractionService
 * Converts raw AI extraction output into structured Question objects.
 * Preserves ordering and handles subquestions.
 */

function generateQuestionId(number: string): string {
  const normalized = normalizeDisplayNumber(number);
  return `q${normalized}`;
}

export function buildQuestions(extracted: ExtractedQuestion[]): Question[] {
  // Local counter — safe for concurrent requests since each invocation gets its own scope
  let collisionCounter = 0;
  const seen = new Set<string>();
  const questions: Question[] = [];

  for (const item of extracted) {
    let id = generateQuestionId(item.number);

    // Handle duplicate IDs (can happen with poorly formatted papers)
    if (seen.has(id)) {
      id = `${id}_${++collisionCounter}`;
    }
    seen.add(id);

    questions.push({
      id,
      number: item.number,
      normalizedNumber: normalizeDisplayNumber(item.number),
      text: item.text.trim(),
      page: item.page,
      marks: item.marks,
      section: item.section,
    });
  }

  return questions;
}
