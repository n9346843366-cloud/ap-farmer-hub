import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Eyebrow, Field, inputCls, Notice, PageHeader, Progress, Stat, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { addDays, CROPS, getCrop, iso, MANGO_MONTHS, PHASE_META, type Crop, type Phase } from "@/lib/crops";

export const Route = createFileRoute("/planner")({
  head: () => seo("Crop Calendar", "Pick a crop and planting date to see harvest dates, growth stages, seasons and a month-by-month plan for seasonal and plantation crops like mango."),
  component: () => (
    <AppShell>
      <Planner />
    </AppShell>
  ),
});

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_TE = ["జన", "ఫిబ్ర", "మార్చి", "ఏప్రి", "మే", "జూన్", "జూలై", "ఆగ", "సెప్టె", "అక్టో", "నవం", "డిసె"];

// Plantation crops: years to first harvest + yearly harvest months (South India)
const PLANTATION: Record<string, { bearYears: number; harvestMonths: number[] }> = {
  mango: { bearYears: 4, harvestMonths: [3, 4, 5] },
  banana: { bearYears: 0.9, harvestMonths: [] },
  coconut: { bearYears: 5, harvestMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  citrus: { bearYears: 3, harvestMonths: [10, 11, 0, 1] },
};

const SEASONS = [
  { id: "kharif", emoji: "🌧️", name: { en: "Kharif (monsoon)", te: "ఖరీఫ్ (వర్షాకాలం)" }, months: [5, 6, 7], range: { en: "Sow Jun–Aug · harvest Oct–Dec", te: "జూన్–ఆగ విత్తు · అక్టో–డిసె కోత" } },
  { id: "rabi", emoji: "❄️", name: { en: "Rabi (winter)", te: "రబీ (శీతాకాలం)" }, months: [9, 10, 11], range: { en: "Sow Oct–Dec · harvest Feb–Apr", te: "అక్టో–డిసె విత్తు · ఫిబ్ర–ఏప్రి కోత" } },
  { id: "zaid", emoji: "☀️", name: { en: "Zaid (summer)", te: "జైద్ (వేసవి)" }, months: [1, 2, 3], range: { en: "Sow Feb–Apr · short crops", te: "ఫిబ్ర–ఏప్రి విత్తు · తక్కువ కాల పంటలు" } },
];

const fmt = (d: Date, te: boolean) => d.toLocaleDateString(te ? "te-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });

function Planner() {
  const { tl, lang, activeFarm, addPlan, updateFarm } = useApp();
  const T = useT();
  const te = lang === "te";
  const M = te ? MONTHS_TE : MONTHS_EN;
  const navigate = useNavigate();
  const [kind, setKind] = useState<"seasonal" | "plantation">(getCrop(activeFarm?.crop ?? "")?.plantation === false ? "seasonal" : "plantation");
  const list = CROPS.filter((c) => (kind === "plantation" ? c.plantation : !c.plantation));
  const [cropId, setCropId] = useState(activeFarm?.crop && getCrop(activeFarm.crop) ? activeFarm.crop : "mango");
  const crop = getCrop(cropId) ?? list[0];
  const [date, setDate] = useState(activeFarm?.plantingDate ?? iso(new Date()));
  const [treeAge, setTreeAge] = useState<number>(activeFarm?.treeAge ?? 0);
  const [mode, setMode] = useState<"new" | "existing">(activeFarm?.treeAge ? "existing" : "new");

  const pickKind = (k: "seasonal" | "plantation") => {
    setKind(k);
    const first = CROPS.find((c) => (k === "plantation" ? c.plantation : !c.plantation));
    if (first) setCropId(first.id);
  };

  const today = new Date();
  const start = mode === "existing" && crop.plantation ? addDays(today, -Math.round(treeAge * 365)) : new Date(date);
  const isGoodMonth = crop.sowMonths.includes(start.getMonth());

  const timeline = useMemo(() => buildTimeline(crop, start), [crop, start.getTime()]);
  const harvest = harvestInfo(crop, start, today, te);
  const dayNo = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const pct = Math.max(0, Math.min(100, (dayNo / crop.durationDays) * 100));

  const create = () => {
    if (!activeFarm) return navigate({ to: "/farm" });
    const inputs = {
      location: activeFarm.location, area: activeFarm.area, soil: activeFarm.soil, water: activeFarm.water,
      plantingDate: iso(start), treeAge: crop.plantation ? Math.max(0, Math.floor(dayNo / 365)) : undefined, soilTest: activeFarm.soilTest,
    };
    updateFarm(activeFarm.id, { crop: crop.id, plantingDate: inputs.plantingDate, treeAge: inputs.treeAge });
    const plan = addPlan({ farmId: activeFarm.id, crop: crop.id, inputs });
    navigate({ to: "/plan/$planId", params: { planId: plan.id } });
  };

  return (
    <div className="space-y-3">
      <PageHeader emoji="📅" title={T("Crop Calendar", "పంట క్యాలెండర్")} sub={T("Choose a crop and date — we show the full season.", "పంట, తేదీ ఎంచుకోండి — పూర్తి కాలం చూపిస్తాం.")} back={false} />

      <Card>
        <div className="grid grid-cols-2 gap-2">
          <Chip active={kind === "seasonal"} onClick={() => pickKind("seasonal")}>🌾 {T("Seasonal crops", "కాలానుగుణ పంటలు")}</Chip>
          <Chip active={kind === "plantation"} onClick={() => pickKind("plantation")}>🌳 {T("Plantation crops", "తోట పంటలు")}</Chip>
        </div>
        <p className="eyebrow mt-4">{T("1 · Choose crop", "1 · పంట ఎంచుకోండి")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {list.map((c) => (
            <Chip key={c.id} active={c.id === crop.id} onClick={() => setCropId(c.id)}>{c.emoji} {tl(c.name)}</Chip>
          ))}
        </div>

        <p className="eyebrow mt-4">{T("2 · Planting date", "2 · నాటే తేదీ")}</p>
        {crop.plantation && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Chip active={mode === "new"} onClick={() => setMode("new")}>{T("New planting", "కొత్తగా నాటడం")}</Chip>
            <Chip active={mode === "existing"} onClick={() => setMode("existing")}>{T("Existing trees", "ఉన్న చెట్లు")}</Chip>
          </div>
        )}
        <div className="mt-2">
          {crop.plantation && mode === "existing" ? (
            <Field label={T("Tree age (years)", "చెట్ల వయస్సు (సంవత్సరాలు)")}>
              <input type="number" min={0} max={60} value={treeAge} onChange={(e) => setTreeAge(Number(e.target.value) || 0)} className={inputCls} />
            </Field>
          ) : (
            <Field label={T("Sowing / planting date", "విత్తే / నాటే తేదీ")}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
          )}
        </div>
        {!(crop.plantation && mode === "existing") && (
          <div className="mt-2">
            <Notice tone={isGoodMonth ? "ok" : "warn"}>
              {isGoodMonth ? T("Good time to plant this crop.", "ఈ పంట నాటడానికి సరైన సమయం.") : `${T("Not the usual planting time. Best:", "సాధారణ నాటే సమయం కాదు. ఉత్తమం:")} ${tl(crop.seasons)}`}
            </Notice>
          </div>
        )}
      </Card>

      {/* Result */}
      <Card delay={60}>
        <Eyebrow>{crop.emoji} {tl(crop.name)} · {T("Your dates", "మీ తేదీలు")}</Eyebrow>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label={T("Planting", "నాటడం")} value={fmt(start, te)} />
          <Stat label={T("Harvest", "కోత")} value={harvest.main} sub={harvest.sub} />
          <Stat label={T("Duration", "కాల వ్యవధి")} value={crop.plantation ? `${PLANTATION[crop.id]?.bearYears ?? 3} ${T("yrs to bear", "సం. కాపుకు")}` : `${crop.durationDays} ${T("days", "రోజులు")}`} />
          <Stat label={T("Today", "ఈరోజు")} value={dayNo < 0 ? `${-dayNo} ${T("days to go", "రోజులు మిగిలాయి")}` : crop.plantation ? `${(dayNo / 365).toFixed(1)} ${T("yrs old", "సం. వయస్సు")}` : `${T("Day", "రోజు")} ${dayNo}`} />
        </div>
        {!crop.plantation && dayNo >= 0 && (
          <div className="mt-3">
            <Progress value={pct} />
            <p className="mt-1 text-xs text-muted-foreground">{Math.round(pct)}% {T("of season done", "కాలం పూర్తయింది")}</p>
          </div>
        )}
      </Card>

      {/* Stage timeline */}
      <Card delay={120}>
        <Eyebrow>{T("Growth stages", "పెరుగుదల దశలు")}</Eyebrow>
        <ol className="mt-3 space-y-2">
          {timeline.map((s, i) => {
            const now = today >= s.from && today < s.to;
            const past = today >= s.to;
            return (
              <li key={i} className={`flex items-center gap-3 rounded-xl p-2.5 ${now ? "bg-primary/10 ring-1 ring-primary/40" : ""}`}>
                <span className={`grid size-9 shrink-0 place-items-center rounded-full text-lg ${past ? "opacity-50" : ""} bg-background/70`}>{PHASE_META[s.phase].emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${past ? "text-muted-foreground" : ""}`}>{s.label ? tl(s.label) : tl(PHASE_META[s.phase].label)} {now && <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{T("NOW", "ఇప్పుడు")}</span>}</p>
                  <p className="text-xs text-muted-foreground">{fmt(s.from, te)} – {fmt(s.to, te)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* 12-month grid */}
      <Card delay={180}>
        <Eyebrow>{T("Year at a glance", "సంవత్సర దృశ్యం")}</Eyebrow>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {M.map((m, i) => {
            const sow = crop.sowMonths.includes(i);
            const hv = monthHarvest(crop, start, i);
            const mango = crop.id === "mango" ? MANGO_MONTHS[i] : null;
            return (
              <div key={i} className={`rounded-lg p-2 text-center text-[11px] ring-1 ${i === today.getMonth() ? "ring-2 ring-primary" : "ring-border"} ${sow ? "bg-primary/15" : hv ? "bg-accent/25" : "bg-background/50"}`}>
                <p className="font-semibold">{m}</p>
                <p className="text-base leading-tight">{mango ? PHASE_META[mango.phase].emoji : sow ? "🌱" : hv ? "🌾" : "·"}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span>🌱 {T("Planting time", "నాటే సమయం")}</span>
          <span>🌾 {T("Harvest", "కోత")}</span>
        </div>
        {crop.id === "mango" && (
          <div className="mt-3 space-y-1.5">
            {MANGO_MONTHS.map((m) => (
              <div key={m.month} className={`flex gap-2 rounded-lg px-2 py-1.5 text-xs ${m.month === today.getMonth() ? "bg-primary/10 font-semibold" : ""}`}>
                <span className="w-12 shrink-0 text-muted-foreground">{M[m.month]}</span>
                <span>{PHASE_META[m.phase].emoji} {tl(m.task)}</span>
              </div>
            ))}
            {treeAge < 4 && mode === "existing" && <Notice tone="info">{T("Young trees (under 4 yrs): remove flowers so the tree builds strength.", "చిన్న చెట్లు (4 సం. లోపు): పూత తీసేయండి, చెట్టు బలపడుతుంది.")}</Notice>}
          </div>
        )}
      </Card>

      <Btn onClick={create} className="w-full">{activeFarm ? `📋 ${T("Create crop plan & tasks", "పంట ప్రణాళిక & పనులు తయారు చేయండి")}` : T("Add a farm first", "ముందుగా పొలం జోడించండి")}</Btn>

      {/* Seasonal guide */}
      <Card delay={240}>
        <Eyebrow>{T("Seasonal crop guide", "కాలానుగుణ పంటల గైడ్")}</Eyebrow>
        <div className="mt-3 space-y-3">
          {SEASONS.map((s) => {
            const crops = CROPS.filter((c) => !c.plantation && c.sowMonths.some((m) => s.months.includes(m)));
            const active = s.months.includes(today.getMonth()) || s.months.includes((today.getMonth() + 1) % 12);
            return (
              <div key={s.id} className={`rounded-xl p-3 ${active ? "bg-primary/10 ring-1 ring-primary/30" : "bg-background/50"}`}>
                <p className="text-sm font-bold">{s.emoji} {tl(s.name)} {active && <span className="ml-1 text-[10px] font-semibold text-primary">● {T("Now / next", "ఇప్పుడు / తదుపరి")}</span>}</p>
                <p className="text-xs text-muted-foreground">{tl(s.range)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {crops.map((c) => (
                    <button key={c.id} onClick={() => { setKind("seasonal"); setCropId(c.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-full bg-card px-2.5 py-1 text-xs ring-1 ring-border">{c.emoji} {tl(c.name)}</button>
                  ))}
                  {!crops.length && <span className="text-xs text-muted-foreground">—</span>}
                </div>
              </div>
            );
          })}
        </div>
        <Link to="/plant" className="mt-3 block text-center text-sm font-semibold text-primary">{T("Not sure? Get a crop recommendation →", "తెలియదా? పంట సూచన పొందండి →")}</Link>
      </Card>
    </div>
  );
}

type Span = { phase: Phase; from: Date; to: Date; label?: { en: string; te: string } };

function buildTimeline(crop: Crop, start: Date): Span[] {
  const day = 86400000;
  if (crop.plantation) {
    const bear = PLANTATION[crop.id]?.bearYears ?? 3;
    const bearAt = new Date(start.getTime() + bear * 365 * day);
    return [
      { phase: "planting", from: start, to: new Date(start.getTime() + 60 * day), label: { en: "Planting & establishment", te: "నాటడం & స్థాపన" } },
      { phase: "growth", from: new Date(start.getTime() + 60 * day), to: bearAt, label: { en: "Juvenile growth – build canopy", te: "బాల్య దశ – కొమ్మల పెంపు" } },
      { phase: "flowering", from: bearAt, to: new Date(bearAt.getTime() + 90 * day), label: { en: "First flowering", te: "మొదటి పూత" } },
      { phase: "harvest", from: new Date(bearAt.getTime() + 90 * day), to: new Date(bearAt.getTime() + 200 * day), label: { en: "First harvest, then yearly", te: "మొదటి కోత, తర్వాత ఏటా" } },
    ];
  }
  return crop.stages
    .filter((s) => ["planting", "growth", "flowering", "fruit", "harvest"].includes(s.phase))
    .map((s) => ({ phase: s.phase, from: new Date(start.getTime() + (s.from / 100) * crop.durationDays * day), to: new Date(start.getTime() + (s.to / 100) * crop.durationDays * day) }));
}

function harvestInfo(crop: Crop, start: Date, today: Date, te: boolean) {
  const day = 86400000;
  if (crop.plantation) {
    const p = PLANTATION[crop.id] ?? { bearYears: 3, harvestMonths: [] };
    const first = new Date(start.getTime() + p.bearYears * 365 * day);
    const months = p.harvestMonths.length === 12 ? (te ? "ఏడాది పొడవునా" : "Year-round") : p.harvestMonths.map((m) => (te ? MONTHS_TE : MONTHS_EN)[m]).join("–");
    if (first <= today) return { main: months || "—", sub: te ? "ప్రతి సంవత్సరం" : "Every year" };
    return { main: first.toLocaleDateString(te ? "te-IN" : "en-IN", { month: "short", year: "numeric" }), sub: months ? `${te ? "తర్వాత ఏటా" : "then yearly"} ${months}` : undefined };
  }
  const a = new Date(start.getTime() + crop.durationDays * 0.92 * day);
  const b = new Date(start.getTime() + crop.durationDays * 1.05 * day);
  return { main: fmt(a, te), sub: `${te ? "వరకు" : "to"} ${fmt(b, te)}` };
}

function monthHarvest(crop: Crop, start: Date, month: number) {
  if (crop.plantation) {
    const p = PLANTATION[crop.id];
    if (p?.harvestMonths.length) return p.harvestMonths.includes(month);
    return new Date(start.getTime() + crop.durationDays * 86400000).getMonth() === month;
  }
  const h = new Date(start.getTime() + crop.durationDays * 86400000).getMonth();
  return h === month;
}
