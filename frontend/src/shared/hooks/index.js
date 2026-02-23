/**
 * Shared Hooks Index
 * 
 * Exports all reusable hooks used across multiple features.
 * 
 * @module shared/hooks
 */

import { useState, useEffect, useCallback } from 'react';

// Re-export existing hooks from the old structure
// These will be gradually migrated to the new structure
export { useDateFormat } from '../../hooks/useDateFormat.js';
export { useTaskSearch } from '../../hooks/useTaskSearch.js';

/**
 * Custom hook for debouncing values
 * @param {any} value - Value to debounce
 * @param {number} delay - Debounce delay in ms
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for handling async operations
 * @param {Function} asyncFn - Async function to execute
 * @param {boolean} immediate - Execute immediately
 * @returns {Object} Async state and execute function
 */
export function useAsync(asyncFn, immediate = false) {
  const [state, setState] = useState({
    loading: immediate,
    error: null,
    data: null,
  });

  const execute = useCallback(async (...args) => {
    setState({ loading: true, error: null, data: null });
    try {
      const data = await asyncFn(...args);
      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      setState({ loading: false, error, data: null });
      throw error;
    }
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { ...state, execute };
}

/**
 * Custom hook for local storage
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} [value, setValue] tuple
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Custom hook for media queries
 * @param {string} query - Media query string
 * @returns {boolean} Whether the query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Custom hook for click outside detection
 * @param {React.RefObject} ref - Element ref
 * @param {Function} handler - Handler to call on outside click
 */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Custom hook for keyboard shortcuts
 * @param {string} key - Key to listen for
 * @param {Function} handler - Handler to call
 * @param {Object} options - Options (ctrl, shift, alt, meta)
 */
export function useKeyPress(key, handler, options = {}) {
  const { ctrl = false, shift = false, alt = false, meta = false } = options;

  useEffect(() => {
    const listener = (event) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        handler(event);
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [key, handler, ctrl, shift, alt, meta]);
}
