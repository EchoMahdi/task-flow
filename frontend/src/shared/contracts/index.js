/**
 * Shared Contracts and Interfaces
 * 
 * This module defines neutral contracts and interfaces that features
 * can use to communicate without direct dependencies.
 * 
 * Rules:
 * - No feature-specific logic
 * - Only type definitions and interfaces
 * - Events for cross-feature communication
 * 
 * @module shared/contracts
 */

// ============================================================================
// Entity Contracts
// ============================================================================

/**
 * @typedef {Object} BaseEntity
 * @property {string|number} id - Entity ID
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * @typedef {Object} UserContract
 * @property {string|number} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} [avatar] - Avatar URL
 */

/**
 * @typedef {Object} ProjectContract
 * @property {string|number} id - Project ID
 * @property {string} name - Project name
 * @property {string} [color] - Project color
 * @property {string} [status] - Project status
 */

/**
 * @typedef {Object} TaskContract
 * @property {string|number} id - Task ID
 * @property {string} title - Task title
 * @property {string} [description] - Task description
 * @property {string} status - Task status
 * @property {string} priority - Task priority
 * @property {string} [dueDate] - Due date
 * @property {string|number} [projectId] - Project ID
 * @property {ProjectContract} [project] - Project reference
 */

/**
 * @typedef {Object} NotificationContract
 * @property {string|number} id - Notification ID
 * @property {string} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {boolean} read - Read status
 */

// ============================================================================
// Event Contracts
// ============================================================================

/**
 * Event types for cross-feature communication
 */
export const EventTypes = {
  // Task events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_COMPLETED: 'task:completed',
  TASK_STATUS_CHANGED: 'task:status_changed',
  
  // Project events
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  PROJECT_ARCHIVED: 'project:archived',
  
  // Notification events
  NOTIFICATION_RECEIVED: 'notification:received',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATIONS_CLEARED: 'notifications:cleared',
  
  // User events
  USER_AUTHENTICATED: 'user:authenticated',
  USER_LOGOUT: 'user:logout',
  USER_PREFERENCES_CHANGED: 'user:preferences_changed',
  
  // UI events
  THEME_CHANGED: 'ui:theme_changed',
  LANGUAGE_CHANGED: 'ui:language_changed',
  SIDEBAR_TOGGLED: 'ui:sidebar_toggled',
};

// ============================================================================
// Service Contracts (Interfaces)
// ============================================================================

/**
 * @typedef {Object} CRUDServiceContract
 * @property {Function} getAll - Get all entities
 * @property {Function} getById - Get entity by ID
 * @property {Function} create - Create entity
 * @property {Function} update - Update entity
 * @property {Function} delete - Delete entity
 */

/**
 * @typedef {Object} TaskServiceContract
 * @property {Function} getTasks - Get tasks with filters
 * @property {Function} getTask - Get single task
 * @property {Function} createTask - Create task
 * @property {Function} updateTask - Update task
 * @property {Function} deleteTask - Delete task
 * @property {Function} updateStatus - Update task status
 * @property {Function} updatePriority - Update task priority
 */

/**
 * @typedef {Object} ProjectServiceContract
 * @property {Function} getProjects - Get all projects
 * @property {Function} getProject - Get single project
 * @property {Function} createProject - Create project
 * @property {Function} updateProject - Update project
 * @property {Function} deleteProject - Delete project
 */

/**
 * @typedef {Object} NotificationServiceContract
 * @property {Function} getNotifications - Get notifications
 * @property {Function} markAsRead - Mark notification as read
 * @property {Function} markAllAsRead - Mark all as read
 */

// ============================================================================
// Store Contracts (Interfaces)
// ============================================================================

/**
 * @typedef {Object} TaskStoreContract
 * @property {TaskContract[]} tasks - Task list
 * @property {Object} pagination - Pagination state
 * @property {Object} filters - Filter state
 * @property {boolean} isLoading - Loading state
 * @property {Function} fetchTasks - Fetch tasks
 * @property {Function} createTask - Create task
 * @property {Function} updateTask - Update task
 * @property {Function} deleteTask - Delete task
 */

/**
 * @typedef {Object} ProjectStoreContract
 * @property {ProjectContract[]} projects - Project list
 * @property {boolean} isLoading - Loading state
 * @property {Function} fetchProjects - Fetch projects
 * @property {Function} createProject - Create project
 * @property {Function} updateProject - Update project
 * @property {Function} deleteProject - Delete project
 */

// ============================================================================
// Feature Public API Contracts
// ============================================================================

/**
 * @typedef {Object} FeatureAPIContract
 * @property {Object} types - Feature types
 * @property {Object} services - Feature services
 * @property {Object} hooks - Feature hooks
 * @property {Object} store - Feature store
 * @property {Object} routes - Feature routes
 */

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a standard API response
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 * @param {string} [message] - Response message
 * @returns {Object}
 */
export function createApiResponse(success, data, message = '') {
  return { success, data, message };
}

/**
 * Create a pagination object
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @param {number} total - Total items
 * @returns {Object}
 */
export function createPagination(page = 1, perPage = 20, total = 0) {
  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Create a filter object
 * @param {Object} filters - Filter values
 * @returns {Object}
 */
export function createFilters(filters = {}) {
  return {
    search: '',
    ...filters,
  };
}

export default {
  EventTypes,
  createApiResponse,
  createPagination,
  createFilters,
};
