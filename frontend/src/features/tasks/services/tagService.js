/**
 * Tasks Feature - Tag Service
 * 
 * API service for tag-related operations.
 * 
 * @module features/tasks/services
 */

import { apiClient } from '@/core/api/index.js';

/**
 * Tag API endpoints
 */
const endpoints = {
  base: '/tags',
  byId: (id) => `/tags/${id}`,
};

/**
 * Tag service object
 */
const tagService = {
  /**
   * Get all tags
   * @returns {Promise<Object>} Tags data
   */
  async getTags() {
    const data = await apiClient.get(endpoints.base);
    return data;
  },

  /**
   * Get a single tag by ID
   * @param {number|string} id - Tag ID
   * @returns {Promise<Object>} Tag data
   */
  async getTag(id) {
    const data = await apiClient.get(endpoints.byId(id));
    return data.data || data;
  },

  /**
   * Create a new tag
   * @param {Object} data - Tag data
   * @returns {Promise<Object>} Created tag
   */
  async createTag(data) {
    const result = await apiClient.post(endpoints.base, data);
    return result;
  },

  /**
   * Update a tag
   * @param {number|string} id - Tag ID
   * @param {Object} data - Tag data
   * @returns {Promise<Object>} Updated tag
   */
  async updateTag(id, data) {
    const result = await apiClient.put(endpoints.byId(id), data);
    return result;
  },

  /**
   * Delete a tag
   * @param {number|string} id - Tag ID
   * @returns {Promise<void>}
   */
  async deleteTag(id) {
    return apiClient.delete(endpoints.byId(id));
  },
};

export default tagService;
