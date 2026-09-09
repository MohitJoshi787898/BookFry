'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, SellerOnboardingStatus, SellerVerificationStatus } from '@bookmarket/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;

  // Derived convenience getters (computed from user — no extra storage)
  isSeller: () => boolean;
  sellerOnboardingStatus: () => SellerOnboardingStatus | undefined;
  sellerVerificationStatus: () => SellerVerificationStatus | undefined;
  isSellerOnboardingComplete: () => boolean;
  isSellerVerified: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user: User, accessToken: string) => {
        set({ user, accessToken, isAuthenticated: true });
        // Set httpOnly-readable marker cookie so Next.js middleware knows user is logged in
        document.cookie = 'bookmarket_logged_in=true; path=/; SameSite=Lax';
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        // Clear the auth marker cookie
        document.cookie =
          'bookmarket_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      },

      // Derived from user.roles — never stored separately
      isSeller: () => get().user?.roles.includes('seller') ?? false,

      sellerOnboardingStatus: () => get().user?.sellerOnboardingStatus,

      sellerVerificationStatus: () => get().user?.sellerVerificationStatus,

      isSellerOnboardingComplete: () =>
        get().user?.sellerOnboardingStatus === 'complete',

      isSellerVerified: () =>
        get().user?.sellerVerificationStatus === 'approved',
    }),
    {
      name: 'bookmarket-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
