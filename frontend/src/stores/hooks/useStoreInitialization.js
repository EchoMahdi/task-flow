/**
 * ============================================================================
 * Store Initialization Hook
 * ============================================================================
 * 
 * A hook that initializes all Zustand stores on application startup.
 * This replaces the multiple Context providers that were previously used.
 * 
 * Usage:
 * Call useStoreInitialization() at the root of your app (in App.jsx or main.jsx)
 */

import { useEffect, useState } from 'react'
import { useAuthStore } from '../authStore'
import { useI18nStore } from '../i18nStore'
import { useThemeStore } from '../themeStore'
import { usePreferenceStore } from '../preferenceStore'

/**
 * Hook to initialize all stores on app startup
 * 
 * @returns {Object} Initialization state
 * @property {boolean} isInitialized - Whether all stores are initialized
 * @property {boolean} isLoading - Whether initialization is in progress
 * @property {Error|null} error - Any initialization error
 */
export const useStoreInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)
  
  // Store actions
  const initializeAuth = useAuthStore((state) => state.initialize)
  const initializeI18n = useI18nStore((state) => state.initialize)
  const initializeTheme = useThemeStore((state) => state.initialize)
  const initializePreferences = usePreferenceStore((state) => state.initialize)
  
  useEffect(() => {
    const initializeStores = async () => {
      try {
        // Initialize theme first (applies CSS variables)
        initializeTheme()
        
        // Initialize auth BEFORE i18n (i18n needs to know auth state
        // to determine whether to fetch user's locale preference)
        await initializeAuth()
        
        // Initialize i18n (sets up language based on user preference or fallback)
        await initializeI18n()
        
        // Initialize preferences (loads user preferences)
        await initializePreferences()
        
        setIsInitialized(true)
      } catch (err) {
        console.error('Store initialization error:', err)
        setError(err)
        // Still mark as initialized to prevent infinite loading
        setIsInitialized(true)
      }
    }
    
    initializeStores()
  }, [initializeAuth, initializeI18n, initializeTheme, initializePreferences])
  
  return {
    isInitialized,
    isLoading: !isInitialized,
    error,
  }
}

/**
 * Store Initialization Provider Component
 * Wraps the app and initializes all stores
 */
export const StoreInitializer = ({ children, fallback = null }) => {
  const { isInitialized, isLoading } = useStoreInitialization()
  if(isInitialized && isLoading) {
    return fallback
  }
  
  if (isLoading && fallback) {
    return fallback
  }
  
  return children
}

export default useStoreInitialization
