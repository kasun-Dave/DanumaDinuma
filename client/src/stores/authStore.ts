import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildGuestUser } from '@/lib/guestStore';

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  role: 'student' | 'admin';
  college: string;
  year: number;
  xp: number;
  streak: number;
  longestStreak: number;
  badges: any[];
  theme: 'light' | 'dark';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  startGuest: () => void;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isGuest: false,
      startGuest: () => set({ user: buildGuestUser(), accessToken: null, isAuthenticated: true, isGuest: true }),
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isGuest: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false, isGuest: false }),
    }),
    {
      name: 'danumadinuma-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated, isGuest: state.isGuest }),
    }
  )
);
