import { useEffect, useRef } from "react";
import { useApp } from "@/lib/store";
import { geolocationSupported, rememberFix } from "@/lib/location";
import { placeFromCoords } from "@/lib/weather.functions";

/** Distance in km between two points. */
function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/**
 * Keeps the farmer's location current while the app is open. Only runs after
 * the farmer has already granted location access (never prompts by itself),
 * and only updates when they move more than ~2 km.
 */
export function LocationFollower() {
  const { user, activeFarm, updateUser, updateFarm } = useApp();
  const ref = useRef({ user, activeFarm, updateUser, updateFarm });
  ref.current = { user, activeFarm, updateUser, updateFarm };
  const loggedIn = !!user;

  useEffect(() => {
    if (!loggedIn || !geolocationSupported()) return;
    let id: number | null = null;
    let busy = false;
    let cancelled = false;
    const start = () => {
      id = navigator.geolocation.watchPosition(
        async (p) => {
          const g = { lat: Math.round(p.coords.latitude * 1000) / 1000, lon: Math.round(p.coords.longitude * 1000) / 1000 };
          rememberFix(g);
          const { user: u, activeFarm: f, updateUser: uu, updateFarm: uf } = ref.current;
          const prev = typeof u?.lat === "number" && typeof u?.lon === "number" ? { lat: u.lat, lon: u.lon } : null;
          if (busy || (prev && km(prev, g) < 0.5)) return;
          busy = true;
          let label = u?.location || "Current location";
          try { label = (await placeFromCoords({ data: g })).label || label; } catch { /* keep old name */ }
          busy = false;
          const patch = { location: label, lat: g.lat, lon: g.lon, locationSource: "gps" as const, locationUpdatedAt: new Date().toISOString() };
          uu(patch);
          if (f) uf(f.id, patch);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
      );
    };
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
    if (perms?.query) {
      perms.query({ name: "geolocation" as PermissionName }).then((s) => { if (!cancelled && s.state !== "denied") start(); }).catch(() => { if (!cancelled) start(); });
    } else start();
    return () => { cancelled = true; if (id !== null) navigator.geolocation.clearWatch(id); };
  }, [loggedIn]);

  return null;
}
