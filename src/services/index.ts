// Export all API services
export { authAPI } from "./auth";
export { documentsAPI } from "./documents";
export { auditsAPI } from "./audits";
export { healthAPI } from "./health";

// Export types
export type { ApiResponse, PaginatedResponse } from "./types";

// Export default api instance
export { default as api } from "./config";
