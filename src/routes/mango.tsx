import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Card, Chip, Eyebrow, Notice, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { MANGO_MONTHS, mangoStage } from "@/lib/crops";
import { useWeather } from "@/lib/useWeather";
import { hasCoords } from "@/lib/location";

export const Route = createFileRoute("/mango")({
  head: () => seo("Mango Management", "Specialised mango orchard care: month-wise tasks, flowering, fruit fly, irrigation and harvest guidance."),
  component: () => (<AppShell><Mango /></AppShell>),
});

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_TE = ["జన", "ఫిబ్ర", "మార్చి", "ఏప్రి", "మే", "జూన్", "జులై", "ఆగ", "సెప్టె", "అక్టో", "నవం", "డిసెం"];

const VARIETIES = [
  ["Banganapalli", "బంగినపల్లి", "Large, sweet table fruit; mid-season (Apr–Jun).", "పెద్ద, తీపి పండు; ఏప్రిల్–జూన్."],
  ["Totapuri", "తోతాపురి", "Pulp & processing; hardy, regular bearer.", "గుజ్జు తయారీకి; దృఢమైన రకం."],
  ["Neelum", "నీలం", "Late season; good keeping quality.", "ఆలస్య రకం; ఎక్కువ రోజులు నిల్వ."],
  ["Suvarnarekha", "సువర్ణరేఖ", "Early season; attractive colour.", "తొందర రకం; మంచి రంగు."],
  ["Rasalu / Chinna Rasam", "రసాలు / చిన్న రసం", "Juicy local favourite.", "రసభరిత స్థానిక రకం."],
] as const;

const GUIDE = [
  { e: "🌸", en: "Flowering care", te: "పూత సంరక్షణ", items: [
    ["Check panicles weekly for hoppers and powdery mildew.", "తేనె మంచు పురుగు, బూడిద తెగులు కోసం వారానికోసారి పూత పరిశీలించండి."],
    ["Avoid heavy irrigation during full bloom.", "పూర్తి పూత సమయంలో ఎక్కువ నీరు పెట్టకండి."],
    ["Spray only on expert/label advice; avoid spraying when bees are active.", "నిపుణుల/లేబుల్ సలహాతోనే పిచికారీ; తేనెటీగలు తిరిగేటప్పుడు చేయకండి."],
  ] },
  { e: "🪰", en: "Fruit fly control", te: "పండు ఈగ నివారణ", items: [
    ["Hang methyl-eugenol traps from fruit set (about 4–6 per acre).", "పిందె దశ నుండి మిథైల్ యూజినాల్ ఎరలు (ఎకరాకు సుమారు 4–6)."],
    ["Collect and bury fallen fruit regularly.", "రాలిన కాయలు సేకరించి పూడ్చండి."],
    ["Plough lightly under trees after harvest to expose pupae.", "కోత తర్వాత చెట్ల కింద తేలికగా దున్నండి."],
  ] },
  { e: "💧", en: "Water management", te: "నీటి నిర్వహణ", items: [
    ["Bearing trees: stop irrigation ~2 months before flowering to induce bloom.", "కాపు చెట్లు: పూతకు ~2 నెలల ముందు నీరు ఆపండి."],
    ["After fruit set, irrigate lightly every 10–15 days.", "పిందె తర్వాత 10–15 రోజులకోసారి తేలికగా నీరు."],
    ["Mulch basins to save moisture in summer.", "వేసవిలో పాదుల్లో మల్చింగ్ చేయండి."],
  ] },
  { e: "🧺", en: "Harvest & quality", te: "కోత & నాణ్యత", items: [
    ["Harvest at mature-green stage with a stalk of 1–2 cm.", "పక్వమైన పచ్చ దశలో 1–2 సెం.మీ కాడతో కోయండి."],
    ["Avoid latex (sap) touching the fruit — keep fruit stalk-down to drain.", "పాలు కాయకు తగలకుండా కాడ కిందికి ఉంచండి."],
    ["Do not use calcium carbide for ripening — it is banned.", "కాల్షియం కార్బైడ్‌తో పండించడం నిషేధం."],
  ] },
] as const;

function Mango() {
  const T = useT();
  const { tl, lang, farms, activeFarm, user } = useApp();
  const mangoFarm = farms.find((f) => f.crop === "mango") ?? (activeFarm?.crop === "mango" ? activeFarm : undefined);
  const [age, setAge] = useState<number>(mangoFarm?.treeAge ?? 8);
  const month = new Date().getMonth();
  const [sel, setSel] = useState(month);
  const stage = mangoStage(age, month);
  const loc = hasCoords(mangoFarm) ? mangoFarm : hasCoords(activeFarm) ? activeFarm : hasCoords(user) ? user : null;
  const { w } = useWeather(loc ? { lat: loc.lat, lon: loc.lon } : null);
  const rainy = !!w && JSON.stringify(w).toLowerCase().includes("rain");

  return (
    <div className="space-y-3">
      <PageHeader emoji="🥭" title={T("Mango Management", "మామిడి నిర్వహణ")} sub={mangoFarm ? `${mangoFarm.name} · ${mangoFarm.location}` : T("Specialised orchard care for Andhra Pradesh & South India", "ఆంధ్రప్రదేశ్ & దక్షిణ భారత మామిడి తోటల సంరక్షణ")} />
      <Card>
        <Eyebrow>{T("Your orchard now", "ఇప్పుడు మీ తోట")}</Eyebrow>
        <p className="mt-2 text-sm font-semibold">{T("Tree age", "చెట్టు వయస్సు")}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {[0, 2, 5, 8, 15].map((a) => <Chip key={a} active={age === a} onClick={() => setAge(a)}>{a === 0 ? T("< 1 yr", "< 1 సం") : a === 15 ? "15+" : `${a} ${T("yrs", "సం")}`}</Chip>)}
        </div>
        <p className="mt-3 text-xl font-bold">🌿 {tl(stage.label)}</p>
        <p className="mt-1 text-sm">{age >= 4 ? tl(MANGO_MONTHS[month].task) : T("Young trees: water regularly, protect from wind, remove early flowers so the tree builds a strong canopy.", "చిన్న చెట్లు: క్రమంగా నీరు, గాలి నుండి రక్షణ, తొలి పూత తీసేయండి.")}</p>
        {!mangoFarm && <Link to="/farm" className="mt-2 inline-block text-sm font-semibold text-primary">{T("Add your mango farm for personalised advice →", "వ్యక్తిగత సలహా కోసం మామిడి తోట జోడించండి →")}</Link>}
      </Card>
      {w && rainy && <Notice>{T("Rain in the forecast: during flowering, rain raises powdery mildew and anthracnose risk — inspect panicles after rain and drain basins.", "వర్ష సూచన: పూత దశలో బూడిద తెగులు, ఆంత్రాక్నోస్ ప్రమాదం — వర్షం తర్వాత పూత పరిశీలించండి, నీరు నిలవకుండా చూడండి.")}</Notice>}
      <Card>
        <Eyebrow>📅 {T("Month-wise calendar (bearing trees)", "నెలవారీ క్యాలెండర్ (కాపు చెట్లు)")}</Eyebrow>
        <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
          {MANGO_MONTHS.map((m) => (
            <button key={m.month} onClick={() => setSel(m.month)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${sel === m.month ? "bg-primary text-primary-foreground" : m.month === month ? "bg-primary/15" : "bg-muted"}`}>
              {(lang === "te" ? MONTHS_TE : MONTHS_EN)[m.month]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm">{tl(MANGO_MONTHS[sel].task)}</p>
      </Card>
      {GUIDE.map((g, i) => (
        <Card key={g.en} delay={i * 30}>
          <Eyebrow>{g.e} {T(g.en, g.te)}</Eyebrow>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{g.items.map(([en, te]) => <li key={en}>{T(en, te)}</li>)}</ul>
        </Card>
      ))}
      <Card>
        <Eyebrow>🥭 {T("Common AP varieties", "AP లో సాధారణ రకాలు")}</Eyebrow>
        <div className="mt-2 divide-y divide-border">
          {VARIETIES.map(([en, te, den, dte]) => <div key={en} className="py-2"><p className="text-sm font-bold">{T(en, te)}</p><p className="text-xs text-muted-foreground">{T(den, dte)}</p></div>)}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Link to="/scan" className="glass p-3 text-center text-sm font-semibold">🩺 {T("Check a leaf / fruit", "ఆకు / కాయ పరిశీలన")}</Link>
        <Link to="/assistant" className="glass p-3 text-center text-sm font-semibold">🤝 {T("Ask about my mangoes", "నా మామిడి గురించి అడగండి")}</Link>
      </div>
      <p className="text-center text-xs text-muted-foreground">{T("General guidance — confirm doses and sprays with your Horticulture Officer.", "సాధారణ సలహా — మోతాదులు, పిచికారీలు ఉద్యాన అధికారితో నిర్ధారించండి.")}</p>
    </div>
  );
}
