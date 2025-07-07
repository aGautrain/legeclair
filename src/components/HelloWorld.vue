<template>
  <v-container class="fill-height" max-width="900">
    <div>
      <v-img
        class="mb-4"
        height="150"
        src="@/assets/logo.png"
      />

      <div class="mb-8 text-center">
        <div class="text-body-2 font-weight-light mb-n1">{{$t('welcome_to')}}</div>
        <h1 class="text-h2 font-weight-bold">Legeclair</h1>
        <div class="text-subtitle-1 mt-2">{{$t('tagline')}}</div>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-card
            class="py-4 px-4 mb-4"
            color="surface-variant"
            prepend-icon="mdi-file-document-edit-outline"
            rounded="lg"
            variant="tonal"
          >
            <template #title>
              <h2 class="text-h5 font-weight-bold mb-2">
                {{$t('legal_documents')}}
              </h2>
            </template>
            <div class="text-body-1">
              {{$t('legal_documents_desc')}}
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card
            class="py-4 px-4 mb-4"
            color="surface-variant"
            prepend-icon="mdi-magnify-scan"
            rounded="lg"
            variant="tonal"
          >
            <template #title>
              <h2 class="text-h5 font-weight-bold mb-2">
                {{$t('audit_review')}}
              </h2>
            </template>
            <div class="text-body-1">
              {{$t('audit_review_desc')}}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
// No additional logic needed for static feature presentation
</script>
