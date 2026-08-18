import { eq } from "drizzle-orm";
import { db } from "../db/client.ts";
import { incident, incidentUpdate } from "../db/schema.ts";
import { getChannelHistory } from "./slackClient.ts";
import { buildTranscript } from "./transcript.ts";
import { parseIncident } from "./gemini.ts";

export async function processIncident(incidentId: number): Promise<void> {
  try {
    const [row] = await db.select().from(incident).where(eq(incident.id, incidentId));
    if (!row) {
      console.error(`processIncident: incident ${incidentId} not found`);
      return;
    }

    const messages = await getChannelHistory(
      row.slackChannelId,
      row.slackStart ?? undefined,
      row.slackEnd ?? undefined
    );
    const transcript = buildTranscript(messages);
    const analysis = await parseIncident(transcript);

    await db
      .update(incident)
      .set({
        title: analysis.title,
        description: analysis.summary,
        severity: analysis.severity,
        detectedAt: new Date(analysis.detected_at),
        resolvedAt: analysis.resolved_at ? new Date(analysis.resolved_at) : null,
        affectedSystems: analysis.affected_systems,
        rootCause: analysis.root_cause,
        actionItems: analysis.action_items,
        updatedAt: new Date(),
      })
      .where(eq(incident.id, incidentId));

    if (analysis.timeline.length > 0) {
      await db.insert(incidentUpdate).values(
        analysis.timeline.map((entry) => ({
          incidentId,
          createdAt: new Date(entry.timestamp),
          description: entry.event,
          ownerName: entry.actor,
        }))
      );
    }
  } catch (err) {
    console.error(`processIncident failed for incident ${incidentId}`, err);
  }
}
