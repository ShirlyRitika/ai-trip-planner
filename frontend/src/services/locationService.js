import axios from "axios";

const searchPlace = async (query) => {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: query,
      format: "json",
      addressdetails: 1,
      limit: 5
    },
    headers: {
      "Accept-Language": "en"
    }
  });
  return res.data;
};

// Unified validation for both frontend & backend
export const validateLocation = async (from, to) => {
  try {
    const fromResults = await searchPlace(from);
    const toResults = await searchPlace(to);

    if (!fromResults.length || !toResults.length) return false;

    const validPlace = (p) => {
      const t = p.type || "";
      return [
        "city",
        "town",
        "village",
        "hamlet",
        "municipality",
        "administrative",
        "county",
        "country"
      ].includes(t);
    };

    const fromValid = fromResults.some(validPlace);
    const toValid = toResults.some(validPlace);

    return fromValid && toValid;
  } catch {
    return false;
  }
};

// Backend alias
export const verifyLocation = validateLocation;
