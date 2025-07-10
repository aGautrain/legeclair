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
            color="primary"
            prepend-icon="mdi-refresh"
            @click="showVersionRequestDialog = true"
          >
            {{ $t('request_new_version') }}
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
              <v-tab value="information">{{ $t('information') }}</v-tab>
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
                      <v-card-title class="d-flex align-center pa-4 justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon color="error" class="mr-2">mdi-file-document-outline</v-icon>
                          {{ $t('original_content') }}
                        </div>
                        <v-tooltip :text="$t('copy')" v-model="copiedOriginal">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon="mdi-content-copy"
                              size="small"
                              variant="text"
                              @click="copyContent('original')"
                              aria-label="Copy original content"
                            ></v-btn>
                          </template>
                        </v-tooltip>
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
                      <v-card-title class="d-flex align-center pa-4 justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon color="success" class="mr-2">mdi-check-circle-outline</v-icon>
                          {{ $t('corrected_content') }}
                        </div>
                        <v-tooltip :text="$t('copy')" v-model="copiedCorrected">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon="mdi-content-copy"
                              size="small"
                              variant="text"
                              @click="copyContent('corrected')"
                              aria-label="Copy corrected content"
                            ></v-btn>
                          </template>
                        </v-tooltip>
                      </v-card-title>
                      <v-card-text class="content-text pa-4">
                        <div v-if="showHighlighting" class="highlighted-content">
                          <template v-for="(segment, idx) in correctedSegments" :key="idx">
                            <template v-if="segment.correction">
                              <v-tooltip :text="segment.correction.explanation" location="bottom">
                                <template #activator="{ props }">
                                  <span
                                    v-bind="props"
                                    class="text-success font-weight-bold correction-tooltip"
                                    style="cursor: pointer; background-color: rgba(76, 175, 80, 0.1); padding: 0.125rem 0.25rem; border-radius: 0.25rem;"
                                  >{{ segment.text }}</span>
                                </template>
                              </v-tooltip>
                            </template>
                            <template v-else>
                              <span>{{ segment.text }}</span>
                            </template>
                          </template>
                        </div>
                        <div v-else class="plain-content">
                          {{ audit.correctedContent }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <!-- Corrections Tab -->
              <div v-else-if="activeTab === 'corrections'" class="corrections-view">
                <div class="d-flex align-center justify-space-between mb-4">
                  <h3 class="text-h6 font-weight-semibold">{{ $t('corrections_list') }}</h3>
                  <div class="d-flex gap-2">
                    <v-btn
                      size="small"
                      variant="outlined"
                      @click="exportCorrections"
                      prepend-icon="mdi-download"
                    >
                      {{ $t('export_corrections') }}
                    </v-btn>
                  </div>
                </div>

                <v-list class="corrections-list">
                  <v-list-item
                    v-for="correction in audit.corrections"
                    :key="correction.id"
                    class="correction-item mb-4"
                  >
                    <template #prepend>
                      <v-chip
                        :color="getSeverityColor(correction.severity)"
                        size="small"
                        class="mr-3"
                      >
                        {{ getSeverityLabel(correction.severity) }}
                      </v-chip>
                    </template>
                    <v-list-item-title class="text-body-1 font-weight-medium py-2">
                      {{ correction.explanation }}
                    </v-list-item-title>
                    <v-list-item-content class="text-body-2">
                      <div class="correction-details">
                        <div class="mb-2">
                          <strong>{{ $t('original') }} : </strong>
                          <span>{{ correction.originalText }}</span>
                        </div>
                        <div class="mb-2">
                          <strong>{{ $t('corrected') }} : </strong>
                          <span class="text-success">{{ correction.correctedText }}</span>
                        </div>
                        <div class="d-flex gap-2 align-center">
                          <span>
                            <v-chip size="small" variant="outlined">
                              <v-icon size="16" class="mr-1">mdi-tag</v-icon>
                              {{ getCategoryLabel(correction.category) }}
                            </v-chip>
                          </span>
                          <span v-if="correction.page || correction.lineStart">
                            <v-chip size="small" variant="outlined">
                              <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
                              {{ formatLocationInfo(correction) }}
                            </v-chip>
                          </span>
                        </div>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>

              <!-- Information Tab -->
              <div v-else-if="activeTab === 'information'" class="information-view">
                <h3 class="text-h6 font-weight-semibold mb-4">{{ $t('audit_information') }}</h3>
                
                <!-- Context Section -->
                <v-card variant="outlined" class="mb-6">
                  <v-card-title class="d-flex align-center pa-4">
                    <v-icon color="primary" class="mr-2">mdi-lightbulb-outline</v-icon>
                    {{ $t('audit_context') }}
                  </v-card-title>
                  <v-card-subtitle>
                    {{ $t('context_description') }}
                  </v-card-subtitle>
                  <v-card-text class="pa-4">
                    <v-textarea
                      :model-value="audit.context || ''"
                      readonly
                      variant="outlined"
                      :placeholder="$t('no_context_provided')"
                      rows="6"
                      auto-grow
                      hide-details
                      class="context-textarea"
                    />
                  </v-card-text>
                </v-card>

                <!-- Notes Section -->
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center pa-4">
                    <v-icon color="secondary" class="mr-2">mdi-note-text</v-icon>
                    {{ $t('audit_notes') }}
                  </v-card-title>
                  <v-card-subtitle>
                    {{ $t('audit_notes_description') }}
                  </v-card-subtitle>
                  <v-card-text class="pa-4">
                    <v-textarea
                      v-model="auditNotes"
                      variant="outlined"
                      :placeholder="$t('add_notes_placeholder')"
                      rows="8"
                      auto-grow
                      hide-details
                      class="notes-textarea"
                    />
                    <div class="d-flex justify-end mt-3">
                      <v-btn
                        color="primary"
                        size="small"
                        @click="saveNotes"
                        :loading="savingNotes"
                        :disabled="!notesChanged"
                      >
                        {{ $t('save_notes') }}
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-card>
        </section>
      </div>
    </v-container>

    <!-- Version Request Dialog -->
    <AuditVersionRequestDialog
      v-model="showVersionRequestDialog"
      :current-context="audit?.context"
      :audit-id="audit?.id || ''"
      @request-submitted="handleVersionRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuditsStore } from '@/stores/audits'
import { routeUtils } from '@/router'
import type { Audit, SourceType } from '@/types/audit'
import AuditVersionRequestDialog from '@/components/AuditVersionRequestDialog.vue'

// Route and store
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auditsStore = useAuditsStore()

// Reactive data
const loading = ref(false)
const error = ref<string | null>(null)
const audit = ref<Audit | null>(null)
const activeTab = ref('comparison')
const showHighlighting = ref(true)
const copiedOriginal = ref(false)
const copiedCorrected = ref(false)
const auditNotes = ref('')
const savingNotes = ref(false)
const notesChanged = ref(false)
const showVersionRequestDialog = ref(false)

// Computed properties
const highlightedOriginalContent = computed(() => {
  if (!audit.value) return ''
  return highlightCorrections(audit.value.sourceContent, audit.value.corrections, 'original')
})

const correctedSegments = computed(() => {
  if (!audit.value) return []
  const content = audit.value.correctedContent
  const corrections = audit.value.corrections || []
  if (!corrections.length) return [{ text: content }]

  // Sort corrections by first occurrence in content
  const sorted = [...corrections].sort((a, b) => {
    return content.indexOf(a.correctedText) - content.indexOf(b.correctedText)
  })

  let segments = []
  let lastIdx = 0
  let lowerContent = content.toLowerCase()

  for (const corr of sorted) {
    const search = corr.correctedText
    if (!search) continue
    const idx = lowerContent.indexOf(search.toLowerCase(), lastIdx)
    if (idx === -1) continue
    if (idx > lastIdx) {
      segments.push({ text: content.slice(lastIdx, idx) })
    }
    segments.push({ text: content.slice(idx, idx + search.length), correction: corr })
    lastIdx = idx + search.length
  }
  if (lastIdx < content.length) {
    segments.push({ text: content.slice(lastIdx) })
  }
  return segments
})

// Methods
const fetchAuditData = async () => {
  // Use the enhanced route utilities for better type safety
  const auditId = routeUtils.getAuditId(route.params)
  if (!auditId) {
    error.value = 'No valid audit ID provided'
    return
  }

  loading.value = true
  error.value = null

  try {
    const fetchedAudit = await auditsStore.fetchAudit(auditId)
    if (fetchedAudit) {
      audit.value = fetchedAudit
      // Initialize notes
      auditNotes.value = fetchedAudit.notes || ''
      notesChanged.value = false
      // Set initial tab based on query parameter
      if (route.query.tab === 'information') {
        activeTab.value = 'information'
      }
    } else {
      error.value = t('audit_not_found')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('failed_to_load_audit')
  } finally {
    loading.value = false
  }
}

const highlightCorrections = (content: string, corrections: any[], type: 'original' | 'corrected') => {
  let highlightedContent = content
  
  corrections.forEach(correction => {
    const text = type === 'original' ? correction.originalText : correction.correctedText
    const color = type === 'original' ? 'error' : 'success'
    const regex = new RegExp(`(${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    highlightedContent = highlightedContent.replace(regex, `<span class="text-${color} font-weight-bold">$1</span>`)
  })
  
  return highlightedContent
}

const toggleHighlighting = () => {
  showHighlighting.value = !showHighlighting.value
}

const exportComparison = () => {
  // Implementation for exporting comparison
  console.log('Exporting comparison...')
}

const exportCorrections = () => {
  // Implementation for exporting corrections
  console.log('Exporting corrections...')
}

const copyContent = async (type: 'original' | 'corrected') => {
  let text = ''
  if (type === 'original') {
    text = audit.value?.sourceContent || ''
  } else {
    text = audit.value?.correctedContent || ''
  }
  try {
    await navigator.clipboard.writeText(text)
    if (type === 'original') {
      copiedOriginal.value = true
      setTimeout(() => (copiedOriginal.value = false), 1200)
    } else {
      copiedCorrected.value = true
      setTimeout(() => (copiedCorrected.value = false), 1200)
    }
  } catch (e) {
    // fallback or error handling if needed
  }
}

const saveNotes = async () => {
  if (!audit.value || !notesChanged.value) return
  
  savingNotes.value = true
  try {
    // Update the audit notes in the store
    const updatedAudit = await auditsStore.updateAudit(audit.value.id, { notes: auditNotes.value })
    audit.value.notes = updatedAudit.notes
    notesChanged.value = false
  } catch (err) {
    console.error('Failed to save notes:', err)
    // You might want to show a toast notification here
  } finally {
    savingNotes.value = false
  }
}

const handleVersionRequest = async (data: { feedback: string; newContext?: string }) => {
  if (!audit.value) return
  
  try {
    // Create new audit version
    const newVersion = await auditsStore.createNewVersion(
      audit.value.id, 
      data.feedback, 
      data.newContext
    )
    
    // Redirect to the new audit version
    await router.push(`/audits/${newVersion.id}`)
    
  } catch (err) {
    console.error('Failed to submit version request:', err)
    // You could show an error notification here
  }
}

// Utility functions
const getSourceTypeColor = (sourceType: SourceType) => {
  const colors: Record<string, string> = {
    WEB: 'primary',
    DOCUMENT: 'secondary',
  }
  return colors[sourceType] || 'grey'
}

const getSourceTypeLabel = (sourceType: SourceType) => {
  const labels: Record<string, string> = {
    WEB: t('source_web'),
    DOCUMENT: t('source_document'),
  }
  return labels[sourceType] || sourceType
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'grey',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    REVIEWED: 'info',
    ARCHIVED: 'secondary'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: t('pending'),
    IN_PROGRESS: t('in_progress'),
    COMPLETED: t('completed'),
    REVIEWED: t('reviewed'),
    ARCHIVED: t('archived')
  }
  return labels[status] || status
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'error',
    CRITICAL: 'error'
  }
  return colors[severity] || 'grey'
}

const getSeverityLabel = (severity: string) => {
  const labels: Record<string, string> = {
    LOW: t('low'),
    MEDIUM: t('medium'),
    HIGH: t('high'),
    CRITICAL: t('critical')
  }
  return labels[severity] || severity
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    GRAMMAR: t('grammar'),
    CLARITY: t('clarity'),
    LEGAL: t('legal'),
    COMPLIANCE: t('compliance'),
    STYLE: t('style')
  }
  return labels[category] || category
}

const formatLocationInfo = (correction: any) => {
  const parts = []
  if (correction.page) {
    parts.push(`${t('page')} ${correction.page}`)
  }
  if (correction.lineStart) {
    if (correction.lineEnd && correction.lineEnd !== correction.lineStart) {
      parts.push(`${t('line')} ${correction.lineStart}-${correction.lineEnd}`)
    } else {
      parts.push(`${t('line')} ${correction.lineStart}`)
    }
  }
  return parts.join(', ')
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

// Lifecycle
onMounted(() => {
  fetchAuditData()
})

// Watch for route changes with enhanced validation
watch(() => route.params, (newParams) => {
  const auditId = routeUtils.getAuditId(newParams)
  if (auditId) {
    fetchAuditData()
  }
}, { deep: true })

// Watch for notes changes
watch(auditNotes, (newNotes) => {
  if (audit.value) {
    notesChanged.value = newNotes !== (audit.value.notes || '')
  }
})
</script>

<style scoped lang="sass">
.audit-view-page
  min-height: 100vh

.metadata-item
  span
    display: block
    margin-bottom: 0.25rem
  p
    margin: 0

.content-card
  height: 100%
  .content-text
    max-height: 400px
    overflow-y: auto
    white-space: pre-wrap
    font-family: 'Courier New', monospace
    font-size: 0.875rem
    line-height: 1.5

.highlighted-content
  :deep(.text-error)
    background-color: rgba(244, 67, 54, 0.1)
    padding: 0.125rem 0.25rem
    border-radius: 0.25rem
  :deep(.text-success)
    background-color: rgba(76, 175, 80, 0.1)
    padding: 0.125rem 0.25rem
    border-radius: 0.25rem

.correction-item
  border: 1px solid rgba(0, 0, 0, 0.12)
  border-radius: 0.5rem
  padding: 1rem

.correction-details
  margin-top: 0.5rem

.tab-content
  min-height: 400px

.information-view
  .context-textarea
    :deep(.v-field__input)
      background-color: rgba(0, 0, 0, 0.04)
      cursor: not-allowed
    :deep(.v-field)
      opacity: 0.8

.notes-textarea
  :deep(.v-field__input)
    min-height: 120px
</style> 