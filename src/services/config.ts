import axios from "axios";
import type { AxiosInstance } from "axios";

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("legeclair_token") ||
      sessionStorage.getItem("legeclair_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem("legeclair_token");
      localStorage.removeItem("legeclair_user");
      sessionStorage.removeItem("legeclair_token");
      sessionStorage.removeItem("legeclair_user");

      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
