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

export const taskService = {
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params })
    // Backend returns: { data: [...], meta: {...} }
    return response.data
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`)
    // Backend returns: { data: TaskResource }
    return response.data.data
  },

  async createTask(data) {
    const response = await api.post('/tasks', data)
    // Backend returns: { message, data: TaskResource }
    return response.data
  },

  async updateTask(id, data) {
    const response = await api.put(`/tasks/${id}`, data)
    // Backend returns: { message, data: TaskResource }
    return response.data
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`)
    // Backend returns: { message }
    return response.data
  },

  async completeTask(id) {
    const response = await api.patch(`/tasks/${id}/complete`)
    // Backend returns: { message, data: TaskResource }
    return response.data
  },

  async incompleteTask(id) {
    const response = await api.patch(`/tasks/${id}/incomplete`)
    // Backend returns: { message, data: TaskResource }
    return response.data
  }
}
