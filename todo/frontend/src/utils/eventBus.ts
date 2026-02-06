/**
 * ============================================================================
 * Event Bus Utility
 * Simple event emitter for cross-component communication
 * ============================================================================
 */

// Event names for task operations
export const TaskEvents = {
  TASK_CREATED: 'task:created',
  TASK_DELETED: 'task:deleted',
  TASK_COMPLETED: 'task:completed',
  TASK_UNCOMPLETED: 'task:uncompleted',
  TASK_UPDATED: 'task:updated',
  REFRESH_COUNTS: 'task:refresh-counts',
} as const;

// Event data types
export interface TaskCreatedEvent {
  task: {
    id: number;
    project_id: number | null;
    tag_ids?: number[];
    is_completed: boolean;
  };
}

export interface TaskDeletedEvent {
  taskId: number;
  project_id: number | null;
  tag_ids?: number[];
  is_completed: boolean;
}

export interface TaskCompletedEvent {
  taskId: number;
  project_id: number | null;
  tag_ids?: number[];
}

export interface TaskEventData {
  project_id?: number | null;
  tag_ids?: number[];
  is_completed?: boolean;
  taskId?: number;
}

/**
 * Simple event bus class for pub/sub pattern
 */
class EventBus {
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: (...args: unknown[]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event with data
   */
  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Subscribe to an event once
   */
  once(event: string, callback: (...args: unknown[]) => void): void {
    const wrapper = (...args: unknown[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Convenience functions for common task operations
export const taskEventEmitter = {
  /**
   * Emit when a task is created
   */
  emitTaskCreated(taskData: TaskEventData): void {
    eventBus.emit(TaskEvents.TASK_CREATED, taskData);
  },

  /**
   * Emit when a task is deleted
   */
  emitTaskDeleted(taskData: TaskEventData): void {
    eventBus.emit(TaskEvents.TASK_DELETED, taskData);
  },

  /**
   * Emit when a task is completed
   */
  emitTaskCompleted(taskData: TaskEventData): void {
    eventBus.emit(TaskEvents.TASK_COMPLETED, taskData);
  },

  /**
   * Emit when a task is marked as incomplete
   */
  emitTaskUncompleted(taskData: TaskEventData): void {
    eventBus.emit(TaskEvents.TASK_UNCOMPLETED, taskData);
  },

  /**
   * Emit when a task is updated
   */
  emitTaskUpdated(taskData: TaskEventData): void {
    eventBus.emit(TaskEvents.TASK_UPDATED, taskData);
  },

  /**
   * Request all listeners to refresh their counts
   */
  emitRefreshCounts(): void {
    eventBus.emit(TaskEvents.REFRESH_COUNTS);
  },
};

export default eventBus;
