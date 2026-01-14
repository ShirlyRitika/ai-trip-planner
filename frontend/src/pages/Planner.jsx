import { useState } from "react";
import axios from "axios";
import { validateLocation } from "../services/locationService";

export default function Planner() {
  const [fromCity, setFromCity] = useState("");
  const [country, setCountry] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [familyType, setFamilyType] = useState("Solo");

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setTrip(null);
    setLoading(true);

    // 🧾 Basic validation
    if (!fromCity || !country || !destination || !days || !budget) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    // 🔒 Strict location validation
    const isValid = await validateLocation(fromCity.trim(), country.trim());

    if (!isValid) {
      setError("Please enter a real city and country");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/ai/generate", {
        fromCity: fromCity.trim(),
        country: country.trim(),
        destination: destination.trim(),
        days: Number(days),
        budget: Number(budget),
        familyType
      });

      setTrip(res.data);
    } catch (err) {
      console.log(err);
      setError("Trip generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Your AI Travel Plan 🌍</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          className="input"
          placeholder="From City"
          value={fromCity}
          onChange={e => setFromCity(e.target.value)}
        />

        <input
          className="input"
          placeholder="Country"
          value={country}
          onChange={e => setCountry(e.target.value)}
        />

        <input
          className="input"
          placeholder="Destination"
          value={destination}
          onChange={e => setDestination(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Number of Days"
          value={days}
          onChange={e => setDays(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Budget (₹)"
          value={budget}
          onChange={e => setBudget(e.target.value)}
        />

        <select
          className="input"
          value={familyType}
          onChange={e => setFamilyType(e.target.value)}
        >
          <option>Solo</option>
          <option>Couple</option>
          <option>Family with kids</option>
          <option>Family with elders</option>
        </select>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-6 w-full bg-black text-white py-3 rounded-lg"
      >
        {loading ? "Generating..." : "Generate Trip with AI"}
      </button>

      {trip && (
        <div className="mt-10">
          {trip.days.map(day => (
            <div key={day.day} className="border rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-lg">
                Day {day.day} — {day.title}
              </h3>

              <p className="text-sm text-gray-500 mb-2">
                {day.travelIntensity}
              </p>

              <ul className="list-disc ml-5">
                {day.activities.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>

              <p className="mt-2 font-semibold">₹{day.estimatedCost}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
