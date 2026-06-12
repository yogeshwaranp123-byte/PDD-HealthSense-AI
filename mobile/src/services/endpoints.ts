import { api } from './api';
import * as SecureStore from 'expo-secure-store';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-1.5-flash';

export const authService = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    return data;
  },

  async logout() {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },

  async hasToken(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('access_token');
    return !!token;
  },
};

export const userService = {
  async getProfile() {
    const { data } = await api.get('/user/profile');
    return data;
  },
  async updateProfile(payload: object) {
    const { data } = await api.put('/user/profile', payload);
    return data;
  },
  async getHistory() {
    const { data } = await api.get('/user/history');
    return data;
  },
};

export const predictService = {
  async predict(disease: string, inputs: object) {
    const { data } = await api.post(`/predict/${disease}`, inputs);
    return data;
  },
  async predictWithReport(disease: string, fileUri: string, mimeType: string, fileName: string) {
    const formData = new FormData();
    formData.append('disease', disease);
    
    // Format for React Native File uploads
    formData.append('file', {
      uri: fileUri,
      name: fileName || 'report.jpg',
      type: mimeType || 'image/jpeg',
    } as any);

    const { data } = await api.post('/predict/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

export const chatService = {
  async sendMessage(message: string) {
    if (GEMINI_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_MEDICAL', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Gemini request failed (${res.status}). ${errText}`);
      }

      const json: any = await res.json();
      const text =
        json?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p?.text)
          .filter(Boolean)
          .join('') ?? '';

      if (!text) throw new Error('Gemini returned empty response');
      return text as string;
    }

    // Fallback to backend if no key configured.
    const { data } = await api.post('/chat', { message });
    return data.reply as string;
  },
};

export const hospitalService = {
  async getNearby(lat: number, lng: number, address?: string) {
    const { data } = await api.get('/hospitals/nearby', { params: { lat, lng, address } });
    return data;
  },
};

export const reportService = {
  async generate(predictionId: string): Promise<string> {
    const response = await api.post(
      '/report/generate',
      { prediction_id: predictionId },
      { responseType: 'blob' }
    );
    return response.data;
  },
};
