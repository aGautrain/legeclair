<template>
  <div class="documents-dashboard">
    <!-- Page Header -->
    <v-container class="py-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h3 font-weight-bold text-primary mb-2">
            {{ $t('documents_title') }}
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            {{ $t('documents_subtitle') }}
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showCreateDialog = true"
        >
          {{ $t('new_document') }}
        </v-btn>
      </div>

      <!-- Action Cards Section -->
      <section class="action-cards mb-8">
        <h2 class="text-h5 font-weight-semibold mb-4">{{ $t('quick_actions') }}</h2>
        <v-row>
          <v-col cols="12" md="4" v-for="card in actionCards" :key="card.type">
            <v-card
              class="action-card"
              :color="card.color"
              elevation="4"
              @click="openGenerationDialog(card.type)"
              @keydown.enter="openGenerationDialog(card.type)"
              @keydown.space="openGenerationDialog(card.type)"
              tabindex="0"
              role="button"
              :aria-label="`Generate ${card.title}`"
            >
              <v-card-text class="text-center pa-6">
                <v-icon
                  :icon="card.icon"
                  size="48"
                  color="white"
                  class="mb-4"
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

      <!-- Filters and Search Section -->
      <section class="filters-section mb-6">
        <v-card elevation="2">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  :placeholder="$t('search_documents')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="handleSearch"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="typeFilter"
                  :items="documentTypes"
                  item-title="label"
                  item-value="value"
                  :placeholder="$t('filter_by_type')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="handleTypeFilter"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFilter"
                  :items="documentStatuses"
                  item-title="label"
                  item-value="value"
                  :placeholder="$t('filter_by_status')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="handleStatusFilter"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-filter-variant"
                  @click="showAdvancedFilters = !showAdvancedFilters"
                >
                  {{ $t('advanced_filters') }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- Advanced Filters -->
            <v-expand-transition>
              <div v-if="showAdvancedFilters" class="mt-4">
                <v-divider class="mb-4" />
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="dateFrom"
                      type="date"
                      label="From Date"
                      variant="outlined"
                      density="compact"
                      hide-details
                      @update:model-value="handleDateFilter"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="dateTo"
                      type="date"
                      label="To Date"
                      variant="outlined"
                      density="compact"
                      hide-details
                      @update:model-value="handleDateFilter"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </section>

      <!-- Documents Table Section -->
      <section class="documents-table">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <span class="text-h6">{{ $t('documents') }}</span>
              <v-chip
                v-if="selectedDocuments.length > 0"
                color="primary"
                class="ml-4"
                size="small"
              >
                {{ selectedDocuments.length }} {{ $t('selected') }}
              </v-chip>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                v-if="selectedDocuments.length > 0"
                color="error"
                variant="outlined"
                size="small"
                prepend-icon="mdi-delete"
                @click="confirmBulkDelete"
              >
                {{ $t('delete_selected') }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="small"
                prepend-icon="mdi-download"
                @click="exportTable"
              >
                {{ $t('export') }}
              </v-btn>
            </div>
          </v-card-title>

          <!-- Loading State -->
          <div v-if="loading" class="pa-8">
            <v-skeleton-loader
              type="table-heading, table-thead, table-tbody, table-tfoot"
            />
          </div>

          <!-- Empty State -->
          <div v-else-if="paginatedDocuments.length === 0" class="pa-8 text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-file-document-outline
            </v-icon>
            <h3 class="text-h6 text-grey-darken-1 mb-2">{{ $t('no_documents_found') }}</h3>
            <p class="text-body-2 text-grey-darken-1 mb-4">
              {{ searchQuery || typeFilter || statusFilter ? $t('try_adjusting_filters') : $t('create_first_document') }}
            </p>
            <v-btn
              color="primary"
              @click="showCreateDialog = true"
            >
              {{ $t('create_document') }}
            </v-btn>
          </div>

                     <!-- Documents Table -->
           <v-data-table
             v-else
             :headers="tableHeaders"
             :items="paginatedDocuments"
             :items-per-page="pagination.itemsPerPage"
             :page="pagination.page"
             :sort-by="[{ key: documentsStore.sort.key, order: documentsStore.sort.order }]"
             class="documents-table"
             show-select
             :model-value="selectedDocuments"
             :items-per-page-text="$t('items_per_page')"
             @update:model-value="handleSelectionChange"
             @update:sort-by="handleSort"
             @update:page="handlePageChange"
             @update:items-per-page="handleItemsPerPageChange"
           >
            <!-- Document Name Column -->
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  :icon="getDocumentIcon(item.type)"
                  :color="getDocumentColor(item.type)"
                  class="mr-3"
                />
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-grey-darken-1">
                    Version {{ item.version }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Document Type Column -->
            <template #item.type="{ item }">
              <v-chip
                :color="getDocumentColor(item.type)"
                size="small"
                variant="tonal"
              >
                {{ getDocumentTypeLabel(item.type) }}
              </v-chip>
            </template>

            <!-- Created Date Column -->
            <template #item.createdAt="{ item }">
              <div class="text-body-2">
                {{ formatDate(item.createdAt) }}
              </div>
            </template>

            <!-- Updated Date Column -->
            <template #item.updatedAt="{ item }">
              <div class="text-body-2">
                {{ formatDate(item.updatedAt) }}
              </div>
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

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="viewDocument(item)"
                  :aria-label="`View ${item.name}`"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="editDocument(item)"
                  :aria-label="`Edit ${item.name}`"
                />
                <v-btn
                  icon="mdi-download"
                  size="small"
                  variant="text"
                  color="success"
                  @click="downloadDocument(item)"
                  :aria-label="`Download ${item.name}`"
                />
                <v-btn
                  icon="mdi-refresh"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="regenerateDocument(item)"
                  :aria-label="`Regenerate ${item.name}`"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item)"
                  :aria-label="`Delete ${item.name}`"
                />
              </div>
            </template>
          </v-data-table>

          <!-- Pagination -->
          <v-card-actions v-if="paginatedDocuments.length > 0" class="justify-center">
            <v-pagination
              v-model="pagination.page"
              :length="Math.ceil(pagination.totalItems / pagination.itemsPerPage)"
              :total-visible="7"
              @update:model-value="handlePageChange"
            />
          </v-card-actions>
        </v-card>
      </section>
    </v-container>

    <!-- Document Generation Dialog -->
    <DocumentGenerationDialog
      v-model="showCreateDialog"
      :document-type="selectedDocumentType"
      @document-created="handleDocumentCreated"
    />

    <!-- Document View/Edit Dialog -->
    <DocumentViewDialog
      v-model="showViewDialog"
      :document="selectedDocument"
      @document-updated="handleDocumentUpdated"
    />

    <!-- Confirmation Dialogs -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>{{ $t('confirm_delete') }}</v-card-title>
        <v-card-text>
          {{ $t('confirm_delete_message', { name: documentToDelete?.name }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="error" @click="deleteDocument">{{ $t('delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showBulkDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>{{ $t('confirm_bulk_delete') }}</v-card-title>
        <v-card-text>
          {{ $t('confirm_bulk_delete_message', { count: selectedDocuments.length }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showBulkDeleteDialog = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="error" @click="bulkDeleteDocuments">{{ $t('delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toast Notifications -->
    <v-snackbar
      v-model="showSuccessMessage"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar
      v-model="showErrorMessage"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useDocumentsStore } from '@/stores/documents'
import type { Document, DocumentType, DocumentStatus } from '@/types/document'
import DocumentGenerationDialog from '@/components/DocumentGenerationDialog.vue'
import DocumentViewDialog from '@/components/DocumentViewDialog.vue'

// Store and i18n
const documentsStore = useDocumentsStore()
const { t } = useI18n()

// Reactive data
const searchQuery = ref('')
const typeFilter = ref<DocumentType | null>(null)
const statusFilter = ref<DocumentStatus | null>(null)
const dateFrom = ref('')
const dateTo = ref('')
const showAdvancedFilters = ref(false)
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const showBulkDeleteDialog = ref(false)
const selectedDocumentType = ref<DocumentType | null>(null)
const selectedDocument = ref<Document | null>(null)
const documentToDelete = ref<Document | null>(null)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Computed properties
const {
  loading,
  error,
  paginatedDocuments,
  pagination,
  selectedDocuments,
  documentStats
} = storeToRefs(documentsStore)

const actionCards = computed(() => [
  {
    type: 'TOS' as DocumentType,
    title: t('terms_of_service'),
    description: t('generate_tos'),
    icon: 'mdi-file-document-outline',
    color: 'primary'
  },
  {
    type: 'PRIVACY_POLICY' as DocumentType,
    title: t('privacy_policy'),
    description: t('generate_privacy'),
    icon: 'mdi-shield-account-outline',
    color: 'success'
  },
  {
    type: 'CGU' as DocumentType,
    title: t('terms_conditions'),
    description: t('generate_cgu'),
    icon: 'mdi-gavel',
    color: 'warning'
  }
])

const documentTypes = computed(() => [
  { label: t('terms_of_service'), value: 'TOS' },
  { label: t('privacy_policy'), value: 'PRIVACY_POLICY' },
  { label: t('terms_conditions'), value: 'CGU' }
])

const documentStatuses = computed(() => [
  { label: t('draft'), value: 'DRAFT' },
  { label: t('generated'), value: 'GENERATED' },
  { label: t('published'), value: 'PUBLISHED' },
  { label: t('archived'), value: 'ARCHIVED' }
])

const tableHeaders = computed(() => [
  { title: t('document_name'), key: 'name', sortable: true },
  { title: t('type'), key: 'type', sortable: true },
  { title: t('created'), key: 'createdAt', sortable: true },
  { title: t('modified'), key: 'updatedAt', sortable: true },
  { title: t('status'), key: 'status', sortable: true },
  { title: t('actions'), key: 'actions', sortable: false, width: '200px' }
])

// Methods
const openGenerationDialog = (type: DocumentType) => {
  selectedDocumentType.value = type
  showCreateDialog.value = true
}

const handleSearch = () => {
  documentsStore.setFilters({ search: searchQuery.value })
}

const handleTypeFilter = () => {
  documentsStore.setFilters({ type: typeFilter.value || undefined })
}

const handleStatusFilter = () => {
  documentsStore.setFilters({ status: statusFilter.value || undefined })
}

const handleDateFilter = () => {
  documentsStore.setFilters({
    dateFrom: dateFrom.value ? new Date(dateFrom.value) : undefined,
    dateTo: dateTo.value ? new Date(dateTo.value) : undefined
  })
}

const handleSelectionChange = (selection: string[]) => {
  selectedDocuments.value = selection
}

const handleSort = (sortBy: any[]) => {
  if (sortBy.length > 0) {
    documentsStore.setSort({
      key: sortBy[0].key,
      order: sortBy[0].order
    })
  }
}

const handlePageChange = (page: number) => {
  documentsStore.setPagination({ page })
}

const handleItemsPerPageChange = (itemsPerPage: number) => {
  documentsStore.setPagination({ itemsPerPage, page: 1 })
}

const viewDocument = (document: Document) => {
  selectedDocument.value = document
  showViewDialog.value = true
}

const editDocument = (document: Document) => {
  selectedDocument.value = document
  showViewDialog.value = true
}

const downloadDocument = async (doc: Document) => {
  try {
    // Simulate download
    const blob = new Blob([doc.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${doc.name}.txt`
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showSuccessMessage.value = true
    successMessage.value = t('document_downloaded')
  } catch (error) {
    showErrorMessage.value = true
    errorMessage.value = t('failed_to_download')
  }
}

const regenerateDocument = async (document: Document) => {
  try {
    await documentsStore.updateDocument(document.id, {
      status: 'GENERATED',
      content: `Regenerated ${document.type} content for ${document.metadata?.companyName}...`
    })
    
    showSuccessMessage.value = true
    successMessage.value = 'Document regenerated successfully'
  } catch (error) {
    showErrorMessage.value = true
    errorMessage.value = 'Failed to regenerate document'
  }
}

const confirmDelete = (document: Document) => {
  documentToDelete.value = document
  showDeleteDialog.value = true
}

const deleteDocument = async () => {
  if (!documentToDelete.value) return
  
  try {
    await documentsStore.deleteDocument(documentToDelete.value.id)
    showDeleteDialog.value = false
    documentToDelete.value = null
    
    showSuccessMessage.value = true
    successMessage.value = 'Document deleted successfully'
  } catch (error) {
    showErrorMessage.value = true
    errorMessage.value = 'Failed to delete document'
  }
}

const confirmBulkDelete = () => {
  showBulkDeleteDialog.value = true
}

const bulkDeleteDocuments = async () => {
  try {
    await documentsStore.bulkDeleteDocuments(selectedDocuments.value)
    showBulkDeleteDialog.value = false
    
    showSuccessMessage.value = true
    successMessage.value = `${selectedDocuments.value.length} documents deleted successfully`
  } catch (error) {
    showErrorMessage.value = true
    errorMessage.value = 'Failed to delete documents'
  }
}

const exportTable = () => {
  // Implement CSV export functionality
  const csvContent = generateCSV(paginatedDocuments.value)
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'documents.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const generateCSV = (documents: Document[]) => {
  const headers = [t('document_name'), t('type'), t('status'), t('created'), t('modified')]
  const rows = documents.map(doc => [
    doc.name,
    getDocumentTypeLabel(doc.type),
    getStatusLabel(doc.status),
    formatDate(doc.createdAt),
    formatDate(doc.updatedAt)
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const handleDocumentCreated = (document: Document) => {
  showCreateDialog.value = false
  showSuccessMessage.value = true
  successMessage.value = 'Document created successfully'
}

const handleDocumentUpdated = (document: Document) => {
  showViewDialog.value = false
  showSuccessMessage.value = true
  successMessage.value = 'Document updated successfully'
}

// Utility functions
const getDocumentIcon = (type: DocumentType) => {
  const icons = {
    TOS: 'mdi-file-document-outline',
    PRIVACY_POLICY: 'mdi-shield-account-outline',
    CGU: 'mdi-gavel'
  }
  return icons[type]
}

const getDocumentColor = (type: DocumentType) => {
  const colors = {
    TOS: 'primary',
    PRIVACY_POLICY: 'success',
    CGU: 'warning'
  }
  return colors[type]
}

const getDocumentTypeLabel = (type: DocumentType) => {
  const labels = {
    TOS: t('terms_of_service'),
    PRIVACY_POLICY: t('privacy_policy'),
    CGU: t('terms_conditions')
  }
  return labels[type]
}

const getStatusColor = (status: DocumentStatus) => {
  const colors = {
    DRAFT: 'grey',
    GENERATED: 'blue',
    PUBLISHED: 'green',
    ARCHIVED: 'orange'
  }
  return colors[status]
}

const getStatusLabel = (status: DocumentStatus) => {
  const labels = {
    DRAFT: t('draft'),
    GENERATED: t('generated'),
    PUBLISHED: t('published'),
    ARCHIVED: t('archived')
  }
  return labels[status]
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Lifecycle
onMounted(() => {
  documentsStore.fetchDocuments()
})

// Watch for store errors
watch(error, (newError) => {
  if (newError) {
    showErrorMessage.value = true
    errorMessage.value = newError
  }
})
</script>

<style scoped>
.documents-dashboard {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.action-card:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.documents-table {
  background-color: white;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .action-cards .v-col {
    margin-bottom: 1rem;
  }
  
  .filters-section .v-col {
    margin-bottom: 1rem;
  }
}

@media (max-width: 600px) {
  .documents-dashboard .v-container {
    padding: 1rem;
  }
  
  .action-card {
    margin-bottom: 1rem;
  }
}
</style> 