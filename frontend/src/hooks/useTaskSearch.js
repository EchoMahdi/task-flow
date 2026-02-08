/**
 * ============================================================================
 * useTaskSearch Hook
 *
 * Production-ready search hook with:
 * - Debouncing to prevent request flooding
 * - Request cancellation on query change
 * - Loading, error, and empty states
 * - Pagination support
 * - Accessibility compliant
 * ============================================================================
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { taskSearchService } from '../services/taskSearchService';

/**
 * Custom hook for task search with debouncing and cancellation
 *
 * @param {Object} options - Hook options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {number} options.initialLimit - Initial quick search limit (default: 10)
 * @param {boolean} options.autoSearch - Whether to search on mount (default: false)
 * @param {Object} options.defaultFilters - Default filters to apply
 * @returns {Object} Search state and methods
 */
const useTaskSearch = (options = {}) => {
  const {
    debounceMs = 300,
    initialLimit = 10,
    autoSearch = false,
    defaultFilters = {},
  } = options;

  // Query state
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Debounced query for API

  // Results state
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [total, setTotal] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [empty, setEmpty] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
  });

  // Filters state
  const [filters, setFiltersState] = useState(defaultFilters);

  // Refs for cleanup and cancellation
  const abortControllerRef = useRef(null);
  const suggestionsAbortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Perform the actual search
   */
  const performSearch = useCallback(async (searchTerm, searchFilters = {}) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);
    setEmpty(false);

    try {
      const params = {
        q: searchTerm || undefined,
        page: pagination.current_page,
        per_page: pagination.per_page,
        sort_by: 'relevance',
        sort_order: 'desc',
        ...searchFilters,
      };

      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await taskSearchService.search(params);

      if (!mountedRef.current || abortController.signal.aborted) {
        return;
      }

      setResults(data.data || []);
      setTotal(data.meta?.total || 0);
      setPagination({
        current_page: data.meta?.current_page || 1,
        last_page: data.meta?.last_page || 1,
        per_page: data.meta?.per_page || 15,
      });
      setEmpty((data.meta?.total || 0) === 0);
    } catch (err) {
      if (!mountedRef.current || abortController.signal.aborted) {
        return;
      }

      if (err.name === 'AbortError') {
        return;
      }

      setError(err.message || 'Search failed. Please try again.');
      setResults([]);
      setTotal(0);
      setEmpty(true);
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [pagination.current_page, pagination.per_page]);

  /**
   * Get search suggestions for autocomplete
   */
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel any pending suggestion request
    if (suggestionsAbortControllerRef.current) {
      suggestionsAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    suggestionsAbortControllerRef.current = abortController;

    setSuggestionsLoading(true);

    try {
      const data = await taskSearchService.suggestions(searchTerm);

      if (!mountedRef.current || abortController.signal.aborted) {
        return;
      }

      setSuggestions(data.suggestions || []);
    } catch (err) {
      if (!mountedRef.current || abortController.signal.aborted) {
        return;
      }
      // Silently fail for suggestions
      setSuggestions([]);
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setSuggestionsLoading(false);
      }
    }
  }, []);

  /**
   * Set the search query with debouncing
   */
  const setSearchQueryWithDebounce = useCallback(
    (newQuery) => {
      setQuery(newQuery);

      // Clear existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new debounce timeout
      debounceTimeoutRef.current = setTimeout(() => {
        setSearchQuery(newQuery);
        performSearch(newQuery, filters);
      }, debounceMs);
    },
    [debounceMs, filters, performSearch]
  );

  /**
   * Update filters and refetch
   */
  const updateFilters = useCallback(
    (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFiltersState(updatedFilters);
      performSearch(searchQuery, updatedFilters);
    },
    [filters, searchQuery, performSearch]
  );

  /**
   * Clear search and reset state
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setSearchQuery('');
    setResults([]);
    setSuggestions([]);
    setTotal(0);
    setError(null);
    setEmpty(false);
    setFiltersState(defaultFilters);
  }, [defaultFilters]);

  /**
   * Go to a specific page
   */
  const goToPage = useCallback(
    (page) => {
      setPagination((prev) => ({ ...prev, current_page: page }));
      performSearch(searchQuery, { ...filters, page });
    },
    [searchQuery, filters, performSearch]
  );

  /**
   * Refresh current search
   */
  const refresh = useCallback(() => {
    performSearch(searchQuery, filters);
  }, [searchQuery, filters, performSearch]);

  // Auto-search on mount if enabled
  useEffect(() => {
    if (autoSearch && mountedRef.current) {
      performSearch('', filters);
    }
  }, [autoSearch, filters, performSearch]);

  return {
    // State
    query,
    results,
    suggestions,
    suggestionsLoading,
    total,
    loading,
    error,
    empty,
    pagination,
    filters,

    // Methods
    setQuery: setSearchQueryWithDebounce,
    fetchSuggestions,
    updateFilters,
    clearSearch,
    goToPage,
    refresh,
    performSearch: () => performSearch(searchQuery, filters),

    // Setters
    setFilters: setFiltersState,
  };
};

export default useTaskSearch;
