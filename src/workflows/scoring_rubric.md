# Patient Lead Scoring Rubric — Bright Smile Dental Clinic

Used to triage inbound website/form inquiries before a front-desk coordinator calls
the patient back. Total possible score: 100 points, distributed across the criteria
below.

| Criterion                  | Weight | What earns points                                                                 |
|-----------------------------|--------|-------------------------------------------------------------------------------------|
| Urgency / pain level        | 30     | Active pain, swelling, trauma, or a broken tooth = high. No symptoms = low.        |
| Treatment need clarity      | 20     | Specific, treatable reason (e.g. "cracked molar", "want implants") = high. Vague ("just checking things out") = low. |
| Insurance / payment readiness | 20   | Has active in-network insurance, or explicitly OK with self-pay/financing = high. No insurance and payment not discussed = low. |
| Scheduling intent           | 15     | Wants an appointment this week / ASAP = high. "Just researching, no rush" = low.   |
| Patient fit                 | 15     | Reachable phone/email, reasonable service area, treatment matches services the clinic offers = high. Missing contact info or out-of-area = low. |

## Tiers (based on total score)
- **Hot**  → 70–100  (likely dental emergency or ready-to-book patient — call back same day)
- **Warm** → 40–69   (real treatment need, but timeline or payment details still unclear — call back within 24–48h)
- **Cold** → 0–39    (no clear need, spam/test submission, or clearly out of scope — low priority)

## Urgency Signal (`urgency_signal`)

A separate output field from `tier` — sorted/filtered on directly in Notion,
and drives the `[TAG]` in `recommended_next_action` (see the prompt template).
Compute it from all three of these inputs together, not from `reasonForVisit`
alone:

- **high** → `painLevel` = `severe`, OR `preferredTiming` = `asap`, OR the
  free text clearly indicates a medical emergency.
- **medium** → `painLevel` = `moderate`, OR `preferredTiming` = `this_week`,
  OR the free text indicates significant discomfort.
- **low** → everything else.

If any single input alone qualifies for `high`, the result is `high` even if
the other two inputs would suggest lower urgency (e.g. `painLevel: mild` +
`preferredTiming: asap` → `high`).

## Red flags to always surface
Use ONLY the controlled slug vocabulary and strict `when_to_apply` rules defined
in `/workflows/red_flags.md` (also reproduced in the system prompt). Do not
write free-text red flags, and do not infer a flag from a field it isn't
explicitly scoped to (e.g. missing insurance alone is NOT `price_focused_only`
— see red_flags.md).
