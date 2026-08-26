import type { Question, ExtractedQuestion } from "@/lib/types";
import { normalizeDisplayNumber } from "./question-number-detector";

/**
 * QuestionExtractionService
 * Converts raw AI extraction output into structured Question objects.
 * Preserves ordering and handles subquestions.
 */

let questionIdCounter = 0;

function generateQuestionId(number: string): string {
  const normalized = normalizeDisplayNumber(number);
  return `q${normalized}`;
}

export function buildQuestions(extracted: ExtractedQuestion[]): Question[] {
  questionIdCounter = 0;
  const seen = new Set<string>();
  const questions: Question[] = [];

  for (const item of extracted) {
    let id = generateQuestionId(item.number);

    // Handle duplicate IDs (can happen with poorly formatted papers)
    if (seen.has(id)) {
      id = `${id}_${++questionIdCounter}`;
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
