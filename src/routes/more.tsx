import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Eyebrow, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { FeedbackBox } from "@/components/FeedbackBox";

export const Route = createFileRoute("/more")({
  head: () => seo("More", "All VERDIX tools, language settings, profile and help center."),
  component: () => (
    <AppShell>
      <More />
    </AppShell>
  ),
});

const LINKS = [
  { to: "/expert", e: "👨‍🌾", en: "Expert help", te: "నిపుణుల సహాయం" },
];

const FAQ = [
  { q: { en: "How do I start?", te: "ఎలా మొదలుపెట్టాలి?" }, a: { en: "Add your farm, then open Crop Calendar, pick a crop and date, and tap Create crop plan.", te: "పొలం జోడించి, పంట క్యాలెండర్‌లో పంట, తేదీ ఎంచుకుని ప్రణాళిక చేయండి." } },
  { q: { en: "Can I talk in Telugu?", te: "తెలుగులో మాట్లాడవచ్చా?" }, a: { en: "Yes. Tap the AI button at the corner, then the mic and speak in Telugu.", te: "అవును. సహాయకుడిని తెరిచి మైక్ నొక్కి తెలుగులో మాట్లాడండి." } },
  { q: { en: "Are weather and prices live?", te: "వాతావరణం, ధరలు ప్రత్యక్షమా?" }, a: { en: "Weather is live for your location. Market prices are approximate.", te: "వాతావరణం ప్రత్యక్షం. ధరలు సుమారుగా." } },
  { q: { en: "Where is my data stored?", te: "నా సమాచారం ఎక్కడ?" }, a: { en: "Safely in your own account — only you can see it.", te: "మీ ఖాతాలో సురక్షితంగా — మీకు మాత్రమే." } },
];

function More() {
  const { user, lang, setLang, logout, tl } = useApp();
  const T = useT();
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <PageHeader emoji="☰" title={T("More", "మరిన్ని")} back={false} />
      <Card>
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-xl text-primary-foreground">{user?.name?.[0] ?? "👤"}</span>
          <div><p className="font-bold">{user?.name}</p><p className="text-xs text-muted-foreground">{user?.mobile} · {user?.location}</p></div>
        </div>
        <div className="mt-3 flex gap-2">
          <Chip active={lang === "en"} onClick={() => setLang("en")}>English</Chip>
          <Chip active={lang === "te"} onClick={() => setLang("te")}>తెలుగు</Chip>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-2">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="glass flex flex-col items-center gap-1 p-3 text-center">
            <span className="text-2xl">{l.e}</span>
            <span className="text-[11px] font-semibold leading-tight">{T(l.en, l.te)}</span>
          </Link>
        ))}
      </div>
      <FeedbackBox />
      <Card>
        <Eyebrow>❓ {T("Help center", "సహాయ కేంద్రం")}</Eyebrow>
        <div className="mt-2 divide-y divide-border">
          {FAQ.map((f, i) => (
            <details key={i} className="py-2.5">
              <summary className="cursor-pointer text-sm font-semibold">{tl(f.q)}</summary>
              <p className="mt-1.5 text-sm text-muted-foreground">{tl(f.a)}</p>
            </details>
          ))}
        </div>
        <a href="tel:18001801551" className="mt-2 block text-sm font-semibold text-primary">📞 Kisan Call Centre 1800-180-1551</a>
      </Card>
      <Btn variant="ghost" className="w-full" onClick={() => { logout(); navigate({ to: "/welcome" }); }}>🚪 {T("Sign out", "సైన్ అవుట్")}</Btn>
      <p className="text-center text-[11px] text-muted-foreground">VERDIX · {T("Your Smart Farming Companion", "మీ స్మార్ట్ వ్యవసాయ సహచరుడు")}</p>
    </div>
  );
}
