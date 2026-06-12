import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * LOW-01 fix: withCredentials: true instructs the browser to send/receive
 * httpOnly cookies on every request. Tokens never touch JavaScript memory
 * or localStorage — they live exclusively in the browser's cookie jar,
 * invisible to any script including XSS payloads.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,              // Send httpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: No localStorage reads needed.
// The browser attaches the httpOnly access_token cookie automatically.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

function processQueue(error: any) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(null)));
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
        }).then(() => api(originalRequest)).catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        /**
         * LOW-01 fix: The browser sends the httpOnly refresh_token cookie
         * automatically (path=/auth/refresh). No token string in JS at all.
         * We still send an empty body since the backend also accepts cookie.
         */
        await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: '' },   // Body ignored if cookie is present
          { withCredentials: true }
        );

        processQueue(null);
        return api(originalRequest);
      } catch (e) {
        processQueue(e);
        // Cookie-based logout: backend clears cookies via /auth/logout
        try {
          await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
        } catch (_) { /* best-effort */ }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
