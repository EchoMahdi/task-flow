/**
 * I18nContext - Backward Compatibility Layer
 * 
 * This file provides a compatibility layer for components using the old useI18n and useTranslation hooks.
 * New code should import directly from '@/stores/i18nStore'
 * 
 * @deprecated Import from '@/stores/i18nStore' instead
 */

import { useI18nStore } from '@/stores/i18nStore'
import { translate, getDirection, getFontFamily, isRTL, getSupportedLanguages } from '@/services/i18nService'

/**
 * useI18n hook - Backward compatible with old I18nContext
 * Returns an object with all i18n properties and methods
 */
export function useI18n() {
  const language = useI18nStore((state) => state.language)
  const translations = useI18nStore((state) => state.translations)
  const direction = useI18nStore((state) => state.direction)
  const isLoading = useI18nStore((state) => state.isLoading)
  const error = useI18nStore((state) => state.error)
  const changeLanguage = useI18nStore((state) => state.changeLanguage)
  
  return {
    language,
    translations,
    direction,
    isLoading,
    error,
    changeLanguage,
    t: (key, params = {}) => translate(key, language, params),
    isRtl: () => isRTL(language),
    getFontFamily: () => getFontFamily(language),
    getLanguages: () => getSupportedLanguages(),
    isRTL: isRTL(language),
    supportedLanguages: ['en', 'fa'],
  }
}

/**
 * useTranslation hook - Backward compatible with old I18nContext
 * Returns translation helper with t function
 */
export function useTranslation() {
  const language = useI18nStore((state) => state.language)
  const translations = useI18nStore((state) => state.translations)
  const direction = useI18nStore((state) => state.direction)
  
  return {
    t: (key, params = {}) => translate(key, language, params),
    language,
    translations,
    direction,
    i18n: {
      language,
      changeLanguage: useI18nStore.getState().changeLanguage,
    },
  }
}

// Re-export individual hooks for new code
export { 
  useI18nStore,
  useLanguage,
  useDirection,
  useIsRTL,
  useI18nActions
} from '@/stores/i18nStore'

// Provider is no longer needed - Zustand works without providers
export const I18nProvider = ({ children }) => children

export default useI18n
