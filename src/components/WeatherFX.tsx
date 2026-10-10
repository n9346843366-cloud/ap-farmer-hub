// Weather animations driven only by the real condition (never by rain chance).
import type { WeatherKind } from "@/lib/weather-types";

const CLOUDS = [
  { top: 6, w: 120, h: 34, dur: 34, delay: 0, op: 0.75 },
  { top: 24, w: 165, h: 46, dur: 48, delay: -16, op: 0.55 },
  { top: 44, w: 95, h: 28, dur: 28, delay: -24, op: 0.45 },
];

function Clouds({ dark = false }: { dark?: boolean }) {
  return (
    <>
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${c.top}%`,
            width: c.w,
            height: c.h,
            opacity: c.op,
            background: dark
              ? "color-mix(in oklab, var(--muted-foreground) 30%, transparent)"
              : "color-mix(in oklab, var(--card) 95%, transparent)",
            boxShadow: "0 6px 18px color-mix(in oklab, var(--muted-foreground) 12%, transparent)",
            filter: "blur(3px)",
            animation: `wx-drift ${c.dur}s linear ${c.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function Sun() {
  return (
    <>
      <div
        className="absolute -right-10 -top-12 size-36 rounded-full"
        style={{ background: "radial-gradient(circle at 60% 60%, color-mix(in oklab, var(--warning) 80%, transparent), transparent 66%)", animation: "wx-glow 7s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-9 -top-11 size-32 rounded-full opacity-60"
        style={{
          background: "conic-gradient(from 0deg, color-mix(in oklab, var(--warning) 60%, transparent) 0 5%, transparent 5% 12.5%)",
          maskImage: "radial-gradient(circle, transparent 34%, black 35%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 34%, black 35%)",
          animation: "wx-rays 28s linear infinite",
        }}
      />
    </>
  );
}

function Moon() {
  return (
    <>
      <div
        className="absolute right-5 top-4 size-11 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 32%, color-mix(in oklab, var(--card) 98%, transparent), color-mix(in oklab, var(--muted-foreground) 35%, transparent))",
          boxShadow: "0 0 26px color-mix(in oklab, var(--glow-2) 90%, transparent)",
        }}
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          className="absolute size-1 rounded-full"
          style={{
            left: `${8 + ((i * 37) % 78)}%`,
            top: `${10 + ((i * 23) % 55)}%`,
            background: "color-mix(in oklab, var(--card) 95%, transparent)",
            boxShadow: "0 0 6px color-mix(in oklab, var(--card) 80%, transparent)",
            animation: `wx-twinkle ${2 + (i % 4)}s ease-in-out ${i * -0.7}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function Rain({ count = 26 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute w-px rounded-full"
          style={{
            left: `${(i * 100) / count + ((i % 3) * 1.5)}%`,
            height: 12 + (i % 5) * 7,
            background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--info) 75%, transparent))",
            animation: `wx-fall ${0.75 + (i % 7) * 0.12}s linear ${i * -0.21}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function Snow() {
  return (
    <>
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="absolute block"
          style={{ left: `${(i * 100) / 16 + 2}%`, top: 0, animation: `wx-fall ${5 + (i % 5)}s linear ${i * -0.9}s infinite` }}
        >
          <span
            className="block size-1.5 rounded-full"
            style={{ background: "color-mix(in oklab, var(--card) 95%, transparent)", animation: `wx-sway ${2 + (i % 3)}s ease-in-out infinite` }}
          />
        </span>
      ))}
    </>
  );
}

function Fog() {
  return (
    <>
      {[18, 42, 66].map((top, i) => (
        <div
          key={i}
          className="absolute h-10 w-[140%] rounded-full"
          style={{
            top: `${top}%`,
            left: "-20%",
            background: "color-mix(in oklab, var(--muted-foreground) 16%, transparent)",
            filter: "blur(10px)",
            animation: `wx-fog ${14 + i * 6}s ease-in-out ${i * -4}s infinite alternate`,
          }}
        />
      ))}
    </>
  );
}

export function WeatherFX({ kind }: { kind: WeatherKind }) {
  const wet = kind === "rain" || kind === "thunder";
  return (
    <div aria-hidden className="wx pointer-events-none absolute inset-0 overflow-hidden">
      {(kind === "clear" || kind === "partly") && <Sun />}
      {kind === "night" && <Moon />}
      {(kind === "partly" || kind === "cloudy" || kind === "fog" || kind === "snow" || wet) && <Clouds dark={wet || kind === "cloudy"} />}
      {wet && <Rain />}
      {kind === "thunder" && (
        <div className="absolute inset-0" style={{ background: "color-mix(in oklab, var(--card) 85%, transparent)", animation: "wx-flash 7s linear infinite" }} />
      )}
      {kind === "snow" && <Snow />}
      {kind === "fog" && <Fog />}
    </div>
  );
}
