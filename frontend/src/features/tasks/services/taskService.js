/**
 * Tasks Feature - Service
 * 
 * API service for task-related operations.
 * All task API calls are contained within this service.
 * 
 * @module features/tasks/services
 */

import { apiClient } from '../../../core/api/index.js';

/**
 * Task API endpoints
 */
const endpoints = {
  base: '/tasks',
  byId: (id) => `/tasks/${id}`,
  subtasks: (id) => `/tasks/${id}/subtasks`,
  tags: (id) => `/tasks/${id}/tags`,
  batch: '/tasks/batch',
  search: '/tasks/search',
  export: '/tasks/export',
  standalone: '/tasks/standalone',
};

/**
 * Task service object
 * All methods return data in the format expected by consumers (data, current_page, etc.)
 */
const taskService = {
  /**
   * Get all tasks with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response with data array and pagination
   */
  async getTasks(params = {}) {
    const data = await apiClient.get(endpoints.base, params);
    // Return in format: { data: [...], current_page: x, last_page: y, total: z }
    return {
      data: data.data || [],
      current_page: data.current_page || 1,
      last_page: data.last_page || 1,
      total: data.total || 0,
      per_page: data.per_page || 15,
    };
  },

  /**
   * Get a single task by ID
   * @param {number|string} id - Task ID
   * @returns {Promise<Object>} Task data object
   */
  async getTask(id) {
    const data = await apiClient.get(endpoints.byId(id));
    return data.data || data;
  },

  /**
   * Create a new task
   * @param {Object} data - Task data
   * @returns {Promise<Object>}
   */
  async createTask(data) {
    const result = await apiClient.post(endpoints.base, data);
    return result;
  },

  /**
   * Update an existing task
   * @param {number|string} id - Task ID
   * @param {Object} data - Task data
   * @returns {Promise<Object>}
   */
  async updateTask(id, data) {
    const result = await apiClient.put(endpoints.byId(id), data);
    return result;
  },

  /**
   * Partially update a task
   * @param {number|string} id - Task ID
   * @param {Object} data - Partial task data
   * @returns {Promise<Object>}
   */
  async patchTask(id, data) {
    const result = await apiClient.patch(endpoints.byId(id), data);
    return result;
  },

  /**
   * Delete a task
   * @param {number|string} id - Task ID
   * @returns {Promise<void>}
   */
  async deleteTask(id) {
    return apiClient.delete(endpoints.byId(id));
  },

  /**
   * Mark a task as complete
   * @param {number|string} id - Task ID
   * @returns {Promise<Object>}
   */
  async completeTask(id) {
    return apiClient.patch(endpoints.byId(id), { is_completed: true, status: 'completed' });
  },

  /**
   * Mark a task as incomplete
   * @param {number|string} id - Task ID
   * @returns {Promise<Object>}
   */
  async incompleteTask(id) {
    return apiClient.patch(endpoints.byId(id), { is_completed: false, status: 'pending' });
  },

  /**
   * Batch update tasks
   * @param {Object[]} updates - Array of task updates
   * @returns {Promise<Object>}
   */
  async batchUpdate(updates) {
    return apiClient.post(endpoints.batch, { updates });
  },

  /**
   * Batch delete tasks
   * @param {number[]} ids - Array of task IDs
   * @returns {Promise<void>}
   */
  async batchDelete(ids) {
    return apiClient.delete(endpoints.batch, { body: { ids } });
  },

  /**
   * Search tasks
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>}
   */
  async searchTasks(params) {
    return apiClient.post(endpoints.search, params);
  },

  /**
   * Export tasks
   * @param {Object} params - Export parameters
   * @returns {Promise<Blob>}
   */
  async exportTasks(params = {}) {
    return apiClient.get(endpoints.export, params);
  },

  /**
   * Update task status
   * @param {number|string} id - Task ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status) {
    return apiClient.patch(endpoints.byId(id), { status });
  },

  /**
   * Update task priority
   * @param {number|string} id - Task ID
   * @param {string} priority - New priority
   * @returns {Promise<Object>}
   */
  async updatePriority(id, priority) {
    return apiClient.patch(endpoints.byId(id), { priority });
  },

  /**
   * Assign task to user
   * @param {number|string} id - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async assignTask(id, userId) {
    return apiClient.patch(endpoints.byId(id), { assignee_id: userId });
  },

  /**
   * Move task to project
   * @param {number|string} id - Task ID
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>}
   */
  async moveToProject(id, projectId) {
    return apiClient.patch(endpoints.byId(id), { project_id: projectId });
  },

  // =========================================================================
  // Standalone Tasks (tasks without project)
  // =========================================================================

  /**
   * Get all standalone tasks (tasks without a project)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Tasks data with meta
   */
  async getStandaloneTasks(params = {}) {
    const data = await apiClient.get(endpoints.standalone, params);
    return {
      data: data.data || [],
      current_page: data.current_page || 1,
      last_page: data.last_page || 1,
      total: data.total || 0,
      per_page: data.per_page || 15,
    };
  },

  /**
   * Assign a task to a project
   * @param {number} taskId - Task ID
   * @param {number|null} projectId - Project ID or null to make standalone
   * @returns {Promise<Object>} Updated task
   */
  async assignToProject(taskId, projectId) {
    return apiClient.patch(`/tasks/${taskId}/assign-project`, {
      project_id: projectId
    });
  },

  /**
   * Remove a task from its project (make it standalone)
   * @param {number} taskId - Task ID
   * @returns {Promise<Object>} Updated task
   */
  async removeFromProject(taskId) {
    return apiClient.patch(`/tasks/${taskId}/remove-from-project`);
  },

  /**
   * Bulk assign tasks to a project
   * @param {number[]} taskIds - Array of task IDs
   * @param {number|null} projectId - Project ID or null to make all standalone
   * @returns {Promise<Object>} Result with updated count
   */
  async bulkAssignToProject(taskIds, projectId) {
    return apiClient.post('/tasks/bulk-assign-project', {
      task_ids: taskIds,
      project_id: projectId
    });
  },

  /**
   * Bulk update tasks
   * @param {number[]} taskIds - Array of task IDs
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Result
   */
  async bulkUpdate(taskIds, updates) {
    return apiClient.post('/tasks/bulk-update', {
      task_ids: taskIds,
      ...updates
    });
  },

  /**
   * Bulk delete tasks
   * @param {number[]} taskIds - Array of task IDs
   * @returns {Promise<Object>} Result
   */
  async bulkDelete(taskIds) {
    return apiClient.post('/tasks/bulk-delete', {
      task_ids: taskIds
    });
  },

  // =========================================================================
  // Subtasks
  // =========================================================================

  /**
   * Get task subtasks
   * @param {number|string} id - Task ID
   * @returns {Promise<Object>}
   */
  async getSubtasks(id) {
    return apiClient.get(endpoints.subtasks(id));
  },

  /**
   * Create subtask
   * @param {number|string} taskId - Task ID
   * @param {Object} data - Subtask data
   * @returns {Promise<Object>}
   */
  async createSubtask(taskId, data) {
    return apiClient.post(endpoints.subtasks(taskId), data);
  },

  /**
   * Update subtask
   * @param {number|string} taskId - Task ID
   * @param {number|string} subtaskId - Subtask ID
   * @param {Object} data - Subtask data
   * @returns {Promise<Object>}
   */
  async updateSubtask(taskId, subtaskId, data) {
    return apiClient.put(`${endpoints.subtasks(taskId)}/${subtaskId}`, data);
  },

  /**
   * Delete subtask
   * @param {number|string} taskId - Task ID
   * @param {number|string} subtaskId - Subtask ID
   * @returns {Promise<void>}
   */
  async deleteSubtask(taskId, subtaskId) {
    return apiClient.delete(`${endpoints.subtasks(taskId)}/${subtaskId}`);
  },

  /**
   * Toggle subtask completion
   * @param {number|string} taskId - Task ID
   * @param {number|string} subtaskId - Subtask ID
   * @param {boolean} completed - Completion status
   * @returns {Promise<Object>}
   */
  async toggleSubtask(taskId, subtaskId, completed) {
    return apiClient.patch(`${endpoints.subtasks(taskId)}/${subtaskId}`, { completed });
  },

  // =========================================================================
  // Tags
  // =========================================================================

  /**
   * Sync task tags
   * @param {number|string} id - Task ID
   * @param {number[]} tagIds - Tag IDs
   * @returns {Promise<Object>}
   */
  async syncTags(id, tagIds) {
    return apiClient.post(endpoints.tags(id), { tag_ids: tagIds });
  },

  /**
   * Add tag to task
   * @param {number|string} id - Task ID
   * @param {number} tagId - Tag ID
   * @returns {Promise<Object>}
   */
  async addTag(id, tagId) {
    return apiClient.post(endpoints.tags(id), { tag_id: tagId });
  },

  /**
   * Remove tag from task
   * @param {number|string} id - Task ID
   * @param {number} tagId - Tag ID
   * @returns {Promise<void>}
   */
  async removeTag(id, tagId) {
    return apiClient.delete(`${endpoints.tags(id)}/${tagId}`);
  },
};

export { taskService, endpoints };
export default taskService;
