import axios from "axios";
import { verifyLocation } from "../services/locationService.js";

const getBoundingBox = async (destination) => {
  const res = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: destination,
        format: "json",
        limit: 1
      },
      headers: {
        "Accept-Language": "en"
      }
    }
  );

  if (!res.data.length) return null;

  const box = res.data[0].boundingbox.map(Number);

  return {
    minLat: box[0],
    maxLat: box[1],
    minLon: box[2],
    maxLon: box[3]
  };
};


const isPlaceInsideRegion = async (place, box) => {
  const res = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: place,
        format: "json",
        limit: 1
      }
    }
  );

  if (!res.data.length) return false;

  const lat = Number(res.data[0].lat);
  const lon = Number(res.data[0].lon);

  return (
    lat >= box.minLat &&
    lat <= box.maxLat &&
    lon >= box.minLon &&
    lon <= box.maxLon
  );
};


const validateItinerary = async (itinerary, box) => {
  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      if (activity.place) {
        const ok = await isPlaceInsideRegion(activity.place, box);
        if (!ok) return false;
      }
    }
  }
  return true;
};


export const generateTrip = async (req, res) => {
  try {
    const { fromCity, destination, days, budget, familyType } = req.body;
console.log("🔥 USING NEW AI CONTROLLER VERSION —", destination);

    if (!fromCity || !destination || !days || !budget || !familyType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Basic real-location validation
    const valid = await verifyLocation(fromCity, destination);
    if (!valid) {
      return res.status(400).json({ error: "Invalid city or destination" });
    }

    const box = await getBoundingBox(destination);
    if (!box) {
      return res.status(400).json({ error: "Could not resolve destination region" });
    }

    // 🧠 STRICT PROMPT (AI CANNOT ESCAPE)
    const prompt = `
You are a professional travel planner.

Rules you MUST follow:
- ALL places must be inside "${destination}"
- Do NOT include any other city, state, or country
- Use only REAL places that exist in "${destination}"
- Respect budget ₹${budget}
- Activities suitable for ${familyType}

Trip details:
Start City: ${fromCity}
Destination: ${destination}
Days: ${days}
Budget: ₹${budget}

Return ONLY valid JSON in this format:

{
  "days": [
    {
      "day": 1,
      "title": "",
      "activities": [
        {
          "time": "9:00 AM",
          "place": "",
          "activity": "",
          "duration": "",
          "cost": 0
        }
      ],
      "travelIntensity": "Low | Medium | High",
      "estimatedCost": 0
    }
  ],
  "budgetSummary": {
    "total": ${budget},
    "stay": 0,
    "transport": 0,
    "food": 0,
    "activities": 0,
    "perDay": 0
  }
}
`;

    let parsed = null;

    // 🔁 Retry AI until geography is valid
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const raw = response.data.choices[0].message.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(raw);

      const ok = await validateItinerary(parsed, box);
      if (ok) break;

      parsed = null;
    }

    if (!parsed) {
      return res.status(400).json({
        error: "AI could not generate a valid itinerary for this destination"
      });
    }

    // 💰 Budget correction
    let total = parsed.days.reduce((sum, d) => sum + d.estimatedCost, 0);

    if (total > budget) {
      const ratio = budget / total;
      parsed.days.forEach(d => {
        d.estimatedCost = Math.round(d.estimatedCost * ratio);
      });
      parsed.budgetSummary.total = budget;
      parsed.budgetSummary.perDay = Math.round(budget / days);
    }

    res.json(parsed);

  } catch (err) {
    console.error("Trip generation error:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
};
