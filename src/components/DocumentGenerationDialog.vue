<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="800px"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <div>
          <h2 class="text-h5 font-weight-bold">
            {{ $t('generate_document') }} {{ documentTypeLabel }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mt-1">
            {{ $t('fill_details') }}
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
                :label="$t('company_name')"
                variant="outlined"
                :rules="[v => !!v || $t('required_field')]"
                required
                prepend-inner-icon="mdi-domain"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.domain"
                :label="$t('website_domain')"
                variant="outlined"
                :rules="[v => !!v || $t('required_field')]"
                required
                prepend-inner-icon="mdi-web"
                placeholder="example.com"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.jurisdiction"
                :items="jurisdictions"
                :label="$t('legal_jurisdiction')"
                variant="outlined"
                :rules="[v => !!v || $t('required_field')]"
                required
                prepend-inner-icon="mdi-map-marker"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.companyAddress"
                :label="$t('company_address')"
                variant="outlined"
                :rules="[v => !!v || $t('required_field')]"
                required
                prepend-inner-icon="mdi-map-marker-outline"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.contactEmail"
                :label="$t('contact_email')"
                variant="outlined"
                type="email"
                :rules="[
                  v => !!v || $t('required_field'),
                  v => /.+@.+\..+/.test(v) || $t('invalid_email')
                ]"
                required
                prepend-inner-icon="mdi-email"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.contactPhone"
                :label="$t('contact_phone')"
                variant="outlined"
                :rules="[v => !!v || $t('required_field')]"
                required
                prepend-inner-icon="mdi-phone"
              />
            </v-col>
          </v-row>

          <!-- Additional fields based on document type -->
          <div v-if="documentType === 'PRIVACY_POLICY'" class="mt-4">
            <v-divider class="mb-4" />
            <h3 class="text-h6 mb-4">{{ $t('privacy_policy_specifics') }}</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.dataTypes"
                  :items="dataTypes"
                  :label="$t('types_of_data_collected')"
                  variant="outlined"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || $t('select_at_least_one')]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.dataPurposes"
                  :items="dataPurposes"
                  :label="$t('data_processing_purposes')"
                  variant="outlined"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || $t('select_at_least_one')]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.dataRetention"
                  :label="$t('data_retention_period')"
                  variant="outlined"
                  :rules="[v => !!v || $t('required_field')]"
                  required
                  placeholder="e.g., 2 years"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.thirdPartyServices"
                  :items="thirdPartyServices"
                  :label="$t('third_party_services')"
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
            <h3 class="text-h6 mb-4">{{ $t('tos_specifics') }}</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.serviceDescription"
                  :label="$t('service_description')"
                  variant="outlined"
                  :rules="[v => !!v || $t('required_field')]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.userTypes"
                  :items="userTypes"
                  :label="$t('user_types')"
                  variant="outlined"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || $t('select_at_least_one')]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.prohibitedActivities"
                  :label="$t('prohibited_activities')"
                  variant="outlined"
                  rows="3"
                  placeholder="List activities that are not allowed on your platform..."
                />
              </v-col>
            </v-row>
          </div>

          <div v-if="documentType === 'CGU'" class="mt-4">
            <v-divider class="mb-4" />
            <h3 class="text-h6 mb-4">{{ $t('cgu_specifics') }}</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.productService"
                  :label="$t('product_service_name')"
                  variant="outlined"
                  :rules="[v => !!v || $t('required_field')]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.paymentTerms"
                  :items="paymentTerms"
                  :label="$t('payment_terms')"
                  variant="outlined"
                  :rules="[v => !!v || $t('required_field')]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.refundPolicy"
                  :label="$t('refund_policy')"
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
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          :loading="isGenerating"
          :disabled="!isFormValid"
          @click="generateDocument"
        >
          <v-icon start>mdi-file-document-plus</v-icon>
          {{ $t('generate_document_btn') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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

// Store and i18n
const documentsStore = useDocumentsStore()
const { t } = useI18n()

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
    TOS: t('terms_of_service'),
    PRIVACY_POLICY: t('privacy_policy'),
    CGU: t('terms_conditions')
  }
  return props.documentType ? labels[props.documentType] : 'Document'
})

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

const dataTypes = [
  t('personal_information'),
  t('payment_information'),
  t('usage_data'),
  t('cookies_tracking'),
  t('device_information'),
  t('location_data'),
  t('social_media_data')
]

const dataPurposes = [
  t('service_provision'),
  t('customer_support'),
  t('marketing_communications'),
  t('analytics_improvement'),
  t('legal_compliance'),
  t('security_fraud_prevention')
]

const thirdPartyServices = [
  t('google_analytics'),
  t('facebook_pixel'),
  t('stripe_payments'),
  t('mailchimp_email'),
  t('intercom_support'),
  t('hotjar_analytics'),
  t('cloudflare_cdn')
]

const userTypes = [
  t('individual_users'),
  t('business_users'),
  t('minors_parental_consent'),
  t('international_users')
]

const paymentTerms = [
  t('immediate_payment'),
  t('net_30_days'),
  t('net_60_days'),
  t('subscription_based'),
  t('pay_per_use')
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