import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Empty, PageHeader, useT } from "@/components/kit";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/notifications")({
  head: () => seo("Notifications", "Weather, irrigation, pest, fertilizer and harvest alerts for your farm."),
  component: () => (
    <AppShell>
      <Notifications />
    </AppShell>
  ),
});

function Notifications() {
  const { notices, markNotice, markAllNotices, tl } = useApp();
  const T = useT();
  const [f, setF] = useState<"all" | "unread">("all");
  const list = notices.filter((n) => f === "all" || !n.read);
  const unread = notices.filter((n) => !n.read).length;
  return (
    <div className="space-y-3">
      <PageHeader emoji="🔔" title={T("Notifications", "నోటిఫికేషన్లు")} sub={`${unread} ${T("unread", "చదవనివి")}`} />
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <Chip active={f === "all"} onClick={() => setF("all")}>{T("All", "అన్నీ")}</Chip>
          <Chip active={f === "unread"} onClick={() => setF("unread")}>{T("Unread", "చదవనివి")}</Chip>
        </div>
        {unread > 0 && <Btn variant="ghost" onClick={markAllNotices} className="min-h-0 px-3 py-2 text-xs">{T("Mark all read", "అన్నీ చదివినట్లు")}</Btn>}
      </div>
      {list.length === 0 && <Empty emoji="🎉" title={T("All caught up", "అన్నీ చూశారు")} />}
      {list.map((n, i) => (
        <button key={n.id} onClick={() => markNotice(n.id)} className="block w-full text-left">
          <Card delay={i * 40} className={n.read ? "opacity-70" : ""}>
            <div className="flex gap-3">
              <span className="text-2xl">{n.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[15px] font-semibold">{tl(n.title)} {!n.read && <span className="size-2 rounded-full bg-primary" />}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{tl(n.body)}</p>
                <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{n.type} · {n.date}</p>
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
