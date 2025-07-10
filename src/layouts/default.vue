<template>
  <AppTopbar />

  <v-main>
    <router-view />
  </v-main>

  <AppFooter />
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import AppFooter from "@/components/AppFooter.vue";
import AppTopbar from "@/components/AppTopbar.vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

onMounted(() => {
  // Check for existing authentication session on app startup
  appStore.checkAuth();
});
</script>
