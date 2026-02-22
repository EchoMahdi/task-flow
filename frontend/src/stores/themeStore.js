/**
 * ============================================================================
 * Theme Store - Zustand
 * ============================================================================
 * 
 * Centralized theme state management using Zustand.
 * Handles theme mode (light/dark/system), accessibility preferences, and theme persistence.
 * 
 * Features:
 * - Theme mode management (light, dark, system)
 * - Accessibility preferences (reduced motion, high contrast, font scale)
 * - Theme persistence (localStorage + API)
 * - System preference detection
 * - Locale-based font switching
 * 
 * @example
 * // Basic usage
 * const { mode, resolvedMode, setThemeMode, toggleThemeMode } = useThemeStore()
 * 
 * // With selectors
 * const isDark = useThemeStore(state => state.resolvedMode === 'dark')
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getColors, getFontFamily, fonts, breakpoints } from '@/theme/tokens'
import { api } from '@/services/authService'

// ============================================================================
// Constants
// ============================================================================

const THEME_MODE_KEY = 'app_theme_mode'
const THEME_PREFERENCES_KEY = 'app_theme_preferences'
const DEFAULT_THEME_MODE = 'system'
const DEFAULT_LOCALE = 'en'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if system prefers dark mode
 */
const systemPrefersDark = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

/**
 * Get resolved mode from theme mode
 * @param {string} mode - Theme mode (light, dark, system)
 * @returns {string} Resolved mode (light or dark)
 */
const getResolvedMode = (mode) => {
  if (mode === 'system') {
    return systemPrefersDark() ? 'dark' : 'light'
  }
  return mode
}

/**
 * Apply theme to document
 * @param {string} resolvedMode - Resolved theme mode
 */
const applyThemeToDocument = (resolvedMode) => {
  if (typeof document === 'undefined') return

  // Update body class
  document.body.classList.remove('theme-light', 'theme-dark')
  document.body.classList.add(`theme-${resolvedMode}`)

  // Update color scheme
  document.documentElement.style.colorScheme = resolvedMode
}

/**
 * Get default preferences
 */
const getDefaultPreferences = () => ({
  reducedMotion: false,
  highContrast: false,
  fontScale: 1,
})

/**
 * Load preferences from localStorage
 */
const loadPreferences = () => {
  if (typeof window === 'undefined') return getDefaultPreferences()
  
  const saved = localStorage.getItem(THEME_PREFERENCES_KEY)
  if (saved) {
    try {
      return { ...getDefaultPreferences(), ...JSON.parse(saved) }
    } catch {
      return getDefaultPreferences()
    }
  }
  return getDefaultPreferences()
}

// ============================================================================
// Initial State
// ============================================================================

const getInitialState = () => {
  const mode = typeof window !== 'undefined' 
    ? localStorage.getItem(THEME_MODE_KEY) || DEFAULT_THEME_MODE
    : DEFAULT_THEME_MODE
  
  return {
    mode,
    resolvedMode: getResolvedMode(mode),
    locale: typeof window !== 'undefined'
      ? localStorage.getItem('app_locale') || DEFAULT_LOCALE
      : DEFAULT_LOCALE,
    preferences: loadPreferences(),
    isLoading: false,
    error: null,
  }
}

// ============================================================================
// Theme Store
// ============================================================================

export const useThemeStore = create(
  persist(
    (set, get) => ({
      ...getInitialState(),

      /**
       * Initialize theme store
       * Sets up system preference listener and applies theme
       */
      initialize: () => {
        const { mode, preferences } = get()
        const resolvedMode = getResolvedMode(mode)
        
        // Apply theme
        applyThemeToDocument(resolvedMode)
        
        // Apply accessibility preferences
        if (preferences.reducedMotion) {
          document.body.classList.add('reduced-motion')
        }
        if (preferences.highContrast) {
          document.body.classList.add('high-contrast')
        }
        if (preferences.fontScale !== 1) {
          document.documentElement.style.fontSize = `${preferences.fontScale * 100}%`
        }

        // Listen for system preference changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          
          const handleChange = (e) => {
            const { mode } = get()
            if (mode === 'system') {
              const newResolvedMode = e.matches ? 'dark' : 'light'
              set({ resolvedMode: newResolvedMode })
              applyThemeToDocument(newResolvedMode)
            }
          }

          mediaQuery.addEventListener('change', handleChange)
          
          // Return cleanup function
          return () => mediaQuery.removeEventListener('change', handleChange)
        }
      },

      /**
       * Set theme mode
       * @param {string} newMode - Theme mode (light, dark, system)
       */
      setThemeMode: async (newMode) => {
        const resolvedMode = getResolvedMode(newMode)
        
        set({
          mode: newMode,
          resolvedMode,
          isLoading: true,
        })
        
        // Apply theme
        applyThemeToDocument(resolvedMode)
        
        // Persist to localStorage
        localStorage.setItem(THEME_MODE_KEY, newMode)
        
        // Sync with backend if authenticated
        try {
          const token = localStorage.getItem('auth_token')
          if (token) {
            await api.put('/api/user/theme/mode', { theme_mode: newMode })
          }
        } catch (error) {
          console.warn('Failed to sync theme mode with backend:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * Toggle between light and dark mode
       */
      toggleThemeMode: () => {
        const { resolvedMode } = get()
        const newMode = resolvedMode === 'dark' ? 'light' : 'dark'
        get().setThemeMode(newMode)
      },

      /**
       * Set reduced motion preference
       * @param {boolean} value - Whether to reduce motion
       */
      setReducedMotion: async (value) => {
        const { preferences } = get()
        const newPreferences = { ...preferences, reducedMotion: value }
        
        set({ preferences: newPreferences })
        localStorage.setItem(THEME_PREFERENCES_KEY, JSON.stringify(newPreferences))
        
        // Apply to document
        if (value) {
          document.body.classList.add('reduced-motion')
        } else {
          document.body.classList.remove('reduced-motion')
        }
        
        // Sync with backend
        try {
          const token = localStorage.getItem('auth_token')
          if (token) {
            await api.put('/api/user/theme/accessibility', { reduced_motion: value })
          }
        } catch (error) {
          console.warn('Failed to sync reduced motion preference:', error)
        }
      },

      /**
       * Set high contrast preference
       * @param {boolean} value - Whether to use high contrast
       */
      setHighContrast: async (value) => {
        const { preferences } = get()
        const newPreferences = { ...preferences, highContrast: value }
        
        set({ preferences: newPreferences })
        localStorage.setItem(THEME_PREFERENCES_KEY, JSON.stringify(newPreferences))
        
        // Apply to document
        if (value) {
          document.body.classList.add('high-contrast')
        } else {
          document.body.classList.remove('high-contrast')
        }
        
        // Sync with backend
        try {
          const token = localStorage.getItem('auth_token')
          if (token) {
            await api.put('/api/user/theme/accessibility', { high_contrast: value })
          }
        } catch (error) {
          console.warn('Failed to sync high contrast preference:', error)
        }
      },

      /**
       * Set font scale preference
       * @param {number} scale - Font scale multiplier (0.8 - 1.5)
       */
      setFontScale: async (scale) => {
        const clampedScale = Math.max(0.8, Math.min(1.5, scale))
        const { preferences } = get()
        const newPreferences = { ...preferences, fontScale: clampedScale }
        
        set({ preferences: newPreferences })
        localStorage.setItem(THEME_PREFERENCES_KEY, JSON.stringify(newPreferences))
        
        // Apply to document
        document.documentElement.style.fontSize = `${clampedScale * 100}%`
        
        // Sync with backend
        try {
          const token = localStorage.getItem('auth_token')
          if (token) {
            await api.put('/api/user/theme/accessibility', { font_scale: clampedScale })
          }
        } catch (error) {
          console.warn('Failed to sync font scale preference:', error)
        }
      },

      /**
       * Set locale for font switching
       * @param {string} locale - Locale code
       */
      setLocale: (locale) => {
        set({ locale })
        localStorage.setItem('app_locale', locale)
      },

      /**
       * Get current color palette
       * @returns {Object} Color palette
       */
      getColors: () => {
        const { resolvedMode } = get()
        return getColors(resolvedMode)
      },

      /**
       * Get current font family
       * @returns {Object} Font family configuration
       */
      getFontFamily: () => {
        const { locale } = get()
        return {
          primary: getFontFamily(locale),
          mono: fonts.mono,
        }
      },

      /**
       * Load theme from backend
       */
      loadFromBackend: async () => {
        try {
          set({ isLoading: true })
          
          const token = localStorage.getItem('auth_token')
          if (!token) {
            set({ isLoading: false })
            return
          }

          const response = await api.get('/api/user/theme')
          const { theme_mode, reduced_motion, high_contrast, font_scale, locale } = response.data
          
          const updates = {}
          
          if (theme_mode) {
            updates.mode = theme_mode
            updates.resolvedMode = getResolvedMode(theme_mode)
            localStorage.setItem(THEME_MODE_KEY, theme_mode)
          }
          
          if (locale) {
            updates.locale = locale
            localStorage.setItem('app_locale', locale)
          }
          
          const newPreferences = {}
          if (reduced_motion !== undefined) newPreferences.reducedMotion = reduced_motion
          if (high_contrast !== undefined) newPreferences.highContrast = high_contrast
          if (font_scale !== undefined) newPreferences.fontScale = font_scale
          
          if (Object.keys(newPreferences).length > 0) {
            updates.preferences = { ...get().preferences, ...newPreferences }
            localStorage.setItem(THEME_PREFERENCES_KEY, JSON.stringify(updates.preferences))
          }
          
          set({ ...updates, isLoading: false })
          
          // Apply theme
          if (updates.resolvedMode) {
            applyThemeToDocument(updates.resolvedMode)
          }
        } catch (error) {
          console.warn('Failed to load theme from backend:', error)
          set({ isLoading: false })
        }
      },

      /**
       * Reset theme to defaults
       */
      reset: () => {
        const initialState = getInitialState()
        set(initialState)
        localStorage.setItem(THEME_MODE_KEY, initialState.mode)
        localStorage.setItem(THEME_PREFERENCES_KEY, JSON.stringify(initialState.preferences))
        applyThemeToDocument(initialState.resolvedMode)
      },
    }),
    {
      name: 'theme-store',
      partialize: (state) => ({
        mode: state.mode,
        preferences: state.preferences,
        locale: state.locale,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.resolvedMode = getResolvedMode(state.mode)
        }
      },
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selector for theme mode
 */
export const useThemeMode = () => useThemeStore((state) => ({
  mode: state.mode,
  resolvedMode: state.resolvedMode,
  setThemeMode: state.setThemeMode,
  toggleThemeMode: state.toggleThemeMode,
  isDark: state.resolvedMode === 'dark',
  isLight: state.resolvedMode === 'light',
  isSystem: state.mode === 'system',
}))

/**
 * Selector for dark mode status
 */
export const useIsDarkMode = () => useThemeStore((state) => state.resolvedMode === 'dark')

/**
 * Selector for accessibility preferences
 */
export const useAccessibility = () => useThemeStore((state) => ({
  ...state.preferences,
  setReducedMotion: state.setReducedMotion,
  setHighContrast: state.setHighContrast,
  setFontScale: state.setFontScale,
}))

/**
 * Selector for colors
 */
export const useColors = () => useThemeStore((state) => getColors(state.resolvedMode))

/**
 * Selector for theme actions
 */
export const useThemeActions = () =>
  useThemeStore(
    useShallow((state) => ({
      setThemeMode: state.setThemeMode,
      toggleThemeMode: state.toggleThemeMode,
      setReducedMotion: state.setReducedMotion,
      setHighContrast: state.setHighContrast,
      setFontScale: state.setFontScale,
      setLocale: state.setLocale,
      initialize: state.initialize,
      loadFromBackend: state.loadFromBackend,
      reset: state.reset,
    }))
  )
export default useThemeStore
