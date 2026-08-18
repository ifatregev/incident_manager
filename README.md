# Incident Hub

AI-assisted incident management MVP. See [plan.md](./plan.md) for the full roadmap and
current status — this pass only sets up the runnable skeleton (no product features yet).

## Prerequisites

- Node.js 20+
- Docker (for local Postgres)

## Setup

```bash
npm install
cp .env.example .env
npm run db:up      # starts Postgres via Docker Compose
npm run db:push     # pushes the Drizzle schema to the database
```

## Run

```bash
npm run dev:server  # http://localhost:4000 — GET /api/health
npm run dev:client   # http://localhost:5173 (Vite picks the next free port if 5173 is taken)
```

Postgres is mapped to host port `5433` (not the default `5432`) to avoid clashing with any
other local Postgres container — see `DATABASE_URL` in `.env.example`.

## Slack + OpenAI setup

Not wired up yet — this section will be filled in once the Slack routes and AI pipeline are
built (see [plan.md](./plan.md)).

## Known limitations

- Skeleton only: no incidents API, no Slack routes, no AI pipeline, no product UI yet.
- No authentication.
- CORS is wide open (`cors()` with no origin restriction) since Vite's dev port can shift —
  lock this down to a fixed `CLIENT_ORIGIN` before this runs anywhere but localhost.
