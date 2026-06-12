import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getDevHostFromExpo(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(':')[0];

  // Fallback for some Expo runtime shapes.
  const debuggerHost = (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;
  if (debuggerHost) return String(debuggerHost).split(':')[0];

  return null;
}

function resolveBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

  if (!__DEV__) return configured;

  // On real devices, localhost is the device itself. Redirect to dev host.
  if (configured.includes('localhost') || configured.includes('127.0.0.1')) {
    const host = getDevHostFromExpo();
    if (host) return configured.replace(/localhost|127\.0\.0\.1/g, host);

    // Android emulator loopback to host machine.
    if (Platform.OS === 'android') {
      return configured.replace(/localhost|127\.0\.0\.1/g, '10.0.2.2');
    }
  }

  return configured;
}

const BASE_URL = resolveBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        await SecureStore.setItemAsync('access_token', data.access_token);
        await SecureStore.setItemAsync('refresh_token', data.refresh_token);
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
