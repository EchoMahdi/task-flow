/**
 * Theme API Service
 * 
 * Frontend service for communicating with the theme settings API endpoints.
 */

import api from './api';

/**
 * Get current user's theme settings
 * 
 * @returns {Promise<Object>} Theme settings object
 */
export async function getThemeSettings() {
  const response = await api.get('/user/theme');
  return response.data;
}

/**
 * Update theme mode
 * 
 * @param {string} themeMode - 'light', 'dark', or 'system'
 * @returns {Promise<Object>} Updated settings
 */
export async function updateThemeMode(themeMode) {
  const response = await api.put('/user/theme/mode', { theme_mode: themeMode });
  return response.data;
}

/**
 * Update locale/language
 * 
 * @param {string} locale - 'en' or 'fa'
 * @returns {Promise<Object>} Updated settings
 */
export async function updateLocale(locale) {
  const response = await api.put('/user/theme/locale', { locale });
  return response.data;
}

/**
 * Update accessibility preferences
 * 
 * @param {Object} preferences - Accessibility preferences object
 * @param {boolean} [preferences.reduced_motion]
 * @param {boolean} [preferences.high_contrast]
 * @param {number} [preferences.font_scale]
 * @returns {Promise<Object>} Updated preferences
 */
export async function updatePreferences(preferences) {
  const response = await api.put('/user/theme/preferences', preferences);
  return response.data;
}

/**
 * Update all theme settings at once
 * 
 * @param {Object} settings - Complete theme settings
 * @param {string} [settings.theme_mode]
 * @param {string} [settings.locale]
 * @param {Object} [settings.preferences]
 * @returns {Promise<Object>} Updated settings
 */
export async function updateThemeSettings(settings) {
  const response = await api.put('/user/theme', settings);
  return response.data;
}

/**
 * Reset theme settings to defaults
 * 
 * @returns {Promise<Object>} Reset settings
 */
export async function resetThemeSettings() {
  const response = await api.put('/user/theme/reset');
  return response.data;
}

export default {
  getThemeSettings,
  updateThemeMode,
  updateLocale,
  updatePreferences,
  updateThemeSettings,
  resetThemeSettings,
};
