import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@bookmarket/types';

interface AuthState {
  user: Omit<User, 'createdAt' | 'updatedAt' | 'addresses'> | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: Omit<User, 'createdAt' | 'updatedAt' | 'addresses'>, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
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
