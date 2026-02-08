import { api, initCsrf } from './authService'

export const taskService = {
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params })
    return response.data
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`)
    return response.data.data
  },

  async createTask(data) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.post('/tasks', data)
    return response.data
  },

  async updateTask(id, data) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.put(`/tasks/${id}`, data)
    return response.data
  },

  async deleteTask(id) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },

  async completeTask(id) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.patch(`/tasks/${id}/complete`)
    return response.data
  },

  async incompleteTask(id) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.patch(`/tasks/${id}/incomplete`)
    return response.data
  }
}
