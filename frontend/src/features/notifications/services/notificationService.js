/**
 * Notifications Feature - Service
 * 
 * API service for notification-related operations.
 * 
 * @module features/notifications/services
 */

import { apiClient } from '@/core/api/index.js';

/**
 * Notification API endpoints
 */
const endpoints = {
  base: '/notifications',
  unread: '/notifications/unread',
  markRead: (id) => `/notifications/${id}/read`,
  markAllRead: '/notifications/read-all',
  settings: '/notifications/settings',
};

/**
 * Notification service object
 */
const notificationService = {
  /**
   * Get all notifications
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getNotifications(params = {}) {
    return apiClient.get(endpoints.base, params);
  },

  /**
   * Get unread notifications
   * @returns {Promise<Object>}
   */
  async getUnreadNotifications() {
    return apiClient.get(endpoints.unread);
  },

  /**
   * Mark notification as read
   * @param {number|string} id - Notification ID
   * @returns {Promise<Object>}
   */
  async markAsRead(id) {
    return apiClient.post(endpoints.markRead(id));
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<void>}
   */
  async markAllAsRead() {
    return apiClient.post(endpoints.markAllRead);
  },

  /**
   * Delete a notification
   * @param {number|string} id - Notification ID
   * @returns {Promise<void>}
   */
  async deleteNotification(id) {
    return apiClient.delete(`${endpoints.base}/${id}`);
  },

  /**
   * Get notification settings
   * @returns {Promise<Object>}
   */
  async getSettings() {
    return apiClient.get(endpoints.settings);
  },

  /**
   * Update notification settings
   * @param {Object} data - Settings data
   * @returns {Promise<Object>}
   */
  async updateSettings(data) {
    return apiClient.put(endpoints.settings, data);
  },

  /**
   * Get unread count
   * @returns {Promise<Object>}
   */
  async getUnreadCount() {
    return apiClient.get(`${endpoints.base}/unread-count`);
  },
};

export { notificationService, endpoints };
export default notificationService;
