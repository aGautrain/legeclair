<template>
  <v-container class="py-8" max-width="500">
    <v-card
      class="pa-8"
      elevation="0"
      style="
        border-radius: 18px;
        box-shadow: 0 2px 16px 0 rgba(80, 80, 120, 0.06);
      "
    >
      <div class="text-h5 font-weight-bold mb-1 text-center">
        {{ $t("login_title") }} <span aria-label="key" role="img">🔑</span>
      </div>
      <div class="text-body-1 text-medium-emphasis mb-6 text-center">
        {{ $t("login_subtitle") }}
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="appStore.error"
        class="mb-4"
        closable
        type="error"
        variant="tonal"
        @click:close="appStore.clearError()"
      >
        {{ appStore.error }}
      </v-alert>

      <!-- Quick Login Demo -->
      <v-card class="mb-4 pa-3" style="background: #f8f9ff" variant="outlined">
        <div class="text-subtitle-2 mb-2 text-primary">
          Demo Login (password: password123)
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <v-btn
            v-for="(user, index) in demoUsers"
            :key="user.email"
            :loading="appStore.isLoading"
            size="small"
            variant="outlined"
            @click="quickLogin(index)"
          >
            {{ user.firstName }}
          </v-btn>
        </div>
      </v-card>

      <v-form v-slot="{ isValid }" @submit.prevent="onSubmit">
        <v-text-field
          v-model="email"
          class="mb-3"
          density="comfortable"
          :disabled="appStore.isLoading"
          :label="$t('email')"
          prepend-inner-icon="mdi-email-outline"
          required
          type="email"
          variant="outlined"
        />
        <v-text-field
          v-model="password"
          :append-inner-icon="
            showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          class="mb-1"
          density="comfortable"
          :disabled="appStore.isLoading"
          :label="$t('password')"
          prepend-inner-icon="mdi-lock-outline"
          required
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-checkbox
          v-model="remember"
          class="mb-4 mt-1"
          density="comfortable"
          :disabled="appStore.isLoading"
          hide-details
        >
          <template #label>
            {{ $t("remember_me") }}
          </template>
        </v-checkbox>
        <v-btn
          block
          class="mb-4 mt-2 text-white"
          color="primary"
          :disabled="!email || !password || appStore.isLoading"
          :loading="appStore.isLoading"
          size="large"
          style="
            font-weight: 600;
            font-size: 1.1rem;
            background: #8b5cf6;
            box-shadow: 0 2px 8px 0 rgba(139, 92, 246, 0.1);
          "
          type="submit"
        >
          {{ appStore.isLoading ? "Signing in..." : $t("sign_in") }}
        </v-btn>
      </v-form>
      <div class="text-center mb-4 text-medium-emphasis">
        {{ $t("no_account") }}
        <router-link class="text-primary text-decoration-none" to="/register">{{
          $t("register_instead")
        }}</router-link>
      </div>
      <div class="d-flex align-center mb-4">
        <v-divider class="flex-grow-1" />
        <span class="mx-4 text-medium-emphasis">{{ $t("or") }}</span>
        <v-divider class="flex-grow-1" />
      </div>
      <div class="d-flex justify-center align-center" style="gap: 18px">
        <v-btn
          :disabled="appStore.isLoading"
          icon
          size="large"
          variant="plain"
          @click="onSocial('facebook')"
        >
          <v-icon color="#1877f3" size="24">mdi-facebook</v-icon>
        </v-btn>
        <v-btn
          :disabled="appStore.isLoading"
          icon
          size="large"
          variant="plain"
          @click="onSocial('twitter')"
        >
          <v-icon color="#1da1f2" size="24">mdi-twitter</v-icon>
        </v-btn>
        <v-btn
          :disabled="appStore.isLoading"
          icon
          size="large"
          variant="plain"
          @click="onSocial('github')"
        >
          <v-icon color="#23272f" size="24">mdi-github</v-icon>
        </v-btn>
        <v-btn
          :disabled="appStore.isLoading"
          icon
          size="large"
          variant="plain"
          @click="onSocial('google')"
        >
          <v-icon color="#ea4335" size="24">mdi-google</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";

const router = useRouter();
const appStore = useAppStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const remember = ref(false);

// Demo users for quick login
const demoUsers = [
  { email: "john@example.com", firstName: "John" },
  { email: "jane@example.com", firstName: "Jane" },
  { email: "demo@legeclair.com", firstName: "Demo" },
];

async function onSubmit() {
  if (!email.value || !password.value) return;

  const success = await appStore.login({
    email: email.value,
    password: password.value,
    remember: remember.value,
  });

  if (success) {
    // Navigate to documents page after successful login
    router.push("/documents");
  }
}

async function quickLogin(userIndex: number) {
  const success = appStore.mockQuickLogin(userIndex);
  if (success) {
    // Set the email for display
    email.value = demoUsers[userIndex].email;
    password.value = "password123";
    // Navigate to documents page
    router.push("/documents");
  }
}

function onSocial(provider: string) {
  // Handle social OAuth logic here
  alert("Social sign-in with " + provider + " not implemented");
}

onMounted(() => {
  // Clear any existing errors when component mounts
  appStore.clearError();
});
</script>
