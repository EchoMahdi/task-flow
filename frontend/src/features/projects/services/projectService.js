/**
 * Projects Feature - Service
 * 
 * API service for project-related operations.
 * 
 * @module features/projects/services
 */

import { apiClient } from '../../../core/api/index.js';

/**
 * Project API endpoints
 */
const endpoints = {
  base: '/projects',
  byId: (id) => `/projects/${id}`,
  tasks: (id) => `/projects/${id}/tasks`,
  members: (id) => `/projects/${id}/members`,
  stats: (id) => `/projects/${id}/stats`,
  favorite: (id) => `/projects/${id}/favorite`,
  statistics: (id) => `/projects/${id}/statistics`,
};

/**
 * Project service object
 * All methods return data in the format expected by consumers
 */
const projectService = {
  /**
   * Get all projects
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Projects data with meta
   */
  async getProjects(params = {}) {
    const data = await apiClient.get(endpoints.base, params);
    // Return in format: { data: [...], current_page: x, last_page: y, total: z }
    return {
      data: data.data || data.projects || [],
      current_page: data.current_page || 1,
      last_page: data.last_page || 1,
      total: data.total || 0,
      per_page: data.per_page || 15,
    };
  },

  /**
   * Get a single project by ID
   * @param {number|string} id - Project ID
   * @returns {Promise<Object>} Project data
   */
  async getProject(id) {
    const data = await apiClient.get(endpoints.byId(id));
    return data.data || data;
  },

  /**
   * Create a new project
   * @param {Object} data - Project data
   * @returns {Promise<Object>}
   */
  async createProject(data) {
    return apiClient.post(endpoints.base, data);
  },

  /**
   * Update an existing project
   * @param {number|string} id - Project ID
   * @param {Object} data - Project data
   * @returns {Promise<Object>}
   */
  async updateProject(id, data) {
    return apiClient.put(endpoints.byId(id), data);
  },

  /**
   * Delete a project
   * @param {number|string} id - Project ID
   * @returns {Promise<void>}
   */
  async deleteProject(id) {
    return apiClient.delete(endpoints.byId(id));
  },

  /**
   * Update project favorite status
   * @param {number|string} id - Project ID
   * @param {boolean} isFavorite - Favorite status
   * @returns {Promise<Object>}
   */
  async updateFavorite(id, isFavorite) {
    return apiClient.patch(endpoints.favorite(id), { is_favorite: isFavorite });
  },

  /**
   * Get project tasks
   * @param {number|string} id - Project ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Tasks data with meta
   */
  async getProjectTasks(id, params = {}) {
    const data = await apiClient.get(endpoints.tasks(id), params);
    return {
      data: data.data || [],
      current_page: data.current_page || 1,
      last_page: data.last_page || 1,
      total: data.total || 0,
      per_page: data.per_page || 15,
    };
  },

  /**
   * Get project members
   * @param {number|string} id - Project ID
   * @returns {Promise<Object>}
   */
  async getProjectMembers(id) {
    return apiClient.get(endpoints.members(id));
  },

  /**
   * Add member to project
   * @param {number|string} id - Project ID
   * @param {number} userId - User ID
   * @param {string} role - Member role
   * @returns {Promise<Object>}
   */
  async addMember(id, userId, role = 'member') {
    return apiClient.post(endpoints.members(id), { user_id: userId, role });
  },

  /**
   * Remove member from project
   * @param {number|string} id - Project ID
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async removeMember(id, userId) {
    return apiClient.delete(`${endpoints.members(id)}/${userId}`);
  },

  /**
   * Get project statistics
   * @param {number|string} id - Project ID
   * @returns {Promise<Object>}
   */
  async getProjectStats(id) {
    return apiClient.get(endpoints.stats(id));
  },

  /**
   * Get project statistics (alias for getProjectStats)
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Project statistics
   */
  async getProjectStatistics(projectId) {
    return apiClient.get(endpoints.statistics(projectId));
  },

  /**
   * Archive project
   * @param {number|string} id - Project ID
   * @returns {Promise<Object>}
   */
  async archiveProject(id) {
    return apiClient.patch(endpoints.byId(id), { status: 'archived' });
  },

  /**
   * Restore archived project
   * @param {number|string} id - Project ID
   * @returns {Promise<Object>}
   */
  async restoreProject(id) {
    return apiClient.patch(endpoints.byId(id), { status: 'active' });
  },
};

export { projectService, endpoints };
export default projectService;
