import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, seo } from "@/components/AppShell";
import { Btn, Field, inputCls } from "@/components/kit";
import { LocationPicker } from "@/components/LocationPicker";
import { useApp } from "@/lib/store";
import { toFarmPatch, type LocInfo } from "@/lib/location";
import { isValidMobile, normalizeMobile } from "@/lib/phone";
import { supabase } from "@/integrations/supabase/client";
import { emailKey, savePendingPassword } from "@/lib/verify-sync";

export const Route = createFileRoute("/register")({
  head: () => seo("Register", "Create your VERDIX farmer account with your email address."),
  component: Register,
});

function Register() {
  const { t, lang } = useApp();
  const nav = useNavigate();
  const T = (en: string, te: string) => (lang === "te" ? te : en);
  const [f, setF] = useState({ name: "", email: "", mobile: "", location: "", password: "" });
  const [place, setPlace] = useState<LocInfo>({ location: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = f.email.trim().toLowerCase();
    if (!f.name.trim()) return toast.error(T("Please enter your name", "పేరు ఇవ్వండి"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error(T("Please enter a valid email address", "సరైన ఈమెయిల్ ఇవ్వండి"));
    if (!isValidMobile(f.mobile)) return toast.error(T("Please try with a valid mobile number", "దయచేసి సరైన మొబైల్ నంబర్‌తో ప్రయత్నించండి"));
    if (!f.location.trim()) return toast.error(T("Please enter your village / town", "ప్రాంతం ఇవ్వండి"));
    if (f.password.length < 6) return toast.error(T("Password needs at least 6 characters", "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు"));
    setBusy(true);
    const loc = toFarmPatch(place);
    const { data, error } = await supabase.auth.signUp({
      email, password: f.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          ...loc, name: f.name.trim(), mobile: normalizeMobile(f.mobile), location: f.location.trim(), language: lang,
                  },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    // Keep the password on this device only, so it can sign in automatically
    // once the email is verified — even if verified on another device.
    savePendingPassword(await emailKey(email), f.password);
    if (data.user && data.user.identities?.length === 0) {
      toast.error(T("This email is already registered. Please log in.", "ఈ ఈమెయిల్ ఇప్పటికే నమోదైంది. లాగిన్ అవ్వండి."));
      return nav({ to: "/login" });
    }
    toast.success(T("Check your email and tap Verify Email to continue", "మీ ఈమెయిల్ తెరిచి Verify Email నొక్కండి"));
    nav({ to: "/verify", search: { email } });
  };

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-extrabold tracking-tight">{t("register")}</h1>
      <form onSubmit={submit} className="glass mt-5 space-y-4 p-5">
        <Field label={t("name")}><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} /></Field>
        <Field label={T("Email address", "ఈమెయిల్ చిరునామా")}><input className={inputCls} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={120} /></Field>
        <Field label={t("mobile")}><input className={inputCls} inputMode="numeric" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} maxLength={14} /></Field>
        <Field label={t("location")}>
          <LocationPicker value={place} onChange={(l) => { setPlace(l); setF((p) => ({ ...p, location: l.location })); }} />
        </Field>
        <Field label={t("password")}><input className={inputCls} type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <Btn type="submit" className="w-full" disabled={busy}>{busy ? "…" : t("register")}</Btn>
        <p className="text-center text-sm">
          {T("Already registered?", "ఇప్పటికే నమోదయ్యారా?")} <Link to="/login" className="font-medium text-primary">{t("login")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
