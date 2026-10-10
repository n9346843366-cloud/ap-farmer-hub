import { createFileRoute } from "@tanstack/react-router";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, DemoBadge, Eyebrow, Notice, PageHeader, Stat, useT } from "@/components/kit";
import { LocationPicker } from "@/components/LocationPicker";
import { WeatherFX } from "@/components/WeatherFX";
import { useApp } from "@/lib/store";
import { useWeather } from "@/lib/useWeather";
import { hasCoords, toFarmPatch, toLocInfo, whenText, type LocInfo } from "@/lib/location";

export const Route = createFileRoute("/weather")({
  head: () => seo("Weather", "Live weather for your farm, 5-day forecast and farming advice for spraying, irrigation and fertilizer."),
  component: () => (
    <AppShell>
      <Weather />
    </AppShell>
  ),
});

function Weather() {
  const { activeFarm, user, tl, lang, updateFarm, updateUser, t } = useApp();
  const T = useT();
  const loc = hasCoords(activeFarm) ? activeFarm : hasCoords(user) ? user : null;
  const coords = loc ? { lat: loc.lat, lon: loc.lon } : null;
  const { w, loading, error, reload } = useWeather(coords);

  const save = (l: LocInfo) => {
    if (activeFarm) updateFarm(activeFarm.id, toFarmPatch(l));
    else if (user) updateUser(toFarmPatch(l));
  };

  if (!loc || !coords) {
    return (
      <div className="space-y-3">
        <PageHeader emoji="⛅" title={T("Weather", "వాతావరణం")} sub={T("Tell VERDIX where your farm is — the forecast follows your location.", "మీ పొలం ఎక్కడ ఉందో చెప్పండి — వాతావరణం మీ స్థానాన్ను అనుసరిస్తుంది.")} />
        <Card className="space-y-3">
          <Eyebrow>{T("Farm location", "పొలం స్థానం")}</Eyebrow>
          <LocationPicker value={toLocInfo(activeFarm ?? user)} onChange={save} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader
        emoji="⛅"
        title={T("Weather", "వాతావరణం")}
        sub={`📍 ${loc.location}`}
      />
      <p className="-mt-3 text-xs font-semibold text-primary">
        📍 {loc.locationSource === "gps" ? T("Location detected", "స్థానం గుర్తించబడింది") : T("Location manually selected", "స్థానం మానవీయంగా ఎంచుకున్నారు")}
        <span className="ml-1 font-normal text-muted-foreground">
          · {T("Updated", "నవీకరణ")} {whenText(loc.locationUpdatedAt, lang)}
        </span>
      </p>

      <Card className="relative overflow-hidden">
        {w && <WeatherFX kind={w.kind} />}
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-6xl">{w?.icon ?? "🌡️"}</span>
              <div>
                <p className="text-4xl font-extrabold leading-none">{w ? `${w.temp}°C` : "—"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{w ? tl(w.condition) : T("Loading…", "తెరవడంలో…")}</p>
              </div>
            </div>
            {w ? (
              <span className="rounded-md bg-primary/15 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-primary">{T("Live", "ప్రత్యక్షం")}</span>
            ) : (
              <DemoBadge />
            )}
          </div>

          {error && (
            <div className="mt-3 space-y-2">
              <Notice tone="warn">{T("Weather could not be loaded.", "వాతావరణం తెరవలేదు.")} {error}</Notice>
              <Btn variant="ghost" className="w-full" onClick={reload}>↻ {T("Try again", "మళ్లీ ప్రయత్నించండి")}</Btn>
            </div>
          )}

          {loading && !w && <div className="mt-4 h-24 animate-pulse rounded-xl bg-muted" />}

          {w && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2">
<Stat label={T("Humidity", "తేమ")} value={`${w.humidity}%`} />
                <Stat label={T("Rain chance", "వర్ష అవకాశం")} value={`${w.rain}%`} />
                <Stat label={T("Wind", "గాలి")} value={`${w.wind} km/h`} sub={w.gust > w.wind ? `${T("gusts", "గుండెలు")} ${w.gust}` : undefined} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span>{T("Source", "మూలం")}: {w.source} · {new Date(w.fetchedAt).toLocaleTimeString(lang === "te" ? "te-IN" : "en-IN")}</span>
                <button onClick={reload} className="font-semibold text-primary">↻ {T("Refresh", "నవీకరణ")}</button>
              </div>
            </>
          )}
        </div>
      </Card>

      {w && w.forecast.length > 0 && (
        <Card delay={60}>
          <Eyebrow>{T("5-day forecast", "5 రోజుల అంచనా")}</Eyebrow>
          <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
            {w.forecast.map((d, i) => (
              <div key={i} className="rounded-xl bg-background/60 py-2">
                <p className="text-[10px] text-muted-foreground">{tl(d.day)}</p>
                <p className="text-2xl">{d.icon}</p>
                <p className="text-xs font-bold">{d.max}°</p>
                <p className="text-[10px] text-muted-foreground">{d.min}°</p>
                <p className="mt-1 text-[10px] text-info">💧{d.rain}%</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">{t("notGuaranteed")}</p>
    </div>
  );
}
