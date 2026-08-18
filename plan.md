# Incident Hub — Build Plan

AI-assisted incident management MVP: Slack slash commands mark when an incident starts/ends,
the server pulls the Slack conversation for that window, filters it down to signal, sends it
to OpenAI, and produces a structured incident record + timeline. Two screens (incidents table,
incident timeline) let you browse results.

## Stack

React + TypeScript + Vite (client), Node.js + Express + TypeScript (server), Postgres +
Drizzle ORM (db), npm workspaces monorepo (`server` / `client` / `shared`).

## DB schema

- `incident`: id PK, title, description, created_at, updated_at, slack_start, slack_end,
  owner_name, severity, slack_channel_id, service
- `incident_update`: id PK, incident_id FK → incident.id, created_at, description, owner_name

## API Contract — Incident CRUD

Base path: `/api/incident`. JSON in, JSON out (`application/json`). All error responses share
one envelope: `{ "error": string, "details"?: unknown }`. `:id` is the integer `incident.id`;
an invalid or unknown `:id` returns `404 { "error": "Incident not found" }` (not 400).

| Method | Path                       | Body                                | Success           |
|--------|----------------------------|--------------------------------------|--------------------|
| GET    | `/api/incident`            | —                                    | `200` `Incident[]`, newest first |
| GET    | `/api/incident/:id`        | —                                    | `200` `Incident` |
| POST   | `/api/incident`            | `CreateIncidentPayload`              | `201` `Incident` |
| PATCH  | `/api/incident/:id`        | `PatchIncidentPayload`               | `200` `Incident` (updated) |
| DELETE | `/api/incident/:id`        | —                                    | `204` (no body); cascades to its `incident_update` rows |
| GET    | `/api/incident/:id/updates`| —                                    | `200` `IncidentUpdate[]`, oldest first |
| POST   | `/api/incident/:id/updates`| `CreateIncidentUpdatePayload`        | `201` `IncidentUpdate` |

Payload shapes (see `shared/src/types.ts`, the single source of truth for both client and
server):

```ts
interface CreateIncidentPayload {
  slackChannelId: string;   // required — only required field
  slackStart?: string;      // ISO datetime; server defaults to now() if omitted
  slackEnd?: string;        // ISO datetime
  title?: string;
  description?: string;
  ownerName?: string;
  severity?: Severity;      // "low" | "medium" | "high" | "critical"
  service?: string;
}

interface PatchIncidentPayload {
  // at least one field required; unknown/immutable keys (id, createdAt, slackChannelId,
  // slackStart) are rejected with 400
  title?: string;
  description?: string;
  ownerName?: string;
  severity?: Severity;
  service?: string;
  slackEnd?: string | null;  // null explicitly clears it
}

interface CreateIncidentUpdatePayload {
  description: string;      // required
  ownerName?: string;
}
```

Notes:
- `createdAt` / `updatedAt` are **always** server-generated — never accepted from the client,
  even on create. `updatedAt` is bumped on every successful `PATCH`.
- `POST /api/incident/:id/updates` and `GET /api/incident/:id/updates` both 404 if the parent
  incident doesn't exist.
- Validation failures (bad/missing/unknown fields) return `400 { "error": "Validation failed",
  "details": <zod flatten() output> }`.

## Status

**Done — skeleton:** monorepo scaffold, Drizzle schema for both tables, Dockerized
Postgres, a server that boots with a single `GET /api/health` route, a client that boots and
calls it.

**In progress — Incident CRUD API** (see contract above): `server/src/routes/incident.ts`,
`server/src/lib/http.ts`, wired into `server/src/index.ts`; `zod` added for validation.

**Not started — deferred to later modular steps:**

1. **DB-only Slack routes** — `POST /api/slack/commands` handling `/incident-start` (insert row
   with `slack_start` + `slack_channel_id`, via the CRUD create logic above) and `/incident-end`
   (close the open row for that channel with `slack_end`, via the CRUD patch logic above). No AI
   yet.
2. **Data filtering + AI pipeline** — fetch Slack channel history for the incident window →
   **filter/structure step** that trims bot messages, reactions, and unneeded metadata into a
   compact transcript → send to OpenAI (`gpt-4o-mini`, structured JSON output via zod) for
   summary/severity/service/updates → write results back to `incident` +
   bulk-insert `incident_update` rows.
3. **React product pages** — `IncidentsList` (table of all incidents) and `IncidentDetail`
   (chronological timeline of `incident_update` rows), routed with `react-router-dom`.
4. **Slack app setup + README polish** — Slack app manifest/scopes, slash command config,
   OpenAI key setup, curl-based smoke test commands for testing without a live Slack app,
   "Known limitations" section (no auth, no Slack signature verification, transport mechanism
   — ngrok vs Socket Mode — still undecided).

## Notable design decisions

- Slack transport (ngrok / Socket Mode / other) is intentionally undecided — the slash command
  handler will be a plain Express POST route so the choice doesn't touch application code.
- `shared` package is type-only (no runtime code) to avoid any monorepo build-step complexity.
- Drizzle schema is the source of truth for the DB; no hand-written SQL migrations.
