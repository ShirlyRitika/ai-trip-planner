import axios from "axios";
import { verifyLocation } from "../services/locationService.js";

/* ----------------------------------------------------
   Helper: Get bounding box of destination
---------------------------------------------------- */
const getBoundingBox = async (destination) => {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: destination, format: "json", limit: 1 }
  });

  if (!res.data.length) return null;

  const b = res.data[0].boundingbox.map(Number);
  return {
    minLat: b[0], maxLat: b[1],
    minLon: b[2], maxLon: b[3]
  };
};

/* ----------------------------------------------------
   Helper: Check if a place lies inside destination
---------------------------------------------------- */
const isPlaceInsideRegion = async (place, box) => {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: place, format: "json", limit: 1 }
  });

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

/* ----------------------------------------------------
   Validate entire itinerary
---------------------------------------------------- */
const validateItinerary = async (itinerary, box) => {
  for (const day of itinerary.days) {
    for (const place of day.activities) {
      const ok = await isPlaceInsideRegion(place, box);
      if (!ok) return false;
    }
  }
  return true;
};

/* ----------------------------------------------------
   MAIN CONTROLLER
---------------------------------------------------- */
export const generateTrip = async (req, res) => {
  try {
    const { fromCity, destination, days, budget, familyType } = req.body;

    const real = await verifyLocation(fromCity, destination);
    if (!real) return res.status(400).json({ error: "Invalid location" });

    const box = await getBoundingBox(destination);
    if (!box) return res.status(400).json({ error: "Invalid destination" });

    let finalTrip = null;

    for (let attempt = 1; attempt <= 7; attempt++) {
      console.log("AI attempt:", attempt);

      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "mixtral-8x7b-32768",
          messages: [{
            role: "user",
            content: `
Create a ${days}-day trip staying strictly inside ${destination}.
Use only real places inside ${destination}.
Activities must suit ${familyType}.
Total budget: ₹${budget}.
Return ONLY JSON in this format:
{
 "days":[{"day":1,"title":"","activities":[],"travelIntensity":"","estimatedCost":0}],
 "budgetSummary":{"total":0,"stay":0,"transport":0,"food":0,"activities":0,"perDay":0}
}`
          }],
          temperature: 0.2
        },
        { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
      );

      const raw = response.data.choices[0].message.content
        .replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(raw);

      const valid = await validateItinerary(parsed, box);

      if (valid) {
        finalTrip = parsed;
        break;
      }
    }

    if (!finalTrip) {
      return res.status(400).json({ error: "Could not generate valid itinerary" });
    }

    res.json(finalTrip);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
};
