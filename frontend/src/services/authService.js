// src/services/authService.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Required for Sanctum CSRF cookies
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

  // Add CSRF token to requests if available
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
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

// Track CSRF initialization status
let csrfInitialized = false;

/**
 * Initialize CSRF token for Laravel Sanctum
 * This must be called before making any state-changing requests
 */
export const initCsrf = async () => {
  // Skip if already initialized or if no token support
  if (csrfInitialized) return;
  
  try {
    // Fetch CSRF token from Laravel Sanctum
    // This sets the XSRF-TOKEN cookie
    await api.get('/sanctum/csrf-cookie', {
      withCredentials: true // Important: send cookies for cross-site requests
    });
    csrfInitialized = true;
    console.log('[CSRF] Token initialized successfully');
  } catch (error) {
    console.error('[CSRF] Failed to initialize CSRF token:', error);
    // Don't throw - allow the app to continue, requests will fail anyway
  }
}

/**
 * Get the CSRF token from the cookie
 * Must be called after initCsrf()
 */
export const getCsrfToken = () => {
  const name = 'XSRF-TOKEN';
  const matches = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (matches) {
    return decodeURIComponent(matches[2]);
  }
  return null;
};

export const authService = {
  async login(email, password) {
    // Initialize CSRF before login (required for Sanctum)
    await initCsrf();
    
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
    // Initialize CSRF before registration (required for Sanctum)
    await initCsrf();
    
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