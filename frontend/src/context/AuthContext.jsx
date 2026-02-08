import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, initCsrf } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check authentication status and initialize CSRF on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // First, initialize CSRF protection for Laravel Sanctum
        await initCsrf()
        
        // Then check auth status
        const userData = await authService.getUser()
        setUser(userData)
      } catch (err) {
        console.warn('Auth initialization failed:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const checkAuth = async () => {
    setLoading(true)
    try {
      await initCsrf() // Re-initialize CSRF
      const userData = await authService.getUser()
      setUser(userData)
    } catch (err) {
      console.warn('Auth check failed:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      // Ensure CSRF is initialized before login
      await initCsrf()
      const response = await authService.login(email, password)
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.response?.data?.message || 
                     err.response?.data?.error || 
                     'Login failed. Please check your credentials.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, passwordConfirmation) => {
    setError(null)
    setLoading(true)
    try {
      // Ensure CSRF is initialized before registration
      await initCsrf()
      const response = await authService.register(name, email, password, passwordConfirmation)
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.response?.data?.message || 
                     err.response?.data?.error || 
                     'Registration failed. Please try again.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
    } catch (err) {
      console.warn('Logout error:', err)
    } finally {
      setUser(null)
      setLoading(false)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getUser()
      setUser(userData)
    } catch (err) {
      console.warn('Failed to refresh user:', err)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error,
        login, 
        register, 
        logout,
        refreshUser,
        clearError,
        isAuthenticated: !!user,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
