/**
 * Notification Events - Event Naming Convention Constants
 * 
 * This file defines all event names for the Notifications feature following the
 * standardized naming convention: <feature>.<entity>.<action>
 * 
 * All actions MUST use past tense to represent completed facts.
 * 
 * @module features/notifications/events
 */

import { EventPayload } from '@/core/observer/types';

/**
 * Notification event names - use these constants for publishing/subscribing
 */
export const NotificationEvents = {
  /** A notification was sent */
  SENT: 'notifications.sent',
  
  /** A notification was received */
  RECEIVED: 'notifications.received',
  
  /** A notification was marked as read */
  READ: 'notifications.read',
  
  /** A notification was marked as unread */
  UNREAD: 'notifications.unread',
  
  /** A notification was deleted */
  DELETED: 'notifications.deleted',
  
  /** All notifications were marked as read */
  MARKED_ALL_READ: 'notifications.markedAllRead',
} as const;

/**
 * Union type of all notification event names
 */
export type NotificationEventName = typeof NotificationEvents[keyof typeof NotificationEvents];

/**
 * =====================================================
 * EVENT PAYLOAD INTERFACES
 * =====================================================
 */

interface BaseNotificationPayload extends EventPayload {
  notificationId: string;
}

/**
 * Payload for notifications.sent event
 */
export interface NotificationSentPayload extends BaseNotificationPayload {
  type: string;
  title: string;
  body?: string;
  recipientId: string;
}

/**
 * Payload for notifications.received event
 */
export interface NotificationReceivedPayload extends BaseNotificationPayload {
  type: string;
  title: string;
  body?: string;
  senderId?: string;
  senderName?: string;
}

/**
 * Payload for notifications.read event
 */
export interface NotificationReadPayload extends BaseNotificationPayload {
  readAt: number;
}

/**
 * Payload for notifications.unread event
 */
export interface NotificationUnreadPayload extends BaseNotificationPayload {
  previousReadAt?: number;
}

/**
 * Payload for notifications.deleted event
 */
export interface NotificationDeletedPayload extends BaseNotificationPayload {
  deletedAt: number;
  type: string;
}

/**
 * Payload for notifications.markedAllRead event
 */
export interface NotificationMarkedAllReadPayload extends EventPayload {
  userId: string;
  count: number;
  readAt: number;
}

/**
 * =====================================================
 * TYPE MAPPING
 * =====================================================
 */

export type NotificationEventPayload<T extends NotificationEventName> = 
  T extends typeof NotificationEvents.SENT ? NotificationSentPayload :
  T extends typeof NotificationEvents.RECEIVED ? NotificationReceivedPayload :
  T extends typeof NotificationEvents.READ ? NotificationReadPayload :
  T extends typeof NotificationEvents.UNREAD ? NotificationUnreadPayload :
  T extends typeof NotificationEvents.DELETED ? NotificationDeletedPayload :
  T extends typeof NotificationEvents.MARKED_ALL_READ ? NotificationMarkedAllReadPayload :
  EventPayload;

export default NotificationEvents;
