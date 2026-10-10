// Mini MeeSeva service directory. Structured per state so more states can be
// added by appending to STATES/SERVICES without touching screens.
import type { L } from "./crops";

export type StateCode = "AP";
export type CatId =
  | "land" | "certs" | "schemes" | "agri" | "revenue" | "identity" | "loans" | "tracking" | "centres" | "help";

export const LISTED_ON = "2026-10-10";

export const PORTALS = {
  meeseva: { name: "AP MeeSeva Citizen Portal", url: "https://onlineap.meeseva.gov.in/CitizenPortal/userinterface/citizen/Home.aspx" },
  meebhoomi: { name: "MeeBhoomi (AP land records)", url: "http://meebhoomi.ap.gov.in/" },
  india: { name: "Government Services Portal (India)", url: "https://services.india.gov.in/" },
  myscheme: { name: "myScheme (Govt of India)", url: "https://www.myscheme.gov.in/" },
  apgov: { name: "AP Government Portal", url: "https://www.ap.gov.in/" },
} as const;
export type PortalId = keyof typeof PORTALS;

export const CATEGORIES: { id: CatId; emoji: string; name: L }[] = [
  { id: "land", emoji: "📜", name: { en: "Land Records", te: "భూమి రికార్డులు" } },
  { id: "certs", emoji: "🪪", name: { en: "Farmer Certificates", te: "రైతు ధృవపత్రాలు" } },
  { id: "schemes", emoji: "🏛️", name: { en: "Government Schemes", te: "ప్రభుత్వ పథకాలు" } },
  { id: "agri", emoji: "🌾", name: { en: "Agriculture Services", te: "వ్యవసాయ సేవలు" } },
  { id: "revenue", emoji: "🗺️", name: { en: "Land & Revenue Services", te: "భూమి & రెవెన్యూ సేవలు" } },
  { id: "identity", emoji: "🆔", name: { en: "Identity & Supporting Documents", te: "గుర్తింపు & సహాయ పత్రాలు" } },
  { id: "loans", emoji: "💳", name: { en: "Farmer Loans & Finance", te: "రైతు రుణాలు & ఆర్థిక సేవలు" } },
  { id: "tracking", emoji: "🔎", name: { en: "Application Tracking", te: "దరఖాస్తు స్థితి" } },
  { id: "centres", emoji: "📍", name: { en: "Nearby Service Centres", te: "సమీప సేవా కేంద్రాలు" } },
  { id: "help", emoji: "🧾", name: { en: "Help & Document Preparation", te: "సహాయం & పత్రాల సిద్ధత" } },
];

export type Service = {
  id: string; state: StateCode; cat: CatId; emoji: string;
  name: L; aliases: string[]; what: L; who: L;
  provider: string; method: L; portal: PortalId;
  /** Items to check before applying. Commonly asked — always confirm on the official portal. */
  checklist: L[];
  note?: L;
};

const confirm: L = { en: "Exact documents, fees and timelines are set by the department — confirm on the official portal or at a MeeSeva centre.", te: "ఖచ్చితమైన పత్రాలు, రుసుము, సమయం శాఖ నిర్ణయిస్తుంది — అధికారిక పోర్టల్ లేదా మీసేవ కేంద్రంలో నిర్ధారించండి." };
const viaMeeSeva: L = { en: "Apply at a MeeSeva centre or through the MeeSeva citizen portal.", te: "మీసేవ కేంద్రంలో లేదా మీసేవ పోర్టల్ ద్వారా దరఖాస్తు చేయండి." };
const viaMeeBhoomi: L = { en: "View on MeeBhoomi; certified copies through MeeSeva.", te: "మీభూమిలో చూడండి; ధృవీకరించిన ప్రతి మీసేవ ద్వారా." };

const aadhaar: L = { en: "Aadhaar card (keep with you — do not share OTP with anyone)", te: "ఆధార్ కార్డు (OTP ఎవరికీ చెప్పకండి)" };
const survey: L = { en: "Survey number and village / mandal / district name", te: "సర్వే నంబర్, గ్రామం / మండలం / జిల్లా పేరు" };
const khata: L = { en: "Khata / account number (if known)", te: "ఖాతా నంబర్ (తెలిస్తే)" };
const passbook: L = { en: "Pattadar passbook copy (if you have one)", te: "పట్టాదారు పాస్‌బుక్ ప్రతి (ఉంటే)" };
const mobile: L = { en: "Mobile number linked for SMS updates", te: "SMS కోసం మొబైల్ నంబర్" };
const photo: L = { en: "Recent passport-size photo (if asked)", te: "ఇటీవలి పాస్‌పోర్ట్ ఫోటో (అడిగితే)" };

export const SERVICES: Service[] = [
  { id: "ror1b", state: "AP", cat: "land", emoji: "📜", name: { en: "ROR-1B (Record of Rights)", te: "ROR-1B (హక్కుల రికార్డు)" }, aliases: ["1b", "1-b", "ror", "record of rights", "వన్ బి", "1బి"],
    what: { en: "A land Record of Rights document that shows the recorded details of a land holding — such as the recorded holder, survey number and extent.", te: "భూమి హక్కుల రికార్డు — నమోదైన యజమాని, సర్వే నంబర్, విస్తీర్ణం వంటి వివరాలు చూపిస్తుంది." },
    who: { en: "Farmers needing land details for loans, schemes, insurance or sale.", te: "రుణాలు, పథకాలు, బీమా, అమ్మకం కోసం భూమి వివరాలు కావలసిన రైతులు." },
    provider: "Revenue Department, Govt of AP", method: viaMeeBhoomi, portal: "meebhoomi", checklist: [survey, khata, aadhaar],
    note: { en: "A 1-B extract is a record, not conclusive legal proof of ownership in every case. For legal verification, contact the Tahsildar / revenue office.", te: "1-B ఒక రికార్డు మాత్రమే; ప్రతి సందర్భంలో యాజమాన్యానికి తుది చట్టపరమైన రుజువు కాదు. చట్టపరమైన నిర్ధారణకు తహసీల్దార్ కార్యాలయాన్ని సంప్రదించండి." } },
  { id: "adangal", state: "AP", cat: "land", emoji: "📗", name: { en: "Computerized Adangal", te: "కంప్యూటరైజ్డ్ అడంగల్" }, aliases: ["adangal", "pahani", "అడంగల్", "పహాణి"],
    what: { en: "Village land register extract showing land and cultivation details recorded for a survey number.", te: "సర్వే నంబర్‌కు నమోదైన భూమి, సాగు వివరాలు చూపే గ్రామ రికార్డు." },
    who: { en: "Farmers applying for crop loans, insurance or schemes.", te: "పంట రుణం, బీమా, పథకాలకు దరఖాస్తు చేసే రైతులు." },
    provider: "Revenue Department, Govt of AP", method: viaMeeBhoomi, portal: "meebhoomi", checklist: [survey, khata, aadhaar] },
  { id: "manual-adangal", state: "AP", cat: "land", emoji: "📘", name: { en: "Manual Adangal (where applicable)", te: "మాన్యువల్ అడంగల్ (వర్తించే చోట)" }, aliases: ["manual adangal"],
    what: { en: "Copy of older hand-written village records, where these are still maintained.", te: "పాత చేతిరాత గ్రామ రికార్డుల ప్రతి (ఉన్న చోట)." },
    who: { en: "Farmers needing older records for corrections or disputes.", te: "సవరణలు లేదా వివాదాల కోసం పాత రికార్డులు కావలసినవారు." },
    provider: "Revenue Department, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [survey, aadhaar] },
  { id: "passbook", state: "AP", cat: "land", emoji: "📕", name: { en: "Electronic Pattadar Passbook", te: "ఎలక్ట్రానిక్ పట్టాదారు పాస్‌బుక్" }, aliases: ["pattadar", "passbook", "e-passbook", "పట్టాదారు", "పాస్ బుక్"],
    what: { en: "Passbook recording the land holdings registered in a pattadar's name.", te: "పట్టాదారు పేరున నమోదైన భూముల పాస్‌బుక్." },
    who: { en: "Land-owning farmers.", te: "భూమి ఉన్న రైతులు." },
    provider: "Revenue Department, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [aadhaar, survey, khata, photo, mobile] },
  { id: "fmb", state: "AP", cat: "land", emoji: "📐", name: { en: "FMB copy (Field Measurement Book)", te: "FMB ప్రతి (క్షేత్ర కొలత పుస్తకం)" }, aliases: ["fmb", "field measurement", "sketch", "ఎఫ్ఎంబి"],
    what: { en: "Sketch of a survey number with its boundaries and measurements.", te: "సర్వే నంబర్ హద్దులు, కొలతలతో కూడిన పటం." },
    who: { en: "Farmers checking boundaries, fencing or survey disputes.", te: "హద్దులు, కంచె, సర్వే వివాదాలు చూసుకునే రైతులు." },
    provider: "Survey & Land Records Dept, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [survey] },
  { id: "villagemap", state: "AP", cat: "land", emoji: "🗺️", name: { en: "Village Map copy", te: "గ్రామ పటం ప్రతి" }, aliases: ["village map", "గ్రామ పటం"],
    what: { en: "Map of the whole village showing survey numbers.", te: "సర్వే నంబర్లతో గ్రామం మొత్తం పటం." },
    who: { en: "Farmers locating their land or neighbouring plots.", te: "తమ భూమి స్థానం తెలుసుకునే రైతులు." },
    provider: "Survey & Land Records Dept, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [{ en: "Village / mandal / district name", te: "గ్రామం / మండలం / జిల్లా" }] },
  { id: "smallfarmer", state: "AP", cat: "certs", emoji: "🧑‍🌾", name: { en: "Small & Marginal Farmer Certificate", te: "చిన్న & సన్నకారు రైతు ధృవపత్రం" }, aliases: ["small farmer", "marginal", "సన్నకారు", "చిన్న రైతు"],
    what: { en: "Certifies a farmer's landholding category (small or marginal).", te: "రైతు భూకమతం వర్గం (చిన్న / సన్నకారు) ధృవీకరిస్తుంది." },
    who: { en: "Farmers applying for subsidies that give priority to small/marginal farmers.", te: "చిన్న/సన్నకారు రైతులకు ప్రాధాన్యం ఉన్న సబ్సిడీలకు దరఖాస్తు చేసేవారు." },
    provider: "Revenue Department, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [aadhaar, passbook, survey, photo] },
  { id: "agriincome", state: "AP", cat: "certs", emoji: "💰", name: { en: "Agricultural Income Certificate", te: "వ్యవసాయ ఆదాయ ధృవపత్రం" }, aliases: ["agricultural income", "income certificate", "ఆదాయ"],
    what: { en: "Certifies income earned from agriculture.", te: "వ్యవసాయం నుండి వచ్చే ఆదాయాన్ని ధృవీకరిస్తుంది." },
    who: { en: "Farmers needing income proof for loans, education or schemes.", te: "రుణాలు, విద్య, పథకాల కోసం ఆదాయ రుజువు కావలసినవారు." },
    provider: "Revenue Department, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [aadhaar, passbook, survey] },
  { id: "landvalue", state: "AP", cat: "certs", emoji: "🏷️", name: { en: "Agricultural Land Value Certificate", te: "వ్యవసాయ భూమి విలువ ధృవపత్రం" }, aliases: ["land value", "భూమి విలువ"],
    what: { en: "States the assessed value of agricultural land.", te: "వ్యవసాయ భూమి అంచనా విలువను తెలుపుతుంది." },
    who: { en: "Farmers needing land value for loans or sureties.", te: "రుణాలు, హామీల కోసం భూమి విలువ కావలసినవారు." },
    provider: "Revenue Department, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [aadhaar, passbook, survey] },
  { id: "ccrc", state: "AP", cat: "certs", emoji: "🤝", name: { en: "Crop Cultivator Rights Card (CCRC)", te: "పంట సాగుదారు హక్కు కార్డు (CCRC)" }, aliases: ["ccrc", "tenant", "cultivator", "కౌలు", "సాగుదారు"],
    what: { en: "Card for tenant cultivators so they can access crop loans and support while cultivating another's land.", te: "కౌలు రైతులు పంట రుణాలు, సహాయం పొందడానికి ఉపయోగపడే కార్డు." },
    who: { en: "Tenant farmers and cultivators.", te: "కౌలు రైతులు, సాగుదారులు." },
    provider: "Revenue / Agriculture Dept, Govt of AP — via Grama Sachivalayam", method: { en: "Enquire at your Grama / Ward Sachivalayam or Rythu Seva Kendra.", te: "గ్రామ / వార్డ్ సచివాలయం లేదా రైతు సేవా కేంద్రంలో అడగండి." }, portal: "apgov", checklist: [aadhaar, survey, { en: "Land owner's details for the land you cultivate", te: "మీరు సాగు చేసే భూమి యజమాని వివరాలు" }] },
  { id: "correction", state: "AP", cat: "revenue", emoji: "✏️", name: { en: "Land record correction / survey services", te: "భూమి రికార్డు సవరణ / సర్వే సేవలు" }, aliases: ["correction", "mutation", "survey", "సవరణ", "మ్యుటేషన్"],
    what: { en: "Requests to correct entries, mutation after sale/inheritance, or survey-number related services.", te: "రికార్డు సవరణ, అమ్మకం/వారసత్వం తర్వాత మ్యుటేషన్, సర్వే సంబంధిత సేవలు." },
    who: { en: "Farmers whose recorded details are wrong or have changed.", te: "నమోదైన వివరాలు తప్పుగా ఉన్నా, మారినా." },
    provider: "Revenue Department, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [aadhaar, survey, khata, passbook, { en: "Supporting deed / proof of the change", te: "మార్పుకు సంబంధించిన దస్తావేజు / రుజువు" }] },
  { id: "schemes-find", state: "AP", cat: "schemes", emoji: "🏛️", name: { en: "Find Government Schemes", te: "ప్రభుత్వ పథకాలు వెతకండి" }, aliases: ["scheme", "schemes", "pm kisan", "పథకం", "పథకాలు"],
    what: { en: "Discover central and state schemes for farmers — use VERDIX Government Schemes or myScheme.", te: "రైతుల కోసం కేంద్ర, రాష్ట్ర పథకాలు — VERDIX పథకాలు లేదా myScheme లో చూడండి." },
    who: { en: "All farmers.", te: "అందరు రైతులు." }, provider: "Govt of India / Govt of AP", method: { en: "Check eligibility, then apply on the scheme's official site.", te: "అర్హత చూసి, పథకం అధికారిక సైట్‌లో దరఖాస్తు." }, portal: "myscheme", checklist: [aadhaar, passbook, { en: "Bank account linked to Aadhaar", te: "ఆధార్‌తో అనుసంధానమైన బ్యాంక్ ఖాతా" }] },
  { id: "rsk", state: "AP", cat: "agri", emoji: "🌾", name: { en: "Rythu Seva Kendra services", te: "రైతు సేవా కేంద్రం సేవలు" }, aliases: ["rsk", "rbk", "rythu", "రైతు సేవా", "ఆర్బీకే"],
    what: { en: "Village-level agriculture help: seeds, crop booking (e-Crop), advice and scheme enrolment.", te: "గ్రామ స్థాయి వ్యవసాయ సహాయం: విత్తనాలు, ఇ-క్రాప్ నమోదు, సలహా, పథకాల నమోదు." },
    who: { en: "All farmers in AP.", te: "AP లో అందరు రైతులు." }, provider: "Agriculture Department, Govt of AP", method: { en: "Visit your village Rythu Seva Kendra.", te: "మీ గ్రామ రైతు సేవా కేంద్రాన్ని సందర్శించండి." }, portal: "apgov", checklist: [aadhaar, survey, mobile] },
  { id: "identity", state: "AP", cat: "identity", emoji: "🆔", name: { en: "Identity & supporting certificates", te: "గుర్తింపు & సహాయ ధృవపత్రాలు" }, aliases: ["caste", "residence", "income", "aadhaar", "కుల", "నివాస"],
    what: { en: "Caste, income, residence and similar certificates often asked with farmer applications.", te: "రైతు దరఖాస్తులతో తరచూ అడిగే కుల, ఆదాయ, నివాస ధృవపత్రాలు." },
    who: { en: "Farmers whose scheme or loan asks for them.", te: "పథకం/రుణం అడిగిన రైతులు." }, provider: "Revenue Department, Govt of AP", method: viaMeeSeva, portal: "meeseva", checklist: [aadhaar, photo] },
  { id: "kcc", state: "AP", cat: "loans", emoji: "💳", name: { en: "Kisan Credit Card & crop loans", te: "కిసాన్ క్రెడిట్ కార్డు & పంట రుణాలు" }, aliases: ["kcc", "loan", "crop loan", "రుణం", "లోన్"],
    what: { en: "Banks issue crop loans and KCC. Land or CCRC records are usually asked.", te: "బ్యాంకులు పంట రుణాలు, KCC ఇస్తాయి. సాధారణంగా భూమి లేదా CCRC రికార్డులు అడుగుతారు." },
    who: { en: "Owner and tenant farmers.", te: "యజమాని, కౌలు రైతులు." }, provider: "Banks / Govt of India", method: { en: "Apply at your bank branch; see also VERDIX Farm Loans.", te: "మీ బ్యాంకులో దరఖాస్తు; VERDIX రుణాలు కూడా చూడండి." }, portal: "myscheme", checklist: [aadhaar, passbook, photo, { en: "1-B / Adangal or CCRC", te: "1-B / అడంగల్ లేదా CCRC" }] },
  { id: "status", state: "AP", cat: "tracking", emoji: "🔎", name: { en: "Application Status", te: "దరఖాస్తు స్థితి" }, aliases: ["status", "track", "application status", "స్థితి"],
    what: { en: "Check MeeSeva application status on the official portal using your transaction number, then note it in My Government Applications.", te: "మీ లావాదేవీ నంబర్‌తో అధికారిక పోర్టల్‌లో స్థితి చూసి, 'నా దరఖాస్తులు'లో నమోదు చేయండి." },
    who: { en: "Anyone who has applied.", te: "దరఖాస్తు చేసినవారు." }, provider: "MeeSeva, Govt of AP", method: { en: "Open the official portal — VERDIX cannot fetch status automatically.", te: "అధికారిక పోర్టల్ తెరవండి — VERDIX స్వయంగా స్థితి తీసుకురాదు." }, portal: "meeseva", checklist: [{ en: "Application / transaction number", te: "దరఖాస్తు / లావాదేవీ నంబర్" }] },
];

export const CONFIRM_NOTE = confirm;

const norm = (s: string) => s.toLowerCase().replace(/[\s\-_.()]/g, "");

/** Matches English names, Telugu names and common aliases (e.g. "1-B", "అడంగల్"). */
export function searchServices(q: string, list: Service[] = SERVICES): Service[] {
  const n = norm(q);
  if (!n) return list;
  return list.filter((s) => [s.name.en, s.name.te, ...s.aliases].some((x) => norm(x).includes(n)));
}

/** Guided navigator: map a need to service ids. */
export const NEEDS: { id: string; label: L; services: string[] }[] = [
  { id: "1b", label: { en: "I need my 1-B land record", te: "నాకు 1-B భూమి రికార్డు కావాలి" }, services: ["ror1b"] },
  { id: "adangal", label: { en: "I need Adangal / Pahani", te: "నాకు అడంగల్ కావాలి" }, services: ["adangal", "manual-adangal"] },
  { id: "passbook", label: { en: "Pattadar passbook", te: "పట్టాదారు పాస్‌బుక్" }, services: ["passbook"] },
  { id: "map", label: { en: "Land map / boundaries", te: "భూమి పటం / హద్దులు" }, services: ["fmb", "villagemap"] },
  { id: "cert", label: { en: "A farmer certificate", te: "రైతు ధృవపత్రం" }, services: ["smallfarmer", "agriincome", "landvalue"] },
  { id: "tenant", label: { en: "I am a tenant farmer", te: "నేను కౌలు రైతును" }, services: ["ccrc", "kcc"] },
  { id: "correct", label: { en: "Correct my land record", te: "భూమి రికార్డు సవరణ" }, services: ["correction"] },
  { id: "scheme", label: { en: "A government scheme", te: "ప్రభుత్వ పథకం" }, services: ["schemes-find", "rsk"] },
  { id: "loan", label: { en: "Loan-related document", te: "రుణ సంబంధిత పత్రం" }, services: ["kcc", "ror1b", "adangal"] },
  { id: "status", label: { en: "I already applied — check status", te: "దరఖాస్తు చేశాను — స్థితి" }, services: ["status"] },
];
