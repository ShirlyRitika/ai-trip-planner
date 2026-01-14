import axios from "axios";
import { verifyLocation } from "../services/locationService.js";

// --- GEO HELPERS ---

const geocode = async (query) => {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: query, format: "json", limit: 1 }
  });
  return res.data[0] || null;
};

const isInsideDestination = async (place, destination) => {
  const p = await geocode(place);
  const d = await geocode(destination);

  if (!p || !d) return false;

  const pName = (p.display_name || "").toLowerCase();
  const dName = (d.display_name || "").toLowerCase();

  // Place must literally belong to the destination
  return pName.includes(dName);
};


// --- MAIN CONTROLLER ---

export const generateTrip = async (req, res) => {

  console.log("🎯 CONTROLLER RECEIVED:", req.body);


  try {
    const { fromCity, destination, days, budget, familyType } = req.body;

    if (!(await verifyLocation(fromCity, destination))) {
      return res.status(400).json({ error: "Invalid city or destination" });
    }

    const prompt = `
You are a STRICT itinerary generator.

RULES:
1. Trip MUST start from "${fromCity}"
2. ALL activities MUST stay inside "${destination}"
3. NEVER mention any place outside "${destination}"
4. EVERY activity must include its location in the "place" field
5. DO NOT put place names inside the "activity" text
6. If any rule is broken, the answer is INVALID

Return ONLY JSON:

{
  "days": [
    {
      "day": 1,
      "title": "",
      "activities": [
        {
          "place": "Exact location name inside ${destination}",
          "activity": "What to do there",
          "cost": 0
        }
      ],
      "travelIntensity": "Low|Medium|High",
      "estimatedCost": 0
    }
  ]
}
`;

    for (let attempt = 0; attempt < 10; attempt++) {

      const ai = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        },
        { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
      );

      const raw = ai.data.choices[0].message.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(raw);

      let valid = true;

      for (const day of parsed.days) {
        for (const act of day.activities) {
          if (!act.place) { valid = false; break; }

          const ok = await isInsideDestination(act.place, destination);
          if (!ok) { valid = false; break; }
        }
        if (!valid) break;
      }

      if (valid) {
        console.log("✅ Valid itinerary produced");
        return res.json(parsed);
      }

      console.log("🔁 AI violated geography — retrying...");
    }

    return res.status(400).json({ error: "AI failed geographic validation" });

  } catch (err) {
    console.error("❌ Trip generation failed:", err);
    res.status(500).json({ error: "Trip generation failed" });
  }
};
