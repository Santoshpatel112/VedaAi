import type { ProcessingJob, ProcessingStageKey, JobStatus } from "@/lib/types";

// In-memory state is retained for local development. Production deployments
// should use a shared backing store for jobs; missing state is handled by the
// API as an explicit error rather than leaving polling stuck forever.
const jobs = new Map<string, ProcessingJob>();

export function createJob(
  id: string,
  questionPaperPath: string,
  answerSheetPath: string,
  isDemo = false
): ProcessingJob {
  const job: ProcessingJob = {
    id,
    status: "queued",
    stage: "uploading",
    progress: 0,
    createdAt: Date.now(),
    questionPaperPath,
    answerSheetPath,
    isDemo,
  };
  jobs.set(id, job);
  return job;
}

/**
 * Create a job with file buffers for memory-based processing (Vercel-safe)
 */
export function createJobWithBuffers(
  id: string,
  questionPaperBuffer: Buffer,
  answerSheetBuffer: Buffer,
  questionPaperMimeType: string,
  answerSheetMimeType: string,
  isDemo = false
): ProcessingJob {
  const job: ProcessingJob = {
    id,
    status: "queued",
    stage: "uploading",
    progress: 0,
    createdAt: Date.now(),
    questionPaperBuffer,
    answerSheetBuffer,
    questionPaperMimeType,
    answerSheetMimeType,
    isDemo,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): ProcessingJob | undefined {
  return jobs.get(id);
}

export function updateJobStage(
  id: string,
  stage: ProcessingStageKey,
  progress: number,
  status: JobStatus = "processing"
): void {
  const job = jobs.get(id);
  if (!job) return;
  job.stage = stage;
  job.progress = progress;
  job.status = status;
  jobs.set(id, job);
}

export function completeJob(id: string, results: ProcessingJob["results"]): void {
  const job = jobs.get(id);
  if (!job) return;
  job.status = "complete";
  job.stage = "completed";
  job.progress = 100;
  job.results = results;
  jobs.set(id, job);
}

export function failJob(id: string, error: string): void {
  const job = jobs.get(id);
  if (!job) return;
  job.status = "failed";
  job.error = error;
  jobs.set(id, job);
}

// Clean up old jobs (> 1 hour)
export function cleanupOldJobs(): void {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of jobs.entries()) {
    if (job.createdAt < cutoff) {
      jobs.delete(id);
    }
  }
}
