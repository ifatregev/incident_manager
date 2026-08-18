export type Severity = "low" | "medium" | "high" | "critical";

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
