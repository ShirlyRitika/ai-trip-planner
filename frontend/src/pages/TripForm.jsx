import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { generateTripAI } from "../services/aiApi";

export default function TripForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    from: "",
    to: "",
    days: "",
    budget: "",
    family: "Solo",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.from || !form.to || !form.days || !form.budget) {
      setError("Please fill all fields");
      return;
    }

    if (form.days <= 0 || form.budget < 1000) {
      setError("Please enter valid trip details");
      return;
    }

    try {
      setLoading(true);
      const response = await generateTripAI(form);
      localStorage.setItem("latestTrip", JSON.stringify(response.data));
      navigate("/itinerary");
    } catch (err) {
      console.error(err);
      setError("AI failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#ecfeff,_#f0fdf4)] flex items-center justify-center p-6">
      <div className="relative bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-10 w-full max-w-md space-y-7">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-500 text-transparent bg-clip-text">
            Plan your next escape ✈️
          </h1>
          <p className="text-sm text-gray-500">
            AI-crafted journeys, just for you
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <InputField
            label="From City"
            name="from"
            value={form.from}
            onChange={handleChange}
          />
          <InputField
            label="Destination"
            name="to"
            value={form.to}
            onChange={handleChange}
          />
          <InputField
            label="Number of Days"
            type="number"
            name="days"
            value={form.days}
            onChange={handleChange}
          />
          <InputField
            label="Budget (₹)"
            type="number"
            name="budget"
            value={form.budget}
            onChange={handleChange}
          />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Family Type</p>
          <select
            name="family"
            value={form.family}
            onChange={handleChange}
            className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-none bg-white"
          >
            <option>Solo</option>
            <option>Couple</option>
            <option>Friends</option>
            <option>Family with kids</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-600 to-emerald-500 text-white py-3 rounded-xl font-medium hover:scale-[1.02] transition disabled:opacity-50 shadow-lg"
        >
          {loading ? "Crafting your trip..." : "Generate Trip with AI"}
        </button>
      </div>
    </div>
  );
}
