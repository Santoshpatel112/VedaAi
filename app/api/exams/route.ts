import { after, NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createJob, createJobWithBuffers } from "@/lib/jobs/job-store";
import { validateFileUpload } from "@/lib/validation/schemas";
import { createServiceClient } from "@/utils/supabase/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "assessment-files";

/**
 * Standardized error response helper
 */
function createErrorResponse(message: string, status: number, requestId?: string) {
  return NextResponse.json(
    { 
      error: message,
      ...(requestId && { requestId }),
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  const requestId = uuidv4();
  try {
    const contentType = request.headers.get("content-type") ?? "";
    console.info("POST /api/exams started", { requestId, contentType });
    
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.demo === true) return await startDemoJob();
      
      const questionPaperPath = body.questionPaperPath;
      const answerSheetPath = body.answerSheetPath;
      
      if (
        typeof questionPaperPath !== "string" ||
        typeof answerSheetPath !== "string" ||
        !isValidStoragePath(questionPaperPath, "questionPaper") ||
        !isValidStoragePath(answerSheetPath, "answerSheet")
      ) {
        return createErrorResponse("Invalid uploaded file paths provided", 400, requestId);
      }

      // Use service client for downloading files from storage
      const supabase = createServiceClient();
      const jobId = uuidv4();
      
      try {
        console.info(`Downloading files from bucket ${STORAGE_BUCKET}`);
        const downloadPromises = [
          { key: "questionPaper", path: questionPaperPath },
          { key: "answerSheet", path: answerSheetPath },
        ].map(async ({ key, path }) => {
          console.info(`Downloading ${path} from bucket ${STORAGE_BUCKET}`);
          const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(path);
          if (error || !data) {
            console.error(`Download error for ${path}:`, error);
            throw new Error(error?.message || `Unable to download ${key} from Storage.`);
          }
          
          const validation = validateFileUpload(path.split('/').pop() || '', data.type, data.size);
          if (!validation.valid) throw new Error(`${key}: ${validation.error}`);
          
          return {
            key,
            buffer: Buffer.from(await data.arrayBuffer()),
            mimeType: data.type,
          };
        });
        
        const downloadedFiles = await Promise.all(downloadPromises);
        const questionPaper = downloadedFiles.find(f => f.key === "questionPaper")!;
        const answerSheet = downloadedFiles.find(f => f.key === "answerSheet")!;
        
        // Create job with buffers (memory-based, Vercel-safe)
        createJobWithBuffers(
          jobId,
          questionPaper.buffer,
          answerSheet.buffer,
          questionPaper.mimeType,
          answerSheet.mimeType,
          false
        );
        
        launchProcessing(jobId, "", "", false);
        return NextResponse.json({ jobId, status: "queued", isDemo: false });
      } catch (downloadError) {
        console.error("File download error:", downloadError);
        const message = downloadError instanceof Error ? downloadError.message : "Failed to download files from storage";
        return createErrorResponse(message, 500, requestId);
      }
    }

    if (!contentType.includes("multipart/form-data")) {
      return createErrorResponse("Invalid content type. Expected JSON or multipart/form-data", 400, requestId);
    }

    const formData = await request.formData();

    const questionPaperFile = formData.get("questionPaper") as File | null;
    const answerSheetFile = formData.get("answerSheet") as File | null;
    const isDemo = formData.get("demo") === "true";

    if (isDemo) {
      return await startDemoJob();
    }

    if (!questionPaperFile || !answerSheetFile) {
      return createErrorResponse(
        "Both questionPaper and answerSheet files are required", 
        400, 
        requestId
      );
    }

    // Validate question paper
    const qpValidation = validateFileUpload(
      questionPaperFile.name,
      questionPaperFile.type,
      questionPaperFile.size
    );
    if (!qpValidation.valid) {
      return createErrorResponse(
        `Question paper: ${qpValidation.error}`, 
        400, 
        requestId
      );
    }

    // Validate answer sheet
    const asValidation = validateFileUpload(
      answerSheetFile.name,
      answerSheetFile.type,
      answerSheetFile.size
    );
    if (!asValidation.valid) {
      return createErrorResponse(
        `Answer sheet: ${asValidation.error}`, 
        400, 
        requestId
      );
    }

    const jobId = uuidv4();

    try {
      // Process files directly in memory (Vercel-safe)
      const questionPaperBuffer = Buffer.from(await questionPaperFile.arrayBuffer());
      const answerSheetBuffer = Buffer.from(await answerSheetFile.arrayBuffer());

      // Create job with buffers instead of file paths
      createJobWithBuffers(
        jobId,
        questionPaperBuffer,
        answerSheetBuffer,
        questionPaperFile.type,
        answerSheetFile.type,
        false
      );

      // Run pipeline async (don't await — return jobId immediately)
      launchProcessing(jobId, "", "", false);

      return NextResponse.json({ jobId, status: "queued", isDemo: false });
    } catch (fileError) {
      console.error("File processing error:", fileError);
      const message = fileError instanceof Error ? fileError.message : "Failed to process uploaded files";
      return createErrorResponse(message, 500, requestId);
    }
  } catch (err) {
    console.error("POST /api/exams error:", { requestId, error: err });
    const message = err instanceof Error ? err.message : "Unknown server error";
    return createErrorResponse(message, 500, requestId);
  }
}

function isValidStoragePath(storagePath: string, fileKey: string): boolean {
  const parts = storagePath.split("/");
  if (parts.length !== 2 || !/^[0-9a-f-]{36}$/i.test(parts[0])) return false;
  const filename = parts[1];
  return (
    filename.startsWith(`${fileKey}-`) &&
    [".pdf", ".png", ".jpg", ".jpeg"].some(ext => filename.toLowerCase().endsWith(ext)) &&
    !filename.includes("..")
  );
}

function launchProcessing(
  jobId: string,
  questionPaperPath: string,
  answerSheetPath: string,
  isDemo: boolean
): void {
  after(async () => {
    try {
      const { processExam } = await import("@/lib/pipeline");
      await processExam(jobId, questionPaperPath, answerSheetPath, isDemo);
    } catch (error) {
      console.error("Pipeline startup error:", { jobId, error });
      const { failJob } = await import("@/lib/jobs/job-store");
      const message = error instanceof Error ? error.message : "Pipeline startup failed";
      failJob(jobId, message);
    }
  });
}

async function startDemoJob() {
  try {
    const jobId = uuidv4();
    // Demo processing is fully data-driven; it must not depend on files that
    // can disappear between serverless invocations.
    createJob(jobId, "", "", true);
    launchProcessing(jobId, "", "", true);
    return NextResponse.json({ jobId, status: "queued", isDemo: true });
  } catch (error) {
    console.error("Demo job creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create demo job";
    return createErrorResponse(message, 500);
  }
}
