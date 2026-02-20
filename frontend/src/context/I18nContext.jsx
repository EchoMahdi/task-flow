import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCurrentLanguage,
  setLanguage as setLanguageStorage,
  getDirection,
  getFontFamily,
  loadTranslations,
  translate,
  isRTL,
  getSupportedLanguages,
} from "@/services/i18nService";

/**
 * API service for user preferences
 */
const preferenceApi = {
  
  async getLocale() {
    
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      // DEBUG: Log CSRF fetch attempt      
      const response = await fetch("/api/user/theme", {
        method: 'GET',
        credentials: 'include', // Include cookies for CSRF
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Language": localStorage.getItem('app_language') || 'en',
        },
      });

      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error("Failed to fetch theme settings");
      }

      const data = await response.json();
      return data.locale || null;
    } catch (error) {
      console.warn("Could not fetch locale from backend:", error);
      return null;
    }
  },

  async updateLocale(locale) {
    const token = localStorage.getItem("auth_token");
    if (!token) return false;

    try {
      const response = await fetch("/api/user/theme/locale", {
        method: "PUT",
        credentials: 'include', // Include cookies for CSRF
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Language": localStorage.getItem('app_language') || 'en',
        },
        body: JSON.stringify({ locale }),
      });

      if (!response.ok) {
        if (response.status === 401) return false;
        throw new Error("Failed to update locale");
      }

      return true;
    } catch (error) {
      console.warn("Could not sync locale to backend:", error);
      return false;
    }
  },
};

/**
 * I18n Context - Manages language state and provides translation functions
 */
const I18nContext = createContext(null);

/**
 * Apply language changes to the document
 * @param {string} language - Language code
 */
function applyLanguageToDocument(language) {
  if (typeof document === "undefined") return;

  const direction = getDirection(language);
  const fontFamily = getFontFamily(language);

  // Set HTML attributes
  document.documentElement.lang = language;
  document.documentElement.dir = direction;

  // Apply font family to body
  document.body.style.fontFamily = fontFamily;

  // Update RTL/LTR classes on body
  if (direction === "rtl") {
    document.body.classList.add("rtl");
    document.body.classList.remove("ltr");
  } else {
    document.body.classList.add("ltr");
    document.body.classList.remove("rtl");
  }
}

/**
 * I18n Provider Component
 * Wraps the app and provides language context to all components
 *
 * Features:
 * - Global language state management
 * - Backend synchronization for authenticated users
 * - Automatic RTL/LTR and font switching
 * - LocalStorage persistence
 */
export function I18nProvider({ children }) {
  // DEBUG: Log initialization
  console.log('[I18nContext] Initializing I18nProvider...')
  const [language, setLanguageState] = useState(getCurrentLanguage());
  const [translations, setTranslations] = useState(
    loadTranslations(getCurrentLanguage()),
  );
  const [direction, setDirection] = useState(
    getDirection(getCurrentLanguage()),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to get locale from backend for authenticated users
        const backendLocale = await preferenceApi.getLocale();

        if (backendLocale) {
          // Use backend preference
          setLanguageStorage(backendLocale);
          setLanguageState(backendLocale);
          setTranslations(loadTranslations(backendLocale));
          setDirection(getDirection(backendLocale));
          applyLanguageToDocument(backendLocale);
        } else {
          // Use localStorage or default
          const storedLang = getCurrentLanguage();
          setLanguageState(storedLang);
          setTranslations(loadTranslations(storedLang));
          setDirection(getDirection(storedLang));
          applyLanguageToDocument(storedLang);
        }
      } catch (err) {
        console.warn("Error initializing language:", err);
        // Fallback to localStorage
        const storedLang = getCurrentLanguage();
        setLanguageState(storedLang);
        setTranslations(loadTranslations(storedLang));
        setDirection(getDirection(storedLang));
        applyLanguageToDocument(storedLang);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Apply direction and font when language changes
  useEffect(() => {
    applyLanguageToDocument(language);
  }, [language]);

  /**
   * Change the current language
   * Updates local state, localStorage, and syncs with backend
   *
   * @param {string} 
   * @returns {Promise<boolean>} - Whether the change was successful
   */
  const changeLanguage = useCallback(
    async (newLang) => {
      if (!newLang ) {
        console.warn(`Invalid language code: ${newLang}`);
        return false;
      }

      try {
        const success = await preferenceApi.updateLocale(newLang);
        if (success) {
          setLanguageStorage(newLang);
          setLanguageState(newLang);
          setTranslations(loadTranslations(newLang));
          setDirection(getDirection(newLang));
          applyLanguageToDocument(newLang);
        } else {
          console.warn("Failed to sync language preference with backend");
          return false;
        }
      } catch (err) {
        console.error("Error syncing language to backend:", err);
        setError("Failed to save language preference");

        return false;
      }

      return true;
    },
    [language],
  );

  /**
   * Get translation for a key
   * @param {string} key - Dot-notation key (e.g., 'app.name')
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} Translated string
   */
  const t = useCallback(
    (key, params = {}) => {
      return translate(key, language, params);
    },
    [language],
  );

  /**
   * Check if current language is RTL
   * @returns {boolean}
   */
  const isRtl = useCallback(() => {
    return isRTL(language);
  }, [language]);

  /**
   * Get font family for current language
   * @returns {string}
   */
  const getFontFamilyForCurrentLang = useCallback(() => {
    return getFontFamily(language);
  }, [language]);

  /**
   * Get supported languages
   * @returns {Array}
   */
  const getLanguages = useCallback(() => {
    return getSupportedLanguages();
  }, []);

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
    supportedLanguages: ["en", "fa"],
    isLoading,
    error,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to use i18n context
 * @returns {Object} I18n context object
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

/**
 * Hook to use translation function
 * @returns {Object} Translation helper with t function
 */
export function useTranslation() {
  const { t, language, translations, direction } = useI18n();
  return { t, language, translations, direction };
}

export default I18nContext;
