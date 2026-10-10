import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { failureText, geolocationSupported, hasCoords, LOCATION_PURPOSE, requestPosition, type GeoFailure } from "@/lib/location";
import { placeFromCoords } from "@/lib/weather.functions";

/**
 * Small banner asking once for location so weather and advice follow the farmer
 * automatically. After access is granted, LocationFollower keeps it updated.
 */
export function LocationAccess() {
  const { user, activeFarm, lang, updateUser, updateFarm } = useApp();
  const [state, setState] = useState<PermissionState | "unknown">("unknown");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!geolocationSupported()) return;
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
    perms?.query({ name: "geolocation" as PermissionName }).then((s) => {
      setState(s.state);
      s.onchange = () => setState(s.state);
    }).catch(() => {});
    try { if (sessionStorage.getItem("verdix:loc-hide") === "1") setHidden(true); } catch { /* ignore */ }
  }, []);

  if (!user || hidden || !geolocationSupported()) return null;
  const have = hasCoords(activeFarm) || hasCoords(user);
  if (state === "granted" || (have && state !== "denied")) return null;

  const allow = async () => {
    setBusy(true); setErr(undefined);
    try {
      const g = await requestPosition();
      let label = user.location || "Current location";
      try { label = (await placeFromCoords({ data: g })).label || label; } catch { /* keep name */ }
      const patch = { location: label, lat: g.lat, lon: g.lon, locationSource: "gps" as const, locationUpdatedAt: new Date().toISOString() };
      updateUser(patch);
      if (activeFarm) updateFarm(activeFarm.id, patch);
      setState("granted");
    } catch (e) {
      setErr(failureText(e as GeoFailure, lang));
    } finally { setBusy(false); }
  };

  return (
    <div className="glass mt-3 flex flex-wrap items-center gap-2 p-3 text-sm">
      <span className="text-lg">📍</span>
      <p className="min-w-0 flex-1">{err ?? LOCATION_PURPOSE[lang]}</p>
      {state !== "denied" && (
        <button onClick={allow} disabled={busy} className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "…" : lang === "te" ? "స్థానాన్ని అనుమతించు" : "Allow location"}
        </button>
      )}
      <button onClick={() => { setHidden(true); try { sessionStorage.setItem("verdix:loc-hide", "1"); } catch { /* ignore */ } }} className="text-xs text-muted-foreground">
        {lang === "te" ? "తర్వాత" : "Later"}
      </button>
    </div>
  );
}
