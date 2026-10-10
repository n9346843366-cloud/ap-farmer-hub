import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, seo } from "@/components/AppShell";
import { Card, Eyebrow, Notice, PageHeader, Stat, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { getCrop, LEVEL_FACTOR, mangoNutrientPerTree, soilLevels, stageLabel, type Level } from "@/lib/crops";

export const Route = createFileRoute("/fertilizer")({
  head: () => seo("Fertilizer Advisor", "Soil-test based nutrient plan for your crop and stage, with safe split doses."),
  component: () => (
    <AppShell>
      <Fertilizer />
    </AppShell>
  ),
});

const lvColor: Record<Level, string> = { low: "text-destructive", medium: "text-primary", high: "text-accent-foreground", unknown: "text-muted-foreground" };

function Fertilizer() {
  const { activeFarm, plans, tl } = useApp();
  const T = useT();
  const plan = plans.find((p) => p.farmId === activeFarm?.id);
  const crop = getCrop(plan?.crop ?? activeFarm?.crop ?? "");
  const st = activeFarm?.soilTest;
  const lv = soilLevels(st);
  const area = activeFarm?.area ?? 1;
  const stage = crop ? stageLabel(crop, plan?.inputs ?? { treeAge: activeFarm?.treeAge, plantingDate: activeFarm?.plantingDate }) : null;
  const lvl = (l: Level) => ({ low: T("Low", "తక్కువ"), medium: T("Medium", "మధ్యస్థం"), high: T("High", "ఎక్కువ"), unknown: T("Not tested", "పరీక్షించలేదు") })[l];

  if (!crop) return (
    <div className="space-y-3">
      <PageHeader emoji="🧪" title={T("Fertilizer Advisor", "ఎరువుల సలహా")} />
      <Notice tone="info">{T("Create a crop plan first to get a nutrient plan.", "ఎరువుల ప్రణాళిక కోసం ముందుగా పంట ప్రణాళిక చేయండి.")}</Notice>
      <Link to="/planner" className="block text-center font-semibold text-primary">{T("Open crop calendar →", "పంట క్యాలెండర్ →")}</Link>
    </div>
  );

  const isMango = crop.id === "mango";
  const tree = isMango ? mangoNutrientPerTree(activeFarm?.treeAge ?? 1) : null;
  const n = Math.round(crop.nutrient.n * LEVEL_FACTOR[lv.n] * area);
  const p = Math.round(crop.nutrient.p * LEVEL_FACTOR[lv.p] * area);
  const k = Math.round(crop.nutrient.k * LEVEL_FACTOR[lv.k] * area);

  return (
    <div className="space-y-3">
      <PageHeader emoji="🧪" title={T("Fertilizer Advisor", "ఎరువుల సలహా")} sub={`${crop.emoji} ${tl(crop.name)}${stage ? ` · ${tl(stage.label)}` : ""}`} />
      <Card>
        <Eyebrow>{T("Your soil test", "మీ నేల పరీక్ష")}</Eyebrow>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {(["n", "p", "k"] as const).map((x) => (
            <div key={x} className="rounded-xl bg-background/60 p-2">
              <p className="text-xs font-bold uppercase">{x}</p>
              <p className="text-sm">{st?.[x] ?? "—"}</p>
              <p className={`text-[10px] font-semibold ${lvColor[lv[x]]}`}>{lvl(lv[x])}</p>
            </div>
          ))}
          <div className="rounded-xl bg-background/60 p-2"><p className="text-xs font-bold">pH</p><p className="text-sm">{st?.ph ?? "—"}</p></div>
        </div>
        {!st && <div className="mt-3"><Notice tone="warn">{T("No soil test added — using general guidance. Get a Soil Health Card for accurate doses.", "నేల పరీక్ష లేదు — సాధారణ సూచన. ఖచ్చితత్వానికి సాయిల్ హెల్త్ కార్డ్ పొందండి.")}</Notice></div>}
        {lv.ph !== undefined && (lv.ph < 6 || lv.ph > 8) && <div className="mt-3"><Notice tone="warn">{lv.ph < 6 ? T("Acidic soil — consider lime as advised locally.", "ఆమ్ల నేల — స్థానిక సలహాతో సున్నం.") : T("Alkaline soil — add organic matter / gypsum as advised.", "క్షార నేల — సేంద్రియ ఎరువు / జిప్సం.")}</Notice></div>}
      </Card>

      <Card delay={60}>
        {isMango && tree ? (
          <>
            <Eyebrow>{T("Per tree per year", "చెట్టుకు సంవత్సరానికి")} ({activeFarm?.treeAge ?? 1} {T("yrs", "సం.")})</Eyebrow>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="N" value={`${Math.round(tree.n * LEVEL_FACTOR[lv.n])} g`} />
              <Stat label="P" value={`${Math.round(tree.p * LEVEL_FACTOR[lv.p])} g`} />
              <Stat label="K" value={`${Math.round(tree.k * LEVEL_FACTOR[lv.k])} g`} />
              <Stat label={T("Farm manure", "పశువుల ఎరువు")} value={`${tree.fym} kg`} />
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              <p>📅 {T("Split: half after harvest with first rains (Jun–Jul), half in Sep–Oct.", "విభజన: సగం కోత తర్వాత తొలకరిలో (జూన్–జూలై), సగం సెప్టె–అక్టో.")}</p>
              <p>⭕ {T("Apply in a ring 1–1.5 m from trunk, mix into soil, then water.", "కాండం నుండి 1–1.5 మీ. దూరంలో వలయంగా వేసి, మట్టిలో కలిపి నీరు పెట్టండి.")}</p>
              <p>🚫 {T("Do not apply during flowering or fruit set.", "పూత, పిందె సమయంలో వేయవద్దు.")}</p>
            </div>
          </>
        ) : (
          <>
            <Eyebrow>{T("Total for", "మొత్తం")} {area} {T("acres (nutrient kg)", "ఎకరాలకు (పోషకం కేజీ)")}</Eyebrow>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Stat label={T("Nitrogen N", "నత్రజని N")} value={`${n} kg`} />
              <Stat label={T("Phosphorus P", "భాస్వరం P")} value={`${p} kg`} />
              <Stat label={T("Potash K", "పొటాష్ K")} value={`${k} kg`} />
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              <p>1️⃣ {T("At sowing: all P, all K, 1/3 N + compost", "విత్తేటప్పుడు: మొత్తం P, K, 1/3 N + కంపోస్టు")}</p>
              <p>2️⃣ {T("Day 25–30: 1/3 N after weeding", "25–30 రోజులు: కలుపు తర్వాత 1/3 N")}</p>
              <p>3️⃣ {T("Before flowering: last 1/3 N", "పూతకు ముందు: మిగతా 1/3 N")}</p>
            </div>
          </>
        )}
      </Card>
      <Notice tone="info">{T("General guidance only. Confirm product and dose with your local agriculture officer.", "సాధారణ సూచన మాత్రమే. ఉత్పత్తి, మోతాదు స్థానిక వ్యవసాయ అధికారితో నిర్ధారించండి.")}</Notice>
      {activeFarm && <Link to="/farm/$farmId" params={{ farmId: activeFarm.id }} className="block text-center text-sm font-semibold text-primary">{T("Update soil test →", "నేల పరీక్ష నవీకరించండి →")}</Link>}
    </div>
  );
}
