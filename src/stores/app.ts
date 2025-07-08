// Utilities
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Types
interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: 'user' | 'admin'
  createdAt: Date
  lastLoginAt: Date
  credits: number
}

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export const useAppStore = defineStore('app', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const sessionToken = ref<string | null>(null)

  // Mock user data for demonstration
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'user',
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date(),
      credits: 42
    },
    {
      id: '2',
      username: 'jane_smith',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      avatar: 'https://i.pravatar.cc/150?img=2',
      role: 'admin',
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date(),
      credits: 0
    },
    {
      id: '3',
      username: 'demo_user',
      email: 'demo@legeclair.com',
      firstName: 'Demo',
      lastName: 'User',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: 'user',
      createdAt: new Date('2024-01-20'),
      lastLoginAt: new Date(),
      credits: 5
    }
  ]

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`
  })
  const userInitials = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName[0]}${user.value.lastName[0]}`
  })

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication logic
      const foundUser = mockUsers.find(u => u.email === credentials.email)
      
      if (!foundUser) {
        throw new Error('Invalid email or password')
      }

      // Mock password validation (in real app, this would be server-side)
      const mockPassword = 'password123' // All mock users have this password
      if (credentials.password !== mockPassword) {
        throw new Error('Invalid email or password')
      }

      // Update last login
      foundUser.lastLoginAt = new Date()

      // Set user and authentication state
      user.value = foundUser
      isAuthenticated.value = true
      sessionToken.value = `mock_token_${Date.now()}`

      // Store in localStorage if remember is true
      if (credentials.remember) {
        localStorage.setItem('legeclair_user', JSON.stringify(foundUser))
        localStorage.setItem('legeclair_token', sessionToken.value)
      } else {
        sessionStorage.setItem('legeclair_user', JSON.stringify(foundUser))
        sessionStorage.setItem('legeclair_token', sessionToken.value)
      }

      console.log('Mock login successful:', foundUser.email)
      return true

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('Login error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email || u.username === userData.username)
      if (existingUser) {
        throw new Error('User with this email or username already exists')
      }

      // Create new user
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: `https://i.pravatar.cc/150?img=${mockUsers.length + 1}`,
        role: 'user',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        credits: 0 // Assuming default credits
      }

      // Add to mock users (in real app, this would be saved to database)
      mockUsers.push(newUser)

      // Auto-login after registration
      user.value = newUser
      isAuthenticated.value = true
      sessionToken.value = `mock_token_${Date.now()}`

      // Store in session storage
      sessionStorage.setItem('legeclair_user', JSON.stringify(newUser))
      sessionStorage.setItem('legeclair_token', sessionToken.value)

      console.log('Mock registration successful:', newUser.email)
      return true

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      console.error('Registration error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    sessionToken.value = null
    error.value = null

    // Clear storage
    localStorage.removeItem('legeclair_user')
    localStorage.removeItem('legeclair_token')
    sessionStorage.removeItem('legeclair_user')
    sessionStorage.removeItem('legeclair_token')

    console.log('Mock logout successful')
  }

  const checkAuth = () => {
    // Check for existing session
    const storedUser = localStorage.getItem('legeclair_user') || sessionStorage.getItem('legeclair_user')
    const storedToken = localStorage.getItem('legeclair_token') || sessionStorage.getItem('legeclair_token')

    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
        sessionToken.value = storedToken
        if (user.value) {
          console.log('Session restored for:', user.value.email)
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err)
        logout()
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  const mockQuickLogin = (userIndex: number = 0) => {
    if (userIndex >= 0 && userIndex < mockUsers.length) {
      const mockUser = mockUsers[userIndex]
      user.value = mockUser
      isAuthenticated.value = true
      sessionToken.value = `mock_token_${Date.now()}`
      
      // Store in session storage
      sessionStorage.setItem('legeclair_user', JSON.stringify(mockUser))
      sessionStorage.setItem('legeclair_token', sessionToken.value)
      
      console.log('Quick mock login as:', mockUser.email)
      return true
    }
    return false
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    sessionToken,
    
    // Getters
    isAdmin,
    userFullName,
    userInitials,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    clearError,
    mockQuickLogin
  }
})
