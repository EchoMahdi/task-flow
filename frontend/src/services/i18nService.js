import fa from '@/locales/fa.json'
import en from '@/locales/en.json'

/**
 * i18n Service - Handles internationalization and language management
 */
const translations = {
  en,
  fa
}

const defaultLanguage = 'en'
const supportedLanguages = ['en', 'fa']

/**
 * Get direction for a given language
 * @param {string} lang - Language code
 * @returns {string} 'rtl' or 'ltr'
 */
export const getDirection = (lang) => {
  return lang === 'fa' ? 'rtl' : 'ltr'
}

/**
 * Get all supported languages
 * @returns {Array} Array of language objects with code, name, nativeName, and direction
 */
export const getSupportedLanguages = () => {
  return [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English', 
      dir: 'ltr',
      flag: '🇺🇸'
    },
    { 
      code: 'fa', 
      name: 'Persian', 
      nativeName: 'فارسی', 
      dir: 'rtl',
      flag: '🇮🇷'
    }
  ]
}

/**
 * Get translation for a key
 * @param {string} key - Dot-notation key (e.g., 'app.name') or flat key (e.g., 'Login')
 * @param {string} lang - Language code
 * @param {Object} params - Optional parameters for interpolation
 * @returns {string} Translated string
 */
export const translate = (key, lang = defaultLanguage, params = {}) => {
  // DEBUG: Log translation key pattern to identify nested vs flat usage
  const isNestedKey = key.includes('.');
  if (isNestedKey) {
    console.debug(`[i18n] Nested key detected: '${key}' (should be migrated to flat key)`);
  }
  
  const langTranslations = translations[lang] || translations[defaultLanguage]
  const defaultTranslations = translations[defaultLanguage]
  
  // Get the translation using dot notation
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : null
    }, obj)
  }
  
  let translation = getNestedValue(langTranslations, key)
  
  // Fallback to default language if translation not found
  if (translation === null) {
    translation = getNestedValue(defaultTranslations, key)
  }
  
  // Return key if no translation found
  if (translation === null) {
    return key
  }
  
  // Interpolate parameters
  if (params && typeof translation === 'string') {
    Object.keys(params).forEach(param => {
      translation = translation.replace(new RegExp(`{${param}}`, 'g'), params[param])
    })
  }
  
  return translation
}

/**
 * Get current language from storage or browser
 * @returns {string} Language code
 */
export const getCurrentLanguage = () => {
  if (typeof window === 'undefined') return defaultLanguage
  
  // Check localStorage first
  const stored = localStorage.getItem('app_language')
  if (stored && supportedLanguages.includes(stored)) {
    return stored
  }
  
  // Check browser language
  const browserLang = navigator.language?.split('-')[0]
  if (browserLang && supportedLanguages.includes(browserLang)) {
    return browserLang
  }
  
  return defaultLanguage
}

/**
 * Set language in storage
 * @param {string} lang - Language code
 */
export const setLanguage = (lang) => {
  if (typeof window !== 'undefined' && supportedLanguages.includes(lang)) {
    localStorage.setItem('app_language', lang)
  }
}

/**
 * Load translations for a language
 * @param {string} lang - Language code
 * @returns {Object} Translation object
 */
export const loadTranslations = (lang = defaultLanguage) => {
  return translations[lang] || translations[defaultLanguage]
}

/**
 * Check if a language is RTL
 * @param {string} lang - Language code
 * @returns {boolean}
 */
export const isRTL = (lang) => {
  return lang === 'fa'
}

/**
 * Get font family based on language
 * @param {string} lang - Language code
 * @returns {string} Font family string
 */
export const getFontFamily = (lang) => {
    return "'Vazir', 'Tahoma', 'Arial', sans-serif"
}

export default {
  translations,
  supportedLanguages,
  defaultLanguage,
  getDirection,
  getSupportedLanguages,
  translate,
  getCurrentLanguage,
  setLanguage,
  loadTranslations,
  isRTL,
  getFontFamily
}
