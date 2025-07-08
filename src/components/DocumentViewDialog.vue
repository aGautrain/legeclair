<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="1200px"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="document-view-dialog">
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <div>
          <h2 class="text-h5 font-weight-bold">
            {{ document?.name || 'Document' }}
          </h2>
          <div class="d-flex align-center gap-2 mt-1">
            <v-chip
              :color="getDocumentColor(document?.type)"
              size="small"
              variant="tonal"
            >
              {{ getDocumentTypeLabel(document?.type) }}
            </v-chip>
            <v-chip
              :color="getStatusColor(document?.status)"
              size="small"
              variant="tonal"
            >
              {{ getStatusLabel(document?.status) }}
            </v-chip>
            <span class="text-caption text-medium-emphasis">
              Version {{ document?.version }}
            </span>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text class="pa-6">
        <v-tabs v-model="activeTab" color="primary" grow>
          <v-tab value="preview">
            <v-icon start>mdi-eye</v-icon>
            {{ $t('document_preview') }}
          </v-tab>
          <v-tab value="edit">
            <v-icon start>mdi-pencil</v-icon>
            {{ $t('edit_document') }}
          </v-tab>
          <v-tab value="metadata">
            <v-icon start>mdi-information</v-icon>
            {{ $t('document_details') }}
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="document-content">
          <!-- Preview Tab -->
          <v-window-item value="preview">
            <div class="pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">{{ $t('document_preview') }}</h3>
                <div class="d-flex gap-2">
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-download"
                    @click="downloadDocument"
                  >
                    {{ $t('download') }}
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-printer"
                    @click="printDocument"
                  >
                    {{ $t('print') }}
                  </v-btn>
                </div>
              </div>
              
              <v-card variant="outlined" class="document-preview">
                <v-card-text class="document-content-text">
                  <div v-if="document" v-html="formatDocumentContent(document.content)"></div>
                  <div v-else class="text-center pa-8">
                    <v-icon size="48" color="grey-lighten-1" class="mb-4">
                      mdi-file-document-outline
                    </v-icon>
                    <p class="text-grey-darken-1">{{ $t('no_document_content') }}</p>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-window-item>

          <!-- Edit Tab -->
          <v-window-item value="edit">
            <div class="pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">{{ $t('edit_document') }}</h3>
                <div class="d-flex gap-2">
                  <v-btn
                    variant="outlined"
                    size="small"
                    @click="resetContent"
                    :disabled="!hasChanges"
                  >
                    {{ $t('reset') }}
                  </v-btn>
                  <v-btn
                    color="primary"
                    size="small"
                    @click="saveChanges"
                    :loading="isSaving"
                    :disabled="!hasChanges"
                  >
                    {{ $t('save_changes') }}
                  </v-btn>
                </div>
              </div>

              <v-form ref="editForm" v-model="isEditFormValid">
                <v-text-field
                  v-model="editData.name"
                  :label="$t('document_name')"
                  variant="outlined"
                  :rules="[v => !!v || $t('required_field')]"
                  required
                  class="mb-4"
                />

                <v-select
                  v-model="editData.status"
                  :items="statusOptions"
                  :label="$t('status')"
                  variant="outlined"
                  :rules="[v => !!v || $t('required_field')]"
                  required
                  class="mb-4"
                />

                <v-textarea
                  v-model="editData.content"
                  :label="$t('document_content')"
                  variant="outlined"
                  :rules="[v => !!v || $t('required_field')]"
                  required
                  rows="20"
                  auto-grow
                  class="mb-4"
                />
              </v-form>
            </div>
          </v-window-item>

          <!-- Metadata Tab -->
          <v-window-item value="metadata">
            <div class="pa-6">
              <h3 class="text-h6 mb-4">{{ $t('document_details') }}</h3>
              
              <v-row v-if="document">
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="text-subtitle-1">{{ $t('basic_information') }}</v-card-title>
                    <v-card-text>
                      <div class="d-flex justify-space-between mb-2">
                        <span class="font-weight-medium">{{ $t('document_id') }}:</span>
                        <span class="text-medium-emphasis">{{ document.id }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-2">
                        <span class="font-weight-medium">{{ $t('created') }}:</span>
                        <span class="text-medium-emphasis">{{ formatDate(document.createdAt) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-2">
                        <span class="font-weight-medium">{{ $t('modified') }}:</span>
                        <span class="text-medium-emphasis">{{ formatDate(document.updatedAt) }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span class="font-weight-medium">{{ $t('version') }}:</span>
                        <span class="text-medium-emphasis">{{ document.version }}</span>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="text-subtitle-1">{{ $t('company_information') }}</v-card-title>
                    <v-card-text>
                      <div class="d-flex justify-space-between mb-2">
                        <span class="font-weight-medium">{{ $t('company_name') }}:</span>
                        <span class="text-medium-emphasis">{{ document.metadata?.companyName || 'N/A' }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-2">
                        <span class="font-weight-medium">{{ $t('website_domain') }}:</span>
                        <span class="text-medium-emphasis">{{ document.metadata?.domain || 'N/A' }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-2">
                        <span class="font-weight-medium">{{ $t('legal_jurisdiction') }}:</span>
                        <span class="text-medium-emphasis">{{ document.metadata?.jurisdiction || 'N/A' }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span class="font-weight-medium">{{ $t('company_address') }}:</span>
                        <span class="text-medium-emphasis">{{ document.metadata?.customFields?.companyAddress || 'N/A' }}</span>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" v-if="document.metadata?.customFields">
                  <v-card variant="outlined">
                    <v-card-title class="text-subtitle-1">{{ $t('additional_information') }}</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col 
                          v-for="(value, key) in document.metadata.customFields" 
                          :key="key"
                          cols="12" 
                          md="6"
                          v-show="key !== 'companyAddress'"
                        >
                          <div class="d-flex justify-space-between mb-2">
                            <span class="font-weight-medium">{{ formatFieldName(key) }}:</span>
                            <span class="text-medium-emphasis">
                              {{ formatFieldValue(value) }}
                            </span>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <div v-else class="text-center pa-8">
                <v-icon size="48" color="grey-lighten-1" class="mb-4">
                  mdi-information-outline
                </v-icon>
                <p class="text-grey-darken-1">{{ $t('no_document_details') }}</p>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="isSaving"
        >
          {{ $t('close') }}
        </v-btn>
        <v-btn
          v-if="activeTab === 'edit' && hasChanges"
          color="primary"
          :loading="isSaving"
          @click="saveChanges"
        >
          {{ $t('save_changes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDocumentsStore } from '@/stores/documents'
import type { Document, DocumentType, DocumentStatus } from '@/types/document'

// Props
interface Props {
  modelValue: boolean
  document?: Document | null
}

const props = withDefaults(defineProps<Props>(), {
  document: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'document-updated': [document: Document]
}>()

// Store and i18n
const documentsStore = useDocumentsStore()
const { t } = useI18n()

// Reactive data
const activeTab = ref('preview')
const editForm = ref()
const isEditFormValid = ref(false)
const isSaving = ref(false)

const editData = ref({
  name: '',
  content: '',
  status: '' as DocumentStatus
})

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasChanges = computed(() => {
  if (!props.document) return false
  return (
    editData.value.name !== props.document.name ||
    editData.value.content !== props.document.content ||
    editData.value.status !== props.document.status
  )
})

const statusOptions = [
  { title: t('draft'), value: 'DRAFT' },
  { title: t('generated'), value: 'GENERATED' },
  { title: t('published'), value: 'PUBLISHED' },
  { title: t('archived'), value: 'ARCHIVED' }
]

// Methods
const closeDialog = () => {
  dialogVisible.value = false
  resetEditData()
}

const resetEditData = () => {
  if (props.document) {
    editData.value = {
      name: props.document.name,
      content: props.document.content,
      status: props.document.status
    }
  }
}

const resetContent = () => {
  resetEditData()
}

const saveChanges = async () => {
  if (!props.document || !isEditFormValid.value) return

  isSaving.value = true

  try {
    const updatedDocument = await documentsStore.updateDocument(props.document.id, {
      name: editData.value.name,
      content: editData.value.content,
      status: editData.value.status
    })

    emit('document-updated', updatedDocument)
  } catch (error) {
    console.error('Error updating document:', error)
  } finally {
    isSaving.value = false
  }
}

const downloadDocument = () => {
  if (!props.document) return

  const blob = new Blob([props.document.content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = window.document.createElement('a')
  a.href = url
  a.download = `${props.document.name}.txt`
  window.document.body.appendChild(a)
  a.click()
  window.document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const printDocument = () => {
  if (!props.document) return

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${props.document.name}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            h1 { color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 10px; }
            .metadata { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .metadata h3 { margin-top: 0; color: #666; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <h1>${props.document.name}</h1>
          <div class="metadata">
            <h3>Document Information</h3>
            <p><strong>${t('type')}:</strong> ${getDocumentTypeLabel(props.document.type)}</p>
            <p><strong>${t('status')}:</strong> ${getStatusLabel(props.document.status)}</p>
            <p><strong>${t('version')}:</strong> ${props.document.version}</p>
            <p><strong>${t('created')}:</strong> ${formatDate(props.document.createdAt)}</p>
            <p><strong>${t('modified')}:</strong> ${formatDate(props.document.updatedAt)}</p>
          </div>
          <div class="content">
            ${formatDocumentContent(props.document.content)}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

// Utility functions
const getDocumentColor = (type?: DocumentType) => {
  const colors = {
    TOS: 'primary',
    PRIVACY_POLICY: 'success',
    CGU: 'warning'
  }
  return type ? colors[type] : 'grey'
}

const getDocumentTypeLabel = (type?: DocumentType) => {
  const labels = {
    TOS: t('terms_of_service'),
    PRIVACY_POLICY: t('privacy_policy'),
    CGU: t('terms_conditions')
  }
  return type ? labels[type] : 'Unknown'
}

const getStatusColor = (status?: DocumentStatus) => {
  const colors = {
    DRAFT: 'grey',
    GENERATED: 'blue',
    PUBLISHED: 'green',
    ARCHIVED: 'orange'
  }
  return status ? colors[status] : 'grey'
}

const getStatusLabel = (status?: DocumentStatus) => {
  const labels = {
    DRAFT: t('draft'),
    GENERATED: t('generated'),
    PUBLISHED: t('published'),
    ARCHIVED: t('archived')
  }
  return status ? labels[status] : 'Unknown'
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

const formatDocumentContent = (content: string) => {
  // Convert plain text to formatted HTML
  return content
    .split('\n')
    .map(line => {
      if (line.trim() === '') return '<br>'
      if (line.startsWith('#')) return `<h2>${line.substring(1).trim()}</h2>`
      if (line.startsWith('##')) return `<h3>${line.substring(2).trim()}</h3>`
      if (line.startsWith('###')) return `<h4>${line.substring(3).trim()}</h4>`
      if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`
      if (line.startsWith('1. ')) return `<li>${line.substring(3)}</li>`
      return `<p>${line}</p>`
    })
    .join('')
}

const formatFieldName = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([A-Z])/g, ' $1')
    .trim()
}

const formatFieldValue = (value: any) => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return value || 'N/A'
}

// Watch for document changes
watch(() => props.document, () => {
  if (props.document) {
    resetEditData()
  }
}, { immediate: true })
</script>

<style scoped>
.document-view-dialog {
  max-height: 90vh;
  overflow: hidden;
}

.document-content {
  max-height: 60vh;
  overflow-y: auto;
}

.document-preview {
  background-color: #fafafa;
}

.document-content-text {
  font-family: 'Georgia', serif;
  line-height: 1.8;
  color: #333;
}

.document-content-text h2 {
  color: #1976D2;
  border-bottom: 2px solid #1976D2;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.document-content-text h3 {
  color: #424242;
  margin-top: 24px;
  margin-bottom: 12px;
}

.document-content-text h4 {
  color: #616161;
  margin-top: 20px;
  margin-bottom: 10px;
}

.document-content-text p {
  margin-bottom: 12px;
}

.document-content-text li {
  margin-bottom: 8px;
}

/* Print styles */
@media print {
  .document-view-dialog {
    max-height: none;
  }
  
  .document-content {
    max-height: none;
  }
}
</style> 