// FORCE RAILWAY REBUILD
console.log("🚀 BACKEND RELOADED — STRICT VERSION ACTIVE");

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("AI Trip Planner Backend Running");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
