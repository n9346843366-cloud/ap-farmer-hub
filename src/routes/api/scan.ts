import { createFileRoute } from "@tanstack/react-router";
import { agriStream, errorResponse } from "@/lib/ai/gateway.server";

export const Route = createFileRoute("/api/scan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { image, crop, lang } = (await request.json()) as { image?: string; crop?: string; lang?: "en" | "te" };
          if (!image || !image.startsWith("data:image/")) return new Response(JSON.stringify({ error: "Please add a photo." }), { status: 400 });
          if (image.length > 7_000_000) return new Response(JSON.stringify({ error: "Photo is too large." }), { status: 400 });
          const system = `You are VERDIX Crop Doctor, an experienced plant pathologist for Indian farmers.
The farmer says this photo is of: ${crop || "unknown crop"}.
Step 1: Identify what plant is actually in the photo. If it is not a plant, or it is clearly a DIFFERENT plant than the farmer chose, set cropMatches=false.
Step 2: If it matches, diagnose: healthy or the specific disease / pest / nutrient deficiency.
Return ONLY a JSON object, no markdown, keys:
detectedPlant (string), cropMatches (boolean), issue (short name, or "Healthy"), confidence (integer 0-100, honest), healthy (boolean),
symptoms, causes, precautions (immediate actions), nextSteps (each 1-3 short sentences),
fertilizers (array of strings: which fertiliser/nutrient to apply and how, e.g. "Zinc sulphate 0.5% foliar spray" or "Urea 50 kg/acre split in 2"),
medicines (array of strings: recommended spray with common product/active ingredient name and typical label dose per litre of water, e.g. "Mancozeb 75% WP – 2.5 g per litre"; empty if healthy),
organic (array of strings: organic / low-cost options like neem oil 5 ml/L),
expertWhen (1 sentence).
Always add in precautions: wear gloves/mask, follow the product label, do not spray before rain.
Write all text values in ${lang === "te" ? "simple Telugu" : "simple English"}.`;
          const result = agriStream(
            request,
            system,
            [{ role: "user", content: [{ type: "text", text: `Crop: ${crop || "unknown"}. Analyse this photo.` }, { type: "image", image }] }],
            "low",
          );
          const text = await result.text;
          const match = text.match(/\{[\s\S]*\}/);
          if (!match) return new Response(JSON.stringify({ error: "Could not read the analysis. Please try another photo." }), { status: 502 });
          const parsed = JSON.parse(match[0]);
          parsed.confidence = Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0)));
          return Response.json(parsed);
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
