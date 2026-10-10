import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { LocationAccess } from "@/components/LocationAccess";

export function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      <div className="absolute -left-16 -top-24 size-72 rounded-full bg-glow-1 blur-3xl" style={{ animation: "amb-float 18s ease-in-out infinite" }} />
      <div className="absolute -right-20 top-40 size-64 rounded-full bg-glow-2 blur-3xl" style={{ animation: "amb-float 22s ease-in-out -6s infinite reverse" }} />
      <div className="absolute bottom-24 left-1/4 size-56 rounded-full bg-glow-3 blur-3xl" style={{ animation: "amb-float 26s ease-in-out -12s infinite" }} />
      {["🍃", "🌿", "🍃", "🌱", "🍃", "🌿"].map((e, i) => (
        <span key={i} className="absolute -top-10 text-xl opacity-40" style={{ left: `${8 + i * 16}%`, animation: `amb-leaf ${16 + i * 3}s linear ${i * -4}s infinite` }}>{e}</span>
      ))}
    </div>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useApp();
  return (
    <div className="flex items-center gap-1 rounded-full bg-surface-strong p-1 ring-1 ring-border backdrop-blur-md">
      {(["en", "te"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground", l === "te" && "font-te")}
        >
          {l === "en" ? "EN" : "తె"}
        </button>
      ))}
    </div>
  );
}

const NAV = [
  { to: "/", emoji: "🏠", k: "home" },
  { to: "/farm", emoji: "🌱", k: "myFarm" },
  { to: "/planner", emoji: "📅", k: "planner" },
  { to: "/scan", emoji: "🩺", k: "scan" },
  { to: "/more", emoji: "☰", k: "more" },
] as const;

export function AppShell({ children, requireAuth = true }: { children: ReactNode; requireAuth?: boolean }) {
  const { user, hydrated, t, notices } = useApp();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const unread = notices.filter((n) => !n.read).length;

  useEffect(() => {
    if (requireAuth && hydrated && !user) navigate({ to: "/welcome" });
  }, [requireAuth, hydrated, user, navigate]);

  if (requireAuth && (!hydrated || !user)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="animate-pulse text-4xl">🌱</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Ambient />
      <div className="relative z-10 mx-auto max-w-[560px] md:max-w-2xl lg:max-w-4xl px-4 pb-32 pt-4">
        <header className="mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-center justify-between gap-2 sm:flex">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="logo-bob grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg">🌱</div>
            <div className="min-w-0 leading-tight">
              <p className="text-[15px] font-extrabold tracking-tight">VERDIX</p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Smart farming companion</p>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/notifications" aria-label={t("notifications")} className="relative grid size-9 place-items-center rounded-full bg-surface-strong ring-1 ring-border">
              <span className={unread > 0 ? "bell-alert" : undefined}>🔔</span>
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">{unread}</span>
              )}
            </Link>
            <LangSwitch />
          </div>
        </header>
        <LocationAccess />
        <main key={path} className="page-enter mt-4">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-[560px] md:max-w-2xl lg:max-w-4xl -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-3 mb-3 flex items-center justify-between rounded-2xl bg-surface-strong px-1 py-1.5 ring-1 ring-border backdrop-blur-xl">
          {NAV.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} data-active={active} className={cn("nav-glow flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5", active ? "text-primary" : "text-muted-foreground")}>
                <span className={cn("text-xl transition", active && "scale-110")}>{n.emoji}</span>
                <span className={cn("text-[11px]", active && "font-semibold")}>{t(n.k)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Ambient />
      <div className="relative z-10 mx-auto max-w-[460px] md:max-w-xl px-5 pb-10 pt-5">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg">🌱</div>
            <p className="text-[15px] font-extrabold tracking-tight">VERDIX</p>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} · VERDIX` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · VERDIX` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
