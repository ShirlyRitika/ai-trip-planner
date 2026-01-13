import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Itinerary() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("latestTrip");
    if (!saved) navigate("/");
    else setTrip(JSON.parse(saved));
  }, []);

  if (!trip) return null;

  const intensityStyle = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#ecfeff,_#f0fdf4)] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-500 text-transparent bg-clip-text">
            Your AI Travel Plan 🌍
          </h1>
          <p className="text-sm text-gray-500">
            {trip.from} → {trip.to} • {trip.days} days • ₹{trip.budget}
          </p>
        </div>

        {trip.itinerary.map((day, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-6 space-y-4"
          >
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-sky-300/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-emerald-300/20 rounded-full blur-3xl" />

            <div className="flex justify-between items-center relative">
              <h3 className="text-xl font-semibold">
                Day {day.day} — {day.title}
              </h3>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  intensityStyle[day.travelIntensity]
                }`}
              >
                {day.travelIntensity}
              </span>
            </div>

            <ul className="list-disc ml-5 text-gray-700 relative">
              {day.activities.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>

            <div className="bg-white rounded-xl p-4 shadow w-fit text-center relative">
              <p className="text-xs text-gray-500">Estimated Cost</p>
              <p className="text-2xl font-bold text-sky-600">
                ₹{day.estimatedCost}
              </p>
            </div>
          </motion.div>
        ))}

        <div className="flex justify-center gap-4 pt-6">
          <button
            onClick={() => navigate("/budget")}
            className="bg-gradient-to-r from-sky-600 to-emerald-500 text-white px-8 py-3 rounded-xl font-medium hover:scale-[1.03] transition shadow-lg"
          >
            View Budget Summary
          </button>

          <button
            onClick={() => navigate("/saved")}
            className="bg-white/70 backdrop-blur border px-8 py-3 rounded-xl shadow hover:scale-[1.03] transition"
          >
            Save Trip
          </button>
        </div>
      </div>
    </div>
  );
}
