/**
 * Tasks Feature - Types
 * 
 * Type definitions for the tasks feature.
 * 
 * @module features/tasks/types
 */

/**
 * Task status enum
 */
export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
};

/**
 * Task priority enum
 */
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

/**
 * Task type definition
 * @typedef {Object} Task
 * @property {number|string} id - Task ID
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {TaskStatus} status - Task status
 * @property {TaskPriority} priority - Task priority
 * @property {string} dueDate - Due date
 * @property {string} startDate - Start date
 * @property {string} completedAt - Completion timestamp
 * @property {number|string} projectId - Project ID
 * @property {Object} project - Project object
 * @property {number|string} assigneeId - Assignee ID
 * @property {Object} assignee - Assignee object
 * @property {number|string} createdById - Creator ID
 * @property {Object} createdBy - Creator object
 * @property {Tag[]} tags - Task tags
 * @property {Subtask[]} subtasks - Task subtasks
 * @property {number} progress - Task progress percentage
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * Tag type definition
 * @typedef {Object} Tag
 * @property {number|string} id - Tag ID
 * @property {string} name - Tag name
 * @property {string} color - Tag color
 */

/**
 * Subtask type definition
 * @typedef {Object} Subtask
 * @property {number|string} id - Subtask ID
 * @property {string} title - Subtask title
 * @property {boolean} completed - Completion status
 * @property {number} order - Order index
 */

/**
 * Task filter type
 * @typedef {Object} TaskFilter
 * @property {string} search - Search query
 * @property {TaskStatus[]} statuses - Filter by statuses
 * @property {TaskPriority[]} priorities - Filter by priorities
 * @property {number[]} projectIds - Filter by project IDs
 * @property {number[]} tagIds - Filter by tag IDs
 * @property {string} dueDateFrom - Due date from
 * @property {string} dueDateTo - Due date to
 * @property {string} startDateFrom - Start date from
 * @property {string} startDateTo - Start date to
 * @property {number} assigneeId - Filter by assignee
 */

/**
 * Create default task filter
 * @returns {TaskFilter}
 */
export const createDefaultTaskFilter = () => ({
  search: '',
  statuses: [],
  priorities: [],
  projectIds: [],
  tagIds: [],
  dueDateFrom: null,
  dueDateTo: null,
  startDateFrom: null,
  startDateTo: null,
  assigneeId: null,
});

/**
 * Task sort options
 * @typedef {Object} TaskSort
 * @property {string} field - Sort field
 * @property {'asc'|'desc'} direction - Sort direction
 */

/**
 * Create default task sort
 * @returns {TaskSort}
 */
export const createDefaultTaskSort = () => ({
  field: 'dueDate',
  direction: 'asc',
});

/**
 * Task creation payload
 * @typedef {Object} CreateTaskPayload
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {TaskStatus} status - Task status
 * @property {TaskPriority} priority - Task priority
 * @property {string} dueDate - Due date
 * @property {string} startDate - Start date
 * @property {number} projectId - Project ID
 * @property {number[]} tagIds - Tag IDs
 */

/**
 * Task update payload
 * @typedef {Object} UpdateTaskPayload
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {TaskStatus} status - Task status
 * @property {TaskPriority} priority - Task priority
 * @property {string} dueDate - Due date
 * @property {string} startDate - Start date
 * @property {number} projectId - Project ID
 * @property {number[]} tagIds - Tag IDs
 */

export default {
  TaskStatus,
  TaskPriority,
  createDefaultTaskFilter,
  createDefaultTaskSort,
};
