import { useCallback, useEffect, useState } from "react";
import { fetchIncidents } from "../api/incidents";
import type { Incident } from "../types/incident";

interface UseIncidentsResult {
  incidents: Incident[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useIncidents(): UseIncidentsResult {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchIncidents()
      .then((data) => {
        if (!cancelled) setIncidents(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Failed to load incidents");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { incidents, isLoading, error, reload };
}
