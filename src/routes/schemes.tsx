import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Card, Chip, Eyebrow, Notice, PageHeader, useT } from "@/components/kit";

export const Route = createFileRoute("/schemes")({
  head: () => seo("Government Schemes", "Farmer schemes in India with a simple eligibility guide, benefits and how to apply."),
  component: () => (<AppShell><Schemes /></AppShell>),
});

type Profile = { land: "none" | "small" | "large"; owner: boolean; state: "ap" | "ts" | "other" };
type Scheme = {
  name: string; emoji: string; benefit: string; who: string; docs: string; url: string;
  eligible: (p: Profile) => boolean;
};

const SCHEMES: Scheme[] = [
  { name: "PM-KISAN", emoji: "💵", benefit: "₹6,000 per year in 3 instalments to your bank account.", who: "Land-owning farmer families. Not for income-tax payers, govt employees or professionals.", docs: "Aadhaar, land records, bank account", url: "https://pmkisan.gov.in/", eligible: (p) => p.owner && p.land !== "none" },
  { name: "PM Fasal Bima Yojana (Crop insurance)", emoji: "🛡️", benefit: "Insurance for crop loss from rain, drought, pests. Premium only 1.5–2% (5% for horticulture).", who: "All farmers incl. tenants & sharecroppers growing notified crops.", docs: "Aadhaar, bank account, land record or tenancy paper, sowing certificate", url: "https://pmfby.gov.in/", eligible: () => true },
  { name: "Kisan Credit Card (KCC)", emoji: "💳", benefit: "Crop loan up to ₹3 lakh at ~4% interest if repaid on time.", who: "Owner farmers, tenants, oral lessees, SHG/JLG members.", docs: "Aadhaar, land/tenancy proof, photo", url: "https://www.myscheme.gov.in/schemes/kcc", eligible: () => true },
  { name: "Soil Health Card", emoji: "🧪", benefit: "Free soil test with fertiliser advice for your field.", who: "All farmers.", docs: "Aadhaar, land details", url: "https://soilhealth.dac.gov.in/", eligible: () => true },
  { name: "PM Krishi Sinchayee (Drip / sprinkler)", emoji: "💧", benefit: "55% subsidy for small farmers on drip & sprinkler (45% others).", who: "Farmers with land and water source.", docs: "Aadhaar, land record, water source proof", url: "https://pmksy.gov.in/", eligible: (p) => p.land !== "none" },
  { name: "PM-KUSUM (Solar pump)", emoji: "☀️", benefit: "Up to 60% subsidy for solar irrigation pumps.", who: "Individual farmers, groups, FPOs.", docs: "Aadhaar, land record, bank account", url: "https://pmkusum.mnre.gov.in/", eligible: (p) => p.land !== "none" },
  { name: "Annadatha Sukhibhava (AP)", emoji: "🌾", benefit: "Yearly investment support to farmers in Andhra Pradesh (incl. PM-KISAN share).", who: "AP farmers incl. tenant farmers with CCRC card.", docs: "Aadhaar, land record / CCRC, bank account — via Rythu Seva Kendra", url: "https://annadathasukhibhava.ap.gov.in/", eligible: (p) => p.state === "ap" },
  { name: "Rythu Bharosa (Telangana)", emoji: "🌾", benefit: "Per-acre investment support each season for Telangana farmers.", who: "Telangana pattadar farmers on cultivable land.", docs: "Pattadar passbook, Aadhaar, bank account", url: "https://rythubharosa.telangana.gov.in/", eligible: (p) => p.state === "ts" && p.owner },
  { name: "e-NAM", emoji: "🏪", benefit: "Sell produce online to buyers across India for a better price.", who: "All farmers.", docs: "Aadhaar, bank account, mobile", url: "https://enam.gov.in/", eligible: () => true },
  { name: "SMAM (Farm machinery)", emoji: "🚜", benefit: "40–50% subsidy on tractors, tillers and tools; custom hiring centres.", who: "All farmers; higher subsidy for small/marginal, SC/ST, women.", docs: "Aadhaar, land record, bank account", url: "https://agrimachinery.nic.in/", eligible: (p) => p.land !== "none" },
];

function Schemes() {
  const T = useT();
  const [p, setP] = useState<Profile>({ land: "small", owner: true, state: "ap" });
  const ok = SCHEMES.filter((s) => s.eligible(p));
  const no = SCHEMES.filter((s) => !s.eligible(p));
  return (
    <div className="space-y-3">
      <PageHeader emoji="🏛️" title={T("Government Schemes", "ప్రభుత్వ పథకాలు")} />
      <Link to="/meeseva" className="glass flex items-center justify-between gap-2 p-3 text-sm font-semibold">
        <span>🏢 {T("Mini MeeSeva — land records, certificates & application tracking", "మినీ మీసేవ — భూమి రికార్డులు, ధృవపత్రాలు, దరఖాస్తు స్థితి")}</span><span className="text-primary">→</span>
      </Link>
      <Card>
        <Eyebrow>{T("Check your eligibility", "మీ అర్హత చూడండి")}</Eyebrow>
        <p className="mt-3 text-sm font-semibold">{T("Your land", "మీ భూమి")}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Chip active={p.land === "none"} onClick={() => setP({ ...p, land: "none" })}>{T("No land", "భూమి లేదు")}</Chip>
          <Chip active={p.land === "small"} onClick={() => setP({ ...p, land: "small" })}>{T("Up to 5 acres", "5 ఎకరాల వరకు")}</Chip>
          <Chip active={p.land === "large"} onClick={() => setP({ ...p, land: "large" })}>{T("More than 5 acres", "5 ఎకరాలకు పైగా")}</Chip>
        </div>
        <p className="mt-3 text-sm font-semibold">{T("Land in your name?", "భూమి మీ పేరున ఉందా?")}</p>
        <div className="mt-1.5 flex gap-1.5">
          <Chip active={p.owner} onClick={() => setP({ ...p, owner: true })}>{T("Yes, owner", "అవును")}</Chip>
          <Chip active={!p.owner} onClick={() => setP({ ...p, owner: false })}>{T("No, tenant", "కౌలు రైతు")}</Chip>
        </div>
        <p className="mt-3 text-sm font-semibold">{T("State", "రాష్ట్రం")}</p>
        <div className="mt-1.5 flex gap-1.5">
          <Chip active={p.state === "ap"} onClick={() => setP({ ...p, state: "ap" })}>Andhra Pradesh</Chip>
          <Chip active={p.state === "ts"} onClick={() => setP({ ...p, state: "ts" })}>Telangana</Chip>
          <Chip active={p.state === "other"} onClick={() => setP({ ...p, state: "other" })}>{T("Other", "ఇతర")}</Chip>
        </div>
      </Card>
      <Notice tone="ok">{T(`You may be eligible for ${ok.length} schemes`, `మీరు ${ok.length} పథకాలకు అర్హులు కావచ్చు`)}</Notice>
      {ok.map((s, i) => <SchemeCard key={s.name} s={s} delay={i * 30} />)}
      {no.length > 0 && <p className="pt-2 text-xs font-semibold text-muted-foreground">{T("Probably not eligible right now", "ప్రస్తుతం అర్హత లేకపోవచ్చు")}</p>}
      {no.map((s) => <SchemeCard key={s.name} s={s} muted />)}
      <p className="text-center text-xs text-muted-foreground">{T("Final eligibility is decided by the department. Visit your Rythu Seva Kendra / Agriculture Officer.", "తుది అర్హత శాఖ నిర్ణయిస్తుంది. రైతు సేవా కేంద్రాన్ని సంప్రదించండి.")}</p>
    </div>
  );
}

function SchemeCard({ s, muted, delay = 0 }: { s: Scheme; muted?: boolean; delay?: number }) {
  return (
    <Card delay={delay} className={muted ? "opacity-60" : ""}>
      <p className="text-lg font-bold">{s.emoji} {s.name}</p>
      <p className="mt-1 text-sm"><b>Benefit:</b> {s.benefit}</p>
      <p className="mt-1 text-sm"><b>Who can apply:</b> {s.who}</p>
      <p className="mt-1 text-sm"><b>Documents:</b> {s.docs}</p>
      <a href={s.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-primary">Apply / know more →</a>
    </Card>
  );
}
