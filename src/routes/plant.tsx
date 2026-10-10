import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Eyebrow, Field, inputCls, Notice, PageHeader } from "@/components/kit";
import { LocationPicker } from "@/components/LocationPicker";
import { useApp } from "@/lib/store";
import { toFarmPatch, toLocInfo, type LocInfo } from "@/lib/location";
import { CROPS, getCrop, iso, MANGO_VARIETIES, recommend, SOILS, WATERS, type Soil, type Water } from "@/lib/crops";

export const Route = createFileRoute("/plant")({
  validateSearch: z.object({ crop: z.string().optional() }),
  head: () => seo("What are you planning to plant?", "Pick a crop and get a personalised crop plan in a few taps."),
  component: () => (
    <AppShell>
      <Plant />
    </AppShell>
  ),
});

function Plant() {
  const { crop: initial } = Route.useSearch();
  const { t, tl, lang, activeFarm, user, addFarm, updateFarm, addPlan } = useApp();
  const nav = useNavigate();
  const [cropId, setCropId] = useState<string | undefined>(initial);
  const [custom, setCustom] = useState("");
  const [q, setQ] = useState("");
  const crop = cropId ? getCrop(cropId) : undefined;

  const [form, setForm] = useState({
    location: activeFarm?.location ?? user?.location ?? "",
    area: activeFarm?.area?.toString() ?? "",
    plantingDate: "",
    soil: activeFarm?.soil as Soil | undefined,
    water: (activeFarm?.water ?? undefined) as Water | undefined,
    variety: "",
    existing: !!(initial === "mango" && activeFarm?.treeAge),
    treeAge: activeFarm?.treeAge?.toString() ?? "",
    n: "", p: "", k: "", ph: "",
  });
  const [showSoil, setShowSoil] = useState(false);
  const [place, setPlace] = useState<LocInfo>(toLocInfo(activeFarm ?? user));

  const recs = useMemo(() => recommend({ soil: activeFarm?.soil, water: activeFarm?.water, month: new Date().getMonth() }).slice(0, 4), [activeFarm]);
  const list = CROPS.filter((c) => !q || c.name.en.toLowerCase().includes(q.toLowerCase()) || c.name.te.includes(q));

  const create = () => {
    if (!cropId && !custom.trim()) return;
    const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
    const soilTest = form.n || form.p || form.k || form.ph ? { n: num(form.n), p: num(form.p), k: num(form.k), ph: num(form.ph) } : undefined;
    const treeAge = crop?.plantation ? (form.existing ? num(form.treeAge) ?? 0 : 0) : undefined;
    const inputs = {
      location: form.location || undefined, area: num(form.area), soil: form.soil, water: form.water,
      plantingDate: form.plantingDate || (crop?.plantation && !form.existing ? iso(new Date()) : undefined),
      variety: form.variety || undefined, treeAge, soilTest,
    };
    let farm = activeFarm;
    const farmPatch = { ...toFarmPatch(place), location: form.location || place.location || farm?.location || "", area: inputs.area, soil: form.soil, water: form.water, crop: cropId ?? "custom", variety: inputs.variety, treeAge, plantingDate: inputs.plantingDate, soilTest };
    if (!farm) farm = addFarm({ name: "Farm 1", waterSource: form.water === "high" ? "Canal" : form.water === "medium" ? "Borewell" : "Rain-fed", ...farmPatch });
    else updateFarm(farm.id, farmPatch);
    const plan = addPlan({ farmId: farm.id, crop: cropId ?? "custom", customName: cropId ? undefined : custom.trim(), inputs });
    toast.success(lang === "te" ? "మీ పంట ప్రణాళిక సిద్ధం! 🎉" : "Your crop plan is ready! 🎉");
    nav({ to: "/plan/$planId", params: { planId: plan.id } });
  };

  if (!cropId && !custom) {
    return (
      <div className="space-y-4">
        <PageHeader emoji="🌱" title={t("planQ")} sub={lang === "te" ? "పంటను ఎంచుకోండి లేదా వెతకండి" : "Search, pick from the list, or add your own crop"} />
        <input className={inputCls} placeholder={lang === "te" ? "🔍 పంట వెతకండి…" : "🔍 Search crop…"} value={q} onChange={(e) => setQ(e.target.value)} />
        {recs.length > 0 && !q && (
          <Card>
            <Eyebrow>{lang === "te" ? "ఈ సీజన్‌కు సిఫార్సు" : "Recommended for this season"}</Eyebrow>
            <div className="mt-3 flex flex-wrap gap-2">
              {recs.map((r) => (
                <Chip key={r.crop.id} onClick={() => setCropId(r.crop.id)}>{r.crop.emoji} {tl(r.crop.name)}</Chip>
              ))}
            </div>
          </Card>
        )}
        <div className="grid grid-cols-3 gap-3">
          {list.map((c, i) => (
            <button key={c.id} onClick={() => setCropId(c.id)} className="glass animate-rise flex flex-col items-center gap-1 p-3 text-center active:scale-95" style={{ animationDelay: `${i * 25}ms` }}>
              <span className="text-4xl">{c.emoji}</span>
              <span className="text-sm font-semibold leading-tight">{tl(c.name)}</span>
            </button>
          ))}
        </div>
        <Card>
          <Eyebrow>{lang === "te" ? "మరొక పంట జోడించండి" : "Add another crop"}</Eyebrow>
          <div className="mt-3 flex gap-2">
            <input id="custom" className={inputCls} placeholder={lang === "te" ? "ఉదా: పసుపు" : "e.g. Turmeric"} onKeyDown={(e) => { if (e.key === "Enter") setCustom((e.target as HTMLInputElement).value); }} />
            <Btn onClick={() => setCustom((document.getElementById("custom") as HTMLInputElement).value)}>+</Btn>
          </div>
        </Card>
      </div>
    );
  }

  const isPlantation = !!crop?.plantation;
  return (
    <div className="space-y-4">
      <PageHeader emoji={crop?.emoji ?? "🌱"} title={crop ? tl(crop.name) : custom} sub={lang === "te" ? "అవసరమైన వివరాలు మాత్రమే. ఐచ్ఛికమైనవి దాటవేయవచ్చు." : "Only what we need. You can skip optional fields."} />
      <button onClick={() => { setCropId(undefined); setCustom(""); }} className="-mt-2 text-sm font-semibold text-primary">↺ {lang === "te" ? "పంట మార్చండి" : "Change crop"}</button>
      <Card className="space-y-4">
        <Field label={`📍 ${t("location")}`}>
          <LocationPicker
            value={place}
            onChange={(l) => {
              setPlace(l);
              setForm({ ...form, location: l.location });
            }}
          />
        </Field>
        <Field label={`📏 ${t("area")} (${t("acres")})`}><input className={inputCls} inputMode="decimal" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="2" /></Field>
        {isPlantation ? (
          <>
            <Field label={lang === "te" ? "తోట రకం" : "Plantation"}>
              <div className="flex gap-2">
                <Chip active={!form.existing} onClick={() => setForm({ ...form, existing: false })}>{lang === "te" ? "కొత్త తోట" : "New plantation"}</Chip>
                <Chip active={form.existing} onClick={() => setForm({ ...form, existing: true })}>{lang === "te" ? "ఉన్న చెట్లు" : "Existing trees"}</Chip>
              </div>
            </Field>
            {form.existing ? (
              <Field label={`🌳 ${t("treeAge")} (${t("years")})`}><input className={inputCls} inputMode="numeric" value={form.treeAge} onChange={(e) => setForm({ ...form, treeAge: e.target.value })} placeholder="4" /></Field>
            ) : (
              <Field label={lang === "te" ? "📅 నాటే తేదీ" : "📅 Planned planting date"} optional><input type="date" className={inputCls} value={form.plantingDate} onChange={(e) => setForm({ ...form, plantingDate: e.target.value })} /></Field>
            )}
          </>
        ) : (
          <Field label={lang === "te" ? "📅 నాటే / విత్తే తేదీ" : "📅 Planned planting date"} optional hint={lang === "te" ? "ఇవ్వకపోతే ఈరోజు నుండి లెక్కిస్తాం" : "If empty, we plan from today"}>
            <input type="date" className={inputCls} value={form.plantingDate} onChange={(e) => setForm({ ...form, plantingDate: e.target.value })} />
          </Field>
        )}
        <Field label={`🟫 ${t("soil")}`} optional>
          <div className="flex flex-wrap gap-2">{SOILS.map((s) => <Chip key={s.id} active={form.soil === s.id} onClick={() => setForm({ ...form, soil: s.id })}>{tl(s.label)}</Chip>)}</div>
        </Field>
        <Field label={`💧 ${t("water")}`} optional>
          <div className="flex flex-wrap gap-2">{WATERS.map((s) => <Chip key={s.id} active={form.water === s.id} onClick={() => setForm({ ...form, water: s.id })}>{tl(s.label)}</Chip>)}</div>
        </Field>
        <Field label={lang === "te" ? "🌿 రకం" : "🌿 Variety"} optional>
          {cropId === "mango" ? (
            <div className="flex flex-wrap gap-2">{MANGO_VARIETIES.map((v) => <Chip key={v} active={form.variety === v} onClick={() => setForm({ ...form, variety: v })}>{v}</Chip>)}</div>
          ) : (
            <input className={inputCls} value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} />
          )}
        </Field>
        <button onClick={() => setShowSoil(!showSoil)} className="text-sm font-semibold text-primary">
          {showSoil ? "−" : "+"} 🧪 {lang === "te" ? "నేల పరీక్ష ఫలితాలు (ఐచ్ఛికం)" : "Soil test results (optional)"}
        </button>
        {showSoil && (
          <div className="grid grid-cols-2 gap-3">
            {(["n", "p", "k", "ph"] as const).map((k) => (
              <Field key={k} label={k === "ph" ? "pH" : `${k.toUpperCase()} (kg/ha)`}>
                <input className={inputCls} inputMode="decimal" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </Field>
            ))}
          </div>
        )}
      </Card>
      {crop && form.soil && !crop.soils.includes(form.soil) && (
        <Notice>{lang === "te" ? "ఈ నేల ఈ పంటకు అంత అనుకూలం కాకపోవచ్చు. నిపుణుల సలహా తీసుకోండి." : "This soil may not be ideal for this crop. Consider local expert advice."}</Notice>
      )}
      <Btn className="w-full text-base" onClick={create}>✨ {t("generatePlan")}</Btn>
    </div>
  );
}
