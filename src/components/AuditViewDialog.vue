<template>
  <v-dialog v-model="dialogVisible" max-width="1400" persistent>
    <v-card class="audit-view-dialog">
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <div>
          <h2 class="text-h5 font-weight-bold">{{ audit?.name }}</h2>
          <div class="d-flex align-center gap-4 mt-2">
            <v-chip
              :color="getSourceTypeColor(audit?.sourceType)"
              size="small"
              variant="tonal"
            >
              {{ getSourceTypeLabel(audit?.sourceType) }}
            </v-chip>
            <v-chip
              :color="getStatusColor(audit?.status)"
              size="small"
              variant="tonal"
            >
              {{ getStatusLabel(audit?.status) }}
            </v-chip>
            <span class="text-body-2 text-medium-emphasis">
              {{ $t('version') }} {{ audit?.version }}
            </span>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- Audit Metadata -->
        <div class="audit-metadata pa-6 pb-0">
          <v-row>
            <v-col cols="12" md="3">
              <div class="metadata-item">
                <span class="text-caption text-medium-emphasis">{{ $t('source_name') }}</span>
                <p class="text-body-2 font-weight-medium">{{ audit?.metadata?.sourceName }}</p>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="metadata-item">
                <span class="text-caption text-medium-emphasis">{{ $t('company') }}</span>
                <p class="text-body-2 font-weight-medium">{{ audit?.metadata?.companyName }}</p>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="metadata-item">
                <span class="text-caption text-medium-emphasis">{{ $t('domain') }}</span>
                <p class="text-body-2 font-weight-medium">{{ audit?.metadata?.domain }}</p>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="metadata-item">
                <span class="text-caption text-medium-emphasis">{{ $t('jurisdiction') }}</span>
                <p class="text-body-2 font-weight-medium">{{ audit?.metadata?.jurisdiction }}</p>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="audit?.metadata?.sourceUrl">
            <v-col cols="12">
              <div class="metadata-item">
                <span class="text-caption text-medium-emphasis">{{ $t('source_url') }}</span>
                <a 
                  :href="audit.metadata.sourceUrl" 
                  target="_blank" 
                  class="text-body-2 font-weight-medium text-primary text-decoration-none"
                >
                  {{ audit.metadata.sourceUrl }}
                </a>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- Tabs -->
        <v-tabs v-model="activeTab" class="px-6">
          <v-tab value="comparison">{{ $t('comparison') }}</v-tab>
          <v-tab value="corrections">{{ $t('corrections') }} ({{ audit?.corrections.length }})</v-tab>
          <v-tab value="edit">{{ $t('edit') }}</v-tab>
        </v-tabs>

        <v-divider />

        <!-- Tab Content -->
        <div class="tab-content pa-6">
          <!-- Comparison Tab -->
          <div v-if="activeTab === 'comparison'" class="comparison-view">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 font-weight-semibold">{{ $t('content_comparison') }}</h3>
              <div class="d-flex gap-2">
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="toggleHighlighting"
                  :prepend-icon="showHighlighting ? 'mdi-eye-off' : 'mdi-eye'"
                >
                  {{ showHighlighting ? $t('hide_highlights') : $t('show_highlights') }}
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="exportComparison"
                  prepend-icon="mdi-download"
                >
                  {{ $t('export') }}
                </v-btn>
              </div>
            </div>

            <v-row class="comparison-container">
              <!-- Original Content -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="content-card">
                  <v-card-title class="d-flex align-center pa-4">
                    <v-icon color="error" class="mr-2">mdi-file-document-outline</v-icon>
                    {{ $t('original_content') }}
                  </v-card-title>
                  <v-card-text class="content-text pa-4">
                    <div 
                      v-if="showHighlighting"
                      v-html="highlightedOriginalContent"
                      class="highlighted-content"
                    />
                    <div v-else class="plain-content">
                      {{ audit?.sourceContent }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Corrected Content -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="content-card">
                  <v-card-title class="d-flex align-center pa-4">
                    <v-icon color="success" class="mr-2">mdi-check-circle-outline</v-icon>
                    {{ $t('corrected_content') }}
                  </v-card-title>
                  <v-card-text class="content-text pa-4">
                    <div 
                      v-if="showHighlighting"
                      v-html="highlightedCorrectedContent"
                      class="highlighted-content"
                    />
                    <div v-else class="plain-content">
                      {{ audit?.correctedContent }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Corrections Tab -->
          <div v-if="activeTab === 'corrections'" class="corrections-view">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 font-weight-semibold">{{ $t('corrections_list') }}</h3>
              <v-chip
                :color="getCorrectionsColor(audit?.corrections.length || 0)"
                size="small"
                variant="tonal"
              >
                {{ audit?.corrections.length }} {{ $t('corrections') }}
              </v-chip>
            </div>

            <div v-if="audit?.corrections.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-check-circle-outline
              </v-icon>
              <h4 class="text-h6 text-grey-darken-1 mb-2">{{ $t('no_corrections') }}</h4>
              <p class="text-body-2 text-grey-darken-1">
                {{ $t('no_corrections_description') }}
              </p>
            </div>

            <div v-else class="corrections-list">
              <v-card
                v-for="correction in audit?.corrections"
                :key="correction.id"
                variant="outlined"
                class="correction-item mb-3"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-start justify-space-between mb-3">
                    <div class="d-flex align-center gap-2">
                      <v-chip
                        :color="getSeverityColor(correction.severity)"
                        size="small"
                        variant="tonal"
                      >
                        {{ getSeverityLabel(correction.severity) }}
                      </v-chip>
                      <v-chip
                        :color="getCategoryColor(correction.category)"
                        size="small"
                        variant="tonal"
                      >
                        {{ getCategoryLabel(correction.category) }}
                      </v-chip>
                    </div>
                    <span class="text-caption text-medium-emphasis">
                      {{ formatDate(correction.createdAt) }}
                    </span>
                  </div>

                  <div class="correction-content">
                    <div class="correction-text mb-2">
                      <span class="text-error font-weight-medium">{{ $t('original') }}:</span>
                      <span class="text-decoration-line-through ml-1">{{ correction.originalText }}</span>
                    </div>
                    <div class="correction-text mb-3">
                      <span class="text-success font-weight-medium">{{ $t('corrected') }}:</span>
                      <span class="ml-1">{{ correction.correctedText }}</span>
                    </div>
                    <div class="correction-explanation">
                      <span class="text-primary font-weight-medium">{{ $t('explanation') }}:</span>
                      <p class="text-body-2 mt-1">{{ correction.explanation }}</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Edit Tab -->
          <div v-if="activeTab === 'edit'" class="edit-view">
            <v-form ref="editForm" v-model="isEditFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editData.name"
                    :label="$t('audit_name')"
                    variant="outlined"
                    :rules="[v => !!v || $t('name_required')]"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editData.status"
                    :label="$t('status')"
                    :items="auditStatuses"
                    variant="outlined"
                    :rules="[v => !!v || $t('status_required')]"
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editData.correctedContent"
                    :label="$t('corrected_content')"
                    variant="outlined"
                    :rules="[v => !!v || $t('content_required')]"
                    rows="10"
                    required
                  />
                </v-col>
              </v-row>
            </v-form>
          </div>
        </div>
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
import { useAuditsStore } from '@/stores/audits'
import type { Audit, AuditStatus, Correction } from '@/types/audit'
import type { DocumentType } from '@/types/document'

// Props
interface Props {
  modelValue: boolean
  audit?: Audit | null
}

const props = withDefaults(defineProps<Props>(), {
  audit: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'audit-updated': [audit: Audit]
}>()

// Store and i18n
const auditsStore = useAuditsStore()
const { t } = useI18n()

// Reactive data
const activeTab = ref('comparison')
const editForm = ref()
const isEditFormValid = ref(false)
const isSaving = ref(false)
const showHighlighting = ref(true)

const editData = ref({
  name: '',
  status: '' as AuditStatus,
  correctedContent: ''
})

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasChanges = computed(() => {
  if (!props.audit) return false
  return (
    editData.value.name !== props.audit.name ||
    editData.value.status !== props.audit.status ||
    editData.value.correctedContent !== props.audit.correctedContent
  )
})

const auditStatuses = computed(() => [
  { title: t('pending'), value: 'PENDING' },
  { title: t('in_progress'), value: 'IN_PROGRESS' },
  { title: t('completed'), value: 'COMPLETED' },
  { title: t('reviewed'), value: 'REVIEWED' },
  { title: t('archived'), value: 'ARCHIVED' }
])

const highlightedOriginalContent = computed(() => {
  if (!props.audit || !showHighlighting.value) return props.audit?.sourceContent
  
  let content = props.audit.sourceContent
  props.audit.corrections.forEach(correction => {
    const regex = new RegExp(`(${escapeRegExp(correction.originalText)})`, 'gi')
    content = content.replace(regex, `<span class="correction-highlight original" data-correction-id="${correction.id}">$1</span>`)
  })
  return content
})

const highlightedCorrectedContent = computed(() => {
  if (!props.audit || !showHighlighting.value) return props.audit?.correctedContent
  
  let content = props.audit.correctedContent
  props.audit.corrections.forEach(correction => {
    const regex = new RegExp(`(${escapeRegExp(correction.correctedText)})`, 'gi')
    content = content.replace(regex, `<span class="correction-highlight corrected" data-correction-id="${correction.id}">$1</span>`)
  })
  return content
})

// Methods
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const closeDialog = () => {
  emit('update:modelValue', false)
  resetEditForm()
}

const resetEditForm = () => {
  if (props.audit) {
    editData.value = {
      name: props.audit.name,
      status: props.audit.status,
      correctedContent: props.audit.correctedContent
    }
  }
  editForm.value?.resetValidation()
}

const toggleHighlighting = () => {
  showHighlighting.value = !showHighlighting.value
}

const saveChanges = async () => {
  if (!isEditFormValid.value || !props.audit) return

  isSaving.value = true

  try {
    const updatedAudit = await auditsStore.updateAudit(props.audit.id, {
      name: editData.value.name,
      status: editData.value.status,
      correctedContent: editData.value.correctedContent
    })
    emit('audit-updated', updatedAudit)
  } catch (error) {
    console.error('Error updating audit:', error)
  } finally {
    isSaving.value = false
  }
}

const exportComparison = () => {
  if (!props.audit) return

  const content = `Audit Comparison Report: ${props.audit.name}

ORIGINAL CONTENT:
${props.audit.sourceContent}

CORRECTED CONTENT:
${props.audit.correctedContent}

CORRECTIONS:
${props.audit.corrections.map(c => `- ${c.originalText} → ${c.correctedText} (${c.severity}/${c.category}): ${c.explanation}`).join('\n')}
`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.audit.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_comparison.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Utility functions
const getSourceTypeColor = (type?: DocumentType | 'WEB' | 'DOCUMENT') => {
  const colors = {
    TOS: 'primary',
    PRIVACY_POLICY: 'success',
    CGU: 'warning',
    WEB: 'info',
    DOCUMENT: 'secondary'
  }
  return colors[type || 'DOCUMENT'] || 'grey'
}

const getSourceTypeLabel = (type?: 'WEB' | 'DOCUMENT') => {
  const labels = {
    WEB: t('source_web'),
    DOCUMENT: t('source_document')
  }
  return labels[type || 'DOCUMENT'] || type
}

const getStatusColor = (status?: AuditStatus) => {
  const colors = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    REVIEWED: 'primary',
    ARCHIVED: 'grey'
  }
  return colors[status || 'PENDING'] || 'grey'
}

const getStatusLabel = (status?: AuditStatus) => {
  const labels = {
    PENDING: t('pending'),
    IN_PROGRESS: t('in_progress'),
    COMPLETED: t('completed'),
    REVIEWED: t('reviewed'),
    ARCHIVED: t('archived')
  }
  return labels[status || 'PENDING'] || status
}

const getCorrectionsColor = (count: number) => {
  if (count === 0) return 'success'
  if (count <= 3) return 'warning'
  if (count <= 7) return 'orange'
  return 'error'
}

const getSeverityColor = (severity: Correction['severity']) => {
  const colors = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'orange',
    CRITICAL: 'error'
  }
  return colors[severity] || 'grey'
}

const getSeverityLabel = (severity: Correction['severity']) => {
  const labels = {
    LOW: t('low'),
    MEDIUM: t('medium'),
    HIGH: t('high'),
    CRITICAL: t('critical')
  }
  return labels[severity] || severity
}

const getCategoryColor = (category: Correction['category']) => {
  const colors = {
    GRAMMAR: 'blue',
    LEGAL: 'purple',
    COMPLIANCE: 'red',
    CLARITY: 'green',
    STRUCTURE: 'orange',
    OTHER: 'grey'
  }
  return colors[category] || 'grey'
}

const getCategoryLabel = (category: Correction['category']) => {
  const labels = {
    GRAMMAR: t('grammar'),
    LEGAL: t('legal'),
    COMPLIANCE: t('compliance'),
    CLARITY: t('clarity'),
    STRUCTURE: t('structure'),
    OTHER: t('other')
  }
  return labels[category] || category
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Watch for audit changes to reset form
watch(() => props.audit, () => {
  if (props.audit) {
    resetEditForm()
  }
})
</script>

<style scoped>
.audit-view-dialog {
  max-height: 90vh;
  overflow: hidden;
}

.audit-metadata {
  background-color: #f8f9fa;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tab-content {
  max-height: 60vh;
  overflow-y: auto;
}

.comparison-container {
  min-height: 400px;
}

.content-card {
  height: 100%;
  min-height: 400px;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.highlighted-content {
  position: relative;
}

.correction-highlight {
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.correction-highlight.original {
  background-color: #ffebee;
  color: #c62828;
  text-decoration: line-through;
}

.correction-highlight.corrected {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.correction-highlight:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.corrections-list {
  max-height: 500px;
  overflow-y: auto;
}

.correction-item {
  transition: transform 0.2s ease;
}

.correction-item:hover {
  transform: translateY(-1px);
}

.correction-content {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.correction-text {
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 960px) {
  .comparison-container {
    flex-direction: column;
  }
  
  .content-card {
    min-height: 300px;
  }
}

@media (max-width: 600px) {
  .audit-view-dialog {
    max-width: 95vw;
  }
  
  .tab-content {
    max-height: 50vh;
  }
}
</style> 