<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center pa-6">
        <v-icon class="mr-3" color="primary">mdi-refresh</v-icon>
        {{ $t("request_new_version") }}
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-6">
        <!-- Feedback Section -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t("feedback_required") }}
          </h4>
          <v-radio-group
            v-model="selectedFeedback"
            class="feedback-group"
            hide-details
          >
            <v-radio
              v-for="feedback in feedbackOptions"
              :key="feedback.value"
              class="mb-2"
              hide-details
              :label="feedback.label"
              :value="feedback.value"
            >
              <template #label>
                <div class="d-flex align-center">
                  <v-icon class="mr-2" :color="feedback.color" size="20">
                    {{ feedback.icon }}
                  </v-icon>
                  <span class="text-body-1">{{ feedback.label }}</span>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </div>

        <!-- Context Section -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t("new_context_optional") }}
          </h4>
          <v-textarea
            v-model="newContext"
            auto-grow
            class="context-textarea"
            hide-details
            :placeholder="$t('new_context_placeholder')"
            rows="4"
            variant="outlined"
          />
          <p class="text-caption text-medium-emphasis mt-2">
            {{ $t("new_context_help") }}
          </p>
        </div>

        <!-- Current Context Display -->
        <div v-if="currentContext" class="mb-6">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t("current_context") }}
          </h4>
          <v-card class="pa-3" variant="outlined">
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ currentContext }}
            </p>
          </v-card>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn :disabled="loading" variant="outlined" @click="closeDialog">
          {{ $t("cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!selectedFeedback"
          :loading="loading"
          @click="submitRequest"
        >
          {{ $t("request_version") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  modelValue: boolean;
  currentContext?: string;
  auditId: string;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (
    e: "request-submitted",
    data: { feedback: string; newContext?: string },
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

// Reactive data
const selectedFeedback = ref("");
const newContext = ref("");
const loading = ref(false);

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Feedback options
const feedbackOptions = [
  {
    value: "corrections_insufficient",
    label: t("feedback_corrections_insufficient"),
    icon: "mdi-alert-circle",
    color: "warning",
  },
  {
    value: "context_misunderstood",
    label: t("feedback_context_misunderstood"),
    icon: "mdi-lightbulb-off",
    color: "info",
  },
  {
    value: "quality_issues",
    label: t("feedback_quality_issues"),
    icon: "mdi-thumb-down",
    color: "error",
  },
  {
    value: "different_approach",
    label: t("feedback_different_approach"),
    icon: "mdi-arrow-decision",
  },
  {
    value: "other",
    label: t("feedback_other"),
    icon: "mdi-dots-horizontal",
    color: "grey",
  },
];

// Methods
const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  selectedFeedback.value = "";
  newContext.value = "";
  loading.value = false;
};

const submitRequest = async () => {
  if (!selectedFeedback.value) return;

  loading.value = true;

  try {
    // Emit the request data
    emit("request-submitted", {
      feedback: selectedFeedback.value,
      newContext: newContext.value.trim() || undefined,
    });

    // Close dialog and reset form
    closeDialog();
  } catch (error) {
    console.error("Error submitting version request:", error);
  } finally {
    loading.value = false;
  }
};

// Reset form when dialog opens
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetForm();
    }
  },
);
</script>

<style scoped lang="sass">
.feedback-group
  :deep(.v-radio)
    margin-bottom: 0.5rem

    .v-radio__label
      padding-left: 0.5rem

.context-textarea
  :deep(.v-field__input)
    min-height: 100px
</style>
