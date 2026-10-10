// Crop image analysis service. The UI only calls analyzeCrop(); swap the provider here
// to connect a real vision model (the "ai" provider already calls /api/scan).
import type { Lang } from "./crops";
import type { ScanResult } from "./store";

export type DemoCondition = "healthy" | "leafspot" | "mildew" | "infection" | "nutrient" | "pest";
type Txt = { en: string; te: string };
type Def = { emoji: string; label: Txt; confidence: number; risk: "low" | "medium" | "high"; healthy?: boolean;
  symptoms: Txt; causes: Txt; actions: Txt; monitor: Txt; expert: Txt };

export const DEMO_CONDITIONS: Record<DemoCondition, Def> = {
  healthy: { emoji: "✅", label: { en: "Looks healthy", te: "ఆరోగ్యంగా ఉంది" }, confidence: 91, risk: "low", healthy: true,
    symptoms: { en: "Leaf colour is even green with no clear spots, holes or powder.", te: "ఆకు రంగు సమంగా పచ్చగా ఉంది, మచ్చలు లేదా రంధ్రాలు కనిపించడం లేదు." },
    causes: { en: "No visible problem. Good care and weather are helping.", te: "కనిపించే సమస్య లేదు. మంచి సంరక్షణ వల్ల పంట బాగుంది." },
    actions: { en: "Continue regular watering and nutrition. Keep the field clean.", te: "సాధారణంగా నీరు, ఎరువులు కొనసాగించండి. పొలం శుభ్రంగా ఉంచండి." },
    monitor: { en: "Check new leaves weekly for spots, curling or insects.", te: "కొత్త ఆకులను వారానికోసారి మచ్చలు, ముడత, పురుగుల కోసం చూడండి." },
    expert: { en: "Not needed now. Ask an expert if new symptoms appear.", te: "ఇప్పుడు అవసరం లేదు. కొత్త లక్షణాలు కనిపిస్తే నిపుణుడిని అడగండి." } },
  leafspot: { emoji: "🟤", label: { en: "Leaf spot", te: "ఆకు మచ్చ తెగులు" }, confidence: 87, risk: "medium",
    symptoms: { en: "Small brown or black spots on leaves, sometimes with a yellow ring.", te: "ఆకులపై చిన్న గోధుమ/నల్ల మచ్చలు, కొన్నిసార్లు చుట్టూ పసుపు వలయం." },
    causes: { en: "Usually a fungus that spreads in humid, wet weather and through splashing water.", te: "సాధారణంగా తేమ వాతావరణంలో వ్యాపించే శిలీంధ్రం వల్ల వస్తుంది." },
    actions: { en: "Remove badly affected leaves and destroy them away from the field. Avoid wetting leaves while watering. Improve air flow by light pruning.", te: "ఎక్కువగా దెబ్బతిన్న ఆకులను తీసి పొలానికి దూరంగా నాశనం చేయండి. ఆకులపై నీరు పడకుండా చూడండి. కొంచెం కత్తిరింపుతో గాలి ప్రసరణ పెంచండి." },
    monitor: { en: "Watch if spots grow, join together, or spread to flowers and fruit.", te: "మచ్చలు పెద్దవుతున్నాయా, కలుస్తున్నాయా, పూత/కాయలకు వ్యాపిస్తున్నాయా గమనించండి." },
    expert: { en: "If more than a quarter of leaves are affected, or spots reach flowers or fruit, contact an expert before using any spray.", te: "నాలుగో వంతు కంటే ఎక్కువ ఆకులు దెబ్బతిన్నా లేదా పూత/కాయలకు చేరినా, ఏ మందు వాడే ముందైనా నిపుణుడిని సంప్రదించండి." } },
  mildew: { emoji: "⚪", label: { en: "Powdery mildew", te: "బూడిద తెగులు" }, confidence: 84, risk: "medium",
    symptoms: { en: "White or grey powder on leaves, flowers or young shoots.", te: "ఆకులు, పూత లేదా లేత చిగుళ్లపై తెల్లని/బూడిద పొడి." },
    causes: { en: "A fungus favoured by cool nights, dry days and dense canopy.", te: "చల్లని రాత్రులు, పొడి పగలు, దట్టమైన కొమ్మల వల్ల పెరిగే శిలీంధ్రం." },
    actions: { en: "Remove heavily covered shoots. Open up the canopy for sunlight. Avoid excess nitrogen fertilizer.", te: "ఎక్కువ పొడి ఉన్న చిగుళ్లను తొలగించండి. ఎండ తగిలేలా కొమ్మలు సరిచేయండి. నత్రజని ఎరువు అతిగా వేయవద్దు." },
    monitor: { en: "Check flower bunches closely — mildew can cause flower and young fruit drop.", te: "పూత గుత్తులను జాగ్రత్తగా చూడండి — పూత, పిందె రాలిపోవచ్చు." },
    expert: { en: "During flowering, contact an expert quickly for safe, approved control options.", te: "పూత సమయంలో సురక్షిత నియంత్రణ కోసం వెంటనే నిపుణుడిని సంప్రదించండి." } },
  infection: { emoji: "🦠", label: { en: "Possible bacterial/fungal infection", te: "బ్యాక్టీరియా/శిలీంధ్ర సంక్రమణ అవకాశం" }, confidence: 72, risk: "high",
    symptoms: { en: "Dark, water-soaked or irregular patches; leaves may dry from edges.", te: "నీటిలో నానినట్లు ముదురు మచ్చలు; అంచుల నుంచి ఆకులు ఎండిపోవచ్చు." },
    causes: { en: "Germs entering through wounds, spread by rain, tools or infected plant parts.", te: "గాయాల ద్వారా క్రిములు ప్రవేశించి వర్షం, పనిముట్లు ద్వారా వ్యాపిస్తాయి." },
    actions: { en: "Separate and remove infected parts. Clean pruning tools after each cut. Avoid working in the field when plants are wet.", te: "సోకిన భాగాలను తొలగించండి. ప్రతి కత్తిరింపు తర్వాత పనిముట్లు శుభ్రం చేయండి. మొక్కలు తడిగా ఉన్నప్పుడు పని చేయవద్దు." },
    monitor: { en: "Watch stems, branches and fruit for cracks, oozing or spreading dark areas.", te: "కాండం, కొమ్మలు, కాయలపై పగుళ్లు, స్రావం, ముదురు మచ్చల వ్యాప్తి గమనించండి." },
    expert: { en: "High risk — get an expert or local agriculture officer to confirm before any treatment.", te: "ఎక్కువ ప్రమాదం — ఏ చికిత్సకైనా ముందు నిపుణుడు లేదా వ్యవసాయ అధికారితో నిర్ధారించుకోండి." } },
  nutrient: { emoji: "🟡", label: { en: "Possible nutrient deficiency", te: "పోషక లోపం అవకాశం" }, confidence: 78, risk: "low",
    symptoms: { en: "Yellowing between veins, pale new leaves or burnt leaf edges.", te: "నరాల మధ్య పసుపు రంగు, లేత కొత్త ఆకులు లేదా కాలిన ఆకు అంచులు." },
    causes: { en: "Low nitrogen, potassium, zinc or iron in soil, or wrong soil pH.", te: "నేలలో నత్రజని, పొటాష్, జింక్ లేదా ఇనుము తక్కువగా ఉండటం, లేదా pH సరిగ్గా లేకపోవడం." },
    actions: { en: "Do a soil test before adding fertilizer. Add well-rotted compost. Water regularly so roots can take up nutrients.", te: "ఎరువు వేసే ముందు నేల పరీక్ష చేయించండి. బాగా కుళ్లిన కంపోస్ట్ వేయండి. క్రమంగా నీరు పెట్టండి." },
    monitor: { en: "See if yellowing is on old leaves or new leaves — this helps find which nutrient is low.", te: "పసుపు రంగు పాత ఆకులపైనా, కొత్త ఆకులపైనా అని గమనించండి — ఏ పోషకం తక్కువో తెలుస్తుంది." },
    expert: { en: "If yellowing continues after 3–4 weeks of care, ask an expert with your soil test report.", te: "3–4 వారాల తర్వాత కూడా పసుపు తగ్గకపోతే, నేల పరీక్ష నివేదికతో నిపుణుడిని అడగండి." } },
  pest: { emoji: "🐛", label: { en: "Pest damage", te: "పురుగు నష్టం" }, confidence: 81, risk: "medium",
    symptoms: { en: "Holes, chewed edges, curling, sticky honeydew or tiny insects under leaves.", te: "రంధ్రాలు, కొరికిన అంచులు, ముడత, జిగట తేనె మంచు లేదా ఆకుల కింద చిన్న పురుగులు." },
    causes: { en: "Sucking or chewing insects such as hoppers, caterpillars or mites.", te: "తేనె మంచు పురుగులు, గొంగళి పురుగులు, నల్లి వంటి రసం పీల్చే/కొరికే పురుగులు." },
    actions: { en: "Hand-pick and destroy visible insects. Remove weeds around plants. Use yellow sticky traps to monitor.", te: "కనిపించే పురుగులను ఏరి నాశనం చేయండి. మొక్కల చుట్టూ కలుపు తీయండి. పసుపు జిగురు అట్టలతో గమనించండి." },
    monitor: { en: "Count insects on 5–10 plants every week to see if numbers are rising.", te: "ప్రతి వారం 5–10 మొక్కలపై పురుగులను లెక్కించి పెరుగుతున్నాయో చూడండి." },
    expert: { en: "If damage spreads fast or reaches flowers, ask an expert. Never mix or overuse pesticides; follow label directions.", te: "నష్టం వేగంగా వ్యాపిస్తే లేదా పూతకు చేరితే నిపుణుడిని అడగండి. పురుగుమందులు కలపవద్దు, అతిగా వాడవద్దు; లేబుల్ సూచనలు పాటించండి." } },
};

const ORDER: DemoCondition[] = ["leafspot", "healthy", "mildew", "pest", "nutrient", "infection"];

/** Deterministic: the same photo always gives the same demo result. */
export function demoConditionFor(image: string): DemoCondition {
  let h = 0;
  for (let i = 0; i < image.length; i += 97) h = (h * 31 + image.charCodeAt(i)) >>> 0;
  return ORDER[h % ORDER.length];
}

export function demoResult(c: DemoCondition, lang: Lang): ScanResult {
  const d = DEMO_CONDITIONS[c];
  return {
    issue: d.label[lang], confidence: d.confidence, risk: d.risk, healthy: d.healthy,
    symptoms: d.symptoms[lang], causes: d.causes[lang], precautions: d.actions[lang], nextSteps: d.actions[lang],
    monitor: d.monitor[lang], expertWhen: d.expert[lang], source: "demo",
  };
}

export type AnalyzeOpts = { image: string; crop?: string; lang: Lang; provider: "demo" | "ai"; demoCondition?: DemoCondition | "auto" };

export async function analyzeCrop(o: AnalyzeOpts): Promise<ScanResult> {
  if (o.provider === "demo") {
    await new Promise((r) => setTimeout(r, 2200)); // simulated processing time
    const c = !o.demoCondition || o.demoCondition === "auto" ? demoConditionFor(o.image) : o.demoCondition;
    return demoResult(c, o.lang);
  }
  const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: o.image, crop: o.crop, lang: o.lang }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Analysis failed");
  return {
    ...j, source: "ai",
    risk: j.healthy ? "low" : j.confidence >= 75 ? "medium" : "high",
    monitor: j.monitor || j.symptoms,
    expertWhen: j.expertWhen || (o.lang === "te" ? "సమస్య పెరిగితే లేదా అనుమానం ఉంటే నిపుణుడిని సంప్రదించండి." : "If the problem spreads or you are unsure, contact an agricultural expert."),
  };
}

export const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_BYTES = 10 * 1024 * 1024;

/** Downscale to a JPEG data URL so it is light to analyse and store. */
export function compressImage(src: File | string, max = 900, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = typeof src === "string" ? src : URL.createObjectURL(src);
    const img = new Image();
    const done = () => { if (typeof src !== "string") URL.revokeObjectURL(url); };
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      done();
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { done(); reject(new Error("bad")); };
    img.src = url;
  });
}
