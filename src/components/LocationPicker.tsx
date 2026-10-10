import { useEffect, useRef, useState } from "react";
import { Btn, inputCls, Notice, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { findPlaces, placeFromCoords } from "@/lib/weather.functions";
import {
  failureText,
  geolocationSupported,
  LOCATION_PURPOSE,
  PRIVACY_NOTE,
  requestPosition,
  whenText,
  type GeoFailure,
  type LocInfo,
} from "@/lib/location";
import type { PlaceHit } from "@/lib/weather-types";

/**
 * One place to pick a farm location: browser GPS with a clear purpose note and
 * permission handling, or a manual search when GPS is refused/unavailable.
 * The prompt is only ever triggered by an explicit tap.
 */
export function LocationPicker({ value, onChange, compact = false }: { value: LocInfo; onChange: (l: LocInfo) => void; compact?: boolean }) {
  const { lang } = useApp();
  const T = useT();
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState<GeoFailure | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 3) {
      setHits([]);
      setSearchErr(null);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSearching(true);
      setSearchErr(null);
      try {
        setHits(await findPlaces({ data: { q: term } }));
      } catch {
        setHits([]);
        setSearchErr(T("Location search is unavailable right now.", "స్థాన శోధన ఇప్పుడు అందుబాటులో లేదు."));
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, open, T]);

  const useMine = async () => {
    setFail(null);
    if (!geolocationSupported()) {
      setFail("unsupported");
      setOpen(true);
      return;
    }
    setBusy(true);
    try {
      const g = await requestPosition();
      let label = T("Your location", "మీ స్థానం");
      try {
        const r = await placeFromCoords({ data: g });
        label = r.label || label;
      } catch {
        /* coordinates are still usable for weather even if the name fails */
      }
      onChange({ location: label, lat: g.lat, lon: g.lon, source: "gps", updatedAt: new Date().toISOString() });
      setOpen(false);
    } catch (e) {
      setFail((e as GeoFailure) || "unavailable");
      setOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const pick = (h: PlaceHit) => {
    onChange({ location: h.label, lat: h.lat, lon: h.lon, source: "search", updatedAt: new Date().toISOString() });
    setOpen(false);
    setQ("");
    setHits([]);
    setFail(null);
  };

  const term = q.trim();

  return (
    <div className="space-y-2">
      {!compact && <p className="text-xs leading-snug text-muted-foreground">{LOCATION_PURPOSE[lang]}</p>}

      <div className="grid grid-cols-2 gap-2">
        <Btn disabled={busy} onClick={useMine} className="w-full">
          📍 {busy ? T("Detecting…", "గుర్తిస్తోంది…") : value.lat ? T("Refresh location", "స్థానం నవీకరించు") : T("Use My Location", "నా స్థానం ఉపయోగించు")}
        </Btn>
        <Btn variant="ghost" onClick={() => setOpen((o) => !o)} className="w-full">
          🔎 {T("Search Location", "స్థానం వెతుకు")}
        </Btn>
      </div>

      {value.updatedAt && (
        <p className="text-xs font-semibold text-primary">
          📍 {value.source === "gps" ? T("Location detected", "స్థానం గుర్తించబడింది") : T("Location manually selected", "స్థానం మానవీయంగా ఎంచుకున్నారు")}
          <span className="ml-1 font-normal text-muted-foreground">
            · {T("Updated", "నవీకరణ")} {whenText(value.updatedAt, lang)}
          </span>
        </p>
      )}

      {fail && <Notice tone="warn">{failureText(fail, lang)}</Notice>}

      {open && (
        <div className="space-y-2 rounded-xl bg-background/60 p-3 ring-1 ring-border">
          <label className="block text-sm font-semibold" htmlFor="loc-search">
            {T("Enter location manually", "స్థానాన్ని మానవీయంగా నమోదు చేయండి")}
          </label>
          <input
            id="loc-search"
            className={inputCls}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={T("e.g. Tirupati, Andhra Pradesh", "ఉదా: తిరుపతి, ఆంధ్రప్రదేశ్")}
            autoComplete="off"
          />
          {searching && <p className="text-xs text-muted-foreground">{T("Searching…", "వెతుకుతోంది…")}</p>}
          {searchErr && <p className="text-xs text-destructive">{searchErr}</p>}
          {hits.map((h) => (
            <button key={h.label} type="button" onClick={() => pick(h)} className="w-full rounded-lg px-3 py-2.5 text-left text-sm ring-1 ring-border transition active:scale-[0.99]">
              📍 {h.label}
            </button>
          ))}
          {!searching && !searchErr && term.length >= 3 && hits.length === 0 && (
            <p className="text-xs text-muted-foreground">{T("No matching place found — try a shorter name, e.g. just the town.", "సరిపోయే స్థానం దొరకలేదు — చిన్న పేరు ప్రయత్నించండి, ఉదా: ఊరు పేరు మాత్రమే.")}</p>
          )}
          {searchErr && term.length >= 3 && (
            <Btn
              variant="soft"
              className="w-full"
              onClick={() => {
                onChange({ location: term, source: "manual", updatedAt: new Date().toISOString() });
                setOpen(false);
              }}
            >
              {T("Save this name for now", "ఈ పేరును ఇప్పుడు సేవ్ చేయండి")}
            </Btn>
          )}
          <p className="text-[11px] leading-snug text-muted-foreground">{PRIVACY_NOTE[lang]}</p>
        </div>
      )}
    </div>
  );
}
