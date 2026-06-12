import { create } from 'zustand';
import { predictService, userService } from '../services/endpoints';

export interface Prediction {
  id: string;
  disease: string;
  result: string;
  probability: number;
  confidence: string;
  interpretation: string;
  shap_top3: Record<string, number>;
  next_steps: string[];
  prediction_id?: string;
  created_at?: string;
  inputs?: Record<string, any>;
}

interface PredictionState {
  current: Prediction | null;
  history: Prediction[];
  isLoading: boolean;
  error: string | null;
  predict: (disease: string, inputs: object) => Promise<void>;
  predictWithReport: (disease: string, fileUri: string, mimeType: string, fileName: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  clearCurrent: () => void;
  clearError: () => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  current: null,
  history: [],
  isLoading: false,
  error: null,

  predict: async (disease, inputs) => {
    set({ isLoading: true, error: null });
    try {
      const data = await predictService.predict(disease, inputs);
      set({ current: data, isLoading: false });
    } catch (e: any) {
      set({
        error: e?.response?.data?.detail ?? 'Prediction failed',
        isLoading: false,
      });
    }
  },

  predictWithReport: async (disease, fileUri, mimeType, fileName) => {
    set({ isLoading: true, error: null });
    try {
      const data = await predictService.predictWithReport(disease, fileUri, mimeType, fileName);
      set({ current: data, isLoading: false });
    } catch (e: any) {
      set({
        error: e?.response?.data?.detail ?? 'Report analysis failed',
        isLoading: false,
      });
    }
  },

  fetchHistory: async () => {
    set({ isLoading: true });
    try {
      const data = await userService.getHistory();
      set({ history: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  clearCurrent: () => set({ current: null }),
  clearError: () => set({ error: null }),
}));
