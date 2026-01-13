import { create } from "zustand"

export const useTripStore = create((set) => ({
  currentTrip: null,
  trips: [],

  setCurrentTrip: (trip) => set({ currentTrip: trip }),

  saveTrip: (trip) =>
    set((state) => ({
      trips: [...state.trips, trip]
    })),

  deleteTrip: (index) =>
    set((state) => ({
      trips: state.trips.filter((_, i) => i !== index)
    }))
}))
