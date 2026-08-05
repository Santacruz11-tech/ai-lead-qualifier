import { z } from "zod";

// E.164: leading +, first digit 1-9, up to 15 digits total. The frontend
// (react-phone-number-input) already enforces this format on submit — this
// is a defense-in-depth check on the backend, not the primary validation.
const E164_PHONE = /^\+[1-9]\d{1,14}$/;

// Input: what the patient intake form on the clinic's website sends
export const LeadInputSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().regex(E164_PHONE, "Phone must be in E.164 format (e.g. +15551234567)"),
  email: z.string().optional().default(""),
  patientType: z.enum(["new", "returning", "not_sure"]).default("not_sure"),
  reasonForVisit: z.string().min(1),
  painLevel: z.enum(["none", "mild", "moderate", "severe"]).default("none"),
  // "" = omit the Insurance Provider property entirely; the literal string
  // "None" is written as-is (patient explicitly has no insurance) — see
  // writeLeadToNotion.
  insuranceProvider: z.string().optional().default(""),
  preferredClinic: z.enum(["Miami", "New York", "Boston", "No preference"]).default("No preference"),
  preferredTiming: z
    .enum(["asap", "this_week", "next_2_weeks", "this_month", "flexible"])
    .optional(),
  // Omitted/undefined means "prefer not to say" — see writeLeadToNotion,
  // which leaves the Source select unset in that case.
  source: z
    .enum(["google_search", "instagram_ad", "referral", "walk_in", "whatsapp", "other"])
    .optional(),
});
export type LeadInput = z.infer<typeof LeadInputSchema>;

// Controlled vocabulary — must match the Red Flags multi-select options
// already seeded in the Notion Leads DB, and /workflows/red_flags.md.
export const RedFlagSlug = z.enum([
  "missing_contact_info",
  "fake_email",
  "unrealistic_expectations",
  "price_focused_only",
  "competitor_shopping",
  "no_urgency_low_value",
  "duplicate_lead",
]);

// Output: the qualification contract (must match CLAUDE.md)
export const QualificationSchema = z.object({
  score: z.number().int().min(0).max(100),
  tier: z.enum(["Hot", "Warm", "Cold"]),
  reasoning: z.string(),
  recommended_next_action: z.string(),
  red_flags: z.array(RedFlagSlug),
  // Computed by the LLM from painLevel + preferredTiming + reasonForVisit
  // together (not derived deterministically from painLevel alone) — see
  // docs/decisions.md.
  urgency_signal: z.enum(["high", "medium", "low"]),
});
export type Qualification = z.infer<typeof QualificationSchema>;

// Task output contract: the qualification plus the Notion write result.
// notionPageId is null when the Notion write failed — the fail-safe in
// writeLeadToNotion never blocks the score itself from being returned.
export type QualifyLeadOutput = Qualification & { notionPageId: string | null };
