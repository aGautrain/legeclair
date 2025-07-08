/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'

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

// Route guards for authentication
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

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route without authentication
    next('/login')
  } else if (isAuthRoute && isAuthenticated) {
    // Redirect to documents if trying to access auth routes while authenticated
    next('/documents')
  } else {
    // Allow navigation
    next()
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
