import { api, initCsrf } from './authService'

export const subtaskService = {
  async getSubtasks(taskId) {
    const response = await api.get(`/tasks/${taskId}/subtasks`)
    return response.data.data
  },

  async createSubtask(taskId, data) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.post(`/tasks/${taskId}/subtasks`, data)
    return response.data.data
  },

  async updateSubtask(taskId, subtaskId, data) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data)
    return response.data.data
  },

  async toggleSubtaskComplete(taskId, subtaskId) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`)
    return response.data.data
  },

  async deleteSubtask(taskId, subtaskId) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
    return response.data
  }
}
