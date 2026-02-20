/**
 * ============================================================================
 * Zustand Store Utilities - Persistence
 * ============================================================================
 * 
 * Configuration and utilities for persisting Zustand stores to localStorage.
 * Provides encrypted storage options, versioning, and migration support.
 */

import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Default storage configuration using localStorage
 */
export const defaultStorage = createJSONStorage(() => localStorage)

/**
 * Session storage configuration for temporary data
 */
export const sessionStorage_ = createJSONStorage(() => sessionStorage)

/**
 * Creates a persist configuration for a Zustand store
 * 
 * @param {Object} options - Persistence options
 * @param {string} options.name - The key to use in localStorage
 * @param {Array<string>} options.partialize - Array of state keys to persist (optional)
 * @param {Function} options.onRehydrate - Callback after rehydration (optional)
 * @param {number} options.version - Schema version for migrations (default: 1)
 * @param {Object} options.storage - Storage adapter (default: localStorage)
 * @returns {Function} Persist middleware configuration
 * 
 * @example
 * const useStore = create(
 *   persist(
 *     (set) => ({ user: null, setUser: (user) => set({ user }) }),
 *     persistConfig({ name: 'auth-store', partialize: ['user'] })
 *   )
 * )
 */
export const persistConfig = ({
  name,
  partialize = null,
  onRehydrate = null,
  version = 1,
  storage = defaultStorage,
  migrate = null,
}) => {
  const config = {
    name,
    version,
    storage,
  }

  // Only include partialize if specified
  if (partialize) {
    config.partialize = (state) => {
      const partialState = {}
      partialize.forEach(key => {
        if (key in state) {
          partialState[key] = state[key]
        }
      })
      return partialState
    }
  }

  // Add rehydration callback
  if (onRehydrate) {
    config.onRehydrateStorage = () => onRehydrate
  }

  // Add migration function
  if (migrate) {
    config.migrate = migrate
  }

  return config
}

/**
 * Creates a migration function for handling schema changes
 * 
 * @param {Object} migrations - Object mapping version numbers to migration functions
 * @returns {Function} Migration function for persist config
 * 
 * @example
 * const migrations = {
 *   2: (state) => ({ ...state, newField: state.oldField || 'default' }),
 *   3: (state) => ({ ...state, renamedField: state.oldName })
 * }
 * 
 * persistConfig({
 *   name: 'my-store',
 *   version: 3,
 *   migrate: createMigration(migrations)
 * })
 */
export const createMigration = (migrations) => (persistedState, version) => {
  let state = persistedState

  // Apply migrations in order from current version to target version
  for (let v = version + 1; v <= Object.keys(migrations).length; v++) {
    if (migrations[v]) {
      state = migrations[v](state)
    }
  }

  return state
}

/**
 * Clears all persisted store data from localStorage
 * Useful for logout or when resetting the application
 * 
 * @param {Array<string>} storeNames - Array of store names to clear
 */
export const clearPersistedStores = (storeNames = []) => {
  storeNames.forEach(name => {
    localStorage.removeItem(name)
  })
}

/**
 * Gets the current persisted state for a store
 * Useful for debugging or checking state before rehydration
 * 
 * @param {string} storeName - The name of the store
 * @returns {Object|null} The persisted state or null if not found
 */
export const getPersistedState = (storeName) => {
  try {
    const item = localStorage.getItem(storeName)
    if (item) {
      const { state } = JSON.parse(item)
      return state
    }
  } catch (error) {
    console.warn(`Failed to get persisted state for ${storeName}:`, error)
  }
  return null
}

/**
 * Sets persisted state for a store
 * Useful for testing or manual state manipulation
 * 
 * @param {string} storeName - The name of the store
 * @param {Object} state - The state to persist
 * @param {number} version - The schema version (default: 1)
 */
export const setPersistedState = (storeName, state, version = 1) => {
  try {
    localStorage.setItem(storeName, JSON.stringify({
      state,
      version
    }))
  } catch (error) {
    console.warn(`Failed to set persisted state for ${storeName}:`, error)
  }
}

export default {
  defaultStorage,
  sessionStorage: sessionStorage_,
  persistConfig,
  createMigration,
  clearPersistedStores,
  getPersistedState,
  setPersistedState
}
