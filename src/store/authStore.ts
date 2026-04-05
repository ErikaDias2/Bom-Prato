import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  userId: number | null;  
  login: (id: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userId: null,
  login: (id) => set({ isLoggedIn: true, userId: id }),
  logout: () => set({ isLoggedIn: false, userId: null }),
}));