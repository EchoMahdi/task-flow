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
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    
    // Backend returns: { success, message, data: { user, token, token_type, expires_at, session } }
    const { data } = response.data
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }
    
    return {
      user: data.user,
      token: data.token,
      tokenType: data.token_type,
      expiresAt: data.expires_at,
      session: data.session
    }
  },

  async register(name, email, password, passwordConfirmation) {
    const response = await api.post('/auth/register', { 
      name, 
      email, 
      password, 
      password_confirmation: passwordConfirmation 
    })
    
    // Backend returns: { success, message, data: { user, token } }
    const { data } = response.data
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }
    
    return {
      user: data.user,
      token: data.token
    }
  },

  async logout() {
    localStorage.removeItem('auth_token')
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignore logout errors - token might already be invalid
      console.warn('Logout error:', error)
    }
  },

  async getUser() {
    const token = localStorage.getItem('auth_token')
    if (!token) return null
    
    try {
      const response = await api.get('/auth/me')
      // Backend returns: { success, data: UserResource }
      return response.data.data
    } catch (error) {
      localStorage.removeItem('auth_token')
      return null
    }
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh')
    const { data } = response.data
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }
    
    return {
      token: data.token,
      session: data.session
    }
  }
}
