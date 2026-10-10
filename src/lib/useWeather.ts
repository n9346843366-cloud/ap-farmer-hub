import { useQuery } from "@tanstack/react-query";
import { weatherNow } from "./weather.functions";
import { fetchWeather } from "./weather-core";
import type { Geo } from "./location";

/**
 * Live weather for one farm's coordinates. Re-runs automatically when the
 * farm's location changes, and never fetches without coordinates.
 */
export function useWeather(coords: Geo | null) {
  const q = useQuery({
    queryKey: ["weather", coords?.lat ?? null, coords?.lon ?? null],
    // Browser first (farmer's own connection, no shared rate limit), server as backup.
    queryFn: async () => {
      const c = coords as Geo;
      try { return await fetchWeather(Math.round(c.lat * 1000) / 1000, Math.round(c.lon * 1000) / 1000); }
      catch { return weatherNow({ data: c }); }
    },
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return {
    w: q.data ?? null,
    loading: !!coords && q.isPending,
    error: q.isError ? (q.error as Error).message || "Weather could not be loaded." : null,
    reload: () => q.refetch(),
  };
}
