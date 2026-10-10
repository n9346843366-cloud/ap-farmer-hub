import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Field, inputCls, PageHeader } from "@/components/kit";
import { LocationPicker } from "@/components/LocationPicker";
import { useApp } from "@/lib/store";
import { getCrop } from "@/lib/crops";
import { toFarmPatch, toLocInfo, type LocInfo } from "@/lib/location";

export const Route = createFileRoute("/farm/")({
  head: () => seo("My Farms", "Manage your farms, crops, soil and location details."),
  component: () => (
    <AppShell>
      <Farms />
    </AppShell>
  ),
});

function Farms() {
  const { farms, addFarm, t, tl, lang, user } = useApp();
  const [f, setF] = useState({ name: "", area: "", water: "" });
  const [place, setPlace] = useState<LocInfo>(toLocInfo(user));
  const [open, setOpen] = useState(false);

  const save = () => {
    addFarm({
      ...toFarmPatch(place),
      name: f.name || `Farm ${farms.length + 1}`,
      area: f.area ? Number(f.area) : undefined,
      waterSource: f.water,
    });
    setOpen(false);
    setF({ name: "", area: "", water: "" });
  };

  return (
    <div className="space-y-3">
      <PageHeader emoji="🌱" title={t("myFarm")} back={false} />
      {farms.map((fm) => {
        const c = getCrop(fm.crop ?? "");
        return (
          <Link key={fm.id} to="/farm/$farmId" params={{ farmId: fm.id }} className="glass block p-4">
            <p className="text-lg font-bold">
              {c?.emoji ?? "🌾"} {fm.name}
            </p>
            <p className="text-sm text-muted-foreground">
              📍 {fm.location} · {fm.area ?? "?"} {t("acres")} · {c ? tl(c.name) : "—"}
            </p>
          </Link>
        );
      })}
      {open ? (
        <Card className="space-y-3">
          <Field label={t("name")}>
            <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Farm 2" />
          </Field>
          <Field label={`📍 ${t("location")}`}>
            <LocationPicker value={place} onChange={setPlace} />
          </Field>
          <Field label={`${t("area")} (${t("acres")})`}>
            <input className={inputCls} inputMode="decimal" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} />
          </Field>
          <Field label={t("water")}>
            <input className={inputCls} value={f.water} onChange={(e) => setF({ ...f, water: e.target.value })} placeholder="Borewell" />
          </Field>
          <Btn className="w-full" onClick={save} disabled={!place.location.trim()}>
            {t("save")}
          </Btn>
        </Card>
      ) : (
        <Btn className="w-full" onClick={() => setOpen(true)}>
          {t("addFarm")}
        </Btn>
      )}
      {lang && (
        <Link to="/plant" className="block text-center text-sm font-semibold text-primary">
          🌱 {t("planQ")}
        </Link>
      )}
    </div>
  );
}
