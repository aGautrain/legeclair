import type {
  Document,
  DocumentFilters,
  DocumentGenerationConfig,
  DocumentStatus,
  DocumentType,
  PaginationConfig,
  TableSort,
} from "@/types/document";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { documentsAPI } from "@/services/api";

export const useDocumentsStore = defineStore("documents", () => {
  // State
  const documents = ref<Document[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<DocumentFilters>({});
  const sort = ref<TableSort>({ key: "createdAt", order: "desc" });
  const pagination = ref<PaginationConfig>({
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });
  const selectedDocuments = ref<string[]>([]);

  // Getters
  const filteredDocuments = computed(() => {
    let filtered = [...documents.value];

    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm) ||
          doc.content.toLowerCase().includes(searchTerm),
      );
    }

    // Apply type filter
    if (filters.value.type) {
      filtered = filtered.filter((doc) => doc.type === filters.value.type);
    }

    // Apply status filter
    if (filters.value.status) {
      filtered = filtered.filter((doc) => doc.status === filters.value.status);
    }

    // Apply date filters
    if (filters.value.dateFrom) {
      filtered = filtered.filter(
        (doc) => doc.createdAt >= filters.value.dateFrom!,
      );
    }
    if (filters.value.dateTo) {
      filtered = filtered.filter(
        (doc) => doc.createdAt <= filters.value.dateTo!,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sort.value.key as keyof Document];
      const bValue = b[sort.value.key as keyof Document];

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

  const paginatedDocuments = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.itemsPerPage;
    const end = start + pagination.value.itemsPerPage;
    return filteredDocuments.value.slice(start, end);
  });

  const documentStats = computed(() => {
    const stats = {
      total: documents.value.length,
      byType: { TOS: 0, PRIVACY_POLICY: 0, CGU: 0 },
      byStatus: { DRAFT: 0, GENERATED: 0, PUBLISHED: 0, ARCHIVED: 0 },
    };

    for (const doc of documents.value) {
      stats.byType[doc.type]++;
      stats.byStatus[doc.status]++;
    }

    return stats;
  });

  // Actions
  const fetchDocuments = async () => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        page: pagination.value.page,
        itemsPerPage: pagination.value.itemsPerPage,
        search: filters.value.search,
        type: filters.value.type,
        status: filters.value.status,
        dateFrom: filters.value.dateFrom?.toISOString(),
        dateTo: filters.value.dateTo?.toISOString(),
        sortKey: sort.value.key,
        sortOrder: sort.value.order,
      };

      const response = await documentsAPI.getDocuments(params);

      if (response.success && response.data) {
        documents.value = response.data.data.map((doc: any) => ({
          id: doc._id,
          name: doc.name,
          type: doc.type,
          content: doc.content,
          status: doc.status,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          version: doc.version,
          metadata: doc.metadata,
        }));
        pagination.value.totalItems = response.data.pagination.totalItems;
      } else {
        throw new Error(response.error || "Failed to fetch documents");
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : "Failed to fetch documents";
      console.error("Error fetching documents:", error_);
    } finally {
      loading.value = false;
    }
  };

  const createDocument = async (
    config: DocumentGenerationConfig,
  ): Promise<Document> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await documentsAPI.createDocument(config);

      if (response.success && response.data) {
        const newDocument: Document = {
          id: response.data.document._id,
          name: response.data.document.name,
          type: response.data.document.type,
          content: response.data.document.content,
          status: response.data.document.status,
          createdAt: new Date(response.data.document.createdAt),
          updatedAt: new Date(response.data.document.updatedAt),
          version: response.data.document.version,
          metadata: response.data.document.metadata,
        };

        documents.value.unshift(newDocument);
        pagination.value.totalItems++;

        return newDocument;
      } else {
        throw new Error(response.error || "Failed to create document");
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : "Failed to create document";
      console.error("Error creating document:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const updateDocument = async (
    id: string,
    updates: Partial<Document>,
  ): Promise<Document> => {
    loading.value = true;
    error.value = null;

    try {
      const index = documents.value.findIndex((doc) => doc.id === id);
      if (index === -1) {
        throw new Error("Document not found");
      }

      const updatedDocument = {
        ...documents.value[index],
        ...updates,
        updatedAt: new Date(),
        version: documents.value[index].version + 1,
      };

      documents.value[index] = updatedDocument;
      return updatedDocument;
    } catch (error_) {
      error.value = "Failed to update document";
      console.error("Error updating document:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const index = documents.value.findIndex((doc) => doc.id === id);
      if (index === -1) {
        throw new Error("Document not found");
      }

      documents.value.splice(index, 1);
      pagination.value.totalItems = documents.value.length;

      // Remove from selected documents if present
      const selectedIndex = selectedDocuments.value.indexOf(id);
      if (selectedIndex !== -1) {
        selectedDocuments.value.splice(selectedIndex, 1);
      }
    } catch (error_) {
      error.value = "Failed to delete document";
      console.error("Error deleting document:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteDocuments = async (ids: string[]): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      documents.value = documents.value.filter((doc) => !ids.includes(doc.id));
      pagination.value.totalItems = documents.value.length;
      selectedDocuments.value = [];
    } catch (error_) {
      error.value = "Failed to delete documents";
      console.error("Error bulk deleting documents:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const setFilters = (newFilters: DocumentFilters) => {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1; // Reset to first page when filtering
  };

  const setSort = (newSort: TableSort) => {
    sort.value = newSort;
  };

  const setPagination = (newPagination: Partial<PaginationConfig>) => {
    pagination.value = { ...pagination.value, ...newPagination };
  };

  const toggleDocumentSelection = (id: string) => {
    const index = selectedDocuments.value.indexOf(id);
    if (index === -1) {
      selectedDocuments.value.push(id);
    } else {
      selectedDocuments.value.splice(index, 1);
    }
  };

  const clearSelection = () => {
    selectedDocuments.value = [];
  };

  const selectAll = () => {
    selectedDocuments.value = paginatedDocuments.value.map((doc) => doc.id);
  };

  return {
    // State
    documents,
    loading,
    error,
    filters,
    sort,
    pagination,
    selectedDocuments,

    // Getters
    filteredDocuments,
    paginatedDocuments,
    documentStats,

    // Actions
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    bulkDeleteDocuments,
    setFilters,
    setSort,
    setPagination,
    toggleDocumentSelection,
    clearSelection,
    selectAll,
  };
});
