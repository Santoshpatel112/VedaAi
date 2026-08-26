import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs/job-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    error: job.error,
  });
}
