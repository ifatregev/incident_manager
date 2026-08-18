# Incident Hub — client

React + TypeScript + Vite dashboard, styled with [MUI](https://mui.com/material-ui/) (Material UI).

The main page (`src/pages/IncidentsPage.tsx`) shows summary cards plus a sortable incidents table
(id, title, description, severity, duration, owner, service, created at).

## Scripts

| Command            | What it does                                                  |
|--------------------|---------------------------------------------------------------|
| `npm run dev`      | Dev server against the real API (`/api/incident`)             |
| `npm run dev:mock` | **Debug mode** — dev server backed by mock data, no server needed |
| `npm run typecheck`| `tsc -b`                                                      |
| `npm run lint`     | Oxlint                                                        |
| `npm run build`    | Typecheck + production build                                  |

From the repo root: `npm run dev:client` / `npm run dev:client:mock`.

## Debug (mock) mode

`npm run dev:mock` runs Vite with `--mode mock`. `src/config.ts` turns that into the
`USE_MOCK_DATA` flag, and `src/api/incidents.ts` then resolves `fetchIncidents()` from
`src/mocks/incidents.ts` (with a small artificial delay so loading states are visible) instead of
calling the backend. A "Debug · mock data" chip in the header shows when it's active.

`VITE_USE_MOCK_DATA=true` enables the same flag in any mode.

Once the real `GET /api/incident` endpoint exists, `npm run dev` works unchanged — mock data lives
behind that single flag and nothing else in the UI knows about it. `VITE_API_BASE_URL` (read from
the repo-root env files) overrides the default `http://localhost:4000`.

## Layout

```
src/
  api/incidents.ts        fetchIncidents(): real API or mocks
  components/             IncidentsTable, SummaryCards
  hooks/useIncidents.ts   loading / error / reload state
  lib/incidentFormat.ts   duration + date formatting, severity colors
  mocks/incidents.ts      mock incident list for debug mode
  pages/IncidentsPage.tsx dashboard page
  types/incident.ts       Incident shape (mirrors the `incident` table)
  config.ts, theme.ts     env flags, MUI theme
```
