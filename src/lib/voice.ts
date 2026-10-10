// Browser speech integration (Web Speech API). Swap for a server STT/TTS later.
import { useCallback, useEffect, useRef, useState } from "react";

type SR = {
  lang: string; interimResults: boolean; continuous: boolean;
  start: () => void; stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null;
};

export function useSpeechInput(lang: "en" | "te", onText: (t: string, final: boolean) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const ref = useRef<SR | null>(null);
  const cb = useRef(onText);
  cb.current = onText;

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const start = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const C = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!C) return false;
    const r = new C();
    r.lang = lang === "te" ? "te-IN" : "en-IN";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      let text = "";
      let final = false;
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      cb.current(text, final);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    ref.current = r;
    r.start();
    setListening(true);
    return true;
  }, [lang]);

  const stop = useCallback(() => {
    ref.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}

export function speak(text: string, lang: "en" | "te") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*#_`>-]/g, " ");
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = lang === "te" ? "te-IN" : "en-IN";
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith(lang === "te" ? "te" : "en-IN"));
  if (v) u.voice = v;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
  return true;
}
export const stopSpeaking = () => typeof window !== "undefined" && window.speechSynthesis?.cancel();

export function fileToDataUrl(file: File, max = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}
