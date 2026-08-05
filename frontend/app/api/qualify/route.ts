import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { LeadInput } from "@/lib/types";

// Triggers the trigger.dev `qualify-lead` task and hands back the run ID.
// TRIGGER_SECRET_KEY is read server-side by the SDK and never reaches the browser.
export async function POST(request: NextRequest) {
  console.log('[DEBUG] TRIGGER_SECRET_KEY defined:', typeof process.env.TRIGGER_SECRET_KEY);
  console.log('[DEBUG] TRIGGER_SECRET_KEY length:', process.env.TRIGGER_SECRET_KEY?.length || 0);
  console.log('[DEBUG] TRIGGER_SECRET_KEY prefix:', process.env.TRIGGER_SECRET_KEY?.slice(0, 10) || 'undefined');
  console.log('[DEBUG] All TRIGGER env vars:', Object.keys(process.env).filter(k => k.startsWith('TRIGGER')));

  let payload: Partial<LeadInput>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.fullName?.trim() || !payload.phone?.trim() || !payload.reasonForVisit?.trim()) {
    return NextResponse.json(
      { error: "fullName, phone, and reasonForVisit are required" },
      { status: 400 }
    );
  }

  try {
    const handle = await tasks.trigger("qualify-lead", payload);
    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("[api/qualify] Failed to trigger qualify-lead task", error);
    return NextResponse.json({ error: "Failed to start qualification" }, { status: 502 });
  }
}
