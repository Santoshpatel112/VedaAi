// ─── Core Data Models ────────────────────────────────────────────────────────

export interface Question {
  id: string; // "q11a", "q1", etc.
  number: string; // "11(a)", "1", etc. — original display number
  normalizedNumber: string; // "11a", "1" — for matching
  text: string;
  page: number;
  marks?: number;
  section?: string;
}

export interface AnswerRegion {
  page: number;
  bbox: BoundingBox; // normalized 0–1 coordinates
}

export interface BoundingBox {
  x: number; // 0–1
  y: number; // 0–1
  width: number; // 0–1
  height: number; // 0–1
}

export interface StudentAnswer {
  id: string;
  questionNumber?: string; // as written by student (raw)
  normalizedNumber?: string; // normalized form
  text: string;
  regions: AnswerRegion[];
  confidence?: number; // 0–1 OCR confidence
}

export type MappingStatus = "matched" | "unanswered" | "unmatched" | "uncertain";

export interface AnswerMapping {
  questionId: string;
  answerId?: string;
  status: MappingStatus;
  confidence: number; // 0–1
  deterministic: boolean; // true if matched by Q-number, false if semantic
  semanticScore?: number;
  score?: number; // marks awarded (optional grading)
  maxScore?: number;
  feedback?: string; // AI feedback (optional grading)
}

export interface ExamResults {
  questions: Question[];
  answers: StudentAnswer[];
  mappings: AnswerMapping[];
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  uncertainCount: number;
  unmatchedCount: number;
  totalMarks: number;
  awardedMarks: number;
  gradingEnabled: boolean;
  questionPaperPageCount: number;
  answerSheetPageCount: number;
}

// ─── Processing Job ───────────────────────────────────────────────────────────

export type JobStatus = "queued" | "processing" | "complete" | "failed";

export const PROCESSING_STAGES = [
  { key: "uploading", label: "Uploading files", progress: 5 },
  { key: "rendering", label: "Rendering pages", progress: 12 },
  { key: "extracting_questions", label: "Processing Question Paper", progress: 28 },
  { key: "parsing_questions", label: "Extracting Questions", progress: 38 },
  { key: "extracting_answers", label: "Processing Answer Sheet", progress: 52 },
  { key: "reading_handwriting", label: "Reading Handwriting", progress: 62 },
  { key: "detecting_numbers", label: "Detecting Question Numbers", progress: 68 },
  { key: "generating_embeddings", label: "Generating Embeddings", progress: 78 },
  { key: "mapping_answers", label: "Mapping Answers", progress: 88 },
  { key: "calculating_confidence", label: "Calculating Confidence", progress: 94 },
  { key: "completed", label: "Preparing Results", progress: 100 },
] as const;

export type ProcessingStageKey = (typeof PROCESSING_STAGES)[number]["key"];

export interface ProcessingJob {
  id: string;
  status: JobStatus;
  stage: ProcessingStageKey;
  progress: number;
  error?: string;
  results?: ExamResults;
  createdAt: number;
  questionPaperPath?: string; // Legacy support for local dev
  answerSheetPath?: string; // Legacy support for local dev
  questionPaperBuffer?: Buffer; // Memory-based file storage
  answerSheetBuffer?: Buffer; // Memory-based file storage
  questionPaperMimeType?: string;
  answerSheetMimeType?: string;
  isDemo?: boolean;
}

// ─── Upload Types ─────────────────────────────────────────────────────────────

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  pageCount?: number;
}

// ─── AI Provider Interfaces ───────────────────────────────────────────────────

export interface DocumentPage {
  pageNumber: number;
  imageBase64: string; // base64 PNG
  width: number;
  height: number;
}

export interface ExtractedQuestion {
  number: string;
  text: string;
  page: number;
  marks?: number;
  section?: string;
}

export interface ExtractedAnswer {
  questionNumber?: string;
  text: string;
  regions: Array<{
    page: number;
    bbox: BoundingBox;
  }>;
  confidence?: number;
}

export interface ExtractedDocument {
  questions?: ExtractedQuestion[];
  answers?: ExtractedAnswer[];
}

export interface GradeResult {
  score: number;
  maxScore: number;
  feedback: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateExamResponse {
  jobId: string;
}

export interface StatusResponse {
  status: JobStatus;
  stage: ProcessingStageKey;
  progress: number;
  error?: string;
}
