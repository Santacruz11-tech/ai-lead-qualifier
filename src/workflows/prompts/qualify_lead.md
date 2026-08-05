Qualify the following patient inquiry using ONLY the rubric provided in the system prompt.

Patient inquiry data:
{{lead_json}}

Return your answer as STRICT JSON with EXACTLY these fields and nothing else:
{
  "score": <integer 0-100>,
  "tier": "Hot" | "Warm" | "Cold",
  "reasoning": "<2-3 sentences explaining the score against the rubric>",
  "recommended_next_action": "<STRICT FORMAT — see 'Recommended Next Action format' below>",
  "red_flags": [<zero or more slugs from the controlled list below>],
  "urgency_signal": "high" | "medium" | "low"
}

For `red_flags`, ONLY use slugs from this controlled list: [missing_contact_info, fake_email, unrealistic_expectations, price_focused_only, competitor_shopping, no_urgency_low_value, duplicate_lead]. Do NOT invent new slugs. If none apply, return an empty array. Multiple slugs are allowed. Full definitions of when each slug applies (with strict `when_to_apply` rules) are in the RED FLAGS section of the system prompt.

For `urgency_signal`, compute it from `painLevel`, `preferredTiming`, AND `reasonForVisit` together — see the "Urgency Signal" section of the rubric above. Do not derive it from `painLevel` alone.

## Recommended Next Action format

A front-desk coordinator triaging many leads reads this field alone, without
looking at any other field. It must be ONE executable instruction. Keep a
clinical, professional tone when referring to the patient.

REQUIRED FORMAT:
```
[TAG] <Verb> patient <first name> at <phone or email> to <concrete action>
      at <clinic> for <reason, summarized>. Verify <insurance> coverage.
      <extra context if applicable>
```

TAG must match the `urgency_signal` value you compute for this same response
(see "Urgency Signal" in the rubric above) — they must never disagree:
- `urgency_signal` = high → `[URGENT]`
- `urgency_signal` = medium → `[MEDIUM]`
- `urgency_signal` = low → `[LOW]`

Verb encodes channel + action: `Call`, `Text`, `Email`, `Send WhatsApp`,
`Schedule follow-up in N days`.

Rules:
- Maximum 2 sentences. One is ideal.
- Always write "patient <first name>" (first name only, extracted from
  `fullName`) — never just the bare name, never "the patient" with no name,
  never the full name.
- Include the phone number or email exactly as given in the input.
- If `insuranceProvider` is the literal "None": write "No insurance on file —
  discuss self-pay options". Do NOT write "Verify None coverage".
- If `insuranceProvider` is blank/not given: write "Ask about insurance
  coverage during call".
- If `preferredClinic` is "No preference": write "at nearest branch".
- Reflect `preferredTiming` in the verb/urgency language: `asap` → "same-day",
  `this_week` → "this week", `flexible` → no urgency language.

GOOD EXAMPLES:
- `[URGENT] Call patient Albert at +503 7247-5950 to confirm same-day appointment at Miami branch for cracked molar (severe pain). Verify Cigna coverage before booking.`
- `[MEDIUM] Call patient María at +503 7889-1122 to schedule cleaning this week at nearest branch. Verify SISA coverage.`
- `[LOW] Email patient José at jsalinas@example.com with quote for orthodontics consultation. Ask about insurance coverage during first call.`

BAD EXAMPLE (too generic, not executable — never produce output like this):
- `Same-day callback to verify phone and offer emergency slot.`

Do not include markdown fences, comments, or any text outside the JSON object.
