import { readFileSync } from "node:fs";
import { join } from "node:path";
import { callClaude } from "../llm_client";
import { LeadInputSchema, QualificationSchema } from "../validation";
import { writeLeadToNotion } from "../../lib/notion";

function loadWorkflow() {
  const root = process.cwd();
  const rubric = readFileSync(join(root, "src", "workflows", "scoring_rubric.md"), "utf-8");
  const redFlags = readFileSync(join(root, "src", "workflows", "red_flags.md"), "utf-8");
  const promptTemplate = readFileSync(
    join(root, "src", "workflows", "prompts", "qualify_lead.md"),
    "utf-8"
  );
  return { rubric, redFlags, promptTemplate };
}

const samples = {
  emergency: {
    fullName: "Maria Gonzalez",
    phone: "+15552018843",
    email: "maria.gonzalez@email.com",
    patientType: "new" as const,
    reasonForVisit: "Cracked a molar this morning and I'm in severe pain, some swelling on my cheek.",
    painLevel: "severe" as const,
    insuranceProvider: "Delta Dental PPO",
    preferredClinic: "Miami" as const,
    preferredTiming: "asap" as const,
    source: "google_search" as const,
  },
  cosmeticInterest: {
    fullName: "Jordan Lee",
    phone: "+15559092210",
    email: "",
    patientType: "not_sure" as const,
    reasonForVisit: "Just curious about teeth whitening, not in a rush, someday maybe.",
    painLevel: "none" as const,
    insuranceProvider: "",
    preferredClinic: "No preference" as const,
    preferredTiming: "flexible" as const,
    source: "instagram_ad" as const,
  },
  moderatePainNextWeek: {
    fullName: "Alex Rivera",
    phone: "+15554027719",
    email: "alex.rivera@email.com",
    patientType: "returning" as const,
    reasonForVisit: "Lingering dull ache in a lower molar for a few days, no swelling.",
    painLevel: "moderate" as const,
    insuranceProvider: "no tengo",
    preferredClinic: "Boston" as const,
    preferredTiming: "this_week" as const,
    source: "whatsapp" as const,
  },
};

async function qualify(label: string, raw: unknown, expectedRedFlags: string[]) {
  const lead = LeadInputSchema.parse(raw);
  const { rubric, redFlags, promptTemplate } = loadWorkflow();

  const system = `You are a patient intake triage assistant for a dental clinic. Score inbound patient inquiries using ONLY the rubric below. Respond with STRICT JSON and nothing else.\n\n### RUBRIC\n${rubric}\n\n### RED FLAGS (controlled vocabulary)\n${redFlags}`;
  const user = promptTemplate.replace("{{lead_json}}", JSON.stringify(lead, null, 2));

  console.log(`\n=== ${label} ===`);
  const response = await callClaude(system, user);
  const cleaned = response.replace(/```json/gi, "").replace(/```/g, "").trim();
  const result = QualificationSchema.parse(JSON.parse(cleaned));

  console.log(JSON.stringify(result, null, 2));

  const actual = [...result.red_flags].sort();
  const expected = [...expectedRedFlags].sort();
  const matches = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(
    matches
      ? `✅ red_flags matches expected: [${expected.join(", ")}]`
      : `⚠️  red_flags mismatch. Expected: [${expected.join(", ")}] — Got: [${actual.join(", ")}]`
  );

  // No runId here — this is a local smoke test, not a real trigger.dev run.
  // Internal Notes will simply omit the "Run ID:" line (see Pulido B).
  const notionPageId = await writeLeadToNotion(lead, result, undefined);

  if (notionPageId) {
    const url = `https://notion.so/${notionPageId.replace(/-/g, "")}`;
    console.log(`✅ Notion page created: ${notionPageId}`);
    console.log(`   URL: ${url}`);
  } else {
    console.log("⚠️  Notion write failed (see [notion] error log above) — score was NOT lost.");
  }

  return { result, notionPageId };
}

async function main() {
  const hot = await qualify("Emergency patient (expect Hot)", samples.emergency, []);
  const cold = await qualify(
    "Cosmetic curiosity, no rush (expect Cold)",
    samples.cosmeticInterest,
    // missing_contact_info no longer applies here: the calibrated rule (ADR-006)
    // requires BOTH phone and email missing, and this sample has a phone.
    ["no_urgency_low_value"]
  );
  const moderatePain = await qualify(
    "Moderate pain, this week (Notion schema smoke test: painLevel + preferredTiming)",
    samples.moderatePainNextWeek,
    []
  );

  console.log("\n=== Summary ===");
  console.log(
    `Hot  → notionPageId: ${hot.notionPageId ?? "null"}${
      hot.notionPageId ? ` — https://notion.so/${hot.notionPageId.replace(/-/g, "")}` : ""
    }`
  );
  console.log(
    `Cold → notionPageId: ${cold.notionPageId ?? "null"}${
      cold.notionPageId ? ` — https://notion.so/${cold.notionPageId.replace(/-/g, "")}` : ""
    }`
  );
  console.log(
    `Moderate → notionPageId: ${moderatePain.notionPageId ?? "null"}${
      moderatePain.notionPageId
        ? ` — https://notion.so/${moderatePain.notionPageId.replace(/-/g, "")}`
        : ""
    }`
  );

  console.log("\n✅ All cases validated against the Output contract.");
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
