import api from "./config";
import type { ApiResponse, PaginatedResponse } from "./types";

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
