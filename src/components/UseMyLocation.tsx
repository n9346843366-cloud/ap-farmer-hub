import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { failureText, requestPosition, type GeoFailure } from "@/lib/location";
import { placeFromCoords } from "@/lib/weather.functions";

/** Always asks the device for a fresh position and saves it to the profile and farm. */
export function UseMyLocation() {
  const { user, activeFarm, lang, updateUser, updateFarm } = useApp();
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      const g = await requestPosition();
      let label = "Current location";
      try { label = (await placeFromCoords({ data: g })).label || label; } catch { /* keep */ }
      const patch = { location: label, lat: g.lat, lon: g.lon, locationSource: "gps" as const, locationUpdatedAt: new Date().toISOString() };
      updateUser(patch);
      if (activeFarm) updateFarm(activeFarm.id, patch);
      toast.success((lang === "te" ? "స్థానం నవీకరించబడింది: " : "Location updated: ") + label);
    } catch (e) {
      toast.error(failureText(e as GeoFailure, lang));
    } finally { setBusy(false); }
  };
  if (!user) return null;
  return (
    <button onClick={go} disabled={busy} className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
      📍 {busy ? "…" : lang === "te" ? "నా ప్రస్తుత స్థానం వాడు" : "Use my current location"}
    </button>
  );
}
