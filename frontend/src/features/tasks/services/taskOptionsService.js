/**
 * Tasks Feature - Task Options Service
 * 
 * API service for task options (statuses, priorities).
 * 
 * @module features/tasks/services
 */

import { apiClient } from '../../../core/api/index.js';

/**
 * Task Options API endpoints
 */
const endpoints = {
  options: '/tasks/options',
};

/**
 * Task options service object
 */
const taskOptionsService = {
  /**
   * Get all task options (statuses, priorities, filter options)
   * @returns {Promise<Object>} Task options data
   */
  async getOptions() {
    const data = await apiClient.get(endpoints.options);
    return data;
  },

  /**
   * Get status options for dropdowns
   * @returns {Promise<Array>} Status options
   */
  async getStatuses() {
    const response = await this.getOptions();
    return response.data?.statuses || response.statuses || [];
  },

  /**
   * Get priority options for dropdowns
   * @returns {Promise<Array>} Priority options
   */
  async getPriorities() {
    const response = await this.getOptions();
    return response.data?.priorities || response.priorities || [];
  },

  /**
   * Get status options for filtering (includes 'all' option)
   * @returns {Promise<Array>} Status filter options
   */
  async getStatusFilterOptions() {
    const response = await this.getOptions();
    return response.data?.statusFilterOptions || response.statusFilterOptions || [];
  },

  /**
   * Get priority options for filtering (includes 'all' option)
   * @returns {Promise<Array>} Priority filter options
   */
  async getPriorityFilterOptions() {
    const response = await this.getOptions();
    return response.data?.priorityFilterOptions || response.priorityFilterOptions || [];
  },
};

export default taskOptionsService;
