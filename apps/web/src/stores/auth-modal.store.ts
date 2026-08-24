import { create } from 'zustand';

export type AuthScreen =
  | 'login'
  | 'signup'
  | 'seller_signup'
  | 'forgot_password'
  | 'verify_email'
  | 'reset_password';

interface AuthModalState {
  isOpen: boolean;
  screen: AuthScreen;
  redirectTo: string | null;
  userEmail: string | null;
  openModal: (
    screen?: AuthScreen,
    redirectTo?: string | null,
    email?: string | null
  ) => void;
  closeModal: () => void;
  setScreen: (screen: AuthScreen) => void;
  setUserEmail: (email: string) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  screen: 'login',
  redirectTo: null,
  userEmail: null,
  openModal: (
    screen = 'login',
    redirectTo = null,
    email = null
  ) =>
    set({
      isOpen: true,
      screen,
      redirectTo: redirectTo ?? null,
      userEmail: email ?? null,
    }),
  closeModal: () => set({ isOpen: false, redirectTo: null }),
  setScreen: (screen) => set({ screen }),
  setUserEmail: (userEmail) => set({ userEmail }),
}));

export default useAuthModalStore;
