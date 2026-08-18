export type Severity = "low" | "medium" | "high" | "critical";

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

export interface OpenAIIncidentAnalysis {
  summary: string;
  severity: Severity;
  service: string;
  updates: Array<{
    description: string;
    timestamp: string;
    owner_name: string;
  }>;
}
