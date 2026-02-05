import axios from 'axios'

// Create axios instance for API calls (with /api prefix)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// Create axios instance for CSRF calls (without /api prefix)
const csrfApi = axios.create({
  withCredentials: true,
})

// Initialize CSRF protection for Laravel Sanctum
const csrfState = {
  token: null,
  initialized: false,
}

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'XSRF-TOKEN='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return null
}

// Initialize CSRF token
export const initCsrf = async () => {
  if (csrfState.initialized) return

  try {
    // Make request to /sanctum/csrf-cookie (this gets proxied to Laravel)
    await csrfApi.get('/sanctum/csrf-cookie')
    csrfState.token = getCsrfToken()
    csrfState.initialized = true
    console.log('CSRF token initialized successfully')
  } catch (error) {
    console.warn('Failed to initialize CSRF token:', error.message)
    // Don't block the app if CSRF fails
    csrfState.initialized = true
  }
}

// Add auth interceptor to include token in requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add language header for backend i18n
    const language = localStorage.getItem('app_language') || 'en'
    config.headers['Accept-Language'] = language
    
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

export const authService = {
  async login(email, password) {
    // Initialize CSRF before login
    await initCsrf()
    
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
    // Initialize CSRF before registration
    await initCsrf()
    
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
      console.warn('Logout error:', error)
    }
  },

  async getUser() {
    const token = localStorage.getItem('auth_token')
    if (!token) return null
    
    try {
      const response = await api.get('/auth/me')
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

// Also export for use in other services
export { api }
