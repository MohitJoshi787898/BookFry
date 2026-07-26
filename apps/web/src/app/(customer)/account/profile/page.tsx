'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { User, Address } from '@bookmarket/types';
import Image from 'next/image';
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Heart,
  Tag,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  Compass,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Camera,
  Edit3,
  Package,
  X,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Skeleton Component ──────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-40 rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-80 rounded-2xl bg-muted" />
        <div className="md:col-span-3 space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-56 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-background/60 dark:bg-card/60 backdrop-blur-sm border border-border/40 min-w-[72px] flex-1">
      <div className="text-brand dark:text-secondary">{icon}</div>
      <span className="text-lg font-bold text-text-primary">{value}</span>
      <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">{label}</span>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────
function NavItem({
  icon,
  label,
  active,
  onClick,
  href,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const base = `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left cursor-pointer
    ${active
      ? 'bg-brand text-white shadow-sm dark:bg-primary'
      : danger
        ? 'text-danger hover:bg-danger/8'
        : 'text-text-secondary hover:bg-muted hover:text-text-primary'
    }`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {icon}
        <span className="flex-1">{label}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={base}>
      {icon}
      <span className="flex-1">{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-white/70" />}
    </button>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────
function AddressCard({
  address,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: {
  address: Address;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting: boolean;
  isSettingDefault: boolean;
}) {
  return (
    <div className={`relative rounded-xl border p-4 transition-all duration-200 ${
      address.isDefault
        ? 'border-brand/40 bg-brand/5 dark:border-primary/40 dark:bg-primary/5'
        : 'border-border bg-background dark:bg-card'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-lg ${address.isDefault ? 'bg-brand/15 text-brand dark:text-primary' : 'bg-muted text-text-muted'}`}>
          <MapPin className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-text-primary truncate">{address.street}</p>
            {address.isDefault && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/15 text-brand dark:text-primary text-[10px] font-bold uppercase tracking-wider">
                <Check className="h-2.5 w-2.5" /> Default
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">{address.city}, {address.state} - {address.zipCode}</p>
          <p className="text-[11px] text-text-muted font-medium mt-0.5">{address.country}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!address.isDefault && (
            <button
              onClick={onSetDefault}
              disabled={isSettingDefault}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-border text-text-secondary hover:border-brand/40 hover:text-brand dark:hover:text-primary transition-all disabled:opacity-50"
            >
              {isSettingDefault ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Set Default'}
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg border border-border text-text-muted hover:border-danger/40 hover:text-danger hover:bg-danger/5 transition-all disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
type ActiveSection = 'overview' | 'addresses' | 'orders' | 'wishlist' | 'notifications' | 'security' | 'payment';

export default function ProfilePage() {
  const { isAuthenticated, setUser, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Profile edit state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // ── Fetch user profile ──
  const { data: profile, isLoading, isError, refetch } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient('/users/profile'),
    enabled: isAuthenticated,
  });

  // ── Fetch recent orders (overview) ──
  const { data: recentOrders } = useQuery<any[]>({
    queryKey: ['profile-orders'],
    queryFn: () => apiClient('/orders'),
    enabled: isAuthenticated && activeSection === 'overview',
  });

  // ── Sync local state ──
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatarUrl || '');
      setAvatarPreview(profile.avatarUrl || '');
    }
  }, [profile]);

  // ── Avatar upload ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB.');
      return;
    }
    // Optimistic preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiClient('/users/avatar', { method: 'POST', body: formData });
      if (res?.avatarUrl) {
        setAvatarUrl(res.avatarUrl);
        setAvatarPreview(res.avatarUrl);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        setUser(res);
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setAvatarPreview(profile?.avatarUrl || '');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ── Mutations ──
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone: string }) =>
      apiClient('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUser(updatedUser);
      setIsEditingProfile(false);
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean }) =>
      apiClient('/users/addresses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUser(updatedUser);
      setShowAddressForm(false);
      resetAddressForm();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) =>
      apiClient(`/users/addresses/${addressId}`, { method: 'DELETE' }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUser(updatedUser);
    },
  });

  const setAddressDefaultMutation = useMutation({
    mutationFn: (addressId: string) =>
      apiClient(`/users/addresses/${addressId}`, { method: 'PATCH', body: JSON.stringify({ isDefault: true }) }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUser(updatedUser);
    },
  });

  const resetAddressForm = () => {
    setStreet(''); setCity(''); setAddrState(''); setZipCode('');
    setCountry('India'); setIsDefault(false); setLocationError('');
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return; }
    setIsDetectingLocation(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await res.json();
          if (data?.address) {
            const addr = data.address;
            const road = addr.road || addr.suburb || addr.neighbourhood || '';
            const house = addr.house_number || '';
            setStreet(house ? `${house}, ${road}` : road);
            setCity(addr.city || addr.town || addr.village || '');
            setAddrState(addr.state || '');
            setZipCode(addr.postcode || '');
            setCountry(addr.country || 'India');
          } else setLocationError('Could not resolve address.');
        } catch { setLocationError('Geocoding service failed.'); }
        finally { setIsDetectingLocation(false); }
      },
      (err) => {
        setIsDetectingLocation(false);
        setLocationError(err.code === 1 ? 'Location permission denied.' : 'Could not get location.');
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
      setLocationError('All fields are required.');
      return;
    }
    addAddressMutation.mutate({ street, city, state: addrState, zipCode, country, isDefault });
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const navSections = [
    { id: 'overview' as ActiveSection, icon: <UserIcon className="h-4 w-4" />, label: 'Profile Overview' },
    { id: 'addresses' as ActiveSection, icon: <MapPin className="h-4 w-4" />, label: 'Shipping Addresses' },
    { id: 'orders' as ActiveSection, icon: <ShoppingBag className="h-4 w-4" />, label: 'Orders', href: '/account/orders' },
    { id: 'wishlist' as ActiveSection, icon: <Heart className="h-4 w-4" />, label: 'Wishlist', href: '/account/wishlist' },
    { id: 'notifications' as ActiveSection, icon: <Bell className="h-4 w-4" />, label: 'Notifications', href: '/account/notifications' },
    { id: 'security' as ActiveSection, icon: <Shield className="h-4 w-4" />, label: 'Security' },
    { id: 'payment' as ActiveSection, icon: <CreditCard className="h-4 w-4" />, label: 'Payment Methods' },
  ];

  // ── Auth guard ──
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <UserIcon className="h-8 w-8 text-text-muted" />
            </div>
            <h2 className="font-serif text-xl font-bold text-text-primary">Sign in to continue</h2>
            <p className="text-sm text-text-secondary">Access your profile, orders and saved addresses.</p>
            <Link href="/login" className="inline-block px-6 py-2.5 bg-brand text-white font-semibold rounded-xl text-sm hover:bg-brand-hover transition-all shadow-sm">
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
        {/* ── Breadcrumb ── */}
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand dark:hover:text-secondary mb-5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>

        {/* ── Page Title ── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2.5">
            <UserIcon className="h-7 w-7 text-brand dark:text-secondary" />
            My Profile &amp; Settings
          </h1>
          {/* Mobile nav toggle */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm text-text-secondary bg-card"
          >
            <UserIcon className="h-4 w-4" />
            Menu
          </button>
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : isError ? (
          <div className="text-center py-20 space-y-4">
            <AlertCircle className="h-12 w-12 text-danger mx-auto" />
            <h2 className="font-serif text-xl font-bold text-text-primary">Failed to load profile</h2>
            <p className="text-sm text-text-secondary">Something went wrong fetching your data.</p>
            <button onClick={() => refetch()} className="px-5 py-2.5 bg-brand text-white font-semibold rounded-xl text-sm hover:bg-brand-hover transition-all">
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* ════════════════════════════════════════
                SIDEBAR
            ════════════════════════════════════════ */}
            <aside className={`w-full md:w-64 lg:w-72 shrink-0 ${isMobileNavOpen ? 'block' : 'hidden'} md:block`}>
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                {/* ── Avatar block ── */}
                <div className="relative p-6 pb-5 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent dark:from-primary/15 dark:via-primary/5">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar with camera button */}
                    <div className="relative mb-3">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-card shadow-md">
                        {avatarPreview ? (
                          <Image
                            src={avatarPreview}
                            alt={name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized={avatarPreview.startsWith('data:')}
                          />
                        ) : (
                          <div className="w-full h-full bg-brand/20 dark:bg-primary/25 text-brand dark:text-primary flex items-center justify-center font-bold text-2xl uppercase">
                            {name.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      {/* Camera overlay button */}
                      <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand dark:bg-secondary text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform border-2 border-white dark:border-card">
                        {isUploadingAvatar ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Camera className="h-3 w-3" />
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUploadingAvatar}
                        />
                      </label>
                    </div>

                    <h2 className="font-bold text-base text-text-primary leading-tight">{profile?.name}</h2>
                    <span className="mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/15 text-brand dark:text-primary uppercase tracking-wider">
                      {profile?.roles?.includes('admin') ? 'Admin' : profile?.roles?.includes('seller') ? 'Seller' : 'Member'}
                    </span>
                    <p className="mt-1.5 text-xs text-text-secondary truncate max-w-full">{profile?.email}</p>

                    <button
                      onClick={() => { setActiveSection('overview'); setIsEditingProfile(true); setIsMobileNavOpen(false); }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand/30 dark:border-primary/30 text-brand dark:text-primary text-xs font-semibold hover:bg-brand/8 transition-all"
                    >
                      <Edit3 className="h-3 w-3" /> Edit Profile
                    </button>
                  </div>
                </div>

                {/* ── Nav links ── */}
                <nav className="p-3 space-y-0.5">
                  {navSections.map((s) => (
                    <NavItem
                      key={s.id}
                      icon={s.icon}
                      label={s.label}
                      active={activeSection === s.id && !s.href}
                      href={s.href}
                      onClick={() => { if (!s.href) { setActiveSection(s.id); setIsMobileNavOpen(false); } }}
                    />
                  ))}

                  <div className="pt-2 mt-2 border-t border-border">
                    <NavItem
                      icon={<LogOut className="h-4 w-4" />}
                      label="Logout"
                      danger
                      onClick={handleLogout}
                    />
                  </div>
                </nav>
              </div>
            </aside>

            {/* ════════════════════════════════════════
                MAIN CONTENT
            ════════════════════════════════════════ */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* ── PROFILE OVERVIEW ── */}
              {activeSection === 'overview' && (
                <>
                  {/* Welcome card */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-lg font-bold text-text-primary">
                            Welcome back, {profile?.name?.split(' ')[0]}! 👋
                          </h2>
                          <p className="text-sm text-text-secondary mt-0.5">Here&apos;s what&apos;s happening with your account.</p>
                        </div>
                        {/* Decorative book stack illustration */}
                        <div className="hidden sm:flex items-end gap-1 pb-2 opacity-70">
                          {['#F26522', '#1A3B5C', '#FF9900', '#1e8e5a'].map((c, i) => (
                            <div
                              key={i}
                              style={{ backgroundColor: c, height: `${28 + i * 8}px`, width: '14px', borderRadius: '3px' }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="mt-5 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                        <StatCard icon={<ShoppingBag className="h-4 w-4" />} value={recentOrders?.length ?? 0} label="Orders" />
                        <StatCard icon={<Heart className="h-4 w-4" />} value={(profile as any)?.wishlist?.length ?? 0} label="Wishlist" />
                        <StatCard icon={<MapPin className="h-4 w-4" />} value={profile?.addresses?.length ?? 0} label="Addresses" />
                        <StatCard icon={<Tag className="h-4 w-4" />} value={0} label="Coupons" />
                      </div>
                    </div>
                  </div>

                  {/* Edit profile form or info */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-serif text-base font-bold text-text-primary">Personal Information</h3>
                      {!isEditingProfile && (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:border-brand/40 hover:text-brand dark:hover:text-secondary transition-all"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Edit
                        </button>
                      )}
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1.5">Full Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 dark:focus:ring-primary/40 text-sm font-medium text-text-primary transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1.5">Phone Number</label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 dark:focus:ring-primary/40 text-sm font-medium text-text-primary transition-all"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 pt-1">
                          <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="px-5 py-2.5 bg-brand dark:bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
                          >
                            {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProfile(false);
                              if (profile) { setName(profile.name); setPhone(profile.phone || ''); }
                            }}
                            className="px-4 py-2.5 border border-border text-text-secondary hover:bg-muted rounded-xl text-sm transition-all flex items-center gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50">
                          <Mail className="h-4 w-4 text-brand dark:text-secondary shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Email</p>
                            <p className="text-sm text-text-primary font-medium">{profile?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50">
                          <Phone className="h-4 w-4 text-brand dark:text-secondary shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Phone</p>
                            <p className="text-sm text-text-primary font-medium">
                              {profile?.phone || <span className="italic text-text-muted">Not added</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Orders Preview */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-base font-bold text-text-primary">Recent Orders</h3>
                      <Link href="/account/orders" className="text-xs font-semibold text-brand dark:text-secondary hover:underline flex items-center gap-1">
                        View All <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    {!recentOrders || recentOrders.length === 0 ? (
                      <div className="text-center py-10 space-y-2">
                        <Package className="h-10 w-10 text-text-muted mx-auto" />
                        <p className="text-sm text-text-secondary">No orders yet. Start shopping!</p>
                        <Link href="/books" className="inline-block mt-2 px-4 py-2 bg-brand dark:bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all">
                          Browse Books
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentOrders.slice(0, 3).map((order: any) => (
                          <div key={order._id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border hover:border-brand/30 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-brand/10 dark:bg-primary/15 flex items-center justify-center">
                                <Package className="h-4 w-4 text-brand dark:text-primary" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-text-primary">{order.orderNumber || order._id?.slice(-8).toUpperCase()}</p>
                                <p className="text-[11px] text-text-muted">{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm font-bold text-text-primary">₹{order.totalAmount?.toLocaleString('en-IN') ?? '—'}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  order.status === 'delivered'
                                    ? 'bg-success/15 text-success'
                                    : order.status === 'shipped'
                                      ? 'bg-info/15 text-info'
                                      : order.status === 'cancelled'
                                        ? 'bg-danger/15 text-danger'
                                        : 'bg-warning/15 text-warning'
                                }`}>
                                  {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-brand dark:group-hover:text-secondary transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── SHIPPING ADDRESSES ── */}
              {activeSection === 'addresses' && (
                <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-text-primary">Shipping Addresses</h2>
                      <p className="text-xs text-text-secondary mt-0.5">Manage your saved delivery addresses</p>
                    </div>
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand dark:bg-primary text-white font-semibold rounded-xl text-xs hover:opacity-90 transition-all shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add New Address
                      </button>
                    )}
                  </div>

                  {/* Add address form */}
                  {showAddressForm && (
                    <form onSubmit={handleAddressSubmit} className="mb-5 p-4 rounded-xl border border-brand/25 dark:border-primary/25 bg-brand/4 dark:bg-primary/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-text-primary">New Shipping Address</h3>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isDetectingLocation}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 dark:bg-primary/15 border border-brand/20 dark:border-primary/25 text-brand dark:text-primary text-[11px] font-bold hover:bg-brand/15 transition-all disabled:opacity-50"
                        >
                          {isDetectingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <Compass className="h-3 w-3" />}
                          {isDetectingLocation ? 'Detecting...' : 'Auto-detect'}
                        </button>
                      </div>

                      {locationError && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {locationError}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Street Address *</label>
                        <input type="text" placeholder="Flat, House no., Street, Area" value={street} onChange={(e) => setStreet(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm text-text-primary" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1.5">City *</label>
                          <input type="text" placeholder="New Delhi" value={city} onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm text-text-primary" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1.5">State *</label>
                          <input type="text" placeholder="Delhi" value={addrState} onChange={(e) => setAddrState(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm text-text-primary" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1.5">Pincode *</label>
                          <input type="text" placeholder="110001" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm text-text-primary" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1.5">Country *</label>
                          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm text-text-primary" required />
                        </div>
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded text-brand focus:ring-brand" />
                        <span className="text-xs font-semibold text-text-secondary">Set as default shipping address</span>
                      </label>
                      <div className="flex gap-2.5 pt-1">
                        <button type="submit" disabled={addAddressMutation.isPending}
                          className="px-5 py-2.5 bg-brand dark:bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60">
                          {addAddressMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Save Address
                        </button>
                        <button type="button" onClick={() => { setShowAddressForm(false); resetAddressForm(); }}
                          className="px-4 py-2.5 border border-border text-text-secondary hover:bg-muted rounded-xl text-sm transition-all flex items-center gap-1.5">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Address list */}
                  {profile?.addresses && profile.addresses.length > 0 ? (
                    <div className="space-y-3">
                      {profile.addresses.map((address) => (
                        <AddressCard
                          key={address._id}
                          address={address}
                          onDelete={() => deleteAddressMutation.mutate(address._id!)}
                          onSetDefault={() => setAddressDefaultMutation.mutate(address._id!)}
                          isDeleting={deleteAddressMutation.isPending && deleteAddressMutation.variables === address._id}
                          isSettingDefault={setAddressDefaultMutation.isPending && setAddressDefaultMutation.variables === address._id}
                        />
                      ))}
                    </div>
                  ) : !showAddressForm ? (
                    <div className="text-center py-14 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <MapPin className="h-7 w-7 text-text-muted" />
                      </div>
                      <p className="font-semibold text-text-primary">No addresses saved</p>
                      <p className="text-xs text-text-secondary max-w-xs mx-auto">Add a shipping address to make checkout faster and easier.</p>
                      <button onClick={() => setShowAddressForm(true)}
                        className="inline-flex items-center gap-1.5 mt-2 px-4 py-2.5 bg-brand dark:bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all shadow-sm">
                        <Plus className="h-4 w-4" /> Add Address
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeSection === 'security' && (
                <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6">
                  <h2 className="font-serif text-lg font-bold text-text-primary mb-2">Security Settings</h2>
                  <p className="text-sm text-text-secondary mb-6">Keep your account safe with a strong password.</p>
                  <div className="space-y-4 text-center py-10">
                    <Shield className="h-12 w-12 text-text-muted mx-auto" />
                    <p className="text-sm text-text-secondary">Password change functionality coming soon.</p>
                  </div>
                </div>
              )}

              {/* ── PAYMENT ── */}
              {activeSection === 'payment' && (
                <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6">
                  <h2 className="font-serif text-lg font-bold text-text-primary mb-2">Payment Methods</h2>
                  <p className="text-sm text-text-secondary mb-6">Manage saved cards and UPI addresses.</p>
                  <div className="space-y-4 text-center py-10">
                    <CreditCard className="h-12 w-12 text-text-muted mx-auto" />
                    <p className="text-sm text-text-secondary">Saved payment methods coming soon.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
