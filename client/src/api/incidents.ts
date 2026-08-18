import { API_BASE_URL, USE_MOCK_DATA } from "../config";
import { mockIncidents } from "../mocks/incidents";
import type { Incident } from "../types/incident";

const MOCK_LATENCY_MS = 500;

export async function fetchIncidents(): Promise<Incident[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    return [...mockIncidents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/incident`);
  if (!response.ok) {
    throw new Error(`Failed to load incidents (${response.status})`);
  }
  return (await response.json()) as Incident[];
}
