import { Card, Eyebrow } from "@/components/kit";
import { useApp } from "@/lib/store";

const ONLINE = [
  { name: "IFFCO BAZAR", url: "https://www.iffcobazar.in/", desc: { en: "Govt co-op fertilisers", te: "సహకార ఎరువులు" } },
  { name: "BigHaat", url: "https://www.bighaat.com/", desc: { en: "Seeds, fertiliser, sprays", te: "విత్తనాలు, ఎరువులు, మందులు" } },
  { name: "AgroStar", url: "https://www.agrostar.in/", desc: { en: "Home delivery to village", te: "గ్రామానికి డెలివరీ" } },
  { name: "DeHaat", url: "https://agrevolution.in/", desc: { en: "Inputs + expert advice", te: "ఇన్‌పుట్స్ + సలహా" } },
];

export function NearbyShops() {
  const { activeFarm, user, lang } = useApp();
  const T = (en: string, te: string) => (lang === "te" ? te : en);
  const lat = activeFarm?.lat ?? user?.lat;
  const lon = activeFarm?.lon ?? user?.lon;
  const place = activeFarm?.location ?? user?.location ?? "";
  const maps = lat != null && lon != null
    ? `https://www.google.com/maps/search/fertilizer+shop/@${lat},${lon},13z`
    : `https://www.google.com/maps/search/${encodeURIComponent(`fertilizer shop near ${place}`)}`;
  return (
    <Card>
      <Eyebrow>🏪 {T("Fertiliser shops near you", "మీ దగ్గర ఎరువుల దుకాణాలు")}</Eyebrow>
      <a href={maps} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20">
        <span className="text-sm font-semibold">📍 {T("Show shops on map", "మ్యాప్‌లో దుకాణాలు చూడండి")}</span>
        <span className="text-xs text-muted-foreground">{place.split(",")[0]} →</span>
      </a>
      <p className="mt-3 text-xs font-semibold text-muted-foreground">{T("Order online (home delivery)", "ఆన్‌లైన్‌లో ఆర్డర్ చేయండి")}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {ONLINE.map((o) => (
          <a key={o.name} href={o.url} target="_blank" rel="noreferrer" className="rounded-xl bg-surface-strong p-3 ring-1 ring-border">
            <p className="text-sm font-bold">{o.name}</p>
            <p className="text-[11px] text-muted-foreground">{o.desc[lang]}</p>
          </a>
        ))}
      </div>
    </Card>
  );
}
