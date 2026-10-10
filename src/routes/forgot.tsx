import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, seo } from "@/components/AppShell";
import { Btn, Field, inputCls, Notice } from "@/components/kit";
import { useApp } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot")({
  head: () => seo("Forgot password", "Get a link by email to set a new VERDIX password."),
  component: Forgot,
});

function Forgot() {
  const { t, lang } = useApp();
  const T = (en: string, te: string) => (lang === "te" ? te : en);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const em = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return toast.error(T("Enter a valid email address", "సరైన ఈమెయిల్ ఇవ్వండి"));
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(em, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-extrabold tracking-tight">{t("forgot")}</h1>
      <div className="glass mt-5 space-y-4 p-5">
        {sent ? (
          <Notice tone="ok">{T("Check your email and tap “Reset password” to set a new password.", "మీ ఈమెయిల్ చూసి “Reset password” నొక్కి కొత్త పాస్‌వర్డ్ పెట్టండి.")}</Notice>
        ) : (
          <>
            <Field label={T("Email address", "ఈమెయిల్ చిరునామా")}><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Btn className="w-full" disabled={busy} onClick={send}>{T("Reset password", "పాస్‌వర్డ్ రీసెట్")}</Btn>
          </>
        )}
        <Link to="/login" className="block text-center text-sm font-medium text-primary">← {t("login")}</Link>
      </div>
    </AuthLayout>
  );
}
