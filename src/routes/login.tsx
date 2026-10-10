import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, seo } from "@/components/AppShell";
import { Btn, Field, inputCls } from "@/components/kit";
import { useApp } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => seo("Login", "Sign in to your VERDIX farm account on any device."),
  component: Login,
});

function Login() {
  const { t, lang } = useApp();
  const T = (en: string, te: string) => (lang === "te" ? te : en);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em || !pw) return toast.error(T("Enter your email and password", "ఈమెయిల్ మరియు పాస్‌వర్డ్ ఇవ్వండి"));
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    setBusy(false);
    if (error) {
      if (/confirm/i.test(error.message)) {
        await supabase.auth.resend({ type: "signup", email: em, options: { emailRedirectTo: window.location.origin } });
        toast.info(T("Please verify your email first. We sent a new code.", "ముందు ఈమెయిల్ ధృవీకరించండి. కొత్త కోడ్ పంపాము."));
        return nav({ to: "/verify", search: { email: em } });
      }
      return toast.error(T("Wrong email or password", "ఈమెయిల్ లేదా పాస్‌వర్డ్ తప్పు"));
    }
    toast.success(T("Welcome back!", "స్వాగతం!"));
    nav({ to: "/" });
  };

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-extrabold tracking-tight">{t("login")}</h1>
      <form onSubmit={submit} className="glass mt-5 space-y-4 p-5">
        <Field label={T("Email address", "ఈమెయిల్ చిరునామా")}>
          <input className={inputCls} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t("password")}>
          <input className={inputCls} type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <Btn type="submit" className="w-full" disabled={busy}>{busy ? "…" : t("login")}</Btn>
        <div className="flex justify-between text-sm">
          <Link to="/forgot" className="font-medium text-primary">{t("forgot")}</Link>
          <Link to="/register" className="font-medium text-primary">{t("register")}</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
