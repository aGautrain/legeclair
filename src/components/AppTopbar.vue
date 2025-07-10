<template>
  <v-app-bar app color="surface" flat>
    <v-container class="d-flex align-center justify-space-between" fluid>
      <!-- Logo -->
      <router-link class="d-flex align-center text-decoration-none px-4" to="/">
        <v-img
          alt="Logo"
          contain
          max-height="36"
          class="ml-4"
          max-width="36"
          src="@/assets/logo.svg"
        />
        <span class="font-weight-bold text-h6 text-primary">legeclair.fr</span>
      </router-link>

      <!-- Navigation Links -->
      <v-row align="center" class="d-none d-md-flex" no-gutters>
        <v-btn :active="false" class="mx-2" to="/" variant="text">{{
          $t("home")
        }}</v-btn>

        <!-- Show documents link when authenticated -->
        <v-btn
          v-if="appStore.isAuthenticated"
          class="mx-2"
          to="/documents"
          variant="text"
          >{{ $t("documents") }}</v-btn
        >
        <v-btn
          v-if="appStore.isAuthenticated"
          class="mx-2"
          to="/audits"
          variant="text"
          >{{ $t("audits") }}</v-btn
        >

        <v-menu
          v-if="!appStore.isAuthenticated"
          offset-y
          open-on-hover
          transition="slide-y-transition"
        >
          <template #activator="{ props }">
            <v-btn class="mx-2" variant="text" v-bind="props">{{
              $t("services")
            }}</v-btn>
          </template>
          <v-card class="pa-2" elevation="2" min-width="260">
            <v-list>
              <v-list-item to="/services/documents">
                <v-list-item-title>{{
                  $t("legal_documents")
                }}</v-list-item-title>
                <v-list-item-subtitle
                  >Automated, customizable contracts</v-list-item-subtitle
                >
              </v-list-item>
              <v-list-item to="/services/audit">
                <v-list-item-title>{{ $t("audit_review") }}</v-list-item-title>
                <v-list-item-subtitle
                  >Compliance checks and insights</v-list-item-subtitle
                >
              </v-list-item>
              <!-- Add more service links as needed -->
            </v-list>
          </v-card>
        </v-menu>

        <v-btn
          :active="false"
          class="mx-2"
          :to="{ path: '/', hash: '#pricing' }"
          variant="text"
          >{{ $t("pricing") }}</v-btn
        >
        <v-btn class="mx-2" to="/about" variant="text">{{ $t("about") }}</v-btn>
      </v-row>

      <!-- User Menu / CTA Buttons -->
      <div class="d-flex align-center">
        <!-- Show user menu when authenticated -->
        <template v-if="appStore.isAuthenticated">
          <v-menu offset-y transition="slide-y-transition">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="d-flex align-center" variant="text">
                <v-avatar class="mr-2" size="32">
                  <v-img
                    v-if="appStore.user?.avatar"
                    :src="appStore.user.avatar"
                  />
                  <span v-else class="text-caption font-weight-medium">{{
                    appStore.userInitials
                  }}</span>
                </v-avatar>
                <span class="d-none d-sm-block">{{
                  appStore.userFullName
                }}</span>
                <v-icon class="ml-1">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-card class="pa-2" elevation="2" min-width="200">
              <v-list>
                <v-list-item>
                  <v-list-item-title class="text-subtitle-2">{{
                    appStore.userFullName
                  }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    appStore.user?.email
                  }}</v-list-item-subtitle>
                </v-list-item>
                <template v-if="creditsCase === 'none'">
                  <v-list-item>
                    <v-btn
                      block
                      class="no-hover-shadow"
                      color="error"
                      style="margin: 0.5rem 0; box-shadow: none"
                      variant="flat"
                      @click.stop="goToCredits"
                    >
                      {{ $t("buy_credits") }}
                    </v-btn>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item style="cursor: pointer" @click="goToCredits">
                    <template #prepend>
                      <v-chip class="mr-2" color="primary" label size="small">
                        {{ appStore.user?.credits ?? 0 }}
                      </v-chip>
                    </template>
                    <v-list-item-title>
                      {{
                        appStore.user?.credits === 1
                          ? $t("credit")
                          : $t("credits")
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <v-divider class="my-2" />
                <v-list-item to="/profile">
                  <v-list-item-title>{{ $t("profile") }}</v-list-item-title>
                  <template #prepend>
                    <v-icon>mdi-account-outline</v-icon>
                  </template>
                </v-list-item>
                <v-list-item to="/settings">
                  <v-list-item-title>{{ $t("settings") }}</v-list-item-title>
                  <template #prepend>
                    <v-icon>mdi-cog-outline</v-icon>
                  </template>
                </v-list-item>
                <v-divider class="my-2" />
                <v-list-item @click="handleLogout">
                  <v-list-item-title class="text-error">{{
                    $t("logout")
                  }}</v-list-item-title>
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
          <v-btn class="mx-1" color="primary" to="/login">{{
            $t("login")
          }}</v-btn>
          <v-btn class="mx-1" color="primary" to="/register" variant="flat">{{
            $t("register")
          }}</v-btn>
        </template>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";

const router = useRouter();
const appStore = useAppStore();

function handleLogout() {
  appStore.logout();
  // Navigate to home page after logout
  router.push("/");
}

function goToCredits() {
  if (router.currentRoute.value.path === "/" && typeof window !== "undefined") {
    // Already on landing page, smooth scroll
    const el = document.querySelector("#pricing");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
  }
  router.push({ path: "/", hash: "#pricing" });
}

const creditsCase = computed(() => {
  const credits = appStore.user?.credits ?? 0;
  if (credits === 0) return "none";
  if (credits === 1) return "one";
  return "many";
});
</script>

<style scoped lang="sass">
.v-app-bar
  box-shadow: 0 2px 4px rgba(0,0,0,0.03)
  z-index: 10

.v-img
  border-radius: 8px
</style>
