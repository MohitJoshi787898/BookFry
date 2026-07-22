'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { User, Address } from '@bookmarket/types';
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Compass,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { isAuthenticated, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Component states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Address Form fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  // Fetch full user profile
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient('/users/profile'),
    enabled: isAuthenticated,
  });

  // Sync profile data to local state
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone: string; avatarUrl: string }) =>
      apiClient('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUser(updatedUser);
      setIsEditingProfile(false);
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean }) =>
      apiClient('/users/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUser(updatedUser);
      setShowAddressForm(false);
      resetAddressForm();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) =>
      apiClient(`/users/addresses/${addressId}`, {
        method: 'DELETE',
      }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUser(updatedUser);
    },
  });

  const setAddressDefaultMutation = useMutation({
    mutationFn: (addressId: string) =>
      apiClient(`/users/addresses/${addressId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isDefault: true }),
      }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUser(updatedUser);
    },
  });

  const resetAddressForm = () => {
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('India');
    setIsDefault(false);
    setLocationError('');
  };

  // Browser Geolocation & Reverse Geocoding
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Query Nominatim public openstreetmap reverse geocoder
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            
            // Build nice street string
            const road = addr.road || addr.suburb || addr.neighbourhood || '';
            const house = addr.house_number || '';
            setStreet(house ? `${house}, ${road}` : road);
            
            setCity(addr.city || addr.town || addr.village || addr.municipality || '');
            setState(addr.state || '');
            setZipCode(addr.postcode || '');
            setCountry(addr.country || 'India');
          } else {
            setLocationError('Could not resolve location address fields.');
          }
        } catch (err) {
          console.error(err);
          setLocationError('Failed to contact geocoding service.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location position unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown geolocation error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfileMutation.mutate({ name, phone, avatarUrl });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode || !country) {
      setLocationError('All address fields are required.');
      return;
    }
    addAddressMutation.mutate({ street, city, state, zipCode, country, isDefault });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        <Link
          href="/books"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>

        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8 flex items-center space-x-3">
          <UserIcon className="h-8 w-8 text-brand" />
          <span>My Profile & Settings</span>
        </h1>

        {!isAuthenticated ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-6">
            <UserIcon className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">Authentication Required</h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2">
                Please log in to manage your profile and shipping locations.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-brand text-white font-semibold rounded hover:bg-brand-hover text-sm shadow-sm transition-all"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 border border-border bg-surface rounded-lg" />
            <div className="h-64 border border-border bg-surface rounded-lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-4">
            <AlertCircle className="h-12 w-12 text-danger mx-auto" />
            <h2 className="font-serif text-xl font-bold text-text-primary">Failed to load profile</h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded hover:bg-brand-hover transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left Column: Personal details */}
            <div className="md:col-span-1 border border-border bg-surface rounded-lg p-6 shadow-xs space-y-6">
              <div className="text-center relative">
                <div className="relative inline-block">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-brand/20 mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-3xl border-2 border-brand/20 mx-auto uppercase">
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold text-text-primary mt-4">{profile?.name}</h3>
                <p className="text-xs text-text-secondary">{profile?.email}</p>
              </div>

              <div className="border-t border-border pt-6">
                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Avatar Image URL</label>
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex-grow py-2 bg-brand text-white font-semibold rounded hover:bg-brand-hover text-xs transition-colors flex items-center justify-center"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          if (profile) {
                            setName(profile.name);
                            setPhone(profile.phone || '');
                            setAvatarUrl(profile.avatarUrl || '');
                          }
                        }}
                        className="px-3 py-2 border border-border text-text-secondary hover:bg-background-subtle rounded text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 text-sm font-sans">
                    <div className="flex items-center space-x-3 text-text-secondary">
                      <Mail className="h-4 w-4 text-brand/70" />
                      <span>{profile?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-text-secondary">
                      <Phone className="h-4 w-4 text-brand/70" />
                      <span>{profile?.phone || <span className="italic text-text-muted">No phone added</span>}</span>
                    </div>

                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full py-2 border border-brand/35 text-brand font-semibold rounded hover:bg-brand/5 text-xs transition-all mt-4"
                    >
                      Edit Basic Profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Address locations */}
            <div className="md:col-span-2 space-y-6">
              <div className="border border-border bg-surface rounded-lg p-6 shadow-xs">
                <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-text-primary">Shipping Addresses</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Manage target locations for order delivery</p>
                  </div>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-3 py-1.5 bg-brand text-white font-semibold rounded hover:bg-brand-hover text-xs flex items-center space-x-1 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Address</span>
                    </button>
                  )}
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="bg-background-subtle rounded-lg p-5 border border-border mb-6 space-y-4 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-text-primary">Add Shipping Address</h3>
                      
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isDetectingLocation}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-brand/10 border border-brand/20 text-brand rounded hover:bg-brand/15 text-[11px] font-bold transition-all disabled:opacity-50"
                      >
                        {isDetectingLocation ? (
                          <Loader2 className="h-3 w-3 animate-spin text-brand" />
                        ) : (
                          <Compass className="h-3 w-3 text-brand" />
                        )}
                        <span>{isDetectingLocation ? 'Locating...' : 'Detect Location'}</span>
                      </button>
                    </div>

                    {locationError && (
                      <div className="p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs flex items-center space-x-2 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{locationError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Street Address</label>
                      <input
                        type="text"
                        placeholder="Flat, House no., Apartment, Street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">City</label>
                        <input
                          type="text"
                          placeholder="e.g. New Delhi"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">State</label>
                        <input
                          type="text"
                          placeholder="e.g. Delhi"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Pincode / ZIP</label>
                        <input
                          type="text"
                          placeholder="6-digit ZIP code"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="default-address"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="rounded text-brand focus:ring-brand cursor-pointer"
                      />
                      <label htmlFor="default-address" className="text-xs font-bold text-text-secondary cursor-pointer">
                        Set as default shipping address
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-3">
                      <button
                        type="submit"
                        disabled={addAddressMutation.isPending}
                        className="px-4 py-2 bg-brand text-white font-semibold rounded hover:bg-brand-hover text-xs transition-colors flex items-center justify-center"
                      >
                        {addAddressMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Save Address'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          resetAddressForm();
                        }}
                        className="px-4 py-2 border border-border text-text-secondary hover:bg-background-subtle rounded text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses List */}
                {profile?.addresses && profile.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {profile.addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`border rounded-lg p-5 flex justify-between items-start gap-4 transition-all ${
                          address.isDefault ? 'border-brand/40 bg-brand/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className={`h-5 w-5 mt-0.5 ${address.isDefault ? 'text-brand' : 'text-text-muted'}`} />
                          <div className="space-y-1 font-sans">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-bold text-text-primary">{address.street}</p>
                              {address.isDefault && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-[9px] font-bold text-brand uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-secondary">
                              {address.city}, {address.state} - {address.zipCode}
                            </p>
                            <p className="text-[10px] text-text-muted font-semibold">{address.country}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => setAddressDefaultMutation.mutate(address._id!)}
                              className="px-2 py-1 border border-border hover:border-brand/30 text-[10px] font-bold text-text-secondary hover:text-brand bg-surface rounded transition-all"
                              title="Set as Default"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => deleteAddressMutation.mutate(address._id!)}
                            className="p-1.5 border border-border hover:border-danger/35 hover:bg-danger/5 text-text-muted hover:text-danger bg-surface rounded transition-all"
                            title="Delete Address"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg space-y-3">
                    <MapPin className="h-10 w-10 text-text-muted mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">No shipping addresses registered</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Add a shipping address to speed up your book purchases.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
