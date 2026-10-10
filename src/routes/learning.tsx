import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Eyebrow, Field, inputCls, Notice, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { logQuestion } from "@/lib/ai-log";

export const Route = createFileRoute("/learning")({
  head: () => seo("Learning Hub", "Plan a new crop: investment needed, plant spacing and labour vs tractor planting costs."),
  component: () => (<AppShell><Learning /></AppShell>),
});

const QUICK = ["Mango", "Tomato", "Chilli", "Paddy", "Groundnut", "Cotton", "Banana", "Guava"];
const METHODS = [
  { k: "labour", e: "👷", en: "By labour", te: "కూలీలతో" },
  { k: "tractor", e: "🚜", en: "By tractor", te: "ట్రాక్టర్‌తో" },
  { k: "machine", e: "⚙️", en: "Machine / seed drill", te: "యంత్రంతో" },
  { k: "not sure", e: "🤔", en: "Not sure — suggest", te: "తెలియదు — సూచించండి" },
];

function Learning() {
  const { activeFarm, user, lang } = useApp();
  const T = useT();
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState(activeFarm?.area ? String(activeFarm.area) : "1");
  const [method, setMethod] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();

  const run = async () => {
    if (!crop.trim()) return setErr(T("Tell us which crop you want to grow.", "ఏ పంట వేయాలనుకుంటున్నారో చెప్పండి."));
    if (!method) return setErr(T("How do you want to plant — labour or tractor?", "ఎలా నాటాలి — కూలీలతోనా ట్రాక్టర్‌తోనా?"));
    setErr(undefined); setOut(""); setBusy(true);
    void logQuestion("learning", `Plan ${crop} on ${area} acres by ${method}`);
    try {
      const r = await fetch("/api/learn", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop, area, method, soil: activeFarm?.soil, water: activeFarm?.waterSource, location: activeFarm?.location ?? user?.location, lang }) });
      if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || T("Could not get a plan. Try again.", "ప్రణాళిక రాలేదు. మళ్లీ ప్రయత్నించండి."));
      const reader = r.body.getReader(); const dec = new TextDecoder(); let acc = "";
      for (;;) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setOut(acc); }
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <PageHeader emoji="📚" title={T("Learning Hub", "లెర్నింగ్ హబ్")} sub={T("Plan a new crop before you invest", "పెట్టుబడికి ముందే ప్రణాళిక")} />
      <Card>
        <Field label={T("Which crop do you want to grow?", "ఏ పంట వేయాలి?")}>
          <input className={inputCls} value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Mango" />
        </Field>
        <div className="mt-2 flex flex-wrap gap-1.5">{QUICK.map((c) => <Chip key={c} active={crop === c} onClick={() => setCrop(c)}>{c}</Chip>)}</div>
        <div className="mt-3"><Field label={T("Which farm area? (acres)", "ఎంత విస్తీర్ణం? (ఎకరాలు)")}><input className={inputCls} inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value.replace(/[^\d.]/g, ""))} /></Field></div>
        <p className="mt-3 text-sm font-semibold">{T("How do you want to plant?", "ఎలా నాటాలనుకుంటున్నారు?")}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">{METHODS.map((m) => <Chip key={m.k} active={method === m.k} onClick={() => setMethod(m.k)}>{m.e} {T(m.en, m.te)}</Chip>)}</div>
        <Btn className="mt-4 w-full" onClick={run} disabled={busy}>{busy ? T("Analysing…", "విశ్లేషిస్తోంది…") : T("Get my plan & cost", "ప్రణాళిక & ఖర్చు చూడండి")}</Btn>
      </Card>
      {err && <Notice tone="warn">{err}</Notice>}
      {out && (
        <Card>
          <Eyebrow>{T(`Plan for ${crop}`, `${crop} ప్రణాళిక`)}</Eyebrow>
          <div className="prose prose-sm mt-2 max-w-none text-foreground [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-1 [&_th]:border [&_th]:border-border [&_th]:p-1 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5">
            <ReactMarkdown>{out}</ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
}
