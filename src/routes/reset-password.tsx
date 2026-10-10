import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, seo } from "@/components/AppShell";
import { Btn, Field, inputCls } from "@/components/kit";
import { useApp } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => seo("Set new password", "Choose a new password for your VERDIX account."),
  component: Reset,
});

function Reset() {
  const { lang } = useApp();
  const T = (en: string, te: string) => (lang === "te" ? te : en);
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error(T("Password needs at least 6 characters", "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు"));
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(T("This reset link has expired. Please request a new one.", "ఈ లింక్ గడువు ముగిసింది. మళ్లీ అభ్యర్థించండి."));
    toast.success(T("Password changed!", "పాస్‌వర్డ్ మార్చబడింది!"));
    nav({ to: "/" });
  };

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-extrabold tracking-tight">{T("Set a new password", "కొత్త పాస్‌వర్డ్")}</h1>
      <form onSubmit={save} className="glass mt-5 space-y-4 p-5">
        <Field label={T("New password", "కొత్త పాస్‌వర్డ్")}><input className={inputCls} type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
        <Btn type="submit" className="w-full" disabled={busy}>{busy ? "…" : T("Save password", "సేవ్ చేయండి")}</Btn>
      </form>
    </AuthLayout>
  );
}
