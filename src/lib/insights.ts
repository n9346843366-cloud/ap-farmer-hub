// Location-aware farming insights: combines the detected place with crop, soil,
// planting date, growth stage and the live weather for that same coordinates.
import { getCrop, stageLabel, type L, type Phase } from "./crops";
import type { CropPlan, Farm } from "./store";
import type { WeatherSnapshot } from "./weather-types";

export type Insight = { emoji: string; tone: "ok" | "warn" | "info"; text: L };

const place = (f?: Farm) => (f?.location ?? "").split(",")[0].trim() || "your area";

export function farmInsights({ farm, plan, weather }: { farm?: Farm; plan?: CropPlan; weather?: WeatherSnapshot | null }): Insight[] {
  const out: Insight[] = [];
  if (!farm) return out;
  const p = place(farm);
  const w = weather ?? null;
  const crop = getCrop(plan?.crop ?? farm.crop ?? "");
  const inputs = plan?.inputs ?? { treeAge: farm.treeAge, plantingDate: farm.plantingDate, soil: farm.soil, water: farm.water, area: farm.area };
  const stage: Phase | null = crop ? stageLabel(crop, inputs).phase : null;
  const today = w?.forecast[0];
  const wetNow = !!w && (w.kind === "rain" || w.kind === "thunder" || w.kind === "snow");
  const rainToday = today?.rain ?? w?.rain ?? 0;
  const hotToday = (today?.max ?? 0) >= 35 || (w?.temp ?? 0) >= 35;
  const dryNext5 = !!w && w.forecast.length > 0 && w.forecast.every((d) => d.rain < 30);

  if (!w) {
    out.push({ emoji: "📍", tone: "info", text: { en: `Add your location to get weather-based advice for ${p}.`, te: `${p} కోసం వాతావరణం ఆధారిత సలహా పొందడానికి మీ స్థానాన్ని జోడించండి.` } });
  }

  if (wetNow)
    out.push({ emoji: "🌧️", tone: "info", text: { en: `Rain is falling in ${p} right now — skip irrigation today, and wait for the soil to dry before walking the field or spraying.`, te: `ఇప్పుడు ${p}లో వర్షం పడుతోంది — ఈరోజు నీరు పెట్టవద్దు, నేల ఆరే వరకు పొలంలోకి వెళ్లకండి, పిచికారీ చేయకండి.` } });
  else if (rainToday >= 60)
    out.push({ emoji: "🌦️", tone: "info", text: { en: `Rain likely later today in ${p} — check soil moisture before irrigating and keep field drains clear.`, te: `${p}లో ఈరోజు తర్వాత వర్షం అవకాశం — నీరు పెట్టే ముందు నేల తేమ చూడండి, కాలువలు శుభ్రం చేయండి.` } });
  else if (rainToday < 20 && hotToday)
    out.push({ emoji: "🔥", tone: "warn", text: { en: `Hot and dry in ${p} (up to ${today?.max ?? Math.round(w?.temp ?? 0)}°C) — irrigate early morning or late evening and mulch to hold moisture.`, te: `${p}లో ఎండ, పొడి (గరిష్ఠం ${today?.max ?? Math.round(w?.temp ?? 0)}°C) — ఉదయం లేదా సాయంత్రం నీరు పెట్టండి, మల్చింగ్ వేయండి.` } });

  if (w && w.humidity >= 80)
    out.push({ emoji: "🦠", tone: "warn", text: { en: `Humidity is high (${w.humidity}%) in ${p} — leaf diseases spread faster. Inspect leaves and scan a photo if you see spots.`, te: `${p}లో తేమ ఎక్కువ (${w.humidity}%) — ఆకు వ్యాధులు వేగంగా వ్యాపిస్తాయి. ఆకులను పరిశీలించండి, మచ్చలు కనిపిస్తే ఫోటో స్కాన్ చేయండి.` } });
  if (w && w.wind >= 20)
    out.push({ emoji: "💨", tone: "warn", text: { en: `Wind is strong (${w.wind} km/h) — avoid spraying today, the spray will drift.`, te: `గాలి బలంగా ఉంది (${w.wind} కి.మీ/గం) — ఈరోజు పిచికారీ చేయవద్దు, మందు ఎగురుతుంది.` } });
  if (w && w.thunder >= 50)
    out.push({ emoji: "⛈️", tone: "warn", text: { en: `Thunderstorm possible over ${p} — finish field work early and do not stand in open ground with metal tools.`, te: `${p}పై ఉరుములతో కూడిన వర్షం అవకాశం — పొలం పనులు త్వరగా ముగించండి, లోహపు పనిముట్లతో బయట నిలవకండి.` } });
  if (w && w.cloudCover >= 80 && w.rain < 30)
    out.push({ emoji: "☁️", tone: "info", text: { en: "Thick cloud but little rain — hold fertilizer until soil moisture improves, otherwise it stays unused in the soil.", te: "మేఘాలు దట్టంగా, వర్షం తక్కువ — నేల తేమ బాగానే ఎరువులు వేయండి, లేకపోతే అవి అలాగే ఉండిపోతాయి." } });

  if (stage === "flowering") {
    if (wetNow || rainToday >= 60)
      out.push({ emoji: "🌸", tone: "warn", text: { en: `Flowering with rain in ${p}: hopper and anthracnose risk rises — check panicles and new shoots weekly, and never spray during rain.`, te: `${p}లో పూత దశలో వర్షం — తేనె మంచు పురుగు, ఆంత్రాకనోస ప్రమాదం ఎక్కువ. వారానికోసారి పూవిరుగులను చూడండి, వర్షంలో పిచికారీ చేయకండి.` } });
    else if (w && w.humidity >= 80)
      out.push({ emoji: "🌸", tone: "warn", text: { en: "Flowering with cool, humid weather: powdery mildew watch — look for white powder on flowers early.", te: "పూత దశలో చల్లని, తేమ వాతావరణం — బూడిద తెగులు జాగ్రత్త. పూతపై తెల్ల పొడి త్వరగా గమనించండి." } });
    else
      out.push({ emoji: "🌸", tone: "ok", text: { en: "Flowering stage: keep soil moisture steady, avoid transplanting or heavy tillage near the canopy.", te: "పూత దశ: నేల తేమ స్థిరంగా ఉంచండి, చెట్టు దగ్గర లోతైన దుక్కి చేయవద్దు." } });
  }
  if (stage === "fruit") {
    if (rainToday >= 70)
      out.push({ emoji: "🥭", tone: "warn", text: { en: "Fruit stage with heavy rain: splitting and fruit-drop risk — make sure water drains away quickly.", te: "కాయ ఎదగుదశలో భారీ వర్షం: కాయ పగిలి రాలే అవకాశం — నీరు త్వరగా బయటకు పోయేలా చూడండి." } });
    else if (hotToday)
      out.push({ emoji: "🥭", tone: "warn", text: { en: "Fruit stage with heat: keep irrigation steady — irregular watering causes fruit drop and sun-scald.", te: "కాయ ఎదగుదశలో ఎండ: నీరు క్రమంగా పెట్టండి — ఒక రోజు పెట్టి ఒక రోజు వదిలేస్తే కాయలు రాలి, ఎండకు కాలుస్తాయి." } });
    else
      out.push({ emoji: "🥭", tone: "ok", text: { en: "Fruit development: watch for fruit fly, collect fallen fruit, and keep mulch over the tree basin.", te: "కాయ ఎదగుదశ: పండు ఈగ జాగ్రత్త, రాలిన పండ్లు సేకరించండి, పాడులో మల్చింగ్ ఉంచండి." } });
  }
  if (stage === "harvest" && rainToday >= 50)
    out.push({ emoji: "🌾", tone: "warn", text: { en: `Harvest before the rain arrives in ${p}; dry and shade the produce — wet produce spoils fast.`, te: `${p}లో వర్షం రాకముందే కోత పూర్తి చేయండి; పంటను నీడలో ఆరబెట్టండి — తడిసిన పంట త్వరగా చెడిపోతుంది.` } });
  if ((stage === "growth" || stage === "nutrition") && rainToday >= 60)
    out.push({ emoji: "🌿", tone: "ok", text: { en: "Good soil moisture now — the best time for fertilizer. Split doses work better than one heavy dose.", te: "ఇప్పుడు నేలలో తేమ బాగుంది — ఎరువులకు తగ్ సమయం. ఒక్కసారిగా ఎక్కువ వేయకుండా, రెండు మూడు దఫాలుగా వేయండి." } });
  if (stage === "planting" && rainToday >= 40)
    out.push({ emoji: "🌱", tone: "ok", text: { en: `Rain expected in ${p} — prepare beds and sow just before it so seeds germinate evenly.`, te: `${p}లో వర్షం అంచనా — మడలు తయారు చేసి, వర్షం రాకముందే విత్తండి; మొలక సమంగా వస్తుంది.` } });

  if (farm.soil === "sandy")
    out.push({ emoji: "🏖️", tone: "info", text: { en: "Sandy soil dries quickly — split irrigation into shorter, more frequent doses.", te: "ఇసుక నేల త్వరగా ఆరిపోతుంది — తక్కువ నీరు, ఎక్కువసార్లు పెట్టండి." } });
  if (farm.soil === "black" || farm.soil === "clay")
    out.push({ emoji: "🪨", tone: "info", text: { en: "Heavy soil holds water — avoid over-irrigation and check that water drains within a day.", te: "బంక/రేగడి నేల నీరు పట్టి ఉంచుతుంది — ఎక్కువ నీరు పెట్టవద్దు, ఒక రోజలోపు నీరు బయటకు పోవాలి." } });
  if (farm.water === "low" && dryNext5)
    out.push({ emoji: "💧", tone: "warn", text: { en: "Rain-fed plot with no useful rain in the next 5 days — give priority to the critical stage (flowering or fruit fill).", te: "వర్షాధారిత పొలానికి రాబోయే 5 రోజులు వర్షం అంచనా లేదు — పూత, కాయ కట్టే దశకు నీరు ముందుగా పెట్టండి." } });
  if (!farm.soilTest)
    out.push({ emoji: "🧪", tone: "info", text: { en: `No soil test on record for ${p} — a soil test keeps fertilizer cost down and prevents over-use.`, te: `${p} కోసం నేల పరీక్ష ఫలితాలు లేవు — నేల పరీక్ష వల్ల ఎరువుల ఖర్చు తగ్గుతుంది, అధిక వినియోగం జరగదు.` } });
  if (w && w.uv >= 8)
    out.push({ emoji: "🧢", tone: "info", text: { en: "UV is high today — work early or late in the day and keep drinking water in the field.", te: "ఈరోజు ఎండ తీవ్రత ఎక్కువ — ఉదయం లేదా సాయంత్రం పని చేయండి, పొలంలో నీరు తాగుతూ ఉండండి." } });

  const rank = { warn: 0, ok: 1, info: 2 };
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]).slice(0, 6);
}
