import api from "./config";
import type { ApiResponse } from "./types";

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
