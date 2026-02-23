/**
 * Tasks Feature - Subtask Service
 * 
 * API service for subtask-related operations.
 * 
 * @module features/tasks/services
 */

import { apiClient } from '../../../core/api/index.js';

/**
 * Subtask API endpoints
 */
const endpoints = {
  base: (taskId) => `/tasks/${taskId}/subtasks`,
  byId: (taskId, subtaskId) => `/tasks/${taskId}/subtasks/${subtaskId}`,
  toggle: (taskId, subtaskId) => `/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
};

/**
 * Subtask service object
 */
const subtaskService = {
  /**
   * Get all subtasks for a task
   * @param {number|string} taskId - Task ID
   * @returns {Promise<Object>} Subtasks data
   */
  async getSubtasks(taskId) {
    const data = await apiClient.get(endpoints.base(taskId));
    return data.data || data;
  },

  /**
   * Create a new subtask
   * @param {number|string} taskId - Task ID
   * @param {Object} data - Subtask data
   * @returns {Promise<Object>} Created subtask
   */
  async createSubtask(taskId, data) {
    const result = await apiClient.post(endpoints.base(taskId), data);
    return result.data || result;
  },

  /**
   * Update a subtask
   * @param {number|string} taskId - Task ID
   * @param {number|string} subtaskId - Subtask ID
   * @param {Object} data - Subtask data
   * @returns {Promise<Object>} Updated subtask
   */
  async updateSubtask(taskId, subtaskId, data) {
    const result = await apiClient.put(endpoints.byId(taskId, subtaskId), data);
    return result.data || result;
  },

  /**
   * Toggle subtask completion
   * @param {number|string} taskId - Task ID
   * @param {number|string} subtaskId - Subtask ID
   * @returns {Promise<Object>} Updated subtask
   */
  async toggleSubtaskComplete(taskId, subtaskId) {
    const result = await apiClient.patch(endpoints.toggle(taskId, subtaskId));
    return result.data || result;
  },

  /**
   * Delete a subtask
   * @param {number|string} taskId - Task ID
   * @param {number|string} subtaskId - Subtask ID
   * @returns {Promise<void>}
   */
  async deleteSubtask(taskId, subtaskId) {
    return apiClient.delete(endpoints.byId(taskId, subtaskId));
  },
};

export default subtaskService;
