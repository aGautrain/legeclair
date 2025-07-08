<template>
  <AppTopbar />

  <v-main>
    <router-view />
  </v-main>

  <AppFooter />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import AppTopbar from '@/components/AppTopbar.vue'
import AppFooter from '@/components/AppFooter.vue'

const appStore = useAppStore()

onMounted(() => {
  // Check for existing authentication session on app startup
  appStore.checkAuth()
})
</script>
