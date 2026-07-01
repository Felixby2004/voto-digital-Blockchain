import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
console.log('[AXIOS] BASE_URL configurado:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = useAuthStore.getState().tokens;
    console.log('[AXIOS REQUEST]', config.method?.toUpperCase(), config.url, '| token?', !!tokens?.accessToken);
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    } else {
      console.warn('[AXIOS REQUEST] No hay accessToken en el store — la petición irá sin Authorization');
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[AXIOS RESPONSE]', response.config.method?.toUpperCase(), response.config.url, '| status:', response.status, '| data type:', typeof response.data, '| isArray?', Array.isArray(response.data));
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    console.error('[AXIOS ERROR]', originalRequest?.method?.toUpperCase(), originalRequest?.url, '| status:', error.response?.status, '| message:', error.message, '| response data:', error.response?.data);
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = useAuthStore.getState().tokens;
      if (tokens?.refreshToken) {
        try {
          const res = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { refreshToken: tokens.refreshToken }
          );
          const newTokens = res.data;
          useAuthStore.getState().setTokens(newTokens);
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
