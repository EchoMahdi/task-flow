/**
 * AuthContext - Backward Compatibility Layer
 * 
 * This file provides a compatibility layer for components using the old useAuth hook.
 * New code should import directly from '@/stores/authStore'
 * 
 * @deprecated Import from '@/stores/authStore' instead
 */

import { useAuthStore } from '@/stores/authStore'

/**
 * useAuth hook - Backward compatible with old AuthContext
 * Returns an object with all auth properties and methods
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const register = useAuthStore((state) => state.register)
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const clearError = useAuthStore((state) => state.clearError)
  
  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    refreshUser,
    clearError,
  }
}

// Re-export individual hooks for new code
export { 
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useAuthActions
} from '@/stores/authStore'

// Provider is no longer needed - Zustand works without providers
export const AuthProvider = ({ children }) => children

export default useAuth
