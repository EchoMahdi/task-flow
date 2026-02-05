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
   * @param {Object} data - Flat preferences object with snake_case keys
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(data) {
    await initCsrf() // Ensure CSRF is initialized
    
    // Map frontend camelCase to backend snake_case - handle all fields
    const mappedData = {
      theme: data.theme,
      language: data.language,
      calendar_type: data.calendar_type ?? data.calendarType ?? 'gregorian',
      email_notifications: data.email_notifications ?? data.emailNotifications ?? true,
      push_notifications: data.push_notifications ?? data.pushNotifications ?? true,
      task_reminders: data.task_reminders ?? data.taskReminders ?? true,
      daily_digest: data.daily_digest ?? data.dailyDigest ?? false,
      weekly_digest: data.weekly_digest ?? data.weeklyDigest ?? false,
      weekly_report: data.weekly_report ?? data.weeklyReport ?? true,
      marketing_emails: data.marketing_emails ?? data.marketingEmails ?? false,
      date_format: data.date_format ?? data.dateFormat ?? 'Y-m-d',
      time_format: data.time_format ?? data.timeFormat ?? 'H:i',
      // Handle start_of_week conversion - Sunday=0, Monday=1, Saturday=6
      start_of_week: data.start_of_week ?? (data.startOfWeek === 'sunday' ? 0 : (data.startOfWeek === 'saturday' ? 6 : 1)),
      default_task_view: data.default_task_view ?? data.defaultTaskView ?? 'list',
      show_week_numbers: data.show_week_numbers ?? data.showWeekNumbers ?? false,
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
    
    // Separate top-level fields from profile nested fields
    const { timezone, locale, ...profileNestedData } = profileData;
    
    const payload = {};
    
    // Add top-level fields if present
    if (timezone !== undefined) {
      payload.timezone = timezone;
    }
    if (locale !== undefined) {
      payload.locale = locale;
    }
    
    // Add nested profile data if present
    if (Object.keys(profileNestedData).length > 0) {
      payload.profile = profileNestedData;
    }
    
    const response = await api.put('/auth/profile', payload)
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
