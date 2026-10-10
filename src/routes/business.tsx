import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Eyebrow, Field, inputCls, Notice, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { logQuestion } from "@/lib/ai-log";

export const Route = createFileRoute("/business")({
  head: () => seo("Business Hub", "Farm business ideas, or check your own idea: investment, income and break-even for your land and budget."),
  component: () => (<AppShell><Business /></AppShell>),
});

const IDEAS = ["Dairy (2 cows)", "Country chicken", "Goat rearing", "Mushroom", "Vermicompost", "Plant nursery", "Honey bees", "Tractor hiring"];

function Business() {
  const { activeFarm, user, lang } = useApp();
  const T = useT();
  const [idea, setIdea] = useState("");
  const [budget, setBudget] = useState("");
  const [land, setLand] = useState(activeFarm?.area ? String(activeFarm.area) : "");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();

  const run = async () => {
    if (!budget) return setErr(T("How much money can you invest?", "ఎంత డబ్బు పెట్టుబడి పెట్టగలరు?"));
    setErr(undefined); setOut(""); setBusy(true);
    void logQuestion("business", `Idea: ${idea || "suggest"}; budget ₹${budget}; land ${land} acres`);
    try {
      const r = await fetch("/api/business", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, budget, land, water: activeFarm?.waterSource, location: activeFarm?.location ?? user?.location, lang }) });
      if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || T("Could not analyse. Try again.", "విశ్లేషణ రాలేదు. మళ్లీ ప్రయత్నించండి."));
      const reader = r.body.getReader(); const dec = new TextDecoder(); let acc = "";
      for (;;) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setOut(acc); }
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <PageHeader emoji="💡" title={T("Business Hub", "బిజినెస్ హబ్")} sub={T("Extra income ideas for your farm", "అదనపు ఆదాయ ఆలోచనలు")} />
      <Card>
        <Field label={T("Your business idea (leave empty for suggestions)", "మీ ఆలోచన (ఖాళీగా వదిలితే సూచనలు ఇస్తాం)")}>
          <textarea className={`${inputCls} min-h-20`} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={T("e.g. I want to start a small dairy", "ఉదా: చిన్న డెయిరీ పెట్టాలి")} />
        </Field>
        <div className="mt-2 flex flex-wrap gap-1.5">{IDEAS.map((c) => <Chip key={c} active={idea === c} onClick={() => setIdea(idea === c ? "" : c)}>{c}</Chip>)}</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label={T("Money to invest (₹)", "పెట్టుబడి (₹)")}><input className={inputCls} inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} placeholder="100000" /></Field>
          <Field label={T("Land (acres)", "భూమి (ఎకరాలు)")}><input className={inputCls} inputMode="decimal" value={land} onChange={(e) => setLand(e.target.value.replace(/[^\d.]/g, ""))} /></Field>
        </div>
        <Btn className="mt-4 w-full" onClick={run} disabled={busy}>{busy ? T("Analysing…", "విశ్లేషిస్తోంది…") : idea ? T("Analyse my idea", "నా ఆలోచన విశ్లేషించండి") : T("Suggest ideas for me", "నాకు ఆలోచనలు సూచించండి")}</Btn>
      </Card>
      {err && <Notice tone="warn">{err}</Notice>}
      {out && (
        <Card>
          <Eyebrow>{T("Analysis", "విశ్లేషణ")}</Eyebrow>
          <div className="prose prose-sm mt-2 max-w-none text-foreground [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-1 [&_th]:border [&_th]:border-border [&_th]:p-1 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5">
            <ReactMarkdown>{out}</ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
}
