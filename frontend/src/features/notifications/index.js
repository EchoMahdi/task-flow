/**
 * Notifications Feature Index
 * 
 * Main entry point for the notifications feature.
 * 
 * @module features/notifications
 */

// Types
export {
  NotificationType,
  NotificationPriority,
  createDefaultNotificationFilter,
} from './types/index.js';

// Services
export { notificationService, endpoints as notificationEndpoints } from './services/notificationService.js';
