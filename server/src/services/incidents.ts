import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../db/client.ts";
import { incident } from "../db/schema.ts";

export interface CreateIncidentInput {
  slackChannelId: string;
  slackStart?: Date;
  slackEnd?: Date;
  title?: string;
  description?: string;
  ownerName?: string;
  severity?: "SEV1" | "SEV2" | "SEV3";
  service?: string;
}

export async function createIncident(input: CreateIncidentInput) {
  const [row] = await db
    .insert(incident)
    .values({
      slackChannelId: input.slackChannelId,
      slackStart: input.slackStart ?? new Date(),
      slackEnd: input.slackEnd,
      title: input.title,
      description: input.description,
      ownerName: input.ownerName,
      severity: input.severity,
      service: input.service,
    })
    .returning();
  return row;
}

export async function findOpenIncidentByChannel(channelId: string) {
  const [row] = await db
    .select()
    .from(incident)
    .where(and(eq(incident.slackChannelId, channelId), isNull(incident.slackEnd)))
    .orderBy(desc(incident.createdAt))
    .limit(1);
  return row ?? null;
}
