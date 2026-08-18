import "../env.ts";
import { WebClient } from "@slack/web-api";

export interface SlackMessage {
  ts: string;
  user: string;
  text: string;
  botId?: string;
  subtype?: string;
}

const STUB_MESSAGES: SlackMessage[] = [
  { ts: "1723980000.000100", user: "alice", text: "Getting alerts on checkout-service error rate." },
  { ts: "1723980060.000200", user: "bob", text: "Looking into it now, seeing 500s from the payments API." },
  { ts: "1723980300.000300", user: "bob", text: "Found it — a bad deploy pushed 10 minutes ago. Rolling back." },
  { ts: "1723980600.000400", user: "bob", text: "Rollback complete, error rate back to normal." },
];

export async function getChannelHistory(
  channelId: string,
  oldest?: Date,
  latest?: Date
): Promise<SlackMessage[]> {
  if (!process.env.SLACK_BOT_TOKEN) {
    return STUB_MESSAGES;
  }

  const client = new WebClient(process.env.SLACK_BOT_TOKEN);
  const result = await client.conversations.history({
    channel: channelId,
    oldest: oldest ? String(oldest.getTime() / 1000) : undefined,
    latest: latest ? String(latest.getTime() / 1000) : undefined,
    limit: 15,
  });

  return (result.messages ?? []).map((m) => ({
    ts: m.ts ?? "0",
    user: m.user ?? "unknown",
    text: m.text ?? "",
    botId: m.bot_id,
    subtype: m.subtype,
  }));
}
