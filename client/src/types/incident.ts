export type Severity = "low" | "medium" | "high" | "critical";

/** Mirrors a row of the `incident` table as returned by `GET /api/incident`. */
export interface Incident {
  id: number;
  title: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  slackStart: string;
  slackEnd: string | null;
  ownerName: string | null;
  severity: Severity | null;
  slackChannelId: string;
  service: string | null;
}
