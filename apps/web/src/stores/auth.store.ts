import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@bookmarket/types';

interface AuthState {
  user: Omit<User, 'createdAt' | 'updatedAt' | 'addresses'> | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: Omit<User, 'createdAt' | 'updatedAt' | 'addresses'>, accessToken: string) => void;
  setUser: (user: Omit<User, 'createdAt' | 'updatedAt' | 'addresses'>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        if (typeof window !== 'undefined') {
          document.cookie = 'bookmarket_logged_in=true; path=/; max-age=604800; SameSite=Lax';
        }
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'bookmarket_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
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
