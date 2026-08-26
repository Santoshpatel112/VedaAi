/**
 * QuestionNumberDetector
 * Normalizes various question number formats to a canonical form
 * for deterministic matching.
 *
 * Handles:
 *   Q1, Q.1, 1., 1), Question 1, Q2, 2., 11(a), 11 (a), 11-a, 11(b)
 */

// Pattern priority: most-specific first
const PATTERNS: Array<{ regex: RegExp; normalize: (m: RegExpMatchArray) => string }> = [
  // "11(a)", "11 (a)", "11(b)", "11 (b)" → "11a", "11b"
  {
    regex: /^(?:Q\.?\s*)?(\d+)\s*[\(\-]\s*([a-zA-Z])\s*\)?$/i,
    normalize: (m) => `${m[1]}${m[2].toLowerCase()}`,
  },
  // "Q1", "Q.1", "Q 1", "Question 1", "Q-1" → "1"
  {
    regex: /^(?:question|q)\.?\s*-?\s*(\d+[a-z]?)$/i,
    normalize: (m) => m[1].toLowerCase(),
  },
  // "1.", "1)", "1:" → "1"
  {
    regex: /^(\d+[a-z]?)[.)\-:]$/i,
    normalize: (m) => m[1].toLowerCase(),
  },
  // Plain "1", "1a", "12", "11a" → as-is normalized
  {
    regex: /^(\d+[a-z]?)$/i,
    normalize: (m) => m[1].toLowerCase(),
  },
];

/**
 * Normalize a raw question number string to a canonical form.
 * Returns null if the string doesn't look like a question number.
 */
export function normalizeQuestionNumber(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  for (const { regex, normalize } of PATTERNS) {
    const match = trimmed.match(regex);
    if (match) {
      return normalize(match);
    }
  }

  return null;
}

/**
 * Parse a display number (as printed in the question paper) into a normalized form.
 * E.g., "11(a)" → "11a", "Q.1" → "1"
 */
export function normalizeDisplayNumber(display: string): string {
  const result = normalizeQuestionNumber(display);
  return result ?? display.toLowerCase().replace(/[^0-9a-z]/g, "");
}

/**
 * Check whether two question numbers match (either exact or normalized).
 */
export function questionNumbersMatch(
  questionDisplay: string,
  answerRaw: string | undefined
): boolean {
  if (!answerRaw) return false;

  const qNorm = normalizeDisplayNumber(questionDisplay);
  const aNorm = normalizeQuestionNumber(answerRaw);

  if (!aNorm) return false;

  return qNorm === aNorm;
}

/**
 * Generate human-readable display from a normalized number.
 * E.g., "11a" → "11(a)", "1" → "1"
 */
export function displayFromNormalized(normalized: string): string {
  const match = normalized.match(/^(\d+)([a-z])$/);
  if (match) {
    return `${match[1]}(${match[2]})`;
  }
  return normalized;
}
