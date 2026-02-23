/**
 * Notifications Feature - Types
 * 
 * Type definitions for the notifications feature.
 * 
 * @module features/notifications/types
 */

/**
 * Notification type enum
 */
export const NotificationType = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_DUE: 'task_due',
  TASK_MENTION: 'task_mention',
  PROJECT_INVITE: 'project_invite',
  PROJECT_UPDATE: 'project_update',
  SYSTEM: 'system',
};

/**
 * Notification priority enum
 */
export const NotificationPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

/**
 * Notification type definition
 * @typedef {Object} Notification
 * @property {number|string} id - Notification ID
 * @property {NotificationType} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {string} link - Related link
 * @property {Object} data - Additional data
 * @property {boolean} read - Read status
 * @property {string} readAt - Read timestamp
 * @property {string} createdAt - Creation timestamp
 */

/**
 * Notification filter type
 * @typedef {Object} NotificationFilter
 * @property {NotificationType[]} types - Filter by types
 * @property {boolean} unreadOnly - Show only unread
 */

/**
 * Create default notification filter
 * @returns {NotificationFilter}
 */
export const createDefaultNotificationFilter = () => ({
  types: [],
  unreadOnly: false,
});

export default {
  NotificationType,
  NotificationPriority,
  createDefaultNotificationFilter,
};
