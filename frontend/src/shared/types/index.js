/**
 * Shared Types Index
 * 
 * Exports all reusable TypeScript types used across multiple features.
 * These types are framework-agnostic and contain no business logic.
 * 
 * @module shared/types
 */

/**
 * Common status types
 */
export const Status = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Common priority types
 */
export const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

/**
 * Common sort directions
 */
export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
};

/**
 * Pagination type
 * @typedef {Object} Pagination
 * @property {number} page - Current page
 * @property {number} perPage - Items per page
 * @property {number} total - Total items
 * @property {number} totalPages - Total pages
 */
export const createPagination = (page = 1, perPage = 20, total = 0) => ({
  page,
  perPage,
  total,
  totalPages: Math.ceil(total / perPage),
});

/**
 * API Response type
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Success status
 * @property {any} data - Response data
 * @property {string} message - Response message
 * @property {Object} meta - Metadata (pagination, etc.)
 */
export const createApiResponse = (data, message = 'Success', meta = {}) => ({
  success: true,
  data,
  message,
  meta,
});

/**
 * API Error response type
 * @typedef {Object} ApiErrorResponse
 * @property {boolean} success - Success status (false)
 * @property {string} message - Error message
 * @property {string} code - Error code
 * @property {Object} errors - Validation errors
 */
export const createApiError = (message, code = 'ERROR', errors = {}) => ({
  success: false,
  message,
  code,
  errors,
});

/**
 * Result type for operations
 * @typedef {Object} Result
 * @property {boolean} ok - Success status
 * @property {any} value - Success value
 * @property {Error} error - Error object
 */
export const Ok = (value) => ({ ok: true, value, error: null });
export const Err = (error) => ({ ok: false, value: null, error });

/**
 * Async state type
 * @typedef {Object} AsyncState
 * @property {Status} status - Current status
 * @property {any} data - Loaded data
 * @property {Error} error - Error object
 */
export const createAsyncState = (initialData = null) => ({
  status: Status.IDLE,
  data: initialData,
  error: null,
});

/**
 * Form field type
 * @typedef {Object} FormField
 * @property {any} value - Field value
 * @property {string} error - Field error
 * @property {boolean} touched - Field touched status
 * @property {boolean} dirty - Field dirty status
 */
export const createFormField = (initialValue = '') => ({
  value: initialValue,
  error: null,
  touched: false,
  dirty: false,
});

/**
 * Entity base type
 * @typedef {Object} Entity
 * @property {string|number} id - Entity ID
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * User base type
 * @typedef {Object} User
 * @property {string|number} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} avatar - User avatar URL
 */

/**
 * Select option type
 * @typedef {Object} SelectOption
 * @property {string|number} value - Option value
 * @property {string} label - Option label
 * @property {boolean} disabled - Option disabled status
 */
export const createSelectOption = (value, label, disabled = false) => ({
  value,
  label,
  disabled,
});

/**
 * Breadcrumb item type
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - Item label
 * @property {string} path - Item path
 * @property {boolean} active - Active status
 */
export const createBreadcrumb = (label, path, active = false) => ({
  label,
  path,
  active,
});

/**
 * Tab item type
 * @typedef {Object} TabItem
 * @property {string} id - Tab ID
 * @property {string} label - Tab label
 * @property {React.ReactNode} content - Tab content
 * @property {boolean} disabled - Tab disabled status
 */
export const createTabItem = (id, label, content, disabled = false) => ({
  id,
  label,
  content,
  disabled,
});

/**
 * Menu item type
 * @typedef {Object} MenuItem
 * @property {string} id - Menu item ID
 * @property {string} label - Menu item label
 * @property {string} icon - Menu item icon
 * @property {string} path - Menu item path
 * @property {MenuItem[]} children - Child menu items
 */
export const createMenuItem = (id, label, options = {}) => ({
  id,
  label,
  icon: options.icon || null,
  path: options.path || null,
  children: options.children || [],
});

export default {
  Status,
  Priority,
  SortDirection,
  createPagination,
  createApiResponse,
  createApiError,
  Ok,
  Err,
  createAsyncState,
  createFormField,
  createSelectOption,
  createBreadcrumb,
  createTabItem,
  createMenuItem,
};
