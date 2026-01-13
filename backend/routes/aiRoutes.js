import express from "express";
import { generateTrip } from "../services/aiService.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    console.log("Incoming request:", req.body);

    const { from, to, days, budget, family } = req.body;

    const prompt = `
You are an expert AI travel planner.

Create a ${days}-day travel itinerary from ${from} to ${to} for ${family}.
Total budget: ₹${budget}.

Respond ONLY with valid JSON in this format:

{
  "itinerary": [
    {
      "day": 1,
      "title": "string",
      "activities": ["string"],
      "travelIntensity": "Low | Medium | High",
      "estimatedCost": number
    }
  ],
  "budget": {
    "stay": number,
    "transport": number,
    "food": number,
    "activities": number
  }
}

No explanations. No markdown. No extra text.
`;

    const result = await generateTrip(prompt);

    console.log("AI raw result:", result);

    const jsonMatch = result.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    res.json({
      ...parsed,
      from,
      to,
      days,
      budget,
      family
    });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
