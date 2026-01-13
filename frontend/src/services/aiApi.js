import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-trip-planner-production-e9ff.up.railway.app/api"
});

export const generateTripAI = (data) => {
  return api.post("/ai/generate", data);
};
