import type { L } from "./crops";

/** Visual driver for the weather animations. Derived from the real condition only. */
export type WeatherKind = "clear" | "partly" | "cloudy" | "rain" | "thunder" | "snow" | "fog" | "night";

export type WeatherDay = {
  day: L;
  icon: string;
  kind: WeatherKind;
  max: number;
  min: number;
  rain: number;
  thunder: number;
};

export type WeatherSnapshot = {
  live: boolean;
  source: string;
  fetchedAt: string;
  temp: number;
  feels: number;
  humidity: number;
  rain: number;
  wind: number;
  gust: number;
  condition: L;
  icon: string;
  kind: WeatherKind;
  isDay: boolean;
  cloudCover: number;
  thunder: number;
  uv: number;
  visibility: number;
  sunrise?: string;
  sunset?: string;
  forecast: WeatherDay[];
};

export type PlaceHit = { label: string; lat: number; lon: number };
