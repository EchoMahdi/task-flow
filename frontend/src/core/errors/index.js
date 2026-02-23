/**
 * Core Error Handling Module
 * 
 * Centralized error handling, error types, and error utilities.
 * Provides consistent error handling across the application.
 * 
 * @module core/errors
 */

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  get isOperational() {
    return true;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Validation error for form/input validation failures
 */
class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 'VALIDATION_ERROR', { fields });
    this.name = 'ValidationError';
    this.fields = fields;
  }

  getFieldErrors() {
    return this.fields;
  }

  hasFieldError(fieldName) {
    return fieldName in this.fields;
  }

  getFieldError(fieldName) {
    return this.fields[fieldName];
  }
}

/**
 * Network error for connectivity issues
 */
class NetworkError extends AppError {
  constructor(message = 'Network error - please check your connection') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Authentication error for auth-related failures
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for permission-related failures
 */
class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error for missing resources
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', { resource });
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

/**
 * Rate limit error for API throttling
 */
class RateLimitError extends AppError {
  constructor(retryAfter = null) {
    super('Too many requests - please try again later', 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Timeout error for request timeouts
 */
class TimeoutError extends AppError {
  constructor(operation = 'Operation') {
    super(`${operation} timed out`, 'TIMEOUT_ERROR', { operation });
    this.name = 'TimeoutError';
  }
}

/**
 * Error codes enumeration
 */
const ErrorCodes = {
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Auth errors
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Rate limiting
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  
  // Feature errors
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
};

/**
 * Error messages for different error codes
 */
const ErrorMessages = {
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred',
  [ErrorCodes.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCodes.NETWORK_ERROR]: 'Network error - please check your connection',
  [ErrorCodes.TIMEOUT_ERROR]: 'Request timed out',
  [ErrorCodes.AUTHENTICATION_ERROR]: 'Authentication required',
  [ErrorCodes.AUTHORIZATION_ERROR]: 'You do not have permission',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCodes.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ErrorCodes.NOT_FOUND_ERROR]: 'Resource not found',
  [ErrorCodes.ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCodes.CONFLICT]: 'Resource conflict',
  [ErrorCodes.RATE_LIMIT_ERROR]: 'Too many requests',
  [ErrorCodes.FEATURE_DISABLED]: 'This feature is currently disabled',
  [ErrorCodes.MAINTENANCE_MODE]: 'System is under maintenance',
};

/**
 * Get error message for an error code
 * @param {string} code - Error code
 * @param {string} fallback - Fallback message
 * @returns {string}
 */
function getErrorMessage(code, fallback = null) {
  return ErrorMessages[code] || fallback || ErrorMessages[ErrorCodes.UNKNOWN_ERROR];
}

/**
 * Create an error from an API response
 * @param {Object} response - API error response
 * @returns {AppError}
 */
function createErrorFromResponse(response) {
  const { status, data } = response;
  const message = data?.message || getErrorMessage(data?.code);
  
  switch (status) {
    case 400:
      return new ValidationError(message, data?.errors || {});
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(data?.resource);
    case 422:
      return new ValidationError(message, data?.errors || {});
    case 429:
      return new RateLimitError(data?.retry_after);
    default:
      if (status >= 500) {
        return new AppError(message, 'SERVER_ERROR', { status });
      }
      return new AppError(message, data?.code || ErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Error handler singleton
 */
const ErrorHandler = {
  /**
   * Handle an error appropriately
   * @param {Error} error - Error to handle
   * @param {Object} options - Handling options
   * @returns {Object} Error info object
   */
  handle(error, options = {}) {
    const { silent = false, context = {} } = options;
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[ErrorHandler]', error, { context });
    }
    
    // Convert to AppError if needed
    const appError = error instanceof AppError
      ? error
      : new AppError(error.message, ErrorCodes.UNKNOWN_ERROR, { originalError: error });
    
    // Return error info
    return {
      error: appError,
      message: appError.message,
      code: appError.code,
      details: appError.details,
      shouldRetry: this.shouldRetry(appError),
      isOperational: appError.isOperational,
    };
  },
  
  /**
   * Check if error is retryable
   * @param {AppError} error - Error to check
   * @returns {boolean}
   */
  shouldRetry(error) {
    return error instanceof NetworkError ||
           error instanceof TimeoutError ||
           error instanceof RateLimitError ||
           error.code === ErrorCodes.INTERNAL_ERROR;
  },
  
  /**
   * Get user-friendly error message
   * @param {Error} error - Error to get message for
   * @returns {string}
   */
  getUserMessage(error) {
    if (error instanceof ValidationError) {
      return Object.values(error.fields).flat().join(', ');
    }
    
    if (error instanceof AppError) {
      return error.message;
    }
    
    return getErrorMessage(ErrorCodes.UNKNOWN_ERROR);
  },
};

export {
  AppError,
  ValidationError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ErrorCodes,
  ErrorMessages,
  getErrorMessage,
  createErrorFromResponse,
  ErrorHandler,
};

export default ErrorHandler;
