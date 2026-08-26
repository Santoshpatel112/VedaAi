import OpenAI from "openai";
import { GradeResultSchema } from "@/lib/validation/schemas";
import type { GradeResult } from "@/lib/types";

// ─── Grading Provider Interface ───────────────────────────────────────────────

export interface GradingProvider {
  gradeAnswer(
    questionText: string,
    answerText: string,
    maxMarks: number
  ): Promise<GradeResult>;
}

// ─── OpenAI Grading Provider ──────────────────────────────────────────────────

const GRADING_PROMPT = (
  question: string,
  answer: string,
  maxMarks: number
) => `
You are a fair and constructive teacher grading a student's answer.

Question: ${question}
Maximum marks: ${maxMarks}
Student's answer: ${answer}

Grade this answer and return a JSON object:
{
  "score": <number between 0 and ${maxMarks}>,
  "maxScore": ${maxMarks},
  "feedback": "<one or two sentence constructive feedback>"
}

Be fair, consistent, and encouraging. Award partial marks for partially correct answers.
Return ONLY the JSON object, no markdown or explanation.
`.trim();

export const openAIGradingProvider: GradingProvider = {
  async gradeAnswer(
    questionText: string,
    answerText: string,
    maxMarks: number
  ): Promise<GradeResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o",
      messages: [
        {
          role: "user",
          content: GRADING_PROMPT(questionText, answerText, maxMarks),
        },
      ],
      max_tokens: 256,
      temperature: 0.2,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return GradeResultSchema.parse(parsed);
  },
};

// ─── Mock Grading Provider ────────────────────────────────────────────────────

export const mockGradingProvider: GradingProvider = {
  async gradeAnswer(
    _questionText: string,
    answerText: string,
    maxMarks: number
  ): Promise<GradeResult> {
    const wordCount = answerText.trim().split(/\s+/).length;
    const scoreRatio = Math.min(wordCount / (maxMarks * 8), 1);
    const score = Math.round(scoreRatio * maxMarks * 10) / 10;

    return {
      score,
      maxScore: maxMarks,
      feedback:
        score >= maxMarks * 0.8
          ? "Excellent work! Your answer covers the key points clearly."
          : score >= maxMarks * 0.5
          ? "Good attempt. A bit more detail would improve the answer."
          : "Partial answer. Review the key concepts and expand your response.",
    };
  },
};

export function getGradingProvider(isDemo = false): GradingProvider {
  if (isDemo || !process.env.OPENAI_API_KEY) {
    return mockGradingProvider;
  }
  return openAIGradingProvider;
}
