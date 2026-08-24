'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationStore } from '@/stores/location.store';
import { apiClient } from '@/lib/api-client';
import {
  MapPin,
  Crosshair,
  Search,
  X,
  Building2,
  GraduationCap,
  RotateCcw,
  Loader2,
  Check,
} from 'lucide-react';

const POPULAR_CITIES = [
  { name: 'Delhi NCR', city: 'New Delhi', state: 'Delhi' },
  { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'Pune', city: 'Pune', state: 'Maharashtra' },
  { name: 'Kolkata', city: 'Kolkata', state: 'West Bengal' },
  { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Jaipur', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Chandigarh', city: 'Chandigarh', state: 'Punjab' },
];

const POPULAR_CAMPUSES = [
  { name: 'Delhi University (DU North)', city: 'New Delhi', campus: 'Delhi University North Campus' },
  { name: 'IIT Delhi', city: 'New Delhi', campus: 'IIT Delhi Campus' },
  { name: 'IIT Bombay', city: 'Mumbai', campus: 'IIT Bombay Powai' },
  { name: 'IIT Madras', city: 'Chennai', campus: 'IIT Madras Campus' },
  { name: 'BITS Pilani', city: 'Pilani', campus: 'BITS Pilani Campus' },
  { name: 'JNU New Delhi', city: 'New Delhi', campus: 'Jawaharlal Nehru University' },
];

export function LocationSelectorModal() {
  const {
    isModalOpen,
    setModalOpen,
    selectedCity,
    selectedCampus,
    locationName,
    setLocation,
    clearLocation,
  } = useLocationStore();

  const [inputQuery, setInputQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const data = await apiClient<{
            street?: string;
            city: string;
            state: string;
            zipCode: string;
          }>(`/users/reverse-geocode?lat=${lat}&lon=${lon}`);

          setLocation({
            city: data.city,
            state: data.state,
            pincode: data.zipCode,
            coords: { lat, lng: lon },
            name: `${data.city}${data.zipCode ? ` (${data.zipCode})` : ''}`,
            isAutoDetected: true,
          });
        } catch (err: unknown) {
          const msg = (err as Error)?.message || 'Failed to detect location from GPS.';
          setErrorMessage(msg);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMessage('Location permission was denied. Please select your city manually below.');
        } else {
          setErrorMessage('Could not acquire your GPS location.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    // Check if input is a 6-digit pincode
    if (/^\d{6}$/.test(query)) {
      setLocation({
        pincode: query,
        name: `Pincode ${query}`,
        isAutoDetected: false,
      });
      return;
    }

    // Otherwise treat as city/locality
    setLocation({
      city: query,
      name: query,
      isAutoDetected: false,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl z-10 font-sans max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-foreground">Select Your Delivery Location</h3>
                <p className="text-xs text-muted-foreground">Find local sellers and same-campus book deals</p>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* GPS Auto Detect CTA */}
            <button
              onClick={handleDetectGPS}
              disabled={isDetecting}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-secondary/30 bg-secondary/5 hover:bg-secondary/10 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                  {isDetecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Crosshair className="h-5 w-5 group-hover:rotate-45 transition-transform" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {isDetecting ? 'Detecting your GPS location...' : 'Use My Current Location'}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Auto-detect city & postal pincode via GPS</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-secondary uppercase tracking-wider hidden sm:inline">
                Auto Detect →
              </span>
            </button>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Divider with Search Input */}
            <form onSubmit={handleManualSearch} className="space-y-2">
              <label htmlFor="location-query" className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Or enter pincode / city name
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="location-query"
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="e.g. 110007, Delhi, or Pune"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="px-5 h-11 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </form>

            {/* Quick Select: Major Student Campuses */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <GraduationCap className="h-4 w-4 text-secondary" />
                <span>Popular University Campuses</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POPULAR_CAMPUSES.map((c) => {
                  const isSelected = selectedCampus === c.campus;
                  return (
                    <button
                      key={c.name}
                      onClick={() =>
                        setLocation({
                          city: c.city,
                          campus: c.campus,
                          name: c.name,
                          isAutoDetected: false,
                        })
                      }
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                        isSelected
                          ? 'border-secondary bg-secondary/10 text-secondary font-bold ring-1 ring-secondary/20'
                          : 'border-border hover:bg-muted text-text-secondary'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Select: Major Cities */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Building2 className="h-4 w-4 text-secondary" />
                <span>Major Indian Cities</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((c) => {
                  const isSelected = selectedCity?.toLowerCase() === c.city.toLowerCase() && !selectedCampus;
                  return (
                    <button
                      key={c.name}
                      onClick={() =>
                        setLocation({
                          city: c.city,
                          state: c.state,
                          name: c.name,
                          isAutoDetected: false,
                        })
                      }
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-secondary text-secondary-foreground border-secondary font-bold'
                          : 'border-border text-text-secondary bg-muted/30 hover:bg-muted'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer with Current Active Location & Reset */}
          <div className="border-t border-border px-6 py-3.5 bg-muted/20 flex items-center justify-between">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
              <span className="font-semibold">Current:</span>
              <span className="font-bold text-foreground truncate">{locationName}</span>
            </div>

            <button
              onClick={clearLocation}
              className="text-xs font-bold text-muted-foreground hover:text-danger flex items-center gap-1 transition-colors shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset (All India)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default LocationSelectorModal;
