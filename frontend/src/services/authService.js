// src/services/authService.js

import axios from 'axios';

// ─── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// ─── CSRF Management ───────────────────────────────────────────────────────────

let csrfInitialized = false;
let csrfInitPromise = null;

export const resetCsrf = () => {
  csrfInitialized = false;
  csrfInitPromise = null;
};

export const getCsrfToken = () => {
  const matches = document.cookie.match(/(^| )XSRF-TOKEN=([^;]+)/);
  return matches ? decodeURIComponent(matches[2]) : null;
};

export const initCsrf = () => {
  if (csrfInitialized) return Promise.resolve();

  // Prevent race condition: reuse in-flight promise
  if (csrfInitPromise) return csrfInitPromise;

  csrfInitPromise = api
    .get('/sanctum/csrf-cookie')
    .then(() => {
      csrfInitialized = true;
      csrfInitPromise = null;
    })
    .catch((err) => {
      csrfInitPromise = null;
      console.error('[CSRF] Failed to initialize:', err);
    });

  return csrfInitPromise;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  config.headers['Accept-Language'] = localStorage.getItem('app_language') || 'en';

  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('auth_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/app/login';
      }
    }

    // Reset CSRF state on 419 so next request re-initializes it
    if (status === 419) {
      resetCsrf();
    }

    return Promise.reject(error);
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractData = (response) => {
  if (response.data?.success === false) {
    throw new Error(response.data.message || 'Request failed');
  }
  return response.data?.data ?? response.data;
};

const saveToken = (token) => {
  if (token) localStorage.setItem('auth_token', token);
};

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {

  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object, token: string}>}
   */
  async login(email, password) {
    await initCsrf();
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = extractData(response);
    saveToken(token);
    return { user, token };
  },

  /**
   * Register a new user
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} passwordConfirmation
   * @returns {Promise<{user: object, token: string}>}
   */
  async register(name, email, password, passwordConfirmation) {
    await initCsrf();
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    const { user, token } = extractData(response);
    saveToken(token);
    return { user, token };
  },

  /**
   * Logout the current user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('[Auth] Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      resetCsrf();
    }
  },

  /**
   * Fetch the authenticated user
   * @returns {Promise<object|null>}
   */
  async getUser() {
    try {
      const response = await api.get('/auth/me');
      return extractData(response);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        return null;
      }
      throw error;
    }
  },

  /**
   * Send a password reset email
   * @param {string} email
   */
  async forgotPassword(email) {
    await initCsrf();
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password using token from email
   * @param {string} token
   * @param {string} password
   * @param {string} passwordConfirmation
   */
  async resetPassword(token, password, passwordConfirmation) {
    await initCsrf();
    const response = await api.post('/auth/reset-password', {
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  },

  /**
   * Check if a user is currently authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const user = await this.getUser();
    return !!user;
  },
};

export { api };
