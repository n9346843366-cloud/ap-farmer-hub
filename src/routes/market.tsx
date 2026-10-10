import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Card, Chip, DemoBadge, Eyebrow, inputCls, Notice, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { getCrop } from "@/lib/crops";
import { getMarketPrices, type MarketRow } from "@/lib/integrations";

export const Route = createFileRoute("/market")({
  head: () => seo("Market Prices", "Check mandi prices for your crop and plan when and where to sell."),
  component: () => (
    <AppShell>
      <Market />
    </AppShell>
  ),
});

const CROPS = ["mango", "tomato", "chilli", "groundnut", "rice", "maize"];

function Market() {
  const { activeFarm, tl } = useApp();
  const T = useT();
  const [crop, setCrop] = useState(CROPS.includes(activeFarm?.crop ?? "") ? activeFarm!.crop! : "mango");
  const [market, setMarket] = useState(activeFarm?.location?.split(",")[0] ?? "Tirupati");
  const [rows, setRows] = useState<MarketRow[]>([]);
  useEffect(() => { getMarketPrices(crop, market).then((r) => setRows(r.rows)); }, [crop, market]);
  const best = rows.reduce<MarketRow | null>((a, r) => (!a || (r.price ?? 0) > (a.price ?? 0) ? r : a), null);

  return (
    <div className="space-y-3">
      <PageHeader emoji="💰" title={T("Market Prices", "మార్కెట్ ధరలు")} />
      <Notice tone="warn">{T("Live mandi prices are not connected yet. Numbers below are illustrative samples, not today's prices.", "ప్రత్యక్ష మండి ధరలు ఇంకా కనెక్ట్ కాలేదు. కింది సంఖ్యలు నమూనా మాత్రమే.")}</Notice>
      <Card>
        <div className="flex flex-wrap gap-1.5">
          {CROPS.map((c) => { const x = getCrop(c)!; return <Chip key={c} active={crop === c} onClick={() => setCrop(c)}>{x.emoji} {tl(x.name)}</Chip>; })}
        </div>
        <input value={market} onChange={(e) => setMarket(e.target.value)} className={`${inputCls} mt-3`} placeholder={T("Market / town", "మార్కెట్ / పట్టణం")} />
      </Card>
      <Card delay={60}>
        <Eyebrow right={<DemoBadge label={T("Sample", "నమూనా")} />}>{T("Prices", "ధరలు")}</Eyebrow>
        <div className="mt-2 divide-y divide-border">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div><p className="font-semibold">{r.market}</p><p className="text-xs text-muted-foreground">{r.source}</p></div>
              <p className="text-right text-lg font-bold">₹{r.price?.toLocaleString("en-IN")}<span className="block text-[10px] font-normal text-muted-foreground">{r.unit}</span></p>
            </div>
          ))}
          {!rows.length && <p className="py-3 text-sm text-muted-foreground">{T("No data for this crop.", "ఈ పంటకు సమాచారం లేదు.")}</p>}
        </div>
      </Card>
      {best && (
        <Card delay={120}>
          <Eyebrow>{T("Selling tips", "అమ్మకం సూచనలు")}</Eyebrow>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>📍 {T("Higher sample price at", "ఎక్కువ నమూనా ధర")}: <b>{best.market}</b></li>
            <li>🚚 {T("Subtract transport cost before choosing a farther market.", "దూరపు మార్కెట్ ఎంచుకునే ముందు రవాణా ఖర్చు తీసివేయండి.")}</li>
            <li>📦 {T("Grade and sort produce — better quality gets better rates.", "నాణ్యత ప్రకారం వేరు చేయండి — మంచి ధర వస్తుంది.")}</li>
            <li>🏛️ {T("Check e-NAM / Rythu Bazaar for official rates.", "అధికారిక ధరల కోసం e-NAM / రైతు బజార్ చూడండి.")}</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
