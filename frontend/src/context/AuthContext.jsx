// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // DEBUG: Log provider initialization
  console.log('[AuthContext] AuthProvider initialized, waiting for auth check...')

  useEffect(() => {
    let cancelled = false

    authService.getUser()
      .then((userData) => {
        if (!cancelled) setUser(userData)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

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
      const message = err.response?.data?.message || 'Login failed.'
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
      const response = await authService.register(
        name, email, password, passwordConfirmation
      )
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.'
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
  // DEBUG: Log where useAuth is being called from
  // console.log('[AuthContext] useAuth called, context exists:', !!context) // Commented out - working now
  if (!context) {
    console.error('[AuthContext] useAuth called without AuthProvider! Call stack:', new Error().stack)
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}