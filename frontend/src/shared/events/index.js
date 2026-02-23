/**
 * Feature Event Bus
 * 
 * Centralized event system for cross-feature communication.
 * Features communicate through events instead of direct imports.
 * 
 * @module shared/events
 */

import { EventTypes } from '../contracts/index.js';

/**
 * Event Bus class for pub/sub communication
 */
class FeatureEventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.maxHistorySize = 100;
  }

  /**
   * Subscribe to an event
   * @param {string} eventType - Event type from EventTypes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Emit an event
   * @param {string} eventType - Event type from EventTypes
   * @param {Object} payload - Event payload
   */
  emit(eventType, payload = {}) {
    // Add to history
    this.history.push({
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    });
    
    // Trim history
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
    
    // Notify subscribers
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
    
    // Also emit to wildcard listeners
    const wildcardCallbacks = this.listeners.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((callback) => {
        try {
          callback({ type: eventType, payload });
        } catch (error) {
          console.error(`Error in wildcard event handler:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to all events
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribeAll(callback) {
    return this.subscribe('*', callback);
  }

  /**
   * Get event history
   * @param {string} [eventType] - Filter by event type
   * @returns {Object[]} Event history
   */
  getHistory(eventType = null) {
    if (eventType) {
      return this.history.filter((event) => event.type === eventType);
    }
    return [...this.history];
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
    this.history = [];
  }

  /**
   * Remove all listeners for an event type
   * @param {string} eventType - Event type
   */
  clearEvent(eventType) {
    this.listeners.delete(eventType);
  }
}

// Singleton instance
const featureEventBus = new FeatureEventBus();

// ============================================================================
// Feature Event Hooks
// ============================================================================

/**
 * Create an event emitter for a feature
 * @param {string} featureName - Feature name
 * @returns {Object} Event emitter
 */
export function createFeatureEmitter(featureName) {
  return {
    /**
     * Emit a feature event
     * @param {string} eventType - Event type
     * @param {Object} payload - Event payload
     */
    emit(eventType, payload = {}) {
      featureEventBus.emit(eventType, { ...payload, _feature: featureName });
    },
    
    /**
     * Subscribe to events
     * @param {string} eventType - Event type
     * @param {Function} callback - Callback
     * @returns {Function} Unsubscribe function
     */
    subscribe(eventType, callback) {
      return featureEventBus.subscribe(eventType, callback);
    },
  };
}

// ============================================================================
// Pre-configured Feature Emitters
// ============================================================================

export const taskEvents = createFeatureEmitter('tasks');
export const projectEvents = createFeatureEmitter('projects');
export const notificationEvents = createFeatureEmitter('notifications');
export const userEvents = createFeatureEmitter('user');
export const uiEvents = createFeatureEmitter('ui');

// ============================================================================
// Convenience Methods
// ============================================================================

/**
 * Subscribe to task events
 * @param {string} eventType - Event type
 * @param {Function} callback - Callback
 * @returns {Function} Unsubscribe function
 */
export function onTaskEvent(eventType, callback) {
  return featureEventBus.subscribe(eventType, callback);
}

/**
 * Subscribe to project events
 * @param {string} eventType - Event type
 * @param {Function} callback - Callback
 * @returns {Function} Unsubscribe function
 */
export function onProjectEvent(eventType, callback) {
  return featureEventBus.subscribe(eventType, callback);
}

/**
 * Subscribe to notification events
 * @param {string} eventType - Event type
 * @param {Function} callback - Callback
 * @returns {Function} Unsubscribe function
 */
export function onNotificationEvent(eventType, callback) {
  return featureEventBus.subscribe(eventType, callback);
}

/**
 * Emit a task created event
 * @param {Object} task - Task data
 */
export function emitTaskCreated(task) {
  featureEventBus.emit(EventTypes.TASK_CREATED, { task });
}

/**
 * Emit a task updated event
 * @param {Object} task - Task data
 * @param {Object} changes - Changed fields
 */
export function emitTaskUpdated(task, changes = {}) {
  featureEventBus.emit(EventTypes.TASK_UPDATED, { task, changes });
}

/**
 * Emit a task deleted event
 * @param {string|number} taskId - Task ID
 */
export function emitTaskDeleted(taskId) {
  featureEventBus.emit(EventTypes.TASK_DELETED, { taskId });
}

/**
 * Emit a project created event
 * @param {Object} project - Project data
 */
export function emitProjectCreated(project) {
  featureEventBus.emit(EventTypes.PROJECT_CREATED, { project });
}

/**
 * Emit a project updated event
 * @param {Object} project - Project data
 * @param {Object} changes - Changed fields
 */
export function emitProjectUpdated(project, changes = {}) {
  featureEventBus.emit(EventTypes.PROJECT_UPDATED, { project, changes });
}

/**
 * Emit a notification received event
 * @param {Object} notification - Notification data
 */
export function emitNotificationReceived(notification) {
  featureEventBus.emit(EventTypes.NOTIFICATION_RECEIVED, { notification });
}

/**
 * Emit a user authenticated event
 * @param {Object} user - User data
 */
export function emitUserAuthenticated(user) {
  featureEventBus.emit(EventTypes.USER_AUTHENTICATED, { user });
}

/**
 * Emit a user logout event
 */
export function emitUserLogout() {
  featureEventBus.emit(EventTypes.USER_LOGOUT, {});
}

export { featureEventBus, EventTypes };
export default featureEventBus;
