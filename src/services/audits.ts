import api from "./config";
import type { ApiResponse, PaginatedResponse } from "./types";

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
    sourceContent?: string;
    sourceUrl?: string;
    file?: File;
    companyName?: string;
    domain?: string;
    jurisdiction?: string;
    customFields?: Record<string, any>;
  }): Promise<ApiResponse<{ audit: any; job?: any }>> => {
    // Choose endpoint based on source type
    const endpoint =
      config.sourceType === "WEB" ? "/audits/web" : "/audits/document";

    if (config.sourceType === "WEB") {
      // For web audits, send JSON payload
      const payload = {
        sourceType: config.sourceType,
        documentType: config.documentType,
        sourceUrl: config.sourceUrl,
        companyName: config.companyName,
        domain: config.domain,
        jurisdiction: config.jurisdiction,
        customFields: config.customFields,
      };

      const response = await api.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } else {
      // For document audits, send multipart form data
      const formData = new FormData();

      // Add all config fields to form data
      Object.keys(config).forEach((key) => {
        if (key === "file" && config.file) {
          formData.append("document", config.file);
        } else if (
          key !== "file" &&
          config[key as keyof typeof config] !== undefined
        ) {
          formData.append(key, String(config[key as keyof typeof config]));
        }
      });

      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }
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
