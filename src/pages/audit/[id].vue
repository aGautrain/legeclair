<template>
  <div class="audit-view-page">
    <!-- Page Header -->
    <v-container class="py-6">
      <div class="d-flex align-center mb-6">
        <!-- Back Arrow: Always top-left, separated from title -->
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          class="mr-4"
          style="align-self: flex-start;"
          @click="$router.push('/audits')"
          :title="$t('back_to_audits')"
        />
        <div class="flex-grow-1">
          <h1 class="text-h3 font-weight-bold text-primary mb-2">
            {{ audit?.name || $t('loading_audit') }}
          </h1>
          <div class="d-flex align-center gap-4">
            <v-chip
              v-if="audit"
              :color="getSourceTypeColor(audit.sourceType)"
              size="small"
              variant="tonal"
            >
              {{ getSourceTypeLabel(audit.sourceType) }}
            </v-chip>
            <v-chip
              v-if="audit"
              :color="getStatusColor(audit.status)"
              size="small"
              variant="tonal"
            >
              {{ getStatusLabel(audit.status) }}
            </v-chip>
            <span v-if="audit" class="text-body-2 text-medium-emphasis">
              {{ $t('version') }} {{ audit.version }}
            </span>
          </div>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            v-if="audit"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="exportComparison"
          >
            {{ $t('export') }}
          </v-btn>
          <v-btn
            v-if="audit"
            color="primary"
            prepend-icon="mdi-pencil"
            @click="activeTab = 'edit'"
          >
            {{ $t('edit_audit') }}
          </v-btn>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate size="64" color="primary" />
        <p class="text-body-1 mt-4">{{ $t('loading_audit') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center pa-8">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <h3 class="text-h6 text-error mb-2">{{ $t('error_loading_audit') }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ error }}</p>
        <v-btn color="primary" @click="fetchAuditData">{{ $t('retry') }}</v-btn>
      </div>

      <!-- Audit Content -->
      <div v-else-if="audit" class="audit-content">
        <!-- Audit Metadata -->
        <section class="metadata-section mb-6">
          <v-card elevation="2">
            <v-card-title class="pa-6">
              <h2 class="text-h5 font-weight-semibold">{{ $t('audit_metadata') }}</h2>
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" md="3">
                  <div class="metadata-item">
                    <span class="text-caption text-medium-emphasis">{{ $t('source_name') }}</span>
                    <p class="text-body-2 font-weight-medium">{{ audit.metadata?.sourceName }}</p>
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="metadata-item">
                    <span class="text-caption text-medium-emphasis">{{ $t('company') }}</span>
                    <p class="text-body-2 font-weight-medium">{{ audit.metadata?.companyName }}</p>
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="metadata-item">
                    <span class="text-caption text-medium-emphasis">{{ $t('domain') }}</span>
                    <p class="text-body-2 font-weight-medium">{{ audit.metadata?.domain }}</p>
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="metadata-item">
                    <span class="text-caption text-medium-emphasis">{{ $t('jurisdiction') }}</span>
                    <p class="text-body-2 font-weight-medium">{{ audit.metadata?.jurisdiction }}</p>
                  </div>
                </v-col>
              </v-row>
              <v-row v-if="audit.metadata?.sourceUrl">
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
            </v-card-text>
          </v-card>
        </section>

        <!-- Tabs -->
        <section class="tabs-section">
          <v-card elevation="2">
            <v-tabs v-model="activeTab" class="px-6">
              <v-tab value="comparison">{{ $t('comparison') }}</v-tab>
              <v-tab value="corrections">
                {{ $t('corrections') }} ({{ audit.corrections.length }})
              </v-tab>
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
                          {{ audit.sourceContent }}
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
                          {{ audit.correctedContent }}
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
                    :color="getCorrectionsColor(audit.corrections.length)"
                    size="small"
                    variant="tonal"
                  >
                    {{ audit.corrections.length }} {{ $t('corrections') }}
                  </v-chip>
                </div>

                <div v-if="audit.corrections.length === 0" class="text-center pa-8">
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
                    v-for="correction in audit.corrections"
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
                <div class="d-flex align-center justify-space-between mb-4">
                  <h3 class="text-h6 font-weight-semibold">{{ $t('edit_audit') }}</h3>
                  <v-btn
                    v-if="hasChanges"
                    color="primary"
                    :loading="isSaving"
                    @click="saveChanges"
                    prepend-icon="mdi-content-save"
                  >
                    {{ $t('save_changes') }}
                  </v-btn>
                </div>

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
          </v-card>
        </section>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuditsStore } from '@/stores/audits'
import type { Audit, AuditStatus, Correction } from '@/types/audit'
import type { DocumentType } from '@/types/document'

// Route and router
const route = useRoute()
const router = useRouter()

// Store and i18n
const auditsStore = useAuditsStore()
const { t } = useI18n()

// Reactive data
const audit = ref<Audit | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
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
const hasChanges = computed(() => {
  if (!audit.value) return false
  return (
    editData.value.name !== audit.value.name ||
    editData.value.status !== audit.value.status ||
    editData.value.correctedContent !== audit.value.correctedContent
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
  if (!audit.value || !showHighlighting.value) return audit.value?.sourceContent
  
  let content = audit.value.sourceContent
  audit.value.corrections.forEach(correction => {
    const regex = new RegExp(`(${escapeRegExp(correction.originalText)})`, 'gi')
    content = content.replace(regex, `<span class="correction-highlight original" data-correction-id="${correction.id}">$1</span>`)
  })
  return content
})

const highlightedCorrectedContent = computed(() => {
  if (!audit.value || !showHighlighting.value) return audit.value?.correctedContent
  
  let content = audit.value.correctedContent
  audit.value.corrections.forEach(correction => {
    const regex = new RegExp(`(${escapeRegExp(correction.correctedText)})`, 'gi')
    content = content.replace(regex, `<span class="correction-highlight corrected" data-correction-id="${correction.id}">$1</span>`)
  })
  return content
})

// Methods
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const fetchAuditData = async () => {
  const auditId = (route.params as { id: string }).id
  if (!auditId) {
    error.value = t('invalid_audit_id')
    return
  }

  loading.value = true
  error.value = null

  try {
    const fetchedAudit = await auditsStore.fetchAudit(auditId)
    if (fetchedAudit) {
      audit.value = fetchedAudit
      resetEditForm()
    } else {
      error.value = t('audit_not_found')
    }
  } catch (err) {
    error.value = t('failed_to_load_audit')
    console.error('Error fetching audit:', err)
  } finally {
    loading.value = false
  }
}

const resetEditForm = () => {
  if (audit.value) {
    editData.value = {
      name: audit.value.name,
      status: audit.value.status,
      correctedContent: audit.value.correctedContent
    }
  }
  editForm.value?.resetValidation()
}

const toggleHighlighting = () => {
  showHighlighting.value = !showHighlighting.value
}

const saveChanges = async () => {
  if (!isEditFormValid.value || !audit.value) return

  isSaving.value = true

  try {
    const updatedAudit = await auditsStore.updateAudit(audit.value.id, {
      name: editData.value.name,
      status: editData.value.status,
      correctedContent: editData.value.correctedContent
    })
    audit.value = updatedAudit
    activeTab.value = 'comparison'
  } catch (error) {
    console.error('Error updating audit:', error)
  } finally {
    isSaving.value = false
  }
}

const exportComparison = () => {
  if (!audit.value) return

  const content = `${t('audit_comparison_report')}: ${audit.value.name}

${t('original_content_export')}\n${audit.value.sourceContent}

${t('corrected_content_export')}\n${audit.value.correctedContent}

${t('corrections_export')}\n${audit.value.corrections.map(c => `- ${c.originalText} → ${c.correctedText} (${c.severity}/${c.category}): ${c.explanation}`).join('\n')}
`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${audit.value.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_comparison.txt`
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

// Lifecycle
onMounted(() => {
  fetchAuditData()
  // Set initial tab from URL query parameter
  const tabParam = route.query.tab as string
  if (tabParam && ['comparison', 'corrections', 'edit'].includes(tabParam)) {
    activeTab.value = tabParam
  }
})

// Watch for route changes
watch(() => (route.params as { id: string }).id, () => {
  fetchAuditData()
})
</script>

<style scoped>
.audit-view-page {
  min-height: 100vh;
}

.metadata-section {
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tab-content {
  max-height: 70vh;
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
</style> 