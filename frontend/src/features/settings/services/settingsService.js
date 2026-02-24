/**
 * Settings Feature - Service
 * 
 * API service for settings-related operations.
 * 
 * @module features/settings/services
 */

import { apiClient } from '@/core/api/index.js';

/**
 * Settings API endpoints
 */
const endpoints = {
  profile: '/user/profile',
  preferences: '/user/preferences',
  password: '/user/password',
  avatar: '/user/avatar',
  deactivate: '/user/deactivate',
  export: '/user/export',
};

/**
 * Settings service object
 */
const settingsService = {
  /**
   * Get user profile
   * @returns {Promise<Object>}
   */
  async getProfile() {
    return apiClient.get(endpoints.profile);
  },

  /**
   * Update user profile
   * @param {Object} data - Profile data
   * @returns {Promise<Object>}
   */
  async updateProfile(data) {
    return apiClient.put(endpoints.profile, data);
  },

  /**
   * Get user preferences
   * @returns {Promise<Object>}
   */
  async getPreferences() {
    return apiClient.get(endpoints.preferences);
  },

  /**
   * Update user preferences
   * @param {Object} data - Preferences data
   * @returns {Promise<Object>}
   */
  async updatePreferences(data) {
    return apiClient.put(endpoints.preferences, data);
  },

  /**
   * Change password
   * @param {Object} data - Password data
   * @returns {Promise<void>}
   */
  async changePassword(data) {
    return apiClient.put(endpoints.password, data);
  },

  /**
   * Upload avatar
   * @param {File} file - Avatar file
   * @returns {Promise<Object>}
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.post(endpoints.avatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete avatar
   * @returns {Promise<void>}
   */
  async deleteAvatar() {
    return apiClient.delete(endpoints.avatar);
  },

  /**
   * Deactivate account
   * @param {string} password - User password
   * @returns {Promise<void>}
   */
  async deactivateAccount(password) {
    return apiClient.post(endpoints.deactivate, { password });
  },

  /**
   * Export user data
   * @returns {Promise<Blob>}
   */
  async exportData() {
    return apiClient.get(endpoints.export);
  },
};

export { settingsService, endpoints };
export default settingsService;
