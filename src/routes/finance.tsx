import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Eyebrow, inputCls, PageHeader, Stat, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { getCrop, iso } from "@/lib/crops";
import { getMarketPrices } from "@/lib/integrations";

export const Route = createFileRoute("/finance")({
  head: () => seo("Farm Finance", "Add what you invest each day and see how much you invested and how much you gained."),
  component: () => (
    <AppShell>
      <Finance />
    </AppShell>
  ),
});

const CATS: { k: string; e: string; en: string; te: string }[] = [
  { k: "seeds", e: "🌱", en: "Seeds / plants", te: "విత్తనాలు" },
  { k: "fertilizer", e: "🧪", en: "Fertiliser", te: "ఎరువులు" },
  { k: "protection", e: "🛡️", en: "Pesticide / spray", te: "మందులు" },
  { k: "labour", e: "👷", en: "Labour", te: "కూలీ" },
  { k: "irrigation", e: "💧", en: "Water / power", te: "నీరు / కరెంటు" },
  { k: "machinery", e: "🚜", en: "Tractor / machinery", te: "ట్రాక్టర్" },
  { k: "transport", e: "🚚", en: "Transport", te: "రవాణా" },
  { k: "other", e: "📦", en: "Other", te: "ఇతర" },
];
const INCOME_CATS = [
  { k: "sale", e: "💵", en: "Crop sale", te: "పంట అమ్మకం" },
  { k: "subsidy", e: "🏛️", en: "Subsidy / scheme", te: "సబ్సిడీ" },
  { k: "other_in", e: "➕", en: "Other income", te: "ఇతర ఆదాయం" },
];

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const numStr = (n: number) => (n ? String(n) : "");

function Finance() {
  const { finance, setFinance, activeFarm, ledger, addLedger, removeLedger, lang } = useApp();
  const T = useT();
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [cat, setCat] = useState("fertilizer");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(iso(new Date()));
  const [note, setNote] = useState("");
  const [yieldStr, setYieldStr] = useState(numStr(finance.yieldQty));
  const [priceStr, setPriceStr] = useState(numStr(finance.price));
  const [approx, setApprox] = useState<number | null>(null);
  const crop = activeFarm?.crop ?? "mango";

  useEffect(() => { setYieldStr(numStr(finance.yieldQty)); setPriceStr(numStr(finance.price)); }, [finance.yieldQty, finance.price]);
  useEffect(() => {
    getMarketPrices(crop, activeFarm?.location?.split(",")[0] ?? "Local").then((r) => {
      const p = r.rows[0]?.price; setApprox(p ? Math.round(p / 100) : null);
    });
  }, [crop, activeFarm?.location]);

  const entries = ledger ?? [];
  const legacy = Object.values(finance.items).reduce((a, b) => a + (b || 0), 0);
  const invested = entries.filter((e) => e.kind === "expense").reduce((a, e) => a + e.amount, 0) + legacy;
  const gained = entries.filter((e) => e.kind === "income").reduce((a, e) => a + e.amount, 0);
  const expected = finance.yieldQty * finance.price;
  const profit = gained - invested;

  const add = () => {
    const a = Number(amount);
    if (!a || a <= 0) return toast.error(T("Enter an amount", "మొత్తం ఇవ్వండి"));
    addLedger({ kind, category: cat, amount: a, date, note: note.trim() || undefined });
    setAmount(""); setNote("");
    toast.success(T("Saved", "సేవ్ అయింది"));
  };
  const cats = kind === "expense" ? CATS : INCOME_CATS;
  const label = (k: string) => { const c = [...CATS, ...INCOME_CATS].find((x) => x.k === k); return c ? `${c.e} ${lang === "te" ? c.te : c.en}` : k; };
  const byCat = CATS.map((c) => ({ ...c, v: entries.filter((e) => e.kind === "expense" && e.category === c.k).reduce((a, e) => a + e.amount, 0) + (finance.items[c.k] ?? 0) })).filter((c) => c.v > 0);
  const max = Math.max(1, ...byCat.map((c) => c.v));

  return (
    <div className="space-y-3">
      <PageHeader emoji="💰" title={T("Farm Finance", "ఫార్మ్ ఫైనాన్స్")} sub={activeFarm?.name} />
      <Card>
        <div className="grid grid-cols-2 gap-2">
          <Stat label={T("Total invested", "మొత్తం పెట్టుబడి")} value={inr(invested)} />
          <Stat label={T("Total gained", "మొత్తం ఆదాయం")} value={inr(gained)} />
          <Stat label={T("Profit / loss so far", "ఇప్పటి లాభం / నష్టం")} value={<span className={profit >= 0 ? "text-primary" : "text-destructive"}>{inr(profit)}</span>} />
          <Stat label={T("Expected harvest income", "అంచనా పంట ఆదాయం")} value={inr(expected)} sub={expected ? `${T("Expected profit", "అంచనా లాభం")}: ${inr(gained + expected - invested)}` : undefined} />
        </div>
      </Card>

      <Card delay={40}>
        <Eyebrow>{T("Add today's entry", "ఈరోజు నమోదు")}</Eyebrow>
        <div className="mt-3 flex gap-2">
          <Chip active={kind === "expense"} onClick={() => { setKind("expense"); setCat("fertilizer"); }}>➖ {T("I invested", "పెట్టుబడి")}</Chip>
          <Chip active={kind === "income"} onClick={() => { setKind("income"); setCat("sale"); }}>➕ {T("I earned", "ఆదాయం")}</Chip>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {cats.map((c) => <Chip key={c.k} active={cat === c.k} onClick={() => setCat(c.k)}>{c.e} {T(c.en, c.te)}</Chip>)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input className={inputCls} inputMode="decimal" placeholder={T("Amount ₹ (e.g. 500)", "మొత్తం ₹")} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <input className={`${inputCls} mt-2`} placeholder={T("Note (optional)", "గమనిక (ఐచ్ఛికం)")} value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} />
        <Btn className="mt-3 w-full" onClick={add}>{T("Save entry", "సేవ్ చేయండి")}</Btn>
        <p className="mt-2 text-xs text-muted-foreground">{T("Saved to your account — it stays even if you close the app or use another phone.", "మీ ఖాతాలో సేవ్ అవుతుంది — యాప్ మూసినా, వేరే ఫోన్‌లో కూడా ఉంటుంది.")}</p>
      </Card>

      {byCat.length > 0 && (
        <Card delay={60}>
          <Eyebrow>{T("Where your money went", "మీ డబ్బు ఎక్కడ ఖర్చైంది")}</Eyebrow>
          <div className="mt-3 space-y-2">
            {byCat.map((c) => (
              <div key={c.k}>
                <div className="flex justify-between text-sm"><span>{c.e} {T(c.en, c.te)}</span><b>{inr(c.v)}</b></div>
                <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-chart-3" style={{ width: `${(c.v / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card delay={80}>
        <Eyebrow>{T("History", "చరిత్ర")}</Eyebrow>
        <div className="mt-2 divide-y divide-border">
          {entries.length === 0 && <p className="py-3 text-sm text-muted-foreground">{T("No entries yet. Add what you spend each day.", "ఇంకా నమోదులు లేవు.")}</p>}
          {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{label(e.category)}</p>
                <p className="truncate text-xs text-muted-foreground">{e.date}{e.note ? ` · ${e.note}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <b className={e.kind === "income" ? "text-primary" : "text-destructive"}>{e.kind === "income" ? "+" : "−"}{inr(e.amount)}</b>
                <button aria-label="Delete" onClick={() => removeLedger(e.id)} className="text-xs text-muted-foreground">✕</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card delay={120}>
        <Eyebrow>{T("Expected harvest", "అంచనా దిగుబడి")}</Eyebrow>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-sm">{T("Yield", "దిగుబడి")} ({finance.unit})
            <input inputMode="decimal" placeholder="e.g. 5000" value={yieldStr} onChange={(e) => { const v = e.target.value.replace(/[^\d.]/g, ""); setYieldStr(v); setFinance({ ...finance, yieldQty: Number(v) || 0 }); }} className={`${inputCls} mt-1`} />
          </label>
          <label className="text-sm">{T("Price ₹ per", "ధర ₹ ఒక్కో")} {finance.unit}
            <input inputMode="decimal" placeholder={approx ? `≈ ${approx}` : "e.g. 30"} value={priceStr} onChange={(e) => { const v = e.target.value.replace(/[^\d.]/g, ""); setPriceStr(v); setFinance({ ...finance, price: Number(v) || 0 }); }} className={`${inputCls} mt-1`} />
          </label>
        </div>
        {approx && (
          <button onClick={() => setFinance({ ...finance, price: approx })} className="mt-2 text-xs font-semibold text-primary">
            📈 {T(`Use approx market price for ${getCrop(crop)?.name.en ?? crop}: ₹${approx}/kg`, `అంచనా మార్కెట్ ధర వాడండి: ₹${approx}/kg`)}
          </button>
        )}
      </Card>
    </div>
  );
}
