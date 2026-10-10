import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, seo } from "@/components/AppShell";
import { Card, Empty, Eyebrow, Notice, PageHeader, Progress } from "@/components/kit";
import { useApp } from "@/lib/store";
import { getCrop, harvestWindow, MANGO_MONTHS, MANGO_SPACING, mangoNutrientPerTree, PHASE_META, stageLabel } from "@/lib/crops";

export const Route = createFileRoute("/plan/$planId")({
  head: () => seo("My Crop Plan", "Your personalised crop plan with calendar, nutrition, irrigation and tasks."),
  component: () => (<AppShell><Plan /></AppShell>),
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Plan() {
  const { planId } = Route.useParams();
  const { plans, tasks, toggleTask, t, tl, lang } = useApp();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return <Empty emoji="🌱" title={lang === "te" ? "ప్రణాళిక కనబడలేదు" : "Plan not found"}><Link to="/plant" className="font-semibold text-primary">{t("chooseCrop")}</Link></Empty>;
  const crop = getCrop(plan.crop);
  const st = crop ? stageLabel(crop, plan.inputs) : null;
  const pt = tasks.filter((x) => x.planId === plan.id).sort((a, b) => a.date.localeCompare(b.date));
  const age = plan.inputs.treeAge ?? 0;
  const nut = mangoNutrientPerTree(age);
  const now = new Date().getMonth();
  return (
    <div className="space-y-3">
      <PageHeader emoji={crop?.emoji ?? "🌱"} title={`${t("myCropPlan")}: ${crop ? tl(crop.name) : plan.customName}`} sub={plan.inputs.location} />
      {st && (
        <Card>
          <Eyebrow>{t("stage")}</Eyebrow>
          <p className="mt-1 text-xl font-bold">{PHASE_META[st.phase].emoji} {tl(st.label)}</p>
          <div className="mt-3"><Progress value={st.pct} /></div>
          {crop && <p className="mt-3 text-sm">🌾 {t("expectedHarvest")}: <b>{tl(harvestWindow(crop, plan.inputs))}</b></p>}
        </Card>
      )}
      <Card>
        <Eyebrow>{t("tasks")}</Eyebrow>
        <div className="mt-2 space-y-1">
          {pt.map((x) => (
            <button key={x.id} onClick={() => toggleTask(x.id)} className="flex w-full items-center gap-3 py-2 text-left">
              <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${x.done ? "bg-primary text-primary-foreground" : "ring-1 ring-input"}`}>{x.done ? "✓" : ""}</span>
              <span className="flex-1 text-[15px]">{tl(x.title)}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{x.date.slice(5)}</span>
            </button>
          ))}
        </div>
      </Card>
      {plan.crop === "mango" && (
        <>
          <Card>
            <Eyebrow>📅 {t("calendar")}</Eyebrow>
            <div className="mt-3 space-y-1.5">
              {MANGO_MONTHS.map((m) => (
                <div key={m.month} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${m.month === now ? "bg-primary/10 font-semibold" : ""}`}>
                  <span className="w-9 font-mono text-xs text-muted-foreground">{MONTHS[m.month]}</span>
                  <span className={`size-2.5 rounded-full ${PHASE_META[m.phase].color}`} />
                  <span>{tl(m.task)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <Eyebrow>🌱 {lang === "te" ? "నాటడం & దూరం" : "Planting & spacing"}</Eyebrow>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>📏 {tl(MANGO_SPACING.regular)}</li>
              <li>📏 {tl(MANGO_SPACING.hd)}</li>
              <li>🕳️ {lang === "te" ? "1మీ × 1మీ × 1మీ గుంతలు, పైమట్టి + బాగా చివికిన పశువుల ఎరువు కలిపి నింపండి" : "Pits 1m × 1m × 1m; refill with topsoil mixed with well-rotted farmyard manure"}</li>
              <li>🌿 {lang === "te" ? "కోత తర్వాత కొమ్మ కత్తిరింపు, ఎండు కొమ్మలు తొలగించండి" : "Prune after harvest; remove dead and crossing branches"}</li>
            </ul>
          </Card>
          <Card>
            <Eyebrow>🧪 {t("fertilizer")}</Eyebrow>
            <p className="mt-2 text-sm">{lang === "te" ? `సాధారణ సూచన (చెట్టుకు/సంవత్సరం, ${age} ఏళ్లు):` : `General reference per tree per year (age ${age}):`}</p>
            <p className="mt-1 font-semibold">N {nut.n}g · P {nut.p}g · K {nut.k}g · FYM {nut.fym}kg</p>
            <p className="mt-1 text-xs text-muted-foreground">{lang === "te" ? "జూన్–జూలై తొలకరి తర్వాత, పాదుల్లో వేయండి." : "Apply in tree basins after first rains (Jun–Jul)."}</p>
            <div className="mt-3"><Notice>{t("fertWarn")}</Notice></div>
          </Card>
          <Card>
            <Eyebrow>💧 {t("irrigation")}</Eyebrow>
            <p className="mt-2 text-sm">{lang === "te" ? "అక్టో–డిసెం నీరు తగ్గించండి (పూత కోసం). పిందె నుండి కోత వరకు 10–15 రోజులకోసారి." : "Reduce water Oct–Dec to support flowering. From fruit set to harvest, irrigate every 10–15 days. Young trees: weekly in summer."}</p>
          </Card>
          <Card>
            <Eyebrow>🐛 {t("pests")}</Eyebrow>
            <div className="mt-2 space-y-2">
              {crop?.pests.map((p) => <p key={p.name.en} className="text-sm"><b>{tl(p.name)}</b> — {tl(p.signs)}</p>)}
            </div>
            <Link to="/pests" className="mt-2 block text-sm font-semibold text-primary">→</Link>
          </Card>
        </>
      )}
      <Notice tone="info">{t("notGuaranteed")}</Notice>
    </div>
  );
}
