import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Eyebrow, Field, inputCls, Notice, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import type { GovApp } from "@/lib/store";
import { iso } from "@/lib/crops";
import { toast } from "sonner";
import { CATEGORIES, CONFIRM_NOTE, LISTED_ON, NEEDS, PORTALS, SERVICES, searchServices, type CatId, type Service } from "@/lib/meeseva";

export const Route = createFileRoute("/meeseva")({
  head: () => seo("Mini MeeSeva", "Find farmer government services, official portals, document checklists and track your applications."),
  component: () => (<AppShell><MiniMeeSeva /></AppShell>),
});

type Tab = "services" | "guide" | "apps" | "centres";

function MiniMeeSeva() {
  const T = useT();
  const [tab, setTab] = useState<Tab>("services");
  return (
    <div className="space-y-3">
      <PageHeader emoji="🏢" title={T("Mini MeeSeva", "మినీ మీసేవ")} sub={T("Farmer Government Services Hub · Andhra Pradesh", "రైతు ప్రభుత్వ సేవల కేంద్రం · ఆంధ్రప్రదేశ్")} />
      <Notice tone="info">{T(
        "VERDIX Mini MeeSeva is an independent service-discovery and assistance feature. Government applications, official records, approvals, and certificates are provided or verified by the relevant government authority.",
        "VERDIX మినీ మీసేవ ఒక స్వతంత్ర సేవా సమాచార సహాయం. ప్రభుత్వ దరఖాస్తులు, అధికారిక రికార్డులు, ఆమోదాలు, ధృవపత్రాలు సంబంధిత ప్రభుత్వ శాఖ మాత్రమే ఇస్తుంది లేదా ధృవీకరిస్తుంది.",
      )}</Notice>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Chip active={tab === "services"} onClick={() => setTab("services")}>📚 {T("Services", "సేవలు")}</Chip>
        <Chip active={tab === "guide"} onClick={() => setTab("guide")}>🧭 {T("Find the right service", "సరైన సేవ")}</Chip>
        <Chip active={tab === "apps"} onClick={() => setTab("apps")}>🗂️ {T("My applications", "నా దరఖాస్తులు")}</Chip>
        <Chip active={tab === "centres"} onClick={() => setTab("centres")}>📍 {T("Centres", "కేంద్రాలు")}</Chip>
      </div>
      {tab === "services" && <Services onTab={setTab} />}
      {tab === "guide" && <Guide />}
      {tab === "apps" && <Apps />}
      {tab === "centres" && <Centres />}
      <Card>
        <Eyebrow>🔗 {T("Official portals", "అధికారిక పోర్టల్స్")}</Eyebrow>
        <div className="mt-2 space-y-1.5">
          {Object.values(PORTALS).map((p) => (
            <a key={p.url} href={p.url} target="_blank" rel="noreferrer" className="block text-sm font-semibold text-primary">↗ {p.name}</a>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{T("Never share OTPs or portal passwords with anyone, including VERDIX.", "OTP లేదా పోర్టల్ పాస్‌వర్డ్ ఎవరికీ — VERDIX కు కూడా — చెప్పకండి.")}</p>
      </Card>
    </div>
  );
}

function Services({ onTab }: { onTab: (t: Tab) => void }) {
  const T = useT();
  const { tl, gov } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CatId | "saved" | null>(null);
  const list = useMemo(() => {
    let l = searchServices(q);
    if (cat === "saved") l = l.filter((s) => gov.saved.includes(s.id));
    else if (cat) l = l.filter((s) => s.cat === cat);
    return l;
  }, [q, cat, gov.saved]);
  const pickCat = (c: CatId) => {
    if (c === "tracking") return onTab("apps");
    if (c === "centres") return onTab("centres");
    if (c === "help") return onTab("guide");
    setCat(cat === c ? null : c);
  };
  return (
    <>
      <input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("Search any government service… (1-B, Adangal, FMB)", "ఏదైనా ప్రభుత్వ సేవ వెతకండి… (1-B, అడంగల్)")} aria-label="Search services" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => pickCat(c.id)} aria-pressed={cat === c.id} className={`glass flex flex-col items-center gap-1 p-3 text-center ${cat === c.id ? "ring-2 ring-primary" : ""}`}>
            <span className="text-2xl">{c.emoji}</span><span className="text-[11px] font-semibold leading-tight">{tl(c.name)}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Chip active={cat === null} onClick={() => setCat(null)}>{T("All", "అన్నీ")}</Chip>
        <Chip active={cat === "saved"} onClick={() => setCat("saved")}>⭐ {T("Saved", "సేవ్ చేసినవి")} ({gov.saved.length})</Chip>
      </div>
      {list.length === 0 && <Notice>{T("No matching service. Try another name, or open the official services portal.", "సరిపడే సేవ లేదు. వేరే పేరుతో ప్రయత్నించండి లేదా అధికారిక పోర్టల్ తెరవండి.")}</Notice>}
      {list.map((s) => <ServiceCard key={s.id} s={s} />)}
      <p className="text-center text-[11px] text-muted-foreground">{T(`Service list compiled ${LISTED_ON}. Details can change — always confirm on the official portal.`, `సేవల జాబితా ${LISTED_ON} న తయారైంది. వివరాలు మారవచ్చు — అధికారిక పోర్టల్‌లో నిర్ధారించండి.`)}</p>
    </>
  );
}

function ServiceCard({ s, open: initial = false }: { s: Service; open?: boolean }) {
  const T = useT();
  const { tl, gov, updateGov } = useApp();
  const [open, setOpen] = useState(initial);
  const [check, setCheck] = useState(false);
  const portal = PORTALS[s.portal];
  const saved = gov.saved.includes(s.id);
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => setOpen(!open)} className="text-left">
          <p className="text-base font-bold">{s.emoji} {tl(s.name)}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{tl(s.what)}</p>
        </button>
        <button aria-label={saved ? "Unsave" : "Save"} onClick={() => updateGov((g) => ({ ...g, saved: saved ? g.saved.filter((x) => x !== s.id) : [...g.saved, s.id] }))} className="text-xl">{saved ? "⭐" : "☆"}</button>
      </div>
      {open && (
        <div className="mt-3 space-y-1.5 text-sm">
          <p><b>{T("Who may need it", "ఎవరికి అవసరం")}:</b> {tl(s.who)}</p>
          <p><b>{T("Provided by", "అందించేది")}:</b> {s.provider}</p>
          <p><b>{T("How to apply", "దరఖాస్తు విధానం")}:</b> {tl(s.method)}</p>
          <p className="text-xs text-muted-foreground">{tl(CONFIRM_NOTE)}</p>
          {s.note && <Notice>{tl(s.note)}</Notice>}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn variant="soft" className="min-h-10 px-3 py-2 text-sm" onClick={() => setOpen(!open)}>{open ? T("Hide details", "దాచు") : T("View Service Details", "వివరాలు చూడండి")}</Btn>
        <Btn variant="ghost" className="min-h-10 px-3 py-2 text-sm" onClick={() => setCheck(!check)}>🧾 {T("Prepare Documents", "పత్రాలు సిద్ధం")}</Btn>
        <a href={portal.url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">↗ {T("Open Official Portal", "అధికారిక పోర్టల్")}</a>
      </div>
      {check && <Checklist s={s} />}
    </Card>
  );
}

function Checklist({ s }: { s: Service }) {
  const T = useT();
  const { tl, gov, updateGov } = useApp();
  const marks = gov.checklists[s.id] ?? {};
  const set = (k: string, v: "have" | "pending") => updateGov((g) => ({ ...g, checklists: { ...g.checklists, [s.id]: { ...(g.checklists[s.id] ?? {}), [k]: v } } }));
  const have = s.checklist.filter((c) => marks[c.en] === "have").length;
  return (
    <div className="mt-3 rounded-xl bg-background/60 p-3">
      <p className="text-sm font-bold">{T("Document checklist", "పత్రాల జాబితా")} · {have}/{s.checklist.length} {T("ready", "సిద్ధం")}</p>
      <p className="text-xs text-muted-foreground">{T("Commonly asked items — the office may ask for more or less. No uploads needed.", "సాధారణంగా అడిగేవి — కార్యాలయం ఎక్కువ/తక్కువ అడగవచ్చు. అప్‌లోడ్ అవసరం లేదు.")}</p>
      <ul className="mt-2 space-y-2">
        {s.checklist.map((c) => {
          const m = marks[c.en];
          return (
            <li key={c.en} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{m === "have" ? "✅" : m === "pending" ? "⏳" : "⬜"} {tl(c)}</span>
              <span className="flex gap-1">
                <Chip active={m === "have"} onClick={() => set(c.en, "have")}>{T("Have it", "ఉంది")}</Chip>
                <Chip active={m === "pending"} onClick={() => set(c.en, "pending")}>{T("Pending", "పెండింగ్")}</Chip>
              </span>
            </li>
          );
        })}
      </ul>
      <textarea className={`${inputCls} mt-2 min-h-16 text-sm`} placeholder={T("Personal reminder (e.g. get passbook copy from bank)", "వ్యక్తిగత గుర్తు")} value={gov.reminders[s.id] ?? ""} onChange={(e) => updateGov((g) => ({ ...g, reminders: { ...g.reminders, [s.id]: e.target.value.slice(0, 300) } }))} />
    </div>
  );
}

function Guide() {
  const T = useT();
  const { tl } = useApp();
  const [need, setNeed] = useState<string>();
  const [district, setDistrict] = useState("");
  const [hasNo, setHasNo] = useState<boolean>();
  const n = NEEDS.find((x) => x.id === need);
  const services = n ? SERVICES.filter((s) => n.services.includes(s.id)) : [];
  return (
    <>
      <Card>
        <Eyebrow>🧭 {T("Find the Right Government Service", "సరైన ప్రభుత్వ సేవను కనుగొనండి")}</Eyebrow>
        <p className="mt-3 text-sm font-semibold">1. {T("State", "రాష్ట్రం")}</p>
        <div className="mt-1.5 flex gap-1.5"><Chip active>Andhra Pradesh</Chip><span className="self-center text-xs text-muted-foreground">{T("More states coming", "మరిన్ని రాష్ట్రాలు త్వరలో")}</span></div>
        <div className="mt-3"><Field label={`2. ${T("District and mandal", "జిల్లా, మండలం")}`} optional><input className={inputCls} value={district} onChange={(e) => setDistrict(e.target.value.slice(0, 80))} placeholder={T("e.g. Chittoor, Punganur", "ఉదా. చిత్తూరు, పుంగనూరు")} /></Field></div>
        <p className="mt-3 text-sm font-semibold">3. {T("What do you need help with?", "మీకు ఏ సహాయం కావాలి?")}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">{NEEDS.map((x) => <Chip key={x.id} active={need === x.id} onClick={() => setNeed(x.id)}>{tl(x.label)}</Chip>)}</div>
        <p className="mt-3 text-sm font-semibold">4. {T("Do you already have an application number?", "మీ దగ్గర దరఖాస్తు నంబర్ ఉందా?")}</p>
        <div className="mt-1.5 flex gap-1.5"><Chip active={hasNo === true} onClick={() => setHasNo(true)}>{T("Yes", "అవును")}</Chip><Chip active={hasNo === false} onClick={() => setHasNo(false)}>{T("No", "లేదు")}</Chip></div>
      </Card>
      {hasNo && <Notice tone="ok">{T("Save it under 'My applications', then open the official portal to check its status.", "దాన్ని 'నా దరఖాస్తులు'లో సేవ్ చేసి, అధికారిక పోర్టల్‌లో స్థితి చూడండి.")}</Notice>}
      {n && (
        <>
          <p className="text-sm font-semibold">{T("Suggested services", "సూచించిన సేవలు")}{district && ` · ${district}`}</p>
          {services.map((s) => <ServiceCard key={s.id} s={s} open />)}
          <Notice>{T("Next step: prepare the documents above, then apply through the official portal or your nearest MeeSeva centre. VERDIX does not submit applications.", "తదుపరి: పై పత్రాలు సిద్ధం చేసి, అధికారిక పోర్టల్ లేదా సమీప మీసేవ కేంద్రం ద్వారా దరఖాస్తు చేయండి. VERDIX దరఖాస్తులు పంపదు.")}</Notice>
        </>
      )}
    </>
  );
}

const blank = { service: "", ref: "", date: "", portal: "meeseva", status: "", followUp: "", notes: "" };

function Apps() {
  const T = useT();
  const { gov, updateGov, addTask, activeFarm, tl } = useApp();
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<string>();
  const add = () => {
    if (!f.service.trim() || !f.ref.trim()) return setErr(T("Enter the service and reference number.", "సేవ, రిఫరెన్స్ నంబర్ నమోదు చేయండి."));
    if (!/^[A-Za-z0-9/\-]{3,40}$/.test(f.ref.trim())) return setErr(T("Reference number: 3–40 letters, digits, / or -.", "రిఫరెన్స్: 3–40 అక్షరాలు/అంకెలు."));
    const app: GovApp = { id: Math.random().toString(36).slice(2, 10), service: f.service.trim().slice(0, 80), ref: f.ref.trim(), date: f.date || undefined, portal: f.portal, status: f.status.trim().slice(0, 60) || undefined, statusSource: f.status.trim() ? "manual" : "unchecked", followUp: f.followUp || undefined, notes: f.notes.trim().slice(0, 300) || undefined, createdAt: new Date().toISOString() };
    updateGov((g) => ({ ...g, apps: [app, ...g.apps] }));
    setF(blank); setErr(undefined);
  };
  const remind = (a: GovApp) => {
    addTask({ farmId: activeFarm?.id ?? "", title: { en: `Follow up: ${a.service} (${a.ref})`, te: `ఫాలో అప్: ${a.service} (${a.ref})` }, type: "gov", date: a.followUp || iso(new Date()) });
    toast.success(T("Reminder added to your farm tasks", "పొలం పనుల్లో గుర్తు జోడించబడింది"));
  };
  return (
    <>
      <Card>
        <Eyebrow>🗂️ {T("My Government Applications", "నా ప్రభుత్వ దరఖాస్తులు")}</Eyebrow>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label={T("Service name", "సేవ పేరు")}><input list="svc" className={inputCls} value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} /><datalist id="svc">{SERVICES.map((s) => <option key={s.id} value={tl(s.name)} />)}</datalist></Field>
          <Field label={T("Application / transaction number", "దరఖాస్తు / లావాదేవీ నంబర్")}><input className={inputCls} value={f.ref} onChange={(e) => setF({ ...f, ref: e.target.value })} /></Field>
          <Field label={T("Application date", "దరఖాస్తు తేదీ")} optional><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label={T("Official portal", "అధికారిక పోర్టల్")}><select className={inputCls} value={f.portal} onChange={(e) => setF({ ...f, portal: e.target.value })}>{Object.entries(PORTALS).map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}</select></Field>
          <Field label={T("Status you saw on the portal", "పోర్టల్‌లో చూసిన స్థితి")} optional hint={T("Leave empty if not checked yet.", "ఇంకా చూడకపోతే ఖాళీగా ఉంచండి.")}><input className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} /></Field>
          <Field label={T("Next follow-up date", "తదుపరి ఫాలో-అప్ తేదీ")} optional><input type="date" className={inputCls} value={f.followUp} onChange={(e) => setF({ ...f, followUp: e.target.value })} /></Field>
        </div>
        <div className="mt-3"><Field label={T("Notes", "గమనికలు")} optional><textarea className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field></div>
        {err && <div className="mt-2"><Notice>{err}</Notice></div>}
        <Btn className="mt-3 w-full" onClick={add}>{T("Save application", "దరఖాస్తు సేవ్")}</Btn>
        <p className="mt-2 text-xs text-muted-foreground">{T("Saved privately in your account. Do not enter Aadhaar numbers, OTPs or passwords.", "మీ ఖాతాలో గోప్యంగా సేవ్. ఆధార్ నంబర్, OTP, పాస్‌వర్డ్ నమోదు చేయకండి.")}</p>
      </Card>
      {gov.apps.length === 0 && <Notice tone="info">{T("No applications saved yet.", "ఇంకా దరఖాస్తులు లేవు.")}</Notice>}
      {gov.apps.map((a) => {
        const p = PORTALS[(a.portal as keyof typeof PORTALS) in PORTALS ? (a.portal as keyof typeof PORTALS) : "meeseva"];
        return (
          <Card key={a.id}>
            <p className="font-bold">{a.service}</p>
            <p className="font-mono text-sm">#{a.ref}</p>
            <p className="mt-1 text-sm">
              {a.statusSource === "manual" && a.status
                ? <>📝 <b>{a.status}</b> <span className="text-xs text-muted-foreground">({T("entered by you — not verified by VERDIX", "మీరు నమోదు చేసింది — VERDIX ధృవీకరించలేదు")})</span></>
                : <>⚪ {T("Status not yet checked", "స్థితి ఇంకా చూడలేదు")}</>}
            </p>
            {a.date && <p className="text-xs text-muted-foreground">{T("Applied", "దరఖాస్తు")}: {a.date}</p>}
            {a.followUp && <p className="text-xs text-muted-foreground">{T("Follow up", "ఫాలో అప్")}: {a.followUp}</p>}
            {a.notes && <p className="mt-1 text-sm">{a.notes}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">↗ {T("Track Application", "స్థితి చూడండి")}</a>
              <StatusUpdate a={a} />
              <Btn variant="soft" className="min-h-10 px-3 py-2 text-sm" onClick={() => remind(a)}>📅 {T("Add to Planner", "ప్లానర్‌కు జోడించు")}</Btn>
              <Btn variant="ghost" className="min-h-10 px-3 py-2 text-sm" onClick={() => updateGov((g) => ({ ...g, apps: g.apps.filter((x) => x.id !== a.id) }))}>🗑️ {T("Remove", "తొలగించు")}</Btn>
            </div>
          </Card>
        );
      })}
      <p className="text-center text-xs text-muted-foreground"><Link to="/tasks" className="text-primary">{T("See reminders in Farm Tasks →", "పొలం పనుల్లో గుర్తులు →")}</Link></p>
    </>
  );
}

function StatusUpdate({ a }: { a: GovApp }) {
  const T = useT();
  const { updateGov } = useApp();
  const [v, setV] = useState("");
  const [open, setOpen] = useState(false);
  if (!open) return <Btn variant="ghost" className="min-h-10 px-3 py-2 text-sm" onClick={() => setOpen(true)}>✏️ {T("Record status", "స్థితి నమోదు")}</Btn>;
  return (
    <span className="flex w-full gap-2">
      <input className={`${inputCls} py-2 text-sm`} value={v} onChange={(e) => setV(e.target.value.slice(0, 60))} placeholder={T("Status as shown on portal", "పోర్టల్‌లో ఉన్న స్థితి")} />
      <Btn className="min-h-10 px-3 py-2 text-sm" onClick={() => { if (v.trim()) updateGov((g) => ({ ...g, apps: g.apps.map((x) => (x.id === a.id ? { ...x, status: v.trim(), statusSource: "manual" } : x)) })); setOpen(false); }}>{T("Save", "సేవ్")}</Btn>
    </span>
  );
}

function Centres() {
  const T = useT();
  const { user, activeFarm } = useApp();
  const loc = activeFarm?.lat != null ? activeFarm : user;
  const [area, setArea] = useState(loc?.location ?? "");
  const near = (what: string) => {
    const base = "https://www.google.com/maps/search/";
    if (loc?.lat != null && loc?.lon != null && !area.trim()) return `${base}${encodeURIComponent(what)}/@${loc.lat},${loc.lon},13z`;
    return `${base}${encodeURIComponent(`${what} ${area}`.trim())}`;
  };
  const kinds = [
    ["🏢", "MeeSeva centre", "మీసేవ కేంద్రం"], ["🏘️", "Grama Sachivalayam", "గ్రామ సచివాలయం"], ["🏛️", "Tahsildar office", "తహసీల్దార్ కార్యాలయం"],
    ["🌾", "Rythu Seva Kendra", "రైతు సేవా కేంద్రం"], ["🧑‍🌾", "Agriculture office", "వ్యవసాయ కార్యాలయం"],
  ] as const;
  return (
    <>
      <Card>
        <Eyebrow>📍 {T("Nearby Government Service Centres", "సమీప ప్రభుత్వ సేవా కేంద్రాలు")}</Eyebrow>
        <p className="mt-2 text-sm text-muted-foreground">{loc?.location ? T(`Using your saved location: ${loc.location}`, `మీ స్థానం: ${loc.location}`) : T("No saved location — type your district, mandal or village.", "స్థానం లేదు — జిల్లా, మండలం, గ్రామం టైప్ చేయండి.")}</p>
        <input className={`${inputCls} mt-2`} value={area} onChange={(e) => setArea(e.target.value.slice(0, 80))} placeholder={T("District, mandal or village", "జిల్లా, మండలం లేదా గ్రామం")} />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {kinds.map(([e, en, te]) => (
            <a key={en} href={near(en)} target="_blank" rel="noreferrer" className="glass flex flex-col items-center gap-1 p-3 text-center">
              <span className="text-2xl">{e}</span><span className="text-[11px] font-semibold">{T(en, te)}</span><span className="text-[10px] text-primary">{T("Open map →", "మ్యాప్ →")}</span>
            </a>
          ))}
        </div>
      </Card>
      <Notice>{T("Opens a map search. VERDIX does not have a verified office directory, so check the address, timings and services with the office or the official district website.", "మ్యాప్ వెతుకుతుంది. VERDIX వద్ద ధృవీకరించిన కార్యాలయ జాబితా లేదు — చిరునామా, సమయాలు కార్యాలయంతో లేదా అధికారిక జిల్లా వెబ్‌సైట్‌లో నిర్ధారించండి.")}</Notice>
      <a href="https://www.ap.gov.in/" target="_blank" rel="noreferrer" className="block text-center text-sm font-semibold text-primary">↗ {T("AP Government — district websites", "AP ప్రభుత్వం — జిల్లా వెబ్‌సైట్లు")}</a>
    </>
  );
}
