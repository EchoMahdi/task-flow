import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getCurrentLanguage,
  setLanguage as setLanguageStorage,
  getDirection,
  getFontFamily,
  loadTranslations,
  translate,
  isRTL,
  getSupportedLanguages
} from '../services/i18nService'

/**
 * I18n Context - Manages language state and provides translation functions
 */
const I18nContext = createContext(null)

/**
 * I18n Provider Component
 * Wraps the app and provides language context to all components
 */
export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getCurrentLanguage)
  const [translations, setTranslations] = useState(loadTranslations(getCurrentLanguage()))
  const [direction, setDirection] = useState(getDirection(getCurrentLanguage()))

  // Update translations when language changes
  useEffect(() => {
    const newLang = getCurrentLanguage()
    setLanguageState(newLang)
    setTranslations(loadTranslations(newLang))
    setDirection(getDirection(newLang))
  }, [])

  // Set language direction on document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
      document.documentElement.dir = direction
    }
  }, [language, direction])

  /**
   * Change the current language
   * @param {string} newLang - Language code ('en' or 'fa')
   */
  const changeLanguage = useCallback((newLang) => {
    if (newLang && (newLang === 'en' || newLang === 'fa')) {
      setLanguageStorage(newLang)
      setLanguageState(newLang)
      setTranslations(loadTranslations(newLang))
      setDirection(getDirection(newLang))
    }
  }, [])

  /**
   * Get translation for a key
   * @param {string} key - Dot-notation key (e.g., 'app.name')
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} Translated string
   */
  const t = useCallback((key, params = {}) => {
    return translate(key, language, params)
  }, [language])

  /**
   * Check if current language is RTL
   * @returns {boolean}
   */
  const isRtl = useCallback(() => {
    return isRTL(language)
  }, [language])

  /**
   * Get font family for current language
   * @returns {string}
   */
  const getFontFamilyForCurrentLang = useCallback(() => {
    return getFontFamily(language)
  }, [language])

  /**
   * Get supported languages
   * @returns {Array}
   */
  const getLanguages = useCallback(() => {
    return getSupportedLanguages()
  }, [])

  const value = {
    language,
    translations,
    direction,
    changeLanguage,
    t,
    isRtl,
    getFontFamily: getFontFamilyForCurrentLang,
    getLanguages,
    isRTL: isRTL(language),
    supportedLanguages: ['en', 'fa']
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * Hook to use i18n context
 * @returns {Object} I18n context object
 */
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

/**
 * Hook to use translation function
 * @returns {Function} Translation function
 */
export function useTranslation() {
  const { t, language, translations, direction } = useI18n()
  return { t, language, translations, direction }
}

export default I18nContext
