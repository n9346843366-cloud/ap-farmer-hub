import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, DemoBadge, Eyebrow, Notice, PageHeader, Progress, Stat, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { getCrop, stageLabel } from "@/lib/crops";
import { demoSensor, type SensorReading } from "@/lib/integrations";

export const Route = createFileRoute("/irrigation")({
  head: () => seo("Irrigation", "Know when to water: crop-stage irrigation advice, a watering log and a smart soil-moisture sensor demo."),
  component: () => (
    <AppShell>
      <Irrigation />
    </AppShell>
  ),
});

const LOG_KEY = "agrismart:irrigation-log";
type Log = { at: string; minutes: number };

function Irrigation() {
  const { activeFarm, plans, tl } = useApp();
  const T = useT();
  const [mode, setMode] = useState<"manual" | "iot">("manual");
  const [s, setS] = useState<SensorReading>(() => demoSensor());
  const [pump, setPump] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [mins, setMins] = useState(30);

  useEffect(() => {
    try { setLogs(JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]")); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (mode !== "iot") return;
    const id = setInterval(() => setS((p) => ({ ...demoSensor(), moisture: Math.min(80, p.moisture + (pump ? 3 : -0.5)) })), 3000);
    return () => clearInterval(id);
  }, [mode, pump]);

  const plan = plans.find((p) => p.farmId === activeFarm?.id);
  const crop = getCrop(plan?.crop ?? activeFarm?.crop ?? "");
  const stage = crop ? stageLabel(crop, plan?.inputs ?? { treeAge: activeFarm?.treeAge, plantingDate: activeFarm?.plantingDate }) : null;
  const m = Math.round(s.moisture);
  const status = m < 30 ? { tone: "warn" as const, text: T("Dry — water today", "పొడిగా ఉంది — ఈరోజు నీరు పెట్టండి") } : m < 45 ? { tone: "info" as const, text: T("Needs monitoring", "గమనించాలి") } : { tone: "ok" as const, text: T("Moisture is good — no water needed", "తేమ బాగుంది — నీరు అవసరం లేదు") };

  const advice = (() => {
    if (!crop) return T("Create a crop plan for crop-specific advice.", "పంట ప్రత్యేక సలహా కోసం ప్రణాళిక చేయండి.");
    if (crop.id === "mango") {
      if (stage?.phase === "irrigation" || stage?.phase === "pest") return T("Pre-flowering: hold water 6–8 weeks to induce flowers (bearing trees).", "పూతకు ముందు: 6–8 వారాలు నీరు ఆపండి (కాపు చెట్లు).");
      if (stage?.phase === "fruit") return T("Fruit growth: irrigate every 10–15 days in basins.", "కాయ ఎదుగుదల: 10–15 రోజులకోసారి పాదుల్లో నీరు.");
      return T("Young/vegetative trees: water every 7–10 days in dry spells.", "చిన్న చెట్లు: ఎండలో 7–10 రోజులకోసారి నీరు.");
    }
    return crop.water === "high" ? T("High-water crop: keep soil moist, irrigate every 3–5 days.", "ఎక్కువ నీటి పంట: 3–5 రోజులకోసారి నీరు.") : T("Irrigate every 7–10 days or when top 5 cm is dry.", "పైన 5 సెం.మీ. పొడిగా ఉంటే లేదా 7–10 రోజులకోసారి నీరు.");
  })();

  const log = () => {
    const next = [{ at: new Date().toISOString(), minutes: mins }, ...logs].slice(0, 20);
    setLogs(next);
    localStorage.setItem(LOG_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-3">
      <PageHeader emoji="💧" title={T("Irrigation", "నీటి పారుదల")} sub={crop ? `${crop.emoji} ${tl(crop.name)}${stage ? ` · ${tl(stage.label)}` : ""}` : undefined} />
      <div className="grid grid-cols-2 gap-2">
        <Chip active={mode === "manual"} onClick={() => setMode("manual")}>✋ {T("Manual", "మాన్యువల్")}</Chip>
        <Chip active={mode === "iot"} onClick={() => setMode("iot")}>📡 {T("Smart sensor", "స్మార్ట్ సెన్సార్")}</Chip>
      </div>

      <Card>
        <Eyebrow right={<DemoBadge />}>{T("Soil moisture", "నేల తేమ")}</Eyebrow>
        <p className="mt-2 text-4xl font-extrabold">{m}%</p>
        <div className="mt-2"><Progress value={m} /></div>
        <div className="mt-3"><Notice tone={status.tone}>{status.text}</Notice></div>
      </Card>

      <Card delay={60}>
        <Eyebrow>{T("Advice for your crop", "మీ పంటకు సలహా")}</Eyebrow>
        <p className="mt-2 text-[15px]">{advice}</p>
        <p className="mt-2 text-xs text-muted-foreground">{T("Water early morning or evening. Skip if rain is expected.", "ఉదయం లేదా సాయంత్రం నీరు పెట్టండి. వర్షం వస్తే వద్దు.")}</p>
      </Card>

      {mode === "iot" ? (
        <Card delay={120}>
          <Eyebrow right={<span className="flex items-center gap-1 text-xs text-primary"><span className="size-2 animate-pulse rounded-full bg-primary" />LIVE DEMO</span>}>📡 {s.device}</Eyebrow>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label={T("Moisture", "తేమ")} value={`${m}%`} />
            <Stat label={T("Soil temp", "నేల ఉష్ణం")} value={`${s.temp}°`} />
            <Stat label={T("Humidity", "తేమ గాలి")} value={`${s.humidity}%`} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{T("Updated", "నవీకరణ")} {s.at}</p>
          <Btn onClick={() => setPump(!pump)} variant={pump ? "accent" : "primary"} className="mt-3 w-full">{pump ? `⏹ ${T("Stop pump", "పంపు ఆపండి")}` : `▶ ${T("Start pump", "పంపు ప్రారంభించండి")}`}</Btn>
          <p className="mt-2 text-xs text-muted-foreground">{T("Demo only — connect an ESP32 sensor to see real readings.", "డెమో మాత్రమే — నిజమైన రీడింగ్‌ల కోసం ESP32 సెన్సార్ కనెక్ట్ చేయండి.")}</p>
        </Card>
      ) : (
        <Card delay={120}>
          <Eyebrow>{T("Log watering", "నీరు పెట్టిన నమోదు")}</Eyebrow>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[15, 30, 60, 90].map((v) => <Chip key={v} active={mins === v} onClick={() => setMins(v)}>{v} {T("min", "ని.")}</Chip>)}
          </div>
          <Btn onClick={log} className="mt-3 w-full">💧 {T("I watered now", "ఇప్పుడు నీరు పెట్టాను")}</Btn>
          <div className="mt-3 divide-y divide-border text-sm">
            {logs.map((l, i) => (
              <div key={i} className="flex justify-between py-2"><span>{new Date(l.at).toLocaleString()}</span><span className="text-muted-foreground">{l.minutes} min</span></div>
            ))}
            {!logs.length && <p className="py-2 text-xs text-muted-foreground">{T("No watering logged yet.", "ఇంకా నమోదు లేదు.")}</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
