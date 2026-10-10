// Crop knowledge base + plan generation. All guidance is general and indicative.
export type L = { en: string; te: string };
export type Lang = "en" | "te";
export const tr = (l: L | string, lang: Lang) => (typeof l === "string" ? l : l[lang] || l.en);

export type Water = "low" | "medium" | "high";
export type Soil = "red" | "black" | "alluvial" | "sandy" | "loamy" | "clay";

export const SOILS: { id: Soil; label: L }[] = [
  { id: "red", label: { en: "Red soil", te: "ఎర్ర నేల" } },
  { id: "black", label: { en: "Black soil", te: "నల్ల రేగడి నేల" } },
  { id: "alluvial", label: { en: "Alluvial soil", te: "ఒండ్రు నేల" } },
  { id: "sandy", label: { en: "Sandy soil", te: "ఇసుక నేల" } },
  { id: "loamy", label: { en: "Loamy soil", te: "గరప నేల" } },
  { id: "clay", label: { en: "Clay soil", te: "బంక నేల" } },
];
export const WATERS: { id: Water; label: L }[] = [
  { id: "low", label: { en: "Low (rain-fed)", te: "తక్కువ (వర్షాధారం)" } },
  { id: "medium", label: { en: "Medium (borewell/limited)", te: "మధ్యస్థం (బోరు)" } },
  { id: "high", label: { en: "High (canal/plenty)", te: "ఎక్కువ (కాలువ)" } },
];

export type Phase = "planting" | "growth" | "nutrition" | "irrigation" | "pest" | "flowering" | "fruit" | "harvest";
export const PHASE_META: Record<Phase, { emoji: string; label: L; color: string }> = {
  planting: { emoji: "🌱", label: { en: "Planting", te: "నాటడం" }, color: "bg-primary" },
  growth: { emoji: "🌿", label: { en: "Growth", te: "పెరుగుదల" }, color: "bg-chart-5" },
  nutrition: { emoji: "🧪", label: { en: "Nutrition", te: "పోషణ" }, color: "bg-chart-3" },
  irrigation: { emoji: "💧", label: { en: "Irrigation", te: "నీటి పారుదల" }, color: "bg-info" },
  pest: { emoji: "🐛", label: { en: "Pest check", te: "పురుగుల పరిశీలన" }, color: "bg-chart-4" },
  flowering: { emoji: "🌸", label: { en: "Flowering", te: "పూత" }, color: "bg-accent" },
  fruit: { emoji: "🥭", label: { en: "Fruit development", te: "కాయ ఎదుగుదల" }, color: "bg-warning" },
  harvest: { emoji: "🌾", label: { en: "Harvest", te: "కోత" }, color: "bg-accent-foreground" },
};

export type Stage = { phase: Phase; from: number; to: number }; // % of duration
export type Crop = {
  id: string;
  emoji: string;
  name: L;
  plantation?: boolean;
  seasons: L;
  sowMonths: number[]; // 0-11 suitable sowing months
  durationDays: number;
  water: Water;
  soils: Soil[];
  requirements: L;
  stages: Stage[];
  pests: { name: L; signs: L; prevent: L; risk: "low" | "medium" | "high" }[];
  nutrient: { n: number; p: number; k: number }; // general kg/acre reference band midpoint
};

const annualStages: Stage[] = [
  { phase: "planting", from: 0, to: 8 },
  { phase: "growth", from: 8, to: 45 },
  { phase: "nutrition", from: 15, to: 60 },
  { phase: "pest", from: 20, to: 85 },
  { phase: "flowering", from: 45, to: 65 },
  { phase: "fruit", from: 62, to: 90 },
  { phase: "harvest", from: 90, to: 100 },
];

const genericPests = [
  {
    name: { en: "Sucking pests (aphids, whiteflies)", te: "రసం పీల్చే పురుగులు" },
    signs: { en: "Curled or yellow leaves, sticky surface", te: "ఆకులు ముడుచుకోవడం, పసుపు రంగు, జిగట" },
    prevent: { en: "Yellow sticky traps, neem-based sprays, remove weeds", te: "పసుపు జిగురు అట్టలు, వేప ఆధారిత పిచికారీ" },
    risk: "medium" as const,
  },
];

export const CROPS: Crop[] = [
  {
    id: "rice", emoji: "🌾", name: { en: "Rice", te: "వరి" },
    seasons: { en: "Kharif (Jun–Jul), Rabi (Nov–Dec)", te: "ఖరీఫ్ (జూన్–జూలై), రబీ (నవం–డిసెం)" },
    sowMonths: [5, 6, 10, 11], durationDays: 130, water: "high", soils: ["clay", "alluvial", "loamy", "black"],
    requirements: { en: "Standing water in field, nursery 25 days before transplant", te: "పొలంలో నిల్వ నీరు, నాటుకు 25 రోజుల ముందు నారుమడి" },
    stages: annualStages, nutrient: { n: 48, p: 24, k: 16 },
    pests: [
      { name: { en: "Stem borer", te: "కాండం తొలిచే పురుగు" }, signs: { en: "Dead centre shoots, white empty heads", te: "మధ్య ఆకు ఎండిపోవడం, తెల్ల కంకులు" }, prevent: { en: "Pheromone traps, timely transplanting", te: "లింగాకర్షక బుట్టలు, సకాలంలో నాటు" }, risk: "medium" },
      { name: { en: "Brown plant hopper", te: "దోమ పోటు" }, signs: { en: "Circular drying patches (hopper burn)", te: "గుండ్రంగా ఎండిన మచ్చలు" }, prevent: { en: "Avoid excess nitrogen, keep alleys every 2m", te: "అధిక యూరియా వద్దు, ప్రతి 2మీ కాలిబాట" }, risk: "high" },
    ],
  },
  {
    id: "groundnut", emoji: "🥜", name: { en: "Groundnut", te: "వేరుశెనగ" },
    seasons: { en: "Kharif (Jun–Jul), Rabi (Nov–Dec)", te: "ఖరీఫ్, రబీ" },
    sowMonths: [5, 6, 10, 11], durationDays: 110, water: "medium", soils: ["red", "sandy", "loamy"],
    requirements: { en: "Well-drained light soil, gypsum at flowering helps pod filling", te: "నీరు నిలవని తేలిక నేల, పూత సమయంలో జిప్సం" },
    stages: annualStages, nutrient: { n: 8, p: 16, k: 20 },
    pests: [
      { name: { en: "Leaf miner", te: "ఆకు ముడత పురుగు" }, signs: { en: "Brown blotches, folded leaves", te: "గోధుమ మచ్చలు, ముడిచిన ఆకులు" }, prevent: { en: "Light traps, crop rotation", te: "దీపపు ఎరలు, పంట మార్పిడి" }, risk: "medium" },
      { name: { en: "Tikka leaf spot", te: "టిక్కా ఆకుమచ్చ" }, signs: { en: "Dark round spots on leaves", te: "ఆకులపై ముదురు గుండ్రని మచ్చలు" }, prevent: { en: "Clean seed, remove crop residue", te: "శుద్ధి చేసిన విత్తనం, పంట అవశేషాలు తొలగించడం" }, risk: "medium" },
    ],
  },
  {
    id: "maize", emoji: "🌽", name: { en: "Maize", te: "మొక్కజొన్న" },
    seasons: { en: "Kharif, Rabi", te: "ఖరీఫ్, రబీ" }, sowMonths: [5, 6, 9, 10], durationDays: 105, water: "medium",
    soils: ["loamy", "alluvial", "red", "black"], requirements: { en: "Good drainage, critical water at tasseling", te: "మంచి నీటి పారుదల, పుష్పించే సమయంలో నీరు ముఖ్యం" },
    stages: annualStages, nutrient: { n: 60, p: 24, k: 16 },
    pests: [{ name: { en: "Fall armyworm", te: "కత్తెర పురుగు" }, signs: { en: "Ragged holes in whorl leaves, sawdust-like waste", te: "సుడి ఆకుల్లో రంధ్రాలు, రంపపు పొట్టు లాంటి విసర్జన" }, prevent: { en: "Scout weekly, pheromone traps, sand+lime in whorl", te: "వారానికోసారి పరిశీలన, లింగాకర్షక బుట్టలు" }, risk: "high" }],
  },
  {
    id: "bengalgram", emoji: "🫘", name: { en: "Bengal Gram", te: "శనగ" },
    seasons: { en: "Rabi (Oct–Nov)", te: "రబీ (అక్టో–నవం)" }, sowMonths: [9, 10], durationDays: 100, water: "low",
    soils: ["black", "loamy", "clay"], requirements: { en: "Grows on stored soil moisture, cool weather", te: "నేలలో నిల్వ తేమతో, చల్లని వాతావరణం" },
    stages: annualStages, nutrient: { n: 8, p: 20, k: 8 },
    pests: [{ name: { en: "Pod borer", te: "కాయ తొలిచే పురుగు" }, signs: { en: "Holes in pods, larvae inside", te: "కాయలకు రంధ్రాలు" }, prevent: { en: "Bird perches, pheromone traps", te: "పక్షి స్థావరాలు, లింగాకర్షక బుట్టలు" }, risk: "medium" }],
  },
  {
    id: "redgram", emoji: "🌿", name: { en: "Red Gram", te: "కంది" },
    seasons: { en: "Kharif (Jun–Jul)", te: "ఖరీఫ్ (జూన్–జూలై)" }, sowMonths: [5, 6], durationDays: 170, water: "low",
    soils: ["red", "black", "loamy"], requirements: { en: "Drought tolerant, good as intercrop", te: "కరువును తట్టుకుంటుంది, అంతర పంటగా మంచిది" },
    stages: annualStages, nutrient: { n: 8, p: 20, k: 0 }, pests: genericPests,
  },
  {
    id: "sunflower", emoji: "🌻", name: { en: "Sunflower", te: "పొద్దుతిరుగుడు" },
    seasons: { en: "Rabi, Summer", te: "రబీ, వేసవి" }, sowMonths: [9, 10, 0, 1], durationDays: 95, water: "medium",
    soils: ["black", "red", "loamy", "alluvial"], requirements: { en: "Sunny, bee activity helps seed set", te: "ఎండ, తేనెటీగలు గింజ కట్టడానికి సహాయం" },
    stages: annualStages, nutrient: { n: 24, p: 36, k: 12 }, pests: genericPests,
  },
  {
    id: "tomato", emoji: "🍅", name: { en: "Tomato", te: "టమాట" },
    seasons: { en: "Year-round (avoid peak summer)", te: "సంవత్సరమంతా (ఎండాకాలం తప్ప)" }, sowMonths: [5, 6, 7, 8, 9, 10, 11, 0], durationDays: 120, water: "medium",
    soils: ["loamy", "red", "sandy", "alluvial"], requirements: { en: "Staking, mulching, drip irrigation preferred", te: "కర్రల ఆధారం, మల్చింగ్, బిందు సేద్యం" },
    stages: annualStages, nutrient: { n: 48, p: 24, k: 24 },
    pests: [{ name: { en: "Fruit borer", te: "కాయ తొలిచే పురుగు" }, signs: { en: "Holes in fruits", te: "కాయలకు రంధ్రాలు" }, prevent: { en: "Marigold trap crop, pheromone traps", te: "బంతి ఎర పంట, లింగాకర్షక బుట్టలు" }, risk: "medium" }],
  },
  {
    id: "chilli", emoji: "🌶️", name: { en: "Chilli", te: "మిరప" },
    seasons: { en: "Kharif (Jul–Aug), Rabi", te: "ఖరీఫ్, రబీ" }, sowMonths: [6, 7, 9, 10], durationDays: 160, water: "medium",
    soils: ["black", "red", "loamy"], requirements: { en: "Raised beds, avoid waterlogging", te: "ఎత్తైన మడులు, నీరు నిలవకుండా" },
    stages: annualStages, nutrient: { n: 48, p: 24, k: 24 },
    pests: [{ name: { en: "Thrips & mites", te: "తామర పురుగు, నల్లి" }, signs: { en: "Upward/downward leaf curl", te: "ఆకులు పైకి/కిందికి ముడత" }, prevent: { en: "Blue sticky traps, border crop of maize", te: "నీలి జిగురు అట్టలు, మొక్కజొన్న రక్షణ పంట" }, risk: "high" }],
  },
  {
    id: "vegetables", emoji: "🥕", name: { en: "Vegetables", te: "కూరగాయలు" },
    seasons: { en: "Year-round, depends on vegetable", te: "కూరగాయను బట్టి సంవత్సరమంతా" }, sowMonths: [0, 1, 5, 6, 7, 8, 9, 10, 11], durationDays: 75, water: "medium",
    soils: ["loamy", "alluvial", "red", "sandy"], requirements: { en: "Regular watering, compost, quick cash crop", te: "క్రమమైన నీరు, కంపోస్టు, త్వరిత ఆదాయం" },
    stages: annualStages, nutrient: { n: 40, p: 20, k: 20 }, pests: genericPests,
  },
  {
    id: "mango", emoji: "🥭", name: { en: "Mango", te: "మామిడి" }, plantation: true,
    seasons: { en: "Plant Jul–Sep (monsoon)", te: "జూలై–సెప్టెంబర్‌లో నాటాలి" }, sowMonths: [6, 7, 8], durationDays: 365 * 4, water: "medium",
    soils: ["red", "loamy", "alluvial", "sandy"], requirements: { en: "Deep well-drained soil, 1m pits, sunny site", te: "లోతైన నీరు నిలవని నేల, 1మీ గుంతలు, ఎండ ప్రదేశం" },
    stages: [], nutrient: { n: 0, p: 0, k: 0 },
    pests: [
      { name: { en: "Mango hopper", te: "తేనె మంచు పురుగు" }, signs: { en: "Sticky honeydew, black sooty mould, flower drop", te: "జిగట, నల్ల బూజు, పూత రాలడం" }, prevent: { en: "Keep canopy open by pruning; check panicles weekly during flowering", te: "కొమ్మ కత్తిరింపుతో గాలి తగిలేలా; పూత సమయంలో వారానికోసారి పరిశీలన" }, risk: "high" },
      { name: { en: "Powdery mildew", te: "బూడిద తెగులు" }, signs: { en: "White powder on flowers and young fruits", te: "పూత, పిందెలపై తెల్ల పొడి" }, prevent: { en: "Watch during cool, cloudy flowering weather; seek local advice early", te: "చల్లని మబ్బు వాతావరణంలో జాగ్రత్త; ముందుగానే నిపుణుల సలహా" }, risk: "medium" },
      { name: { en: "Fruit fly", te: "పండు ఈగ" }, signs: { en: "Small punctures, rotting fruit", te: "పండ్లపై చిన్న రంధ్రాలు, కుళ్ళడం" }, prevent: { en: "Collect fallen fruit, use fruit-fly traps", te: "రాలిన పండ్లు సేకరించండి, ఈగ ఎరలు" }, risk: "medium" },
      { name: { en: "Anthracnose", te: "ఆంత్రాక్నోస్" }, signs: { en: "Black spots on leaves, flowers, fruit", te: "ఆకులు, పూత, కాయలపై నల్ల మచ్చలు" }, prevent: { en: "Prune dead wood, avoid overhead watering", te: "ఎండు కొమ్మలు తొలగించండి" }, risk: "medium" },
    ],
  },
  {
    id: "banana", emoji: "🍌", name: { en: "Banana", te: "అరటి" }, plantation: true,
    seasons: { en: "Jun–Jul or Oct–Nov", te: "జూన్–జూలై లేదా అక్టో–నవం" }, sowMonths: [5, 6, 9, 10], durationDays: 330, water: "high",
    soils: ["loamy", "alluvial", "clay"], requirements: { en: "Plenty of water and organic matter, wind protection", te: "ఎక్కువ నీరు, సేంద్రియ ఎరువు, గాలి రక్షణ" },
    stages: annualStages, nutrient: { n: 80, p: 30, k: 120 }, pests: [{ name: { en: "Rhizome weevil", te: "దుంప పురుగు" }, signs: { en: "Wilting, holes at base", te: "వాడిపోవడం, మొదలులో రంధ్రాలు" }, prevent: { en: "Healthy suckers, field sanitation", te: "ఆరోగ్యకరమైన పిలకలు, పొలం శుభ్రత" }, risk: "medium" }],
  },
  {
    id: "coconut", emoji: "🥥", name: { en: "Coconut", te: "కొబ్బరి" }, plantation: true,
    seasons: { en: "Plant with monsoon (Jun–Sep)", te: "వర్షాకాలంలో నాటాలి" }, sowMonths: [5, 6, 7, 8], durationDays: 365 * 5, water: "high",
    soils: ["sandy", "loamy", "alluvial", "red"], requirements: { en: "Spacing 7.5m, basin irrigation, long-term crop", te: "7.5మీ దూరం, పాదుల్లో నీరు" },
    stages: annualStages, nutrient: { n: 0, p: 0, k: 0 }, pests: [{ name: { en: "Rhinoceros beetle", te: "కొమ్ము పురుగు" }, signs: { en: "V-shaped cuts on fronds", te: "ఆకులపై V ఆకార కోతలు" }, prevent: { en: "Remove manure pits breeding sites", te: "పెంటకుప్పలు శుభ్రంగా ఉంచండి" }, risk: "medium" }],
  },
  {
    id: "citrus", emoji: "🍊", name: { en: "Citrus (Sweet orange/Lemon)", te: "బత్తాయి/నిమ్మ" }, plantation: true,
    seasons: { en: "Plant Jul–Sep", te: "జూలై–సెప్టెంబర్" }, sowMonths: [6, 7, 8], durationDays: 365 * 3, water: "medium",
    soils: ["red", "loamy", "sandy"], requirements: { en: "Well-drained soil, avoid water at trunk", te: "నీరు నిలవని నేల, కాండానికి నీరు తగలకుండా" },
    stages: annualStages, nutrient: { n: 0, p: 0, k: 0 }, pests: [{ name: { en: "Citrus psylla", te: "సిల్లా పురుగు" }, signs: { en: "Curling new shoots", te: "కొత్త చిగుళ్ళు ముడత" }, prevent: { en: "Monitor new flush", te: "కొత్త చిగుళ్ళు పరిశీలించండి" }, risk: "medium" }],
  },
];

export const getCrop = (id: string) => CROPS.find((c) => c.id === id);

/* ---------- Mango year-round calendar (South India / AP) ---------- */
export const MANGO_MONTHS: { month: number; phase: Phase; task: L }[] = [
  { month: 0, phase: "flowering", task: { en: "Flowering: check panicles for hoppers & powdery mildew", te: "పూత: తేనె మంచు పురుగు, బూడిద తెగులు పరిశీలన" } },
  { month: 1, phase: "fruit", task: { en: "Fruit set: light, regular irrigation starts", te: "పిందె: తేలికగా క్రమంగా నీరు" } },
  { month: 2, phase: "fruit", task: { en: "Fruit growth: irrigate every 10–15 days", te: "కాయ ఎదుగుదల: 10–15 రోజులకోసారి నీరు" } },
  { month: 3, phase: "fruit", task: { en: "Fruit development: watch fruit fly, keep mulch", te: "కాయ ఎదుగుదల: పండు ఈగ జాగ్రత్త, మల్చింగ్" } },
  { month: 4, phase: "harvest", task: { en: "Harvest mature fruit (Banganapalli peak)", te: "పక్వమైన కాయలు కోత (బంగినపల్లి)" } },
  { month: 5, phase: "harvest", task: { en: "Late harvest, then clean orchard", te: "చివరి కోత, తోట శుభ్రత" } },
  { month: 6, phase: "nutrition", task: { en: "Post-harvest nutrition with first rains (soil-test based)", te: "తొలకరి వర్షాలతో ఎరువులు (నేల పరీక్ష ఆధారంగా)" } },
  { month: 7, phase: "growth", task: { en: "Pruning & canopy opening; new plantings", te: "కొమ్మ కత్తిరింపు; కొత్త మొక్కలు నాటడం" } },
  { month: 8, phase: "growth", task: { en: "Vegetative flush; weed control in basins", te: "కొత్త చిగుళ్ళు; పాదుల్లో కలుపు నివారణ" } },
  { month: 9, phase: "irrigation", task: { en: "Reduce irrigation for flower induction (bearing trees)", te: "పూత రావడానికి నీరు తగ్గించండి (కాపు చెట్లు)" } },
  { month: 10, phase: "pest", task: { en: "Pre-flowering: clean trunks, check for stem borer", te: "పూతకు ముందు: కాండం శుభ్రత, పురుగు పరిశీలన" } },
  { month: 11, phase: "flowering", task: { en: "Bud break: keep weekly pest watch, avoid stress", te: "మొగ్గ దశ: వారపు పరిశీలన" } },
];

export function mangoStage(treeAge: number, month: number) {
  if (treeAge < 1) return { key: "establish", label: { en: "Establishment (young plant)", te: "స్థాపన దశ (చిన్న మొక్క)" }, phase: "growth" as Phase };
  if (treeAge < 4)
    return { key: "juvenile", label: { en: "Juvenile – building canopy", te: "బాల్య దశ – కొమ్మల పెంపు" }, phase: "growth" as Phase };
  const m = MANGO_MONTHS[month];
  const labels: Record<Phase, L> = {
    flowering: { en: "Flowering", te: "పూత దశ" },
    fruit: { en: "Fruit development", te: "కాయ ఎదుగుదల" },
    harvest: { en: "Harvest", te: "కోత దశ" },
    nutrition: { en: "Post-harvest nutrition", te: "కోత తర్వాత పోషణ" },
    growth: { en: "Vegetative growth", te: "పెరుగుదల దశ" },
    irrigation: { en: "Flower induction (pre-flowering)", te: "పూత ప్రేరణ దశ" },
    pest: { en: "Pre-flowering", te: "పూతకు ముందు దశ" },
    planting: { en: "Planting", te: "నాటడం" },
  };
  return { key: m.phase, label: labels[m.phase], phase: m.phase };
}

/* ---------- Plan generation ---------- */
export type PlanInputs = {
  location?: string;
  area?: number;
  plantingDate?: string;
  soil?: Soil;
  water?: Water;
  variety?: string;
  treeAge?: number;
  soilTest?: { n?: number; p?: number; k?: number; ph?: number };
};

export type TaskSeed = { title: L; type: Phase | "weather"; offsetDays: number };

const dayMs = 86400000;
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * dayMs);
export const iso = (d: Date) => d.toISOString().slice(0, 10);

export function annualProgress(crop: Crop, plantingDate?: string, today = new Date()) {
  if (!plantingDate) return { pct: 0, day: 0, started: false };
  const day = Math.floor((today.getTime() - new Date(plantingDate).getTime()) / dayMs);
  const pct = Math.max(0, Math.min(100, (day / crop.durationDays) * 100));
  return { pct, day, started: day >= 0 };
}

export function currentPhase(crop: Crop, pct: number): Phase {
  const main: Phase[] = ["planting", "growth", "flowering", "fruit", "harvest"];
  const st = crop.stages.filter((s) => main.includes(s.phase));
  const found = [...st].reverse().find((s) => pct >= s.from);
  return found?.phase ?? "planting";
}

export function stageLabel(crop: Crop, inputs: PlanInputs, today = new Date()): { label: L; phase: Phase; pct: number } {
  if (crop.id === "mango") {
    const s = mangoStage(inputs.treeAge ?? 0, today.getMonth());
    return { label: s.label, phase: s.phase, pct: ((today.getMonth() + 1) / 12) * 100 };
  }
  const { pct, started } = annualProgress(crop, inputs.plantingDate, today);
  if (!started) return { label: { en: "Before planting", te: "నాటడానికి ముందు" }, phase: "planting", pct: 0 };
  const phase = currentPhase(crop, pct);
  return { label: PHASE_META[phase].label, phase, pct };
}

export function generateTasks(crop: Crop, inputs: PlanInputs, today = new Date()): TaskSeed[] {
  const base: TaskSeed[] = [
    { title: { en: "Check soil moisture", te: "నేల తేమ పరిశీలించండి" }, type: "irrigation", offsetDays: 0 },
    { title: { en: "Inspect leaves for pests", te: "ఆకులపై పురుగుల కోసం చూడండి" }, type: "pest", offsetDays: 0 },
    { title: { en: "Check today's weather", te: "నేటి వాతావరణం చూడండి" }, type: "weather", offsetDays: 0 },
  ];
  if (crop.id === "mango") {
    const m = today.getMonth();
    const age = inputs.treeAge ?? 0;
    base.push({ title: MANGO_MONTHS[m].task, type: MANGO_MONTHS[m].phase, offsetDays: 0 });
    base.push({ title: { en: "Irrigation check", te: "నీటి పరిశీలన" }, type: "irrigation", offsetDays: 3 });
    base.push({ title: { en: "Weekly pest & disease inspection", te: "వారపు పురుగు, తెగులు పరిశీలన" }, type: "pest", offsetDays: 7 });
    base.push({ title: MANGO_MONTHS[(m + 1) % 12].task, type: MANGO_MONTHS[(m + 1) % 12].phase, offsetDays: 30 });
    if (age < 4)
      base.push({ title: { en: "Remove early flowers on young trees", te: "చిన్న చెట్లపై పూత తొలగించండి" }, type: "flowering", offsetDays: 14 });
    base.push({ title: { en: "Follow recommended nutrition plan", te: "సూచించిన పోషణ ప్రణాళిక పాటించండి" }, type: "nutrition", offsetDays: 10 });
    return base;
  }
  const start = inputs.plantingDate ? new Date(inputs.plantingDate) : today;
  const offsetFromToday = (pct: number) =>
    Math.round((start.getTime() + (pct / 100) * crop.durationDays * dayMs - today.getTime()) / dayMs);
  const seeds: TaskSeed[] = [
    { title: { en: "Prepare land & apply compost", te: "భూమి తయారీ, కంపోస్టు" }, type: "planting", offsetDays: offsetFromToday(-3) },
    { title: { en: "Sowing / planting day", te: "విత్తడం / నాటే రోజు" }, type: "planting", offsetDays: offsetFromToday(0) },
    { title: { en: "First nutrition dose (as per soil test)", te: "మొదటి ఎరువు (నేల పరీక్ష ప్రకారం)" }, type: "nutrition", offsetDays: offsetFromToday(15) },
    { title: { en: "Weeding", te: "కలుపు తీయడం" }, type: "growth", offsetDays: offsetFromToday(25) },
    { title: { en: "Second nutrition dose", te: "రెండవ ఎరువు" }, type: "nutrition", offsetDays: offsetFromToday(45) },
    { title: { en: "Flowering care – keep moisture steady", te: "పూత జాగ్రత్త – తేమ స్థిరంగా" }, type: "flowering", offsetDays: offsetFromToday(50) },
    { title: { en: "Harvest readiness check", te: "కోతకు సిద్ధత పరిశీలన" }, type: "harvest", offsetDays: offsetFromToday(92) },
  ];
  return [...base, ...seeds.filter((s) => s.offsetDays >= 0)];
}

export function harvestWindow(crop: Crop, inputs: PlanInputs, today = new Date()): L {
  if (crop.id === "mango") {
    const age = inputs.treeAge ?? 0;
    if (age < 4) {
      const yrs = Math.max(1, 4 - age);
      return { en: `First commercial harvest likely in ~${yrs} year(s), Apr–Jun`, te: `సుమారు ${yrs} సంవత్సరాల్లో మొదటి కాపు, ఏప్రిల్–జూన్` };
    }
    const y = today.getMonth() > 5 ? today.getFullYear() + 1 : today.getFullYear();
    return { en: `Approx. April – June ${y}`, te: `సుమారు ఏప్రిల్ – జూన్ ${y}` };
  }
  const start = inputs.plantingDate ? new Date(inputs.plantingDate) : today;
  const a = addDays(start, Math.round(crop.durationDays * 0.92));
  const b = addDays(start, Math.round(crop.durationDays * 1.05));
  const f = (d: Date, l: Lang) => d.toLocaleDateString(l === "te" ? "te-IN" : "en-IN", { day: "numeric", month: "short" });
  return { en: `Approx. ${f(a, "en")} – ${f(b, "en")}`, te: `సుమారు ${f(a, "te")} – ${f(b, "te")}` };
}

/* ---------- Recommendation ---------- */
export function recommend(opts: { soil?: Soil; water?: Water; month: number; maxDays?: number }) {
  const wRank = { low: 0, medium: 1, high: 2 };
  return CROPS.map((c) => {
    let score = 0;
    const reasons: L[] = [];
    if (c.sowMonths.includes(opts.month)) { score += 3; reasons.push({ en: "Good sowing time", te: "విత్తడానికి సరైన సమయం" }); }
    if (opts.soil && c.soils.includes(opts.soil)) { score += 2; reasons.push({ en: "Suits your soil", te: "మీ నేలకు సరిపోతుంది" }); }
    if (opts.water) {
      if (wRank[c.water] <= wRank[opts.water]) { score += 2; reasons.push({ en: "Water is enough", te: "నీరు సరిపోతుంది" }); }
      else score -= 2;
    }
    if (opts.maxDays && c.durationDays > opts.maxDays) score -= 3;
    return { crop: c, score, reasons };
  })
    .filter((r) => r.score > 1)
    .sort((a, b) => b.score - a.score);
}

/* ---------- Fertilizer ---------- */
export type Level = "low" | "medium" | "high" | "unknown";
export function soilLevels(t?: { n?: number; p?: number; k?: number; ph?: number }) {
  const lv = (v: number | undefined, lo: number, hi: number): Level =>
    v === undefined || Number.isNaN(v) ? "unknown" : v < lo ? "low" : v > hi ? "high" : "medium";
  // Soil-test thresholds commonly used in India (kg/ha available nutrient)
  return { n: lv(t?.n, 280, 560), p: lv(t?.p, 10, 25), k: lv(t?.k, 110, 280), ph: t?.ph };
}
export const LEVEL_FACTOR: Record<Level, number> = { low: 1.25, medium: 1, high: 0.75, unknown: 1 };

export function mangoNutrientPerTree(age: number) {
  // Widely published general guidance: per tree per year, scaled by age up to 10 yrs (grams of nutrient)
  const a = Math.min(Math.max(age, 1), 10);
  return { n: 100 * a, p: 50 * a, k: 100 * a, fym: 10 * a };
}

export const MANGO_SPACING = {
  regular: { en: "10m × 10m (≈40 trees/acre) for tall varieties", te: "10మీ × 10మీ (ఎకరాకు ≈40 చెట్లు)" },
  hd: { en: "5m × 5m high-density (≈160 trees/acre) with pruning", te: "5మీ × 5మీ అధిక సాంద్రత (ఎకరాకు ≈160) కత్తిరింపుతో" },
};

export const MANGO_VARIETIES = ["Banganapalli", "Totapuri", "Neelam", "Alphonso", "Kesar", "Rasalu", "Mallika", "Other"];
