// Utilities
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authAPI } from "@/services/api";

// Types
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt: Date;
  lastLoginAt: Date;
  credits: number;
}

interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const useAppStore = defineStore("app", () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const sessionToken = ref<string | null>(null);

  // Mock user data for demonstration
  const mockUsers: User[] = [
    {
      id: "1",
      username: "john_doe",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
      role: "user",
      createdAt: new Date("2024-01-01"),
      lastLoginAt: new Date(),
      credits: 42,
    },
    {
      id: "2",
      username: "jane_smith",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
      role: "admin",
      createdAt: new Date("2024-01-15"),
      lastLoginAt: new Date(),
      credits: 0,
    },
    {
      id: "3",
      username: "demo_user",
      email: "demo@legeclair.com",
      firstName: "Demo",
      lastName: "User",
      avatar: "https://i.pravatar.cc/150?img=3",
      role: "user",
      createdAt: new Date("2024-01-20"),
      lastLoginAt: new Date(),
      credits: 5,
    },
  ];

  // Getters
  const isAdmin = computed(() => user.value?.role === "admin");
  const userFullName = computed(() => {
    if (!user.value) {
      return "";
    }
    return `${user.value.firstName} ${user.value.lastName}`;
  });
  const userInitials = computed(() => {
    if (!user.value) {
      return "";
    }
    return `${user.value.firstName[0]}${user.value.lastName[0]}`;
  });

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authAPI.login(credentials);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // Set user and authentication state
        user.value = {
          id: userData._id,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
          role: userData.role,
          createdAt: new Date(userData.createdAt),
          lastLoginAt: new Date(userData.lastLoginAt),
          credits: userData.credits,
        };
        isAuthenticated.value = true;
        sessionToken.value = token;

        // Store in localStorage if remember is true
        if (credentials.remember) {
          localStorage.setItem("legeclair_user", JSON.stringify(user.value));
          localStorage.setItem("legeclair_token", token);
        } else {
          sessionStorage.setItem("legeclair_user", JSON.stringify(user.value));
          sessionStorage.setItem("legeclair_token", token);
        }

        console.log("Login successful:", userData.email);
        return true;
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : "Login failed";
      console.error("Login error:", error_);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authAPI.register(userData);

      if (response.success && response.data) {
        const { user: newUserData, token } = response.data;

        // Auto-login after registration
        user.value = {
          id: newUserData._id,
          username: newUserData.username,
          email: newUserData.email,
          firstName: newUserData.firstName,
          lastName: newUserData.lastName,
          avatar: newUserData.avatar,
          role: newUserData.role,
          createdAt: new Date(newUserData.createdAt),
          lastLoginAt: new Date(newUserData.lastLoginAt),
          credits: newUserData.credits,
        };
        isAuthenticated.value = true;
        sessionToken.value = token;

        // Store in session storage
        sessionStorage.setItem("legeclair_user", JSON.stringify(user.value));
        sessionStorage.setItem("legeclair_token", token);

        console.log("Registration successful:", newUserData.email);
        return true;
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : "Registration failed";
      console.error("Registration error:", error_);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
    sessionToken.value = null;
    error.value = null;

    // Clear storage
    localStorage.removeItem("legeclair_user");
    localStorage.removeItem("legeclair_token");
    sessionStorage.removeItem("legeclair_user");
    sessionStorage.removeItem("legeclair_token");

    console.log("Mock logout successful");
  };

  const checkAuth = () => {
    // Check for existing session
    const storedUser =
      localStorage.getItem("legeclair_user") ||
      sessionStorage.getItem("legeclair_user");
    const storedToken =
      localStorage.getItem("legeclair_token") ||
      sessionStorage.getItem("legeclair_token");

    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
        sessionToken.value = storedToken;
        if (user.value) {
          console.log("Session restored for:", user.value.email);
        }
      } catch (error_) {
        console.error("Error parsing stored user data:", error_);
        logout();
      }
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const mockQuickLogin = (userIndex = 0) => {
    if (userIndex >= 0 && userIndex < mockUsers.length) {
      const mockUser = mockUsers[userIndex];
      user.value = mockUser;
      isAuthenticated.value = true;
      sessionToken.value = `mock_token_${Date.now()}`;

      // Store in session storage
      sessionStorage.setItem("legeclair_user", JSON.stringify(mockUser));
      sessionStorage.setItem("legeclair_token", sessionToken.value);

      console.log("Quick mock login as:", mockUser.email);
      return true;
    }
    return false;
  };

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
    mockQuickLogin,
  };
});
