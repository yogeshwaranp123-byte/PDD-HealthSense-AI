import { create } from 'zustand';
import { authService } from '../services/endpoints';
import { formatError } from '../utils/error';

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

  /**
   * LOW-01 fix: Auth state is determined by a server round-trip to /auth/me,
   * which validates the httpOnly cookie. No localStorage access whatsoever.
   */
  checkAuth: async () => {
    const { authenticated, user_id } = await authService.checkAuthStatus();
    set({ isAuthenticated: authenticated, userId: user_id });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      /**
       * LOW-01 fix: login() returns data but tokens are set as httpOnly cookies
       * by the backend. We never touch the token string in JavaScript.
       */
      await authService.login(email.trim(), password);
      // Confirm auth state from server after login
      const { authenticated, user_id } = await authService.checkAuthStatus();
      set({ isAuthenticated: authenticated, userId: user_id, isLoading: false });
    } catch (e: any) {
      set({ error: formatError(e, 'Login failed'), isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(name, email, password);
      const { authenticated, user_id } = await authService.checkAuthStatus();
      set({ isAuthenticated: authenticated, userId: user_id, isLoading: false });
    } catch (e: any) {
      set({ error: formatError(e, 'Registration failed'), isLoading: false });
    }
  },

  logout: async () => {
    /**
     * LOW-01 fix: Calls /auth/logout which revokes the JTI server-side
     * and instructs the browser to delete the httpOnly cookies.
     * No localStorage.removeItem() needed.
     */
    await authService.logout();
    set({ isAuthenticated: false, userId: null });
  },

  clearError: () => set({ error: null }),
}));
