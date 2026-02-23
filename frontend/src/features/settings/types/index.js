/**
 * Settings Feature - Types
 * 
 * Type definitions for the settings feature.
 * 
 * @module features/settings/types
 */

/**
 * Settings section enum
 */
export const SettingsSection = {
  PROFILE: 'profile',
  PREFERENCES: 'preferences',
  NOTIFICATIONS: 'notifications',
  SECURITY: 'security',
  APPEARANCE: 'appearance',
  LANGUAGE: 'language',
};

/**
 * User preferences type definition
 * @typedef {Object} UserPreferences
 * @property {string} theme - Theme preference (light, dark, system)
 * @property {string} language - Language preference
 * @property {string} dateFormat - Date format preference
 * @property {string} timeFormat - Time format preference (12h, 24h)
 * @property {string} timezone - Timezone preference
 * @property {string} startPage - Default start page
 * @property {number} itemsPerPage - Items per page preference
 * @property {boolean} emailNotifications - Email notifications enabled
 * @property {boolean} pushNotifications - Push notifications enabled
 */

/**
 * User profile type definition
 * @typedef {Object} UserProfile
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} avatar - Avatar URL
 * @property {string} phone - Phone number
 * @property {string} bio - User bio
 * @property {string} location - User location
 * @property {string} website - User website
 */

/**
 * Create default user preferences
 * @returns {UserPreferences}
 */
export const createDefaultPreferences = () => ({
  theme: 'system',
  language: 'en',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  timezone: 'UTC',
  startPage: '/dashboard',
  itemsPerPage: 20,
  emailNotifications: true,
  pushNotifications: true,
});

export default {
  SettingsSection,
  createDefaultPreferences,
};
