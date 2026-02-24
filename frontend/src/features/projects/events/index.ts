/**
 * Project Events Index
 * 
 * Exports all event-related utilities for the projects feature.
 * 
 * @module features/projects/events
 */

// Event constants
export { ProjectEvents } from './projectEvents';
export type {
  ProjectEventName,
  ProjectEventPayload,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  ProjectDeletedPayload,
  ProjectArchivedPayload,
  ProjectRestoredPayload,
  ProjectMemberAddedPayload,
  ProjectMemberRemovedPayload,
  ProjectRoleChangedPayload,
} from './projectEvents';

// Event publisher
export { projectEventPublisher, ProjectEventPublisher } from './projectEventPublisher';
export type { ProjectEventPublisherOptions } from './projectEventPublisher';

// Event subscribers (examples)
export {
  ProjectNotificationObserver,
  ProjectActivityLoggerObserver,
  ProjectTaskSyncObserver,
} from './projectEventSubscriber';
