/**
 * Notification Events Index
 * 
 * Exports all event-related utilities for the notifications feature.
 * 
 * @module features/notifications/events
 */

// Event constants
export { NotificationEvents } from './notificationEvents';
export type {
  NotificationEventName,
  NotificationEventPayload,
  NotificationSentPayload,
  NotificationReceivedPayload,
  NotificationReadPayload,
  NotificationUnreadPayload,
  NotificationDeletedPayload,
  NotificationMarkedAllReadPayload,
} from './notificationEvents';

// Event observer (subscribes to other feature events)
export {
  NotificationEventObserver,
  getNotificationObserver,
  initializeNotificationObserver,
  cleanupNotificationObserver,
} from './notificationEventObserver';
export type { NotificationData } from './notificationEventObserver';
