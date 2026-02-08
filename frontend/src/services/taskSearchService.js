/**
 * ============================================================================
 * Task Search Service
 *
 * Backend-agnostic service for task search operations.
 * Works with the Laravel TaskSearchService API endpoints.
 * ============================================================================
 */

import { api, initCsrf } from './authService';

export const taskSearchService = {
  /**
   * Full search with pagination and filters
   *
   * @param {Object} params - Search parameters
   * @param {string} params.q - Search query
   * @param {number} [params.project_id] - Filter by project
   * @param {string} [params.priority] - Filter by priority (low, medium, high)
   * @param {boolean} [params.is_completed] - Filter by completion status
   * @param {number} [params.tag_id] - Filter by tag
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.per_page=15] - Items per page (max 100)
   * @param {string} [params.sort_by='relevance'] - Sort field (relevance, priority, due_date, created_at, title)
   * @param {string} [params.sort_order='desc'] - Sort order (asc, desc)
   * @returns {Promise<Object>} Search results with pagination metadata
   */
  async search(params = {}) {
    const response = await api.get('/tasks/search', { params });
    return response.data;
  },

  /**
   * Quick search for autocomplete (lightweight, fewer fields)
   *
   * @param {string} query - Search query (required)
   * @param {number} [limit=10] - Maximum number of results
   * @param {number} [project_id] - Optional project filter
   * @returns {Promise<Object>} Quick search results
   */
  async quickSearch(query, limit = 10, project_id = null) {
    const params = { q: query, limit };
    if (project_id !== null) {
      params.project_id = project_id;
    }
    const response = await api.get('/tasks/search/quick', { params });
    return response.data;
  },

  /**
   * Get search suggestions for autocomplete dropdowns
   *
   * @param {string} query - Partial search query (required)
   * @returns {Promise<Object>} Suggestions array
   */
  async suggestions(query) {
    const response = await api.get('/tasks/search/suggestions', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Check if a search query would return results (for UI hints)
   *
   * @param {string} query - Search query
   * @param {Object} [filters] - Additional filters
   * @returns {Promise<boolean>} Whether results exist
   */
  async hasResults(query, filters = {}) {
    const response = await api.get('/tasks/search', {
      params: { q: query, ...filters, per_page: 1 },
    });
    return response.data.meta.total > 0;
  },
};

export default taskSearchService;
