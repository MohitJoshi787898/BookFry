'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { User } from '@bookmarket/types';

export function getSafeInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
}

export function useCurrentUser() {
  const { user: storeUser, isAuthenticated, clearAuth, setUser } = useAuthStore();

  const { data: meData, isLoading, refetch } = useQuery<{ user: User }>({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await apiClient<{ user: User }>('/auth/me');
      if (res?.user) {
        setUser(res.user);
      }
      return res;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const currentUser: User | null = meData?.user || storeUser;

  const roles = currentUser?.roles || [];
  const isAdmin = roles.includes('admin');
  const isSeller = roles.includes('seller');
  const isBuyer = isAuthenticated;

  const getRoleLabel = (context?: 'admin' | 'seller' | 'buyer'): string => {
    if (context === 'admin' || (isAdmin && !context)) {
      return 'Super Admin';
    }
    if (context === 'seller' || (isSeller && !context)) {
      if (currentUser?.sellerVerificationStatus === 'approved') return 'Verified Seller';
      if (currentUser?.sellerVerificationStatus === 'pending') return 'Verification Pending';
      return 'Campus Seller';
    }
    return 'Student Member';
  };

  return {
    user: currentUser,
    isAuthenticated,
    isLoading: isLoading && !currentUser,
    roles,
    isAdmin,
    isSeller,
    isBuyer,
    roleLabel: getRoleLabel(),
    getRoleLabel,
    initials: getSafeInitials(currentUser?.name, currentUser?.email),
    avatarUrl: currentUser?.avatarUrl,
    refetch,
    clearAuth,
  };
}

export default useCurrentUser;
