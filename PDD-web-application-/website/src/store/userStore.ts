import { create } from 'zustand';
import { userService } from '../services/endpoints';

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  blood_type?: string;
  existing_conditions?: string[];
  allergies?: string[];
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const data = await userService.getProfile();
      set({ profile: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateProfile: async (payload) => {
    set({ isLoading: true });
    try {
      const data = await userService.updateProfile(payload);
      set({ profile: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
