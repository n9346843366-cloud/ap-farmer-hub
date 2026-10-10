import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout, seo } from "@/components/AppShell";
import { Notice } from "@/components/kit";
import { useApp } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { clearPendingPassword, emailKey, onVerified, takePendingPassword } from "@/lib/verify-sync";

export const Route = createFileRoute("/verify")({
  validateSearch: (s: Record<string, unknown>) => ({ email: typeof s.email === "string" ? s.email : "" }),
  head: () => seo("Verify email", "Enter the code sent to your email to finish creating your VERDIX account."),
  component: Verify,
});

function Verify() {
  const { email: initial } = Route.useSearch();
  const { lang } = useApp();
  const T = (en: string, te: string) => (lang === "te" ? te : en);
  const nav = useNavigate();
  const [email] = useState(initial);

  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    let off: (() => void) | undefined;
    let alive = true;
    const finish = () => { if (alive) { setWaiting(false); nav({ to: "/" }); } };
    const check = () => supabase.auth.getUser().then(({ data }) => { if (data.user?.email_confirmed_at) finish(); });
    check();
    const { data } = supabase.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_IN") check(); });
    window.addEventListener("focus", check);
    // If the email was verified on another device (e.g. phone), that device
    // broadcasts "verified"; sign in here with the password saved at registration.
    (async () => {
      if (!email) return;
      const key = await emailKey(email);
      if (!alive) return;
      off = await onVerified(key, async () => {
        const pw = takePendingPassword(key);
        if (!pw) { toast.success(T("Email verified! Please log in.", "ఈమెయిల్ ధృవీకరించబడింది! లాగిన్ అవ్వండి.")); nav({ to: "/login" }); return; }
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pw });
        if (error) { nav({ to: "/login" }); return; }
        toast.success(T("Email verified — you're signed in!", "ఈమెయిల్ ధృవీకరించబడింది — మీరు లాగిన్ అయ్యారు!"));
        finish();
      });
    })();
    return () => { alive = false; data.subscription.unsubscribe(); window.removeEventListener("focus", check); off?.(); if (email) void emailKey(email).then(clearPendingPassword); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav, email]);

  const resend = async () => {
    if (!email) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: window.location.origin } });
    if (error) toast.error(error.message); else toast.success(T("New email sent", "కొత్త ఈమెయిల్ పంపాము"));
  };

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-extrabold tracking-tight">{T("Verify your email", "ఈమెయిల్ ధృవీకరణ")}</h1>
      <form onSubmit={(e) => e.preventDefault()} className="glass mt-5 space-y-4 p-5">
        <Notice tone="info">{T("Open the email we sent and tap the \"Verify Email\" button to agree and continue. You can open it on any device — this page will sign you in automatically.", "మేము పంపిన ఈమెయిల్ తెరిచి \"Verify Email\" బటన్ నొక్కండి — ఏ డివైజ్‌లోనైనా తెరవండి, ఈ పేజీ ఆటోమేటిక్‌గా లాగిన్ చేస్తుంది.")}</Notice>
        {waiting && <p className="text-center text-xs text-muted-foreground">{T("Waiting for verification…", "ధృవీకరణ కోసం వేచి ఉంది…")}</p>}
        <div className="flex justify-between text-sm">
          <button type="button" onClick={resend} className="font-medium text-primary">{T("Resend email", "ఈమెయిల్ మళ్లీ పంపండి")}</button>
          <Link to="/login" className="font-medium text-primary">{T("Login", "లాగిన్")}</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
