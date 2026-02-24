/**
 * Task Event Publisher
 * 
 * Centralized event publishing for task lifecycle events.
 * Uses the core observer infrastructure to emit typed events.
 * 
 * This module provides a clean API for the tasks feature to publish
 * events without coupling to the observer implementation.
 * 
 * @module features/tasks/events
 */

import { emit, emitAsync, EventNames, isRegisteredEvent } from '@/core/observer';
import type {
  TaskCreatedPayload,
  TaskUpdatedPayload,
  TaskDeletedPayload,
  TaskCompletedPayload,
  TaskAssignedToProjectPayload,
} from '@/core/observer/types';

/**
 * Task event publisher options
 */
interface TaskEventPublisherOptions {
  /** Whether to use async emission (non-blocking) */
  async?: boolean;
  /** Source identifier for the events */
  source?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Default publisher options
 * @default async: true for non-blocking UI
 */
const defaultOptions: TaskEventPublisherOptions = {
  async: true,
  source: 'tasks-feature',
  debug: process.env.NODE_ENV !== 'production',
};

/**
 * TaskEventPublisher class
 * 
 * Provides methods to publish task lifecycle events.
 * Events are emitted after successful state/API updates.
 * 
 * @example
 * const publisher = new TaskEventPublisher();
 * 
 * // Async emission (default - non-blocking)
 * publisher.publishTaskCreated({ taskId: '123', projectId: '456', title: 'New Task' });
 */
export class TaskEventPublisher {
  private options: TaskEventPublisherOptions;
  private validateEvents: boolean = process.env.NODE_ENV !== 'production';
  private debug: boolean = process.env.NODE_ENV !== 'production';

  constructor(options: TaskEventPublisherOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.debug = this.options.debug ?? (process.env.NODE_ENV !== 'production');
  }

  /**
   * Debug logging helper
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[TaskEventPublisher] ${message}`, ...args);
    }
  }

  /**
   * Validate event before emitting - development safety check
   */
  private validateEvent(eventName: string): void {
    if (this.validateEvents && !isRegisteredEvent(eventName)) {
      console.warn(`[TaskEventPublisher] Unregistered event: ${eventName}. Consider registering in eventRegistry.`);
    }
  }

  /**
   * Publish a task created event
   * Called after a task is successfully created in the database
   */
  publishTaskCreated(payload: {
    taskId: string;
    projectId: string;
    title: string;
    /** Tag IDs associated with the task */
    tagIds?: number[];
  }): void {
    const eventName = EventNames.TASK_CREATED;
    this.validateEvent(eventName);
    
    const eventPayload: TaskCreatedPayload = {
      taskId: payload.taskId,
      projectId: payload.projectId,
      title: payload.title,
      tagIds: payload.tagIds,
      timestamp: Date.now(),
      source: this.options.source,
    };

    if (this.options.async) {
      emitAsync(EventNames.TASK_CREATED, eventPayload);
    } else {
      emit(EventNames.TASK_CREATED, eventPayload);
    }
  }

  /**
   * Publish a task updated event
   * Called after task properties are successfully updated
   */
  publishTaskUpdated(payload: {
    taskId: string;
    changes: Record<string, unknown>;
    previousValues: Record<string, unknown>;
    projectId?: string;
    /** Tag IDs associated with the task */
    tagIds?: number[];
  }): void {
    const eventPayload: TaskUpdatedPayload = {
      taskId: payload.taskId,
      changes: payload.changes,
      previousValues: payload.previousValues,
      tagIds: payload.tagIds,
      timestamp: Date.now(),
      source: this.options.source,
    };

    if (this.options.async) {
      emitAsync(EventNames.TASK_UPDATED, eventPayload);
    } else {
      emit(EventNames.TASK_UPDATED, eventPayload);
    }
  }

  /**
   * Publish a task deleted event
   * Called after a task is successfully deleted
   */
  publishTaskDeleted(payload: {
    taskId: string;
    projectId?: string;
    /** Tag IDs of the deleted task for count updates */
    tagIds?: number[];
  }): void {
    const eventPayload: TaskDeletedPayload = {
      taskId: payload.taskId,
      projectId: payload.projectId || '',
      tagIds: payload.tagIds,
      timestamp: Date.now(),
      source: this.options.source,
    };

    if (this.options.async) {
      emitAsync(EventNames.TASK_DELETED, eventPayload);
    } else {
      emit(EventNames.TASK_DELETED, eventPayload);
    }
  }

  /**
   * Publish a task completed/uncompleted event
   * Called after task completion status is toggled
   * Emits both tasks.completed and tasks.uncompleted events for subscriber flexibility
   */
  publishTaskCompleted(payload: {
    taskId: string;
    projectId?: string;
    wasCompleted: boolean;
    /** Tag IDs associated with the task */
    tagIds?: number[];
  }): void {
    const eventPayload: TaskCompletedPayload = {
      taskId: payload.taskId,
      projectId: payload.projectId || '',
      wasCompleted: payload.wasCompleted,
      tagIds: payload.tagIds,
      timestamp: Date.now(),
      source: this.options.source,
    };

    if (this.options.async) {
      // Emit TASK_COMPLETED event
      emitAsync(EventNames.TASK_COMPLETED, eventPayload);
      // Also emit TASK_UNCOMPLETED if task is now uncompleted (for backward compatibility)
      if (!payload.wasCompleted) {
        emitAsync(EventNames.TASK_UNCOMPLETED, eventPayload);
      }
    } else {
      // Emit TASK_COMPLETED event
      emit(EventNames.TASK_COMPLETED, eventPayload);
      // Also emit TASK_UNCOMPLETED if task is now uncompleted (for backward compatibility)
      if (!payload.wasCompleted) {
        emit(EventNames.TASK_UNCOMPLETED, eventPayload);
      }
    }
  }

  /**
   * Publish a task assigned to project event
   * Called after a task is assigned to or removed from a project
   */
  publishTaskAssignedToProject(payload: {
    taskId: string;
    projectId: string | null;
    previousProjectId: string | null;
    /** Tag IDs associated with the task */
    tagIds?: number[];
  }): void {
    const eventPayload: TaskAssignedToProjectPayload = {
      taskId: payload.taskId,
      projectId: payload.projectId,
      previousProjectId: payload.previousProjectId,
      tagIds: payload.tagIds,
      timestamp: Date.now(),
      source: this.options.source,
    };

    if (this.options.async) {
      emitAsync(EventNames.TASK_ASSIGNED, eventPayload);
    } else {
      emit(EventNames.TASK_ASSIGNED, eventPayload);
    }
  }

  /**
   * Publish a task uncompleted event
   * Called after a task is marked as incomplete
   */
  publishTaskUncompleted(payload: {
    taskId: string;
    projectId?: string;
    /** Tag IDs associated with the task */
    tagIds?: number[];
  }): void {
    const eventPayload: TaskCompletedPayload = {
      taskId: payload.taskId,
      projectId: payload.projectId || '',
      wasCompleted: false,
      tagIds: payload.tagIds,
      timestamp: Date.now(),
      source: this.options.source,
    };

    if (this.options.async) {
      emitAsync(EventNames.TASK_UNCOMPLETED, eventPayload);
    } else {
      emit(EventNames.TASK_UNCOMPLETED, eventPayload);
    }
  }
}

/**
 * Default instance for convenient usage
 * Use this for most cases where custom configuration isn't needed
 */
export const taskEventPublisher = new TaskEventPublisher();
export default taskEventPublisher;
