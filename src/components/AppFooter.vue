<template>
  <v-footer
    app
    height="40"
  >
    <div class="d-flex align-center" style="gap: 16px;">
      <router-link class="text-caption on-surface" :to="'/legal-notice'" style="text-decoration: none;">{{$t('legal_notice')}}</router-link>
      <span>-</span>
      <router-link class="text-caption on-surface" :to="'/privacy-policy'" style="text-decoration: none;">{{$t('privacy_policy')}}</router-link>
      <span>-</span>
      <router-link class="text-caption on-surface" :to="'/terms'" style="text-decoration: none;">{{$t('terms_of_use')}}</router-link>
    </div>
    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px;"
    >
      &copy; {{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">Bloupy</span>
      —
      <a
        class="text-decoration-none on-surface"
        href="https://vuetifyjs.com/about/licensing/"
        rel="noopener noreferrer"
        target="_blank"
      >
        MIT License
      </a>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
</script>

<style scoped lang="sass">
</style>
