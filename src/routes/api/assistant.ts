import { createFileRoute } from "@tanstack/react-router";
import type { ModelMessage } from "ai";
import { agriStream, errorResponse, SAFETY } from "@/lib/ai/gateway.server";

type InMsg = { role: "user" | "assistant"; content: string; image?: string };

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages: InMsg[]; context?: string; lang?: "en" | "te" };
          const msgs = (body.messages ?? []).slice(-20);
          if (!msgs.length) return new Response(JSON.stringify({ error: "No message" }), { status: 400 });
          const langRule =
            body.lang === "te"
              ? "Reply ONLY in simple, spoken-style Telugu script (తెలుగు). Keep crop names familiar."
              : "Reply in simple English. If the farmer writes in Telugu, reply in simple Telugu.";
          const system = `${SAFETY}\n${langRule}\nFarmer context:\n${(body.context ?? "Not provided").slice(0, 2000)}`;
          const messages: ModelMessage[] = msgs.map((m) =>
            m.role === "user" && m.image
              ? { role: "user", content: [{ type: "text", text: m.content || "Please look at this crop photo." }, { type: "image", image: m.image }] }
              : { role: m.role, content: m.content },
          );
          const result = agriStream(request, system, messages, "low");
          return result.toTextStreamResponse();
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
