export type Severity = "SEV1" | "SEV2" | "SEV3";

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
  detectedAt: string | null;
  resolvedAt: string | null;
  affectedSystems: string[] | null;
  actionItems: string[] | null;
  rootCause: string | null;
}

export interface IncidentUpdate {
  id: number;
  incidentId: number;
  createdAt: string;
  description: string;
  ownerName: string | null;
}

export interface CreateIncidentPayload {
  slackChannelId: string;
  slackStart?: string;
  slackEnd?: string;
  title?: string;
  description?: string;
  ownerName?: string;
  severity?: Severity;
  service?: string;
}

export interface PatchIncidentPayload {
  title?: string;
  description?: string;
  ownerName?: string;
  severity?: Severity;
  service?: string;
  slackEnd?: string | null;
}

export interface CreateIncidentUpdatePayload {
  description: string;
  ownerName?: string;
}

export interface GeminiIncidentAnalysis {
  title: string;
  severity: Severity;
  summary: string;
  started_at: string;
  detected_at: string;
  resolved_at: string | null;
  affected_systems: string[];
  timeline: Array<{
    timestamp: string;
    event: string;
    actor: string;
  }>;
  root_cause: string | null;
  action_items: string[];
}
