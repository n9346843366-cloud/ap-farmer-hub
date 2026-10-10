import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, seo } from "@/components/AppShell";
import { Card, Eyebrow, Notice, PageHeader, useT } from "@/components/kit";

export const Route = createFileRoute("/loans")({
  head: () => seo("Farm Loans", "How farmers can get a loan: Kisan Credit Card, crop loans, Mudra, AIF and more — documents and steps."),
  component: () => (<AppShell><Loans /></AppShell>),
});

type Loan = { e: string; en: string; te: string; what: [string, string]; amount: [string, string]; where: [string, string] };
const LOANS: Loan[] = [
  { e: "💳", en: "Kisan Credit Card (KCC)", te: "కిసాన్ క్రెడిట్ కార్డ్", what: ["For crop costs: seeds, fertiliser, labour. Also dairy, poultry, fisheries.", "పంట ఖర్చులకు: విత్తనాలు, ఎరువులు, కూలీ. పాడి, కోళ్లు, చేపలకు కూడా."], amount: ["Up to ₹3 lakh at about 4% interest if repaid on time (with govt interest help). Up to ₹2 lakh usually needs no security.", "₹3 లక్షల వరకు, సమయానికి కడితే సుమారు 4% వడ్డీ. ₹2 లక్షల వరకు సాధారణంగా తాకట్టు అవసరం లేదు."], where: ["Any bank, Grameena Bank, or cooperative society (PACS).", "ఏ బ్యాంక్, గ్రామీణ బ్యాంక్ లేదా సహకార సంఘం."] },
  { e: "🌾", en: "Crop / gold loan", te: "పంట / బంగారం రుణం", what: ["Short loan for one season. Gold loans are fast (same day).", "ఒక సీజన్‌కి చిన్న రుణం. బంగారం రుణం అదే రోజు వస్తుంది."], amount: ["Depends on crop area and scale of finance.", "పంట విస్తీర్ణం బట్టి."], where: ["Bank branch or PACS.", "బ్యాంక్ లేదా సహకార సంఘం."] },
  { e: "🚜", en: "Tractor & machinery loan", te: "ట్రాక్టర్ & యంత్రాల రుణం", what: ["Buy tractor, power tiller, sprayer, drip system.", "ట్రాక్టర్, టిల్లర్, స్ప్రేయర్, డ్రిప్ కొనడానికి."], amount: ["Usually 80–90% of cost, repaid in 5–9 years. Some machines get state subsidy.", "ఖర్చులో 80–90%, 5–9 ఏళ్లలో తిరిగి కట్టాలి. కొన్నిటికి సబ్సిడీ."], where: ["Banks, NBFCs. Ask the Agriculture Officer about subsidy first.", "బ్యాంకులు. ముందుగా వ్యవసాయ అధికారిని సబ్సిడీ గురించి అడగండి."] },
  { e: "🏪", en: "Mudra / PMEGP (small business)", te: "ముద్ర / PMEGP (చిన్న వ్యాపారం)", what: ["Start dairy, poultry, food processing, shop.", "డెయిరీ, కోళ్లు, ఫుడ్ ప్రాసెసింగ్, షాప్ ప్రారంభించడానికి."], amount: ["Mudra up to ₹20 lakh without security. PMEGP gives 15–35% subsidy.", "ముద్ర ₹20 లక్షల వరకు తాకట్టు లేకుండా. PMEGP లో 15–35% సబ్సిడీ."], where: ["Bank, or apply online at kviconline.gov.in (PMEGP).", "బ్యాంక్ లేదా kviconline.gov.in లో."] },
  { e: "🏗️", en: "Agriculture Infrastructure Fund (AIF)", te: "వ్యవసాయ మౌలిక నిధి (AIF)", what: ["Godown, cold storage, sorting/grading unit.", "గోదాం, కోల్డ్ స్టోరేజ్, గ్రేడింగ్ యూనిట్."], amount: ["Up to ₹2 crore with 3% interest help.", "₹2 కోట్ల వరకు, 3% వడ్డీ సహాయం."], where: ["Banks; apply at agriinfra.dac.gov.in.", "బ్యాంకులు; agriinfra.dac.gov.in."] },
  { e: "👩‍🌾", en: "SHG / JLG group loans", te: "స్వయం సహాయక సంఘ రుణాలు", what: ["For women and tenant farmers without land papers.", "మహిళలు మరియు కౌలు రైతులకు."], amount: ["Group loans with low interest; no land needed.", "తక్కువ వడ్డీ, భూమి అవసరం లేదు."], where: ["Through your village SHG / bank.", "గ్రామ సంఘం / బ్యాంక్ ద్వారా."] },
];

function Loans() {
  const T = useT();
  return (
    <div className="space-y-3">
      <PageHeader emoji="🏦" title={T("Farm Loans", "రైతు రుణాలు")} sub={T("Which loan, and how to get it", "ఏ రుణం, ఎలా పొందాలి")} />
      <Card>
        <Eyebrow>{T("Steps to get a loan", "రుణం పొందే విధానం")}</Eyebrow>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
          <li>{T("Decide what you need money for and how much.", "ఎందుకు, ఎంత డబ్బు కావాలో నిర్ణయించండి.")}</li>
          <li>{T("Collect documents (list below).", "పత్రాలు సిద్ధం చేయండి (క్రింద జాబితా).")}</li>
          <li>{T("Visit your nearest bank branch, Grameena Bank or PACS. Ask for the KCC / loan form.", "దగ్గరలోని బ్యాంక్, గ్రామీణ బ్యాంక్ లేదా PACS కి వెళ్లి KCC / రుణ ఫారం అడగండి.")}</li>
          <li>{T("Bank checks land records and visits the field. Usually 2–4 weeks.", "బ్యాంక్ భూమి రికార్డులు, పొలం చూస్తుంది. సాధారణంగా 2–4 వారాలు.")}</li>
          <li>{T("Repay on time to get low interest and a bigger loan next year.", "సమయానికి కడితే తక్కువ వడ్డీ, వచ్చే ఏడాది ఎక్కువ రుణం.")}</li>
        </ol>
      </Card>
      <Card>
        <Eyebrow>{T("Documents needed", "కావలసిన పత్రాలు")}</Eyebrow>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>{T("Aadhaar card and PAN card", "ఆధార్ మరియు పాన్ కార్డ్")}</li>
          <li>{T("Pattadar passbook / land records (1B, Adangal); tenants: CCRC card", "పట్టాదారు పాస్‌బుక్ / 1B, అడంగల్; కౌలు రైతులు: CCRC కార్డ్")}</li>
          <li>{T("2 passport photos and bank passbook", "2 ఫోటోలు, బ్యాంక్ పాస్‌బుక్")}</li>
          <li>{T("Crop details (crop, area). For business loans: a simple project report", "పంట వివరాలు. వ్యాపార రుణాలకు: ప్రాజెక్ట్ రిపోర్ట్")}</li>
        </ul>
      </Card>
      {LOANS.map((l) => (
        <Card key={l.en}>
          <p className="font-bold">{l.e} {T(l.en, l.te)}</p>
          <p className="mt-1 text-sm"><b>{T("For: ", "దేనికి: ")}</b>{T(...l.what)}</p>
          <p className="mt-1 text-sm"><b>{T("Amount: ", "మొత్తం: ")}</b>{T(...l.amount)}</p>
          <p className="mt-1 text-sm"><b>{T("Where: ", "ఎక్కడ: ")}</b>{T(...l.where)}</p>
        </Card>
      ))}
      <Notice tone="warn">{T("Never pay agents or middlemen to get a loan. Avoid private moneylenders charging high interest. Rates change — confirm at your bank.", "రుణం కోసం దళారులకు డబ్బు ఇవ్వకండి. ఎక్కువ వడ్డీ ప్రైవేట్ అప్పులు వద్దు. రేట్లు మారుతాయి — బ్యాంక్‌లో నిర్ధారించండి.")}</Notice>
      <Link to="/assistant" className="block text-center text-sm font-semibold text-primary">{T("Have a question about loans? Ask VERDIX AI →", "రుణాల గురించి ప్రశ్న ఉందా? VERDIX AI ని అడగండి →")}</Link>
    </div>
  );
}
