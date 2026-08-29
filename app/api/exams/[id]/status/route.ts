import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs/job-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid job ID provided" },
        { status: 400 }
      );
    }

    const job = getJob(id);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      error: job.error,
    });
  } catch (error) {
    console.error("GET /api/exams/[id]/status error:", error);
    return NextResponse.json(
      { error: "Internal server error while retrieving job status" },
      { status: 500 }
    );
  }
}
