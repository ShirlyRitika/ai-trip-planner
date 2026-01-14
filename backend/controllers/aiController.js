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

    const box = await getBoundingBox(destination);
    if (!box) return res.status(400).json({ error: "Invalid destination" });

    let parsed = null;

    for (let attempt = 1; attempt <= 8; attempt++) {
      console.log(`AI attempt ${attempt}`);

      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "mixtral-8x7b-32768",
          messages: [{
            role: "user",
            content: `
Generate a ${days}-day travel plan staying strictly inside ${destination}.
Use ONLY real places inside ${destination}. Never include any other city.
Return only JSON.`
          }],
          temperature: 0.1
        },
        { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
      );

      const raw = response.data.choices[0].message.content
        .replace(/```json/g, "").replace(/```/g, "").trim();

      const temp = JSON.parse(raw);

      const valid = await validateItinerary(temp, box);

      if (valid) {
        parsed = temp;
        break;
      }
    }

    if (!parsed) {
      return res.status(400).json({ error: "AI failed to respect destination" });
    }

    res.json(parsed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Trip generation failed" });
  }
};

