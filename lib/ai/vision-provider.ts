import OpenAI from "openai";
import type { DocumentPage, ExtractedQuestion } from "@/lib/types";
import {
  ExtractedQuestionsSchema,
  ExtractedAnswersSchema,
} from "@/lib/validation/schemas";
import type { ExtractedAnswer } from "@/lib/types";
import { getRealPhysicsQuestions } from "@/lib/extraction/pdf-question-extractor";

// ─── Vision Provider Interface ────────────────────────────────────────────────

export interface VisionProvider {
  extractQuestions(pages: DocumentPage[]): Promise<ExtractedQuestion[]>;
  extractAnswers(pages: DocumentPage[]): Promise<ExtractedAnswer[]>;
}

// ─── OpenAI Vision Provider ───────────────────────────────────────────────────

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

const QUESTION_EXTRACTION_PROMPT = `
You are analyzing a printed question paper image. Extract ALL questions including subquestions.

CRITICAL RULES:
1. Extract EVERY question including sub-questions like "11(a)" and "11(b)" as SEPARATE items
2. Preserve the EXACT question number as printed (e.g., "Q1", "11(a)", "11 (b)", "Q.2")
3. Extract the full question text
4. Note which page the question appears on
5. Extract marks if shown (e.g., "[2 marks]", "(3)")
6. Handle all formats: Q1, Q.1, 1., 1), Question 1, 11(a), 11-a, etc.

Return a JSON object with this EXACT structure:
{
  "questions": [
    {
      "number": "1",
      "text": "full question text here",
      "page": 1,
      "marks": 2,
      "section": "Section A"
    }
  ]
}

IMPORTANT: 
- Return ONLY the JSON object, no markdown, no explanation
- Include ALL questions visible across ALL provided pages
- Do NOT merge sub-questions; "11(a)" and "11(b)" must be SEPARATE entries
`.trim();

const ANSWER_EXTRACTION_PROMPT = `
You are analyzing handwritten answer sheet images. Extract student answers with their locations.

CRITICAL RULES:
1. Extract ALL handwritten answers
2. If a student wrote a question number, capture it as "questionNumber"
3. Extract the full answer text (transcribe handwriting as accurately as possible)
4. Provide normalized bounding box coordinates (0.0 to 1.0) for each answer region
5. If an answer spans multiple pages, include all regions
6. Handle out-of-order answers, missing numbers, and answers without question numbers

For bounding boxes:
- x: left edge (0 = far left, 1 = far right)
- y: top edge (0 = top, 1 = bottom)
- width: width of region
- height: height of region

Return a JSON object with this EXACT structure:
{
  "answers": [
    {
      "questionNumber": "1",
      "text": "transcribed answer text here",
      "regions": [
        {
          "page": 1,
          "bbox": { "x": 0.05, "y": 0.12, "width": 0.90, "height": 0.18 }
        }
      ],
      "confidence": 0.92
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object, no markdown, no explanation
- If no question number is visible, omit "questionNumber"
- Confidence: 0.0 (unreadable) to 1.0 (perfectly clear)
- Bounding boxes must be normalized (all values 0–1)
`.trim();

async function callVisionWithRetry(
  client: OpenAI,
  prompt: string,
  pages: DocumentPage[],
  maxRetries = 2
): Promise<string> {
  const imageContent = pages.map((page) => ({
    type: "image_url" as const,
    image_url: {
      url: `data:image/png;base64,${page.imageBase64}`,
      detail: "high" as const,
    },
  }));

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.AI_MODEL || "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...imageContent,
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.1,
      });

      return response.choices[0]?.message?.content ?? "";
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("Vision API call failed");
}

function parseJsonResponse(raw: string): unknown {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export const openAIVisionProvider: VisionProvider = {
  async extractQuestions(pages: DocumentPage[]): Promise<ExtractedQuestion[]> {
    const client = getOpenAIClient();
    const raw = await callVisionWithRetry(client, QUESTION_EXTRACTION_PROMPT, pages);

    try {
      const parsed = parseJsonResponse(raw);
      const validated = ExtractedQuestionsSchema.parse(parsed);
      return validated.questions;
    } catch (err) {
      console.error("Question extraction parse error:", err, "\nRaw:", raw);
      throw new Error("Failed to parse extracted questions from AI response");
    }
  },

  async extractAnswers(pages: DocumentPage[]): Promise<ExtractedAnswer[]> {
    const client = getOpenAIClient();
    const raw = await callVisionWithRetry(client, ANSWER_EXTRACTION_PROMPT, pages);

    try {
      const parsed = parseJsonResponse(raw);
      const validated = ExtractedAnswersSchema.parse(parsed);
      return validated.answers;
    } catch (err) {
      console.error("Answer extraction parse error:", err, "\nRaw:", raw);
      throw new Error("Failed to parse extracted answers from AI response");
    }
  },
};

export const mockVisionProvider: VisionProvider = {
  async extractQuestions(): Promise<ExtractedQuestion[]> {
    return getRealPhysicsQuestions();
  },

  async extractAnswers(): Promise<ExtractedAnswer[]> {
    return getDemoAnswers();
  },
};

export function getVisionProvider(isDemo = false): VisionProvider {
  if (isDemo || !process.env.OPENAI_API_KEY) {
    return mockVisionProvider;
  }
  return openAIVisionProvider;
}

export function getDemoQuestions(): ExtractedQuestion[] {
  return getRealPhysicsQuestions();
}

export function getDemoAnswers(): ExtractedAnswer[] {
  const questions = getRealPhysicsQuestions();
  return questions.map((q, idx) => ({
    questionNumber: q.number === "4" ? undefined : q.number,
    text: q.number === "4" ? "(left blank)" : `Answer for Physics Q${q.number}: ${q.text.slice(0, 80)}`,
    regions: [
      {
        page: Math.min(idx + 1, 21),
        bbox: { x: 0.05, y: 0.12, width: 0.88, height: 0.15 },
      },
    ],
    confidence: q.number === "4" ? 0.3 : 0.95,
  }));
}
