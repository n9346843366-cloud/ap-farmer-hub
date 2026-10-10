// Browser-side location helpers. Nothing here talks to a server, and no
// component ever renders raw coordinates — only the readable place name.
import type { Lang } from "./crops";

export type Geo = { lat: number; lon: number };
export type LocSource = "gps" | "search" | "manual";
export type LocInfo = { location: string; lat?: number; lon?: number; source?: LocSource; updatedAt?: string };
export type GeoFailure = "unsupported" | "denied" | "unavailable" | "timeout";

/** Shown before we ever touch the browser permission prompt. */
export const LOCATION_PURPOSE: Record<Lang, string> = {
  en: "VERDIX uses your location to provide local weather, crop planning, and farming recommendations.",
  te: "VERDIX మీ స్థానాన్ని ఉపయోగించి స్థానిక వాతావరణం, పంట ప్రణాళిక, సాగు సలహాలు ఇస్తుంది.",
};

export const PRIVACY_NOTE: Record<Lang, string> = {
  en: "Your exact coordinates stay on this device and are used only for weather and farming advice. VERDIX never tracks you in the background.",
  te: "మీ ఖచ్చితమైన స్థాన సమాచారం ఈ పరికరంలోనే ఉంటుంది; వాతావరణం, సాగు సలహాలకు మాత్రమే ఉపయోగపడుతుంది. VERDIX మీను వెనుక నుండి ట్రాక్ చేయదు.",
};

export function geolocationSupported() {
  return typeof navigator !== "undefined" && !!navigator.geolocation;
}

/** Coordinates rounded to ~1 km — enough for weather, never an exact address. */
const round = (n: number) => Math.round(n * 10000) / 10000;

/**
 * Asks the browser once. Only ever called from an explicit tap, so the
 * permission prompt is never shown repeatedly.
 */
/** Last position seen by any location request or the live follower. */
let lastFix: { geo: Geo; at: number } | null = null;
export function rememberFix(g: Geo) { lastFix = { geo: g, at: Date.now() }; }

function once(opts: PositionOptions): Promise<Geo> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => { const g = { lat: round(p.coords.latitude), lon: round(p.coords.longitude) }; rememberFix(g); resolve(g); },
      (e) => reject((e.code === e.PERMISSION_DENIED ? "denied" : e.code === e.TIMEOUT ? "timeout" : "unavailable") as GeoFailure),
      opts,
    );
  });
}

/**
 * Asks the browser for the current position. Tries a quick network fix, then
 * GPS, then any recent cached fix, so slow devices don't end in a timeout.
 */
export async function requestPosition(): Promise<Geo> {
  if (!geolocationSupported()) throw "unsupported" as GeoFailure;
  try {
    return await once({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  } catch (e) {
    if (e === "denied") throw e;
  }
  try {
    return await once({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
  } catch (e) {
    if (e === "denied") throw e;
    if (lastFix) return lastFix.geo;
    return await once({ enableHighAccuracy: false, timeout: 10000, maximumAge: Infinity });
  }
}

export function hasCoords(f?: { lat?: number; lon?: number } | null): f is Geo & { lat: number; lon: number } {
  return !!f && typeof f.lat === "number" && typeof f.lon === "number";
}

/** "Updated 5 min ago" / "5 నిమిషాల క్రితం నవీకరించబడింది" */
export function whenText(iso: string | undefined, lang: Lang): string {
  if (!iso) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  const pick = (en: string, te: string) => (lang === "te" ? te : en);
  if (mins < 1) return pick("just now", "ఇప్పుడే");
  if (mins < 60) return pick(`${mins} min ago`, `${mins} నిమిషాల క్రితం`);
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return pick(`${hrs} hr ago`, `${hrs} గంటల క్రితం`);
  const days = Math.round(hrs / 24);
  return pick(`${days} day${days > 1 ? "s" : ""} ago`, `${days} రోజుల క్రితం`);
}

export function failureText(f: GeoFailure, lang: Lang): string {
  const pick = (en: string, te: string) => (lang === "te" ? te : en);
  switch (f) {
    case "denied":
      return pick(
        "Location access is disabled. Allow location for this site in your browser settings, or enter your location manually.",
        "స్థాన అనుమతి నిలిపివేయబడింది. బ్రౌజర్ సెట్టింగ్‌లలో అనుమతించండి, లేదా స్థానాన్ని మానవీయంగా నమోదు చేయండి.",
      );
    case "timeout":
      return pick("The location request timed out. Try again, or enter your location manually.", "స్థాన అభ్యర్థన సమయం ముగిసింది. మళ్లీ ప్రయత్నించండి, లేదా స్థానాన్ని మానవీయంగా నమోదు చేయండి.");
    case "unsupported":
      return pick("This browser does not support location sharing. Please enter your location manually.", "ఈ బ్రౌజర్ స్థానాన్ని సమర్థించదు. దయచేసి స్థానాన్ని మానవీయంగా నమోదు చేయండి.");
    default:
      return pick("Unable to detect your location. Check your device's GPS/network, or enter your location manually.", "మీ స్థానాన్ని గుర్తించలేకపోయాం. GPS/నెట్‌వర్క్‌ను పరిశీలించండి, లేదా స్థానాన్ని మానవీయంగా నమోదు చేయండి.");
  }
}

/** LocInfo -> the fields a Farm/User row stores. One mapping, used everywhere. */
export function toFarmPatch(l: LocInfo) {
  return { location: l.location, lat: l.lat, lon: l.lon, locationSource: l.source, locationUpdatedAt: l.updatedAt };
}

/** Farm/User row -> what the location picker shows. */
export function toLocInfo(f?: { location?: string; lat?: number; lon?: number; locationSource?: LocSource; locationUpdatedAt?: string } | null): LocInfo {
  return { location: f?.location ?? "", lat: f?.lat, lon: f?.lon, source: f?.locationSource, updatedAt: f?.locationUpdatedAt };
}
