import { useTripStore } from "../store/tripStore";

export default function SavedTrips() {
  const { trips, deleteTrip } = useTripStore();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#ecfeff,_#f0fdf4)] p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-500 text-transparent bg-clip-text">
            Saved Trips 🧳
          </h1>
          <p className="text-sm text-gray-500">
            Your favorite journeys, stored safely
          </p>
        </div>

        {trips.length === 0 && (
          <div className="bg-white/70 backdrop-blur border border-white/40 rounded-2xl shadow p-8 text-center text-gray-500">
            No trips saved yet
          </div>
        )}

        {trips.map((trip, i) => {
          const total =
            trip.budget.stay +
            trip.budget.transport +
            trip.budget.food +
            trip.budget.activities;

          return (
            <div
              key={i}
              className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-6 flex justify-between items-center"
            >
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-sky-300/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-emerald-300/20 rounded-full blur-3xl" />

              <div className="relative">
                <p className="font-semibold text-lg">Trip #{i + 1}</p>
                <p className="text-gray-500 text-sm">Total Budget: ₹{total}</p>
              </div>

              <button
                onClick={() => deleteTrip(i)}
                className="relative bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-xl hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
