// Cross-device email verification: when the farmer taps "Verify Email" in the
// email on another device (e.g. phone), that device broadcasts on a realtime
// channel so the device that registered (e.g. laptop) can sign in automatically.
import { supabase } from "@/integrations/supabase/client";

export async function emailKey(email: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

const PENDING_PREFIX = "verdix:pending:";

export function savePendingPassword(key: string, password: string) {
  try { sessionStorage.setItem(PENDING_PREFIX + key, password); } catch { /* ignore */ }
}

export function takePendingPassword(key: string): string | null {
  try {
    const p = sessionStorage.getItem(PENDING_PREFIX + key);
    if (p) sessionStorage.removeItem(PENDING_PREFIX + key);
    return p;
  } catch { return null; }
}

export function clearPendingPassword(key: string) {
  try { sessionStorage.removeItem(PENDING_PREFIX + key); } catch { /* ignore */ }
}

/** Called on the device where the email was confirmed (SIGNED_IN after verify link). */
export async function broadcastVerified(email: string | undefined) {
  if (!email) return;
  try {
    const key = await emailKey(email);
    const ch = supabase.channel(`verify:${key}`);
    await new Promise<void>((resolve) => ch.subscribe((s) => { if (s === "SUBSCRIBED") resolve(); else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") resolve(); }));
    await ch.send({ type: "broadcast", event: "verified", payload: {} });
    supabase.removeChannel(ch);
  } catch { /* best effort */ }
}

/** Called on the device waiting for verification. */
export async function onVerified(key: string, cb: () => void) {
  const ch = supabase.channel(`verify:${key}`);
  ch.on("broadcast", { event: "verified" }, cb);
  ch.subscribe();
  return () => { supabase.removeChannel(ch); };
}
