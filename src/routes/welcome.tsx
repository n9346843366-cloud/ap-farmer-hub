import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout, seo } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import heroAsset from "@/assets/welcome-farmer.jpg.asset.json";
const hero = heroAsset.url;

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [
    ...seo("Welcome", "Tell VERDIX what you want to grow. It helps you plan, grow, monitor and manage it.").meta,
    { property: "og:image", content: hero },
    { name: "twitter:image", content: hero },
  ] }),
  component: Welcome,
});

function Welcome() {
  const { t } = useApp();
  return (
    <AuthLayout>
      <div className="relative animate-rise overflow-hidden rounded-3xl ring-1 ring-border">
        <img src={hero} alt="Farmer in a green field using a phone" width={768} height={1152} className="h-[340px] w-full object-cover" />
      </div>
      <div className="mt-6 space-y-3 animate-rise" style={{ animationDelay: "160ms" }}>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-surface-strong font-semibold ring-1 ring-border">{t("login")}</Link>
          <Link to="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-secondary font-semibold text-secondary-foreground">{t("register")}</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
