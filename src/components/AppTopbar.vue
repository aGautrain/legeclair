<template>
  <v-app-bar app flat color="surface">
    <v-container class="d-flex align-center justify-space-between" fluid>
      <!-- Logo -->
      <router-link to="/" class="d-flex align-center text-decoration-none px-4">
        <v-img src="@/assets/logo.svg" alt="Logo" contain max-width="36" max-height="36" class="ml-4" />
        <span class="font-weight-bold text-h6 text-primary">legeclair.fr</span>
      </router-link>

      <!-- Navigation Links -->
      <v-row class="d-none d-md-flex" align="center" no-gutters>
        <v-btn variant="text" to="/" class="mx-2" :active="false">{{$t('home')}}</v-btn>

        <!-- Show documents link when authenticated -->
        <v-btn v-if="appStore.isAuthenticated" variant="text" to="/documents" class="mx-2">{{$t('documents')}}</v-btn>
        <v-btn v-if="appStore.isAuthenticated" variant="text" to="/audits" class="mx-2">{{$t('audits')}}</v-btn>

        <v-menu v-if="!appStore.isAuthenticated" open-on-hover offset-y transition="slide-y-transition">
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

        <v-btn variant="text" :to="{ path: '/', hash: '#pricing' }" class="mx-2" :active="false">{{$t('pricing')}}</v-btn>
        <v-btn variant="text" to="/about" class="mx-2">{{$t('about')}}</v-btn>
        
        
      </v-row>

      <!-- User Menu / CTA Buttons -->
      <div class="d-flex align-center">
        <!-- Show user menu when authenticated -->
        <template v-if="appStore.isAuthenticated">
          <v-menu offset-y transition="slide-y-transition">
            <template #activator="{ props }">
              <v-btn variant="text" v-bind="props" class="d-flex align-center">
                <v-avatar size="32" class="mr-2">
                  <v-img v-if="appStore.user?.avatar" :src="appStore.user.avatar" />
                  <span v-else class="text-caption font-weight-medium">{{ appStore.userInitials }}</span>
                </v-avatar>
                <span class="d-none d-sm-block">{{ appStore.userFullName }}</span>
                <v-icon class="ml-1">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-card min-width="200" elevation="2" class="pa-2">
              <v-list>
                <v-list-item>
                  <v-list-item-title class="text-subtitle-2">{{ appStore.userFullName }}</v-list-item-title>
                  <v-list-item-subtitle>{{ appStore.user?.email }}</v-list-item-subtitle>
                </v-list-item>
                <template v-if="creditsCase === 'none'">
                  <v-list-item>
                    <v-btn
                      color="error"
                      variant="flat"
                      block
                      @click.stop="goToCredits"
                      style="margin: 0.5rem 0; box-shadow: none;"
                      class="no-hover-shadow"
                    >
                      {{$t('buy_credits')}}
                    </v-btn>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item @click="goToCredits" style="cursor:pointer;">
                    <template #prepend>
                      <v-chip color="primary" class="mr-2" size="small" label>
                        {{ appStore.user?.credits ?? 0 }}
                      </v-chip>
                    </template>
                    <v-list-item-title>
                      {{ appStore.user?.credits === 1 ? $t('credit') : $t('credits') }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <v-divider class="my-2" />
                <v-list-item to="/profile">
                  <v-list-item-title>{{$t('profile')}}</v-list-item-title>
                  <template #prepend>
                    <v-icon>mdi-account-outline</v-icon>
                  </template>
                </v-list-item>
                <v-list-item to="/settings">
                  <v-list-item-title>{{$t('settings')}}</v-list-item-title>
                  <template #prepend>
                    <v-icon>mdi-cog-outline</v-icon>
                  </template>
                </v-list-item>
                <v-divider class="my-2" />
                <v-list-item @click="handleLogout">
                  <v-list-item-title class="text-error">{{$t('logout')}}</v-list-item-title>
                  <template #prepend>
                    <v-icon color="error">mdi-logout</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>
        
        <!-- Show login/register buttons when not authenticated -->
        <template v-else>
          <v-btn color="primary" class="mx-1" to="/login">{{$t('login')}}</v-btn>
          <v-btn color="primary" variant="flat" class="mx-1" to="/register">{{$t('register')}}</v-btn>
        </template>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

function handleLogout() {
  appStore.logout()
  // Navigate to home page after logout
  router.push('/')
}

function goToCredits() {
  if (router.currentRoute.value.path === '/' && typeof window !== 'undefined') {
    // Already on landing page, smooth scroll
    const el = document.getElementById('pricing')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      return
    }
  }
  router.push({ path: '/', hash: '#pricing' })
}

const creditsCase = computed(() => {
  const credits = appStore.user?.credits ?? 0
  if (credits === 0) return 'none'
  if (credits === 1) return 'one'
  return 'many'
})
</script>

<style scoped lang="sass">
.v-app-bar
  box-shadow: 0 2px 4px rgba(0,0,0,0.03)
  z-index: 10

.v-img
  border-radius: 8px
</style> 