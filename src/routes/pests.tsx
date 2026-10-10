import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Card, Chip, Eyebrow, Notice, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { CROPS, getCrop } from "@/lib/crops";

export const Route = createFileRoute("/pests")({
  head: () => seo("Pest Alerts", "Pest and disease risks for your crop with signs to look for and safe prevention steps."),
  component: () => (
    <AppShell>
      <Pests />
    </AppShell>
  ),
});

const riskCls = { high: "bg-destructive/15 text-destructive", medium: "bg-accent/20 text-accent-foreground", low: "bg-primary/10 text-primary" };

function Pests() {
  const { activeFarm, tl } = useApp();
  const T = useT();
  const [id, setId] = useState(getCrop(activeFarm?.crop ?? "") ? activeFarm!.crop! : "mango");
  const crop = getCrop(id)!;
  const order = { high: 0, medium: 1, low: 2 };
  const pests = [...crop.pests].sort((a, b) => order[a.risk] - order[b.risk]);
  const riskLbl = (r: "low" | "medium" | "high") => ({ high: T("High risk", "అధిక ప్రమాదం"), medium: T("Medium", "మధ్యస్థం"), low: T("Low", "తక్కువ") })[r];

  return (
    <div className="space-y-3">
      <PageHeader emoji="🐛" title={T("Pest Alerts", "పురుగుల హెచ్చరికలు")} />
      <Card>
        <div className="flex flex-wrap gap-1.5">
          {CROPS.map((c) => <Chip key={c.id} active={id === c.id} onClick={() => setId(c.id)}>{c.emoji} {tl(c.name)}</Chip>)}
        </div>
      </Card>
      <Notice tone="warn">{T("Humid, cloudy weather (demo) raises sucking-pest and fungal risk this week.", "తేమ, మబ్బు వాతావరణం (డెమో) ఈ వారం రసం పీల్చే పురుగులు, తెగుళ్ళ ప్రమాదం పెంచుతుంది.")}</Notice>
      {pests.map((p, i) => (
        <Card key={i} delay={i * 50}>
          <Eyebrow right={<span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${riskCls[p.risk]}`}>{riskLbl(p.risk)}</span>}>{tl(p.name)}</Eyebrow>
          <p className="mt-2 text-sm"><b>👀 {T("Signs", "లక్షణాలు")}:</b> {tl(p.signs)}</p>
          <p className="mt-1 text-sm"><b>🛡️ {T("Prevent", "నివారణ")}:</b> {tl(p.prevent)}</p>
        </Card>
      ))}
      <Link to="/scan" className="glass block p-4 text-center font-semibold">📷 {T("See something? Scan a leaf", "ఏదైనా కనిపించిందా? ఆకు స్కాన్ చేయండి")}</Link>
      <Link to="/expert" className="block text-center text-sm font-semibold text-primary">{T("Ask an expert →", "నిపుణుడిని అడగండి →")}</Link>
    </div>
  );
}
