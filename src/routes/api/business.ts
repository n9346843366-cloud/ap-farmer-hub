import { createFileRoute } from "@tanstack/react-router";
import { agriStream, errorResponse } from "@/lib/ai/gateway.server";

export const Route = createFileRoute("/api/business")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const b = (await request.json()) as { idea?: string; budget?: string; land?: string; water?: string; location?: string; lang?: "en" | "te" };
          const system = `You are VERDIX Business Hub, a practical agri-business advisor for small farmers in Andhra Pradesh / Telangana, India.
Use APPROXIMATE costs in Indian Rupees (2025-26 rural rates). Markdown with short headings, bullets and small tables. Simple words.
If the farmer gave an idea: analyse it honestly for their budget and land — is it suitable (Yes / Maybe / No and why), investment breakdown table, monthly running cost, expected income, break-even time, risks, step-by-step how to start, where to sell, and a matching government scheme or loan (PMEGP, AIF, Mudra, NABARD, PM-FME, dairy/poultry subsidies).
If no idea: suggest 3-4 business ideas that fit their budget and land (e.g. dairy, poultry, goat rearing, mushroom, vermicompost, nursery, honey bees, food processing, custom hiring of machines), each with investment, income per month, break-even and why it fits. Then recommend the best one.
If budget is too low, say so kindly and suggest a smaller start or a loan route.
Say numbers are estimates and vary by village. Keep under about 400 words.
Write in ${b.lang === "te" ? "simple Telugu" : "simple English"}.`;
          const user = `Farmer's idea: ${b.idea?.trim() || "No idea yet — please suggest"}\nMoney available to invest: ₹${b.budget || "not given"}\nLand: ${b.land || "not given"} acres\nWater: ${b.water || "unknown"}\nLocation: ${b.location || "Andhra Pradesh"}`;
          return agriStream(request, system, [{ role: "user", content: user }], "low").toTextStreamResponse();
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
