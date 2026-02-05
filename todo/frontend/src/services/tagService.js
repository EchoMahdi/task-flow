import { api, initCsrf } from './authService'

export const tagService = {
  async getTags() {
    const response = await api.get('/tags')
    return response.data
  },

  async getTag(id) {
    const response = await api.get(`/tags/${id}`)
    return response.data.data
  },

  async createTag(data) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.post('/tags', data)
    return response.data
  },

  async updateTag(id, data) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.put(`/tags/${id}`, data)
    return response.data
  },

  async deleteTag(id) {
    await initCsrf() // Ensure CSRF is initialized
    const response = await api.delete(`/tags/${id}`)
    return response.data
  }
}
