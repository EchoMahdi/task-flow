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
  serverError: null, // Track server errors to prevent infinite loops
}

// Storage key for CSRF state persistence across HMR
const CSRF_STORAGE_KEY = 'csrf_token';

// Load CSRF token from localStorage if available
const loadCsrfFromStorage = () => {
  try {
    const stored = localStorage.getItem(CSRF_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if token is less than 1 hour old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
        csrfState.token = parsed.token;
        csrfState.initialized = true;
        return true;
      }
    }
  } catch (e) {
    console.warn('[CSRF DEBUG] Failed to load CSRF from storage:', e);
  }
  return false;
};

// Save CSRF token to localStorage
const saveCsrfToStorage = (token) => {
  try {
    localStorage.setItem(CSRF_STORAGE_KEY, JSON.stringify({
      token,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('[CSRF DEBUG] Failed to save CSRF to storage:', e);
  }
};

// Try to load from storage on module load
loadCsrfFromStorage();

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

  // Don't retry if previously failed with server error (prevent infinite loops)
  if (csrfState.initialized && csrfState.token) {
    return;
  }
  
  // If we've already tried and failed with server error, don't retry immediately
  if (csrfState.serverError && Date.now() - csrfState.serverError < 60000) {
    csrfState.initialized = true;
    return;
  }

  try {
    // Make request to /sanctum/csrf-cookie (this gets proxied to Laravel)
    await csrfApi.get('/sanctum/csrf-cookie');
    csrfState.token = getCsrfToken();
    csrfState.initialized = true;
    csrfState.serverError = null; // Clear any previous server error
    
    // Save to localStorage for persistence across HMR
    if (csrfState.token) {
      saveCsrfToStorage(csrfState.token);
    }
    
  } catch (error) {
    // Check if it's a server error (5xx)
    const isServerError = error.response?.status >= 500;
    
    if (isServerError) {
      csrfState.serverError = Date.now();
    }
    
    // Don't block the app if CSRF fails (we're using token-based auth)
    csrfState.initialized = true;
  }
}

// Add auth interceptor to include token in requests
api.interceptors.request.use(
  async (config) => {
    // Add XSRF token to header if available
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
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
  async (error) => {
    const originalRequest = error.config;
    
    // DEBUG: Log error details
    const errorStatus = error.response?.status;
    const errorMessage = error.message;
    
    // Handle network errors (backend unreachable)
    if (!error.response && error.message === 'Network Error') {
      console.error('[CSRF DEBUG] Network Error: Backend server is not reachable. Please ensure Laravel is running on port 8000.');
      return Promise.reject(error);
    }
    
    // Handle CSRF token mismatch (419) - refresh token and retry
    if (errorStatus === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh CSRF token
        await initCsrf();
        
        // Get fresh token and add to headers
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          originalRequest.headers['X-XSRF-TOKEN'] = csrfToken;
        }
        
        return api(originalRequest);
      } catch (csrfError) {
        console.error('[CSRF DEBUG] Failed to refresh CSRF token:', csrfError);
      }
    }
    
    if (errorStatus === 401) {
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
