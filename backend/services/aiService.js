import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateTrip(prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are an expert travel planner AI." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}
