import { Routes, Route } from "react-router-dom";
import TripForm from "./pages/TripForm";
import Itinerary from "./pages/Itinerary";
import Budget from "./pages/Budget";
import SavedTrips from "./pages/SavedTrips";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TripForm />} />
      <Route path="/itinerary" element={<Itinerary />} />
      <Route path="/budget" element={<Budget />} />
      <Route path="/saved" element={<SavedTrips />} />
    </Routes>
  );
}
// import { Routes, Route } from "react-router-dom";
// import TripForm from "./pages/TripForm";
// import Itinerary from "./pages/Itinerary";
// import Budget from "./pages/Budget";
// import SavedTrips from "./pages/SavedTrips";

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<TripForm />} />
//       <Route path="/itinerary" element={<Itinerary />} />
//       <Route path="/budget" element={<Budget />} />
//       <Route path="/saved" element={<SavedTrips />} />
//     </Routes>
//   );
// }
