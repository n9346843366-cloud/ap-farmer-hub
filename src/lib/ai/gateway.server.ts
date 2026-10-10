import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.server";

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const MODEL = "openai/gpt-6-astra";

export function agriStream(request: Request, system: string, messages: ModelMessage[], effort: "low" | "medium" = "low") {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw Object.assign(new Error("AI is not configured"), { statusCode: 401 });
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return streamText({
    model: provider.responses(MODEL),
    system,
    messages,
    abortSignal: request.signal,
    maxRetries: 0,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: effort,
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
}

export function errorResponse(e: unknown) {
  const err = e as { statusCode?: number; message?: string };
  const status = err?.statusCode ?? 500;
  const message =
    status === 402
      ? "AI credits are used up. Please add credits to continue."
      : status === 429
        ? "Too many requests right now. Please wait a moment and try again."
        : status === 403
          ? "AI access is currently blocked for this workspace."
          : "The AI assistant is unavailable right now. Please try again.";
  return new Response(JSON.stringify({ error: message }), { status, headers: { "Content-Type": "application/json" } });
}

export const SAFETY = `You are VERDIX, a friendly farming assistant for small and medium farmers in Andhra Pradesh / Telangana, India.
Rules:
- Use very simple words. Short sentences. Use bullet points. Avoid scientific terms unless you explain them.
- Use the farmer's farm context (crop, location, soil, stage, tree age) in your answer.
- If information is missing, say what you are assuming and ask at most one short question.
- Never present advice as guaranteed. Mention uncertainty when needed.
- Fertilizers/pesticides: never give exact pesticide doses or unsafe chemical mixes. Prefer integrated pest management, encourage soil testing, following product labels, and consulting the local Agriculture Officer / Rythu Bharosa Kendra (RBK) or KVK for serious issues.
- Never invent real-time weather or market prices. If asked, say live data is not connected and suggest checking IMD or Agmarknet.
- Keep answers under about 150 words unless asked for detail.`;
