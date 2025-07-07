<template>
  <v-app-bar app flat color="surface">
    <v-container class="d-flex align-center justify-space-between" fluid>
      <!-- Logo -->
      <router-link to="/" class="d-flex align-center text-decoration-none">
        <v-img src="@/assets/logo.svg" alt="Logo" contain max-width="36" max-height="36" class="mr-2" />
        <span class="font-weight-bold text-h6 text-primary">Legeclair</span>
      </router-link>

      <!-- Navigation Links -->
      <v-row class="d-none d-md-flex" align="center" no-gutters>
        <v-btn variant="text" to="/" class="mx-2" :active="false">{{$t('home')}}</v-btn>

        <v-menu open-on-hover offset-y transition="slide-y-transition">
          <template #activator="{ props }">
            <v-btn variant="text" class="mx-2" v-bind="props">{{$t('services')}}</v-btn>
          </template>
          <v-card min-width="260" elevation="2" class="pa-2">
            <v-list>
              <v-list-item to="/services/documents">
                <v-list-item-title>{{$t('legal_documents')}}</v-list-item-title>
                <v-list-item-subtitle>Automated, customizable contracts</v-list-item-subtitle>
              </v-list-item>
              <v-list-item to="/services/audit">
                <v-list-item-title>{{$t('audit_review')}}</v-list-item-title>
                <v-list-item-subtitle>Compliance checks and insights</v-list-item-subtitle>
              </v-list-item>
              <!-- Add more service links as needed -->
            </v-list>
          </v-card>
        </v-menu>

        <v-btn variant="text" to="/pricing" class="mx-2">{{$t('pricing')}}</v-btn>
        <v-btn variant="text" to="/about" class="mx-2">{{$t('about')}}</v-btn>
      </v-row>

      <!-- CTA Buttons -->
      <div class="d-flex align-center">
        <v-btn color="primary" class="mx-1" to="/login">{{$t('login')}}</v-btn>
        <v-btn color="primary" variant="flat" class="mx-1" to="/register">{{$t('register')}}</v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
// No additional logic needed for static topbar
</script>

<style scoped lang="sass">
.v-app-bar
  box-shadow: 0 2px 4px rgba(0,0,0,0.03)
  z-index: 10

.v-img
  border-radius: 8px
</style> 