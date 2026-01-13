import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTripStore } from "../store/tripStore";

export default function Budget() {
  const navigate = useNavigate();
  const saveTrip = useTripStore((state) => state.saveTrip);
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("latestTrip");
    if (!saved) navigate("/");
    else setTrip(JSON.parse(saved));
  }, []);

  if (!trip) return null;

  const totalBudget = Number(trip.budget);

  const breakdown = {
    stay: Math.round(totalBudget * 0.35),
    transport: Math.round(totalBudget * 0.25),
    food: Math.round(totalBudget * 0.25),
    activities: Math.round(totalBudget * 0.15),
  };

  const total =
    breakdown.stay +
    breakdown.transport +
    breakdown.food +
    breakdown.activities;

  const perDay = Math.round(total / Number(trip.days));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#ecfeff,_#f0fdf4)] p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-500 text-transparent bg-clip-text">
            Trip Budget Summary 💰
          </h1>
        </div>

        <motion.div className="bg-white/70 rounded-3xl p-8 space-y-6 shadow-xl">
          <div className="flex justify-between">
            <p>Total Budget</p>
            <p className="text-2xl font-semibold">₹{total}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <BudgetItem label="Stay" amount={breakdown.stay} />
            <BudgetItem label="Transport" amount={breakdown.transport} />
            <BudgetItem label="Food" amount={breakdown.food} />
            <BudgetItem label="Activities" amount={breakdown.activities} />
          </div>

          <div className="flex justify-between bg-white p-4 rounded-xl">
            <p>Per Day Cost</p>
            <p className="text-xl font-semibold">₹{perDay}</p>
          </div>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              saveTrip({ ...trip, budget: breakdown });
              navigate("/saved");
            }}
            className="bg-gradient-to-r from-sky-600 to-emerald-500 text-white px-8 py-3 rounded-xl shadow-lg"
          >
            Save Trip
          </button>

          <button
            onClick={() => navigate("/")}
            className="bg-white px-8 py-3 rounded-xl shadow"
          >
            New Trip
          </button>
        </div>
      </div>
    </div>
  );
}

function BudgetItem({ label, amount }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 flex justify-between">
      <p>{label}</p>
      <p className="font-semibold">₹{amount}</p>
    </div>
  );
}
