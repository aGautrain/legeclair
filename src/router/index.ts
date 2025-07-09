/**
 * router/index.ts
 *
 * Enhanced auto router configuration for better route handling
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'

// Type definitions for better route handling
interface RouteParams {
  id?: string
}

interface RouteQuery {
  tab?: string
  [key: string]: string | string[] | undefined
}

// Enhanced router configuration
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const el = document.querySelector(to.hash)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
            resolve({ el: to.hash })
          } else {
            resolve({ left: 0, top: 0 })
          }
        }, 300)
      })
    }
    return { left: 0, top: 0 }
  },
})

// Enhanced route guards with better type safety
router.beforeEach((to, from, next) => {
  // Get authentication state from localStorage/sessionStorage
  const storedUser = localStorage.getItem('legeclair_user') || sessionStorage.getItem('legeclair_user')
  const storedToken = localStorage.getItem('legeclair_token') || sessionStorage.getItem('legeclair_token')
  const isAuthenticated = !!(storedUser && storedToken)

  // Define protected routes that require authentication
  const protectedRoutes = ['/documents', '/audits', '/profile', '/settings']
  
  // Define auth routes that should redirect to documents if already authenticated
  const authRoutes = ['/login', '/register']

  // Check if the route requires authentication
  const requiresAuth = protectedRoutes.some(route => to.path.startsWith(route))
  
  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => to.path === route)

  // Enhanced validation for /audits/:id route
  if (to.path.startsWith('/audits/') && to.path !== '/audits') {
    const auditId = to.params.id
    if (!auditId || typeof auditId !== 'string' || auditId.trim() === '') {
      console.warn('Invalid audit ID in route:', to.path)
      next('/audits')
      return
    }
    
    // Validate audit ID format (assuming UUID or numeric format)
    const isValidAuditId = /^[a-zA-Z0-9-_]+$/.test(auditId)
    if (!isValidAuditId) {
      console.warn('Invalid audit ID format:', auditId)
      next('/audits')
      return
    }
  }

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route without authentication
    console.log('Redirecting to login: authentication required')
    next('/login')
  } else if (isAuthRoute && isAuthenticated) {
    // Redirect to documents if trying to access auth routes while authenticated
    console.log('Redirecting to documents: already authenticated')
    next('/documents')
  } else {
    // Allow navigation
    next()
  }
})

// Enhanced route resolution for better error handling
router.beforeResolve(async (to, from) => {
  // Pre-fetch data for audit routes if needed
  if (to.path.startsWith('/audits/') && to.path !== '/audits') {
    const auditId = to.params.id
    if (auditId && typeof auditId === 'string') {
      try {
        // You can add pre-fetching logic here if needed
        console.log('Pre-fetching audit data for ID:', auditId)
      } catch (error) {
        console.error('Error pre-fetching audit data:', error)
      }
    }
  }
})

// Enhanced error handling
router.onError((err, to) => {
  console.error('Router error:', err)
  
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else if (err?.message?.includes?.('Chunkload failed')) {
    // Handle chunk loading errors
    console.error('Chunk loading failed, attempting to reload')
    window.location.reload()
  } else {
    // Handle other routing errors
    console.error('Unhandled router error:', err)
    
    // Redirect to a safe page if the error is critical
    if (to.path !== '/') {
      router.push('/').catch(() => {
        window.location.href = '/'
      })
    }
  }
})

// Enhanced navigation completion handling
router.afterEach((to, from) => {
  // Log navigation for debugging
  console.log(`Navigation: ${from.path} → ${to.path}`)
  
  // Handle audit route specific logic
  if (to.path.startsWith('/audits/') && to.path !== '/audits') {
    const auditId = to.params.id
    if (auditId && typeof auditId === 'string') {
      // Set page title for audit detail pages
      document.title = `Audit ${auditId} - Legeclair`
    }
  } else if (to.path === '/audits') {
    // Set page title for audit list
    document.title = 'Audits - Legeclair'
  }
  
  // Clear any error states
  localStorage.removeItem('vuetify:dynamic-reload')
})

// Router ready handling
router.isReady().then(() => {
  console.log('Router is ready')
  localStorage.removeItem('vuetify:dynamic-reload')
}).catch((error) => {
  console.error('Router failed to initialize:', error)
})

// Export router with enhanced typing
export default router

// Export utility functions for route handling
export const routeUtils = {
  /**
   * Validate if a route parameter is a valid audit ID
   */
  isValidAuditId: (id: unknown): id is string => {
    return typeof id === 'string' && id.trim() !== '' && /^[a-zA-Z0-9-_]+$/.test(id)
  },

  /**
   * Get audit ID from route params with validation
   */
  getAuditId: (params: Record<string, unknown>): string | null => {
    const id = params.id
    return routeUtils.isValidAuditId(id) ? id : null
  },

  /**
   * Navigate to audit detail page with validation
   */
  navigateToAudit: (id: string) => {
    if (routeUtils.isValidAuditId(id)) {
      return router.push(`/audits/${id}`)
    } else {
      console.error('Invalid audit ID:', id)
      return Promise.reject(new Error('Invalid audit ID'))
    }
  },

  /**
   * Navigate to audit detail page with query parameters
   */
  navigateToAuditWithTab: (id: string, tab: string) => {
    if (routeUtils.isValidAuditId(id)) {
      return router.push({
        path: `/audits/${id}`,
        query: { tab }
      })
    } else {
      console.error('Invalid audit ID:', id)
      return Promise.reject(new Error('Invalid audit ID'))
    }
  }
}
