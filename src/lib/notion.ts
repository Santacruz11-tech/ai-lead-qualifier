import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client";
import type { LeadInput, Qualification } from "../tools/validation";

let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    const auth = process.env.NOTION_TOKEN;
    if (!auth) {
      throw new Error("NOTION_TOKEN is not set");
    }
    client = new Client({ auth });
  }
  return client;
}

function getLeadsDbId(): string {
  const id = process.env.NOTION_LEADS_DB_ID;
  if (!id) {
    throw new Error("NOTION_LEADS_DB_ID is not set");
  }
  return id;
}

// --- Write ------------------------------------------------------------------

const NO_INSURANCE_VALUES = new Set([
  "none",
  "no",
  "no tengo",
  "n/a",
  "na",
  "no insurance",
]);

// Presentation-only normalization for the Notion write: blank/omitted becomes
// "Not specified", common "I have no insurance" phrasings become the literal
// "None", anything else passes through unchanged.
function normalizeInsurance(raw: string | null | undefined): string {
  const value = raw ?? "";
  const trimmed = value.trim();
  if (!trimmed) return "Not specified";
  if (NO_INSURANCE_VALUES.has(trimmed.toLowerCase())) return "None";
  return value;
}

// Writes a scored lead to the Notion Leads DB. Fails soft: Notion outages or
// schema drift must never lose an already-computed qualification score, so
// any error here is logged and swallowed, returning null instead of throwing.
export async function writeLeadToNotion(
  input: LeadInput,
  qualifierResult: Qualification,
  runId?: string
): Promise<string | null> {
  try {
    const notion = getClient();

    const properties: CreatePageParameters["properties"] = {
      "Lead Name": { title: [{ text: { content: input.fullName } }] },
      Phone: { phone_number: input.phone },
      Email: { email: input.email || null },
      "Patient Type": { select: { name: input.patientType } },
      "Reason for Visit": { rich_text: [{ text: { content: input.reasonForVisit } }] },
      "Pain Level": { select: { name: input.painLevel } },
      "Preferred Clinic": { select: { name: input.preferredClinic } },
      "Urgency Signal": { select: { name: qualifierResult.urgency_signal } },
      Score: { number: qualifierResult.score },
      Tier: { select: { name: qualifierResult.tier } },
      Reasoning: { rich_text: [{ text: { content: qualifierResult.reasoning } }] },
      "Recommended Next Action": {
        rich_text: [{ text: { content: qualifierResult.recommended_next_action } }],
      },
      "Red Flags": {
        multi_select: qualifierResult.red_flags.map((slug) => ({ name: slug })),
      },
      "Insurance Provider": {
        rich_text: [{ text: { content: normalizeInsurance(input.insuranceProvider) } }],
      },
    };

    if (input.preferredTiming) {
      properties["Preferred Timing"] = { select: { name: input.preferredTiming } };
    }

    // Omitted -> "prefer not to say" -> leave Source unset (Notion selects reject null).
    if (input.source) {
      properties.Source = { select: { name: input.source } };
    }

    if (runId) {
      properties["Run ID"] = { rich_text: [{ text: { content: runId } }] };
    }

    const response = await notion.pages.create({
      parent: { database_id: getLeadsDbId() },
      properties,
    });

    const url = "url" in response ? response.url : null;
    console.log(`[notion] Created lead page ${response.id}${url ? ` — ${url}` : ""}`);

    return response.id;
  } catch (error) {
    const notionErr = error as { code?: string; status?: number; message?: string };
    console.error("[notion] Failed to write lead", {
      status: notionErr.status,
      code: notionErr.code,
      message: notionErr.message,
      hint:
        notionErr.status === 401
          ? "Invalid NOTION_TOKEN — check .env"
          : notionErr.status === 403
            ? "Integration not connected to the Leads DB. Go to Notion DB → Connections → add integration."
            : notionErr.status === 404
              ? "NOTION_LEADS_DB_ID not found or integration lacks access."
              : undefined,
    });
    return null;
  }
}
