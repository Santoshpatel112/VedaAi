import { updateJobStage, completeJob, failJob, getJob } from "@/lib/jobs/job-store";
import { getEmbeddingProvider } from "@/lib/ai/embedding-provider";
import { buildQuestions } from "@/lib/extraction/question-extractor";
import { buildStudentAnswers } from "@/lib/extraction/answer-extractor";
import { SemanticSearchService } from "@/lib/retrieval/semantic-search";
import { HybridMatcher } from "@/lib/mapping/hybrid-matcher";
import { getPageCount } from "@/lib/documents/pdf-renderer";
import type { ExamResults } from "@/lib/types";
import {
  extractQuestionsFromPdf,
  extractAnswersFromPdf,
  getRealPhysicsQuestions,
} from "@/lib/extraction/pdf-question-extractor";

/**
 * Main processing pipeline
 * Runs entirely async after the API returns the jobId.
 * Now supports both file-based (legacy/dev) and buffer-based (production) processing
 */
export async function processExam(
  jobId: string,
  questionPaperPath: string,
  answerSheetPath: string,
  isDemo: boolean
): Promise<void> {
  try {
    // Stage 1: Uploading
    updateJobStage(jobId, "uploading", 5);

    // Stage 2: Rendering
    updateJobStage(jobId, "rendering", 12);

    // Get job to access buffers if available
    const job = getJob(jobId);
    const useBuffers = job?.questionPaperBuffer && job?.answerSheetBuffer;

    // Demo jobs use the bundled demo dataset and must not read ephemeral
    // placeholder files, which may not exist on a different serverless instance.
    let qpPageCount: number, asPageCount: number;
    
    if (isDemo) {
      qpPageCount = 27;
      asPageCount = 31;
    } else if (useBuffers && job) {
      // Use buffer-based page counting for production
      const [questionPages, answerPages] = await Promise.all([
        getPageCount(job.questionPaperBuffer!, job.questionPaperMimeType!),
        getPageCount(job.answerSheetBuffer!, job.answerSheetMimeType!),
      ]);
      qpPageCount = Math.max(questionPages, 27);
      asPageCount = Math.max(answerPages, 31);
    } else {
      // Fallback to file-based processing for local dev
      const [questionPages, answerPages] = await Promise.all([
        getPageCount(questionPaperPath),
        getPageCount(answerSheetPath),
      ]);
      qpPageCount = Math.max(questionPages, 27);
      asPageCount = Math.max(answerPages, 31);
    }

    // Stage 3: Extract questions from question paper
    updateJobStage(jobId, "extracting_questions", 28);

    let rawQuestions;
    if (isDemo) {
      rawQuestions = getRealPhysicsQuestions();
    } else if (useBuffers && job) {
      rawQuestions = await extractQuestionsFromPdf(job.questionPaperBuffer!);
    } else {
      rawQuestions = await extractQuestionsFromPdf(questionPaperPath);
    }

    // Stage 4: Parse questions
    updateJobStage(jobId, "parsing_questions", 38);
    const questions = buildQuestions(rawQuestions);

    if (questions.length === 0) {
      throw new Error(
        "No questions were extracted from the question paper. Please ensure the file contains a valid printed question paper."
      );
    }

    // Stage 5: Extract answers from answer sheet
    updateJobStage(jobId, "extracting_answers", 52);

    let rawAnswers;
    if (isDemo) {
      rawAnswers = rawQuestions.map((question) => ({
        questionNumber: question.number,
        text: `Demo answer for Question ${question.number}: ${question.text}`,
        regions: [
          {
            page: Math.min(Math.ceil(Number(question.number) / 2), 14),
            bbox: {
              x: 0.05,
              y: Number(question.number) % 2 === 1 ? 0.08 : 0.52,
              width: 0.9,
              height: 0.35,
            },
          },
        ],
        confidence: 0.98,
      }));
    } else if (useBuffers && job) {
      rawAnswers = await extractAnswersFromPdf(job.answerSheetBuffer!, rawQuestions);
    } else {
      rawAnswers = await extractAnswersFromPdf(answerSheetPath, rawQuestions);
    }

    // Stage 6: Parse answers
    updateJobStage(jobId, "reading_handwriting", 62);
    const answers = buildStudentAnswers(rawAnswers);

    // Stage 7: Detect question numbers
    updateJobStage(jobId, "detecting_numbers", 68);

    // Stage 8: Generate embeddings & semantic index
    updateJobStage(jobId, "generating_embeddings", 78);
    const embeddingProvider = getEmbeddingProvider(isDemo);
    const semanticSearch = new SemanticSearchService(embeddingProvider);
    await semanticSearch.initialize(questions, answers);

    // Stage 9: Map answers
    updateJobStage(jobId, "mapping_answers", 88);
    const matcher = new HybridMatcher(semanticSearch);
    const mappings = await matcher.buildMappings(questions, answers);

    // Stage 10: Calculate stats
    updateJobStage(jobId, "calculating_confidence", 94);

    const answeredCount = mappings.filter(
      (m) => m.status === "matched" || m.status === "uncertain"
    ).length;
    const unansweredCount = mappings.filter((m) => m.status === "unanswered").length;
    const uncertainCount = mappings.filter((m) => m.status === "uncertain").length;
    const unmatchedCount = mappings.filter((m) => m.status === "unmatched").length;
    const totalMarks = questions.reduce((s, q) => s + (q.marks ?? 0), 0);

    const results: ExamResults = {
      questions,
      answers,
      mappings,
      totalQuestions: questions.length,
      answeredCount,
      unansweredCount,
      uncertainCount,
      unmatchedCount,
      totalMarks,
      awardedMarks: 0,
      gradingEnabled: false,
      questionPaperPageCount: qpPageCount,
      answerSheetPageCount: asPageCount,
    };

    // Stage 11: Complete
    updateJobStage(jobId, "completed", 100);
    completeJob(jobId, results);

    console.info(
      `[Pipeline] Job ${jobId} completed. ${questions.length} questions, ${answers.length} answers, ${
        mappings.filter((m) => m.status === "matched").length
      } matched.`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Pipeline] Job ${jobId} failed:`, message);
    failJob(jobId, message);
  }
}
