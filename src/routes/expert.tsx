import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Eyebrow, Field, inputCls, Notice, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { CROPS } from "@/lib/crops";
import ReactMarkdown from "react-markdown";
import { farmContext } from "@/lib/context";
import { speak } from "@/lib/voice";

export const Route = createFileRoute("/expert")({
  head: () => seo("Expert Help", "Send your crop problem with a photo to an agriculture expert and call helplines."),
  component: () => (
    <AppShell>
      <Expert />
    </AppShell>
  ),
});

function Expert() {
  const { activeFarm, user, expert, addExpert, tl, lang } = useApp();
  const T = useT();
  const [crop, setCrop] = useState(activeFarm?.crop ?? "mango");
  const [problem, setProblem] = useState("");
  const [image, setImage] = useState<string>();
  const [sent, setSent] = useState(false);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(String(r.result));
    r.readAsDataURL(f);
  };
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const submit = async () => {
    const cropName = CROPS.find((c) => c.id === crop)?.name.en ?? crop;
    const where = activeFarm?.location ?? user?.location ?? "";
    addExpert({ crop, problem, location: where, image });
    const content = `Crop: ${cropName}. Location: ${where || "unknown"}. Problem: ${problem}\nPlease give a likely cause and simple step-by-step solution.`;
    setProblem(""); setImage(undefined); setSent(true); setAnswer(""); setErr(undefined); setBusy(true);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content, image }], lang, context: farmContext(user, activeFarm) }) });
      if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || "AI unavailable");
      const reader = r.body.getReader(); const dec = new TextDecoder(); let acc = "";
      for (;;) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setAnswer(acc); }
      if (!acc) throw new Error("No answer received. Please try again.");
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <PageHeader emoji="👨‍🌾" title={T("Expert Help", "నిపుణుల సహాయం")} />
      <Card>
        <Eyebrow>📞 {T("Free helplines", "ఉచిత హెల్ప్‌లైన్లు")}</Eyebrow>
        <a href="tel:18001801551" className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 p-3">
          <span><b>Kisan Call Centre</b><span className="block text-xs text-muted-foreground">{T("6 AM – 10 PM, Telugu available", "ఉ.6 – రా.10, తెలుగులో")}</span></span>
          <span className="font-mono font-bold text-primary">1800-180-1551</span>
        </a>
      </Card>
      <Card delay={60}>
        <Eyebrow>{T("Send your problem", "మీ సమస్య పంపండి")}</Eyebrow>
        <div className="mt-3 space-y-3">
          <Field label={T("Crop", "పంట")}>
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputCls}>
              {CROPS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {tl(c.name)}</option>)}
            </select>
          </Field>
          <Field label={T("Describe the problem", "సమస్య వివరించండి")}>
            <textarea rows={4} value={problem} onChange={(e) => setProblem(e.target.value)} className={inputCls} placeholder={T("e.g. Leaves have black spots since last week", "ఉదా: గత వారం నుండి ఆకులపై నల్ల మచ్చలు")} />
          </Field>
          <Field label={T("Photo", "ఫోటో")} optional>
            <input type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} className="text-sm" />
          </Field>
          {image && <img src={image} alt="problem" className="h-32 w-full rounded-xl object-cover" />}
          <Btn onClick={submit} disabled={busy || problem.trim().length < 5} className="w-full">📨 {busy ? T("Getting AI solution…", "AI పరిష్కారం వస్తోంది…") : T("Send to expert", "నిపుణుడికి పంపండి")}</Btn>
          {sent && (busy || answer) && (
            <div className="glass p-4 text-[15px] leading-relaxed">
              <p className="mb-2 text-xs font-semibold text-primary">🤖 {T("VERDIX AI solution", "VERDIX AI పరిష్కారం")}</p>
              {answer ? <div className="prose prose-sm max-w-none [&_li]:my-0.5 [&_ul]:list-disc [&_ul]:pl-5"><ReactMarkdown>{answer}</ReactMarkdown></div> : <span className="animate-pulse">🌱 …</span>}
              {answer && !busy && <button onClick={() => speak(answer, lang)} className="mt-2 text-sm font-semibold text-primary">🔊 {lang === "te" ? "వినండి" : "Listen"}</button>}
            </div>
          )}
          {err && <Notice>{err}</Notice>}
          {sent && <p className="text-xs text-muted-foreground">{T("AI advice is not guaranteed. For serious problems call the Kisan Call Centre above.", "AI సలహా హామీ కాదు. తీవ్ర సమస్యలకు పై కిసాన్ కాల్ సెంటర్‌కు కాల్ చేయండి.")}</p>}
        </div>
      </Card>
      {expert.length > 0 && (
        <Card delay={120}>
          <Eyebrow>{T("My requests", "నా అభ్యర్థనలు")}</Eyebrow>
          <div className="mt-2 divide-y divide-border">
            {expert.map((r) => (
              <div key={r.id} className="py-2.5 text-sm">
                <p className="font-semibold">{r.crop} · <span className="text-xs text-primary">{T("Submitted", "పంపబడింది")}</span></p>
                <p className="text-muted-foreground">{r.problem}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(r.date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
