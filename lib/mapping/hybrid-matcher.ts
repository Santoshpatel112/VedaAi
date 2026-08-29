import type { Question, StudentAnswer, AnswerMapping, MappingStatus } from "@/lib/types";
import { questionNumbersMatch } from "@/lib/extraction/question-number-detector";
import type { SemanticSearchService } from "@/lib/retrieval/semantic-search";

// ─── Configurable Thresholds ──────────────────────────────────────────────────

function parseThreshold(value: string | undefined, fallback: number): number {
  const parsed = parseFloat(value ?? String(fallback));
  if (isNaN(parsed) || parsed < 0 || parsed > 1) {
    console.warn(
      `[HybridMatcher] Invalid threshold value "${value}", using fallback ${fallback}`
    );
    return fallback;
  }
  return parsed;
}

export const CONFIDENCE_THRESHOLDS = {
  HIGH: parseThreshold(process.env.CONFIDENCE_HIGH, 0.82),
  MEDIUM: parseThreshold(process.env.CONFIDENCE_MEDIUM, 0.55),
} as const;

// ─── Mapping Weights (configurable) ──────────────────────────────────────────

const MAPPING_WEIGHTS = {
  DETERMINISTIC: 0.60,
  SEMANTIC: 0.30,
  POSITIONAL: 0.10,
} as const;

// ─── Rule-Based Deterministic Matcher ────────────────────────────────────────

/**
 * Try to deterministically match each answer to a question based on question number.
 * Returns a Map<questionId, answerId> for all high-confidence deterministic matches.
 */
export function runDeterministicMatching(
  questions: Question[],
  answers: StudentAnswer[]
): Map<string, string> {
  const matches = new Map<string, string>(); // questionId → answerId
  const usedAnswerIds = new Set<string>();

  for (const question of questions) {
    for (const answer of answers) {
      if (usedAnswerIds.has(answer.id)) continue;

      if (
        answer.normalizedNumber &&
        question.normalizedNumber === answer.normalizedNumber
      ) {
        matches.set(question.id, answer.id);
        usedAnswerIds.add(answer.id);
        break;
      }

      // Also try the raw question number
      if (questionNumbersMatch(question.number, answer.questionNumber)) {
        matches.set(question.id, answer.id);
        usedAnswerIds.add(answer.id);
        break;
      }
    }
  }

  return matches;
}

// ─── Positional Signal ────────────────────────────────────────────────────────

/**
 * Score how well the answer's page position aligns with the question's position.
 * Higher score if answer page >= question page (student answered in order).
 */
function positionalScore(question: Question, answer: StudentAnswer): number {
  const answerPage = answer.regions[0]?.page ?? 1;
  if (answerPage >= question.page) {
    return Math.max(0, 1 - (answerPage - question.page) * 0.15);
  }
  return 0.3; // Penalize but don't exclude out-of-order answers
}

// ─── Hybrid Matcher ───────────────────────────────────────────────────────────

export class HybridMatcher {
  constructor(private semanticSearch: SemanticSearchService) {}

  async buildMappings(
    questions: Question[],
    answers: StudentAnswer[]
  ): Promise<AnswerMapping[]> {
    // Step 1: Deterministic matching
    const deterministicMatches = runDeterministicMatching(questions, answers);
    const deterministicAnswerIds = new Set(deterministicMatches.values());

    // Step 2: Prepare unmatched questions and answers
    const unmatchedQuestions = questions.filter(
      (q) => !deterministicMatches.has(q.id)
    );
    const unmatchedAnswers = answers.filter(
      (a) => !deterministicAnswerIds.has(a.id)
    );

    // Step 3: Semantic matching for unmatched questions
    const semanticMatches = new Map<string, { answerId: string; score: number }>();
    const semanticUsedAnswerIds = new Set<string>();

    // Sort unmatchedQuestions by page order (process in order)
    const sortedUnmatched = [...unmatchedQuestions].sort(
      (a, b) => a.page - b.page
    );

    for (const question of sortedUnmatched) {
      if (unmatchedAnswers.length === 0) break;

      const candidates = await this.semanticSearch.findAnswersForQuestion(
        question,
        5
      );

      // Filter to only unmatched answers
      const validCandidates = candidates.filter(
        (c) =>
          !deterministicAnswerIds.has(c.id) &&
          !semanticUsedAnswerIds.has(c.id)
      );

      if (validCandidates.length === 0) continue;

      const best = validCandidates[0];
      const bestAnswer = unmatchedAnswers.find((a) => a.id === best.id);
      if (!bestAnswer) continue;

      const posScore = positionalScore(question, bestAnswer);
      const finalScore =
        best.score * MAPPING_WEIGHTS.SEMANTIC +
        posScore * MAPPING_WEIGHTS.POSITIONAL;

      semanticMatches.set(question.id, {
        answerId: best.id,
        score: finalScore,
      });
      semanticUsedAnswerIds.add(best.id);
    }

    // Step 4: Build final mapping array
    const mappings: AnswerMapping[] = questions.map((question) => {
      // Deterministic match
      if (deterministicMatches.has(question.id)) {
        const answerId = deterministicMatches.get(question.id)!;
        return {
          questionId: question.id,
          answerId,
          status: "matched" as MappingStatus,
          confidence: 0.95,
          deterministic: true,
        };
      }

      // Semantic match
      const semantic = semanticMatches.get(question.id);
      if (semantic) {
        const confidence = semantic.score;
        const status: MappingStatus =
          confidence >= CONFIDENCE_THRESHOLDS.HIGH
            ? "matched"
            : confidence >= CONFIDENCE_THRESHOLDS.MEDIUM
            ? "uncertain"
            : "unanswered";

        return {
          questionId: question.id,
          answerId: status !== "unanswered" ? semantic.answerId : undefined,
          status,
          confidence,
          deterministic: false,
          semanticScore: semantic.score,
        };
      }

      // No match
      return {
        questionId: question.id,
        answerId: undefined,
        status: "unanswered" as MappingStatus,
        confidence: 0,
        deterministic: false,
      };
    });

    // Step 5: Check for completely unmatched answers
    const allMappedAnswerIds = new Set(
      mappings.filter((m) => m.answerId).map((m) => m.answerId!)
    );
    const truelyUnmatchedAnswers = answers.filter(
      (a) => !allMappedAnswerIds.has(a.id)
    );

    // Log unmatched answers (available in debug mode)
    if (truelyUnmatchedAnswers.length > 0) {
      console.info(
        `[Mapping] ${truelyUnmatchedAnswers.length} answer(s) could not be mapped to any question`
      );
    }

    return mappings;
  }
}
