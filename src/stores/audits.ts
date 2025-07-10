import type {
  Audit,
  AuditCreationConfig,
  AuditFilters,
  AuditStatus,
  Correction,
  PaginationConfig,
  TableSort,
} from "@/types/audit";
import type { DocumentType } from "@/types/document";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { Category, Severity, SourceType } from "@/types/audit";
import { auditsAPI } from "@/services/api";

export const useAuditsStore = defineStore("audits", () => {
  // State
  const audits = ref<Audit[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<AuditFilters>({});
  const sort = ref<TableSort>({ key: "createdAt", order: "desc" });
  const pagination = ref<PaginationConfig>({
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });
  const selectedAudits = ref<string[]>([]);

  // Getters
  const filteredAudits = computed(() => {
    let filtered = [...audits.value];

    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      filtered = filtered.filter(
        (audit) =>
          audit.name.toLowerCase().includes(searchTerm) ||
          audit.sourceContent.toLowerCase().includes(searchTerm) ||
          audit.correctedContent.toLowerCase().includes(searchTerm),
      );
    }

    // Apply source type filter
    if (filters.value.sourceType) {
      filtered = filtered.filter(
        (audit) => audit.sourceType === filters.value.sourceType,
      );
    }

    // Apply status filter
    if (filters.value.status) {
      filtered = filtered.filter(
        (audit) => audit.status === filters.value.status,
      );
    }

    // Apply severity filter
    if (filters.value.severity) {
      filtered = filtered.filter((audit) =>
        audit.corrections.some(
          (correction) => correction.severity === filters.value.severity,
        ),
      );
    }

    // Apply category filter
    if (filters.value.category) {
      filtered = filtered.filter((audit) =>
        audit.corrections.some(
          (correction) => correction.category === filters.value.category,
        ),
      );
    }

    // Apply date filters
    if (filters.value.dateFrom) {
      filtered = filtered.filter(
        (audit) => audit.createdAt >= filters.value.dateFrom!,
      );
    }
    if (filters.value.dateTo) {
      filtered = filtered.filter(
        (audit) => audit.createdAt <= filters.value.dateTo!,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sort.value.key as keyof Audit];
      const bValue = b[sort.value.key as keyof Audit];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) {
        return 0;
      }
      if (aValue === undefined) {
        return sort.value.order === "asc" ? -1 : 1;
      }
      if (bValue === undefined) {
        return sort.value.order === "asc" ? 1 : -1;
      }

      if (sort.value.order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  });

  const paginatedAudits = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.itemsPerPage;
    const end = start + pagination.value.itemsPerPage;
    return filteredAudits.value.slice(start, end);
  });

  const auditStats = computed(() => {
    const stats = {
      total: audits.value.length,
      bySourceType: { TOS: 0, PRIVACY_POLICY: 0, CGU: 0, WEB: 0, DOCUMENT: 0 },
      byStatus: {
        PENDING: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        REVIEWED: 0,
        ARCHIVED: 0,
      },
      bySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    };

    for (const audit of audits.value) {
      stats.bySourceType[audit.sourceType]++;
      stats.byStatus[audit.status]++;

      for (const correction of audit.corrections) {
        stats.bySeverity[correction.severity]++;
      }
    }

    return stats;
  });

  // Actions
  const fetchAudits = async () => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        page: pagination.value.page,
        itemsPerPage: pagination.value.itemsPerPage,
        search: filters.value.search,
        sourceType: filters.value.sourceType,
        documentType: filters.value.documentType,
        status: filters.value.status,
        severity: filters.value.severity,
        category: filters.value.category,
        dateFrom: filters.value.dateFrom?.toISOString(),
        dateTo: filters.value.dateTo?.toISOString(),
        sortKey: sort.value.key,
        sortOrder: sort.value.order,
      };

      const response = await auditsAPI.getAudits(params);

      if (response.success && response.data) {
        audits.value = response.data.data.map((audit: any) => ({
          id: audit._id,
          name: audit.name,
          sourceType: audit.sourceType,
          documentType: audit.documentType,
          sourceContent: audit.sourceContent,
          correctedContent: audit.correctedContent,
          status: audit.status,
          createdAt: new Date(audit.createdAt),
          updatedAt: new Date(audit.updatedAt),
          version: audit.version,
          metadata: audit.metadata,
          corrections: audit.corrections.map((correction: any) => ({
            id: correction._id,
            originalText: correction.originalText,
            correctedText: correction.correctedText,
            explanation: correction.explanation,
            severity: correction.severity,
            category: correction.category,
            startPosition: correction.startPosition,
            endPosition: correction.endPosition,
            page: correction.page,
            lineStart: correction.lineStart,
            lineEnd: correction.lineEnd,
            createdAt: new Date(correction.createdAt),
          })),
          context: audit.context,
          notes: audit.notes,
        }));
        pagination.value.totalItems = response.data.pagination.totalItems;
      } else {
        throw new Error(response.error || "Failed to fetch audits");
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : "Failed to fetch audits";
      console.error("Error fetching audits:", error_);
    } finally {
      loading.value = false;
    }
  };

  const fetchAudit = async (id: string): Promise<Audit | null> => {
    try {
      const response = await auditsAPI.getAudit(id);

      if (response.success && response.data) {
        const auditRaw = response.data.audit;
        const audit = {
          ...auditRaw,
          id: auditRaw._id,
          corrections: auditRaw.corrections
            ? auditRaw.corrections.map((correction: any) => ({
                ...correction,
                id: correction._id,
              }))
            : [],
        };

        return audit;
      } else {
        console.error("Error fetching audit:", response.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching audit:", error);
      return null;
    }
  };

  const createAudit = async (config: AuditCreationConfig): Promise<Audit> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await auditsAPI.createAudit({
        sourceType: config.sourceType,
        documentType: config.documentType,
        sourceContent: config.sourceContent,
        sourceUrl: config.sourceUrl,
        file: config.file,
        companyName: config.companyName,
        domain: config.domain,
        jurisdiction: config.jurisdiction,
        customFields: config.customFields,
      });

      if (response.success && response.data) {
        const newAudit = response.data.audit;
        audits.value.unshift(newAudit);
        pagination.value.totalItems = audits.value.length;

        // If there's a job (web scraping or document parsing), return audit with job info
        if (response.data.job) {
          return {
            ...newAudit,
            job: response.data.job,
          } as any;
        }

        return newAudit;
      } else {
        throw new Error(response.message || "Failed to create audit");
      }
    } catch (error_) {
      error.value = "Failed to create audit";
      console.error("Error creating audit:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const createNewVersion = async (
    auditId: string,
    feedback: string,
    newContext?: string,
  ): Promise<Audit> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await auditsAPI.createNewVersion(auditId, {
        feedback,
        newContext,
      });

      if (response.success && response.data) {
        const newVersion = response.data.audit;
        audits.value.unshift(newVersion);
        pagination.value.totalItems = audits.value.length;
        return newVersion;
      } else {
        throw new Error(response.message || "Failed to create new version");
      }
    } catch (error_) {
      error.value = "Failed to create new version";
      console.error("Error creating new version:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const updateAudit = async (
    id: string,
    updates: Partial<Audit>,
  ): Promise<Audit> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await auditsAPI.updateAudit(id, updates);

      if (response.success && response.data) {
        const updatedAudit = response.data.audit;
        const index = audits.value.findIndex((audit) => audit.id === id);
        if (index !== -1) {
          audits.value[index] = updatedAudit;
        }
        return updatedAudit;
      } else {
        throw new Error(response.message || "Failed to update audit");
      }
    } catch (error_) {
      error.value = "Failed to update audit";
      console.error("Error updating audit:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const deleteAudit = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await auditsAPI.deleteAudit(id);

      if (response.success) {
        const index = audits.value.findIndex((audit) => audit.id === id);
        if (index !== -1) {
          audits.value.splice(index, 1);
          pagination.value.totalItems = audits.value.length;
        }

        // Remove from selected audits if present
        const selectedIndex = selectedAudits.value.indexOf(id);
        if (selectedIndex !== -1) {
          selectedAudits.value.splice(selectedIndex, 1);
        }
      } else {
        throw new Error(response.message || "Failed to delete audit");
      }
    } catch (error_) {
      error.value = "Failed to delete audit";
      console.error("Error deleting audit:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteAudits = async (ids: string[]): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await auditsAPI.bulkDeleteAudits(ids);

      if (response.success) {
        audits.value = audits.value.filter((audit) => !ids.includes(audit.id));
        pagination.value.totalItems = audits.value.length;
        selectedAudits.value = [];
      } else {
        throw new Error(response.message || "Failed to delete audits");
      }
    } catch (error_) {
      error.value = "Failed to delete audits";
      console.error("Error bulk deleting audits:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const setFilters = (newFilters: AuditFilters) => {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1; // Reset to first page when filtering
  };

  const setSort = (newSort: TableSort) => {
    sort.value = newSort;
  };

  const setPagination = (newPagination: Partial<PaginationConfig>) => {
    pagination.value = { ...pagination.value, ...newPagination };
  };

  const toggleAuditSelection = (id: string) => {
    const index = selectedAudits.value.indexOf(id);
    if (index === -1) {
      selectedAudits.value.push(id);
    } else {
      selectedAudits.value.splice(index, 1);
    }
  };

  const clearSelection = () => {
    selectedAudits.value = [];
  };

  const selectAll = () => {
    selectedAudits.value = paginatedAudits.value.map((audit) => audit.id);
  };

  return {
    // State
    audits,
    loading,
    error,
    filters,
    sort,
    pagination,
    selectedAudits,

    // Getters
    filteredAudits,
    paginatedAudits,
    auditStats,

    // Actions
    fetchAudits,
    fetchAudit,
    createAudit,
    createNewVersion,
    updateAudit,
    deleteAudit,
    bulkDeleteAudits,
    setFilters,
    setSort,
    setPagination,
    toggleAuditSelection,
    clearSelection,
    selectAll,
  };
});
