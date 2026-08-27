import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createJob } from "@/lib/jobs/job-store";
import { processExam } from "@/lib/pipeline";
import { validateFileUpload } from "@/lib/validation/schemas";
import { createClient } from "@/utils/supabase/server";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "tmp", "veda");

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.demo === true) return await startDemoJob();

      const questionPaperPath = body.files?.questionPaper;
      const answerSheetPath = body.files?.answerSheet;
      if (typeof questionPaperPath !== "string" || typeof answerSheetPath !== "string") {
        return NextResponse.json({ error: "Uploaded file paths are required." }, { status: 400 });
      }

      const supabase = createClient(await cookies());
      const jobId = uuidv4();
      const jobDir = path.join(UPLOAD_DIR, jobId);
      await mkdir(jobDir, { recursive: true });
      const files = [
        {
          storagePath: questionPaperPath,
          localPath: path.join(jobDir, `question_paper${path.extname(questionPaperPath)}`),
        },
        {
          storagePath: answerSheetPath,
          localPath: path.join(jobDir, `answer_sheet${path.extname(answerSheetPath)}`),
        },
      ];
      for (const file of files) {
        const { data, error } = await supabase.storage.from("assessment-files").download(file.storagePath);
        if (error || !data) throw new Error(error?.message ?? "Unable to download uploaded file.");
        const validation = validateFileUpload(path.basename(file.storagePath), data.type, data.size);
        if (!validation.valid) throw new Error(validation.error);
        await writeFile(file.localPath, Buffer.from(await data.arrayBuffer()));
      }
      createJob(jobId, files[0].localPath, files[1].localPath, false);
      processExam(jobId, files[0].localPath, files[1].localPath, false).catch((err) =>
        console.error("Pipeline error:", err)
      );
      return NextResponse.json({ jobId, isDemo: false });
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

    // Save files
    const jobId = uuidv4();
    const jobDir = path.join(UPLOAD_DIR, jobId);
    await mkdir(jobDir, { recursive: true });

    const qpExt = path.extname(questionPaperFile.name).toLowerCase();
    const asExt = path.extname(answerSheetFile.name).toLowerCase();

    const qpPath = path.join(jobDir, `question_paper${qpExt}`);
    const asPath = path.join(jobDir, `answer_sheet${asExt}`);

    const [qpBuffer, asBuffer] = await Promise.all([
      questionPaperFile.arrayBuffer(),
      answerSheetFile.arrayBuffer(),
    ]);

    await Promise.all([
      writeFile(qpPath, Buffer.from(qpBuffer)),
      writeFile(asPath, Buffer.from(asBuffer)),
    ]);

    // Create job and kick off pipeline
    createJob(jobId, qpPath, asPath, false);

    // Run pipeline async (don't await — return jobId immediately)
    processExam(jobId, qpPath, asPath, false).catch((err) =>
      console.error("Pipeline error:", err)
    );

    return NextResponse.json({ jobId, isDemo: false });
  } catch (err) {
    console.error("POST /api/exams error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again." },
      { status: 500 }
    );
  }
}

async function startDemoJob() {
  const jobId = uuidv4();
  const jobDir = path.join(UPLOAD_DIR, jobId);
  await mkdir(jobDir, { recursive: true });
  const qpPath = path.join(jobDir, "question_paper.demo");
  const asPath = path.join(jobDir, "answer_sheet.demo");
  await writeFile(qpPath, "demo");
  await writeFile(asPath, "demo");
  createJob(jobId, qpPath, asPath, true);
  processExam(jobId, qpPath, asPath, true).catch((err) => console.error("Demo pipeline error:", err));
  return NextResponse.json({ jobId, isDemo: true });
}
