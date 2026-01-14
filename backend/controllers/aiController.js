import axios from "axios";
import { verifyLocation } from "../services/locationService.js";

// ---------- GEO HELPERS ----------

const geocode = async (place) => {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: place, format: "json", limit: 1 }
  });
  return res.data[0] || null;
};

const isInsideDestination = async (place, destination) => {
  const p = await geocode(place);
  const d = await geocode(destination);

  if (!p || !d) return false;

  return (
    p.display_name.toLowerCase().includes(destination.toLowerCase()) ||
    p.address?.city === d.address?.city ||
    p.address?.state === d.address?.state ||
    p.address?.country === d.address?.country
  );
};

const validateItinerary = async (trip, destination) => {
  for (const day of trip.days) {
    for (const act of day.activities) {
      const ok = await isInsideDestination(act, destination);
      if (!ok) return false;
    }
  }
  return true;
};

// ---------- MAIN CONTROLLER ----------

export const generateTrip = async (req, res) => {
  try {
    const { fromCity, destination, days, budget, familyType } = req.body;

    const valid = await verifyLocation(fromCity, destination);
    if (!valid) return res.status(400).json({ error: "Invalid location" });

    let final = null;

    for (let i = 1; i <= 10; i++) {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "user",
              content: `
You are a professional travel planner.

Generate a ${days}-day family-aware travel itinerary.

User Details:
From City: ${fromCity}
Destination: ${destination}
Total Budget: ₹${budget}
Family Type: ${familyType}

STRICT RULES:
1. Every activity and place MUST be inside ${destination} only.
2. You are NOT allowed to mention any city, state, or country outside ${destination}.
3. Use only real place names located in ${destination}.
4. Activities must suit the family type.
5. Balance sightseeing and rest.
6. Do NOT exceed the total budget ₹${budget}.
7. Do NOT repeat activities.
8. Output ONLY valid JSON.

Return JSON in this exact format:

{
  "days": [
    {
      "day": 1,
      "title": "",
      "activities": ["", "", ""],
      "travelIntensity": "Low | Medium | High",
      "estimatedCost": 0
    }
  ],
  "budgetSummary": {
    "total": 0,
    "stay": 0,
    "transport": 0,
    "food": 0,
    "activities": 0,
    "perDay": 0
  }
}
`
            }
          ],
          temperature: 0.3
        },
        { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
      );

      const raw = response.data.choices[0].message.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(raw);

      const ok = await validateItinerary(parsed, destination);
      if (ok) {
        final = parsed;
        break;
      }
    }

    if (!final) {
      return res.status(400).json({ error: "AI failed to respect destination" });
    }

    res.json(final);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Trip generation failed" });
  }
};
