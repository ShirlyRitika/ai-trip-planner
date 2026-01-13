AI Trip Planner

An AI-powered web app that generates personalized travel itineraries based on user input and family type.

✨ Features
AI-generated day-wise itinerary
Travel intensity & estimated cost per day
Smart budget breakdown (Stay, Transport, Food, Activities)
Save, view, and delete trips

Fully responsive UI

🧠 AI
Uses a real AI model via Groq API.
Prompt is designed to return strict JSON with itinerary and budget for reliable frontend rendering.

🛠 Tech Stack
React, Vite, Tailwind, Node.js, Express, Groq API

🚀 Run Locally

Backend
cd backend
npm install
# create .env file
GROQ_API_KEY=your_api_key_here
npm run dev

Frontend
cd frontend
npm install
npm run dev
