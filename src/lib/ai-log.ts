import { supabase } from "@/integrations/supabase/client";

/** Saves what the farmer asked the AI to their own account (private per user). */
export async function logQuestion(source: string, question: string) {
  const q = question.trim();
  if (!q) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("ai_questions").insert({ user_id: data.user.id, source, question: q.slice(0, 4000) });
}
