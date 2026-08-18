import type { SlackMessage } from "./slackClient.ts";

export function buildTranscript(messages: SlackMessage[]): string {
  return messages
    .filter((m) => !m.botId && !m.subtype)
    .sort((a, b) => Number(a.ts) - Number(b.ts))
    .map((m) => `[${new Date(Number(m.ts) * 1000).toISOString()}] ${m.user}: ${m.text}`)
    .join("\n");
}
