'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserLocationState {
  selectedCity: string | null;
  selectedState: string | null;
  selectedPincode: string | null;
  selectedCampus: string | null;
  coords: { lat: number; lng: number } | null;
  locationName: string;
  isAutoDetected: boolean;
  isModalOpen: boolean;

  // Actions
  setLocation: (data: {
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    campus?: string | null;
    coords?: { lat: number; lng: number } | null;
    name?: string;
    isAutoDetected?: boolean;
  }) => void;
  clearLocation: () => void;
  setModalOpen: (open: boolean) => void;
}

export const useLocationStore = create<UserLocationState>()(
  persist(
    (set) => ({
      selectedCity: null,
      selectedState: null,
      selectedPincode: null,
      selectedCampus: null,
      coords: null,
      locationName: 'All India',
      isAutoDetected: false,
      isModalOpen: false,

      setLocation: ({ city, state, pincode, campus, coords, name, isAutoDetected = false }) => {
        let label = 'All India';
        if (campus) {
          label = campus;
        } else if (city && pincode) {
          label = `${city} ${pincode}`;
        } else if (city) {
          label = city;
        } else if (pincode) {
          label = `PIN: ${pincode}`;
        } else if (name) {
          label = name;
        }

        set({
          selectedCity: city || null,
          selectedState: state || null,
          selectedPincode: pincode || null,
          selectedCampus: campus || null,
          coords: coords || null,
          locationName: label,
          isAutoDetected,
          isModalOpen: false,
        });
      },

      clearLocation: () => {
        set({
          selectedCity: null,
          selectedState: null,
          selectedPincode: null,
          selectedCampus: null,
          coords: null,
          locationName: 'All India',
          isAutoDetected: false,
          isModalOpen: false,
        });
      },

      setModalOpen: (open) => set({ isModalOpen: open }),
    }),
    {
      name: 'bookfry_buyer_location',
      partialize: (state) => ({
        selectedCity: state.selectedCity,
        selectedState: state.selectedState,
        selectedPincode: state.selectedPincode,
        selectedCampus: state.selectedCampus,
        coords: state.coords,
        locationName: state.locationName,
        isAutoDetected: state.isAutoDetected,
      }),
    }
  )
);
