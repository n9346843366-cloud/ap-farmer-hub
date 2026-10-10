import { useEffect, useState } from "react";

const TOTAL_MS = 5600;
let played = false; // once per app open / reload, not on in-app navigation

export function Intro() {
  const [show, setShow] = useState(!played);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    played = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 1200 : TOTAL_MS;
    const t1 = setTimeout(() => setLeaving(true), total - 600);
    const t2 = setTimeout(() => setShow(false), total);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  if (!show) return null;
  const skip = () => { played = true; setShow(false); };

  const sprouts = [12, 24, 38, 52, 64, 78, 90];

  return (
    <div className={`intro ${leaving ? "intro-leave" : ""}`} role="dialog" aria-label="VERDIX intro">
      <svg className="intro-scene" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <defs>
          <linearGradient id="isky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--intro-sky-top)" />
            <stop offset="0.6" stopColor="var(--intro-sky-mid)" />
            <stop offset="1" stopColor="var(--intro-sky-low)" />
          </linearGradient>
          <radialGradient id="isun">
            <stop offset="0" stopColor="var(--intro-sun)" />
            <stop offset="0.35" stopColor="var(--intro-sun)" stopOpacity="0.6" />
            <stop offset="1" stopColor="var(--intro-sun)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="800" fill="url(#isky)" />
        <circle className="intro-sun" cx="250" cy="520" r="150" fill="url(#isun)" />
        <g className="intro-clouds" fill="var(--intro-cloud)">
          <ellipse cx="80" cy="260" rx="70" ry="10" />
          <ellipse cx="300" cy="200" rx="90" ry="9" />
          <ellipse cx="200" cy="330" rx="60" ry="7" />
        </g>
        <path d="M0 520 Q100 470 200 505 T400 490 V800 H0Z" fill="var(--intro-hill-far)" />
        <path d="M0 570 Q120 530 230 560 T400 550 V800 H0Z" fill="var(--intro-hill)" />
        <g className="intro-farmer" fill="var(--intro-silhouette)">
          <ellipse cx="0" cy="-58" rx="14" ry="3.5" />
          <path d="M-7 -60 Q0 -68 7 -60Z" />
          <circle cx="0" cy="-52" r="5" />
          <path d="M-6 -46 L6 -46 L8 -20 L-8 -20Z" />
          <path className="intro-leg-a" d="M-5 -21 L-3 0 L0 0 L1 -21Z" />
          <path className="intro-leg-b" d="M-1 -21 L2 0 L5 0 L5 -21Z" />
          <path d="M6 -44 L14 -30 L12 -28 L5 -38Z" />
          <rect x="12" y="-60" width="1.6" height="58" />
        </g>
        <g className="intro-crops" fill="var(--intro-crop)">
          {Array.from({ length: 34 }).map((_, i) => (
            <path key={i} className="intro-stalk" style={{ animationDelay: `${(i % 7) * 0.18}s`, transformOrigin: `${i * 12 + 4}px 800px` }}
              d={`M${i * 12} 800 Q${i * 12 + 3} ${700 - (i % 5) * 8} ${i * 12 + 6} ${640 - (i % 4) * 10} Q${i * 12 + 6} ${720} ${i * 12 + 9} 800Z`} />
          ))}
        </g>
        <g fill="var(--intro-sprout)">
          {sprouts.map((x, i) => (
            <g key={x} className="intro-sprout" style={{ animationDelay: `${2.1 + i * 0.12}s`, transformOrigin: `${x * 4}px 790px` }}>
              <rect x={x * 4 - 1} y="760" width="2" height="30" />
              <path d={`M${x * 4} 768 q-14 -4 -16 -16 q14 2 16 16Z`} />
              <path d={`M${x * 4} 762 q14 -6 16 -18 q-14 2 -16 18Z`} />
            </g>
          ))}
        </g>
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} className="intro-mote" cx={(i * 53) % 400} cy={560 + ((i * 37) % 200)} r={1.4 + (i % 3) * 0.6}
            fill="var(--intro-sun)" style={{ animationDelay: `${1.8 + (i % 5) * 0.3}s` }} />
        ))}
      </svg>

      <div className="intro-veil" />
      <div className="intro-text">
        <p className="intro-quote">
          “A farmer plants a seed with hope.
          <br />
          VERDIX helps that hope grow.”
        </p>
        <div className="intro-brand">
          <div className="intro-logo">🌱</div>
          <h1>VERDIX</h1>
          <p>SMART FARMING COMPANION</p>
        </div>
      </div>

      <button onClick={skip} className="intro-skip">Skip →</button>
    </div>
  );
}
