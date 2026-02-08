import { api } from './authService'

export const taskOptionsService = {
  /**
   * Get all task options (statuses, priorities, filter options)
   * @returns {Promise<{data: {statuses: Array, priorities: Array, statusFilterOptions: Array, priorityFilterOptions: Array}}>}
   */
  async getOptions() {
    const response = await api.get('/tasks/options')
    return response.data
  },

  /**
   * Get status options for dropdowns
   * @returns {Promise<Array<{value: string, label: string, color?: string}>>}
   */
  async getStatuses() {
    const response = await this.getOptions()
    return response.data.statuses
  },

  /**
   * Get priority options for dropdowns
   * @returns {Promise<Array<{value: string, label: string, color?: string}>>}
   */
  async getPriorities() {
    const response = await this.getOptions()
    return response.data.priorities
  },

  /**
   * Get status options for filtering (includes 'all' option)
   * @returns {Promise<Array<{value: string, label: string}>>}
   */
  async getStatusFilterOptions() {
    const response = await this.getOptions()
    return response.data.statusFilterOptions
  },

  /**
   * Get priority options for filtering (includes 'all' option)
   * @returns {Promise<Array<{value: string, label: string}>>}
   */
  async getPriorityFilterOptions() {
    const response = await this.getOptions()
    return response.data.priorityFilterOptions
  }
}
