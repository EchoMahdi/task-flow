/**
 * Core Configuration Module
 * 
 * Centralized application configuration management.
 * All environment variables and app-wide settings are defined here.
 * 
 * @module core/config
 */

/**
 * Application configuration object
 * Values are loaded from environment variables with fallbacks
 */
export const config = {
  /**
   * Application metadata
   */
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Task Manager',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE || 'development',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },

  /**
   * API configuration
   */
  api: {
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    retryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
    retryDelay: Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
  },

  /**
   * Authentication configuration
   */
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutes before actual expiry
    sessionTimeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 30 * 60 * 1000, // 30 minutes
  },

  /**
   * Storage keys
   */
  storage: {
    prefix: 'tm_',
    theme: 'tm_theme',
    preferences: 'tm_preferences',
    language: 'tm_language',
    navigation: 'tm_navigation',
  },

  /**
   * Feature flags
   */
  features: {
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    enableCalendar: import.meta.env.VITE_ENABLE_CALENDAR !== 'false',
    enableProjects: import.meta.env.VITE_ENABLE_PROJECTS !== 'false',
    enableTags: import.meta.env.VITE_ENABLE_TAGS !== 'false',
    enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
    enableI18n: import.meta.env.VITE_ENABLE_I18N !== 'false',
  },

  /**
   * UI configuration
   */
  ui: {
    defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
    supportedLanguages: ['en', 'fa'],
    dateFormat: import.meta.env.VITE_DATE_FORMAT || 'YYYY-MM-DD',
    timeFormat: import.meta.env.VITE_TIME_FORMAT || '24h',
    timezone: import.meta.env.VITE_TIMEZONE || 'UTC',
    itemsPerPage: Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 20,
    debounceDelay: Number(import.meta.env.VITE_DEBOUNCE_DELAY) || 300,
  },

  /**
   * Theme configuration
   */
  theme: {
    defaultMode: import.meta.env.VITE_DEFAULT_THEME_MODE || 'system',
    defaultPalette: import.meta.env.VITE_DEFAULT_PALETTE || 'blue',
  },

  /**
   * External services
   */
  services: {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  },

  /**
   * Routes configuration
   */
  routes: {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    tasks: '/tasks',
    calendar: '/calendar',
    settings: '/settings',
    profile: '/profile',
    notifications: '/notifications',
  },
};

/**
 * Get a configuration value by path
 * @param {string} path - Dot-notation path (e.g., 'api.baseURL')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*}
 */
export function getConfig(path, defaultValue = undefined) {
  const keys = path.split('.');
  let value = config;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }

  return value;
}

/**
 * Check if a feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function isFeatureEnabled(feature) {
  return getConfig(`features.${feature}`, false);
}

/**
 * Get storage key with prefix
 * @param {string} key - Storage key
 * @returns {string}
 */
export function getStorageKey(key) {
  return `${config.storage.prefix}${key}`;
}

export default config;
