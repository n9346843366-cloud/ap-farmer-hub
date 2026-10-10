import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Eyebrow, Notice, PageHeader, Progress, inputCls } from "@/components/kit";
import { CROPS, getCrop } from "@/lib/crops";
import { useApp, type Scan, type ScanResult } from "@/lib/store";
import { ACCEPTED, DEMO_CONDITIONS, MAX_BYTES, analyzeCrop, compressImage, type DemoCondition } from "@/lib/scan-analysis";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scan")({
  head: () => seo("Crop Doctor", "Upload a leaf photo to find the problem and get fertiliser and spray advice."),
  component: () => (<AppShell><ScanPage /></AppShell>),
});

type Step = "pick" | "camera" | "preview" | "analysing" | "result";

function ScanPage() {
  const { lang, activeFarm, plans, scans, addScan, updateScan, removeScan } = useApp();
  const T = (en: string, te: string) => (lang === "te" ? te : en);
  const planForFarm = plans.find((p) => p.farmId === activeFarm?.id) ?? plans[0];
  const contextCrop = activeFarm?.crop || planForFarm?.crop;
  const [crop, setCrop] = useState<string | undefined>(contextCrop);
  useEffect(() => { if (!crop && contextCrop) setCrop(contextCrop); }, [contextCrop, crop]);
  const cropObj = crop ? getCrop(crop) : undefined;
  const cropName = cropObj ? cropObj.name[lang] : crop;

  const [step, setStep] = useState<Step>("pick");
  const [source, setSource] = useState<"camera" | "gallery">();
  const [img, setImg] = useState<string>();
  const [err, setErr] = useState<string>();
  const [res, setRes] = useState<ScanResult>();
  const [saved, setSaved] = useState<Scan>();
  const [notes, setNotes] = useState("");
  const [provider, setProvider] = useState<"demo" | "ai">("ai");
  const [demo, setDemo] = useState<DemoCondition | "auto">("leafspot");
  const [progress, setProgress] = useState(0);
  const camInput = useRef<HTMLInputElement>(null);
  const galInput = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);

  const stopCam = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; };
  useEffect(() => stopCam, []);

  const reset = () => { stopCam(); setImg(undefined); setRes(undefined); setSaved(undefined); setErr(undefined); setNotes(""); setStep("pick"); };

  const handleFile = async (file: File | undefined, from: "camera" | "gallery") => {
    setErr(undefined);
    if (!file) { setErr(T("No image selected. Please choose a photo.", "చిత్రం ఎంచుకోలేదు. దయచేసి ఫోటో ఎంచుకోండి.")); return; }
    if (!ACCEPTED.includes(file.type.toLowerCase())) { setErr(T("This file type is not supported. Please use a JPG, PNG or WebP photo.", "ఈ ఫైల్ రకం సరిపోదు. JPG, PNG లేదా WebP ఫోటో వాడండి.")); return; }
    if (file.size > MAX_BYTES) { setErr(T("This photo is too large (over 10 MB). Please choose a smaller photo.", "ఫోటో చాలా పెద్దది (10 MB పైగా). చిన్న ఫోటో ఎంచుకోండి.")); return; }
    try {
      setImg(await compressImage(file)); setSource(from); setRes(undefined); setStep("preview");
    } catch {
      setErr(T("We couldn't open this photo. Please try another one.", "ఈ ఫోటో తెరవలేకపోయాం. మరొకటి ప్రయత్నించండి."));
    }
  };

  const openCamera = async () => {
    setErr(undefined);
    if (!navigator.mediaDevices?.getUserMedia) { camInput.current?.click(); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      stream.current = s; setStep("camera");
      requestAnimationFrame(() => { if (video.current) { video.current.srcObject = s; video.current.play().catch(() => {}); } });
    } catch (e) {
      const name = (e as DOMException).name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setErr(T("Camera permission was denied. Allow camera access in your browser settings, or use Upload image.", "కెమెరా అనుమతి నిరాకరించబడింది. బ్రౌజర్ సెట్టింగ్‌లలో అనుమతించండి లేదా అప్‌లోడ్ వాడండి."));
      } else {
        camInput.current?.click(); // no live camera — fall back to the phone's camera app
      }
    }
  };

  const capture = async () => {
    const v = video.current; if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    stopCam();
    setImg(await compressImage(c.toDataURL("image/jpeg", 0.9))); setSource("camera"); setStep("preview");
  };

  const openGallery = () => { setErr(undefined); galInput.current?.click(); };

  const analyse = async () => {
    if (!img) { setErr(T("No image selected. Please take or upload a photo first.", "చిత్రం లేదు. ముందుగా ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి.")); return; }
    if (!crop) { setErr(T("Please tell us which crop you are scanning.", "మీరు ఏ పంటను స్కాన్ చేస్తున్నారో ఎంచుకోండి.")); return; }
    setErr(undefined); setStep("analysing"); setProgress(5);
    const timer = setInterval(() => setProgress((p) => Math.min(92, p + 7)), 180);
    try {
      const r = await analyzeCrop({ image: img, crop: cropObj?.name.en ?? crop, lang, provider, demoCondition: demo });
      setProgress(100);
      if (r.source === "ai" && r.cropMatches === false) {
        setErr(T(`This photo doesn't look like ${cropName} (looks like: ${r.detectedPlant || "something else"}). Please upload a correct image of your ${cropName} leaf, or choose the right crop.`, `ఈ ఫోటో ${cropName} లా లేదు (${r.detectedPlant || "వేరేది"} లా ఉంది). దయచేసి సరైన ${cropName} ఆకు ఫోటో అప్‌లోడ్ చేయండి.`));
        setStep("preview"); return;
      }
      setRes(r);
      const thumbImg = await compressImage(img, 320, 0.7).catch(() => undefined);
      setSaved(addScan({ crop, image: thumbImg, farmId: activeFarm?.id, farmName: activeFarm?.name, notes: "", result: r }));
      setStep("result");
    } catch (e) {
      setErr(T("Analysis failed: ", "విశ్లేషణ విఫలమైంది: ") + ((e as Error).message || "") + T(" Please try again.", " మళ్ళీ ప్రయత్నించండి."));
      setStep("preview");
    } finally { clearInterval(timer); }
  };

  const riskCls = (r?: string) => r === "high" ? "bg-destructive/15 text-destructive" : r === "medium" ? "bg-accent/25 text-accent-foreground" : "bg-primary/15 text-primary";
  const riskTxt = (r?: string) => r === "high" ? T("High", "ఎక్కువ") : r === "medium" ? T("Medium", "మధ్యస్థం") : T("Low", "తక్కువ");

  return (
    <div className="space-y-3">
      <PageHeader emoji="🩺" title={T("Crop Doctor", "పంట డాక్టర్")} back={false} sub={T("Take a clear photo of an affected leaf", "దెబ్బతిన్న ఆకు స్పష్టమైన ఫోటో తీయండి")} />

      <input ref={camInput} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={(e) => { handleFile(e.target.files?.[0], "camera"); e.target.value = ""; }} />
      <input ref={galInput} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" hidden onChange={(e) => { handleFile(e.target.files?.[0], "gallery"); e.target.value = ""; }} />

      {/* Crop context */}
      <Card>
        {contextCrop && crop === contextCrop ? (
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="eyebrow">{T("Scanning for", "స్కాన్ చేస్తున్న పంట")}</p>
              <p className="text-lg font-bold">{cropObj?.emoji ?? "🌿"} {cropName}</p>
              <p className="text-xs text-muted-foreground">
                {activeFarm ? `${activeFarm.name} · 📍 ${activeFarm.location.split(",")[0]}` : ""}
                {activeFarm?.treeAge !== undefined ? ` · ${activeFarm.treeAge} ${T("yrs", "సం.")}` : ""}
              </p>
            </div>
            <button className="text-sm font-semibold text-primary" onClick={() => setCrop(undefined)}>{T("Change", "మార్చు")}</button>
          </div>
        ) : (
          <div>
            <p className="mb-2 font-bold">🌱 {T("What crop are you scanning?", "మీరు ఏ పంటను స్కాన్ చేస్తున్నారు?")}</p>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((c) => <Chip key={c.id} active={crop === c.id} onClick={() => setCrop(c.id)}>{c.emoji} {c.name[lang]}</Chip>)}
            </div>
          </div>
        )}
      </Card>

      {step === "pick" && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={openCamera} className="glass flex min-h-28 flex-col items-center justify-center gap-1 p-5 font-semibold active:scale-[0.98]"><span className="text-3xl">📷</span>{T("Take Photo", "ఫోటో తీయండి")}</button>
          <button onClick={openGallery} className="glass flex min-h-28 flex-col items-center justify-center gap-1 p-5 font-semibold active:scale-[0.98]"><span className="text-3xl">🖼️</span>{T("Upload Image", "అప్‌లోడ్")}</button>
          <p className="col-span-2 text-center text-xs text-muted-foreground">JPG · JPEG · PNG · WebP · {T("max 10 MB", "గరిష్ఠం 10 MB")}</p>
        </div>
      )}

      {step === "camera" && (
        <Card className="space-y-3">
          <video ref={video} playsInline muted className="aspect-[3/4] w-full rounded-2xl bg-muted object-cover" />
          <p className="text-center text-sm text-muted-foreground">{T("Fill the frame with one leaf, in good light", "మంచి వెలుతురులో ఒక ఆకు ఫ్రేమ్ నిండేలా ఉంచండి")}</p>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="ghost" onClick={reset}>✕ {T("Cancel", "రద్దు")}</Btn>
            <Btn onClick={capture}>📸 {T("Capture", "క్లిక్")}</Btn>
          </div>
        </Card>
      )}

      {(step === "preview" || step === "analysing") && img && (
        <Card className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={img} alt={T("Selected crop leaf", "ఎంచుకున్న ఆకు")} className="max-h-80 w-full object-cover" />
            {step === "analysing" && <div className="absolute inset-x-0 h-1 animate-pulse bg-primary shadow-[0_0_20px] shadow-primary" style={{ top: `${progress}%`, transition: "top .2s" }} />}
          </div>

          {step === "analysing" ? (
            <div className="space-y-2 py-2 text-center" role="status" aria-live="polite">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="font-bold">{cropName ? T(`Analyzing ${cropName} leaf...`, `${cropName} ఆకు విశ్లేషిస్తోంది...`) : T("Analyzing your crop...", "మీ పంటను విశ్లేషిస్తోంది...")}</p>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">{T("Checking colour, spots and leaf shape", "రంగు, మచ్చలు, ఆకు ఆకారం పరిశీలిస్తోంది")}</p>
            </div>
          ) : (
            <>
              <details className="rounded-xl bg-background/60 p-3 text-sm">
                <summary className="cursor-pointer font-semibold">⚙️ {T("Analysis mode", "విశ్లేషణ విధానం")}: {provider === "demo" ? T("Demo (prototype)", "డెమో (ప్రోటోటైప్)") : T("Live AI", "లైవ్ AI")}</summary>
                <div className="mt-3 space-y-3">
                  <div className="flex gap-2">
                    <Chip active={provider === "demo"} onClick={() => setProvider("demo")}>🧪 {T("Demo", "డెమో")}</Chip>
                    <Chip active={provider === "ai"} onClick={() => setProvider("ai")}>🤖 {T("Live AI", "లైవ్ AI")}</Chip>
                  </div>
                  {provider === "demo" ? (
                    <div>
                      <p className="mb-1.5 text-xs text-muted-foreground">{T("Pick the demo result to show (predictable for presentations):", "చూపించాల్సిన డెమో ఫలితం ఎంచుకోండి:")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Chip active={demo === "auto"} onClick={() => setDemo("auto")}>🔁 {T("Auto (same photo = same result)", "ఆటో")}</Chip>
                        {(Object.keys(DEMO_CONDITIONS) as DemoCondition[]).map((k) => (
                          <Chip key={k} active={demo === k} onClick={() => setDemo(k)}>{DEMO_CONDITIONS[k].emoji} {DEMO_CONDITIONS[k].label[lang]}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{T("Sends the photo to a real AI vision model. Needs internet.", "ఫోటోను నిజమైన AI మోడల్‌కు పంపుతుంది. ఇంటర్నెట్ అవసరం.")}</p>
                  )}
                </div>
              </details>
              <Btn className="w-full" onClick={analyse}>🔍 {T("Analyze Crop", "పంట విశ్లేషించు")}</Btn>
              <div className="grid grid-cols-2 gap-2">
                {source === "camera"
                  ? <Btn variant="ghost" onClick={openCamera}>🔄 {T("Retake", "మళ్ళీ తీయి")}</Btn>
                  : <Btn variant="ghost" onClick={openGallery}>🖼️ {T("Change Image", "చిత్రం మార్చు")}</Btn>}
                <Btn variant="ghost" onClick={reset}>✕ {T("Cancel", "రద్దు")}</Btn>
              </div>
            </>
          )}
        </Card>
      )}

      {err && <Notice>{err}</Notice>}

      {step === "result" && res && (
        <>
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <Eyebrow>🌿 {T("Crop Health Result", "పంట ఆరోగ్య ఫలితం")}</Eyebrow>
              <span className="rounded-md bg-accent/20 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-accent-foreground">
                {res.source === "ai" ? T("AI · initial", "AI · ప్రాథమిక") : T("Demo result", "డెమో ఫలితం")}
              </span>
            </div>
            {img && <img src={img} alt="" className="h-40 w-full rounded-xl object-cover" />}
            <div className="grid grid-cols-2 gap-2">
              <Info label={T("Crop", "పంట")} value={`${cropObj?.emoji ?? "🌿"} ${cropName ?? "—"}`} />
              <Info label={T("Risk level", "ప్రమాద స్థాయి")} value={<span className={cn("rounded-md px-2 py-0.5 text-sm", riskCls(res.risk))}>{riskTxt(res.risk)}</span>} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{T("Possible issue", "సాధ్యమైన సమస్య")}</p>
              <p className="text-2xl font-extrabold leading-tight">{res.healthy ? "✅" : "🦠"} {res.issue}</p>
            </div>
            <div><p className="mb-1 text-sm">{T("Confidence", "నమ్మకం")}: <b>{res.confidence}%</b></p><Progress value={res.confidence} /></div>
            <Section icon="👀" title={T("Symptoms", "లక్షణాలు")} text={res.symptoms} />
            <Section icon="🔎" title={T("Possible causes", "సాధ్యమైన కారణాలు")} text={res.causes} />
            <Section icon="🛡️" title={T("Recommended immediate actions", "వెంటనే చేయాల్సినవి")} text={res.precautions} />
            <Section icon="📋" title={T("What to monitor", "ఏమి గమనించాలి")} text={res.monitor ?? res.nextSteps} />
            {!!res.fertilizers?.length && <ListBlock icon="🧪" title={T("Fertiliser to apply", "వేయాల్సిన ఎరువులు")} items={res.fertilizers} />}
            {!!res.medicines?.length && <ListBlock icon="💊" title={T("Medicine to spray", "పిచికారీ చేయాల్సిన మందు")} items={res.medicines} />}
            {!!res.organic?.length && <ListBlock icon="🌿" title={T("Organic / low-cost option", "సేంద్రియ / తక్కువ ఖర్చు")} items={res.organic} />}
            <div className={cn("rounded-xl p-3", res.risk === "high" ? "bg-destructive/10" : "bg-info/10")}>
              <p className="text-sm font-bold">👨‍🌾 {T("When to seek expert help", "నిపుణుడిని ఎప్పుడు సంప్రదించాలి")}</p>
              <p className="mt-0.5 text-sm">{res.expertWhen}</p>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">📝 {T("Notes (saved with this scan)", "గమనికలు")}</span>
              <textarea className={inputCls} rows={2} value={notes} placeholder={T("e.g. Seen on 3 trees near borewell", "ఉదా: బోరు దగ్గర 3 చెట్లలో")}
                onChange={(e) => { setNotes(e.target.value); if (saved) updateScan(saved.id, { notes: e.target.value }); }} />
            </label>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Btn variant="soft" onClick={reset}>🔄 {T("Scan Another", "మరొకటి స్కాన్")}</Btn>
            <Link to="/expert" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 text-[15px] font-semibold text-primary-foreground">🤝 {T("Get Expert Help", "నిపుణుడి సహాయం")}</Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {planForFarm
              ? <ActionLink to="/plan/$planId" params={{ planId: planForFarm.id }} label={`🌱 ${T("View Crop Plan", "పంట ప్రణాళిక")}`} />
              : <ActionLink to="/plant" label={`🌱 ${T("Create Crop Plan", "ప్రణాళిక తయారు")}`} />}
            <ActionLink to="/fertilizer" label={`🧪 ${T("Fertilizer Guidance", "ఎరువుల సలహా")}`} />
            <ActionLink to="/irrigation" label={`💧 ${T("Irrigation Guidance", "నీటి సలహా")}`} />
            <ActionLink to="/pests" label={`🐛 ${T("Pest Information", "పురుగుల సమాచారం")}`} />
          </div>
        </>
      )}

      {/* Safety */}
      <div className="flex gap-3 rounded-2xl border-l-4 border-accent bg-accent/10 p-4">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="text-sm font-bold">{T("Initial indication only", "ప్రాథమిక సూచన మాత్రమే")}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            {T("AI analysis provides an initial indication and is not a guaranteed diagnosis. Confirm serious crop problems with a qualified agricultural expert or local agricultural authority.",
               "AI విశ్లేషణ ప్రాథమిక సూచన మాత్రమే, ఖచ్చితమైన నిర్ధారణ కాదు. తీవ్రమైన పంట సమస్యలను అర్హత కలిగిన వ్యవసాయ నిపుణుడు లేదా స్థానిక వ్యవసాయ అధికారితో నిర్ధారించుకోండి.")}
          </p>
        </div>
      </div>

      {/* History */}
      <Card>
        <Eyebrow right={<span className="text-xs text-muted-foreground">{scans.length}</span>}>🕘 {T("Scan History", "స్కాన్ చరిత్ర")}</Eyebrow>
        {scans.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{T("No scans yet. Your past scans will appear here.", "ఇంకా స్కాన్‌లు లేవు.")}</p>
        ) : (
          <ol className="mt-3 space-y-3 border-l-2 border-border pl-4">
            {scans.map((s) => {
              const c = s.crop ? getCrop(s.crop) : undefined;
              return (
                <li key={s.id} className="relative">
                  <span className={cn("absolute -left-[23px] top-3 h-3 w-3 rounded-full ring-2 ring-background", s.result.risk === "high" ? "bg-destructive" : s.result.healthy ? "bg-primary" : "bg-accent")} />
                  <div className="flex gap-3 rounded-xl bg-background/60 p-2.5">
                    {s.image ? <img src={s.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-muted text-2xl">🌿</div>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{s.result.issue}</p>
                      <p className="text-xs text-muted-foreground">{c?.emoji} {c?.name[lang] ?? s.crop ?? "—"} · {s.result.confidence}% · {riskTxt(s.result.risk)}{s.result.source === "demo" ? ` · ${T("demo", "డెమో")}` : ""}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.date).toLocaleString(lang === "te" ? "te-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" })}{s.farmName ? ` · ${s.farmName}` : ""}</p>
                      {s.notes && <p className="mt-1 text-xs italic">📝 {s.notes}</p>}
                    </div>
                    <button aria-label={T("Delete scan", "తొలగించు")} className="self-start text-muted-foreground" onClick={() => removeScan(s.id)}>✕</button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl bg-background/60 p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-0.5 font-bold">{value}</p></div>;
}
function Section({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div><p className="text-sm font-bold">{icon} {title}</p><p className="mt-0.5 text-sm text-muted-foreground">{text}</p></div>;
}
function ActionLink({ to, params, label }: { to: string; params?: Record<string, string>; label: string }) {
  return <Link to={to} params={params as never} className="glass flex min-h-12 items-center justify-center p-3 text-center text-sm font-semibold active:scale-[0.98]">{label}</Link>;
}

function ListBlock({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-sm font-semibold">{icon} {title}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}
