<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="800px"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">
            Generate {{ documentTypeLabel }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mt-1">
            Fill in the details below to generate your document
          </p>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.companyName"
                label="Company Name"
                variant="outlined"
                :rules="[v => !!v || 'Company name is required']"
                required
                prepend-inner-icon="mdi-domain"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.domain"
                label="Website Domain"
                variant="outlined"
                :rules="[v => !!v || 'Domain is required']"
                required
                prepend-inner-icon="mdi-web"
                placeholder="example.com"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.jurisdiction"
                :items="jurisdictions"
                label="Legal Jurisdiction"
                variant="outlined"
                :rules="[v => !!v || 'Jurisdiction is required']"
                required
                prepend-inner-icon="mdi-map-marker"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.companyAddress"
                label="Company Address"
                variant="outlined"
                :rules="[v => !!v || 'Company address is required']"
                required
                prepend-inner-icon="mdi-map-marker-outline"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.contactEmail"
                label="Contact Email"
                variant="outlined"
                type="email"
                :rules="[
                  v => !!v || 'Contact email is required',
                  v => /.+@.+\..+/.test(v) || 'Email must be valid'
                ]"
                required
                prepend-inner-icon="mdi-email"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.contactPhone"
                label="Contact Phone"
                variant="outlined"
                :rules="[v => !!v || 'Contact phone is required']"
                required
                prepend-inner-icon="mdi-phone"
              />
            </v-col>
          </v-row>

          <!-- Additional fields based on document type -->
          <div v-if="documentType === 'PRIVACY_POLICY'" class="mt-4">
            <v-divider class="mb-4" />
            <h3 class="text-h6 mb-4">Privacy Policy Specifics</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.dataTypes"
                  :items="dataTypes"
                  label="Types of Data Collected"
                  variant="outlined"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || 'Please select at least one data type']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.dataPurposes"
                  :items="dataPurposes"
                  label="Data Processing Purposes"
                  variant="outlined"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || 'Please select at least one purpose']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.dataRetention"
                  label="Data Retention Period"
                  variant="outlined"
                  :rules="[v => !!v || 'Data retention period is required']"
                  required
                  placeholder="e.g., 2 years"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.thirdPartyServices"
                  :items="thirdPartyServices"
                  label="Third-party Services"
                  variant="outlined"
                  multiple
                  chips
                  clearable
                />
              </v-col>
            </v-row>
          </div>

          <div v-if="documentType === 'TOS'" class="mt-4">
            <v-divider class="mb-4" />
            <h3 class="text-h6 mb-4">Terms of Service Specifics</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.serviceDescription"
                  label="Service Description"
                  variant="outlined"
                  :rules="[v => !!v || 'Service description is required']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.userTypes"
                  :items="userTypes"
                  label="User Types"
                  variant="outlined"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || 'Please select at least one user type']"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.prohibitedActivities"
                  label="Prohibited Activities"
                  variant="outlined"
                  rows="3"
                  placeholder="List activities that are not allowed on your platform..."
                />
              </v-col>
            </v-row>
          </div>

          <div v-if="documentType === 'CGU'" class="mt-4">
            <v-divider class="mb-4" />
            <h3 class="text-h6 mb-4">Terms & Conditions Specifics</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.productService"
                  label="Product/Service Name"
                  variant="outlined"
                  :rules="[v => !!v || 'Product/service name is required']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.paymentTerms"
                  :items="paymentTerms"
                  label="Payment Terms"
                  variant="outlined"
                  :rules="[v => !!v || 'Payment terms are required']"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.refundPolicy"
                  label="Refund Policy"
                  variant="outlined"
                  rows="3"
                  placeholder="Describe your refund policy..."
                />
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="isGenerating"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="isGenerating"
          :disabled="!isFormValid"
          @click="generateDocument"
        >
          <v-icon start>mdi-file-document-plus</v-icon>
          Generate Document
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import type { DocumentType, DocumentGenerationConfig } from '@/types/document'

// Props
interface Props {
  modelValue: boolean
  documentType?: DocumentType | null
}

const props = withDefaults(defineProps<Props>(), {
  documentType: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'document-created': [document: any]
}>()

// Store
const documentsStore = useDocumentsStore()

// Reactive data
const form = ref()
const isFormValid = ref(false)
const isGenerating = ref(false)

const formData = ref({
  companyName: '',
  domain: '',
  jurisdiction: '',
  companyAddress: '',
  contactEmail: '',
  contactPhone: '',
  // Privacy Policy specific
  dataTypes: [],
  dataPurposes: [],
  dataRetention: '',
  thirdPartyServices: [],
  // TOS specific
  serviceDescription: '',
  userTypes: [],
  prohibitedActivities: '',
  // CGU specific
  productService: '',
  paymentTerms: '',
  refundPolicy: ''
})

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const documentTypeLabel = computed(() => {
  const labels = {
    TOS: 'Terms of Service',
    PRIVACY_POLICY: 'Privacy Policy',
    CGU: 'Terms & Conditions'
  }
  return props.documentType ? labels[props.documentType] : 'Document'
})

const jurisdictions = [
  'France',
  'European Union',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Spain',
  'Italy',
  'Other'
]

const dataTypes = [
  'Personal Information (name, email, phone)',
  'Payment Information',
  'Usage Data',
  'Cookies and Tracking',
  'Device Information',
  'Location Data',
  'Social Media Data'
]

const dataPurposes = [
  'Service Provision',
  'Customer Support',
  'Marketing Communications',
  'Analytics and Improvement',
  'Legal Compliance',
  'Security and Fraud Prevention'
]

const thirdPartyServices = [
  'Google Analytics',
  'Facebook Pixel',
  'Stripe (Payments)',
  'Mailchimp (Email)',
  'Intercom (Support)',
  'Hotjar (Analytics)',
  'Cloudflare (CDN)'
]

const userTypes = [
  'Individual Users',
  'Business Users',
  'Minors (with parental consent)',
  'International Users'
]

const paymentTerms = [
  'Immediate Payment',
  'Net 30 Days',
  'Net 60 Days',
  'Subscription-based',
  'Pay-per-use'
]

// Methods
const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    companyName: '',
    domain: '',
    jurisdiction: '',
    companyAddress: '',
    contactEmail: '',
    contactPhone: '',
    dataTypes: [],
    dataPurposes: [],
    dataRetention: '',
    thirdPartyServices: [],
    serviceDescription: '',
    userTypes: [],
    prohibitedActivities: '',
    productService: '',
    paymentTerms: '',
    refundPolicy: ''
  }
  form.value?.resetValidation()
}

const generateDocument = async () => {
  if (!props.documentType || !isFormValid.value) return

  isGenerating.value = true

  try {
    const config: DocumentGenerationConfig = {
      type: props.documentType,
      companyName: formData.value.companyName,
      domain: formData.value.domain,
      jurisdiction: formData.value.jurisdiction,
      customFields: {
        companyAddress: formData.value.companyAddress,
        contactEmail: formData.value.contactEmail,
        contactPhone: formData.value.contactPhone,
        ...(props.documentType === 'PRIVACY_POLICY' && {
          dataTypes: formData.value.dataTypes,
          dataPurposes: formData.value.dataPurposes,
          dataRetention: formData.value.dataRetention,
          thirdPartyServices: formData.value.thirdPartyServices
        }),
        ...(props.documentType === 'TOS' && {
          serviceDescription: formData.value.serviceDescription,
          userTypes: formData.value.userTypes,
          prohibitedActivities: formData.value.prohibitedActivities
        }),
        ...(props.documentType === 'CGU' && {
          productService: formData.value.productService,
          paymentTerms: formData.value.paymentTerms,
          refundPolicy: formData.value.refundPolicy
        })
      }
    }

    const document = await documentsStore.createDocument(config)
    emit('document-created', document)
    closeDialog()
  } catch (error) {
    console.error('Error generating document:', error)
  } finally {
    isGenerating.value = false
  }
}

// Watch for document type changes to reset form
watch(() => props.documentType, () => {
  if (props.documentType) {
    resetForm()
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