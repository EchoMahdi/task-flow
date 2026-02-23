/**
 * Core Store Module
 * 
 * Global state management foundation using Zustand.
 * Provides store creation utilities, persistence, and middleware.
 * 
 * @module core/store
 */

import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';

/**
 * Store middleware configuration
 */
const defaultMiddleware = (name, options = {}) => {
  const middleware = [];
  
  // Persistence middleware
  if (options.persist) {
    middleware.push(
      persist({
        name: options.persistKey || name,
        storage: options.storage || createJSONStorage(() => localStorage),
        partialize: options.partialize || ((state) => state),
      })
    );
  }
  
  // DevTools middleware (development only)
  if (import.meta.env.DEV && options.devtools !== false) {
    middleware.push(devtools({ name }));
  }
  
  // Subscribe with selector middleware
  if (options.subscribeWithSelector) {
    middleware.push(subscribeWithSelector);
  }
  
  return middleware;
};

/**
 * Create a JSON storage adapter
 * @param {Storage} storage - Storage implementation
 * @returns {Object} Storage adapter
 */
function createJSONStorage(storage) {
  return {
    getItem: (name) => {
      const str = storage.getItem(name);
      return str ? JSON.parse(str) : null;
    },
    setItem: (name, value) => {
      storage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name) => {
      storage.removeItem(name);
    },
  };
}

/**
 * Create a feature store with standard patterns
 * @param {string} name - Store name
 * @param {Function} initialState - Initial state factory
 * @param {Object} options - Store options
 * @returns {Function} Store hook
 */
function createFeatureStore(name, initialState, options = {}) {
  const middleware = defaultMiddleware(name, options);
  
  // Build store with middleware
  let storeCreator = (set, get, api) => ({
    ...initialState(set, get, api),
    
    // Standard actions
    reset: () => set(initialState(set, get, api)),
    
    // Batch updates
    batch: (updates) => set((state) => ({ ...state, ...updates })),
    
    // Async action helper
    async: async (asyncFn) => {
      set({ isLoading: true, error: null });
      try {
        const result = await asyncFn();
        set({ isLoading: false, error: null });
        return result;
      } catch (error) {
        set({ isLoading: false, error });
        throw error;
      }
    },
  });
  
  // Apply middleware in reverse order
  middleware.reverse().forEach((m) => {
    storeCreator = m(storeCreator);
  });
  
  return create(storeCreator);
}

/**
 * Selector utilities
 */
const Selectors = {
  /**
   * Create a memoized selector
   * @param {Function} selector - Selector function
   * @returns {Function} Memoized selector
   */
  memoize: (selector) => {
    let lastArgs = null;
    let lastResult = null;
    
    return (...args) => {
      if (lastArgs && args.every((arg, i) => arg === lastArgs[i])) {
        return lastResult;
      }
      lastArgs = args;
      lastResult = selector(...args);
      return lastResult;
    };
  },
  
  /**
   * Create a shallow equality selector
   * @param {Function} selector - Selector function
   * @returns {Function} Shallow equality selector
   */
  shallow: (selector) => {
    return (state) => {
      const selected = selector(state);
      return (prevSelected) => {
        if (typeof selected !== 'object' || selected === null) {
          return selected !== prevSelected;
        }
        return !Object.is(selected, prevSelected);
      };
    };
  },
};

/**
 * Store subscription utilities
 */
const Subscriptions = {
  /**
   * Subscribe to store changes
   * @param {Object} store - Store instance
   * @param {Function} selector - State selector
   * @param {Function} callback - Change callback
   * @returns {Function} Unsubscribe function
   */
  subscribe: (store, selector, callback) => {
    return store.subscribe(
      selector,
      (selected, prevSelected) => callback(selected, prevSelected)
    );
  },
  
  /**
   * Subscribe to specific state changes
   * @param {Object} store - Store instance
   * @param {string} key - State key to watch
   * @param {Function} callback - Change callback
   * @returns {Function} Unsubscribe function
   */
  watch: (store, key, callback) => {
    return store.subscribe(
      (state) => state[key],
      (value, prevValue) => {
        if (value !== prevValue) {
          callback(value, prevValue);
        }
      }
    );
  },
};

/**
 * Store composition utilities
 */
const Composition = {
  /**
   * Combine multiple stores
   * @param {Object} stores - Object of store hooks
   * @returns {Function} Combined store hook
   */
  combine: (stores) => {
    return () => {
      const combined = {};
      for (const [key, useStore] of Object.entries(stores)) {
        combined[key] = useStore();
      }
      return combined;
    };
  },
  
  /**
   * Create a derived store
   * @param {Object} store - Base store
   * @param {Function} derive - Derivation function
   * @returns {Function} Derived store hook
   */
  derive: (store, derive) => {
    return (selector) => {
      const state = store();
      const derived = derive(state);
      return selector ? selector(derived) : derived;
    };
  },
};

/**
 * Global store registry
 */
const StoreRegistry = {
  stores: new Map(),
  
  /**
   * Register a store
   * @param {string} name - Store name
   * @param {Function} store - Store hook
   */
  register(name, store) {
    this.stores.set(name, store);
  },
  
  /**
   * Get a store by name
   * @param {string} name - Store name
   * @returns {Function|undefined} Store hook
   */
  get(name) {
    return this.stores.get(name);
  },
  
  /**
   * Check if store exists
   * @param {string} name - Store name
   * @returns {boolean}
   */
  has(name) {
    return this.stores.has(name);
  },
  
  /**
   * Get all registered stores
   * @returns {Map} All stores
   */
  getAll() {
    return new Map(this.stores);
  },
  
  /**
   * Reset all stores to initial state
   */
  resetAll() {
    this.stores.forEach((store) => {
      if (store.getState && store.getState().reset) {
        store.getState().reset();
      }
    });
  },
};

/**
 * Create a store action with loading state
 * @param {Function} action - Async action function
 * @param {Object} options - Action options
 * @returns {Function} Wrapped action
 */
function withLoadingState(action, options = {}) {
  return async (set, get, ...args) => {
    const { setLoadingKey = 'isLoading', setErrorKey = 'error' } = options;
    
    set({ [setLoadingKey]: true, [setErrorKey]: null });
    
    try {
      const result = await action(set, get, ...args);
      set({ [setLoadingKey]: false, [setErrorKey]: null });
      return result;
    } catch (error) {
      set({ [setLoadingKey]: false, [setErrorKey]: error });
      throw error;
    }
  };
}

export {
  createFeatureStore,
  createJSONStorage,
  Selectors,
  Subscriptions,
  Composition,
  StoreRegistry,
  withLoadingState,
};

export default createFeatureStore;
