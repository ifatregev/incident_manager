import { Router } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.ts";
import { incident, incidentUpdate } from "../db/schema.ts";
import { ApiError, asyncHandler, parseIntParam } from "../lib/http.ts";
import { createIncident } from "../services/incidents.ts";

const router = Router();

const severityEnum = z.enum(["SEV1", "SEV2", "SEV3"]);

const createIncidentSchema = z
  .object({
    slackChannelId: z.string().min(1),
    slackStart: z.string().datetime().optional(),
    slackEnd: z.string().datetime().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    ownerName: z.string().optional(),
    severity: severityEnum.optional(),
    service: z.string().optional(),
  })
  .strict();

const patchIncidentSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    ownerName: z.string().optional(),
    severity: severityEnum.optional(),
    service: z.string().optional(),
    slackEnd: z.string().datetime().nullable().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Patch body must include at least one editable field",
  });

const createUpdateSchema = z.object({
  description: z.string().min(1),
  ownerName: z.string().optional(),
});

function requireIncidentId(rawId: string): number {
  const id = parseIntParam(rawId);
  if (id === null) {
    throw new ApiError(404, "Incident not found");
  }
  return id;
}

async function requireIncident(id: number) {
  const [row] = await db.select().from(incident).where(eq(incident.id, id));
  if (!row) {
    throw new ApiError(404, "Incident not found");
  }
  return row;
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(incident).orderBy(desc(incident.createdAt));
    res.json(rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireIncidentId(req.params.id);
    const row = await requireIncident(id);
    res.json(row);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createIncidentSchema.parse(req.body);
    const row = await createIncident({
      slackChannelId: parsed.slackChannelId,
      slackStart: parsed.slackStart ? new Date(parsed.slackStart) : undefined,
      slackEnd: parsed.slackEnd ? new Date(parsed.slackEnd) : undefined,
      title: parsed.title,
      description: parsed.description,
      ownerName: parsed.ownerName,
      severity: parsed.severity,
      service: parsed.service,
    });
    res.status(201).json(row);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireIncidentId(req.params.id);
    const parsed = patchIncidentSchema.parse(req.body);
    const { slackEnd, ...rest } = parsed;

    const updateValues: Record<string, unknown> = { ...rest, updatedAt: new Date() };
    if ("slackEnd" in parsed) {
      updateValues.slackEnd = slackEnd ? new Date(slackEnd) : null;
    }

    const [row] = await db
      .update(incident)
      .set(updateValues)
      .where(eq(incident.id, id))
      .returning();

    if (!row) {
      throw new ApiError(404, "Incident not found");
    }
    res.json(row);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireIncidentId(req.params.id);
    const [row] = await db.delete(incident).where(eq(incident.id, id)).returning();
    if (!row) {
      throw new ApiError(404, "Incident not found");
    }
    res.status(204).end();
  })
);

router.get(
  "/:id/updates",
  asyncHandler(async (req, res) => {
    const id = requireIncidentId(req.params.id);
    await requireIncident(id);
    const rows = await db
      .select()
      .from(incidentUpdate)
      .where(eq(incidentUpdate.incidentId, id))
      .orderBy(asc(incidentUpdate.createdAt));
    res.json(rows);
  })
);

router.post(
  "/:id/updates",
  asyncHandler(async (req, res) => {
    const id = requireIncidentId(req.params.id);
    await requireIncident(id);
    const parsed = createUpdateSchema.parse(req.body);
    const [row] = await db
      .insert(incidentUpdate)
      .values({
        incidentId: id,
        description: parsed.description,
        ownerName: parsed.ownerName,
      })
      .returning();
    res.status(201).json(row);
  })
);

export default router;
