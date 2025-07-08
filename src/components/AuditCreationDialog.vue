<template>
  <v-dialog v-model="dialogVisible" max-width="800" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <div>
          <h2 class="text-h5 font-weight-bold">{{ $t('create_new_audit') }}</h2>
          <p class="text-body-2 text-medium-emphasis mt-1">
            {{ $t('create_audit_description') }}
          </p>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" v-model="isFormValid">
          <v-row>
            <!-- Source Type Selection -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.sourceType"
                :label="$t('source_type')"
                :items="sourceTypeOptions"
                variant="outlined"
                :rules="[v => !!v || $t('source_type_required')]"
                required
              />
            </v-col>

            <!-- Source Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.sourceName"
                :label="$t('source_name')"
                variant="outlined"
                :rules="[v => !!v || $t('source_name_required')]"
                required
              />
            </v-col>

            <!-- Company Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.companyName"
                :label="$t('company_name')"
                variant="outlined"
                :rules="[v => !!v || $t('company_name_required')]"
                required
              />
            </v-col>

            <!-- Domain -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.domain"
                :label="$t('domain')"
                variant="outlined"
                placeholder="example.com"
                :rules="[v => !!v || $t('domain_required')]"
                required
              />
            </v-col>

            <!-- Jurisdiction -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.jurisdiction"
                :label="$t('jurisdiction')"
                :items="jurisdictions"
                variant="outlined"
                :rules="[v => !!v || $t('jurisdiction_required')]"
                required
              />
            </v-col>

            <!-- Source Content - Different inputs based on source type -->
            <v-col cols="12">
              <!-- Web URL Input -->
              <v-text-field
                v-if="formData.sourceType === 'WEB'"
                v-model="formData.sourceUrl"
                :label="$t('website_url')"
                variant="outlined"
                :placeholder="$t('website_url_placeholder')"
                :rules="[v => !!v || $t('website_url_required'), v => isValidUrl(v) || $t('invalid_url')]"
                required
                prepend-inner-icon="mdi-web"
              />
              
              <!-- Document Upload -->
              <v-file-input
                v-else-if="formData.sourceType === 'DOCUMENT'"
                v-model="uploadedFile"
                :label="$t('upload_document')"
                variant="outlined"
                :placeholder="$t('upload_document_placeholder')"
                :rules="[v => !!v || $t('document_required')]"
                required
                accept=".pdf,.doc,.docx,.txt"
                prepend-inner-icon="mdi-file-upload"
                @change="onFileChange"
              /> 
            </v-col>
              


            <!-- Additional Notes -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.notes"
                :label="$t('additional_notes')"
                variant="outlined"
                :placeholder="$t('notes_placeholder')"
                rows="3"
                counter
                maxlength="500"
              />
            </v-col>

            <!-- Document Type -->
            <v-col cols="12">
              <v-select
                v-model="formData.documentType"
                :label="$t('document_type')"
                :items="documentTypeOptions"
                variant="outlined"
                :rules="[v => !!v || $t('document_type_required')]"
                required
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="isCreating"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          :loading="isCreating"
          :disabled="!isFormValid"
          @click="createAudit"
        >
          {{ $t('create_audit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuditsStore } from '@/stores/audits'
import type { DocumentType } from '@/types/document'
import type { AuditCreationConfig } from '@/types/audit'

// Props
interface Props {
  modelValue: boolean
  selectedSourceType?: DocumentType | 'WEB' | 'DOCUMENT' | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedSourceType: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'audit-created': [audit: any]
}>()

// Store and i18n
const auditsStore = useAuditsStore()
const { t } = useI18n()

// Reactive data
const form = ref()
const isFormValid = ref(false)
const isCreating = ref(false)

const formData = ref({
  sourceType: '' as 'WEB' | 'DOCUMENT',
  sourceName: '',
  sourceUrl: '',
  companyName: '',
  domain: '',
  jurisdiction: '',
  sourceContent: '',
  notes: '',
  documentType: '' as DocumentType
})

const uploadedFile = ref<File | null>(null)

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const sourceTypeOptions = [
  { title: t('source_web'), value: 'WEB' },
  { title: t('source_document'), value: 'DOCUMENT' }
]

const jurisdictions = [
  t('france'),
  t('european_union'),
  t('united_states'),
  t('united_kingdom'),
  t('canada'),
  t('australia'),
  t('germany'),
  t('spain'),
  t('italy'),
  t('other')
]

const documentTypeOptions = [
  { title: t('terms_of_service'), value: 'TOS' },
  { title: t('privacy_policy'), value: 'PRIVACY_POLICY' },
  { title: t('terms_conditions'), value: 'CGU' }
]

// Methods
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const onSourceTypeChange = (newType: 'WEB' | 'DOCUMENT') => {
  // Reset content when source type changes
  formData.value.sourceContent = ''
  formData.value.sourceUrl = ''
  uploadedFile.value = null
}

const onFileChange = (file: File | null) => {
  if (file) {
    // In a real app, you would read the file content here
    // For now, we'll just set a placeholder
    formData.value.sourceContent = `Document: ${file.name} (${file.size} bytes)`
  } else {
    formData.value.sourceContent = ''
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  formData.value = {
    sourceType: '' as 'WEB' | 'DOCUMENT',
    sourceName: '',
    sourceUrl: '',
    companyName: '',
    domain: '',
    jurisdiction: '',
    sourceContent: '',
    notes: '',
    documentType: '' as DocumentType
  }
  uploadedFile.value = null
  form.value?.resetValidation()
}

const createAudit = async () => {
  if (!isFormValid.value) return

  isCreating.value = true

  try {
    const config: AuditCreationConfig = {
      sourceType: formData.value.sourceType,
      sourceContent: formData.value.sourceContent,
      sourceName: formData.value.sourceName,
      sourceUrl: formData.value.sourceUrl || undefined,
      companyName: formData.value.companyName,
      domain: formData.value.domain,
      jurisdiction: formData.value.jurisdiction,
      customFields: {
        notes: formData.value.notes
      },
      documentType: formData.value.documentType
    }

    const audit = await auditsStore.createAudit(config)
    emit('audit-created', audit)
    closeDialog()
  } catch (error) {
    console.error('Error creating audit:', error)
  } finally {
    isCreating.value = false
  }
}

// Watch for selected source type changes to pre-fill form
watch(() => props.selectedSourceType, (newType) => {
  if (newType === 'WEB' || newType === 'DOCUMENT') {
    formData.value.sourceType = newType
  }
})

// Watch for dialog visibility to reset form when opened
watch(() => props.modelValue, (isVisible) => {
  if (isVisible && (props.selectedSourceType === 'WEB' || props.selectedSourceType === 'DOCUMENT')) {
    formData.value.sourceType = props.selectedSourceType
  }
})
</script>

<style scoped>
.v-dialog {
  border-radius: 12px;
}

.v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style> 