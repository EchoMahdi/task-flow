/**
 * Task Events Index
 * 
 * Exports all event-related utilities for the tasks feature.
 * 
 * @module features/tasks/events
 */

export { TaskEvents } from './taskEvents';
export type { 
  TaskEventName, 
  TaskEventPayload,
  TaskCreatedPayload,
  TaskUpdatedPayload,
  TaskDeletedPayload,
  TaskCompletedPayload,
  TaskUncompletedPayload,
  TaskArchivedPayload,
  TaskRestoredPayload,
  TaskAssignedPayload,
  TaskUnassignedPayload,
  TaskMovedPayload,
  TaskDuplicatedPayload,
  TaskPriorityChangedPayload,
  TaskDueDateChangedPayload,
  TaskAssignedToProjectPayload,
} from './taskEvents';

export { taskEventPublisher, TaskEventPublisher } from './taskEventPublisher';
