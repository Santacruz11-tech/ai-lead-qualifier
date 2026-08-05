import { NextRequest, NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";
import type { QualifyLeadOutput } from "@/lib/types";

const TERMINAL_FAILURE_STATUSES = new Set([
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "CANCELED",
  "EXPIRED",
  "TIMED_OUT",
]);

// Polled by the frontend every ~2s (see app/result) until the run finishes.
export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId");
  if (!runId) {
    return NextResponse.json({ error: "Missing runId" }, { status: 400 });
  }

  try {
    const run = await runs.retrieve(runId);

    if (run.status === "COMPLETED") {
      return NextResponse.json({
        status: "COMPLETED",
        output: run.output as QualifyLeadOutput,
      });
    }

    if (TERMINAL_FAILURE_STATUSES.has(run.status)) {
      return NextResponse.json({
        status: "FAILED",
        error: run.error?.message ?? "The qualification run did not complete successfully.",
      });
    }

    return NextResponse.json({ status: "PENDING" });
  } catch (error) {
    console.error("[api/qualify/status] Failed to retrieve run", error);
    return NextResponse.json({ error: "Failed to fetch run status" }, { status: 502 });
  }
}
