// Server-only: Google Maps Platform (Weather + Geocoding) through the connector
// gateway. Credentials stay on the server; the browser never sees a key.
import type { L } from "./crops";
import type { PlaceHit, WeatherDay, WeatherKind, WeatherSnapshot } from "./weather-types";

const TTL = 10 * 60 * 1000; // 10 minutes — weather does not change faster than that
const cache = new Map<string, { at: number; data: unknown }>();

function cached<T>(key: string, run: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.data as T);
  return run().then((data) => {
    cache.set(key, { at: Date.now(), data });
    return data;
  });
}

/** Real condition -> animation driver. Probability is deliberately not used here. */
export function kindOf(type: string, isDay: boolean): WeatherKind {
  const t = (type || "").toUpperCase();
  if (/THUNDER|TORNADO|HURRICANE|TROPICAL|STORM/.test(t)) return "thunder";
  if (/SNOW|SLEET|FLURRI|FREEZING|ICE/.test(t)) return "snow";
  if (/RAIN|SHOWER|DRIZZLE/.test(t)) return "rain";
  if (/FOG|MIST|HAZE|SMOKE|DUST/.test(t)) return "fog";
  if (/OVERCAST|MOSTLY_CLOUDY|^CLOUDY$/.test(t)) return "cloudy";
  if (/CLOUD/.test(t)) return "partly";
  if (/CLEAR/.test(t)) return isDay ? "clear" : "night";
  return isDay ? "partly" : "night";
}

const LABEL: Record<WeatherKind, { icon: string; en: string; te: string }> = {
  clear: { icon: "☀️", en: "Clear skies", te: "స్పష్టమైన ఆకాశం" },
  partly: { icon: "🌤️", en: "Partly cloudy", te: "పాక్షికంగా మేఘావృతం" },
  cloudy: { icon: "☁️", en: "Cloudy", te: "మేఘావృతం" },
  rain: { icon: "🌧️", en: "Rain", te: "వర్షం" },
  thunder: { icon: "⛈️", en: "Thunderstorm", te: "ఉరుములతో కూడిన వర్షం" },
  snow: { icon: "🌨️", en: "Snow or sleet", te: "మంచు" },
  fog: { icon: "🌫️", en: "Fog or haze", te: "పొగమంచు" },
  night: { icon: "🌙", en: "Clear night", te: "స్పష్టమైన రేయి" },
};

const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

function dayLabel(i: number): L {
  if (i === 0) return { en: "Today", te: "ఈరోజు" };
  if (i === 1) return { en: "Tomorrow", te: "రేపు" };
  return { en: `Day ${i + 1}`, te: `${i + 1}వ రోజు` };
}

function codeType(c: number): string {
  if (c >= 95) return "THUNDERSTORM";
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return "SNOW";
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return "RAIN";
  if (c === 45 || c === 48) return "FOG";
  if (c === 3) return "CLOUDY";
  if (c === 1 || c === 2) return "PARTLY_CLOUDY";
  return "CLEAR";
}

async function getJson(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Weather service error [${res.status}]`);
  return res.json() as Promise<Record<string, any>>;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const key = `w:${lat.toFixed(2)},${lon.toFixed(2)}`;
  return cached<WeatherSnapshot>(key, async () => {
    const u = new URL("https://api.open-meteo.com/v1/forecast");
    u.searchParams.set("latitude", String(lat));
    u.searchParams.set("longitude", String(lon));
    u.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m,is_day,uv_index,visibility");
    u.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset");
    u.searchParams.set("forecast_days", "5");
    u.searchParams.set("timezone", "auto");
    const j = await getJson(u.toString());
    const cur = j.current ?? {};
    const temp = cur.temperature_2m;
    if (typeof temp !== "number") throw new Error("No weather data is available for this location.");
    const isDay = cur.is_day !== 0;
    const code = num(cur.weather_code);
    const kind = kindOf(codeType(code), isDay);
    const d = j.daily ?? {};
    const forecast: WeatherDay[] = (d.time ?? []).map((_: string, i: number) => {
      const c = num(d.weather_code?.[i]);
      const k = kindOf(codeType(c), true);
      return {
        day: dayLabel(i), icon: LABEL[k].icon, kind: k,
        max: Math.round(num(d.temperature_2m_max?.[i])), min: Math.round(num(d.temperature_2m_min?.[i])),
        rain: num(d.precipitation_probability_max?.[i]), thunder: c >= 95 ? 70 : 0,
      };
    });
    return {
      live: true, source: "Open-Meteo", fetchedAt: new Date().toISOString(),
      temp: Math.round(temp * 10) / 10,
      feels: Math.round(num(cur.apparent_temperature, temp) * 10) / 10,
      humidity: Math.round(num(cur.relative_humidity_2m)),
      rain: num(cur.precipitation_probability),
      wind: Math.round(num(cur.wind_speed_10m)), gust: Math.round(num(cur.wind_gusts_10m)),
      condition: { en: LABEL[kind].en, te: LABEL[kind].te }, icon: LABEL[kind].icon, kind, isDay,
      cloudCover: Math.round(num(cur.cloud_cover)), thunder: code >= 95 ? 70 : 0,
      uv: Math.round(num(cur.uv_index)), visibility: Math.round(num(cur.visibility) / 1000),
      sunrise: d.sunrise?.[0], sunset: d.sunset?.[0], forecast,
    };
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ label: string; short: string }> {
  const key = `r:${lat.toFixed(2)},${lon.toFixed(2)}`;
  return cached(key, async () => {
    const j = await getJson(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    const short = j.city || j.locality || j.principalSubdivision || "Current location";
    const label = [j.locality || j.city, j.principalSubdivision, j.countryName].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
    return { label: label || short, short };
  });
}

export async function searchLocations(q: string): Promise<PlaceHit[]> {
  const key = `s:${q.toLowerCase()}`;
  return cached(key, async () => {
    const j = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en`);
    return (j.results ?? []).map((r: any) => ({
      label: [r.name, r.admin2, r.admin1, r.country].filter(Boolean).join(", "),
      lat: num(r.latitude), lon: num(r.longitude),
    }));
  });
}
