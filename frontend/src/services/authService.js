// src/services/authService.js
import axios from 'axios'

// ✅ یک instance ساده
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const language = localStorage.getItem('app_language') || 'en'
  config.headers['Accept-Language'] = language

  return config
})

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

export const initCsrf = async () => {
  return
}

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    const { data } = response.data

    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }

    return {
      user: data.user,
      token: data.token,
    }
  },

  async register(name, email, password, passwordConfirmation) {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    const { data } = response.data

    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }

    return {
      user: data.user,
      token: data.token,
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.warn('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
    }
  },

  async getUser() {
    const token = localStorage.getItem('auth_token')
    if (!token) return null

    try {
      const response = await api.get('/auth/me')
      return response.data.data
    } catch {
      localStorage.removeItem('auth_token')
      return null
    }
  },
}

export { api }