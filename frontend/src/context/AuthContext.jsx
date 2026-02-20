// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, initCsrf } from '@/services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    // Initialize CSRF and check user on mount
    const initAuth = async () => {
      await initCsrf();
      try {
        const userData = await authService.getUser()
        if (!cancelled) setUser(userData)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initAuth()

    return () => { cancelled = true }
  }, [])

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed.'
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
      const response = await authService.register(name, email, password, passwordConfirmation)
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed.'
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
    } finally {
      setUser(null)
      setLoading(false)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getUser()
      setUser(userData)
    } catch {
      console.warn('Failed to refresh user')
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    console.error('[AuthContext] useAuth called without AuthProvider! Call stack:', new Error().stack)
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
