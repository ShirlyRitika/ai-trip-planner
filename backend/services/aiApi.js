import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:5000/api"
})

export const generateTripAI = (data) => {
  return api.post("/ai/generate", data)
}
