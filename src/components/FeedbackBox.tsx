import { useState } from "react";
import { toast } from "sonner";
import { Btn, Card, Eyebrow, inputCls, useT } from "@/components/kit";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/store";

/** Lets a farmer suggest changes; every message is saved for the app owner. */
export function FeedbackBox() {
  const T = useT();
  const { user } = useApp();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const m = msg.trim();
    if (!m) return toast.error(T("Please write your message", "దయచేసి మీ సందేశం రాయండి"));
    setBusy(true);
    const { data } = await supabase.auth.getUser();
    if (!data.user) { setBusy(false); return toast.error(T("Please log in first", "ముందు లాగిన్ అవ్వండి")); }
    const { error } = await supabase.from("feedback_messages").insert({
      user_id: data.user.id, name: user?.name ?? null, email: data.user.email ?? null, message: m.slice(0, 4000),
    });
    setBusy(false);
    if (error) return toast.error(T("Could not send. Please try again.", "పంపలేకపోయాం. మళ్లీ ప్రయత్నించండి."));
    setMsg("");
    toast.success(T("Thank you! Your message was sent.", "ధన్యవాదాలు! మీ సందేశం పంపబడింది."));
  };

  return (
    <Card className="space-y-2">
      <Eyebrow>💬 {T("Suggest a change", "మార్పు సూచించండి")}</Eyebrow>
      <p className="text-sm text-muted-foreground">{T("Want something changed or added? Tell us.", "ఏదైనా మార్చాలా లేదా జోడించాలా? మాకు చెప్పండి.")}</p>
      <textarea className={`${inputCls} min-h-24 py-2`} value={msg} maxLength={4000} onChange={(e) => setMsg(e.target.value)} placeholder={T("Type your idea…", "మీ ఆలోచన రాయండి…")} />
      <Btn className="w-full" disabled={busy} onClick={send}>{busy ? "…" : T("Send", "పంపండి")}</Btn>
    </Card>
  );
}
