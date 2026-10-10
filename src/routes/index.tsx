import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NearbyShops } from "@/components/NearbyShops";
import { AppShell, seo } from "@/components/AppShell";
import { Card, DemoBadge, Eyebrow, Notice, Tile } from "@/components/kit";
import { LocationPicker } from "@/components/LocationPicker";
import { WeatherFX } from "@/components/WeatherFX";
import { useApp } from "@/lib/store";
import { getCrop, iso, SOILS, stageLabel } from "@/lib/crops";
import { demoSensor } from "@/lib/integrations";
import { useWeather } from "@/lib/useWeather";
import { failureText, hasCoords, requestPosition, toFarmPatch, toLocInfo, type GeoFailure } from "@/lib/location";
import { placeFromCoords } from "@/lib/weather.functions";
import farmImgAsset from "@/assets/mango-farm.jpg.asset.json";
const farmImg = farmImgAsset.url;

const QUOTES = [
  { en: "No farmer, no food. Save food, respect the farmer.", te: "రైతు లేకపోతే ఆహారం లేదు. ఆహారాన్ని వృథా చేయకండి." },
  { en: "Save food — every grain carries a farmer's sweat.", te: "ఆహారం కాపాడండి — ప్రతి గింజలో రైతు చెమట ఉంది." },
  { en: "The farmer feeds the nation. Waste less, value more.", te: "రైతు దేశానికి అన్నం పెడతాడు. వృథా తగ్గించండి." },
  { en: "Agriculture is our wisest pursuit. — Thomas Jefferson", te: "వ్యవసాయమే అత్యంత జ్ఞానవంతమైన వృత్తి." },
];

export const Route = createFileRoute("/")({
  head: () => seo("Home", "Your farm at a glance: weather, today's tasks, crop plan and quick help."),
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <HomeInner />
    </AppShell>
  );
}

function HomeInner() {
  const { user, t, tl, activeFarm, plans, tasks, toggleTask, lang, updateFarm, updateUser } = useApp();
  const loc = hasCoords(activeFarm) ? activeFarm : hasCoords(user) ? user : null;
  const coords = loc ? { lat: loc.lat, lon: loc.lon } : null;
  const { w, error, reload } = useWeather(coords);

  const [h, setH] = useState<number | null>(null);
  useEffect(() => { const tick = () => setH(new Date().getHours()); tick(); const id = setInterval(tick, 60000); return () => clearInterval(id); }, []);
  const greet = h === null ? "" : h < 12 ? t("goodMorning") : h < 17 ? t("goodAfternoon") : t("goodEvening");
  const quote = QUOTES[(new Date().getDate()) % QUOTES.length];
  const today = iso(new Date());
  const todays = tasks.filter((x) => x.date <= today && (!activeFarm || x.farmId === activeFarm.id) && (x.date === today || !x.done)).slice(0, 5);
  const done = todays.filter((x) => x.done).length;
  const plan = plans.find((p) => p.farmId === activeFarm?.id);
  const crop = getCrop(plan?.crop ?? activeFarm?.crop ?? "");
  const stage = crop ? stageLabel(crop, plan?.inputs ?? { treeAge: activeFarm?.treeAge, plantingDate: activeFarm?.plantingDate }) : null;
  const sensor = demoSensor();

  return (
    <div className="space-y-3">
      <figure className="animate-rise mx-auto max-w-md rounded-2xl bg-primary/10 px-4 py-3 text-center ring-1 ring-primary/20">
        <blockquote className="text-[15px] font-semibold italic leading-snug text-balance">“{lang === "te" ? quote.te : quote.en}”</blockquote>
        <figcaption className="mt-1 text-[11px] text-muted-foreground">🌾 {lang === "te" ? "రైతే దేశానికి వెన్నెముక" : "Respect the farmer · Save food"}</figcaption>
      </figure>
      <div className="animate-rise pt-1">
        <p className="text-[26px] font-extrabold leading-tight tracking-tight text-balance">
          {greet || "\u00a0"}{greet ? `, ${user?.name.split(" ")[0] ?? ""} ${h !== null && h < 12 ? "🌅" : h !== null && h < 17 ? "☀️" : "🌙"}` : ""}
        </p>
        <LiveLocation />
      </div>

      {/* Weather — live, driven by the farm's own coordinates */}
      {loc && coords ? (
        <Link to="/weather" className="block">
          <Card delay={60} className="relative overflow-hidden">
            {w && <WeatherFX kind={w.kind} />}
            <div className="relative z-10">
              {w ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{w.icon}</span>
                      <div>
                        <p className="text-2xl font-bold leading-none">{w.temp}°C</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {tl(w.condition)} · {lang === "te" ? "తేమ" : "Humidity"} {w.humidity}%
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-primary/15 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-primary">{lang === "te" ? "ప్రత్యక్షం" : "LIVE"}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <Mini e="🌧️" v={`${lang === "te" ? "వర్షం" : "Rain"} ${w.rain}%`} />
                    <Mini e="💨" v={`${lang === "te" ? "గాలి" : "Wind"} ${w.wind} km/h`} />
                    <Mini e="🌡️" v={`${lang === "te" ? "అనుభూతీ" : "Feels"} ${w.feels}°`} />
                  </div>
                  <p className="mt-2 truncate text-[10px] text-muted-foreground">
                    📍 {loc.location}
                  </p>
                </>
              ) : error ? (
                <div className="py-1">
                  <p className="text-sm font-semibold">{lang === "te" ? "వాతావరణం రాలేదు." : "Weather didn't load."}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      reload();
                    }}
                    className="mt-2 text-xs font-semibold text-primary"
                  >
                    ↻ {lang === "te" ? "మళ్లీ ప్రయత్నించండి" : "Try again"}
                  </button>
                </div>
              ) : (
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
              )}
            </div>
          </Card>
        </Link>
      ) : (
        <Card delay={60} className="space-y-3">
          <Eyebrow>{lang === "te" ? "పొలం స్థానం" : "Farm location"}</Eyebrow>
          <LocationPicker
            compact
            value={toLocInfo(activeFarm ?? user)}
            onChange={(l) => (activeFarm ? updateFarm(activeFarm.id, toFarmPatch(l)) : updateUser(toFarmPatch(l)))}
          />
          {error && <Notice tone="warn">{error}</Notice>}
        </Card>
      )}

      {/* My farm */}
      <Card delay={120}>
        <Eyebrow right={<Link to="/farm" className="text-xs font-semibold text-primary">{activeFarm?.name ?? t("addFarm")}</Link>}>{t("myFarm")}</Eyebrow>
        {activeFarm ? (
          <Link to="/farm/$farmId" params={{ farmId: activeFarm.id }} className="mt-3 flex items-center gap-3">
            <img src={farmImg} alt="Farm" width={64} height={64} className="size-20 shrink-0 rounded-xl object-cover ring-1 ring-border" />
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <p className="text-muted-foreground">{t("crop")}</p>
              <p className="font-semibold">{crop ? `${crop.emoji} ${tl(crop.name)}` : plan?.customName ?? "—"}</p>
              <p className="text-muted-foreground">{t("area")}</p>
              <p className="font-semibold">{activeFarm.area ?? "—"} {t("acres")}</p>
              {activeFarm.treeAge !== undefined && (
                <>
                  <p className="text-muted-foreground">{t("treeAge")}</p>
                  <p className="font-semibold">{activeFarm.treeAge} {t("years")}</p>
                </>
              )}
              <p className="text-muted-foreground">{t("soil")}</p>
              <p className="font-semibold">{SOILS.find((s) => s.id === activeFarm.soil) ? tl(SOILS.find((s) => s.id === activeFarm.soil)!.label) : "—"}</p>
              <p className="text-muted-foreground">{t("water")}</p>
              <p className="font-semibold">{activeFarm.waterSource ?? "—"}</p>
            </div>
          </Link>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{lang === "te" ? "ఇంకా పొలం జోడించలేదు." : "No farm added yet."}</p>
            <Link to="/farm" className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground">{t("addFarm")}</Link>
          </div>
        )}
        {stage && (
          <Link to={plan ? "/plan/$planId" : "/plant"} params={{ planId: plan?.id ?? "" }} className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              {t("stage")}: <b>{tl(stage.label)}</b>
            </span>
            <span className="text-xs font-semibold text-primary">{t("myCropPlan")} →</span>
          </Link>
        )}
      </Card>

      {/* Hero CTA */}
      <section className="animate-rise rounded-2xl bg-primary p-5 text-primary-foreground ring-1 ring-border" style={{ animationDelay: "180ms" }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-75">{t("startHere")}</p>
        <p className="mt-2 text-[24px] font-extrabold leading-tight tracking-tight text-balance">🌱 {t("planQ")}</p>
        <p className="mt-1 text-sm opacity-85">{t("planQSub")}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["mango", "rice", "groundnut", "tomato", "chilli"].map((id) => {
            const c = getCrop(id)!;
            return (
              <Link key={id} to="/plant" search={{ crop: id }} className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium">
                {c.emoji} {tl(c.name)}
              </Link>
            );
          })}
        </div>
        <Link to="/plant" className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary-foreground/15 py-3.5 text-[15px] font-semibold ring-1 ring-primary-foreground/25">
          {t("chooseCrop")}
        </Link>
      </section>

      {/* Tasks */}
      <Card delay={240}>
        <Eyebrow right={<Link to="/tasks" className="font-mono text-[10px] text-muted-foreground">{done} / {todays.length} →</Link>}>{t("todayTasks")}</Eyebrow>
        {todays.length ? (
          <div className="mt-2 space-y-1">
            {todays.map((x) => (
              <button key={x.id} onClick={() => toggleTask(x.id)} className="flex w-full items-center gap-3 py-2 text-left">
                <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-sm ${x.done ? "bg-primary text-primary-foreground" : "ring-1 ring-input"}`}>{x.done ? "✓" : ""}</span>
                <span className={`text-[15px] ${x.done ? "text-muted-foreground line-through" : ""}`}>{tl(x.title)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t("noTasks")}</p>
        )}
      </Card>

      {/* Tiles */}
      <div className="grid animate-rise grid-cols-2 gap-3" style={{ animationDelay: "300ms" }}>
        <Tile to="/irrigation" emoji="💧" title={t("irrigation")} sub={lang === "te" ? `నేల తేమ ${sensor.moisture}% · గమనించాలి` : `Soil ${sensor.moisture}% · Needs monitoring`} />
        <Tile to="/fertilizer" emoji="🧪" title={t("fertilizer")} sub={stage ? `${tl(stage.label)}` : lang === "te" ? "ప్రణాళిక చూడండి" : "See nutrient plan"} />
        <Tile to="/scan" emoji="🩺" title={t("cropHealth")} sub={lang === "te" ? "ఆకు ఫోటోతో సమస్య తెలుసుకోండి" : "Photo check & treatment"} />
        <Tile to="/mango" emoji="🥭" title={lang === "te" ? "మామిడి నిర్వహణ" : "Mango Management"} sub={lang === "te" ? "నెలవారీ సంరక్షణ" : "Month-wise orchard care"} />
        <Tile to="/market" emoji="📈" title={t("market")} sub={lang === "te" ? "అంచనా మండి ధరలు" : "Approx mandi prices"} />
        <Tile to="/pests" emoji="🐛" title={t("pests")} sub={lang === "te" ? "తేనె మంచు పురుగు: అధికం" : "Hopper risk: High"} />
      </div>
      <NearbyShops />
    </div>
  );
}

function Mini({ e, v }: { e: string; v: string }) {
  return (
    <div className="rounded-lg bg-background/60 py-2">
      <p className="text-lg">{e}</p>
      <p className="text-[11px] text-muted-foreground">{v}</p>
    </div>
  );
}

function LiveLocation() {
  const { user, activeFarm, lang, updateUser, updateFarm } = useApp();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const live = user?.locationSource === "gps";
  const refresh = async () => {
    setBusy(true); setErr(undefined);
    try {
      const g = await requestPosition();
      let label = lang === "te" ? "ప్రస్తుత స్థానం" : "Current location";
      try { label = (await placeFromCoords({ data: g })).label || label; } catch { /* keep */ }
      const patch = { location: label, lat: g.lat, lon: g.lon, locationSource: "gps" as const, locationUpdatedAt: new Date().toISOString() };
      updateUser(patch);
      if (activeFarm) updateFarm(activeFarm.id, patch);
    } catch (e) {
      setErr(failureText(typeof e === "string" ? (e as GeoFailure) : "unavailable", lang));
    } finally { setBusy(false); }
  };
  return (
    <div className="mt-1 text-sm">
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        <span>📍 {user?.location || activeFarm?.location || (lang === "te" ? "స్థానం తెలియదు" : "Location not set")}</span>
        {live && <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary"><span className="size-1.5 animate-pulse rounded-full bg-primary" />{lang === "te" ? "లైవ్" : "Live"}</span>}
        <button type="button" onClick={refresh} disabled={busy} className="text-xs font-semibold text-primary">{busy ? "…" : lang === "te" ? "🎯 నా ప్రస్తుత స్థానం" : "🎯 Use my current location"}</button>
      </div>
      {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
    </div>
  );
}
