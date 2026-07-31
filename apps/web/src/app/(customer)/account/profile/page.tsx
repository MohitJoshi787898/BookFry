"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { User, Address, Order } from "@bookmarket/types";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileNav, ActiveSection } from "@/components/profile/profile-nav";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { ProfileAddresses } from "@/components/profile/profile-addresses";
import { User as UserIcon, Shield, CreditCard, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { isAuthenticated, setUser, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");

  // Profile edit state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Fetch profile
  const { data: profile, isLoading, isError, refetch } = useQuery<User>({
    queryKey: ["user-profile"],
    queryFn: () => apiClient("/users/profile"),
    enabled: isAuthenticated,
  });

  // Fetch recent orders
  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ["profile-orders"],
    queryFn: () => apiClient("/orders"),
    enabled: isAuthenticated,
  });

  // Sync profile state
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || "");
      setAvatarPreview(profile.avatarUrl || "");
    }
  }, [profile]);

  // Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await apiClient("/users/avatar", { method: "POST", body: formData });
      if (res?.avatarUrl) {
        setAvatarPreview(res.avatarUrl);
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        setUser(res);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setAvatarPreview(profile?.avatarUrl || "");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone: string }) =>
      apiClient("/users/profile", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setUser(updatedUser);
      setIsEditingProfile(false);
    },
  });

  // Address Mutations
  const addAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, "_id" | "isDefault"> & { isDefault?: boolean }) =>
      apiClient("/users/addresses", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setUser(updatedUser);
      setShowAddressForm(false);
      resetAddressForm();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) =>
      apiClient(`/users/addresses/${addressId}`, { method: "DELETE" }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setUser(updatedUser);
    },
  });

  const setAddressDefaultMutation = useMutation({
    mutationFn: (addressId: string) =>
      apiClient(`/users/addresses/${addressId}`, {
        method: "PATCH",
        body: JSON.stringify({ isDefault: true }),
      }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setUser(updatedUser);
    },
  });

  const resetAddressForm = () => {
    setStreet(""); setCity(""); setAddrState(""); setZipCode("");
    setCountry("India"); setIsDefault(false); setLocationError("");
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      return;
    }
    setIsDetectingLocation(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          if (data?.address) {
            const addr = data.address;
            const road = addr.road || addr.suburb || addr.neighbourhood || "";
            const house = addr.house_number || "";
            setStreet(house ? `${house}, ${road}` : road);
            setCity(addr.city || addr.town || addr.village || "");
            setAddrState(addr.state || "");
            setZipCode(addr.postcode || "");
            setCountry(addr.country || "India");
          } else {
            setLocationError("Could not resolve address.");
          }
        } catch {
          setLocationError("Geocoding service failed.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        setLocationError(err.code === 1 ? "Location permission denied." : "Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfileMutation.mutate({ name, phone });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !addrState || !zipCode) {
      setLocationError("All fields are required.");
      return;
    }
    addAddressMutation.mutate({ street, city, state: addrState, zipCode, country, isDefault });
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center mx-auto text-secondary">
              <UserIcon className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Sign in to continue</h2>
            <p className="text-xs text-muted-foreground">Access your profile, orders, and saved addresses.</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-[#F26522] text-white font-bold rounded-2xl text-xs hover:bg-[#D64E0F] transition-all shadow-md shadow-secondary/20"
            >
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="flex-grow max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 font-sans">
        {/* Navigation Breadcrumb */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-secondary mb-5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-secondary" />
          <span>Back to Book Catalog</span>
        </Link>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-64 rounded-3xl bg-card border border-border/80" />
            <div className="h-96 rounded-3xl bg-card border border-border/80" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 rounded-3xl bg-card border border-border/80 p-8 space-y-4 my-8 shadow-sm">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-foreground">Failed to load profile</h2>
            <p className="text-xs text-muted-foreground">We couldn&apos;t fetch your profile details.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-[#F26522] text-white font-bold rounded-2xl text-xs hover:bg-[#D64E0F] transition-all shadow-md"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Brand Hero Section Header */}
            <ProfileHero
              profile={profile}
              recentOrders={recentOrders}
              avatarPreview={avatarPreview}
              isUploadingAvatar={isUploadingAvatar}
              onAvatarUpload={handleAvatarUpload}
              onEditProfileClick={() => {
                setActiveSection("overview");
                setIsEditingProfile(true);
              }}
            />

            {/* Sidebar Navigation & Active Tab Content */}
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
              <ProfileNav
                activeSection={activeSection}
                onSelectSection={(sec) => setActiveSection(sec)}
                onLogout={handleLogout}
              />

              <div className="flex-1 min-w-0 w-full space-y-6">
                {activeSection === "overview" && (
                  <ProfileOverview
                    profile={profile}
                    recentOrders={recentOrders}
                    isEditingProfile={isEditingProfile}
                    name={name}
                    phone={phone}
                    setName={setName}
                    setPhone={setPhone}
                    setIsEditingProfile={setIsEditingProfile}
                    onProfileSubmit={handleProfileSubmit}
                    isUpdating={updateProfileMutation.isPending}
                  />
                )}

                {activeSection === "addresses" && (
                  <ProfileAddresses
                    profile={profile}
                    showAddressForm={showAddressForm}
                    setShowAddressForm={setShowAddressForm}
                    street={street}
                    city={city}
                    addrState={addrState}
                    zipCode={zipCode}
                    country={country}
                    isDefault={isDefault}
                    isDetectingLocation={isDetectingLocation}
                    locationError={locationError}
                    setStreet={setStreet}
                    setCity={setCity}
                    setAddrState={setAddrState}
                    setZipCode={setZipCode}
                    setCountry={setCountry}
                    setIsDefault={setIsDefault}
                    onDetectLocation={handleDetectLocation}
                    onAddressSubmit={handleAddressSubmit}
                    onDeleteAddress={(id) => deleteAddressMutation.mutate(id)}
                    onSetDefaultAddress={(id) => setAddressDefaultMutation.mutate(id)}
                    isDeleting={deleteAddressMutation.isPending}
                    isSettingDefault={setAddressDefaultMutation.isPending}
                    deletingId={deleteAddressMutation.variables}
                    settingDefaultId={setAddressDefaultMutation.variables}
                    resetAddressForm={resetAddressForm}
                  />
                )}

                {activeSection === "security" && (
                  <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl text-center py-12 space-y-3 font-sans">
                    <Shield className="h-12 w-12 text-secondary mx-auto" />
                    <h2 className="font-serif text-xl font-bold text-foreground">Security &amp; Passwords</h2>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Password updates and 2FA settings are managed via secure authentication middleware.
                    </p>
                  </div>
                )}

                {activeSection === "payment" && (
                  <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl text-center py-12 space-y-3 font-sans">
                    <CreditCard className="h-12 w-12 text-secondary mx-auto" />
                    <h2 className="font-serif text-xl font-bold text-foreground">Saved Payment Methods</h2>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      All checkout payments are processed securely via Razorpay Web Checkout.
                    </p>
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
