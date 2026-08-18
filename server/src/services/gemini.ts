import "../env.ts";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY from env

export const IncidentSchema = z.object({
  title: z.string(),
  severity: z.enum(["SEV1", "SEV2", "SEV3"]),
  summary: z.string(),
  started_at: z.string(),
  detected_at: z.string(),
  resolved_at: z.string().nullable(),
  affected_systems: z.array(z.string()),
  timeline: z.array(
    z.object({
      timestamp: z.string(),
      event: z.string(),
      actor: z.string(),
    })
  ),
  root_cause: z.string().nullable(),
  action_items: z.array(z.string()),
});

export type IncidentAnalysis = z.infer<typeof IncidentSchema>;

const SYSTEM_RULES = `
You convert a Slack incident thread into a structured incident.
Rules:
- Use ONLY timestamps that appear in the transcript. Never invent or compute dates.
- If a field is not stated in the thread, use null (or an empty array). Do not guess.
- Order the timeline chronologically using the transcript timestamps.
`;

export async function parseIncident(transcript: string): Promise<IncidentAnalysis> {
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    contents: `${SYSTEM_RULES}\n\nTRANSCRIPT:\n${transcript}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(IncidentSchema),
    },
  });

  const raw = JSON.parse(res.text ?? "{}");
  return IncidentSchema.parse(raw);
}
