import api from "./config";
import type { ApiResponse } from "./types";

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse> => {
    const response = await api.get("/health");
    return response.data;
  },
};
