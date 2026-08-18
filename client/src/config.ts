export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

/**
 * Debug mode serves mock data instead of hitting the (not yet existing) API.
 * Enabled by `npm run dev:mock` (`vite --mode mock`) or `VITE_USE_MOCK_DATA=true`.
 */
export const USE_MOCK_DATA =
  import.meta.env.MODE === "mock" || import.meta.env.VITE_USE_MOCK_DATA === "true";
