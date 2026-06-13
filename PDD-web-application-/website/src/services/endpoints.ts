import { api } from './api';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

export const authService = {
  async register(name: string, email: string, password: string) {
    /**
     * LOW-01 fix: Backend sets tokens as httpOnly cookies via Set-Cookie.
     * We no longer store anything in localStorage.
     */
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  async login(email: string, password: string) {
    /**
     * LOW-01 fix: Backend sets tokens as httpOnly cookies via Set-Cookie.
     * We no longer store anything in localStorage.
     */
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async logout() {
    /**
     * LOW-01 fix: Calls /auth/logout which revokes the JTI server-side
     * and clears the httpOnly cookies via Set-Cookie: Max-Age=0.
     */
    try {
      await api.post('/auth/logout');
    } catch (_) { /* best-effort */ }
  },

  /**
   * LOW-01 fix: Auth state is determined by calling /auth/me (server validates the
   * httpOnly cookie). No token string ever lives in JavaScript memory.
   */
  async checkAuthStatus(): Promise<{ authenticated: boolean; user_id: string | null }> {
    try {
      const { data } = await api.get('/auth/me');
      return { authenticated: true, user_id: data.user_id };
    } catch {
      return { authenticated: false, user_id: null };
    }
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
  async predictWithReport(disease: string, file: File) {
    const formData = new FormData();
    formData.append('disease', disease);
    formData.append('file', file);
    const { data } = await api.post('/predict/report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
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
  async generate(predictionId: string): Promise<Blob> {
    const response = await api.post(
      '/report/generate',
      { prediction_id: predictionId },
      { responseType: 'blob' }
    );
    return response.data;
  },
};
