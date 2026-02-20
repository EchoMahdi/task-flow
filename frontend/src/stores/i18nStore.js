/**
 * ============================================================================
 * I18n Store - Zustand
 * ============================================================================
 * 
 * Centralized internationalization state management using Zustand.
 * Handles language selection, translations, RTL/LTR direction, and locale persistence.
 * 
 * Features:
 * - Language state management
 * - Translation loading and caching
 * - RTL/LTR direction handling
 * - Backend synchronization for authenticated users
 * - Font family management based on locale
 * 
 * @example
 * // Basic usage
 * const { language, t, changeLanguage, isRTL } = useI18nStore()
 * 
 * // With selectors
 * const language = useI18nStore(state => state.language)
 * const t = useI18nStore(state => state.t)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getCurrentLanguage,
  setLanguage as setLanguageStorage,
  getDirection,
  getFontFamily,
  loadTranslations,
  translate,
  isRTL,
  getSupportedLanguages,
} from '@/services/i18nService'

/**
 * Apply language changes to the document
 * @param {string} language - Language code
 */
function applyLanguageToDocument(language) {
  if (typeof document === 'undefined') return

  const direction = getDirection(language)
  const fontFamily = getFontFamily(language)

  // Set HTML attributes
  document.documentElement.lang = language
  document.documentElement.dir = direction

  // Apply font family to body
  document.body.style.fontFamily = fontFamily

  // Update RTL/LTR classes on body
  if (direction === 'rtl') {
    document.body.classList.add('rtl')
    document.body.classList.remove('ltr')
  } else {
    document.body.classList.add('ltr')
    document.body.classList.remove('rtl')
  }
}

/**
 * API service for user locale preferences
 */
const preferenceApi = {
  async getLocale() {
    const token = localStorage.getItem('auth_token')
    if (!token) return null

    try {
      const response = await fetch('/api/user/theme', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': localStorage.getItem('app_language') || 'en',
        },
      })

      if (!response.ok) {
        if (response.status === 401) return null
        throw new Error('Failed to fetch theme settings')
      }

      const data = await response.json()
      return data.locale || null
    } catch (error) {
      console.warn('Could not fetch locale from backend:', error)
      return null
    }
  },

  async updateLocale(locale) {
    const token = localStorage.getItem('auth_token')
    if (!token) return false

    try {
      const response = await fetch('/api/user/theme/locale', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': localStorage.getItem('app_language') || 'en',
        },
        body: JSON.stringify({ locale }),
      })

      if (!response.ok) {
        if (response.status === 401) return false
        throw new Error('Failed to update locale')
      }

      return true
    } catch (error) {
      console.warn('Could not sync locale to backend:', error)
      return false
    }
  },
}

/**
 * Initial state for the i18n store
 */
const getInitialState = () => {
  const language = getCurrentLanguage()
  return {
    language,
    translations: loadTranslations(language),
    direction: getDirection(language),
    isLoading: false,
    error: null,
    supportedLanguages: getSupportedLanguages(),
  }
}

/**
 * I18n Store
 * Manages all internationalization-related state and actions
 */
export const useI18nStore = create(
  persist(
    (set, get) => ({
      ...getInitialState(),

      /**
       * Initialize language from backend preference
       * Called on app startup for authenticated users
       */
      initialize: async () => {
        set({ isLoading: true, error: null })

        try {
          // Try to get locale from backend for authenticated users
          const backendLocale = await preferenceApi.getLocale()

          if (backendLocale) {
            // Use backend preference
            setLanguageStorage(backendLocale)
            set({
              language: backendLocale,
              translations: loadTranslations(backendLocale),
              direction: getDirection(backendLocale),
              isLoading: false,
            })
            applyLanguageToDocument(backendLocale)
          } else {
            // Use localStorage or default
            const storedLang = getCurrentLanguage()
            set({
              language: storedLang,
              translations: loadTranslations(storedLang),
              direction: getDirection(storedLang),
              isLoading: false,
            })
            applyLanguageToDocument(storedLang)
          }
        } catch (error) {
          console.warn('Error initializing language:', error)
          // Fallback to localStorage
          const storedLang = getCurrentLanguage()
          set({
            language: storedLang,
            translations: loadTranslations(storedLang),
            direction: getDirection(storedLang),
            isLoading: false,
          })
          applyLanguageToDocument(storedLang)
        }
      },

      /**
       * Change the current language
       * Updates local state, localStorage, and syncs with backend
       * 
       * @param {string} newLang - Language code (e.g., 'en', 'fa')
       * @returns {Promise<boolean>} Whether the change was successful
       */
      changeLanguage: async (newLang) => {
        if (!newLang) {
          console.warn(`Invalid language code: ${newLang}`)
          return false
        }

        const { language } = get()
        if (language === newLang) {
          return true // Already using this language
        }

        set({ isLoading: true, error: null })

        try {
          // Sync with backend
          const success = await preferenceApi.updateLocale(newLang)
          
          if (success) {
            // Update local storage
            setLanguageStorage(newLang)
            
            // Update state
            set({
              language: newLang,
              translations: loadTranslations(newLang),
              direction: getDirection(newLang),
              isLoading: false,
            })
            
            // Apply to document
            applyLanguageToDocument(newLang)
            
            return true
          } else {
            console.warn('Failed to sync language preference with backend')
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          console.error('Error syncing language to backend:', error)
          set({
            error: 'Failed to save language preference',
            isLoading: false,
          })
          return false
        }
      },

      /**
       * Get translation for a key
       * 
       * @param {string} key - Dot-notation key (e.g., 'app.name')
       * @param {Object} params - Optional parameters for interpolation
       * @returns {string} Translated string
       */
      t: (key, params = {}) => {
        const { language } = get()
        return translate(key, language, params)
      },

      /**
       * Check if current language is RTL
       * @returns {boolean}
       */
      isRtl: () => {
        const { language } = get()
        return isRTL(language)
      },

      /**
       * Get font family for current language
       * @returns {string}
       */
      getFontFamily: () => {
        const { language } = get()
        return getFontFamily(language)
      },

      /**
       * Get supported languages
       * @returns {Array}
       */
      getLanguages: () => {
        return getSupportedLanguages()
      },

      /**
       * Set language directly without backend sync
       * Useful for offline scenarios
       * 
       * @param {string} newLang - Language code
       */
      setLanguage: (newLang) => {
        setLanguageStorage(newLang)
        set({
          language: newLang,
          translations: loadTranslations(newLang),
          direction: getDirection(newLang),
        })
        applyLanguageToDocument(newLang)
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        const initialState = getInitialState()
        set(initialState)
        applyLanguageToDocument(initialState.language)
      },
    }),
    {
      name: 'i18n-store',
      // Persist language preference
      partialize: (state) => ({
        language: state.language,
      }),
      // Apply language after rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          applyLanguageToDocument(state.language)
        }
      },
    }
  )
)

// ============================================================================
// Selectors for optimized component subscriptions
// ============================================================================

/**
 * Selector for current language only
 */
export const useLanguage = () => useI18nStore((state) => state.language)

/**
 * Selector for translation function
 */
export const useTranslation = () => {
  const language = useI18nStore((state) => state.language)
  const translations = useI18nStore((state) => state.translations)
  
  return {
    t: (key, params = {}) => translate(key, language, params),
    language,
    translations,
    direction: getDirection(language),
  }
}

/**
 * Selector for direction only
 */
export const useDirection = () => useI18nStore((state) => state.direction)

/**
 * Selector for RTL status
 */
export const useIsRTL = () => useI18nStore((state) => isRTL(state.language))

/**
 * Selector for i18n actions
 */
export const useI18nActions = () => useI18nStore((state) => ({
  changeLanguage: state.changeLanguage,
  setLanguage: state.setLanguage,
  initialize: state.initialize,
  clearError: state.clearError,
  reset: state.reset,
}))

export default useI18nStore
