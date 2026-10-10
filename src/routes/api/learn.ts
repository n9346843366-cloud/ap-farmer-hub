import { createFileRoute } from "@tanstack/react-router";
import { agriStream, errorResponse } from "@/lib/ai/gateway.server";

export const Route = createFileRoute("/api/learn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const b = (await request.json()) as { crop?: string; area?: string; method?: string; soil?: string; water?: string; location?: string; lang?: "en" | "te" };
          if (!b.crop?.trim()) return new Response(JSON.stringify({ error: "Tell us which crop you want to grow." }), { status: 400 });
          const system = `You are VERDIX Learning Hub, a practical farm planning advisor for small farmers in Andhra Pradesh / Telangana, India.
Give a realistic plan with APPROXIMATE costs in Indian Rupees (2025-26 rural rates). Use markdown with short headings and bullet points / small tables. Simple words.
Always include these sections:
1. Spacing — plant-to-plant and row-to-row distance (feet and metres), and number of plants/seeds needed for the given area.
2. Planting method — compare by labour vs tractor vs machine (transplanter/seed drill) with cost for the area, and recommend the best for the chosen method.
3. Investment estimate — table: land preparation, seeds/saplings, fertiliser & manure, irrigation (drip if suitable), plant protection, labour, other; with a total for the area and per acre.
4. Timeline — when you get first harvest and yearly maintenance cost.
5. Expected yield & approx income, and break-even.
6. Tips & one government scheme that helps (e.g. MIDH/horticulture subsidy, PMKSY drip subsidy).
Say clearly that numbers are estimates and vary by village.
Write in ${b.lang === "te" ? "simple Telugu" : "simple English"}.`;
          const user = `Crop: ${b.crop}\nArea: ${b.area || "1"} acres\nPreferred planting method: ${b.method || "not sure"}\nSoil: ${b.soil || "unknown"}\nWater: ${b.water || "unknown"}\nLocation: ${b.location || "Andhra Pradesh"}`;
          const result = agriStream(request, system, [{ role: "user", content: user }], "low");
          return result.toTextStreamResponse();
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
