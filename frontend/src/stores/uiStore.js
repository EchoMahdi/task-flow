/**
 * ============================================================================
 * UI Store - Zustand
 * ============================================================================
 * 
 * Centralized UI state management using Zustand.
 * Handles toasts, modals, loading states, and other UI-related state.
 * 
 * Features:
 * - Toast notifications (success, error, warning, info)
 * - Modal management
 * - Global loading states
 * - Sidebar/drawer states
 * - UI preferences
 * 
 * @example
 * // Basic usage
 * const { showToast, showModal, hideModal } = useUIStore()
 * 
 * // With selectors
 * const toasts = useUIStore(state => state.toasts)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// Types
// ============================================================================

/**
 * @typedef {Object} Toast
 * @property {string} id - Unique toast ID
 * @property {'success'|'error'|'warning'|'info'} type - Toast type
 * @property {string} message - Toast message
 * @property {number} duration - Duration in ms (0 for persistent)
 * @property {Object} [action] - Optional action button
 */

/**
 * @typedef {Object} Modal
 * @property {string} id - Unique modal ID
 * @property {string} type - Modal type/component name
 * @property {Object} props - Modal props
 * @property {boolean} isOpen - Whether modal is open
 */

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  // Toasts
  toasts: [],
  
  // Modals
  modals: [],
  activeModal: null,
  
  // Global loading
  globalLoading: false,
  globalLoadingMessage: null,
  
  // Sidebar states
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  // Right panel
  rightPanelOpen: false,
  rightPanelContent: null,
  
  // Search
  searchOpen: false,
  searchQuery: '',
  
  // UI preferences
  preferences: {
    compactMode: false,
    showCompletedTasks: true,
    taskListDensity: 'comfortable', // 'compact', 'comfortable', 'spacious'
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique ID
 */
const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// ============================================================================
// UI Store
// ============================================================================

export const useUIStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ==========================================================================
      // Toast Actions
      // ==========================================================================

      /**
       * Show a toast notification
       * @param {Object} options - Toast options
       * @param {'success'|'error'|'warning'|'info'} options.type - Toast type
       * @param {string} options.message - Toast message
       * @param {number} [options.duration=5000] - Duration in ms
       * @param {Object} [options.action] - Optional action button
       * @returns {string} Toast ID
       */
      showToast: ({ type = 'info', message, duration = 5000, action = null }) => {
        const id = generateId()
        const toast = { id, type, message, duration, action }
        
        set((state) => ({
          toasts: [...state.toasts, toast],
        }))
        
        // Auto-dismiss if duration > 0
        if (duration > 0) {
          setTimeout(() => {
            get().dismissToast(id)
          }, duration)
        }
        
        return id
      },

      /**
       * Show success toast
       * @param {string} message - Toast message
       * @param {Object} [options] - Additional options
       */
      showSuccess: (message, options = {}) => {
        return get().showToast({ type: 'success', message, ...options })
      },

      /**
       * Show error toast
       * @param {string} message - Toast message
       * @param {Object} [options] - Additional options
       */
      showError: (message, options = {}) => {
        return get().showToast({ type: 'error', message, duration: 7000, ...options })
      },

      /**
       * Show warning toast
       * @param {string} message - Toast message
       * @param {Object} [options] - Additional options
       */
      showWarning: (message, options = {}) => {
        return get().showToast({ type: 'warning', message, ...options })
      },

      /**
       * Show info toast
       * @param {string} message - Toast message
       * @param {Object} [options] - Additional options
       */
      showInfo: (message, options = {}) => {
        return get().showToast({ type: 'info', message, ...options })
      },

      /**
       * Dismiss a toast
       * @param {string} id - Toast ID
       */
      dismissToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      },

      /**
       * Clear all toasts
       */
      clearToasts: () => {
        set({ toasts: [] })
      },

      // ==========================================================================
      // Modal Actions
      // ==========================================================================

      /**
       * Show a modal
       * @param {Object} options - Modal options
       * @param {string} options.type - Modal type/component name
       * @param {Object} [options.props={}] - Modal props
       * @returns {string} Modal ID
       */
      showModal: ({ type, props = {} }) => {
        const id = `modal-${Date.now()}`
        const modal = { id, type, props, isOpen: true }
        
        set((state) => ({
          modals: [...state.modals, modal],
          activeModal: id,
        }))
        
        return id
      },

      /**
       * Hide a modal
       * @param {string} id - Modal ID
       */
      hideModal: (id) => {
        set((state) => ({
          modals: state.modals.filter((m) => m.id !== id),
          activeModal: state.modals.length > 1 
            ? state.modals[state.modals.length - 2].id 
            : null,
        }))
      },

      /**
       * Hide all modals
       */
      hideAllModals: () => {
        set({ modals: [], activeModal: null })
      },

      /**
       * Update modal props
       * @param {string} id - Modal ID
       * @param {Object} props - New props to merge
       */
      updateModalProps: (id, props) => {
        set((state) => ({
          modals: state.modals.map((m) =>
            m.id === id ? { ...m, props: { ...m.props, ...props } } : m
          ),
        }))
      },

      // ==========================================================================
      // Global Loading Actions
      // ==========================================================================

      /**
       * Set global loading state
       * @param {boolean} loading - Loading state
       * @param {string} [message] - Loading message
       */
      setGlobalLoading: (loading, message = null) => {
        set({
          globalLoading: loading,
          globalLoadingMessage: loading ? message : null,
        })
      },

      /**
       * Show global loading
       * @param {string} [message] - Loading message
       */
      showGlobalLoading: (message = 'Loading...') => {
        get().setGlobalLoading(true, message)
      },

      /**
       * Hide global loading
       */
      hideGlobalLoading: () => {
        get().setGlobalLoading(false)
      },

      // ==========================================================================
      // Sidebar Actions
      // ==========================================================================

      /**
       * Toggle sidebar
       */
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      /**
       * Set sidebar state
       * @param {boolean} open - Open state
       */
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      /**
       * Toggle sidebar collapsed state
       */
      toggleSidebarCollapsed: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      /**
       * Set sidebar collapsed state
       * @param {boolean} collapsed - Collapsed state
       */
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },

      // ==========================================================================
      // Right Panel Actions
      // ==========================================================================

      /**
       * Open right panel
       * @param {Object} content - Panel content
       */
      openRightPanel: (content) => {
        set({ rightPanelOpen: true, rightPanelContent: content })
      },

      /**
       * Close right panel
       */
      closeRightPanel: () => {
        set({ rightPanelOpen: false, rightPanelContent: null })
      },

      /**
       * Toggle right panel
       */
      toggleRightPanel: () => {
        set((state) => ({ rightPanelOpen: !state.rightPanelOpen }))
      },

      // ==========================================================================
      // Search Actions
      // ==========================================================================

      /**
       * Open search
       */
      openSearch: () => {
        set({ searchOpen: true })
      },

      /**
       * Close search
       */
      closeSearch: () => {
        set({ searchOpen: false, searchQuery: '' })
      },

      /**
       * Toggle search
       */
      toggleSearch: () => {
        set((state) => ({ searchOpen: !state.searchOpen }))
      },

      /**
       * Set search query
       * @param {string} query - Search query
       */
      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      // ==========================================================================
      // Preferences Actions
      // ==========================================================================

      /**
       * Update UI preferences
       * @param {Object} updates - Preference updates
       */
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }))
      },

      /**
       * Toggle compact mode
       */
      toggleCompactMode: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            compactMode: !state.preferences.compactMode,
          },
        }))
      },

      /**
       * Set task list density
       * @param {'compact'|'comfortable'|'spacious'} density - Density level
       */
      setTaskListDensity: (density) => {
        set((state) => ({
          preferences: { ...state.preferences, taskListDensity: density },
        }))
      },

      // ==========================================================================
      // Reset
      // ==========================================================================

      /**
       * Reset store to initial state
       */
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'ui-store',
      // Only persist preferences
      partialize: (state) => ({
        preferences: state.preferences,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selector for toasts
 */
export const useToasts = () => useUIStore((state) => state.toasts)

/**
 * Selector for active modal
 */
export const useActiveModal = () => useUIStore((state) => state.activeModal)

/**
 * Selector for modals
 */
export const useModals = () => useUIStore((state) => state.modals)

/**
 * Selector for global loading
 */
export const useGlobalLoading = () => useUIStore((state) => ({
  loading: state.globalLoading,
  message: state.globalLoadingMessage,
}))

/**
 * Selector for sidebar state
 */
export const useSidebar = () => useUIStore((state) => ({
  open: state.sidebarOpen,
  collapsed: state.sidebarCollapsed,
}))

/**
 * Selector for search state
 */
export const useSearch = () => useUIStore((state) => ({
  open: state.searchOpen,
  query: state.searchQuery,
}))

/**
 * Selector for UI preferences
 */
export const useUIPreferences = () => useUIStore((state) => state.preferences)

/**
 * Selector for toast actions
 */
export const useToastActions = () => useUIStore((state) => ({
  showToast: state.showToast,
  showSuccess: state.showSuccess,
  showError: state.showError,
  showWarning: state.showWarning,
  showInfo: state.showInfo,
  dismissToast: state.dismissToast,
  clearToasts: state.clearToasts,
}))

/**
 * Selector for modal actions
 */
export const useModalActions = () => useUIStore((state) => ({
  showModal: state.showModal,
  hideModal: state.hideModal,
  hideAllModals: state.hideAllModals,
  updateModalProps: state.updateModalProps,
}))

/**
 * Selector for UI actions
 */
export const useUIActions = () => useUIStore((state) => ({
  // Toasts
  showToast: state.showToast,
  showSuccess: state.showSuccess,
  showError: state.showError,
  showWarning: state.showWarning,
  showInfo: state.showInfo,
  dismissToast: state.dismissToast,
  clearToasts: state.clearToasts,
  
  // Modals
  showModal: state.showModal,
  hideModal: state.hideModal,
  hideAllModals: state.hideAllModals,
  
  // Loading
  setGlobalLoading: state.setGlobalLoading,
  showGlobalLoading: state.showGlobalLoading,
  hideGlobalLoading: state.hideGlobalLoading,
  
  // Sidebar
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebarCollapsed: state.toggleSidebarCollapsed,
  
  // Right panel
  openRightPanel: state.openRightPanel,
  closeRightPanel: state.closeRightPanel,
  
  // Search
  openSearch: state.openSearch,
  closeSearch: state.closeSearch,
  setSearchQuery: state.setSearchQuery,
  
  // Preferences
  updatePreferences: state.updatePreferences,
  toggleCompactMode: state.toggleCompactMode,
  setTaskListDensity: state.setTaskListDensity,
  
  // Reset
  reset: state.reset,
}))

export default useUIStore
