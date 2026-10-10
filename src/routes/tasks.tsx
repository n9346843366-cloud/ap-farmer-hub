import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, seo } from "@/components/AppShell";
import { Btn, Card, Chip, Empty, Eyebrow, inputCls, PageHeader, Progress, useT } from "@/components/kit";
import { useApp } from "@/lib/store";
import { iso, PHASE_META, type Phase } from "@/lib/crops";

export const Route = createFileRoute("/tasks")({
  head: () => seo("Farm Tasks", "Today's, upcoming and completed farm tasks with reminders you can add yourself."),
  component: () => (
    <AppShell>
      <Tasks />
    </AppShell>
  ),
});

const TYPES: (Phase | "weather")[] = ["irrigation", "nutrition", "pest", "growth", "planting", "harvest"];
const emoji = (t: string) => (t === "weather" ? "⛅" : PHASE_META[t as Phase]?.emoji ?? "📌");

function Tasks() {
  const { tasks, toggleTask, addTask, removeTask, tl, activeFarm, lang } = useApp();
  const T = useT();
  const today = iso(new Date());
  const [filter, setFilter] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [type, setType] = useState<string>("irrigation");

  const mine = tasks.filter((x) => (!activeFarm || x.farmId === activeFarm.id) && (filter === "all" || x.type === filter));
  const groups = [
    { k: "overdue", label: T("Overdue", "ఆలస్యమైనవి"), items: mine.filter((x) => !x.done && x.date < today) },
    { k: "today", label: T("Today", "ఈరోజు"), items: mine.filter((x) => x.date === today) },
    { k: "up", label: T("Upcoming", "రాబోయేవి"), items: mine.filter((x) => !x.done && x.date > today).sort((a, b) => a.date.localeCompare(b.date)) },
    { k: "done", label: T("Completed", "పూర్తయినవి"), items: mine.filter((x) => x.done && x.date < today) },
  ];
  const doneCount = mine.filter((x) => x.done).length;

  const add = () => {
    if (!title.trim() || !activeFarm) return;
    addTask({ farmId: activeFarm.id, title: { en: title.trim(), te: title.trim() }, type, date });
    setTitle("");
  };

  return (
    <div className="space-y-3">
      <PageHeader emoji="✅" title={T("Farm Tasks", "పొలం పనులు")} sub={activeFarm?.name} />
      <Card>
        <Eyebrow right={<span className="font-mono text-xs">{doneCount}/{mine.length}</span>}>{T("Progress", "పురోగతి")}</Eyebrow>
        <div className="mt-2"><Progress value={mine.length ? (doneCount / mine.length) * 100 : 0} /></div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>{T("All", "అన్నీ")}</Chip>
          {TYPES.map((t) => (
            <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>{emoji(t)} {t === "weather" ? "" : tl(PHASE_META[t as Phase].label)}</Chip>
          ))}
        </div>
      </Card>

      {mine.length === 0 && <Empty emoji="🗓️" title={T("No tasks yet", "ఇంకా పనులు లేవు")}><p className="text-sm text-muted-foreground">{T("Create a crop plan or add a task below.", "పంట ప్రణాళిక చేయండి లేదా కింద పని జోడించండి.")}</p></Empty>}

      {groups.filter((g) => g.items.length).map((g, gi) => (
        <Card key={g.k} delay={gi * 50}>
          <Eyebrow>{g.label} · {g.items.length}</Eyebrow>
          <div className="mt-2 divide-y divide-border">
            {g.items.map((x) => (
              <div key={x.id} className="flex items-center gap-3 py-2.5">
                <button onClick={() => toggleTask(x.id)} aria-label="toggle" className={`grid size-8 shrink-0 place-items-center rounded-lg ${x.done ? "bg-primary text-primary-foreground" : "ring-1 ring-input"}`}>{x.done ? "✓" : ""}</button>
                <div className="min-w-0 flex-1">
                  <p className={`text-[15px] ${x.done ? "text-muted-foreground line-through" : ""}`}>{emoji(x.type)} {tl(x.title)}</p>
                  <p className={`text-xs ${g.k === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>{new Date(x.date).toLocaleDateString(lang === "te" ? "te-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
                </div>
                <button onClick={() => removeTask(x.id)} aria-label="delete" className="text-muted-foreground">✕</button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <Eyebrow>➕ {T("Add a task / reminder", "పని / గుర్తు జోడించండి")}</Eyebrow>
        <div className="mt-3 space-y-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={T("e.g. Spray neem oil", "ఉదా: వేప నూనె పిచికారీ")} className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              {TYPES.map((t) => <option key={t} value={t}>{emoji(t)} {tl(PHASE_META[t as Phase].label)}</option>)}
            </select>
          </div>
          <Btn onClick={add} disabled={!title.trim() || !activeFarm} className="w-full">{T("Add task", "పని జోడించండి")}</Btn>
        </div>
      </Card>
    </div>
  );
}
