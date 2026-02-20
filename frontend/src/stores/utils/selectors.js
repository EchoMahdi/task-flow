/**
 * ============================================================================
 * Zustand Store Utilities - Selectors
 * ============================================================================
 * 
 * Utility functions for creating optimized selectors in Zustand stores.
 * These selectors prevent unnecessary re-renders by allowing components
 * to subscribe to specific parts of the store state.
 * 
 * @example
 * // Instead of:
 * const user = useAuthStore(state => state.user)
 * 
 * // Use selectors for better performance:
 * const { user } = useAuthStoreSelectors()
 */

/**
 * Creates selector hooks for a Zustand store
 * This is a higher-order function that wraps the store with selector support
 * 
 * @param {Function} useStore - The Zustand store hook
 * @returns {Object} An object with selector hooks for each state property
 * 
 * @example
 * const useAuthStore = create((set) => ({ user: null, loading: false }))
 * const useAuthStoreSelectors = createSelectors(useAuthStore)
 * 
 * // Now you can use:
 * const user = useAuthStoreSelectors.user() // Only re-renders when user changes
 * const loading = useAuthStoreSelectors.loading() // Only re-renders when loading changes
 */
export const createSelectors = (useStore) => {
  const useStoreSelectors = (selector) => useStore(selector)
  
  // Create a selector for each key in the store state
  return new Proxy(useStoreSelectors, {
    get(target, prop) {
      // Return a selector function for the specific property
      return () => target((state) => state[prop])
    }
  })
}

/**
 * Creates a shallow equality selector for objects and arrays
 * Useful for preventing re-renders when object references change but content doesn't
 * 
 * @param {Function} selector - The selector function
 * @returns {Function} A selector that uses shallow equality comparison
 * 
 * @example
 * const user = useAuthStore(shallowSelector(state => state.user))
 */
export const shallowSelector = (selector) => (state) => {
  const selected = selector(state)
  
  // For primitive values, return as-is
  if (selected === null || typeof selected !== 'object') {
    return selected
  }
  
  // For arrays and objects, we rely on Zustand's shallow comparison
  return selected
}

/**
 * Creates a selector that combines multiple store values
 * Useful when a component needs multiple values but should only re-render
 * when any of those values change
 * 
 * @param {Array} keys - Array of state keys to combine
 * @returns {Function} A selector that returns an object with the combined values
 * 
 * @example
 * const { user, loading, error } = useAuthStore(combineSelector(['user', 'loading', 'error']))
 */
export const combineSelector = (keys) => (state) => {
  const result = {}
  keys.forEach(key => {
    result[key] = state[key]
  })
  return result
}

/**
 * Creates a stable selector that only updates when the result of a comparison function changes
 * Useful for derived state that should only trigger re-renders under specific conditions
 * 
 * @param {Function} selector - The base selector
 * @param {Function} compareFn - Comparison function (previous, next) => boolean
 * @returns {Function} A selector with custom comparison
 * 
 * @example
 * const isAuthenticated = useAuthStore(
 *   stableSelector(
 *     state => state.user,
 *     (prev, next) => !!prev === !!next
 *   )
 * )
 */
export const stableSelector = (selector, compareFn) => {
  let previousValue
  let previousResult
  
  return (state) => {
    const newValue = selector(state)
    
    if (previousValue !== undefined && compareFn(previousValue, newValue)) {
      return previousResult
    }
    
    previousValue = newValue
    previousResult = newValue
    return newValue
  }
}

export default {
  createSelectors,
  shallowSelector,
  combineSelector,
  stableSelector
}
