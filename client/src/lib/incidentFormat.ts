import type { Incident, Severity } from "../types/incident";

/** Minutes between `slackStart` and `slackEnd`; `null` while the incident is still open. */
export function incidentDurationMinutes(incident: Incident): number | null {
  if (!incident.slackEnd) return null;
  const start = new Date(incident.slackStart).getTime();
  const end = new Date(incident.slackEnd).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.max(0, Math.round((end - start) / 60_000));
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SEVERITY_COLORS: Record<Severity, "error" | "warning" | "info" | "success"> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "success",
};

// `severity` is a plain text column, so tolerate values outside the union.
export function severityColor(severity: Severity | null) {
  return (severity && SEVERITY_COLORS[severity]) || "default";
}

const SEVERITY_ORDER: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function severityRank(severity: Severity | null): number {
  return severity && severity in SEVERITY_ORDER ? SEVERITY_ORDER[severity] : -1;
}
