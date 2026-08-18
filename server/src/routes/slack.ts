import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client.ts";
import { incident } from "../db/schema.ts";
import { createIncident, findOpenIncidentByChannel } from "../services/incidents.ts";
import { processIncident } from "../services/incidentProcessor.ts";

const router = Router();

function ephemeral(text: string) {
  return { response_type: "ephemeral", text };
}

router.post("/commands", async (req, res) => {
  try {
    const command = req.body.command as string | undefined;
    const channelId = req.body.channel_id as string | undefined;
    const userName = req.body.user_name as string | undefined;

    if (!channelId) {
      res.status(200).json(ephemeral("Missing channel_id."));
      return;
    }

    if (command === "/incident-start") {
      const row = await createIncident({
        slackChannelId: channelId,
        ownerName: userName,
        slackStart: new Date(),
      });
      res.status(200).json(ephemeral(`Incident #${row.id} started.`));
      return;
    }

    if (command === "/incident-end") {
      const open = await findOpenIncidentByChannel(channelId);
      if (!open) {
        res.status(200).json(ephemeral("No open incident for this channel."));
        return;
      }

      await db
        .update(incident)
        .set({ slackEnd: new Date(), updatedAt: new Date() })
        .where(eq(incident.id, open.id));

      res.status(200).json(ephemeral(`Incident #${open.id} ended, processing summary…`));

      processIncident(open.id).catch((err) => {
        console.error(`processIncident failed for incident ${open.id}`, err);
      });
      return;
    }

    res.status(200).json(ephemeral(`Unknown command: ${command ?? "(none)"}`));
  } catch (err) {
    console.error("Slack command handler failed", err);
    res.status(200).json(ephemeral("Something went wrong handling that command."));
  }
});

export default router;
