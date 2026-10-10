// Client-side data layer. Mirrors the tables in docs/schema.sql so it can be swapped
// for a cloud database later without touching screens.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, generateTasks, getCrop, iso, tr, type L, type Lang, type PlanInputs, type Soil, type Water } from "./crops";
import { translate, type DictKey } from "./i18n";
import type { LocSource } from "./location";
import { broadcastVerified } from "./verify-sync";

export type User = { name: string; email?: string; mobile: string; location: string; language: Lang; password?: string; lat?: number; lon?: number; locationSource?: LocSource; locationUpdatedAt?: string };
export type Farm = {
  id: string; name: string; location: string; area?: number; soil?: Soil; waterSource?: string; water?: Water;
  crop?: string; variety?: string; plantingDate?: string; treeAge?: number;
  soilTest?: { n?: number; p?: number; k?: number; ph?: number };
  lat?: number; lon?: number; locationSource?: LocSource; locationUpdatedAt?: string;
};
export type CropPlan = { id: string; farmId: string; crop: string; customName?: string; inputs: PlanInputs; createdAt: string };
export type Task = { id: string; farmId: string; planId?: string; title: L; type: string; date: string; done: boolean };
export type Scan = { id: string; date: string; crop?: string; image?: string; farmId?: string; farmName?: string; notes?: string; result: ScanResult };
export type ScanResult = {
  issue: string; confidence: number; symptoms: string; causes: string; precautions: string; nextSteps: string; healthy?: boolean;
  risk?: "low" | "medium" | "high"; monitor?: string; expertWhen?: string; source?: "demo" | "ai";
  detectedPlant?: string; cropMatches?: boolean; fertilizers?: string[]; medicines?: string[]; organic?: string[];
};
export type ExpertRequest = { id: string; date: string; crop: string; problem: string; location: string; image?: string; status: "submitted" };
export type Notice = { id: string; type: string; emoji: string; title: L; body: L; date: string; read: boolean };
export type Finance = { items: Record<string, number>; yieldQty: number; price: number; unit: string };
export type LedgerEntry = { id: string; date: string; kind: "expense" | "income"; category: string; amount: number; note?: string };

export type GovApp = { id: string; serviceId?: string; service: string; ref: string; date?: string; portal?: string; status?: string; statusSource: "manual" | "unchecked"; followUp?: string; notes?: string; createdAt: string };
export type Gov = { saved: string[]; checklists: Record<string, Record<string, "have" | "pending">>; reminders: Record<string, string>; apps: GovApp[] };
const emptyGov: Gov = { saved: [], checklists: {}, reminders: {}, apps: [] };

type State = {
  user: User | null; lang: Lang; farms: Farm[]; activeFarmId?: string; plans: CropPlan[]; tasks: Task[];
  scans: Scan[]; expert: ExpertRequest[]; notices: Notice[]; finance: Finance; ledger: LedgerEntry[]; gov?: Gov;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const empty: State = {
  user: null, lang: "en", farms: [], plans: [], tasks: [], scans: [], expert: [], notices: [],
  finance: { items: {}, yieldQty: 0, price: 0, unit: "kg" }, ledger: [],
};
const LANG_KEY = "verdix:lang";

function tasksFor(plan: CropPlan): Task[] {
  const crop = getCrop(plan.crop);
  if (!crop) return [
    { id: uid(), farmId: plan.farmId, planId: plan.id, title: { en: "Check soil moisture", te: "నేల తేమ పరిశీలించండి" }, type: "irrigation", date: iso(new Date()), done: false },
    { id: uid(), farmId: plan.farmId, planId: plan.id, title: { en: "Inspect crop for pests", te: "పంటలో పురుగుల పరిశీలన" }, type: "pest", date: iso(new Date()), done: false },
  ];
  return generateTasks(crop, plan.inputs).map((s) => ({
    id: uid(), farmId: plan.farmId, planId: plan.id, title: s.title, type: s.type, date: iso(addDays(new Date(), s.offsetDays)), done: false,
  }));
}

function demoNotices(): Notice[] {
  const d = iso(new Date());
  return [
    { id: uid(), type: "weather", emoji: "🌧️", title: { en: "Rain possible in 2 days (demo)", te: "2 రోజుల్లో వర్షం అవకాశం (డెమో)" }, body: { en: "Delay irrigation if rain arrives.", te: "వర్షం పడితే నీరు పెట్టడం వాయిదా వేయండి." }, date: d, read: false },
    { id: uid(), type: "irrigation", emoji: "💧", title: { en: "Irrigation check due", te: "నీటి పరిశీలన సమయం" }, body: { en: "Soil moisture 34% — needs monitoring.", te: "నేల తేమ 34% — గమనించాలి." }, date: d, read: false },
    { id: uid(), type: "pest", emoji: "🐛", title: { en: "Mango hopper watch", te: "తేనె మంచు పురుగు జాగ్రత్త" }, body: { en: "Pre-flowering season: inspect new shoots weekly.", te: "పూతకు ముందు: కొత్త చిగుళ్ళు వారానికోసారి చూడండి." }, date: d, read: false },
    { id: uid(), type: "fertilizer", emoji: "🧪", title: { en: "Nutrition reminder", te: "ఎరువుల గుర్తు" }, body: { en: "Review your soil test before next dose.", te: "తదుపరి ఎరువుకు ముందు నేల పరీక్ష చూడండి." }, date: d, read: true },
    { id: uid(), type: "plantation", emoji: "🥭", title: { en: "Plantation activity", te: "తోట పని" }, body: { en: "Clean tree basins and remove dead wood.", te: "పాదులు శుభ్రం చేసి ఎండు కొమ్మలు తొలగించండి." }, date: d, read: true },
    { id: uid(), type: "harvest", emoji: "🌾", title: { en: "Harvest outlook", te: "కోత అంచనా" }, body: { en: "Expected mango harvest: Apr–Jun.", te: "మామిడి కోత అంచనా: ఏప్రిల్–జూన్." }, date: d, read: true },
  ];
}

export function buildDemoState(lang: Lang = "en"): State {
  const now = new Date().toISOString();
  const farm: Farm = {
    id: "farm-1", name: "Farm 1", location: "Tirupati, Andhra Pradesh", area: 2, soil: "red", waterSource: "Borewell", water: "medium",
    crop: "mango", variety: "Banganapalli", treeAge: 4, plantingDate: "2022-08-01", soilTest: { n: 240, p: 14, k: 190, ph: 6.8 },
    lat: 13.629, lon: 79.419, locationSource: "manual", locationUpdatedAt: now,
  };
  const plan: CropPlan = { id: "plan-1", farmId: farm.id, crop: "mango", inputs: { location: farm.location, area: 2, soil: "red", water: "medium", treeAge: 4, variety: "Banganapalli", soilTest: farm.soilTest }, createdAt: new Date().toISOString() };
  const tasks = tasksFor(plan);
  if (tasks[0]) tasks[0].done = true;
  return {
    ...empty, lang,
    user: { name: "Ravi Kumar", mobile: "98765 43210", location: "Tirupati, Andhra Pradesh", language: lang, lat: 13.629, lon: 79.419, locationSource: "manual", locationUpdatedAt: now },
    farms: [farm], activeFarmId: farm.id, plans: [plan], tasks, notices: demoNotices(),
    finance: { items: { seeds: 8000, fertilizer: 14000, protection: 6000, labour: 22000, irrigation: 7000, machinery: 5000, transport: 6000, other: 2000 }, yieldQty: 6000, price: 30, unit: "kg" },
  };
}

type Ctx = State & {
  hydrated: boolean;
  t: (k: DictKey) => string;
  tl: (l: L | string) => string;
  setLang: (l: Lang) => void;
  login: (u: User) => void;
  loginDemo: () => void;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
  addFarm: (f: Omit<Farm, "id">) => Farm;
  updateFarm: (id: string, f: Partial<Farm>) => void;
  setActiveFarm: (id: string) => void;
  activeFarm?: Farm;
  addPlan: (p: Omit<CropPlan, "id" | "createdAt">) => CropPlan;
  toggleTask: (id: string) => void;
  addTask: (t: Omit<Task, "id" | "done">) => void;
  removeTask: (id: string) => void;
  addScan: (s: Omit<Scan, "id" | "date">) => Scan;
  updateScan: (id: string, s: Partial<Scan>) => void;
  removeScan: (id: string) => void;
  addExpert: (r: Omit<ExpertRequest, "id" | "date" | "status">) => void;
  markNotice: (id: string) => void;
  markAllNotices: () => void;
  setFinance: (f: Finance) => void;
  addLedger: (e: Omit<LedgerEntry, "id">) => void;
  removeLedger: (id: string) => void;
  userId: string | null;
};

// Keep one context instance across hot reloads so provider and consumers always match.
const g = globalThis as unknown as { __agriCtx?: React.Context<Ctx | null> };
const AppCtx = g.__agriCtx ?? (g.__agriCtx = createContext<Ctx | null>(null));

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(empty);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const loadedFor = useRef<string | null>(null);

  // Each signed-in account loads and saves only its own data in Lovable Cloud.
  useEffect(() => {
    let cancelled = false;
    try { const l = localStorage.getItem(LANG_KEY); if (l === "en" || l === "te") setS((p) => ({ ...p, lang: l })); } catch { /* ignore */ }
    const apply = async (session: { user: { id: string; email?: string; user_metadata: Record<string, unknown> } } | null) => {
      if (!session) {
        loadedFor.current = null; setUserId(null);
        setS((p) => ({ ...empty, lang: p.lang })); setHydrated(true); return;
      }
      const id = session.user.id;
      if (loadedFor.current === id) return;
      const { data } = await supabase.from("user_state").select("data").eq("user_id", id).maybeSingle();
      if (cancelled) return;
      const saved = (data?.data ?? {}) as Partial<State>;
      const next: State = { ...empty, ...saved, ledger: saved.ledger ?? [], gov: { ...emptyGov, ...(saved.gov ?? {}) } };
      const m = session.user.user_metadata ?? {};
      if (!next.user) {
        const lang = (m.language === "te" ? "te" : "en") as Lang;
        next.user = {
          name: String(m.name ?? "Farmer"), email: session.user.email, mobile: String(m.mobile ?? ""),
          location: String(m.location ?? ""), language: lang,
          lat: typeof m.lat === "number" ? m.lat : undefined, lon: typeof m.lon === "number" ? m.lon : undefined,
          locationSource: m.locationSource as LocSource | undefined, locationUpdatedAt: m.locationUpdatedAt as string | undefined,
        };
        next.lang = lang;
        next.notices = demoNotices();
        const farm = m.farm as Partial<Farm> | undefined;
        if (farm && next.farms.length === 0) {
          const f: Farm = { name: "Farm 1", location: next.user.location, ...farm, id: uid(), lat: next.user.lat, lon: next.user.lon, locationSource: next.user.locationSource, locationUpdatedAt: next.user.locationUpdatedAt };
          next.farms = [f]; next.activeFarmId = f.id;
        }
      }
      next.user = { ...next.user, email: session.user.email };
      loadedFor.current = id; setUserId(id); setS(next); setHydrated(true);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      // Pause screens while the new account loads so they don't bounce back to sign-in.
      if (session && loadedFor.current !== session.user.id) setHydrated(false);
      // If this sign-in came from tapping the email verify link (possibly on
      // another device), tell the waiting device so it can sign in too.
      if (_e === "SIGNED_IN" && session?.user.email_confirmed_at) void broadcastVerified(session.user.email);
      setTimeout(() => apply(session), 0);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = s.lang;
    try { localStorage.setItem(LANG_KEY, s.lang); } catch { /* ignore */ }
    const id = loadedFor.current;
    if (!hydrated || !id || !s.user) return;
    const timer = setTimeout(() => {
      supabase.from("user_state").upsert({ user_id: id, data: JSON.parse(JSON.stringify(s)), updated_at: new Date().toISOString() })
        .then(({ error }) => { if (error) console.error("Save failed", error.message); });
    }, 500);
    return () => clearTimeout(timer);
  }, [s, hydrated]);

  const t = useCallback((k: DictKey) => translate(k, s.lang), [s.lang]);
  const tl = useCallback((l: L | string) => tr(l, s.lang), [s.lang]);

  const value = useMemo<Ctx>(() => ({
    ...s, hydrated, t, tl, userId,
    activeFarm: s.farms.find((f) => f.id === s.activeFarmId) ?? s.farms[0],
    setLang: (lang) => setS((p) => ({ ...p, lang, user: p.user ? { ...p.user, language: lang } : p.user })),
    login: (user) => setS((p) => ({ ...p, user, lang: user.language, notices: p.notices.length ? p.notices : demoNotices() })),
    loginDemo: () => setS((p) => buildDemoState(p.lang)),
    logout: () => { loadedFor.current = null; setS((p) => ({ ...empty, lang: p.lang })); void supabase.auth.signOut(); },
    updateUser: (u) => setS((p) => ({ ...p, user: p.user ? { ...p.user, ...u } : p.user })),
    addFarm: (f) => {
      const farm = { ...f, id: uid() };
      setS((p) => ({ ...p, farms: [...p.farms, farm], activeFarmId: farm.id }));
      return farm;
    },
    updateFarm: (id, f) => setS((p) => ({ ...p, farms: p.farms.map((x) => (x.id === id ? { ...x, ...f } : x)) })),
    setActiveFarm: (id) => setS((p) => ({ ...p, activeFarmId: id })),
    addPlan: (pl) => {
      const plan: CropPlan = { ...pl, id: uid(), createdAt: new Date().toISOString() };
      const newTasks = tasksFor(plan);
      setS((p) => ({
        ...p, plans: [plan, ...p.plans], tasks: [...newTasks, ...p.tasks],
        notices: [{ id: uid(), type: "plan", emoji: "📅", title: { en: "New crop plan created", te: "కొత్త పంట ప్రణాళిక తయారైంది" }, body: { en: `${newTasks.length} tasks scheduled`, te: `${newTasks.length} పనులు షెడ్యూల్ అయ్యాయి` }, date: iso(new Date()), read: false }, ...p.notices],
      }));
      return plan;
    },
    toggleTask: (id) => setS((p) => ({ ...p, tasks: p.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })),
    addTask: (tk) => setS((p) => ({ ...p, tasks: [{ ...tk, id: uid(), done: false }, ...p.tasks] })),
    removeTask: (id) => setS((p) => ({ ...p, tasks: p.tasks.filter((x) => x.id !== id) })),
    addScan: (sc) => {
      const scan: Scan = { ...sc, id: uid(), date: new Date().toISOString() };
      setS((p) => ({ ...p, scans: [scan, ...p.scans].slice(0, 12) }));
      return scan;
    },
    updateScan: (id, sc) => setS((p) => ({ ...p, scans: p.scans.map((x) => (x.id === id ? { ...x, ...sc } : x)) })),
    removeScan: (id) => setS((p) => ({ ...p, scans: p.scans.filter((x) => x.id !== id) })),
    addExpert: (r) => setS((p) => ({ ...p, expert: [{ ...r, id: uid(), date: new Date().toISOString(), status: "submitted" }, ...p.expert] })),
    markNotice: (id) => setS((p) => ({ ...p, notices: p.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    markAllNotices: () => setS((p) => ({ ...p, notices: p.notices.map((n) => ({ ...n, read: true })) })),
    setFinance: (finance) => setS((p) => ({ ...p, finance })),
    addLedger: (e) => setS((p) => ({ ...p, ledger: [{ ...e, id: uid() }, ...(p.ledger ?? [])] })),
    gov: s.gov ?? emptyGov,
    updateGov: (fn) => setS((p) => ({ ...p, gov: fn(p.gov ?? emptyGov) })),
    removeLedger: (id) => setS((p) => ({ ...p, ledger: (p.ledger ?? []).filter((x) => x.id !== id) })),
  }), [s, hydrated, t, tl, userId]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}
