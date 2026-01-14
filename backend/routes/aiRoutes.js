import express from "express";
import { generateTrip } from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  console.log("🧭 ROUTE HIT:", req.body);

  const { from, to, days, budget, family } = req.body;

  // map frontend fields to controller fields
  req.body.fromCity = from;
  req.body.destination = to;
  req.body.familyType = family;

  return generateTrip(req, res);
});

export default router;
