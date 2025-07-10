<template>
  <div class="audits-dashboard">
    <!-- Page Header -->
    <v-container class="py-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h3 font-weight-bold text-primary mb-2">
            {{ $t("audits_title") }}
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            {{ $t("audits_subtitle") }}
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showCreateDialog = true"
        >
          {{ $t("new_audit") }}
        </v-btn>
      </div>

      <!-- Action Cards Section -->
      <section class="action-cards mb-8">
        <h2 class="text-h5 font-weight-semibold mb-4">
          {{ $t("quick_actions") }}
        </h2>
        <v-row>
          <v-col v-for="card in actionCards" :key="card.type" cols="12" md="4">
            <v-card
              :aria-label="`Create ${card.title} Audit`"
              class="action-card"
              :color="card.color"
              elevation="4"
              role="button"
              tabindex="0"
              @click="openCreationDialog(card.type)"
              @keydown.enter="openCreationDialog(card.type)"
              @keydown.space="openCreationDialog(card.type)"
            >
              <v-card-text class="text-center pa-6">
                <v-icon
                  class="mb-4"
                  color="white"
                  :icon="card.icon"
                  size="48"
                />
                <h3 class="text-h6 font-weight-semibold text-white mb-2">
                  {{ card.title }}
                </h3>
                <p class="text-white text-body-2 opacity-90">
                  {{ card.description }}
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <!-- Statistics Cards -->
      <section class="stats-section mb-8">
        <v-row>
          <v-col
            v-for="stat in auditStatsCards"
            :key="stat.label"
            cols="12"
            md="3"
          >
            <v-card class="stat-card" elevation="2">
              <v-card-text class="text-center pa-4">
                <v-icon
                  class="mb-2"
                  :color="stat.color"
                  :icon="stat.icon"
                  size="32"
                />
                <div
                  class="text-h4 font-weight-bold"
                  :class="`text-${stat.color}`"
                >
                  {{ stat.value }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ stat.label }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <!-- Search and Filters -->
      <section class="filters-section mb-6">
        <v-card elevation="2">
          <v-card-text class="pa-6">
            <v-row>
              <!-- Search -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  clearable
                  density="comfortable"
                  :label="$t('search_audits')"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  @keyup.enter="handleSearch"
                  @update:model-value="handleSearch"
                />
              </v-col>

              <!-- Source Type Filter -->
              <v-col cols="12" md="2">
                <v-select
                  v-model="sourceTypeFilter"
                  clearable
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  :items="sourceTypes"
                  :label="$t('source_type')"
                  variant="outlined"
                  @update:model-value="handleSourceTypeFilter"
                />
              </v-col>

              <!-- Status Filter -->
              <v-col cols="12" md="2">
                <v-select
                  v-model="statusFilter"
                  clearable
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  :items="auditStatuses"
                  :label="$t('status')"
                  variant="outlined"
                  @update:model-value="handleStatusFilter"
                />
              </v-col>

              <!-- Severity Filter -->
              <v-col cols="12" md="2">
                <v-select
                  v-model="severityFilter"
                  clearable
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  :items="severityLevels"
                  :label="$t('severity')"
                  variant="outlined"
                  @update:model-value="handleSeverityFilter"
                />
              </v-col>

              <!-- Document Type Filter -->
              <v-col cols="12" md="2">
                <v-select
                  v-model="documentTypeFilter"
                  clearable
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  :items="documentTypes"
                  :label="$t('document_type')"
                  variant="outlined"
                  @update:model-value="handleDocumentTypeFilter"
                />
              </v-col>
            </v-row>

            <v-divider class="my-8" />

            <v-row>
              <v-col cols="12" md="3">
                <v-select
                  v-model="categoryFilter"
                  clearable
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  :items="correctionCategories"
                  :label="$t('category')"
                  variant="outlined"
                  @update:model-value="handleCategoryFilter"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="dateFrom"
                  density="comfortable"
                  :label="$t('date_from')"
                  type="date"
                  variant="outlined"
                  @update:model-value="handleDateFilter"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="dateTo"
                  density="comfortable"
                  :label="$t('date_to')"
                  type="date"
                  variant="outlined"
                  @update:model-value="handleDateFilter"
                />
              </v-col>
              <v-col class="d-flex align-center" cols="12" md="3">
                <v-btn
                  prepend-icon="mdi-filter-remove"
                  variant="outlined"
                  @click="clearFilters"
                >
                  {{ $t("clear_filters") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </section>

      <!-- Audits Table -->
      <section class="audits-table-section">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between pa-6">
            <div>
              <span class="text-h6 font-weight-semibold">{{
                $t("audits")
              }}</span>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                v-if="selectedAudits.length > 0"
                color="error"
                prepend-icon="mdi-delete"
                variant="outlined"
                @click="confirmBulkDelete"
              >
                {{ $t("delete_selected", { count: selectedAudits.length }) }}
              </v-btn>
              <v-btn
                prepend-icon="mdi-download"
                variant="outlined"
                @click="exportTable"
              >
                {{ $t("export") }}
              </v-btn>
            </div>
          </v-card-title>

          <!-- Loading State -->
          <div v-if="loading" class="pa-8 text-center">
            <v-progress-circular color="primary" indeterminate size="64" />
            <p class="text-body-1 mt-4">{{ $t("loading_audits") }}</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="pa-8 text-center">
            <v-icon class="mb-4" color="error" size="64"
              >mdi-alert-circle</v-icon
            >
            <h3 class="text-h6 text-error mb-2">
              {{ $t("error_loading_audits") }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ error }}</p>
            <v-btn color="primary" @click="fetchAudits">{{
              $t("retry")
            }}</v-btn>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="paginatedAudits.length === 0"
            class="pa-8 text-center"
          >
            <v-icon class="mb-4" color="grey-lighten-1" size="64">
              mdi-file-search-outline
            </v-icon>
            <h3 class="text-h6 text-grey-darken-1 mb-2">
              {{ $t("no_audits_found") }}
            </h3>
            <p class="text-body-2 text-grey-darken-1 mb-4">
              {{
                searchQuery || sourceTypeFilter || statusFilter
                  ? $t("try_adjusting_filters")
                  : $t("create_first_audit")
              }}
            </p>
            <v-btn color="primary" @click="showCreateDialog = true">
              {{ $t("create_audit") }}
            </v-btn>
          </div>

          <!-- Audits Table -->
          <v-data-table
            v-else
            class="audits-table"
            :headers="tableHeaders"
            :items="paginatedAudits"
            :items-per-page="pagination.itemsPerPage"
            :items-per-page-text="$t('items_per_page')"
            :model-value="selectedAudits"
            :page="pagination.page"
            show-select
            :sort-by="[
              { key: auditsStore.sort.key, order: auditsStore.sort.order },
            ]"
            @update:items-per-page="handleItemsPerPageChange"
            @update:model-value="handleSelectionChange"
            @update:page="handlePageChange"
            @update:sort-by="handleSort"
          >
            <!-- Source Type Column -->
            <template #item.sourceType="{ item }">
              <v-chip
                :color="getSourceTypeColor(item.sourceType)"
                size="small"
                variant="tonal"
              >
                {{ getSourceTypeLabel(item.sourceType) }}
              </v-chip>
            </template>

            <!-- Status Column -->
            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="tonal"
              >
                {{ getStatusLabel(item.status) }}
              </v-chip>
            </template>

            <!-- Corrections Count Column -->
            <template #item.correctionsCount="{ item }">
              <v-chip color="success" size="small" variant="tonal">
                {{ item.corrections.length }} {{ $t("corrections") }}
              </v-chip>
            </template>

            <!-- Created Date Column -->
            <template #item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <!-- Updated Date Column -->
            <template #item.updatedAt="{ item }">
              {{ formatDate(item.updatedAt) }}
            </template>

            <!-- Document Type Column -->
            <template #item.documentType="{ item }">
              <v-chip
                :color="getDocumentTypeColor(item.documentType)"
                size="small"
                variant="tonal"
              >
                {{ getDocumentTypeLabel(item.documentType) }}
              </v-chip>
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  color="primary"
                  icon="mdi-eye"
                  size="small"
                  :title="$t('view_audit')"
                  variant="text"
                  @click="viewAudit(item)"
                />
                <v-btn
                  color="warning"
                  icon="mdi-pencil"
                  size="small"
                  :title="$t('edit_audit')"
                  variant="text"
                  @click="editAudit(item)"
                />
                <v-btn
                  icon="mdi-download"
                  size="small"
                  :title="$t('download_audit')"
                  variant="text"
                  @click="downloadAudit(item)"
                />
              </div>
            </template>
          </v-data-table>
        </v-card>
      </section>
    </v-container>

    <!-- Create Audit Dialog -->
    <AuditCreationDialog
      v-model="showCreateDialog"
      :selected-source-type="selectedSourceType"
      @audit-created="handleAuditCreated"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>{{ $t("confirm_delete") }}</v-card-title>
        <v-card-text>
          {{
            $t("confirm_delete_audit_message", { name: auditToDelete?.name })
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">{{
            $t("cancel")
          }}</v-btn>
          <v-btn color="error" @click="deleteAudit">{{ $t("delete") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bulk Delete Confirmation Dialog -->
    <v-dialog v-model="showBulkDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>{{ $t("confirm_bulk_delete") }}</v-card-title>
        <v-card-text>
          {{
            $t("confirm_bulk_delete_message", { count: selectedAudits.length })
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showBulkDeleteDialog = false">{{
            $t("cancel")
          }}</v-btn>
          <v-btn color="error" @click="bulkDeleteAudits">{{
            $t("delete")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toast Notifications -->
    <v-snackbar v-model="showSuccessMessage" color="success" timeout="3000">
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar v-model="showErrorMessage" color="error" timeout="5000">
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import type { Audit, AuditStatus } from "@/types/audit";
import type { DocumentType } from "@/types/document";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import AuditCreationDialog from "@/components/AuditCreationDialog.vue";
import { routeUtils } from "@/router";
import { useAuditsStore } from "@/stores/audits";
import { Category, Severity, SourceType } from "@/types/audit";

// Store and i18n
const auditsStore = useAuditsStore();
const { t } = useI18n();
const router = useRouter();

// Reactive data
const searchQuery = ref("");
const sourceTypeFilter = ref<SourceType | null>(null);
const statusFilter = ref<AuditStatus | null>(null);
const severityFilter = ref<Severity | null>(null);
const categoryFilter = ref<Category | null>(null);
const dateFrom = ref("");
const dateTo = ref("");
const showAdvancedFilters = ref(false);
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const showBulkDeleteDialog = ref(false);
const selectedSourceType = ref<SourceType | null>(null);
const auditToDelete = ref<Audit | null>(null);
const showSuccessMessage = ref(false);
const showErrorMessage = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const documentTypeFilter = ref<DocumentType | null>(null);

// Computed properties
const {
  loading,
  error,
  paginatedAudits,
  pagination,
  selectedAudits,
  auditStats,
} = storeToRefs(auditsStore);

const actionCards = computed(() => [
  {
    type: SourceType.WEB,
    title: t("audit_web_source"),
    description: t("audit_web_source_desc"),
    icon: "mdi-web",
    color: "primary",
  },
  {
    type: SourceType.DOCUMENT,
    title: t("audit_document_source"),
    description: t("audit_document_source_desc"),
    icon: "mdi-file-upload",
    color: "success",
  },
]);

const auditStatsCards = computed(() => [
  {
    label: t("total_audits"),
    value: auditStats.value.total,
    icon: "mdi-file-search-outline",
    color: "primary",
  },
  {
    label: t("completed_audits"),
    value: auditStats.value.byStatus.COMPLETED,
    icon: "mdi-check-circle-outline",
    color: "success",
  },
  {
    label: t("critical_issues"),
    value: auditStats.value.bySeverity.CRITICAL,
    icon: "mdi-alert-circle-outline",
    color: "error",
  },
  {
    label: t("pending_reviews"),
    value:
      auditStats.value.byStatus.PENDING + auditStats.value.byStatus.IN_PROGRESS,
    icon: "mdi-clock-outline",
    color: "warning",
  },
]);

const sourceTypes = computed(() => [
  { label: t("source_web"), value: SourceType.WEB },
  { label: t("source_document"), value: SourceType.DOCUMENT },
]);

const auditStatuses = computed(() => [
  { label: t("pending"), value: "PENDING" },
  { label: t("in_progress"), value: "IN_PROGRESS" },
  { label: t("completed"), value: "COMPLETED" },
  { label: t("reviewed"), value: "REVIEWED" },
  { label: t("archived"), value: "ARCHIVED" },
]);

const severityLevels = computed(() => [
  { label: t("low"), value: Severity.LOW },
  { label: t("medium"), value: Severity.MEDIUM },
  { label: t("high"), value: Severity.HIGH },
  { label: t("critical"), value: Severity.CRITICAL },
]);

const correctionCategories = computed(() => [
  { label: t("grammar"), value: Category.GRAMMAR },
  { label: t("legal"), value: Category.LEGAL },
  { label: t("compliance"), value: Category.COMPLIANCE },
  { label: t("clarity"), value: Category.CLARITY },
  { label: t("structure"), value: Category.STRUCTURE },
  { label: t("other"), value: Category.OTHER },
]);

const documentTypes = computed(() => [
  { label: t("terms_of_service"), value: "TOS" },
  { label: t("privacy_policy"), value: "PRIVACY_POLICY" },
  { label: t("terms_conditions"), value: "CGU" },
]);

const tableHeaders = computed(() => [
  { title: t("name"), key: "name", sortable: true },
  { title: t("source"), key: "sourceType", sortable: true },
  { title: t("type"), key: "documentType", sortable: true },
  { title: t("status"), key: "status", sortable: true },
  { title: t("corrections"), key: "correctionsCount", sortable: false },
  { title: t("created"), key: "createdAt", sortable: true },
  { title: t("modified"), key: "updatedAt", sortable: true },
  { title: t("actions"), key: "actions", sortable: false, width: "200px" },
]);

// Methods
const openCreationDialog = (type: DocumentType | SourceType) => {
  if (type === "TOS" || type === "PRIVACY_POLICY" || type === "CGU") {
    // Handle document type - we need to set a default source type
    selectedSourceType.value = SourceType.DOCUMENT;
  } else {
    // Handle source type
    selectedSourceType.value = type;
  }
  showCreateDialog.value = true;
};

const handleSearch = () => {
  auditsStore.setFilters({ search: searchQuery.value });
};

const handleSourceTypeFilter = () => {
  auditsStore.setFilters({ sourceType: sourceTypeFilter.value || undefined });
};

const handleStatusFilter = () => {
  auditsStore.setFilters({ status: statusFilter.value || undefined });
};

const handleSeverityFilter = () => {
  auditsStore.setFilters({ severity: severityFilter.value || undefined });
};

const handleCategoryFilter = () => {
  auditsStore.setFilters({ category: categoryFilter.value || undefined });
};

const handleDateFilter = () => {
  auditsStore.setFilters({
    dateFrom: dateFrom.value ? new Date(dateFrom.value) : undefined,
    dateTo: dateTo.value ? new Date(dateTo.value) : undefined,
  });
};

const handleDocumentTypeFilter = () => {
  auditsStore.setFilters({
    documentType: documentTypeFilter.value || undefined,
  });
};

const clearFilters = () => {
  searchQuery.value = "";
  sourceTypeFilter.value = null;
  statusFilter.value = null;
  severityFilter.value = null;
  categoryFilter.value = null;
  dateFrom.value = "";
  dateTo.value = "";
  documentTypeFilter.value = null;
  auditsStore.setFilters({});
};

const handleSelectionChange = (selection: string[]) => {
  selectedAudits.value = selection;
};

const handleSort = (sortBy: any[]) => {
  if (sortBy.length > 0) {
    auditsStore.setSort({
      key: sortBy[0].key,
      order: sortBy[0].order,
    });
  }
};

const handlePageChange = (page: number) => {
  auditsStore.setPagination({ page });
};

const handleItemsPerPageChange = (itemsPerPage: number) => {
  auditsStore.setPagination({ itemsPerPage, page: 1 });
};

const viewAudit = (audit: Audit) => {
  routeUtils.navigateToAudit(audit.id).catch((error) => {
    console.error("Failed to navigate to audit:", error);
  });
};

const editAudit = (audit: Audit) => {
  routeUtils.navigateToAuditWithTab(audit.id, "edit").catch((error) => {
    console.error("Failed to navigate to audit edit:", error);
  });
};

const downloadAudit = async (audit: Audit) => {
  try {
    // Create audit report content
    const reportContent = `Audit Report: ${audit.name}
Source Type: ${audit.sourceType}
Status: ${audit.status}
Created: ${formatDate(audit.createdAt)}
Updated: ${formatDate(audit.updatedAt)}

ORIGINAL CONTENT:
${audit.sourceContent}

CORRECTED CONTENT:
${audit.correctedContent}

CORRECTIONS (${audit.corrections.length}):
${audit.corrections.map((c) => `- ${c.originalText} → ${c.correctedText} (${c.severity}/${c.category}): ${c.explanation}`).join("\n")}
`;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${audit.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_audit_report.txt`;
    window.document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showSuccessMessage.value = true;
    successMessage.value = t("audit_downloaded");
  } catch {
    showErrorMessage.value = true;
    errorMessage.value = t("failed_to_download_audit");
  }
};

const confirmDelete = (audit: Audit) => {
  auditToDelete.value = audit;
  showDeleteDialog.value = true;
};

const deleteAudit = async () => {
  if (!auditToDelete.value) return;

  try {
    await auditsStore.deleteAudit(auditToDelete.value.id);
    showDeleteDialog.value = false;
    auditToDelete.value = null;

    showSuccessMessage.value = true;
    successMessage.value = t("audit_deleted_successfully");
  } catch {
    showErrorMessage.value = true;
    errorMessage.value = t("failed_to_delete_audit");
  }
};

const confirmBulkDelete = () => {
  showBulkDeleteDialog.value = true;
};

const bulkDeleteAudits = async () => {
  try {
    await auditsStore.bulkDeleteAudits(selectedAudits.value);
    showBulkDeleteDialog.value = false;

    showSuccessMessage.value = true;
    successMessage.value = t("audits_deleted_successfully", {
      count: selectedAudits.value.length,
    });
  } catch {
    showErrorMessage.value = true;
    errorMessage.value = t("failed_to_delete_audits");
  }
};

const handleAuditCreated = (audit: Audit) => {
  showSuccessMessage.value = true;
  successMessage.value = t("audit_created_successfully");
};

const exportTable = () => {
  // Implement CSV export functionality
  const csvContent = generateCSV(paginatedAudits.value);
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audits.csv";
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Utility functions
const getSourceTypeColor = (type: DocumentType | SourceType) => {
  const colors = {
    TOS: "primary",
    PRIVACY_POLICY: "success",
    CGU: "warning",
    [SourceType.WEB]: "info",
    [SourceType.DOCUMENT]: "secondary",
  };
  return colors[type] || "grey";
};

const getSourceTypeLabel = (type: SourceType) => {
  const labels = {
    [SourceType.WEB]: t("source_web"),
    [SourceType.DOCUMENT]: t("source_document"),
  };
  return labels[type] || type;
};

const getStatusColor = (status: AuditStatus) => {
  const colors = {
    PENDING: "warning",
    IN_PROGRESS: "info",
    COMPLETED: "success",
    REVIEWED: "primary",
    ARCHIVED: "grey",
  };
  return colors[status] || "grey";
};

const getStatusLabel = (status: AuditStatus) => {
  const labels = {
    PENDING: t("pending"),
    IN_PROGRESS: t("in_progress"),
    COMPLETED: t("completed"),
    REVIEWED: t("reviewed"),
    ARCHIVED: t("archived"),
  };
  return labels[status] || status;
};

const getCorrectionsColor = (count: number) => {
  if (count === 0) return "success";
  if (count <= 3) return "warning";
  if (count <= 7) return "orange";
  return "error";
};

const getDocumentTypeColor = (type: DocumentType | SourceType) => {
  const colors = {
    TOS: "primary",
    PRIVACY_POLICY: "success",
    CGU: "warning",
    [SourceType.WEB]: "info",
    [SourceType.DOCUMENT]: "secondary",
  };
  return colors[type] || "grey";
};

const getDocumentTypeLabel = (type: DocumentType) => {
  const labels = {
    TOS: t("terms_of_service"),
    PRIVACY_POLICY: t("privacy_policy"),
    CGU: t("terms_conditions"),
  };
  return labels[type] || type;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const generateCSV = (audits: Audit[]) => {
  const headers = [
    "Name",
    "Source Type",
    "Document Type",
    "Status",
    "Corrections",
    "Created",
    "Updated",
  ];
  const rows = audits.map((audit) => [
    audit.name,
    getSourceTypeLabel(audit.sourceType),
    getDocumentTypeLabel(audit.documentType),
    getStatusLabel(audit.status),
    audit.corrections.length,
    formatDate(audit.createdAt),
    formatDate(audit.updatedAt),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

// Lifecycle
onMounted(() => {
  auditsStore.fetchAudits();
});

// Watch for filter changes
watch(
  [
    searchQuery,
    sourceTypeFilter,
    statusFilter,
    severityFilter,
    categoryFilter,
    dateFrom,
    dateTo,
    documentTypeFilter,
  ],
  () => {
    // Debounce filter updates
    setTimeout(() => {
      handleSearch();
      handleSourceTypeFilter();
      handleStatusFilter();
      handleSeverityFilter();
      handleCategoryFilter();
      handleDateFilter();
      handleDocumentTypeFilter();
    }, 300);
  },
);
</script>

<style scoped>
.audits-dashboard {
  min-height: 100vh;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.audits-table {
  border-radius: 0 0 8px 8px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .action-cards .v-col {
    margin-bottom: 1rem;
  }

  .stats-section .v-col {
    margin-bottom: 1rem;
  }
}

@media (max-width: 600px) {
  .filters-section .v-col {
    margin-bottom: 1rem;
  }
}
</style>
