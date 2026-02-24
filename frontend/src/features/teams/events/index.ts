/**
 * Team Events Index
 * 
 * Exports all event-related utilities for the teams feature.
 * 
 * @module features/teams/events
 */

// Event constants
export { TeamEvents } from './teamEvents';
export type {
  TeamEventName,
  TeamEventPayload,
  TeamCreatedPayload,
  TeamUpdatedPayload,
  TeamDeletedPayload,
  TeamArchivedPayload,
  TeamRestoredPayload,
  TeamMemberAddedPayload,
  TeamMemberRemovedPayload,
  TeamMemberUpdatedPayload,
  TeamRoleChangedPayload,
  TeamInviteSentPayload,
  TeamInviteAcceptedPayload,
  TeamInviteDeclinedPayload,
} from './teamEvents';

// Event publisher
export { teamEventPublisher } from './teamEventPublisher';

// Event subscribers (examples)
export {
  TeamNotificationObserver,
  TeamProjectAccessObserver,
  TeamActivityLoggerObserver,
} from './teamEventSubscriber';
