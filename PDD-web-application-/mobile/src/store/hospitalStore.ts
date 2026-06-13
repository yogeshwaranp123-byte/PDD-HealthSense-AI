import { create } from 'zustand';
import { hospitalService } from '../services/endpoints';

export interface Hospital {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  website?: string;
  map_link?: string;
}

interface HospitalState {
  hospitals: Hospital[];
  cachedCoords: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
  getNearbyHospitals: (lat: number, lng: number, address?: string, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
}

// Check if two locations are within ~50 meters (0.0005 degrees latitude/longitude difference)
const isLocationSame = (
  c1: { lat: number; lng: number } | null,
  c2: { lat: number; lng: number }
) => {
  if (!c1) return false;
  const DELTA_LIMIT = 0.0005; 
  return Math.abs(c1.lat - c2.lat) < DELTA_LIMIT && Math.abs(c1.lng - c2.lng) < DELTA_LIMIT;
};

export const useHospitalStore = create<HospitalState>((set, get) => ({
  hospitals: [],
  cachedCoords: null,
  isLoading: false,
  error: null,

  getNearbyHospitals: async (lat, lng, address, forceRefresh = false) => {
    const { cachedCoords, hospitals } = get();
    const currentCoords = { lat, lng };

    // Skip API call if we have cached results and user has not moved significantly
    if (!forceRefresh && hospitals.length > 0 && isLocationSame(cachedCoords, currentCoords)) {
      console.log("[CACHE] Serving hospitals from local cache (location unchanged)");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await hospitalService.getNearby(lat, lng, address);
      set({
        hospitals: data,
        cachedCoords: currentCoords,
        isLoading: false,
      });
    } catch (e: any) {
      const serverDetail = e?.response?.data?.detail;
      set({
        error: serverDetail || e?.message || "Failed to load hospitals",
        isLoading: false,
      });
    }
  },

  clearCache: () => set({ hospitals: [], cachedCoords: null, error: null }),
}));
