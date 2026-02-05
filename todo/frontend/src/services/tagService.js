import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// Add auth interceptor to include token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const tagService = {
  async getTags() {
    const response = await api.get('/tags')
    // Backend returns: { data: [...] }
    return response.data
  },

  async getTag(id) {
    const response = await api.get(`/tags/${id}`)
    // Backend returns: { data: TagResource }
    return response.data.data
  },

  async createTag(data) {
    const response = await api.post('/tags', data)
    // Backend returns: { message, data: TagResource }
    return response.data
  },

  async updateTag(id, data) {
    const response = await api.put(`/tags/${id}`, data)
    // Backend returns: { message, data: TagResource }
    return response.data
  },

  async deleteTag(id) {
    const response = await api.delete(`/tags/${id}`)
    // Backend returns: { message }
    return response.data
  }
}
