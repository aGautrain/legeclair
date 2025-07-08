<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <v-container class="hero-container">
        <v-row align="center" class="hero-row">
          <v-col cols="12" lg="6" class="hero-content">
            <div class="hero-badge">
              <v-chip color="primary" size="small" class="mb-3">
                <v-icon start>mdi-star</v-icon>
                {{ $t('trust_badges') }}
              </v-chip>
            </div>
            <h1 class="hero-title">{{ $t('hero_title') }}</h1>
            <p class="hero-subtitle">{{ $t('hero_subtitle') }}</p>
            <div class="hero-cta-group">
              <v-btn
                color="primary"
                size="large"
                class="hero-cta-primary"
                @click="scrollToSection('pricing')"
              >
                {{ $t('hero_cta') }}
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                class="hero-cta-secondary"
                @click="scrollToSection('demo')"
              >
                {{ $t('hero_secondary_cta') }}
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" lg="6" class="hero-visual">
            <v-img
              src="https://via.placeholder.com/600x400/1976D2/FFFFFF?text=Legeclair+Platform"
              class="hero-image"
              rounded="lg"
              elevation="8"
            />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Problem Statement Section -->
    <section class="problem-section" id="problems">
      <v-container>
        <div class="section-header text-center mb-8">
          <h2 class="section-title">{{ $t('problem_title') }}</h2>
          <p class="section-subtitle">{{ $t('problem_subtitle') }}</p>
        </div>
        <v-row>
          <v-col cols="12" md="4" v-for="(problem, index) in problems" :key="index">
            <v-card class="problem-card" elevation="2">
              <v-card-text class="text-center">
                <v-icon size="48" color="error" class="mb-4">{{ problem.icon }}</v-icon>
                <h3 class="problem-card-title">{{ $t(problem.key) }}</h3>
                <p class="problem-card-desc">{{ problem.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features Section -->
    <section class="features-section" id="features">
      <v-container>
        <div class="section-header text-center mb-8">
          <h2 class="section-title">{{ $t('features_title') }}</h2>
        </div>
        <v-row>
          <v-col cols="12" md="6" v-for="(feature, index) in features" :key="index">
            <v-card class="feature-card" elevation="3">
              <v-row no-gutters>
                <v-col cols="12" md="4" class="feature-visual">
                  <v-img
                    :src="feature.image"
                    class="feature-image"
                    cover
                  />
                </v-col>
                <v-col cols="12" md="8" class="feature-content">
                  <v-card-title class="feature-title">
                    <v-icon color="primary" class="mr-2">{{ feature.icon }}</v-icon>
                    {{ $t(feature.titleKey) }}
                  </v-card-title>
                  <v-card-text class="feature-desc">
                    {{ $t(feature.descKey) }}
                  </v-card-text>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Social Proof Section -->
    <section class="social-proof-section">
      <v-container>
        <div class="section-header text-center mb-8">
          <h2 class="section-title">{{ $t('social_proof_title') }}</h2>
        </div>
        
        <!-- Statistics -->
        <v-row class="stats-row mb-8">
          <v-col cols="12" md="4" v-for="(stat, index) in stats" :key="index">
            <div class="stat-item text-center">
              <div class="stat-number">{{ $t(stat.valueKey) }}</div>
              <div class="stat-label">{{ $t(stat.labelKey) }}</div>
            </div>
          </v-col>
        </v-row>

        <!-- Testimonials -->
        <v-row>
          <v-col cols="12" md="6" v-for="(testimonial, index) in testimonials" :key="index">
            <v-card class="testimonial-card" elevation="2">
              <v-card-text>
                <div class="testimonial-content">
                  <v-icon color="primary" class="testimonial-quote">mdi-format-quote-open</v-icon>
                  <p class="testimonial-text">{{ $t(testimonial.textKey) }}</p>
                  <div class="testimonial-author">
                    <strong>{{ $t(testimonial.authorKey) }}</strong>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section" id="pricing">
      <v-container>
        <div class="section-header text-center mb-8">
          <h2 class="section-title">{{ $t('pricing_title') }}</h2>
        </div>
        <v-row justify="center">
          <v-col cols="12" md="4" v-for="(plan, index) in pricingPlans" :key="index">
            <v-card 
              class="pricing-card" 
              :class="{ 'pricing-card-featured': plan.featured }"
              elevation="4"
            >
              <v-card-title class="pricing-title text-center">
                {{ $t(plan.nameKey) }}
              </v-card-title>
              <v-card-subtitle class="pricing-subtitle text-center">
                {{ $t(plan.descKey) }}
              </v-card-subtitle>
              <v-card-text class="pricing-features px-8">
                <ul class="pricing-feature-list">
                  <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
                </ul>
              </v-card-text>
              <v-card-actions class="pricing-actions">
                <v-btn
                  :color="plan.featured ? 'primary' : 'outlined'"
                  :variant="plan.featured ? 'elevated' : 'outlined'"
                  block
                  size="large"
                  @click="selectPlan(plan)"
                >
                  {{ plan.featured ? $t('hero_cta') : $t('sign_up') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Demo Section -->
    <section class="demo-section" id="demo">
      <v-container>
        <div class="section-header text-center mb-8">
          <h2 class="section-title">Try the Demo</h2>
          <p class="section-subtitle">Experience the platform with our mock authentication system</p>
        </div>
        
        <v-card class="demo-card" elevation="4">
          <v-card-text class="pa-6">
            <v-row align="center">
              <v-col cols="12" md="6">
                <h3 class="text-h5 font-weight-bold mb-3">Quick Demo Login</h3>
                <p class="text-body-1 mb-4">
                  Test the platform with our pre-configured demo accounts. All accounts use the password: <strong>password123</strong>
                </p>
                <div class="d-flex flex-wrap gap-2 mb-4">
                  <v-btn
                    v-for="(user, index) in demoUsers"
                    :key="user.email"
                    color="primary"
                    variant="outlined"
                    @click="quickDemoLogin(index)"
                    :loading="isLoading"
                  >
                    <v-avatar size="24" class="mr-2">
                      <v-img :src="user.avatar" />
                    </v-avatar>
                    {{ user.firstName }}
                  </v-btn>
                </div>
                <v-alert
                  v-if="demoMessage"
                  :type="demoMessage.type"
                  variant="tonal"
                  class="mb-4"
                >
                  {{ demoMessage.text }}
                </v-alert>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <h4 class="text-h6 mb-3">Demo Features</h4>
                  <ul class="demo-features">
                    <li>Mock user authentication</li>
                    <li>Session persistence</li>
                    <li>Protected routes</li>
                    <li>User profile management</li>
                    <li>Document management</li>
                  </ul>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </section>

    <!-- Final CTA Section -->
    <section class="final-cta-section">
      <v-container>
        <div class="final-cta-content text-center">
          <h2 class="final-cta-title">{{ $t('final_cta_title') }}</h2>
          <p class="final-cta-subtitle">{{ $t('final_cta_subtitle') }}</p>
          <v-btn
            color="primary"
            size="x-large"
            class="final-cta-button"
            @click="scrollToSection('pricing')"
          >
            {{ $t('final_cta_button') }}
            <v-icon end>mdi-rocket-launch</v-icon>
          </v-btn>
        </div>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

// Demo functionality
const isLoading = ref(false)
const demoMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const demoUsers = ref([
  { 
    email: 'john@example.com', 
    firstName: 'John',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  { 
    email: 'jane@example.com', 
    firstName: 'Jane',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  { 
    email: 'demo@legeclair.com', 
    firstName: 'Demo',
    avatar: 'https://i.pravatar.cc/150?img=3'
  }
])

const quickDemoLogin = async (userIndex: number) => {
  isLoading.value = true
  demoMessage.value = null
  
  try {
    const success = appStore.mockQuickLogin(userIndex)
    if (success) {
      demoMessage.value = {
        type: 'success',
        text: `Successfully logged in as ${demoUsers.value[userIndex].firstName}! Redirecting to documents...`
      }
      setTimeout(() => {
        router.push('/documents')
      }, 1500)
    } else {
      demoMessage.value = {
        type: 'error',
        text: 'Failed to login. Please try again.'
      }
    }
  } catch (error) {
    demoMessage.value = {
      type: 'error',
      text: 'An error occurred during login.'
    }
  } finally {
    isLoading.value = false
  }
}

// Reactive data for dynamic content
const problems = ref([
  {
    icon: 'mdi-clock-outline',
    key: 'problem_complexity',
    description: 'La création de documents juridiques prend des heures et nécessite une expertise spécialisée.'
  },
  {
    icon: 'mdi-shield-alert-outline',
    key: 'problem_compliance',
    description: 'Les réglementations changent constamment, rendant difficile le maintien de la conformité.'
  },
  {
    icon: 'mdi-hand-pointing-up',
    key: 'problem_manual',
    description: 'Les processus manuels sont lents, coûteux et sujets aux erreurs humaines.'
  }
])

const features = ref([
  {
    icon: 'mdi-robot',
    titleKey: 'feature_automation',
    descKey: 'feature_automation_desc',
    image: 'https://via.placeholder.com/300x200/1976D2/FFFFFF?text=Smart+Automation'
  },
  {
    icon: 'mdi-shield-check',
    titleKey: 'feature_compliance',
    descKey: 'feature_compliance_desc',
    image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Compliance+Monitoring'
  },
  {
    icon: 'mdi-lock',
    titleKey: 'feature_security',
    descKey: 'feature_security_desc',
    image: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Enterprise+Security'
  },
  {
    icon: 'mdi-chart-line',
    titleKey: 'feature_analytics',
    descKey: 'feature_analytics_desc',
    image: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Advanced+Analytics'
  }
])

const stats = ref([
  { valueKey: 'stats_clients', labelKey: 'stats_clients_label' },
  { valueKey: 'stats_documents', labelKey: 'stats_documents_label' },
  { valueKey: 'stats_compliance', labelKey: 'stats_compliance_label' }
])

const testimonials = ref([
  { textKey: 'testimonial_1', authorKey: 'testimonial_1_author' },
  { textKey: 'testimonial_2', authorKey: 'testimonial_2_author' }
])

const pricingPlans = ref([
  {
    nameKey: 'pricing_free',
    descKey: 'pricing_free_desc',
    featured: false,
    features: ['5 documents par mois', 'Templates de base', 'Support email', 'Conformité RGPD']
  },
  {
    nameKey: 'pricing_pro',
    descKey: 'pricing_pro_desc',
    featured: true,
    features: ['Documents illimités', 'Templates premium', 'Support prioritaire', 'Audit automatique', 'Analytics avancées']
  },
  {
    nameKey: 'pricing_enterprise',
    descKey: 'pricing_enterprise_desc',
    featured: false,
    features: ['Tout du plan Pro', 'API personnalisée', 'Support dédié', 'Formation sur mesure', 'Intégration SSO']
  }
])

// Methods
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const selectPlan = (plan: any) => {
  // Handle plan selection - could navigate to registration or show modal
  console.log('Selected plan:', plan.nameKey)
  // In a real app, this would trigger registration flow
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  color: white;
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
}

.hero-row {
  min-height: 500px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-cta-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-cta-primary {
  min-width: 200px;
}

/* Demo Section */
.demo-section {
  background: #f8f9ff;
  padding: 80px 0;
}

.demo-card {
  border-radius: 16px;
}

.demo-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.demo-features li {
  padding: 8px 0;
  position: relative;
  padding-left: 24px;
}

.demo-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4CAF50;
  font-weight: bold;
}

.hero-cta-secondary {
  min-width: 150px;
}

.hero-image {
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Section Styles */
.section-header {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1976D2;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

/* Problem Section */
.problem-section {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.problem-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.problem-card:hover {
  transform: translateY(-5px);
}

.problem-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.problem-card-desc {
  color: #666;
  line-height: 1.6;
}

/* Features Section */
.features-section {
  padding: 80px 0;
}

.feature-card {
  height: 100%;
  transition: transform 0.3s ease;
  margin-bottom: 2rem;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-image {
  height: 200px;
  border-radius: 8px 0 0 8px;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.feature-desc {
  color: #666;
  line-height: 1.6;
}

/* Social Proof Section */
.social-proof-section {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.stats-row {
  margin-bottom: 4rem;
}

.stat-item {
  padding: 2rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #1976D2;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
}

.testimonial-card {
  height: 100%;
  margin-bottom: 2rem;
}

.testimonial-content {
  position: relative;
}

.testimonial-quote {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  color: #1976D2;
  font-size: 1rem;
}

/* Pricing Section */
.pricing-section {
  padding: 80px 0;
}

.pricing-card {
  height: 100%;
  transition: transform 0.3s ease;
  position: relative;
}

.pricing-card:hover {
  transform: translateY(-5px);
}

.pricing-card-featured {
  border: 2px solid #1976D2;
  transform: scale(1.05);
}

.pricing-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1976D2;
}

.pricing-subtitle {
  color: #666;
  font-size: 1rem;
}

.pricing-features {
  padding: 2rem 0;
}

.pricing-feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pricing-feature-list li {
  padding: 0.5rem 0;
  color: #666;
  position: relative;
  padding-left: 1.5rem;
}

.pricing-feature-list li::before {
  content: "✓";
  color: #4CAF50;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.pricing-actions {
  padding: 1rem 1.5rem 1.5rem;
}

/* Final CTA Section */
.final-cta-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  color: white;
}

.final-cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.final-cta-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.final-cta-button {
  min-width: 250px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .hero-cta-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .hero-cta-primary,
  .hero-cta-secondary {
    min-width: auto;
  }
  
  .feature-image {
    border-radius: 8px 8px 0 0;
  }
  
  .pricing-card-featured {
    transform: none;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .hero-section,
  .problem-section,
  .features-section,
  .social-proof-section,
  .pricing-section,
  .final-cta-section {
    padding: 60px 0;
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
  
  .final-cta-title {
    font-size: 2rem;
  }
}
</style>
