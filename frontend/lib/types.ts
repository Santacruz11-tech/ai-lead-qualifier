// Mirrors the contract in /src/tools/validation.ts (backend) and CLAUDE.md's
// "Output contract" section. Kept as a local, duplicated type here (not a
// cross-project import) because the frontend is deployed as its own Vercel
// project — see CLAUDE.md: "do not change field names/types without updating
// both sides."

export type LeadInput = {
  fullName: string;
  phone: string;
  email: string;
  patientType: "new" | "returning" | "not_sure";
  reasonForVisit: string;
  painLevel: "none" | "mild" | "moderate" | "severe";
  insuranceProvider: string;
  preferredClinic: "Miami" | "New York" | "Boston" | "No preference";
  preferredTiming: "asap" | "this_week" | "next_2_weeks" | "this_month" | "flexible";
  // "" is the form's own "prefer not to say" sentinel — IntakeForm strips
  // the key from the payload when it's "", so the backend only ever sees a
  // real source or an absent field.
  source: "" | "google_search" | "instagram_ad" | "referral" | "walk_in" | "whatsapp" | "other";
};

export type Tier = "Hot" | "Warm" | "Cold";

export type RedFlagSlug =
  | "missing_contact_info"
  | "fake_email"
  | "unrealistic_expectations"
  | "price_focused_only"
  | "competitor_shopping"
  | "no_urgency_low_value"
  | "duplicate_lead";

export type Qualification = {
  score: number;
  tier: Tier;
  reasoning: string;
  recommended_next_action: string;
  red_flags: RedFlagSlug[];
  urgency_signal: "high" | "medium" | "low";
};

export type QualifyLeadOutput = Qualification & { notionPageId: string | null };

// Human-readable labels for the controlled red-flag vocabulary —
// see /src/workflows/red_flags.md (source of truth for the slugs themselves).
export const RED_FLAG_LABELS: Record<RedFlagSlug, string> = {
  missing_contact_info: "Missing critical contact info",
  fake_email: "Fake or throwaway email",
  unrealistic_expectations: "Unrealistic treatment expectations",
  price_focused_only: "Price-focused shopper",
  competitor_shopping: "Actively comparing other clinics",
  no_urgency_low_value: "Low urgency and low commercial intent",
  duplicate_lead: "Likely duplicate submission",
};

export const CLINIC_NAME = "Bright Smile Dental Clinic";

export const CLINIC_LOCATIONS = ["Miami", "New York", "Boston"] as const;
