import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, seo } from "@/components/AppShell";
import { Card, Empty, Eyebrow, PageHeader, useT } from "@/components/kit";
import { LocationPicker } from "@/components/LocationPicker";
import { useApp } from "@/lib/store";
import { getCrop, SOILS } from "@/lib/crops";
import { toFarmPatch, toLocInfo } from "@/lib/location";

export const Route = createFileRoute("/farm/$farmId")({
  head: () => seo("Farm dashboard", "Details, crop plans, location and tasks for one farm."),
  component: () => (
    <AppShell>
      <FarmDash />
    </AppShell>
  ),
});

function FarmDash() {
  const { farmId } = Route.useParams();
  const { farms, plans, t, tl, lang, setActiveFarm, updateFarm } = useApp();
  const T = useT();
  const f = farms.find((x) => x.id === farmId);
  if (!f) return <Empty emoji="🌾" title="Farm not found" />;
  const c = getCrop(f.crop ?? "");
  const rows: [string, string][] = [
    [t("location"), f.location],
    [t("area"), `${f.area ?? "—"} ${t("acres")}`],
    [t("crop"), c ? `${c.emoji} ${tl(c.name)}` : "—"],
    ["Variety", f.variety ?? "—"],
    [t("treeAge"), f.treeAge !== undefined ? `${f.treeAge} ${t("years")}` : "—"],
    [t("soil"), SOILS.find((s) => s.id === f.soil) ? tl(SOILS.find((s) => s.id === f.soil)!.label) : "—"],
    [t("water"), f.waterSource ?? "—"],
    ["Soil test", f.soilTest ? `N ${f.soilTest.n ?? "?"} · P ${f.soilTest.p ?? "?"} · K ${f.soilTest.k ?? "?"} · pH ${f.soilTest.ph ?? "?"}` : "—"],
  ];
  return (
    <div className="space-y-3">
      <PageHeader emoji="🌱" title={f.name} />
      <Card>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {rows.map(([k, v]) => (
            <>
              <p key={k} className="text-muted-foreground">
                {k}
              </p>
              <p className="font-semibold">{v}</p>
            </>
          ))}
        </div>
        <button onClick={() => setActiveFarm(f.id)} className="mt-3 text-sm font-semibold text-primary">
          ✓ Set as active farm
        </button>
      </Card>

      <Card className="space-y-3">
        <Eyebrow>{T("Farm location", "పొలం స్థానం")}</Eyebrow>
        <LocationPicker compact value={toLocInfo(f)} onChange={(l) => updateFarm(f.id, toFarmPatch(l))} />
        <p className="text-[11px] text-muted-foreground">
          {T("Weather, pest risk and farming advice for this farm follow this location.", "ఈ పొలం వాతావరణం, పురుగు ప్రమేమం, సలహా ఈ స్థానాన్నను అనసరణిసతాయీ.")}
        </p>
      </Card>

      <Card>
        <Eyebrow>{t("myCropPlan")}</Eyebrow>
        {plans
          .filter((p) => p.farmId === f.id)
          .map((p) => (
            <Link key={p.id} to="/plan/$planId" params={{ planId: p.id }} className="mt-2 block font-semibold text-primary">
              {getCrop(p.crop)?.emoji} {getCrop(p.crop) ? tl(getCrop(p.crop)!.name) : p.customName} →
            </Link>
          ))}
        <Link to="/plant" className="mt-3 block text-sm font-semibold">
          + {t("planQ")}
        </Link>
      </Card>
      <span className="sr-only">{lang}</span>
    </div>
  );
}
