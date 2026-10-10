import { logQuestion } from "@/lib/ai-log";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, inputCls, Notice, PageHeader } from "@/components/kit";
import { useApp } from "@/lib/store";
import { farmContext } from "@/lib/context";
import { useWeather } from "@/lib/useWeather";
import { hasCoords } from "@/lib/location";
import { fileToDataUrl, speak, useSpeechInput } from "@/lib/voice";

export const Route = createFileRoute("/assistant")({
  head: () => seo("I Can Help You", "Ask the VERDIX assistant in Telugu or English, by voice, text or photo."),
  component: () => (<AppShell><Assistant /></AppShell>),
});

const HELP = [
  ["🌱", "Help me choose a crop", "పంట ఎంచుకోవడంలో సహాయం"], ["🧪", "Help me with fertilizer", "ఎరువుల గురించి సహాయం"],
  ["💧", "Help me with irrigation", "నీటి పారుదల సహాయం"], ["🐛", "Help me identify a pest", "పురుగును గుర్తించడం"],
  ["🦠", "Help me identify a disease", "తెగులును గుర్తించడం"], ["🌦️", "Help me understand the weather", "వాతావరణం అర్థం చేసుకోవడం"],
  ["💰", "Help me calculate expenses", "ఖర్చుల లెక్క"], ["📈", "Help me understand market information", "మార్కెట్ సమాచారం"],
];

type Msg = { role: "user" | "assistant"; content: string; image?: string };

function Assistant() {
  const { t, lang, user, activeFarm, plans } = useApp();
  const loc = hasCoords(activeFarm) ? activeFarm : hasCoords(user) ? user : null;
  const { w } = useWeather(loc ? { lat: loc.lat, lon: loc.lon } : null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [img, setImg] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const sendRef = useRef<(s: string) => void>(() => {});
  const mic = useSpeechInput(lang, (s, final) => { setText(s); if (final) sendRef.current(s); });

  const send = async (content: string) => {
    if (!content.trim() && !img) return;
    void logQuestion("assistant", content || "[photo]");
    const next: Msg[] = [...msgs, { role: "user", content, image: img }];
    setMsgs([...next, { role: "assistant", content: "" }]); setText(""); setImg(undefined); setBusy(true); setErr(undefined);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang, context: farmContext(user, activeFarm, plans.find((p) => p.farmId === activeFarm?.id), w) }) });
      if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || "Assistant unavailable");
      const reader = r.body.getReader(); const dec = new TextDecoder(); let acc = "";
      for (;;) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true });
        setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]); }
      if (!acc) throw new Error("No answer received. Please try again.");
    } catch (e) { setErr((e as Error).message); setMsgs((m) => m.slice(0, -1)); } finally { setBusy(false); }
  };
  sendRef.current = send;

  return (
    <div className="assistant-panel flex min-h-0 flex-col gap-3">
      <PageHeader emoji="🤝" title={t("canHelp")} sub={t("askLang")} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-3" aria-label="Chat messages" role="log">
      {msgs.length === 0 && (
        <div className="grid grid-cols-2 gap-2">
          {HELP.map(([e, en, te]) => (
            <button key={en} onClick={() => send(lang === "te" ? te : en)} className="glass p-3 text-left text-sm font-semibold">{e} {lang === "te" ? te : en}</button>
          ))}
          <button onClick={() => send("నా మామిడి చెట్లకు ఇప్పుడు ఏ జాగ్రత్తలు తీసుకోవాలి?")} className="glass font-te col-span-2 p-3 text-left text-sm font-semibold">🥭 నా మామిడి చెట్లకు ఇప్పుడు ఏ జాగ్రత్తలు తీసుకోవాలి?</button>
        </div>
      )}
      <div className="space-y-3">
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
            {m.image && <img src={m.image} alt="" className="mb-2 rounded-lg" />}{m.content}
          </div>
        ) : (
          <div key={i} className="glass p-4 text-[15px] leading-relaxed">
            {m.content ? <div className="prose prose-sm max-w-none [&_li]:my-0.5 [&_ul]:list-disc [&_ul]:pl-5"><ReactMarkdown>{m.content}</ReactMarkdown></div> : <span className="animate-pulse">🌱 …</span>}
            {m.content && !busy && <button onClick={() => speak(m.content, lang)} className="mt-2 text-sm font-semibold text-primary">🔊 {lang === "te" ? "వినండి" : "Listen"}</button>}
          </div>
        ))}
      </div>
      {err && <Notice>{err}</Notice>}
      </div>
      <div className="glass shrink-0 space-y-2 p-3">
        {img && <img src={img} alt="" className="h-16 rounded-lg" />}
        <div className="flex items-center gap-2">
          <label className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-secondary text-xl">🖼️<input type="file" accept="image/*" hidden onChange={async (e) => e.target.files?.[0] && setImg(await fileToDataUrl(e.target.files[0]))} /></label>
          <input className={`${inputCls} min-w-0`} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(text)} placeholder={lang === "te" ? "మీ ప్రశ్న…" : "Type your question…"} />
          <button aria-label="Microphone" onClick={() => (mic.listening ? mic.stop() : mic.start())} className={`grid size-12 shrink-0 place-items-center rounded-full text-xl ${mic.listening ? "animate-micpulse bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>🎤</button>
        </div>
        <Btn className="w-full" disabled={busy} onClick={() => send(text)}>{busy ? "…" : t("submit")}</Btn>
        {!mic.supported && <p className="text-xs text-muted-foreground">Voice input works best in Chrome.</p>}
      </div>
      <p className="text-center text-xs text-muted-foreground">{t("notGuaranteed")}</p>
    </div>
  );
}
