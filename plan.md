# Incident Hub — Build Plan

AI-assisted incident management MVP: Slack slash commands mark when an incident starts/ends,
the server pulls the Slack conversation for that window, filters it down to signal, sends it
to Gemini, and produces a structured incident record + timeline. Two screens (incidents table,
incident timeline) let you browse results.

## Stack

React + TypeScript + Vite (client), Node.js + Express + TypeScript (server), Postgres +
Drizzle ORM (db), npm workspaces monorepo (`server` / `client` / `shared`), Google Gemini
(`@google/genai`) for AI processing, Slack Web API (`@slack/web-api`) for message history.

## DB schema

- `incident`: id PK, title, description, created_at, updated_at, slack_start, slack_end,
  owner_name, severity, slack_channel_id, service, detected_at, resolved_at, affected_systems
  (text[]), action_items (text[]), root_cause
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
  severity?: Severity;      // "SEV1" | "SEV2" | "SEV3" (SEV1 = highest)
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

## API Contract — Slack Commands

`POST /api/slack/commands` — one route handles both slash commands, dispatching on Slack's
`command` field (`application/x-www-form-urlencoded` body: `command`, `channel_id`,
`user_name`, `text`). Always responds `200` with `{ response_type: "ephemeral", text: string }`
— never a 4xx/5xx, since Slack penalizes non-200/timeout responses.

| `command` | Behavior |
|---|---|
| `/incident-start` | Creates an incident (`slack_channel_id` = `channel_id`, `slack_start` = now, `owner_name` = `user_name`) via the same `createIncident()` service the REST API uses. |
| `/incident-end` | Finds the open incident for `channel_id` (`slack_end IS NULL`), sets `slack_end` = now, acks immediately, then fires the AI pipeline (`processIncident`) in the background — not awaited in the request cycle. No open incident → ephemeral "No open incident for this channel," no writes. |
| anything else | Ephemeral "Unknown command." |

See [docs/slack-integration.md](./docs/slack-integration.md) for Slack app setup (scopes, slash
command config, ngrok, bot token) and Gemini API key setup.

## AI Pipeline

Triggered by `/incident-end`. `getChannelHistory()` (`@slack/web-api`, falls back to a stub
message list when `SLACK_BOT_TOKEN` is unset) → `buildTranscript()` (drops bot/subtype
messages, formats each as `[ISO timestamp] user: text`, chronological) → `parseIncident()`
(Gemini `gemini-2.5-flash`, Zod-validated structured JSON output) → writes `title`,
`description` (from `summary`), `severity`, `detected_at`, `resolved_at`, `affected_systems`,
`root_cause`, `action_items` back onto the `incident` row, and bulk-inserts the returned
`timeline[]` as `incident_update` rows (`event`→`description`, `actor`→`owner_name`,
`timestamp`→`created_at`). Runs detached from the HTTP response; failures are logged, not
surfaced to Slack.

## Status

**Done:**
- Monorepo scaffold, Drizzle schema, Dockerized Postgres, health-checked server + client.
- Incident CRUD API (see contract above): `server/src/routes/incident.ts`,
  `server/src/lib/http.ts`.
- React product pages: `IncidentsList`/`IncidentsTable` and supporting hooks/components in
  `client/src/`.
- Slack slash commands + Gemini AI pipeline (see contracts above): `server/src/routes/slack.ts`,
  `server/src/services/{incidents,slackClient,transcript,gemini,incidentProcessor}.ts`.
- Severity vocabulary is `SEV1`/`SEV2`/`SEV3` (SEV1 = highest), replacing an earlier
  `low`/`medium`/`high`/`critical` draft.

**Known follow-up:** the client's own `client/src/types/incident.ts` still declares
`Severity` as `low | medium | high | critical` (written before this severity migration) and
isn't wired to `shared/src/types.ts` — needs a follow-up update to `SEV1`/`SEV2`/`SEV3` plus
whatever severity-based styling (`IncidentsTable.tsx`) keys off those values.

**Not started:**
- Slack request signature verification (`SLACK_SIGNING_SECRET` is read but unused).
- `IncidentDetail` timeline page (client only has the incidents table so far).

## Notable design decisions

- Slack transport: **ngrok**, documented as the default in
  [docs/slack-integration.md](./docs/slack-integration.md); Socket Mode noted as a future
  alternative. The slash command handler itself is a plain Express POST route, so this choice
  doesn't touch application code.
- AI provider is **Google Gemini** (`@google/genai`, `gemini-2.5-flash`), not OpenAI as
  originally drafted — validated with Zod v3 + `zod-to-json-schema` (not the Zod v4-only
  `z.toJSONSchema`, to avoid migrating the already-shipped CRUD validators).
- `shared` package is type-only (no runtime code) to avoid any monorepo build-step complexity.
- Drizzle schema is the source of truth for the DB; no hand-written SQL migrations.
