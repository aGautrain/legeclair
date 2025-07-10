import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    itemsPerPage: number;
    totalItems: number;
  };
}

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
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
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

// Auth API
export const authAPI = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: any }>> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<ApiResponse<{ user: any }>> => {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  getDocuments: async (params?: {
    page?: number;
    itemsPerPage?: number;
    search?: string;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    sortKey?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get("/documents", { params });
    return response.data;
  },

  getDocument: async (id: string): Promise<ApiResponse<{ document: any }>> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  createDocument: async (config: {
    type: string;
    companyName: string;
    domain: string;
    jurisdiction: string;
    customFields?: Record<string, any>;
  }): Promise<ApiResponse<{ document: any }>> => {
    const response = await api.post("/documents", config);
    return response.data;
  },

  updateDocument: async (
    id: string,
    updates: any,
  ): Promise<ApiResponse<{ document: any }>> => {
    const response = await api.put(`/documents/${id}`, updates);
    return response.data;
  },

  deleteDocument: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  bulkDeleteDocuments: async (
    ids: string[],
  ): Promise<ApiResponse<{ deletedCount: number }>> => {
    const response = await api.delete("/documents/bulk", { data: { ids } });
    return response.data;
  },

  getDocumentStats: async (): Promise<
    ApiResponse<{
      total: number;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
    }>
  > => {
    const response = await api.get("/documents/stats");
    return response.data;
  },
};

// Audits API
export const auditsAPI = {
  getAudits: async (params?: {
    page?: number;
    itemsPerPage?: number;
    search?: string;
    sourceType?: string;
    documentType?: string;
    status?: string;
    severity?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    sortKey?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get("/audits", { params });
    return response.data;
  },

  getAudit: async (id: string): Promise<ApiResponse<{ audit: any }>> => {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },

  createAudit: async (config: {
    sourceType: string;
    documentType: string;
    sourceContent: string;
    sourceName: string;
    sourceUrl?: string;
    companyName?: string;
    domain?: string;
    jurisdiction?: string;
    customFields?: Record<string, any>;
  }): Promise<ApiResponse<{ audit: any }>> => {
    const response = await api.post("/audits", config);
    return response.data;
  },

  updateAudit: async (
    id: string,
    updates: any,
  ): Promise<ApiResponse<{ audit: any }>> => {
    const response = await api.put(`/audits/${id}`, updates);
    return response.data;
  },

  deleteAudit: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/audits/${id}`);
    return response.data;
  },

  bulkDeleteAudits: async (
    ids: string[],
  ): Promise<ApiResponse<{ deletedCount: number }>> => {
    const response = await api.delete("/audits/bulk", { data: { ids } });
    return response.data;
  },

  createNewVersion: async (
    id: string,
    data: {
      feedback: string;
      newContext?: string;
    },
  ): Promise<ApiResponse<{ audit: any }>> => {
    const response = await api.post(`/audits/${id}/version`, data);
    return response.data;
  },

  getAuditStats: async (): Promise<
    ApiResponse<{
      total: number;
      bySourceType: Record<string, number>;
      byStatus: Record<string, number>;
      bySeverity: Record<string, number>;
    }>
  > => {
    const response = await api.get("/audits/stats");
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse> => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;
