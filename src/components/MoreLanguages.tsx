import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";

/** Translates every screen into more Indian languages using Google's page translator. */
const LANGS = [
  ["", "Off"], ["hi", "हिन्दी"], ["ta", "தமிழ்"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"],
  ["mr", "मराठी"], ["bn", "বাংলা"], ["gu", "ગુજરાતી"], ["pa", "ਪੰਜਾਬੀ"], ["or", "ଓଡ଼ିଆ"], ["ur", "اردو"],
] as const;

function current() {
  const m = typeof document !== "undefined" ? document.cookie.match(/googtrans=\/en\/([a-z-]+)/) : null;
  return m?.[1] ?? "";
}

export function MoreLanguages() {
  const { lang, setLang } = useApp();
  const [code, setCode] = useState("");
  useEffect(() => setCode(current()), []);

  const pick = (c: string) => {
    if (lang !== "en") setLang("en");
    const host = location.hostname;
    const exp = c ? "" : ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const val = c ? `/en/${c}` : "";
    document.cookie = `googtrans=${val};path=/${exp}`;
    document.cookie = `googtrans=${val};path=/;domain=.${host}${exp}`;
    location.reload();
  };

  return (
    <div className="mt-3">
      <p className="mb-1 text-xs text-muted-foreground">More languages / और भाषाएँ</p>
      <div className="flex flex-wrap gap-1.5">
        {LANGS.map(([c, label]) => (
          <button key={c || "off"} onClick={() => pick(c)}
            className={`rounded-full border px-3 py-1 text-xs ${code === c ? "bg-primary text-primary-foreground" : "border-border"}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Loads the translator once when a language cookie is set. */
export function TranslatorLoader() {
  useEffect(() => {
    if (!current() || document.getElementById("gt-script")) return;
    const w = window as unknown as { googleTranslateElementInit?: () => void; google?: any };
    w.googleTranslateElementInit = () => {
      new w.google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "gt-el");
    };
    const s = document.createElement("script");
    s.id = "gt-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(s);
  }, []);
  return <div id="gt-el" className="hidden" />;
}
