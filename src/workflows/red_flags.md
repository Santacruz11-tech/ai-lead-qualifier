# Red Flags — Controlled Vocabulary

This is the fixed set of slugs the LLM is allowed to emit in `red_flags`. It
matches the `Red Flags` multi-select options already seeded in the Notion Leads
DB (`collection://99b4cd0c-3eaf-4a29-b471-ea73725b64bb`) — do not invent new
slugs without adding the matching option in Notion first.

- slug: missing_contact_info
  label: "Missing critical contact info"
  when_to_apply: >
    Mark ONLY if (a) the patient's name is missing, (b) BOTH phone and email
    are missing, (c) the email is syntactically invalid (no "@" or no
    domain), or (d) the phone contains invalid characters other than "+",
    spaces, and hyphens. Do NOT flag based on phone length alone — a
    well-formed E.164 number (leading "+") is assumed valid regardless of
    digit count, since formats vary by country (e.g. SV = 8 digits, US = 10,
    MX = 10).
  severity: high

- slug: fake_email
  label: "Fake or throwaway email"
  when_to_apply: "Email looks fabricated (e.g. asdf@test.com, keyboard-mash, obviously fake domain)"
  severity: high

- slug: unrealistic_expectations
  label: "Unrealistic treatment expectations"
  when_to_apply: >
    Mark ONLY if the patient asks for something demonstrably impossible
    given the reason for visit (e.g. "braces finished in 2 weeks", "free
    implant"). Do not flag merely ambitious or vague hopes.
  severity: medium

- slug: price_focused_only
  label: "Price-focused shopper"
  when_to_apply: >
    Mark ONLY if the free text explicitly mentions price/cost/quote with NO
    other medical-need context. A lead asking for a "quote for braces"
    does NOT qualify (it has a clear need); a lead that only writes "how
    much does it cost?" with nothing else DOES qualify. Do NOT apply based
    on inference from missing insurance alone — require explicit price
    language with no accompanying need.
  severity: medium
  example_input_positive: "How much does it cost?"
  example_input_negative: "Quote for braces please" (has clear treatment need)

- slug: competitor_shopping
  label: "Actively comparing other clinics"
  when_to_apply: "Patient explicitly mentions getting quotes from, or comparing against, other dental practices"
  severity: low

- slug: no_urgency_low_value
  label: "Low urgency and low commercial intent"
  when_to_apply: >
    Mark ONLY if ALL three hold: painLevel = "none", AND preferredTiming =
    "flexible", AND reasonForVisit is vague/generic (not a specific,
    treatable reason).
  severity: medium

- slug: duplicate_lead
  label: "Likely duplicate submission"
  when_to_apply: "Same patient appears to have already submitted an inquiry (only apply if the intake data itself signals a repeat submission, e.g. explicitly says 'I submitted this already')"
  severity: low

## Usage rule
Multiple slugs may apply to the same lead. If none apply, return an empty array
(`[]`) — this is the expected and common case for a clean, qualified lead.
