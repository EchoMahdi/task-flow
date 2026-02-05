import { api, initCsrf } from './authService'

/**
 * Service for managing user preferences and settings
 * All data is persisted to the backend - no mock or fake behavior
 */
export const preferenceService = {
  /**
   * Fetch user preferences from backend
   * This is a REAL API call that retrieves saved preferences from the database
   * @returns {Promise<Object>} User preferences object
   */
  async getPreferences() {
    const response = await api.get('/auth/me')
    // Backend returns user with nested preferences relation
    return response.data.data.preferences || null
  },

  /**
   * Update user preferences on backend
   * This is a REAL API call that persists data to the database
   * @param {Object} preferences - Preferences object with snake_case keys
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(preferences) {
    await initCsrf() // Ensure CSRF is initialized
    
    // Map frontend camelCase to backend snake_case
    const mappedData = {
      theme: preferences.theme,
      language: preferences.language,
      email_notifications: preferences.emailNotifications,
      push_notifications: preferences.pushNotifications,
      task_reminders: preferences.taskReminders,
      daily_digest: preferences.dailyDigest,
      weekly_report: preferences.weeklyReport,
      marketing_emails: preferences.marketingEmails,
      date_format: preferences.dateFormat,
      time_format: preferences.timeFormat,
      start_of_week: preferences.startOfWeek === 'sunday' ? 0 : 1,
      default_task_view: preferences.defaultTaskView,
    }
    
    const response = await api.put('/auth/preferences', mappedData)
    return response.data.data
  },

  /**
   * Export user data - creates a downloadable export of all user data
   * This is a REAL API call that generates and returns user data
   * @returns {Promise<Blob>} File blob for download
   */
  async exportData() {
    await initCsrf()
    const response = await api.get('/auth/export-data', {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Delete user account - permanently removes user and all associated data
   * This is a REAL API call that deletes data from the database
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteAccount() {
    await initCsrf()
    const response = await api.delete('/auth/account')
    return response.data
  },

  /**
   * Get user profile data
   * @returns {Promise<Object>} User profile
   */
  async getProfile() {
    const response = await api.get('/auth/me')
    return response.data.data.profile || null
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    await initCsrf()
    const response = await api.put('/auth/profile', { profile: profileData })
    return response.data.data
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Confirmation
   */
  async changePassword(currentPassword, newPassword) {
    await initCsrf()
    const response = await api.put('/auth/change-password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword
    })
    return response.data
  }
}
