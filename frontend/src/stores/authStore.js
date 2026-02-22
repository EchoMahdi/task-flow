/**
 * ============================================================================
 * Auth Store - Zustand
 * ============================================================================
 * 
 * Centralized authentication state management using Zustand.
 * Handles user authentication, login, logout, registration, and session management.
 * 
 * Features:
 * - User authentication state
 * - Login/logout/register actions
 * - Loading and error states
 * - Session persistence
 * - CSRF initialization
 * 
 * @example
 * // Basic usage
 * const { user, login, logout, isAuthenticated } = useAuthStore()
 * 
 * // With selectors for optimized re-renders
 * const user = useAuthStore(state => state.user)
 * const isAuthenticated = useAuthStore(state => state.isAuthenticated)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { authService, initCsrf } from '@/services/authService'

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {Object} [preferences] - User preferences
 * @property {Object} [profile] - User profile data
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user - Current authenticated user
 * @property {boolean} loading - Loading state for auth operations
 * @property {boolean} initializing - True during initial auth check
 * @property {string|null} error - Error message from last auth operation
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {Function} login - Login action
 * @property {Function} logout - Logout action
 * @property {Function} register - Register action
 * @property {Function} forgotPassword - Forgot password action
 * @property {Function} resetPassword - Reset password action
 * @property {Function} refreshUser - Refresh user data from server
 * @property {Function} setUser - Set user directly
 * @property {Function} clearError - Clear error state
 * @property {Function} initialize - Initialize auth state
 */

/**
 * Initial state for the auth store
 */
const initialState = {
  user: null,
  loading: false,
  initializing: true,
  error: null,
  isAuthenticated: false,
}

/**
 * Initialization guard - prevents duplicate initialization calls
 * This promise is shared across all calls to initialize()
 */
let initializationPromise = null

/**
 * Auth Store
 * Manages all authentication-related state and actions
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Initialize authentication state
       * Called on app startup to check if user is already authenticated
       * 
       * GUARD: Returns existing promise if initialization is already in progress
       * This prevents duplicate API calls from multiple sources
       */
      initialize: async () => {
        const state = get()
        
        // If already initialized (not initializing), return immediately
        if (!state.initializing && state.user !== undefined) {
          return
        }
        
        // If initialization is in progress, return the existing promise
        if (initializationPromise) {
          return initializationPromise
        }
        
        
        // Create and store the initialization promise
        initializationPromise = (async () => {
          set({ initializing: true, loading: true })
          
          try {
            // Initialize CSRF protection
            await initCsrf()
            
            // Check if user is authenticated
            const userData = await authService.getUser()
            
            set({
              user: userData,
              isAuthenticated: !!userData,
              initializing: false,
              loading: false,
              error: null,
            })
            
          } catch (error) {
            
            set({
              user: null,
              isAuthenticated: false,
              initializing: false,
              loading: false,
            })
          } finally {
            // Clear the promise so future calls can re-initialize if needed
            initializationPromise = null
          }
        })()
        
        return initializationPromise
      },

      /**
       * Login action
       * Authenticates user with email and password
       * 
       * @param {string} email - User's email
       * @param {string} password - User's password
       * @returns {Promise<Object>} Login response
       * @throws {Error} If login fails
       */
      login: async (email, password) => {
        set({ loading: true, error: null })
        
        try {
          const response = await authService.login(email, password)
          
          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          })
          
          return response
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Login failed.'
          
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: message,
          })
          
          throw error
        }
      },

      /**
       * Register action
       * Creates a new user account
       * 
       * @param {string} name - User's full name
       * @param {string} email - User's email
       * @param {string} password - User's password
       * @param {string} passwordConfirmation - Password confirmation
       * @returns {Promise<Object>} Registration response
       * @throws {Error} If registration fails
       */
      register: async (name, email, password, passwordConfirmation) => {
        set({ loading: true, error: null })
        
        try {
          const response = await authService.register(name, email, password, passwordConfirmation)
          
          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          })
          
          return response
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Registration failed.'
          
          set({
            loading: false,
            error: message,
          })
          
          throw error
        }
      },

      /**
       * Forgot Password action
       * Sends a password reset link to the user's email
       * 
       * @param {string} email - User's email address
       * @returns {Promise<Object>} Forgot password response
       * @throws {Error} If request fails
       */
      forgotPassword: async (email) => {
        set({ loading: true, error: null })
        
        try {
          // Initialize CSRF protection
          await initCsrf()
          
          const response = await authService.forgotPassword(email)
          
          set({
            loading: false,
            error: null,
          })
          
          return response
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to send reset link.'
          
          set({
            loading: false,
            error: message,
          })
          
          throw error
        }
      },

      /**
       * Reset Password action
       * Resets the user's password using the token from the email
       * 
       * @param {string} token - Password reset token
       * @param {string} password - New password
       * @param {string} passwordConfirmation - Password confirmation
       * @returns {Promise<Object>} Reset password response
       * @throws {Error} If reset fails
       */
      resetPassword: async (token, password, passwordConfirmation) => {
        set({ loading: true, error: null })
        
        try {
          // Initialize CSRF protection
          await initCsrf()
          
          const response = await authService.resetPassword(token, password, passwordConfirmation)
          
          set({
            loading: false,
            error: null,
          })
          
          return response
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to reset password.'
          
          set({
            loading: false,
            error: message,
          })
          
          throw error
        }
      },

      /**
       * Logout action
       * Ends the user's session
       */
      logout: async () => {
        set({ loading: true })
        
        try {
          await authService.logout()
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error)
        } finally {
          this.reset()
        }
      },

      /**
       * Refresh user data from server
       * Updates the user state with fresh data from the API
       */
      refreshUser: async () => {
        try {
          const userData = await authService.getUser()
          
          set({
            user: userData,
            isAuthenticated: !!userData,
          })
        } catch (error) {
          console.warn('Failed to refresh user:', error)
          // Don't change auth state on refresh failure
        }
      },

      /**
       * Set user directly
       * Useful for updating user data after profile changes
       * 
       * @param {User|null} user - User object or null
       */
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      /**
       * Update user profile data
       * Merges new data with existing user
       * 
       * @param {Object} updates - Partial user updates
       */
      updateUser: (updates) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...updates },
          })
        }
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * Reset store to initial state
       * Useful for testing or complete logout
       */
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'auth-store',
      // Only persist user data, not loading/error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Rehydrate after loading from storage
      onRehydrateStorage: () => (state) => {
        // Mark initialization as needed
        if (state) {
          state.initializing = true
        }
      },
    }
  )
)

// ============================================================================
// Selectors for optimized component subscriptions
// ============================================================================

/**
 * Selector for user data only
 * Prevents re-renders when other auth state changes
 */
export const useUser = () => useAuthStore((state) => state.user)

/**
 * Selector for authentication status only
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)

/**
 * Selector for loading state only
 */
export const useAuthLoading = () => useAuthStore((state) => state.loading)

/**
 * Selector for auth error only
 */
export const useAuthError = () => useAuthStore((state) => state.error)

/**
 * Selector for auth actions
 * Returns stable action references
 * Uses useShallow to prevent infinite loops from new object references
 */
export const useAuthActions = () => useAuthStore(
  useShallow((state) => ({
    login: state.login,
    logout: state.logout,
    register: state.register,
    forgotPassword: state.forgotPassword,
    resetPassword: state.resetPassword,
    refreshUser: state.refreshUser,
    setUser: state.setUser,
    updateUser: state.updateUser,
    clearError: state.clearError,
    initialize: state.initialize,
  }))
)

export default useAuthStore
