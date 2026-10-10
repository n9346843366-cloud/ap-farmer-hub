// Integration points for services that are not connected yet. Each adapter
// returns clearly-labelled demo data and can be swapped for a real provider
// (Agmarknet / data.gov.in, ESP32 gateway) without touching the screens.
//
// Weather and geocoding are no longer here — they are live through the
// Google Maps Platform connector (see src/lib/weather.server.ts).

export type MarketRow = { market: string; crop: string; price: number | null; unit: string; date: string; source: string };

export async function getMarketPrices(crop: string, market: string): Promise<{ live: boolean; rows: MarketRow[] }> {
  // TODO: connect Agmarknet / data.gov.in mandi price API here.
  // Until connected we return an illustrative sample — NOT real prices.
  const base: Record<string, number> = { mango: 3000, tomato: 1500, chilli: 12000, groundnut: 6200, rice: 2200, maize: 2100 };
  const p = base[crop];
  return {
    live: false,
    rows: p
      ? [
          { market, crop, price: p, unit: "₹/quintal", date: "Sample", source: "VERDIX demo dataset (illustrative)" },
          { market: "Nearby market (sample)", crop, price: Math.round(p * 1.06), unit: "₹/quintal", date: "Sample", source: "VERDIX demo dataset (illustrative)" },
        ]
      : [],
  };
}

export type SensorReading = { moisture: number; temp: number; humidity: number; at: string; device: string };
export function demoSensor(seed = Date.now()): SensorReading {
  // TODO: replace with ESP32 readings posted to /api/public/sensors.
  const wobble = Math.sin(seed / 60000) * 3;
  return { moisture: Math.round(34 + wobble), temp: Math.round(30 + wobble / 2), humidity: 66, at: new Date(seed).toLocaleTimeString(), device: "ESP32-DEMO-01" };
}
