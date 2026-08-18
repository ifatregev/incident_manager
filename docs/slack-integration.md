# Slack Integration Guide

How to wire up the `/incident-start` and `/incident-end` slash commands against a local dev
server, and get a Gemini API key for the AI processing pipeline that runs on `/incident-end`.

## 1. Create a Slack app

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From
   scratch**.
2. Name it (e.g. "Incident Hub") and pick your workspace.

## 2. Add OAuth scopes

Under **OAuth & Permissions** → **Scopes** → **Bot Token Scopes**, add:

| Scope | Why |
|---|---|
| `commands` | Register and receive slash commands |
| `channels:history` | Read message history in public channels |
| `groups:history` | Read message history in private channels (if incidents happen there too) |
| `chat:write` | Reserved for future use (e.g. posting incident summaries back to Slack) |

## 3. Create the slash commands

Under **Slash Commands** → **Create New Command**, create two:

| Command | Request URL | Short description |
|---|---|---|
| `/incident-start` | `https://<your-ngrok-id>.ngrok-free.app/api/slack/commands` | Start tracking a new incident in this channel |
| `/incident-end` | `https://<your-ngrok-id>.ngrok-free.app/api/slack/commands` | Close the open incident in this channel and summarize it |

Both commands point at the **same** URL — the server dispatches on the `command` field in the
request body, so no per-command routing config is needed on Slack's side.

## 4. Expose your local server with ngrok

The server needs a public URL for Slack to reach it. This guide uses **ngrok** as the default —
simplest to set up for local development. (Slack's Socket Mode is a viable future alternative
that avoids needing a public URL at all, but isn't set up in this project yet.)

```bash
ngrok http 4000
```

Copy the `https://*.ngrok-free.app` URL it prints and paste it (with `/api/slack/commands`
appended) into both slash commands' Request URL fields from step 3.

**Free-tier caveat**: ngrok assigns a new random URL every time you restart it. You'll need to
update both Request URLs in the Slack app config each time you restart ngrok, or upgrade to a
paid ngrok plan for a stable subdomain.

## 5. Install the app and get your bot token

1. Under **OAuth & Permissions**, click **Install to Workspace** and approve.
2. Copy the **Bot User OAuth Token** (starts with `xoxb-`).
3. Set it in your `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-...
   ```
4. Invite the bot to the channel(s) you'll test in: `/invite @Incident Hub`.

If `SLACK_BOT_TOKEN` is left empty, the server falls back to a small hardcoded stub transcript
for the AI pipeline — useful for testing `/incident-end`'s processing flow without a live Slack
app or ngrok tunnel at all.

## 6. Get a Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Create an API key for your project.
3. Set it in your `.env`:
   ```
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.5-flash
   ```

## Known limitations

- **No Slack signature verification** — the `/api/slack/commands` endpoint doesn't verify
  Slack's request signature (`SLACK_SIGNING_SECRET` is read into `.env` but unused). Fine for
  local development behind an unguessable ngrok URL; add verification before any real
  deployment.
- **`conversations.history` rate limit** — for apps not distributed via the Slack Marketplace,
  this endpoint is limited to 1 request/minute and a max of 15 messages per page (as of the
  current Slack API terms). This project calls it once per `/incident-end`, which fits
  comfortably within that limit for normal incident cadences, but back-to-back incident closes
  in the same channel within a minute could get rate-limited.
- **Transport is ngrok-only for now** — Socket Mode (no public URL required) is a reasonable
  future upgrade but isn't implemented here.
