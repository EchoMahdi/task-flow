/**
 * ============================================================================
 * TaskModel
 * Domain model for Task entity
 * Handles validation, defaults, normalization, and API communication
 * ============================================================================
 */

import { taskService } from '../services/taskService';
import requestCache from '../utils/requestCache';
import { taskEventEmitter, TaskEvents } from '../utils/eventBus';

/**
 * Default values for task creation
 */
const TASK_DEFAULTS = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: null,
  dueTime: null,
  tags: [],
  projectId: null,
};

/**
 * Priority options
 */
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

/**
 * Status options
 */
const STATUS_OPTIONS = ['pending', 'in_progress', 'completed'];

/**
 * Validation rules for task data
 */
const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  description: {
    required: false,
    maxLength: 10000,
  },
  priority: {
    required: false,
    allowedValues: PRIORITY_OPTIONS,
  },
  status: {
    required: false,
    allowedValues: STATUS_OPTIONS,
  },
  dueDate: {
    required: false,
    isDate: true,
  },
  tags: {
    required: false,
    isArray: true,
  },
};

/**
 * TaskModel class
 * Single source of truth for task-related operations
 */
export class TaskModel {
  /**
   * Create a new TaskModel instance
   * @param {Object} initialData - Initial task data
   */
  constructor(initialData = {}) {
    this.data = {
      ...TASK_DEFAULTS,
      ...initialData,
    };
    this.errors = {};
    this.isValid = false;
    this.isLoading = false;
    this.isDirty = false;
  }

  /**
   * Get current task data
   * @returns {Object} Current task data
   */
  getData() {
    return { ...this.data };
  }

  /**
   * Get a specific field value
   * @param {string} field - Field name
   * @returns {*} Field value
   */
  get(field) {
    return this.data[field];
  }

  /**
   * Set a field value
   * @param {string} field - Field name
   * @param {*} value - New value
   * @returns {TaskModel} this for chaining
   */
  set(field, value) {
    this.data[field] = value;
    this.isDirty = true;
    
    // Clear error for this field if it exists
    if (this.errors[field]) {
      delete this.errors[field];
    }
    
    return this;
  }

  /**
   * Set multiple fields at once
   * @param {Object} data - Object with field-value pairs
   * @returns {TaskModel} this for chaining
   */
  setMultiple(data) {
    Object.entries(data).forEach(([field, value]) => {
      this.set(field, value);
    });
    return this;
  }

  /**
   * Reset model to defaults
   * @returns {TaskModel} this for chaining
   */
  reset() {
    this.data = { ...TASK_DEFAULTS };
    this.errors = {};
    this.isValid = false;
    this.isDirty = false;
    return this;
  }

  /**
   * Reset to a specific data object
   * @param {Object} data - Data to reset to
   * @returns {TaskModel} this for chaining
   */
  resetTo(data) {
    this.data = {
      ...TASK_DEFAULTS,
      ...data,
    };
    this.errors = {};
    this.isValid = false;
    this.isDirty = false;
    return this;
  }

  /**
   * Validate task data
   * @returns {boolean} True if valid, false otherwise
   */
  validate() {
    this.errors = {};
    const { title, description, priority, status, dueDate, tags } = this.data;

    // Title validation
    if (!title || !title.trim()) {
      this.errors.title = 'Title is required';
    } else if (title.trim().length < VALIDATION_RULES.title.minLength) {
      this.errors.title = `Title must be at least ${VALIDATION_RULES.title.minLength} characters`;
    } else if (title.length > VALIDATION_RULES.title.maxLength) {
      this.errors.title = `Title must not exceed ${VALIDATION_RULES.title.maxLength} characters`;
    }

    // Description validation (optional)
    if (description && description.length > VALIDATION_RULES.description.maxLength) {
      this.errors.description = `Description must not exceed ${VALIDATION_RULES.description.maxLength} characters`;
    }

    // Priority validation
    if (priority && !VALIDATION_RULES.priority.allowedValues.includes(priority)) {
      this.errors.priority = `Priority must be one of: ${VALIDATION_RULES.priority.allowedValues.join(', ')}`;
    }

    // Status validation
    if (status && !VALIDATION_RULES.status.allowedValues.includes(status)) {
      this.errors.status = `Status must be one of: ${VALIDATION_RULES.status.allowedValues.join(', ')}`;
    }

    // Due date validation
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        this.errors.dueDate = 'Please enter a valid date';
      }
    }

    // Tags validation
    if (tags && !Array.isArray(tags)) {
      this.errors.tags = 'Tags must be an array';
    }

    this.isValid = Object.keys(this.errors).length === 0;
    return this.isValid;
  }

  /**
   * Get validation errors
   * @returns {Object} Validation errors
   */
  getErrors() {
    return { ...this.errors };
  }

  /**
   * Check if model has errors
   * @returns {boolean} True if has errors
   */
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Normalize task data for API
   * @returns {Object} Normalized data
   */
  normalizeForAPI() {
    const { title, description, priority, status, dueDate, dueTime, tags, projectId } = this.data;

    // Build due_date combining date and time if provided
    let dueDateTime = null;
    if (dueDate) {
      if (dueTime) {
        dueDateTime = `${dueDate}T${dueTime}:00`;
      } else {
        dueDateTime = dueDate;
      }
    }

    return {
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      is_completed: status === 'completed',
      due_date: dueDateTime,
      tags: tags || [],
      project_id: projectId,
    };
  }

  /**
   * Create a new task via API
   * @returns {Promise<Object>} Created task data
   */
  async create() {
    // Validate before submission
    if (!this.validate()) {
      const error = new ValidationError('Task validation failed', this.errors);
      error.validationErrors = this.errors;
      throw error;
    }

    this.isLoading = true;
    this.errors = {};

    try {
      const normalizedData = this.normalizeForAPI();
      const result = await taskService.createTask(normalizedData);

      // Emit event for other components
      taskEventEmitter.emitTaskCreated({
        task: result.data,
        project_id: result.data.project_id,
        tag_ids: result.data.tag_ids,
        is_completed: result.data.is_completed,
      });

      // Invalidate cache
      requestCache.invalidateCache('/api/tasks');

      // Reset model after successful creation
      this.reset();

      return result;
    } catch (error) {
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        this.errors = error.response.data.errors;
        error.validationErrors = this.errors;
      } else if (error.response?.data?.message) {
        this.errors.server = error.response.data.message;
      } else {
        this.errors.server = error.message || 'Failed to create task';
      }
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Update an existing task via API
   * @param {number} id - Task ID
   * @returns {Promise<Object>} Updated task data
   */
  async update(id) {
    // Validate before submission
    if (!this.validate()) {
      const error = new ValidationError('Task validation failed', this.errors);
      error.validationErrors = this.errors;
      throw error;
    }

    this.isLoading = true;
    this.errors = {};

    try {
      const normalizedData = this.normalizeForAPI();
      const result = await taskService.updateTask(id, normalizedData);

      // Emit event for other components
      taskEventEmitter.emitTaskUpdated({
        taskId: id,
        task: result.data,
        project_id: result.data.project_id,
        tag_ids: result.data.tag_ids,
        is_completed: result.data.is_completed,
      });

      // Invalidate cache
      requestCache.invalidateCache('/api/tasks');

      this.isDirty = false;
      return result;
    } catch (error) {
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        this.errors = error.response.data.errors;
        error.validationErrors = this.errors;
      } else if (error.response?.data?.message) {
        this.errors.server = error.response.data.message;
      } else {
        this.errors.server = error.message || 'Failed to update task';
      }
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load task data from API for editing
   * @param {number} id - Task ID
   * @returns {Promise<TaskModel>} this for chaining
   */
  async loadForEdit(id) {
    this.isLoading = true;
    this.errors = {};

    try {
      const task = await taskService.getTask(id);

      // Map API response to model format
      this.data = {
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.is_completed ? 'completed' : (task.status || 'pending'),
        dueDate: task.due_date ? task.due_date.split('T')[0] : null,
        dueTime: task.due_date ? task.due_date.split('T')[1]?.substring(0, 5) : null,
        tags: task.tags?.map(t => t.id) || [],
        projectId: task.project_id || null,
      };

      this.isDirty = false;
      return this;
    } catch (error) {
      this.errors.server = error.message || 'Failed to load task';
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Check if model is in a valid state for submission
   * @returns {boolean} True if can submit
   */
  canSubmit() {
    return this.isValid && !this.isLoading && !this.hasErrors();
  }

  /**
   * Get a summary of the model state
   * @returns {Object} Model summary
   */
  getState() {
    return {
      data: this.getData(),
      errors: this.getErrors(),
      isValid: this.isValid,
      isLoading: this.isLoading,
      isDirty: this.isDirty,
      canSubmit: this.canSubmit(),
    };
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message, validationErrors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Quick task creation helper
 * Creates a task with minimal data (just title)
 * @param {string} title - Task title
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created task data
 */
export async function createQuickTask(title, options = {}) {
  const model = new TaskModel({
    title,
    ...options,
  });
  
  if (!model.validate()) {
    const error = new ValidationError('Task validation failed', model.getErrors());
    throw error;
  }
  
  return model.create();
}

/**
 * Default export with factory methods
 */
export default {
  TaskModel,
  ValidationError,
  createQuickTask,
  TASK_DEFAULTS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
};
