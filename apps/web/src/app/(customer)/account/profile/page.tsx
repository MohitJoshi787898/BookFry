'use client';

import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleHero } from '@/components/shared/role-hero';
import { ProfileAddresses } from '@/components/profile/profile-addresses';
import { AdminModal } from '@/components/admin/admin-modal';
import { AdminDangerModal } from '@/components/admin/admin-danger-modal';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/stores/toast.store';
import { User, Order, Address } from '@bookmarket/types';
import {
  ShoppingBag,
  Heart,
  MessageSquare,
  Shield,
  CheckCircle2,
  ArrowRight,
  Store,
  Camera,
  Loader2,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CustomerProfilePage() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: profile } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient('/users/profile'),
    enabled: isAuthenticated,
    initialData: user || undefined,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['buyer-orders-profile'],
    queryFn: () => apiClient('/orders'),
    enabled: isAuthenticated,
  });

  const { data: wishlistRaw = [] } = useQuery<{ books?: unknown[] } | unknown[]>({
    queryKey: ['buyer-wishlist-profile'],
    queryFn: () => apiClient('/wishlist'),
    enabled: isAuthenticated,
  });

  const wishlist = Array.isArray(wishlistRaw) ? wishlistRaw : wishlistRaw?.books || [];
  const inTransitOrders = orders.filter((o) => ['pending', 'confirmed', 'shipped'].includes(o.status));

  // Edit Profile Modal state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Delete Address Modal State
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Avatar Upload Mutation
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient<User>('/users/avatar', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Your profile picture has been updated.', {
        title: 'Avatar Updated',
      });
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Failed to upload profile picture.';
      toast.error(msg, {
        title: 'Upload Failed',
      });
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed.', {
        title: 'Invalid File Type',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be less than 5MB.', {
        title: 'File Too Large',
      });
      return;
    }

    avatarMutation.mutate(file);
  };

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone?: string }) =>
      apiClient<User>('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setEditProfileOpen(false);
      toast.success('Your account details have been updated.', {
        title: 'Profile Updated',
      });
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Failed to update profile.';
      toast.error(msg, {
        title: 'Update Error',
      });
    },
  });

  // Address Mutations
  const addAddressMutation = useMutation({
    mutationFn: (data: { street: string; city: string; state: string; zipCode: string; country: string; isDefault: boolean }) =>
      apiClient<User>('/users/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      resetAddressForm();
      setShowAddressForm(false);
      toast.success('New delivery address has been saved.', {
        title: 'Address Added',
      });
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Failed to save address.';
      toast.error(msg, {
        title: 'Address Error',
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<User>(`/users/addresses/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setAddressToDelete(null);
      toast.success('Address removed from your profile.', {
        title: 'Address Deleted',
      });
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Failed to delete address.';
      toast.error(msg, {
        title: 'Delete Error',
      });
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<User>(`/users/addresses/${id}/default`, {
        method: 'PATCH',
      }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Primary delivery address updated.', {
        title: 'Default Address Set',
      });
    },
  });

  const resetAddressForm = () => {
    setStreet('');
    setCity('');
    setAddrState('');
    setZipCode('');
    setCountry('India');
    setIsDefault(false);
    setLocationError('');
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await apiClient<{
            address?: {
              city?: string;
              state?: string;
              postcode?: string;
              country?: string;
              suburb?: string;
              road?: string;
            };
          }>(`/users/reverse-geocode?lat=${lat}&lon=${lon}`);

          if (res?.address) {
            const a = res.address;
            if (a.city) setCity(a.city);
            if (a.state) setAddrState(a.state);
            if (a.postcode) setZipCode(a.postcode);
            if (a.country) setCountry(a.country);
            if (a.road || a.suburb) {
              setStreet((prev) => prev || [a.road, a.suburb].filter(Boolean).join(', '));
            }
            toast.success('Location detected successfully.');
          }
        } catch {
          setLocationError('Failed to resolve address coordinates.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        setLocationError(err.message || 'Unable to retrieve location.');
      }
    );
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !addrState || !zipCode) {
      toast.warning('Please fill in all required address fields.');
      return;
    }

    addAddressMutation.mutate({
      street,
      city,
      state: addrState,
      zipCode,
      country: country || 'India',
      isDefault,
    });
  };

  const activeUser = profile || user;

  return (
    <div className="space-y-6">
      <RoleHero
        title={`Hello, ${activeUser?.name || 'Student Reader'}!`}
        subtitle="Manage your campus deliveries, saved textbook wishlists, and account preferences."
        badgeText="Student Account Center"
        showMascot={true}
        mascotPose="reading"
        stats={[
          { label: 'Orders Placed', value: orders.length, badge: 'Purchases', isPositive: true },
          { label: 'Active Shipments', value: inTransitOrders.length, badge: inTransitOrders.length > 0 ? 'On The Way' : 'Settled', isPositive: true },
          { label: 'Saved in Wishlist', value: wishlist.length, badge: 'Favorites', isPositive: true },
          { label: 'Student Savings', value: '₹2,450', badge: 'Est. Saved', isPositive: true },
        ]}
        actions={
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-secondary text-white text-xs font-black uppercase tracking-wider shadow-md shadow-secondary/20 active:scale-95 cursor-pointer"
          >
            <Store className="h-4 w-4" />
            <span>Seller Workspace</span>
          </Link>
        }
      />

      {/* 2-Column Split: Profile Identity (5 cols) + Saved Addresses & Security (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Identity Card (5 cols) */}
        <div className="lg:col-span-5 border border-border/80 bg-card rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-4 border-b border-border/60 pb-5">
            {/* Avatar with Upload Hover Overlay */}
            <div className="relative group shrink-0">
              <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-border/80 bg-gradient-to-br from-primary to-secondary text-primary-foreground font-extrabold text-xl flex items-center justify-center shadow-md select-none">
                {activeUser?.avatarUrl ? (
                  <Image
                    src={activeUser.avatarUrl}
                    alt={activeUser.name || 'User Avatar'}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  activeUser?.name?.slice(0, 2).toUpperCase() || 'ST'
                )}
              </div>

              {/* Hover trigger for file input */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarMutation.isPending}
                className="absolute inset-0 rounded-2xl bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                title="Update Profile Picture"
              >
                {avatarMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase">Edit</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-lg font-bold text-foreground truncate">
                  {activeUser?.name || 'Student Account'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setProfileForm({
                      name: activeUser?.name || '',
                      phone: activeUser?.phone || '',
                    });
                    setEditProfileOpen(true);
                  }}
                  className="p-1.5 rounded-xl border border-border/80 text-muted-foreground hover:text-secondary hover:bg-muted transition-all cursor-pointer"
                  title="Edit Account Details"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">{activeUser?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> Verified Student
                </span>
                {activeUser?.phone && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {activeUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs font-semibold">
            <Link
              href="/account/orders"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/60 border border-border/60 text-foreground transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-secondary" />
                <span>My Orders &amp; Delivery Tracking</span>
              </div>
              <span className="font-mono font-bold text-muted-foreground">{orders.length}</span>
            </Link>

            <Link
              href="/account/wishlist"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/60 border border-border/60 text-foreground transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Saved Books (Wishlist)</span>
              </div>
              <span className="font-mono font-bold text-muted-foreground">{wishlist.length}</span>
            </Link>

            <Link
              href="/account/requests"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/60 border border-border/60 text-foreground transition-all"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-sky-500" />
                <span>Used Book Requests (P2P)</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Saved Delivery Addresses & Security (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real Addresses Component */}
          <ProfileAddresses
            profile={activeUser || undefined}
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
            onDeleteAddress={(id) => {
              const addr = activeUser?.addresses?.find((a) => a._id === id);
              if (addr) setAddressToDelete(addr);
              else deleteAddressMutation.mutate(id);
            }}
            onSetDefaultAddress={(id) => setDefaultAddressMutation.mutate(id)}
            isDeleting={deleteAddressMutation.isPending}
            isSettingDefault={setDefaultAddressMutation.isPending}
            deletingId={addressToDelete?._id}
            settingDefaultId={setDefaultAddressMutation.variables}
            resetAddressForm={resetAddressForm}
          />

          {/* Account Security */}
          <div className="border border-border/80 bg-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <span>Security &amp; Account Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-1">
                <p className="font-bold text-foreground">Password &amp; Credentials</p>
                <p className="text-muted-foreground">Encrypted with bcrypt (12 rounds)</p>
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block pt-1">
                  Active &amp; Secured
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-1">
                <p className="font-bold text-foreground">Email Authentication</p>
                <p className="text-muted-foreground truncate">{activeUser?.email}</p>
                <span className="text-[10px] font-black uppercase text-secondary block pt-1">
                  Verified Identity
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AdminModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        size="md"
        title="Edit Account Details"
        subtitle="Update your visible name and contact telephone number"
        icon={<Pencil className="h-5 w-5 text-secondary" />}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setEditProfileOpen(false)}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-profile-form"
              disabled={updateProfileMutation.isPending}
              className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {updateProfileMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        }
      >
        <form
          id="edit-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            updateProfileMutation.mutate(profileForm);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
            />
          </div>
        </form>
      </AdminModal>

      {/* CONTEXTUAL DELETE ADDRESS MODAL */}
      {addressToDelete && (
        <AdminDangerModal
          isOpen={!!addressToDelete}
          onClose={() => setAddressToDelete(null)}
          onConfirm={() => {
            if (addressToDelete._id) {
              deleteAddressMutation.mutate(addressToDelete._id);
            }
          }}
          isPending={deleteAddressMutation.isPending}
          title="Remove Delivery Address"
          entityName={addressToDelete.street}
          description={
            <span>
              Are you sure you want to remove delivery destination{' '}
              <strong>{addressToDelete.street}, {addressToDelete.city}</strong>?
            </span>
          }
          impacts={[
            'Future book orders will no longer route to this delivery location.',
            'If this was your default address, please set another active address as default.',
          ]}
          confirmText="Delete Address"
        />
      )}
    </div>
  );
}
