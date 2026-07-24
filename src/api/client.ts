import axios, { AxiosError } from "axios";
import { getStoredToken, useAuthStore } from "@/store/auth.store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; details?: unknown }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().signOut();
    }
    const message = error.response?.data?.error ?? error.message ?? "Request failed";
    throw new ApiError(error.response?.status ?? 0, message, error.response?.data?.details);
  },
);
