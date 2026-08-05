import { task } from "@trigger.dev/sdk/v3";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { callClaude } from "../tools/llm_client";
import {
  LeadInputSchema,
  QualificationSchema,
  type QualifyLeadOutput,
} from "../tools/validation";
import { writeLeadToNotion } from "../lib/notion";

function loadWorkflow() {
  const root = process.cwd();
  const rubric = readFileSync(
    join(root, "src", "workflows", "scoring_rubric.md"),
    "utf-8"
  );
  const redFlags = readFileSync(
    join(root, "src", "workflows", "red_flags.md"),
    "utf-8"
  );
  const promptTemplate = readFileSync(
    join(root, "src", "workflows", "prompts", "qualify_lead.md"),
    "utf-8"
  );
  return { rubric, redFlags, promptTemplate };
}

export const qualifyLead = task({
  id: "qualify-lead",
  maxDuration: 60,
  run: async (payload: unknown, { ctx }): Promise<QualifyLeadOutput> => {
    const lead = LeadInputSchema.parse(payload);
    const { rubric, redFlags, promptTemplate } = loadWorkflow();

    const system = `You are a patient intake triage assistant for a dental clinic. Score inbound patient inquiries using ONLY the rubric below. Respond with STRICT JSON and nothing else.\n\n### RUBRIC\n${rubric}\n\n### RED FLAGS (controlled vocabulary)\n${redFlags}`;
    const user = promptTemplate.replace(
      "{{lead_json}}",
      JSON.stringify(lead, null, 2)
    );

    const raw = await callClaude(system, user);

    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const qualifierResult = QualificationSchema.parse(parsed);

    const notionPageId = await writeLeadToNotion(lead, qualifierResult, ctx.run.id);

    return { ...qualifierResult, notionPageId };
  },
});
