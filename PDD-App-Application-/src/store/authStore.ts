import { create } from 'zustand';
import { authService } from '../services/endpoints';
import * as SecureStore from 'expo-secure-store';

const DEMO_ONLY_AUTH = true;
const DEMO_ACCESS_TOKEN_KEY = 'access_token';
const DEMO_REFRESH_TOKEN_KEY = 'refresh_token';

async function setDemoSession(userId: string) {
  // Keep the token shape simple; app only checks presence.
  await SecureStore.setItemAsync(DEMO_ACCESS_TOKEN_KEY, `demo_access:${userId}`);
  await SecureStore.setItemAsync(DEMO_REFRESH_TOKEN_KEY, `demo_refresh:${userId}`);
}

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: null,
  isLoading: false,
  error: null,

  checkAuth: async () => {
    const has = await authService.hasToken();
    set({ isAuthenticated: has });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      if (DEMO_ONLY_AUTH) {
        const id = (email || 'demo').trim().toLowerCase();
        await setDemoSession(id);
        set({ isAuthenticated: true, userId: id, isLoading: false });
        return;
      }

      await authService.login(email, password);
      set({ isAuthenticated: true, userId: email, isLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.detail ?? 'Login failed', isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      if (DEMO_ONLY_AUTH) {
        const id = (email || name || 'demo').trim().toLowerCase();
        await setDemoSession(id);
        set({ isAuthenticated: true, userId: id, isLoading: false });
        return;
      }

      await authService.register(name, email, password);
      set({ isAuthenticated: true, userId: email, isLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.detail ?? 'Registration failed', isLoading: false });
    }
  },

  logout: async () => {
    if (DEMO_ONLY_AUTH) {
      await SecureStore.deleteItemAsync(DEMO_ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(DEMO_REFRESH_TOKEN_KEY);
    } else {
      await authService.logout();
    }
    set({ isAuthenticated: false, userId: null });
  },

  clearError: () => set({ error: null }),
}));
