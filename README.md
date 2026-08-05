# AI Lead Qualifier — Dental Clinic Patient Intake Triage

An AI-powered lead qualification pipeline built for a real dental clinic use
case: a patient submits an intake inquiry, an LLM scores it against a
configurable rubric (Hot/Warm/Cold), and the result is written to Notion so
the front-desk team can prioritize callbacks — same-day emergencies first.

Built with **Trigger.dev v3** (background task runtime), **Claude Haiku 4.5**
(qualification), **Zod** (strict input/output validation), and the **Notion
API** (lead CRM).

## Architecture

```
Input → Zod validation → Claude Haiku qualifier → Notion write (fail-safe) → Output { ...result, notionPageId }
```

The repo follows a **Workflow → Agent → Tools (WAT)** structure — see
[CLAUDE.md](CLAUDE.md) for the full breakdown:
- `src/workflows/` — the scoring rubric, red-flag vocabulary, and LLM prompt
  templates (plain markdown, no code).
- `src/tools/` — reusable, business-logic-free helpers (LLM client, Zod
  schemas).
- `src/lib/` — external integration clients (currently: Notion).
- `src/trigger/` — the Trigger.dev `task()` definition that wires it all
  together.
- `docs/decisions.md` — ADRs for non-obvious mapping/architecture calls.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:

```
ANTHROPIC_API_KEY=
NOTION_TOKEN=
NOTION_LEADS_DB_ID=
```

Run the Trigger.dev dev server:

```bash
npx trigger.dev@4.4.6 dev
```

(Pinned to match the installed `@trigger.dev/sdk`/`@trigger.dev/build`
version — `@latest` may drift ahead and fail with a version-mismatch error.)

## Testing

A local smoke test exercises the full pipeline (LLM qualification + Notion
write) against two fixture leads — a dental emergency and a low-urgency
cosmetic inquiry — without needing a Trigger.dev run:

```bash
npx tsx --env-file=.env src/tools/test/qualify_lead.smoke.ts
```

## Integrations

### Notion (Leads DB)

Every scored lead is written to a Notion database so a non-technical team
(front-desk staff) can triage leads without touching code, using views
already built for this workflow: **🔥 Hot Leads**, **☀️ Warm Leads**,
**❄️ Cold Leads**, **🚨 Emergencies**, and a **📋 Pipeline** Kanban board.

- Client: `@notionhq/client`, wired in `src/lib/notion.ts`.
- **Fail-safe**: if the Notion write fails (auth, network, schema drift), the
  task logs the error with an actionable hint and still returns the
  qualification score — a Notion outage never loses a scored lead.
- Field mapping (intake form vocabulary → Notion's existing select options)
  lives entirely in `src/lib/notion.ts`. No new Notion properties are created
  by this integration — see `docs/decisions.md` for the mapping rationale
  (e.g. `painLevel` → `Is Emergency`/`Urgency Signal`).

**⚠️ Setup requirement**: the Notion integration token must be **connected to
the Leads database** — in Notion, open the database → `···` menu →
**Connections** → add the integration. Without this, every write fails with
a 403 even if `NOTION_TOKEN` is valid.

### Environment variables

| Variable | Used by | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `src/tools/llm_client.ts` | Claude API key, server-side only |
| `NOTION_TOKEN` | `src/lib/notion.ts` | Notion internal integration token, server-side only |
| `NOTION_LEADS_DB_ID` | `src/lib/notion.ts` | Notion database ID for the Leads DB |

Never commit `.env*` files. See `.env.example` for the full list with empty
values.
