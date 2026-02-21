/**
 * ============================================================================
 * Navigation Store - Zustand
 * ============================================================================
 * 
 * Centralized navigation state management using Zustand.
 * Handles current navigation view, filters, projects, tags, and saved views.
 * 
 * Features:
 * - Current navigation state (project, filter, tag, saved-view)
 * - Navigation data (projects, tags, saved views, counts)
 * - Per-section loading and error states
 * - Optimistic updates with rollback
 * - URL synchronization
 * 
 * @example
 * // Basic usage
 * const { currentNavigation, setNavigation, projects, tags } = useNavigationStore()
 * 
 * // With selectors
 * const currentNav = useNavigationStore(state => state.currentNavigation)
 */

import { create } from 'zustand'
import { api, initCsrf } from '@/services/authService'

// ============================================================================
// Types & Constants
// ============================================================================

/**
 * @typedef {Object} NavigationState
 * @property {'project'|'filter'|'tag'|'saved-view'|null} type - Navigation type
 * @property {string|null} id - Navigation item ID
 * @property {string|null} name - Display name
 * @property {Object|null} params - URL parameters
 */

const DEFAULT_NAVIGATION = {
  type: 'filter',
  id: 'all',
  name: 'All Tasks',
  params: { filter: 'all' },
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract error message from API error
 */
const getErrorMessage = (error) => {
  if (error?.response?.status === 401) {
    return 'Session expired. Please log in again.'
  }
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * Initialize navigation from URL
 */
const getNavigationFromURL = () => {
  if (typeof window === 'undefined') return DEFAULT_NAVIGATION
  
  const params = new URLSearchParams(window.location.search)
  const projectId = params.get('project_id')
  const tagId = params.get('tag_id')
  const filter = params.get('filter')
  
  if (projectId) {
    return {
      type: 'project',
      id: `project-${projectId}`,
      name: null,
      params: { project_id: projectId },
    }
  }
  if (tagId) {
    return {
      type: 'tag',
      id: `tag-${tagId}`,
      name: null,
      params: { tag_id: tagId },
    }
  }
  if (filter) {
    return {
      type: 'filter',
      id: filter,
      name: null,
      params: { filter },
    }
  }
  
  return DEFAULT_NAVIGATION
}

// ============================================================================
// Initial State
// ============================================================================

const getInitialState = () => ({
  currentNavigation: getNavigationFromURL(),
  systemFilters: [],
  projects: [],
  favorites: [],
  tags: [],
  savedViews: [],
  counts: {},
  loading: false,
  error: null,
  sectionLoading: {
    projects: false,
    tags: false,
    savedViews: false,
    counts: false,
  },
  sectionErrors: {
    projects: null,
    tags: null,
    savedViews: null,
    counts: null,
  },
  previousState: null, // For optimistic updates rollback
  // Callbacks for error handling
  onError: null,
  on401: null,
})

// ============================================================================
// Navigation Store
// ============================================================================

export const useNavigationStore = create((set, get) => ({
  ...getInitialState(),

  // ==========================================================================
  // Callback Management
  // ==========================================================================

  /**
   * Set error callbacks
   * @param {Object} callbacks - Callback functions
   * @param {Function} [callbacks.onError] - Error callback
   * @param {Function} [callbacks.on401] - 401 unauthorized callback
   */
  setCallbacks: (callbacks) => {
    set({
      onError: callbacks.onError || null,
      on401: callbacks.on401 || null,
    })
  },

  /**
   * Handle 401 unauthorized error
   */
  handle401: (error) => {
    const { on401 } = get()
    if (on401) {
      on401(error)
    } else {
      // Default: clear auth and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  },

  /**
   * Handle error with callback
   */
  handleError: (error, context = 'Navigation') => {
    const { onError } = get()
    const message = getErrorMessage(error)
    console.error(`${context} error:`, error)
    set({ error: message })
    if (onError) {
      onError(message, error)
    }
    return message
  },

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Fetch all navigation data
   */
  fetchNavigationData: async () => {
    try {
      set({ loading: true, error: null })
      set({
        sectionErrors: {
          projects: null,
          tags: null,
          savedViews: null,
          counts: null,
        },
      })
      
      const response = await api.get('/navigation')
      set({
        ...response.data,
        loading: false,
      })
    } catch (error) {
      if (error?.response?.status === 401) {
        get().handle401(error)
      } else {
        get().handleError(error, 'Fetch navigation')
      }
      set({ loading: false })
    }
  },

  /**
   * Fetch counts only
   */
  fetchCounts: async () => {
    try {
      set((state) => ({
        sectionLoading: { ...state.sectionLoading, counts: true },
        sectionErrors: { ...state.sectionErrors, counts: null },
      }))
      
      const response = await api.get('/navigation/counts')
      set((state) => ({
        counts: response.data.counts,
        sectionLoading: { ...state.sectionLoading, counts: false },
      }))
    } catch (error) {
      if (error?.response?.status === 401) {
        get().handle401(error)
      } else {
        const message = getErrorMessage(error)
        set((state) => ({
          sectionErrors: { ...state.sectionErrors, counts: message },
          sectionLoading: { ...state.sectionLoading, counts: false },
        }))
      }
    }
  },

  // ==========================================================================
  // Navigation State
  // ==========================================================================

  /**
   * Set current navigation
   * @param {NavigationState} navigation - Navigation state
   */
  setNavigation: (navigation) => {
    set({ currentNavigation: navigation })
    
    // Update URL
    if (navigation.params && typeof window !== 'undefined') {
      const params = new URLSearchParams()
      Object.entries(navigation.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.set(key, String(value))
        }
      })
      const url = `/tasks?${params.toString()}`
      window.history.pushState({}, '', url)
    }
  },

  /**
   * Clear navigation
   */
  clearNavigation: () => {
    set({ currentNavigation: { type: null, id: null, name: null, params: null } })
  },

  /**
   * Check if navigation item is active
   * @param {string} type - Navigation type
   * @param {string} id - Navigation ID
   * @returns {boolean}
   */
  isActive: (type, id) => {
    const { currentNavigation } = get()
    return currentNavigation.type === type && currentNavigation.id === id
  },

  // ==========================================================================
  // Project Actions
  // ==========================================================================

  /**
   * Save current state for potential rollback
   */
  savePreviousState: () => {
    const { projects, favorites, tags, savedViews, counts } = get()
    set({ previousState: { projects, favorites, tags, savedViews, counts } })
  },

  /**
   * Add a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  addProject: async (projectData) => {
    try {
      get().savePreviousState()
      set((state) => ({ sectionLoading: { ...state.sectionLoading, projects: true } }))
      
      await initCsrf()
      const response = await api.post('/projects', projectData)
      
      set((state) => ({
        projects: [...state.projects, response.data.project],
        sectionLoading: { ...state.sectionLoading, projects: false },
      }))
      
      return response.data.project
    } catch (error) {
      // Rollback on error
      const { previousState } = get()
      if (previousState) {
        set(previousState)
      }
      
      const message = getErrorMessage(error)
      set((state) => ({
        sectionErrors: { ...state.sectionErrors, projects: message },
        sectionLoading: { ...state.sectionLoading, projects: false },
      }))
      throw new Error(message)
    }
  },

  /**
   * Toggle project favorite status
   * @param {number} projectId - Project ID
   * @returns {Promise<boolean>} New favorite status
   */
  toggleProjectFavorite: async (projectId) => {
    const { projects } = get()
    const project = projects.find(p => p.id === projectId)
    const currentIsFavorite = project?.is_favorite
    const newIsFavorite = !currentIsFavorite
    
    // Optimistic update
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === projectId ? { ...p, is_favorite: newIsFavorite } : p
      ),
      favorites: newIsFavorite
        ? [...state.favorites.filter(f => f.id !== projectId), project]
        : state.favorites.filter(f => f.id !== projectId),
    }))
    
    try {
      await initCsrf()
      const response = await api.patch(`/projects/${projectId}/favorite`, {
        is_favorite: newIsFavorite,
      })
      
      const { is_favorite } = response.data
      
      // Sync with server response
      if (is_favorite !== newIsFavorite) {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId ? { ...p, is_favorite } : p
          ),
        }))
      }
      
      return is_favorite
    } catch (error) {
      // Revert on error
      get().fetchNavigationData()
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * Delete a project
   * @param {number} projectId - Project ID
   */
  deleteProject: async (projectId) => {
    try {
      get().savePreviousState()
      
      // Optimistic update
      set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId),
        favorites: state.favorites.filter(f => f.id !== projectId),
      }))
      
      await initCsrf()
      await api.delete(`/projects/${projectId}`)
    } catch (error) {
      // Rollback on error
      const { previousState } = get()
      if (previousState) {
        set(previousState)
      }
      throw new Error(getErrorMessage(error))
    }
  },

  // ==========================================================================
  // Tag Actions
  // ==========================================================================

  /**
   * Add a new tag
   * @param {Object} tagData - Tag data
   * @returns {Promise<Object>} Created tag
   */
  addTag: async (tagData) => {
    try {
      get().savePreviousState()
      set((state) => ({ sectionLoading: { ...state.sectionLoading, tags: true } }))
      
      await initCsrf()
      const response = await api.post('/tags', tagData)
      
      set((state) => ({
        tags: [...state.tags, response.data.tag],
        sectionLoading: { ...state.sectionLoading, tags: false },
      }))
      
      return response.data.tag
    } catch (error) {
      const { previousState } = get()
      if (previousState) {
        set(previousState)
      }
      
      const message = getErrorMessage(error)
      set((state) => ({
        sectionErrors: { ...state.sectionErrors, tags: message },
        sectionLoading: { ...state.sectionLoading, tags: false },
      }))
      throw new Error(message)
    }
  },

  /**
   * Delete a tag
   * @param {number} tagId - Tag ID
   */
  deleteTag: async (tagId) => {
    try {
      get().savePreviousState()
      
      // Optimistic update
      set((state) => ({
        tags: state.tags.filter(t => t.id !== tagId),
      }))
      
      await initCsrf()
      await api.delete(`/tags/${tagId}`)
    } catch (error) {
      const { previousState } = get()
      if (previousState) {
        set(previousState)
      }
      throw new Error(getErrorMessage(error))
    }
  },

  // ==========================================================================
  // Saved View Actions
  // ==========================================================================

  /**
   * Add a new saved view
   * @param {Object} viewData - Saved view data
   * @returns {Promise<Object>} Created saved view
   */
  addSavedView: async (viewData) => {
    try {
      get().savePreviousState()
      set((state) => ({ sectionLoading: { ...state.sectionLoading, savedViews: true } }))
      
      await initCsrf()
      const response = await api.post('/saved-views', viewData)
      
      set((state) => ({
        savedViews: [...state.savedViews, response.data.saved_view],
        sectionLoading: { ...state.sectionLoading, savedViews: false },
      }))
      
      return response.data.saved_view
    } catch (error) {
      const { previousState } = get()
      if (previousState) {
        set(previousState)
      }
      
      const message = getErrorMessage(error)
      set((state) => ({
        sectionErrors: { ...state.sectionErrors, savedViews: message },
        sectionLoading: { ...state.sectionLoading, savedViews: false },
      }))
      throw new Error(message)
    }
  },

  /**
   * Delete a saved view
   * @param {number} viewId - Saved view ID
   */
  deleteSavedView: async (viewId) => {
    try {
      get().savePreviousState()
      
      // Optimistic update
      set((state) => ({
        savedViews: state.savedViews.filter(v => v.id !== viewId),
      }))
      
      await initCsrf()
      await api.delete(`/saved-views/${viewId}`)
    } catch (error) {
      const { previousState } = get()
      if (previousState) {
        set(previousState)
      }
      throw new Error(getErrorMessage(error))
    }
  },

  // ==========================================================================
  // Reset
  // ==========================================================================

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(getInitialState())
  },
}))

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selector for current navigation
 */
export const useCurrentNavigation = () => useNavigationStore((state) => state.currentNavigation)

/**
 * Selector for projects
 */
export const useProjects = () => useNavigationStore((state) => state.projects)

/**
 * Selector for tags
 */
export const useTags = () => useNavigationStore((state) => state.tags)

/**
 * Selector for saved views
 */
export const useSavedViews = () => useNavigationStore((state) => state.savedViews)

/**
 * Selector for counts
 */
export const useNavigationCounts = () => useNavigationStore((state) => state.counts)

/**
 * Selector for navigation loading state
 */
export const useNavigationLoading = () => useNavigationStore((state) => ({
  loading: state.loading,
  sectionLoading: state.sectionLoading,
}))

/**
 * Selector for navigation actions
 */
export const useNavigationActions = () => useNavigationStore((state) => ({
  fetchNavigationData: state.fetchNavigationData,
  fetchCounts: state.fetchCounts,
  setNavigation: state.setNavigation,
  clearNavigation: state.clearNavigation,
  addProject: state.addProject,
  toggleProjectFavorite: state.toggleProjectFavorite,
  deleteProject: state.deleteProject,
  addTag: state.addTag,
  deleteTag: state.deleteTag,
  addSavedView: state.addSavedView,
  deleteSavedView: state.deleteSavedView,
  reset: state.reset,
}))

export default useNavigationStore
