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

    if (job.status !== "complete") {
      return NextResponse.json(
        { error: `Job not complete. Current status: ${job.status}` },
        { status: 409 }
      );
    }

    if (!job.results) {
      return NextResponse.json(
        { error: "Results not available" },
        { status: 500 }
      );
    }

    return NextResponse.json(job.results);
  } catch (error) {
    console.error("GET /api/exams/[id]/results error:", error);
    return NextResponse.json(
      { error: "Internal server error while retrieving job results" },
      { status: 500 }
    );
  }
}
