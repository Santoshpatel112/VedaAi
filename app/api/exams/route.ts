import { after, NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createJob } from "@/lib/jobs/job-store";
import { validateFileUpload } from "@/lib/validation/schemas";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = uuidv4();
  try {
    const contentType = request.headers.get("content-type") ?? "";
    console.info("POST /api/exams started", { requestId, contentType });
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.demo === true) return await startDemoJob();
      return NextResponse.json({ error: "Use multipart form data for uploaded files." }, { status: 400 });
    }

    const formData = await request.formData();

    const questionPaperFile = formData.get("questionPaper") as File | null;
    const answerSheetFile = formData.get("answerSheet") as File | null;
    const isDemo = formData.get("demo") === "true";

    if (isDemo) {
      return await startDemoJob();
    }

    if (!questionPaperFile || !answerSheetFile) {
      return NextResponse.json(
        { error: "Both questionPaper and answerSheet files are required." },
        { status: 400 }
      );
    }

    // Validate question paper
    const qpValidation = validateFileUpload(
      questionPaperFile.name,
      questionPaperFile.type,
      questionPaperFile.size
    );
    if (!qpValidation.valid) {
      return NextResponse.json(
        { error: `Question paper: ${qpValidation.error}` },
        { status: 400 }
      );
    }

    // Validate answer sheet
    const asValidation = validateFileUpload(
      answerSheetFile.name,
      answerSheetFile.type,
      answerSheetFile.size
    );
    if (!asValidation.valid) {
      return NextResponse.json(
        { error: `Answer sheet: ${asValidation.error}` },
        { status: 400 }
      );
    }

    // Save files under the OS temporary directory, which is the only writable
    // location guaranteed by Vercel serverless functions.
    const jobId = uuidv4();
    const jobDir = await fs.mkdtemp(path.join(os.tmpdir(), "veda-"));

    const qpExt = path.extname(questionPaperFile.name).toLowerCase();
    const asExt = path.extname(answerSheetFile.name).toLowerCase();
    const qpPath = path.join(jobDir, `question_paper${qpExt}`);
    const asPath = path.join(jobDir, `answer_sheet${asExt}`);

    await Promise.all([
      fs.writeFile(qpPath, Buffer.from(await questionPaperFile.arrayBuffer())),
      fs.writeFile(asPath, Buffer.from(await answerSheetFile.arrayBuffer())),
    ]);

    // Create job and kick off pipeline
    createJob(jobId, qpPath, asPath, false);

    // Run pipeline async (don't await — return jobId immediately)
    launchProcessing(jobId, qpPath, asPath, false);

    return NextResponse.json({ jobId, status: "queued", isDemo: false });
  } catch (err) {
    console.error("POST /api/exams error:", { requestId, error: err });
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json(
      { error: message, requestId },
      { status: 500 }
    );
  }
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
    }
  });
}

async function startDemoJob() {
  const jobId = uuidv4();
  // Demo processing is fully data-driven; it must not depend on files that
  // can disappear between serverless invocations.
  const qpPath = "";
  const asPath = "";
  createJob(jobId, qpPath, asPath, true);
  launchProcessing(jobId, qpPath, asPath, true);
  return NextResponse.json({ jobId, status: "queued", isDemo: true });
}
