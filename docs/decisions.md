# Architecture Decision Records

## ADR-006: Final 21-field Notion schema, direct-vocabulary intake fields, LLM-computed Urgency Signal

**Status:** Accepted
**Date:** 2026-08-01

### Context

Following ADR-001 through ADR-005, the Leads DB schema, the intake field
names, and the Urgency Signal derivation were revisited together as a single
pass, since they're tightly coupled:
- The intake payload's field names (`isNewPatient`, `preferredLocation`,
  `howDidYouHear`) required a translation layer (`mapPatientType`,
  `mapPreferredClinic`'s fuzzy `startsWith` matching) in `src/lib/notion.ts`
  even though the form already offered fixed dropdowns whose values could
  just as easily match Notion's select vocabulary directly.
- ADR-001 (v1) computed `Urgency Signal` deterministically from `painLevel`
  alone, and ADR-004 had the LLM independently re-derive the same rule to
  generate the `recommended_next_action` `[TAG]` — two separate
  implementations of one rule, flagged in ADR-004 as a drift risk. ADR-001's
  own "What v2 would do" section proposed having the LLM emit a structured
  urgency field instead of a static lookup table; this ADR is that v2.
- The pipeline was writing to `Status` (defaulting every new lead to `"new"`)
  and to `Internal Notes` (run metadata), both of which are meant to be
  human-only front-desk fields, not code-managed.

### Decision

- **Intake field renames** (`src/tools/validation.ts`, `frontend/lib/types.ts`,
  `src/lib/notion.ts`, `src/tools/test/qualify_lead.smoke.ts`): `isNewPatient`
  (`yes|no|not sure`) → `patientType` (`new|returning|not_sure`, matching
  `Patient Type` directly); `preferredLocation` (free text, fuzzy-matched) →
  `preferredClinic` (strict enum `Miami|New York|Boston|No preference`,
  matching `Preferred Clinic` directly); `howDidYouHear` → `source` (same
  vocabulary, now `undefined` instead of a `"prefer_not_to_say"` literal for
  "declined to answer"). `mapPatientType` and `mapPreferredClinic`'s
  normalize/`startsWith` fallback logic were deleted from `notion.ts` — the
  three fields are now written straight through.
- **Phone validation**: `LeadInputSchema.phone` now requires E.164
  (`/^\+[1-9]\d{1,14}$/`) — a backend defense-in-depth check; the frontend's
  `react-phone-number-input` already produces this format.
- **`Urgency Signal` is now LLM-computed** (`urgency_signal`, new field in
  `QualificationSchema`), derived from `painLevel` **and** `preferredTiming`
  **and** the free-text `reasonForVisit` together (rule spelled out in
  `src/workflows/scoring_rubric.md`). `mapUrgencySignal` was deleted from
  `notion.ts`; the Notion `Urgency Signal` property now comes straight from
  the qualifier's own output. `recommended_next_action`'s `[TAG]` is derived
  from this same `urgency_signal` value (not re-derived from `painLevel`), so
  the two can no longer drift out of sync — this supersedes ADR-004's
  painLevel-based `[TAG]` rule and ADR-001's painLevel-only Urgency Signal
  rule.
- **Red flag calibration** (`src/workflows/red_flags.md`): tightened
  `missing_contact_info` (name missing, OR both phone+email missing, OR
  syntactically invalid email, OR invalid phone characters — never flagged on
  phone digit-count alone, since valid lengths vary by country),
  `price_focused_only` (requires explicit price language with **no**
  accompanying medical need — "quote for braces" no longer qualifies),
  `unrealistic_expectations` (only demonstrably impossible asks), and
  `no_urgency_low_value` (requires all three of `painLevel: none` +
  `preferredTiming: flexible` + a vague reason, not just "no rush" language).
- **Pipeline no longer touches `Status` or `Internal Notes`** — both are
  front-desk-owned. `Run ID` keeps its own dedicated text property (already
  written directly, unchanged) instead of being embedded in `Internal Notes`.
- **Insurance Provider** is now omitted entirely (not written as an empty
  rich_text) when blank; the literal string `"None"` is still written as-is
  when the patient explicitly has no insurance.
- **Frontend**: phone input now defaults to `US` (was `SV`) with a
  country-aware placeholder (`libphonenumber-js`'s `getExampleNumber`,
  formatted nationally, updating live as the caller changes the selected
  country). `Preferred Timing` auto-sets to `asap` when `Pain Level` is set to
  `severe` (with a dismissible-by-edit hint below the dropdown); it does not
  auto-revert if pain level is later changed away from `severe` — the
  patient's last explicit choice always wins.

### Consequences

- `src/lib/notion.ts` is simpler: no more fuzzy clinic-name matching, no more
  two-value derivation functions — three of the four previously-mapped fields
  are now direct passthroughs, and `Urgency Signal` is a passthrough of the
  LLM's own output.
- The Notion Leads DB now has exactly 21 pipeline-relevant properties: the 11
  the pipeline writes (`Lead Name`, `Phone`, `Email`, `Reason for Visit`,
  `Pain Level`, `Patient Type`, `Insurance Provider`, `Preferred Clinic`,
  `Preferred Timing`, `Source`, `Run ID`), the 6 the LLM fills (`Score`,
  `Tier`, `Reasoning`, `Recommended Next Action`, `Red Flags`, `Urgency
  Signal`), and the 3 human/system-owned fields the pipeline never touches
  (`Status`, `Internal Notes`, `Timestamp`).
- This is a breaking change to the intake payload shape (again): any external
  caller of `qualify-lead` sending the old field names (`isNewPatient`,
  `preferredLocation`, `howDidYouHear`) will now fail Zod validation. Frontend
  and backend were updated together per CLAUDE.md's output-contract rule.
- `docs/decisions.md` ADR-001's "What v2 would do" section is now implemented
  for the Urgency Signal half (LLM-derived, combining `painLevel` +
  `preferredTiming` + free text) but not for the "possible emergency, please
  review" intermediate-state idea — still a known future extension, not done
  here.

## ADR-005: `Has Insurance` / `Is Emergency` checkboxes removed from Notion

**Status:** Accepted
**Date:** 2026-08-01

### Context

While re-verifying the pipeline after the ADR-003/ADR-004 changes, a smoke
test write to Notion started failing with `validation_error: "Has Insurance
is not a property that exists. Is Emergency is not a property that exists."`
A live schema fetch confirmed both checkbox properties had been removed from
the Leads data source directly in Notion, out-of-band from this repo (not
requested as part of the ADR-003/004 work). `Urgency Signal` (select) was
left in place.

### Decision

Per CLAUDE.md ("the DB schema is NOT managed by this repo... do not assume a
field exists"), code was updated to match the live schema rather than
re-adding the removed properties:
- Removed the `Has Insurance` write and the now-unused `hasInsurance()` /
  `NO_INSURANCE_VALUES` helpers in `src/lib/notion.ts`. `Insurance Provider`
  (text) is still written as before.
- Removed the `Is Emergency` write. `mapPainLevel`'s `{ isEmergency,
  urgencySignal }` pair was collapsed to a single `mapUrgencySignal()` →
  `Urgency Signal` (the only urgency-related property Notion still has).

### Consequences

- The `Is Emergency` checkbox and the 🚨 Emergencies view described in
  ADR-001 no longer exist as described — same-day-emergency triage in Notion
  now depends entirely on filtering `Urgency Signal = high` (still driven by
  the same "only `severe` counts" v1 rule). If a dedicated emergency view is
  still wanted, it needs to be rebuilt against `Urgency Signal` in Notion.
  **This was not confirmed as intentional with the project owner** — flagged
  here since it changes front-desk triage behavior, not just a code cleanup.
- `Has Insurance` is gone; `Insurance Provider` (free text) is the only
  insurance signal left in Notion.

## ADR-004: `recommended_next_action`'s `[TAG]` mirrors the `painLevel` → urgency rule, independently of Notion

**Status:** Accepted
**Date:** 2026-08-01

### Context

`recommended_next_action` now has a strict, front-desk-executable format
(`/src/workflows/prompts/qualify_lead.md`) whose leading `[URGENT]` /
`[MEDIUM]` / `[LOW]` tag is meant to agree with the `Is Emergency`/`Urgency
Signal` fields written to Notion (ADR-001). The LLM, however, only ever sees
the raw `LeadInput` (`lead_json` in the prompt) — it has no access to
`Urgency Signal`, since that's computed by `mapPainLevel` in
`src/lib/notion.ts` *after* the LLM call returns.

### Decision

The prompt re-states the same v1 rule from ADR-001 directly (`severe` →
`[URGENT]`, `moderate` → `[MEDIUM]`, `mild`/`none` → `[LOW]`) so the LLM can
derive a matching tag from `painLevel` on its own, rather than trying to feed
it the Notion-side derived value.

### Consequences

- Two independent implementations of the same rule now exist: the
  TypeScript one in `mapPainLevel` and the natural-language one in the
  prompt. If ADR-001's rule ever changes (e.g. the "v2" plan of also
  tripping `Is Emergency` on `moderate` + urgent timeline), both must be
  updated together or the `[TAG]` will silently drift out of sync with
  `Urgency Signal`/`Is Emergency` in Notion.
- No schema validation enforces the `[TAG]` ↔ `painLevel` agreement —
  `QualificationSchema` only requires `recommended_next_action` to be a
  non-empty string. A mismatch would only surface visually to whoever reads
  the Notion row, not as a thrown error.

## ADR-003: Notion schema update — structured timing/source, raw Pain Level, `Reason for Visit` rename

**Status:** Accepted
**Date:** 2026-08-01

### Context

Three fields in the Leads DB were still loosely typed or mismatched with the
form:
- `Service Detail` (rich text) was named for a service-business template this
  clinic never used; the pipeline's own field was already `reasonForVisit`.
- `Preferred Timing` didn't exist — timeline was only captured as free text in
  `Internal Notes` (see ADR-001's "why not combine timeline yet"), unusable
  for filtering/sorting in Notion views.
- `Source` was populated by keyword-matching arbitrary free text
  (`mapSource` in `src/lib/notion.ts`), which was fragile and conflated two
  different concepts: the churn form's submission channel (always "web form"
  in practice) vs. the patient's actual marketing-attribution answer to "how
  did you hear about us?".
- `Patient Type`'s "unknown" option read oddly next to the front-desk's other
  select fields, which all use `not_sure`-style phrasing.

### Decision

- Renamed the `Service Detail` Notion property to `Reason for Visit` to match
  the field it always held.
- Added `Preferred Timing` (select: `asap | this_week | next_2_weeks |
  this_month | flexible`) as a first-class property. The intake form now
  sends this directly from a fixed dropdown instead of free text, so
  `buildInternalNotes` no longer needs to log a raw timeline string.
- Added `Pain Level` (select: `none | mild | moderate | severe`) as a
  first-class property — `painLevel` is now persisted **raw**, in addition to
  the existing `Is Emergency`/`Urgency Signal` derivation (ADR-001). This
  makes the underlying signal auditable in Notion views even though only
  `severe` currently trips the emergency checkbox.
- Redefined `Source` to mean **marketing attribution** ("how did the patient
  hear about us"), not submission channel — `web_form` was dropped from the
  vocabulary since it never carried information (every lead in this app comes
  through the same form). The form now sends the fixed vocabulary
  (`google_search | instagram_ad | referral | walk_in | whatsapp | other`)
  directly, so the keyword-matching `mapSource` fallback logic was removed
  entirely. A `prefer_not_to_say` input value (or an absent `howDidYouHear`
  field) means "the patient declined" — `writeLeadToNotion` omits the
  `Source` property in that case rather than writing a null select value,
  since Notion selects reject `null`.
- Renamed the `Patient Type` mapping's `unknown` value to `not_sure`.

### Consequences

- `Preferred Timing` and `Pain Level` are now filterable/sortable Notion
  columns instead of buried in free-text notes.
- `mapSource`'s keyword-matching (and its Internal Notes fallback logging)
  was deleted — one less heuristic that could silently misclassify a lead.
- This is a breaking change to the intake payload shape: `preferredTimeline`
  (free text) → `preferredTiming` (enum), and `howDidYouHear` went from free
  text to a fixed enum. Both `/src/tools/validation.ts` and
  `/frontend/lib/types.ts` were updated together per CLAUDE.md's output
  contract rule.
- Existing Notion rows written before this change keep their old `Service
  Detail` values under the renamed property (Notion preserves data across a
  property rename) but have no `Pain Level`/`Preferred Timing` values and any
  `Patient Type: unknown` rows do not retroactively become `not_sure`.

## ADR-002: Prune Notion DB schema to 19 CORE fields

**Status:** Accepted
**Date:** 2026-08-01

### Context

The Leads DB inherited 37 properties from an earlier clinic CRM setup. Only 19
are actively populated by the qualification pipeline (`writeLeadToNotion` in
`src/lib/notion.ts`). The remaining 18 added visual noise to views and
signaled an incomplete product to portfolio viewers. A full audit (form →
task → Notion field, cross-referenced against the DB schema) classified the
18 unused fields as:
- **8 ORPHAN** — no clear use case, or redundant with something the pipeline
  already produces (e.g. `Mentioned Competitor` / `Price Sensitivity`
  duplicated the `competitor_shopping` / `price_focused_only` red flags;
  `Medical History Flags` was clinical/PHI-adjacent and out of scope for a
  lead-scoring demo; `Idempotency Key` described a SHA-256 dedup scheme that
  was never implemented in code).
- **9 FUTURE** — plausible v2 extensions (follow-up tracking, WhatsApp contact
  preferences, LLM-derived sentiment/service-interest/intent-stage/deal-size
  signals) with no concrete implementation yet.

### Decision

Removed all 17 non-CORE fields from the `Leads` data source
(`99b4cd0c-3eaf-4a29-b471-ea73725b64bb`) via `DROP COLUMN`:

- ORPHAN (8): Age Group, Budget Mentioned, City, Country, Idempotency Key,
  Medical History Flags, Mentioned Competitor, Price Sensitivity.
- FUTURE (9): Assigned To, Last Contact Date, Next Followup Date, Preferred
  Contact Method, Preferred Contact Time, Sentiment, Service Interest, Intent
  Stage, Estimated Ticket.

Kept `Timestamp` (Notion's auto-populated `created_time`, free and useful for
sorting) alongside the 19 fields the pipeline writes. DB now contains exactly
20 properties. Verified post-cleanup: Notion auto-pruned the removed
properties from all 3 existing views (Default, 🚨 Emergencies, 📋 Pipeline) —
no manual view fixes were needed. A direct call to `writeLeadToNotion` with a
representative severe-pain lead confirmed the write still succeeds against
the pruned schema with all 19 fields populated correctly.

### Consequences

- Cleaner DB views for demo/Loom.
- No orphan fields raising audit questions (HIPAA-adjacent field "Medical
  History Flags" removed).
- v2 features (WhatsApp, follow-up automation, richer LLM-derived signals)
  will introduce their own scoped fields when actually built, instead of
  carrying speculative placeholders.
- `Trigger.dev` task and `writeLeadToNotion`'s payload shape were not
  touched — this was a Notion-schema-only change.

## ADR-001: `painLevel` → `Is Emergency` / `Urgency Signal` mapping (v1: severe-only rule)

**Status:** Accepted
**Date:** 2026-07-29

### Context

The patient intake form collects `painLevel` as one of `none | mild | moderate | severe`.
The Notion Leads DB has two related but distinct fields:
- `Is Emergency` (checkbox) — drives the **🚨 Emergencies** view, which the
  front-desk team checks first every morning.
- `Urgency Signal` (select: `high | medium | low`) — a softer signal used for
  sorting/filtering, not for triggering same-day callbacks.

We need a deterministic rule to derive both from `painLevel` alone, since v1
does not yet combine `painLevel` with other signals (e.g. `preferredTimeline`,
free-text reason for visit, or LLM-inferred urgency from `reasonForVisit`).

### Decision

For v1, use a simple, conservative, single-field rule:

| `painLevel` | `Is Emergency` | `Urgency Signal` |
|---|---|---|
| `severe`   | `true`  | `high`   |
| `moderate` | `false` | `medium` |
| `mild`     | `false` | `low`    |
| `none`     | `false` | `low`    |

Only `severe` trips `Is Emergency`. This is intentionally narrow: it treats the
"Emergencies" view as a **high-precision** list (few false positives), at the
cost of missing some real emergencies that a patient under-reports as
"moderate" pain (e.g. anxious patients, language barriers, or patients
minimizing symptoms).

### Why not combine timeline yet

`preferredTimeline` (e.g. "today if possible", "no rush") is free text with no
fixed vocabulary in v1 — see the `preferredTimeline` gap noted in the Fase 1
Notion audit. Combining an unstructured field with `painLevel` to compute a
checkbox that drives a same-day-callback workflow would require:
1. A reliable way to classify timeline urgency from free text (LLM-inferred,
   not deterministic), which adds a point of failure to a boolean that
   directly affects patient care triage.
2. A conflict-resolution rule when `painLevel` and `preferredTimeline` disagree
   (e.g. `painLevel: moderate` + `preferredTimeline: "today, can't wait"`).

We'd rather ship a narrower, deterministic, auditable rule now than a fuzzier
one that's harder to reason about when a real patient's emergency gets missed.

### What v2 would do

- Have the LLM qualifier itself emit a structured `urgency_assessment` field
  (derived from `painLevel` **and** the free-text `reasonForVisit` /
  `preferredTimeline`), instead of deriving it with a static lookup table in
  application code.
- Widen `Is Emergency` to also trip on `moderate` pain **when** combined with
  timeline language indicating same-day intent, with the LLM's reasoning
  attached to `Internal Notes` so a human can audit why a "moderate" pain
  lead got flagged as an emergency.
- Consider a "possible emergency, please review" intermediate state instead of
  a binary checkbox, so borderline cases aren't silently dropped from the
  Emergencies view.

### Consequences

- Simple, testable, no LLM involved in the emergency-routing decision itself.
- Known limitation: a patient reporting "moderate" pain with urgent language
  in `preferredTimeline` will NOT appear in the Emergencies view in v1. This is
  an accepted tradeoff, not an oversight — documented here so it isn't
  rediscovered as a "bug" later.
