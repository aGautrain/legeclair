<template>
  <v-container class="py-8" max-width="500">
    <v-card elevation="0" class="pa-8" style="border-radius: 18px; box-shadow: 0 2px 16px 0 rgba(80, 80, 120, 0.06);">
      <div class="text-h5 font-weight-bold mb-1 text-center">
        {{$t('login_title')}} <span aria-label="key" role="img">🔑</span>
      </div>
      <div class="text-body-1 text-medium-emphasis mb-6 text-center">
        {{$t('login_subtitle')}}
      </div>
      <v-form @submit.prevent="onSubmit" v-slot="{ isValid }">
        <v-text-field
          v-model="email"
          :label="$t('email')"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          class="mb-3"
          density="comfortable"
          variant="outlined"
          required
        />
        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :label="$t('password')"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          @click:append-inner="showPassword = !showPassword"
          class="mb-1"
          density="comfortable"
          variant="outlined"
          required
        />
        <v-checkbox
          v-model="remember"
          class="mb-4 mt-1"
          density="comfortable"
          hide-details
        >
          <template #label>
            {{$t('remember_me')}}
          </template>
        </v-checkbox>
        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          class="mb-4 mt-2 text-white"
          style="font-weight: 600; font-size: 1.1rem; background: #8b5cf6; box-shadow: 0 2px 8px 0 rgba(139,92,246,0.10);"
          :disabled="!email || !password"
        >
          {{$t('sign_in')}}
        </v-btn>
      </v-form>
      <div class="text-center mb-4 text-medium-emphasis">
        {{$t('no_account')}}
        <router-link to="/register" class="text-primary text-decoration-none">{{$t('register_instead')}}</router-link>
      </div>
      <div class="d-flex align-center mb-4">
        <v-divider class="flex-grow-1" />
        <span class="mx-4 text-medium-emphasis">{{$t('or')}}</span>
        <v-divider class="flex-grow-1" />
      </div>
      <div class="d-flex justify-center align-center" style="gap: 18px;">
        <v-btn icon variant="plain" size="large" @click="onSocial('facebook')">
          <v-icon size="24" color="#1877f3">mdi-facebook</v-icon>
        </v-btn>
        <v-btn icon variant="plain" size="large" @click="onSocial('twitter')">
          <v-icon size="24" color="#1da1f2">mdi-twitter</v-icon>
        </v-btn>
        <v-btn icon variant="plain" size="large" @click="onSocial('github')">
          <v-icon size="24" color="#23272f">mdi-github</v-icon>
        </v-btn>
        <v-btn icon variant="plain" size="large" @click="onSocial('google')">
          <v-icon size="24" color="#ea4335">mdi-google</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(false)

function onSubmit() {
  // Handle login logic here
  alert('Login not implemented')
}

function onSocial(provider: string) {
  // Handle social OAuth logic here
  alert('Social sign-in with ' + provider + ' not implemented')
}
</script> 