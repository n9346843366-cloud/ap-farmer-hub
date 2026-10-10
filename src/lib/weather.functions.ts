import { createServerFn } from "@tanstack/react-start";
import { fetchWeather, reverseGeocode, searchLocations } from "./weather.server";

const coord = (v: unknown, max: number, name: string) => {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (typeof n !== "number" || !Number.isFinite(n) || Math.abs(n) > max) throw new Error(`Invalid ${name}.`);
  return Math.round(n * 1000) / 1000;
};

export const weatherNow = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const { lat, lon } = (d ?? {}) as Record<string, unknown>;
    return { lat: coord(lat, 90, "latitude"), lon: coord(lon, 180, "longitude") };
  })
  .handler(async ({ data }) => fetchWeather(data.lat, data.lon));

export const placeFromCoords = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const { lat, lon } = (d ?? {}) as Record<string, unknown>;
    return { lat: coord(lat, 90, "latitude"), lon: coord(lon, 180, "longitude") };
  })
  .handler(async ({ data }) => reverseGeocode(data.lat, data.lon));

export const findPlaces = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const q = String((d as Record<string, unknown>)?.q ?? "").trim();
    if (q.length < 3) throw new Error("Type at least 3 letters.");
    if (q.length > 80) throw new Error("Search text is too long.");
    return { q };
  })
  .handler(async ({ data }) => searchLocations(data.q));
