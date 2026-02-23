/**
 * Core API Client
 * 
 * Centralized HTTP client for all API communications.
 * Handles authentication, error handling, and request/response interceptors.
 * 
 * @module core/api/client
 */

import { EventBus } from '../../utils/eventBus.ts';

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Custom API Error class for structured error handling
 */
class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isValidationError() {
    return this.status === 422;
  }
}

/**
 * Request interceptor manager
 */
const requestInterceptors = [];
const responseInterceptors = [];

/**
 * Add request interceptor
 * @param {Function} interceptor - Function that receives config and returns modified config
 * @returns {Function} Unsubscribe function
 */
function addRequestInterceptor(interceptor) {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index > -1) requestInterceptors.splice(index, 1);
  };
}

/**
 * Add response interceptor
 * @param {Function} onSuccess - Function called on successful response
 * @param {Function} onError - Function called on error response
 * @returns {Function} Unsubscribe function
 */
function addResponseInterceptor(onSuccess, onError) {
  const interceptor = { onSuccess, onError };
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index > -1) responseInterceptors.splice(index, 1);
  };
}

/**
 * Get authentication token from storage
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Build full URL with query parameters
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {string}
 */
function buildUrl(endpoint, params = {}) {
  const url = new URL(endpoint, window.location.origin);
  url.pathname = API_CONFIG.baseURL + url.pathname;
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
}

/**
 * Process request through interceptors
 * @param {Object} config - Request configuration
 * @returns {Object} Processed configuration
 */
async function processRequestInterceptors(config) {
  let processedConfig = { ...config };
  
  for (const interceptor of requestInterceptors) {
    processedConfig = await interceptor(processedConfig);
  }
  
  return processedConfig;
}

/**
 * Process response through interceptors
 * @param {Response} response - Fetch response
 * @param {Object} config - Original request config
 * @returns {Object} Processed response
 */
async function processResponseInterceptors(response, config) {
  let processedResponse = response;
  
  for (const { onSuccess } of responseInterceptors) {
    if (onSuccess) {
      processedResponse = await onSuccess(processedResponse, config);
    }
  }
  
  return processedResponse;
}

/**
 * Process error through interceptors
 * @param {Error} error - Error object
 * @param {Object} config - Original request config
 * @returns {Error} Processed error
 */
async function processErrorInterceptors(error, config) {
  let processedError = error;
  
  for (const { onError } of responseInterceptors) {
    if (onError) {
      processedError = await onError(processedError, config);
    }
  }
  
  return processedError;
}

/**
 * Core request method
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
async function request(method, endpoint, options = {}) {
  const {
    body = null,
    params = {},
    headers = {},
    timeout = API_CONFIG.timeout,
    signal = null,
  } = options;

  // Build request config
  let config = {
    method,
    headers: {
      ...API_CONFIG.headers,
      ...headers,
    },
    signal,
  };

  // Add authorization header if token exists
  const token = getAuthToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  // Process request interceptors
  config = await processRequestInterceptors(config);

  // Build URL with query params
  const url = buildUrl(endpoint, method === 'GET' ? { ...params, ...body } : params);

  // Create timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...config,
      signal: signal || timeoutController.signal,
    });

    clearTimeout(timeoutId);

    // Process response interceptors
    const processedResponse = await processResponseInterceptors(response, config);

    // Handle non-OK responses
    if (!processedResponse.ok) {
      let errorData;
      try {
        errorData = await processedResponse.json();
      } catch {
        errorData = { message: processedResponse.statusText };
      }

      const error = new ApiError(
        processedResponse.status,
        errorData.message || 'An error occurred',
        errorData
      );

      // Process error interceptors
      const processedError = await processErrorInterceptors(error, config);
      throw processedError;
    }

    // Parse response
    const contentType = processedResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await processedResponse.json();
    }

    return processedResponse;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error.name === 'AbortError') {
      const timeoutError = new ApiError(0, 'Request timeout');
      throw await processErrorInterceptors(timeoutError, config);
    }

    // Handle network errors
    if (error instanceof TypeError) {
      const networkError = new ApiError(0, 'Network error - please check your connection');
      throw await processErrorInterceptors(networkError, config);
    }

    // Re-throw API errors
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap unknown errors
    const unknownError = new ApiError(0, error.message || 'An unexpected error occurred');
    throw await processErrorInterceptors(unknownError, config);
  }
}

/**
 * API Client object with HTTP methods
 */
const apiClient = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  get(endpoint, params = {}, options = {}) {
    return request('GET', endpoint, { ...options, params });
  },

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  post(endpoint, body = {}, options = {}) {
    return request('POST', endpoint, { ...options, body });
  },

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  put(endpoint, body = {}, options = {}) {
    return request('PUT', endpoint, { ...options, body });
  },

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  patch(endpoint, body = {}, options = {}) {
    return request('PATCH', endpoint, { ...options, body });
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  delete(endpoint, options = {}) {
    return request('DELETE', endpoint, options);
  },

  // Expose interceptors and error class
  addRequestInterceptor,
  addResponseInterceptor,
  ApiError,
};

// Setup default interceptors

// Auth error handling
apiClient.addResponseInterceptor(
  null,
  async (error) => {
    if (error.isAuthError) {
      // Clear auth token
      localStorage.removeItem('auth_token');
      
      // Emit auth error event
      EventBus.emit('auth:logout', { reason: 'token_expired' });
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=1';
      }
    }
    return error;
  }
);

export { apiClient, ApiError };
export default apiClient;
