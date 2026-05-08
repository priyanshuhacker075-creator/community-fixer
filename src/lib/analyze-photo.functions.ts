import { createServerFn } from "@tanstack/react-start";

export type PhotoAnalysis = {
  category:
    | "Fire" | "Smoke" | "Dumping" | "Air Pollution" | "Water Pollution"
    | "Trash" | "Graffiti" | "Pothole" | "Streetlight" | "Sidewalk" | "Tree" | "Signage" | "Other";
  severity: "none" | "low" | "medium" | "high" | "critical";
  confidence: number;
  title: string;
  description: string;
  reasoning: string;
};

export const analyzePhoto = createServerFn({ method: "POST" })
  .inputValidator((data: { imageDataUrl: string }) => {
    if (!data?.imageDataUrl?.startsWith("data:image/")) {
      throw new Error("imageDataUrl must be a data:image/* URL");
    }
    return data;
  })
  .handler(async ({ data }): Promise<PhotoAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are CivicFix Vision — an environmental & civic-hazard analyst.
Look at the uploaded photo and classify what kind of pollution or civic issue is visible.

CATEGORIES (pick the single best fit):
- Fire: visible active flames, burning structures/vegetation
- Smoke: visible smoke plume, haze, smog WITHOUT clear flames
- Dumping: illegal dumping of construction debris, tires, bulk waste
- Air Pollution: smog, haze, low visibility from air quality
- Water Pollution: discoloration, foam, oil sheen, algae, debris in water
- Trash: ordinary litter / overflowing bins
- Graffiti, Pothole, Streetlight, Sidewalk, Tree, Signage: civic infrastructure
- Other: anything else

SEVERITY rubric (be calibrated, not alarmist):
- none: photo shows no pollution / civic issue at all
- low: minor, cosmetic, isolated (a bit of litter, small graffiti, faint haze)
- medium: clearly noticeable, localized hazard (overflowing bin, moderate smoke, foam patches)
- high: large-scale, serious health/safety risk (thick black smoke, large dumping, dense smog)
- critical: imminent danger (active fire, toxic spill, mass evacuation-level smoke)

Return a short user-facing title (<= 60 chars), a 1-2 sentence description, and a brief reasoning.`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this photo and classify the pollution / civic issue." },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_classification",
            description: "Return the structured classification of the image.",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  enum: ["Fire","Smoke","Dumping","Air Pollution","Water Pollution","Trash","Graffiti","Pothole","Streetlight","Sidewalk","Tree","Signage","Other"],
                },
                severity: { type: "string", enum: ["none","low","medium","high","critical"] },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                title: { type: "string" },
                description: { type: "string" },
                reasoning: { type: "string" },
              },
              required: ["category","severity","confidence","title","description","reasoning"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_classification" } },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      if (resp.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
      throw new Error(`AI gateway error ${resp.status}: ${text}`);
    }

    const json = await resp.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) throw new Error("AI did not return structured output");
    const parsed = JSON.parse(call.function.arguments) as PhotoAnalysis;
    return parsed;
  });
