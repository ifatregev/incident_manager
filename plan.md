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

## Status

**Done — skeleton (this pass):** monorepo scaffold, Drizzle schema for both tables, Dockerized
Postgres, a server that boots with a single `GET /api/health` route, a client that boots and
calls it. No product functionality yet.

**Not started — deferred to later modular steps:**

1. **Core CRUD + DB-only Slack routes** — `GET /api/incidents`, `GET /api/incidents/:id`,
   `POST /api/slack/commands` handling `/incident-start` (insert row with `slack_start` +
   `slack_channel_id`) and `/incident-end` (close the open row for that channel with
   `slack_end`). No AI yet.
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
