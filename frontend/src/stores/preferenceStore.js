/**
 * ============================================================================
 * Preference Store - Zustand
 * ============================================================================
 * 
 * Centralized user preferences state management using Zustand.
 * Handles user settings, notification preferences, and other user-specific data.
 * 
 * Features:
 * - User preferences management
 * - Notification settings
 * - Date/time preferences
 * - Calendar preferences
 * - Backend synchronization
 * 
 * @example
 * // Basic usage
 * const { preferences, updatePreference, syncWithBackend } = usePreferenceStore()
 * 
 * // With selectors
 * const dateFormat = usePreferenceStore(state => state.preferences.dateFormat)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { preferenceService } from '@/services/preferenceService'
import { useAuthStore } from './authStore'

// ============================================================================
// Types
// ============================================================================

/**
 * @typedef {Object} UserPreferences
 * @property {string} locale - User locale
 * @property {string} timezone - User timezone
 * @property {string} dateFormat - Date format preference
 * @property {string} timeFormat - Time format (12h/24h)
 * @property {string} calendarView - Default calendar view
 * @property {string} weekStart - Week start day
 * @property {boolean} showWeekends - Show weekends in calendar
 * @property {string} taskListDensity - Task list density preference
 */

// ============================================================================
// Initial State
// ============================================================================

const defaultPreferences = {
  // Locale & Timezone
  locale: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  
  // Date & Time
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  jalaliDateFormat: 'jYYYY/jMM/jDD',
  
  // Calendar
  calendarView: 'month',
  weekStart: 'monday',
  showWeekends: true,
  calendarTimeSlot: 30,
  
  // Task List
  taskListDensity: 'comfortable',
  showCompletedTasks: true,
  defaultTaskView: 'list',
  
  // Notifications
  emailNotifications: true,
  taskReminders: true,
  reminderTime: 30, // minutes before due
  
  // Display
  compactMode: false,
  showTaskCount: true,
}

const initialState = {
  preferences: defaultPreferences,
  loading: false,
  error: null,
  syncing: false,
  lastSynced: null,
}

// ============================================================================
// Preference Store
// ============================================================================

export const usePreferenceStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ==========================================================================
      // Initialization
      // ==========================================================================

      /**
       * Load preferences from backend
       */
      loadFromBackend: async () => {
        try {
          set({ loading: true, error: null })
          
          const response = await preferenceService.getPreferences()
          
          set({
            preferences: { ...defaultPreferences, ...response.data },
            loading: false,
            lastSynced: new Date().toISOString(),
          })
        } catch (error) {
          console.warn('Failed to load preferences from backend:', error)
          set({ loading: false })
          // Use local preferences if backend fails
        }
      },

      /**
       * Initialize preferences
       * Loads from backend if authenticated, otherwise uses local storage
       */
      initialize: async () => {
        // Check if user is authenticated via auth store instead of just checking token
        const authState = useAuthStore.getState()
        if (authState.isAuthenticated) {
          await get().loadFromBackend()
        }
      },

      // ==========================================================================
      // Preference Updates
      // ==========================================================================

      /**
       * Update a single preference
       * @param {string} key - Preference key
       * @param {*} value - Preference value
       */
      setPreference: async (key, value) => {
        const { preferences } = get()
        const previousValue = preferences[key]
        
        // Optimistic update
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        }))
        
        try {
          // Sync with backend
          await preferenceService.updatePreference(key, value)
          set({ lastSynced: new Date().toISOString() })
        } catch (error) {
          // Revert on error
          set((state) => ({
            preferences: { ...state.preferences, [key]: previousValue },
            error: error.message || 'Failed to save preference',
          }))
          throw error
        }
      },

      /**
       * Update multiple preferences
       * @param {Object} updates - Preference updates
       */
      updatePreferences: async (updates) => {
        const { preferences } = get()
        const previousPreferences = { ...preferences }
        
        // Optimistic update
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }))
        
        try {
          // Sync with backend
          await preferenceService.updatePreferences(updates)
          set({ lastSynced: new Date().toISOString() })
        } catch (error) {
          // Revert on error
          set({
            preferences: previousPreferences,
            error: error.message || 'Failed to save preferences',
          })
          throw error
        }
      },

      /**
       * Update preference locally only (no backend sync)
       * @param {string} key - Preference key
       * @param {*} value - Preference value
       */
      setPreferenceLocal: (key, value) => {
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        }))
      },

      /**
       * Update multiple preferences locally only
       * @param {Object} updates - Preference updates
       */
      updatePreferencesLocal: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }))
      },

      // ==========================================================================
      // Specific Preference Setters
      // ==========================================================================

      /**
       * Set locale
       * @param {string} locale - Locale code
       */
      setLocale: (locale) => {
        get().setPreference('locale', locale)
      },

      /**
       * Set timezone
       * @param {string} timezone - Timezone
       */
      setTimezone: (timezone) => {
        get().setPreference('timezone', timezone)
      },

      /**
       * Set date format
       * @param {string} format - Date format
       */
      setDateFormat: (format) => {
        get().setPreference('dateFormat', format)
      },

      /**
       * Set time format
       * @param {string} format - Time format (12h/24h)
       */
      setTimeFormat: (format) => {
        get().setPreference('timeFormat', format)
      },

      /**
       * Set calendar view
       * @param {string} view - Calendar view (day/week/month)
       */
      setCalendarView: (view) => {
        get().setPreference('calendarView', view)
      },

      /**
       * Set week start day
       * @param {string} day - Week start day (sunday/monday)
       */
      setWeekStart: (day) => {
        get().setPreference('weekStart', day)
      },

      /**
       * Toggle show weekends
       */
      toggleShowWeekends: () => {
        const { preferences } = get()
        get().setPreference('showWeekends', !preferences.showWeekends)
      },

      /**
       * Set task list density
       * @param {string} density - Density level
       */
      setTaskListDensity: (density) => {
        get().setPreference('taskListDensity', density)
      },

      /**
       * Toggle show completed tasks
       */
      toggleShowCompletedTasks: () => {
        const { preferences } = get()
        get().setPreference('showCompletedTasks', !preferences.showCompletedTasks)
      },

      // ==========================================================================
      // Sync
      // ==========================================================================

      /**
       * Sync preferences with backend
       */
      syncWithBackend: async () => {
        try {
          set({ syncing: true })
          
          await preferenceService.updatePreferences(get().preferences)
          
          set({
            syncing: false,
            lastSynced: new Date().toISOString(),
          })
        } catch (error) {
          set({
            syncing: false,
            error: error.message || 'Failed to sync preferences',
          })
          throw error
        }
      },

      // ==========================================================================
      // Reset
      // ==========================================================================

      /**
       * Reset preferences to defaults
       */
      resetToDefaults: () => {
        set({
          preferences: defaultPreferences,
          error: null,
        })
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set(initialState)
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'preference-store',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selector for all preferences
 */
export const usePreferences = () => usePreferenceStore((state) => state.preferences)

/**
 * Selector for specific preference
 */
export const usePreference = (key) => usePreferenceStore((state) => state.preferences[key])

/**
 * Selector for locale
 */
export const useLocale = () => usePreferenceStore((state) => state.preferences.locale)

/**
 * Selector for timezone
 */
export const useTimezone = () => usePreferenceStore((state) => state.preferences.timezone)

/**
 * Selector for date format
 */
export const useDateFormat = () => usePreferenceStore((state) => state.preferences.dateFormat)

/**
 * Selector for time format
 */
export const useTimeFormat = () => usePreferenceStore((state) => state.preferences.timeFormat)

/**
 * Selector for calendar preferences
 */
export const useCalendarPreferences = () => usePreferenceStore((state) => ({
  calendarView: state.preferences.calendarView,
  weekStart: state.preferences.weekStart,
  showWeekends: state.preferences.showWeekends,
  calendarTimeSlot: state.preferences.calendarTimeSlot,
}))

/**
 * Selector for task list preferences
 */
export const useTaskListPreferences = () => usePreferenceStore((state) => ({
  taskListDensity: state.preferences.taskListDensity,
  showCompletedTasks: state.preferences.showCompletedTasks,
  defaultTaskView: state.preferences.defaultTaskView,
}))

/**
 * Selector for notification preferences
 */
export const useNotificationPreferences = () => usePreferenceStore((state) => ({
  emailNotifications: state.preferences.emailNotifications,
  taskReminders: state.preferences.taskReminders,
  reminderTime: state.preferences.reminderTime,
}))

/**
 * Selector for preference loading state
 */
export const usePreferenceLoading = () => usePreferenceStore((state) => ({
  loading: state.loading,
  syncing: state.syncing,
}))

/**
 * Selector for preference actions
 */
export const usePreferenceActions = () => usePreferenceStore((state) => ({
  loadFromBackend: state.loadFromBackend,
  initialize: state.initialize,
  setPreference: state.setPreference,
  updatePreferences: state.updatePreferences,
  setPreferenceLocal: state.setPreferenceLocal,
  updatePreferencesLocal: state.updatePreferencesLocal,
  setLocale: state.setLocale,
  setTimezone: state.setTimezone,
  setDateFormat: state.setDateFormat,
  setTimeFormat: state.setTimeFormat,
  setCalendarView: state.setCalendarView,
  setWeekStart: state.setWeekStart,
  toggleShowWeekends: state.toggleShowWeekends,
  setTaskListDensity: state.setTaskListDensity,
  toggleShowCompletedTasks: state.toggleShowCompletedTasks,
  syncWithBackend: state.syncWithBackend,
  resetToDefaults: state.resetToDefaults,
  reset: state.reset,
  clearError: state.clearError,
}))

export default usePreferenceStore
