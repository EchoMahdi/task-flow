/**
 * Task Event Subscriber Example
 * 
 * This file demonstrates how other features can subscribe to task events
 * without creating direct dependencies on the tasks feature.
 * 
 * This is an EXAMPLE IMPLEMENTATION showing best practices for:
 * - Proper subscription cleanup
 * - Error handling in observers
 * - Type-safe event handling
 * 
 * @module features/tasks/events
 */

import { subscribe, unsubscribe, Observer } from '@/core/observer';
import { EventNames } from '@/core/observer/types';
import type { Event, TaskCreatedPayload, TaskUpdatedPayload, TaskDeletedPayload, TaskCompletedPayload, TaskAssignedToProjectPayload } from '@/core/observer/types';

/**
 * TaskEventSubscriber class
 * 
 * Example subscriber that handles task lifecycle events.
 * This could be used by notifications, analytics, or other features.
 * 
 * @example
 * const subscriber = new TaskEventSubscriber();
 * 
 * // Start listening
 * subscriber.mount();
 * 
 * // ...when done, clean up
 * subscriber.unmount();
 */
export class TaskEventSubscriber extends Observer {
  constructor() {
    super('TaskEventSubscriber');
  }

  /**
   * Mount the subscriber - set up event listeners
   * Should be called when the component mounts or when listening should begin
   */
  mount(): void {
    // Subscribe to task created events
    this.subscribe(EventNames.TASK_CREATED, this.handleTaskCreated);
    
    // Subscribe to task updated events
    this.subscribe(EventNames.TASK_UPDATED, this.handleTaskUpdated);
    
    // Subscribe to task deleted events
    this.subscribe(EventNames.TASK_DELETED, this.handleTaskDeleted);
    
    // Subscribe to task completed events
    this.subscribe(EventNames.TASK_COMPLETED, this.handleTaskCompleted);
    
    // Subscribe to task assigned to project events
    this.subscribe(EventNames.TASK_ASSIGNED_TO_PROJECT, this.handleTaskAssignedToProject);
    
    super.mount();
  }

  /**
   * Handle task created event
   * Example: Show notification, update analytics, etc.
   */
  private handleTaskCreated = (event: Event<TaskCreatedPayload>): void => {
    const { taskId, projectId, title, timestamp } = event.payload;
    
    console.log(`[TaskEventSubscriber] Task created: ${title} (ID: ${taskId})`);
    
    // Example: Show a notification
    // notificationService.show({
    //   type: 'success',
    //   message: `Task "${title}" was created`,
    //   duration: 3000
    // });
    
    // Example: Track analytics
    // analytics.track('task_created', { taskId, projectId });
  };

  /**
   * Handle task updated event
   * Example: Log changes, update UI, etc.
   */
  private handleTaskUpdated = (event: Event<TaskUpdatedPayload>): void => {
    const { taskId, changes, previousValues, timestamp } = event.payload;
    
    console.log(`[TaskEventSubscriber] Task updated: ${taskId}`, { changes, previousValues });
    
    // Example: Log audit trail
    // auditLog.log('task_updated', { taskId, changes, previousValues });
  };

  /**
   * Handle task deleted event
   * Example: Clean up related data, show confirmation, etc.
   */
  private handleTaskDeleted = (event: Event<TaskDeletedPayload>): void => {
    const { taskId, projectId, timestamp } = event.payload;
    
    console.log(`[TaskEventSubscriber] Task deleted: ${taskId}`);
    
    // Example: Show confirmation notification
    // notificationService.show({
    //   type: 'info',
    //   message: 'Task was deleted',
    //   duration: 2000
    // });
  };

  /**
   * Handle task completed event
   * Example: Celebrate completion, update statistics, etc.
   */
  private handleTaskCompleted = (event: Event<TaskCompletedPayload>): void => {
    const { taskId, projectId, wasCompleted, timestamp } = event.payload;
    
    const action = wasCompleted ? 'completed' : 'uncompleted';
    console.log(`[TaskEventSubscriber] Task ${action}: ${taskId}`);
    
    // Example: Show celebration for task completion
    // if (wasCompleted) {
    //   celebrationService.celebrate('task_completed');
    // }
    
    // Example: Update project progress
    // projectService.updateProgress(projectId);
  };

  /**
   * Handle task assigned to project event
   * Example: Update project task counts, refresh views, etc.
   */
  private handleTaskAssignedToProject = (event: Event<TaskAssignedToProjectPayload>): void => {
    const { taskId, projectId, previousProjectId, timestamp } = event.payload;
    
    console.log(`[TaskEventSubscriber] Task ${taskId} moved from ${previousProjectId} to ${projectId}`);
    
    // Example: Update project statistics
    // if (previousProjectId) {
    //   projectService.decrementTaskCount(previousProjectId);
    // }
    // if (projectId) {
    //   projectService.incrementTaskCount(projectId);
    // }
  };
}

/**
 * Hook for React components to subscribe to task events
 * 
 * @example
 * function TaskActivityLogger() {
 *   useTaskEventSubscription();
 *   return null; // This component doesn't render anything
 * }
 */
export function useTaskEventSubscription(): void {
  // In a React context, you would use useEffect to manage the subscription lifecycle
  // This is a simplified example
  
  // Note: In actual implementation, you would use:
  // useEffect(() => {
  //   const subscriber = new TaskEventSubscriber();
  //   subscriber.mount();
  //   return () => subscriber.unmount();
  // }, []);
  
  console.warn('useTaskEventSubscription is a placeholder - implement with useEffect in React components');
}

/**
 * Convenience function to subscribe to a single event
 * Useful for one-off subscriptions
 * 
 * @example
 * const sub = subscribeToTaskCreated((event) => {
 *   console.log('New task:', event.payload.title);
 * });
 * 
 * // Later, unsubscribe
 * unsubscribe(sub);
 */
export function subscribeToTaskCreated(
  handler: (event: Event<TaskCreatedPayload>) => void
) {
  return subscribe(EventNames.TASK_CREATED, handler, { tag: 'task-subscriber' });
}

export function subscribeToTaskUpdated(
  handler: (event: Event<TaskUpdatedPayload>) => void
) {
  return subscribe(EventNames.TASK_UPDATED, handler, { tag: 'task-subscriber' });
}

export function subscribeToTaskDeleted(
  handler: (event: Event<TaskDeletedPayload>) => void
) {
  return subscribe(EventNames.TASK_DELETED, handler, { tag: 'task-subscriber' });
}

export function subscribeToTaskCompleted(
  handler: (event: Event<TaskCompletedPayload>) => void
) {
  return subscribe(EventNames.TASK_COMPLETED, handler, { tag: 'task-subscriber' });
}

export function subscribeToTaskAssignedToProject(
  handler: (event: Event<TaskAssignedToProjectPayload>) => void
) {
  return subscribe(EventNames.TASK_ASSIGNED_TO_PROJECT, handler, { tag: 'task-subscriber' });
}
