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

export const validateLocation = async (from, to) => {
  try {
    const fromResults = await searchPlace(from);
    const toResults = await searchPlace(to);

    if (!fromResults.length || !toResults.length) return false;

    const isRealCity = (place) => {
      const a = place.address || {};
      return a.city || a.town || a.village || a.municipality || a.county;
    };

    const isRealCountry = (place) => {
      const a = place.address || {};
      return a.country;
    };

    const fromValid = fromResults.some(isRealCity);
    const toValid = toResults.some(p => isRealCity(p) || isRealCountry(p));

    return fromValid && toValid;
  } catch {
    return false;
  }
};
