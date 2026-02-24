/**
 * Task Events - Event Naming Convention Constants
 * 
 * This file defines all event names for the Tasks feature following the
 * standardized naming convention: <feature>.<entity>.<action>
 * 
 * All actions MUST use past tense to represent completed facts.
 * 
 * @module features/tasks/events
 */

import { EventPayload } from '@/core/observer/types';

/**
 * Task event names - use these constants for publishing/subscribing
 */
export const TaskEvents = {
  /** A new task was created */
  CREATED: 'tasks.created',
  
  /** Task properties were modified */
  UPDATED: 'tasks.updated',
  
  /** A task was permanently deleted */
  DELETED: 'tasks.deleted',
  
  /** Task was marked as completed */
  COMPLETED: 'tasks.completed',
  
  /** Task was marked as incomplete */
  UNCOMPLETED: 'tasks.uncompleted',
  
  /** Task was moved to archive */
  ARCHIVED: 'tasks.archived',
  
  /** Task was restored from archive */
  RESTORED: 'tasks.restored',
  
  /** Task was assigned to a user or project */
  ASSIGNED: 'tasks.assigned',
  
  /** Task was unassigned from a user or project */
  UNASSIGNED: 'tasks.unassigned',
  
  /** Task was moved to a different project or status */
  MOVED: 'tasks.moved',
  
  /** Task was duplicated */
  DUPLICATED: 'tasks.duplicated',
  
  /** Task priority was changed */
  PRIORITY_CHANGED: 'tasks.priorityChanged',
  
  /** Task due date was changed */
  DUE_DATE_CHANGED: 'tasks.dueDateChanged',
  
  /** Task was assigned to a project */
  ASSIGNED_TO_PROJECT: 'tasks.assignedToProject',
} as const;

/**
 * Union type of all task event names
 */
export type TaskEventName = typeof TaskEvents[keyof typeof TaskEvents];

/**
 * =====================================================
 * EVENT PAYLOAD INTERFACES
 * =====================================================
 * Each payload extends EventPayload and includes feature-specific data
 */

// Base task event payload
interface BaseTaskPayload extends EventPayload {
  taskId: string;
  projectId?: string;
  /** Tag IDs associated with the task */
  tagIds?: number[];
}

/**
 * Payload for tasks.created event
 */
export interface TaskCreatedPayload extends BaseTaskPayload {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: string | null;
  assigneeId?: string | null;
}

/**
 * Payload for tasks.updated event
 */
export interface TaskUpdatedPayload extends BaseTaskPayload {
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
}

/**
 * Payload for tasks.deleted event
 */
export interface TaskDeletedPayload extends BaseTaskPayload {
  deletedAt: number;
}

/**
 * Payload for tasks.completed event
 */
export interface TaskCompletedPayload extends BaseTaskPayload {
  wasCompleted: boolean;
  completedAt?: number;
}

/**
 * Payload for tasks.uncompleted event
 */
export interface TaskUncompletedPayload extends BaseTaskPayload {
  previousCompletedAt?: number;
}

/**
 * Payload for tasks.archived event
 */
export interface TaskArchivedPayload extends BaseTaskPayload {
  archivedAt: number;
}

/**
 * Payload for tasks.restored event
 */
export interface TaskRestoredPayload extends BaseTaskPayload {
  restoredFromArchive: boolean;
}

/**
 * Payload for tasks.assigned event
 */
export interface TaskAssignedPayload extends BaseTaskPayload {
  assigneeId: string | null;
  previousAssigneeId: string | null;
  assigneeName?: string;
}

/**
 * Payload for tasks.assignedToProject event
 */
export interface TaskAssignedToProjectPayload extends BaseTaskPayload {
  projectId: string | null;
  previousProjectId: string | null;
}

/**
 * Payload for tasks.unassigned event
 */
export interface TaskUnassignedPayload extends BaseTaskPayload {
  previousAssigneeId: string | null;
}

/**
 * Payload for tasks.moved event
 */
export interface TaskMovedPayload extends BaseTaskPayload {
  fromProjectId: string;
  toProjectId: string;
  fromStatus?: string;
  toStatus?: string;
}

/**
 * Payload for tasks.duplicated event
 */
export interface TaskDuplicatedPayload extends BaseTaskPayload {
  originalTaskId: string;
  newTaskId: string;
}

/**
 * Payload for tasks.priorityChanged event
 */
export interface TaskPriorityChangedPayload extends BaseTaskPayload {
  priority: number;
  previousPriority: number;
}

/**
 * Payload for tasks.dueDateChanged event
 */
export interface TaskDueDateChangedPayload extends BaseTaskPayload {
  dueDate: string | null;
  previousDueDate: string | null;
}

/**
 * =====================================================
 * TYPE MAPPING
 * =====================================================
 * Maps event names to their payload types for type-safe handling
 */

export type TaskEventPayload<T extends TaskEventName> = 
  T extends typeof TaskEvents.CREATED ? TaskCreatedPayload :
  T extends typeof TaskEvents.UPDATED ? TaskUpdatedPayload :
  T extends typeof TaskEvents.DELETED ? TaskDeletedPayload :
  T extends typeof TaskEvents.COMPLETED ? TaskCompletedPayload :
  T extends typeof TaskEvents.UNCOMPLETED ? TaskUncompletedPayload :
  T extends typeof TaskEvents.ARCHIVED ? TaskArchivedPayload :
  T extends typeof TaskEvents.RESTORED ? TaskRestoredPayload :
  T extends typeof TaskEvents.ASSIGNED ? TaskAssignedPayload :
  T extends typeof TaskEvents.UNASSIGNED ? TaskUnassignedPayload :
  T extends typeof TaskEvents.MOVED ? TaskMovedPayload :
  T extends typeof TaskEvents.DUPLICATED ? TaskDuplicatedPayload :
  T extends typeof TaskEvents.PRIORITY_CHANGED ? TaskPriorityChangedPayload :
  T extends typeof TaskEvents.DUE_DATE_CHANGED ? TaskDueDateChangedPayload :
  T extends typeof TaskEvents.ASSIGNED_TO_PROJECT ? TaskAssignedToProjectPayload :
  EventPayload;

/**
 * =====================================================
 * DEPRECATED EVENTS MAPPING
 * =====================================================
 * Maps old event names to new ones for backwards compatibility
 * 
 * @deprecated Use the new event names from TaskEvents
 */
export const DeprecatedTaskEvents = {
  /** @deprecated Use TaskEvents.CREATED */
  TASK_CREATED: TaskEvents.CREATED,
  /** @deprecated Use TaskEvents.UPDATED */
  TASK_UPDATED: TaskEvents.UPDATED,
  /** @deprecated Use TaskEvents.DELETED */
  TASK_DELETED: TaskEvents.DELETED,
  /** @deprecated Use TaskEvents.COMPLETED */
  TASK_COMPLETED: TaskEvents.COMPLETED,
  /** @deprecated Use TaskEvents.ASSIGNED_TO_PROJECT */
  TASK_ASSIGNED_TO_PROJECT: TaskEvents.ASSIGNED_TO_PROJECT,
} as const;

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

export default TaskEvents;
